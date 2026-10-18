import { PERSONAGGI } from "@og/primo-gioco";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chiediArbitro } from "../lib/supabase";
import { avatarSalvato, nicknameSalvato, salvaAvatar, salvaNickname } from "../lib/ricordi";
import { SceltaAvatar } from "../Avatar";
import { Campo, Errore, Pagina, Pulsante, Riquadro } from "../ui";

const carte = PERSONAGGI.reduce((totale, p) => totale + p.copie, 0);

export function Home() {
  const vai = useNavigate();
  const [nickname, setNickname] = useState(nicknameSalvato);
  const [avatarId, setAvatarId] = useState(avatarSalvato);
  const [maxGiocatori, setMaxGiocatori] = useState(5);
  const [punti, setPunti] = useState(15);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function crea(e: FormEvent) {
    e.preventDefault();
    setInCorso(true);
    setErrore(null);
    salvaNickname(nickname);
    salvaAvatar(avatarId);
    const r = await chiediArbitro({ azione: "crea", nickname, avatar: avatarId, maxGiocatori, opzioni: { puntiPerVincere: punti } });
    setInCorso(false);
    if (!r.ok) return setErrore(r.errore);
    vai(`/partita/${r.partitaId}`);
  }

  return (
    <Pagina>
      <p className="-mt-4 text-tenue">Giochi di carte e da tavolo da fare online con gli amici.</p>
      <Riquadro titolo="Il primo gioco">
        <p className="-mt-2 mb-4 text-sm text-tenue">
          {PERSONAGGI.length} personaggi, {carte} carte, da 2 a 5 giocatori.
        </p>
        <form onSubmit={crea} className="space-y-4">
          <Campo
            etichetta="Il tuo nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            placeholder="es. Tony"
            autoComplete="nickname"
            required
          />
          <SceltaAvatar valore={avatarId} onScegli={setAvatarId} />
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Giocatori (max)</span>
              <select
                className="w-full rounded-xl border-2 border-inchiostro/30 bg-white px-3 py-2.5"
                value={maxGiocatori}
                onChange={(e) => setMaxGiocatori(Number(e.target.value))}
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Campo
              etichetta="Punti per vincere"
              type="number"
              min={5}
              max={50}
              value={punti}
              onChange={(e) => setPunti(Number(e.target.value))}
            />
          </div>
          <Errore testo={errore} />
          <Pulsante type="submit" disabled={inCorso || !nickname.trim()}>
            {inCorso ? "Creo la partita…" : "Crea una partita"}
          </Pulsante>
        </form>
      </Riquadro>
      <p className="text-center text-xs text-tenue">Prototipo · Fase 2</p>
    </Pagina>
  );
}
