import { describe, expect, it } from "vitest";
import { banconota, contaCarte, copia, fai, num, partita, rifiutata } from "./aiuti-test";
import { CARTE, carta } from "./carte";
import { BLU_DA_SOLI, POTERI_COPIA } from "./poteri";
import { mossaAutomatica, mosseValide, puntiDi } from "./regole";
import type { Mossa, ParametriPotere, StatoPartita } from "./stato";
import { vistaGiocatore } from "./vista";

/* ---------------- aiuti ---------------- */

/** Partita in cui anna ha attivato (e carica) la carta indicata. */
function conCarta(idCarta: string, s: StatoPartita = partita()): StatoPartita {
  s.giocatori.anna!.attivati.push({ copia: copia(idCarta), stanca: 0 });
  return s;
}

/** Mossa "usa il potere" della carta (primo potere, o quello indicato). */
function potere(idCarta: string, parametri: ParametriPotere = {}, quale?: string): Mossa {
  return { tipo: "potere", carta: `${idCarta}#1`, potere: quale ?? carta(idCarta).poteri[0]!.id, ...parametri };
}

const usa = (s: StatoPartita, idCarta: string, parametri: ParametriPotere = {}, quale?: string) => fai(s, "anna", potere(idCarta, parametri, quale));
const anna = (s: StatoPartita) => s.giocatori.anna!;

/* ---------------- regole comuni ---------------- */

describe("usare un potere", () => {
  it("costa una mossa (salvo i poteri gratis) e la carta diventa stanca per il suo tempo di ricarica", () => {
    let s = conCarta("generoso-2"); // Colazione, ricarica 2
    s = usa(s, "generoso-2");
    expect(s.turno.mosseRimaste).toBe(2);
    expect(anna(s).attivati[0]!.stanca).toBe(2);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "potere", carta: "generoso-2", potere: "colazione" });

    let t = conCarta("nonna-dina-1"); // Cambiamo un po'…: gratis, ma la carta si stanca
    t = usa(t, "nonna-dina-1");
    expect(t.turno.mosseRimaste).toBe(3);
    expect(anna(t).attivati[0]!.stanca).toBe(1);
  });

  it("una carta stanca non si usa; si ricarica a inizio dei propri turni", () => {
    let s = conCarta("generoso-3"); // ricarica 3
    s = usa(s, "generoso-3", { scelte: ["birra", "caffe"] });
    expect(rifiutata(s, "anna", potere("generoso-3", { scelte: ["birra", "caffe"] }))).toMatch(/stanca/);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere")).toBe(false);
    for (let giro = 0; giro < 3; giro++) {
      for (const _ of s.ordine) {
        s.turno.mosseRimaste = 0;
        s.turno.mosseUguali = null;
        s.giocatori[s.turno.giocatore]!.mano = [];
        s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
      }
    }
    expect(anna(s).attivati[0]!.stanca).toBe(0);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere")).toBe(true);
  });

  it("solo i poteri dei propri personaggi attivati; le difese che si usano quando si è attaccati no", () => {
    const s = partita();
    s.giocatori.bruno!.attivati.push({ copia: copia("nonna-dina-1"), stanca: 0 });
    expect(rifiutata(s, "anna", potere("nonna-dina-1"))).toMatch(/attivati/);
    s.giocatori.anna!.nascosti.push(copia("generoso-1"));
    expect(rifiutata(s, "anna", potere("generoso-1"))).toMatch(/attivati/);
    conCarta("antonio-3", s); // Per me è quadrato: difesa
    expect(rifiutata(s, "anna", potere("antonio-3"))).toMatch(/quando ti attaccano/);
  });

  it("ogni potere di aiuto si può usare e le carte non si perdono", () => {
    const aiuti = CARTE.flatMap((c) =>
      c.poteri.filter((p) => p.tipo === "aiuto" && !POTERI_COPIA.has(p.id) && !BLU_DA_SOLI.has(p.id)).map((p) => ({ c, p })),
    );
    expect(aiuti.length).toBeGreaterThan(25);
    for (const { c, p } of aiuti) {
      const s = conCarta(c.id);
      // un po' di tutto, perché ogni potere trovi qualcosa da fare
      const g = anna(s);
      g.mano = [num(1, "h1"), num(2, "h2"), num(5, "h5")];
      g.nascosti = [copia("paesano"), copia("antonio-1")];
      g.attivati.push({ copia: copia("toto-2"), stanca: 2 });
      s.scarti.numeri = [num(4, "s4"), num(6, "s6")];
      s.scarti.personaggi = [copia("zia-diana")];
      s.turno.ultimaMossa = "pescaNumero";
      s.turno.appenaPescata = { mazzo: "numeri", id: "h2" };
      s.turno.primaPescata = "numeri";
      const prima = contaCarte(s);
      const mosse = mosseValide(s, "anna").filter((m) => m.tipo === "potere" && m.potere === p.id);
      expect(mosse.length, p.id).toBeGreaterThan(0);
      for (const m of mosse) expect(contaCarte(fai(s, "anna", m)), p.id).toEqual(prima);
    }
  });
});

/* ---------------- mosse in più ---------------- */

describe("mosse in più", () => {
  it("Domani lo faccio: 1 mossa ora, 2 in più nel prossimo turno", () => {
    let s = usa(conCarta("antonio-1"), "antonio-1");
    expect(anna(s).mosseProssimoTurno).toBe(2);
    for (const _ of s.ordine) {
      s.turno.mosseRimaste = 0;
      s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
    }
    expect(s.turno.giocatore).toBe("anna");
    expect(s.turno.mosseRimaste).toBe(5);
    expect(anna(s).mosseProssimoTurno).toBe(0);
  });

  it("Stai di nuovo qua? / È l'ultima volta che venite!: gratis, mosse in più solo uguali all'ultima", () => {
    let s = conCarta("nonno-salvatore-2");
    expect(rifiutata(s, "anna", potere("nonno-salvatore-2"))).toMatch(/mossa da ripetere/);
    s = fai(s, "anna", { tipo: "pescaNumero" });
    s = usa(s, "nonno-salvatore-2");
    expect(s.turno.mosseRimaste).toBe(2); // non costa mosse
    expect(s.turno.mosseUguali).toEqual({ tipo: "pescaNumero", quante: 2 });
    s = fai(s, "anna", { tipo: "pescaNumero" }); // usa una mossa "uguale"
    expect(s.turno.mosseRimaste).toBe(2);
    s = fai(s, "anna", { tipo: "brucia" });
    s = fai(s, "anna", { tipo: "brucia" }); // finite le mosse normali
    expect(s.turno.mosseRimaste).toBe(0);
    expect(mosseValide(s, "anna").every((m) => m.tipo === "pescaNumero" || m.tipo === "fineTurno")).toBe(true);
    expect(rifiutata(s, "anna", { tipo: "brucia" })).toMatch(/finito le mosse/);
    expect(mossaAutomatica(s)).toBeNull();
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(s.turno.mosseUguali?.quante).toBe(0);
    expect(anna(s).mano).toHaveLength(3);
  });

  it("Che palle lavoro: finito il turno ne fa subito un altro con 2 mosse", () => {
    let s = usa(conCarta("marika-3"), "marika-3");
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.giocatore).toBe("anna");
    expect(s.turno.mosseRimaste).toBe(2);
    expect(s.turno.doppioTurno).toBe(false);
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.giocatore).toBe("bruno");
  });
});

/* ---------------- pescare ---------------- */

describe("pescare", () => {
  it("Chissà se sta roba basta: tu 4 carte, ogni avversario 1", () => {
    const s = usa(conCarta("nonna-dina-3"), "nonna-dina-3");
    expect(anna(s).mano).toHaveLength(4);
    expect(s.giocatori.bruno!.mano).toHaveLength(1);
    expect(s.giocatori.carla!.mano).toHaveLength(1);
  });

  it("Colazione: 1 personaggio e 2 carte numero", () => {
    const s = usa(conCarta("generoso-2"), "generoso-2");
    expect(anna(s).mano).toHaveLength(2);
    expect(anna(s).nascosti.length + anna(s).attacchi.length).toBe(1);
  });

  it("Offre la casa: 2 voci diverse del menu", () => {
    const s = usa(conCarta("generoso-3"), "generoso-3", { scelte: ["caffe", "birra"] });
    expect(s.turno.mosseRimaste).toBe(4);
    expect(anna(s).mano).toHaveLength(2);
    expect(rifiutata(conCarta("generoso-3"), "anna", potere("generoso-3", { scelte: ["caffe", "caffe"] }))).toMatch(/2 voci diverse/);
  });

  it("Mo faccio due cotolette: scarti le carte che vuoi e ne peschi altrettante più una", () => {
    let s = conCarta("nonna-dina-2");
    anna(s).mano = [num(1, "a"), num(2, "b"), num(3, "c")];
    s = usa(s, "nonna-dina-2", { carte: ["a", "b"] });
    expect(anna(s).mano).toHaveLength(4);
    expect(s.scarti.numeri.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("Lezione di padel (blu): gratis, una volta per turno, scambi una tua carta con una del tavolo", () => {
    let s = conCarta("francesco-1");
    anna(s).mano = [num(2, "mia")];
    const sulTavolo = s.tavolo.numeri[0]!;
    if (sulTavolo.valore === 2) s.tavolo.numeri[0] = { ...sulTavolo, valore: 5 };
    const tavolo = s.tavolo.numeri[0]!;
    s = usa(s, "francesco-1", { carte: ["mia"], posizioni: [0] });
    expect(anna(s).mano).toEqual([tavolo]);
    expect(s.tavolo.numeri[0]!.id).toBe("mia");
    expect(s.turno.mosseRimaste).toBe(3);
    expect(anna(s).attivati[0]!.stanca).toBe(0);
    expect(rifiutata(s, "anna", potere("francesco-1", { carte: [tavolo.id], posizioni: [1] }))).toMatch(/una volta per turno/);
  });

});

/* ---------------- tavolo e scarti ---------------- */

describe("tavolo e scarti", () => {
  it("Cambiamo un po'…: cambiano tutte le carte scoperte", () => {
    const s = conCarta("nonna-dina-1");
    const dopo = usa(s, "nonna-dina-1");
    expect(dopo.scarti.numeri).toEqual(s.tavolo.numeri);
    expect(dopo.scarti.personaggi).toEqual(s.tavolo.personaggi);
  });

  it("Scaffale: prendi 2 carte numero dal tavolo", () => {
    const s = conCarta("donatina-1");
    const dopo = usa(s, "donatina-1", { posizioni: [0, 3] });
    expect(anna(dopo).mano).toEqual([s.tavolo.numeri[0], s.tavolo.numeri[3]]);
    expect(rifiutata(s, "anna", potere("donatina-1", { posizioni: [1] }))).toMatch(/2 carte/);
  });

  it("Lezione di padel: scambi una tua carta numero con una del tavolo", () => {
    const s = conCarta("francesco-1");
    anna(s).mano = [num(8, "mia")];
    const sulTavolo = s.tavolo.numeri[1]!;
    const dopo = usa(s, "francesco-1", { carte: ["mia"], posizioni: [1] });
    expect(anna(dopo).mano).toEqual([sulTavolo]);
    expect(dopo.tavolo.numeri[1]!.id).toBe("mia");
  });

  it("Ce l'ho io!: cerchi nel mazzo il numero che vuoi; se non c'è, niente", () => {
    let s = conCarta("donatina-2");
    s = usa(s, "donatina-2", { valore: 7 });
    expect(anna(s).mano.map((c) => c.valore)).toEqual([7]);
    let t = conCarta("donatina-2");
    t.mazzi.numeri = t.mazzi.numeri.filter((c) => c.valore !== 7);
    t = usa(t, "donatina-2", { valore: 7 });
    expect(anna(t).mano).toEqual([]);
  });
});

/* ---------------- scelte tra carte ---------------- */

describe("scelte tra carte", () => {
  it("Frutta e verdura!: scopri 4 carte (le vedono tutti), ne prendi 2, il resto va negli scarti", () => {
    let s = usa(conCarta("vincenzo"), "vincenzo");
    expect(s.turno.attesa).toMatchObject({ tipo: "scegliNumeri", motivo: "frutta", quante: 2 });
    const offerta = vistaGiocatore(s, "bruno").offerta;
    expect(offerta).toHaveLength(4);
    s = fai(s, "anna", { tipo: "scegli", carte: [offerta[0]!.id, offerta[2]!.id] });
    expect(anna(s).mano).toEqual([offerta[0], offerta[2]]);
    expect(s.scarti.numeri).toEqual([offerta[1], offerta[3]]);
    expect(s.turno.attesa).toBeNull();
  });

  it("Ho fatto le patate: tante carte quanti i giocatori; chi la usa ne prende 2, poi gli altri 1; l'ultimo resta senza", () => {
    let s = usa(conCarta("nonna-maddalena-3"), "nonna-maddalena-3");
    const a = s.turno.attesa!;
    expect(a).toMatchObject({ tipo: "scegliNumeri", motivo: "patate", giocatore: "anna", quante: 2, coda: ["bruno", "carla"] });
    const patate = vistaGiocatore(s, "carla").offerta;
    expect(patate).toHaveLength(3);
    expect(rifiutata(s, "anna", { tipo: "scegli", carte: [patate[1]!.id] })).toMatch(/2 carte/);
    s = fai(s, "anna", { tipo: "scegli", carte: [patate[1]!.id, patate[2]!.id] });
    expect(anna(s).mano).toHaveLength(2);
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/altro giocatore/);
    expect(mosseValide(s, "bruno")).toEqual([{ tipo: "scegli", carte: [patate[0]!.id] }]);
    s = fai(s, "bruno", { tipo: "scegli", carte: [patate[0]!.id] });
    expect(s.turno.attesa).toBeNull();
    expect(s.giocatori.carla!.mano).toEqual([]);
    expect(s.turno.giocatore).toBe("anna");
  });

  it("Ogni cosa al suo posto: delle prime 5 carte del mazzo numeri ne tieni 1, le altre tornano nell'ordine scelto", () => {
    let s = usa(conCarta("nonna-maddalena-1"), "nonna-maddalena-1");
    const prime = vistaGiocatore(s, "anna").offerta;
    expect(prime).toHaveLength(5);
    expect(s.turno.attesa).toMatchObject({ tipo: "scegliNumeri", motivo: "posto", quante: 1 });
    s = fai(s, "anna", { tipo: "scegli", carte: [prime[2]!.id] });
    expect(anna(s).mano).toEqual([prime[2]]);
    const carte = s.turno.attesa!.tipo === "riordina" ? s.turno.attesa!.carte : [];
    expect(carte).toHaveLength(4);
    const ordine = [carte[3]!.id, carte[0]!.id, carte[2]!.id, carte[1]!.id];
    s = fai(s, "anna", { tipo: "riordina", ordine });
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(anna(s).mano[1]!.id).toBe(ordine[0]);
    expect(s.mazzi.numeri.at(-1)!.id).toBe(ordine[1]);
  });
});

/* ---------------- carte numero in mano ---------------- */

describe("carte numero in mano", () => {
  it("Fatto in casa: 2 carte unite in una sola che vale la somma; usata o scartata, se ne vanno tutte e due", () => {
    let s = conCarta("maddalena-1");
    anna(s).mano = [num(3, "a"), num(4, "b")];
    anna(s).nascosti = [copia("zio-salvatore-1")]; // attacco: va in attesa… qui basta un codice: 77
    anna(s).attacchi = [copia("zio-salvatore-1")];
    anna(s).nascosti = [];
    expect(rifiutata(s, "anna", potere("maddalena-1", { carte: ["a"] }, "fatto-in-casa"))).toMatch(/2 carte/);
    s = usa(s, "maddalena-1", { carte: ["a", "b"] }, "fatto-in-casa");
    expect(anna(s).mano).toHaveLength(1);
    const casa = anna(s).mano[0]!;
    expect(casa.valore).toBe(7);
    anna(s).mano.push(num(7, "c"));
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "zio-salvatore-1#1",
      combinazione: [
        { tipo: "numero", id: casa.id, valore: 7 },
        { tipo: "numero", id: "c", valore: 7 },
      ],
    });
    expect(s.scarti.numeri.map((c) => c.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("Fatto in casa: la somma è al massimo 8", () => {
    const s = conCarta("maddalena-1");
    anna(s).mano = [num(5, "a"), num(4, "b")];
    expect(rifiutata(s, "anna", potere("maddalena-1", { carte: ["a", "b"] }, "fatto-in-casa"))).toMatch(/massimo 8/);
  });

  it("Diavolina: ricarica 2 altre tue carte stanche (o 1 se è l'unica; non sé stessa)", () => {
    let s = conCarta("toto-2");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 });
    expect(rifiutata(s, "anna", potere("toto-2", { bersagli: ["toto-2#1"] }))).toMatch(/un'altra/);
    s = usa(s, "toto-2", { bersagli: ["generoso-3#1"] });
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([2, 0]);

    let t = conCarta("toto-2");
    anna(t).attivati.push({ copia: copia("generoso-3"), stanca: 3 }, { copia: copia("generoso-2"), stanca: 1 });
    expect(rifiutata(t, "anna", potere("toto-2", { bersagli: ["generoso-3#1"] }))).toMatch(/2 altre/);
    t = usa(t, "toto-2", { bersagli: ["generoso-3#1", "generoso-2#1"] });
    expect(anna(t).attivati.map((a) => a.stanca)).toEqual([2, 0, 0]);
  });

  it("O al sangue o niente: ricarica tutte le altre tue carte; poi si stanca lei", () => {
    let s = conCarta("toto-3");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 }, { copia: copia("generoso-2"), stanca: 1 });
    s = usa(s, "toto-3");
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([3, 0, 0]);
    expect(s.turno.mosseRimaste).toBe(3); // gratis
  });

  it("Puzza di brace (Chicca 1, anche stanca): Diavolina di un avversario ricarica 1 carta sola e Chicca pesca 1 carta", () => {
    let s = conCarta("toto-2");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 }, { copia: copia("generoso-2"), stanca: 1 });
    s.giocatori.bruno!.attivati.push({ copia: copia("chicca-1"), stanca: 1 });
    expect(rifiutata(s, "anna", potere("toto-2", { bersagli: ["generoso-3#1", "generoso-2#1"] }))).toMatch(/un'altra/);
    expect(mosseValide(s, "anna").filter((m) => m.tipo === "potere" && m.potere === "brace-accesa")).toHaveLength(2);
    s = usa(s, "toto-2", { bersagli: ["generoso-3#1"] });
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([2, 0, 1]);
    expect(s.giocatori.bruno!.mano).toHaveLength(1);
    expect(s.registro).toContainEqual(expect.objectContaining({ tipo: "potere", giocatore: "bruno", potere: "puzza-di-brace" }));
  });

  it("Puzza di brace: O al sangue o niente di un avversario lascia stanca 1 carta; la propria Chicca no", () => {
    let s = conCarta("toto-3");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 }, { copia: copia("generoso-2"), stanca: 1 });
    s.giocatori.carla!.attivati.push({ copia: copia("chicca-1"), stanca: 0 });
    s = usa(s, "toto-3");
    expect(anna(s).attivati.slice(1).filter((a) => a.stanca > 0)).toHaveLength(1);
    expect(s.giocatori.carla!.mano).toHaveLength(1);
    // la Chicca di chi usa O al sangue o niente non conta
    let t = conCarta("toto-3");
    anna(t).attivati.push({ copia: copia("chicca-1"), stanca: 1 }, { copia: copia("generoso-2"), stanca: 1 });
    t = usa(t, "toto-3");
    expect(anna(t).attivati.map((a) => a.stanca)).toEqual([3, 0, 0]);
  });

  it("Aperitivo e Puzza di brace non si usano come una mossa: funzionano da sole", () => {
    let s = conCarta("chicca-2");
    s = conCarta("chicca-1", s);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere")).toBe(false);
    expect(rifiutata(s, "anna", potere("chicca-2"))).toMatch(/da sola/);
  });

  it("Stuffosa: quando un avversario usa un aiuto il gioco aspetta Checca; lasciando stare l'aiuto funziona", () => {
    let s = conCarta("toto-3"); // O al sangue o niente
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 });
    s.giocatori.bruno!.attivati.push({ copia: copia("checca-3"), stanca: 0 });
    s.giocatori.bruno!.mano = [num(1, "b1"), num(2, "b2"), num(3, "b3")];
    s = usa(s, "toto-3");
    expect(s.turno.attesa).toEqual({ tipo: "stuffosa", giocatore: "bruno", di: "anna", carta: "toto-3", potere: "grigliata" });
    expect(vistaGiocatore(s, "carla").turno.aiutoSospeso).toEqual({ di: "anna", carta: "toto-3", potere: "grigliata" });
    expect(vistaGiocatore(s, "carla").turno.attesa).toBeNull();
    expect(anna(s).attivati[1]!.stanca).toBe(3); // non ancora ricaricata
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/altro giocatore/);
    expect(mosseValide(s, "bruno")[0]).toEqual({ tipo: "scegli", carte: [] });
    s = fai(s, "bruno", { tipo: "scegli", carte: [] });
    expect(s.turno.attesa).toBeNull();
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([3, 0]);
    expect(s.giocatori.bruno!.mano).toHaveLength(3);
  });

  it("Stuffosa: Checca scarta 2 carte, l'aiuto non ha effetto (mossa spesa, carta stanca) e Stuffosa resta stanca 4 turni", () => {
    let s = conCarta("christian");
    s = conCarta("vincenzo", s);
    s.giocatori.bruno!.attivati.push({ copia: copia("checca-3"), stanca: 0 });
    s.giocatori.bruno!.mano = [num(1, "b1"), num(2, "b2"), num(3, "b3")];
    s = usa(s, "vincenzo"); // Frutta e verdura!
    expect(rifiutata(s, "bruno", { tipo: "scegli", carte: ["b1"] })).toMatch(/2 carte/);
    s = fai(s, "bruno", { tipo: "scegli", carte: ["b1", "b2"] });
    expect(s.turno.attesa).toBeNull();
    expect(s.giocatori.bruno!.mano.map((c) => c.id)).toEqual(["b3"]);
    expect(s.giocatori.bruno!.attivati[0]!.stanca).toBe(4);
    expect(anna(s).mano).toHaveLength(0);
    expect(anna(s).attivati[1]!.stanca).toBe(1);
    expect(s.turno.mosseRimaste).toBe(2);
    expect(s.registro).toContainEqual(expect.objectContaining({ tipo: "sbuffa", giocatore: "bruno", a: "anna", potere: "frutta-e-verdura" }));
    expect(s.giocatori.bruno!.puntiPoteri).toBe(1); // come una difesa riuscita
  });

  it("Stuffosa non si ferma ad aspettare se è stanca, se Checca ha meno di 2 carte o per i propri aiuti; non ferma gli attacchi", () => {
    const prova = (chi: string, stanca: number, carte: number) => {
      let s = conCarta("toto-3");
      s.giocatori[chi]!.attivati.push({ copia: copia("checca-3"), stanca });
      s.giocatori[chi]!.mano = [num(1, "c1"), num(2, "c2"), num(3, "c3")].slice(0, carte);
      s = usa(s, "toto-3");
      return s.turno.attesa;
    };
    expect(prova("bruno", 1, 3)).toBeNull();
    expect(prova("bruno", 0, 1)).toBeNull();
    expect(prova("anna", 0, 3)).toBeNull();
    let s = conCarta("toto-1"); // Freeeeeezee (attacco)
    s.giocatori.bruno!.attivati.push({ copia: copia("checca-3"), stanca: 0 });
    s.giocatori.bruno!.mano = [num(1, "b1"), num(2, "b2")];
    s = usa(s, "toto-1", { giocatore: "bruno" });
    expect(s.turno.attesa).toBeNull();
    expect(s.giocatori.bruno!.mosseProssimoTurno).toBe(-1);
  });

  it("Stuffosa: un aiuto con scelte sbagliate viene rifiutato subito, senza far aspettare Checca", () => {
    const s = conCarta("toto-2"); // Diavolina, senza carte stanche da ricaricare
    s.giocatori.bruno!.attivati.push({ copia: copia("checca-3"), stanca: 0 });
    s.giocatori.bruno!.mano = [num(1, "b1"), num(2, "b2")];
    expect(rifiutata(s, "anna", potere("toto-2", { bersagli: ["x#1"] }))).toMatch(/stanca/);
  });

  it("Total black: brucia le carte scoperte; per un giro il tavolo resta vuoto e si pesca solo dal mazzo; poi Maddalena lo trova pieno", () => {
    let s = conCarta("maddalena-2");
    const numeri = s.tavolo.numeri.filter((c) => c !== null).length;
    const personaggi = s.tavolo.personaggi.filter((c) => c !== null).length;
    s = usa(s, "maddalena-2");
    expect(s.tavolo.numeri.every((c) => c === null) && s.tavolo.personaggi.every((c) => c === null)).toBe(true);
    expect(s.scarti.numeri).toHaveLength(numeri);
    expect(s.scarti.personaggi).toHaveLength(personaggi);
    expect(vistaGiocatore(s, "bruno").buio).toBe("anna");
    s = fai(s, "anna", { tipo: "pescaNumero" }); // anche pescando il tavolo non si riempie
    expect(s.tavolo.numeri.every((c) => c === null)).toBe(true);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "brucia" || m.tipo === "prendiNumero")).toBe(false);
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.tavolo.numeri.every((c) => c === null)).toBe(true); // tocca a bruno: ancora buio
    expect(mosseValide(s, "bruno").some((m) => m.tipo === "prendiNumero" || m.tipo === "prendiPersonaggio")).toBe(false);
    for (const chi of ["bruno", "carla"]) {
      s.turno.mosseRimaste = 0;
      s = fai(s, chi, { tipo: "fineTurno", scarta: s.giocatori[chi]!.mano.slice(7).map((c) => c.id) });
    }
    expect(s.turno.giocatore).toBe("anna");
    expect(s.buio).toBeNull();
    expect(s.tavolo.numeri.some((c) => c !== null)).toBe(true);
    expect(s.tavolo.personaggi.some((c) => c !== null)).toBe(true);
  });

  it("Ricetta: ricarica una carta stanca di chiunque, anche di un avversario", () => {
    let s = conCarta("dottor-racioppi");
    s.giocatori.bruno!.attivati.push({ copia: copia("generoso-3"), stanca: 2 });
    s = usa(s, "dottor-racioppi", { bersaglio: "generoso-3#1" });
    expect(s.giocatori.bruno!.attivati[0]!.stanca).toBe(0);
    expect(anna(s).mano).toHaveLength(1); // e peschi 1 carta numero
    expect(s.registro.at(-1)).toMatchObject({ bersaglio: "bruno" });
  });

  it("Fammi leggere le carte: per tutto il turno vedi le carte in mano di un avversario", () => {
    let s = conCarta("giuseppe-1");
    s.giocatori.bruno!.mano = [num(6, "x")];
    s.giocatori.bruno!.nascosti = [copia("taurasi")];
    expect(vistaGiocatore(s, "anna").fascicolo).toBeUndefined();
    s = usa(s, "giuseppe-1", { giocatore: "bruno" });
    expect(vistaGiocatore(s, "anna").fascicolo).toEqual({ giocatore: "bruno", mano: [num(6, "x")], nascosti: [copia("taurasi")] });
    expect(vistaGiocatore(s, "carla").fascicolo).toBeUndefined();
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(vistaGiocatore(s, "anna").fascicolo).toBeUndefined();
  });
});

describe("mancia e livello 3 insieme ai poteri", () => {
  it("la mancia ricevuta si può usare subito", () => {
    const s = conCarta("nonna-dina-1");
    anna(s).mancia = [banconota(4, "m4")];
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere")).toBe(true);
  });
});

/* ---------------- carte blu (sempre attive, una volta per turno) ---------------- */

/** Chiude il turno di chi è di turno, fino a tornare ad anna. */
function giro(s: StatoPartita): StatoPartita {
  for (const _ of s.ordine) {
    s.turno.mosseRimaste = 0;
    s.turno.mosseUguali = null;
    s.giocatori[s.turno.giocatore]!.mano = s.turno.giocatore === "anna" ? anna(s).mano : [];
    s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: mosseValide(s, s.turno.giocatore).find((m) => m.tipo === "fineTurno")?.scarta ?? [] });
  }
  return s;
}

describe("carte blu", () => {
  it("non si stancano e gli attacchi non le possono far stancare", () => {
    const s = conCarta("generoso-1");
    s.giocatori.bruno!.attivati.push({ copia: copia("zio-salvatore-2"), stanca: 0 }); // Assaggia questo vino
    s.turno.giocatore = "bruno";
    expect(rifiutata(s, "bruno", { tipo: "potere", carta: "zio-salvatore-2#1", potere: "versa-il-vino", giocatore: "anna", bersaglio: "generoso-1#1" })).toMatch(/carica/);
  });

  it("Un caffè: 3 turni con 4 mosse, poi 1 turno con 2 mosse, e si ricomincia (4, 4, 4, 2, 4…)", () => {
    let s = conCarta("generoso-1");
    expect(rifiutata(s, "anna", potere("generoso-1"))).toMatch(/sempre attiva/);
    const mosse: number[] = [];
    for (let i = 0; i < 5; i++) {
      s = giro(s);
      expect(s.turno.giocatore).toBe("anna");
      mosse.push(s.turno.mosseRimaste);
    }
    expect(mosse).toEqual([4, 4, 4, 2, 4]);
  });

  it("Un caffè: il turno in cui si attiva conta come il primo dei 3 con la mossa in più", () => {
    let s = partita();
    anna(s).nascosti = [copia("generoso-1")];
    anna(s).mano = [num(8, "a"), num(8, "b"), num(3, "c"), num(3, "d")]; // 88 + una coppia
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 8 },
        { tipo: "numero", id: "b", valore: 8 },
        { tipo: "numero", id: "c", valore: 3 },
        { tipo: "numero", id: "d", valore: 3 },
      ],
    });
    expect(s.turno.mosseRimaste).toBe(3);
    const mosse: number[] = [];
    for (let i = 0; i < 3; i++) {
      s = giro(s);
      mosse.push(s.turno.mosseRimaste);
    }
    expect(mosse).toEqual([4, 4, 2]);
  });

  it("Questi so della campagna: a inizio di ogni tuo turno peschi 1 carta numero", () => {
    let s = conCarta("nonno-nicola-1");
    anna(s).mano = [];
    s = giro(s);
    expect(anna(s).mano).toHaveLength(1);
  });

  it("Cin cin: una volta per turno attivi un personaggio col codice di un'altra tua carta, al massimo 1 livello di differenza", () => {
    let s = conCarta("claudia-1");
    // Nonna Dina 1: 2 carte con somma 7 (livello 1); Antonio 2: livello 2; Antonio 3: livello 3
    anna(s).nascosti = [copia("antonio-2"), copia("antonio-3"), copia("nonna-dina-1")];
    anna(s).mano = [num(3, "a"), num(4, "b"), num(2, "c"), num(5, "d")];
    const colCodiceDiDina = (cartaDaAttivare: string, a: string, b: string, va: number, vb: number): Mossa => ({
      tipo: "attiva",
      carta: cartaDaAttivare,
      codiceDi: "nonna-dina-1#1",
      combinazione: [
        { tipo: "numero", id: a, valore: va },
        { tipo: "numero", id: b, valore: vb },
      ],
    });
    // livello 3 col codice di un livello 1: 2 livelli di differenza, no
    expect(mosseValide(s, "anna")).not.toContainEqual(expect.objectContaining({ carta: "antonio-3#1", codiceDi: "nonna-dina-1#1" }));
    expect(rifiutata(s, "anna", colCodiceDiDina("antonio-3#1", "a", "b", 3, 4))).toMatch(/1 livello di differenza/);
    // livello 2 col codice di un livello 1: sì
    expect(mosseValide(s, "anna")).toContainEqual(expect.objectContaining({ carta: "antonio-2#1", codiceDi: "nonna-dina-1#1" }));
    s = fai(s, "anna", colCodiceDiDina("antonio-2#1", "a", "b", 3, 4));
    expect(anna(s).attivati.map((x) => x.copia.carta)).toContain("antonio-2");
    // una volta per turno
    expect(rifiutata(s, "anna", { ...colCodiceDiDina("antonio-3#1", "c", "d", 2, 5), codiceDi: "antonio-2#1" } as Mossa)).toMatch(/Cin cin/);
  });

  it("Sono due etti e mezzo, lascio?: se la prima mossa è una pescata, la rifai gratis", () => {
    let s = conCarta("sara-e-giuseppe-1");
    expect(rifiutata(s, "anna", potere("sara-e-giuseppe-1"))).toMatch(/prima mossa/);
    s = fai(s, "anna", { tipo: "pescaPersonaggio" });
    s = usa(s, "sara-e-giuseppe-1");
    expect(anna(s).nascosti.length + anna(s).attacchi.length).toBe(2);
    expect(s.turno.mosseRimaste).toBe(2);
    expect(rifiutata(s, "anna", potere("sara-e-giuseppe-1"))).toMatch(/una volta per turno/);

    let t = conCarta("sara-e-giuseppe-1");
    t = fai(t, "anna", { tipo: "brucia" });
    t = fai(t, "anna", { tipo: "pescaNumero" });
    expect(rifiutata(t, "anna", potere("sara-e-giuseppe-1"))).toMatch(/prima mossa/);
  });

  it("La vita è una ruota: il senso del gioco si inverte, dopo di te gioca chi giocava prima; i giri si contano come prima", () => {
    let s = partita(); // anna → bruno → carla
    s.turno.mosseRimaste = 1;
    s = usa(conCarta("nonna-patrizia-1", s), "nonna-patrizia-1");
    expect(s.ordine).toEqual(["anna", "carla", "bruno"]);
    expect(vistaGiocatore(s, "bruno").antiorario).toBe(true);
    expect(anna(s).attivati[0]!.stanca).toBe(1);
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.giocatore).toBe("carla");
    // se la usa anche carla, si torna in senso orario: dopo di lei gioca di nuovo anna
    s.giocatori.carla!.attivati.push({ copia: copia("nonna-patrizia-1", 2), stanca: 0 });
    s = fai(s, "carla", { tipo: "potere", carta: "nonna-patrizia-1#2", potere: "la-vita-e-una-ruota" });
    expect(s.ordine).toEqual(["bruno", "carla", "anna"]);
    expect(s.turno.giocatore).toBe("carla");
    expect(vistaGiocatore(s, "bruno").antiorario).toBe(false);
  });

  it("La vita è una ruota in 2 giocatori: vi scambiate 1 carta numero a caso; non si usa durante l'ultimo giro", () => {
    let s = conCarta("nonna-patrizia-1", partita(2));
    anna(s).mano = [num(1, "a1")];
    s.giocatori.bruno!.mano = [num(8, "b8")];
    s = usa(s, "nonna-patrizia-1");
    expect(s.ordine).toEqual(["anna", "bruno"]);
    expect(anna(s).mano.map((c) => c.id)).toEqual(["b8"]);
    expect(s.giocatori.bruno!.mano.map((c) => c.id)).toEqual(["a1"]);

    const vuota = conCarta("nonna-patrizia-1", partita(2));
    vuota.giocatori.bruno!.mano = [num(8, "b8")];
    expect(mosseValide(vuota, "anna").some((m) => m.tipo === "potere")).toBe(false);
    expect(rifiutata(vuota, "anna", potere("nonna-patrizia-1"))).toMatch(/tutti e due/);

    const ultimo = conCarta("nonna-patrizia-1");
    ultimo.ultimoTurno = 5;
    expect(mosseValide(ultimo, "anna").some((m) => m.tipo === "potere")).toBe(false);
    expect(rifiutata(ultimo, "anna", potere("nonna-patrizia-1"))).toMatch(/ultimo giro/);
  });

  it("Fammi leggere le carte: una volta per turno, gratis", () => {
    let s = conCarta("giuseppe-1");
    s = usa(s, "giuseppe-1", { giocatore: "bruno" });
    expect(s.turno.mosseRimaste).toBe(3);
    expect(vistaGiocatore(s, "anna").fascicolo?.giocatore).toBe("bruno");
    expect(rifiutata(s, "anna", potere("giuseppe-1", { giocatore: "carla" }))).toMatch(/una volta per turno/);
  });

  it("Ne ho viste tante: vedi le prime 2 carte del mazzo personaggi e una volta per turno prendi la seconda", () => {
    let s = conCarta("nonno-antonio-1");
    const [prima, seconda] = s.mazzi.personaggi.slice(-2).reverse();
    expect(vistaGiocatore(s, "anna").cimaPersonaggi).toEqual([prima, seconda]);
    expect(vistaGiocatore(s, "bruno").cimaPersonaggi).toBeUndefined();
    s = fai(s, "anna", { tipo: "pescaPersonaggio", seconda: true });
    expect([...anna(s).nascosti, ...anna(s).attacchi]).toEqual([seconda]);
    expect(s.mazzi.personaggi.at(-1)).toEqual(prima);
    expect(rifiutata(s, "anna", { tipo: "pescaPersonaggio", seconda: true })).toMatch(/solo la prima/);
  });

  it("Sono il Party's King: gratis, 3 mosse in più adesso e poi 1 in meno nei 2 turni successivi", () => {
    let s = usa(conCarta("zio-salvatore-3"), "zio-salvatore-3");
    expect(s.turno.mosseRimaste).toBe(6);
    s = giro(s);
    expect(s.turno.mosseRimaste).toBe(2);
    s = giro(s);
    expect(s.turno.mosseRimaste).toBe(2);
    s = giro(s);
    expect(s.turno.mosseRimaste).toBe(3);
  });

  it("Mangia mangia mangia: gratis, 4 carte alla cieca; poi per 2 turni a fine turno si scarta sempre 1 carta in più", () => {
    let s = conCarta("alessia");
    s = usa(s, "alessia");
    expect(anna(s).mano).toHaveLength(4);
    expect(s.turno.mosseRimaste).toBe(3);
    s.turno.mosseRimaste = 0;
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "fineTurno", scarta: [] }); // nel turno stesso niente indigestione
    s = giro(s);
    // anna: 4 carte, limite 7, ma con l'indigestione ne scarta 1
    s.turno.mosseRimaste = 0;
    expect(mosseValide(s, "anna").find((m) => m.tipo === "fineTurno")).toMatchObject({ scarta: [expect.any(String)] });
    expect(mossaAutomatica(s)).toBeNull();
  });
});

describe("Simone e Annalisa (aiuti)", () => {
  it("Pranzo a domicilio: 2 carte numero, poi se vuoi scambi 1 carta della mano con una del tavolo", () => {
    let s = conCarta("simone-1");
    s = usa(s, "simone-1");
    expect(anna(s).mano).toHaveLength(2);
    expect(s.turno.attesa).toEqual({ tipo: "scambiaTavolo", giocatore: "anna" });
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "scegli", carte: [] });
    const scambio = mosseValide(s, "anna").find((m) => m.tipo === "scegli" && m.carte.length === 2) as Extract<Mossa, { tipo: "scegli" }>;
    const [mia, delTavolo] = scambio.carte;
    s = fai(s, "anna", scambio);
    expect(anna(s).mano.map((c) => c.id)).toContain(delTavolo);
    expect(anna(s).mano.map((c) => c.id)).not.toContain(mia);
    expect(s.tavolo.numeri.some((c) => c?.id === mia)).toBe(true);
    expect(s.turno.attesa).toBeNull();

    let t = usa(conCarta("simone-1"), "simone-1");
    const mano = anna(t).mano;
    t = fai(t, "anna", { tipo: "scegli", carte: [] });
    expect(anna(t).mano).toEqual(mano);
  });

  it("Medico in famiglia: Racioppi e Zia Diana si attivano senza codice (con la mossa); gli altri no", () => {
    let s = conCarta("annalisa-2");
    anna(s).nascosti = [copia("zia-diana"), copia("antonio-1")];
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "attiva", carta: "zia-diana#1", combinazione: [] });
    expect(rifiutata(s, "anna", { tipo: "attiva", carta: "antonio-1#1", combinazione: [] })).toBeTruthy();
    s = fai(s, "anna", { tipo: "attiva", carta: "zia-diana#1", combinazione: [] });
    expect(anna(s).attivati.map((a) => a.copia.carta)).toContain("zia-diana");
    expect(s.turno.mosseRimaste).toBe(2);
    // senza Annalisa 2 serve il codice
    const t = partita();
    anna(t).nascosti = [copia("zia-diana")];
    expect(rifiutata(t, "anna", { tipo: "attiva", carta: "zia-diana#1", combinazione: [] })).toBeTruthy();
  });

  it("Medico in famiglia: una volta per turno, gratis, prendi Racioppi o Zia Diana dalla pila degli scarti", () => {
    let s = conCarta("annalisa-2");
    s.scarti.personaggi = [copia("dottor-racioppi"), copia("paesano")];
    expect(rifiutata(s, "anna", potere("annalisa-2", { bersaglio: "paesano#1" }))).toMatch(/Racioppi/);
    s = usa(s, "annalisa-2", { bersaglio: "dottor-racioppi#1" });
    expect(anna(s).nascosti.map((c) => c.carta)).toEqual(["dottor-racioppi"]);
    expect(s.turno.mosseRimaste).toBe(3);
    s.scarti.personaggi.push(copia("zia-diana"));
    expect(rifiutata(s, "anna", potere("annalisa-2", { bersaglio: "zia-diana#1" }))).toMatch(/una volta per turno/);
  });

  it("Il mio corpo che cambia: una tua carta attivata torna in mano e al suo posto si attiva, stanca, un personaggio della mano", () => {
    let s = conCarta("annalisa-3");
    anna(s).attivati.push({ copia: copia("antonio-1"), stanca: 0 });
    anna(s).nascosti = [copia("antonio-3")];
    expect(puntiDi(anna(s))).toBe(4);
    expect(rifiutata(s, "anna", potere("annalisa-3", { propria: "annalisa-3#1", bersaglio: "antonio-3#1" }))).toMatch(/altra/);
    s = usa(s, "annalisa-3", { propria: "antonio-1#1", bersaglio: "antonio-3#1" });
    expect(anna(s).attivati.map((a) => [a.copia.carta, a.stanca])).toEqual([
      ["annalisa-3", 3],
      ["antonio-3", 3],
    ]);
    expect(anna(s).nascosti.map((c) => c.carta)).toEqual(["antonio-1"]);
    expect(puntiDi(anna(s))).toBe(6);
  });
});

describe("Nonna Maria e Nonno Rafiluccio (aiuti)", () => {
  it("Un filo di trucco: una carta vale 1 in più o in meno; quando lascia la mano torna vera", () => {
    let s = conCarta("nonna-maria-1");
    anna(s).mano = [num(5, "c")];
    expect(rifiutata(s, "anna", potere("nonna-maria-1", { carte: ["c"], valore: 7 }))).toMatch(/1 in più o 1 in meno/);
    expect(mosseValide(s, "anna")).toContainEqual(potere("nonna-maria-1", { carte: ["c"], valore: 6 }));
    s = usa(s, "nonna-maria-1", { carte: ["c"], valore: 6 });
    expect(anna(s).mano).toEqual([{ id: "c", valore: 6, valoreVero: 5 }]);
    expect(vistaGiocatore(s, "bruno").giocatori.anna!.carteInMano).toBe(1);
    // scartata torna un 5
    s.turno.mosseRimaste = 0;
    anna(s).mano.push(...Array.from({ length: 7 }, (_, i) => num(1, `u${i}`)));
    s = fai(s, "anna", { tipo: "fineTurno", scarta: ["c"] });
    expect(s.scarti.numeri.at(-1)).toEqual({ id: "c", valore: 5 });
  });

  it("Straordinario: gratis, 1 mossa in più adesso e 1 nel prossimo turno", () => {
    let s = conCarta("nonno-rafiluccio-2");
    s = usa(s, "nonno-rafiluccio-2");
    expect(s.turno.mosseRimaste).toBe(4);
    expect(anna(s).mosseProssimoTurno).toBe(1);
  });
});

describe("poteri gratis", () => {
  it("si usano una volta per turno per carta, anche se la carta non si stanca (O al sangue o niente di Totò alla Resurrezione)", () => {
    let s = conCarta("toto-3");
    s.evento = { id: "la-resurrezione", turniRimasti: 2 };
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 });
    s = usa(s, "toto-3");
    expect(anna(s).attivati[0]!.stanca).toBe(0); // alla Resurrezione le carte di Totò non si stancano
    expect(rifiutata(s, "anna", potere("toto-3"))).toMatch(/una volta per turno/);
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere" && m.potere === "grigliata")).toBe(false);
  });
});
