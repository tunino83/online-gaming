/** Mattoncini grafici comuni a tutte le pagine (stile fantasy: notte, oro, pergamena). */
import "@fontsource/cinzel/700.css";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { cambiaTema, useTema } from "./lib/tema";

/** Pulsante sole/luna per passare dal tema scuro a quello chiaro e viceversa. */
export function BottoneTema({ className = "" }: { className?: string }) {
  const tema = useTema();
  const etichetta = tema === "scuro" ? "Passa al tema chiaro" : "Passa al tema scuro";
  return (
    <button
      type="button"
      onClick={cambiaTema}
      aria-label={etichetta}
      title={etichetta}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-oro/50 text-oro-chiaro transition hover:bg-oro/15 ${className}`}
    >
      {tema === "scuro" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/** Logo: due carte sovrapposte con una stella dorata. */
export function Logo({ dimensione = 40 }: { dimensione?: number }) {
  return (
    <svg width={dimensione} height={dimensione} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="30" height="42" rx="5" fill="#1a2742" stroke="#c9a24a" strokeWidth="2.5" transform="rotate(-12 23 31)" />
      <rect x="24" y="8" width="30" height="42" rx="5" fill="#f7ecd2" stroke="#c9a24a" strokeWidth="2.5" transform="rotate(8 39 29)" />
      <path d="M39 18l3.2 7 7.6.8-5.7 5.1 1.6 7.5L39 34.6l-6.7 3.8 1.6-7.5-5.7-5.1 7.6-.8z" fill="#c9a24a" transform="rotate(8 39 29)" />
    </svg>
  );
}

export function Pagina({
  children,
  inGioco,
  larga,
}: {
  children: ReactNode;
  /** durante la partita: niente titolo, poco margine */
  inGioco?: boolean;
  /** sul computer la pagina si allarga (es. la guida della Famiglia) */
  larga?: boolean;
}) {
  if (inGioco) return <div className="mx-auto min-h-dvh max-w-md px-3 md:max-w-2xl xl:max-w-6xl">{children}</div>;
  return (
    <div className={`mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-6 ${larga ? "md:max-w-3xl xl:max-w-6xl" : ""}`}>
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-titolo text-2xl font-bold text-oro-chiaro">
          <Logo dimensione={36} />
          Online Gaming
        </Link>
        <BottoneTema />
      </div>
      {children}
    </div>
  );
}

/** Pannello pergamena con cornice dorata. */
export function Riquadro({ children, titolo }: { children: ReactNode; titolo?: string }) {
  return (
    <section className="rounded-2xl border-2 border-oro bg-gradient-to-b from-[#fbf3df] to-[#f1e2bf] p-5 text-inchiostro shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
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
      ? "bg-gradient-to-b from-[#e3c06a] to-[#b8892b] text-[#2b1a05] shadow-[0_3px_0_#7a5518] hover:brightness-105 active:translate-y-px"
      : "border-2 border-inchiostro/70 text-inchiostro hover:bg-inchiostro/5";
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
        className="w-full rounded-xl border-2 border-inchiostro/25 bg-white/80 px-3 py-2.5 text-base text-inchiostro outline-none focus:border-oro"
        {...props}
      />
    </label>
  );
}

export function Errore({ testo }: { testo: string | null }) {
  if (!testo) return null;
  return (
    <p role="alert" className="rounded-xl border border-rosso/40 bg-[#fde8e6] px-3 py-2 text-sm font-semibold text-rosso">
      {testo}
    </p>
  );
}

export function Caricamento({ testo = "Caricamento…" }: { testo?: string }) {
  return <p className="py-10 text-center text-luce/70">{testo}</p>;
}
