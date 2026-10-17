-- =============================================================
-- SEED FILE: FORJ Demo Data
-- ⚠️  ALL DATA IN THIS FILE IS DEMO DATA FOR DEVELOPMENT ONLY.
-- Do NOT present any of this as real vacancies, real companies,
-- or real people. This data is for UI testing and RLS verification.
-- =============================================================

-- ─── SEED SKILLS (80+ real skills across multiple categories) ─
INSERT INTO skills (id, name, category, is_verified) VALUES
-- Programming Languages
  ('11111111-0001-0001-0001-000000000001', 'Python',              'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000002', 'JavaScript',          'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000003', 'TypeScript',          'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000004', 'Java',                'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000005', 'C++',                 'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000006', 'Go',                  'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000007', 'Rust',                'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000008', 'Kotlin',              'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000009', 'Swift',               'programming',  TRUE),
  ('11111111-0001-0001-0001-000000000010', 'Dart',                'programming',  TRUE),
-- Web / Frontend
  ('11111111-0001-0001-0001-000000000011', 'React',               'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000012', 'Next.js',             'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000013', 'Vue.js',              'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000014', 'Angular',             'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000015', 'Tailwind CSS',        'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000016', 'CSS',                 'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000017', 'HTML',                'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000018', 'Svelte',              'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000019', 'WebGL',               'frontend',     TRUE),
  ('11111111-0001-0001-0001-000000000020', 'Three.js',            'frontend',     TRUE),
-- Backend / Infra
  ('11111111-0001-0001-0001-000000000021', 'Node.js',             'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000022', 'FastAPI',             'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000023', 'Django',              'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000024', 'PostgreSQL',          'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000025', 'MySQL',               'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000026', 'Redis',               'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000027', 'GraphQL',             'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000028', 'REST APIs',           'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000029', 'Docker',              'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000030', 'Kubernetes',          'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000031', 'AWS',                 'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000032', 'Google Cloud',        'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000033', 'Azure',               'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000034', 'GitHub Actions',      'devops',       TRUE),
  ('11111111-0001-0001-0001-000000000035', 'Terraform',           'devops',       TRUE),
-- Data & ML
  ('11111111-0001-0001-0001-000000000036', 'Machine Learning',    'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000037', 'Deep Learning',       'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000038', 'NLP',                 'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000039', 'Computer Vision',     'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000040', 'PyTorch',             'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000041', 'TensorFlow',          'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000042', 'Data Analysis',       'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000043', 'Pandas',              'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000044', 'SQL',                 'data-ml',      TRUE),
  ('11111111-0001-0001-0001-000000000045', 'Power BI',            'data-ml',      TRUE),
-- Design
  ('11111111-0001-0001-0001-000000000046', 'UI/UX Design',        'design',       TRUE),
  ('11111111-0001-0001-0001-000000000047', 'Figma',               'design',       TRUE),
  ('11111111-0001-0001-0001-000000000048', 'Adobe Illustrator',   'design',       TRUE),
  ('11111111-0001-0001-0001-000000000049', 'Adobe Photoshop',     'design',       TRUE),
  ('11111111-0001-0001-0001-000000000050', 'Wireframing',         'design',       TRUE),
  ('11111111-0001-0001-0001-000000000051', 'Prototyping',         'design',       TRUE),
  ('11111111-0001-0001-0001-000000000052', 'Motion Design',       'design',       TRUE),
  ('11111111-0001-0001-0001-000000000053', 'Brand Design',        'design',       TRUE),
-- Marketing & Growth
  ('11111111-0001-0001-0001-000000000054', 'Digital Marketing',   'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000055', 'SEO',                 'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000056', 'Content Marketing',   'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000057', 'Social Media',        'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000058', 'Email Marketing',     'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000059', 'Growth Hacking',      'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000060', 'Google Analytics',    'marketing',    TRUE),
  ('11111111-0001-0001-0001-000000000061', 'Copywriting',         'marketing',    TRUE),
-- Business
  ('11111111-0001-0001-0001-000000000062', 'Product Management',  'business',     TRUE),
  ('11111111-0001-0001-0001-000000000063', 'Business Analysis',   'business',     TRUE),
  ('11111111-0001-0001-0001-000000000064', 'Project Management',  'business',     TRUE),
  ('11111111-0001-0001-0001-000000000065', 'Agile/Scrum',         'business',     TRUE),
  ('11111111-0001-0001-0001-000000000066', 'Financial Modelling', 'business',     TRUE),
  ('11111111-0001-0001-0001-000000000067', 'Sales',               'business',     TRUE),
  ('11111111-0001-0001-0001-000000000068', 'Customer Research',   'business',     TRUE),
  ('11111111-0001-0001-0001-000000000069', 'Fundraising',         'business',     TRUE),
  ('11111111-0001-0001-0001-000000000070', 'Pitch Decks',         'business',     TRUE),
-- Hardware / Embedded
  ('11111111-0001-0001-0001-000000000071', 'Arduino',             'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000072', 'Raspberry Pi',        'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000073', 'IoT',                 'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000074', 'PCB Design',          'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000075', 'FPGA',                'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000076', 'Embedded C',          'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000077', 'MATLAB',              'hardware',     TRUE),
  ('11111111-0001-0001-0001-000000000078', '3D Printing',         'hardware',     TRUE),
-- Soft / Cross-functional
  ('11111111-0001-0001-0001-000000000079', 'Technical Writing',   'general',      TRUE),
  ('11111111-0001-0001-0001-000000000080', 'Open Source',         'general',      TRUE),
  ('11111111-0001-0001-0001-000000000081', 'System Design',       'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000082', 'Microservices',       'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000083', 'Blockchain',          'general',      TRUE),
  ('11111111-0001-0001-0001-000000000084', 'Supabase',            'backend',      TRUE),
  ('11111111-0001-0001-0001-000000000085', 'Flutter',             'frontend',     TRUE)
ON CONFLICT (name) DO NOTHING;

-- ─── DEMO ADMIN USER (must be inserted into auth.users by Supabase CLI in dev) ─
-- Insert demo profiles referencing fake UUIDs that match CLI seeded auth users.
-- In local dev: use `supabase db seed` or insert via service key. The UUIDs below
-- must match auth.users rows created before this seed runs (via CLI or test helpers).

-- For CI/local testing we insert directly, bypassing the trigger (trigger uses ON CONFLICT DO NOTHING).
-- The trigger will have already run for real signups; this seed is for test UUIDs only.

-- ⚠️ DEMO DATA — not real people or organisations ⚠️
DO $$
DECLARE
  admin_id      UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  employer1_id  UUID := 'aaaaaaaa-0000-0000-0000-000000000002';
  employer2_id  UUID := 'aaaaaaaa-0000-0000-0000-000000000003';
  mentor1_id    UUID := 'aaaaaaaa-0000-0000-0000-000000000004';
  candidate1_id UUID := 'aaaaaaaa-0000-0000-0000-000000000005';
  candidate2_id UUID := 'aaaaaaaa-0000-0000-0000-000000000006';
  org1_id       UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  org2_id       UUID := 'bbbbbbbb-0000-0000-0000-000000000002';
BEGIN

  -- Insert auth.users stubs for seed (local dev only – in prod these come from real signups)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES
    (admin_id,      'admin@demo.forj.in',      crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Arjun Sharma","role":"admin"}',     NOW(), NOW(), 'authenticated', 'authenticated'),
    (employer1_id,  'employer1@demo.forj.in',   crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Priya Mehta","role":"employer"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (employer2_id,  'employer2@demo.forj.in',   crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Rahul Gupta","role":"employer"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (mentor1_id,    'mentor1@demo.forj.in',     crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Dr. Sneha Iyer","role":"mentor"}',   NOW(), NOW(), 'authenticated', 'authenticated'),
    (candidate1_id, 'candidate1@demo.forj.in',  crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Vikram Singh","role":"candidate"}',  NOW(), NOW(), 'authenticated', 'authenticated'),
    (candidate2_id, 'candidate2@demo.forj.in',  crypt('Demo@1234', gen_salt('bf')), NOW(), '{"full_name":"Ananya Roy","role":"candidate"}',   NOW(), NOW(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Profiles (trigger should have created them; update to set correct roles for demo)
  UPDATE profiles SET role = 'admin',     onboarding_completed = TRUE, headline = 'Platform Administrator',       location = 'Bengaluru, India'  WHERE id = admin_id;
  UPDATE profiles SET role = 'employer',  onboarding_completed = TRUE, headline = 'CTO at NexWave Technologies',  location = 'Mumbai, India'     WHERE id = employer1_id;
  UPDATE profiles SET role = 'employer',  onboarding_completed = TRUE, headline = 'Founder at GreenLoop Startup', location = 'Pune, India'       WHERE id = employer2_id;
  UPDATE profiles SET role = 'mentor',    onboarding_completed = TRUE, headline = 'Startup mentor | Ex-Google',   location = 'Hyderabad, India'  WHERE id = mentor1_id;
  UPDATE profiles SET role = 'candidate', onboarding_completed = TRUE, headline = 'Full-stack developer, B.Tech CS 2025', location = 'Delhi, India' WHERE id = candidate1_id;
  UPDATE profiles SET role = 'candidate', onboarding_completed = FALSE, headline = 'ML enthusiast, IIT Bombay',   location = 'Mumbai, India'     WHERE id = candidate2_id;

  -- Demo organizations (⚠️ DEMO ONLY)
  INSERT INTO organizations (id, owner_id, name, type, website, description, verification_status)
  VALUES
    (org1_id, employer1_id, '[DEMO] NexWave Technologies',  'company',  'https://demo.nexwave.example', 'A demo B2B SaaS company for testing FORJ. Not a real company.', 'verified'),
    (org2_id, employer2_id, '[DEMO] GreenLoop',             'startup',  'https://demo.greenloop.example','A demo climate-tech startup for testing FORJ. Not real.',        'unverified')
  ON CONFLICT (id) DO NOTHING;

  -- Org memberships
  INSERT INTO organization_members (organization_id, profile_id, member_role) VALUES
    (org1_id, employer1_id, 'owner'),
    (org2_id, employer2_id, 'owner')
  ON CONFLICT DO NOTHING;

  -- Candidate skills
  INSERT INTO profile_skills (profile_id, skill_id, level, source) VALUES
    (candidate1_id, '11111111-0001-0001-0001-000000000001', 4, 'self'),   -- Python
    (candidate1_id, '11111111-0001-0001-0001-000000000002', 4, 'self'),   -- JavaScript
    (candidate1_id, '11111111-0001-0001-0001-000000000011', 3, 'self'),   -- React
    (candidate1_id, '11111111-0001-0001-0001-000000000024', 3, 'self'),   -- PostgreSQL
    (candidate1_id, '11111111-0001-0001-0001-000000000021', 4, 'self'),   -- Node.js
    (candidate2_id, '11111111-0001-0001-0001-000000000001', 5, 'self'),   -- Python
    (candidate2_id, '11111111-0001-0001-0001-000000000036', 4, 'self'),   -- Machine Learning
    (candidate2_id, '11111111-0001-0001-0001-000000000040', 3, 'self'),   -- PyTorch
    (candidate2_id, '11111111-0001-0001-0001-000000000038', 3, 'self')    -- NLP
  ON CONFLICT DO NOTHING;

END $$;
