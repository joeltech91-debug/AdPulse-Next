"use client";

import GoogleSignIn from "@/components/google-sign-in";
import FacebookSignIn from "@/components/facebook-sign-in";
import Link from "next/link";
import { useState } from "react";

const fieldClass = "mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 10) {
      setError("Choisissez un mot de passe d'au moins 10 caractères.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), firstName: firstName.trim(), email: email.trim(), password, passwordConfirm }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const messages: Record<string, string> = {
          email_already_exists: "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.",
          invalid_registration: "Vérifiez les champs et le mot de passe (10 caractères minimum).",
          registration_unavailable: "Le service d'inscription rencontre un problème. Réessayez plus tard ou contactez l'assistance si le problème persiste.",
          service_not_configured: "Le service n'est pas encore correctement configuré. Contactez l'administrateur.",
        };
        throw new Error(messages[d.error] || "Impossible de créer le compte pour le moment.");
      }
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f5f6fc] px-4 py-8 sm:px-6 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_rgba(30,27,75,0.14)] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#21164f] via-[#35227b] to-[#5b42c7] p-10 text-white lg:flex xl:p-12">
          <div aria-hidden="true" className="absolute -right-28 top-20 h-80 w-80 rounded-full border-[48px] border-white/[0.06]" />
          <div aria-hidden="true" className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-violet-400/20 blur-2xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-1 text-3xl font-black tracking-tight text-white no-underline">Ad<span className="text-violet-300">Pulse</span><span className="ml-2 rounded-full border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100">Analytics</span></Link>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Votre croissance commence ici</p>
              <h2 className="mt-4 text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Pilotez vos campagnes avec confiance.</h2>
              <p className="mt-5 text-base leading-7 text-violet-100/85">Un seul espace pour suivre vos liens, mesurer vos résultats et comprendre vos dépenses publicitaires.</p>
            </div>
          </div>
          <div className="relative space-y-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
            <p className="text-sm font-bold text-white">Commencez sans engagement</p>
            <div className="flex items-center gap-3 text-sm text-violet-100"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">✓</span>1 lien gratuit pour démarrer</div>
            <div className="flex items-center gap-3 text-sm text-violet-100"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">✓</span>30 clics inclus</div>
            <div className="flex items-center gap-3 text-sm text-violet-100"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">✓</span>Aucune carte bancaire requise</div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-9 sm:px-10 sm:py-11 lg:px-12 xl:px-14" aria-labelledby="register-title">
          <div className="w-full max-w-xl">
            <div className="mb-7 lg:hidden"><Link href="/" className="text-2xl font-black tracking-tight text-slate-900 no-underline">Ad<span className="text-violet-600">Pulse</span></Link></div>
            <header className="mb-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">Démarrez gratuitement</p>
              <h1 id="register-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Créez votre compte.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Suivez vos liens, mesurez vos campagnes et comprenez votre audience.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-violet-800 lg:hidden">
                <span className="rounded-full bg-violet-50 px-3 py-2">✓ 1 lien gratuit</span>
                <span className="rounded-full bg-violet-50 px-3 py-2">✓ 30 clics inclus</span>
                <span className="rounded-full bg-violet-50 px-3 py-2">✓ Sans carte bancaire</span>
              </div>
            </header>
            {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-800">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">Nom
                  <input className={fieldClass} autoComplete="family-name" required maxLength={250} value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" />
                </label>
                <label className="block text-sm font-bold text-slate-700">Prénom
                  <input className={fieldClass} autoComplete="given-name" required maxLength={250} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Votre prénom" />
                </label>
              </div>
              <label className="block text-sm font-bold text-slate-700">Adresse e-mail
                <input className={fieldClass} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required maxLength={250} value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">Mot de passe
                  <input className={fieldClass} type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} placeholder="10 caractères minimum" />
                </label>
                <label className="block text-sm font-bold text-slate-700">Confirmation
                  <input className={fieldClass} type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={10} maxLength={128} required value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Répétez le mot de passe" />
                </label>
              </div>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-500">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
                Afficher les mots de passe
              </label>
              <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-base font-extrabold text-white shadow-lg shadow-violet-200/80 transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-violet-300/70 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Création du compte…" : "Créer mon compte gratuit"} {!busy && <span aria-hidden="true">→</span>}</button>
            </form>
            <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou continuer avec<span className="h-px flex-1 bg-slate-200" /></div>
            <GoogleSignIn />
            <div className="mt-3"><FacebookSignIn /></div>
            <p className="mt-7 text-center text-sm text-slate-500">Déjà inscrit ? <Link className="font-extrabold text-violet-700 underline-offset-4 hover:underline" href="/connexion">Se connecter</Link></p>
            <p className="mt-4 text-center text-xs leading-5 text-slate-400">En créant un compte, vous pourrez commencer avec l'offre gratuite AdPulse.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
