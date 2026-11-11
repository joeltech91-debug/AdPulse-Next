"use client";

import GoogleSignIn from "@/components/google-sign-in";
import Link from "next/link";
import { useState } from "react";

const fieldClass = "mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const messages: Record<string, string> = {
          invalid_credentials: "Adresse e-mail ou mot de passe incorrect.",
          login_unavailable: "La connexion rencontre un problème technique. Réessayez plus tard.",
          service_not_configured: "Le service n'est pas encore correctement configuré. Contactez l'administrateur.",
        };
        throw new Error(messages[d.error] || "Connexion impossible pour le moment.");
      }
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-100 px-4 py-8">
      <section className="w-full max-w-lg rounded-3xl border border-white bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.12)] sm:p-9" aria-labelledby="login-title">
        <header className="mb-7 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-2xl font-black tracking-tight text-slate-900 no-underline">Ad<span className="text-violet-600">Pulse</span></Link>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700">Bon retour</p>
          <h1 id="login-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Connexion</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Connectez-vous pour retrouver vos liens et vos analyses.</p>
        </header>
        {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-800">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-bold text-slate-700">Adresse e-mail
            <input className={fieldClass} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Mot de passe
            <input className={fieldClass} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" />
          </label>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
            Afficher le mot de passe
          </label>
          <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-base font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
        <GoogleSignIn />
        <p className="mt-5 text-center text-sm text-slate-600">Pas encore de compte ? <Link className="font-bold text-violet-700 underline-offset-4 hover:underline" href="/inscription">Créer un compte gratuit</Link></p>
      </section>
    </main>
  );
}
