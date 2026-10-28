/**
 * Attacchi ⚔️ e difese 🛡️ (vedi docs/famiglia/regolamento.md, "Attacchi e difese" e "Decisioni su attacchi e difese").
 *
 * Un attacco si risolve un bersaglio alla volta (attacchi contro tutti: nell'ordine di turno). Per ogni bersaglio
 * il gioco aspetta la sua risposta (attesa "difesa") se può difendersi o se l'attacco gli chiede una scelta;
 * altrimenti l'attacco lo colpisce subito. Ognuno si difende al massimo una volta per attacco.
 * Regola del livello: una difesa ferma solo attacchi del suo livello o più bassi.
 */
import { type IdGiocatore, interoTra, mescola } from "@og/engine";
import {
  avversariDopo,
  pesca,
  peschiNumeri,
  puntiDi,
  registra,
  rifiuta,
  risorseGiocatore,
  scartaNumeri,
  stancaCarta,
  togliNumero,
  zonaDi,
  premioPotere,
  liberaPostoDifesa,
} from "./base";
import { carta, eBlu } from "./carte";
import { type Combinazione, trovaCombinazioni, verificaCombinazione } from "./codici";
import type { Attesa, AttaccoInCorso, Attivato, Mossa, ParametriPotere, StatoGiocatore, StatoPartita } from "./stato";
import type { Carta, CartaNumero } from "./tipi-carte";

/* ------------------------------------------------------------------ */
/* Che cosa fa ogni attacco                                            */
/* ------------------------------------------------------------------ */

/** Attacchi contro tutti gli avversari (gli altri colpiscono un avversario scelto). */
const CONTRO_TUTTI = new Set(["manca-o-sale", "urla", "si-canta", "rospe-per-tutti", "zeppata-sui-social", "volo-infuocato", "risata-contagiosa", "multa"]);

/** Attacchi che fanno stancare una carta carica scelta dall'attaccante. */
const STANCANO_UNA_CARTA = new Set(["versa-il-vino", "la-tomacella", "il-bastone"]);

/** Attacchi "di carne": Tofu Super Seitan (Chicca 1) li ferma di qualsiasi livello. */
export const ATTACCHI_DI_CARNE = new Set(["la-tomacella", "tritacarne"]);

/** Carte che con l'Aperitivo (Chicca 2) si usano senza pagare il codice: i vini e il Campari. */
const DA_APERITIVO = new Set(["paesano", "aglianico", "taurasi", "campari"]);

/** Il giocatore ha attivato l'Aperitivo e questa carta è un vino o il Campari? Allora la usa senza pagare. */
export const gratisConAperitivo = (g: StatoGiocatore, idCarta: string): boolean =>
  DA_APERITIVO.has(idCarta) && g.attivati.some((a) => a.copia.carta === "chicca-2");

/** Difese che passano l'attacco a un altro giocatore (Maddalena): non valgono contro gli attacchi contro tutti. */
const DEVIANO = new Set(["non-e-colpa-mia", "e-colpa-di-qualcun-altro"]);

/** Difese che si usano solo nel proprio turno, come un potere (non quando si viene attaccati). */
export const DIFESE_PROATTIVE = new Set(["benedizione"]);
/** Difese che si possono usare anche nel proprio turno, come un potere. */
export const DIFESE_ANCHE_PROATTIVE = new Set(["nuvola-di-fumo", "benedizione"]);

/** Fino a quale turno dura "il resto del giro" che si sta giocando. */
const fineGiro = (s: StatoPartita) => (Math.floor(s.numeroTurno / s.ordine.length) + 1) * s.ordine.length - 1;

/** Il giocatore può essere attaccato da `attaccante`? (Benedizione, Nevicava, Nuvola di fumo, Non ti sento.) */
export function attaccabile(s: StatoPartita, attaccante: IdGiocatore, bersaglio: IdGiocatore): boolean {
  if (s.benedizione !== null) return false;
  if (s.tregua !== null && s.numeroTurno <= s.tregua) return false;
  const g = s.giocatori[bersaglio]!;
  return !g.protetto && !g.vietati.includes(attaccante);
}

/** Carte attivate e cariche che un attacco può far stancare (Versa il vino non tocca le carte di Francesco). */
function caricheColpibili(g: StatoGiocatore, potere: string): Attivato[] {
  if (g.nonStancabile) return [];
  return g.attivati.filter(
    (a) => a.stanca === 0 && !eBlu(a.copia.carta) && !(potere === "versa-il-vino" && carta(a.copia.carta).persona === "francesco"),
  );
}

/** Livello massimo di una carta attivata che Baratto può prendere in cambio di `propria`. */
const livelloVicino = (a: Attivato, b: Attivato) => Math.abs(carta(a.copia.carta).livello - carta(b.copia.carta).livello) <= 1;

/** Un elemento a caso (dal generatore della partita). */
const aCaso = <T>(s: StatoPartita, lista: T[]): T | undefined => (lista.length === 0 ? undefined : lista[interoTra(s.rng, 0, lista.length - 1)]);

/** Carte numero che l'attaccato deve scegliere (scartare o dare), se l'attacco gliele chiede. */
function carteDaScegliere(potere: string): number {
  if (potere === "forno-a-legna" || potere === "urla") return 2;
  if (potere === "manca-o-sale") return 1;
  return 0;
}

/** L'attacco chiede una scelta all'attaccato (quali carte scartare o dare, o cosa perdere)? */
function serveScelta(s: StatoPartita, a: AttaccoInCorso, v: IdGiocatore): boolean {
  const g = s.giocatori[v]!;
  const n = carteDaScegliere(a.potere);
  if (n > 0) return g.mano.length > n;
  if (a.potere === "zeppata-sui-social") return g.mano.length > 0 && caricheColpibili(g, a.potere).length > 0;
  if (a.potere === "invasione-di-campo") return caricheColpibili(g, a.potere).length > 1;
  if (a.potere === "brontola-tutto-il-giorno") return g.mano.length >= 2;
  return false;
}

/* ------------------------------------------------------------------ */
/* Inizio di un attacco                                                */
/* ------------------------------------------------------------------ */

/**
 * L'attaccante usa il potere d'attacco `potere` della carta `origine` (un suo personaggio attivato,
 * una carta attacco, o un potere copiato). Controlla le scelte e comincia a risolverlo.
 */
export function avviaAttacco(s: StatoPartita, id: IdGiocatore, origine: Carta, potere: string, p: ParametriPotere, copia: string | null): void {
  const g = s.giocatori[id]!;
  const controTutti = CONTRO_TUTTI.has(potere);
  let bersagli: IdGiocatore[];
  if (controTutti) {
    bersagli = avversariDopo(s, id).filter((x) => attaccabile(s, id, x));
    if (potere === "multa") {
      const max = Math.max(0, ...bersagli.map((x) => s.giocatori[x]!.mano.length));
      bersagli = max === 0 ? [] : bersagli.filter((x) => s.giocatori[x]!.mano.length === max);
    }
    if (bersagli.length === 0) rifiuta("Nessun avversario può essere colpito");
  } else if (potere === "invasione-di-campo") {
    // 2 avversari a scelta (o l'unico che si può colpire), colpiti nell'ordine di turno
    const possibili = avversariDopo(s, id).filter((x) => attaccabile(s, id, x));
    const scelti = p.giocatori ?? [];
    if (possibili.length === 0) rifiuta("Nessun avversario può essere colpito");
    if (new Set(scelti).size !== scelti.length || scelti.length !== Math.min(2, possibili.length) || !scelti.every((x) => possibili.includes(x))) {
      rifiuta(possibili.length === 1 ? "Scegli l'avversario da attaccare" : "Scegli 2 avversari da attaccare");
    }
    bersagli = possibili.filter((x) => scelti.includes(x));
  } else {
    const v = p.giocatore;
    if (!v || v === id || !s.ordine.includes(v)) rifiuta("Scegli l'avversario da attaccare");
    if (!attaccabile(s, id, v!)) rifiuta("Quel giocatore adesso non può essere attaccato");
    if (potere === "ho-tanta-fame" && !piuVicini(s, id).includes(v!)) rifiuta("Braccine corte: puoi prendere solo dall'avversario con i punti più vicini ai tuoi");
    controllaScelteAttacco(s, id, potere, v!, p);
    bersagli = [v!];
  }
  const carico = pagaCarico(s, id, p);
  registra(s, id, { tipo: "attacco", carta: origine.id, potere, bersagli, ...(carico > 0 ? { carico } : {}) });
  s.attacco = {
    attaccante: id,
    carta: origine.id,
    potere,
    livello: origine.livello,
    parametri: p,
    bersaglio: bersagli[0]!,
    da: id,
    coda: bersagli.slice(1),
    difesi: [],
    indifendibile: false,
    controTutti,
    copia,
    ...(carico > 0 ? { carico } : {}),
  };
  prosegui(s);
}

/** Valore delle carte numero indicate. */
const somma = (carte: CartaNumero[]) => carte.reduce((n, c) => n + c.valore, 0);

/**
 * Carico (opzione): chi attacca scarta le carte numero scelte dalla mano e la loro somma è il carico.
 * Le carte si perdono sempre, che l'avversario si difenda o no. Restituisce il carico (0 se non c'è).
 */
function pagaCarico(s: StatoPartita, id: IdGiocatore, p: ParametriPotere): number {
  const ids = p.carico ?? [];
  if (ids.length === 0) return 0;
  if (!s.opzioni.carico) rifiuta("In questa partita non si attacca con il carico");
  const g = s.giocatori[id]!;
  if (new Set(ids).size !== ids.length || !ids.every((x) => g.mano.some((c) => c.id === x))) rifiuta("Il carico si fa con carte numero della tua mano");
  if (p.carte?.some((x) => ids.includes(x))) rifiuta("La carta da dare non può stare anche nel carico");
  const carte = ids.map((x) => togliNumero(g, x)!);
  scartaNumeri(s, carte);
  return somma(carte);
}

/**
 * Carico: chi si difende con una carta attivata scarta carte numero che fanno almeno il carico (poi la carta si stanca),
 * oppure fa harakiri: la carta di difesa va negli scarti (con i suoi punti) e l'attacco è fermato lo stesso.
 */
function pagaDifesaConCarico(s: StatoPartita, g: StatoGiocatore, x: Attivato, carico: number, m: Extract<Mossa, { tipo: "difendi" }>): void {
  if (m.harakiri) {
    g.attivati.splice(g.attivati.indexOf(x), 1);
    s.scarti.personaggi.push(x.copia);
    return;
  }
  const ids = m.carico ?? [];
  if (new Set(ids).size !== ids.length || !ids.every((y) => g.mano.some((c) => c.id === y)) || somma(g.mano.filter((c) => ids.includes(c.id))) < carico) {
    rifiuta(`Per difenderti scarta carte numero che fanno almeno ${carico}, oppure sacrifica la carta (harakiri)`);
  }
  scartaNumeri(s, ids.map((y) => togliNumero(g, y)!));
  stancaCarta(s, x);
}

/** Modi di pagare il carico per una difesa con una carta attivata: harakiri, e (se bastano le carte) una o due scelte di carte. */
function modiDiPagareIlCarico(g: StatoGiocatore, carico: number, giaUsate: Set<string>): Pick<Extract<Mossa, { tipo: "difendi" }>, "carico" | "harakiri">[] {
  const libere = g.mano.filter((c) => !giaUsate.has(c.id));
  const modi: Pick<Extract<Mossa, { tipo: "difendi" }>, "carico" | "harakiri">[] = [{ harakiri: true }];
  // la carta più piccola che basta da sola
  const una = [...libere].sort((a, b) => a.valore - b.valore).find((c) => c.valore >= carico);
  if (una) modi.push({ carico: [una.id] });
  // le più alte, finché bastano
  const alte: string[] = [];
  let tot = 0;
  for (const c of [...libere].sort((a, b) => b.valore - a.valore)) {
    if (tot >= carico) break;
    alte.push(c.id);
    tot += c.valore;
  }
  if (tot >= carico && !(alte.length === 1 && una && alte[0] === una.id)) modi.push({ carico: alte });
  return modi;
}

/** Ho tanta fame (Christian, braccine corte): gli avversari con i punti più vicini a quelli di chi attacca. */
function piuVicini(s: StatoPartita, id: IdGiocatore): IdGiocatore[] {
  const miei = puntiDi(s.giocatori[id]!, s.opzioni);
  const distanza = (x: IdGiocatore) => Math.abs(puntiDi(s.giocatori[x]!, s.opzioni) - miei);
  const avversari = avversariDopo(s, id);
  const minima = Math.min(...avversari.map(distanza));
  return avversari.filter((x) => distanza(x) === minima);
}

/** Le scelte dell'attaccante per un attacco a un solo avversario sono valide? */
function controllaScelteAttacco(s: StatoPartita, id: IdGiocatore, potere: string, v: IdGiocatore, p: ParametriPotere): void {
  const g = s.giocatori[id]!;
  const o = s.giocatori[v]!;
  if (STANCANO_UNA_CARTA.has(potere)) {
    if (!caricheColpibili(o, potere).some((a) => a.copia.id === p.bersaglio)) rifiuta("Scegli una carta carica dell'avversario");
  } else if (potere === "vertenza") {
    const sua = o.attivati.find((a) => a.copia.id === p.bersaglio && carta(a.copia.carta).livello <= 2);
    if (!sua) rifiuta("Scegli un personaggio attivato di livello 1 o 2");
    // Per prenderlo si paga il suo codice di attivazione con le proprie carte (anche se poi l'avversario si difende)
    paga(s, g, carta(sua!.copia.carta), p.combinazione);
  } else if (potere === "sparecchio") {
    if (!o.attivati.some((a) => a.copia.id === p.bersaglio)) rifiuta("Scegli un personaggio attivato dell'avversario");
  } else if (potere === "baratto") {
    const mia = g.attivati.find((a) => a.copia.id === p.propria && carta(a.copia.carta).id !== "nonna-patrizia-3");
    const sua = o.attivati.find((a) => a.copia.id === p.bersaglio);
    if (!mia || !sua) rifiuta("Scegli una tua carta attivata e una dell'avversario");
    if (!livelloVicino(mia!, sua!)) rifiuta("Le due carte devono essere dello stesso livello o con un livello di differenza");
  } else if (potere === "burla" || potere === "una-rospa") {
    if (p.carte && (p.carte.length !== 1 || !g.mano.some((c) => c.id === p.carte![0]))) rifiuta("Scegli una tua carta numero da dare");
  }
}

/* ------------------------------------------------------------------ */
/* Risoluzione, un bersaglio alla volta                                */
/* ------------------------------------------------------------------ */

/** Va avanti con l'attacco finché serve una risposta di qualcuno o l'attacco è finito. */
function prosegui(s: StatoPartita): void {
  let dopo: Attesa | null = null;
  while (s.attacco) {
    const a = s.attacco;
    const v = a.bersaglio;
    // Tiro su un muro: fino al suo prossimo turno gli attacchi di livello 1 non lo colpiscono
    const colpibile = v === a.attaccante || (attaccabile(s, a.attaccante, v) && !(s.giocatori[v]!.muro && a.livello <= 1));
    if (!colpibile) {
      registra(s, v, { tipo: "protetto", potere: a.potere });
    } else if ((!a.indifendibile && !a.difesi.includes(v) && difeseDisponibili(s, v).length > 0) || serveScelta(s, a, v)) {
      s.turno.attesa = { tipo: "difesa", giocatore: v };
      return;
    } else {
      dopo = colpisci(s, a, v, {}) ?? dopo;
    }
    avanza(s);
  }
  s.turno.attesa = dopo ?? attesaDelCanto(s);
}

/** Finito Si canta!, chi ha cantato sceglie quale carta ridare a ciascun avversario colpito. */
function attesaDelCanto(s: StatoPartita): Attesa | null {
  const canto = s.turno.canto;
  if (!canto || canto.a.length === 0 || s.giocatori[canto.da]!.mano.length === 0) {
    s.turno.canto = null;
    return null;
  }
  return { tipo: "canto", giocatore: canto.da, a: [...canto.a] };
}

/** Passa al prossimo bersaglio, o chiude l'attacco. */
function avanza(s: StatoPartita): void {
  const a = s.attacco!;
  const prossimo = a.coda.shift();
  if (prossimo === undefined) {
    s.attacco = null;
    return;
  }
  a.bersaglio = prossimo;
  a.da = a.attaccante;
  a.indifendibile = false;
}

/**
 * Applica l'effetto dell'attacco al giocatore `v`, con le sue scelte (se l'attacco le chiede; altrimenti a caso).
 * Restituisce una scelta da fare dopo l'attacco (zona piena per Sparecchio), se serve.
 */
function colpisci(s: StatoPartita, a: AttaccoInCorso, v: IdGiocatore, scelta: { carte?: string[]; bersaglio?: string }): Attesa | null {
  const A = s.giocatori[a.attaccante]!;
  const V = s.giocatori[v]!;
  const p = a.parametri;
  const suSeStesso = v === a.attaccante;
  /** Il bersaglio scelto dall'attaccante vale solo se colpisce proprio quel giocatore (non dopo una deviazione). */
  const originale = (lista: Attivato[]) => lista.find((x) => x.copia.id === p.bersaglio) ?? aCaso(s, lista);
  const stanca = (x: Attivato | undefined) => stancaCarta(s, x);
  const scartaACaso = (quante: number) => {
    for (let i = 0; i < quante && V.mano.length > 0; i++) scartaNumeri(s, V.mano.splice(interoTra(s.rng, 0, V.mano.length - 1), 1));
  };
  const rubaACaso = (): CartaNumero | undefined => (V.mano.length > 0 ? V.mano.splice(interoTra(s.rng, 0, V.mano.length - 1), 1)[0] : undefined);
  let dopo: Attesa | null = null;
  registra(s, v, { tipo: "colpito", potere: a.potere });
  if (!suSeStesso && !a.premiato) {
    premioPotere(s, a.attaccante, "attacco");
    a.premiato = true;
  }

  switch (a.potere) {
    case "forno-a-legna":
    case "urla":
    case "manca-o-sale": {
      const n = Math.min(carteDaScegliere(a.potere), V.mano.length);
      const scelte = scelta.carte ?? [];
      if (scelte.length > 0 && (scelte.length !== n || new Set(scelte).size !== n || !scelte.every((x) => V.mano.some((c) => c.id === x)))) {
        rifiuta(`Scegli ${n} carte numero dalla tua mano`);
      }
      const ids = scelte.length > 0 ? scelte : mescola(s.rng, V.mano.map((c) => c.id)).slice(0, n);
      const carte = ids.map((x) => togliNumero(V, x)!);
      if (a.potere === "manca-o-sale" && !suSeStesso) A.mano.push(...carte);
      else if (a.potere === "manca-o-sale") V.mano.push(...carte);
      else scartaNumeri(s, carte);
      break;
    }
    case "solo-per-vedere-comm-sape":
    case "giro-aperto":
    case "ho-tanta-fame": {
      if (suSeStesso) break;
      // Ho tanta fame: 2 carte numero a caso
      for (let i = 0; i < (a.potere === "ho-tanta-fame" ? 2 : 1); i++) {
        const c = rubaACaso();
        if (c) A.mano.push(c);
      }
      break;
    }
    case "burla":
    case "una-rospa": {
      if (suSeStesso) break;
      // Prima si dà la propria carta (scelta, se c'è ancora), poi si prende
      const dono = (p.carte?.[0] && A.mano.find((c) => c.id === p.carte![0])) || aCaso(s, A.mano);
      if (a.potere === "burla") {
        // Burla: si prendono 2 carte a caso e se ne dà 1 a scelta
        const prese = [rubaACaso(), rubaACaso()].filter((c): c is CartaNumero => c !== undefined);
        if (dono) V.mano.push(togliNumero(A, dono.id)!);
        A.mano.push(...prese);
      } else if (!V.nascostiProtetti && V.nascosti.length > 0) {
        if (dono) V.mano.push(togliNumero(A, dono.id)!);
        const preso = V.nascosti.splice(interoTra(s.rng, 0, V.nascosti.length - 1), 1)[0]!;
        A[zonaDi(preso)].push(preso);
        dopo = zonaPiena(s, a.attaccante, preso.id) ?? dopo;
      }
      break;
    }
    case "si-canta": {
      // Prima si prende una carta a caso da ogni avversario colpito; finito l'attacco si sceglie cosa ridare a ciascuno
      if (suSeStesso) break;
      const c = rubaACaso();
      if (c) A.mano.push(c);
      const canto = (s.turno.canto ??= { da: a.attaccante, a: [] });
      canto.a.push(v);
      break;
    }
    case "si-incanta":
    case "rospe-per-tutti":
      V.mosseProssimoTurno -= 1;
      if (a.potere === "si-incanta" && !suSeStesso) peschiNumeri(s, a.attaccante, 1);
      break;
    case "parla-parla-parla":
      V.zittoProssimoTurno = true;
      break;
    case "ti-chiamo-un-attimo":
      // Il regalo (2 carte numero dal mazzo) e un'ora al telefono: salta il prossimo turno
      for (let i = 0; i < 2; i++) {
        const c = pesca(s, "numeri");
        if (c) V.mano.push(c);
      }
      V.saltaProssimoTurno = true;
      break;
    case "schietta":
      if (!V.nascostiProtetti) s.turno.rivelati.push({ giocatore: v, mano: [], nascosti: structuredClone(V.nascosti) });
      break;
    case "gli-occhi-nguoll":
      if (V.nascostiProtetti || V.nascosti.length === 0) break;
      s.scarti.personaggi.push(...V.nascosti.splice(interoTra(s.rng, 0, V.nascosti.length - 1), 1));
      break;
    case "versa-il-vino":
    case "la-tomacella":
    case "volo-infuocato": {
      const x = a.potere === "volo-infuocato" ? aCaso(s, caricheColpibili(V, a.potere)) : originale(caricheColpibili(V, a.potere));
      // Versa il vino: la carta si addormenta e ci mette 1 turno in più a ricaricarsi
      stancaCarta(s, x, a.potere === "versa-il-vino" ? 1 : 0);
      break;
    }
    case "il-bastone":
      stanca(originale(caricheColpibili(V, a.potere)));
      scartaACaso(2);
      break;
    case "risata-contagiosa":
      scartaACaso(1);
      break;
    case "bisiniss": {
      // La carta numero più alta viene tagliata a metà: si scarta e al suo posto arriva una carta che vale la metà
      if (V.mano.length === 0) break;
      const alta = V.mano.reduce((max, c) => (c.valore > max.valore ? c : max));
      scartaNumeri(s, [togliNumero(V, alta.id)!]);
      const meta = Math.max(1, Math.floor(alta.valore / 2));
      for (const mazzo of [s.mazzi.numeri, s.scarti.numeri]) {
        const i = mazzo.findIndex((c) => c.valore === meta && !c.unite);
        if (i >= 0) {
          V.mano.push(...mazzo.splice(i, 1));
          break;
        }
      }
      break;
    }
    case "multa":
      scartaACaso(2);
      break;
    case "vento": {
      const quante = V.mano.length;
      scartaNumeri(s, V.mano.splice(0));
      for (let i = 0; i < quante; i++) {
        const c = pesca(s, "numeri");
        if (c) V.mano.push(c);
      }
      break;
    }
    case "zeppata-sui-social": {
      const carica = scelta.bersaglio ? caricheColpibili(V, a.potere).find((x) => x.copia.id === scelta.bersaglio) : undefined;
      if (scelta.bersaglio && !carica) rifiuta("Scegli una tua carta carica");
      if (scelta.carte && (scelta.carte.length !== 1 || !V.mano.some((c) => c.id === scelta.carte![0]))) rifiuta("Scegli una tua carta numero");
      if (carica) stanca(carica);
      else if (V.mano.length > 0 && !suSeStesso) A.mano.push(togliNumero(V, scelta.carte?.[0] ?? aCaso(s, V.mano)!.id)!);
      else stanca(aCaso(s, caricheColpibili(V, a.potere)));
      break;
    }
    case "una-sigaretta-fuori-al-bar":
      V.senzaAttivareProssimoTurno = true;
      break;
    case "brontola-tutto-il-giorno": {
      // L'avversario sceglie: dare 2 carte numero (scelte da lui) oppure saltare il prossimo turno
      const scelte = scelta.carte ?? [];
      if (scelte.length > 0) {
        if (scelte.length !== 2 || new Set(scelte).size !== 2 || !scelte.every((x) => V.mano.some((c) => c.id === x))) {
          rifiuta("Scegli 2 carte numero da dare");
        }
        const carte = scelte.map((x) => togliNumero(V, x)!);
        if (suSeStesso) scartaNumeri(s, carte);
        else A.mano.push(...carte);
      } else {
        V.saltaProssimoTurno = true;
      }
      break;
    }
    case "invasione-di-campo": {
      // L'avversario sceglie quale sua carta carica far stancare; l'attaccante pesca 1 carta per ogni colpito
      const cariche = caricheColpibili(V, a.potere);
      const voluta = scelta.bersaglio ? cariche.find((x) => x.copia.id === scelta.bersaglio) : undefined;
      if (scelta.bersaglio && !voluta) rifiuta("Scegli una tua carta carica");
      stanca(voluta ?? aCaso(s, cariche));
      if (!suSeStesso) peschiNumeri(s, a.attaccante, 1);
      break;
    }
    case "vertenza": {
      if (suSeStesso) break;
      const presa = originale(V.attivati.filter((x) => carta(x.copia.carta).livello <= 2));
      if (presa) {
        A.attivati.push(...V.attivati.splice(V.attivati.indexOf(presa), 1));
        // La carta di Vertenza ci mette in più tanti turni quanto il livello della carta presa (3 + 1 o 2)
        const giuseppe = A.attivati.find((x) => x.copia.id === a.copia);
        if (giuseppe) giuseppe.stanca += carta(presa.copia.carta).livello;
        liberaPostoDifesa(s, a.attaccante, presa.copia);
      }
      break;
    }
    case "sparecchio": {
      const tolta = originale(V.attivati);
      if (!tolta) break;
      V.attivati.splice(V.attivati.indexOf(tolta), 1);
      V[zonaDi(tolta.copia)].push(tolta.copia);
      dopo = zonaPiena(s, v, tolta.copia.id);
      break;
    }
    case "baratto": {
      if (suSeStesso) break;
      const mia = A.attivati.find((x) => x.copia.id === p.propria);
      const sua = mia && (v === p.giocatore ? originale(V.attivati) : aCaso(s, V.attivati.filter((x) => livelloVicino(mia, x))));
      if (!mia || !sua || !livelloVicino(mia, sua)) break;
      A.attivati[A.attivati.indexOf(mia)] = sua;
      V.attivati[V.attivati.indexOf(sua)] = mia;
      stanca(mia);
      stanca(sua);
      liberaPostoDifesa(s, a.attaccante, sua.copia);
      liberaPostoDifesa(s, v, mia.copia);
      break;
    }
    case "tritacarne": {
      if (suSeStesso) break;
      // Si mescolano le carte numero dei due e si ridividono: l'attaccante 1 in più di prima, l'altro 1 in meno
      const quanteMie = Math.min(A.mano.length + (V.mano.length > 0 ? 1 : 0), A.mano.length + V.mano.length);
      const tutte = mescola(s.rng, [...A.mano.splice(0), ...V.mano.splice(0)]);
      A.mano.push(...tutte.slice(0, quanteMie));
      V.mano.push(...tutte.slice(quanteMie));
      break;
    }
    default:
      rifiuta("Attacco sconosciuto");
  }
  return dopo;
}

/** Se la zona del giocatore è troppo piena dopo aver ricevuto `nuova`, deve scegliere cosa scartare. */
function zonaPiena(s: StatoPartita, id: IdGiocatore, nuova: string): Attesa | null {
  const g = s.giocatori[id]!;
  for (const zona of ["nascosti", "attacchi"] as const) {
    const limite = zona === "nascosti" ? s.opzioni.maxNascosti : s.opzioni.maxAttacchi;
    if (g[zona].length > limite && g[zona].some((c) => c.id === nuova)) return { tipo: "scartaCarta", giocatore: id, zona, nuova };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Difese                                                              */
/* ------------------------------------------------------------------ */

/** Una difesa possibile per chi è attaccato. */
interface DifesaPossibile {
  /** Id della copia della carta (attivata o nascosta). */
  copia: string;
  potere: string;
  /** Dalla mano nascosta, pagando il codice (d'emergenza). */
  emergenza: boolean;
}

/** Poteri di difesa che si usano quando si è attaccati. */
const reattiva = (potere: string) => !DIFESE_PROATTIVE.has(potere);

/** Difese che il giocatore attaccato può usare adesso (regola del livello compresa). */
export function difeseDisponibili(s: StatoPartita, v: IdGiocatore): DifesaPossibile[] {
  const a = s.attacco;
  if (!a) return [];
  const g = s.giocatori[v]!;
  // Regola del livello; Tofu Super Seitan ferma anche gli attacchi di carne di qualsiasi livello,
  // Non è ancora arrivato (Francesco 2) qualsiasi attacco (ma costa 1 mossa nel prossimo turno)
  const livelloOk = (c: Carta, potere: string) =>
    c.livello >= a.livello || potere === "non-e-ancora-arrivato" || (potere === "tofu-super-seitan" && ATTACCHI_DI_CARNE.has(a.potere));
  // Stuffosa non ferma gli attacchi: vale solo contro gli aiuti (poteri.ts)
  const ok = (c: Carta, potere: string) =>
    potere !== "stuffosa" && livelloOk(c, potere) && reattiva(potere) && (!a.controTutti || !DEVIANO.has(potere));
  const res: DifesaPossibile[] = [];
  for (const x of g.attivati) {
    if (x.stanca > 0) continue;
    const c = carta(x.copia.carta);
    for (const p of c.poteri) if (p.tipo === "difesa" && ok(c, p.id)) res.push({ copia: x.copia.id, potere: p.id, emergenza: false });
  }
  const risorse = risorseGiocatore(g);
  for (const x of g.nascosti) {
    const c = carta(x.carta);
    const difese = c.poteri.filter((p) => p.tipo === "difesa" && ok(c, p.id));
    if (difese.length > 0 && (gratisConAperitivo(g, c.id) || trovaCombinazioni(risorse, c.codice, 1).length > 0)) {
      for (const p of difese) res.push({ copia: x.id, potere: p.id, emergenza: true });
    }
  }
  return res;
}

/** L'attaccato risponde: si difende ("difendi") o subisce ("subisci"). */
export function rispondiAttacco(s: StatoPartita, id: IdGiocatore, m: Mossa): void {
  const a = s.attacco!;
  if (m.tipo === "subisci") {
    s.turno.attesa = null;
    const dopo = colpisci(s, a, id, m);
    avanza(s);
    prosegui(s);
    if (dopo && !s.turno.attesa) s.turno.attesa = dopo;
    return;
  }
  if (m.tipo !== "difendi") rifiuta("Sei attaccato: difenditi o lascia passare l'attacco");
  const mossa = m as Extract<Mossa, { tipo: "difendi" }>;
  if (a.indifendibile || a.difesi.includes(id)) rifiuta("Questo attacco non puoi fermarlo");
  const possibili = difeseDisponibili(s, id).filter((d) => d.copia === mossa.carta && (mossa.potere === undefined || d.potere === mossa.potere));
  const d = possibili[0];
  if (!d) rifiuta("Non puoi difenderti con questa carta");
  const g = s.giocatori[id]!;
  const c = carta(g.attivati.find((x) => x.copia.id === d!.copia)?.copia.carta ?? g.nascosti.find((x) => x.id === d!.copia)!.carta);

  // Pagare la difesa: carica che si stanca, oppure (d'emergenza) codice pagato e carta scartata
  if (d!.emergenza) {
    if (!gratisConAperitivo(g, c.id)) paga(s, g, c, mossa.combinazione);
    // "Sono a un matrimonio": durante l'evento Matrimonio la carta non si scarta e resta in mano
    if (!(d!.potere === "sono-a-un-matrimonio" && s.evento?.id === "matrimonio")) {
      s.scarti.personaggi.push(...g.nascosti.splice(g.nascosti.findIndex((x) => x.id === d!.copia), 1));
    }
  } else {
    const x = g.attivati.find((y) => y.copia.id === d!.copia)!;
    if (a.carico && s.opzioni.carico) pagaDifesaConCarico(s, g, x, a.carico, mossa);
    else stancaCarta(s, x);
  }
  if ((mossa.harakiri || mossa.carico) && (d!.emergenza || !a.carico)) rifiuta("Il carico si paga solo difendendosi con una carta attivata");
  a.difesi.push(id);
  s.turno.attesa = null;

  // Forse c'è, forse no: si gira la prossima carta numero; dispari la difesa vince, pari l'attacco colpisce.
  // La carta girata va in mano a chi si difende (senza carte nel mazzo la difesa vince).
  let riuscita = true;
  let girata: number | undefined;
  if (d!.potere === "forse-c-e-forse-no") {
    const c = pesca(s, "numeri");
    if (c) {
      girata = c.valore;
      riuscita = c.valore % 2 === 1;
      g.mano.push(c);
    }
  }
  const devia = DEVIANO.has(d!.potere) ? mossa.giocatore : undefined;
  if (DEVIANO.has(d!.potere) && (devia === undefined || devia === id || !s.ordine.includes(devia))) rifiuta("Scegli a chi passare l'attacco");
  registra(s, id, {
    tipo: "difesa",
    carta: c.id,
    potere: d!.potere,
    riuscita,
    ...(devia ? { devia } : {}),
    ...(girata ? { girata } : {}),
    ...(mossa.harakiri ? { harakiri: true as const } : {}),
  });

  let dopo: Attesa | null = null;
  if (!riuscita) {
    dopo = colpisci(s, a, id, mossa);
    avanza(s);
  } else {
    premioPotere(s, id, "difesa");
    dopo = effettoDifesa(s, a, id, d!.potere, mossa);
  }
  prosegui(s);
  if (dopo && !s.turno.attesa) s.turno.attesa = dopo;
}

/** Paga il codice di una carta con la combinazione indicata (carte, vetrina e mancia vanno negli scarti). */
export function paga(s: StatoPartita, g: StatoGiocatore, c: Carta, combinazione: Combinazione | undefined): void {
  if (!combinazione) rifiuta("Indica le carte con cui pagare il codice");
  const esito = verificaCombinazione(risorseGiocatore(g), c.codice, combinazione!);
  if (!esito.ok) rifiuta(esito.errore);
  for (const idCarta of combinazione!.flatMap((el) => [el.id, ...(el.modifica ? [el.modifica.mancia] : [])])) {
    const numero = togliNumero(g, idCarta);
    if (numero) scartaNumeri(s, [numero]);
    else s.scarti.mancia.push(...g.mancia.splice(g.mancia.findIndex((x) => x.id === idCarta), 1));
  }
}

/** Effetto di una difesa riuscita. Restituisce una scelta da fare dopo l'attacco, se serve. */
function effettoDifesa(s: StatoPartita, a: AttaccoInCorso, v: IdGiocatore, potere: string, m: Extract<Mossa, { tipo: "difendi" }>): Attesa | null {
  const V = s.giocatori[v]!;
  // "Chi ti ha attaccato": chi ha mandato l'attacco a questo giocatore (anche dopo una deviazione)
  const mittente = a.da;
  const A = s.giocatori[mittente]!;
  switch (potere) {
    case "non-e-colpa-mia":
    case "e-colpa-di-qualcun-altro":
      a.bersaglio = m.giocatore!;
      a.da = v;
      a.indifendibile = potere === "e-colpa-di-qualcun-altro";
      return null; // prosegui() risolve sul nuovo bersaglio
    case "permalosa":
      a.bersaglio = mittente;
      a.da = v;
      return null;
    case "guardia-medica": {
      // L'attacco passa, poi si curano i danni: carte numero scartate di nuovo in mano, carte stancate di nuovo cariche
      const veri = (c: CartaNumero): string[] => (c.unite ? c.unite.flatMap(veri) : [c.id]);
      const mano = new Set(V.mano.flatMap(veri));
      const cariche = V.attivati.filter((x) => x.stanca === 0);
      const scartiPrima = s.scarti.numeri.length;
      const dopo = colpisci(s, a, v, m);
      const tornano = s.scarti.numeri.slice(scartiPrima).filter((c) => mano.has(c.id));
      s.scarti.numeri = s.scarti.numeri.filter((c) => !tornano.includes(c));
      V.mano.push(...tornano);
      for (const x of cariche) if (V.attivati.includes(x)) x.stanca = 0;
      avanza(s);
      return dopo;
    }
    case "ricorso": {
      const quante = Math.min(a.livello, V.mano.length);
      const carte = m.carte ?? [];
      if (carte.length !== quante || new Set(carte).size !== quante || !carte.every((x) => V.mano.some((c) => c.id === x))) {
        rifiuta(`Per la parcella scegli ${quante} carte numero`);
      }
      scartaNumeri(s, carte.map((x) => togliNumero(V, x)!));
      break;
    }
    case "campari":
      peschiNumeri(s, v, 1);
      break;
    case "la-cionna":
      if (mittente !== v && A.mano.length > 0) scartaNumeri(s, A.mano.splice(interoTra(s.rng, 0, A.mano.length - 1), 1));
      break;
    case "non-e-ancora-arrivato":
      // Arriva in ritardo: l'attacco non lo trova, ma il prossimo turno comincia tardi
      V.mosseProssimoTurno -= 1;
      break;
    case "tiro-su-un-muro":
      V.muro = true;
      break;
    case "scudo-da-gladiatore":
      if (a.livello === 1 && A.mano.length > 0) scartaNumeri(s, A.mano.splice(interoTra(s.rng, 0, A.mano.length - 1), 1));
      break;
    case "drago-tascabile":
      // Tyrion, il drago tascabile, porta via a chi ti ha attaccato 1 carta numero a caso
      if (mittente !== v && A.mano.length > 0) V.mano.push(...A.mano.splice(interoTra(s.rng, 0, A.mano.length - 1), 1));
      break;
    case "sono-andato-a-lioni-a-fa-a-spesa":
      peschiNumeri(s, v, 2);
      break;
    case "nevicava-non-e-potuto-venire":
      s.tregua = fineGiro(s);
      break;
    case "taurasi":
    case "ho-appena-lavato-a-terra":
      A.mosseProssimoTurno -= 1;
      break;
    case "nuvola-di-fumo":
      V.protetto = true;
      break;
    case "non-ti-sento-sto-suonando":
      V.vietati.push(mittente);
      break;
    case "mutandoni-di-lana":
      V.nonStancabile = true;
      break;
    case "chiusa-in-camera":
      V.nascostiProtetti = true;
      break;
    case "una-fetta-di-torta":
      // Claudia offre torte, muffin e pancake: si fa pace
      peschiNumeri(s, v, 2);
      peschiNumeri(s, mittente, 1);
      break;
    case "tofu-super-seitan": {
      // Contro la carne: peschi 2 carte e la carta che ti ha attaccato ci mette 1 turno in più a ricaricarsi
      if (!ATTACCHI_DI_CARNE.has(a.potere)) break;
      peschiNumeri(s, v, 2);
      const x = s.giocatori[a.attaccante]!.attivati.find((y) => y.copia.id === a.copia);
      if (x) stancaCarta(s, x, 1);
      break;
    }
    case "cella-frigorifera": {
      const x = s.giocatori[a.attaccante]!.attivati.find((y) => y.copia.id === a.copia);
      if (x) stancaCarta(s, x, 1);
      break;
    }
    case "si-arrabbia": {
      if (A.mano.length > 0) scartaNumeri(s, A.mano.splice(interoTra(s.rng, 0, A.mano.length - 1), 1));
      stancaCarta(s, aCaso(s, caricheColpibili(A, potere)));
      break;
    }
    // Le altre difese annullano soltanto: Per me è quadrato, Sempre calma, Forse c'è,
    // Non c'è ha il turno, Paesano, Aglianico, Sono a un matrimonio.
  }
  avanza(s);
  return null;
}

/* ------------------------------------------------------------------ */
/* Mosse valide per l'attaccato                                        */
/* ------------------------------------------------------------------ */

/** Risposte possibili dell'attaccato (alcune scelte, non tutte). */
export function mosseDiDifesa(s: StatoPartita, v: IdGiocatore): Mossa[] {
  const a = s.attacco!;
  const g = s.giocatori[v]!;
  const scelte = scelteDaSubire(s, a, v);
  const mosse: Mossa[] = scelte.map((x) => ({ tipo: "subisci", ...x }));
  if (a.indifendibile || a.difesi.includes(v)) return mosse;
  const risorse = risorseGiocatore(g);
  for (const d of difeseDisponibili(s, v)) {
    const base: Extract<Mossa, { tipo: "difendi" }> = { tipo: "difendi", carta: d.copia, potere: d.potere };
    let conPagamento: Extract<Mossa, { tipo: "difendi" }>[] = d.emergenza && !gratisConAperitivo(g, carta(g.nascosti.find((x) => x.id === d.copia)!.carta).id)
      ? trovaCombinazioni(risorse, carta(g.nascosti.find((x) => x.id === d.copia)!.carta).codice, 1).map((combinazione) => ({ ...base, combinazione }))
      : [base];
    // Carico: con una carta attivata si paga il carico (o si fa harakiri)
    if (!d.emergenza && a.carico && s.opzioni.carico) conPagamento = modiDiPagareIlCarico(g, a.carico, new Set()).map((x) => ({ ...base, ...x }));
    for (const m of conPagamento) {
      if (DEVIANO.has(d.potere)) {
        for (const giocatore of s.ordine.filter((x) => x !== v)) mosse.push({ ...m, giocatore });
      } else if (d.potere === "ricorso") {
        const pagate = new Set([...(m.combinazione?.map((el) => el.id) ?? []), ...(m.carico ?? [])]);
        mosse.push({ ...m, carte: g.mano.filter((c) => !pagate.has(c.id)).slice(0, a.livello).map((c) => c.id) });
      } else if (d.potere === "guardia-medica") {
        // Le carte da scartare (se l'attacco le chiede) si scelgono tra quelle che restano dopo aver pagato la difesa
        const pagate = new Set([...(m.combinazione?.map((el) => el.id) ?? []), ...(m.carico ?? [])]);
        const scelta = scelte[0] ?? {};
        if (scelta.carte && scelta.carte.some((x) => pagate.has(x))) {
          const libere = g.mano.filter((c) => !pagate.has(c.id)).map((c) => c.id);
          const carte = libere.slice(0, Math.min(scelta.carte.length, libere.length));
          // Se non resta niente da scegliere, decide il caso (o l'attacco ha poco da prendere)
          mosse.push(carte.length > 0 ? { ...m, carte } : m);
        } else {
          mosse.push({ ...m, ...scelta });
        }
      } else {
        mosse.push(m);
      }
    }
  }
  return mosse;
}

/** Scelte possibili di chi subisce l'attacco (quali carte scartare o dare, o cosa perdere). */
function scelteDaSubire(s: StatoPartita, a: AttaccoInCorso, v: IdGiocatore): { carte?: string[]; bersaglio?: string }[] {
  const g = s.giocatori[v]!;
  const n = carteDaScegliere(a.potere);
  if (n > 0 && g.mano.length > n) {
    const ids = g.mano.map((c) => c.id);
    return n === 1 ? ids.slice(0, 5).map((x) => ({ carte: [x] })) : [{ carte: ids.slice(0, 2) }, { carte: ids.slice(-2) }];
  }
  if (a.potere === "invasione-di-campo" && serveScelta(s, a, v)) return caricheColpibili(g, a.potere).map((x) => ({ bersaglio: x.copia.id }));
  if (a.potere === "brontola-tutto-il-giorno") return serveScelta(s, a, v) ? [{ carte: g.mano.slice(0, 2).map((c) => c.id) }, {}] : [{}];
  if (a.potere === "zeppata-sui-social" && serveScelta(s, a, v)) {
    return [{ carte: [g.mano[0]!.id] }, ...caricheColpibili(g, a.potere).map((x) => ({ bersaglio: x.copia.id }))];
  }
  return [{}];
}

/* ------------------------------------------------------------------ */
/* Mosse valide per l'attaccante                                       */
/* ------------------------------------------------------------------ */

/** Scelte possibili per lanciare l'attacco `potere` (alcune, non tutte); vuoto se ora non si può. */
export function parametriAttacco(s: StatoPartita, id: IdGiocatore, potere: string): ParametriPotere[] {
  const g = s.giocatori[id]!;
  const avversari = avversariDopo(s, id).filter((x) => attaccabile(s, id, x));
  if (CONTRO_TUTTI.has(potere)) {
    if (potere === "multa" && avversari.every((x) => s.giocatori[x]!.mano.length === 0)) return [];
    if (avversari.length === 0) return [];
    return [{}];
  }
  if (potere === "invasione-di-campo") {
    if (avversari.length <= 1) return avversari.map((x) => ({ giocatori: [x] }));
    return avversari.flatMap((x, i) => avversari.slice(i + 1).map((y) => ({ giocatori: [x, y] })));
  }
  return avversari.flatMap((giocatore): ParametriPotere[] => {
    const o = s.giocatori[giocatore]!;
    if (STANCANO_UNA_CARTA.has(potere)) return caricheColpibili(o, potere).map((x) => ({ giocatore, bersaglio: x.copia.id }));
    if (potere === "vertenza") {
      // Solo le carte di cui si può pagare il codice (una combinazione per carta)
      const risorse = risorseGiocatore(g);
      return o.attivati
        .filter((x) => carta(x.copia.carta).livello <= 2)
        .flatMap((x) => trovaCombinazioni(risorse, carta(x.copia.carta).codice, 1).map((combinazione) => ({ giocatore, bersaglio: x.copia.id, combinazione })));
    }
    if (potere === "sparecchio") return o.attivati.map((x) => ({ giocatore, bersaglio: x.copia.id }));
    if (potere === "baratto") {
      return g.attivati
        .filter((x) => carta(x.copia.carta).id !== "nonna-patrizia-3")
        .flatMap((mia) => o.attivati.filter((sua) => livelloVicino(mia, sua)).map((sua) => ({ giocatore, propria: mia.copia.id, bersaglio: sua.copia.id })))
        .slice(0, 6);
    }
    if (potere === "gli-occhi-nguoll" || potere === "una-rospa") {
      if (o.nascosti.length === 0) return [];
      if (potere === "una-rospa" && g.mano.length > 0) return [{ giocatore, carte: [g.mano[0]!.id] }];
      return [{ giocatore }];
    }
    if (potere === "burla" && g.mano.length > 0) return [{ giocatore, carte: [g.mano[0]!.id] }];
    if (potere === "ho-tanta-fame" && !piuVicini(s, id).includes(giocatore)) return [];
    return [{ giocatore }];
  });
}
