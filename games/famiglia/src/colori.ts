/**
 * Colori delle carte numero: ogni valore è una gemma magica diversa, uguale nel gioco online e nel PDF da stampare.
 * `chiaro` è il riflesso di luce, `colore` la pietra, `scuro` l'ombra e il contorno.
 */
import type { Valore } from "./tipi-carte";

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
