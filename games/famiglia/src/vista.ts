/**
 * Cosa vede un giocatore. Mai le carte numero o i personaggi nascosti degli altri,
 * mai il contenuto o l'ordine dei mazzi coperti, mai lo stato del generatore casuale.
 * Degli altri si vede: quante carte hanno in mano e nascoste, vetrina, mancia, attacchi in attesa e attivati.
 * Eccezioni previste dalle regole:
 * - Studia il fascicolo: per tutto il turno si vedono le carte in mano dell'avversario scelto;
 * - Ne ho viste tante e Ogni cosa al suo posto: chi sceglie vede le carte prese dal mazzo;
 * - Vincenzo e Patate al forno: le carte scoperte tra cui scegliere le vedono tutti;
 * - Schietta: le carte mostrate le vedono tutti per il resto del turno.
 */
import type { IdGiocatore } from "@og/engine";
import { puntiDi, quantiBlu, risorseGiocatore } from "./base";
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
  /** Punti in tutto (carte, famiglie al completo e poteri). */
  punti: number;
  /** Di cui guadagnati con i poteri (attacchi a segno, difese riuscite). */
  puntiPoteri: number;
}

export interface VistaGiocatore {
  io: IdGiocatore;
  ordine: IdGiocatore[];
  numeroTurno: number;
  ultimoTurno: number | null;
  finita: boolean;
  opzioni: StatoPartita["opzioni"];
  turno: Pick<StatoTurno, "giocatore" | "mosseRimaste" | "mosseUguali" | "doppioTurno"> & {
    /** Solo per chi deve fare la scelta. */
    attesa: Attesa | null;
    /** Chi deve fare una scelta adesso (visibile a tutti), se qualcuno. */
    sceglie: IdGiocatore | null;
    /** Poteri blu già usati in questo turno (solo per chi è di turno). */
    bluUsati: string[];
    /** Indigestione (Alessia): a fine turno si scarta 1 carta in più. */
    indigestione: boolean;
    /** Chi è di turno non può usare poteri (Parla parla parla). */
    zitto: boolean;
    /** Chi è di turno non può attivare personaggi (Una sigaretta fuori al bar). */
    senzaAttivare: boolean;
    /** Aiuto che aspetta la risposta di Stuffosa (visibile a tutti, senza le scelte di chi l'ha usato). */
    aiutoSospeso: { di: IdGiocatore; carta: string; potere: string } | null;
    /** Carte mostrate a tutti in questo turno (Schietta). */
    rivelati: StatoTurno["rivelati"];
  };
  /** Attacco in corso (informazioni pubbliche). */
  attacco: Pick<AttaccoInCorso, "attaccante" | "da" | "carta" | "potere" | "livello" | "bersaglio" | "controTutti" | "indifendibile"> | null;
  /** Benedizione di Don Pasquale in corso (di chi). */
  benedizione: IdGiocatore | null;
  /** Total black: il tavolo resta vuoto fino al prossimo turno di questo giocatore. */
  buio: IdGiocatore | null;
  /** La vita è una ruota: si gioca in senso antiorario. */
  antiorario: boolean;
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
  /** La pila degli scarti numeri è scoperta (serve a Medico in famiglia): l'ultima è in fondo. */
  scartiNumeri: CartaNumero[];
  /** La pila degli scarti personaggi è scoperta (serve a Medico in famiglia): l'ultima è in fondo. */
  scartiPersonaggi: CopiaCarta[];
  /** Ne ho viste tante (blu): le prime 2 carte del mazzo personaggi, solo nel proprio turno (la prima è in cima). */
  cimaPersonaggi?: CopiaCarta[];
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
      doppioTurno: t.doppioTurno,
      attesa: !s.finita && t.attesa?.giocatore === id ? structuredClone(t.attesa) : null,
      sceglie: s.finita ? null : (t.attesa?.giocatore ?? null),
      bluUsati: mioTurno ? [...t.bluUsati] : [],
      indigestione: t.indigestione,
      zitto: t.zitto,
      senzaAttivare: !!t.senzaAttivare,
      rivelati: structuredClone(t.rivelati),
      aiutoSospeso: t.aiutoSospeso ? { di: t.aiutoSospeso.di, carta: t.aiutoSospeso.carta, potere: t.aiutoSospeso.potere } : null,
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
    antiorario: !!s.antiorario,
    buio: s.buio ?? null,
    tregua: s.tregua,
    ultimoPotere: s.ultimoPotere ? { ...s.ultimoPotere } : null,
    evento: s.evento ? { ...s.evento } : null,
    eventiNelMazzo: s.eventi.mazzo.length + s.eventi.scarti.length,
    tavolo: structuredClone(s.tavolo),
    mazzi: { numeri: s.mazzi.numeri.length, personaggi: s.mazzi.personaggi.length, mancia: s.mazzi.mancia.length },
    scarti: { numeri: s.scarti.numeri.length, personaggi: s.scarti.personaggi.length, mancia: s.scarti.mancia.length },
    scartiNumeri: structuredClone(s.scarti.numeri),
    scartiPersonaggi: structuredClone(s.scarti.personaggi),
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
          punti: puntiDi(o, s.opzioni),
          puntiPoteri: o.puntiPoteri ?? 0,
        };
        return [x, v];
      }),
    ),
  };
  if (mioTurno && quantiBlu(g, "ne-ho-viste-tante") > 0) vista.cimaPersonaggi = structuredClone(s.mazzi.personaggi.slice(-2).reverse());
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
  const { cimaPersonaggi: _cima, ...pubblica } = v;
  return { ...pubblica, io: "", turno: { ...v.turno, attesa: null, bluUsati: [] }, mano: [], nascosti: [] };
}

/** Le proprie risorse per i codici, ricavate dalla propria vista (le usa il browser). */
export function risorseDaVista(v: VistaGiocatore): Risorse {
  const io = v.giocatori[v.io]!;
  return risorseGiocatore({ mano: v.mano, vetrina: io.vetrina, mancia: io.mancia });
}
