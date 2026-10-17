/**
 * Collegamento a Supabase: accesso anonimo e chiamate all'arbitro.
 * Il browser non scrive mai nel database: manda richieste all'arbitro e legge solo ciò che può vedere.
 */
import { FunctionsHttpError, createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chiave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Falso se mancano le chiavi (file .env o impostazioni di Render). */
export const configurato = Boolean(url && chiave && /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url));

export const supabase = createClient(url ?? "https://manca-configurazione.supabase.co", chiave ?? "manca");

/** Id dell'utente: se non c'è ancora una sessione, entra in modo anonimo. */
export async function assicuraAccesso(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: nuovo, error } = await supabase.auth.signInAnonymously();
  if (error || !nuovo.user) throw new Error("Non riesco a collegarmi al server. Riprova tra poco.");
  return nuovo.user.id;
}

export type RispostaArbitro = { ok: true; [k: string]: unknown } | { ok: false; errore: string };

/** Oltre questo tempo si smette di aspettare, così la pagina non resta mai bloccata. */
const ATTESA_MASSIMA_MS = 20000;

/** Manda una richiesta all'arbitro. Non lancia mai errori: restituisce sempre { ok, ... }. */
export async function chiediArbitro(corpo: Record<string, unknown>): Promise<RispostaArbitro> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const scaduto = new Promise<RispostaArbitro>((risolvi) => {
    timer = setTimeout(
      () => risolvi({ ok: false, errore: "Il server non ha risposto in tempo. Controlla la connessione e riprova." }),
      ATTESA_MASSIMA_MS,
    );
  });
  try {
    return await Promise.race([chiamaArbitro(corpo), scaduto]);
  } finally {
    clearTimeout(timer);
  }
}

async function chiamaArbitro(corpo: Record<string, unknown>): Promise<RispostaArbitro> {
  try {
    await assicuraAccesso();
    const { data, error } = await supabase.functions.invoke("arbitro", { body: corpo });
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const dettaglio = await error.context.json().catch(() => null);
        if (dettaglio?.errore) return { ok: false, errore: dettaglio.errore };
      }
      return { ok: false, errore: "Il server non risponde. Riprova tra poco." };
    }
    return data as RispostaArbitro;
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : "Errore di collegamento" };
  }
}
