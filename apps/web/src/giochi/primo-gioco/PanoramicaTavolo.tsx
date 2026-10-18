/**
 * Schermata "Tavolo": tutte le informazioni visibili di tutti i giocatori insieme
 * (punti, carte in mano, diamanti, personaggi nei posti e attivati, poteri blu).
 */
import { type CartaPersonaggio, type VistaGiocatore, personaggio } from "@og/primo-gioco";
import { useEffect } from "react";
import { CerchioAvatar } from "../../Avatar";
import { CartaPersonaggioGrafica, Diamante, PostoVuoto } from "./carte";
import { etichettaPotere } from "./descrivi";

export function PanoramicaTavolo({
  v,
  io,
  nick,
  avatarDi,
  ingrandisci,
  onChiudi,
}: {
  v: VistaGiocatore;
  io: string;
  nick: (id: string) => string;
  avatarDi: (id: string) => string | undefined;
  ingrandisci: (c: CartaPersonaggio) => () => void;
  onChiudi: () => void;
}) {
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [onChiudi]);

  const massimo = Math.max(...v.ordine.map((id) => v.giocatori[id]!.punti));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sfondo" role="dialog" aria-modal="true" aria-label="Tavolo: tutti i giocatori">
      <div className="mx-auto max-w-md px-3 pb-8">
        <div className="sticky top-0 z-10 -mx-3 mb-3 flex items-center justify-between border-b-4 border-blu bg-carta/95 px-3 py-2 backdrop-blur">
          <h2 className="font-titolo text-xl font-bold">👥 Tavolo</h2>
          <button type="button" onClick={onChiudi} className="rounded-xl bg-inchiostro px-4 py-2 text-sm font-semibold text-carta">
            Chiudi
          </button>
        </div>
        <p className="mb-3 text-xs text-tenue">
          In ordine di gioco · tocca una carta per ingrandirla
          {v.ultimoTurno !== null && !v.finita && <span className="ml-1 rounded-full bg-rosso px-2 py-0.5 font-bold text-white">ultimo giro</span>}
        </p>

        <div className="space-y-3">
          {v.ordine.map((id, posizione) => {
            const g = v.giocatori[id]!;
            const diTurno = id === v.turno.giocatore && !v.finita;
            const poteri = g.attivati.flatMap((c) =>
              personaggio(c.personaggio)
                .poteri.filter((x) => x.colore === "blu")
                .map((x, i) => ({ chiave: `${c.id}-${i}`, carta: c, ...etichettaPotere(x.effetto) })),
            );
            return (
              <section
                key={id}
                className={`rounded-2xl border-2 bg-carta p-3 ${diTurno ? "border-blu shadow-md" : "border-inchiostro/15"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-tenue">{posizione + 1}°</span>
                  <CerchioAvatar id={avatarDi(id)} dimensione={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-titolo text-lg font-bold leading-tight">
                      {id === io ? `${nick(id)} (tu)` : nick(id)}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      {diTurno && <span className="rounded-full bg-blu px-2 py-0.5 font-bold text-white">sta giocando</span>}
                      <span className="font-semibold text-tenue">
                        {g.carteInMano} {g.carteInMano === 1 ? "carta" : "carte"} in mano
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${g.punti === massimo && massimo > 0 ? "bg-oro text-white" : "bg-inchiostro text-carta"}`}>
                    {g.punti} {g.punti === 1 ? "punto" : "punti"}
                  </span>
                </div>

                {g.diamanti.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center text-xs">
                    <span className="mr-1 font-semibold text-tenue">Diamanti:</span>
                    {g.diamanti.map((d) => (
                      <Diamante key={d.id} d={d} />
                    ))}
                  </div>
                )}

                <p className="mt-2 mb-1 text-[11px] font-bold uppercase tracking-wide text-tenue">Nei posti (da attivare)</p>
                <div className="flex gap-2">
                  {g.posti.map((c) => (
                    <CartaPersonaggioGrafica key={c.id} id={c.personaggio} larghezza={96} compatta onIngrandisci={ingrandisci(c)} />
                  ))}
                  {Array.from({ length: Math.max(0, 2 - g.posti.length) }, (_, i) => (
                    <PostoVuoto key={i} larghezza={96} />
                  ))}
                </div>

                <p className="mt-2 mb-1 text-[11px] font-bold uppercase tracking-wide text-tenue">Attivati ({g.attivati.length})</p>
                {g.attivati.length === 0 ? (
                  <p className="text-xs text-tenue">Nessuno</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {g.attivati.map((c) => (
                      <CartaPersonaggioGrafica key={c.id} id={c.personaggio} larghezza={60} compatta onIngrandisci={ingrandisci(c)} />
                    ))}
                  </div>
                )}

                {poteri.length > 0 && (
                  <>
                    <p className="mt-2 mb-1 text-[11px] font-bold uppercase tracking-wide text-tenue">Poteri blu</p>
                    <div className="flex flex-wrap gap-1">
                      {poteri.map((p) => (
                        <button
                          key={p.chiave}
                          type="button"
                          onClick={ingrandisci(p.carta)}
                          title={personaggio(p.carta.personaggio).nome}
                          className="rounded-full border border-blu/40 bg-white px-2 py-0.5 text-xs font-semibold"
                        >
                          {p.icona} {p.testo}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
