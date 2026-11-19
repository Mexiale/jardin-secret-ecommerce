-- Jardin Secret — table de gestion du stock
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run

create table public.stock (
  product_slug text primary key,
  quantity integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.stock enable row level security;

-- Le site public peut lire le stock (pour afficher "rupture de stock")
create policy "stock_select_public" on public.stock
  for select to anon
  using (true);

-- Toi (connectée) peux lire, créer et modifier les quantités
create policy "stock_select_admin" on public.stock
  for select to authenticated
  using (true);

create policy "stock_insert_admin" on public.stock
  for insert to authenticated
  with check (true);

create policy "stock_update_admin" on public.stock
  for update to authenticated
  using (true)
  with check (true);

-- Droits bruts (indispensables en plus des policies ci-dessus)
grant usage on schema public to anon, authenticated;
grant select on public.stock to anon;
grant select, insert, update on public.stock to authenticated;

-- Valeurs de départ pour les produits existants (modifiable ensuite dans /admin/stock)
insert into public.stock (product_slug, quantity) values
  ('myo-inositol-equilibre', 20),
  ('complexe-fertilite-femme', 20),
  ('ashwagandha-serenite', 20),
  ('omega3-hormones', 20),
  ('vitamine-d3-k2', 20),
  ('complement-fertilite-homme', 20)
on conflict (product_slug) do nothing;
