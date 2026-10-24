/**
 * Illustrazioni delle carte della Famiglia: games/famiglia/immagini/classica/<nome>.png|jpg|jpeg|webp|svg.
 * Per ogni carta si cerca prima l'immagine della carta (es. "antonio-2"), poi quella della persona ("antonio");
 * se non c'è nessuna delle due la carta mostra il nome scritto (vedi games/famiglia/immagini/LEGGIMI.md).
 * Le cartelle che iniziano con "_" non vanno online.
 */
import { carta, nomiImmagine } from "@og/famiglia";

const FILE = import.meta.glob(["../../../../../games/famiglia/immagini/classica/*.{png,jpg,jpeg,webp,svg}"], {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** nome del file senza estensione -> indirizzo dell'immagine */
const IMMAGINI = new Map(Object.entries(FILE).map(([percorso, url]) => [percorso.split("/").at(-1)!.replace(/\.[a-z]+$/, ""), url]));

/** Illustrazione della carta (id della carta, es. "antonio-2"), se c'è. */
export function immagineCarta(idCarta: string): string | undefined {
  for (const nome of nomiImmagine(carta(idCarta))) {
    const url = IMMAGINI.get(nome);
    if (url) return url;
  }
  return undefined;
}
