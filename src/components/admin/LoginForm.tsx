"use client";

import { motion } from "motion/react";
import { KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong w-full max-w-sm rounded-3xl p-7"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/12 bg-white/[.06]">
          <KeyRound className="size-5 text-prism-cyan" strokeWidth={1.6} />
        </div>

        <h1 className="mt-5 text-center text-xl font-medium tracking-tight text-white">
          Admin access
        </h1>
        <p className="mt-1.5 text-center text-[13px] text-haze-400">
          Enter the password to see incoming requests.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-haze-400 focus:border-prism-cyan/60 focus:bg-white/[.07]"
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-ink-950 transition hover:shadow-[0_10px_30px_-10px_rgba(94,231,255,.8)] disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Checking…" : "Sign in"}
        </button>
      </motion.form>
    </div>
  );
}
