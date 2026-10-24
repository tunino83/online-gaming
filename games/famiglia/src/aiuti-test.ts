/** Aiuti comuni ai test della Famiglia (non è un file di test: lo usano regole.test.ts e poteri.test.ts). */
import { setup } from "./regole";
import { applicaMossa } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import type { CartaMancia, CartaNumero, CopiaCarta, Valore } from "./tipi-carte";

export const GIOCATORI = ["anna", "bruno", "carla"];

/**
 * Partita con un ordine fisso: anna, bruno, carla (anna di turno).
 * Senza campanelli e con gli scarti vuoti, così i test non dipendono dal caso
 * (i test sul campanello lo mettono apposta).
 */
export function partita(n = 3): StatoPartita {
  const s = setup(GIOCATORI.slice(0, n), {}, 1);
  s.ordine = GIOCATORI.slice(0, n);
  s.turno.giocatore = "anna";
  for (const c of [...s.mazzi.numeri, ...s.tavolo.numeri]) delete c?.campanello;
  s.mazzi.personaggi.unshift(...s.scarti.personaggi);
  s.scarti.personaggi = [];
  return s;
}

export const num = (valore: number, id = `x${valore}-${Math.random()}`): CartaNumero => ({ id, valore: valore as Valore });
export const copia = (idCarta: string, n = 1): CopiaCarta => ({ id: `${idCarta}#${n}`, carta: idCarta });
export const banconota = (valore: number, id = `mb${valore}`): CartaMancia => ({ id, tipo: "valore", valore: valore as Valore });
export const caffe = (id = "caffe-x"): CartaMancia => ({ id, tipo: "caffe" });

/** Applica una mossa che deve riuscire. */
export function fai(s: StatoPartita, chi: string, m: Mossa): StatoPartita {
  const r = applicaMossa(s, chi, m);
  if (!r.ok) throw new Error(r.errore);
  return r.stato;
}

/** Applica una mossa che deve essere rifiutata; restituisce il messaggio. */
export function rifiutata(s: StatoPartita, chi: string, m: Mossa): string {
  const r = applicaMossa(s, chi, m);
  if (r.ok) throw new Error("La mossa doveva essere rifiutata");
  return r.errore;
}

/** Carte numero vere (una carta "fatta in casa" conta come le 2 che la formano). */
const veri = (carte: CartaNumero[]): number => carte.reduce((t, c) => t + (c.unite ? veri(c.unite) : 1), 0);

/** Tutte le carte del gioco, ovunque siano: servono a controllare che non se ne perda nessuna. */
export function contaCarte(s: StatoPartita) {
  const giocatori = Object.values(s.giocatori);
  const a = s.turno.attesa;
  const inAttesaNumeri = a?.tipo === "scegliNumeri" || a?.tipo === "riordina" ? a.carte.length : 0;
  const inAttesaPersonaggi = a?.tipo === "scegliPersonaggio" ? a.carte.length : 0;
  return {
    numeri:
      s.mazzi.numeri.length +
      s.scarti.numeri.length +
      s.tavolo.numeri.filter(Boolean).length +
      giocatori.reduce((t, g) => t + veri(g.mano) + veri(g.vetrina), 0) +
      inAttesaNumeri,
    personaggi:
      s.mazzi.personaggi.length +
      s.scarti.personaggi.length +
      s.tavolo.personaggi.filter(Boolean).length +
      giocatori.reduce((t, g) => t + g.nascosti.length + g.attacchi.length + g.attivati.length, 0) +
      inAttesaPersonaggi,
    mancia: s.mazzi.mancia.length + s.scarti.mancia.length + giocatori.reduce((t, g) => t + g.mancia.length, 0),
  };
}

