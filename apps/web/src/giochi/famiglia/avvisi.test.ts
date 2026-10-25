import { type Mossa, type StatoPartita, applicaMossa, setup, vistaGiocatore } from "@og/famiglia";
import { describe, expect, it } from "vitest";
import { avvisoTraViste } from "./avvisi";

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

describe("avvisi personali", () => {
  it("chi viene derubato riceve un avviso con l'attacco e la carta persa", () => {
    let s = partita();
    s.giocatori.anna!.attivati.push({ copia: { id: "nonno-nicola-2#1", carta: "nonno-nicola-2" }, stanca: 0 });
    s.giocatori.bruno!.mano = [{ id: "b5", valore: 5 }];
    const prima = vistaGiocatore(s, "bruno");
    s = fai(s, "anna", { tipo: "potere", carta: "nonno-nicola-2#1", potere: "solo-per-vedere-comm-sape", giocatore: "bruno" });
    const avviso = avvisoTraViste(prima, vistaGiocatore(s, "bruno"), "bruno", nick);
    expect(avviso?.titolo).toMatch(/Anna ti attacca/);
    expect(avviso?.righe.join("\n")).toMatch(/Hai perso: 5/);
  });

  it("chi attacca sa se l'attacco è andato a segno; gli altri non ricevono avvisi", () => {
    let s = partita();
    s.giocatori.anna!.attivati.push({ copia: { id: "toto-1#1", carta: "toto-1" }, stanca: 0 });
    const primaAnna = vistaGiocatore(s, "anna");
    const primaCarla = vistaGiocatore(s, "carla");
    s = fai(s, "anna", { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: "bruno" });
    expect(avvisoTraViste(primaAnna, vistaGiocatore(s, "anna"), "anna", nick)?.titolo).toMatch(/andato a segno/);
    expect(avvisoTraViste(primaCarla, vistaGiocatore(s, "carla"), "carla", nick)).toBeNull();
  });

  it("un evento lo vedono tutti", () => {
    let s = partita();
    s.eventi.mazzo.push("funerale");
    const prima = vistaGiocatore(s, "carla");
    s = fai(s, "anna", { tipo: "pescaEvento" });
    expect(avvisoTraViste(prima, vistaGiocatore(s, "carla"), "carla", nick)?.titolo).toMatch(/Funerale/);
  });

  it("le mosse normali non danno avvisi", () => {
    let s = partita();
    const prima = vistaGiocatore(s, "bruno");
    s = fai(s, "anna", { tipo: "pescaNumero" });
    expect(avvisoTraViste(prima, vistaGiocatore(s, "bruno"), "bruno", nick)).toBeNull();
  });
});
