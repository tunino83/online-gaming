import { creaCasuale } from "@og/engine";
import { describe, expect, it } from "vitest";
import { cartePerAverlo, probabilitaInMano } from "./difficolta-codici";

describe("quanto è facile attivare le carte", () => {
  it("una coppia in 7 carte: il conto a caso è vicino a quello esatto (97%)", () => {
    // senza coppia servono 7 valori diversi su 8: 8 · 7^7 mani su C(56, 7)
    const esatto = 1 - (8 * 7 ** 7) / 231917400;
    const stima = probabilitaInMano({ tipo: "uguali", carte: 2 }, 7, 4000, creaCasuale(3));
    expect(Math.abs(stima - esatto)).toBeLessThan(0.02);
  });

  it("un codice più lungo è più difficile e servono più carte", () => {
    const rng = creaCasuale(5);
    expect(probabilitaInMano({ tipo: "uguali", carte: 3 }, 7, 2000, rng)).toBeLessThan(probabilitaInMano({ tipo: "uguali", carte: 2 }, 7, 2000, rng));
    // una coppia arriva al massimo alla nona carta (8 valori)
    const coppia = cartePerAverlo({ tipo: "uguali", carte: 2 }, 300, rng);
    expect(coppia).toBeGreaterThanOrEqual(2);
    expect(coppia).toBeLessThanOrEqual(9);
    expect(cartePerAverlo({ tipo: "uguali", carte: 4 }, 300, rng)).toBeGreaterThan(coppia);
  });
});
