# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **500** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **500** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 25
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 125 | 52,5 | 26,2 | 34–110 | 27,2 | 21,8 | 50% · 50% |
| 3 | 125 | 71,0 | 23,7 | 51–105 | 27,4 | 20,4 | 32% · 38% · 30% |
| 4 | 125 | 90,2 | 22,6 | 68–124 | 27,4 | 19,4 | 26% · 27% · 25% · 21% |
| 5 | 125 | 109,9 | 22,0 | 85–145 | 27,4 | 18,8 | 14% · 25% · 24% · 17% · 20% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Donato (1,33), Squacqualacchione 1 (1,33), Chicca 1 (1,30), Roberta 2 (1,28), Totò 1 (1,28), Marika 1 (1,27), Francesco 3 (1,26), Sara e Giuseppe 2 (1,23), Nonno Antonio 2 (1,23), Squacqualacchione 3 (1,23), Nonna Patrizia 3 (1,23), Alessia (1,22), Sara e Giuseppe 3 (1,22), Checca 3 (1,22), Marika 2 (1,21)
- Carte che sembrano **più deboli** (≤ 0,8): Nonna Maria 1 (0,44), Nonna Dina 3 (0,57), Nonna Maddalena 3 (0,57), Nonna Dina 2 (0,62), Totò 2 (0,64), Checca 2 (0,64), Donatina 2 (0,65), Annalisa 2 (0,67), Marika 3 (0,69), Maddalena 1 (0,74), Vincenzo (0,75), Totò 3 (0,77)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (7%), Nonno Salvatore 3 (7%), Roberta 3 (9%), Nonna Maddalena 3 (10%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,39 | 38% | 192 | 1,44 | 1,33 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,31 | 30% | 150 | 1,41 | 1,30 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,40 | 39% | 195 | 1,39 | 1,28 |
| Marika 1 | 🛡️ | Coppia | 0,34 | 33% | 165 | 1,38 | 1,27 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,38 | 37% | 182 | 1,27 | 1,17 |
| Christian | ⚔️ | Coppia | 0,42 | 41% | 205 | 1,26 | 1,16 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,23 | 23% | 114 | 1,24 | 1,15 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,37 | 36% | 185 | 1,24 | 1,14 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,39 | 37% | 186 | 1,24 | 1,14 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,34 | 34% | 170 | 1,19 | 1,10 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,24 | 23% | 116 | 1,19 | 1,10 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,11 | 11% | 58 | 1,15 | 1,06 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,34 | 34% | 169 | 1,13 | 1,04 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,34 | 33% | 164 | 1,13 | 1,04 |
| Gerardina 1 | 🛡️ | Coppia | 0,38 | 37% | 182 | 1,10 | 1,01 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,35 | 35% | 172 | 1,01 | 0,93 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,34 | 34% | 170 | 1,00 | 0,92 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,32 | 31% | 154 | 1,00 | 0,92 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,41 | 40% | 201 | 1,00 | 0,92 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,46 | 46% | 227 | 0,99 | 0,92 |
| Nonno Antonio 1 | 🔵 | 12 | 0,25 | 25% | 124 | 0,98 | 0,90 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,31 | 30% | 151 | 0,96 | 0,89 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,32 | 31% | 157 | 0,96 | 0,89 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,39 | 39% | 194 | 0,92 | 0,85 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,28 | 28% | 144 | 0,90 | 0,83 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,24 | 24% | 121 | 0,87 | 0,81 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,34 | 33% | 162 | 0,81 | 0,75 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,40 | 39% | 195 | 0,80 | 0,74 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,29 | 29% | 147 | 0,47 | 0,44 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Donato | 🛡️ | Scala da 3 | 0,25 | 24% | 122 | 1,66 | 1,33 |
| Roberta 2 | 🛡️ | Tris | 0,17 | 17% | 84 | 1,60 | 1,28 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,29 | 28% | 142 | 1,54 | 1,23 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,29 | 29% | 146 | 1,53 | 1,23 |
| Alessia | ✨ | 3 carte pari | 0,30 | 29% | 146 | 1,52 | 1,22 |
| Marika 2 | 🛡️ | Scala da 3 | 0,23 | 23% | 113 | 1,51 | 1,21 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,36 | 36% | 179 | 1,47 | 1,18 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,27 | 26% | 132 | 1,44 | 1,15 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,27 | 26% | 130 | 1,42 | 1,14 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,37 | 36% | 180 | 1,41 | 1,13 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,37 | 36% | 181 | 1,39 | 1,12 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,24 | 24% | 120 | 1,39 | 1,11 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,25 | 25% | 123 | 1,38 | 1,10 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,33 | 32% | 159 | 1,34 | 1,08 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,37 | 37% | 182 | 1,32 | 1,06 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,37 | 37% | 182 | 1,31 | 1,05 |
| Greta | ⚔️ | 3 carte dispari | 0,36 | 36% | 182 | 1,27 | 1,02 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,31 | 30% | 148 | 1,24 | 1,00 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,33 | 32% | 161 | 1,24 | 0,99 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,36 | 36% | 178 | 1,22 | 0,98 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,30 | 29% | 147 | 1,20 | 0,96 |
| Don Pasquale | 🛡️ | Tris | 0,19 | 19% | 95 | 1,20 | 0,96 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,30 | 30% | 151 | 1,17 | 0,94 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,36 | 36% | 181 | 1,17 | 0,94 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,33 | 32% | 162 | 1,13 | 0,91 |
| Nonno Salvatore 2 | ✨ | Tris | 0,19 | 19% | 91 | 1,11 | 0,89 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,40 | 40% | 200 | 1,10 | 0,88 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,29 | 28% | 139 | 1,08 | 0,86 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,23 | 23% | 117 | 1,02 | 0,82 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,30 | 30% | 150 | 0,83 | 0,67 |
| Donatina 2 | ✨ | Scala da 3 | 0,29 | 29% | 145 | 0,81 | 0,65 |
| Checca 2 | ✨ | 123 | 0,12 | 12% | 61 | 0,80 | 0,64 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,30 | 30% | 149 | 0,79 | 0,64 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,35 | 34% | 170 | 0,78 | 0,62 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,21 | 21% | 107 | 1,88 | 1,26 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,15 | 15% | 77 | 1,83 | 1,23 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,28 | 28% | 142 | 1,82 | 1,23 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,24 | 24% | 118 | 1,82 | 1,22 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,26 | 26% | 128 | 1,81 | 1,22 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,18 | 18% | 90 | 1,73 | 1,16 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,21 | 21% | 105 | 1,72 | 1,16 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,22 | 22% | 107 | 1,70 | 1,14 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,22 | 22% | 109 | 1,69 | 1,14 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,28 | 28% | 139 | 1,66 | 1,12 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,27 | 27% | 134 | 1,61 | 1,08 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,07 | 7% | 41 | 1,60 | 1,08 |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,18 | 18% | 86 | 1,57 | 1,06 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,25 | 25% | 123 | 1,55 | 1,04 |
| Donatina 3 | ⚔️ | 1234 | 0,11 | 11% | 61 | 1,50 | 1,01 |
| Roberta 3 | ⚔️ | Poker | 0,09 | 9% | 46 | 1,49 | 1,00 |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,17 | 17% | 86 | 1,48 | 0,99 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,29 | 29% | 147 | 1,42 | 0,95 |
| Annalisa 3 | ✨ | Scala da 5 | 0,12 | 12% | 59 | 1,28 | 0,86 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,24 | 23% | 117 | 1,23 | 0,82 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,11 | 11% | 54 | 1,22 | 0,82 |
| Nonno Salvatore 3 | ✨ | Poker | 0,07 | 7% | 36 | 1,19 | 0,80 |
| Totò 3 | ✨ | 4 carte pari | 0,23 | 23% | 115 | 1,15 | 0,77 |
| Marika 3 | ✨ | Scala da 5 | 0,11 | 11% | 54 | 1,03 | 0,69 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,10 | 10% | 52 | 0,85 | 0,57 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,12 | 12% | 61 | 0,84 | 0,57 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 4,14 |
| Mercatino | 🔵 | 4,04 |
| Lezione di padel | 🔵 | 3,46 |
| Te l'ho già detto? | ✨ | 3,03 |
| Scaffale | ✨ | 2,94 |
| Cambiamo un po'… | ✨ | 2,93 |
| Ogni cosa al suo posto | ✨ | 2,85 |
| Domani lo faccio | ✨ | 2,81 |
| Burla | ⚔️ | 2,80 |
| Si incanta | ⚔️ | 2,79 |
| Schietta | ⚔️ | 2,67 |
| Un filo di trucco | ✨ | 2,33 |
| Studia il fascicolo | 🔵 | 2,31 |
| Frutta e verdura! | ✨ | 2,03 |
| Mo faccio due cotolette | ✨ | 1,93 |
| Straordinario | ✨ | 1,92 |
| Versa il vino | ⚔️ | 1,90 |
| Pranzo a domicilio | ✨ | 1,87 |
| Ti chiamo un attimo… | ⚔️ | 1,77 |
| Ce l'ho io! | ✨ | 1,70 |
| Solo per vedere comm sape | ⚔️ | 1,59 |
| Ho tanta fame | ⚔️ | 1,58 |
| Bisiniss | ⚔️ | 1,57 |
| Mangia mangia mangia | ✨ | 1,54 |
| Una sigaretta fuori al bar | ⚔️ | 1,54 |
| Alta idratazione | ⚔️ | 1,54 |
| Una rospa? | ⚔️ | 1,50 |
| Multa | ⚔️ | 1,49 |
| Fatto in casa | ✨ | 1,47 |
| Parla parla parla | ⚔️ | 1,45 |
| Risata contagiosa | ⚔️ | 1,39 |
| Zeppata sui social | ⚔️ | 1,29 |
| Smash | ⚔️ | 1,22 |
| Brace accesa | ✨ | 1,19 |
| Grigliata | ✨ | 1,05 |
| Nuvola di fumo | 🛡️ | 1,03 |
| Si canta! | ⚔️ | 0,95 |
| Colazione | ✨ | 0,93 |
| Baratto | ⚔️ | 0,93 |
| Offre la casa | ✨ | 0,89 |
| Benedizione | 🛡️ | 0,88 |
| L'ho già detto | ✨ | 0,86 |
| Invasione di campo | ⚔️ | 0,76 |
| Non sbaglio mai | 🔵 | 0,74 |
| Rospe per tutti | ⚔️ | 0,68 |
| Allergica al finocchietto | ⚔️ | 0,66 |
| Tritacarne | ⚔️ | 0,64 |
| Vertenza | ⚔️ | 0,56 |
| La vetrina della collezione | ✨ | 0,46 |
| Vento | ⚔️ | 0,45 |
| Puzza di brace | 🔵 | 0,42 |
| La tomacella | ⚔️ | 0,41 |
| È insipido | ⚔️ | 0,38 |
| Volo infuocato | ⚔️ | 0,38 |
| Giro aperto | ⚔️ | 0,38 |
| Gli occhi 'nguoll | ⚔️ | 0,36 |
| Anima della festa | ✨ | 0,35 |
| Brontola tutto il giorno | ⚔️ | 0,35 |
| Patate al forno | ✨ | 0,33 |
| Chissà se sta roba basta | ✨ | 0,31 |
| Sparecchio | ⚔️ | 0,27 |
| Doppio turno | ✨ | 0,27 |
| Il mio corpo che cambia | ✨ | 0,26 |
| Urla | ⚔️ | 0,23 |
| Medico in famiglia | 🔵 | 0,17 |
| Il bastone | ⚔️ | 0,12 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,11 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 1399 | 916 | 553 | 38% |
| Si incanta | 1397 | 954 | 526 | 36% |
| Schietta | 1334 | 881 | 522 | 37% |
| Versa il vino | 951 | 696 | 368 | 35% |
| Ti chiamo un attimo… | 883 | 580 | 361 | 38% |
| Solo per vedere comm sape | 795 | 615 | 224 | 27% |
| Ho tanta fame | 792 | 537 | 289 | 35% |
| Bisiniss | 786 | 612 | 240 | 28% |
| Una sigaretta fuori al bar | 771 | 581 | 240 | 29% |
| Alta idratazione | 770 | 620 | 196 | 24% |
| Una rospa? | 748 | 555 | 248 | 31% |
| Multa | 745 | 660 | 248 | 27% |
| Parla parla parla | 725 | 534 | 234 | 30% |
| Risata contagiosa | 695 | 1483 | 450 | 23% |
| Zeppata sui social | 643 | 1446 | 244 | 14% |
| Smash | 611 | 420 | 246 | 37% |
| Si canta! | 476 | 911 | 438 | 32% |
| Baratto | 466 | 449 | 28 | 6% |
| Invasione di campo | 381 | 686 | 29 | 4% |
| Rospe per tutti | 340 | 797 | 49 | 6% |
| Allergica al finocchietto | 329 | 318 | 17 | 5% |
| Tritacarne | 318 | 297 | 23 | 7% |
| Vertenza | 279 | 264 | 25 | 9% |
| Vento | 223 | 150 | 79 | 34% |
| La tomacella | 204 | 142 | 77 | 35% |
| È insipido | 189 | 452 | 22 | 5% |
| Volo infuocato | 188 | 446 | 22 | 5% |
| Giro aperto | 188 | 142 | 59 | 29% |
| Gli occhi 'nguoll | 182 | 144 | 48 | 25% |
| Brontola tutto il giorno | 173 | 167 | 8 | 5% |
| Sparecchio | 134 | 124 | 15 | 11% |
| Urla | 113 | 263 | 16 | 6% |
| Il bastone | 62 | 59 | 5 | 8% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 344 | 0 |
| Ricorso | 315 | 0 |
| Non è colpa mia | 310 | 0 |
| Mutandoni di lana | 299 | 0 |
| Cella frigorifera | 274 | 0 |
| Scudo da gladiatore | 264 | 0 |
| Ho appena lavato a terra | 257 | 0 |
| Sono andato a Lioni a fa' a spesa | 256 | 0 |
| Nevicava, non è potuto venire | 249 | 0 |
| Per me è quadrato | 246 | 0 |
| Sono a un matrimonio | 239 | 0 |
| Non ti sento, sto suonando | 235 | 0 |
| Campari | 234 | 0 |
| Non c'è, ha il turno | 231 | 0 |
| Paesano | 216 | 0 |
| È colpa di qualcun altro | 211 | 0 |
| Si arrabbia | 205 | 0 |
| Una fetta di torta? | 200 | 0 |
| Aglianico | 198 | 0 |
| E se poi te ne penti? | 193 | 0 |
| Sempre calma | 190 | 0 |
| Tiro su un muro | 168 | 0 |
| Drago Tascabile | 154 | 0 |
| Chiusa in camera | 149 | 0 |
| Tofu Super Seitan | 143 | 0 |
| La cionna | 142 | 0 |
| Nuvola di fumo | 124 | 0 |
| Forse c'è, forse no | 67 | 85 |
| Taurasi | 36 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,10 |
| La Resurrezione | 2,08 |
| Carnevale di Teora | 2,08 |
| Funerale | 2,11 |
| Matrimonio | 2,08 |
| Sagra delle tomacelle | 2,09 |

Tempo di calcolo: 175.6 secondi.
