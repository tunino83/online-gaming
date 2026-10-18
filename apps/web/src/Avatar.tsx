/** Avatar dei giocatori: il cerchio con il personaggio e la griglia per sceglierlo. */
import { AVATAR, avatar } from "@og/engine";
import { useEffect, useRef, useState } from "react";

export function CerchioAvatar({ id, dimensione = 36, titolo }: { id: string | null | undefined; dimensione?: number; titolo?: string }) {
  const a = avatar(id);
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full border-2 border-white shadow"
      style={{ width: dimensione, height: dimensione, background: a.colore, fontSize: dimensione * 0.58 }}
      title={titolo ?? a.nome}
      aria-label={titolo ?? a.nome}
    >
      <span aria-hidden="true">{a.simbolo}</span>
    </span>
  );
}

export function SceltaAvatar({ valore, onScegli }: { valore: string; onScegli: (id: string) => void }) {
  return (
    <div>
      <span className="text-sm font-semibold">Il tuo avatar</span>
      <div className="mt-1 grid grid-cols-6 gap-2">
        {AVATAR.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onScegli(a.id)}
            className={`grid place-items-center rounded-full p-0.5 ${valore === a.id ? "ring-4 ring-oro" : ""}`}
            aria-pressed={valore === a.id}
            aria-label={a.nome}
          >
            <CerchioAvatar id={a.id} dimensione={40} />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Avatar con l'anello dei punti: si riempie verso i punti per vincere, brilla quando il giocatore
 * è di turno e fa volare "+N" quando segna.
 */
export function AvatarPunti({
  id,
  punti,
  traguardo,
  diTurno,
  dimensione = 52,
  carteInMano,
  titolo,
}: {
  id: string | null | undefined;
  punti: number;
  traguardo: number;
  diTurno?: boolean;
  dimensione?: number;
  carteInMano?: number;
  titolo?: string;
}) {
  const precedenti = useRef(punti);
  const [guadagno, setGuadagno] = useState<{ quanti: number; chiave: number } | null>(null);
  useEffect(() => {
    if (punti > precedenti.current) setGuadagno({ quanti: punti - precedenti.current, chiave: Date.now() });
    precedenti.current = punti;
  }, [punti]);

  const raggio = dimensione / 2 - 3;
  const circonferenza = 2 * Math.PI * raggio;
  const parte = Math.min(1, punti / Math.max(1, traguardo));
  return (
    <span className="relative inline-block shrink-0" style={{ width: dimensione, height: dimensione }} title={titolo}>
      <svg width={dimensione} height={dimensione} className={`absolute inset-0 -rotate-90 ${diTurno ? "anello-turno" : ""}`} aria-hidden="true">
        <circle cx={dimensione / 2} cy={dimensione / 2} r={raggio} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="4" />
        <circle
          cx={dimensione / 2}
          cy={dimensione / 2}
          r={raggio}
          fill="none"
          stroke={diTurno ? "#f2d58a" : "#c9a24a"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circonferenza * parte} ${circonferenza}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute inset-[5px] grid place-items-center">
        <CerchioAvatar id={id} dimensione={dimensione - 10} titolo={titolo} />
      </span>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-oro bg-notte px-1.5 text-[10px] font-bold leading-4 text-oro-chiaro">
        {punti}
      </span>
      {carteInMano !== undefined && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-md border border-oro bg-[#1f3f73] px-1 text-[10px] font-bold text-white" title="Carte in mano">
          {carteInMano}
        </span>
      )}
      {guadagno && (
        <span key={guadagno.chiave} className="punti-vola rounded-full bg-oro px-2 py-0.5 text-sm font-bold text-[#2b1a05] shadow">
          +{guadagno.quanti}
        </span>
      )}
    </span>
  );
}
