/** La Famiglia, nella forma comune a tutti i giochi della piattaforma. Robot e sostituto arrivano nel passo A6. */
import type { Gioco } from "@og/engine";
import { MAX_GIOCATORI, MIN_GIOCATORI, type OpzioniPartita } from "./parametri";
import { applicaMossa, chiDeveMuovere, finePartita, mossaAutomatica, mosseValide, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import { type VistaGiocatore, vistaGiocatore, vistaPubblica } from "./vista";

export const giocoFamiglia: Gioco<StatoPartita, Mossa, OpzioniPartita, VistaGiocatore> = {
  id: "famiglia",
  minGiocatori: MIN_GIOCATORI,
  maxGiocatori: MAX_GIOCATORI,
  setup,
  mosseValide,
  applicaMossa,
  finePartita,
  vistaGiocatore,
  vistaPubblica,
  mossaAutomatica,
  diTurno: (stato) => (stato.finita ? null : chiDeveMuovere(stato)),
};
