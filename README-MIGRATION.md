# Migration fonctionnelle — plan de travail

## Phase 1 — socle
- Application Next.js, TypeScript, Tailwind et DaisyUI.
- Configuration serveur et conventions de sécurité.
- Ne pas toucher à la base en production à ce stade.

## Phase 2 — schéma et identité
- Comparer les tables MySQL réelles et les modèles de l'ancien backend.
- Introspecter avec Prisma sur une base de staging/copie.
- Migrer inscription, connexion, cookie/session et connexion Google.
- Vérifier la compatibilité des mots de passe historiques avant toute bascule.

## Phase 3 — liens et tracking
- Migrer création, modification, suppression et redirection des liens.
- Conserver les slugs existants.
- Reprendre les compteurs et événements, détection bot/visiteur répétitif.
- Ajouter tests de non-régression sur le parcours de clic.

## Phase 4 — paiements et abonnements
- Reprendre les trois produits : ID_PRODUIT (9 $), produit 19 $, produit 59 $.
- Créer les commandes côté serveur.
- Confirmer les paiements auprès du fournisseur côté serveur uniquement.
- Appliquer le plan après confirmation, transaction SQL atomique et traitement idempotent.
- Ne jamais faire confiance à un paramètre de retour navigateur pour activer un abonnement.

## Phase 5 — analytics et intégrations
- Résumé, live, fraude, conversions, rapports.
- Connexion Meta et expiration/renouvellement des tokens.
- Tests de droits d'accès selon les statuts 1 à 4.

## Garde-fous
- Pas de reset, drop, truncate ou recréation de la base existante.
- Pas de secrets dans Git ni dans le navigateur.
- Déploiement parallèle et bascule seulement après tests, sauvegarde et validation.
