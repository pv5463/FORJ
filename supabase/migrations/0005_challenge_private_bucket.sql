-- =============================================================
-- MIGRATION 0005: Challenge-Private Storage Bucket
-- Creates a PRIVATE bucket for hidden tests and reference solutions.
-- These never land in a public-readable location.
-- Only service-role (worker) can read/write this bucket.
-- =============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'challenge-private',
  'challenge-private',
  FALSE,          -- NEVER public
  104857600,      -- 100 MB limit
  ARRAY[
    'application/zip',
    'application/x-tar',
    'application/gzip',
    'text/plain',
    'text/x-python',
    'application/json',
    'text/markdown',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- NO client-side access policies — the service role bypasses RLS.
-- Any future policy additions must require is_admin() at minimum.
-- Workers use the service role key (never exposed to clients).

-- Deny all authenticated/anon access explicitly for defence in depth:
CREATE POLICY "challenge_private_deny_all"
  ON storage.objects FOR ALL
  USING (bucket_id != 'challenge-private' OR is_admin());
