import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Star, Truck, ShieldCheck, Leaf, Minus, Plus, CheckCircle2 } from "lucide-react";
import { getProductBySlug } from "../data/products";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return <Navigate to="/boutique" replace />;

  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);

  const handleAdd = () => {
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
        <div className="flex flex-col-reverse gap-4 sm:flex-row lg:sticky lg:top-24">
          <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col">
            {product.gallery.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-colors ${
                  activeImage === i ? "ring-forest-600" : "ring-transparent hover:ring-forest-200"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-3xl bg-forest-100">
            {product.bestseller && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-forest-950">
                Best-seller
              </span>
            )}
            <img
              src={product.gallery[activeImage]}
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
          <p className="mt-2 text-forest-600">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating) ? "fill-gold-500 text-gold-500" : "text-forest-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium text-forest-800">{product.rating}</span>
            <span className="text-forest-500">({product.reviews} avis)</span>
          </div>

          <div className="mt-6 rounded-2xl bg-forest-100/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-2xl text-forest-950">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
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
                <Truck className="h-4 w-4" /> Livraison à Abidjan sous 24-48h
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Paiement sécurisé Mobile Money / CinetPay
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-forest-300">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-forest-700 hover:text-forest-900"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-forest-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 text-forest-700 hover:text-forest-900"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-800"
            >
              {added ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Ajouté au panier
                </>
              ) : (
                "Ajouter au panier"
              )}
            </button>
          </div>

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
    </div>
  );
}
