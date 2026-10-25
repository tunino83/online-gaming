/**
 * Cosa vede un giocatore. Mai le carte numero o i personaggi nascosti degli altri,
 * mai il contenuto o l'ordine dei mazzi coperti, mai lo stato del generatore casuale.
 * Degli altri si vede: quante carte hanno in mano e nascoste, vetrina, mancia, attacchi in attesa e attivati.
 * Eccezioni previste dalle regole:
 * - Studia il fascicolo: per tutto il turno si vedono le carte in mano dell'avversario scelto;
 * - Ne ho viste tante e Ogni cosa al suo posto: chi sceglie vede le carte prese dal mazzo;
 * - Vincenzo e Patate al forno: le carte scoperte tra cui scegliere le vedono tutti;
 * - Schietta e Zeppata difensiva: le carte mostrate le vedono tutti per il resto del turno.
 */
import type { IdGiocatore } from "@og/engine";
import { puntiDi, risorseGiocatore } from "./base";
import type { Risorse } from "./codici";
import type { AttaccoInCorso, Attesa, Attivato, Fatto, StatoPartita, StatoTurno } from "./stato";
import type { CartaMancia, CartaNumero, CopiaCarta } from "./tipi-carte";

export interface VistaAvversario {
  carteInMano: number;
  nascosti: number;
  vetrina: CartaNumero[];
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
  turno: Pick<StatoTurno, "giocatore" | "mosseRimaste" | "mosseUguali" | "pescaDoppia" | "doppioTurno"> & {
    /** Solo per chi deve fare la scelta. */
    attesa: Attesa | null;
    /** Chi deve fare una scelta adesso (visibile a tutti), se qualcuno. */
    sceglie: IdGiocatore | null;
    /** Carte prese con Alessia: solo per chi è di turno. */
    intoccabili: string[];
    /** Chi è di turno non può usare poteri (Parla parla parla). */
    zitto: boolean;
    /** Carte mostrate a tutti in questo turno (Schietta, Zeppata difensiva). */
    rivelati: StatoTurno["rivelati"];
  };
  /** Attacco in corso (informazioni pubbliche). */
  attacco: Pick<AttaccoInCorso, "attaccante" | "da" | "carta" | "potere" | "livello" | "bersaglio" | "controTutti" | "indifendibile"> | null;
  /** Benedizione di Don Pasquale in corso (di chi). */
  benedizione: IdGiocatore | null;
  /** Nevicava: nessuno può attaccare fino a questo turno compreso. */
  tregua: number | null;
  /** Ultimo potere usato al tavolo (per Sempre la stessa storia). */
  ultimoPotere: StatoPartita["ultimoPotere"];
  /** Evento in corso e quanti turni dura ancora; quanti eventi restano nel mazzo. */
  evento: StatoPartita["evento"];
  eventiNelMazzo: number;
  tavolo: StatoPartita["tavolo"];
  /** Numero di carte coperte rimaste in ogni mazzo e negli scarti. */
  mazzi: { numeri: number; personaggi: number; mancia: number };
  scarti: { numeri: number; personaggi: number; mancia: number };
  /** La pila degli scarti numeri è scoperta (serve al Mercatino): l'ultima è in fondo. */
  scartiNumeri: CartaNumero[];
  /** Carte numero scoperte tra cui qualcuno sta scegliendo (Vincenzo, Patate al forno). */
  offerta: CartaNumero[];
  /** Le proprie carte numero e i propri personaggi nascosti. */
  mano: CartaNumero[];
  nascosti: CopiaCarta[];
  /** Tutti i giocatori (per sé stessi i numeri coincidono con mano e nascosti). */
  giocatori: Record<IdGiocatore, VistaAvversario>;
  /** Studia il fascicolo: le carte dell'avversario scelto, per tutto il proprio turno. */
  fascicolo?: { giocatore: IdGiocatore; mano: CartaNumero[]; nascosti: CopiaCarta[] };
  /** Ultime cose successe (solo informazioni pubbliche), dalla più vecchia alla più recente. */
  registro: Fatto[];
}

export function vistaGiocatore(s: StatoPartita, id: IdGiocatore): VistaGiocatore {
  const g = s.giocatori[id];
  if (!g) throw new Error("Giocatore non in partita");
  const t = s.turno;
  const mioTurno = !s.finita && t.giocatore === id;
  const vista: VistaGiocatore = {
    io: id,
    ordine: [...s.ordine],
    numeroTurno: s.numeroTurno,
    ultimoTurno: s.ultimoTurno,
    finita: s.finita,
    opzioni: { ...s.opzioni },
    turno: {
      giocatore: t.giocatore,
      mosseRimaste: t.mosseRimaste,
      mosseUguali: t.mosseUguali ? { ...t.mosseUguali } : null,
      pescaDoppia: t.pescaDoppia,
      doppioTurno: t.doppioTurno,
      attesa: !s.finita && t.attesa?.giocatore === id ? structuredClone(t.attesa) : null,
      sceglie: s.finita ? null : (t.attesa?.giocatore ?? null),
      intoccabili: mioTurno ? [...t.intoccabili] : [],
      zitto: t.zitto,
      rivelati: structuredClone(t.rivelati),
    },
    attacco: s.attacco
      ? {
          attaccante: s.attacco.attaccante,
          da: s.attacco.da,
          carta: s.attacco.carta,
          potere: s.attacco.potere,
          livello: s.attacco.livello,
          bersaglio: s.attacco.bersaglio,
          controTutti: s.attacco.controTutti,
          indifendibile: s.attacco.indifendibile,
        }
      : null,
    benedizione: s.benedizione,
    tregua: s.tregua,
    ultimoPotere: s.ultimoPotere ? { ...s.ultimoPotere } : null,
    evento: s.evento ? { ...s.evento } : null,
    eventiNelMazzo: s.eventi.mazzo.length + s.eventi.scarti.length,
    tavolo: structuredClone(s.tavolo),
    mazzi: { numeri: s.mazzi.numeri.length, personaggi: s.mazzi.personaggi.length, mancia: s.mazzi.mancia.length },
    scarti: { numeri: s.scarti.numeri.length, personaggi: s.scarti.personaggi.length, mancia: s.scarti.mancia.length },
    scartiNumeri: structuredClone(s.scarti.numeri),
    offerta: t.attesa?.tipo === "scegliNumeri" ? structuredClone(t.attesa.carte) : [],
    mano: structuredClone(g.mano),
    nascosti: structuredClone(g.nascosti),
    registro: structuredClone(s.registro),
    giocatori: Object.fromEntries(
      s.ordine.map((x) => {
        const o = s.giocatori[x]!;
        const v: VistaAvversario = {
          carteInMano: o.mano.length,
          nascosti: o.nascosti.length,
          vetrina: structuredClone(o.vetrina),
          mancia: structuredClone(o.mancia),
          attacchi: structuredClone(o.attacchi),
          attivati: structuredClone(o.attivati),
          punti: puntiDi(o),
        };
        return [x, v];
      }),
    ),
  };
  if (mioTurno && t.fascicolo) {
    const o = s.giocatori[t.fascicolo]!;
    vista.fascicolo = { giocatore: t.fascicolo, mano: structuredClone(o.mano), nascosti: structuredClone(o.nascosti) };
  }
  return vista;
}

/**
 * Cosa vede uno spettatore (o lo schermo "tavolo"): solo le informazioni pubbliche.
 * Stessa forma della vista di un giocatore, con `io` vuoto, mano e nascosti vuoti, niente scelte private.
 */
export function vistaPubblica(s: StatoPartita): VistaGiocatore {
  const { fascicolo: _privato, ...v } = vistaGiocatore(s, s.ordine[0]!);
  return { ...v, io: "", turno: { ...v.turno, attesa: null, intoccabili: [] }, mano: [], nascosti: [] };
}

/** Le proprie risorse per i codici, ricavate dalla propria vista (le usa il browser). */
export function risorseDaVista(v: VistaGiocatore): Risorse {
  const io = v.giocatori[v.io]!;
  return risorseGiocatore({ mano: v.mano, vetrina: io.vetrina, mancia: io.mancia });
}
