-- =============================================================
-- MIGRATION 0003: Jobs Queue
-- A Postgres-native job queue. The forj-worker claims jobs with
-- SELECT ... FOR UPDATE SKIP LOCKED inside SECURITY DEFINER
-- functions callable only by the service role. No Redis in v1.
-- =============================================================

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE job_type   AS ENUM ('github_analysis', 'assessment_run', 'noop');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'done', 'failed');

-- ─── JOBS TABLE ───────────────────────────────────────────────
CREATE TABLE jobs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        job_type    NOT NULL,
  payload     JSONB       NOT NULL DEFAULT '{}',
  status      job_status  NOT NULL DEFAULT 'queued',
  attempts    SMALLINT    NOT NULL DEFAULT 0,
  max_attempts SMALLINT   NOT NULL DEFAULT 3,
  locked_by   TEXT,                        -- worker instance id
  locked_at   TIMESTAMPTZ,
  run_after   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status_run_after ON jobs(status, run_after)
  WHERE status IN ('queued', 'running');
CREATE INDEX idx_jobs_type ON jobs(type);

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: only service role can access directly (policies deny all anon/auth)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- No rows accessible to regular authenticated users
CREATE POLICY "jobs_deny_all_authenticated"
  ON jobs FOR ALL
  USING (FALSE);

-- ─── QUEUE FUNCTIONS (SECURITY DEFINER = service-role-only) ──

-- claim_job: atomically claim the oldest eligible queued job
-- Returns one row or zero rows. Called by the worker.
CREATE OR REPLACE FUNCTION claim_job(
  p_worker_id TEXT,
  p_types     job_type[]
)
RETURNS SETOF jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed jobs;
BEGIN
  SELECT * INTO claimed
  FROM jobs
  WHERE status = 'queued'
    AND type = ANY(p_types)
    AND run_after <= NOW()
    AND attempts < max_attempts
  ORDER BY run_after ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE jobs
  SET
    status     = 'running',
    locked_by  = p_worker_id,
    locked_at  = NOW(),
    attempts   = attempts + 1,
    updated_at = NOW()
  WHERE id = claimed.id
  RETURNING * INTO claimed;

  RETURN NEXT claimed;
END;
$$;

-- complete_job: mark a running job as done
CREATE OR REPLACE FUNCTION complete_job(p_job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE jobs
  SET status = 'done', updated_at = NOW(), locked_by = NULL, locked_at = NULL
  WHERE id = p_job_id AND status = 'running';
END;
$$;

-- fail_job: mark failed; if attempts < max_attempts, re-queue with exponential backoff
-- Backoff: 2^attempts * 30 seconds (30s, 60s, 120s, ...)
CREATE OR REPLACE FUNCTION fail_job(p_job_id UUID, p_error TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  j jobs;
BEGIN
  SELECT * INTO j FROM jobs WHERE id = p_job_id;

  IF j.attempts >= j.max_attempts THEN
    UPDATE jobs
    SET status = 'failed', last_error = p_error, updated_at = NOW(),
        locked_by = NULL, locked_at = NULL
    WHERE id = p_job_id;
  ELSE
    -- Re-queue with backoff
    UPDATE jobs
    SET
      status     = 'queued',
      run_after  = NOW() + (POWER(2, j.attempts) * INTERVAL '30 seconds'),
      last_error = p_error,
      locked_by  = NULL,
      locked_at  = NULL,
      updated_at = NOW()
    WHERE id = p_job_id;
  END IF;
END;
$$;

-- enqueue_job: insert a new job (callable by Edge Functions via service role)
CREATE OR REPLACE FUNCTION enqueue_job(
  p_type    job_type,
  p_payload JSONB,
  p_run_after TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO jobs (type, payload, run_after)
  VALUES (p_type, p_payload, p_run_after)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- recover_stale_jobs: requeue jobs stuck in 'running' > 10 minutes
-- Called by the worker health loop
CREATE OR REPLACE FUNCTION recover_stale_jobs(p_stale_minutes INT DEFAULT 10)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recovered INT;
BEGIN
  WITH updated AS (
    UPDATE jobs
    SET
      status     = 'queued',
      locked_by  = NULL,
      locked_at  = NULL,
      run_after  = NOW(),
      last_error = 'Recovered: was stuck in running state',
      updated_at = NOW()
    WHERE
      status = 'running'
      AND locked_at < NOW() - (p_stale_minutes * INTERVAL '1 minute')
      AND attempts < max_attempts
    RETURNING id
  )
  SELECT COUNT(*) INTO recovered FROM updated;
  RETURN recovered;
END;
$$;
