/**
 * Composizione dei mazzi (vedi docs/famiglia/regolamento.md, "Materiale" e "Come Il Portale, con nomi nuovi").
 * I mazzi qui sono in ordine: si mescolano al momento della preparazione.
 */
import { CARTE } from "./carte";
import { EVENTI } from "./eventi";
import type { CartaMancia, CartaNumero, CopiaCarta, Valore } from "./tipi-carte";

export const VALORI: readonly Valore[] = [1, 2, 3, 4, 5, 6, 7, 8];
export const COPIE_PER_VALORE_NUMERO = 7;
export const MANCE_PER_VALORE = 2;
export const CAFFE = 4;
/** Valori delle carte numero con il campanello: una copia ciascuno (sostituisce una carta normale). */
export const VALORI_CON_CAMPANELLO: readonly Valore[] = [3, 4, 5];

/** 56 carte numero: valori 1–8, 7 copie per valore; la prima copia del 3, del 4 e del 5 ha il campanello. */
export function creaMazzoNumeri(): CartaNumero[] {
  return VALORI.flatMap((valore) =>
    Array.from({ length: COPIE_PER_VALORE_NUMERO }, (_, copia): CartaNumero => {
      const carta: CartaNumero = { id: `n${valore}-${copia + 1}`, valore };
      if (copia === 0 && VALORI_CON_CAMPANELLO.includes(valore)) carta.campanello = true;
      return carta;
    }),
  );
}

/** 20 carte mancia: 2 banconote per ogni valore 1–8 più 4 caffè. */
export function creaMazzoMancia(): CartaMancia[] {
  const banconote: CartaMancia[] = VALORI.flatMap((valore) =>
    Array.from({ length: MANCE_PER_VALORE }, (_, copia) => ({ id: `m${valore}-${copia + 1}`, tipo: "valore" as const, valore })),
  );
  const caffe: CartaMancia[] = Array.from({ length: CAFFE }, (_, i) => ({ id: `caffe-${i + 1}`, tipo: "caffe" as const }));
  return [...banconote, ...caffe];
}

/** Mazzo personaggi: una carta per ogni copia di ogni carta (es. "paesano#2"). */
export function creaMazzoPersonaggi(): CopiaCarta[] {
  return CARTE.flatMap((c) => Array.from({ length: c.copie }, (_, copia) => ({ id: `${c.id}#${copia + 1}`, carta: c.id })));
}

/** Mazzo eventi: un id per evento. */
export function creaMazzoEventi(): string[] {
  return EVENTI.map((e) => e.id);
}
