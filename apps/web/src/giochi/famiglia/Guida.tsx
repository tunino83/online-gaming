/** Guida della Famiglia: le regole in breve (riassunto di docs/famiglia/regolamento.md) e tutte le carte. */
import { CARTE, type Carta, EVENTI, descriviCodice } from "@og/famiglia";
import { type ReactNode, useRef, useState } from "react";
import { CartaFamiglia, Stemma } from "./carte";

function Voce({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-titolo text-base font-bold">{titolo}</h3>
      <div className="mt-1 space-y-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function GuidaFamiglia() {
  return (
    <div className="space-y-4 text-inchiostro">
      <Voce titolo="🎯 Scopo">
        <p>
          Attiva i parenti per fare punti e usa i loro poteri per aiutarti, attaccare gli altri e difenderti. Di solito vince chi
          arriva per primo a <strong>20 punti</strong>: quando succede si finisce il giro e si gioca <strong>un ultimo giro</strong>.
          Chi crea la partita può scegliere invece di giocare <strong>fino alla fine del mazzo</strong> dei personaggi.
        </p>
      </Voce>

      <Voce titolo="🃏 Il tuo turno: 3 mosse">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Prendi</strong> una carta scoperta dal tavolo (numero o personaggio), oppure <strong>pesca</strong> dal mazzo.
          </li>
          <li>
            <strong>Brucia</strong>: le 4 carte numero del tavolo vanno negli scarti e ne escono 4 nuove.
          </li>
          <li>
            <strong>Attiva</strong> un personaggio pagando il suo codice con le carte numero: va tra i tuoi attivati e ti dà i suoi punti.
          </li>
          <li>
            <strong>Usa il potere</strong> di un tuo personaggio attivato e carico.
          </li>
          <li>
            <strong>Pesca un evento</strong> (solo se non ce n'è già uno in corso).
          </li>
        </ul>
        <p>Puoi ripetere la stessa mossa. Finite le mosse il turno si chiude da solo.</p>
      </Voce>

      <Voce titolo="🗂️ Le tue carte">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Carte numero</strong> (nascoste): al massimo <strong>7</strong> a fine turno.
          </li>
          <li>
            <strong>Nascosti in mano</strong>: personaggi di aiuto e di difesa, vini e scuse. Gli altri vedono quanti sono, non quali.
            Al massimo <strong>3</strong>.
          </li>
          <li>
            <strong>Attacchi in attesa</strong>: i personaggi d'attacco e le carte attacco stanno <strong>scoperti</strong>, tutti li
            vedono. Al massimo <strong>3</strong>.
          </li>
          <li>
            <strong>Attivati</strong>: i personaggi che ti danno punti. Se una zona è piena, scegli quale carta vecchia scartare.
          </li>
        </ul>
      </Voce>

      <Voce titolo="⭐ Livelli, punti e ricarica">
        <p>
          Ogni adulto ha 3 carte. <strong>Livello 1</strong>: codice di 2 carte, 1 punto, potere leggero. <strong>Livello 2</strong>: 3
          carte, 2 punti. <strong>Livello 3</strong>: 4–5 carte, 3 punti, potere forte.
        </p>
        <p>
          Dopo aver usato un potere la carta <strong>si stanca</strong> 😴 e si ricarica in tanti turni quanto il suo livello (a ogni
          inizio del tuo turno recupera una tacca). Usare un potere costa una mossa (tranne quelli gratis, come <em>Non sbaglio mai</em>).
        </p>
        <p>
          🔵 <strong>Carte blu</strong>: alcune carte aiuto, dopo averle attivate, sono <strong>sempre attive</strong>: non si
          stancano mai e non costano mosse. Ogni effetto vale una volta per turno (es. <em>Un caffè</em>: fai sempre 4 mosse).
        </p>
        <p>
          <strong>Famiglia al completo</strong>: se attivi tutte e 3 le carte della stessa persona prendi <strong>+2 punti</strong>.
        </p>
      </Voce>

      <Voce titolo="🔢 Codici">
        <p>
          Numeri esatti (es. 2 5), coppia, tris, poker, somma (es. 3 carte con somma 15), scala, doppia coppia, carte pari o
          dispari, carte qualsiasi. Le carte usate vanno negli scarti.
        </p>
      </Voce>

      <Voce titolo="💶 Mancia dei nonni, ☕ caffè e 🔔 campanello">
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

      <Voce titolo="⚔️ Attacchi e 🛡️ difese">
        <p>
          Quando attacchi, il gioco aspetta <strong>solo chi viene colpito</strong>: ha qualche secondo (di solito 30) per difendersi,
          poi l'attacco passa. Negli attacchi contro tutti gli avversari rispondono uno alla volta.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Difesa con un personaggio <strong>attivato e carico</strong>: poi si stanca.</li>
          <li>
            Difesa <strong>d'emergenza</strong> con un personaggio o una carta difesa nascosti in mano: paghi il codice, la carta va
            negli scarti e non dà punti.
          </li>
          <li>
            <strong>Regola del livello</strong>: una difesa ferma solo attacchi del suo livello o più bassi (il Paesano solo il
            livello 1, il Taurasi tutto).
          </li>
          <li>Ognuno si difende al massimo una volta per attacco.</li>
        </ul>
      </Voce>

      <Voce titolo="🎉 Eventi">
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
          <li>Il pulsante <strong>Mosse</strong> in basso elenca tutto quello che puoi fare adesso.</li>
          <li>In alto tocca un avversario per vedere le sue carte scoperte.</li>
        </ul>
      </Voce>

      <Voce titolo="🃏 Tutte le carte">
        <CatalogoFamiglia />
      </Voce>
    </div>
  );
}

const GRUPPI: { titolo: string; filtro: (c: Carta) => boolean }[] = [
  { titolo: "Adulti (3 carte ciascuno: girale con le frecce)", filtro: (c) => c.categoria === "personaggio" && c.id !== c.persona },
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
export function CatalogoFamiglia() {
  const [aperta, setAperta] = useState<number | null>(null);
  const copie = CARTE.reduce((n, c) => n + c.copie, 0);
  return (
    <div>
      <p className="mb-2 text-sm">
        {CARTE.length} carte diverse, {copie} nel mazzo. Usa le frecce per vedere i livelli; tocca la carta per vederla a tutto schermo.
      </p>
      {GRUPPI.map((g) => (
        <div key={g.titolo} className="mb-5">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-tenue">{g.titolo}</h4>
          <ul className="space-y-3">
            {perPersona(g.filtro).map((carte) => (
              <li key={carte[0]!.persona}>
                <Carosello carte={carte} onApri={(c) => setAperta(IN_ORDINE.indexOf(c))} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {aperta !== null && <CartaInGrande indice={aperta} onCambia={setAperta} onChiudi={() => setAperta(null)} />}
    </div>
  );
}

/** Le carte di una persona, una alla volta: frecce, pallini dei livelli e scorrimento del dito. */
function Carosello({ carte, onApri }: { carte: Carta[]; onApri: (c: Carta) => void }) {
  const [i, setI] = useState(0);
  const inizio = useRef<number | null>(null);
  const c = carte[i]!;
  const piu = carte.length > 1;
  const vai = (passo: number) => setI((x) => (x + passo + carte.length) % carte.length);
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl border border-inchiostro/15 bg-white/50 p-3 text-center"
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
        {c.categoria === "personaggio" && <span className="text-oro"> {"★".repeat(c.livello)}</span>}
      </p>
      <div className="flex items-center gap-2">
        {piu && (
          <button type="button" onClick={() => vai(-1)} className="rounded-full bg-inchiostro/10 px-3 py-2 text-2xl" aria-label="Livello precedente">
            ‹
          </button>
        )}
        {/* sul telefono la carta si stringe quanto basta per lasciare posto alle frecce */}
        <CartaFamiglia idCarta={c.id} dimensione={Math.min(220, Math.max(140, window.innerWidth - 180))} onClick={() => onApri(c)} />
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
              <Stemma tipo={p.blu ? "blu" : p.tipo} dimensione={16} />
            </span>
            <strong>{p.nome}</strong>: {p.testo}
          </p>
        ))}
        <p className="text-xs text-tenue">
          🔑 Si attiva con: <strong>{descriviCodice(c.codice)}</strong> ·{" "}
          {c.punti > 0 ? `${c.punti} ${c.punti === 1 ? "punto" : "punti"}` : "niente punti"}
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
              <Stemma tipo={p.blu ? "blu" : p.tipo} dimensione={16} />
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
