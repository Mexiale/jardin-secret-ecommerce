import { Link } from "react-router-dom";
import { Leaf, HeartHandshake, FlaskConical, Users } from "lucide-react";

const values = [
  {
    icon: FlaskConical,
    title: "Rigueur scientifique",
    desc: "Chaque formule est élaborée avec des professionnels de santé et dosée selon les recommandations de la littérature scientifique.",
  },
  {
    icon: Leaf,
    title: "Naturalité",
    desc: "Des ingrédients choisis avec exigence, sans additifs superflus, pensés pour respecter votre corps.",
  },
  {
    icon: HeartHandshake,
    title: "Soutien émotionnel",
    desc: "Vivre avec le SOPK ou un parcours de fertilité, c'est une charge mentale. Nous en parlons, sans tabou.",
  },
  {
    icon: Users,
    title: "Communauté",
    desc: "Un espace d'écoute et de partage pour ne plus traverser ces étapes seule.",
  },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-forest-950 py-24 text-cream-50">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <span className="text-xs font-medium uppercase tracking-widest text-gold-400">
            Notre histoire
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Née d'un besoin, cultivée avec le cœur.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-forest-200">
            Jardin Secret est né à Abidjan, d'un constat simple : trop de
            femmes ivoiriennes font face au SOPK et aux difficultés de
            fertilité dans le silence, sans solution locale, accessible et
            bienveillante.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <img
            src="https://images.unsplash.com/photo-1637715179830-a0de86dc0c4e?q=80&w=1000&auto=format&fit=crop"
            alt="Ingrédients naturels et bien-être"
            className="aspect-[4/5] w-full rounded-3xl object-cover"
          />
          <div>
            <h2 className="font-serif text-3xl text-forest-950">
              Un jardin, une promesse
            </h2>
            <p className="mt-5 leading-relaxed text-forest-700">
              Le nom « Jardin Secret » évoque cet espace intime que chacune
              porte en elle - un lieu où l'on cultive patiemment son équilibre,
              loin du jugement. Nous avons voulu créer une marque qui parle
              avec honnêteté du SOPK, de la fertilité et de la santé
              hormonale, sujets encore trop peu abordés en Côte d'Ivoire.
            </p>
            <p className="mt-4 leading-relaxed text-forest-700">
              Nos formules - berbérine, NAC, acide folique, Shatavari -
              sont sélectionnées avec des professionnels de santé, fabriquées
              sous contrôle qualité strict, et livrées directement chez vous.
              Mais notre engagement va au-delà du complément : à travers notre
              communauté et nos campagnes de sensibilisation, nous voulons que
              chaque femme se sente comprise et accompagnée.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-100/60 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-gold-600">
              Nos valeurs
            </span>
            <h2 className="mt-3 font-serif text-3xl text-forest-950 sm:text-4xl">
              Ce qui guide chaque décision
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-cream-50 p-6 ring-1 ring-forest-200/70">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg text-forest-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
        <h2 className="font-serif text-3xl text-forest-950 sm:text-4xl">
          Envie de rejoindre le jardin ?
        </h2>
        <p className="mt-4 text-forest-600">
          Découvrez nos formules ou écrivez-nous - nous sommes là pour vous
          accompagner, à chaque étape.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/boutique"
            className="rounded-full bg-forest-900 px-7 py-3.5 text-sm font-medium text-cream-50 hover:bg-forest-800"
          >
            Voir la boutique
          </Link>
          <Link
            to="/contact"
            className="rounded-full px-7 py-3.5 text-sm font-medium text-forest-800 ring-1 ring-forest-300 hover:bg-forest-100"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
