import { describe, expect, it } from "vitest";
import { pezziCodice, simboloProvvisorio, tipoCarta } from "./aspetto";
import { PERSONAGGI, personaggio } from "./personaggi";

describe("aspetto delle carte", () => {
  it("colore ed etichetta in base al tipo di potere", () => {
    expect(tipoCarta(personaggio("nano-5"))).toEqual({ colore: "blu", etichetta: "Blu - sempre" });
    expect(tipoCarta(personaggio("strega"))).toEqual({ colore: "rosso", etichetta: "Rosso - una volta" });
    expect(tipoCarta(personaggio("xena")).colore).toBe("misto");
    expect(tipoCarta(personaggio("lucciola-444-555")).colore).toBe("speciale");
    expect(tipoCarta(personaggio("leone")).colore).toBe("nessuno");
  });

  it("codice esatto: una tessera per numero", () => {
    expect(pezziCodice(personaggio("nano-5").codice)).toEqual([
      { tipo: "numero", testo: "5" },
      { tipo: "numero", testo: "5" },
    ]);
  });

  it("codici generici, combinati e alternativi", () => {
    expect(pezziCodice(personaggio("goblin").codice)).toEqual([
      { tipo: "generica", testo: "=" },
      { tipo: "generica", testo: "=" },
      { tipo: "nota", testo: "coppia" },
    ]);
    expect(pezziCodice(personaggio("capitan-uncino").codice).map((p) => p.tipo)).toEqual(["numero", "numero", "numero", "piu", "diamante"]);
    expect(pezziCodice(personaggio("lucciola-333-666").codice).map((p) => p.tipo)).toEqual([
      "numero", "numero", "numero", "oppure", "numero", "numero", "numero",
    ]);
  });

  it("ogni personaggio ha un codice disegnabile e un simbolo provvisorio", () => {
    for (const p of PERSONAGGI) {
      expect(pezziCodice(p.codice).length, p.nome).toBeGreaterThan(0);
      expect(simboloProvvisorio(p), p.nome).not.toBe("❔");
    }
  });
});
