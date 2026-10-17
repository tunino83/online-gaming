/** Parametri della partita (vedi docs/regolamento.md, "Preparazione e parametri"). */
export interface OpzioniPartita {
  /** Punti per vincere. */
  puntiPerVincere: number;
  /** Limite carte numero in mano (modificabile dai poteri). */
  limiteMano: number;
  /** Posti personaggio per giocatore. */
  postiPersonaggio: number;
  /** Mosse per turno (più eventuali fulmini e poteri). */
  mossePerTurno: number;
}

export const OPZIONI_DEFAULT: OpzioniPartita = {
  puntiPerVincere: 15,
  limiteMano: 5,
  postiPersonaggio: 2,
  mossePerTurno: 3,
};

export const MIN_GIOCATORI = 2;
export const MAX_GIOCATORI = 5;

/** Carte scoperte al centro del tavolo. */
export const CARTE_NUMERO_SCOPERTE = 4;
export const PERSONAGGI_SCOPERTI = 2;
