-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Aparté — Affectation automatique du tenant à l'insertion              ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Renseigne account_id = current_account_id() si le client ne le fournit pas.
-- Le trigger BEFORE INSERT s'exécute avant la contrainte NOT NULL et la
-- vérification RLS (WITH CHECK) → le client n'a jamais à connaître son tenant.

create or replace function set_account_id()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.account_id is null then
    new.account_id := current_account_id();
  end if;
  return new;
end $$;

create trigger prospects_set_account     before insert on prospects     for each row execute function set_account_id();
create trigger properties_set_account    before insert on properties    for each row execute function set_account_id();
create trigger visits_set_account        before insert on visits        for each row execute function set_account_id();
create trigger documents_set_account     before insert on documents     for each row execute function set_account_id();
create trigger notifications_set_account before insert on notifications for each row execute function set_account_id();
