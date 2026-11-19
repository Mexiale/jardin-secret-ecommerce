-- Jardin Secret - sécurisation du tunnel d'achat - ÉTAPE 1 sur 2
-- À exécuter APRÈS supabase-schema-products.sql, AVANT de déployer le nouveau site.
-- Sans effet sur le site actuel : ajoute seulement la fonction place_order.
-- Ensuite : déployer le site, PUIS exécuter supabase-securite-2-verrouillage.sql.
--
-- Avant : le navigateur envoyait lui-même prix, total et décrément de stock.
-- N'importe quel visiteur pouvait donc vider le stock (rupture partout) ou
-- enregistrer une commande à un prix inventé.
-- Après : une seule fonction serveur, place_order, valide la commande, lit les
-- vrais prix en base, vérifie et décrémente le stock de façon atomique, et
-- génère un numéro de commande unique.

-- ============================================================ 1. place_order
create or replace function public.place_order(
  p_full_name text,
  p_phone text,
  p_city text,
  p_address text,
  p_notes text,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text := trim(coalesce(p_full_name, ''));
  v_phone text := trim(coalesce(p_phone, ''));
  v_city text := trim(coalesce(p_city, ''));
  v_address text := trim(coalesce(p_address, ''));
  v_notes text := nullif(trim(coalesce(p_notes, '')), '');
  v_line record;
  v_product record;
  v_stock integer;
  v_items jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_number text;
  v_attempt integer := 0;
begin
  -- ---- Validation des coordonnées
  if length(v_full_name) not between 2 and 100 then
    raise exception 'Merci d''indiquer votre nom complet.' using errcode = 'P0001';
  end if;
  if v_phone !~ '^\+?[0-9 ().-]{8,20}$' then
    raise exception 'Numéro de téléphone invalide.' using errcode = 'P0001';
  end if;
  if length(v_city) not between 2 and 80 then
    raise exception 'Merci d''indiquer votre ville ou commune.' using errcode = 'P0001';
  end if;
  if length(v_address) not between 3 and 300 then
    raise exception 'Merci d''indiquer une adresse de livraison.' using errcode = 'P0001';
  end if;
  if v_notes is not null and length(v_notes) > 1000 then
    raise exception 'Les instructions de livraison sont trop longues.' using errcode = 'P0001';
  end if;

  -- ---- Validation du panier
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 30 then
    raise exception 'Panier invalide.' using errcode = 'P0001';
  end if;

  -- ---- Anti-abus : 5 commandes maximum par numéro et par heure
  if (select count(*) from orders
      where phone = v_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Trop de commandes avec ce numéro. Merci de nous appeler directement.'
      using errcode = 'P0001';
  end if;

  -- ---- Lignes : prix lus en base, stock verrouillé (ordre fixe = pas d'interblocage)
  for v_line in
    select slug, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(slug text, quantity integer)
    group by slug
    order by slug
  loop
    if v_line.slug is null or v_line.quantity is null or v_line.quantity not between 1 and 50 then
      raise exception 'Quantité invalide.' using errcode = 'P0001';
    end if;

    select slug, name, price into v_product
    from products
    where slug = v_line.slug and active and price > 0;
    if not found then
      raise exception 'Un produit de votre panier n''est plus disponible. Merci de le retirer et de réessayer.'
        using errcode = 'P0001';
    end if;

    select quantity into v_stock from stock where product_slug = v_line.slug for update;
    if found then
      if v_stock < v_line.quantity then
        raise exception 'Stock insuffisant pour « % » : il en reste %.', v_product.name, greatest(v_stock, 0)
          using errcode = 'P0001';
      end if;
      update stock
        set quantity = quantity - v_line.quantity, updated_at = now()
        where product_slug = v_line.slug;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_line.quantity;
    v_items := v_items || jsonb_build_object(
      'slug', v_product.slug,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_line.quantity
    );
  end loop;

  -- ---- Numéro de commande unique et non devinable, ex. JS-261119-7A3F0C
  loop
    v_attempt := v_attempt + 1;
    v_number := 'JS-' || to_char(now() at time zone 'Africa/Abidjan', 'YYMMDD') || '-'
      || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    begin
      insert into orders (order_number, full_name, phone, city, address, notes, items, subtotal)
      values (v_number, v_full_name, v_phone, v_city, v_address, v_notes, v_items, v_subtotal);
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  return jsonb_build_object('order_number', v_number, 'subtotal', v_subtotal, 'items', v_items);
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to anon, authenticated;
