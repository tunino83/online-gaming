/**
 * Matrice attacchi contro difese della Famiglia: per ogni attacco, quali difese lo fermano e come.
 * Scrive docs/famiglia/matrice-attacchi-difese.md. Si lancia con: pnpm matrice:famiglia
 */
import { writeFileSync } from "node:fs";
import { CARTE, type Carta, DIFESE_PROATTIVE, descriviCodice } from "../src";

/** Attacchi contro tutti (non si possono deviare). */
const CONTRO_TUTTI = new Set(["manca-o-sale", "urla", "si-canta", "rospe-per-tutti", "zeppata-sui-social", "volo-infuocato", "risata-contagiosa", "multa"]);
/** Attacchi che fanno scartare carte numero o stancare carte: gli unici danni che la Guardia medica cura. */
const CURABILI = new Set(["bisiniss", "forno-a-legna", "urla", "smash", "il-bastone", "risata-contagiosa", "multa", "vento", "versa-il-vino", "la-tomacella", "volo-infuocato", "zeppata-sui-social"]);
const DEVIANO = new Set(["non-e-colpa-mia", "e-colpa-di-qualcun-altro"]);

interface Voce {
  carta: Carta;
  potere: string;
  nome: string;
}

const attacchi: Voce[] = CARTE.flatMap((c) => c.poteri.filter((p) => p.tipo === "attacco").map((p) => ({ carta: c, potere: p.id, nome: p.nome })));
const difese: Voce[] = CARTE.flatMap((c) =>
  c.poteri.filter((p) => p.tipo === "difesa" && !DIFESE_PROATTIVE.has(p.id)).map((p) => ({ carta: c, potere: p.id, nome: p.nome })),
);

/** Cosa succede se la difesa `d` risponde all'attacco `a`. */
function esito(a: Voce, d: Voce): string {
  if (d.carta.livello < a.carta.livello) return "·"; // regola del livello: non può
  if (DEVIANO.has(d.potere) && CONTRO_TUTTI.has(a.potere)) return "·"; // non si devia un attacco contro tutti
  if (d.potere === "forse-c-e-forse-no") return "½";
  if (d.potere === "guardia-medica") return CURABILI.has(a.potere) ? "🩹" : "–";
  if (DEVIANO.has(d.potere)) return "↪";
  if (d.potere === "permalosa") return "🔁";
  return "✓";
}

const breve = (v: Voce) => `${v.carta.nome}${v.carta.categoria === "personaggio" && v.carta.id !== v.carta.persona ? ` ${v.carta.livello}` : ""}`;

let md = `# La Famiglia – matrice attacchi contro difese

Generata da \`games/famiglia/scripts/matrice.ts\` (\`pnpm matrice:famiglia\`): si aggiorna da sola quando cambiano le carte.

**Come si legge**: righe = attacchi, colonne = difese (numerate, elenco sotto).
✓ la difesa ferma l'attacco · ↪ lo passa a un altro (Maddalena) · 🔁 lo rimanda a chi l'ha fatto (Permalosa) ·
½ lo ferma una volta su due (Marika 1) · 🩹 passa ma i danni si curano (Zia Diana) · – passa e non c'è niente da curare ·
· non si può usare (regola del livello, o deviazione contro un attacco contro tutti).

## Difese (colonne)

| N. | Difesa | Carta | Livello | Codice |
| --- | --- | --- | --- | --- |
${difese.map((d, i) => `| D${i + 1} | ${d.nome} | ${breve(d)} | ${d.carta.livello} | ${descriviCodice(d.carta.codice)} |`).join("\n")}

## Matrice

| Attacco | Liv. | Contro | ${difese.map((_, i) => `D${i + 1}`).join(" | ")} | Fermano |
| --- | --- | --- | ${difese.map(() => "---").join(" | ")} | --- |
${attacchi
  .map((a) => {
    const celle = difese.map((d) => esito(a, d));
    const fermano = celle.filter((c) => c === "✓" || c === "↪" || c === "🔁").length;
    return `| ${a.nome} (${breve(a)}) | ${a.carta.livello} | ${CONTRO_TUTTI.has(a.potere) ? "tutti" : "uno"} | ${celle.join(" | ")} | ${fermano} |`;
  })
  .join("\n")}

## Riepilogo

| Livello attacco | Attacchi | Difese che li fermano (✓ ↪ 🔁) |
| --- | --- | --- |
${[1, 2, 3]
  .map((l) => {
    const lista = attacchi.filter((a) => a.carta.livello === l);
    const fermano = lista.map((a) => difese.filter((d) => ["✓", "↪", "🔁"].includes(esito(a, d))).length);
    return `| ${l} | ${lista.length} | da ${Math.min(...fermano)} a ${Math.max(...fermano)} su ${difese.length} |`;
  })
  .join("\n")}

| Livello difesa | Difese | Attacchi che possono fermare |
| --- | --- | --- |
${[1, 2, 3]
  .map((l) => {
    const lista = difese.filter((d) => d.carta.livello === l);
    const quanti = lista.map((d) => attacchi.filter((a) => ["✓", "↪", "🔁"].includes(esito(a, d))).length);
    return `| ${l} | ${lista.length} | da ${Math.min(...quanti)} a ${Math.max(...quanti)} su ${attacchi.length} |`;
  })
  .join("\n")}
`;

writeFileSync(new URL("../../../docs/famiglia/matrice-attacchi-difese.md", import.meta.url), md);
console.log(`Matrice: ${attacchi.length} attacchi × ${difese.length} difese → docs/famiglia/matrice-attacchi-difese.md`);
