import React from "react";
import crypto from "crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Code2,
  Calendar,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileCheck2,
} from "lucide-react";

export const metadata = {
  title: "Candidate Verified Skill Passport · FORJ",
  description: "Cryptographically verified skill credentials backed by isolated sandbox test suites and transparent rubrics.",
};

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) notFound();

  // Hash the raw 32-byte token using SHA-256
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const supabase = await createSupabaseServerClient();

  // 1. Validate the share link
  const { data: link, error: linkError } = await supabase
    .from("passport_share_links")
    .select(`
      id,
      passport_id,
      expires_at,
      revoked_at,
      view_count,
      created_at,
      skill_passports (
        id,
        user_id
      )
    `)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const now = new Date();
  const isInvalid = !link || link.revoked_at || new Date(link.expires_at) < now;

  if (isInvalid) {
    return (
      <div style={{ maxWidth: "700px", margin: "4rem auto", padding: "2rem" }}>
        <div
          className="card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background: "var(--color-paper)",
            border: "1px solid var(--color-danger)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(224, 90, 43, 0.12)",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
            Passport Access Unavailable
          </h1>
          <p style={{ color: "var(--color-steel)", lineHeight: 1.6, marginBottom: "2rem", fontSize: "0.95rem" }}>
            This cryptographic passport share link is invalid, has expired, or was revoked by the candidate.
            Please request a fresh share link from the candidate or apply directly through FORJ.
          </p>
          <Link href="/challenges" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Return to FORJ Console
          </Link>
        </div>
      </div>
    );
  }

  // 2. Audit the view in passport_views and increment view_count
  const {
    data: { user: viewerUser },
  } = await supabase.auth.getUser();

  await supabase.from("passport_views").insert({
    link_id: link.id,
    viewer_id: viewerUser?.id || null,
  });

  await supabase
    .from("passport_share_links")
    .update({ view_count: (link.view_count || 0) + 1 })
    .eq("id", link.id);

  // 3. Fetch candidate profile
  const candidateUserId = (link.skill_passports as any)?.user_id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, location, avatar_url")
    .eq("id", candidateUserId)
    .maybeSingle();

  // 4. Fetch candidate passport skills with assessment runs
  const { data: rawSkills } = await supabase
    .from("passport_skills")
    .select(`
      id,
      skill_id,
      level,
      score,
      verification_status,
      assessed_at,
      assessment_run_id,
      skills (
        id,
        name,
        category
      ),
      assessment_runs (
        id,
        tests_passed,
        tests_total,
        runtime_ms,
        status,
        assessment_scores (
          criterion,
          points_awarded,
          points_max,
          method,
          feedback,
          ai_generated
        )
      )
    `)
    .eq("passport_id", link.passport_id)
    .order("assessed_at", { ascending: false });

  // 5. Fetch repository evidence
  const { data: rawEvidence } = await supabase
    .from("passport_evidence")
    .select("*")
    .in(
      "passport_skill_id",
      (rawSkills || []).map((s: any) => s.id)
    );

  const evidenceMap = new Map<string, any[]>();
  (rawEvidence || []).forEach((ev: any) => {
    if (!evidenceMap.has(ev.passport_skill_id)) {
      evidenceMap.set(ev.passport_skill_id, []);
    }
    evidenceMap.get(ev.passport_skill_id)!.push(ev);
  });

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Top Verification Banner ──────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "2.5rem",
          background: "linear-gradient(135deg, var(--color-paper) 0%, var(--color-bone) 100%)",
          border: "1px solid var(--color-steel-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                background: "rgba(212, 163, 89, 0.2)",
                color: "var(--color-ink)",
                border: "1px solid var(--color-brass)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <ShieldCheck size={13} style={{ color: "var(--color-brass)" }} /> Verified Skill Passport
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>
              Authenticated via 256-bit Token
            </span>
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            {profile?.full_name || "Verified Candidate"}
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1.05rem", marginTop: "0.25rem" }}>
            {profile?.headline || "Software Engineer & Builder"} {profile?.location ? `• ${profile.location}` : ""}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem", fontSize: "0.8rem", color: "var(--color-steel)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Clock size={14} /> Link Expires: {new Date(link.expires_at).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>Audited Views: {link.view_count + 1}</span>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-steel-light)",
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
            Verification Trust Score
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ember)" }}>100% Deterministic</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-steel)", marginTop: "0.2rem" }}>
            Zero self-reported claims
          </div>
        </div>
      </div>

      {/* ─── Transparency Legend ─────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-steel-light)",
          borderRadius: "8px",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--color-ink)" }}>Verification Badge Hierarchy:</span>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#15803d", fontWeight: 700 }}>
            <CheckCircle2 size={13} /> Employer Reviewed (Green)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--color-ink)", fontWeight: 700, background: "var(--color-brass)", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
            <ShieldCheck size={13} /> Challenge Verified (Brass)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--color-ink)", border: "1px solid var(--color-steel)", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
            <Code2 size={13} /> Repo Evidence (Steel)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--color-steel)", border: "1px dashed var(--color-steel)", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
            Not Assessed (Dashed)
          </span>
        </div>
      </div>

      {/* ─── Credentials Breakdown ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-ink)" }}>Verified Skill Records</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {(rawSkills || []).map((skill: any) => {
            const isStale = new Date(skill.assessed_at) < twelveMonthsAgo;
            const evidence = evidenceMap.get(skill.id) || [];
            const assessment = skill.assessment_runs;

            return (
              <div
                key={skill.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-steel-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-steel)" }}>
                      {skill.skills?.category || "General"}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-ink)", marginTop: "0.15rem" }}>
                      {skill.skills?.name}
                    </h3>
                  </div>

                  <div>
                    {skill.verification_status === "employer_reviewed" && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(34, 197, 94, 0.15)", color: "#15803d", border: "1px solid #22c55e" }}>
                        Employer Reviewed
                      </span>
                    )}
                    {skill.verification_status === "challenge_verified" && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--color-brass)", color: "var(--color-ink)" }}>
                        Challenge Verified
                      </span>
                    )}
                    {skill.verification_status === "repository_evidence" && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--color-bone)", color: "var(--color-ink)", border: "1.5px solid var(--color-steel)" }}>
                        Repo Evidence
                      </span>
                    )}
                    {skill.verification_status === "not_assessed" && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--color-steel)", border: "1px dashed var(--color-steel)" }}>
                        Not Assessed
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: "var(--color-bone)", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-steel)" }}>
                    Assessed Level: <strong style={{ color: "var(--color-ink)" }}>{skill.level}/5</strong>
                  </span>
                  {skill.score !== null ? (
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-ink)" }}>
                      {Math.round(skill.score)}% Mastery
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Unscored</span>
                  )}
                </div>

                {/* Deterministic test summary if assessed */}
                {assessment && (
                  <div style={{ background: "rgba(212, 163, 89, 0.08)", padding: "0.75rem", borderRadius: "6px", border: "1px solid rgba(212, 163, 89, 0.3)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink)" }}>
                      Deterministic Sandbox Run:
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 700, marginTop: "0.2rem" }}>
                      ✓ {assessment.tests_passed} of {assessment.tests_total} Hidden Tests Passed
                    </div>
                  </div>
                )}

                {/* Evidence citations */}
                {evidence.length > 0 && (
                  <div style={{ fontSize: "0.78rem", color: "var(--color-steel)" }}>
                    <span style={{ fontWeight: 600 }}>Citations: </span>
                    {evidence.map((ev: any) => ev.summary).join("; ")}
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--color-steel-light)", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-steel)" }}>
                  <span>Assessed: {new Date(skill.assessed_at).toLocaleDateString()}</span>
                  {isStale && <span style={{ color: "var(--color-danger)", fontWeight: 700 }}>Stale (&gt;12m)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Security & Audit Footer ──────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "1.5rem 2rem",
          background: "var(--color-bone)",
          border: "1px solid var(--color-steel-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-ink)" }}>
            Cryptographic Integrity Guarantee
          </h4>
          <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.2rem" }}>
            Candidate code was evaluated in sandboxed containers with no network access, isolated memory, and audited test logs.
          </p>
        </div>
        <Link href="/challenges" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
          Verify Your Own Skills on FORJ
        </Link>
      </div>
    </div>
  );
}
