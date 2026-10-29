/**
 * Disegno delle carte della Famiglia (stile in famiglia.css): cartoncini "di casa" con la cornice cucita,
 * il nastro col nome, lo stemma del tipo e l'etichetta del potere; carte numero come piastrelle di maiolica.
 */
import "@fontsource/caveat/700.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import { COLORI_NUMERI, COLORI_TIPI, type Carta, type TipologiaCarta, tipologiaPotere, tipologiaPrincipale, tipologieCarta, type CartaMancia, type CartaNumero, carta, descriviCodice, pezziDelCodice, soloAiuto } from "@og/famiglia";
import { type CSSProperties, type ReactNode, createContext, useContext } from "react";
import "./famiglia.css";
import { immagineCarta } from "./immagini";

/**
 * Regole dei punti della partita (le carte solo aiuto valgono 0?). Di base le regole nuove; il tavolo le prende
 * dalle opzioni della partita (le partite vecchie restano con i punti di prima).
 */
export const RegolePunti = createContext<{ aiutiSenzaPunti: boolean }>({ aiutiSenzaPunti: true });

/** Punti che vale la carta con le regole della partita. */
export function usePuntiCarta(idCarta: string): number {
  const { aiutiSenzaPunti } = useContext(RegolePunti);
  return aiutiSenzaPunti && soloAiuto(idCarta) ? 0 : carta(idCarta).punti;
}

/** Simbolo dell'infinito (∞) per le carte sempre attive, disegnato nello stemma (uguale anche nel PDF da stampare). */
export const INFINITO = "M20 23 C17 17.5 10.5 17.5 10.5 23 C10.5 28.5 17 28.5 20 23 C23 17.5 29.5 17.5 29.5 23 C29.5 28.5 23 28.5 20 23 Z";

/**
 * Tipologie di carta, ognuna col suo stemma e il suo colore (colori in games/famiglia/src/colori.ts, uguali nel PDF):
 * rosso attacchi, blu difese, giallo aiuti, verde aiuti sempre attivi (∞), viola e arancione le carte usa e getta.
 */
export const TIPOLOGIE: Record<TipologiaCarta, { nome: string; icona: string; colore: string; scuro: string }> = {
  attacco: { nome: "Attacco", icona: "⚔️", ...COLORI_TIPI.attacco },
  difesa: { nome: "Difesa", icona: "🛡️", ...COLORI_TIPI.difesa },
  aiuto: { nome: "Aiuto", icona: "✨", ...COLORI_TIPI.aiuto },
  blu: { nome: "Aiuto sempre attivo", icona: "∞", ...COLORI_TIPI.blu },
  difesaUnaVolta: { nome: "Difesa usa e getta", icona: "🛡️", ...COLORI_TIPI.difesaUnaVolta },
  attaccoUnaVolta: { nome: "Attacco usa e getta", icona: "⚔️", ...COLORI_TIPI.attaccoUnaVolta },
};
export type Tipologia = TipologiaCarta;
export { tipologieCarta, tipologiaPotere };

/** Stemma a scudo del tipo di potere, con la cucitura e il simbolo. */
export function Stemma({ tipo, dimensione = 22 }: { tipo: Tipologia; dimensione?: number }) {
  const t = TIPOLOGIE[tipo];
  const scudo = "M20 2 L37 7 V22 C37 33 29 40 20 44 C11 40 3 33 3 22 V7 Z";
  return (
    <svg viewBox="0 0 40 46" width={dimensione} height={(dimensione * 46) / 40} role="img" aria-label={t.nome}>
      <defs>
        <linearGradient id={`stemma-${tipo}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.colore} />
          <stop offset="1" stopColor={t.scuro} />
        </linearGradient>
      </defs>
      <path d={scudo} fill={`url(#stemma-${tipo})`} stroke="#fff4dc" strokeWidth="2.5" />
      <path d={scudo} fill="none" stroke="#fff4dc" strokeWidth="1.2" strokeDasharray="2.2 2" opacity="0.75" transform="translate(20 23) scale(0.78) translate(-20 -23)" />
      {tipo === "blu" ? (
        <path d={INFINITO} fill="none" stroke="#fff4dc" strokeWidth="3.4" strokeLinejoin="round" />
      ) : (
        <text x="20" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="17">
          {t.icona}
        </text>
      )}
    </svg>
  );
}

/**
 * Il codice di attivazione disegnato con carte piccole, come sulle carte stampate: numeri colorati, AA coppia,
 * AAA tris, AABB doppia coppia, "+3 = moneta" per le somme, P/D pari e dispari, ? qualsiasi.
 */
export function CodiceDisegnato({ codice }: { codice: Carta["codice"] }) {
  const testo = descriviCodice(codice);
  return (
    <div className="cf-codice" title={testo} aria-label={`Codice: ${testo}`}>
      {pezziDelCodice(codice).map((pz, i) => {
        if ("carta" in pz) {
          const gemma = pz.valore ? COLORI_NUMERI[pz.valore as keyof typeof COLORI_NUMERI] : undefined;
          return (
            <span
              key={i}
              className={`cf-codice-carta ${pz.carta.length > 1 && pz.carta !== "↗" ? "cf-codice-larga" : ""}`}
              style={gemma ? ({ background: gemma.chiaro, borderColor: gemma.scuro, color: gemma.scuro } as CSSProperties) : undefined}
            >
              {pz.carta}
            </span>
          );
        }
        if ("spazio" in pz) return <span key={i} className="cf-codice-spazio" />;
        if ("segno" in pz) return <span key={i} className="cf-codice-segno">{pz.segno}</span>;
        if (/^\d+$/.test(pz.parola)) return <span key={i} className="cf-codice-moneta">{pz.parola}</span>;
        return <span key={i} className="cf-codice-parola">{pz.parola}</span>;
      })}
    </div>
  );
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
  // I testi e i bordi crescono con la carta (la misura "media" è quella di riferimento)
  const s = larghezza / 88;
  const misura = { width: larghezza, height: Math.round(larghezza * 1.4) };
  if (coperta) {
    return (
      <div style={misura} className="cf-dorso shrink-0" aria-label="carta coperta">
        <span>✦</span>
      </div>
    );
  }
  const c = carta(idCarta);
  const punti = usePuntiCarta(idCarta);
  const principale = TIPOLOGIE[tipologiaPrincipale(c)];
  const immagine = immagineCarta(idCarta);
  const Contenitore = onClick ? "button" : "div";
  const stile = { ...misura, "--s": s, "--cf-colore": principale.colore, "--cf-scuro": principale.scuro } as CSSProperties;
  return (
    <Contenitore
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={stile}
      className={`cf ${s >= 2 ? "cf-grande" : ""} ${c.categoria !== "personaggio" ? "cf-oggetto" : ""} ${onClick ? "cf-cliccabile" : ""} ${evidenziata ? "cf-evidenziata" : ""}`}
      aria-label={`${c.nome}, livello ${c.livello}`}
    >
      <div className="cf-cornice">
        <div className="cf-titolo">{c.nome}</div>
        <div className="cf-foto">
          {immagine ? (
            <img src={immagine} alt="" draggable={false} />
          ) : (
            <div className="cf-segnaposto">
              <b>{c.nome.charAt(0)}</b>
              <span>{c.categoria === "personaggio" ? c.nota ?? "" : c.categoria === "difesa" ? "carta difesa" : "carta attacco"}</span>
            </div>
          )}
          <span className="cf-livello">{"★".repeat(c.livello)}</span>
          {stanca !== undefined && stanca > 0 && <div className="cf-stanca">😴 {stanca}</div>}
        </div>
        <div className="cf-etichetta">
          <div className="cf-potere">{c.poteri.map((p) => p.nome).join(" / ")}</div>
          <CodiceDisegnato codice={c.codice} />
        </div>
      </div>
      <div className="cf-stemmi">
        {tipologieCarta(c).map((tipo) => (
          <Stemma key={tipo} tipo={tipo} dimensione={Math.round(19 * s)} />
        ))}
      </div>
      {c.categoria === "personaggio" && <span className="cf-punti">{punti}</span>}
    </Contenitore>
  );
}

/** Scheda completa di una carta (per il primo piano): testo di tutti i poteri. */
export function SchedaCarta({ idCarta, stanca }: { idCarta: string; stanca?: number }) {
  const c = carta(idCarta);
  const punti = usePuntiCarta(idCarta);
  return (
    <div className="flex flex-col items-center gap-3">
      {/* grande quanto lo schermo permette (la scheda scorre: i pulsanti sotto restano raggiungibili) */}
      <CartaFamiglia idCarta={idCarta} stanca={stanca} dimensione={Math.round(Math.min(300, window.innerWidth * 0.72))} />
      <div className="w-full space-y-2 text-sm">
        {c.nota && <p className="italic text-tenue">{c.nota}</p>}
        {c.poteri.map((p) => (
          <p key={p.id}>
            <span className="mr-1 inline-block align-middle">
              <Stemma tipo={tipologiaPotere(c, p)} dimensione={18} />
            </span>
            <b>{p.nome}:</b>{" "}
            {p.testo}
          </p>
        ))}
        {c.poteri.some((p) => p.blu) && (
          <p className="rounded-lg bg-[#2f6fb3]/15 px-2 py-1">
            {c.poteri.every((p) => p.blu)
              ? "∞ Sempre attiva: dopo averla attivata non si stanca mai (nemmeno con gli attacchi) e non costa mosse."
              : "∞ Potere sempre attivo: funziona una volta per turno anche se la carta è stanca e non costa mosse; l'altro potere fa stancare la carta come sempre."}
          </p>
        )}
        <p className="text-tenue">
          🔑 Codice: <b>{descriviCodice(c.codice)}</b> · Livello {c.livello} · {punti} {punti === 1 ? "punto" : "punti"}
          {c.ricarica > 0 && ` · si ricarica in ${c.ricarica} ${c.ricarica === 1 ? "turno" : "turni"}`}
          {c.categoria === "personaggio" && punti === 0 && c.punti > 0 && " (le carte solo aiuto non danno punti)"}
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
      className={`cf-num ${c.unite ? "cf-num-casa" : ""} ${selezionata ? "cf-num-scelta" : ""} ${piccola ? "h-11 w-8 text-lg" : "h-16 w-12 text-3xl"}`}
      style={c.unite ? undefined : ({ "--num": COLORI_NUMERI[c.valore].colore, "--num-chiaro": COLORI_NUMERI[c.valore].chiaro, "--num-scuro": COLORI_NUMERI[c.valore].scuro } as CSSProperties)}
      aria-label={`carta ${c.valore}${c.unite ? " fatta in casa" : ""}`}
    >
      <b>{c.valore}</b>
      {c.campanello && <span className="absolute -right-1 -top-1 text-[11px]">🔔</span>}
      {c.unite && <span className="absolute -bottom-1 text-[9px]">🏠</span>}
      {c.valoreVero !== undefined && (
        <span className="absolute -left-1 -top-1 text-[11px]" title={`Truccata: in realtà vale ${c.valoreVero}`}>
          💄
        </span>
      )}
      {nota}
    </Contenitore>
  );
}

/** Mancia dei nonni (moneta d'oro) o caffè (pozione). */
export function Mancia({ m, onClick }: { m: CartaMancia; onClick?: () => void }) {
  const Contenitore = onClick ? "button" : "div";
  return (
    <Contenitore
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`cf-moneta ${m.tipo === "caffe" ? "cf-pozione" : ""} ${onClick ? "ring-2 ring-oro-chiaro" : ""}`}
      aria-label={m.tipo === "caffe" ? "caffè" : `mancia ${m.valore}`}
      title={m.tipo === "caffe" ? "Caffè" : `Moneta d'oro da ${m.valore}`}
    >
      {m.tipo === "caffe" ? "☕" : m.valore}
    </Contenitore>
  );
}
