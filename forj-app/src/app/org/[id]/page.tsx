import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Building, Globe, CheckCircle, Clock, XCircle, AlertTriangle, Users, Edit } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Organisation" };

const VERIFICATION_BADGE: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  verified:   { label: "Verified",   className: "badge-success", icon: CheckCircle },
  pending:    { label: "Pending",    className: "badge-warning", icon: Clock },
  unverified: { label: "Unverified", className: "badge-steel",   icon: AlertTriangle },
  rejected:   { label: "Rejected",   className: "badge-danger",  icon: XCircle },
};

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!org) notFound();

  const { data: members } = await supabase
    .from("organization_members")
    .select("*, profiles(full_name, headline, avatar_url, role)")
    .eq("organization_id", params.id);

  const isOwner = org.owner_id === user.id;
  const isMember = members?.some((m) => m.profile_id === user.id);

  const badge = VERIFICATION_BADGE[org.verification_status];
  const BadgeIcon = badge.icon;

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-md bg-bone border border-steel-light flex items-center justify-center flex-shrink-0">
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-md" />
            ) : (
              <Building size={24} className="text-steel" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl mb-1">{org.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge-steel">{org.type}</span>
                  <span className={badge.className + " badge flex items-center gap-1"}>
                    <BadgeIcon size={12} />
                    {badge.label}
                  </span>
                </div>
              </div>
              {isOwner && (
                <Link href={`/org/${org.id}/edit`} className="btn-secondary btn btn-sm">
                  <Edit size={14} /> Edit
                </Link>
              )}
            </div>
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-steel hover:text-ember mt-2 w-fit"
              >
                <Globe size={14} /> {org.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
        {org.description && (
          <p className="text-sm text-steel mt-4 leading-relaxed">{org.description}</p>
        )}

        {/* Verification CTA for owner */}
        {isOwner && org.verification_status === "unverified" && (
          <div className="alert-warning mt-4">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <div>
              <p className="font-medium text-sm mb-0.5">Organisation not verified</p>
              <p className="text-xs">Submit for verification to publish paid roles and gain a trust badge.</p>
            </div>
            <Link href={`/org/${org.id}/verify`} className="btn-secondary btn btn-sm ml-auto flex-shrink-0">
              Request verification
            </Link>
          </div>
        )}
      </div>

      {/* Team members */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base">Team ({members?.length ?? 0})</h3>
          {isOwner && (
            <Link href={`/org/${org.id}/members/invite`} className="btn-secondary btn btn-sm">
              <Users size={14} /> Invite member
            </Link>
          )}
        </div>

        {members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              const p = member.profiles as any;
              return (
                <div key={member.profile_id} className="flex items-center gap-3">
                  <div className="avatar-md">
                    {p?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(p?.full_name ?? "?").charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p?.full_name ?? "Unknown"}</div>
                    {p?.headline && <div className="text-xs text-steel">{p.headline}</div>}
                  </div>
                  <span className="badge-steel">{member.member_role}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state py-8">
            <p className="text-sm text-steel">No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
