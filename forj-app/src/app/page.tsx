import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ArrowRight, GitBranch, Shield, Award, Briefcase, TrendingUp,
  Zap, CheckCircle, Clock, Star, Code2, Database, Globe
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bone)" }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav style={{
        borderBottom: "1px solid var(--color-steel-light)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
          <div className="brand-mark" style={{ fontSize: "1.5rem" }}>
            F<span style={{ color: "var(--color-ember)" }}>O</span>RJ
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary btn">
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost btn">Sign in</Link>
                <Link href="/auth/signup" className="btn-primary btn">
                  Get started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Animated background orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="page-container" style={{ paddingTop: "5rem", paddingBottom: "5rem", position: "relative" }}>
          <div style={{ maxWidth: "56rem", margin: "0 auto", textAlign: "center" }}>

            {/* Badge */}
            <div className="animate-fade-in" style={{ marginBottom: "1.5rem" }}>
              <span className="badge-ember badge" style={{ padding: "0.375rem 1rem", fontSize: "0.8125rem" }}>
                <Star size={12} style={{ display: "inline", marginRight: "0.375rem" }} />
                Smart India Hackathon · Entrepreneurship &amp; Employment
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-slide-up"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                marginBottom: "1.5rem",
                animationDelay: "0.05s",
              }}
            >
              Prove your skills.{" "}
              <span className="hero-gradient-text">Forge your future.</span>
            </h1>

            {/* Sub-headline */}
            <p
              className="animate-slide-up"
              style={{
                fontSize: "1.25rem",
                color: "var(--color-steel)",
                maxWidth: "44rem",
                margin: "0 auto 2.5rem",
                lineHeight: 1.65,
                animationDelay: "0.12s",
              }}
            >
              FORJ's{" "}
              <strong style={{ color: "var(--color-ink)" }}>Skill Verification Engine</strong>{" "}
              analyses your GitHub, assigns targeted challenges, sandboxes your code, and builds a
              tamper-proof{" "}
              <strong style={{ color: "var(--color-ink)" }}>Skill Passport</strong>{" "}
              — so employers see what you can actually do.
            </p>

            {/* CTAs */}
            <div
              className="animate-slide-up"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
                animationDelay: "0.2s",
                marginBottom: "3.5rem",
              }}
            >
              <Link href="/auth/signup?role=job_seeker" className="btn-primary btn btn-lg" style={{ gap: "0.625rem" }}>
                Build my Skill Passport <ArrowRight size={18} />
              </Link>
              <Link href="/auth/signup?role=employer" className="btn-secondary btn btn-lg">
                I&apos;m hiring
              </Link>
            </div>

            {/* Skill Verification Engine — 3-step visual */}
            <div
              className="animate-slide-up"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--color-steel-light)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(28,27,25,0.10)",
                animationDelay: "0.28s",
              }}
            >
              {[
                {
                  step: "01",
                  icon: GitBranch,
                  title: "Analyse",
                  desc: "Connect GitHub. We scan repos for real skill evidence — language use, tests, docs, architecture.",
                  color: "var(--color-steel)",
                  bg: "#f8fafc",
                },
                {
                  step: "02",
                  icon: Code2,
                  title: "Verify",
                  desc: "Get a targeted challenge for any gap. Sandboxed execution. Hidden tests. Transparent rubric.",
                  color: "var(--color-ember)",
                  bg: "#fff7ed",
                },
                {
                  step: "03",
                  icon: Award,
                  title: "Match",
                  desc: "Your Skill Passport shows evidence per skill. Employers see proof, not promises.",
                  color: "var(--color-brass)",
                  bg: "#fffbeb",
                },
              ].map(({ step, icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  style={{
                    background: bg,
                    padding: "2rem 1.5rem",
                    textAlign: "left",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{step}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
                    <Icon size={20} style={{ color }} />
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--color-ink)" }}>{title}</h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-steel)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Verification Badges legend ─────────────────────────── */}
      <section style={{ background: "var(--color-ink)", color: "white", padding: "1.25rem 0" }}>
        <div className="page-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.5 }}>Skill Passport badges</span>
          {[
            { label: "Not assessed", style: { border: "2px dashed #4A5560", background: "transparent", color: "#D8D3C8" } },
            { label: "Repository evidence", style: { border: "2px solid #4A5560", background: "transparent", color: "#D8D3C8" } },
            { label: "Challenge verified", style: { background: "var(--color-brass)", color: "var(--color-ink)", border: "none" } },
            { label: "Employer reviewed", style: { background: "var(--color-success)", color: "white", border: "none" } },
          ].map(({ label, style }) => (
            <span key={label} style={{ ...style, padding: "0.25rem 0.875rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid var(--color-steel-light)", background: "var(--color-paper)" }}>
        <div className="page-container" style={{ padding: "2.5rem 1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {[
              { label: "Skills in taxonomy", value: "85+" },
              { label: "Role profiles", value: "6" },
              { label: "Hiring orgs (live soon)", value: "—" },
              { label: "Passports issued", value: "—" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "2rem", color: "var(--color-ember)", marginBottom: "0.25rem" }}>{stat.value}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-steel)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two journeys ───────────────────────────────────────── */}
      <section className="page-container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <div className="badge-steel badge" style={{ marginBottom: "0.75rem" }}>Two pathways</div>
          <h2 style={{ marginBottom: "0.5rem" }}>One forge.</h2>
          <p style={{ color: "var(--color-steel)", maxWidth: "36rem", margin: "0 auto" }}>
            Whether you&apos;re looking for work or building a company, FORJ has a path for you.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>

          {/* Talent Pathway */}
          <div className="card card-interactive animate-slide-up" style={{ padding: "2.5rem", borderTop: "3px solid var(--color-ember)" }}>
            <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Briefcase size={22} style={{ color: "var(--color-ember)" }} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Talent Pathway</h3>
            <p style={{ color: "var(--color-steel)", fontSize: "0.9375rem", marginBottom: "1.75rem", lineHeight: 1.65 }}>
              Connect GitHub → get a Readiness Report → complete sandboxed challenges → earn a verified Skill Passport → match with employers.
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { step: "Connect GitHub", status: "done" },
                { step: "Skill Readiness Report per role", status: "done" },
                { step: "Targeted challenge (sandboxed)", status: "done" },
                { step: "Skill Passport with evidence", status: "done" },
                { step: "Match with opportunities", status: "done" },
              ].map(({ step }, i) => (
                <li key={step} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <span style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "var(--color-ember)", color: "white", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--color-ink)" }}>{step}</span>
                </li>
              ))}
            </ol>
            <Link href="/auth/signup?role=job_seeker" className="btn-primary btn" style={{ width: "100%", justifyContent: "center" }}>
              Start as talent <ArrowRight size={16} />
            </Link>
          </div>

          {/* Venture Pathway */}
          <div className="card card-interactive animate-slide-up" style={{ padding: "2.5rem", borderTop: "3px solid var(--color-brass)", animationDelay: "0.08s" }}>
            <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "10px", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <TrendingUp size={22} style={{ color: "var(--color-brass)" }} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>Venture Launchpad</h3>
            <p style={{ color: "var(--color-steel)", fontSize: "0.9375rem", marginBottom: "1.75rem", lineHeight: 1.65 }}>
              Validate your idea with structured AI assistance, find co-founders and mentors, track milestones, and connect with incubators.
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Submit your idea", "AI-assisted validation", "Find team & mentors", "Track milestones", "Connect with incubators"].map((step, i) => (
                <li key={step} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <span style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "var(--color-brass)", color: "white", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--color-ink)" }}>{step}</span>
                </li>
              ))}
            </ol>
            <Link href="/auth/signup?role=founder" className="btn-secondary btn" style={{ width: "100%", justifyContent: "center" }}>
              Launch a venture <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Skill Verification Engine Deep Dive ────────────────── */}
      <section style={{ background: "var(--color-ink)", padding: "5rem 0" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-block", padding: "0.25rem 0.875rem", borderRadius: "999px", background: "rgba(217,83,30,0.15)", color: "var(--color-ember)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "1rem", border: "1px solid rgba(217,83,30,0.3)" }}>
              Core differentiator
            </div>
            <h2 style={{ color: "white", marginBottom: "0.75rem" }}>The Skill Verification Engine</h2>
            <p style={{ color: "#9aa3ae", maxWidth: "40rem", margin: "0 auto", fontSize: "1.0625rem", lineHeight: 1.65 }}>
              Evidence-backed skill assessment from three independent sources. AI assists. Humans decide. Badges are honest.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                icon: GitBranch,
                title: "GitHub Analysis",
                badge: "Repository evidence",
                badgeColor: "#4A5560",
                badgeBg: "transparent",
                badgeBorder: "1px solid #4A5560",
                points: [
                  "Rule-based: language, frameworks, tests, CI, docs",
                  "AI interprets and summarises (clearly labelled)",
                  "README content is untrusted — prompt-injection proof",
                  "Skill Readiness Report per target role",
                ],
              },
              {
                icon: Code2,
                title: "Challenge Verification",
                badge: "Challenge verified",
                badgeColor: "var(--color-ink)",
                badgeBg: "var(--color-brass)",
                badgeBorder: "none",
                points: [
                  "Sandboxed Docker execution — no network, non-root",
                  "Hidden tests: candidate code never sees them",
                  "AI scores explanation criterion — marked AI-generated",
                  "Follow-up questions verify understanding, not authorship",
                ],
              },
              {
                icon: CheckCircle,
                title: "Employer Review",
                badge: "Employer reviewed",
                badgeColor: "white",
                badgeBg: "var(--color-success)",
                badgeBorder: "none",
                points: [
                  "Employer shortlists from real submitted work",
                  "Human reviewer upgrades skill to employer-reviewed",
                  "Adds timestamped evidence to Skill Passport",
                  "You must consent before employers see your passport",
                ],
              },
            ].map(({ icon: Icon, title, badge, badgeColor, badgeBg, badgeBorder, points }) => (
              <div key={title} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "2rem",
                backdropFilter: "blur(8px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                  <Icon size={20} style={{ color: "var(--color-ember)" }} />
                  <h4 style={{ color: "white", margin: 0, fontSize: "1.0625rem" }}>{title}</h4>
                </div>
                <span style={{ display: "inline-block", padding: "0.2rem 0.75rem", borderRadius: "999px", background: badgeBg, color: badgeColor, border: badgeBorder, fontSize: "0.72rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                  {badge}
                </span>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {points.map((pt) => (
                    <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#c5cdd6", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--color-ember)", marginTop: "0.1rem", flexShrink: 0 }}>—</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For employers ──────────────────────────────────────── */}
      <section className="page-container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem", alignItems: "center" }}>
          <div>
            <div className="badge-steel badge" style={{ marginBottom: "1rem" }}>For employers &amp; startups</div>
            <h2 style={{ marginBottom: "0.75rem" }}>Stop guessing. See the work.</h2>
            <p style={{ color: "var(--color-steel)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Post a challenge in minutes. Candidates submit real work, sandboxed and scored. Browse verified Skill Passports. Shortlist based on evidence, not résumés.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                "Post challenges for free",
                "AI drafts feedback — you approve before candidates see it",
                "Browse Skill Passports (with candidate consent only)",
                "Match scores: required coverage, evidence quality, level fit",
                "Employer-reviewed badge upgrades candidate passport",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.9375rem", color: "var(--color-steel)" }}>
                  <CheckCircle size={16} style={{ color: "var(--color-success)", marginTop: "0.2rem", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?role=employer" className="btn-primary btn">
              Register your organisation <ArrowRight size={16} />
            </Link>
          </div>

          {/* Sample passport card */}
          <div className="card" style={{ padding: "1.75rem", maxWidth: "26rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-ink)" }}>Skill Passport</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-steel)" }}>[DEMO] Priya Sharma · Full-Stack Developer</div>
              </div>
              <div style={{ background: "var(--color-bone)", padding: "0.375rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", color: "var(--color-steel)", fontWeight: 600 }}>
                DEMO
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--color-steel-light)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { skill: "React", status: "Challenge verified", statusBg: "var(--color-brass)", statusColor: "var(--color-ink)", detail: "Mini SPA · 23/25 tests · 88/100", date: "Aug 2025" },
                { skill: "PostgreSQL", status: "Repository evidence", statusBg: "transparent", statusColor: "var(--color-steel)", border: "1px solid var(--color-steel)", detail: "Observed: schema migrations, indexes, joins", date: "Jul 2025" },
                { skill: "Node.js", status: "Employer reviewed", statusBg: "var(--color-success)", statusColor: "white", detail: "Reviewed by NexWave · REST API challenge", date: "Sep 2025" },
                { skill: "Docker", status: "Not assessed", statusBg: "transparent", statusColor: "#9aa3ae", border: "2px dashed #9aa3ae", detail: "No evidence found yet", date: "" },
              ].map(({ skill, status, statusBg, statusColor, border, detail, date }) => (
                <div key={skill} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ink)" }}>{skill}</span>
                      <span style={{ padding: "0.125rem 0.5rem", borderRadius: "999px", background: statusBg, color: statusColor, border: border || "none", fontSize: "0.7rem", fontWeight: 600 }}>
                        {status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{detail}</div>
                  </div>
                  {date && <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", whiteSpace: "nowrap", marginTop: "0.125rem" }}>{date}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-steel-light)", fontSize: "0.75rem", color: "var(--color-steel)" }}>
              ⚠ This is demo data, not a real person or real scores. Assessment dates are illustrative.
            </div>
          </div>
        </div>
      </section>

      {/* ── Security callout ──────────────────────────────────── */}
      <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-steel-light)", borderBottom: "1px solid var(--color-steel-light)", padding: "3rem 0" }}>
        <div className="page-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
            {[
              { icon: Shield, title: "Sandboxed execution", body: "—network none, read-only root, non-root user, CPU and memory limits, hard wall-clock kill" },
              { icon: Clock, title: "Honest dates always", body: "Every badge shows assessed date. Stale after 12 months. Never hide when evidence was collected." },
              { icon: Database, title: "Evidence not claims", body: "Rule-based observations and AI interpretations stay separate in data and in the UI." },
              { icon: Globe, title: "Consent-first sharing", body: "Employers see your passport only with explicit consent or a revocable share link you control." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ padding: "1rem" }}>
                <Icon size={24} style={{ color: "var(--color-ember)", marginBottom: "0.75rem" }} />
                <h4 style={{ marginBottom: "0.375rem", fontSize: "1rem" }}>{title}</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--color-steel)", lineHeight: 1.55 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--color-steel-light)", background: "var(--color-paper)", padding: "2.5rem 0" }}>
        <div className="page-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <div className="brand-mark" style={{ fontSize: "1.375rem" }}>F<span style={{ color: "var(--color-ember)" }}>O</span>RJ</div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-steel)", maxWidth: "36rem" }}>
            Built for Smart India Hackathon · Entrepreneurship &amp; Employment track ·{" "}
            <span style={{ color: "var(--color-ember)" }}>All demo data is clearly labelled and not real</span>
          </p>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8125rem", color: "var(--color-steel)" }}>
            <Link href="/auth/login">Sign in</Link>
            <Link href="/auth/signup">Sign up</Link>
            <Link href="/challenges">Challenges</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
