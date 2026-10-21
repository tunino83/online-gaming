/**
 * Avatar "a stili" (id "stile:seme"): i disegni li fa la libreria DiceBear (lib/avatarDiceBear.ts),
 * che è grande, quindi si scarica solo la prima volta che serve un avatar disegnato.
 */
import { useEffect, useState } from "react";
import { importaConRicarica } from "./caricaPigro";

type Modulo = typeof import("./avatarDiceBear");
let caricamento: Promise<Modulo> | null = null;
let modulo: Modulo | null = null;
const carica = () => (caricamento ??= importaConRicarica(() => import("./avatarDiceBear")).then((m) => (modulo = m)));

/** È un avatar disegnato (e non uno dei classici)? */
export const eDisegnato = (id: string | null | undefined): id is string => !!id && id.indexOf(":") > 0;

/** Immagine dell'avatar disegnato: null finché la libreria non è arrivata (o se non è un avatar disegnato). */
export function useImmagineAvatar(id: string | null | undefined): string | null {
  const [, aggiorna] = useState(0);
  const disegnato = eDisegnato(id);
  useEffect(() => {
    if (disegnato && !modulo) void carica().then(() => aggiorna((n) => n + 1));
  }, [disegnato]);
  if (!disegnato || !modulo) return null;
  return modulo.immagineAvatar(id);
}
