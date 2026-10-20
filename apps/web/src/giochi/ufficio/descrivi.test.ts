import { type Mossa, type StatoPartita, applicaMossa, mosseValide, personaggio, setup, vistaGiocatore } from "@og/ufficio";
import { describe, expect, it } from "vitest";
import { aPersona, descriviEvento, descriviMossa, gruppoMossa, ilNumero, ordinePotere, raccogliCarte } from "./descrivi";

/** Partita a 2 con una situazione preparata per A. */
function situazione(prepara: (s: StatoPartita) => void) {
  const s = setup(["A", "B"], {}, 1);
  s.ordine = ["A", "B"];
  s.turno = { giocatore: "A", mosseRimaste: 3, virtualiUsate: [], bruciaGratisUsata: false, iniziato: false, attesa: null };
  prepara(s);
  const v = vistaGiocatore(s, "A");
  const testo = (m: Mossa) => descriviMossa(m, v, raccogliCarte(v), (id) => ({ A: "Anna", B: "Bruno" })[id] ?? id);
  return { s, v, testo };
}

describe("italiano", () => {
  it("articoli davanti ai numeri e ai nomi", () => {
    expect([1, 2, 7, 8].map(ilNumero)).toEqual(["l'1", "il 2", "il 7", "l'8"]);
    expect(aPersona("Anna")).toBe("ad Anna");
    expect(aPersona("Bruno")).toBe("a Bruno");
  });
});

describe("descrizione delle mosse", () => {
  it("prendere, pescare, bruciare", () => {
    const { s, testo } = situazione(() => {});
    const numero = s.tavolo.numeri[2]!.valore;
    expect(testo({ tipo: "prendiNumero", posizione: 2 })).toBe(`Prendi ${ilNumero(numero)} dal tavolo`);
    expect(testo({ tipo: "prendiPersonaggio", posizione: 0 })).toMatch(/^Prendi .+ dal tavolo$/);
    expect(testo({ tipo: "pescaNumero" })).toBe("Pesca una carta numero coperta");
    expect(testo({ tipo: "brucia" })).toBe("Brucia le 4 carte numero del tavolo");
  });

  it("attivare con un diamante +1 e con la carta di un nano", () => {
    const { testo } = situazione((s) => {
      s.giocatori.A!.mano = [{ id: "n7", valore: 7 }, { id: "n8", valore: 8 }];
      s.giocatori.A!.diamanti = [{ id: "d3", tipo: "valore", valore: 3 }];
      s.giocatori.A!.posti = [{ id: "hg", personaggio: "hansel-e-gretel" }];
      s.giocatori.A!.attivati = [{ id: "nano5", personaggio: "nano-5" }];
    });
    expect(
      testo({
        tipo: "attiva",
        carta: "hg",
        combinazione: [
          { tipo: "numero", id: "n7", valore: 8, modifica: { diamante: "d3", delta: 1 } },
          { tipo: "numero", id: "n8", valore: 8 },
        ],
      }),
    ).toBe("Attiva Hansel e Gretel con 8 (7+1 con ◆3) + 8");
    expect(testo({ tipo: "attiva", carta: "hg", combinazione: [{ tipo: "virtuale", fonte: "nano5", valore: 5 }] })).toBe(
      "Attiva Hansel e Gretel con 5 (carta di Mammolo)",
    );
  });

  it("Medusa e Fatina nominano l'avversario", () => {
    const { testo } = situazione((s) => {
      s.giocatori.A!.posti = [{ id: "strega", personaggio: "strega" }];
      s.giocatori.B!.posti = [{ id: "leone", personaggio: "leone" }];
    });
    expect(testo({ tipo: "attiva", carta: "strega", combinazione: [], bersaglio: { giocatore: "B", carta: "leone" } })).toContain(
      "scartando Leone di Bruno",
    );
    expect(testo({ tipo: "attiva", carta: "strega", combinazione: [], avversario: "B" })).toContain("guardando la mano di Bruno");
  });

  it("fine turno con scarti", () => {
    const { testo } = situazione((s) => {
      s.giocatori.A!.mano = [{ id: "n1", valore: 1 }, { id: "n2", valore: 2 }];
    });
    expect(testo({ tipo: "fineTurno", scarta: ["n1", "n2"], cambiaMano: false })).toBe("Fine turno scartando 1, 2");
  });

  it("ogni mossa proposta in una partita vera ha una descrizione e un gruppo", () => {
    let s = setup(["A", "B", "C"], {}, 11);
    for (let passo = 0; passo < 300; passo++) {
      const chi = s.turno.giocatore;
      const v = vistaGiocatore(s, chi);
      const c = raccogliCarte(v);
      const mosse = mosseValide(s, chi);
      for (const m of mosse) {
        const t = descriviMossa(m, v, c, (id) => id);
        expect(t.length).toBeGreaterThan(3);
        expect(t).not.toContain("undefined");
        expect(t).not.toContain("?");
        expect(["scelta", "attiva", "tavolo", "gratis", "fine"]).toContain(gruppoMossa(m));
      }
      const attiva = mosse.find((m) => m.tipo === "attiva");
      const r = applicaMossa(s, chi, attiva ?? mosse[passo % mosse.length]!);
      if (!r.ok) throw new Error(r.errore);
      s = r.stato;
      if (s.finita) break;
    }
  });
});

describe("frasi del registro", () => {
  const nick = (id: string) => ({ A: "Anna", B: "Bruno" })[id] ?? id;
  it("dal punto di vista di chi legge", () => {
    const e = { n: 1, giocatore: "B", tipo: "prendiNumero", valore: 8 } as const;
    expect(descriviEvento(e, nick, "A")).toBe("Bruno ha preso l'8 dal tavolo");
    expect(descriviEvento(e, nick, "B")).toBe("Hai preso l'8 dal tavolo");
  });

  it("attivazioni con Medusa e fine turno", () => {
    expect(
      descriviEvento(
        { n: 2, giocatore: "A", tipo: "attiva", personaggio: "strega", punti: 1, valori: [1, 2, 4], bersaglio: { giocatore: "B", personaggio: "leone" } },
        nick,
        "B",
      ),
    ).toBe("Anna ha attivato Medusa con 1, 2, 4 (+1), scartando Leone tuo");
    expect(descriviEvento({ n: 3, giocatore: "A", tipo: "fineTurno", scartate: 2, cambiaMano: false }, nick, "B")).toBe(
      "Anna ha chiuso il turno scartando 2 carte",
    );
  });

  it("ogni evento di una partita vera ha una frase sensata", () => {
    let s = setup(["A", "B", "C"], {}, 4);
    for (let passo = 0; passo < 300 && !s.finita; passo++) {
      const chi = s.turno.giocatore;
      const mosse = mosseValide(s, chi);
      const r = applicaMossa(s, chi, mosse.find((m) => m.tipo === "attiva") ?? mosse[passo % mosse.length]!);
      if (!r.ok) throw new Error(r.errore);
      s = r.stato;
    }
    for (const e of s.registro) {
      const t = descriviEvento(e, (id) => id, "A");
      expect(t).not.toContain("undefined");
      expect(t.length).toBeGreaterThan(8);
    }
  });
});

describe("etichette dei poteri blu", () => {
  it("ogni potere blu dei personaggi ha un'etichetta breve dedicata", async () => {
    const { PERSONAGGI } = await import("@og/ufficio");
    const { etichettaPotere } = await import("./descrivi");
    for (const p of PERSONAGGI) {
      for (const potere of p.poteri.filter((x) => x.colore === "blu")) {
        const e = etichettaPotere(potere.effetto);
        expect(e.testo, p.nome).not.toBe("potere");
        expect(e.testo.length, p.nome).toBeLessThanOrEqual(16);
      }
    }
  });
});

describe("ordine dei poteri blu", () => {
  it("prima i nani dall'1 al 7, poi Fenice e Drago, poi gli altri", () => {
    const ids = ["robin-hood", "fenice", "nano-7", "drago", "nano-2", "bacchetta-magica", "nano-5"];
    const ordinati = [...ids].sort((a, b) => ordinePotere(personaggio(a).poteri[0]!.effetto) - ordinePotere(personaggio(b).poteri[0]!.effetto));
    expect(ordinati).toEqual(["nano-2", "nano-5", "nano-7", "fenice", "drago", "robin-hood", "bacchetta-magica"]);
  });
});

