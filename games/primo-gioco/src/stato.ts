/**
 * Stato completo di una partita e mosse possibili.
 * Lo stato è privato (lo conosce solo il server); ai giocatori si manda la `vistaGiocatore`.
 */
import type { IdGiocatore, StatoCasuale } from "@og/engine";
import type { Combinazione } from "./codici";
import type { OpzioniPartita } from "./parametri";
import type { CartaDiamante, CartaNumero, CartaPersonaggio } from "./tipi-carte";

export interface StatoGiocatore {
  mano: CartaNumero[];
  /** Visibili a tutti. */
  diamanti: CartaDiamante[];
  /** Personaggi nei posti, non ancora attivati. */
  posti: CartaPersonaggio[];
  /** Personaggi attivati: contano i punti e danno i poteri blu. */
  attivati: CartaPersonaggio[];
  punti: number;
  /** Mosse in più per il prossimo turno (Fantasma). */
  mosseExtraProssimoTurno: number;
}

/** Decisione che il giocatore di turno deve prendere prima di continuare. */
export type Attesa =
  /** Ha 3 personaggi nei posti: deve scartare uno dei due vecchi. */
  | { tipo: "scartaPersonaggio"; nuovo: string }
  /** Fatina: guarda la mano dell'avversario e sceglie una carta. */
  | { tipo: "fatina"; avversario: IdGiocatore };

export interface StatoTurno {
  giocatore: IdGiocatore;
  mosseRimaste: number;
  /** Carte virtuali (id del personaggio che le dà) già usate in questo turno. */
  virtualiUsate: string[];
  /** Bacchetta magica già usata in questo turno. */
  bruciaGratisUsata: boolean;
  /** È già stata fatta un'azione in questo turno (per il Cappellaio matto). */
  iniziato: boolean;
  attesa: Attesa | null;
}

export interface Mazzi {
  /** La prima carta da pescare è l'ultima dell'array. */
  numeri: CartaNumero[];
  personaggi: CartaPersonaggio[];
  diamanti: CartaDiamante[];
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
    personaggi: (CartaPersonaggio | null)[];
  };
  giocatori: Record<IdGiocatore, StatoGiocatore>;
  turno: StatoTurno;
  /** Ultime cose successe, in forma pubblica (vedi Evento). Può mancare nelle partite iniziate prima. */
  registro: Evento[];
}

/**
 * Una cosa successa nella partita, raccontata SOLO con informazioni pubbliche:
 * per esempio si dice che qualcuno ha pescato una carta numero, ma non quale.
 */
export type Evento = { n: number; giocatore: IdGiocatore } & DatiEvento;

export type DatiEvento =
  | { tipo: "prendiNumero"; valore: number }
  | { tipo: "prendiPersonaggio"; personaggio: string }
  | { tipo: "pescaNumero" }
  | { tipo: "pescaPersonaggio"; personaggio: string }
  | { tipo: "brucia"; gratis: boolean }
  | {
      tipo: "attiva";
      personaggio: string;
      punti: number;
      /** Valori usati nel codice (le carte giocate finiscono scoperte negli scarti). */
      valori: number[];
      /** Lucciola presa dai posti di un vicino. */
      da?: IdGiocatore;
      bersaglio?: { giocatore: IdGiocatore; personaggio: string };
      avversario?: IdGiocatore;
    }
  | { tipo: "scartaPersonaggio"; personaggio: string }
  | { tipo: "fulmine" }
  | { tipo: "dueInDiamante" }
  | { tipo: "scambiaConTavolo"; dato: string; preso: string }
  | { tipo: "prendiDaFatina"; da: IdGiocatore }
  | { tipo: "fineTurno"; scartate: number; cambiaMano: boolean }
  | { tipo: "ultimoGiro"; punti: number };

/** Quanti eventi si tengono nel registro. */
export const LUNGHEZZA_REGISTRO = 40;

/** Tutte le mosse e azioni che un giocatore può inviare. */
export type Mossa =
  // --- costano una mossa ---
  | { tipo: "prendiNumero"; posizione: number }
  | { tipo: "prendiPersonaggio"; posizione: number }
  | { tipo: "pescaNumero" }
  | { tipo: "pescaPersonaggio" }
  | { tipo: "brucia" }
  | {
      tipo: "attiva";
      /** Id della carta personaggio (nei propri posti, o Lucciola di un vicino). */
      carta: string;
      combinazione: Combinazione;
      /** Gatto con gli stivali: carta del codice che resta in mano. */
      tieni?: string;
      /** Strega: personaggio da scartare dai posti di un avversario. */
      bersaglio?: { giocatore: IdGiocatore; carta: string };
      /** Fatina: avversario di cui guardare la mano. */
      avversario?: IdGiocatore;
    }
  // --- non costano mosse ---
  | { tipo: "bruciaGratis" }
  | { tipo: "giocaFulmine"; diamante: string }
  | { tipo: "dueInDiamante"; carta: string }
  | { tipo: "scambiaConTavolo"; carta: string; posizione: number }
  // --- risposte a una decisione in attesa ---
  | { tipo: "scartaPersonaggio"; carta: string }
  | { tipo: "prendiDaFatina"; carta: string }
  // --- chiusura del turno ---
  | { tipo: "fineTurno"; scarta: string[]; cambiaMano: boolean };
