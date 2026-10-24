/**
 * Stato completo di una partita della Famiglia e mosse possibili.
 * Lo stato è privato (lo conosce solo il server); ai giocatori si manda la `vistaGiocatore`.
 */
import type { IdGiocatore, StatoCasuale } from "@og/engine";
import type { Combinazione } from "./codici";
import type { OpzioniPartita } from "./parametri";
import type { CartaMancia, CartaNumero, CopiaCarta } from "./tipi-carte";

/** Un personaggio attivato: dà punti e ha il potere carico o stanco. */
export interface Attivato {
  copia: CopiaCarta;
  /** Turni che mancano perché torni carico (0 = carico). */
  stanca: number;
}

export interface StatoGiocatore {
  /** Carte numero (nascoste). */
  mano: CartaNumero[];
  /** Mancia dei nonni e caffè: visibili a tutti, non contano nel limite della mano. */
  mancia: CartaMancia[];
  /** Personaggi di aiuto e difesa e carte difesa, nascosti in mano. */
  nascosti: CopiaCarta[];
  /** Personaggi di attacco e carte attacco in attesa, scoperti. */
  attacchi: CopiaCarta[];
  attivati: Attivato[];
}

/** Zona di un giocatore che ha un limite di carte. */
export type Zona = "nascosti" | "attacchi";

/** Decisione che un giocatore deve prendere prima che la partita vada avanti. */
export type Attesa =
  /** Zona piena: deve scartare una delle carte che aveva già (non quella appena arrivata). */
  { tipo: "scartaCarta"; giocatore: IdGiocatore; zona: Zona; nuova: string };

export interface StatoTurno {
  giocatore: IdGiocatore;
  mosseRimaste: number;
  attesa: Attesa | null;
}

export interface Mazzi {
  /** La prima carta da pescare è l'ultima dell'array. */
  numeri: CartaNumero[];
  personaggi: CopiaCarta[];
  mancia: CartaMancia[];
}

export interface StatoPartita {
  opzioni: OpzioniPartita;
  rng: StatoCasuale;
  /** Ordine di gioco sorteggiato. */
  ordine: IdGiocatore[];
  /** Turni giocati dall'inizio: il turno n è di ordine[n % giocatori]. */
  numeroTurno: number;
  /** Ultimo turno della partita, deciso quando qualcuno raggiunge i punti per vincere. */
  ultimoTurno: number | null;
  finita: boolean;
  mazzi: Mazzi;
  scarti: Mazzi;
  tavolo: {
    numeri: (CartaNumero | null)[];
    personaggi: (CopiaCarta | null)[];
  };
  giocatori: Record<IdGiocatore, StatoGiocatore>;
  turno: StatoTurno;
  /** Ultime cose successe, in forma pubblica. */
  registro: Fatto[];
}

/**
 * Una cosa successa nella partita, raccontata SOLO con informazioni pubbliche:
 * per esempio si dice che qualcuno ha pescato un personaggio, ma non quale se va nascosto in mano.
 */
export type Fatto = { n: number; giocatore: IdGiocatore } & DatiFatto;

export type DatiFatto =
  | { tipo: "prendiNumero"; valore: number }
  /** `carta` solo se è finita tra gli attacchi (scoperti) o era scoperta sul tavolo. */
  | { tipo: "prendiPersonaggio"; carta: string }
  | { tipo: "pescaNumero" }
  | { tipo: "pescaPersonaggio"; carta?: string }
  | { tipo: "brucia" }
  | { tipo: "attiva"; carta: string; punti: number; valori: number[] }
  | { tipo: "scartaCarta"; zona: Zona; carta?: string }
  | { tipo: "caffe" }
  | { tipo: "fineTurno"; scartate: number }
  | { tipo: "ultimoGiro"; punti: number }
  /** È comparsa sul tavolo una carta con il campanello: i personaggi scoperti sono stati cambiati. */
  | { tipo: "campanello"; valore: number; scartati: string[]; nuovi: string[] };

/** Quanti fatti si tengono nel registro. */
export const LUNGHEZZA_REGISTRO = 40;

/** Tutte le mosse e azioni che un giocatore può inviare. */
export type Mossa =
  // --- costano una mossa ---
  | { tipo: "prendiNumero"; posizione: number }
  | { tipo: "prendiPersonaggio"; posizione: number }
  | { tipo: "pescaNumero" }
  | { tipo: "pescaPersonaggio" }
  | { tipo: "brucia" }
  /** Attiva un personaggio nascosto in mano o in attesa tra gli attacchi. */
  | { tipo: "attiva"; carta: string; combinazione: Combinazione }
  // --- non costano mosse ---
  | { tipo: "caffe"; mancia: string }
  // --- risposte a una decisione in attesa ---
  | { tipo: "scartaCarta"; carta: string }
  // --- chiusura del turno ---
  | { tipo: "fineTurno"; scarta: string[] };
