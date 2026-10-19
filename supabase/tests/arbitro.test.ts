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
  chiedi(corpo: Record<string, unknown>): Promise<{ ok: boolean; errore?: string; [k: string]: unknown }>;
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

  it("vocali: Anna ne manda uno, Bruno lo riceve in tempo reale e lo scarica; Carla (fuori) non vede niente", async () => {
    const arrivati: { percorso: string; utente_id: string }[] = [];
    await new Promise<void>((pronto, fallito) => {
      bruno.client
        .channel("vocali-bruno")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "vocali", filter: `partita_id=eq.${partitaId}` }, (e) => {
          arrivati.push(e.new as { percorso: string; utente_id: string });
        })
        .subscribe((stato) => {
          if (stato === "SUBSCRIBED") setTimeout(pronto, 1000);
          if (stato === "CHANNEL_ERROR" || stato === "TIMED_OUT") fallito(new Error(stato));
        });
    });
    const audio = Buffer.from("finto audio di prova ".repeat(50)).toString("base64");
    const r = await anna.chiedi({ azione: "vocale", partitaId, audio, tipo: "audio/webm;codecs=opus", durataMs: 1500 });
    expect(r).toMatchObject({ ok: true });
    for (let i = 0; i < 40 && arrivati.length === 0; i++) await new Promise((x) => setTimeout(x, 250));
    expect(arrivati).toHaveLength(1);
    expect(arrivati[0]!.utente_id).toBe(anna.id);

    const { data: file, error } = await bruno.client.storage.from("vocali").download(arrivati[0]!.percorso);
    expect(error).toBeNull();
    expect(await file!.text()).toBe("finto audio di prova ".repeat(50));

    const { data: righeCarla } = await carla.client.from("vocali").select("*").eq("partita_id", partitaId);
    expect(righeCarla).toEqual([]);
    const { data: fileCarla } = await carla.client.storage.from("vocali").download(arrivati[0]!.percorso);
    expect(fileCarla).toBeNull();
    expect(await carla.chiedi({ azione: "vocale", partitaId, audio, tipo: "audio/webm", durataMs: 1500 })).toMatchObject({ ok: false });
    // I browser non possono scrivere direttamente: né la tabella né i file
    const { error: erroreScrittura } = await anna.client.from("vocali").insert({ partita_id: partitaId, utente_id: anna.id, percorso: "x", durata_ms: 1000 });
    expect(erroreScrittura).not.toBeNull();
    const { error: erroreFile } = await anna.client.storage.from("vocali").upload(`${partitaId}/furbo.webm`, new Blob(["x"]), { contentType: "audio/webm" });
    expect(erroreFile).not.toBeNull();
  });

  it("spettatrice: Carla entra col codice a partita iniziata, vede la vista pubblica ma nessuna mano né lo stato segreto", async () => {
    expect(await carla.chiedi({ azione: "guarda", codice })).toEqual({ ok: true, partitaId });
    const [vA, vB] = await Promise.all([miaVista(anna, partitaId), miaVista(bruno, partitaId)]);
    const [chi] = vA.mosse_valide.length > 0 ? [anna] : [bruno];
    expect(await chi.chiedi({ azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toMatchObject({ ok: true });

    const { data: pubblica } = await carla.client.from("viste_pubbliche").select("vista, versione").eq("partita_id", partitaId).single();
    const vista = pubblica!.vista as { io: string; mano: unknown[]; giocatori: Record<string, { carteInMano: number }> };
    expect(vista.io).toBe("");
    expect(vista.mano).toEqual([]);
    expect(Object.keys(vista.giocatori).sort()).toEqual([anna.id, bruno.id].sort());

    const { data: partite } = await carla.client.from("partite").select("id").eq("id", partitaId);
    expect(partite).toHaveLength(1);
    const { data: giocatori } = await carla.client.from("giocatori_partita").select("nickname").eq("partita_id", partitaId);
    expect(giocatori).toHaveLength(2);
    const { data: viste } = await carla.client.from("viste").select("*").eq("partita_id", partitaId);
    expect(viste).toEqual([]);
    const { data: stati } = await carla.client.from("stati_partita").select("*").eq("partita_id", partitaId);
    expect(stati ?? []).toEqual([]);
    // Non gioca e non scrive
    expect(await carla.chiedi({ azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toMatchObject({ ok: false });
    const { error } = await carla.client.from("spettatori").insert({ partita_id: partitaId, utente_id: carla.id });
    expect(error).not.toBeNull();
    void vB;
  });

  it("modalità di prova: le partite contro il computer riusano gli stessi robot", async () => {
    const robotDi = async (g: Giocatore, partitaId: string) => {
      const { data } = await g.client.from("giocatori_partita").select("utente_id, bot").eq("partita_id", partitaId);
      return (data ?? []).filter((x) => x.bot).map((x) => x.utente_id).sort();
    };
    const prima = await carla.chiedi({ azione: "controComputer", nickname: "Carla", bot: 2 });
    const seconda = await carla.chiedi({ azione: "controComputer", nickname: "Carla", bot: 2 });
    expect(prima).toMatchObject({ ok: true });
    expect(seconda).toMatchObject({ ok: true });
    const r1 = await robotDi(carla, prima.partitaId as string);
    const r2 = await robotDi(carla, seconda.partitaId as string);
    expect(r1).toHaveLength(2);
    expect(r2).toEqual(r1);
  }, 60000);
});
