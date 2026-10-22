/**
 * Archivio sul database Supabase. Usa le funzioni SQL "arbitro_*"
 * (supabase/migrations), eseguibili solo con la chiave di servizio dell'arbitro.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Archivio, type CodiceErroreArchivio, ErroreArchivio, type InfoPartita } from "./arbitro";

const CODICI: CodiceErroreArchivio[] = ["CODICE_NON_VALIDO", "PARTITA_INIZIATA", "PARTITA_PIENA", "AVATAR_PRESO", "PARTITA_GIA_AVVIATA", "CONFLITTO"];

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
      if (!p.pubblica) {
        const { error: erroreVisibile } = await db.from("partite").update({ pubblica: false }).eq("id", data as string);
        if (erroreVisibile) traduci(erroreVisibile);
      }
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
        .select("id, codice, gioco, stato, creatore, opzioni, max_giocatori, giocatori_partita (utente_id, nickname, avatar, bot, entrato_il)")
        .eq("id", id)
        .maybeSingle();
      if (error) traduci(error);
      if (!data) return null;
      const giocatori = [
        ...(data.giocatori_partita as { utente_id: string; nickname: string; avatar: string; bot: boolean; entrato_il: string }[]),
      ]
        .sort((a, b) => a.entrato_il.localeCompare(b.entrato_il))
        .map((g) => ({ utenteId: g.utente_id, nickname: g.nickname, avatar: g.avatar, bot: g.bot }));
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

    async utenteBot(numero) {
      const { data: esistente, error: erroreLettura } = await db
        .from("bot_fissi")
        .select("utente_id")
        .eq("numero", numero)
        .maybeSingle();
      if (erroreLettura) traduci(erroreLettura);
      if (esistente) return esistente.utente_id as string;

      // Prima volta: utente di servizio senza password (non può accedere), poi lo si ricorda
      const email = `computer-${numero}@bot.invalid`;
      const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: { bot: true } });
      let id = data.user?.id;
      if (!id) {
        // Esiste già (per esempio creato in parallelo): lo si cerca per email
        const elenco = await db.auth.admin.listUsers({ perPage: 1000 });
        id = elenco.data.users.find((u) => u.email === email)?.id;
        if (!id) throw new Error(`Non riesco a preparare il giocatore del computer: ${error?.message}`);
      }
      const { error: erroreSalva } = await db.from("bot_fissi").upsert({ numero, utente_id: id }, { onConflict: "numero" });
      if (erroreSalva) traduci(erroreSalva);
      return id;
    },

    async elencaAperte() {
      const limite = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const { data, error } = await db
        .from("partite")
        .select("codice, gioco, creatore, max_giocatori, creata_il, giocatori_partita (utente_id, nickname, avatar)")
        .eq("stato", "attesa")
        .eq("pubblica", true)
        .gt("creata_il", limite)
        .order("creata_il", { ascending: false })
        .limit(30);
      if (error) traduci(error);
      type Riga = { codice: string; gioco: string; creatore: string; max_giocatori: number; creata_il: string; giocatori_partita: { utente_id: string; nickname: string; avatar: string }[] };
      return ((data ?? []) as Riga[])
        .filter((x) => x.giocatori_partita.length < x.max_giocatori)
        .slice(0, 20)
        .map((x) => {
          const c = x.giocatori_partita.find((g) => g.utente_id === x.creatore) ?? x.giocatori_partita[0];
          return {
            codice: x.codice,
            gioco: x.gioco,
            creatore: c?.nickname ?? "?",
            avatar: c?.avatar ?? "mago",
            giocatori: x.giocatori_partita.length,
            maxGiocatori: x.max_giocatori,
            creataIl: x.creata_il,
          };
        });
    },

    async guarda(p) {
      const { data, error } = await db.rpc("arbitro_guarda", { p_codice: p.codice, p_utente: p.utente });
      if (error) traduci(error);
      return data as string;
    },

    async aggiungiBot(p) {
      const { error } = await db.rpc("arbitro_aggiungi_bot", {
        p_partita: p.partitaId,
        p_utente: p.utente,
        p_nickname: p.nickname,
        p_avatar: p.avatar,
      });
      if (error) traduci(error);
    },

    async leggiStato(id) {
      const { data, error } = await db.from("stati_partita").select("stato, versione").eq("partita_id", id).maybeSingle();
      if (error) traduci(error);
      return data ? { stato: data.stato, versione: data.versione } : null;
    },

    async salvaVocale(p) {
      const estensione = { "audio/mp4": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/aac": "aac" }[p.tipo];
      const percorso = `${p.partitaId}/${crypto.randomUUID()}.${estensione}`;
      const { error: erroreFile } = await db.storage.from("vocali").upload(percorso, p.dati, { contentType: p.tipo });
      if (erroreFile) throw new Error(`Errore nel salvare il vocale: ${erroreFile.message}`);
      const { data, error } = await db
        .from("vocali")
        .insert({ partita_id: p.partitaId, utente_id: p.utente, percorso, durata_ms: p.durataMs })
        .select("id")
        .single();
      if (error) traduci(error);
      await pulisciVocaliVecchi(db);
      return data!.id as string;
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
      // Vista per spettatori e schermo "tavolo" (stessa versione delle viste dei giocatori)
      if (p.vistaPubblica !== null) {
        const { error: errorePubblica } = await db
          .from("viste_pubbliche")
          .upsert({ partita_id: p.partitaId, vista: p.vistaPubblica, versione: data as number, aggiornata_il: new Date().toISOString() });
        if (errorePubblica) console.error("Vista pubblica non salvata:", errorePubblica.message);
      }
      return data as number;
    },
  };
}

/** I vocali servono solo durante la partita: quelli di più di un giorno si cancellano (file e avvisi). */
async function pulisciVocaliVecchi(db: SupabaseClient): Promise<void> {
  const ieri = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db.from("vocali").select("id, percorso").lt("creato_il", ieri).limit(100);
  if (!data || data.length === 0) return;
  await db.storage.from("vocali").remove(data.map((v) => v.percorso as string));
  await db.from("vocali").delete().in("id", data.map((v) => v.id as string));
}
