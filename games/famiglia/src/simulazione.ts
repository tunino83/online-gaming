/**
 * Simulazione di molte partite della Famiglia tra robot, con statistiche sul bilanciamento.
 * Serve a trovare errori (mosse proposte ma rifiutate, partite bloccate) e squilibri: carte attivate
 * troppo o troppo poco, carte che fanno vincere più delle altre, attacchi e difese, vantaggio di chi comincia.
 * I robot scelgono a caso (preferendo attivare): i numeri mostrano squilibri grossi, non sostituiscono le partite vere.
 */
import { creaCasuale, prossimo } from "@og/engine";
import { mossaDelBot } from "./bot";
import { CARTE, carta } from "./carte";
import { descriviCodice } from "./codici";
import { EVENTI } from "./eventi";
import type { OpzioniPartita } from "./parametri";
import { applicaMossa, chiDeveMuovere, finePartita, mossaAutomatica, puntiDi, setup } from "./regole";
import type { StatoPartita } from "./stato";

/** Oltre questo numero di turni una partita si considera bloccata. */
export const TURNI_MASSIMI = 600;

/** Id della carta da quello della copia ("antonio-2#1" → "antonio-2"). */
const cartaDiCopia = (idCopia: string) => idCopia.split("#")[0]!;

/** Contatore per chiave. */
type Conteggi = Record<string, number>;
const conta = (c: Conteggi, chiave: string, quanto = 1) => {
  c[chiave] = (c[chiave] ?? 0) + quanto;
};

export interface RisultatoPartita {
  seed: number;
  giocatori: number;
  finita: boolean;
  errore?: string;
  turni: number;
  mosse: number;
  /** Punti di ogni giocatore nell'ordine di gioco (1°, 2°, ...). */
  punti: number[];
  /** Posizioni nell'ordine di gioco dei vincitori (0 = primo). */
  posizioniVincitori: number[];
  /** La partita è finita perché è finito il mazzo personaggi (non per i punti). */
  finitaPerMazzo: boolean;
  attivazioni: Conteggi;
  /** Carte attivate a fine partita: per ogni carta, quanti le avevano e quanti di loro hanno vinto. */
  aFine: Record<string, { avute: number; vinte: number }>;
  poteri: Conteggi;
  attacchi: Conteggi;
  /** Attacchi che hanno colpito (per giocatore colpito). */
  colpiti: Conteggi;
  /** Difese riuscite e fallite, per potere di difesa. */
  difese: Conteggi;
  difeseFallite: Conteggi;
  /** Attacchi fermati, per potere d'attacco. */
  fermati: Conteggi;
  eventi: Conteggi;
}

export function simulaPartita(seed: number, numeroGiocatori: number, opzioni: Partial<OpzioniPartita> = {}): RisultatoPartita {
  const ids = Array.from({ length: numeroGiocatori }, (_, i) => `bot${i + 1}`);
  const rng = creaCasuale(seed * 7919 + 1);
  let s: StatoPartita = setup(ids, opzioni, seed);
  const r: RisultatoPartita = {
    seed,
    giocatori: numeroGiocatori,
    finita: false,
    turni: 0,
    mosse: 0,
    punti: [],
    posizioniVincitori: [],
    finitaPerMazzo: false,
    attivazioni: {},
    aFine: {},
    poteri: {},
    attacchi: {},
    colpiti: {},
    difese: {},
    difeseFallite: {},
    fermati: {},
    eventi: {},
  };
  let ultimoFatto = s.registro.at(-1)?.n ?? 0;
  /** Potere dell'attacco in corso, per sapere quale attacco una difesa ha fermato. */
  let attaccoInCorso = "";

  try {
    while (!s.finita && s.numeroTurno < TURNI_MASSIMI) {
      const auto = mossaAutomatica(s);
      const chi = auto?.giocatore ?? chiDeveMuovere(s);
      const mossa = auto?.mossa ?? mossaDelBot(s, chi, () => prossimo(rng));
      const esito = applicaMossa(s, chi, mossa);
      if (!esito.ok) throw new Error(`Mossa proposta ma rifiutata: ${esito.errore} (${JSON.stringify(mossa)})`);
      s = esito.stato;
      r.mosse++;
      // Le cose successe con questa mossa (il registro tiene solo gli ultimi fatti: si leggono i nuovi)
      for (const f of s.registro) {
        if (f.n <= ultimoFatto) continue;
        if (f.tipo === "attiva") conta(r.attivazioni, f.carta);
        else if (f.tipo === "potere") conta(r.poteri, f.potere);
        else if (f.tipo === "attacco") {
          conta(r.attacchi, f.potere);
          conta(r.poteri, f.potere);
          attaccoInCorso = f.potere;
        } else if (f.tipo === "colpito") conta(r.colpiti, f.potere);
        else if (f.tipo === "difesa") {
          if (f.riuscita) {
            conta(r.difese, f.potere);
            conta(r.fermati, attaccoInCorso);
          } else conta(r.difeseFallite, f.potere);
        } else if (f.tipo === "evento") conta(r.eventi, f.evento);
        else if (f.tipo === "ultimoGiro" && f.mazzo) r.finitaPerMazzo = true;
      }
      ultimoFatto = s.registro.at(-1)?.n ?? ultimoFatto;
    }
  } catch (e) {
    r.errore = e instanceof Error ? e.message : String(e);
  }

  const esito = finePartita(s);
  r.finita = esito !== null;
  r.turni = s.numeroTurno + 1;
  r.punti = s.ordine.map((id) => puntiDi(s.giocatori[id]!, s.opzioni));
  r.posizioniVincitori = esito ? esito.vincitori.map((id) => s.ordine.indexOf(id)) : [];
  if (esito) {
    for (const id of s.ordine) {
      const vinto = esito.vincitori.includes(id);
      for (const a of s.giocatori[id]!.attivati) {
        const c = cartaDiCopia(a.copia.id);
        const x = (r.aFine[c] ??= { avute: 0, vinte: 0 });
        x.avute++;
        if (vinto) x.vinte++;
      }
    }
  }
  return r;
}

/* ------------------------------------------------------------------ */
/* Statistiche                                                         */
/* ------------------------------------------------------------------ */

export interface StatCarta {
  id: string;
  nome: string;
  livello: number;
  categoria: string;
  attivazioniMedie: number;
  /** Percentuale di partite in cui è stata attivata almeno una volta. */
  percentualePartite: number;
  /** Quante volte era attivata a fine partita. */
  aFine: number;
  /**
   * Indice di vittoria di chi la aveva attivata a fine partita: vittorie vere / vittorie attese (1 / numero giocatori).
   * 1 = nella media; sopra 1 aiuta a vincere più delle altre.
   */
  indiceVittoria: number;
}

export interface Statistiche {
  partite: number;
  finite: number;
  errori: { seed: number; giocatori: number; errore: string }[];
  bloccate: number[];
  pareggi: number;
  finitePerMazzo: number;
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
  carte: StatCarta[];
  poteri: { id: string; nome: string; tipo: string; usiMedi: number }[];
  attacchi: { id: string; nome: string; lanciati: number; colpiti: number; fermati: number }[];
  difese: { id: string; nome: string; riuscite: number; fallite: number }[];
  eventi: { id: string; nome: string; mediaPerPartita: number }[];
}

const media = (v: number[]) => (v.length === 0 ? 0 : v.reduce((a, b) => a + b, 0) / v.length);
const somma = (risultati: RisultatoPartita[], campo: (r: RisultatoPartita) => Conteggi, chiave: string) =>
  risultati.reduce((tot, r) => tot + (campo(r)[chiave] ?? 0), 0);

/** Simula `n` partite, con numero di giocatori a rotazione da 2 a 5. */
export function simula(n: number, opzioni: Partial<OpzioniPartita> = {}, seedIniziale = 1): Statistiche {
  const risultati = Array.from({ length: n }, (_, i) => simulaPartita(seedIniziale + i, 2 + (i % 4), opzioni));
  return statistiche(risultati);
}

/** Nome di un potere, cercandolo tra tutte le carte. */
function potereDaId(id: string): { nome: string; tipo: string } {
  for (const c of CARTE) {
    const p = c.poteri.find((x) => x.id === id);
    if (p) return { nome: p.nome, tipo: p.blu ? "blu" : p.tipo };
  }
  return { nome: id, tipo: "?" };
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

  const carte: StatCarta[] = CARTE.filter((c) => c.categoria === "personaggio").map((c) => {
    const conteggi = finite.map((r) => r.attivazioni[c.id] ?? 0);
    // vittorie attese: per ogni giocatore che la aveva a fine partita, 1 / numero giocatori
    let avute = 0;
    let vinte = 0;
    let attese = 0;
    for (const r of finite) {
      const x = r.aFine[c.id];
      if (!x) continue;
      avute += x.avute;
      vinte += x.vinte;
      attese += x.avute / r.giocatori;
    }
    return {
      id: c.id,
      nome: c.id === c.persona ? c.nome : `${c.nome} ${c.livello}`,
      livello: c.livello,
      categoria: c.categoria,
      attivazioniMedie: media(conteggi),
      percentualePartite: (100 * conteggi.filter((x) => x > 0).length) / Math.max(1, finite.length),
      aFine: avute,
      indiceVittoria: attese > 0 ? vinte / attese : 0,
    };
  });

  const idPoteri = new Set(finite.flatMap((r) => Object.keys(r.poteri)));
  const poteri = [...idPoteri].map((id) => ({ id, ...potereDaId(id), usiMedi: somma(finite, (r) => r.poteri, id) / Math.max(1, finite.length) }));
  const idAttacchi = new Set(finite.flatMap((r) => Object.keys(r.attacchi)));
  const attacchi = [...idAttacchi].map((id) => ({
    id,
    nome: potereDaId(id).nome,
    lanciati: somma(finite, (r) => r.attacchi, id),
    colpiti: somma(finite, (r) => r.colpiti, id),
    fermati: somma(finite, (r) => r.fermati, id),
  }));
  const idDifese = new Set(finite.flatMap((r) => [...Object.keys(r.difese), ...Object.keys(r.difeseFallite)]));
  const difese = [...idDifese].map((id) => ({
    id,
    nome: potereDaId(id).nome,
    riuscite: somma(finite, (r) => r.difese, id),
    fallite: somma(finite, (r) => r.difeseFallite, id),
  }));
  const eventi = EVENTI.map((e) => ({ id: e.id, nome: e.nome, mediaPerPartita: somma(finite, (r) => r.eventi, e.id) / Math.max(1, finite.length) }));

  return {
    partite: risultati.length,
    finite: finite.length,
    errori: risultati.filter((r) => r.errore).map((r) => ({ seed: r.seed, giocatori: r.giocatori, errore: r.errore! })),
    bloccate: risultati.filter((r) => !r.finita && !r.errore).map((r) => r.seed),
    pareggi: finite.filter((r) => r.posizioniVincitori.length > 1).length,
    finitePerMazzo: finite.filter((r) => r.finitaPerMazzo).length,
    perNumeroGiocatori: perNumero,
    carte,
    poteri,
    attacchi,
    difese,
    eventi,
  };
}

/* ------------------------------------------------------------------ */
/* Resoconto in italiano (Markdown)                                    */
/* ------------------------------------------------------------------ */

const n1 = (x: number) => x.toFixed(1).replace(".", ",");
const n2 = (x: number) => x.toFixed(2).replace(".", ",");
const perc = (x: number) => `${Math.round(x)}%`;
const EMOJI = { attacco: "⚔️", difesa: "🛡️", aiuto: "✨", blu: "🔵" } as Record<string, string>;

/** Carte con abbastanza dati per giudicare l'indice di vittoria. */
const MIN_A_FINE = 30;

export function rapporto(st: Statistiche, titolo = "La Famiglia – statistiche della simulazione"): string {
  const righe: string[] = [];
  const r = (x = "") => righe.push(x);
  r(`# ${titolo}`);
  r();
  r(`Partite simulate: **${st.partite}** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso`);
  r("ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.");
  r(`Finite: **${st.finite}** · errori: **${st.errori.length}** · bloccate (oltre ${TURNI_MASSIMI} turni): **${st.bloccate.length}** · pareggi: ${st.pareggi}`);
  r(`Finite perché il mazzo personaggi è finito (invece che per i punti): ${st.finitePerMazzo}`);
  r();
  r("> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.");
  r();
  if (st.errori.length > 0) {
    r("## ❌ Errori");
    r();
    for (const e of st.errori.slice(0, 20)) r(`- partita ${e.seed} (${e.giocatori} giocatori): ${e.errore}`);
    r();
  }

  r("## Durata e vantaggio di chi comincia");
  r();
  r("| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |");
  r("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const [g, x] of Object.entries(st.perNumeroGiocatori)) {
    r(
      `| ${g} | ${x.partite} | ${n1(x.turniMedi)} | ${n1(x.giriMedi)} | ${x.turniMin}–${x.turniMax} | ${n1(x.puntiMediVincitore)} | ${n1(x.puntiMediTutti)} | ${x.vittoriePerPosizione.map(perc).join(" · ")} |`,
    );
  }
  r();
  r("Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).");
  r();

  // Indice relativo: l'indice di vittoria diviso per la media delle carte dello stesso livello
  // (chi vince ha più carte attivate di tutti: per questo l'indice semplice è quasi sempre sopra 1).
  const mediaLivello = new Map(
    [1, 2, 3].map((l) => [l, media(st.carte.filter((c) => c.livello === l && c.aFine >= MIN_A_FINE).map((c) => c.indiceVittoria))]),
  );
  const relativo = (c: StatCarta) => c.indiceVittoria / (mediaLivello.get(c.livello) || 1);
  const giudicabili = st.carte.filter((c) => c.aFine >= MIN_A_FINE);
  const forti = giudicabili.filter((c) => relativo(c) >= 1.2).sort((a, b) => relativo(b) - relativo(a));
  const deboli = giudicabili.filter((c) => relativo(c) <= 0.8).sort((a, b) => relativo(a) - relativo(b));
  const rare = st.carte.filter((c) => c.percentualePartite < 10).sort((a, b) => a.percentualePartite - b.percentualePartite);
  r("## 🔎 Da guardare");
  r();
  r("**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto");
  r("a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:");
  r("per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna \"rispetto al livello\":");
  r("1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).");
  r();
  r(`- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): ${forti.map((c) => `${c.nome} (${n2(relativo(c))})`).join(", ") || "nessuna"}`);
  r(`- Carte che sembrano **più deboli** (≤ 0,8): ${deboli.map((c) => `${c.nome} (${n2(relativo(c))})`).join(", ") || "nessuna"}`);
  r(`- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): ${rare.map((c) => `${c.nome} (${perc(c.percentualePartite)})`).join(", ") || "nessuna"}`);
  r();

  for (const livello of [1, 2, 3]) {
    const gruppo = st.carte.filter((c) => c.livello === livello).sort((a, b) => relativo(b) - relativo(a));
    r(`## Carte di livello ${livello}`);
    r();
    r("| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |");
    r("| --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const c of gruppo) {
      const k = carta(c.id);
      const tipi = [...new Set(k.poteri.map((p) => EMOJI[p.blu ? "blu" : p.tipo]))].join("");
      const pochi = c.aFine < MIN_A_FINE ? " (pochi dati)" : "";
      r(
        `| ${c.nome} | ${tipi} | ${descriviCodice(k.codice)} | ${n2(c.attivazioniMedie)} | ${perc(c.percentualePartite)} | ${c.aFine} | ${n2(c.indiceVittoria)} | ${n2(relativo(c))}${pochi} |`,
      );
    }
    r();
  }

  r("## Poteri usati (media per partita)");
  r();
  r("| Potere | Tipo | Usi per partita |");
  r("| --- | --- | --- |");
  for (const p of [...st.poteri].sort((a, b) => b.usiMedi - a.usiMedi)) r(`| ${p.nome} | ${EMOJI[p.tipo] ?? p.tipo} | ${n2(p.usiMedi)} |`);
  r();

  r("## Attacchi: quanti passano e quanti vengono fermati");
  r();
  r("| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |");
  r("| --- | --- | --- | --- | --- |");
  for (const a of [...st.attacchi].sort((x, y) => y.lanciati - x.lanciati)) {
    const tot = a.colpiti + a.fermati;
    r(`| ${a.nome} | ${a.lanciati} | ${a.colpiti} | ${a.fermati} | ${tot > 0 ? perc((100 * a.fermati) / tot) : "–"} |`);
  }
  r();
  r("Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.");
  r();

  r("## Difese usate");
  r();
  r("| Difesa | Riuscite | Fallite (Forse c'è, forse no) |");
  r("| --- | --- | --- |");
  for (const d of [...st.difese].sort((x, y) => y.riuscite - x.riuscite)) r(`| ${d.nome} | ${d.riuscite} | ${d.fallite} |`);
  r();

  r("## Eventi (pescati in media per partita)");
  r();
  r("| Evento | Per partita |");
  r("| --- | --- |");
  for (const e of st.eventi) r(`| ${e.nome} | ${n2(e.mediaPerPartita)} |`);
  r();
  return righe.join("\n");
}
