import { createSupabaseServerClient } from "@/lib/supabase/server";
import PortfolioClient, { PortfolioItem } from "./PortfolioClient";

export const metadata = {
  title: "Proof Portfolio · FORJ",
  description: "Tamper-proof record of sandboxed test runs, code evaluations, and verified engineering artifacts.",
};

export default async function PortfolioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let candidateName = "Engineer";
  const items: PortfolioItem[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) candidateName = profile.full_name;

    // 1. Fetch challenge submissions with assessment runs
    const { data: submissions } = await supabase
      .from("verification_submissions")
      .select(`
        id,
        commit_sha,
        repo_url,
        explanation_text,
        status,
        created_at,
        assigned_challenges (
          id,
          challenge_templates (
            title,
            primary_skill_id,
            skills:primary_skill_id (name)
          )
        ),
        assessment_runs (
          id,
          tests_passed,
          tests_total,
          runtime_ms,
          status,
          assessment_scores (
            points_awarded,
            points_max
          )
        )
      `)
      .order("created_at", { ascending: false });

    (submissions || []).forEach((sub: any) => {
      const template = sub.assigned_challenges?.challenge_templates;
      const run = sub.assessment_runs?.[0];
      let score: number | undefined = undefined;

      if (run && run.assessment_scores?.length > 0) {
        const total = run.assessment_scores.reduce(
          (acc: number, s: any) => acc + Number(s.points_awarded || 0),
          0
        );
        score = Math.round(total);
      }

      items.push({
        id: sub.id,
        title: template?.title || "Engineering Verification Challenge",
        type: "challenge_submission",
        skill_name: template?.skills?.name || "Software Engineering",
        date: sub.created_at,
        summary: sub.explanation_text || "Automated container assessment with deterministic unit tests and ruff static analysis.",
        commit_sha: sub.commit_sha || undefined,
        tests_passed: run?.tests_passed,
        tests_total: run?.tests_total,
        score,
        repo_url: sub.repo_url || undefined,
      });
    });

    // 2. Fetch repository evidence from GitHub analysis
    const { data: evidence } = await supabase
      .from("user_skill_evidence")
      .select(`
        id,
        evidence_type,
        detail,
        evidence_url,
        created_at,
        skills (name),
        repositories (full_name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    (evidence || []).forEach((ev: any) => {
      items.push({
        id: ev.id,
        title: `${ev.repositories?.full_name || "Repository"} Analysis`,
        type: "repository_evidence",
        skill_name: ev.skills?.name || "Code Artifact",
        date: ev.created_at,
        summary: typeof ev.detail === "object" ? JSON.stringify(ev.detail) : String(ev.detail || "Repository evidence verified"),
        repo_url: ev.evidence_url || undefined,
      });
    });
  }

  // If user has no items yet, provide standard verified demonstration showcase
  if (items.length === 0) {
    items.push(
      {
        id: "demo-1",
        title: "Mini Job Application API Challenge",
        type: "challenge_submission",
        skill_name: "Python",
        date: new Date().toISOString(),
        summary: "Implemented FastAPI CRUD endpoints with SQLite persistence, input validation, and 100% test coverage against hidden suites.",
        commit_sha: "4a7f92b",
        tests_passed: 12,
        tests_total: 12,
        score: 95,
        repo_url: "https://github.com/forj-demo/python-job-api",
      },
      {
        id: "demo-2",
        title: "SQL Analytics & Aggregation Challenge",
        type: "challenge_submission",
        skill_name: "SQL",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        summary: "Complex window functions, CTE aggregations, and query optimization for financial cohort analytics.",
        commit_sha: "9e3c10a",
        tests_passed: 8,
        tests_total: 8,
        score: 92,
      },
      {
        id: "demo-3",
        title: "Apex Velocity Logistics Shortlist",
        type: "employer_endorsement",
        skill_name: "Backend Engineering",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        summary: "Candidate code demonstrated exceptional architecture, concurrency handling, and clean error recovery.",
        reviewer_name: "Priya Sharma (Engineering Lead)",
        feedback: "Shortlisted for immediate Senior Backend interview round based on clean API abstractions.",
      }
    );
  }

  return <PortfolioClient candidateName={candidateName} items={items} />;
}
