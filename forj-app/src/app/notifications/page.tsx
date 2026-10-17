import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="py-8 animate-fade-in">
      <h1 className="text-2xl mb-4">Notifications</h1>
      <div className="card p-10">
        <div className="empty-state">
          <div style={{
            width: "3rem", height: "3rem",
            borderRadius: "50%",
            background: "var(--color-bone)",
            border: "1px solid var(--color-steel-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1rem",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-steel)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3 className="text-lg mb-1">All caught up</h3>
          <p className="text-sm text-steel">Notifications appear here when you get reviews, matches, and updates.</p>
        </div>
      </div>
    </div>
  );
}
