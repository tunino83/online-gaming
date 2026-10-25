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
| D17 | Che paura! | Christian | 1 | Coppia |
| D18 | Non ti sento, sto suonando | Donato | 2 | Scala da 3 |
| D19 | Guardia medica | Zia Diana | 2 | 3 carte con somma 12 |
| D20 | Paesano | Paesano | 1 | 1 carta qualsiasi |
| D21 | Aglianico | Aglianico | 2 | Coppia |
| D22 | Taurasi | Taurasi | 3 | Tris |
| D23 | Campari | Campari | 2 | 2 carte qualsiasi |
| D24 | Sono a un matrimonio | Sono a un matrimonio | 2 | 2 carte qualsiasi |
| D25 | Nevicava, non è potuto venire | Nevicava, non è potuto venire | 2 | 2 carte qualsiasi |
| D26 | Sono andato a Lioni a fa' a spesa | Sono andato a Lioni a fa' a spesa | 2 | 2 carte qualsiasi |

## Matrice

| Attacco | Liv. | Contro | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 | D16 | D17 | D18 | D19 | D20 | D21 | D22 | D23 | D24 | D25 | D26 | Fermano |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Forno a legna (Antonio 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Solo per vedere comm sape (Nonno Nicola 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Manca 'o sale (Nonno Nicola 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 5 |
| Baratto (Nonna Patrizia 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Si incanta (Totò 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 |
| Schietta (Checca 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 |
| Allergica al finocchietto (Checca 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Urla (Donatina 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 5 |
| Si canta! (Zio Salvatore 1) | 1 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 22 |
| Versa il vino (Zio Salvatore 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Smash (Francesco 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Una rospa? (Gerardina 2) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Rospe per tutti (Gerardina 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 5 |
| Vertenza (Giuseppe 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Tritacarne (Sara e Giuseppe 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Il bastone (Nonno Antonio 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Ti chiamo un attimo… (Roberta 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 |
| Sparecchio (Roberta 3) | 3 | uno | ✓ | · | ↪ | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 6 |
| Zeppata sui social (Claudia 2) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 19 |
| Burla (Squacqualacchione 1) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 |
| Volo infuocato (Squacqualacchione 3) | 3 | tutti | ✓ | · | · | · | · | 🔁 | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 5 |
| Parla parla parla (Nicole) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Risata contagiosa (Greta) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 19 |
| Multa (Franchino) | 2 | tutti | ✓ | · | · | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 19 |
| La tomacella (La tomacella) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Giro aperto (Giro aperto) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Gli occhi 'nguoll (Gli occhi 'nguoll) | 2 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21 |
| Vento (Vento) | 1 | uno | ✓ | ↪ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🩹 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 |

## Riepilogo

| Livello attacco | Attacchi | Difese che li fermano (✓ ↪ 🔁) |
| --- | --- | --- |
| 1 | 6 | da 22 a 24 su 26 |
| 2 | 12 | da 19 a 21 su 26 |
| 3 | 10 | da 5 a 6 su 26 |

| Livello difesa | Difese | Attacchi che possono fermare |
| --- | --- | --- |
| 1 | 4 | da 0 a 6 su 28 |
| 2 | 16 | da 0 a 18 su 28 |
| 3 | 6 | da 20 a 28 su 28 |
