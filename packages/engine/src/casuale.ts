/**
 * Generatore di numeri casuali con seed (algoritmo mulberry32).
 *
 * Lo stato del generatore è un semplice oggetto `{ s: number }`, serializzabile
 * in JSON e salvabile dentro lo stato della partita: ripartendo dallo stesso
 * stato si ottengono sempre gli stessi numeri.
 */

export interface StatoCasuale {
  s: number;
}

export function creaCasuale(seed: number): StatoCasuale {
  return { s: seed >>> 0 };
}

/** Numero decimale in [0, 1). Avanza lo stato del generatore. */
export function prossimo(rng: StatoCasuale): number {
  rng.s = (rng.s + 0x6d2b79f5) >>> 0;
  let t = rng.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Intero in [min, max], estremi inclusi. */
export function interoTra(rng: StatoCasuale, min: number, max: number): number {
  return min + Math.floor(prossimo(rng) * (max - min + 1));
}

/** Restituisce una copia mescolata dell'array (Fisher–Yates). */
export function mescola<T>(rng: StatoCasuale, elementi: readonly T[]): T[] {
  const copia = [...elementi];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = interoTra(rng, 0, i);
    [copia[i], copia[j]] = [copia[j] as T, copia[i] as T];
  }
  return copia;
}
