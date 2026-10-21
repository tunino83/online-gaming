# Online Gaming – guida per Claude Code

Piattaforma web (poi app mobile) per giocare online tra amici a giochi di carte e da tavolo diversi.
Il primo gioco si chiama **Il Portale** (nome tecnico interno `primo-gioco`) ed è descritto in `docs/regolamento.md`. Il piano completo è in `docs/piano.md`.

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
- Secondo gioco "Ufficio": `pnpm simula:ufficio [n]` e `pnpm carte:ufficio` (scrivono in `docs/ufficio/`).

## Architettura

- `packages/engine` – interfaccia comune a tutti i giochi:
  `setup(giocatori, opzioni, seed)`, `mosseValide(stato, giocatore)`, `applicaMossa(stato, mossa)`,
  `finePartita(stato)`, `vistaGiocatore(stato, giocatore)`.
  Stato serializzabile in JSON; casualità solo tramite un generatore con seed (partite riproducibili).
- `packages/server` – arbitro: `arbitro.ts` (azioni crea/unisciti/avvia/mossa, indipendente dal database),
  `archivio-supabase.ts` (funzioni SQL `arbitro_*`), `archivio-memoria.ts` (per i test).
  Ogni vista salvata contiene anche `mosse_valide` del giocatore: il browser non conosce le regole.
  Modalità di prova "contro il computer" (azione `controComputer`): i bot sono 4 utenti di servizio fissi
  (tabella `bot_fissi`, riusati in tutte le partite)
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
Vocali in partita (solo tra persone): il browser registra (max 20 s) e manda il file all'arbitro (azione `vocale`), che lo salva
nello spazio privato `vocali` (cartella = id partita) e nella tabella `vocali`; gli altri giocatori lo ricevono in tempo reale
e parte da solo (`apps/web/src/lib/vocali.ts`, `giochi/primo-gioco/Vocali.tsx`). I vocali più vecchi di un giorno si cancellano.
Partite contro il computer: i robot muovono una mossa ogni 3 secondi, su richiesta del browser (azione `turnoComputer`).
Spettatori e schermo "tavolo": `/t/CODICE` (QR nella stanza d'attesa e col pulsante 📺 in partita) o "Guarda come spettatore"
nel link d'invito → azione `guarda` (tabella `spettatori`), pagina `/guarda/ID` (`pagine/Spettatore.tsx`, `giochi/primo-gioco/TavoloSpettatore.tsx`).
Vedono solo la vista pubblica (`vistaPubblica` nel motore, tabella `viste_pubbliche` salvata dall'arbitro a ogni mossa), chi gioca e i vocali.
Partite aperte: nella pagina iniziale la lista delle partite in attesa (azione `aperte`, colonna `partite.pubblica`,
ultime 3 ore, non piene); chi crea può toglierla dalla lista. Le partite contro il computer non compaiono.
Suoni: `apps/web/src/lib/suoni.ts` (un effetto per ogni azione del registro con `suonoPerAzione`; sblocco dell'audio su iPhone al primo tocco).

Sito online: https://online-gaming.onrender.com/

Render (sito statico): build `npm install -g pnpm@9.15.0 && pnpm install --frozen-lockfile && pnpm --filter @og/web build`,
publish `apps/web/dist`, rewrite `/*` → `/index.html`, variabili `NODE_VERSION=20`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

File principali del primo gioco (`games/primo-gioco/src`):
- `personaggi.ts` dati dei personaggi; `mazzi.ts` composizione dei mazzi
- `codici.ts` verifica dei codici di attivazione; `regole.ts` turno, poteri, fine partita
- `stato.ts` stato e mosse; `vista.ts` cosa vede ogni giocatore; `bot.ts` e `simulazione.ts`
- Immagini dei personaggi per skin: `games/primo-gioco/immagini/<skin>/<id>.png|jpg|webp` (vedi `LEGGIMI.md`);
  skin di base `classica`, elenco skin in `apps/web/src/giochi/primo-gioco/skin.tsx`, scelta per giocatore (salvata nel browser);
  cartelle che iniziano con `_` (es. `_originali`) escluse dal sito;
  senza immagine la carta mostra un simbolo provvisorio. La grafica della carta in Fase 2 riprende quella di `scripts/anteprima-carte.ts`.

## Secondo gioco: Ufficio (in costruzione)

Nato il 2026-10-20 come **copia esatta di Il Portale**, da trasformare in un gioco ambientato in ufficio
(colleghi al posto dei personaggi, tool al posto dei numeri…). **Non toccare Il Portale** quando si modifica Ufficio.
- Regole: `games/ufficio` (pacchetto `@og/ufficio`, id tecnico `ufficio`, oggetto `giocoUfficio`), regolamento `docs/ufficio/regolamento.md`.
- Schermata: `apps/web/src/giochi/ufficio` (copia di `giochi/primo-gioco`). Il file `carte.css` è caricato da entrambi i giochi:
  le modifiche allo stile di Ufficio vanno messe sotto una classe propria (es. `.gioco-ufficio`) per non cambiare Il Portale.
- Immagini: `games/ufficio/immagini/classica/` (per ora vuota: le carte mostrano il simbolo provvisorio).
- Si sceglie il gioco nella pagina iniziale (✨ Il Portale / 🏢 Ufficio); l'arbitro conosce entrambi (`GIOCHI` in `packages/server/src/arbitro.ts`).
- Finché Ufficio non diverge, la sua schermata si riallinea copiando `giochi/primo-gioco` in `giochi/ufficio`
  (sostituendo `@og/primo-gioco` → `@og/ufficio` e il percorso delle immagini in `skin.tsx`).
- Ogni gioco (tavolo e schermo spettatori) e la libreria degli avatar disegnati si scaricano solo quando servono
  (`lib/caricaPigro.ts`: se dopo un aggiornamento del sito un pezzo vecchio manca, la pagina si ricarica da sola).

