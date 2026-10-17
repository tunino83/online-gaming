/**
 * Genera docs/anteprima-carte.html: tutte le carte personaggio, disegnate dai dati.
 * Uso: pnpm carte
 *
 * Immagini: se esiste games/primo-gioco/immagini/<id>.png (o .jpg, .jpeg, .webp)
 * viene usata come illustrazione; altrimenti si mostra un simbolo provvisorio.
 */
import { existsSync, writeFileSync } from "node:fs";
import { PERSONAGGI } from "../src/personaggi";
import type { Codice, Personaggio } from "../src/tipi-carte";

const CARTELLA_IMMAGINI = new URL("../immagini/", import.meta.url);
const FILE_USCITA = new URL("../../../docs/anteprima-carte.html", import.meta.url);

/** Simboli provvisori, finché non ci sono le illustrazioni. */
const SIMBOLI: Record<string, string> = {
  fenice: "🔥", drago: "🐉", "cappuccetto-rosso": "🧺", scimmia: "🐒", strega: "🧙", "gatto-con-gli-stivali": "🐈",
  unicorno: "🦄", pinco: "🎈", panco: "🎪", leone: "🦁", giganti: "🗿", "hansel-e-gretel": "🍬", goblin: "👺",
  cerbero: "🐕", "quercia-umana": "🌳", regina: "👑", gnomo: "🍄", mago: "🔮", fantasma: "👻",
  "bacchetta-magica": "🪄", "robin-hood": "🏹", "hobbit-pari": "🥾", "hobbit-dispari": "🥾", "golem-pari": "🪨",
  "golem-dispari": "🪨", ercole: "💪", fatina: "🧚", scheletro: "💀", "cappellaio-matto": "🎩", xena: "⚔️",
  "capitan-uncino": "🏴‍☠️", folletto: "🍀", biancaneve: "🍎", "lucciola-444-555": "✨", "lucciola-333-666": "✨",
};
const simbolo = (p: Personaggio) => SIMBOLI[p.id] ?? (p.id.startsWith("nano") ? "⛏️" : "❔");

function immagine(p: Personaggio): string | null {
  for (const est of ["png", "jpg", "jpeg", "webp"]) {
    if (existsSync(new URL(`${p.id}.${est}`, CARTELLA_IMMAGINI))) return `../games/primo-gioco/immagini/${p.id}.${est}`;
  }
  return null;
}

/** Tipo del potere: decide il colore della carta. */
function tipo(p: Personaggio): { classe: string; etichetta: string } {
  const colori = new Set(p.poteri.map((x) => x.colore));
  if (colori.size === 0) return { classe: "nessuno", etichetta: "Nessun potere" };
  if (colori.has("speciale")) return { classe: "speciale", etichetta: "Speciale" };
  if (colori.has("rosso") && colori.has("blu")) return { classe: "misto", etichetta: "Rosso + Blu" };
  return colori.has("rosso") ? { classe: "rosso", etichetta: "Rosso · una volta" } : { classe: "blu", etichetta: "Blu · sempre" };
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tessera = (t: string | number, extra = "") => `<span class="tessera${extra}">${t}</span>`;
const pillola = (t: string) => `<span class="pillola">${esc(t)}</span>`;

/** Il codice disegnato come piccole carte numero. */
function codiceVisivo(c: Codice): string {
  switch (c.tipo) {
    case "esatto":
      return c.valori.map((v) => tessera(v)).join("");
    case "uguali":
      return Array.from({ length: c.carte }, () => tessera("=", " generica")).join("") +
        pillola({ 2: "coppia", 3: "tris", 4: "poker" }[c.carte]);
    case "somma":
      return c.carte === undefined
        ? tessera("?", " generica") + tessera("…", " generica") + pillola(`somma ${c.totale}`)
        : Array.from({ length: c.carte }, () => tessera("?", " generica")).join("") + pillola(`somma ${c.totale}`);
    case "scala":
      return Array.from({ length: c.lunghezza }, (_, i) => tessera(i === 0 ? "n" : `+${i}`, " generica")).join("") +
        pillola(`scala da ${c.lunghezza}`);
    case "doppiaCoppia":
      return tessera("a", " generica") + tessera("a", " generica") + tessera("b", " generica") + tessera("b", " generica");
    case "parita":
      return Array.from({ length: c.carte }, () => tessera(c.parita === "pari" ? "P" : "D", " generica")).join("") +
        pillola(c.parita);
    case "diamanteQualsiasi":
      return tessera("◆", " diamante");
    case "combinato":
      return c.esatto.map((v) => tessera(v)).join("") + `<span class="piu">+</span>` + codiceVisivo(c.piu);
    case "alternativa":
      return c.opzioni.map((o) => `<span class="gruppo">${codiceVisivo(o)}</span>`).join(`<span class="oppure">o</span>`);
  }
}

function carta(p: Personaggio): string {
  const t = tipo(p);
  const img = immagine(p);
  const arte = img
    ? `<img src="${img}" alt="${esc(p.nome)}">`
    : `<span class="simbolo" aria-hidden="true">${simbolo(p)}</span>`;
  const potere = p.poteri.length === 0 ? "" : `<p class="potere-testo">${esc(p.potereTesto)}</p>`;
  return `
  <article class="carta ${t.classe}" title="${esc(p.id)}">
    <header>
      <h2>${esc(p.nome)}</h2>
      <span class="punti" title="Punti">${p.punti}</span>
    </header>
    <div class="arte">${arte}</div>
    <div class="codice" title="${esc(p.codiceTesto)}">${codiceVisivo(p.codice)}</div>
    <div class="potere">
      <span class="tipo">${t.etichetta}</span>
      ${potere}
    </div>
    <footer>${p.copie > 1 ? `× ${p.copie} copie` : "1 copia"}</footer>
  </article>`;
}

const conImmagine = PERSONAGGI.filter((p) => immagine(p)).length;
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carte personaggio</title>
<style>
  :root {
    --sfondo: #f3efe6; --testo: #2b2620; --tenue: #6d655a; --carta: #fffaf0; --bordo-carta: #d9cfbd;
    --blu: #2f6fb3; --rosso: #c0392b; --speciale: #c9971c; --nessuno: #8a8275; --misto: linear-gradient(135deg, #c0392b, #2f6fb3);
    --tessera: #ffffff; --tessera-bordo: #2b2620;
  }
  @media (prefers-color-scheme: dark) {
    :root { --sfondo: #1c1a17; --testo: #f1ebe0; --tenue: #a99f90; --carta: #2a2622; --bordo-carta: #4a433b;
      --tessera: #3a352f; --tessera-bordo: #e9e1d3; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px 48px; background: var(--sfondo); color: var(--testo);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .intro { max-width: 1100px; margin: 0 auto 24px; }
  .intro h1 { font-family: Georgia, "Times New Roman", serif; margin: 0 0 6px; font-size: 28px; }
  .intro p { margin: 4px 0; color: var(--tenue); font-size: 14px; }
  .legenda { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 12px; font-size: 13px; }
  .legenda span::before { content: ""; display: inline-block; width: 12px; height: 12px; border-radius: 3px;
    margin-right: 6px; vertical-align: -1px; background: var(--c); }
  .griglia { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;
    max-width: 1100px; margin: 0 auto; }

  .carta { --c: var(--nessuno); position: relative; aspect-ratio: 63 / 88; background: var(--carta);
    border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 8px;
    border: 6px solid var(--c); box-shadow: 0 2px 8px rgb(0 0 0 / .12); }
  .carta.blu { --c: var(--blu); }
  .carta.rosso { --c: var(--rosso); }
  .carta.speciale { --c: var(--speciale); }
  .carta.misto { border-image: var(--misto) 1; border-radius: 0; --c: #7b4a9e; }

  header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  h2 { font-family: Georgia, "Times New Roman", serif; font-size: 15px; line-height: 1.15; margin: 0; }
  .punti { flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--c); color: #fff;
    font-weight: 700; font-size: 17px; display: grid; place-items: center; }
  .carta.misto .punti { background: var(--misto); }

  .arte { flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: grid; place-items: center;
    background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--c) 25%, var(--carta)), color-mix(in srgb, var(--c) 8%, var(--carta)));
    border: 1px solid var(--bordo-carta); }
  .arte img { width: 100%; height: 100%; object-fit: cover; }
  .simbolo { font-size: 56px; line-height: 1; }

  .codice { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px; min-height: 30px; }
  .tessera { width: 22px; height: 30px; border-radius: 4px; border: 1.5px solid var(--tessera-bordo);
    background: var(--tessera); display: grid; place-items: center; font-weight: 700; font-size: 15px; }
  .tessera.generica { border-style: dashed; color: var(--tenue); font-size: 12px; }
  .tessera.diamante { color: #1f9bb5; border-color: #1f9bb5; }
  .pillola { font-size: 11px; padding: 2px 7px; border-radius: 99px; border: 1px solid var(--bordo-carta); color: var(--tenue); }
  .piu { font-weight: 700; margin: 0 2px; }
  .oppure { font-size: 12px; color: var(--tenue); margin: 0 2px; }
  .gruppo { display: inline-flex; gap: 3px; white-space: nowrap; }
  .gruppo .tessera { width: 19px; }

  .potere { font-size: 11.5px; line-height: 1.3; min-height: 42px; }
  .tipo { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
    color: #fff; background: var(--c); padding: 2px 6px; border-radius: 4px; }
  .carta.misto .tipo { background: var(--misto); }
  .potere-testo { margin: 4px 0 0; }
  footer { font-size: 10.5px; color: var(--tenue); text-align: right; }
</style>
</head>
<body>
  <div class="intro">
    <h1>Carte personaggio</h1>
    <p>${PERSONAGGI.length} personaggi, ${PERSONAGGI.reduce((s, p) => s + p.copie, 0)} carte. Generata dai dati del gioco con <code>pnpm carte</code>.</p>
    <p>Illustrazioni caricate: ${conImmagine} su ${PERSONAGGI.length}. Le altre mostrano un simbolo provvisorio.</p>
    <div class="legenda">
      <span style="--c: var(--blu)">Potere blu (permanente)</span>
      <span style="--c: var(--rosso)">Potere rosso (una volta)</span>
      <span style="--c: var(--misto)">Rosso + Blu</span>
      <span style="--c: var(--speciale)">Speciale</span>
      <span style="--c: var(--nessuno)">Nessun potere</span>
    </div>
  </div>
  <main class="griglia">${PERSONAGGI.map(carta).join("")}
  </main>
</body>
</html>
`;

writeFileSync(FILE_USCITA, html);
console.log(`Anteprima scritta in docs/anteprima-carte.html (${conImmagine} immagini su ${PERSONAGGI.length}).`);
