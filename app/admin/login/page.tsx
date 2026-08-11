"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.replace(params.get("from") || "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-sm px-5 py-24 sm:px-8">
      <div className="rounded-sm border border-line/60 bg-slate/40 p-7 shadow-lift">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
          Catalog manager
        </p>
        <h1 className="mt-2 font-display text-3xl text-cream">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
              Email
            </span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="input mt-1.5"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1.5"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          {error && (
            <p className="rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
