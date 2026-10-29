/**
 * Quanto è facile attivare ogni carta (studio del bilanciamento, passo 1). Per ogni codice si stima, pescando a caso dal
 * mazzo numeri (56 carte, senza mancia né caffè):
 * - quanto spesso una mano di 5 o di 7 carte lo contiene già;
 * - quante carte bisogna pescare in media, una dopo l'altra e tenendole tutte, per averlo.
 * Non conta le carte scoperte sul tavolo né il limite di 7 carte in mano: serve a confrontare i codici tra loro.
 */
import { type StatoCasuale, creaCasuale, mescola } from "@og/engine";
import { CARTE } from "./carte";
import { descriviCodice, puoPagare } from "./codici";
import { creaMazzoNumeri } from "./mazzi";
import type { Carta, CartaNumero, Codice } from "./tipi-carte";

/** Nessun codice usa più di 4 carte dello stesso valore: le copie in più non servono (e rallentano la verifica). */
function alMassimo4(carte: CartaNumero[]): CartaNumero[] {
  const quante = new Map<number, number>();
  return carte.filter((c) => {
    const n = (quante.get(c.valore) ?? 0) + 1;
    quante.set(c.valore, n);
    return n <= 4;
  });
}

const paga = (codice: Codice, mano: CartaNumero[]) => puoPagare({ mano: alMassimo4(mano), mancia: [] }, codice);

/** Quante volte su `prove` una mano di `carte` carte prese a caso contiene il codice (da 0 a 1). */
export function probabilitaInMano(codice: Codice, carte: number, prove: number, rng: StatoCasuale): number {
  const mazzo = creaMazzoNumeri();
  let si = 0;
  for (let i = 0; i < prove; i++) if (paga(codice, mescola(rng, mazzo).slice(0, carte))) si++;
  return si / prove;
}

/** Carte da pescare in media (tenendole tutte) per avere il codice; chi non ci arriva entro `massimo` conta `massimo`. */
export function cartePerAverlo(codice: Codice, prove: number, rng: StatoCasuale, massimo = 40): number {
  const mazzo = creaMazzoNumeri();
  let totale = 0;
  for (let i = 0; i < prove; i++) {
    const ordine = mescola(rng, mazzo);
    // si cerca il primo numero di carte che basta, dividendo a metà (con più carte il codice c'è ancora)
    let basso = 1;
    let alto = massimo;
    if (!paga(codice, ordine.slice(0, alto))) {
      totale += massimo;
      continue;
    }
    while (basso < alto) {
      const meta = Math.floor((basso + alto) / 2);
      if (paga(codice, ordine.slice(0, meta))) alto = meta;
      else basso = meta + 1;
    }
    totale += alto;
  }
  return totale / prove;
}

export interface DifficoltaCarta {
  carta: Carta;
  con5: number;
  con7: number;
  carteMedie: number;
}

/** La difficoltà di tutte le carte (le carte con lo stesso codice si calcolano una volta sola). */
export function difficolta(prove = 3000, seme = 1): DifficoltaCarta[] {
  const rng = creaCasuale(seme);
  const giaFatti = new Map<string, Omit<DifficoltaCarta, "carta">>();
  return CARTE.map((carta) => {
    const chiave = JSON.stringify(carta.codice);
    let d = giaFatti.get(chiave);
    if (!d) {
      d = {
        con5: probabilitaInMano(carta.codice, 5, prove, rng),
        con7: probabilitaInMano(carta.codice, 7, prove, rng),
        carteMedie: cartePerAverlo(carta.codice, Math.ceil(prove / 3), rng),
      };
      giaFatti.set(chiave, d);
    }
    return { carta, ...d };
  });
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const n1 = (x: number) => x.toFixed(1).replace(".", ",");
const media = (v: number[]) => v.reduce((s, x) => s + x, 0) / Math.max(1, v.length);
function mediana(v: number[]): number {
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m]! : (o[m - 1]! + o[m]!) / 2;
}
const TIPO: Record<string, string> = { attacco: "⚔️", difesa: "🛡️", aiuto: "✨" };
const tipoCarta = (c: Carta) => [...new Set(c.poteri.map((p) => (p.blu ? "🟢" : TIPO[p.tipo])))].join("");

/** Resoconto in markdown, con le carte fuori misura per il loro livello. */
export function rapportoDifficolta(d: DifficoltaCarta[], prove: number): string {
  const personaggi = d.filter((x) => x.carta.categoria === "personaggio");
  const perLivello = (l: number) => personaggi.filter((x) => x.carta.livello === l);
  const med = (l: number) => mediana(perLivello(l).map((x) => x.con7));
  const righe: string[] = [];
  const r = (s = "") => righe.push(s);
  r("# La Famiglia – quanto è facile attivare le carte");
  r();
  r(`Per ogni codice: ${prove} mani prese a caso dal mazzo numeri (56 carte, 7 per valore), senza mancia né caffè.`);
  r("- **Con 5 / con 7 carte**: quante volte una mano di 5 o 7 carte prese a caso contiene già il codice.");
  r("- **Carte da pescare**: quante carte servono in media, pescandole una dopo l'altra e tenendole tutte, per avere il codice");
  r("  (≈ turni: pescando 3 carte a turno). Chi non ci arriva entro 40 carte conta 40.");
  r();
  r("> Non conta le carte scoperte sul tavolo (che si possono scegliere), la mancia e il caffè (+1), né il limite di 7 carte in mano:");
  r("> nel gioco vero i codici sono un po' più facili. Serve a confrontare i codici tra loro.");
  r();
  r("## Media per livello (personaggi)");
  r();
  r("| Livello | Carte | Con 5 carte | Con 7 carte (media) | Con 7 carte (mediana) | Carte da pescare | ≈ turni |");
  r("| --- | --- | --- | --- | --- | --- | --- |");
  for (const l of [1, 2, 3]) {
    const v = perLivello(l);
    const cm = media(v.map((x) => x.carteMedie));
    r(`| ${l} | ${v.length} | ${pct(media(v.map((x) => x.con5)))} | ${pct(media(v.map((x) => x.con7)))} | ${pct(med(l))} | ${n1(cm)} | ${n1(cm / 3)} |`);
  }
  r();
  // fuori misura: più facili della metà delle carte del livello sotto, o più difficili della metà di quelle del livello sopra
  const facili = personaggi.filter((x) => x.carta.livello > 1 && x.con7 >= med(x.carta.livello - 1));
  const difficili = personaggi.filter((x) => x.carta.livello < 3 && x.con7 <= med(x.carta.livello + 1));
  const nome = (x: DifficoltaCarta) => `${x.carta.nome}${x.carta.categoria === "personaggio" && x.carta.id !== x.carta.persona ? ` ${x.carta.livello}` : ""}`;
  const elenco = (v: DifficoltaCarta[]) => (v.length ? v.map((x) => `${nome(x)} (${pct(x.con7)}, ${descriviCodice(x.carta.codice)})`).join(", ") : "nessuna");
  r("## 🔎 Da guardare");
  r();
  r(`- **Troppo facili per il loro livello** (con 7 carte le hai più spesso della metà delle carte del livello sotto): ${elenco(facili)}`);
  r(`- **Troppo difficili per il loro livello** (le hai meno spesso della metà delle carte del livello sopra): ${elenco(difficili)}`);
  r();
  const tabella = (titolo: string, v: DifficoltaCarta[]) => {
    r(`## ${titolo}`);
    r();
    r("Dalla più facile alla più difficile.");
    r();
    r("| Carta | Tipo | Codice | Con 5 carte | Con 7 carte | Carte da pescare | ≈ turni |");
    r("| --- | --- | --- | --- | --- | --- | --- |");
    for (const x of [...v].sort((a, b) => b.con7 - a.con7 || a.carteMedie - b.carteMedie)) {
      r(`| ${nome(x)} | ${tipoCarta(x.carta)} | ${descriviCodice(x.carta.codice)} | ${pct(x.con5)} | ${pct(x.con7)} | ${n1(x.carteMedie)} | ${n1(x.carteMedie / 3)} |`);
    }
    r();
  };
  for (const l of [1, 2, 3]) tabella(`Personaggi di livello ${l}`, perLivello(l));
  tabella("Carte difesa e attacco usa e getta", d.filter((x) => x.carta.categoria !== "personaggio"));
  return righe.join("\n");
}
