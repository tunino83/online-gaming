/**
 * Genera docs/anteprima-carte.html: tutte le carte personaggio, disegnate dai dati
 * con lo stesso stile dell'app (apps/web/src/giochi/primo-gioco/carte.css).
 * Uso: pnpm carte [skin]   (default: classica)
 *
 * Immagini: games/primo-gioco/immagini/<skin>/<id>.png (o .jpg, .jpeg, .webp); se la skin
 * non ha quel personaggio si usa la skin "classica", altrimenti un simbolo provvisorio.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { type PezzoCodice, pezziCodice, simboloProvvisorio, tipoCarta } from "../src/aspetto";
import { PERSONAGGI } from "../src/personaggi";
import type { Personaggio } from "../src/tipi-carte";

const CARTELLA_IMMAGINI = new URL("../immagini/", import.meta.url);
const FILE_USCITA = new URL(
  process.argv[2] && process.argv[2] !== "classica" ? `../../../docs/anteprima-carte-${process.argv[2]}.html` : "../../../docs/anteprima-carte.html",
  import.meta.url,
);
const STILE_CARTE = readFileSync(new URL("../../../apps/web/src/giochi/primo-gioco/carte.css", import.meta.url), "utf8");

const SKIN = process.argv[2] ?? "classica";

function immagine(p: Personaggio): string | null {
  for (const skin of [SKIN, "classica"]) {
    for (const est of ["png", "jpg", "jpeg", "webp"]) {
      if (existsSync(new URL(`${skin}/${p.id}.${est}`, CARTELLA_IMMAGINI))) return `../games/primo-gioco/immagini/${skin}/${p.id}.${est}`;
    }
  }
  return null;
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function pezzo(p: PezzoCodice): string {
  switch (p.tipo) {
    case "numero":
      return `<span class="tessera"><span>${esc(p.testo)}</span></span>`;
    case "generica":
      return `<span class="tessera generica"><span>${esc(p.testo)}</span></span>`;
    case "diamante":
      return `<span class="tessera diamante"><span>◆</span></span>`;
    case "nota":
      return `<span class="nota">${esc(p.testo)}</span>`;
    case "piu":
      return `<span class="segno">+</span>`;
    case "oppure":
      return `<span class="segno">o</span>`;
  }
}

/** Stessa struttura del componente CartaPersonaggioGrafica dell'app. */
function carta(p: Personaggio): string {
  const { colore, etichetta } = tipoCarta(p);
  const img = immagine(p);
  const pezzi = pezziCodice(p.codice);
  const arte = img
    ? `<img src="${img}" alt="${esc(p.nome)}">`
    : `<div class="segnaposto"><span class="simbolo" aria-hidden="true">${simboloProvvisorio(p)}</span><span class="nome">${esc(p.nome)}</span></div>`;
  return `
    <figure>
      <div class="carta ${colore}" style="--larghezza: 220px" title="${esc(p.nome)}">
        <span class="punti"><span>${p.punti}</span></span>
        <div class="cornice">
          <div class="arte">${arte}</div>
          <div class="codice ${pezzi.length >= 5 ? "lungo" : ""}">${pezzi.map(pezzo).join("")}</div>
          <span class="tipo">${esc(etichetta)}</span>
          ${p.poteri.length > 0 ? `<p class="testo-potere ${p.potereTesto.length > 90 ? "lungo" : ""}">${esc(p.potereTesto)}</p>` : ""}
        </div>
      </div>
      <figcaption><strong>${esc(p.nome)}</strong> · <code>${p.id}</code> · ${p.copie > 1 ? `${p.copie} copie` : "1 copia"}</figcaption>
    </figure>`;
}

const conImmagine = PERSONAGGI.filter((p) => immagine(p)).length;
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carte personaggio</title>
<style>
  body { margin: 0; padding: 24px 16px 48px; background: #f3efe6; color: #2b2620;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .intro { max-width: 1100px; margin: 0 auto 24px; }
  .intro h1 { font-family: Georgia, "Times New Roman", serif; margin: 0 0 6px; font-size: 28px; }
  .intro p { margin: 4px 0; color: #6d655a; font-size: 14px; }
  .griglia { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 28px 20px;
    max-width: 1100px; margin: 0 auto; justify-items: center; }
  figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  figcaption { font-size: 12px; color: #6d655a; text-align: center; }
${STILE_CARTE}
</style>
</head>
<body>
  <div class="intro">
    <h1>Carte personaggio</h1>
    <p>${PERSONAGGI.length} personaggi, ${PERSONAGGI.reduce((s, p) => s + p.copie, 0)} carte. Generata dai dati del gioco con <code>pnpm carte</code>, con lo stesso stile dell'app.</p>
    <p>Illustrazioni caricate: ${conImmagine} su ${PERSONAGGI.length}. Le altre mostrano un simbolo provvisorio e il nome.</p>
  </div>
  <main class="griglia">${PERSONAGGI.map(carta).join("")}
  </main>
</body>
</html>
`;

writeFileSync(FILE_USCITA, html);
console.log(`Anteprima scritta in docs/anteprima-carte.html (${conImmagine} immagini su ${PERSONAGGI.length}).`);
