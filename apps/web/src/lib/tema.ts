/**
 * Tema dell'app: "scuro" (blu) o "chiaro" (pergamena). La scelta resta salvata sul dispositivo;
 * se non si è mai scelto, si segue l'impostazione chiaro/scuro del telefono o del computer.
 */
import { useSyncExternalStore } from "react";

export type Tema = "scuro" | "chiaro";
const CHIAVE = "og.tema";
const ascoltatori = new Set<() => void>();

function temaIniziale(): Tema {
  try {
    const salvato = localStorage.getItem(CHIAVE);
    if (salvato === "scuro" || salvato === "chiaro") return salvato;
  } catch {
    // memoria del browser non disponibile
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "chiaro" : "scuro";
}

let attuale: Tema = temaIniziale();

/** Da chiamare all'avvio, prima di disegnare l'app (evita il lampo del tema sbagliato). */
export function applicaTema(tema: Tema = attuale): void {
  attuale = tema;
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "chiaro" ? "#f3e9d2" : "#1d2d4f");
  for (const a of ascoltatori) a();
}

export function cambiaTema(): void {
  const nuovo: Tema = attuale === "scuro" ? "chiaro" : "scuro";
  try {
    localStorage.setItem(CHIAVE, nuovo);
  } catch {
    // vale solo per questa visita
  }
  applicaTema(nuovo);
}

export function useTema(): Tema {
  return useSyncExternalStore(
    (a) => {
      ascoltatori.add(a);
      return () => ascoltatori.delete(a);
    },
    () => attuale,
  );
}
