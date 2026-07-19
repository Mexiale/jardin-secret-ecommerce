import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Leaf, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { formatPrice } from "../lib/format";

const featured = products.filter((p) => p.bestseller).concat(
  products.filter((p) => !p.bestseller).slice(0, 1)
);

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-100 via-cream-100 to-gold-300/30">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-forest-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-gold-300/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/80 px-4 py-1.5 text-xs font-medium tracking-wide text-forest-700 ring-1 ring-forest-300/60">
              <Leaf className="h-3.5 w-3.5" /> Conçu &amp; formulé en Côte d'Ivoire
            </span>

            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-forest-950 sm:text-6xl">
              Cultivez votre{" "}
              <span className="italic text-forest-600">équilibre</span>{" "}
              intérieur.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-forest-700">
              Jardin Secret conçoit des compléments alimentaires naturels
              pour accompagner la fertilité, apaiser le SOPK et restaurer
              l'équilibre hormonal — avec la rigueur de la science et la
              douceur du soin de soi.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/boutique"
                className="group inline-flex items-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-800"
              >
                Découvrir nos produits
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/sopk"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-forest-800 ring-1 ring-forest-300 transition-colors hover:bg-forest-100"
              >
                Comprendre le SOPK
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-forest-600">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-forest-500" /> Testé en laboratoire
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-forest-500" /> Ingrédients naturels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-forest-500" /> Accompagnement humain
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="overflow-hidden rounded-[28px] border border-forest-200 bg-cream-50 shadow-2xl shadow-forest-900/10">
              <div className="flex items-center gap-1.5 border-b border-forest-100 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-forest-300" />
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1200&auto=format&fit=crop"
                  alt="Myo-Inositol Équilibre, complément SOPK"
                  className="h-72 w-full object-cover"
                />
                <span className="absolute right-4 top-4 rounded-full bg-cream-50 px-3 py-1 text-xs font-semibold tracking-wide text-forest-800">
                  BEST-SELLER
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <p className="font-serif text-lg text-forest-900">Myo-Inositol Équilibre</p>
                  <p className="text-sm text-forest-500">Ratio 40:1 · 60 sachets</p>
                </div>
                <p className="font-serif text-xl text-forest-900">{formatPrice(28000)}</p>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center justify-center gap-2 rounded-full bg-forest-900 py-3 text-sm font-medium text-cream-50">
                  Ajouter au panier
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute -left-8 bottom-16 hidden items-center gap-3 rounded-2xl bg-cream-50/95 px-4 py-3 shadow-xl shadow-forest-900/10 ring-1 ring-forest-100 backdrop-blur sm:flex"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-forest-900">Commande confirmée</p>
                <p className="text-xs text-forest-500">À l'instant, Abidjan</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
              Nos univers
            </span>
            <h2 className="mt-3 font-serif text-3xl text-forest-950 sm:text-4xl">
              Un accompagnement pour chaque étape
            </h2>
          </div>
          <Link
            to="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-forest-900"
          >
            Voir toute la boutique <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "SOPK",
              desc: "Retrouver un cycle régulier et apaiser les symptômes au quotidien.",
              img: "https://images.unsplash.com/photo-1637715179830-a0de86dc0c4e?q=80&w=800&auto=format&fit=crop",
              to: "/boutique?categorie=SOPK",
            },
            {
              title: "Fertilité",
              desc: "Préparer le corps et l'esprit à un projet de conception, en couple.",
              img: "https://images.unsplash.com/photo-1513267000941-598abe7be16f?q=80&w=800&auto=format&fit=crop",
              to: "/boutique?categorie=Fertilité",
            },
            {
              title: "Équilibre hormonal",
              desc: "Soutenir le corps face au stress et retrouver une énergie stable.",
              img: "https://images.unsplash.com/photo-1763713383838-5cd702c13160?q=80&w=800&auto=format&fit=crop",
              to: "/boutique?categorie=Équilibre hormonal",
            },
          ].map((cat) => (
            <Link
              key={cat.title}
              to={cat.to}
              className="group relative overflow-hidden rounded-2xl"
            >
              <img
                src={cat.img}
                alt={cat.title}
                className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent" />
              <div className="absolute bottom-0 p-6 text-cream-50">
                <h3 className="font-serif text-2xl">{cat.title}</h3>
                <p className="mt-1 max-w-[85%] text-sm text-cream-100/90">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-forest-100/60 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
              Les préférés
            </span>
            <h2 className="mt-3 font-serif text-3xl text-forest-950 sm:text-4xl">
              Nos formules les plus choisies
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust / mission */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1770988042769-8457db10f3c6?q=80&w=1000&auto=format&fit=crop"
              alt="Ingrédients naturels Jardin Secret"
              className="aspect-[4/5] w-full rounded-3xl object-cover"
            />
            <div className="absolute -bottom-6 -right-6 hidden max-w-[220px] rounded-2xl bg-cream-50 p-5 shadow-xl ring-1 ring-forest-100 sm:block">
              <Sparkles className="h-5 w-5 text-gold-500" />
              <p className="mt-2 font-serif text-2xl text-forest-900">+1200</p>
              <p className="text-sm text-forest-600">femmes accompagnées en Côte d'Ivoire</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
              Notre engagement
            </span>
            <h2 className="mt-3 font-serif text-3xl text-forest-950 sm:text-4xl">
              Plus qu'un complément, un soutien.
            </h2>
            <p className="mt-5 leading-relaxed text-forest-700">
              Chez Jardin Secret, chaque formule est pensée avec des
              professionnels de santé et testée en laboratoire indépendant.
              Mais nous savons que vivre avec le SOPK ou un parcours de
              fertilité, ce n'est pas qu'une question de dosage — c'est aussi
              une charge émotionnelle. C'est pourquoi chaque commande
              s'accompagne d'un espace d'écoute et d'une communauté qui
              comprend.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Formules dosées selon les recommandations scientifiques",
                "Fabrication traçable, contrôlée en laboratoire indépendant",
                "Accompagnement émotionnel via notre communauté privée",
                "Livraison partout en Côte d'Ivoire, paiement Mobile Money",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-forest-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-forest-950 py-20 text-cream-50">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Sparkles className="mx-auto h-6 w-6 text-gold-400" />
          <p className="mt-6 font-serif text-2xl italic leading-relaxed sm:text-3xl">
            « Après des mois de cycles irréguliers, le Myo-Inositol Équilibre
            et le suivi de la communauté Jardin Secret m'ont redonné confiance
            en mon corps. »
          </p>
          <p className="mt-6 text-sm text-forest-300">
            Aïcha K. — Abidjan, membre depuis 2024
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <h2 className="font-serif text-3xl text-forest-950 sm:text-4xl">
          Rejoignez le jardin
        </h2>
        <p className="mx-auto mt-4 max-w-md text-forest-600">
          Conseils de naturopathie, nouveautés et offres réservées à notre
          communauté — directement dans votre boîte mail.
        </p>
        <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Votre adresse e-mail"
            className="w-full rounded-full border border-forest-300 bg-cream-50 px-5 py-3 text-sm text-forest-900 placeholder:text-forest-400 focus:border-forest-500 focus:outline-none"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-full bg-forest-900 px-6 py-3 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            S'inscrire
          </button>
        </form>
      </section>
    </div>
  );
}
