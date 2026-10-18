/**
 * Avatar dei giocatori. Ci sono più stili:
 * - "classici": 18 disegni-emoji su un cerchio colorato (id semplice, es. "mago");
 * - stili disegnati dal browser a partire da un "seme" casuale (id "stile:seme", es. "pixel:k3x9q2"):
 *   lo stesso id dà sempre lo stesso avatar, su tutti i dispositivi.
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

/** Stili di avatar: il primo sono i classici, gli altri sono disegnati a partire da un seme. */
export const STILI_AVATAR = [
  { id: "classici", nome: "Classici" },
  { id: "avventuriero", nome: "Avventurieri" },
  { id: "ritratto", nome: "Ritratti" },
  { id: "pixel", nome: "Pixel" },
  { id: "robottino", nome: "Robottini" },
] as const;

export type StileAvatar = (typeof STILI_AVATAR)[number]["id"];

const DISEGNATO = /^(avventuriero|ritratto|pixel|robottino|faccina):[a-z0-9]{4,12}$/;

/**
 * Stile di un avatar ("classici" per quelli della libreria fissa e per gli stili non più proposti,
 * come le "faccine": chi le ha già le tiene, ma non si possono più scegliere).
 */
export function stileAvatar(id: string): StileAvatar {
  const i = id.indexOf(":");
  const stile = i > 0 ? id.slice(0, i) : "classici";
  return STILI_AVATAR.some((s) => s.id === stile) ? (stile as StileAvatar) : "classici";
}

export const avatarValido = (id: unknown): id is string =>
  typeof id === "string" && (AVATAR.some((a) => a.id === id) || DISEGNATO.test(id));

/** Un avatar a caso dello stile scelto; `casuale` restituisce un numero in [0, 1). */
export function avatarCasuale(stile: StileAvatar, casuale: () => number = Math.random): string {
  if (stile === "classici") {
    const scelti = AVATAR.filter((a) => a.id !== "robot"); // il robot è dei giocatori del computer
    return scelti[Math.floor(casuale() * scelti.length)]!.id;
  }
  const lettere = "abcdefghijklmnopqrstuvwxyz0123456789";
  const seme = Array.from({ length: 8 }, () => lettere[Math.floor(casuale() * lettere.length)]).join("");
  return `${stile}:${seme}`;
}
