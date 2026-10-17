import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Briefcase,
  Code2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  Terminal,
  Database,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Practical Challenges · FORJ",
  description: "Take role-specific challenges to earn verified skill badges for your shareable Skill Passport.",
};

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ runtime?: string; difficulty?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const resolvedParams = await searchParams;

  // 1. Fetch challenge templates
  let query = supabase
    .from("challenge_templates")
    .select("*, skills(name, category)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (resolvedParams.runtime) {
    query = query.eq("runtime", resolvedParams.runtime);
  }
  if (resolvedParams.difficulty) {
    query = query.eq("difficulty", resolvedParams.difficulty);
  }

  const { data: templates } = await query;

  // 2. Fetch user's assigned challenges if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let assignedMap = new Map();
  if (user) {
    const { data: assigned } = await supabase
      .from("assigned_challenges")
      .select("*, verification_submissions(id, status, attempt_no)")
      .eq("user_id", user.id);

    if (assigned) {
      assigned.forEach((a) => assignedMap.set(a.template_id, a));
    }
  }

  const runtimes = [
    { label: "All Runtimes", value: "" },
    { label: "Python", value: "python" },
    { label: "PostgreSQL / SQL", value: "sql" },
    { label: "Node.js", value: "node" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Header ───────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-ember" style={{ textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            Skill Verification Engine
          </span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>•</span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>Practical Challenges</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
              Practical Skill Challenges
            </h1>
            <p style={{ color: "var(--color-steel)", fontSize: "1rem", margin: 0, maxWidth: "680px" }}>
              Complete role-specific engineering tasks evaluated inside isolated test sandboxes.
              Passing scores earn verified badges with transparent evidence in your <strong>Skill Passport</strong>.
            </p>
          </div>
          <Link href="/candidate/passport" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award size={16} />
            <span>My Skill Passport</span>
          </Link>
        </div>
      </div>

      {/* ─── Runtime Filter Pills ──────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {runtimes.map((r) => {
          const isActive = (resolvedParams.runtime || "") === r.value;
          return (
            <Link
              key={r.label}
              href={r.value ? `/challenges?runtime=${r.value}` : `/challenges`}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                border: isActive ? "1px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                background: isActive ? "var(--color-ember)" : "var(--color-paper)",
                color: isActive ? "#ffffff" : "var(--color-ink)",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* ─── Challenge Cards Grid ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {templates?.map((ch: any) => {
          const assigned = assignedMap.get(ch.id);
          const hasPassed = assigned?.status === "assessed";

          return (
            <div
              key={ch.id}
              className="card card-hover"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "var(--color-paper)",
                border: hasPassed ? "1px solid var(--color-brass)" : "1px solid var(--color-steel-light)",
              }}
            >
              <div>
                {/* Meta Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge badge-steel" style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>
                      {ch.runtime}
                    </span>
                    <span className="badge badge-brass" style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>
                      {ch.difficulty}
                    </span>
                  </div>
                  {hasPassed && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: "var(--color-brass)",
                        color: "var(--color-ink)",
                      }}
                    >
                      PASSED
                    </span>
                  )}
                </div>

                {/* Title & Primary Skill */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
                  {ch.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Primary Skill:</span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--color-steel)",
                      color: "var(--color-ink)",
                    }}
                  >
                    {ch.skills?.name || "Technical"}
                  </span>
                </div>

                <p style={{ fontSize: "0.875rem", color: "var(--color-steel)", marginBottom: "1.25rem", lineClamp: 3 }}>
                  {ch.brief_md?.split("\n")[2]?.replace(/^#*\s*/, "") || "Complete the implementation against automated hidden test suites."}
                </p>

                {/* Rubric Points Breakdown Preview */}
                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-steel)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Rubric Criteria (100 pts total):
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {ch.rubric?.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                        <span style={{ color: "var(--color-ink)" }}>{item.criterion}</span>
                        <span style={{ fontWeight: 600, color: "var(--color-ember)" }}>{item.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--color-steel-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--color-steel)" }}>
                  <Clock size={14} />
                  <span>{ch.time_limit_minutes} mins</span>
                  <span>•</span>
                  <span>Pass: {ch.pass_threshold}%</span>
                </div>

                <Link
                  href={`/challenges/${ch.slug}`}
                  className="btn btn-primary"
                  style={{
                    padding: "0.45rem 1rem",
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span>{assigned ? "Continue" : "Start Challenge"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
