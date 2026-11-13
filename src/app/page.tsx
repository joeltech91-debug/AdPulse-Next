import { getSessionUserId } from "@/lib/session";
const features = [
  { icon: "↗", title: "Liens courts pilotables", text: "Centralisez vos liens de campagne, modifiez leur destination sans changer le lien partagé et suivez chaque performance." },
  { icon: "◷", title: "Monitoring en direct", text: "Consultez les dernières visites, les événements et l'évolution du trafic avec une actualisation automatique." },
  { icon: "◎", title: "Géographie de l'audience", text: "Identifiez les pays et continents qui génèrent vos clics pour mieux comprendre où se trouve votre audience." },
  { icon: "⌁", title: "Attribution UTM", text: "Comparez les sources, supports, campagnes et domaines référents pour mesurer l'origine de votre trafic." },
  { icon: "↗", title: "Conversions & valeur", text: "Suivez les achats, prospects, inscriptions et ajouts au panier, avec valeur et devise associées." },
  { icon: "✓", title: "Détection anti-fraude", text: "Isolez les robots et répétitions détectés afin de distinguer le trafic valide des signaux suspects." },
  { icon: "▥", title: "Analyse multi-appareils", text: "Comparez les clics mobiles et ordinateur, consultez les tendances sur 14 jours et les indicateurs sur 30 jours." },
  { icon: "⇩", title: "Rapports exploitables", text: "Exportez les événements des 30 derniers jours en CSV pour vos tableaux de bord et vos analyses marketing." },
];

const plans = [
  { name: "Free", price: "0 $", detail: "1 lien · 30 clics" },
  { name: "Standard", price: "9 $", detail: "5 liens · 350 clics" },
  { name: "Advanced", price: "19 $", detail: "20 liens · 1 250 clics · Analytics" },
  { name: "Unlimited", price: "59 $", detail: "Liens et clics illimités" },
];

export default async function HomePage() {
  const signedIn = Boolean(await getSessionUserId());
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="navbar mx-auto max-w-7xl px-5 py-5 lg:px-8">
        <a href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <img src="/adpulse-logo.svg" alt="AdPulse" className="h-10 w-auto" />
        </a>
        <nav className="ml-auto hidden items-center gap-8 text-sm font-semibold text-base-content/65 md:flex">
          <a href="#features" className="hover:text-primary">Fonctionnalités</a>
          <a href="#pricing" className="hover:text-primary">Tarifs</a>
          <a href="/guide-optimisation" className="hover:text-primary">Guide d'optimisation</a>
        </nav>
        <div className="ml-auto flex gap-2 md:ml-8">
          {signedIn ? <a className="btn btn-primary btn-sm rounded-lg px-4" href="/dashboard">Mon tableau de bord</a> : <><a className="btn btn-ghost btn-sm" href="/connexion">Connexion</a><a className="btn btn-primary btn-sm rounded-lg px-4" href="/inscription">Commencer</a></>}
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-24">
        <div>
          <div className="badge badge-primary badge-outline mb-6 gap-2 rounded-full px-3 py-4">● Tracking intelligent · Analytics marketing · Anti-fraude</div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-[.22em] text-primary">Vos clics. Vos données. Votre croissance.</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Chaque clic peut faire grandir votre activité. <span className="text-primary">Mesurez. Comprenez. Convertissez.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-base-content/65">
            getAdPulse — Transformez chaque clic en décision rentable. Mesurez vos clics, identifiez vos sources d'acquisition, analysez les pays et les appareils, suivez vos conversions et détectez le trafic suspect depuis un seul tableau de bord.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="/inscription" className="btn btn-primary btn-lg rounded-xl px-7">Créer mon compte gratuitement <span aria-hidden>→</span></a>
            <a href="#features" className="btn btn-ghost btn-lg rounded-xl">Découvrir getAdPulse</a>
          </div>
          <p className="mt-4 text-xs text-base-content/50">Sans carte bancaire · Mise en place simple</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
          <div className="card relative border border-base-300/70 bg-base-100 shadow-2xl shadow-primary/10">
            <div className="card-body gap-6 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-base-content/50">Aperçu des performances</p><h2 className="text-xl font-bold">Vue d'ensemble</h2></div>
                <span className="badge badge-success badge-outline">● En direct</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-base-200/70 p-4"><p className="text-xs text-base-content/55">Clics suivis</p><p className="mt-2 text-3xl font-black">12 840</p><p className="mt-1 text-xs text-success">↗ Exemple de données</p></div>
                <div className="rounded-2xl bg-base-200/70 p-4"><p className="text-xs text-base-content/55">Conversions</p><p className="mt-2 text-3xl font-black">684</p><p className="mt-1 text-xs text-success">↗ Exemple de données</p></div>
              </div>
              <div className="rounded-2xl border border-base-300 p-4">
                <div className="mb-5 flex items-center justify-between"><span className="text-sm font-bold">Activité des liens</span><span className="text-xs text-base-content/45">7 derniers jours</span></div>
                <div className="flex h-32 items-end gap-2">
                  {[38,58,45,76,54,88,67,96,62,78,51,86,70,100,73,90,64,82,55,94,72,88,60,79].map((height, i) => <div key={i} className="flex-1 rounded-t-md bg-primary/75" style={{ height: height + "%" }} />)}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-base-content/45"><span>Lun.</span><span>Mer.</span><span>Ven.</span><span>Dim.</span></div>
              </div>
              <p className="text-center text-xs text-base-content/40">Illustration de l'interface — chiffres fictifs</p>
            </div>
          </div>
        </div>
      </section>


      <section aria-label="Résultats des campagnes publicitaires" className="border-y border-base-300/70 bg-base-200/50 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Nos campagnes en chiffres</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Nous mesurons aussi nos propres campagnes.</h2>
            <p className="mt-4 leading-7 text-base-content/65">Chez getAdPulse, nous croyons aux décisions basées sur les données. Nous analysons nos propres publicités pour comprendre nos performances et améliorer nos actions. Voici le bilan des 30 derniers jours.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Dépenses publicitaires</p><p className="mt-2 text-3xl font-black">9,31 $</p><p className="mt-1 text-xs text-base-content/45">Sur 9 publicités · 30 derniers jours</p></article>
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Vues des publicités</p><p className="mt-2 text-3xl font-black text-primary">35,7 K</p><p className="mt-1 text-xs text-base-content/45">Toutes les campagnes affichées</p></article>
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Personnes touchées</p><p className="mt-2 text-3xl font-black">24,4 K</p><p className="mt-1 text-xs text-base-content/45">Couverture totale</p></article>
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Interactions avec les publications</p><p className="mt-2 text-3xl font-black">1,08 K</p><p className="mt-1 text-xs text-base-content/45">Interactions enregistrées</p></article>
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Conversations démarrées</p><p className="mt-2 text-3xl font-black">1,06 K</p><p className="mt-1 text-xs text-base-content/45">Conversations par message</p></article>
            <article className="rounded-2xl border border-base-300/70 bg-base-100 p-6 shadow-sm"><p className="text-sm font-semibold text-base-content/55">Vues de pages de destination</p><p className="mt-2 text-3xl font-black text-success">273</p><p className="mt-1 text-xs text-base-content/45">Sur les deux campagnes détaillées précédemment</p></article>
          </div>
          <p className="mt-4 text-center text-xs text-base-content/45">Bilan publicitaire communiqué depuis les statistiques de la plateforme sur les 30 derniers jours. Les 273 vues de pages de destination concernent deux campagnes spécifiques et ne représentent pas nécessairement les 9 publicités.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-primary px-7 py-10 text-primary-content shadow-xl sm:px-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-primary-content/70">La communauté getAdPulse</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Près de 1 000 e-commerçants et marketeurs ont déjà approuvé getAdPulse.</h2>
            <p className="mt-5 text-base leading-7 text-primary-content/85">Rejoignez celles et ceux qui veulent mieux comprendre leurs campagnes, suivre leurs liens et prendre leurs décisions à partir de données concrètes.</p>
            <a href="/inscription" className="btn mt-8 rounded-xl border-0 bg-base-100 px-7 text-primary hover:bg-base-200">Rejoindre getAdPulse <span aria-hidden>→</span></a>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="card border border-base-300/70 bg-base-100 shadow-sm"><div className="card-body p-6"><span className="text-2xl text-primary" aria-hidden>↗</span><h3 className="text-lg font-bold">« Je sais d'où viennent mes clics. »</h3><p className="text-sm leading-6 text-base-content/60">Centralisez vos liens et identifiez les campagnes, sources et supports qui attirent votre audience.</p></div></article>
          <article className="card border border-base-300/70 bg-base-100 shadow-sm"><div className="card-body p-6"><span className="text-2xl text-primary" aria-hidden>▥</span><h3 className="text-lg font-bold">« Je comprends mieux mes performances. »</h3><p className="text-sm leading-6 text-base-content/60">Analysez les visites, les appareils et la géographie de votre trafic dans un seul tableau de bord.</p></div></article>
          <article className="card border border-base-300/70 bg-base-100 shadow-sm"><div className="card-body p-6"><span className="text-2xl text-primary" aria-hidden>✓</span><h3 className="text-lg font-bold">« Je prends mes décisions avec des données. »</h3><p className="text-sm leading-6 text-base-content/60">Suivez vos conversions, repérez les signaux suspects et ajustez vos actions marketing avec plus de clarté.</p></div></article>
        </div>
        <p className="mt-3 text-center text-xs text-base-content/40">Messages illustratifs présentant les bénéfices de la plateforme, et non des témoignages clients nominatifs.</p>
      </section>

      <section id="features" className="bg-base-100 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Tout au même endroit</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Des données qui font avancer votre activité</h2>
            <p className="mt-4 text-base-content/60">Une chaîne de mesure complète pour les e-commerçants, marketeurs, agences et entreprises : de l'acquisition au clic, jusqu'à la conversion.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => <article key={feature.title} className="card border border-base-300/70 bg-base-100 shadow-sm"><div className="card-body p-7"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">{feature.icon}</span><h3 className="mt-3 text-xl font-bold">{feature.title}</h3><p className="leading-7 text-base-content/60">{feature.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Tarification simple</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Un forfait adapté à votre croissance</h2><p className="mt-3 text-sm text-base-content/55">Les réductions automatiques du prestataire de paiement restent appliquées au checkout.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => <article key={plan.name} className="card border border-base-300 bg-base-100"><div className="card-body"><h3 className="font-bold">{plan.name}</h3><p className="text-3xl font-black">{plan.price}<span className="text-sm font-medium text-base-content/50">{plan.price === "0 $" ? "" : " / 30 jours"}</span></p><p className="text-sm text-base-content/60">{plan.detail}</p><a href="/inscription" className="btn btn-outline btn-primary mt-3 rounded-lg">Choisir ce forfait</a></div></article>)}
        </div>
      </section>

      <footer className="border-t border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-base-content/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex flex-col gap-1"><span className="font-bold text-base-content">getAdPulse</span><span className="text-xs">Une meilleure lecture de vos performances, à chaque clic.</span></div><div className="flex flex-wrap items-center gap-4"><a href="/guide-optimisation" className="hover:text-primary">Guide d'optimisation</a><a href="mailto:joeltech91@gmail.com" className="hover:text-primary">Besoin d’aide ? joeltech91@gmail.com</a><span>© {new Date().getFullYear()} getAdPulse. Tous droits réservés.</span></div>
        </div>
      </footer>
    </main>
  );
}
