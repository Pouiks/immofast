-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Seed de démonstration (rejouable)                            ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Crée 1 espace « Aparté », 1 utilisateur titulaire (login réel) et les
-- données CRM du prototype. Identifiants de connexion :
--   email : camille@agence.fr   ·   mot de passe : demodemo

-- Nettoyage (les suppressions cascadent sur profil + données CRM).
delete from auth.users where id in (
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444'
);
delete from accounts where id in (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333'
);
-- Quelques espaces clients supplémentaires (gérés depuis la console admin).
delete from accounts where email in ('contact@horizon-immo.fr', 'hello@studionord.fr', 'admin@prestige.fr');

-- ─── Espace client ─────────────────────────────────────────────────────────
insert into accounts (id, agency_name, brand_name, accent, plan, status, email)
values ('11111111-1111-1111-1111-111111111111', 'Aparté', 'Aparté',
        array['#2563eb', '#38bdf8'], 'mensuel', 'active', 'camille@agence.fr');

-- ─── Utilisateur d'authentification (titulaire) ────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'camille@agence.fr',
  crypt('demodemo', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Camille Mercier"}',
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"camille@agence.fr"}',
  'email', now(), now(), now()
);

-- ─── Profil (lie l'utilisateur à l'espace) ─────────────────────────────────
insert into profiles (id, account_id, full_name, email, phone, role)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
        'Camille Mercier', 'camille@agence.fr', '06 24 11 88 30', 'client');

-- ─── Admin SaaS (console de gestion des espaces) ───────────────────────────
insert into accounts (id, agency_name, brand_name, accent, plan, status, email)
values ('33333333-3333-3333-3333-333333333333', 'Aparté', 'Aparté',
        array['#2563eb', '#38bdf8'], 'mensuel', 'active', 'admin@aparte.fr');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated', 'admin@aparte.fr',
  crypt('demodemo', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Aparté"}',
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '{"sub":"44444444-4444-4444-4444-444444444444","email":"admin@aparte.fr"}',
  'email', now(), now(), now()
);

insert into profiles (id, account_id, full_name, email, phone, role)
values ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
        'Admin Aparté', 'admin@aparte.fr', null, 'admin');

-- Espaces clients gérés par l'admin (sans utilisateur associé pour la démo).
insert into accounts (agency_name, brand_name, accent, plan, status, email) values
 ('Agence Horizon',      'Agence Horizon',      array['#2563eb','#38bdf8'], 'annuel',  'active',          'contact@horizon-immo.fr'),
 ('Studio Nord',         'Studio Nord',         array['#2563eb','#38bdf8'], 'mensuel', 'active',          'hello@studionord.fr'),
 ('Prestige Immobilier', 'Prestige Immobilier', array['#2563eb','#38bdf8'], 'mensuel', 'pending_payment', 'admin@prestige.fr');

-- ─── Prospects ─────────────────────────────────────────────────────────────
insert into prospects (id, account_id, full_name, phone, email, address, budget_amount, search_label, stage) values
 ('00000000-0000-0000-0000-0000000000a1', '11111111-1111-1111-1111-111111111111', 'Marc Dubois',    '06 12 34 56 78', 'm.dubois@email.fr',  '12 rue de Rivoli, Paris 4e',      520000, 'T3, Paris 8e',       'visite'),
 ('00000000-0000-0000-0000-0000000000a2', '11111111-1111-1111-1111-111111111111', 'Sophie Leroy',   '06 98 76 54 32', 's.leroy@email.fr',   '8 av. Victor Hugo, Clichy',       680000, 'Maison, Clichy',     'qualifie'),
 ('00000000-0000-0000-0000-0000000000a3', '11111111-1111-1111-1111-111111111111', 'Thomas Bernard', '07 45 23 11 90', 't.bernard@email.fr', '3 rue Danton, Levallois',         290000, 'Studio, Levallois',  'nouveau'),
 ('00000000-0000-0000-0000-0000000000a4', '11111111-1111-1111-1111-111111111111', 'Julie Martin',   '06 33 44 55 66', 'j.martin@email.fr',  '21 bd Voltaire, Paris 11e',       410000, 'T2, Paris 11e',      'offre'),
 ('00000000-0000-0000-0000-0000000000a5', '11111111-1111-1111-1111-111111111111', 'Paul Girard',    '06 77 88 99 00', 'p.girard@email.fr',  '5 rue de la Gare, Meudon',        750000, 'Maison, Meudon',     'compromis'),
 ('00000000-0000-0000-0000-0000000000a6', '11111111-1111-1111-1111-111111111111', 'Léa Moreau',     '07 11 22 33 44', 'l.moreau@email.fr',  '17 rue du Château, Boulogne',     890000, 'T4, Boulogne',       'qualifie');

-- ─── Biens ─────────────────────────────────────────────────────────────────
insert into properties (id, account_id, ref, title, city, price_amount, surface_m2, rooms, bedrooms, bathrooms, floor_label, dpe, property_type, status, published, margin_pct, description, offer_prospect_id, contract_step) values
 ('00000000-0000-0000-0000-0000000000b1', '11111111-1111-1111-1111-111111111111', 'APT-118', 'Appartement T3',       'Paris 8e',  520000, 68,  3, 2, 1, '4e étage', 'C', 'Appartement', 'disponible', true,  4.2, 'Appartement traversant au 4e étage avec ascenseur, entièrement rénové. Double séjour lumineux exposé sud, cuisine équipée, deux chambres avec rangements.', null, null),
 ('00000000-0000-0000-0000-0000000000b2', '11111111-1111-1111-1111-111111111111', 'MAI-204', 'Maison 5 pièces',      'Clichy',    680000, 110, 5, 3, 2, 'Maison',    'D', 'Maison',      'sous_offre', true,  3.8, 'Belle maison familiale sur trois niveaux avec jardin de 120 m². Séjour ouvert sur terrasse, cuisine récente, trois chambres à l''étage.', '00000000-0000-0000-0000-0000000000a2', 'offre_acceptee'),
 ('00000000-0000-0000-0000-0000000000b3', '11111111-1111-1111-1111-111111111111', 'STU-076', 'Studio meublé',        'Levallois', 290000, 26,  1, 0, 1, '2e étage', 'D', 'Studio',      'disponible', false, 5.0, 'Studio meublé idéalement situé, parfait investissement locatif. Pièce de vie optimisée, coin nuit séparé, salle d''eau moderne.', null, null),
 ('00000000-0000-0000-0000-0000000000b4', '11111111-1111-1111-1111-111111111111', 'APT-231', 'Appartement T4',       'Boulogne',  890000, 95,  4, 3, 2, '6e étage', 'B', 'Appartement', 'disponible', true,  4.0, 'Appartement d''exception en dernier étage avec vue dégagée et grande terrasse. Prestations haut de gamme, triple exposition, parking en sous-sol.', null, null),
 ('00000000-0000-0000-0000-0000000000b5', '11111111-1111-1111-1111-111111111111', 'MAI-312', 'Maison contemporaine', 'Meudon',    750000, 130, 6, 4, 2, 'Maison',    'A', 'Maison',      'vendu',      false, 3.5, 'Maison contemporaine basse consommation, architecture moderne et matériaux nobles. Vastes volumes baignés de lumière, jardin paysager, garage double.', '00000000-0000-0000-0000-0000000000a5', 'acte_definitif');

-- ─── Visites ───────────────────────────────────────────────────────────────
insert into visits (id, account_id, prospect_id, title, starts_at) values
 ('00000000-0000-0000-0000-0000000000c1', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a1', 'T3 · Rue de la Paix', '2026-07-06 14:00:00+02'),
 ('00000000-0000-0000-0000-0000000000c2', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a2', 'Maison · Clichy',     '2026-07-06 16:00:00+02'),
 ('00000000-0000-0000-0000-0000000000c3', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a3', 'Studio · Levallois',  '2026-07-08 11:00:00+02'),
 ('00000000-0000-0000-0000-0000000000c4', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a6', 'T4 · Boulogne',       '2026-07-09 18:00:00+02'),
 ('00000000-0000-0000-0000-0000000000c5', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a5', 'Maison · Meudon',     '2026-07-10 10:00:00+02');

-- ─── Documents (GED) ───────────────────────────────────────────────────────
insert into documents (account_id, prospect_id, name, doc_type) values
 ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a1', 'CNI_Marc_Dubois.pdf',      'piece_identite'),
 ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a1', 'Bulletins_salaire.pdf',    'justificatif_revenus'),
 ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a4', 'Offre_achat_signee.pdf',   'offre_achat'),
 ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000a4', 'Simulation_pret.pdf',      'simulation_pret');

-- ─── Notifications ─────────────────────────────────────────────────────────
insert into notifications (account_id, kind, title, body, read, entity_type, entity_id) values
 ('11111111-1111-1111-1111-111111111111', 'lead',     'Nouveau prospect',  'Léa Moreau a rempli le formulaire du site',        false, 'prospect', '00000000-0000-0000-0000-0000000000a6'),
 ('11111111-1111-1111-1111-111111111111', 'visite',   'Visite dans 1 h',   'T3 · Rue de la Paix avec Marc Dubois',             false, 'visit',    '00000000-0000-0000-0000-0000000000c1'),
 ('11111111-1111-1111-1111-111111111111', 'offre',    'Offre acceptée',    'Maison · Clichy — offre de Sophie Leroy acceptée', false, 'property', '00000000-0000-0000-0000-0000000000b2'),
 ('11111111-1111-1111-1111-111111111111', 'document', 'Document reçu',     'Julie Martin a déposé sa simulation de prêt',      true,  'prospect', '00000000-0000-0000-0000-0000000000a4');

-- ─── Facturation ───────────────────────────────────────────────────────────
insert into invoices (account_id, period, amount_cents) values
 ('11111111-1111-1111-1111-111111111111', '2026-07', 4900),
 ('11111111-1111-1111-1111-111111111111', '2026-06', 4900),
 ('11111111-1111-1111-1111-111111111111', '2026-05', 4900);

insert into payment_methods (account_id, brand, last4, exp_month, exp_year) values
 ('11111111-1111-1111-1111-111111111111', 'visa', '4242', 9, 28);
