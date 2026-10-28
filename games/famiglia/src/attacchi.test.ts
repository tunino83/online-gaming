import { interoTra } from "@og/engine";
import { describe, expect, it } from "vitest";
import { contaCarte, copia, fai, num, partita, rifiutata } from "./aiuti-test";
import { CARTE, carta } from "./carte";
import { mossaAutomatica, mosseValide, puntiDi } from "./regole";
import type { Mossa, ParametriPotere, StatoPartita } from "./stato";
import { vistaGiocatore } from "./vista";

/* ---------------- aiuti ---------------- */

/** Dà al giocatore un personaggio attivato (carico, o stanco se indicato). */
function attivata(s: StatoPartita, chi: string, idCarta: string, stanca = 0, n = 1): StatoPartita {
  s.giocatori[chi]!.attivati.push({ copia: copia(idCarta, n), stanca });
  return s;
}

/** Anna usa il potere della sua carta attivata. */
const attacca = (s: StatoPartita, idCarta: string, p: ParametriPotere = {}, quale?: string): StatoPartita =>
  fai(s, "anna", { tipo: "potere", carta: `${idCarta}#1`, potere: quale ?? carta(idCarta).poteri[0]!.id, ...p });

const difendi = (s: StatoPartita, chi: string, idCarta: string, altro: Partial<Extract<Mossa, { tipo: "difendi" }>> = {}): StatoPartita =>
  fai(s, chi, { tipo: "difendi", carta: `${idCarta}#1`, ...altro });

const subisci = (s: StatoPartita, chi: string, altro: { carte?: string[]; bersaglio?: string } = {}) => fai(s, chi, { tipo: "subisci", ...altro });

const g = (s: StatoPartita, chi: string) => s.giocatori[chi]!;
const manoDi = (s: StatoPartita, chi: string, ...valori: number[]) => {
  g(s, chi).mano = valori.map((v, i) => num(v, `${chi}${i}`));
};

/* ---------------- regole comuni ---------------- */

describe("come funziona un attacco", () => {
  it("costa una mossa, stanca la carta e, se l'attaccato non ha difese, colpisce subito", () => {
    let s = attivata(partita(), "anna", "totò-1".replace("ò", "o"));
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    expect(s.turno.mosseRimaste).toBe(2);
    expect(g(s, "anna").attivati[0]!.stanca).toBe(1);
    expect(s.turno.attesa).toBeNull();
    expect(g(s, "bruno").mosseProssimoTurno).toBe(-1);
    expect(s.registro.map((f) => f.tipo).slice(-3)).toEqual(["attacco", "colpito", "punto"]); // +1 punto per l'attacco a segno
  });

  it("se l'attaccato ha una difesa, il gioco aspetta la sua risposta", () => {
    let s = attivata(attivata(partita(), "anna", "toto-1"), "bruno", "gerardina-1");
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" });
    expect(rifiutata(s, "anna", { tipo: "pescaNumero" })).toMatch(/altro giocatore/);
    expect(vistaGiocatore(s, "carla").attacco).toMatchObject({ attaccante: "anna", potere: "si-incanta", bersaglio: "bruno" });
    expect(mosseValide(s, "bruno")).toEqual([{ tipo: "subisci" }, { tipo: "difendi", carta: "gerardina-1#1", potere: "sempre-calma" }]);
    s = subisci(s, "bruno");
    expect(g(s, "bruno").mosseProssimoTurno).toBe(-1);
    expect(s.turno.attesa).toBeNull();
  });

  it("una difesa riuscita annulla l'attacco e la carta di difesa si stanca", () => {
    let s = attivata(attivata(partita(), "anna", "toto-1"), "bruno", "gerardina-1");
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    s = difendi(s, "bruno", "gerardina-1", { potere: "sempre-calma" });
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1); // Gerardina 1 si ricarica in 1 turno
    expect(s.registro.at(-2)).toMatchObject({ tipo: "difesa", giocatore: "bruno", potere: "sempre-calma", riuscita: true });
    expect(s.registro.at(-1)).toMatchObject({ tipo: "punto", giocatore: "bruno", motivo: "difesa" });
  });

  it("regola del livello: una difesa di livello 1 non ferma un attacco di livello 2", () => {
    let s = attivata(attivata(partita(), "anna", "nicole"), "bruno", "gerardina-1"); // Parla parla parla (2) contro Sempre calma (1)
    s = attacca(s, "nicole", { giocatore: "bruno" });
    expect(s.turno.attesa).toBeNull(); // nessuna difesa possibile: colpito subito
    expect(g(s, "bruno").zittoProssimoTurno).toBe(true);
  });

  it("difesa d'emergenza dalla mano: si paga il codice, la carta va negli scarti, niente punti di carte (solo +1 per la difesa)", () => {
    let s = attivata(partita(), "anna", "toto-1");
    g(s, "bruno").nascosti = [copia("paesano")];
    manoDi(s, "bruno", 4, 6);
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    s = difendi(s, "bruno", "paesano", { combinazione: [{ tipo: "numero", id: "bruno0", valore: 4 }] });
    expect(g(s, "bruno").nascosti).toEqual([]);
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["bruno1"]);
    expect(s.scarti.personaggi.map((c) => c.carta)).toEqual(["paesano"]);
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(puntiDi(g(s, "bruno"))).toBe(1); // il punto per la difesa riuscita
  });

  it("senza carte per pagare il codice, la difesa d'emergenza non si può usare", () => {
    let s = attivata(partita(), "anna", "toto-1");
    g(s, "bruno").nascosti = [copia("paesano")];
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    expect(s.turno.attesa).toBeNull();
  });

  it("attacco contro tutti: un avversario alla volta, ognuno con la sua difesa", () => {
    let s = attivata(attivata(partita(), "anna", "gerardina-3"), "carla", "chicca-3"); // Rospe per tutti; E se poi te ne penti?
    s = attacca(s, "gerardina-3");
    // bruno non ha difese: colpito subito; poi tocca a carla
    expect(g(s, "bruno").mosseProssimoTurno).toBe(-1);
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "carla" });
    s = difendi(s, "carla", "chicca-3");
    // E se poi te ne penti?: torna all'attaccante
    expect(g(s, "carla").mosseProssimoTurno).toBe(0);
    expect(g(s, "anna").mosseProssimoTurno).toBe(-1);
  });

  it("contro un attacco contro tutti Maddalena non può deviare", () => {
    let s = attivata(attivata(partita(), "anna", "gerardina-3"), "bruno", "maddalena-3");
    s = attacca(s, "gerardina-3");
    expect(s.turno.attesa?.giocatore).not.toBe("bruno");
  });

  it("non ci si può attaccare da soli, e niente attacchi senza bersagli possibili", () => {
    const s = attivata(partita(), "anna", "toto-1");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "anna" })).toMatch(/avversario/);
    const t = attivata(partita(), "anna", "nonno-antonio-3"); // Il bastone: serve una carta carica
    expect(mosseValide(t, "anna").some((m) => m.tipo === "potere" && m.potere === "il-bastone")).toBe(false);
  });

  it("le carte non si perdono durante gli attacchi", () => {
    let s = attivata(partita(), "anna", "sara-e-giuseppe-3");
    manoDi(s, "anna", 1, 2);
    manoDi(s, "bruno", 3, 4, 5, 6);
    const prima = contaCarte(s);
    s = attacca(s, "sara-e-giuseppe-3", { giocatore: "bruno" });
    expect(contaCarte(s)).toEqual(prima);
  });
});

/* ---------------- attacchi ---------------- */

describe("attacchi a un avversario", () => {
  it("Alta idratazione: l'avversario sceglie 2 carte numero da scartare", () => {
    let s = attivata(partita(), "anna", "antonio-2");
    manoDi(s, "bruno", 1, 2, 3, 4);
    s = attacca(s, "antonio-2", { giocatore: "bruno" });
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" }); // deve scegliere
    expect(rifiutata(s, "bruno", { tipo: "subisci", carte: ["bruno0"] })).toMatch(/2 carte/);
    s = subisci(s, "bruno", { carte: ["bruno1", "bruno3"] });
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["bruno0", "bruno2"]);
  });

  it("Alta idratazione con 2 carte o meno: le scarta tutte senza scegliere", () => {
    let s = attivata(partita(), "anna", "antonio-2");
    manoDi(s, "bruno", 1, 2);
    s = attacca(s, "antonio-2", { giocatore: "bruno" });
    expect(g(s, "bruno").mano).toEqual([]);
  });

  it("Solo per vedere comm sape e Giro aperto: rubano una carta a caso", () => {
    let s = attivata(partita(), "anna", "nonno-nicola-2");
    manoDi(s, "bruno", 5);
    s = attacca(s, "nonno-nicola-2", { giocatore: "bruno" });
    expect(g(s, "anna").mano.map((c) => c.id)).toEqual(["bruno0"]);

    let t = partita();
    g(t, "anna").attacchi = [copia("giro-aperto")];
    manoDi(t, "anna", 3, 3);
    manoDi(t, "bruno", 8);
    t = fai(t, "anna", {
      tipo: "usaCarta",
      carta: "giro-aperto#1",
      combinazione: [
        { tipo: "numero", id: "anna0", valore: 3 },
        { tipo: "numero", id: "anna1", valore: 3 },
      ],
      giocatore: "bruno",
    });
    expect(g(t, "anna").mano.map((c) => c.id)).toEqual(["bruno0"]);
    expect(g(t, "anna").attacchi).toEqual([]);
    expect(t.scarti.personaggi.map((c) => c.carta)).toEqual(["giro-aperto"]);
  });

  it("Si incanta e Rospe per tutti: 1 mossa in meno nel prossimo turno (mai sotto zero); con Si incanta peschi 1 carta", () => {
    let s = attivata(partita(), "anna", "toto-1");
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    expect(g(s, "anna").mano).toHaveLength(1);
    g(s, "bruno").mosseProssimoTurno = -5;
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.giocatore).toBe("bruno");
    expect(s.turno.mosseRimaste).toBe(0);
    expect(mossaAutomatica(s)?.mossa.tipo).toBe("fineTurno");
  });

  it("Schietta: i personaggi nascosti dell'avversario li vedono tutti per il resto del turno", () => {
    let s = attivata(partita(), "anna", "checca-1");
    g(s, "bruno").nascosti = [copia("chicca-1")];
    s = attacca(s, "checca-1", { giocatore: "bruno" });
    expect(vistaGiocatore(s, "carla").turno.rivelati).toEqual([{ giocatore: "bruno", mano: [], nascosti: [copia("chicca-1")] }]);
  });

  it("Gli occhi 'nguoll: una carta nascosta a caso", () => {
    let s = partita();
    g(s, "anna").attacchi = [copia("gli-occhi-nguoll")];
    manoDi(s, "anna", 2, 2);
    g(s, "bruno").nascosti = [copia("chicca-1")];
    s = fai(s, "anna", {
      tipo: "usaCarta",
      carta: "gli-occhi-nguoll#1",
      combinazione: [
        { tipo: "numero", id: "anna0", valore: 2 },
        { tipo: "numero", id: "anna1", valore: 2 },
      ],
      giocatore: "bruno",
    });
    expect(g(s, "bruno").nascosti).toEqual([]);
  });

  it("Versa il vino e La tomacella: la carta carica scelta si stanca; le carte di Francesco non bevono vino", () => {
    let s = attivata(attivata(attivata(partita(), "anna", "zio-salvatore-2"), "bruno", "generoso-3"), "bruno", "francesco-1");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "zio-salvatore-2#1", potere: "versa-il-vino", giocatore: "bruno", bersaglio: "francesco-1#1" })).toMatch(/carica/);
    s = attacca(s, "zio-salvatore-2", { giocatore: "bruno", bersaglio: "generoso-3#1" });
    expect(g(s, "bruno").attivati.map((a) => a.stanca)).toEqual([4, 0]); // ricarica 3 + 1 turno in più
  });

  it("Smash e Il bastone: una carta si stanca e si scartano 1 o 2 carte a caso", () => {
    let s = attivata(attivata(partita(), "anna", "nonno-antonio-3"), "bruno", "generoso-2");
    manoDi(s, "bruno", 1, 2, 3);
    s = attacca(s, "nonno-antonio-3", { giocatore: "bruno", bersaglio: "generoso-2#1" });
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(2);
    expect(g(s, "bruno").mano).toHaveLength(1);
  });

  it("Una rospa?: dai una tua carta e prendi a caso un personaggio nascosto", () => {
    let s = attivata(partita(), "anna", "gerardina-2");
    manoDi(s, "anna", 7);
    g(s, "bruno").nascosti = [copia("chicca-1")];
    s = attacca(s, "gerardina-2", { giocatore: "bruno", carte: ["anna0"] });
    expect(g(s, "anna").nascosti.map((c) => c.carta)).toEqual(["chicca-1"]);
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["anna0"]);
  });

  it("Burla: prendi 2 carte a caso e ne dai una tua a scelta", () => {
    let s = attivata(partita(), "anna", "squacqualacchione-1");
    manoDi(s, "anna", 1, 8);
    manoDi(s, "bruno", 5, 6, 7);
    s = attacca(s, "squacqualacchione-1", { giocatore: "bruno", carte: ["anna1"] });
    expect(g(s, "anna").mano).toHaveLength(3);
    expect(g(s, "anna").mano.map((c) => c.id)).toContain("anna0");
    expect(g(s, "bruno").mano).toHaveLength(2);
    expect(g(s, "bruno").mano.map((c) => c.id)).toContain("anna1");
  });

  it("Vertenza: paghi il codice di un personaggio attivato di livello 1 o 2 dell'avversario e lo prendi, con i suoi punti", () => {
    let s = attivata(attivata(attivata(partita(), "anna", "giuseppe-3"), "bruno", "generoso-2"), "bruno", "generoso-3");
    manoDi(s, "anna", 2, 3, 5, 8); // Generoso 2: 3 carte con somma 10
    const paga = (...ids: [string, number][]) => ids.map(([id, valore]) => ({ tipo: "numero" as const, id, valore }));
    expect(
      rifiutata(s, "anna", { tipo: "potere", carta: "giuseppe-3#1", potere: "vertenza", giocatore: "bruno", bersaglio: "generoso-3#1", combinazione: paga(["anna0", 2], ["anna1", 3], ["anna2", 5]) }),
    ).toMatch(/livello 1 o 2/);
    // senza pagare il codice, o con le carte sbagliate, no
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "giuseppe-3#1", potere: "vertenza", giocatore: "bruno", bersaglio: "generoso-2#1" })).toMatch(/codice/);
    expect(
      rifiutata(s, "anna", { tipo: "potere", carta: "giuseppe-3#1", potere: "vertenza", giocatore: "bruno", bersaglio: "generoso-2#1", combinazione: paga(["anna0", 2], ["anna1", 3], ["anna3", 8]) }),
    ).toMatch(/non soddisfano/);
    expect(mosseValide(s, "anna")).toContainEqual(expect.objectContaining({ potere: "vertenza", bersaglio: "generoso-2#1" }));
    s = attacca(s, "giuseppe-3", { giocatore: "bruno", bersaglio: "generoso-2#1", combinazione: paga(["anna0", 2], ["anna1", 3], ["anna2", 5]) });
    expect(puntiDi(g(s, "anna"))).toBe(6); // Giuseppe 3 + Generoso 2 + 1 per l'attacco a segno
    expect(puntiDi(g(s, "bruno"))).toBe(3);
    expect(g(s, "anna").mano.map((c) => c.id)).toEqual(["anna3"]);
    // la carta di Giuseppe si ricarica in 3 turni + 2 (il livello di Generoso 2)
    expect(g(s, "anna").attivati.find((x) => x.copia.carta === "giuseppe-3")!.stanca).toBe(5);
    // senza carte per pagare, Vertenza non si può usare
    const t = attivata(attivata(partita(), "anna", "giuseppe-3"), "bruno", "generoso-2");
    expect(mosseValide(t, "anna").some((m) => m.tipo === "potere" && m.potere === "vertenza")).toBe(false);
  });

  it("Sparecchio: un personaggio attivato torna nella mano dell'avversario (e perde i punti)", () => {
    let s = attivata(attivata(partita(), "anna", "roberta-3"), "bruno", "generoso-3");
    s = attacca(s, "roberta-3", { giocatore: "bruno", bersaglio: "generoso-3#1" });
    expect(g(s, "bruno").attivati).toEqual([]);
    expect(g(s, "bruno").nascosti).toEqual([copia("generoso-3")]);
  });

  it("Sparecchio con la mano piena: l'avversario sceglie cosa scartare", () => {
    let s = attivata(attivata(partita(), "anna", "roberta-3"), "bruno", "generoso-3");
    g(s, "bruno").nascosti = [copia("paesano"), copia("taurasi"), copia("campari")];
    s = attacca(s, "roberta-3", { giocatore: "bruno", bersaglio: "generoso-3#1" });
    expect(s.turno.attesa).toEqual({ tipo: "scartaCarta", giocatore: "bruno", zona: "nascosti", nuova: "generoso-3#1" });
    s = fai(s, "bruno", { tipo: "scartaCarta", carta: "campari#1" });
    expect(s.turno.attesa).toBeNull();
    expect(s.turno.giocatore).toBe("anna");
  });

  it("Baratto: scambi una tua carta attivata con una sua (livelli vicini); tutte e due si stancano", () => {
    let s = attivata(attivata(attivata(partita(), "anna", "nonna-patrizia-3"), "anna", "chicca-1"), "bruno", "generoso-2");
    s = attacca(s, "nonna-patrizia-3", { giocatore: "bruno", propria: "chicca-1#1", bersaglio: "generoso-2#1" });
    expect(g(s, "anna").attivati.map((a) => [a.copia.carta, a.stanca])).toEqual([
      ["nonna-patrizia-3", 3],
      ["generoso-2", 2],
    ]);
    expect(g(s, "bruno").attivati.map((a) => [a.copia.carta, a.stanca])).toEqual([["chicca-1", 1]]);
  });

  it("Baratto: niente scambio tra livello 1 e livello 3", () => {
    const s = attivata(attivata(attivata(partita(), "anna", "nonna-patrizia-3"), "anna", "chicca-1"), "bruno", "generoso-3");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "nonna-patrizia-3#1", potere: "baratto", giocatore: "bruno", propria: "chicca-1#1", bersaglio: "generoso-3#1" })).toMatch(/livello/);
  });

  it("Tritacarne: carte mescolate e ridivise, tu 1 in più; niente più legame con Chicca (è vegana)", () => {
    let s = attivata(attivata(partita(), "anna", "sara-e-giuseppe-3"), "anna", "chicca-3", 1);
    manoDi(s, "anna", 1, 2);
    manoDi(s, "bruno", 3, 4, 5, 6);
    s = attacca(s, "sara-e-giuseppe-3", { giocatore: "bruno" });
    expect(g(s, "anna").mano).toHaveLength(3);
    expect(g(s, "bruno").mano).toHaveLength(3);
    expect(g(s, "anna").attivati[1]!.stanca).toBe(1);
  });

  it("Ho tanta fame (Christian, braccine corte): prendi 2 carte numero a caso dall'avversario con i punti più vicini ai tuoi", () => {
    let s = attivata(partita(), "anna", "christian"); // anna: 1 punto
    attivata(s, "bruno", "antonio-3"); // bruno: 3 punti (distanza 2)
    attivata(s, "carla", "antonio-2"); // carla: 2 punti (distanza 1)
    manoDi(s, "bruno", 1, 2, 3);
    manoDi(s, "carla", 4, 5, 6);
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "christian#1", potere: "ho-tanta-fame", giocatore: "bruno" })).toMatch(/più vicini/);
    expect(mosseValide(s, "anna").filter((m) => m.tipo === "potere" && m.potere === "ho-tanta-fame")).toEqual([
      { tipo: "potere", carta: "christian#1", potere: "ho-tanta-fame", giocatore: "carla" },
    ]);
    s = attacca(s, "christian", { giocatore: "carla" });
    expect(g(s, "anna").mano).toHaveLength(2);
    expect(g(s, "carla").mano).toHaveLength(1);
    expect(g(s, "anna").attivati[0]!.stanca).toBe(2);
  });

  it("Ho tanta fame: a pari distanza (sopra o sotto) sceglie Christian; in 2 giocatori è sempre l'altro", () => {
    const s = attivata(partita(), "anna", "antonio-2"); // anna: 2 punti con Antonio 2...
    attivata(s, "anna", "christian"); // ...+1 = 3
    attivata(s, "bruno", "toto-1"); // bruno: 1 punto (distanza 2)
    attivata(attivata(s, "carla", "antonio-3"), "carla", "giuseppe-2"); // carla: 5 punti (distanza 2)
    const bersagli = mosseValide(s, "anna").flatMap((m) => (m.tipo === "potere" && m.potere === "ho-tanta-fame" ? [m.giocatore] : []));
    expect(bersagli.sort()).toEqual(["bruno", "carla"]);
    const due = attivata(attivata(partita(2), "anna", "christian"), "bruno", "antonio-3");
    expect(mosseValide(due, "anna").some((m) => m.tipo === "potere" && m.potere === "ho-tanta-fame" && m.giocatore === "bruno")).toBe(true);
  });

  it("Parla parla parla: nel suo prossimo turno l'avversario non può usare poteri", () => {
    let s = attivata(attivata(partita(2), "anna", "nicole"), "bruno", "vincenzo");
    s = attacca(s, "nicole", { giocatore: "bruno" });
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.zitto).toBe(true);
    expect(mosseValide(s, "bruno").some((m) => m.tipo === "potere")).toBe(false);
    expect(rifiutata(s, "bruno", { tipo: "potere", carta: "vincenzo#1", potere: "frutta-e-verdura" })).toMatch(/Parla parla parla/);
  });

  it("Ti chiamo un attimo…: l'avversario riceve 2 carte numero ma salta il suo prossimo turno", () => {
    let s = attivata(partita(), "anna", "roberta-1");
    s = attacca(s, "roberta-1", { giocatore: "bruno" });
    expect(g(s, "bruno").mano).toHaveLength(2);
    expect(g(s, "anna").attivati[0]!.stanca).toBe(2);
    attivata(s, "bruno", "generoso-3", 2);
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    // Tocca a bruno: nessuna mossa (al telefono), ma le carte si ricaricano lo stesso; il turno si chiude da solo
    expect(s.turno.giocatore).toBe("bruno");
    expect(s.turno.mosseRimaste).toBe(0);
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1);
    expect(mossaAutomatica(s)?.mossa.tipo).toBe("fineTurno");
    s = fai(s, "bruno", { tipo: "fineTurno", scarta: [] });
    for (const _ of [1, 2]) {
      s.turno.mosseRimaste = 0;
      s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
    }
    expect(s.turno.giocatore).toBe("bruno");
    expect(s.turno.mosseRimaste).toBe(3); // il turno dopo gioca normalmente
  });

  it("Bisiniss (Rocky): la carta più alta dell'avversario diventa una carta che vale la metà", () => {
    let s = attivata(partita(), "anna", "rocky");
    manoDi(s, "bruno", 3, 8, 5);
    s = attacca(s, "rocky", { giocatore: "bruno" });
    expect(g(s, "bruno").mano.map((c) => c.valore).sort()).toEqual([3, 4, 5]);
    expect(s.scarti.numeri.map((c) => c.id)).toEqual(["bruno1"]);
  });

  it("Bisiniss: un 1 resta un 1 (la metà non scende sotto 1)", () => {
    let s = attivata(partita(), "anna", "rocky");
    manoDi(s, "bruno", 1);
    s = attacca(s, "rocky", { giocatore: "bruno" });
    expect(g(s, "bruno").mano.map((c) => c.valore)).toEqual([1]);
  });

  it("Vento: le carte numero volano via e si ripescano altrettante", () => {
    let s = partita();
    g(s, "anna").attacchi = [copia("vento")];
    manoDi(s, "anna", 1);
    manoDi(s, "bruno", 1, 2, 3);
    s = fai(s, "anna", { tipo: "usaCarta", carta: "vento#1", combinazione: [{ tipo: "numero", id: "anna0", valore: 1 }], giocatore: "bruno" });
    expect(g(s, "bruno").mano).toHaveLength(3);
    expect(g(s, "bruno").mano.some((c) => c.id.startsWith("bruno"))).toBe(false);
  });
});

describe("attacchi contro tutti", () => {
  it("È insipido: ogni avversario ti dà 1 carta (sceglie lui)", () => {
    let s = attivata(partita(), "anna", "nonno-nicola-3");
    manoDi(s, "bruno", 1, 2);
    manoDi(s, "carla", 7);
    s = attacca(s, "nonno-nicola-3");
    expect(s.turno.attesa?.giocatore).toBe("bruno");
    s = subisci(s, "bruno", { carte: ["bruno1"] });
    expect(g(s, "anna").mano.map((c) => c.id).sort()).toEqual(["bruno1", "carla0"]);
  });

  it("Urla: ogni avversario scarta 2 carte; Risata contagiosa: 1 a caso", () => {
    let s = attivata(partita(), "anna", "greta");
    manoDi(s, "bruno", 1, 2);
    manoDi(s, "carla", 7);
    s = attacca(s, "greta");
    expect(g(s, "bruno").mano).toHaveLength(1);
    expect(g(s, "carla").mano).toHaveLength(0);
  });

  it("Si canta!: prendi una carta a caso da ognuno; solo dopo averle prese tutte scegli quale ridare a ciascuno", () => {
    let s = attivata(partita(), "anna", "zio-salvatore-1");
    manoDi(s, "anna", 1);
    manoDi(s, "bruno", 5);
    manoDi(s, "carla", 6);
    s = attacca(s, "zio-salvatore-1");
    // prima prende da tutti
    expect(g(s, "anna").mano.map((c) => c.id).sort()).toEqual(["anna0", "bruno0", "carla0"]);
    expect(s.turno.attesa).toEqual({ tipo: "canto", giocatore: "anna", a: ["bruno", "carla"] });
    expect(rifiutata(s, "anna", { tipo: "scegli", carte: ["anna0"] })).toMatch(/2 carte/);
    // poi decide: a bruno la carta di carla, a carla la sua
    s = fai(s, "anna", { tipo: "scegli", carte: ["carla0", "anna0"] });
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["carla0"]);
    expect(g(s, "carla").mano.map((c) => c.id)).toEqual(["anna0"]);
    expect(g(s, "anna").mano.map((c) => c.id)).toEqual(["bruno0"]);
    expect(s.turno.attesa).toBeNull();
    expect(s.turno.canto).toBeNull();
  });

  it("Si canta!: chi si difende non dà e non riceve", () => {
    let s = attivata(attivata(partita(), "anna", "zio-salvatore-1"), "bruno", "gerardina-1"); // Sempre calma
    manoDi(s, "anna", 1);
    manoDi(s, "bruno", 5);
    manoDi(s, "carla", 6);
    s = attacca(s, "zio-salvatore-1");
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" });
    s = difendi(s, "bruno", "gerardina-1");
    expect(s.turno.attesa).toEqual({ tipo: "canto", giocatore: "anna", a: ["carla"] });
    s = fai(s, "anna", { tipo: "scegli", carte: ["anna0"] });
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["bruno0"]);
    expect(g(s, "carla").mano.map((c) => c.id)).toEqual(["anna0"]);
  });

  it("Zeppata sui social: ognuno sceglie se dare una carta o far stancare una sua carta carica", () => {
    let s = attivata(attivata(partita(), "anna", "claudia-2"), "bruno", "chicca-1");
    manoDi(s, "bruno", 4);
    manoDi(s, "carla", 6);
    s = attacca(s, "claudia-2");
    expect(s.turno.attesa?.giocatore).toBe("bruno");
    s = subisci(s, "bruno", { bersaglio: "chicca-1#1" });
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1);
    expect(g(s, "anna").mano.map((c) => c.id)).toEqual(["carla0"]); // carla non ha carte cariche: dà la carta
  });

  it("Volo infuocato: una carta carica di ogni avversario si stanca", () => {
    let s = attivata(attivata(attivata(partita(), "anna", "squacqualacchione-3"), "bruno", "chicca-1"), "carla", "generoso-2");
    s = attacca(s, "squacqualacchione-3");
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1);
    expect(g(s, "carla").attivati[0]!.stanca).toBe(2);
  });

  it("Multa: chi ha più carte numero ne scarta 2 (a pari merito, tutti)", () => {
    let s = attivata(partita(), "anna", "franchino");
    manoDi(s, "anna", 1, 1, 1, 1, 1);
    manoDi(s, "bruno", 1, 2, 3);
    manoDi(s, "carla", 4, 5, 6);
    s = attacca(s, "franchino");
    expect(g(s, "bruno").mano).toHaveLength(1);
    expect(g(s, "carla").mano).toHaveLength(1);
    expect(g(s, "anna").mano).toHaveLength(5);
  });
});

/* ---------------- difese ---------------- */

/** Anna attacca bruno con Si incanta (livello 1) o Il bastone (livello 3); bruno ha la carta di difesa indicata, attivata. */
function bruno_si_difende(difesa: string, livelloAttacco: 1 | 3 = 1): StatoPartita {
  let s = attivata(partita(), "bruno", difesa);
  if (livelloAttacco === 1) {
    s = attivata(s, "anna", "toto-1");
    return attacca(s, "toto-1", { giocatore: "bruno" });
  }
  s = attivata(attivata(s, "anna", "nonno-antonio-3"), "bruno", "chicca-1");
  manoDi(s, "bruno", 1, 2, 3);
  return attacca(s, "nonno-antonio-3", { giocatore: "bruno", bersaglio: "chicca-1#1" });
}

describe("difese", () => {
  it("Per me è quadrato: ferma anche un attacco di livello 3", () => {
    const s = difendi(bruno_si_difende("antonio-3", 3), "bruno", "antonio-3");
    expect(g(s, "bruno").mano).toHaveLength(3);
    expect(g(s, "bruno").attivati[1]!.stanca).toBe(0); // la carta che anna voleva stancare
  });

  it("Non è colpa mia: si può passare l'attacco anche a chi l'ha fatto", () => {
    const s = difendi(bruno_si_difende("maddalena-3"), "bruno", "maddalena-3", { giocatore: "anna" });
    expect(g(s, "anna").mosseProssimoTurno).toBe(-1);
  });

  it("Non è colpa mia (Maddalena 3): chi riceve l'attacco non può difendersi", () => {
    const s = difendi(attivata(bruno_si_difende("maddalena-3", 3), "carla", "antonio-3"), "bruno", "maddalena-3", { giocatore: "carla" });
    expect(s.turno.attesa).toBeNull();
    expect(s.registro.filter((f) => f.tipo !== "punto").at(-1)).toMatchObject({ tipo: "colpito", giocatore: "carla" });
  });

  it("E se poi te ne penti?: l'attacco torna a chi l'ha fatto", () => {
    const s = difendi(bruno_si_difende("chicca-3"), "bruno", "chicca-3");
    expect(g(s, "anna").mosseProssimoTurno).toBe(-1);
  });

  it("Tofu Super Seitan: ferma gli attacchi di livello 1 (senza premi), ma non quelli di livello 3 che non sono di carne", () => {
    const s = difendi(bruno_si_difende("chicca-1"), "bruno", "chicca-1", { potere: "tofu-super-seitan" });
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(s, "bruno").mano).toHaveLength(0);
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1);
    const forte = bruno_si_difende("chicca-1", 3);
    expect(mosseValide(forte, "bruno").some((m) => m.tipo === "difendi")).toBe(false);
  });

  it("Tofu Super Seitan contro la carne: ferma il Tritacarne (livello 3), peschi 2 carte e il Tritacarne resta stanco 1 turno in più", () => {
    let s = attivata(attivata(partita(), "anna", "sara-e-giuseppe-3"), "bruno", "chicca-1");
    manoDi(s, "anna", 1, 2);
    manoDi(s, "bruno", 3, 4, 5, 6);
    s = attacca(s, "sara-e-giuseppe-3", { giocatore: "bruno" });
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" });
    s = difendi(s, "bruno", "chicca-1", { potere: "tofu-super-seitan" });
    expect(g(s, "bruno").mano).toHaveLength(6);
    expect(g(s, "anna").mano).toHaveLength(2);
    expect(g(s, "anna").attivati[0]!.stanca).toBe(4); // ricarica 3 + 1
  });

  it("Tofu Super Seitan contro La tomacella (livello 2): la ferma e peschi 2 carte", () => {
    let s = attivata(partita(), "bruno", "chicca-1");
    attivata(s, "bruno", "antonio-1", 0, 2);
    g(s, "anna").attacchi = [copia("la-tomacella")];
    manoDi(s, "anna", 3, 3);
    const tomacella = mosseValide(s, "anna").find((m) => m.tipo === "usaCarta" && m.carta === "la-tomacella#1" && m.bersaglio === "antonio-1#2");
    expect(tomacella).toBeDefined();
    s = fai(s, "anna", tomacella!);
    s = difendi(s, "bruno", "chicca-1", { potere: "tofu-super-seitan" });
    expect(g(s, "bruno").attivati.map((a) => a.stanca)).toEqual([1, 0]);
    expect(g(s, "bruno").mano).toHaveLength(2);
  });

  it("Aperitivo: con Chicca 2 attivata vini e Campari si usano senza pagare il codice", () => {
    let s = attivata(attivata(attivata(partita(), "anna", "nonno-antonio-3"), "bruno", "chicca-2"), "bruno", "chicca-1");
    g(s, "bruno").nascosti = [copia("taurasi"), copia("antonio-3")];
    manoDi(s, "bruno", 1, 2, 3); // niente tris: senza Aperitivo il Taurasi non si potrebbe pagare
    s = attacca(s, "nonno-antonio-3", { giocatore: "bruno", bersaglio: "chicca-1#1" });
    expect(mosseValide(s, "bruno")).toContainEqual({ tipo: "difendi", carta: "taurasi#1", potere: "taurasi" });
    s = difendi(s, "bruno", "taurasi");
    expect(g(s, "bruno").mano).toHaveLength(3);
    expect(g(s, "bruno").nascosti.map((c) => c.carta)).toEqual(["antonio-3"]);
    expect(g(s, "anna").mosseProssimoTurno).toBe(-1);
    // senza Aperitivo il Taurasi non si può usare
    let t = attivata(attivata(partita(), "anna", "nonno-antonio-3"), "bruno", "chicca-1");
    g(t, "bruno").nascosti = [copia("taurasi")];
    manoDi(t, "bruno", 1, 2, 3);
    t = attacca(t, "nonno-antonio-3", { giocatore: "bruno", bersaglio: "chicca-1#1" });
    expect(t.turno.attesa).toBeNull(); // nessuna difesa possibile: l'attacco è passato subito
  });

  it("Forse c'è, forse no: si gira la prossima carta numero; dispari la difesa vince, pari l'attacco colpisce; la carta va in mano", () => {
    const s = bruno_si_difende("marika-1");
    s.mazzi.numeri.push(num(3, "dispari"));
    const vinta = difendi(s, "bruno", "marika-1");
    expect(g(vinta, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(vinta, "bruno").mano.map((c) => c.id)).toEqual(["dispari"]);
    expect(vinta.registro.find((f) => f.tipo === "difesa")).toMatchObject({ riuscita: true, girata: 3 });

    const t = bruno_si_difende("marika-1");
    t.mazzi.numeri.push(num(4, "pari"));
    const persa = difendi(t, "bruno", "marika-1");
    expect(g(persa, "bruno").mosseProssimoTurno).toBe(-1);
    expect(g(persa, "bruno").mano.map((c) => c.id)).toEqual(["pari"]);
    expect(persa.registro.find((f) => f.tipo === "difesa")).toMatchObject({ riuscita: false, girata: 4 });
  });

  it("Ricorso: annulli l'attacco ma paghi tante carte quanto il livello dell'attacco", () => {
    let s = attivata(attivata(partita(), "anna", "antonio-2"), "bruno", "giuseppe-2"); // Alta idratazione, livello 2
    manoDi(s, "bruno", 1, 2, 3, 4);
    s = attacca(s, "antonio-2", { giocatore: "bruno" });
    expect(rifiutata(s, "bruno", { tipo: "difendi", carta: "giuseppe-2#1", carte: ["bruno0"] })).toMatch(/parcella/);
    s = difendi(s, "bruno", "giuseppe-2", { carte: ["bruno0", "bruno1"] });
    expect(g(s, "bruno").mano.map((c) => c.id)).toEqual(["bruno2", "bruno3"]);
  });

  it("Si arrabbia: annulli, e chi ti ha attaccato scarta 1 carta e una sua carta carica si stanca", () => {
    let s = attivata(bruno_si_difende("francesco-3", 3), "anna", "chicca-1");
    manoDi(s, "anna", 5, 6);
    s = difendi(s, "bruno", "francesco-3");
    expect(g(s, "anna").mano).toHaveLength(1);
    expect(g(s, "anna").attivati.find((a) => a.copia.carta === "chicca-1")!.stanca).toBe(1);
  });

  it("Cella frigorifera: la carta che ha attaccato ci mette 1 turno in più", () => {
    const s = difendi(bruno_si_difende("sara-e-giuseppe-2"), "bruno", "sara-e-giuseppe-2");
    expect(g(s, "anna").attivati[0]!.stanca).toBe(2);
  });

  it("Ho appena lavato a terra e Taurasi: chi ti ha attaccato fa 1 mossa in meno", () => {
    const s = difendi(bruno_si_difende("nonna-maddalena-2"), "bruno", "nonna-maddalena-2");
    expect(g(s, "anna").mosseProssimoTurno).toBe(-1);
  });

  it("Nuvola di fumo: annulli e nessuno ti attacca fino al tuo prossimo turno; si può anche usare prima", () => {
    let s = difendi(bruno_si_difende("nonna-patrizia-2"), "bruno", "nonna-patrizia-2");
    expect(g(s, "bruno").protetto).toBe(true);
    let t = attivata(attivata(partita(), "anna", "nonna-patrizia-2"), "bruno", "toto-1");
    t = attacca(t, "nonna-patrizia-2");
    expect(g(t, "anna").protetto).toBe(true);
    void s;
  });

  it("Benedizione: nel tuo turno, fino al tuo prossimo turno nessuno può essere attaccato", () => {
    let s = attivata(attivata(partita(), "anna", "don-pasquale"), "anna", "toto-1");
    s = attacca(s, "don-pasquale");
    expect(s.benedizione).toBe("anna");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" })).toMatch(/non può essere attaccato/);
    for (const _ of s.ordine) {
      s.turno.mosseRimaste = 0;
      s.giocatori[s.turno.giocatore]!.mano = [];
      s = fai(s, s.turno.giocatore, { tipo: "fineTurno", scarta: [] });
    }
    expect(s.benedizione).toBeNull();
  });

  it("Non ti sento: chi ti ha attaccato non può riattaccarti in questo giro", () => {
    let s = difendi(bruno_si_difende("donato"), "bruno", "donato");
    attivata(s, "anna", "nicole");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "nicole#1", potere: "parla-parla-parla", giocatore: "bruno" })).toMatch(/non può essere attaccato/);
    s = attacca(s, "nicole", { giocatore: "carla" }); // gli altri sì
    expect(g(s, "carla").zittoProssimoTurno).toBe(true);
  });

  it("Mutandoni di lana: fino al tuo prossimo turno nessuna tua carta si stanca", () => {
    const s = difendi(bruno_si_difende("nonno-antonio-2"), "bruno", "nonno-antonio-2");
    expect(g(s, "bruno").nonStancabile).toBe(true);
    attivata(s, "anna", "zio-salvatore-2");
    attivata(s, "bruno", "chicca-1");
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere" && m.potere === "versa-il-vino" && m.giocatore === "bruno")).toBe(false);
  });

  it("Chiusa in camera: nessuno guarda o prende i tuoi personaggi nascosti", () => {
    let s = difendi(bruno_si_difende("roberta-2"), "bruno", "roberta-2");
    g(s, "bruno").nascosti = [copia("chicca-1")];
    attivata(s, "anna", "checca-1");
    s = attacca(s, "checca-1", { giocatore: "bruno" }); // Lingua Glabra
    expect(s.turno.rivelati).toEqual([]);
    expect(g(s, "bruno").nascosti).toHaveLength(1);
  });

  it("Una fetta di torta?: annulli anche un attacco di livello 3; tu peschi 2 carte, chi ti ha attaccato 1", () => {
    const s = bruno_si_difende("claudia-3", 3);
    const dopo = difendi(s, "bruno", "claudia-3");
    expect(g(dopo, "bruno").mano).toHaveLength(5); // le sue 3 restano (il bastone non colpisce) + 2 dolci
    expect(g(dopo, "bruno").attivati[1]!.stanca).toBe(0);
    expect(g(dopo, "anna").mano).toHaveLength(1);
  });

  it("Guardia medica: l'attacco passa, ma le carte scartate tornano e le carte stancate si ricaricano", () => {
    const s = difendi(bruno_si_difende("zia-diana", 1), "bruno", "zia-diana");
    expect(g(s, "bruno").mosseProssimoTurno).toBe(-1); // Si incanta passa (non è un danno da curare)
    let t = attivata(attivata(partita(), "anna", "francesco-2"), "bruno", "zia-diana");
    attivata(t, "bruno", "chicca-1");
    manoDi(t, "bruno", 4, 5);
    t = attacca(t, "francesco-2", { giocatore: "bruno", bersaglio: "chicca-1#1" }); // Smash: stanca + scarta 1
    t = difendi(t, "bruno", "zia-diana");
    expect(g(t, "bruno").mano).toHaveLength(2);
    expect(g(t, "bruno").attivati.find((a) => a.copia.carta === "chicca-1")!.stanca).toBe(0);
  });

  it("Paesano ferma solo il livello 1, Aglianico fino al 2, Taurasi tutto", () => {
    const conVino = (vino: string, codiceVino: number[]) => {
      let s = attivata(partita(), "anna", "nonno-antonio-3");
      attivata(s, "bruno", "chicca-1");
      g(s, "bruno").nascosti = [copia(vino)];
      manoDi(s, "bruno", ...codiceVino);
      s = attacca(s, "nonno-antonio-3", { giocatore: "bruno", bersaglio: "chicca-1#1" });
      return mosseValide(s, "bruno").some((m) => m.tipo === "difendi");
    };
    expect(conVino("paesano", [5])).toBe(false);
    expect(conVino("aglianico", [5, 5])).toBe(false);
    expect(conVino("taurasi", [5, 5, 5])).toBe(true);
  });

  it("Campari e Lioni: annulli e peschi; Nevicava: per il resto del giro nessuno attacca", () => {
    let s = attivata(partita(), "anna", "toto-1");
    g(s, "bruno").nascosti = [copia("nevicava-non-e-potuto-venire")];
    manoDi(s, "bruno", 1, 2);
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    s = difendi(s, "bruno", "nevicava-non-e-potuto-venire", {
      combinazione: [
        { tipo: "numero", id: "bruno0", valore: 1 },
        { tipo: "numero", id: "bruno1", valore: 2 },
      ],
    });
    expect(s.tregua).toBe(2);
    attivata(s, "anna", "nicole");
    expect(mosseValide(s, "anna").some((m) => m.tipo === "potere" && m.potere === "parla-parla-parla")).toBe(false);

    let t = attivata(partita(), "anna", "toto-1");
    g(t, "bruno").nascosti = [copia("sono-andato-a-lioni-a-fa-a-spesa")];
    manoDi(t, "bruno", 1, 2);
    t = attacca(t, "toto-1", { giocatore: "bruno" });
    t = difendi(t, "bruno", "sono-andato-a-lioni-a-fa-a-spesa", {
      combinazione: [
        { tipo: "numero", id: "bruno0", valore: 1 },
        { tipo: "numero", id: "bruno1", valore: 2 },
      ],
    });
    expect(g(t, "bruno").mano).toHaveLength(2);
  });

  it("ci si difende una volta sola per attacco", () => {
    let s = attivata(bruno_si_difende("chicca-3"), "anna", "chicca-3", 0, 2); // anche anna ha E se poi te ne penti?
    s = difendi(s, "bruno", "chicca-3"); // torna ad anna, che può difendersi
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "anna" });
    s = fai(s, "anna", { tipo: "difendi", carta: "chicca-3#2" }); // torna a bruno (chi gliel'ha rimandato), che si è già difeso
    expect(s.turno.attesa).toBeNull();
    expect(g(s, "bruno").mosseProssimoTurno).toBe(-1);
  });
});

/* ---------------- poteri che copiano ---------------- */

describe("poteri che copiano", () => {
  it("Sempre la stessa storia: copia l'ultimo potere usato al tavolo, anche un attacco", () => {
    let s = attivata(attivata(partita(), "anna", "toto-1"), "anna", "nonno-salvatore-3");
    s = attacca(s, "toto-1", { giocatore: "bruno" });
    s = attacca(s, "nonno-salvatore-3", { giocatore: "carla" });
    expect(g(s, "carla").mosseProssimoTurno).toBe(-1);
    expect(s.registro.find((f) => f.tipo === "attacco" && f.bersagli[0] === "carla")).toMatchObject({ carta: "toto-1", potere: "si-incanta" });
  });

  it("Giacca al rovescio: usi il potere di una carta carica di un avversario, che non si stanca", () => {
    let s = attivata(attivata(partita(), "anna", "squacqualacchione-2"), "bruno", "generoso-3");
    s = attacca(s, "squacqualacchione-2", { fonte: "generoso-3#1", scelte: ["caffe", "birra"] });
    expect(s.turno.mosseRimaste).toBe(4);
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(0);
    expect(g(s, "anna").attivati[0]!.stanca).toBe(2);
  });

  it("i poteri che copiano non copiano le difese che si usano quando si è attaccati", () => {
    const s = attivata(attivata(partita(), "anna", "squacqualacchione-2"), "bruno", "antonio-3");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "squacqualacchione-2#1", potere: "giacca-al-rovescio", fonte: "antonio-3#1" })).toMatch(/copiare/);
  });
});

describe("tutti gli attacchi", () => {
  it("ogni attacco (personaggi e carte attacco) si può usare e le carte non si perdono", () => {
    const attacchi = CARTE.filter((c) => c.poteri.some((p) => p.tipo === "attacco"));
    expect(attacchi.length).toBe(32);
    for (const c of attacchi) {
      const s = partita();
      if (c.categoria === "personaggio") attivata(s, "anna", c.id);
      else g(s, "anna").attacchi = [copia(c.id)];
      manoDi(s, "anna", 1, 2, 2, 3, 3, 3, 4);
      attivata(s, "anna", "chicca-1", 0, 2);
      for (const chi of ["bruno", "carla"]) {
        manoDi(s, chi, 5, 6, 7);
        g(s, chi).nascosti = [copia("chicca-1", chi === "bruno" ? 3 : 4)];
        attivata(s, chi, "generoso-2", 0, chi === "bruno" ? 5 : 6);
      }
      const prima = contaCarte(s);
      const mosse = mosseValide(s, "anna").filter((m) => (m.tipo === "potere" || m.tipo === "usaCarta") && m.carta.startsWith(`${c.id}#`));
      expect(mosse.length, c.id).toBeGreaterThan(0);
      for (const m of mosse) {
        let dopo = fai(s, "anna", m);
        // chi è attaccato lascia passare (con la prima scelta proposta)
        while (dopo.turno.attesa) {
          const chi = dopo.turno.attesa.giocatore;
          dopo = fai(dopo, chi, mosseValide(dopo, chi)[0]!);
        }
        expect(contaCarte(dopo), c.id).toEqual(prima);
      }
    }
  });
});

describe("Simone e Annalisa", () => {
  it("Invasione di campo: 2 avversari a scelta; ognuno sceglie quale carta far stancare; Simone pesca 1 carta per ogni colpito", () => {
    let s = attivata(partita(), "anna", "simone-3");
    attivata(attivata(s, "bruno", "toto-1"), "bruno", "nonna-dina-1");
    attivata(s, "carla", "toto-2");
    expect(rifiutata(s, "anna", { tipo: "potere", carta: "simone-3#1", potere: "invasione-di-campo", giocatori: ["bruno"] })).toMatch(/2 avversari/);
    expect(mosseValide(s, "anna")).toContainEqual({ tipo: "potere", carta: "simone-3#1", potere: "invasione-di-campo", giocatori: ["bruno", "carla"] });
    s = attacca(s, "simone-3", { giocatori: ["bruno", "carla"] });
    // Bruno ha 2 carte cariche: sceglie lui quale far stancare
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" });
    s = subisci(s, "bruno", { bersaglio: "nonna-dina-1#1" });
    expect(g(s, "bruno").attivati.map((x) => x.stanca)).toEqual([0, 1]);
    // Carla ne ha una sola: colpita subito
    expect(g(s, "carla").attivati[0]!.stanca).toBe(2);
    expect(s.turno.attesa).toBeNull();
    expect(g(s, "anna").mano).toHaveLength(2);
  });

  it("Invasione di campo in due giocatori: un avversario solo", () => {
    let s = attivata(attivata(partita(2), "anna", "simone-3"), "bruno", "toto-1");
    s = attacca(s, "simone-3", { giocatori: ["bruno"] });
    expect(g(s, "bruno").attivati[0]!.stanca).toBe(1);
    expect(g(s, "anna").mano).toHaveLength(1);
  });

  it("Scudo da gladiatore: annulla; se l'attacco era di livello 1 chi ha attaccato scarta 1 carta a caso", () => {
    let s = bruno_si_difende("simone-2");
    manoDi(s, "anna", 5);
    s = difendi(s, "bruno", "simone-2");
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(s, "anna").mano).toHaveLength(0);
    expect(s.scarti.numeri.map((c) => c.valore)).toEqual([5]);

    let t = attivata(attivata(partita(), "anna", "zio-salvatore-2"), "bruno", "simone-2");
    manoDi(t, "anna", 5);
    t = attacca(t, "zio-salvatore-2", { giocatore: "bruno", bersaglio: "simone-2#1" });
    t = difendi(t, "bruno", "simone-2");
    expect(g(t, "anna").mano).toHaveLength(1);
  });

  it("Drago Tascabile: annulla un attacco di livello 1 e porta via 1 carta numero a chi ha attaccato", () => {
    let s = bruno_si_difende("annalisa-1");
    manoDi(s, "anna", 7);
    s = difendi(s, "bruno", "annalisa-1");
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(s, "anna").mano).toHaveLength(0);
    expect(g(s, "bruno").mano.map((c) => c.valore)).toEqual([7]);
    // difesa di livello 1: non ferma un attacco di livello 3
    const t = bruno_si_difende("annalisa-1", 3);
    expect(mosseValide(t, "bruno").some((m) => m.tipo === "difendi" && m.carta === "annalisa-1#1")).toBe(false);
  });
});

describe("Nonna Maria e Nonno Rafiluccio (attacchi e difese)", () => {
  it("Una sigaretta fuori al bar: nel suo prossimo turno l'avversario non può attivare personaggi", () => {
    let s = attivata(partita(2), "anna", "nonna-maria-2");
    s = attacca(s, "nonna-maria-2", { giocatore: "bruno" });
    g(s, "bruno").nascosti = [copia("donatina-1")]; // 2 carte con somma 5
    manoDi(s, "bruno", 2, 3);
    s.turno.mosseRimaste = 0;
    s = fai(s, "anna", { tipo: "fineTurno", scarta: [] });
    expect(s.turno.giocatore).toBe("bruno");
    expect(vistaGiocatore(s, "bruno").turno.senzaAttivare).toBe(true);
    expect(mosseValide(s, "bruno").some((m) => m.tipo === "attiva")).toBe(false);
    expect(
      rifiutata(s, "bruno", {
        tipo: "attiva",
        carta: "donatina-1#1",
        combinazione: [
          { tipo: "numero", id: "bruno0", valore: 2 },
          { tipo: "numero", id: "bruno1", valore: 3 },
        ],
      }),
    ).toMatch(/sigaretta/);
  });

  it("La cionna: con le male parole ferma anche un attacco di livello 3 e chi attacca scarta 1 carta a caso", () => {
    let s = bruno_si_difende("nonna-maria-3", 3);
    manoDi(s, "anna", 4);
    s = difendi(s, "bruno", "nonna-maria-3");
    expect(g(s, "bruno").mano).toHaveLength(3); // Il bastone fermato: non scarta niente
    expect(g(s, "anna").mano).toHaveLength(0);
  });

  it("Tiro su un muro: ferma un attacco di livello 1 e fino al suo prossimo turno nessun attacco di livello 1 lo colpisce", () => {
    let s = bruno_si_difende("nonno-rafiluccio-1");
    s = difendi(s, "bruno", "nonno-rafiluccio-1");
    expect(g(s, "bruno").mosseProssimoTurno).toBe(0);
    expect(g(s, "bruno").muro).toBe(true);
    // un altro attacco di livello 1 non ha effetto
    attivata(s, "anna", "checca-1"); // Schietta, livello 1
    g(s, "bruno").nascosti = [copia("chicca-1")];
    s = attacca(s, "checca-1", { giocatore: "bruno" });
    expect(s.turno.rivelati).toEqual([]);
    expect(s.registro.at(-1)).toMatchObject({ tipo: "protetto", giocatore: "bruno" });
  });

  it("Brontola tutto il giorno: l'avversario sceglie se dare 2 carte numero o saltare il prossimo turno", () => {
    let s = attivata(partita(), "anna", "nonno-rafiluccio-3");
    manoDi(s, "bruno", 4, 5, 6);
    s = attacca(s, "nonno-rafiluccio-3", { giocatore: "bruno" });
    expect(s.turno.attesa).toEqual({ tipo: "difesa", giocatore: "bruno" });
    expect(mosseValide(s, "bruno")).toEqual([{ tipo: "subisci", carte: ["bruno0", "bruno1"] }, { tipo: "subisci" }]);
    const dando = subisci(s, "bruno", { carte: ["bruno1", "bruno2"] });
    expect(g(dando, "anna").mano.map((c) => c.id).sort()).toEqual(["bruno1", "bruno2"]);
    expect(g(dando, "bruno").saltaProssimoTurno).toBe(false);
    const saltando = subisci(s, "bruno");
    expect(g(saltando, "bruno").mano).toHaveLength(3);
    expect(g(saltando, "bruno").saltaProssimoTurno).toBe(true);
    // con meno di 2 carte salta il turno e basta
    let t = attivata(partita(), "anna", "nonno-rafiluccio-3");
    manoDi(t, "bruno", 4);
    t = attacca(t, "nonno-rafiluccio-3", { giocatore: "bruno" });
    expect(g(t, "bruno").saltaProssimoTurno).toBe(true);
  });
});
