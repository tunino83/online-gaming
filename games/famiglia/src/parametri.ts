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
  /** Come finisce la partita: a punti, o quando finisce il mazzo personaggi. */
  modoFine: "punti" | "mazzo";
  /** Secondi per decidere se difendersi (li fa rispettare l'arbitro). */
  secondiDifesa: number;
  /*
   * Varianti in prova (decise dopo le prime partite: attivare conviene troppo rispetto ai poteri).
   * Di base sono spente; vedi docs/famiglia/confronto-strategie.md.
   */
  /** Le carte solo aiuto (✨, anche blu) non danno punti. */
  aiutiSenzaPunti: boolean;
  /** 1 punto quando un tuo attacco colpisce, quando una tua difesa ferma un attacco, al primo aiuto usato nel turno. */
  puntiPerIPoteri: boolean;
  /** Al massimo 1 personaggio attivato per turno. */
  unaAttivazionePerTurno: boolean;
}

export const OPZIONI_DEFAULT: OpzioniPartita = {
  puntiPerVincere: 20,
  limiteMano: 7,
  maxNascosti: 3,
  maxAttacchi: 3,
  mossePerTurno: 3,
  modoFine: "punti",
  secondiDifesa: 30,
  aiutiSenzaPunti: false,
  puntiPerIPoteri: false,
  unaAttivazionePerTurno: false,
};

export const MIN_GIOCATORI = 2;
export const MAX_GIOCATORI = 5;

/** Carte scoperte al centro del tavolo. */
export const CARTE_NUMERO_SCOPERTE = 4;
export const PERSONAGGI_SCOPERTI = 2;
