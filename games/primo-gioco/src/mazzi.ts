/**
 * Composizione dei tre mazzi (vedi regolamento, "Materiale").
 * I mazzi qui sono in ordine: si mescolano al momento della preparazione.
 */
import { PERSONAGGI } from "./personaggi";
import type { CartaDiamante, CartaNumero, CartaPersonaggio, Valore } from "./tipi-carte";

export const VALORI: readonly Valore[] = [1, 2, 3, 4, 5, 6, 7, 8];
export const COPIE_PER_VALORE_NUMERO = 7;
export const DIAMANTI_PER_VALORE = 2;
export const FULMINI = 4;

/** 56 carte numero: valori 1–8, 7 copie per valore. */
export function creaMazzoNumeri(): CartaNumero[] {
  return VALORI.flatMap((valore) =>
    Array.from({ length: COPIE_PER_VALORE_NUMERO }, (_, copia) => ({
      id: `n${valore}-${copia + 1}`,
      valore,
    })),
  );
}

/** 20 diamanti: 2 per ogni valore 1–8 più 4 fulmini. */
export function creaMazzoDiamanti(): CartaDiamante[] {
  const conValore: CartaDiamante[] = VALORI.flatMap((valore) =>
    Array.from({ length: DIAMANTI_PER_VALORE }, (_, copia) => ({
      id: `d${valore}-${copia + 1}`,
      tipo: "valore" as const,
      valore,
    })),
  );
  const fulmini: CartaDiamante[] = Array.from({ length: FULMINI }, (_, i) => ({
    id: `fulmine-${i + 1}`,
    tipo: "fulmine" as const,
  }));
  return [...conValore, ...fulmini];
}

/** Mazzo personaggi: una carta per ogni copia di ogni personaggio. */
export function creaMazzoPersonaggi(): CartaPersonaggio[] {
  return PERSONAGGI.flatMap((p) =>
    Array.from({ length: p.copie }, (_, copia) => ({
      id: `${p.id}-${copia + 1}`,
      personaggio: p.id,
    })),
  );
}
