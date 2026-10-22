/**
 * Archivio in memoria: si comporta come il database (stesse regole ed errori)
 * ma vive nel programma. Serve per i test dell'arbitro.
 */
import { type Archivio, ErroreArchivio, type InfoPartita } from "./arbitro";

export interface DatiMemoria {
  partite: Map<string, InfoPartita & { esito: unknown; pubblica: boolean; creataIl: string }>;
  stati: Map<string, { stato: unknown; versione: number }>;
  viste: Map<string, { vista: unknown; mosse_valide: unknown[]; versione: number }>;
  mosse: { partitaId: string; numero: number; utente: string; mossa: unknown }[];
  vocali: { id: string; partitaId: string; utente: string; byte: number; tipo: string; durataMs: number }[];
  spettatori: Map<string, Set<string>>;
  vistePubbliche: Map<string, { vista: unknown; versione: number }>;
}

export function creaArchivioMemoria(): Archivio & { dati: DatiMemoria } {
  const dati: DatiMemoria = { partite: new Map(), stati: new Map(), viste: new Map(), mosse: [], vocali: [], spettatori: new Map(), vistePubbliche: new Map() };
  let contatore = 0;
  const copia = <T>(x: T): T => structuredClone(x);

  return {
    dati,
    async creaPartita(p) {
      if ([...dati.partite.values()].some((x) => x.codice === p.codice)) throw new ErroreArchivio("CODICE_DUPLICATO");
      const id = `00000000-0000-4000-8000-${String(++contatore).padStart(12, "0")}`;
      dati.partite.set(id, {
        id,
        codice: p.codice,
        gioco: p.gioco,
        stato: "attesa",
        creatore: p.creatore,
        opzioni: copia(p.opzioni),
        maxGiocatori: p.maxGiocatori,
        giocatori: [{ utenteId: p.creatore, nickname: p.nickname, avatar: p.avatar, bot: false }],
        esito: null,
        pubblica: p.pubblica,
        creataIl: new Date(Date.now() + contatore).toISOString(),
      });
      return id;
    },
    async unisciti(p) {
      const partita = [...dati.partite.values()].find((x) => x.codice === p.codice);
      if (!partita) throw new ErroreArchivio("CODICE_NON_VALIDO");
      if (partita.giocatori.some((g) => g.utenteId === p.utente)) return partita.id;
      if (partita.stato !== "attesa") throw new ErroreArchivio("PARTITA_INIZIATA");
      if (partita.giocatori.length >= partita.maxGiocatori) throw new ErroreArchivio("PARTITA_PIENA");
      if (partita.giocatori.some((g) => g.avatar === p.avatar)) throw new ErroreArchivio("AVATAR_PRESO");
      partita.giocatori.push({ utenteId: p.utente, nickname: p.nickname, avatar: p.avatar, bot: false });
      return partita.id;
    },
    async elencaAperte() {
      const limite = Date.now() - 3 * 60 * 60 * 1000;
      return [...dati.partite.values()]
        .filter((x) => x.stato === "attesa" && x.pubblica && x.giocatori.length < x.maxGiocatori && Date.parse(x.creataIl) > limite)
        .sort((a, b) => b.creataIl.localeCompare(a.creataIl))
        .slice(0, 20)
        .map((x) => {
          const c = x.giocatori.find((g) => g.utenteId === x.creatore) ?? x.giocatori[0]!;
          return { codice: x.codice, gioco: x.gioco, creatore: c.nickname, avatar: c.avatar, giocatori: x.giocatori.length, maxGiocatori: x.maxGiocatori, creataIl: x.creataIl };
        });
    },
    async guarda(p) {
      const partita = [...dati.partite.values()].find((x) => x.codice === p.codice);
      if (!partita) throw new ErroreArchivio("CODICE_NON_VALIDO");
      if (!partita.giocatori.some((g) => g.utenteId === p.utente)) {
        const insieme = dati.spettatori.get(partita.id) ?? new Set<string>();
        insieme.add(p.utente);
        dati.spettatori.set(partita.id, insieme);
      }
      return partita.id;
    },
    async utenteBot(numero) {
      return `bot-${numero}`;
    },
    async aggiungiBot(p) {
      const partita = dati.partite.get(p.partitaId);
      if (!partita || partita.stato !== "attesa") throw new ErroreArchivio("PARTITA_INIZIATA");
      partita.giocatori.push({ utenteId: p.utente, nickname: p.nickname, avatar: p.avatar, bot: true });
    },
    async leggiPartita(id) {
      const p = dati.partite.get(id);
      return p ? copia(p) : null;
    },
    async leggiStato(id) {
      const s = dati.stati.get(id);
      return s ? copia(s) : null;
    },
    async salvaVocale(p) {
      const id = `vocale-${dati.vocali.length + 1}`;
      dati.vocali.push({ id, partitaId: p.partitaId, utente: p.utente, byte: p.dati.length, tipo: p.tipo, durataMs: p.durataMs });
      return id;
    },
    async salva(p) {
      const partita = dati.partite.get(p.partitaId)!;
      let versione: number;
      if (p.versioneAttesa === null) {
        if (partita.stato !== "attesa" || dati.stati.has(p.partitaId)) throw new ErroreArchivio("PARTITA_GIA_AVVIATA");
        versione = 0;
      } else {
        const attuale = dati.stati.get(p.partitaId);
        if (!attuale || attuale.versione !== p.versioneAttesa) throw new ErroreArchivio("CONFLITTO");
        versione = attuale.versione + 1;
        partita.esito = copia(p.esito);
        if (p.mossa !== null) dati.mosse.push({ partitaId: p.partitaId, numero: versione, utente: p.utente, mossa: copia(p.mossa) });
      }
      partita.stato = p.statoPartita;
      dati.stati.set(p.partitaId, { stato: copia(p.stato), versione });
      if (p.vistaPubblica !== null) dati.vistePubbliche.set(p.partitaId, { vista: copia(p.vistaPubblica), versione });
      for (const v of p.viste) {
        dati.viste.set(`${p.partitaId}/${v.utente_id}`, { vista: copia(v.vista), mosse_valide: copia(v.mosse_valide), versione });
      }
      return versione;
    },
  };
}
