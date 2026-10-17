// Arbitro delle partite (Supabase Edge Function, gira su Deno).
// La logica è in packages/server: `pnpm build:arbitro` la impacchetta in nucleo.js.
// Pubblicazione: `pnpm deploy:arbitro`.
import { createClient } from "@supabase/supabase-js";
import { creaArchivioSupabase, gestisci } from "./nucleo.js";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const archivio = creaArchivioSupabase(db);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const risposta = (stato: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status: stato, headers: { ...CORS, "Content-Type": "application/json" } });

const casuale = () => crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return risposta(405, { ok: false, errore: "Metodo non permesso" });

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const { data } = token ? await db.auth.getUser(token) : { data: { user: null } };
  if (!data.user) return risposta(401, { ok: false, errore: "Accesso richiesto" });

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return risposta(400, { ok: false, errore: "Richiesta non valida" });
  }

  try {
    return risposta(200, await gestisci(corpo, data.user.id, archivio, { casuale }));
  } catch (e) {
    console.error(e);
    return risposta(500, { ok: false, errore: "Errore del server, riprova" });
  }
});
