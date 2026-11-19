import { useEffect, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSupabaseSession";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminHeader from "../../components/admin/AdminHeader";
import type { Review } from "../../lib/reviews";

type OrderLookup = {
  order_number: string;
  full_name: string;
  phone: string;
  items: { slug: string; name: string; quantity: number }[];
} | null;

export default function AvisAdmin() {
  const { session, loading: sessionLoading } = useSupabaseSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [orderLookups, setOrderLookups] = useState<Record<string, OrderLookup>>({});

  useEffect(() => {
    if (session) loadPendingReviews();
  }, [session]);

  const loadPendingReviews = async () => {
    setLoadingReviews(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data);
    setLoadingReviews(false);
  };

  const lookupOrder = async (orderNumber: string) => {
    const { data } = await supabase
      .from("orders")
      .select("order_number, full_name, phone, items")
      .eq("order_number", orderNumber)
      .maybeSingle();
    setOrderLookups((prev) => ({ ...prev, [orderNumber]: data ?? null }));
  };

  const updateReview = async (id: string, patch: { status: string; verified?: boolean }) => {
    await supabase.from("reviews").update(patch).eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (sessionLoading) return null;
  if (!session) return <AdminLogin />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <AdminHeader />

      <h1 className="mb-8 font-serif text-2xl text-forest-950">Avis en attente de modération</h1>

      {loadingReviews && <p className="text-sm text-forest-500">Chargement...</p>}
      {!loadingReviews && reviews.length === 0 && (
        <p className="text-sm text-forest-500">Aucun avis en attente.</p>
      )}

      <div className="space-y-6">
        {reviews.map((review) => {
          const lookup = orderLookups[review.order_number];
          return (
            <div key={review.id} className="rounded-2xl border border-forest-200/70 bg-cream-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-gold-500 text-gold-500" : "text-forest-200"
                      }`}
                    />
                  ))}
                  <span className="font-medium text-forest-900">{review.author_name}</span>
                </div>
                <span className="text-xs text-forest-400">
                  {new Date(review.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-forest-400">
                {review.product_slug}
              </p>
              <p className="mt-3 text-sm text-forest-700">{review.comment}</p>

              <div className="mt-4 rounded-xl bg-forest-100/70 p-4 text-sm">
                <p className="text-forest-600">
                  Numéro de commande indiqué :{" "}
                  <span className="font-medium text-forest-900">{review.order_number}</span>
                </p>
                {lookup === undefined && (
                  <button
                    onClick={() => lookupOrder(review.order_number)}
                    className="mt-2 text-xs font-medium text-forest-700 underline hover:text-forest-900"
                  >
                    Vérifier cette commande
                  </button>
                )}
                {lookup === null && (
                  <p className="mt-2 text-xs text-red-600">
                    Aucune commande trouvée avec ce numéro.
                  </p>
                )}
                {lookup && (
                  <div className="mt-2 text-xs text-forest-700">
                    <p>
                      Client : {lookup.full_name} - {lookup.phone}
                    </p>
                    <p>
                      Articles :{" "}
                      {lookup.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => updateReview(review.id, { status: "approved", verified: true })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-xs font-medium text-cream-50 hover:bg-forest-800"
                >
                  <BadgeCheck className="h-3.5 w-3.5" /> Approuver + Vérifié
                </button>
                <button
                  onClick={() => updateReview(review.id, { status: "approved", verified: false })}
                  className="rounded-full px-4 py-2 text-xs font-medium text-forest-800 ring-1 ring-forest-300 hover:bg-forest-100"
                >
                  Approuver (non vérifié)
                </button>
                <button
                  onClick={() => updateReview(review.id, { status: "rejected" })}
                  className="rounded-full px-4 py-2 text-xs font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                >
                  Rejeter
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
