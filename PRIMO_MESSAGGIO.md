Ciao! Iniziamo un nuovo progetto nel repository github.com/tunino83/online-gaming.

Nella cartella del progetto ho messo tre file: `CLAUDE.md` (come lavoriamo), `docs/piano.md` (piano completo)
e `docs/regolamento.md` (regole del primo gioco e elenco dei personaggi). Leggili tutti prima di iniziare.

Siamo nella Fase 1: il motore di gioco, solo logica e test, senza interfaccia e senza Supabase.

Procedi così, fermandoti dopo ogni punto per spiegarmi in parole semplici cosa hai fatto:

1. Prepara il monorepo (pnpm, TypeScript, Vitest) con `packages/engine` e `games/primo-gioco`,
   e fai il primo commit.
2. Trasforma l'elenco dei personaggi del regolamento in un file di dati e verifica con un test che il mazzo
   abbia 55 carte e le 56 carte numero e i 20 diamanti siano corretti.
3. Implementa la verifica dei codici di attivazione (tutti i tipi: esatto, coppia, tris, poker, somma,
   scale, doppia coppia, combinato, pari/dispari), con diamanti +1, carte virtuali dei nani e poteri che
   cambiano i valori. Tanti test, anche sui casi limite.
4. Implementa il turno completo: mosse, limiti, bruciare, fulmini, poteri blu e rossi, fine partita.
5. Crea un bot che gioca mosse casuali valide e uno script che simula 1.000 partite e mi mostra le statistiche.

Se trovi regole ambigue, non inventare: chiedimelo e annotale in fondo al regolamento.
