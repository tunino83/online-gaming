/**
 * Aspetto delle carte personaggio, comune all'app e all'anteprima (docs/anteprima-carte.html):
 * colore della cornice, etichetta del potere, codice spezzato in "tessere" da disegnare,
 * simbolo provvisorio finché non c'è l'illustrazione.
 */
import type { Codice, Personaggio } from "./tipi-carte";

export type ColoreCarta = "blu" | "rosso" | "misto" | "speciale" | "nessuno";

export function tipoCarta(p: Personaggio): { colore: ColoreCarta; etichetta: string } {
  const colori = new Set(p.poteri.map((x) => x.colore));
  if (colori.size === 0) return { colore: "nessuno", etichetta: "Senza potere" };
  if (colori.has("speciale")) return { colore: "speciale", etichetta: "Speciale" };
  if (colori.has("rosso") && colori.has("blu")) return { colore: "misto", etichetta: "Rosso + Blu" };
  return colori.has("rosso") ? { colore: "rosso", etichetta: "Rosso - una volta" } : { colore: "blu", etichetta: "Blu - sempre" };
}

/** Un pezzo del codice disegnato sulla carta. */
export type PezzoCodice =
  /** Carta numero con un valore preciso (es. 5). */
  | { tipo: "numero"; testo: string }
  /** Carta qualsiasi, con un segno (= uguale, ? qualsiasi, P pari, D dispari, n/+1 scala). */
  | { tipo: "generica"; testo: string }
  /** Un diamante qualsiasi. */
  | { tipo: "diamante" }
  /** Breve spiegazione (es. "somma 10", "coppia"). */
  | { tipo: "nota"; testo: string }
  | { tipo: "piu" }
  | { tipo: "oppure" };

const ripeti = <T>(n: number, x: T): T[] => Array.from({ length: n }, () => x);

export function pezziCodice(c: Codice): PezzoCodice[] {
  switch (c.tipo) {
    case "esatto":
      return c.valori.map((v) => ({ tipo: "numero", testo: String(v) }));
    case "uguali":
      return [
        ...ripeti(c.carte, { tipo: "generica" as const, testo: "=" }),
        { tipo: "nota", testo: { 2: "coppia", 3: "tris", 4: "poker" }[c.carte] },
      ];
    case "somma":
      return c.carte === undefined
        ? [{ tipo: "generica", testo: "?" }, { tipo: "generica", testo: "…" }, { tipo: "nota", testo: `somma ${c.totale}` }]
        : [...ripeti(c.carte, { tipo: "generica" as const, testo: "?" }), { tipo: "nota", testo: `somma ${c.totale}` }];
    case "scala": {
      // Scala da 3: n, +1, +2. Scale più lunghe abbreviate: n, …, +4 (per stare sulla carta).
      const tessere =
        c.lunghezza <= 3
          ? Array.from({ length: c.lunghezza }, (_, i) => (i === 0 ? "n" : `+${i}`))
          : ["n", "…", `+${c.lunghezza - 1}`];
      return [...tessere.map((testo) => ({ tipo: "generica" as const, testo })), { tipo: "nota", testo: `scala da ${c.lunghezza}` }];
    }
    case "doppiaCoppia":
      return ["a", "a", "b", "b"].map((t) => ({ tipo: "generica", testo: t }));
    case "parita":
      return [
        ...ripeti(c.carte, { tipo: "generica" as const, testo: c.parita === "pari" ? "P" : "D" }),
        { tipo: "nota", testo: c.parita },
      ];
    case "diamanteQualsiasi":
      return [{ tipo: "diamante" }];
    case "combinato":
      return [...c.esatto.map((v) => ({ tipo: "numero" as const, testo: String(v) })), { tipo: "piu" }, ...pezziCodice(c.piu)];
    case "alternativa":
      return c.opzioni.flatMap((o, i) => (i === 0 ? pezziCodice(o) : [{ tipo: "oppure" as const }, ...pezziCodice(o)]));
  }
}

/** Simboli provvisori, finché non ci sono le illustrazioni. */
const SIMBOLI: Record<string, string> = {
  fenice: "🔥", drago: "🐉", "cappuccetto-rosso": "🧺", scimmia: "🐒", strega: "🧙", "gatto-con-gli-stivali": "🐈",
  unicorno: "🦄", pinco: "🎈", panco: "🎪", leone: "🦁", giganti: "🗿", "hansel-e-gretel": "🍬", goblin: "👺",
  cerbero: "🐕", "quercia-umana": "🌳", regina: "👑", gnomo: "🍄", mago: "🔮", fantasma: "👻",
  "bacchetta-magica": "🪄", "robin-hood": "🏹", "hobbit-pari": "🥾", "hobbit-dispari": "🥾", "golem-pari": "🪨",
  "golem-dispari": "🪨", ercole: "💪", fatina: "🧚", scheletro: "💀", "cappellaio-matto": "🎩", xena: "⚔️",
  "capitan-uncino": "🏴‍☠️", folletto: "🍀", biancaneve: "🍎", "lucciola-444-555": "✨", "lucciola-333-666": "✨",
};

export const simboloProvvisorio = (p: Personaggio) => SIMBOLI[p.id] ?? (p.id.startsWith("nano") ? "⛏️" : "❔");
