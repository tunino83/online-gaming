import { creaCasuale, interoTra, mescola } from "@og/engine";
import { describe, expect, it } from "vitest";
import {
  type CartaVirtuale,
  type Combinazione,
  type Elemento,
  type Risorse,
  combinazioneConCarte,
  combinazioneConDiamanti,
  risorseUsate,
  puoAttivare,
  trovaCombinazioni,
  verificaCombinazione,
} from "./codici";
import { creaMazzoDiamanti, creaMazzoNumeri } from "./mazzi";
import { PERSONAGGI, personaggio } from "./personaggi";
import type { CartaDiamante, CartaNumero, Codice, Valore } from "./tipi-carte";

/* ---------------- aiuti per scrivere i test in breve ---------------- */

/** Mano da una lista di valori: id n0, n1, ... */
const mano = (...valori: number[]): CartaNumero[] => valori.map((v, i) => ({ id: `n${i}`, valore: v as Valore }));
/** Diamanti: un numero = diamante con valore, "f" = fulmine. Id d0, d1, ... */
const diam = (...valori: (number | "f")[]): CartaDiamante[] =>
  valori.map((v, i) => (v === "f" ? { id: `d${i}`, tipo: "fulmine" } : { id: `d${i}`, tipo: "valore", valore: v as Valore }));

function risorse(parti: Partial<Omit<Risorse, "poteri">> & { poteri?: Partial<Risorse["poteri"]> } = {}): Risorse {
  return {
    mano: parti.mano ?? [],
    diamanti: parti.diamanti ?? [],
    virtuali: parti.virtuali ?? [],
    poteri: { unoValeOtto: false, treJolly: false, diamanteMenoUno: false, ...parti.poteri },
  };
}

/** Usa le carte in mano indicate (per indice) con il loro valore. */
const carte = (r: Risorse, ...indici: number[]): Elemento[] =>
  indici.map((i) => ({ tipo: "numero", id: `n${i}`, valore: r.mano[i]!.valore }));

const codice = (id: string): Codice => personaggio(id).codice;
const ok = (r: Risorse, c: Codice, comb: Combinazione) => verificaCombinazione(r, c, comb).ok;

/* ------------------------------ tipi di codice ------------------------------ */

describe("codice esatto", () => {
  it("12 (Fenice) con 1 e 2, in qualsiasi ordine", () => {
    const r = risorse({ mano: mano(2, 1) });
    expect(ok(r, codice("fenice"), carte(r, 0, 1))).toBe(true);
    expect(ok(r, codice("fenice"), carte(r, 1, 0))).toBe(true);
  });

  it("12 non si fa con 1 e 3", () => {
    const r = risorse({ mano: mano(1, 3) });
    expect(ok(r, codice("fenice"), carte(r, 0, 1))).toBe(false);
  });

  it("non si possono aggiungere carte in più", () => {
    const r = risorse({ mano: mano(1, 2, 5) });
    expect(ok(r, codice("fenice"), carte(r, 0, 1, 2))).toBe(false);
  });

  it("8888 (Leone) con quattro 8, non con tre", () => {
    const r = risorse({ mano: mano(8, 8, 8, 8) });
    expect(ok(r, codice("leone"), carte(r, 0, 1, 2, 3))).toBe(true);
    expect(ok(r, codice("leone"), carte(r, 0, 1, 2))).toBe(false);
  });

  it("45678 (Cappuccetto Rosso) e codice da una carta: 4 (Bacchetta magica)", () => {
    const r = risorse({ mano: mano(8, 6, 4, 7, 5) });
    expect(ok(r, codice("cappuccetto-rosso"), carte(r, 0, 1, 2, 3, 4))).toBe(true);
    expect(ok(r, codice("bacchetta-magica"), carte(r, 2))).toBe(true);
    expect(ok(r, codice("bacchetta-magica"), carte(r, 4))).toBe(false);
  });
});

describe("coppia, tris, poker", () => {
  it("coppia: 2 carte uguali", () => {
    const r = risorse({ mano: mano(5, 5, 6) });
    expect(ok(r, codice("goblin"), carte(r, 0, 1))).toBe(true);
    expect(ok(r, codice("goblin"), carte(r, 0, 2))).toBe(false);
    expect(ok(r, codice("goblin"), carte(r, 0))).toBe(false);
  });

  it("tris: 3 carte uguali, non 4", () => {
    const r = risorse({ mano: mano(2, 2, 2, 2) });
    expect(ok(r, codice("cerbero"), carte(r, 0, 1, 2))).toBe(true);
    expect(ok(r, codice("cerbero"), carte(r, 0, 1, 2, 3))).toBe(false);
  });

  it("poker: 4 carte uguali", () => {
    const r = risorse({ mano: mano(7, 7, 7, 7, 6) });
    expect(ok(r, codice("quercia-umana"), carte(r, 0, 1, 2, 3))).toBe(true);
    expect(ok(r, codice("quercia-umana"), carte(r, 0, 1, 2, 4))).toBe(false);
  });
});

describe("doppia coppia (Fantasma)", () => {
  it("33 + 77", () => {
    const r = risorse({ mano: mano(3, 7, 3, 7) });
    expect(ok(r, codice("fantasma"), carte(r, 0, 1, 2, 3))).toBe(true);
  });

  it("5555 vale come doppia coppia", () => {
    const r = risorse({ mano: mano(5, 5, 5, 5) });
    expect(ok(r, codice("fantasma"), carte(r, 0, 1, 2, 3))).toBe(true);
  });

  it("3345 e 3335 non sono doppie coppie", () => {
    const r = risorse({ mano: mano(3, 3, 4, 5, 3) });
    expect(ok(r, codice("fantasma"), carte(r, 0, 1, 2, 3))).toBe(false);
    expect(ok(r, codice("fantasma"), carte(r, 0, 1, 4, 3))).toBe(false);
  });
});

describe("somma", () => {
  it("Medusa: 3 carte con somma 7", () => {
    const r = risorse({ mano: mano(1, 2, 4, 3, 4) });
    expect(ok(r, codice("strega"), carte(r, 0, 1, 2))).toBe(true);
    expect(ok(r, codice("strega"), carte(r, 3, 4))).toBe(false); // somma 7 ma 2 carte
    expect(ok(r, codice("strega"), carte(r, 0, 1, 3))).toBe(false); // somma 6
  });

  it("Ercole: 3 carte con somma 20", () => {
    const r = risorse({ mano: mano(8, 8, 4) });
    expect(ok(r, codice("ercole"), carte(r, 0, 1, 2))).toBe(true);
  });

  it("Scimmia: somma 10 con 2 carte, con 4, e anche con più di 5", () => {
    const r = risorse({ mano: mano(2, 8, 1, 2, 3, 4) });
    expect(ok(r, codice("scimmia"), carte(r, 0, 1))).toBe(true);
    expect(ok(r, codice("scimmia"), carte(r, 2, 3, 4, 5))).toBe(true);
    const sei = risorse({ mano: mano(1, 1, 2, 2, 2, 2) });
    expect(ok(sei, codice("scimmia"), carte(sei, 0, 1, 2, 3, 4, 5))).toBe(true);
  });

  it("Scimmia: somma 11 non va bene", () => {
    const r = risorse({ mano: mano(3, 8) });
    expect(ok(r, codice("scimmia"), carte(r, 0, 1))).toBe(false);
  });
});

describe("scale", () => {
  it("scala da 3 (Mago): 3-4-5 in qualsiasi ordine", () => {
    const r = risorse({ mano: mano(5, 3, 4) });
    expect(ok(r, codice("mago"), carte(r, 0, 1, 2))).toBe(true);
  });

  it("3-4-6 e 3-3-4 non sono scale", () => {
    const r = risorse({ mano: mano(3, 4, 6, 3) });
    expect(ok(r, codice("mago"), carte(r, 0, 1, 2))).toBe(false);
    expect(ok(r, codice("mago"), carte(r, 0, 3, 1))).toBe(false);
  });

  it("scala da 5 (Cappellaio matto): 2-3-4-5-6, non 4 carte", () => {
    const r = risorse({ mano: mano(6, 2, 4, 3, 5) });
    expect(ok(r, codice("cappellaio-matto"), carte(r, 0, 1, 2, 3, 4))).toBe(true);
    expect(ok(r, codice("cappellaio-matto"), carte(r, 1, 2, 3, 4))).toBe(false);
  });

  it("le scale non girano: 7-8-1 non vale", () => {
    const r = risorse({ mano: mano(7, 8, 1) });
    expect(ok(r, codice("mago"), carte(r, 0, 1, 2))).toBe(false);
  });
});

describe("pari / dispari", () => {
  it("Hobbit pari: 3 carte pari", () => {
    const r = risorse({ mano: mano(2, 8, 8, 5) });
    expect(ok(r, codice("hobbit-pari"), carte(r, 0, 1, 2))).toBe(true);
    expect(ok(r, codice("hobbit-pari"), carte(r, 0, 1, 3))).toBe(false);
    expect(ok(r, codice("hobbit-pari"), carte(r, 0, 1))).toBe(false);
  });

  it("Hobbit dispari: 3 carte dispari", () => {
    const r = risorse({ mano: mano(1, 7, 7, 2) });
    expect(ok(r, codice("hobbit-dispari"), carte(r, 0, 1, 2))).toBe(true);
    expect(ok(r, codice("hobbit-dispari"), carte(r, 0, 1, 3))).toBe(false);
  });
});

describe("codice combinato", () => {
  it("Gnomo: 66 + 33", () => {
    const r = risorse({ mano: mano(6, 3, 6, 3) });
    expect(ok(r, codice("gnomo"), carte(r, 0, 1, 2, 3))).toBe(true);
  });

  it("Gnomo: 6666 vale (la coppia può essere 66)", () => {
    const r = risorse({ mano: mano(6, 6, 6, 6) });
    expect(ok(r, codice("gnomo"), carte(r, 0, 1, 2, 3))).toBe(true);
  });

  it("Gnomo: 66 + 34 e 66 da solo non valgono", () => {
    const r = risorse({ mano: mano(6, 6, 3, 4) });
    expect(ok(r, codice("gnomo"), carte(r, 0, 1, 2, 3))).toBe(false);
    expect(ok(r, codice("gnomo"), carte(r, 0, 1))).toBe(false);
  });

  it("Capitan Uncino: 222 + un fulmine", () => {
    const r = risorse({ mano: mano(2, 2, 2), diamanti: diam("f") });
    expect(ok(r, codice("capitan-uncino"), [...carte(r, 0, 1, 2), { tipo: "diamante", id: "d0" }])).toBe(true);
  });

  it("Capitan Uncino: 222 + un diamante con valore qualsiasi", () => {
    const r = risorse({ mano: mano(2, 2, 2), diamanti: diam(7) });
    expect(ok(r, codice("capitan-uncino"), [...carte(r, 0, 1, 2), { tipo: "diamante", id: "d0" }])).toBe(true);
  });

  it("Capitan Uncino: il diamante qualsiasi conta come diamante, non col suo numero", () => {
    const r = risorse({ mano: mano(2, 2, 2), diamanti: diam(7) });
    expect(ok(r, codice("capitan-uncino"), [...carte(r, 0, 1, 2), { tipo: "diamante", id: "d0", valore: 7 }])).toBe(false);
  });

  it("Capitan Uncino: il diamante è obbligatorio (222 + una carta numero non vale)", () => {
    const r = risorse({ mano: mano(2, 2, 2, 5) });
    expect(ok(r, codice("capitan-uncino"), carte(r, 0, 1, 2, 3))).toBe(false);
    expect(ok(r, codice("capitan-uncino"), carte(r, 0, 1, 2))).toBe(false);
  });
});

describe("codice alternativo (Lucciole)", () => {
  it("444 oppure 555", () => {
    const r = risorse({ mano: mano(4, 4, 4, 5, 5, 5) });
    expect(ok(r, codice("lucciola-444-555"), carte(r, 0, 1, 2))).toBe(true);
    expect(ok(r, codice("lucciola-444-555"), carte(r, 3, 4, 5))).toBe(true);
    expect(ok(r, codice("lucciola-444-555"), carte(r, 0, 1, 3))).toBe(false);
  });
});

/* ------------------------------ diamanti ------------------------------ */

describe("diamanti con valore", () => {
  it("si usano nei codici come una carta numero", () => {
    const r = risorse({ mano: mano(8), diamanti: diam(8) });
    expect(ok(r, codice("hansel-e-gretel"), [...carte(r, 0), { tipo: "diamante", id: "d0", valore: 8 }])).toBe(true);
  });

  it("esempio del regolamento: con 7 e 8 in mano e un diamante si attiva 88", () => {
    const r = risorse({ mano: mano(7, 8), diamanti: diam(3) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8, modifica: { diamante: "d0", delta: 1 } },
      { tipo: "numero", id: "n1", valore: 8 },
    ];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
  });

  it("il +1 si può fare su un altro diamante con valore", () => {
    const r = risorse({ mano: mano(8), diamanti: diam(7, 1) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8 },
      { tipo: "diamante", id: "d0", valore: 8, modifica: { diamante: "d1", delta: 1 } },
    ];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
  });

  it("il valore resta tra 1 e 8: un 8 non diventa 9", () => {
    const r = risorse({ mano: mano(8), diamanti: diam(2) });
    const comb: Combinazione = [{ tipo: "numero", id: "n0", valore: 9, modifica: { diamante: "d0", delta: 1 } }];
    expect(verificaCombinazione(r, { tipo: "esatto", valori: [8] }, comb).ok).toBe(false);
  });

  it("il valore dichiarato deve essere davvero carta +1", () => {
    const r = risorse({ mano: mano(5), diamanti: diam(2) });
    const comb: Combinazione = [{ tipo: "numero", id: "n0", valore: 7, modifica: { diamante: "d0", delta: 1 } }];
    expect(ok(r, { tipo: "esatto", valori: [7] }, comb)).toBe(false);
  });

  it("senza Xena il −1 non è permesso", () => {
    const r = risorse({ mano: mano(8, 8), diamanti: diam(2) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 7, modifica: { diamante: "d0", delta: -1 } },
      { tipo: "numero", id: "n1", valore: 8 },
    ];
    expect(ok(r, codice("scheletro"), comb)).toBe(false);
  });

  it("con Xena un 8 può diventare 7", () => {
    const r = risorse({ mano: mano(8, 7, 7), diamanti: diam(2), poteri: { diamanteMenoUno: true } });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 7, modifica: { diamante: "d0", delta: -1 } },
      ...carte(r, 1, 2),
    ];
    expect(ok(r, codice("cerbero"), comb)).toBe(true);
  });

  it("con Xena un 1 non diventa 0", () => {
    const r = risorse({ mano: mano(1), diamanti: diam(2), poteri: { diamanteMenoUno: true } });
    const comb: Combinazione = [{ tipo: "numero", id: "n0", valore: 0, modifica: { diamante: "d0", delta: -1 } }];
    expect(ok(r, { tipo: "esatto", valori: [1] }, comb)).toBe(false);
  });

  it("massimo 1 diamante per carta: lo stesso diamante non modifica due carte", () => {
    const r = risorse({ mano: mano(7, 7), diamanti: diam(2) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8, modifica: { diamante: "d0", delta: 1 } },
      { tipo: "numero", id: "n1", valore: 8, modifica: { diamante: "d0", delta: 1 } },
    ];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(false);
  });

  it("un diamante non può essere sia carta del codice sia +1", () => {
    const r = risorse({ mano: mano(7), diamanti: diam(7) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8, modifica: { diamante: "d0", delta: 1 } },
      { tipo: "diamante", id: "d0", valore: 7 },
    ];
    expect(ok(r, { tipo: "esatto", valori: [7, 8] }, comb)).toBe(false);
  });

  it("il fulmine può fare +1 (come un diamante) ma non vale come numero", () => {
    const r = risorse({ mano: mano(7, 8), diamanti: diam("f") });
    const piuUno: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8, modifica: { diamante: "d0", delta: 1 } },
      { tipo: "numero", id: "n1", valore: 8 },
    ];
    expect(ok(r, codice("hansel-e-gretel"), piuUno)).toBe(true);
    const comeNumero: Combinazione = [...carte(r, 1), { tipo: "diamante", id: "d0", valore: 8 }];
    expect(ok(r, codice("hansel-e-gretel"), comeNumero)).toBe(false);
  });
});

/* ------------------------------ poteri ------------------------------ */

describe("Robin Hood: ogni 1 può valere 8", () => {
  const conRobin = (r: Partial<Omit<Risorse, "poteri">>) => risorse({ ...r, poteri: { unoValeOtto: true } });

  it("una carta 1 vale 8", () => {
    const r = conRobin({ mano: mano(1, 8) });
    const comb: Combinazione = [{ tipo: "numero", id: "n0", valore: 8 }, ...carte(r, 1)];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
    expect(ok(risorse({ mano: mano(1, 8) }), codice("hansel-e-gretel"), comb)).toBe(false);
  });

  it("anche un diamante 1 vale 8", () => {
    const r = conRobin({ mano: mano(8), diamanti: diam(1) });
    const comb: Combinazione = [...carte(r, 0), { tipo: "diamante", id: "d0", valore: 8 }];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
  });

  it("l'1 del Nano non può valere 8", () => {
    const r = conRobin({ mano: mano(8), virtuali: [{ fonte: "nano-1-1", valore: 1 }] });
    const comb: Combinazione = [...carte(r, 0), { tipo: "virtuale", fonte: "nano-1-1", valore: 8 }];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(false);
  });

  it("una sola modifica: 1→8 e poi −1 con Xena non è permesso", () => {
    const r = risorse({ mano: mano(1, 7), diamanti: diam(2), poteri: { unoValeOtto: true, diamanteMenoUno: true } });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 7, modifica: { diamante: "d0", delta: -1 } },
      ...carte(r, 1),
    ];
    expect(ok(r, { tipo: "esatto", valori: [7, 7] }, comb)).toBe(false);
  });
});

describe("Tremotino: ogni 3 può valere da 1 a 8", () => {
  const conFolletto = (r: Partial<Omit<Risorse, "poteri">>) => risorse({ ...r, poteri: { treJolly: true } });

  it("un 3 in mano vale qualsiasi numero", () => {
    const r = conFolletto({ mano: mano(3, 3, 3, 3, 8) });
    const comb: Combinazione = [1, 2, 3, 4].map((v, i) => ({ tipo: "numero", id: `n${i}`, valore: v }));
    expect(ok(r, codice("unicorno"), comb)).toBe(true);
  });

  it("vale anche per un diamante 3", () => {
    const r = conFolletto({ mano: mano(8), diamanti: diam(3) });
    const comb: Combinazione = [...carte(r, 0), { tipo: "diamante", id: "d0", valore: 8 }];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
  });

  it("senza Tremotino un 3 resta 3", () => {
    const r = risorse({ mano: mano(3, 8) });
    const comb: Combinazione = [{ tipo: "numero", id: "n0", valore: 8 }, ...carte(r, 1)];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(false);
  });

  it("una sola modifica: un 3 con diamante +1 vale solo 4", () => {
    const r = conFolletto({ mano: mano(3, 8), diamanti: diam(5) });
    const otto: Combinazione = [
      { tipo: "numero", id: "n0", valore: 8, modifica: { diamante: "d0", delta: 1 } },
      ...carte(r, 1),
    ];
    expect(ok(r, codice("hansel-e-gretel"), otto)).toBe(false);
    const quattro: Combinazione = [{ tipo: "numero", id: "n0", valore: 4, modifica: { diamante: "d0", delta: 1 } }];
    expect(ok(r, codice("bacchetta-magica"), quattro)).toBe(true);
  });
});

describe("carte virtuali (nani, fenice, drago)", () => {
  it("il Nano del 5 con un 5 in mano attiva 55", () => {
    const r = risorse({ mano: mano(5), virtuali: [{ fonte: "nano-5-1", valore: 5 }] });
    const comb: Combinazione = [...carte(r, 0), { tipo: "virtuale", fonte: "nano-5-1", valore: 5 }];
    expect(ok(r, codice("nano-5"), comb)).toBe(true);
  });

  it("la carta virtuale ha solo il suo valore", () => {
    const r = risorse({ mano: mano(6), virtuali: [{ fonte: "nano-5-1", valore: 5 }] });
    const comb: Combinazione = [...carte(r, 0), { tipo: "virtuale", fonte: "nano-5-1", valore: 6 }];
    expect(ok(r, codice("nano-6"), comb)).toBe(false);
  });

  it("la Fenice dà un 8", () => {
    const r = risorse({ mano: mano(8), virtuali: [{ fonte: "fenice-1", valore: 8 }] });
    const comb: Combinazione = [...carte(r, 0), { tipo: "virtuale", fonte: "fenice-1", valore: 8 }];
    expect(ok(r, codice("hansel-e-gretel"), comb)).toBe(true);
  });

  it("il Drago dà un valore a scelta", () => {
    const r = risorse({ mano: mano(7, 7, 7), virtuali: [{ fonte: "drago-1", valore: "aScelta" }] });
    const comb: Combinazione = [...carte(r, 0, 1, 2), { tipo: "virtuale", fonte: "drago-1", valore: 7 }];
    expect(ok(r, codice("regina"), comb)).toBe(true);
  });

  it("una carta virtuale si usa una sola volta (anche nello stesso codice)", () => {
    const r = risorse({ virtuali: [{ fonte: "nano-5-1", valore: 5 }] });
    const comb: Combinazione = [
      { tipo: "virtuale", fonte: "nano-5-1", valore: 5 },
      { tipo: "virtuale", fonte: "nano-5-1", valore: 5 },
    ];
    expect(ok(r, codice("nano-5"), comb)).toBe(false);
  });

  it("una carta virtuale non disponibile (già usata nel turno) non si può usare", () => {
    const r = risorse({ mano: mano(5) });
    const comb: Combinazione = [...carte(r, 0), { tipo: "virtuale", fonte: "nano-5-1", valore: 5 }];
    expect(ok(r, codice("nano-5"), comb)).toBe(false);
  });

  it("due nani diversi danno due carte", () => {
    const virtuali: CartaVirtuale[] = [
      { fonte: "nano-4-1", valore: 4 },
      { fonte: "nano-5-1", valore: 5 },
    ];
    const r = risorse({ mano: mano(6), virtuali });
    const comb: Combinazione = [
      { tipo: "virtuale", fonte: "nano-4-1", valore: 4 },
      { tipo: "virtuale", fonte: "nano-5-1", valore: 5 },
      ...carte(r, 0),
    ];
    expect(ok(r, codice("mago"), comb)).toBe(true);
  });
});

describe("controlli generali", () => {
  it("una combinazione vuota non vale", () => {
    expect(verificaCombinazione(risorse(), codice("goblin"), [])).toEqual({ ok: false, errore: "Nessuna carta indicata" });
  });

  it("non si possono usare carte che non si hanno", () => {
    const r = risorse({ mano: mano(5) });
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 5 },
      { tipo: "numero", id: "n9", valore: 5 },
    ];
    expect(ok(r, codice("goblin"), comb)).toBe(false);
    expect(ok(r, codice("goblin"), [{ tipo: "diamante", id: "d0", valore: 5 }, ...carte(r, 0)])).toBe(false);
  });

  it("la stessa carta non si usa due volte", () => {
    const r = risorse({ mano: mano(5) });
    expect(ok(r, codice("goblin"), carte(r, 0, 0))).toBe(false);
  });

  it("gli errori sono spiegati in italiano", () => {
    const r = risorse({ mano: mano(1, 3) });
    expect(verificaCombinazione(r, codice("fenice"), carte(r, 0, 1))).toEqual({
      ok: false,
      errore: "Le carte non soddisfano il codice",
    });
  });
});

/* ------------------------- ricerca delle combinazioni ------------------------- */

describe("ricerca delle combinazioni possibili", () => {
  it("trova l'88 con 7, 8 e un diamante", () => {
    const r = risorse({ mano: mano(7, 8), diamanti: diam(3) });
    const trovate = trovaCombinazioni(r, codice("hansel-e-gretel"));
    expect(trovate).toHaveLength(1);
    expect(ok(r, codice("hansel-e-gretel"), trovate[0]!)).toBe(true);
  });

  it("carte uguali non creano doppioni: tre 3 danno una sola coppia", () => {
    const r = risorse({ mano: mano(3, 3, 3) });
    expect(trovaCombinazioni(r, codice("goblin"))).toHaveLength(1);
  });

  it("nessuna combinazione se il codice è impossibile", () => {
    const r = risorse({ mano: mano(1, 2, 3) });
    expect(trovaCombinazioni(r, codice("leone"))).toEqual([]);
    expect(puoAttivare(r, codice("leone"))).toBe(false);
    expect(puoAttivare(r, codice("mago"))).toBe(true);
  });

  it("Capitan Uncino: trova sia il fulmine sia il diamante con valore come diamante qualsiasi", () => {
    const r = risorse({ mano: mano(2, 2, 2), diamanti: diam("f", 6) });
    const trovate = trovaCombinazioni(r, codice("capitan-uncino"));
    expect(trovate).toHaveLength(2);
  });

  it("Scimmia: trova somme con più di 5 carte", () => {
    const r = risorse({ mano: mano(1, 1, 2, 2, 2, 2) });
    const trovate = trovaCombinazioni(r, codice("scimmia"));
    expect(trovate.some((c) => c.length === 6)).toBe(true);
  });

  it("rispetta il limite di risultati richiesti", () => {
    const r = risorse({ mano: mano(1, 2, 3, 4, 5, 6, 7, 8) });
    expect(trovaCombinazioni(r, codice("scimmia"), 2)).toHaveLength(2);
  });

  it("prova automatica: su 300 situazioni casuali ogni combinazione trovata è valida", () => {
    const rng = creaCasuale(2026);
    const numeri = creaMazzoNumeri();
    const diamanti = creaMazzoDiamanti();
    const possibiliVirtuali: CartaVirtuale[] = [
      { fonte: "nano-1-1", valore: 1 },
      { fonte: "nano-5-1", valore: 5 },
      { fonte: "fenice-1", valore: 8 },
      { fonte: "drago-1", valore: "aScelta" },
    ];
    let trovateTotali = 0;
    for (let prova = 0; prova < 300; prova++) {
      const r: Risorse = {
        mano: mescola(rng, numeri).slice(0, interoTra(rng, 0, 7)),
        diamanti: mescola(rng, diamanti).slice(0, interoTra(rng, 0, 3)),
        virtuali: mescola(rng, possibiliVirtuali).slice(0, interoTra(rng, 0, 2)),
        poteri: {
          unoValeOtto: interoTra(rng, 0, 3) === 0,
          treJolly: interoTra(rng, 0, 3) === 0,
          diamanteMenoUno: interoTra(rng, 0, 3) === 0,
        },
      };
      for (const p of PERSONAGGI) {
        for (const comb of trovaCombinazioni(r, p.codice, 50)) {
          trovateTotali++;
          const esito = verificaCombinazione(r, p.codice, comb);
          expect(esito, `${p.nome}: ${JSON.stringify(comb)}`).toEqual({ ok: true });
        }
      }
    }
    expect(trovateTotali).toBeGreaterThan(1000);
  });

  it("è veloce anche con mano grande, molti diamanti e tutti i poteri", () => {
    const r = risorse({
      mano: mano(1, 2, 3, 3, 5, 6, 7, 8),
      diamanti: diam(1, 3, 4, 6, "f", 8),
      virtuali: [
        { fonte: "nano-2-1", valore: 2 },
        { fonte: "drago-1", valore: "aScelta" },
      ],
      poteri: { unoValeOtto: true, treJolly: true, diamanteMenoUno: true },
    });
    const inizio = Date.now();
    for (const p of PERSONAGGI) expect(puoAttivare(r, p.codice), p.nome).toBeTypeOf("boolean");
    expect(Date.now() - inizio).toBeLessThan(2000);
  });
});

describe("attivazione a tocchi: dalle carte scelte alla combinazione", () => {
  it("due 5 scelti formano la coppia del Goblin", () => {
    const r = risorse({ mano: mano(5, 5, 6) });
    const comb = combinazioneConCarte(r, codice("goblin"), ["n0", "n1"]);
    expect(comb).not.toBeNull();
    expect(ok(r, codice("goblin"), comb!)).toBe(true);
  });

  it("carte che non formano il codice, o una carta in più: nessuna combinazione", () => {
    const r = risorse({ mano: mano(5, 6, 5) });
    expect(combinazioneConCarte(r, codice("goblin"), ["n0", "n1"])).toBeNull();
    expect(combinazioneConCarte(r, codice("goblin"), ["n0", "n1", "n2"])).toBeNull();
    expect(combinazioneConCarte(r, codice("goblin"), [])).toBeNull();
    expect(combinazioneConCarte(r, codice("goblin"), ["n0", "inesistente"])).toBeNull();
  });

  it("7, 8 e un diamante: il diamante viene usato da solo come +1 per fare 88", () => {
    const r = risorse({ mano: mano(7, 8), diamanti: diam(3) });
    const comb = combinazioneConCarte(r, codice("hansel-e-gretel"), ["n0", "n1", "d0"]);
    expect(comb).not.toBeNull();
    expect(risorseUsate(comb!).sort()).toEqual(["d0", "n0", "n1"]);
    expect(ok(r, codice("hansel-e-gretel"), comb!)).toBe(true);
  });

  it("carta del nano e fulmine per Capitan Uncino", () => {
    const nano = risorse({ mano: mano(5), virtuali: [{ fonte: "nano-5-1", valore: 5 }] });
    expect(combinazioneConCarte(nano, codice("nano-5"), ["n0", "nano-5-1"])).not.toBeNull();
    const uncino = risorse({ mano: mano(2, 2, 2), diamanti: diam("f") });
    const comb = combinazioneConCarte(uncino, codice("capitan-uncino"), ["n0", "n1", "n2", "d0"]);
    expect(comb && ok(uncino, codice("capitan-uncino"), comb)).toBe(true);
  });

  it("con il Tremotino un 3 diventa il numero che serve", () => {
    const r = risorse({ mano: mano(3, 8), poteri: { treJolly: true } });
    expect(combinazioneConCarte(r, codice("hansel-e-gretel"), ["n0", "n1"])).not.toBeNull();
  });

  it("prova automatica: ogni combinazione trovata dal server si ritrova scegliendo le sue carte", () => {
    const rng = creaCasuale(77);
    for (let prova = 0; prova < 100; prova++) {
      const r: Risorse = {
        mano: mescola(rng, creaMazzoNumeri()).slice(0, interoTra(rng, 1, 7)),
        diamanti: mescola(rng, creaMazzoDiamanti()).slice(0, interoTra(rng, 0, 2)),
        virtuali: [],
        poteri: { unoValeOtto: false, treJolly: interoTra(rng, 0, 3) === 0, diamanteMenoUno: false },
      };
      for (const p of PERSONAGGI) {
        for (const comb of trovaCombinazioni(r, p.codice, 5)) {
          const trovata = combinazioneConCarte(r, p.codice, risorseUsate(comb));
          expect(trovata, p.nome).not.toBeNull();
          expect(ok(r, p.codice, trovata!)).toBe(true);
        }
      }
    }
  });
});

describe("attivazione a tocchi: diamanti aggiunti in automatico", () => {
  it("666 con 6, 5, 5: usa da solo due diamanti per fare +1", () => {
    const r = risorse({ mano: mano(6, 5, 5), diamanti: diam(2, 7, "f") });
    const esito = combinazioneConDiamanti(r, codice("lucciola-333-666"), ["n0", "n1", "n2"]);
    expect(esito?.aggiunti.sort()).toEqual(["d0", "d1"]);
    expect(ok(r, codice("lucciola-333-666"), esito!.combinazione)).toBe(true);
  });

  it("se le carte bastano non aggiunge nulla; se non c'è modo restituisce null", () => {
    const r = risorse({ mano: mano(6, 6, 6, 5), diamanti: diam(3) });
    expect(combinazioneConDiamanti(r, codice("lucciola-333-666"), ["n0", "n1", "n2"])?.aggiunti).toEqual([]);
    expect(combinazioneConDiamanti(r, codice("lucciola-333-666"), ["n3"])).toBeNull();
  });

  it("usa il minor numero di diamanti possibile", () => {
    const r = risorse({ mano: mano(8, 7), diamanti: diam(8, 4) });
    // 88: basta un diamante (+1 sul 7), non serve aggiungerne due
    expect(combinazioneConDiamanti(r, codice("hansel-e-gretel"), ["n0", "n1"])?.aggiunti).toHaveLength(1);
  });

  it("il fulmine fa +1 se serve", () => {
    const r = risorse({ mano: mano(8, 7), diamanti: diam("f") });
    expect(combinazioneConDiamanti(r, codice("hansel-e-gretel"), ["n0", "n1"])?.aggiunti).toEqual(["d0"]);
  });

  it("a parità usa un diamante con valore e tiene il fulmine", () => {
    const r = risorse({ mano: mano(8, 7), diamanti: diam("f", 2) });
    expect(combinazioneConDiamanti(r, codice("hansel-e-gretel"), ["n0", "n1"])?.aggiunti).toEqual(["d1"]);
  });

  it("con Xena il fulmine fa anche −1", () => {
    const r: Risorse = { ...risorse({ mano: mano(8, 8, 8, 2), diamanti: diam("f") }), poteri: { unoValeOtto: false, treJolly: false, diamanteMenoUno: true } };
    // un 8 con il fulmine −1 diventa 7: 8 8 8 → 7 8 8
    const comb: Combinazione = [
      { tipo: "numero", id: "n0", valore: 7, modifica: { diamante: "d0", delta: -1 } },
      { tipo: "numero", id: "n1", valore: 8 },
      { tipo: "numero", id: "n2", valore: 8 },
    ];
    expect(ok(r, { tipo: "esatto", valori: [7, 8, 8] }, comb)).toBe(true);
  });
});
