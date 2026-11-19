import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Truck, Banknote, Leaf, Minus, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { hasPrice } from "../data/products";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import ProductReviews from "../components/ProductReviews";

const LOW_STOCK_THRESHOLD = 3;

export default function ProductPage() {
  const { slug } = useParams();
  const { products, loading, getProductBySlug } = useProducts();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addItem } = useCart();
  const { getStock } = useStock();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    // Un produit ajouté depuis l'admin n'existe pas dans le catalogue local :
    // on attend la réponse de Supabase avant de conclure qu'il n'existe pas.
    if (loading) {
      return (
        <div className="flex justify-center py-32 text-forest-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    return <Navigate to="/boutique" replace />;
  }

  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);

  const availableStock = getStock(product.slug);
  const isOutOfStock = availableStock !== null && availableStock <= 0;
  const isLowStock =
    availableStock !== null && availableStock > 0 && availableStock <= LOW_STOCK_THRESHOLD;

  const priced = hasPrice(product);

  const handleAdd = () => {
    if (isOutOfStock || !priced) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <nav className="mb-8 flex items-center gap-2 text-sm text-forest-500">
        <Link to="/" className="hover:text-forest-800">Accueil</Link>
        <span>/</span>
        <Link to="/boutique" className="hover:text-forest-800">Boutique</Link>
        <span>/</span>
        <span className="text-forest-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-3xl bg-forest-100">
            <ProductImage
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
            {product.category}
          </span>
          <h1 className="mt-2 font-serif text-3xl text-forest-950 sm:text-4xl">
            {product.name}
          </h1>
          {product.brand && (
            <p className="mt-1 text-sm text-forest-500">{product.brand}</p>
          )}
          <p className="mt-2 text-forest-600">{product.tagline}</p>

          {isOutOfStock && (
            <p className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
              Rupture de stock
            </p>
          )}
          {isLowStock && (
            <p className="mt-4 text-sm font-medium text-gold-600">
              Plus que {availableStock} en stock - commandez vite
            </p>
          )}

          <div className="mt-6 rounded-2xl bg-forest-100/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-2xl text-forest-950">
                {priced ? formatPrice(product.price) : "Prix bientôt disponible"}
              </span>
              {priced && product.compareAtPrice && (
                <>
                  <span className="text-forest-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-forest-900 px-2.5 py-1 text-xs font-medium text-cream-50">
                    Économisez {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-forest-600">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Livraison sous 24h - le livreur vous appelle
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-4 w-4" /> Paiement en espèces à la livraison
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-forest-300">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="p-3 text-forest-700 hover:text-forest-900 disabled:opacity-50"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-forest-900">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => (availableStock !== null ? Math.min(availableStock, q + 1) : q + 1))
                }
                disabled={isOutOfStock}
                className="p-3 text-forest-700 hover:text-forest-900 disabled:opacity-50"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={isOutOfStock || !priced}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isOutOfStock ? (
                "Rupture de stock"
              ) : !priced ? (
                "Bientôt disponible"
              ) : added ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Ajouté au panier
                </>
              ) : (
                "Ajouter au panier"
              )}
            </button>
          </div>

          {product.benefits.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 font-serif text-lg text-forest-900">Bienfaits clés</h3>
              <ul className="space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-forest-700">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 space-y-6 border-t border-forest-200 pt-6">
            <p className="leading-relaxed text-forest-700">{product.description}</p>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-forest-900">Utilisation conseillée</h4>
              <p className="text-sm text-forest-600">{product.usage}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-forest-900">Ingrédients</h4>
              <p className="text-sm text-forest-600">{product.ingredients}</p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="mb-8 font-serif text-2xl text-forest-950">
            Complète bien avec
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}

      <ProductReviews productSlug={product.slug} />
    </div>
  );
}
