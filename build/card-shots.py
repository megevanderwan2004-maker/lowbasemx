#!/usr/bin/env python3
"""Normalise l'échelle des visuels de carte.

Les packshots viennent de sources différentes — rendus officiels Garmin,
photos de studio de trois marques de suppléments — et chacune cadre à sa
façon : le produit occupait de 55 % à 94 % de son fichier. Sur une rangée de
tuiles au même gabarit, ça se lit comme un défaut de fabrication, pas comme
une variation.

Ce script recadre chaque visuel sur son contenu réel puis le repose au
centre d'un carré, avec la MÊME réserve pour tous. Il ne touche pas aux
sources : il écrit un fichier `card.png` à côté, et c'est lui que
`catalog.js` désigne dans son champ `card`.

Lancé à la main (il demande Pillow, que le reste du dépôt n'utilise pas) :
    python3 build/card-shots.py
"""
from PIL import Image
import os, sys

FILL = 0.88          # part du carré occupée par le plus grand côté du produit
SIDE = 900           # côté du fichier produit

SOURCES = {
    "cirqa":            "cirqa/cirqa-packshot.png",
    # Le rendu « venu-4.png » est le bracelet CUIR BEIGE ; la fiche, elle,
    # ouvre sur le coloris Crema, blanc. La carte montrait donc un
    # beige que le client ne retrouvait pas en cliquant.
    "venu-4":           "venu-4/venu-4-crema.jpg",
    "venu-3s":          "venu-3s/venu-3s.png",
    "vivoactive-6":     "vivoactive-6/vivoactive-6.png",
    # Le sachet seul, et non le duo sachet + boite : une carte de 210px
    # ne peut pas montrer deux objets lisiblement.
    "creatina":         "creatina/creatina-sachet.png",
    "promix-relax":     "promix-relax/promix-relax.png",
    # Les sticks, pas la pochette de 28 dosis : c'est le format
    # d'entree, celui dont le dock annonce le prix.
    "absorption-sleep": "absorption-sleep/absorption-sleep.png",
    "promix-creatina":  "promix-creatina/promix-creatine-trio.png",
    # Image 3 de la galerie : le trio des trois parfums — mangue, pêche
    # blanche, orange. Le trio « debloat-trio.jpg » ne montrait que
    # l'orange, trois fois.
    "promix-debloat":   "promix-debloat/debloat-sobres.jpg",
    "banda-cirqa":      "banda-cirqa/banda-azul-frances.jpg",
}

ROOT = os.path.join(os.path.dirname(__file__), "..", "deploy", "media", "productos")

def content_box(im):
    """La boîte du produit. Deux cas, parce que les sources sont de deux
    natures : un PNG détouré donne sa boîte par son canal alpha ; un JPEG de
    studio, lui, n'a pas d'alpha — c'est l'écart au blanc des coins qui
    délimite le produit."""
    if im.mode in ("RGBA", "LA"):
        box = im.convert("RGBA").split()[3].getbbox()
        if box:
            return box, True
    rgb = im.convert("RGB")
    bg = rgb.getpixel((2, 2))
    from PIL import ImageChops
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, bg)).convert("L")
    return diff.point(lambda v: 255 if v > 14 else 0).getbbox(), False

def main():
    for handle, rel in SOURCES.items():
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            print("  MANQUANT", rel); continue
        im = Image.open(src)
        box, had_alpha = content_box(im)
        if not box:
            print("  VIDE", rel); continue

        im = im.convert("RGBA").crop(box)
        # Un JPEG sur fond blanc garde son fond : c'est `mix-blend-mode:
        # multiply`, côté CSS, qui le dissout sur la tuile. On ne détoure pas
        # ici — un détourage approximatif serait pire que pas de détourage.
        w, h = im.size
        side = int(round(max(w, h) / FILL))
        canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0) if had_alpha else (255, 255, 255, 255))
        canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
        canvas = canvas.resize((SIDE, SIDE), Image.LANCZOS)

        out = os.path.join(ROOT, handle, "card.png")
        canvas.save(out, optimize=True)
        pct = 100.0 * max(w, h) / side
        print("  %-18s %-42s -> card.png  (%.0f%% du cadre, alpha=%s)"
              % (handle, os.path.basename(rel), pct, "oui" if had_alpha else "non"))

if __name__ == "__main__":
    print("Normalisation des visuels de carte :")
    main()
