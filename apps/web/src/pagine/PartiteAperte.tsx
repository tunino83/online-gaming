/**
 * Lista delle partite aperte (in attesa di giocatori) nella pagina iniziale: si entra senza invito.
 * La lista la prepara l'arbitro e si aggiorna da sola ogni pochi secondi.
 */
import { useEffect, useState } from "react";
import { CerchioAvatar } from "../Avatar";
import { chiediArbitro } from "../lib/supabase";

export interface PartitaAperta {
  codice: string;
  gioco: string;
  creatore: string;
  avatar: string;
  giocatori: number;
  maxGiocatori: number;
  creataIl: string;
}

const NOMI_GIOCHI: Record<string, string> = { "primo-gioco": "✨ Il Portale", ufficio: "🏢 Ufficio" };

function quantoFa(quando: string): string {
  const minuti = Math.max(0, Math.round((Date.now() - Date.parse(quando)) / 60000));
  if (minuti < 1) return "adesso";
  if (minuti < 60) return `${minuti} min fa`;
  return `${Math.round(minuti / 60)} h fa`;
}

export function PartiteAperte({ onEntra, inCorso }: { onEntra: (codice: string) => void; inCorso: boolean }) {
  const [partite, setPartite] = useState<PartitaAperta[] | null>(null);

  useEffect(() => {
    let vivo = true;
    const carica = async () => {
      const r = await chiediArbitro({ azione: "aperte" });
      if (vivo && r.ok) setPartite(r.partite as PartitaAperta[]);
    };
    void carica();
    // poi ogni 8 secondi, ma solo mentre la pagina è davanti agli occhi
    const t = setInterval(() => document.visibilityState === "visible" && void carica(), 8000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div>
      <p className="text-sm font-semibold">Partite aperte</p>
      <p className="mb-2 text-xs text-tenue">Partite che aspettano giocatori: entri senza invito, col nickname e l'avatar scelti qui sopra.</p>
      {partite === null ? (
        <p className="text-xs text-tenue">Cerco le partite…</p>
      ) : partite.length === 0 ? (
        <p className="rounded-xl border border-dashed border-inchiostro/20 px-3 py-2 text-center text-xs text-tenue">
          Nessuna partita aperta in questo momento. Creane una tu!
        </p>
      ) : (
        <ul className="space-y-2">
          {partite.map((p) => (
            <li key={p.codice} className="flex items-center gap-2 rounded-xl border border-inchiostro/15 bg-white/60 px-2 py-2">
              <CerchioAvatar id={p.avatar} dimensione={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {NOMI_GIOCHI[p.gioco] ?? p.gioco} · di {p.creatore}
                </p>
                <p className="text-xs text-tenue">
                  {p.giocatori}/{p.maxGiocatori} giocatori · {quantoFa(p.creataIl)}
                </p>
              </div>
              <button
                type="button"
                disabled={inCorso}
                onClick={() => onEntra(p.codice)}
                className="shrink-0 rounded-lg bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-3 py-1.5 text-sm font-semibold text-[#2b1a05] shadow-[0_2px_0_#7a5518] disabled:opacity-40"
              >
                Entra
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
