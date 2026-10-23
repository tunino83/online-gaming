/**
 * Sostituto: gioca al posto di una persona che è ferma da troppo tempo (vedi l'arbitro, azione "alPosto").
 * Regole decise col proprietario del gioco, in ordine:
 * 1. se può attivare un personaggio, lo attiva (quello che vale più punti);
 * 2. se sul tavolo c'è una carta numero che serve per i codici dei suoi personaggi, la prende;
 * 3. altrimenti, se ha posti liberi, prende un personaggio dal tavolo;
 * 4. altrimenti pesca dal mazzo coperto delle carte numero;
 * 5. a fine turno scarta le carte che servono meno ai suoi personaggi (a parità, a caso).
 */
import { type IdGiocatore, type StatoCasuale, interoTra } from "@og/engine";
import { personaggio } from "./personaggi";
import { limiteMano, mosseValide } from "./regole";
import type { Mossa, StatoPartita } from "./stato";
import type { Codice, CartaNumero } from "./tipi-carte";

/** Da quanto una carta "serve" perché il sostituto la prenda dal tavolo. */
const SERVE = 1;

/**
 * Quanto una carta di valore `valore` aiuta a fare il codice, tenendo conto delle altre carte in mano.
 * È una stima semplice: 0 = non serve, 1 = serve, 2 = serve molto.
 */
export function utilitaPerCodice(codice: Codice, valore: number, altre: readonly number[]): number {
  const quante = (v: number) => altre.filter((x) => x === v).length;
  switch (codice.tipo) {
    case "esatto": {
      const richieste = codice.valori.filter((v) => v === valore).length;
      return richieste > quante(valore) ? 2 : 0;
    }
    case "uguali":
    case "doppiaCoppia":
      return quante(valore) > 0 ? 2 : 0.5;
    case "scala": {
      const vicine = altre.some((x) => x !== valore && Math.abs(x - valore) < codice.lunghezza);
      return vicine ? 1 : 0.5;
    }
    case "somma":
      if (valore > codice.totale) return 0;
      return valore === codice.totale && codice.carte === undefined ? 2 : 1;
    case "parita":
      return (valore % 2 === 0) === (codice.parita === "pari") ? 1 : 0;
    case "diamanteQualsiasi":
      return 0;
    case "combinato":
      return Math.max(utilitaPerCodice({ tipo: "esatto", valori: codice.esatto }, valore, altre), utilitaPerCodice(codice.piu, valore, altre));
    case "alternativa":
      return Math.max(0, ...codice.opzioni.map((o) => utilitaPerCodice(o, valore, altre)));
  }
}

/** Quanto una carta aiuta i personaggi nei posti del giocatore (il migliore tra tutti). */
function utilita(s: StatoPartita, id: IdGiocatore, valore: number, altre: readonly number[]): number {
  const posti = s.giocatori[id]!.posti;
  return Math.max(0, ...posti.map((c) => utilitaPerCodice(personaggio(c.personaggio).codice, valore, altre)));
}

/** Carte da scartare: le `quante` che servono meno; a parità, a caso. */
function menoUtili(s: StatoPartita, id: IdGiocatore, mano: readonly CartaNumero[], quante: number, rng: StatoCasuale): string[] {
  const valutate = mano.map((c, i) => {
    const altre = mano.filter((_, j) => j !== i).map((x) => x.valore);
    return { id: c.id, punteggio: utilita(s, id, c.valore, altre), sorte: interoTra(rng, 0, 1_000_000) };
  });
  valutate.sort((a, b) => a.punteggio - b.punteggio || a.sorte - b.sorte);
  return valutate.slice(0, quante).map((x) => x.id);
}

export function mossaDelSostituto(s: StatoPartita, id: IdGiocatore, rng: StatoCasuale): Mossa {
  const mosse = mosseValide(s, id);
  if (mosse.length === 0) throw new Error(`Nessuna mossa valida per ${id}`);
  const g = s.giocatori[id]!;
  const unaACaso = <T>(lista: T[]): T => lista[interoTra(rng, 0, lista.length - 1)]!;
  const mano = g.mano.map((c) => c.valore);

  // Decisioni in attesa
  const scarti = mosse.filter((m) => m.tipo === "scartaPersonaggio");
  if (scarti.length > 0) {
    // si tiene il personaggio che vale di più: si scarta quello che vale meno
    const punti = (carta: string) => personaggio(g.posti.find((c) => c.id === carta)!.personaggio).punti;
    return scarti.reduce((a, b) => (punti(b.carta) < punti(a.carta) ? b : a));
  }
  const daFatina = mosse.filter((m) => m.tipo === "prendiDaFatina");
  if (daFatina.length > 0) {
    const mano = s.turno.attesa?.tipo === "fatina" ? s.giocatori[s.turno.attesa.avversario]!.mano : [];
    const valore = (carta: string) => mano.find((c) => c.id === carta)?.valore ?? 0;
    const migliore = Math.max(...daFatina.map((m) => utilita(s, id, valore(m.carta), g.mano.map((c) => c.valore))));
    return unaACaso(daFatina.filter((m) => utilita(s, id, valore(m.carta), g.mano.map((c) => c.valore)) === migliore));
  }

  // 1. Attiva il personaggio che vale di più
  const attivazioni = mosse.filter((m) => m.tipo === "attiva");
  if (attivazioni.length > 0) {
    const punti = (m: (typeof attivazioni)[number]) => {
      const carta = Object.values(s.giocatori).flatMap((x) => x.posti).find((c) => c.id === m.carta);
      return carta ? personaggio(carta.personaggio).punti : 0;
    };
    const massimo = Math.max(...attivazioni.map(punti));
    return attivazioni.find((m) => punti(m) === massimo)!;
  }

  // 2. Una carta numero del tavolo che serve
  const prendiNumero = mosse.filter((m) => m.tipo === "prendiNumero");
  const valutate = prendiNumero.map((m) => ({ m, u: utilita(s, id, s.tavolo.numeri[m.posizione]!.valore, mano) }));
  const migliore = Math.max(0, ...valutate.map((x) => x.u));
  if (migliore >= SERVE) return unaACaso(valutate.filter((x) => x.u === migliore)).m;

  // 3. Posti liberi: un personaggio dal tavolo (quello che vale di più)
  const prendiPersonaggio = mosse.filter((m) => m.tipo === "prendiPersonaggio");
  if (g.posti.length < s.opzioni.postiPersonaggio && prendiPersonaggio.length > 0) {
    const punti = (m: (typeof prendiPersonaggio)[number]) => personaggio(s.tavolo.personaggi[m.posizione]!.personaggio).punti;
    const massimo = Math.max(...prendiPersonaggio.map(punti));
    return prendiPersonaggio.find((m) => punti(m) === massimo)!;
  }

  // 4. Pesca dal mazzo coperto
  const pesca = mosse.find((m) => m.tipo === "pescaNumero");
  if (pesca) return pesca;

  // Fine del turno: scarta le carte che servono meno
  const fine = mosse.find((m) => m.tipo === "fineTurno");
  if (fine) {
    const eccesso = Math.max(0, g.mano.length - limiteMano(s, g));
    return { tipo: "fineTurno", scarta: menoUtili(s, id, g.mano, eccesso, rng), cambiaMano: false };
  }

  // Niente di tutto questo (es. mazzo numeri finito): una mossa a caso tra quelle che fanno andare avanti il turno
  const costano = mosse.filter((m) => ["prendiNumero", "prendiPersonaggio", "pescaPersonaggio", "brucia"].includes(m.tipo));
  return unaACaso(costano.length > 0 ? costano : mosse);
}
