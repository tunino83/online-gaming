# Online Gaming – guida per Claude Code

Piattaforma web (poi app mobile) per giocare online tra amici a giochi di carte e da tavolo diversi.
Il primo gioco è descritto in `docs/regolamento.md`. Il piano completo è in `docs/piano.md`.

## Come lavoriamo (importante)

- Il proprietario del progetto **non legge il codice** (vibe coding). Spiega sempre in italiano semplice
  cosa hai fatto, come provarlo e cosa resta da fare. Niente gergo non spiegato.
- **Un passo alla volta**: piccole funzionalità verificabili. Prima di un cambiamento grande, proponi il piano e aspetta l'ok.
- **Test obbligatori**: ogni regola del gioco ha almeno un test. Non dichiarare finito un passo con test che falliscono.
- **Dubbi sulle regole**: se il regolamento è ambiguo o incompleto, NON inventare. Chiedi, e annota la domanda
  in fondo a `docs/regolamento.md` nella sezione "Domande aperte".
- Commit piccoli e frequenti su GitHub, con messaggi chiari in italiano.
- Mai mettere chiavi, password o segreti nel codice o nei commit: solo file `.env` esclusi da git.
- Aggiorna questo file quando cambiano struttura, comandi o decisioni importanti.

## Stack

- TypeScript ovunque, monorepo con pnpm workspaces.
- Regole di gioco: pacchetti TypeScript puri (nessuna dipendenza da browser o server), testati con Vitest.
- Web app (dalla Fase 2): React + Vite + Tailwind + shadcn/ui, PWA. Pubblicata su Render come sito statico.
- Backend (dalla Fase 2): Supabase (regione UE): Auth, Postgres con RLS, Realtime, Edge Functions come arbitro.
- App mobile (Fase 5): Capacitor.

## Comandi

- `pnpm install` – installa le dipendenze (pnpm 9.15.0, attivato con `corepack prepare pnpm@9.15.0 --activate`).
- `pnpm test` – esegue tutti i test (Vitest).
- `pnpm typecheck` – controllo dei tipi TypeScript.
- `pnpm check` – entrambi: da lanciare prima di ogni commit.
- `pnpm simula [n]` – simula n partite tra bot (default 1000) e scrive `docs/statistiche-simulazione.md`.
- `pnpm web` – avvia il sito in locale (sviluppo). Build: `pnpm --filter @og/web build` → `apps/web/dist`.
- `pnpm test:supabase` – test delle regole di accesso sul progetto Supabase di prova (serve `apps/web/.env`).
- `pnpm exec supabase db push` – pubblica le nuove migrazioni (`supabase/migrations`) sul progetto collegato.
- `pnpm deploy:arbitro` – impacchetta `packages/server` in `supabase/functions/arbitro/nucleo.js` e pubblica l'arbitro.
  Da rifare a ogni modifica delle regole o dell'arbitro, poi `pnpm test:supabase`.
- Prova a due giocatori in locale: `pnpm --filter @og/web build`, poi anteprima "web" su `localhost:4173` (giocatore 1)
  e `bruno.localhost:4173` (giocatore 2: indirizzo diverso = sessione separata).
- `pnpm carte` – rigenera `docs/anteprima-carte.html` (tutte le carte personaggio, disegnate dai dati).

## Architettura

- `packages/engine` – interfaccia comune a tutti i giochi:
  `setup(giocatori, opzioni, seed)`, `mosseValide(stato, giocatore)`, `applicaMossa(stato, mossa)`,
  `finePartita(stato)`, `vistaGiocatore(stato, giocatore)`.
  Stato serializzabile in JSON; casualità solo tramite un generatore con seed (partite riproducibili).
- `packages/server` – arbitro: `arbitro.ts` (azioni crea/unisciti/avvia/mossa, indipendente dal database),
  `archivio-supabase.ts` (funzioni SQL `arbitro_*`), `archivio-memoria.ts` (per i test).
  Ogni vista salvata contiene anche `mosse_valide` del giocatore: il browser non conosce le regole.
  Modalità di prova "contro il computer" (azione `controComputer`): i bot sono utenti di servizio
  (`giocatori_partita.bot = true`) e muovono a caso dentro l'arbitro subito dopo la mossa di una persona.
- `games/<nome-gioco>` – un modulo per gioco: regole + dati delle carte.
  I personaggi stanno in un file di dati (JSON/TS) separato dalla logica: aggiungere una carta = aggiungere una riga.
- Il server è l'arbitro: il client invia mosse, mai stato. `vistaGiocatore` non deve mai esporre
  mani altrui, mazzi coperti o ordine dei mazzi.

## Fase attuale: Fase 1 – Motore di gioco (completata il 2026-10-17)

1.000 partite tra bot finite senza errori (vedi `docs/statistiche-simulazione.md`).
In corso: Fase 2 – Prototipo web, piano in `docs/fase-2.md` (passi 1–5 fatti; pagine in `apps/web/src/pagine`, tavolo del primo gioco in `apps/web/src/giochi/primo-gioco`: `apps/web` su Render; database in `supabase/migrations`;
arbitro in `packages/server` + `supabase/functions/arbitro`).
Supabase di prova: progetto `vxkcinfkbsextubabibe` (eu-west-1), collegato con la CLI. Accesso anonimo attivo.
I browser non scrivono mai nel database: scrive solo l'arbitro (Edge Function). `stati_partita` e `mosse` non sono leggibili dai browser.

Sito online: https://online-gaming.onrender.com/

Render (sito statico): build `npm install -g pnpm@9.15.0 && pnpm install --frozen-lockfile && pnpm --filter @og/web build`,
publish `apps/web/dist`, rewrite `/*` → `/index.html`, variabili `NODE_VERSION=20`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

File principali del primo gioco (`games/primo-gioco/src`):
- `personaggi.ts` dati dei personaggi; `mazzi.ts` composizione dei mazzi
- `codici.ts` verifica dei codici di attivazione; `regole.ts` turno, poteri, fine partita
- `stato.ts` stato e mosse; `vista.ts` cosa vede ogni giocatore; `bot.ts` e `simulazione.ts`
- Immagini dei personaggi: `games/primo-gioco/immagini/<id>.png|jpg|webp` (vedi `LEGGIMI.md` lì dentro);
  senza immagine la carta mostra un simbolo provvisorio. La grafica della carta in Fase 2 riprende quella di `scripts/anteprima-carte.ts`.
