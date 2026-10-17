-- =============================================================
-- MIGRATION 0006: GitHub Analysis & Skill Evidence (Phase 2A)
-- =============================================================

-- 1. GitHub Connections
CREATE TABLE IF NOT EXISTS public.github_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username text NOT NULL,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'rate_limited')),
  token_encrypted text, -- nullable, for later private-repo access (unused in v1)
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_analyzed_at timestamptz
);

-- 2. Repositories
CREATE TABLE IF NOT EXISTS public.repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repo_id bigint NOT NULL,
  full_name text NOT NULL,
  description text,
  primary_language text,
  languages jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_fork boolean NOT NULL DEFAULT false,
  stars integer NOT NULL DEFAULT 0,
  pushed_at timestamptz,
  selected boolean NOT NULL DEFAULT true,
  last_analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repositories_user_repo_unique UNIQUE (user_id, github_repo_id)
);

-- 3. GitHub Analyses
CREATE TABLE IF NOT EXISTS public.github_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  error text,
  repos_considered integer NOT NULL DEFAULT 0,
  role_profile_id uuid REFERENCES public.role_profiles(id) ON DELETE SET NULL,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. User Skill Evidence
CREATE TABLE IF NOT EXISTS public.user_skill_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  repository_id uuid REFERENCES public.repositories(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.github_analyses(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN ('language_use', 'framework', 'tests', 'documentation', 'structure')),
  detail text NOT NULL,
  evidence_url text,
  observed_by text NOT NULL CHECK (observed_by IN ('rule', 'ai_interpretation')),
  confidence numeric(3,2) NOT NULL DEFAULT 1.00 CHECK (confidence >= 0.00 AND confidence <= 1.00),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Skill Readiness Reports
CREATE TABLE IF NOT EXISTS public.skill_readiness_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_profile_id uuid NOT NULL REFERENCES public.role_profiles(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.github_analyses(id) ON DELETE CASCADE,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall_score numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repositories_user ON public.repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_github_analyses_user ON public.github_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_skill_evidence_user ON public.user_skill_evidence(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_evidence_analysis ON public.user_skill_evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_skill_readiness_reports_user ON public.skill_readiness_reports(user_id, role_profile_id);

-- ─── RLS POLICIES ──────────────────────────────────────────────
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_readiness_reports ENABLE ROW LEVEL SECURITY;

-- github_connections
CREATE POLICY "github_connections_select" ON public.github_connections
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_connections_insert" ON public.github_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_connections_update" ON public.github_connections
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_connections_delete" ON public.github_connections
  FOR DELETE USING (auth.uid() = user_id OR public.has_role('admin'));

-- repositories
CREATE POLICY "repositories_select" ON public.repositories
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "repositories_insert" ON public.repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "repositories_update" ON public.repositories
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "repositories_delete" ON public.repositories
  FOR DELETE USING (auth.uid() = user_id OR public.has_role('admin'));

-- github_analyses
CREATE POLICY "github_analyses_select" ON public.github_analyses
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_analyses_insert" ON public.github_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_analyses_update" ON public.github_analyses
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "github_analyses_delete" ON public.github_analyses
  FOR DELETE USING (auth.uid() = user_id OR public.has_role('admin'));

-- user_skill_evidence
CREATE POLICY "user_skill_evidence_select" ON public.user_skill_evidence
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "user_skill_evidence_insert" ON public.user_skill_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "user_skill_evidence_update" ON public.user_skill_evidence
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "user_skill_evidence_delete" ON public.user_skill_evidence
  FOR DELETE USING (auth.uid() = user_id OR public.has_role('admin'));

-- skill_readiness_reports
CREATE POLICY "skill_readiness_reports_select" ON public.skill_readiness_reports
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "skill_readiness_reports_insert" ON public.skill_readiness_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "skill_readiness_reports_update" ON public.skill_readiness_reports
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "skill_readiness_reports_delete" ON public.skill_readiness_reports
  FOR DELETE USING (auth.uid() = user_id OR public.has_role('admin'));

-- ─── RATE LIMIT & ENQUEUE FUNCTION ────────────────────────────
-- Enforces max 5 analyses per user per 24 hours.
-- Callable by authenticated user for themselves or by service role.
CREATE OR REPLACE FUNCTION public.request_github_analysis(
  p_github_username text,
  p_role_profile_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_count_24h integer;
  v_analysis_id uuid;
  v_job_id uuid;
  v_clean_username text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_clean_username := lower(trim(p_github_username));
  IF v_clean_username = '' OR v_clean_username !~ '^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$' THEN
    RAISE EXCEPTION 'Invalid GitHub username format';
  END IF;

  -- 24-hour rate limit check (max 5 analyses per user per day)
  SELECT count(*) INTO v_count_24h
  FROM public.github_analyses
  WHERE user_id = v_user_id
    AND created_at > (now() - interval '24 hours');

  IF v_count_24h >= 5 AND NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Rate limit reached: Maximum 5 analyses per 24 hours.';
  END IF;

  -- Upsert connection
  INSERT INTO public.github_connections (user_id, github_username, status, connected_at)
  VALUES (v_user_id, v_clean_username, 'connected', now())
  ON CONFLICT (user_id) DO UPDATE
  SET github_username = EXCLUDED.github_username,
      status = 'connected';

  -- Create analysis record
  INSERT INTO public.github_analyses (user_id, status, role_profile_id)
  VALUES (v_user_id, 'queued', p_role_profile_id)
  RETURNING id INTO v_analysis_id;

  -- Enqueue worker job
  INSERT INTO public.jobs (type, payload, status)
  VALUES (
    'github_analysis',
    jsonb_build_object(
      'analysis_id', v_analysis_id,
      'user_id', v_user_id,
      'github_username', v_clean_username,
      'role_profile_id', p_role_profile_id
    ),
    'queued'
  )
  RETURNING id INTO v_job_id;

  RETURN jsonb_build_object(
    'success', true,
    'analysis_id', v_analysis_id,
    'job_id', v_job_id,
    'status', 'queued'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_github_analysis(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_github_analysis(text, uuid) TO service_role;

-- ─── Realtime Publication ─────────────────────────────────────
-- Allow Realtime subscriptions on github_analyses
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.github_analyses;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
