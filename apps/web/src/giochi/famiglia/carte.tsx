/**
 * Disegno delle carte della Famiglia: personaggi (immagine o nome), carte numero e mancia dei nonni.
 * Colore della cornice secondo il tipo: attacco rosso, difesa blu, aiuto verde; carte difesa/attacco più scure.
 */
import { type Carta, type CartaMancia, type CartaNumero, carta, descriviCodice } from "@og/famiglia";
import type { ReactNode } from "react";
import { EMOJI_TIPO } from "./descrivi";
import { immagineCarta } from "./immagini";

const COLORE_TIPO = { attacco: "#b3261e", difesa: "#2f6fb3", aiuto: "#2e7d4f" } as const;

function coloreCarta(c: Carta): string {
  const tipi = new Set(c.poteri.map((p) => p.tipo));
  if (tipi.has("attacco")) return COLORE_TIPO.attacco;
  if (tipi.has("difesa") && !tipi.has("aiuto")) return COLORE_TIPO.difesa;
  return COLORE_TIPO.aiuto;
}

/** Carta del mazzo personaggi. `stanca`: turni alla ricarica (0 = carica); undefined = non attivata. */
export function CartaFamiglia({
  idCarta,
  stanca,
  dimensione = "media",
  onClick,
  evidenziata,
  coperta,
}: {
  idCarta: string;
  stanca?: number;
  /** Misura della carta: una delle tre di base, oppure la larghezza in pixel. */
  dimensione?: "piccola" | "media" | "grande" | number;
  onClick?: () => void;
  evidenziata?: boolean;
  /** Carta nascosta di un altro giocatore: si vede solo il dorso. */
  coperta?: boolean;
}) {
  const larghezza = typeof dimensione === "number" ? dimensione : dimensione === "piccola" ? 64 : dimensione === "media" ? 88 : 220;
  // I testi crescono con la carta (la misura "media" è quella di riferimento)
  const s = larghezza / 88;
  const px = (base: number, max = Number.POSITIVE_INFINITY) => Math.min(base * s, max);
  const stile = { width: larghezza, height: Math.round(larghezza * 1.4) };
  if (coperta) {
    return (
      <div
        style={stile}
        className="grid shrink-0 place-items-center rounded-lg border-2 border-oro bg-gradient-to-br from-[#5b3a8c] to-[#2b1a4a] text-2xl shadow"
        aria-label="carta coperta"
      >
        👨‍👩‍👧
      </div>
    );
  }
  const c = carta(idCarta);
  const colore = coloreCarta(c);
  const immagine = immagineCarta(idCarta);
  const Contenitore = onClick ? "button" : "div";
  return (
    <Contenitore
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{ ...stile, borderColor: colore }}
      className={`relative flex shrink-0 flex-col overflow-hidden rounded-lg border-[3px] bg-[#fbf3df] text-left text-inchiostro shadow transition ${
        evidenziata ? "ring-4 ring-oro-chiaro" : ""
      } ${onClick ? "hover:-translate-y-0.5 active:translate-y-0" : ""}`}
      aria-label={`${c.nome}, livello ${c.livello}`}
    >
      {/* titolo */}
      <div className="truncate px-1 text-center font-bold leading-tight text-white" style={{ background: colore, fontSize: px(10, 20) }}>
        {c.nome}
      </div>
      {/* immagine, oppure il nome scritto in grande */}
      <div className="relative min-h-0 flex-1">
        {immagine ? (
          <img src={immagine} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" draggable={false} />
        ) : (
          <div className="grid h-full place-items-center px-1 text-center font-titolo font-bold leading-tight" style={{ fontSize: px(11, 28), color: colore }}>
            {c.nome}
          </div>
        )}
        {c.categoria === "personaggio" && (
          <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 font-bold text-white" style={{ fontSize: px(9, 16) }}>
            {"★".repeat(c.livello)}
          </span>
        )}
        {c.punti > 0 && (
          <span
            className="absolute right-0.5 top-0.5 grid place-items-center rounded-full bg-oro font-bold text-[#2b1a05]"
            style={{ width: px(20, 34), height: px(20, 34), fontSize: px(10, 17) }}
          >
            {c.punti}
          </span>
        )}
        {stanca !== undefined && stanca > 0 && (
          <div className="absolute inset-0 grid place-items-center bg-black/45 text-center font-bold text-white" style={{ fontSize: px(11, 24) }}>
            😴 {stanca}
          </div>
        )}
      </div>
      {/* poteri e codice */}
      <div className="border-t border-black/10 bg-white/70 px-1 py-0.5 leading-tight" style={{ fontSize: px(8, 14) }}>
        <div className="truncate font-semibold">
          {c.poteri.map((p) => `${p.blu ? "🔵" : EMOJI_TIPO[p.tipo]} ${p.nome}`).join(" / ")}
        </div>
        <div className="truncate text-tenue">🔑 {descriviCodice(c.codice)}</div>
      </div>
    </Contenitore>
  );
}

/** Scheda completa di una carta (per il primo piano): testo di tutti i poteri. */
export function SchedaCarta({ idCarta, stanca }: { idCarta: string; stanca?: number }) {
  const c = carta(idCarta);
  return (
    <div className="flex flex-col items-center gap-3">
      <CartaFamiglia idCarta={idCarta} stanca={stanca} dimensione="grande" />
      <div className="w-full space-y-2 text-sm">
        {c.nota && <p className="italic text-tenue">{c.nota}</p>}
        {c.poteri.map((p) => (
          <p key={p.id}>
            <b>
              {p.blu ? "🔵" : EMOJI_TIPO[p.tipo]} {p.nome}:
            </b>{" "}
            {p.testo}
          </p>
        ))}
        {c.poteri.some((p) => p.blu) && (
          <p className="rounded-lg bg-[#2f6fb3]/15 px-2 py-1">
            {c.poteri.every((p) => p.blu)
              ? "🔵 Carta blu: dopo averla attivata è sempre attiva, non si stanca mai (nemmeno con gli attacchi) e non costa mosse."
              : "🔵 Potere blu: funziona una volta per turno anche se la carta è stanca e non costa mosse; l'altro potere fa stancare la carta come sempre."}
          </p>
        )}
        <p className="text-tenue">
          🔑 Codice: <b>{descriviCodice(c.codice)}</b> · Livello {c.livello} · {c.punti} punti
          {c.ricarica > 0 && ` · si ricarica in ${c.ricarica} ${c.ricarica === 1 ? "turno" : "turni"}`}
          {c.categoria === "difesa" && " · si usa solo quando ti attaccano, poi si scarta"}
          {c.categoria === "attacco" && " · si usa una volta, poi si scarta"}
        </p>
        {stanca !== undefined && !c.poteri.every((p) => p.blu) && <p className="font-semibold">{stanca === 0 ? "⚡ Carica: il potere si può usare" : `😴 Stanca: torna carica tra ${stanca} turni`}</p>}
      </div>
    </div>
  );
}

/** Carta numero (anche "fatta in casa" o con il campanello). */
export function CartaNumeroGrafica({
  c,
  onClick,
  selezionata,
  piccola,
  nota,
}: {
  c: CartaNumero;
  onClick?: () => void;
  selezionata?: boolean;
  piccola?: boolean;
  nota?: ReactNode;
}) {
  const Contenitore = onClick ? "button" : "div";
  return (
    <Contenitore
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative grid shrink-0 place-items-center rounded-lg border-2 font-titolo font-bold shadow transition ${
        piccola ? "h-11 w-8 text-lg" : "h-16 w-12 text-2xl"
      } ${c.unite ? "border-[#8a5a2b] bg-[#f6dcb5] text-[#5a3410]" : "border-oro bg-[#fbf3df] text-inchiostro"} ${
        selezionata ? "-translate-y-2 ring-4 ring-oro-chiaro" : ""
      }`}
      aria-label={`carta ${c.valore}${c.unite ? " fatta in casa" : ""}`}
    >
      {c.valore}
      {c.campanello && <span className="absolute right-0.5 top-0 text-[10px]">🔔</span>}
      {c.unite && <span className="absolute bottom-0 text-[8px] font-sans">🏠</span>}
      {nota}
    </Contenitore>
  );
}

/** Mancia dei nonni (banconota) o caffè. */
export function Mancia({ m, onClick }: { m: CartaMancia; onClick?: () => void }) {
  const Contenitore = onClick ? "button" : "div";
  return (
    <Contenitore
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-0.5 rounded-md border px-1.5 text-xs font-bold ${
        m.tipo === "caffe" ? "border-[#6b3e1d] bg-[#c08a5b] text-white" : "border-[#2e7d4f] bg-[#d6f0dc] text-[#1d4d31]"
      } ${onClick ? "ring-2 ring-oro-chiaro" : ""}`}
      aria-label={m.tipo === "caffe" ? "caffè" : `mancia ${m.valore}`}
    >
      {m.tipo === "caffe" ? "☕" : `💶 ${m.valore}`}
    </Contenitore>
  );
}
