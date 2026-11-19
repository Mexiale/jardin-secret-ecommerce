import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Banknote,
  Clock,
  Download,
  Loader2,
  Minus,
  Phone,
  PhoneCall,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";
import { formatPrice } from "../lib/format";
import { placeOrder } from "../lib/orders";
import type { Product } from "../data/products";
import ProductImage from "../components/ProductImage";

type DeliveryInfo = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
};

const emptyDeliveryInfo: DeliveryInfo = {
  fullName: "",
  phone: "",
  city: "",
  address: "",
  notes: "",
};

type Step = "cart" | "recap" | "delivery" | "validation" | "confirmed";

type OrderSummary = {
  orderNumber: string;
  date: string;
  items: { product: Product; quantity: number }[];
  subtotal: number;
  delivery: DeliveryInfo;
};

export default function Cart() {
  const { items, removeItem, addItem, clearCart, subtotal } = useCart();
  const { refresh: refreshStock } = useStock();
  const [step, setStep] = useState<Step>("cart");
  const [delivery, setDelivery] = useState<DeliveryInfo>(emptyDeliveryInfo);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handleDeliverySubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep("validation");
  };

  const handleConfirmOrder = async () => {
    if (placing) return; // pas de double commande sur double-clic
    setPlacing(true);
    setOrderError("");

    try {
      // La confirmation n'est affichée qu'une fois la commande réellement enregistrée.
      const placed = await placeOrder({ ...delivery, items });

      // Prix et total affichés = ceux calculés par le serveur.
      const serverPrice = new Map(placed.items.map((i) => [i.slug, i.price]));
      setOrder({
        orderNumber: placed.orderNumber,
        date: new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: items.map(({ product, quantity }) => ({
          product: { ...product, price: serverPrice.get(product.slug) ?? product.price },
          quantity,
        })),
        subtotal: placed.subtotal,
        delivery,
      });
      setStep("confirmed");
      clearCart();
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : String(err));
    } finally {
      setPlacing(false);
      refreshStock();
    }
  };

  const handleDownloadPdf = () => {
    if (!order) return;

    const doc = new jsPDF();
    const marginX = 14;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Jardin Secret", marginX, y);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Confirmation de commande n° ${order.orderNumber}`, marginX, y);
    y += 6;
    doc.text(`Date : ${order.date}`, marginX, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Articles", marginX, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    order.items.forEach(({ product, quantity }) => {
      doc.text(`${product.name} × ${quantity}`, marginX, y);
      doc.text(formatPrice(product.price * quantity), 196, y, { align: "right" });
      y += 7;
    });

    y += 2;
    doc.line(marginX, y, 196, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Total à régler", marginX, y);
    doc.text(formatPrice(order.subtotal), 196, y, { align: "right" });
    y += 14;

    doc.text("Livraison", marginX, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Nom : ${order.delivery.fullName}`, marginX, y);
    y += 6;
    doc.text(`Téléphone : ${order.delivery.phone}`, marginX, y);
    y += 6;
    doc.text(`Ville / Commune : ${order.delivery.city}`, marginX, y);
    y += 6;
    const addressLines = doc.splitTextToSize(`Lieu de livraison : ${order.delivery.address}`, 182);
    doc.text(addressLines, marginX, y);
    y += addressLines.length * 6;
    if (order.delivery.notes) {
      const noteLines = doc.splitTextToSize(`Note : ${order.delivery.notes}`, 182);
      doc.text(noteLines, marginX, y);
      y += noteLines.length * 6;
    }
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Paiement & livraison", marginX, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text("Paiement en espèces ou par Wave à la livraison.", marginX, y);
    y += 6;
    doc.text("Livraison sous 24h - le livreur vous appellera avant de passer.", marginX, y);

    doc.save(`commande-jardin-secret-${order.orderNumber}.pdf`);
  };

  if (step === "confirmed") {
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <h1 className="font-serif text-3xl text-forest-950">
          Merci pour votre commande 🌿
        </h1>
        {order && (
          <p className="mt-2 text-sm text-forest-500">
            Commande n° <span className="font-medium text-forest-800">{order.orderNumber}</span>
          </p>
        )}
        <p className="mt-4 text-forest-600">
          Votre commande est confirmée. Notre livreur vous appellera au{" "}
          <span className="font-medium text-forest-900">{delivery.phone}</span>{" "}
          avant de passer.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-forest-100/70 p-6 text-left">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <div>
              <p className="font-medium text-forest-900">Livraison sous 24h</p>
              <p className="mt-1 text-sm text-forest-600">
                {delivery.address}, {delivery.city}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <div>
              <p className="font-medium text-forest-900">Le livreur vous appellera</p>
              <p className="mt-1 text-sm text-forest-600">
                Restez joignable au numéro communiqué pour organiser la remise de votre colis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <div>
              <p className="font-medium text-forest-900">Paiement à la livraison</p>
              <p className="mt-1 text-sm text-forest-600">
                Réglez en espèces directement au livreur ou faites un dépôt Wave à ce numéro : +225 01 71 93 10 98
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleDownloadPdf}
            disabled={!order}
            className="inline-flex items-center gap-2 rounded-full border border-forest-300 px-7 py-3.5 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-100 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Télécharger ma commande en PDF
          </button>
          <Link
            to="/boutique"
            className="inline-flex rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-28 text-center">
        <ShoppingBag className="h-10 w-10 text-forest-300" strokeWidth={1.5} />
        <h1 className="mt-6 font-serif text-2xl text-forest-950">
          Votre panier est vide
        </h1>
        <p className="mt-3 text-forest-600">
          Parcourez notre sélection pour votre équilibre hormonal.
        </p>
        <Link
          to="/boutique"
          className="mt-8 inline-flex rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  if (step === "validation") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <button
          onClick={() => setStep("delivery")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-forest-600 hover:text-forest-900"
        >
          <ArrowLeft className="h-4 w-4" /> Modifier mes informations
        </button>

        <h1 className="mb-2 font-serif text-3xl text-forest-950">
          Validez votre commande
        </h1>
        <p className="mb-8 text-sm text-forest-600">
          Vérifiez les détails ci-dessous avant de confirmer définitivement.
        </p>

        <div className="space-y-5">
          <div className="rounded-2xl border border-forest-200/70 bg-cream-50 p-6">
            <h2 className="mb-4 font-serif text-lg text-forest-900">
              Résumé de la commande
            </h2>
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.slug} className="flex items-center justify-between text-sm">
                  <span className="text-forest-700">
                    {product.name} <span className="text-forest-400">× {quantity}</span>
                  </span>
                  <span className="font-medium text-forest-900">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-forest-200 pt-4 text-sm text-forest-600">
              <span>Livraison</span>
              <span>Communiquée par notre équipe</span>
            </div>
            <div className="mt-2 flex justify-between font-medium text-forest-900">
              <span>Total à régler</span>
              <span className="font-serif text-lg">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-forest-200/70 bg-cream-50 p-6">
            <h2 className="mb-4 font-serif text-lg text-forest-900">
              Informations de livraison
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-forest-500">Nom</dt>
                <dd className="font-medium text-forest-900">{delivery.fullName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-forest-500">Téléphone</dt>
                <dd className="font-medium text-forest-900">{delivery.phone}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-forest-500">Ville / Commune</dt>
                <dd className="font-medium text-forest-900">{delivery.city}</dd>
              </div>
              <div>
                <dt className="mb-1 text-forest-500">Lieu de livraison précis</dt>
                <dd className="rounded-xl bg-forest-100/70 p-3 text-forest-900">
                  {delivery.address}
                </dd>
              </div>
              {delivery.notes && (
                <div>
                  <dt className="mb-1 text-forest-500">Note additionnelle</dt>
                  <dd className="rounded-xl bg-forest-100/70 p-3 text-forest-900">
                    {delivery.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-forest-100/70 p-5">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <p className="text-sm text-forest-700">
              <span className="font-medium text-forest-900">Paiement en espèces à la livraison ou par Wave</span>{" "}
              - aucun paiement en ligne requis.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-forest-100/70 p-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <p className="text-sm text-forest-700">
              <span className="font-medium text-forest-900">Livraison sous 24h.</span>{" "}
              Notre livreur vous appellera au {delivery.phone || "numéro renseigné"} avant de
              passer.
            </p>
          </div>

          {orderError && (
            <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {orderError}
            </p>
          )}

          <button
            onClick={handleConfirmOrder}
            disabled={placing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800 disabled:cursor-wait disabled:opacity-70"
          >
            {placing && <Loader2 className="h-4 w-4 animate-spin" />}
            {placing ? "Enregistrement de votre commande..." : "Confirmer ma commande"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "delivery") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 lg:px-10">
        <button
          onClick={() => setStep("recap")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-forest-600 hover:text-forest-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au récapitulatif
        </button>

        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-forest-100/70 p-5">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
          <p className="text-sm text-forest-700">
            <span className="font-medium text-forest-900">Livraison sous 24h</span> à Abidjan et
            environs. Notre livreur vous appellera avant de passer. Paiement en espèces/Wave à la
            réception de votre colis.
          </p>
        </div>

        <h1 className="mb-6 font-serif text-2xl text-forest-950">
          Informations de livraison
        </h1>

        <form onSubmit={handleDeliverySubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Nom complet
            </label>
            <input
              required
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              value={delivery.fullName}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, fullName: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Numéro à appeler pour la livraison
            </label>
            <input
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              pattern="\+?[0-9 \(\)\.\-]{8,20}"
              title="Numéro de téléphone (chiffres, espaces et + uniquement)"
              maxLength={20}
              placeholder="+225 07 00 00 00 00"
              value={delivery.phone}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, phone: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-forest-500">
              Le livreur vous appellera à ce numéro avant de passer.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Ville / Commune
            </label>
            <input
              required
              type="text"
              placeholder="Ex. Abidjan - Deux-Plateaux"
              minLength={2}
              maxLength={80}
              value={delivery.city}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, city: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Lieu de livraison précis
            </label>
            <textarea
              required
              minLength={10}
              maxLength={300}
              rows={3}
              placeholder="Quartier, rue, numéro de porte, points de repère (immeuble, commerce proche...)"
              value={delivery.address}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, address: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-forest-500">
              Merci d'être aussi précis(e) que possible : cela facilite le travail du livreur et
              évite tout retard.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Note additionnelle (facultatif)
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={delivery.notes}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, notes: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            Vérifier et valider ma commande
          </button>
          <p className="text-center text-xs text-forest-500">
            Paiement en espèces/Wave à la livraison - aucun paiement en ligne requis
          </p>
        </form>
      </div>
    );
  }

  if (step === "recap") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <button
          onClick={() => setStep("cart")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-forest-600 hover:text-forest-900"
        >
          <ArrowLeft className="h-4 w-4" /> Modifier mon panier
        </button>

        <h1 className="mb-8 font-serif text-3xl text-forest-950">
          Récapitulatif de votre commande
        </h1>

        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.slug}
              className="flex items-center gap-4 rounded-2xl border border-forest-200/70 bg-cream-50 p-4"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                compact
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="font-serif text-base text-forest-900">
                    {product.name}
                  </p>
                  <p className="text-sm text-forest-500">Quantité : {quantity}</p>
                </div>
                <p className="font-medium text-forest-900">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-forest-100/70 p-6">
          <h2 className="mb-1 font-serif text-lg text-forest-900">Résumé de paiement</h2>
          <div className="mt-3 flex justify-between text-sm text-forest-600">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-forest-600">
            <span>Livraison</span>
            <span>Communiquée par notre équipe</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-forest-200 pt-4 font-medium text-forest-900">
            <span>Total à régler</span>
            <span className="font-serif text-lg">{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-cream-50 p-4">
            <Banknote className="h-5 w-5 shrink-0 text-forest-600" />
            <p className="text-sm text-forest-700">
              Mode de paiement : <span className="font-medium">Espèces/Wave à la livraison</span>
            </p>
          </div>

          <button
            onClick={() => setStep("delivery")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            <Phone className="h-4 w-4" />
            Renseigner mes informations de livraison
          </button>
          <p className="mt-3 text-center text-xs text-forest-500">
            Livraison sous 24h à Abidjan et environs - le livreur vous appellera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <h1 className="mb-10 font-serif text-3xl text-forest-950">Votre panier</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div
              key={product.slug}
              className="flex gap-4 rounded-2xl border border-forest-200/70 bg-cream-50 p-4"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                compact
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg text-forest-900">{product.name}</p>
                    <p className="text-sm text-forest-500">{product.category}</p>
                  </div>
                  <button
                    onClick={() => removeItem(product.slug)}
                    className="text-forest-400 hover:text-red-500"
                    aria-label="Retirer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-forest-300">
                    <button
                      onClick={() => addItem(product, -1)}
                      className="p-2 text-forest-700 hover:text-forest-900"
                      aria-label="Diminuer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => addItem(product, 1)}
                      className="p-2 text-forest-700 hover:text-forest-900"
                      aria-label="Augmenter"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-medium text-forest-900">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-forest-100/70 p-6">
          <h2 className="font-serif text-lg text-forest-900">Résumé de paiement</h2>
          <div className="mt-4 flex justify-between text-sm text-forest-600">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-forest-600">
            <span>Livraison</span>
            <span>Calculée à la commande</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-forest-200 pt-4 font-medium text-forest-900">
            <span>Total</span>
            <span className="font-serif text-lg">{formatPrice(subtotal)}</span>
          </div>
          <button
            onClick={() => setStep("recap")}
            className="mt-6 w-full rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            Passer la commande
          </button>
          <p className="mt-3 text-center text-xs text-forest-500">
            Paiement en espèces à la livraison - livraison sous 24h
          </p>
        </div>
      </div>
    </div>
  );
}
