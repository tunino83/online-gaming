/**
 * Regole del turno della Famiglia (vedi docs/famiglia/regolamento.md):
 * tavolo, mazzi, mosse, zone, limiti, mancia dei nonni, caffè, campanello, ricarica, fine turno e fine partita a punti.
 * I poteri di aiuto sono in poteri.ts; attacchi, difese ed eventi arrivano nei passi A4–A5 (docs/famiglia/piano.md).
 */
import { type EsitoPartita, type IdGiocatore, type RisultatoMossa, creaCasuale, mescola } from "@og/engine";
import {
  MossaNonValida,
  pesca,
  peschiNumeri,
  puntiDi,
  puoPescare,
  registra,
  riceviCarta,
  riempiTavolo,
  rifiuta,
  risorseGiocatore,
  scartaNumeri,
  togliNumero,
  zonaDi,
} from "./base";
import { carta } from "./carte";
import { trovaCombinazioni, verificaCombinazione } from "./codici";
import { fineTurnoEvento, inizioTurnoConEvento, mosseDaEvento, pescaEvento, puoPescareEvento, regala } from "./effetti-eventi";
import { creaMazzoEventi, creaMazzoMancia, creaMazzoNumeri, creaMazzoPersonaggi } from "./mazzi";
import { CARTE_NUMERO_SCOPERTE, MAX_GIOCATORI, MIN_GIOCATORI, OPZIONI_DEFAULT, type OpzioniPartita, PERSONAGGI_SCOPERTI } from "./parametri";
import { avviaAttacco, mosseDiDifesa, paga, parametriAttacco, rispondiAttacco } from "./attacchi";
import { POTERI_GRATIS, mosseDiPotere, mosseDiScelta, rispondiScelta, usaPotere } from "./poteri";
import type { Mossa, StatoGiocatore, StatoPartita, StatoTurno, TipoMossaNormale } from "./stato";
import type { CopiaCarta } from "./tipi-carte";
import { validaMossa } from "./valida-mossa";

export { PUNTI_FAMIGLIA_AL_COMPLETO, famiglieComplete, puntiDi, risorseGiocatore, zonaDi } from "./base";

/** Mosse in un turno in più (Doppio turno di Marika). */
const MOSSE_DOPPIO_TURNO = 2;

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
      giocatori.map((id): [IdGiocatore, StatoGiocatore] => [
        id,
        {
          mano: [],
          vetrina: [],
          mancia: [],
          nascosti: [],
          attacchi: [],
          attivati: [],
          mosseProssimoTurno: 0,
          zittoProssimoTurno: false,
          saltaProssimoTurno: false,
          protetto: false,
          nonStancabile: false,
          nascostiProtetti: false,
          vietati: [],
        },
      ]),
    ),
    turno: nuovoTurno("", 0),
    attacco: null,
    benedizione: null,
    tregua: null,
    ultimoPotere: null,
    evento: null,
    eventi: { mazzo: mescola(rng, creaMazzoEventi()), scarti: [] },
    registro: [],
  };
  riempiTavolo(stato);
  iniziaTurno(stato);
  return stato;
}

/* ------------------------------------------------------------------ */
/* Turni                                                               */
/* ------------------------------------------------------------------ */

function nuovoTurno(giocatore: IdGiocatore, mosse: number): StatoTurno {
  return {
    giocatore,
    mosseRimaste: mosse,
    attesa: null,
    ultimaMossa: null,
    mosseUguali: null,
    appenaPescata: null,
    pescaDoppia: false,
    intoccabili: [],
    fascicolo: null,
    doppioTurno: false,
    zitto: false,
    rivelati: [],
  };
}

function iniziaTurno(s: StatoPartita): void {
  const id = s.ordine[s.numeroTurno % s.ordine.length]!;
  const g = s.giocatori[id]!;
  // Chi salta il turno (al telefono con Roberta) non ha mosse; le carte stanche si ricaricano lo stesso
  const mosse = g.saltaProssimoTurno ? 0 : Math.max(0, s.opzioni.mossePerTurno + g.mosseProssimoTurno + mosseDaEvento(s, id));
  s.turno = nuovoTurno(id, mosse);
  s.turno.zitto = g.zittoProssimoTurno;
  g.saltaProssimoTurno = false;
  g.mosseProssimoTurno = 0;
  g.zittoProssimoTurno = false;
  // Finiscono le protezioni che duravano "fino al tuo prossimo turno"
  g.protetto = false;
  g.nonStancabile = false;
  g.nascostiProtetti = false;
  g.vietati = [];
  if (s.benedizione === id) s.benedizione = null;
  if (s.tregua !== null && s.numeroTurno > s.tregua) s.tregua = null;
  inizioTurnoConEvento(s, id);
  // Ricarica: ogni carta stanca recupera una tacca a inizio del proprio turno
  for (const a of g.attivati) if (a.stanca > 0) a.stanca -= 1;
}

/**
 * Fine partita in arrivo: qualcuno ha raggiunto i punti per vincere (modo "a punti") oppure il mazzo personaggi
 * è finito (modo "mazzo"). Si finisce il giro e poi si gioca un ultimo giro.
 */
function controllaTraguardo(s: StatoPartita): void {
  if (s.ultimoTurno !== null || s.finita) return;
  const aMazzo = s.opzioni.modoFine === "mazzo";
  const arrivato = aMazzo ? s.mazzi.personaggi.length === 0 : Object.values(s.giocatori).some((g) => puntiDi(g) >= s.opzioni.puntiPerVincere);
  if (!arrivato) return;
  const n = s.ordine.length;
  const giro = Math.floor(s.numeroTurno / n);
  s.ultimoTurno = (giro + 2) * n - 1;
  registra(s, s.turno.giocatore, { tipo: "ultimoGiro", punti: s.opzioni.puntiPerVincere, ...(aMazzo ? { mazzo: true as const } : {}) });
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

/** Carte numero che il giocatore può scartare a fine turno (non quelle prese con Alessia). */
const scartabili = (s: StatoPartita, g: StatoGiocatore) => g.mano.filter((c) => !s.turno.intoccabili.includes(c.id));

/** Quante carte numero deve scartare a fine turno (vetrina esclusa, mai più di quelle scartabili). */
const daScartare = (s: StatoPartita, g: StatoGiocatore) => Math.min(Math.max(0, g.mano.length - s.opzioni.limiteMano), scartabili(s, g).length);

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
    controllaTraguardo(s); // i punti cambiano anche con gli attacchi (Vertenza, Baratto, Sparecchio)
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
    if (t.attesa.tipo === "scartaCarta") {
      if (m.tipo !== "scartaCarta") rifiuta("Prima devi completare la scelta in sospeso");
      const { zona, nuova } = t.attesa;
      if ((m as { carta: string }).carta === nuova) rifiuta("Devi scartare una delle carte che avevi già");
      const i = g[zona].findIndex((c) => c.id === (m as { carta: string }).carta);
      if (i < 0) rifiuta("Carta non presente in quella zona");
      const [scartata] = g[zona].splice(i, 1);
      s.scarti.personaggi.push(scartata!);
      // Si dice quale carta solo se era scoperta (attacchi)
      registra(s, id, { tipo: "scartaCarta", zona, ...(zona === "attacchi" ? { carta: scartata!.carta } : {}) });
      t.attesa = null;
      return;
    }
    if (t.attesa.tipo === "difesa") rispondiAttacco(s, id, m);
    else if (t.attesa.tipo === "regalo") {
      if (m.tipo !== "regala") rifiuta("Prima scegli a chi dare la carta in più");
      regala(s, id, (m as Extract<Mossa, { tipo: "regala" }>).giocatore);
    } else rispondiScelta(s, id, m);
    return;
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
    case "scegli":
    case "riordina":
      rifiuta("Non c'è nessuna scelta in sospeso");
      break;
    case "difendi":
    case "subisci":
      rifiuta("Nessuno ti sta attaccando");
      break;
    case "regala":
      rifiuta("Non c'è niente da regalare");
  }

  // Poteri che non costano mosse: la carta appena pescata resta quella "appena pescata" fino a qui
  if (m.tipo === "potere" && POTERI_GRATIS.has(m.potere)) {
    usaPotere(s, id, m, t.appenaPescata);
    t.appenaPescata = null;
    return;
  }

  // Da qui in poi le mosse costano una mossa: prima quelle "uguali" di Nonno Salvatore, se la mossa è di quel tipo.
  if (t.mosseUguali && t.mosseUguali.quante > 0 && m.tipo === t.mosseUguali.tipo) {
    t.mosseUguali.quante -= 1;
  } else {
    if (t.mosseRimaste <= 0) rifiuta("Hai finito le mosse");
    t.mosseRimaste -= 1;
  }
  const appenaPescata = t.appenaPescata;
  t.appenaPescata = null;

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
      const prese = peschiNumeri(s, id, 1);
      if (prese.length === 0) rifiuta("Il mazzo numeri è vuoto");
      t.appenaPescata = { mazzo: "numeri", id: prese.at(-1)!.id };
      registra(s, id, { tipo: "pescaNumero" });
      break;
    }
    case "pescaPersonaggio": {
      const c = pesca(s, "personaggi");
      if (!c) rifiuta("Il mazzo personaggi è vuoto");
      // Un attacco va scoperto, quindi tutti sanno quale; una carta nascosta resta segreta
      registra(s, id, { tipo: "pescaPersonaggio", ...(zonaDi(c!) === "attacchi" ? { carta: c!.carta } : {}) });
      t.appenaPescata = { mazzo: "personaggi", id: c!.id };
      riceviCarta(s, id, c!);
      break;
    }
    case "brucia":
      brucia(s);
      registra(s, id, { tipo: "brucia" });
      break;
    case "pescaEvento":
      pescaEvento(s, id);
      break;
    case "attiva":
      attiva(s, id, m);
      break;
    case "potere":
      usaPotere(s, id, m, appenaPescata);
      break;
    case "usaCarta":
      usaCartaAttacco(s, id, m);
      break;
  }
  if (m.tipo !== "potere" && m.tipo !== "usaCarta") t.ultimaMossa = m.tipo as TipoMossaNormale;
  riempiTavolo(s);
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

  // Carte usate (anche quelle in vetrina, mance e caffè per il +1): vanno negli scarti.
  const usate = m.combinazione.flatMap((el) => [el.id, ...(el.modifica ? [el.modifica.mancia] : [])]);
  for (const idCarta of usate) {
    const numero = togliNumero(g, idCarta);
    if (numero) scartaNumeri(s, [numero]);
    else s.scarti.mancia.push(...g.mancia.splice(g.mancia.findIndex((x) => x.id === idCarta), 1));
  }

  // Il personaggio passa tra gli attivati, carico.
  const zona = zonaDi(copia!);
  g[zona].splice(g[zona].findIndex((x) => x.id === copia!.id), 1);
  g.attivati.push({ copia: copia!, stanca: 0 });
  // Premio dei nonni: chi attiva un personaggio di livello 3 riceve 1 mancia (se ce n'è ancora)
  const mancia = c.livello === 3 ? pesca(s, "mancia") : null;
  if (mancia) g.mancia.push(mancia);
  registra(s, id, {
    tipo: "attiva",
    carta: c.id,
    punti: c.punti,
    valori: m.combinazione.map((el) => el.valore),
    ...(mancia ? { mancia: true } : {}),
  });
}

/** Usa una carta attacco in attesa: si paga il codice, si scarta la carta e parte l'attacco. */
function usaCartaAttacco(s: StatoPartita, id: IdGiocatore, m: Extract<Mossa, { tipo: "usaCarta" }>): void {
  const g = s.giocatori[id]!;
  const i = g.attacchi.findIndex((c) => c.id === m.carta && carta(c.carta).categoria === "attacco");
  if (i < 0) rifiuta("Non hai questa carta attacco");
  const c = carta(g.attacchi[i]!.carta);
  if (s.turno.zitto) rifiuta("In questo turno non puoi usare poteri (Parla parla parla)");
  const { combinazione: _c, carta: _id, tipo: _t, ...parametri } = m;
  paga(s, g, c, m.combinazione);
  s.scarti.personaggi.push(...g.attacchi.splice(i, 1));
  avviaAttacco(s, id, c, c.poteri[0]!.id, parametri, null);
}

function fineTurno(s: StatoPartita, g: StatoGiocatore, scarta: string[]): void {
  const t = s.turno;
  if (t.mosseRimaste > 0 && haMossePossibili(s)) rifiuta("Devi ancora fare tutte le mosse");
  const quante = daScartare(s, g);
  if (new Set(scarta).size !== scarta.length) rifiuta("Carta da scartare ripetuta");
  if (scarta.length !== quante) rifiuta(`Devi scartare esattamente ${quante} carte`);
  for (const idCarta of scarta) {
    if (t.intoccabili.includes(idCarta)) rifiuta("Le carte prese con Alessia non si scartano in questo turno");
    const i = g.mano.findIndex((c) => c.id === idCarta);
    if (i < 0) rifiuta("Puoi scartare solo carte che hai in mano");
    scartaNumeri(s, g.mano.splice(i, 1));
  }
  registra(s, t.giocatore, { tipo: "fineTurno", scartate: scarta.length });
  fineTurnoEvento(s);

  // Doppio turno (Marika): subito un altro turno con 2 mosse, senza ricarica
  if (t.doppioTurno) {
    s.turno = nuovoTurno(t.giocatore, MOSSE_DOPPIO_TURNO);
    return;
  }
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
 * Per attivazioni e poteri propone un numero limitato di scelte; `applicaMossa`
 * accetta comunque qualsiasi scelta valida.
 */
export function mosseValide(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.finita || chiDeveMuovere(s) !== id) return [];
  const g = s.giocatori[id]!;
  const t = s.turno;

  if (t.attesa?.tipo === "scartaCarta") {
    const nuova = t.attesa.nuova;
    return g[t.attesa.zona].filter((c) => c.id !== nuova).map((c) => ({ tipo: "scartaCarta", carta: c.id }));
  }
  if (t.attesa?.tipo === "difesa") return mosseDiDifesa(s, id);
  if (t.attesa?.tipo === "regalo") return s.ordine.map((giocatore) => ({ tipo: "regala", giocatore }));
  if (t.attesa) return mosseDiScelta(s);

  const mosse: Mossa[] = [];
  const caffe = g.mancia.find((x) => x.tipo === "caffe");
  if (caffe) mosse.push({ tipo: "caffe", mancia: caffe.id });

  if (t.mosseRimaste > 0) {
    mosse.push(...mosseNormali(s, g), ...mosseDiPotere(s, id), ...mosseDiCarteAttacco(s, id));
  } else {
    if (t.mosseUguali && t.mosseUguali.quante > 0) {
      const tipo = t.mosseUguali.tipo;
      mosse.push(...mosseNormali(s, g).filter((m) => m.tipo === tipo));
    }
    mosse.push(...mosseDiPotere(s, id).filter((m) => m.tipo === "potere" && POTERI_GRATIS.has(m.potere)));
  }

  if (t.mosseRimaste === 0 || !haMossePossibili(s)) mosse.push(...mosseDiFineTurno(s, g));
  return mosse;
}

/** Prendere, pescare, bruciare e attivare. */
function mosseNormali(s: StatoPartita, g: StatoGiocatore): Mossa[] {
  const mosse: Mossa[] = [];
  s.tavolo.numeri.forEach((c, posizione) => c && mosse.push({ tipo: "prendiNumero", posizione }));
  s.tavolo.personaggi.forEach((c, posizione) => c && mosse.push({ tipo: "prendiPersonaggio", posizione }));
  if (puoPescare(s, "numeri")) mosse.push({ tipo: "pescaNumero" });
  if (puoPescare(s, "personaggi")) mosse.push({ tipo: "pescaPersonaggio" });
  if (s.tavolo.numeri.some((c) => c !== null) || puoPescare(s, "numeri")) mosse.push({ tipo: "brucia" });
  if (puoPescareEvento(s)) mosse.push({ tipo: "pescaEvento" });
  const risorse = risorseGiocatore(g);
  for (const copia of attivabili(g)) {
    for (const combinazione of trovaCombinazioni(risorse, carta(copia.carta).codice, COMBINAZIONI_PER_CARTA)) {
      mosse.push({ tipo: "attiva", carta: copia.id, combinazione });
    }
  }
  return mosse;
}

/** Carte attacco che si possono usare (prima combinazione per pagarle, alcune scelte). */
function mosseDiCarteAttacco(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.turno.zitto) return [];
  const g = s.giocatori[id]!;
  const risorse = risorseGiocatore(g);
  return g.attacchi
    .filter((c) => carta(c.carta).categoria === "attacco")
    .flatMap((copia) => {
      const c = carta(copia.carta);
      const [combinazione] = trovaCombinazioni(risorse, c.codice, 1);
      if (!combinazione) return [];
      const pagate = new Set(combinazione.map((el) => el.id));
      return parametriAttacco(s, id, c.poteri[0]!.id)
        .filter((p) => !p.carte?.some((x) => pagate.has(x)))
        .map((p): Mossa => ({ tipo: "usaCarta", carta: copia.id, combinazione, ...p }));
    });
}

function mosseDiFineTurno(s: StatoPartita, g: StatoGiocatore): Mossa[] {
  return sottoinsiemi(
    scartabili(s, g).map((c) => c.id),
    daScartare(s, g),
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

/**
 * Mossa che il server fa da solo: chiudere il turno quando le mosse sono finite, tranne se c'è un caffè,
 * restano mosse "uguali" di Nonno Salvatore, si può usare un potere gratis o ci sono carte da scartare.
 */
export function mossaAutomatica(s: StatoPartita): { giocatore: IdGiocatore; mossa: Mossa } | null {
  if (s.finita || s.turno.attesa || s.turno.mosseRimaste > 0) return null;
  if (s.turno.mosseUguali && s.turno.mosseUguali.quante > 0) return null;
  const giocatore = s.turno.giocatore;
  if (mosseDiPotere(s, giocatore).some((m) => m.tipo === "potere" && POTERI_GRATIS.has(m.potere))) return null; // es. Non sbaglio mai
  const g = s.giocatori[giocatore]!;
  if (g.mancia.some((x) => x.tipo === "caffe")) return null; // può ancora bere il caffè
  if (daScartare(s, g) > 0) return null; // deve scegliere cosa scartare
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
