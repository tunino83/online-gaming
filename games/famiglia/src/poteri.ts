/**
 * Uso dei poteri dei personaggi attivati e poteri di aiuto ✨ (vedi docs/famiglia/bozza.md e le decisioni in regolamento.md).
 * Usare un potere costa una mossa (lo conta regole.ts; Non sbaglio mai no); poi la carta diventa stanca per il suo tempo di ricarica.
 * Gli attacchi e le difese sono in attacchi.ts.
 */
import { type IdGiocatore, mescola } from "@og/engine";
import {
  avversariDopo,
  pesca,
  peschiNumeri,
  puoPescare,
  registra,
  riceviCarta,
  riempiTavolo,
  rifiuta,
  scartaNumeri,
  stancaCarta,
  togliNumero,
} from "./base";
import { DIFESE_ANCHE_PROATTIVE, avviaAttacco, parametriAttacco } from "./attacchi";
import { carta } from "./carte";
import { poteriBloccati } from "./effetti-eventi";
import type { Attivato, Mossa, ParametriPotere, StatoGiocatore, StatoPartita } from "./stato";
import type { Carta, CartaNumero, CopiaCarta } from "./tipi-carte";

type MossaPotere = Extract<Mossa, { tipo: "potere" }>;

/** Poteri che copiano un altro potere (Sempre la stessa storia, Giacca al rovescio). */
export const POTERI_COPIA = new Set(["sempre-la-stessa-storia", "giacca-al-rovescio"]);

/**
 * Poteri che non costano mosse: Non sbaglio mai (la pescata sbagliata non conta) e quelli che danno mosse in più
 * (altrimenti spendere una mossa per averne una non servirebbe a niente: deciso il 2026-10-25).
 */
export const POTERI_GRATIS = new Set(["non-sbaglio-mai", "un-caffe", "prosecco", "te-l-ho-gia-detto", "l-ho-gia-detto"]);

/** Voci del menu di Generoso (Offre la casa). */
const MENU = ["caffe", "birra", "colazione"] as const;

/** Massimo di carte in vetrina (Checca). */
export const MAX_VETRINA = 3;

/* ------------------------------------------------------------------ */
/* Uso di un potere                                                    */
/* ------------------------------------------------------------------ */

/** Un potere si può copiare? Aiuti, attacchi e difese da usare nel proprio turno, ma non gli altri poteri che copiano. */
function copiabile(c: Carta, potere: string): boolean {
  const p = c.poteri.find((x) => x.id === potere);
  if (!p || POTERI_COPIA.has(potere)) return false;
  return p.tipo !== "difesa" || DIFESE_ANCHE_PROATTIVE.has(potere);
}

/** Il potere che si usa davvero: quello della carta, oppure quello copiato (Sempre la stessa storia, Giacca al rovescio). */
function potereDaUsare(s: StatoPartita, id: IdGiocatore, c: Carta, potere: string, m: ParametriPotere): { origine: Carta; potere: string } {
  if (potere === "sempre-la-stessa-storia") {
    const u = s.ultimoPotere;
    if (!u || !copiabile(carta(u.carta), u.potere)) rifiuta("Non c'è un potere da ripetere");
    return { origine: carta(u!.carta), potere: u!.potere };
  }
  if (potere === "giacca-al-rovescio") {
    const fonte = s.ordine
      .filter((x) => x !== id)
      .flatMap((x) => s.giocatori[x]!.attivati)
      .find((a) => a.copia.id === m.fonte && a.stanca === 0);
    if (!fonte) rifiuta("Scegli una carta attivata e carica di un avversario");
    const origine = carta(fonte!.copia.carta);
    const copiato = m.potereCopiato ?? origine.poteri[0]!.id;
    if (!copiabile(origine, copiato)) rifiuta("Questo potere non si può copiare");
    return { origine, potere: copiato };
  }
  return { origine: c, potere };
}

/**
 * Usa un potere di un proprio personaggio attivato e carico: aiuto, attacco, o difesa da usare nel proprio turno.
 * `appenaPescata` è la carta pescata con la mossa precedente (se lo era), per Non sbaglio mai:
 * regole.ts la azzera prima di ogni mossa, quindi la passa qui.
 */
export function usaPotere(s: StatoPartita, id: IdGiocatore, m: MossaPotere, appenaPescata: StatoPartita["turno"]["appenaPescata"]): void {
  const g = s.giocatori[id]!;
  const a = g.attivati.find((x) => x.copia.id === m.carta);
  if (!a) rifiuta("Puoi usare solo i poteri dei tuoi personaggi attivati");
  const c = carta(a!.copia.carta);
  const p = c.poteri.find((x) => x.id === m.potere);
  if (!p) rifiuta("Questo personaggio non ha quel potere");
  if (a!.stanca > 0) rifiuta("Questa carta è stanca: deve ricaricarsi");
  if (s.turno.zitto) rifiuta("In questo turno non puoi usare poteri (Parla parla parla)");
  if (poteriBloccati(s, c.id)) rifiuta("Durante questo evento Totò non può usare i suoi poteri");
  if (p!.tipo === "difesa" && !DIFESE_ANCHE_PROATTIVE.has(p!.id)) rifiuta("Questa difesa si usa quando ti attaccano");

  const { origine, potere } = potereDaUsare(s, id, c, p!.id, m);
  const tipo = origine.poteri.find((x) => x.id === potere)!.tipo;
  s.ultimoPotere = { carta: origine.id, potere };
  stancaCarta(s, a!);
  if (tipo === "attacco") {
    avviaAttacco(s, id, origine, potere, m, origine === c ? a!.copia.id : null);
    return;
  }
  let bersaglio: IdGiocatore | undefined;
  if (potere === "nuvola-di-fumo") g.protetto = true;
  else if (potere === "benedizione") s.benedizione = id;
  else bersaglio = applicaAiuto(s, id, g, a!, potere, m, appenaPescata);
  registra(s, id, { tipo: "potere", carta: origine.id, potere, ...(bersaglio ? { bersaglio } : {}) });
}

/** Applica l'effetto; restituisce il giocatore coinvolto (per il registro), se c'è. */
function applicaAiuto(
  s: StatoPartita,
  id: IdGiocatore,
  g: StatoGiocatore,
  questa: Attivato,
  potere: string,
  m: ParametriPotere,
  appenaPescata: StatoPartita["turno"]["appenaPescata"],
): IdGiocatore | undefined {
  const t = s.turno;
  switch (potere) {
    /* ---------------- mosse in più ---------------- */
    case "ci-penso-domani":
      g.mosseProssimoTurno += 2;
      return;
    case "un-caffe":
      t.mosseRimaste += 1;
      return;
    case "anima-della-festa":
      t.mosseRimaste += 3;
      return;
    case "prosecco":
      t.mosseRimaste += 1;
      peschiNumeri(s, id, 1);
      return;
    case "doppio-turno":
      t.doppioTurno = true;
      return;
    case "te-l-ho-gia-detto":
    case "l-ho-gia-detto": {
      if (!t.ultimaMossa) rifiuta("Prima devi fare una mossa da ripetere");
      const quante = potere === "te-l-ho-gia-detto" ? 1 : 2;
      const gia = t.mosseUguali?.tipo === t.ultimaMossa ? t.mosseUguali!.quante : 0;
      t.mosseUguali = { tipo: t.ultimaMossa!, quante: gia + quante };
      return;
    }

    /* ---------------- pescare ---------------- */
    case "l-orto":
    case "ho-tanta-fame":
      peschiNumeri(s, id, 2);
      return;
    case "cucina-per-200":
      peschiNumeri(s, id, 4);
      for (const altro of avversariDopo(s, id)) {
        const c = pesca(s, "numeri");
        if (c) s.giocatori[altro]!.mano.push(c);
      }
      return;
    case "colazione":
      peschiNumeri(s, id, 1);
      pescaPersonaggio(s, id);
      return;
    case "offre-la-casa": {
      const scelte = m.scelte ?? [];
      if (scelte.length !== 2 || scelte[0] === scelte[1] || !scelte.every((x) => (MENU as readonly string[]).includes(x))) {
        rifiuta("Scegli 2 voci diverse tra caffè, birra e colazione");
      }
      for (const voce of scelte) {
        if (voce === "caffe") t.mosseRimaste += 2;
        else if (voce === "birra") peschiNumeri(s, id, 2);
      }
      if (scelte.includes("colazione")) pescaPersonaggio(s, id); // per ultima: può chiedere di scartare
      return;
    }
    case "sono-due-etti-e-mezzo-lascio":
      t.pescaDoppia = true;
      return;
    case "frigge-di-tutto": {
      const carte = carteDallaMano(g, m.carte, 1, Infinity);
      scartaNumeri(s, carte);
      peschiNumeri(s, id, carte.length + 1);
      return;
    }
    case "vende-la-carne": {
      const i = g.nascosti.findIndex((c) => c.id === m.bersaglio);
      if (i < 0) rifiuta("Scegli un tuo personaggio nascosto da scartare");
      s.scarti.personaggi.push(...g.nascosti.splice(i, 1));
      peschiNumeri(s, id, 3);
      return;
    }
    case "non-sbaglio-mai": {
      if (!appenaPescata) rifiuta("Si usa subito dopo aver pescato una carta");
      if (appenaPescata!.mazzo === "numeri") {
        const c = togliNumero(g, appenaPescata!.id);
        if (!c) rifiuta("Non hai più la carta appena pescata");
        scartaNumeri(s, [c!]);
        const nuova = pesca(s, "numeri");
        if (nuova) g.mano.push(nuova);
      } else {
        const zona = g.nascosti.some((c) => c.id === appenaPescata!.id) ? g.nascosti : g.attacchi;
        const i = zona.findIndex((c) => c.id === appenaPescata!.id);
        if (i < 0) rifiuta("Non hai più la carta appena pescata");
        s.scarti.personaggi.push(...zona.splice(i, 1));
        pescaPersonaggio(s, id);
      }
      return;
    }

    /* ---------------- tavolo e scarti ---------------- */
    case "sposta-i-mobili":
      s.scarti.numeri.push(...s.tavolo.numeri.filter((c) => c !== null));
      s.scarti.personaggi.push(...s.tavolo.personaggi.filter((c) => c !== null));
      s.tavolo.numeri = s.tavolo.numeri.map(() => null);
      s.tavolo.personaggi = s.tavolo.personaggi.map(() => null);
      riempiTavolo(s);
      return;
    case "scaffale": {
      const disponibili = s.tavolo.numeri.flatMap((c, i) => (c ? [i] : []));
      const posizioni = m.posizioni ?? [];
      if (new Set(posizioni).size !== posizioni.length || posizioni.length !== Math.min(2, disponibili.length)) {
        rifiuta("Scegli 2 carte numero diverse dal tavolo");
      }
      for (const pos of posizioni) {
        const c = s.tavolo.numeri[pos];
        if (!c) rifiuta("Nessuna carta in quella posizione");
        g.mano.push(c!);
        s.tavolo.numeri[pos] = null;
      }
      return;
    }
    case "mangia-mangia-mangia":
      for (const [i, c] of s.tavolo.numeri.entries()) {
        if (!c) continue;
        g.mano.push(c);
        t.intoccabili.push(c.id);
        s.tavolo.numeri[i] = null;
      }
      return;
    case "lezione-di-padel": {
      const [mia] = carteDallaMano(g, m.carte, 1, 1);
      if (mia!.unite) rifiuta("Una carta fatta in casa non va sul tavolo"); // la mossa rifiutata non cambia niente
      const pos = m.posizioni?.length === 1 ? m.posizioni[0]! : -1;
      const dalTavolo = s.tavolo.numeri[pos];
      if (!dalTavolo) rifiuta("Scegli una carta numero del tavolo");
      s.tavolo.numeri[pos] = mia!;
      g.mano.push(dalTavolo!);
      return;
    }
    case "mercatino": {
      const i = s.scarti.numeri.findIndex((c) => c.id === m.bersaglio);
      if (i < 0) rifiuta("Scegli una carta dagli scarti numeri");
      g.mano.push(...s.scarti.numeri.splice(i, 1));
      return;
    }
    case "ce-l-ho-io": {
      const v = m.valore;
      if (!Number.isInteger(v) || v! < 1 || v! > 8) rifiuta("Scegli un numero da 1 a 8");
      const i = s.mazzi.numeri.findIndex((c) => c.valore === v);
      if (i >= 0) {
        g.mano.push(...s.mazzi.numeri.splice(i, 1));
        s.mazzi.numeri = mescola(s.rng, s.mazzi.numeri); // chi l'ha cercata ha visto il mazzo: si rimescola
      }
      return; // se nel mazzo non c'è, non si prende niente
    }

    /* ---------------- scelte tra carte scoperte ---------------- */
    case "frutta-e-verdura": {
      const carte = pescaFinoA(s, 4);
      if (carte.length > 0) t.attesa = { tipo: "scegliNumeri", giocatore: id, motivo: "frutta", carte, quante: Math.min(2, carte.length), coda: [] };
      return;
    }
    case "patate-al-forno": {
      const carte = pescaFinoA(s, s.ordine.length - 1);
      if (carte.length > 0) t.attesa = { tipo: "scegliNumeri", giocatore: id, motivo: "patate", carte, quante: 1, coda: avversariDopo(s, id) };
      return;
    }
    case "ne-ho-viste-tante": {
      const carte: CopiaCarta[] = [];
      for (let i = 0; i < 3; i++) {
        const c = pesca(s, "personaggi");
        if (c) carte.push(c);
      }
      if (carte.length > 0) t.attesa = { tipo: "scegliPersonaggio", giocatore: id, carte };
      return;
    }
    case "ogni-cosa-al-suo-posto": {
      const carte = pescaFinoA(s, 5);
      if (carte.length > 0) t.attesa = { tipo: "riordina", giocatore: id, carte };
      return;
    }

    /* ---------------- carte numero in mano ---------------- */
    case "fatto-in-casa": {
      const coppia = carteDallaMano(g, m.carte, 2, 2);
      const valore = coppia[0]!.valore + coppia[1]!.valore;
      if (valore > 8) rifiuta("La somma deve essere al massimo 8"); // la mossa rifiutata non cambia niente
      g.mano.push({ id: `casa-${coppia[0]!.id}`, valore: valore as CartaNumero["valore"], unite: [coppia[0]!, coppia[1]!] });
      return;
    }
    case "la-vetrina-della-collezione": {
      const carte = carteDallaMano(g, m.carte, 1, MAX_VETRINA - g.vetrina.length);
      g.vetrina.push(...carte);
      return;
    }

    /* ---------------- ricarica e informazioni ---------------- */
    case "brace-accesa": {
      const altra = g.attivati.find((x) => x.copia.id === m.bersaglio && x !== questa && x.stanca > 0);
      if (!altra) rifiuta("Scegli un'altra tua carta stanca");
      altra!.stanca = 0;
      return;
    }
    case "grigliata":
      for (const x of g.attivati) if (x !== questa) x.stanca = 0;
      return;
    case "ricetta": {
      for (const giocatore of s.ordine) {
        const x = s.giocatori[giocatore]!.attivati.find((y) => y.copia.id === m.bersaglio && y.stanca > 0);
        if (x) {
          x.stanca = 0;
          return giocatore === id ? undefined : giocatore;
        }
      }
      return rifiuta("Scegli una carta stanca");
    }
    case "studia-il-fascicolo": {
      if (!m.giocatore || m.giocatore === id || !s.ordine.includes(m.giocatore)) rifiuta("Scegli un avversario");
      t.fascicolo = m.giocatore!;
      return m.giocatore;
    }
  }
  return rifiuta("Potere sconosciuto");
}

/** Pesca un personaggio e lo mette nella zona giusta (se la zona è piena, il giocatore sceglie cosa scartare). */
function pescaPersonaggio(s: StatoPartita, id: IdGiocatore): void {
  const c = pesca(s, "personaggi");
  if (c) riceviCarta(s, id, c);
}

/** Fino a `quante` carte dal mazzo numeri, scoperte (per Vincenzo, Patate, Ogni cosa al suo posto). */
function pescaFinoA(s: StatoPartita, quante: number): CartaNumero[] {
  const carte: CartaNumero[] = [];
  for (let i = 0; i < quante; i++) {
    const c = pesca(s, "numeri");
    if (c) carte.push(c);
  }
  return carte;
}

/** Toglie dalla mano le carte indicate (da `min` a `max`, senza ripetizioni) e le restituisce. */
function carteDallaMano(g: StatoGiocatore, ids: string[] | undefined, min: number, max: number): CartaNumero[] {
  const lista = ids ?? [];
  if (new Set(lista).size !== lista.length || lista.length < min || lista.length > max) {
    const quante = (n: number) => (n === 1 ? "1 carta numero" : `${n} carte numero`);
    rifiuta(min === max ? `Scegli ${quante(min)} dalla mano` : `Scegli da ${min} a ${quante(max)} dalla mano`);
  }
  if (!lista.every((x) => g.mano.some((c) => c.id === x))) rifiuta("Puoi scegliere solo carte che hai in mano");
  return lista.map((x) => g.mano.splice(g.mano.findIndex((c) => c.id === x), 1)[0]!);
}

/* ------------------------------------------------------------------ */
/* Risposte alle scelte dei poteri                                     */
/* ------------------------------------------------------------------ */

/** Il giocatore risponde a una scelta aperta da un potere (Vincenzo, Patate, Ne ho viste tante, Ogni cosa al suo posto). */
export function rispondiScelta(s: StatoPartita, id: IdGiocatore, m: Mossa): void {
  const a = s.turno.attesa;
  const g = s.giocatori[id]!;
  if (a?.tipo === "scegliNumeri" && m.tipo === "scegli") {
    const quante = Math.min(a.quante, a.carte.length);
    if (new Set(m.carte).size !== m.carte.length || m.carte.length !== quante) rifiuta(`Scegli ${quante} carte`);
    if (!m.carte.every((x) => a.carte.some((c) => c.id === x))) rifiuta("Scegli tra le carte scoperte");
    g.mano.push(...a.carte.filter((c) => m.carte.includes(c.id)));
    const resto = a.carte.filter((c) => !m.carte.includes(c.id));
    registra(s, id, { tipo: "sceglie", quante });
    if (a.motivo === "patate" && resto.length > 0 && a.coda.length > 0) {
      s.turno.attesa = { ...a, giocatore: a.coda[0]!, carte: resto, coda: a.coda.slice(1) };
    } else {
      scartaNumeri(s, resto);
      s.turno.attesa = null;
    }
    return;
  }
  if (a?.tipo === "scegliPersonaggio" && m.tipo === "scegli") {
    const scelta = m.carte.length === 1 ? a.carte.find((c) => c.id === m.carte[0]) : undefined;
    if (!scelta) rifiuta("Scegli uno dei personaggi");
    // Le altre tornano in cima al mazzo, nello stesso ordine di prima
    s.mazzi.personaggi.push(...a.carte.filter((c) => c !== scelta).reverse());
    s.turno.attesa = null;
    registra(s, id, { tipo: "sceglie", quante: 1 });
    riceviCarta(s, id, scelta!);
    return;
  }
  if (a?.tipo === "riordina" && m.tipo === "riordina") {
    const ids = a.carte.map((c) => c.id);
    if (m.ordine.length !== ids.length || [...m.ordine].sort().join() !== [...ids].sort().join()) rifiuta("Rimetti tutte le carte, ognuna una volta");
    const perId = new Map(a.carte.map((c) => [c.id, c]));
    s.mazzi.numeri.push(...[...m.ordine].reverse().map((x) => perId.get(x)!));
    s.turno.attesa = null;
    return;
  }
  rifiuta("Prima devi completare la scelta in sospeso");
}

/** Mosse valide per rispondere a una scelta aperta da un potere (alcune possibilità, non tutte). */
export function mosseDiScelta(s: StatoPartita): Mossa[] {
  const a = s.turno.attesa;
  if (a?.tipo === "scegliNumeri") {
    const quante = Math.min(a.quante, a.carte.length);
    const ids = a.carte.map((c) => c.id);
    return quante === 1 ? ids.map((x) => ({ tipo: "scegli", carte: [x] })) : coppie(ids).map((carte) => ({ tipo: "scegli", carte }));
  }
  if (a?.tipo === "scegliPersonaggio") return a.carte.map((c) => ({ tipo: "scegli", carte: [c.id] }));
  if (a?.tipo === "riordina") {
    const ids = a.carte.map((c) => c.id);
    return [{ tipo: "riordina", ordine: ids }, { tipo: "riordina", ordine: [...ids].reverse() }];
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Poteri che si possono usare adesso                                  */
/* ------------------------------------------------------------------ */

/** Usi possibili dei poteri (con alcune scelte dei parametri, non tutte). */
export function mosseDiPotere(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.turno.zitto) return [];
  const g = s.giocatori[id]!;
  const mosse: Mossa[] = [];
  for (const a of g.attivati) {
    if (a.stanca > 0 || poteriBloccati(s, a.copia.carta)) continue;
    const c = carta(a.copia.carta);
    for (const p of c.poteri) {
      if (p.tipo === "difesa" && !DIFESE_ANCHE_PROATTIVE.has(p.id)) continue;
      const base = { tipo: "potere" as const, carta: a.copia.id, potere: p.id };
      for (const parametri of usiPossibili(s, id, g, a, c, p.id)) mosse.push({ ...base, ...parametri });
    }
  }
  return mosse;
}

/** Scelte possibili per un potere, compresi quelli copiati. */
function usiPossibili(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, a: Attivato, c: Carta, potere: string): ParametriPotere[] {
  if (potere === "sempre-la-stessa-storia") {
    const u = s.ultimoPotere;
    return u && copiabile(carta(u.carta), u.potere) ? parametriDi(s, id, g, a, carta(u.carta), u.potere) : [];
  }
  if (potere === "giacca-al-rovescio") {
    return s.ordine
      .filter((x) => x !== id)
      .flatMap((x) => s.giocatori[x]!.attivati.filter((y) => y.stanca === 0))
      .flatMap((y) => {
        const origine = carta(y.copia.carta);
        return origine.poteri
          .filter((q) => copiabile(origine, q.id))
          .flatMap((q) => parametriDi(s, id, g, a, origine, q.id).slice(0, 3).map((x) => ({ ...x, fonte: y.copia.id, potereCopiato: q.id })));
      })
      .slice(0, 12);
  }
  return parametriDi(s, id, g, a, c, potere);
}

function parametriDi(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, a: Attivato, c: Carta, potere: string): ParametriPotere[] {
  const tipo = c.poteri.find((x) => x.id === potere)!.tipo;
  if (tipo === "attacco") return parametriAttacco(s, id, potere);
  if (tipo === "difesa") return [{}]; // Nuvola di fumo, Benedizione
  return parametriPossibili(s, id, g, a, potere);
}

function parametriPossibili(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, questa: Attivato, potere: string): ParametriPotere[] {
  const t = s.turno;
  const mano = g.mano.map((c) => c.id);
  const posizioniNumeri = s.tavolo.numeri.flatMap((c, i) => (c ? [i] : []));
  switch (potere) {
    case "te-l-ho-gia-detto":
    case "l-ho-gia-detto":
      return t.ultimaMossa ? [{}] : [];
    case "non-sbaglio-mai":
      return t.appenaPescata ? [{}] : [];
    case "offre-la-casa":
      return [["caffe", "birra"], ["caffe", "colazione"], ["birra", "colazione"]].map((scelte) => ({ scelte }));
    case "frigge-di-tutto":
      return mano.length === 0 ? [] : [{ carte: mano }, ...mano.slice(0, 5).map((x) => ({ carte: [x] }))];
    case "vende-la-carne":
      return g.nascosti.map((c) => ({ bersaglio: c.id }));
    case "mercatino": {
      const perValore = new Map(s.scarti.numeri.map((c) => [c.valore, c.id]));
      return [...perValore.values()].map((bersaglio) => ({ bersaglio }));
    }
    case "scaffale":
      if (posizioniNumeri.length === 0) return [];
      return posizioniNumeri.length === 1 ? [{ posizioni: posizioniNumeri }] : coppie(posizioniNumeri).map((posizioni) => ({ posizioni }));
    case "mangia-mangia-mangia":
      return posizioniNumeri.length > 0 ? [{}] : [];
    case "lezione-di-padel":
      return g.mano
        .filter((c) => !c.unite)
        .slice(0, 4)
        .flatMap((c) => posizioniNumeri.map((p) => ({ carte: [c.id], posizioni: [p] })));
    case "ce-l-ho-io":
      return [1, 2, 3, 4, 5, 6, 7, 8].map((valore) => ({ valore }));
    case "fatto-in-casa": {
      const somme = coppie(mano).filter(([a, b]) => valoreDi(g, a!) + valoreDi(g, b!) <= 8);
      return somme.slice(0, 6).map((carte) => ({ carte }));
    }
    case "la-vetrina-della-collezione": {
      const posto = MAX_VETRINA - g.vetrina.length;
      if (posto <= 0 || mano.length === 0) return [];
      return [{ carte: mano.slice(0, posto) }, ...mano.slice(0, 4).map((x) => ({ carte: [x] }))];
    }
    case "brace-accesa":
      return g.attivati.filter((x) => x !== questa && x.stanca > 0).map((x) => ({ bersaglio: x.copia.id }));
    case "ricetta":
      return s.ordine.flatMap((x) => s.giocatori[x]!.attivati.filter((y) => y.stanca > 0).map((y) => ({ bersaglio: y.copia.id })));
    case "studia-il-fascicolo":
      return avversariDopo(s, id).map((giocatore) => ({ giocatore }));
    case "ne-ho-viste-tante":
      return puoPescare(s, "personaggi") ? [{}] : [];
    case "ogni-cosa-al-suo-posto":
    case "frutta-e-verdura":
    case "patate-al-forno":
      return puoPescare(s, "numeri") ? [{}] : [];
    default:
      return [{}];
  }
}

const valoreDi = (g: StatoGiocatore, id: string) => g.mano.find((c) => c.id === id)!.valore;

/** Tutte le coppie di elementi diversi. */
function coppie<T>(lista: T[]): T[][] {
  return lista.flatMap((a, i) => lista.slice(i + 1).map((b) => [a, b]));
}
