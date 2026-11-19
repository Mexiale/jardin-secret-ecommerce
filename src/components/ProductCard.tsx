import { Link } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import { Plus, Check } from "lucide-react";
import { hasPrice, type Product } from "../data/products";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";

const LOW_STOCK_THRESHOLD = 3;

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { getStock } = useStock();
  const [added, setAdded] = useState(false);

  const quantity = getStock(product.slug);
  const isOutOfStock = quantity !== null && quantity <= 0;
  const isLowStock = quantity !== null && quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
  const priced = hasPrice(product);

  const handleQuickAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !priced) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      to={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest-200/70 bg-cream-50 transition-shadow hover:shadow-lg hover:shadow-forest-900/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-forest-100">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-medium tracking-wide text-cream-50">
            Rupture de stock
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-cream-50/95 px-3 py-1 text-[11px] font-medium tracking-wide text-forest-800">
          {product.category}
        </span>
        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock || !priced}
          aria-label={`Ajouter ${product.name} au panier`}
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
            added ? "bg-gold-500 text-forest-950" : "bg-forest-900 text-cream-50 hover:bg-forest-800"
          }`}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-lg text-forest-900">{product.name}</h3>
        <p className="text-sm text-forest-600">{product.tagline}</p>

        {isLowStock && (
          <p className="text-xs font-medium text-gold-600">Plus que {quantity} en stock</p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-medium text-forest-900">
            {priced ? formatPrice(product.price) : "Prix bientôt disponible"}
          </span>
          {priced && product.compareAtPrice && (
            <span className="text-sm text-forest-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
