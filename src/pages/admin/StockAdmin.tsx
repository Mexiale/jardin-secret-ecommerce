import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminHeader from "../../components/admin/AdminHeader";
import { useSupabaseSession } from "../../lib/useSupabaseSession";
import { fetchAllStock, updateStock } from "../../lib/stock";
import { fetchAllProducts } from "../../lib/products";
import ProductImage from "../../components/ProductImage";
import type { Product } from "../../data/products";

export default function StockAdmin() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loadingStock, setLoadingStock] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const loadStock = async () => {
    setLoadingStock(true);
    try {
      const [list, data] = await Promise.all([fetchAllProducts(), fetchAllStock()]);
      setProducts(list);
      setStock(data);
      const nextDrafts: Record<string, string> = {};
      list.forEach((p) => {
        nextDrafts[p.slug] = p.slug in data ? String(data[p.slug]) : "";
      });
      setDrafts(nextDrafts);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    if (session) loadStock();
  }, [session]);

  const handleSave = async (slug: string) => {
    const value = Number(drafts[slug]);
    if (!Number.isFinite(value) || value < 0) return;

    setSavingSlug(slug);
    try {
      await updateStock(slug, value);
      setStock((prev) => ({ ...prev, [slug]: value }));
      setSavedSlug(slug);
      setTimeout(() => setSavedSlug(null), 1500);
    } finally {
      setSavingSlug(null);
    }
  };

  if (sessionLoading) return null;
  if (!session) return <AdminLogin />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <AdminHeader />

      <div className="mb-8">
        <h1 className="font-serif text-2xl text-forest-950">Gestion du stock</h1>
        <p className="mt-2 text-sm text-forest-500">
          Un produit sans quantité renseignée reste affiché comme disponible sur le site. Mets à
          jour ici après chaque vente ou réassort.
        </p>
      </div>

      {loadingStock && <p className="text-sm text-forest-500">Chargement...</p>}

      <div className="space-y-3">
        {products.map((product) => {
          const tracked = product.slug in stock;
          const isOutOfStock = tracked && stock[product.slug] <= 0;

          return (
            <div
              key={product.slug}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-forest-200/70 bg-cream-50 p-4"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                compact
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div className="min-w-[180px] flex-1">
                <p className="font-medium text-forest-900">{product.name}</p>
                <p className="text-xs text-forest-500">
                  {tracked
                    ? isOutOfStock
                      ? "Rupture de stock"
                      : "Suivi activé"
                    : "Non suivi - toujours disponible"}
                </p>
              </div>
              <input
                type="number"
                min={0}
                value={drafts[product.slug] ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [product.slug]: e.target.value }))
                }
                placeholder="Quantité"
                className="w-28 rounded-xl border border-forest-200 bg-cream-50 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
              />
              <button
                onClick={() => handleSave(product.slug)}
                disabled={savingSlug === product.slug || drafts[product.slug] === ""}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-xs font-medium text-cream-50 hover:bg-forest-800 disabled:opacity-50"
              >
                {savingSlug === product.slug ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : savedSlug === product.slug ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                Enregistrer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
