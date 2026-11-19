import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products as fallbackProducts, type Product } from "../data/products";
import { fetchActiveProducts } from "../lib/products";

type ProductsContextValue = {
  /** Produits visibles en boutique. */
  products: Product[];
  /** true tant que le catalogue Supabase n'a pas répondu. */
  loading: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  refresh: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

const localCatalog = fallbackProducts.filter((p) => p.active);

export function ProductsProvider({ children }: { children: ReactNode }) {
  // On affiche tout de suite le catalogue local, remplacé par celui de Supabase
  // dès qu'il arrive. Si Supabase ne répond pas, le catalogue local reste affiché.
  const [products, setProducts] = useState<Product[]>(localCatalog);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setProducts(await fetchActiveProducts());
    } catch (err) {
      console.warn("Catalogue Supabase indisponible, catalogue local affiché.", err);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);

  return (
    <ProductsContext.Provider value={{ products, loading, getProductBySlug, refresh }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
