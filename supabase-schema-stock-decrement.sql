-- Jardin Secret — décrément automatique du stock à la commande
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run

-- Fonction sécurisée : ne fait QUE décrémenter (jamais en dessous de 0),
-- ne touche à rien d'autre. Les visiteurs n'ont jamais de droit d'écriture
-- direct sur la table stock, uniquement le droit d'appeler cette fonction.
create or replace function public.decrement_stock(p_product_slug text, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stock
  set quantity = greatest(quantity - p_quantity, 0),
      updated_at = now()
  where product_slug = p_product_slug;
end;
$$;

grant execute on function public.decrement_stock(text, integer) to anon, authenticated;
