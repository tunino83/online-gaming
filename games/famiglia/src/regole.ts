/**
 * Regole della partita base della Famiglia (vedi docs/famiglia/regolamento.md):
 * tavolo, mazzi, mosse, zone, limiti, mancia dei nonni, caffè, campanello, fine turno e fine partita a punti.
 * Poteri, attacchi, difese ed eventi arrivano nei passi A3–A5 (docs/famiglia/piano.md).
 */
import { type EsitoPartita, type IdGiocatore, type RisultatoMossa, creaCasuale, mescola } from "@og/engine";
import { carta, eAttacco } from "./carte";
import { type Risorse, trovaCombinazioni, verificaCombinazione } from "./codici";
import { creaMazzoMancia, creaMazzoNumeri, creaMazzoPersonaggi } from "./mazzi";
import { CARTE_NUMERO_SCOPERTE, MAX_GIOCATORI, MIN_GIOCATORI, OPZIONI_DEFAULT, type OpzioniPartita, PERSONAGGI_SCOPERTI } from "./parametri";
import { type DatiFatto, LUNGHEZZA_REGISTRO, type Mazzi, type Mossa, type StatoGiocatore, type StatoPartita, type Zona } from "./stato";
import type { CartaNumero, CopiaCarta } from "./tipi-carte";
import { validaMossa } from "./valida-mossa";

/** Errore di una mossa non permessa: il messaggio è per il giocatore. */
class MossaNonValida extends Error {}
const rifiuta = (messaggio: string): never => {
  throw new MossaNonValida(messaggio);
};

/* ------------------------------------------------------------------ */
/* Preparazione                                                        */
/* ------------------------------------------------------------------ */

export function setup(giocatori: IdGiocatore[], opzioni: Partial<OpzioniPartita>, seed: number): StatoPartita {
  if (giocatori.length < MIN_GIOCATORI || giocatori.length > MAX_GIOCATORI) {
    throw new Error(`Si gioca da ${MIN_GIOCATORI} a ${MAX_GIOCATORI} giocatori`);
  }
  if (new Set(giocatori).size !== giocatori.length) throw new Error("Giocatori ripetuti");
  const rng = creaCasuale(seed);
  const stato: StatoPartita = {
    opzioni: { ...OPZIONI_DEFAULT, ...opzioni },
    rng,
    ordine: mescola(rng, giocatori),
    numeroTurno: 0,
    ultimoTurno: null,
    finita: false,
    mazzi: {
      numeri: mescola(rng, creaMazzoNumeri()),
      personaggi: mescola(rng, creaMazzoPersonaggi()),
      mancia: mescola(rng, creaMazzoMancia()),
    },
    scarti: { numeri: [], personaggi: [], mancia: [] },
    tavolo: {
      numeri: Array.from({ length: CARTE_NUMERO_SCOPERTE }, () => null),
      personaggi: Array.from({ length: PERSONAGGI_SCOPERTI }, () => null),
    },
    giocatori: Object.fromEntries(
      giocatori.map((id): [IdGiocatore, StatoGiocatore] => [id, { mano: [], mancia: [], nascosti: [], attacchi: [], attivati: [] }]),
    ),
    turno: { giocatore: "", mosseRimaste: 0, attesa: null },
    registro: [],
  };
  riempiTavolo(stato);
  iniziaTurno(stato);
  return stato;
}

/* ------------------------------------------------------------------ */
/* Registro (ultime cose successe, solo informazioni pubbliche)        */
/* ------------------------------------------------------------------ */

function registra(s: StatoPartita, giocatore: IdGiocatore, f: DatiFatto): void {
  const n = (s.registro.at(-1)?.n ?? 0) + 1;
  s.registro.push({ n, giocatore, ...f });
  if (s.registro.length > LUNGHEZZA_REGISTRO) s.registro.splice(0, s.registro.length - LUNGHEZZA_REGISTRO);
}

/* ------------------------------------------------------------------ */
/* Mazzi e tavolo                                                      */
/* ------------------------------------------------------------------ */

/** Pesca la prima carta di un mazzo; se è finito rimescola gli scarti. `null` se non c'è nulla. */
export function pesca<K extends keyof Mazzi>(s: StatoPartita, mazzo: K): Mazzi[K][number] | null {
  if (s.mazzi[mazzo].length === 0 && s.scarti[mazzo].length > 0) {
    s.mazzi[mazzo] = mescola<Mazzi[K][number]>(s.rng, s.scarti[mazzo]) as Mazzi[K];
    s.scarti[mazzo] = [] as Mazzi[K];
  }
  return (s.mazzi[mazzo].pop() as Mazzi[K][number] | undefined) ?? null;
}

const puoPescare = (s: StatoPartita, mazzo: keyof Mazzi) => s.mazzi[mazzo].length + s.scarti[mazzo].length > 0;

/**
 * Riempie i posti vuoti del tavolo, se ci sono carte disponibili.
 * Ogni carta con il campanello che compare scoperta fa cambiare i personaggi scoperti
 * (vanno negli scarti e se ne scoprono di nuovi): due campanelli, due cambi.
 */
function riempiTavolo(s: StatoPartita): void {
  const campanelli: CartaNumero[] = [];
  s.tavolo.numeri = s.tavolo.numeri.map((c) => {
    if (c) return c;
    const nuova = pesca(s, "numeri");
    if (nuova?.campanello) campanelli.push(nuova);
    return nuova;
  });
  s.tavolo.personaggi = s.tavolo.personaggi.map((c) => c ?? pesca(s, "personaggi"));
  for (const c of campanelli) {
    const scartati = s.tavolo.personaggi.filter((x) => x !== null);
    s.scarti.personaggi.push(...scartati);
    s.tavolo.personaggi = s.tavolo.personaggi.map(() => null);
    s.tavolo.personaggi = s.tavolo.personaggi.map(() => pesca(s, "personaggi"));
    // A inizio partita non c'è ancora nessuno di turno: il cambio non va nel registro
    if (s.turno.giocatore) {
      registra(s, s.turno.giocatore, {
        tipo: "campanello",
        valore: c.valore,
        scartati: scartati.map((x) => x.carta),
        nuovi: s.tavolo.personaggi.filter((x) => x !== null).map((x) => x.carta),
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Giocatori                                                           */
/* ------------------------------------------------------------------ */

/** Punti di un giocatore: la somma dei punti dei personaggi attivati. */
export const puntiDi = (g: Pick<StatoGiocatore, "attivati">): number => g.attivati.reduce((tot, a) => tot + carta(a.copia.carta).punti, 0);

/** Cosa può usare il giocatore per un codice: carte numero in mano e mancia. */
export const risorseGiocatore = (g: Pick<StatoGiocatore, "mano" | "mancia">): Risorse => ({ mano: g.mano, mancia: g.mancia });

/** Zona in cui va una carta del mazzo personaggi: gli attacchi scoperti, tutto il resto nascosto in mano. */
export const zonaDi = (copia: CopiaCarta): Zona => (eAttacco(carta(copia.carta)) ? "attacchi" : "nascosti");

const limiteZona = (s: StatoPartita, zona: Zona) => (zona === "nascosti" ? s.opzioni.maxNascosti : s.opzioni.maxAttacchi);

/* ------------------------------------------------------------------ */
/* Turni                                                               */
/* ------------------------------------------------------------------ */

const giocatoreDiTurno = (s: StatoPartita, n: number) => s.ordine[n % s.ordine.length]!;

function iniziaTurno(s: StatoPartita): void {
  const id = giocatoreDiTurno(s, s.numeroTurno);
  s.turno = { giocatore: id, mosseRimaste: s.opzioni.mossePerTurno, attesa: null };
  // Ricarica: ogni carta stanca recupera una tacca a inizio del proprio turno
  for (const a of s.giocatori[id]!.attivati) if (a.stanca > 0) a.stanca -= 1;
}

/** Se qualcuno ha raggiunto i punti per vincere: si finisce il giro e poi si gioca un ultimo giro. */
function controllaTraguardo(s: StatoPartita): void {
  if (s.ultimoTurno !== null) return;
  if (!Object.values(s.giocatori).some((g) => puntiDi(g) >= s.opzioni.puntiPerVincere)) return;
  const n = s.ordine.length;
  const giro = Math.floor(s.numeroTurno / n);
  s.ultimoTurno = (giro + 2) * n - 1;
  registra(s, s.turno.giocatore, { tipo: "ultimoGiro", punti: s.opzioni.puntiPerVincere });
}

/** Il giocatore può ancora fare una mossa che costa (prendere, pescare, bruciare)? */
function haMossePossibili(s: StatoPartita): boolean {
  return (
    s.tavolo.numeri.some((c) => c !== null) ||
    s.tavolo.personaggi.some((c) => c !== null) ||
    puoPescare(s, "numeri") ||
    puoPescare(s, "personaggi")
  );
}

/** Chi deve decidere adesso: chi ha una scelta in sospeso, altrimenti chi è di turno. */
export const chiDeveMuovere = (s: StatoPartita): IdGiocatore => s.turno.attesa?.giocatore ?? s.turno.giocatore;

/* ------------------------------------------------------------------ */
/* Applicazione delle mosse                                            */
/* ------------------------------------------------------------------ */

export function applicaMossa(stato: StatoPartita, id: IdGiocatore, mossa: Mossa): RisultatoMossa<StatoPartita> {
  // La mossa può arrivare da un browser: prima si controlla che abbia la forma giusta.
  if (!validaMossa(mossa)) return { ok: false, errore: "Mossa non valida" };
  const s = structuredClone(stato);
  try {
    applica(s, id, mossa);
    riempiTavolo(s); // un mazzo può aver ricevuto carte negli scarti: i posti vuoti si riempiono
    return { ok: true, stato: s };
  } catch (e) {
    if (e instanceof MossaNonValida) return { ok: false, errore: e.message };
    throw e;
  }
}

function applica(s: StatoPartita, id: IdGiocatore, m: Mossa): void {
  if (s.finita) rifiuta("La partita è finita");
  if (!s.ordine.includes(id)) rifiuta("Giocatore non in partita");
  if (chiDeveMuovere(s) !== id) rifiuta(s.turno.attesa ? "Si aspetta la scelta di un altro giocatore" : "Non è il tuo turno");
  const g = s.giocatori[id]!;
  const t = s.turno;

  // Decisione in attesa: si accetta solo la risposta.
  if (t.attesa) {
    if (t.attesa.tipo === "scartaCarta" && m.tipo === "scartaCarta") {
      if (m.carta === t.attesa.nuova) rifiuta("Devi scartare una delle carte che avevi già");
      const zona = g[t.attesa.zona];
      const i = zona.findIndex((c) => c.id === m.carta);
      if (i < 0) rifiuta("Carta non presente in quella zona");
      const [scartata] = zona.splice(i, 1);
      s.scarti.personaggi.push(scartata!);
      // Si dice quale carta solo se era scoperta (attacchi)
      registra(s, id, { tipo: "scartaCarta", zona: t.attesa.zona, ...(t.attesa.zona === "attacchi" ? { carta: scartata!.carta } : {}) });
      t.attesa = null;
      return;
    }
    rifiuta("Prima devi completare la scelta in sospeso");
  }

  switch (m.tipo) {
    case "caffe": {
      const i = g.mancia.findIndex((x) => x.id === m.mancia && x.tipo === "caffe");
      if (i < 0) rifiuta("Non hai quel caffè");
      s.scarti.mancia.push(...g.mancia.splice(i, 1));
      t.mosseRimaste += 1;
      registra(s, id, { tipo: "caffe" });
      return;
    }
    case "fineTurno":
      fineTurno(s, g, m.scarta);
      return;
    case "scartaCarta":
      rifiuta("Non c'è nessuna scelta in sospeso");
  }

  // Da qui in poi le mosse costano una mossa.
  if (t.mosseRimaste <= 0) rifiuta("Hai finito le mosse");
  t.mosseRimaste -= 1;

  switch (m.tipo) {
    case "prendiNumero": {
      const c = s.tavolo.numeri[m.posizione];
      if (!c) rifiuta("Nessuna carta in quella posizione");
      g.mano.push(c!);
      s.tavolo.numeri[m.posizione] = null;
      registra(s, id, { tipo: "prendiNumero", valore: c!.valore });
      break;
    }
    case "prendiPersonaggio": {
      const c = s.tavolo.personaggi[m.posizione];
      if (!c) rifiuta("Nessun personaggio in quella posizione");
      s.tavolo.personaggi[m.posizione] = null;
      registra(s, id, { tipo: "prendiPersonaggio", carta: c!.carta }); // era scoperta sul tavolo
      riceviCarta(s, id, c!);
      break;
    }
    case "pescaNumero": {
      const c = pesca(s, "numeri");
      if (!c) rifiuta("Il mazzo numeri è vuoto");
      g.mano.push(c!);
      registra(s, id, { tipo: "pescaNumero" });
      break;
    }
    case "pescaPersonaggio": {
      const c = pesca(s, "personaggi");
      if (!c) rifiuta("Il mazzo personaggi è vuoto");
      // Un attacco va scoperto, quindi tutti sanno quale; una carta nascosta resta segreta
      registra(s, id, { tipo: "pescaPersonaggio", ...(zonaDi(c!) === "attacchi" ? { carta: c!.carta } : {}) });
      riceviCarta(s, id, c!);
      break;
    }
    case "brucia":
      brucia(s);
      registra(s, id, { tipo: "brucia" });
      break;
    case "attiva":
      attiva(s, id, m);
      break;
  }
  riempiTavolo(s);
}

/** Mette la carta nella zona giusta; se la zona è piena il giocatore deve scartarne una delle vecchie. */
function riceviCarta(s: StatoPartita, id: IdGiocatore, copia: CopiaCarta): void {
  const zona = zonaDi(copia);
  const lista = s.giocatori[id]![zona];
  lista.push(copia);
  if (lista.length > limiteZona(s, zona)) s.turno.attesa = { tipo: "scartaCarta", giocatore: id, zona, nuova: copia.id };
}

/** Scarta le carte numero scoperte e ne scopre di nuove. */
function brucia(s: StatoPartita): void {
  const scoperte = s.tavolo.numeri.filter((c) => c !== null);
  if (scoperte.length === 0 && !puoPescare(s, "numeri")) rifiuta("Non ci sono carte numero da bruciare");
  s.scarti.numeri.push(...scoperte);
  s.tavolo.numeri = s.tavolo.numeri.map(() => null);
  riempiTavolo(s);
}

/** Carte del giocatore che si possono attivare: i personaggi nascosti in mano o in attesa tra gli attacchi. */
function attivabili(g: StatoGiocatore): CopiaCarta[] {
  return [...g.nascosti, ...g.attacchi].filter((c) => carta(c.carta).categoria === "personaggio");
}

function attiva(s: StatoPartita, id: IdGiocatore, m: Extract<Mossa, { tipo: "attiva" }>): void {
  const g = s.giocatori[id]!;
  const copia = attivabili(g).find((c) => c.id === m.carta);
  if (!copia) rifiuta("Non puoi attivare questa carta");
  const c = carta(copia!.carta);

  const esito = verificaCombinazione(risorseGiocatore(g), c.codice, m.combinazione);
  if (!esito.ok) rifiuta(esito.errore);

  // Carte usate (anche mance e caffè per il +1): vanno negli scarti.
  const usate = m.combinazione.flatMap((el) => [el.id, ...(el.modifica ? [el.modifica.mancia] : [])]);
  for (const idCarta of usate) {
    const iMano = g.mano.findIndex((x) => x.id === idCarta);
    if (iMano >= 0) s.scarti.numeri.push(...g.mano.splice(iMano, 1));
    else s.scarti.mancia.push(...g.mancia.splice(g.mancia.findIndex((x) => x.id === idCarta), 1));
  }

  // Il personaggio passa tra gli attivati, carico.
  const zona = zonaDi(copia!);
  g[zona].splice(g[zona].findIndex((x) => x.id === copia!.id), 1);
  g.attivati.push({ copia: copia!, stanca: 0 });
  registra(s, id, { tipo: "attiva", carta: c.id, punti: c.punti, valori: m.combinazione.map((el) => el.valore) });
  controllaTraguardo(s);
}

function fineTurno(s: StatoPartita, g: StatoGiocatore, scarta: string[]): void {
  if (s.turno.mosseRimaste > 0 && haMossePossibili(s)) rifiuta("Devi ancora fare tutte le mosse");
  const eccesso = Math.max(0, g.mano.length - s.opzioni.limiteMano);
  if (new Set(scarta).size !== scarta.length) rifiuta("Carta da scartare ripetuta");
  if (scarta.length !== eccesso) rifiuta(`Devi scartare esattamente ${eccesso} carte`);
  for (const idCarta of scarta) {
    const i = g.mano.findIndex((c) => c.id === idCarta);
    if (i < 0) rifiuta("Puoi scartare solo carte che hai in mano");
    s.scarti.numeri.push(...g.mano.splice(i, 1));
  }
  registra(s, s.turno.giocatore, { tipo: "fineTurno", scartate: scarta.length });

  if (s.ultimoTurno !== null && s.numeroTurno >= s.ultimoTurno) {
    s.finita = true;
    return;
  }
  s.numeroTurno += 1;
  iniziaTurno(s);
}

/* ------------------------------------------------------------------ */
/* Mosse valide                                                        */
/* ------------------------------------------------------------------ */

/** Quante combinazioni diverse proporre per ogni carta attivabile. */
const COMBINAZIONI_PER_CARTA = 10;

/**
 * Elenco delle mosse possibili ora per il giocatore.
 * Per le attivazioni propone un numero limitato di combinazioni; `applicaMossa`
 * accetta comunque qualsiasi combinazione valida.
 */
export function mosseValide(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.finita || chiDeveMuovere(s) !== id) return [];
  const g = s.giocatori[id]!;
  const t = s.turno;

  if (t.attesa?.tipo === "scartaCarta") {
    const nuova = t.attesa.nuova;
    return g[t.attesa.zona].filter((c) => c.id !== nuova).map((c) => ({ tipo: "scartaCarta", carta: c.id }));
  }

  const mosse: Mossa[] = [];
  const caffe = g.mancia.find((x) => x.tipo === "caffe");
  if (caffe) mosse.push({ tipo: "caffe", mancia: caffe.id });

  if (t.mosseRimaste > 0) {
    s.tavolo.numeri.forEach((c, posizione) => c && mosse.push({ tipo: "prendiNumero", posizione }));
    s.tavolo.personaggi.forEach((c, posizione) => c && mosse.push({ tipo: "prendiPersonaggio", posizione }));
    if (puoPescare(s, "numeri")) mosse.push({ tipo: "pescaNumero" });
    if (puoPescare(s, "personaggi")) mosse.push({ tipo: "pescaPersonaggio" });
    if (s.tavolo.numeri.some((c) => c !== null) || puoPescare(s, "numeri")) mosse.push({ tipo: "brucia" });
    const risorse = risorseGiocatore(g);
    for (const copia of attivabili(g)) {
      for (const combinazione of trovaCombinazioni(risorse, carta(copia.carta).codice, COMBINAZIONI_PER_CARTA)) {
        mosse.push({ tipo: "attiva", carta: copia.id, combinazione });
      }
    }
  }

  if (t.mosseRimaste === 0 || !haMossePossibili(s)) mosse.push(...mosseDiFineTurno(s, g));
  return mosse;
}

function mosseDiFineTurno(s: StatoPartita, g: StatoGiocatore): Mossa[] {
  const eccesso = Math.max(0, g.mano.length - s.opzioni.limiteMano);
  return sottoinsiemi(
    g.mano.map((c) => c.id),
    eccesso,
    10,
  ).map((scarta): Mossa => ({ tipo: "fineTurno", scarta }));
}

/** Fino a `limite` sottoinsiemi di `k` elementi. */
function sottoinsiemi<T>(lista: T[], k: number, limite: number): T[][] {
  const res: T[][] = [];
  const scegli = (da: number, scelti: T[]) => {
    if (res.length >= limite) return;
    if (scelti.length === k) {
      res.push(scelti);
      return;
    }
    for (let i = da; i < lista.length; i++) scegli(i + 1, [...scelti, lista[i]!]);
  };
  scegli(0, []);
  return res;
}

/** Mossa che il server fa da solo: chiudere il turno quando le mosse sono finite, tranne se c'è un caffè o carte da scartare. */
export function mossaAutomatica(s: StatoPartita): { giocatore: IdGiocatore; mossa: Mossa } | null {
  if (s.finita || s.turno.attesa || s.turno.mosseRimaste > 0) return null;
  const giocatore = s.turno.giocatore;
  const g = s.giocatori[giocatore]!;
  if (g.mancia.some((x) => x.tipo === "caffe")) return null; // può ancora bere il caffè
  if (g.mano.length > s.opzioni.limiteMano) return null; // deve scegliere cosa scartare
  return { giocatore, mossa: { tipo: "fineTurno", scarta: [] } };
}

/* ------------------------------------------------------------------ */
/* Fine partita                                                        */
/* ------------------------------------------------------------------ */

export function finePartita(s: StatoPartita): EsitoPartita | null {
  if (!s.finita) return null;
  const punti = Object.fromEntries(s.ordine.map((id) => [id, puntiDi(s.giocatori[id]!)]));
  const massimo = Math.max(...Object.values(punti));
  return { vincitori: s.ordine.filter((id) => punti[id] === massimo), punti };
}
