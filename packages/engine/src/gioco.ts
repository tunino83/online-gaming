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
}
