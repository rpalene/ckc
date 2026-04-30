-- ============================================================
-- CKC – Patch v2 : fix RLS inscription (sans trigger)
-- Remplace le trigger handle_new_user par deux RPCs security definer
-- À exécuter dans SQL Editor → Supabase
-- ============================================================

-- 1. Supprimer le trigger précédent (non fiable sur Supabase hosted)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- 2. S'assurer que les policies INSERT problématiques sont supprimées
drop policy if exists "Utilisateur crée son profil" on profiles;
drop policy if exists "Artisan crée son profil"     on artisans;

-- 3. RPC : créer un profil utilisateur sans session active
--    security definer  → bypass RLS
--    vérifie via auth.users que l'uid + email correspondent bien
--    accessible au rôle anon (pas de JWT requis)
create or replace function public.create_profile(
  p_id        uuid,
  p_email     text,
  p_full_name text,
  p_phone     text,
  p_role      text,
  p_commune   text
) returns void language plpgsql security definer set search_path = public
as $$
begin
  -- Sécurité : vérifier que cet utilisateur existe vraiment dans auth
  if not exists (
    select 1 from auth.users where id = p_id and email = p_email
  ) then
    raise exception 'Utilisateur introuvable dans auth.users';
  end if;

  insert into profiles (id, email, full_name, phone, role, commune)
  values (p_id, p_email, p_full_name, p_phone, p_role, p_commune)
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.create_profile to anon, authenticated;

-- 4. RPC : créer un profil artisan sans session active
create or replace function public.create_artisan_profile(
  p_profile_id    uuid,
  p_business_name text,
  p_patent_number text,
  p_description   text,
  p_commune       text,
  p_category      text,
  p_trades        text[]
) returns void language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = p_profile_id) then
    raise exception 'Profil introuvable';
  end if;

  insert into artisans
    (profile_id, business_name, patent_number, description, commune, category, trades)
  values
    (p_profile_id, p_business_name, p_patent_number, p_description, p_commune, p_category, p_trades)
  on conflict (profile_id) do nothing;
end;
$$;

grant execute on function public.create_artisan_profile to anon, authenticated;
