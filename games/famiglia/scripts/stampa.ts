/**
 * Carte della Famiglia da stampare: un PDF in A4 con 9 carte per pagina, formato poker (63,5 × 88,9 mm),
 * con le linee per ritagliare. Tutti i mazzi: personaggi (con difese e attacchi, una carta per copia), carte numero,
 * mancia dei nonni, eventi; in fondo una pagina di dorsi per ogni mazzo.
 *
 * Sempre uguale: stesse carte e stesse immagini danno lo stesso file (ordine fisso, data fissa nel PDF).
 * Le regole dei punti sono quelle di base del gioco (le carte solo aiuto valgono 0).
 *
 * Uso: pnpm stampa:famiglia   → docs/famiglia/stampa/la-famiglia-carte.pdf (tutto)
 *
 * Solo alcune carte: si scrivono dopo il comando (separate da spazi) persone, carte e mazzi:
 *   pnpm stampa:famiglia antonio nonna-maria-2 rocky      → le 3 carte di Antonio, Nonna Maria 2 e Rocky
 *   pnpm stampa:famiglia simone numeri                    → le carte di Simone e le carte numero
 * Parole per i mazzi: numeri, mancia, eventi, dorsi, tabella (personaggi = tutti i personaggi).
 * Con una scelta il file è docs/famiglia/stampa/la-famiglia-scelta.pdf (il PDF completo non si tocca);
 * con --una-copia le carte con più copie (vini, scuse…) si stampano una volta sola.
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
import type { Carta, CartaMancia, CartaNumero, Evento, TipoPotere } from "../src/tipi-carte";

/* ---------------- misure (in punti tipografici: 1 mm = 2,8346 pt) ---------------- */

const MM = 72 / 25.4;
const L = 63.5 * MM; // larghezza della carta (poker)
const A = 88.9 * MM; // altezza
const COLONNE = 3;
const RIGHE = 3;
const PAGINA = { w: 595.28, h: 841.89 }; // A4
const MARGINE_X = (PAGINA.w - COLONNE * L) / 2;
const MARGINE_Y = (PAGINA.h - RIGHE * A) / 2;
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
const USCITA_TUTTO = radice("docs/famiglia/stampa/la-famiglia-carte.pdf");
const USCITA_SCELTA = radice("docs/famiglia/stampa/la-famiglia-scelta.pdf");

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

type Tipologia = TipoPotere | "blu";
const TIPO: Record<Tipologia, { colore: string; scuro: string }> = {
  attacco: { colore: "#c63d2f", scuro: "#8e2219" },
  difesa: { colore: "#2d5f9a", scuro: "#1b3d66" },
  aiuto: { colore: "#3e8a4f", scuro: "#25603a" },
  blu: { colore: "#1f9fc9", scuro: "#14708f" },
};
const CREMA = "#fdf6e6";
const INCHIOSTRO = "#3a2417";
const MATITA = "#7a6048";

const tipologie = (c: Carta): Tipologia[] => [...new Set(c.poteri.map((p): Tipologia => (p.blu ? "blu" : p.tipo)))];
function principale(c: Carta): Tipologia {
  const t = tipologie(c);
  if (t.includes("attacco")) return "attacco";
  if (t.includes("difesa") && !t.includes("aiuto") && !t.includes("blu")) return "difesa";
  return t.includes("aiuto") ? "aiuto" : (t[0] ?? "aiuto");
}

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
  if (tipo === "attacco") {
    // due spade incrociate
    doc.moveTo(13, 14).lineTo(27, 30).stroke(CREMA);
    doc.moveTo(27, 14).lineTo(13, 30).stroke(CREMA);
    doc.moveTo(10, 26).lineTo(16, 32).stroke(CREMA);
    doc.moveTo(30, 26).lineTo(24, 32).stroke(CREMA);
  } else if (tipo === "difesa") {
    // uno scudo piccolo pieno
    doc.path("M20 13 L27 15.5 V22 C27 27 24 30 20 32 C16 30 13 27 13 22 V15.5 Z").fill(CREMA);
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

function cartaPersonaggio(doc: Doc, x: number, y: number, c: Carta) {
  const tipo = principale(c);
  const t = TIPO[tipo];
  const oggetto = c.categoria !== "personaggio";
  cornice(doc, x, y, t.colore, oggetto ? "#f1dfbd" : CREMA);

  // nastro col nome
  doc.rect(x + 4, y + 11, L - 8, 20).fill(t.colore);
  rigaCheSta(doc, pulito(c.nome), x + 34, y + 15.5, L - 34 - 32, FONT.forte, 12, "#ffffff");

  // in basso solo il nome del potere (o dei due poteri): prima si misura quanto spazio serve
  const tx = x + 10;
  const tw = L - 20;
  const nomi = c.poteri.map((p) => ({ nome: pulito(`${p.nome}${p.blu ? " (sempre attiva)" : ""}`), colore: TIPO[p.blu ? "blu" : p.tipo].scuro }));
  let dimNome = 11;
  const altezzaNomi = (d: number) => nomi.reduce((h, n) => h + doc.font(FONT.forte).fontSize(d).heightOfString(n.nome, { width: tw }), 0);
  while (dimNome > 7 && altezzaNomi(dimNome) > 30) dimNome -= 0.5;
  const hNomi = altezzaNomi(dimNome);

  // foto (o iniziale) grande: tutto lo spazio tra il nastro e il nome del potere
  const fx = x + 8;
  const fy = y + 34;
  const fw = L - 16;
  const fh = y + A - 28 - hNomi - 5 - fy;
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

  // livello (stelle) in basso a sinistra sulla foto
  if (!oggetto) {
    doc.roundedRect(fx + 3, fy + fh - 13, 6 + c.livello * 10, 10, 3).fill("#3a2417");
    for (let i = 0; i < c.livello; i++) stella(doc, fx + 11 + i * 10, fy + fh - 8, 4, "#ffd59a");
  }

  // stemmi del tipo (uno per tipo di potere) e punti nel biscotto
  tipologie(c).forEach((tp, i) => stemma(doc, x + 5, y + 4 + i * 33, 26, tp));
  if (!oggetto) {
    const punti = puntiCarta(c.id, OPZIONI_DEFAULT);
    doc.circle(x + L - 17, y + 21, 13).fill("#d18b3c");
    doc.circle(x + L - 17, y + 21, 13).lineWidth(1.2).dash(1.2, { space: 1.4 }).stroke("#8a4f1d").undash();
    doc.font(FONT.nero).fontSize(14).fillColor("#4a2410").text(String(punti), x + L - 30, y + 13.5, { width: 26, align: "center" });
  }

  // nome del potere (la descrizione è nella tabella dei poteri)
  let cy = fy + fh + 4;
  for (const n of nomi) {
    doc.font(FONT.forte).fontSize(dimNome).fillColor(n.colore).text(n.nome, tx, cy, { width: tw, align: "center" });
    cy = doc.y;
  }

  // in fondo: il codice e la ricarica (o "si usa una volta")
  doc.moveTo(tx, y + A - 26).lineTo(tx + tw, y + A - 26).lineWidth(0.5).stroke("#d8c6a6");
  rigaCheSta(doc, `Codice: ${pulito(descriviCodice(c.codice))}`, tx, y + A - 22, tw * 0.64, FONT.mano, 11, MATITA, "left");
  const dx = oggetto ? (c.categoria === "difesa" ? "difesa, una volta" : "attacco, una volta") : c.ricarica === 0 ? "non si stanca" : `ricarica ${c.ricarica}`;
  rigaCheSta(doc, dx, tx + tw * 0.62, y + A - 19.5, tw * 0.38, FONT.normale, 6.5, MATITA, "right");
}

function cartaNumero(doc: Doc, x: number, y: number, c: CartaNumero) {
  const blu = "#2a63a8";
  const giallo = "#f2b632";
  doc.save();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).clip();
  doc.rect(x, y, L, A).fill("#fbf8f1");
  for (const [cx, cy] of [
    [x, y],
    [x + L, y],
    [x, y + A],
    [x + L, y + A],
  ] as const) {
    doc.circle(cx, cy, 52).fill(blu);
    doc.circle(cx, cy, 30).fill(giallo);
  }
  doc.restore();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(3).stroke(blu);
  doc.circle(x + L / 2, y + A / 2, 50).lineWidth(3).fillAndStroke("#ffffff", blu);
  doc.font(FONT.nero).fontSize(64).fillColor("#1f4e8c").text(String(c.valore), x, y + A / 2 - 40, { width: L, align: "center" });
  for (const [cx, cy, ruota] of [
    [x + 18, y + 22, 0],
    [x + L - 18, y + A - 22, 180],
  ] as const) {
    doc.save().rotate(ruota, { origin: [cx, cy] });
    doc.font(FONT.nero).fontSize(15).fillColor("#ffffff").text(String(c.valore), cx - 10, cy - 9, { width: 20, align: "center" });
    doc.restore();
  }
  if (c.campanello) {
    doc.roundedRect(x + L / 2 - 30, y + A - 50, 60, 15, 7).fill("#fffaf0");
    doc.font(FONT.forte).fontSize(8).fillColor("#8a4f1d").text("campanello", x + L / 2 - 30, y + A - 46, { width: 60, align: "center" });
  }
}

function cartaMancia(doc: Doc, x: number, y: number, m: CartaMancia) {
  if (m.tipo === "caffe") {
    cornice(doc, x, y, "#6b3e1d", "#f3e2cf");
    doc.font(FONT.nero).fontSize(15).fillColor("#6b3e1d").text("Mancia dei nonni", x, y + 18, { width: L, align: "center" });
    doc.circle(x + L / 2, y + A / 2 - 10, 34).lineWidth(3).fillAndStroke("#c08a5b", "#6b3e1d");
    doc.font(FONT.nero).fontSize(22).fillColor("#ffffff").text("Caffè", x, y + A / 2 - 22, { width: L, align: "center" });
    doc
      .font(FONT.normale)
      .fontSize(8.5)
      .fillColor(INCHIOSTRO)
      .text("Bevilo quando vuoi: 1 mossa in più, oppure +1 al valore di una carta per pagare un codice. Poi si scarta.", x + 14, y + A - 70, {
        width: L - 28,
        align: "center",
      });
    return;
  }
  cornice(doc, x, y, "#2e7d4f", "#e3f3e6");
  doc.font(FONT.nero).fontSize(15).fillColor("#1d4d31").text("Mancia dei nonni", x, y + 18, { width: L, align: "center" });
  doc.roundedRect(x + 18, y + A / 2 - 38, L - 36, 64, 8).lineWidth(2).dash(3, { space: 2 }).fillAndStroke("#d6f0dc", "#2e7d4f").undash();
  doc.font(FONT.nero).fontSize(44).fillColor("#1d4d31").text(String(m.valore), x, y + A / 2 - 32, { width: L, align: "center" });
  doc
    .font(FONT.normale)
    .fontSize(8.5)
    .fillColor(INCHIOSTRO)
    .text(`Banconota: nei codici vale come una carta numero da ${m.valore}. Poi si scarta.`, x + 14, y + A - 66, { width: L - 28, align: "center" });
}

function cartaEvento(doc: Doc, x: number, y: number, e: Evento) {
  cornice(doc, x, y, "#d65a8f", "#fff0f6");
  doc.font(FONT.mano).fontSize(13).fillColor("#a33d6c").text("Evento", x, y + 14, { width: L, align: "center" });
  rigaCheSta(doc, pulito(e.nome), x + 12, y + 32, L - 24, FONT.nero, 18, "#5a1f3a");
  doc.roundedRect(x + L / 2 - 38, y + 58, 76, 16, 8).fill("#d65a8f");
  doc.font(FONT.forte).fontSize(8.5).fillColor("#ffffff").text(`dura ${e.durata} ${e.durata === 1 ? "turno" : "turni"}`, x + L / 2 - 38, y + 62, { width: 76, align: "center" });
  doc.font(FONT.normale).fontSize(9).fillColor("#5a1f3a").text(pulito(e.testo), x + 16, y + 86, { width: L - 32, align: "center" });
}

/* ---------------- dorsi ---------------- */

type Mazzo = "personaggi" | "numeri" | "mancia" | "eventi";

function dorso(doc: Doc, x: number, y: number, mazzo: Mazzo) {
  doc.save();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).clip();
  if (mazzo === "personaggi") {
    // tovagliolo a quadretti
    doc.rect(x, y, L, A).fill("#fbf4ea");
    doc.fillOpacity(0.5);
    for (let i = 0; i * 12 < Math.max(L, A); i += 2) {
      doc.rect(x + i * 12, y, 12, A).fill("#c4302b");
      doc.rect(x, y + i * 12, L, 12).fill("#c4302b");
    }
    doc.fillOpacity(1);
  } else {
    const [fondo, righe] = mazzo === "numeri" ? ["#2a63a8", "#f2b632"] : mazzo === "mancia" ? ["#2e7d4f", "#d6f0dc"] : ["#d65a8f", "#fff0f6"];
    doc.rect(x, y, L, A).fill(fondo);
    doc.fillOpacity(0.25);
    for (let i = -A; i < L + A; i += 16) doc.polygon([x + i, y], [x + i + 8, y], [x + i + 8 + A, y + A], [x + i + A, y + A]).fill(righe);
    doc.fillOpacity(1);
  }
  doc.restore();
  doc.roundedRect(x + 1.5, y + 1.5, L - 3, A - 3, 9).lineWidth(3).stroke("#7a4a26");
  doc.circle(x + L / 2, y + A / 2, 48).lineWidth(3).fillAndStroke("#fffaf0", "#7a4a26");
  const titolo = { personaggi: "La Famiglia", numeri: "Numeri", mancia: "Mancia", eventi: "Eventi" }[mazzo];
  rigaCheSta(doc, titolo, x + L / 2 - 44, y + A / 2 - 9, 88, FONT.nero, 17, "#7a4a26");
}

/* ---------------- impaginazione ---------------- */

type Disegno = (doc: Doc, x: number, y: number) => void;

/** Linee per ritagliare, fuori dalle carte, sui bordi della griglia. */
function lineeDiTaglio(doc: Doc) {
  doc.lineWidth(0.4).strokeColor("#999999");
  for (let c = 0; c <= COLONNE; c++) {
    const x = MARGINE_X + c * L;
    doc.moveTo(x, MARGINE_Y - 14).lineTo(x, MARGINE_Y - 3).stroke();
    doc.moveTo(x, MARGINE_Y + RIGHE * A + 3).lineTo(x, MARGINE_Y + RIGHE * A + 14).stroke();
  }
  for (let r = 0; r <= RIGHE; r++) {
    const y = MARGINE_Y + r * A;
    doc.moveTo(MARGINE_X - 14, y).lineTo(MARGINE_X - 3, y).stroke();
    doc.moveTo(MARGINE_X + COLONNE * L + 3, y).lineTo(MARGINE_X + COLONNE * L + 14, y).stroke();
  }
}

/** 9 carte per pagina, con le linee di taglio e una scritta piccola in fondo. */
function pagine(doc: Doc, disegni: Disegno[], titolo: string) {
  for (let i = 0; i < disegni.length; i += COLONNE * RIGHE) {
    doc.addPage({ size: "A4", margin: 0 });
    disegni.slice(i, i + COLONNE * RIGHE).forEach((d, k) => d(doc, MARGINE_X + (k % COLONNE) * L, MARGINE_Y + Math.floor(k / COLONNE) * A));
    lineeDiTaglio(doc);
    doc
      .font(FONT.normale)
      .fontSize(7)
      .fillColor("#999999")
      .text(`La Famiglia · ${titolo} · ${i / (COLONNE * RIGHE) + 1}/${Math.ceil(disegni.length / (COLONNE * RIGHE))}`, 0, PAGINA.h - 22, {
        width: PAGINA.w,
        align: "center",
        lineBreak: false,
      });
  }
}

/* ---------------- tabella riassuntiva dei poteri ---------------- */

interface Colonna {
  titolo: string;
  larghezza: number;
}

/** Tabella su più pagine A4: intestazione ripetuta, righe alternate, testo che va a capo. */
function tabella(doc: Doc, titolo: string, colonne: Colonna[], righe: { celle: string[]; colore?: string }[]) {
  const margine = 30;
  const spazio = 3;
  const dim = 7.4;
  let y = 0;
  const intestazione = () => {
    doc.addPage({ size: "A4", margin: 0 });
    doc.font(FONT.nero).fontSize(15).fillColor("#7a4a26").text(titolo, margine, 26, { width: PAGINA.w - 2 * margine });
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

const NOME_TIPO: Record<Tipologia, string> = { attacco: "Attacco", difesa: "Difesa", aiuto: "Aiuto", blu: "Aiuto blu" };

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
        `${pulito(p.nome)}
(${NOME_TIPO[p.blu ? "blu" : p.tipo]})`,
        pulito(p.testo),
        i === 0 ? pulito(descriviCodice(c.codice)) : "",
        i === 0 ? ricarica : "",
      ],
      colore: TIPO[p.blu ? "blu" : p.tipo].scuro,
    }));
  });
  if (righe.length > 0) tabella(doc, "Tabella dei poteri", colonne, righe);
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
function copertina(doc: Doc, conteggi: Record<string, number>) {
  doc.addPage({ size: "A4", margin: 0 });
  doc.font(FONT.nero).fontSize(30).fillColor("#7a4a26").text("La Famiglia", 0, 90, { width: PAGINA.w, align: "center" });
  doc.font(FONT.mano).fontSize(18).fillColor(MATITA).text("le carte da stampare", 0, 130, { width: PAGINA.w, align: "center" });
  const righe = [
    `Personaggi, difese e attacchi: ${conteggi.personaggi} carte`,
    `Carte numero: ${conteggi.numeri} carte`,
    `Mancia dei nonni: ${conteggi.mancia} carte`,
    `Eventi: ${conteggi.eventi} carte`,
    "Subito dopo questa pagina: la tabella con tutti i poteri (sulle carte c'è solo il nome del potere).",
    "In fondo: una pagina di dorsi per ogni mazzo (stampatela quante volte servono).",
    "",
    "Come stampare:",
    "- foglio A4, stampa al 100% (\"dimensione reale\", non \"adatta alla pagina\");",
    "- ogni carta è in formato poker, 63,5 x 88,9 mm: va bene nelle bustine protettive da carte;",
    "- ritagliate seguendo le lineette grigie ai bordi; un cartoncino da 200-300 g o le bustine con una carta dietro le rendono robuste;",
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
}

function leggiScelta(argomenti: string[]): Scelta {
  const parole = argomenti.filter((a) => a !== "--").map((a) => a.trim().toLowerCase()).filter(Boolean);
  const unaCopia = parole.includes("--una-copia");
  const nomi = parole.filter((a) => a !== "--una-copia");
  if (nomi.length === 0) return { tutto: true, carte: [...CARTE], numeri: true, mancia: true, eventi: true, dorsi: true, tabella: true, unaCopia };
  const MAZZI = ["numeri", "mancia", "eventi", "dorsi", "tabella", "personaggi"];
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
    tabella: nomi.includes("tabella") || carte.length > 0,
    unaCopia,
  };
}

function crea(): void {
  const scelta = leggiScelta(process.argv.slice(2));
  const uscita = scelta.tutto ? USCITA_TUTTO : USCITA_SCELTA;
  mkdirSync(fileURLToPath(new URL("../../../docs/famiglia/stampa/", import.meta.url)), { recursive: true });
  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: { Title: "La Famiglia - carte da stampare", Author: "Online Gaming", Creator: "pnpm stampa:famiglia", CreationDate: DATA_FISSA, ModDate: DATA_FISSA },
  });
  doc.pipe(createWriteStream(uscita));

  // personaggi, difese e attacchi: una carta per copia, nell'ordine del file delle carte
  const personaggi = scelta.carte.flatMap((c) =>
    Array.from({ length: scelta.unaCopia ? 1 : c.copie }, (): Disegno => (d, x, y) => cartaPersonaggio(d, x, y, c)),
  );
  const numeri = scelta.numeri ? creaMazzoNumeri().map((n): Disegno => (d, x, y) => cartaNumero(d, x, y, n)) : [];
  const mancia = scelta.mancia ? creaMazzoMancia().map((m): Disegno => (d, x, y) => cartaMancia(d, x, y, m)) : [];
  const eventi = scelta.eventi ? EVENTI.map((e): Disegno => (d, x, y) => cartaEvento(d, x, y, e)) : [];

  if (scelta.tutto) copertina(doc, { personaggi: personaggi.length, numeri: numeri.length, mancia: mancia.length, eventi: eventi.length });
  if (scelta.tabella) tabellaPoteri(doc, scelta.carte, scelta.tutto || scelta.eventi || scelta.mancia);
  if (personaggi.length > 0) pagine(doc, personaggi, "personaggi");
  if (numeri.length > 0) pagine(doc, numeri, "carte numero");
  if (mancia.length + eventi.length > 0) pagine(doc, [...mancia, ...eventi], "mancia ed eventi");
  if (scelta.tutto || scelta.dorsi) {
    for (const mazzo of ["personaggi", "numeri", "mancia", "eventi"] as const) {
      pagine(doc, Array.from({ length: COLONNE * RIGHE }, (): Disegno => (d, x, y) => dorso(d, x, y, mazzo)), `dorsi ${mazzo}`);
    }
  }
  if (personaggi.length + numeri.length + mancia.length + eventi.length === 0 && !scelta.tabella && !scelta.dorsi) {
    console.error("Niente da stampare.");
    process.exit(1);
  }
  doc.end();
  console.log(`PDF: ${uscita}`);
  console.log(`Carte: ${personaggi.length} personaggi, ${numeri.length} numeri, ${mancia.length} mancia, ${eventi.length} eventi`);
}

crea();
