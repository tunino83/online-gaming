/**
 * Confronto tra due modi di giocare, per capire se conviene più attivare carte o usare i poteri:
 * - "attivatore": attiva un personaggio appena può; usa i poteri solo ogni tanto;
 * - "poteri": usa i poteri appena può (attacchi, aiuti); attiva solo quando non ha poteri da usare.
 * Tutti e due si difendono quando possono e per il resto scelgono a caso.
 * Si fanno giocare uno contro l'altro (in 2 e in 4, alternando chi comincia) con diverse varianti delle regole.
 */
import { creaCasuale, prossimo } from "@og/engine";
import type { OpzioniPartita } from "./parametri";
import { applicaMossa, chiDeveMuovere, finePartita, mossaAutomatica, mosseValide, puntiDi, setup } from "./regole";
import type { Mossa, StatoPartita } from "./stato";

export type Strategia = "attivatore" | "poteri";

const aCaso = <T>(lista: T[], casuale: () => number): T => lista[Math.floor(casuale() * lista.length)]!;

/** Mossa di un robot con la strategia indicata. */
export function mossaConStrategia(s: StatoPartita, chi: string, strategia: Strategia, casuale: () => number): Mossa {
  const mosse = mosseValide(s, chi);
  if (mosse.length === 0) throw new Error("Il robot non ha mosse");
  // Attaccato: si difende se può
  if (s.turno.attesa?.tipo === "difesa") {
    const difese = mosse.filter((m) => m.tipo === "difendi");
    return aCaso(difese.length > 0 ? difese : mosse, casuale);
  }
  if (s.turno.attesa) return aCaso(mosse, casuale);
  const attiva = mosse.filter((m) => m.tipo === "attiva");
  const poteri = mosse.filter((m) => m.tipo === "potere" || m.tipo === "usaCarta");
  if (strategia === "attivatore") {
    if (attiva.length > 0) return aCaso(attiva, casuale);
    if (poteri.length > 0 && casuale() < 0.25) return aCaso(poteri, casuale);
  } else {
    if (poteri.length > 0) return aCaso(poteri, casuale);
    if (attiva.length > 0) return aCaso(attiva, casuale);
  }
  const normali = mosse.filter((m) => m.tipo !== "caffe" && m.tipo !== "potere" && m.tipo !== "usaCarta");
  return aCaso(normali.length > 0 ? normali : mosse, casuale);
}

export interface EsitoConfronto {
  vincitori: Strategia[];
  turni: number;
  /** Punti medi per strategia in questa partita. */
  punti: Record<Strategia, number>;
  /** Punti guadagnati con i poteri (variante), per strategia. */
  puntiPoteri: Record<Strategia, number>;
  errore?: string;
}

/** Una partita tra robot con le strategie indicate (in ordine di posto). */
export function partitaConfronto(seed: number, strategie: Strategia[], opzioni: Partial<OpzioniPartita>): EsitoConfronto {
  const ids = strategie.map((_, i) => `bot${i + 1}`);
  const rng = creaCasuale(seed * 7919 + 3);
  let s = setup(ids, opzioni, seed);
  // L'ordine di gioco è sorteggiato: le strategie seguono i posti sorteggiati
  const strategiaDi = new Map(s.ordine.map((id, i) => [id, strategie[i]!]));
  let errore: string | undefined;
  try {
    while (!s.finita && s.numeroTurno < 600) {
      const auto = mossaAutomatica(s);
      const chi = auto?.giocatore ?? chiDeveMuovere(s);
      const mossa = auto?.mossa ?? mossaConStrategia(s, chi, strategiaDi.get(chi)!, () => prossimo(rng));
      const r = applicaMossa(s, chi, mossa);
      if (!r.ok) throw new Error(`Mossa rifiutata: ${r.errore}`);
      s = r.stato;
    }
  } catch (e) {
    errore = e instanceof Error ? e.message : String(e);
  }
  const esito = finePartita(s);
  const somma = (st: Strategia, f: (id: string) => number) => {
    const chi = s.ordine.filter((id) => strategiaDi.get(id) === st);
    return chi.reduce((t, id) => t + f(id), 0) / Math.max(1, chi.length);
  };
  return {
    vincitori: esito ? esito.vincitori.map((id) => strategiaDi.get(id)!) : [],
    turni: s.numeroTurno + 1,
    punti: {
      attivatore: somma("attivatore", (id) => puntiDi(s.giocatori[id]!, s.opzioni)),
      poteri: somma("poteri", (id) => puntiDi(s.giocatori[id]!, s.opzioni)),
    },
    puntiPoteri: {
      attivatore: somma("attivatore", (id) => s.giocatori[id]!.puntiPoteri ?? 0),
      poteri: somma("poteri", (id) => s.giocatori[id]!.puntiPoteri ?? 0),
    },
    ...(errore ? { errore } : {}),
  };
}

export interface RisultatoVariante {
  nome: string;
  giocatori: number;
  partite: number;
  errori: number;
  /** Percentuale di vittorie della strategia "poteri" (pareggi divisi). */
  vittoriePoteri: number;
  turniMedi: number;
  puntiMedi: Record<Strategia, number>;
  puntiPoteriMedi: Record<Strategia, number>;
}

/** `n` partite con metà giocatori per strategia, alternando chi comincia. */
export function confronta(nome: string, opzioni: Partial<OpzioniPartita>, giocatori: 2 | 4, n: number, seedIniziale = 50_000): RisultatoVariante {
  let vittorie = 0;
  let finite = 0;
  let errori = 0;
  let turni = 0;
  const punti = { attivatore: 0, poteri: 0 };
  const puntiPoteri = { attivatore: 0, poteri: 0 };
  for (let i = 0; i < n; i++) {
    const base: Strategia[] = giocatori === 2 ? ["attivatore", "poteri"] : ["attivatore", "poteri", "attivatore", "poteri"];
    const strategie = i % 2 === 0 ? base : (base.map((x) => (x === "attivatore" ? "poteri" : "attivatore")) as Strategia[]);
    const e = partitaConfronto(seedIniziale + i, strategie, opzioni);
    if (e.errore || e.vincitori.length === 0) {
      errori++;
      continue;
    }
    finite++;
    vittorie += e.vincitori.filter((x) => x === "poteri").length / e.vincitori.length;
    turni += e.turni;
    for (const st of ["attivatore", "poteri"] as const) {
      punti[st] += e.punti[st];
      puntiPoteri[st] += e.puntiPoteri[st];
    }
  }
  const media = (x: number) => x / Math.max(1, finite);
  return {
    nome,
    giocatori,
    partite: finite,
    errori,
    vittoriePoteri: (100 * vittorie) / Math.max(1, finite),
    turniMedi: media(turni),
    puntiMedi: { attivatore: media(punti.attivatore), poteri: media(punti.poteri) },
    puntiPoteriMedi: { attivatore: media(puntiPoteri.attivatore), poteri: media(puntiPoteri.poteri) },
  };
}

/** Le varianti da confrontare. */
export const VARIANTI: { nome: string; opzioni: Partial<OpzioniPartita> }[] = [
  { nome: "Regole di adesso", opzioni: {} },
  { nome: "Aiuti senza punti + punti per i poteri (anche aiuti)", opzioni: { aiutiSenzaPunti: true, puntiPerIPoteri: true } },
  {
    nome: "C1: aiuti senza punti + punti solo per attacchi e difese",
    opzioni: { aiutiSenzaPunti: true, puntiPerIPoteri: true, puntiPerGliAiuti: false },
  },
  {
    nome: "C1 a 25 punti",
    opzioni: { aiutiSenzaPunti: true, puntiPerIPoteri: true, puntiPerGliAiuti: false, puntiPerVincere: 25 },
  },
  { nome: "Punti solo per attacchi e difese (aiuti con i punti)", opzioni: { puntiPerIPoteri: true, puntiPerGliAiuti: false } },
];

const n1 = (x: number) => x.toFixed(1).replace(".", ",");

/** Resoconto in italiano (Markdown). */
export function rapportoConfronto(risultati: RisultatoVariante[], partite: number): string {
  const r: string[] = [];
  r.push("# La Famiglia – conviene attivare o usare i poteri?");
  r.push("");
  r.push("Due tipi di robot giocano uno contro l'altro:");
  r.push("- **attivatore**: attiva un personaggio appena può e usa i poteri solo ogni tanto;");
  r.push("- **poteri**: usa i poteri appena può (attacchi e aiuti) e attiva solo quando non ha poteri da usare.");
  r.push("");
  r.push("Tutti e due si difendono quando possono; per il resto scelgono a caso. In 2 giocatori uno contro uno, in 4 due contro due,");
  r.push(`alternando chi comincia: ${partite} partite per ogni riga. Se le due strategie si equivalgono, "poteri" vince il 50%.`);
  r.push("");
  r.push("| Variante delle regole | Giocatori | Vince \"poteri\" | Turni medi | Punti medi attivatore | Punti medi poteri | di cui dai poteri (poteri) |");
  r.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const x of risultati) {
    r.push(
      `| ${x.nome} | ${x.giocatori} | **${Math.round(x.vittoriePoteri)}%** | ${n1(x.turniMedi)} | ${n1(x.puntiMedi.attivatore)} | ${n1(x.puntiMedi.poteri)} | ${n1(x.puntiPoteriMedi.poteri)} |`,
    );
  }
  r.push("");
  r.push("- **Aiuti senza punti**: le carte che hanno solo poteri di aiuto (✨, anche blu) valgono 0 punti.");
  r.push("- **Punti per i poteri**: 1 punto quando un tuo attacco colpisce (una volta per attacco), quando una tua difesa");
  r.push("  ferma un attacco, e (se non è detto \"solo attacchi e difese\") al primo aiuto usato in ogni turno.");
  r.push("- **Una attivazione per turno**: al massimo 1 personaggio attivato per turno.");
  r.push("");
  r.push("> I robot giocano molto peggio delle persone: contano le differenze tra le righe, non i numeri esatti.");
  r.push("");
  return r.join("\n");
}
