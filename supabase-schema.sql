-- Jardin Secret — schéma Supabase pour les commandes et les avis
-- À exécuter une seule fois dans Supabase : SQL Editor → New query → coller → Run

-- ORDERS : une ligne par commande confirmée, sert à vérifier les avis
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  full_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  notes text,
  items jsonb not null,
  subtotal integer not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Le site public peut créer une commande (checkout), jamais les lire
create policy "orders_insert_public" on public.orders
  for insert to anon
  with check (true);

-- Seule une personne connectée (toi, via /admin/avis) peut lire les commandes
create policy "orders_select_admin" on public.orders
  for select to authenticated
  using (true);


-- REVIEWS : avis clients
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  order_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Le site public peut soumettre un avis, toujours en attente et non vérifié
create policy "reviews_insert_public" on public.reviews
  for insert to anon
  with check (status = 'pending' and verified = false);

-- Le site public ne voit que les avis déjà approuvés
create policy "reviews_select_public_approved" on public.reviews
  for select to anon
  using (status = 'approved');

-- Toi (connectée) vois aussi les avis en attente, pour les modérer
create policy "reviews_select_admin" on public.reviews
  for select to authenticated
  using (true);

-- Toi (connectée) peux approuver / rejeter / vérifier un avis
create policy "reviews_update_admin" on public.reviews
  for update to authenticated
  using (true)
  with check (true);
