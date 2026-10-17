import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Globe, Award, Briefcase, TrendingUp } from "lucide-react";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("full_name, headline").eq("id", params.id).single();
  return { title: data?.full_name ?? "Profile" };
}

const SKILL_LEVEL_LABEL: Record<number, string> = {
  1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert",
};

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, skillsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase
      .from("profile_skills")
      .select("*, skills(*)")
      .eq("profile_id", params.id)
      .order("level", { ascending: false }),
  ]);

  if (!profileRes.data) notFound();
  const profile = profileRes.data;
  const skills = skillsRes.data ?? [];

  const isOwn = user?.id === profile.id;

  // Group skills by category
  const byCategory: Record<string, typeof skills> = {};
  for (const ps of skills) {
    const cat = (ps.skills as any)?.category ?? "general";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(ps);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bone)" }}>
      {/* Simple top nav */}
      <nav className="bg-paper border-b border-steel-light sticky top-0 z-10">
        <div className="page-container flex items-center justify-between h-14">
          <Link href="/" className="brand-mark text-xl">F<span style={{ color: "var(--color-ember)" }}>O</span>RJ</Link>
          <div className="flex gap-2">
            {isOwn && <Link href="/profile/edit" className="btn btn-secondary btn-sm">Edit profile</Link>}
            {user && <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>}
          </div>
        </div>
      </nav>

      <div className="page-container py-8 max-w-3xl animate-fade-in">
        {/* Profile header */}
        <div className="card p-6 mb-5">
          <div className="flex items-start gap-5">
            <div className="avatar-xl flex-shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: "Fraunces, serif", fontSize: "2rem" }}>
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl mb-0.5">{profile.full_name}</h1>
                  {profile.headline && (
                    <p className="text-steel text-sm">{profile.headline}</p>
                  )}
                </div>
                <span className={`badge flex-shrink-0 ${
                  profile.role === "employer" ? "badge-brass" :
                  profile.role === "mentor"   ? "badge-success" :
                  profile.role === "admin"    ? "badge-ink" : "badge-ember"
                }`}>
                  {profile.role}
                </span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-steel">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-steel-light">
              <p className="text-sm text-steel leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="card p-6 mb-5">
            <h3 className="text-base mb-4">Skills ({skills.length})</h3>
            <div className="space-y-4">
              {Object.entries(byCategory).map(([cat, catSkills]) => (
                <div key={cat}>
                  <div className="text-xs font-medium text-steel uppercase tracking-wide mb-2">{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((ps) => (
                      <div key={ps.skill_id} className="skill-pill">
                        <span>{(ps.skills as any)?.name ?? ps.skill_id}</span>
                        <span style={{
                          fontSize: "0.65rem",
                          opacity: 0.7,
                          marginLeft: "0.125rem",
                        }}>
                          · L{ps.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty skills state */}
        {skills.length === 0 && (
          <div className="card p-6 mb-5">
            <h3 className="text-base mb-2">Skills</h3>
            <div className="empty-state py-8">
              <p className="text-sm text-steel">No skills added yet.</p>
              {isOwn && (
                <Link href="/profile/edit" className="btn btn-primary btn-sm mt-3">Add skills</Link>
              )}
            </div>
          </div>
        )}

        {/* Proof of work placeholder (Phase 2 will populate) */}
        <div className="card p-6">
          <h3 className="text-base mb-4">Proof of work</h3>
          <div className="empty-state py-8">
            <Award size={32} style={{ color: "var(--color-steel-light)", marginBottom: "0.75rem" }} />
            <p className="text-sm text-steel">No verified proof of work yet.</p>
            <p className="text-xs text-steel mt-1">Complete challenges to build your portfolio.</p>
            {isOwn && (
              <Link href="/challenges" className="btn btn-primary btn-sm mt-3">
                <Briefcase size={14} /> Browse challenges
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
