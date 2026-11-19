import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;

    try {
      const response = await fetch("/contact.php", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await response.json();

      if (data.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
        setError(data.error || "Une erreur est survenue. Merci de réessayer.");
      }
    } catch {
      setStatus("error");
      setError("Impossible d'envoyer le message. Vérifiez votre connexion et réessayez.");
    }
  };

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
          {status === "sent" ? (
            <div className="rounded-2xl bg-forest-100 p-8 text-forest-800">
              <p className="font-serif text-xl">Merci pour votre message 🌿</p>
              <p className="mt-2 text-sm text-forest-600">
                Notre équipe vous répondra sous 24 à 48h.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-800">
                    Nom
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
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
                    name="email"
                    className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-800">
                  Sujet
                </label>
                <select
                  name="subject"
                  className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                >
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
                  name="message"
                  className="w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-3 text-sm focus:border-forest-500 focus:outline-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-800 disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    Envoi en cours <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Envoyer le message <Send className="h-4 w-4" />
                  </>
                )}
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
            <p className="mt-1 text-sm text-forest-600">jardin-secret@mexiale.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
