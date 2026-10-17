/**
 * Schermata di gioco essenziale del primo gioco: tutto ciò che il giocatore vede,
 * e le mosse possibili come pulsanti (le calcola il server).
 */
import { type CartaDiamante, type CartaPersonaggio, type Mossa, type VistaGiocatore, personaggio } from "@og/primo-gioco";
import { useMemo, useState } from "react";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { Caricamento, Errore, Riquadro } from "../../ui";
import { aPersona, descriviMossa, gruppoMossa, raccogliCarte, testoDiamante } from "./descrivi";

const TITOLI_GRUPPI = {
  scelta: "Devi scegliere",
  attiva: "Attiva un personaggio (costa 1)",
  gratis: "Azioni gratuite",
  mosse: "Mosse (costano 1)",
  fine: "Chiudi il turno",
} as const;

export function TavoloPrimoGioco({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  // Dopo una mossa riuscita i pulsanti restano spenti finché non arriva la situazione aggiornata
  // (versione più nuova di questa), così non si può toccare una mossa ormai vecchia.
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => m.get(id) ?? "?";
  }, [giocatori]);

  if (erroreLettura) return <Errore testo={erroreLettura} />;
  if (!riga) return <Caricamento testo="Preparo il tavolo…" />;

  const v = riga.vista;
  const carte = raccogliCarte(v);
  const mioTurno = v.turno.giocatore === io && !v.finita;

  const bloccato = invio || (aspettoOltre !== null && riga.versione <= aspettoOltre);

  async function gioca(mossa: Mossa) {
    if (bloccato) return;
    setInvio(true);
    setErrore(null);
    setAspettoOltre(riga!.versione);
    const r = await chiediArbitro({ azione: "mossa", partitaId: partita.id, mossa });
    setInvio(false);
    if (r.ok) {
      ricarica(); // non aspettiamo solo il tempo reale: rileggiamo subito
    } else {
      setAspettoOltre(null);
      setErrore(r.errore);
    }
  }

  const gruppi = new Map<keyof typeof TITOLI_GRUPPI, Mossa[]>();
  for (const m of riga.mosse_valide) {
    const g = gruppoMossa(m);
    gruppi.set(g, [...(gruppi.get(g) ?? []), m]);
  }

  return (
    <div className="space-y-4">
      {v.finita ? (
        <Esito partita={partita} v={v} nick={nick} io={io} />
      ) : (
        <div className={`rounded-xl px-4 py-3 text-center font-semibold ${mioTurno ? "bg-blu text-white" : "bg-carta"}`}>
          {mioTurno ? `Tocca a te! Mosse rimaste: ${v.turno.mosseRimaste}` : `Tocca ${aPersona(nick(v.turno.giocatore))}…`}
          {v.ultimoTurno !== null && <div className="text-xs font-normal">Ultimo giro: qualcuno ha raggiunto i punti per vincere</div>}
        </div>
      )}

      <Riquadro titolo="Tavolo">
        <div className="mb-2 flex flex-wrap gap-2">
          {v.tavolo.numeri.map((c, i) => (c ? <Numero key={c.id} valore={c.valore} /> : <Vuoto key={`n${i}`} />))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {v.tavolo.personaggi.map((c, i) => (c ? <MiniPersonaggio key={c.id} carta={c} /> : <Vuoto key={`p${i}`} />))}
        </div>
        <p className="mt-2 text-xs text-tenue">
          Mazzi coperti: {v.mazzi.numeri} numeri · {v.mazzi.personaggi} personaggi · {v.mazzi.diamanti} diamanti
        </p>
        {v.primoPersonaggio && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-bold text-tenue">Prima carta del mazzo personaggi (Mago):</p>
            <MiniPersonaggio carta={v.primoPersonaggio} />
          </div>
        )}
      </Riquadro>

      {v.manoAvversario && v.turno.attesa?.tipo === "fatina" && (
        <Riquadro titolo={`Mano di ${nick(v.turno.attesa.avversario)} (Fatina)`}>
          <div className="flex flex-wrap gap-2">
            {v.manoAvversario.map((c) => (
              <Numero key={c.id} valore={c.valore} />
            ))}
          </div>
        </Riquadro>
      )}

      <Riquadro titolo={`La tua mano (${v.mano.length}/${v.limiteMano})`}>
        <div className="flex flex-wrap gap-2">
          {v.mano.length === 0 && <span className="text-sm text-tenue">Nessuna carta</span>}
          {[...v.mano].sort((a, b) => a.valore - b.valore).map((c) => (
            <Numero key={c.id} valore={c.valore} />
          ))}
        </div>
        <Diamanti diamanti={v.giocatori[io]?.diamanti ?? []} />
      </Riquadro>

      {mioTurno && (
        <Riquadro titolo="Cosa vuoi fare?">
          <Errore testo={errore} />
          <div className="space-y-4">
            {(Object.keys(TITOLI_GRUPPI) as (keyof typeof TITOLI_GRUPPI)[]).map((g) =>
              gruppi.has(g) ? (
                <div key={g}>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">{TITOLI_GRUPPI[g]}</h3>
                  <div className="space-y-1.5">
                    {gruppi.get(g)!.map((m) => (
                      <button
                        key={JSON.stringify(m)}
                        type="button"
                        disabled={bloccato}
                        onClick={() => gioca(m)}
                        className="w-full rounded-lg border-2 border-inchiostro/20 bg-white px-3 py-2 text-left text-sm hover:border-blu disabled:opacity-40"
                      >
                        {descriviMossa(m, v, carte, nick)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </Riquadro>
      )}

      {v.ordine.map((id) => (
        <SchedaGiocatore key={id} nome={nick(id)} tu={id === io} diTurno={id === v.turno.giocatore && !v.finita} g={v.giocatori[id]!} />
      ))}
    </div>
  );
}

function SchedaGiocatore({ nome, tu, diTurno, g }: { nome: string; tu: boolean; diTurno: boolean; g: VistaGiocatore["giocatori"][string] }) {
  return (
    <section className={`rounded-2xl border-2 bg-carta p-4 ${diTurno ? "border-blu" : "border-inchiostro/15"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-titolo text-lg font-bold">
          {nome} {tu && <span className="text-sm font-normal text-tenue">(tu)</span>}
        </h3>
        <span className="rounded-full bg-inchiostro px-3 py-1 text-sm font-bold text-carta">{g.punti} punti</span>
      </div>
      <p className="text-xs text-tenue">Carte in mano: {g.carteInMano}</p>
      <Diamanti diamanti={g.diamanti} />
      <p className="mt-2 text-xs font-bold text-tenue">Nei posti</p>
      <div className="grid grid-cols-2 gap-2">
        {g.posti.length === 0 && <span className="text-sm text-tenue">Vuoti</span>}
        {g.posti.map((c) => (
          <MiniPersonaggio key={c.id} carta={c} />
        ))}
      </div>
      {g.attivati.length > 0 && (
        <p className="mt-2 text-xs text-tenue">
          <strong>Attivati:</strong> {g.attivati.map((c) => personaggio(c.personaggio).nome).join(", ")}
        </p>
      )}
    </section>
  );
}

function Diamanti({ diamanti }: { diamanti: CartaDiamante[] }) {
  if (diamanti.length === 0) return null;
  return (
    <p className="mt-2 text-sm">
      Diamanti:{" "}
      {diamanti.map((d) => (
        <span key={d.id} className="mr-1 rounded bg-[#1f9bb5]/10 px-1.5 py-0.5 font-semibold text-[#1f7f95]">
          {testoDiamante(d)}
        </span>
      ))}
    </p>
  );
}

function Numero({ valore }: { valore: number }) {
  return (
    <span className="grid h-12 w-9 place-items-center rounded-md border-2 border-inchiostro bg-white font-titolo text-xl font-bold">
      {valore}
    </span>
  );
}

function Vuoto() {
  return <span className="grid h-12 w-9 place-items-center rounded-md border-2 border-dashed border-inchiostro/20 text-tenue">–</span>;
}

function coloreTipo(c: CartaPersonaggio): string {
  const colori = new Set(personaggio(c.personaggio).poteri.map((p) => p.colore));
  if (colori.size === 0) return "border-tenue";
  if (colori.has("speciale")) return "border-oro";
  if (colori.has("rosso") && colori.has("blu")) return "border-[#7b4a9e]";
  return colori.has("rosso") ? "border-rosso" : "border-blu";
}

function MiniPersonaggio({ carta }: { carta: CartaPersonaggio }) {
  const p = personaggio(carta.personaggio);
  return (
    <div className={`rounded-lg border-[3px] bg-white p-2 text-xs ${coloreTipo(carta)}`}>
      <div className="flex items-start justify-between gap-1">
        <strong className="font-titolo text-sm leading-tight">{p.nome}</strong>
        <span className="shrink-0 rounded-full bg-inchiostro px-1.5 text-[11px] font-bold text-carta">{p.punti}</span>
      </div>
      <div className="mt-1 font-semibold">Codice: {p.codiceTesto}</div>
      {p.poteri.length > 0 && <div className="mt-0.5 leading-snug text-tenue">{p.potereTesto}</div>}
    </div>
  );
}

function Esito({ partita, v, nick, io }: { partita: Partita; v: VistaGiocatore; nick: (id: string) => string; io: string }) {
  const punti = partita.esito?.punti ?? Object.fromEntries(v.ordine.map((id) => [id, v.giocatori[id]!.punti]));
  const vincitori = partita.esito?.vincitori ?? [];
  const classifica = [...v.ordine].sort((a, b) => (punti[b] ?? 0) - (punti[a] ?? 0));
  const hoVinto = vincitori.includes(io);
  return (
    <Riquadro titolo="Partita finita!">
      <p className="mb-3 font-semibold">
        {vincitori.length > 1
          ? `Pareggio tra ${vincitori.map(nick).join(" e ")}`
          : hoVinto
            ? "Hai vinto! 🎉"
            : `Ha vinto ${nick(vincitori[0] ?? "")}`}
      </p>
      <ol className="space-y-1">
        {classifica.map((id, i) => (
          <li key={id} className="flex justify-between">
            <span>
              {i + 1}. {nick(id)} {id === io && <span className="text-tenue">(tu)</span>}
            </span>
            <strong>{punti[id] ?? 0} punti</strong>
          </li>
        ))}
      </ol>
    </Riquadro>
  );
}
