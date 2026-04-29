-- ============================================================
-- CKC – Schéma Supabase
-- Coller dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table profiles (
  id          uuid references auth.users primary key,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  role        text not null check (role in ('client','artisan')) default 'client',
  avatar_url  text,
  commune     text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;
create policy "Profil visible par tous"      on profiles for select using (true);
create policy "Utilisateur modifie son profil" on profiles for update using (auth.uid() = id);
create policy "Utilisateur crée son profil"  on profiles for insert with check (auth.uid() = id);

-- ─── ARTISANS ───────────────────────────────────────────────
create table artisans (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid references profiles(id) unique not null,
  business_name  text not null,
  patent_number  text,
  description    text,
  commune        text not null,
  trades         text[] default '{}',
  category       text,
  rating         numeric(3,2) default 0,
  reviews_count  integer default 0,
  available      boolean default true,
  verified       boolean default false,
  created_at     timestamptz default now()
);

alter table artisans enable row level security;
create policy "Artisans visibles par tous"    on artisans for select using (true);
create policy "Artisan modifie son profil"    on artisans for update using (
  auth.uid() = profile_id
);
create policy "Artisan crée son profil"       on artisans for insert with check (
  auth.uid() = profile_id
);

-- ─── CONVERSATIONS ──────────────────────────────────────────
create table conversations (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid references profiles(id) not null,
  artisan_id  uuid references artisans(id) not null,
  created_at  timestamptz default now(),
  unique(client_id, artisan_id)
);

alter table conversations enable row level security;
create policy "Participants voient la conversation" on conversations for select using (
  auth.uid() = client_id or
  auth.uid() = (select profile_id from artisans where id = artisan_id)
);
create policy "Client crée conversation" on conversations for insert with check (
  auth.uid() = client_id
);

-- ─── MESSAGES ───────────────────────────────────────────────
create table messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid references conversations(id) on delete cascade not null,
  sender_id        uuid references profiles(id) not null,
  content          text not null,
  read             boolean default false,
  created_at       timestamptz default now()
);

alter table messages enable row level security;
create policy "Participants voient les messages" on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (
      auth.uid() = c.client_id or
      auth.uid() = (select profile_id from artisans where id = c.artisan_id)
    )
  )
);
create policy "Participants envoient des messages" on messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (
      auth.uid() = c.client_id or
      auth.uid() = (select profile_id from artisans where id = c.artisan_id)
    )
  )
);

-- ─── REVIEWS ────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid references profiles(id) not null,
  artisan_id  uuid references artisans(id) not null,
  rating      integer check (rating between 1 and 5) not null,
  comment     text,
  created_at  timestamptz default now(),
  unique(client_id, artisan_id)
);

alter table reviews enable row level security;
create policy "Avis visibles par tous"  on reviews for select using (true);
create policy "Client dépose un avis"   on reviews for insert with check (auth.uid() = client_id);
create policy "Client modifie son avis" on reviews for update using (auth.uid() = client_id);

-- ─── TRIGGER : mise à jour note artisan ─────────────────────
create or replace function update_artisan_rating()
returns trigger as $$
begin
  update artisans
  set
    rating        = (select round(avg(rating)::numeric, 2) from reviews where artisan_id = new.artisan_id),
    reviews_count = (select count(*) from reviews where artisan_id = new.artisan_id)
  where id = new.artisan_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_upserted
  after insert or update on reviews
  for each row execute function update_artisan_rating();

-- ─── Realtime ───────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
