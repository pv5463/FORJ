"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Code2,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from "lucide-react";

export interface PassportSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  category: string;
  level: number;
  score: number | null;
  verification_status: "not_assessed" | "repository_evidence" | "challenge_verified" | "employer_reviewed";
  assessed_at: string;
  is_stale: boolean;
  assessment_run_id?: string | null;
  assessment_details?: {
    challenge_title: string;
    tests_passed: number;
    tests_total: number;
    runtime_ms: number;
    rubric_scores: Array<{
      criterion: string;
      points_awarded: number;
      points_max: number;
      method: string;
      ai_generated: boolean;
      feedback?: string;
    }>;
  } | null;
  evidence?: Array<{
    id: string;
    evidence_type: string;
    summary: string;
    url: string | null;
  }>;
}

export interface ShareLink {
  id: string;
  expires_at: string;
  revoked_at: string | null;
  view_count: number;
  created_at: string;
  token_raw?: string;
}

interface PassportClientProps {
  passportId: string;
  userId: string;
  userName: string;
  skills: PassportSkill[];
  shareLinks: ShareLink[];
}

export default function PassportClient({
  passportId,
  userId,
  userName,
  skills: initialSkills,
  shareLinks: initialShareLinks,
}: PassportClientProps) {
  const [skills, setSkills] = useState<PassportSkill[]>(initialSkills);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(initialShareLinks);
  const [selectedSkill, setSelectedSkill] = useState<PassportSkill | null>(null);

  // Share link modal / generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Counts
  const verifiedCount = skills.filter((s) => s.verification_status === "challenge_verified" || s.verification_status === "employer_reviewed").length;
  const repoCount = skills.filter((s) => s.verification_status === "repository_evidence").length;
  const notAssessedCount = skills.filter((s) => s.verification_status === "not_assessed").length;

  const handleCreateShareLink = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/candidate/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_link",
          expiry_days: expiryDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate link");

      const fullUrl = `${window.location.origin}${data.share_url}`;
      setNewShareUrl(fullUrl);
      setSuccessMsg(`Secure 32-byte cryptographic link created. Valid for ${expiryDays} days.`);

      // Add to share links list
      setShareLinks((prev) => [
        {
          id: data.link_id,
          expires_at: data.expires_at,
          revoked_at: null,
          view_count: 0,
          created_at: new Date().toISOString(),
          token_raw: data.token,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create share link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeShareLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to revoke this share link? Employers holding this link will immediately lose access.")) return;
    try {
      const res = await fetch("/api/candidate/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke_link",
          link_id: linkId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke link");

      setShareLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, revoked_at: new Date().toISOString() } : l))
      );
      if (newShareUrl && newShareUrl.includes(linkId)) {
        setNewShareUrl(null);
      }
      setSuccessMsg("Share link revoked.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to revoke share link");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const renderBadge = (status: PassportSkill["verification_status"]) => {
    switch (status) {
      case "employer_reviewed":
        return (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "rgba(34, 197, 94, 0.15)",
              color: "#15803d",
              border: "1px solid #22c55e",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <CheckCircle2 size={12} /> Employer Reviewed
          </span>
        );
      case "challenge_verified":
        return (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "var(--color-brass)",
              color: "var(--color-ink)",
              border: "1px solid rgba(0,0,0,0.1)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <ShieldCheck size={12} /> Challenge Verified
          </span>
        );
      case "repository_evidence":
        return (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "var(--color-bone)",
              color: "var(--color-ink)",
              border: "1.5px solid var(--color-steel)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Code2 size={12} /> Repository Evidence
          </span>
        );
      case "not_assessed":
      default:
        return (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "var(--color-bone)",
              color: "var(--color-steel)",
              border: "1px dashed var(--color-steel)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            Not Assessed
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "2rem",
          background: "linear-gradient(135deg, var(--color-paper) 0%, var(--color-bone) 100%)",
          border: "1px solid var(--color-steel-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                background: "rgba(224, 90, 43, 0.12)",
                color: "var(--color-ember)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Proof-to-Opportunity Engine
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Candidate Verified Passport</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Skill Passport
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6 }}>
            Every badge is backed by cryptographic evidence, deterministic test suites, or employer endorsements.
            Missing evidence is strictly <strong style={{ color: "var(--color-ink)" }}>not assessed</strong>, never zero.
          </p>
        </div>

        {/* Passport Stats Summary */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            background: "var(--color-paper)",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--color-steel-light)",
          }}
        >
          <div style={{ textAlign: "center", paddingRight: "1rem", borderRight: "1px solid var(--color-steel-light)" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ember)" }}>{verifiedCount}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase" }}>Verified</div>
          </div>
          <div style={{ textAlign: "center", paddingRight: "1rem", borderRight: "1px solid var(--color-steel-light)" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ink)" }}>{repoCount}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase" }}>Repo Evidence</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-steel)" }}>{notAssessedCount}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-steel)", textTransform: "uppercase" }}>Not Assessed</div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div style={{ padding: "1rem", background: "rgba(224, 90, 43, 0.1)", border: "1px solid var(--color-danger)", borderRadius: "6px", color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "1rem", background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", borderRadius: "6px", color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── Share Link Manager ───────────────────────────────────── */}
      <div className="card" style={{ padding: "1.75rem", background: "var(--color-paper)", border: "1px solid var(--color-steel-light)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Share2 size={20} style={{ color: "var(--color-ember)" }} />
              Employer Share Link Manager
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", marginTop: "0.2rem" }}>
              Generate time-limited 32-byte cryptographic tokens to share verified evidence with employers and recruiters without revealing private code.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--color-steel-light)",
                background: "var(--color-bone)",
                fontSize: "0.85rem",
                color: "var(--color-ink)",
              }}
            >
              <option value={7}>Valid for 7 days</option>
              <option value={30}>Valid for 30 days (Default)</option>
              <option value={90}>Valid for 90 days</option>
            </select>

            <button
              onClick={handleCreateShareLink}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
            >
              {isGenerating ? <RefreshCw size={14} className="spin" /> : <PlusCircle size={14} />}
              Generate Secure Link
            </button>
          </div>
        </div>

        {/* Recently generated link banner */}
        {newShareUrl && (
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(212, 163, 89, 0.12)",
              border: "1px solid var(--color-brass)",
              borderRadius: "6px",
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink)", textTransform: "uppercase" }}>
                Active Share Token Ready
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-ink)", fontFamily: "monospace", marginTop: "0.2rem" }}>
                {newShareUrl}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(newShareUrl)}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
            >
              {copiedLink ? <Check size={14} style={{ color: "#15803d" }} /> : <Copy size={14} />}
              {copiedLink ? "Copied!" : "Copy URL"}
            </button>
          </div>
        )}

        {/* Active Links Table */}
        {shareLinks.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--color-steel)", fontSize: "0.85rem", background: "var(--color-bone)", borderRadius: "6px" }}>
            No active share links. Generate a link above to share your verified credentials with employers.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-steel-light)", textAlign: "left", color: "var(--color-steel)" }}>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Created</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Expires</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Views</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shareLinks.map((link) => {
                  const isRevoked = !!link.revoked_at;
                  const isExpired = new Date(link.expires_at) < new Date();
                  return (
                    <tr key={link.id} style={{ borderBottom: "1px solid var(--color-steel-light)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--color-ink)" }}>
                        {new Date(link.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.75rem", color: "var(--color-steel)" }}>
                        {new Date(link.expires_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.75rem", color: "var(--color-ink)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Eye size={12} style={{ color: "var(--color-steel)" }} />
                          {link.view_count} views
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {isRevoked ? (
                          <span style={{ fontSize: "0.72rem", color: "var(--color-danger)", fontWeight: 600 }}>Revoked</span>
                        ) : isExpired ? (
                          <span style={{ fontSize: "0.72rem", color: "var(--color-steel)", fontWeight: 600 }}>Expired</span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 600 }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        {!isRevoked && !isExpired && (
                          <button
                            onClick={() => handleRevokeShareLink(link.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-danger)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Trash2 size={12} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Skill Cards Grid ─────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-ink)" }}>Passport Credentials</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
              Select any skill to inspect the exact sandbox test run, rubric scores, and repository citations.
            </p>
          </div>

          <Link href="/challenges" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
            <span>Explore Challenges</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {skills.map((skill) => {
            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="card"
                style={{
                  padding: "1.5rem",
                  background: "var(--color-paper)",
                  border: selectedSkill?.id === skill.id ? "2px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-steel)", letterSpacing: "0.05em" }}>
                      {skill.category}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-ink)", marginTop: "0.15rem" }}>
                      {skill.skill_name}
                    </h3>
                  </div>

                  <div>{renderBadge(skill.verification_status)}</div>
                </div>

                {/* Level + Score Indicator */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-bone)", padding: "0.5rem 0.75rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        style={{
                          width: "8px",
                          height: "12px",
                          borderRadius: "2px",
                          background: lvl <= skill.level ? "var(--color-brass)" : "var(--color-steel-light)",
                        }}
                      />
                    ))}
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-steel)", marginLeft: "0.4rem" }}>
                      Level {skill.level}/5
                    </span>
                  </div>

                  {skill.score !== null ? (
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-ink)" }}>
                      {Math.round(skill.score)}% Score
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>Not Scored</span>
                  )}
                </div>

                {/* Date & Staleness */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--color-steel)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={12} />
                    {new Date(skill.assessed_at).toLocaleDateString()}
                  </span>

                  {skill.is_stale && (
                    <span style={{ color: "var(--color-danger)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <Clock size={12} /> Stale (&gt;12m)
                    </span>
                  )}
                </div>

                {/* Call to action */}
                <div style={{ borderTop: "1px solid var(--color-steel-light)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ color: "var(--color-ember)", fontWeight: 600 }}>Click to inspect proof</span>
                  {skill.verification_status !== "challenge_verified" && skill.verification_status !== "employer_reviewed" && (
                    <Link
                      href="/challenges"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "var(--color-steel)", textDecoration: "underline" }}
                    >
                      Verify via challenge
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Evidence Breakdown Drawer / Modal ────────────────────── */}
      {selectedSkill && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 100,
          }}
          onClick={() => setSelectedSkill(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "var(--color-paper)",
              height: "100%",
              overflowY: "auto",
              padding: "2rem",
              boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                  Skill Verification Proof
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-ink)", marginTop: "0.2rem" }}>
                  {selectedSkill.skill_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-steel)" }}
              >
                ×
              </button>
            </div>

            <div>{renderBadge(selectedSkill.verification_status)}</div>

            {/* Assessment Details if Challenge Verified */}
            {selectedSkill.assessment_details ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ background: "var(--color-bone)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-steel-light)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                    Verified Sandbox Assessment
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", marginTop: "0.2rem" }}>
                    {selectedSkill.assessment_details.challenge_title}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
                    <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", textTransform: "uppercase" }}>Deterministic Tests</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#15803d" }}>
                        {selectedSkill.assessment_details.tests_passed} / {selectedSkill.assessment_details.tests_total} Passed
                      </div>
                    </div>
                    <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", textTransform: "uppercase" }}>Sandbox Walltime</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-ink)" }}>
                        {selectedSkill.assessment_details.runtime_ms} ms
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rubric Breakdown */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
                    Rubric Breakdown & Explanation
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {selectedSkill.assessment_details.rubric_scores.map((rubric, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--color-bone)",
                          padding: "0.85rem 1rem",
                          borderRadius: "6px",
                          border: "1px solid var(--color-steel-light)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-ink)" }}>
                            {rubric.criterion}
                          </span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-ember)" }}>
                            {rubric.points_awarded} / {rubric.points_max} pts
                          </span>
                        </div>
                        {rubric.ai_generated && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem", fontSize: "0.68rem", color: "var(--color-brass)", fontWeight: 700 }}>
                            <Sparkles size={10} /> AI-generated Evaluation
                          </div>
                        )}
                        {rubric.feedback && (
                          <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.4rem", lineHeight: 1.5 }}>
                            {rubric.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedSkill.evidence && selectedSkill.evidence.length > 0 ? (
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
                  Repository & Static Analysis Evidence
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {selectedSkill.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        background: "var(--color-bone)",
                        padding: "1rem",
                        borderRadius: "6px",
                        border: "1px solid var(--color-steel-light)",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                        {ev.evidence_type}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-ink)", marginTop: "0.25rem" }}>
                        {ev.summary}
                      </p>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-ember)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          View Repository Source <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-bone)", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--color-steel)", marginBottom: "1rem" }}>
                  No verified proof has been submitted for {selectedSkill.skill_name} yet. Complete a practical challenge to upgrade this badge.
                </p>
                <Link href="/challenges" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  Take {selectedSkill.skill_name} Challenge
                </Link>
              </div>
            )}

            <div style={{ marginTop: "auto", borderTop: "1px solid var(--color-steel-light)", paddingTop: "1rem" }}>
              <button onClick={() => setSelectedSkill(null)} className="btn btn-secondary" style={{ width: "100%" }}>
                Close Evidence Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
