/**
 * Giocatori del computer della Famiglia.
 * - Robot (partite "contro il computer"): mosse valide scelte a caso, con una preferenza per attivare e usare i poteri.
 * - Sostituto (al posto di una persona ferma): gioca in modo semplice e prudente; quando la persona è attaccata
 *   e non risponde in tempo, l'attacco passa (subisce, con la prima scelta proposta).
 */
import type { IdGiocatore } from "@og/engine";
import { chiDeveMuovere, mosseValide } from "./regole";
import type { Mossa, StatoPartita } from "./stato";

const aCaso = <T>(lista: T[], casuale: () => number): T => lista[Math.floor(casuale() * lista.length)]!;

/** Mossa di un robot: attiva se può, a volte usa un potere, altrimenti una mossa qualsiasi. */
export function mossaDelBot(s: StatoPartita, giocatore: IdGiocatore, casuale: () => number): Mossa {
  const mosse = mosseValide(s, giocatore);
  if (mosse.length === 0) throw new Error("Il robot non ha mosse");
  const attiva = mosse.filter((m) => m.tipo === "attiva");
  if (attiva.length > 0) return aCaso(attiva, casuale);
  const poteri = mosse.filter((m) => m.tipo === "potere" || m.tipo === "usaCarta");
  if (poteri.length > 0 && casuale() < 0.5) return aCaso(poteri, casuale);
  // Il caffè non si beve subito: prima le mosse normali
  const normali = mosse.filter((m) => m.tipo !== "caffe");
  return aCaso(normali.length > 0 ? normali : mosse, casuale);
}

/** Mossa al posto di una persona ferma da troppo tempo (o che non ha risposto a un attacco in tempo). */
export function mossaDelSostituto(s: StatoPartita, giocatore: IdGiocatore, casuale: () => number): Mossa {
  const mosse = mosseValide(s, giocatore);
  if (mosse.length === 0) throw new Error("Nessuna mossa possibile");
  // Attaccato e non ha risposto: l'attacco passa
  if (s.turno.attesa?.tipo === "difesa") return mosse.find((m) => m.tipo === "subisci") ?? mosse[0]!;
  // Stuffosa senza risposta: lascia stare (la prima mossa proposta)
  if (s.turno.attesa) return mosse[0]!;
  const preferite: Mossa["tipo"][] = ["attiva", "prendiNumero", "pescaNumero", "fineTurno"];
  for (const tipo of preferite) {
    const scelte = mosse.filter((m) => m.tipo === tipo);
    if (scelte.length > 0) return aCaso(scelte, casuale);
  }
  return aCaso(mosse, casuale);
}

/**
 * Tempo massimo per rispondere, se adesso qualcuno deve difendersi da un attacco: poi l'attacco passa da solo
 * (lo fa l'arbitro con il sostituto). null = nessun tempo massimo speciale.
 */
export function attesaMassimaMs(s: StatoPartita): number | null {
  if (s.finita) return null;
  // Stuffosa: Checca ha poco tempo per scocciarsi, poi l'aiuto funziona
  if (s.turno.attesa?.tipo === "stuffosa") return SECONDI_STUFFOSA * 1000;
  if (s.turno.attesa?.tipo !== "difesa") return null;
  return s.opzioni.secondiDifesa * 1000;
}

/** Secondi per decidere se bloccare un aiuto con Stuffosa. */
export const SECONDI_STUFFOSA = 10;

/** Chi deve muovere adesso (anche chi è attaccato o deve fare una scelta). */
export const diTurno = (s: StatoPartita): IdGiocatore | null => (s.finita ? null : chiDeveMuovere(s));
