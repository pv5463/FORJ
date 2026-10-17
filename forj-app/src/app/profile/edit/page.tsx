import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileEditClient from "./ProfileEditClient";

export const metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/profile/edit");

  const [profileRes, skillsRes, allSkillsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("profile_skills")
      .select("*, skills(*)")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("skills")
      .select("*")
      .eq("is_verified", true)
      .order("name"),
  ]);

  if (!profileRes.data) redirect("/auth/login");

  return (
    <div className="main-with-sidebar">
      <div className="page-container">
        <ProfileEditClient
          profile={profileRes.data}
          userSkills={(skillsRes.data ?? []) as any}
          allSkills={allSkillsRes.data ?? []}
        />
      </div>
    </div>
  );
}
