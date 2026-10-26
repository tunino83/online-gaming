/**
 * Colori delle carte numero: ogni valore ha il suo (numero e angoli della piastrella), uguali nel gioco online
 * e nel PDF da stampare. `chiaro` è la stessa tinta, schiarita, per il cerchio interno degli angoli.
 */
import type { Valore } from "./tipi-carte";

export const COLORI_NUMERI: Record<Valore, { colore: string; chiaro: string }> = {
  1: { colore: "#d1352b", chiaro: "#f6c6c1" }, // rosso
  2: { colore: "#e07b12", chiaro: "#fadbb6" }, // arancione
  3: { colore: "#b58a00", chiaro: "#f5e3a3" }, // senape
  4: { colore: "#3a9a3f", chiaro: "#c9e8c6" }, // verde
  5: { colore: "#12928b", chiaro: "#bfe7e3" }, // verde acqua
  6: { colore: "#2a63a8", chiaro: "#c6d8f0" }, // blu
  7: { colore: "#7b4bb3", chiaro: "#ddcdf0" }, // viola
  8: { colore: "#c2407c", chiaro: "#f3c9dc" }, // fucsia
};
