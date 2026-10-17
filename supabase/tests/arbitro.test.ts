/**
 * L'arbitro pubblicato su Supabase, provato come lo useranno i browser.
 * Uso: pnpm test:supabase (dopo pnpm deploy:arbitro)
 */
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import WebSocket from "ws";

const url = process.env.VITE_SUPABASE_URL!;
const chiave = process.env.VITE_SUPABASE_ANON_KEY!;

interface Giocatore {
  client: SupabaseClient;
  id: string;
  chiedi(corpo: unknown): Promise<{ ok: boolean; errore?: string; [k: string]: unknown }>;
}

async function nuovoGiocatore(): Promise<Giocatore> {
  const client = createClient(url, chiave, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as never },
  });
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return {
    client,
    id: data.user!.id,
    async chiedi(corpo) {
      const { data, error } = await client.functions.invoke("arbitro", { body: corpo });
      if (error) throw error;
      return data;
    },
  };
}

type RigaVista = { utente_id: string; vista: { mano: unknown[]; turno: { giocatore: string } }; mosse_valide: unknown[]; versione: number };

async function miaVista(g: Giocatore, partitaId: string): Promise<RigaVista> {
  const { data, error } = await g.client.from("viste").select("*").eq("partita_id", partitaId).single();
  if (error) throw error;
  return data as RigaVista;
}

describe("arbitro sul server", () => {
  let anna: Giocatore;
  let bruno: Giocatore;
  let carla: Giocatore;
  let partitaId: string;
  let codice: string;

  beforeAll(async () => {
    [anna, bruno, carla] = await Promise.all([nuovoGiocatore(), nuovoGiocatore(), nuovoGiocatore()]);
  });

  afterAll(async () => {
    for (const g of [anna, bruno, carla]) {
      await g?.client.removeAllChannels();
      await g?.client.auth.signOut();
    }
  });

  it("senza accesso l'arbitro non risponde", async () => {
    const r = await fetch(`${url}/functions/v1/arbitro`, {
      method: "POST",
      headers: { apikey: chiave, Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ azione: "crea", nickname: "Intruso" }),
    });
    expect(r.status).toBe(401);
  });

  it("Anna crea la partita, Bruno entra col codice", async () => {
    const creata = await anna.chiedi({ azione: "crea", nickname: "Anna", maxGiocatori: 2 });
    expect(creata).toMatchObject({ ok: true, codice: expect.stringMatching(/^[A-Z2-9]{5}$/) });
    partitaId = creata.partitaId as string;
    codice = creata.codice as string;
    expect(await bruno.chiedi({ azione: "unisciti", codice, nickname: "Bruno" })).toEqual({ ok: true, partitaId });
  });

  it("nella stanza d'attesa entrambi vedono la partita e chi c'è; Carla (fuori) no", async () => {
    for (const g of [anna, bruno]) {
      const { data } = await g.client.from("giocatori_partita").select("nickname").eq("partita_id", partitaId);
      expect(data?.map((x) => x.nickname).sort()).toEqual(["Anna", "Bruno"]);
    }
    const { data } = await carla.client.from("partite").select("*").eq("id", partitaId);
    expect(data).toEqual([]);
  });

  it("solo Anna può avviarla; poi il codice non vale più (e la partita era da 2)", async () => {
    expect(await bruno.chiedi({ azione: "avvia", partitaId })).toMatchObject({ ok: false });
    expect(await anna.chiedi({ azione: "avvia", partitaId })).toEqual({ ok: true });
    expect(await carla.chiedi({ azione: "unisciti", codice, nickname: "Carla" })).toMatchObject({ ok: false });
  });

  it("ognuno legge solo la propria vista; lo stato completo resta segreto", async () => {
    const vA = await miaVista(anna, partitaId);
    const vB = await miaVista(bruno, partitaId);
    expect(vA.utente_id).toBe(anna.id);
    expect(vB.utente_id).toBe(bruno.id);
    const { data: rubata } = await bruno.client.from("viste").select("*").eq("utente_id", anna.id);
    expect(rubata).toEqual([]);
    const { error } = await anna.client.from("stati_partita").select("*").eq("partita_id", partitaId);
    expect(error?.code).toBe("42501");
    const { data: daFuori } = await carla.client.from("viste").select("*").eq("partita_id", partitaId);
    expect(daFuori).toEqual([]);
  });

  it("fuori turno la mossa è rifiutata", async () => {
    const vA = await miaVista(anna, partitaId);
    const fuori = vA.vista.turno.giocatore === anna.id ? bruno : anna;
    expect(await fuori.chiedi({ azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({
      ok: false,
      errore: "Non è il tuo turno",
    });
  });

  it("12 mosse giocate dal server; l'altro giocatore riceve gli aggiornamenti in tempo reale", async () => {
    const aggiornamentiBruno: number[] = [];
    await new Promise<void>((pronto, fallito) => {
      bruno.client
        .channel("viste-bruno")
        .on("postgres_changes", { event: "*", schema: "public", table: "viste", filter: `partita_id=eq.${partitaId}` }, (e) => {
          aggiornamentiBruno.push((e.new as RigaVista).versione);
        })
        .subscribe((stato) => {
          // Il canale impiega un attimo ad attivarsi del tutto anche dopo SUBSCRIBED.
          if (stato === "SUBSCRIBED") setTimeout(pronto, 1000);
          if (stato === "CHANNEL_ERROR" || stato === "TIMED_OUT") fallito(new Error(stato));
        });
    });

    for (let i = 0; i < 12; i++) {
      const [vA, vB] = await Promise.all([miaVista(anna, partitaId), miaVista(bruno, partitaId)]);
      const [chi, vista] = vA.mosse_valide.length > 0 ? [anna, vA] : [bruno, vB];
      expect(vista.mosse_valide.length).toBeGreaterThan(0);
      const r = await chi.chiedi({ azione: "mossa", partitaId, mossa: vista.mosse_valide[0] });
      expect(r, JSON.stringify(vista.mosse_valide[0])).toEqual({ ok: true });
      expect((await miaVista(chi, partitaId)).versione).toBe(vista.versione + 1);
    }

    // Bruno riceve la propria vista aggiornata (e solo la sua) a ogni mossa.
    const limite = Date.now() + 10000;
    while (aggiornamentiBruno.length < 12 && Date.now() < limite) await new Promise((r) => setTimeout(r, 200));
    expect(aggiornamentiBruno.length).toBeGreaterThanOrEqual(12);
  }, 120000);
});
