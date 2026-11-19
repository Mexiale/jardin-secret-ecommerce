import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";

const symptoms = [
  "Cycles irréguliers ou absents",
  "Difficultés à concevoir",
  "Acné, pilosité excessive (hirsutisme)",
  "Prise de poids et résistance à l'insuline",
  "Fatigue et fluctuations de l'humeur",
];

export default function Sopk() {
  const { products } = useProducts();
  const sopkProducts = products.filter((p) => p.category === "SOPK" || p.category === "Fertilité");

  return (
    <div>
      <section className="bg-forest-100/60 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
            S'informer
          </span>
          <h1 className="mt-4 font-serif text-4xl text-forest-950 sm:text-5xl">
            Comprendre le SOPK
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-forest-700">
            Le Syndrome des Ovaires Polykystiques touche environ 1 femme sur
            10 en âge de procréer. Souvent mal diagnostiqué, il reste
            entouré de silence - alors qu'il se gère très bien, au quotidien.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-forest-950">
              Les signes qui doivent alerter
            </h2>
            <ul className="mt-6 space-y-4">
              {symptoms.map((s) => (
                <li key={s} className="flex items-start gap-3 text-forest-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-500" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-forest-500">
              Ce contenu est informatif et ne remplace pas un avis médical.
              Consultez un professionnel de santé pour tout diagnostic.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-forest-950">
              Comment Jardin Secret accompagne
            </h2>
            <p className="mt-6 leading-relaxed text-forest-700">
              Le myo-inositol, associé au D-chiro-inositol dans le bon ratio,
              est aujourd'hui l'un des compléments les mieux documentés pour
              soutenir la sensibilité à l'insuline et la régularité du cycle
              chez les femmes atteintes de SOPK.
            </p>
            <p className="mt-4 leading-relaxed text-forest-700">
              Nous associons cette base scientifique à un accompagnement
              humain : conseils personnalisés, communauté d'échange, et
              contenus pour mieux vivre avec le SOPK au quotidien - parce que
              le bien-être hormonal se joue aussi dans la tête.
            </p>
            <Link
              to="/boutique?categorie=SOPK"
              className="mt-8 inline-flex rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
            >
              Voir les formules SOPK
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-20 text-cream-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-gold-400">
              Recommandés pour le SOPK
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Des formules adaptées à votre parcours
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sopkProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
