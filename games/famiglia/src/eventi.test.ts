import { describe, expect, it } from "vitest";
import { contaCarte, copia, fai, num, partita, rifiutata } from "./aiuti-test";
import { EVENTI } from "./eventi";
import { famiglieComplete, mosseValide, puntiDi, setup } from "./regole";
import type { StatoPartita } from "./stato";
import { vistaGiocatore } from "./vista";

/* ---------------- aiuti ---------------- */

const attivata = (s: StatoPartita, chi: string, idCarta: string, stanca = 0) => {
  s.giocatori[chi]!.attivati.push({ copia: copia(idCarta), stanca });
  return s;
};

/** Anna pesca l'evento indicato (messo in cima al mazzo eventi). */
function pescaEvento(s: StatoPartita, id: string): StatoPartita {
  s.eventi.mazzo.push(id);
  return fai(s, "anna", { tipo: "pescaEvento" });
}

/** Chiude il turno di chi è di turno (senza mosse né carte da scartare). */
function passa(s: StatoPartita): StatoPartita {
  s.turno.mosseRimaste = 0;
  s.giocatori[s.turno.giocatore]!.mano = [];
  return fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
}

/* ---------------- eventi ---------------- */

describe("pescare un evento", () => {
  it("costa una mossa, vale da subito e dura i turni scritti sulla carta", () => {
    let s = pescaEvento(partita(), "funerale"); // 2 turni
    expect(s.evento).toEqual({ id: "funerale", turniRimasti: 2 });
    expect(s.turno.mosseRimaste).toBe(2);
    expect(vistaGiocatore(s, "bruno").evento).toEqual({ id: "funerale", turniRimasti: 2 });
    s = passa(s);
    expect(s.evento?.turniRimasti).toBe(1);
    s = passa(s);
    expect(s.evento).toBeNull();
    expect(s.eventi.scarti).toContain("funerale");
  });

  it("non si pesca se c'è già un evento in corso", () => {
    const s = pescaEvento(partita(), "funerale");
    expect(mosseValide(s, "anna").some((m) => m.tipo === "pescaEvento")).toBe(false);
    expect(rifiutata(s, "anna", { tipo: "pescaEvento" })).toMatch(/già un evento/);
  });

  it("il mazzo eventi ha i 6 eventi definiti", () => {
    expect(setup(["a", "b"], {}, 3).eventi.mazzo.sort()).toEqual(EVENTI.map((e) => e.id).sort());
  });
});

describe("effetti degli eventi", () => {
  it("Natale: tutti 1 mossa in meno, tranne chi ha Nonna Dina o Gerardina (1 in più)", () => {
    let s = attivata(partita(), "bruno", "gerardina-1");
    s = pescaEvento(s, "natale");
    expect(s.turno.mosseRimaste).toBe(1); // anna: 3 − 1 (pescare) − 1 (Natale)
    s = passa(s);
    expect(s.turno.mosseRimaste).toBe(4); // bruno ha Gerardina
    s = passa(s);
    expect(s.turno.mosseRimaste).toBe(2); // carla
    s = passa(s);
    expect(s.evento).toBeNull();
    expect(s.turno.mosseRimaste).toBe(3);
  });

  it("Matrimonio: tutti 1 mossa in meno; Don Pasquale e Donato si ricaricano e non si stancano", () => {
    let s = attivata(attivata(partita(), "anna", "don-pasquale", 2), "bruno", "donato", 1);
    s = pescaEvento(s, "matrimonio");
    expect(s.turno.mosseRimaste).toBe(1);
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
    expect(s.giocatori.bruno!.attivati[0]!.stanca).toBe(0);
    s = fai(s, "anna", { tipo: "potere", carta: "don-pasquale#1", potere: "benedizione" });
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
  });

  it("Matrimonio: il regalo agli sposi, tutti perdono una carta numero (chi non ne ha, niente)", () => {
    let s = partita();
    s.giocatori.anna!.mano = [num(1, "a1"), num(2, "a2")];
    s.giocatori.bruno!.mano = [num(3, "b1")];
    const prima = contaCarte(s);
    s = pescaEvento(s, "matrimonio");
    expect(s.giocatori.anna!.mano).toHaveLength(1);
    expect(s.giocatori.bruno!.mano).toHaveLength(0);
    expect(s.giocatori.carla!.mano).toHaveLength(0);
    expect(s.scarti.numeri).toHaveLength(2);
    expect(contaCarte(s)).toEqual(prima);
  });

  it("Matrimonio: la scusa \"Sono a un matrimonio\" torna in mano dopo l'uso", () => {
    let s = attivata(pescaEvento(partita(), "matrimonio"), "anna", "toto-1");
    s.giocatori.bruno!.nascosti = [copia("sono-a-un-matrimonio")];
    s.giocatori.bruno!.mano = [num(1, "b1"), num(2, "b2")];
    s = fai(s, "anna", { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" });
    s = fai(s, "bruno", {
      tipo: "difendi",
      carta: "sono-a-un-matrimonio#1",
      combinazione: [
        { tipo: "numero", id: "b1", valore: 1 },
        { tipo: "numero", id: "b2", valore: 2 },
      ],
    });
    expect(s.giocatori.bruno!.nascosti).toEqual([copia("sono-a-un-matrimonio")]);
    expect(s.giocatori.bruno!.mosseProssimoTurno).toBe(0);
  });

  it("Carnevale di Teora e Sagra: Squacqualacchione sempre carico; Totò bloccato e 1 mossa in meno", () => {
    for (const id of ["carnevale-di-teora", "sagra-delle-tomacelle"]) {
      let s = attivata(attivata(partita(), "anna", "squacqualacchione-1", 1), "anna", "toto-2");
      s = pescaEvento(s, id);
      expect(s.turno.mosseRimaste).toBe(1); // 3 − 1 (pescare) − 1 (ha Totò)
      expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
      expect(rifiutata(s, "anna", { tipo: "potere", carta: "toto-2#1", potere: "brace-accesa", bersaglio: "x" })).toMatch(/Totò/);
      s.giocatori.bruno!.mano = [num(5, "b")];
      s = fai(s, "anna", { tipo: "potere", carta: "squacqualacchione-1#1", potere: "burla", giocatore: "bruno" });
      expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
    }
  });

  it("La Resurrezione: chi ha Totò pesca una carta in più e la dà a chi vuole; Totò non si stanca", () => {
    let s = attivata(partita(), "anna", "toto-1", 1);
    s = pescaEvento(s, "la-resurrezione");
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
    expect(s.turno.attesa).toMatchObject({ tipo: "regalo", giocatore: "anna" });
    expect(vistaGiocatore(s, "bruno").turno.attesa).toBeNull(); // la carta la vede solo anna
    expect(mosseValide(s, "anna")).toHaveLength(3);
    s = fai(s, "anna", { tipo: "regala", giocatore: "carla" });
    expect(s.giocatori.carla!.mano).toHaveLength(1);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "regalo", a: "carla" });
    s = fai(s, "anna", { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" });
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
  });

  it("Funerale: Franchino e Don Pasquale si ricaricano; ognuno passa una carta al giocatore dopo di lui", () => {
    let s = attivata(attivata(partita(), "anna", "franchino", 2), "carla", "don-pasquale", 1);
    s.giocatori.anna!.mano = [num(1, "a")];
    s.giocatori.bruno!.mano = [num(2, "b")];
    s.giocatori.carla!.mano = [num(3, "c")];
    const prima = contaCarte(s);
    s = pescaEvento(s, "funerale");
    expect(s.giocatori.anna!.mano.map((c) => c.id)).toEqual(["c"]);
    expect(s.giocatori.bruno!.mano.map((c) => c.id)).toEqual(["a"]);
    expect(s.giocatori.carla!.mano.map((c) => c.id)).toEqual(["b"]);
    expect(s.giocatori.anna!.attivati[0]!.stanca).toBe(0);
    expect(s.giocatori.carla!.attivati[0]!.stanca).toBe(0);
    expect(contaCarte(s)).toEqual(prima);
  });
});

/* ---------------- Famiglia al completo ---------------- */

describe("Famiglia al completo", () => {
  it("chi ha attivato tutte e 3 le carte della stessa persona prende 2 punti in più", () => {
    const s = attivata(attivata(partita(), "anna", "toto-1"), "anna", "toto-2");
    expect(puntiDi(s.giocatori.anna!)).toBe(3);
    attivata(s, "anna", "toto-3");
    expect(famiglieComplete(s.giocatori.anna!)).toEqual(["toto"]);
    expect(puntiDi(s.giocatori.anna!)).toBe(8); // 1 + 2 + 3 + 2
  });

  it("le carte singole non fanno famiglia", () => {
    const s = attivata(partita(), "anna", "nicole");
    expect(famiglieComplete(s.giocatori.anna!)).toEqual([]);
  });
});

/* ---------------- fine partita ---------------- */

describe("fine partita", () => {
  it("a punti: si può arrivare ai punti anche con un attacco (Vertenza)", () => {
    let s = attivata(partita(), "anna", "giuseppe-3");
    for (const id of ["antonio-3", "maddalena-3", "chicca-3", "toto-3", "checca-3"]) attivata(s, "anna", id); // 18 punti
    attivata(s, "bruno", "generoso-2");
    s = fai(s, "anna", { tipo: "potere", carta: "giuseppe-3#1", potere: "vertenza", giocatore: "bruno", bersaglio: "generoso-2#1" });
    expect(puntiDi(s.giocatori.anna!)).toBe(20);
    expect(s.ultimoTurno).not.toBeNull();
  });

  it("a fine mazzo: quando il mazzo personaggi finisce (senza rimescolare) si gioca l'ultimo giro", () => {
    let s = setup(["anna", "bruno"], { modoFine: "mazzo", puntiPerVincere: 1 }, 5);
    s.ordine = ["anna", "bruno"];
    s.turno.giocatore = "anna";
    s.scarti.personaggi = [...s.scarti.personaggi, ...s.mazzi.personaggi.splice(0, s.mazzi.personaggi.length - 1)];
    s.giocatori.anna!.attivati.push({ copia: copia("toto-3"), stanca: 0 }); // i punti non contano in questo modo
    s = fai(s, "anna", { tipo: "brucia" });
    expect(s.ultimoTurno).toBeNull();
    s = fai(s, "anna", { tipo: "pescaPersonaggio" });
    expect(s.mazzi.personaggi).toHaveLength(0);
    expect(s.ultimoTurno).toBe(3);
    expect(s.registro.find((f) => f.tipo === "ultimoGiro")).toMatchObject({ mazzo: true });
    expect(mosseValide(s, "anna").some((m) => m.tipo === "pescaPersonaggio")).toBe(false);
  });
});
