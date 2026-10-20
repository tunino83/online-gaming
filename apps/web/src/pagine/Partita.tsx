import { useEffect, useState } from "react";
import { TavoloPrimoGioco } from "../giochi/primo-gioco/Tavolo";
import { TavoloPrimoGioco as TavoloUfficio } from "../giochi/ufficio/Tavolo";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QrCodice, linkTavolo } from "../QrCodice";
import { type GiocatorePartita, type Partita as InfoPartita, usePartita } from "../lib/usePartita";
import { chiediArbitro } from "../lib/supabase";
import { CerchioAvatar } from "../Avatar";
import { Caricamento, Errore, Pagina, Pulsante, Riquadro } from "../ui";

/** Pagina di una partita: stanza d'attesa, poi (passo 5) il tavolo di gioco. */
export function Partita() {
  const { id = "" } = useParams();
  const stato = usePartita(id);
  const vai = useNavigate();
  // Chi non gioca in questa partita (ma la può vedere) è uno spettatore: va allo schermo del tavolo
  const spettatore = stato.tipo === "pronta" && !stato.giocatori.some((g) => g.utente_id === stato.io);
  useEffect(() => {
    if (spettatore) vai(`/guarda/${id}`, { replace: true });
  }, [spettatore, id, vai]);

  if (stato.tipo === "carico") return <Pagina><Caricamento /></Pagina>;
  if (stato.tipo === "errore") return <Pagina><Errore testo={stato.testo} /></Pagina>;
  if (stato.tipo === "nonTrovata") {
    return (
      <Pagina>
        <Riquadro titolo="Partita non trovata">
          <p className="mb-4 text-sm text-tenue">Il link è sbagliato oppure non fai parte di questa partita.</p>
          <Link to="/" className="font-semibold text-blu underline">
            Torna all'inizio
          </Link>
        </Riquadro>
      </Pagina>
    );
  }

  const { partita, giocatori, io } = stato;
  if (partita.gioco === "primo-gioco") document.title = "Il Portale · Online Gaming";
  if (partita.gioco === "ufficio") document.title = "Ufficio · Online Gaming";
  if (partita.stato === "attesa") return <StanzaAttesa partita={partita} giocatori={giocatori} io={io} />;
  return (
    <Pagina inGioco>
      {partita.gioco === "primo-gioco" ? (
        <TavoloPrimoGioco partita={partita} giocatori={giocatori} io={io} />
      ) : partita.gioco === "ufficio" ? (
        <TavoloUfficio partita={partita} giocatori={giocatori} io={io} />
      ) : (
        <Errore testo="Gioco non ancora disponibile nel browser." />
      )}
    </Pagina>
  );
}

function StanzaAttesa({ partita, giocatori, io }: { partita: InfoPartita; giocatori: GiocatorePartita[]; io: string }) {
  const [errore, setErrore] = useState<string | null>(null);
  const [avvio, setAvvio] = useState(false);
  const [copiato, setCopiato] = useState(false);
  const link = `${window.location.origin}/p/${partita.codice}`;
  const sonoCreatore = partita.creatore === io;
  const nomeCreatore = giocatori.find((g) => g.utente_id === partita.creatore)?.nickname ?? "chi l'ha creata";
  const puoiCondividere = typeof navigator.share === "function";

  async function copia() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } catch {
      setErrore("Non riesco a copiare: seleziona il link e copialo a mano.");
    }
  }

  async function condividi() {
    try {
      await navigator.share({ title: "Giochiamo?", text: "Entra nella mia partita:", url: link });
    } catch {
      // Condivisione annullata: nulla da fare.
    }
  }

  async function avvia() {
    setAvvio(true);
    setErrore(null);
    const r = await chiediArbitro({ azione: "avvia", partitaId: partita.id });
    setAvvio(false);
    if (!r.ok) setErrore(r.errore);
  }

  return (
    <Pagina>
      <Riquadro titolo="Stanza d'attesa">
        <p className="-mt-2 text-sm text-tenue">Invita gli amici con questo link (vale finché la partita non parte):</p>
        <div className="my-3 rounded-xl border border-oro/50 bg-white/60 p-3 text-center">
          <div className="font-titolo text-3xl font-bold tracking-[0.3em]">{partita.codice}</div>
          <div className="mt-1 break-all text-xs text-tenue select-all">{link}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Pulsante variante="vuoto" onClick={copia}>
            {copiato ? "Copiato ✓" : "Copia link"}
          </Pulsante>
          {puoiCondividere && (
            <Pulsante variante="vuoto" onClick={condividi}>
              Condividi
            </Pulsante>
          )}
        </div>
      </Riquadro>

      <Riquadro titolo={`Giocatori (${giocatori.length}/${partita.max_giocatori})`}>
        <TavoloAttesa giocatori={giocatori} posti={partita.max_giocatori} io={io} creatore={partita.creatore} />
        <p className="mt-3 text-xs text-tenue">Punti per vincere: {partita.opzioni.puntiPerVincere ?? 15}</p>
      </Riquadro>

      <Riquadro titolo="📺 Schermo del tavolo">
        <p className="-mt-2 mb-3 text-sm text-tenue">
          Un tablet, un PC o una TV al centro del tavolo può mostrare la partita a tutti (senza le carte in mano). Inquadra il codice
          o apri il link:
        </p>
        <QrCodice testo={linkTavolo(partita.codice)} dimensione={150} />
        <p className="mt-2 break-all text-center text-xs text-tenue select-all">{linkTavolo(partita.codice)}</p>
      </Riquadro>

      <Errore testo={errore} />
      {sonoCreatore ? (
        <Pulsante onClick={avvia} disabled={avvio || giocatori.length < 2}>
          {giocatori.length < 2 ? "Aspetta almeno un altro giocatore" : avvio ? "Avvio…" : "Avvia la partita"}
        </Pulsante>
      ) : (
        <p className="text-center text-sm text-luce/80">In attesa che {nomeCreatore} avvii la partita…</p>
      )}
    </Pagina>
  );
}

/** Stanza d'attesa: i giocatori seduti attorno a un tavolo rotondo; i posti liberi restano vuoti. */
function TavoloAttesa({ giocatori, posti, io, creatore }: { giocatori: GiocatorePartita[]; posti: number; io: string; creatore: string }) {
  const raggio = 42; // in percentuale del riquadro
  return (
    <div className="relative mx-auto aspect-square w-full max-w-72">
      <div className="panno absolute inset-[22%] grid place-items-center rounded-full">
        <span className="font-titolo text-sm font-bold text-[#f2d58a]/80">Tavolo</span>
      </div>
      {Array.from({ length: posti }, (_, i) => {
        const angolo = -Math.PI / 2 + (i * 2 * Math.PI) / posti;
        const g = giocatori[i];
        return (
          <div
            key={i}
            className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ left: `${50 + raggio * Math.cos(angolo)}%`, top: `${50 + raggio * Math.sin(angolo)}%` }}
          >
            {g ? (
              <>
                <CerchioAvatar id={g.avatar} dimensione={44} />
                <span className="mt-0.5 max-w-20 truncate text-xs font-bold">
                  {g.nickname}
                  {g.utente_id === io && " (tu)"}
                </span>
                {g.utente_id === creatore && <span className="rounded bg-oro px-1.5 text-[10px] font-bold text-[#2b1a05]">crea</span>}
              </>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-dashed border-inchiostro/30 text-lg text-tenue">+</span>
                <span className="mt-0.5 text-[10px] text-tenue">libero</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ListaGiocatori({ giocatori, io, creatore }: { giocatori: GiocatorePartita[]; io: string; creatore: string }) {
  return (
    <ul className="divide-y divide-inchiostro/10">
      {giocatori.map((g) => (
        <li key={g.utente_id} className="flex items-center justify-between py-2">
          <span className="flex items-center gap-2 font-semibold">
            <CerchioAvatar id={g.avatar} dimensione={32} />
            {g.nickname}
            {g.utente_id === io && <span className="ml-1 font-normal text-tenue">(tu)</span>}
          </span>
          {g.utente_id === creatore && <span className="rounded bg-oro px-2 py-0.5 text-xs font-bold text-white">crea</span>}
        </li>
      ))}
    </ul>
  );
}
