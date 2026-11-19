import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";

const links = [
  { to: "/admin/produits", label: "Produits" },
  { to: "/admin/avis", label: "Avis clients" },
  { to: "/admin/stock", label: "Stock" },
];

export default function AdminHeader() {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-forest-200 pb-6">
      <nav className="flex gap-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm font-medium ${
              location.pathname.startsWith(link.to)
                ? "text-forest-900"
                : "text-forest-500 hover:text-forest-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-900"
      >
        <LogOut className="h-4 w-4" /> Déconnexion
      </button>
    </div>
  );
}
