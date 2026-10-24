/**
 * Cosa vede un giocatore. Mai le carte numero o i personaggi nascosti degli altri,
 * mai il contenuto o l'ordine dei mazzi coperti, mai lo stato del generatore casuale.
 * Degli altri si vede: quante carte hanno in mano e nascoste, la mancia, gli attacchi in attesa e gli attivati.
 */
import type { IdGiocatore } from "@og/engine";
import type { Risorse } from "./codici";
import { puntiDi, risorseGiocatore } from "./regole";
import type { Attesa, Attivato, Fatto, StatoPartita } from "./stato";
import type { CartaMancia, CartaNumero, CopiaCarta } from "./tipi-carte";

export interface VistaAvversario {
  carteInMano: number;
  nascosti: number;
  mancia: CartaMancia[];
  attacchi: CopiaCarta[];
  attivati: Attivato[];
  punti: number;
}

export interface VistaGiocatore {
  io: IdGiocatore;
  ordine: IdGiocatore[];
  numeroTurno: number;
  ultimoTurno: number | null;
  finita: boolean;
  opzioni: StatoPartita["opzioni"];
  turno: {
    giocatore: IdGiocatore;
    mosseRimaste: number;
    /** Solo per chi deve fare la scelta. */
    attesa: Attesa | null;
  };
  tavolo: StatoPartita["tavolo"];
  /** Numero di carte coperte rimaste in ogni mazzo e negli scarti. */
  mazzi: { numeri: number; personaggi: number; mancia: number };
  scarti: { numeri: number; personaggi: number; mancia: number };
  /** Le proprie carte numero e i propri personaggi nascosti. */
  mano: CartaNumero[];
  nascosti: CopiaCarta[];
  /** Tutti i giocatori (per sé stessi i numeri coincidono con mano e nascosti). */
  giocatori: Record<IdGiocatore, VistaAvversario>;
  /** Ultime cose successe (solo informazioni pubbliche), dalla più vecchia alla più recente. */
  registro: Fatto[];
}

export function vistaGiocatore(s: StatoPartita, id: IdGiocatore): VistaGiocatore {
  const g = s.giocatori[id];
  if (!g) throw new Error("Giocatore non in partita");
  const attesa = !s.finita && s.turno.attesa?.giocatore === id ? structuredClone(s.turno.attesa) : null;
  return {
    io: id,
    ordine: [...s.ordine],
    numeroTurno: s.numeroTurno,
    ultimoTurno: s.ultimoTurno,
    finita: s.finita,
    opzioni: { ...s.opzioni },
    turno: { giocatore: s.turno.giocatore, mosseRimaste: s.turno.mosseRimaste, attesa },
    tavolo: structuredClone(s.tavolo),
    mazzi: { numeri: s.mazzi.numeri.length, personaggi: s.mazzi.personaggi.length, mancia: s.mazzi.mancia.length },
    scarti: { numeri: s.scarti.numeri.length, personaggi: s.scarti.personaggi.length, mancia: s.scarti.mancia.length },
    mano: structuredClone(g.mano),
    nascosti: structuredClone(g.nascosti),
    registro: structuredClone(s.registro),
    giocatori: Object.fromEntries(
      s.ordine.map((x) => {
        const o = s.giocatori[x]!;
        const v: VistaAvversario = {
          carteInMano: o.mano.length,
          nascosti: o.nascosti.length,
          mancia: structuredClone(o.mancia),
          attacchi: structuredClone(o.attacchi),
          attivati: structuredClone(o.attivati),
          punti: puntiDi(o),
        };
        return [x, v];
      }),
    ),
  };
}

/**
 * Cosa vede uno spettatore (o lo schermo "tavolo"): solo le informazioni pubbliche.
 * Stessa forma della vista di un giocatore, con `io` vuoto, mano e nascosti vuoti.
 */
export function vistaPubblica(s: StatoPartita): VistaGiocatore {
  const v = vistaGiocatore(s, s.ordine[0]!);
  return { ...v, io: "", turno: { ...v.turno, attesa: null }, mano: [], nascosti: [] };
}

/** Le proprie risorse per i codici, ricavate dalla propria vista (le usa il browser). */
export function risorseDaVista(v: VistaGiocatore): Risorse {
  return risorseGiocatore({ mano: v.mano, mancia: v.giocatori[v.io]!.mancia });
}
