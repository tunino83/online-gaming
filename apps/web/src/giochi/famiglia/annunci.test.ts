import { type Mossa, type StatoPartita, applicaMossa, setup, vistaGiocatore } from "@og/famiglia";
import { describe, expect, it } from "vitest";
import { annunciTraViste } from "./annunci";

const nick = (id: string) => ({ anna: "Anna", bruno: "Bruno", carla: "Carla" })[id] ?? id;

function partita(): StatoPartita {
  const s = setup(["anna", "bruno", "carla"], {}, 1);
  s.ordine = ["anna", "bruno", "carla"];
  s.turno.giocatore = "anna";
  s.turno.mosseRimaste = 3;
  return s;
}

function fai(s: StatoPartita, chi: string, m: Mossa): StatoPartita {
  const r = applicaMossa(s, chi, m);
  if (!r.ok) throw new Error(r.errore);
  return r.stato;
}

/** Annunci e voci visti da `chi` dopo la mossa di anna. */
function dopoLaMossa(s: StatoPartita, m: Mossa, chi: string) {
  const prima = vistaGiocatore(s, chi);
  const dopo = vistaGiocatore(fai(s, "anna", m), chi);
  return annunciTraViste(prima, dopo, chi, nick);
}

describe("annunci a schermo", () => {
  it("un personaggio pescato e nascosto: chi lo pesca lo vede, gli altri vedono la carta coperta", () => {
    const s = partita();
    // la prima carta del mazzo è un personaggio (non una carta attacco)
    s.mazzi.personaggi.push({ id: "antonio-1#9", carta: "antonio-1" });
    expect(dopoLaMossa(s, { tipo: "pescaPersonaggio" }, "anna").annunci).toEqual([
      expect.objectContaining({ tipo: "personaggio", idCarta: "antonio-1", testo: "Hai pescato Antonio (1)" }),
    ]);
    expect(dopoLaMossa(s, { tipo: "pescaPersonaggio" }, "bruno").annunci).toEqual([
      expect.objectContaining({ tipo: "personaggio", idCarta: null, testo: "Anna pesca un personaggio" }),
    ]);
  });

  it("una carta numero pescata: chi la pesca vede il valore, gli altri la carta coperta", () => {
    const s = partita();
    s.mazzi.numeri.push({ id: "n-sette", valore: 7 });
    expect(dopoLaMossa(s, { tipo: "pescaNumero" }, "anna").annunci).toEqual([
      expect.objectContaining({ tipo: "numero", carta: { id: "n-sette", valore: 7 }, testo: "Hai pescato un 7" }),
    ]);
    expect(dopoLaMossa(s, { tipo: "pescaNumero" }, "bruno").annunci).toEqual([expect.objectContaining({ tipo: "numero", carta: null })]);
  });

  it("un'attivazione la vedono tutti, con la voce della carta", () => {
    const s = partita();
    s.giocatori.anna!.nascosti = [{ id: "donatina-1#1", carta: "donatina-1" }]; // 2 carte con somma 5
    s.giocatori.anna!.mano = [
      { id: "a", valore: 2 },
      { id: "b", valore: 3 },
    ];
    const r = dopoLaMossa(
      s,
      {
        tipo: "attiva",
        carta: "donatina-1#1",
        combinazione: [
          { tipo: "numero", id: "a", valore: 2 },
          { tipo: "numero", id: "b", valore: 3 },
        ],
      },
      "carla",
    );
    expect(r.annunci).toEqual([expect.objectContaining({ idCarta: "donatina-1", attivazione: true, testo: "Anna attiva Donatina (1)" })]); // carta aiuto: 0 punti
    expect(r.voci).toEqual([{ idCarta: "donatina-1", quando: "attiva" }]);
  });

  it("un attacco a segno dà +1 punto e compare a schermo", () => {
    const s = partita();
    s.giocatori.anna!.attivati.push({ copia: { id: "toto-1#1", carta: "toto-1" }, stanca: 0 }); // Si incanta
    expect(dopoLaMossa(s, { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" }, "carla").annunci).toContainEqual(
      expect.objectContaining({ tipo: "punto", testo: "+1 punto a Anna: attacco a segno" }),
    );
  });

  it("usare un potere fa partire la voce del suo tipo (attacco, aiuto…)", () => {
    const s = partita();
    s.giocatori.anna!.attivati.push({ copia: { id: "toto-1#1", carta: "toto-1" }, stanca: 0 }); // Si incanta (attacco)
    expect(dopoLaMossa(s, { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" }, "bruno").voci).toEqual([
      { idCarta: "toto-1", quando: "ATT", potere: "si-incanta" },
    ]);
    const t = partita();
    t.giocatori.anna!.attivati.push({ copia: { id: "nonna-dina-1#1", carta: "nonna-dina-1" }, stanca: 0 }); // Sposta i mobili (aiuto)
    expect(dopoLaMossa(t, { tipo: "potere", carta: "nonna-dina-1#1", potere: "sposta-i-mobili" }, "carla").voci).toEqual([
      { idCarta: "nonna-dina-1", quando: "AIU", potere: "sposta-i-mobili" },
    ]);
  });
});
