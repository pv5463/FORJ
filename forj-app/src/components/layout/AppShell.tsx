import React from "react";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Award,
  TrendingUp,
  Building,
  User,
  Bell,
  LogOut,
  Settings,
  GitBranch,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Layers,
  Lightbulb,
  Compass,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="nav-link" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Icon size={16} />
        <span>{label}</span>
      </div>
      {badge && (
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.1rem 0.4rem",
            borderRadius: "4px",
            background: "rgba(224, 90, 43, 0.15)",
            color: "var(--color-ember)",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bone)" }}>
      {/* ─── Universal Left Sidebar ───────────────────────────────── */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-steel-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" className="brand-mark" style={{ fontSize: "1.35rem", textDecoration: "none", letterSpacing: "-0.03em" }}>
            F<span style={{ color: "var(--color-ember)" }}>O</span>RJ
          </Link>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              background: "rgba(212, 163, 89, 0.2)",
              color: "var(--color-ink)",
              border: "1px solid rgba(212, 163, 89, 0.4)",
            }}
          >
            v2.0
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.75rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <NavItem href="/dashboard" icon={Home} label="Dashboard" />

          {/* Section: Skill Intelligence */}
          <div style={{ padding: "1.25rem 0.75rem 0.25rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Skill Intelligence
          </div>
          <NavItem href="/candidate/github" icon={GitBranch} label="GitHub Analysis" />
          <NavItem href="/candidate/readiness" icon={Sparkles} label="Skill Readiness" />
          <NavItem href="/candidate/passport" icon={ShieldCheck} label="Skill Passport" badge="NEW" />

          {/* Section: Opportunities & Proof */}
          <div style={{ padding: "1.25rem 0.75rem 0.25rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Opportunities
          </div>
          <NavItem href="/challenges" icon={Briefcase} label="Challenges" />
          <NavItem href="/matches" icon={Award} label="Evidence Matches" />
          <NavItem href="/portfolio" icon={FileCheck2} label="Proof Portfolio" />
          <NavItem href="/applications" icon={CheckCircle2} label="Submissions & Review" />

          {/* Section: Ventures & Mentorship */}
          <div style={{ padding: "1.25rem 0.75rem 0.25rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Venture Pathway
          </div>
          <NavItem href="/ideas" icon={Lightbulb} label="Venture Ideas" />
          <NavItem href="/mentorship" icon={Compass} label="Mentorship" />

          {/* Employer tools if role == employer */}
          {profile?.role === "employer" && (
            <>
              <div style={{ padding: "1.25rem 0.75rem 0.25rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Employer Console
              </div>
              <NavItem href="/org" icon={Building} label="Organisation" />
              <NavItem href="/org/new" icon={Building} label="Create Org" />
            </>
          )}
        </nav>

        {/* User Footer */}
        <div style={{ borderTop: "1px solid var(--color-steel-light)", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.125rem", background: "rgba(0,0,0,0.01)" }}>
          {user ? (
            <>
              <NavItem href="/profile/edit" icon={User} label={profile?.full_name || user.email?.split("@")[0] || "My Profile"} />
              <NavItem href="/notifications" icon={Bell} label="Notifications" />
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="nav-link"
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.75rem" }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </form>
            </>
          ) : (
            <NavItem href="/auth/login" icon={User} label="Sign in" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-with-sidebar min-h-screen">
        <div className="page-container" style={{ padding: "2rem" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
