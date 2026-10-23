import { creaCasuale } from "@og/engine";
import { describe, expect, it } from "vitest";
import { applicaMossa, mosseValide, setup } from "./regole";
import { mossaDelSostituto, utilitaPerCodice } from "./sostituto";
import type { Mossa, StatoPartita } from "./stato";
import type { CartaNumero, CartaPersonaggio, Codice, Valore } from "./tipi-carte";

let contatore = 0;
const num = (valore: number): CartaNumero => ({ id: `s-n${valore}-${++contatore}`, valore: valore as Valore });
const pers = (personaggio: string): CartaPersonaggio => ({ id: `s-${personaggio}-${++contatore}`, personaggio });

/** A di turno con 3 mosse, mani e posti vuoti, tavolo scelto dal test, niente carte con le frecce. */
function partita(numeri: number[], personaggi: string[] = ["leone", "giganti"]): StatoPartita {
  const s = setup(["A", "B"], {}, 1);
  for (const c of [...s.mazzi.numeri, ...s.scarti.numeri]) delete c.frecce;
  s.ordine = ["A", "B"];
  s.turno = { giocatore: "A", mosseRimaste: 3, virtualiUsate: [], bruciaGratisUsata: false, iniziato: false, attesa: null };
  s.tavolo.numeri = numeri.map(num);
  s.tavolo.personaggi = personaggi.map(pers);
  return s;
}

const mossa = (s: StatoPartita) => mossaDelSostituto(s, "A", creaCasuale(1));

describe("sostituto: gioca al posto di chi è fermo", () => {
  it("sceglie sempre una mossa valida, lungo partite intere", () => {
    let s = setup(["A", "B", "C"], {}, 4);
    const rng = creaCasuale(2);
    for (let i = 0; i < 400 && !s.finita; i++) {
      const chi = s.turno.giocatore;
      const m = mossaDelSostituto(s, chi, rng);
      const r = applicaMossa(s, chi, m);
      if (!r.ok) throw new Error(`${JSON.stringify(m)}: ${r.errore}`);
      s = r.stato;
    }
    expect(Math.max(...Object.values(s.giocatori).map((g) => g.punti))).toBeGreaterThan(0);
  });

  it("se può attivare un personaggio, lo attiva", () => {
    const s = partita([1, 2, 3, 4]);
    s.giocatori.A!.posti = [pers("leone")];
    s.giocatori.A!.mano = [num(8), num(8), num(8), num(8)];
    expect(mossa(s).tipo).toBe("attiva");
  });

  it("prende dal tavolo la carta numero che serve per il codice dei suoi personaggi", () => {
    // Leone si attiva con 8888: sul tavolo c'è un 8
    const s = partita([1, 2, 8, 3]);
    s.giocatori.A!.posti = [pers("leone")];
    expect(mossa(s)).toEqual({ tipo: "prendiNumero", posizione: 2 });
  });

  it("se nessuna carta serve e ha posti liberi, prende un personaggio dal tavolo (quello che vale di più)", () => {
    const s = partita([1, 2, 3, 4], ["giganti", "leone"]);
    s.giocatori.A!.posti = [pers("leone")];
    expect(mossa(s)).toEqual({ tipo: "prendiPersonaggio", posizione: 1 });
  });

  it("con i posti pieni e nessuna carta utile, pesca dal mazzo coperto", () => {
    const s = partita([1, 2, 3, 4]);
    s.giocatori.A!.posti = [pers("leone"), pers("leone")];
    expect(mossa(s)).toEqual({ tipo: "pescaNumero" });
  });

  it("a fine turno scarta le carte che non servono", () => {
    const s = partita([1, 2, 3, 4]);
    s.turno.mosseRimaste = 0;
    s.giocatori.A!.posti = [pers("leone")];
    // 6 carte con limite 5: si scarta una carta che non è un 8
    s.giocatori.A!.mano = [8, 8, 8, 1, 2, 2].map(num);
    const m = mossa(s) as Extract<Mossa, { tipo: "fineTurno" }>;
    expect(m.tipo).toBe("fineTurno");
    expect(m.scarta).toHaveLength(1);
    expect(s.giocatori.A!.mano.find((c) => c.id === m.scarta[0])!.valore).not.toBe(8);
    expect(mosseValide(s, "A").some((x) => x.tipo === "fineTurno")).toBe(true);
    expect(applicaMossa(s, "A", m).ok).toBe(true);
  });

  it("con 3 personaggi nei posti scarta quello che vale meno", () => {
    const s = partita([1, 2, 3, 4]);
    const vecchi = [pers("leone"), pers("giganti")];
    s.giocatori.A!.posti = [...vecchi, pers("leone")];
    s.turno.attesa = { tipo: "scartaPersonaggio", nuovo: s.giocatori.A!.posti[2]!.id };
    expect(mossa(s)).toEqual({ tipo: "scartaPersonaggio", carta: vecchi[1]!.id });
  });
});

describe("utilità di una carta per un codice", () => {
  it("codice esatto: serve solo se il valore manca ancora", () => {
    const codice: Codice = { tipo: "esatto", valori: [8, 8] };
    expect(utilitaPerCodice(codice, 8, [])).toBeGreaterThanOrEqual(1);
    expect(utilitaPerCodice(codice, 8, [8, 8])).toBe(0);
    expect(utilitaPerCodice(codice, 3, [])).toBe(0);
  });

  it("pari o dispari: serve se ha la parità giusta", () => {
    const codice = { tipo: "parita", carte: 3, parita: "pari" } as const;
    expect(utilitaPerCodice(codice, 4, [])).toBe(1);
    expect(utilitaPerCodice(codice, 5, [])).toBe(0);
  });
});
