/**
 * La propria vista di una partita (cosa vedo + mosse che posso fare), aggiornata in tempo reale.
 * Si rilegge a ogni (ri)collegamento e si ignorano aggiornamenti più vecchi di quello che si ha.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { assicuraAccesso, supabase } from "./supabase";

export interface RigaVista<Vista, Mossa> {
  vista: Vista;
  mosse_valide: Mossa[];
  versione: number;
}

export function useVista<Vista, Mossa>(partitaId: string, attiva: boolean) {
  const [riga, setRiga] = useState<RigaVista<Vista, Mossa> | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const versione = useRef(-1);

  const aggiorna = useCallback((nuova: RigaVista<Vista, Mossa>) => {
    if (nuova.versione < versione.current) return; // messaggio arrivato in ritardo
    versione.current = nuova.versione;
    setRiga(nuova);
  }, []);

  const carica = useCallback(async () => {
    const io = await assicuraAccesso();
    const { data, error } = await supabase
      .from("viste")
      .select("vista, mosse_valide, versione")
      .eq("partita_id", partitaId)
      .eq("utente_id", io)
      .maybeSingle();
    if (error) return setErrore("Non riesco a leggere la partita. Riprova.");
    if (data) aggiorna(data as RigaVista<Vista, Mossa>);
  }, [partitaId, aggiorna]);

  useEffect(() => {
    if (!attiva) return;
    let vivo = true;
    let canale: ReturnType<typeof supabase.channel> | null = null;
    assicuraAccesso().then(() => {
      if (!vivo) return;
      canale = supabase
        .channel(`vista-${partitaId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "viste", filter: `partita_id=eq.${partitaId}` }, (e) => {
          if (e.new && "vista" in e.new) aggiorna(e.new as RigaVista<Vista, Mossa>);
        })
        .subscribe((s) => {
          if (s === "SUBSCRIBED") carica();
        });
    });
    carica();
    return () => {
      vivo = false;
      if (canale) supabase.removeChannel(canale);
    };
  }, [partitaId, attiva, carica, aggiorna]);

  return { riga, errore, ricarica: carica };
}
