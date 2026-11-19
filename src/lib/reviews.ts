import { supabase } from "./supabase";

export type Review = {
  id: string;
  product_slug: string;
  author_name: string;
  rating: number;
  comment: string;
  order_number: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  created_at: string;
};

export async function fetchApprovedReviews(productSlug: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function submitReview(input: {
  productSlug: string;
  authorName: string;
  rating: number;
  comment: string;
  orderNumber: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    product_slug: input.productSlug,
    author_name: input.authorName,
    rating: input.rating,
    comment: input.comment,
    order_number: input.orderNumber,
  });

  if (error) throw error;
}
