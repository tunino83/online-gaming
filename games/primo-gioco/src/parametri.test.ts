import { describe, expect, it } from "vitest";
import { MAX_GIOCATORI, MIN_GIOCATORI, OPZIONI_DEFAULT } from "./parametri";

describe("parametri della partita (regolamento)", () => {
  it("si gioca da 2 a 5 giocatori", () => {
    expect(MIN_GIOCATORI).toBe(2);
    expect(MAX_GIOCATORI).toBe(5);
  });

  it("default: 15 punti, mano 5, 2 posti, 3 mosse", () => {
    expect(OPZIONI_DEFAULT).toEqual({
      puntiPerVincere: 15,
      limiteMano: 5,
      postiPersonaggio: 2,
      mossePerTurno: 3,
    });
  });
});
