/** Il primo gioco, nella forma comune a tutti i giochi della piattaforma. */
import { type Gioco, creaCasuale } from "@og/engine";
import { mossaDelBot } from "./bot";
import { MAX_GIOCATORI, MIN_GIOCATORI, type OpzioniPartita } from "./parametri";
import { applicaMossa, finePartita, mossaAutomatica, mosseValide, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import { type VistaGiocatore, vistaGiocatore, vistaPubblica } from "./vista";

export const primoGioco: Gioco<StatoPartita, Mossa, OpzioniPartita, VistaGiocatore> = {
  id: "primo-gioco",
  minGiocatori: MIN_GIOCATORI,
  maxGiocatori: MAX_GIOCATORI,
  setup,
  mosseValide,
  applicaMossa,
  finePartita,
  vistaGiocatore,
  vistaPubblica,
  mossaAutomatica,
  mossaBot: (stato, giocatore, casuale) => mossaDelBot(stato, giocatore, creaCasuale(Math.floor(casuale() * 2 ** 32))),
  diTurno: (stato) => (stato.finita ? null : stato.turno.giocatore),
};
