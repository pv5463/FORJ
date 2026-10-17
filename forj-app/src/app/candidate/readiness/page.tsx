import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReadinessReportClient from "@/app/candidate/readiness/ReadinessReportClient";

export const metadata = {
  title: "Skill Readiness Report · FORJ",
  description: "Objective skill evidence report based on your connected GitHub repositories and practical tests.",
};

export default async function CandidateReadinessPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/candidate/readiness");
  }

  const resolvedParams = await searchParams;

  // 1. Fetch all role profiles
  const { data: roleProfiles } = await supabase
    .from("role_profiles")
    .select("id, name, description, weights")
    .order("name", { ascending: true });

  const activeRoleId =
    resolvedParams.role ||
    roleProfiles?.[0]?.id ||
    "";

  // 2. Fetch latest readiness report for this candidate and role
  let query = supabase
    .from("skill_readiness_reports")
    .select("*, role_profiles(name, description, weights)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (activeRoleId) {
    query = query.eq("role_profile_id", activeRoleId);
  }

  const { data: reports } = await query.limit(1);
  const latestReport = reports?.[0] || null;

  // 3. Fetch all evidence items for this user to inspect details
  const { data: allEvidence } = await supabase
    .from("user_skill_evidence")
    .select("*, skills(name, category), repositories(full_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <ReadinessReportClient
        userId={user.id}
        roleProfiles={roleProfiles || []}
        activeRoleId={activeRoleId}
        report={latestReport}
        allEvidence={allEvidence || []}
      />
    </div>
  );
}
