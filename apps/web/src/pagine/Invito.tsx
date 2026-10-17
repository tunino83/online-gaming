import { type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nicknameSalvato, salvaNickname } from "../lib/ricordi";
import { chiediArbitro } from "../lib/supabase";
import { Campo, Errore, Pagina, Pulsante, Riquadro } from "../ui";

/** Pagina del link d'invito: /p/CODICE */
export function Invito() {
  const { codice = "" } = useParams();
  const vai = useNavigate();
  const [nickname, setNickname] = useState(nicknameSalvato);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function entra(e: FormEvent) {
    e.preventDefault();
    setInCorso(true);
    setErrore(null);
    salvaNickname(nickname);
    const r = await chiediArbitro({ azione: "unisciti", codice, nickname });
    setInCorso(false);
    if (!r.ok) return setErrore(r.errore);
    vai(`/partita/${r.partitaId}`, { replace: true });
  }

  return (
    <Pagina>
      <Riquadro titolo="Sei stato invitato!">
        <p className="-mt-2 mb-4 text-sm text-tenue">
          Codice della partita: <strong className="tracking-widest text-inchiostro">{codice.toUpperCase()}</strong>
        </p>
        <form onSubmit={entra} className="space-y-4">
          <Campo
            etichetta="Il tuo nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            placeholder="es. Marco"
            autoComplete="nickname"
            required
            autoFocus
          />
          <Errore testo={errore} />
          <Pulsante type="submit" disabled={inCorso || !nickname.trim()}>
            {inCorso ? "Entro…" : "Entra nella partita"}
          </Pulsante>
        </form>
      </Riquadro>
    </Pagina>
  );
}
