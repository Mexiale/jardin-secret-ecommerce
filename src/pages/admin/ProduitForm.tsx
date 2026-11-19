import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminHeader from "../../components/admin/AdminHeader";
import ProductImage from "../../components/ProductImage";
import { useSupabaseSession } from "../../lib/useSupabaseSession";
import { useProducts } from "../../context/ProductsContext";
import { useStock } from "../../context/StockContext";
import { fetchAllStock, updateStock } from "../../lib/stock";
import {
  createProduct,
  deleteProduct,
  fetchProductForAdmin,
  slugify,
  updateProduct,
  uploadProductImage,
} from "../../lib/products";
import { CATEGORIES, type Category, type Product } from "../../data/products";

const POSOLOGIE_DEFAUT =
  "Suivez la posologie indiquée sur le flacon. Demandez l'avis d'un professionnel de santé en cas de grossesse, d'allaitement ou de traitement en cours.";

/** Les champs du formulaire sont tous des chaînes, convertis à l'enregistrement. */
type Draft = {
  name: string;
  slug: string;
  brand: string;
  category: Category;
  tagline: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  active: boolean;
  featured: boolean;
  image: string;
  shortDescription: string;
  description: string;
  benefits: string;
  usage: string;
  ingredients: string;
};

const VIDE: Draft = {
  name: "",
  slug: "",
  brand: "",
  category: "Bien-être global",
  tagline: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  active: true,
  featured: false,
  image: "",
  shortDescription: "",
  description: "",
  benefits: "",
  usage: POSOLOGIE_DEFAUT,
  ingredients: "",
};

function toDraft(p: Product, qty: number | undefined): Draft {
  return {
    name: p.name,
    slug: p.slug,
    brand: p.brand ?? "",
    category: p.category,
    tagline: p.tagline,
    price: p.price > 0 ? String(p.price) : "",
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
    stock: qty === undefined ? "" : String(qty),
    active: p.active,
    featured: !!p.featured,
    image: p.image,
    shortDescription: p.shortDescription,
    description: p.description,
    benefits: p.benefits.join("\n"),
    usage: p.usage,
    ingredients: p.ingredients,
  };
}

/** "15 000" ou "15000" -> 15000 ; vide -> null ; invalide -> NaN */
function parseMontant(value: string): number | null {
  const v = value.replace(/[\s.]/g, "");
  if (!v) return null;
  return /^\d+$/.test(v) ? Number(v) : NaN;
}

export default function ProduitForm() {
  const { slug: slugParam } = useParams();
  const isNew = !slugParam;
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSupabaseSession();
  const { refresh: refreshCatalog } = useProducts();
  const { refresh: refreshStock } = useStock();

  const [draft, setDraft] = useState<Draft>(VIDE);
  const [slugTouched, setSlugTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session || isNew || !slugParam) return;
    Promise.all([fetchProductForAdmin(slugParam), fetchAllStock()])
      .then(([p, s]) => {
        if (!p) {
          setError("Produit introuvable.");
          return;
        }
        setDraft(toDraft(p, s[p.slug]));
      })
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [session, isNew, slugParam]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "name" && isNew && !slugTouched) next.slug = slugify(String(value));
      return next;
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const price = parseMontant(draft.price) ?? 0;
    const compare = parseMontant(draft.compareAtPrice);
    const stockQty = draft.stock.trim() === "" ? null : Number(draft.stock);
    const slug = isNew ? slugify(draft.slug || draft.name) : draft.slug;

    if (!draft.name.trim()) return setError("Le nom est obligatoire.");
    if (!slug) return setError("L'identifiant (lien) est obligatoire.");
    if (Number.isNaN(price)) return setError("Le prix doit être un nombre, par exemple 13000.");
    if (Number.isNaN(compare)) return setError("Le prix barré doit être un nombre, par exemple 15000.");
    if (compare !== null && price > 0 && compare <= price)
      return setError("Le prix barré doit être plus élevé que le prix de vente.");
    if (stockQty !== null && (!Number.isInteger(stockQty) || stockQty < 0))
      return setError("Le stock doit être un nombre entier positif.");

    setSaving(true);
    try {
      let image = draft.image;
      if (file) image = await uploadProductImage(slug, file);

      const product: Product = {
        slug,
        name: draft.name,
        brand: draft.brand || undefined,
        category: draft.category,
        tagline: draft.tagline,
        price,
        compareAtPrice: compare ?? undefined,
        active: draft.active,
        featured: draft.featured,
        image,
        shortDescription: draft.shortDescription,
        description: draft.description,
        benefits: draft.benefits.split("\n"),
        usage: draft.usage,
        ingredients: draft.ingredients,
      };

      if (isNew) await createProduct(product);
      else await updateProduct(product);
      if (stockQty !== null) await updateStock(slug, stockQty);

      await Promise.all([refreshCatalog(), refreshStock()]);
      navigate("/admin/produits");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Supprimer définitivement « ${draft.name} » ? Cette action est irréversible.\n\nPour simplement le retirer de la boutique, décochez plutôt « Visible dans la boutique ».`
      )
    )
      return;
    setSaving(true);
    try {
      await deleteProduct(draft.slug);
      await refreshCatalog();
      navigate("/admin/produits");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  if (sessionLoading) return null;
  if (!session) return <AdminLogin />;

  const imageAffichee = preview || draft.image;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <AdminHeader />

      <Link
        to="/admin/produits"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" /> Tous les produits
      </Link>

      <h1 className="mb-8 font-serif text-2xl text-forest-950">
        {isNew ? "Nouveau produit" : draft.name || "Modifier le produit"}
      </h1>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-forest-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Photo */}
          <Section titre="Photo">
            <div className="flex flex-wrap items-start gap-6">
              <ProductImage
                src={imageAffichee}
                alt={draft.name || "Produit"}
                className="h-40 w-40 rounded-2xl object-cover ring-1 ring-forest-200"
              />
              <div className="space-y-3 text-sm">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-forest-300 px-4 py-2 font-medium text-forest-800 hover:border-forest-500"
                >
                  <ImagePlus className="h-4 w-4" /> {imageAffichee ? "Changer la photo" : "Ajouter une photo"}
                </button>
                {imageAffichee && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      set("image", "");
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                    className="flex items-center gap-1.5 text-forest-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" /> Retirer la photo
                  </button>
                )}
                <p className="max-w-xs text-xs text-forest-500">
                  Idéalement une photo carrée sur fond uni. Elle est automatiquement réduite et
                  convertie en WebP (légère sur mobile) lors de l'enregistrement.
                </p>
              </div>
            </div>
          </Section>

          {/* Infos */}
          <Section titre="Informations">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Nom du produit *">
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className={inputCls}
                />
              </Champ>
              <Champ label="Marque">
                <input value={draft.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} />
              </Champ>
              <Champ label="Catégorie *">
                <select
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value as Category)}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Champ>
              <Champ
                label="Identifiant (lien de la page)"
                aide={
                  isNew
                    ? `jardinsecret.../produits/${slugify(draft.slug || draft.name) || "..."}`
                    : "Ne peut plus être modifié (utilisé par le stock, les avis et les commandes)."
                }
              >
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  disabled={!isNew}
                  className={`${inputCls} disabled:bg-forest-100/60 disabled:text-forest-500`}
                />
              </Champ>
              <div className="sm:col-span-2">
                <Champ label="Accroche" aide="Une phrase courte affichée sous le nom.">
                  <input value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
                </Champ>
              </div>
            </div>
          </Section>

          {/* Prix & stock */}
          <Section titre="Prix et stock">
            <div className="grid gap-4 sm:grid-cols-3">
              <Champ label="Prix de vente (FCFA)" aide="Vide = « Prix bientôt disponible »">
                <input
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="13000"
                  className={inputCls}
                />
              </Champ>
              <Champ label="Prix barré (FCFA)" aide="Optionnel, plus élevé que le prix de vente">
                <input
                  inputMode="numeric"
                  value={draft.compareAtPrice}
                  onChange={(e) => set("compareAtPrice", e.target.value)}
                  placeholder="15000"
                  className={inputCls}
                />
              </Champ>
              <Champ label="Quantité en stock" aide="Vide = non suivi (toujours disponible)">
                <input
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className={inputCls}
                />
              </Champ>
            </div>
            <div className="mt-5 flex flex-wrap gap-6 text-sm text-forest-800">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4 accent-forest-700"
                />
                Visible dans la boutique
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4 accent-forest-700"
                />
                Mis en avant sur l'accueil
              </label>
            </div>
          </Section>

          {/* Description */}
          <Section titre="Description">
            <div className="space-y-4">
              <Champ label="Résumé" aide="Format et contenance, ex. « Berbérine pure - 60 gélules ».">
                <input
                  value={draft.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  className={inputCls}
                />
              </Champ>
              <Champ label="Description">
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputCls}
                />
              </Champ>
              <Champ label="Bienfaits clés" aide="Un bienfait par ligne.">
                <textarea
                  rows={4}
                  value={draft.benefits}
                  onChange={(e) => set("benefits", e.target.value)}
                  className={inputCls}
                />
              </Champ>
              <Champ label="Utilisation conseillée">
                <textarea
                  rows={3}
                  value={draft.usage}
                  onChange={(e) => set("usage", e.target.value)}
                  className={inputCls}
                />
              </Champ>
              <Champ label="Ingrédients">
                <textarea
                  rows={2}
                  value={draft.ingredients}
                  onChange={(e) => set("ingredients", e.target.value)}
                  className={inputCls}
                />
              </Champ>
            </div>
          </Section>

          {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-forest-200 pt-6">
            {!isNew ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-sm text-forest-500 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Supprimer le produit
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-medium text-cream-50 hover:bg-forest-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isNew ? "Créer le produit" : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-forest-200 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none";

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold-600">{titre}</h2>
      {children}
    </section>
  );
}

function Champ({ label, aide, children }: { label: string; aide?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-forest-800">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-xs text-forest-500">{aide}</span>}
    </label>
  );
}
