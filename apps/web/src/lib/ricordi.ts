/** Piccole preferenze salvate nel browser (es. l'ultimo nickname usato). Mai dati importanti. */

const CHIAVE_NICKNAME = "og.nickname";
const CHIAVE_AVATAR = "og.avatar";

export function avatarSalvato(): string {
  try {
    return localStorage.getItem(CHIAVE_AVATAR) ?? "mago";
  } catch {
    return "mago";
  }
}

export function salvaAvatar(id: string): void {
  try {
    localStorage.setItem(CHIAVE_AVATAR, id);
  } catch {
    // memoria del browser non disponibile: si richiederà la prossima volta
  }
}

export function nicknameSalvato(): string {
  try {
    return localStorage.getItem(CHIAVE_NICKNAME) ?? "";
  } catch {
    return "";
  }
}

export function salvaNickname(nickname: string): void {
  try {
    localStorage.setItem(CHIAVE_NICKNAME, nickname.trim());
  } catch {
    // Browser in modalità privata o memoria bloccata: pazienza, lo si richiede la prossima volta.
  }
}
