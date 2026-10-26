/**
 * Carte della Famiglia da stampare: un PDF in A4 con 9 carte per pagina, formato poker (63,5 × 88,9 mm),
 * con le linee per ritagliare. Tutti i mazzi: personaggi (con difese e attacchi, una carta per copia), carte numero,
 * mancia dei nonni, eventi; in fondo una pagina di dorsi per ogni mazzo.
 *
 * Sempre uguale: stesse carte e stesse immagini danno lo stesso file (ordine fisso, data fissa nel PDF).
 * Le regole dei punti sono quelle di base del gioco (le carte solo aiuto valgono 0).
 *
 * Uso: pnpm stampa:famiglia   → docs/famiglia/stampa/la-famiglia-carte.pdf
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
const USCITA = radice("docs/famiglia/stampa/la-famiglia-carte.pdf");

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

  // foto (o iniziale) in una cornicetta
  const fx = x + 11;
  const fy = y + 35;
  const fw = L - 22;
  const fh = 104;
  const foto = immagine(c);
  doc.save();
  doc.roundedRect(fx, fy, fw, fh, 5).clip();
  if (foto) doc.image(foto, fx, fy, { cover: [fw, fh], align: "center" }); // in verticale resta in alto (le facce stanno in alto)
  else {
    doc.rect(fx, fy, fw, fh).fill("#f3ead6");
    doc.circle(fx + fw / 2, fy + fh / 2, 26).lineWidth(2).fillAndStroke("#fffaf0", t.colore);
    doc.font(FONT.nero).fontSize(26).fillColor(t.scuro).text(pulito(c.nome).charAt(0), fx, fy + fh / 2 - 15, { width: fw, align: "center" });
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

  // poteri: nome e testo (si rimpicciolisce finché ci sta)
  const tx = x + 11;
  const tw = L - 22;
  const ty = fy + fh + 5;
  const fondo = y + A - 27;
  const blocchi = c.poteri.map((p) => ({ nome: pulito(`${p.nome}${p.blu ? " (sempre attiva)" : ""}`), testo: pulito(p.testo), colore: TIPO[p.blu ? "blu" : p.tipo].scuro }));
  const nota = c.nota ? pulito(c.nota) : "";
  let scala = 1;
  const altezza = (k: number) =>
    blocchi.reduce(
      (h, b) =>
        h +
        doc.font(FONT.forte).fontSize(10 * k).heightOfString(b.nome, { width: tw }) +
        doc.font(FONT.normale).fontSize(8.6 * k).heightOfString(b.testo, { width: tw, lineGap: -0.5 }) +
        2,
      0,
    ) + (nota ? doc.font(FONT.mano).fontSize(10.5 * k).heightOfString(nota, { width: tw }) : 0);
  while (scala > 0.5 && altezza(scala) > fondo - ty) scala -= 0.03;
  let cy = ty;
  for (const b of blocchi) {
    doc.font(FONT.forte).fontSize(10 * scala).fillColor(b.colore).text(b.nome, tx, cy, { width: tw });
    cy = doc.y;
    doc.font(FONT.normale).fontSize(8.6 * scala).fillColor(INCHIOSTRO).text(b.testo, tx, cy, { width: tw, lineGap: -0.5 });
    cy = doc.y + 2;
  }
  if (nota) doc.font(FONT.mano).fontSize(10.5 * scala).fillColor(MATITA).text(nota, tx, cy, { width: tw });

  // in fondo: il codice e la ricarica (o "si usa una volta")
  doc.moveTo(tx, y + A - 25).lineTo(tx + tw, y + A - 25).lineWidth(0.5).stroke("#d8c6a6");
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

function crea(): void {
  mkdirSync(fileURLToPath(new URL("../../../docs/famiglia/stampa/", import.meta.url)), { recursive: true });
  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: { Title: "La Famiglia - carte da stampare", Author: "Online Gaming", Creator: "pnpm stampa:famiglia", CreationDate: DATA_FISSA, ModDate: DATA_FISSA },
  });
  doc.pipe(createWriteStream(USCITA));

  // personaggi, difese e attacchi: una carta per copia, nell'ordine del file delle carte
  const personaggi = CARTE.flatMap((c) => Array.from({ length: c.copie }, (): Disegno => (d, x, y) => cartaPersonaggio(d, x, y, c)));
  const numeri = creaMazzoNumeri().map((n): Disegno => (d, x, y) => cartaNumero(d, x, y, n));
  const mancia = creaMazzoMancia().map((m): Disegno => (d, x, y) => cartaMancia(d, x, y, m));
  const eventi = EVENTI.map((e): Disegno => (d, x, y) => cartaEvento(d, x, y, e));

  copertina(doc, { personaggi: personaggi.length, numeri: numeri.length, mancia: mancia.length, eventi: eventi.length });
  pagine(doc, personaggi, "personaggi");
  pagine(doc, numeri, "carte numero");
  pagine(doc, [...mancia, ...eventi], "mancia ed eventi");
  for (const mazzo of ["personaggi", "numeri", "mancia", "eventi"] as const) {
    pagine(doc, Array.from({ length: COLONNE * RIGHE }, (): Disegno => (d, x, y) => dorso(d, x, y, mazzo)), `dorsi ${mazzo}`);
  }
  doc.end();
  console.log(`PDF: ${USCITA}`);
  console.log(`Carte: ${personaggi.length} personaggi, ${numeri.length} numeri, ${mancia.length} mancia, ${eventi.length} eventi`);
}

crea();
