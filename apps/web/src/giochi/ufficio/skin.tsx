/**
 * Skin delle carte: stesse regole, immagini (e in futuro stile) diversi.
 * Le illustrazioni stanno in games/ufficio/immagini/<skin>/<id personaggio>.png|jpg|jpeg|webp;
 * se una skin non ha un personaggio, si usa quello della skin "classica".
 * Ogni giocatore sceglie la propria skin: la grafica non cambia le regole né ciò che vedono gli altri.
 */
import { createContext, type ReactNode, useContext } from "react";

export interface Skin {
  id: string;
  nome: string;
  descrizione: string;
}

/** Skin disponibili (per aggiungerne una: una riga qui + una cartella di immagini). */
export const SKIN: readonly Skin[] = [{ id: "classica", nome: "Classica", descrizione: "Illustrazioni fantasy originali" }];
export const SKIN_PREDEFINITA = "classica";

// Le cartelle che iniziano con "_" (es. _originali) non vengono incluse nel sito
const FILE_IMMAGINI = import.meta.glob(["../../../../../games/ufficio/immagini/*/*.{png,jpg,jpeg,webp}", "!../../../../../games/ufficio/immagini/_*/**"], {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** skin -> id personaggio -> indirizzo dell'immagine. Le cartelle che iniziano con "_" non sono skin. */
const IMMAGINI = new Map<string, Map<string, string>>();
for (const [percorso, url] of Object.entries(FILE_IMMAGINI)) {
  const [skin, file] = percorso.split("/").slice(-2) as [string, string];
  if (skin.startsWith("_")) continue;
  if (!IMMAGINI.has(skin)) IMMAGINI.set(skin, new Map());
  IMMAGINI.get(skin)!.set(file.replace(/\.[a-z]+$/, ""), url);
}

/** Illustrazione di un personaggio nella skin scelta, con ripiego sulla classica. */
export function immaginePersonaggio(id: string, skin: string = SKIN_PREDEFINITA): string | undefined {
  return IMMAGINI.get(skin)?.get(id) ?? IMMAGINI.get(SKIN_PREDEFINITA)?.get(id);
}

const ContestoSkin = createContext<string>(SKIN_PREDEFINITA);

export function FornitoreSkin({ skin, children }: { skin: string; children: ReactNode }) {
  const valida = SKIN.some((s) => s.id === skin) ? skin : SKIN_PREDEFINITA;
  return <ContestoSkin.Provider value={valida}>{children}</ContestoSkin.Provider>;
}

export const useSkin = () => useContext(ContestoSkin);
