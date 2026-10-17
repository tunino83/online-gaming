/**
 * Schermata di gioco del primo gioco.
 * Sul tavolo si tocca una carta per prenderla e un mazzo coperto per pescare;
 * le altre mosse (attivare, azioni gratuite, scelte, fine turno) sono pulsanti.
 * Le mosse possibili le calcola sempre il server.
 */
import type { CartaDiamante, CartaPersonaggio, Mossa, VistaGiocatore } from "@og/primo-gioco";
import { useEffect, useMemo, useState } from "react";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { Caricamento, Errore, Riquadro } from "../../ui";
import { PannelloAttivazione } from "./Attivazione";
import { CartaNumeroGrafica, CartaPersonaggioGrafica, Diamante, DorsoMazzo, PostoVuoto } from "./carte";
import { aPersona, descriviMossa, gruppoMossa, raccogliCarte } from "./descrivi";

const TITOLI_GRUPPI = {
  gratis: "Azioni gratuite",
} as const;
type GruppoElenco = keyof typeof TITOLI_GRUPPI;

export function TavoloPrimoGioco({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  // Dopo una mossa riuscita i comandi restano spenti finché non arriva la situazione aggiornata
  // (versione più nuova di questa), così non si può toccare una mossa ormai vecchia.
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [ingrandita, setIngrandita] = useState<string | null>(null);
  // Carte della mano scelte per lo scarto di fine turno (si azzerano a ogni aggiornamento)
  const [daScartare, setDaScartare] = useState<string[]>([]);
  // Personaggio (id carta) di cui è aperto il pannello di attivazione
  const [daAttivare, setDaAttivare] = useState<string | null>(null);
  const versione = riga?.versione;
  useEffect(() => setDaScartare([]), [versione]);
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
  const mosse = mioTurno ? riga.mosse_valide : [];

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

  /** Funzione da chiamare toccando qualcosa sul tavolo, se quella mossa è possibile ora. */
  const seValida = (cerca: (m: Mossa) => boolean) => {
    const m = mosse.find(cerca);
    return m ? () => gioca(m) : undefined;
  };
  const ingrandisci = (c: CartaPersonaggio) => () => setIngrandita(c.personaggio);

  const gruppi = new Map<GruppoElenco, Mossa[]>();
  for (const m of mosse) {
    const g = gruppoMossa(m);
    // Si fanno toccando le carte: tavolo, attivazioni, scarto del personaggio in più, Fatina, fine turno
    if (g !== "gratis") continue;
    gruppi.set(g, [...(gruppi.get(g) ?? []), m]);
  }

  // Fine turno: si toccano le carte da scartare (se troppe), poi "Chiudi il turno"
  const puoChiudere = mosse.some((m) => m.tipo === "fineTurno");
  const conScheletro = mosse.some((m) => m.tipo === "fineTurno" && m.cambiaMano);
  const eccesso = Math.max(0, v.mano.length - v.limiteMano);
  const scegliScarti = puoChiudere && eccesso > 0;
  const scartiPronti = daScartare.length === eccesso;
  const alternaScarto = (id: string) => () =>
    setDaScartare((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < eccesso ? [...s, id] : s));
  const chiudiTurno = (cambiaMano: boolean) => gioca({ tipo: "fineTurno", scarta: daScartare, cambiaMano });

  const proposteAttivazione = (idCarta: string) =>
    mosse.filter((m): m is Extract<Mossa, { tipo: "attiva" }> => m.tipo === "attiva" && m.carta === idCarta);
  const apriAttivazione = (c: CartaPersonaggio) =>
    proposteAttivazione(c.id).length > 0 ? () => setDaAttivare(c.id) : undefined;
  const puoiAttivare = mosse.some((m) => m.tipo === "attiva");
  const cartaDaAttivare = daAttivare
    ? Object.values(v.giocatori)
        .flatMap((g) => g.posti)
        .find((c) => c.id === daAttivare)
    : undefined;

  const attesa = mioTurno ? v.turno.attesa : null;
  const suggerimento =
    attesa?.tipo === "scartaPersonaggio"
      ? "Hai 3 personaggi: tocca nei tuoi posti quello da scartare (non il nuovo)"
      : attesa?.tipo === "fatina"
        ? "Tocca la carta che vuoi prendere"
        : scegliScarti
          ? `Hai troppe carte: tocca nella tua mano le ${eccesso} da scartare, poi chiudi il turno`
          : v.turno.mosseRimaste > 0
            ? puoiAttivare
              ? "Puoi attivare: tocca un tuo personaggio evidenziato. Oppure prendi una carta o pesca"
              : "Tocca una carta evidenziata per prenderla, o un mazzo per pescare"
            : puoChiudere
              ? "Mosse finite: puoi ancora usare le azioni qui sotto (es. il fulmine), oppure chiudere il turno"
              : null;
  const brucia = seValida((m) => m.tipo === "brucia");
  const bruciaGratis = seValida((m) => m.tipo === "bruciaGratis");

  return (
    <div className="space-y-4">
      {v.finita ? (
        <Esito partita={partita} v={v} nick={nick} io={io} />
      ) : (
        <div className={`rounded-xl px-4 py-3 text-center font-semibold ${mioTurno ? "bg-blu text-white" : "bg-carta"}`}>
          {mioTurno ? `Tocca a te! Mosse rimaste: ${v.turno.mosseRimaste}` : `Tocca ${aPersona(nick(v.turno.giocatore))}…`}
          {mioTurno && suggerimento && <div className="text-xs font-normal">{suggerimento}</div>}
          {v.ultimoTurno !== null && <div className="text-xs font-normal">Ultimo giro: qualcuno ha raggiunto i punti per vincere</div>}
        </div>
      )}
      <Errore testo={errore} />

      <Riquadro titolo="Tavolo">
        <div className="flex items-start justify-center gap-3">
          <DorsoMazzo
            nome="Numeri"
            quante={v.mazzi.numeri}
            larghezza={80}
            onTocca={seValida((m) => m.tipo === "pescaNumero")}
            disabilitata={bloccato}
          />
          <DorsoMazzo
            nome="Personaggi"
            quante={v.mazzi.personaggi}
            larghezza={80}
            onTocca={seValida((m) => m.tipo === "pescaPersonaggio")}
            disabilitata={bloccato}
          />
          <div className="text-center text-xs text-tenue">
            <DorsoMazzo nome="Diamanti" quante={v.mazzi.diamanti} larghezza={64} />
            <div className="mt-1">solo dai poteri</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {v.tavolo.numeri.map((c, i) =>
            c ? (
              <CartaNumeroGrafica
                key={c.id}
                valore={c.valore}
                larghezza={64}
                onTocca={seValida((m) => m.tipo === "prendiNumero" && m.posizione === i)}
                disabilitata={bloccato}
              />
            ) : (
              <PostoVuoto key={`n${i}`} larghezza={64} />
            ),
          )}
        </div>
        {(brucia || bruciaGratis) && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {brucia && (
              <button type="button" disabled={bloccato} onClick={brucia} className="rounded-full border-2 border-rosso px-4 py-1.5 text-sm font-semibold text-rosso disabled:opacity-40">
                🔥 Brucia le 4 carte (costa 1)
              </button>
            )}
            {bruciaGratis && (
              <button type="button" disabled={bloccato} onClick={bruciaGratis} className="rounded-full border-2 border-blu px-4 py-1.5 text-sm font-semibold text-blu disabled:opacity-40">
                🪄 Brucia gratis
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {v.tavolo.personaggi.map((c, i) =>
            c ? (
              <CartaPersonaggioGrafica
                key={c.id}
                id={c.personaggio}
                larghezza={138}
                onTocca={seValida((m) => m.tipo === "prendiPersonaggio" && m.posizione === i)}
                onIngrandisci={ingrandisci(c)}
                disabilitata={bloccato}
              />
            ) : (
              <PostoVuoto key={`p${i}`} larghezza={138} />
            ),
          )}
        </div>

        {v.primoPersonaggio && (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-1 text-xs font-bold text-tenue">Prima carta del mazzo personaggi (Mago):</p>
            <CartaPersonaggioGrafica id={v.primoPersonaggio.personaggio} larghezza={120} compatta onIngrandisci={ingrandisci(v.primoPersonaggio)} />
          </div>
        )}
      </Riquadro>

      {v.manoAvversario && v.turno.attesa?.tipo === "fatina" && (
        <Riquadro titolo={`Mano di ${nick(v.turno.attesa.avversario)} (Fatina)`}>
          <div className="flex flex-wrap justify-center gap-2">
            {v.manoAvversario.map((c) => (
              <CartaNumeroGrafica
                key={c.id}
                valore={c.valore}
                larghezza={64}
                onTocca={seValida((m) => m.tipo === "prendiDaFatina" && m.carta === c.id)}
                disabilitata={bloccato}
              />
            ))}
          </div>
        </Riquadro>
      )}

      {gruppi.size > 0 && (
        <Riquadro titolo="Cosa vuoi fare?">
          <div className="space-y-4">
            {(Object.keys(TITOLI_GRUPPI) as GruppoElenco[]).map((g) =>
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

      <Riquadro titolo={`La tua mano (${v.mano.length}/${v.limiteMano})`}>
        <div className="flex flex-wrap gap-2">
          {v.mano.length === 0 && <span className="text-sm text-tenue">Nessuna carta</span>}
          {[...v.mano]
            .sort((a, b) => a.valore - b.valore)
            .map((c) => (
              <CartaNumeroGrafica
                key={c.id}
                valore={c.valore}
                larghezza={60}
                selezionata={daScartare.includes(c.id)}
                onTocca={scegliScarti ? alternaScarto(c.id) : undefined}
                disabilitata={bloccato}
              />
            ))}
        </div>
        <Diamanti diamanti={v.giocatori[io]?.diamanti ?? []} />
        {puoChiudere && (
          <div className="mt-4 space-y-2">
            {scegliScarti && (
              <p className="text-sm font-semibold text-rosso">
                Da scartare: {daScartare.length} di {eccesso}
              </p>
            )}
            <button
              type="button"
              disabled={bloccato || !scartiPronti}
              onClick={() => chiudiTurno(false)}
              className="w-full rounded-xl bg-inchiostro px-4 py-3 font-semibold text-carta disabled:opacity-40"
            >
              {eccesso > 0 ? `Scarta ${eccesso} e chiudi il turno` : "Chiudi il turno"}
            </button>
            {conScheletro && (
              <button
                type="button"
                disabled={bloccato || !scartiPronti}
                onClick={() => chiudiTurno(true)}
                className="w-full rounded-xl border-2 border-inchiostro px-4 py-3 font-semibold disabled:opacity-40"
              >
                💀 Chiudi il turno cambiando tutta la mano (Scheletro)
              </button>
            )}
          </div>
        )}
      </Riquadro>

      {v.ordine.map((id) => (
        <SchedaGiocatore
          key={id}
          nome={nick(id)}
          tu={id === io}
          diTurno={id === v.turno.giocatore && !v.finita}
          g={v.giocatori[id]!}
          postiMax={2}
          ingrandisci={ingrandisci}
          toccaPosto={(c) =>
            attesa?.tipo === "scartaPersonaggio"
              ? id === io
                ? seValida((m) => m.tipo === "scartaPersonaggio" && m.carta === c.id)
                : undefined
              : apriAttivazione(c)
          }
          disabilitata={bloccato}
        />
      ))}

      {cartaDaAttivare && mioTurno && (
        <PannelloAttivazione
          key={cartaDaAttivare.id}
          v={v}
          carta={cartaDaAttivare}
          proposte={proposteAttivazione(cartaDaAttivare.id)}
          nick={nick}
          bloccato={bloccato}
          onAttiva={(m) => {
            setDaAttivare(null);
            gioca(m);
          }}
          onChiudi={() => setDaAttivare(null)}
        />
      )}

      {ingrandita && (
        <div className="velo" onClick={() => setIngrandita(null)} role="dialog" aria-label="Carta ingrandita">
          <div className="flex flex-col items-center gap-3">
            <CartaPersonaggioGrafica id={ingrandita} larghezza={Math.min(320, window.innerWidth - 48)} />
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold">Tocca per chiudere</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SchedaGiocatore({
  nome,
  tu,
  diTurno,
  g,
  postiMax,
  ingrandisci,
  toccaPosto,
  disabilitata,
}: {
  nome: string;
  tu: boolean;
  diTurno: boolean;
  g: VistaGiocatore["giocatori"][string];
  postiMax: number;
  ingrandisci: (c: CartaPersonaggio) => () => void;
  toccaPosto: (c: CartaPersonaggio) => (() => void) | undefined;
  disabilitata: boolean;
}) {
  const larghezza = tu ? 138 : 112;
  return (
    <section className={`rounded-2xl border-2 bg-carta p-4 ${diTurno ? "border-blu" : "border-inchiostro/15"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-titolo text-lg font-bold">
          {tu ? "I tuoi personaggi" : nome}
        </h3>
        <span className="rounded-full bg-inchiostro px-3 py-1 text-sm font-bold text-carta">{g.punti} punti</span>
      </div>
      {!tu && <p className="text-xs text-tenue">Carte in mano: {g.carteInMano}</p>}
      {!tu && <Diamanti diamanti={g.diamanti} />}
      <p className="mt-2 mb-1 text-xs font-bold text-tenue">Nei posti</p>
      <div className="flex flex-wrap gap-3">
        {g.posti.map((c) => (
          <CartaPersonaggioGrafica
            key={c.id}
            id={c.personaggio}
            larghezza={larghezza}
            compatta={!tu}
            onTocca={toccaPosto(c)}
            onIngrandisci={ingrandisci(c)}
            disabilitata={disabilitata}
          />
        ))}
        {Array.from({ length: Math.max(0, postiMax - g.posti.length) }, (_, i) => (
          <PostoVuoto key={i} larghezza={larghezza} />
        ))}
      </div>
      {g.attivati.length > 0 && (
        <>
          <p className="mt-3 mb-1 text-xs font-bold text-tenue">Attivati ({g.attivati.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {g.attivati.map((c) => (
              <CartaPersonaggioGrafica key={c.id} id={c.personaggio} larghezza={64} compatta onIngrandisci={ingrandisci(c)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Diamanti({ diamanti }: { diamanti: CartaDiamante[] }) {
  if (diamanti.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center text-sm">
      <span className="mr-1">Diamanti:</span>
      {diamanti.map((d) => (
        <Diamante key={d.id} d={d} />
      ))}
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
