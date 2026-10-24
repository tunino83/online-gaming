/**
 * Verifica dei codici di attivazione della Famiglia (stessi tipi di codice di Il Portale,
 * più "carte qualsiasi"). Adattato da games/primo-gioco/src/codici.ts:
 * la mancia dei nonni sostituisce i diamanti e il caffè il fulmine; non ci sono carte virtuali.
 *
 * Il giocatore dichiara una `Combinazione`: le carte che usa e il valore che ognuna assume.
 * Qui si controlla che i valori dichiarati siano permessi (mancia o caffè +1) e che soddisfino il codice.
 */
import type { CartaMancia, CartaNumero, Codice } from "./tipi-carte";

/** Tutto ciò che un giocatore può usare per un codice in questo momento. */
export interface Risorse {
  /** Carte numero in mano (comprese quelle in vetrina). */
  mano: CartaNumero[];
  mancia: CartaMancia[];
}

/** Una mancia (o un caffè) usata per fare +1 a una carta. */
export interface Modifica {
  mancia: string;
}

/** Una carta usata nel codice, con il valore che assume. */
export type Elemento =
  | { tipo: "numero"; id: string; valore: number; modifica?: Modifica }
  | { tipo: "mancia"; id: string; valore: number; modifica?: Modifica };

export type Combinazione = Elemento[];

export type EsitoVerifica = { ok: true } | { ok: false; errore: string };

const nelRange = (v: number): boolean => Number.isInteger(v) && v >= 1 && v <= 8;
const ordina = (v: number[]) => [...v].sort((a, b) => a - b);

function contaValori(v: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const x of v) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
}

/* ------------------------------------------------------------------ */
/* Confronto tra valori e codice                                       */
/* ------------------------------------------------------------------ */

/** Numero di carte che un codice richiede. */
export function numeroCarte(c: Codice): number {
  switch (c.tipo) {
    case "esatto":
      return c.valori.length;
    case "uguali":
    case "somma":
    case "parita":
    case "qualsiasi":
      return c.carte;
    case "scala":
      return c.lunghezza;
    case "doppiaCoppia":
      return 4;
    case "combinato":
      return c.esatto.length + numeroCarte(c.piu);
  }
}

/** I valori soddisfano esattamente il codice (usandoli tutti)? */
function soddisfa(c: Codice, v: number[]): boolean {
  if (v.length !== numeroCarte(c)) return false;
  switch (c.tipo) {
    case "esatto":
      return ordina(v).join() === ordina(c.valori).join();
    case "uguali":
      return v.every((x) => x === v[0]);
    case "somma":
      return v.reduce((s, x) => s + x, 0) === c.totale;
    case "scala": {
      const o = ordina(v);
      return o.every((x, i) => i === 0 || x === o[i - 1]! + 1);
    }
    case "doppiaCoppia": {
      const o = ordina(v);
      return o[0] === o[1] && o[2] === o[3];
    }
    case "parita":
      return v.every((x) => (x % 2 === 0) === (c.parita === "pari"));
    case "qualsiasi":
      return true;
    case "combinato":
      return soddisfaCombinato(c, v);
  }
}

function soddisfaCombinato(c: Extract<Codice, { tipo: "combinato" }>, v: number[]): boolean {
  // La parte esatta si toglie dai valori (le carte con lo stesso valore sono intercambiabili);
  // quello che resta deve soddisfare la parte generica.
  const resto = [...v];
  for (const x of c.esatto) {
    const i = resto.indexOf(x);
    if (i < 0) return false;
    resto.splice(i, 1);
  }
  return soddisfa(c.piu, resto);
}

/**
 * I valori scelti finora possono ancora diventare un codice valido aggiungendone altri?
 * Serve a scartare presto le strade senza uscita durante la ricerca.
 */
function completabile(c: Codice, v: number[]): boolean {
  if (v.length > numeroCarte(c)) return false;
  switch (c.tipo) {
    case "esatto": {
      const serve = contaValori(c.valori);
      for (const [x, n] of contaValori(v)) if (n > (serve.get(x) ?? 0)) return false;
      return true;
    }
    case "uguali":
      return v.every((x) => x === v[0]);
    case "somma": {
      const somma = v.reduce((s, x) => s + x, 0);
      const mancano = c.carte - v.length;
      return somma + mancano <= c.totale && somma + mancano * 8 >= c.totale;
    }
    case "scala":
      return new Set(v).size === v.length && (v.length === 0 || Math.max(...v) - Math.min(...v) < c.lunghezza);
    case "doppiaCoppia": {
      const conti = [...contaValori(v).values()];
      return conti.length <= 1 || (conti.length === 2 && conti.every((n) => n <= 2));
    }
    case "parita":
      return v.every((x) => (x % 2 === 0) === (c.parita === "pari"));
    case "qualsiasi":
      return true;
    case "combinato": {
      // Deve esistere una divisione: alcuni valori nella parte esatta, gli altri ancora buoni per la parte generica.
      for (let maschera = 0; maschera < 1 << v.length; maschera++) {
        const parte = v.filter((_, i) => maschera & (1 << i));
        const resto = v.filter((_, i) => !(maschera & (1 << i)));
        if (completabile({ tipo: "esatto", valori: c.esatto }, parte) && completabile(c.piu, resto)) return true;
      }
      return false;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Verifica di una combinazione dichiarata                             */
/* ------------------------------------------------------------------ */

/**
 * Controlla che la combinazione usi davvero carte del giocatore, con valori
 * permessi, e che soddisfi il codice. Restituisce un errore leggibile se no.
 */
export function verificaCombinazione(risorse: Risorse, codice: Codice, comb: Combinazione): EsitoVerifica {
  const errore = (testo: string): EsitoVerifica => ({ ok: false, errore: testo });
  if (comb.length === 0) return errore("Nessuna carta indicata");

  const mano = new Map(risorse.mano.map((c) => [c.id, c]));
  const mancia = new Map(risorse.mancia.map((m) => [m.id, m]));
  const usati = new Set<string>();
  const usa = (id: string): boolean => {
    if (usati.has(id)) return false;
    usati.add(id);
    return true;
  };

  const valori: number[] = [];
  for (const el of comb) {
    let base: number;
    if (el.tipo === "numero") {
      const c = mano.get(el.id);
      if (!c) return errore(`Carta non in mano: ${el.id}`);
      base = c.valore;
    } else {
      const m = mancia.get(el.id);
      if (!m) return errore(`Mancia non posseduta: ${el.id}`);
      if (m.tipo === "caffe") return errore("Il caffè non ha un numero: può solo fare +1 a una carta");
      base = m.valore;
    }
    if (!usa(el.id)) return errore(`Carta usata due volte: ${el.id}`);
    if (!nelRange(el.valore)) return errore(`Valore non valido: ${el.valore}`);

    if (el.modifica) {
      if (!mancia.has(el.modifica.mancia)) return errore(`Mancia non posseduta: ${el.modifica.mancia}`);
      if (!usa(el.modifica.mancia)) return errore(`Carta usata due volte: ${el.modifica.mancia}`);
      if (base + 1 !== el.valore) return errore(`${base} con +1 non fa ${el.valore}`);
    } else if (base !== el.valore) {
      return errore(`Una carta ${base} non può valere ${el.valore}`);
    }
    valori.push(el.valore);
  }

  return soddisfa(codice, valori) ? { ok: true } : errore("Le carte non soddisfano il codice");
}

/* ------------------------------------------------------------------ */
/* Ricerca di tutte le combinazioni possibili                          */
/* ------------------------------------------------------------------ */

/** Una carta che può entrare nel codice, con la sua "firma" per riconoscere i doppioni. */
interface Candidato {
  tipo: "numero" | "mancia";
  id: string;
  base: number | null; // null = caffè
  firma: string; // carte con la stessa firma sono intercambiabili
}

function candidati(r: Risorse): Candidato[] {
  const lista: Candidato[] = [
    ...r.mano.map((c): Candidato => ({ tipo: "numero", id: c.id, base: c.valore, firma: `n${c.valore}` })),
    ...r.mancia.map((m): Candidato => ({
      tipo: "mancia",
      id: m.id,
      base: m.tipo === "valore" ? m.valore : null,
      firma: m.tipo === "valore" ? `m${m.valore}` : "c",
    })),
  ];
  return lista.sort((a, b) => (a.firma < b.firma ? -1 : a.firma > b.firma ? 1 : 0));
}

function firmaCombinazione(comb: Combinazione, firme: Map<string, string>): string {
  return comb
    .map((el) => `${firme.get(el.id)}=${el.valore}${el.modifica ? `+${firme.get(el.modifica.mancia)}` : ""}`)
    .sort()
    .join("|");
}

/**
 * Tutte le combinazioni con cui il giocatore può soddisfare il codice.
 * Carte uguali (stesso valore e tipo) sono considerate intercambiabili:
 * viene restituita una sola combinazione per ogni modo davvero diverso.
 */
export function trovaCombinazioni(risorse: Risorse, codice: Codice, limite = Infinity): Combinazione[] {
  const tutti = candidati(risorse);
  const firme = new Map(tutti.map((c) => [c.id, c.firma]));
  const risultati: Combinazione[] = [];
  const giaTrovate = new Set<string>();
  const max = numeroCarte(codice);

  const esplora = (da: number, scelti: Elemento[], valori: number[], occupati: Set<string>) => {
    if (risultati.length >= limite) return;
    if (valori.length === max) {
      if (soddisfa(codice, valori)) {
        const firma = firmaCombinazione(scelti, firme);
        if (!giaTrovate.has(firma)) {
          giaTrovate.add(firma);
          risultati.push(scelti);
        }
      }
      return;
    }

    let firmaPrecedente: string | null = null;
    for (let i = da; i < tutti.length; i++) {
      const c = tutti[i]!;
      if (occupati.has(c.id) || c.base === null) continue;
      // Carta identica alla precedente provata a questo livello: stesse combinazioni, si salta.
      if (c.firma === firmaPrecedente) continue;
      firmaPrecedente = c.firma;

      const modi: { el: Elemento; mod?: string }[] = [{ el: { tipo: c.tipo, id: c.id, valore: c.base } }];
      // +1 con una mancia o un caffè: quelli con la stessa firma sono intercambiabili, se ne prova uno per firma.
      const visti = new Set<string>();
      for (const m of tutti) {
        if (m.tipo !== "mancia" || m.id === c.id || occupati.has(m.id) || visti.has(m.firma) || c.base + 1 > 8) continue;
        visti.add(m.firma);
        modi.push({ el: { tipo: c.tipo, id: c.id, valore: c.base + 1, modifica: { mancia: m.id } }, mod: m.id });
      }
      for (const o of modi) {
        const nuovi = [...valori, o.el.valore];
        if (!completabile(codice, nuovi)) continue;
        const nuoviOccupati = new Set(occupati).add(c.id);
        if (o.mod) nuoviOccupati.add(o.mod);
        esplora(i + 1, [...scelti, o.el], nuovi, nuoviOccupati);
      }
    }
  };

  esplora(0, [], [], new Set());
  return risultati;
}

/** Il giocatore può soddisfare il codice? */
export function puoPagare(risorse: Risorse, codice: Codice): boolean {
  return trovaCombinazioni(risorse, codice, 1).length > 0;
}

/** Cosa consuma una combinazione: id di carte e mance (anche quelle usate per +1). */
export function risorseUsate(c: Combinazione): string[] {
  return c.flatMap((el) => [el.id, ...(el.modifica ? [el.modifica.mancia] : [])]);
}

/**
 * La combinazione che usa esattamente le carte scelte dal giocatore (id di carte e mance),
 * oppure null se quelle carte non formano il codice. Il modo di usarle lo trova da sola.
 */
export function combinazioneConCarte(r: Risorse, codice: Codice, scelte: readonly string[]): Combinazione | null {
  const insieme = new Set(scelte);
  if (insieme.size === 0) return null;
  const ristrette: Risorse = { mano: r.mano.filter((c) => insieme.has(c.id)), mancia: r.mancia.filter((m) => insieme.has(m.id)) };
  if (ristrette.mano.length + ristrette.mancia.length !== insieme.size) return null;
  for (const comb of trovaCombinazioni(ristrette, codice, 5000)) {
    const usate = risorseUsate(comb);
    if (usate.length === insieme.size && usate.every((k) => insieme.has(k))) return comb;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Testo del codice (per carte, interfaccia e confronto con carte.md)  */
/* ------------------------------------------------------------------ */

export function descriviCodice(c: Codice): string {
  switch (c.tipo) {
    case "esatto":
      return c.valori.join("");
    case "uguali":
      return c.carte === 2 ? "Coppia" : c.carte === 3 ? "Tris" : "Poker";
    case "somma":
      return `${c.carte} carte con somma ${c.totale}`;
    case "scala":
      return `Scala da ${c.lunghezza}`;
    case "doppiaCoppia":
      return "Doppia coppia";
    case "parita":
      return `${c.carte} carte ${c.parita}`;
    case "qualsiasi":
      return c.carte === 1 ? "1 carta qualsiasi" : `${c.carte} carte qualsiasi`;
    case "combinato":
      return `${c.esatto.join("")} + una ${descriviCodice(c.piu).toLowerCase()} qualsiasi`;
  }
}
