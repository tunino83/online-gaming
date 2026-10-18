/**
 * Archivio sul database Supabase. Usa le funzioni SQL "arbitro_*"
 * (supabase/migrations), eseguibili solo con la chiave di servizio dell'arbitro.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Archivio, type CodiceErroreArchivio, ErroreArchivio, type InfoPartita } from "./arbitro";

const CODICI: CodiceErroreArchivio[] = ["CODICE_NON_VALIDO", "PARTITA_INIZIATA", "PARTITA_PIENA", "PARTITA_GIA_AVVIATA", "CONFLITTO"];

function traduci(e: { code?: string; message?: string }): never {
  if (e.code === "23505") throw new ErroreArchivio("CODICE_DUPLICATO");
  const codice = CODICI.find((c) => e.message?.includes(c));
  if (codice) throw new ErroreArchivio(codice);
  throw new Error(`Errore del database: ${e.message ?? e.code}`);
}

export function creaArchivioSupabase(db: SupabaseClient): Archivio {
  return {
    async creaPartita(p) {
      const { data, error } = await db.rpc("arbitro_crea_partita", {
        p_creatore: p.creatore,
        p_nickname: p.nickname,
        p_codice: p.codice,
        p_gioco: p.gioco,
        p_opzioni: p.opzioni,
        p_max: p.maxGiocatori,
        p_avatar: p.avatar,
      });
      if (error) traduci(error);
      return data as string;
    },

    async unisciti(p) {
      const { data, error } = await db.rpc("arbitro_unisciti", {
        p_codice: p.codice,
        p_utente: p.utente,
        p_nickname: p.nickname,
        p_avatar: p.avatar,
      });
      if (error) traduci(error);
      return data as string;
    },

    async leggiPartita(id) {
      const { data, error } = await db
        .from("partite")
        .select("id, codice, gioco, stato, creatore, opzioni, max_giocatori, giocatori_partita (utente_id, nickname, avatar, entrato_il)")
        .eq("id", id)
        .maybeSingle();
      if (error) traduci(error);
      if (!data) return null;
      const giocatori = [...(data.giocatori_partita as { utente_id: string; nickname: string; avatar: string; entrato_il: string }[])]
        .sort((a, b) => a.entrato_il.localeCompare(b.entrato_il))
        .map((g) => ({ utenteId: g.utente_id, nickname: g.nickname, avatar: g.avatar }));
      return {
        id: data.id,
        codice: data.codice,
        gioco: data.gioco,
        stato: data.stato,
        creatore: data.creatore,
        opzioni: data.opzioni,
        maxGiocatori: data.max_giocatori,
        giocatori,
      } as InfoPartita;
    },

    async leggiStato(id) {
      const { data, error } = await db.from("stati_partita").select("stato, versione").eq("partita_id", id).maybeSingle();
      if (error) traduci(error);
      return data ? { stato: data.stato, versione: data.versione } : null;
    },

    async salva(p) {
      const { data, error } = await db.rpc("arbitro_salva", {
        p_partita: p.partitaId,
        p_versione_attesa: p.versioneAttesa,
        p_stato: p.stato,
        p_viste: p.viste,
        p_utente: p.utente,
        p_mossa: p.mossa,
        p_stato_partita: p.statoPartita,
        p_esito: p.esito,
      });
      if (error) traduci(error);
      return data as number;
    },
  };
}
