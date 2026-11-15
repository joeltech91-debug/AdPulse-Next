"use client";

import GoogleSignIn from "@/components/google-sign-in";
import FacebookSignIn from "@/components/facebook-sign-in";
import Link from "next/link";
import { useState } from "react";

const fieldClass = "mt-2 block min-h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

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
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f5f6fc] px-4 py-8 sm:px-6 lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_rgba(30,27,75,0.14)] lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#21164f] via-[#35227b] to-[#5b42c7] p-10 text-white lg:flex xl:p-12">
          <div aria-hidden="true" className="absolute -right-28 top-20 h-80 w-80 rounded-full border-[48px] border-white/[0.06]" />
          <div aria-hidden="true" className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-violet-400/20 blur-2xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-1 text-3xl font-bold text-white no-underline">Ad<span className="text-violet-300">Pulse</span><span className="ml-2 rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold text-violet-100">Analytics</span></Link>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-semibold text-violet-200">Vos campagnes, plus claires</p>
              <h2 className="mt-4 text-4xl font-bold leading-[1.18] xl:text-5xl">Chaque clic raconte une histoire.</h2>
              <p className="mt-5 text-base leading-7 text-violet-100/85">Retrouvez vos liens, suivez vos résultats et gardez vos dépenses publicitaires sous contrôle.</p>
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-violet-100"><span>Vue d'ensemble</span><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">En temps réel</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.08] p-4"><p className="text-xs text-violet-200">Suivi des clics</p><p className="mt-1 text-2xl font-semibold">Live</p></div>
              <div className="rounded-xl bg-white/[0.08] p-4"><p className="text-xs text-violet-200">Performance</p><p className="mt-1 text-2xl font-semibold">Clair</p></div>
            </div>
          </div>
        </aside>
        <section className="flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16" aria-labelledby="login-title">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Link href="/" className="text-2xl font-bold text-slate-900 no-underline">Ad<span className="text-violet-600">Pulse</span></Link></div>
            <header className="mb-8">
              <p className="text-xs font-semibold text-violet-700">Bon retour</p>
              <h1 id="login-title" className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Content de vous revoir.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Connectez-vous pour retrouver vos liens et vos analyses.</p>
            </header>
            {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-800">{error}</div>}
            <form onSubmit={submit} className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">Adresse e-mail
                <input className={fieldClass} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Mot de passe
                <input className={fieldClass} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" />
              </label>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-500">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
                Afficher le mot de passe
              </label>
              <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-violet-200/80 transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-violet-300/70 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Connexion…" : "Se connecter"}</button>
            </form>
            <div className="my-6 flex items-center gap-3 text-[11px] font-semibold text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou continuer avec<span className="h-px flex-1 bg-slate-200" /></div>
            <GoogleSignIn />
            <div className="mt-3"><FacebookSignIn /></div>
            <p className="mt-8 text-center text-sm text-slate-500">Pas encore de compte ? <Link className="font-semibold text-violet-700 underline-offset-4 hover:underline" href="/inscription">Créer un compte gratuit</Link></p>
            <p className="mt-7 text-center text-xs text-slate-400">Connexion sécurisée · AdPulse</p>
          </div>
        </section>
      </div>
    </main>
  );
}
