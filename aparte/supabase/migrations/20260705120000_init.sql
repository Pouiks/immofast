-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Schéma initial : multi-tenant (account_id) + RLS              ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Chaque espace client = 1 `account`. Toutes les données CRM portent
-- `account_id` et sont isolées par Row Level Security. L'admin SaaS gère les
-- comptes mais n'accède pas aux données CRM.

create extension if not exists pgcrypto;

-- ─── Types énumérés ────────────────────────────────────────────────────────
create type user_role       as enum ('admin', 'client', 'invite');
create type plan_type        as enum ('mensuel', 'annuel');
create type account_status   as enum ('active', 'pending_payment', 'suspended');
create type prospect_stage   as enum ('nouveau', 'qualifie', 'visite', 'offre', 'compromis');
create type property_status  as enum ('disponible', 'sous_offre', 'vendu');
create type contract_step    as enum ('offre_recue', 'offre_acceptee', 'compromis_signe', 'acte_definitif');
create type document_type    as enum ('piece_identite', 'justificatif_revenus', 'avis_imposition',
                                      'offre_achat', 'compromis_vente', 'simulation_pret', 'mandat', 'autre');
create type notification_kind as enum ('lead', 'visite', 'offre', 'document');

-- ─── Tables ────────────────────────────────────────────────────────────────
create table accounts (
  id          uuid primary key default gen_random_uuid(),
  agency_name text not null,
  brand_name  text not null,
  accent      text[] not null default array['#2563eb', '#38bdf8'],
  plan        plan_type not null default 'mensuel',
  status      account_status not null default 'pending_payment',
  email       text,
  created_at  timestamptz not null default now()
);

create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete cascade,
  full_name  text not null,
  email      text not null,
  phone      text,
  role       user_role not null default 'client',
  created_at timestamptz not null default now()
);
create index profiles_account_id_idx on profiles (account_id);

create table prospects (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references accounts (id) on delete cascade,
  full_name     text not null,
  phone         text,
  email         text,
  address       text,
  budget_amount integer,
  search_label  text,
  stage         prospect_stage not null default 'nouveau',
  created_at    timestamptz not null default now()
);
create index prospects_account_id_idx on prospects (account_id);

create table properties (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references accounts (id) on delete cascade,
  ref               text not null,
  title             text not null,
  city              text,
  price_amount      integer,
  surface_m2        numeric,
  rooms             integer,
  bedrooms          integer,
  bathrooms         integer,
  floor_label       text,
  dpe               text,
  property_type     text,
  status            property_status not null default 'disponible',
  published         boolean not null default false,
  margin_pct        numeric,
  description       text not null default '',
  offer_prospect_id uuid references prospects (id) on delete set null,
  contract_step     contract_step,
  created_at        timestamptz not null default now()
);
create index properties_account_id_idx on properties (account_id);

create table property_photos (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references properties (id) on delete cascade,
  storage_path text not null,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);
create index property_photos_property_id_idx on property_photos (property_id);

create table visits (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts (id) on delete cascade,
  prospect_id uuid references prospects (id) on delete set null,
  title       text not null,
  starts_at   timestamptz not null,
  created_at  timestamptz not null default now()
);
create index visits_account_id_idx on visits (account_id);

create table documents (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references accounts (id) on delete cascade,
  prospect_id  uuid not null references prospects (id) on delete cascade,
  name         text not null,
  doc_type     document_type not null default 'autre',
  storage_path text,
  created_at   timestamptz not null default now()
);
create index documents_prospect_id_idx on documents (prospect_id);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  kind       notification_kind not null,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_account_id_idx on notifications (account_id);

create table invoices (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references accounts (id) on delete cascade,
  period       text not null,
  amount_cents integer not null,
  pdf_url      text,
  created_at   timestamptz not null default now()
);
create index invoices_account_id_idx on invoices (account_id);

create table payment_methods (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  brand      text not null,
  last4      text not null,
  exp_month  integer not null,
  exp_year   integer not null,
  created_at timestamptz not null default now()
);
create index payment_methods_account_id_idx on payment_methods (account_id);

-- ─── Helpers RLS (SECURITY DEFINER → contournent la RLS, évitent la récursion) ─
create or replace function current_account_id()
returns uuid language sql stable security definer set search_path = public as $$
  select account_id from profiles where id = auth.uid();
$$;

create or replace function current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_user_role() = 'admin', false);
$$;

-- Accès CRM : membre de l'espace (client ou invité), jamais l'admin SaaS.
create or replace function is_crm_member(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select target = current_account_id()
     and current_user_role() in ('client', 'invite');
$$;

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table accounts        enable row level security;
alter table profiles        enable row level security;
alter table prospects       enable row level security;
alter table properties      enable row level security;
alter table property_photos enable row level security;
alter table visits          enable row level security;
alter table documents       enable row level security;
alter table notifications   enable row level security;
alter table invoices        enable row level security;
alter table payment_methods enable row level security;

-- accounts : le membre voit/modifie son espace ; l'admin gère tous les espaces.
create policy accounts_admin_all on accounts for all
  using (is_admin()) with check (is_admin());
create policy accounts_member_select on accounts for select
  using (id = current_account_id());
create policy accounts_client_update on accounts for update
  using (id = current_account_id() and current_user_role() = 'client')
  with check (id = current_account_id() and current_user_role() = 'client');

-- profiles : membres du même espace se voient ; on modifie son propre profil.
create policy profiles_admin_all on profiles for all
  using (is_admin()) with check (is_admin());
create policy profiles_same_account_select on profiles for select
  using (account_id = current_account_id());
create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Tables CRM : isolées par account_id, réservées aux membres CRM.
create policy prospects_crm on prospects for all
  using (is_crm_member(account_id)) with check (is_crm_member(account_id));
create policy properties_crm on properties for all
  using (is_crm_member(account_id)) with check (is_crm_member(account_id));
create policy visits_crm on visits for all
  using (is_crm_member(account_id)) with check (is_crm_member(account_id));
create policy documents_crm on documents for all
  using (is_crm_member(account_id)) with check (is_crm_member(account_id));
create policy notifications_crm on notifications for all
  using (is_crm_member(account_id)) with check (is_crm_member(account_id));

-- property_photos : hérite de l'accès du bien parent.
create policy property_photos_crm on property_photos for all
  using (exists (select 1 from properties p
                 where p.id = property_id and is_crm_member(p.account_id)))
  with check (exists (select 1 from properties p
                 where p.id = property_id and is_crm_member(p.account_id)));

-- Facturation : titulaire (client) uniquement — jamais l'invité ni l'admin.
create policy invoices_client on invoices for all
  using (account_id = current_account_id() and current_user_role() = 'client')
  with check (account_id = current_account_id() and current_user_role() = 'client');
create policy payment_methods_client on payment_methods for all
  using (account_id = current_account_id() and current_user_role() = 'client')
  with check (account_id = current_account_id() and current_user_role() = 'client');
