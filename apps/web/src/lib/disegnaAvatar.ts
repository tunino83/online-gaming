/**
 * Disegna gli avatar "a stili" (id "stile:seme") con DiceBear, direttamente nel browser.
 * Lo stesso seme dà sempre lo stesso disegno. I disegni già fatti si tengono in memoria.
 */
import { createAvatar } from "@dicebear/core";
import { adventurer, bottts, funEmoji, lorelei, pixelArt } from "@dicebear/collection";

const STILI = { avventuriero: adventurer, ritratto: lorelei, pixel: pixelArt, robottino: bottts, faccina: funEmoji } as const;
const SFONDI = ["f2d58a", "c0aede", "b6e3f4", "ffd5dc", "d1f4d1", "ffdfbf"];
const memoria = new Map<string, string>();

/** Immagine (data URI) dell'avatar, oppure null se l'id non è di uno stile disegnato. */
export function immagineAvatar(id: string): string | null {
  const i = id.indexOf(":");
  if (i <= 0) return null;
  const stile = STILI[id.slice(0, i) as keyof typeof STILI];
  if (!stile) return null;
  let uri = memoria.get(id);
  if (!uri) {
    // biome-ignore lint: ogni stile ha le sue opzioni; qui si usano solo quelle comuni
    uri = createAvatar(stile as any, { seed: id.slice(i + 1), backgroundColor: SFONDI }).toDataUri();
    memoria.set(id, uri);
  }
  return uri;
}
