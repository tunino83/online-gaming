/**
 * Testi in italiano per la schermata della Famiglia: mosse (per i pulsanti) e cose successe (per il registro).
 * Le carte si riconoscono dall'id della copia: "antonio-2#1" è la carta "antonio-2".
 */
import { type CartaNumero, type Fatto, type Mossa, type ParametriPotere, type VistaGiocatore, carta, evento } from "@og/famiglia";

/** Id della carta da quello della copia ("antonio-2#1" → "antonio-2"). */
export const cartaDiCopia = (idCopia: string) => idCopia.split("#")[0]!;

/** Nome breve di una carta: "Antonio (2)", "Paesano". */
export function nomeCarta(idCarta: string): string {
  const c = carta(idCarta);
  return c.id === c.persona ? c.nome : `${c.nome} (${c.livello})`;
}

const nomeCopia = (idCopia: string) => nomeCarta(cartaDiCopia(idCopia));

/** Nome di un potere (es. "forno-a-legna" → "Alta idratazione"), cercandolo nella carta. */
export function nomePotere(idCarta: string, potere: string): string {
  return carta(idCarta).poteri.find((p) => p.id === potere)?.nome ?? potere;
}

/** Tutte le carte numero che il giocatore può vedere, per trovarne il valore dall'id. */
function carteNumero(v: VistaGiocatore): Map<string, CartaNumero> {
  const tutte: CartaNumero[] = [
    ...v.mano,
    ...v.scartiNumeri,
    ...v.offerta,
    ...v.tavolo.numeri.filter((c): c is CartaNumero => c !== null),
    ...Object.values(v.giocatori).flatMap((g) => g.vetrina),
    ...(v.turno.attesa?.tipo === "riordina" ? v.turno.attesa.carte : []),
  ];
  return new Map(tutte.map((c) => [c.id, c]));
}

/** "3, 5 e 7" */
export function elenco(parti: string[]): string {
  if (parti.length <= 1) return parti.join("");
  return `${parti.slice(0, -1).join(", ")} e ${parti.at(-1)}`;
}

const VOCI_MENU: Record<string, string> = { caffe: "caffè", birra: "birra", colazione: "colazione" };

/** Testo del pulsante di una mossa. */
export function descriviMossa(m: Mossa, v: VistaGiocatore, nick: (id: string) => string): string {
  const numeri = carteNumero(v);
  const valori = (ids: string[] | undefined) => elenco((ids ?? []).map((id) => String(numeri.get(id)?.valore ?? "?")));
  const parametri = (p: ParametriPotere) => {
    const parti: string[] = [];
    if (typeof p.giocatore === "string") parti.push(`contro ${nick(p.giocatore)}`);
    if (p.giocatori && p.giocatori.length > 0) parti.push(`contro ${elenco(p.giocatori.map(nick))}`);
    // Il mio corpo che cambia: una carta torna in mano, l'altra si attiva
    if (m.tipo === "potere" && m.potere === "il-mio-corpo-che-cambia" && typeof p.propria === "string" && typeof p.bersaglio === "string") {
      return ` – ${nomeCopia(p.propria)} torna in mano, attivi ${nomeCopia(p.bersaglio)}`;
    }
    if (typeof p.fonte === "string") parti.push(`usando ${nomeCopia(p.fonte)}`);
    if (typeof p.propria === "string") {
      const n = numeri.get(p.propria);
      parti.push(n ? `dai il ${n.valore}` : `dai ${nomeCopia(p.propria)}`);
    }
    if (typeof p.bersaglio === "string") {
      const n = numeri.get(p.bersaglio);
      const mercatino = m.tipo === "potere" && (m.potere === "mercatino" || m.potere === "medico-in-famiglia");
      parti.push(n ? `prendi il ${n.valore}` : `${mercatino ? "prendi" : "su"} ${nomeCopia(p.bersaglio)}`);
    }
    if (p.bersagli && p.bersagli.length > 0) parti.push(`ricarichi ${elenco(p.bersagli.map(nomeCopia))}`);
    if (p.combinazione && p.combinazione.length > 0) parti.push(`paghi ${elenco(p.combinazione.map((el) => String(el.valore)))}`);
    if (p.carte && p.carte.length > 0) parti.push(`carte ${valori(p.carte)}`);
    if (p.posizioni && p.posizioni.length > 0) {
      parti.push(`dal tavolo il ${elenco(p.posizioni.map((i) => String(v.tavolo.numeri[i]?.valore ?? "?")))}`);
    }
    if (typeof p.valore === "number") {
      const trucco = m.tipo === "potere" && m.potere === "un-filo-di-trucco";
      parti.push(trucco ? `la fai diventare un ${p.valore}` : `cerca un ${p.valore}`);
    }
    if (p.scelte) parti.push(elenco(p.scelte.map((x) => VOCI_MENU[x] ?? x)));
    return parti.length > 0 ? ` – ${parti.join(", ")}` : "";
  };

  switch (m.tipo) {
    case "prendiNumero":
      return `Prendi il ${v.tavolo.numeri[m.posizione]?.valore ?? "?"} dal tavolo`;
    case "prendiPersonaggio": {
      const c = v.tavolo.personaggi[m.posizione];
      return c ? `Prendi ${nomeCopia(c.id)} dal tavolo` : "Prendi il personaggio";
    }
    case "pescaNumero":
      return "Pesca una carta numero";
    case "pescaPersonaggio": {
      // Con Ne ho viste tante si vedono le prime 2 carte del mazzo
      const c = v.cimaPersonaggi?.[m.seconda ? 1 : 0];
      if (m.seconda) return `👀 Pesca la seconda carta del mazzo${c ? `: ${nomeCopia(c.id)}` : ""}`;
      return c ? `Pesca ${nomeCopia(c.id)}` : "Pesca un personaggio";
    }
    case "brucia":
      return "🔥 Butta nel camino le carte numero del tavolo";
    case "pescaEvento":
      return "Pesca un evento";
    case "attiva": {
      if (m.combinazione.length === 0) return `Attiva ${nomeCopia(m.carta)} senza codice (Medico in famiglia)`;
      const prosecco = m.codiceDi ? ` 🥂 col codice di ${nomeCopia(m.codiceDi)}` : "";
      return `Attiva ${nomeCopia(m.carta)}${prosecco} con ${elenco(m.combinazione.map((el) => (el.modifica ? `${el.valore} (+1)` : String(el.valore))))}`;
    }
    case "potere": {
      const idCarta = cartaDiCopia(m.carta);
      const copiato = m.potereCopiato && m.fonte ? `: ${nomePotere(cartaDiCopia(m.fonte), m.potereCopiato)}` : "";
      return `${nomePotere(idCarta, m.potere)}${copiato}${parametri(m)}`;
    }
    case "usaCarta":
      return `Usa ${nomeCopia(m.carta)} (paghi ${elenco(m.combinazione.map((el) => String(el.valore)))})${parametri(m)}`;
    case "caffe":
      return "☕ Bevi un caffè: 1 mossa in più";
    case "scartaCarta":
      return `Scarta ${nomeCopia(m.carta)}`;
    case "scegli": {
      const attesa = v.turno.attesa;
      if (attesa?.tipo === "canto") {
        return `Dai ${elenco(m.carte.map((id, i) => `il ${numeri.get(id)?.valore ?? "?"} a ${nick(attesa.a[i] ?? "")}`))}`;
      }
      if (attesa?.tipo === "stuffosa") return m.carte.length === 0 ? "Lascia stare" : `😤 Ti scocci: scarti ${valori(m.carte)}`;
      if (v.turno.attesa?.tipo === "scambiaTavolo") {
        if (m.carte.length === 0) return "Nessuno scambio";
        const tavolo = v.tavolo.numeri.find((c) => c?.id === m.carte[1]);
        return `Dai il ${numeri.get(m.carte[0]!)?.valore ?? "?"} e prendi il ${tavolo?.valore ?? "?"} dal tavolo`;
      }
      const n = m.carte.map((id) => numeri.get(id)?.valore);
      return n.every((x) => x !== undefined) ? `Prendi il ${elenco(n.map(String))}` : `Prendi ${elenco(m.carte.map(nomeCopia))}`;
    }
    case "riordina":
      return `Rimetti nel mazzo: ${m.ordine.map((id) => numeri.get(id)?.valore ?? "?").join(" → ")}`;
    case "regala":
      return `Dai la carta a ${nick(m.giocatore)}`;
    case "difendi": {
      const idCarta = cartaDiCopia(m.carta);
      const potere = m.potere ?? carta(idCarta).poteri[0]!.id;
      // Vini e Campari senza codice: gratis con l'Aperitivo (Chicca 2)
      const emergenza = m.combinazione
        ? ` (d'emergenza: paghi ${elenco(m.combinazione.map((el) => String(el.valore)))})`
        : carta(idCarta).categoria === "difesa"
          ? " (gratis con l'Aperitivo)"
          : "";
      const devia = m.giocatore ? ` → l'attacco va a ${nick(m.giocatore)}` : "";
      const paga = potere === "ricorso" && m.carte ? ` (parcella: ${valori(m.carte)})` : "";
      return `🛡️ ${nomePotere(idCarta, potere)} – ${nomeCarta(idCarta)}${emergenza}${devia}${paga}`;
    }
    case "subisci": {
      if (v.attacco?.potere === "brontola-tutto-il-giorno") {
        return m.carte && m.carte.length > 0 ? `Gli dai ${valori(m.carte)} (scegli tu quali)` : "Salti il tuo prossimo turno";
      }
      if (m.bersaglio) return `Lascia passare: fai stancare ${nomeCopia(m.bersaglio)}`;
      if (m.carte && m.carte.length > 0) return `Lascia passare: carte ${valori(m.carte)}`;
      return "Lascia passare l'attacco";
    }
    case "fineTurno":
      return m.scarta.length > 0 ? `Fine turno (scarti ${valori(m.scarta)})` : "Fine turno";
  }
}

/** Testo di una cosa successa (registro e fumetti). */
export function descriviFatto(f: Fatto, nick: (id: string) => string, io: string): string {
  const chi = f.giocatore === io ? "Tu" : nick(f.giocatore);
  switch (f.tipo) {
    case "prendiNumero":
      return `${chi}: prende il ${f.valore} dal tavolo`;
    case "prendiPersonaggio":
      return `${chi}: prende ${nomeCarta(f.carta)} dal tavolo`;
    case "pescaNumero":
      return `${chi}: pesca una carta numero`;
    case "pescaPersonaggio":
      return f.carta ? `${chi}: pesca ${nomeCarta(f.carta)} (attacco)` : `${chi}: pesca un personaggio`;
    case "brucia":
      return `${chi}: brucia le carte numero`;
    case "attiva":
      return `${chi}: attiva ${nomeCarta(f.carta)}${f.punti > 0 ? ` (+${f.punti})` : ""}${f.mancia ? " e riceve la mancia dei nonni 🪙" : ""}`;
    case "potere":
      return `${chi}: usa ${nomePotere(f.carta, f.potere)}${f.bersaglio ? ` su ${nick(f.bersaglio)}` : ""}`;
    case "sceglie":
      return `${chi}: sceglie ${f.quante === 1 ? "una carta" : `${f.quante} carte`}`;
    case "attacco":
      return `⚔️ ${chi}: ${nomePotere(f.carta, f.potere)} contro ${elenco(f.bersagli.map(nick))}`;
    case "difesa":
      return f.riuscita
        ? `🛡️ ${chi}: si difende con ${nomePotere(f.carta, f.potere)}${f.girata ? ` (gira un ${f.girata}: dispari!)` : ""}${f.devia ? ` e passa l'attacco a ${nick(f.devia)}` : ""}`
        : `🛡️ ${chi}: prova ${nomePotere(f.carta, f.potere)}${f.girata ? `, gira un ${f.girata}: pari` : ""}… ma non funziona!`;
    case "colpito":
      return `💥 ${chi}: colpito`;
    case "protetto":
      return `✨ ${chi}: l'attacco non ha effetto`;
    case "scartaCarta":
      return `${chi}: scarta ${f.carta ? nomeCarta(f.carta) : "un personaggio nascosto"}`;
    case "caffe":
      return `${chi}: beve un caffè ☕`;
    case "fineTurno":
      return `${chi}: fine turno${f.scartate > 0 ? ` (scarta ${f.scartate})` : ""}`;
    case "ultimoGiro":
      return f.mazzo ? "📣 Il mazzo dei personaggi è finito: ultimo giro!" : `📣 Qualcuno è arrivato a ${f.punti} punti: ultimo giro!`;
    case "evento":
      return `🌙 ${chi}: pesca l'evento ${evento(f.evento).nome}`;
    case "punto":
      return `🎯 ${chi}: +1 punto (${f.motivo === "attacco" ? "attacco a segno" : f.motivo === "difesa" ? "difesa riuscita" : "aiuto usato"})`;
    case "fineEvento":
      return `Finisce l'evento ${evento(f.evento).nome}`;
    case "regalo":
      return `${chi}: regala una carta a ${f.a === io ? "te" : nick(f.a)}`;
    case "campanello":
      return `🔔 Suonano alla porta! Arrivano ${elenco(f.nuovi.map(nomeCarta))}`;
    case "sbuffa":
      return `😤 ${chi}: si scoccia e blocca ${nomePotere(f.carta, f.potere)} di ${f.a === io ? "te" : nick(f.a)}`;
  }
}

/** Emoji del tipo di potere. */
export const EMOJI_TIPO = { attacco: "⚔️", difesa: "🛡️", aiuto: "✨" } as const;
