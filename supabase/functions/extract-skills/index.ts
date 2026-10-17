// @ts-nocheck
/// <reference path="../deno.d.ts" />
// Supabase Edge Function: extract-skills
// Deno runtime (TypeScript)
// POST /functions/v1/extract-skills
// Body: { resume_text: string }
// Returns: { matched_skills: SkillMatch[], suggested_new: string[] }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Input validation ─────────────────────────────────────────
const RequestSchema = z.object({
  resume_text: z
    .string()
    .min(50, "Resume text must be at least 50 characters")
    .max(20000, "Resume text must be under 20,000 characters"),
});

// ─── Types ────────────────────────────────────────────────────
interface SkillMatch {
  skill_id: string;
  name: string;
  category: string;
  confidence: number; // 0-1
}

interface LLMSkillResponse {
  found_skills: string[];
  suggested_new: string[];
}

// ─── LLM call (provider-agnostic via LLM_API_KEY env var) ─────
async function extractSkillsFromLLM(resumeText: string): Promise<LLMSkillResponse> {
  const apiKey = Deno.env.get("LLM_API_KEY");
  const apiUrl = Deno.env.get("LLM_API_URL") ?? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  if (!apiKey) {
    throw new Error("LLM_API_KEY environment variable is not set");
  }

  const prompt = `You are a skills extraction assistant for a talent platform.

Extract ALL technical and professional skills from the following resume text.
Return a JSON object with exactly this structure:
{
  "found_skills": ["skill name 1", "skill name 2", ...],
  "suggested_new": ["new skill not in common lists", ...]
}

Rules:
- found_skills: skills that are common and well-known (programming languages, frameworks, tools, methodologies)
- suggested_new: specific skills or technologies you found that are niche or uncommon
- Use standard names (e.g. "JavaScript" not "JS", "Machine Learning" not "ML")
- Do not include soft skills like "teamwork" or "communication"
- Return only the JSON object, no other text

Resume text:
${resumeText}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let parsed: LLMSkillResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`LLM returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  // Validate shape
  if (!Array.isArray(parsed.found_skills) || !Array.isArray(parsed.suggested_new)) {
    throw new Error("LLM response missing required arrays");
  }

  return parsed;
}

// ─── Main handler ─────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a per-request Supabase client respecting the user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: parseResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { resume_text } = parseResult.data;

    // Call LLM
    const llmResult = await extractSkillsFromLLM(resume_text);

    // Fetch all existing verified skills from the DB (case-insensitive via citext)
    const { data: existingSkills, error: skillsError } = await supabase
      .from("skills")
      .select("id, name, category")
      .eq("is_verified", true);

    if (skillsError) {
      throw new Error(`DB error fetching skills: ${skillsError.message}`);
    }

    // Build a map: lowercase name -> skill row
    const skillMap = new Map<string, { id: string; name: string; category: string }>();
    for (const s of existingSkills ?? []) {
      skillMap.set(s.name.toLowerCase(), s);
    }

    // Match found skills against DB
    const matched: SkillMatch[] = [];
    const unmatched: string[] = [];

    for (const foundName of llmResult.found_skills) {
      const key = foundName.toLowerCase().trim();
      const existing = skillMap.get(key);
      if (existing) {
        matched.push({
          skill_id: existing.id,
          name: existing.name,
          category: existing.category,
          confidence: 0.95,
        });
      } else {
        unmatched.push(foundName);
      }
    }

    // Insert unmatched + suggested_new as unverified skill suggestions (no duplicates)
    const toInsert = [...new Set([...unmatched, ...llmResult.suggested_new])]
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n.length <= 100)
      .filter((n) => !skillMap.has(n.toLowerCase()));

    const newSkills: SkillMatch[] = [];

    if (toInsert.length > 0) {
      // Use service role client for inserting suggested skills (user cannot insert by default due to RLS)
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      for (const name of toInsert) {
        const { data: inserted, error: insertErr } = await serviceClient
          .from("skills")
          .insert({ name, category: "general", is_verified: false })
          .select("id, name, category")
          .maybeSingle();

        if (!insertErr && inserted) {
          newSkills.push({
            skill_id: inserted.id,
            name: inserted.name,
            category: inserted.category,
            confidence: 0.70,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        matched_skills: matched,
        suggested_new: newSkills,
        total_found: matched.length + newSkills.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("extract-skills error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
