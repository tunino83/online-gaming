/**
 * Messaggi vocali tra i giocatori di una partita.
 * - Registrare: microfono del browser (MediaRecorder), al massimo 20 secondi.
 * - Inviare: il file va all'arbitro (che controlla e lo salva in uno spazio privato).
 * - Ricevere: avviso in tempo reale dalla tabella "vocali", poi si scarica il file e parte da solo.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { riproduci } from "./suoni";
import { assicuraAccesso, chiediArbitro, supabase } from "./supabase";

export const DURATA_MASSIMA_MS = 20_000;

/** Formati da provare, in ordine: mp4 (si sente ovunque, anche su iPhone), poi webm e ogg. */
const FORMATI = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];

export const vocaliSupportati = () =>
  typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

type StatoRegistrazione = { tipo: "fermo" } | { tipo: "avvio" } | { tipo: "registra"; inizio: number } | { tipo: "invio" };

/** Registratore: avvia() chiede il microfono e registra; invia() ferma e manda; annulla() butta via. */
export function useRegistratore(partitaId: string) {
  const [stato, setStato] = useState<StatoRegistrazione>({ tipo: "fermo" });
  const [errore, setErrore] = useState<string | null>(null);
  const registratore = useRef<MediaRecorder | null>(null);
  const pezzi = useRef<Blob[]>([]);
  const daInviare = useRef(false);
  const inizio = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chiudiMicrofono = () => {
    registratore.current?.stream.getTracks().forEach((t) => t.stop());
    registratore.current = null;
    if (timer.current) clearTimeout(timer.current);
  };
  useEffect(() => chiudiMicrofono, []);

  const ferma = useCallback((invia: boolean) => {
    daInviare.current = invia;
    if (registratore.current?.state === "recording") registratore.current.stop();
  }, []);

  const avvia = useCallback(async () => {
    setErrore(null);
    setStato({ tipo: "avvio" });
    try {
      const microfono = await navigator.mediaDevices.getUserMedia({ audio: true });
      const formato = FORMATI.find((f) => MediaRecorder.isTypeSupported(f));
      const r = new MediaRecorder(microfono, formato ? { mimeType: formato, audioBitsPerSecond: 32000 } : undefined);
      pezzi.current = [];
      r.ondataavailable = (e) => e.data.size > 0 && pezzi.current.push(e.data);
      r.onstop = async () => {
        const durataMs = Math.min(Date.now() - inizio.current, DURATA_MASSIMA_MS + 500);
        const tipo = r.mimeType || formato || "audio/webm";
        chiudiMicrofono();
        if (!daInviare.current || durataMs < 500) {
          setStato({ tipo: "fermo" });
          if (daInviare.current) setErrore("Tieni registrato almeno mezzo secondo");
          return;
        }
        setStato({ tipo: "invio" });
        const file = new Blob(pezzi.current, { type: tipo });
        const risposta = await chiediArbitro({ azione: "vocale", partitaId, audio: await inBase64(file), tipo, durataMs });
        if (!risposta.ok) setErrore(risposta.errore);
        setStato({ tipo: "fermo" });
      };
      registratore.current = r;
      inizio.current = Date.now();
      r.start();
      setStato({ tipo: "registra", inizio: inizio.current });
      timer.current = setTimeout(() => ferma(true), DURATA_MASSIMA_MS);
    } catch {
      chiudiMicrofono();
      setStato({ tipo: "fermo" });
      setErrore("Microfono non disponibile: controlla il permesso nel browser");
    }
  }, [partitaId, ferma]);

  return { stato, errore, avvia, invia: () => ferma(true), annulla: () => ferma(false), chiudiErrore: () => setErrore(null) };
}

function inBase64(file: Blob): Promise<string> {
  return new Promise((ok, ko) => {
    const lettore = new FileReader();
    lettore.onload = () => ok(String(lettore.result).split(",")[1] ?? "");
    lettore.onerror = () => ko(lettore.error);
    lettore.readAsDataURL(file);
  });
}

export interface VocaleRicevuto {
  id: string;
  utente: string;
  file: Blob;
  partito: boolean;
}

/** Vocali degli altri giocatori: arrivano in tempo reale e partono da soli (se i suoni sono accesi). */
export function useVocaliInArrivo(partitaId: string, io: string) {
  const [ultimo, setUltimo] = useState<VocaleRicevuto | null>(null);

  useEffect(() => {
    let vivo = true;
    let canale: ReturnType<typeof supabase.channel> | null = null;
    assicuraAccesso().then(() => {
      if (!vivo) return;
      canale = supabase
        .channel(`vocali-${partitaId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "vocali", filter: `partita_id=eq.${partitaId}` }, async (e) => {
          const riga = e.new as { id: string; utente_id: string; percorso: string };
          if (riga.utente_id === io) return;
          const { data } = await supabase.storage.from("vocali").download(riga.percorso);
          if (!data || !vivo) return;
          const partito = await riproduci(data);
          setUltimo({ id: riga.id, utente: riga.utente_id, file: data, partito });
        })
        .subscribe();
    });
    return () => {
      vivo = false;
      if (canale) supabase.removeChannel(canale);
    };
  }, [partitaId, io]);

  const riascolta = useCallback(async () => {
    if (!ultimo) return;
    const partito = await riproduci(ultimo.file, true);
    setUltimo((u) => (u ? { ...u, partito } : u));
  }, [ultimo]);

  const chiudi = useCallback(() => setUltimo(null), []);
  return { ultimo, riascolta, chiudi };
}
