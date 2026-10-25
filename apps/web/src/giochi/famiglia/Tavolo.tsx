/**
 * Tavolo della Famiglia (prima versione, per le prove): tavolo, giocatori, le proprie carte,
 * le mosse possibili e le finestre per le scelte (difesa, scarti, carte da scegliere…).
 * Il browser non conosce le regole: mostra le mosse valide che gli manda l'arbitro e descrive ciascuna.
 */
import { type Attivato, type CopiaCarta, type Mossa, type VistaGiocatore, carta, evento } from "@og/famiglia";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CerchioAvatar } from "../../Avatar";
import { suonoTuoTurno } from "../../lib/suoni";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { Caricamento, Errore, Pulsante } from "../../ui";
import { CartaFamiglia, CartaNumeroGrafica, Mancia, SchedaCarta } from "./carte";
import { cartaDiCopia, descriviFatto, descriviMossa, nomeCarta, nomePotere } from "./descrivi";
import { GuidaFamiglia } from "./Guida";
import { type Avviso, avvisoTraViste } from "./avvisi";

/** Pausa prima della mossa di un giocatore del computer. */
const PAUSA_COMPUTER_MS = 2500;
/** Prima domanda all'arbitro sul computer al posto di chi è fermo (o sul tempo per difendersi). */
const PRIMA_DOMANDA_MS = 1500;
const RIPROVA_MS = 4000;

type Scheda = { titolo: string; idCarta?: string; stanca?: number; mosse: Mossa[] } | null;

export function TavoloFamiglia({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [scheda, setScheda] = useState<Scheda>(null);
  const [tutteLeMosse, setTutteLeMosse] = useState(false);
  const [guida, setGuida] = useState(false);
  const [registroAperto, setRegistroAperto] = useState(false);
  const [scelte, setScelte] = useState<string[]>([]);
  const [selezioneScarti, setSelezioneScarti] = useState(false);
  const [osservato, setOsservato] = useState<string | null>(null);
  const [fumetto, setFumetto] = useState<{ testo: string; chiave: number } | null>(null);

  const versione = riga?.versione;
  useEffect(() => {
    setScelte([]);
    setScheda(null);
    setTutteLeMosse(false);
    setSelezioneScarti(false);
  }, [versione]);

  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => (id === io ? "tu" : (m.get(id) ?? "?"));
  }, [giocatori, io]);
  const avatarDi = useMemo(() => new Map(giocatori.map((g) => [g.utente_id, g.avatar])), [giocatori]);
  const bot = useMemo(() => new Set(giocatori.filter((g) => g.bot).map((g) => g.utente_id)), [giocatori]);

  // Avvisi bloccanti per ciò che ti riguarda (attacchi, carte perse o ricevute, eventi…): restano finché non tocchi OK.
  // Se ne arrivano altri mentre uno è aperto, si aggiungono allo stesso avviso.
  const [avviso, setAvviso] = useState<Avviso | null>(null);
  const vistaPrima = useRef<VistaGiocatore | null>(null);
  useEffect(() => {
    if (!riga) return;
    const prima = vistaPrima.current;
    vistaPrima.current = riga.vista;
    if (!prima) return; // primo caricamento: niente avvisi per il passato
    const nuovo = avvisoTraViste(prima, riga.vista, io, nick);
    if (!nuovo) return;
    setAvviso((vecchio) => (vecchio ? { n: nuovo.n, titolo: vecchio.titolo, righe: [...vecchio.righe, "—", nuovo.titolo, ...nuovo.righe] } : nuovo));
  }, [riga, io, nick]);

  // Fumetto con l'ultima cosa fatta dagli altri
  const ultimoFatto = useRef<number | null>(null);
  useEffect(() => {
    if (!riga) return;
    const registro = riga.vista.registro;
    const ultimo = registro.at(-1)?.n ?? 0;
    if (ultimoFatto.current === null) {
      ultimoFatto.current = ultimo;
      return;
    }
    const nuovi = registro.filter((f) => f.n > ultimoFatto.current!);
    ultimoFatto.current = Math.max(ultimoFatto.current, ultimo);
    const altrui = [...nuovi].reverse().find((f) => f.giocatore !== io && f.tipo !== "fineTurno");
    if (altrui) setFumetto({ testo: descriviFatto(altrui, nick, io), chiave: altrui.n });
  }, [riga, io, nick]);
  useEffect(() => {
    if (!fumetto) return;
    const t = setTimeout(() => setFumetto(null), 4000);
    return () => clearTimeout(t);
  }, [fumetto]);

  // "Tocca a te!"
  const diTurno = riga ? (riga.vista.turno.sceglie ?? riga.vista.turno.giocatore) : null;
  const precedente = useRef<string | null>(null);
  useEffect(() => {
    if (!riga || riga.vista.finita) return;
    if (diTurno === io && precedente.current !== io && precedente.current !== null) suonoTuoTurno();
    precedente.current = diTurno;
  }, [diTurno, riga, io]);

  // Giocatori del computer: una mossa ogni pochi secondi
  const [tentativoBot, setTentativoBot] = useState(0);
  const turnoDelComputer = !!riga && !riga.vista.finita && !!diTurno && bot.has(diTurno);
  useEffect(() => {
    if (!turnoDelComputer) return;
    let annullato = false;
    const t = setTimeout(async () => {
      const r = await chiediArbitro({ azione: "turnoComputer", partitaId: partita.id });
      if (annullato) return;
      if (r.ok) ricarica();
      else setTentativoBot((n) => n + 1);
    }, PAUSA_COMPUTER_MS);
    return () => {
      annullato = true;
      clearTimeout(t);
    };
  }, [turnoDelComputer, versione, tentativoBot, partita.id, ricarica]);

  // Tempo per difendersi (e computer al posto di chi è fermo, se la partita lo prevede): i tempi li conosce l'arbitro
  const difesaInCorso = !!riga?.vista.attacco && !!riga.vista.turno.sceglie;
  const chiediTempo = !!riga && !riga.vista.finita && !turnoDelComputer && (partita.opzioni.computerAlPosto !== false || difesaInCorso);
  const [scadenza, setScadenza] = useState<{ quando: number; difesa: boolean } | null>(null);
  useEffect(() => {
    setScadenza(null);
    if (!chiediTempo) return;
    let annullato = false;
    let t: ReturnType<typeof setTimeout>;
    const chiedi = async () => {
      const r = await chiediArbitro({ azione: "alPosto", partitaId: partita.id });
      if (annullato) return;
      if (!r.ok) {
        t = setTimeout(chiedi, RIPROVA_MS);
        return;
      }
      const attendi = typeof r.attendiMs === "number" ? r.attendiMs : RIPROVA_MS;
      setScadenza({ quando: Date.now() + attendi, difesa: difesaInCorso });
      if (r.fatto) ricarica();
      else t = setTimeout(chiedi, attendi + 300);
    };
    t = setTimeout(chiedi, PRIMA_DOMANDA_MS);
    return () => {
      annullato = true;
      clearTimeout(t);
    };
  }, [chiediTempo, difesaInCorso, diTurno, versione, partita.id, ricarica]);
  const [adesso, setAdesso] = useState(Date.now());
  useEffect(() => {
    if (!scadenza) return;
    const i = setInterval(() => setAdesso(Date.now()), 1000);
    return () => clearInterval(i);
  }, [scadenza]);
  const secondiRimasti = scadenza ? Math.max(0, Math.ceil((scadenza.quando - adesso) / 1000)) : null;

  if (erroreLettura) return <Errore testo={erroreLettura} />;
  if (!riga) return <Caricamento testo="Preparo il tavolo…" />;

  const v = riga.vista;
  const bloccato = invio || (aspettoOltre !== null && riga.versione <= aspettoOltre);
  const mosse: Mossa[] = diTurno === io && !v.finita ? riga.mosse_valide : [];
  const mioTurno = v.turno.giocatore === io && !v.finita;
  const me = v.giocatori[io]!;
  const altri = [...v.ordine.slice(v.ordine.indexOf(io) + 1), ...v.ordine.slice(0, v.ordine.indexOf(io))];
  const mostrato = osservato && altri.includes(osservato) ? osservato : (altri.find((x) => x === diTurno) ?? altri[0]!);

  async function gioca(mossa: Mossa) {
    if (bloccato) return;
    setInvio(true);
    setErrore(null);
    setScheda(null);
    setTutteLeMosse(false);
    setAspettoOltre(riga!.versione);
    const r = await chiediArbitro({ azione: "mossa", partitaId: partita.id, mossa });
    setInvio(false);
    if (r.ok) ricarica();
    else {
      setAspettoOltre(null);
      setErrore(r.errore);
    }
  }

  /** Mosse che riguardano una carta (per la scheda che si apre toccandola). */
  const mosseDiCarta = (idCopia: string) => mosse.filter((m) => "carta" in m && m.carta === idCopia && m.tipo !== "scartaCarta");
  const apriCarta = (idCopia: string, stanca?: number, altre: Mossa[] = []) =>
    setScheda({ titolo: nomeCarta(cartaDiCopia(idCopia)), idCarta: cartaDiCopia(idCopia), stanca, mosse: [...altre, ...mosseDiCarta(idCopia)] });
  const trova = (cerca: (m: Mossa) => boolean) => mosse.find(cerca);

  const attesa = v.turno.attesa;
  const fineTurno = mosse.filter((m): m is Extract<Mossa, { tipo: "fineTurno" }> => m.tipo === "fineTurno");
  const daScartare = fineTurno[0]?.scarta.length ?? 0;
  const caffe = trova((m) => m.tipo === "caffe");
  const finito = v.finita;

  return (
    <div className="space-y-3 pb-28 pt-2 text-luce">
      {/* stato della partita */}
      <BarraStato v={v} io={io} nick={nick} secondi={secondiRimasti} difesa={!!scadenza?.difesa} />
      {v.evento && <Evento id={v.evento.id} turni={v.evento.turniRimasti} />}
      <Protezioni v={v} nick={nick} />

      {/* giocatori */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {v.ordine.map((id) => (
          <SchedaGiocatore
            key={id}
            nome={id === io ? "Tu" : nick(id)}
            avatar={avatarDi.get(id)}
            g={v.giocatori[id]!}
            diTurno={v.turno.giocatore === id}
            sceglie={v.turno.sceglie === id}
            selezionato={id === mostrato}
            onClick={id === io ? undefined : () => setOsservato(id)}
          />
        ))}
      </div>

      {/* l'avversario osservato */}
      {mostrato && (
        <Zona titolo={`Carte di ${nick(mostrato)}`}>
          <AreaGiocatore
            v={v}
            id={mostrato}
            io={io}
            onCarta={(c, stanca) => apriCarta(c.id, stanca)}
          />
        </Zona>
      )}

      {/* tavolo */}
      <div className="panno rounded-2xl p-3">
        <div className="flex flex-wrap items-end justify-center gap-2">
          {v.tavolo.numeri.map((c, i) =>
            c ? (
              <CartaNumeroGrafica
                key={c.id}
                c={c}
                onClick={trova((m) => m.tipo === "prendiNumero" && m.posizione === i) ? () => gioca({ tipo: "prendiNumero", posizione: i }) : undefined}
              />
            ) : (
              <div key={`vuoto-${i}`} className="h-16 w-12 rounded-lg border-2 border-dashed border-white/20" />
            ),
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-center gap-2">
          {v.tavolo.personaggi.map((c, i) =>
            c ? (
              <CartaFamiglia
                key={c.id}
                idCarta={c.carta}
                onClick={() => apriCarta(c.id, undefined, mosse.filter((m) => m.tipo === "prendiPersonaggio" && m.posizione === i))}
              />
            ) : (
              <div key={`vuotop-${i}`} className="h-[123px] w-[88px] rounded-lg border-2 border-dashed border-white/20" />
            ),
          )}
          <div className="flex flex-col gap-1.5">
            <Mazzo testo="🃏 Numeri" quante={v.mazzi.numeri} onClick={azione(trova((m) => m.tipo === "pescaNumero"))} />
            <Mazzo testo="👨‍👩‍👧 Personaggi" quante={v.mazzi.personaggi} onClick={azione(trova((m) => m.tipo === "pescaPersonaggio"))} />
            <Mazzo testo="🎉 Eventi" quante={v.eventiNelMazzo} onClick={azione(trova((m) => m.tipo === "pescaEvento"))} />
            <Mazzo testo="🔥 Brucia" onClick={azione(trova((m) => m.tipo === "brucia"))} />
          </div>
        </div>
        {v.cimaPersonaggi && v.cimaPersonaggi.length > 0 && (
          <div className="mt-3 text-center">
            <p className="mb-1 text-xs text-white/70">👀 Ne ho viste tante: le prime carte del mazzo personaggi</p>
            <div className="flex justify-center gap-2">
              {v.cimaPersonaggi.map((c, i) => (
                <CartaFamiglia
                  key={c.id}
                  idCarta={c.carta}
                  dimensione="piccola"
                  onClick={() =>
                    apriCarta(
                      c.id,
                      undefined,
                      mosse.filter((m) => m.tipo === "pescaPersonaggio" && !!m.seconda === (i === 1)),
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}
        {v.scartiNumeri.length > 0 && <p className="mt-2 text-center text-xs text-white/60">Scarti numeri: ultima carta {v.scartiNumeri.at(-1)!.valore}</p>}
      </div>

      {/* le mie carte */}
      <Zona titolo="Le tue carte">
        <AreaGiocatore
          v={v}
          id={io}
          io={io}
          onCarta={(c, stanca) => apriCarta(c.id, stanca)}
          onMancia={(id) => (caffe && caffe.tipo === "caffe" && caffe.mancia === id ? () => gioca(caffe) : undefined)}
          selezione={selezioneScarti ? { scelte, onTocca: (id) => setScelte((s) => alterna(s, id, daScartare)) } : undefined}
        />
      </Zona>

      <Errore testo={errore} />

      {/* registro */}
      <Zona titolo="Cosa è successo" onTitolo={() => setRegistroAperto((x) => !x)}>
        <ul className="space-y-0.5 text-xs text-luce/90">
          {(registroAperto ? v.registro.slice(-25) : v.registro.slice(-4))
            .slice()
            .reverse()
            .map((f) => (
              <li key={f.n}>{descriviFatto(f, nick, io)}</li>
            ))}
        </ul>
      </Zona>

      {finito && <Esito partita={partita} v={v} nick={nick} />}

      {/* barra in basso: mosse */}
      {!finito && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-oro bg-notte/95 px-3 py-2 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            {selezioneScarti ? (
              <>
                <span className="flex-1 text-sm">
                  Scegli {daScartare} {daScartare === 1 ? "carta" : "carte"} da scartare ({scelte.length}/{daScartare})
                  {v.turno.indigestione && " 🤢 indigestione: 1 in più"}
                </span>
                <BottoneBarra disabled={scelte.length !== daScartare || bloccato} onClick={() => gioca({ tipo: "fineTurno", scarta: scelte })}>
                  Scarta e chiudi
                </BottoneBarra>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">
                  {mioTurno && !attesa
                    ? `Tocca a te: ${v.turno.mosseRimaste} ${v.turno.mosseRimaste === 1 ? "mossa" : "mosse"}${
                        v.turno.mosseUguali?.quante ? ` (+${v.turno.mosseUguali.quante} uguali)` : ""
                      }`
                    : diTurno === io
                      ? "Devi fare una scelta"
                      : `Tocca a ${nick(diTurno ?? "")}`}
                </span>
                <BottoneBarra variante="vuoto" onClick={() => setGuida(true)}>
                  📖
                </BottoneBarra>
                {mosse.length > 0 && !attesa && (
                  <BottoneBarra variante="vuoto" onClick={() => setTutteLeMosse(true)}>
                    Mosse ({mosse.length})
                  </BottoneBarra>
                )}
                {fineTurno.length > 0 && !attesa && (
                  <BottoneBarra
                    disabled={bloccato}
                    onClick={() => (daScartare > 0 ? (setScelte([]), setSelezioneScarti(true)) : gioca(fineTurno[0]!))}
                  >
                    Fine turno
                  </BottoneBarra>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {avviso && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border-2 border-oro bg-gradient-to-b from-[#fbf3df] to-[#f1e2bf] p-4 text-inchiostro shadow-2xl">
            <h2 className="mb-2 font-titolo text-lg font-bold">{avviso.titolo}</h2>
            <ul className="space-y-1.5 text-sm">
              {avviso.righe.map((r, i) => (r === "—" ? <li key={i}><hr className="border-inchiostro/20" /></li> : <li key={i}>{r}</li>))}
            </ul>
            <Pulsante className="mt-4" onClick={() => setAvviso(null)}>
              OK
            </Pulsante>
          </div>
        </div>
      )}
      {fumetto && (
        <div key={fumetto.chiave} className="fixed inset-x-3 top-3 z-40 mx-auto max-w-md rounded-xl border-2 border-oro bg-[#fbf3df] px-3 py-2 text-center text-sm font-semibold text-inchiostro shadow-xl">
          {fumetto.testo}
        </div>
      )}

      {/* scheda di una carta, con le mosse che la riguardano */}
      {scheda && (
        <Foglio titolo={scheda.titolo} onChiudi={() => setScheda(null)}>
          {scheda.idCarta && <SchedaCarta idCarta={scheda.idCarta} stanca={scheda.stanca} />}
          <ListaMosse mosse={scheda.mosse} v={v} nick={nick} onScegli={gioca} disabilitata={bloccato} vuota="Adesso non puoi fare niente con questa carta." />
        </Foglio>
      )}
      {guida && (
        <Foglio titolo="📖 Come si gioca" onChiudi={() => setGuida(false)}>
          <GuidaFamiglia />
        </Foglio>
      )}
      {tutteLeMosse && (
        <Foglio titolo="Le tue mosse" onChiudi={() => setTutteLeMosse(false)}>
          <ListaMosse mosse={mosse.filter((m) => m.tipo !== "fineTurno")} v={v} nick={nick} onScegli={gioca} disabilitata={bloccato} raggruppa />
        </Foglio>
      )}

      {/* scelte obbligatorie */}
      {attesa && !finito && (
        <SceltaInSospeso
          key={riga.versione}
          v={v}
          mosse={mosse}
          nick={nick}
          gioca={gioca}
          bloccato={bloccato}
          secondi={scadenza?.difesa ? secondiRimasti : null}
        />
      )}
    </div>
  );

  function azione(m: Mossa | undefined) {
    return m ? () => gioca(m) : undefined;
  }
}

/** Aggiunge o toglie un id dalla selezione (al massimo `max`). */
function alterna(lista: string[], id: string, max: number): string[] {
  if (lista.includes(id)) return lista.filter((x) => x !== id);
  return lista.length >= max ? lista : [...lista, id];
}

/* ------------------------------------------------------------------ */
/* Pezzi della schermata                                               */
/* ------------------------------------------------------------------ */

export function BarraStato({ v, io, nick, secondi, difesa }: { v: VistaGiocatore; io: string; nick: (id: string) => string; secondi: number | null; difesa: boolean }) {
  let testo: string;
  if (v.finita) testo = "Partita finita";
  else if (v.attacco && v.turno.sceglie) {
    const a = v.attacco;
    testo = `⚔️ ${a.attaccante === io ? "Attacchi" : `${nick(a.attaccante)} attacca`} ${a.bersaglio === io ? "te" : nick(a.bersaglio)} con ${nomePotere(a.carta, a.potere)}`;
  } else if (v.turno.sceglie && v.turno.sceglie !== v.turno.giocatore) testo = `${nick(v.turno.sceglie)} sta scegliendo…`;
  else testo = v.turno.giocatore === io ? "Tocca a te!" : `Tocca a ${nick(v.turno.giocatore)}`;
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-oro/50 bg-black/20 px-3 py-2">
      <span className="font-titolo font-bold text-oro-chiaro">{testo}</span>
      {secondi !== null && !v.finita && (
        <span className="shrink-0 rounded-full bg-rosso px-2 py-0.5 text-xs font-bold text-white">
          {difesa ? "⏱ difesa" : "⏱ computer"} {secondi}s
        </span>
      )}
      {v.ultimoTurno !== null && !v.finita && <span className="shrink-0 rounded bg-oro px-2 text-xs font-bold text-[#2b1a05]">ultimo giro</span>}
    </div>
  );
}

export function Evento({ id, turni }: { id: string; turni: number }) {
  const e = evento(id);
  return (
    <div className="rounded-xl border-2 border-[#ff7ad9] bg-[#3a1d5c] px-3 py-2 text-sm">
      <b>🎉 {e.nome}</b> <span className="text-xs text-white/70">(ancora {turni} {turni === 1 ? "turno" : "turni"})</span>
      <p className="text-xs text-white/85">{e.testo}</p>
    </div>
  );
}

export function Protezioni({ v, nick }: { v: VistaGiocatore; nick: (id: string) => string }) {
  const note: string[] = [];
  if (v.benedizione) note.push(`🙏 Benedizione di ${nick(v.benedizione)}: nessuno può essere attaccato`);
  if (v.tregua !== null) note.push("❄️ Nevicava: niente attacchi fino alla fine del giro");
  if (v.turno.zitto) note.push(`🤐 ${nick(v.turno.giocatore)} non può usare poteri in questo turno`);
  for (const r of v.turno.rivelati) {
    note.push(
      `👀 Carte di ${nick(r.giocatore)}: ${[...r.mano.map((c) => String(c.valore)), ...r.nascosti.map((c) => nomeCarta(c.carta))].join(", ") || "nessuna"}`,
    );
  }
  if (note.length === 0) return null;
  return (
    <ul className="space-y-1 text-xs">
      {note.map((n) => (
        <li key={n} className="rounded-lg bg-black/25 px-2 py-1">
          {n}
        </li>
      ))}
    </ul>
  );
}

export function SchedaGiocatore({
  nome,
  avatar,
  g,
  diTurno,
  sceglie,
  selezionato,
  onClick,
}: {
  nome: string;
  avatar: string | undefined;
  g: VistaGiocatore["giocatori"][string];
  diTurno: boolean;
  sceglie: boolean;
  selezionato: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex shrink-0 items-center gap-2 rounded-xl border-2 px-2 py-1 text-left ${
        diTurno ? "border-oro bg-oro/20" : sceglie ? "border-[#ff7ad9] bg-[#ff7ad9]/15" : "border-white/20"
      } ${selezionato ? "ring-2 ring-oro-chiaro" : ""}`}
    >
      {avatar && <CerchioAvatar id={avatar} dimensione={30} />}
      <span className="leading-tight">
        <span className="block max-w-24 truncate text-sm font-bold">{nome}</span>
        <span className="block text-[11px] text-luce/80">
          ⭐ {g.punti} · 🃏 {g.carteInMano} · 🂠 {g.nascosti}
        </span>
      </span>
    </button>
  );
}

export function Zona({ titolo, children, onTitolo }: { titolo: string; children: ReactNode; onTitolo?: () => void }) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/15 p-2">
      <button type="button" onClick={onTitolo} disabled={!onTitolo} className="mb-1 text-xs font-bold uppercase tracking-wide text-oro-chiaro/90">
        {titolo}
        {onTitolo && " ▾"}
      </button>
      {children}
    </section>
  );
}

/** Carte di un giocatore: attivati, attacchi in attesa, nascosti, mano, vetrina, mancia. */
export function AreaGiocatore({
  v,
  id,
  io,
  onCarta,
  onMancia,
  selezione,
}: {
  v: VistaGiocatore;
  id: string;
  io: string;
  onCarta: (c: CopiaCarta, stanca?: number) => void;
  onMancia?: (id: string) => (() => void) | undefined;
  selezione?: { scelte: string[]; onTocca: (id: string) => void };
}) {
  const g = v.giocatori[id]!;
  const mio = id === io;
  const fascicolo = v.fascicolo?.giocatore === id ? v.fascicolo : null;
  const riga = (etichetta: string, contenuto: ReactNode, vuota = false) =>
    vuota ? null : (
      <div className="mb-1.5">
        <div className="mb-0.5 text-[10px] uppercase tracking-wide text-luce/60">{etichetta}</div>
        <div className="flex flex-wrap gap-1.5">{contenuto}</div>
      </div>
    );
  return (
    <div>
      {riga(
        `Attivati (${g.punti} punti)`,
        g.attivati.map((a: Attivato) => (
          <CartaFamiglia key={a.copia.id} idCarta={a.copia.carta} stanca={a.stanca} dimensione="piccola" onClick={() => onCarta(a.copia, a.stanca)} />
        )),
        g.attivati.length === 0,
      )}
      {riga(
        "Attacchi in attesa",
        g.attacchi.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione="piccola" onClick={() => onCarta(c)} />),
        g.attacchi.length === 0,
      )}
      {mio
        ? riga(
            "Nascosti in mano",
            v.nascosti.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione="piccola" onClick={() => onCarta(c)} />),
            v.nascosti.length === 0,
          )
        : riga(
            "Nascosti in mano",
            fascicolo
              ? fascicolo.nascosti.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione="piccola" onClick={() => onCarta(c)} />)
              : Array.from({ length: g.nascosti }, (_, i) => <CartaFamiglia key={i} idCarta="" coperta dimensione="piccola" />),
            g.nascosti === 0,
          )}
      {mio
        ? riga(
            "Carte numero",
            [...v.mano]
              .sort((a, b) => a.valore - b.valore)
              .map((c) => (
                <CartaNumeroGrafica
                  key={c.id}
                  c={c}
                  selezionata={selezione?.scelte.includes(c.id)}
                  onClick={selezione ? () => selezione.onTocca(c.id) : undefined}
                />
              )),
            v.mano.length === 0,
          )
        : riga(
            `Carte numero: ${g.carteInMano}`,
            fascicolo ? fascicolo.mano.map((c) => <CartaNumeroGrafica key={c.id} c={c} piccola />) : null,
            !fascicolo && g.carteInMano === 0,
          )}
      {riga(
        "Vetrina",
        g.vetrina.map((c) => <CartaNumeroGrafica key={c.id} c={c} piccola />),
        g.vetrina.length === 0,
      )}
      {riga(
        "Mancia dei nonni",
        g.mancia.map((m) => <Mancia key={m.id} m={m} onClick={onMancia?.(m.id)} />),
        g.mancia.length === 0,
      )}
      {g.attivati.length + g.attacchi.length + g.nascosti + g.carteInMano + g.vetrina.length + g.mancia.length === 0 && (
        <p className="text-xs text-luce/60">Nessuna carta.</p>
      )}
    </div>
  );
}

function Mazzo({ testo, quante, onClick }: { testo: string; quante?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="rounded-lg border-2 border-oro bg-[#2b1a4a] px-2 py-1 text-left text-xs font-bold text-white enabled:hover:brightness-125 disabled:opacity-45"
    >
      {testo}
      {quante !== undefined && <span className="ml-1 font-normal text-white/70">{quante}</span>}
    </button>
  );
}

function BottoneBarra({ children, onClick, disabled, variante = "pieno" }: { children: ReactNode; onClick: () => void; disabled?: boolean; variante?: "pieno" | "vuoto" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40 ${
        variante === "pieno" ? "bg-gradient-to-b from-[#e3c06a] to-[#b8892b] text-[#2b1a05]" : "border-2 border-oro text-oro-chiaro"
      }`}
    >
      {children}
    </button>
  );
}

function Foglio({ titolo, onChiudi, children }: { titolo: string; onChiudi?: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onChiudi}>
      <div
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-2 border-oro bg-gradient-to-b from-[#fbf3df] to-[#f1e2bf] p-4 text-inchiostro sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-titolo text-lg font-bold">{titolo}</h2>
          {onChiudi && (
            <button type="button" onClick={onChiudi} className="rounded-full px-2 text-xl" aria-label="Chiudi">
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

const GRUPPI: Record<string, string> = {
  prendiNumero: "Prendere e pescare",
  prendiPersonaggio: "Prendere e pescare",
  pescaNumero: "Prendere e pescare",
  pescaPersonaggio: "Prendere e pescare",
  brucia: "Prendere e pescare",
  pescaEvento: "Eventi",
  attiva: "Attivare",
  potere: "Poteri",
  usaCarta: "Carte attacco",
  caffe: "Caffè",
};

function ListaMosse({
  mosse,
  v,
  nick,
  onScegli,
  disabilitata,
  raggruppa,
  vuota,
}: {
  mosse: Mossa[];
  v: VistaGiocatore;
  nick: (id: string) => string;
  onScegli: (m: Mossa) => void;
  disabilitata: boolean;
  raggruppa?: boolean;
  vuota?: string;
}) {
  if (mosse.length === 0) return vuota ? <p className="mt-3 text-sm text-tenue">{vuota}</p> : null;
  const gruppi = new Map<string, Mossa[]>();
  for (const m of mosse) {
    const g = raggruppa ? (GRUPPI[m.tipo] ?? "Altro") : "";
    gruppi.set(g, [...(gruppi.get(g) ?? []), m]);
  }
  return (
    <div className="mt-3 space-y-3">
      {[...gruppi].map(([nome, lista]) => (
        <div key={nome}>
          {nome && <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-tenue">{nome}</h3>}
          <div className="space-y-1.5">
            {lista.map((m, i) => (
              <button
                key={i}
                type="button"
                disabled={disabilitata}
                onClick={() => onScegli(m)}
                className="w-full rounded-xl border-2 border-oro/60 bg-white/70 px-3 py-2 text-left text-sm font-semibold hover:bg-white disabled:opacity-40"
              >
                {descriviMossa(m, v, nick)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Finestra per le scelte che bloccano la partita: difesa, zona piena, carte da scegliere, ordine, regalo. */
function SceltaInSospeso({
  v,
  mosse,
  nick,
  gioca,
  bloccato,
  secondi,
}: {
  v: VistaGiocatore;
  mosse: Mossa[];
  nick: (id: string) => string;
  gioca: (m: Mossa) => void;
  bloccato: boolean;
  secondi: number | null;
}) {
  const a = v.turno.attesa!;
  const [scelte, setScelte] = useState<string[]>([]);

  if (a.tipo === "difesa" && v.attacco) {
    const att = v.attacco;
    const subisci = mosse.filter((m): m is Extract<Mossa, { tipo: "subisci" }> => m.tipo === "subisci");
    const conCarte = subisci.find((m) => m.carte && m.carte.length > 0);
    const n = conCarte?.carte?.length ?? 0;
    const altriSubisci = subisci.filter((m) => !(m.carte && m.carte.length > 0));
    const testoPotere = carta(att.carta).poteri.find((p) => p.id === att.potere)?.testo;
    return (
      <Foglio titolo={`⚔️ ${nick(att.da)} ti attacca!`}>
        <p className="text-sm">
          <b>{nomePotere(att.carta, att.potere)}</b> ({nomeCarta(att.carta)}, livello {att.livello}): {testoPotere}
        </p>
        {secondi !== null && <p className="mt-1 text-sm font-bold text-rosso">⏱ Hai ancora {secondi} secondi, poi l'attacco passa.</p>}
        <ListaMosse mosse={mosse.filter((m) => m.tipo === "difendi")} v={v} nick={nick} onScegli={gioca} disabilitata={bloccato} />
        {n > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold">Se lo lasci passare, scegli {n} {n === 1 ? "carta" : "carte"}:</p>
            <div className="flex flex-wrap gap-1.5">
              {v.mano.map((c) => (
                <CartaNumeroGrafica key={c.id} c={c} selezionata={scelte.includes(c.id)} onClick={() => setScelte((s) => alterna(s, c.id, n))} />
              ))}
            </div>
            <Pulsante className="mt-2" disabled={bloccato || scelte.length !== n} onClick={() => gioca({ tipo: "subisci", carte: scelte })}>
              Lascia passare con queste carte
            </Pulsante>
          </div>
        )}
        <ListaMosse mosse={altriSubisci} v={v} nick={nick} onScegli={gioca} disabilitata={bloccato} />
      </Foglio>
    );
  }

  if (a.tipo === "scegliNumeri") {
    const quante = Math.min(a.quante, a.carte.length);
    return (
      <Foglio
        titolo={
          a.motivo === "patate"
            ? `🥔 Patate al forno: scegli ${quante === 1 ? "la tua" : `le tue ${quante}`}`
            : a.motivo === "posto"
              ? "🧹 Ogni cosa al suo posto: scegli la carta da tenere"
              : `🍅 Frutta e verdura: scegli ${quante} carte`
        }
      >
        <div className="flex flex-wrap gap-2">
          {a.carte.map((c) => (
            <CartaNumeroGrafica key={c.id} c={c} selezionata={scelte.includes(c.id)} onClick={() => setScelte((s) => alterna(s, c.id, quante))} />
          ))}
        </div>
        <Pulsante className="mt-3" disabled={bloccato || scelte.length !== quante} onClick={() => gioca({ tipo: "scegli", carte: scelte })}>
          Prendi
        </Pulsante>
      </Foglio>
    );
  }

  if (a.tipo === "scegliPersonaggio") {
    return (
      <Foglio titolo="👴 Ne ho viste tante: scegli un personaggio">
        <div className="flex flex-wrap justify-center gap-2">
          {a.carte.map((c) => (
            <CartaFamiglia key={c.id} idCarta={c.carta} onClick={bloccato ? undefined : () => gioca({ tipo: "scegli", carte: [c.id] })} />
          ))}
        </div>
      </Foglio>
    );
  }

  if (a.tipo === "riordina") {
    const restanti = a.carte.filter((c) => !scelte.includes(c.id));
    return (
      <Foglio titolo="🧹 Ogni cosa al suo posto">
        <p className="mb-2 text-sm">Tocca le carte nell'ordine in cui vuoi pescarle (la prima toccata sarà la prima del mazzo).</p>
        <div className="flex flex-wrap gap-2">
          {restanti.map((c) => (
            <CartaNumeroGrafica key={c.id} c={c} onClick={() => setScelte((s) => [...s, c.id])} />
          ))}
        </div>
        <p className="mt-2 text-sm">
          Ordine: {scelte.map((id) => a.carte.find((c) => c.id === id)!.valore).join(" → ") || "—"}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Pulsante variante="vuoto" onClick={() => setScelte([])}>
            Ricomincia
          </Pulsante>
          <Pulsante disabled={bloccato || restanti.length > 0} onClick={() => gioca({ tipo: "riordina", ordine: scelte })}>
            Conferma
          </Pulsante>
        </div>
      </Foglio>
    );
  }

  if (a.tipo === "regalo") {
    return (
      <Foglio titolo="🐣 La Resurrezione: a chi dai la carta in più?">
        <div className="mb-2 flex justify-center">
          <CartaNumeroGrafica c={a.carta} />
        </div>
        <ListaMosse mosse={mosse} v={v} nick={nick} onScegli={gioca} disabilitata={bloccato} />
      </Foglio>
    );
  }

  // Zona piena
  return (
    <Foglio titolo={a.tipo === "scartaCarta" && a.zona === "attacchi" ? "Troppi attacchi: scartane uno" : "Troppe carte nascoste: scartane una"}>
      <div className="flex flex-wrap justify-center gap-2">
        {mosse.map((m) =>
          m.tipo === "scartaCarta" ? (
            <CartaFamiglia key={m.carta} idCarta={cartaDiCopia(m.carta)} onClick={bloccato ? undefined : () => gioca(m)} />
          ) : null,
        )}
      </div>
    </Foglio>
  );
}

export function Esito({ partita, v, nick }: { partita: Partita; v: VistaGiocatore; nick: (id: string) => string }) {
  const punti = partita.esito?.punti ?? Object.fromEntries(v.ordine.map((id) => [id, v.giocatori[id]!.punti]));
  const classifica = [...v.ordine].sort((a, b) => punti[b]! - punti[a]!);
  const vincitori = partita.esito?.vincitori ?? classifica.filter((id) => punti[id] === punti[classifica[0]!]);
  return (
    <div className="rounded-2xl border-2 border-oro bg-[#fbf3df] p-4 text-inchiostro">
      <h2 className="font-titolo text-xl font-bold">🏆 {vincitori.length > 1 ? "Pareggio!" : `Vince ${nick(vincitori[0]!)}!`}</h2>
      <ol className="mt-2 space-y-1">
        {classifica.map((id) => (
          <li key={id} className="flex justify-between">
            <span>{nick(id)}</span>
            <b>{punti[id]} punti</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
