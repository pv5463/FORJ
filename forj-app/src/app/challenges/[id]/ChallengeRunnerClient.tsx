"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
  FileCode,
  Terminal,
  ExternalLink,
} from "lucide-react";

interface Props {
  template: any;
  initialAssignment: any;
  initialRuns: any[];
  userId: string | null;
}

export default function ChallengeRunnerClient({
  template,
  initialAssignment,
  initialRuns,
  userId,
}: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"brief" | "starter" | "rubric" | "submit">(
    initialRuns.length > 0 ? "submit" : "brief"
  );
  const [assignment, setAssignment] = useState(initialAssignment);
  const [runs, setRuns] = useState(initialRuns);

  // Form states
  const [repoUrl, setRepoUrl] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!assignment?.deadline) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(assignment.deadline).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("Time Expired");
        clearInterval(interval);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignment?.deadline]);

  async function handleStartChallenge() {
    if (!userId) {
      router.push(`/auth/login?redirect=/challenges/${template.slug}`);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/candidate/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          template_id: template.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start challenge");

      setAssignment(data.assignment);
      setActiveTab("starter");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitWork(e: React.FormEvent) {
    e.preventDefault();
    if (!explanationText.trim()) {
      setErrorMsg("Please provide an architectural explanation of your solution.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/candidate/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          assignment_id: assignment.id,
          repo_url: repoUrl,
          commit_sha: commitSha,
          explanation_text: explanationText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit challenge");

      setSuccessMsg(data.message || "Assessment passed!");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyStarter() {
    const starterText =
      template.runtime === "python"
        ? `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\n# Your implementation here`
        : `const express = require('express');\nconst app = express();\napp.use(express.json());\n\n// Your implementation here`;
    navigator.clipboard.writeText(starterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const latestRun = runs[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* ─── Breadcrumb & Header ───────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Link href="/challenges" style={{ color: "var(--color-steel)", textDecoration: "none", fontSize: "0.85rem" }}>
            Challenges
          </Link>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>/</span>
          <span className="badge badge-steel" style={{ textTransform: "capitalize", fontSize: "0.72rem" }}>
            {template.runtime}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
              {template.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", color: "var(--color-steel)" }}>
              <span>Primary Skill: <strong style={{ color: "var(--color-ink)" }}>{template.skills?.name}</strong></span>
              <span>•</span>
              <span style={{ textTransform: "capitalize" }}>Difficulty: <strong>{template.difficulty}</strong></span>
              <span>•</span>
              <span>Pass: <strong>{template.pass_threshold}%</strong></span>
            </div>
          </div>

          {/* Timer or Start Button */}
          {assignment ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                background: "rgba(224, 90, 43, 0.08)",
                border: "1px solid rgba(224, 90, 43, 0.3)",
                color: "var(--color-ember)",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              <Clock size={18} />
              <span>{timeLeft || `${template.time_limit_minutes}m 00s`}</span>
            </div>
          ) : (
            <button
              onClick={handleStartChallenge}
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>Begin Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Tabs Navigation ───────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-steel-light)", gap: "1rem" }}>
        {[
          { key: "brief", label: "Challenge Brief" },
          { key: "starter", label: "Starter Code & Variant" },
          { key: "rubric", label: "Evaluation Rubric (100 pts)" },
          { key: "submit", label: latestRun ? "Assessment Results" : "Submit Work" },
        ].map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                padding: "0.75rem 0.25rem",
                border: "none",
                background: "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.95rem",
                color: isActive ? "var(--color-ember)" : "var(--color-steel)",
                borderBottom: isActive ? "2px solid var(--color-ember)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: BRIEF ───────────────────────────────────────── */}
      {activeTab === "brief" && (
        <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--color-ink)", fontSize: "0.95rem" }}>
            {template.brief_md}
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-steel-light)", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setActiveTab("starter")} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>View Starter Code</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 2: STARTER CODE & VARIANT ──────────────────────── */}
      {activeTab === "starter" && (
        <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ink)" }}>
                Starter Code & Local Setup
              </h3>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--color-steel)" }}>
                Unique Variant Seed: <code>{assignment?.variant_seed || "seed-demo-var42"}</code>
              </p>
            </div>
            <button
              onClick={handleCopyStarter}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          <pre
            style={{
              background: "var(--color-ink)",
              color: "#f4f1ea",
              padding: "1.25rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              overflowX: "auto",
              fontFamily: "monospace",
              lineHeight: 1.5,
            }}
          >
            {template.runtime === "python"
              ? `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, EmailStr\nfrom typing import List, Optional\nimport uuid\n\napp = FastAPI(title="Job Application API")\n\nclass ApplicationCreate(BaseModel):\n    candidate_name: str\n    email: EmailStr\n    role_id: str\n    experience_years: int\n\n@app.post("/applications", status_code=201)\nasync def create_application(app_data: ApplicationCreate):\n    # TODO: Implement endpoint\n    pass\n\n@app.get("/applications/{id}")\nasync def get_application(id: str):\n    # TODO: Implement get endpoint\n    pass\n\n@app.put("/applications/{id}/status")\nasync def update_status(id: str, payload: dict):\n    # TODO: Implement status update\n    pass`
              : `// Node.js Task Runner\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.post('/tasks', (req, res) => {\n  // Implementation here\n});`}
          </pre>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setActiveTab("submit")} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Proceed to Submit</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 3: RUBRIC ──────────────────────────────────────── */}
      {activeTab === "rubric" && (
        <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "1rem" }}>
            Transparent Rubric Criteria (100 Points Total)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {template.rubric?.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.02)",
                  border: "1px solid var(--color-steel-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{item.criterion}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "3px",
                        background: item.method === "automated" ? "rgba(16, 185, 129, 0.1)" : "rgba(212, 163, 89, 0.2)",
                        color: item.method === "automated" ? "#059669" : "var(--color-ink)",
                      }}
                    >
                      {item.method === "automated" ? "Automated Sandbox" : "AI-Assisted Evaluation"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-steel)" }}>
                    {item.description || "Verified against strict automated test suites."}
                  </p>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ember)" }}>
                  {item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SUBMISSION & ASSESSMENT RESULTS ─────────────── */}
      {activeTab === "submit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* If already assessed, show results */}
          {latestRun ? (
            <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#059669",
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--color-ink)" }}>
                    Assessment Passed: {latestRun.tests_passed}/{latestRun.tests_total} Tests Passed
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-steel)" }}>
                    Sandbox execution runtime: {latestRun.runtime_ms}ms · Exit status: {latestRun.exit_reason}
                  </p>
                </div>
              </div>

              {/* Celebration passport banner */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  background: "rgba(212, 163, 89, 0.12)",
                  border: "1px solid var(--color-brass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Shield size={22} color="var(--color-brass)" />
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-ink)", fontSize: "0.95rem" }}>
                      Skill Passport Badge Unlocked!
                    </span>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-steel)" }}>
                      Your Skill Passport now displays the <strong>challenge_verified</strong> badge for {template.skills?.name}.
                    </p>
                  </div>
                </div>
                <Link href="/candidate/passport" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>View Passport</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Rubric scores */}
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
                Score Breakdown
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {latestRun.assessment_scores?.map((sc: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.02)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{sc.criterion}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--color-steel)", marginLeft: "0.5rem" }}>
                        ({sc.feedback})
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: "#059669" }}>
                      {sc.points_awarded}/{sc.points_max} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Submission Form */
            <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
              <form onSubmit={handleSubmitWork} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
                    Public Repository URL (or GitHub commit link)
                  </label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://github.com/your-username/job-application-api"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
                    Commit SHA (Pinned at submit time)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 7f8b9a2c3d4e5f6a..."
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
                    Code Explanation & Architectural Design (Scored by LLM)
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Explain your approach, design decisions, database choice, and error handling strategy..."
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--color-steel)", marginTop: "0.35rem" }}>
                    This explanation is scored against the 15-point Code Explanation rubric criterion to verify deep understanding.
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(220, 38, 38, 0.08)", color: "#dc2626", fontSize: "0.85rem" }}>
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(16, 185, 129, 0.08)", color: "#059669", fontSize: "0.85rem" }}>
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>Submit for Sandbox Assessment</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
