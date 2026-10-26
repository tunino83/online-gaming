import { describe, expect, it } from "vitest";
import { confronta, partitaConfronto, rapportoConfronto } from "./strategie";

describe("confronto tra strategie", () => {
  it("una partita attivatore contro poteri finisce senza errori, anche con tutte le varianti", () => {
    const e = partitaConfronto(1, ["attivatore", "poteri"], { aiutiSenzaPunti: true, puntiPerIPoteri: true, unaAttivazionePerTurno: true });
    expect(e.errore).toBeUndefined();
    expect(e.vincitori.length).toBeGreaterThan(0);
    expect(e.puntiPoteri.poteri).toBeGreaterThan(0);
  });

  it("poche partite per variante: percentuali coerenti e resoconto", () => {
    const r = confronta("prova", {}, 2, 6);
    expect(r.errori).toBe(0);
    expect(r.vittoriePoteri).toBeGreaterThanOrEqual(0);
    expect(r.vittoriePoteri).toBeLessThanOrEqual(100);
    expect(rapportoConfronto([r], 6)).toContain("conviene attivare o usare i poteri");
  });
});
