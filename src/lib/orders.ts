import { supabase } from "./supabase";
import type { Product } from "../data/products";

export type PlacedOrder = {
  orderNumber: string;
  /** Total calculé par le serveur à partir des prix en base. */
  subtotal: number;
  /** Lignes telles qu'enregistrées (prix serveur). */
  items: { slug: string; name: string; price: number; quantity: number }[];
};

/**
 * Enregistre la commande via la fonction serveur `place_order`, qui :
 * - valide les coordonnées et le panier,
 * - lit les vrais prix en base (le navigateur n'envoie que slug + quantité),
 * - vérifie et décrémente le stock de façon atomique,
 * - génère un numéro de commande unique.
 * Lève une Error avec un message lisible par la cliente en cas de refus.
 */
export async function placeOrder(input: {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: { product: Product; quantity: number }[];
}): Promise<PlacedOrder> {
  const { data, error } = await supabase.rpc("place_order", {
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_city: input.city,
    p_address: input.address,
    p_notes: input.notes,
    p_items: input.items.map(({ product, quantity }) => ({ slug: product.slug, quantity })),
  });

  if (error) {
    // Les refus métier (stock, validation) arrivent avec le code P0001 et un message en français.
    if (error.code === "P0001" && error.message) throw new Error(error.message);
    throw new Error(
      "La commande n'a pas pu être enregistrée. Vérifiez votre connexion internet et réessayez."
    );
  }

  const result = data as { order_number: string; subtotal: number; items: PlacedOrder["items"] };
  return { orderNumber: result.order_number, subtotal: result.subtotal, items: result.items };
}
