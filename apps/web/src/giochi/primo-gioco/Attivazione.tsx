/**
 * Pannello per attivare un personaggio toccando le carte da usare.
 * Il pannello trova da solo come usare le carte scelte (diamante come carta o come +1, nani,
 * Folletto...); il server ricontrolla comunque la mossa.
 */
import {
  type CartaPersonaggio,
  type CartaVirtuale,
  type Mossa,
  type VistaGiocatore,
  combinazioneConCarte,
  personaggio,
  risorseDaVista,
  risorseUsate,
} from "@og/primo-gioco";
import { type ReactNode, useMemo, useState } from "react";
import { CartaNumeroGrafica, CartaPersonaggioGrafica, Diamante } from "./carte";
import { ilNumero } from "./descrivi";

interface Props {
  v: VistaGiocatore;
  carta: CartaPersonaggio;
  /** Mosse di attivazione proposte dal server per questa carta (per il suggerimento). */
  proposte: Extract<Mossa, { tipo: "attiva" }>[];
  nick: (id: string) => string;
  bloccato: boolean;
  onAttiva: (m: Mossa) => void;
  onChiudi: () => void;
}

export function PannelloAttivazione({ v, carta, proposte, nick, bloccato, onAttiva, onChiudi }: Props) {
  const p = personaggio(carta.personaggio);
  const risorse = useMemo(() => risorseDaVista(v), [v]);
  const [scelte, setScelte] = useState<string[]>([]);
  const [tieni, setTieni] = useState<string | undefined>(undefined);
  const [bersaglio, setBersaglio] = useState<{ giocatore: string; carta: string } | undefined>(undefined);
  const [avversario, setAvversario] = useState<string | undefined>(undefined);

  const combinazione = useMemo(() => combinazioneConCarte(risorse, p.codice, scelte), [risorse, p.codice, scelte]);
  const effetti = p.poteri.map((x) => x.effetto.tipo);
  const avversari = v.ordine.filter((id) => id !== v.io);
  const bersagli = avversari.flatMap((g) => v.giocatori[g]!.posti.map((c) => ({ giocatore: g, carta: c })));

  const servonoBersaglio = effetti.includes("scartaPersonaggioAvversario") && bersagli.length > 0;
  const serveAvversario = effetti.includes("rubaCarta");
  const pronta = combinazione !== null && (!servonoBersaglio || bersaglio) && (!serveAvversario || avversario);

  const alterna = (id: string) => {
    setTieni(undefined);
    setScelte((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const suggerisci = () => {
    const prima = proposte[0];
    if (prima) setScelte(risorseUsate(prima.combinazione));
  };
  const attiva = () => {
    if (!combinazione) return;
    onAttiva({
      tipo: "attiva",
      carta: carta.id,
      combinazione,
      ...(tieni ? { tieni } : {}),
      ...(servonoBersaglio && bersaglio ? { bersaglio } : {}),
      ...(serveAvversario && avversario ? { avversario } : {}),
    });
  };

  const testoVirtuale = (x: CartaVirtuale) =>
    `${x.valore === "aScelta" ? "A scelta" : x.valore} (${personaggio(cartaDa(v, x.fonte)?.personaggio ?? "").nome})`;
  const cartaScelta = (id: string) => v.mano.find((c) => c.id === id);
  const diamanteScelto = (id: string) => v.giocatori[v.io]!.diamanti.find((d) => d.id === id);

  return (
    <div className="velo" role="dialog" aria-label={`Attiva ${p.nome}`}>
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-carta p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <CartaPersonaggioGrafica id={p.id} larghezza={120} compatta />
          <div className="flex-1">
            <h2 className="font-titolo text-xl font-bold">Attiva {p.nome}</h2>
            <p className="mt-1 text-sm">
              Codice: <strong>{p.codiceTesto}</strong>
            </p>
            <p className="mt-2 text-sm text-tenue">Tocca le carte che vuoi usare.</p>
            {proposte.length > 0 && scelte.length === 0 && (
              <button type="button" onClick={suggerisci} className="mt-2 text-sm font-semibold text-blu underline">
                Suggeriscimi le carte
              </button>
            )}
          </div>
        </div>

        <h3 className="mt-4 mb-1 text-xs font-bold uppercase tracking-wide text-tenue">La tua mano</h3>
        <div className="flex flex-wrap gap-2">
          {v.mano.length === 0 && <span className="text-sm text-tenue">Nessuna carta</span>}
          {[...v.mano]
            .sort((a, b) => a.valore - b.valore)
            .map((c) => (
              <CartaNumeroGrafica key={c.id} valore={c.valore} larghezza={52} scelta={scelte.includes(c.id)} onTocca={() => alterna(c.id)} />
            ))}
        </div>

        {risorse.diamanti.length > 0 && (
          <>
            <h3 className="mt-3 mb-1 text-xs font-bold uppercase tracking-wide text-tenue">I tuoi diamanti</h3>
            <div className="flex flex-wrap gap-1">
              {risorse.diamanti.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => alterna(d.id)}
                  className={`rounded-lg p-0.5 ${scelte.includes(d.id) ? "ring-4 ring-[#1a8f4a]" : "ring-2 ring-inchiostro/10"}`}
                >
                  <Diamante d={d} />
                </button>
              ))}
            </div>
          </>
        )}

        {risorse.virtuali.length > 0 && (
          <>
            <h3 className="mt-3 mb-1 text-xs font-bold uppercase tracking-wide text-tenue">Carte dei tuoi personaggi (1 volta per turno)</h3>
            <div className="flex flex-wrap gap-2">
              {risorse.virtuali.map((x) => (
                <button
                  key={x.fonte}
                  type="button"
                  onClick={() => alterna(x.fonte)}
                  className={`rounded-lg border-2 bg-white px-3 py-1.5 text-sm font-semibold ${scelte.includes(x.fonte) ? "border-[#1a8f4a] ring-2 ring-[#1a8f4a]" : "border-inchiostro/20"}`}
                >
                  {testoVirtuale(x)}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 rounded-xl bg-white p-3 text-sm">
          {scelte.length === 0 ? (
            <span className="text-tenue">Nessuna carta scelta.</span>
          ) : combinazione ? (
            <span className="font-semibold text-[#1a8f4a]">✓ Queste carte formano il codice</span>
          ) : (
            <span className="font-semibold text-rosso">Queste carte non formano il codice</span>
          )}
        </div>

        {combinazione && effetti.includes("tieniUnaCartaDelCodice") && (
          <Scelta titolo="Gatto con gli stivali: quale carta tieni in mano?">
            {risorseUsate(combinazione)
              .filter((id) => cartaScelta(id) || diamanteScelto(id))
              .map((id) => (
                <Opzione key={id} attiva={tieni === id} onClick={() => setTieni(tieni === id ? undefined : id)}>
                  {cartaScelta(id) ? `Tieni ${ilNumero(cartaScelta(id)!.valore)}` : "Tieni il diamante"}
                </Opzione>
              ))}
          </Scelta>
        )}

        {combinazione && effetti.includes("scartaPersonaggioAvversario") && (
          <Scelta titolo="Strega: quale personaggio scarti a un avversario?">
            {bersagli.length === 0 && <span className="text-sm text-tenue">Nessun avversario ha personaggi nei posti: nessun effetto.</span>}
            {bersagli.map((b) => (
              <Opzione
                key={b.carta.id}
                attiva={bersaglio?.carta === b.carta.id}
                onClick={() => setBersaglio({ giocatore: b.giocatore, carta: b.carta.id })}
              >
                {personaggio(b.carta.personaggio).nome} di {nick(b.giocatore)}
              </Opzione>
            ))}
          </Scelta>
        )}

        {combinazione && serveAvversario && (
          <Scelta titolo="Fatina: di chi vuoi guardare la mano?">
            {avversari.map((id) => (
              <Opzione key={id} attiva={avversario === id} onClick={() => setAvversario(id)}>
                {nick(id)} ({v.giocatori[id]!.carteInMano} carte)
              </Opzione>
            ))}
          </Scelta>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onChiudi} className="rounded-xl border-2 border-inchiostro px-4 py-3 font-semibold">
            Annulla
          </button>
          <button
            type="button"
            onClick={attiva}
            disabled={!pronta || bloccato}
            className="rounded-xl bg-inchiostro px-4 py-3 font-semibold text-carta disabled:opacity-40"
          >
            Attiva
          </button>
        </div>
      </div>
    </div>
  );
}

function cartaDa(v: VistaGiocatore, id: string) {
  return v.giocatori[v.io]!.attivati.find((c) => c.id === id);
}

function Scelta({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">{titolo}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Opzione({ attiva, onClick, children }: { attiva: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${attiva ? "border-blu bg-blu text-white" : "border-inchiostro/20 bg-white"}`}
    >
      {children}
    </button>
  );
}
