"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  Compass,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Rocket,
  Users,
} from "lucide-react";

export interface VentureIdea {
  id: string;
  title: string;
  pitch: string;
  stage: "Idea" | "Prototype" | "MVP" | "Traction";
  category: string;
  created_at: string;
  validation_score: number; // 0 - 100
  validation_breakdown: {
    problem_fit: number; // /30
    market_size: number; // /25
    moat_and_tech: number; // /25
    execution_risk: number; // /20
  };
  ai_feedback: string;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  incubator_ready: boolean;
}

export default function IdeasClient({
  initialIdeas,
}: {
  initialIdeas: VentureIdea[];
}) {
  const [ideas, setIdeas] = useState<VentureIdea[]>(initialIdeas);
  const [selectedIdea, setSelectedIdea] = useState<VentureIdea>(initialIdeas[0]);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newPitch, setNewPitch] = useState("");
  const [newCategory, setNewCategory] = useState("FinTech");
  const [newStage, setNewStage] = useState<VentureIdea["stage"]>("Prototype");

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPitch) return;

    const created: VentureIdea = {
      id: `idea-${Date.now()}`,
      title: newTitle,
      pitch: newPitch,
      category: newCategory,
      stage: newStage,
      created_at: new Date().toISOString(),
      validation_score: 84,
      validation_breakdown: {
        problem_fit: 26,
        market_size: 21,
        moat_and_tech: 20,
        execution_risk: 17,
      },
      ai_feedback:
        "High urgency in B2B tier. Clear regulatory headwinds, but strong moat through specialized domain workflows. Recommendation: complete 15 customer discovery interviews before MVP architecture.",
      milestones: [
        { id: "m1", title: "Conduct 15 customer interviews", completed: false },
        { id: "m2", title: "Ship interactive Figma prototype", completed: false },
        { id: "m3", title: "Secure first design partner letter of intent", completed: false },
      ],
      incubator_ready: false,
    };

    setIdeas([created, ...ideas]);
    setSelectedIdea(created);
    setShowNewModal(false);
    setNewTitle("");
    setNewPitch("");
  };

  const toggleMilestone = (ideaId: string, milestoneId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== ideaId) return idea;
        const updatedMilestones = idea.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const allDone = updatedMilestones.every((m) => m.completed);
        const updated = { ...idea, milestones: updatedMilestones, incubator_ready: allDone };
        if (selectedIdea.id === ideaId) setSelectedIdea(updated);
        return updated;
      })
    );
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
        <div style={{ maxWidth: "720px" }}>
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
              Venture Pathway
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>AI Validation & Milestones</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            Venture Launchpad
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.3rem" }}>
            Turn student and early-career ideas into venture-backed startups. AI validates problem-solution fit,
            structures milestones, and bridges your team to incubators and vetted mentors.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
        >
          <PlusCircle size={15} />
          <span>Pitch New Venture</span>
        </button>
      </div>

      {/* ─── Main Content Split ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Left Column: Ventures List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
            Your Venture Concepts
          </h3>

          {ideas.map((idea) => {
            const isSelected = selectedIdea.id === idea.id;
            return (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
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
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-steel)" }}>
                      {idea.category} • {idea.stage}
                    </span>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", marginTop: "0.15rem" }}>
                      {idea.title}
                    </h4>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: idea.validation_score >= 80 ? "var(--color-ember)" : "var(--color-brass)",
                      background: "var(--color-paper)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--color-steel-light)",
                    }}
                  >
                    {idea.validation_score}% Fit
                  </span>
                </div>

                <p style={{ fontSize: "0.82rem", color: "var(--color-steel)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {idea.pitch}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--color-steel)", marginTop: "0.4rem" }}>
                  <span>
                    Milestones: {idea.milestones.filter((m) => m.completed).length}/{idea.milestones.length}
                  </span>
                  {idea.incubator_ready && (
                    <span style={{ color: "#15803d", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <Rocket size={11} /> Incubator Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Validation & Milestone Dashboard */}
        {selectedIdea && (
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "4px", background: "rgba(212, 163, 89, 0.2)", color: "var(--color-ink)" }}>
                    {selectedIdea.category}
                  </span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "4px", background: "var(--color-bone)", color: "var(--color-steel)" }}>
                    {selectedIdea.stage} Stage
                  </span>
                </div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-ink)" }}>
                  {selectedIdea.title}
                </h2>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>AI Validation Score</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-ember)" }}>
                  {selectedIdea.validation_score}%
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.95rem", color: "var(--color-ink)", lineHeight: 1.6 }}>
              {selectedIdea.pitch}
            </p>

            {/* AI Fit Radar Breakdown */}
            <div style={{ background: "var(--color-bone)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-steel-light)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Sparkles size={14} style={{ color: "var(--color-brass)" }} />
                AI-Assisted Feasibility & Market Matrix
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600 }}>
                    <span>Problem-Solution Fit</span>
                    <strong style={{ color: "var(--color-ember)" }}>{selectedIdea.validation_breakdown.problem_fit}/30</strong>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-steel-light)", borderRadius: "2px", marginTop: "0.4rem" }}>
                    <div style={{ height: "100%", width: `${(selectedIdea.validation_breakdown.problem_fit / 30) * 100}%`, background: "var(--color-ember)", borderRadius: "2px" }} />
                  </div>
                </div>

                <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600 }}>
                    <span>Addressable Market (TAM)</span>
                    <strong style={{ color: "var(--color-brass)" }}>{selectedIdea.validation_breakdown.market_size}/25</strong>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-steel-light)", borderRadius: "2px", marginTop: "0.4rem" }}>
                    <div style={{ height: "100%", width: `${(selectedIdea.validation_breakdown.market_size / 25) * 100}%`, background: "var(--color-brass)", borderRadius: "2px" }} />
                  </div>
                </div>

                <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600 }}>
                    <span>Tech Moat & Defensibility</span>
                    <strong style={{ color: "var(--color-ink)" }}>{selectedIdea.validation_breakdown.moat_and_tech}/25</strong>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-steel-light)", borderRadius: "2px", marginTop: "0.4rem" }}>
                    <div style={{ height: "100%", width: `${(selectedIdea.validation_breakdown.moat_and_tech / 25) * 100}%`, background: "var(--color-ink)", borderRadius: "2px" }} />
                  </div>
                </div>

                <div style={{ background: "var(--color-paper)", padding: "0.75rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600 }}>
                    <span>Execution & Regulatory Feasibility</span>
                    <strong style={{ color: "#15803d" }}>{selectedIdea.validation_breakdown.execution_risk}/20</strong>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-steel-light)", borderRadius: "2px", marginTop: "0.4rem" }}>
                    <div style={{ height: "100%", width: `${(selectedIdea.validation_breakdown.execution_risk / 20) * 100}%`, background: "#15803d", borderRadius: "2px" }} />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", marginTop: "1rem", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--color-ink)" }}>AI Assessment: </strong> {selectedIdea.ai_feedback}
              </p>
            </div>

            {/* Milestones Tracker */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.75rem" }}>
                Stage Milestones & Proof Goals
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedIdea.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(selectedIdea.id, m.id)}
                    style={{
                      background: m.completed ? "rgba(34, 197, 94, 0.08)" : "var(--color-bone)",
                      border: m.completed ? "1px solid #22c55e" : "1px solid var(--color-steel-light)",
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        border: m.completed ? "none" : "2px solid var(--color-steel)",
                        background: m.completed ? "#15803d" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      {m.completed && <CheckCircle2 size={14} />}
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: m.completed ? "#15803d" : "var(--color-ink)", textDecoration: m.completed ? "line-through" : "none" }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-steel-light)", paddingTop: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <Link href="/mentorship" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                <Users size={14} />
                <span>Match with Mentors for {selectedIdea.category}</span>
              </Link>

              {selectedIdea.incubator_ready ? (
                <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                  <Rocket size={14} />
                  <span>Submit to Partner Incubator</span>
                </button>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>
                  Complete all 3 milestones to unlock 1-click Incubator FastTrack
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Pitch Modal ─────────────────────────────────────────── */}
      {showNewModal && (
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
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "580px",
              width: "100%",
              background: "var(--color-paper)",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
              Pitch a Venture Concept
            </h2>
            <p style={{ color: "var(--color-steel)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Submit your problem thesis. FORJ AI will stress-test the market potential and generate proof milestones.
            </p>

            <form onSubmit={handleCreateIdea} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
                  Venture Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AgriChain, MedPulse, NovaGrid"
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--color-steel-light)", background: "var(--color-bone)", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
                    Sector / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--color-steel-light)", background: "var(--color-bone)", fontSize: "0.85rem" }}
                  >
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="EdTech">EdTech</option>
                    <option value="AI / DevTools">AI / DevTools</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
                    Maturity Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--color-steel-light)", background: "var(--color-bone)", fontSize: "0.85rem" }}
                  >
                    <option value="Idea">Idea Thesis</option>
                    <option value="Prototype">Wireframe / Prototype</option>
                    <option value="MVP">Functional MVP</option>
                    <option value="Traction">Active Traction</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
                  Problem Thesis & Pitch
                </label>
                <textarea
                  required
                  rows={4}
                  value={newPitch}
                  onChange={(e) => setNewPitch(e.target.value)}
                  placeholder="Describe the critical pain point, why current solutions fail, and your unfair technological or distribution advantage."
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--color-steel-light)", background: "var(--color-bone)", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Analyze & Save Venture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
