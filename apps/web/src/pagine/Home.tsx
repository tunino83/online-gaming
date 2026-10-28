import { CARTE as CARTE_FAMIGLIA } from "@og/famiglia";
import { PERSONAGGI } from "@og/primo-gioco";
import { PERSONAGGI as PERSONAGGI_UFFICIO } from "@og/ufficio";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { immaginePersonaggio } from "../giochi/primo-gioco/skin";
import { chiediArbitro } from "../lib/supabase";
import { avatarSalvato, nicknameSalvato, salvaAvatar, salvaNickname } from "../lib/ricordi";
import { SceltaAvatar } from "../Avatar";
import { PartiteAperte } from "./PartiteAperte";
import { Campo, Errore, Pagina, Pulsante, Riquadro } from "../ui";

const contaCarte = (lista: readonly { copie: number }[]) => lista.reduce((totale, p) => totale + p.copie, 0);

/** Giochi che si possono scegliere (id tecnico come nell'arbitro). */
const GIOCHI = [
  { id: "primo-gioco", nome: "Il Portale", icona: "✨", tipi: PERSONAGGI.length, carte: contaCarte(PERSONAGGI), punti: 15 },
  { id: "ufficio", nome: "Ufficio", icona: "🏢", tipi: PERSONAGGI_UFFICIO.length, carte: contaCarte(PERSONAGGI_UFFICIO), punti: 15, prova: true },
  { id: "famiglia", nome: "La Famiglia", icona: "👨‍👩‍👧", tipi: CARTE_FAMIGLIA.length, carte: contaCarte(CARTE_FAMIGLIA), punti: 25, prova: true },
] as const;
type IdGioco = (typeof GIOCHI)[number]["id"];

function giocoSalvato(): IdGioco {
  try {
    const salvato = localStorage.getItem("og.gioco");
    return GIOCHI.find((g) => g.id === salvato)?.id ?? "primo-gioco";
  } catch {
    return "primo-gioco";
  }
}

export function Home() {
  const vai = useNavigate();
  const [nickname, setNickname] = useState(nicknameSalvato);
  const [avatarId, setAvatarId] = useState(avatarSalvato);
  const [maxGiocatori, setMaxGiocatori] = useState(5);
  const [gioco, setGioco] = useState<IdGioco>(giocoSalvato);
  const [punti, setPunti] = useState<number>(() => GIOCHI.find((g) => g.id === giocoSalvato())!.punti);
  const [modoFine, setModoFine] = useState<"punti" | "mazzo">("punti");
  const [secondiDifesa, setSecondiDifesa] = useState(30);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [bot, setBot] = useState(1);
  const [pubblica, setPubblica] = useState(true);
  const [computerAlPosto, setComputerAlPosto] = useState(true);
  // La Famiglia, regole in prova: limite delle difese e carico negli attacchi
  const [limiteDifese, setLimiteDifese] = useState(false);
  const [carico, setCarico] = useState(false);
  const scelto = GIOCHI.find((g) => g.id === gioco)!;
  const famiglia = gioco === "famiglia";
  /** Opzioni scelte da chi crea la partita (alcune solo per certi giochi). */
  const opzioni = () => ({
    puntiPerVincere: punti,
    ...(gioco === "primo-gioco" || famiglia ? { computerAlPosto } : {}),
    ...(famiglia ? { modoFine, secondiDifesa, limiteDifese, carico } : {}),
  });
  const scegliGioco = (id: IdGioco) => {
    setGioco(id);
    setPunti(GIOCHI.find((g) => g.id === id)!.punti);
    try {
      localStorage.setItem("og.gioco", id);
    } catch {
      // vale solo per questa visita
    }
  };

  async function crea(e: FormEvent) {
    e.preventDefault();
    setInCorso(true);
    setErrore(null);
    salvaNickname(nickname);
    salvaAvatar(avatarId);
    const r = await chiediArbitro({ azione: "crea", gioco, nickname, avatar: avatarId, maxGiocatori, pubblica, opzioni: opzioni() });
    setInCorso(false);
    if (!r.ok) return setErrore(r.errore);
    vai(`/partita/${r.partitaId}`);
  }

  /** Entra in una partita della lista "partite aperte". */
  async function entraAperta(codice: string) {
    if (!nickname.trim()) return setErrore("Scegli prima un nickname");
    setInCorso(true);
    setErrore(null);
    salvaNickname(nickname);
    salvaAvatar(avatarId);
    const r = await chiediArbitro({ azione: "unisciti", codice, nickname, avatar: avatarId });
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
    const { computerAlPosto: _, ...opzioniProva } = opzioni();
    const r = await chiediArbitro({ azione: "controComputer", gioco, nickname, avatar: avatarId, bot, opzioni: opzioniProva });
    setInCorso(false);
    if (!r.ok) return setErrore(r.errore);
    vai(`/partita/${r.partitaId}`);
  }

  return (
    <Pagina>
      <p className="-mt-4 text-luce/80">Giochi di carte e da tavolo da fare online con gli amici.</p>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Scegli il gioco">
        {GIOCHI.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => scegliGioco(g.id)}
            aria-pressed={g.id === gioco}
            className={`rounded-xl border-2 px-3 py-2 font-titolo text-base font-bold transition ${
              g.id === gioco ? "border-oro bg-oro text-[#2b1a05]" : "border-oro/40 text-oro-chiaro hover:bg-oro/10"
            }`}
          >
            {g.icona} {g.nome}
            {"prova" in g && <span className="ml-1 align-middle text-[10px] font-semibold uppercase opacity-70">in prova</span>}
          </button>
        ))}
      </div>
      <Riquadro>
        {/* copertina della "scatola" del gioco */}
        {/* l'altezza segue le proporzioni dell'immagine: si vede intera, senza tagli */}
        {gioco === "primo-gioco" ? (
          <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b-2 border-oro">
            {immaginePersonaggio("drago") && <img src={immaginePersonaggio("drago")} alt="" className="block h-auto w-full" />}
            <div className="absolute inset-0 bg-gradient-to-t from-notte/90 via-notte/20 to-transparent" />
            <h2 className="absolute bottom-2 left-4 font-titolo text-2xl font-bold text-oro-chiaro drop-shadow">Il Portale</h2>
          </div>
        ) : famiglia ? (
          <div className="-mx-5 -mt-5 mb-4 rounded-t-2xl border-b-2 border-oro bg-gradient-to-br from-[#5b3a8c] to-[#2b1a4a] px-5 py-8 text-center">
            <div className="text-5xl" aria-hidden="true">👨‍👩‍👧</div>
            <h2 className="mt-2 font-titolo text-2xl font-bold text-[#f2d58a]">La Famiglia</h2>
            <p className="text-xs text-white/70">In prova: parenti con poteri, attacchi, difese ed eventi</p>
          </div>
        ) : (
          <div className="-mx-5 -mt-5 mb-4 rounded-t-2xl border-b-2 border-oro bg-gradient-to-br from-[#2f6fb3] to-[#1d2d4f] px-5 py-8 text-center">
            <div className="text-5xl" aria-hidden="true">🏢</div>
            <h2 className="mt-2 font-titolo text-2xl font-bold text-[#f2d58a]">Ufficio</h2>
            <p className="text-xs text-white/70">In costruzione: per ora ha le stesse regole di Il Portale</p>
          </div>
        )}
        <p className="-mt-2 mb-4 text-sm text-tenue">
          {scelto.tipi} {famiglia ? "carte diverse" : "personaggi"}, {scelto.carte} carte, da 2 a 5 giocatori.
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pubblica} onChange={(e) => setPubblica(e.target.checked)} className="h-4 w-4 accent-[#b8892b]" />
            Mostrala tra le partite aperte (chiunque può entrare)
          </label>
          {famiglia && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Fine della partita</span>
                <select
                  className="w-full rounded-xl border-2 border-inchiostro/30 bg-white px-3 py-2.5"
                  value={modoFine}
                  onChange={(e) => setModoFine(e.target.value === "mazzo" ? "mazzo" : "punti")}
                >
                  <option value="punti">A punti</option>
                  <option value="mazzo">Fine del mazzo</option>
                </select>
              </label>
              <Campo
                etichetta="Secondi per difendersi"
                type="number"
                min={10}
                max={120}
                value={secondiDifesa}
                onChange={(e) => setSecondiDifesa(Number(e.target.value))}
              />
            </div>
          )}
          {(gioco === "primo-gioco" || famiglia) && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={computerAlPosto}
                onChange={(e) => setComputerAlPosto(e.target.checked)}
                className="h-4 w-4 accent-[#b8892b]"
              />
              Se qualcuno resta fermo 60 secondi, il computer gioca al suo posto
            </label>
          )}
          {famiglia && (
            <div className="space-y-1.5 rounded-xl border border-inchiostro/15 p-2.5">
              <p className="text-xs font-semibold text-tenue">Regole in prova</p>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={limiteDifese} onChange={(e) => setLimiteDifese(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b8892b]" />
                <span>
                  <b>Limite delle difese</b>: al massimo una difesa attivata per livello (la nuova prende il posto della vecchia)
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={carico} onChange={(e) => setCarico(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b8892b]" />
                <span>
                  <b>Carico</b>: chi attacca può aggiungere carte numero; per difendersi si scarta almeno quel valore o si sacrifica la carta
                </span>
              </label>
            </div>
          )}
          <Errore testo={errore} />
          <Pulsante type="submit" disabled={inCorso || !nickname.trim()}>
            {inCorso ? "Creo la partita…" : "Crea una partita"}
          </Pulsante>
        </form>
        <div className="mt-5 border-t-2 border-dashed border-inchiostro/15 pt-4">
          <PartiteAperte onEntra={entraAperta} inCorso={inCorso} />
        </div>
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
      <Link to={famiglia ? "/regole?gioco=famiglia" : "/regole"} className="text-center font-semibold text-oro-chiaro underline">
        📖 Come si gioca
      </Link>
      <p className="text-center text-xs text-luce/50">Prototipo · Fase 2</p>
    </Pagina>
  );
}
