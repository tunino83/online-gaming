/** Se una parte dell'app si rompe, mostra un messaggio invece di una pagina bianca. */
import { Component, type ReactNode } from "react";

export class Protezione extends Component<{ children: ReactNode }, { errore: boolean }> {
  override state = { errore: false };

  static getDerivedStateFromError() {
    return { errore: true };
  }

  override componentDidCatch(e: unknown) {
    console.error(e);
  }

  override render() {
    if (!this.state.errore) return this.props.children;
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="mb-4 font-semibold">Qualcosa è andato storto in questa pagina.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-inchiostro px-5 py-3 font-semibold text-carta"
        >
          Ricarica
        </button>
      </div>
    );
  }
}
