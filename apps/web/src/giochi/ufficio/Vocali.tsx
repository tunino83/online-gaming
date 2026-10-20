/**
 * Vocali in partita: il pulsante 🎤 (tocca per registrare, tocca "Invia" per mandare, al massimo 20 secondi)
 * e l'avviso del vocale in arrivo (parte da solo; si può riascoltare).
 */
import { Mic, Play, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DURATA_MASSIMA_MS, useRegistratore, useVocaliInArrivo, vocaliSupportati } from "../../lib/vocali";

export function PulsanteVocale({ partitaId }: { partitaId: string }) {
  const { stato, errore, avvia, invia, annulla, chiudiErrore } = useRegistratore(partitaId);
  const [adesso, setAdesso] = useState(Date.now());
  useEffect(() => {
    if (stato.tipo !== "registra") return;
    const t = setInterval(() => setAdesso(Date.now()), 250);
    return () => clearInterval(t);
  }, [stato.tipo]);
  useEffect(() => {
    if (!errore) return;
    const t = setTimeout(chiudiErrore, 4000);
    return () => clearTimeout(t);
  }, [errore, chiudiErrore]);

  if (!vocaliSupportati()) return null;
  const secondi = stato.tipo === "registra" ? Math.min(Math.floor((adesso - stato.inizio) / 1000), DURATA_MASSIMA_MS / 1000) : 0;

  return (
    <>
      <button
        type="button"
        onClick={stato.tipo === "registra" ? invia : stato.tipo === "fermo" ? avvia : undefined}
        disabled={stato.tipo === "avvio" || stato.tipo === "invio"}
        aria-label={stato.tipo === "registra" ? "Invia il vocale" : "Registra un vocale"}
        title={stato.tipo === "registra" ? "Invia il vocale" : "Registra un vocale"}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
          stato.tipo === "registra"
            ? "registra-vocale border-rosso bg-rosso text-white"
            : "border-oro/50 text-oro-chiaro hover:bg-oro/15 disabled:opacity-50"
        }`}
      >
        {stato.tipo === "registra" ? <Send size={15} /> : <Mic size={17} />}
      </button>

      {(stato.tipo === "registra" || stato.tipo === "invio") && (
        <div className="fixed inset-x-0 top-14 z-[65] flex justify-center px-3">
          <div className="flex items-center gap-2 rounded-full border-2 border-rosso bg-notte/95 py-1.5 pr-1.5 pl-3 text-sm font-semibold text-luce shadow-xl">
            {stato.tipo === "invio" ? (
              <span>Invio il vocale…</span>
            ) : (
              <>
                <span className="registra-vocale inline-block h-2.5 w-2.5 rounded-full bg-rosso" aria-hidden="true" />
                <span className="tabular-nums">
                  0:{String(secondi).padStart(2, "0")} / 0:{DURATA_MASSIMA_MS / 1000}
                </span>
                <button type="button" onClick={annulla} className="grid h-8 w-8 place-items-center rounded-full bg-white/10" aria-label="Annulla il vocale">
                  <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={invia}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-3 py-1.5 text-[#2b1a05]"
                >
                  <Send size={14} /> Invia
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {errore && (
        <div className="fixed inset-x-0 top-14 z-[65] flex justify-center px-3">
          <p role="alert" className="rounded-full bg-rosso px-4 py-1.5 text-sm font-semibold text-white shadow-xl">
            {errore}
          </p>
        </div>
      )}
    </>
  );
}

export function AvvisoVocale({ partitaId, io, nick }: { partitaId: string; io: string; nick: (id: string) => string }) {
  const { ultimo, riascolta, chiudi } = useVocaliInArrivo(partitaId, io);
  // Se è partito da solo, l'avviso sparisce dopo qualche secondo; se no resta finché non lo si ascolta
  useEffect(() => {
    if (!ultimo?.partito) return;
    const t = setTimeout(chiudi, 9000);
    return () => clearTimeout(t);
  }, [ultimo, chiudi]);
  if (!ultimo) return null;
  return (
    <div className="fixed inset-x-0 top-14 z-[64] flex justify-center px-3">
      <div className="fumetto-vocale flex items-center gap-2 rounded-full border-2 border-oro bg-notte/95 py-1.5 pr-1.5 pl-3 text-sm font-semibold text-luce shadow-xl">
        <span>🎤 {nick(ultimo.utente)}</span>
        <button
          type="button"
          onClick={riascolta}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-3 py-1.5 text-[#2b1a05]"
        >
          <Play size={14} /> {ultimo.partito ? "Riascolta" : "Ascolta"}
        </button>
        <button type="button" onClick={chiudi} className="grid h-8 w-8 place-items-center rounded-full bg-white/10" aria-label="Chiudi">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
