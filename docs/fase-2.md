# Fase 2 – Prototipo web (piano proposto, da approvare)

**Obiettivo:** due amici giocano una partita completa del primo gioco dal browser, invitandosi con un link.
Grafica semplice. Niente timer, amici o notifiche: arrivano in Fase 3.

**Chiusa quando:** una partita completa tra due amici, dall'invito alla fine, senza blocchi.

## Come funziona

```
Browser del giocatore (sito su Render)
   │ invia la mossa                         ▲ riceve solo la propria vista (Realtime)
   ▼                                        │
Supabase (UE)
   Arbitro (Edge Function) ── usa le regole già scritte in Fase 1
      ├─ stato completo della partita   → tabella privata, nessun browser può leggerla
      └─ vista di ogni giocatore        → ognuno legge solo la propria riga
```

- **Ingresso semplice:** si sceglie un nickname e si entra (accesso "anonimo" di Supabase). Il login vero
  con email arriva in Fase 3; gli account anonimi si potranno poi trasformare in account normali.
- **Invito:** chi crea la partita ottiene un link (es. `.../p/K7Q2`). Chi lo apre entra nella stanza d'attesa.
  Il link smette di funzionare quando la partita parte.
- **Arbitro:** il browser manda solo la mossa; il server la controlla con le regole, aggiorna lo stato privato
  e scrive la vista di ogni giocatore. Nella vista c'è anche l'elenco delle mosse possibili, così il browser
  non deve conoscere le regole e nessuno può barare.
- **Tempo reale:** ogni giocatore riceve la propria vista aggiornata appena qualcuno muove.

## Passi (ognuno verificabile da te)

| # | Passo | Come lo provi |
| --- | --- | --- |
| 1 | Sito web vuoto (React + Vite + Tailwind) pubblicato su Render | Apri l'indirizzo Render e vedi la pagina iniziale |
| 2 | Database: tabelle partite, giocatori, stato privato, viste, storico mosse, con regole di accesso (RLS) | Test automatici: un giocatore non riesce a leggere lo stato privato né la vista altrui |
| 3 | Arbitro (Edge Function): crea partita, unisciti col codice, avvia, mossa | Test automatici + una partita giocata da script contro il server vero |
| 4 | Pagine: nickname, crea partita, stanza d'attesa con link, avvio | Crei una partita e la apri da un'altra finestra in incognito |
| 5 | Schermata di gioco: tavolo, mano, posti, personaggi attivati, avversari, mosse (carte come nell'anteprima) | Giochi una partita intera da solo con due finestre |
| 6 | Aggiornamenti in tempo reale, fine partita con punteggi e vincitore | Le due finestre si aggiornano da sole |
| 7 | Prova con un amico, dal telefono | Fase 2 chiusa |

Ogni passo: test verdi, commit su GitHub, e ti spiego come provarlo.

## Scelte tecniche nuove

- `apps/web`: l'app React. Usa le carte disegnate come in `docs/anteprima-carte.html`.
- `supabase/migrations`: le tabelle e le regole di accesso, versionate nel repository.
- `supabase/functions/arbitro`: l'arbitro. Le regole del gioco vengono "impacchettate" in un unico file
  prima della pubblicazione, così il server usa esattamente lo stesso codice testato in Fase 1.
- `render.yaml`: la configurazione del sito su Render, nel repository (ogni modifica su GitHub va online da sola).
- Chiavi: solo nel file `.env` (escluso da git) e nelle impostazioni di Render. La chiave "service_role" e la
  password del database **non** vanno mai nel codice, nei commit o in chat.

## Cosa serve dal proprietario

**Supabase**
1. Dal pannello del progetto (Project Settings → API / Data API): **Project URL** e chiave **anon / publishable**.
   Sono pubbliche per natura (finiscono nel sito), quindi si possono scrivere in chat.
2. Conferma che la regione è **UE** e che il progetto è vuoto.
3. Attivare l'accesso anonimo: Authentication → Sign In / Providers → **Allow anonymous sign-ins**.
4. Collegare il computer al progetto, nel terminale (la password la scrivi tu, io non la vedo):
   `npx supabase login` e poi `npx supabase link --project-ref <codice-progetto>`.

**Render**
1. Dire che tipo di servizio è stato creato (se esiste già un "Static Site" collegato al repository o no).
2. Al passo 1, collegare il repository GitHub da Render con il file `render.yaml` (ti guido io),
   e inserire nelle impostazioni del sito URL e chiave anon di Supabase.

**Da ricordare:** il piano gratuito di Supabase mette in pausa il progetto dopo una settimana senza uso;
si riattiva dal pannello. Questo progetto farà da ambiente **di prova**; quello di produzione si crea in Fase 3.
