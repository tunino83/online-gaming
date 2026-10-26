/**
 * Annunci a schermo della Famiglia: ogni carta pescata, presa dal tavolo o attivata compare per un attimo,
 * e per ogni carta attivata o usata c'è la sua voce (vedi audio.ts).
 * Si ricavano dal registro (cose successe) e, per le carte che vede solo chi le pesca, dal confronto tra le
 * proprie carte prima e dopo.
 */
import { type CartaNumero, type VistaGiocatore, carta } from "@og/famiglia";
import { nomeCarta } from "./descrivi";

export type Annuncio =
  /** Personaggio: `idCarta` null = carta coperta (pescata da un altro e nascosta). */
  | { chiave: string; tipo: "personaggio"; idCarta: string | null; testo: string; attivazione: boolean }
  /** Carta numero: `carta` null = coperta (pescata da un altro). */
  | { chiave: string; tipo: "numero"; carta: CartaNumero | null; testo: string };

/** Quando parte la voce di una carta: all'attivazione, o quando si usa il suo potere (attacco, difesa, aiuto). */
export type QuandoVoce = "attiva" | "ATT" | "DIF" | "AIU";
export interface VoceCarta {
  idCarta: string;
  quando: QuandoVoce;
  /** Potere usato (per la voce del telefono, se manca la registrazione). */
  potere?: string;
}

const SUFFISSO = { attacco: "ATT", difesa: "DIF", aiuto: "AIU" } as const;

/** Suffisso della voce di un potere, secondo il suo tipo. */
function quandoPotere(idCarta: string, potere: string): QuandoVoce {
  const tipo = carta(idCarta).poteri.find((p) => p.id === potere)?.tipo ?? "aiuto";
  return SUFFISSO[tipo];
}

/** Le cose nuove tra due viste dello stesso giocatore `io` ("" = spettatore): annunci e voci, in ordine. */
export function annunciTraViste(prima: VistaGiocatore, dopo: VistaGiocatore, io: string, nick: (id: string) => string): { annunci: Annuncio[]; voci: VoceCarta[] } {
  const ultimo = prima.registro.at(-1)?.n ?? 0;
  const fatti = dopo.registro.filter((f) => f.n > ultimo);
  // Le carte nuove che vedo solo io (pescate dal mazzo), nell'ordine in cui sono arrivate
  const nascostiPrima = new Set(prima.nascosti.map((c) => c.id));
  const nuoviNascosti = dopo.nascosti.filter((c) => !nascostiPrima.has(c.id));
  const manoPrima = new Set(prima.mano.map((c) => c.id));
  const nuoviNumeri = dopo.mano.filter((c) => !manoPrima.has(c.id));

  const annunci: Annuncio[] = [];
  const voci: VoceCarta[] = [];
  for (const f of fatti) {
    const mio = f.giocatore === io;
    const chi = nick(f.giocatore);
    const chiave = String(f.n);
    switch (f.tipo) {
      case "attiva":
        annunci.push({
          chiave,
          tipo: "personaggio",
          idCarta: f.carta,
          testo: `${mio ? "Hai attivato" : `${chi} attiva`} ${nomeCarta(f.carta)} · +${f.punti} ${f.punti === 1 ? "punto" : "punti"}`,
          attivazione: true,
        });
        voci.push({ idCarta: f.carta, quando: "attiva" });
        break;
      case "pescaPersonaggio": {
        // Le carte attacco finiscono scoperte: le vedono tutti; i personaggi nascosti solo chi li pesca
        const idCarta = f.carta ?? (mio ? (nuoviNascosti.shift()?.carta ?? null) : null);
        const nome = idCarta ? nomeCarta(idCarta) : "un personaggio";
        annunci.push({ chiave, tipo: "personaggio", idCarta, testo: mio ? `Hai pescato ${nome}` : `${chi} pesca ${nome}`, attivazione: false });
        break;
      }
      case "prendiPersonaggio":
        annunci.push({
          chiave,
          tipo: "personaggio",
          idCarta: f.carta,
          testo: `${mio ? "Hai preso" : `${chi} prende`} ${nomeCarta(f.carta)} dal tavolo`,
          attivazione: false,
        });
        break;
      case "pescaNumero": {
        const c = mio ? (nuoviNumeri.shift() ?? null) : null;
        annunci.push({ chiave, tipo: "numero", carta: c, testo: mio ? `Hai pescato ${c ? `un ${c.valore}` : "una carta numero"}` : `${chi} pesca una carta numero` });
        break;
      }
      case "prendiNumero":
        if (mio) {
          const i = nuoviNumeri.findIndex((c) => c.valore === f.valore);
          if (i >= 0) nuoviNumeri.splice(i, 1);
        }
        annunci.push({
          chiave,
          tipo: "numero",
          carta: { id: `tavolo-${f.n}`, valore: f.valore as CartaNumero["valore"] },
          testo: `${mio ? "Hai preso" : `${chi} prende`} il ${f.valore} dal tavolo`,
        });
        break;
      case "potere":
        voci.push({ idCarta: f.carta, quando: quandoPotere(f.carta, f.potere), potere: f.potere });
        break;
      case "attacco":
        voci.push({ idCarta: f.carta, quando: "ATT", potere: f.potere });
        break;
      case "difesa":
        voci.push({ idCarta: f.carta, quando: "DIF", potere: f.potere });
        break;
    }
  }
  return { annunci, voci };
}
