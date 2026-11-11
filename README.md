# AdPulse Next

Application full-stack AdPulse basée sur Next.js, Tailwind CSS et DaisyUI.

## Objectifs
- Remplacer progressivement le frontend Vue/Vite et l'API Go par Next.js App Router.
- Conserver la base MySQL existante et ses données.
- Préserver les liens courts, clics, conversions, analytics, abonnements, paiements, Google et Meta.
- Garder les dépôts historiques intacts pendant la migration.

## Architecture réellement utilisée sur cette branche
- Next.js App Router (TypeScript) pour l'interface et les Route Handlers.
- Tailwind CSS 4 + DaisyUI 5.
- MySQL via `mysql2/promise`, avec SQL paramétré et tables historiques.
- Sessions serveur signées HS256, cookies HttpOnly.
- Zod pour valider les entrées et bcryptjs pour vérifier les hash bcrypt historiques.

Le client Prisma n'est pas utilisé sur cette branche : l'accès SQL direct évite de supposer un schéma Prisma tant qu'une copie de la base n'a pas été introspectée.

## Abonnements connus

| Offre | Status historique | Liens | Clics | Analytics |
|---|---:|---:|---:|---|
| Free | 1 | 1 | 30 | Non |
| Standard – 9 $ | 2 | 5 | 350 | Non |
| Advanced – 19 $ | 3 | 20 | 1 250 | Oui |
| Unlimited – 59 $ | 4 | Illimité | Illimité | Oui |

Les abonnements payants durent 30 jours selon le comportement actuel. À expiration, le compte revient à l'offre gratuite. Les anciens abonnements payants encore valides conservent leur accès legacy jusqu'à leur expiration.

## Variables d'environnement
Le fichier `.env.example` est un modèle sans secrets. Utiliser `.env.local` localement et les variables privées de l'hébergeur en production.

| Variable | Usage |
|---|---|
| `DATABASE_URL` ou `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE` | Connexion MySQL serveur. |
| `AUTH_SECRET` | Secret de signature des sessions, 32 caractères aléatoires minimum. |
| `API_URL`, `API_KEY` | Fournisseur de paiement. Vérifier le format exact de `API_URL` avec le fournisseur avant production ; ne pas supposer que le chemin `/checkout` doit être ajouté. |
| `ID_PRODUIT` | Produit 9 $ ; conserver la variable existante sans identifiant codé en dur. |
| `ID_PRODUIT_19`, `ID_PRODUIT_59` | Produits 19 $ et 59 $. |
| `FRONT`, `MY_URL` | URL publique de l'application et URL de callback. |
| `GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Vérification serveur et bouton Google. |
| `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI` | OAuth Meta. Le secret reste côté serveur. |

Ne jamais committer de mot de passe, clé API, jeton OAuth, `.env` ou `.env.local`. Les identifiants Meta historiques doivent être confirmés dans la console Meta avant déploiement.

## Fonctionnalités déjà portées dans la branche
- Inscription et connexion e-mail, Google, sessions sécurisées.
- Dashboard et gestion de liens courts.
- Redirection et tracking clics, mobile/desktop, bots et visiteurs répétitifs.
- Quotas et plans, checkout et confirmation serveur avant activation.
- Analytics résumé, live, fraude, conversions et rapport JSON.
- OAuth Meta et lecture des annonces.

## Garde-fous de migration
Aucune migration destructive n'est autorisée. Ne pas exécuter `DROP`, `TRUNCATE`, `prisma migrate reset` ni recréer les tables historiques.

Le script `database/bootstrap.sql` ne crée que les tables additives d'abonnement et d'événements via `CREATE TABLE IF NOT EXISTS`. L'exécuter uniquement sur une copie/staging après comparaison des colonnes réelles.

## État et limites
- Le workflow GitHub Actions n'a pas encore obtenu de runner ; typecheck, lint et build restent à confirmer.
- Tester les colonnes MySQL, les paiements avec le fournisseur et les OAuth Google/Meta sur staging.
- Les rapports automatiques par e-mail, les pages administrateur et les guides marketing ne sont pas encore migrés.
- Ne basculer le domaine qu'après sauvegarde et tests de non-régression.
