import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products, type Product } from "../data/products";

const categories: Array<Product["category"] | "Tous"> = [
  "Tous",
  "SOPK",
  "Fertilité",
  "Équilibre hormonal",
  "Bien-être global",
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("categorie") as Product["category"] | null;
  const [active, setActive] = useState<Product["category"] | "Tous">(
    initial && categories.includes(initial) ? initial : "Tous"
  );

  const filtered = useMemo(
    () => (active === "Tous" ? products : products.filter((p) => p.category === active)),
    [active]
  );

  const selectCategory = (cat: Product["category"] | "Tous") => {
    setActive(cat);
    if (cat === "Tous") {
      searchParams.delete("categorie");
    } else {
      searchParams.set("categorie", cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
          Boutique
        </span>
        <h1 className="mt-3 font-serif text-4xl text-forest-950">
          Des formules pensées pour votre équilibre
        </h1>
        <p className="mt-4 text-forest-600">
          Chaque produit Jardin Secret est formulé avec des professionnels de
          santé, dosé selon les recommandations scientifiques et fabriqué
          sous contrôle qualité strict.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-forest-900 text-cream-50"
                : "bg-cream-50 text-forest-700 ring-1 ring-forest-200 hover:bg-forest-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-forest-500">
          Aucun produit dans cette catégorie pour le moment.
        </p>
      )}
    </div>
  );
}
