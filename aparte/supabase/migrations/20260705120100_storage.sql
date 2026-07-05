-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Buckets de stockage (photos de biens, GED documentaire)      ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Convention de chemin : `<account_id>/...` → l'isolation multi-tenant se fait
-- en comparant le premier segment du chemin à l'account de l'utilisateur.

insert into storage.buckets (id, name, public)
values
  ('property-photos', 'property-photos', true),   -- publiques (site public)
  ('documents',       'documents',       false)   -- privées (GED)
on conflict (id) do nothing;

-- Photos de biens : lecture publique, écriture réservée aux membres de l'espace.
create policy "property_photos_public_read" on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "property_photos_member_write" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = current_account_id()::text
    and current_user_role() in ('client', 'invite')
  );

create policy "property_photos_member_delete" on storage.objects for delete
  to authenticated using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = current_account_id()::text
    and current_user_role() in ('client', 'invite')
  );

-- GED : lecture/écriture strictement réservées aux membres de l'espace.
create policy "documents_member_all" on storage.objects for all
  to authenticated using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_account_id()::text
    and current_user_role() in ('client', 'invite')
  ) with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_account_id()::text
    and current_user_role() in ('client', 'invite')
  );
