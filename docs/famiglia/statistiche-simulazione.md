# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **300** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **300** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 10
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 75 | 52,3 | 26,1 | 36–110 | 27,2 | 21,6 | 53% · 47% |
| 3 | 75 | 71,9 | 24,0 | 54–105 | 27,3 | 20,5 | 34% · 39% · 27% |
| 4 | 75 | 87,7 | 21,9 | 64–116 | 27,4 | 18,9 | 24% · 26% · 23% · 27% |
| 5 | 75 | 109,8 | 22,0 | 75–145 | 27,5 | 18,7 | 18% · 29% · 18% · 17% · 17% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Squacqualacchione 1 (1,43), Chicca 3 (1,34), Donato (1,30), Donatina 3 (1,30), Maddalena 2 (1,29), Antonio 2 (1,28), Alessia (1,28), Nonno Nicola 1 (1,27), Chicca 1 (1,26), Nonno Antonio 2 (1,26), Checca 1 (1,25), Totò 1 (1,24), Marika 1 (1,23), Nonna Patrizia 1 (1,22), Sara e Giuseppe 3 (1,22), Sara e Giuseppe 2 (1,22), Rocky (1,22), Claudia 3 (1,22), Claudia 2 (1,21), Annalisa 1 (1,21)
- Carte che sembrano **più deboli** (≤ 0,8): Nonna Maria 1 (0,50), Nonna Maddalena 3 (0,61), Nonna Dina 2 (0,61), Vincenzo (0,63), Totò 2 (0,64), Don Pasquale (0,64), Donatina 2 (0,65), Zio Salvatore 3 (0,65), Simone 1 (0,66), Marika 3 (0,67), Squacqualacchione 2 (0,69), Sara e Giuseppe 1 (0,70), Maddalena 1 (0,71), Nonna Dina 3 (0,75), Checca 3 (0,77), Nonna Maddalena 1 (0,77), Annalisa 3 (0,77), Totò 3 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Salvatore 3 (7%), Nonno Antonio 3 (7%), Roberta 3 (8%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,42 | 42% | 124 | 1,51 | 1,43 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,44 | 43% | 128 | 1,34 | 1,27 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,28 | 27% | 82 | 1,33 | 1,26 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,33 | 32% | 100 | 1,33 | 1,25 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,41 | 41% | 122 | 1,31 | 1,24 |
| Marika 1 | 🛡️ | Coppia | 0,33 | 33% | 98 | 1,29 | 1,23 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,33 | 33% | 100 | 1,29 | 1,22 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,38 | 37% | 109 | 1,27 | 1,21 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,34 | 34% | 101 | 1,18 | 1,12 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,40 | 39% | 115 | 1,18 | 1,12 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,37 | 37% | 109 | 1,17 | 1,11 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,19 | 19% | 59 | 1,13 | 1,07 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,32 | 32% | 97 | 1,10 | 1,04 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,38 | 38% | 113 | 1,10 | 1,04 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,22 | 22% | 67 | 1,07 | 1,02 |
| Christian | ⚔️ | Coppia | 0,42 | 42% | 125 | 1,07 | 1,01 |
| Gerardina 1 | 🛡️ | Coppia | 0,40 | 39% | 114 | 1,06 | 1,01 |
| Nonno Antonio 1 | 🔵 | 12 | 0,23 | 23% | 68 | 1,04 | 0,99 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,43 | 42% | 126 | 0,98 | 0,93 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,35 | 35% | 105 | 0,97 | 0,92 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,29 | 29% | 88 | 0,92 | 0,87 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,44 | 43% | 129 | 0,91 | 0,87 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,14 | 14% | 43 | 0,85 | 0,81 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,37 | 37% | 112 | 0,82 | 0,77 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,36 | 36% | 105 | 0,75 | 0,71 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,24 | 24% | 74 | 0,74 | 0,70 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,33 | 32% | 96 | 0,70 | 0,66 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,32 | 31% | 93 | 0,66 | 0,63 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,30 | 30% | 92 | 0,53 | 0,50 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Donato | 🛡️ | Scala da 3 | 0,25 | 25% | 75 | 1,60 | 1,30 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,28 | 28% | 83 | 1,59 | 1,29 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,36 | 36% | 107 | 1,58 | 1,28 |
| Alessia | ✨ | 3 carte pari | 0,30 | 30% | 90 | 1,57 | 1,28 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,28 | 28% | 85 | 1,55 | 1,26 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,30 | 29% | 88 | 1,50 | 1,22 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,32 | 32% | 96 | 1,50 | 1,22 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,40 | 40% | 119 | 1,49 | 1,21 |
| Roberta 2 | 🛡️ | Tris | 0,13 | 13% | 37 | 1,46 | 1,19 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,37 | 37% | 109 | 1,46 | 1,19 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,28 | 28% | 83 | 1,38 | 1,12 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,26 | 26% | 78 | 1,33 | 1,08 |
| Marika 2 | 🛡️ | Scala da 3 | 0,25 | 25% | 73 | 1,30 | 1,06 |
| Greta | ⚔️ | 3 carte dispari | 0,36 | 36% | 108 | 1,29 | 1,05 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,37 | 36% | 110 | 1,27 | 1,03 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,26 | 26% | 78 | 1,24 | 1,01 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,21 | 21% | 64 | 1,20 | 0,98 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,36 | 36% | 109 | 1,20 | 0,98 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,30 | 29% | 86 | 1,20 | 0,98 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,31 | 31% | 93 | 1,20 | 0,97 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,33 | 33% | 100 | 1,19 | 0,97 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,29 | 29% | 87 | 1,18 | 0,96 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,37 | 36% | 108 | 1,17 | 0,95 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,36 | 36% | 107 | 1,16 | 0,94 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,34 | 34% | 102 | 1,12 | 0,91 |
| Nonno Salvatore 2 | ✨ | Tris | 0,19 | 19% | 57 | 1,04 | 0,85 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,27 | 27% | 81 | 1,04 | 0,84 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,21 | 20% | 61 | 1,04 | 0,84 |
| Checca 2 | ✨ | 123 | 0,12 | 12% | 36 | 1,01 | 0,82 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,29 | 28% | 85 | 0,85 | 0,69 |
| Donatina 2 | ✨ | Scala da 3 | 0,28 | 28% | 84 | 0,80 | 0,65 |
| Don Pasquale | 🛡️ | Tris | 0,19 | 19% | 56 | 0,79 | 0,64 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,29 | 29% | 85 | 0,78 | 0,64 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,35 | 35% | 104 | 0,75 | 0,61 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chicca 3 | 🛡️ | Doppia coppia | 0,22 | 22% | 65 | 1,96 | 1,34 |
| Donatina 3 | ⚔️ | 1234 | 0,12 | 12% | 36 | 1,89 | 1,30 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,24 | 24% | 70 | 1,79 | 1,22 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,22 | 22% | 67 | 1,77 | 1,22 |
| Roberta 3 | ⚔️ | Poker | 0,09 | 8% | 25 | 1,76 | 1,21 (pochi dati) |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,29 | 29% | 88 | 1,68 | 1,15 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,18 | 18% | 54 | 1,68 | 1,15 |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,17 | 17% | 52 | 1,65 | 1,13 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,22 | 21% | 62 | 1,62 | 1,11 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,32 | 32% | 96 | 1,61 | 1,10 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,21 | 21% | 64 | 1,60 | 1,10 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,28 | 28% | 83 | 1,60 | 1,10 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,28 | 28% | 83 | 1,58 | 1,08 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,16 | 16% | 47 | 1,54 | 1,06 |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,15 | 15% | 47 | 1,53 | 1,05 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,23 | 23% | 68 | 1,52 | 1,04 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,07 | 7% | 23 | 1,42 | 0,97 (pochi dati) |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,22 | 22% | 65 | 1,21 | 0,83 |
| Totò 3 | ✨ | 4 carte pari | 0,23 | 23% | 70 | 1,15 | 0,79 |
| Annalisa 3 | ✨ | Scala da 5 | 0,11 | 10% | 31 | 1,13 | 0,77 |
| Checca 3 | 🛡️ | 4 carte con somma 24 | 0,19 | 19% | 58 | 1,12 | 0,77 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,13 | 13% | 38 | 1,10 | 0,75 |
| Nonno Salvatore 3 | ✨ | Poker | 0,07 | 7% | 21 | 1,06 | 0,73 (pochi dati) |
| Marika 3 | ✨ | Scala da 5 | 0,13 | 13% | 39 | 0,98 | 0,67 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,12 | 12% | 36 | 0,95 | 0,65 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,11 | 11% | 34 | 0,88 | 0,61 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Lezione di padel | 🔵 | 3,92 |
| Mercatino | 🔵 | 3,81 |
| Ricetta | ✨ | 3,71 |
| Scaffale | ✨ | 3,16 |
| Te l'ho già detto? | ✨ | 3,14 |
| Burla | ⚔️ | 3,01 |
| Cambiamo un po'… | ✨ | 3,00 |
| Si incanta | ⚔️ | 2,92 |
| Domani lo faccio | ✨ | 2,67 |
| Un filo di trucco | ✨ | 2,55 |
| Ogni cosa al suo posto | ✨ | 2,47 |
| Lingua Glabra | ⚔️ | 2,42 |
| Studia il fascicolo | 🔵 | 2,31 |
| Mo faccio due cotolette | ✨ | 2,08 |
| Frutta e verdura! | ✨ | 1,97 |
| Pranzo a domicilio | ✨ | 1,86 |
| Ti chiamo un attimo… | ⚔️ | 1,86 |
| Ce l'ho io! | ✨ | 1,77 |
| Versa il vino | ⚔️ | 1,67 |
| Solo per vedere comm sape | ⚔️ | 1,66 |
| Straordinario | ✨ | 1,59 |
| Ho tanta fame | ⚔️ | 1,55 |
| Bisiniss | ⚔️ | 1,54 |
| Una sigaretta fuori al bar | ⚔️ | 1,53 |
| Una rospa? | ⚔️ | 1,51 |
| Mangia mangia mangia | ✨ | 1,50 |
| Parla parla parla | ⚔️ | 1,49 |
| Multa | ⚔️ | 1,42 |
| Zeppata sui social | ⚔️ | 1,40 |
| Alta idratazione | ⚔️ | 1,39 |
| Smash | ⚔️ | 1,37 |
| Fatto in casa | ✨ | 1,36 |
| Risata contagiosa | ⚔️ | 1,30 |
| Brace accesa | ✨ | 1,09 |
| Grigliata | ✨ | 1,06 |
| Nuvola di fumo | 🛡️ | 0,95 |
| Colazione | ✨ | 0,91 |
| L'ho già detto | ✨ | 0,91 |
| Baratto | ⚔️ | 0,89 |
| Invasione di campo | ⚔️ | 0,86 |
| Si canta! | ⚔️ | 0,82 |
| Offre la casa | ✨ | 0,81 |
| Benedizione | 🛡️ | 0,76 |
| Rospe per tutti | ⚔️ | 0,75 |
| Tritacarne | ⚔️ | 0,74 |
| Vertenza | ⚔️ | 0,67 |
| Non sbaglio mai | 🔵 | 0,65 |
| La vetrina della collezione | ✨ | 0,49 |
| Vento | ⚔️ | 0,45 |
| La tomacella | ⚔️ | 0,40 |
| Brontola tutto il giorno | ⚔️ | 0,40 |
| Chissà se sta roba basta | ✨ | 0,39 |
| È insipido | ⚔️ | 0,37 |
| Anima della festa | ✨ | 0,35 |
| Giro aperto | ⚔️ | 0,35 |
| Gli occhi 'nguoll | ⚔️ | 0,34 |
| Volo infuocato | ⚔️ | 0,33 |
| Puzza di brace | 🔵 | 0,31 |
| Doppio turno | ✨ | 0,28 |
| Patate al forno | ✨ | 0,26 |
| Sparecchio | ⚔️ | 0,24 |
| Il mio corpo che cambia | ✨ | 0,21 |
| Urla | ⚔️ | 0,19 |
| Il bastone | ⚔️ | 0,13 |
| Medico in famiglia | 🔵 | 0,13 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,12 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 903 | 593 | 358 | 38% |
| Si incanta | 876 | 590 | 342 | 37% |
| Lingua Glabra | 725 | 479 | 275 | 36% |
| Ti chiamo un attimo… | 557 | 346 | 236 | 41% |
| Versa il vino | 500 | 371 | 184 | 33% |
| Solo per vedere comm sape | 499 | 388 | 141 | 27% |
| Ho tanta fame | 466 | 309 | 174 | 36% |
| Bisiniss | 461 | 365 | 143 | 28% |
| Una sigaretta fuori al bar | 459 | 363 | 129 | 26% |
| Una rospa? | 453 | 342 | 145 | 30% |
| Parla parla parla | 447 | 308 | 174 | 36% |
| Multa | 425 | 369 | 147 | 28% |
| Zeppata sui social | 421 | 983 | 158 | 14% |
| Alta idratazione | 417 | 339 | 102 | 23% |
| Smash | 410 | 268 | 187 | 41% |
| Risata contagiosa | 389 | 789 | 242 | 23% |
| Baratto | 267 | 255 | 21 | 8% |
| Invasione di campo | 258 | 465 | 20 | 4% |
| Si canta! | 246 | 496 | 238 | 32% |
| Rospe per tutti | 224 | 521 | 34 | 6% |
| Tritacarne | 223 | 211 | 14 | 6% |
| Vertenza | 201 | 188 | 20 | 10% |
| Vento | 135 | 90 | 50 | 36% |
| La tomacella | 120 | 85 | 45 | 35% |
| Brontola tutto il giorno | 120 | 114 | 8 | 7% |
| È insipido | 112 | 284 | 14 | 5% |
| Giro aperto | 104 | 80 | 31 | 28% |
| Gli occhi 'nguoll | 101 | 77 | 31 | 29% |
| Volo infuocato | 100 | 236 | 20 | 8% |
| Sparecchio | 71 | 67 | 6 | 8% |
| Urla | 58 | 154 | 10 | 6% |
| Il bastone | 40 | 38 | 4 | 10% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 211 | 0 |
| Ricorso | 199 | 0 |
| Non è colpa mia | 195 | 0 |
| Ho appena lavato a terra | 176 | 0 |
| Scudo da gladiatore | 171 | 0 |
| Cella frigorifera | 159 | 0 |
| Sono andato a Lioni a fa' a spesa | 158 | 0 |
| Campari | 150 | 0 |
| Nevicava, non è potuto venire | 146 | 0 |
| Mutandoni di lana | 145 | 0 |
| Sono a un matrimonio | 141 | 0 |
| Si arrabbia | 140 | 0 |
| Una fetta di torta? | 138 | 0 |
| Paesano | 137 | 0 |
| Non c'è, ha il turno | 124 | 0 |
| Per me è quadrato | 124 | 0 |
| È colpa di qualcun altro | 123 | 0 |
| Non ti sento, sto suonando | 123 | 0 |
| Sempre calma | 122 | 0 |
| Aglianico | 121 | 0 |
| Tiro su un muro | 121 | 0 |
| E se poi te ne penti? | 119 | 0 |
| Drago Tascabile | 93 | 0 |
| Tofu Super Seitan | 92 | 0 |
| La cionna | 81 | 0 |
| Chiusa in camera | 67 | 0 |
| Nuvola di fumo | 61 | 0 |
| Forse c'è, forse no | 38 | 53 |
| Taurasi | 28 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,03 |
| La Resurrezione | 2,00 |
| Carnevale di Teora | 2,06 |
| Funerale | 2,05 |
| Matrimonio | 2,00 |
| Sagra delle tomacelle | 2,04 |

Tempo di calcolo: 89.4 secondi.
