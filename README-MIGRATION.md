# Migration AdPulse vers Next.js — état réel

## Architecture
- Next.js App Router : interface React et Route Handlers HTTP.
- MySQL : accès serveur via `mysql2/promise`, en réutilisant les tables historiques (`user_Tracker_Link`, `link_Tracker_Link`, `user_subscriptions`, `pending_subscription_payments`, `tracker_events`, `user_meta_ad_connect`).
- Sessions : cookie signé HS256, HttpOnly, Secure en production.
- Validation : Zod ; mots de passe bcrypt compatibles avec les hash bcrypt historiques.
- UI : Tailwind CSS 4 + DaisyUI 5.

L'accès SQL direct est volontaire : le schéma historique n'est pas encore introspecté depuis une copie de la base. Prisma a été retiré du runtime pour éviter de générer des modèles fictifs ou de modifier le schéma à l'aveugle.

## Fonctionnalités déjà portées sur cette branche
- Inscription email/mot de passe, connexion, déconnexion et session serveur.
- Connexion Google via vérification serveur du jeton Google (composant bouton côté interface encore à raccorder).
- Tableau de bord responsive : création, liste, modification et suppression de liens.
- Redirection des slugs `/link/[slug]`, comptage clics, mobile/desktop, détection UA bot et visiteur répétitif par empreinte hachée.
- Quotas de liens et de clics, plans Free/9/19/59 et statut 1/2/3/4.
- Checkout des trois abonnements, vérification auprès du fournisseur avant activation, callback et mise à jour transactionnelle.
- Résumé Analytics, activité live, indicateurs de trafic suspect, conversions et rapport JSON.
- Connexion Meta OAuth, stockage du token et lecture des comptes/publicités.
- Écrans connexion, inscription, dashboard et analytics.

## Routes principales
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/google`
- `GET /api/me`
- `GET|POST|PATCH|DELETE /api/links`
- `GET /api/analytics/summary`, `/live`, `/fraud`, `/report`
- `POST /api/track/conversion/[slug]`
- `GET /link/[slug]`
- `POST /api/payments/[plan]`, `GET /api/payments/verify/[plan]`
- `GET /api/meta/connect`, `/callback`, `/ads`

## Base de données : migration sans destruction
Les tables de compte et de liens existantes ne sont jamais recréées ni supprimées. Le script `database/bootstrap.sql` ne contient que des `CREATE TABLE IF NOT EXISTS` pour les tables d'abonnement et d'événements. L'exécuter uniquement sur une copie/staging après comparaison des structures. Ne jamais lancer `prisma migrate reset`, DROP, TRUNCATE ou une migration destructive sur la base en production.

Les requêtes utilisent les noms de colonnes historiques observés dans le backend Go. Confirmer les colonnes et types exacts sur une sauvegarde avant la bascule.

## Variables à configurer
- `DATABASE_URL` (ou les variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE)
- `AUTH_SECRET` : au moins 32 caractères aléatoires.
- Paiement : `API_URL`, `API_KEY`, `MY_URL`, `FRONT`, `ID_PRODUIT`; les IDs 19 $ et 59 $ gardent les valeurs documentées dans `.env.example`.
- Google : `GOOGLE_CLIENT_ID` et `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- Meta : `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`.

Aucun secret ne doit être préfixé par `NEXT_PUBLIC_` ni commité. Utiliser `.env.local` localement et les variables sécurisées de l'hébergeur en production.

## Limites restantes avant mise en production
- Le bouton Google côté interface doit être raccordé au endpoint Google.
- Le front Meta doit encore proposer la connexion et afficher les résultats d'annonces.
- Les rapports automatiques par e-mail ne sont pas configurés (aucun fournisseur d'e-mail n'a été fourni).
- Les parcours administrateur et l'ensemble des pages de guides/marketing de l'ancien Vue ne sont pas encore portés.
- Il faut tester les colonnes exactes, les paiements en environnement de test, les tokens Meta et les règles de quotas avec une copie MySQL.
- Les tests build/typecheck/lint doivent passer dans GitHub Actions avant toute PR de validation.

## Déploiement progressif
1. Faire une sauvegarde MySQL et créer une copie de staging.
2. Appliquer le bootstrap seulement si nécessaire.
3. Configurer les secrets et tester l'authentification, les paiements et le tracking.
4. Comparer les statistiques avec le backend Go.
5. Basculer le domaine uniquement après validation complète. Les deux anciens dépôts restent inchangés.
