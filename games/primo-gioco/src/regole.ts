/**
 * Regole del turno (vedi docs/regolamento.md, "Il turno", "Personaggi, poteri e diamanti",
 * "Fine partita" e le decisioni prese in "Domande aperte").
 */
import { type EsitoPartita, type IdGiocatore, type RisultatoMossa, creaCasuale, mescola } from "@og/engine";
import { type CartaVirtuale, type Combinazione, type Risorse, trovaCombinazioni, verificaCombinazione } from "./codici";
import { creaMazzoDiamanti, creaMazzoNumeri, creaMazzoPersonaggi } from "./mazzi";
import {
  CARTE_NUMERO_SCOPERTE,
  MAX_GIOCATORI,
  MIN_GIOCATORI,
  OPZIONI_DEFAULT,
  type OpzioniPartita,
  PERSONAGGI_SCOPERTI,
} from "./parametri";
import { personaggio } from "./personaggi";
import type { Mazzi, Mossa, StatoGiocatore, StatoPartita } from "./stato";
import { validaMossa } from "./valida-mossa";
import type { CartaPersonaggio, Effetto } from "./tipi-carte";

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
      diamanti: mescola(rng, creaMazzoDiamanti()),
    },
    scarti: { numeri: [], personaggi: [], diamanti: [] },
    tavolo: {
      numeri: Array.from({ length: CARTE_NUMERO_SCOPERTE }, () => null),
      personaggi: Array.from({ length: PERSONAGGI_SCOPERTI }, () => null),
    },
    giocatori: Object.fromEntries(
      giocatori.map((id): [IdGiocatore, StatoGiocatore] => [
        id,
        { mano: [], diamanti: [], posti: [], attivati: [], punti: 0, mosseExtraProssimoTurno: 0 },
      ]),
    ),
    turno: { giocatore: "", mosseRimaste: 0, virtualiUsate: [], bruciaGratisUsata: false, iniziato: false, attesa: null },
  };
  riempiTavolo(stato);
  iniziaTurno(stato);
  return stato;
}

/* ------------------------------------------------------------------ */
/* Mazzi e tavolo                                                      */
/* ------------------------------------------------------------------ */

/** Pesca la prima carta di un mazzo; se è finito rimescola gli scarti. `null` se non c'è nulla. */
function pesca<K extends keyof Mazzi>(s: StatoPartita, mazzo: K): Mazzi[K][number] | null {
  if (s.mazzi[mazzo].length === 0 && s.scarti[mazzo].length > 0) {
    s.mazzi[mazzo] = mescola<Mazzi[K][number]>(s.rng, s.scarti[mazzo]) as Mazzi[K];
    s.scarti[mazzo] = [] as Mazzi[K];
  }
  return (s.mazzi[mazzo].pop() as Mazzi[K][number] | undefined) ?? null;
}

const puoPescare = (s: StatoPartita, mazzo: keyof Mazzi) => s.mazzi[mazzo].length + s.scarti[mazzo].length > 0;

/** Riempie i posti vuoti del tavolo, se ci sono carte disponibili. */
function riempiTavolo(s: StatoPartita): void {
  s.tavolo.numeri = s.tavolo.numeri.map((c) => c ?? pesca(s, "numeri"));
  s.tavolo.personaggi = s.tavolo.personaggi.map((c) => c ?? pesca(s, "personaggi"));
}

/* ------------------------------------------------------------------ */
/* Poteri                                                              */
/* ------------------------------------------------------------------ */

/** Effetti dei poteri blu dei personaggi attivati, con la carta che li dà. */
function effettiBlu(g: Pick<StatoGiocatore, "attivati">): { carta: string; effetto: Effetto }[] {
  return g.attivati.flatMap((c) =>
    personaggio(c.personaggio)
      .poteri.filter((p) => p.colore === "blu")
      .map((p) => ({ carta: c.id, effetto: p.effetto })),
  );
}

const ha = (g: Pick<StatoGiocatore, "attivati">, tipo: Effetto["tipo"]) => effettiBlu(g).some((e) => e.effetto.tipo === tipo);

export function limiteMano(s: StatoPartita, g: StatoGiocatore): number {
  return effettiBlu(g).reduce(
    (tot, e) => tot + (e.effetto.tipo === "limiteMano" ? e.effetto.aumento : 0),
    s.opzioni.limiteMano,
  );
}

function mosseDelTurno(s: StatoPartita, g: StatoGiocatore): number {
  return effettiBlu(g).reduce(
    (tot, e) => tot + (e.effetto.tipo === "mosseInPiuOgniTurno" ? e.effetto.mosse : 0),
    s.opzioni.mossePerTurno,
  );
}

/** Cosa può usare il giocatore per un codice in questo momento. */
export function risorseDi(s: StatoPartita, id: IdGiocatore): Risorse {
  return risorseGiocatore(s.giocatori[id]!, s.turno.giocatore === id ? s.turno.virtualiUsate : []);
}

/**
 * Risorse a partire dai soli dati che il giocatore vede di sé (mano, diamanti, attivati):
 * le usa anche il browser, per proporre le combinazioni quando si attiva toccando.
 */
export function risorseGiocatore(
  g: Pick<StatoGiocatore, "mano" | "diamanti" | "attivati">,
  usate: readonly string[],
): Risorse {
  const virtuali: CartaVirtuale[] = effettiBlu(g).flatMap(({ carta, effetto }) =>
    effetto.tipo === "cartaVirtuale" && !usate.includes(carta) ? [{ fonte: carta, valore: effetto.valore }] : [],
  );
  return {
    mano: g.mano,
    diamanti: g.diamanti,
    virtuali,
    poteri: { unoValeOtto: ha(g, "unoValeOtto"), treJolly: ha(g, "treJolly"), diamanteMenoUno: ha(g, "diamanteMenoUno") },
  };
}

/** Giocatori subito prima e subito dopo nell'ordine di turno. */
function vicini(s: StatoPartita, id: IdGiocatore): IdGiocatore[] {
  const n = s.ordine.length;
  const i = s.ordine.indexOf(id);
  return [...new Set([s.ordine[(i + n - 1) % n]!, s.ordine[(i + 1) % n]!])].filter((x) => x !== id);
}

/** Personaggi che il giocatore può provare ad attivare: i suoi posti e le Lucciole dei vicini. */
function attivabili(s: StatoPartita, id: IdGiocatore): { proprietario: IdGiocatore; carta: CartaPersonaggio }[] {
  const miei = s.giocatori[id]!.posti.map((carta) => ({ proprietario: id, carta }));
  const lucciole = vicini(s, id).flatMap((v) =>
    s.giocatori[v]!.posti
      .filter((c) => personaggio(c.personaggio).poteri.some((p) => p.effetto.tipo === "attivabileDaVicini"))
      .map((carta) => ({ proprietario: v, carta })),
  );
  return [...miei, ...lucciole];
}

/* ------------------------------------------------------------------ */
/* Turni                                                               */
/* ------------------------------------------------------------------ */

const giocatoreDiTurno = (s: StatoPartita, n: number) => s.ordine[n % s.ordine.length]!;

function iniziaTurno(s: StatoPartita): void {
  const id = giocatoreDiTurno(s, s.numeroTurno);
  const g = s.giocatori[id]!;
  s.turno = {
    giocatore: id,
    mosseRimaste: mosseDelTurno(s, g) + g.mosseExtraProssimoTurno,
    virtualiUsate: [],
    bruciaGratisUsata: false,
    iniziato: false,
    attesa: null,
  };
  g.mosseExtraProssimoTurno = 0;
}

/** Se qualcuno ha raggiunto i punti per vincere: si finisce il giro e poi si gioca un ultimo giro. */
function controllaTraguardo(s: StatoPartita): void {
  if (s.ultimoTurno !== null) return;
  if (!Object.values(s.giocatori).some((g) => g.punti >= s.opzioni.puntiPerVincere)) return;
  const n = s.ordine.length;
  const giro = Math.floor(s.numeroTurno / n);
  s.ultimoTurno = (giro + 2) * n - 1;
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
  if (s.turno.giocatore !== id) rifiuta("Non è il tuo turno");
  const g = s.giocatori[id]!;
  const t = s.turno;

  // Decisione in attesa: si accetta solo la risposta.
  if (t.attesa) {
    if (t.attesa.tipo === "scartaPersonaggio" && m.tipo === "scartaPersonaggio") {
      if (m.carta === t.attesa.nuovo) rifiuta("Devi scartare uno dei personaggi che avevi già");
      const i = g.posti.findIndex((c) => c.id === m.carta);
      if (i < 0) rifiuta("Personaggio non nei tuoi posti");
      s.scarti.personaggi.push(...g.posti.splice(i, 1));
      t.attesa = null;
      riempiTavolo(s);
      return;
    }
    if (t.attesa.tipo === "fatina" && m.tipo === "prendiDaFatina") {
      const altro = s.giocatori[t.attesa.avversario]!;
      const i = altro.mano.findIndex((c) => c.id === m.carta);
      if (i < 0) rifiuta("Carta non nella mano dell'avversario");
      g.mano.push(...altro.mano.splice(i, 1));
      t.attesa = null;
      return;
    }
    rifiuta("Prima devi completare la scelta in sospeso");
  }

  if (m.tipo === "scambiaConTavolo") {
    if (!ha(g, "scambiaConTavolo")) rifiuta("Serve il Cappellaio matto");
    if (t.iniziato) rifiuta("Lo scambio si fa solo a inizio turno");
    const i = g.posti.findIndex((c) => c.id === m.carta);
    if (i < 0) rifiuta("Personaggio non nei tuoi posti");
    const dalTavolo = s.tavolo.personaggi[m.posizione];
    if (!dalTavolo) rifiuta("Nessun personaggio in quella posizione del tavolo");
    s.tavolo.personaggi[m.posizione] = g.posti[i]!;
    g.posti[i] = dalTavolo!;
    t.iniziato = true;
    return;
  }
  t.iniziato = true;

  switch (m.tipo) {
    case "giocaFulmine": {
      const i = g.diamanti.findIndex((d) => d.id === m.diamante && d.tipo === "fulmine");
      if (i < 0) rifiuta("Non hai quel fulmine");
      s.scarti.diamanti.push(...g.diamanti.splice(i, 1));
      t.mosseRimaste += 1;
      return;
    }
    case "dueInDiamante": {
      if (!ha(g, "dueInDiamante")) rifiuta("Serve Biancaneve");
      const i = g.mano.findIndex((c) => c.id === m.carta);
      if (i < 0 || g.mano[i]!.valore !== 2) rifiuta("Serve un 2 in mano");
      if (!puoPescare(s, "diamanti")) rifiuta("Non ci sono diamanti da pescare");
      s.scarti.numeri.push(...g.mano.splice(i, 1));
      g.diamanti.push(pesca(s, "diamanti")!);
      return;
    }
    case "bruciaGratis":
      if (!ha(g, "bruciaGratis")) rifiuta("Serve la Bacchetta magica");
      if (t.bruciaGratisUsata) rifiuta("La Bacchetta magica si usa una volta per turno");
      brucia(s);
      t.bruciaGratisUsata = true;
      return;
    case "fineTurno":
      fineTurno(s, g, m.scarta, m.cambiaMano);
      return;
    case "scartaPersonaggio":
    case "prendiDaFatina":
      rifiuta("Non c'è nessuna scelta in sospeso");
  }

  // Da qui in poi le mosse costano una mossa.
  if (t.mosseRimaste <= 0) rifiuta("Hai finito le mosse");
  t.mosseRimaste -= 1;

  switch (m.tipo) {
    case "prendiNumero": {
      const carta = s.tavolo.numeri[m.posizione];
      if (!carta) rifiuta("Nessuna carta in quella posizione");
      g.mano.push(carta!);
      s.tavolo.numeri[m.posizione] = null;
      break;
    }
    case "prendiPersonaggio": {
      const carta = s.tavolo.personaggi[m.posizione];
      if (!carta) rifiuta("Nessun personaggio in quella posizione");
      s.tavolo.personaggi[m.posizione] = null;
      riceviPersonaggio(s, g, carta!);
      break;
    }
    case "pescaNumero": {
      const carta = pesca(s, "numeri");
      if (!carta) rifiuta("Il mazzo numeri è vuoto");
      g.mano.push(carta!);
      break;
    }
    case "pescaPersonaggio": {
      const carta = pesca(s, "personaggi");
      if (!carta) rifiuta("Il mazzo personaggi è vuoto");
      riceviPersonaggio(s, g, carta!);
      break;
    }
    case "brucia":
      brucia(s);
      break;
    case "attiva":
      attiva(s, id, m);
      break;
  }
  riempiTavolo(s);
}

function riceviPersonaggio(s: StatoPartita, g: StatoGiocatore, carta: CartaPersonaggio): void {
  g.posti.push(carta);
  if (g.posti.length > s.opzioni.postiPersonaggio) s.turno.attesa = { tipo: "scartaPersonaggio", nuovo: carta.id };
}

/** Scarta le carte numero scoperte e ne scopre di nuove. */
function brucia(s: StatoPartita): void {
  const scoperte = s.tavolo.numeri.filter((c) => c !== null);
  if (scoperte.length === 0 && !puoPescare(s, "numeri")) rifiuta("Non ci sono carte numero da bruciare");
  s.scarti.numeri.push(...scoperte);
  s.tavolo.numeri = s.tavolo.numeri.map(() => null);
  riempiTavolo(s);
}

function attiva(s: StatoPartita, id: IdGiocatore, m: Extract<Mossa, { tipo: "attiva" }>): void {
  const g = s.giocatori[id]!;
  const scelta = attivabili(s, id).find((a) => a.carta.id === m.carta);
  if (!scelta) rifiuta("Non puoi attivare questo personaggio");
  const { proprietario, carta } = scelta!;
  const p = personaggio(carta.personaggio);

  const esito = verificaCombinazione(risorseDi(s, id), p.codice, m.combinazione);
  if (!esito.ok) rifiuta(esito.errore);

  // Carte vere usate (elementi e diamanti modificatori): vanno negli scarti, salvo quella tenuta col Gatto.
  const carteUsate = m.combinazione.flatMap((el) => [
    ...(el.tipo === "virtuale" ? [] : [el.id]),
    ...("modifica" in el && el.modifica ? [el.modifica.diamante] : []),
  ]);
  const tieneUnaCarta = p.poteri.some((x) => x.effetto.tipo === "tieniUnaCartaDelCodice");
  if (m.tieni !== undefined && (!tieneUnaCarta || !carteUsate.includes(m.tieni))) {
    rifiuta("Puoi tenere solo una carta del codice, e solo col Gatto con gli stivali");
  }
  for (const idCarta of carteUsate) {
    if (idCarta === m.tieni) continue;
    const iMano = g.mano.findIndex((c) => c.id === idCarta);
    if (iMano >= 0) s.scarti.numeri.push(...g.mano.splice(iMano, 1));
    else s.scarti.diamanti.push(...g.diamanti.splice(g.diamanti.findIndex((d) => d.id === idCarta), 1));
  }
  for (const el of m.combinazione) if (el.tipo === "virtuale") s.turno.virtualiUsate.push(el.fonte);

  // Il personaggio passa negli attivati di chi lo attiva (anche una Lucciola presa a un vicino).
  const posti = s.giocatori[proprietario]!.posti;
  posti.splice(posti.findIndex((c) => c.id === carta.id), 1);
  g.attivati.push(carta);
  g.punti += p.punti;

  // Il Gatto (se attivato con una carta tenuta) l'ha già applicato; gli altri poteri:
  for (const { effetto } of p.poteri) applicaPotere(s, id, effetto, m);
  // Il potere blu Biancaneve/Mago/ecc. vale da subito perché il personaggio è già negli attivati.
  controllaTraguardo(s);
}

function applicaPotere(s: StatoPartita, id: IdGiocatore, e: Effetto, m: Extract<Mossa, { tipo: "attiva" }>): void {
  const g = s.giocatori[id]!;
  switch (e.tipo) {
    case "riceviDiamanti":
      for (let i = 0; i < e.quanti; i++) {
        const d = pesca(s, "diamanti");
        if (d) g.diamanti.push(d);
      }
      return;
    case "mosseExtraOra":
    case "mosseInPiuOgniTurno": // "vale dal turno in cui si attiva"
      s.turno.mosseRimaste += e.mosse;
      return;
    case "mossaExtraAlSuccessivo": {
      const i = s.ordine.indexOf(id);
      s.giocatori[s.ordine[(i + 1) % s.ordine.length]!]!.mosseExtraProssimoTurno += 1;
      return;
    }
    case "scartaPersonaggioAvversario": {
      const possibili = s.ordine.filter((x) => x !== id && s.giocatori[x]!.posti.length > 0);
      if (possibili.length === 0) {
        if (m.bersaglio) rifiuta("Nessun avversario ha personaggi da scartare");
        return;
      }
      if (!m.bersaglio) rifiuta("Scegli il personaggio da scartare a un avversario");
      const { giocatore, carta } = m.bersaglio!;
      if (giocatore === id || !s.ordine.includes(giocatore)) rifiuta("Il bersaglio deve essere un avversario");
      const posti = s.giocatori[giocatore]!.posti;
      const i = posti.findIndex((c) => c.id === carta);
      if (i < 0) rifiuta("Quel personaggio non è nei posti dell'avversario");
      s.scarti.personaggi.push(...posti.splice(i, 1));
      return;
    }
    case "rubaCarta": {
      const avv = m.avversario;
      if (!avv || avv === id || !s.ordine.includes(avv)) rifiuta("Scegli l'avversario di cui guardare la mano");
      if (s.giocatori[avv!]!.mano.length > 0) s.turno.attesa = { tipo: "fatina", avversario: avv! };
      return;
    }
    default:
      // Poteri permanenti (blu): agiscono da soli perché il personaggio è tra gli attivati.
      // Gatto con gli stivali: gestito durante lo scarto delle carte.
      return;
  }
}

function fineTurno(s: StatoPartita, g: StatoGiocatore, scarta: string[], cambiaMano: boolean): void {
  if (s.turno.mosseRimaste > 0 && haMossePossibili(s)) rifiuta("Devi ancora fare tutte le mosse");
  const eccesso = Math.max(0, g.mano.length - limiteMano(s, g));
  if (new Set(scarta).size !== scarta.length) rifiuta("Carta da scartare ripetuta");
  if (scarta.length !== eccesso) rifiuta(`Devi scartare esattamente ${eccesso} carte`);
  for (const idCarta of scarta) {
    const i = g.mano.findIndex((c) => c.id === idCarta);
    if (i < 0) rifiuta("Puoi scartare solo carte che hai in mano");
    s.scarti.numeri.push(...g.mano.splice(i, 1));
  }
  if (cambiaMano) {
    if (!ha(g, "cambiaMano")) rifiuta("Serve lo Scheletro");
    const quante = g.mano.length;
    s.scarti.numeri.push(...g.mano.splice(0));
    for (let i = 0; i < quante; i++) {
      const c = pesca(s, "numeri");
      if (c) g.mano.push(c);
    }
  }
  riempiTavolo(s);

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

/** Quante combinazioni diverse proporre per ogni personaggio attivabile. */
const COMBINAZIONI_PER_PERSONAGGIO = 10;

/**
 * Elenco delle mosse possibili ora per il giocatore.
 * Per le attivazioni propone un numero limitato di combinazioni; `applicaMossa`
 * accetta comunque qualsiasi combinazione valida.
 */
export function mosseValide(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.finita || s.turno.giocatore !== id) return [];
  const g = s.giocatori[id]!;
  const t = s.turno;
  const mosse: Mossa[] = [];

  if (t.attesa?.tipo === "scartaPersonaggio") {
    const nuovo = t.attesa.nuovo;
    return g.posti.filter((c) => c.id !== nuovo).map((c) => ({ tipo: "scartaPersonaggio", carta: c.id }));
  }
  if (t.attesa?.tipo === "fatina") {
    return s.giocatori[t.attesa.avversario]!.mano.map((c) => ({ tipo: "prendiDaFatina", carta: c.id }));
  }

  // Azioni gratuite
  if (!t.iniziato && ha(g, "scambiaConTavolo")) {
    for (const c of g.posti)
      s.tavolo.personaggi.forEach((p, posizione) => p && mosse.push({ tipo: "scambiaConTavolo", carta: c.id, posizione }));
  }
  const fulmine = g.diamanti.find((d) => d.tipo === "fulmine");
  if (fulmine) mosse.push({ tipo: "giocaFulmine", diamante: fulmine.id });
  const due = g.mano.find((c) => c.valore === 2);
  if (due && ha(g, "dueInDiamante") && puoPescare(s, "diamanti")) mosse.push({ tipo: "dueInDiamante", carta: due.id });
  const tavoloNumeriPieno = s.tavolo.numeri.some((c) => c !== null) || puoPescare(s, "numeri");
  if (ha(g, "bruciaGratis") && !t.bruciaGratisUsata && tavoloNumeriPieno) mosse.push({ tipo: "bruciaGratis" });

  // Mosse che costano
  if (t.mosseRimaste > 0) {
    s.tavolo.numeri.forEach((c, posizione) => c && mosse.push({ tipo: "prendiNumero", posizione }));
    s.tavolo.personaggi.forEach((c, posizione) => c && mosse.push({ tipo: "prendiPersonaggio", posizione }));
    if (puoPescare(s, "numeri")) mosse.push({ tipo: "pescaNumero" });
    if (puoPescare(s, "personaggi")) mosse.push({ tipo: "pescaPersonaggio" });
    if (tavoloNumeriPieno) mosse.push({ tipo: "brucia" });
    mosse.push(...mosseDiAttivazione(s, id));
  }

  if (t.mosseRimaste === 0 || !haMossePossibili(s)) mosse.push(...mosseDiFineTurno(s, g));
  return mosse;
}

function mosseDiAttivazione(s: StatoPartita, id: IdGiocatore): Mossa[] {
  const risorse = risorseDi(s, id);
  const mosse: Mossa[] = [];
  for (const { carta } of attivabili(s, id)) {
    const p = personaggio(carta.personaggio);
    const combinazioni = trovaCombinazioni(risorse, p.codice, COMBINAZIONI_PER_PERSONAGGIO);
    const effetti = p.poteri.map((x) => x.effetto.tipo);
    for (const [n, combinazione] of combinazioni.entries()) {
      const base = { tipo: "attiva" as const, carta: carta.id, combinazione };
      if (effetti.includes("tieniUnaCartaDelCodice")) {
        mosse.push({ ...base, tieni: primaCartaVera(combinazione) });
      } else if (effetti.includes("scartaPersonaggioAvversario")) {
        const bersagli = s.ordine
          .filter((x) => x !== id)
          .flatMap((giocatore) => s.giocatori[giocatore]!.posti.map((c) => ({ giocatore, carta: c.id })));
        if (bersagli.length === 0) mosse.push(base);
        else if (n === 0) for (const bersaglio of bersagli) mosse.push({ ...base, bersaglio });
        else mosse.push({ ...base, bersaglio: bersagli[0]! });
      } else if (effetti.includes("rubaCarta")) {
        const avversari = s.ordine.filter((x) => x !== id);
        if (n === 0) for (const avversario of avversari) mosse.push({ ...base, avversario });
        else mosse.push({ ...base, avversario: avversari[0]! });
      } else {
        mosse.push(base);
      }
    }
  }
  return mosse;
}

function primaCartaVera(c: Combinazione): string | undefined {
  for (const el of c) if (el.tipo !== "virtuale") return el.id;
  return undefined;
}

function mosseDiFineTurno(s: StatoPartita, g: StatoGiocatore): Mossa[] {
  const eccesso = Math.max(0, g.mano.length - limiteMano(s, g));
  const scelte = sottoinsiemi(g.mano.map((c) => c.id), eccesso, 10);
  const cambi = ha(g, "cambiaMano") ? [false, true] : [false];
  return scelte.flatMap((scarta) => cambi.map((cambiaMano): Mossa => ({ tipo: "fineTurno", scarta, cambiaMano })));
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

/* ------------------------------------------------------------------ */
/* Fine partita                                                        */
/* ------------------------------------------------------------------ */

export function finePartita(s: StatoPartita): EsitoPartita | null {
  if (!s.finita) return null;
  const punti = Object.fromEntries(s.ordine.map((id) => [id, s.giocatori[id]!.punti]));
  const massimo = Math.max(...Object.values(punti));
  return { vincitori: s.ordine.filter((id) => punti[id] === massimo), punti };
}
