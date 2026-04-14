"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Mail, Lock, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div
        className="flex-1 flex items-center justify-center px-4 py-12 relative"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,168,83,0.12) 0%, rgba(245,240,232,0) 70%)",
        }}
      >
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-sage-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-sand-900 mb-3">
            Check your email
          </h2>
          <p className="text-sand-600 text-lg mb-8">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link to activate your account.
          </p>
          <Link
            href="/login"
            className="text-accent font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex items-center justify-center px-4 py-12 relative"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,168,83,0.12) 0%, rgba(245,240,232,0) 70%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-serif text-3xl font-bold text-sand-900 tracking-tight">
              Lenny Advisor
            </h1>
          </Link>
          <p className="text-sand-600 text-lg">
            Create your account to get started.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-warm-100 border border-warm-300 px-4 py-3 text-warm-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-sand-700 mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-sand-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-sand-300 bg-white text-sand-900 placeholder:text-sand-400 transition-colors hover:border-sand-400 focus:border-accent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-sand-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-sand-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-sand-300 bg-white text-sand-900 placeholder:text-sand-400 transition-colors hover:border-sand-400 focus:border-accent"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-accent text-white font-medium transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sand-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent font-medium hover:underline inline-flex items-center gap-1"
          >
            Sign in <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
