/** Carte disegnate del primo gioco (stile in carte.css). */
import { type CartaDiamante, type PezzoCodice, personaggio, pezziCodice, simboloProvvisorio, tipoCarta } from "@og/primo-gioco";
import type { CSSProperties, ReactNode } from "react";
import "@fontsource/cinzel/700.css";
import "./carte.css";

/** Illustrazioni: games/primo-gioco/immagini/<id personaggio>.png|jpg|jpeg|webp */
const FILE_IMMAGINI = import.meta.glob("../../../../../games/primo-gioco/immagini/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const IMMAGINI = new Map(
  Object.entries(FILE_IMMAGINI).map(([percorso, url]) => [percorso.split("/").pop()!.replace(/\.[a-z]+$/, ""), url]),
);
export const immaginePersonaggio = (id: string) => IMMAGINI.get(id);

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
  const { colore, etichetta } = tipoCarta(p);
  const img = immaginePersonaggio(p.id);
  const pezzi = pezziCodice(p.codice);
  return (
    <Contenitore classe={`${colore} ${compatta ? "compatta" : ""}`} titolo={comune.titolo ?? p.nome} {...comune}>
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
        <span className="tipo">{etichetta}</span>
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
