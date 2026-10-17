import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PERSONAGGI, personaggio } from "./personaggi";
import type { Codice, Personaggio } from "./tipi-carte";

/** Legge la tabella "Elenco personaggi" da docs/regolamento.md. */
function righeRegolamento() {
  const testo = readFileSync(new URL("../../../docs/regolamento.md", import.meta.url), "utf8");
  const sezione = testo.split("## Elenco personaggi")[1]?.split("\n## ")[0] ?? "";
  return sezione
    .split(/\r?\n/)
    .filter((r) => r.startsWith("|"))
    .slice(2) // intestazione e riga di separazione
    .map((r) => {
      const [nome, codice, punti, potere, tipo, copie] = r
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      return { nome, codice, punti: Number(punti), potere, tipo, copie: Number(copie) };
    });
}

/** Tipo del potere come scritto nella colonna "Tipo" del regolamento. */
function tipoPotere(p: Personaggio): string {
  const colori = new Set(p.poteri.map((x) => x.colore));
  if (colori.size === 0) return "—";
  if (colori.has("speciale")) return "Speciale";
  if (colori.has("rosso") && colori.has("blu")) return "Rosso + Blu";
  return colori.has("rosso") ? "Rosso" : "Blu";
}

/** Numero di carte richieste da un codice (null = variabile). */
function numeroCarte(c: Codice): number[] | null {
  switch (c.tipo) {
    case "esatto":
      return [c.valori.length];
    case "uguali":
      return [c.carte];
    case "somma":
      return c.carte === undefined ? null : [c.carte];
    case "scala":
      return [c.lunghezza];
    case "doppiaCoppia":
      return [4];
    case "parita":
      return [c.carte];
    case "diamanteQualsiasi":
      return [1];
    case "combinato": {
      const resto = numeroCarte(c.piu);
      return resto === null ? null : resto.map((n) => n + c.esatto.length);
    }
    case "alternativa":
      return c.opzioni.flatMap((o) => numeroCarte(o) ?? []);
  }
}

describe("elenco personaggi", () => {
  it("ci sono 42 personaggi per un totale di 55 carte", () => {
    expect(PERSONAGGI).toHaveLength(42);
    expect(PERSONAGGI.reduce((s, p) => s + p.copie, 0)).toBe(55);
  });

  it("gli id sono unici e si ritrovano con personaggio(id)", () => {
    expect(new Set(PERSONAGGI.map((p) => p.id)).size).toBe(42);
    expect(personaggio("leone").punti).toBe(5);
    expect(() => personaggio("inesistente")).toThrow();
  });

  it("ogni codice usa da 1 a 5 carte", () => {
    for (const p of PERSONAGGI) {
      for (const n of numeroCarte(p.codice) ?? []) {
        expect(n, p.nome).toBeGreaterThanOrEqual(1);
        expect(n, p.nome).toBeLessThanOrEqual(5);
      }
    }
  });

  it("i nani danno la carta del proprio numero, la Fenice un 8, il Drago a scelta", () => {
    for (let v = 1; v <= 7; v++) {
      expect(personaggio(`nano-${v}`).poteri[0]?.effetto).toEqual({ tipo: "cartaVirtuale", valore: v });
    }
    expect(personaggio("fenice").poteri[0]?.effetto).toEqual({ tipo: "cartaVirtuale", valore: 8 });
    expect(personaggio("drago").poteri[0]?.effetto).toEqual({ tipo: "cartaVirtuale", valore: "aScelta" });
  });

  it("Xena ha due poteri: 1 diamante (rosso) e −1 permanente (blu)", () => {
    expect(personaggio("xena").poteri).toEqual([
      { colore: "rosso", effetto: { tipo: "riceviDiamanti", quanti: 1 } },
      { colore: "blu", effetto: { tipo: "diamanteMenoUno" } },
    ]);
  });

  describe("coincide con la tabella del regolamento", () => {
    const righe = righeRegolamento();

    it("stesso numero di righe", () => {
      expect(righe).toHaveLength(PERSONAGGI.length);
    });

    PERSONAGGI.forEach((p, i) => {
      it(`${p.nome}: nome, codice, punti, potere, tipo e copie`, () => {
        const riga = righe[i];
        expect(riga).toEqual({
          nome: p.nome,
          codice: p.codiceTesto,
          punti: p.punti,
          potere: p.potereTesto,
          tipo: tipoPotere(p),
          copie: p.copie,
        });
      });
    });
  });
});
