import { supabase } from "./supabase";

export async function fetchAllStock(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("stock").select("product_slug, quantity");
  if (error) throw error;

  const map: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    map[row.product_slug] = row.quantity;
  });
  return map;
}

export async function updateStock(productSlug: string, quantity: number) {
  const { error } = await supabase
    .from("stock")
    .upsert({ product_slug: productSlug, quantity, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Le stock est décrémenté côté serveur par la fonction place_order (voir src/lib/orders.ts).
