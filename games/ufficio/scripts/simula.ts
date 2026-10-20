/**
 * Simula molte partite tra bot e scrive le statistiche.
 * Uso: pnpm simula [numero partite, default 1000]
 */
import { writeFileSync } from "node:fs";
import { rapporto, simula } from "../src/simulazione";

const n = Number(process.argv[2] ?? 1000);
const inizio = Date.now();
const st = simula(n);
const testo = rapporto(st) + `\nTempo di calcolo: ${((Date.now() - inizio) / 1000).toFixed(1)} secondi.\n`;
const file = new URL("../../../docs/ufficio/statistiche-simulazione.md", import.meta.url);
writeFileSync(file, testo);
console.log(testo);
process.exit(st.errori.length > 0 || st.bloccate.length > 0 ? 1 : 0);
