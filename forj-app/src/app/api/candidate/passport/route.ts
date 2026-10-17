import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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
    const { action } = body;

    // ─── ACTION 1: CREATE SHARE LINK ───────────────────────────
    if (action === "create_link") {
      const { expiry_days = 30 } = body;

      // Get or create passport
      const { data: passport } = await supabase
        .from("skill_passports")
        .upsert({ user_id: user.id }, { onConflict: "user_id" })
        .select()
        .single();

      if (!passport) {
        return NextResponse.json({ error: "Failed to get passport" }, { status: 500 });
      }

      // Generate 32-byte cryptographic random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString();

      const { data: link, error: linkErr } = await supabase
        .from("passport_share_links")
        .insert({
          passport_id: passport.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (linkErr) {
        return NextResponse.json({ error: linkErr.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        token: rawToken,
        share_url: `/passport/${rawToken}`,
        expires_at: expiresAt,
        link_id: link.id,
      });
    }

    // ─── ACTION 2: REVOKE SHARE LINK ───────────────────────────
    if (action === "revoke_link") {
      const { link_id } = body;
      const { error } = await supabase
        .from("passport_share_links")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", link_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Share link revoked successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
