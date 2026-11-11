"use client";

import GoogleSignIn from "@/components/google-sign-in";
import Link from "next/link";
import { useState } from "react";

const fieldClass = "mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

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
    <main className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-100 px-4 py-8">
      <section className="w-full max-w-xl rounded-3xl border border-white bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.12)] sm:p-9" aria-labelledby="register-title">
        <header className="mb-7 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-2xl font-black tracking-tight text-slate-900 no-underline">
            Ad<span className="text-violet-600">Pulse</span>
          </Link>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700">Démarrez gratuitement</p>
          <h1 id="register-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Créer votre compte</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">Suivez vos liens, mesurez vos campagnes et comprenez votre audience.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-violet-800">
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
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
            Afficher les mots de passe
          </label>
          <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-base font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Création du compte…" : "Créer mon compte gratuit"} {!busy && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
        <GoogleSignIn />
        <p className="mt-5 text-center text-sm text-slate-600">Déjà inscrit ? <Link className="font-bold text-violet-700 underline-offset-4 hover:underline" href="/connexion">Se connecter</Link></p>
        <p className="mt-4 text-center text-xs leading-5 text-slate-400">En créant un compte, vous pourrez commencer avec l'offre gratuite AdPulse.</p>
      </section>
    </main>
  );
}
