"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Briefcase,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Code2,
  GitBranch,
  Layers,
  Check,
  FileCode,
  Terminal,
} from "lucide-react";

interface RoleProfile {
  id: string;
  name: string;
  description: string;
  weights: any;
}

interface EvidenceItem {
  id: string;
  skill_id: string;
  evidence_type: string;
  detail: string;
  evidence_url?: string;
  observed_by: "rule" | "ai_interpretation";
  confidence: number;
  created_at: string;
  skills?: { name: string; category: string };
  repositories?: { full_name: string };
}

interface Props {
  userId: string;
  roleProfiles: RoleProfile[];
  activeRoleId: string;
  report: any | null;
  allEvidence: EvidenceItem[];
}

export default function ReadinessReportClient({
  userId,
  roleProfiles,
  activeRoleId,
  report,
  allEvidence,
}: Props) {
  const router = useRouter();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const breakdown = report?.breakdown || null;
  const skillsList = breakdown?.skills || [];
  const dimensions = breakdown?.dimensions || {
    technical_skills: 0,
    project_quality: 0,
    testing_practices: 0,
    documentation: 0,
  };

  const activeRole = roleProfiles.find((r) => r.id === activeRoleId) || roleProfiles[0];

  function toggleExpand(skillId: string) {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
  }

  function handleRoleChange(roleId: string) {
    router.push(`/candidate/readiness?role=${roleId}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Breadcrumb & Title ─────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-steel" style={{ textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            Skill Intelligence
          </span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>•</span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>Readiness Report</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
              Skill Readiness Report
            </h1>
            <p style={{ color: "var(--color-steel)", fontSize: "1rem", margin: 0, maxWidth: "680px" }}>
              Evidence-backed skill audit extracted from your public codebases.
              Missing evidence is reported as <strong>not assessed</strong>, never zero.
            </p>
          </div>
          <Link href="/candidate/github" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <GitBranch size={16} />
            <span>Manage GitHub Connection</span>
          </Link>
        </div>
      </div>

      {/* ─── Role Switcher Tabs ─────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--color-steel-light)", paddingBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Select Target Role:
        </div>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {roleProfiles.map((role) => {
            const isActive = role.id === activeRoleId;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                  background: isActive ? "var(--color-ember)" : "var(--color-paper)",
                  color: isActive ? "#ffffff" : "var(--color-ink)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Proposed Weights Notice Banner ─────────────────────── */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          background: "rgba(212, 163, 89, 0.08)",
          border: "1px solid rgba(212, 163, 89, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={20} color="var(--color-brass)" />
          <div>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ink)" }}>
              Proposed Weights for {activeRole?.name || "Role"}:
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-ink)", marginLeft: "0.5rem" }}>
              Technical Skills: 35% · Project Quality: 30% · Testing Practices: 20% · Documentation: 15%
            </span>
          </div>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--color-steel)", fontStyle: "italic" }}>
          Repository analysis & challenge verification reported separately
        </span>
      </div>

      {!report ? (
        /* ─── Empty State ────────────────────────────────────────── */
        <div className="card" style={{ padding: "3rem", textAlign: "center", background: "var(--color-paper)" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(224, 90, 43, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              color: "var(--color-ember)",
            }}
          >
            <GitBranch size={32} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
            No Analysis Run for {activeRole?.name}
          </h3>
          <p style={{ color: "var(--color-steel)", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            Connect your public GitHub username to let the FORJ Worker extract verified skills, parse manifests, and compute your readiness.
          </p>
          <Link href="/candidate/github" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Connect GitHub & Run Analysis</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* ─── Overall Score & 4 Dimensions ─────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {/* Overall Score */}
            <div className="card" style={{ padding: "1.5rem", background: "var(--color-paper)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase" }}>
                Overall Readiness
              </span>
              <div style={{ margin: "0.75rem 0" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: 800, color: "var(--color-ink)", lineHeight: 1 }}>
                  {report.overall_score || 0}%
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--color-steel)" }}>
                Calculated from 4 weighted evidence dimensions
              </span>
            </div>

            {/* Technical Skills */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--color-paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>Technical Skills</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-ember)" }}>{dimensions.technical_skills}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--color-steel-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${dimensions.technical_skills}%`, height: "100%", background: "var(--color-ember)" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Weight: 35% · Role skill coverage</span>
            </div>

            {/* Project Quality */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--color-paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>Project Quality</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-brass)" }}>{dimensions.project_quality}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--color-steel-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${dimensions.project_quality}%`, height: "100%", background: "var(--color-brass)" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Weight: 30% · Codebase & structure</span>
            </div>

            {/* Testing Practices */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--color-paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>Testing & CI/CD</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#059669" }}>{dimensions.testing_practices}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--color-steel-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${dimensions.testing_practices}%`, height: "100%", background: "#059669" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Weight: 20% · Automated tests & CI</span>
            </div>

            {/* Documentation */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--color-paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>Documentation</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-ink)" }}>{dimensions.documentation}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--color-steel-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${dimensions.documentation}%`, height: "100%", background: "var(--color-ink)" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Weight: 15% · READMEs & architectures</span>
            </div>
          </div>

          {/* ─── Skills Breakdown Table ───────────────────────────── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                Role Skill Audit ({skillsList.length} skills evaluated)
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "12px", border: "1px solid var(--color-steel)", borderRadius: "2px" }} />
                  <span>Observed (Repo evidence)</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "12px", border: "1px dashed var(--color-steel)", borderRadius: "2px" }} />
                  <span>Not Assessed (Challenge needed)</span>
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--color-steel-light)" }}>
                    <th style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--color-steel)" }}>Skill</th>
                    <th style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--color-steel)" }}>Role Requirement</th>
                    <th style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--color-steel)" }}>Status</th>
                    <th style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--color-steel)" }}>Evidence</th>
                    <th style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--color-steel)", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {skillsList.map((skill: any) => {
                    const isObserved = skill.status === "observed";
                    const isExpanded = expandedSkill === skill.skill_id;
                    const items = skill.evidence_items || [];

                    return (
                      <React.Fragment key={skill.skill_id}>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--color-steel-light)",
                            background: isExpanded ? "rgba(0,0,0,0.015)" : "transparent",
                          }}
                        >
                          {/* Skill name */}
                          <td style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "var(--color-ink)" }}>
                            {skill.skill_name}
                          </td>

                          {/* Importance */}
                          <td style={{ padding: "1rem 1.25rem" }}>
                            {skill.importance >= 3 ? (
                              <span className="badge badge-ember" style={{ fontSize: "0.72rem" }}>Required</span>
                            ) : skill.importance === 2 ? (
                              <span className="badge badge-brass" style={{ fontSize: "0.72rem" }}>Important</span>
                            ) : (
                              <span className="badge badge-steel" style={{ fontSize: "0.72rem" }}>Nice to have</span>
                            )}
                          </td>

                          {/* Status Badge adhering to UI rules */}
                          <td style={{ padding: "1rem 1.25rem" }}>
                            {isObserved ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.25rem 0.6rem",
                                  borderRadius: "4px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  border: "1px solid var(--color-steel)", // Steel outline
                                  color: "var(--color-ink)",
                                  background: "transparent",
                                }}
                              >
                                <Check size={12} color="#059669" />
                                <span>Observed</span>
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.25rem 0.6rem",
                                  borderRadius: "4px",
                                  fontSize: "0.78rem",
                                  fontWeight: 500,
                                  border: "1px dashed var(--color-steel)", // Dashed Steel border
                                  color: "var(--color-steel)",
                                  background: "transparent",
                                }}
                              >
                                <span>Not assessed</span>
                              </span>
                            )}
                          </td>

                          {/* Evidence link / preview */}
                          <td style={{ padding: "1rem 1.25rem" }}>
                            {isObserved ? (
                              <button
                                onClick={() => toggleExpand(skill.skill_id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--color-ember)",
                                  fontSize: "0.82rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: 0,
                                }}
                              >
                                <span>{items.length} evidence {items.length === 1 ? "point" : "points"}</span>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.8rem", color: "var(--color-steel)", fontStyle: "italic" }}>
                                No public repo evidence
                              </span>
                            )}
                          </td>

                          {/* Next Action */}
                          <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                            {!isObserved ? (
                              <Link
                                href="/challenges"
                                className="btn btn-primary"
                                style={{
                                  padding: "0.3rem 0.75rem",
                                  fontSize: "0.75rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <span>Verify via Challenge</span>
                                <ArrowRight size={12} />
                              </Link>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 500 }}>
                                Verified in Code
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Evidence Drawer */}
                        {isExpanded && items.length > 0 && (
                          <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                            <td colSpan={5} style={{ padding: "1rem 1.5rem" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase" }}>
                                  Evidence Records:
                                </span>
                                {items.map((ev: any, idx: number) => (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: "0.75rem 1rem",
                                      borderRadius: "6px",
                                      background: "var(--color-paper)",
                                      border: "1px solid var(--color-steel-light)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      fontSize: "0.82rem",
                                      gap: "1rem",
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                      {/* Rule vs AI badge */}
                                      {ev.observed_by === "ai_interpretation" ? (
                                        <span
                                          style={{
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            padding: "0.15rem 0.4rem",
                                            borderRadius: "3px",
                                            background: "rgba(212, 163, 89, 0.2)",
                                            color: "var(--color-ink)",
                                          }}
                                        >
                                          AI-generated
                                        </span>
                                      ) : (
                                        <span
                                          style={{
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            padding: "0.15rem 0.4rem",
                                            borderRadius: "3px",
                                            background: "rgba(0, 0, 0, 0.05)",
                                            color: "var(--color-steel)",
                                          }}
                                        >
                                          Rule-verified
                                        </span>
                                      )}
                                      <span style={{ color: "var(--color-ink)" }}>{ev.detail}</span>
                                    </div>

                                    {ev.evidence_url && (
                                      <a
                                        href={ev.evidence_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          color: "var(--color-ember)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                          textDecoration: "none",
                                          fontSize: "0.75rem",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <span>View Code</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Recommended Next Actions Drawer ─────────────────── */}
          {breakdown.next_actions && breakdown.next_actions.length > 0 && (
            <div
              className="card"
              style={{
                padding: "1.75rem",
                background: "var(--color-paper)",
                border: "1px solid var(--color-steel-light)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="var(--color-ember)" />
                <span>Recommended Verification Actions</span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", margin: "0 0 1rem" }}>
                Complete a role-specific practical challenge to turn unassessed skills into verified badges in your shareable Skill Passport.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {breakdown.next_actions.map((act: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid var(--color-steel-light)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span className="badge badge-ember" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>
                        Skill Gap: {act.skill_name}
                      </span>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-ink)", margin: "0 0 0.75rem" }}>
                        {act.recommendation}
                      </p>
                    </div>
                    <Link
                      href="/challenges"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                    >
                      <span>Find {act.skill_name} Challenge</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
