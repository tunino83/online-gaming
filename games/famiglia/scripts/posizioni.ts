/**
 * Controllo del vantaggio per posizione nell'ordine di gioco: tante partite con lo stesso numero di giocatori,
 * con semi diversi dalla simulazione normale. Uso: tsx games/famiglia/scripts/posizioni.ts [giocatori] [partite] [seme iniziale]
 */
import { simulaPartita } from "../src/simulazione";

const giocatori = Number(process.argv[2] ?? 5);
const n = Number(process.argv[3] ?? 2000);
const seme = Number(process.argv[4] ?? 100000);
const vittorie = Array.from({ length: giocatori }, () => 0);
const punti = Array.from({ length: giocatori }, () => 0);
let finite = 0;
for (let i = 0; i < n; i++) {
  const r = simulaPartita(seme + i, giocatori);
  if (!r.finita || r.errore) continue;
  finite++;
  for (const p of r.posizioniVincitori) vittorie[p]! += 1 / r.posizioniVincitori.length;
  r.punti.forEach((x, j) => (punti[j]! += x));
}
const sd = Math.sqrt((1 / giocatori) * (1 - 1 / giocatori) / finite) * 100;
console.log(`${finite} partite da ${giocatori}: vittorie per posizione (atteso ${(100 / giocatori).toFixed(1)}% ± ${(2 * sd).toFixed(1)})`);
console.log(vittorie.map((v, j) => `${j + 1}°: ${((100 * v) / finite).toFixed(1)}% (punti medi ${(punti[j]! / finite).toFixed(1)})`).join("\n"));
