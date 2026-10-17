/**
 * Cosa vede un giocatore. Mai le mani degli altri, mai il contenuto o l'ordine dei mazzi coperti,
 * mai lo stato del generatore casuale. Eccezioni previste dalle regole:
 * - Mago: nel proprio turno si vede la prima carta del mazzo personaggi;
 * - Fatina: mentre si sceglie, si vede la mano dell'avversario scelto.
 */
import type { IdGiocatore } from "@og/engine";
import { limiteMano } from "./regole";
import { personaggio } from "./personaggi";
import type { Attesa, StatoPartita } from "./stato";
import type { CartaDiamante, CartaNumero, CartaPersonaggio } from "./tipi-carte";

export interface VistaAvversario {
  carteInMano: number;
  diamanti: CartaDiamante[];
  posti: CartaPersonaggio[];
  attivati: CartaPersonaggio[];
  punti: number;
}

export interface VistaGiocatore {
  io: IdGiocatore;
  ordine: IdGiocatore[];
  numeroTurno: number;
  ultimoTurno: number | null;
  finita: boolean;
  turno: {
    giocatore: IdGiocatore;
    mosseRimaste: number;
    /** Solo per chi è di turno. */
    attesa: Attesa | null;
    virtualiUsate: string[];
  };
  tavolo: StatoPartita["tavolo"];
  /** Numero di carte coperte rimaste in ogni mazzo e negli scarti. */
  mazzi: { numeri: number; personaggi: number; diamanti: number };
  scarti: { numeri: number; personaggi: number; diamanti: number };
  /** La propria mano e il proprio limite. */
  mano: CartaNumero[];
  limiteMano: number;
  /** Tutti i giocatori (per sé stessi `carteInMano` = mano.length). */
  giocatori: Record<IdGiocatore, VistaAvversario>;
  /** Mago: prima carta del mazzo personaggi (solo nel proprio turno). */
  primoPersonaggio?: CartaPersonaggio;
  /** Fatina: mano dell'avversario scelto (solo durante la scelta). */
  manoAvversario?: CartaNumero[];
}

export function vistaGiocatore(s: StatoPartita, id: IdGiocatore): VistaGiocatore {
  const g = s.giocatori[id];
  if (!g) throw new Error("Giocatore non in partita");
  const mioTurno = s.turno.giocatore === id && !s.finita;

  const vista: VistaGiocatore = {
    io: id,
    ordine: [...s.ordine],
    numeroTurno: s.numeroTurno,
    ultimoTurno: s.ultimoTurno,
    finita: s.finita,
    turno: {
      giocatore: s.turno.giocatore,
      mosseRimaste: s.turno.mosseRimaste,
      attesa: mioTurno ? s.turno.attesa : null,
      virtualiUsate: mioTurno ? [...s.turno.virtualiUsate] : [],
    },
    tavolo: structuredClone(s.tavolo),
    mazzi: { numeri: s.mazzi.numeri.length, personaggi: s.mazzi.personaggi.length, diamanti: s.mazzi.diamanti.length },
    scarti: { numeri: s.scarti.numeri.length, personaggi: s.scarti.personaggi.length, diamanti: s.scarti.diamanti.length },
    mano: structuredClone(g.mano),
    limiteMano: limiteMano(s, g),
    giocatori: Object.fromEntries(
      s.ordine.map((x) => {
        const o = s.giocatori[x]!;
        return [
          x,
          {
            carteInMano: o.mano.length,
            diamanti: structuredClone(o.diamanti),
            posti: structuredClone(o.posti),
            attivati: structuredClone(o.attivati),
            punti: o.punti,
          },
        ];
      }),
    ),
  };

  const haMago = g.attivati.some((c) => personaggio(c.personaggio).poteri.some((p) => p.effetto.tipo === "vediMazzoPersonaggi"));
  const primo = s.mazzi.personaggi[s.mazzi.personaggi.length - 1];
  if (mioTurno && haMago && primo) vista.primoPersonaggio = { ...primo };

  if (mioTurno && s.turno.attesa?.tipo === "fatina") {
    vista.manoAvversario = structuredClone(s.giocatori[s.turno.attesa.avversario]!.mano);
  }
  return vista;
}
