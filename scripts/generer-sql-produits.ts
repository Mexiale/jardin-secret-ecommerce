/**
 * Génère supabase-schema-products.sql à partir de src/data/products.ts.
 *
 * Usage (Node 22.6+) :  node scripts/generer-sql-produits.ts
 */
import { writeFileSync } from "node:fs";
import { CATEGORIES, initialStock, products } from "../src/data/products.ts";

const q = (v: string | null | undefined) =>
  v === null || v === undefined || v === "" ? "null" : `'${v.replace(/'/g, "''")}'`;
const arr = (v: string[]) =>
  v.length === 0 ? "'{}'::text[]" : `array[${v.map((x) => q(x)).join(", ")}]::text[]`;

const rows = products.map((p, i) =>
  [
    q(p.slug),
    q(p.name),
    q(p.brand),
    q(p.tagline),
    q(p.category),
    p.price,
    p.compareAtPrice ?? "null",
    p.featured ? "true" : "false",
    p.active ? "true" : "false",
    q(p.image),
    q(p.shortDescription),
    q(p.description),
    arr(p.benefits),
    q(p.usage),
    q(p.ingredients),
    (i + 1) * 10,
  ].join(", ")
);

const stockRows = Object.entries(initialStock).map(([slug, qty]) => `  (${q(slug)}, ${qty})`);

const sql = `-- Jardin Secret - catalogue produits modifiable depuis /admin/produits
-- Fichier GÉNÉRÉ par scripts/generer-sql-produits.ts (ne pas modifier à la main).
-- À exécuter UNE FOIS dans Supabase : SQL Editor -> New query -> coller -> Run
-- (après supabase-schema-stock.sql).

-- ---------------------------------------------------------------- Table
create table if not exists public.products (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  brand text,
  tagline text not null default '',
  category text not null check (category in (${CATEGORIES.map((c) => q(c)).join(", ")})),
  price integer not null default 0 check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  image_url text,
  short_description text not null default '',
  description text not null default '',
  benefits text[] not null default '{}',
  usage text not null default '',
  ingredients text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

-- Le site public ne voit que les produits visibles
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select to anon
  using (active);

-- Toi (connectée) vois tout et peux créer / modifier / supprimer
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin" on public.products
  for select to authenticated using (true);

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert to authenticated with check (true);

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update to authenticated using (true) with check (true);

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete to authenticated using (true);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

-- ------------------------------------------------- Photos (Supabase Storage)
-- Bucket public : tout le monde peut voir les photos, seule l'admin peut en ajouter.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "produits_images_insert_admin" on storage.objects;
create policy "produits_images_insert_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'produits');

drop policy if exists "produits_images_update_admin" on storage.objects;
create policy "produits_images_update_admin" on storage.objects
  for update to authenticated using (bucket_id = 'produits') with check (bucket_id = 'produits');

drop policy if exists "produits_images_delete_admin" on storage.objects;
create policy "produits_images_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'produits');

-- ----------------------------------------------------- Stock : suppression
-- L'admin peut retirer la ligne de stock d'un produit supprimé.
drop policy if exists "stock_delete_admin" on public.stock;
create policy "stock_delete_admin" on public.stock
  for delete to authenticated using (true);
grant delete on public.stock to authenticated;

-- ------------------------------------------------------ Catalogue de départ
-- "on conflict do nothing" : relancer ce fichier n'écrase pas vos modifications.
insert into public.products (
  slug, name, brand, tagline, category, price, compare_at_price, featured, active,
  image_url, short_description, description, benefits, usage, ingredients, sort_order
) values
${rows.map((r) => `  (${r})`).join(",\n")}
on conflict (slug) do nothing;

-- -------------------------------------------------------- Stock de départ
-- Quantités de la liste du 19/11/2026. ATTENTION : relancer ce bloc remet
-- le stock à ces valeurs.
insert into public.stock (product_slug, quantity) values
${stockRows.join(",\n")}
on conflict (product_slug) do update set quantity = excluded.quantity, updated_at = now();
`;

writeFileSync(new URL("../supabase-schema-products.sql", import.meta.url), sql);
console.log(`supabase-schema-products.sql : ${products.length} produits, ${stockRows.length} lignes de stock`);
