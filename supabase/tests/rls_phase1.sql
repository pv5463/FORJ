-- =============================================================
-- RLS TESTS (Phase 1) — SQL-based test script
-- Run with: psql $DATABASE_URL -f supabase/tests/rls_phase1.sql
-- Uses pgTAP for structured test output.
-- =============================================================

-- Install pgTAP
CREATE EXTENSION IF NOT EXISTS pgtap;

BEGIN;
SELECT plan(24);

-- ─── Helper: switch session to a user ─────────────────────────
-- We use SET LOCAL ROLE and SET LOCAL request.jwt.claim.sub
-- to simulate RLS policies during tests.

-- Seeds used in these tests match supabase/seed.sql UUIDs.

-- Test IDs
\set admin_id      '''aaaaaaaa-0000-0000-0000-000000000001'''
\set employer1_id  '''aaaaaaaa-0000-0000-0000-000000000002'''
\set employer2_id  '''aaaaaaaa-0000-0000-0000-000000000003'''
\set mentor1_id    '''aaaaaaaa-0000-0000-0000-000000000004'''
\set candidate1_id '''aaaaaaaa-0000-0000-0000-000000000005'''
\set candidate2_id '''aaaaaaaa-0000-0000-0000-000000000006'''
\set org1_id       '''bbbbbbbb-0000-0000-0000-000000000001'''
\set org2_id       '''bbbbbbbb-0000-0000-0000-000000000002'''

-- ─── 1. Anonymous user can read profiles ──────────────────────
SET LOCAL ROLE anon;
SELECT ok(
  (SELECT COUNT(*) FROM profiles) > 0,
  'anon can read profiles (public select)'
);

-- ─── 2. Anonymous user CANNOT insert a profile ────────────────
SELECT throws_ok(
  $$ INSERT INTO profiles (id, full_name, role) VALUES (gen_random_uuid(), 'Hacker', 'candidate') $$,
  '42501',
  NULL,
  'anon cannot insert profiles (RLS blocks it)'
);

-- ─── 3. Authenticated user can read all profiles ──────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT ok(
  (SELECT COUNT(*) FROM profiles) >= 6,
  'authenticated user can see all profiles'
);

-- ─── 4. Candidate1 CANNOT update Candidate2's profile ─────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT results_eq(
  $$ UPDATE profiles SET headline = 'HACKED' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000006'::uuid RETURNING id $$,
  ARRAY[]::UUID[],
  'candidate1 cannot update candidate2 profile (RLS blocks it)'
);

-- ─── 5. Candidate1 CAN update their own profile ───────────────
SELECT ok(
  (UPDATE profiles SET headline = 'Updated headline' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000005'::uuid RETURNING id) IS NOT NULL,
  'candidate1 can update own profile'
);

-- ─── 6. Admin CAN update any profile ──────────────────────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT ok(
  (UPDATE profiles SET headline = 'Admin updated' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000006'::uuid RETURNING id) IS NOT NULL,
  'admin can update any profile'
);

-- ─── 7. Candidate cannot self-assign admin role ───────────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT results_eq(
  $$ UPDATE profiles SET role = 'admin' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000005'::uuid RETURNING role::text $$,
  ARRAY[]::TEXT[],
  'candidate cannot self-assign admin role (RLS blocks it)'
);

-- ─── 8. Anyone can read organizations ────────────────────────
SET LOCAL ROLE anon;
SELECT ok(
  (SELECT COUNT(*) FROM organizations) >= 2,
  'anon can read organizations'
);

-- ─── 9. Employer1 can create an org ──────────────────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT ok(
  (INSERT INTO organizations (owner_id, name, type) VALUES ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'Test Org RLS', 'startup') RETURNING id) IS NOT NULL,
  'employer1 can insert organization with themselves as owner'
);

-- ─── 10. Employer1 CANNOT create an org with another owner ───
SELECT throws_ok(
  $$ INSERT INTO organizations (owner_id, name, type) VALUES ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, 'Stolen Org', 'startup') $$,
  '42501',
  NULL,
  'employer1 cannot create org owned by someone else'
);

-- ─── 11. Employer1 CAN update their own org ──────────────────
SELECT ok(
  (UPDATE organizations SET description = 'updated' WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001'::uuid RETURNING id) IS NOT NULL,
  'employer1 (owner) can update own org'
);

-- ─── 12. Employer2 CANNOT update Employer1''s org ─────────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000003","role":"authenticated"}';
SELECT results_eq(
  $$ UPDATE organizations SET name = 'HACKED' WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001'::uuid RETURNING id $$,
  ARRAY[]::UUID[],
  'employer2 cannot update employer1 org'
);

-- ─── 13. org_members: member can see own membership ──────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT ok(
  (SELECT COUNT(*) FROM organization_members WHERE profile_id = 'aaaaaaaa-0000-0000-0000-000000000002'::uuid) >= 1,
  'org member can see own memberships'
);

-- ─── 14. candidate1 CANNOT see org_members (not a member) ────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT results_eq(
  $$ SELECT COUNT(*) FROM organization_members WHERE organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[0::BIGINT],
  'candidate1 cannot see org memberships they are not part of'
);

-- ─── 15. Skills are readable by anon ─────────────────────────
SET LOCAL ROLE anon;
SELECT ok(
  (SELECT COUNT(*) FROM skills) >= 80,
  'anon can read skills (at least 80 seeded)'
);

-- ─── 16. Anon CANNOT insert a skill ──────────────────────────
SELECT throws_ok(
  $$ INSERT INTO skills (name, category) VALUES ('HackedSkill', 'general') $$,
  '42501',
  NULL,
  'anon cannot insert skills'
);

-- ─── 17. Authenticated user CAN suggest a skill ──────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT ok(
  (INSERT INTO skills (name, category, is_verified) VALUES ('TestSkillRLS', 'general', FALSE) RETURNING id) IS NOT NULL,
  'authenticated user can suggest a new skill'
);

-- ─── 18. profile_skills: candidate1 can read own skills ───────
SELECT ok(
  (SELECT COUNT(*) FROM profile_skills WHERE profile_id = 'aaaaaaaa-0000-0000-0000-000000000005'::uuid) >= 5,
  'candidate1 can read own skills'
);

-- ─── 19. candidate1 can read candidate2''s skills (public) ────
SELECT ok(
  (SELECT COUNT(*) FROM profile_skills WHERE profile_id = 'aaaaaaaa-0000-0000-0000-000000000006'::uuid) >= 4,
  'profile_skills are publicly readable (by design for matching)'
);

-- ─── 20. candidate1 CANNOT insert skill for candidate2 ────────
SELECT throws_ok(
  $$ INSERT INTO profile_skills (profile_id, skill_id, level, source) VALUES ('aaaaaaaa-0000-0000-0000-000000000006'::uuid, '11111111-0001-0001-0001-000000000001'::uuid, 5, 'self') $$,
  '42501',
  NULL,
  'candidate1 cannot insert skills for candidate2'
);

-- ─── 21. is_admin() returns FALSE for candidate ───────────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT is(
  is_admin(),
  FALSE,
  'is_admin() returns false for candidate'
);

-- ─── 22. is_admin() returns TRUE for admin ────────────────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT is(
  is_admin(),
  TRUE,
  'is_admin() returns true for admin'
);

-- ─── 23. is_org_member() returns TRUE for org owner ──────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT is(
  is_org_member('bbbbbbbb-0000-0000-0000-000000000001'::uuid),
  TRUE,
  'is_org_member() returns true for org owner'
);

-- ─── 24. is_org_owner() returns FALSE for non-owner ──────────
SET LOCAL "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000005","role":"authenticated"}';
SELECT is(
  is_org_owner('bbbbbbbb-0000-0000-0000-000000000001'::uuid),
  FALSE,
  'is_org_owner() returns false for non-owner candidate'
);

SELECT * FROM finish();
ROLLBACK;
