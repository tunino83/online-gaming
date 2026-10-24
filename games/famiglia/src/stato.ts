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
  /** Carte numero in vetrina (Checca): visibili, al sicuro, valgono per i codici, fuori dal limite della mano. */
  vetrina: CartaNumero[];
  /** Mancia dei nonni e caffè: visibili a tutti, non contano nel limite della mano. */
  mancia: CartaMancia[];
  /** Personaggi di aiuto e difesa e carte difesa, nascosti in mano. */
  nascosti: CopiaCarta[];
  /** Personaggi di attacco e carte attacco in attesa, scoperti. */
  attacchi: CopiaCarta[];
  attivati: Attivato[];
  /** Mosse in più nel prossimo turno (Ci penso domani). */
  mosseProssimoTurno: number;
}

/** Zona di un giocatore che ha un limite di carte. */
export type Zona = "nascosti" | "attacchi";

/** Mosse che costano e che si possono ripetere con Nonno Salvatore. */
export type TipoMossaNormale = "prendiNumero" | "prendiPersonaggio" | "pescaNumero" | "pescaPersonaggio" | "brucia" | "attiva";

/** Decisione che un giocatore deve prendere prima che la partita vada avanti. */
export type Attesa =
  /** Zona piena: deve scartare una delle carte che aveva già (non quella appena arrivata). */
  | { tipo: "scartaCarta"; giocatore: IdGiocatore; zona: Zona; nuova: string }
  /**
   * Carte numero scoperte tra cui scegliere (visibili a tutti):
   * Vincenzo ("frutta": ne prende 2, il resto va negli scarti),
   * Patate al forno ("patate": una a testa, in ordine; `coda` = chi sceglie dopo).
   */
  | { tipo: "scegliNumeri"; giocatore: IdGiocatore; motivo: "frutta" | "patate"; carte: CartaNumero[]; quante: number; coda: IdGiocatore[] }
  /** Ne ho viste tante: le prime carte del mazzo personaggi, ne prende una (le altre tornano in cima). */
  | { tipo: "scegliPersonaggio"; giocatore: IdGiocatore; carte: CopiaCarta[] }
  /** Ogni cosa al suo posto: le prime carte del mazzo numeri, da rimettere nell'ordine voluto. */
  | { tipo: "riordina"; giocatore: IdGiocatore; carte: CartaNumero[] };

export interface StatoTurno {
  giocatore: IdGiocatore;
  mosseRimaste: number;
  attesa: Attesa | null;
  /** Ultima mossa che costa fatta in questo turno, esclusi i poteri (Nonno Salvatore). */
  ultimaMossa: TipoMossaNormale | null;
  /** Mosse in più che devono essere di un certo tipo (Nonno Salvatore). */
  mosseUguali: { tipo: TipoMossaNormale; quante: number } | null;
  /** Carta appena pescata, se l'ultima mossa è stata una pescata (Non sbaglio mai). */
  appenaPescata: { mazzo: "numeri" | "personaggi"; id: string } | null;
  /** Ogni carta numero pescata ne fa pescare una in più (Sono due etti e mezzo, lascio?). */
  pescaDoppia: boolean;
  /** Carte che non si possono scartare a fine turno (Alessia). */
  intoccabili: string[];
  /** Avversario di cui si vedono le carte in mano per tutto il turno (Studia il fascicolo). */
  fascicolo: IdGiocatore | null;
  /** Finito questo turno se ne fa subito un altro con 2 mosse (Doppio turno). */
  doppioTurno: boolean;
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
  /** `carta`: era scoperta sul tavolo. */
  | { tipo: "prendiPersonaggio"; carta: string }
  | { tipo: "pescaNumero" }
  /** `carta` solo se è finita tra gli attacchi (scoperti). */
  | { tipo: "pescaPersonaggio"; carta?: string }
  | { tipo: "brucia" }
  /** `mancia`: ha ricevuto la mancia dei nonni (personaggio di livello 3). */
  | { tipo: "attiva"; carta: string; punti: number; valori: number[]; mancia?: true }
  /** Uso di un potere: `bersaglio` è il giocatore coinvolto, se c'è. */
  | { tipo: "potere"; carta: string; potere: string; bersaglio?: IdGiocatore }
  | { tipo: "sceglie"; quante: number }
  | { tipo: "scartaCarta"; zona: Zona; carta?: string }
  | { tipo: "caffe" }
  | { tipo: "fineTurno"; scartate: number }
  | { tipo: "ultimoGiro"; punti: number }
  /** È comparsa sul tavolo una carta con il campanello: i personaggi scoperti sono stati cambiati. */
  | { tipo: "campanello"; valore: number; scartati: string[]; nuovi: string[] };

/** Quanti fatti si tengono nel registro. */
export const LUNGHEZZA_REGISTRO = 40;

/** Parametri di un potere (servono solo quelli del potere usato). */
export interface ParametriPotere {
  /** Carte numero della propria mano (Frigge di tutto, Vetrina, Fatto in casa, Lezione di padel). */
  carte?: string[];
  /** Posizioni sul tavolo (Scaffale, Lezione di padel). */
  posizioni?: number[];
  /** Valore cercato (Ce l'ho io!). */
  valore?: number;
  /** Giocatore scelto (Studia il fascicolo). */
  giocatore?: IdGiocatore;
  /** Carta scelta: personaggio nascosto, carta stanca, carta negli scarti (Vende la carne, Brace accesa, Ricetta, Mercatino). */
  bersaglio?: string;
  /** Voci del menu (Offre la casa): due tra "caffe", "birra", "colazione". */
  scelte?: string[];
}

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
  /** Usa il potere `potere` del personaggio attivato `carta` (id della copia). */
  | ({ tipo: "potere"; carta: string; potere: string } & ParametriPotere)
  // --- non costano mosse ---
  | { tipo: "caffe"; mancia: string }
  // --- risposte a una decisione in attesa ---
  | { tipo: "scartaCarta"; carta: string }
  | { tipo: "scegli"; carte: string[] }
  /** Id delle carte nell'ordine voluto: la prima sarà la prima pescata. */
  | { tipo: "riordina"; ordine: string[] }
  // --- chiusura del turno ---
  | { tipo: "fineTurno"; scarta: string[] };
