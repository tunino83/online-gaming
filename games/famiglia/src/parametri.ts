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
  /** Con "punti per i poteri": anche il primo aiuto del turno dà 1 punto (se no, solo attacchi a segno e difese riuscite). */
  puntiPerGliAiuti: boolean;
}

export const OPZIONI_DEFAULT: OpzioniPartita = {
  // Regole dei punti decise il 2026-10-26 (variante C1, vedi docs/famiglia/confronto-strategie.md):
  // si vince a 25, le carte solo aiuto valgono 0, +1 punto per ogni attacco a segno e ogni difesa riuscita.
  puntiPerVincere: 25,
  limiteMano: 7,
  maxNascosti: 3,
  maxAttacchi: 3,
  mossePerTurno: 3,
  modoFine: "punti",
  secondiDifesa: 30,
  aiutiSenzaPunti: true,
  puntiPerIPoteri: true,
  unaAttivazionePerTurno: false,
  puntiPerGliAiuti: false,
};

export const MIN_GIOCATORI = 2;
export const MAX_GIOCATORI = 5;

/** Carte scoperte al centro del tavolo. */
export const CARTE_NUMERO_SCOPERTE = 4;
export const PERSONAGGI_SCOPERTI = 2;
