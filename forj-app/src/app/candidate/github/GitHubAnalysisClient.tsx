"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  ArrowRight,
  ExternalLink,
  Star,
  Shield,
  Code2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface RoleProfile {
  id: string;
  name: string;
  description: string;
  weights: any;
}

interface Repository {
  id: string;
  github_repo_id: number;
  full_name: string;
  description: string;
  primary_language: string;
  languages: Record<string, number>;
  stars: number;
  is_fork: boolean;
  pushed_at: string;
}

interface Analysis {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  repos_considered: number;
  error?: string;
  created_at: string;
  finished_at?: string;
}

interface Props {
  userId: string;
  initialConnection: any;
  initialRepositories: Repository[];
  initialAnalysis: Analysis | null;
  roleProfiles: RoleProfile[];
}

export default function GitHubAnalysisClient({
  userId,
  initialConnection,
  initialRepositories,
  initialAnalysis,
  roleProfiles,
}: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [username, setUsername] = useState(initialConnection?.github_username || "");
  const [selectedRole, setSelectedRole] = useState(
    roleProfiles[0]?.id || ""
  );
  const [status, setStatus] = useState<Analysis["status"] | "idle">(
    initialAnalysis?.status || "idle"
  );
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(initialAnalysis);
  const [repositories, setRepositories] = useState<Repository[]>(initialRepositories);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Realtime subscription on github_analyses
  useEffect(() => {
    const channel = supabase
      .channel("candidate_github_analysis")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "github_analyses",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const updated = payload.new as Analysis;
          if (updated) {
            setCurrentAnalysis(updated);
            setStatus(updated.status);
            if (updated.status === "completed") {
              setLoading(false);
              setSuccessMsg("Analysis completed! Objective evidence extracted.");
              router.refresh();
            } else if (updated.status === "failed") {
              setLoading(false);
              setErrorMsg(updated.error || "Analysis failed. Please try again.");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, router]);

  async function handleStartAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Please enter a valid GitHub username.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setStatus("queued");

    try {
      const res = await fetch("/api/candidate/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_username: username.trim(),
          role_profile_id: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start analysis");
      }

      setSuccessMsg("Analysis enqueued. The worker is scanning your repositories...");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start analysis.");
      setStatus("idle");
      setLoading(false);
    }
  }

  async function handleDeleteData() {
    if (!confirm("Are you sure you want to remove all stored GitHub repository evidence?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/candidate/github", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete data.");
      setRepositories([]);
      setCurrentAnalysis(null);
      setStatus("idle");
      setSuccessMsg("All stored GitHub evidence has been removed.");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Breadcrumb & Header ───────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-steel" style={{ textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            Skill Intelligence
          </span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>•</span>
          <span style={{ color: "var(--color-steel)", fontSize: "0.85rem" }}>Phase 2A</span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
          Connect Public GitHub
        </h1>
        <p style={{ color: "var(--color-steel)", fontSize: "1rem", maxWidth: "700px" }}>
          Extract objective proof of skill from your actual codebases, manifest dependencies, tests, and architecture documentation.
          Missing evidence is marked as <strong>not assessed</strong>, never zero.
        </p>
      </div>

      {/* ─── Form Card ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: "2rem", background: "var(--color-paper)" }}>
        <form onSubmit={handleStartAnalysis} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* GitHub username input */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
              Public GitHub Username
            </label>
            <div style={{ position: "relative", maxWidth: "480px" }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. torvalds or octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || status === "running" || status === "queued"}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
              <GitBranch
                size={18}
                style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-steel)" }}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-steel)", marginTop: "0.375rem" }}>
              Public repositories only. We never ask for GitHub account passwords or write access.
            </p>
          </div>

          {/* Target Role Profile Picker */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
              Target Role Profile (for Skill Readiness Report)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {roleProfiles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => !loading && setSelectedRole(role.id)}
                    style={{
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: isSelected ? "2px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                      background: isSelected ? "rgba(224, 90, 43, 0.04)" : "var(--color-paper)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-ink)" }}>
                        {role.name}
                      </span>
                      {isSelected && <CheckCircle2 size={16} color="var(--color-ember)" />}
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-steel)", margin: 0, lineClamp: 2 }}>
                      {role.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "6px", background: "rgba(220, 38, 38, 0.08)", color: "#dc2626", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "6px", background: "rgba(16, 185, 129, 0.08)", color: "#059669", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || status === "running" || status === "queued"}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem" }}
            >
              {loading || status === "running" || status === "queued" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Scanning Repositories...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>{initialConnection ? "Re-analyse Repositories" : "Start Skill Analysis"}</span>
                </>
              )}
            </button>

            {repositories.length > 0 && (
              <Link href="/candidate/readiness" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>View Readiness Report</span>
                <ArrowRight size={16} />
              </Link>
            )}

            {initialConnection && (
              <button
                type="button"
                onClick={handleDeleteData}
                disabled={loading}
                className="btn btn-ghost"
                style={{ marginLeft: "auto", color: "var(--color-steel)", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.85rem" }}
              >
                <Trash2 size={14} />
                <span>Disconnect & Delete Data</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─── Realtime Status Banner ────────────────────────────── */}
      {(status === "running" || status === "queued") && (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            background: "rgba(224, 90, 43, 0.05)",
            border: "1px solid rgba(224, 90, 43, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(224, 90, 43, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-ember)",
              flexShrink: 0,
            }}
          >
            <Loader2 size={24} className="animate-spin" />
          </div>
          <div>
            <h4 style={{ margin: "0 0 0.25rem", color: "var(--color-ink)", fontWeight: 600 }}>
              {status === "queued" ? "Analysis Queued in Background" : "Analysis in Progress..."}
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-steel)" }}>
              The FORJ Worker is inspecting repository metadata, parsing dependency manifests, detecting test suites, and extracting verified skills. This updates automatically.
            </p>
          </div>
        </div>
      )}

      {/* ─── Connected Repositories Section ───────────────────── */}
      {repositories.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
              Discovered Repositories ({repositories.length})
            </h3>
            <span style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
              Rule-based & AI-interpreted evidence linked
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="card card-hover"
                style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-ink)", wordBreak: "break-all" }}>
                      {repo.full_name}
                    </span>
                    <span className="badge badge-steel" style={{ fontSize: "0.75rem", flexShrink: 0 }}>
                      {repo.primary_language || "Code"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", margin: "0 0 1rem", minHeight: "2.5rem" }}>
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-steel-light)",
                    fontSize: "0.8rem",
                    color: "var(--color-steel)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Star size={14} />
                    {repo.stars}
                  </span>
                  <a
                    href={`https://github.com/${repo.full_name}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-ember)", textDecoration: "none" }}
                  >
                    <span>View on GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
