/**
 * Verifica dei codici di attivazione (vedi regolamento, "Codici di attivazione"
 * e "Domande aperte → Decisioni prese").
 *
 * Il giocatore dichiara una `Combinazione`: le carte che usa e il valore che
 * ognuna assume. Qui si controlla che i valori dichiarati siano permessi
 * (diamanti +1/−1, Robin Hood, Tremotino, carte virtuali) e che soddisfino il codice.
 */
import type { CartaDiamante, CartaNumero, Codice, Valore } from "./tipi-carte";

/** Carta virtuale data da un personaggio attivato (nano, fenice, drago). */
export interface CartaVirtuale {
  /** Id della carta personaggio che la fornisce (es. "nano-3-1"). */
  fonte: string;
  valore: Valore | "aScelta";
}

/** Tutto ciò che un giocatore può usare per un codice in questo momento. */
export interface Risorse {
  mano: CartaNumero[];
  diamanti: CartaDiamante[];
  /** Solo le carte virtuali non ancora usate in questo turno. */
  virtuali: CartaVirtuale[];
  poteri: {
    /** Robin Hood: ogni 1 (carta o diamante) può valere 8. */
    unoValeOtto: boolean;
    /** Tremotino: ogni 3 (carta o diamante) può valere da 1 a 8. */
    treJolly: boolean;
    /** Xena: i diamanti possono fare anche −1. */
    diamanteMenoUno: boolean;
  };
}

/** Un diamante con valore usato per cambiare di ±1 una carta. */
export interface Modifica {
  diamante: string;
  delta: 1 | -1;
}

/** Una carta usata nel codice, con il valore che assume. */
export type Elemento =
  | { tipo: "numero"; id: string; valore: number; modifica?: Modifica }
  /** Diamante: con `valore` conta come carta; senza, vale come "diamante qualsiasi". */
  | { tipo: "diamante"; id: string; valore?: number; modifica?: Modifica }
  | { tipo: "virtuale"; fonte: string; valore: number };

export type Combinazione = Elemento[];

export type EsitoVerifica = { ok: true } | { ok: false; errore: string };

/** Elemento ridotto a ciò che serve per confrontarlo col codice. */
interface Pezzo {
  valore: number | null;
  diamante: boolean;
}

const VALORI_TUTTI = [1, 2, 3, 4, 5, 6, 7, 8];

function nelRange(v: number): boolean {
  return Number.isInteger(v) && v >= 1 && v <= 8;
}

/** Valori che una carta (o diamante) di valore `base` può assumere senza diamanti. */
function valoriSenzaModifica(base: number, risorse: Risorse): number[] {
  if (risorse.poteri.treJolly && base === 3) return VALORI_TUTTI;
  if (risorse.poteri.unoValeOtto && base === 1) return [1, 8];
  return [base];
}

/* ------------------------------------------------------------------ */
/* Confronto tra valori e codice                                       */
/* ------------------------------------------------------------------ */

const ordina = (v: number[]) => [...v].sort((a, b) => a - b);

function contaValori(v: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const x of v) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
}

/** Numero massimo di carte che un codice può richiedere. */
export function maxCarte(c: Codice): number {
  switch (c.tipo) {
    case "esatto":
      return c.valori.length;
    case "uguali":
      return c.carte;
    case "somma":
      return c.carte ?? c.totale; // senza limite: al massimo tutte carte da 1
    case "scala":
      return c.lunghezza;
    case "doppiaCoppia":
      return 4;
    case "parita":
      return c.carte;
    case "diamanteQualsiasi":
      return 1;
    case "combinato":
      return c.esatto.length + maxCarte(c.piu);
    case "alternativa":
      return Math.max(...c.opzioni.map(maxCarte));
  }
}

/** I pezzi soddisfano esattamente il codice (usandoli tutti)? */
function soddisfa(c: Codice, pezzi: Pezzo[]): boolean {
  if (c.tipo === "diamanteQualsiasi") return pezzi.length === 1 && pezzi[0]!.diamante && pezzi[0]!.valore === null;
  if (c.tipo === "alternativa") return c.opzioni.some((o) => soddisfa(o, pezzi));
  if (c.tipo === "combinato") return soddisfaCombinato(c, pezzi);

  if (pezzi.some((p) => p.valore === null)) return false;
  const v = pezzi.map((p) => p.valore as number);
  switch (c.tipo) {
    case "esatto":
      return v.length === c.valori.length && ordina(v).join() === ordina(c.valori).join();
    case "uguali":
      return v.length === c.carte && v.every((x) => x === v[0]);
    case "somma":
      return (c.carte === undefined ? v.length >= 1 : v.length === c.carte) &&
        v.reduce((s, x) => s + x, 0) === c.totale;
    case "scala": {
      if (v.length !== c.lunghezza) return false;
      const o = ordina(v);
      return o.every((x, i) => i === 0 || x === o[i - 1]! + 1);
    }
    case "doppiaCoppia": {
      if (v.length !== 4) return false;
      const o = ordina(v);
      return o[0] === o[1] && o[2] === o[3];
    }
    case "parita":
      return v.length === c.carte && v.every((x) => (x % 2 === 0) === (c.parita === "pari"));
  }
}

function soddisfaCombinato(c: Extract<Codice, { tipo: "combinato" }>, pezzi: Pezzo[]): boolean {
  const k = c.esatto.length;
  if (pezzi.length < k) return false;
  const obiettivo = ordina(c.esatto).join();
  // Prova ogni scelta di k pezzi come parte esatta; il resto deve soddisfare la parte generica.
  const scegli = (da: number, scelti: number[]): boolean => {
    if (scelti.length === k) {
      const parte = scelti.map((i) => pezzi[i]!);
      if (parte.some((p) => p.valore === null)) return false;
      if (ordina(parte.map((p) => p.valore as number)).join() !== obiettivo) return false;
      const resto = pezzi.filter((_, i) => !scelti.includes(i));
      return soddisfa(c.piu, resto);
    }
    for (let i = da; i < pezzi.length; i++) if (scegli(i + 1, [...scelti, i])) return true;
    return false;
  };
  return scegli(0, []);
}

/**
 * I pezzi scelti finora possono ancora diventare un codice valido aggiungendone altri?
 * Serve a scartare presto le strade senza uscita durante la ricerca.
 */
function completabile(c: Codice, pezzi: Pezzo[]): boolean {
  if (pezzi.length > maxCarte(c)) return false;
  if (c.tipo === "diamanteQualsiasi") return pezzi.every((p) => p.diamante && p.valore === null);
  if (c.tipo === "alternativa") return c.opzioni.some((o) => completabile(o, pezzi));
  if (c.tipo === "combinato") {
    // Deve esistere una divisione: alcuni pezzi nella parte esatta, gli altri ancora buoni per la parte generica.
    for (let maschera = 0; maschera < 1 << pezzi.length; maschera++) {
      const parte = pezzi.filter((_, i) => maschera & (1 << i));
      const resto = pezzi.filter((_, i) => !(maschera & (1 << i)));
      if (completabile({ tipo: "esatto", valori: c.esatto }, parte) && completabile(c.piu, resto)) return true;
    }
    return false;
  }
  if (pezzi.some((p) => p.valore === null)) return false;
  const v = pezzi.map((p) => p.valore as number);
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
      if (c.carte === undefined) return somma <= c.totale;
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
  }
}

/* ------------------------------------------------------------------ */
/* Verifica di una combinazione dichiarata                             */
/* ------------------------------------------------------------------ */

/**
 * Controlla che la combinazione usi davvero risorse del giocatore, con valori
 * permessi, e che soddisfi il codice. Restituisce un errore leggibile se no.
 */
export function verificaCombinazione(risorse: Risorse, codice: Codice, comb: Combinazione): EsitoVerifica {
  const errore = (testo: string): EsitoVerifica => ({ ok: false, errore: testo });
  if (comb.length === 0) return errore("Nessuna carta indicata");

  const mano = new Map(risorse.mano.map((c) => [c.id, c]));
  const diamanti = new Map(risorse.diamanti.map((d) => [d.id, d]));
  const virtuali = new Map(risorse.virtuali.map((v) => [v.fonte, v]));
  const usati = new Set<string>();
  const usa = (chiave: string): boolean => {
    if (usati.has(chiave)) return false;
    usati.add(chiave);
    return true;
  };

  const pezzi: Pezzo[] = [];
  for (const el of comb) {
    if (el.tipo === "virtuale") {
      const v = virtuali.get(el.fonte);
      if (!v) return errore(`Carta virtuale non disponibile: ${el.fonte}`);
      if (!usa(`v:${el.fonte}`)) return errore(`Carta virtuale usata due volte: ${el.fonte}`);
      if (!nelRange(el.valore)) return errore(`Valore non valido: ${el.valore}`);
      if (v.valore !== "aScelta" && v.valore !== el.valore)
        return errore(`La carta virtuale di ${el.fonte} vale ${v.valore}, non ${el.valore}`);
      pezzi.push({ valore: el.valore, diamante: false });
      continue;
    }

    let base: number | null;
    if (el.tipo === "numero") {
      const carta = mano.get(el.id);
      if (!carta) return errore(`Carta non in mano: ${el.id}`);
      base = carta.valore;
    } else {
      const d = diamanti.get(el.id);
      if (!d) return errore(`Diamante non posseduto: ${el.id}`);
      base = d.tipo === "valore" ? d.valore : null;
    }
    if (!usa(el.id)) return errore(`Carta usata due volte: ${el.id}`);

    // Diamante usato come "diamante qualsiasi" (senza valore)
    if (el.tipo === "diamante" && el.valore === undefined) {
      if (el.modifica) return errore("Un diamante senza valore non si può modificare");
      pezzi.push({ valore: null, diamante: true });
      continue;
    }
    if (base === null) return errore("Il fulmine non ha un numero: vale solo come diamante qualsiasi");
    const valore = el.valore as number;
    if (!nelRange(valore)) return errore(`Valore non valido: ${valore}`);

    if (el.modifica) {
      const m = el.modifica;
      const d = diamanti.get(m.diamante);
      if (!d) return errore(`Diamante non posseduto: ${m.diamante}`);
      if (!usa(m.diamante)) return errore(`Carta usata due volte: ${m.diamante}`);
      if (m.delta === -1 && !risorse.poteri.diamanteMenoUno) return errore("Il −1 richiede il potere di Xena");
      if (m.delta !== 1 && m.delta !== -1) return errore("Un diamante cambia il valore solo di 1");
      if (base + m.delta !== valore) return errore(`${base} con ${m.delta > 0 ? "+1" : "−1"} non fa ${valore}`);
    } else if (!valoriSenzaModifica(base, risorse).includes(valore)) {
      return errore(`Una carta ${base} non può valere ${valore}`);
    }
    pezzi.push({ valore, diamante: el.tipo === "diamante" });
  }

  return soddisfa(codice, pezzi) ? { ok: true } : errore("Le carte non soddisfano il codice");
}

/* ------------------------------------------------------------------ */
/* Ricerca di tutte le combinazioni possibili                          */
/* ------------------------------------------------------------------ */

/** Una risorsa che può entrare nel codice, con la sua "firma" per riconoscere i doppioni. */
interface Candidato {
  tipo: "numero" | "diamante" | "virtuale";
  chiave: string; // id carta o fonte della virtuale
  base: number | null; // null = fulmine
  scelta: boolean; // virtuale a scelta (drago)
  firma: string; // carte con la stessa firma sono intercambiabili
}

function candidati(risorse: Risorse): Candidato[] {
  const lista: Candidato[] = [
    ...risorse.mano.map((c): Candidato => ({
      tipo: "numero", chiave: c.id, base: c.valore, scelta: false, firma: `n${c.valore}`,
    })),
    ...risorse.diamanti.map((d): Candidato => ({
      tipo: "diamante", chiave: d.id, base: d.tipo === "valore" ? d.valore : null, scelta: false,
      firma: d.tipo === "valore" ? `d${d.valore}` : "f",
    })),
    ...risorse.virtuali.map((v): Candidato => ({
      tipo: "virtuale", chiave: v.fonte, base: v.valore === "aScelta" ? null : v.valore,
      scelta: v.valore === "aScelta", firma: `v${v.fonte}`,
    })),
  ];
  return lista.sort((a, b) => (a.firma < b.firma ? -1 : a.firma > b.firma ? 1 : 0));
}

/** Modi in cui un candidato può entrare nel codice. */
function opzioni(
  c: Candidato,
  risorse: Risorse,
  modificatori: Candidato[],
): { el: Elemento; pezzo: Pezzo; mod?: string }[] {
  if (c.tipo === "virtuale") {
    const valori = c.scelta ? VALORI_TUTTI : [c.base as number];
    return valori.map((v) => ({ el: { tipo: "virtuale", fonte: c.chiave, valore: v }, pezzo: { valore: v, diamante: false } }));
  }
  const diamante = c.tipo === "diamante";
  const res: { el: Elemento; pezzo: Pezzo; mod?: string }[] = [];
  if (diamante) res.push({ el: { tipo: "diamante", id: c.chiave }, pezzo: { valore: null, diamante: true } });
  if (c.base === null) return res; // fulmine
  for (const v of valoriSenzaModifica(c.base, risorse)) {
    res.push({ el: { tipo: c.tipo, id: c.chiave, valore: v } as Elemento, pezzo: { valore: v, diamante } });
  }
  // Diamanti modificatori: quelli con lo stesso valore sono intercambiabili, se ne prova uno per valore.
  const visti = new Set<string>();
  for (const m of modificatori) {
    if (m.chiave === c.chiave || visti.has(m.firma)) continue;
    visti.add(m.firma);
    const delte: (1 | -1)[] = risorse.poteri.diamanteMenoUno ? [1, -1] : [1];
    for (const delta of delte) {
      const v = c.base + delta;
      if (!nelRange(v)) continue;
      res.push({
        el: { tipo: c.tipo, id: c.chiave, valore: v, modifica: { diamante: m.chiave, delta } } as Elemento,
        pezzo: { valore: v, diamante },
        mod: m.chiave,
      });
    }
  }
  return res;
}

function firmaCombinazione(comb: Combinazione, firme: Map<string, string>): string {
  return comb
    .map((el) => {
      const chiave = el.tipo === "virtuale" ? el.fonte : el.id;
      const mod = "modifica" in el && el.modifica ? `${firme.get(el.modifica.diamante)}${el.modifica.delta}` : "";
      return `${firme.get(chiave)}=${el.valore ?? "*"}${mod}`;
    })
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
  const firme = new Map(tutti.map((c) => [c.chiave, c.firma]));
  const risultati: Combinazione[] = [];
  const giaTrovate = new Set<string>();
  const max = maxCarte(codice);

  const esplora = (da: number, scelti: Elemento[], pezzi: Pezzo[], occupati: Set<string>) => {
    if (risultati.length >= limite) return;
    if (pezzi.length > 0 && soddisfa(codice, pezzi)) {
      const firma = firmaCombinazione(scelti, firme);
      if (!giaTrovate.has(firma)) {
        giaTrovate.add(firma);
        risultati.push(scelti);
      }
    }
    if (pezzi.length >= max) return;

    let firmaPrecedente: string | null = null;
    for (let i = da; i < tutti.length; i++) {
      const c = tutti[i]!;
      if (occupati.has(c.chiave)) continue;
      // Carta identica alla precedente provata a questo livello: stesse combinazioni, si salta.
      if (c.firma === firmaPrecedente) continue;
      firmaPrecedente = c.firma;

      const modificatori = tutti.filter(
        // anche il fulmine può fare +1/−1 (invece di dare la mossa in più)
        (m) => m.tipo === "diamante" && !occupati.has(m.chiave) && m.chiave !== c.chiave,
      );
      for (const o of opzioni(c, risorse, modificatori)) {
        const nuoviPezzi = [...pezzi, o.pezzo];
        if (!completabile(codice, nuoviPezzi)) continue;
        const nuoviOccupati = new Set(occupati).add(c.chiave);
        if (o.mod) nuoviOccupati.add(o.mod);
        esplora(i + 1, [...scelti, o.el], nuoviPezzi, nuoviOccupati);
      }
    }
  };

  esplora(0, [], [], new Set());
  return risultati;
}

/** Il giocatore può soddisfare il codice? */
export function puoAttivare(risorse: Risorse, codice: Codice): boolean {
  return trovaCombinazioni(risorse, codice, 1).length > 0;
}

/* ------------------------------------------------------------------ */
/* Attivazione "a tocchi": dalle carte scelte alla combinazione        */
/* ------------------------------------------------------------------ */

/** Cosa consuma una combinazione: id di carte e diamanti (anche quelli usati per ±1) e fonti delle carte virtuali. */
export function risorseUsate(c: Combinazione): string[] {
  return c.flatMap((el) =>
    el.tipo === "virtuale" ? [el.fonte] : [el.id, ...(el.modifica ? [el.modifica.diamante] : [])],
  );
}

/**
 * La combinazione che usa esattamente le carte scelte dal giocatore (id di carte e diamanti,
 * o id del personaggio che dà la carta virtuale), oppure null se quelle carte non formano il codice.
 * Il modo di usarle (diamante come carta o come +1, valore del Tremotino...) lo trova da sola:
 * tutte le combinazioni che usano le stesse carte hanno lo stesso effetto.
 */
export function combinazioneConCarte(r: Risorse, codice: Codice, scelte: readonly string[]): Combinazione | null {
  const insieme = new Set(scelte);
  if (insieme.size === 0) return null;
  const ristrette: Risorse = {
    ...r,
    mano: r.mano.filter((c) => insieme.has(c.id)),
    diamanti: r.diamanti.filter((d) => insieme.has(d.id)),
    virtuali: r.virtuali.filter((v) => insieme.has(v.fonte)),
  };
  if (ristrette.mano.length + ristrette.diamanti.length + ristrette.virtuali.length !== insieme.size) return null;
  for (const comb of trovaCombinazioni(ristrette, codice, 5000)) {
    const usate = risorseUsate(comb);
    if (usate.length === insieme.size && usate.every((k) => insieme.has(k))) return comb;
  }
  return null;
}

/**
 * Come combinazioneConCarte, ma se le carte scelte non bastano prova ad aggiungere
 * da sola i diamanti del giocatore (il meno possibile), per esempio per fare +1.
 * Restituisce la combinazione e i diamanti aggiunti, oppure null.
 */
export function combinazioneConDiamanti(
  r: Risorse,
  codice: Codice,
  scelte: readonly string[],
): { combinazione: Combinazione; aggiunti: string[] } | null {
  const diretta = combinazioneConCarte(r, codice, scelte);
  if (diretta) return { combinazione: diretta, aggiunti: [] };
  const insieme = new Set(scelte);
  if (insieme.size === 0) return null;
  const altriDiamanti = r.diamanti.filter((d) => !insieme.has(d.id));
  if (altriDiamanti.length === 0) return null;
  const ristrette: Risorse = {
    ...r,
    mano: r.mano.filter((c) => insieme.has(c.id)),
    diamanti: r.diamanti,
    virtuali: r.virtuali.filter((v) => insieme.has(v.fonte)),
  };
  let migliore: { combinazione: Combinazione; aggiunti: string[] } | null = null;
  for (const comb of trovaCombinazioni(ristrette, codice, 5000)) {
    const usate = risorseUsate(comb);
    if (![...insieme].every((k) => usate.includes(k))) continue;
    const aggiunti = usate.filter((k) => !insieme.has(k));
    // Il meno possibile; a parità si tiene il fulmine (che altrimenti dà una mossa in più)
    const fulmini = aggiunti.filter((k) => r.diamanti.find((d) => d.id === k)?.tipo === "fulmine").length;
    const fulminiMigliore = migliore ? migliore.aggiunti.filter((k) => r.diamanti.find((d) => d.id === k)?.tipo === "fulmine").length : 0;
    if (!migliore || aggiunti.length < migliore.aggiunti.length || (aggiunti.length === migliore.aggiunti.length && fulmini < fulminiMigliore)) {
      migliore = { combinazione: comb, aggiunti };
    }
  }
  return migliore;
}
