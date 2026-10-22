/**
 * Schermo "tavolo" (e spettatori): la partita vista da fuori, pensata per un tablet o una TV al centro del tavolo.
 * Mostra solo le informazioni pubbliche: panno con mazzi e carte scoperte, tutti i giocatori con punti,
 * posti, poteri e quante carte hanno in mano, l'ultima mossa, le attivazioni animate e i vocali.
 * Non ha comandi di gioco. Lo schermo resta acceso finché la pagina è aperta.
 */
import { type CartaPersonaggio, type Evento, type VistaGiocatore } from "@og/primo-gioco";
import { Eye, Volume2, VolumeX } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { impostaSuoni, suonoPerAzione, useSuoniAttivi } from "../../lib/suoni";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVistaPubblica } from "../../lib/useVistaPubblica";
import { BottoneTema, Caricamento, Errore, Riquadro } from "../../ui";
import { AnimazioneAttivazione } from "./AnimazioneAttivazione";
import { CartaNumeroGrafica, CartaPersonaggioGrafica, DorsoMazzo, PostoVuoto } from "./carte";
import { aPersona, descriviEvento } from "./descrivi";
import { SchedaGiocatore } from "./PanoramicaTavolo";
import { type CartaDaMostrare, PrimoPiano } from "./PrimoPiano";
import { AvvisoVocale } from "./Vocali";

type Attivazione = Extract<Evento, { tipo: "attiva" }>;
const significativo = (e: Evento) => !(e.tipo === "fineTurno" && e.scartate === 0 && !e.cambiaMano);

function useDimensioni(ref: RefObject<HTMLElement>) {
  const [d, setD] = useState({ larghezza: 0, altezza: window.innerHeight });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const leggi = () => setD({ larghezza: el.clientWidth, altezza: window.innerHeight });
    const osserva = new ResizeObserver(leggi);
    osserva.observe(el);
    window.addEventListener("resize", leggi);
    leggi();
    return () => {
      osserva.disconnect();
      window.removeEventListener("resize", leggi);
    };
  });
  return d;
}

/** Tiene acceso lo schermo (dove il browser lo permette). */
function useSchermoAcceso() {
  useEffect(() => {
    let blocco: { release(): Promise<void> } | null = null;
    const richiedi = async () => {
      try {
        // biome-ignore lint: Wake Lock non è ancora nei tipi di tutti i browser
        blocco = await (navigator as any).wakeLock?.request("screen");
      } catch {
        // non disponibile: pazienza
      }
    };
    const visibile = () => document.visibilityState === "visible" && richiedi();
    richiedi();
    document.addEventListener("visibilitychange", visibile);
    return () => {
      document.removeEventListener("visibilitychange", visibile);
      void blocco?.release();
    };
  }, []);
}

export function TavoloSpettatore({ partita, giocatori }: { partita: Partita; giocatori: GiocatorePartita[] }) {
  const { riga, errore } = useVistaPubblica<VistaGiocatore>(partita.id);
  const [primoPiano, setPrimoPiano] = useState<CartaDaMostrare | null>(null);
  const [fumetto, setFumetto] = useState<{ testo: string; chiave: number } | null>(null);
  const [coda, setCoda] = useState<Attivazione[]>([]);
  const suoni = useSuoniAttivi();
  const pannoRef = useRef<HTMLDivElement>(null);
  const { larghezza, altezza } = useDimensioni(pannoRef);
  useSchermoAcceso();

  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => m.get(id) ?? "?";
  }, [giocatori]);
  const avatarDi = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.avatar]));
    return (id: string) => m.get(id);
  }, [giocatori]);

  // Nuovi eventi: suono, fumetto con l'ultima mossa, animazione delle attivazioni
  const ultimo = useRef<number | null>(null);
  useEffect(() => {
    if (!riga) return;
    const registro = riga.vista.registro ?? [];
    const n = registro.at(-1)?.n ?? 0;
    if (ultimo.current === null) {
      ultimo.current = n;
      return;
    }
    const nuovi = registro.filter((e) => e.n > ultimo.current!);
    ultimo.current = Math.max(ultimo.current, n);
    if (nuovi.length === 0) return;
    nuovi
      .filter((e) => e.tipo !== "attiva")
      .slice(-3)
      .forEach((e, i) => setTimeout(() => suonoPerAzione(e.tipo, e as { scartate?: number }), i * 180));
    const attivazioni = nuovi.filter((e): e is Attivazione => e.tipo === "attiva");
    if (attivazioni.length > 0) setCoda((c) => [...c, ...attivazioni]);
    const racconto = [...nuovi].reverse().find((e) => significativo(e) && e.tipo !== "attiva");
    if (racconto) setFumetto({ testo: descriviEvento(racconto, nick, ""), chiave: racconto.n });
  }, [riga, nick]);
  useEffect(() => {
    if (!fumetto) return;
    const t = setTimeout(() => setFumetto(null), 4500);
    return () => clearTimeout(t);
  }, [fumetto]);

  if (errore) return <Errore testo={errore} />;
  if (!riga) {
    return (
      <Riquadro titolo="👁 Schermo del tavolo">
        <p className="text-sm">Il tavolo compare alla prossima mossa. Lascia questa pagina aperta.</p>
      </Riquadro>
    );
  }

  const v = riga.vista;
  const ingrandisci = (c: CartaPersonaggio) => () => setPrimoPiano({ tipo: "personaggio", id: c.personaggio });
  const massimo = Math.max(...v.ordine.map((id) => v.giocatori[id]!.punti));
  const fineVicina =
    v.ultimoTurno !== null && !v.finita ? { turni: v.ultimoTurno - v.numeroTurno + 1, chi: v.ordine[v.ultimoTurno % v.ordine.length]! } : null;

  // Carte grandi quanto permettono il panno e l'altezza dello schermo
  const spazioAltezza = altezza - 140;
  const numero = Math.round(Math.max(44, Math.min(150, (larghezza - 120) / 5.6, spazioAltezza / (1.4 * 3.2))));
  const pers = Math.round(Math.max(90, Math.min(numero * 2.1, (larghezza - numero - 60) / 2, (spazioAltezza - numero * 1.4) / 1.4)));

  return (
    <div className="mx-auto min-h-dvh max-w-[1600px] px-3 py-3 lg:px-6">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-oro/50 px-3 py-1 text-xs font-bold text-oro-chiaro">
          <Eye size={14} /> Schermo del tavolo
        </span>
        <span
          className={`rounded-full px-4 py-1 font-titolo text-base font-bold lg:text-xl ${
            v.finita ? "bg-oro text-[#2b1a05]" : "bg-gradient-to-r from-[#e3c06a] to-[#b8892b] text-[#2b1a05]"
          }`}
        >
          {v.finita
            ? "Partita finita"
            : `Tocca ${aPersona(nick(v.turno.giocatore))} · ${v.turno.mosseRimaste} ${v.turno.mosseRimaste === 1 ? "mossa" : "mosse"}`}
        </span>
        {fineVicina && (
          <span className="rounded-full bg-rosso px-3 py-1 text-sm font-bold text-white">
            ⏳ {fineVicina.turni === 1 ? "Ultimo turno" : `Ultimi ${fineVicina.turni} turni`} · chiude {nick(fineVicina.chi)}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => impostaSuoni(!suoni)}
            aria-label={suoni ? "Spegni i suoni" : "Accendi i suoni"}
            className="grid h-8 w-8 place-items-center rounded-full border border-oro/50 text-oro-chiaro"
          >
            {suoni ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <BottoneTema />
        </span>
      </header>

      {fumetto && (
        <div key={fumetto.chiave} className="fumetto pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center px-3">
          <span className="rounded-full border-2 border-oro bg-notte/95 px-5 py-2 text-base font-semibold text-luce shadow-xl lg:text-lg">
            💬 {fumetto.testo}
          </span>
        </div>
      )}
      <AvvisoVocale partitaId={partita.id} io="" nick={nick} />

      {v.finita && partita.esito && (
        <Riquadro titolo="Partita finita!">
          <p className="font-semibold">
            {partita.esito.vincitori.length > 1
              ? `Pareggio tra ${partita.esito.vincitori.map(nick).join(" e ")}`
              : `Ha vinto ${nick(partita.esito.vincitori[0] ?? "")} 🎉`}
          </p>
        </Riquadro>
      )}

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
        <div ref={pannoRef}>
          <section className="panno rounded-3xl p-4">
            <div className="flex items-end justify-center gap-2">
              <DorsoMazzo nome="Numeri" mazzo="numeri" quante={v.mazzi.numeri} larghezza={numero + 2} />
              <span className="mx-1 self-stretch border-l border-dashed border-white/20" />
              {v.tavolo.numeri.map((c, i) =>
                c ? (
                  <CartaNumeroGrafica key={c.id} valore={c.valore} frecce={c.frecce} larghezza={numero} />
                ) : (
                  <PostoVuoto key={`n${i}`} larghezza={numero} />
                ),
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <DorsoMazzo nome="Personaggi" mazzo="personaggi" quante={v.mazzi.personaggi} larghezza={numero + 2} />
              <span className="mx-1 self-stretch border-l border-dashed border-white/20" />
              {v.tavolo.personaggi.map((c, i) =>
                c ? (
                  <CartaPersonaggioGrafica key={c.id} id={c.personaggio} larghezza={pers} onIngrandisci={ingrandisci(c)} />
                ) : (
                  <PostoVuoto key={`p${i}`} larghezza={pers} />
                ),
              )}
            </div>
            <p className="mt-3 text-center text-xs text-white/60">Diamanti nel mazzo: {v.mazzi.diamanti}</p>
          </section>
        </div>

        <div className="space-y-3 rounded-2xl border-2 border-oro bg-gradient-to-b from-[#fbf3df] to-[#f1e2bf] p-3 text-inchiostro lg:max-h-[calc(100dvh-90px)] lg:overflow-y-auto">
          {v.ordine.map((id, posizione) => (
            <SchedaGiocatore
              key={id}
              v={v}
              id={id}
              posizione={posizione}
              io=""
              nick={nick}
              avatarDi={avatarDi}
              ingrandisci={ingrandisci}
              massimo={massimo}
            />
          ))}
        </div>
      </div>

      {coda[0] && <AnimazioneAttivazione key={coda[0].n} evento={coda[0]} nick={nick} io="" onFine={() => setCoda((c) => c.slice(1))} />}
      {primoPiano && <PrimoPiano carta={primoPiano} onChiudi={() => setPrimoPiano(null)} />}
      {!riga && <Caricamento />}
    </div>
  );
}
