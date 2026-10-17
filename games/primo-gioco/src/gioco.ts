/** Il primo gioco, nella forma comune a tutti i giochi della piattaforma. */
import type { Gioco } from "@og/engine";
import { MAX_GIOCATORI, MIN_GIOCATORI, type OpzioniPartita } from "./parametri";
import { applicaMossa, finePartita, mossaAutomatica, mosseValide, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import { type VistaGiocatore, vistaGiocatore } from "./vista";

export const primoGioco: Gioco<StatoPartita, Mossa, OpzioniPartita, VistaGiocatore> = {
  id: "primo-gioco",
  minGiocatori: MIN_GIOCATORI,
  maxGiocatori: MAX_GIOCATORI,
  setup,
  mosseValide,
  applicaMossa,
  finePartita,
  vistaGiocatore,
  mossaAutomatica,
};
