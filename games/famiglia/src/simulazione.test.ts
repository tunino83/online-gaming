import { describe, expect, it } from "vitest";
import { rapporto, simula, simulaPartita } from "./simulazione";

describe("simulazione", () => {
  it("una partita simulata finisce senza errori e qualcuno arriva a 20 punti", () => {
    const r = simulaPartita(1, 3);
    expect(r.errore).toBeUndefined();
    expect(r.finita).toBe(true);
    expect(Math.max(...r.punti)).toBeGreaterThanOrEqual(20);
    expect(Object.keys(r.attivazioni).length).toBeGreaterThan(0);
  });

  it("12 partite (da 2 a 5 giocatori) senza errori, con statistiche coerenti e un resoconto", () => {
    const st = simula(12);
    expect(st.errori).toEqual([]);
    expect(st.bloccate).toEqual([]);
    expect(st.finite).toBe(12);
    expect(Object.keys(st.perNumeroGiocatori).map(Number)).toEqual([2, 3, 4, 5]);
    for (const x of Object.values(st.perNumeroGiocatori)) {
      expect(x.vittoriePerPosizione.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    }
    const testo = rapporto(st);
    expect(testo).toContain("Durata e vantaggio di chi comincia");
    expect(testo).toContain("Carte di livello 3");
  });

  it("partita 365: Guardia medica d'emergenza contro Forno a legna non propone carte già usate per pagare", () => {
    expect(simulaPartita(365, 2).errore).toBeUndefined();
  });

  it("partite 100003 e 100805: Guardia medica d'emergenza contro Zeppata sui social, con la carta da dare usata per pagare", () => {
    expect(simulaPartita(100003, 5).errore).toBeUndefined();
    expect(simulaPartita(100805, 5).errore).toBeUndefined();
  });

  it("anche con la fine quando finisce il mazzo", () => {
    const st = simula(4, { modoFine: "mazzo" });
    expect(st.errori).toEqual([]);
    expect(st.finite).toBe(4);
    expect(st.finitePerMazzo).toBe(4);
  });
});
