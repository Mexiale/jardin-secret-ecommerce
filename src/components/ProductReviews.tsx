import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Loader2, Star } from "lucide-react";
import { fetchApprovedReviews, submitReview, type Review } from "../lib/reviews";

function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-gold-500 text-gold-500" : "text-forest-200"}`}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} étoile${starValue > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                starValue <= value ? "fill-gold-500 text-gold-500" : "text-forest-200 hover:text-gold-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchApprovedReviews(productSlug)
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitStatus("error");
      setSubmitError("Merci de sélectionner une note.");
      return;
    }

    setSubmitStatus("sending");
    setSubmitError("");

    try {
      await submitReview({ productSlug, authorName, rating, comment, orderNumber });
      setSubmitStatus("sent");
      setAuthorName("");
      setRating(0);
      setComment("");
      setOrderNumber("");
    } catch (err) {
      console.error("Échec de l'envoi de l'avis :", err);
      setSubmitStatus("error");
      setSubmitError("Une erreur est survenue. Merci de réessayer.");
    }
  };

  return (
    <div className="mt-24 border-t border-forest-200 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-forest-950">Avis clients</h2>
        {submitStatus !== "sent" && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-forest-800 ring-1 ring-forest-300 hover:bg-forest-100"
          >
            {showForm ? "Annuler" : "Laisser un avis"}
          </button>
        )}
      </div>

      {showForm && submitStatus !== "sent" && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-forest-100/70 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">Votre note</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">Votre nom</label>
            <input
              required
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">Votre avis</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Numéro de commande
            </label>
            <input
              required
              type="text"
              placeholder="Ex. JS-742511"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-forest-500">
              Indiqué sur votre confirmation de commande ou votre PDF de commande. Il permet à
              notre équipe de vérifier votre achat.
            </p>
          </div>

          {submitStatus === "error" && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitStatus === "sending"}
            className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-medium text-cream-50 hover:bg-forest-800 disabled:opacity-60"
          >
            {submitStatus === "sending" ? (
              <>
                Envoi en cours <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Envoyer mon avis"
            )}
          </button>
        </form>
      )}

      {submitStatus === "sent" && (
        <div className="mt-6 rounded-2xl bg-forest-100 p-6 text-forest-800">
          <p className="font-serif text-lg">Merci pour votre avis 🌿</p>
          <p className="mt-2 text-sm text-forest-600">
            Il sera visible dès qu'il aura été vérifié par notre équipe.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {loading && <p className="text-sm text-forest-500">Chargement des avis...</p>}

        {!loading && reviews.length === 0 && (
          <p className="text-sm text-forest-500">
            Aucun avis pour ce produit pour le moment. Soyez la première à en laisser un.
          </p>
        )}

        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-forest-200/70 bg-cream-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <StarRow rating={review.rating} />
                <span className="font-medium text-forest-900">{review.author_name}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2.5 py-1 text-xs font-medium text-forest-700">
                    <BadgeCheck className="h-3.5 w-3.5 text-forest-600" /> Achat vérifié
                  </span>
                )}
              </div>
              <span className="text-xs text-forest-400">
                {new Date(review.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-forest-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
