/** Codice QR di un indirizzo (es. il link per lo schermo "tavolo"), disegnato nel browser. */
import qrcode from "qrcode-generator";
import { useMemo } from "react";

export function QrCodice({ testo, dimensione = 180 }: { testo: string; dimensione?: number }) {
  const svg = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(testo);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }, [testo]);
  return (
    <div
      className="mx-auto rounded-lg bg-white p-1 [&>svg]:h-full [&>svg]:w-full"
      style={{ width: dimensione, height: dimensione }}
      role="img"
      aria-label={`Codice QR: ${testo}`}
      // biome-ignore lint: l'SVG lo genera la libreria a partire dal solo indirizzo
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Indirizzo per aprire una partita come spettatore o schermo "tavolo". */
export const linkTavolo = (codice: string) => `${window.location.origin}/t/${codice}`;
