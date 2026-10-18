# FORJ — Skill Verification, Proof of Work & Talent Platform

> **Proof over claims.** FORJ is a comprehensive developer talent intelligence and venture orchestration platform that verifies hands-on engineering capabilities, generates tamper-proof Skill Passports, and matches verified talent with startups, employers, and mentors.

---

## 🌟 Platform Highlights & Personas

FORJ provides three specialized dashboards unified under a seamless role-based navigation architecture:

```
                          ┌───────────────────────────┐
                          │   FORJ Platform Core      │
                          │   (Auth, Postgres, RLS)   │
                          └─────────────┬─────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ 🎓 Candidate     │           │ 🏢 Employer      │           │ 🧭 Mentor        │
│ Dashboard        │           │ Console          │           │ Studio           │
├──────────────────┤           ├──────────────────┤           ├──────────────────┤
│ • GitHub Analyser│           │ • Candidate Hunt │           │ • Request Inbox  │
│ • Skill Readiness│           │ • Code Reviews   │           │ • Session Hub    │
│ • Skill Passport │           │ • Shortlists     │           │ • Active Mentees │
│ • Proof Portfolio│           │ • Challenge Post │           │ • Resource Share │
│ • Challenges     │           │ • Team & Org     │           │ • Reviews & Star │
│ • Venture Ideas  │           │ • Funnel Stats   │           │ • Impact Metrics │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

### 1. 🎓 Candidate Experience
* **GitHub Intelligence (`/candidate/github`)**: Connects public GitHub repositories to inspect commit patterns, complexity, testing discipline, and architecture practices.
* **Skill Readiness Matrix (`/candidate/readiness`)**: Maps verified engineering signals against target roles (Backend, Fullstack, Systems, DevOps) to identify actionable skill gaps.
* **Skill Passport (`/candidate/passport` & `/passport/[token]`)**: Cryptographically verifiable, shareable credentials reflecting hands-on performance with public token verification.
* **Practical Challenges (`/challenges`)**: Real-world repository tasks executed in an isolated execution sandbox against hidden test suites.
* **Proof Portfolio (`/portfolio`)**: Verified project portfolio showcasing submitted commits, integrity scores, rubrics, and reviewer notes.
* **Venture Pathway & DevLens AI (`/ideas` & `/mentorship`)**: Pathway for builders to launch venture ideas, request guidance from industry mentors, and run **DevLens AI** architecture analysis directly on prototype repositories to extract tech stacks, map component topology, and investigate codebases with grounded AI Q&A.

---

### 2. 🏢 Employer Console (`/employer`)
* **Talent Pipeline (`/employer/candidates`)**: Search and filter candidate profiles by verified tech stack, Passport score, and GitHub proof.
* **Submission Code Review (`/employer/applications`)**: Complete candidate submission viewer featuring test execution logs, commit SHAs, integrity signals, and one-click feedback.
* **Candidate Shortlisting (`/employer/shortlisted`)**: Dedicated staging area to manage shortlisted applicants, schedule interviews, and track private recruiter notes.
* **Challenge Management (`/employer/challenges` & `/employer/challenges/new`)**: Create and publish role-specific engineering assessments with custom rubrics and time bounds.
* **Organization & Team (`/employer/org` & `/employer/team`)**: Company profile customization, logo uploads, and multi-seat team member role delegation.
* **Hiring Analytics (`/employer/analytics`)**: Real-time hiring pipeline metrics, skill distributions, and applicant score histograms.

---

### 3. 🧭 Mentor Studio (`/mentor`)
* **Request Inbox (`/mentor/requests`)**: Review incoming mentee applications with one-click Accept, Defer, or Decline actions.
* **Session Hub (`/mentor/sessions`)**: Upcoming 1-on-1 scheduled sessions, video meeting links, session notes, and historical logs.
* **Active Mentees (`/mentor/mentees`)**: Mentee goal tracking, milestone progress bars, and upcoming milestone dates.
* **Curated Resources (`/mentor/resources`)**: Shared technical repositories, documentation links, and architectural blueprints.
* **Reviews & Ratings (`/mentor/reviews`)**: Cumulative rating metrics, star breakdowns, and mentee testimonials.
* **Impact Metrics (`/mentor/impact`)**: Total hours mentored, mentees successfully placed, and technical domain breakdown.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Web App** | **Next.js 16 (Turbopack)**, React 19, TypeScript | App Router, Server Actions, SSR, Responsive Forge Design System |
| **Design System** | **Vanilla CSS** + CSS Variables | High-performance, glassmorphism, responsive sidebar layout, zero runtime overhead |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Auth, Database Migrations, Row Level Security (RLS) on all tables, Storage Buckets |
| **Graph Intelligence** | **Neo4j Aura (Cypher)** | Knowledge graph topology for DevLens architecture mapping, dependencies, and modules |
| **Evaluation Worker** | **Python 3.12**, FastAPI, Docker SDK | Isolated sandbox test execution, OOM/timeout limits, code scoring |
| **GitHub Analyzer** | **Node.js 20**, TypeScript, Gemini AI | AST parsing, code quality analysis, and multi-tier LLM assessment |

---

## 📁 Repository Structure

```
Forj/
├── forj-app/                   # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                # App Router (47 pages & API routes)
│   │   │   ├── (auth)/         # Authentication (Login, Signup, Callback, Signout)
│   │   │   ├── candidate/      # GitHub analysis, Readiness, Passport
│   │   │   ├── challenges/     # Challenge list & submission details
│   │   │   ├── employer/       # Complete Employer Dashboard & Pipeline
│   │   │   ├── mentor/         # Complete Mentor Dashboard & Sessions
│   │   │   ├── matches/        # Evidence-based opportunity matches
│   │   │   ├── portfolio/      # Verified proof portfolio
│   │   │   ├── profile/        # User profile & skill management
│   │   │   └── globals.css     # Forge Design System tokens & utilities
│   │   ├── components/         # Reusable UI & Shell layouts
│   │   │   └── layout/         # AppShell, EmployerShell, MentorShell
│   │   ├── lib/                # Supabase client/server utilities
│   │   └── types/              # Database & API TypeScript definitions
│   └── next.config.ts          # Turbopack and build configuration
│
├── services/                   # Background Services & Workers
│   ├── forj-worker/            # Python 3.12 Execution Sandbox Worker
│   │   ├── app/                # Worker job queue polling, Docker runner, grading
│   │   ├── Dockerfile          # Production worker container
│   │   └── requirements.txt    # Python dependencies
│   │
│   └── github-analyzer/        # Node.js GitHub Intelligence Service
│       ├── src/                # DevLens AST engine, Gemini LLM chain
│       └── Dockerfile          # Analyzer container
│
├── supabase/                   # Database Architecture & Security
│   ├── migrations/             # 8 sequential SQL schema migrations
│   │   ├── 0001_foundation.sql
│   │   ├── 0002_user_roles.sql
│   │   ├── 0003_jobs_queue.sql
│   │   ├── 0004_role_profiles.sql
│   │   ├── 0005_challenge_private_bucket.sql
│   │   ├── 0006_github_and_evidence.sql
│   │   ├── 0007_verification_and_passport.sql
│   │   └── 0008_devlens_github_analyzer.sql
│   └── seed.sql                # Comprehensive demo seed data
│
├── scripts/                    # Utilities & Test Verification Suites
│   ├── apply_migration.mjs     # Database migration runner
│   ├── test_rls.mjs            # Comprehensive RLS permission test suite
│   ├── test_phase2a_e2e.mjs    # End-to-end sandbox evaluation test
│   ├── test_github_token.py    # GitHub API token & rate limit verification
│   └── seed_challenge_templates.mjs
│
├── docs/                       # Technical & Architectural Documentation
│   ├── GEMINI_UPGRADE_SUMMARY.md
│   ├── GITHUB_REFERENCE_FEATURE.md
│   ├── GITHUB_TOKEN_CONFIG.md
│   ├── QUICK_MODEL_SWITCH.md
│   ├── THIRD_PARTY_NOTICES.md
│   └── devlens-review.md
│
├── compose.yaml                # Docker Compose orchestration
└── package.json                # Root automation scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Python**: `3.12+` (for `forj-worker`)
- **Docker**: (Required for sandbox test isolation)
- **Supabase**: Local CLI or cloud project instance

---

### 2. Environment Configuration

Copy the example environment files:

```bash
# Root environment
cp .env.example .env

# Web app environment
cp .env.example forj-app/.env.local
```

Ensure your `.env` contains the required keys:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
GITHUB_TOKEN=ghp_your_personal_access_token
LLM_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key

# Neo4j Graph Intelligence (Aura or Local)
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j
```

---

### 3. Database Migrations

Apply all schema migrations to your Supabase instance:

```bash
# Run database migrations
npm run migrate

# Verify Row Level Security (RLS) integrity
npm run test:rls
```

---

### 4. Running the Web Application

From the root directory:

```bash
# Install root dependencies
npm install

# Start Next.js development server
npm run dev
```

The application will be running at **`http://localhost:3000`**.

---

### 5. Running the Background Workers

#### A. Code Sandbox Worker (`services/forj-worker`)
```bash
cd services/forj-worker
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
python worker.py
```

#### B. GitHub Analyzer (`services/github-analyzer`)
```bash
cd services/github-analyzer
npm install
npm run dev
```

---

### 6. Full Stack with Docker Compose

To launch all services (worker, analyzer, and web app) together:

```bash
docker compose --profile web up --build
```

---

## 🔒 Security & Row Level Security (RLS)

Every database table in FORJ is protected by Postgres **Row Level Security (RLS)**:
- **Private Submissions & Hidden Tests**: Candidates can never read reference solutions, hidden unit test fixtures, or other candidates' submissions.
- **Skill Passports**: Passports can only be accessed via authorized public tokens or candidate consent.
- **Employer Isolation**: Organizations and private candidate notes can only be accessed by verified team members.
- **Service Role Boundaries**: Evaluation scoring and sandbox writes are strictly gated behind `service_role` credentials.

Run the test suite anytime to verify policy enforcement:
```bash
npm run test:rls
```

---

## 📚 Technical Documentation

Detailed architectural and deep-dive documentation is located in the [`docs/`](./docs) folder:
- **[Gemini Model Configuration](./docs/GEMINI_UPGRADE_SUMMARY.md)**: Architecture for Gemini 2.5 / 2.0 Flash integration.
- **[GitHub Token Configuration](./docs/GITHUB_TOKEN_CONFIG.md)**: Setup and rate limit management for GitHub APIs.
- **[DevLens AI Review](./docs/devlens-review.md)**: Deep dive into the static analysis and repository parser.
- **[Third Party Notices](./docs/THIRD_PARTY_NOTICES.md)**: Attribution and open-source licenses.

---

## 📄 License

Proprietary platform built with open-source foundations. See [`docs/THIRD_PARTY_NOTICES.md`](./docs/THIRD_PARTY_NOTICES.md) for full licensing details.
