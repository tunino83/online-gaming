/** Schermo "tavolo" della Famiglia per gli spettatori: solo informazioni pubbliche, nessuna mossa. */
import type { VistaGiocatore } from "@og/famiglia";
import { useMemo } from "react";
import type { GiocatorePartita, Partita } from "../../lib/usePartita";
import { useVistaPubblica } from "../../lib/useVistaPubblica";
import { Caricamento, Errore } from "../../ui";
import { CartaFamiglia, CartaNumeroGrafica } from "./carte";
import { AnnuncioCarta, useAnnunci } from "./SchermoAnnunci";
import { descriviFatto } from "./descrivi";
import { AreaGiocatore, BarraStato, Esito, Evento, Protezioni, Zona, useSfondoFamiglia } from "./Tavolo";

export function TavoloSpettatore({ partita, giocatori }: { partita: Partita; giocatori: GiocatorePartita[] }) {
  useSfondoFamiglia();
  const { riga, errore } = useVistaPubblica<VistaGiocatore>(partita.id);
  const nick = useMemo(() => {
    const m = new Map(giocatori.map((g) => [g.utente_id, g.nickname]));
    return (id: string) => m.get(id) ?? "?";
  }, [giocatori]);
  // Le carte pescate, prese o attivate compaiono anche sullo schermo del tavolo (con le voci)
  const { corrente: annuncio, salta } = useAnnunci(riga?.vista, "", nick);
  if (errore) return <Errore testo={errore} />;
  if (!riga) return <Caricamento testo="Apro il tavolo…" />;
  const v = riga.vista;
  return (
    <div className="gioco-famiglia mx-auto max-w-6xl space-y-3 px-3 py-3 text-luce">
      <BarraStato v={v} io="" nick={nick} secondi={null} difesa={false} />
      {annuncio && <AnnuncioCarta key={annuncio.chiave} annuncio={annuncio} onFine={salta} />}
      {v.evento && <Evento id={v.evento.id} turni={v.evento.turniRimasti} />}
      <Protezioni v={v} nick={nick} />
      <div className="panno flex flex-wrap items-end justify-center gap-2 rounded-2xl p-3">
        {v.tavolo.numeri.map((c, i) => (c ? <CartaNumeroGrafica key={c.id} c={c} /> : <div key={i} className="h-16 w-12" />))}
        {v.tavolo.personaggi.map((c, i) => (c ? <CartaFamiglia key={c.id} idCarta={c.carta} /> : <div key={`p${i}`} className="w-[88px]" />))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {v.ordine.map((id) => (
          <Zona key={id} titolo={`${nick(id)}${v.turno.giocatore === id ? " · di turno" : ""}`}>
            <AreaGiocatore v={v} id={id} io="" onCarta={() => {}} />
          </Zona>
        ))}
      </div>
      <Zona titolo="Cosa è successo">
        <ul className="space-y-0.5 text-sm">
          {v.registro
            .slice(-8)
            .reverse()
            .map((f) => (
              <li key={f.n}>{descriviFatto(f, nick, "")}</li>
            ))}
        </ul>
      </Zona>
      {v.finita && <Esito partita={partita} v={v} nick={nick} />}
    </div>
  );
}
