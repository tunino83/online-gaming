/**
 * Regole di accesso del database, provate "da browser" (chiave anon) sul progetto di prova.
 * Uso: pnpm test:supabase
 *
 * Qui si verifica che un browser non possa scrivere nulla né leggere lo stato segreto.
 * Il controllo "un giocatore non legge la vista di un altro" con partite vere
 * si aggiunge col passo 3, quando l'arbitro crea le partite.
 */
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import WebSocket from "ws";

const url = process.env.VITE_SUPABASE_URL!;
const chiave = process.env.VITE_SUPABASE_ANON_KEY!;
const nuovoClient = () =>
  createClient(url, chiave, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as never }, // Node 20 non ha WebSocket di serie
  });

const TABELLE_SEGRETE = ["stati_partita", "mosse"] as const;
const TABELLE_LEGGIBILI = ["partite", "giocatori_partita", "viste"] as const;
const PERMESSO_NEGATO = "42501";

describe("regole di accesso del database", () => {
  let ospite: SupabaseClient; // senza accesso
  let giocatore: SupabaseClient; // accesso anonimo
  let idGiocatore: string;

  beforeAll(async () => {
    expect(url, "Compila apps/web/.env").toMatch(/^https:\/\/.+\.supabase\.co$/);
    ospite = nuovoClient();
    giocatore = nuovoClient();
    const { data, error } = await giocatore.auth.signInAnonymously();
    expect(error).toBeNull();
    idGiocatore = data.user!.id;
  });

  afterAll(async () => {
    await giocatore?.auth.signOut();
  });

  it("l'accesso anonimo funziona", () => {
    expect(idGiocatore).toMatch(/^[0-9a-f-]{36}$/);
  });

  for (const tabella of TABELLE_SEGRETE) {
    it(`nessuno legge ${tabella}, nemmeno un giocatore collegato`, async () => {
      for (const client of [ospite, giocatore]) {
        const { error } = await client.from(tabella).select("*").limit(1);
        expect(error?.code).toBe(PERMESSO_NEGATO);
      }
    });
  }

  for (const tabella of TABELLE_LEGGIBILI) {
    it(`chi non ha fatto l'accesso non legge ${tabella}`, async () => {
      const { error } = await ospite.from(tabella).select("*").limit(1);
      expect(error?.code).toBe(PERMESSO_NEGATO);
    });

    it(`un giocatore collegato non vede righe di ${tabella} che non lo riguardano`, async () => {
      const { data, error } = await giocatore.from(tabella).select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  }

  it("un giocatore non può creare una partita direttamente (solo l'arbitro)", async () => {
    const { error } = await giocatore.from("partite").insert({ codice: "TEST1", creatore: idGiocatore });
    expect(error?.code).toBe(PERMESSO_NEGATO);
  });

  it("un giocatore non può scriversi una vista o uno stato", async () => {
    const vista = await giocatore
      .from("viste")
      .insert({ partita_id: crypto.randomUUID(), utente_id: idGiocatore, vista: {} });
    expect(vista.error?.code).toBe(PERMESSO_NEGATO);
    const stato = await giocatore.from("stati_partita").insert({ partita_id: crypto.randomUUID(), stato: {} });
    expect(stato.error?.code).toBe(PERMESSO_NEGATO);
  });

  it("un giocatore non può modificare né cancellare partite o viste", async () => {
    const modifica = await giocatore.from("partite").update({ stato: "finita" }).neq("codice", "");
    expect(modifica.error?.code).toBe(PERMESSO_NEGATO);
    const cancella = await giocatore.from("viste").delete().eq("utente_id", idGiocatore);
    expect(cancella.error?.code).toBe(PERMESSO_NEGATO);
  });
});
