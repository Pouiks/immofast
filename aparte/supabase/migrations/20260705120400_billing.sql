-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Facturation : Stripe, essai 24 h, abonnements, idempotence   ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- L'état d'abonnement vit dans `subscriptions` (miroir de Stripe, source de
-- vérité). `account_status` reste réservé au cycle admin (active / pending /
-- suspended). L'accès est calculé par resolveAccess (trial_ends_at + sub).

-- ─── accounts : lien Stripe + fin d'essai ──────────────────────────────────
alter table accounts add column if not exists stripe_customer_id text;
alter table accounts add column if not exists trial_ends_at      timestamptz;

-- ─── profiles : onboarding (par utilisateur) ───────────────────────────────
alter table profiles add column if not exists onboarding_completed boolean not null default false;
alter table profiles add column if not exists onboarding_step      integer not null default 0;

-- ─── subscriptions : miroir de l'abonnement Stripe (1 par espace) ──────────
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  account_id             uuid not null unique references accounts (id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id        text,
  plan                   plan_type,
  status                 text not null,            -- statut Stripe : trialing/active/past_due/canceled/incomplete/unpaid
  current_period_end     timestamptz,
  trial_end              timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists subscriptions_account_id_idx on subscriptions (account_id);

alter table subscriptions enable row level security;
-- Lecture par les membres de l'espace (nécessaire au calcul d'accès côté app).
-- Écriture : uniquement via service_role (webhooks Stripe) → aucune policy write.
create policy subscriptions_member_select on subscriptions for select
  using (account_id = current_account_id());

-- ─── invoices / payment_methods : colonnes de synchro Stripe ───────────────
alter table invoices add column if not exists stripe_invoice_id  text;
alter table invoices add column if not exists status             text;
alter table invoices add column if not exists hosted_invoice_url text;

alter table payment_methods add column if not exists stripe_payment_method_id text;
alter table payment_methods add column if not exists is_default               boolean not null default true;

-- ─── stripe_events : idempotence des webhooks ──────────────────────────────
create table if not exists stripe_events (
  id           text primary key,   -- id de l'événement Stripe (evt_…)
  type         text not null,
  processed_at timestamptz not null default now()
);
alter table stripe_events enable row level security;
-- Aucune policy : table accessible uniquement via la clé service_role.
