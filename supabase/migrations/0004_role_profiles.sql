-- =============================================================
-- MIGRATION 0004: Role Profiles & Role Profile Skills
-- Seeds 6 real role profiles with skill requirements.
-- Used by the Skill Readiness Report and opportunity matching.
-- =============================================================

-- ─── ROLE PROFILES TABLE ─────────────────────────────────────
CREATE TABLE role_profiles (
  id          UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT  NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 2 AND 200),
  description TEXT  CHECK (char_length(description) <= 2000),
  -- weights jsonb: keys = technical_skills | project_quality | testing_practices | documentation
  -- values = integer weight (should sum to 100)
  weights     JSONB NOT NULL DEFAULT '{
    "technical_skills": 35,
    "project_quality": 30,
    "testing_practices": 20,
    "documentation": 15
  }'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_role_profiles_updated_at
  BEFORE UPDATE ON role_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE role_profiles ENABLE ROW LEVEL SECURITY;

-- Public readable
CREATE POLICY "role_profiles_select_public"
  ON role_profiles FOR SELECT
  USING (TRUE);

-- Admin only for write
CREATE POLICY "role_profiles_write_admin"
  ON role_profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── ROLE PROFILE SKILLS TABLE ────────────────────────────────
CREATE TABLE role_profile_skills (
  id               UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_profile_id  UUID     NOT NULL REFERENCES role_profiles(id) ON DELETE CASCADE,
  skill_id         UUID     NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  required_level   SMALLINT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
  importance       SMALLINT NOT NULL CHECK (importance BETWEEN 1 AND 3),
  -- importance: 1=nice_to_have, 2=important, 3=required
  UNIQUE (role_profile_id, skill_id)
);

CREATE INDEX idx_rps_role_profile ON role_profile_skills(role_profile_id);
CREATE INDEX idx_rps_skill        ON role_profile_skills(skill_id);

ALTER TABLE role_profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rps_select_public"
  ON role_profile_skills FOR SELECT
  USING (TRUE);

CREATE POLICY "rps_write_admin"
  ON role_profile_skills FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── SEED: 6 ROLE PROFILES ────────────────────────────────────
-- NOTE: These UUIDs are stable seed IDs referenced in later migrations.
-- DEMO DATA — not real job listings.

INSERT INTO role_profiles (id, name, description, weights) VALUES
(
  'cccccccc-0001-0001-0001-000000000001',
  'Junior Python Developer',
  'Entry-level Python developer role. Strong fundamentals in Python, basic backend development and familiarity with testing. [DEMO — not a real role listing]',
  '{"technical_skills": 40, "project_quality": 25, "testing_practices": 20, "documentation": 15}'
),
(
  'cccccccc-0001-0001-0001-000000000002',
  'Frontend Developer',
  'Frontend-focused role requiring React/JavaScript, CSS, and user-facing component development. [DEMO — not a real role listing]',
  '{"technical_skills": 35, "project_quality": 30, "testing_practices": 20, "documentation": 15}'
),
(
  'cccccccc-0001-0001-0001-000000000003',
  'Backend Developer (Node)',
  'Node.js backend role with database, REST API, and server-side logic focus. [DEMO — not a real role listing]',
  '{"technical_skills": 38, "project_quality": 27, "testing_practices": 22, "documentation": 13}'
),
(
  'cccccccc-0001-0001-0001-000000000004',
  'Data Analyst',
  'Data analysis role: SQL, Python for data processing, and data visualisation. [DEMO — not a real role listing]',
  '{"technical_skills": 35, "project_quality": 25, "testing_practices": 15, "documentation": 25}'
),
(
  'cccccccc-0001-0001-0001-000000000005',
  'Full-Stack Developer',
  'Full-stack role covering frontend (React), backend (Node or Python), databases and deployment. [DEMO — not a real role listing]',
  '{"technical_skills": 35, "project_quality": 30, "testing_practices": 20, "documentation": 15}'
),
(
  'cccccccc-0001-0001-0001-000000000006',
  'Database / SQL Developer',
  'SQL-specialist role: schema design, query optimisation, stored procedures and database administration. [DEMO — not a real role listing]',
  '{"technical_skills": 40, "project_quality": 25, "testing_practices": 20, "documentation": 15}'
)
ON CONFLICT (id) DO NOTHING;

-- ─── SEED: ROLE PROFILE SKILLS ────────────────────────────────
-- Uses stable skill UUIDs from seed.sql
-- importance: 3=required, 2=important, 1=nice_to_have
-- required_level: 1-5 (1=beginner, 3=competent, 5=expert)

INSERT INTO role_profile_skills (role_profile_id, skill_id, required_level, importance) VALUES

-- ── Junior Python Developer ──
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', 3, 3),  -- Python required
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000022', 2, 2),  -- FastAPI important
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000024', 2, 2),  -- PostgreSQL important
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000028', 2, 2),  -- REST APIs important
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000029', 1, 1),  -- Docker nice-to-have
('cccccccc-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000034', 1, 1),  -- GitHub Actions nice-to-have

-- ── Frontend Developer ──
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000002', 3, 3),  -- JavaScript required
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000003', 2, 2),  -- TypeScript important
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000011', 3, 3),  -- React required
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000016', 2, 2),  -- CSS important
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000017', 2, 2),  -- HTML important
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000015', 1, 1),  -- Tailwind CSS nice-to-have
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000012', 1, 2),  -- Next.js important
('cccccccc-0001-0001-0001-000000000002', '11111111-0001-0001-0001-000000000028', 1, 1),  -- REST APIs nice-to-have

-- ── Backend Developer (Node) ──
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000021', 3, 3),  -- Node.js required
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000002', 3, 3),  -- JavaScript required
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000003', 2, 2),  -- TypeScript important
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000024', 3, 3),  -- PostgreSQL required
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000028', 3, 3),  -- REST APIs required
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000027', 1, 1),  -- GraphQL nice-to-have
('cccccccc-0001-0001-0001-000000000003', '11111111-0001-0001-0001-000000000029', 2, 2),  -- Docker important

-- ── Data Analyst ──
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000001', 2, 2),  -- Python important
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000024', 3, 3),  -- PostgreSQL required
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000036', 2, 2),  -- Machine Learning important
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000040', 2, 2),  -- Data Analysis important
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000041', 2, 2),  -- Pandas important
('cccccccc-0001-0001-0001-000000000004', '11111111-0001-0001-0001-000000000025', 1, 1),  -- MySQL nice-to-have

-- ── Full-Stack Developer ──
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000011', 3, 3),  -- React required
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000021', 2, 3),  -- Node.js required
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000002', 3, 3),  -- JavaScript required
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000024', 2, 2),  -- PostgreSQL important
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000028', 2, 2),  -- REST APIs important
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000029', 1, 1),  -- Docker nice-to-have
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000003', 2, 2),  -- TypeScript important
('cccccccc-0001-0001-0001-000000000005', '11111111-0001-0001-0001-000000000012', 2, 2),  -- Next.js important

-- ── Database / SQL Developer ──
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000024', 4, 3),  -- PostgreSQL required (level 4)
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000025', 3, 3),  -- MySQL required
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000081', 3, 3),  -- System Design required
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000082', 2, 2),  -- Microservices important
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000084', 1, 1),  -- Supabase nice-to-have
('cccccccc-0001-0001-0001-000000000006', '11111111-0001-0001-0001-000000000001', 1, 1)   -- Python nice-to-have

ON CONFLICT (role_profile_id, skill_id) DO NOTHING;
