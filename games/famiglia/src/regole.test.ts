import { creaCasuale, interoTra } from "@og/engine";
import { describe, expect, it } from "vitest";
import { carta } from "./carte";
import { applicaMossa, mossaAutomatica, mosseValide, puntiDi, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import type { CartaMancia, CartaNumero, CopiaCarta, Valore } from "./tipi-carte";
import { vistaGiocatore, vistaPubblica } from "./vista";

/* ---------------- aiuti per scrivere i test in breve ---------------- */

const GIOCATORI = ["anna", "bruno", "carla"];

/**
 * Partita con un ordine fisso: anna, bruno, carla (anna di turno).
 * Senza campanelli e con gli scarti vuoti, così i test non dipendono dal caso
 * (i test sul campanello lo mettono apposta).
 */
function partita(n = 3): StatoPartita {
  const s = setup(GIOCATORI.slice(0, n), {}, 1);
  s.ordine = GIOCATORI.slice(0, n);
  s.turno.giocatore = "anna";
  for (const c of [...s.mazzi.numeri, ...s.tavolo.numeri]) delete c?.campanello;
  s.mazzi.personaggi.unshift(...s.scarti.personaggi);
  s.scarti.personaggi = [];
  return s;
}

const num = (valore: number, id = `x${valore}-${Math.random()}`): CartaNumero => ({ id, valore: valore as Valore });
const copia = (idCarta: string, n = 1): CopiaCarta => ({ id: `${idCarta}#${n}`, carta: idCarta });
const banconota = (valore: number, id = `mb${valore}`): CartaMancia => ({ id, tipo: "valore", valore: valore as Valore });
const caffe = (id = "caffe-x"): CartaMancia => ({ id, tipo: "caffe" });

/** Applica una mossa che deve riuscire. */
function fai(s: StatoPartita, chi: string, m: Mossa): StatoPartita {
  const r = applicaMossa(s, chi, m);
  if (!r.ok) throw new Error(r.errore);
  return r.stato;
}

/** Applica una mossa che deve essere rifiutata; restituisce il messaggio. */
function rifiutata(s: StatoPartita, chi: string, m: Mossa): string {
  const r = applicaMossa(s, chi, m);
  if (r.ok) throw new Error("La mossa doveva essere rifiutata");
  return r.errore;
}

/** Tutte le carte del gioco, ovunque siano: servono a controllare che non se ne perda nessuna. */
function contaCarte(s: StatoPartita) {
  const giocatori = Object.values(s.giocatori);
  return {
    numeri:
      s.mazzi.numeri.length + s.scarti.numeri.length + s.tavolo.numeri.filter(Boolean).length + giocatori.reduce((t, g) => t + g.mano.length, 0),
    personaggi:
      s.mazzi.personaggi.length +
      s.scarti.personaggi.length +
      s.tavolo.personaggi.filter(Boolean).length +
      giocatori.reduce((t, g) => t + g.nascosti.length + g.attacchi.length + g.attivati.length, 0),
    mancia: s.mazzi.mancia.length + s.scarti.mancia.length + giocatori.reduce((t, g) => t + g.mancia.length, 0),
  };
}

/* ---------------- preparazione ---------------- */

describe("preparazione", () => {
  it("da 2 a 5 giocatori", () => {
    expect(() => setup(["a"], {}, 1)).toThrow();
    expect(() => setup(["a", "b", "c", "d", "e", "f"], {}, 1)).toThrow();
    expect(() => setup(["a", "a"], {}, 1)).toThrow();
  });

  it("4 carte numero e 2 personaggi scoperti, tutti senza carte, 3 mosse", () => {
    const s = setup(GIOCATORI, {}, 7);
    expect(s.tavolo.numeri.filter(Boolean)).toHaveLength(4);
    expect(s.tavolo.personaggi.filter(Boolean)).toHaveLength(2);
    for (const g of Object.values(s.giocatori)) {
      expect(g.mano.length + g.nascosti.length + g.attacchi.length + g.attivati.length + g.mancia.length).toBe(0);
    }
    expect(s.turno.mosseRimaste).toBe(3);
    expect(contaCarte(s)).toEqual({ numeri: 56, personaggi: 94, mancia: 20 });
  });

  it("parametri di base: 20 punti, 7 carte in mano, 3 nascosti, 3 attacchi", () => {
    expect(setup(GIOCATORI, {}, 1).opzioni).toEqual({ puntiPerVincere: 20, limiteMano: 7, maxNascosti: 3, maxAttacchi: 3, mossePerTurno: 3 });
  });

  it("stesso seed, stessa partita", () => {
    expect(setup(GIOCATORI, {}, 42)).toEqual(setup(GIOCATORI, {}, 42));
  });
});

/* ---------------- mosse ---------------- */

describe("prendere, pescare, bruciare", () => {
  it("prendere una carta numero: va in mano e il tavolo si riempie", () => {
    const s = partita();
    const presa = s.tavolo.numeri[0]!;
    const dopo = fai(s, "anna", { tipo: "prendiNumero", posizione: 0 });
    expect(dopo.giocatori.anna!.mano).toContainEqual(presa);
    expect(dopo.tavolo.numeri.filter(Boolean)).toHaveLength(4);
    expect(dopo.turno.mosseRimaste).toBe(2);
  });

  it("un personaggio di attacco va scoperto tra gli attacchi, gli altri nascosti in mano", () => {
    let s = partita();
    s.tavolo.personaggi = [copia("toto-1"), copia("toto-2")]; // Si incanta (attacco), Brace accesa (aiuto)
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 0 });
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 1 });
    expect(s.giocatori.anna!.attacchi.map((c) => c.carta)).toEqual(["toto-1"]);
    expect(s.giocatori.anna!.nascosti.map((c) => c.carta)).toEqual(["toto-2"]);
  });

  it("le carte difesa vanno nascoste in mano, le carte attacco tra gli attacchi", () => {
    let s = partita();
    s.tavolo.personaggi = [copia("paesano"), copia("vento")];
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 0 });
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 1 });
    expect(s.giocatori.anna!.nascosti.map((c) => c.carta)).toEqual(["paesano"]);
    expect(s.giocatori.anna!.attacchi.map((c) => c.carta)).toEqual(["vento"]);
  });

  it("pescando un personaggio, gli altri sanno quale solo se è un attacco", () => {
    let s = partita();
    s.mazzi.personaggi.push(copia("antonio-1"), copia("antonio-2")); // pesca prima antonio-2 (attacco)
    s = fai(s, "anna", { tipo: "pescaPersonaggio" });
    s = fai(s, "anna", { tipo: "pescaPersonaggio" });
    const fatti = s.registro.filter((f) => f.tipo === "pescaPersonaggio");
    expect(fatti.map((f) => ("carta" in f ? f.carta : undefined))).toEqual(["antonio-2", undefined]);
  });

  it("pescare una carta numero", () => {
    const s = partita();
    const prima = s.mazzi.numeri.at(-1)!;
    expect(fai(s, "anna", { tipo: "pescaNumero" }).giocatori.anna!.mano).toEqual([prima]);
  });

  it("bruciare cambia le 4 carte numero scoperte; i personaggi restano", () => {
    const s = partita();
    const dopo = fai(s, "anna", { tipo: "brucia" });
    expect(dopo.scarti.numeri).toEqual(s.tavolo.numeri);
    expect(dopo.tavolo.personaggi).toEqual(s.tavolo.personaggi);
  });

  it("non si muove fuori turno, né oltre le mosse", () => {
    let s = partita();
    expect(rifiutata(s, "bruno", { tipo: "pescaNumero" })).toMatch(/turno/);
    s.turno.mosseRimaste = 0;
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/finito le mosse/);
  });

  it("le mosse con una forma sbagliata vengono rifiutate", () => {
    const s = partita();
    expect(rifiutata(s, "anna", { tipo: "prendiNumero", posizione: -1 })).toBe("Mossa non valida");
    expect(rifiutata(s, "anna", { tipo: "volaVia" } as unknown as Mossa)).toBe("Mossa non valida");
  });
});

describe("zone piene", () => {
  it("con 4 personaggi nascosti si scarta uno dei vecchi, non quello nuovo", () => {
    let s = partita();
    s.giocatori.anna!.nascosti = [copia("toto-2"), copia("toto-3"), copia("paesano")];
    s.tavolo.personaggi[0] = copia("generoso-1");
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 0 });
    expect(s.turno.attesa).toEqual({ tipo: "scartaCarta", giocatore: "anna", zona: "nascosti", nuova: "generoso-1#1" });
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/scelta in sospeso/);
    expect(rifiutata(s, "anna", { tipo: "scartaCarta", carta: "generoso-1#1" })).toMatch(/avevi già/);
    expect(mosseValide(s, "anna")).toHaveLength(3);
    s = fai(s, "anna", { tipo: "scartaCarta", carta: "paesano#1" });
    expect(s.giocatori.anna!.nascosti.map((c) => c.carta)).toEqual(["toto-2", "toto-3", "generoso-1"]);
    expect(s.scarti.personaggi.map((c) => c.carta)).toEqual(["paesano"]);
    expect(s.turno.attesa).toBeNull();
  });

  it("lo stesso con il 4° attacco in attesa (e lo scarto è pubblico)", () => {
    let s = partita();
    s.giocatori.anna!.attacchi = [copia("toto-1"), copia("antonio-2"), copia("vento")];
    s.tavolo.personaggi[0] = copia("greta");
    s = fai(s, "anna", { tipo: "prendiPersonaggio", posizione: 0 });
    expect(s.turno.attesa?.zona).toBe("attacchi");
    s = fai(s, "anna", { tipo: "scartaCarta", carta: "vento#1" });
    expect(s.registro.at(-1)).toMatchObject({ tipo: "scartaCarta", zona: "attacchi", carta: "vento" });
  });
});

describe("attivare", () => {
  it("un personaggio nascosto: le carte vanno negli scarti e il personaggio tra gli attivati, carico", () => {
    let s = partita();
    const g = s.giocatori.anna!;
    g.nascosti = [copia("generoso-1")]; // 2 carte con somma 4
    g.mano = [num(1, "a"), num(3, "b"), num(6, "c")];
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 1 },
        { tipo: "numero", id: "b", valore: 3 },
      ],
    });
    const a = s.giocatori.anna!;
    expect(a.nascosti).toEqual([]);
    expect(a.attivati).toEqual([{ copia: copia("generoso-1"), stanca: 0 }]);
    expect(a.mano.map((c) => c.id)).toEqual(["c"]);
    expect(s.scarti.numeri.map((c) => c.id)).toEqual(["a", "b"]);
    expect(puntiDi(a)).toBe(1);
    expect(s.turno.mosseRimaste).toBe(2);
  });

  it("un personaggio di attacco in attesa", () => {
    let s = partita();
    s.giocatori.anna!.attacchi = [copia("zio-salvatore-1")]; // 77
    s.giocatori.anna!.mano = [num(7, "a"), num(7, "b")];
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "zio-salvatore-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 7 },
        { tipo: "numero", id: "b", valore: 7 },
      ],
    });
    expect(s.giocatori.anna!.attacchi).toEqual([]);
    expect(s.giocatori.anna!.attivati[0]!.copia.carta).toBe("zio-salvatore-1");
  });

  it("le carte difesa e attacco non si attivano (si usano una volta, nel passo A4)", () => {
    const s = partita();
    s.giocatori.anna!.nascosti = [copia("paesano")];
    s.giocatori.anna!.attacchi = [copia("vento")];
    s.giocatori.anna!.mano = [num(5, "a")];
    const comb = [{ tipo: "numero" as const, id: "a", valore: 5 }];
    expect(rifiutata(s, "anna", { tipo: "attiva", carta: "paesano#1", combinazione: comb })).toMatch(/Non puoi attivare/);
    expect(rifiutata(s, "anna", { tipo: "attiva", carta: "vento#1", combinazione: comb })).toMatch(/Non puoi attivare/);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "attiva")).toBe(false);
  });

  it("serve il codice giusto, con carte proprie", () => {
    const s = partita();
    s.giocatori.anna!.nascosti = [copia("generoso-1")];
    s.giocatori.anna!.mano = [num(2, "a"), num(3, "b")];
    const err = rifiutata(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 2 },
        { tipo: "numero", id: "b", valore: 3 },
      ],
    });
    expect(err).toMatch(/non soddisfano/);
  });

  it("le mosse valide propongono le attivazioni possibili", () => {
    const s = partita();
    s.giocatori.anna!.nascosti = [copia("generoso-1")];
    s.giocatori.anna!.mano = [num(2, "a"), num(2, "b")];
    expect(mosseValide(s, "anna").filter((m) => m.tipo === "attiva")).toHaveLength(1);
  });
});

describe("mancia dei nonni e caffè", () => {
  it("una banconota vale come carta numero nel codice e poi va negli scarti mancia", () => {
    let s = partita();
    s.giocatori.anna!.nascosti = [copia("generoso-1")];
    s.giocatori.anna!.mano = [num(1, "a")];
    s.giocatori.anna!.mancia = [banconota(3, "m")];
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 1 },
        { tipo: "mancia", id: "m", valore: 3 },
      ],
    });
    expect(s.giocatori.anna!.mancia).toEqual([]);
    expect(s.scarti.mancia.map((x) => x.id)).toEqual(["m"]);
  });

  it("chi attiva un personaggio di livello 3 riceve 1 mancia; di livello 1 o 2 no", () => {
    let s = partita();
    s.giocatori.anna!.nascosti = [copia("nonno-salvatore-3"), copia("nonno-salvatore-2")]; // poker, tris
    s.giocatori.anna!.mano = [num(5, "a"), num(5, "b"), num(5, "c"), num(5, "d"), num(6, "e"), num(6, "f"), num(6, "g")];
    const prima = s.mazzi.mancia.at(-1)!;
    const usa = (...ids: string[]) => ids.map((id) => ({ tipo: "numero" as const, id, valore: id < "e" ? 5 : 6 }));
    s = fai(s, "anna", { tipo: "attiva", carta: "nonno-salvatore-3#1", combinazione: usa("a", "b", "c", "d") });
    expect(s.giocatori.anna!.mancia).toEqual([prima]);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "attiva", mancia: true });
    s = fai(s, "anna", { tipo: "attiva", carta: "nonno-salvatore-2#1", combinazione: usa("e", "f", "g") });
    expect(s.giocatori.anna!.mancia).toHaveLength(1);
  });

  it("un caffè fa +1 a una carta", () => {
    let s = partita();
    s.giocatori.anna!.nascosti = [copia("generoso-1")];
    s.giocatori.anna!.mano = [num(1, "a"), num(2, "b")];
    s.giocatori.anna!.mancia = [caffe("c")];
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 1 },
        { tipo: "numero", id: "b", valore: 3, modifica: { mancia: "c" } },
      ],
    });
    expect(s.giocatori.anna!.attivati).toHaveLength(1);
    expect(s.scarti.mancia.map((x) => x.id)).toEqual(["c"]);
  });

  it("bere un caffè dà una mossa in più, senza consumarne", () => {
    let s = partita();
    s.giocatori.anna!.mancia = [caffe("c")];
    s = fai(s, "anna", { tipo: "caffe", mancia: "c" });
    expect(s.turno.mosseRimaste).toBe(4);
    expect(s.giocatori.anna!.mancia).toEqual([]);
    expect(rifiutata(s, "anna", { tipo: "caffe", mancia: "c" })).toMatch(/caffè/);
  });

  it("la mancia è visibile a tutti e non conta nel limite della mano", () => {
    const s = partita();
    s.giocatori.anna!.mancia = [banconota(5)];
    s.giocatori.anna!.mano = Array.from({ length: 7 }, (_, i) => num(1, `a${i}`));
    s.turno.mosseRimaste = 0;
    expect(vistaGiocatore(s, "bruno").giocatori.anna!.mancia).toEqual([banconota(5)]);
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "fineTurno", scarta: [] });
  });
});

describe("campanello", () => {
  it("quando una carta con il campanello esce scoperta, i 2 personaggi del tavolo cambiano", () => {
    let s = partita();
    const prima = [...s.tavolo.personaggi];
    s.mazzi.numeri.push({ id: "n4-1", valore: 4, campanello: true });
    s = fai(s, "anna", { tipo: "prendiNumero", posizione: 0 });
    expect(s.scarti.personaggi).toEqual(prima);
    expect(s.tavolo.personaggi.filter(Boolean)).toHaveLength(2);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "campanello", valore: 4 });
  });

  it("pescata coperta dal mazzo non succede niente", () => {
    let s = partita();
    const prima = [...s.tavolo.personaggi];
    s.mazzi.numeri.push({ id: "n4-1", valore: 4, campanello: true });
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(s.tavolo.personaggi).toEqual(prima);
  });
});

describe("fine turno", () => {
  it("non si chiude prima di aver fatto tutte le mosse", () => {
    const s = partita();
    expect(rifiutata(s, "anna", { tipo: "fineTurno", scarta: [] })).toMatch(/tutte le mosse/);
  });

  it("a fine turno si scarta fino a 7 carte numero", () => {
    let s = partita();
    s.giocatori.anna!.mano = Array.from({ length: 9 }, (_, i) => num(1, `a${i}`));
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toBeNull();
    expect(rifiutata(s, "anna", { tipo: "fineTurno", scarta: ["a0"] })).toMatch(/esattamente 2/);
    s = fai(s, "anna", { tipo: "fineTurno", scarta: ["a0", "a1"] });
    expect(s.giocatori.anna!.mano).toHaveLength(7);
    expect(s.turno.giocatore).toBe("bruno");
  });

  it("finite le mosse il turno si chiude da solo, tranne se c'è un caffè da bere", () => {
    const s = partita();
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toEqual({ giocatore: "anna", mossa: { tipo: "fineTurno", scarta: [] } });
    s.giocatori.anna!.mancia = [caffe()];
    expect(mossaAutomatica(s)).toBeNull();
  });

  it("a inizio del proprio turno ogni carta stanca recupera una tacca", () => {
    let s = partita();
    s.giocatori.bruno!.attivati = [
      { copia: copia("toto-3"), stanca: 3 },
      { copia: copia("toto-1"), stanca: 1 },
      { copia: copia("toto-2"), stanca: 0 },
    ];
    s.giocatori.anna!.attivati = [{ copia: copia("generoso-3"), stanca: 2 }];
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.giocatori.bruno!.attivati.map((a) => a.stanca)).toEqual([2, 0, 0]);
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(2); // non è il suo turno
  });
});

describe("fine partita a punti", () => {
  it("chi arriva a 20 punti fa scattare l'ultimo giro, poi vince chi ha più punti", () => {
    let s = partita();
    // anna ha 18 punti (6 carte di livello 3) e attiva Generoso livello 3... qui basta un livello 2: 20 punti
    s.giocatori.anna!.attivati = ["antonio-3", "maddalena-3", "chicca-3", "toto-3", "checca-3", "roberta-3"].map((id) => ({
      copia: copia(id),
      stanca: 0,
    }));
    s.giocatori.anna!.nascosti = [copia("alessia")]; // 3 carte pari, 2 punti
    s.giocatori.anna!.mano = [num(2, "a"), num(4, "b"), num(6, "c")];
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "alessia#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 2 },
        { tipo: "numero", id: "b", valore: 4 },
        { tipo: "numero", id: "c", valore: 6 },
      ],
    });
    expect(puntiDi(s.giocatori.anna!)).toBe(20);
    expect(s.ultimoTurno).toBe(5); // finisce questo giro (turni 0-2) e se ne gioca un altro (3-5)
    for (let i = 0; i < 6; i++) {
      s.turno.mosseRimaste = 0;
      s.giocatori[s.turno.giocatore]!.mano = [];
      s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
    }
    expect(s.finita).toBe(true);
  });
});

describe("cosa vede ogni giocatore", () => {
  it("degli altri si vede quante carte hanno, non quali; gli attacchi e gli attivati sì", () => {
    const s = partita();
    s.giocatori.anna!.mano = [num(3, "a")];
    s.giocatori.anna!.nascosti = [copia("paesano")];
    s.giocatori.anna!.attacchi = [copia("vento")];
    const v = vistaGiocatore(s, "bruno");
    expect(v.mano).toEqual([]);
    expect(v.nascosti).toEqual([]);
    expect(v.giocatori.anna).toMatchObject({ carteInMano: 1, nascosti: 1, attacchi: [copia("vento")] });
    expect(JSON.stringify(v)).not.toContain("paesano");
    expect(JSON.stringify(v)).not.toContain('"rng"');
    expect(vistaGiocatore(s, "anna").nascosti).toEqual([copia("paesano")]);
  });

  it("la vista pubblica non mostra mani né nascosti", () => {
    const s = partita();
    s.giocatori.anna!.nascosti = [copia("paesano")];
    expect(JSON.stringify(vistaPubblica(s))).not.toContain("paesano");
  });
});

describe("partite casuali (prova automatica)", () => {
  it("40 partite con mosse valide scelte a caso: nessun errore e nessuna carta persa", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = creaCasuale(seed);
      let s = setup(GIOCATORI.slice(0, 2 + (seed % 4 === 0 ? 1 : 0)), {}, seed);
      const iniziali = contaCarte(s);
      for (let passo = 0; passo < 3000 && !s.finita; passo++) {
        const auto = mossaAutomatica(s);
        const chi = auto?.giocatore ?? s.turno.attesa?.giocatore ?? s.turno.giocatore;
        const mosse = auto ? [auto.mossa] : mosseValide(s, chi);
        expect(mosse.length, `seed ${seed}, passo ${passo}`).toBeGreaterThan(0);
        // Si preferisce attivare quando si può, così le partite arrivano alla fine
        const attivazioni = mosse.filter((m) => m.tipo === "attiva");
        const scelte = attivazioni.length > 0 ? attivazioni : mosse;
        s = fai(s, chi, scelte[interoTra(rng, 0, scelte.length - 1)]!);
        expect(contaCarte(s)).toEqual(iniziali);
      }
      expect(s.finita, `seed ${seed}`).toBe(true);
    }
  });
});

describe("dati usati dalle regole", () => {
  it("le carte di livello 3 valgono 3 punti", () => {
    expect(carta("roberta-3").punti).toBe(3);
  });
});
