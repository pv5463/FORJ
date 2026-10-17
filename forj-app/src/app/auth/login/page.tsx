"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="lg:hidden brand-mark" style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        F<span style={{ color: "var(--color-ember)" }}>O</span>RJ
      </div>

      <h2 style={{ marginBottom: "0.25rem" }}>Welcome back</h2>
      <p style={{ color: "var(--color-steel)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Sign in to your FORJ account
      </p>

      {error && (
        <div className="alert alert-danger animate-fade-in" style={{ marginBottom: "1.25rem" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="field">
          <label htmlFor="email" className="label label-required">Email address</label>
          <input
            id="email"
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
            <label htmlFor="password" className="label" style={{ margin: 0 }}>
              Password <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <Link href="/auth/forgot-password" style={{ fontSize: "0.75rem", color: "var(--color-ember)" }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{ paddingRight: "2.5rem" }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "0.75rem", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-steel)", display: "flex", padding: "0",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          id="login-submit-btn"
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                width: "1rem", height: "1rem",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                display: "inline-block",
              }} />
              Signing in…
            </span>
          ) : (
            <><LogIn size={16} /> Sign in</>
          )}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
        <div style={{ flex: 1, borderTop: "1px solid var(--color-steel-light)" }} />
        <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>or continue with</span>
        <div style={{ flex: 1, borderTop: "1px solid var(--color-steel-light)" }} />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="btn btn-secondary"
        style={{ width: "100%", justifyContent: "center" }}
        id="google-login-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-steel)", marginTop: "1.5rem" }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" style={{ color: "var(--color-ember)", fontWeight: 500 }}>
          Sign up free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen" style={{ display: "flex", background: "var(--color-bone)" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex" style={{
        width: "45%",
        background: "var(--color-ink)",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3rem",
      }}>
        <div className="brand-mark" style={{ fontSize: "1.75rem", color: "white" }}>
          F<span style={{ color: "var(--color-ember)" }}>O</span>RJ
        </div>
        <div>
          <blockquote style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: "1.5rem",
            color: "white",
            fontWeight: 300,
            lineHeight: 1.4,
            marginBottom: "1rem",
          }}>
            &ldquo;Proof over promises. Work over words.&rdquo;
          </blockquote>
          <p style={{ color: "var(--color-steel-light)", fontSize: "0.875rem" }}>
            FORJ connects early-career talent with opportunities through real, verifiable work.
          </p>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
          Smart India Hackathon · Entrepreneurship &amp; Employment
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <Suspense fallback={
          <div style={{ width: "100%", maxWidth: "28rem" }}>
            <div className="skeleton" style={{ height: "2rem", width: "60%", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: "1rem", width: "40%", marginBottom: "2rem" }} />
            <div className="skeleton" style={{ height: "2.5rem", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: "2.5rem", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: "2.5rem" }} />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
