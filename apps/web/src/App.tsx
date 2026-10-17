import { PERSONAGGI } from "@og/primo-gioco";

const carte = PERSONAGGI.reduce((totale, p) => totale + p.copie, 0);

export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-titolo text-4xl font-bold">Online Gaming</h1>
        <p className="text-tenue">Giochi di carte e da tavolo da fare online con gli amici.</p>
      </header>

      <section className="rounded-2xl border-4 border-blu bg-carta p-5 shadow-sm">
        <h2 className="font-titolo text-xl font-bold">Il primo gioco</h2>
        <p className="mt-1 text-sm text-tenue">
          {PERSONAGGI.length} personaggi, {carte} carte, da 2 a 5 giocatori.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 w-full rounded-xl bg-inchiostro px-4 py-3 font-semibold text-carta opacity-50"
        >
          Crea una partita (in arrivo)
        </button>
      </section>

      <p className="text-center text-xs text-tenue">Prototipo · Fase 2</p>
    </main>
  );
}
