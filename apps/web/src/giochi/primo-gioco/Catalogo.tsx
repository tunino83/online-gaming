/**
 * "Tutte le carte": l'elenco completo dei personaggi con immagine, codice per attivarli, punti e potere.
 * Toccando una carta si apre in grande e si possono sfogliare tutte (carosello).
 */
import { PERSONAGGI } from "@og/primo-gioco";
import { useState } from "react";
import { CartaPersonaggioGrafica } from "./carte";
import { PrimoPiano } from "./PrimoPiano";

/** Ordine del carosello: lo stesso dell'elenco. */
export const TUTTI_I_PERSONAGGI: readonly string[] = PERSONAGGI.map((p) => p.id);

export function CatalogoCarte() {
  const [aperta, setAperta] = useState<string | null>(null);
  const carte = PERSONAGGI.reduce((n, p) => n + p.copie, 0);
  return (
    <div>
      <p className="mb-2 text-sm">
        {PERSONAGGI.length} personaggi, {carte} carte nel mazzo. Tocca una carta per vederla in grande e scorri di lato per sfogliarle tutte.
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PERSONAGGI.map((p) => (
          <li key={p.id} className="flex flex-col items-center gap-1 rounded-xl border border-inchiostro/15 bg-white/50 p-2 text-center">
            <CartaPersonaggioGrafica id={p.id} larghezza={120} onIngrandisci={() => setAperta(p.id)} onTocca={() => setAperta(p.id)} />
            <p className="font-titolo text-sm leading-tight font-bold">{p.nome}</p>
            <p className="text-xs">
              <strong>Si attiva con:</strong> {p.codiceTesto}
            </p>
            <p className="text-xs">
              <strong>
                {p.punti} {p.punti === 1 ? "punto" : "punti"}
              </strong>
              {p.copie > 1 && ` · ${p.copie} copie`}
            </p>
            <p className="text-xs text-tenue">{p.potereTesto}</p>
          </li>
        ))}
      </ul>
      {aperta && <PrimoPiano carta={{ tipo: "personaggio", id: aperta }} elenco={TUTTI_I_PERSONAGGI} onChiudi={() => setAperta(null)} />}
    </div>
  );
}
