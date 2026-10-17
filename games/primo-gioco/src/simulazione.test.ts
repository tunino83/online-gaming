import { creaCasuale } from "@og/engine";
import { describe, expect, it } from "vitest";
import { mossaDelBot } from "./bot";
import { mosseValide, setup } from "./regole";
import { rapporto, simula, simulaPartita } from "./simulazione";

describe("bot", () => {
  it("sceglie sempre una mossa tra quelle valide", () => {
    const s = setup(["A", "B"], {}, 5);
    const rng = creaCasuale(1);
    for (let i = 0; i < 20; i++) expect(mosseValide(s, "A")).toContainEqual(mossaDelBot(s, "A", rng));
  });

  it("fuori turno non ha mosse", () => {
    const s = setup(["A", "B"], {}, 5);
    const fuori = s.turno.giocatore === "A" ? "B" : "A";
    expect(() => mossaDelBot(s, fuori, creaCasuale(1))).toThrow();
  });
});

describe("simulazione", () => {
  it("una partita simulata finisce senza errori e qualcuno arriva a 15", () => {
    const r = simulaPartita(1, 3);
    expect(r.errore).toBeUndefined();
    expect(r.finita).toBe(true);
    expect(Math.max(...r.punti)).toBeGreaterThanOrEqual(15);
  });

  it("è riproducibile: stesso seed, stessa partita", () => {
    expect(simulaPartita(9, 4)).toEqual(simulaPartita(9, 4));
  });

  it("12 partite (da 2 a 5 giocatori) senza errori, con statistiche coerenti", () => {
    const st = simula(12);
    expect(st.errori).toEqual([]);
    expect(st.bloccate).toEqual([]);
    expect(st.finite).toBe(12);
    expect(Object.keys(st.perNumeroGiocatori)).toEqual(["2", "3", "4", "5"]);
    for (const d of Object.values(st.perNumeroGiocatori)) {
      expect(d.puntiMediVincitore).toBeGreaterThanOrEqual(15);
      expect(d.vittoriePerPosizione.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    }
    expect(st.personaggi).toHaveLength(42);
    expect(rapporto(st)).toContain("# Statistiche della simulazione");
  });
});
