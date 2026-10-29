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
- `pnpm matrice:famiglia` – rigenera `docs/famiglia/matrice-attacchi-difese.md` (attacchi contro difese della Famiglia).
- `pnpm carte` – rigenera `docs/anteprima-carte.html` (tutte le carte personaggio, disegnate dai dati).
- La Famiglia: `pnpm simula:famiglia [n] [mazzo]` (resoconto in `docs/famiglia/`).
  Confronto strategie (robot "attivatore" contro "poteri") con le varianti dei punti: `pnpm strategie:famiglia [n]` → `docs/famiglia/confronto-strategie.md`.
  Carte da stampare: `pnpm stampa:famiglia` → `docs/famiglia/stampa/la-famiglia-carte_<data_ora>.pdf` (A4, 9 carte formato poker per pagina staccate di 4 mm,
  mancia piccola 4 per posto, dorsi in fondo; con `--fronte-retro` ogni pagina è seguita dai suoi dorsi a specchio;
  `--per-foglio 16|30` carte rimpicciolite, file `la-famiglia-carte-16_…`; `--dorso-leggero` dorsi con poco inchiostro
  (fondo bianco, cornice dorata con bordo del colore del mazzo, stemma con il nome in cerchio, uguale anche capovolto), file `…-leggero_…`;
  `--senza-tabella` toglie la tabella dei poteri all'inizio;
  Plancia del giocatore per giocare con le carte stampate: `pnpm stampa:famiglia plancia [--per-foglio 16]` → `la-famiglia-plancia[-16]_…`
  (un A4 orizzontale: carte pronte divise in attacco, aiuto e difesa con un posto per livello, attacchi in attesa, mancia,
  segnapunti 0–30; le stanche stanno fuori dal foglio sotto le tacche 1/2/3+ turni del bordo basso; i nascosti restano in mano);
  contenuto sempre identico a parità di carte e foto: data fissa dentro il PDF, data e ora solo nel nome, caratteri in `games/famiglia/stampa/font`). Il PDF non va su GitHub.
  Carta stampata: nastro con nome e faccine che dormono (una per turno di ricarica), immagine con in alto il nome del potere su una striscia bianca e il
  codice sovrapposto al bordo basso, in fondo un promemoria breve (`games/famiglia/src/promemoria.ts`, da correggere lì; testo intero
  nella tabella dei poteri; con * i poteri della lista `CON_DETTAGLI`, che hanno particolari in più da leggere nella tabella). Codice disegnato con carte piccole
  (`codiceDisegnato`: numeri colorati, AA coppia, AAA tris, AABB doppia coppia, "+3 = moneta" per le somme di 3 carte, P/D, ?). Solo alcune carte:
  `pnpm stampa:famiglia antonio nonna-maria-2 numeri` → `la-famiglia-scelta_<data_ora>.pdf` (persone, carte, numeri, mancia, eventi, dorsi, tabella; `--una-copia`).
  Voci delle carte: `pnpm vocali:famiglia` trasforma `games/famiglia/audio/_originali/*` (anche vocali WhatsApp) in .mp3 (serve ffmpeg, installato con winget).
  Vantaggio per posizione con partite nuove: `npx tsx games/famiglia/scripts/posizioni.ts [giocatori] [partite] [seme]`.
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
Persona ferma (opzione `computerAlPosto` scelta da chi crea la partita, di base sì): se tocca a lei da 60 s senza muovere, il computer gioca al suo posto (azione `alPosto`, regole in
`games/primo-gioco/src/sostituto.ts`), poi una mossa ogni 10 s finché non torna a muovere; si ricomincia dai 60 s a ogni turno.
I tempi li controlla l'arbitro (`stati_partita.aggiornato_il` e `al_posto_di`); il browser mostra il conto alla rovescia.
Avvisi a tutto schermo per tutti (`giochi/primo-gioco/Avvisi.tsx`): punti obiettivo raggiunti (evento `ultimoGiro`) ed
easter egg "Antonio è bello" circa ogni 35 mosse (sorteggio uguale su tutti i telefoni). Solo Il Portale, non Ufficio.
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

## Terzo gioco: La Famiglia (in prova: regole, arbitro e prima schermata fatti)

Personaggi = membri della famiglia e gente del paese, con poteri di attacco/difesa/aiuto che si ricaricano.
Carte e poteri in `docs/famiglia/bozza.md`, codici in `docs/famiglia/carte.md`, regole e decisioni in `docs/famiglia/regolamento.md`, piano in `docs/famiglia/piano.md`.
Pacchetto `games/famiglia` (`@og/famiglia`, id tecnico `famiglia`, oggetto `giocoFamiglia`): dati in `carte.ts` ed `eventi.ts`
(un test li confronta con `carte.md`), codici in `codici.ts`, stato e mosse in `stato.ts`, regole del turno in `regole.ts`,
poteri in `poteri.ts`, attacchi e difese in `attacchi.ts`, eventi in `effetti-eventi.ts` (pezzi comuni in `base.ts`),
vista in `vista.ts`, robot e sostituto in `bot.ts`. Aiuti per i test in `aiuti-test.ts`.
Attacchi: il gioco aspetta solo l'attaccato (attesa "difesa", `diTurno` = chi deve scegliere). Il tempo per difendersi
(opzione `secondiDifesa`, di base 30) lo fa rispettare l'arbitro con `attesaMassimaMs` del gioco (azione `alPosto`,
vale anche senza "computer al posto di chi è fermo"); passato il tempo l'attacco passa. Opzione `modoFine`: "punti" (25) o "mazzo".
Stuffosa (Checca 3): quando un avversario usa un aiuto, l'aiuto resta in `turno.aiutoSospeso` e si aspetta Checca
(attesa "stuffosa", 10 s con `attesaMassimaMs`, risposta "scegli": nessuna carta = lascia stare, 2 carte = blocca).
Regole contro le troppe difese (accese di base dal 2026-10-28, si possono spegnere creando la partita): `limiteDifese` (una difesa attivata
per livello, `liberaPostoDifesa` in `base.ts`) e `carico` (carte numero aggiunte all'attacco, `AttaccoInCorso.carico`;
la difesa con carta attivata paga almeno il carico o fa harakiri). Confronto tra robot: `npx tsx games/famiglia/scripts/difese.ts [n]`.
I robot si difendono quasi sempre quando possono (come le persone). Colori dei tipi di carta in `COLORI_TIPI` (`colori.ts`).
Punti (dal 2026-10-26, opzioni di base): carte solo aiuto 0 punti (`aiutiSenzaPunti`), +1 per attacco a segno e
difesa riuscita (`puntiPerIPoteri`, `puntiPerGliAiuti: false`); `puntiDi(g, s.opzioni)`; nella schermata `RegolePunti`
(contesto in `carte.tsx`) mostra lo 0 sulle carte aiuto; le partite vecchie restano con le opzioni salvate allora.
Schermata: `apps/web/src/giochi/famiglia` (`Tavolo.tsx`: mostra le mosse valide descritte in `descrivi.ts`; `TavoloSpettatore.tsx`).
Grafica "di casa" in `famiglia.css` (caratteri Fredoka e Caveat): carte con stemma del tipo (`Stemma` in `carte.tsx`),
codice di attivazione disegnato con carte piccole come sul PDF (`CodiceDisegnato` in `carte.tsx`, pezzi da `pezziDelCodice` in `games/famiglia/src/codice-disegnato.ts`),
tovaglia a quadretti; carte numero, mancia, eventi e dorsi in stile fantasy (gemme colorate su pergamena con cornice dorata,
monete d'oro, pozione del caffè, dorsi a cielo stellato; colori delle gemme in `games/famiglia/src/colori.ts`, uguali nel PDF); i colori del tema cambiano solo dentro `.gioco-famiglia`
e sul `body` con la classe `sfondo-famiglia` (messa da `useSfondoFamiglia` mentre si gioca).
In partita lo schermo è diviso in 3 parti fisse (non scorre): in alto l'avversario di turno (fila di avversari da toccare,
🎤 vocali solo con altre persone, ☰ "Altro": tutto il tavolo, schermo spettatori, regole, voci delle carte, evento,
cosa è successo), in mezzo il tavolo (i personaggi si ingrandiscono con lo spazio), in basso le mie carte (Attivate /
Da attivare) e la barra con ✋ mano, Mosse e Fine turno. A partita finita la pagina torna normale con il risultato.
Annunci a schermo di carte pescate/prese/attivate (`annunci.ts` + `SchermoAnnunci.tsx`, anche sullo schermo spettatori).
Voci delle carte (`audio.ts`): file in `games/famiglia/audio/<carta>[ _ATT|_DIF|_AIU ].mp3|m4a` (vedi `LEGGIMI.md`),
altrimenti la voce sintetica del telefono.
Immagini in `games/famiglia/immagini/classica/` (anche `.svg`; prima `antonio-2`, poi `antonio`, altrimenti il nome scritto; vedi `LEGGIMI.md`).
Carte "blu" (sempre attive, una volta per turno): `blu: true` sul potere; una carta non si stanca mai solo se tutti i suoi poteri sono blu (`eBlu`).
Simulazione: `pnpm simula:famiglia [n] [mazzo]` (`src/simulazione.ts`) scrive `docs/famiglia/statistiche-simulazione.md`
(o `statistiche-simulazione-mazzo.md`): durata, vantaggio di chi comincia, carte forti/deboli rispetto al loro livello, attacchi e difese.
Ancora da fare: effetti di Pranzo della domenica e Ferragosto.
Possibile evoluzione (idea del 2026-10-27, non decisa, per ora non si fa): **costo degli attacchi**, cioè per usare un attacco
attivato si scartano carte numero quante il suo livello. Motivo: con le regole C1 in 4 giocatori il robot "poteri" vince il 61%.
Dubbi da chiarire prima: carte qualsiasi o con un valore minimo, mancia e caffè valgono, vale per le carte attacco "una volta",
ogni uso o solo il primo, si paga anche se l'attacco viene fermato, togliere la mossa o accorciare la ricarica per non pagare
tre volte. Da provare prima come opzione, con `pnpm strategie:famiglia`.

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

