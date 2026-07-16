"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { KeyRound } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <div className="mx-auto mt-32 max-w-sm rounded-2xl border border-white/10 bg-ink-800/60 p-6 text-center">
        <KeyRound className="mx-auto mb-3 text-gold-400" size={22} />
        <p className="font-display text-lg text-parchment-100">Local dev mode</p>
        <p className="mt-2 text-sm text-stone-400">
          No Firebase project is configured yet, so the admin panel is open for local testing
          without signing in.
        </p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-5 w-full rounded-full bg-gold-500 py-2 text-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
        >
          Continue to Admin
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      router.push("/admin");
    } catch {
      setError("Sign-in failed. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-32 flex max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800/60 p-6"
    >
      <div className="text-center">
        <KeyRound className="mx-auto mb-2 text-gold-400" size={22} />
        <p className="font-display text-lg text-parchment-100">Admin sign-in</p>
      </div>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-gold-500 py-2 text-sm font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
