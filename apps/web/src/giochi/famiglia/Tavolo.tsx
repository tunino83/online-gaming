/**
 * Tavolo della Famiglia (prima versione, per le prove): tavolo, giocatori, le proprie carte,
 * le mosse possibili e le finestre per le scelte (difesa, scarti, carte da scegliere…).
 * Il browser non conosce le regole: mostra le mosse valide che gli manda l'arbitro e descrive ciascuna.
 */
import { type Attivato, type CopiaCarta, type Mossa, type VistaGiocatore, carta, evento } from "@og/famiglia";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CerchioAvatar } from "../../Avatar";
import { QrCodice, linkTavolo } from "../../QrCodice";
import { suonoTuoTurno } from "../../lib/suoni";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { Caricamento, Errore, Pulsante as PulsanteBase } from "../../ui";
import { CartaFamiglia, CartaNumeroGrafica, Mancia, RegolePunti, SchedaCarta } from "./carte";
import "./famiglia.css";
import { cartaDiCopia, descriviFatto, descriviMossa, nomeCarta, nomePotere } from "./descrivi";
import { GuidaFamiglia } from "./Guida";
import { type Avviso, avvisoTraViste } from "./avvisi";
import { AvvisoVocale, PulsanteVocale } from "../primo-gioco/Vocali";
import { AnnuncioCarta, useAnnunci } from "./SchermoAnnunci";
import { impostaVoci, useVociAccese } from "./audio";

/** Pausa prima della mossa di un giocatore del computer. */
const PAUSA_COMPUTER_MS = 2500;
/** Prima domanda all'arbitro sul computer al posto di chi è fermo (o sul tempo per difendersi). */
const PRIMA_DOMANDA_MS = 1500;
const RIPROVA_MS = 4000;

type Scheda = { titolo: string; idCarta?: string; stanca?: number; mosse: Mossa[] } | null;

/** Mentre si gioca alla Famiglia la pagina ha lo sfondo e i colori "di casa" (famiglia.css). */
export function useSfondoFamiglia(): void {
  useEffect(() => {
    document.body.classList.add("sfondo-famiglia");
    return () => document.body.classList.remove("sfondo-famiglia");
  }, []);
}

export function TavoloFamiglia({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  useSfondoFamiglia();
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [scheda, setScheda] = useState<Scheda>(null);
  const [tutteLeMosse, setTutteLeMosse] = useState(false);
  const [guida, setGuida] = useState(false);
  const [scelte, setScelte] = useState<string[]>([]);
  const [selezioneScarti, setSelezioneScarti] = useState(false);
  const [pannello, setPannello] = useState<"mano" | "tavolo" | "schermo" | "menu" | null>(null);
  const [osservato, setOsservato] = useState<string | null>(null);
  // L'avversario mostrato in alto segue chi è di turno; quando tocca a me resta l'ultimo che ha giocato
  const ultimoAvversario = useRef<string | null>(null);
  // Il tavolo in mezzo si ingrandisce per riempire lo spazio libero
  const mezzo = useRef<HTMLDivElement>(null);
  const spazioMezzo = useMisure(mezzo);
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
  // Vocali solo se in partita c'è almeno un'altra persona (non contro il computer)
  const conPersone = giocatori.some((g) => !g.bot && g.utente_id !== io);

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

  // Carte pescate, prese o attivate a schermo (e voci delle carte)
  const { corrente: annuncio, salta: saltaAnnuncio } = useAnnunci(riga?.vista, io, nick);
  const vociAccese = useVociAccese();

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
  const avversarioDiTurno = altri.find((x) => x === diTurno) ?? altri.find((x) => x === v.turno.giocatore);
  if (avversarioDiTurno) ultimoAvversario.current = avversarioDiTurno;
  const mostrato = osservato && altri.includes(osservato) ? osservato : (avversarioDiTurno ?? ultimoAvversario.current ?? altri[0]!);

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

  // I due personaggi scoperti diventano grandi quanto lo spazio in mezzo permette
  const dimPersonaggio = misuraPersonaggi(spazioMezzo, !!v.cimaPersonaggi?.length);
  const tavolo = (
    <div className="panno w-full rounded-2xl p-2">
      <div className="flex items-end justify-center gap-1.5">
        {v.tavolo.numeri.map((c, i) =>
          c ? (
            <CartaNumeroGrafica
              key={c.id}
              c={c}
              onClick={trova((m) => m.tipo === "prendiNumero" && m.posizione === i) ? () => gioca({ tipo: "prendiNumero", posizione: i }) : undefined}
            />
          ) : (
            <div key={`vuoto-${i}`} className="h-16 w-12 rounded-lg border-2 border-dashed border-[#7a4a26]/45" />
          ),
        )}
        {v.scartiNumeri.length > 0 && (
          <span className="fm-scritta-tavolo ml-1 self-center !px-1.5 !text-[10px]" title="Ultima carta negli scarti numeri">
            scarti
            <br />
            {v.scartiNumeri.at(-1)!.valore}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-start justify-center gap-1.5">
        {v.tavolo.personaggi.map((c, i) =>
          c ? (
            <CartaFamiglia
              key={c.id}
              idCarta={c.carta}
              dimensione={dimPersonaggio}
              onClick={() => apriCarta(c.id, undefined, mosse.filter((m) => m.tipo === "prendiPersonaggio" && m.posizione === i))}
            />
          ) : (
            <div
              key={`vuotop-${i}`}
              style={{ width: dimPersonaggio, height: Math.round(dimPersonaggio * 1.4) }}
              className="rounded-lg border-2 border-dashed border-[#7a4a26]/45"
            />
          ),
        )}
        <div className="flex flex-col gap-1">
          <Mazzo testo="🧱 Numeri" quante={v.mazzi.numeri} onClick={azione(trova((m) => m.tipo === "pescaNumero"))} />
          <Mazzo testo="👨‍👩‍👧 Personaggi" quante={v.mazzi.personaggi} onClick={azione(trova((m) => m.tipo === "pescaPersonaggio"))} />
          <Mazzo testo="🌙 Eventi" quante={v.eventiNelMazzo} onClick={azione(trova((m) => m.tipo === "pescaEvento"))} />
          <Mazzo testo="🔥 Nel camino" onClick={azione(trova((m) => m.tipo === "brucia"))} />
        </div>
      </div>
      {v.cimaPersonaggi && v.cimaPersonaggi.length > 0 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="fm-scritta-tavolo !text-[10px]">👀 in cima al mazzo</span>
          {v.cimaPersonaggi.map((c, i) => (
            <CartaFamiglia
              key={c.id}
              idCarta={c.carta}
              dimensione={44}
              onClick={() => apriCarta(c.id, undefined, mosse.filter((m) => m.tipo === "pescaPersonaggio" && !!m.seconda === (i === 1)))}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <RegolePunti.Provider value={{ aiutiSenzaPunti: !!v.opzioni.aiutiSenzaPunti }}>
    <div className="gioco-famiglia text-luce">
      {finito ? (
        /* partita finita: si scorre una pagina normale con il risultato */
        <div className="space-y-3 py-3">
          <BarraStato v={v} io={io} nick={nick} secondi={null} difesa={false} />
          <Esito partita={partita} v={v} nick={nick} />
          <Zona titolo="Le tue carte">
            <AreaGiocatore v={v} id={io} io={io} onCarta={(c, stanca) => apriCarta(c.id, stanca)} />
          </Zona>
          {tavolo}
          <div className="flex justify-center gap-2">
            <BottoneBarra variante="vuoto" onClick={() => setPannello("tavolo")}>
              🗺️ Tutto il tavolo
            </BottoneBarra>
            <BottoneBarra variante="vuoto" onClick={() => setPannello("menu")}>
              📜 Cosa è successo
            </BottoneBarra>
          </div>
        </div>
      ) : (
        /* in partita: lo schermo è diviso in 3 parti fisse (avversario, tavolo, io) e non scorre */
        <div className="fixed inset-0 z-10 flex justify-center">
          <div className="flex h-full w-full max-w-2xl flex-col">
            {/* in alto: l'avversario di turno (o quello scelto), e i pulsanti per il resto */}
            <div className="flex-none space-y-1.5 px-3 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
                  {altri.map((id) => (
                    <ChipAvversario
                      key={id}
                      nome={nick(id)}
                      avatar={avatarDi.get(id)}
                      g={v.giocatori[id]!}
                      diTurno={v.turno.giocatore === id || v.turno.sceglie === id}
                      selezionato={id === mostrato}
                      onClick={() => setOsservato(id === mostrato && osservato ? null : id)}
                    />
                  ))}
                </div>
                {v.evento && (
                  <BottoneBarra variante="vuoto" onClick={() => setPannello("menu")}>
                    🌙
                  </BottoneBarra>
                )}
                {conPersone && <PulsanteVocale partitaId={partita.id} />}
                <BottoneBarra variante="vuoto" onClick={() => setPannello("menu")}>
                  <span aria-label="Altro: tavolo, schermo, regole, cosa è successo">☰</span>
                </BottoneBarra>
              </div>
              {mostrato && <TavoloAvversario v={v} id={mostrato} onCarta={(c, stanca) => apriCarta(c.id, stanca)} />}
            </div>

            {/* in mezzo: le carte sul tavolo e i mazzi */}
            <div ref={mezzo} className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-3 py-1.5">
              {tavolo}
            </div>

            {/* in basso: le mie carte e la barra delle mosse */}
            <div className="flex-none border-t-2 border-oro bg-notte/95 px-3 pt-1.5 pb-2 backdrop-blur">
              <LeMieCarte v={v} io={io} onCarta={(c, stanca) => apriCarta(c.id, stanca)} />
              <Errore testo={errore} />
              <div className="mx-auto flex max-w-2xl items-center gap-1.5">
                {selezioneScarti ? (
                  <>
                    <span className="min-w-0 flex-1 text-sm">
                      Scegli {daScartare} {daScartare === 1 ? "carta" : "carte"} da scartare ({scelte.length}/{daScartare})
                      {v.turno.indigestione && " 🤢"}
                    </span>
                    <BottoneBarra variante="vuoto" onClick={() => setPannello("mano")}>
                      ✋ Scegli
                    </BottoneBarra>
                    <BottoneBarra disabled={scelte.length !== daScartare || bloccato} onClick={() => gioca({ tipo: "fineTurno", scarta: scelte })}>
                      Scarta
                    </BottoneBarra>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 text-sm leading-tight">
                      {mioTurno && !attesa
                        ? `Tocca a te: ${v.turno.mosseRimaste} ${v.turno.mosseRimaste === 1 ? "mossa" : "mosse"}${
                            v.turno.mosseUguali?.quante ? ` (+${v.turno.mosseUguali.quante} uguali)` : ""
                          }`
                        : testoStato(v, io, nick)}
                      {secondiRimasti !== null && (
                        <span className="ml-1 rounded-full bg-rosso px-1.5 text-xs font-bold text-white">
                          {scadenza?.difesa ? "⏱" : "🤖"} {secondiRimasti}s
                        </span>
                      )}
                      {v.ultimoTurno !== null && <span className="ml-1 rounded bg-oro px-1 text-[10px] font-bold text-[#2b1a05]">ultimo giro</span>}
                    </span>
                    <BottoneBarra variante="vuoto" onClick={() => setPannello("mano")}>
                      <span aria-label={`La tua mano: ${v.mano.length} carte numero e ${v.nascosti.length} nascoste`}>
                        ✋ {v.mano.length + v.nascosti.length}
                      </span>
                    </BottoneBarra>
                    {mosse.length > 0 && !attesa && (
                      <BottoneBarra variante="vuoto" onClick={() => setTutteLeMosse(true)}>
                        Mosse ({mosse.length})
                      </BottoneBarra>
                    )}
                    {fineTurno.length > 0 && !attesa && (
                      <BottoneBarra
                        disabled={bloccato}
                        onClick={() => (daScartare > 0 ? (setScelte([]), setSelezioneScarti(true), setPannello("mano")) : gioca(fineTurno[0]!))}
                      >
                        Fine turno
                      </BottoneBarra>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* il resto, a richiesta: voci, tutto il tavolo, schermo, regole, evento, protezioni, cosa è successo */}
      {pannello === "menu" && (
        <Foglio titolo="☰ Altro" onChiudi={() => setPannello(null)}>
          <div className="grid grid-cols-2 gap-2">
            <Pulsante variante="vuoto" onClick={() => setPannello("tavolo")}>
              🗺️ Tutto il tavolo
            </Pulsante>
            <Pulsante variante="vuoto" onClick={() => setPannello("schermo")}>
              📺 Schermo
            </Pulsante>
            <Pulsante
              variante="vuoto"
              onClick={() => {
                setPannello(null);
                setGuida(true);
              }}
            >
              📖 Regole
            </Pulsante>
            <Pulsante variante="vuoto" onClick={() => impostaVoci(!vociAccese)}>
              {vociAccese ? "🗣️ Voci carte: sì" : "🔇 Voci carte: no"}
            </Pulsante>
          </div>
          {v.evento && (
            <div className="mt-3">
              <Evento id={v.evento.id} turni={v.evento.turniRimasti} />
            </div>
          )}
          <div className="mt-3">
            <Protezioni v={v} nick={nick} />
          </div>
          <h3 className="mt-3 mb-1 text-xs font-bold uppercase text-tenue">📜 Cosa è successo</h3>
          <ul className="space-y-0.5 text-sm">
            {v.registro
              .slice(-25)
              .reverse()
              .map((f) => (
                <li key={f.n}>{descriviFatto(f, nick, io)}</li>
              ))}
          </ul>
        </Foglio>
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

      {pannello === "mano" && (
        <Foglio
          titolo={selezioneScarti ? `✋ Scegli ${daScartare} ${daScartare === 1 ? "carta" : "carte"} da scartare` : "✋ La tua mano"}
          onChiudi={() => setPannello(null)}
        >
          <PannelloNumeri
            v={v}
            io={io}
            onMancia={(id) => (caffe && caffe.tipo === "caffe" && caffe.mancia === id ? () => gioca(caffe) : undefined)}
            selezione={selezioneScarti ? { scelte, onTocca: (id) => setScelte((s) => alterna(s, id, daScartare)) } : undefined}
          />
          {selezioneScarti && (
            <Pulsante
              className="mt-4"
              disabled={scelte.length !== daScartare || bloccato}
              onClick={() => {
                setPannello(null);
                gioca({ tipo: "fineTurno", scarta: scelte });
              }}
            >
              Scarta {scelte.length}/{daScartare} e chiudi il turno
            </Pulsante>
          )}
          {!selezioneScarti && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-bold uppercase text-tenue">Personaggi nascosti (li vedi solo tu)</p>
              {v.nascosti.length === 0 ? (
                <p className="text-sm text-tenue">Nessuno.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {v.nascosti.map((c) => (
                    <CartaFamiglia
                      key={c.id}
                      idCarta={c.carta}
                      dimensione={96}
                      onClick={() => {
                        setPannello(null);
                        apriCarta(c.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Foglio>
      )}
      {pannello === "tavolo" && (
        <PanoramicaTavolo
          v={v}
          io={io}
          nick={nick}
          avatarDi={(id) => avatarDi.get(id)}
          onCarta={(c, stanca) => {
            setPannello(null);
            apriCarta(c.id, stanca);
          }}
          onChiudi={() => setPannello(null)}
        />
      )}
      {pannello === "schermo" && (
        <Foglio titolo="📺 Schermo del tavolo" onChiudi={() => setPannello(null)}>
          <p className="mb-3 text-sm">
            Apri questo codice su un tablet, un PC o una TV: mostra la partita a tutti, senza le carte in mano. Va bene anche per chi vuole
            solo guardare.
          </p>
          <QrCodice testo={linkTavolo(partita.codice)} dimensione={190} />
          <p className="mt-2 break-all text-center text-xs text-tenue select-all">{linkTavolo(partita.codice)}</p>
        </Foglio>
      )}
      {conPersone && <AvvisoVocale partitaId={partita.id} io={io} nick={nick} />}
      {annuncio && <AnnuncioCarta key={annuncio.chiave} annuncio={annuncio} onFine={saltaAnnuncio} />}

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
    </RegolePunti.Provider>
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

/** Cosa sta succedendo adesso, in breve (di chi è il turno, attacco in corso, chi sta scegliendo). */
export function testoStato(v: VistaGiocatore, io: string, nick: (id: string) => string): string {
  if (v.finita) return "Partita finita";
  if (v.attacco && v.turno.sceglie) {
    const a = v.attacco;
    return `⚔️ ${a.attaccante === io ? "Attacchi" : `${nick(a.attaccante)} attacca`} ${a.bersaglio === io ? "te" : nick(a.bersaglio)} con ${nomePotere(a.carta, a.potere)}`;
  }
  if (v.turno.sceglie && v.turno.sceglie !== v.turno.giocatore) return `${nick(v.turno.sceglie)} sta scegliendo…`;
  return v.turno.giocatore === io ? "Tocca a te!" : `Tocca a ${nick(v.turno.giocatore)}`;
}

export function BarraStato({ v, io, nick, secondi, difesa }: { v: VistaGiocatore; io: string; nick: (id: string) => string; secondi: number | null; difesa: boolean }) {
  const testo = testoStato(v, io, nick);
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
    <div className="fm-evento rounded-xl px-3 py-2 text-sm">
      <b>🌙 {e.nome}</b> <span className="text-xs opacity-70">(ancora {turni} {turni === 1 ? "turno" : "turni"})</span>
      <p className="text-xs opacity-85">{e.testo}</p>
    </div>
  );
}

export function Protezioni({ v, nick }: { v: VistaGiocatore; nick: (id: string) => string }) {
  const note: string[] = [];
  if (v.benedizione) note.push(`🙏 Benedizione di ${nick(v.benedizione)}: nessuno può essere attaccato`);
  if (v.tregua !== null) note.push("❄️ Nevicava: niente attacchi fino alla fine del giro");
  if (v.turno.zitto) note.push(`🤐 ${nick(v.turno.giocatore)} non può usare poteri in questo turno`);
  if (v.turno.senzaAttivare) note.push(`🚬 ${nick(v.turno.giocatore)} non può attivare personaggi in questo turno (Una sigaretta fuori al bar)`);
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
    <section className="fm-zona rounded-2xl p-2">
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
  senzaMano,
}: {
  v: VistaGiocatore;
  id: string;
  io: string;
  onCarta: (c: CopiaCarta, stanca?: number) => void;
  onMancia?: (id: string) => (() => void) | undefined;
  selezione?: { scelte: string[]; onTocca: (id: string) => void };
  /** Le mie carte in mano (numeri, nascosti, mancia) sono già nella mano fissa in basso. */
  senzaMano?: boolean;
}) {
  const g = v.giocatori[id]!;
  const mio = id === io;
  const fascicolo = v.fascicolo?.giocatore === id ? v.fascicolo : null;
  // Degli avversari si vede solo quante carte hanno in mano (le carte vere solo con Studia il fascicolo)
  const soloConteggi = !mio && !fascicolo;
  const nascondiMano = (mio && senzaMano) || soloConteggi;
  const riga = (etichetta: string, contenuto: ReactNode, vuota = false) =>
    vuota ? null : (
      <div className="mb-1.5">
        <div className="mb-0.5 text-[10px] uppercase tracking-wide text-luce/60">{etichetta}</div>
        <div className="flex flex-wrap gap-1.5">{contenuto}</div>
      </div>
    );
  return (
    <div>
      {soloConteggi && (
        <p className="mb-1.5 text-[11px] text-luce/80">
          ✋ In mano: <b>{g.carteInMano}</b> {g.carteInMano === 1 ? "carta numero" : "carte numero"} · <b>{g.nascosti}</b>{" "}
          {g.nascosti === 1 ? "personaggio nascosto" : "personaggi nascosti"}
          {g.mancia.length > 0 && ` · 🪙 ${g.mancia.length} mancia`}
        </p>
      )}
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
      {nascondiMano
        ? null
        : mio
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
      {nascondiMano
        ? null
        : mio
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
      {!nascondiMano &&
        riga(
          "Mancia dei nonni",
          g.mancia.map((m) => <Mancia key={m.id} m={m} onClick={onMancia?.(m.id)} />),
          g.mancia.length === 0,
        )}
      {g.attivati.length + g.attacchi.length + g.vetrina.length + (nascondiMano ? 0 : g.nascosti + g.carteInMano + g.mancia.length) === 0 &&
        !soloConteggi && <p className="text-xs text-luce/60">{mio && senzaMano ? "Nessuna carta sul tavolo." : "Nessuna carta."}</p>}
    </div>
  );
}

/** Larghezza e altezza di un elemento, aggiornate quando cambiano. */
function useMisure(ref: { current: HTMLElement | null }): { larghezza: number; altezza: number } {
  const [misure, setMisure] = useState({ larghezza: 0, altezza: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const o = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setMisure((m) => (Math.abs(m.larghezza - r.width) < 1 && Math.abs(m.altezza - r.height) < 1 ? m : { larghezza: r.width, altezza: r.height }));
    });
    o.observe(el);
    return () => o.disconnect();
  });
  return misure;
}

/**
 * Larghezza dei due personaggi scoperti sul tavolo, secondo lo spazio in mezzo:
 * in altezza tolte le carte numero (e la fila "in cima al mazzo"), in larghezza tolta la colonna dei mazzi.
 */
function misuraPersonaggi({ larghezza, altezza }: { larghezza: number; altezza: number }, conCima: boolean): number {
  if (larghezza === 0 || altezza === 0) return 76;
  const perAltezza = (altezza - 110 - (conCima ? 70 : 0)) / 1.4;
  const perLarghezza = (larghezza - 24 - 16 - 130) / 2;
  return Math.round(Math.max(76, Math.min(perAltezza, perLarghezza, 150)));
}

/** Un avversario nella fila in alto: avatar, nome, punti e carte in mano. Si tocca per vedere il suo tavolo. */
function ChipAvversario({
  nome,
  avatar,
  g,
  diTurno,
  selezionato,
  onClick,
}: {
  nome: string;
  avatar: string | undefined;
  g: VistaGiocatore["giocatori"][string];
  diTurno: boolean;
  selezionato: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-1.5 py-0.5 text-left ${
        selezionato ? "border-oro bg-oro/20" : "border-white/15"
      } ${diTurno ? "ring-2 ring-[#ff7ad9]" : ""}`}
    >
      {avatar && <CerchioAvatar id={avatar} dimensione={24} />}
      <span className="leading-tight">
        <span className="block max-w-20 truncate text-xs font-bold">
          {diTurno && "⏳ "}
          {nome}
        </span>
        <span className="block text-[10px] text-luce/80">
          ⭐{g.punti} · ✋{g.carteInMano + g.nascosti}
        </span>
      </span>
    </button>
  );
}

/** Il tavolo dell'avversario in alto: le sue carte attivate e gli attacchi in attesa (e la mano solo con il fascicolo). */
function TavoloAvversario({ v, id, onCarta }: { v: VistaGiocatore; id: string; onCarta: (c: CopiaCarta, stanca?: number) => void }) {
  const g = v.giocatori[id]!;
  const fascicolo = v.fascicolo?.giocatore === id ? v.fascicolo : null;
  return (
    <div className="fm-zona space-y-0.5 rounded-2xl px-2 py-1">
      <div className="text-[10px] text-luce/80">
        ✋ In mano: <b>{g.carteInMano}</b> numeri · <b>{g.nascosti}</b> nascosti
        {g.vetrina.length > 0 && ` · vetrina ${g.vetrina.map((c) => c.valore).join(" ")}`}
        {g.mancia.length > 0 && ` · 🪙 ${g.mancia.length}`}
      </div>
      <RigaCarte
        etichetta={
          <>
            Attivate
            <br />⭐ {g.punti}
            {g.puntiPoteri > 0 && <span className="block normal-case">di cui 🎯{g.puntiPoteri}</span>}
          </>
        }
        vuota="Ancora nessuna."
        dimensione={40}
      >
        {g.attivati.map((a) => (
          <CartaFamiglia key={a.copia.id} idCarta={a.copia.carta} stanca={a.stanca} dimensione={40} onClick={() => onCarta(a.copia, a.stanca)} />
        ))}
      </RigaCarte>
      {g.attacchi.length > 0 && (
        <RigaCarte etichetta="Attacchi pronti" vuota="" dimensione={40}>
          {g.attacchi.map((c) => (
            <CartaFamiglia key={c.id} idCarta={c.carta} dimensione={40} onClick={() => onCarta(c)} />
          ))}
        </RigaCarte>
      )}
      {fascicolo && (
        <RigaCarte etichetta="📁 Mano" vuota="Niente in mano." dimensione={40}>
          {[
            ...fascicolo.mano.map((c) => <CartaNumeroGrafica key={c.id} c={c} piccola />),
            ...fascicolo.nascosti.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione={40} onClick={() => onCarta(c)} />),
          ]}
        </RigaCarte>
      )}
    </div>
  );
}

/** Una riga di carte in basso, con la sua etichetta a sinistra. */
function RigaCarte({ etichetta, vuota, children, dimensione = 44 }: { etichetta: ReactNode; vuota: string; children: ReactNode[]; dimensione?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 shrink-0 text-[10px] font-bold uppercase leading-tight text-oro-chiaro">{etichetta}</div>
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5" style={{ minHeight: Math.round(dimensione * 1.4) + 4 }}>
        {children.length === 0 ? <span className="text-xs text-luce/60">{vuota}</span> : children}
      </div>
    </div>
  );
}

/** Le mie carte sempre in vista in basso: attivate (con i punti) e da attivare (nascoste in mano e attacchi in attesa). */
function LeMieCarte({ v, io, onCarta }: { v: VistaGiocatore; io: string; onCarta: (c: CopiaCarta, stanca?: number) => void }) {
  const me = v.giocatori[io]!;
  return (
    <div className="mx-auto mb-1 max-w-2xl space-y-0.5">
      <RigaCarte
        etichetta={
          <>
            Attivate
            <br />⭐ {me.punti}
            {me.puntiPoteri > 0 && <span className="block normal-case">di cui 🎯{me.puntiPoteri}</span>}
          </>
        }
        vuota="Ancora nessuna."
      >
        {me.attivati.map((a) => (
          <CartaFamiglia key={a.copia.id} idCarta={a.copia.carta} stanca={a.stanca} dimensione={44} onClick={() => onCarta(a.copia, a.stanca)} />
        ))}
      </RigaCarte>
      <RigaCarte etichetta="Da attivare" vuota="Nessun personaggio in mano.">
        {[
          ...v.nascosti.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione={44} onClick={() => onCarta(c)} />),
          ...me.attacchi.map((c) => <CartaFamiglia key={c.id} idCarta={c.carta} dimensione={44} onClick={() => onCarta(c)} />),
        ]}
      </RigaCarte>
    </div>
  );
}

/** Le mie carte numero, la vetrina e la mancia (anche per scegliere cosa scartare a fine turno). */
function PannelloNumeri({
  v,
  io,
  onMancia,
  selezione,
}: {
  v: VistaGiocatore;
  io: string;
  onMancia: (id: string) => (() => void) | undefined;
  selezione?: { scelte: string[]; onTocca: (id: string) => void };
}) {
  const me = v.giocatori[io]!;
  const numeri = [...v.mano].sort((a, b) => a.valore - b.valore);
  return (
    <div className="space-y-3">
      {numeri.length === 0 ? (
        <p className="text-sm text-tenue">Non hai carte numero in mano.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {numeri.map((c) => (
            <CartaNumeroGrafica key={c.id} c={c} selezionata={selezione?.scelte.includes(c.id)} onClick={selezione ? () => selezione.onTocca(c.id) : undefined} />
          ))}
        </div>
      )}
      {me.vetrina.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-tenue">In vetrina (fuori dal limite della mano)</p>
          <div className="flex flex-wrap gap-2">
            {me.vetrina.map((c) => (
              <CartaNumeroGrafica key={c.id} c={c} piccola />
            ))}
          </div>
        </div>
      )}
      {me.mancia.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-tenue">Mancia dei nonni</p>
          <div className="flex flex-wrap gap-2">
            {me.mancia.map((m) => (
              <Mancia key={m.id} m={m} onClick={onMancia(m.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Tutto il tavolo: tutti i giocatori insieme, con le carte che si vedono (come nel Portale). */
function PanoramicaTavolo({
  v,
  io,
  nick,
  avatarDi,
  onCarta,
  onChiudi,
}: {
  v: VistaGiocatore;
  io: string;
  nick: (id: string) => string;
  avatarDi: (id: string) => string | undefined;
  onCarta: (c: CopiaCarta, stanca?: number) => void;
  onChiudi: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-notte/97 px-3 py-3 backdrop-blur" role="dialog" aria-label="Tutto il tavolo">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-titolo text-lg font-bold text-oro-chiaro">🗺️ Tutto il tavolo</h2>
          <BottoneBarra variante="vuoto" onClick={onChiudi}>
            ✕ Chiudi
          </BottoneBarra>
        </div>
        {v.evento && <Evento id={v.evento.id} turni={v.evento.turniRimasti} />}
        <Protezioni v={v} nick={nick} />
        {v.ordine.map((id) => {
          const g = v.giocatori[id]!;
          const avatar = avatarDi(id);
          return (
            <section key={id} className={`fm-zona rounded-2xl p-2 ${v.turno.giocatore === id ? "ring-2 ring-oro" : ""}`}>
              <div className="mb-1 flex items-center gap-2">
                {avatar && <CerchioAvatar id={avatar} dimensione={26} />}
                <b>{id === io ? "Tu" : nick(id)}</b>
                <span className="text-xs text-luce/80">
                  ⭐ {g.punti} · 🧱 {g.carteInMano} · 🂠 {g.nascosti}
                  {v.turno.giocatore === id && " · di turno"}
                </span>
              </div>
              <AreaGiocatore v={v} id={id} io={io} onCarta={onCarta} senzaMano />
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Mazzo({ testo, quante, onClick }: { testo: string; quante?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="fm-mazzo px-2 py-1 text-left text-xs font-bold disabled:opacity-60"
    >
      {testo}
      {quante !== undefined && <span className="ml-1 font-normal opacity-70">{quante}</span>}
    </button>
  );
}

/** Pulsante comune, col colore rame della Famiglia (famiglia.css). */
function Pulsante({ className = "", ...props }: Parameters<typeof PulsanteBase>[0]) {
  return <PulsanteBase className={`${props.variante === "vuoto" ? "" : "fm-pulsante"} ${className}`} {...props} />;
}

function BottoneBarra({ children, onClick, disabled, variante = "pieno" }: { children: ReactNode; onClick: () => void; disabled?: boolean; variante?: "pieno" | "vuoto" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40 ${
        variante === "pieno" ? "bg-gradient-to-b from-[#f0a35e] to-[#c0612b] text-white shadow-[0_2px_0_#7a3d1d]" : "border-2 border-oro text-oro-chiaro"
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
        className="fm-foglio max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-2 border-oro bg-gradient-to-b from-[#fbf3df] to-[#f1e2bf] p-4 text-inchiostro sm:rounded-2xl"
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

  if (a.tipo === "canto") {
    // Si canta!: tocca le carte nell'ordine dei giocatori a cui darle
    const quante = Math.min(a.a.length, v.mano.length);
    const restanti = v.mano.filter((c) => !scelte.includes(c.id));
    return (
      <Foglio titolo="🎤 Si canta!: scegli quale carta dare a ciascuno">
        <ul className="mb-2 space-y-1 text-sm">
          {a.a.slice(0, quante).map((chi, i) => {
            const data = v.mano.find((c) => c.id === scelte[i]);
            return (
              <li key={chi}>
                a <b>{nick(chi)}</b>: {data ? <b>il {data.valore}</b> : <span className="text-tenue">tocca una carta…</span>}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          {[...restanti]
            .sort((x, y) => x.valore - y.valore)
            .map((c) => (
              <CartaNumeroGrafica key={c.id} c={c} onClick={scelte.length < quante ? () => setScelte((s) => [...s, c.id]) : undefined} />
            ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Pulsante variante="vuoto" onClick={() => setScelte([])}>
            Ricomincia
          </Pulsante>
          <Pulsante disabled={bloccato || scelte.length !== quante} onClick={() => gioca({ tipo: "scegli", carte: scelte })}>
            Dai le carte
          </Pulsante>
        </div>
      </Foglio>
    );
  }

  if (a.tipo === "scambiaTavolo") {
    // Pranzo a domicilio: una carta della mano (prima scelta) e una del tavolo (seconda), oppure niente
    const mia = scelte.find((id) => v.mano.some((c) => c.id === id));
    const delTavolo = scelte.find((id) => v.tavolo.numeri.some((c) => c?.id === id));
    const tocca = (id: string, mano: boolean) =>
      setScelte((s) => [...s.filter((x) => (mano ? !v.mano.some((c) => c.id === x) : !v.tavolo.numeri.some((c) => c?.id === x))), id]);
    return (
      <Foglio titolo="🍝 Pranzo a domicilio: vuoi scambiare una carta con il tavolo?">
        <p className="mb-1 text-sm">La tua carta:</p>
        <div className="flex flex-wrap gap-2">
          {v.mano
            .filter((c) => !c.unite)
            .map((c) => (
              <CartaNumeroGrafica key={c.id} c={c} piccola selezionata={c.id === mia} onClick={() => tocca(c.id, true)} />
            ))}
        </div>
        <p className="mb-1 mt-3 text-sm">Quella del tavolo:</p>
        <div className="flex flex-wrap gap-2">
          {v.tavolo.numeri.map((c) => (c ? <CartaNumeroGrafica key={c.id} c={c} piccola selezionata={c.id === delTavolo} onClick={() => tocca(c.id, false)} /> : null))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Pulsante variante="vuoto" disabled={bloccato} onClick={() => gioca({ tipo: "scegli", carte: [] })}>
            Nessuno scambio
          </Pulsante>
          <Pulsante disabled={bloccato || !mia || !delTavolo} onClick={() => gioca({ tipo: "scegli", carte: [mia!, delTavolo!] })}>
            Scambia
          </Pulsante>
        </div>
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
