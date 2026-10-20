/**
 * Pagine per guardare una partita senza giocare:
 * - /t/CODICE  entra come spettatore col codice d'invito (è il link del QR "schermo del tavolo");
 * - /guarda/ID la partita vista da fuori (schermo "tavolo").
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TavoloSpettatore } from "../giochi/primo-gioco/TavoloSpettatore";
import { TavoloSpettatore as TavoloSpettatoreUfficio } from "../giochi/ufficio/TavoloSpettatore";
import { chiediArbitro } from "../lib/supabase";
import { usePartita } from "../lib/usePartita";
import { Caricamento, Errore, Pagina, Riquadro } from "../ui";

/** /t/CODICE: entra come spettatore e apre lo schermo del tavolo. */
export function EntraSpettatore() {
  const { codice = "" } = useParams();
  const vai = useNavigate();
  const [errore, setErrore] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    chiediArbitro({ azione: "guarda", codice }).then((r) => {
      if (!vivo) return;
      if (r.ok) vai(`/guarda/${r.partitaId}`, { replace: true });
      else setErrore(r.errore);
    });
    return () => {
      vivo = false;
    };
  }, [codice, vai]);
  return <Pagina>{errore ? <Errore testo={errore} /> : <Caricamento testo="Apro il tavolo…" />}</Pagina>;
}

/** /guarda/ID: la partita vista da spettatore. Chi ci gioca viene portato al suo tavolo. */
export function Spettatore() {
  const { id = "" } = useParams();
  const vai = useNavigate();
  const stato = usePartita(id);
  const gioco = stato.tipo === "pronta" && stato.giocatori.some((g) => g.utente_id === stato.io);
  useEffect(() => {
    if (gioco) vai(`/partita/${id}`, { replace: true });
  }, [gioco, id, vai]);

  if (stato.tipo === "carico") return <Pagina><Caricamento /></Pagina>;
  if (stato.tipo === "errore") return <Pagina><Errore testo={stato.testo} /></Pagina>;
  if (stato.tipo === "nonTrovata") {
    return (
      <Pagina>
        <Riquadro titolo="Partita non trovata">
          <p className="mb-4 text-sm text-tenue">Apri il link "schermo del tavolo" o "guarda come spettatore" che ti hanno mandato.</p>
          <Link to="/" className="font-semibold text-blu underline">
            Torna all'inizio
          </Link>
        </Riquadro>
      </Pagina>
    );
  }
  const { partita, giocatori } = stato;
  document.title = "Tavolo · Il Portale";
  if (partita.stato === "attesa") {
    return (
      <Pagina>
        <Riquadro titolo="👁 Schermo del tavolo">
          <p className="text-sm">La partita non è ancora iniziata. Appena parte, qui compare il tavolo.</p>
          <p className="mt-3 text-sm font-semibold">Al tavolo: {giocatori.map((g) => g.nickname).join(", ")}</p>
        </Riquadro>
      </Pagina>
    );
  }
  if (partita.gioco === "ufficio") return <TavoloSpettatoreUfficio partita={partita} giocatori={giocatori} />;
  if (partita.gioco !== "primo-gioco") return <Pagina><Errore testo="Gioco non ancora disponibile nel browser." /></Pagina>;
  return <TavoloSpettatore partita={partita} giocatori={giocatori} />;
}
