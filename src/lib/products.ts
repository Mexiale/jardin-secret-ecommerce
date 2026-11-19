import { supabase } from "./supabase";
import { CATEGORIES, type Category, type Product } from "../data/products";

type ProductRow = {
  slug: string;
  name: string;
  brand: string | null;
  tagline: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  active: boolean;
  image_url: string | null;
  short_description: string;
  description: string;
  benefits: string[] | null;
  usage: string;
  ingredients: string;
  sort_order: number;
};

const COLUMNS =
  "slug, name, brand, tagline, category, price, compare_at_price, featured, active, image_url, short_description, description, benefits, usage, ingredients, sort_order";

function toCategory(value: string): Category {
  return (CATEGORIES as readonly string[]).includes(value)
    ? (value as Category)
    : "Bien-être global";
}

export function rowToProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? undefined,
    tagline: row.tagline,
    category: toCategory(row.category),
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    featured: row.featured,
    active: row.active,
    image: row.image_url ?? "",
    shortDescription: row.short_description,
    description: row.description,
    benefits: row.benefits ?? [],
    usage: row.usage,
    ingredients: row.ingredients,
  };
}

function productToRow(p: Product): Omit<ProductRow, "sort_order"> {
  return {
    slug: p.slug,
    name: p.name.trim(),
    brand: p.brand?.trim() || null,
    tagline: p.tagline.trim(),
    category: p.category,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    featured: !!p.featured,
    active: p.active,
    image_url: p.image || null,
    short_description: p.shortDescription.trim(),
    description: p.description.trim(),
    benefits: p.benefits.map((b) => b.trim()).filter(Boolean),
    usage: p.usage.trim(),
    ingredients: p.ingredients.trim(),
  };
}

/** Produits visibles en boutique, dans l'ordre d'affichage. */
export async function fetchActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("active", true)
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

/** Tous les produits, y compris masqués (admin connectée uniquement). */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchProductForAdmin(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select(COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function createProduct(p: Product) {
  // Nouveau produit : placé en fin de catalogue.
  const { data: last } = await supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((last as { sort_order: number } | null)?.sort_order ?? 0) + 10;
  const { error } = await supabase.from("products").insert({ ...productToRow(p), sort_order });
  if (error) {
    if (error.code === "23505") throw new Error("Un produit avec cet identifiant existe déjà.");
    throw error;
  }
}

export async function updateProduct(p: Product) {
  const { slug, ...row } = productToRow(p);
  const { error } = await supabase.from("products").update(row).eq("slug", slug);
  if (error) throw error;
}

export async function deleteProduct(slug: string) {
  const { error } = await supabase.from("products").delete().eq("slug", slug);
  if (error) throw error;
  await supabase.from("stock").delete().eq("product_slug", slug);
}

/** "Thé de feuilles d'été" -> "the-de-feuilles-d-ete" */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Redimensionne la photo (1000 px max, format carré conservé si besoin) en WebP
 * avant l'envoi : des photos de téléphone de 3-5 Mo deviennent ~50 Ko,
 * ce qui compte beaucoup sur une connexion mobile.
 */
async function toWebp(file: File, maxSize = 1000): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion de l'image impossible"))), "image/webp", 0.85)
  );
}

/** Envoie la photo dans le bucket "produits" et renvoie son URL publique. */
export async function uploadProductImage(slug: string, file: File): Promise<string> {
  const blob = await toWebp(file);
  const path = `${slug}-${Date.now()}.webp`;
  const { error } = await supabase.storage
    .from("produits")
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("produits").getPublicUrl(path).data.publicUrl;
}
