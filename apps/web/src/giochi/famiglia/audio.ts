/**
 * Voci delle carte della Famiglia: quando una carta viene attivata o si usa il suo potere, parte la sua voce.
 * - Registrazioni vere: games/famiglia/audio/<carta>.mp3|m4a (attivazione) e <carta>_ATT|_DIF|_AIU (uso del potere);
 *   prima si cerca il file della carta (es. "antonio-2"), poi quello della persona ("antonio"). Vedi audio/LEGGIMI.md.
 * - Se non c'è il file, il telefono legge il nome della carta o del potere con la sua voce (sintesi vocale).
 * Le voci partono una alla volta, in ordine. Si spengono con i suoni o con il pulsante 🗣️ (scelta salvata nel browser).
 */
import { carta, nomiImmagine } from "@og/famiglia";
import { useSyncExternalStore } from "react";
import { riproduciFinoAllaFine, suoniAttivi } from "../../lib/suoni";
import type { VoceCarta } from "./annunci";

const FILE = import.meta.glob(["../../../../../games/famiglia/audio/*.{mp3,m4a,aac,wav}"], {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** nome del file senza estensione -> indirizzo del file audio */
const VOCI = new Map(Object.entries(FILE).map(([percorso, url]) => [percorso.split("/").at(-1)!.replace(/\.[a-z0-9]+$/i, ""), url]));

/** Indirizzo della registrazione di una carta (attivazione o uso del potere), se c'è. */
export function fileVoce(idCarta: string, quando: VoceCarta["quando"]): string | undefined {
  const suffisso = quando === "attiva" ? "" : `_${quando}`;
  for (const nome of nomiImmagine(carta(idCarta))) {
    const url = VOCI.get(`${nome}${suffisso}`);
    if (url) return url;
  }
  return undefined;
}

/** Frase letta dal telefono quando manca la registrazione. */
export function fraseVoce(v: VoceCarta): string {
  const c = carta(v.idCarta);
  if (v.quando === "attiva") return `Ecco ${c.nome}!`;
  return `${c.poteri.find((p) => p.id === v.potere)?.nome ?? c.nome}!`;
}

/* ---------------- interruttore delle voci ---------------- */

const CHIAVE = "famiglia.voci";
let vociAccese = leggi();
const ascoltatori = new Set<() => void>();

function leggi(): boolean {
  try {
    return localStorage.getItem(CHIAVE) !== "no";
  } catch {
    return true;
  }
}

export function impostaVoci(si: boolean): void {
  vociAccese = si;
  try {
    localStorage.setItem(CHIAVE, si ? "si" : "no");
  } catch {
    // memoria del browser non disponibile: vale solo per questa visita
  }
  if (!si) window.speechSynthesis?.cancel();
  for (const a of ascoltatori) a();
}

export function useVociAccese(): boolean {
  return useSyncExternalStore(
    (a) => {
      ascoltatori.add(a);
      return () => ascoltatori.delete(a);
    },
    () => vociAccese,
  );
}

/* ---------------- riproduzione, una voce alla volta ---------------- */

let coda: Promise<void> = Promise.resolve();
/** Voci in attesa: se se ne accumulano troppe (es. tornando sulla pagina) si saltano le più vecchie. */
let inAttesa = 0;
const MASSIMO_IN_ATTESA = 4;

export function suonaVoce(v: VoceCarta): void {
  if (!vociAccese || !suoniAttivi()) return;
  if (inAttesa >= MASSIMO_IN_ATTESA) return;
  inAttesa++;
  coda = coda
    .then(() => (vociAccese && suoniAttivi() ? riproduciVoce(v) : undefined))
    .catch(() => undefined)
    .finally(() => {
      inAttesa--;
    });
}

async function riproduciVoce(v: VoceCarta): Promise<void> {
  const url = fileVoce(v.idCarta, v.quando);
  if (url) {
    try {
      const file = await (await fetch(url)).blob();
      if (await riproduciFinoAllaFine(file, 8000)) return;
    } catch {
      // file non raggiungibile: si legge la frase
    }
  }
  await leggiFrase(fraseVoce(v));
}

/** Il telefono legge la frase con la sua voce italiana (se ne ha una). */
function leggiFrase(testo: string): Promise<void> {
  const sintesi = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!sintesi) return Promise.resolve();
  return new Promise((risolvi) => {
    const frase = new SpeechSynthesisUtterance(testo);
    frase.lang = "it-IT";
    const italiana = sintesi.getVoices().find((x) => x.lang.toLowerCase().startsWith("it"));
    if (italiana) frase.voice = italiana;
    frase.rate = 1.05;
    const t = setTimeout(risolvi, 6000);
    frase.onend = frase.onerror = () => {
      clearTimeout(t);
      risolvi();
    };
    sintesi.speak(frase);
  });
}
