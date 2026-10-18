/**
 * Tipi delle carte del primo gioco: codici di attivazione, poteri, personaggi,
 * carte numero e diamanti. I dati veri stanno in `personaggi.ts` e `mazzi.ts`.
 */

/** Valore di una carta numero o di un diamante: da 1 a 8. */
export type Valore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Codice di attivazione (vedi regolamento, "Codici di attivazione"). */
export type Codice =
  /** Esattamente quei valori, in qualsiasi ordine (es. 7788). */
  | { tipo: "esatto"; valori: Valore[] }
  /** Coppia, tris o poker: 2, 3 o 4 carte dello stesso valore. */
  | { tipo: "uguali"; carte: 2 | 3 | 4 }
  /** `carte` carte la cui somma è `totale`. Senza `carte`: quante se ne vuole. */
  | { tipo: "somma"; totale: number; carte?: number }
  /** Valori consecutivi (scala da 3 o da 5). */
  | { tipo: "scala"; lunghezza: 3 | 5 }
  /** Due coppie, anche dello stesso valore. */
  | { tipo: "doppiaCoppia" }
  /** `carte` carte tutte pari o tutte dispari. */
  | { tipo: "parita"; carte: number; parita: "pari" | "dispari" }
  /** Un diamante qualsiasi, anche un fulmine (solo dentro un codice combinato). */
  | { tipo: "diamanteQualsiasi" }
  /** Una parte esatta più una parte generica (es. 66 + una coppia). */
  | { tipo: "combinato"; esatto: Valore[]; piu: Codice }
  /** Basta soddisfare una delle opzioni (es. 444 oppure 555). */
  | { tipo: "alternativa"; opzioni: Codice[] };

/** Effetto di un potere. Il comportamento è implementato nelle regole (passo 4). */
export type Effetto =
  /** Nani, Fenice, Drago: una carta virtuale per i codici, una volta per turno. */
  | { tipo: "cartaVirtuale"; valore: Valore | "aScelta" }
  /** Cappuccetto Rosso: mosse in più in ogni turno (4 invece di 3). */
  | { tipo: "mosseInPiuOgniTurno"; mosse: number }
  /** Scimmia: limite della mano aumentato. */
  | { tipo: "limiteMano"; aumento: number }
  /** Strega: scarta un personaggio dai posti di un avversario. */
  | { tipo: "scartaPersonaggioAvversario" }
  /** Gatto con gli stivali: una carta del codice resta in mano. */
  | { tipo: "tieniUnaCartaDelCodice" }
  /** Ricevi diamanti. */
  | { tipo: "riceviDiamanti"; quanti: number }
  /** Golem: mosse in più in questo turno. */
  | { tipo: "mosseExtraOra"; mosse: number }
  /** Mago: vede la prima carta coperta del mazzo personaggi. */
  | { tipo: "vediMazzoPersonaggi" }
  /** Fantasma: il giocatore successivo ha una mossa in più nel suo prossimo turno. */
  | { tipo: "mossaExtraAlSuccessivo" }
  /** Bacchetta magica: una volta per turno brucia senza consumare una mossa. */
  | { tipo: "bruciaGratis" }
  /** Robin Hood: ogni 1 in mano (carta o diamante) può valere anche 8. */
  | { tipo: "unoValeOtto" }
  /** Fatina: guarda la mano di un avversario e prendi una carta. */
  | { tipo: "rubaCarta" }
  /** Scheletro: a fine turno cambia tutte le carte in mano. */
  | { tipo: "cambiaMano" }
  /** Cappellaio matto: a inizio turno scambia un personaggio con uno del tavolo. */
  | { tipo: "scambiaConTavolo" }
  /** Xena: i diamanti possono fare anche −1. */
  | { tipo: "diamanteMenoUno" }
  /** Folletto: ogni 3 in mano può valere qualsiasi numero da 1 a 8. */
  | { tipo: "treJolly" }
  /** Biancaneve: ogni 2 in mano si può scambiare con un diamante. */
  | { tipo: "dueInDiamante" }
  /** Lucciola: attivabile anche dai giocatori vicini. */
  | { tipo: "attivabileDaVicini" };

export interface Potere {
  /** Blu = permanente, rosso = una volta sola, speciale = regola a parte. */
  colore: "blu" | "rosso" | "speciale";
  effetto: Effetto;
}

export interface Personaggio {
  /** Identificativo tecnico unico (minuscolo, senza spazi). */
  id: string;
  /** Nome come scritto nel regolamento. */
  nome: string;
  /** Codice come scritto nel regolamento (per controllo e per l'interfaccia). */
  codiceTesto: string;
  codice: Codice;
  punti: number;
  /** Testo del potere come scritto nel regolamento. */
  potereTesto: string;
  /** Effetti del potere (vuoto = nessun potere). Xena ne ha due. */
  poteri: Potere[];
  copie: number;
}

/** Carta numero: valori 1–8. */
export interface CartaNumero {
  id: string;
  valore: Valore;
  /** Carta con le frecce: quando compare scoperta sul tavolo si cambiano i 2 personaggi scoperti. */
  frecce?: true;
}

/** Carta diamante: con valore oppure fulmine. */
export type CartaDiamante =
  | { id: string; tipo: "valore"; valore: Valore }
  | { id: string; tipo: "fulmine" };

/** Una copia fisica di un personaggio nel mazzo. */
export interface CartaPersonaggio {
  id: string;
  personaggio: string;
}
