import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Loader2, Pencil } from "lucide-react";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminHeader from "../../components/admin/AdminHeader";
import ProductImage from "../../components/ProductImage";
import { useSupabaseSession } from "../../lib/useSupabaseSession";
import { fetchAllProducts } from "../../lib/products";
import { fetchAllStock } from "../../lib/stock";
import { formatPrice } from "../../lib/format";
import { CATEGORIES, type Product } from "../../data/products";

type Filtre = "Tous" | "À compléter" | "Masqués" | (typeof CATEGORIES)[number];

function aCompleter(p: Product) {
  return !p.image || p.price <= 0 || !p.description.trim();
}

export default function ProduitsAdmin() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("Tous");

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([fetchAllProducts(), fetchAllStock()])
      .then(([p, s]) => {
        setProducts(p);
        setStock(s);
      })
      .catch((e) =>
        setError(
          `Impossible de charger les produits (${e.message ?? e}). Avez-vous exécuté supabase-schema-products.sql ?`
        )
      )
      .finally(() => setLoading(false));
  }, [session]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.brand ?? ""} ${p.slug}`.toLowerCase().includes(q)) return false;
      if (filtre === "Tous") return true;
      if (filtre === "À compléter") return aCompleter(p);
      if (filtre === "Masqués") return !p.active;
      return p.category === filtre;
    });
  }, [products, query, filtre]);

  if (sessionLoading) return null;
  if (!session) return <AdminLogin />;

  const nbACompleter = products.filter(aCompleter).length;
  const filtres: Filtre[] = ["Tous", "À compléter", "Masqués", ...CATEGORIES];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <AdminHeader />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-forest-950">Produits</h1>
          <p className="mt-2 text-sm text-forest-500">
            {products.length} produits
            {nbACompleter > 0 && ` · ${nbACompleter} à compléter (photo, prix ou description)`}
          </p>
        </div>
        <Link
          to="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
        >
          <Plus className="h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit"
            className="w-full rounded-full border border-forest-200 bg-cream-50 py-2 pl-9 pr-4 text-sm focus:border-forest-500 focus:outline-none"
          />
        </label>
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value as Filtre)}
          className="rounded-full border border-forest-200 bg-cream-50 px-4 py-2 text-sm focus:border-forest-500 focus:outline-none"
        >
          {filtres.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-forest-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
        </p>
      )}
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="space-y-2">
        {visibles.map((p) => {
          const qty = stock[p.slug];
          return (
            <Link
              key={p.slug}
              to={`/admin/produits/${p.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-forest-200/70 bg-cream-50 p-3 transition-colors hover:border-forest-400"
            >
              <ProductImage
                src={p.image}
                alt={p.name}
                compact
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-forest-900">{p.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-forest-100 px-2 py-0.5 text-forest-700">{p.category}</span>
                  {!p.active && (
                    <span className="rounded-full bg-forest-800 px-2 py-0.5 text-cream-50">Masqué</span>
                  )}
                  {!p.image && (
                    <span className="rounded-full bg-gold-300/60 px-2 py-0.5 text-forest-900">Sans photo</span>
                  )}
                  {p.price <= 0 && (
                    <span className="rounded-full bg-gold-300/60 px-2 py-0.5 text-forest-900">Sans prix</span>
                  )}
                </div>
              </div>
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-forest-900">{p.price > 0 ? formatPrice(p.price) : "-"}</p>
                {p.compareAtPrice ? (
                  <p className="text-xs text-forest-400 line-through">{formatPrice(p.compareAtPrice)}</p>
                ) : null}
              </div>
              <div className="w-20 text-right text-sm">
                <p
                  className={
                    qty === undefined
                      ? "text-forest-400"
                      : qty <= 0
                        ? "font-medium text-red-600"
                        : "text-forest-800"
                  }
                >
                  {qty === undefined ? "Non suivi" : qty <= 0 ? "Rupture" : `${qty} en stock`}
                </p>
              </div>
              <Pencil className="h-4 w-4 shrink-0 text-forest-400" />
            </Link>
          );
        })}
        {!loading && !error && visibles.length === 0 && (
          <p className="py-8 text-center text-sm text-forest-500">Aucun produit ne correspond.</p>
        )}
      </div>
    </div>
  );
}
