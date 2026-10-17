import { describe, expect, it } from "vitest";
import { applicaMossa, setup } from "./regole";
import type { Mossa } from "./stato";
import { validaMossa } from "./valida-mossa";

describe("controllo della forma delle mosse (arrivano dal browser)", () => {
  it("accetta le mosse ben formate", () => {
    const buone: Mossa[] = [
      { tipo: "prendiNumero", posizione: 0 },
      { tipo: "pescaPersonaggio" },
      { tipo: "brucia" },
      { tipo: "giocaFulmine", diamante: "fulmine-1" },
      { tipo: "fineTurno", scarta: ["n1-1"], cambiaMano: false },
      {
        tipo: "attiva",
        carta: "strega-1",
        combinazione: [
          { tipo: "numero", id: "n1-1", valore: 2, modifica: { diamante: "d3-1", delta: 1 } },
          { tipo: "diamante", id: "d2-1", valore: 2 },
          { tipo: "diamante", id: "fulmine-2" },
          { tipo: "virtuale", fonte: "nano-3-1", valore: 3 },
        ],
        bersaglio: { giocatore: "B", carta: "leone-1" },
      },
    ];
    for (const m of buone) expect(validaMossa(m), JSON.stringify(m)).toBe(true);
  });

  it("rifiuta tipi sconosciuti, campi in più e valori del tipo sbagliato", () => {
    const cattive: unknown[] = [
      null,
      "brucia",
      [],
      { tipo: "vinciSubito" },
      { tipo: "brucia", extra: 1 },
      { tipo: "prendiNumero", posizione: "length" },
      { tipo: "prendiNumero", posizione: -1 },
      { tipo: "prendiNumero", posizione: 1.5 },
      { tipo: "prendiNumero" },
      { tipo: "fineTurno", scarta: "n1", cambiaMano: false },
      { tipo: "fineTurno", scarta: [], cambiaMano: "sì" },
      { tipo: "attiva", carta: "x", combinazione: [] },
      { tipo: "attiva", carta: "x", combinazione: [{ tipo: "numero", id: "a" }] },
      { tipo: "attiva", carta: "x", combinazione: [{ tipo: "numero", id: "a", valore: 1, modifica: { diamante: "d", delta: 2 } }] },
      { tipo: "attiva", carta: "x", combinazione: [{ tipo: "virtuale", fonte: "n", valore: 1 }], bersaglio: "B" },
      { tipo: "giocaFulmine", diamante: "" },
    ];
    for (const m of cattive) expect(validaMossa(m), JSON.stringify(m)).toBe(false);
  });

  it("applicaMossa rifiuta una mossa malformata senza toccare lo stato", () => {
    const s = setup(["A", "B"], {}, 1);
    const chi = s.turno.giocatore;
    const r = applicaMossa(s, chi, { tipo: "prendiNumero", posizione: "length" } as unknown as Mossa);
    expect(r).toEqual({ ok: false, errore: "Mossa non valida" });
  });

  it("un avversario inesistente (anche con nomi strani) è rifiutato", () => {
    const s = setup(["A", "B"], {}, 1);
    const chi = s.turno.giocatore;
    s.giocatori[chi]!.mano = [
      { id: "x5", valore: 5 },
      { id: "x6", valore: 6 },
      { id: "x7", valore: 7 },
    ];
    s.giocatori[chi]!.posti = [{ id: "fatina-x", personaggio: "fatina" }];
    const mossa = (avversario: string): Mossa => ({
      tipo: "attiva",
      carta: "fatina-x",
      combinazione: ["x5", "x6", "x7"].map((id, i) => ({ tipo: "numero", id, valore: 5 + i })),
      avversario,
    });
    for (const nome of ["__proto__", "constructor", "Z"]) {
      expect(applicaMossa(s, chi, mossa(nome))).toEqual({ ok: false, errore: "Scegli l'avversario di cui guardare la mano" });
    }
  });
});
