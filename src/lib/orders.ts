import { supabase } from "./supabase";
import type { Product } from "../data/products";

export async function saveOrder(input: {
  orderNumber: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: { product: Product; quantity: number }[];
  subtotal: number;
}) {
  const { error } = await supabase.from("orders").insert({
    order_number: input.orderNumber,
    full_name: input.fullName,
    phone: input.phone,
    city: input.city,
    address: input.address,
    notes: input.notes || null,
    items: input.items.map(({ product, quantity }) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
    })),
    subtotal: input.subtotal,
  });

  if (error) throw error;
}
