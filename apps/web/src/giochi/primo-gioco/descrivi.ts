/**
 * Testi in italiano per le mosse e le carte del primo gioco, a partire dalla vista del giocatore.
 */
import {
  type CartaDiamante,
  type CartaNumero,
  type CartaPersonaggio,
  type Elemento,
  type Mossa,
  type VistaGiocatore,
  personaggio,
} from "@og/primo-gioco";

/** "il 7", "l'8", "l'1": articolo giusto davanti a un numero. */
export const ilNumero = (n: number | string | undefined) =>
  n === 1 || n === 8 || n === 11 || n === "1" || n === "8" ? `l'${n}` : `il ${n ?? "?"}`;

/** "a Bruno", "ad Anna". */
export const aPersona = (nome: string) => (/^[aA]/.test(nome) ? `ad ${nome}` : `a ${nome}`);

/** Tutte le carte che il giocatore può vedere, per id. */
export interface Carte {
  numeri: Map<string, CartaNumero>;
  diamanti: Map<string, CartaDiamante>;
  personaggi: Map<string, CartaPersonaggio>;
}

export function raccogliCarte(v: VistaGiocatore): Carte {
  const numeri = new Map<string, CartaNumero>();
  const diamanti = new Map<string, CartaDiamante>();
  const personaggi = new Map<string, CartaPersonaggio>();
  for (const c of [...v.mano, ...(v.manoAvversario ?? [])]) numeri.set(c.id, c);
  for (const c of v.tavolo.numeri) if (c) numeri.set(c.id, c);
  for (const c of v.tavolo.personaggi) if (c) personaggi.set(c.id, c);
  if (v.primoPersonaggio) personaggi.set(v.primoPersonaggio.id, v.primoPersonaggio);
  for (const g of Object.values(v.giocatori)) {
    for (const d of g.diamanti) diamanti.set(d.id, d);
    for (const c of [...g.posti, ...g.attivati]) personaggi.set(c.id, c);
  }
  return { numeri, diamanti, personaggi };
}

export const nomePersonaggio = (c: Carte, id: string) => {
  const carta = c.personaggi.get(id);
  return carta ? personaggio(carta.personaggio).nome : "personaggio";
};

export const testoDiamante = (d: CartaDiamante | undefined) =>
  !d ? "◆" : d.tipo === "fulmine" ? "⚡ fulmine" : `◆${d.valore}`;

function testoElemento(el: Elemento, c: Carte): string {
  if (el.tipo === "virtuale") return `${el.valore} (dal ${nomePersonaggio(c, el.fonte)})`;
  const base = el.tipo === "numero" ? c.numeri.get(el.id)?.valore : (() => {
    const d = c.diamanti.get(el.id);
    return d?.tipo === "valore" ? d.valore : undefined;
  })();
  if (el.tipo === "diamante" && el.valore === undefined) return `${testoDiamante(c.diamanti.get(el.id))} come diamante`;
  const prefisso = el.tipo === "diamante" ? "◆" : "";
  if (el.modifica) {
    const segno = el.modifica.delta > 0 ? "+1" : "−1";
    return `${el.valore} (${prefisso}${base}${segno} con ${testoDiamante(c.diamanti.get(el.modifica.diamante))})`;
  }
  if (base !== undefined && base !== el.valore) return `${el.valore} (${prefisso}${base} trasformato)`;
  return `${prefisso}${el.valore}`;
}

/** Frase che descrive una mossa, dal punto di vista di chi la fa. */
export function descriviMossa(m: Mossa, v: VistaGiocatore, c: Carte, nickname: (id: string) => string): string {
  const sulTavolo = (posizione: number) => {
    const carta = v.tavolo.personaggi[posizione];
    return carta ? personaggio(carta.personaggio).nome : "personaggio";
  };
  switch (m.tipo) {
    case "prendiNumero":
      return `Prendi ${ilNumero(v.tavolo.numeri[m.posizione]?.valore)} dal tavolo`;
    case "prendiPersonaggio":
      return `Prendi ${sulTavolo(m.posizione)} dal tavolo`;
    case "pescaNumero":
      return "Pesca una carta numero coperta";
    case "pescaPersonaggio":
      return "Pesca un personaggio coperto";
    case "brucia":
      return "Brucia le 4 carte numero del tavolo";
    case "bruciaGratis":
      return "Brucia gratis (Bacchetta magica)";
    case "giocaFulmine":
      return "Gioca un fulmine: +1 mossa";
    case "dueInDiamante":
      return "Scambia un 2 con un diamante (Biancaneve)";
    case "scambiaConTavolo":
      return `Scambia ${nomePersonaggio(c, m.carta)} con ${sulTavolo(m.posizione)} del tavolo (Cappellaio)`;
    case "scartaPersonaggio":
      return `Scarta ${nomePersonaggio(c, m.carta)}`;
    case "prendiDaFatina":
      return `Prendi ${ilNumero(c.numeri.get(m.carta)?.valore)}`;
    case "fineTurno": {
      const parti = ["Fine turno"];
      if (m.scarta.length > 0) parti.push(`scartando ${m.scarta.map((id) => c.numeri.get(id)?.valore ?? "?").join(", ")}`);
      if (m.cambiaMano) parti.push("e cambia tutta la mano (Scheletro)");
      return parti.join(" ");
    }
    case "attiva": {
      let testo = `Attiva ${nomePersonaggio(c, m.carta)} con ${m.combinazione.map((el) => testoElemento(el, c)).join(" + ")}`;
      if (m.tieni) {
        const tenuta = c.numeri.get(m.tieni)?.valore ?? testoDiamante(c.diamanti.get(m.tieni));
        testo += `, tenendo ${typeof tenuta === "number" ? ilNumero(tenuta) : `il ${tenuta}`}`;
      }
      if (m.bersaglio) testo += `, scartando ${nomePersonaggio(c, m.bersaglio.carta)} di ${nickname(m.bersaglio.giocatore)}`;
      if (m.avversario) testo += `, guardando la mano di ${nickname(m.avversario)}`;
      return testo;
    }
  }
}

/** Gruppo in cui mostrare la mossa. */
export function gruppoMossa(m: Mossa): "scelta" | "attiva" | "tavolo" | "gratis" | "fine" {
  switch (m.tipo) {
    case "scartaPersonaggio":
    case "prendiDaFatina":
      return "scelta";
    case "attiva":
      return "attiva";
    // Si fanno toccando il tavolo (carte, mazzi, pulsanti "Brucia")
    case "prendiNumero":
    case "prendiPersonaggio":
    case "pescaNumero":
    case "pescaPersonaggio":
    case "brucia":
    case "bruciaGratis":
      return "tavolo";
    case "fineTurno":
      return "fine";
    default:
      return "gratis";
  }
}
