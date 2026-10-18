import { PERSONAGGI } from "@og/primo-gioco";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { immaginePersonaggio } from "../giochi/primo-gioco/skin";
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
  const [bot, setBot] = useState(1);

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

  /** Modalità di prova: si gioca subito contro giocatori del computer (che muovono a caso). */
  async function controComputer() {
    if (!nickname.trim()) return setErrore("Scegli prima un nickname");
    setInCorso(true);
    setErrore(null);
    salvaNickname(nickname);
    salvaAvatar(avatarId);
    const r = await chiediArbitro({ azione: "controComputer", nickname, avatar: avatarId, bot, opzioni: { puntiPerVincere: punti } });
    setInCorso(false);
    if (!r.ok) return setErrore(r.errore);
    vai(`/partita/${r.partitaId}`);
  }

  return (
    <Pagina>
      <p className="-mt-4 text-luce/80">Giochi di carte e da tavolo da fare online con gli amici.</p>
      <Riquadro>
        {/* copertina della "scatola" del gioco */}
        {/* l'altezza segue le proporzioni dell'immagine: si vede intera, senza tagli */}
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b-2 border-oro">
          {immaginePersonaggio("drago") && <img src={immaginePersonaggio("drago")} alt="" className="block h-auto w-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-notte/90 via-notte/20 to-transparent" />
          <h2 className="absolute bottom-2 left-4 font-titolo text-2xl font-bold text-oro-chiaro drop-shadow">Il Portale</h2>
        </div>
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
        <div className="mt-5 border-t-2 border-dashed border-inchiostro/15 pt-4">
          <p className="text-sm font-semibold">Modalità di prova</p>
          <p className="mb-2 text-xs text-tenue">Giochi subito contro il computer, che sceglie mosse a caso. Utile per provare il gioco.</p>
          <div className="flex items-center gap-2">
            <select
              className="rounded-xl border-2 border-inchiostro/30 bg-white px-3 py-2.5"
              value={bot}
              onChange={(e) => setBot(Number(e.target.value))}
              aria-label="Quanti avversari del computer"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "avversario" : "avversari"}
                </option>
              ))}
            </select>
            <Pulsante variante="vuoto" onClick={controComputer} disabled={inCorso || !nickname.trim()}>
              🤖 Prova contro il computer
            </Pulsante>
          </div>
        </div>
      </Riquadro>
      <Link to="/regole" className="text-center font-semibold text-oro-chiaro underline">
        📖 Come si gioca
      </Link>
      <p className="text-center text-xs text-luce/50">Prototipo · Fase 2</p>
    </Pagina>
  );
}
