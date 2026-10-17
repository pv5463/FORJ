import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Building, MapPin, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";

export const metadata = { title: "My Organisation" };

export default async function OrgIndexPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="py-8">
        <div className="empty-state"><p className="text-sm text-steel">Please sign in.</p></div>
      </div>
    );
  }

  // Find orgs where this user is a member
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, member_role, organizations(*)")
    .eq("profile_id", user.id);

  const orgs = memberships?.map((m) => ({
    ...m.organizations as any,
    my_role: m.member_role,
  })) ?? [];

  return (
    <div className="py-8 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="text-2xl mb-1">Organisations</h1>
          <p className="text-steel text-sm">Organisations you own or are a member of.</p>
        </div>
        <Link href="/org/new" className="btn btn-primary">
          <Building size={16} /> Create organisation
        </Link>
      </div>

      {orgs.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <Building size={40} style={{ color: "var(--color-steel-light)", marginBottom: "1rem" }} />
            <h3 className="text-lg mb-2">No organisations yet</h3>
            <p className="text-sm text-steel mb-4">
              Create an organisation to start posting challenges and hiring talent.
            </p>
            <Link href="/org/new" className="btn btn-primary">
              Create organisation
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {orgs.map((org: any) => (
            <Link key={org.id} href={`/org/${org.id}`} className="card card-interactive p-5 block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-bone border border-steel-light flex items-center justify-center flex-shrink-0">
                  {org.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-md" />
                  ) : (
                    <Building size={20} style={{ color: "var(--color-steel)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-ink">{org.name}</span>
                    {org.verification_status === "verified" ? (
                      <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-steel" style={{ fontSize: "0.65rem" }}>
                        <AlertTriangle size={10} /> {org.verification_status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-steel">
                    <span className="badge badge-steel">{org.type}</span>
                    <span className="badge badge-ember">{org.my_role}</span>
                    {org.website && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={11} />
                        {org.website.replace(/^https?:\/\//, "").split("/")[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {org.description && (
                <p className="text-xs text-steel mt-3 leading-relaxed line-clamp-2">
                  {org.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
