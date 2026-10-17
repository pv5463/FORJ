"use client";

import { createBrowserClient } from "@supabase/ssr";

// Singleton to avoid creating multiple GoTrue instances
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null;

export function createSupabaseBrowserClient() {
  if (client) return client;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
