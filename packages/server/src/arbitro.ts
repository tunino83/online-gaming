/**
 * Nucleo dell'arbitro: riceve le richieste dei browser e decide.
 * Non sa nulla di Supabase: legge e scrive tramite un `Archivio` (vedi archivio-*.ts),
 * così si può provare con un archivio in memoria.
 */
import type { Gioco, IdGiocatore } from "@og/engine";
import { primoGioco } from "@og/primo-gioco";

// biome-ignore lint: ogni gioco ha i suoi tipi di stato, mossa, opzioni e vista
type QualsiasiGioco = Gioco<any, any, any, any>;

/** Giochi disponibili sulla piattaforma. */
export const GIOCHI: Record<string, QualsiasiGioco> = { "primo-gioco": primoGioco };

/* ------------------------------------------------------------------ */
/* Archivio (database)                                                 */
/* ------------------------------------------------------------------ */

export type CodiceErroreArchivio =
  | "CODICE_DUPLICATO"
  | "CODICE_NON_VALIDO"
  | "PARTITA_INIZIATA"
  | "PARTITA_PIENA"
  | "PARTITA_GIA_AVVIATA"
  | "CONFLITTO";

export class ErroreArchivio extends Error {
  constructor(readonly codice: CodiceErroreArchivio) {
    super(codice);
  }
}

export interface InfoPartita {
  id: string;
  codice: string;
  gioco: string;
  stato: "attesa" | "in_corso" | "finita";
  creatore: string;
  opzioni: Record<string, unknown>;
  maxGiocatori: number;
  /** In ordine di arrivo. */
  giocatori: { utenteId: string; nickname: string }[];
}

export interface VistaDaSalvare {
  utente_id: string;
  vista: unknown;
  mosse_valide: unknown[];
}

export interface Archivio {
  /** Errore CODICE_DUPLICATO se il codice d'invito esiste già. */
  creaPartita(p: {
    creatore: string;
    nickname: string;
    codice: string;
    gioco: string;
    opzioni: Record<string, unknown>;
    maxGiocatori: number;
  }): Promise<string>;
  /** Errori CODICE_NON_VALIDO, PARTITA_INIZIATA, PARTITA_PIENA. Se si è già dentro, va bene. */
  unisciti(p: { codice: string; utente: string; nickname: string }): Promise<string>;
  leggiPartita(id: string): Promise<InfoPartita | null>;
  leggiStato(id: string): Promise<{ stato: unknown; versione: number } | null>;
  /**
   * Salva tutto insieme (stato, viste, mossa, stato della partita).
   * `versioneAttesa` null = avvio (errore PARTITA_GIA_AVVIATA se già avviata);
   * altrimenti errore CONFLITTO se nel frattempo qualcun altro ha salvato.
   */
  salva(p: {
    partitaId: string;
    versioneAttesa: number | null;
    stato: unknown;
    viste: VistaDaSalvare[];
    utente: string;
    mossa: unknown | null;
    statoPartita: "in_corso" | "finita";
    esito: unknown | null;
  }): Promise<number>;
}

/* ------------------------------------------------------------------ */
/* Richieste e risposte                                                */
/* ------------------------------------------------------------------ */

export type Risposta = { ok: true; [k: string]: unknown } | { ok: false; errore: string };

export interface Ambiente {
  /** Numero casuale in [0, 1): per codici d'invito e seed delle partite. */
  casuale(): number;
}

const ALFABETO_CODICE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // senza 0/O, 1/I
const LUNGHEZZA_CODICE = 5;
const MESSAGGI: Record<CodiceErroreArchivio, string> = {
  CODICE_DUPLICATO: "Riprova",
  CODICE_NON_VALIDO: "Codice d'invito non valido",
  PARTITA_INIZIATA: "La partita è già iniziata: il link non è più valido",
  PARTITA_PIENA: "La partita è piena",
  PARTITA_GIA_AVVIATA: "La partita è già stata avviata",
  CONFLITTO: "La partita è cambiata nel frattempo: riprova",
};

const errore = (testo: string): Risposta => ({ ok: false, errore: testo });
const isOggetto = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

function nicknameValido(x: unknown): string | null {
  if (typeof x !== "string") return null;
  const n = x.trim().replace(/\s+/g, " ");
  return n.length >= 1 && n.length <= 24 ? n : null;
}

const idValido = (x: unknown): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x);

/** Gestisce una richiesta di un utente già autenticato. */
export async function gestisci(richiesta: unknown, utente: IdGiocatore, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  if (!isOggetto(richiesta)) return errore("Richiesta non valida");
  try {
    switch (richiesta.azione) {
      case "crea":
        return await crea(richiesta, utente, archivio, amb);
      case "unisciti":
        return await unisciti(richiesta, utente, archivio);
      case "avvia":
        return await avvia(richiesta, utente, archivio, amb);
      case "mossa":
        return await mossa(richiesta, utente, archivio);
      default:
        return errore("Azione sconosciuta");
    }
  } catch (e) {
    if (e instanceof ErroreArchivio) return errore(MESSAGGI[e.codice]);
    throw e;
  }
}

async function crea(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  const nickname = nicknameValido(r.nickname);
  if (!nickname) return errore("Scegli un nickname da 1 a 24 caratteri");
  const gioco = r.gioco ?? "primo-gioco";
  if (typeof gioco !== "string" || !GIOCHI[gioco]) return errore("Gioco sconosciuto");
  const g = GIOCHI[gioco]!;
  const max = r.maxGiocatori ?? g.maxGiocatori;
  if (!Number.isInteger(max) || (max as number) < g.minGiocatori || (max as number) > g.maxGiocatori) {
    return errore(`Il numero di giocatori va da ${g.minGiocatori} a ${g.maxGiocatori}`);
  }
  const opzioni: Record<string, unknown> = {};
  if (r.opzioni !== undefined) {
    if (!isOggetto(r.opzioni) || Object.keys(r.opzioni).some((k) => k !== "puntiPerVincere")) return errore("Opzioni non valide");
    const p = r.opzioni.puntiPerVincere;
    if (p !== undefined) {
      if (!Number.isInteger(p) || (p as number) < 5 || (p as number) > 50) return errore("I punti per vincere vanno da 5 a 50");
      opzioni.puntiPerVincere = p;
    }
  }

  for (let tentativo = 0; tentativo < 5; tentativo++) {
    const codice = Array.from({ length: LUNGHEZZA_CODICE }, () => ALFABETO_CODICE[Math.floor(amb.casuale() * ALFABETO_CODICE.length)]).join("");
    try {
      const partitaId = await archivio.creaPartita({ creatore: utente, nickname, codice, gioco, opzioni, maxGiocatori: max as number });
      return { ok: true, partitaId, codice };
    } catch (e) {
      if (!(e instanceof ErroreArchivio && e.codice === "CODICE_DUPLICATO")) throw e;
    }
  }
  return errore("Non riesco a creare la partita, riprova");
}

async function unisciti(r: Record<string, unknown>, utente: string, archivio: Archivio): Promise<Risposta> {
  const nickname = nicknameValido(r.nickname);
  if (!nickname) return errore("Scegli un nickname da 1 a 24 caratteri");
  if (typeof r.codice !== "string") return errore("Codice d'invito non valido");
  const codice = r.codice.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,8}$/.test(codice)) return errore("Codice d'invito non valido");
  const partitaId = await archivio.unisciti({ codice, utente, nickname });
  return { ok: true, partitaId };
}

/** Viste e mosse possibili di tutti i giocatori, da salvare dopo ogni cambiamento. */
function calcolaViste(g: QualsiasiGioco, stato: unknown, giocatori: string[]): VistaDaSalvare[] {
  return giocatori.map((id) => ({ utente_id: id, vista: g.vistaGiocatore(stato, id), mosse_valide: g.mosseValide(stato, id) }));
}

async function avvia(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  if (!idValido(r.partitaId)) return errore("Partita non trovata");
  const p = await archivio.leggiPartita(r.partitaId);
  if (!p || !p.giocatori.some((x) => x.utenteId === utente)) return errore("Partita non trovata");
  if (p.creatore !== utente) return errore("Solo chi ha creato la partita può avviarla");
  if (p.stato !== "attesa") return errore(MESSAGGI.PARTITA_GIA_AVVIATA);
  const g = GIOCHI[p.gioco];
  if (!g) return errore("Gioco sconosciuto");
  if (p.giocatori.length < g.minGiocatori) return errore(`Servono almeno ${g.minGiocatori} giocatori`);

  const ids = p.giocatori.map((x) => x.utenteId);
  const seed = Math.floor(amb.casuale() * 2 ** 32);
  const stato = g.setup(ids, p.opzioni, seed);
  await archivio.salva({
    partitaId: p.id,
    versioneAttesa: null,
    stato,
    viste: calcolaViste(g, stato, ids),
    utente,
    mossa: null,
    statoPartita: "in_corso",
    esito: null,
  });
  return { ok: true };
}

async function mossa(r: Record<string, unknown>, utente: string, archivio: Archivio): Promise<Risposta> {
  if (!idValido(r.partitaId)) return errore("Partita non trovata");
  const p = await archivio.leggiPartita(r.partitaId);
  if (!p || !p.giocatori.some((x) => x.utenteId === utente)) return errore("Partita non trovata");
  if (p.stato === "attesa") return errore("La partita non è ancora iniziata");
  if (p.stato === "finita") return errore("La partita è finita");
  const g = GIOCHI[p.gioco];
  const salvato = await archivio.leggiStato(p.id);
  if (!g || !salvato) return errore("Partita non trovata");

  let risultato;
  try {
    risultato = g.applicaMossa(salvato.stato, utente, r.mossa);
  } catch {
    return errore("Mossa non valida");
  }
  if (!risultato.ok) return errore(risultato.errore);

  // Mosse senza scelta (es. chiudere il turno quando non resta altro da fare): le fa il server.
  let nuovo = risultato.stato;
  for (let i = 0; i < 10; i++) {
    const automatica = g.mossaAutomatica?.(nuovo);
    if (!automatica) break;
    const r = g.applicaMossa(nuovo, automatica.giocatore, automatica.mossa);
    if (!r.ok) break;
    nuovo = r.stato;
  }
  const esito = g.finePartita(nuovo);
  const ids = p.giocatori.map((x) => x.utenteId);
  await archivio.salva({
    partitaId: p.id,
    versioneAttesa: salvato.versione,
    stato: nuovo,
    viste: calcolaViste(g, nuovo, ids),
    utente,
    mossa: r.mossa,
    statoPartita: esito ? "finita" : "in_corso",
    esito,
  });
  return { ok: true, ...(esito ? { esito } : {}) };
}
