# La Famiglia – piano di implementazione (proposta del 2026-10-24, da approvare)

Nome tecnico: `famiglia` (pacchetto `@og/famiglia`). Regole in `regolamento.md`, carte in `bozza.md` e `carte.md`.
Non si toccano Il Portale e Ufficio: si riusano solo i pezzi comuni (motore, arbitro, pagine).

## Immagini delle carte

Cartella: `games/famiglia/immagini/classica/`. Per ogni carta si cerca, in ordine:

1. l'immagine della carta precisa: `antonio-1.png`, `antonio-2.png`, `antonio-3.png` (livello 1, 2, 3);
2. l'immagine della persona: `antonio.png` (vale per tutte e tre le sue carte);
3. se non c'è nessuna immagine: il nome scritto in grande sulla carta.

Vanno bene `.png`, `.jpg`, `.jpeg`, `.webp`. Nomi in minuscolo, senza accenti, spazi sostituiti da trattini:
`nonno-salvatore.png`, `sara-e-giuseppe-3.jpg`, `toto.png`, `don-pasquale.png`, `paesano.png`, `la-tomacella.png`.
L'elenco esatto dei nomi file sarà in `games/famiglia/immagini/LEGGIMI.md`.

## Fasi

### Fase A – Regole (pacchetto `games/famiglia`, solo codice di gioco + test)

| Passo | Cosa | Come si verifica |
| --- | --- | --- |
| A1 ✅ | Dati delle carte (tutte le 100 + eventi) in un file di dati, codici di attivazione | Test: ogni carta ha codice, punti, tipo, ricarica |
| A2 ✅ | Partita base: tavolo, mazzi, 3 mosse, prendere/pescare/bruciare/attivare, zone (mano nascosta, attacchi in attesa, attivati), limiti, mancia dei nonni, caffè, campanello | Test per ogni regola |
| A3 | Ricarica e poteri di aiuto ✨ | Un test per ogni potere |
| A4 | Attacchi ⚔️ e difese 🛡️: la partita si ferma e l'attaccato sceglie se difendersi (regola del livello, difese d'emergenza, carte difesa e attacco) | Un test per ogni attacco e ogni difesa |
| A5 | Eventi, Famiglia al completo, fine partita (a punti o fine mazzo) | Test |
| A6 | Robot che giocano a caso + simulazione di 1000 partite (`pnpm simula:famiglia`) con statistiche: durata, carte più usate, attacchi andati a segno | Rapporto `docs/famiglia/statistiche-simulazione.md`, da guardare insieme per il bilanciamento |

### Fase B – Arbitro (server)

| Passo | Cosa |
| --- | --- |
| B1 | L'arbitro conosce il nuovo gioco; opzioni di chi crea la partita: punti (20), modo di fine, tempo per difendersi (30 s) |
| B2 | Tempo per difendersi: se l'attaccato non risponde in tempo, l'attacco passa da solo (stesso meccanismo del "computer al posto di chi è fermo") |
| B3 | Pubblicazione dell'arbitro e test sul progetto Supabase di prova |

### Fase C – Schermata (sito)

| Passo | Cosa |
| --- | --- |
| C1 | Scelta del gioco nella pagina iniziale (👨‍👩‍👧 La Famiglia) e catalogo "Tutte le carte" |
| C2 | Disegno delle carte (immagine o nome, livello, tipo, codice, punti, carica/stanca) |
| C3 | Tavolo: le tre zone, mosse, attivazione, uso dei poteri |
| C4 | Finestra "Ti attaccano! Ti difendi?" con conto alla rovescia; evento in corso in alto |
| C5 | Schermo spettatori, suoni, prova a due giocatori, pubblicazione su Render |

## Da decidere prima o durante

- Simone e Annalisa (poteri), Pranzo della domenica e Ferragosto (effetti): finché non sono definiti
  restano **fuori dal mazzo**; si aggiungono dopo con una riga nel file dei dati.
- Durante la Fase A potranno emergere dubbi sui singoli poteri: li annoto in fondo a `regolamento.md` e te li chiedo.
