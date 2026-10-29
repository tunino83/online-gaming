import { creaCasuale, prossimo } from "@og/engine";
import { type StatoPartita as StatoFamiglia, giocoFamiglia } from "@og/famiglia";
import { type StatoPartita, mossaDelBot } from "@og/primo-gioco";
import { describe, expect, it } from "vitest";
import { type Ambiente, gestisci } from "./arbitro";
import { creaArchivioMemoria } from "./archivio-memoria";

const A = "utente-anna";
const B = "utente-bruno";
const C = "utente-carla";

function prepara(seed = 1) {
  const archivio = creaArchivioMemoria();
  const rng = creaCasuale(seed);
  const amb: Ambiente = { casuale: () => prossimo(rng) };
  const chiedi = (utente: string, richiesta: unknown) => gestisci(richiesta, utente, archivio, amb);
  return { archivio, chiedi };
}

/** Partita creata da A con B dentro; restituisce id e codice. */
async function partitaConDue(seed = 1) {
  const t = prepara(seed);
  const creata = await t.chiedi(A, { azione: "crea", nickname: "Anna" });
  if (!creata.ok) throw new Error(creata.errore);
  const unito = await t.chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno" });
  expect(unito).toEqual({ ok: true, partitaId: creata.partitaId });
  return { ...t, partitaId: creata.partitaId as string, codice: creata.codice as string };
}

describe("creare e unirsi a una partita", () => {
  it("crea una partita con un codice d'invito di 5 caratteri", async () => {
    const { chiedi, archivio } = prepara();
    const r = await chiedi(A, { azione: "crea", nickname: "  Anna  " });
    expect(r).toMatchObject({ ok: true, codice: expect.stringMatching(/^[A-Z2-9]{5}$/) });
    const p = await archivio.leggiPartita((r as unknown as { partitaId: string }).partitaId);
    expect(p).toMatchObject({ stato: "attesa", creatore: A, giocatori: [{ utenteId: A, nickname: "Anna", avatar: "mago", bot: false }] });
  });

  it("rifiuta nickname vuoti o troppo lunghi, giochi sconosciuti e opzioni strane", async () => {
    const { chiedi } = prepara();
    expect(await chiedi(A, { azione: "crea", nickname: "  " })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "x".repeat(25) })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", gioco: "scacchi" })).toEqual({ ok: false, errore: "Gioco sconosciuto" });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", maxGiocatori: 9 })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { limiteMano: 99 } })).toEqual({ ok: false, errore: "Opzioni non valide" });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { puntiPerVincere: 2 } })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { puntiPerVincere: 10 } })).toMatchObject({ ok: true });
  });

  it("richieste malformate o azioni sconosciute sono rifiutate", async () => {
    const { chiedi } = prepara();
    expect(await chiedi(A, null)).toEqual({ ok: false, errore: "Richiesta non valida" });
    expect(await chiedi(A, { azione: "cancellaTutto" })).toEqual({ ok: false, errore: "Azione sconosciuta" });
  });

  it("ci si unisce col codice (anche scritto in minuscolo); rientrare non duplica", async () => {
    const { chiedi, archivio, partitaId, codice } = await partitaConDue();
    expect(await chiedi(B, { azione: "unisciti", codice: codice.toLowerCase(), nickname: "Bruno" })).toMatchObject({ ok: true });
    expect((await archivio.leggiPartita(partitaId))?.giocatori).toHaveLength(2);
  });

  it("codice sbagliato, partita piena", async () => {
    const { chiedi } = prepara();
    expect(await chiedi(B, { azione: "unisciti", codice: "ZZZZZ", nickname: "Bruno" })).toEqual({
      ok: false,
      errore: "Codice d'invito non valido",
    });
    const r = await chiedi(A, { azione: "crea", nickname: "Anna", maxGiocatori: 2 });
    const codice = (r as unknown as { codice: string }).codice;
    await chiedi(B, { azione: "unisciti", codice, nickname: "Bruno" });
    expect(await chiedi(C, { azione: "unisciti", codice, nickname: "Carla" })).toEqual({ ok: false, errore: "La partita è piena" });
  });
});

describe("avviare la partita", () => {
  it("solo chi l'ha creata può avviarla, e servono almeno 2 giocatori", async () => {
    const { chiedi } = prepara();
    const r = await chiedi(A, { azione: "crea", nickname: "Anna" });
    const partitaId = (r as unknown as { partitaId: string }).partitaId;
    expect(await chiedi(A, { azione: "avvia", partitaId })).toEqual({ ok: false, errore: "Servono almeno 2 giocatori" });
    await chiedi(B, { azione: "unisciti", codice: (r as unknown as { codice: string }).codice, nickname: "Bruno" });
    expect(await chiedi(B, { azione: "avvia", partitaId })).toEqual({ ok: false, errore: "Solo chi ha creato la partita può avviarla" });
    expect(await chiedi(C, { azione: "avvia", partitaId })).toEqual({ ok: false, errore: "Partita non trovata" });
    expect(await chiedi(A, { azione: "avvia", partitaId })).toEqual({ ok: true });
  });

  it("dopo l'avvio: stato privato, una vista per giocatore, e il link non vale più", async () => {
    const { chiedi, archivio, partitaId, codice } = await partitaConDue();
    await chiedi(A, { azione: "avvia", partitaId });
    expect((await archivio.leggiPartita(partitaId))?.stato).toBe("in_corso");
    expect(archivio.dati.stati.get(partitaId)?.versione).toBe(0);
    expect(archivio.dati.viste.has(`${partitaId}/${A}`)).toBe(true);
    expect(archivio.dati.viste.has(`${partitaId}/${B}`)).toBe(true);
    expect(await chiedi(C, { azione: "unisciti", codice, nickname: "Carla" })).toEqual({
      ok: false,
      errore: "La partita è già iniziata: il link non è più valido",
    });
    expect(await chiedi(A, { azione: "avvia", partitaId })).toEqual({ ok: false, errore: "La partita è già stata avviata" });
  });

  it("solo chi è di turno ha mosse possibili nella propria vista", async () => {
    const { chiedi, archivio, partitaId } = await partitaConDue();
    await chiedi(A, { azione: "avvia", partitaId });
    const stato = archivio.dati.stati.get(partitaId)!.stato as StatoPartita;
    const diTurno = stato.turno.giocatore;
    const altro = diTurno === A ? B : A;
    expect(archivio.dati.viste.get(`${partitaId}/${diTurno}`)!.mosse_valide.length).toBeGreaterThan(0);
    expect(archivio.dati.viste.get(`${partitaId}/${altro}`)!.mosse_valide).toEqual([]);
  });
});

describe("mosse", () => {
  async function avviata(seed = 1) {
    const t = await partitaConDue(seed);
    await t.chiedi(A, { azione: "avvia", partitaId: t.partitaId });
    const stato = () => t.archivio.dati.stati.get(t.partitaId)!.stato as StatoPartita;
    return { ...t, stato };
  }

  it("una mossa valida aggiorna stato, viste e storico", async () => {
    const { chiedi, archivio, partitaId, stato } = await avviata();
    const chi = stato().turno.giocatore;
    expect(await chiedi(chi, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({ ok: true });
    expect(archivio.dati.stati.get(partitaId)!.versione).toBe(1);
    expect(archivio.dati.mosse).toEqual([{ partitaId, numero: 1, utente: chi, mossa: { tipo: "pescaNumero" } }]);
    const vista = archivio.dati.viste.get(`${partitaId}/${chi}`)!.vista as { mano: unknown[] };
    expect(vista.mano).toHaveLength(1);
  });

  it("fuori turno, malformata o di chi non gioca: rifiutata e nulla cambia", async () => {
    const { chiedi, archivio, partitaId, stato } = await avviata();
    const fuori = stato().turno.giocatore === A ? B : A;
    expect(await chiedi(fuori, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({
      ok: false,
      errore: "Non è il tuo turno",
    });
    const chi = stato().turno.giocatore;
    expect(await chiedi(chi, { azione: "mossa", partitaId, mossa: { tipo: "prendiNumero", posizione: "length" } })).toEqual({
      ok: false,
      errore: "Mossa non valida",
    });
    expect(await chiedi(C, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({
      ok: false,
      errore: "Partita non trovata",
    });
    expect(await chiedi(chi, { azione: "mossa", partitaId: "non-un-id", mossa: { tipo: "pescaNumero" } })).toMatchObject({ ok: false });
    expect(archivio.dati.stati.get(partitaId)!.versione).toBe(0);
  });

  it("due mosse contemporanee: la seconda trova la partita cambiata e viene respinta", async () => {
    const { archivio, partitaId, stato } = await avviata();
    const chi = stato().turno.giocatore;
    const salvaOriginale = archivio.salva;
    // Simula un'altra mossa salvata proprio mentre questa veniva calcolata.
    archivio.salva = async (p) => {
      archivio.dati.stati.get(partitaId)!.versione += 1;
      return salvaOriginale(p);
    };
    const r = await gestisci({ azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } }, chi, archivio, { casuale: Math.random });
    expect(r).toEqual({ ok: false, errore: "La partita è cambiata nel frattempo: riprova" });
  });

  it("una partita intera tra due bot, passando dall'arbitro, arriva alla fine", async () => {
    const { chiedi, archivio, partitaId, stato } = await avviata(7);
    const rng = creaCasuale(3);
    let passi = 0;
    while ((await archivio.leggiPartita(partitaId))!.stato === "in_corso") {
      const s = stato();
      const chi = s.turno.giocatore;
      const r = await chiedi(chi, { azione: "mossa", partitaId, mossa: mossaDelBot(s, chi, rng) });
      expect(r.ok, JSON.stringify(r)).toBe(true);
      expect(++passi).toBeLessThan(5000);
    }
    const finale = archivio.dati.partite.get(partitaId)!;
    expect(finale.stato).toBe("finita");
    expect(finale.esito).toMatchObject({ vincitori: expect.any(Array) });
    expect(await chiedi(A, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({
      ok: false,
      errore: "La partita è finita",
    });
  });
});

describe("chiusura automatica del turno", () => {
  it("dopo la terza mossa, senza altre scelte, tocca subito all'altro giocatore", async () => {
    const t = await partitaConDue(3);
    await t.chiedi(A, { azione: "avvia", partitaId: t.partitaId });
    const stato = () => t.archivio.dati.stati.get(t.partitaId)!.stato as StatoPartita;
    const chi = stato().turno.giocatore;
    const altro = chi === A ? B : A;
    for (let i = 0; i < 3; i++) {
      expect(await t.chiedi(chi, { azione: "mossa", partitaId: t.partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({ ok: true });
    }
    expect(stato().turno.giocatore).toBe(altro);
    expect(stato().turno.mosseRimaste).toBe(3);
    expect(t.archivio.dati.viste.get(`${t.partitaId}/${altro}`)!.mosse_valide.length).toBeGreaterThan(0);
  });
});

describe("spettatori e schermo tavolo", () => {
  it("si entra come spettatore col codice, anche a partita iniziata; si vede la vista pubblica, non si gioca", async () => {
    const t = await partitaConDue(6);
    await t.chiedi(A, { azione: "avvia", partitaId: t.partitaId });
    expect(await t.chiedi(C, { azione: "unisciti", codice: t.codice, nickname: "Carla" })).toMatchObject({ ok: false });
    expect(await t.chiedi(C, { azione: "guarda", codice: t.codice.toLowerCase() })).toEqual({ ok: true, partitaId: t.partitaId });
    expect([...t.archivio.dati.spettatori.get(t.partitaId)!]).toEqual([C]);
    // La vista pubblica è salvata e si aggiorna a ogni mossa
    const prima = t.archivio.dati.vistePubbliche.get(t.partitaId)!;
    expect(prima.vista).toMatchObject({ io: "", mano: [] });
    const s = t.archivio.dati.stati.get(t.partitaId)!.stato as StatoPartita;
    await t.chiedi(s.turno.giocatore, { azione: "mossa", partitaId: t.partitaId, mossa: { tipo: "pescaNumero" } });
    expect(t.archivio.dati.vistePubbliche.get(t.partitaId)!.versione).toBe(prima.versione + 1);
    // Lo spettatore non può muovere né mandare vocali
    expect(await t.chiedi(C, { azione: "mossa", partitaId: t.partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({
      ok: false,
      errore: "Partita non trovata",
    });
    expect(await t.chiedi(C, { azione: "vocale", partitaId: t.partitaId, audio: "QUFB", tipo: "audio/mp4", durataMs: 1000 })).toMatchObject({ ok: false });
  });

  it("chi gioca resta giocatore anche se apre il link come spettatore; codice sbagliato rifiutato", async () => {
    const t = await partitaConDue(6);
    expect(await t.chiedi(A, { azione: "guarda", codice: t.codice })).toEqual({ ok: true, partitaId: t.partitaId });
    expect(t.archivio.dati.spettatori.get(t.partitaId)).toBeUndefined();
    expect(await t.chiedi(C, { azione: "guarda", codice: "ZZZZZ" })).toEqual({ ok: false, errore: "Codice d'invito non valido" });
    expect(await t.chiedi(C, { azione: "guarda", codice: "<b>" })).toEqual({ ok: false, errore: "Codice d'invito non valido" });
  });
});

describe("messaggi vocali", () => {
  const audio = (byte: number) => btoa("A".repeat(byte));

  it("chi gioca manda un vocale: l'arbitro lo salva con chi l'ha mandato", async () => {
    const t = await partitaConDue(4);
    const r = await t.chiedi(B, { azione: "vocale", partitaId: t.partitaId, audio: audio(3000), tipo: "audio/webm;codecs=opus", durataMs: 2500 });
    expect(r).toMatchObject({ ok: true, id: expect.any(String) });
    expect(t.archivio.dati.vocali).toEqual([
      { id: expect.any(String), partitaId: t.partitaId, utente: B, byte: 3000, tipo: "audio/webm", durataMs: 2500 },
    ]);
  });

  it("rifiuta chi non è nella partita, formati strani, vocali troppo lunghi o troppo grandi", async () => {
    const t = await partitaConDue(4);
    const base = { azione: "vocale", partitaId: t.partitaId, audio: audio(100), tipo: "audio/mp4", durataMs: 1000 };
    expect(await t.chiedi(C, base)).toEqual({ ok: false, errore: "Partita non trovata" });
    expect(await t.chiedi(A, { ...base, tipo: "text/html" })).toEqual({ ok: false, errore: "Formato audio non supportato" });
    expect(await t.chiedi(A, { ...base, durataMs: 60000 })).toMatchObject({ ok: false });
    expect(await t.chiedi(A, { ...base, durataMs: 50 })).toMatchObject({ ok: false });
    expect(await t.chiedi(A, { ...base, audio: "non è base64!" })).toEqual({ ok: false, errore: "Vocale non valido" });
    expect(await t.chiedi(A, { ...base, audio: audio(450_000) })).toEqual({ ok: false, errore: "Vocale troppo grande" });
    expect(t.archivio.dati.vocali).toHaveLength(0);
  });
});

describe("avatar", () => {
  it("si sceglie creando o entrando; senza scelta si usa il mago; uno inventato è rifiutato", async () => {
    const { chiedi, archivio } = prepara();
    const r = await chiedi(A, { azione: "crea", nickname: "Anna", avatar: "volpe" });
    const { partitaId, codice } = r as unknown as { partitaId: string; codice: string };
    await chiedi(B, { azione: "unisciti", codice, nickname: "Bruno" });
    expect((await archivio.leggiPartita(partitaId))?.giocatori.map((g) => g.avatar)).toEqual(["volpe", "mago"]);
    expect(await chiedi(C, { azione: "unisciti", codice, nickname: "Carla", avatar: "<script>" })).toEqual({ ok: false, errore: "Avatar non valido" });
    expect(await chiedi(C, { azione: "crea", nickname: "Carla", avatar: 5 })).toEqual({ ok: false, errore: "Avatar non valido" });
  });
});

/** Fa muovere i giocatori del computer (una mossa per richiesta, come il browser) finché non tocca ad A. */
async function muovonoIRobot(chiedi: (u: string, r: unknown) => Promise<unknown>, archivio: ReturnType<typeof creaArchivioMemoria>, partitaId: string) {
  for (let i = 0; i < 500; i++) {
    const p = (await archivio.leggiPartita(partitaId))!;
    const s = archivio.dati.stati.get(partitaId)!.stato as StatoPartita;
    if (p.stato !== "in_corso" || s.turno.giocatore === A) return;
    expect(await chiedi(A, { azione: "turnoComputer", partitaId })).toMatchObject({ ok: true });
  }
  throw new Error("I robot non finiscono mai");
}

describe("partita di prova contro il computer", () => {
  it("parte subito con i bot; ogni richiesta fa fare al computer una sola mossa, poi torna a me", async () => {
    const { chiedi, archivio } = prepara(11);
    const r = await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 2 });
    expect(r).toMatchObject({ ok: true });
    const partitaId = (r as unknown as { partitaId: string }).partitaId;
    const p = (await archivio.leggiPartita(partitaId))!;
    expect(p.stato).toBe("in_corso");
    expect(p.giocatori.map((g) => [g.nickname, g.avatar, g.bot])).toEqual([
      ["Anna", "mago", false],
      ["Computer 1", "robot", true],
      ["Computer 2", "robot", true],
    ]);
    const stato = () => archivio.dati.stati.get(partitaId)!.stato as StatoPartita;
    // Se il sorteggio fa partire un bot, muove solo quando glielo si chiede
    await muovonoIRobot(chiedi, archivio, partitaId);
    expect(stato().turno.giocatore).toBe(A);
    expect(await chiedi(A, { azione: "turnoComputer", partitaId })).toEqual({ ok: false, errore: "Non tocca al computer" });
    for (let i = 0; i < 3; i++) {
      expect(await chiedi(A, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({ ok: true });
    }
    // Dopo la mia mossa il computer non ha ancora mosso: tocca a lui
    expect(stato().turno.giocatore).not.toBe(A);
    const prima = stato().registro.length;
    expect(await chiedi(A, { azione: "turnoComputer", partitaId })).toEqual({ ok: true });
    expect(stato().registro.length).toBe(prima + 1);
    await muovonoIRobot(chiedi, archivio, partitaId);
    expect(stato().turno.giocatore).toBe(A);
    expect(stato().numeroTurno).toBe(stato().ordine.indexOf(A) + 3);
    expect(stato().registro.some((e) => e.giocatore !== A)).toBe(true);
  });

  it("una partita intera contro 3 bot arriva alla fine", async () => {
    const { chiedi, archivio } = prepara(5);
    const r = await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 3 });
    const partitaId = (r as unknown as { partitaId: string }).partitaId;
    const rng = creaCasuale(9);
    let passi = 0;
    while ((await archivio.leggiPartita(partitaId))!.stato === "in_corso") {
      await muovonoIRobot(chiedi, archivio, partitaId);
      if ((await archivio.leggiPartita(partitaId))!.stato !== "in_corso") break;
      const s = archivio.dati.stati.get(partitaId)!.stato as StatoPartita;
      expect(s.turno.giocatore).toBe(A);
      const r2 = await chiedi(A, { azione: "mossa", partitaId, mossa: mossaDelBot(s, A, rng) });
      expect(r2.ok, JSON.stringify(r2)).toBe(true);
      expect(++passi).toBeLessThan(3000);
    }
    expect(archivio.dati.partite.get(partitaId)!.esito).toMatchObject({ vincitori: expect.any(Array) });
  });

  it("chi non è nella partita non può far muovere il computer", async () => {
    const { chiedi } = prepara(3);
    const r = await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 1 });
    const partitaId = (r as unknown as { partitaId: string }).partitaId;
    expect(await chiedi(B, { azione: "turnoComputer", partitaId })).toEqual({ ok: false, errore: "Partita non trovata" });
  });

  it("numero di bot non valido", async () => {
    const { chiedi } = prepara();
    expect(await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 0 })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 5 })).toMatchObject({ ok: false });
  });
});

describe("robot fissi", () => {
  it("due partite di prova usano gli stessi giocatori del computer", async () => {
    const { chiedi, archivio } = prepara(21);
    const id1 = ((await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 2 })) as unknown as { partitaId: string }).partitaId;
    const id2 = ((await chiedi(B, { azione: "controComputer", nickname: "Bruno", bot: 3 })) as unknown as { partitaId: string }).partitaId;
    const robot = async (id: string) => (await archivio.leggiPartita(id))!.giocatori.filter((g) => g.bot).map((g) => g.utenteId);
    expect(await robot(id1)).toEqual(["bot-1", "bot-2"]);
    expect(await robot(id2)).toEqual(["bot-1", "bot-2", "bot-3"]);
  });
});

describe("gioco Ufficio (clone di Il Portale)", () => {
  it("si crea una partita di Ufficio, anche contro il computer, e si gioca", async () => {
    const { chiedi, archivio } = prepara(21);
    const r = await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 1, gioco: "ufficio" });
    expect(r).toMatchObject({ ok: true });
    const partitaId = (r as unknown as { partitaId: string }).partitaId;
    expect(archivio.dati.partite.get(partitaId)!.gioco).toBe("ufficio");
    expect(archivio.dati.vistePubbliche.get(partitaId)).toBeDefined();
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", gioco: "scacchi" })).toEqual({ ok: false, errore: "Gioco sconosciuto" });
  });
});

describe("partite aperte (lista nella pagina iniziale)", () => {
  it("elenca le partite in attesa non piene e pubbliche; non quelle private, piene, avviate o contro il computer", async () => {
    const { chiedi } = prepara(31);
    const crea = async (u: string, r: Record<string, unknown>) => (await chiedi(u, { azione: "crea", ...r })) as { ok: true; codice: string };
    const aperta = await crea(A, { nickname: "Anna", maxGiocatori: 3 });
    const privata = await crea(A, { nickname: "Anna", pubblica: false });
    const piena = await crea(B, { nickname: "Bruno", maxGiocatori: 2 });
    await chiedi(C, { azione: "unisciti", codice: piena.codice, nickname: "Carla" });
    await chiedi(C, { azione: "controComputer", nickname: "Carla", bot: 1 });
    const r = (await chiedi(C, { azione: "aperte" })) as unknown as { ok: true; partite: { codice: string; creatore: string; giocatori: number; maxGiocatori: number; gioco: string }[] };
    expect(r.ok).toBe(true);
    expect(r.partite.map((p) => p.codice)).toEqual([aperta.codice]);
    expect(r.partite[0]).toMatchObject({ creatore: "Anna", giocatori: 1, maxGiocatori: 3, gioco: "primo-gioco" });
    expect(privata.ok).toBe(true);
    // entrando col codice della lista si gioca
    expect(await chiedi(B, { azione: "unisciti", codice: aperta.codice, nickname: "Bruno" })).toMatchObject({ ok: true });
  });

  it("pubblica deve essere sì/no", async () => {
    const { chiedi } = prepara(32);
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", pubblica: "forse" })).toEqual({ ok: false, errore: "Richiesta non valida" });
  });
});

describe("avatar unici nella partita", () => {
  it("non si entra con l'avatar di un altro giocatore; con un altro sì", async () => {
    const t = prepara(41);
    const creata = (await t.chiedi(A, { azione: "crea", nickname: "Anna", avatar: "volpe" })) as { ok: true; codice: string };
    expect(await t.chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno", avatar: "volpe" })).toEqual({
      ok: false,
      errore: "Questo avatar ce l'ha già un altro giocatore: scegline un altro",
    });
    expect(await t.chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno", avatar: "lupo" })).toMatchObject({ ok: true });
    // senza scegliere si prende il predefinito (mago): se è libero va bene
    expect(await t.chiedi(C, { azione: "unisciti", codice: creata.codice, nickname: "Carla" })).toMatchObject({ ok: true });
  });

  it("contro il computer i robot hanno tutti lo stesso avatar", async () => {
    const t = prepara(42);
    expect(await t.chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 3 })).toMatchObject({ ok: true });
  });
});


describe("il computer gioca al posto di chi è fermo", () => {
  /** Partita tra A e B con un orologio finto che i test spostano in avanti. */
  async function conOrologio(opzioni?: Record<string, unknown>) {
    let adesso = 1_000_000;
    const archivio = creaArchivioMemoria(() => adesso);
    const rng = creaCasuale(3);
    const amb: Ambiente = { casuale: () => prossimo(rng), ora: () => adesso };
    const chiedi = (utente: string, richiesta: unknown) => gestisci(richiesta, utente, archivio, amb);
    const creata = (await chiedi(A, { azione: "crea", nickname: "Anna", ...(opzioni ? { opzioni } : {}) })) as unknown as { partitaId: string; codice: string };
    const partitaId = creata.partitaId;
    await chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno" });
    await chiedi(A, { azione: "avvia", partitaId });
    const stato = () => archivio.dati.stati.get(partitaId)!.stato as StatoPartita;
    const avanti = (ms: number) => {
      adesso += ms;
    };
    return { chiedi, partitaId, stato, avanti };
  }

  it("prima dei 60 secondi non fa niente e dice quanto manca", async () => {
    const { chiedi, partitaId, stato, avanti } = await conOrologio();
    avanti(45_000);
    const prima = stato().registro.length;
    expect(await chiedi(A, { azione: "alPosto", partitaId })).toEqual({ ok: true, fatto: false, attendiMs: 15_000, alPosto: false });
    expect(stato().registro.length).toBe(prima);
  });

  it("dopo 60 secondi fa una mossa per chi è di turno, poi una ogni 10 secondi", async () => {
    const { chiedi, partitaId, stato, avanti } = await conOrologio();
    const fermo = stato().turno.giocatore;
    const altro = fermo === A ? B : A;
    avanti(60_000);
    // lo può chiedere chiunque giochi, anche l'altro giocatore
    expect(await chiedi(altro, { azione: "alPosto", partitaId })).toMatchObject({ ok: true, fatto: true, attendiMs: 10_000 });
    expect(stato().turno.mosseRimaste).toBe(2);
    expect(stato().registro.at(-1)!.giocatore).toBe(fermo);
    avanti(5_000);
    expect(await chiedi(altro, { azione: "alPosto", partitaId })).toMatchObject({ fatto: false, attendiMs: 5_000, alPosto: true });
    avanti(5_000);
    expect(await chiedi(altro, { azione: "alPosto", partitaId })).toMatchObject({ fatto: true });
    expect(stato().turno.mosseRimaste).toBe(1);
  });

  it("se la persona torna a muovere, si ricomincia dai 60 secondi", async () => {
    const { chiedi, partitaId, stato, avanti } = await conOrologio();
    const fermo = stato().turno.giocatore;
    avanti(60_000);
    await chiedi(fermo, { azione: "alPosto", partitaId });
    expect(await chiedi(fermo, { azione: "mossa", partitaId, mossa: { tipo: "pescaNumero" } })).toEqual({ ok: true });
    avanti(10_000);
    expect(await chiedi(fermo, { azione: "alPosto", partitaId })).toMatchObject({ fatto: false, attendiMs: 50_000 });
  });

  it("finite le mosse chiude il turno; al turno dopo si aspettano di nuovo 60 secondi", async () => {
    const { chiedi, partitaId, stato, avanti } = await conOrologio();
    const fermo = stato().turno.giocatore;
    avanti(60_000);
    for (let i = 0; i < 10 && stato().turno.giocatore === fermo; i++) {
      expect(await chiedi(fermo, { azione: "alPosto", partitaId })).toMatchObject({ ok: true, fatto: true });
      avanti(10_000);
    }
    expect(stato().turno.giocatore).not.toBe(fermo);
    expect(await chiedi(fermo, { azione: "alPosto", partitaId })).toMatchObject({ fatto: false, attendiMs: 50_000 });
  });

  it("non vale per i giocatori del computer né per chi non è nella partita", async () => {
    const { chiedi, partitaId, avanti } = await conOrologio();
    avanti(60_000);
    expect(await chiedi(C, { azione: "alPosto", partitaId })).toEqual({ ok: false, errore: "Partita non trovata" });
    const t = prepara(3);
    const r = await t.chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 1 });
    const id = (r as unknown as { partitaId: string }).partitaId;
    const s = t.archivio.dati.stati.get(id)!.stato as StatoPartita;
    if (s.turno.giocatore !== A) {
      t.archivio.dati.stati.get(id)!.aggiornatoIl -= 60_000;
      expect(await t.chiedi(A, { azione: "alPosto", partitaId: id })).toEqual({ ok: false, errore: "Non tocca a una persona" });
    }
  });
});

describe("opzione: il computer gioca al posto di chi è fermo (sì / no)", () => {
  it("chi crea la partita può disattivarla: allora il computer non gioca mai al posto di nessuno", async () => {
    let adesso = 1_000_000;
    const archivio = creaArchivioMemoria(() => adesso);
    const rng = creaCasuale(3);
    const chiedi = (u: string, r: unknown) => gestisci(r, u, archivio, { casuale: () => prossimo(rng), ora: () => adesso });
    const creata = (await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { computerAlPosto: false } })) as unknown as { partitaId: string; codice: string };
    await chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno" });
    expect(await chiedi(A, { azione: "avvia", partitaId: creata.partitaId })).toEqual({ ok: true });
    // l'opzione resta della partita: non entra nelle regole del gioco
    const stato = archivio.dati.stati.get(creata.partitaId)!.stato as StatoPartita;
    expect(stato.opzioni).not.toHaveProperty("computerAlPosto");
    adesso += 120_000;
    expect(await chiedi(A, { azione: "alPosto", partitaId: creata.partitaId })).toEqual({
      ok: false,
      errore: "In questa partita il computer non gioca al posto di nessuno",
    });
  });

  it("accetta solo sì o no", async () => {
    const { chiedi } = prepara();
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { computerAlPosto: "forse" } })).toEqual({ ok: false, errore: "Opzioni non valide" });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { computerAlPosto: true } })).toMatchObject({ ok: true });
  });
});

describe("gioco La Famiglia", () => {
  it("una partita contro il computer, passando dall'arbitro, arriva alla fine", async () => {
    const { chiedi, archivio } = prepara(31);
    const r = (await chiedi(A, { azione: "controComputer", nickname: "Anna", bot: 2, gioco: "famiglia" })) as unknown as { partitaId: string };
    const partitaId = r.partitaId;
    const rng = creaCasuale(7);
    const casuale = () => prossimo(rng);
    for (let i = 0; i < 3000 && archivio.dati.partite.get(partitaId)!.stato !== "finita"; i++) {
      const stato = archivio.dati.stati.get(partitaId)!.stato as StatoFamiglia;
      const chi = giocoFamiglia.diTurno!(stato);
      const risposta =
        chi === A
          ? await chiedi(A, { azione: "mossa", partitaId, mossa: giocoFamiglia.mossaBot!(stato, A, casuale) })
          : await chiedi(A, { azione: "turnoComputer", partitaId });
      expect(risposta).toMatchObject({ ok: true });
    }
    expect(archivio.dati.partite.get(partitaId)!.stato).toBe("finita");
  });

  it("opzioni della Famiglia: come finisce e secondi per difendersi (solo per questo gioco)", async () => {
    const { chiedi, archivio } = prepara(32);
    const ok = (await chiedi(A, { azione: "crea", nickname: "Anna", gioco: "famiglia", opzioni: { modoFine: "mazzo", secondiDifesa: 20 } })) as unknown as {
      partitaId: string;
    };
    expect(archivio.dati.partite.get(ok.partitaId)!.opzioni).toEqual({ modoFine: "mazzo", secondiDifesa: 20 });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", gioco: "famiglia", opzioni: { modoFine: "boh" } })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", gioco: "famiglia", opzioni: { secondiDifesa: 5 } })).toMatchObject({ ok: false });
    expect(await chiedi(A, { azione: "crea", nickname: "Anna", opzioni: { modoFine: "mazzo" } })).toMatchObject({ ok: false });
  });

  it("chi è attaccato ha un tempo per difendersi: poi l'attacco passa, anche senza il computer al posto di chi è fermo", async () => {
    let adesso = 1_000_000;
    const archivio = creaArchivioMemoria(() => adesso);
    const rng = creaCasuale(5);
    const amb: Ambiente = { casuale: () => prossimo(rng), ora: () => adesso };
    const chiedi = (utente: string, richiesta: unknown) => gestisci(richiesta, utente, archivio, amb);
    const creata = (await chiedi(A, {
      azione: "crea",
      nickname: "Anna",
      gioco: "famiglia",
      opzioni: { computerAlPosto: false, secondiDifesa: 10 },
    })) as unknown as { partitaId: string; codice: string };
    const partitaId = creata.partitaId;
    await chiedi(B, { azione: "unisciti", codice: creata.codice, nickname: "Bruno" });
    await chiedi(A, { azione: "avvia", partitaId });
    // Si prepara la situazione: anna di turno con Totò (Freeeeeezee), bruno con Christian (Che paura!)
    const salvato = archivio.dati.stati.get(partitaId)!;
    const s = salvato.stato as StatoFamiglia;
    s.ordine = [A, B];
    s.turno.giocatore = A;
    s.turno.mosseRimaste = 3;
    s.giocatori[A]!.attivati.push({ copia: { id: "toto-1#1", carta: "toto-1" }, stanca: 0 });
    s.giocatori[B]!.attivati.push({ copia: { id: "gerardina-1#1", carta: "gerardina-1" }, stanca: 0 });
    expect(await chiedi(A, { azione: "mossa", partitaId, mossa: { tipo: "potere", carta: "toto-1#1", potere: "si-incanta", giocatore: B } })).toMatchObject({ ok: true });
    expect((archivio.dati.stati.get(partitaId)!.stato as StatoFamiglia).turno.attesa).toEqual({ tipo: "difesa", giocatore: B });

    adesso += 4_000;
    expect(await chiedi(A, { azione: "alPosto", partitaId })).toEqual({ ok: true, fatto: false, attendiMs: 6_000, alPosto: false });
    adesso += 6_000;
    expect(await chiedi(A, { azione: "alPosto", partitaId })).toMatchObject({ ok: true, fatto: true });
    const dopo = archivio.dati.stati.get(partitaId)!.stato as StatoFamiglia;
    expect(dopo.turno.attesa).toBeNull();
    expect(dopo.giocatori[B]!.mosseProssimoTurno).toBe(-1);
    // Di nuovo il turno di anna: senza il computer al posto di chi è fermo, nessuno muove per lei
    adesso += 120_000;
    expect(await chiedi(B, { azione: "alPosto", partitaId })).toMatchObject({ ok: false });
  });
});
