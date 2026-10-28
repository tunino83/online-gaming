# La Famiglia – matrice attacchi contro difese

Generata da `games/famiglia/scripts/matrice.ts` (`pnpm matrice:famiglia`): si aggiorna da sola quando cambiano le carte.

**Come si legge**: righe = attacchi, colonne = difese (numerate, elenco sotto).
✓ la difesa ferma l'attacco · ↪ lo passa a un altro (Maddalena) · 🔁 lo rimanda a chi l'ha fatto (Permalosa) ·
½ lo ferma una volta su due (Marika 1) · 🩹 passa ma i danni si curano (Zia Diana) · – passa e non c'è niente da curare ·
· non si può usare (regola del livello, o deviazione contro un attacco contro tutti).

## Difese (colonne)

| N. | Difesa | Carta | Livello | Codice |
| --- | --- | --- | --- | --- |
| D1 | Per me è quadrato | Antonio 3 | 3 | 4 carte con somma 20 |
| D2 | Non è colpa mia | Maddalena 3 | 3 | Doppia coppia |
| D3 | Nuvola di fumo | Nonna Patrizia 2 | 2 | Scala da 3 |
| D4 | Tofu Super Seitan | Chicca 1 | 1 | 2 carte con somma 8 |
| D5 | E se poi te ne penti? | Chicca 3 | 3 | Doppia coppia |
| D6 | Stuffosa | Checca 3 | 3 | 4 carte con somma 24 |
| D7 | Non è ancora arrivato | Francesco 2 | 2 | 3 carte con somma 20 |
| D8 | Scatto d'ira | Francesco 3 | 3 | 4 carte con somma 20 |
| D9 | Sempre calma | Gerardina 1 | 1 | Coppia |
| D10 | Forse c'è, forse no | Marika 1 | 1 | Coppia |
| D11 | Non c'è, ha il turno | Marika 2 | 2 | Scala da 3 |
| D12 | Ricorso | Giuseppe 2 | 2 | 3 carte pari |
| D13 | Cella frigorifera | Sara e Giuseppe 2 | 2 | 3 carte dispari |
| D14 | Mutandoni di lana | Nonno Antonio 2 | 2 | 3 carte dispari |
| D15 | Ho appena lavato a terra | Nonna Maddalena 2 | 2 | 3 carte con somma 9 |
| D16 | Chiusa in camera | Roberta 2 | 2 | Tris |
| D17 | Una fetta di torta? | Claudia 3 | 3 | Doppia coppia |
| D18 | Scudo da gladiatore | Simone 2 | 2 | 3 carte dispari |
| D19 | Drago Tascabile | Annalisa 1 | 1 | 2 carte con somma 11 |
| D20 | La cionna | Nonna Maria 3 | 3 | 4 carte dispari |
| D21 | Tiro su un muro | Nonno Rafiluccio 1 | 1 | 2 carte con somma 10 |
| D22 | Non ti sento, sto suonando | Donato | 2 | Scala da 3 |
| D23 | Guardia medica | Zia Diana | 2 | 3 carte con somma 12 |
| D24 | Paesano | Paesano | 1 | 1 carta qualsiasi |
| D25 | Aglianico | Aglianico | 2 | Coppia |
| D26 | Taurasi | Taurasi | 3 | Tris |
| D27 | Campari | Campari | 2 | 2 carte qualsiasi |
| D28 | Sono a un matrimonio | Sono a un matrimonio | 2 | 2 carte qualsiasi |
| D29 | Nevicava, non è potuto venire | Nevicava, non è potuto venire | 2 | 2 carte qualsiasi |
| D30 | Sono andato a Lioni a fa' a spesa | Sono andato a Lioni a fa' a spesa | 2 | 2 carte qualsiasi |

## Matrice

| Attacco | Liv. | Contro | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 | D16 | D17 | D18 | D19 | D20 | D21 | D22 | D23 | D24 | D25 | D26 | D27 | D28 | D29 | D30 | Fermano |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alta idratazione (Antonio 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Solo per vedere comm sape (Nonno Nicola 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| È insipido (Nonno Nicola 3) | 3 | tutti | ✓ | · | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Baratto (Nonna Patrizia 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Si incanta (Totò 1) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |
| Lingua Glabra (Checca 1) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |
| Collezione (Checca 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Urla (Donatina 3) | 3 | tutti | ✓ | · | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Si canta! (Zio Salvatore 1) | 1 | tutti | ✓ | · | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 27 |
| Versa il vino (Zio Salvatore 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Una rospa? (Gerardina 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Rospe per tutti (Gerardina 3) | 3 | tutti | ✓ | · | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Vertenza (Giuseppe 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Tritacarne (Sara e Giuseppe 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Il bastone (Nonno Antonio 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Ti chiamo un attimo… (Roberta 1) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |
| Sparecchio (Roberta 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Zeppata sui social (Claudia 2) | 2 | tutti | ✓ | · | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 22 |
| Burla (Squacqualacchione 1) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |
| Volo infuocato (Squacqualacchione 3) | 3 | tutti | ✓ | · | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 7 |
| Invasione di campo (Simone 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Una sigaretta fuori al bar (Nonna Maria 2) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Brontola tutto il giorno (Nonno Rafiluccio 3) | 3 | uno | ✓ | ↪ | · | · | 🔁 | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | 8 |
| Parla parla parla (Nicole) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Ho tanta fame (Christian) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |
| Risata contagiosa (Greta) | 2 | tutti | ✓ | · | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 22 |
| Multa (Franchino) | 2 | tutti | ✓ | · | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 22 |
| Bisiniss (Rocky) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| La tomacella (La tomacella) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | 🩹 | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Giro aperto (Giro aperto) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Gli occhi 'nguoll (Gli occhi 'nguoll) | 2 | uno | ✓ | ↪ | ✓ | · | 🔁 | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | ✓ | – | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 23 |
| Vento (Vento) | 1 | uno | ✓ | ↪ | ✓ | ✓ | 🔁 | ✓ | ✓ | ✓ | ✓ | ½ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🩹 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 28 |

## Riepilogo

| Livello attacco | Attacchi | Difese che li fermano (✓ ↪ 🔁) |
| --- | --- | --- |
| 1 | 7 | da 27 a 28 su 30 |
| 2 | 14 | da 22 a 23 su 30 |
| 3 | 11 | da 7 a 8 su 30 |

| Livello difesa | Difese | Attacchi che possono fermare |
| --- | --- | --- |
| 1 | 6 | da 0 a 7 su 32 |
| 2 | 16 | da 0 a 21 su 32 |
| 3 | 8 | da 24 a 32 su 32 |
