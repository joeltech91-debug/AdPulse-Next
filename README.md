# AdPulse Next

Nouvelle application full-stack AdPulse basée sur Next.js, Tailwind CSS et DaisyUI.

## Objectifs de migration

- Remplacer progressivement le frontend Vue/Vite et l'API Go par une application Next.js unifiée.
- Conserver la base MySQL existante et ses données.
- Préserver les parcours de connexion, Google, création de liens courts, redirection et suivi des clics.
- Reprendre les abonnements et paiements existants sans activer un forfait avant confirmation serveur du prestataire.
- Migrer les analytics, conversions, suivi live, détection des bots et visiteurs répétitifs, connexion Meta et rapports.
- Garder les dépôts historiques intacts pendant toute la migration.

## Architecture cible

- Next.js App Router (TypeScript)
- Tailwind CSS + DaisyUI
- Routes serveur Next.js pour les API et les webhooks
- Prisma comme couche d'accès MySQL, après introspection de la base existante
- Authentification serveur avec sessions sécurisées
- Déploiement compatible Vercel

## Sécurité des données

**Aucune migration destructive n'est autorisée.** Ne pas exécuter `prisma migrate reset`, ne pas supprimer/recréer les tables existantes et ne pas écraser les données utilisateur.

Avant toute migration de schéma :
1. Faire une sauvegarde de la base.
2. Travailler sur une copie ou un environnement staging.
3. Introspecter le schéma existant avec `prisma db pull`.
4. Vérifier les clés, types et relations réels avant d'écrire des migrations additives.

## Abonnements connus

| Offre | Status historique | Liens | Clics | Analytics |
|---|---:|---:|---:|---|
| Free | 1 | 1 | 30 | Non |
| Standard – 9 $ | 2 | 5 | 350 | Non |
| Advanced – 19 $ | 3 | 20 | 1 250 | Oui |
| Unlimited – 59 $ | 4 | Illimité | Illimité | Oui |

Les abonnements payants durent 30 jours selon le comportement actuel. À expiration, le compte revient à l'offre gratuite. Les anciens abonnements payants dont la date de validité est encore future doivent conserver l'accès accordé par la logique historique, jusqu'à leur expiration.

## Configuration des variables

Le fichier `.env.example` est un **modèle sans secrets**. Les valeurs réelles doivent être saisies dans `.env.local` en développement et dans les variables d'environnement du fournisseur d'hébergement en production.

| Variable fournie par l'ancien environnement | Cible / usage Next.js |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Composer `DATABASE_URL` au format MySQL pour Prisma. Encoder les caractères réservés du mot de passe dans l'URL. Les variables séparées sont conservées temporairement pour faciliter le portage. |
| `API_URL`, `API_KEY` | MakeTou côté serveur. La valeur actuelle de `API_URL` ressemble déjà à un endpoint `/stores/cart` : vérifier le contrat exact avant d'ajouter `/checkout` ou un autre chemin. |
| `ID_PRODUIT` | Produit du forfait 9 $ : conserver la variable existante, sans ID codé en dur. |
| `ID_PRODUIT_19`, `ID_PRODUIT_59` | Produits 19 $ et 59 $ déjà documentés pour la migration. |
| `FRONT`, `MY_URL` | URL publique frontend et URL backend/callback. En migration, les deux peuvent pointer vers l'application Next.js selon le contrat du prestataire. |
| `META_APP_ID` | Peut être exposé sous `NEXT_PUBLIC_META_APP_ID` si nécessaire au SDK navigateur. |
| `META_APP_SECRET` | Secret Meta exclusivement serveur ; ne jamais utiliser le préfixe `NEXT_PUBLIC_`. |
| `META_REDIRECT_URI` | Callback OAuth Meta à adapter à la future route Next.js. |
| `COOKIE` | Variable legacy à conserver uniquement si le code historique confirme son rôle. Ne pas la confondre automatiquement avec `AUTH_SECRET`. |
| `EMAIL` | Adresse historique ; confirmer si elle sert à l'envoi d'e-mails ou à un compte technique avant de l'intégrer. |
| `PASSWORD` | Non reprise : nom trop générique, usage non confirmé. Ne pas la réutiliser comme secret d'authentification sans vérifier le code source. |
| `ENVIRONNEMENT` | Remplacée par la convention `NODE_ENV` de Next.js, après vérification des branches conditionnelles legacy. |

Le fichier de production partagé contient des secrets. Ils doivent être renouvelés puis saisis uniquement dans les variables privées de l'hébergement. Ne jamais committer `.env`, `.env.local`, un mot de passe ou une clé API.

Les identifiants Google ne figuraient pas dans le fichier transmis : `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` restent donc à renseigner après vérification de la configuration OAuth existante.

## État

Le dépôt initialise le socle documentaire et technique. Les intégrations et la migration fonctionnelle doivent être ajoutées par étapes et validées contre la vraie structure MySQL et les contrats API historiques.
