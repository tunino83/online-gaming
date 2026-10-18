/** Avatar dei giocatori: il cerchio con il personaggio e la griglia per sceglierlo. */
import { AVATAR, avatar } from "@og/engine";

export function CerchioAvatar({ id, dimensione = 36, titolo }: { id: string | null | undefined; dimensione?: number; titolo?: string }) {
  const a = avatar(id);
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full border-2 border-white shadow"
      style={{ width: dimensione, height: dimensione, background: a.colore, fontSize: dimensione * 0.58 }}
      title={titolo ?? a.nome}
      aria-label={titolo ?? a.nome}
    >
      <span aria-hidden="true">{a.simbolo}</span>
    </span>
  );
}

export function SceltaAvatar({ valore, onScegli }: { valore: string; onScegli: (id: string) => void }) {
  return (
    <div>
      <span className="text-sm font-semibold">Il tuo avatar</span>
      <div className="mt-1 grid grid-cols-6 gap-2">
        {AVATAR.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onScegli(a.id)}
            className={`grid place-items-center rounded-full p-0.5 ${valore === a.id ? "ring-4 ring-blu" : ""}`}
            aria-pressed={valore === a.id}
            aria-label={a.nome}
          >
            <CerchioAvatar id={a.id} dimensione={40} />
          </button>
        ))}
      </div>
    </div>
  );
}
