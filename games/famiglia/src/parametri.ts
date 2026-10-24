/** Parametri della partita (vedi docs/famiglia/regolamento.md, "Le zone di ogni giocatore" e "Fine partita"). */
export interface OpzioniPartita {
  /** Punti per vincere (modo "a punti"). */
  puntiPerVincere: number;
  /** Limite carte numero in mano a fine turno. */
  limiteMano: number;
  /** Personaggi e carte difesa nascosti in mano. */
  maxNascosti: number;
  /** Attacchi in attesa (scoperti). */
  maxAttacchi: number;
  /** Mosse per turno (più caffè e poteri). */
  mossePerTurno: number;
}

export const OPZIONI_DEFAULT: OpzioniPartita = {
  puntiPerVincere: 20,
  limiteMano: 7,
  maxNascosti: 3,
  maxAttacchi: 3,
  mossePerTurno: 3,
};

export const MIN_GIOCATORI = 2;
export const MAX_GIOCATORI = 5;

/** Carte scoperte al centro del tavolo. */
export const CARTE_NUMERO_SCOPERTE = 4;
export const PERSONAGGI_SCOPERTI = 2;
