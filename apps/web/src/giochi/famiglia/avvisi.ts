/**
 * Avvisi personali della Famiglia: quando succede qualcosa che ti riguarda (ti attaccano, ti rubano una carta,
 * esce un evento, la tua difesa o il tuo attacco vanno a segno…) compare un avviso che resta finché non tocchi OK.
 * Si ricava dal registro (cose successe) e dal confronto tra le tue carte prima e dopo.
 */
import { type Fatto, type VistaGiocatore, carta, evento } from "@og/famiglia";
import { cartaDiCopia, elenco, nomeCarta, nomePotere } from "./descrivi";

export interface Avviso {
  /** Numero dell'ultima cosa successa compresa nell'avviso (per non ripeterlo). */
  n: number;
  titolo: string;
  righe: string[];
}

/** Testo del potere (per spiegare cosa fa un attacco). */
const testoPotere = (idCarta: string, potere: string) => carta(idCarta).poteri.find((p) => p.id === potere)?.testo ?? "";

/** Le cose successe che riguardano il giocatore `io`, raccontate per lui. */
function righeDaFatti(
  fatti: Fatto[],
  io: string,
  nick: (id: string) => string,
  /** Attacco cominciato prima (es. l'attaccato ha risposto dopo qualche secondo). */
  attaccoPrecedente: Extract<Fatto, { tipo: "attacco" }> | null,
): { titolo: string; righe: string[] } | null {
  const righe: string[] = [];
  let titolo = "";
  let ultimoAttacco = attaccoPrecedente;
  for (const f of fatti) {
    const chi = f.giocatore === io ? "tu" : nick(f.giocatore);
    switch (f.tipo) {
      case "attacco":
        ultimoAttacco = f;
        if (f.bersagli.includes(io) && f.giocatore !== io) {
          titolo ||= `⚔️ ${nick(f.giocatore)} ti attacca!`;
          righe.push(`${nick(f.giocatore)} usa ${nomePotere(f.carta, f.potere)} (${nomeCarta(f.carta)}): ${testoPotere(f.carta, f.potere)}`);
        }
        break;
      case "colpito":
        if (f.giocatore === io && ultimoAttacco && ultimoAttacco.giocatore !== io) {
          titolo ||= "💥 Sei stato colpito";
          righe.push(`L'attacco ${nomePotere(ultimoAttacco.carta, ultimoAttacco.potere)} ti ha colpito.`);
        } else if (ultimoAttacco?.giocatore === io && f.giocatore !== io) {
          titolo ||= "⚔️ Il tuo attacco è andato a segno";
          righe.push(`${nomePotere(ultimoAttacco.carta, ultimoAttacco.potere)} ha colpito ${nick(f.giocatore)}.`);
        }
        break;
      case "protetto":
        if (ultimoAttacco?.giocatore === io && f.giocatore !== io) {
          titolo ||= "✨ Il tuo attacco non ha effetto";
          righe.push(`${nick(f.giocatore)} è protetto: ${nomePotere(ultimoAttacco.carta, ultimoAttacco.potere)} non lo colpisce.`);
        }
        break;
      case "difesa":
        if (ultimoAttacco?.giocatore === io && f.giocatore !== io) {
          titolo ||= "🛡️ Si sono difesi dal tuo attacco";
          righe.push(
            f.riuscita
              ? `${nick(f.giocatore)} si difende con ${nomePotere(f.carta, f.potere)}${f.girata ? ` (gira un ${f.girata}: dispari)` : ""}${f.devia ? ` e passa l'attacco a ${f.devia === io ? "te" : nick(f.devia)}` : ""}.`
              : `${nick(f.giocatore)} prova ${nomePotere(f.carta, f.potere)}${f.girata ? ` e gira un ${f.girata}: pari` : ""}, ma non funziona!`,
          );
        } else if (f.devia === io && f.giocatore !== io) {
          titolo ||= "⚔️ L'attacco passa a te!";
          righe.push(`${nick(f.giocatore)} si difende con ${nomePotere(f.carta, f.potere)} e passa l'attacco a te.`);
        }
        break;
      case "potere":
        if (f.bersaglio === io && f.giocatore !== io) {
          titolo ||= `✨ ${nick(f.giocatore)} usa un potere su di te`;
          righe.push(`${nomePotere(f.carta, f.potere)}: ${testoPotere(f.carta, f.potere)}`);
        } else if (f.giocatore !== io && f.potere === "cucina-per-200") {
          titolo ||= "🍝 Chissà se sta roba basta";
          righe.push(`${chi} cucina per tutti: ricevi una carta numero.`);
        }
        break;
      case "evento": {
        const e = evento(f.evento);
        titolo ||= `🌙 Evento: ${e.nome}`;
        righe.push(`${f.giocatore === io ? "Hai pescato" : `${nick(f.giocatore)} ha pescato`} l'evento ${e.nome} (${e.durata} ${e.durata === 1 ? "turno" : "turni"}): ${e.testo}`);
        break;
      }
      case "regalo":
        if (f.a === io && f.giocatore !== io) {
          titolo ||= "🎁 Un regalo per te";
          righe.push(`${nick(f.giocatore)} ti regala una carta numero.`);
        }
        break;
      case "ultimoGiro":
        titolo ||= "📣 Ultimo giro!";
        righe.push(f.mazzo ? "Il mazzo dei personaggi è finito: si gioca l'ultimo giro." : `Qualcuno è arrivato a ${f.punti} punti: si gioca l'ultimo giro.`);
        break;
    }
  }
  return righe.length > 0 ? { titolo, righe } : null;
}

/** Come sono cambiate le tue carte (solo ciò che non hai fatto tu). */
function righeDaCambiamenti(prima: VistaGiocatore, dopo: VistaGiocatore, io: string): string[] {
  const righe: string[] = [];
  const valori = (lista: { id: string; valore: number }[], ids: Set<string>) => lista.filter((c) => ids.has(c.id)).map((c) => String(c.valore));
  const idsPrima = new Set(prima.mano.map((c) => c.id));
  const idsDopo = new Set(dopo.mano.map((c) => c.id));
  const perse = valori(prima.mano, new Set([...idsPrima].filter((x) => !idsDopo.has(x))));
  const nuove = valori(dopo.mano, new Set([...idsDopo].filter((x) => !idsPrima.has(x))));
  if (perse.length > 0) righe.push(`🃏 Hai perso: ${elenco(perse)}`);
  if (nuove.length > 0) righe.push(`🃏 Hai ricevuto: ${elenco(nuove)}`);
  const nomi = (lista: { id: string }[]) => lista.map((c) => nomeCarta(cartaDiCopia(c.id)));
  const nascostiDopo = new Set(dopo.nascosti.map((c) => c.id));
  const nascostiPersi = prima.nascosti.filter((c) => !nascostiDopo.has(c.id));
  if (nascostiPersi.length > 0) righe.push(`🂠 Hai perso dalla mano: ${elenco(nomi(nascostiPersi))}`);
  const mieiPrima = prima.giocatori[io]!;
  const mieiDopo = dopo.giocatori[io]!;
  const attivatiDopo = new Map(mieiDopo.attivati.map((a) => [a.copia.id, a]));
  const persi = mieiPrima.attivati.filter((a) => !attivatiDopo.has(a.copia.id));
  if (persi.length > 0) righe.push(`⭐ Non hai più tra gli attivati: ${elenco(nomi(persi.map((a) => a.copia)))}`);
  const stancate = mieiPrima.attivati.filter((a) => a.stanca === 0 && (attivatiDopo.get(a.copia.id)?.stanca ?? 0) > 0);
  if (stancate.length > 0) righe.push(`😴 Si è stancata: ${elenco(nomi(stancate.map((a) => a.copia)))}`);
  if (mieiDopo.punti !== mieiPrima.punti) righe.push(`⭐ Punti: ${mieiPrima.punti} → ${mieiDopo.punti}`);
  return righe;
}

/**
 * Avviso per le cose successe tra la vista precedente e quella nuova, se ti riguardano; null se non c'è niente da dire.
 * Le cose fatte da te (nel tuo turno, senza avversari coinvolti) non generano avvisi.
 */
export function avvisoTraViste(prima: VistaGiocatore, dopo: VistaGiocatore, io: string, nick: (id: string) => string): Avviso | null {
  const ultimo = prima.registro.at(-1)?.n ?? 0;
  const nuovi = dopo.registro.filter((f) => f.n > ultimo);
  if (nuovi.length === 0) return null;
  const attaccoPrecedente = [...prima.registro].reverse().find((f): f is Extract<Fatto, { tipo: "attacco" }> => f.tipo === "attacco") ?? null;
  const daFatti = righeDaFatti(nuovi, io, nick, attaccoPrecedente);
  // I cambiamenti delle tue carte si raccontano solo se c'entra qualcun altro (attacchi, eventi, regali…)
  const cambiamenti = daFatti ? righeDaCambiamenti(prima, dopo, io) : [];
  if (!daFatti) return null;
  return { n: nuovi.at(-1)!.n, titolo: daFatti.titolo, righe: [...daFatti.righe, ...cambiamenti] };
}
