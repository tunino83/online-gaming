/**
 * Schermata di gioco del primo gioco, disegnata come un tavolo da gioco.
 * - In alto (fisso): stato del turno, pulsanti (Tavolo, Storico, Regole, Suoni, Tema) e la barra
 *   dell'avversario mostrato (personaggi, avatar con i punti; frecce per vedere gli altri avversari).
 * - Al centro: il panno con mazzi e carte scoperte (le carte si rimpiccioliscono per stare tra le due barre
 *   anche sui telefoni piccoli); fumetto con l'ultima mossa degli altri.
 * - In basso (fisso): i miei posti, i miei poteri blu, la mia mano a ventaglio, diamanti e fine turno.
 * Si tocca una carta per prenderla, un mazzo per pescare, un proprio personaggio per attivarlo.
 * Le mosse possibili le calcola sempre il server.
 */
import { type CartaDiamante, type CartaPersonaggio, type Evento, type Mossa, type VistaGiocatore, personaggio } from "@og/primo-gioco";
import { BookOpen, ChevronLeft, ChevronRight, Flame, ScrollText, Users, Volume2, VolumeX, Wand2 } from "lucide-react";
import { type CSSProperties, type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AvatarPunti } from "../../Avatar";
import { impostaSuoni, suonoMossa, suonoTuoTurno, useSuoniAttivi } from "../../lib/suoni";
import { chiediArbitro } from "../../lib/supabase";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVista } from "../../lib/useVista";
import { BottoneTema, Caricamento, Errore, Riquadro } from "../../ui";
import { TestoRegole } from "../../pagine/Regole";
import { AnimazioneAttivazione } from "./AnimazioneAttivazione";
import { PannelloAttivazione } from "./Attivazione";
import { PanoramicaTavolo } from "./PanoramicaTavolo";
import { CartaNumeroGrafica, CartaPersonaggioGrafica, Diamante, DorsoMazzo, MiniCartaVirtuale, PostoVuoto } from "./carte";
import { aPersona, descriviEvento, descriviMossa, etichettaPotere, gruppoMossa, raccogliCarte } from "./descrivi";
import { TUTTI_I_PERSONAGGI } from "./Catalogo";
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

/** Larghezza disponibile di un elemento (per la mano a ventaglio). */
function useLarghezza(ref: RefObject<HTMLElement>): number {
  const [larghezza, setLarghezza] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const osserva = new ResizeObserver(() => setLarghezza(el.clientWidth));
    osserva.observe(el);
    setLarghezza(el.clientWidth);
    return () => osserva.disconnect();
  }, [ref]);
  return larghezza;
}

/** Dimensioni della finestra, aggiornate quando cambiano (rotazione, barra del browser che sparisce…). */
function useFinestra(): { larghezza: number; altezza: number } {
  const leggi = () => ({ larghezza: window.innerWidth, altezza: window.innerHeight });
  const [finestra, setFinestra] = useState(leggi);
  useEffect(() => {
    const cambia = () => setFinestra(leggi());
    window.addEventListener("resize", cambia);
    return () => window.removeEventListener("resize", cambia);
  }, []);
  return finestra;
}

/** Altezza di una carta (tutte le carte sono 63 × 88). */
const altezzaDi = (larghezza: number) => (larghezza * 88) / 63;
const limita = (x: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, x)));

/** Vero se la finestra soddisfa la condizione (es. "(min-width: 768px)"), aggiornato quando cambia. */
function useMedia(condizione: string): boolean {
  const [vero, setVero] = useState(() => window.matchMedia(condizione).matches);
  useEffect(() => {
    const m = window.matchMedia(condizione);
    const cambia = () => setVero(m.matches);
    m.addEventListener("change", cambia);
    return () => m.removeEventListener("change", cambia);
  }, [condizione]);
  return vero;
}

/** Schermo largo (tablet, computer, telefono in orizzontale): carte un po' più grandi. */
const useSchermoLargo = () => useMedia("(min-width: 768px)");
/** Schermo da computer: barre su una sola riga e carte grandi, per sfruttare lo spazio. */
const useSchermoGrande = () => useMedia("(min-width: 1280px) and (min-height: 600px)");

/** Eventi da raccontare: si salta il semplice "ha chiuso il turno". */
const significativo = (e: Evento) => !(e.tipo === "fineTurno" && e.scartate === 0 && !e.cambiaMano);

type Attivazione = Extract<Evento, { tipo: "attiva" }>;

/** Pausa tra una mossa e l'altra dei giocatori del computer. */
const PAUSA_COMPUTER_MS = 3000;

export function TavoloPrimoGioco({ partita, giocatori, io }: { partita: Partita; giocatori: GiocatorePartita[]; io: string }) {
  const { riga, errore: erroreLettura, ricarica } = useVista<VistaGiocatore, Mossa>(partita.id, true);
  const [invio, setInvio] = useState(false);
  // Dopo una mossa riuscita i comandi restano spenti finché non arriva la situazione aggiornata
  const [aspettoOltre, setAspettoOltre] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [primoPiano, setPrimoPiano] = useState<{ carta: CartaDaMostrare; titolo?: string; azione?: () => void } | null>(null);
  const [daScartare, setDaScartare] = useState<string[]>([]);
  const [daAttivare, setDaAttivare] = useState<string | null>(null);
  const [foglio, setFoglio] = useState<"tavolo" | "storico" | "regole" | null>(null);
  const [registroAperto, setRegistroAperto] = useState(false);
  const [biancaneveNo, setBiancaneveNo] = useState<number | null>(null);
  const [fulmineNo, setFulmineNo] = useState<number | null>(null);
  const [avversarioScelto, setAvversarioScelto] = useState<string | null>(null);
  const [banner, setBanner] = useState<number | null>(null);
  const [fumetto, setFumetto] = useState<{ testo: string; chiave: number } | null>(null);
  const [codaAttivazioni, setCodaAttivazioni] = useState<Attivazione[]>([]);
  const inizioSwipe = useRef<number | null>(null);
  const largo = useSchermoLargo();
  const grande = useSchermoGrande();
  const finestra = useFinestra();
  // Telefono basso: barre più compatte, così resta spazio per il tavolo
  const basso = finestra.altezza < 720;

  const versione = riga?.versione;
  useEffect(() => setDaScartare([]), [versione]);
  const turnoDi = riga?.vista.turno.giocatore;
  useEffect(() => setAvversarioScelto(null), [turnoDi]);

  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => m.get(id) ?? "?";
  }, [giocatori]);
  const avatarDi = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.avatar]));
    return (id: string) => m.get(id);
  }, [giocatori]);

  // Carta pescata in primo piano
  const pescaInCorso = useRef<{ tipo: "numero" | "personaggio"; versione: number; prima: Set<string> } | null>(null);
  useEffect(() => {
    const pesca = pescaInCorso.current;
    if (!riga || !pesca || riga.versione <= pesca.versione) return;
    pescaInCorso.current = null;
    if (pesca.tipo === "numero") {
      const nuova = riga.vista.mano.find((c) => !pesca.prima.has(c.id));
      if (nuova) setPrimoPiano({ carta: { tipo: "numero", valore: nuova.valore, frecce: nuova.frecce }, titolo: "Hai pescato" });
    } else {
      const nuova = riga.vista.giocatori[io]?.posti.find((c) => !pesca.prima.has(c.id));
      if (nuova) setPrimoPiano({ carta: { tipo: "personaggio", id: nuova.personaggio }, titolo: "Hai pescato" });
    }
  }, [riga, io]);

  // Carta presa dal tavolo: "vola" dal tavolo alla mano (o ai posti)
  const voloInCorso = useRef<{ versione: number; da: DOMRect; prima: Set<string>; dove: "mano" | "posti" } | null>(null);
  useLayoutEffect(() => {
    const volo = voloInCorso.current;
    if (!riga || !volo || riga.versione <= volo.versione) return;
    voloInCorso.current = null;
    const carte = volo.dove === "mano" ? riga.vista.mano : (riga.vista.giocatori[io]?.posti ?? []);
    const nuova = carte.find((c) => !volo.prima.has(c.id));
    const el = nuova && document.querySelector<HTMLElement>(`[data-carta-id="${nuova.id}"]`);
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const arrivo = el.getBoundingClientRect();
    const dx = volo.da.left + volo.da.width / 2 - (arrivo.left + arrivo.width / 2);
    const dy = volo.da.top + volo.da.height / 2 - (arrivo.top + arrivo.height / 2);
    const scala = volo.da.width / Math.max(1, arrivo.width);
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scala})`, zIndex: 70 },
        { transform: "translate(0, 0) scale(1)", zIndex: 70 },
      ],
      { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }, [riga, io]);

  // Registro: animazioni di attivazione (tutti) e fumetto con l'ultima mossa degli altri
  const ultimoEvento = useRef<number | null>(null);
  useEffect(() => {
    if (!riga) return;
    const registro = riga.vista.registro ?? [];
    const ultimo = registro.at(-1)?.n ?? 0;
    if (ultimoEvento.current === null) {
      ultimoEvento.current = ultimo; // primo caricamento: niente animazioni per il passato
      return;
    }
    const nuovi = registro.filter((e) => e.n > ultimoEvento.current!);
    ultimoEvento.current = Math.max(ultimoEvento.current, ultimo);
    const attivazioni = nuovi.filter((e): e is Attivazione => e.tipo === "attiva");
    if (attivazioni.length > 0) setCodaAttivazioni((c) => [...c, ...attivazioni]);
    // fumetto: l'ultima mossa degli altri, oppure il cambio dei personaggi per una carta con le frecce (anche se l'ho fatta uscire io)
    const ultimoAltrui = [...nuovi]
      .reverse()
      .find((e) => (e.giocatore !== io || e.tipo === "frecce") && significativo(e) && e.tipo !== "attiva");
    if (ultimoAltrui) setFumetto({ testo: descriviEvento(ultimoAltrui, nick, io), chiave: ultimoAltrui.n });
  }, [riga, io, nick]);
  useEffect(() => {
    if (!fumetto) return;
    const t = setTimeout(() => setFumetto(null), 3600);
    return () => clearTimeout(t);
  }, [fumetto]);

  // Suoni e banner: "tic" a ogni mossa, melodia e "Tocca a te!" quando diventa il mio turno
  const suoni = useSuoniAttivi();
  const precedente = useRef<{ versione: number; turnoDi: string } | null>(null);
  useEffect(() => {
    if (!riga) return;
    const ora = { versione: riga.versione, turnoDi: riga.vista.turno.giocatore };
    const prima = precedente.current;
    precedente.current = ora;
    if (!prima || ora.versione <= prima.versione) return;
    if (ora.turnoDi === io && prima.turnoDi !== io && !riga.vista.finita) {
      suonoTuoTurno();
      setBanner(Date.now());
    } else suonoMossa();
  }, [riga, io]);
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 1800);
    return () => clearTimeout(t);
  }, [banner]);

  // Partite di prova: quando tocca a un giocatore del computer, gli si chiede una mossa ogni 3 secondi
  const [tentativoBot, setTentativoBot] = useState(0);
  const turnoDelComputer = !!riga && !riga.vista.finita && giocatori.some((g) => g.bot && g.utente_id === riga.vista.turno.giocatore);
  useEffect(() => {
    if (!turnoDelComputer) return;
    let annullato = false;
    const t = setTimeout(async () => {
      const r = await chiediArbitro({ azione: "turnoComputer", partitaId: partita.id });
      if (annullato) return;
      if (r.ok) ricarica();
      else setTentativoBot((n) => n + 1); // es. qualcun altro l'ha già fatto muovere: si riprova
    }, PAUSA_COMPUTER_MS);
    return () => {
      annullato = true;
      clearTimeout(t);
    };
  }, [turnoDelComputer, versione, tentativoBot, partita.id, ricarica]);

  const barraAlta = useRef<HTMLDivElement>(null);
  const barraBassa = useRef<HTMLDivElement>(null);
  const altezzaAlta = useAltezza(barraAlta);
  const altezzaBassa = useAltezza(barraBassa);

  if (erroreLettura) return <Errore testo={erroreLettura} />;
  if (!riga) return <Caricamento testo="Preparo il tavolo…" />;

  // Le viste salvate prima dell'arrivo del registro non lo contengono
  const v: VistaGiocatore = { ...riga.vista, registro: riga.vista.registro ?? [] };
  const carte = raccogliCarte(v);
  const traguardo = partita.opzioni.puntiPerVincere ?? 15;
  const mioTurno = v.turno.giocatore === io && !v.finita;
  const bloccato = invio || (aspettoOltre !== null && riga.versione <= aspettoOltre);
  const mosse = mioTurno ? riga.mosse_valide : [];
  const mioPosto = v.ordine.indexOf(io);
  const avversari = [...v.ordine.slice(mioPosto + 1), ...v.ordine.slice(0, mioPosto)];
  const mostrato =
    (avversarioScelto && avversari.includes(avversarioScelto) && avversarioScelto) ||
    (avversari.includes(v.turno.giocatore) ? v.turno.giocatore : avversari[0]!);
  const scorri = (passo: number) => {
    const i = avversari.indexOf(mostrato);
    setAvversarioScelto(avversari[(i + passo + avversari.length) % avversari.length]!);
  };

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
    if (mossa.tipo === "prendiNumero" || mossa.tipo === "prendiPersonaggio") {
      const numero = mossa.tipo === "prendiNumero";
      const da = document.querySelector(`[data-tavolo="${numero ? "n" : "p"}${mossa.posizione}"]`)?.getBoundingClientRect();
      const prima = numero ? riga!.vista.mano : (riga!.vista.giocatori[io]?.posti ?? []);
      if (da) voloInCorso.current = { versione: riga!.versione, da, prima: new Set(prima.map((c) => c.id)), dove: numero ? "mano" : "posti" };
    }
    const r = await chiediArbitro({ azione: "mossa", partitaId: partita.id, mossa });
    setInvio(false);
    if (r.ok) {
      ricarica();
    } else {
      setAspettoOltre(null);
      pescaInCorso.current = null;
      voloInCorso.current = null;
      setErrore(r.errore);
    }
  }

  const seValida = (cerca: (m: Mossa) => boolean) => {
    const m = mosse.find(cerca);
    return m ? () => gioca(m) : undefined;
  };
  const ingrandisci = (c: CartaPersonaggio) => () => setPrimoPiano({ carta: { tipo: "personaggio", id: c.personaggio } });

  // Azioni gratuite (fulmine, Biancaneve, Cappellaio): pulsanti dorati sul panno
  const gratuite = mosse.filter((m) => gruppoMossa(m) === "gratis");

  // Fine turno
  const puoChiudere = mosse.some((m) => m.tipo === "fineTurno");
  const conScheletro = mosse.some((m) => m.tipo === "fineTurno" && m.cambiaMano);
  const eccesso = Math.max(0, v.mano.length - v.limiteMano);
  const scegliScarti = puoChiudere && eccesso > 0;
  const scartiPronti = daScartare.length === eccesso;
  const alternaScarto = (id: string) => () =>
    setDaScartare((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < eccesso ? [...s, id] : s));
  const chiudiTurno = (cambiaMano: boolean) => gioca({ tipo: "fineTurno", scarta: daScartare, cambiaMano });

  // Attivazioni
  const proposteAttivazione = (idCarta: string) =>
    mosse.filter((m): m is Extract<Mossa, { tipo: "attiva" }> => m.tipo === "attiva" && m.carta === idCarta);
  const apriAttivazione = (c: CartaPersonaggio) => (proposteAttivazione(c.id).length > 0 ? () => setDaAttivare(c.id) : undefined);
  const cartaDaAttivare = daAttivare
    ? Object.values(v.giocatori)
        .flatMap((g) => g.posti)
        .find((c) => c.id === daAttivare)
    : undefined;

  const attesa = mioTurno ? v.turno.attesa : null;
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

  // Popup di fine mosse: prima il fulmine, poi Biancaneve
  const scambioDue = mosse.find((m) => m.tipo === "dueInDiamante");
  const giocaFulmine = mosse.find((m) => m.tipo === "giocaFulmine");
  const mosseFinite = mioTurno && v.turno.mosseRimaste === 0 && !attesa;
  const popupFulmine = !!giocaFulmine && mosseFinite && fulmineNo !== v.numeroTurno;
  const popupBiancaneve = !popupFulmine && !!scambioDue && mosseFinite && biancaneveNo !== v.numeroTurno;
  const quantiDue = v.mano.filter((c) => c.valore === 2).length;
  const chiudiSeNienteAltro = (restaBiancaneve: boolean) => {
    if (puoChiudere && eccesso === 0 && !conScheletro && !restaBiancaneve) chiudiTurno(false);
  };
  const nessunPannello = !cartaDaAttivare && !primoPiano && !codaAttivazioni[0] && !foglio;

  // Registro: ultime 3 o le ultime 3 di ogni giocatore
  const eventi = v.registro.filter(significativo);

  // Carte del panno: grandi quanto lo spazio libero tra le due barre fisse (e la larghezza dello schermo)
  const larghezzaPosto = grande ? 92 : largo ? 72 : basso ? 46 : 58;
  const baseNumero = grande ? 120 : largo ? 64 : 52;
  const basePersonaggio = grande ? 250 : largo ? 140 : 112;
  const larghezzaPanno = Math.min(finestra.larghezza, grande ? 1152 : largo ? 672 : 448) - 24 - 24;
  const spazioPanno = finestra.altezza - altezzaAlta - altezzaBassa - 16;
  const fisso = 24 + 10 + (basso ? 0 : 22) + (gratuite.length > 0 ? 34 : 0) + (v.primoPersonaggio ? 100 : 0);
  const rapporto = basePersonaggio / baseNumero;
  const larghezzaNumero = limita(Math.min((spazioPanno - fisso) / altezzaDi(1 + rapporto), (larghezzaPanno - 80) / 5), 34, baseNumero);
  const larghezzaPersonaggio = limita(
    Math.min((spazioPanno - fisso - altezzaDi(larghezzaNumero)) / altezzaDi(1), (larghezzaPanno - larghezzaNumero - 34) / 2),
    56,
    basePersonaggio,
  );
  const bruciaOra = bruciaGratis ?? brucia;

  return (
    <>
      {/* ---------------- barra in alto ---------------- */}
      <div ref={barraAlta} className="fixed inset-x-0 top-0 z-30 border-b-2 border-oro/60 bg-notte/90 shadow-[0_6px_20px_rgba(0,0,0,0.5)] backdrop-blur">
        <div className={`mx-auto max-w-md px-3 pt-2 pb-2 md:max-w-2xl ${grande ? "flex !max-w-6xl items-center gap-3" : ""}`}>
          <div className={grande ? "w-[24rem] shrink-0" : ""}>
          <div className="flex items-center gap-1.5">
            <div
              className={`min-w-0 flex-1 truncate rounded-full px-3 py-1 font-titolo text-sm font-bold ${
                v.finita
                  ? "bg-oro text-[#2b1a05]"
                  : mioTurno
                    ? "bg-gradient-to-r from-[#e3c06a] to-[#b8892b] text-[#2b1a05]"
                    : "border border-oro/40 text-luce"
              }`}
            >
              {v.finita
                ? "Partita finita"
                : mioTurno
                  ? `Tocca a te · ${v.turno.mosseRimaste} ${v.turno.mosseRimaste === 1 ? "mossa" : "mosse"}`
                  : `Tocca ${aPersona(nick(v.turno.giocatore))}…`}
            </div>
            {v.ultimoTurno !== null && !v.finita && <span className="rounded-full bg-rosso px-2 py-1 text-[10px] font-bold text-white">Ultimo giro</span>}
            <BottoneIcona etichetta="Tavolo: tutti i giocatori" onClick={() => setFoglio("tavolo")}>
              <Users size={17} />
            </BottoneIcona>
            <BottoneIcona etichetta="Ultime mosse" onClick={() => setFoglio("storico")}>
              <ScrollText size={17} />
            </BottoneIcona>
            <BottoneIcona etichetta="Come si gioca" onClick={() => setFoglio("regole")}>
              <BookOpen size={17} />
            </BottoneIcona>
            <BottoneIcona etichetta={suoni ? "Spegni i suoni" : "Accendi i suoni"} onClick={() => impostaSuoni(!suoni)}>
              {suoni ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </BottoneIcona>
            <BottoneTema />
          </div>
          {suggerimento && <p className="mt-1 text-xs font-semibold text-oro-chiaro">{suggerimento}</p>}
          </div>

          {/* barra dell'avversario mostrato: frecce (o swipe) per vedere gli altri */}
          <div
            className={`flex items-center gap-1 rounded-xl bg-white/5 p-1 ${grande ? "min-w-0 flex-1" : "mt-1.5"}`}
            onTouchStart={(e) => {
              inizioSwipe.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const inizio = inizioSwipe.current;
              const fine = e.changedTouches[0]?.clientX;
              inizioSwipe.current = null;
              if (inizio === null || fine === undefined || avversari.length < 2) return;
              if (fine - inizio < -40) scorri(1);
              else if (fine - inizio > 40) scorri(-1);
            }}
          >
            {avversari.length > 1 && (
              <Freccia etichetta="Avversario precedente" onClick={() => scorri(-1)}>
                <ChevronLeft size={18} />
              </Freccia>
            )}
            <div className="flex shrink-0 gap-1">
              {v.giocatori[mostrato]!.posti.map((c) => (
                <CartaPersonaggioGrafica
                  key={c.id}
                  id={c.personaggio}
                  larghezza={larghezzaPosto}
                  compatta
                  onTocca={apriAttivazione(c)}
                  onIngrandisci={ingrandisci(c)}
                  disabilitata={bloccato}
                />
              ))}
              {Array.from({ length: Math.max(0, 2 - v.giocatori[mostrato]!.posti.length) }, (_, i) => (
                <PostoVuoto key={i} larghezza={larghezzaPosto} />
              ))}
            </div>
            <div className="min-w-0 flex-1 pl-1 text-xs text-luce">
              <p className="truncate font-titolo text-sm font-bold text-oro-chiaro">{nick(mostrato)}</p>
              <p className="text-luce/80">
                {v.giocatori[mostrato]!.attivati.length} attivati · {v.giocatori[mostrato]!.carteInMano} in mano
              </p>
              {mostrato === v.turno.giocatore && !v.finita && <p className="font-bold text-oro-chiaro">sta giocando</p>}
              <Diamanti diamanti={v.giocatori[mostrato]!.diamanti} />
              <PoteriBlu v={v} io={mostrato} mosse={[]} gioca={gioca} bloccato={bloccato} ingrandisci={ingrandisci} avversario />
              {avversari.length > 1 && (
                <div className="mt-0.5 flex gap-1" aria-hidden="true">
                  {avversari.map((id) => (
                    <span
                      key={id}
                      className={`h-1.5 rounded-full transition-all ${
                        id === mostrato ? "w-4 bg-oro-chiaro" : id === v.turno.giocatore && !v.finita ? "w-1.5 bg-oro" : "w-1.5 bg-luce/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <AvatarPunti
              id={avatarDi(mostrato)}
              punti={v.giocatori[mostrato]!.punti}
              traguardo={traguardo}
              diTurno={mostrato === v.turno.giocatore && !v.finita}
              carteInMano={v.giocatori[mostrato]!.carteInMano}
              dimensione={grande ? 64 : basso ? 42 : 48}
              titolo={nick(mostrato)}
            />
            {avversari.length > 1 && (
              <Freccia etichetta="Avversario successivo" onClick={() => scorri(1)}>
                <ChevronRight size={18} />
              </Freccia>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- centro: il panno ---------------- */}
      <div className="relative space-y-3" style={{ paddingTop: altezzaAlta + 8, paddingBottom: altezzaBassa + 8 }}>
        {fumetto && (
          <div key={fumetto.chiave} className="fumetto pointer-events-none absolute inset-x-0 z-20 flex justify-center" style={{ top: altezzaAlta + 4 }}>
            <span className="rounded-full border border-oro/60 bg-notte/95 px-3 py-1 text-xs font-semibold text-luce shadow-lg">
              💬 {fumetto.testo}
            </span>
          </div>
        )}
        <Errore testo={errore} />
        {v.finita && <Esito partita={partita} v={v} nick={nick} io={io} />}

        <section className={`panno rounded-3xl p-3 ${mioTurno ? "mio-turno" : ""}`}>
          <div className="flex items-end justify-center gap-1.5">
            <div data-tavolo="mazzo-numeri">
              <DorsoMazzo
                nome="Numeri"
                mazzo="numeri"
                quante={v.mazzi.numeri}
                larghezza={larghezzaNumero + 2}
                onTocca={seValida((m) => m.tipo === "pescaNumero")}
                disabilitata={bloccato}
              />
            </div>
            <span className="mx-1 self-stretch border-l border-dashed border-white/20" />
            {v.tavolo.numeri.map((c, i) => (
              <div key={c?.id ?? `n${i}`} data-tavolo={`n${i}`}>
                {c ? (
                  <CartaNumeroGrafica
                    valore={c.valore}
                    frecce={c.frecce}
                    larghezza={larghezzaNumero}
                    onTocca={seValida((m) => m.tipo === "prendiNumero" && m.posizione === i)}
                    disabilitata={bloccato}
                  />
                ) : (
                  <PostoVuoto larghezza={larghezzaNumero} />
                )}
              </div>
            ))}
            <BottoneBrucia onClick={bruciaOra} gratis={!!bruciaGratis} disabilitata={bloccato} />
          </div>
          {gratuite.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {gratuite.map((m) => (
                <ChipAzione key={JSON.stringify(m)} onClick={() => gioca(m)} disabilitata={bloccato}>
                  {descriviMossa(m, v, carte, nick)}
                </ChipAzione>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <div data-tavolo="mazzo-personaggi">
              <DorsoMazzo
                nome="Personaggi"
                mazzo="personaggi"
                quante={v.mazzi.personaggi}
                larghezza={larghezzaNumero + 2}
                onTocca={seValida((m) => m.tipo === "pescaPersonaggio")}
                disabilitata={bloccato}
              />
            </div>
            <span className="mx-1 self-stretch border-l border-dashed border-white/20" />
            {v.tavolo.personaggi.map((c, i) => (
              <div key={c?.id ?? `p${i}`} data-tavolo={`p${i}`}>
                {c ? (
                  <CartaPersonaggioGrafica
                    id={c.personaggio}
                    larghezza={larghezzaPersonaggio}
                    onTocca={(() => {
                      // Prima si vede la carta in grande, poi si conferma: un tocco per sbaglio non la prende
                      const prendi = seValida((m) => m.tipo === "prendiPersonaggio" && m.posizione === i);
                      return prendi ? () => setPrimoPiano({ carta: { tipo: "personaggio", id: c.personaggio }, azione: prendi }) : undefined;
                    })()}
                    onIngrandisci={ingrandisci(c)}
                    disabilitata={bloccato}
                  />
                ) : (
                  <PostoVuoto larghezza={larghezzaPersonaggio} />
                )}
              </div>
            ))}
          </div>
          <p className={`mt-2 text-center text-[11px] text-white/60 ${basso ? "hidden" : ""}`}>Diamanti nel mazzo: {v.mazzi.diamanti} · arrivano solo dai poteri</p>

          {v.primoPersonaggio && (
            <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-black/25 p-2">
              <span className="text-xs font-bold text-[#f2d58a]">🔮 Il Mago vede in cima al mazzo:</span>
              <CartaPersonaggioGrafica id={v.primoPersonaggio.personaggio} larghezza={64} compatta onIngrandisci={ingrandisci(v.primoPersonaggio)} />
            </div>
          )}

          {v.manoAvversario && v.turno.attesa?.tipo === "fatina" && (
            <div className="mt-3 rounded-xl bg-black/25 p-2">
              <p className="mb-1 text-center text-xs font-bold text-[#f2d58a]">🧚 Mano di {nick(v.turno.attesa.avversario)}: tocca la carta da prendere</p>
              <div className="flex flex-wrap justify-center gap-2">
                {v.manoAvversario.map((c) => (
                  <CartaNumeroGrafica
                    key={c.id}
                    valore={c.valore}
                    larghezza={56}
                    onTocca={seValida((m) => m.tipo === "prendiDaFatina" && m.carta === c.id)}
                    disabilitata={bloccato}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ---------------- barra in basso ---------------- */}
      <BarraMieCarte
        rif={barraBassa}
        basso={basso}
        grande={grande}
        avatarId={avatarDi(io)}
        traguardo={traguardo}
        largo={largo}
        v={v}
        io={io}
        mosse={mosse}
        gioca={gioca}
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
          attesa?.tipo === "scartaPersonaggio" ? seValida((m) => m.tipo === "scartaPersonaggio" && m.carta === c.id) : apriAttivazione(c)
        }
        ingrandisci={ingrandisci}
      />

      {/* ---------------- pannelli ---------------- */}
      {foglio === "tavolo" && (
        <PanoramicaTavolo v={v} io={io} nick={nick} avatarDi={avatarDi} ingrandisci={ingrandisci} onChiudi={() => setFoglio(null)} />
      )}
      {foglio === "storico" && (
        <Foglio titolo="📜 Ultime mosse" onChiudi={() => setFoglio(null)}>
          {eventi.length === 0 && <p className="text-sm text-tenue">Ancora nessuna mossa.</p>}
          {!registroAperto ? (
            <ol className="space-y-1 text-sm">
              {[...eventi]
                .reverse()
                .slice(0, 3)
                .map((e, i) => (
                  <li key={e.n} className={i === 0 ? "font-semibold" : "text-tenue"}>
                    {descriviEvento(e, nick, io)}
                  </li>
                ))}
            </ol>
          ) : (
            <div className="space-y-3">
              {v.ordine.map((id) => {
                const suoi = [...eventi].reverse().filter((e) => e.giocatore === id).slice(0, 3);
                return (
                  <div key={id}>
                    <p className="font-titolo text-sm font-bold">{id === io ? "Tu" : nick(id)}</p>
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
            <button type="button" onClick={() => setRegistroAperto((x) => !x)} className="mt-3 text-sm font-semibold text-blu underline">
              {registroAperto ? "Mostra meno" : "Le ultime 3 di ogni giocatore"}
            </button>
          )}
        </Foglio>
      )}
      {foglio === "regole" && (
        <Foglio titolo="📖 Come si gioca" onChiudi={() => setFoglio(null)}>
          <TestoRegole />
        </Foglio>
      )}

      {popupFulmine && nessunPannello && (
        <Foglio titolo="⚡ Hai un fulmine">
          <p className="text-sm">Hai finito le mosse. Vuoi usare il fulmine per fare una mossa in più?</p>
          <div className="my-3 flex justify-center">
            <span className="gettone fulmine" style={{ width: "3.2em", height: "3.2em", fontSize: "1.4rem" }}>
              ⚡
            </span>
          </div>
          <Scelte
            no="No, chiudi il turno"
            si="Sì, usalo"
            disabilitato={bloccato}
            onNo={() => {
              setFulmineNo(v.numeroTurno);
              chiudiSeNienteAltro(!!scambioDue && biancaneveNo !== v.numeroTurno);
            }}
            onSi={() => giocaFulmine && gioca(giocaFulmine)}
          />
        </Foglio>
      )}
      {popupBiancaneve && nessunPannello && (
        <Foglio titolo="🍎 Biancaneve">
          <p className="text-sm">
            {quantiDue === 1
              ? "Hai un 2 in mano: vuoi scambiarlo con un diamante pescato dal mazzo?"
              : `Hai ${quantiDue} carte 2 in mano: vuoi scambiarne una con un diamante pescato dal mazzo?`}
          </p>
          <div className="my-3 flex justify-center">
            <CartaNumeroGrafica valore={2} larghezza={70} />
          </div>
          <Scelte
            no="No"
            si="Sì, scambia"
            disabilitato={bloccato}
            onNo={() => {
              setBiancaneveNo(v.numeroTurno);
              chiudiSeNienteAltro(false);
            }}
            onSi={() => scambioDue && gioca(scambioDue)}
          />
        </Foglio>
      )}

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

      {codaAttivazioni[0] && (
        <AnimazioneAttivazione
          key={codaAttivazioni[0].n}
          evento={codaAttivazioni[0]}
          nick={nick}
          io={io}
          onFine={() => setCodaAttivazioni((c) => c.slice(1))}
        />
      )}

      {banner && !codaAttivazioni[0] && (
        <div key={banner} className="banner-turno">
          <div className="rounded-2xl border-2 border-oro bg-gradient-to-b from-[#1f3f73] to-notte px-8 py-4 text-center shadow-[0_0_40px_rgba(242,213,138,0.5)]">
            <p className="font-titolo text-3xl font-bold text-oro-chiaro">Tocca a te!</p>
            <p className="text-sm text-luce">{v.turno.mosseRimaste} mosse</p>
          </div>
        </div>
      )}

      {primoPiano && (
        <PrimoPiano
          carta={primoPiano.carta}
          titolo={primoPiano.titolo}
          // carta toccata: si possono sfogliare tutti i personaggi; carta appena pescata o da prendere: solo quella
          elenco={primoPiano.titolo || primoPiano.azione ? undefined : TUTTI_I_PERSONAGGI}
          azione={primoPiano.azione && { testo: "Prendi questa carta", onClick: primoPiano.azione, disabilitata: bloccato }}
          onChiudi={() => setPrimoPiano(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pezzi grafici                                                       */
/* ------------------------------------------------------------------ */

function BottoneIcona({ etichetta, onClick, children }: { etichetta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etichetta}
      title={etichetta}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-oro/50 text-oro-chiaro transition hover:bg-oro/15"
    >
      {children}
    </button>
  );
}

/** Freccia per passare a un altro avversario. */
function Freccia({ etichetta, onClick, children }: { etichetta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etichetta}
      title={etichetta}
      className="grid h-10 w-6 shrink-0 place-items-center rounded-lg text-oro-chiaro transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

/** Fuoco accanto alle carte numero: brucia le 4 carte (con la Bacchetta, gratis). Spento quando non si può. */
function BottoneBrucia({ onClick, gratis, disabilitata }: { onClick?: () => void; gratis: boolean; disabilitata: boolean }) {
  const etichetta = gratis ? "Brucia le 4 carte gratis (Bacchetta magica)" : "Brucia le 4 carte (costa 1 mossa)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabilitata}
      aria-label={etichetta}
      title={etichetta}
      className={`relative ml-0.5 grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border-2 transition ${
        onClick
          ? "border-[#ffd27a] bg-gradient-to-b from-[#ff9a3c] to-[#c2410c] text-white shadow-[0_0_12px_rgba(255,140,40,0.7)] hover:brightness-110 disabled:opacity-50"
          : "border-white/20 bg-black/20 text-white/30"
      }`}
    >
      <Flame size={18} />
      {gratis && (
        <span className="absolute -top-1.5 -right-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-oro text-[#2b1a05]">
          <Wand2 size={11} />
        </span>
      )}
    </button>
  );
}

function ChipAzione({ onClick, disabilitata, children }: { onClick: () => void; disabilitata: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabilitata}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-oro bg-notte/80 px-3 py-1 text-xs font-semibold text-oro-chiaro shadow transition hover:bg-notte disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Pannello che sale dal basso. Senza onChiudi non si chiude toccando fuori (serve una risposta). */
function Foglio({ titolo, onChiudi, children }: { titolo: string; onChiudi?: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!onChiudi) return;
    const tasto = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [onChiudi]);
  return (
    <div className="foglio-velo" role="dialog" aria-modal="true" aria-label={titolo} onClick={onChiudi}>
      <div className="foglio" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-titolo text-lg font-bold">{titolo}</h2>
          {onChiudi && (
            <button type="button" onClick={onChiudi} className="rounded-xl bg-inchiostro px-3 py-1.5 text-sm font-semibold text-carta">
              Chiudi
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Scelte({
  no,
  si,
  onNo,
  onSi,
  disabilitato,
}: {
  no: string;
  si: string;
  onNo: () => void;
  onSi: () => void;
  disabilitato: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" disabled={disabilitato} onClick={onNo} className="rounded-xl border-2 border-inchiostro/70 px-4 py-3 font-semibold disabled:opacity-40">
        {no}
      </button>
      <button
        type="button"
        disabled={disabilitato}
        onClick={onSi}
        className="rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-4 py-3 font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518] disabled:opacity-40"
      >
        {si}
      </button>
    </div>
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
        {vincitori.length > 1 ? `Pareggio tra ${vincitori.map(nick).join(" e ")}` : hoVinto ? "Hai vinto! 🎉" : `Ha vinto ${nick(vincitori[0] ?? "")}`}
      </p>
      <ol className="space-y-1">
        {classifica.map((id, i) => (
          <li key={id} className="flex justify-between">
            <span>
              {i + 1}. {nick(id)} {id === io && <span className="text-tenue">(tu)</span>}
            </span>
            <strong>
              {punti[id] ?? 0} {punti[id] === 1 ? "punto" : "punti"}
            </strong>
          </li>
        ))}
      </ol>
    </Riquadro>
  );
}

/**
 * Barra fissa in basso:
 * 1) i miei personaggi da attivare, i miei poteri blu, il mio avatar con i punti;
 * 2) la mia mano a ventaglio, sempre tutta visibile;
 * 3) diamanti e chiusura del turno.
 */
function BarraMieCarte({
  rif,
  basso,
  grande,
  avatarId,
  traguardo,
  largo,
  v,
  io,
  mosse,
  gioca,
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
  basso: boolean;
  grande: boolean;
  avatarId?: string;
  traguardo: number;
  largo: boolean;
  v: VistaGiocatore;
  io: string;
  mosse: Mossa[];
  gioca: (m: Mossa) => void;
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
  const [dueDaScambiare, setDueDaScambiare] = useState<string | null>(null);
  const biancaneve = mosse.some((m) => m.tipo === "dueInDiamante");
  const mioTurno = v.turno.giocatore === io && !v.finita;
  const larghezzaPosto = grande ? 104 : largo ? 84 : basso ? 56 : 70;

  const avatar = (
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 text-center text-[10px] font-semibold text-luce/80">
      <AvatarPunti id={avatarId} punti={mio.punti} traguardo={traguardo} diTurno={mioTurno} dimensione={grande ? 60 : basso ? 40 : 46} titolo="Tu" />
      <span className="mt-1">
        Mano {v.mano.length}/{v.limiteMano}
      </span>
    </div>
  );

  return (
    <div ref={rif} className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-oro/60 bg-notte/92 shadow-[0_-8px_24px_rgba(0,0,0,0.55)] backdrop-blur">
      <div
        className={`mx-auto max-w-md px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] md:max-w-2xl ${grande ? "flex !max-w-6xl items-center gap-4" : ""}`}
      >
        <div className={grande ? "flex shrink-0 items-center gap-3" : "flex items-start gap-2"}>
          <div className="flex shrink-0 gap-1.5">
            {mio.posti.map((c) => {
              const tocca = toccaPosto(c);
              return (
                <div key={c.id} data-carta-id={c.id} className="relative">
                  <CartaPersonaggioGrafica
                    id={c.personaggio}
                    larghezza={larghezzaPosto}
                    compatta
                    onTocca={tocca}
                    onIngrandisci={ingrandisci(c)}
                    disabilitata={bloccato}
                  />
                  {tocca && (
                    <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-oro px-1.5 text-[10px] font-bold text-[#2b1a05] shadow">
                      ✓ attiva
                    </span>
                  )}
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, 2 - mio.posti.length) }, (_, i) => (
              <PostoVuoto key={i} larghezza={larghezzaPosto} />
            ))}
          </div>
          <div className={grande ? "w-44" : "contents"}>
            <PoteriBlu v={v} io={io} mosse={mosse} gioca={gioca} bloccato={bloccato} ingrandisci={ingrandisci} />
          </div>
          {!grande && avatar}
        </div>

        <div className={grande ? "min-w-0 flex-1" : ""}>
        <Ventaglio
          v={v}
          largo={largo}
          basso={basso}
          grande={grande}
          daScartare={daScartare}
          bloccato={bloccato}
          tocca={(id, valore) =>
            scegliScarti ? alternaScarto(id) : biancaneve && valore === 2 ? () => setDueDaScambiare(id) : undefined
          }
          mela={(valore) => biancaneve && valore === 2 && !scegliScarti}
        />

        {mio.diamanti.length > 0 && (
          <div className="flex items-center justify-center text-xs">
            <Diamanti diamanti={mio.diamanti} />
          </div>
        )}
        </div>

        <div className={grande ? "flex w-56 shrink-0 flex-col items-stretch gap-2" : ""}>
          {grande && <div className="flex justify-center">{avatar}</div>}
        {puoChiudere && (
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              disabled={bloccato || !scartiPronti}
              onClick={() => chiudiTurno(false)}
              className={`flex-1 rounded-xl bg-gradient-to-b from-[#e3c06a] to-[#b8892b] px-3 ${basso ? "py-1.5" : "py-2.5"} text-sm font-semibold text-[#2b1a05] shadow-[0_3px_0_#7a5518] disabled:opacity-40`}
            >
              {eccesso > 0 ? `Scarta ${eccesso} (${daScartare.length}/${eccesso}) e chiudi` : "Chiudi il turno"}
            </button>
            {conScheletro && (
              <button
                type="button"
                disabled={bloccato || !scartiPronti}
                onClick={() => chiudiTurno(true)}
                className="rounded-xl border-2 border-oro px-3 py-2.5 text-sm font-semibold text-oro-chiaro disabled:opacity-40"
              >
                💀 Chiudi e cambia mano
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {dueDaScambiare && (
        <Foglio titolo="🍎 Biancaneve" onChiudi={() => setDueDaScambiare(null)}>
          <p className="text-sm">Scambiare questo 2 con un diamante pescato dal mazzo? Non costa mosse.</p>
          <div className="my-3 flex justify-center">
            <CartaNumeroGrafica valore={2} larghezza={70} />
          </div>
          <Scelte
            no="No"
            si="Sì, scambia"
            disabilitato={bloccato}
            onNo={() => setDueDaScambiare(null)}
            onSi={() => {
              gioca({ tipo: "dueInDiamante", carta: dueDaScambiare });
              setDueDaScambiare(null);
            }}
          />
        </Foglio>
      )}
    </div>
  );
}

/** La mano a ventaglio: carte sovrapposte e inclinate, sempre tutte visibili nella larghezza disponibile. */
function Ventaglio({
  v,
  largo,
  basso,
  grande,
  daScartare,
  bloccato,
  tocca,
  mela,
}: {
  v: VistaGiocatore;
  largo: boolean;
  basso: boolean;
  grande: boolean;
  daScartare: string[];
  bloccato: boolean;
  tocca: (id: string, valore: number) => (() => void) | undefined;
  mela: (valore: number) => boolean;
}) {
  const contenitore = useRef<HTMLDivElement>(null);
  const spazio = useLarghezza(contenitore);
  const mano = [...v.mano].sort((a, b) => a.valore - b.valore);
  const larghezzaCarta = grande ? 96 : largo ? 74 : basso ? 50 : 58;
  const altezzaCarta = Math.round((larghezzaCarta * 88) / 63);
  const n = mano.length;
  const passo = n > 1 ? Math.min(larghezzaCarta + 6, (Math.max(spazio, larghezzaCarta) - larghezzaCarta - 8) / (n - 1)) : 0;
  const totale = larghezzaCarta + passo * Math.max(0, n - 1);
  const inizio = (spazio - totale) / 2;
  // ventaglio delicato: la carta centrale è dritta, le altre si inclinano poco (al massimo 7° le estreme)
  const angolo = n > 1 ? Math.min(2.5, 14 / (n - 1)) : 0;
  const centro = (n - 1) / 2;

  return (
    <div ref={contenitore} className="ventaglio relative mt-2" style={{ height: altezzaCarta + (basso ? 14 : 22) }}>
      {n === 0 && <p className="pt-6 text-center text-xs text-luce/70">Nessuna carta in mano</p>}
      {mano.map((c, i) => {
        const scelta = daScartare.includes(c.id);
        return (
          <div
            key={c.id}
            className="ventaglio-carta absolute bottom-1"
            style={
              {
                left: inizio + i * passo,
                zIndex: i + 1,
                "--r": `${(i - centro) * angolo}deg`,
                "--y": `${Math.abs(i - centro) ** 2 * 0.6 - (scelta ? 14 : 0)}px`,
              } as CSSProperties
            }
          >
            <div data-carta-id={c.id}>
              <CartaNumeroGrafica
                valore={c.valore}
                frecce={c.frecce}
                larghezza={larghezzaCarta}
                selezionata={scelta}
                onTocca={tocca(c.id, c.valore)}
                disabilitata={bloccato}
              />
            </div>
            {mela(c.valore) && (
              <span className="pointer-events-none absolute -top-2 -right-1 text-base" aria-hidden="true">
                🍎
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** I miei poteri blu attivi: chi si può usare adesso è evidenziato e si tocca; gli altri mostrano la carta. */
/** Poteri blu di un giocatore: i miei (con le azioni che posso usare) o quelli di un avversario (solo da guardare). */
function PoteriBlu({
  v,
  io,
  mosse,
  gioca,
  bloccato,
  ingrandisci,
  avversario,
}: {
  v: VistaGiocatore;
  io: string;
  mosse: Mossa[];
  gioca: (m: Mossa) => void;
  bloccato: boolean;
  ingrandisci: (c: CartaPersonaggio) => () => void;
  /** poteri di un avversario: niente titolo, niente segnaposto, niente azioni */
  avversario?: boolean;
}) {
  const poteri = v.giocatori[io]!.attivati.flatMap((c) =>
    personaggio(c.personaggio)
      .poteri.filter((x) => x.colore === "blu")
      .map((x) => ({ carta: c, effetto: x.effetto })),
  );
  if (poteri.length === 0) {
    if (avversario) return null;
    return <p className="min-w-0 flex-1 self-center text-[11px] leading-tight text-luce/60">Qui compariranno i poteri blu dei personaggi che attivi.</p>;
  }
  return (
    <div className={avversario ? "mt-0.5" : "min-w-0 flex-1"}>
      {!avversario && <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-oro">Poteri</p>}
      <div className="flex flex-wrap items-center gap-1">
        {/* prima le mini carte blu di Nani, Fenice e Drago, poi gli altri poteri */}
        {poteri.map(({ carta, effetto }, i) =>
          effetto.tipo === "cartaVirtuale" ? (
            <MiniCartaVirtuale
              key={`${carta.id}-${i}`}
              valore={effetto.valore}
              usata={!avversario && v.turno.virtualiUsate.includes(carta.id)}
              titolo={personaggio(carta.personaggio).nome}
              onTocca={ingrandisci(carta)}
            />
          ) : null,
        )}
        {poteri.map(({ carta, effetto }, i) => {
          if (effetto.tipo === "cartaVirtuale") return null;
          const { icona, testo } = etichettaPotere(effetto);
          const azione =
            effetto.tipo === "bruciaGratis"
              ? mosse.find((m) => m.tipo === "bruciaGratis")
              : effetto.tipo === "dueInDiamante"
                ? mosse.find((m) => m.tipo === "dueInDiamante")
                : undefined;
          return (
            <button
              key={`${carta.id}-${i}`}
              type="button"
              disabled={bloccato && !!azione}
              onClick={azione ? () => gioca(azione) : ingrandisci(carta)}
              title={personaggio(carta.personaggio).nome}
              className={`rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-tight ${
                azione
                  ? "border-oro bg-gradient-to-b from-[#e3c06a] to-[#b8892b] text-[#2b1a05] shadow"
                  : "border-oro/40 bg-white/10 text-luce"
              }`}
            >
              {icona} {testo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
