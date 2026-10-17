"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Building,
  MapPin,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  Check,
} from "lucide-react";

export interface OpportunityMatch {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  type: string;
  stipend: string;
  total_score: number;
  breakdown: {
    required_coverage: number; // out of 45
    optional_coverage: number; // out of 15
    level_fit: number; // out of 15
    verified_evidence: number; // out of 25
  };
  explanation: string;
  missing_skills: string[];
  verified_skills: string[];
  recommended_challenge?: {
    slug: string;
    title: string;
    potential_boost: number;
  } | null;
}

export default function MatchesClient({
  matches,
  candidateName,
  hasPassportSkills,
}: {
  matches: OpportunityMatch[];
  candidateName: string;
  hasPassportSkills: boolean;
}) {
  const [selectedMatch, setSelectedMatch] = useState<OpportunityMatch | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [minScoreFilter, setMinScoreFilter] = useState(50);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const filteredMatches = matches.filter((m) => m.total_score >= minScoreFilter);

  const handleApply = (id: string) => {
    setAppliedIds((prev) => new Set(prev).add(id));
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
              Evidence-Backed Matching
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Zero Keyword Guesswork</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            Opportunity Matches
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.3rem" }}>
            Matches are computed in real time from your verified Skill Passport credentials.
            Scores reflect verified code evidence, test coverage, and difficulty level fit.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
        >
          <HelpCircle size={15} />
          <span>Inspect Match Formula</span>
        </button>
      </div>

      {!hasPassportSkills && (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(212, 163, 89, 0.15)",
            border: "1px solid var(--color-brass)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertCircle size={20} style={{ color: "var(--color-ink)" }} />
            <span style={{ fontSize: "0.9rem", color: "var(--color-ink)", fontWeight: 600 }}>
              You haven&apos;t verified any skills yet. Take a challenge or connect GitHub to boost your match scores by up to 40%.
            </span>
          </div>
          <Link href="/challenges" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            Take Practical Challenge
          </Link>
        </div>
      )}

      {/* ─── Controls & Filters ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "var(--color-paper)",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--color-steel-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Filter size={15} /> Minimum Match Score:
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[40, 50, 65, 80].map((score) => (
              <button
                key={score}
                onClick={() => setMinScoreFilter(score)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: minScoreFilter === score ? "1.5px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                  background: minScoreFilter === score ? "rgba(224, 90, 43, 0.1)" : "var(--color-bone)",
                  color: minScoreFilter === score ? "var(--color-ember)" : "var(--color-steel)",
                  cursor: "pointer",
                }}
              >
                {score}%+
              </button>
            ))}
          </div>
        </div>

        <span style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
          Showing <strong>{filteredMatches.length}</strong> verified opportunities
        </span>
      </div>

      {/* ─── Matches List ────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filteredMatches.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center", background: "var(--color-paper)" }}>
            <p style={{ color: "var(--color-steel)", fontSize: "1rem", marginBottom: "1rem" }}>
              No matches found for a minimum score of {minScoreFilter}%. Try lowering the filter or verifying additional skills.
            </p>
            <button onClick={() => setMinScoreFilter(40)} className="btn btn-secondary">
              Reset Filter to 40%
            </button>
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isApplied = appliedIds.has(m.id);
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: "1.75rem",
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-steel-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        background: "var(--color-bone)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--color-steel-light)",
                        color: "var(--color-ember)",
                      }}
                    >
                      <Building size={24} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ink)" }}>{m.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.2rem", fontSize: "0.85rem", color: "var(--color-steel)", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{m.company_name}</span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <MapPin size={13} /> {m.location}
                        </span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <DollarSign size={13} /> {m.stipend}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Indicator */}
                  <div
                    style={{
                      background: "var(--color-bone)",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-steel-light)",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                      Evidence Fit
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: m.total_score >= 75 ? "var(--color-ember)" : "var(--color-brass)" }}>
                      {m.total_score}%
                    </div>
                  </div>
                </div>

                {/* Score Formula Mini-Bar */}
                <div style={{ background: "var(--color-bone)", padding: "0.75rem 1rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-steel)", marginBottom: "0.4rem" }}>
                    <span>Req Coverage: <strong>{m.breakdown.required_coverage}/45</strong></span>
                    <span>Opt Coverage: <strong>{m.breakdown.optional_coverage}/15</strong></span>
                    <span>Level Fit: <strong>{m.breakdown.level_fit}/15</strong></span>
                    <span>Evidence Trust: <strong>{m.breakdown.verified_evidence}/25</strong></span>
                  </div>

                  {/* Progress segment */}
                  <div style={{ height: "6px", width: "100%", background: "var(--color-steel-light)", borderRadius: "3px", overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${(m.breakdown.required_coverage / 45) * 45}%`, background: "var(--color-ember)" }} />
                    <div style={{ width: `${(m.breakdown.optional_coverage / 15) * 15}%`, background: "var(--color-brass)" }} />
                    <div style={{ width: `${(m.breakdown.level_fit / 15) * 15}%`, background: "var(--color-steel)" }} />
                    <div style={{ width: `${(m.breakdown.verified_evidence / 25) * 25}%`, background: "#15803d" }} />
                  </div>
                </div>

                {/* Algorithmic Reason */}
                <div style={{ background: "rgba(0,0,0,0.02)", padding: "0.75rem 1rem", borderRadius: "6px", borderLeft: "3px solid var(--color-ember)", fontSize: "0.85rem", color: "var(--color-ink)", lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: "var(--color-ember)" }}>Match Explanation: </span>
                  {m.explanation}
                </div>

                {/* Missing skill booster */}
                {m.recommended_challenge && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(212, 163, 89, 0.12)", padding: "0.6rem 1rem", borderRadius: "6px", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--color-ink)" }}>
                      💡 Recommended: Take <strong>{m.recommended_challenge.title}</strong> to boost your match score by <strong>+{m.recommended_challenge.potential_boost}%</strong>
                    </span>
                    <Link
                      href={`/challenges`}
                      style={{ color: "var(--color-ember)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                    >
                      Start Challenge <ArrowRight size={12} />
                    </Link>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--color-steel-light)", paddingTop: "1rem" }}>
                  <Link href="/candidate/passport" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                    View Passport Shared
                  </Link>
                  <button
                    onClick={() => handleApply(m.id)}
                    disabled={isApplied}
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    {isApplied ? (
                      <>
                        <Check size={14} /> Applied with Passport
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> 1-Click Apply with Passport
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Formula Explanation Modal ───────────────────────────── */}
      {showFormulaModal && (
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
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
          onClick={() => setShowFormulaModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "var(--color-paper)",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-ink)" }}>
                Evidence Matching Formula
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-steel)" }}
              >
                ×
              </button>
            </div>

            <p style={{ color: "var(--color-steel)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              The FORJ engine eliminates hiring bias by scoring candidates strictly on objective proof and cryptographic evidence:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ padding: "0.75rem", background: "var(--color-bone)", borderRadius: "6px" }}>
                <strong style={{ color: "var(--color-ember)" }}>1. Required Skill Coverage (45 pts):</strong> Percentage of mandatory role skills present on your passport.
              </div>
              <div style={{ padding: "0.75rem", background: "var(--color-bone)", borderRadius: "6px" }}>
                <strong style={{ color: "var(--color-brass)" }}>2. Optional Skill Coverage (15 pts):</strong> Bonus points for nice-to-have technologies.
              </div>
              <div style={{ padding: "0.75rem", background: "var(--color-bone)", borderRadius: "6px" }}>
                <strong style={{ color: "var(--color-ink)" }}>3. Skill Level Fit (15 pts):</strong> Alignment between candidate assessed level and role minimums.
              </div>
              <div style={{ padding: "0.75rem", background: "var(--color-bone)", borderRadius: "6px" }}>
                <strong style={{ color: "#15803d" }}>4. Verified Evidence Multiplier (25 pts):</strong>
                <ul style={{ marginTop: "0.4rem", paddingLeft: "1.2rem", color: "var(--color-steel)" }}>
                  <li>Employer Reviewed: 1.0 weight</li>
                  <li>Challenge Verified: 0.8 weight</li>
                  <li>Repository Evidence: 0.3 weight</li>
                  <li>Not Assessed: 0 weight (evidence missing is never negative)</li>
                  <li>Stale records (&gt;12 months) receive a 0.7x decay factor.</li>
                </ul>
              </div>
            </div>

            <button onClick={() => setShowFormulaModal(false)} className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem" }}>
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
