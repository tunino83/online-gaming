import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARTE, carta, cartePersona, eAttacco, nomiImmagine } from "./carte";
import { descriviCodice, numeroCarte, puoPagare } from "./codici";
import type { CartaNumero, Valore } from "./tipi-carte";

/* ---------------- tabelle di docs/famiglia/carte.md ---------------- */

const TESTO = readFileSync(new URL("../../../docs/famiglia/carte.md", import.meta.url), "utf8");

/** Righe della tabella sotto il titolo indicato, come liste di celle. */
function tabella(titolo: string): string[][] {
  const sezione = TESTO.split(`## ${titolo}`)[1]?.split("\n## ")[0] ?? "";
  return sezione
    .split(/\r?\n/)
    .filter((r) => r.startsWith("|"))
    .slice(2) // intestazione e riga di separazione
    .map((r) =>
      r
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim()),
    );
}

/** "Giuseppe (avvocato)" → "Giuseppe"; "🍷 Paesano" → "Paesano". */
const pulisci = (s: string) => s.replace(/\s*\(.*\)$/, "").replace(/^[^\p{L}]+/u, "");

const EMOJI = { attacco: "⚔️", difesa: "🛡️", aiuto: "✨" } as const;

describe("le carte corrispondono a docs/famiglia/carte.md", () => {
  const righe = [...tabella("Adulti"), ...tabella("Carte singole")].filter((r) => !r.includes("da definire"));

  it("ci sono tutti i personaggi della tabella, e solo quelli", () => {
    const personaggi = CARTE.filter((c) => c.categoria === "personaggio");
    expect(personaggi.length).toBe(righe.length);
  });

  for (const [persona, liv, nomeCarta, tipo, codice] of righe) {
    const nome = pulisci(persona!);
    it(`${nome} livello ${liv}: potere, tipo e codice`, () => {
      const c = cartePersona(CARTE.find((x) => x.nome === nome)?.persona ?? "").find((x) => x.livello === Number(liv));
      expect(c, `${nome} ${liv}`).toBeDefined();
      expect(c!.poteri.map((p) => p.nome).join(" / ")).toBe(nomeCarta);
      expect([...new Set(c!.poteri.map((p) => EMOJI[p.tipo]))].join("")).toBe(tipo);
      expect(descriviCodice(c!.codice)).toBe(codice);
    });
  }

  it("carte difesa: copie e codice", () => {
    const righeDifesa = tabella("Carte difesa (0 punti, solo d'emergenza)");
    expect(righeDifesa.length).toBe(CARTE.filter((c) => c.categoria === "difesa").length);
    for (const [nome, copie, codice] of righeDifesa) {
      const c = CARTE.find((x) => x.nome === pulisci(nome!));
      expect(c?.categoria, nome).toBe("difesa");
      expect(c!.copie).toBe(Number(copie));
      expect(descriviCodice(c!.codice)).toBe(codice);
    }
  });

  it("carte attacco: livello, copie e codice", () => {
    const righeAttacco = tabella("Carte attacco (0 punti, si usano una volta)");
    expect(righeAttacco.length).toBe(CARTE.filter((c) => c.categoria === "attacco").length);
    for (const [nome, liv, copie, codice] of righeAttacco) {
      const c = CARTE.find((x) => x.nome === pulisci(nome!));
      expect(c?.categoria, nome).toBe("attacco");
      expect(c!.livello).toBe(Number(liv));
      expect(c!.copie).toBe(Number(copie));
      expect(descriviCodice(c!.codice)).toBe(codice);
    }
  });
});

describe("regole sui dati delle carte", () => {
  it("gli id sono unici", () => {
    expect(new Set(CARTE.map((c) => c.id)).size).toBe(CARTE.length);
  });

  it("95 carte nel mazzo (101 meno le 6 di Simone e Annalisa, ancora da definire)", () => {
    expect(CARTE.reduce((s, c) => s + c.copie, 0)).toBe(95);
  });

  it("personaggi: punti uguali al livello, ricarica uguale al livello (Christian e Roberta 1: 2; carte blu: 0)", () => {
    for (const c of CARTE.filter((x) => x.categoria === "personaggio")) {
      expect(c.punti, c.id).toBe(c.livello);
      if (c.poteri.every((p) => p.blu)) expect(c.ricarica, c.id).toBe(0); // le blu non si stancano
      else expect(c.ricarica, c.id).toBe(c.id === "christian" || c.id === "roberta-1" ? 2 : c.livello);
    }
  });

  it("carte difesa e attacco: niente punti e niente ricarica (si usano una volta)", () => {
    for (const c of CARTE.filter((x) => x.categoria !== "personaggio")) {
      expect(c.punti, c.id).toBe(0);
      expect(c.ricarica, c.id).toBe(0);
    }
  });

  it("codici dei personaggi: livello 1 = 2 carte, livello 2 = 3 carte, livello 3 = 4 o 5 carte", () => {
    const attese = { 1: [2], 2: [3], 3: [4, 5] } as const;
    for (const c of CARTE.filter((x) => x.categoria === "personaggio")) {
      expect(attese[c.livello], c.id).toContain(numeroCarte(c.codice));
    }
  });

  it("ogni carta ha 1 o 2 poteri, e non mescola mai attacco e non attacco", () => {
    for (const c of CARTE) {
      expect(c.poteri.length, c.id).toBeGreaterThanOrEqual(1);
      expect(c.poteri.length, c.id).toBeLessThanOrEqual(2);
      const attacchi = c.poteri.filter((p) => p.tipo === "attacco").length;
      expect(attacchi === 0 || attacchi === c.poteri.length, c.id).toBe(true);
    }
  });

  it("le carte difesa difendono e le carte attacco attaccano", () => {
    for (const c of CARTE.filter((x) => x.categoria === "difesa")) expect(c.poteri[0]!.tipo).toBe("difesa");
    for (const c of CARTE.filter((x) => x.categoria === "attacco")) expect(eAttacco(c)).toBe(true);
  });

  it("gli adulti hanno 3 carte (livelli 1, 2, 3), le carte singole una", () => {
    for (const persona of new Set(CARTE.filter((c) => c.categoria === "personaggio").map((c) => c.persona))) {
      const livelli = cartePersona(persona).map((c) => c.livello);
      expect([[1, 2, 3], [livelli[0]]].map(String), persona).toContain(String(livelli));
    }
    expect(cartePersona("antonio").map((c) => c.id)).toEqual(["antonio-1", "antonio-2", "antonio-3"]);
    expect(carta("toto-2").nome).toBe("Totò");
  });

  it("immagini: prima quella della carta, poi quella della persona; tutte elencate in LEGGIMI.md", () => {
    expect(nomiImmagine(carta("antonio-2"))).toEqual(["antonio-2", "antonio"]);
    expect(nomiImmagine(carta("nicole"))).toEqual(["nicole"]);
    const leggimi = readFileSync(new URL("../immagini/LEGGIMI.md", import.meta.url), "utf8");
    for (const c of CARTE) for (const n of nomiImmagine(c)) expect(leggimi, n).toContain(`\`${n}\``);
  });

  it("ogni codice si può pagare con le carte numero del mazzo (1–8, 7 copie)", () => {
    const mazzo: CartaNumero[] = [];
    for (let v = 1; v <= 8; v++) for (let k = 0; k < 7; k++) mazzo.push({ id: `n${v}-${k}`, valore: v as Valore });
    for (const c of CARTE) expect(puoPagare({ mano: mazzo, mancia: [] }, c.codice), c.id).toBe(true);
  });
});
