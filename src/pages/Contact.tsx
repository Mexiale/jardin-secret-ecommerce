import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="mb-14 max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
          Support
        </span>
        <h1 className="mt-3 font-serif text-4xl text-forest-950">
          Parlons de votre équilibre
        </h1>
        <p className="mt-4 text-forest-600">
          Une question sur un produit, une commande ou simplement besoin
          d'échanger ? Notre équipe vous répond avec attention.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {sent ? (
            <div className="rounded-2xl bg-forest-100 p-8 text-forest-800">
              <p className="font-serif text-xl">Merci pour votre message 🌿</p>
              <p className="mt-2 text-sm text-forest-600">
                Notre équipe vous répondra sous 24 à 48h.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-800">
                    Nom
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-800">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-800">
                  Sujet
                </label>
                <select className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none">
                  <option>Question sur un produit</option>
                  <option>Suivi de commande</option>
                  <option>Partenariat / ONG</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-800">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
              >
                Envoyer le message <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-forest-100/70 p-6">
            <MapPin className="h-5 w-5 text-forest-600" />
            <p className="mt-3 font-medium text-forest-900">Adresse</p>
            <p className="mt-1 text-sm text-forest-600">
              Deux-Plateaux, Abidjan, Côte d'Ivoire
            </p>
          </div>
          <div className="rounded-2xl bg-forest-100/70 p-6">
            <Phone className="h-5 w-5 text-forest-600" />
            <p className="mt-3 font-medium text-forest-900">Téléphone / WhatsApp</p>
            <p className="mt-1 text-sm text-forest-600">+225 07 00 00 00 00</p>
          </div>
          <div className="rounded-2xl bg-forest-100/70 p-6">
            <Mail className="h-5 w-5 text-forest-600" />
            <p className="mt-3 font-medium text-forest-900">Email</p>
            <p className="mt-1 text-sm text-forest-600">contact@jardinsecret.ci</p>
          </div>
        </div>
      </div>
    </div>
  );
}
