import { describe, expect, it } from "vitest";
import { banconota, contaCarte, copia, fai, num, partita, rifiutata } from "./aiuti-test";
import { CARTE, carta } from "./carte";
import { MAX_VETRINA, POTERI_COPIA } from "./poteri";
import { mossaAutomatica, mosseValide } from "./regole";
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
  it("costa una mossa (salvo Non sbaglio mai) e la carta diventa stanca per il suo tempo di ricarica", () => {
    let s = conCarta("nonno-nicola-1"); // L'orto, ricarica 1
    s = usa(s, "nonno-nicola-1");
    expect(s.turno.mosseRimaste).toBe(2);
    expect(anna(s).attivati[0]!.stanca).toBe(1);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "potere", carta: "nonno-nicola-1", potere: "l-orto" });
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
    s.giocatori.bruno!.attivati.push({ copia: copia("nonno-nicola-1"), stanca: 0 });
    expect(rifiutata(s, "anna", potere("nonno-nicola-1"))).toMatch(/attivati/);
    s.giocatori.anna!.nascosti.push(copia("generoso-1"));
    expect(rifiutata(s, "anna", potere("generoso-1"))).toMatch(/attivati/);
    conCarta("antonio-3", s); // Ho sempre ragione io: difesa
    expect(rifiutata(s, "anna", potere("antonio-3"))).toMatch(/quando ti attaccano/);
  });

  it("ogni potere di aiuto si può usare e le carte non si perdono", () => {
    const aiuti = CARTE.flatMap((c) => c.poteri.filter((p) => p.tipo === "aiuto" && !POTERI_COPIA.has(p.id)).map((p) => ({ c, p })));
    expect(aiuti.length).toBeGreaterThan(30);
    for (const { c, p } of aiuti) {
      const s = conCarta(c.id);
      // un po' di tutto, perché ogni potere trovi qualcosa da fare
      const g = anna(s);
      g.mano = [num(1, "h1"), num(2, "h2"), num(5, "h5")];
      g.nascosti = [copia("paesano")];
      g.attivati.push({ copia: copia("toto-2"), stanca: 2 });
      s.scarti.numeri = [num(4, "s4"), num(6, "s6")];
      s.turno.ultimaMossa = "pescaNumero";
      s.turno.appenaPescata = { mazzo: "numeri", id: "h2" };
      const prima = contaCarte(s);
      const mosse = mosseValide(s, "anna").filter((m) => m.tipo === "potere" && m.potere === p.id);
      expect(mosse.length, p.id).toBeGreaterThan(0);
      for (const m of mosse) expect(contaCarte(fai(s, "anna", m)), p.id).toEqual(prima);
    }
  });
});

/* ---------------- mosse in più ---------------- */

describe("mosse in più", () => {
  it("Un caffè (+1) e Prosecco (+1 e una carta) sono gratis; Anima della festa costa una mossa e ne dà 3", () => {
    expect(usa(conCarta("generoso-1"), "generoso-1").turno.mosseRimaste).toBe(4);
    expect(usa(conCarta("zio-salvatore-3"), "zio-salvatore-3").turno.mosseRimaste).toBe(5);
    const s = usa(conCarta("claudia-1"), "claudia-1");
    expect(s.turno.mosseRimaste).toBe(4);
    expect(anna(s).mano).toHaveLength(1);
  });

  it("i poteri gratis si possono usare anche a mosse finite", () => {
    const s = conCarta("generoso-1");
    s.turno.mosseRimaste = 0;
    expect(mosseValide(s, "anna")).toContainEqual(potere("generoso-1"));
    expect(usa(s, "generoso-1").turno.mosseRimaste).toBe(1);
  });

  it("Ci penso domani: 1 mossa ora, 2 in più nel prossimo turno", () => {
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

  it("Te l'ho già detto? / L'ho già detto: gratis, mosse in più solo uguali all'ultima", () => {
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

  it("Doppio turno: finito il turno ne fa subito un altro con 2 mosse", () => {
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
  it("L'orto e Ho tanta fame: 2 carte numero", () => {
    expect(anna(usa(conCarta("nonno-nicola-1"), "nonno-nicola-1")).mano).toHaveLength(2);
    expect(anna(usa(conCarta("christian"), "christian", {}, "ho-tanta-fame")).mano).toHaveLength(2);
  });

  it("Cucina per 200: tu 4 carte, ogni avversario 1", () => {
    const s = usa(conCarta("nonna-dina-3"), "nonna-dina-3");
    expect(anna(s).mano).toHaveLength(4);
    expect(s.giocatori.bruno!.mano).toHaveLength(1);
    expect(s.giocatori.carla!.mano).toHaveLength(1);
  });

  it("Colazione: 1 personaggio e 1 carta numero", () => {
    const s = usa(conCarta("generoso-2"), "generoso-2");
    expect(anna(s).mano).toHaveLength(1);
    expect(anna(s).nascosti.length + anna(s).attacchi.length).toBe(1);
  });

  it("Offre la casa: 2 voci diverse del menu", () => {
    const s = usa(conCarta("generoso-3"), "generoso-3", { scelte: ["caffe", "birra"] });
    expect(s.turno.mosseRimaste).toBe(4);
    expect(anna(s).mano).toHaveLength(2);
    expect(rifiutata(conCarta("generoso-3"), "anna", potere("generoso-3", { scelte: ["caffe", "caffe"] }))).toMatch(/2 voci diverse/);
  });

  it("Sono due etti e mezzo, lascio?: per il resto del turno ogni carta numero pescata ne fa pescare una in più", () => {
    let s = usa(conCarta("sara-e-giuseppe-1"), "sara-e-giuseppe-1");
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(anna(s).mano).toHaveLength(2);
    expect(vistaGiocatore(s, "bruno").turno.pescaDoppia).toBe(true);
  });

  it("Frigge di tutto: scarti le carte che vuoi e ne peschi altrettante più una", () => {
    let s = conCarta("nonna-dina-2");
    anna(s).mano = [num(1, "a"), num(2, "b"), num(3, "c")];
    s = usa(s, "nonna-dina-2", { carte: ["a", "b"] });
    expect(anna(s).mano).toHaveLength(4);
    expect(s.scarti.numeri.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("Vende la carne: scarti un personaggio nascosto e peschi 3 carte numero", () => {
    let s = conCarta("chicca-1");
    anna(s).nascosti = [copia("paesano")];
    s = usa(s, "chicca-1", { bersaglio: "paesano#1" });
    expect(anna(s).nascosti).toEqual([]);
    expect(anna(s).mano).toHaveLength(3);
  });

  it("Non sbaglio mai: subito dopo aver pescato, scarti quella carta e ne peschi un'altra, senza usare mosse", () => {
    let s = conCarta("maddalena-1");
    expect(rifiutata(s, "anna", potere("maddalena-1"))).toMatch(/subito dopo/);
    s = fai(s, "anna", { tipo: "pescaNumero" });
    const pescata = anna(s).mano[0]!;
    s = usa(s, "maddalena-1");
    expect(s.turno.mosseRimaste).toBe(2); // solo la pescata ha usato una mossa
    expect(anna(s).attivati[0]!.stanca).toBe(1);
    expect(s.scarti.numeri).toEqual([pescata]);
    expect(anna(s).mano).toHaveLength(1);
    expect(anna(s).mano[0]).not.toEqual(pescata);
  });

  it("Non sbaglio mai si può usare anche dopo l'ultima pescata del turno (e il turno non si chiude da solo)", () => {
    let s = conCarta("maddalena-1");
    s.turno.mosseRimaste = 1;
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(s.turno.mosseRimaste).toBe(0);
    expect(mossaAutomatica(s)).toBeNull();
    expect(mosseValide(s, "anna")).toContainEqual(potere("maddalena-1"));
    s = usa(s, "maddalena-1");
    expect(mossaAutomatica(s)).not.toBeNull();
  });

  it("Non sbaglio mai funziona anche con un personaggio, ma non dopo un'altra mossa", () => {
    let s = conCarta("maddalena-1");
    s = fai(s, "anna", { tipo: "pescaPersonaggio" });
    s = usa(s, "maddalena-1");
    expect(s.scarti.personaggi).toHaveLength(1);
    expect(anna(s).nascosti.length + anna(s).attacchi.length).toBe(1);

    let t = conCarta("maddalena-1");
    t = fai(t, "anna", { tipo: "pescaNumero" });
    t = fai(t, "anna", { tipo: "brucia" });
    expect(rifiutata(t, "anna", potere("maddalena-1"))).toMatch(/subito dopo/);
  });
});

/* ---------------- tavolo e scarti ---------------- */

describe("tavolo e scarti", () => {
  it("Sposta i mobili: cambiano tutte le carte scoperte", () => {
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

  it("Mangia mangia mangia: tutte le carte numero del tavolo, che fino a fine turno non si scartano", () => {
    let s = conCarta("alessia");
    anna(s).mano = Array.from({ length: 6 }, (_, i) => num(1, `a${i}`));
    s = usa(s, "alessia");
    expect(anna(s).mano).toHaveLength(10);
    s.turno.mosseRimaste = 0;
    const presa = s.turno.intoccabili[0]!;
    expect(rifiutata(s, "anna", { tipo: "fineTurno", scarta: [presa, "a0", "a1"] })).toMatch(/Alessia/);
    s = fai(s, "anna", { tipo: "fineTurno", scarta: ["a0", "a1", "a2"] });
    expect(s.giocatori.anna!.mano).toHaveLength(7);
  });

  it("Mangia mangia mangia: se le altre carte non bastano, si scartano solo quelle", () => {
    let s = conCarta("alessia");
    anna(s).mano = Array.from({ length: 5 }, (_, i) => num(1, `a${i}`));
    s = usa(s, "alessia"); // 9 carte, 4 intoccabili: si scartano 2
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: ["a0", "a1"] });
    expect(s.giocatori.anna!.mano).toHaveLength(7);
  });

  it("Lezione di padel: scambi una tua carta numero con una del tavolo", () => {
    const s = conCarta("francesco-1");
    anna(s).mano = [num(8, "mia")];
    const sulTavolo = s.tavolo.numeri[1]!;
    const dopo = usa(s, "francesco-1", { carte: ["mia"], posizioni: [1] });
    expect(anna(dopo).mano).toEqual([sulTavolo]);
    expect(dopo.tavolo.numeri[1]!.id).toBe("mia");
  });

  it("Mercatino: una carta a scelta dagli scarti", () => {
    let s = conCarta("nonna-patrizia-1");
    s.scarti.numeri = [num(1, "a"), num(2, "b"), num(3, "c")];
    s = usa(s, "nonna-patrizia-1", { bersaglio: "a" });
    expect(anna(s).mano.map((c) => c.id)).toEqual(["a"]);
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

  it("Patate al forno: una carta in meno dei giocatori; sceglie prima chi la usa, poi gli altri; l'ultimo resta senza", () => {
    let s = usa(conCarta("nonna-maddalena-3"), "nonna-maddalena-3");
    const a = s.turno.attesa!;
    expect(a).toMatchObject({ tipo: "scegliNumeri", motivo: "patate", giocatore: "anna", coda: ["bruno", "carla"] });
    const patate = vistaGiocatore(s, "carla").offerta;
    expect(patate).toHaveLength(2);
    s = fai(s, "anna", { tipo: "scegli", carte: [patate[1]!.id] });
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/altro giocatore/);
    expect(mosseValide(s, "bruno")).toEqual([{ tipo: "scegli", carte: [patate[0]!.id] }]);
    s = fai(s, "bruno", { tipo: "scegli", carte: [patate[0]!.id] });
    expect(s.turno.attesa).toBeNull();
    expect(s.giocatori.carla!.mano).toEqual([]);
    expect(s.turno.giocatore).toBe("anna");
  });

  it("Ne ho viste tante: guardi i primi 3 personaggi e ne prendi uno; gli altri tornano in cima nello stesso ordine", () => {
    let s = conCarta("nonno-antonio-1");
    const cima = s.mazzi.personaggi.slice(-3);
    s = usa(s, "nonno-antonio-1");
    expect(s.turno.attesa).toMatchObject({ tipo: "scegliPersonaggio" });
    expect(vistaGiocatore(s, "bruno").turno.attesa).toBeNull(); // solo anna le vede
    const scelta = cima[1]!;
    s = fai(s, "anna", { tipo: "scegli", carte: [scelta.id] });
    expect([...anna(s).nascosti, ...anna(s).attacchi]).toEqual([scelta]);
    expect(s.mazzi.personaggi.slice(-2)).toEqual([cima[0], cima[2]]);
  });

  it("Ogni cosa al suo posto: le prime 5 carte del mazzo numeri tornano nell'ordine scelto", () => {
    let s = usa(conCarta("nonna-maddalena-1"), "nonna-maddalena-1");
    const carte = s.turno.attesa!.tipo === "riordina" ? s.turno.attesa!.carte : [];
    expect(carte).toHaveLength(5);
    const ordine = [carte[4]!.id, carte[0]!.id, carte[3]!.id, carte[1]!.id, carte[2]!.id];
    s = fai(s, "anna", { tipo: "riordina", ordine });
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(anna(s).mano[0]!.id).toBe(ordine[0]);
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

  it("La vetrina della collezione: fino a 3 carte, visibili, fuori dal limite della mano, buone per i codici", () => {
    let s = conCarta("checca-2");
    anna(s).mano = [num(2, "a"), num(2, "b"), num(5, "c"), num(6, "d")];
    s = usa(s, "checca-2", { carte: ["a", "b", "c"] });
    expect(anna(s).vetrina.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(vistaGiocatore(s, "bruno").giocatori.anna!.vetrina).toHaveLength(MAX_VETRINA);
    // codice con carte in vetrina
    anna(s).nascosti = [copia("generoso-1")]; // 2 carte con somma 4
    s = fai(s, "anna", {
      tipo: "attiva",
      carta: "generoso-1#1",
      combinazione: [
        { tipo: "numero", id: "a", valore: 2 },
        { tipo: "numero", id: "b", valore: 2 },
      ],
    });
    expect(anna(s).vetrina.map((c) => c.id)).toEqual(["c"]);
    // fuori dal limite: 7 in mano + 1 in vetrina, niente da scartare
    anna(s).mano = Array.from({ length: 7 }, (_, i) => num(1, `m${i}`));
    s.turno.mosseRimaste = 0;
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "fineTurno", scarta: [] });
  });

  it("finché c'è un potere gratis carico (es. Un caffè) il turno non si chiude da solo", () => {
    const s = conCarta("generoso-1");
    s.turno.mosseRimaste = 0;
    expect(mossaAutomatica(s)).toBeNull();
    anna(s).attivati[0]!.stanca = 1;
    expect(mossaAutomatica(s)).not.toBeNull();
  });

  it("La vetrina non supera 3 carte", () => {
    let s = conCarta("checca-2");
    anna(s).mano = [num(2, "a"), num(2, "b")];
    anna(s).vetrina = [num(1, "v1"), num(1, "v2")];
    expect(rifiutata(s, "anna", potere("checca-2", { carte: ["a", "b"] }))).toMatch(/Scegli 1 carta numero/);
    s = usa(s, "checca-2", { carte: ["a"] });
    expect(anna(s).vetrina).toHaveLength(3);
  });
});

/* ---------------- ricarica e informazioni ---------------- */

describe("ricarica e informazioni", () => {
  it("Brace accesa: ricarica un'altra tua carta stanca (non sé stessa)", () => {
    let s = conCarta("toto-2");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 });
    expect(rifiutata(s, "anna", potere("toto-2", { bersaglio: "toto-2#1" }))).toMatch(/un'altra/);
    s = usa(s, "toto-2", { bersaglio: "generoso-3#1" });
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([2, 0]);
  });

  it("Grigliata: ricarica tutte le altre tue carte; poi si stanca lei", () => {
    let s = conCarta("toto-3");
    anna(s).attivati.push({ copia: copia("generoso-3"), stanca: 3 }, { copia: copia("generoso-2"), stanca: 1 });
    s = usa(s, "toto-3");
    expect(anna(s).attivati.map((a) => a.stanca)).toEqual([3, 0, 0]);
  });

  it("Ricetta: ricarica una carta stanca di chiunque, anche di un avversario", () => {
    let s = conCarta("dottor-racioppi");
    s.giocatori.bruno!.attivati.push({ copia: copia("generoso-3"), stanca: 2 });
    s = usa(s, "dottor-racioppi", { bersaglio: "generoso-3#1" });
    expect(s.giocatori.bruno!.attivati[0]!.stanca).toBe(0);
    expect(s.registro.at(-1)).toMatchObject({ bersaglio: "bruno" });
  });

  it("Studia il fascicolo: per tutto il turno vedi le carte in mano di un avversario", () => {
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
    const s = conCarta("generoso-1");
    anna(s).mancia = [banconota(4, "m4")];
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere")).toBe(true);
  });
});
