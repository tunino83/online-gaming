/**
 * Schermata di gioco del primo gioco.
 * - In alto (fisso): di chi è il turno, suoni e, in 2 giocatori, le carte dell'avversario.
 * - Al centro: il tavolo (mazzi coperti accanto alle carte scoperte), azioni gratuite, ultime mosse.
 * - In basso (fisso): i propri posti, la propria mano, i diamanti e la chiusura del turno.
 * Si tocca una carta per prenderla, un mazzo per pescare, un proprio personaggio per attivarlo.
 * Le mosse possibili le calcola sempre il server.
 */
import type { CartaDiamante, CartaPersonaggio, Evento, Mossa, VistaGiocatore } from "@og/primo-gioco";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { impostaSuoni, suonoMossa, suonoTuoTurno, useSuoniAttivi } from "../../lib/suoni";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { Caricamento, Errore, Riquadro } from "../../ui";
import { PannelloAttivazione } from "./Attivazione";
import { CartaNumeroGrafica, CartaPersonaggioGrafica, Diamante, DorsoMazzo, PostoVuoto } from "./carte";
import { aPersona, descriviEvento, descriviMossa, gruppoMossa, raccogliCarte } from "./descrivi";
import { type CartaDaMostrare, PrimoPiano } from "./PrimoPiano";

/** Altezza (in pixel) di un elemento, aggiornata quando cambia: serve a non far finire il tavolo sotto le barre fisse. */
function useAltezza(ref: RefObject<HTMLElement>): number {
  const [altezza, setAltezza] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const osserva = new ResizeObserver(() => setAltezza(el.offsetHeight));
    osserva.observe(el);
    setAltezza(el.offsetHeight);
    return () => osserva.disconnect();
  });
  return altezza;
}

/** Eventi da mostrare in "Ultime mosse": si salta il semplice "ha chiuso il turno". */
const significativo = (e: Evento) => !(e.tipo === "fineTurno" && e.scartate === 0 && !e.cambiaMano);

export function TavoloPrimoGioco({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  // Dopo una mossa riuscita i comandi restano spenti finché non arriva la situazione aggiornata
  // (versione più nuova di questa), così non si può toccare una mossa ormai vecchia.
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [primoPiano, setPrimoPiano] = useState<{ carta: CartaDaMostrare; titolo?: string } | null>(null);
  // Carte della mano scelte per lo scarto di fine turno (si azzerano a ogni aggiornamento)
  const [daScartare, setDaScartare] = useState<string[]>([]);
  // Personaggio (id carta) di cui è aperto il pannello di attivazione
  const [daAttivare, setDaAttivare] = useState<string | null>(null);
  const [registroAperto, setRegistroAperto] = useState(false);
  const versione = riga?.versione;
  useEffect(() => setDaScartare([]), [versione]);

  // Pesca in corso: quali carte avevo prima, per mostrare quella nuova appena arriva la vista aggiornata
  const pescaInCorso = useRef<{ tipo: "numero" | "personaggio"; versione: number; prima: Set<string> } | null>(null);
  useEffect(() => {
    const pesca = pescaInCorso.current;
    if (!riga || !pesca || riga.versione <= pesca.versione) return;
    pescaInCorso.current = null;
    if (pesca.tipo === "numero") {
      const nuova = riga.vista.mano.find((c) => !pesca.prima.has(c.id));
      if (nuova) setPrimoPiano({ carta: { tipo: "numero", valore: nuova.valore }, titolo: "Hai pescato" });
    } else {
      const nuova = riga.vista.giocatori[io]?.posti.find((c) => !pesca.prima.has(c.id));
      if (nuova) setPrimoPiano({ carta: { tipo: "personaggio", id: nuova.personaggio }, titolo: "Hai pescato" });
    }
  }, [riga, io]);

  // Suoni: "tic" a ogni mossa, melodia quando diventa il mio turno
  const suoni = useSuoniAttivi();
  const precedente = useRef<{ versione: number; turnoDi: string } | null>(null);
  useEffect(() => {
    if (!riga) return;
    const ora = { versione: riga.versione, turnoDi: riga.vista.turno.giocatore };
    const prima = precedente.current;
    precedente.current = ora;
    if (!prima || ora.versione <= prima.versione) return; // primo caricamento o nulla di nuovo
    if (ora.turnoDi === io && prima.turnoDi !== io && !riga.vista.finita) suonoTuoTurno();
    else suonoMossa();
  }, [riga, io]);

  const barraAlta = useRef<HTMLDivElement>(null);
  const barraBassa = useRef<HTMLDivElement>(null);
  const altezzaAlta = useAltezza(barraAlta);
  const altezzaBassa = useAltezza(barraBassa);

  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => m.get(id) ?? "?";
  }, [giocatori]);

  if (erroreLettura) return <Errore testo={erroreLettura} />;
  if (!riga) return <Caricamento testo="Preparo il tavolo…" />;

  // Le viste salvate prima dell'arrivo del registro non lo contengono
  const v: VistaGiocatore = { ...riga.vista, registro: riga.vista.registro ?? [] };
  const carte = raccogliCarte(v);
  const mioTurno = v.turno.giocatore === io && !v.finita;
  const bloccato = invio || (aspettoOltre !== null && riga.versione <= aspettoOltre);
  const mosse = mioTurno ? riga.mosse_valide : [];
  const avversari = v.ordine.filter((id) => id !== io);
  const inDue = avversari.length === 1;

  async function gioca(mossa: Mossa) {
    if (bloccato) return;
    setInvio(true);
    setErrore(null);
    setAspettoOltre(riga!.versione);
    if (mossa.tipo === "pescaNumero" || mossa.tipo === "pescaPersonaggio") {
      const numero = mossa.tipo === "pescaNumero";
      const prima = numero ? riga!.vista.mano : (riga!.vista.giocatori[io]?.posti ?? []);
      pescaInCorso.current = { tipo: numero ? "numero" : "personaggio", versione: riga!.versione, prima: new Set(prima.map((c) => c.id)) };
    }
    const r = await chiediArbitro({ azione: "mossa", partitaId: partita.id, mossa });
    setInvio(false);
    if (r.ok) {
      ricarica(); // non aspettiamo solo il tempo reale: rileggiamo subito
    } else {
      setAspettoOltre(null);
      pescaInCorso.current = null;
      setErrore(r.errore);
    }
  }

  /** Funzione da chiamare toccando qualcosa, se quella mossa è possibile ora. */
  const seValida = (cerca: (m: Mossa) => boolean) => {
    const m = mosse.find(cerca);
    return m ? () => gioca(m) : undefined;
  };
  const ingrandisci = (c: CartaPersonaggio) => () => setPrimoPiano({ carta: { tipo: "personaggio", id: c.personaggio } });

  // Azioni gratuite (fulmine, Biancaneve, Cappellaio): l'unico elenco di pulsanti rimasto
  const gratuite = mosse.filter((m) => gruppoMossa(m) === "gratis");

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
  const cartaDaAttivare = daAttivare
    ? Object.values(v.giocatori)
        .flatMap((g) => g.posti)
        .find((c) => c.id === daAttivare)
    : undefined;

  const attesa = mioTurno ? v.turno.attesa : null;
  // Solo i suggerimenti davvero utili (niente testo fisso che occupa spazio)
  const suggerimento =
    attesa?.tipo === "scartaPersonaggio"
      ? "Hai 3 personaggi: tocca in basso quello da scartare (non il nuovo)"
      : attesa?.tipo === "fatina"
        ? "Tocca la carta che vuoi prendere"
        : scegliScarti
          ? `Troppe carte: tocca in basso le ${eccesso} da scartare`
          : mioTurno && v.turno.mosseRimaste === 0 && puoChiudere
            ? "Mosse finite: usa le azioni rimaste o chiudi il turno"
            : null;
  const brucia = seValida((m) => m.tipo === "brucia");
  const bruciaGratis = seValida((m) => m.tipo === "bruciaGratis");
  const toccaPostoAltrui = (c: CartaPersonaggio) => apriAttivazione(c); // Lucciola di un vicino

  // Ultime mosse: chiuse = le ultime 3; aperte = le ultime 3 di ogni giocatore
  const eventi = v.registro.filter(significativo);
  const ultime = [...eventi].reverse().slice(0, 3);

  return (
    <>
      {/* ---------------- barra in alto ---------------- */}
      <div ref={barraAlta} className="fixed inset-x-0 top-0 z-30 border-b-4 border-blu bg-carta/95 shadow-[0_4px_14px_rgba(0,0,0,0.15)] backdrop-blur">
        <div className="mx-auto max-w-md px-3 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={`min-w-0 flex-1 truncate rounded-full px-3 py-1 text-sm font-bold ${
                v.finita ? "bg-oro text-white" : mioTurno ? "bg-blu text-white" : "bg-white"
              }`}
            >
              {v.finita
                ? "Partita finita"
                : mioTurno
                  ? `Tocca a te · ${v.turno.mosseRimaste} ${v.turno.mosseRimaste === 1 ? "mossa" : "mosse"}`
                  : `Tocca ${aPersona(nick(v.turno.giocatore))}…`}
            </div>
            {v.ultimoTurno !== null && !v.finita && <span className="rounded-full bg-rosso px-2 py-1 text-xs font-bold text-white">Ultimo giro</span>}
            <button
              type="button"
              onClick={() => impostaSuoni(!suoni)}
              className="rounded-full bg-white px-2.5 py-1 text-sm"
              aria-label={suoni ? "Spegni i suoni" : "Accendi i suoni"}
            >
              {suoni ? "🔊" : "🔇"}
            </button>
          </div>
          {suggerimento && <p className="mt-1 text-xs font-semibold text-blu">{suggerimento}</p>}
          {inDue && (
            <Avversario
              nome={nick(avversari[0]!)}
              g={v.giocatori[avversari[0]!]!}
              diTurno={v.turno.giocatore === avversari[0] && !v.finita}
              toccaPosto={toccaPostoAltrui}
              ingrandisci={ingrandisci}
              bloccato={bloccato}
            />
          )}
        </div>
      </div>

      {/* ---------------- centro ---------------- */}
      <div className="space-y-3" style={{ paddingTop: altezzaAlta + 12, paddingBottom: altezzaBassa + 16 }}>
        <Errore testo={errore} />
        {v.finita && <Esito partita={partita} v={v} nick={nick} io={io} />}

        <section className="rounded-2xl border-4 border-blu bg-carta p-3 shadow-sm">
          {/* mazzo numeri + 4 carte numero */}
          <div className="flex items-end justify-center gap-1.5">
            <DorsoMazzo
              nome="Numeri"
              quante={v.mazzi.numeri}
              larghezza={54}
              onTocca={seValida((m) => m.tipo === "pescaNumero")}
              disabilitata={bloccato}
            />
            <span className="mx-0.5 self-stretch border-l-2 border-dashed border-inchiostro/15" />
            {v.tavolo.numeri.map((c, i) =>
              c ? (
                <CartaNumeroGrafica
                  key={c.id}
                  valore={c.valore}
                  larghezza={52}
                  onTocca={seValida((m) => m.tipo === "prendiNumero" && m.posizione === i)}
                  disabilitata={bloccato}
                />
              ) : (
                <PostoVuoto key={`n${i}`} larghezza={52} />
              ),
            )}
          </div>
          {(brucia || bruciaGratis) && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {brucia && (
                <button type="button" disabled={bloccato} onClick={brucia} className="rounded-full border-2 border-rosso px-3 py-1 text-xs font-semibold text-rosso disabled:opacity-40">
                  🔥 Brucia le 4 carte (costa 1)
                </button>
              )}
              {bruciaGratis && (
                <button type="button" disabled={bloccato} onClick={bruciaGratis} className="rounded-full border-2 border-blu px-3 py-1 text-xs font-semibold text-blu disabled:opacity-40">
                  🪄 Brucia gratis
                </button>
              )}
            </div>
          )}

          {/* mazzo personaggi + 2 personaggi scoperti */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <DorsoMazzo
              nome="Personaggi"
              quante={v.mazzi.personaggi}
              larghezza={54}
              onTocca={seValida((m) => m.tipo === "pescaPersonaggio")}
              disabilitata={bloccato}
            />
            <span className="mx-0.5 self-stretch border-l-2 border-dashed border-inchiostro/15" />
            {v.tavolo.personaggi.map((c, i) =>
              c ? (
                <CartaPersonaggioGrafica
                  key={c.id}
                  id={c.personaggio}
                  larghezza={112}
                  onTocca={seValida((m) => m.tipo === "prendiPersonaggio" && m.posizione === i)}
                  onIngrandisci={ingrandisci(c)}
                  disabilitata={bloccato}
                />
              ) : (
                <PostoVuoto key={`p${i}`} larghezza={112} />
              ),
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-tenue">Diamanti nel mazzo: {v.mazzi.diamanti} (arrivano solo dai poteri)</p>

          {v.primoPersonaggio && (
            <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-white p-2">
              <span className="text-xs font-bold text-tenue">🔮 Il Mago vede in cima al mazzo:</span>
              <CartaPersonaggioGrafica id={v.primoPersonaggio.personaggio} larghezza={64} compatta onIngrandisci={ingrandisci(v.primoPersonaggio)} />
            </div>
          )}
        </section>

        {v.manoAvversario && v.turno.attesa?.tipo === "fatina" && (
          <Riquadro titolo={`Mano di ${nick(v.turno.attesa.avversario)} (Fatina)`}>
            <div className="flex flex-wrap justify-center gap-2">
              {v.manoAvversario.map((c) => (
                <CartaNumeroGrafica
                  key={c.id}
                  valore={c.valore}
                  larghezza={60}
                  onTocca={seValida((m) => m.tipo === "prendiDaFatina" && m.carta === c.id)}
                  disabilitata={bloccato}
                />
              ))}
            </div>
          </Riquadro>
        )}

        {gratuite.length > 0 && (
          <section className="rounded-2xl border-2 border-blu bg-carta p-3">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">Azioni gratuite</h3>
            <div className="space-y-1.5">
              {gratuite.map((m) => (
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
          </section>
        )}

        <section className="rounded-2xl border-2 border-inchiostro/15 bg-carta p-3">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">Ultime mosse</h3>
          {eventi.length === 0 && <p className="text-sm text-tenue">Ancora nessuna mossa.</p>}
          {!registroAperto ? (
            <ol className="space-y-0.5 text-sm">
              {ultime.map((e, i) => (
                <li key={e.n} className={i === 0 ? "font-semibold" : "text-tenue"}>
                  {descriviEvento(e, nick, io)}
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-2">
              {v.ordine.map((id) => {
                const suoi = [...eventi].reverse().filter((e) => e.giocatore === id).slice(0, 3);
                return (
                  <div key={id}>
                    <p className="text-xs font-bold">{id === io ? "Tu" : nick(id)}</p>
                    {suoi.length === 0 ? (
                      <p className="text-sm text-tenue">Nessuna mossa recente</p>
                    ) : (
                      <ol className="space-y-0.5 text-sm">
                        {suoi.map((e) => (
                          <li key={e.n}>{descriviEvento(e, nick, io)}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {eventi.length > 3 && (
            <button type="button" onClick={() => setRegistroAperto((x) => !x)} className="mt-1 text-sm font-semibold text-blu underline">
              {registroAperto ? "Mostra meno" : "Le ultime 3 di ogni giocatore"}
            </button>
          )}
        </section>

        {/* con più di 2 giocatori gli avversari stanno qui */}
        {!inDue &&
          avversari.map((id) => (
            <section key={id} className={`rounded-2xl border-2 bg-carta p-3 ${id === v.turno.giocatore && !v.finita ? "border-blu" : "border-inchiostro/15"}`}>
              <Avversario
                nome={nick(id)}
                g={v.giocatori[id]!}
                diTurno={false}
                toccaPosto={toccaPostoAltrui}
                ingrandisci={ingrandisci}
                bloccato={bloccato}
                largo
              />
            </section>
          ))}

        <Attivati v={v} io={io} nick={nick} ingrandisci={ingrandisci} />
      </div>

      {/* ---------------- barra in basso ---------------- */}
      <BarraMieCarte
        rif={barraBassa}
        v={v}
        io={io}
        daScartare={daScartare}
        scegliScarti={scegliScarti}
        alternaScarto={alternaScarto}
        eccesso={eccesso}
        puoChiudere={puoChiudere}
        conScheletro={conScheletro}
        scartiPronti={scartiPronti}
        chiudiTurno={chiudiTurno}
        bloccato={bloccato}
        toccaPosto={(c) =>
          attesa?.tipo === "scartaPersonaggio"
            ? seValida((m) => m.tipo === "scartaPersonaggio" && m.carta === c.id)
            : apriAttivazione(c)
        }
        ingrandisci={ingrandisci}
      />

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

      {primoPiano && <PrimoPiano carta={primoPiano.carta} titolo={primoPiano.titolo} onChiudi={() => setPrimoPiano(null)} />}
    </>
  );
}

/** Un avversario: nome, punti, carte in mano (coperte), diamanti e personaggi nei posti. */
function Avversario({
  nome,
  g,
  diTurno,
  toccaPosto,
  ingrandisci,
  bloccato,
  largo,
}: {
  nome: string;
  g: VistaGiocatore["giocatori"][string];
  diTurno: boolean;
  toccaPosto: (c: CartaPersonaggio) => (() => void) | undefined;
  ingrandisci: (c: CartaPersonaggio) => () => void;
  bloccato: boolean;
  largo?: boolean;
}) {
  const larghezza = largo ? 80 : 46;
  return (
    <div className={`${largo ? "" : "mt-2 rounded-xl bg-white/70 p-2"} ${diTurno ? "ring-2 ring-blu" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-titolo font-bold">{nome}</span>
        <span className="shrink-0 rounded-full bg-inchiostro px-2 py-0.5 text-xs font-bold text-carta">{g.punti} punti</span>
      </div>
      <div className="mt-1 flex items-end gap-3">
        <div className="flex gap-1">
          {g.posti.map((c) => (
            <CartaPersonaggioGrafica
              key={c.id}
              id={c.personaggio}
              larghezza={larghezza}
              compatta
              onTocca={toccaPosto(c)}
              onIngrandisci={ingrandisci(c)}
              disabilitata={bloccato}
            />
          ))}
          {Array.from({ length: Math.max(0, 2 - g.posti.length) }, (_, i) => (
            <PostoVuoto key={i} larghezza={larghezza} />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="inline-flex">
              {Array.from({ length: Math.min(g.carteInMano, 8) }, (_, i) => (
                <span key={i} className="-ml-2 first:ml-0 inline-block h-7 w-5 rounded-sm border border-[#b8892b] bg-gradient-to-br from-[#1f4f8f] to-[#14213d] shadow-sm" />
              ))}
            </span>
            <span className="font-semibold">{g.carteInMano} in mano</span>
          </div>
          {g.diamanti.length > 0 && <Diamanti diamanti={g.diamanti} />}
          {g.attivati.length > 0 && <span className="text-tenue">{g.attivati.length} attivati (sotto)</span>}
        </div>
      </div>
    </div>
  );
}

/** Personaggi attivati di tutti: servono a ricordare i poteri in gioco. */
function Attivati({
  v,
  io,
  nick,
  ingrandisci,
}: {
  v: VistaGiocatore;
  io: string;
  nick: (id: string) => string;
  ingrandisci: (c: CartaPersonaggio) => () => void;
}) {
  const conAttivati = v.ordine.filter((id) => v.giocatori[id]!.attivati.length > 0);
  if (conAttivati.length === 0) return null;
  return (
    <section className="rounded-2xl border-2 border-inchiostro/15 bg-carta p-3">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">Personaggi attivati</h3>
      <div className="space-y-2">
        {conAttivati.map((id) => (
          <div key={id}>
            <p className="text-xs font-bold">
              {id === io ? "I tuoi" : nick(id)} · {v.giocatori[id]!.punti} punti
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {v.giocatori[id]!.attivati.map((c) => (
                <CartaPersonaggioGrafica key={c.id} id={c.personaggio} larghezza={56} compatta onIngrandisci={ingrandisci(c)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Diamanti({ diamanti }: { diamanti: CartaDiamante[] }) {
  if (diamanti.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center">
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

/** Barra fissa in basso: i miei personaggi nei posti, la mia mano, i diamanti e la fine del turno. */
function BarraMieCarte({
  rif,
  v,
  io,
  daScartare,
  scegliScarti,
  alternaScarto,
  eccesso,
  puoChiudere,
  conScheletro,
  scartiPronti,
  chiudiTurno,
  bloccato,
  toccaPosto,
  ingrandisci,
}: {
  rif: RefObject<HTMLDivElement>;
  v: VistaGiocatore;
  io: string;
  daScartare: string[];
  scegliScarti: boolean;
  alternaScarto: (id: string) => () => void;
  eccesso: number;
  puoChiudere: boolean;
  conScheletro: boolean;
  scartiPronti: boolean;
  chiudiTurno: (cambiaMano: boolean) => void;
  bloccato: boolean;
  toccaPosto: (c: CartaPersonaggio) => (() => void) | undefined;
  ingrandisci: (c: CartaPersonaggio) => () => void;
}) {
  const mio = v.giocatori[io]!;
  return (
    <div ref={rif} className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-blu bg-carta/95 shadow-[0_-6px_18px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="mx-auto max-w-md px-3 pt-1 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between text-xs font-semibold text-tenue">
          <span>
            Tu · Mano {v.mano.length}/{v.limiteMano}
          </span>
          <span className="rounded-full bg-inchiostro px-2 py-0.5 text-carta">{mio.punti} punti</span>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex shrink-0 gap-1.5 pt-2">
            {mio.posti.map((c) => (
              <CartaPersonaggioGrafica
                key={c.id}
                id={c.personaggio}
                larghezza={56}
                compatta
                onTocca={toccaPosto(c)}
                onIngrandisci={ingrandisci(c)}
                disabilitata={bloccato}
              />
            ))}
            {Array.from({ length: Math.max(0, 2 - mio.posti.length) }, (_, i) => (
              <PostoVuoto key={i} larghezza={56} />
            ))}
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex gap-1.5 pt-4 pb-1 pr-2">
              {v.mano.length === 0 && <span className="py-6 text-xs text-tenue">Nessuna carta in mano</span>}
              {[...v.mano]
                .sort((a, b) => a.valore - b.valore)
                .map((c) => (
                  <CartaNumeroGrafica
                    key={c.id}
                    valore={c.valore}
                    larghezza={50}
                    selezionata={daScartare.includes(c.id)}
                    onTocca={scegliScarti ? alternaScarto(c.id) : undefined}
                    disabilitata={bloccato}
                  />
                ))}
            </div>
          </div>
        </div>
        {mio.diamanti.length > 0 && (
          <div className="text-xs">
            <Diamanti diamanti={mio.diamanti} />
          </div>
        )}
        {puoChiudere && (
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              disabled={bloccato || !scartiPronti}
              onClick={() => chiudiTurno(false)}
              className="flex-1 rounded-xl bg-inchiostro px-3 py-2.5 text-sm font-semibold text-carta disabled:opacity-40"
            >
              {eccesso > 0 ? `Scarta ${eccesso} (${daScartare.length}/${eccesso}) e chiudi` : "Chiudi il turno"}
            </button>
            {conScheletro && (
              <button
                type="button"
                disabled={bloccato || !scartiPronti}
                onClick={() => chiudiTurno(true)}
                className="rounded-xl border-2 border-inchiostro px-3 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                💀 Chiudi e cambia mano
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
