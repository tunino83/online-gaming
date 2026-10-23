/**
 * Una carta in primo piano, grande al centro dello schermo: per leggerla bene (tocco su una carta)
 * o per vedere la carta appena pescata. Si chiude con "OK" o toccando fuori.
 * Con un elenco di personaggi diventa un carosello: frecce, swipe laterale o tasti ← → per sfogliarli tutti.
 */
import { personaggio, tipoCarta } from "@og/primo-gioco";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CartaNumeroGrafica, CartaPersonaggioGrafica } from "./carte";

export type CartaDaMostrare = { tipo: "personaggio"; id: string } | { tipo: "numero"; valore: number; frecce?: boolean };

export function PrimoPiano({
  carta,
  titolo,
  elenco,
  azione,
  onChiudi,
}: {
  carta: CartaDaMostrare;
  titolo?: string;
  /** id dei personaggi da sfogliare (carosello) */
  elenco?: readonly string[];
  /** pulsante per confermare una mossa con questa carta (es. "Prendi questa carta"); c'è anche "Chiudi" */
  azione?: { testo: string; onClick: () => void; disabilitata?: boolean };
  onChiudi: () => void;
}) {
  const iniziale = carta.tipo === "personaggio" && elenco ? Math.max(0, elenco.indexOf(carta.id)) : -1;
  const [indice, setIndice] = useState(iniziale);
  const [verso, setVerso] = useState<"sinistra" | "destra" | null>(null);
  const carosello = !!elenco && indice >= 0 && elenco.length > 1;
  const inizioSwipe = useRef<number | null>(null);

  const scorri = (passo: number) => {
    if (!elenco) return;
    setVerso(passo > 0 ? "destra" : "sinistra");
    setIndice((i) => (i + passo + elenco.length) % elenco.length);
  };

  // Esc chiude; le frecce della tastiera sfogliano
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChiudi();
      else if (carosello && e.key === "ArrowRight") scorri(1);
      else if (carosello && e.key === "ArrowLeft") scorri(-1);
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  });

  const mostrata: CartaDaMostrare = carosello ? { tipo: "personaggio", id: elenco![indice]! } : carta;
  const larghezza = Math.min(mostrata.tipo === "personaggio" ? 320 : 200, window.innerWidth - (carosello ? 96 : 64));
  const p = mostrata.tipo === "personaggio" ? personaggio(mostrata.id) : null;
  return (
    <div className="velo" onClick={onChiudi} role="dialog" aria-modal="true" aria-label={titolo ?? p?.nome ?? "Carta"}>
      {/* Su schermi bassi (telefono) il contenuto scorre e i pulsanti restano sempre in fondo, visibili */}
      <div
        className="flex max-w-full flex-col items-center gap-4 overflow-y-auto overscroll-contain"
        style={{ maxHeight: "calc(100dvh - 32px)" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          inizioSwipe.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const inizio = inizioSwipe.current;
          const fine = e.changedTouches[0]?.clientX;
          inizioSwipe.current = null;
          if (!carosello || inizio === null || fine === undefined) return;
          if (fine - inizio < -40) scorri(1);
          else if (fine - inizio > 40) scorri(-1);
        }}
      >
        {titolo && <p className="rounded-full border-2 border-oro bg-notte px-5 py-1.5 font-titolo text-xl font-bold text-oro-chiaro shadow">{titolo}</p>}
        <div className="flex items-center gap-1">
          {carosello && <FrecciaCarosello etichetta="Carta precedente" onClick={() => scorri(-1)} sinistra />}
          <div key={carosello ? indice : undefined} className={carosello && verso ? `scivola-${verso}` : "gira"}>
            {mostrata.tipo === "personaggio" ? (
              <CartaPersonaggioGrafica id={mostrata.id} larghezza={larghezza} />
            ) : (
              <CartaNumeroGrafica valore={mostrata.valore} frecce={mostrata.frecce} larghezza={larghezza} />
            )}
          </div>
          {carosello && <FrecciaCarosello etichetta="Carta successiva" onClick={() => scorri(1)} />}
        </div>
        {p && (
          <div className="max-w-[320px] text-center text-white drop-shadow">
            <p className="font-titolo text-lg font-bold">{p.nome}</p>
            <div className="mx-auto mt-1 max-w-[320px] rounded-xl bg-black/45 px-3 py-2 text-left text-sm leading-snug">
              <p>
                <strong>Si attiva con:</strong> {p.codiceTesto}
              </p>
              <p>
                <strong>Punti:</strong> {p.punti}
                {p.copie > 1 && ` · ${p.copie} copie nel mazzo`}
              </p>
              <p>
                {p.poteri.length > 0 ? (
                  <>
                    <strong>Potere ({tipoCarta(p).etichetta.toLowerCase()}):</strong> {p.potereTesto}
                  </>
                ) : (
                  <strong>Nessun potere</strong>
                )}
              </p>
            </div>
            {carosello && (
              <p className="text-xs text-white/70">
                {indice + 1} di {elenco!.length} · scorri di lato per vedere le altre
              </p>
            )}
          </div>
        )}
        <div className="sticky bottom-0 flex w-full shrink-0 justify-center gap-2 bg-gradient-to-t from-black/80 via-black/60 to-transparent pb-1 pt-4">
        {azione ? (
          <>
            <button type="button" onClick={onChiudi} className="rounded-xl border-2 border-white/70 bg-black/30 px-6 py-2.5 font-semibold text-white">
              Chiudi
            </button>
            <button
              type="button"
              disabled={azione.disabilitata}
              onClick={() => {
                azione.onClick();
                onChiudi();
              }}
              className="rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-6 py-2.5 font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518] disabled:opacity-40"
            >
              {azione.testo}
            </button>
          </>
        ) : (
          <button type="button" onClick={onChiudi} className="rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-8 py-2.5 font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518]">
            OK
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

function FrecciaCarosello({ etichetta, onClick, sinistra }: { etichetta: string; onClick: () => void; sinistra?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etichetta}
      title={etichetta}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-oro/70 bg-black/40 text-[#f2d58a] transition hover:bg-black/60"
    >
      {sinistra ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
}
