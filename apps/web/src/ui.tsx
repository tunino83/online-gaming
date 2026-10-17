/** Mattoncini grafici comuni a tutte le pagine. */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export function Pagina({ children, inGioco }: { children: ReactNode; /** durante la partita: niente titolo, poco margine */ inGioco?: boolean }) {
  if (inGioco) return <div className="mx-auto min-h-dvh max-w-md px-3">{children}</div>;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-8">
      <Link to="/" className="font-titolo text-2xl font-bold">
        Online Gaming
      </Link>
      {children}
    </div>
  );
}

export function Riquadro({ children, titolo }: { children: ReactNode; titolo?: string }) {
  return (
    <section className="rounded-2xl border-4 border-blu bg-carta p-5 shadow-sm">
      {titolo && <h2 className="mb-3 font-titolo text-xl font-bold">{titolo}</h2>}
      {children}
    </section>
  );
}

export function Pulsante({
  variante = "pieno",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "pieno" | "vuoto" }) {
  const stile =
    variante === "pieno"
      ? "bg-inchiostro text-carta hover:opacity-90"
      : "border-2 border-inchiostro text-inchiostro hover:bg-inchiostro/5";
  return (
    <button
      type="button"
      className={`w-full rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${stile} ${className}`}
      {...props}
    />
  );
}

export function Campo({ etichetta, ...props }: InputHTMLAttributes<HTMLInputElement> & { etichetta: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{etichetta}</span>
      <input
        className="w-full rounded-xl border-2 border-inchiostro/30 bg-white px-3 py-2.5 text-base outline-none focus:border-blu"
        {...props}
      />
    </label>
  );
}

export function Errore({ testo }: { testo: string | null }) {
  if (!testo) return null;
  return (
    <p role="alert" className="rounded-xl bg-rosso/10 px-3 py-2 text-sm font-semibold text-rosso">
      {testo}
    </p>
  );
}

export function Caricamento({ testo = "Caricamento…" }: { testo?: string }) {
  return <p className="text-center text-tenue">{testo}</p>;
}
