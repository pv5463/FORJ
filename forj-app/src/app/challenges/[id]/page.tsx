import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChallengeRunnerClient from "./ChallengeRunnerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `${id.replace(/-/g, " ").toUpperCase()} · Practical Challenge · FORJ`,
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Find template by slug or uuid
  const { data: template } = await supabase
    .from("challenge_templates")
    .select("*, skills(name, category)")
    .or(`slug.eq.${id},id.eq.${id.includes("-") && id.length === 36 ? id : "00000000-0000-0000-0000-000000000000"}`)
    .maybeSingle();

  if (!template) {
    notFound();
  }

  // Get current user and assignment
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let assignment = null;
  let runs: any[] = [];

  if (user) {
    const { data: assign } = await supabase
      .from("assigned_challenges")
      .select("*, verification_submissions(*)")
      .eq("user_id", user.id)
      .eq("template_id", template.id)
      .maybeSingle();

    assignment = assign;

    if (assign?.verification_submissions?.[0]) {
      const { data: runData } = await supabase
        .from("assessment_runs")
        .select("*, assessment_scores(*)")
        .eq("submission_id", assign.verification_submissions[0].id)
        .order("created_at", { ascending: false });

      runs = runData || [];
    }
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <ChallengeRunnerClient
        template={template}
        initialAssignment={assignment}
        initialRuns={runs}
        userId={user?.id || null}
      />
    </div>
  );
}
