/**
 * Animazione quando qualcuno (io o un avversario) attiva un personaggio:
 * la carta compare grande con un alone magico e scintille, poi sparisce da sola.
 */
import { type Evento, personaggio, tipoCarta } from "@og/ufficio";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { suonoMagia } from "../../lib/suoni";
import { CartaPersonaggioGrafica } from "./carte";

const COLORI = { blu: "#3b82f6", rosso: "#ef4444", misto: "#a855f7", speciale: "#f5b70a", nessuno: "#cbd5e1" } as const;
const DURATA_MS = 2800;

type Attivazione = Extract<Evento, { tipo: "attiva" }>;

export function AnimazioneAttivazione({
  evento,
  nick,
  io,
  onFine,
}: {
  evento: Attivazione;
  nick: (id: string) => string;
  io: string;
  onFine: () => void;
}) {
  const p = personaggio(evento.personaggio);
  const colore = COLORI[tipoCarta(p).colore];
  const chi = evento.giocatore === io ? "Hai attivato" : `${nick(evento.giocatore)} ha attivato`;

  // La fine si chiama una volta sola, anche se la schermata sotto si aggiorna nel frattempo
  const fine = useRef(onFine);
  fine.current = onFine;
  useEffect(() => {
    suonoMagia();
    const t = setTimeout(() => fine.current(), DURATA_MS);
    return () => clearTimeout(t);
  }, []);

  // Scintille in posizioni e tempi diversi (fissate per tutta l'animazione)
  const scintille = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: Math.round(Math.cos((i / 18) * Math.PI * 2) * (90 + (i % 3) * 30)),
        ritardo: (i % 6) * 0.12,
        dimensione: 6 + (i % 4) * 3,
      })),
    [],
  );

  return (
    <div className="magia-velo" onClick={onFine} role="dialog" aria-label={`${chi} ${p.nome}`}>
      <div className="relative flex flex-col items-center" style={{ "--magia": colore } as CSSProperties}>
        <div className="magia-alone" aria-hidden="true" />
        <div className="magia-carta">
          <CartaPersonaggioGrafica id={p.id} larghezza={Math.min(250, window.innerWidth - 90)} />
        </div>
        {scintille.map((s, i) => (
          <span
            key={i}
            className="scintilla"
            aria-hidden="true"
            style={{ "--x": `${s.x}px`, animationDelay: `${0.3 + s.ritardo}s`, width: s.dimensione, height: s.dimensione } as CSSProperties}
          />
        ))}
        <p className="magia-testo mt-4 rounded-full bg-white text-inchiostro px-5 py-2 text-center font-titolo text-lg font-bold shadow-lg">
          {chi} {p.nome}!{" "}
          <span className="rounded-full px-2 py-0.5 text-base text-white" style={{ background: colore }}>
            +{evento.punti}
          </span>
        </p>
      </div>
    </div>
  );
}
