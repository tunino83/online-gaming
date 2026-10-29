/**
 * Carte della Famiglia da stampare: un PDF in A4 con 9 carte per pagina, formato poker (63,5 × 88,9 mm),
 * staccate di 4 mm l'una dall'altra e con le lineette per ritagliare. Tutti i mazzi: personaggi (con difese e attacchi,
 * una carta per copia), carte numero, mancia dei nonni (carte piccole: 4 nello spazio di una carta), eventi;
 * in fondo una pagina di dorsi per ogni mazzo.
 *
 * Sempre uguale: stesse carte e stesse immagini danno lo stesso contenuto (ordine fisso, data fissa dentro il PDF);
 * il nome del file ha la data e l'ora della stampa, così le stampe precedenti restano.
 * Le regole dei punti sono quelle di base del gioco (le carte solo aiuto valgono 0).
 *
 * Uso: pnpm stampa:famiglia   → docs/famiglia/stampa/la-famiglia-carte_<data_ora>.pdf (tutto)
 *
 * Solo alcune carte: si scrivono dopo il comando (separate da spazi) persone, carte e mazzi:
 *   pnpm stampa:famiglia antonio nonna-maria-2 rocky      → le 3 carte di Antonio, Nonna Maria 2 e Rocky
 *   pnpm stampa:famiglia simone numeri                    → le carte di Simone e le carte numero
 * Parole per i mazzi: numeri, mancia, eventi, dorsi, tabella (personaggi = tutti i personaggi).
 * Con una scelta il file è docs/famiglia/stampa/la-famiglia-scelta_<data_ora>.pdf;
 * con --una-copia le carte con più copie (vini, scuse…) si stampano una volta sola.
 *
 * Fronte e retro a mano (es. carta fotografica lucida da un lato solo): --dorsi-prima mette prima tutte le pagine di dorsi
 * (sempre piene, tutte uguali e simmetriche: il foglio si rimette girato come capita) e poi tutte le pagine delle carte.
 * Senza la tabella dei poteri all'inizio: --senza-tabella (es. pnpm stampa:famiglia personaggi --fronte-retro --senza-tabella).
 *
 * Fronte e retro: con --fronte-retro dopo ogni pagina di carte c'è la pagina dei loro dorsi, messi a specchio,
 * da stampare in fronte/retro sul lato lungo (es. pnpm stampa:famiglia personaggi --fronte-retro).
 *
 * Carte per foglio: --per-foglio 16 o --per-foglio 30 (carte rimpicciolite; di base 9 in formato poker).
 * La mancia resta sempre 36 per foglio. Il nome del file dice il formato (es. la-famiglia-carte-16_<data_ora>.pdf).
 *
 * Plancia del giocatore (dove appoggiare le carte quando si gioca con le carte stampate): pnpm stampa:famiglia plancia
 * (un A4 orizzontale, con i posti grandi come le carte: 9 per foglio di base, oppure --per-foglio 16).
 * File la-famiglia-plancia[-16]_<data_ora>.pdf.
 *
 * Dorsi che consumano poco inchiostro: --dorso-leggero (fondo bianco, cornice dorata con il bordo colorato del mazzo, uno stemma al centro con il
 * nome scritto in cerchio, uguale anche capovolto). Il file finisce con "-leggero" (es. la-famiglia-carte-16-leggero_<data_ora>.pdf).
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { CARTE } from "../src/carte";
import { descriviCodice } from "../src/codici";
import { EVENTI } from "../src/eventi";
import { creaMazzoMancia, creaMazzoNumeri } from "../src/mazzi";
import { OPZIONI_DEFAULT } from "../src/parametri";
import { nomiImmagine } from "../src/carte";
import { puntiCarta } from "../src/base";
import { CON_DETTAGLI, PROMEMORIA } from "../src/promemoria";
import { type PezzoCodice, pezziDelCodice } from "../src/codice-disegnato";
import { COLORI_NUMERI, COLORI_TIPI, type TipologiaCarta, tipologiaPotere, tipologiaPrincipale, tipologieCarta } from "../src/colori";
import type { Carta, CartaMancia, CartaNumero, Evento, TipoPotere } from "../src/tipi-carte";

/* ---------------- misure (in punti tipografici: 1 mm = 2,8346 pt) ---------------- */

const MM = 72 / 25.4;
const L = 63.5 * MM; // larghezza della carta (poker)
const A = 88.9 * MM; // altezza
const PAGINA = { w: 595.28, h: 841.89 }; // A4
/** Spazio tra una carta e l'altra, per tagliare con comodo. */
const SPAZIO = 4 * MM;
/** Parte del foglio dove stanno le carte (il resto serve alle lineette di taglio e alla scritta in fondo). */
const UTILE = { w: 200 * MM, h: 275 * MM };
/** Quante carte per foglio si possono scegliere (colonne × righe): con 9 sono in formato poker, con di più si rimpiccioliscono. */
const FORMATI: Record<number, { colonne: number; righe: number }> = {
  9: { colonne: 3, righe: 3 },
  16: { colonne: 4, righe: 4 },
  30: { colonne: 5, righe: 6 },
};
/** Data fissa nel PDF: così il file è sempre identico. */
const DATA_FISSA = new Date("2026-10-26T00:00:00Z");

/* ---------------- file ---------------- */

const radice = (p: string) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
/** Caratteri della grafica del gioco, salvati nel progetto (licenza SIL Open Font License, vedi la cartella). */
const FONT = {
  normale: radice("games/famiglia/stampa/font/Fredoka-Medium.ttf"),
  forte: radice("games/famiglia/stampa/font/Fredoka-SemiBold.ttf"),
  nero: radice("games/famiglia/stampa/font/Fredoka-Bold.ttf"),
  mano: radice("games/famiglia/stampa/font/Caveat-Bold.ttf"),
};
const CARTELLA_IMMAGINI = radice("games/famiglia/immagini/classica");
/** Data e ora nel nome del file (es. 2026-10-26_15-42-07), così ogni stampa resta e non si perde l'ultima. */
function adesso(): string {
  const d = new Date();
  const due = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}_${due(d.getHours())}-${due(d.getMinutes())}-${due(d.getSeconds())}`;
}
const quando = adesso();
/** Nome del PDF: "carte" (tutto) o "scelta", con le carte per foglio se non sono 9 (es. la-famiglia-carte-16_…). */
const uscita = (cosa: "carte" | "scelta" | "plancia", perFoglio: number, leggero: boolean, dorsiPrima = false) =>
  radice(`docs/famiglia/stampa/la-famiglia-${cosa}${perFoglio === 9 ? "" : `-${perFoglio}`}${leggero ? "-leggero" : ""}${dorsiPrima ? "-dorsi-prima" : ""}_${quando}.pdf`);

/** Foto della carta (prima quella della carta, poi quella della persona), come nel gioco. */
function immagine(c: Carta): string | undefined {
  for (const nome of nomiImmagine(c)) {
    for (const est of ["jpg", "jpeg", "png"]) {
      const p = `${CARTELLA_IMMAGINI}/${nome}.${est}`;
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

/* ---------------- colori (come nel gioco) ---------------- */

type Tipologia = TipologiaCarta;
const TIPO = COLORI_TIPI;
const CREMA = "#fdf6e6";
const INCHIOSTRO = "#3a2417";
const MATITA = "#7a6048";

const tipologie = tipologieCarta;
const principale = tipologiaPrincipale;

/** Toglie i caratteri che i font non hanno (emoji e simboli): sulla carta stampata non si vedrebbero. */
const pulito = (s: string) => s.replace(/[^ -ɏ‘-„…–—]/gu, "").replace(/\s+/g, " ").trim();

/* ---------------- pezzi di disegno ---------------- */

type Doc = PDFKit.PDFDocument;

/** Stella a 5 punte centrata in (cx, cy). */
function stella(doc: Doc, cx: number, cy: number, r: number, colore: string) {
  const punti: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const raggio = i % 2 === 0 ? r : r * 0.45;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    punti.push([cx + raggio * Math.cos(ang), cy + raggio * Math.sin(ang)]);
  }
  doc.polygon(...punti).fill(colore);
}

/** Stemma del tipo di potere (come nel gioco): scudo colorato con il simbolo disegnato. */
function stemma(doc: Doc, x: number, y: number, larghezza: number, tipo: Tipologia) {
  const s = larghezza / 40;
  const t = TIPO[tipo];
  doc.save().translate(x, y).scale(s);
  doc.path("M20 2 L37 7 V22 C37 33 29 40 20 44 C11 40 3 33 3 22 V7 Z").lineWidth(2.5).fillAndStroke(t.colore, CREMA);
  doc.path("M20 7 L32 10.5 V22 C32 30 26.5 35 20 38 C13.5 35 8 30 8 22 V10.5 Z").lineWidth(1).dash(2, { space: 1.6 }).stroke(CREMA).undash();
  doc.lineWidth(2.4).lineCap("round");
  if (tipo === "attacco" || tipo === "attaccoUnaVolta") {
    // due spade incrociate
    doc.moveTo(13, 14).lineTo(27, 30).stroke(CREMA);
    doc.moveTo(27, 14).lineTo(13, 30).stroke(CREMA);
    doc.moveTo(10, 26).lineTo(16, 32).stroke(CREMA);
    doc.moveTo(30, 26).lineTo(24, 32).stroke(CREMA);
  } else if (tipo === "difesa" || tipo === "difesaUnaVolta") {
    // uno scudo piccolo pieno
    doc.path("M20 13 L27 15.5 V22 C27 27 24 30 20 32 C16 30 13 27 13 22 V15.5 Z").fill(CREMA);
  } else if (tipo === "blu") {
    // sempre attiva: il simbolo dell'infinito (come nel gioco)
    doc.path("M20 23 C17 17.5 10.5 17.5 10.5 23 C10.5 28.5 17 28.5 20 23 C23 17.5 29.5 17.5 29.5 23 C29.5 28.5 23 28.5 20 23 Z").lineWidth(3.4).lineJoin("round").stroke(CREMA);
  } else {
    // scintilla a 4 punte
    doc.path("M20 11 C21 19 22 20 29 22 C22 24 21 25 20 33 C19 25 18 24 11 22 C18 20 19 19 20 11 Z").fill(CREMA);
  }
  doc.restore();
}

/** Testo su una riga sola, rimpicciolito finché ci sta. */
function rigaCheSta(doc: Doc, testo: string, x: number, y: number, larghezza: number, font: string, dimensione: number, colore: string, allinea: "left" | "center" | "right" = "center") {
  let d = dimensione;
  doc.font(font);
  while (d > 5 && doc.fontSize(d).widthOfString(testo) > larghezza) d -= 0.5;
  doc.fillColor(colore).fontSize(d).text(testo, x, y + (dimensione - d) / 2, { width: larghezza, align: allinea, lineBreak: false });
}

/** Cornice di una carta: carta crema, bordo del colore del tipo e filo cucito. */
function cornice(doc: Doc, x: number, y: number, colore: string, sfondo = CREMA) {
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(3).fillAndStroke(sfondo, colore);
  doc.roundedRect(x + 6, y + 6, L - 12, A - 12, 6).lineWidth(0.8).dash(2.5, { space: 2 }).stroke(colore).undash();
}

/* ---------------- carte ---------------- */

/**
 * Carta personaggio (e carte difesa e attacco usa e getta). Dall'alto: nastro con nome e faccine che dormono
 * (una per turno di ricarica), sotto il nome del potere (così con le carte a scaletta si leggono tutti e due),
 * l'immagine, il codice di attivazione a cavallo del bordo basso dell'immagine (come in Il Portale) e infine
 * un promemoria breve del potere (src/promemoria.ts; il testo intero è nella tabella dei poteri).
 */
function cartaPersonaggio(doc: Doc, x: number, y: number, c: Carta) {
  const tipo = principale(c);
  const t = TIPO[tipo];
  const oggetto = c.categoria !== "personaggio";
  cornice(doc, x, y, t.colore, oggetto ? "#f1dfbd" : CREMA);

  // nastro col nome e, a destra, le faccine che dormono (prima del biscotto dei punti)
  const finePunti = oggetto ? x + L - 8 : x + L - 32;
  const larghezzaSonno = oggetto ? 34 : c.ricarica === 0 ? 30 : c.ricarica * 10;
  doc.rect(x + 4, y + 11, L - 8, 20).fill(t.colore);
  rigaCheSta(doc, pulito(c.nome), x + 33, y + 15.5, finePunti - larghezzaSonno - 3 - (x + 33), FONT.forte, 12, "#ffffff", "left");
  if (oggetto) rigaCheSta(doc, "usa e getta", finePunti - larghezzaSonno, y + 16.5, larghezzaSonno, FONT.mano, 9, "#ffffff", "right");
  else if (c.ricarica === 0) rigaCheSta(doc, "non dorme", finePunti - larghezzaSonno, y + 16.5, larghezzaSonno, FONT.mano, 9, "#ffffff", "right");
  else for (let i = 0; i < c.ricarica; i++) dormiglione(doc, finePunti - 5 - i * 10, y + 20.5);

  const nomi = c.poteri.map((p) => ({ nome: pulito(p.nome), colore: TIPO[tipologiaPotere(c, p)].scuro }));

  // promemoria del potere in fondo (2–3 righe)
  const tx = x + 11;
  const tw = L - 22;
  // con * se il potere ha qualche particolare in più da leggere nella tabella dei poteri
  const promemoria = c.poteri.map((p) => pulito(PROMEMORIA[p.id] ?? p.testo) + (CON_DETTAGLI.has(p.id) ? " *" : "")).join(" · ");
  let dimP = 9;
  doc.font(FONT.normale);
  while (dimP > 6.5 && doc.fontSize(dimP).heightOfString(promemoria, { width: tw, align: "center" }) > 30) dimP -= 0.5;
  const hP = doc.fontSize(dimP).heightOfString(promemoria, { width: tw, align: "center" });

  // immagine (o iniziale): tra il nastro e il promemoria, lasciando posto al codice che la sormonta
  const fx = x + 8;
  const fy = y + 34;
  const fw = L - 16;
  const fh = y + A - 12 - hP - 13 - fy;
  const foto = immagine(c);
  doc.save();
  doc.roundedRect(fx, fy, fw, fh, 5).clip();
  if (foto) doc.image(foto, fx, fy, { cover: [fw, fh], align: "center" }); // in verticale resta in alto (le facce stanno in alto)
  else {
    doc.rect(fx, fy, fw, fh).fill("#f3ead6");
    doc.circle(fx + fw / 2, fy + fh / 2, 30).lineWidth(2).fillAndStroke("#fffaf0", t.colore);
    doc.font(FONT.nero).fontSize(30).fillColor(t.scuro).text(pulito(c.nome).charAt(0), fx, fy + fh / 2 - 18, { width: fw, align: "center" });
  }
  doc.restore();
  doc.roundedRect(fx, fy, fw, fh, 5).lineWidth(0.8).stroke("#b9a48a");

  // nome del potere (o dei due poteri) in alto sulla foto, su una striscia bianca: con le carte a scaletta si legge
  // insieme al nome (le carte con due poteri lasciano posto a sinistra al secondo stemma)
  // la striscia bianca è lunga quanto il nome, centrata (lascia libera a sinistra la colonna delle stelle)
  const testoNomi = nomi.map((n) => n.nome).join(" / ");
  const xMin = fx + (tipologie(c).length > 1 ? 24 : 17);
  const wMax = fx + fw - 4 - xMin;
  let dimN = 10.5;
  doc.font(FONT.forte);
  while (dimN > 6 && doc.fontSize(dimN).widthOfString(testoNomi) > wMax - 8) dimN -= 0.5;
  const wStriscia = doc.fontSize(dimN).widthOfString(testoNomi) + 8;
  const xStriscia = Math.max(xMin, fx + (fw - wStriscia) / 2);
  doc.save().fillOpacity(0.88).roundedRect(xStriscia, fy + 3, wStriscia, dimN + 4, 4).fill("#fffaf0").restore();
  doc.fillColor(nomi[0]!.colore).text(testoNomi, xStriscia + 4, fy + 5.2, { lineBreak: false });

  // livello: stelle in colonna in alto a sinistra sulla foto (sotto il secondo stemma, se c'è)
  const ys = fy + (tipologie(c).length > 1 ? 22 : 3);
  doc.roundedRect(fx + 3, ys, 11, 4 + c.livello * 9.5, 3).fill("#3a2417");
  for (let i = 0; i < c.livello; i++) stella(doc, fx + 8.5, ys + 6.8 + i * 9.5, 3.8, "#ffd59a");

  // stemmi del tipo (uno per tipo di potere) e punti nel biscotto
  tipologie(c).forEach((tp, i) => stemma(doc, x + 5, y + 4 + i * 27, i === 0 ? 26 : 22, tp));
  if (!oggetto) {
    const punti = puntiCarta(c.id, OPZIONI_DEFAULT);
    doc.circle(x + L - 17, y + 21, 13).fill("#d18b3c");
    doc.circle(x + L - 17, y + 21, 13).lineWidth(1.2).dash(1.2, { space: 1.4 }).stroke("#8a4f1d").undash();
    doc.font(FONT.nero).fontSize(14).fillColor("#4a2410").text(String(punti), x + L - 30, y + 13.5, { width: 26, align: "center" });
  }

  // codice di attivazione a cavallo del bordo basso dell'immagine, su una pillola chiara
  codiceDisegnato(doc, c.codice, x + L / 2, fy + fh, fw - 16, true);

  // promemoria del potere
  doc.font(FONT.normale).fontSize(dimP).fillColor(INCHIOSTRO).text(promemoria, tx, y + A - 12 - hP, { width: tw, align: "center" });
}

/** Faccina che dorme (un turno di ricarica): tonda, occhi chiusi e una "z". */
function dormiglione(doc: Doc, cx: number, cy: number) {
  const r = 4.3;
  doc.circle(cx, cy + 0.6, r).lineWidth(0.6).fillAndStroke("#ffe2a6", "#b07a2a");
  // occhi chiusi: due archetti
  doc.lineWidth(0.6).lineCap("round");
  doc.moveTo(cx - 2.6, cy - 0.1).quadraticCurveTo(cx - 1.6, cy + 0.9, cx - 0.6, cy - 0.1).stroke("#5a3a1a");
  doc.moveTo(cx + 0.6, cy - 0.1).quadraticCurveTo(cx + 1.6, cy + 0.9, cx + 2.6, cy - 0.1).stroke("#5a3a1a");
  // bocca piccola
  doc.circle(cx, cy + 2.4, 0.6).fill("#5a3a1a");
  doc.font(FONT.nero).fontSize(5).fillColor("#7a5ab0").text("z", cx + 2.6, cy - 7.2, { lineBreak: false });
}

/**
 * Disegna il codice con le carte piccole, centrato in altezza su `cy`, al massimo largo `massimo`.
 * Con `pillola` `x` è il centro e sotto c'è una pillola chiara (il codice sormonta l'immagine).
 */
function codiceDisegnato(doc: Doc, codice: Carta["codice"], x: number, cy: number, massimo: number, pillola = false) {
  const pezzi = pezziDelCodice(codice);
  const cw = 10;
  const ch = 14;
  doc.font(FONT.nero).fontSize(9);
  /** Le carte con "+3" sono un po' più larghe. */
  const larghezzaCarta = (testo: string) => (testo.length > 1 && testo !== "↗" ? 15 : cw);
  /** Il totale di una somma sta in una moneta d'oro. */
  const moneta = (pz: PezzoCodice) => "parola" in pz && /^\d+$/.test(pz.parola);
  const larghezza = (pz: PezzoCodice) =>
    "carta" in pz ? larghezzaCarta(pz.carta) + 1.6 : "segno" in pz ? 7 : "spazio" in pz ? pz.spazio : moneta(pz) ? 15 : doc.font(FONT.mano).fontSize(11).widthOfString(pz.parola) + 3;
  const totale = pezzi.reduce((s, pz) => s + larghezza(pz), 0);
  const scala = Math.min(pillola ? 1.15 : 1, massimo / totale);
  const x0 = pillola ? x - (totale * scala) / 2 : x;
  if (pillola) {
    const w = totale * scala + 10;
    const h = ch * scala + 7;
    doc.roundedRect(x - w / 2, cy - h / 2, w, h, h / 2).lineWidth(1).fillAndStroke("#fffaf0", "#c9a24a");
  }
  doc.save().translate(x0, cy).scale(scala);
  let px = 0;
  for (const pz of pezzi) {
    if ("carta" in pz) {
      const gemma = pz.valore ? COLORI_NUMERI[pz.valore as keyof typeof COLORI_NUMERI] : undefined;
      doc.roundedRect(px, -ch / 2, larghezzaCarta(pz.carta), ch, 2).lineWidth(0.7).fillAndStroke(gemma ? gemma.chiaro : "#fffaf0", gemma ? gemma.scuro : "#b9a48a");
      if (pz.carta === "↗") {
        // scala: tre gradini
        for (let k = 0; k < 3; k++) doc.rect(px + 2 + k * 2.2, 3 - k * 2.4, 1.8, 1 + k * 2.4).fill("#8a6a3a");
      } else if (pz.carta) {
        doc.font(FONT.nero).fontSize(8).fillColor(gemma ? gemma.scuro : "#7a4a26").text(pz.carta, px, -4.2, { width: larghezzaCarta(pz.carta), align: "center", lineBreak: false });
      }
    } else if ("spazio" in pz) {
      // solo spazio
    } else if ("segno" in pz) {
      doc.font(FONT.nero).fontSize(9).fillColor(MATITA).text(pz.segno, px, -5, { width: 7, align: "center", lineBreak: false });
    } else if (moneta(pz)) {
      doc.circle(px + 7, 0, 6.8).lineWidth(0.8).fillAndStroke("#f3dc9a", "#a8801f");
      doc.font(FONT.nero).fontSize(8).fillColor("#6a4410").text(pz.parola, px, -4.2, { width: 14, align: "center", lineBreak: false });
    } else {
      doc.font(FONT.mano).fontSize(11).fillColor(INCHIOSTRO).text(pz.parola, px + 1.5, -6.6, { lineBreak: false });
    }
    px += larghezza(pz);
  }
  doc.restore();
}

/** Ottagono centrato in (cx, cy): i suoi 8 vertici. */
function ottagono(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 8 }, (_, i): [number, number] => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

/** Stellina a 4 punte (scintilla) dorata. */
function scintilla(doc: Doc, cx: number, cy: number, r: number, colore = "#c9a24a") {
  const k = r * 0.28;
  doc.polygon([cx, cy - r], [cx + k, cy - k], [cx + r, cy], [cx + k, cy + k], [cx, cy + r], [cx - k, cy + k], [cx - r, cy], [cx - k, cy - k]).fill(colore);
}

const ORO = "#c9a24a";
const BRUNO = "#5a3a1a";

/** Fondo fantasy delle carte: pergamena con un po' di luce al centro e cornice dorata doppia. */
function pergamena(doc: Doc, x: number, y: number) {
  const cx = x + L / 2;
  const cy = y + A / 2;
  const sfondo = doc.radialGradient(cx, cy - 10, 10, cx, cy, A * 0.62);
  sfondo.stop(0, "#fffaf0").stop(1, "#e6cf9f");
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).fill(sfondo);
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(3).stroke(ORO);
  doc.roundedRect(x + 7, y + 7, L - 14, A - 14, 6).lineWidth(0.9).stroke(BRUNO);
  doc.roundedRect(x + 9.5, y + 9.5, L - 19, A - 19, 5).lineWidth(0.6).dash(1, { space: 2 }).stroke(ORO).undash();
}

/** Riga di stelline dorate, a separare le parti della carta. */
function separatore(doc: Doc, cx: number, y: number) {
  doc.moveTo(cx - 50, y).lineTo(cx - 9, y).moveTo(cx + 9, y).lineTo(cx + 50, y).lineWidth(0.7).stroke(ORO);
  scintilla(doc, cx, y, 5);
}

/** Carta numero fantasy: pergamena con cornice dorata e, al centro, una gemma sfaccettata col numero inciso. */
function cartaNumero(doc: Doc, x: number, y: number, c: CartaNumero) {
  const g = COLORI_NUMERI[c.valore];
  const oro = ORO;
  const bruno = BRUNO;
  const cx = x + L / 2;
  const cy = y + A / 2;
  pergamena(doc, x, y);

  // anello di rune (puntini dorati) attorno alla gemma
  doc.circle(cx, cy, 66).lineWidth(1.2).dash(1.5, { space: 4 }).stroke(oro).undash();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    scintilla(doc, cx + 66 * Math.cos(a), cy + 66 * Math.sin(a), i % 2 === 0 ? 5 : 3);
  }

  // la gemma: ottagono sfaccettato
  const R = 50;
  const fuori = ottagono(cx, cy, R);
  const dentro = ottagono(cx, cy, R * 0.56);
  const pietra = doc.radialGradient(cx - R * 0.35, cy - R * 0.4, 4, cx, cy, R * 1.1);
  pietra.stop(0, g.chiaro).stop(0.45, g.colore).stop(1, g.scuro);
  doc.polygon(...fuori).fill(pietra);
  // faccette: triangoli tra il bordo e la tavola, più chiari in alto a sinistra
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8;
    doc.fillOpacity(i >= 4 && i <= 6 ? 0.22 : 0.08);
    doc.polygon(fuori[i]!, fuori[j]!, dentro[j]!, dentro[i]!).fill(i >= 4 && i <= 6 ? "#ffffff" : g.scuro);
  }
  doc.fillOpacity(1);
  const tavola = doc.radialGradient(cx - 8, cy - 10, 2, cx, cy, R * 0.6);
  tavola.stop(0, g.chiaro).stop(1, g.colore);
  doc.polygon(...dentro).fill(tavola);
  doc.lineWidth(0.6).strokeOpacity(0.55);
  for (let i = 0; i < 8; i++) doc.moveTo(...fuori[i]!).lineTo(...dentro[i]!).stroke(g.scuro);
  doc.strokeOpacity(1);
  doc.polygon(...dentro).lineWidth(0.8).stroke(g.scuro);
  // incastonatura d'oro e riflesso
  doc.polygon(...fuori).lineWidth(3.2).stroke(oro);
  doc.polygon(...fuori).lineWidth(0.8).stroke(bruno);
  doc.fillOpacity(0.55).ellipse(cx - 18, cy - 24, 11, 5).fill("#ffffff").fillOpacity(1);

  // il numero inciso nella gemma
  // prima il contorno scuro (spesso), poi il bianco sopra: così non si vedono le linee interne della lettera
  doc.font(FONT.nero).fontSize(64).lineWidth(5).lineJoin("round").strokeColor(g.scuro);
  doc.text(String(c.valore), x, cy - 41, { width: L, align: "center", stroke: true, fill: false });
  doc.fillColor("#ffffff").text(String(c.valore), x, cy - 41, { width: L, align: "center" });

  // numeri piccoli negli angoli, su un rombo dorato
  for (const [ax, ay, ruota] of [
    [x + 21, y + 23, 0],
    [x + L - 21, y + A - 23, 180],
  ] as const) {
    doc.save().rotate(ruota, { origin: [ax, ay] });
    doc.polygon([ax, ay - 12], [ax + 12, ay], [ax, ay + 12], [ax - 12, ay]).lineWidth(1).fillAndStroke(g.colore, oro);
    doc.font(FONT.nero).fontSize(13).fillColor("#ffffff").text(String(c.valore), ax - 10, ay - 8, { width: 20, align: "center" });
    doc.restore();
  }
  // stelline negli altri due angoli
  scintilla(doc, x + L - 21, y + 23, 7);
  scintilla(doc, x + 21, y + A - 23, 7);

  if (c.campanello) {
    doc.roundedRect(cx - 32, y + A - 32, 64, 15, 7).lineWidth(1).fillAndStroke("#fff6dc", oro);
    doc.font(FONT.forte).fontSize(8).fillColor(bruno).text("campanello", cx - 32, y + A - 28, { width: 64, align: "center" });
  }
}

/**
 * Mancia dei nonni: una moneta d'oro col valore; il caffè è una pozione fumante.
 * Si stampano piccole (4 nello spazio di una carta), quindi senza spiegazione: è nella tabella dei poteri.
 */
function cartaMancia(doc: Doc, x: number, y: number, m: CartaMancia) {
  const cx = x + L / 2;
  const cy = y + A / 2 + 12;
  pergamena(doc, x, y);
  doc.font(FONT.mano).fontSize(15).fillColor(BRUNO).text("Mancia dei nonni", x, y + 16, { width: L, align: "center" });
  separatore(doc, cx, y + 40);
  if (m.tipo === "caffe") {
    // fiaschetta tonda con collo e tappo
    const vetro = doc.radialGradient(cx - 12, cy - 4, 3, cx, cy + 6, 36);
    vetro.stop(0, "#e8b07a").stop(0.5, "#8a4f22").stop(1, "#3a1d0a");
    doc.roundedRect(cx - 9, cy - 46, 18, 20, 3).fill("#f4ead6").roundedRect(cx - 9, cy - 46, 18, 20, 3).lineWidth(1.6).stroke(BRUNO);
    doc.roundedRect(cx - 11, cy - 54, 22, 10, 3).fill("#8a5a2b").roundedRect(cx - 11, cy - 54, 22, 10, 3).lineWidth(1).stroke(BRUNO);
    doc.circle(cx, cy + 6, 34).fill(vetro);
    doc.circle(cx, cy + 6, 34).lineWidth(3).stroke(ORO).circle(cx, cy + 6, 34).lineWidth(0.8).stroke(BRUNO);
    doc.fillOpacity(0.5).ellipse(cx - 14, cy - 10, 9, 5).fill("#ffffff");
    for (const [bx, by, br] of [[cx + 8, cy + 18, 3], [cx - 6, cy + 26, 2], [cx + 14, cy + 4, 2]] as const) doc.circle(bx, by, br).fill("#ffffff");
    doc.fillOpacity(1);
    scintilla(doc, cx - 26, cy - 40, 5);
    scintilla(doc, cx + 27, cy - 34, 4);
    doc.font(FONT.nero).fontSize(20).lineWidth(3).lineJoin("round").strokeColor("#3a1d0a");
    doc.text("Caffè", x, cy - 6, { width: L, align: "center", stroke: true, fill: false });
    doc.fillColor("#ffffff").text("Caffè", x, cy - 6, { width: L, align: "center" });
    return;
  }
  // moneta d'oro con bordo zigrinato
  const r = 52;
  const metallo = doc.radialGradient(cx - 14, cy - 16, 4, cx, cy, r * 1.1);
  metallo.stop(0, "#fff4b8").stop(0.5, "#e2b23f").stop(1, "#8a6318");
  doc.circle(cx, cy, r + 3).fill("#8a6318");
  doc.circle(cx, cy, r).fill(metallo);
  doc.circle(cx, cy, r - 7).lineWidth(1.2).dash(1.5, { space: 2.5 }).stroke("#8a6318").undash();
  doc.fillOpacity(0.55).ellipse(cx - 15, cy - 20, 10, 4.5).fill("#ffffff").fillOpacity(1);
  doc.font(FONT.nero).fontSize(56).lineWidth(5).lineJoin("round").strokeColor("#6b4a10");
  doc.text(String(m.valore), x, cy - 32, { width: L, align: "center", stroke: true, fill: false });
  doc.fillColor("#fff8dc").text(String(m.valore), x, cy - 32, { width: L, align: "center" });
  scintilla(doc, cx + 44, cy - 42, 7, "#fff2b0");
}

/** Evento: pergamena con il nome, un nastro viola con la durata e una luna tra le stelle. */
function cartaEvento(doc: Doc, x: number, y: number, e: Evento) {
  const cx = x + L / 2;
  pergamena(doc, x, y);
  // luna crescente
  doc.circle(cx, y + 26, 10).fill("#e2b23f");
  doc.circle(cx + 5, y + 23, 9).fill("#f7ecd2");
  scintilla(doc, cx - 18, y + 22, 4);
  scintilla(doc, cx + 20, y + 30, 3);
  doc.font(FONT.mano).fontSize(12).fillColor("#7a3fb0").text("Evento", x, y + 38, { width: L, align: "center" });
  rigaCheSta(doc, pulito(e.nome), x + 14, y + 52, L - 28, FONT.nero, 17, BRUNO);
  // nastro con le code
  const ny = y + 76;
  doc.polygon([cx - 50, ny], [cx - 40, ny + 8], [cx - 50, ny + 16], [cx - 34, ny + 16], [cx - 34, ny]).fill("#4e2373");
  doc.polygon([cx + 50, ny], [cx + 40, ny + 8], [cx + 50, ny + 16], [cx + 34, ny + 16], [cx + 34, ny]).fill("#4e2373");
  doc.rect(cx - 40, ny - 3, 80, 17).lineWidth(1).fillAndStroke("#7a3fb0", ORO);
  doc.font(FONT.forte).fontSize(8.5).fillColor("#ffffff").text(`dura ${e.durata} ${e.durata === 1 ? "turno" : "turni"}`, cx - 40, ny + 1.5, { width: 80, align: "center" });
  doc.font(FONT.normale).fontSize(9).fillColor(INCHIOSTRO).text(pulito(e.testo), x + 18, y + 104, { width: L - 36, align: "center" });
  separatore(doc, cx, y + A - 20);
}

/* ---------------- dorsi ---------------- */

type Mazzo = "personaggi" | "numeri" | "mancia" | "eventi";

/** Colori dei dorsi: un cielo stellato diverso per ogni mazzo (chiaro al centro, scuro ai bordi, gemma centrale). */
const DORSI: Record<Mazzo, { chiaro: string; scuro: string; gemma: string; titolo: string }> = {
  personaggi: { chiaro: "#5a3488", scuro: "#1c0f30", gemma: "#2a1648", titolo: "La Famiglia" },
  numeri: { chiaro: "#34407a", scuro: "#121a3a", gemma: "#1b2550", titolo: "Numeri" },
  mancia: { chiaro: "#2b6e4c", scuro: "#0b2a1c", gemma: "#123b28", titolo: "Mancia" },
  eventi: { chiaro: "#7a2a4c", scuro: "#2a0a16", gemma: "#43122a", titolo: "Eventi" },
};

/** Dorsi leggeri (--dorso-leggero): poco inchiostro. */
let dorsiLeggeri = false;

function dorso(doc: Doc, x: number, y: number, mazzo: Mazzo) {
  if (dorsiLeggeri) return dorsoLeggero(doc, x, y, mazzo);
  const d = DORSI[mazzo];
  const cx = x + L / 2;
  const cy = y + A / 2;
  doc.save();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).clip();
  const cielo = doc.radialGradient(cx, cy, 10, cx, cy, A * 0.7);
  cielo.stop(0, d.chiaro).stop(1, d.scuro);
  doc.rect(x, y, L, A).fill(cielo);
  for (let i = 1; i <= 30; i++) {
    // sequenza "R2": stelle sparse in modo uniforme ma sempre nello stesso posto (il PDF resta uguale)
    const sx = x + 12 + ((i * 0.7548777) % 1) * (L - 24);
    const sy = y + 12 + ((i * 0.5698403) % 1) * (A - 24);
    if (Math.hypot(sx - cx, sy - cy) < 62) continue;
    scintilla(doc, sx, sy, i % 3 === 0 ? 4 : 2.2, "#e8c56a");
  }
  doc.restore();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(3).stroke(ORO);
  doc.roundedRect(x + 8, y + 8, L - 16, A - 16, 6).lineWidth(0.6).dash(1, { space: 2.5 }).stroke(ORO).undash();
  // gemma centrale col nome del mazzo, e anello di stelline
  doc.circle(cx, cy, 62).lineWidth(0.8).dash(1.5, { space: 4 }).stroke(ORO).undash();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    scintilla(doc, cx + 62 * Math.cos(a), cy + 62 * Math.sin(a), i % 2 === 0 ? 5 : 3);
  }
  doc.polygon(...ottagono(cx, cy, 50)).lineWidth(3).fillAndStroke(d.gemma, ORO);
  doc.polygon(...ottagono(cx, cy, 44)).lineWidth(0.6).stroke("#e8c56a");
  rigaCheSta(doc, d.titolo, cx - 40, cy - 9, 80, FONT.nero, 17, "#e8c56a");
}

/**
 * Dorso che consuma poco inchiostro: fondo bianco, cornice dorata e al centro uno stemma con il nome del mazzo scritto
 * due volte in cerchio. Girato sottosopra è identico: non c'è un verso giusto e uno sbagliato.
 */
function dorsoLeggero(doc: Doc, x: number, y: number, mazzo: Mazzo) {
  const d = DORSI[mazzo];
  const cx = x + L / 2;
  const cy = y + A / 2;
  // bordo colorato del mazzo (solo una fascia, dentro la cornice dorata)
  doc.roundedRect(x + 2, y + 2, L - 4, A - 4, 8.5).roundedRect(x + 8, y + 8, L - 16, A - 16, 5).fill(d.chiaro, "even-odd");
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(1.6).stroke(ORO);
  doc.roundedRect(x + 8, y + 8, L - 16, A - 16, 5).lineWidth(0.8).stroke(ORO);
  doc.roundedRect(x + 11, y + 11, L - 22, A - 22, 4).lineWidth(0.5).dash(1, { space: 2.5 }).stroke(ORO).undash();
  // stelline negli angoli (uguali a coppie opposte)
  for (const [sx, sy] of [[x + 18, y + 18], [x + L - 18, y + 18], [x + 18, y + A - 18], [x + L - 18, y + A - 18]] as const) {
    scintilla(doc, sx, sy, 3.5, ORO);
  }
  // stemma: due anelli e un ottagono vuoto con una stella al centro
  const r = 56;
  doc.circle(cx, cy, r + 9).lineWidth(0.9).stroke(ORO);
  doc.circle(cx, cy, r - 9).lineWidth(0.6).stroke(ORO);
  doc.polygon(...ottagono(cx, cy, r - 20)).lineWidth(1.2).stroke(d.chiaro);
  scintilla(doc, cx, cy, 13, d.chiaro);
  // nome in cerchio, due volte (in alto e, girato, in basso), con una stellina tra le due scritte
  const testo = d.titolo.toUpperCase();
  const corpo = 10;
  doc.font(FONT.nero).fontSize(corpo).fillColor(d.chiaro);
  const spazio = 1.2;
  const larghezze = [...testo].map((ch) => doc.widthOfString(ch) + spazio);
  const arco = larghezze.reduce((s, w) => s + w, 0) - spazio;
  for (const centro of [-90, 90]) {
    let angolo = centro - ((arco / r) * 180) / Math.PI / 2;
    [...testo].forEach((ch, i) => {
      const w = larghezze[i]!;
      const meta = angolo + ((w - spazio) / 2 / r) * (180 / Math.PI);
      const rad = (meta * Math.PI) / 180;
      const px = cx + r * Math.cos(rad);
      const py = cy + r * Math.sin(rad);
      doc.save().translate(px, py).rotate(meta + 90);
      doc.text(ch, -(w - spazio) / 2, -corpo * 0.62, { lineBreak: false });
      doc.restore();
      angolo += (w / r) * (180 / Math.PI);
    });
  }
  for (const a of [0, 180]) {
    const rad = (a * Math.PI) / 180;
    scintilla(doc, cx + r * Math.cos(rad), cy + r * Math.sin(rad), 4, ORO);
  }
}

/* ---------------- plancia del giocatore ---------------- */

const PLANCIA_COLORI = { carica: "#3e8a4f", stanche: "#5a3488", attacchi: "#c63d2f", nascosti: "#2d5f9a", mancia: "#a8801f", punti: "#a8801f" };
const mm = (v: number) => v * MM;

/** Posto di una carta: contorno tratteggiato con gli angoli arrotondati. */
function postoCarta(doc: Doc, x: number, y: number, w: number, h: number, colore: string, opacita = 1) {
  doc.save().strokeOpacity(opacita);
  doc.roundedRect(x, y, w, h, mm(2.5)).lineWidth(0.7).dash(2.2, { space: 2 }).stroke(colore).undash();
  doc.restore();
}

/** Fulmine (carte cariche). */
function fulmine(doc: Doc, x: number, y: number, h: number, colore: string) {
  const k = h / 10;
  doc.polygon([x + 4 * k, y], [x + 7 * k, y], [x + 5.2 * k, y + 4 * k], [x + 7.5 * k, y + 4 * k], [x + 2.5 * k, y + 10 * k], [x + 3.8 * k, y + 5.6 * k], [x + 1.5 * k, y + 5.6 * k]).fill(colore);
}

/**
 * Zona della plancia: fondo appena colorato, bordo, e un'etichetta piena (con l'icona) a cavallo del bordo in alto.
 * Restituisce dove cominciano i posti delle carte.
 */
function zonaPlancia(doc: Doc, x: number, y: number, w: number, h: number, colore: string, titolo: string, icona?: (x: number, y: number) => void, nota = "") {
  doc.save().fillOpacity(0.07).roundedRect(x, y, w, h, mm(3)).fill(colore).restore();
  doc.roundedRect(x, y, w, h, mm(3)).lineWidth(1.3).stroke(colore);
  doc.font(FONT.nero).fontSize(8);
  if (!titolo) return;
  const lt = doc.widthOfString(titolo) + (icona ? mm(4.2) : 0) + mm(4);
  const ty = y - mm(2.8);
  doc.roundedRect(x + mm(3), ty, lt, mm(5.6), mm(2.8)).fill(colore);
  if (icona) icona(x + mm(4.6), ty + mm(1.1));
  doc.fillColor("#ffffff").text(titolo, x + mm(3) + (icona ? mm(5.6) : mm(2)), ty + mm(1.25), { lineBreak: false });
  if (nota) {
    doc.font(FONT.mano).fontSize(9.5).fillColor(colore);
    doc.text(nota, x + mm(5) + lt, y + mm(0.6), { width: Math.max(0, w - lt - mm(9)), align: "right", lineBreak: false });
  }
}

/** Freccia piena (verso sinistra o verso l'alto) con una scritta piccola. */
function frecciaPlancia(doc: Doc, cx: number, cy: number, verso: "sinistra" | "su", testo: string) {
  const k = mm(1);
  doc.save().translate(cx, cy).rotate(verso === "su" ? 90 : 0);
  doc.polygon([-3.5 * k, 0], [0, -3 * k], [0, -1.3 * k], [3.5 * k, -1.3 * k], [3.5 * k, 1.3 * k], [0, 1.3 * k], [0, 3 * k]).fill(ORO);
  doc.restore();
  doc.font(FONT.mano).fontSize(8).fillColor(MATITA);
  if (verso === "sinistra") doc.text(testo, cx - mm(8), cy + mm(3.6), { width: mm(16), align: "center", lineBreak: false });
  else doc.text(testo, cx + mm(4), cy - mm(1.6), { lineBreak: false });
}

/**
 * Plancia di un giocatore su un A4 orizzontale, per carte larghe `C` e alte `H` (mm). I personaggi nascosti restano in mano.
 * Le carte pronte (attivate e cariche) sono divise per tipo: ATTACCO e AIUTO in alto, DIFESA (un posto per livello) in basso,
 * con gli ATTACCHI IN ATTESA e la MANCIA. Le carte stanche stanno sul tavolo, appena fuori dal bordo basso del foglio,
 * sotto le tacche della scaletta (1 turno, 2 turni, 3+ turni): a ogni tuo turno scendono di una tacca verso sinistra.
 * A destra il segnapunti 0–30.
 */
function plancia(doc: Doc, C: number, H: number) {
  const col = { attacco: COLORI_TIPI.attacco.colore, difesa: COLORI_TIPI.difesa.colore, aiuto: COLORI_TIPI.aiuto.scuro, ...PLANCIA_COLORI };
  const M = 4.5; // margine del foglio
  const W = 297 - 2 * M;
  const T = 210 - 2 * M;
  // cornice del foglio: pergamena leggera e doppio filo dorato
  doc.save().fillOpacity(0.35).roundedRect(mm(M), mm(M), mm(W), mm(T), mm(4)).fill("#f6ecd2").restore();
  doc.roundedRect(mm(M), mm(M), mm(W), mm(T), mm(4)).lineWidth(1.6).stroke(ORO);
  doc.roundedRect(mm(M + 1.4), mm(M + 1.4), mm(W - 2.8), mm(T - 2.8), mm(3)).lineWidth(0.5).dash(1, { space: 2 }).stroke(ORO).undash();

  const pad = 0.8;
  const testa = 2.5; // spazio sotto l'etichetta
  const riga = H + 2 * pad + testa;
  const gap = 2;
  const striscia = 6.5; // in basso, sul bordo: le tacche della scaletta delle carte stanche
  const tw = 11;
  const xs = M + 3;
  const larga = W - 6 - tw - 3;
  // dal basso: la striscia delle tacche tocca il bordo del foglio, sopra ci sono le due righe di zone
  const yS = M + T - 1.6 - striscia;
  const yBasso = yS - 1.6 - riga;
  const yTop = yBasso - gap - riga;
  const spazioSopra = yTop - M - 3.5;
  /** Carte a ventaglio: la prima intera, le altre più leggere (con un'etichetta piccola in alto, se c'è). */
  const ventaglio = (x: number, y: number, quante: number, passo: number, colore: string, etichette: string[] = []) => {
    for (let k = quante - 1; k >= 0; k--) {
      postoCarta(doc, mm(x + k * passo), mm(y), mm(C), mm(H), colore, k === 0 ? 1 : 0.35);
      if (etichette[k]) doc.font(FONT.nero).fontSize(7).fillColor(colore).text(etichette[k]!, mm(x + k * passo + 1.5), mm(y + 1.5), { lineBreak: false });
    }
  };
  const larghezzaVentaglio = (quante: number, passo: number) => C + (quante - 1) * passo + 2 * pad + 4;

  // riga in alto: le carte pronte d'attacco e d'aiuto
  const wMezza = (larga - gap) / 2;
  const passoA = Math.min(C * 0.6, (wMezza - C - 2 * pad - 4) / 4);
  zonaPlancia(doc, mm(xs), mm(yTop), mm(wMezza), mm(riga), col.attacco, "ATTACCO", undefined, "pronte da usare");
  ventaglio(xs + 2, yTop + testa + pad, 5, passoA, col.attacco);
  const xAiuto = xs + wMezza + gap;
  zonaPlancia(doc, mm(xAiuto), mm(yTop), mm(wMezza), mm(riga), col.aiuto, "AIUTO", undefined, "pronte da usare · le sempre attive stanno qui");
  ventaglio(xAiuto + 2, yTop + testa + pad, 5, passoA, col.aiuto);

  // riga in basso: difese pronte (un posto per livello), attacchi in attesa, mancia, nome
  const yc = yBasso + testa + pad;
  const wMancia = Math.max(C / 2 + 6, 26);
  const passoD = Math.max(8, Math.min(C * 0.6, 22, (larga - wMancia - 3 * gap - 2 * (C + 2 * pad + 4)) / 4));
  const wDifesa = larghezzaVentaglio(3, passoD);
  zonaPlancia(doc, mm(xs), mm(yBasso), mm(wDifesa), mm(riga), col.difesa, "DIFESA", undefined, "1 per livello");
  ventaglio(xs + 2, yc, 3, passoD, col.difesa, ["liv. 1", "liv. 2", "liv. 3"]);
  const xa = xs + wDifesa + gap;
  const wAttesa = larghezzaVentaglio(3, passoD);
  zonaPlancia(doc, mm(xa), mm(yBasso), mm(wAttesa), mm(riga), col.attacchi, "IN ATTESA", undefined, "scoperti · max 3");
  ventaglio(xa + 2, yc, 3, passoD, col.attacchi);
  const xm = xa + wAttesa + gap;
  zonaPlancia(doc, mm(xm), mm(yBasso), mm(wMancia), mm(riga), col.mancia, "MANCIA");
  for (let k = 0; k < 2; k++) postoCarta(doc, mm(xm + (wMancia - C / 2) / 2), mm(yc + k * (H / 2 + 0.8)), mm(C / 2), mm(H / 2 - 0.4), col.mancia);
  // nel posto che resta: titolo, nome e promemoria delle regole
  const xn = xm + wMancia + gap;
  const wn = xs + larga - xn;
  const promemoria = [
    "3 mosse a turno · a fine turno al massimo 7 carte numero",
    "i personaggi nascosti si tengono in mano",
    "carico: chi si difende con una carta attivata scarta almeno il carico o fa harakiri",
  ];
  if (spazioSopra > 9) {
    // carte piccole: titolo, nome e promemoria in alto
    doc.font(FONT.nero).fontSize(16).fillColor("#7a4a26").text("La Famiglia", mm(xs + 1), mm(M + 4), { lineBreak: false });
    doc.font(FONT.mano).fontSize(14).fillColor(MATITA).text("plancia di ____________________", mm(xs + 1), mm(M + 12), { lineBreak: false });
    promemoria.forEach((r, k) => rigaCheSta(doc, r, mm(xs + 90), mm(M + 4 + k * 6.5), mm(larga - 90), FONT.mano, 11, MATITA, "right"));
  } else if (wn > 30) {
    // titolo e promemoria nel posto che resta in basso a destra
    doc.font(FONT.nero).fontSize(16).fillColor("#7a4a26").text("La Famiglia", mm(xn), mm(yBasso + 2), { width: mm(wn), align: "center", lineBreak: false });
    scintilla(doc, mm(xn + wn / 2), mm(yBasso + 12), mm(1.8), ORO);
    doc.font(FONT.mano).fontSize(13).fillColor(MATITA).text("plancia di", mm(xn), mm(yBasso + 15), { width: mm(wn), align: "center", lineBreak: false });
    doc.moveTo(mm(xn + 4), mm(yBasso + 28)).lineTo(mm(xn + wn - 4), mm(yBasso + 28)).lineWidth(0.6).dash(1.5, { space: 1.5 }).stroke(MATITA).undash();
    promemoria.forEach((r, k) => rigaCheSta(doc, `· ${r}`, mm(xn + 1), mm(yBasso + 31 + k * 9), mm(wn - 2), FONT.mano, 9.5, MATITA, "left"));
  }

  // bordo basso: le tacche della scaletta; le carte stanche si appoggiano sul tavolo, sotto il foglio
  const wTacca = C + 4;
  const gT = 7;
  ["1 TURNO", "2 TURNI", "3+ TURNI"].forEach((testo, i) => {
    const x = xs + i * (wTacca + gT);
    doc.roundedRect(mm(x), mm(yS), mm(wTacca), mm(striscia - 1.5), mm(2)).fill(col.stanche);
    doc.font(FONT.nero).fontSize(8).fillColor("#ffffff").text(`${testo}  z Z`, mm(x), mm(yS + 1.4), { width: mm(wTacca), align: "center", lineBreak: false });
    // freccia verso il bordo del foglio: la carta stanca va qui sotto
    const cx = mm(x + wTacca / 2);
    doc.polygon([cx - mm(2.2), mm(yS + striscia - 1.5)], [cx + mm(2.2), mm(yS + striscia - 1.5)], [cx, mm(yS + striscia + 0.6)]).fill(col.stanche);
    if (i > 0) frecciaPlancia(doc, mm(x - gT / 2), mm(yS + (striscia - 1.5) / 2), "sinistra", "");
  });
  const fine = xs + 3 * (wTacca + gT) - gT + 2;
  const quanto = xs + larga - fine;
  if (wn <= 30 && spazioSopra <= 9) {
    // carte grandi: titolo e nome qui, accanto alle tacche
    rigaCheSta(doc, "La Famiglia · plancia di ________", mm(fine), mm(yS + 0.2), mm(quanto), FONT.nero, 9, "#7a4a26", "right");
    rigaCheSta(doc, "carte stanche fuori dal foglio, sotto le tacche: ogni tuo turno una tacca a sinistra", mm(fine), mm(yS + 3.6), mm(quanto), FONT.mano, 8.5, MATITA, "right");
  } else {
    rigaCheSta(doc, "le carte stanche, fuori dal foglio sotto le tacche: a ogni tuo turno scendono di una tacca", mm(fine), mm(yS + 1), mm(quanto), FONT.mano, 10, MATITA, "left");
  }

  // segnapunti: monete da 0 (in basso) a 30 (in alto)
  const xt = M + W - 3 - tw;
  const hT = 2 * riga + gap;
  zonaPlancia(doc, mm(xt), mm(yTop), mm(tw), mm(hT), col.punti, "");
  doc.font(FONT.nero).fontSize(6.5).fillColor(col.punti).text("PUNTI", mm(xt), mm(yTop + 1.2), { width: mm(tw), align: "center", lineBreak: false });
  const passoT = (hT - 7) / 31;
  for (let n = 0; n <= 30; n++) {
    const cy = mm(yTop + hT - 1.5 - passoT * (n + 0.5));
    const r = mm(Math.min(passoT * 0.45, 3.4));
    const tondo = n % 5 === 0;
    if (tondo) doc.circle(mm(xt + tw / 2), cy, r).lineWidth(0.8).fillAndStroke("#f3dc9a", ORO);
    else doc.circle(mm(xt + tw / 2), cy, r).lineWidth(0.6).stroke(ORO);
    const corpo = Math.min(7, (r / MM) * 2.2);
    doc.font(tondo ? FONT.nero : FONT.normale).fontSize(corpo).fillColor(tondo ? "#7a4a26" : MATITA);
    doc.text(String(n), mm(xt), cy - corpo * 0.42, { width: mm(tw), align: "center", lineBreak: false });
  }
}

/** La plancia: un A4 orizzontale, con i posti grandi come le carte stampate (9 o 16 per foglio). */
function paginePlancia(doc: Doc, g: Griglia) {
  doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
  plancia(doc, (L * g.scala) / MM, (A * g.scala) / MM);
}

/* ---------------- impaginazione ---------------- */

type Disegno = (doc: Doc, x: number, y: number) => void;

/** Posti delle carte in una pagina (da sinistra a destra, dall'alto in basso) e quanto sono grandi (scala 1 = poker). */
interface Griglia {
  posti: { x: number; y: number }[];
  colonne: number;
  scala: number;
}

/**
 * Colonne × righe di carte al centro del foglio, con lo spazio per tagliare tra l'una e l'altra.
 * Senza `scala` le carte sono le più grandi che ci stanno (al massimo formato poker).
 * La griglia è simmetrica, così i dorsi a specchio combaciano.
 */
function griglia(colonne: number, righe: number, scala?: number): Griglia {
  const s = scala ?? Math.min(1, (UTILE.w - (colonne - 1) * SPAZIO) / (colonne * L), (UTILE.h - (righe - 1) * SPAZIO) / (righe * A));
  const w = L * s;
  const h = A * s;
  const x0 = (PAGINA.w - colonne * w - (colonne - 1) * SPAZIO) / 2;
  const y0 = (PAGINA.h - righe * h - (righe - 1) * SPAZIO) / 2;
  const posti: Griglia["posti"] = [];
  for (let r = 0; r < righe; r++) {
    for (let c = 0; c < colonne; c++) posti.push({ x: x0 + c * (w + SPAZIO), y: y0 + r * (h + SPAZIO) });
  }
  return { posti, colonne, scala: s };
}

/** Mancia: carte piccole, 4 nello spazio di una carta poker (6 × 6 per foglio), qualsiasi sia il formato scelto. */
const GRIGLIA_MANCIA = griglia(6, 6, (L - SPAZIO) / (2 * L));

/** Disegna una carta nel suo posto, rimpicciolita se serve. */
function disegna(doc: Doc, d: Disegno, x: number, y: number, scala: number) {
  if (scala === 1) return d(doc, x, y);
  doc.save().translate(x, y).scale(scala);
  d(doc, 0, 0);
  doc.restore();
}

/** Linee per ritagliare, fuori dalle carte, in corrispondenza di ogni bordo. */
function lineeDiTaglio(doc: Doc, g: Griglia) {
  const w = L * g.scala;
  const h = A * g.scala;
  const xs = [...new Set(g.posti.flatMap((p) => [p.x, p.x + w]))];
  const ys = [...new Set(g.posti.flatMap((p) => [p.y, p.y + h]))];
  const sopra = Math.min(...ys);
  const sotto = Math.max(...ys);
  const sinistra = Math.min(...xs);
  const destra = Math.max(...xs);
  doc.lineWidth(0.4).strokeColor("#999999");
  for (const x of xs) {
    doc.moveTo(x, sopra - 12).lineTo(x, sopra - 3).stroke();
    doc.moveTo(x, sotto + 3).lineTo(x, sotto + 12).stroke();
  }
  for (const y of ys) {
    doc.moveTo(sinistra - 12, y).lineTo(sinistra - 3, y).stroke();
    doc.moveTo(destra + 3, y).lineTo(destra + 12, y).stroke();
  }
}

function scrittaInFondo(doc: Doc, testo: string) {
  doc.font(FONT.normale).fontSize(7).fillColor("#999999").text(testo, 0, PAGINA.h - 20, { width: PAGINA.w, align: "center", lineBreak: false });
}

/** Pagine aggiunte finora: in fronte/retro le carte devono cominciare sul davanti di un foglio (pagina dispari). */
let pagineFatte = 0;

/**
 * Le carte, una pagina dopo l'altra, con le linee di taglio e una scritta piccola in fondo.
 * Con `retro` dopo ogni pagina c'è quella dei dorsi, a specchio (fronte/retro sul lato lungo).
 */
function pagine(doc: Doc, disegni: Disegno[], titolo: string, g: Griglia, opzioni: { retro?: Mazzo; dorsiPrima?: boolean } = {}) {
  const perPagina = g.posti.length;
  const totale = Math.ceil(disegni.length / perPagina);
  const { retro } = opzioni;
  if (retro && opzioni.dorsiPrima) {
    // prima tutte le pagine di dorsi, poi tutte quelle delle carte. Ogni pagina di dorsi è piena (anche l'ultima):
    // le pagine di dorsi sono tutte uguali e la griglia è simmetrica, così il foglio si può rimettere girato come capita
    for (let n = 1; n <= totale; n++) {
      doc.addPage({ size: "A4", margin: 0 });
      for (const p of g.posti) disegna(doc, (d, x, y) => dorso(d, x, y, retro), p.x, p.y, g.scala);
      lineeDiTaglio(doc, g);
      scrittaInFondo(doc, `La Famiglia · ${titolo} · dorsi ${n}/${totale} (stampali prima, sul lato opaco)`);
    }
    for (let i = 0; i < disegni.length; i += perPagina) {
      doc.addPage({ size: "A4", margin: 0 });
      disegni.slice(i, i + perPagina).forEach((d, k) => disegna(doc, d, g.posti[k]!.x, g.posti[k]!.y, g.scala));
      lineeDiTaglio(doc, g);
      scrittaInFondo(doc, `La Famiglia · ${titolo} · ${i / perPagina + 1}/${totale}`);
    }
    return;
  }
  if (retro && pagineFatte % 2 === 1) {
    doc.addPage({ size: "A4", margin: 0 });
    scrittaInFondo(doc, "pagina lasciata bianca (retro della pagina prima)");
  }
  for (let i = 0; i < disegni.length; i += perPagina) {
    const n = i / perPagina + 1;
    const qui = disegni.slice(i, i + perPagina);
    doc.addPage({ size: "A4", margin: 0 });
    qui.forEach((d, k) => disegna(doc, d, g.posti[k]!.x, g.posti[k]!.y, g.scala));
    lineeDiTaglio(doc, g);
    scrittaInFondo(doc, `La Famiglia · ${titolo} · ${n}/${totale}`);
    if (!retro) continue;
    doc.addPage({ size: "A4", margin: 0 });
    qui.forEach((_, k) => {
      const specchio = Math.floor(k / g.colonne) * g.colonne + (g.colonne - 1 - (k % g.colonne));
      disegna(doc, (d, x, y) => dorso(d, x, y, retro), g.posti[specchio]!.x, g.posti[specchio]!.y, g.scala);
    });
    lineeDiTaglio(doc, g);
    scrittaInFondo(doc, `La Famiglia · ${titolo} · retro della pagina ${n}/${totale}`);
  }
}

/* ---------------- tabella riassuntiva dei poteri ---------------- */

interface Colonna {
  titolo: string;
  larghezza: number;
}

/** Tabella su A4 con titolo (e una nota piccola accanto, se c'è), che continua su altre pagine se serve. */
function tabella(doc: Doc, titolo: string, colonne: Colonna[], righe: { celle: string[]; colore?: string }[], nota?: string) {
  const margine = 30;
  const spazio = 3;
  const dim = 7.4;
  let y = 0;
  const intestazione = () => {
    doc.addPage({ size: "A4", margin: 0 });
    doc.font(FONT.nero).fontSize(15).fillColor("#7a4a26").text(titolo, margine, 26, { width: PAGINA.w - 2 * margine });
    if (nota) {
      const dopo = margine + doc.font(FONT.nero).fontSize(15).widthOfString(titolo) + 12;
      doc.font(FONT.normale).fontSize(8.5).fillColor(MATITA).text(nota, dopo, 32, { width: PAGINA.w - margine - dopo, lineBreak: false });
    }
    y = 52;
    let x = margine;
    doc.rect(margine, y, PAGINA.w - 2 * margine, 16).fill("#7a4a26");
    for (const c of colonne) {
      doc.font(FONT.forte).fontSize(dim + 0.4).fillColor("#ffffff").text(c.titolo, x + spazio, y + 4, { width: c.larghezza - 2 * spazio, lineBreak: false });
      x += c.larghezza;
    }
    y += 16;
  };
  intestazione();
  righe.forEach((r, i) => {
    const alt = Math.max(...r.celle.map((testo, k) => doc.font(k === 0 ? FONT.forte : FONT.normale).fontSize(dim).heightOfString(testo, { width: colonne[k]!.larghezza - 2 * spazio }))) + 2 * spazio;
    if (y + alt > PAGINA.h - 30) intestazione();
    if (i % 2 === 0) doc.rect(margine, y, PAGINA.w - 2 * margine, alt).fill("#f6ecd9");
    let x = margine;
    r.celle.forEach((testo, k) => {
      const colore = k === 2 && r.colore ? r.colore : INCHIOSTRO;
      doc.font(k === 0 || k === 2 ? FONT.forte : FONT.normale).fontSize(dim).fillColor(colore).text(testo, x + spazio, y + spazio, { width: colonne[k]!.larghezza - 2 * spazio });
      x += colonne[k]!.larghezza;
    });
    y += alt;
  });
}

const NOME_TIPO: Record<Tipologia, string> = {
  attacco: "Attacco",
  difesa: "Difesa",
  aiuto: "Aiuto",
  blu: "Aiuto sempre attivo",
  difesaUnaVolta: "Difesa usa e getta",
  attaccoUnaVolta: "Attacco usa e getta",
};

/** Tutti i poteri delle carte personaggio, difesa e attacco, nell'ordine del mazzo; poi gli eventi. */
function tabellaPoteri(doc: Doc, carte: readonly Carta[], conEventi: boolean) {
  const colonne: Colonna[] = [
    { titolo: "Carta", larghezza: 92 },
    { titolo: "Liv. / punti", larghezza: 46 },
    { titolo: "Potere", larghezza: 92 },
    { titolo: "Cosa fa", larghezza: 197 },
    { titolo: "Codice", larghezza: 70 },
    { titolo: "Ricarica", larghezza: 38 },
  ];
  const righe = carte.flatMap((c) => {
    const oggetto = c.categoria !== "personaggio";
    const nome = oggetto ? `${pulito(c.nome)} (carta ${c.categoria}${c.copie > 1 ? `, ${c.copie} copie` : ""})` : `${pulito(c.nome)}${c.id === c.persona ? "" : ` ${c.livello}`}`;
    const livello = oggetto ? `liv. ${c.livello} · 0 punti` : `liv. ${c.livello} · ${puntiCarta(c.id, OPZIONI_DEFAULT)} ${puntiCarta(c.id, OPZIONI_DEFAULT) === 1 ? "punto" : "punti"}`;
    const ricarica = oggetto ? "si usa una volta" : c.ricarica === 0 ? "non si stanca" : `${c.ricarica} ${c.ricarica === 1 ? "turno" : "turni"}`;
    return c.poteri.map((p, i) => ({
      celle: [
        i === 0 ? nome : "",
        i === 0 ? livello : "",
        `${pulito(p.nome)}${CON_DETTAGLI.has(p.id) ? " *" : ""}
(${NOME_TIPO[tipologiaPotere(c, p)]})`,
        pulito(p.testo),
        i === 0 ? pulito(descriviCodice(c.codice)) : "",
        i === 0 ? ricarica : "",
      ],
      colore: TIPO[tipologiaPotere(c, p)].scuro,
    }));
  });
  if (righe.length > 0) tabella(doc, "Tabella dei poteri", colonne, righe, "* = sulla carta il promemoria non dice tutto: i particolari sono qui in \"Cosa fa\"");
  if (!conEventi) return;
  tabella(
    doc,
    "Eventi e mancia dei nonni",
    [
      { titolo: "Carta", larghezza: 110 },
      { titolo: "Durata", larghezza: 60 },
      { titolo: "Cosa fa", larghezza: 365 },
    ],
    [
      ...EVENTI.map((e) => ({ celle: [pulito(e.nome), `${e.durata} ${e.durata === 1 ? "turno" : "turni"}`, pulito(e.testo)] })),
      { celle: ["Mancia: banconota", "", "Nei codici vale come una carta numero del suo valore. Poi si scarta."] },
      { celle: ["Mancia: caffè", "", "Quando vuoi: 1 mossa in più, oppure +1 al valore di una carta per pagare un codice. Poi si scarta."] },
    ],
  );
}

/** Prima pagina: cosa c'è e come stampare. */
function copertina(doc: Doc, conteggi: Record<string, number>, g: Griglia) {
  const misura = (n: number) => (Math.round(n * g.scala * 10) / 10).toLocaleString("it-IT");
  doc.addPage({ size: "A4", margin: 0 });
  doc.font(FONT.nero).fontSize(30).fillColor("#7a4a26").text("La Famiglia", 0, 90, { width: PAGINA.w, align: "center" });
  doc.font(FONT.mano).fontSize(18).fillColor(MATITA).text("le carte da stampare", 0, 130, { width: PAGINA.w, align: "center" });
  const righe = [
    `Personaggi, difese e attacchi: ${conteggi.personaggi} carte`,
    `Carte numero: ${conteggi.numeri} carte`,
    `Mancia dei nonni: ${conteggi.mancia} carte piccole (4 nello spazio di una carta)`,
    `Eventi: ${conteggi.eventi} carte`,
    "Subito dopo questa pagina: la tabella con tutti i poteri (sulle carte c'è solo il nome del potere).",
    "Stemmi: rosso = attacco, blu = difesa, verde = aiuto, azzurro con il simbolo dell'infinito = carta sempre attiva.",
    "In fondo: una pagina di dorsi per ogni mazzo (stampatela quante volte servono).",
    "Per avere i dorsi già dietro alle carte: pnpm stampa:famiglia --fronte-retro (stampa fronte/retro, lato lungo).",
    "",
    "Come stampare:",
    "- foglio A4, stampa al 100% (\"dimensione reale\", non \"adatta alla pagina\");",
    g.scala === 1
      ? "- ogni carta è in formato poker, 63,5 x 88,9 mm: va bene nelle bustine protettive da carte;"
      : `- ${g.posti.length} carte per foglio, rimpicciolite a ${misura(63.5)} x ${misura(88.9)} mm (il formato poker è con 9 per foglio);`,
    "- tra una carta e l'altra ci sono 4 mm: ritagliate seguendo le lineette grigie ai bordi; un cartoncino da 200-300 g o le bustine con una carta dietro le rendono robuste;",
    "- le carte numero, la mancia e gli eventi hanno ognuno il suo dorso.",
    "",
    "Punti: regole del 2026-10-26 (le carte solo aiuto valgono 0; +1 punto per ogni attacco a segno e difesa riuscita; si vince a 25).",
  ];
  doc.font(FONT.normale).fontSize(11).fillColor(INCHIOSTRO);
  let y = 200;
  for (const r of righe) {
    doc.text(r, 70, y, { width: PAGINA.w - 140 });
    y = doc.y + 4;
  }
}

/** Cosa stampare: tutto, oppure solo le persone, carte e mazzi scritti dopo il comando. */
interface Scelta {
  tutto: boolean;
  carte: Carta[];
  numeri: boolean;
  mancia: boolean;
  eventi: boolean;
  dorsi: boolean;
  tabella: boolean;
  unaCopia: boolean;
  fronteRetro: boolean;
  /** Fronte/retro a mano: prima tutte le pagine di dorsi (piene), poi tutte quelle delle carte. */
  dorsiPrima: boolean;
  /** Dorsi leggeri, con poco inchiostro. */
  leggero: boolean;
  /** Plancia del giocatore. */
  plancia: boolean;
  /** Carte per foglio: 9, 16 o 30. */
  perFoglio: number;
}

function leggiScelta(argomenti: string[]): Scelta {
  let parole = argomenti.filter((a) => a !== "--").map((a) => a.trim().toLowerCase()).filter(Boolean);
  // --per-foglio 16 oppure --per-foglio=16
  let perFoglio = 9;
  const i = parole.findIndex((a) => a === "--per-foglio" || a.startsWith("--per-foglio="));
  if (i >= 0) {
    const conUguale = parole[i]!.includes("=");
    perFoglio = Number(conUguale ? parole[i]!.split("=")[1] : parole[i + 1]);
    parole = parole.filter((_, k) => k !== i && (conUguale || k !== i + 1));
    if (!FORMATI[perFoglio]) {
      console.error(`Carte per foglio: si può scegliere ${Object.keys(FORMATI).join(", ")} (es. --per-foglio 16).`);
      process.exit(1);
    }
  }
  const unaCopia = parole.includes("--una-copia");
  const leggero = parole.includes("--dorso-leggero");
  const senzaTabella = parole.includes("--senza-tabella");
  const dorsiPrima = parole.includes("--dorsi-prima");
  const fronteRetro = parole.includes("--fronte-retro") || dorsiPrima;
  const nomi = parole.filter((a) => !["--una-copia", "--fronte-retro", "--dorso-leggero", "--senza-tabella", "--dorsi-prima"].includes(a));
  if (nomi.length === 0) {
    return { tutto: true, carte: [...CARTE], numeri: true, mancia: true, eventi: true, dorsi: !fronteRetro, tabella: !senzaTabella, unaCopia, fronteRetro, dorsiPrima, leggero, plancia: false, perFoglio };
  }
  const MAZZI = ["numeri", "mancia", "eventi", "dorsi", "tabella", "personaggi", "plancia"];
  const sconosciuti = nomi.filter((n) => !MAZZI.includes(n) && !CARTE.some((c) => c.id === n || c.persona === n));
  if (sconosciuti.length > 0) {
    console.error(`Non trovo: ${sconosciuti.join(", ")}`);
    console.error(`Si possono scrivere le persone (es. antonio), le carte (es. antonio-2), oppure: ${MAZZI.join(", ")}.`);
    console.error(`Persone: ${[...new Set(CARTE.map((c) => c.persona))].join(", ")}`);
    process.exit(1);
  }
  const carte = nomi.includes("personaggi") ? [...CARTE] : CARTE.filter((c) => nomi.includes(c.id) || nomi.includes(c.persona));
  return {
    tutto: false,
    carte,
    numeri: nomi.includes("numeri"),
    mancia: nomi.includes("mancia"),
    eventi: nomi.includes("eventi"),
    dorsi: nomi.includes("dorsi"),
    tabella: nomi.includes("tabella") || (carte.length > 0 && !senzaTabella),
    unaCopia,
    fronteRetro,
    dorsiPrima,
    leggero,
    plancia: nomi.includes("plancia"),
    perFoglio,
  };
}

function crea(): void {
  const scelta = leggiScelta(process.argv.slice(2));
  const soloPlancia = scelta.plancia && scelta.carte.length === 0 && !scelta.numeri && !scelta.mancia && !scelta.eventi && !scelta.dorsi;
  if (scelta.plancia && scelta.perFoglio !== 9 && scelta.perFoglio !== 16) {
    console.error("La plancia c'è per le carte da 9 e da 16 per foglio.");
    process.exit(1);
  }
  const file = uscita(scelta.tutto ? "carte" : soloPlancia ? "plancia" : "scelta", scelta.perFoglio, scelta.leggero, scelta.dorsiPrima);
  dorsiLeggeri = scelta.leggero;
  const formato = FORMATI[scelta.perFoglio]!;
  const normale = griglia(formato.colonne, formato.righe);
  mkdirSync(fileURLToPath(new URL("../../../docs/famiglia/stampa/", import.meta.url)), { recursive: true });
  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: { Title: "La Famiglia - carte da stampare", Author: "Online Gaming", Creator: "pnpm stampa:famiglia", CreationDate: DATA_FISSA, ModDate: DATA_FISSA },
  });
  doc.pipe(createWriteStream(file));
  doc.on("pageAdded", () => pagineFatte++);

  // personaggi, difese e attacchi: una carta per copia, nell'ordine del file delle carte
  const personaggi = scelta.carte.flatMap((c) =>
    Array.from({ length: scelta.unaCopia ? 1 : c.copie }, (): Disegno => (d, x, y) => cartaPersonaggio(d, x, y, c)),
  );
  const numeri = scelta.numeri ? creaMazzoNumeri().map((n): Disegno => (d, x, y) => cartaNumero(d, x, y, n)) : [];
  const mancia = scelta.mancia ? creaMazzoMancia().map((m): Disegno => (d, x, y) => cartaMancia(d, x, y, m)) : [];
  const eventi = scelta.eventi ? EVENTI.map((e): Disegno => (d, x, y) => cartaEvento(d, x, y, e)) : [];

  if (scelta.tutto) copertina(doc, { personaggi: personaggi.length, numeri: numeri.length, mancia: mancia.length, eventi: eventi.length }, normale);
  if (scelta.tabella) tabellaPoteri(doc, scelta.carte, scelta.tutto || scelta.eventi || scelta.mancia);
  const retro = (mazzo: Mazzo) => (scelta.fronteRetro ? mazzo : undefined);
  const dorsiPrima = scelta.dorsiPrima;
  if (personaggi.length > 0) pagine(doc, personaggi, "personaggi", normale, { retro: retro("personaggi"), dorsiPrima });
  if (numeri.length > 0) pagine(doc, numeri, "carte numero", normale, { retro: retro("numeri"), dorsiPrima });
  if (mancia.length > 0) pagine(doc, mancia, "mancia dei nonni", GRIGLIA_MANCIA, { retro: retro("mancia"), dorsiPrima });
  if (eventi.length > 0) pagine(doc, eventi, "eventi", normale, { retro: retro("eventi"), dorsiPrima });
  if (scelta.dorsi) {
    for (const mazzo of ["personaggi", "numeri", "mancia", "eventi"] as const) {
      const g = mazzo === "mancia" ? GRIGLIA_MANCIA : normale;
      pagine(doc, Array.from({ length: g.posti.length }, (): Disegno => (d, x, y) => dorso(d, x, y, mazzo)), `dorsi ${mazzo}`, g);
    }
  }
  if (scelta.plancia) paginePlancia(doc, normale);
  if (personaggi.length + numeri.length + mancia.length + eventi.length === 0 && !scelta.tabella && !scelta.dorsi && !scelta.plancia) {
    console.error("Niente da stampare.");
    process.exit(1);
  }
  doc.end();
  console.log(`PDF: ${file}`);
  console.log(`Carte: ${personaggi.length} personaggi, ${numeri.length} numeri, ${mancia.length} mancia, ${eventi.length} eventi`);
}

crea();
