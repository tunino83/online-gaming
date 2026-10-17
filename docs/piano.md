# Piano – Piattaforma giochi online

## Obiettivo e requisiti

Costruire una piattaforma web, poi app mobile, per giocare online tra amici a giochi di carte e da tavolo diversi. Il primo gioco è un gioco originale ispirato alle meccaniche de *Il Portale di Molthar*. Lo sviluppo è interamente in vibe coding: le scelte tecniche sono fatte per chi non legge il codice.

**Requisiti confermati**

- Partite in tempo reale a turni: i giocatori sono collegati insieme.
- Tempo massimo per turno di pochi minuti, configurabile alla creazione della partita.
- Si gioca su invito (link o codice) o scegliendo dalla lista amici.
- Pubblico iniziale: amici. Struttura pronta per un'eventuale apertura pubblica futura.
- Piattaforma multi-gioco: ogni gioco è un modulo separato con le proprie regole.

**Fuori dal primo rilascio**

- Partite asincrone (a giorni), matchmaking con sconosciuti, classifiche pubbliche.
- Chat libera (solo reazioni o messaggi predefiniti).
- Pagamenti.

## Scelte tecniche

Un solo linguaggio, TypeScript, per tutto: frontend, regole di gioco e funzioni server. Sono tecnologie molto diffuse, quindi Claude le conosce bene e commette meno errori.

| Area | Scelta | Perché |
| --- | --- | --- |
| Linguaggio | TypeScript | Uno solo ovunque; i tipi intercettano molti errori prima che arrivino a te |
| Web app | React + Vite, PWA installabile | Standard, veloce, si installa sul telefono come un'app |
| Interfaccia | Tailwind CSS + componenti shadcn/ui | Grafica curata senza disegnare tutto da zero |
| Animazioni carte | Framer Motion | Movimenti fluidi di carte e perle |
| Backend | Supabase (regione UE) | Login, database, realtime, funzioni server e storage in un unico servizio |
| Arbitro di gioco | Supabase Edge Functions | Valida ogni mossa sul server: nessuno può barare |
| Regole di gioco | Pacchetto TypeScript condiviso | Stesse regole sul server e sul client, testate in automatico |
| Test | Vitest + Playwright | Regole testate con partite simulate; flussi dell'app provati come un utente |
| Notifiche | Web Push, poi Firebase Cloud Messaging per le app | Inviti a giocare anche ad app chiusa |
| App mobile | Capacitor | Impacchetta la stessa web app per iOS e Android |
| Pubblicazione web | Render (sito statico) | Ogni modifica va online in automatico |
| Codice | GitHub, un unico repository | Storico di tutto, si può sempre tornare indietro |

## Architettura

La piattaforma è un nucleo comune più un modulo per ogni gioco; il server decide ogni mossa e non manda mai a un giocatore le carte degli altri.

```
App del giocatore (web/PWA, poi iOS/Android)
   │  invia la mossa                     ▲ riceve solo la propria vista + avvisi Realtime
   ▼                                     │
Supabase (UE)
   Arbitro (Edge Function) → Regole del gioco (modulo) → Stato completo (privato)
                                                       → Vista per giocatore
   Realtime · Controllo turni (timer, disconnessioni) · Login e amici · Notifiche push
```

L'app invia la mossa, l'arbitro la controlla con le regole, aggiorna lo stato privato e ricava la vista di ogni giocatore; Realtime avvisa gli altri.

**Nucleo comune a tutti i giochi**: login, profili, amici, inviti, lobby, partite, turni e scadenze, notifiche, storico.

**Modulo di un gioco**: preparazione della partita, mosse valide, applicazione della mossa, fine partita, vista per giocatore, più la sua grafica. Un nuovo gioco = un nuovo modulo; il nucleo non cambia.

## Regole del portale

Queste regole valgono per tutti i giochi; il modulo di un gioco decide solo cosa succede sul tavolo. È una proposta da confermare.

**Amici**

- Ricerca per nickname e richiesta di amicizia, che l'altro deve accettare.
- Si vede quali amici sono online.
- Blocco di un utente: non può più invitarti né vederti online.

**Creare e unirsi a una partita**

- Chi crea sceglie gioco, numero di giocatori e impostazioni (es. tempo per turno).
- Invita dalla lista amici (arriva una notifica) o condivide un link o codice; il link smette di funzionare quando la partita parte.
- Stanza d'attesa: si vede chi è entrato e chi è pronto; chi crea avvia la partita.
- L'ordine dei turni lo sorteggia il server.

**Durante la partita**

- Una sola partita in corso per giocatore alla volta.
- Timer, disconnessioni ed esclusioni come nella sezione sui turni.
- Abbandono volontario: conta come sconfitta; la partita continua se restano almeno 2 giocatori.
- Solo reazioni e messaggi predefiniti, niente chat libera.

**Fine partita**

- Riepilogo con punteggi e vincitore, salvato nello storico.
- Pulsante "Rivincita" per ripartire con gli stessi giocatori.

## Turni in tempo reale e tempo massimo

I giocatori sono collegati insieme e giocano a turno; ogni turno ha un timer di pochi minuti scelto da chi crea la partita. Allo scadere il server applica la regola scelta, così nessuno resta bloccato.

**Impostazioni alla creazione della partita**

| Impostazione | Opzioni proposte | Default |
| --- | --- | --- |
| Tempo massimo per turno | 1, 2, 3, 5 minuti | 2 minuti |
| Allo scadere del turno | Turno passato, mossa automatica semplice | Turno passato |
| Turni scaduti prima dell'esclusione | 2, 3, mai | 3 |
| Attesa se un giocatore si disconnette | 30 secondi, 1 minuto, 2 minuti | 1 minuto |

**Come funziona**

1. Si entra nella stanza della partita dall'invito; la partita parte quando tutti sono pronti.
2. Quando tocca a un giocatore, il server registra l'ora di scadenza e tutti vedono il conto alla rovescia.
3. A tempo scaduto, l'app di un altro giocatore chiede al server di chiudere il turno; il server controlla l'orario e applica la regola. Un controllo automatico ogni minuto fa da riserva se nessuno è collegato.
4. Supabase Realtime mostra chi è online e aggiorna tutti in meno di un secondo.
5. Chi si disconnette può rientrare entro il tempo di grazia e ritrova la partita esattamente com'era; il suo timer intanto continua.

**Dettagli da prevedere**

- Notifica push quando un amico ti invita a una partita, anche ad app chiusa.
- Avviso sonoro o vibrazione quando tocca a te e negli ultimi 15 secondi.
- Partita abbandonata da tutti: chiusa automaticamente dopo qualche minuto.

Con turni di pochi minuti Supabase resta adatto: il tempo di risposta a una mossa (qualche decimo di secondo) non si nota.

## Fasi del progetto

Sette fasi, ognuna chiusa da una verifica concreta; il primo rilascio tra amici arriva a fine Fase 3.

| Fase | Contenuto | Chiusa quando |
| --- | --- | --- |
| 0 · Regolamento del primo gioco | Regole complete, elenco carte | Regolamento e carte approvati (FATTO) |
| 1 · Motore di gioco | Regole in TypeScript con test, bot che giocano partite simulate | 1.000 partite tra bot senza errori |
| 2 · Prototipo web | Supabase come arbitro, partita via link d'invito, grafica semplice | Una partita completa tra due amici |
| 3 · Piattaforma | Login, profili, amici, inviti, Le mie partite, tempo reale con timer, riconnessione | Gli amici giocano due settimane senza blocchi |
| 4 · Grafica e rifinitura | Illustrazioni, animazioni, suoni, PWA, privacy | Si installa dal telefono e piace agli amici |
| 5 · App mobile | Capacitor iOS/Android, notifiche native, store | App approvata sugli store |
| 6 · Secondo gioco | Nuovo modulo regole e grafica | Aggiunto senza toccare il nucleo |

Non si passa alla fase successiva finché la verifica non è superata. I tempi dipendono dal ritmo delle sessioni: indicativamente qualche settimana per le Fasi 0–2 e qualche mese fino alla fine della Fase 3.

## Come lavorare in vibe coding

Non leggendo il codice, la qualità si controlla con test automatici, anteprime da provare e piccoli passi. Lo sviluppo si fa su Claude Code; la progettazione qui.

**Regole di lavoro**

1. **Un documento guida nel repository** (`CLAUDE.md`): obiettivo, stack, regole d'oro. Claude Code lo legge a ogni sessione.
2. **Un passo alla volta**: ogni richiesta = una funzionalità piccola e verificabile ("lista amici", non "tutta la parte social").
3. **Test obbligatori sulle regole**: ogni regola del gioco ha un test; Claude non chiude un passo con test rossi.
4. **Bot di prova**: partite simulate tra bot (migliaia) per trovare crash e squilibri senza giocare a mano.
5. **Prova tu ogni passo**: anteprima online automatica a ogni modifica; la provi dal telefono e dici cosa non va.
6. **Salvataggi frequenti su GitHub**: se qualcosa si rompe, si torna alla versione precedente.
7. **Ambiente di prova separato**: un progetto Supabase di test e uno di produzione; gli amici giocano solo sulla versione stabile.

**Cosa chiedere a Claude Code a fine passo**

- Spiegami in parole semplici cosa hai fatto e come lo provo.
- I test passano? Quanti sono?
- Ci sono dati visibili a chi non dovrebbe vederli?

## Criticità, costi ed evoluzione

Il rischio maggiore non è tecnico ma di regole: un gioco descritto in modo incompleto produce un'app piena di casi strani. Per questo la Fase 0 è scrivere il regolamento completo.

| Rischio | Effetto | Contromisura |
| --- | --- | --- |
| Regole ambigue o incomplete | Bug, discussioni, rifacimenti | Regolamento completo + elenco carte prima di programmare |
| Somiglianza eccessiva a Molthar | Problemi di proprietà intellettuale | Nome, ambientazione, grafica e testi originali; meccaniche variate; parere legale prima di un'apertura pubblica |
| Errori nelle regole di accesso ai dati | Un giocatore vede le carte altrui | Stato completo mai leggibile dai client; test dedicati |
| Disconnessioni durante la partita | Partita bloccata o persa | Rientro automatico, tempo di grazia, timer per turno |
| Codice che cresce disordinato | Ogni modifica rompe altro | Passi piccoli, test, `CLAUDE.md` aggiornato |
| Grafica delle carte | Tempo e costo più alti del previsto | Partire con grafica semplice; illustrazioni dopo (illustratore o immagini generate con licenza chiara) |
| Revisione Apple | Ritardi nella pubblicazione | Prima PWA; store solo quando l'app è stabile |
