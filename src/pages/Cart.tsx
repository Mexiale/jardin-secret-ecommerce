import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

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

type Step = "cart" | "recap" | "delivery" | "confirmed";

export default function Cart() {
  const { items, removeItem, addItem, clearCart, subtotal } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [delivery, setDelivery] = useState<DeliveryInfo>(emptyDeliveryInfo);

  const handleDeliverySubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep("confirmed");
    clearCart();
  };

  if (step === "confirmed") {
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <h1 className="font-serif text-3xl text-forest-950">
          Merci pour votre commande 🌿
        </h1>
        <p className="mt-4 text-forest-600">
          Notre équipe vous appellera au{" "}
          <span className="font-medium text-forest-900">{delivery.phone}</span>{" "}
          pour confirmer votre commande.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-forest-100/70 p-6 text-left">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <div>
              <p className="font-medium text-forest-900">Livraison sous 48h</p>
              <p className="mt-1 text-sm text-forest-600">
                {delivery.address}, {delivery.city}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
            <div>
              <p className="font-medium text-forest-900">Paiement à la livraison</p>
              <p className="mt-1 text-sm text-forest-600">
                Réglez en espèces directement au livreur.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/boutique"
          className="mt-8 inline-flex rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
        >
          Continuer mes achats
        </Link>
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
          Parcourez nos formules pensées pour votre équilibre hormonal.
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
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
          <p className="text-sm text-forest-700">
            <span className="font-medium text-forest-900">Livraison sous 48h</span>{" "}
            à Abidjan et environs. Paiement en espèces à la réception de votre
            colis.
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
              placeholder="+225 07 00 00 00 00"
              value={delivery.phone}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, phone: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Ville / Commune
            </label>
            <input
              required
              type="text"
              placeholder="Ex. Abidjan - Deux-Plateaux"
              value={delivery.city}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, city: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Adresse de livraison
            </label>
            <textarea
              required
              rows={3}
              placeholder="Quartier, rue, points de repère..."
              value={delivery.address}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, address: e.target.value }))
              }
              className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-800">
              Note additionnelle (facultatif)
            </label>
            <textarea
              rows={2}
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
            Confirmer ma commande
          </button>
          <p className="text-center text-xs text-forest-500">
            Paiement en espèces à la livraison — aucun paiement en ligne requis
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
              <img
                src={product.image}
                alt={product.name}
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
          <div className="flex justify-between text-sm text-forest-600">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-forest-600">
            <span>Livraison</span>
            <span>Communiquée par notre équipe</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-forest-200 pt-4 font-medium text-forest-900">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-cream-50 p-4">
            <Banknote className="h-5 w-5 shrink-0 text-forest-600" />
            <p className="text-sm text-forest-700">
              Mode de paiement : <span className="font-medium">Paiement à la livraison</span>
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
            Livraison sous 48h à Abidjan et environs
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
              <img
                src={product.image}
                alt={product.name}
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
          <h2 className="font-serif text-lg text-forest-900">Récapitulatif</h2>
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
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            onClick={() => setStep("recap")}
            className="mt-6 w-full rounded-full bg-forest-900 px-6 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            Passer la commande
          </button>
          <p className="mt-3 text-center text-xs text-forest-500">
            Paiement à la livraison
          </p>
        </div>
      </div>
    </div>
  );
}
