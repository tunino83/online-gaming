/**
 * Simulazione di molte partite tra bot, con statistiche.
 * Serve a trovare errori (mosse proposte ma rifiutate, blocchi, eccezioni) e squilibri.
 */
import { creaCasuale } from "@og/engine";
import { mossaDelBot } from "./bot";
import type { OpzioniPartita } from "./parametri";
import { PERSONAGGI } from "./personaggi";
import { applicaMossa, finePartita, setup } from "./regole";
import type { StatoPartita } from "./stato";

/** Oltre questo numero di turni una partita si considera bloccata. */
export const TURNI_MASSIMI = 1000;

export interface RisultatoPartita {
  seed: number;
  giocatori: number;
  finita: boolean;
  errore?: string;
  turni: number;
  mosse: number;
  punti: number[];
  /** Punti di ogni giocatore nell'ordine di gioco (1°, 2°, ...). */
  puntiPerPosizione: number[];
  /** Posizioni nell'ordine di gioco dei vincitori (0 = primo). */
  posizioniVincitori: number[];
  attivazioni: Record<string, number>;
}

export function simulaPartita(seed: number, numeroGiocatori: number, opzioni: Partial<OpzioniPartita> = {}): RisultatoPartita {
  const ids = Array.from({ length: numeroGiocatori }, (_, i) => `bot${i + 1}`);
  const rng = creaCasuale(seed * 7919 + 1);
  let s: StatoPartita = setup(ids, opzioni, seed);
  const attivazioni: Record<string, number> = {};
  let mosse = 0;
  let errore: string | undefined;

  try {
    while (!s.finita && s.numeroTurno < TURNI_MASSIMI) {
      const chi = s.turno.giocatore;
      const mossa = mossaDelBot(s, chi, rng);
      if (mossa.tipo === "attiva") {
        const carta = Object.values(s.giocatori)
          .flatMap((g) => g.posti)
          .find((c) => c.id === mossa.carta);
        if (carta) attivazioni[carta.personaggio] = (attivazioni[carta.personaggio] ?? 0) + 1;
      }
      const r = applicaMossa(s, chi, mossa);
      if (!r.ok) throw new Error(`Mossa proposta ma rifiutata: ${r.errore} (${JSON.stringify(mossa)})`);
      s = r.stato;
      mosse++;
    }
  } catch (e) {
    errore = e instanceof Error ? e.message : String(e);
  }

  const esito = finePartita(s);
  const puntiPerPosizione = s.ordine.map((id) => s.giocatori[id]!.punti);
  return {
    seed,
    giocatori: numeroGiocatori,
    finita: esito !== null,
    ...(errore ? { errore } : {}),
    turni: s.numeroTurno + 1,
    mosse,
    punti: puntiPerPosizione,
    puntiPerPosizione,
    posizioniVincitori: esito ? esito.vincitori.map((id) => s.ordine.indexOf(id)) : [],
    attivazioni,
  };
}

export interface Statistiche {
  partite: number;
  finite: number;
  errori: { seed: number; giocatori: number; errore: string }[];
  bloccate: number[];
  pareggi: number;
  perNumeroGiocatori: Record<
    number,
    {
      partite: number;
      turniMedi: number;
      giriMedi: number;
      turniMin: number;
      turniMax: number;
      mosseMedie: number;
      puntiMediVincitore: number;
      puntiMediTutti: number;
      /** Percentuale di vittorie per posizione nell'ordine di gioco. */
      vittoriePerPosizione: number[];
    }
  >;
  personaggi: {
    id: string;
    nome: string;
    copie: number;
    attivazioniTotali: number;
    mediaPerPartita: number;
    /** Percentuale di partite in cui è stato attivato almeno una volta. */
    percentualePartite: number;
  }[];
}

const media = (v: number[]) => (v.length === 0 ? 0 : v.reduce((a, b) => a + b, 0) / v.length);

/** Simula `n` partite, con numero di giocatori a rotazione da 2 a 5. */
export function simula(n: number, opzioni: Partial<OpzioniPartita> = {}, seedIniziale = 1): Statistiche {
  const risultati = Array.from({ length: n }, (_, i) => simulaPartita(seedIniziale + i, 2 + (i % 4), opzioni));
  return statistiche(risultati);
}

export function statistiche(risultati: RisultatoPartita[]): Statistiche {
  const finite = risultati.filter((r) => r.finita && !r.errore);
  const perNumero: Statistiche["perNumeroGiocatori"] = {};
  for (let g = 2; g <= 5; g++) {
    const gruppo = finite.filter((r) => r.giocatori === g);
    if (gruppo.length === 0) continue;
    const vittorie = Array.from({ length: g }, () => 0);
    for (const r of gruppo) for (const p of r.posizioniVincitori) vittorie[p]! += 1 / r.posizioniVincitori.length;
    perNumero[g] = {
      partite: gruppo.length,
      turniMedi: media(gruppo.map((r) => r.turni)),
      giriMedi: media(gruppo.map((r) => r.turni / g)),
      turniMin: Math.min(...gruppo.map((r) => r.turni)),
      turniMax: Math.max(...gruppo.map((r) => r.turni)),
      mosseMedie: media(gruppo.map((r) => r.mosse)),
      puntiMediVincitore: media(gruppo.map((r) => Math.max(...r.punti))),
      puntiMediTutti: media(gruppo.flatMap((r) => r.punti)),
      vittoriePerPosizione: vittorie.map((v) => (100 * v) / gruppo.length),
    };
  }
  return {
    partite: risultati.length,
    finite: finite.length,
    errori: risultati.filter((r) => r.errore).map((r) => ({ seed: r.seed, giocatori: r.giocatori, errore: r.errore! })),
    bloccate: risultati.filter((r) => !r.finita && !r.errore).map((r) => r.seed),
    pareggi: finite.filter((r) => r.posizioniVincitori.length > 1).length,
    perNumeroGiocatori: perNumero,
    personaggi: PERSONAGGI.map((p) => {
      const conteggi = finite.map((r) => r.attivazioni[p.id] ?? 0);
      return {
        id: p.id,
        nome: p.nome,
        copie: p.copie,
        attivazioniTotali: conteggi.reduce((a, b) => a + b, 0),
        mediaPerPartita: media(conteggi),
        percentualePartite: (100 * conteggi.filter((c) => c > 0).length) / Math.max(1, finite.length),
      };
    }),
  };
}

/** Rapporto leggibile in Markdown. */
export function rapporto(st: Statistiche): string {
  const f1 = (x: number) => x.toFixed(1);
  const righe: string[] = [];
  righe.push("# Statistiche della simulazione", "");
  righe.push(`- Partite simulate: **${st.partite}** (giocatori da 2 a 5, a rotazione)`);
  righe.push(`- Finite correttamente: **${st.finite}**`);
  righe.push(`- Con errori: **${st.errori.length}**`);
  righe.push(`- Bloccate (oltre ${TURNI_MASSIMI} turni): **${st.bloccate.length}**`);
  righe.push(`- Pareggi: **${st.pareggi}** (${f1((100 * st.pareggi) / Math.max(1, st.finite))}%)`, "");
  if (st.errori.length > 0) {
    righe.push("## Errori (primi 10)", "");
    for (const e of st.errori.slice(0, 10)) righe.push(`- seed ${e.seed}, ${e.giocatori} giocatori: ${e.errore}`);
    righe.push("");
  }
  righe.push("## Durata e punti per numero di giocatori", "");
  righe.push("| Giocatori | Partite | Turni medi (min–max) | Giri medi | Mosse medie | Punti vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |");
  righe.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const [g, d] of Object.entries(st.perNumeroGiocatori)) {
    righe.push(
      `| ${g} | ${d.partite} | ${f1(d.turniMedi)} (${d.turniMin}–${d.turniMax}) | ${f1(d.giriMedi)} | ${f1(d.mosseMedie)} | ${f1(d.puntiMediVincitore)} | ${f1(d.puntiMediTutti)} | ${d.vittoriePerPosizione.map((v) => `${f1(v)}%`).join(", ")} |`,
    );
  }
  righe.push("", "## Attivazioni dei personaggi", "");
  righe.push("Ordinati dal più attivato al meno attivato. \"Partite\" = percentuale di partite in cui è stato attivato almeno una volta.", "");
  righe.push("| Personaggio | Copie | Attivazioni | Media per partita | Partite |");
  righe.push("| --- | --- | --- | --- | --- |");
  for (const p of [...st.personaggi].sort((a, b) => b.attivazioniTotali - a.attivazioniTotali)) {
    righe.push(`| ${p.nome} | ${p.copie} | ${p.attivazioniTotali} | ${p.mediaPerPartita.toFixed(2)} | ${f1(p.percentualePartite)}% |`);
  }
  return righe.join("\n") + "\n";
}
