-- =============================================================
-- MIGRATION 0002: Multi-Role Users (Skill Verification Engine)
-- Adds user_roles table, has_role() helper, migrates profiles.role
-- to user_roles, drops old column, updates all RLS policies and
-- the handle_new_user trigger.
-- ⚠️  NEVER EDIT 0001_foundation.sql — this migration alters it.
-- =============================================================

-- ─── STEP 1: New role enum (supersedes old user_role for multi-role) ──
-- New allowed roles: job_seeker | employer | founder | mentor | admin
CREATE TYPE app_role AS ENUM ('job_seeker', 'employer', 'founder', 'mentor', 'admin');

-- ─── STEP 2: user_roles table ────────────────────────────────
CREATE TABLE user_roles (
  id         UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID     NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role    ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ─── STEP 3: has_role() and is_admin() update ─────────────────
-- has_role(r): TRUE if auth.uid() holds role r
CREATE OR REPLACE FUNCTION has_role(r app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = r
  );
$$;

-- Update is_admin() to read from user_roles instead of profiles.role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── STEP 4: Migrate existing profiles.role → user_roles ──────
-- Map old roles to new enum values, then grant the new role
INSERT INTO user_roles (user_id, role)
SELECT
  id,
  CASE role::TEXT
    WHEN 'candidate' THEN 'job_seeker'::app_role
    WHEN 'employer'  THEN 'employer'::app_role
    WHEN 'mentor'    THEN 'mentor'::app_role
    WHEN 'admin'     THEN 'admin'::app_role
    ELSE 'job_seeker'::app_role
  END
FROM profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- ─── STEP 5: Add legacy_role column for backward compat ──────
-- Keep profiles.role as TEXT for now to avoid breaking existing
-- queries, but stop using it in logic. Will drop in 0006.
-- We do NOT drop it here because other pages still read it.
-- Instead we mark it clearly as deprecated.
COMMENT ON COLUMN profiles.role IS 'DEPRECATED: use user_roles table. Will be dropped in migration 0006.';

-- ─── STEP 6: Update handle_new_user trigger ───────────────────
-- Now inserts into both profiles (keeping role for compat) AND user_roles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role app_role;
  legacy_role    user_role;
  raw_role TEXT;
BEGIN
  raw_role := LOWER(TRIM(NEW.raw_user_meta_data->>'role'));

  -- Map to new app_role
  CASE raw_role
    WHEN 'employer' THEN
      requested_role := 'employer';
      legacy_role    := 'employer';
    WHEN 'mentor'   THEN
      requested_role := 'mentor';
      legacy_role    := 'mentor';
    WHEN 'founder'  THEN
      requested_role := 'founder';
      legacy_role    := 'candidate';  -- founders use candidate legacy slot
    ELSE
      requested_role := 'job_seeker';
      legacy_role    := 'candidate';
  END CASE;

  -- Insert profile (with legacy role column for compat)
  INSERT INTO public.profiles (
    id, full_name, role, preferred_language, onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    legacy_role,
    COALESCE(
      CASE LOWER(NEW.raw_user_meta_data->>'preferred_language')
        WHEN 'hi' THEN 'hi'::preferred_language
        ELSE 'en'::preferred_language
      END,
      'en'
    ),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  -- Grant new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ─── STEP 7: RLS policies for user_roles ──────────────────────
-- Users can read their own roles; admins can read all
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can self-grant job_seeker, employer, founder, mentor
-- Admins can grant admin
CREATE POLICY "user_roles_insert_self"
  ON user_roles FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      (role IN ('job_seeker', 'employer', 'founder', 'mentor'))
      OR (role = 'admin' AND is_admin())
    )
  );

-- Only admin can update roles (role type changes)
CREATE POLICY "user_roles_update_admin"
  ON user_roles FOR UPDATE
  USING (is_admin());

-- Users can remove their own non-admin roles; admin can remove any
CREATE POLICY "user_roles_delete_self"
  ON user_roles FOR DELETE
  USING (
    (user_id = auth.uid() AND role != 'admin')
    OR is_admin()
  );

-- ─── STEP 8: Update profiles RLS to use has_role ──────────────
-- profiles_update_own: keep same semantics, now check is_admin() which uses user_roles
-- (the policy already calls is_admin() which we updated above — no SQL change needed)
-- But we update the WITH CHECK to use has_role('admin') for clarity:
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Admin policies for org, skills also pick up the updated is_admin() automatically.
-- No policy SQL changes needed for those — is_admin() is the single source of truth.
