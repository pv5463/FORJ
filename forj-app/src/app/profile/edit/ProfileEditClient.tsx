"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Upload, X, Plus, Check, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import type { Profile, Skill, ProfileSkill } from "@/types/supabase";

interface ProfileEditClientProps {
  profile: Profile;
  userSkills: (ProfileSkill & { skills: Skill })[];
  allSkills: Skill[];
}

const SKILL_LEVELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

export default function ProfileEditClient({
  profile,
  userSkills,
  allSkills,
}: ProfileEditClientProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fullName, setFullName]   = useState(profile.full_name);
  const [headline, setHeadline]   = useState(profile.headline ?? "");
  const [bio, setBio]             = useState(profile.bio ?? "");
  const [location, setLocation]   = useState(profile.location ?? "");
  const [lang, setLang]           = useState(profile.preferred_language);

  // Avatar
  const [avatarUrl, setAvatarUrl]     = useState(profile.avatar_url ?? "");
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Skills
  const [mySkills, setMySkills] = useState<(ProfileSkill & { skills: Skill })[]>(userSkills);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState(false);

  // Resume skill extraction
  const [resumeText, setResumeText]       = useState("");
  const [extracting, setExtracting]       = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);

  const filteredSkills = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !mySkills.some((ms) => ms.skill_id === s.id)
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be under 5 MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!avatarFile) return avatarUrl || null;
    setUploadingAvatar(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    setUploadingAvatar(false);

    if (uploadError) {
      setError(`Avatar upload failed: ${uploadError.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    return publicUrl;
  }

  async function addSkill(skill: Skill, level: number = 3) {
    setAddingSkill(true);
    const { error: insertError } = await supabase.from("profile_skills").insert({
      profile_id: profile.id,
      skill_id: skill.id,
      level,
      source: "self",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMySkills((prev) => [
        ...prev,
        { profile_id: profile.id, skill_id: skill.id, level, source: "self", created_at: new Date().toISOString(), skills: skill },
      ]);
      setSkillSearch("");
      setSkillDropdownOpen(false);
    }
    setAddingSkill(false);
  }

  async function removeSkill(skillId: string) {
    const { error: deleteError } = await supabase
      .from("profile_skills")
      .delete()
      .eq("profile_id", profile.id)
      .eq("skill_id", skillId);

    if (!deleteError) {
      setMySkills((prev) => prev.filter((s) => s.skill_id !== skillId));
    }
  }

  async function updateSkillLevel(skillId: string, level: number) {
    await supabase
      .from("profile_skills")
      .update({ level })
      .eq("profile_id", profile.id)
      .eq("skill_id", skillId);

    setMySkills((prev) =>
      prev.map((s) => (s.skill_id === skillId ? { ...s, level } : s))
    );
  }

  async function handleExtractSkills() {
    if (!resumeText.trim() || resumeText.length < 50) {
      setError("Please paste at least 50 characters of resume text.");
      return;
    }
    setExtracting(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract-skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ resume_text: resumeText }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Extraction failed");
    } else {
      const matched: Skill[] = json.matched_skills.map((m: { skill_id: string; name: string; category: string }) => ({
        id: m.skill_id, name: m.name, category: m.category, is_verified: true, created_at: "",
      }));
      setExtractedSkills(matched.filter((s) => !mySkills.some((ms) => ms.skill_id === s.id)));
    }
    setExtracting(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    // Upload avatar if changed
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      const uploaded = await uploadAvatar(profile.id);
      if (!uploaded) { setSaving(false); return; }
      finalAvatarUrl = uploaded;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        preferred_language: lang,
        avatar_url: finalAvatarUrl || null,
        onboarding_completed: !!(fullName && headline && bio),
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-1">Edit profile</h1>
          <p className="text-steel text-sm">Keep your profile up to date to improve match quality.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary btn"
          id="save-profile-btn"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={16} /> Saved</>
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      {error && (
        <div className="alert-danger animate-fade-in">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="card p-6">
        <h3 className="text-base mb-4">Profile photo</h3>
        <div className="flex items-center gap-5">
          <div className="avatar-xl relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-heading">{fullName.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Upload size={18} className="text-white" />
            </div>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary btn btn-sm"
            >
              <Upload size={14} /> Upload photo
            </button>
            <p className="text-xs text-steel mt-1.5">JPG, PNG, WebP. Max 5 MB.</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-6">
        <h3 className="text-base mb-4">Basic information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="full-name-edit" className="label label-required">Full name</label>
            <input
              id="full-name-edit"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="location-edit" className="label">Location</label>
            <input
              id="location-edit"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="Bengaluru, India"
              maxLength={200}
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="headline-edit" className="label">Professional headline</label>
            <input
              id="headline-edit"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="input"
              placeholder="Full-stack developer, B.Tech CS 2025"
              maxLength={300}
            />
            <p className="field-hint">{headline.length}/300</p>
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="bio-edit" className="label">Bio</label>
            <textarea
              id="bio-edit"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea"
              placeholder="Tell employers and co-founders about yourself…"
              maxLength={2000}
              rows={4}
            />
            <p className="field-hint">{bio.length}/2000</p>
          </div>
          <div className="field">
            <label htmlFor="lang-select" className="label">Preferred language</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "hi")}
              className="input"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h3 className="text-base mb-4">Skills</h3>

        {/* Current skills */}
        {mySkills.length > 0 ? (
          <div className="space-y-2 mb-4">
            {mySkills.map((ms) => (
              <div key={ms.skill_id} className="flex items-center gap-3 p-2.5 bg-bone rounded-md border border-steel-light">
                <span className="flex-1 text-sm font-medium">{ms.skills.name}</span>
                <span className="badge-steel text-xs">{ms.skills.category}</span>
                <select
                  value={ms.level}
                  onChange={(e) => updateSkillLevel(ms.skill_id, Number(e.target.value))}
                  className="text-xs border border-steel-light rounded px-1.5 py-0.5 bg-paper"
                  aria-label={`Level for ${ms.skills.name}`}
                >
                  {Object.entries(SKILL_LEVELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(ms.skill_id)}
                  className="text-steel hover:text-danger transition-colors p-1"
                  aria-label={`Remove ${ms.skills.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state py-8 mb-4">
            <p className="text-sm text-steel">No skills added yet. Add skills to improve matching.</p>
          </div>
        )}

        {/* Skill search */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => { setSkillSearch(e.target.value); setSkillDropdownOpen(true); }}
                onFocus={() => setSkillDropdownOpen(true)}
                className="input"
                placeholder="Search and add skills…"
                id="skill-search"
              />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
            </div>
          </div>
          {skillDropdownOpen && filteredSkills.length > 0 && (
            <div className="absolute z-10 mt-1 w-full card max-h-52 overflow-y-auto shadow-card-hover">
              {filteredSkills.slice(0, 20).map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => addSkill(skill)}
                  disabled={addingSkill}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-bone text-left transition-colors"
                >
                  <span>{skill.name}</span>
                  <span className="badge-steel text-xs">{skill.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resume extraction */}
        <div className="mt-6 border-t border-steel-light pt-5">
          <h4 className="text-sm font-medium mb-2">Extract skills from resume</h4>
          <p className="text-xs text-steel mb-3">Paste your resume text and AI will suggest skills to add.</p>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="textarea text-xs"
            placeholder="Paste your resume text here (at least 50 characters)…"
            rows={5}
          />
          {extractedSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-ink mb-2">Suggested skills — click to add:</p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      addSkill(s);
                      setExtractedSkills((prev) => prev.filter((es) => es.id !== s.id));
                    }}
                    className="skill-pill hover:skill-pill-active flex items-center gap-1"
                  >
                    <Plus size={12} /> {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleExtractSkills}
            disabled={extracting || resumeText.length < 50}
            className="btn-secondary btn btn-sm mt-3"
          >
            {extracting ? (
              <><Loader2 size={14} className="animate-spin" /> Extracting…</>
            ) : (
              "Extract skills with AI"
            )}
          </button>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary btn"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={16} /> Saved</>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}
