import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { candidate_user_id, skill_id, feedback, challenge_title } = body;

    if (!candidate_user_id || !skill_id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. Get or create candidate's skill_passport
    const { data: passport } = await supabase
      .from("skill_passports")
      .upsert({ user_id: candidate_user_id }, { onConflict: "user_id" })
      .select("id")
      .single();

    if (!passport) {
      return NextResponse.json({ error: "Failed to locate candidate passport" }, { status: 500 });
    }

    // 2. Upsert passport_skills with employer_reviewed status
    const { data: updatedSkill, error: skillErr } = await supabase
      .from("passport_skills")
      .upsert(
        {
          passport_id: passport.id,
          skill_id: skill_id,
          level: 4,
          score: 95,
          verification_status: "employer_reviewed",
          assessed_at: new Date().toISOString(),
          reviewer_id: user.id,
        },
        { onConflict: "passport_id,skill_id" }
      )
      .select("id")
      .single();

    if (skillErr) {
      return NextResponse.json({ error: skillErr.message }, { status: 400 });
    }

    // 3. Add passport_evidence row
    await supabase.from("passport_evidence").insert({
      passport_skill_id: updatedSkill.id,
      evidence_type: "review",
      summary: `Employer Review Endorsement: ${feedback || "Exceeded benchmark evaluation standards in " + challenge_title}`,
    });

    return NextResponse.json({
      success: true,
      message: "Skill successfully upgraded to employer_reviewed with verified audit evidence.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
