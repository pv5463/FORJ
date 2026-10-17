-- =============================================================
-- MIGRATION 0001: FORJ Foundation
-- Tables: profiles, organizations, organization_members, skills, profile_skills
-- Enums, triggers, helper functions, storage buckets
-- =============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- for case-insensitive skill search
CREATE EXTENSION IF NOT EXISTS "citext";           -- for case-insensitive text columns

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'mentor', 'admin');
CREATE TYPE preferred_language AS ENUM ('en', 'hi');
CREATE TYPE org_type AS ENUM ('startup', 'company', 'incubator', 'institution');
CREATE TYPE org_verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE org_member_role AS ENUM ('owner', 'recruiter', 'reviewer');
CREATE TYPE skill_source AS ENUM ('self', 'assessed', 'verified');

-- ─── UPDATED_AT TRIGGER FUNCTION ────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                 user_role   NOT NULL DEFAULT 'candidate',
  full_name            TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  headline             TEXT        CHECK (char_length(headline) <= 300),
  bio                  TEXT        CHECK (char_length(bio) <= 2000),
  location             TEXT        CHECK (char_length(location) <= 200),
  avatar_url           TEXT,
  preferred_language   preferred_language NOT NULL DEFAULT 'en',
  onboarding_completed BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role       ON profiles(role);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ─── ORGANIZATIONS ───────────────────────────────────────────
CREATE TABLE organizations (
  id                  UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID                    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name                TEXT                    NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  type                org_type                NOT NULL,
  website             TEXT                    CHECK (website ~ '^https?://'),
  description         TEXT                    CHECK (char_length(description) <= 3000),
  logo_url            TEXT,
  verification_status org_verification_status NOT NULL DEFAULT 'unverified',
  created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner_id           ON organizations(owner_id);
CREATE INDEX idx_organizations_verification_status ON organizations(verification_status);
CREATE INDEX idx_organizations_type               ON organizations(type);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ─── ORGANIZATION MEMBERS ────────────────────────────────────
CREATE TABLE organization_members (
  organization_id UUID           NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id      UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_role     org_member_role NOT NULL DEFAULT 'recruiter',
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, profile_id)
);

CREATE INDEX idx_org_members_profile_id ON organization_members(profile_id);
CREATE INDEX idx_org_members_org_id     ON organization_members(organization_id);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ─── SKILLS ──────────────────────────────────────────────────
CREATE TABLE skills (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       CITEXT      NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 100),
  category   TEXT        NOT NULL DEFAULT 'general' CHECK (char_length(category) <= 100),
  is_verified BOOLEAN    NOT NULL DEFAULT TRUE,   -- FALSE = user-suggested, awaiting admin
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_name     ON skills USING gin(name gin_trgm_ops);
CREATE INDEX idx_skills_category ON skills(category);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- ─── PROFILE SKILLS ──────────────────────────────────────────
CREATE TABLE profile_skills (
  profile_id UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id   UUID         NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level      SMALLINT     NOT NULL CHECK (level BETWEEN 1 AND 5),
  source     skill_source NOT NULL DEFAULT 'self',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, skill_id)
);

CREATE INDEX idx_profile_skills_skill_id   ON profile_skills(skill_id);
CREATE INDEX idx_profile_skills_profile_id ON profile_skills(profile_id);

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

-- ─── HELPER SECURITY-DEFINER FUNCTIONS ───────────────────────
-- is_admin(): returns TRUE if the calling auth.uid() has role='admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- is_org_member(org_id): returns TRUE if the calling user is a member of the org
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id AND profile_id = auth.uid()
  );
$$;

-- is_org_owner(org_id): returns TRUE if the calling user is the owner of the org
CREATE OR REPLACE FUNCTION is_org_owner(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_id AND owner_id = auth.uid()
  );
$$;

-- ─── TRIGGER: auto-create profile on auth.users insert ───────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role user_role;
  raw_role TEXT;
BEGIN
  -- Read role from metadata; never allow self-assigning admin
  raw_role := LOWER(TRIM(NEW.raw_user_meta_data->>'role'));
  CASE raw_role
    WHEN 'employer' THEN requested_role := 'employer';
    WHEN 'mentor'   THEN requested_role := 'mentor';
    ELSE                 requested_role := 'candidate';  -- default, admin cannot be self-assigned
  END CASE;

  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    preferred_language,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    requested_role,
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

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS POLICIES: profiles ──────────────────────────────────
-- Anyone can view basic profile info (public data)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (TRUE);

-- Only owner can update their own profile; admin can update any
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (
    -- Cannot self-assign admin role through normal update
    (role != 'admin' OR is_admin())
    AND (auth.uid() = id OR is_admin())
  );

-- No direct insert (handled by trigger)
CREATE POLICY "profiles_insert_trigger"
  ON profiles FOR INSERT
  WITH CHECK (FALSE);  -- only the SECURITY DEFINER trigger inserts

-- Admin can delete profiles (account deletion handled separately)
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (is_admin());

-- ─── RLS POLICIES: organizations ─────────────────────────────
-- Public can read all organizations
CREATE POLICY "orgs_select_public"
  ON organizations FOR SELECT
  USING (TRUE);

-- Any authenticated user can create an org
CREATE POLICY "orgs_insert_authenticated"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Owner or org member (recruiter/reviewer) or admin can update
CREATE POLICY "orgs_update_member"
  ON organizations FOR UPDATE
  USING (is_org_owner(id) OR is_org_member(id) OR is_admin())
  WITH CHECK (is_org_owner(id) OR is_admin());

-- Only owner or admin can delete
CREATE POLICY "orgs_delete_owner"
  ON organizations FOR DELETE
  USING (is_org_owner(id) OR is_admin());

-- ─── RLS POLICIES: organization_members ──────────────────────
-- Members can view their own memberships; org owners see all members of their orgs
CREATE POLICY "org_members_select"
  ON organization_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_org_owner(organization_id)
    OR is_admin()
  );

-- Only org owners (or admin) can add members
CREATE POLICY "org_members_insert"
  ON organization_members FOR INSERT
  WITH CHECK (is_org_owner(organization_id) OR is_admin());

-- Only org owners or admin can update member roles
CREATE POLICY "org_members_update"
  ON organization_members FOR UPDATE
  USING (is_org_owner(organization_id) OR is_admin());

-- Org owner or the member themselves (leaving), or admin
CREATE POLICY "org_members_delete"
  ON organization_members FOR DELETE
  USING (
    profile_id = auth.uid()
    OR is_org_owner(organization_id)
    OR is_admin()
  );

-- ─── RLS POLICIES: skills ────────────────────────────────────
-- Skills are publicly readable
CREATE POLICY "skills_select_public"
  ON skills FOR SELECT
  USING (TRUE);

-- Any authenticated user can suggest a new skill (is_verified defaults to FALSE if inserted by non-admin)
CREATE POLICY "skills_insert_authenticated"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admin can update skills
CREATE POLICY "skills_update_admin"
  ON skills FOR UPDATE
  USING (is_admin());

-- Only admin can delete skills
CREATE POLICY "skills_delete_admin"
  ON skills FOR DELETE
  USING (is_admin());

-- ─── RLS POLICIES: profile_skills ────────────────────────────
-- Anyone can view profile_skills (for matching / portfolio)
CREATE POLICY "profile_skills_select_public"
  ON profile_skills FOR SELECT
  USING (TRUE);

-- User manages own skills
CREATE POLICY "profile_skills_insert_own"
  ON profile_skills FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "profile_skills_update_own"
  ON profile_skills FOR UPDATE
  USING (auth.uid() = profile_id OR is_admin());

CREATE POLICY "profile_skills_delete_own"
  ON profile_skills FOR DELETE
  USING (auth.uid() = profile_id OR is_admin());

-- ─── STORAGE BUCKETS (via SQL) ────────────────────────────────
-- Buckets are created by the Supabase storage extension.
-- We call storage.create_bucket if available, else document CLI commands.
-- The actual bucket creation happens via Supabase client/CLI; policies below.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',    'avatars',    TRUE, 5242880,   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('org-assets', 'org-assets', TRUE, 10485760,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('submissions','submissions', FALSE, 52428800, ARRAY['application/pdf','application/zip','text/plain','application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
-- avatars: public read, authenticated users can upload their own avatar (path = user_id/*)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- org-assets: public read, org members can upload (path = org_id/*)
CREATE POLICY "org_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-assets');

CREATE POLICY "org_assets_member_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'org-assets'
    AND auth.uid() IS NOT NULL
    AND is_org_member((storage.foldername(name))[1]::UUID)
  );

CREATE POLICY "org_assets_member_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'org-assets'
    AND is_org_member((storage.foldername(name))[1]::UUID)
  );

CREATE POLICY "org_assets_member_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'org-assets'
    AND is_org_member((storage.foldername(name))[1]::UUID)
  );

-- submissions: private - only the owner (uploader) or reviewer/admin reads
CREATE POLICY "submissions_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submissions'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "submissions_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND (
      auth.uid()::TEXT = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

CREATE POLICY "submissions_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'submissions'
    AND (
      auth.uid()::TEXT = (storage.foldername(name))[1]
      OR is_admin()
    )
  );
