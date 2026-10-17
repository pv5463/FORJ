import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Briefcase, Award, TrendingUp, Users, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/supabase";

// Suppress Supabase generic inference issues when DB hasn't been synced yet
type AnyProfile = Profile & Record<string, unknown>;

export const metadata = { title: "Dashboard" };

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(" ")[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

function OnboardingBanner({ profile }: { profile: Profile }) {
  const steps = [
    { label: "Create account",   done: true },
    { label: "Complete profile", done: !!(profile.headline && profile.bio) },
    { label: "Add skills",       done: false },
    { label: "Choose your path", done: false },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="card" style={{
      padding: "1.25rem",
      borderLeft: "4px solid var(--color-ember)",
      marginBottom: "1.5rem",
      animation: "slideUp 0.4s ease-out",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <h4 style={{ fontSize: "0.9rem" }}>Complete your profile</h4>
        <span className="badge badge-ember">{pct}% done</span>
      </div>
      <div className="progress-bar" style={{ marginBottom: "1rem" }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {steps.map((step) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
            <CheckCircle
              size={16}
              style={{ color: step.done ? "var(--color-success)" : "var(--color-steel-light)" }}
            />
            <span style={{ color: step.done ? "var(--color-ink)" : "var(--color-steel)" }}>{step.label}</span>
          </div>
        ))}
      </div>
      <Link href="/profile/edit" className="btn btn-primary btn-sm" style={{ marginTop: "1rem", display: "inline-flex" }}>
        Continue setup <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: AnyProfile | null; error: unknown };

  if (!profile) redirect("/auth/login");

  const showOnboarding = !profile.onboarding_completed;

  return (
    <div style={{ paddingTop: "2rem", paddingBottom: "2rem" }} className="animate-fade-in">
      {/* Greeting */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          {getGreeting(profile.full_name)}
        </h1>
        <p style={{ color: "var(--color-steel)", fontSize: "0.875rem" }}>
          {profile.role === "candidate" && "Your forge dashboard — challenges, matches, and proof of work."}
          {profile.role === "employer"  && "Your employer dashboard — challenges, applicants, and organisation."}
          {profile.role === "mentor"    && "Your mentor dashboard — mentorship requests and venture updates."}
          {profile.role === "admin"     && "Admin console — organisations, reports, and platform health."}
        </p>
      </div>

      {showOnboarding && <OnboardingBanner profile={profile} />}

      {/* Quick actions by role */}
      {profile.role === "candidate" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { href: "/challenges", icon: Briefcase,  color: "var(--color-ember)", bg: "#fff7ed", title: "Browse challenges",  body: "Find scoped challenges that match your skills" },
            { href: "/matches",    icon: Award,       color: "var(--color-brass)", bg: "#fffbeb", title: "My matches",         body: "Opportunities matched to your profile" },
            { href: "/portfolio",  icon: TrendingUp,  color: "var(--color-success)", bg: "#f0fdf4", title: "Proof portfolio",  body: "Your verified proof-of-work items" },
          ].map(({ href, icon: Icon, color, bg, title, body }) => (
            <Link key={href} href={href} className="card card-interactive" style={{ padding: "1.25rem", display: "block" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", background: bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--color-ink)" }}>{title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{body}</div>
            </Link>
          ))}
        </div>
      )}

      {profile.role === "employer" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { href: "/org",          icon: Users,      color: "var(--color-ember)", bg: "#fff7ed", title: "My organisation",   body: "Manage your org profile and team" },
            { href: "/challenges",   icon: Briefcase,  color: "var(--color-brass)", bg: "#fffbeb", title: "Post a challenge",  body: "Create a scoped challenge for candidates" },
            { href: "/applications", icon: Award,      color: "var(--color-success)", bg: "#f0fdf4", title: "Review submissions", body: "Score and shortlist candidates" },
          ].map(({ href, icon: Icon, color, bg, title, body }) => (
            <Link key={href} href={href} className="card card-interactive" style={{ padding: "1.25rem", display: "block" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", background: bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--color-ink)" }}>{title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{body}</div>
            </Link>
          ))}
        </div>
      )}

      {profile.role === "mentor" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { href: "/mentorship",   icon: Users,     color: "var(--color-ember)", bg: "#fff7ed", title: "Mentorship requests", body: "Review and respond to mentee requests" },
            { href: "/profile/edit", icon: Award,     color: "var(--color-brass)", bg: "#fffbeb", title: "Mentor profile",      body: "Update your expertise and availability" },
          ].map(({ href, icon: Icon, color, bg, title, body }) => (
            <Link key={href} href={href} className="card card-interactive" style={{ padding: "1.25rem", display: "block" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", background: bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--color-ink)" }}>{title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{body}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Profile summary */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem" }}>Profile overview</h3>
          <Link href="/profile/edit" className="btn btn-ghost btn-sm">Edit profile</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="avatar-lg">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "Fraunces, serif" }}>{profile.full_name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.125rem" }}>{profile.full_name}</div>
            {profile.headline && <div style={{ fontSize: "0.875rem", color: "var(--color-steel)" }}>{profile.headline}</div>}
            {profile.location && <div style={{ fontSize: "0.75rem", color: "var(--color-steel)", marginTop: "0.125rem" }}>{profile.location}</div>}
          </div>
          <span className={`badge ${
            profile.role === "admin"    ? "badge-ink"     :
            profile.role === "employer" ? "badge-brass"   :
            profile.role === "mentor"   ? "badge-success" : "badge-ember"
          }`}>
            {profile.role}
          </span>
        </div>
      </div>
    </div>
  );
}
