/**
 * Vista pubblica di una partita (per spettatori e schermo "tavolo"), aggiornata in tempo reale.
 * Come useVista: si rilegge a ogni (ri)collegamento e si ignorano aggiornamenti più vecchi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { assicuraAccesso, supabase } from "./supabase";

export interface RigaVistaPubblica<Vista> {
  vista: Vista;
  versione: number;
}

export function useVistaPubblica<Vista>(partitaId: string) {
  const [riga, setRiga] = useState<RigaVistaPubblica<Vista> | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const versione = useRef(-1);

  const aggiorna = useCallback((nuova: RigaVistaPubblica<Vista>) => {
    if (nuova.versione < versione.current) return;
    versione.current = nuova.versione;
    setRiga(nuova);
  }, []);

  const carica = useCallback(async () => {
    await assicuraAccesso();
    const { data, error } = await supabase.from("viste_pubbliche").select("vista, versione").eq("partita_id", partitaId).maybeSingle();
    if (error) return setErrore("Non riesco a leggere la partita. Riprova.");
    if (data) aggiorna(data as RigaVistaPubblica<Vista>);
  }, [partitaId, aggiorna]);

  useEffect(() => {
    let vivo = true;
    let canale: ReturnType<typeof supabase.channel> | null = null;
    assicuraAccesso().then(() => {
      if (!vivo) return;
      canale = supabase
        .channel(`pubblica-${partitaId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "viste_pubbliche", filter: `partita_id=eq.${partitaId}` }, (e) => {
          if (e.new && "vista" in e.new) aggiorna(e.new as RigaVistaPubblica<Vista>);
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
  }, [partitaId, carica, aggiorna]);

  return { riga, errore };
}
