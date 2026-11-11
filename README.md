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

## Configuration

Voir `.env.example`. Ne jamais committer `.env.local` ni de secrets.

## État

Cette branche initialise le socle documentaire. Les intégrations et la migration fonctionnelle doivent être ajoutées par étapes et validées contre la vraie structure MySQL et les contrats API historiques.
