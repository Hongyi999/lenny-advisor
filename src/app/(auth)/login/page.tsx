"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/chat";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <Link href="/" className="inline-block mb-6">
          <h1 className="font-serif text-3xl font-bold text-sand-900 tracking-tight">
            Lenny Advisor
          </h1>
        </Link>
        <p className="text-sand-600 text-lg">
          Welcome back. Sign in to continue.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-sand-300 bg-white text-sand-900 placeholder:text-sand-400 transition-colors hover:border-sand-400 focus:border-accent"
              placeholder="Your password"
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
              <LogIn className="w-4.5 h-4.5" />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sand-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-accent font-medium hover:underline inline-flex items-center gap-1"
        >
          Create one <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="flex-1 flex items-center justify-center px-4 py-12 relative"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,168,83,0.12) 0%, rgba(245,240,232,0) 70%)",
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
