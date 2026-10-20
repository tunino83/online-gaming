/**
 * Controllo della forma di una mossa arrivata da fuori (browser).
 * Il server non si fida di nulla: prima di applicare le regole verifica che la mossa
 * abbia esattamente i campi attesi, con i tipi giusti.
 */
import type { Mossa } from "./stato";

type Oggetto = Record<string, unknown>;
const isOggetto = (x: unknown): x is Oggetto => typeof x === "object" && x !== null && !Array.isArray(x);
const isTesto = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= 100;
const isIntero = (x: unknown): x is number => Number.isInteger(x);
const isPosizione = (x: unknown) => isIntero(x) && x >= 0 && x < 10;

/** Solo i campi indicati (obbligatori e facoltativi), nessuno in più. */
function campi(o: Oggetto, obbligatori: string[], facoltativi: string[] = []): boolean {
  const ammessi = new Set(["tipo", ...obbligatori, ...facoltativi]);
  return Object.keys(o).every((k) => ammessi.has(k)) && obbligatori.every((k) => k in o);
}

function elementoValido(e: unknown): boolean {
  if (!isOggetto(e)) return false;
  const modificaValida = (m: unknown) => isOggetto(m) && campi(m, ["diamante", "delta"]) && isTesto(m.diamante) && (m.delta === 1 || m.delta === -1);
  switch (e.tipo) {
    case "numero":
      return campi(e, ["id", "valore"], ["modifica"]) && isTesto(e.id) && isIntero(e.valore) &&
        (e.modifica === undefined || modificaValida(e.modifica));
    case "diamante":
      return campi(e, ["id"], ["valore", "modifica"]) && isTesto(e.id) &&
        (e.valore === undefined || isIntero(e.valore)) && (e.modifica === undefined || modificaValida(e.modifica));
    case "virtuale":
      return campi(e, ["fonte", "valore"]) && isTesto(e.fonte) && isIntero(e.valore);
    default:
      return false;
  }
}

export function validaMossa(m: unknown): m is Mossa {
  if (!isOggetto(m)) return false;
  switch (m.tipo) {
    case "prendiNumero":
    case "prendiPersonaggio":
      return campi(m, ["posizione"]) && isPosizione(m.posizione);
    case "pescaNumero":
    case "pescaPersonaggio":
    case "brucia":
    case "bruciaGratis":
      return campi(m, []);
    case "giocaFulmine":
      return campi(m, ["diamante"]) && isTesto(m.diamante);
    case "dueInDiamante":
    case "scartaPersonaggio":
    case "prendiDaFatina":
      return campi(m, ["carta"]) && isTesto(m.carta);
    case "scambiaConTavolo":
      return campi(m, ["carta", "posizione"]) && isTesto(m.carta) && isPosizione(m.posizione);
    case "fineTurno":
      return campi(m, ["scarta", "cambiaMano"]) && Array.isArray(m.scarta) && m.scarta.length <= 30 &&
        m.scarta.every(isTesto) && typeof m.cambiaMano === "boolean";
    case "attiva": {
      if (!campi(m, ["carta", "combinazione"], ["tieni", "bersaglio", "avversario"])) return false;
      const b = m.bersaglio;
      return isTesto(m.carta) && Array.isArray(m.combinazione) && m.combinazione.length >= 1 &&
        m.combinazione.length <= 20 && m.combinazione.every(elementoValido) &&
        (m.tieni === undefined || isTesto(m.tieni)) &&
        (m.avversario === undefined || isTesto(m.avversario)) &&
        (b === undefined || (isOggetto(b) && campi(b, ["giocatore", "carta"]) && isTesto(b.giocatore) && isTesto(b.carta)));
    }
    default:
      return false;
  }
}
