/**
 * Scarica un pezzo del sito solo quando serve (es. il tavolo di un gioco).
 * Se nel frattempo è uscita una nuova versione del sito, il vecchio pezzo non esiste più:
 * allora si ricarica la pagina una volta, così si prende la versione nuova.
 */
import { type ComponentType, lazy } from "react";

const CHIAVE = "og.ricaricato";

export function importaConRicarica<T>(importa: () => Promise<T>): Promise<T> {
  return importa().then(
    (m) => {
      try {
        sessionStorage.removeItem(CHIAVE);
      } catch {
        // pazienza
      }
      return m;
    },
    (errore) => {
      let giaRicaricato = false;
      try {
        giaRicaricato = sessionStorage.getItem(CHIAVE) === "si";
        sessionStorage.setItem(CHIAVE, "si");
      } catch {
        // pazienza
      }
      if (!giaRicaricato) {
        window.location.reload();
        return new Promise<T>(() => {}); // la pagina si sta ricaricando
      }
      throw errore;
    },
  );
}

/** Come React.lazy, con la ricarica automatica dopo un aggiornamento del sito. */
export function pigro<P extends object>(importa: () => Promise<ComponentType<P>>) {
  return lazy(() => importaConRicarica(importa).then((c) => ({ default: c })));
}
