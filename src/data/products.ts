const IMG = {
  pillsNeutral: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2",
  pillsCup: "https://images.unsplash.com/photo-1584362917165-526a968579e8",
  botanicalApothecary: "https://images.unsplash.com/photo-1637715179830-a0de86dc0c4e",
  botanicalDried: "https://images.unsplash.com/photo-1770988042769-8457db10f3c6",
  botanicalPlant: "https://images.unsplash.com/photo-1774177953595-0460fb38287d",
  coupleHands: "https://images.unsplash.com/photo-1513267000941-598abe7be16f",
  womanForest: "https://images.unsplash.com/photo-1763713383838-5cd702c13160",
} as const;

function img(url: string, w = 1200) {
  return `${url}?q=80&w=${w}&auto=format&fit=crop`;
}

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: "Fertilité" | "SOPK" | "Équilibre hormonal" | "Bien-être global";
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  bestseller?: boolean;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  ingredients: string;
};

export const products: Product[] = [
  {
    slug: "myo-inositol-equilibre",
    name: "Myo-Inositol Équilibre",
    tagline: "Le pilier de la régulation hormonale",
    category: "SOPK",
    price: 28000,
    compareAtPrice: 32000,
    rating: 4.8,
    reviews: 214,
    bestseller: true,
    image: img(IMG.pillsNeutral),
    gallery: [img(IMG.pillsNeutral), img(IMG.botanicalApothecary), img(IMG.botanicalDried)],
    shortDescription:
      "Myo-inositol et D-chiro-inositol dans le ratio physiologique 40:1, pour soutenir un cycle régulier.",
    description:
      "Formulée pour les femmes vivant avec le Syndrome des Ovaires Polykystiques (SOPK), notre synergie Myo-Inositol Équilibre associe le myo-inositol et le D-chiro-inositol dans le ratio 40:1 recommandé par la littérature scientifique. Un allié quotidien pour retrouver un cycle plus prévisible et apaiser l'esprit autant que le corps.",
    benefits: [
      "Soutient la régularité du cycle menstruel",
      "Contribue à l'équilibre de la glycémie",
      "Formule dosée selon le ratio physiologique 40:1",
      "Sans gluten, sans OGM, testée en laboratoire",
    ],
    usage:
      "2 sachets par jour, dilués dans un verre d'eau, de préférence matin et soir pendant les repas.",
    ingredients:
      "Myo-inositol, D-chiro-inositol, acide folique (vitamine B9), arôme naturel de citron.",
  },
  {
    slug: "complexe-fertilite-femme",
    name: "Complexe Fertilité Femme",
    tagline: "Préparer le terrain, en douceur",
    category: "Fertilité",
    price: 32000,
    rating: 4.9,
    reviews: 178,
    bestseller: true,
    image: img(IMG.pillsCup),
    gallery: [img(IMG.pillsCup), img(IMG.coupleHands), img(IMG.botanicalDried)],
    shortDescription:
      "Acide folique, coenzyme Q10, vitamine D3 et zinc pour accompagner un projet de conception.",
    description:
      "Un complexe pensé comme un rituel de préparation à la conception. Acide folique, coenzyme Q10, vitamine D3 et zinc travaillent ensemble pour soutenir la qualité ovocytaire et l'équilibre général du corps, dans une formule douce et bien tolérée.",
    benefits: [
      "Soutient la qualité ovocytaire",
      "Contribue à la fertilité et à la reproduction normale",
      "Renforce les défenses naturelles",
      "Formule vegan et sans additifs superflus",
    ],
    usage: "1 capsule par jour, le matin, avec un grand verre d'eau.",
    ingredients:
      "Acide folique, coenzyme Q10, vitamine D3, zinc bisglycinate, gélule végétale.",
  },
  {
    slug: "ashwagandha-serenite",
    name: "Ashwagandha Sérénité",
    tagline: "Apaiser le stress qui dérègle le cycle",
    category: "Équilibre hormonal",
    price: 22000,
    rating: 4.7,
    reviews: 132,
    image: img(IMG.pillsNeutral),
    gallery: [img(IMG.pillsNeutral), img(IMG.womanForest), img(IMG.botanicalPlant)],
    shortDescription:
      "Extrait titré de racine d'Ashwagandha (KSM-66) pour un système nerveux apaisé.",
    description:
      "Le stress chronique perturbe l'axe hormonal. Notre Ashwagandha KSM-66, extrait de racine titré à 5% de withanolides, aide le corps à mieux s'adapter au stress quotidien et favorise un sommeil plus réparateur — deux piliers essentiels de l'équilibre hormonal.",
    benefits: [
      "Réduit la perception du stress",
      "Favorise un sommeil de meilleure qualité",
      "Soutient l'équilibre du cortisol",
      "Extrait breveté KSM-66, haute biodisponibilité",
    ],
    usage: "1 à 2 capsules par jour, de préférence le soir.",
    ingredients: "Extrait de racine d'Ashwagandha KSM-66 (300mg), gélule végétale.",
  },
  {
    slug: "omega3-hormones",
    name: "Oméga-3 Hormones",
    tagline: "Les bonnes graisses pour de bonnes hormones",
    category: "Bien-être global",
    price: 19000,
    rating: 4.6,
    reviews: 96,
    image: img(IMG.pillsCup),
    gallery: [img(IMG.pillsCup), img(IMG.botanicalPlant), img(IMG.botanicalDried)],
    shortDescription:
      "EPA/DHA de haute pureté, essentiels à la production hormonale et à l'anti-inflammation.",
    description:
      "Les acides gras oméga-3 sont les briques de base de nos hormones stéroïdiennes. Notre huile de poisson sauvage, purifiée par distillation moléculaire, apporte un ratio EPA/DHA optimisé pour soutenir l'équilibre hormonal et réduire l'inflammation de bas grade souvent associée au SOPK.",
    benefits: [
      "Contribue au fonctionnement normal du cœur",
      "Soutient une réponse inflammatoire saine",
      "Ratio EPA/DHA optimisé 3:2",
      "Testé sans métaux lourds ni PCB",
    ],
    usage: "2 capsules par jour, au cours d'un repas.",
    ingredients: "Huile de poisson sauvage concentrée (EPA 500mg/DHA 300mg), vitamine E naturelle.",
  },
  {
    slug: "vitamine-d3-k2",
    name: "Vitamine D3 + K2",
    tagline: "Le soleil que la ville nous refuse",
    category: "Bien-être global",
    price: 15000,
    rating: 4.8,
    reviews: 154,
    image: img(IMG.pillsNeutral),
    gallery: [img(IMG.pillsNeutral), img(IMG.botanicalDried), img(IMG.botanicalPlant)],
    shortDescription:
      "Un binôme essentiel pour l'immunité, la fertilité et la santé osseuse.",
    description:
      "Étroitement liée à la fonction ovarienne et à la fertilité, la vitamine D est pourtant l'une des carences les plus fréquentes. Associée à la vitamine K2 pour une meilleure assimilation, cette formule soutient l'immunité, la densité osseuse et l'équilibre hormonal général.",
    benefits: [
      "Contribue à la fertilité et à la reproduction normale",
      "Soutient le système immunitaire",
      "Favorise l'absorption du calcium",
      "Format huileux pour une meilleure assimilation",
    ],
    usage: "1 capsule par jour, avec un repas contenant des lipides.",
    ingredients: "Vitamine D3 (cholécalciférol) 2000 UI, vitamine K2 (MK-7) 100µg, huile d'olive.",
  },
  {
    slug: "complement-fertilite-homme",
    name: "Vitalité Masculine",
    tagline: "La fertilité se construit à deux",
    category: "Fertilité",
    price: 30000,
    rating: 4.7,
    reviews: 68,
    image: img(IMG.pillsCup),
    gallery: [img(IMG.pillsCup), img(IMG.coupleHands), img(IMG.botanicalApothecary)],
    shortDescription:
      "Zinc, sélénium, L-carnitine et coenzyme Q10 pour soutenir la fertilité masculine.",
    description:
      "Parce que la fertilité concerne aussi les hommes, Vitalité Masculine réunit zinc, sélénium, L-carnitine et coenzyme Q10 pour soutenir la production de spermatozoïdes et la vitalité générale, dans une démarche de couple face au projet de conception.",
    benefits: [
      "Contribue à la fertilité et à la reproduction normale",
      "Soutient la production normale de testostérone",
      "Antioxydant pour protéger les cellules",
      "Formule pensée pour un usage quotidien discret",
    ],
    usage: "2 capsules par jour, au cours du petit-déjeuner.",
    ingredients: "Zinc bisglycinate, sélénium, L-carnitine, coenzyme Q10, gélule végétale.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
