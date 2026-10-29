/**
 * Uso dei poteri dei personaggi attivati e poteri di aiuto ✨ (vedi docs/famiglia/bozza.md e le decisioni in regolamento.md).
 * Usare un potere costa una mossa (lo conta regole.ts; i poteri gratis no); poi la carta diventa stanca per il suo tempo di ricarica
 * (i poteri blu no: funzionano una volta per turno anche se la carta è stanca).
 * Gli attacchi e le difese sono in attacchi.ts.
 */
import { type IdGiocatore, interoTra, mescola } from "@og/engine";
import {
  avversariDopo,
  cartaVera,
  pesca,
  peschiNumeri,
  puoPescare,
  registra,
  riceviCarta,
  riempiTavolo,
  rifiuta,
  scartaNumeri,
  stancaCarta,
  togliNumero,
  zonaDi,
  premioPotere,
  liberaPostoDifesa,
} from "./base";
import { DIFESE_ANCHE_PROATTIVE, avviaAttacco, parametriAttacco } from "./attacchi";
import { MEDICI, carta } from "./carte";
import { poteriBloccati } from "./effetti-eventi";
import type { AiutoSospeso, Attivato, Mossa, ParametriPotere, StatoGiocatore, StatoPartita } from "./stato";
import type { Carta, CartaNumero, CopiaCarta } from "./tipi-carte";

type MossaPotere = Extract<Mossa, { tipo: "potere" }>;

/** Poteri che copiano un altro potere (Sempre la stessa storia, Ma come ti vesti?). */
export const POTERI_COPIA = new Set(["sempre-la-stessa-storia", "giacca-al-rovescio"]);

/**
 * Poteri che non costano mosse: Non sbaglio mai (la pescata sbagliata non conta) e quelli che danno mosse in più
 * (altrimenti spendere una mossa per averne una non servirebbe a niente: deciso il 2026-10-25).
 */
export const POTERI_GRATIS = new Set([
  "te-l-ho-gia-detto",
  "l-ho-gia-detto",
  "anima-della-festa",
  "mangia-mangia-mangia",
  // blu che si usano (una volta per turno)
  "sono-due-etti-e-mezzo-lascio",
  "studia-il-fascicolo",
  "lezione-di-padel",
  "sposta-i-mobili",
  "medico-in-famiglia",
  "grigliata",
  "straordinario",
]);

/**
 * Poteri blu che funzionano da soli (non si "usano"): Un caffè, Questi so della campagna, Cin cin (attivando), Ne ho viste tante (pescando),
 * Aperitivo (difendendosi con vini e Campari), Puzza di brace (quando un avversario usa Diavolina o O al sangue o niente).
 */
export const BLU_DA_SOLI = new Set(["un-caffe", "l-orto", "prosecco", "ne-ho-viste-tante", "aperitivo", "puzza-di-brace"]);

/** Voci del menu di Generoso (Offre la casa). */
const MENU = ["caffe", "birra", "colazione"] as const;

/** Avversari di `id` con la Puzza di brace (Chicca 1 attivata, anche stanca): Diavolina e O al sangue o niente ricaricano 1 carta in meno. */
function puzzaDiBrace(s: StatoPartita, id: IdGiocatore): IdGiocatore[] {
  return avversariDopo(s, id).filter((x) => s.giocatori[x]!.attivati.some((a) => a.copia.carta === "chicca-1"));
}

/** Chi sente la puzza di brace pesca 1 carta numero. */
function sentonoLaPuzza(s: StatoPartita, nasi: IdGiocatore[]): void {
  for (const x of nasi) {
    registra(s, x, { tipo: "potere", carta: "chicca-1", potere: "puzza-di-brace" });
    peschiNumeri(s, x, 1);
  }
}


/* ------------------------------------------------------------------ */
/* Uso di un potere                                                    */
/* ------------------------------------------------------------------ */

/** Un potere si può copiare? Aiuti, attacchi e difese da usare nel proprio turno, ma non gli altri poteri che copiano. */
function copiabile(c: Carta, potere: string): boolean {
  const p = c.poteri.find((x) => x.id === potere);
  if (!p || p.blu || POTERI_COPIA.has(potere)) return false;
  return p.tipo !== "difesa" || DIFESE_ANCHE_PROATTIVE.has(potere);
}

/** Il potere che si usa davvero: quello della carta, oppure quello copiato (Sempre la stessa storia, Ma come ti vesti?). */
function potereDaUsare(s: StatoPartita, id: IdGiocatore, c: Carta, potere: string, m: ParametriPotere): { origine: Carta; potere: string } {
  if (potere === "sempre-la-stessa-storia") {
    const u = s.ultimoPotere;
    if (!u || !copiabile(carta(u.carta), u.potere)) rifiuta("Non c'è un potere da ripetere");
    return { origine: carta(u!.carta), potere: u!.potere };
  }
  if (potere === "giacca-al-rovescio") {
    const fonte = s.ordine
      .filter((x) => x !== id)
      .flatMap((x) => s.giocatori[x]!.attivati)
      .find((a) => a.copia.id === m.fonte && a.stanca === 0);
    if (!fonte) rifiuta("Scegli una carta attivata e carica di un avversario");
    const origine = carta(fonte!.copia.carta);
    const copiato = m.potereCopiato ?? origine.poteri[0]!.id;
    if (!copiabile(origine, copiato)) rifiuta("Questo potere non si può copiare");
    return { origine, potere: copiato };
  }
  return { origine: c, potere };
}

/**
 * Usa un potere di un proprio personaggio attivato e carico: aiuto, attacco, o difesa da usare nel proprio turno.
 * `appenaPescata` è la carta pescata con la mossa precedente (se lo era), per Non sbaglio mai:
 * regole.ts la azzera prima di ogni mossa, quindi la passa qui.
 */
export function usaPotere(s: StatoPartita, id: IdGiocatore, m: MossaPotere, appenaPescata: StatoPartita["turno"]["appenaPescata"]): void {
  const g = s.giocatori[id]!;
  const a = g.attivati.find((x) => x.copia.id === m.carta);
  if (!a) rifiuta("Puoi usare solo i poteri dei tuoi personaggi attivati");
  const c = carta(a!.copia.carta);
  const p = c.poteri.find((x) => x.id === m.potere);
  if (!p) rifiuta("Questo personaggio non ha quel potere");
  if (a!.stanca > 0 && !p!.blu) rifiuta("Questa carta è stanca: deve ricaricarsi"); // i poteri blu funzionano anche da stanca
  if (s.turno.zitto) rifiuta("In questo turno non puoi usare poteri (BLA BLA BLA BLA)");
  if (poteriBloccati(s, c.id)) rifiuta("Durante questo evento Totò non può usare i suoi poteri");
  if (p!.blu) {
    if (BLU_DA_SOLI.has(p!.id)) rifiuta("Questa carta è sempre attiva: funziona da sola");
    if (s.turno.bluUsati.includes(p!.id)) rifiuta("Questo potere si usa una volta per turno");
    s.turno.bluUsati.push(p!.id);
  } else if (POTERI_GRATIS.has(p!.id)) {
    // Un potere gratis si usa una volta per turno per carta (anche se la carta non si stanca, es. Totò alla Resurrezione)
    const chiave = `gratis:${a!.copia.id}`;
    if (s.turno.bluUsati.includes(chiave)) rifiuta("Questo potere gratis si usa una volta per turno");
    s.turno.bluUsati.push(chiave);
  }
  if (p!.tipo === "difesa" && !DIFESE_ANCHE_PROATTIVE.has(p!.id)) rifiuta("Questa difesa si usa quando ti attaccano");

  const { origine, potere } = potereDaUsare(s, id, c, p!.id, m);
  const tipo = origine.poteri.find((x) => x.id === potere)!.tipo;
  s.ultimoPotere = { carta: origine.id, potere };
  if (!p!.blu) stancaCarta(s, a!);
  if (tipo === "attacco") {
    avviaAttacco(s, id, origine, potere, m, origine === c ? a!.copia.id : null);
    return;
  }
  if (potere === "nuvola-di-fumo") g.protetto = true;
  else if (potere === "benedizione") s.benedizione = id;
  if (tipo !== "aiuto") {
    registra(s, id, { tipo: "potere", carta: origine.id, potere });
    return;
  }
  const sospeso: AiutoSospeso = { di: id, copia: a!.copia.id, carta: origine.id, potere, parametri: m, appenaPescata };
  const stuffosa = chiSiScoccia(s, id);
  if (stuffosa) {
    // Prima si controlla che l'aiuto si possa fare davvero (su una copia), poi si aspetta Checca
    eseguiAiuto(structuredClone(s), sospeso);
    s.turno.aiutoSospeso = sospeso;
    s.turno.attesa = { tipo: "stuffosa", giocatore: stuffosa, di: id, carta: origine.id, potere };
    registra(s, id, { tipo: "potere", carta: origine.id, potere });
    return;
  }
  eseguiAiuto(s, sospeso);
}

/** Applica un aiuto (subito, o dopo che Stuffosa ha lasciato stare): effetto, punto per l'aiuto e registro. */
function eseguiAiuto(s: StatoPartita, x: AiutoSospeso): void {
  const g = s.giocatori[x.di]!;
  const questa = g.attivati.find((y) => y.copia.id === x.copia)!;
  const bersaglio = applicaAiuto(s, x.di, g, questa, x.potere, x.parametri, x.appenaPescata);
  if (s.opzioni.puntiPerGliAiuti !== false && !s.turno.premioAiuto) {
    premioPotere(s, x.di, "aiuto");
    s.turno.premioAiuto = true;
  }
  if (!s.turno.aiutoSospeso) registra(s, x.di, { tipo: "potere", carta: x.carta, potere: x.potere, ...(bersaglio ? { bersaglio } : {}) });
}

/** Avversario di `id` che può scocciarsi con Stuffosa (Checca 3 attivata e carica, almeno 2 carte numero in mano). */
function chiSiScoccia(s: StatoPartita, id: IdGiocatore): IdGiocatore | undefined {
  return avversariDopo(s, id).find((x) => {
    const g = s.giocatori[x]!;
    return g.mano.length >= 2 && g.attivati.some((a) => a.copia.carta === "checca-3" && a.stanca === 0);
  });
}

/** Risposta di chi ha Stuffosa: nessuna carta = lascia stare (l'aiuto funziona), 2 carte = le scarta e blocca l'aiuto. */
function rispondiStuffosa(s: StatoPartita, id: IdGiocatore, carte: string[]): void {
  const t = s.turno;
  const x = t.aiutoSospeso!;
  t.attesa = null;
  if (carte.length === 0) {
    eseguiAiuto(s, x);
    t.aiutoSospeso = null;
    return;
  }
  const g = s.giocatori[id]!;
  scartaNumeri(s, carteDallaMano(g, carte, 2, 2));
  stancaCarta(s, g.attivati.find((a) => a.copia.carta === "checca-3"));
  t.aiutoSospeso = null;
  registra(s, id, { tipo: "sbuffa", a: x.di, carta: x.carta, potere: x.potere });
  premioPotere(s, id, "difesa");
}

/** Applica l'effetto; restituisce il giocatore coinvolto (per il registro), se c'è. */
function applicaAiuto(
  s: StatoPartita,
  id: IdGiocatore,
  g: StatoGiocatore,
  questa: Attivato,
  potere: string,
  m: ParametriPotere,
  appenaPescata: StatoPartita["turno"]["appenaPescata"],
): IdGiocatore | undefined {
  const t = s.turno;
  switch (potere) {
    /* ---------------- mosse in più ---------------- */
    case "ci-penso-domani":
      g.mosseProssimoTurno += 2;
      return;
    case "anima-della-festa":
      // La festa: 3 mosse in più adesso, poi nei 2 turni dopo 1 mossa in meno
      t.mosseRimaste += 3;
      g.dopoLaFesta = 2;
      return;
    case "doppio-turno":
      t.doppioTurno = true;
      return;
    case "te-l-ho-gia-detto":
    case "l-ho-gia-detto": {
      if (!t.ultimaMossa) rifiuta("Prima devi fare una mossa da ripetere");
      const quante = potere === "te-l-ho-gia-detto" ? 1 : 2;
      const gia = t.mosseUguali?.tipo === t.ultimaMossa ? t.mosseUguali!.quante : 0;
      t.mosseUguali = { tipo: t.ultimaMossa!, quante: gia + quante };
      return;
    }

    /* ---------------- pescare ---------------- */
    case "cucina-per-200":
      peschiNumeri(s, id, 4);
      for (const altro of avversariDopo(s, id)) {
        const c = pesca(s, "numeri");
        if (c) s.giocatori[altro]!.mano.push(c);
      }
      return;
    case "pranzo-a-domicilio":
      peschiNumeri(s, id, 2);
      // Poi, se vuole, scambia 1 carta numero con una del tavolo
      if (g.mano.some((c) => !c.unite) && s.tavolo.numeri.some((c) => c !== null)) t.attesa = { tipo: "scambiaTavolo", giocatore: id };
      return;
    case "colazione":
      peschiNumeri(s, id, 2);
      pescaPersonaggio(s, id);
      return;
    case "offre-la-casa": {
      const scelte = m.scelte ?? [];
      if (scelte.length !== 2 || scelte[0] === scelte[1] || !scelte.every((x) => (MENU as readonly string[]).includes(x))) {
        rifiuta("Scegli 2 voci diverse tra caffè, birra e colazione");
      }
      for (const voce of scelte) {
        if (voce === "caffe") t.mosseRimaste += 2;
        else if (voce === "birra") peschiNumeri(s, id, 2);
      }
      if (scelte.includes("colazione")) pescaPersonaggio(s, id); // per ultima: può chiedere di scartare
      return;
    }
    case "sono-due-etti-e-mezzo-lascio":
      // La prima mossa del turno era una pescata: si rifà gratis dallo stesso mazzo
      if (!t.primaPescata) rifiuta("Si usa solo se la prima mossa del turno è stata una pescata");
      if (t.primaPescata === "numeri") {
        if (peschiNumeri(s, id, 1).length === 0) rifiuta("Il mazzo numeri è vuoto");
      } else {
        if (!puoPescare(s, "personaggi")) rifiuta("Il mazzo personaggi è vuoto");
        pescaPersonaggio(s, id);
      }
      return;
    case "frigge-di-tutto": {
      const carte = carteDallaMano(g, m.carte, 1, Infinity);
      scartaNumeri(s, carte);
      peschiNumeri(s, id, carte.length + 1);
      return;
    }
    case "total-black": {
      // Maddalena veste sempre e solo nero: si bruciano le carte scoperte e il tavolo resta vuoto per un giro
      if (s.buio) rifiuta("Il tavolo è già al buio");
      scartaNumeri(s, s.tavolo.numeri.filter((c): c is CartaNumero => c !== null));
      s.scarti.personaggi.push(...s.tavolo.personaggi.filter((c): c is CopiaCarta => c !== null));
      s.tavolo.numeri = s.tavolo.numeri.map(() => null);
      s.tavolo.personaggi = s.tavolo.personaggi.map(() => null);
      s.buio = id;
      return;
    }

    /* ---------------- tavolo e scarti ---------------- */
    case "sposta-i-mobili":
      s.scarti.numeri.push(...s.tavolo.numeri.filter((c) => c !== null));
      s.scarti.personaggi.push(...s.tavolo.personaggi.filter((c) => c !== null));
      s.tavolo.numeri = s.tavolo.numeri.map(() => null);
      s.tavolo.personaggi = s.tavolo.personaggi.map(() => null);
      riempiTavolo(s);
      return;
    case "scaffale": {
      const disponibili = s.tavolo.numeri.flatMap((c, i) => (c ? [i] : []));
      const posizioni = m.posizioni ?? [];
      if (new Set(posizioni).size !== posizioni.length || posizioni.length !== Math.min(2, disponibili.length)) {
        rifiuta("Scegli 2 carte numero diverse dal tavolo");
      }
      for (const pos of posizioni) {
        const c = s.tavolo.numeri[pos];
        if (!c) rifiuta("Nessuna carta in quella posizione");
        g.mano.push(c!);
        s.tavolo.numeri[pos] = null;
      }
      return;
    }
    case "mangia-mangia-mangia":
      // Mangia alla cieca: 4 carte dal mazzo, poi 2 turni di indigestione
      peschiNumeri(s, id, 4);
      g.indigestione = 2;
      return;
    case "un-filo-di-trucco": {
      // La carta resta la stessa ma vale 1 in più o in meno (quando lascia la mano torna vera)
      const [c] = carteDallaMano(g, m.carte, 1, 1);
      if (c!.unite) rifiuta("Una carta fatta in casa non si trucca");
      const nuovo = m.valore ?? 0;
      if (Math.abs(nuovo - c!.valore) !== 1 || nuovo < 1 || nuovo > 8) rifiuta("La carta truccata vale 1 in più o 1 in meno (da 1 a 8)");
      const vero = c!.valoreVero ?? c!.valore;
      const { valoreVero: _vecchio, ...normale } = c!;
      g.mano.push(nuovo === vero ? { ...normale, valore: vero } : { ...normale, valore: nuovo as CartaNumero["valore"], valoreVero: vero });
      return;
    }
    case "straordinario":
      // Gratis: 1 mossa in più adesso e 1 nel prossimo turno
      t.mosseRimaste += 1;
      g.mosseProssimoTurno += 1;
      return;
    case "lezione-di-padel": {
      const [mia] = carteDallaMano(g, m.carte, 1, 1);
      if (mia!.unite) rifiuta("Una carta fatta in casa non va sul tavolo"); // la mossa rifiutata non cambia niente
      const pos = m.posizioni?.length === 1 ? m.posizioni[0]! : -1;
      const dalTavolo = s.tavolo.numeri[pos];
      if (!dalTavolo) rifiuta("Scegli una carta numero del tavolo");
      s.tavolo.numeri[pos] = cartaVera(mia!);
      g.mano.push(dalTavolo!);
      return;
    }
    case "la-vita-e-una-ruota": {
      if (s.ultimoTurno !== null) rifiuta("Durante l'ultimo giro la ruota non gira");
      const n = s.ordine.length;
      if (n === 2) {
        // In 2 il senso non cambierebbe niente: "oggi a me, domani a te", vi scambiate 1 carta numero a caso
        const altro = avversariDopo(s, id)[0]!;
        const o = s.giocatori[altro]!;
        if (g.mano.length === 0 || o.mano.length === 0) rifiuta("Servono carte numero in mano a tutti e due");
        const mia = g.mano.splice(interoTra(s.rng, 0, g.mano.length - 1), 1)[0]!;
        const sua = o.mano.splice(interoTra(s.rng, 0, o.mano.length - 1), 1)[0]!;
        g.mano.push(sua);
        o.mano.push(mia);
        return altro;
      }
      // L'ordine si specchia attorno a chi la usa (che resta al suo posto): dopo di lui gioca chi giocava prima.
      // Il conto dei turni e dei giri non cambia.
      const i = s.ordine.indexOf(id);
      const prima = [...s.ordine];
      s.ordine = prima.map((_, j) => prima[(2 * i - j + 2 * n) % n]!);
      s.antiorario = !s.antiorario;
      return;
    }
    case "ce-l-ho-io": {
      const v = m.valore;
      if (!Number.isInteger(v) || v! < 1 || v! > 8) rifiuta("Scegli un numero da 1 a 8");
      const i = s.mazzi.numeri.findIndex((c) => c.valore === v);
      if (i >= 0) {
        g.mano.push(...s.mazzi.numeri.splice(i, 1));
        s.mazzi.numeri = mescola(s.rng, s.mazzi.numeri); // chi l'ha cercata ha visto il mazzo: si rimescola
      }
      return; // se nel mazzo non c'è, non si prende niente
    }

    /* ---------------- scelte tra carte scoperte ---------------- */
    case "frutta-e-verdura": {
      const carte = pescaFinoA(s, 4);
      if (carte.length > 0) t.attesa = { tipo: "scegliNumeri", giocatore: id, motivo: "frutta", carte, quante: Math.min(2, carte.length), coda: [] };
      return;
    }
    case "patate-al-forno": {
      // Tante carte quanti i giocatori: chi la usa ne prende 2, poi gli altri 1 a testa finché ce ne sono
      const carte = pescaFinoA(s, s.ordine.length);
      if (carte.length > 0) t.attesa = { tipo: "scegliNumeri", giocatore: id, motivo: "patate", carte, quante: 2, coda: avversariDopo(s, id) };
      return;
    }
    case "ogni-cosa-al-suo-posto": {
      // Prima se ne prende 1, poi le altre si rimettono nel mazzo nell'ordine scelto
      const carte = pescaFinoA(s, 5);
      if (carte.length > 0) t.attesa = { tipo: "scegliNumeri", giocatore: id, motivo: "posto", carte, quante: 1, coda: [] };
      return;
    }

    /* ---------------- carte numero in mano ---------------- */
    case "fatto-in-casa": {
      const coppia = carteDallaMano(g, m.carte, 2, 2);
      const valore = coppia[0]!.valore + coppia[1]!.valore;
      if (valore > 8) rifiuta("La somma deve essere al massimo 8"); // la mossa rifiutata non cambia niente
      g.mano.push({ id: `casa-${coppia[0]!.id}`, valore: valore as CartaNumero["valore"], unite: [coppia[0]!, coppia[1]!] });
      return;
    }

    /* ---------------- ricarica e informazioni ---------------- */
    case "brace-accesa": {
      // 2 altre carte stanche (o 1, se è l'unica); con la Puzza di brace di Chicca una in meno
      const stanche = g.attivati.filter((x) => x !== questa && x.stanca > 0);
      const scelte = m.bersagli ?? [];
      const nasi = puzzaDiBrace(s, id);
      const quante = Math.min(nasi.length > 0 ? 1 : 2, stanche.length);
      const ricaricate = stanche.filter((x) => scelte.includes(x.copia.id));
      if (quante === 0 || new Set(scelte).size !== scelte.length || ricaricate.length !== scelte.length || scelte.length !== quante) {
        rifiuta(quante <= 1 ? "Scegli un'altra tua carta stanca" : "Scegli 2 altre tue carte stanche");
      }
      for (const x of ricaricate) x.stanca = 0;
      sentonoLaPuzza(s, nasi);
      return;
    }
    case "medico-in-famiglia": {
      const i = s.scarti.personaggi.findIndex((c) => c.id === m.bersaglio && MEDICI.has(c.carta));
      if (i < 0) rifiuta("Scegli Dottor Racioppi o Zia Diana dalla pila degli scarti");
      riceviCarta(s, id, s.scarti.personaggi.splice(i, 1)[0]!);
      return;
    }
    case "il-mio-corpo-che-cambia": {
      const vecchia = g.attivati.find((x) => x.copia.id === m.propria && x !== questa);
      if (!vecchia) rifiuta("Scegli un'altra tua carta attivata");
      const nuova = [...g.nascosti, ...g.attacchi].find((c) => c.id === m.bersaglio && carta(c.carta).categoria === "personaggio");
      if (!nuova) rifiuta("Scegli un personaggio da attivare che hai in mano");
      // La nuova si attiva senza codice ma stanca; la vecchia torna in mano
      const zona = zonaDi(nuova!);
      g[zona].splice(g[zona].indexOf(nuova!), 1);
      g.attivati[g.attivati.indexOf(vecchia!)] = { copia: nuova!, stanca: carta(nuova!.carta).ricarica };
      liberaPostoDifesa(s, id, nuova!);
      riceviCarta(s, id, vecchia!.copia);
      return;
    }
    case "grigliata": {
      // Con la Puzza di brace di Chicca una delle carte stanche (a caso) resta stanca
      const stanche = g.attivati.filter((x) => x !== questa && x.stanca > 0);
      const nasi = puzzaDiBrace(s, id);
      const resta = nasi.length > 0 && stanche.length > 0 ? stanche[interoTra(s.rng, 0, stanche.length - 1)] : undefined;
      for (const x of stanche) if (x !== resta) x.stanca = 0;
      sentonoLaPuzza(s, nasi);
      return;
    }
    case "ricetta": {
      for (const giocatore of s.ordine) {
        const x = s.giocatori[giocatore]!.attivati.find((y) => y.copia.id === m.bersaglio && y.stanca > 0);
        if (x) {
          x.stanca = 0;
          peschiNumeri(s, id, 1);
          return giocatore === id ? undefined : giocatore;
        }
      }
      return rifiuta("Scegli una carta stanca");
    }
    case "studia-il-fascicolo": {
      if (!m.giocatore || m.giocatore === id || !s.ordine.includes(m.giocatore)) rifiuta("Scegli un avversario");
      t.fascicolo = m.giocatore!;
      return m.giocatore;
    }
  }
  return rifiuta("Potere sconosciuto");
}

/** Pesca un personaggio e lo mette nella zona giusta (se la zona è piena, il giocatore sceglie cosa scartare). */
function pescaPersonaggio(s: StatoPartita, id: IdGiocatore): void {
  const c = pesca(s, "personaggi");
  if (c) riceviCarta(s, id, c);
}

/** Fino a `quante` carte dal mazzo numeri, scoperte (per Vincenzo, Patate, Ogni cosa al suo posto). */
function pescaFinoA(s: StatoPartita, quante: number): CartaNumero[] {
  const carte: CartaNumero[] = [];
  for (let i = 0; i < quante; i++) {
    const c = pesca(s, "numeri");
    if (c) carte.push(c);
  }
  return carte;
}

/** Toglie dalla mano le carte indicate (da `min` a `max`, senza ripetizioni) e le restituisce. */
function carteDallaMano(g: StatoGiocatore, ids: string[] | undefined, min: number, max: number): CartaNumero[] {
  const lista = ids ?? [];
  if (new Set(lista).size !== lista.length || lista.length < min || lista.length > max) {
    const quante = (n: number) => (n === 1 ? "1 carta numero" : `${n} carte numero`);
    rifiuta(min === max ? `Scegli ${quante(min)} dalla mano` : `Scegli da ${min} a ${quante(max)} dalla mano`);
  }
  if (!lista.every((x) => g.mano.some((c) => c.id === x))) rifiuta("Puoi scegliere solo carte che hai in mano");
  return lista.map((x) => g.mano.splice(g.mano.findIndex((c) => c.id === x), 1)[0]!);
}

/* ------------------------------------------------------------------ */
/* Risposte alle scelte dei poteri                                     */
/* ------------------------------------------------------------------ */

/** Il giocatore risponde a una scelta aperta da un potere (Vincenzo, Patate, Ne ho viste tante, Ogni cosa al suo posto). */
export function rispondiScelta(s: StatoPartita, id: IdGiocatore, m: Mossa): void {
  const a = s.turno.attesa;
  const g = s.giocatori[id]!;
  if (a?.tipo === "stuffosa" && m.tipo === "scegli") {
    rispondiStuffosa(s, id, m.carte);
    return;
  }
  if (a?.tipo === "scegliNumeri" && m.tipo === "scegli") {
    const quante = Math.min(a.quante, a.carte.length);
    if (new Set(m.carte).size !== m.carte.length || m.carte.length !== quante) rifiuta(`Scegli ${quante} carte`);
    if (!m.carte.every((x) => a.carte.some((c) => c.id === x))) rifiuta("Scegli tra le carte scoperte");
    g.mano.push(...a.carte.filter((c) => m.carte.includes(c.id)));
    const resto = a.carte.filter((c) => !m.carte.includes(c.id));
    registra(s, id, { tipo: "sceglie", quante });
    if (a.motivo === "patate" && resto.length > 0 && a.coda.length > 0) {
      s.turno.attesa = { ...a, giocatore: a.coda[0]!, carte: resto, quante: 1, coda: a.coda.slice(1) };
    } else if (a.motivo === "posto" && resto.length > 0) {
      s.turno.attesa = { tipo: "riordina", giocatore: id, carte: resto };
    } else {
      scartaNumeri(s, resto);
      s.turno.attesa = null;
    }
    return;
  }
  if (a?.tipo === "scegliPersonaggio" && m.tipo === "scegli") {
    const scelta = m.carte.length === 1 ? a.carte.find((c) => c.id === m.carte[0]) : undefined;
    if (!scelta) rifiuta("Scegli uno dei personaggi");
    // Le altre tornano in cima al mazzo, nello stesso ordine di prima
    s.mazzi.personaggi.push(...a.carte.filter((c) => c !== scelta).reverse());
    s.turno.attesa = null;
    registra(s, id, { tipo: "sceglie", quante: 1 });
    riceviCarta(s, id, scelta!);
    return;
  }
  if (a?.tipo === "canto" && m.tipo === "scegli") {
    // E one, E one ciù trii: una carta della mano per ogni avversario colpito, nello stesso ordine
    const quante = Math.min(a.a.length, g.mano.length);
    if (m.carte.length !== quante || new Set(m.carte).size !== quante || !m.carte.every((x) => g.mano.some((c) => c.id === x))) {
      rifiuta(quante === 1 ? "Scegli la carta da dare" : `Scegli ${quante} carte da dare, una per giocatore`);
    }
    m.carte.forEach((x, i) => {
      s.giocatori[a.a[i]!]!.mano.push(togliNumero(g, x)!);
      registra(s, id, { tipo: "regalo", a: a.a[i]! });
    });
    s.turno.attesa = null;
    s.turno.canto = null;
    return;
  }
  if (a?.tipo === "scambiaTavolo" && m.tipo === "scegli") {
    if (m.carte.length > 0) {
      const mia = m.carte.length === 2 ? g.mano.find((c) => c.id === m.carte[0] && !c.unite) : undefined;
      const pos = s.tavolo.numeri.findIndex((c) => c !== null && c.id === m.carte[1]);
      if (!mia || pos < 0) rifiuta("Scegli una tua carta numero e una del tavolo");
      g.mano.push(s.tavolo.numeri[pos]!);
      s.tavolo.numeri[pos] = cartaVera(togliNumero(g, mia!.id)!);
    }
    s.turno.attesa = null;
    return;
  }
  if (a?.tipo === "riordina" && m.tipo === "riordina") {
    const ids = a.carte.map((c) => c.id);
    if (m.ordine.length !== ids.length || [...m.ordine].sort().join() !== [...ids].sort().join()) rifiuta("Rimetti tutte le carte, ognuna una volta");
    const perId = new Map(a.carte.map((c) => [c.id, c]));
    s.mazzi.numeri.push(...[...m.ordine].reverse().map((x) => perId.get(x)!));
    s.turno.attesa = null;
    return;
  }
  rifiuta("Prima devi completare la scelta in sospeso");
}

/** Mosse valide per rispondere a una scelta aperta da un potere (alcune possibilità, non tutte). */
export function mosseDiScelta(s: StatoPartita): Mossa[] {
  const a = s.turno.attesa;
  if (a?.tipo === "scegliNumeri") {
    const quante = Math.min(a.quante, a.carte.length);
    const ids = a.carte.map((c) => c.id);
    return quante === 1 ? ids.map((x) => ({ tipo: "scegli", carte: [x] })) : coppie(ids).map((carte) => ({ tipo: "scegli", carte }));
  }
  if (a?.tipo === "scegliPersonaggio") return a.carte.map((c) => ({ tipo: "scegli", carte: [c.id] }));
  if (a?.tipo === "canto") {
    // Alcune possibilità: le prime, le ultime, le più basse, le più alte
    const g = s.giocatori[a.giocatore]!;
    const quante = Math.min(a.a.length, g.mano.length);
    const perValore = [...g.mano].sort((x, y) => x.valore - y.valore).map((c) => c.id);
    const ids = g.mano.map((c) => c.id);
    const scelte = [ids.slice(0, quante), ids.slice(-quante), perValore.slice(0, quante), perValore.slice(-quante)];
    return [...new Map(scelte.map((x) => [x.join(), x])).values()].map((carte): Mossa => ({ tipo: "scegli", carte }));
  }
  if (a?.tipo === "scambiaTavolo") {
    // Niente scambio, oppure una carta per valore della mano con una del tavolo di valore diverso
    const g = s.giocatori[a.giocatore]!;
    const perValore = [...new Map(g.mano.filter((c) => !c.unite).map((c) => [c.valore, c])).values()];
    const tavolo = s.tavolo.numeri.filter((c): c is CartaNumero => c !== null);
    return [
      { tipo: "scegli", carte: [] },
      ...perValore.flatMap((c) => tavolo.filter((x) => x.valore !== c.valore).map((x): Mossa => ({ tipo: "scegli", carte: [c.id, x.id] }))),
    ];
  }
  if (a?.tipo === "stuffosa") {
    // Lascia stare (per primo: è quello che fa il sostituto), oppure scarta 2 carte: le più basse o le prime due
    const g = s.giocatori[a.giocatore]!;
    const basse = [...g.mano].sort((x, y) => x.valore - y.valore).slice(0, 2).map((c) => c.id);
    const prime = g.mano.slice(0, 2).map((c) => c.id);
    return [{ tipo: "scegli", carte: [] }, ...[...new Map([basse, prime].map((x) => [[...x].sort().join(), x])).values()].map((carte): Mossa => ({ tipo: "scegli", carte }))];
  }
  if (a?.tipo === "riordina") {
    const ids = a.carte.map((c) => c.id);
    return [{ tipo: "riordina", ordine: ids }, { tipo: "riordina", ordine: [...ids].reverse() }];
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Poteri che si possono usare adesso                                  */
/* ------------------------------------------------------------------ */

/** Usi possibili dei poteri (con alcune scelte dei parametri, non tutte). */
export function mosseDiPotere(s: StatoPartita, id: IdGiocatore): Mossa[] {
  if (s.turno.zitto) return [];
  const g = s.giocatori[id]!;
  const mosse: Mossa[] = [];
  for (const a of g.attivati) {
    if (poteriBloccati(s, a.copia.carta)) continue;
    const c = carta(a.copia.carta);
    for (const p of c.poteri) {
      if (a.stanca > 0 && !p.blu) continue;
      if (p.tipo === "difesa" && !DIFESE_ANCHE_PROATTIVE.has(p.id)) continue;
      if (p.blu && (BLU_DA_SOLI.has(p.id) || s.turno.bluUsati.includes(p.id))) continue;
      if (!p.blu && POTERI_GRATIS.has(p.id) && s.turno.bluUsati.includes(`gratis:${a.copia.id}`)) continue;
      const base = { tipo: "potere" as const, carta: a.copia.id, potere: p.id };
      for (const parametri of usiPossibili(s, id, g, a, c, p.id)) mosse.push({ ...base, ...parametri });
    }
  }
  return mosse;
}

/** Scelte possibili per un potere, compresi quelli copiati. */
function usiPossibili(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, a: Attivato, c: Carta, potere: string): ParametriPotere[] {
  if (potere === "sempre-la-stessa-storia") {
    const u = s.ultimoPotere;
    return u && copiabile(carta(u.carta), u.potere) ? parametriDi(s, id, g, a, carta(u.carta), u.potere) : [];
  }
  if (potere === "giacca-al-rovescio") {
    return s.ordine
      .filter((x) => x !== id)
      .flatMap((x) => s.giocatori[x]!.attivati.filter((y) => y.stanca === 0))
      .flatMap((y) => {
        const origine = carta(y.copia.carta);
        return origine.poteri
          .filter((q) => copiabile(origine, q.id))
          .flatMap((q) => parametriDi(s, id, g, a, origine, q.id).slice(0, 3).map((x) => ({ ...x, fonte: y.copia.id, potereCopiato: q.id })));
      })
      .slice(0, 12);
  }
  return parametriDi(s, id, g, a, c, potere);
}

function parametriDi(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, a: Attivato, c: Carta, potere: string): ParametriPotere[] {
  const tipo = c.poteri.find((x) => x.id === potere)!.tipo;
  if (tipo === "attacco") return parametriAttacco(s, id, potere);
  if (tipo === "difesa") return [{}]; // Nuvola di fumo, Maschio e femmina li creò
  return parametriPossibili(s, id, g, a, potere);
}

function parametriPossibili(s: StatoPartita, id: IdGiocatore, g: StatoGiocatore, questa: Attivato, potere: string): ParametriPotere[] {
  const t = s.turno;
  const mano = g.mano.map((c) => c.id);
  const posizioniNumeri = s.tavolo.numeri.flatMap((c, i) => (c ? [i] : []));
  switch (potere) {
    case "te-l-ho-gia-detto":
    case "l-ho-gia-detto":
      return t.ultimaMossa ? [{}] : [];
    case "total-black":
      return s.buio ? [] : [{}];
    case "offre-la-casa":
      return [["caffe", "birra"], ["caffe", "colazione"], ["birra", "colazione"]].map((scelte) => ({ scelte }));
    case "frigge-di-tutto":
      return mano.length === 0 ? [] : [{ carte: mano }, ...mano.slice(0, 5).map((x) => ({ carte: [x] }))];
    case "la-vita-e-una-ruota": {
      if (s.ultimoTurno !== null) return [];
      if (s.ordine.length > 2) return [{}];
      const altro = s.giocatori[avversariDopo(s, id)[0]!]!;
      return g.mano.length > 0 && altro.mano.length > 0 ? [{}] : [];
    }
    case "scaffale":
      if (posizioniNumeri.length === 0) return [];
      return posizioniNumeri.length === 1 ? [{ posizioni: posizioniNumeri }] : coppie(posizioniNumeri).map((posizioni) => ({ posizioni }));
    case "mangia-mangia-mangia":
      return puoPescare(s, "numeri") ? [{}] : [];
    case "sono-due-etti-e-mezzo-lascio":
      return t.primaPescata && puoPescare(s, t.primaPescata) ? [{}] : [];
    case "lezione-di-padel": {
      // Carte uguali danno lo stesso scambio: se ne propone uno solo
      const perValore = [...new Map(g.mano.filter((c) => !c.unite).map((c) => [c.valore, c])).values()];
      return perValore.flatMap((c) =>
        posizioniNumeri.filter((p) => s.tavolo.numeri[p]!.valore !== c.valore).map((p) => ({ carte: [c.id], posizioni: [p] })),
      );
    }
    case "ce-l-ho-io":
      return [1, 2, 3, 4, 5, 6, 7, 8].map((valore) => ({ valore }));
    case "un-filo-di-trucco": {
      // Per ogni valore in mano (non fatte in casa): 1 in più o 1 in meno
      const perValore = [...new Map(g.mano.filter((c) => !c.unite).map((c) => [c.valore, c])).values()];
      return perValore.flatMap((c) => [c.valore - 1, c.valore + 1].filter((x) => x >= 1 && x <= 8).map((valore) => ({ carte: [c.id], valore })));
    }
    case "pranzo-a-domicilio":
      return puoPescare(s, "numeri") ? [{}] : [];
    case "medico-in-famiglia":
      return [...new Map(s.scarti.personaggi.filter((c) => MEDICI.has(c.carta)).map((c) => [c.carta, c])).values()].map((c) => ({ bersaglio: c.id }));
    case "il-mio-corpo-che-cambia": {
      const daAttivare = [...g.nascosti, ...g.attacchi].filter((c) => carta(c.carta).categoria === "personaggio");
      return g.attivati
        .filter((x) => x !== questa)
        .flatMap((x) => daAttivare.map((c) => ({ propria: x.copia.id, bersaglio: c.id })));
    }
    case "fatto-in-casa": {
      const somme = coppie(mano).filter(([a, b]) => valoreDi(g, a!) + valoreDi(g, b!) <= 8);
      return somme.slice(0, 6).map((carte) => ({ carte }));
    }
    case "brace-accesa": {
      const stanche = g.attivati.filter((x) => x !== questa && x.stanca > 0).map((x) => x.copia.id);
      return stanche.length <= 1 || puzzaDiBrace(s, id).length > 0 ? stanche.map((x) => ({ bersagli: [x] })) : coppie(stanche).map((bersagli) => ({ bersagli }));
    }
    case "ricetta":
      return s.ordine.flatMap((x) => s.giocatori[x]!.attivati.filter((y) => y.stanca > 0).map((y) => ({ bersaglio: y.copia.id })));
    case "studia-il-fascicolo":
      return avversariDopo(s, id).map((giocatore) => ({ giocatore }));
    case "ogni-cosa-al-suo-posto":
    case "frutta-e-verdura":
    case "patate-al-forno":
      return puoPescare(s, "numeri") ? [{}] : [];
    default:
      return [{}];
  }
}

const valoreDi = (g: StatoGiocatore, id: string) => g.mano.find((c) => c.id === id)!.valore;

/** Tutte le coppie di elementi diversi. */
function coppie<T>(lista: T[]): T[][] {
  return lista.flatMap((a, i) => lista.slice(i + 1).map((b) => [a, b]));
}
