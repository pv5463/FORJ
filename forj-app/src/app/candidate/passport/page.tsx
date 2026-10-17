import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PassportClient, { PassportSkill, ShareLink } from "./PassportClient";

export const metadata = {
  title: "Skill Passport · FORJ",
  description: "Cryptographically verified skill credentials backed by isolated test suites, code analysis, and employer endorsements.",
};

export default async function CandidatePassportPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/candidate/passport");
  }

  // 1. Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Ensure skill_passports row exists
  let { data: passport } = await supabase
    .from("skill_passports")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!passport) {
    const { data: newPassport } = await supabase
      .from("skill_passports")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    passport = newPassport;
  }

  const passportId = passport?.id || "";

  // 3. Fetch passport_skills
  let { data: rawSkills } = await supabase
    .from("passport_skills")
    .select(`
      id,
      skill_id,
      level,
      score,
      verification_status,
      assessed_at,
      assessment_run_id,
      skills (
        id,
        name,
        category
      )
    `)
    .eq("passport_id", passportId)
    .order("assessed_at", { ascending: false });

  // If candidate has no passport_skills yet, seed from user_skill_evidence or skills
  if (!rawSkills || rawSkills.length === 0) {
    // Check if user has skill evidence from GitHub analysis
    const { data: evidence } = await supabase
      .from("user_skill_evidence")
      .select("skill_id, skills(id, name, category), detail")
      .eq("user_id", user.id);

    if (evidence && evidence.length > 0) {
      // Group by skill
      const uniqueSkills = new Map();
      evidence.forEach((ev: any) => {
        if (ev.skill_id && !uniqueSkills.has(ev.skill_id)) {
          uniqueSkills.set(ev.skill_id, ev);
        }
      });

      const inserts = Array.from(uniqueSkills.keys()).map((skillId) => ({
        passport_id: passportId,
        skill_id: skillId,
        level: 2,
        verification_status: "repository_evidence",
        assessed_at: new Date().toISOString(),
      }));

      if (inserts.length > 0) {
        await supabase.from("passport_skills").insert(inserts);
      }
    } else {
      // Seed default core skills as not_assessed
      const { data: defaultSkills } = await supabase
        .from("skills")
        .select("id, name, category")
        .limit(6);

      if (defaultSkills && defaultSkills.length > 0) {
        const inserts = defaultSkills.map((s: any) => ({
          passport_id: passportId,
          skill_id: s.id,
          level: 1,
          verification_status: "not_assessed",
          assessed_at: new Date().toISOString(),
        }));
        await supabase.from("passport_skills").insert(inserts);
      }
    }

    // Re-query
    const { data: refetched } = await supabase
      .from("passport_skills")
      .select(`
        id,
        skill_id,
        level,
        score,
        verification_status,
        assessed_at,
        assessment_run_id,
        skills (
          id,
          name,
          category
        )
      `)
      .eq("passport_id", passportId);
    rawSkills = refetched || [];
  }

  // 4. Fetch share links
  const { data: rawLinks } = await supabase
    .from("passport_share_links")
    .select("id, expires_at, revoked_at, view_count, created_at")
    .eq("passport_id", passportId)
    .order("created_at", { ascending: false });

  // 5. Build typed skills with staleness check (> 12 months)
  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const skills: PassportSkill[] = (rawSkills || []).map((s: any) => {
    const assessedDate = new Date(s.assessed_at);
    const isStale = assessedDate < twelveMonthsAgo;

    return {
      id: s.id,
      skill_id: s.skill_id,
      skill_name: s.skills?.name || "Unknown Skill",
      category: s.skills?.category || "General",
      level: s.level || 1,
      score: s.score !== null ? Number(s.score) : null,
      verification_status: s.verification_status,
      assessed_at: s.assessed_at,
      is_stale: isStale,
      assessment_run_id: s.assessment_run_id,
      assessment_details: null,
      evidence: [],
    };
  });

  const shareLinks: ShareLink[] = (rawLinks || []).map((l: any) => ({
    id: l.id,
    expires_at: l.expires_at,
    revoked_at: l.revoked_at,
    view_count: l.view_count || 0,
    created_at: l.created_at,
  }));

  return (
    <PassportClient
      passportId={passportId}
      userId={user.id}
      userName={profile?.full_name || user.email?.split("@")[0] || "Candidate"}
      skills={skills}
      shareLinks={shareLinks}
    />
  );
}
