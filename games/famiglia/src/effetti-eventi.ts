/**
 * Effetti delle carte evento (vedi docs/famiglia/bozza.md, "Carte evento").
 * Un evento si pesca con una mossa, solo se non ce n'è uno in corso; vale da subito per il numero di turni
 * scritto sulla carta (contando quello in cui si pesca). "Chi ha X" = chi ha almeno una carta di X attivata.
 */
import { type IdGiocatore, interoTra, mescola } from "@og/engine";
import { haPersona, pesca, registra, rifiuta, scartaNumeri } from "./base";
import { carta } from "./carte";
import { evento } from "./eventi";
import type { StatoPartita } from "./stato";

const inCorso = (s: StatoPartita, id: string) => s.evento?.id === id;

/** Mosse in più (o in meno) in ogni turno, per l'evento in corso. */
export function mosseDaEvento(s: StatoPartita, id: IdGiocatore): number {
  const g = s.giocatori[id]!;
  switch (s.evento?.id) {
    case "natale":
      return haPersona(g, "nonna-dina") || haPersona(g, "gerardina") ? 1 : -1;
    case "matrimonio":
      return -1;
    case "carnevale-di-teora":
    case "sagra-delle-tomacelle":
      return haPersona(g, "toto") ? -1 : 0;
    default:
      return 0;
  }
}

/** I poteri di questa carta, per l'evento in corso, non si possono usare? (Totò al Carnevale e alla Sagra.) */
export const poteriBloccati = (s: StatoPartita, idCarta: string): boolean =>
  (inCorso(s, "carnevale-di-teora") || inCorso(s, "sagra-delle-tomacelle")) && carta(idCarta).persona === "toto";

/** Pesca un evento: comincia subito. */
export function pescaEvento(s: StatoPartita, id: IdGiocatore): void {
  if (s.evento) rifiuta("C'è già un evento in corso");
  if (s.eventi.mazzo.length === 0) {
    if (s.eventi.scarti.length === 0) rifiuta("Non ci sono eventi da pescare");
    s.eventi.mazzo = mescola(s.rng, s.eventi.scarti);
    s.eventi.scarti = [];
  }
  const e = evento(s.eventi.mazzo.pop()!);
  s.evento = { id: e.id, turniRimasti: e.durata };
  registra(s, id, { tipo: "evento", evento: e.id });
  inizioEvento(s);
  // L'evento vale già nel turno in cui si pesca
  s.turno.mosseRimaste = Math.max(0, s.turno.mosseRimaste + mosseDaEvento(s, id));
  inizioTurnoConEvento(s, id);
}

/** Si può pescare un evento adesso? */
export const puoPescareEvento = (s: StatoPartita) => s.evento === null && s.eventi.mazzo.length + s.eventi.scarti.length > 0;

/** Effetti che succedono una volta, quando l'evento comincia. */
function inizioEvento(s: StatoPartita): void {
  const ricarica = (...persone: string[]) => {
    for (const g of Object.values(s.giocatori)) for (const a of g.attivati) if (persone.includes(carta(a.copia.carta).persona)) a.stanca = 0;
  };
  switch (s.evento!.id) {
    case "carnevale-di-teora":
    case "sagra-delle-tomacelle":
      ricarica("squacqualacchione");
      break;
    case "la-resurrezione":
      ricarica("toto");
      break;
    case "matrimonio":
      ricarica("don-pasquale", "donato");
      // Il regalo agli sposi: ognuno perde una carta numero (a caso) dalla mano
      for (const id of s.ordine) {
        const mano = s.giocatori[id]!.mano;
        if (mano.length > 0) scartaNumeri(s, mano.splice(interoTra(s.rng, 0, mano.length - 1), 1));
      }
      break;
    case "funerale": {
      ricarica("franchino", "don-pasquale");
      // Tutti passano una carta numero al giocatore alla propria destra (il successivo), che la sceglie a carte coperte
      const date = s.ordine.map((id) => {
        const mano = s.giocatori[id]!.mano;
        return mano.length > 0 ? mano.splice(interoTra(s.rng, 0, mano.length - 1), 1)[0]! : null;
      });
      s.ordine.forEach((_, i) => {
        const c = date[i];
        if (c) s.giocatori[s.ordine[(i + 1) % s.ordine.length]!]!.mano.push(c);
      });
      break;
    }
  }
}

/** Cosa fa l'evento all'inizio di un turno (e nel turno in cui comincia): La Resurrezione. */
export function inizioTurnoConEvento(s: StatoPartita, id: IdGiocatore): void {
  if (inCorso(s, "la-resurrezione") && haPersona(s.giocatori[id]!, "toto") && !s.turno.attesa) {
    const c = pesca(s, "numeri");
    if (c) s.turno.attesa = { tipo: "regalo", giocatore: id, carta: c };
  }
}

/** La Resurrezione: la carta in più va al giocatore scelto (anche a sé stessi). */
export function regala(s: StatoPartita, id: IdGiocatore, a: IdGiocatore): void {
  const attesa = s.turno.attesa;
  if (attesa?.tipo !== "regalo") rifiuta("Non c'è niente da regalare");
  if (!s.ordine.includes(a)) rifiuta("Scegli un giocatore");
  s.giocatori[a]!.mano.push((attesa as Extract<typeof attesa, { tipo: "regalo" }>).carta);
  s.turno.attesa = null;
  registra(s, id, { tipo: "regalo", a });
}

/** A fine turno l'evento dura un turno in meno; quando finisce va negli scarti. */
export function fineTurnoEvento(s: StatoPartita): void {
  if (!s.evento) return;
  s.evento.turniRimasti -= 1;
  if (s.evento.turniRimasti > 0) return;
  registra(s, s.turno.giocatore, { tipo: "fineEvento", evento: s.evento.id });
  s.eventi.scarti.push(s.evento.id);
  s.evento = null;
}
