/* =========================================================================
   Empreinte de version sur les assets partagés

   Les pages appelaient `/styles.css` et `/app.js` sans rien d'autre. Les
   en-têtes disent pourtant `max-age=0, must-revalidate` — mais Safari iOS
   ressert volontiers sa copie d'une feuille de style sans repasser par le
   réseau, surtout dans un onglet resté ouvert ou une page ajoutée à l'écran
   d'accueil. Résultat : un déploiement peut être en ligne et parfaitement
   correct sans que le téléphone le voie jamais.

   Une URL différente est une autre entrée de cache : il suffit donc que
   l'adresse change quand le contenu change. C'est ce que fait ce script —
   il colle `?v=<empreinte>` sur chaque asset partagé, dans toutes les pages.

   Idempotent : relancé, il remplace l'empreinte au lieu de l'empiler.
   ========================================================================= */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEPLOY = path.join(__dirname, "..", "deploy");
/* Les fichiers dont une modification doit être vue tout de suite. Les médias
   n'y sont pas : leur nom change quand leur contenu change. */
const ASSETS = ["styles.css", "app.js", "catalog.js", "cart.js", "lenis.min.js"];

function empreinte(fichier) {
  const p = path.join(DEPLOY, fichier);
  if (!fs.existsSync(p)) return null;
  return crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex").slice(0, 8);
}

function pagesHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "media" ? [] : pagesHtml(p);
    return e.isFile() && e.name.endsWith(".html") ? [p] : [];
  });
}

const versions = {};
for (const a of ASSETS) {
  const v = empreinte(a);
  if (v) versions[a] = v;
}

let touchees = 0;
for (const page of pagesHtml(DEPLOY)) {
  const avant = fs.readFileSync(page, "utf8");
  let apres = avant;
  for (const [fichier, v] of Object.entries(versions)) {
    /* L'empreinte existante est capturée par le motif : on la remplace, on ne
       l'ajoute pas à la suite de la précédente. */
    const re = new RegExp("(/" + fichier.replace(/\./g, "\\.") + ")(\\?v=[0-9a-f]+)?", "g");
    apres = apres.replace(re, "$1?v=" + v);
  }
  if (apres !== avant) {
    fs.writeFileSync(page, apres);
    touchees++;
  }
}

console.log(
  "empreintes  " +
    Object.entries(versions).map(([f, v]) => f + "=" + v).join("  ")
);
console.log("estampillé  " + touchees + " page(s)");
