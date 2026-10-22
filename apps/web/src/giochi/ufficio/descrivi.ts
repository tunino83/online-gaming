/**
 * Testi in italiano per le mosse e le carte del primo gioco, a partire dalla vista del giocatore.
 */
import {
  type CartaDiamante,
  type CartaNumero,
  type CartaPersonaggio,
  type Evento,
  type Effetto,
  type Elemento,
  type Mossa,
  type VistaGiocatore,
  personaggio,
} from "@og/ufficio";

/** "il 7", "l'8", "l'1": articolo giusto davanti a un numero. */
export const ilNumero = (n: number | string | undefined) =>
  n === 1 || n === 8 || n === 11 || n === "1" || n === "8" ? `l'${n}` : `il ${n ?? "?"}`;

/** "a Bruno", "ad Anna". */
export const aPersona = (nome: string) => (/^[aA]/.test(nome) ? `ad ${nome}` : `a ${nome}`);

/** Tutte le carte che il giocatore può vedere, per id. */
export interface Carte {
  numeri: Map<string, CartaNumero>;
  diamanti: Map<string, CartaDiamante>;
  personaggi: Map<string, CartaPersonaggio>;
}

export function raccogliCarte(v: VistaGiocatore): Carte {
  const numeri = new Map<string, CartaNumero>();
  const diamanti = new Map<string, CartaDiamante>();
  const personaggi = new Map<string, CartaPersonaggio>();
  for (const c of [...v.mano, ...(v.manoAvversario ?? [])]) numeri.set(c.id, c);
  for (const c of v.tavolo.numeri) if (c) numeri.set(c.id, c);
  for (const c of v.tavolo.personaggi) if (c) personaggi.set(c.id, c);
  if (v.primoPersonaggio) personaggi.set(v.primoPersonaggio.id, v.primoPersonaggio);
  for (const g of Object.values(v.giocatori)) {
    for (const d of g.diamanti) diamanti.set(d.id, d);
    for (const c of [...g.posti, ...g.attivati]) personaggi.set(c.id, c);
  }
  return { numeri, diamanti, personaggi };
}

export const nomePersonaggio = (c: Carte, id: string) => {
  const carta = c.personaggi.get(id);
  return carta ? personaggio(carta.personaggio).nome : "personaggio";
};

export const testoDiamante = (d: CartaDiamante | undefined) =>
  !d ? "◆" : d.tipo === "fulmine" ? "⚡ fulmine" : `◆${d.valore}`;

function testoElemento(el: Elemento, c: Carte): string {
  if (el.tipo === "virtuale") return `${el.valore} (carta di ${nomePersonaggio(c, el.fonte)})`;
  const base = el.tipo === "numero" ? c.numeri.get(el.id)?.valore : (() => {
    const d = c.diamanti.get(el.id);
    return d?.tipo === "valore" ? d.valore : undefined;
  })();
  if (el.tipo === "diamante" && el.valore === undefined) return `${testoDiamante(c.diamanti.get(el.id))} come diamante`;
  const prefisso = el.tipo === "diamante" ? "◆" : "";
  if (el.modifica) {
    const segno = el.modifica.delta > 0 ? "+1" : "−1";
    return `${el.valore} (${prefisso}${base}${segno} con ${testoDiamante(c.diamanti.get(el.modifica.diamante))})`;
  }
  if (base !== undefined && base !== el.valore) return `${el.valore} (${prefisso}${base} trasformato)`;
  return `${prefisso}${el.valore}`;
}

/** Frase che descrive una mossa, dal punto di vista di chi la fa. */
export function descriviMossa(m: Mossa, v: VistaGiocatore, c: Carte, nickname: (id: string) => string): string {
  const sulTavolo = (posizione: number) => {
    const carta = v.tavolo.personaggi[posizione];
    return carta ? personaggio(carta.personaggio).nome : "personaggio";
  };
  switch (m.tipo) {
    case "prendiNumero":
      return `Prendi ${ilNumero(v.tavolo.numeri[m.posizione]?.valore)} dal tavolo`;
    case "prendiPersonaggio":
      return `Prendi ${sulTavolo(m.posizione)} dal tavolo`;
    case "pescaNumero":
      return "Pesca una carta numero coperta";
    case "pescaPersonaggio":
      return "Pesca un personaggio coperto";
    case "brucia":
      return "Brucia le 4 carte numero del tavolo";
    case "bruciaGratis":
      return "Brucia gratis (Bacchetta magica)";
    case "giocaFulmine":
      return "Gioca un fulmine: +1 mossa";
    case "dueInDiamante":
      return "Scambia un 2 con un diamante (Biancaneve)";
    case "scambiaConTavolo":
      return `Scambia ${nomePersonaggio(c, m.carta)} con ${sulTavolo(m.posizione)} del tavolo (Cappellaio)`;
    case "scartaPersonaggio":
      return `Scarta ${nomePersonaggio(c, m.carta)}`;
    case "prendiDaFatina":
      return `Prendi ${ilNumero(c.numeri.get(m.carta)?.valore)}`;
    case "fineTurno": {
      const parti = ["Fine turno"];
      if (m.scarta.length > 0) parti.push(`scartando ${m.scarta.map((id) => c.numeri.get(id)?.valore ?? "?").join(", ")}`);
      if (m.cambiaMano) parti.push("e cambia tutta la mano (Scheletro)");
      return parti.join(" ");
    }
    case "attiva": {
      let testo = `Attiva ${nomePersonaggio(c, m.carta)} con ${m.combinazione.map((el) => testoElemento(el, c)).join(" + ")}`;
      if (m.tieni) {
        const tenuta = c.numeri.get(m.tieni)?.valore ?? testoDiamante(c.diamanti.get(m.tieni));
        testo += `, tenendo ${typeof tenuta === "number" ? ilNumero(tenuta) : `il ${tenuta}`}`;
      }
      if (m.bersaglio) testo += `, scartando ${nomePersonaggio(c, m.bersaglio.carta)} di ${nickname(m.bersaglio.giocatore)}`;
      if (m.avversario) testo += `, guardando la mano di ${nickname(m.avversario)}`;
      return testo;
    }
  }
}

/** Gruppo in cui mostrare la mossa. */
export function gruppoMossa(m: Mossa): "scelta" | "attiva" | "tavolo" | "gratis" | "fine" {
  switch (m.tipo) {
    case "scartaPersonaggio":
    case "prendiDaFatina":
      return "scelta";
    case "attiva":
      return "attiva";
    // Si fanno toccando il tavolo (carte, mazzi, pulsanti "Brucia")
    case "prendiNumero":
    case "prendiPersonaggio":
    case "pescaNumero":
    case "pescaPersonaggio":
    case "brucia":
    case "bruciaGratis":
      return "tavolo";
    case "fineTurno":
      return "fine";
    default:
      return "gratis";
  }
}

/** Frase per una voce del registro ("Bruno ha preso il 7 dal tavolo"). */
export function descriviEvento(e: Evento, nickname: (id: string) => string, io: string): string {
  const chi = e.giocatore === io ? "Hai" : `${nickname(e.giocatore)} ha`;
  const nome = (id: string) => personaggio(id).nome;
  const di = (id: string) => (id === io ? "tuo" : `di ${nickname(id)}`);
  switch (e.tipo) {
    case "prendiNumero":
      return `${chi} preso ${ilNumero(e.valore)} dal tavolo`;
    case "prendiPersonaggio":
      return `${chi} preso ${nome(e.personaggio)} dal tavolo`;
    case "pescaNumero":
      return `${chi} pescato una carta numero`;
    case "pescaPersonaggio":
      return `${chi} pescato ${nome(e.personaggio)}`;
    case "brucia":
      return `${chi} bruciato le carte numero del tavolo${e.gratis ? " (Bacchetta magica)" : ""}`;
    case "frecce":
      return `È uscito un ${e.valore} con le frecce: personaggi cambiati${e.nuovi.length ? ` (ora ${e.nuovi.map(nome).join(" e ")})` : ""}`;
    case "attiva": {
      let t = `${chi} attivato ${nome(e.personaggio)}${e.valori.length ? ` con ${e.valori.join(", ")}` : ""} (+${e.punti})`;
      if (e.da) t += `, la Lucciola ${di(e.da)}`;
      if (e.bersaglio) t += `, scartando ${nome(e.bersaglio.personaggio)} ${di(e.bersaglio.giocatore)}`;
      if (e.avversario) t += `, guardando la mano ${e.avversario === io ? "tua" : `di ${nickname(e.avversario)}`}`;
      return t;
    }
    case "scartaPersonaggio":
      return `${chi} scartato ${nome(e.personaggio)}`;
    case "fulmine":
      return `${chi} giocato un fulmine (+1 mossa)`;
    case "dueInDiamante":
      return `${chi} scambiato ${e.diamante ? "un diamante 2" : "un 2"} con un diamante (Biancaneve)`;
    case "scambiaConTavolo":
      return `${chi} scambiato ${nome(e.dato)} con ${nome(e.preso)} del tavolo (Cappellaio)`;
    case "prendiDaFatina":
      return `${chi} preso una carta dalla mano ${e.da === io ? "tua" : `di ${nickname(e.da)}`} (Fatina)`;
    case "fineTurno": {
      const parti = [`${e.giocatore === io ? "Hai chiuso" : `${nickname(e.giocatore)} ha chiuso`} il turno`];
      if (e.scartate > 0) parti.push(`scartando ${e.scartate} ${e.scartate === 1 ? "carta" : "carte"}`);
      if (e.cambiaMano) parti.push("e cambiato la mano (Scheletro)");
      return parti.join(" ");
    }
    case "ultimoGiro":
      return `${e.giocatore === io ? "Hai" : `${nickname(e.giocatore)} ha`} raggiunto ${e.punti} punti: ultimo giro!`;
  }
}

/** Etichetta breve di un potere blu, per la striscia "Poteri" (icona + poche parole). */
/**
 * Ordine in cui mostrare i poteri blu: prima le carte dei nani (dall'1 al 7), poi la Fenice (8),
 * poi il Drago (carta a scelta), infine tutti gli altri poteri.
 */
export const ordinePotere = (e: Effetto): number =>
  e.tipo === "cartaVirtuale" ? (e.valore === "aScelta" ? 9 : e.valore) : 100;

export function etichettaPotere(e: Effetto): { icona: string; testo: string } {
  switch (e.tipo) {
    case "cartaVirtuale":
      return { icona: e.valore === 8 ? "🔥" : e.valore === "aScelta" ? "🐉" : "⛏️", testo: e.valore === "aScelta" ? "carta a scelta" : `un ${e.valore}` };
    case "mosseInPiuOgniTurno":
      return { icona: "🧺", testo: `+${e.mosse} mossa` };
    case "limiteMano":
      return { icona: "🐒", testo: `+${e.aumento} mano` };
    case "vediMazzoPersonaggi":
      return { icona: "🔮", testo: "vede il mazzo" };
    case "bruciaGratis":
      return { icona: "🪄", testo: "brucia gratis" };
    case "unoValeOtto":
      return { icona: "🏹", testo: "1 = 8" };
    case "cambiaMano":
      return { icona: "💀", testo: "cambia mano" };
    case "scambiaConTavolo":
      return { icona: "🎩", testo: "scambio" };
    case "diamanteMenoUno":
      return { icona: "⚔️", testo: "◆ anche −1" };
    case "treJolly":
      return { icona: "🍀", testo: "3 = jolly" };
    case "dueInDiamante":
      return { icona: "🍎", testo: "2 → ◆" };
    case "scartaPersonaggioAvversario":
      return { icona: "🐍", testo: "scarta un avversario" };
    case "tieniUnaCartaDelCodice":
      return { icona: "🐾", testo: "tieni 1 carta" };
    case "riceviDiamanti":
      return { icona: "💎", testo: `+${e.quanti} diamant${e.quanti === 1 ? "e" : "i"}` };
    case "mosseExtraOra":
      return { icona: "⚡", testo: `+${e.mosse} mosse ora` };
    case "mossaExtraAlSuccessivo":
      return { icona: "👻", testo: "+1 mossa al prossimo" };
    case "rubaCarta":
      return { icona: "🧚", testo: "ruba 1 carta" };
    case "attivabileDaVicini":
      return { icona: "✦", testo: "anche dai vicini" };
    default:
      return { icona: "✨", testo: "potere" };
  }
}
