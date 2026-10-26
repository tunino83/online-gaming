/**
 * Suoni del gioco, generati dal browser (niente file audio): un effetto per ogni azione
 * (prendere, pescare, scartare, mischiare, bruciare, caffè/diamanti…), una melodia (più vibrazione)
 * quando tocca a te e uno scintillio per le attivazioni. Si possono spegnere; la scelta resta salvata nel browser.
 *
 * iPhone/iPad: l'audio parte solo dopo un tocco e il tasto "silenzioso" ammutolisce i suoni del browser.
 * Al primo tocco si "sblocca" l'audio e si chiede al telefono di trattarlo come riproduzione (come un video).
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
  if (si) {
    sblocca();
    suonoMossa(); // conferma
  }
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

function creaContesto(): AudioContext | null {
  try {
    // biome-ignore lint: i vecchi Safari hanno solo webkitAudioContext
    const Costruttore = window.AudioContext ?? (window as any).webkitAudioContext;
    contesto ??= new Costruttore();
    return contesto;
  } catch {
    return null;
  }
}

function audio(): AudioContext | null {
  if (!attivi) return null;
  const ctx = creaContesto();
  if (ctx && ctx.state !== "running") void ctx.resume();
  return ctx;
}

/** Un brevissimo file audio muto (WAV), per "accendere" l'audio su iPhone. */
function silenzio(): string {
  const campioni = 800;
  const dati = new DataView(new ArrayBuffer(44 + campioni * 2));
  const scrivi = (pos: number, testo: string) => [...testo].forEach((c, i) => dati.setUint8(pos + i, c.charCodeAt(0)));
  scrivi(0, "RIFF");
  dati.setUint32(4, 36 + campioni * 2, true);
  scrivi(8, "WAVEfmt ");
  dati.setUint32(16, 16, true);
  dati.setUint16(20, 1, true);
  dati.setUint16(22, 1, true);
  dati.setUint32(24, 8000, true);
  dati.setUint32(28, 16000, true);
  dati.setUint16(32, 2, true);
  dati.setUint16(34, 16, true);
  scrivi(36, "data");
  dati.setUint32(40, campioni * 2, true);
  return URL.createObjectURL(new Blob([dati], { type: "audio/wav" }));
}

let sbloccato = false;
/** Da chiamare dentro un tocco dell'utente: accende l'audio (anche su iPhone, anche col tasto silenzioso). */
function sblocca(): void {
  try {
    // Safari 17+: l'audio della pagina va trattato come riproduzione, non come suoni di sistema
    // biome-ignore lint: audioSession non è ancora nei tipi standard
    const sessione = (navigator as any).audioSession;
    if (sessione) sessione.type = "playback";
  } catch {
    // non supportato
  }
  const ctx = creaContesto();
  if (ctx) {
    void ctx.resume();
    try {
      // un suono muto suonato "dentro" il tocco sblocca il contesto audio su iOS
      const vuoto = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = vuoto;
      s.connect(ctx.destination);
      s.start(0);
    } catch {
      // pazienza
    }
  }
  if (!sbloccato) {
    try {
      const lettore = new Audio(silenzio());
      lettore.setAttribute("playsinline", "");
      void lettore.play().catch(() => {});
    } catch {
      // pazienza
    }
  }
  sbloccato = ctx?.state === "running";
}

// I browser fanno partire l'audio solo dopo un tocco: si sblocca a ogni tocco finché non funziona
// (su iPhone conta il "rilascio" del dito, quindi si ascoltano anche touchend e click).
if (typeof document !== "undefined") {
  const eventi = ["touchend", "click", "pointerdown", "keydown"] as const;
  const alTocco = () => {
    sblocca();
    if (sbloccato) for (const e of eventi) document.removeEventListener(e, alTocco, true);
  };
  for (const e of eventi) document.addEventListener(e, alTocco, true);
  // Tornando sulla pagina (es. dopo aver bloccato il telefono) l'audio può essere stato sospeso
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && contesto && contesto.state !== "running") void contesto.resume();
  });
}

/**
 * Fa sentire un file audio (es. un vocale). Restituisce false se non è partito
 * (suoni spenti o audio bloccato dal browser): allora serve un tocco su "ascolta".
 */
export async function riproduci(file: Blob, forza = false): Promise<boolean> {
  if (!attivi && !forza) return false;
  try {
    const ctx = creaContesto();
    if (ctx) {
      if (ctx.state !== "running") await ctx.resume();
      if (ctx.state === "running") {
        const suono = await ctx.decodeAudioData(await file.arrayBuffer());
        const sorgente = ctx.createBufferSource();
        sorgente.buffer = suono;
        sorgente.connect(ctx.destination);
        sorgente.start();
        return true;
      }
    }
  } catch {
    // formato che il browser non sa decodificare così: si prova con un normale lettore audio
  }
  try {
    const url = URL.createObjectURL(file);
    const lettore = new Audio(url);
    lettore.setAttribute("playsinline", "");
    lettore.onended = () => URL.revokeObjectURL(url);
    await lettore.play();
    return true;
  } catch {
    return false;
  }
}

/** I suoni sono accesi? (per chi non è un componente React) */
export const suoniAttivi = (): boolean => attivi;

/**
 * Come riproduci(), ma aspetta che il file finisca (per non sovrapporre più audio di fila).
 * Restituisce false se non è partito. Al massimo aspetta `massimoMs`.
 */
export async function riproduciFinoAllaFine(file: Blob, massimoMs = 15_000): Promise<boolean> {
  if (!attivi) return false;
  const fine = (attendi: (risolvi: () => void) => void) =>
    new Promise<void>((risolvi) => {
      const t = setTimeout(risolvi, massimoMs);
      attendi(() => {
        clearTimeout(t);
        risolvi();
      });
    });
  try {
    const ctx = creaContesto();
    if (ctx) {
      if (ctx.state !== "running") await ctx.resume();
      if (ctx.state === "running") {
        const suono = await ctx.decodeAudioData(await file.arrayBuffer());
        const sorgente = ctx.createBufferSource();
        sorgente.buffer = suono;
        sorgente.connect(ctx.destination);
        const finito = fine((risolvi) => {
          sorgente.onended = risolvi;
        });
        sorgente.start();
        await finito;
        return true;
      }
    }
  } catch {
    // si prova con un normale lettore audio
  }
  try {
    const url = URL.createObjectURL(file);
    const lettore = new Audio(url);
    lettore.setAttribute("playsinline", "");
    const finito = fine((risolvi) => {
      lettore.onended = risolvi;
      lettore.onerror = risolvi;
    });
    await lettore.play();
    await finito;
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Effetti                                                             */
/* ------------------------------------------------------------------ */

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

let rumoreBianco: AudioBuffer | null = null;
/** Un "fruscio" (rumore filtrato): è il suono della carta che scivola. */
interface OpzioniFruscio {
  inizio?: number;
  durata?: number;
  volume?: number;
  frequenza?: number;
  finale?: number;
  q?: number;
  tipo?: BiquadFilterType;
}
function fruscio(ctx: AudioContext, o: OpzioniFruscio = {}) {
  const { inizio = 0, durata = 0.12, volume = 0.25, frequenza = 2500, q = 0.8, tipo = "bandpass" } = o;
  const finale = o.finale ?? frequenza;
  if (!rumoreBianco) {
    rumoreBianco = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = rumoreBianco.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const sorgente = ctx.createBufferSource();
  sorgente.buffer = rumoreBianco;
  const filtro = ctx.createBiquadFilter();
  filtro.type = tipo;
  filtro.Q.value = q;
  const vol = ctx.createGain();
  const t0 = ctx.currentTime + inizio;
  filtro.frequency.setValueAtTime(frequenza, t0);
  filtro.frequency.exponentialRampToValueAtTime(Math.max(40, finale), t0 + durata);
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(volume, t0 + Math.min(0.02, durata / 3));
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + durata);
  sorgente.connect(filtro).connect(vol).connect(ctx.destination);
  sorgente.start(t0, Math.random() * 0.5);
  sorgente.stop(t0 + durata + 0.02);
}

/** "Tic" generico di una mossa. */
export function suonoMossa(): void {
  const ctx = audio();
  if (!ctx) return;
  nota(ctx, 880, 0, 0.08, 0.12, "triangle");
  nota(ctx, 1320, 0.03, 0.06, 0.05, "sine");
}

/** Prendere una carta scoperta dal tavolo: la carta scivola. */
export function suonoPrendi(): void {
  const ctx = audio();
  if (!ctx) return;
  fruscio(ctx, { durata: 0.14, frequenza: 3200, finale: 1800, volume: 0.3 });
}

/** Pescare dal mazzo: la carta si stacca dal mazzo e scivola. */
export function suonoPesca(): void {
  const ctx = audio();
  if (!ctx) return;
  fruscio(ctx, { durata: 0.05, frequenza: 5000, volume: 0.18, q: 2 });
  fruscio(ctx, { inizio: 0.05, durata: 0.16, frequenza: 2600, finale: 1400, volume: 0.28 });
}

/** Scartare: le carte cadono sulla pila. */
export function suonoScarta(): void {
  const ctx = audio();
  if (!ctx) return;
  fruscio(ctx, { durata: 0.18, frequenza: 1500, finale: 500, volume: 0.3, tipo: "lowpass" });
  nota(ctx, 140, 0.04, 0.12, 0.12, "sine");
}

/** Mischiare il mazzo: tante carte che frusciano in fila. */
export function suonoMischia(): void {
  const ctx = audio();
  if (!ctx) return;
  for (let i = 0; i < 14; i++) fruscio(ctx, { inizio: i * 0.045, durata: 0.05, frequenza: 2800 + (i % 3) * 600, volume: 0.16, q: 1.5 });
}

/** Bruciare le carte del tavolo: una vampata. */
export function suonoBrucia(): void {
  const ctx = audio();
  if (!ctx) return;
  fruscio(ctx, { durata: 0.6, frequenza: 300, finale: 3000, volume: 0.35, tipo: "lowpass" });
  for (let i = 0; i < 6; i++) fruscio(ctx, { inizio: 0.15 + i * 0.07, durata: 0.03, frequenza: 4000, volume: 0.12, q: 3 });
}

/** Un diamante o un caffè guadagnato: tintinnio. */
export function suonoGettone(): void {
  const ctx = audio();
  if (!ctx) return;
  nota(ctx, 1568, 0, 0.18, 0.1, "sine");
  nota(ctx, 2093, 0.08, 0.25, 0.09, "sine");
}

/** Il fulmine: scarica elettrica. */
export function suonoFulmine(): void {
  const ctx = audio();
  if (!ctx) return;
  fruscio(ctx, { durata: 0.25, frequenza: 6000, finale: 800, volume: 0.3, q: 4 });
  nota(ctx, 110, 0, 0.3, 0.12, "sawtooth");
}

/** Fine del turno: un colpetto sul tavolo. */
export function suonoFineTurno(): void {
  const ctx = audio();
  if (!ctx) return;
  nota(ctx, 220, 0, 0.1, 0.1, "triangle");
  fruscio(ctx, { durata: 0.06, frequenza: 900, volume: 0.12, tipo: "lowpass" });
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

/**
 * Il suono giusto per un'azione del registro (uguale per tutti i giochi che usano questi nomi).
 * Le attivazioni hanno il loro scintillio nell'animazione, quindi qui non suonano.
 */
export function suonoPerAzione(tipo: string, dettagli: { scartate?: number; gratis?: boolean } = {}): void {
  switch (tipo) {
    case "prendiNumero":
    case "prendiPersonaggio":
    case "prendiDaFatina":
    case "scambiaConTavolo":
      return suonoPrendi();
    case "pescaNumero":
    case "pescaPersonaggio":
      return suonoPesca();
    case "brucia":
      return suonoBrucia();
    case "frecce":
      return suonoMischia();
    case "scartaPersonaggio":
      return suonoScarta();
    case "dueInDiamante":
      return suonoGettone();
    case "fulmine":
      return suonoFulmine();
    case "fineTurno":
      return dettagli.scartate ? suonoScarta() : suonoFineTurno();
    case "attiva":
      return;
    default:
      return suonoMossa();
  }
}
