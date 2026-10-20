/**
 * Bot di prova: sceglie a caso tra le mosse valide.
 * Unica preferenza: se può attivare un personaggio lo fa (scegliendo a caso quale e come),
 * altrimenti una partita tra bot del tutto casuali durerebbe all'infinito.
 */
import { type IdGiocatore, type StatoCasuale, interoTra } from "@og/engine";
import { mosseValide } from "./regole";
import type { Mossa, StatoPartita } from "./stato";

const unaACaso = <T>(rng: StatoCasuale, lista: T[]): T => lista[interoTra(rng, 0, lista.length - 1)]!;

export function mossaDelBot(stato: StatoPartita, giocatore: IdGiocatore, rng: StatoCasuale): Mossa {
  const mosse = mosseValide(stato, giocatore);
  if (mosse.length === 0) throw new Error(`Nessuna mossa valida per ${giocatore}`);
  const attivazioni = mosse.filter((m) => m.tipo === "attiva");
  return unaACaso(rng, attivazioni.length > 0 ? attivazioni : mosse);
}
