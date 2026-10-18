import { creaCasuale, prossimo } from "@og/engine";
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
