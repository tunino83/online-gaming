import { creaCasuale, interoTra } from "@og/engine";
import { describe, expect, it } from "vitest";
import type { Combinazione } from "./codici";
import { giocoUfficio as primoGioco } from "./gioco";
import { applicaMossa, finePartita, mosseValide, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import type { CartaDiamante, CartaNumero, CartaPersonaggio, Valore } from "./tipi-carte";
import { vistaGiocatore, vistaPubblica } from "./vista";

/* ------------------------------ aiuti ------------------------------ */

let contatore = 0;
const num = (valore: number): CartaNumero => ({ id: `x-n${valore}-${++contatore}`, valore: valore as Valore });
const dia = (valore: number): CartaDiamante => ({ id: `x-d${valore}-${++contatore}`, tipo: "valore", valore: valore as Valore });
const fulmine = (): CartaDiamante => ({ id: `x-f-${++contatore}`, tipo: "fulmine" });
const pers = (personaggio: string): CartaPersonaggio => ({ id: `x-${personaggio}-${++contatore}`, personaggio });

/** Toglie le frecce a tutte le carte numero (per provare le altre regole senza cambi di personaggi a sorpresa). */
function senzaFrecce(s: StatoPartita): void {
  const tutte = [...s.mazzi.numeri, ...s.scarti.numeri, ...s.tavolo.numeri, ...Object.values(s.giocatori).flatMap((g) => g.mano)];
  for (const c of tutte) if (c) delete c.frecce;
}

/** Partita con ordine fisso (A inizia) e 3 mosse per A; carte con le frecce disattivate. */
function partita(giocatori = ["A", "B"], seed = 1): StatoPartita {
  const s = setup(giocatori, {}, seed);
  senzaFrecce(s);
  s.ordine = [...giocatori];
  s.turno = { giocatore: giocatori[0]!, mosseRimaste: 3, virtualiUsate: [], bruciaGratisUsata: false, iniziato: false, attesa: null };
  return s;
}

function gioca(s: StatoPartita, chi: string, m: Mossa): StatoPartita {
  const r = applicaMossa(s, chi, m);
  if (!r.ok) throw new Error(`Mossa rifiutata: ${r.errore}`);
  return r.stato;
}

function errore(s: StatoPartita, chi: string, m: Mossa): string {
  const r = applicaMossa(s, chi, m);
  if (r.ok) throw new Error("La mossa doveva essere rifiutata");
  return r.errore;
}

const usa = (...carte: CartaNumero[]): Combinazione => carte.map((c) => ({ tipo: "numero", id: c.id, valore: c.valore }));
const fine = (scarta: string[] = []): Mossa => ({ tipo: "fineTurno", scarta, cambiaMano: false });

/** Fa finire le mosse ad A pescando, poi chiude il turno scartando l'eccesso. */
function passaTurno(s: StatoPartita): StatoPartita {
  const chi = s.turno.giocatore;
  while (s.turno.mosseRimaste > 0) s = gioca(s, chi, { tipo: "pescaNumero" });
  const g = s.giocatori[chi]!;
  const eccesso = Math.max(0, g.mano.length - 5 - g.attivati.filter((c) => c.personaggio === "scimmia").length);
  return gioca(s, chi, fine(g.mano.slice(0, eccesso).map((c) => c.id)));
}

/* ------------------------------ preparazione ------------------------------ */

describe("preparazione", () => {
  it("si gioca da 2 a 5 giocatori", () => {
    expect(() => setup(["A"], {}, 1)).toThrow();
    expect(() => setup(["A", "B", "C", "D", "E", "F"], {}, 1)).toThrow();
    for (let n = 2; n <= 5; n++) expect(() => setup(["A", "B", "C", "D", "E"].slice(0, n), {}, 1)).not.toThrow();
  });

  it("4 carte numero e 2 personaggi scoperti, tutti a mani vuote", () => {
    const s = setup(["A", "B", "C"], {}, 7);
    expect(s.tavolo.numeri.filter(Boolean)).toHaveLength(4);
    expect(s.tavolo.personaggi.filter(Boolean)).toHaveLength(2);
    expect(s.mazzi.numeri).toHaveLength(52);
    // 55 personaggi: 2 sul tavolo, gli altri nel mazzo (o negli scarti se è uscita una carta con le frecce)
    expect(s.mazzi.personaggi.length + s.scarti.personaggi.length).toBe(53);
    expect(s.mazzi.diamanti).toHaveLength(20);
    for (const g of Object.values(s.giocatori)) {
      expect(g).toMatchObject({ mano: [], diamanti: [], posti: [], attivati: [], punti: 0 });
    }
  });

  it("l'ordine è sorteggiato e il primo ha 3 mosse", () => {
    const s = setup(["A", "B", "C", "D"], {}, 3);
    expect([...s.ordine].sort()).toEqual(["A", "B", "C", "D"]);
    expect(s.turno).toMatchObject({ giocatore: s.ordine[0], mosseRimaste: 3 });
  });

  it("stesso seed = stessa partita; seed diverso = partita diversa", () => {
    expect(setup(["A", "B"], {}, 42)).toEqual(setup(["A", "B"], {}, 42));
    expect(setup(["A", "B"], {}, 42).mazzi).not.toEqual(setup(["A", "B"], {}, 43).mazzi);
  });

  it("le opzioni sovrascrivono i default", () => {
    expect(setup(["A", "B"], { puntiPerVincere: 10 }, 1).opzioni.puntiPerVincere).toBe(10);
  });

  it("lo stato è serializzabile in JSON", () => {
    const s = setup(["A", "B"], {}, 1);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});

/* ------------------------------ mosse base ------------------------------ */

describe("mosse base", () => {
  it("prendere un numero dal tavolo: va in mano e il posto si riempie dal mazzo", () => {
    const s = partita();
    const presa = s.tavolo.numeri[2]!;
    const prossima = s.mazzi.numeri.at(-1)!;
    const dopo = gioca(s, "A", { tipo: "prendiNumero", posizione: 2 });
    expect(dopo.giocatori.A!.mano).toEqual([presa]);
    expect(dopo.tavolo.numeri[2]).toEqual(prossima);
    expect(dopo.turno.mosseRimaste).toBe(2);
  });

  it("prendere un personaggio dal tavolo: va nei posti e il posto si riempie", () => {
    const s = partita();
    const preso = s.tavolo.personaggi[0]!;
    const dopo = gioca(s, "A", { tipo: "prendiPersonaggio", posizione: 0 });
    expect(dopo.giocatori.A!.posti).toEqual([preso]);
    expect(dopo.tavolo.personaggi[0]).toEqual(s.mazzi.personaggi.at(-1));
  });

  it("pescare: si prende la prima carta coperta del mazzo", () => {
    const s = partita();
    let dopo = gioca(s, "A", { tipo: "pescaNumero" });
    expect(dopo.giocatori.A!.mano).toEqual([s.mazzi.numeri.at(-1)]);
    dopo = gioca(dopo, "A", { tipo: "pescaPersonaggio" });
    expect(dopo.giocatori.A!.posti).toEqual([s.mazzi.personaggi.at(-1)]);
  });

  it("bruciare: le 4 carte numero scoperte vanno negli scarti e se ne scoprono 4 nuove; i personaggi restano", () => {
    const s = partita();
    const dopo = gioca(s, "A", { tipo: "brucia" });
    expect(dopo.scarti.numeri).toEqual(s.tavolo.numeri);
    expect(dopo.tavolo.numeri.filter(Boolean)).toHaveLength(4);
    expect(dopo.tavolo.numeri).not.toEqual(s.tavolo.numeri);
    expect(dopo.tavolo.personaggi).toEqual(s.tavolo.personaggi);
    expect(dopo.turno.mosseRimaste).toBe(2);
  });

  it("3 mosse per turno, anche ripetendo la stessa; la quarta è rifiutata", () => {
    let s = partita();
    for (let i = 0; i < 3; i++) s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(errore(s, "A", { tipo: "pescaNumero" })).toBe("Hai finito le mosse");
  });

  it("non si gioca fuori turno", () => {
    expect(errore(partita(), "B", { tipo: "pescaNumero" })).toBe("Non è il tuo turno");
    expect(errore(partita(), "Z", { tipo: "pescaNumero" })).toBe("Giocatore non in partita");
  });

  it("non si chiude il turno prima di aver fatto tutte le mosse", () => {
    const s = gioca(partita(), "A", { tipo: "pescaNumero" });
    expect(errore(s, "A", fine())).toBe("Devi ancora fare tutte le mosse");
  });

  it("a fine turno tocca al giocatore successivo, con 3 mosse", () => {
    const s = passaTurno(partita());
    expect(s.turno).toMatchObject({ giocatore: "B", mosseRimaste: 3 });
    expect(s.numeroTurno).toBe(1);
    expect(passaTurno(s).turno.giocatore).toBe("A");
  });

  it("applicaMossa non modifica lo stato ricevuto", () => {
    const s = partita();
    const copia = structuredClone(s);
    gioca(s, "A", { tipo: "pescaNumero" });
    expect(s).toEqual(copia);
  });
});

/* ------------------------------ limiti ------------------------------ */

describe("limite della mano", () => {
  it("si può pescare oltre il limite; a fine turno si scarta esattamente l'eccesso, scelto dal giocatore", () => {
    let s = partita();
    s.giocatori.A!.mano = [num(1), num(2), num(3), num(4), num(5)];
    for (let i = 0; i < 3; i++) s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(s.giocatori.A!.mano).toHaveLength(8);
    expect(errore(s, "A", fine())).toBe("Devi scartare esattamente 3 carte");
    const scelte = s.giocatori.A!.mano.slice(0, 3).map((c) => c.id);
    const dopo = gioca(s, "A", fine(scelte));
    expect(dopo.giocatori.A!.mano).toHaveLength(5);
    expect(dopo.giocatori.A!.mano.map((c) => c.id)).not.toContain(scelte[0]);
    expect(dopo.scarti.numeri.map((c) => c.id)).toEqual(expect.arrayContaining(scelte));
  });

  it("non si possono scartare carte che non si hanno, né due volte la stessa", () => {
    let s = partita();
    s.giocatori.A!.mano = [num(1), num(2), num(3), num(4), num(5), num(6)];
    s.turno.mosseRimaste = 0;
    expect(errore(s, "A", fine(["inesistente"]))).toBe("Puoi scartare solo carte che hai in mano");
    s.giocatori.A!.mano.push(num(7));
    const id = s.giocatori.A!.mano[0]!.id;
    expect(errore(s, "A", fine([id, id]))).toBe("Carta da scartare ripetuta");
  });

  it("i diamanti non contano nel limite", () => {
    const s = partita();
    s.giocatori.A!.mano = [num(1), num(2), num(3), num(4), num(5)];
    s.giocatori.A!.diamanti = [dia(1), dia(2), dia(3)];
    s.turno.mosseRimaste = 0;
    expect(gioca(s, "A", fine()).turno.giocatore).toBe("B");
  });

  it("ogni Scimmia attivata alza il limite di 1 (si sommano)", () => {
    const s = partita();
    s.giocatori.A!.attivati = [pers("scimmia"), pers("scimmia")];
    s.giocatori.A!.mano = Array.from({ length: 7 }, () => num(1));
    s.turno.mosseRimaste = 0;
    expect(gioca(s, "A", fine()).turno.giocatore).toBe("B");
    s.giocatori.A!.mano.push(num(2));
    expect(errore(s, "A", fine())).toBe("Devi scartare esattamente 1 carte");
  });
});

describe("posti personaggio", () => {
  it("con un terzo personaggio bisogna scartarne uno dei vecchi prima di continuare", () => {
    let s = partita();
    const vecchi = [pers("goblin"), pers("leone")];
    s.giocatori.A!.posti = [...vecchi];
    s = gioca(s, "A", { tipo: "pescaPersonaggio" });
    const nuovo = s.giocatori.A!.posti[2]!;
    expect(s.turno.attesa).toEqual({ tipo: "scartaPersonaggio", nuovo: nuovo.id });
    expect(errore(s, "A", { tipo: "pescaNumero" })).toBe("Prima devi completare la scelta in sospeso");
    expect(errore(s, "A", { tipo: "scartaPersonaggio", carta: nuovo.id })).toBe(
      "Devi scartare uno dei personaggi che avevi già",
    );
    expect(mosseValide(s, "A")).toEqual(vecchi.map((c) => ({ tipo: "scartaPersonaggio", carta: c.id })));
    s = gioca(s, "A", { tipo: "scartaPersonaggio", carta: vecchi[0]!.id });
    expect(s.giocatori.A!.posti).toEqual([vecchi[1], nuovo]);
    expect(s.scarti.personaggi).toEqual([vecchi[0]]);
    expect(s.turno.attesa).toBeNull();
    expect(s.turno.mosseRimaste).toBe(2); // lo scarto non costa mosse
  });
});

describe("mazzi che finiscono", () => {
  it("quando un mazzo finisce, i suoi scarti si rimescolano", () => {
    const s = partita();
    s.scarti.numeri = [...s.mazzi.numeri];
    s.mazzi.numeri = [];
    const dopo = gioca(s, "A", { tipo: "pescaNumero" });
    expect(dopo.giocatori.A!.mano).toHaveLength(1);
    expect(dopo.scarti.numeri).toEqual([]);
    expect(dopo.mazzi.numeri).toHaveLength(51);
  });

  it("se mazzo e scarti sono vuoti non si pesca, e il posto sul tavolo resta vuoto", () => {
    let s = partita();
    s.mazzi.personaggi = [];
    s.scarti.personaggi = [];
    expect(errore(s, "A", { tipo: "pescaPersonaggio" })).toBe("Il mazzo personaggi è vuoto");
    expect(mosseValide(s, "A")).not.toContainEqual({ tipo: "pescaPersonaggio" });
    s = gioca(s, "A", { tipo: "prendiPersonaggio", posizione: 0 });
    expect(s.tavolo.personaggi[0]).toBeNull();
  });

  it("il posto vuoto si riempie appena tornano carte negli scarti", () => {
    let s = partita();
    s.mazzi.personaggi = [];
    s.scarti.personaggi = [];
    s.giocatori.A!.posti = [pers("goblin"), pers("leone")];
    s = gioca(s, "A", { tipo: "prendiPersonaggio", posizione: 0 });
    expect(s.tavolo.personaggi[0]).toBeNull();
    s = gioca(s, "A", { tipo: "scartaPersonaggio", carta: s.giocatori.A!.posti[0]!.id });
    expect(s.tavolo.personaggi[0]?.personaggio).toBe("goblin");
  });
});

/* ------------------------------ fulmini e attivazione ------------------------------ */

describe("fulmine", () => {
  it("dà una mossa in più, anche a mosse finite, e poi si scarta", () => {
    let s = partita();
    const f = fulmine();
    s.giocatori.A!.diamanti = [f];
    s.turno.mosseRimaste = 0;
    s = gioca(s, "A", { tipo: "giocaFulmine", diamante: f.id });
    expect(s.turno.mosseRimaste).toBe(1);
    expect(s.giocatori.A!.diamanti).toEqual([]);
    expect(s.scarti.diamanti).toEqual([f]);
  });

  it("un diamante con valore non è un fulmine", () => {
    const s = partita();
    const d = dia(3);
    s.giocatori.A!.diamanti = [d];
    expect(errore(s, "A", { tipo: "giocaFulmine", diamante: d.id })).toBe("Non hai quel fulmine");
  });
});

describe("attivare un personaggio", () => {
  it("le carte del codice vanno negli scarti, il personaggio negli attivati con i suoi punti", () => {
    let s = partita();
    const [a, b, c] = [num(8), num(8), num(3)];
    const hansel = pers("hansel-e-gretel");
    s.giocatori.A!.mano = [a, b, c];
    s.giocatori.A!.posti = [hansel];
    s = gioca(s, "A", { tipo: "attiva", carta: hansel.id, combinazione: usa(a, b) });
    expect(s.giocatori.A!).toMatchObject({ mano: [c], posti: [], attivati: [hansel], punti: 2 });
    expect(s.scarti.numeri).toEqual([a, b]);
    expect(s.turno.mosseRimaste).toBe(2);
  });

  it("con un codice sbagliato è rifiutata e non cambia nulla", () => {
    const s = partita();
    const [a, b] = [num(8), num(7)];
    const hansel = pers("hansel-e-gretel");
    s.giocatori.A!.mano = [a, b];
    s.giocatori.A!.posti = [hansel];
    expect(errore(s, "A", { tipo: "attiva", carta: hansel.id, combinazione: usa(a, b) })).toBe(
      "Le carte non soddisfano il codice",
    );
  });

  it("si attivano solo personaggi nei propri posti", () => {
    const s = partita();
    const a = num(4);
    s.giocatori.A!.mano = [a];
    const bacchetta = pers("bacchetta-magica");
    s.giocatori.B!.posti = [bacchetta];
    expect(errore(s, "A", { tipo: "attiva", carta: bacchetta.id, combinazione: usa(a) })).toBe(
      "Non puoi attivare questo personaggio",
    );
  });

  it("il diamante usato per il +1 va negli scarti", () => {
    let s = partita();
    const [sette, otto, d] = [num(7), num(8), dia(2)];
    const hansel = pers("hansel-e-gretel");
    s.giocatori.A!.mano = [sette, otto];
    s.giocatori.A!.diamanti = [d];
    s.giocatori.A!.posti = [hansel];
    s = gioca(s, "A", {
      tipo: "attiva",
      carta: hansel.id,
      combinazione: [
        { tipo: "numero", id: sette.id, valore: 8, modifica: { diamante: d.id, delta: 1 } },
        { tipo: "numero", id: otto.id, valore: 8 },
      ],
    });
    expect(s.giocatori.A!.diamanti).toEqual([]);
    expect(s.scarti.diamanti).toEqual([d]);
  });

  it("la carta virtuale di un nano si usa una volta per turno e torna al turno dopo", () => {
    let s = partita();
    const nano = pers("nano-4");
    s.giocatori.A!.attivati = [nano];
    const b1 = pers("bacchetta-magica");
    const b2 = pers("bacchetta-magica");
    s.giocatori.A!.posti = [b1, b2];
    const virtuale: Combinazione = [{ tipo: "virtuale", fonte: nano.id, valore: 4 }];
    s = gioca(s, "A", { tipo: "attiva", carta: b1.id, combinazione: virtuale });
    expect(errore(s, "A", { tipo: "attiva", carta: b2.id, combinazione: virtuale })).toMatch(/non disponibile/);
    s = passaTurno(passaTurno(s));
    expect(gioca(s, "A", { tipo: "attiva", carta: b2.id, combinazione: virtuale }).giocatori.A!.attivati).toHaveLength(3);
  });

  it("Capitan Uncino pagato con un fulmine: il fulmine si consuma e non dà mosse", () => {
    let s = partita();
    const due = [num(2), num(2), num(2)];
    const f = fulmine();
    const uncino = pers("capitan-uncino");
    s.giocatori.A!.mano = due;
    s.giocatori.A!.diamanti = [f];
    s.giocatori.A!.posti = [uncino];
    s = gioca(s, "A", { tipo: "attiva", carta: uncino.id, combinazione: [...usa(...due), { tipo: "diamante", id: f.id }] });
    expect(s.turno.mosseRimaste).toBe(2);
    expect(s.giocatori.A!.diamanti).toEqual([]);
    expect(s.giocatori.A!.punti).toBe(3);
  });
});

/* ------------------------------ poteri rossi ------------------------------ */

/** A ha in posti il personaggio indicato e in mano le carte; restituisce lo stato e la carta. */
function conPersonaggio(id: string, mano: CartaNumero[], giocatori?: string[]) {
  const s = partita(giocatori);
  const carta = pers(id);
  s.giocatori.A!.mano = mano;
  s.giocatori.A!.posti = [carta];
  return { s, carta };
}

describe("poteri rossi", () => {
  it("Unicorno: ricevi 2 diamanti", () => {
    const mano = [num(1), num(2), num(3), num(4)];
    const { s, carta } = conPersonaggio("unicorno", mano);
    const dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) });
    expect(dopo.giocatori.A!.diamanti).toHaveLength(2);
    expect(dopo.mazzi.diamanti).toHaveLength(18);
  });

  it("Gnomo, Pinco, Hobbit: ricevi 1 diamante", () => {
    const mano = [num(6), num(6), num(3), num(3)];
    const { s, carta } = conPersonaggio("gnomo", mano);
    expect(gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) }).giocatori.A!.diamanti).toHaveLength(1);
  });

  it("Golem: 3 mosse in più in questo turno", () => {
    const mano = [num(2), num(4), num(6), num(8)];
    const { s, carta } = conPersonaggio("golem-pari", mano);
    expect(gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) }).turno.mosseRimaste).toBe(5);
  });

  it("Fantasma: il giocatore successivo ha una mossa in più nel suo prossimo turno (una volta)", () => {
    const mano = [num(3), num(3), num(5), num(5)];
    const { s, carta } = conPersonaggio("fantasma", mano, ["A", "B", "C"]);
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) });
    dopo = passaTurno(dopo);
    expect(dopo.turno).toMatchObject({ giocatore: "B", mosseRimaste: 4 });
    dopo = passaTurno(passaTurno(passaTurno(dopo)));
    expect(dopo.turno).toMatchObject({ giocatore: "B", mosseRimaste: 3 });
  });

  it("Medusa: scarta un personaggio dai posti di un avversario", () => {
    const mano = [num(1), num(2), num(4)];
    const { s, carta } = conPersonaggio("strega", mano);
    const vittima = pers("leone");
    s.giocatori.B!.posti = [vittima];
    expect(errore(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) })).toBe(
      "Scegli il personaggio da scartare a un avversario",
    );
    const dopo = gioca(s, "A", {
      tipo: "attiva",
      carta: carta.id,
      combinazione: usa(...mano),
      bersaglio: { giocatore: "B", carta: vittima.id },
    });
    expect(dopo.giocatori.B!.posti).toEqual([]);
    expect(dopo.scarti.personaggi).toEqual([vittima]);
  });

  it("Medusa: non può colpire i propri posti; senza bersagli si attiva senza effetto", () => {
    const mano = [num(1), num(2), num(4)];
    const { s, carta } = conPersonaggio("strega", mano);
    const mio = pers("leone");
    s.giocatori.A!.posti.push(mio);
    expect(gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) }).giocatori.A!.punti).toBe(1);
    s.giocatori.B!.posti = [pers("goblin")];
    expect(
      errore(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), bersaglio: { giocatore: "A", carta: mio.id } }),
    ).toBe("Il bersaglio deve essere un avversario");
  });

  it("Gatto con gli stivali: una carta del codice resta in mano", () => {
    const mano = [num(3), num(4), num(5)];
    const { s, carta } = conPersonaggio("gatto-con-gli-stivali", mano);
    const dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), tieni: mano[1]!.id });
    expect(dopo.giocatori.A!.mano).toEqual([mano[1]]);
    expect(dopo.scarti.numeri).toEqual([mano[0], mano[2]]);
  });

  it("Gatto con gli stivali: si può tenere anche un diamante del codice", () => {
    const { s, carta } = conPersonaggio("gatto-con-gli-stivali", [num(3), num(4)]);
    const d = dia(5);
    s.giocatori.A!.diamanti = [d];
    const comb: Combinazione = [...usa(...s.giocatori.A!.mano), { tipo: "diamante", id: d.id, valore: 5 }];
    expect(gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: comb, tieni: d.id }).giocatori.A!.diamanti).toEqual([d]);
  });

  it("si può tenere solo una carta del codice, e solo col Gatto", () => {
    const mano = [num(3), num(4), num(5), num(6)];
    const { s, carta } = conPersonaggio("gatto-con-gli-stivali", mano);
    expect(errore(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano.slice(0, 3)), tieni: mano[3]!.id })).toMatch(
      /Puoi tenere solo/,
    );
    const altro = conPersonaggio("hansel-e-gretel", [num(8), num(8)]);
    const m = altro.s.giocatori.A!.mano;
    expect(errore(altro.s, "A", { tipo: "attiva", carta: altro.carta.id, combinazione: usa(...m), tieni: m[0]!.id })).toMatch(
      /Puoi tenere solo/,
    );
  });

  it("Fatina: guardi la mano di un avversario e prendi una carta (solo numeri)", () => {
    const mano = [num(5), num(6), num(7)];
    const { s, carta } = conPersonaggio("fatina", mano);
    const suaMano = [num(1), num(8)];
    s.giocatori.B!.mano = [...suaMano];
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), avversario: "B" });
    expect(dopo.turno.attesa).toEqual({ tipo: "fatina", avversario: "B" });
    expect(vistaGiocatore(dopo, "A").manoAvversario).toEqual(suaMano);
    expect(mosseValide(dopo, "A")).toEqual(suaMano.map((c) => ({ tipo: "prendiDaFatina", carta: c.id })));
    dopo = gioca(dopo, "A", { tipo: "prendiDaFatina", carta: suaMano[1]!.id });
    expect(dopo.giocatori.A!.mano).toEqual([suaMano[1]]);
    expect(dopo.giocatori.B!.mano).toEqual([suaMano[0]]);
    expect(vistaGiocatore(dopo, "A").manoAvversario).toBeUndefined();
  });

  it("Fatina: con l'avversario a mano vuota si attiva senza effetto", () => {
    const mano = [num(5), num(6), num(7)];
    const { s, carta } = conPersonaggio("fatina", mano);
    const dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), avversario: "B" });
    expect(dopo.turno.attesa).toBeNull();
    expect(dopo.giocatori.A!.punti).toBe(1);
  });

  it("Xena: ricevi 1 diamante e da subito i diamanti possono fare −1", () => {
    const mano = [num(3), num(5), num(7)];
    const { s, carta } = conPersonaggio("xena", mano);
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) });
    expect(dopo.giocatori.A!.diamanti).toHaveLength(1);
    // Nello stesso turno: Nano del 7 (77) attivato con un 8 che fa −1 grazie a Xena
    const [otto, sette] = [num(8), num(7)];
    const d = dia(1);
    dopo.giocatori.A!.mano = [otto, sette];
    dopo.giocatori.A!.diamanti = [d];
    const nano7 = pers("nano-7");
    dopo.giocatori.A!.posti = [nano7];
    dopo = gioca(dopo, "A", {
      tipo: "attiva",
      carta: nano7.id,
      combinazione: [
        { tipo: "numero", id: otto.id, valore: 7, modifica: { diamante: d.id, delta: -1 } },
        { tipo: "numero", id: sette.id, valore: 7 },
      ],
    });
    expect(dopo.giocatori.A!.attivati.map((c) => c.personaggio)).toEqual(["xena", "nano-7"]);
  });
});

/* ------------------------------ poteri blu ------------------------------ */

describe("poteri blu", () => {
  it("Cappuccetto Rosso: 1 mossa in più subito e 4 mosse nei turni successivi", () => {
    const mano = [num(4), num(5), num(6), num(7), num(8)];
    const { s, carta } = conPersonaggio("cappuccetto-rosso", mano);
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) });
    expect(dopo.turno.mosseRimaste).toBe(3);
    dopo = passaTurno(passaTurno(dopo));
    expect(dopo.turno).toMatchObject({ giocatore: "A", mosseRimaste: 4 });
  });

  it("le mosse extra si sommano: Cappuccetto + Golem + fulmine", () => {
    const s = partita();
    s.giocatori.A!.attivati = [pers("cappuccetto-rosso")];
    s.turno.mosseRimaste = 4;
    const mano = [num(1), num(3), num(5), num(7)];
    const golem = pers("golem-dispari");
    const f = fulmine();
    s.giocatori.A!.mano = mano;
    s.giocatori.A!.posti = [golem];
    s.giocatori.A!.diamanti = [f];
    let dopo = gioca(s, "A", { tipo: "attiva", carta: golem.id, combinazione: usa(...mano) });
    dopo = gioca(dopo, "A", { tipo: "giocaFulmine", diamante: f.id });
    expect(dopo.turno.mosseRimaste).toBe(4 - 1 + 3 + 1);
  });

  it("Bacchetta magica: una volta per turno si brucia senza consumare mosse", () => {
    let s = partita();
    s.giocatori.A!.attivati = [pers("bacchetta-magica")];
    expect(mosseValide(s, "A")).toContainEqual({ tipo: "bruciaGratis" });
    s = gioca(s, "A", { tipo: "bruciaGratis" });
    expect(s.turno.mosseRimaste).toBe(3);
    expect(errore(s, "A", { tipo: "bruciaGratis" })).toBe("La Bacchetta magica si usa una volta per turno");
    expect(errore(partita(), "A", { tipo: "bruciaGratis" })).toBe("Serve la Bacchetta magica");
  });

  it("Scheletro: a fine turno si cambiano tutte le carte in mano", () => {
    const s = partita();
    const vecchie = [num(1), num(1), num(2)];
    s.giocatori.A!.mano = [...vecchie];
    s.giocatori.A!.attivati = [pers("scheletro")];
    s.turno.mosseRimaste = 0;
    const dopo = gioca(s, "A", { tipo: "fineTurno", scarta: [], cambiaMano: true });
    expect(dopo.giocatori.A!.mano).toHaveLength(3);
    expect(dopo.giocatori.A!.mano.map((c) => c.id)).not.toContain(vecchie[0]!.id);
    expect(dopo.scarti.numeri).toEqual(vecchie);
    expect(errore(partita(), "A", { tipo: "fineTurno", scarta: [], cambiaMano: true })).toBe("Devi ancora fare tutte le mosse");
    const senza = partita();
    senza.turno.mosseRimaste = 0;
    expect(errore(senza, "A", { tipo: "fineTurno", scarta: [], cambiaMano: true })).toBe("Serve lo Scheletro");
  });

  it("Biancaneve: un 2 in mano si scambia con un diamante, senza usare mosse", () => {
    const s = partita();
    const due = num(2);
    const tre = num(3);
    s.giocatori.A!.mano = [due, tre];
    s.giocatori.A!.attivati = [pers("biancaneve")];
    const dopo = gioca(s, "A", { tipo: "dueInDiamante", carta: due.id });
    expect(dopo.giocatori.A!.mano).toEqual([tre]);
    expect(dopo.giocatori.A!.diamanti).toHaveLength(1);
    expect(dopo.scarti.numeri).toEqual([due]);
    expect(dopo.turno.mosseRimaste).toBe(3);
    expect(errore(s, "A", { tipo: "dueInDiamante", carta: tre.id })).toBe("Serve un 2 in mano");
    const senza = partita();
    senza.giocatori.A!.mano = [due];
    expect(errore(senza, "A", { tipo: "dueInDiamante", carta: due.id })).toBe("Serve Biancaneve");
  });

  it("Mago: a inizio turno si vede la prima carta del mazzo personaggi, solo nel proprio turno", () => {
    let s = partita();
    s.giocatori.A!.attivati = [pers("mago")];
    expect(vistaGiocatore(s, "A").primoPersonaggio).toBeUndefined(); // il turno era già iniziato senza Mago
    s = passaTurno(s); // turno di B
    expect(vistaGiocatore(s, "A").primoPersonaggio).toBeUndefined();
    s = passaTurno(s); // di nuovo A: a inizio turno guarda il mazzo
    const primo = s.mazzi.personaggi.at(-1);
    expect(vistaGiocatore(s, "A").primoPersonaggio).toEqual(primo);
    expect(vistaGiocatore(s, "B").primoPersonaggio).toBeUndefined();
  });

  it("Mago: se pesca la carta vista non vede la successiva", () => {
    let s = partita();
    s.giocatori.A!.attivati = [pers("mago")];
    s = passaTurno(passaTurno(s));
    expect(vistaGiocatore(s, "A").primoPersonaggio).toBeDefined();
    s = gioca(s, "A", { tipo: "pescaPersonaggio" });
    expect(vistaGiocatore(s, "A").primoPersonaggio).toBeUndefined();
  });

  it("Mago attivato a metà turno: vede il mazzo solo dall'inizio del turno successivo", () => {
    const mano = [num(3), num(4), num(5)];
    const { s, carta } = conPersonaggio("mago", mano);
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano) });
    expect(vistaGiocatore(dopo, "A").primoPersonaggio).toBeUndefined();
    dopo = passaTurno(passaTurno(dopo));
    expect(vistaGiocatore(dopo, "A").primoPersonaggio).toBeDefined();
  });

  it("Cappellaio matto: a inizio turno scambia un personaggio con uno del tavolo, anche con posti pieni", () => {
    const s = partita();
    s.giocatori.A!.attivati = [pers("cappellaio-matto")];
    const [mio, altro] = [pers("goblin"), pers("leone")];
    s.giocatori.A!.posti = [mio, altro];
    const dalTavolo = s.tavolo.personaggi[1]!;
    const dopo = gioca(s, "A", { tipo: "scambiaConTavolo", carta: mio.id, posizione: 1 });
    expect(dopo.giocatori.A!.posti).toEqual([dalTavolo, altro]);
    expect(dopo.tavolo.personaggi[1]).toEqual(mio);
    expect(dopo.turno.mosseRimaste).toBe(3);
    expect(errore(dopo, "A", { tipo: "scambiaConTavolo", carta: altro.id, posizione: 0 })).toBe(
      "Lo scambio si fa solo a inizio turno",
    );
  });

  it("Bacchetta magica: si usa solo a inizio turno, prima di ogni altra azione", () => {
    let s = partita();
    s.giocatori.A!.attivati = [pers("bacchetta-magica")];
    s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(errore(s, "A", { tipo: "bruciaGratis" })).toBe("La Bacchetta magica si usa solo a inizio turno");
    expect(mosseValide(s, "A")).not.toContainEqual({ tipo: "bruciaGratis" });
  });

  it("a inizio turno si possono usare sia il Cappellaio sia la Bacchetta, in qualsiasi ordine", () => {
    for (const primaBacchetta of [true, false]) {
      let s = partita();
      s.giocatori.A!.attivati = [pers("bacchetta-magica"), pers("cappellaio-matto")];
      const mio = pers("goblin");
      s.giocatori.A!.posti = [mio];
      const scambio: Mossa = { tipo: "scambiaConTavolo", carta: mio.id, posizione: 0 };
      if (primaBacchetta) {
        s = gioca(gioca(s, "A", { tipo: "bruciaGratis" }), "A", scambio);
      } else {
        s = gioca(gioca(s, "A", scambio), "A", { tipo: "bruciaGratis" });
      }
      expect(s.turno.mosseRimaste).toBe(3);
      // il Cappellaio resta una volta sola
      const altro = s.giocatori.A!.posti[0]!;
      expect(errore(s, "A", { tipo: "scambiaConTavolo", carta: altro.id, posizione: 1 })).toBe("Lo scambio si fa solo a inizio turno");
    }
  });

  it("Cappellaio matto: non dopo un'altra azione del turno", () => {
    let s = partita();
    s.giocatori.A!.attivati = [pers("cappellaio-matto")];
    const mio = pers("goblin");
    s.giocatori.A!.posti = [mio];
    s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(errore(s, "A", { tipo: "scambiaConTavolo", carta: mio.id, posizione: 0 })).toBe(
      "Lo scambio si fa solo a inizio turno",
    );
  });
});

describe("Lucciola", () => {
  it("il giocatore vicino può attivarla con una mossa: punti a lui e il posto del proprietario si libera", () => {
    const s = partita(["A", "B", "C", "D"]);
    const lucciola = pers("lucciola-444-555");
    s.giocatori.B!.posti = [lucciola];
    const mano = [num(5), num(5), num(5)];
    s.giocatori.A!.mano = mano;
    const dopo = gioca(s, "A", { tipo: "attiva", carta: lucciola.id, combinazione: usa(...mano) });
    expect(dopo.giocatori.A!).toMatchObject({ punti: 3, attivati: [lucciola] });
    expect(dopo.giocatori.B!.posti).toEqual([]);
    expect(dopo.turno.mosseRimaste).toBe(2);
  });

  it("vale anche per il giocatore prima (D è prima di A), non per chi è di fronte (C)", () => {
    const s = partita(["A", "B", "C", "D"]);
    const mano = [num(4), num(4), num(4)];
    s.giocatori.A!.mano = mano;
    const daD = pers("lucciola-444-555");
    s.giocatori.D!.posti = [daD];
    expect(gioca(s, "A", { tipo: "attiva", carta: daD.id, combinazione: usa(...mano) }).giocatori.A!.punti).toBe(3);
    s.giocatori.D!.posti = [];
    const daC = pers("lucciola-333-666");
    s.giocatori.C!.posti = [daC];
    s.giocatori.A!.mano = [num(3), num(3), num(3)];
    expect(errore(s, "A", { tipo: "attiva", carta: daC.id, combinazione: usa(...s.giocatori.A!.mano) })).toBe(
      "Non puoi attivare questo personaggio",
    );
  });

  it("gli altri personaggi dei vicini non si possono attivare", () => {
    const s = partita();
    const goblin = pers("goblin");
    s.giocatori.B!.posti = [goblin];
    s.giocatori.A!.mano = [num(1), num(1)];
    expect(errore(s, "A", { tipo: "attiva", carta: goblin.id, combinazione: usa(...s.giocatori.A!.mano) })).toBe(
      "Non puoi attivare questo personaggio",
    );
  });
});

/* ------------------------------ fine partita ------------------------------ */

describe("fine partita", () => {
  /** Fa arrivare `chi` a 15 punti attivando un Leone mentre ne ha già 10. */
  function arrivaA15(s: StatoPartita, chi: string): StatoPartita {
    const leone = pers("leone");
    const mano = [num(8), num(8), num(8), num(8)];
    s.giocatori[chi]!.punti = 10;
    s.giocatori[chi]!.mano = mano;
    s.giocatori[chi]!.posti = [leone];
    return gioca(s, chi, { tipo: "attiva", carta: leone.id, combinazione: usa(...mano) });
  }

  it("C arriva a 15: giocano ancora D (fine giro) e poi A, B, C, D (ultimo giro)", () => {
    let s = partita(["A", "B", "C", "D"]);
    s = passaTurno(passaTurno(s)); // A, B
    s = arrivaA15(s, "C");
    expect(s.giocatori.C!.punti).toBe(15);
    const turni: string[] = [];
    s = passaTurno(s); // chiude il turno di C
    while (!s.finita) {
      turni.push(s.turno.giocatore);
      s = passaTurno(s);
    }
    expect(turni).toEqual(["D", "A", "B", "C", "D"]);
    expect(finePartita(s)).toEqual({ vincitori: ["C"], punti: { A: 0, B: 0, C: 15, D: 0 } });
  });

  it("se a 15 arriva l'ultimo del giro si gioca subito l'ultimo giro completo", () => {
    let s = partita(["A", "B"]);
    s = passaTurno(s);
    s = passaTurno(arrivaA15(s, "B"));
    const turni: string[] = [];
    while (!s.finita) {
      turni.push(s.turno.giocatore);
      s = passaTurno(s);
    }
    expect(turni).toEqual(["A", "B"]);
  });

  it("l'ultimo giro non si allunga se un altro arriva a 15", () => {
    let s = partita(["A", "B"]);
    s = passaTurno(arrivaA15(s, "A")); // A arriva a 15: si finisce il giro (B) e poi un ultimo giro (A, B)
    s = passaTurno(s); // B
    s = passaTurno(s); // A, ultimo giro
    s = arrivaA15(s, "B"); // anche B arriva a 15 nell'ultimo giro
    s = passaTurno(s);
    expect(s.finita).toBe(true);
    expect(finePartita(s)?.vincitori).toEqual(["A", "B"]);
  });

  it("vince chi ha più punti; a parità è pareggio tra i primi", () => {
    const s = partita(["A", "B", "C"]);
    s.finita = true;
    s.giocatori.A!.punti = 16;
    s.giocatori.B!.punti = 16;
    s.giocatori.C!.punti = 9;
    expect(finePartita(s)?.vincitori).toEqual(["A", "B"]);
    expect(finePartita(partita())).toBeNull();
  });

  it("a partita finita non si gioca più", () => {
    const s = partita();
    s.finita = true;
    expect(errore(s, "A", { tipo: "pescaNumero" })).toBe("La partita è finita");
    expect(mosseValide(s, "A")).toEqual([]);
  });
});

/* ------------------------------ vista e segretezza ------------------------------ */

describe("vista del giocatore", () => {
  it("non mostra mani altrui, contenuto dei mazzi né generatore casuale", () => {
    let s = partita(["A", "B"]);
    s = gioca(s, "A", { tipo: "pescaNumero" });
    s = gioca(s, "A", { tipo: "pescaNumero" });
    const vistaB = vistaGiocatore(s, "B");
    const testo = JSON.stringify(vistaB);
    for (const c of s.giocatori.A!.mano) expect(testo).not.toContain(c.id);
    for (const c of [...s.mazzi.numeri, ...s.mazzi.personaggi, ...s.mazzi.diamanti]) expect(testo).not.toContain(`"${c.id}"`);
    expect(testo).not.toContain("rng");
    expect(vistaB.giocatori.A!.carteInMano).toBe(2);
    expect(vistaB.mano).toEqual([]);
    expect(vistaB.turno.attesa).toBeNull();
  });

  it("mostra la propria mano, i diamanti di tutti e i conteggi dei mazzi", () => {
    let s = partita(["A", "B"]);
    s.giocatori.B!.diamanti = [dia(4)];
    s = gioca(s, "A", { tipo: "pescaNumero" });
    const v = vistaGiocatore(s, "A");
    expect(v.mano).toEqual(s.giocatori.A!.mano);
    expect(v.giocatori.B!.diamanti).toEqual(s.giocatori.B!.diamanti);
    expect(v.mazzi.numeri).toBe(s.mazzi.numeri.length);
    expect(v.limiteMano).toBe(5);
  });
});

/* ------------------------------ prova automatica ------------------------------ */

describe("partite casuali (prova automatica)", () => {
  it("50 partite con mosse valide scelte a caso finiscono senza errori", () => {
    const rng = creaCasuale(99);
    for (let p = 0; p < 50; p++) {
      const giocatori = ["A", "B", "C", "D", "E"].slice(0, 2 + (p % 4));
      let s = primoGioco.setup(giocatori, {}, p);
      let passi = 0;
      while (!primoGioco.finePartita(s)) {
        const chi = s.turno.giocatore;
        const mosse = primoGioco.mosseValide(s, chi);
        expect(mosse.length, `nessuna mossa per ${chi}`).toBeGreaterThan(0);
        // per far finire la partita, si preferiscono le attivazioni quando possibili
        const attivazioni = mosse.filter((m) => m.tipo === "attiva");
        const scelta = attivazioni.length > 0 ? attivazioni[interoTra(rng, 0, attivazioni.length - 1)]! : mosse[interoTra(rng, 0, mosse.length - 1)]!;
        const r = primoGioco.applicaMossa(s, chi, scelta);
        if (!r.ok) throw new Error(`Mossa proposta ma rifiutata: ${r.errore} ${JSON.stringify(scelta)}`);
        s = r.stato;
        expect(++passi).toBeLessThan(20000);
      }
      expect(Math.max(...Object.values(s.giocatori).map((g) => g.punti))).toBeGreaterThanOrEqual(15);
    }
  });
});

describe("risorse viste dal browser", () => {
  it("coincidono con quelle che usa il server, lungo partite intere", async () => {
    const { risorseDaVista } = await import("./vista");
    const { risorseDi } = await import("./regole");
    const rng = creaCasuale(5);
    for (let p = 0; p < 5; p++) {
      let s = primoGioco.setup(["A", "B", "C"], {}, p);
      for (let passo = 0; passo < 400 && !s.finita; passo++) {
        const chi = s.turno.giocatore;
        expect(risorseDaVista(vistaGiocatore(s, chi))).toEqual(risorseDi(s, chi));
        const mosse = mosseValide(s, chi);
        const attiva = mosse.filter((m) => m.tipo === "attiva");
        const scelta = attiva.length > 0 ? attiva[0]! : mosse[interoTra(rng, 0, mosse.length - 1)]!;
        s = gioca(s, chi, scelta);
      }
    }
  });
});

describe("chiusura automatica del turno", () => {
  it("finite le mosse, senza altre scelte, il turno si chiude da solo", async () => {
    const { mossaAutomatica } = await import("./regole");
    let s = partita();
    expect(mossaAutomatica(s)).toBeNull(); // ci sono ancora mosse
    for (let i = 0; i < 3; i++) s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(mossaAutomatica(s)).toEqual({ giocatore: "A", mossa: fine() });
  });

  it("non si chiude da solo se c'è un fulmine da giocare", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.giocatori.A!.diamanti = [fulmine()];
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toBeNull();
  });

  it("non si chiude da solo se bisogna scegliere cosa scartare", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.giocatori.A!.mano = Array.from({ length: 7 }, (_, i) => num((i % 8) + 1));
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toBeNull();
  });

  it("non si chiude da solo con lo Scheletro (si usa a fine turno)", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.giocatori.A!.attivati = [pers("scheletro")];
    s.giocatori.A!.mano = [num(5)];
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toBeNull();
  });

  it("Bacchetta (si usa solo a inizio turno) non blocca la chiusura", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.giocatori.A!.attivati = [pers("bacchetta-magica")];
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toEqual({ giocatore: "A", mossa: fine() });
  });

  it("Biancaneve blocca la chiusura solo se c'è un 2 in mano", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.giocatori.A!.attivati = [pers("biancaneve")];
    s.turno.mosseRimaste = 0;
    s.giocatori.A!.mano = [num(2), num(5)];
    expect(mossaAutomatica(s)).toBeNull();
    s.giocatori.A!.mano = [num(3), num(5)];
    expect(mossaAutomatica(s)).toEqual({ giocatore: "A", mossa: fine() });
  });

  it("con mosse ancora disponibili non si chiude da solo", async () => {
    const { mossaAutomatica } = await import("./regole");
    expect(mossaAutomatica(partita())).toBeNull();
  });

  it("non agisce durante una scelta in sospeso o a partita finita", async () => {
    const { mossaAutomatica } = await import("./regole");
    const s = partita();
    s.turno.mosseRimaste = 0;
    s.turno.attesa = { tipo: "scartaPersonaggio", nuovo: "x" };
    expect(mossaAutomatica(s)).toBeNull();
    s.turno.attesa = null;
    s.finita = true;
    expect(mossaAutomatica(s)).toBeNull();
  });
});

describe("registro delle ultime mosse", () => {
  it("racconta prendere, pescare e fine turno, con numeri progressivi", () => {
    let s = partita();
    const preso = s.tavolo.numeri[1]!.valore;
    s = gioca(s, "A", { tipo: "prendiNumero", posizione: 1 });
    s = gioca(s, "A", { tipo: "pescaNumero" });
    s = gioca(s, "A", { tipo: "pescaPersonaggio" });
    const pescato = s.giocatori.A!.posti[0]!.personaggio;
    s = gioca(s, "A", fine());
    expect(s.registro).toEqual([
      { n: 1, giocatore: "A", tipo: "prendiNumero", valore: preso },
      { n: 2, giocatore: "A", tipo: "pescaNumero" },
      { n: 3, giocatore: "A", tipo: "pescaPersonaggio", personaggio: pescato },
      { n: 4, giocatore: "A", tipo: "fineTurno", scartate: 0, cambiaMano: false },
    ]);
  });

  it("pescare una carta numero non rivela quale", () => {
    const s = gioca(partita(), "A", { tipo: "pescaNumero" });
    const pescata = s.giocatori.A!.mano[0]!;
    const evento = s.registro.at(-1)!;
    expect(JSON.stringify(evento)).not.toContain(pescata.id);
    expect(evento).toEqual({ n: 1, giocatore: "A", tipo: "pescaNumero" });
  });

  it("attivazione: personaggio, punti, valori usati e vittima della Medusa", () => {
    const mano = [num(1), num(2), num(4)];
    const { s, carta } = conPersonaggio("strega", mano);
    const vittima = pers("leone");
    s.giocatori.B!.posti = [vittima];
    const dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), bersaglio: { giocatore: "B", carta: vittima.id } });
    expect(dopo.registro.at(-1)).toEqual({
      n: 1,
      giocatore: "A",
      tipo: "attiva",
      personaggio: "strega",
      punti: 1,
      valori: [1, 2, 4],
      bersaglio: { giocatore: "B", personaggio: "leone" },
    });
  });

  it("Fatina: si sa da chi si è presa una carta, non quale", () => {
    const mano = [num(5), num(6), num(7)];
    const { s, carta } = conPersonaggio("fatina", mano);
    const segreta = num(8);
    s.giocatori.B!.mano = [segreta];
    let dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(...mano), avversario: "B" });
    dopo = gioca(dopo, "A", { tipo: "prendiDaFatina", carta: segreta.id });
    expect(dopo.registro.at(-1)).toEqual({ n: 2, giocatore: "A", tipo: "prendiDaFatina", da: "B" });
    expect(JSON.stringify(vistaGiocatore(dopo, "C" in dopo.giocatori ? "C" : "B").registro)).not.toContain(segreta.id);
  });

  it("si annuncia l'ultimo giro e si tengono solo gli ultimi 40 eventi", () => {
    let s = partita();
    s.giocatori.A!.punti = 10;
    s.giocatori.A!.mano = [num(8), num(8), num(8), num(8)];
    const leone = pers("leone");
    s.giocatori.A!.posti = [leone];
    s = gioca(s, "A", { tipo: "attiva", carta: leone.id, combinazione: usa(...s.giocatori.A!.mano) });
    expect(s.registro.map((e) => e.tipo)).toEqual(["attiva", "ultimoGiro"]);
    let lunga = partita();
    for (let i = 0; i < 30; i++) lunga = passaTurno(lunga);
    expect(lunga.registro).toHaveLength(40);
    expect(lunga.registro.at(-1)!.n).toBe(30 * 4);
  });

  it("la vista contiene il registro; le partite vecchie senza registro funzionano", () => {
    const s = gioca(partita(), "A", { tipo: "pescaNumero" });
    expect(vistaGiocatore(s, "B").registro).toHaveLength(1);
    const vecchia = partita() as Partial<StatoPartita>;
    delete vecchia.registro;
    const dopo = gioca(vecchia as StatoPartita, "A", { tipo: "pescaNumero" });
    expect(dopo.registro).toHaveLength(1);
  });
});

describe("Biancaneve", () => {
  it("attivandola si riceve 1 diamante e poi si possono scambiare i 2", () => {
    const due = num(2);
    const { s, carta } = conPersonaggio("biancaneve", [due, num(2)]);
    const dopo = gioca(s, "A", { tipo: "attiva", carta: carta.id, combinazione: usa(due) });
    expect(dopo.giocatori.A!.diamanti).toHaveLength(1);
    expect(dopo.registro.at(-1)).toMatchObject({ tipo: "attiva", personaggio: "biancaneve" });
    expect(mosseValide(dopo, "A")).toContainEqual({ tipo: "dueInDiamante", carta: dopo.giocatori.A!.mano[0]!.id });
  });
});

/* ------------------------------ carte con le frecce ------------------------------ */

describe("carte numero con le frecce", () => {
  /** Mette in cima al mazzo numeri le carte date (l'ultima della lista è la prima pescata). */
  function inCima(s: StatoPartita, ...carte: CartaNumero[]): void {
    s.mazzi.numeri.push(...carte);
  }
  const freccia = (valore: number): CartaNumero => ({ ...num(valore), frecce: true });

  it("nel mazzo sono 3 (un 3, un 4 e un 5) al posto di 3 carte normali: restano 56 carte, 7 per valore", () => {
    const s = setup(["A", "B"], {}, 1);
    const tutte = [...s.mazzi.numeri, ...s.scarti.numeri, ...s.tavolo.numeri.filter((c) => c !== null)];
    expect(tutte).toHaveLength(56);
    expect(tutte.filter((c) => c!.frecce).map((c) => c!.valore).sort()).toEqual([3, 4, 5]);
  });

  it("presa dal tavolo e rimpiazzata da una carta con le frecce: i 2 personaggi vanno negli scarti e se ne scoprono 2 nuovi", () => {
    let s = partita();
    const vecchi = s.tavolo.personaggi.map((c) => c!.id);
    const nuoviAttesi = s.mazzi.personaggi.slice(-2).map((c) => c.id);
    inCima(s, freccia(4));
    s = gioca(s, "A", { tipo: "prendiNumero", posizione: 0 });
    expect(s.tavolo.numeri[0]).toMatchObject({ valore: 4, frecce: true });
    expect(s.scarti.personaggi.map((c) => c.id)).toEqual(vecchi);
    expect(s.tavolo.personaggi.map((c) => c!.id).sort()).toEqual([...nuoviAttesi].sort());
    expect(s.registro.at(-1)).toMatchObject({ tipo: "frecce", valore: 4, giocatore: "A" });
  });

  it("bruciando escono 2 carte con le frecce: i personaggi si cambiano 2 volte", () => {
    let s = partita();
    inCima(s, num(1), freccia(3), num(2), freccia(5));
    const primi = s.tavolo.personaggi.map((c) => c!.id);
    const prossimi4 = s.mazzi.personaggi.slice(-4).map((c) => c.id);
    s = gioca(s, "A", { tipo: "brucia" });
    expect(s.scarti.personaggi).toHaveLength(4);
    expect(s.scarti.personaggi.slice(0, 2).map((c) => c.id)).toEqual(primi);
    const sulTavolo = s.tavolo.personaggi.map((c) => c!.id);
    expect(prossimi4).toEqual(expect.arrayContaining(sulTavolo));
    expect(s.registro.filter((e) => e.tipo === "frecce")).toHaveLength(2);
  });

  it("pescata coperta dal mazzo va in mano e non succede niente", () => {
    let s = partita();
    const personaggiPrima = s.tavolo.personaggi;
    inCima(s, freccia(3));
    s = gioca(s, "A", { tipo: "pescaNumero" });
    expect(s.giocatori.A!.mano.at(-1)).toMatchObject({ valore: 3, frecce: true });
    expect(s.tavolo.personaggi).toEqual(personaggiPrima);
    expect(s.scarti.personaggi).toHaveLength(0);
  });

  it("in mano vale come una carta normale del suo numero (Tremotino 333 attivato con un 3 con le frecce)", () => {
    let s = partita();
    const a = freccia(3);
    const b = num(3);
    const c = num(3);
    const folletto = pers("folletto");
    s.giocatori.A!.mano = [a, b, c];
    s.giocatori.A!.posti = [folletto];
    s = gioca(s, "A", { tipo: "attiva", carta: folletto.id, combinazione: usa(a, b, c) });
    expect(s.giocatori.A!.attivati.map((x) => x.id)).toEqual([folletto.id]);
    expect(s.scarti.numeri).toContainEqual(a);
  });

  it("a inizio partita: se tra le 4 carte scoperte c'è una carta con le frecce, i personaggi si cambiano subito (senza registro)", () => {
    // Si cerca un seme in cui esce una carta con le frecce già alla preparazione
    let trovato = false;
    for (let seed = 1; seed < 200 && !trovato; seed++) {
      const s = setup(["A", "B"], {}, seed);
      const quante = s.tavolo.numeri.filter((c) => c?.frecce).length;
      if (quante === 0) continue;
      trovato = true;
      expect(s.scarti.personaggi).toHaveLength(2 * quante);
      expect(s.tavolo.personaggi.filter(Boolean)).toHaveLength(2);
      expect(s.registro.filter((e) => e.tipo === "frecce")).toHaveLength(0);
    }
    expect(trovato).toBe(true);
  });
});

/* ------------------------------ vista pubblica (spettatori, schermo tavolo) ------------------------------ */

describe("vista pubblica", () => {
  /** Partita a metà, con carte in mano, Mago attivo e una scelta della Fatina in sospeso. */
  function partitaAMeta(): StatoPartita {
    let s = partita(["A", "B", "C"], 9);
    for (let i = 0; i < 4; i++) s = passaTurno(s);
    s.giocatori.A!.attivati.push(pers("mago"));
    s.turno = { ...s.turno, giocatore: "A", cartaMago: s.mazzi.personaggi.at(-1)!.id, attesa: { tipo: "fatina", avversario: "B" } };
    s.giocatori.B!.mano.push(num(7));
    return s;
  }

  it("mostra il tavolo, i punti, i posti e quante carte ha ognuno", () => {
    const s = partitaAMeta();
    const v = vistaPubblica(s);
    expect(v.io).toBe("");
    expect(v.tavolo).toEqual(s.tavolo);
    for (const id of s.ordine) {
      expect(v.giocatori[id]!.carteInMano).toBe(s.giocatori[id]!.mano.length);
      expect(v.giocatori[id]!.posti).toEqual(s.giocatori[id]!.posti);
      expect(v.giocatori[id]!.punti).toBe(s.giocatori[id]!.punti);
    }
    expect(v.turno.giocatore).toBe("A");
  });

  it("non mostra nessuna carta segreta: mani, mazzi coperti, carta del Mago, mano vista con la Fatina", () => {
    const s = partitaAMeta();
    const v = vistaPubblica(s);
    expect(v.mano).toEqual([]);
    expect(v.primoPersonaggio).toBeUndefined();
    expect(v.manoAvversario).toBeUndefined();
    expect(v.turno.attesa).toBeNull();
    const testo = JSON.stringify(v);
    const segreti = [
      ...Object.values(s.giocatori).flatMap((g) => g.mano.map((c) => c.id)),
      ...s.mazzi.numeri.map((c) => c.id),
      ...s.mazzi.personaggi.map((c) => c.id),
      ...s.mazzi.diamanti.map((c) => c.id),
    ];
    expect(segreti.length).toBeGreaterThan(50);
    for (const id of segreti) expect(testo, id).not.toContain(`"${id}"`);
  });
});

