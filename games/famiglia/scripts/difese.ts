/**
 * Confronto delle regole in prova contro le troppe difese: niente, limite delle difese, carico, tutti e due.
 * Per ogni modo: quanti attacchi vanno a segno, durata delle partite e chi vince tra i robot "attivatore" e "poteri".
 * Uso: npx tsx games/famiglia/scripts/difese.ts [partite, default 400] → docs/famiglia/confronto-difese.md
 */
import { writeFileSync } from "node:fs";
import type { OpzioniPartita } from "../src/parametri";
import { simula } from "../src/simulazione";
import { confronta } from "../src/strategie";

const n = Number(process.argv[2] ?? 400);
const MODI: { nome: string; opzioni: Partial<OpzioniPartita> }[] = [
  { nome: "Regole di adesso", opzioni: {} },
  { nome: "Limite delle difese", opzioni: { limiteDifese: true } },
  { nome: "Carico", opzioni: { carico: true } },
  { nome: "Limite + carico", opzioni: { limiteDifese: true, carico: true } },
];
const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
const uno = (x: number) => x.toFixed(1).replace(".", ",");

const inizio = Date.now();
const righe = MODI.map(({ nome, opzioni }) => {
  const st = simula(n, opzioni);
  const lanciati = st.attacchi.reduce((s, a) => s + a.lanciati, 0);
  const colpiti = st.attacchi.reduce((s, a) => s + a.colpiti, 0);
  const fermati = st.attacchi.reduce((s, a) => s + a.fermati, 0);
  const turni = Object.values(st.perNumeroGiocatori);
  const giri = turni.reduce((s, x) => s + x.giriMedi, 0) / turni.length;
  const due = confronta(nome, opzioni, 2, n);
  const quattro = confronta(nome, opzioni, 4, n);
  const errori = st.errori.length + st.bloccate.length + due.errori + quattro.errori;
  return { nome, colpiti: colpiti / Math.max(1, colpiti + fermati), perPartita: lanciati / st.partite, giri, due: due.vittoriePoteri, quattro: quattro.vittoriePoteri, errori };
});

const testo = `# La Famiglia – regole contro le troppe difese

${n} partite tra robot per ogni modo (da 2 a 5 giocatori), più ${n} in 2 e ${n} in 4 con le strategie a confronto.
"A segno" = attacchi che colpiscono, sul totale dei colpi (colpiti + fermati da una difesa).
"Vince il robot poteri" = percentuale di vittorie della strategia che usa i poteri contro quella che attiva e basta (50% = pari).

| Modo | Attacchi a segno | Attacchi per partita | Giri medi | Vince il robot "poteri" (in 2) | (in 4) | Errori |
| --- | --- | --- | --- | --- | --- | --- |
${righe.map((r) => `| ${r.nome} | ${pct(r.colpiti)} | ${uno(r.perPartita)} | ${uno(r.giri)} | ${pct(r.due / 100)} | ${pct(r.quattro / 100)} | ${r.errori} |`).join("\n")}

Tempo di calcolo: ${((Date.now() - inizio) / 1000).toFixed(0)} secondi.
`;
writeFileSync(new URL("../../../docs/famiglia/confronto-difese.md", import.meta.url), testo);
console.log(testo);
process.exit(righe.some((r) => r.errori > 0) ? 1 : 0);
