/**
 * Le carte pescate, prese o attivate compaiono a schermo una dopo l'altra (si chiudono da sole o con un tocco);
 * per le carte attivate o usate parte anche la loro voce (audio.ts).
 */
import { type VistaGiocatore, carta } from "@og/famiglia";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { suonoMagia } from "../../lib/suoni";
import { type Annuncio, annunciTraViste } from "./annunci";
import { suonaVoce } from "./audio";
import { CartaFamiglia, CartaNumeroGrafica, TIPOLOGIE, tipologieCarta } from "./carte";

/** Quanto resta a schermo ogni annuncio. */
const DURATA_MS = { attivazione: 2400, personaggio: 1500, numero: 900, punto: 1300 } as const;
/** Se se ne accumulano troppi (es. tornando sulla pagina) si tengono solo gli ultimi. */
const MASSIMO_IN_CODA = 6;

/** Annunci e voci tra una vista e la successiva dello stesso giocatore (`io` = "" per gli spettatori). */
export function useAnnunci(vista: VistaGiocatore | undefined, io: string, nick: (id: string) => string) {
  const [coda, setCoda] = useState<Annuncio[]>([]);
  const prima = useRef<VistaGiocatore | null>(null);
  useEffect(() => {
    if (!vista) return;
    const vecchia = prima.current;
    prima.current = vista;
    if (!vecchia) return; // primo caricamento: niente annunci per il passato
    const { annunci, voci } = annunciTraViste(vecchia, vista, io, nick);
    for (const v of voci) suonaVoce(v);
    if (annunci.length > 0) setCoda((c) => [...c, ...annunci].slice(-MASSIMO_IN_CODA));
  }, [vista, io, nick]);
  const salta = () => setCoda((c) => c.slice(1));
  return { corrente: coda[0] ?? null, salta };
}

export function AnnuncioCarta({ annuncio, onFine }: { annuncio: Annuncio; onFine: () => void }) {
  const durata =
    annuncio.tipo === "numero"
      ? DURATA_MS.numero
      : annuncio.tipo === "punto"
        ? DURATA_MS.punto
        : annuncio.attivazione
          ? DURATA_MS.attivazione
          : DURATA_MS.personaggio;
  // La fine si chiama una volta sola per annuncio, anche se la schermata sotto si aggiorna
  const fine = useRef(onFine);
  fine.current = onFine;
  useEffect(() => {
    if ((annuncio.tipo === "personaggio" && annuncio.attivazione) || annuncio.tipo === "punto") suonoMagia();
    const t = setTimeout(() => fine.current(), durata);
    return () => clearTimeout(t);
  }, [annuncio.chiave, durata, annuncio]);

  // La carta più grande possibile, lasciando spazio alla scritta sotto (e senza uscire dallo schermo)
  const massimo = Math.round(Math.min(window.innerWidth * 0.82, (window.innerHeight - 170) / 1.4, 340));
  const colore =
    annuncio.tipo === "personaggio" && annuncio.idCarta ? TIPOLOGIE[tipologieCarta(carta(annuncio.idCarta))[0] ?? "aiuto"].colore : "#d4823a";
  return (
    <button
      type="button"
      key={annuncio.chiave}
      onClick={() => fine.current()}
      className={`fm-annuncio ${annuncio.tipo === "personaggio" && annuncio.attivazione ? "fm-annuncio-attiva" : ""}`}
      style={{ "--colore-annuncio": colore } as CSSProperties}
      aria-label={annuncio.testo}
    >
      <span className="fm-annuncio-carta">
        {annuncio.tipo === "punto" ? (
          <span className="fm-annuncio-punto">+1 🎯</span>
        ) : annuncio.tipo === "personaggio" ? (
          annuncio.idCarta ? (
            <CartaFamiglia idCarta={annuncio.idCarta} dimensione={annuncio.attivazione ? massimo : Math.round(massimo * 0.85)} />
          ) : (
            <CartaFamiglia idCarta="" coperta dimensione={Math.round(massimo * 0.6)} />
          )
        ) : annuncio.carta ? (
          <span className="fm-annuncio-numero">
            <CartaNumeroGrafica c={annuncio.carta} />
          </span>
        ) : (
          <span className="fm-annuncio-numero">
            <span className="cf-num h-16 w-12 text-2xl">
              <b>?</b>
            </span>
          </span>
        )}
      </span>
      <span className="fm-annuncio-testo">{annuncio.testo}</span>
    </button>
  );
}
