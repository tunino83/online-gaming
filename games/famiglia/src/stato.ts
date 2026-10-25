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
  /** Mosse in più (o in meno, se negativo) nel prossimo turno (Ci penso domani, Si incanta, Rospe…). */
  mosseProssimoTurno: number;
  /** Nel prossimo turno non può usare poteri (Parla parla parla). */
  zittoProssimoTurno: boolean;
  /** Salta il prossimo turno: nessuna mossa (Ti chiamo un attimo…). */
  saltaProssimoTurno: boolean;
  /** Turni in cui fa 1 mossa in meno dopo la festa (Anima della festa). */
  dopoLaFesta: number;
  /** Turni di indigestione: a fine turno scarta 1 carta in più (Alessia). */
  indigestione: number;
  /* Protezioni che durano fino al prossimo turno del giocatore: */
  /** Nessuno può attaccarlo (Nuvola di fumo). */
  protetto: boolean;
  /** Nessuna sua carta può essere fatta stancare (Mutandoni di lana). */
  nonStancabile: boolean;
  /** Nessuno può guardare o prendere i suoi personaggi nascosti (Chiusa in camera). */
  nascostiProtetti: boolean;
  /** Giocatori che non possono attaccarlo (Non ti sento, sto suonando). */
  vietati: IdGiocatore[];
}

/** Zona di un giocatore che ha un limite di carte. */
export type Zona = "nascosti" | "attacchi";

/** Mosse che costano e che si possono ripetere con Nonno Salvatore. */
export type TipoMossaNormale = "prendiNumero" | "prendiPersonaggio" | "pescaNumero" | "pescaPersonaggio" | "brucia" | "attiva" | "pescaEvento";

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
  | { tipo: "riordina"; giocatore: IdGiocatore; carte: CartaNumero[] }
  /** Il giocatore è attaccato (vedi StatoPartita.attacco): si difende o subisce (e sceglie, se l'attacco lo chiede). */
  | { tipo: "difesa"; giocatore: IdGiocatore }
  /** La Resurrezione: chi ha Totò ha pescato una carta in più e sceglie a chi darla. */
  | { tipo: "regalo"; giocatore: IdGiocatore; carta: CartaNumero };

/** Un attacco che si sta risolvendo, un bersaglio alla volta. */
export interface AttaccoInCorso {
  attaccante: IdGiocatore;
  /** Carta da cui viene il potere (es. "antonio-2"): ne decide il livello. */
  carta: string;
  /** Potere d'attacco (es. "forno-a-legna"). */
  potere: string;
  livello: number;
  /** Scelte dell'attaccante. */
  parametri: ParametriPotere;
  /** Chi è colpito adesso. */
  bersaglio: IdGiocatore;
  /** Chi gli ha mandato l'attacco: l'attaccante, o chi l'ha deviato o rimandato (Maddalena, Permalosa). */
  da: IdGiocatore;
  /** Chi sarà colpito dopo (attacchi contro tutti). */
  coda: IdGiocatore[];
  /** Chi si è già difeso da questo attacco (ognuno una volta sola). */
  difesi: IdGiocatore[];
  /** Il bersaglio attuale non può difendersi (È colpa di qualcun altro). */
  indifendibile: boolean;
  /** Attacco contro tutti: non si può deviare. */
  controTutti: boolean;
  /** Copia della carta d'attacco (se è un personaggio attivato), per Cella frigorifera. */
  copia: string | null;
}

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
  /** Poteri blu già usati in questo turno (ognuno una volta per turno). */
  bluUsati: string[];
  /** Mazzo della prima pescata, se la prima mossa del turno è stata una pescata (Sono due etti e mezzo, lascio?). */
  primaPescata: "numeri" | "personaggi" | null;
  /** È già stata fatta una mossa che costa in questo turno. */
  mossaFatta: boolean;
  /** Indigestione: a fine turno si scarta 1 carta in più (Alessia). */
  indigestione: boolean;
  /** Avversario di cui si vedono le carte in mano per tutto il turno (Studia il fascicolo). */
  fascicolo: IdGiocatore | null;
  /** Finito questo turno se ne fa subito un altro con 2 mosse (Doppio turno). */
  doppioTurno: boolean;
  /** In questo turno non si possono usare poteri (Parla parla parla). */
  zitto: boolean;
  /** Carte mostrate a tutti in questo turno (Schietta). */
  rivelati: { giocatore: IdGiocatore; mano: CartaNumero[]; nascosti: CopiaCarta[] }[];
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
  /** Attacco in corso (mentre l'attaccato decide come difendersi). */
  attacco: AttaccoInCorso | null;
  /** Benedizione di Don Pasquale: fino al prossimo turno di questo giocatore nessuno può essere attaccato. */
  benedizione: IdGiocatore | null;
  /** Nevicava: fino a questo turno compreso nessuno può attaccare. */
  tregua: number | null;
  /** Ultimo potere usato al tavolo (Sempre la stessa storia). */
  ultimoPotere: { carta: string; potere: string } | null;
  /** Evento in corso e quanti turni dura ancora (compreso quello in corso). */
  evento: { id: string; turniRimasti: number } | null;
  /** Mazzo eventi (l'ultimo è il primo da pescare) e scarti. */
  eventi: { mazzo: string[]; scarti: string[] };
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
  /** Inizio di un attacco: `bersagli` sono i giocatori colpiti (in ordine). */
  | { tipo: "attacco"; carta: string; potere: string; bersagli: IdGiocatore[] }
  /** Difesa di chi è attaccato (`carta` è la carta usata, ora scoperta); `riuscita` false = Forse c'è, forse no andato male. */
  | { tipo: "difesa"; carta: string; potere: string; riuscita: boolean; devia?: IdGiocatore }
  /** L'attacco ha colpito il giocatore. */
  | { tipo: "colpito"; potere: string }
  /** L'attacco non ha effetto sul giocatore (protetto o non c'era niente da colpire). */
  | { tipo: "protetto"; potere: string }
  | { tipo: "scartaCarta"; zona: Zona; carta?: string }
  | { tipo: "caffe" }
  | { tipo: "fineTurno"; scartate: number }
  /** `punti` = punti per vincere; `mazzo` = il mazzo personaggi è finito. */
  | { tipo: "ultimoGiro"; punti: number; mazzo?: true }
  | { tipo: "evento"; evento: string }
  | { tipo: "fineEvento"; evento: string }
  /** La Resurrezione: la carta in più data a un giocatore (si dice a chi, non quale). */
  | { tipo: "regalo"; a: IdGiocatore }
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
  /** Propria carta attivata da scambiare (Baratto). */
  propria?: string;
  /** Carta attivata e carica di un avversario di cui usare il potere (Giacca al rovescio). */
  fonte?: string;
  /** Potere della carta da copiare, se ne ha due (Giacca al rovescio). */
  potereCopiato?: string;
}

/** Tutte le mosse e azioni che un giocatore può inviare. */
export type Mossa =
  // --- costano una mossa ---
  | { tipo: "prendiNumero"; posizione: number }
  | { tipo: "prendiPersonaggio"; posizione: number }
  | { tipo: "pescaNumero" }
  /** `seconda`: prende la seconda carta del mazzo invece della prima (Ne ho viste tante). */
  | { tipo: "pescaPersonaggio"; seconda?: true }
  | { tipo: "brucia" }
  /** Pesca un evento (solo se non ce n'è uno in corso). */
  | { tipo: "pescaEvento" }
  /** Attiva un personaggio nascosto in mano o in attesa tra gli attacchi. */
  /** `codiceDi`: paga il codice di un'altra propria carta invece del suo (Prosecco). */
  | { tipo: "attiva"; carta: string; combinazione: Combinazione; codiceDi?: string }
  /** Usa il potere `potere` del personaggio attivato `carta` (id della copia). */
  | ({ tipo: "potere"; carta: string; potere: string } & ParametriPotere)
  /** Usa una carta attacco (tomacella, giro aperto, occhi 'nguoll, vento) pagandone il codice; poi si scarta. */
  | ({ tipo: "usaCarta"; carta: string; combinazione: Combinazione } & ParametriPotere)
  // --- non costano mosse ---
  | { tipo: "caffe"; mancia: string }
  // --- risposte a una decisione in attesa ---
  | { tipo: "scartaCarta"; carta: string }
  | { tipo: "scegli"; carte: string[] }
  /** Id delle carte nell'ordine voluto: la prima sarà la prima pescata. */
  | { tipo: "riordina"; ordine: string[] }
  /** La Resurrezione: a chi dare la carta in più (anche a sé stessi). */
  | { tipo: "regala"; giocatore: IdGiocatore }
  /**
   * Difesa da un attacco con la carta `carta`: un personaggio attivato e carico, oppure (d'emergenza) un personaggio
   * nascosto o una carta difesa pagandone il codice con `combinazione`.
   * `potere`: se la carta ne ha due. `giocatore`: a chi deviare l'attacco (Maddalena).
   * `carte` e `bersaglio`: carte da pagare (Ricorso) o scelte chieste dall'attacco (se passa comunque, Guardia medica).
   */
  | {
      tipo: "difendi";
      carta: string;
      potere?: string;
      combinazione?: Combinazione;
      giocatore?: IdGiocatore;
      carte?: string[];
      bersaglio?: string;
    }
  /** Non ci si difende: `carte` / `bersaglio` sono le scelte chieste dall'attacco (es. quali carte scartare). */
  | { tipo: "subisci"; carte?: string[]; bersaglio?: string }
  // --- chiusura del turno ---
  | { tipo: "fineTurno"; scarta: string[] };
