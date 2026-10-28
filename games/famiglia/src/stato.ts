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
  /** Mosse in più (o in meno, se negativo) nel prossimo turno (Domani lo faccio, Si incanta, Rospe…). */
  mosseProssimoTurno: number;
  /** Nel prossimo turno non può usare poteri (Parla parla parla). */
  zittoProssimoTurno: boolean;
  /** Salta il prossimo turno: nessuna mossa (Ti chiamo un attimo…). */
  saltaProssimoTurno: boolean;
  /** Turni in cui fa 1 mossa in meno dopo la festa (Anima della festa). */
  dopoLaFesta: number;
  /** Turni di indigestione: a fine turno scarta 1 carta in più (Alessia). */
  indigestione: number;
  /** Un caffè: turni di fila con la mossa in più (dopo 3 se ne fa uno con 1 mossa in meno, poi si ricomincia). */
  caffe: number;
  /* Protezioni che durano fino al prossimo turno del giocatore: */
  /** Nessuno può attaccarlo (Nuvola di fumo). */
  protetto: boolean;
  /** Nessuna sua carta può essere fatta stancare (Mutandoni di lana). */
  nonStancabile: boolean;
  /** Nessuno può guardare o prendere i suoi personaggi nascosti (Chiusa in camera). */
  nascostiProtetti: boolean;
  /** Nessun attacco di livello 1 lo colpisce (Tiro su un muro). */
  muro?: boolean;
  /** Nel prossimo turno non può attivare personaggi (Una sigaretta fuori al bar). */
  senzaAttivareProssimoTurno?: boolean;
  /** Punti guadagnati usando i poteri (variante "punti per i poteri"): restano anche se si perdono le carte. */
  puntiPoteri?: number;
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
  | { tipo: "scegliNumeri"; giocatore: IdGiocatore; motivo: "frutta" | "patate" | "posto"; carte: CartaNumero[]; quante: number; coda: IdGiocatore[] }
  /** Ne ho viste tante: le prime carte del mazzo personaggi, ne prende una (le altre tornano in cima). */
  | { tipo: "scegliPersonaggio"; giocatore: IdGiocatore; carte: CopiaCarta[] }
  /** Ogni cosa al suo posto: le prime carte del mazzo numeri, da rimettere nell'ordine voluto. */
  | { tipo: "riordina"; giocatore: IdGiocatore; carte: CartaNumero[] }
  /**
   * Pranzo a domicilio: dopo aver pescato, scambio facoltativo di una carta numero della mano con una del tavolo.
   * Si risponde con "scegli": nessuna carta (niente scambio) oppure [carta della mano, carta del tavolo].
   */
  | { tipo: "scambiaTavolo"; giocatore: IdGiocatore }
  /** Il giocatore è attaccato (vedi StatoPartita.attacco): si difende o subisce (e sceglie, se l'attacco lo chiede). */
  | { tipo: "difesa"; giocatore: IdGiocatore }
  /**
   * Si canta!: l'attaccante ha preso una carta da ogni avversario colpito e ora sceglie quale carta dare a ciascuno
   * (`a`, nell'ordine di turno). Si risponde con "scegli": una carta della mano per ogni giocatore, nello stesso ordine.
   */
  | { tipo: "canto"; giocatore: IdGiocatore; a: IdGiocatore[] }
  /** La Resurrezione: chi ha Totò ha pescato una carta in più e sceglie a chi darla. */
  | { tipo: "regalo"; giocatore: IdGiocatore; carta: CartaNumero }
  /**
   * Stuffosa (Checca 3): un avversario ha usato un potere di aiuto (vedi StatoTurno.aiutoSospeso) e Checca può scocciarsi.
   * Si risponde con "scegli": nessuna carta = lascia stare, 2 carte numero della mano = le scarta e blocca l'aiuto.
   */
  | { tipo: "stuffosa"; giocatore: IdGiocatore; di: IdGiocatore; carta: string; potere: string };

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
  /** Chi gli ha mandato l'attacco: l'attaccante, o chi l'ha deviato o rimandato (Maddalena, E se poi te ne penti?). */
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
  /** Il punto per l'attacco andato a segno è già stato dato (variante "punti per i poteri"). */
  premiato?: boolean;
  /** Carico (opzione "carico"): per difendersi con una carta attivata si scarta almeno questo valore, o si sacrifica la carta. */
  carico?: number;
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
  /** In questo turno non si possono attivare personaggi (Una sigaretta fuori al bar). */
  senzaAttivare?: boolean;
  /** Personaggi attivati in questo turno (variante "una attivazione per turno"). */
  attivazioni?: number;
  /** Il punto per il primo aiuto del turno è già stato dato (variante "punti per i poteri"). */
  premioAiuto?: boolean;
  /** Si canta! in corso: chi canta e gli avversari colpiti, a cui poi ridarà una carta a scelta. */
  canto: { da: IdGiocatore; a: IdGiocatore[] } | null;
  /** Carte mostrate a tutti in questo turno (Schietta). */
  rivelati: { giocatore: IdGiocatore; mano: CartaNumero[]; nascosti: CopiaCarta[] }[];
  /** Aiuto in attesa della risposta di chi ha Stuffosa: si applica se non lo blocca (le scelte restano segrete). */
  aiutoSospeso?: AiutoSospeso | null;
}

/** Un aiuto già pagato (mossa spesa, carta stanca) che aspetta la risposta di Stuffosa. */
export interface AiutoSospeso {
  /** Chi l'ha usato. */
  di: IdGiocatore;
  /** Copia della carta attivata usata. */
  copia: string;
  /** Carta e potere che si usano davvero (anche copiati). */
  carta: string;
  potere: string;
  parametri: ParametriPotere;
  appenaPescata: StatoTurno["appenaPescata"];
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
  /** La vita è una ruota: il gioco va in senso antiorario (l'ordine di turno è già girato: serve per la freccia sullo schermo). */
  antiorario?: boolean;
  /** Total black (Maddalena 2): il tavolo resta vuoto fino all'inizio del prossimo turno di questo giocatore. */
  buio?: IdGiocatore | null;
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
  | { tipo: "attacco"; carta: string; potere: string; bersagli: IdGiocatore[]; carico?: number }
  /**
   * Difesa di chi è attaccato (`carta` è la carta usata, ora scoperta); `riuscita` false = Forse c'è, forse no andato male;
   * `girata` = valore della carta numero girata da Forse c'è, forse no.
   */
  | { tipo: "difesa"; carta: string; potere: string; riuscita: boolean; devia?: IdGiocatore; girata?: number; harakiri?: true }
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
  /** +1 punto per un potere (regola dei punti per i poteri): attacco a segno, difesa riuscita o primo aiuto del turno. */
  | { tipo: "punto"; motivo: "attacco" | "difesa" | "aiuto" }
  | { tipo: "fineEvento"; evento: string }
  /** La Resurrezione: la carta in più data a un giocatore (si dice a chi, non quale). */
  | { tipo: "regalo"; a: IdGiocatore }
  /** Stuffosa: il giocatore si è scocciato e ha bloccato l'aiuto `potere` (della carta `carta`) di `a`. */
  | { tipo: "sbuffa"; a: IdGiocatore; carta: string; potere: string }
  /** Limite delle difese: attivando `nuova`, la difesa dello stesso livello `vecchia` è andata negli scarti. */
  | { tipo: "sostituisce"; vecchia: string; nuova: string }
  /** È comparsa sul tavolo una carta con il campanello: i personaggi scoperti sono stati cambiati. */
  | { tipo: "campanello"; valore: number; scartati: string[]; nuovi: string[] };

/** Quanti fatti si tengono nel registro. */
export const LUNGHEZZA_REGISTRO = 40;

/** Parametri di un potere (servono solo quelli del potere usato). */
export interface ParametriPotere {
  /** Carte numero della propria mano (Mo faccio due cotolette, Vetrina, Fatto in casa, Lezione di padel). */
  carte?: string[];
  /** Posizioni sul tavolo (Scaffale, Lezione di padel). */
  posizioni?: number[];
  /** Valore cercato (Ce l'ho io!). */
  valore?: number;
  /** Giocatore scelto (Studia il fascicolo). */
  giocatore?: IdGiocatore;
  /** Più giocatori scelti (Invasione di campo: 2 avversari). */
  giocatori?: IdGiocatore[];
  /** Carta scelta: personaggio nascosto, carta stanca, carta negli scarti (Vuoi un panino con sta roba puzzolente?, Ricetta). */
  bersaglio?: string;
  /** Più carte attivate scelte (Brace accesa: le carte stanche da ricaricare). */
  bersagli?: string[];
  /** Voci del menu (Offre la casa): due tra "caffe", "birra", "colazione". */
  scelte?: string[];
  /** Propria carta attivata da scambiare (Baratto, Il mio corpo che cambia). */
  propria?: string;
  /** Carta attivata e carica di un avversario di cui usare il potere (Giacca al rovescio). */
  fonte?: string;
  /** Potere della carta da copiare, se ne ha due (Giacca al rovescio). */
  potereCopiato?: string;
  /** Carte con cui si paga un codice (Vertenza: il codice del personaggio che si prende). */
  combinazione?: Combinazione;
  /** Carico dell'attacco (opzione "carico"): carte numero della mano che chi attacca scarta; la loro somma è il carico. */
  carico?: string[];
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
      /** Attacco con il carico, difesa con una carta attivata: carte numero da scartare (almeno quanto il carico)... */
      carico?: string[];
      /** ...oppure si sacrifica la carta di difesa (va negli scarti con i suoi punti). */
      harakiri?: true;
    }
  /** Non ci si difende: `carte` / `bersaglio` sono le scelte chieste dall'attacco (es. quali carte scartare). */
  | { tipo: "subisci"; carte?: string[]; bersaglio?: string }
  // --- chiusura del turno ---
  | { tipo: "fineTurno"; scarta: string[] };
