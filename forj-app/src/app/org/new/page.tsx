"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Building, Globe, FileText, AlertCircle, Check, Loader2, ChevronRight } from "lucide-react";
import type { OrgType } from "@/types/supabase";

const ORG_TYPES: { value: OrgType; label: string; description: string }[] = [
  { value: "startup",     label: "Startup",     description: "Early-stage or growth-stage startup" },
  { value: "company",     label: "Company",     description: "Established business or enterprise" },
  { value: "incubator",   label: "Incubator",   description: "Startup program or accelerator" },
  { value: "institution", label: "Institution", description: "University, college, or research body" },
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName]         = useState("");
  const [type, setType]         = useState<OrgType>("company");
  const [website, setWebsite]   = useState("");
  const [description, setDesc]  = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setSaving(false); return; }

    // Validate website
    if (website && !website.match(/^https?:\/\//)) {
      setError("Website must start with https:// or http://");
      setSaving(false);
      return;
    }

    const { data: org, error: insertError } = await supabase
      .from("organizations")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        type,
        website: website.trim() || null,
        description: description.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Add owner to organization_members
    await supabase.from("organization_members").insert({
      organization_id: org.id,
      profile_id: user.id,
      member_role: "owner",
    });

    router.push(`/org/${org.id}`);
    router.refresh();
  }

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl mb-1">Create organisation</h1>
          <p className="text-steel text-sm">
            Set up your organisation to post challenges and hire talent.
            Organisations must be verified to publish paid roles.
          </p>
        </div>

        {error && (
          <div className="alert-danger mb-5 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Org type */}
          <div className="field">
            <label className="label label-required">Organisation type</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {ORG_TYPES.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col p-3 border rounded text-left transition-all duration-150 ${
                    type === value
                      ? "border-ember bg-orange-50 text-ink"
                      : "border-steel-light bg-paper text-steel hover:border-steel hover:text-ink"
                  }`}
                  id={`org-type-${value}`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="field">
            <label htmlFor="org-name" className="label label-required">Organisation name</label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                id="org-name"
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-9"
                placeholder="NexWave Technologies"
              />
            </div>
          </div>

          {/* Website */}
          <div className="field">
            <label htmlFor="org-website" className="label">Website</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                id="org-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input pl-9"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Description */}
          <div className="field">
            <label htmlFor="org-description" className="label">About your organisation</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-steel" />
              <textarea
                id="org-description"
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                className="textarea pl-9"
                placeholder="Tell candidates what your organisation does and what you're building…"
                maxLength={3000}
                rows={4}
              />
            </div>
            <p className="field-hint">{description.length}/3000</p>
          </div>

          {/* Verification notice */}
          <div className="alert-warning">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-0.5">Verification required for paid roles</p>
              <p className="text-xs">
                After creating your organisation, submit for verification. Unverified
                organisations can post challenges but cannot publish paid roles.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary btn w-full justify-center"
            id="create-org-btn"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Creating…</>
            ) : (
              <>Create organisation <ChevronRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
