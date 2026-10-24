/**
 * Interfaccia comune a tutti i giochi della piattaforma.
 *
 * Ogni gioco (in `games/<nome>`) implementa questa interfaccia.
 * Lo stato deve essere serializzabile in JSON e ogni casualità deve passare
 * dal generatore con seed (vedi `casuale.ts`), così una partita è riproducibile.
 */

/** Identificativo di un giocatore (es. id utente). */
export type IdGiocatore = string;

/** Esito di fine partita. */
export interface EsitoPartita {
  /** Giocatori vincitori: più di uno in caso di pareggio. */
  vincitori: IdGiocatore[];
  /** Punteggio finale di ogni giocatore. */
  punti: Record<IdGiocatore, number>;
}

/** Risultato di una mossa: nuovo stato oppure errore leggibile. */
export type RisultatoMossa<Stato> =
  | { ok: true; stato: Stato }
  | { ok: false; errore: string };

export interface Gioco<Stato, Mossa, Opzioni, Vista> {
  /** Nome tecnico del gioco (es. "primo-gioco"). */
  readonly id: string;
  readonly minGiocatori: number;
  readonly maxGiocatori: number;

  /** Prepara una nuova partita. Stesso seed = stessa partita. */
  setup(giocatori: IdGiocatore[], opzioni: Partial<Opzioni>, seed: number): Stato;

  /** Elenco delle mosse che il giocatore può fare ora (vuoto se non è il suo turno). */
  mosseValide(stato: Stato, giocatore: IdGiocatore): Mossa[];

  /** Applica una mossa. Non modifica lo stato ricevuto: ne restituisce uno nuovo. */
  applicaMossa(stato: Stato, giocatore: IdGiocatore, mossa: Mossa): RisultatoMossa<Stato>;

  /** Esito se la partita è finita, altrimenti `null`. */
  finePartita(stato: Stato): EsitoPartita | null;

  /** Ciò che un giocatore può vedere: mai mani altrui, mazzi coperti o loro ordine. */
  vistaGiocatore(stato: Stato, giocatore: IdGiocatore): Vista;

  /** Facoltativa: ciò che vede uno spettatore o lo schermo "tavolo" (solo informazioni pubbliche). */
  vistaPubblica?(stato: Stato): Vista;

  /**
   * Facoltativa: una mossa che il server può fare da solo perché non c'è nessuna scelta
   * (es. chiudere il turno quando non resta altro da fare). L'arbitro la applica subito.
   */
  mossaAutomatica?(stato: Stato): { giocatore: IdGiocatore; mossa: Mossa } | null;

  /**
   * Facoltativa: chi deve muovere adesso e una mossa valida scelta da un giocatore del computer
   * (per la modalità di prova). `casuale` dà numeri in [0, 1).
   */
  mossaBot?(stato: Stato, giocatore: IdGiocatore, casuale: () => number): Mossa;

  /**
   * Facoltativa: una mossa scelta dal computer al posto di una persona ferma da troppo tempo
   * (gioca in modo sensato, non a caso). `casuale` dà numeri in [0, 1).
   */
  mossaSostituto?(stato: Stato, giocatore: IdGiocatore, casuale: () => number): Mossa;

  /** Facoltativa: a chi tocca adesso (per far muovere i bot); null a partita finita. */
  diTurno?(stato: Stato): IdGiocatore | null;

  /**
   * Facoltativa: tempo massimo (millisecondi) per la decisione che si aspetta adesso, se le regole ne prevedono uno
   * (es. difendersi da un attacco nella Famiglia). Passato il tempo l'arbitro fa la mossa del sostituto, anche se
   * la partita non ha il "computer al posto di chi è fermo". null = vale l'attesa normale.
   */
  attesaMassimaMs?(stato: Stato): number | null;
}
