# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **300** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **300** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 13
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 75 | 52,8 | 26,4 | 36–94 | 27,0 | 21,7 | 53% · 47% |
| 3 | 75 | 71,8 | 23,9 | 51–102 | 27,5 | 20,2 | 40% · 28% · 32% |
| 4 | 75 | 87,1 | 21,8 | 60–124 | 27,2 | 18,4 | 23% · 26% · 27% · 24% |
| 5 | 75 | 110,4 | 22,1 | 75–145 | 27,4 | 18,5 | 17% · 23% · 22% · 24% · 15% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Roberta 2 (1,35), Totò 1 (1,35), Gerardina 3 (1,34), Sara e Giuseppe 2 (1,34), Nonno Nicola 1 (1,30), Claudia 2 (1,30), Maddalena 3 (1,28), Chicca 3 (1,28), Squacqualacchione 1 (1,27), Greta (1,27), Nonno Antonio 2 (1,26), Alessia (1,24), Donato (1,24), Claudia 3 (1,24), Nonno Nicola 2 (1,23), Nonno Rafiluccio 1 (1,22), Francesco 3 (1,21)
- Carte che sembrano **più deboli** (≤ 0,8): Maddalena 2 (0,57), Nonna Maddalena 3 (0,57), Squacqualacchione 2 (0,61), Nonna Dina 3 (0,63), Chicca 2 (0,63), Nonna Maria 1 (0,63), Donatina 2 (0,63), Nonna Dina 2 (0,64), Don Pasquale (0,68), Nonna Maddalena 1 (0,70), Dottor Racioppi (0,72), Totò 3 (0,73), Totò 2 (0,75), Zio Salvatore 3 (0,75), Annalisa 3 (0,77), Vincenzo (0,79), Checca 2 (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (7%), Nonno Salvatore 3 (8%), Marika 3 (9%), Roberta 3 (9%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,40 | 39% | 118 | 1,45 | 1,35 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,42 | 41% | 124 | 1,40 | 1,30 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,42 | 41% | 122 | 1,37 | 1,27 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,38 | 38% | 113 | 1,31 | 1,22 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,33 | 32% | 97 | 1,29 | 1,20 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,23 | 23% | 71 | 1,24 | 1,15 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,32 | 31% | 94 | 1,22 | 1,13 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,24 | 24% | 71 | 1,21 | 1,13 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,37 | 36% | 109 | 1,19 | 1,11 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,35 | 35% | 103 | 1,16 | 1,07 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,37 | 35% | 105 | 1,15 | 1,07 |
| Marika 1 | 🛡️ | Coppia | 0,32 | 31% | 94 | 1,13 | 1,05 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,33 | 33% | 101 | 1,11 | 1,04 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,13 | 13% | 41 | 1,09 | 1,02 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,36 | 36% | 109 | 1,08 | 1,00 |
| Christian | ⚔️ | Coppia | 0,42 | 42% | 126 | 1,06 | 0,99 |
| Gerardina 1 | 🛡️ | Coppia | 0,37 | 37% | 111 | 1,05 | 0,98 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,39 | 39% | 115 | 1,05 | 0,97 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,31 | 31% | 93 | 1,03 | 0,96 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,26 | 26% | 79 | 0,99 | 0,92 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,24 | 24% | 72 | 0,97 | 0,91 |
| Nonna Patrizia 1 | ✨ | 2 carte con somma 10 | 0,34 | 34% | 99 | 0,93 | 0,87 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,23 | 23% | 71 | 0,91 | 0,85 |
| Maddalena 1 | ✨ | 2 carte pari | 0,37 | 37% | 111 | 0,87 | 0,81 |
| Nonno Antonio 1 | 🔵 | 12 | 0,20 | 20% | 59 | 0,87 | 0,81 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,35 | 34% | 100 | 0,85 | 0,79 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,44 | 43% | 129 | 0,78 | 0,72 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,37 | 37% | 112 | 0,75 | 0,70 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,28 | 28% | 85 | 0,67 | 0,63 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Roberta 2 | 🛡️ | Tris | 0,14 | 14% | 42 | 1,74 | 1,35 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,28 | 27% | 79 | 1,73 | 1,34 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,35 | 35% | 102 | 1,67 | 1,30 |
| Greta | ⚔️ | 3 carte dispari | 0,33 | 32% | 97 | 1,64 | 1,27 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,29 | 29% | 87 | 1,62 | 1,26 |
| Alessia | ✨ | 3 carte pari | 0,30 | 30% | 89 | 1,61 | 1,24 |
| Donato | 🛡️ | Scala da 3 | 0,23 | 23% | 69 | 1,60 | 1,24 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,38 | 38% | 112 | 1,58 | 1,23 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,24 | 24% | 70 | 1,49 | 1,15 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,36 | 36% | 109 | 1,47 | 1,14 |
| Marika 2 | 🛡️ | Scala da 3 | 0,24 | 24% | 71 | 1,47 | 1,14 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,33 | 33% | 97 | 1,46 | 1,13 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,32 | 31% | 94 | 1,42 | 1,10 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,30 | 30% | 90 | 1,42 | 1,10 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,36 | 35% | 105 | 1,41 | 1,09 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,31 | 31% | 92 | 1,40 | 1,09 |
| Nonno Salvatore 2 | ✨ | Tris | 0,19 | 19% | 57 | 1,35 | 1,05 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,32 | 32% | 93 | 1,33 | 1,03 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,27 | 27% | 81 | 1,31 | 1,02 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,26 | 26% | 79 | 1,31 | 1,01 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,35 | 34% | 103 | 1,27 | 0,98 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,37 | 37% | 110 | 1,21 | 0,94 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,30 | 30% | 89 | 1,20 | 0,93 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,35 | 35% | 104 | 1,14 | 0,88 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,30 | 30% | 89 | 1,11 | 0,86 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,29 | 28% | 85 | 1,07 | 0,83 |
| Checca 2 | ✨ | 123 | 0,13 | 13% | 40 | 1,03 | 0,80 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,28 | 28% | 83 | 0,96 | 0,75 |
| Don Pasquale | 🛡️ | Tris | 0,16 | 16% | 50 | 0,88 | 0,68 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,33 | 33% | 99 | 0,82 | 0,64 |
| Donatina 2 | ✨ | Scala da 3 | 0,29 | 28% | 84 | 0,81 | 0,63 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,20 | 20% | 61 | 0,81 | 0,63 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,28 | 28% | 83 | 0,79 | 0,61 |
| Maddalena 2 | ✨ | 3 carte dispari | 0,30 | 30% | 89 | 0,73 | 0,57 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,27 | 27% | 82 | 1,99 | 1,34 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,22 | 22% | 64 | 1,91 | 1,28 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 73 | 1,90 | 1,28 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 71 | 1,84 | 1,24 |
| Roberta 3 | ⚔️ | Poker | 0,09 | 9% | 27 | 1,82 | 1,23 (pochi dati) |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,24 | 24% | 74 | 1,80 | 1,21 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,20 | 20% | 60 | 1,71 | 1,15 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,15 | 15% | 45 | 1,66 | 1,12 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,21 | 21% | 63 | 1,63 | 1,10 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,07 | 7% | 24 | 1,61 | 1,08 (pochi dati) |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,24 | 24% | 72 | 1,61 | 1,08 |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,15 | 15% | 45 | 1,57 | 1,05 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,32 | 32% | 96 | 1,53 | 1,03 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,30 | 30% | 91 | 1,52 | 1,02 |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,15 | 15% | 45 | 1,49 | 1,00 |
| Donatina 3 | ⚔️ | 1234 | 0,12 | 12% | 39 | 1,47 | 0,99 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,26 | 26% | 77 | 1,34 | 0,90 |
| Checca 3 | 🛡️ | 4 carte con somma 24 | 0,17 | 17% | 52 | 1,34 | 0,90 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,22 | 21% | 64 | 1,24 | 0,84 |
| Annalisa 3 | ✨ | Scala da 5 | 0,10 | 10% | 30 | 1,15 | 0,77 |
| Nonno Salvatore 3 | ✨ | Poker | 0,08 | 8% | 25 | 1,12 | 0,75 (pochi dati) |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,11 | 11% | 35 | 1,11 | 0,75 |
| Totò 3 | ✨ | 4 carte pari | 0,23 | 23% | 68 | 1,08 | 0,73 |
| Marika 3 | ✨ | Scala da 5 | 0,09 | 9% | 27 | 0,96 | 0,65 (pochi dati) |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 14% | 42 | 0,93 | 0,63 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,11 | 11% | 36 | 0,85 | 0,57 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 3,95 |
| Lezione di padel | 🔵 | 3,29 |
| Cambiamo un po'… | ✨ | 3,13 |
| Te l'ho già detto? | ✨ | 3,13 |
| Burla | ⚔️ | 3,06 |
| Si incanta | ⚔️ | 3,01 |
| Scaffale | ✨ | 2,97 |
| Domani lo faccio | ✨ | 2,61 |
| Lingua Glabra | ⚔️ | 2,44 |
| Ogni cosa al suo posto | ✨ | 2,43 |
| Un filo di trucco | ✨ | 2,32 |
| Frutta e verdura! | ✨ | 2,19 |
| Studia il fascicolo | 🔵 | 2,17 |
| La vita è una ruota | ✨ | 2,07 |
| Mo faccio due cotolette | ✨ | 1,89 |
| Ti chiamo un attimo… | ⚔️ | 1,86 |
| Pranzo a domicilio | ✨ | 1,78 |
| Straordinario | ✨ | 1,77 |
| Versa il vino | ⚔️ | 1,71 |
| Solo per vedere comm sape | ⚔️ | 1,68 |
| Ce l'ho io! | ✨ | 1,66 |
| Una sigaretta fuori al bar | ⚔️ | 1,65 |
| Bisiniss | ⚔️ | 1,65 |
| Ho tanta fame | ⚔️ | 1,62 |
| Parla parla parla | ⚔️ | 1,49 |
| Una rospa? | ⚔️ | 1,48 |
| Mangia mangia mangia | ✨ | 1,46 |
| Risata contagiosa | ⚔️ | 1,42 |
| Multa | ⚔️ | 1,38 |
| Total black | ✨ | 1,32 |
| Smash | ⚔️ | 1,31 |
| Zeppata sui social | ⚔️ | 1,30 |
| Alta idratazione | ⚔️ | 1,24 |
| Fatto in casa | ✨ | 1,18 |
| Brace accesa | ✨ | 1,07 |
| Grigliata | ✨ | 1,04 |
| Nuvola di fumo | 🛡️ | 1,00 |
| Colazione | ✨ | 0,95 |
| Si canta! | ⚔️ | 0,91 |
| L'ho già detto | ✨ | 0,91 |
| Baratto | ⚔️ | 0,90 |
| Invasione di campo | ⚔️ | 0,89 |
| Offre la casa | ✨ | 0,80 |
| Tritacarne | ⚔️ | 0,74 |
| Rospe per tutti | ⚔️ | 0,66 |
| Benedizione | 🛡️ | 0,66 |
| Vertenza | ⚔️ | 0,64 |
| La vetrina della collezione | ✨ | 0,56 |
| È insipido | ⚔️ | 0,44 |
| Chissà se sta roba basta | ✨ | 0,39 |
| Vento | ⚔️ | 0,39 |
| La tomacella | ⚔️ | 0,36 |
| Volo infuocato | ⚔️ | 0,35 |
| Giro aperto | ⚔️ | 0,34 |
| Brontola tutto il giorno | ⚔️ | 0,33 |
| Anima della festa | ✨ | 0,31 |
| Gli occhi 'nguoll | ⚔️ | 0,29 |
| Il mio corpo che cambia | ✨ | 0,24 |
| Sparecchio | ⚔️ | 0,23 |
| Doppio turno | ✨ | 0,22 |
| Patate al forno | ✨ | 0,22 |
| Puzza di brace | 🔵 | 0,22 |
| Urla | ⚔️ | 0,18 |
| Medico in famiglia | 🔵 | 0,16 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,11 |
| Il bastone | ⚔️ | 0,11 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 917 | 602 | 337 | 36% |
| Si incanta | 903 | 583 | 348 | 37% |
| Lingua Glabra | 732 | 469 | 281 | 37% |
| Ti chiamo un attimo… | 559 | 350 | 231 | 40% |
| Versa il vino | 514 | 369 | 176 | 32% |
| Solo per vedere comm sape | 505 | 398 | 130 | 25% |
| Una sigaretta fuori al bar | 495 | 383 | 137 | 26% |
| Bisiniss | 494 | 382 | 145 | 28% |
| Ho tanta fame | 486 | 302 | 198 | 40% |
| Parla parla parla | 446 | 330 | 133 | 29% |
| Una rospa? | 445 | 335 | 123 | 27% |
| Risata contagiosa | 425 | 859 | 299 | 26% |
| Multa | 413 | 352 | 139 | 28% |
| Smash | 392 | 263 | 149 | 36% |
| Zeppata sui social | 391 | 903 | 159 | 15% |
| Alta idratazione | 372 | 314 | 74 | 19% |
| Si canta! | 272 | 575 | 233 | 29% |
| Baratto | 269 | 254 | 25 | 9% |
| Invasione di campo | 268 | 478 | 26 | 5% |
| Tritacarne | 223 | 209 | 19 | 8% |
| Rospe per tutti | 199 | 473 | 33 | 7% |
| Vertenza | 193 | 180 | 16 | 8% |
| È insipido | 131 | 331 | 13 | 4% |
| Vento | 117 | 77 | 43 | 36% |
| La tomacella | 108 | 73 | 42 | 37% |
| Volo infuocato | 104 | 264 | 16 | 6% |
| Giro aperto | 102 | 76 | 31 | 29% |
| Brontola tutto il giorno | 100 | 96 | 6 | 6% |
| Gli occhi 'nguoll | 88 | 64 | 29 | 31% |
| Sparecchio | 70 | 63 | 9 | 13% |
| Urla | 53 | 143 | 6 | 4% |
| Il bastone | 33 | 27 | 8 | 23% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 219 | 0 |
| Ricorso | 191 | 0 |
| Ho appena lavato a terra | 175 | 0 |
| Mutandoni di lana | 173 | 0 |
| Sono andato a Lioni a fa' a spesa | 169 | 0 |
| Campari | 164 | 0 |
| Scudo da gladiatore | 161 | 0 |
| Paesano | 152 | 0 |
| Nevicava, non è potuto venire | 151 | 0 |
| Si arrabbia | 149 | 0 |
| Cella frigorifera | 144 | 0 |
| Sono a un matrimonio | 132 | 0 |
| Una fetta di torta? | 131 | 0 |
| Sempre calma | 131 | 0 |
| Non ti sento, sto suonando | 129 | 0 |
| Tiro su un muro | 127 | 0 |
| Per me è quadrato | 127 | 0 |
| Non c'è, ha il turno | 124 | 0 |
| Aglianico | 124 | 0 |
| E se poi te ne penti? | 123 | 0 |
| Non è colpa mia | 119 | 0 |
| Drago Tascabile | 97 | 0 |
| Chiusa in camera | 96 | 0 |
| Tofu Super Seitan | 87 | 0 |
| La cionna | 84 | 0 |
| Nuvola di fumo | 65 | 0 |
| Forse c'è, forse no | 41 | 58 |
| Taurasi | 29 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,13 |
| La Resurrezione | 2,10 |
| Carnevale di Teora | 2,15 |
| Funerale | 2,11 |
| Matrimonio | 2,08 |
| Sagra delle tomacelle | 2,12 |

Tempo di calcolo: 47.5 secondi.
