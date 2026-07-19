import { Link } from "react-router-dom";
import { Mail, Leaf } from "lucide-react";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="h-6 w-6 text-gold-400" strokeWidth={1.5} />
              <span className="font-serif text-xl text-cream-50">Jardin Secret</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-forest-200">
              Des compléments alimentaires pensés en Côte d'Ivoire pour
              accompagner l'équilibre hormonal, la fertilité et le bien-être
              des femmes et des hommes — avec la science, mais aussi avec le
              cœur.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-forest-700 p-2 text-cream-100 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-forest-700 p-2 text-cream-100 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                <FacebookIcon />
              </a>
              <a
                href="mailto:contact@jardinsecret.ci"
                aria-label="Email"
                className="rounded-full border border-forest-700 p-2 text-cream-100 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-sm uppercase tracking-widest text-gold-400">
              Boutique
            </h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li><Link to="/boutique" className="hover:text-cream-50">Tous les produits</Link></li>
              <li><Link to="/boutique?categorie=SOPK" className="hover:text-cream-50">SOPK</Link></li>
              <li><Link to="/boutique?categorie=Fertilité" className="hover:text-cream-50">Fertilité</Link></li>
              <li><Link to="/boutique?categorie=Équilibre hormonal" className="hover:text-cream-50">Équilibre hormonal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-sm uppercase tracking-widest text-gold-400">
              Jardin Secret
            </h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li><Link to="/notre-histoire" className="hover:text-cream-50">Notre histoire</Link></li>
              <li><Link to="/sopk" className="hover:text-cream-50">Comprendre le SOPK</Link></li>
              <li><Link to="/contact" className="hover:text-cream-50">Contact &amp; support</Link></li>
              <li><span>Cocody, Abidjan, Côte d'Ivoire</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-forest-800 pt-8 text-xs text-forest-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Jardin Secret. Tous droits réservés.</p>
          <p>Conçu avec soin à Abidjan, pour le monde entier.</p>
        </div>

        <div className="mt-4 border-t border-forest-800 pt-4 text-center text-xs text-forest-500">
          <p>
            Site réalisé par{" "}
            <span className="font-medium text-gold-400">Mexiale Studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
