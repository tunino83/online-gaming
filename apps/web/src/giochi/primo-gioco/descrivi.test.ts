import { type Mossa, type StatoPartita, applicaMossa, mosseValide, setup, vistaGiocatore } from "@og/primo-gioco";
import { describe, expect, it } from "vitest";
import { aPersona, descriviMossa, gruppoMossa, ilNumero, raccogliCarte } from "./descrivi";

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
      "Attiva Hansel e Gretel con 5 (dal Nano del 5)",
    );
  });

  it("Strega e Fatina nominano l'avversario", () => {
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
        expect(["scelta", "attiva", "mosse", "gratis", "fine"]).toContain(gruppoMossa(m));
      }
      const attiva = mosse.find((m) => m.tipo === "attiva");
      const r = applicaMossa(s, chi, attiva ?? mosse[passo % mosse.length]!);
      if (!r.ok) throw new Error(r.errore);
      s = r.stato;
      if (s.finita) break;
    }
  });
});
