# Aparté — CRM Immobilier (SaaS marque blanche)

CRM immobilier en marque blanche, distribué en SaaS par abonnement. Réécriture
en production du prototype de design (`../CRM immobilier moderne/`).

## Stack

| Domaine        | Choix                                                        |
| -------------- | ------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router, RSC) + TypeScript strict             |
| Données        | Supabase — Postgres + Auth (rôles) + Storage, RLS multi-tenant |
| Cache serveur  | TanStack Query (fetch + mutations optimistes)                |
| État UI        | Zustand (drawers, modales, filtres — jamais de données serveur) |
| Styles         | Tailwind CSS v4 + design tokens (`src/app/globals.css`)      |
| Facturation    | Stripe (stubbé pour l'instant, proration native à venir)     |
| Redis          | seulement si besoin (rate-limit, cache MRR) — non requis     |

## Architecture (feature-first)

```
src/
├─ app/
│  ├─ (app)/            → shell CRM (client & invité) : dashboard, prospects, biens, kanban, agenda
│  ├─ admin/            → console SaaS (rôle admin), hors CRM
│  └─ login/            → écran de connexion
├─ features/            → un dossier par domaine (components / hooks / api / schema)
│  ├─ auth/  account/  notifications/  …
├─ components/
│  ├─ ui/               → primitives réutilisables (Button, Drawer, Modal, Badge, KpiCard…)
│  ├─ shell/            → sidebar, topbar
│  └─ theme-provider.tsx
├─ lib/                 → utils, env, supabase (client/server/middleware), query, status, avatar
├─ stores/              → stores Zustand (état UI)
├─ types/               → domain (enums + libellés) + database (contrat Supabase)
├─ config/              → navigation
└─ supabase/migrations/ → schéma SQL + RLS versionnés
```

**Règle d'or** : les données persistées passent par React Query ; Zustand ne
contient que de l'état UI éphémère. Chaque table porte `account_id` et est
isolée par RLS.

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Sans clés Supabase, l'app démarre en **mode démo** (utilisateur client fictif),
utile pour développer l'UI. Voir `.env.local.example`.

## Brancher Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier `.env.local.example` → `.env.local` et renseigner les clés (Settings → API).
3. Appliquer les migrations (`supabase/migrations/`) via le SQL Editor ou la CLI :
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
4. Régénérer les types : `supabase gen types typescript --linked > src/types/database.ts`.
5. Retirer le repli démo dans `src/features/auth/current-user.ts`.

## Rôles

- **admin** — console SaaS uniquement (gestion des espaces), pas d'accès CRM.
- **client** — CRM complet + abonnement / facturation / marque blanche.
- **invite** — CRM comme le titulaire, jamais la facturation ni l'admin.
