"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Code2,
  GitBranch,
  Calendar,
  Sparkles,
  User,
  Check,
  X,
  FileText,
  Search,
} from "lucide-react";

export interface ReviewSubmission {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  challenge_title: string;
  skill_id: string;
  skill_name: string;
  submitted_at: string;
  repo_url?: string;
  commit_sha?: string;
  explanation_text: string;
  tests_passed: number;
  tests_total: number;
  runtime_ms: number;
  score: number;
  status: "submitted" | "shortlisted" | "rejected";
  integrity_signals: Array<{
    type: string;
    severity: "info" | "warn";
    message: string;
  }>;
}

export default function ApplicationsClient({
  submissions: initialSubmissions,
}: {
  submissions: ReviewSubmission[];
}) {
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<ReviewSubmission | null>(
    initialSubmissions[0] || null
  );
  const [feedback, setFeedback] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleEndorse = async (sub: ReviewSubmission) => {
    setProcessingId(sub.id);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/candidate/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_user_id: sub.candidate_id,
          skill_id: sub.skill_id,
          feedback: feedback || "Verified code quality, test rigor, and production-ready architectural decisions.",
          challenge_title: sub.challenge_title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to endorse candidate");

      setSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status: "shortlisted" } : s))
      );
      if (selectedSub?.id === sub.id) {
        setSelectedSub((prev) => (prev ? { ...prev, status: "shortlisted" } : null));
      }
      setActionSuccess(`Candidate ${sub.candidate_name} shortlisted! Skill [${sub.skill_name}] promoted to "Employer Reviewed" on their passport.`);
      setFeedback("");
    } catch (err: any) {
      alert(err.message || "Error endorsing submission");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (subId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: "rejected" } : s))
    );
    if (selectedSub?.id === subId) {
      setSelectedSub((prev) => (prev ? { ...prev, status: "rejected" } : null));
    }
  };

  return (
    <div style={{ maxWidth: "1250px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Hero Header ─────────────────────────────────────────── */}
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
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                background: "rgba(34, 197, 94, 0.15)",
                color: "#15803d",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Reviewer & Employer Console
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Verified Submission Audit</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            Submissions & Review
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.3rem" }}>
            Audit candidate code in isolated containers, examine integrity flags, and endorse qualified solutions.
            Shortlisting upgrades the candidate&apos;s Skill Passport status to <strong style={{ color: "#15803d" }}>Employer Reviewed</strong>.
          </p>
        </div>

        <div style={{ background: "var(--color-paper)", padding: "1rem 1.5rem", borderRadius: "8px", border: "1px solid var(--color-steel-light)", textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
            Pending Queue
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ember)" }}>
            {submissions.filter((s) => s.status === "submitted").length} Submissions
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: "1rem", background: "rgba(34, 197, 94, 0.12)", border: "1px solid #22c55e", borderRadius: "6px", color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ─── Split Screen: Submissions Queue + Detailed Audit View ──── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Left Column: List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
            Candidate Submissions
          </h3>

          {submissions.map((sub) => {
            const isSelected = selectedSub?.id === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className="card"
                style={{
                  padding: "1.25rem",
                  background: isSelected ? "var(--color-bone)" : "var(--color-paper)",
                  border: isSelected ? "2px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)" }}>
                      {sub.candidate_name}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{sub.candidate_email}</span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      background:
                        sub.status === "shortlisted"
                          ? "rgba(34, 197, 94, 0.15)"
                          : sub.status === "rejected"
                          ? "rgba(224, 90, 43, 0.15)"
                          : "var(--color-bone)",
                      color:
                        sub.status === "shortlisted"
                          ? "#15803d"
                          : sub.status === "rejected"
                          ? "var(--color-danger)"
                          : "var(--color-steel)",
                      border: "1px solid currentColor",
                      textTransform: "capitalize",
                    }}
                  >
                    {sub.status}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>
                  {sub.challenge_title}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--color-steel)", marginTop: "0.25rem" }}>
                  <span style={{ color: "#15803d", fontWeight: 700 }}>
                    ✓ {sub.tests_passed}/{sub.tests_total} Tests
                  </span>
                  <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Audit & Endorsement Panel */}
        {selectedSub ? (
          <div
            className="card"
            style={{
              padding: "2rem",
              background: "var(--color-paper)",
              border: "1px solid var(--color-steel-light)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                  Submission Audit Dossier
                </span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-ink)", marginTop: "0.2rem" }}>
                  {selectedSub.challenge_title}
                </h2>
                <div style={{ fontSize: "0.9rem", color: "var(--color-steel)", marginTop: "0.25rem" }}>
                  Candidate: <strong style={{ color: "var(--color-ink)" }}>{selectedSub.candidate_name}</strong> ({selectedSub.candidate_email})
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>Deterministic Score</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ember)" }}>{selectedSub.score}%</div>
              </div>
            </div>

            {/* Integrity Signals (Visible ONLY to Reviewers) */}
            <div
              style={{
                background: "rgba(212, 163, 89, 0.1)",
                border: "1px solid var(--color-brass)",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldAlert size={14} style={{ color: "var(--color-ember)" }} />
                Integrity Signals (Reviewer Eyes Only • Never Auto-Rejects)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
                {selectedSub.integrity_signals.map((sig, idx) => (
                  <div key={idx} style={{ fontSize: "0.8rem", color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span
                      style={{
                        padding: "0.1rem 0.35rem",
                        borderRadius: "3px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        background: sig.severity === "warn" ? "rgba(224, 90, 43, 0.15)" : "var(--color-bone)",
                        color: sig.severity === "warn" ? "var(--color-danger)" : "var(--color-steel)",
                      }}
                    >
                      {sig.severity.toUpperCase()}
                    </span>
                    <span>{sig.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Run Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              <div style={{ background: "var(--color-bone)", padding: "0.75rem", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", textTransform: "uppercase" }}>Tests Passed</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#15803d" }}>
                  {selectedSub.tests_passed} / {selectedSub.tests_total}
                </div>
              </div>
              <div style={{ background: "var(--color-bone)", padding: "0.75rem", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", textTransform: "uppercase" }}>Execution Time</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-ink)" }}>
                  {selectedSub.runtime_ms} ms
                </div>
              </div>
              <div style={{ background: "var(--color-bone)", padding: "0.75rem", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--color-steel)", textTransform: "uppercase" }}>Pinned Commit</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-ink)", fontFamily: "monospace" }}>
                  {selectedSub.commit_sha?.slice(0, 7) || "b72e10a"}
                </div>
              </div>
            </div>

            {/* Candidate Written Explanation */}
            <div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
                Candidate Technical Explanation
              </h4>
              <div
                style={{
                  background: "var(--color-bone)",
                  padding: "1rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  color: "var(--color-ink)",
                  lineHeight: 1.6,
                }}
              >
                {selectedSub.explanation_text}
              </div>
            </div>

            {/* Endorsement Form */}
            <div style={{ borderTop: "1px solid var(--color-steel-light)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-ink)" }}>
                Employer Reviewer Action
              </h4>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional reviewer notes: 'Demonstrated exceptional error handling and clean data models...'"
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-steel-light)",
                  background: "var(--color-bone)",
                  fontSize: "0.85rem",
                  color: "var(--color-ink)",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  onClick={() => handleReject(selectedSub.id)}
                  className="btn btn-secondary"
                  style={{ color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}
                >
                  <X size={14} /> Pass / Archive
                </button>
                <button
                  onClick={() => handleEndorse(selectedSub)}
                  disabled={processingId === selectedSub.id || selectedSub.status === "shortlisted"}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
                >
                  {processingId === selectedSub.id ? (
                    "Processing..."
                  ) : selectedSub.status === "shortlisted" ? (
                    <>
                      <Check size={14} /> Shortlisted & Endorsed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Shortlist & Endorse Passport
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: "3rem", textAlign: "center", background: "var(--color-paper)" }}>
            Select a candidate submission to review sandbox execution details.
          </div>
        )}
      </div>
    </div>
  );
}
