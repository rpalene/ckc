-- ============================================================
-- CKC – Patch RLS : correction erreur inscription
-- À exécuter dans l'éditeur SQL Supabase (projet existant)
-- ============================================================

-- 1. Supprimer les anciennes policies INSERT qui bloquent le signUp
drop policy if exists "Utilisateur crée son profil" on profiles;
drop policy if exists "Artisan crée son profil"     on artisans;

-- 2. Trigger : crée le profil automatiquement depuis auth.users
--    (security definer = bypass RLS, s'exécute sans session active)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, commune)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'commune'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3. RPC : création du profil artisan sans session active
create or replace function create_artisan_profile(
  p_profile_id    uuid,
  p_business_name text,
  p_patent_number text,
  p_description   text,
  p_commune       text,
  p_category      text,
  p_trades        text[]
) returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.artisans
    (profile_id, business_name, patent_number, description, commune, category, trades)
  values
    (p_profile_id, p_business_name, p_patent_number, p_description, p_commune, p_category, p_trades);
end;
$$;
