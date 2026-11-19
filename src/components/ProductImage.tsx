import { ImageOff } from "lucide-react";

/** Photo produit, ou un encart neutre « Photo à venir » si aucune image n'est renseignée. */
export default function ProductImage({
  src,
  alt,
  className = "",
  compact = false,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Vignette : icône seule, sans texte. */
  compact?: boolean;
}) {
  if (src) return <img src={src} alt={alt} className={className} loading="lazy" />;

  return (
    <div
      role="img"
      aria-label={`${alt} - photo à venir`}
      className={`flex flex-col items-center justify-center gap-2 bg-cream-100 text-forest-400 ${className}`}
    >
      <ImageOff className={compact ? "h-5 w-5" : "h-8 w-8"} strokeWidth={1.5} />
      {!compact && <span className="text-xs font-medium tracking-wide">Photo à venir</span>}
    </div>
  );
}
