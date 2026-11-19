"""
Détourage en lot des photos produits Jardin Secret.

Pour chaque photo (produit tenu dans la main) :
  1. Grounding DINO repère le produit (flacon, pot, boîte...) par une requête texte.
  2. SAM segmente uniquement le produit dans cette boîte -> la main et le décor disparaissent.
  3. Le produit est recentré sur un fond uni (crème de la marque par défaut)
     avec une ombre douce, au format carré, prêt pour la boutique.

Usage :
  .venv-images/Scripts/python scripts/detourer_produits.py
  .venv-images/Scripts/python scripts/detourer_produits.py --bg "#ffffff" --size 1200
  .venv-images/Scripts/python scripts/detourer_produits.py --transparent   # PNG sans fond
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageFilter
from scipy import ndimage
from transformers import (
    AutoModelForZeroShotObjectDetection,
    AutoProcessor,
    SamModel,
    SamProcessor,
)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_IN = ROOT / "public" / "Produits"
# Hors de public/ pour ne pas déployer les fichiers bruts ; les images finales
# (renommées, en WebP) vont dans public/images/produits/.
DEFAULT_OUT = ROOT / "scripts" / "detoures"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

PROMPT = "a supplement bottle. a jar. a box. a tube. a container."
DINO_ID = "IDEA-Research/grounding-dino-base"
SAM_ID = "facebook/sam-vit-large"


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


class Detoureur:
    def __init__(self, device: str):
        self.device = device
        print(f"Chargement des modèles ({device})…")
        self.dino_proc = AutoProcessor.from_pretrained(DINO_ID)
        self.dino = AutoModelForZeroShotObjectDetection.from_pretrained(DINO_ID).to(device).eval()
        self.sam_proc = SamProcessor.from_pretrained(SAM_ID)
        self.sam = SamModel.from_pretrained(SAM_ID).to(device).eval()

    @torch.inference_mode()
    def boite_produit(self, img: Image.Image) -> list[float] | None:
        inputs = self.dino_proc(images=img, text=PROMPT, return_tensors="pt").to(self.device)
        out = self.dino(**inputs)
        res = self.dino_proc.post_process_grounded_object_detection(
            out, inputs.input_ids, threshold=0.25, text_threshold=0.2,
            target_sizes=[img.size[::-1]],
        )[0]
        if len(res["boxes"]) == 0:
            return None
        boxes = res["boxes"].cpu().numpy()
        scores = res["scores"].cpu().numpy()
        # Score pondéré par la surface : on veut LE produit, pas l'étiquette ou le bouchon seuls.
        areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
        best = int(np.argmax(scores * np.sqrt(areas / areas.max())))
        return boxes[best].tolist()

    @torch.inference_mode()
    def masque(self, img: Image.Image, box: list[float]) -> np.ndarray:
        inputs = self.sam_proc(img, input_boxes=[[box]], return_tensors="pt").to(self.device)
        out = self.sam(**inputs, multimask_output=True)
        masks = self.sam_proc.image_processor.post_process_masks(
            out.pred_masks.cpu(), inputs["original_sizes"].cpu(), inputs["reshaped_input_sizes"].cpu()
        )[0][0]  # (3, H, W)
        scores = out.iou_scores.cpu()[0, 0]
        m = masks[int(scores.argmax())].numpy().astype(bool)
        return nettoyer(m, box)


def nettoyer(m: np.ndarray, box: list[float]) -> np.ndarray:
    """Garde la plus grosse composante, bouche les trous internes, reste dans la boîte."""
    x0, y0, x1, y1 = (int(round(v)) for v in box)
    pad = 6
    clip = np.zeros_like(m)
    clip[max(0, y0 - pad) : y1 + pad, max(0, x0 - pad) : x1 + pad] = True
    m = m & clip
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    if n > 1:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = lab == (int(np.argmax(sizes)) + 1)
    return ndimage.binary_fill_holes(m)


def composer(img: Image.Image, m: np.ndarray, size: int, bg: tuple[int, int, int] | None,
             marge: float) -> Image.Image:
    alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = img.convert("RGBA")
    rgba.putalpha(alpha)
    ys, xs = np.nonzero(m)
    produit = rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    cible = int(size * (1 - 2 * marge))
    ratio = min(cible / produit.width, cible / produit.height)
    produit = produit.resize((max(1, int(produit.width * ratio)), max(1, int(produit.height * ratio))),
                             Image.LANCZOS)
    x = (size - produit.width) // 2
    y = (size - produit.height) // 2 - int(size * 0.02)

    canvas = Image.new("RGBA", (size, size), (*bg, 255) if bg else (0, 0, 0, 0))
    if bg:
        # Ombre de contact douce sous le produit.
        ombre = Image.new("L", (size, size), 0)
        ow, oh = int(produit.width * 0.9), max(8, int(produit.width * 0.12))
        ox, oy = (size - ow) // 2, y + produit.height - oh // 2
        from PIL import ImageDraw
        ImageDraw.Draw(ombre).ellipse((ox, oy, ox + ow, oy + oh), fill=70)
        ombre = ombre.filter(ImageFilter.GaussianBlur(size * 0.015))
        canvas.paste(Image.new("RGBA", (size, size), (60, 45, 20, 255)), (0, 0), ombre)
    canvas.alpha_composite(produit, (x, y))
    return canvas


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", type=Path, default=DEFAULT_IN)
    ap.add_argument("--output", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--bg", default="#faf6ec", help="couleur de fond (hex), défaut : crème de la marque")
    ap.add_argument("--transparent", action="store_true", help="PNG transparent au lieu d'un fond uni")
    ap.add_argument("--size", type=int, default=1200, help="côté de l'image carrée en sortie")
    ap.add_argument("--marge", type=float, default=0.10, help="marge autour du produit (0-0.4)")
    ap.add_argument("--debug", type=Path, help="dossier où écrire les masques superposés pour contrôle")
    ap.add_argument("--reprendre", action="store_true", help="ignore les images déjà traitées")
    args = ap.parse_args()

    fichiers = sorted(p for p in args.input.iterdir() if p.suffix.lower() in EXTS)
    if not fichiers:
        raise SystemExit(f"Aucune image dans {args.input}")
    args.output.mkdir(parents=True, exist_ok=True)
    if args.debug:
        args.debug.mkdir(parents=True, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    d = Detoureur(device)
    bg = None if args.transparent else hex_to_rgb(args.bg)
    echecs = []

    ext = ".png" if args.transparent else ".jpg"
    if args.reprendre:
        fichiers = [f for f in fichiers if not (args.output / (f.stem + ext)).exists()]
        print(f"{len(fichiers)} image(s) restante(s)", flush=True)

    for i, f in enumerate(fichiers, 1):
        img = Image.open(f).convert("RGB")
        box = d.boite_produit(img)
        if box is None:
            print(f"[{i}/{len(fichiers)}] {f.name} : produit non détecté, ignoré")
            echecs.append(f.name)
            continue
        m = d.masque(img, box)
        res = composer(img, m, args.size, bg, args.marge)
        out = args.output / (f.stem + ext)
        if args.transparent:
            res.save(out, optimize=True)
        else:
            res.convert("RGB").save(out, quality=90, optimize=True, progressive=True)
        if args.debug:
            over = np.array(img).copy()
            over[~m] = (over[~m] * 0.3).astype(np.uint8)
            Image.fromarray(over).save(args.debug / f"{f.stem}.jpg", quality=80)
        print(f"[{i}/{len(fichiers)}] {f.name} -> {out.name}", flush=True)

    print(f"\nTerminé : {len(fichiers) - len(echecs)} images dans {args.output}")
    if echecs:
        print("À traiter à la main :", ", ".join(echecs))


if __name__ == "__main__":
    main()
