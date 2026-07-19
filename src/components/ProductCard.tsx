import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "../data/products";
import { formatPrice } from "../lib/format";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest-200/70 bg-cream-50 transition-shadow hover:shadow-lg hover:shadow-forest-900/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-forest-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.bestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-forest-900/90 px-3 py-1 text-[11px] font-medium tracking-wide text-cream-50">
            Best-seller
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-cream-50/95 px-3 py-1 text-[11px] font-medium tracking-wide text-forest-800">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-lg text-forest-900">{product.name}</h3>
        <p className="text-sm text-forest-600">{product.tagline}</p>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-forest-500">
          <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
          <span className="font-medium text-forest-700">{product.rating}</span>
          <span>({product.reviews} avis)</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-medium text-forest-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-forest-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
