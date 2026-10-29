/**
 * Il codice di attivazione come fila di carte piccole: lo usano le carte stampate (scripts/stampa.ts) e quelle del sito.
 */
import type { Carta } from "./tipi-carte";

/** Pezzo del codice disegnato: una carta piccola (con un numero, una lettera o vuota), un segno tra le carte o uno spazio. */
export type PezzoCodice = { carta: string; valore?: number } | { segno: string } | { parola: string } | { spazio: number };

/**
 * Il codice di attivazione fatto di carte piccole, senza parole: lettere uguali = carte uguali (AA coppia, AAA tris,
 * AAAA poker, AABB doppia coppia), "+3 = 12" una somma di 3 carte, P e D carte pari o dispari, ? carte qualsiasi, 88 AA numeri e coppia.
 */
export function pezziDelCodice(codice: Carta["codice"]): PezzoCodice[] {
  const carte = (n: number, testo: string): PezzoCodice[] => Array.from({ length: n }, () => ({ carta: testo }));
  const numeri = (valori: number[]): PezzoCodice[] => valori.map((v) => ({ carta: String(v), valore: v }));
  switch (codice.tipo) {
    case "esatto":
      return numeri(codice.valori);
    case "uguali":
      // poker dispari (Il bastone): 4 carte uguali di valore dispari, lo dice la parola
      return [...carte(codice.carte, "A"), ...(codice.parita ? [{ parola: codice.parita }] : [])];
    case "somma":
      // "+3 = 15": una carta con il numero di carte da sommare, poi il totale nella moneta
      return [{ carta: `+${codice.carte}` }, { segno: "=" }, { parola: String(codice.totale) }];
    case "scala":
      return carte(codice.lunghezza, "↗");
    case "doppiaCoppia":
      return [{ carta: "A" }, { carta: "A" }, { carta: "B" }, { carta: "B" }];
    case "parita":
      return carte(codice.carte, codice.parita === "pari" ? "P" : "D");
    case "qualsiasi":
      return carte(codice.carte, "?");
    case "combinato":
      return [...numeri(codice.esatto), { spazio: 4 }, ...pezziDelCodice(codice.piu)];
  }
}
