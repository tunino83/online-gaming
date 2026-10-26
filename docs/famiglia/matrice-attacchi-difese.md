# La Famiglia – matrice attacchi contro difese

Generata da `games/famiglia/scripts/matrice.ts` (`pnpm matrice:famiglia`): si aggiorna da sola quando cambiano le carte.

**Come si legge**: righe = attacchi, colonne = difese (numerate, elenco sotto).
✓ la difesa ferma l'attacco · ↪ lo passa a un altro (Maddalena) · 🔁 lo rimanda a chi l'ha fatto (Permalosa) ·
½ lo ferma una volta su due (Marika 1) · 🩹 passa ma i danni si curano (Zia Diana) · – passa e non c'è niente da curare ·
· non si può usare (regola del livello, o deviazione contro un attacco contro tutti).

## Difese (colonne)

| N. | Difesa | Carta | Livello | Codice |
| --- | --- | --- | --- | --- |
| D1 | Ho sempre ragione io | Antonio 3 | 3 | 4 carte con somma 20 |
| D2 | Non è colpa mia | Maddalena 2 | 2 | 3 carte dispari |
| D3 | È colpa di qualcun altro | Maddalena 3 | 3 | Doppia coppia |
| D4 | Nuvola di fumo | Nonna Patrizia 2 | 2 | Scala da 3 |
| D5 | Non sa perdere | Chicca 2 | 2 | 3 carte con somma 9 |
| D6 | Permalosa | Chicca 3 | 3 | Doppia coppia |
| D7 | Si arrabbia | Francesco 3 | 3 | 4 carte con somma 20 |
| D8 | Sempre calma | Gerardina 1 | 1 | Coppia |
| D9 | Forse c'è, forse no | Marika 1 | 1 | Coppia |
| D10 | Non c'è, ha il turno | Marika 2 | 2 | Scala da 3 |
| D11 | Ricorso | Giuseppe 2 | 2 | 3 carte pari |
| D12 | Cella frigorifera | Sara e Giuseppe 2 | 2 | 3 carte dispari |
| D13 | Mutandoni di lana | Nonno Antonio 2 | 2 | 3 carte dispari |
| D14 | Ho appena lavato a terra | Nonna Maddalena 2 | 2 | 3 carte con somma 9 |
| D15 | Chiusa in camera | Roberta 2 | 2 | Tris |
| D16 | Una fetta di torta? | Claudia 3 | 3 | Doppia coppia |
| D17 | Scudo da gladiatore | Simone 2 | 2 | 3 carte dispari |
| D18 | Tyrion nella borsa | Annalisa 1 | 1 | 2 carte con somma 11 |
| D19 | Bracciali d'oro | Nonna Maria 3 | 3 | 4 carte dispari |
| D20 | Tiro su un muro | Nonno Rafiluccio 1 | 1 | 2 carte con somma 10 |
| D21 | Non ti sento, sto suonando | Donato | 2 | Scala da 3 |
| D22 | Guardia medica | Zia Diana | 2 | 3 carte con somma 12 |
| D23 | Paesano | Paesano | 1 | 1 carta qualsiasi |
| D24 | Aglianico | Aglianico | 2 | Coppia |
| D25 | Taurasi | Taurasi | 3 | Tris |
| D26 | Campari | Campari | 2 | 2 carte qualsiasi |
| D27 | Sono a un matrimonio | Sono a un matrimonio | 2 | 2 carte qualsiasi |
| D28 | Nevicava, non è potuto venire | Nevicava, non è potuto venire | 2 | 2 carte qualsiasi |
| D29 | Sono andato a Lioni a fa' a spesa | Sono andato a Lioni a fa' a spesa | 2 | 2 carte qualsiasi |

## Matrice

| Attacco | Liv. | Contro | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 | D16 | D17 | D18 | D19 | D20 | D21 | D22 | D23 | D24 | D25 | D26 | D27 | D28 | D29 | Fermano |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Forno a legna (Antonio 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Solo per vedere comm sape (Nonno Nicola 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Manca 'o sale (Nonno Nicola 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Baratto (Nonna Patrizia 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Si incanta (Totò 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |
| Schietta (Checca 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |
| Allergica al finocchietto (Checca 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Urla (Donatina 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Si canta! (Zio Salvatore 1) | 1 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 25 |
| Versa il vino (Zio Salvatore 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Smash (Francesco 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Una rospa? (Gerardina 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Rospe per tutti (Gerardina 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Vertenza (Giuseppe 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Tritacarne (Sara e Giuseppe 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Il bastone (Nonno Antonio 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Ti chiamo un attimo… (Roberta 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |
| Sparecchio (Roberta 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Zeppata sui social (Claudia 2) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Burla (Squacqualacchione 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |
| Volo infuocato (Squacqualacchione 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Invasione di campo (Simone 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Una sigaretta fuori al bar (Nonna Maria 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Brontola tutto il giorno (Nonno Rafiluccio 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Parla parla parla (Nicole) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Risata contagiosa (Greta) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Multa (Franchino) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Bisiniss (Rocky) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| La tomacella (La tomacella) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Giro aperto (Giro aperto) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Gli occhi 'nguoll (Gli occhi 'nguoll) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Vento (Vento) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🩹 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |

## Riepilogo

| Livello attacco | Attacchi | Difese che li fermano (✓ ↪ 🔁) |
| --- | --- | --- |
| 1 | 6 | da 25 a 27 su 29 |
| 2 | 14 | da 21 a 23 su 29 |
| 3 | 12 | da 6 a 7 su 29 |

| Livello difesa | Difese | Attacchi che possono fermare |
| --- | --- | --- |
| 1 | 5 | da 0 a 6 su 32 |
| 2 | 17 | da 0 a 20 su 32 |
| 3 | 7 | da 24 a 32 su 32 |
