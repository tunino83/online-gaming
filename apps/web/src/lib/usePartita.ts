/**
 * Dati di una partita (info e giocatori), sempre aggiornati in tempo reale.
 * Regola: a ogni (ri)collegamento del canale si rilegge tutto, così un messaggio perso
 * non lascia lo schermo indietro.
 */
import { useCallback, useEffect, useState } from "react";
import { assicuraAccesso, supabase } from "./supabase";

export interface Partita {
  id: string;
  codice: string;
  gioco: string;
  stato: "attesa" | "in_corso" | "finita";
  creatore: string;
  max_giocatori: number;
  opzioni: { puntiPerVincere?: number; computerAlPosto?: boolean };
  esito: { vincitori: string[]; punti: Record<string, number> } | null;
}

export interface GiocatorePartita {
  utente_id: string;
  nickname: string;
  avatar: string;
  entrato_il: string;
  /** Giocatore del computer (partite di prova). */
  bot?: boolean;
}

export type StatoCaricamento =
  | { tipo: "carico" }
  | { tipo: "nonTrovata" }
  | { tipo: "errore"; testo: string }
  | { tipo: "pronta"; partita: Partita; giocatori: GiocatorePartita[]; io: string };

export function usePartita(id: string): StatoCaricamento {
  const [stato, setStato] = useState<StatoCaricamento>({ tipo: "carico" });

  const carica = useCallback(async () => {
    try {
      const io = await assicuraAccesso();
      const [p, g] = await Promise.all([
        supabase.from("partite").select("*").eq("id", id).maybeSingle(),
        supabase.from("giocatori_partita").select("utente_id, nickname, avatar, entrato_il, bot").eq("partita_id", id).order("entrato_il"),
      ]);
      if (p.error || g.error) return setStato({ tipo: "errore", testo: "Non riesco a leggere la partita. Riprova." });
      if (!p.data) return setStato({ tipo: "nonTrovata" });
      setStato({ tipo: "pronta", partita: p.data as Partita, giocatori: g.data as GiocatorePartita[], io });
    } catch (e) {
      setStato({ tipo: "errore", testo: e instanceof Error ? e.message : "Errore di collegamento" });
    }
  }, [id]);

  useEffect(() => {
    let attivo = true;
    let canale: ReturnType<typeof supabase.channel> | null = null;
    assicuraAccesso()
      .then(() => {
        if (!attivo) return;
        canale = supabase
          .channel(`partita-${id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "partite", filter: `id=eq.${id}` }, carica)
          .on("postgres_changes", { event: "*", schema: "public", table: "giocatori_partita", filter: `partita_id=eq.${id}` }, carica)
          .subscribe((s) => {
            if (s === "SUBSCRIBED") carica();
          });
      })
      .catch(() => setStato({ tipo: "errore", testo: "Non riesco a collegarmi al server. Riprova tra poco." }));
    carica();
    return () => {
      attivo = false;
      if (canale) supabase.removeChannel(canale);
    };
  }, [id, carica]);

  return stato;
}
