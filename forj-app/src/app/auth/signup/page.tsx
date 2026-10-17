"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff, UserPlus, AlertCircle, Briefcase, TrendingUp, Users } from "lucide-react";
import type { UserRole } from "@/types/supabase";

const ROLES: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: "candidate", label: "Talent / Job Seeker", description: "Looking for jobs, internships, or paid projects", icon: Briefcase },
  { value: "employer",  label: "Employer / Startup",  description: "Post challenges and hire verified talent",      icon: Users },
  { value: "mentor",    label: "Mentor / Advisor",    description: "Guide founders and aspiring entrepreneurs",     icon: TrendingUp },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole | null;

  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]               = useState<UserRole>(roleParam ?? "candidate");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role },
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  if (success) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <UserPlus size={28} className="text-success" />
        </div>
        <h3 className="mb-2">Check your email</h3>
        <p className="text-steel text-sm mb-6">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/auth/login" className="btn-primary btn">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="lg:hidden brand-mark text-2xl mb-8">F<span className="text-ember">O</span>RJ</div>

      <h2 className="mb-1">Create your account</h2>
      <p className="text-steel text-sm mb-6">Join FORJ — it&apos;s free to get started</p>

      {error && (
        <div className="alert-danger mb-5 animate-fade-in">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Role selector */}
        <div className="field">
          <label className="label label-required">I am a…</label>
          <div className="grid gap-2">
            {ROLES.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex items-center gap-3 p-3 border rounded text-left transition-all duration-150 ${
                  role === value
                    ? "border-ember bg-orange-50 text-ink"
                    : "border-steel-light bg-paper text-steel hover:border-steel hover:text-ink"
                }`}
                id={`role-${value}`}
              >
                <Icon size={18} className={role === value ? "text-ember" : "text-steel"} />
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                </div>
                {role === value && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-ember flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="full-name" className="label label-required">Full name</label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="Arjun Sharma"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-email" className="label label-required">Email address</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-password" className="label label-required">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="field-hint">At least 8 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn w-full justify-center mt-2"
          id="signup-submit-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account…
            </span>
          ) : (
            <>
              <UserPlus size={16} /> Create account
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 border-t border-steel-light" />
        <span className="text-xs text-steel">or</span>
        <div className="flex-1 border-t border-steel-light" />
      </div>

      <button
        onClick={handleGoogleSignup}
        className="btn-secondary btn w-full justify-center"
        id="google-signup-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-steel mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-ember font-medium hover:text-ember-dark">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-steel mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bone)" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex w-2/5 bg-ink flex-col justify-between p-12">
        <div className="brand-mark text-3xl text-white">
          F<span className="text-ember">O</span>RJ
        </div>
        <div>
          <h2 className="text-white font-heading text-2xl mb-4 font-light">
            Your work is your credential.
          </h2>
          <div className="space-y-4">
            {[
              "Complete real challenges set by employers",
              "Build a verified proof-of-work portfolio",
              "Get AI-assisted skill matching — no guessing",
              "Apply to jobs, internships, and paid projects",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-ember mt-2 flex-shrink-0" />
                <p className="text-steel-light text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-steel">
          Smart India Hackathon · Entrepreneurship &amp; Employment
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Suspense fallback={<div className="skeleton w-full max-w-md h-96" />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
