-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Cible des notifications (deep-link)                          ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Permet au clic sur une notification d'ouvrir le bon écran + le bon contexte.
--   entity_type : 'prospect' | 'property' | 'visit'
--   entity_id   : id de l'entité ciblée (prospect, bien ou visite)
alter table notifications add column if not exists entity_type text;
alter table notifications add column if not exists entity_id   uuid;
