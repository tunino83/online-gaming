/**
 * Quanto è facile attivare ogni carta: scrive docs/famiglia/codici-difficolta.md.
 * Uso: pnpm codici:famiglia [mani per codice, default 3000]
 */
import { writeFileSync } from "node:fs";
import { difficolta, rapportoDifficolta } from "../src/difficolta-codici";

const prove = Number(process.argv[2] ?? 3000);
const inizio = Date.now();
const testo = rapportoDifficolta(difficolta(prove), prove) + `\nTempo di calcolo: ${((Date.now() - inizio) / 1000).toFixed(0)} secondi.\n`;
writeFileSync(new URL("../../../docs/famiglia/codici-difficolta.md", import.meta.url), testo);
console.log(testo);
