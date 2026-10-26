# Voci delle carte – La Famiglia

Ogni carta può avere una voce registrata che parte su tutti i telefoni:

| Quando parte | Nome del file | Esempio |
| --- | --- | --- |
| quando la carta viene **attivata** | `<carta>` | `antonio-2.mp3` |
| quando si usa il suo **attacco** | `<carta>_ATT` | `antonio-2_ATT.mp3` |
| quando si usa la sua **difesa** | `<carta>_DIF` | `antonio-3_DIF.mp3` |
| quando si usa il suo **aiuto** | `<carta>_AIU` | `antonio-1_AIU.mp3` |

- `<carta>` è lo stesso nome delle foto: `nomepersona-livello` (es. `nonna-dina-3`), oppure solo il nome per le carte
  singole (es. `rocky`, `alessia`, `paesano`). Con il nome della persona senza livello (es. `antonio.mp3`,
  `antonio_ATT.mp3`) la voce vale per tutte le sue carte che non ne hanno una propria.
- Formati che vanno online: **.mp3** (il migliore) oppure **.m4a**; vanno bene anche .aac e .wav.
- **Vocali di WhatsApp** (.opus/.ogg) e altri formati: mettili in `audio/_originali/` con il nome giusto
  (es. `antonio-2_ATT.opus`) e lancia `pnpm vocali:famiglia`. Il comando controlla i nomi, li trasforma in .mp3
  in questa cartella (voce sola, silenzi tolti all'inizio e alla fine, volume uguale per tutti, al massimo 8 secondi)
  e rifà solo i file nuovi o cambiati (`--tutti` per rifarli tutti). Serve ffmpeg: `winget install Gyan.FFmpeg`.
- Durata: frasi brevi, **al massimo 5–6 secondi**. Meglio registrare in un posto silenzioso, vicino al telefono.
- Se una carta non ha la registrazione, il telefono legge il nome della carta o del potere con la sua voce.
- Le cartelle che iniziano con `_` (es. `_originali`) non vanno online.
