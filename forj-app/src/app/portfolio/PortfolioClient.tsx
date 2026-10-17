"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Code2,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Download,
  Calendar,
  GitBranch,
  Terminal,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface PortfolioItem {
  id: string;
  title: string;
  type: "challenge_submission" | "repository_evidence" | "employer_endorsement";
  skill_name: string;
  date: string;
  summary: string;
  commit_sha?: string;
  tests_passed?: number;
  tests_total?: number;
  score?: number;
  repo_url?: string;
  reviewer_name?: string;
  feedback?: string;
}

export default function PortfolioClient({
  candidateName,
  items,
}: {
  candidateName: string;
  items: PortfolioItem[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const handleExportPortfolio = () => {
    setDownloading(true);
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            platform: "FORJ Proof-to-Opportunity Engine",
            candidate: candidateName,
            exported_at: new Date().toISOString(),
            artifacts: items,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `forj-proof-portfolio-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => setDownloading(false), 800);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
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
        <div style={{ maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
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
              Auditable Proof of Work
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Verified Code Artifacts</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            Proof Portfolio
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.3rem" }}>
            A tamper-proof ledger of practical challenges executed in isolated sandboxes, deterministic test reports,
            and repository codebase observations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handleExportPortfolio}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
          >
            <Download size={14} />
            <span>{downloading ? "Exporting..." : "Export Attestation"}</span>
          </button>
          <Link href="/challenges" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
            <Award size={14} />
            <span>Add Challenge Proof</span>
          </Link>
        </div>
      </div>

      {/* ─── Filter Tabs ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-steel-light)", paddingBottom: "0.75rem", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Artifacts" },
          { id: "challenge_submission", label: "Challenge Submissions" },
          { id: "repository_evidence", label: "Repository Evidence" },
          { id: "employer_endorsement", label: "Employer Endorsements" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              background: filter === tab.id ? "var(--color-ink)" : "transparent",
              color: filter === tab.id ? "var(--color-bone)" : "var(--color-steel)",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Artifacts List ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filteredItems.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center", background: "var(--color-paper)" }}>
            <FileCheck2 size={40} style={{ color: "var(--color-steel)", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-ink)" }}>No Artifacts Found</h3>
            <p style={{ color: "var(--color-steel)", fontSize: "0.9rem", marginTop: "0.3rem", marginBottom: "1.5rem" }}>
              Complete a practical verification challenge or connect your GitHub repositories to populate your portfolio.
            </p>
            <Link href="/challenges" className="btn btn-primary">
              Take Your First Challenge
            </Link>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: "1.75rem",
                background: "var(--color-paper)",
                border: "1px solid var(--color-steel-light)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          item.type === "challenge_submission"
                            ? "var(--color-brass)"
                            : item.type === "employer_endorsement"
                            ? "rgba(34, 197, 94, 0.15)"
                            : "var(--color-bone)",
                        color:
                          item.type === "employer_endorsement"
                            ? "#15803d"
                            : "var(--color-ink)",
                        border:
                          item.type === "repository_evidence"
                            ? "1px solid var(--color-steel)"
                            : "none",
                      }}
                    >
                      {item.type === "challenge_submission"
                        ? "Sandbox Challenge"
                        : item.type === "employer_endorsement"
                        ? "Employer Endorsed"
                        : "Repository Evidence"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-ink)" }}>
                      {item.skill_name}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ink)" }}>
                    {item.title}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {item.score !== undefined && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>Score</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-ember)" }}>{item.score}%</div>
                    </div>
                  )}
                </div>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--color-steel)", lineHeight: 1.6 }}>
                {item.summary}
              </p>

              {/* Technical Citations & Metadata */}
              <div
                style={{
                  background: "var(--color-bone)",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--color-steel)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={13} /> {new Date(item.date).toLocaleDateString()}
                  </span>

                  {item.commit_sha && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: "monospace" }}>
                      <GitBranch size={13} /> {item.commit_sha.slice(0, 7)} (Pinned SHA)
                    </span>
                  )}

                  {item.tests_passed !== undefined && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#15803d", fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> {item.tests_passed} / {item.tests_total} Tests Passed
                    </span>
                  )}
                </div>

                {item.repo_url && (
                  <a
                    href={item.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-ember)", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}
                  >
                    View Repo Source <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {item.feedback && (
                <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.82rem", color: "#15803d" }}>
                  <strong>Reviewer Endorsement: </strong>
                  {item.feedback}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
