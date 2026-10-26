/**
 * Confronto tra le strategie "attivatore" e "poteri" con varie varianti delle regole.
 * Uso: pnpm strategie:famiglia [partite per riga, default 500]
 */
import { writeFileSync } from "node:fs";
import { VARIANTI, confronta, rapportoConfronto } from "../src/strategie";

const n = Number(process.argv[2] ?? 500);
const inizio = Date.now();
const risultati = VARIANTI.flatMap((v) => [confronta(v.nome, v.opzioni, 2, n), confronta(v.nome, v.opzioni, 4, n)]);
const testo = rapportoConfronto(risultati, n) + `Tempo di calcolo: ${((Date.now() - inizio) / 1000).toFixed(0)} secondi.\n`;
writeFileSync(new URL("../../../docs/famiglia/confronto-strategie.md", import.meta.url), testo);
console.log(testo);
process.exit(risultati.some((r) => r.errori > 0) ? 1 : 0);
