/**
 * Avvisi a tutto schermo che vedono tutti (giocatori e spettatori) nello stesso momento:
 * - qualcuno ha raggiunto i punti per vincere (inizia l'ultimo giro);
 * - easter egg "Antonio è bello", circa una volta ogni 35 mosse.
 * Nascono dal registro della partita, che è uguale per tutti: così compaiono a tutti insieme.
 */
import type { Evento } from "@og/primo-gioco";
import { useEffect, useRef, useState } from "react";
import { CerchioAvatar } from "../../Avatar";

/** In media una mossa ogni quante fa uscire l'easter egg. */
const OGNI_QUANTE_MOSSE = 35;
const DURATA_TRAGUARDO_MS = 6000;
const DURATA_EASTER_EGG_MS = 3000;

/** Numero "a caso" ma uguale su tutti i telefoni: dipende solo dalla partita e dalla mossa. */
function sorteggio(partitaId: string, n: number): number {
  let h = 2166136261;
  for (const c of `${partitaId}:${n}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % OGNI_QUANTE_MOSSE;
}

/** Segue il registro e dice quali avvisi mostrare (niente avvisi per le mosse già fatte quando si apre la pagina). */
/**
 * `traguardoBloccante`: l'avviso dei punti resta finché non si tocca OK (per i giocatori, così nessuno lo perde);
 * senza, si chiude da solo (schermo degli spettatori, dove spesso nessuno tocca).
 */
export function useAvvisiSpeciali(registro: readonly Evento[] | undefined, partitaId: string, traguardoBloccante: boolean) {
  const [traguardo, setTraguardo] = useState<Extract<Evento, { tipo: "ultimoGiro" }> | null>(null);
  const [easterEgg, setEasterEgg] = useState<number | null>(null);
  const ultimo = useRef<number | null>(null);

  useEffect(() => {
    if (!registro) return;
    const n = registro.at(-1)?.n ?? 0;
    if (ultimo.current === null) {
      ultimo.current = n;
      return;
    }
    const nuovi = registro.filter((e) => e.n > ultimo.current!);
    ultimo.current = Math.max(ultimo.current, n);
    const arrivato = nuovi.find((e): e is Extract<Evento, { tipo: "ultimoGiro" }> => e.tipo === "ultimoGiro");
    if (arrivato) setTraguardo(arrivato);
    else if (nuovi.some((e) => sorteggio(partitaId, e.n) === 0)) setEasterEgg(Date.now());
  }, [registro, partitaId]);

  useEffect(() => {
    if (!traguardo || traguardoBloccante) return;
    const t = setTimeout(() => setTraguardo(null), DURATA_TRAGUARDO_MS);
    return () => clearTimeout(t);
  }, [traguardo, traguardoBloccante]);
  useEffect(() => {
    if (!easterEgg) return;
    const t = setTimeout(() => setEasterEgg(null), DURATA_EASTER_EGG_MS);
    return () => clearTimeout(t);
  }, [easterEgg]);

  return { traguardo, chiudiTraguardo: () => setTraguardo(null), easterEgg, chiudiEasterEgg: () => setEasterEgg(null) };
}

/**
 * Qualcuno ha raggiunto i punti per vincere: avviso grande per tutti.
 * Bloccante: copre il tavolo e si chiude solo con OK. Altrimenti si chiude anche toccando fuori.
 */
export function AvvisoTraguardo({
  evento,
  nick,
  avatar,
  io,
  bloccante,
  onChiudi,
}: {
  evento: Extract<Evento, { tipo: "ultimoGiro" }>;
  nick: (id: string) => string;
  avatar: (id: string) => string | undefined;
  io: string;
  bloccante: boolean;
  onChiudi: () => void;
}) {
  const sonoIo = evento.giocatore === io;
  return (
    <div className="velo" style={{ zIndex: 65 }} onClick={bloccante ? undefined : onChiudi} role="alertdialog" aria-live="assertive" aria-label="Punti obiettivo raggiunti">
      <div className="avviso-grande flex max-w-sm flex-col items-center gap-3 rounded-3xl border-2 border-oro bg-gradient-to-b from-[#1f3f73] to-notte px-8 py-7 text-center shadow-[0_0_60px_rgba(242,213,138,0.6)]">
        <p className="text-6xl">🏆</p>
        <CerchioAvatar id={avatar(evento.giocatore)} dimensione={72} />
        <p className="font-titolo text-3xl leading-tight font-bold text-oro-chiaro">
          {sonoIo ? "Hai raggiunto" : `${nick(evento.giocatore)} ha raggiunto`} {evento.punti} punti!
        </p>
        <p className="text-luce">Si finisce il giro e poi si gioca l'ultimo giro: ogni giocatore ha ancora un turno.</p>
        <button
          type="button"
          onClick={onChiudi}
          autoFocus
          className="mt-1 rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-10 py-3 text-lg font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518]"
        >
          OK
        </button>
      </div>
    </div>
  );
}

/** Easter egg. */
export function EasterEgg({ onChiudi }: { onChiudi: () => void }) {
  return (
    <div className="velo" style={{ zIndex: 64 }} onClick={onChiudi} role="status">
      <div className="avviso-grande rounded-3xl border-2 border-oro bg-gradient-to-b from-[#7a2d8f] to-notte px-8 py-6 text-center shadow-[0_0_60px_rgba(242,213,138,0.6)]">
        <p className="text-5xl">😎✨</p>
        <p className="mt-2 font-titolo text-3xl font-bold text-oro-chiaro">Antonio è bello</p>
      </div>
    </div>
  );
}
