/**
 * Tipi delle carte della Famiglia: codici di attivazione, poteri, personaggi, carte difesa e attacco,
 * carte numero, mancia dei nonni ed eventi. I dati veri stanno in `carte.ts` ed `eventi.ts`.
 */

/** Valore di una carta numero o di una mancia: da 1 a 8. */
export type Valore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Codice di attivazione (vedi docs/regolamento.md di Il Portale, "Codici di attivazione"). */
export type Codice =
  /** Esattamente quei valori, in qualsiasi ordine (es. 25). */
  | { tipo: "esatto"; valori: Valore[] }
  /** Coppia, tris o poker: 2, 3 o 4 carte dello stesso valore. */
  | { tipo: "uguali"; carte: 2 | 3 | 4 }
  /** `carte` carte la cui somma è `totale`. */
  | { tipo: "somma"; totale: number; carte: number }
  /** Valori consecutivi (scala da 3 o da 5). */
  | { tipo: "scala"; lunghezza: 3 | 5 }
  /** Due coppie, anche dello stesso valore. */
  | { tipo: "doppiaCoppia" }
  /** `carte` carte tutte pari o tutte dispari. */
  | { tipo: "parita"; carte: number; parita: "pari" | "dispari" }
  /** `carte` carte qualsiasi (vini, Campari, scuse, Vento). */
  | { tipo: "qualsiasi"; carte: number }
  /** Una parte esatta più una parte generica (es. 66 + una coppia). */
  | { tipo: "combinato"; esatto: Valore[]; piu: Codice };

/** ⚔️ attacco, 🛡️ difesa, ✨ aiuto a sé stessi. */
export type TipoPotere = "attacco" | "difesa" | "aiuto";

export type Livello = 1 | 2 | 3;

export interface Potere {
  /** Identificativo tecnico (es. "forno-a-legna"): le regole riconoscono il potere da qui. */
  id: string;
  /** Nome come scritto nella bozza (es. "Forno a legna"). */
  nome: string;
  tipo: TipoPotere;
  /** Cosa fa, in breve (per l'interfaccia). */
  testo: string;
  /**
   * Carta "blu" (come in Il Portale): dopo l'attivazione è sempre attiva, non si stanca mai e non costa mosse;
   * ogni effetto vale una volta per turno (salvo eccezioni scritte sulla carta).
   */
  blu?: true;
}

/**
 * Una carta del mazzo personaggi:
 * - "personaggio": si attiva pagando il codice, dà punti e ha un potere che si ricarica;
 * - "difesa": vini, Campari e scuse; si usa solo d'emergenza quando si viene attaccati, poi si scarta;
 * - "attacco": tomacella, giro aperto, occhi 'nguoll, vento; si usa una volta (con una mossa), poi si scarta.
 */
export interface Carta {
  /** Identificativo tecnico unico, usato anche per l'immagine (es. "antonio-2", "nicole", "paesano"). */
  id: string;
  /** Persona a cui appartiene (es. "antonio"): immagine comune e "Famiglia al completo". */
  persona: string;
  /** Nome della persona o della carta (es. "Antonio", "Paesano"). */
  nome: string;
  categoria: "personaggio" | "difesa" | "attacco";
  livello: Livello;
  codice: Codice;
  punti: number;
  /** Turni per ricaricarsi dopo l'uso (0 per le carte che si usano una volta sola). */
  ricarica: number;
  /** Uno o due poteri (con due, il giocatore sceglie quale usare). Mai attacco insieme a non attacco. */
  poteri: Potere[];
  /** Note in più scritte sulla carta (es. "non beve vino"). */
  nota?: string;
  copie: number;
}

/** Carta numero: valori 1–8. */
export interface CartaNumero {
  id: string;
  valore: Valore;
  /** Campanello: quando compare scoperta sul tavolo si cambiano i 2 personaggi scoperti. */
  campanello?: true;
  /** Carta "fatta in casa" (Maddalena): le 2 carte unite; `valore` è la loro somma. Si scartano tutte e due. */
  unite?: [CartaNumero, CartaNumero];
}

/** Mancia dei nonni: banconota con valore, oppure caffè (una mossa in più o +1 a una carta). */
export type CartaMancia =
  | { id: string; tipo: "valore"; valore: Valore }
  | { id: string; tipo: "caffe" };

/** Una copia fisica di una carta nel mazzo personaggi. */
export interface CopiaCarta {
  id: string;
  carta: string;
}

export interface Evento {
  id: string;
  nome: string;
  /** Durata in turni (un turno = il turno di un giocatore). */
  durata: number;
  testo: string;
}
