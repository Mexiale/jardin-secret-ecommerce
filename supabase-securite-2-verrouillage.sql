-- Jardin Secret - sécurisation du tunnel d'achat - ÉTAPE 2 sur 2
-- À exécuter UNIQUEMENT APRÈS avoir déployé le site qui utilise place_order
-- (sinon l'ancien site ne pourrait plus enregistrer de commandes).
--
-- Ferme les accès directs que l'ancien site utilisait.

-- ------------------------------------------------------------------------
-- 1. Plus personne ne peut appeler decrement_stock depuis internet
--    (faille critique : n'importe quel visiteur pouvait vider le stock).
--    Le stock est maintenant décrémenté uniquement par place_order.
revoke execute on function public.decrement_stock(text, integer) from public, anon, authenticated;

-- 2. Plus d'insertion directe de commande : uniquement via place_order,
--    qui calcule les prix et le total côté serveur.
drop policy if exists "orders_insert_public" on public.orders;

-- 3. Fonction interne de Supabase exposée par erreur dans l'API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 4. search_path figé (recommandation de l'audit Supabase).
alter function public.touch_updated_at() set search_path = public;

-- 5. Droits minimaux pour les visiteurs anonymes (défense en profondeur :
--    les règles RLS bloquaient déjà le reste, on retire aussi les droits bruts).
revoke all on public.orders, public.products, public.stock, public.reviews from anon;
grant select on public.products, public.stock to anon;
grant select, insert on public.reviews to anon;

-- 6. Avis : longueurs bornées (évite le spam de textes géants).
alter table public.reviews
  drop constraint if exists reviews_author_name_len,
  drop constraint if exists reviews_comment_len,
  drop constraint if exists reviews_order_number_len;
alter table public.reviews
  add constraint reviews_author_name_len check (length(trim(author_name)) between 2 and 80),
  add constraint reviews_comment_len check (length(trim(comment)) between 3 and 2000),
  add constraint reviews_order_number_len check (length(order_number) <= 40);

-- 7. Commandes : bornes de sécurité, même si place_order valide déjà tout.
alter table public.orders
  drop constraint if exists orders_subtotal_positive,
  drop constraint if exists orders_items_array;
alter table public.orders
  add constraint orders_subtotal_positive check (subtotal >= 0),
  add constraint orders_items_array check (jsonb_typeof(items) = 'array');
