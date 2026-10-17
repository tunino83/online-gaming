import { describe, expect, it } from "vitest";
import { creaCasuale, interoTra, mescola, prossimo } from "./casuale";

describe("generatore casuale con seed", () => {
  it("stesso seed produce la stessa sequenza", () => {
    const a = creaCasuale(42);
    const b = creaCasuale(42);
    const seqA = Array.from({ length: 20 }, () => prossimo(a));
    const seqB = Array.from({ length: 20 }, () => prossimo(b));
    expect(seqA).toEqual(seqB);
  });

  it("seed diversi producono sequenze diverse", () => {
    const a = creaCasuale(1);
    const b = creaCasuale(2);
    expect(prossimo(a)).not.toEqual(prossimo(b));
  });

  it("lo stato è serializzabile: ripartire da una copia JSON dà gli stessi numeri", () => {
    const rng = creaCasuale(7);
    prossimo(rng);
    const copia = JSON.parse(JSON.stringify(rng));
    expect(prossimo(copia)).toEqual(prossimo(rng));
  });

  it("interoTra resta negli estremi e li raggiunge entrambi", () => {
    const rng = creaCasuale(123);
    const visti = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = interoTra(rng, 1, 8);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(8);
      visti.add(n);
    }
    expect([...visti].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("mescola mantiene le stesse carte e non modifica l'originale", () => {
    const rng = creaCasuale(99);
    const carte = Array.from({ length: 56 }, (_, i) => i);
    const mescolate = mescola(rng, carte);
    expect(mescolate).not.toEqual(carte);
    expect([...mescolate].sort((x, y) => x - y)).toEqual(carte);
    expect(carte[0]).toBe(0);
  });

  it("mescola è riproducibile con lo stesso seed", () => {
    const carte = ["a", "b", "c", "d", "e", "f"];
    expect(mescola(creaCasuale(5), carte)).toEqual(mescola(creaCasuale(5), carte));
  });
});
