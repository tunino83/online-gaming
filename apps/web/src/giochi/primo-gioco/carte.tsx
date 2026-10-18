/** Carte disegnate del primo gioco (stile in carte.css). */
import { type CartaDiamante, type PezzoCodice, personaggio, pezziCodice, simboloProvvisorio, tipoCarta } from "@og/primo-gioco";
import type { CSSProperties, ReactNode } from "react";
import "@fontsource/cinzel/700.css";
import "./carte.css";

import { immaginePersonaggio, useSkin } from "./skin";

interface Comune {
  larghezza?: number;
  /** Se presente, la carta è toccabile ed evidenziata (es. si può prendere). */
  onTocca?: () => void;
  /** Se presente (e non c'è onTocca), toccandola si vede ingrandita. */
  onIngrandisci?: () => void;
  disabilitata?: boolean;
  titolo?: string;
}

function Contenitore({
  classe,
  larghezza = 180,
  onTocca,
  onIngrandisci,
  disabilitata,
  titolo,
  children,
}: Comune & { classe: string; children: ReactNode }) {
  const stile = { "--larghezza": `${larghezza}px` } as CSSProperties;
  if (!onTocca && onIngrandisci) {
    return (
      <button type="button" className={`carta ingrandibile ${classe}`} style={stile} onClick={onIngrandisci} title={titolo}>
        {children}
      </button>
    );
  }
  if (onTocca) {
    return (
      <button type="button" className={`carta toccabile ${classe}`} style={stile} onClick={onTocca} disabled={disabilitata} title={titolo}>
        {children}
      </button>
    );
  }
  return (
    <div className={`carta ${classe}`} style={stile} title={titolo}>
      {children}
    </div>
  );
}

function Pezzo({ p }: { p: PezzoCodice }) {
  switch (p.tipo) {
    case "numero":
      return <span className="tessera"><span>{p.testo}</span></span>;
    case "generica":
      return <span className="tessera generica"><span>{p.testo}</span></span>;
    case "diamante":
      return <span className="tessera diamante"><span>◆</span></span>;
    case "nota":
      return <span className="nota">{p.testo}</span>;
    case "piu":
      return <span className="segno">+</span>;
    case "oppure":
      return <span className="segno">o</span>;
  }
}

export function CartaPersonaggioGrafica({ id, compatta, ...comune }: Comune & { id: string; compatta?: boolean }) {
  const p = personaggio(id);
  const { colore } = tipoCarta(p);
  const skin = useSkin();
  const img = immaginePersonaggio(p.id, skin);
  const pezzi = pezziCodice(p.codice);
  return (
    <Contenitore classe={`${colore} skin-${skin} ${compatta ? "compatta" : ""}`} titolo={comune.titolo ?? p.nome} {...comune}>
      <span className="punti" aria-label={`${p.punti} punti`}>
        <span>{p.punti}</span>
      </span>
      <div className="cornice">
        <div className="arte">
          {img ? (
            <img src={img} alt={p.nome} draggable={false} />
          ) : (
            <div className="segnaposto">
              <span className="simbolo" aria-hidden="true">{simboloProvvisorio(p)}</span>
              <span className="nome">{p.nome}</span>
            </div>
          )}
        </div>
        <div className={`codice ${pezzi.length >= 5 ? "lungo" : ""}`} aria-label={`Codice: ${p.codiceTesto}`}>
          {pezzi.map((pz, i) => (
            <Pezzo key={i} p={pz} />
          ))}
        </div>
        {p.poteri.length > 0 && <p className={`testo-potere ${p.potereTesto.length > 90 ? "lungo" : ""}`}>{p.potereTesto}</p>}
      </div>
    </Contenitore>
  );
}

export function CartaNumeroGrafica({
  valore,
  selezionata,
  scelta,
  ...comune
}: Comune & { valore: number; /** da scartare */ selezionata?: boolean; /** da usare in un codice */ scelta?: boolean }) {
  return (
    <Contenitore classe={`numero ${selezionata ? "selezionata" : ""} ${scelta ? "scelta" : ""}`} titolo={comune.titolo ?? `Carta ${valore}`} {...comune}>
      <div className="cornice">
        <span className="angolo alto">{valore}</span>
        <span className="valore">{valore}</span>
        <span className="angolo basso">{valore}</span>
      </div>
    </Contenitore>
  );
}

export function DorsoMazzo({ nome, quante, ...comune }: Comune & { nome: string; quante: number }) {
  return (
    <Contenitore classe={`dorso ${quante === 0 ? "vuoto" : ""}`} titolo={comune.titolo ?? `Mazzo ${nome}: ${quante} carte`} {...comune}>
      <div className="cornice">
        <span className="etichetta-mazzo">{nome}</span>
        <span className="conteggio">{quante}</span>
      </div>
    </Contenitore>
  );
}

export function PostoVuoto({ larghezza = 180 }: { larghezza?: number }) {
  return <div className="carta vuota" style={{ "--larghezza": `${larghezza}px` } as CSSProperties} />;
}

export function Diamante({ d }: { d: CartaDiamante }) {
  return d.tipo === "fulmine" ? (
    <span className="gettone fulmine" title="Fulmine: +1 mossa">⚡</span>
  ) : (
    <span className="gettone" title={`Diamante ${d.valore}`}>{d.valore}</span>
  );
}

/**
 * Mini carta blu: la carta "virtuale" che danno Nani (il loro numero), Fenice (8) e Drago (? = a scelta).
 * Spenta quando è già stata usata in questo turno.
 */
export function MiniCartaVirtuale({ valore, usata, titolo, onTocca }: { valore: number | "aScelta"; usata?: boolean; titolo: string; onTocca?: () => void }) {
  return (
    <button
      type="button"
      onClick={onTocca}
      title={usata ? `${titolo} (già usata in questo turno)` : titolo}
      aria-label={`${titolo}: carta ${valore === "aScelta" ? "a scelta" : valore}${usata ? ", già usata" : ""}`}
      className={`grid h-[34px] w-[25px] shrink-0 place-items-center rounded-[4px] border-2 border-[#9cc3f0] bg-gradient-to-b from-[#3b7fd0] to-[#1f4f8f] font-titolo text-base leading-none font-bold text-white shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
        usata ? "opacity-35 grayscale" : ""
      }`}
    >
      {valore === "aScelta" ? "?" : valore}
    </button>
  );
}
