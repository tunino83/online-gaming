/**
 * Colori delle carte numero: ogni valore è una gemma magica diversa, uguale nel gioco online e nel PDF da stampare.
 * `chiaro` è il riflesso di luce, `colore` la pietra, `scuro` l'ombra e il contorno.
 */
import type { Carta, Potere, Valore } from "./tipi-carte";

export const COLORI_NUMERI: Record<Valore, { nome: string; colore: string; chiaro: string; scuro: string }> = {
  1: { nome: "rubino", colore: "#c0283a", chiaro: "#ff9aa6", scuro: "#6e0f1c" },
  2: { nome: "ambra", colore: "#d9781a", chiaro: "#ffd08a", scuro: "#7a3c06" },
  3: { nome: "topazio", colore: "#c9a000", chiaro: "#fff08a", scuro: "#6b5200" },
  4: { nome: "smeraldo", colore: "#1f8a4c", chiaro: "#9df0bf", scuro: "#0b4424" },
  5: { nome: "acquamarina", colore: "#1797a6", chiaro: "#a8f2fa", scuro: "#08515a" },
  6: { nome: "zaffiro", colore: "#2547a8", chiaro: "#a9c0ff", scuro: "#0e1f57" },
  7: { nome: "ametista", colore: "#7a3fb0", chiaro: "#e0c2ff", scuro: "#3b1660" },
  8: { nome: "quarzo rosa", colore: "#c23d7e", chiaro: "#ffbfe0", scuro: "#661440" },
};

/**
 * Colori dei tipi di carta (deciso il 2026-10-28), uguali nel gioco online e nel PDF:
 * rosso attacchi, blu difese, giallo aiuti, verde aiuti sempre attivi ("blu" è il nome tecnico rimasto),
 * viola difese usa e getta (vini, Campari, scuse), arancione attacchi usa e getta (Tomacella, Giro aperto…).
 */
export const COLORI_TIPI = {
  attacco: { colore: "#c63d2f", scuro: "#8e2219" },
  difesa: { colore: "#2d5f9a", scuro: "#1b3d66" },
  aiuto: { colore: "#d9a514", scuro: "#946c05" },
  blu: { colore: "#3e8a4f", scuro: "#25603a" },
  difesaUnaVolta: { colore: "#7a3fb0", scuro: "#4b2272" },
  attaccoUnaVolta: { colore: "#e07a1f", scuro: "#9e4f0a" },
} as const;
export type TipologiaCarta = keyof typeof COLORI_TIPI;

/** Tipo (e quindi colore) di un potere di una carta: le carte difesa e attacco "usa e getta" hanno colori propri. */
export function tipologiaPotere(c: Pick<Carta, "categoria">, p: Pick<Potere, "blu" | "tipo">): TipologiaCarta {
  if (c.categoria === "difesa") return "difesaUnaVolta";
  if (c.categoria === "attacco") return "attaccoUnaVolta";
  return p.blu ? "blu" : p.tipo;
}

/** I tipi dei poteri di una carta, senza ripetizioni (al massimo 2). */
export const tipologieCarta = (c: Carta): TipologiaCarta[] => [...new Set(c.poteri.map((p) => tipologiaPotere(c, p)))];

/** Colore principale della carta: attacco, poi difesa (se non ha aiuti), poi aiuto. */
export function tipologiaPrincipale(c: Carta): TipologiaCarta {
  const tipi = tipologieCarta(c);
  if (tipi.includes("attacco")) return "attacco";
  if (tipi.includes("difesa") && !tipi.includes("aiuto") && !tipi.includes("blu")) return "difesa";
  if (tipi.includes("aiuto")) return "aiuto";
  return tipi[0] ?? "aiuto";
}

