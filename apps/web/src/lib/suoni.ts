/**
 * Suoni del gioco, generati dal browser (niente file audio): un "tic" per ogni mossa
 * e una piccola melodia (più vibrazione sul telefono) quando tocca a te.
 * Si possono spegnere; la scelta resta salvata nel browser.
 */
import { useSyncExternalStore } from "react";

const CHIAVE = "og.suoni";
let attivi = leggi();
const ascoltatori = new Set<() => void>();
let contesto: AudioContext | null = null;

function leggi(): boolean {
  try {
    return localStorage.getItem(CHIAVE) !== "no";
  } catch {
    return true;
  }
}

export function impostaSuoni(si: boolean): void {
  attivi = si;
  try {
    localStorage.setItem(CHIAVE, si ? "si" : "no");
  } catch {
    // memoria del browser non disponibile: vale solo per questa visita
  }
  for (const a of ascoltatori) a();
  if (si) suonoMossa(); // conferma (e sblocca l'audio sul telefono)
}

/** Stato attuale (si aggiorna da solo nei componenti). */
export function useSuoniAttivi(): boolean {
  return useSyncExternalStore(
    (a) => {
      ascoltatori.add(a);
      return () => ascoltatori.delete(a);
    },
    () => attivi,
  );
}

function audio(): AudioContext | null {
  if (!attivi) return null;
  try {
    contesto ??= new AudioContext();
    if (contesto.state === "suspended") void contesto.resume();
    return contesto;
  } catch {
    return null;
  }
}

// I browser fanno partire l'audio solo dopo un tocco: al primo tocco sulla pagina si "sblocca",
// così poi i vocali in arrivo possono partire da soli.
if (typeof document !== "undefined") {
  const sblocca = () => {
    audio();
    document.removeEventListener("pointerdown", sblocca);
    document.removeEventListener("keydown", sblocca);
  };
  document.addEventListener("pointerdown", sblocca);
  document.addEventListener("keydown", sblocca);
}

/**
 * Fa sentire un file audio (es. un vocale). Restituisce false se non è partito
 * (suoni spenti o audio bloccato dal browser): allora serve un tocco su "ascolta".
 */
export async function riproduci(file: Blob, forza = false): Promise<boolean> {
  if (!attivi && !forza) return false;
  try {
    contesto ??= new AudioContext();
    if (contesto.state === "suspended") await contesto.resume();
    if (contesto.state === "running") {
      const suono = await contesto.decodeAudioData(await file.arrayBuffer());
      const sorgente = contesto.createBufferSource();
      sorgente.buffer = suono;
      sorgente.connect(contesto.destination);
      sorgente.start();
      return true;
    }
  } catch {
    // formato che il browser non sa decodificare così: si prova con un normale lettore audio
  }
  try {
    const url = URL.createObjectURL(file);
    const lettore = new Audio(url);
    lettore.onended = () => URL.revokeObjectURL(url);
    await lettore.play();
    return true;
  } catch {
    return false;
  }
}

/** Una nota breve: frequenza (Hz), inizio e durata (secondi), volume. */
function nota(ctx: AudioContext, frequenza: number, inizio: number, durata: number, volume: number, forma: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = forma;
  osc.frequency.value = frequenza;
  const t0 = ctx.currentTime + inizio;
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + durata);
  osc.connect(vol).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durata + 0.02);
}

/** "Tic" di una carta: ogni mossa, tua o degli altri. */
export function suonoMossa(): void {
  const ctx = audio();
  if (!ctx) return;
  nota(ctx, 880, 0, 0.08, 0.12, "triangle");
  nota(ctx, 1320, 0.03, 0.06, 0.05, "sine");
}

/** Melodia "tocca a te" (e vibrazione sul telefono). */
export function suonoTuoTurno(): void {
  const ctx = audio();
  if (ctx) {
    nota(ctx, 660, 0, 0.18, 0.18);
    nota(ctx, 880, 0.15, 0.18, 0.18);
    nota(ctx, 1320, 0.3, 0.35, 0.16);
  }
  if (attivi) navigator.vibrate?.([120, 60, 120]);
}

/** Scintillio "magico" quando qualcuno attiva un personaggio. */
export function suonoMagia(): void {
  const ctx = audio();
  if (!ctx) return;
  [784, 988, 1175, 1568, 1976].forEach((f, i) => nota(ctx, f, i * 0.07, 0.5, 0.09, "sine"));
  nota(ctx, 392, 0, 0.9, 0.06, "triangle");
}
