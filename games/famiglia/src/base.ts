/**
 * Pezzi comuni alle regole del turno (regole.ts) e ai poteri (poteri.ts):
 * errori, registro, mazzi, tavolo, zone e carte dei giocatori.
 */
import { type IdGiocatore, mescola } from "@og/engine";
import { carta, eAttacco } from "./carte";
import type { Risorse } from "./codici";
import { type DatiFatto, LUNGHEZZA_REGISTRO, type Mazzi, type StatoGiocatore, type StatoPartita, type Zona } from "./stato";
import type { CartaNumero, CopiaCarta } from "./tipi-carte";

/** Errore di una mossa non permessa: il messaggio è per il giocatore. */
export class MossaNonValida extends Error {}
export const rifiuta = (messaggio: string): never => {
  throw new MossaNonValida(messaggio);
};

/* ---------------- registro (solo informazioni pubbliche) ---------------- */

export function registra(s: StatoPartita, giocatore: IdGiocatore, f: DatiFatto): void {
  const n = (s.registro.at(-1)?.n ?? 0) + 1;
  s.registro.push({ n, giocatore, ...f });
  if (s.registro.length > LUNGHEZZA_REGISTRO) s.registro.splice(0, s.registro.length - LUNGHEZZA_REGISTRO);
}

/* ---------------- mazzi e tavolo ---------------- */

/** Pesca la prima carta di un mazzo; se è finito rimescola gli scarti. `null` se non c'è nulla. */
export function pesca<K extends keyof Mazzi>(s: StatoPartita, mazzo: K): Mazzi[K][number] | null {
  if (s.mazzi[mazzo].length === 0 && s.scarti[mazzo].length > 0) {
    s.mazzi[mazzo] = mescola<Mazzi[K][number]>(s.rng, s.scarti[mazzo]) as Mazzi[K];
    s.scarti[mazzo] = [] as Mazzi[K];
  }
  return (s.mazzi[mazzo].pop() as Mazzi[K][number] | undefined) ?? null;
}

export const puoPescare = (s: StatoPartita, mazzo: keyof Mazzi) => s.mazzi[mazzo].length + s.scarti[mazzo].length > 0;

/**
 * Riempie i posti vuoti del tavolo, se ci sono carte disponibili.
 * Ogni carta con il campanello che compare scoperta fa cambiare i personaggi scoperti
 * (vanno negli scarti e se ne scoprono di nuovi): due campanelli, due cambi.
 */
export function riempiTavolo(s: StatoPartita): void {
  const campanelli: CartaNumero[] = [];
  s.tavolo.numeri = s.tavolo.numeri.map((c) => {
    if (c) return c;
    const nuova = pesca(s, "numeri");
    if (nuova?.campanello) campanelli.push(nuova);
    return nuova;
  });
  s.tavolo.personaggi = s.tavolo.personaggi.map((c) => c ?? pesca(s, "personaggi"));
  for (const c of campanelli) {
    const scartati = s.tavolo.personaggi.filter((x) => x !== null);
    s.scarti.personaggi.push(...scartati);
    s.tavolo.personaggi = s.tavolo.personaggi.map(() => null);
    s.tavolo.personaggi = s.tavolo.personaggi.map(() => pesca(s, "personaggi"));
    // A inizio partita non c'è ancora nessuno di turno: il cambio non va nel registro
    if (s.turno.giocatore) {
      registra(s, s.turno.giocatore, {
        tipo: "campanello",
        valore: c.valore,
        scartati: scartati.map((x) => x.carta),
        nuovi: s.tavolo.personaggi.filter((x) => x !== null).map((x) => x.carta),
      });
    }
  }
}

/* ---------------- carte numero ---------------- */

/** Mette carte numero negli scarti; una carta "fatta in casa" si scarta come le 2 carte che la formano. */
export function scartaNumeri(s: StatoPartita, carte: CartaNumero[]): void {
  for (const c of carte) {
    if (c.unite) scartaNumeri(s, c.unite);
    else s.scarti.numeri.push(c);
  }
}

/** Toglie una carta numero dalla mano o dalla vetrina del giocatore; `null` se non c'è. */
export function togliNumero(g: StatoGiocatore, id: string): CartaNumero | null {
  for (const lista of [g.mano, g.vetrina]) {
    const i = lista.findIndex((c) => c.id === id);
    if (i >= 0) return lista.splice(i, 1)[0]!;
  }
  return null;
}

/**
 * Il giocatore pesca carte numero dal mazzo. Se è di turno e ha usato "Sono due etti e mezzo, lascio?",
 * ogni carta pescata ne fa pescare una in più. Restituisce le carte pescate.
 */
export function peschiNumeri(s: StatoPartita, id: IdGiocatore, quante: number): CartaNumero[] {
  const doppia = s.turno.giocatore === id && s.turno.pescaDoppia;
  const prese: CartaNumero[] = [];
  for (let i = 0; i < quante * (doppia ? 2 : 1); i++) {
    const c = pesca(s, "numeri");
    if (c) prese.push(c);
  }
  s.giocatori[id]!.mano.push(...prese);
  return prese;
}

/* ---------------- giocatori e zone ---------------- */

/** Punti di un giocatore: la somma dei punti dei personaggi attivati. */
export const puntiDi = (g: Pick<StatoGiocatore, "attivati">): number => g.attivati.reduce((tot, a) => tot + carta(a.copia.carta).punti, 0);

/** Cosa può usare il giocatore per un codice: carte numero in mano e in vetrina, mancia. */
export const risorseGiocatore = (g: Pick<StatoGiocatore, "mano" | "vetrina" | "mancia">): Risorse => ({
  mano: [...g.mano, ...g.vetrina],
  mancia: g.mancia,
});

/** Zona in cui va una carta del mazzo personaggi: gli attacchi scoperti, tutto il resto nascosto in mano. */
export const zonaDi = (copia: CopiaCarta): Zona => (eAttacco(carta(copia.carta)) ? "attacchi" : "nascosti");

const limiteZona = (s: StatoPartita, zona: Zona) => (zona === "nascosti" ? s.opzioni.maxNascosti : s.opzioni.maxAttacchi);

/** Mette la carta nella zona giusta; se la zona è piena il giocatore deve scartarne una delle vecchie. */
export function riceviCarta(s: StatoPartita, id: IdGiocatore, copia: CopiaCarta): void {
  const zona = zonaDi(copia);
  const lista = s.giocatori[id]![zona];
  lista.push(copia);
  if (lista.length > limiteZona(s, zona)) s.turno.attesa = { tipo: "scartaCarta", giocatore: id, zona, nuova: copia.id };
}

/** Avversari di un giocatore, nell'ordine di turno a partire da quello dopo di lui. */
export function avversariDopo(s: StatoPartita, id: IdGiocatore): IdGiocatore[] {
  const i = s.ordine.indexOf(id);
  return [...s.ordine.slice(i + 1), ...s.ordine.slice(0, i)];
}
