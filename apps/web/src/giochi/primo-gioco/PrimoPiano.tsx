/**
 * Una carta in primo piano, grande al centro dello schermo: per leggerla bene (tocco su una carta)
 * o per vedere la carta appena pescata. Si chiude con "OK" o toccando fuori.
 */
import { personaggio } from "@og/primo-gioco";
import { useEffect } from "react";
import { CartaNumeroGrafica, CartaPersonaggioGrafica } from "./carte";

export type CartaDaMostrare = { tipo: "personaggio"; id: string } | { tipo: "numero"; valore: number };

export function PrimoPiano({ carta, titolo, onChiudi }: { carta: CartaDaMostrare; titolo?: string; onChiudi: () => void }) {
  // Si chiude anche col tasto Esc
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [onChiudi]);

  const larghezza = Math.min(carta.tipo === "personaggio" ? 320 : 200, window.innerWidth - 64);
  const p = carta.tipo === "personaggio" ? personaggio(carta.id) : null;
  return (
    <div className="velo" onClick={onChiudi} role="dialog" aria-modal="true" aria-label={titolo ?? p?.nome ?? "Carta"}>
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {titolo && <p className="rounded-full border-2 border-oro bg-notte px-5 py-1.5 font-titolo text-xl font-bold text-oro-chiaro shadow">{titolo}</p>}
        <div className="gira">
          {carta.tipo === "personaggio" ? (
            <CartaPersonaggioGrafica id={carta.id} larghezza={larghezza} />
          ) : (
            <CartaNumeroGrafica valore={carta.valore} larghezza={larghezza} />
          )}
        </div>
        {p && <p className="max-w-[320px] text-center font-titolo text-lg font-bold text-white drop-shadow">{p.nome}</p>}
        <button type="button" onClick={onChiudi} className="rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-8 py-2.5 font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518]">
          OK
        </button>
      </div>
    </div>
  );
}
