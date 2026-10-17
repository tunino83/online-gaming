/** Piccole preferenze salvate nel browser (es. l'ultimo nickname usato). Mai dati importanti. */

const CHIAVE_NICKNAME = "og.nickname";

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
