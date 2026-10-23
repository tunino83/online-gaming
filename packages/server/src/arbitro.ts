/**
 * Nucleo dell'arbitro: riceve le richieste dei browser e decide.
 * Non sa nulla di Supabase: legge e scrive tramite un `Archivio` (vedi archivio-*.ts),
 * così si può provare con un archivio in memoria.
 */
import { AVATAR, AVATAR_PREDEFINITO, type Gioco, type IdGiocatore, avatarValido } from "@og/engine";
import { primoGioco } from "@og/primo-gioco";
import { giocoUfficio } from "@og/ufficio";

// biome-ignore lint: ogni gioco ha i suoi tipi di stato, mossa, opzioni e vista
type QualsiasiGioco = Gioco<any, any, any, any>;

/** Giochi disponibili sulla piattaforma. */
export const GIOCHI: Record<string, QualsiasiGioco> = { "primo-gioco": primoGioco, ufficio: giocoUfficio };

/* ------------------------------------------------------------------ */
/* Archivio (database)                                                 */
/* ------------------------------------------------------------------ */

export type CodiceErroreArchivio =
  | "CODICE_DUPLICATO"
  | "CODICE_NON_VALIDO"
  | "PARTITA_INIZIATA"
  | "PARTITA_PIENA"
  | "AVATAR_PRESO"
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
  giocatori: { utenteId: string; nickname: string; avatar: string; bot: boolean }[];
}

export interface PartitaAperta {
  codice: string;
  gioco: string;
  creatore: string;
  avatar: string;
  giocatori: number;
  maxGiocatori: number;
  creataIl: string;
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
    avatar: string;
    /** Compare nella lista delle partite aperte della pagina iniziale. */
    pubblica: boolean;
  }): Promise<string>;
  /** Partite in attesa, pubbliche, non piene e create da poco (le più recenti prima). */
  elencaAperte(): Promise<PartitaAperta[]>;
  /** Errori CODICE_NON_VALIDO, PARTITA_INIZIATA, PARTITA_PIENA, AVATAR_PRESO. Se si è già dentro, va bene. */
  unisciti(p: { codice: string; utente: string; nickname: string; avatar: string }): Promise<string>;
  /** Entra come spettatore (anche a partita iniziata). Errore CODICE_NON_VALIDO. Chi gioca resta giocatore. */
  guarda(p: { codice: string; utente: string }): Promise<string>;
  leggiPartita(id: string): Promise<InfoPartita | null>;
  /** Id dell'utente del robot fisso numero 1-4 (lo crea la prima volta, poi lo riusa sempre). */
  utenteBot(numero: number): Promise<string>;
  /** Aggiunge un giocatore del computer a una partita in attesa. */
  aggiungiBot(p: { partitaId: string; utente: string; nickname: string; avatar: string }): Promise<void>;
  /**
   * Stato salvato, con il momento del salvataggio (millisecondi) e, se l'ultima mossa l'ha fatta
   * il computer al posto di una persona ferma, l'id di quella persona.
   */
  leggiStato(id: string): Promise<{ stato: unknown; versione: number; aggiornatoIl: number; alPostoDi: string | null } | null>;
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
    /** Vista per spettatori e schermo "tavolo" (solo informazioni pubbliche); null se il gioco non la prevede. */
    vistaPubblica: unknown | null;
    utente: string;
    mossa: unknown | null;
    statoPartita: "in_corso" | "finita";
    esito: unknown | null;
    /** La mossa l'ha fatta il computer al posto di questa persona (azione alPosto); null = no. */
    alPostoDi: string | null;
  }): Promise<number>;
  /** Salva un messaggio vocale (file audio + avviso per gli altri giocatori); restituisce il suo id. */
  salvaVocale(p: { partitaId: string; utente: string; dati: Uint8Array; tipo: TipoAudio; durataMs: number }): Promise<string>;
}

/** Formati audio accettati per i vocali (quelli che registrano i browser). */
export const TIPI_AUDIO = ["audio/mp4", "audio/webm", "audio/ogg", "audio/mpeg", "audio/aac"] as const;
export type TipoAudio = (typeof TIPI_AUDIO)[number];
/** Limiti dei vocali: durata massima (con un po' di margine sui 20 secondi) e dimensione del file. */
export const VOCALE_MAX_MS = 21000;
export const VOCALE_MAX_BYTE = 400_000;

/* ------------------------------------------------------------------ */
/* Richieste e risposte                                                */
/* ------------------------------------------------------------------ */

export type Risposta = { ok: true; [k: string]: unknown } | { ok: false; errore: string };

export interface Ambiente {
  /** Numero casuale in [0, 1): per codici d'invito e seed delle partite. */
  casuale(): number;
  /** Ora attuale in millisecondi (facoltativa: di base l'orologio vero). */
  ora?(): number;
}

/** Dopo quanto tempo fermo il computer gioca al posto di una persona, e poi ogni quanto muove. */
export const ATTESA_PRIMA_DEL_SOSTITUTO_MS = 60_000;
export const PAUSA_SOSTITUTO_MS = 10_000;

const ALFABETO_CODICE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // senza 0/O, 1/I
const LUNGHEZZA_CODICE = 5;
const MESSAGGI: Record<CodiceErroreArchivio, string> = {
  CODICE_DUPLICATO: "Riprova",
  CODICE_NON_VALIDO: "Codice d'invito non valido",
  PARTITA_INIZIATA: "La partita è già iniziata: il link non è più valido",
  PARTITA_PIENA: "La partita è piena",
  AVATAR_PRESO: "Questo avatar ce l'ha già un altro giocatore: scegline un altro",
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

/** Avatar scelto (facoltativo: senza, si usa quello predefinito). null se non valido. */
function avatarScelto(x: unknown): string | null {
  if (x === undefined) return AVATAR_PREDEFINITO;
  return avatarValido(x) ? x : null;
}

/** Gestisce una richiesta di un utente già autenticato. */
export async function gestisci(richiesta: unknown, utente: IdGiocatore, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  if (!isOggetto(richiesta)) return errore("Richiesta non valida");
  try {
    switch (richiesta.azione) {
      case "crea":
        return await crea(richiesta, utente, archivio, amb);
      case "unisciti":
        return await unisciti(richiesta, utente, archivio);
      case "guarda":
        return await guarda(richiesta, utente, archivio);
      case "aperte":
        return { ok: true, partite: await archivio.elencaAperte() };
      case "avvia":
        return await avvia(richiesta, utente, archivio, amb);
      case "controComputer":
        return await controComputer(richiesta, utente, archivio, amb);
      case "mossa":
        return await mossa(richiesta, utente, archivio, amb);
      case "turnoComputer":
        return await turnoComputer(richiesta, utente, archivio, amb);
      case "alPosto":
        return await alPosto(richiesta, utente, archivio, amb);
      case "vocale":
        return await vocale(richiesta, utente, archivio);
      default:
        return errore("Azione sconosciuta");
    }
  } catch (e) {
    if (e instanceof ErroreArchivio) return errore(MESSAGGI[e.codice]);
    throw e;
  }
}

/** Partita di prova contro il computer: si crea, si aggiungono i bot e parte subito. */
async function controComputer(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  const quanti = r.bot ?? 1;
  if (!Number.isInteger(quanti) || (quanti as number) < 1 || (quanti as number) > 4) return errore("Si gioca contro 1-4 giocatori del computer");
  const creata = await crea({ ...r, maxGiocatori: (quanti as number) + 1, pubblica: false }, utente, archivio, amb);
  if (!creata.ok) return creata;
  const partitaId = creata.partitaId as string;
  for (let i = 1; i <= (quanti as number); i++) {
    const bot = await archivio.utenteBot(i);
    await archivio.aggiungiBot({ partitaId, utente: bot, nickname: `Computer ${i}`, avatar: "robot" });
  }
  const avviata = await avvia({ partitaId }, utente, archivio, amb);
  return avviata.ok ? { ok: true, partitaId } : avviata;
}

/** Converte il testo base64 in byte; null se non è base64 valido. */
function daBase64(testo: string): Uint8Array | null {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(testo) || testo.length % 4 !== 0) return null;
  try {
    return Uint8Array.from(atob(testo), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/**
 * Messaggio vocale per gli altri giocatori della partita.
 * Richiesta: { partitaId, audio (base64), tipo (es. "audio/webm;codecs=opus"), durataMs }.
 */
async function vocale(r: Record<string, unknown>, utente: string, archivio: Archivio): Promise<Risposta> {
  if (!idValido(r.partitaId)) return errore("Partita non trovata");
  const p = await archivio.leggiPartita(r.partitaId);
  if (!p || !p.giocatori.some((x) => x.utenteId === utente && !x.bot)) return errore("Partita non trovata");
  if (p.stato === "finita") return errore("La partita è finita");
  const tipo = typeof r.tipo === "string" ? r.tipo.split(";")[0]!.trim().toLowerCase() : "";
  if (!(TIPI_AUDIO as readonly string[]).includes(tipo)) return errore("Formato audio non supportato");
  const durata = r.durataMs;
  if (typeof durata !== "number" || !Number.isFinite(durata) || durata < 200 || durata > VOCALE_MAX_MS) {
    return errore("Il vocale deve durare da mezzo secondo a 20 secondi");
  }
  if (typeof r.audio !== "string" || r.audio.length > Math.ceil(VOCALE_MAX_BYTE / 3) * 4) return errore("Vocale troppo grande");
  const dati = daBase64(r.audio);
  if (!dati || dati.length === 0) return errore("Vocale non valido");
  if (dati.length > VOCALE_MAX_BYTE) return errore("Vocale troppo grande");
  const id = await archivio.salvaVocale({ partitaId: p.id, utente, dati, tipo: tipo as TipoAudio, durataMs: Math.round(durata) });
  return { ok: true, id };
}

/**
 * Una sola mossa del giocatore del computer di turno (più le mosse automatiche che seguono).
 * La chiede il browser di una persona della partita, qualche secondo dopo l'ultima mossa:
 * così i robot giocano una mossa alla volta e chi guarda le vede succedere.
 */
async function turnoComputer(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  if (!idValido(r.partitaId)) return errore("Partita non trovata");
  const p = await archivio.leggiPartita(r.partitaId);
  if (!p || !p.giocatori.some((x) => x.utenteId === utente && !x.bot)) return errore("Partita non trovata");
  if (p.stato !== "in_corso") return errore("La partita non è in corso");
  const g = GIOCHI[p.gioco];
  const salvato = await archivio.leggiStato(p.id);
  if (!g || !salvato || !g.mossaBot) return errore("Partita non trovata");

  const prima = applicaAutomatiche(g, salvato.stato);
  const chi = g.diTurno?.(prima);
  if (!chi || !p.giocatori.some((x) => x.utenteId === chi && x.bot)) return errore("Non tocca al computer");
  const mossaBot = g.mossaBot(prima, chi, amb.casuale);
  const risultato = g.applicaMossa(prima, chi, mossaBot);
  if (!risultato.ok) return errore(risultato.errore);
  return await salvaDopo(g, p, salvato.versione, applicaAutomatiche(g, risultato.stato), chi, mossaBot, archivio);
}

/**
 * Il computer gioca al posto di una persona ferma: se tocca a lei da 60 secondi senza che abbia mosso,
 * fa una mossa per lei; poi una ogni 10 secondi finché la persona non torna a muovere da sola
 * (a ogni suo nuovo turno si ricomincia dai 60 secondi). Lo chiede il browser di chiunque giochi.
 * Se è ancora presto risponde { fatto: false, attendiMs } con quanto manca; alPosto dice se il computer
 * sta già giocando per quella persona.
 */
async function alPosto(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  if (!idValido(r.partitaId)) return errore("Partita non trovata");
  const p = await archivio.leggiPartita(r.partitaId);
  if (!p || !p.giocatori.some((x) => x.utenteId === utente && !x.bot)) return errore("Partita non trovata");
  if (p.stato !== "in_corso") return errore("La partita non è in corso");
  const g = GIOCHI[p.gioco];
  const salvato = await archivio.leggiStato(p.id);
  if (!g || !salvato || !g.mossaSostituto) return errore("Partita non trovata");

  const prima = applicaAutomatiche(g, salvato.stato);
  const chi = g.diTurno?.(prima);
  if (!chi || !p.giocatori.some((x) => x.utenteId === chi && !x.bot)) return errore("Non tocca a una persona");
  const attesa = salvato.alPostoDi === chi ? PAUSA_SOSTITUTO_MS : ATTESA_PRIMA_DEL_SOSTITUTO_MS;
  const trascorsi = (amb.ora?.() ?? Date.now()) - salvato.aggiornatoIl;
  // alPosto: il computer sta già giocando per questa persona (il browser lo mostra)
  if (trascorsi < attesa) return { ok: true, fatto: false, attendiMs: attesa - trascorsi, alPosto: salvato.alPostoDi === chi };

  const scelta = g.mossaSostituto(prima, chi, amb.casuale);
  const risultato = g.applicaMossa(prima, chi, scelta);
  if (!risultato.ok) return errore(risultato.errore);
  const salvata = await salvaDopo(g, p, salvato.versione, applicaAutomatiche(g, risultato.stato), chi, scelta, archivio, chi);
  return salvata.ok ? { ...salvata, fatto: true, attendiMs: PAUSA_SOSTITUTO_MS, alPosto: true } : salvata;
}

/** Salva il nuovo stato con le viste di tutti; chiude la partita se è finita. */
async function salvaDopo(
  g: QualsiasiGioco,
  p: InfoPartita,
  versione: number,
  nuovo: unknown,
  chi: string,
  mossaFatta: unknown,
  archivio: Archivio,
  alPostoDi: string | null = null,
): Promise<Risposta> {
  const esito = g.finePartita(nuovo);
  await archivio.salva({
    partitaId: p.id,
    versioneAttesa: versione,
    stato: nuovo,
    viste: calcolaViste(g, nuovo, p.giocatori.map((x) => x.utenteId)),
    vistaPubblica: g.vistaPubblica?.(nuovo) ?? null,
    utente: chi,
    mossa: mossaFatta,
    statoPartita: esito ? "finita" : "in_corso",
    esito,
    alPostoDi,
  });
  return { ok: true, ...(esito ? { esito } : {}) };
}

/** Mosse senza scelta (es. chiudere il turno quando non resta altro da fare): le fa il server. */
function applicaAutomatiche(g: QualsiasiGioco, stato: unknown): unknown {
  let s = stato;
  for (let i = 0; i < 10; i++) {
    const automatica = g.mossaAutomatica?.(s);
    if (!automatica) break;
    const r = g.applicaMossa(s, automatica.giocatore, automatica.mossa);
    if (!r.ok) break;
    s = r.stato;
  }
  return s;
}

async function crea(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
  const nickname = nicknameValido(r.nickname);
  if (!nickname) return errore("Scegli un nickname da 1 a 24 caratteri");
  const avatar = avatarScelto(r.avatar);
  if (!avatar) return errore("Avatar non valido");
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

  if (r.pubblica !== undefined && typeof r.pubblica !== "boolean") return errore("Richiesta non valida");
  const pubblica = r.pubblica !== false;

  for (let tentativo = 0; tentativo < 5; tentativo++) {
    const codice = Array.from({ length: LUNGHEZZA_CODICE }, () => ALFABETO_CODICE[Math.floor(amb.casuale() * ALFABETO_CODICE.length)]).join("");
    try {
      const partitaId = await archivio.creaPartita({ creatore: utente, nickname, codice, gioco, opzioni, maxGiocatori: max as number, avatar, pubblica });
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
  const avatar = avatarScelto(r.avatar);
  if (!avatar) return errore("Avatar non valido");
  if (typeof r.codice !== "string") return errore("Codice d'invito non valido");
  const codice = r.codice.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,8}$/.test(codice)) return errore("Codice d'invito non valido");
  if (r.avatar !== undefined) {
    // avatar scelto: se ce l'ha già un altro giocatore, errore (se ne sceglie un altro)
    const partitaId = await archivio.unisciti({ codice, utente, nickname, avatar });
    return { ok: true, partitaId };
  }
  // nessuna scelta: il predefinito, oppure il primo classico libero
  const candidati = [AVATAR_PREDEFINITO, ...AVATAR.map((a) => a.id).filter((id) => id !== AVATAR_PREDEFINITO && id !== "robot")];
  for (const id of candidati) {
    try {
      const partitaId = await archivio.unisciti({ codice, utente, nickname, avatar: id });
      return { ok: true, partitaId };
    } catch (e) {
      if (!(e instanceof ErroreArchivio && e.codice === "AVATAR_PRESO")) throw e;
    }
  }
  return errore(MESSAGGI.AVATAR_PRESO);
}

/** Entra come spettatore con il codice d'invito: vale anche a partita iniziata o finita. */
async function guarda(r: Record<string, unknown>, utente: string, archivio: Archivio): Promise<Risposta> {
  if (typeof r.codice !== "string") return errore("Codice d'invito non valido");
  const codice = r.codice.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,8}$/.test(codice)) return errore("Codice d'invito non valido");
  const partitaId = await archivio.guarda({ codice, utente });
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
  // Se tocca prima a un giocatore del computer, sarà il browser a chiedergli di muovere (turnoComputer)
  const stato = applicaAutomatiche(g, g.setup(ids, p.opzioni, seed));
  await archivio.salva({
    partitaId: p.id,
    versioneAttesa: null,
    stato,
    viste: calcolaViste(g, stato, ids),
    vistaPubblica: g.vistaPubblica?.(stato) ?? null,
    utente,
    mossa: null,
    statoPartita: "in_corso",
    esito: null,
    alPostoDi: null,
  });
  return { ok: true };
}

async function mossa(r: Record<string, unknown>, utente: string, archivio: Archivio, amb: Ambiente): Promise<Risposta> {
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

  // Mosse automatiche; i giocatori del computer muovono dopo, una mossa alla volta (turnoComputer)
  return await salvaDopo(g, p, salvato.versione, applicaAutomatiche(g, risultato.stato), utente, r.mossa, archivio);
}
