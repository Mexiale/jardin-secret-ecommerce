-- Jardin Secret - catalogue produits modifiable depuis /admin/produits
-- Fichier GÉNÉRÉ par scripts/generer-sql-produits.ts (ne pas modifier à la main).
-- À exécuter UNE FOIS dans Supabase : SQL Editor -> New query -> coller -> Run
-- (après supabase-schema-stock.sql).

-- ---------------------------------------------------------------- Table
create table if not exists public.products (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  brand text,
  tagline text not null default '',
  category text not null check (category in ('SOPK', 'Fertilité', 'Ménopause', 'Bien-être masculin', 'Équilibre hormonal', 'Bien-être global', 'Beauté')),
  price integer not null default 0 check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  image_url text,
  short_description text not null default '',
  description text not null default '',
  benefits text[] not null default '{}',
  usage text not null default '',
  ingredients text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

-- Le site public ne voit que les produits visibles
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select to anon
  using (active);

-- Toi (connectée) vois tout et peux créer / modifier / supprimer
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin" on public.products
  for select to authenticated using (true);

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert to authenticated with check (true);

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update to authenticated using (true) with check (true);

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete to authenticated using (true);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

-- ------------------------------------------------- Photos (Supabase Storage)
-- Bucket public : tout le monde peut voir les photos, seule l'admin peut en ajouter.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "produits_images_insert_admin" on storage.objects;
create policy "produits_images_insert_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'produits');

drop policy if exists "produits_images_update_admin" on storage.objects;
create policy "produits_images_update_admin" on storage.objects
  for update to authenticated using (bucket_id = 'produits') with check (bucket_id = 'produits');

drop policy if exists "produits_images_delete_admin" on storage.objects;
create policy "produits_images_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'produits');

-- ----------------------------------------------------- Stock : suppression
-- L'admin peut retirer la ligne de stock d'un produit supprimé.
drop policy if exists "stock_delete_admin" on public.stock;
create policy "stock_delete_admin" on public.stock
  for delete to authenticated using (true);
grant delete on public.stock to authenticated;

-- ------------------------------------------------------ Catalogue de départ
-- "on conflict do nothing" : relancer ce fichier n'écrase pas vos modifications.
insert into public.products (
  slug, name, brand, tagline, category, price, compare_at_price, featured, active,
  image_url, short_description, description, benefits, usage, ingredients, sort_order
) values
  ('berberine-plus', 'Berbérine Plus', null, 'Un soutien végétal pour l''équilibre métabolique', 'SOPK', 13000, 15000, true, true, '/images/produits/berberine-plus.webp', 'Berbérine pure en gélules végétales - 60 gélules, 30 jours.', 'La berbérine est un composé végétal présent notamment dans l''épine-vinette. Elle fait partie des compléments les plus étudiés pour le métabolisme du glucose, une préoccupation fréquente chez les femmes vivant avec le SOPK. Cette formule est annoncée 100 % pure, à puissance maximale.', array['Berbérine 100 % pure, puissance maximale', 'Gélules végétales', 'Cure de 30 jours']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Berbérine. 60 gélules végétales.', 10),
  ('nac-500', 'NAC 500 mg', 'Japan Koomy', 'Protection antioxydante des cellules', 'SOPK', 15000, 20000, true, true, '/images/produits/nac-500.webp', 'N-acétylcystéine 500 mg avec sélénium - 100 gélules.', 'La N-acétylcystéine (NAC) est un précurseur du glutathion, l''un des principaux antioxydants du corps. Associée au sélénium, cette formule aide à protéger les cellules contre les radicaux libres. La NAC est souvent intégrée aux routines des femmes vivant avec le SOPK.', array['Protection contre les radicaux libres', 'Contribue à la santé cellulaire', 'Enrichie en sélénium']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'N-acétylcystéine 500 mg, sélénium. 100 gélules.', 20),
  ('acide-folique-b12', 'Acide folique 800 µg + B12', null, 'La vitamine clé d''un projet de grossesse', 'Fertilité', 15000, 20000, true, true, '/images/produits/acide-folique-b12.webp', 'Acide folique 800 µg avec vitamine B12 - 120 gélules.', 'L''acide folique (vitamine B9) est recommandé aux femmes qui préparent une grossesse. Associé à la vitamine B12, il soutient un métabolisme normal de l''homocystéine. Une formule simple, sans OGM, pour 4 mois.', array['800 µg d''acide folique par gélule', 'Associé à la vitamine B12 (complexe B)', 'Soutient un métabolisme normal de l''homocystéine', 'Sans OGM']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Acide folique 800 µg, vitamine B12. 120 gélules.', 30),
  ('coq10-400', 'CoQ10 400 mg', null, 'L''antioxydant de l''énergie cellulaire', 'Fertilité', 15000, 20000, true, true, '/images/produits/coq10-400.webp', 'Coenzyme Q10 400 mg enrichie en oméga-3 - 120 capsules molles.', 'La coenzyme Q10 participe à la production d''énergie dans chaque cellule et agit comme antioxydant. Cette formule haute absorption est associée à des oméga-3 et fabriquée selon les normes GMP.', array['Soutient le système immunitaire', 'Soutient le système cardiovasculaire', 'Action antioxydante', 'Haute absorption grâce aux oméga-3']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Coenzyme Q10 400 mg, oméga-3. 120 capsules molles.', 40),
  ('dim-bioperine', 'DIM 200 mg + BioPerine', null, 'Pour l''équilibre des œstrogènes', 'Équilibre hormonal', 13000, 15000, true, true, '/images/produits/dim-bioperine.webp', 'DIM 200 mg avec BioPerine - 60 gélules.', 'Le DIM (diindolylméthane) est un composé issu des légumes crucifères comme le brocoli et le chou-fleur. Il est utilisé pour accompagner l''équilibre des œstrogènes. La BioPerine (extrait de poivre noir) favorise son absorption.', array['Accompagne l''équilibre des œstrogènes', 'Issu des légumes crucifères', 'BioPerine pour une meilleure absorption']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Diindolylméthane (DIM) 200 mg, BioPerine (extrait de poivre noir). 60 gélules.', 50),
  ('shatavari-bio', 'Shatavari bio 1000 mg', null, 'La plante ayurvédique de la femme', 'Équilibre hormonal', 13000, 15000, true, true, '/images/produits/shatavari-bio.webp', 'Poudre de Shatavari biologique 1000 mg - 60 gélules.', 'Le Shatavari est une plante traditionnelle de la médecine ayurvédique, utilisée depuis des siècles pour accompagner le bien-être féminin. Cette formule à base de poudre de Shatavari biologique ne contient ni charges ni liants.', array['Shatavari issu de l''agriculture biologique', 'Plante traditionnelle ayurvédique', 'Sans charges, sans liants, sans gluten']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Poudre de Shatavari biologique 1000 mg. 60 gélules.', 60),
  ('ashwagandha-2100', 'Ashwagandha 2100 mg', 'France FshGrace', 'Apaiser le stress qui dérègle le cycle', 'Équilibre hormonal', 15000, 20000, false, true, '/images/produits/ashwagandha-2100.webp', 'Ashwagandha 2100 mg avec extrait de poivre noir - 100 gélules végétales.', 'Plante adaptogène de référence, l''ashwagandha aide le corps à faire face au stress du quotidien. Le stress chronique pèse sur l''équilibre hormonal : cette formule concentrée, associée au poivre noir pour l''absorption, accompagne un retour au calme.', array['Aide à réduire le stress', 'Soutient le système immunitaire', 'Contribue à une humeur positive', 'Concentration maximale, avec poivre noir']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Ashwagandha 2100 mg, extrait de poivre noir. 100 gélules végétales.', 70),
  ('dhea', 'DHEA', 'Havasu Nutrition', 'Équilibre hormonal et énergie', 'Équilibre hormonal', 13000, 15000, false, true, '/images/produits/dhea.webp', 'DHEA en gélules - 60 gélules.', 'La DHEA est une hormone naturellement produite par les glandes surrénales, dont le taux diminue avec l''âge. Cette formule accompagne l''équilibre hormonal et le niveau d''énergie. S''agissant d''une hormone, elle doit être prise sur avis médical.', array['Soutient l''équilibre hormonal', 'Soutient le niveau d''énergie']::text[], 'À prendre uniquement sur avis médical, selon la posologie indiquée sur le flacon. Déconseillé pendant la grossesse et l''allaitement.', 'DHEA (déhydroépiandrostérone). 60 gélules.', 80),
  ('thyroid-support', 'Thyroid Support', 'France FshGrace', 'Accompagner une thyroïde en forme', 'Équilibre hormonal', 13000, 15000, false, true, '/images/produits/thyroid-support.webp', 'Formule avancée de soutien thyroïdien - 60 gélules végétales.', 'La thyroïde orchestre l''énergie, le métabolisme et une partie de l''équilibre hormonal. Cette formule avancée réunit des nutriments sélectionnés pour accompagner son bon fonctionnement.', array['Formule avancée de soutien thyroïdien', 'Soutient l''énergie et la concentration', 'Gélules vegan']::text[], 'Suivez la posologie indiquée sur le flacon. Si vous suivez un traitement pour la thyroïde, demandez l''avis de votre médecin avant de le prendre.', 'Voir la composition détaillée sur le flacon. 60 gélules vegan.', 90),
  ('maca-7-en-1', 'Maca 7 en 1', null, 'Vitalité et équilibre, 7 plantes en une', 'Équilibre hormonal', 13000, 15000, false, true, '/images/produits/maca-7-en-1.webp', 'Maca, ginseng, ashwagandha, tribulus et autres plantes - 60 gélules.', 'Une formule extra-forte qui réunit 7 ingrédients naturels autour de la racine de maca, plante des hauts plateaux andins traditionnellement utilisée pour la vitalité et la libido.', array['7 ingrédients naturels', 'Formule extra-forte', 'Racines de maca, de ginseng et d''ashwagandha']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Racine de maca, racine de ginseng, racine d''ashwagandha, Tribulus terrestris et autres plantes (7 au total). 60 gélules.', 100),
  ('probiotiques-menopause', 'Probiotiques Ménopause', null, 'Un microbiote soutenu à chaque étape', 'Ménopause', 13000, 15000, false, true, '/images/produits/probiotiques-menopause.webp', '40 milliards d''UFC + prébiotiques - 60 gélules.', 'Pensés pour les femmes en périménopause et ménopause, ces probiotiques de haute pureté associent 40 milliards d''UFC à des prébiotiques pour soutenir la digestion et la santé intestinale. Pas besoin de réfrigération.', array['Accompagne toutes les étapes de la ménopause', 'Favorise la digestion et la santé intestinale', '40 milliards d''UFC + prébiotiques', 'Conservation sans réfrigération']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Souches probiotiques (40 milliards d''UFC), prébiotiques. 60 gélules.', 110),
  ('probiotiques-femme', 'Probiotiques Femme', 'France FshGrace', 'Équilibre intime et digestif', 'Bien-être global', 13000, 15000, false, true, '/images/produits/probiotiques-femme.webp', '50 milliards d''UFC, 16 souches, prébiotiques et canneberge - 60 gélules.', 'Une formule complète pour la femme : 16 souches probiotiques, des prébiotiques et de la canneberge pour accompagner à la fois l''équilibre digestif, l''immunité et la santé vaginale et urinaire.', array['Favorise un transit régulier', 'Soutient le système immunitaire', 'Contribue à la santé vaginale et urinaire', '16 souches, 50 milliards d''UFC par prise']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', '16 souches probiotiques (50 milliards d''UFC par prise), prébiotiques, canneberge. 60 gélules.', 120),
  ('multivitamines-femme', 'Multivitamines Femme', 'France FshGrace', 'L''essentiel du quotidien, en une gélule', 'Bien-être global', 13000, 15000, false, true, '/images/produits/multivitamines-femme.webp', '20 vitamines et minéraux - 60 gélules, 30 jours.', 'Une formule tout-en-un qui réunit 20 vitamines et minéraux pour accompagner l''énergie, la concentration et l''humeur, ainsi que la beauté des cheveux, de la peau et des ongles.', array['20 vitamines et minéraux', 'Énergie, concentration et humeur', 'Cheveux, peau et ongles', 'Sans OGM, sans gluten, sans lactose, sans soja']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', '20 vitamines et minéraux. 60 gélules.', 130),
  ('omega-3-huile-de-poisson', 'Oméga-3 huile de poisson', 'France FshGrace', 'Les bonnes graisses pour le cœur et le cerveau', 'Bien-être global', 15000, 20000, false, true, '/images/produits/omega-3-huile-de-poisson.webp', '1200 mg d''EPA + 900 mg de DHA - 120 capsules molles.', 'Une huile de poisson triple concentration et haute pureté, riche en EPA et DHA. Les oméga-3 sont des acides gras essentiels que le corps ne sait pas fabriquer seul.', array['Santé du cerveau et du cœur', '1200 mg d''EPA + 900 mg de DHA', 'Triple concentration, haute pureté']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Huile de poisson (EPA 1200 mg, DHA 900 mg). 120 capsules molles.', 140),
  ('magnesium-complex', 'Magnesium Complex', 'Toplux Nutrition', '8 formes de magnésium, absorption maximale', 'Bien-être global', 13000, 17000, false, true, '/images/produits/magnesium-complex.webp', '8 formes de magnésium élémentaire, 1000 mg - 90 gélules.', 'Le magnésium intervient dans des centaines de réactions de l''organisme, de la détente musculaire à la gestion de la fatigue. Ce complexe réunit 8 formes de magnésium pour une absorption maximale.', array['Soutient les os et les muscles', 'Contribue au bien-être général', '8 formes de magnésium, 1000 mg', 'Sans OGM']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Magnésium élémentaire sous 8 formes, 1000 mg par prise. 90 gélules (45 jours).', 150),
  ('magnesium-triple-complexe', 'Magnésium Triple Complexe', null, 'Malate, citrate et glycinate', 'Bien-être global', 13000, 15000, false, true, '/images/produits/magnesium-triple-complexe.webp', 'Magnésium 300 mg sous 3 formes - 90 gélules végétales.', 'Trois formes de magnésium bien assimilées - malate, citrate et glycinate - réunies dans une gélule végétale haute absorption.', array['3 formes complémentaires de magnésium', 'Haute absorption', 'Sans OGM']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Magnésium 300 mg (malate, citrate, glycinate). 90 gélules végétales.', 160),
  ('calcium-magnesium-zinc', 'Calcium, Magnésium & Zinc', 'France FshGrace', 'Le trio des os et des nerfs', 'Bien-être global', 15000, 20000, false, true, '/images/produits/calcium-magnesium-zinc.webp', 'Calcium, magnésium et zinc - 100 gélules végétariennes.', 'Trois minéraux essentiels réunis pour accompagner la solidité des os et le bon fonctionnement du système nerveux. Formule végétarienne.', array['Santé des os', 'Fonctionnement du système nerveux', 'Végétarien']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Calcium, magnésium, zinc. 100 gélules végétariennes.', 170),
  ('ginkgo-biloba', 'Ginkgo Biloba', 'France FshGrace', 'Mémoire et concentration', 'Bien-être global', 15000, 20000, false, true, '/images/produits/ginkgo-biloba.webp', 'Ginkgo biloba extra-fort - 120 gélules végétariennes.', 'Le ginkgo biloba est l''un des plus anciens arbres de la planète. Ses feuilles sont traditionnellement utilisées pour accompagner la mémoire et la circulation.', array['Formule extra-forte', 'Sans OGM, sans gluten, sans soja']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Extrait de feuilles de Ginkgo biloba. 120 gélules végétariennes.', 180),
  ('serrapeptase', 'Serrapeptase 40 000 SPU', null, 'L''enzyme en gélule gastro-résistante', 'Bien-être global', 13000, 15000, false, true, '/images/produits/serrapeptase.webp', '40 000 SPU par gélule, gélules DRcaps - 60 gélules.', 'La serrapeptase est une enzyme protéolytique. Elle est présentée dans des gélules DRcaps® résistantes à l''acidité de l''estomac, pour être libérée plus loin dans le tube digestif.', array['40 000 SPU par gélule', 'Gélules gastro-résistantes DRcaps®', 'Sans OGM']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé si vous prenez des anticoagulants, en cas de grossesse ou d''allaitement.', 'Serrapeptase 40 000 SPU. 60 gélules DRcaps®.', 190),
  ('l-carnitine-1000', 'L-Carnitine 1000 mg', null, 'Un allié de votre démarche minceur', 'Bien-être global', 13000, 15000, false, true, '/images/produits/l-carnitine-1000.webp', 'L-carnitine 1000 mg - 60 gélules végétales.', 'La L-carnitine participe au transport des graisses vers les cellules, où elles sont utilisées pour produire de l''énergie. Elle accompagne une démarche de perte de poids, en complément d''une alimentation équilibrée et d''une activité physique.', array['Accompagne une démarche de perte de poids', 'Concentration maximale, 1000 mg', 'Formule 100 % pure']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'L-carnitine 1000 mg. 60 gélules végétales.', 200),
  ('shilajit-8-en-1', 'Shilajit 8 en 1', null, 'Énergie et vitalité, 8 actifs réunis', 'Bien-être global', 13000, 15000, false, true, '/images/produits/shilajit-8-en-1.webp', 'Shilajit, ashwagandha, rhodiola, ginseng et plus - 60 gélules végétales.', 'Une formule extra-forte qui associe le shilajit, résine minérale de l''Himalaya, à des plantes adaptogènes reconnues : ashwagandha, rhodiola rosea et ginseng panax.', array['8 actifs en une seule formule', 'Formule extra-forte - 15 250 mg par prise', 'Gélules végétales']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Shilajit, ashwagandha, rhodiola rosea, ginseng panax et 4 autres actifs (15 250 mg par prise). 60 gélules végétales.', 210),
  ('conception-for-him', 'Conception For Him', null, 'La fertilité se construit à deux', 'Bien-être masculin', 13000, 15000, false, true, '/images/produits/conception-for-him.webp', 'Complément fertilité homme - 60 gélules végétariennes.', 'Parce qu''un projet de conception concerne aussi les hommes, Conception For Him est formulé pour soutenir la fertilité masculine, notamment le nombre et la mobilité des spermatozoïdes.', array['Complément dédié à la fertilité masculine', 'Soutient le nombre et la mobilité des spermatozoïdes', 'Gélules végétariennes']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Voir la composition détaillée sur le flacon. 60 gélules végétariennes.', 220),
  ('black-maca-20000', 'Maca noire 20 000 mg', 'France FshGrace', 'Force, énergie et endurance', 'Bien-être masculin', 15000, 20000, false, true, '/images/produits/black-maca-20000.webp', 'Équivalent 20 000 mg de maca noire par gélule - 180 gélules végétales.', 'La maca noire est la variété de maca traditionnellement associée à la vitalité masculine. Cette formule concentrée accompagne l''énergie, l''endurance et l''humeur.', array['Soutient la vitalité masculine', 'Énergie, endurance et humeur', 'Maca noire pure et concentrée']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Extrait de maca noire (équivalent 20 000 mg par gélule). 180 gélules végétales.', 230),
  ('serum-visage-5-en-1', 'Sérum visage 5 en 1', 'Bestcus', 'Rides et taches, un seul geste', 'Beauté', 0, null, false, true, '/images/produits/serum-visage-5-en-1.webp', 'Acide hyaluronique, niacinamide, vitamines C et E, collagène.', 'Un sérum professionnel qui réunit cinq actifs pour la peau : acide hyaluronique pour l''hydratation, niacinamide et vitamine C pour l''éclat et les taches, vitamine E et collagène pour la souplesse.', array['Aide à atténuer les rides', 'Aide à atténuer les taches brunes', '5 actifs dans un seul sérum']::text[], 'Appliquez quelques gouttes sur la peau propre, matin et/ou soir. Faites un test sur une petite zone avant la première utilisation et appliquez une protection solaire en journée.', 'Acide hyaluronique 10 %, niacinamide 5 %, vitamine C 30 %, vitamine E 10 %, collagène 5 %.', 240),
  ('the-feuilles-framboisier', 'Thé de feuilles de framboisier', null, 'Une tisane traditionnelle du bien-être féminin', 'Fertilité', 0, null, false, true, null, 'Feuilles de framboisier à infuser.', 'La feuille de framboisier est une plante traditionnellement utilisée en infusion par les femmes, autour du cycle et en fin de grossesse. Elle se prépare comme une tisane classique, à savourer chaude ou froide.', array['Plante traditionnelle du bien-être féminin', 'Se prépare en infusion']::text[], 'Préparez en infusion selon les indications de l''emballage. Pendant la grossesse, ne l''utilisez que sur avis de votre sage-femme ou de votre médecin, en particulier avant le troisième trimestre.', 'Feuilles de framboisier. Voir l''emballage pour le détail.', 250),
  ('tisane-fibromes', 'Tisane fibromes', null, 'Une infusion de plantes, en complément de votre suivi', 'Équilibre hormonal', 0, null, false, true, null, 'Mélange de plantes à infuser.', 'Une infusion de plantes proposée aux femmes concernées par les fibromes utérins, à intégrer à une routine bien-être. Elle accompagne votre suivi gynécologique et ne remplace en aucun cas un avis ou un traitement médical.', array['Mélange de plantes en infusion', 'À intégrer à une routine bien-être']::text[], 'Préparez en infusion selon les indications de l''emballage. Parlez-en à votre gynécologue, surtout en cas de grossesse, de saignements importants ou de traitement en cours.', 'Voir la composition sur l''emballage.', 260),
  ('libido-booster-femme', 'Libido Booster Femme', null, 'Désir et vitalité au féminin', 'Équilibre hormonal', 0, null, false, true, null, 'Complément dédié au bien-être intime féminin.', 'Le désir varie avec le cycle, le stress et la fatigue. Ce complément est pensé pour accompagner la vitalité et le bien-être intime des femmes.', array['Dédié au bien-être intime féminin', 'Accompagne la vitalité']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Voir la composition sur le flacon.', 270),
  ('shatavari-poudre-227g', 'Shatavari bio en poudre 227 g', null, 'La plante ayurvédique de la femme, en poudre', 'Équilibre hormonal', 0, null, false, true, null, 'Poudre de Shatavari biologique - 227 g.', 'La même plante ayurvédique que nos gélules de Shatavari, en poudre biologique. À mélanger dans une boisson, un smoothie ou un yaourt, pour un dosage modulable.', array['Shatavari issu de l''agriculture biologique', 'Format poudre, dosage modulable', 'Sachet de 227 g']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Poudre de racine de Shatavari biologique. 227 g.', 280),
  ('magnesium-bisglycinate', 'Magnésium bisglycinate', null, 'La forme de magnésium la plus douce', 'Bien-être global', 15000, 20000, false, true, null, 'Magnésium sous forme bisglycinate - 180 gélules.', 'Le bisglycinate est l''une des formes de magnésium les mieux tolérées par l''estomac. Le magnésium contribue au fonctionnement normal du système nerveux et à la réduction de la fatigue.', array['Forme bisglycinate, douce pour l''estomac', 'Contribue à réduire la fatigue', '180 gélules']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Magnésium (bisglycinate). 180 gélules.', 290),
  ('vitamine-b-complex-plus', 'Vitamin B Complex Plus', null, 'Toutes les vitamines B, pour l''énergie', 'Bien-être global', 15000, 20000, false, true, null, 'Complexe de vitamines B - 120 gélules vegan.', 'Les vitamines du groupe B travaillent ensemble pour transformer les aliments en énergie et soutenir le système nerveux. Une formule complète en gélules vegan.', array['Toutes les vitamines du groupe B', 'Contribue à réduire la fatigue', '120 gélules vegan']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Vitamines du groupe B. 120 gélules vegan.', 300),
  ('vitamine-k2-d3', 'Vitamine K2 + D3', null, 'Le duo des os et de l''immunité', 'Bien-être global', 15000, 20000, false, true, null, 'Vitamines D3 et K2 - 120 gélules vegan.', 'La vitamine D contribue au maintien d''une ossature normale et au fonctionnement normal du système immunitaire. Associée à la vitamine K2, elle aide le calcium à se fixer là où le corps en a besoin.', array['Contribue au maintien d''os normaux', 'Soutient le système immunitaire', '120 gélules vegan']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Vitamine D3, vitamine K2. 120 gélules vegan.', 310),
  ('vitamine-e', 'Vitamine E', null, 'L''antioxydant de la peau et des cellules', 'Bien-être global', 13000, 15000, false, true, null, 'Vitamine E.', 'La vitamine E contribue à protéger les cellules contre le stress oxydatif. Elle est aussi appréciée pour accompagner la beauté de la peau.', array['Action antioxydante', 'Contribue à protéger les cellules']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'Vitamine E. Voir le détail sur le flacon.', 320),
  ('saw-palmetto', 'Saw Palmetto', null, 'Prostate, confort urinaire et cheveux', 'Bien-être masculin', 15000, 20000, false, true, null, 'Palmier nain (saw palmetto) - 100 gélules vegan.', 'Le palmier nain, ou saw palmetto, est une plante traditionnellement utilisée pour le confort urinaire et la prostate chez l''homme, ainsi que pour la santé des cheveux.', array['Confort urinaire et prostate', 'Santé des cheveux', '100 gélules vegan']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un médecin si vous suivez un traitement hormonal ou un traitement pour la prostate.', 'Extrait de baies de palmier nain (Serenoa repens). 100 gélules vegan.', 330),
  ('l-glutamine', 'L-Glutamine', null, 'L''acide aminé de la récupération', 'Bien-être global', 0, null, false, true, null, 'L-glutamine.', 'La L-glutamine est l''acide aminé le plus abondant du corps. Elle est souvent utilisée par les sportifs, en particulier pendant les périodes d''effort intense.', array['Acide aminé libre', 'Souvent utilisée par les sportifs']::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'L-glutamine. Voir le détail sur le flacon.', 340),
  ('bestcus', 'Bestcus (à compléter)', 'Bestcus', 'À compléter', 'Beauté', 0, null, false, false, null, 'Fiche à compléter : nom exact du produit, description et photo.', 'Fiche à compléter : nom exact du produit, description et photo.', '{}'::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'À compléter.', 350),
  ('thorne', 'Thorne (à compléter)', 'Thorne', 'À compléter', 'Bien-être global', 13000, 15000, false, false, null, 'Fiche à compléter : quel produit Thorne ? Description et photo.', 'Fiche à compléter : quel produit Thorne ? Description et photo.', '{}'::text[], 'Suivez la posologie indiquée sur le flacon. Demandez l''avis d''un professionnel de santé en cas de grossesse, d''allaitement ou de traitement en cours.', 'À compléter.', 360),
  ('acide-borique', 'Acide borique (à compléter)', null, 'À compléter', 'Bien-être global', 8000, null, false, false, null, 'Fiche à compléter : forme (ovules, poudre...) et mode d''emploi.', 'Fiche à compléter : précisez la forme du produit (ovules, poudre...) et son mode d''emploi exact avant de l''afficher. L''acide borique est toxique s''il est avalé : la fiche doit le dire clairement.', '{}'::text[], 'À compléter.', 'À compléter.', 370)
on conflict (slug) do nothing;

-- -------------------------------------------------------- Stock de départ
-- Quantités de la liste du 19/11/2026. ATTENTION : relancer ce bloc remet
-- le stock à ces valeurs.
insert into public.stock (product_slug, quantity) values
  ('the-feuilles-framboisier', 10),
  ('tisane-fibromes', 10),
  ('libido-booster-femme', 4),
  ('probiotiques-femme', 11),
  ('shatavari-poudre-227g', 4),
  ('l-carnitine-1000', 7),
  ('berberine-plus', 10),
  ('magnesium-bisglycinate', 7),
  ('serrapeptase', 7),
  ('bestcus', 3),
  ('serum-visage-5-en-1', 2),
  ('dim-bioperine', 8),
  ('vitamine-b-complex-plus', 15),
  ('thorne', 9),
  ('acide-borique', 5),
  ('shilajit-8-en-1', 3),
  ('thyroid-support', 4),
  ('acide-folique-b12', 3),
  ('ginkgo-biloba', 5),
  ('maca-7-en-1', 4),
  ('vitamine-e', 2),
  ('dhea', 4),
  ('ashwagandha-2100', 2),
  ('probiotiques-menopause', 2),
  ('nac-500', 7),
  ('saw-palmetto', 2),
  ('magnesium-complex', 9),
  ('conception-for-him', 8),
  ('magnesium-triple-complexe', 2),
  ('vitamine-k2-d3', 5),
  ('shatavari-bio', 6),
  ('black-maca-20000', 6),
  ('omega-3-huile-de-poisson', 1),
  ('l-glutamine', 0),
  ('calcium-magnesium-zinc', 1),
  ('coq10-400', 1),
  ('multivitamines-femme', 1)
on conflict (product_slug) do update set quantity = excluded.quantity, updated_at = now();
