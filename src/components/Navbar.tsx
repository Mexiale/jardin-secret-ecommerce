import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, ShoppingBag, X, Leaf } from "lucide-react";
import { useCart } from "../context/CartContext";

const navLinks = [
  { to: "/boutique", label: "Boutique" },
  { to: "/sopk", label: "Le SOPK" },
  { to: "/notre-histoire", label: "Notre Histoire" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-forest-200/60 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Leaf className="h-6 w-6 text-forest-600" strokeWidth={1.5} />
          <span className="font-serif text-xl tracking-wide text-forest-900">
            Jardin Secret
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[15px] tracking-wide transition-colors hover:text-forest-700 ${
                  isActive ? "text-forest-900 font-medium" : "text-forest-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Rechercher"
            className="hidden text-forest-700 transition-colors hover:text-forest-900 sm:block"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link
            to="/panier"
            aria-label="Panier"
            className="relative text-forest-700 transition-colors hover:text-forest-900"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-medium text-forest-950">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="text-forest-700 lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-forest-200/60 bg-cream-50 px-6 py-4 lg:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-forest-800 hover:bg-forest-100"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
