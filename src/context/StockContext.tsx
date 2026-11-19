import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchAllStock } from "../lib/stock";

type StockContextValue = {
  loading: boolean;
  /** null = pas de suivi pour ce produit -> considéré disponible */
  getStock: (slug: string) => number | null;
  refresh: () => Promise<void>;
};

const StockContext = createContext<StockContextValue | null>(null);

export function StockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await fetchAllStock();
      setStock(data);
    } catch {
      // on garde les valeurs précédentes si le rafraîchissement échoue
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const getStock = (slug: string) => (slug in stock ? stock[slug] : null);

  return (
    <StockContext.Provider value={{ loading, getStock, refresh }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used within StockProvider");
  return ctx;
}
