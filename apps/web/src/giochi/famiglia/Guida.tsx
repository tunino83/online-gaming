/** Guida della Famiglia: le regole in breve (riassunto di docs/famiglia/regolamento.md) e tutte le carte. */
import { CARTE, type Carta, EVENTI, descriviCodice, soloAiuto, tipologiaPotere } from "@og/famiglia";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CartaFamiglia, Stemma } from "./carte";

function Voce({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-titolo text-base font-bold">{titolo}</h3>
      <div className="mt-1 space-y-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/** Testo da confrontare nella ricerca: minuscolo, senza accenti né apostrofi. */
const pulito = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** La carta corrisponde alla ricerca? Si guarda il nome (persona o carta) e il nome dei poteri, poi il loro testo. */
function trovata(c: Carta, cerca: string): "nome" | "testo" | null {
  if ([c.nome, ...c.poteri.map((p) => p.nome)].some((x) => pulito(x).includes(cerca))) return "nome";
  if (c.poteri.some((p) => pulito(p.testo).includes(cerca)) || (c.nota && pulito(c.nota).includes(cerca))) return "testo";
  return null;
}

/**
 * Con `larga` (pagina delle regole e guida in partita) sul computer il testo va su 2 colonne e le carte su 2 o 3:
 * sul telefono resta tutto in colonna.
 */
export function GuidaFamiglia({ larga = false }: { larga?: boolean }) {
  const [cerca, setCerca] = useState("");
  const parole = pulito(cerca);
  return (
    <div className="space-y-4 text-inchiostro">
      <div className="sticky top-0 z-10 -mx-1 bg-[inherit] px-1 pb-1 pt-0.5">
        <input
          type="search"
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="🔎 Cerca un personaggio o un potere (es. Chicca, Grigliata)"
          aria-label="Cerca un personaggio o un potere"
          className="w-full rounded-xl border-2 border-oro/60 bg-white px-3 py-2 text-base text-inchiostro shadow-sm outline-none focus:border-oro"
        />
      </div>
      {parole ? <RisultatiRicerca cerca={parole} larga={larga} /> : <TestoGuida larga={larga} />}
    </div>
  );
}

/** Le carte che corrispondono alla ricerca: prima quelle trovate per nome, poi quelle trovate nel testo dei poteri. */
/** Elenco delle carte: sul computer, nella guida larga, su 2 o 3 colonne. */
const elencoCarte = (larga: boolean) => (larga ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3");

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

/**
 * Sul computer (guida larga) niente carosello: tutte le carte una accanto all'altra, 3 per riga
 * (così ogni adulto ha i suoi 3 livelli sulla stessa riga). Sul telefono resta il carosello.
 */
function useCarteEsposte(larga: boolean) {
  const computer = useMedia("(min-width: 768px)");
  const moltoLargo = useMedia("(min-width: 1280px)");
  return larga && computer ? { dimensione: moltoLargo ? 220 : 170 } : null;
}

/** Le carte di un gruppo: una per casella, 3 per riga (sul computer). */
function CarteEsposte({ persone, dimensione, onApri }: { persone: Carta[][]; dimensione: number; onApri: (c: Carta) => void }) {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {persone.flat().map((c) => (
        <li key={c.id}>
          <Carosello carte={[c]} dimensione={dimensione} onApri={onApri} />
        </li>
      ))}
    </ul>
  );
}

function RisultatiRicerca({ cerca, larga }: { cerca: string; larga: boolean }) {
  const [aperta, setAperta] = useState<number | null>(null);
  const esposte = useCarteEsposte(larga);
  const persone = new Map<string, { carte: Carta[]; prima: Carta; perNome: boolean }>();
  for (const c of IN_ORDINE) {
    const come = trovata(c, cerca);
    if (!come) continue;
    const gia = persone.get(c.persona);
    if (!gia) persone.set(c.persona, { carte: CARTE.filter((x) => x.persona === c.persona && x.categoria === c.categoria), prima: c, perNome: come === "nome" });
    else if (come === "nome" && !gia.perNome) persone.set(c.persona, { ...gia, prima: c, perNome: true });
  }
  const trovate = [...persone.values()].sort((a, b) => Number(b.perNome) - Number(a.perNome));
  if (trovate.length === 0) return <p className="text-sm">Nessuna carta trovata. Prova con un altro nome.</p>;
  return (
    <div>
      <p className="mb-2 text-sm">{trovate.length === 1 ? "1 carta trovata" : `${trovate.length} carte trovate`}</p>
      {esposte ? (
        <CarteEsposte persone={trovate.map((x) => x.carte)} dimensione={esposte.dimensione} onApri={(c) => setAperta(IN_ORDINE.indexOf(c))} />
      ) : (
        <ul className={elencoCarte(larga)}>
          {trovate.map((x) => (
            <li key={`${x.prima.persona}-${x.prima.id}`}>
              <Carosello carte={x.carte} iniziale={x.carte.indexOf(x.prima)} onApri={(c) => setAperta(IN_ORDINE.indexOf(c))} />
            </li>
          ))}
        </ul>
      )}
      {aperta !== null && <CartaInGrande indice={aperta} onCambia={setAperta} onChiudi={() => setAperta(null)} />}
    </div>
  );
}

function TestoGuida({ larga }: { larga: boolean }) {
  return (
    <div className={larga ? "space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-x-8 md:gap-y-5 md:space-y-0" : "space-y-4"}>
      <Voce titolo="🎯 Scopo e fine della partita">
        <p>
          Attiva i parenti e la gente del paese per fare punti, e usa i loro poteri per aiutarti, attaccare gli altri e difenderti.
        </p>
        <p>
          Di solito vince chi arriva per primo a <strong>25 punti</strong>: quando succede si finisce il giro e si gioca{" "}
          <strong>un ultimo giro</strong>, così tutti fanno lo stesso numero di turni. Poi vince chi ha più punti; a parità, pareggio.
          Chi crea la partita può scegliere invece di giocare <strong>fino alla fine del mazzo</strong> dei personaggi.
        </p>
      </Voce>

      <Voce titolo="🧺 Il tavolo">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>4 carte numero</strong> e <strong>2 personaggi</strong> scoperti, che chiunque può prendere nel suo turno. Quando
            uno viene preso, se ne scopre un altro dal mazzo.
          </li>
          <li>I mazzi coperti: carte numero (valori da 1 a 8), personaggi (con vini, scuse e carte attacco), eventi.</li>
          <li>Gli scarti, scoperti, e l'evento in corso, se c'è.</li>
          <li>Si parte senza carte; l'ordine di gioco lo sorteggia il gioco.</li>
        </ul>
      </Voce>

      <Voce titolo="🃏 Il tuo turno: 3 mosse">
        <p>A ogni turno fai 3 mosse, scegliendo tra queste (puoi anche ripetere la stessa):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Prendi</strong> una carta scoperta dal tavolo, oppure <strong>pesca</strong> la prima carta coperta di un mazzo.
          </li>
          <li>
            <strong>Brucia</strong>: le 4 carte numero del tavolo vanno negli scarti e ne escono 4 nuove.
          </li>
          <li>
            <strong>Attiva</strong> un personaggio pagando il suo codice con le carte numero (vanno negli scarti): passa tra i tuoi
            attivati, carico, e ti dà i suoi punti.
          </li>
          <li>
            <strong>Usa il potere</strong> di un tuo personaggio attivato e carico (gli attacchi anche con una carta attacco).
          </li>
          <li>
            <strong>Pesca un evento</strong>, solo se non ce n'è già uno in corso.
          </li>
        </ul>
        <p>
          Alcuni poteri sono <strong>gratis</strong>: non costano mosse (lo dice la carta). A fine turno, se hai più di{" "}
          <strong>7 carte numero</strong>, scegli quali scartare.
        </p>
      </Voce>

      <Voce titolo="🗂️ Dove stanno le tue carte">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>In mano, nascoste</strong>: le carte numero (al massimo 7 a fine turno) e fino a <strong>3</strong> personaggi di
            aiuto o di difesa, vini, Campari e scuse. Gli altri sanno quante ne hai, non quali.
          </li>
          <li>
            <strong>Attacchi in attesa, scoperti</strong>: i personaggi d'attacco non ancora attivati e le carte attacco, al massimo{" "}
            <strong>3</strong>. Tutti vedono che stai preparando un attacco.
          </li>
          <li>
            <strong>Attivati</strong>, davanti a te: ti danno punti e hanno il potere carico ⚡ o stanco 😴. Non hanno limite, tranne le
            difese (vedi sotto).
          </li>
          <li>Se una zona è piena e ti arriva una carta nuova, scegli quale delle vecchie scartare.</li>
        </ul>
      </Voce>

      <Voce titolo="🎨 Colori e livelli delle carte">
        <ul className="space-y-1">
          {(
            [
              ["attacco", "Attacco: colpisci uno o più avversari"],
              ["difesa", "Difesa: ti protegge quando ti attaccano"],
              ["aiuto", "Aiuto: un potere per te, da usare con una mossa"],
              ["blu", "Aiuto sempre attivo (∞): funziona da solo e non si stanca"],
              ["difesaUnaVolta", "Difesa usa e getta: vini, Campari, scuse"],
              ["attaccoUnaVolta", "Attacco usa e getta: Tomacella, Giro aperto, Occhi 'nguoll, Vento"],
            ] as const
          ).map(([tipo, testo]) => (
            <li key={tipo} className="flex items-center gap-2">
              <Stemma tipo={tipo} dimensione={18} />
              <span>{testo}</span>
            </li>
          ))}
        </ul>
        <p>
          Le <strong>stelle ★</strong> dicono il livello (da 1 a 3). Il livello conta per i punti, per la ricarica e negli scontri tra
          attacchi e difese.
        </p>
      </Voce>

      <Voce titolo="⭐ Punti e ricarica">
        <p>
          Ogni adulto ha 3 carte: <strong>livello 1</strong> (codice di 2 carte, 1 punto), <strong>livello 2</strong> (3 carte, 2
          punti), <strong>livello 3</strong> (4–5 carte, 3 punti, potere forte). Le carte <strong>solo aiuto</strong> (gialle e verdi)
          valgono <strong>0 punti</strong>: si attivano per usarle.
        </p>
        <p>
          🎯 <strong>+1 punto</strong> ogni volta che un tuo <strong>attacco va a segno</strong> (una volta per attacco, anche se colpisce
          più avversari) e ogni volta che una tua <strong>difesa ferma un attacco</strong>. Questi punti restano anche se poi perdi le
          carte. <strong>Famiglia al completo</strong>: le 3 carte della stessa persona attivate danno <strong>+2 punti</strong>.
        </p>
        <p>
          😴 Usato il potere, la carta <strong>si stanca</strong> per tanti turni quanto il suo livello (la ricarica è scritta sulla
          carta). All'inizio di ogni tuo turno recupera un turno; arrivata a zero è di nuovo carica. Le carte sempre attive (∞) non si
          stancano mai e ogni loro effetto vale una volta per turno.
        </p>
      </Voce>

      <Voce titolo="🔢 Codici">
        <p>
          Numeri esatti (es. 2 5), coppia, tris, poker, doppia coppia, somma (es. 3 carte che fanno 15), scala, carte tutte pari o
          tutte dispari, carte qualsiasi. Le carte usate vanno negli scarti. Una banconota della mancia vale come una carta numero.
        </p>
      </Voce>

      <Voce titolo="⚔️ Attaccare">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Usi il potere di un personaggio d'attacco attivato e carico, oppure una carta attacco usa e getta (paghi il suo codice e la
            scarti). Costa una mossa.
          </li>
          <li>
            <strong>Attacchi contro tutti</strong> (Urla, Rospe per tutti, Collezione…): colpiscono ogni avversario, uno alla volta, e
            ognuno si difende per conto suo.
          </li>
          <li>
            ⚖️ <strong>Carico</strong> (facoltativo): all'attacco puoi aggiungere carte numero della tua mano. La loro somma è il carico
            e quelle carte <strong>le perdi comunque</strong>, che l'altro si difenda o no. Più è alto, più è difficile difendersi.
          </li>
        </ul>
      </Voce>

      <Voce titolo="🛡️ Difendersi">
        <p>
          Quando ti attaccano il gioco aspetta solo te (di solito <strong>30 secondi</strong>, poi l'attacco passa). Ti difendi al
          massimo una volta per attacco, e la difesa non costa mosse. Due modi:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Con un <strong>personaggio di difesa attivato e carico</strong>: ferma l'attacco e poi si stanca. Se l'attacco ha un{" "}
            <strong>carico</strong>, devi anche scartare carte numero che fanno <strong>almeno</strong> quel valore, oppure fare{" "}
            <strong>harakiri</strong>: sacrifichi la carta di difesa (va negli scarti con i suoi punti) e l'attacco è fermato lo stesso.
          </li>
          <li>
            <strong>D'emergenza</strong>, dalla mano: un personaggio di difesa nascosto o una carta difesa (vini, Campari, scuse). Paghi
            il suo codice e la carta va negli scarti. Le difese d'emergenza <strong>non pagano il carico</strong>.
          </li>
          <li>
            <strong>Regola del livello</strong>: una difesa ferma solo attacchi del suo livello o più bassi (il Paesano solo il livello
            1, l'Aglianico fino al 2, il Taurasi tutto). Alcune carte dicono di fare eccezione.
          </li>
          <li>
            <strong>Una difesa per livello</strong>: davanti a te puoi avere attivata al massimo una difesa di livello 1, una di livello
            2 e una di livello 3. Se ne attivi un'altra dello stesso livello, prende il posto della vecchia, che va negli scarti con i
            suoi punti. Oppure la tieni in mano per l'emergenza.
          </li>
          <li>
            Alcune difese passano l'attacco a un altro giocatore (Non è colpa mia) o lo rimandano a chi l'ha fatto (E se poi te ne
            penti?): chi lo riceve, se può, si difende a sua volta (pagando anche lui il carico).
          </li>
        </ul>
      </Voce>

      <Voce titolo="🪙 Mancia dei nonni, ☕ caffè e 🔔 campanello">
        <p>
          Chi attiva un personaggio di <strong>livello 3</strong> riceve una carta dal mazzo della mancia. Una banconota vale come una
          carta numero oppure fa <strong>+1</strong> a una carta. Il caffè fa +1 a una carta oppure, bevuto, dà{" "}
          <strong>una mossa in più</strong>. La mancia è visibile a tutti e non conta nel limite della mano.
        </p>
        <p>
          Quando sul tavolo esce una carta numero con il campanello 🔔 "suonano alla porta": i 2 personaggi scoperti se ne vanno e ne
          arrivano 2 nuovi.
        </p>
      </Voce>

      <Voce titolo="🌙 Eventi">
        <p>Si pescano con una mossa e valgono subito per tutti, per i turni scritti sulla carta (un turno = il turno di un giocatore).</p>
        <ul className="list-disc space-y-1 pl-5">
          {EVENTI.map((e) => (
            <li key={e.id}>
              <strong>{e.nome}</strong> ({e.durata} {e.durata === 1 ? "turno" : "turni"}): {e.testo}
            </li>
          ))}
        </ul>
      </Voce>

      <Voce titolo="👆 Trucchi dell'app">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tocca un numero del tavolo per prenderlo, un mazzo per pescare.</li>
          <li>Tocca una carta per vederla in grande e per le mosse che puoi farci (attivarla, usare il potere…).</li>
          <li>Per attaccare con il carico: tocca la carta d'attacco, scegli le carte del carico, poi l'attacco.</li>
          <li>Il pulsante <strong>Mosse</strong> in basso elenca tutto quello che puoi fare adesso.</li>
          <li>In alto tocca un avversario per vedere le sue carte scoperte.</li>
          <li>In cima a questa guida puoi cercare un personaggio o un potere.</li>
        </ul>
      </Voce>

      <div className="md:col-span-2">
        <Voce titolo="🃏 Tutte le carte">
          <CatalogoFamiglia larga={larga} />
        </Voce>
      </div>
    </div>
  );
}

const GRUPPI: { titolo: string; filtro: (c: Carta) => boolean }[] = [
  { titolo: "Adulti (3 carte ciascuno, una per livello)", filtro: (c) => c.categoria === "personaggio" && c.id !== c.persona },
  { titolo: "Carte singole", filtro: (c) => c.categoria === "personaggio" && c.id === c.persona },
  { titolo: "Carte difesa (si usano una volta, quando ti attaccano)", filtro: (c) => c.categoria === "difesa" },
  { titolo: "Carte attacco (si usano una volta)", filtro: (c) => c.categoria === "attacco" },
];

/** Le carte di un gruppo, raccolte per persona (gli adulti hanno 3 carte, le altre una). */
function perPersona(filtro: (c: Carta) => boolean): Carta[][] {
  const persone = new Map<string, Carta[]>();
  for (const c of CARTE.filter(filtro)) persone.set(c.persona, [...(persone.get(c.persona) ?? []), c]);
  return [...persone.values()];
}

/** Ordine per sfogliare le carte a tutto schermo: lo stesso dell'elenco. */
const IN_ORDINE: readonly Carta[] = GRUPPI.flatMap((g) => perPersona(g.filtro).flat());

/**
 * Elenco di tutte le carte: una persona per riga, con la carta grande. Per gli adulti le frecce (o il dito)
 * fanno girare le 3 carte dei vari livelli. Toccando la carta si apre a tutto schermo.
 */
export function CatalogoFamiglia({ larga = false }: { larga?: boolean }) {
  const [aperta, setAperta] = useState<number | null>(null);
  const esposte = useCarteEsposte(larga);
  const copie = CARTE.reduce((n, c) => n + c.copie, 0);
  return (
    <div>
      <p className="mb-2 text-sm">
        {CARTE.length} carte diverse, {copie} nel mazzo.{" "}
        {esposte ? "Tocca una carta per vederla a tutto schermo." : "Usa le frecce per vedere i livelli; tocca la carta per vederla a tutto schermo."}
      </p>
      {GRUPPI.map((g) => (
        <div key={g.titolo} className="mb-5">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-tenue">{g.titolo}</h4>
          {esposte ? (
            <CarteEsposte persone={perPersona(g.filtro)} dimensione={esposte.dimensione} onApri={(c) => setAperta(IN_ORDINE.indexOf(c))} />
          ) : (
            <ul className={elencoCarte(larga)}>
              {perPersona(g.filtro).map((carte) => (
                <li key={carte[0]!.persona}>
                  <Carosello carte={carte} onApri={(c) => setAperta(IN_ORDINE.indexOf(c))} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {aperta !== null && <CartaInGrande indice={aperta} onCambia={setAperta} onChiudi={() => setAperta(null)} />}
    </div>
  );
}

/** Le carte di una persona, una alla volta: frecce, pallini dei livelli e scorrimento del dito. `dimensione`: larghezza fissa della carta. */
function Carosello({ carte, onApri, iniziale = 0, dimensione }: { carte: Carta[]; onApri: (c: Carta) => void; iniziale?: number; dimensione?: number }) {
  const [i, setI] = useState(Math.max(0, iniziale));
  const inizio = useRef<number | null>(null);
  const c = carte[i]!;
  const piu = carte.length > 1;
  const vai = (passo: number) => setI((x) => (x + passo + carte.length) % carte.length);
  return (
    <div
      className="flex h-full flex-col items-center gap-2 rounded-xl border border-inchiostro/15 bg-white/50 p-3 text-center"
      onTouchStart={(e) => {
        inizio.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const fine = e.changedTouches[0]?.clientX;
        if (piu && inizio.current !== null && fine !== undefined && Math.abs(fine - inizio.current) > 50) vai(fine < inizio.current ? 1 : -1);
        inizio.current = null;
      }}
    >
      <p className="font-titolo text-lg font-bold leading-tight">
        {c.nome}
        <span className="text-oro"> {"★".repeat(c.livello)}</span>
      </p>
      <div className="flex items-center gap-2">
        {piu && (
          <button type="button" onClick={() => vai(-1)} className="rounded-full bg-inchiostro/10 px-3 py-2 text-2xl" aria-label="Livello precedente">
            ‹
          </button>
        )}
        {/* sul telefono la carta si stringe quanto basta per lasciare posto alle frecce */}
        <CartaFamiglia idCarta={c.id} dimensione={dimensione ?? Math.min(220, Math.max(140, window.innerWidth - 180))} onClick={() => onApri(c)} />
        {piu && (
          <button type="button" onClick={() => vai(1)} className="rounded-full bg-inchiostro/10 px-3 py-2 text-2xl" aria-label="Livello successivo">
            ›
          </button>
        )}
      </div>
      {piu && (
        <div className="flex gap-1.5" role="tablist" aria-label="Livelli">
          {carte.map((x, n) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={n === i}
              onClick={() => setI(n)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${n === i ? "bg-oro text-[#2b1a05]" : "bg-inchiostro/10"}`}
            >
              Livello {x.livello}
            </button>
          ))}
        </div>
      )}
      <div className="max-w-sm space-y-1 text-sm">
        {c.poteri.map((p) => (
          <p key={p.id}>
            <span className="mr-1 inline-block align-middle">
              <Stemma tipo={tipologiaPotere(c, p)} dimensione={16} />
            </span>
            <strong>{p.nome}</strong>: {p.testo}
          </p>
        ))}
        <p className="text-xs text-tenue">
          🔑 Si attiva con: <strong>{descriviCodice(c.codice)}</strong> ·{" "}
          {c.punti > 0 && !soloAiuto(c.id) ? `${c.punti} ${c.punti === 1 ? "punto" : "punti"}` : c.punti > 0 ? "niente punti (carta aiuto)" : "niente punti"}
          {c.ricarica > 0 && ` · si ricarica in ${c.ricarica} ${c.ricarica === 1 ? "turno" : "turni"}`}
          {c.copie > 1 && ` · ${c.copie} copie`}
        </p>
        {c.nota && <p className="text-xs italic text-tenue">{c.nota}</p>}
      </div>
    </div>
  );
}

/** Una carta a tutto schermo, con le frecce (o lo scorrimento del dito) per passare alle altre. */
function CartaInGrande({ indice, onCambia, onChiudi }: { indice: number; onCambia: (i: number) => void; onChiudi: () => void }) {
  const inizio = useRef<number | null>(null);
  const vai = (passo: number) => onCambia((indice + passo + IN_ORDINE.length) % IN_ORDINE.length);
  const c = IN_ORDINE[indice]!;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
      onClick={onChiudi}
      onTouchStart={(e) => {
        inizio.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const fine = e.changedTouches[0]?.clientX;
        if (inizio.current !== null && fine !== undefined && Math.abs(fine - inizio.current) > 50) vai(fine < inizio.current ? 1 : -1);
        inizio.current = null;
      }}
    >
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => vai(-1)} className="rounded-full bg-white/15 px-3 py-2 text-2xl text-white" aria-label="Carta precedente">
          ‹
        </button>
        <CartaFamiglia idCarta={c.id} dimensione={Math.min(300, window.innerWidth - 120)} />
        <button type="button" onClick={() => vai(1)} className="rounded-full bg-white/15 px-3 py-2 text-2xl text-white" aria-label="Carta successiva">
          ›
        </button>
      </div>
      <div className="max-w-sm text-center text-sm text-white" onClick={(e) => e.stopPropagation()}>
        {c.poteri.map((p) => (
          <p key={p.id}>
            <span className="mr-1 inline-block align-middle">
              <Stemma tipo={tipologiaPotere(c, p)} dimensione={16} />
            </span>
            <strong>{p.nome}</strong>: {p.testo}
          </p>
        ))}
        <p className="mt-1 text-white/70">
          🔑 {descriviCodice(c.codice)} · {indice + 1} di {IN_ORDINE.length}
        </p>
      </div>
      <button type="button" onClick={onChiudi} className="rounded-xl border-2 border-oro px-4 py-2 font-bold text-oro-chiaro">
        Chiudi
      </button>
    </div>
  );
}
