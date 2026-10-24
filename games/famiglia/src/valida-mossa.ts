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

const listaTesti = (x: unknown) => Array.isArray(x) && x.length <= 30 && x.every(isTesto);

/** Solo i campi indicati (obbligatori e facoltativi), nessuno in più. */
function campi(o: Oggetto, obbligatori: string[], facoltativi: string[] = []): boolean {
  const ammessi = new Set(["tipo", ...obbligatori, ...facoltativi]);
  return Object.keys(o).every((k) => ammessi.has(k)) && obbligatori.every((k) => k in o);
}

function elementoValido(e: unknown): boolean {
  if (!isOggetto(e) || (e.tipo !== "numero" && e.tipo !== "mancia")) return false;
  const modificaValida = (m: unknown) => isOggetto(m) && campi(m, ["mancia"]) && isTesto(m.mancia);
  return campi(e, ["id", "valore"], ["modifica"]) && isTesto(e.id) && isIntero(e.valore) && (e.modifica === undefined || modificaValida(e.modifica));
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
      return campi(m, []);
    case "caffe":
      return campi(m, ["mancia"]) && isTesto(m.mancia);
    case "scartaCarta":
      return campi(m, ["carta"]) && isTesto(m.carta);
    case "scegli":
      return campi(m, ["carte"]) && listaTesti(m.carte);
    case "riordina":
      return campi(m, ["ordine"]) && listaTesti(m.ordine);
    case "potere":
      return (
        campi(m, ["carta", "potere"], ["carte", "posizioni", "valore", "giocatore", "bersaglio", "scelte"]) &&
        isTesto(m.carta) &&
        isTesto(m.potere) &&
        (m.carte === undefined || listaTesti(m.carte)) &&
        (m.posizioni === undefined || (Array.isArray(m.posizioni) && m.posizioni.length <= 10 && m.posizioni.every(isPosizione))) &&
        (m.valore === undefined || isIntero(m.valore)) &&
        (m.giocatore === undefined || isTesto(m.giocatore)) &&
        (m.bersaglio === undefined || isTesto(m.bersaglio)) &&
        (m.scelte === undefined || listaTesti(m.scelte))
      );
    case "fineTurno":
      return campi(m, ["scarta"]) && Array.isArray(m.scarta) && m.scarta.length <= 30 && m.scarta.every(isTesto);
    case "attiva":
      return (
        campi(m, ["carta", "combinazione"]) &&
        isTesto(m.carta) &&
        Array.isArray(m.combinazione) &&
        m.combinazione.length >= 1 &&
        m.combinazione.length <= 20 &&
        m.combinazione.every(elementoValido)
      );
    default:
      return false;
  }
}
