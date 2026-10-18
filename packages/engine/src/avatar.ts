/**
 * Libreria degli avatar che un giocatore può scegliere entrando in una partita.
 * Per ora sono disegni-emoji su un cerchio colorato; più avanti si potranno sostituire con illustrazioni.
 */
export interface Avatar {
  id: string;
  nome: string;
  simbolo: string;
  /** Colore di sfondo del cerchio. */
  colore: string;
}

export const AVATAR: readonly Avatar[] = [
  { id: "mago", nome: "Mago", simbolo: "🧙", colore: "#3b4a9e" },
  { id: "elfa", nome: "Elfa", simbolo: "🧝‍♀️", colore: "#2f7d4a" },
  { id: "fata", nome: "Fata", simbolo: "🧚", colore: "#b04a9a" },
  { id: "vampiro", nome: "Vampiro", simbolo: "🧛", colore: "#7a1f2b" },
  { id: "eroe", nome: "Eroe", simbolo: "🦸", colore: "#c0392b" },
  { id: "principessa", nome: "Principessa", simbolo: "👸", colore: "#c08a12" },
  { id: "re", nome: "Re", simbolo: "🤴", colore: "#8a6420" },
  { id: "drago", nome: "Drago", simbolo: "🐉", colore: "#2e6b3a" },
  { id: "unicorno", nome: "Unicorno", simbolo: "🦄", colore: "#8e5bc4" },
  { id: "volpe", nome: "Volpe", simbolo: "🦊", colore: "#d2691e" },
  { id: "lupo", nome: "Lupo", simbolo: "🐺", colore: "#4b5563" },
  { id: "gufo", nome: "Gufo", simbolo: "🦉", colore: "#6b4f2a" },
  { id: "orso", nome: "Orso", simbolo: "🐻", colore: "#8b5a2b" },
  { id: "leone", nome: "Leone", simbolo: "🦁", colore: "#c9971c" },
  { id: "gatto", nome: "Gatto", simbolo: "🐱", colore: "#e0884a" },
  { id: "fantasma", nome: "Fantasma", simbolo: "👻", colore: "#5b6b8c" },
  { id: "robot", nome: "Robot", simbolo: "🤖", colore: "#3a7ca5" },
  { id: "pirata", nome: "Pirata", simbolo: "🏴‍☠️", colore: "#1f2937" },
];

export const AVATAR_PREDEFINITO = "mago";

export function avatar(id: string | null | undefined): Avatar {
  return AVATAR.find((a) => a.id === id) ?? AVATAR[0]!;
}

export const avatarValido = (id: unknown): id is string => typeof id === "string" && AVATAR.some((a) => a.id === id);
