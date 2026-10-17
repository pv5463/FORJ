-- =============================================================
-- MIGRATION 0007: Skill Verification & Passport Engine (Phase 2B)
-- =============================================================

-- ─── 1. CHALLENGE TEMPLATES ──────────────────────────────────
-- Enforce rubric sums to 100 points
CREATE OR REPLACE FUNCTION public.check_rubric_sum(p_rubric jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_item jsonb;
  v_total numeric := 0;
BEGIN
  IF p_rubric IS NULL OR jsonb_typeof(p_rubric) != 'array' THEN
    RETURN false;
  END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_rubric)
  LOOP
    v_total := v_total + COALESCE((v_item->>'points')::numeric, 0);
  END LOOP;
  RETURN v_total = 100;
END;
$$;

CREATE TABLE IF NOT EXISTS public.challenge_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  role_profile_id uuid REFERENCES public.role_profiles(id) ON DELETE SET NULL,
  primary_skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  brief_md text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  runtime text NOT NULL CHECK (runtime IN ('python', 'node', 'sql')),
  rubric jsonb NOT NULL,
  variant_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  time_limit_minutes integer NOT NULL DEFAULT 120,
  ai_assistance_allowed boolean NOT NULL DEFAULT true,
  pass_threshold integer NOT NULL DEFAULT 70 CHECK (pass_threshold BETWEEN 1 AND 100),
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_rubric_total_100 CHECK (public.check_rubric_sum(rubric))
);

-- ─── 2. ASSIGNED CHALLENGES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assigned_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.challenge_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_seed text NOT NULL,
  variant_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'assessed', 'expired')),
  deadline timestamptz NOT NULL,
  started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 3. VERIFICATION SUBMISSIONS ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_challenge_id uuid NOT NULL REFERENCES public.assigned_challenges(id) ON DELETE CASCADE,
  attempt_no integer NOT NULL DEFAULT 1,
  repo_url text,
  commit_sha text, -- pinned at submit time
  upload_path text,
  explanation_text text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'evaluating', 'assessed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT max_attempts_check CHECK (attempt_no <= 3)
);

-- ─── 4. ASSESSMENT RUNS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'passed', 'failed', 'error')),
  tests_total integer NOT NULL DEFAULT 0,
  tests_passed integer NOT NULL DEFAULT 0,
  test_report jsonb NOT NULL DEFAULT '[]'::jsonb, -- names and pass/fail only, never hidden test contents
  static_analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  exit_reason text NOT NULL DEFAULT 'ok' CHECK (exit_reason IN ('ok', 'timeout', 'oom', 'error')),
  runtime_ms integer NOT NULL DEFAULT 0,
  sandbox_image_digest text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 5. ASSESSMENT SCORES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_run_id uuid NOT NULL REFERENCES public.assessment_runs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  criterion text NOT NULL,
  points_awarded numeric(5,2) NOT NULL DEFAULT 0,
  points_max numeric(5,2) NOT NULL,
  method text NOT NULL CHECK (method IN ('automated', 'ai_assisted', 'manual')),
  feedback text,
  ai_generated boolean NOT NULL DEFAULT false,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 6. INTEGRITY SIGNALS ─────────────────────────────────────
-- Visible to reviewers and admins ONLY. NEVER auto-rejects candidates.
CREATE TABLE IF NOT EXISTS public.integrity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warn')),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 7. SKILL PASSPORTS & PASSPORT SKILLS ─────────────────────
CREATE TABLE IF NOT EXISTS public.skill_passports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passport_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id uuid NOT NULL REFERENCES public.skill_passports(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  score numeric(5,2),
  verification_status text NOT NULL DEFAULT 'not_assessed' CHECK (
    verification_status IN ('not_assessed', 'repository_evidence', 'challenge_verified', 'employer_reviewed')
  ),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  assessment_run_id uuid REFERENCES public.assessment_runs(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(passport_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.passport_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_skill_id uuid NOT NULL REFERENCES public.passport_skills(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN ('repository', 'assessment', 'review')),
  ref_id uuid,
  summary text NOT NULL,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passport_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id uuid NOT NULL REFERENCES public.skill_passports(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL, -- SHA-256 of 32-byte cryptographically secure random token
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passport_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES public.passport_share_links(id) ON DELETE SET NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 8. CREDENTIAL CHECKS ─────────────────────────────────────
-- Table and RLS exist; UI shows nothing unless status = completed
CREATE TABLE IF NOT EXISTS public.credential_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type text NOT NULL CHECK (check_type IN ('identity', 'experience', 'employment_eligibility')),
  status text NOT NULL DEFAULT 'not_checked' CHECK (status IN ('not_checked', 'pending', 'completed', 'failed')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_type)
);

-- Add share_passport column to applications if applications table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'share_passport') THEN
      ALTER TABLE public.applications ADD COLUMN share_passport boolean NOT NULL DEFAULT true;
    END IF;
  END IF;
END $$;

-- ─── 9. RLS POLICIES ──────────────────────────────────────────
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_checks ENABLE ROW LEVEL SECURITY;

-- challenge_templates: Anyone can view active templates (brief and rubric only)
CREATE POLICY "challenge_templates_select" ON public.challenge_templates
  FOR SELECT USING (is_active = true OR public.has_role('admin'));

CREATE POLICY "challenge_templates_admin" ON public.challenge_templates
  FOR ALL USING (public.has_role('admin'));

-- assigned_challenges: User sees their own assigned challenges
CREATE POLICY "assigned_challenges_select" ON public.assigned_challenges
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "assigned_challenges_insert" ON public.assigned_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "assigned_challenges_update" ON public.assigned_challenges
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role('admin'));

-- verification_submissions: User sees their own submissions
CREATE POLICY "verification_submissions_select" ON public.verification_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assigned_challenges ac
      WHERE ac.id = verification_submissions.assigned_challenge_id
        AND (ac.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

CREATE POLICY "verification_submissions_insert" ON public.verification_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assigned_challenges ac
      WHERE ac.id = verification_submissions.assigned_challenge_id
        AND ac.user_id = auth.uid()
    )
  );

-- assessment_runs: User sees runs for their own submissions
CREATE POLICY "assessment_runs_select" ON public.assessment_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.verification_submissions vs
      JOIN public.assigned_challenges ac ON ac.id = vs.assigned_challenge_id
      WHERE vs.id = assessment_runs.submission_id
        AND (ac.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

-- assessment_scores: User sees scores for their own runs
CREATE POLICY "assessment_scores_select" ON public.assessment_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessment_runs ar
      JOIN public.verification_submissions vs ON vs.id = ar.submission_id
      JOIN public.assigned_challenges ac ON ac.id = vs.assigned_challenge_id
      WHERE ar.id = assessment_scores.assessment_run_id
        AND (ac.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

-- integrity_signals: Reviewers and Admins ONLY. Candidates CANNOT read signals.
CREATE POLICY "integrity_signals_admin_reviewer" ON public.integrity_signals
  FOR ALL USING (public.has_role('admin') OR public.has_role('employer') OR public.has_role('mentor'));

-- skill_passports: Candidate manages own; public can read via share links
CREATE POLICY "skill_passports_select" ON public.skill_passports
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role('admin')
  );

CREATE POLICY "skill_passports_all" ON public.skill_passports
  FOR ALL USING (auth.uid() = user_id OR public.has_role('admin'));

-- passport_skills: Same visibility as passport
CREATE POLICY "passport_skills_select" ON public.passport_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.skill_passports sp
      WHERE sp.id = passport_skills.passport_id
        AND (sp.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

CREATE POLICY "passport_skills_all" ON public.passport_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.skill_passports sp
      WHERE sp.id = passport_skills.passport_id
        AND (sp.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

-- passport_evidence: Same visibility
CREATE POLICY "passport_evidence_select" ON public.passport_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.passport_skills ps
      JOIN public.skill_passports sp ON sp.id = ps.passport_id
      WHERE ps.id = passport_evidence.passport_skill_id
        AND (sp.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

-- passport_share_links: Candidate manages their own links
CREATE POLICY "passport_share_links_user" ON public.passport_share_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.skill_passports sp
      WHERE sp.id = passport_share_links.passport_id
        AND (sp.user_id = auth.uid() OR public.has_role('admin'))
    )
  );

-- credential_checks: Candidate and admin
CREATE POLICY "credential_checks_user" ON public.credential_checks
  FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

-- Realtime Publication for assessment_runs
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_runs;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
