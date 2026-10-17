import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GitHubAnalysisClient from "@/app/candidate/github/GitHubAnalysisClient";

export const metadata = {
  title: "Connect GitHub · Skill Intelligence · FORJ",
  description: "Analyse your public repositories for objective skill evidence and produce a Skill Readiness report.",
};

export default async function CandidateGitHubPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/candidate/github");
  }

  // 1. Fetch current connection
  const { data: connection } = await supabase
    .from("github_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Fetch existing repositories
  const { data: repositories } = await supabase
    .from("repositories")
    .select("*")
    .eq("user_id", user.id)
    .order("stars", { ascending: false });

  // 3. Fetch latest analysis
  const { data: latestAnalysis } = await supabase
    .from("github_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Fetch 6 seeded role profiles
  const { data: roleProfiles } = await supabase
    .from("role_profiles")
    .select("id, name, description, weights")
    .order("name", { ascending: true });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <GitHubAnalysisClient
        userId={user.id}
        initialConnection={connection}
        initialRepositories={repositories || []}
        initialAnalysis={latestAnalysis}
        roleProfiles={roleProfiles || []}
      />
    </div>
  );
}
