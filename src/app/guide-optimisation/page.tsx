const cases = [
  {
    number: "01",
    icon: "🌐",
    tone: "bg-sky-50 text-sky-700",
    title: "Déterminer quelle plateforme vous rapporte le plus de clients",
    problem: "Vous diffusez vos liens partout, mais vous ne savez pas précisément quel réseau social génère le plus de visites et de résultats.",
    paragraphs: [
      <>Générez <strong>2 ou 3 liens de tracking différents</strong> qui pointent tous vers la même destination finale. Partagez ensuite chaque lien sur un réseau social distinct : un pour Facebook, un pour TikTok et un pour Instagram.</>,
      <>Après quelques jours, comparez les clics et les données disponibles dans votre tableau de bord pour identifier les canaux qui attirent le plus de visiteurs.</>,
    ],
    bullets: [
      <><strong>Le lien le plus performant :</strong> concentrez davantage votre budget et vos efforts sur ce canal.</>,
      <><strong>Le lien le moins performant :</strong> ajustez votre contenu, votre ciblage ou votre investissement.</>,
    ],
  },
  {
    number: "02",
    icon: "🔄",
    tone: "bg-orange-50 text-orange-700",
    title: "Modifier votre destination sans repartir de zéro",
    problem: "Votre publicité Meta Ads fonctionne, mais vous devez changer de page de vente. Modifier l'URL directement dans votre publicité peut vous obliger à remplacer le lien utilisé et compliquer le suivi de vos campagnes.",
    paragraphs: [
      <>Insérez votre <strong>lien dynamique AdPulse</strong> dans votre publicité dès son lancement. C'est cette adresse courte et stable que vous partagez.</>,
      <>Si votre site change ou si vous souhaitez envoyer les visiteurs vers une autre page, modifiez uniquement la destination depuis AdPulse. Votre publicité conserve le même lien court et vos statistiques associées au lien restent accessibles.</>,
    ],
    bullets: [
      <><strong>Un lien court qui reste le même :</strong> pas besoin de modifier le lien dans chaque publication où vous l'avez partagé.</>,
      <><strong>Une destination actualisée :</strong> les prochains visiteurs sont redirigés vers la nouvelle page.</>,
    ],
  },
  {
    number: "03",
    icon: "⭐",
    tone: "bg-violet-50 text-violet-700",
    title: "Mesurer l'efficacité réelle de vos influenceurs",
    problem: "Vous collaborez avec plusieurs influenceurs en même temps et il est difficile de savoir lequel génère le plus de trafic.",
    paragraphs: [
      <>Conservez une URL finale unique pour votre offre, puis générez <strong>un lien AdPulse distinct pour chaque influenceur</strong>.</>,
      <>Suivez les statistiques de chaque lien dans votre tableau de bord. Vous pourrez comparer les clics générés par chaque créateur et mieux évaluer les résultats de vos collaborations.</>,
    ],
    bullets: [
      <><strong>Un lien par créateur :</strong> identifiez facilement la provenance du trafic.</>,
      <><strong>Des décisions mieux informées :</strong> appuyez vos prochaines collaborations sur les résultats observés.</>,
    ],
  },
];

export default function GuideOptimisationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f3f6fc] via-[#f5f7fb] to-[#eef2f9] px-4 pb-16 pt-10 text-slate-900 sm:px-6 sm:pt-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center sm:mb-16">
          <a href="/" className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-5 py-3 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-100">
            <span aria-hidden>💡</span> Guide d'optimisation
          </a>
          <h1 className="mx-auto max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Comment utiliser <span className="rounded-xl bg-blue-100 px-2 py-1 text-blue-600">100%</span> d'AdPulse
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-slate-500 sm:text-xl sm:leading-9">
            Découvrez des stratégies concrètes pour mieux mesurer vos campagnes, comprendre votre audience et tirer davantage de valeur de chaque lien partagé.
          </p>
        </header>

        <section className="space-y-8 sm:space-y-10">
          {cases.map((item) => (
            <article key={item.number} className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_18px_55px_rgba(30,55,100,0.07)] sm:rounded-[2rem] sm:p-8 md:p-9">
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className={`grid size-14 place-items-center rounded-2xl text-2xl ${item.tone}`} aria-hidden>{item.icon}</span>
                <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-extrabold tracking-[0.12em] text-slate-400 sm:text-sm">CAS N° {item.number}</span>
              </div>

              <h2 className="mb-6 text-2xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-3xl">{item.title}</h2>

              <div className="rounded-xl border-y border-slate-100 border-l-4 border-l-slate-400 bg-slate-50 px-5 py-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                <strong className="text-slate-700">Problème :</strong> {item.problem}
              </div>

              <h3 className="mb-5 mt-7 flex items-center gap-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                <span aria-hidden>💡</span> La solution AdPulse :
              </h3>

              <div className="space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
                {item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                <ul className="list-disc space-y-3 pl-6 marker:text-blue-500">
                  {item.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[1.75rem] bg-slate-900 px-6 py-9 text-center text-white shadow-xl sm:mt-16 sm:rounded-[2rem] sm:px-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Passez à l'action</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">Prêt à mieux piloter vos campagnes ?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">Créez vos liens, suivez leurs performances et adaptez vos destinations depuis un seul espace.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/inscription" className="btn border-0 bg-blue-500 text-white hover:bg-blue-600">Commencer gratuitement</a>
            <a href="/" className="btn btn-outline border-slate-500 text-white hover:border-white hover:bg-white hover:text-slate-900">Retour à l'accueil</a>
          </div>
        </section>
      </div>
    </main>
  );
}
