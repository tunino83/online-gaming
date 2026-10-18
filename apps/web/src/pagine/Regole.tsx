/** "Come si gioca": le regole del primo gioco in breve (riassunto di docs/regolamento.md). */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pagina, Riquadro } from "../ui";

function Voce({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-titolo text-base font-bold">{titolo}</h3>
      <div className="mt-1 space-y-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function TestoRegole() {
  return (
    <div className="space-y-4 text-inchiostro">
      <Voce titolo="🎯 Scopo">
        <p>
          Attiva i personaggi per fare punti. Quando qualcuno arriva ai <strong>punti per vincere</strong> (di solito 15) si finisce il
          giro e si gioca <strong>un ultimo giro</strong>: vince chi ha più punti.
        </p>
      </Voce>
      <Voce titolo="🃏 Il tuo turno: 3 mosse">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Prendi</strong> una carta scoperta dal tavolo (numero o personaggio): toccala.
          </li>
          <li>
            <strong>Pesca</strong> la prima carta coperta di un mazzo: tocca il mazzo.
          </li>
          <li>
            <strong>Attiva</strong> un personaggio dei tuoi posti: toccalo e scegli le carte che formano il suo codice.
          </li>
          <li>
            <strong>Brucia</strong>: scarta le 4 carte numero del tavolo e ne escono 4 nuove.
          </li>
        </ul>
        <p>Finite le mosse il turno si chiude da solo (se hai ancora una scelta, te la chiede).</p>
      </Voce>
      <Voce titolo="✋ Limiti">
        <p>
          Massimo <strong>5 carte numero</strong> in mano a fine turno (puoi pescarne di più, poi scegli cosa scartare) e{" "}
          <strong>2 personaggi</strong> nei posti: se ne prendi un terzo, ne scarti uno dei vecchi.
        </p>
      </Voce>
      <Voce titolo="🔢 Codici">
        <p>
          Ogni personaggio ha un codice: numeri esatti (es. 7 7 8 8), coppia, tris, poker, somma, scala, doppia coppia, pari o
          dispari. Le carte usate vanno negli scarti.
        </p>
      </Voce>
      <Voce titolo="💎 Diamanti e ⚡ fulmini">
        <p>
          I diamanti arrivano solo dai poteri. Un diamante con numero vale come una carta, oppure fa <strong>+1</strong> a una carta
          (uno per carta). Il fulmine dà <strong>una mossa in più</strong>.
        </p>
      </Voce>
      <Voce titolo="✨ Poteri">
        <p>
          <strong>Blu ∞</strong>: valgono per sempre dopo l'attivazione. <strong>Rosso ①</strong>: una volta sola, appena attivi.{" "}
          <strong>Speciale ✦</strong>: la Lucciola si può attivare anche dai vicini di turno.
        </p>
      </Voce>
      <Voce titolo="👆 Trucchi dell'app">
        <ul className="list-disc space-y-1 pl-5">
          <li>Le carte che puoi usare adesso sono illuminate d'oro; le altre sono attenuate.</li>
          <li>Tocca una carta qualsiasi per vederla in grande.</li>
          <li>In alto: 👥 tutti i giocatori, 📜 ultime mosse, 📖 queste regole.</li>
        </ul>
      </Voce>
    </div>
  );
}

export function PaginaRegole() {
  return (
    <Pagina>
      <Riquadro titolo="📖 Come si gioca">
        <TestoRegole />
        <Link to="/" className="mt-5 inline-block font-semibold text-blu underline">
          Torna all'inizio
        </Link>
      </Riquadro>
    </Pagina>
  );
}
