/**
 * Carte evento (vedi docs/famiglia/bozza.md, "Carte evento").
 * "Chi ha X" = chi ha almeno una carta di X attivata.
 *
 * Non ancora nel mazzo (effetti da definire): Pranzo della domenica, Ferragosto.
 */
import type { Evento } from "./tipi-carte";

export const EVENTI: readonly Evento[] = [
  {
    id: "natale",
    nome: "Natale",
    durata: 3,
    testo: "Tutti fanno 1 mossa in meno, tranne chi ha Nonna Dina o Gerardina, che fa 1 mossa in più",
  },
  {
    id: "la-resurrezione",
    nome: "La Resurrezione",
    durata: 2,
    testo: "Chi ha Totò pesca 1 carta in più e la dà a chi vuole; le carte di Totò non si stancano mai",
  },
  {
    id: "carnevale-di-teora",
    nome: "Carnevale di Teora",
    durata: 2,
    testo: "Lo Squacqualacchione è sempre carico; i poteri di Totò non si possono usare e chi ha Totò fa 1 mossa in meno",
  },
  {
    id: "funerale",
    nome: "Funerale",
    durata: 2,
    testo:
      "Franchino e Don Pasquale si ricaricano; tutti passano 1 carta numero al giocatore alla propria destra, che la sceglie a carte coperte",
  },
  {
    id: "matrimonio",
    nome: "Matrimonio",
    durata: 1,
    testo: "Il regalo agli sposi: tutti perdono 1 carta numero a caso. Tutti fanno 1 mossa in meno; Don Pasquale e Donato si ricaricano e non si stancano mai",
  },
  {
    id: "sagra-delle-tomacelle",
    nome: "Sagra delle tomacelle",
    durata: 1,
    testo: "Lo Squacqualacchione è sempre carico; i poteri di Totò non si possono usare e chi ha Totò fa 1 mossa in meno",
  },
];

export function evento(id: string): Evento {
  const e = EVENTI.find((x) => x.id === id);
  if (!e) throw new Error(`Evento sconosciuto: ${id}`);
  return e;
}
