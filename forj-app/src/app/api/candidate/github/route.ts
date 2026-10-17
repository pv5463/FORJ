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
    const { github_username, role_profile_id } = body;

    if (!github_username || typeof github_username !== "string") {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
    }

    const cleanUsername = github_username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid GitHub username format" }, { status: 400 });
    }

    // Call stored procedure request_github_analysis
    const { data, error } = await supabase.rpc("request_github_analysis", {
      p_github_username: cleanUsername,
      p_role_profile_id: role_profile_id || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete candidate's GitHub connections, repositories, analyses, and evidence
    await supabase.from("user_skill_evidence").delete().eq("user_id", user.id);
    await supabase.from("skill_readiness_reports").delete().eq("user_id", user.id);
    await supabase.from("repositories").delete().eq("user_id", user.id);
    await supabase.from("github_analyses").delete().eq("user_id", user.id);
    await supabase.from("github_connections").delete().eq("user_id", user.id);

    return NextResponse.json({ success: true, message: "All GitHub data removed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
