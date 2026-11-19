/**
 * Catalogue Jardin Secret - catalogue de départ.
 *
 * La SOURCE DE VÉRITÉ est la table Supabase `products`, modifiable dans /admin/produits.
 * Ce fichier sert à deux choses :
 *   1. générer les données initiales (scripts/generer-sql-produits.ts -> supabase-schema-products.sql) ;
 *   2. secours : le site l'affiche si Supabase ne répond pas.
 * Après la mise en ligne, modifiez les produits dans l'admin, plus ici.
 *
 * Photos : public/images/produits/<slug>.webp, détourées avec scripts/detourer_produits.py.
 * Les textes reprennent ce qui figure sur l'étiquette de chaque produit.
 *
 * PRIX : `price` = prix payé par la cliente, `compareAtPrice` = prix barré.
 * Un prix à 0 signifie « à compléter » : le produit affiche « Prix bientôt disponible »
 * et ne peut pas être ajouté au panier.
 */

export const CATEGORIES = [
  "SOPK",
  "Fertilité",
  "Ménopause",
  "Bien-être masculin",
  "Équilibre hormonal",
  "Bien-être global",
  "Beauté",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  slug: string;
  name: string;
  brand?: string;
  tagline: string;
  category: Category;
  /** Prix payé en FCFA. 0 = prix pas encore renseigné. */
  price: number;
  /** Prix barré en FCFA (optionnel). */
  compareAtPrice?: number;
  /** Mis en avant sur la page d'accueil (le premier sert d'image principale). */
  featured?: boolean;
  /** false = masqué de la boutique (visible seulement dans l'admin). */
  active: boolean;
  /** URL de la photo ; chaîne vide = « Photo à venir ». */
  image: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  ingredients: string;
};

export function hasPrice(product: Product) {
  return product.price > 0;
}

function photo(slug: string) {
  return `/images/produits/${slug}.webp`;
}

const POSOLOGIE =
  "Suivez la posologie indiquée sur le flacon. Demandez l'avis d'un professionnel de santé en cas de grossesse, d'allaitement ou de traitement en cours.";

type ProductInput = Omit<Product, "image" | "usage" | "active"> & {
  usage?: string;
  active?: boolean;
  /** false = pas encore de photo. */
  hasPhoto?: boolean;
};

function product({ hasPhoto = true, active = true, usage, ...p }: ProductInput): Product {
  return { ...p, active, image: hasPhoto ? photo(p.slug) : "", usage: usage ?? POSOLOGIE };
}

export const products: Product[] = [
  // ---------------------------------------------------------------- SOPK
  product({
    slug: "berberine-plus",
    name: "Berbérine Plus",
    tagline: "Un soutien végétal pour l'équilibre métabolique",
    category: "SOPK",
    price: 13000,
    compareAtPrice: 15000,
    featured: true,
    shortDescription: "Berbérine pure en gélules végétales - 60 gélules, 30 jours.",
    description:
      "La berbérine est un composé végétal présent notamment dans l'épine-vinette. Elle fait partie des compléments les plus étudiés pour le métabolisme du glucose, une préoccupation fréquente chez les femmes vivant avec le SOPK. Cette formule est annoncée 100 % pure, à puissance maximale.",
    benefits: [
      "Berbérine 100 % pure, puissance maximale",
      "Gélules végétales",
      "Cure de 30 jours",
    ],
    ingredients: "Berbérine. 60 gélules végétales.",
  }),
  product({
    slug: "nac-500",
    name: "NAC 500 mg",
    brand: "Japan Koomy",
    tagline: "Protection antioxydante des cellules",
    category: "SOPK",
    price: 15000,
    compareAtPrice: 20000,
    featured: true,
    shortDescription: "N-acétylcystéine 500 mg avec sélénium - 100 gélules.",
    description:
      "La N-acétylcystéine (NAC) est un précurseur du glutathion, l'un des principaux antioxydants du corps. Associée au sélénium, cette formule aide à protéger les cellules contre les radicaux libres. La NAC est souvent intégrée aux routines des femmes vivant avec le SOPK.",
    benefits: [
      "Protection contre les radicaux libres",
      "Contribue à la santé cellulaire",
      "Enrichie en sélénium",
    ],
    ingredients: "N-acétylcystéine 500 mg, sélénium. 100 gélules.",
  }),

  // ----------------------------------------------------------- Fertilité
  product({
    slug: "acide-folique-b12",
    name: "Acide folique 800 µg + B12",
    tagline: "La vitamine clé d'un projet de grossesse",
    category: "Fertilité",
    price: 15000,
    compareAtPrice: 20000,
    featured: true,
    shortDescription: "Acide folique 800 µg avec vitamine B12 - 120 gélules.",
    description:
      "L'acide folique (vitamine B9) est recommandé aux femmes qui préparent une grossesse. Associé à la vitamine B12, il soutient un métabolisme normal de l'homocystéine. Une formule simple, sans OGM, pour 4 mois.",
    benefits: [
      "800 µg d'acide folique par gélule",
      "Associé à la vitamine B12 (complexe B)",
      "Soutient un métabolisme normal de l'homocystéine",
      "Sans OGM",
    ],
    ingredients: "Acide folique 800 µg, vitamine B12. 120 gélules.",
  }),
  product({
    slug: "coq10-400",
    name: "CoQ10 400 mg",
    tagline: "L'antioxydant de l'énergie cellulaire",
    category: "Fertilité",
    price: 15000,
    compareAtPrice: 20000,
    featured: true,
    shortDescription: "Coenzyme Q10 400 mg enrichie en oméga-3 - 120 capsules molles.",
    description:
      "La coenzyme Q10 participe à la production d'énergie dans chaque cellule et agit comme antioxydant. Cette formule haute absorption est associée à des oméga-3 et fabriquée selon les normes GMP.",
    benefits: [
      "Soutient le système immunitaire",
      "Soutient le système cardiovasculaire",
      "Action antioxydante",
      "Haute absorption grâce aux oméga-3",
    ],
    ingredients: "Coenzyme Q10 400 mg, oméga-3. 120 capsules molles.",
  }),

  // -------------------------------------------------- Équilibre hormonal
  product({
    slug: "dim-bioperine",
    name: "DIM 200 mg + BioPerine",
    tagline: "Pour l'équilibre des œstrogènes",
    category: "Équilibre hormonal",
    price: 13000,
    compareAtPrice: 15000,
    featured: true,
    shortDescription: "DIM 200 mg avec BioPerine - 60 gélules.",
    description:
      "Le DIM (diindolylméthane) est un composé issu des légumes crucifères comme le brocoli et le chou-fleur. Il est utilisé pour accompagner l'équilibre des œstrogènes. La BioPerine (extrait de poivre noir) favorise son absorption.",
    benefits: [
      "Accompagne l'équilibre des œstrogènes",
      "Issu des légumes crucifères",
      "BioPerine pour une meilleure absorption",
    ],
    ingredients: "Diindolylméthane (DIM) 200 mg, BioPerine (extrait de poivre noir). 60 gélules.",
  }),
  product({
    slug: "shatavari-bio",
    name: "Shatavari bio 1000 mg",
    tagline: "La plante ayurvédique de la femme",
    category: "Équilibre hormonal",
    price: 13000,
    compareAtPrice: 15000,
    featured: true,
    shortDescription: "Poudre de Shatavari biologique 1000 mg - 60 gélules.",
    description:
      "Le Shatavari est une plante traditionnelle de la médecine ayurvédique, utilisée depuis des siècles pour accompagner le bien-être féminin. Cette formule à base de poudre de Shatavari biologique ne contient ni charges ni liants.",
    benefits: [
      "Shatavari issu de l'agriculture biologique",
      "Plante traditionnelle ayurvédique",
      "Sans charges, sans liants, sans gluten",
    ],
    ingredients: "Poudre de Shatavari biologique 1000 mg. 60 gélules.",
  }),
  product({
    slug: "ashwagandha-2100",
    name: "Ashwagandha 2100 mg",
    brand: "France FshGrace",
    tagline: "Apaiser le stress qui dérègle le cycle",
    category: "Équilibre hormonal",
    price: 15000,
    compareAtPrice: 20000,
    shortDescription: "Ashwagandha 2100 mg avec extrait de poivre noir - 100 gélules végétales.",
    description:
      "Plante adaptogène de référence, l'ashwagandha aide le corps à faire face au stress du quotidien. Le stress chronique pèse sur l'équilibre hormonal : cette formule concentrée, associée au poivre noir pour l'absorption, accompagne un retour au calme.",
    benefits: [
      "Aide à réduire le stress",
      "Soutient le système immunitaire",
      "Contribue à une humeur positive",
      "Concentration maximale, avec poivre noir",
    ],
    ingredients: "Ashwagandha 2100 mg, extrait de poivre noir. 100 gélules végétales.",
  }),
  product({
    slug: "dhea",
    name: "DHEA",
    brand: "Havasu Nutrition",
    tagline: "Équilibre hormonal et énergie",
    category: "Équilibre hormonal",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "DHEA en gélules - 60 gélules.",
    description:
      "La DHEA est une hormone naturellement produite par les glandes surrénales, dont le taux diminue avec l'âge. Cette formule accompagne l'équilibre hormonal et le niveau d'énergie. S'agissant d'une hormone, elle doit être prise sur avis médical.",
    benefits: ["Soutient l'équilibre hormonal", "Soutient le niveau d'énergie"],
    usage:
      "À prendre uniquement sur avis médical, selon la posologie indiquée sur le flacon. Déconseillé pendant la grossesse et l'allaitement.",
    ingredients: "DHEA (déhydroépiandrostérone). 60 gélules.",
  }),
  product({
    slug: "thyroid-support",
    name: "Thyroid Support",
    brand: "France FshGrace",
    tagline: "Accompagner une thyroïde en forme",
    category: "Équilibre hormonal",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "Formule avancée de soutien thyroïdien - 60 gélules végétales.",
    description:
      "La thyroïde orchestre l'énergie, le métabolisme et une partie de l'équilibre hormonal. Cette formule avancée réunit des nutriments sélectionnés pour accompagner son bon fonctionnement.",
    benefits: [
      "Formule avancée de soutien thyroïdien",
      "Soutient l'énergie et la concentration",
      "Gélules vegan",
    ],
    usage:
      "Suivez la posologie indiquée sur le flacon. Si vous suivez un traitement pour la thyroïde, demandez l'avis de votre médecin avant de le prendre.",
    ingredients: "Voir la composition détaillée sur le flacon. 60 gélules vegan.",
  }),
  product({
    slug: "maca-7-en-1",
    name: "Maca 7 en 1",
    tagline: "Vitalité et équilibre, 7 plantes en une",
    category: "Équilibre hormonal",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "Maca, ginseng, ashwagandha, tribulus et autres plantes - 60 gélules.",
    description:
      "Une formule extra-forte qui réunit 7 ingrédients naturels autour de la racine de maca, plante des hauts plateaux andins traditionnellement utilisée pour la vitalité et la libido.",
    benefits: [
      "7 ingrédients naturels",
      "Formule extra-forte",
      "Racines de maca, de ginseng et d'ashwagandha",
    ],
    ingredients:
      "Racine de maca, racine de ginseng, racine d'ashwagandha, Tribulus terrestris et autres plantes (7 au total). 60 gélules.",
  }),

  // ----------------------------------------------------------- Ménopause
  product({
    slug: "probiotiques-menopause",
    name: "Probiotiques Ménopause",
    tagline: "Un microbiote soutenu à chaque étape",
    category: "Ménopause",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "40 milliards d'UFC + prébiotiques - 60 gélules.",
    description:
      "Pensés pour les femmes en périménopause et ménopause, ces probiotiques de haute pureté associent 40 milliards d'UFC à des prébiotiques pour soutenir la digestion et la santé intestinale. Pas besoin de réfrigération.",
    benefits: [
      "Accompagne toutes les étapes de la ménopause",
      "Favorise la digestion et la santé intestinale",
      "40 milliards d'UFC + prébiotiques",
      "Conservation sans réfrigération",
    ],
    ingredients: "Souches probiotiques (40 milliards d'UFC), prébiotiques. 60 gélules.",
  }),

  // ---------------------------------------------------- Bien-être global
  product({
    slug: "probiotiques-femme",
    name: "Probiotiques Femme",
    brand: "France FshGrace",
    tagline: "Équilibre intime et digestif",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "50 milliards d'UFC, 16 souches, prébiotiques et canneberge - 60 gélules.",
    description:
      "Une formule complète pour la femme : 16 souches probiotiques, des prébiotiques et de la canneberge pour accompagner à la fois l'équilibre digestif, l'immunité et la santé vaginale et urinaire.",
    benefits: [
      "Favorise un transit régulier",
      "Soutient le système immunitaire",
      "Contribue à la santé vaginale et urinaire",
      "16 souches, 50 milliards d'UFC par prise",
    ],
    ingredients: "16 souches probiotiques (50 milliards d'UFC par prise), prébiotiques, canneberge. 60 gélules.",
  }),
  product({
    slug: "multivitamines-femme",
    name: "Multivitamines Femme",
    brand: "France FshGrace",
    tagline: "L'essentiel du quotidien, en une gélule",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "20 vitamines et minéraux - 60 gélules, 30 jours.",
    description:
      "Une formule tout-en-un qui réunit 20 vitamines et minéraux pour accompagner l'énergie, la concentration et l'humeur, ainsi que la beauté des cheveux, de la peau et des ongles.",
    benefits: [
      "20 vitamines et minéraux",
      "Énergie, concentration et humeur",
      "Cheveux, peau et ongles",
      "Sans OGM, sans gluten, sans lactose, sans soja",
    ],
    ingredients: "20 vitamines et minéraux. 60 gélules.",
  }),
  product({
    slug: "omega-3-huile-de-poisson",
    name: "Oméga-3 huile de poisson",
    brand: "France FshGrace",
    tagline: "Les bonnes graisses pour le cœur et le cerveau",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    shortDescription: "1200 mg d'EPA + 900 mg de DHA - 120 capsules molles.",
    description:
      "Une huile de poisson triple concentration et haute pureté, riche en EPA et DHA. Les oméga-3 sont des acides gras essentiels que le corps ne sait pas fabriquer seul.",
    benefits: [
      "Santé du cerveau et du cœur",
      "1200 mg d'EPA + 900 mg de DHA",
      "Triple concentration, haute pureté",
    ],
    ingredients: "Huile de poisson (EPA 1200 mg, DHA 900 mg). 120 capsules molles.",
  }),
  product({
    slug: "magnesium-complex",
    name: "Magnesium Complex",
    brand: "Toplux Nutrition",
    tagline: "8 formes de magnésium, absorption maximale",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 17000,
    shortDescription: "8 formes de magnésium élémentaire, 1000 mg - 90 gélules.",
    description:
      "Le magnésium intervient dans des centaines de réactions de l'organisme, de la détente musculaire à la gestion de la fatigue. Ce complexe réunit 8 formes de magnésium pour une absorption maximale.",
    benefits: [
      "Soutient les os et les muscles",
      "Contribue au bien-être général",
      "8 formes de magnésium, 1000 mg",
      "Sans OGM",
    ],
    ingredients: "Magnésium élémentaire sous 8 formes, 1000 mg par prise. 90 gélules (45 jours).",
  }),
  product({
    slug: "magnesium-triple-complexe",
    name: "Magnésium Triple Complexe",
    tagline: "Malate, citrate et glycinate",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "Magnésium 300 mg sous 3 formes - 90 gélules végétales.",
    description:
      "Trois formes de magnésium bien assimilées - malate, citrate et glycinate - réunies dans une gélule végétale haute absorption.",
    benefits: ["3 formes complémentaires de magnésium", "Haute absorption", "Sans OGM"],
    ingredients: "Magnésium 300 mg (malate, citrate, glycinate). 90 gélules végétales.",
  }),
  product({
    slug: "calcium-magnesium-zinc",
    name: "Calcium, Magnésium & Zinc",
    brand: "France FshGrace",
    tagline: "Le trio des os et des nerfs",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    shortDescription: "Calcium, magnésium et zinc - 100 gélules végétariennes.",
    description:
      "Trois minéraux essentiels réunis pour accompagner la solidité des os et le bon fonctionnement du système nerveux. Formule végétarienne.",
    benefits: ["Santé des os", "Fonctionnement du système nerveux", "Végétarien"],
    ingredients: "Calcium, magnésium, zinc. 100 gélules végétariennes.",
  }),
  product({
    slug: "ginkgo-biloba",
    name: "Ginkgo Biloba",
    brand: "France FshGrace",
    tagline: "Mémoire et concentration",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    shortDescription: "Ginkgo biloba extra-fort - 120 gélules végétariennes.",
    description:
      "Le ginkgo biloba est l'un des plus anciens arbres de la planète. Ses feuilles sont traditionnellement utilisées pour accompagner la mémoire et la circulation.",
    benefits: ["Formule extra-forte", "Sans OGM, sans gluten, sans soja"],
    ingredients: "Extrait de feuilles de Ginkgo biloba. 120 gélules végétariennes.",
  }),
  product({
    slug: "serrapeptase",
    name: "Serrapeptase 40 000 SPU",
    tagline: "L'enzyme en gélule gastro-résistante",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "40 000 SPU par gélule, gélules DRcaps - 60 gélules.",
    description:
      "La serrapeptase est une enzyme protéolytique. Elle est présentée dans des gélules DRcaps® résistantes à l'acidité de l'estomac, pour être libérée plus loin dans le tube digestif.",
    benefits: ["40 000 SPU par gélule", "Gélules gastro-résistantes DRcaps®", "Sans OGM"],
    usage:
      "Suivez la posologie indiquée sur le flacon. Demandez l'avis d'un professionnel de santé si vous prenez des anticoagulants, en cas de grossesse ou d'allaitement.",
    ingredients: "Serrapeptase 40 000 SPU. 60 gélules DRcaps®.",
  }),
  product({
    slug: "l-carnitine-1000",
    name: "L-Carnitine 1000 mg",
    tagline: "Un allié de votre démarche minceur",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "L-carnitine 1000 mg - 60 gélules végétales.",
    description:
      "La L-carnitine participe au transport des graisses vers les cellules, où elles sont utilisées pour produire de l'énergie. Elle accompagne une démarche de perte de poids, en complément d'une alimentation équilibrée et d'une activité physique.",
    benefits: [
      "Accompagne une démarche de perte de poids",
      "Concentration maximale, 1000 mg",
      "Formule 100 % pure",
    ],
    ingredients: "L-carnitine 1000 mg. 60 gélules végétales.",
  }),
  product({
    slug: "shilajit-8-en-1",
    name: "Shilajit 8 en 1",
    tagline: "Énergie et vitalité, 8 actifs réunis",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "Shilajit, ashwagandha, rhodiola, ginseng et plus - 60 gélules végétales.",
    description:
      "Une formule extra-forte qui associe le shilajit, résine minérale de l'Himalaya, à des plantes adaptogènes reconnues : ashwagandha, rhodiola rosea et ginseng panax.",
    benefits: [
      "8 actifs en une seule formule",
      "Formule extra-forte - 15 250 mg par prise",
      "Gélules végétales",
    ],
    ingredients:
      "Shilajit, ashwagandha, rhodiola rosea, ginseng panax et 4 autres actifs (15 250 mg par prise). 60 gélules végétales.",
  }),

  // -------------------------------------------------- Bien-être masculin
  product({
    slug: "conception-for-him",
    name: "Conception For Him",
    tagline: "La fertilité se construit à deux",
    category: "Bien-être masculin",
    price: 13000,
    compareAtPrice: 15000,
    shortDescription: "Complément fertilité homme - 60 gélules végétariennes.",
    description:
      "Parce qu'un projet de conception concerne aussi les hommes, Conception For Him est formulé pour soutenir la fertilité masculine, notamment le nombre et la mobilité des spermatozoïdes.",
    benefits: [
      "Complément dédié à la fertilité masculine",
      "Soutient le nombre et la mobilité des spermatozoïdes",
      "Gélules végétariennes",
    ],
    ingredients: "Voir la composition détaillée sur le flacon. 60 gélules végétariennes.",
  }),
  product({
    slug: "black-maca-20000",
    name: "Maca noire 20 000 mg",
    brand: "France FshGrace",
    tagline: "Force, énergie et endurance",
    category: "Bien-être masculin",
    price: 15000,
    compareAtPrice: 20000,
    shortDescription: "Équivalent 20 000 mg de maca noire par gélule - 180 gélules végétales.",
    description:
      "La maca noire est la variété de maca traditionnellement associée à la vitalité masculine. Cette formule concentrée accompagne l'énergie, l'endurance et l'humeur.",
    benefits: [
      "Soutient la vitalité masculine",
      "Énergie, endurance et humeur",
      "Maca noire pure et concentrée",
    ],
    ingredients: "Extrait de maca noire (équivalent 20 000 mg par gélule). 180 gélules végétales.",
  }),

  // -------------------------------------------------------------- Beauté
  product({
    slug: "serum-visage-5-en-1",
    name: "Sérum visage 5 en 1",
    brand: "Bestcus",
    tagline: "Rides et taches, un seul geste",
    category: "Beauté",
    price: 0, // TODO prix
    shortDescription: "Acide hyaluronique, niacinamide, vitamines C et E, collagène.",
    description:
      "Un sérum professionnel qui réunit cinq actifs pour la peau : acide hyaluronique pour l'hydratation, niacinamide et vitamine C pour l'éclat et les taches, vitamine E et collagène pour la souplesse.",
    benefits: [
      "Aide à atténuer les rides",
      "Aide à atténuer les taches brunes",
      "5 actifs dans un seul sérum",
    ],
    usage:
      "Appliquez quelques gouttes sur la peau propre, matin et/ou soir. Faites un test sur une petite zone avant la première utilisation et appliquez une protection solaire en journée.",
    ingredients:
      "Acide hyaluronique 10 %, niacinamide 5 %, vitamine C 30 %, vitamine E 10 %, collagène 5 %.",
  }),

  // ======================================================================
  // Produits sans photo (affichent « Photo à venir » jusqu'à l'ajout d'une
  // image dans /admin/produits).
  // ======================================================================
  product({
    slug: "the-feuilles-framboisier",
    name: "Thé de feuilles de framboisier",
    tagline: "Une tisane traditionnelle du bien-être féminin",
    category: "Fertilité",
    price: 0, // TODO prix
    hasPhoto: false,
    shortDescription: "Feuilles de framboisier à infuser.",
    description:
      "La feuille de framboisier est une plante traditionnellement utilisée en infusion par les femmes, autour du cycle et en fin de grossesse. Elle se prépare comme une tisane classique, à savourer chaude ou froide.",
    benefits: ["Plante traditionnelle du bien-être féminin", "Se prépare en infusion"],
    usage:
      "Préparez en infusion selon les indications de l'emballage. Pendant la grossesse, ne l'utilisez que sur avis de votre sage-femme ou de votre médecin, en particulier avant le troisième trimestre.",
    ingredients: "Feuilles de framboisier. Voir l'emballage pour le détail.",
  }),
  product({
    slug: "tisane-fibromes",
    name: "Tisane fibromes",
    tagline: "Une infusion de plantes, en complément de votre suivi",
    category: "Équilibre hormonal",
    price: 0, // TODO prix
    hasPhoto: false,
    shortDescription: "Mélange de plantes à infuser.",
    description:
      "Une infusion de plantes proposée aux femmes concernées par les fibromes utérins, à intégrer à une routine bien-être. Elle accompagne votre suivi gynécologique et ne remplace en aucun cas un avis ou un traitement médical.",
    benefits: ["Mélange de plantes en infusion", "À intégrer à une routine bien-être"],
    usage:
      "Préparez en infusion selon les indications de l'emballage. Parlez-en à votre gynécologue, surtout en cas de grossesse, de saignements importants ou de traitement en cours.",
    ingredients: "Voir la composition sur l'emballage.",
  }),
  product({
    slug: "libido-booster-femme",
    name: "Libido Booster Femme",
    tagline: "Désir et vitalité au féminin",
    category: "Équilibre hormonal",
    price: 0, // TODO prix
    hasPhoto: false,
    shortDescription: "Complément dédié au bien-être intime féminin.",
    description:
      "Le désir varie avec le cycle, le stress et la fatigue. Ce complément est pensé pour accompagner la vitalité et le bien-être intime des femmes.",
    benefits: ["Dédié au bien-être intime féminin", "Accompagne la vitalité"],
    ingredients: "Voir la composition sur le flacon.",
  }),
  product({
    slug: "shatavari-poudre-227g",
    name: "Shatavari bio en poudre 227 g",
    tagline: "La plante ayurvédique de la femme, en poudre",
    category: "Équilibre hormonal",
    price: 0, // TODO prix
    hasPhoto: false,
    shortDescription: "Poudre de Shatavari biologique - 227 g.",
    description:
      "La même plante ayurvédique que nos gélules de Shatavari, en poudre biologique. À mélanger dans une boisson, un smoothie ou un yaourt, pour un dosage modulable.",
    benefits: [
      "Shatavari issu de l'agriculture biologique",
      "Format poudre, dosage modulable",
      "Sachet de 227 g",
    ],
    ingredients: "Poudre de racine de Shatavari biologique. 227 g.",
  }),
  product({
    slug: "magnesium-bisglycinate",
    name: "Magnésium bisglycinate",
    tagline: "La forme de magnésium la plus douce",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    hasPhoto: false,
    shortDescription: "Magnésium sous forme bisglycinate - 180 gélules.",
    description:
      "Le bisglycinate est l'une des formes de magnésium les mieux tolérées par l'estomac. Le magnésium contribue au fonctionnement normal du système nerveux et à la réduction de la fatigue.",
    benefits: [
      "Forme bisglycinate, douce pour l'estomac",
      "Contribue à réduire la fatigue",
      "180 gélules",
    ],
    ingredients: "Magnésium (bisglycinate). 180 gélules.",
  }),
  product({
    slug: "vitamine-b-complex-plus",
    name: "Vitamin B Complex Plus",
    tagline: "Toutes les vitamines B, pour l'énergie",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    hasPhoto: false,
    shortDescription: "Complexe de vitamines B - 120 gélules vegan.",
    description:
      "Les vitamines du groupe B travaillent ensemble pour transformer les aliments en énergie et soutenir le système nerveux. Une formule complète en gélules vegan.",
    benefits: [
      "Toutes les vitamines du groupe B",
      "Contribue à réduire la fatigue",
      "120 gélules vegan",
    ],
    ingredients: "Vitamines du groupe B. 120 gélules vegan.",
  }),
  product({
    slug: "vitamine-k2-d3",
    name: "Vitamine K2 + D3",
    tagline: "Le duo des os et de l'immunité",
    category: "Bien-être global",
    price: 15000,
    compareAtPrice: 20000,
    hasPhoto: false,
    shortDescription: "Vitamines D3 et K2 - 120 gélules vegan.",
    description:
      "La vitamine D contribue au maintien d'une ossature normale et au fonctionnement normal du système immunitaire. Associée à la vitamine K2, elle aide le calcium à se fixer là où le corps en a besoin.",
    benefits: [
      "Contribue au maintien d'os normaux",
      "Soutient le système immunitaire",
      "120 gélules vegan",
    ],
    ingredients: "Vitamine D3, vitamine K2. 120 gélules vegan.",
  }),
  product({
    slug: "vitamine-e",
    name: "Vitamine E",
    tagline: "L'antioxydant de la peau et des cellules",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    hasPhoto: false,
    shortDescription: "Vitamine E.",
    description:
      "La vitamine E contribue à protéger les cellules contre le stress oxydatif. Elle est aussi appréciée pour accompagner la beauté de la peau.",
    benefits: ["Action antioxydante", "Contribue à protéger les cellules"],
    ingredients: "Vitamine E. Voir le détail sur le flacon.",
  }),
  product({
    slug: "saw-palmetto",
    name: "Saw Palmetto",
    tagline: "Prostate, confort urinaire et cheveux",
    category: "Bien-être masculin",
    price: 15000,
    compareAtPrice: 20000,
    hasPhoto: false,
    shortDescription: "Palmier nain (saw palmetto) - 100 gélules vegan.",
    description:
      "Le palmier nain, ou saw palmetto, est une plante traditionnellement utilisée pour le confort urinaire et la prostate chez l'homme, ainsi que pour la santé des cheveux.",
    benefits: ["Confort urinaire et prostate", "Santé des cheveux", "100 gélules vegan"],
    usage:
      "Suivez la posologie indiquée sur le flacon. Demandez l'avis d'un médecin si vous suivez un traitement hormonal ou un traitement pour la prostate.",
    ingredients: "Extrait de baies de palmier nain (Serenoa repens). 100 gélules vegan.",
  }),
  product({
    slug: "l-glutamine",
    name: "L-Glutamine",
    tagline: "L'acide aminé de la récupération",
    category: "Bien-être global",
    price: 0, // TODO prix
    hasPhoto: false,
    shortDescription: "L-glutamine.",
    description:
      "La L-glutamine est l'acide aminé le plus abondant du corps. Elle est souvent utilisée par les sportifs, en particulier pendant les périodes d'effort intense.",
    benefits: ["Acide aminé libre", "Souvent utilisée par les sportifs"],
    ingredients: "L-glutamine. Voir le détail sur le flacon.",
  }),

  // Fiches incomplètes : MASQUÉES de la boutique tant qu'elles ne sont pas
  // complétées dans /admin/produits (nom exact, forme, mode d'emploi).
  product({
    slug: "bestcus",
    name: "Bestcus (à compléter)",
    brand: "Bestcus",
    tagline: "À compléter",
    category: "Beauté",
    price: 0, // TODO prix
    hasPhoto: false,
    active: false,
    shortDescription: "Fiche à compléter : nom exact du produit, description et photo.",
    description: "Fiche à compléter : nom exact du produit, description et photo.",
    benefits: [],
    ingredients: "À compléter.",
  }),
  product({
    slug: "thorne",
    name: "Thorne (à compléter)",
    brand: "Thorne",
    tagline: "À compléter",
    category: "Bien-être global",
    price: 13000,
    compareAtPrice: 15000,
    hasPhoto: false,
    active: false,
    shortDescription: "Fiche à compléter : quel produit Thorne ? Description et photo.",
    description: "Fiche à compléter : quel produit Thorne ? Description et photo.",
    benefits: [],
    ingredients: "À compléter.",
  }),
  product({
    slug: "acide-borique",
    name: "Acide borique (à compléter)",
    tagline: "À compléter",
    category: "Bien-être global",
    price: 8000,
    hasPhoto: false,
    active: false,
    shortDescription: "Fiche à compléter : forme (ovules, poudre...) et mode d'emploi.",
    description:
      "Fiche à compléter : précisez la forme du produit (ovules, poudre...) et son mode d'emploi exact avant de l'afficher. L'acide borique est toxique s'il est avalé : la fiche doit le dire clairement.",
    benefits: [],
    usage: "À compléter.",
    ingredients: "À compléter.",
  }),
];

/** Stock de départ (liste du 19/11/2026), utilisé pour générer le SQL initial. */
export const initialStock: Record<string, number> = {
  "the-feuilles-framboisier": 10,
  "tisane-fibromes": 10,
  "libido-booster-femme": 4,
  "probiotiques-femme": 11,
  "shatavari-poudre-227g": 4,
  "l-carnitine-1000": 7,
  "berberine-plus": 10,
  "magnesium-bisglycinate": 7,
  serrapeptase: 7,
  bestcus: 3,
  "serum-visage-5-en-1": 2,
  "dim-bioperine": 8,
  "vitamine-b-complex-plus": 15,
  thorne: 9,
  "acide-borique": 5,
  "shilajit-8-en-1": 3,
  "thyroid-support": 4,
  "acide-folique-b12": 3,
  "ginkgo-biloba": 5,
  "maca-7-en-1": 4,
  "vitamine-e": 2,
  dhea: 4,
  "ashwagandha-2100": 2,
  "probiotiques-menopause": 2,
  "nac-500": 7,
  "saw-palmetto": 2,
  "magnesium-complex": 9,
  "conception-for-him": 8,
  "magnesium-triple-complexe": 2,
  "vitamine-k2-d3": 5,
  "shatavari-bio": 6,
  "black-maca-20000": 6,
  "omega-3-huile-de-poisson": 1,
  "l-glutamine": 0,
  "calcium-magnesium-zinc": 1,
  "coq10-400": 1,
  "multivitamines-femme": 1,
};
