// @ts-nocheck
/// <reference path="../deno.d.ts" />
// Supabase Edge Function: start-github-analysis
// POST /functions/v1/start-github-analysis
// Validates username, checks 24h rate limit (max 5), creates analysis record, and enqueues worker job.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  github_username: z
    .string()
    .trim()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username too long")
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format"),
  role_profile_id: z.string().uuid().optional(),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const body = await req.json().catch(() => ({}));
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { github_username, role_profile_id } = parseResult.data;
    const cleanUsername = github_username.toLowerCase();

    // Use service client for rate check and queue management
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit check: max 5 analyses in 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await adminClient
      .from("github_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("created_at", oneDayAgo);

    if (countError) {
      throw new Error(`Failed to check rate limit: ${countError.message}`);
    }

    if ((count ?? 0) >= 5) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "You can run at most 5 GitHub analyses per 24 hours.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upsert GitHub connection
    const { error: connError } = await adminClient
      .from("github_connections")
      .upsert(
        {
          user_id: user.id,
          github_username: cleanUsername,
          status: "connected",
        },
        { onConflict: "user_id" }
      );

    if (connError) {
      throw new Error(`Failed to save GitHub connection: ${connError.message}`);
    }

    // Insert github_analyses row
    const { data: analysis, error: analysisError } = await adminClient
      .from("github_analyses")
      .insert({
        user_id: user.id,
        status: "queued",
        role_profile_id: role_profile_id || null,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      throw new Error(`Failed to create analysis: ${analysisError?.message}`);
    }

    // Enqueue worker job
    const { data: job, error: jobError } = await adminClient
      .from("jobs")
      .insert({
        type: "github_analysis",
        payload: {
          analysis_id: analysis.id,
          user_id: user.id,
          github_username: cleanUsername,
          role_profile_id: role_profile_id || null,
        },
        status: "queued",
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to enqueue job: ${jobError?.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysis.id,
        job_id: job.id,
        status: "queued",
        message: "Analysis enqueued successfully. Worker will process repositories.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err?.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
