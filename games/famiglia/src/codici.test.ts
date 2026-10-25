import { describe, expect, it } from "vitest";
import { type Combinazione, type Risorse, combinazioneConCarte, descriviCodice, puoPagare, trovaCombinazioni, verificaCombinazione } from "./codici";
import type { CartaMancia, CartaNumero, Codice, Valore } from "./tipi-carte";

/* ---------------- aiuti per scrivere i test in breve ---------------- */

/** Mano da una lista di valori: id n0, n1, ... */
const mano = (...valori: number[]): CartaNumero[] => valori.map((v, i) => ({ id: `n${i}`, valore: v as Valore }));
/** Mancia: un numero = banconota con valore, "c" = caffè. Id m0, m1, ... */
const mancia = (...valori: (number | "c")[]): CartaMancia[] =>
  valori.map((v, i) => (v === "c" ? { id: `m${i}`, tipo: "caffe" } : { id: `m${i}`, tipo: "valore", valore: v as Valore }));
const risorse = (m: CartaNumero[], d: CartaMancia[] = []): Risorse => ({ mano: m, mancia: d });

const coppia: Codice = { tipo: "uguali", carte: 2 };
const puo = (codice: Codice, ...valori: number[]) => puoPagare(risorse(mano(...valori)), codice);

describe("tipi di codice", () => {
  it("esatto: quei valori, in qualsiasi ordine", () => {
    expect(puo({ tipo: "esatto", valori: [2, 5] }, 5, 2)).toBe(true);
    expect(puo({ tipo: "esatto", valori: [2, 5] }, 2, 6)).toBe(false);
    expect(puo({ tipo: "esatto", valori: [1, 1, 1, 1] }, 1, 1, 1)).toBe(false);
  });

  it("coppia, tris, poker", () => {
    expect(puo(coppia, 4, 4)).toBe(true);
    expect(puo({ tipo: "uguali", carte: 3 }, 4, 4, 5)).toBe(false);
    expect(puo({ tipo: "uguali", carte: 4 }, 6, 6, 6, 6)).toBe(true);
  });

  it("poker dispari: 4 carte uguali di valore dispari (Nonno Antonio 3)", () => {
    const pokerDispari: Codice = { tipo: "uguali", carte: 4, parita: "dispari" };
    expect(puo(pokerDispari, 3, 3, 3, 3)).toBe(true);
    expect(puo(pokerDispari, 7, 7, 7, 7, 2)).toBe(true);
    expect(puo(pokerDispari, 6, 6, 6, 6)).toBe(false);
    expect(puo(pokerDispari, 3, 3, 3, 5)).toBe(false);
    expect(descriviCodice(pokerDispari)).toBe("Poker dispari");
  });

  it("somma con un numero preciso di carte", () => {
    expect(puo({ tipo: "somma", carte: 3, totale: 20 }, 8, 7, 5)).toBe(true);
    expect(puo({ tipo: "somma", carte: 2, totale: 9 }, 8, 7, 5)).toBe(false);
  });

  it("scala da 3 e da 5", () => {
    expect(puo({ tipo: "scala", lunghezza: 3 }, 6, 4, 5)).toBe(true);
    expect(puo({ tipo: "scala", lunghezza: 5 }, 1, 2, 3, 4, 6)).toBe(false);
  });

  it("doppia coppia, anche dello stesso valore", () => {
    expect(puo({ tipo: "doppiaCoppia" }, 3, 3, 7, 7)).toBe(true);
    expect(puo({ tipo: "doppiaCoppia" }, 5, 5, 5, 5)).toBe(true);
    expect(puo({ tipo: "doppiaCoppia" }, 5, 5, 5, 6)).toBe(false);
  });

  it("carte pari o dispari", () => {
    expect(puo({ tipo: "parita", carte: 4, parita: "dispari" }, 1, 3, 5, 7)).toBe(true);
    expect(puo({ tipo: "parita", carte: 2, parita: "pari" }, 2, 3)).toBe(false);
  });

  it("carte qualsiasi (vini, Campari, scuse, Vento)", () => {
    expect(puo({ tipo: "qualsiasi", carte: 1 }, 7)).toBe(true);
    expect(puo({ tipo: "qualsiasi", carte: 2 }, 7)).toBe(false);
    expect(puoPagare(risorse([]), { tipo: "qualsiasi", carte: 1 })).toBe(false);
  });

  it("combinato: 66 + una coppia qualsiasi (anche 66)", () => {
    const codice: Codice = { tipo: "combinato", esatto: [6, 6], piu: coppia };
    expect(puo(codice, 6, 6, 2, 2)).toBe(true);
    expect(puo(codice, 6, 6, 6, 6)).toBe(true);
    expect(puo(codice, 6, 2, 2, 2)).toBe(false);
  });
});

describe("mancia dei nonni e caffè", () => {
  it("una mancia con valore vale come una carta numero", () => {
    expect(puoPagare(risorse(mano(4), mancia(4)), coppia)).toBe(true);
  });

  it("una mancia o un caffè fanno +1 a una carta", () => {
    const r = risorse(mano(4, 5), mancia("c"));
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 5, modifica: { mancia: "m0" } },
      { tipo: "numero", id: "n1", valore: 5 },
    ];
    expect(verificaCombinazione(r, coppia, comb)).toEqual({ ok: true });
    expect(puoPagare(r, coppia)).toBe(true);
  });

  it("il caffè non vale come carta", () => {
    const r = risorse(mano(4), mancia("c"));
    expect(verificaCombinazione(r, coppia, [{ tipo: "numero", id: "n0", valore: 4 }, { tipo: "mancia", id: "m0", valore: 4 }]).ok).toBe(false);
  });

  it("il +1 non può superare 8 e una carta non si usa due volte", () => {
    expect(puoPagare(risorse(mano(8), mancia(8)), { tipo: "esatto", valori: [8, 9 as Valore] })).toBe(false);
    const r = risorse(mano(3));
    expect(verificaCombinazione(r, coppia, [{ tipo: "numero", id: "n0", valore: 3 }, { tipo: "numero", id: "n0", valore: 3 }]).ok).toBe(false);
  });

  it("valori dichiarati falsi vengono rifiutati", () => {
    const r = risorse(mano(3, 4));
    expect(verificaCombinazione(r, coppia, [{ tipo: "numero", id: "n0", valore: 4 }, { tipo: "numero", id: "n1", valore: 4 }]).ok).toBe(false);
  });
});

describe("ricerca delle combinazioni", () => {
  it("carte uguali non danno combinazioni doppie", () => {
    expect(trovaCombinazioni(risorse(mano(5, 5, 5)), coppia).length).toBe(1);
  });

  it("combinazioneConCarte trova da sola come usare le carte scelte", () => {
    const r = risorse(mano(4, 5), mancia(3));
    expect(combinazioneConCarte(r, coppia, ["n0", "n1", "m0"])).not.toBeNull();
    expect(combinazioneConCarte(r, coppia, ["n0", "n1"])).toBeNull();
  });
});

describe("testo dei codici", () => {
  it("si scrive come nelle tabelle", () => {
    expect(descriviCodice({ tipo: "somma", carte: 4, totale: 20 })).toBe("4 carte con somma 20");
    expect(descriviCodice({ tipo: "combinato", esatto: [8, 8], piu: coppia })).toBe("88 + una coppia qualsiasi");
    expect(descriviCodice({ tipo: "esatto", valori: [1, 2, 3, 4] })).toBe("1234");
    expect(descriviCodice({ tipo: "qualsiasi", carte: 1 })).toBe("1 carta qualsiasi");
  });
});
