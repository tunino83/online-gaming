/**
 * Simula molte partite della Famiglia tra robot e scrive il resoconto sul bilanciamento.
 * Uso: pnpm simula:famiglia [numero partite, default 1000] [punti | mazzo]
 */
import { writeFileSync } from "node:fs";
import { rapporto, simula } from "../src/simulazione";

const n = Number(process.argv[2] ?? 1000);
const modoFine = process.argv[3] === "mazzo" ? "mazzo" : "punti";
const inizio = Date.now();
const st = simula(n, { modoFine });
const titolo = `La Famiglia – statistiche della simulazione (fine ${modoFine === "mazzo" ? "quando finisce il mazzo" : "a 20 punti"})`;
const testo = rapporto(st, titolo) + `\nTempo di calcolo: ${((Date.now() - inizio) / 1000).toFixed(1)} secondi.\n`;
const nome = modoFine === "mazzo" ? "statistiche-simulazione-mazzo.md" : "statistiche-simulazione.md";
writeFileSync(new URL(`../../../docs/famiglia/${nome}`, import.meta.url), testo);
console.log(testo);
process.exit(st.errori.length > 0 || st.bloccate.length > 0 ? 1 : 0);
