# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **300** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **300** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 6
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 75 | 53,0 | 26,5 | 36–102 | 27,1 | 21,8 | 51% · 49% |
| 3 | 75 | 71,9 | 24,0 | 51–105 | 27,3 | 20,4 | 36% · 35% · 29% |
| 4 | 75 | 87,5 | 21,9 | 64–124 | 27,5 | 18,5 | 27% · 25% · 25% · 24% |
| 5 | 75 | 108,8 | 21,8 | 75–150 | 27,4 | 18,3 | 22% · 27% · 19% · 17% · 15% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Squacqualacchione 1 (1,42), Totò 1 (1,38), Roberta 2 (1,38), Sara e Giuseppe 2 (1,36), Chicca 3 (1,35), Nonno Antonio 2 (1,33), Antonio 3 (1,30), Nonno Nicola 1 (1,29), Donato (1,29), Annalisa 1 (1,28), Claudia 2 (1,25), Maddalena 3 (1,24), Sara e Giuseppe 3 (1,23), Gerardina 3 (1,22), Zio Salvatore 1 (1,21), Squacqualacchione 3 (1,21), Alessia (1,20), Antonio 1 (1,20)
- Carte che sembrano **più deboli** (≤ 0,8): Nonna Maddalena 3 (0,43), Nonna Dina 3 (0,58), Zio Salvatore 3 (0,61), Donatina 2 (0,66), Nonna Maria 1 (0,66), Squacqualacchione 2 (0,67), Marika 3 (0,67), Totò 2 (0,67), Vincenzo (0,68), Maddalena 1 (0,69), Dottor Racioppi (0,69), Nonna Dina 2 (0,69), Annalisa 2 (0,69), Chicca 2 (0,70), Generoso 3 (0,74), Don Pasquale (0,74), Sara e Giuseppe 1 (0,75), Checca 2 (0,75), Nonna Maddalena 1 (0,78)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (7%), Nonno Salvatore 3 (8%), Roberta 3 (8%), Annalisa 3 (10%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,42 | 41% | 123 | 1,46 | 1,42 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,42 | 40% | 121 | 1,42 | 1,38 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,44 | 43% | 128 | 1,33 | 1,29 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,38 | 37% | 109 | 1,32 | 1,28 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,21 | 21% | 65 | 1,25 | 1,21 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,38 | 37% | 108 | 1,24 | 1,20 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,33 | 33% | 99 | 1,23 | 1,20 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,38 | 38% | 112 | 1,19 | 1,16 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,35 | 34% | 103 | 1,11 | 1,07 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,26 | 26% | 79 | 1,09 | 1,06 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,33 | 33% | 99 | 1,08 | 1,05 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,24 | 24% | 71 | 1,08 | 1,05 |
| Marika 1 | 🛡️ | Coppia | 0,32 | 32% | 95 | 1,07 | 1,04 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,27 | 27% | 80 | 1,06 | 1,03 |
| Christian | ⚔️ | Coppia | 0,40 | 40% | 120 | 1,04 | 1,01 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,34 | 34% | 101 | 1,04 | 1,01 |
| Nonno Antonio 1 | 🔵 | 12 | 0,19 | 19% | 57 | 1,01 | 0,98 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,41 | 41% | 122 | 0,98 | 0,96 |
| Gerardina 1 | 🛡️ | Coppia | 0,39 | 38% | 112 | 0,96 | 0,93 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,32 | 32% | 94 | 0,93 | 0,90 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,34 | 34% | 100 | 0,89 | 0,87 |
| Nonna Patrizia 1 | ✨ | 2 carte con somma 10 | 0,34 | 33% | 99 | 0,87 | 0,85 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,14 | 14% | 43 | 0,84 | 0,81 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,37 | 36% | 110 | 0,80 | 0,78 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,24 | 24% | 73 | 0,78 | 0,75 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,41 | 41% | 123 | 0,71 | 0,69 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,36 | 36% | 107 | 0,71 | 0,69 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,31 | 31% | 91 | 0,70 | 0,68 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,29 | 29% | 88 | 0,68 | 0,66 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Roberta 2 | 🛡️ | Tris | 0,15 | 15% | 43 | 1,71 | 1,38 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,30 | 29% | 85 | 1,69 | 1,36 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,27 | 27% | 81 | 1,65 | 1,33 |
| Donato | 🛡️ | Scala da 3 | 0,23 | 23% | 72 | 1,60 | 1,29 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,38 | 38% | 115 | 1,56 | 1,25 |
| Alessia | ✨ | 3 carte pari | 0,31 | 31% | 93 | 1,50 | 1,20 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,29 | 29% | 87 | 1,44 | 1,16 |
| Marika 2 | 🛡️ | Scala da 3 | 0,27 | 27% | 78 | 1,43 | 1,15 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,29 | 28% | 85 | 1,43 | 1,15 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,34 | 33% | 101 | 1,39 | 1,12 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,33 | 33% | 99 | 1,38 | 1,11 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,27 | 27% | 79 | 1,36 | 1,09 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,33 | 33% | 97 | 1,35 | 1,09 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,36 | 36% | 109 | 1,32 | 1,06 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,36 | 36% | 106 | 1,31 | 1,06 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,32 | 31% | 94 | 1,29 | 1,04 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,28 | 28% | 81 | 1,27 | 1,02 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,32 | 32% | 95 | 1,27 | 1,02 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,26 | 26% | 78 | 1,24 | 1,00 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,30 | 30% | 89 | 1,22 | 0,98 |
| Greta | ⚔️ | 3 carte dispari | 0,34 | 33% | 100 | 1,20 | 0,97 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,31 | 31% | 92 | 1,20 | 0,96 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,34 | 33% | 98 | 1,17 | 0,94 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,26 | 25% | 77 | 1,17 | 0,94 |
| Nonno Salvatore 2 | ✨ | Tris | 0,19 | 19% | 57 | 1,15 | 0,93 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,35 | 34% | 103 | 1,02 | 0,82 |
| Checca 2 | ✨ | 123 | 0,14 | 14% | 45 | 0,94 | 0,75 |
| Don Pasquale | 🛡️ | Tris | 0,18 | 18% | 54 | 0,92 | 0,74 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,20 | 20% | 61 | 0,87 | 0,70 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,29 | 29% | 86 | 0,86 | 0,69 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,36 | 36% | 109 | 0,86 | 0,69 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,27 | 27% | 82 | 0,84 | 0,67 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,29 | 28% | 85 | 0,83 | 0,67 |
| Donatina 2 | ✨ | Scala da 3 | 0,28 | 28% | 85 | 0,82 | 0,66 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chicca 3 | 🛡️ | Doppia coppia | 0,23 | 23% | 70 | 1,93 | 1,35 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,22 | 22% | 66 | 1,85 | 1,30 |
| Roberta 3 | ⚔️ | Poker | 0,08 | 8% | 23 | 1,77 | 1,24 (pochi dati) |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,24 | 23% | 67 | 1,77 | 1,24 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,23 | 23% | 69 | 1,76 | 1,23 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,28 | 28% | 86 | 1,74 | 1,22 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,15 | 15% | 45 | 1,72 | 1,21 |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,19 | 19% | 58 | 1,65 | 1,16 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,33 | 32% | 98 | 1,63 | 1,14 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,29 | 29% | 87 | 1,61 | 1,13 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,23 | 23% | 69 | 1,60 | 1,12 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,23 | 23% | 71 | 1,56 | 1,09 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,20 | 20% | 60 | 1,55 | 1,08 |
| Donatina 3 | ⚔️ | 1234 | 0,11 | 11% | 34 | 1,52 | 1,06 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,28 | 27% | 81 | 1,46 | 1,02 |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,15 | 15% | 46 | 1,33 | 0,93 |
| Totò 3 | ✨ | 4 carte pari | 0,23 | 23% | 68 | 1,30 | 0,91 |
| Nonno Salvatore 3 | ✨ | Poker | 0,08 | 8% | 24 | 1,18 | 0,83 (pochi dati) |
| Checca 3 | 🛡️ | 4 carte con somma 24 | 0,18 | 18% | 55 | 1,16 | 0,81 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,07 | 7% | 22 | 1,15 | 0,80 (pochi dati) |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,24 | 23% | 70 | 1,06 | 0,74 |
| Marika 3 | ✨ | Scala da 5 | 0,12 | 12% | 36 | 0,96 | 0,67 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,10 | 10% | 32 | 0,87 | 0,61 |
| Annalisa 3 | ✨ | Scala da 5 | 0,10 | 10% | 29 | 0,85 | 0,59 (pochi dati) |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,11 | 11% | 34 | 0,83 | 0,58 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,11 | 11% | 34 | 0,62 | 0,43 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 3,70 |
| Lezione di padel | 🔵 | 3,62 |
| Scaffale | ✨ | 3,23 |
| Si incanta | ⚔️ | 3,08 |
| Te l'ho già detto? | ✨ | 3,00 |
| Burla | ⚔️ | 2,93 |
| Cambiamo un po'… | ✨ | 2,88 |
| Domani lo faccio | ✨ | 2,61 |
| Un filo di trucco | ✨ | 2,54 |
| Ogni cosa al suo posto | ✨ | 2,47 |
| Lingua Glabra | ⚔️ | 2,32 |
| Studia il fascicolo | 🔵 | 2,14 |
| Mo faccio due cotolette | ✨ | 2,11 |
| La vita è una ruota | ✨ | 2,02 |
| Frutta e verdura! | ✨ | 1,96 |
| Ti chiamo un attimo… | ⚔️ | 1,83 |
| Pranzo a domicilio | ✨ | 1,83 |
| Straordinario | ✨ | 1,67 |
| Ce l'ho io! | ✨ | 1,65 |
| Versa il vino | ⚔️ | 1,61 |
| Solo per vedere comm sape | ⚔️ | 1,60 |
| Una sigaretta fuori al bar | ⚔️ | 1,57 |
| Ho tanta fame | ⚔️ | 1,53 |
| Mangia mangia mangia | ✨ | 1,52 |
| Bisiniss | ⚔️ | 1,52 |
| Parla parla parla | ⚔️ | 1,50 |
| Una rospa? | ⚔️ | 1,43 |
| Zeppata sui social | ⚔️ | 1,41 |
| Multa | ⚔️ | 1,36 |
| Fatto in casa | ✨ | 1,36 |
| Alta idratazione | ⚔️ | 1,27 |
| Smash | ⚔️ | 1,25 |
| Risata contagiosa | ⚔️ | 1,25 |
| Nuvola di fumo | 🛡️ | 1,10 |
| Grigliata | ✨ | 1,07 |
| Brace accesa | ✨ | 1,02 |
| Colazione | ✨ | 0,95 |
| Invasione di campo | ⚔️ | 0,91 |
| L'ho già detto | ✨ | 0,90 |
| Baratto | ⚔️ | 0,88 |
| Offre la casa | ✨ | 0,85 |
| Si canta! | ⚔️ | 0,82 |
| Benedizione | 🛡️ | 0,76 |
| Tritacarne | ⚔️ | 0,74 |
| Rospe per tutti | ⚔️ | 0,71 |
| Vertenza | ⚔️ | 0,64 |
| Non sbaglio mai | 🔵 | 0,61 |
| La vetrina della collezione | ✨ | 0,58 |
| È insipido | ⚔️ | 0,42 |
| Vento | ⚔️ | 0,40 |
| Brontola tutto il giorno | ⚔️ | 0,40 |
| La tomacella | ⚔️ | 0,38 |
| Giro aperto | ⚔️ | 0,34 |
| Chissà se sta roba basta | ✨ | 0,34 |
| Volo infuocato | ⚔️ | 0,32 |
| Gli occhi 'nguoll | ⚔️ | 0,31 |
| Doppio turno | ✨ | 0,30 |
| Anima della festa | ✨ | 0,29 |
| Puzza di brace | 🔵 | 0,28 |
| Sparecchio | ⚔️ | 0,24 |
| Patate al forno | ✨ | 0,23 |
| Il mio corpo che cambia | ✨ | 0,19 |
| Urla | ⚔️ | 0,15 |
| Medico in famiglia | 🔵 | 0,15 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,14 |
| Il bastone | ⚔️ | 0,11 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Si incanta | 924 | 603 | 373 | 38% |
| Burla | 878 | 561 | 357 | 39% |
| Lingua Glabra | 697 | 462 | 263 | 36% |
| Ti chiamo un attimo… | 550 | 337 | 244 | 42% |
| Versa il vino | 484 | 352 | 191 | 35% |
| Solo per vedere comm sape | 481 | 369 | 137 | 27% |
| Una sigaretta fuori al bar | 471 | 359 | 146 | 29% |
| Ho tanta fame | 459 | 292 | 183 | 39% |
| Bisiniss | 456 | 362 | 142 | 28% |
| Parla parla parla | 451 | 325 | 157 | 33% |
| Una rospa? | 429 | 324 | 140 | 30% |
| Zeppata sui social | 422 | 973 | 165 | 14% |
| Multa | 408 | 356 | 142 | 29% |
| Alta idratazione | 380 | 308 | 95 | 24% |
| Smash | 376 | 242 | 178 | 42% |
| Risata contagiosa | 375 | 743 | 262 | 26% |
| Invasione di campo | 273 | 487 | 28 | 5% |
| Baratto | 264 | 252 | 21 | 8% |
| Si canta! | 245 | 507 | 213 | 30% |
| Tritacarne | 223 | 210 | 16 | 7% |
| Rospe per tutti | 214 | 484 | 35 | 7% |
| Vertenza | 192 | 179 | 21 | 11% |
| È insipido | 125 | 322 | 13 | 4% |
| Vento | 121 | 82 | 43 | 34% |
| Brontola tutto il giorno | 119 | 113 | 8 | 7% |
| La tomacella | 113 | 76 | 45 | 37% |
| Giro aperto | 103 | 83 | 27 | 25% |
| Volo infuocato | 97 | 249 | 20 | 7% |
| Gli occhi 'nguoll | 94 | 71 | 30 | 30% |
| Sparecchio | 71 | 66 | 9 | 12% |
| Urla | 46 | 116 | 8 | 6% |
| Il bastone | 33 | 28 | 6 | 18% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 204 | 0 |
| Non è colpa mia | 196 | 0 |
| Ricorso | 180 | 0 |
| Ho appena lavato a terra | 174 | 0 |
| Scudo da gladiatore | 171 | 0 |
| Sono andato a Lioni a fa' a spesa | 160 | 0 |
| Mutandoni di lana | 160 | 0 |
| Campari | 156 | 0 |
| Cella frigorifera | 155 | 0 |
| Si arrabbia | 149 | 0 |
| Nevicava, non è potuto venire | 148 | 0 |
| Sono a un matrimonio | 139 | 0 |
| Paesano | 136 | 0 |
| Una fetta di torta? | 129 | 0 |
| Non c'è, ha il turno | 128 | 0 |
| E se poi te ne penti? | 128 | 0 |
| È colpa di qualcun altro | 127 | 0 |
| Aglianico | 121 | 0 |
| Per me è quadrato | 119 | 0 |
| Sempre calma | 119 | 0 |
| Tiro su un muro | 115 | 0 |
| Non ti sento, sto suonando | 112 | 0 |
| Drago Tascabile | 102 | 0 |
| La cionna | 86 | 0 |
| Chiusa in camera | 84 | 0 |
| Tofu Super Seitan | 83 | 0 |
| Nuvola di fumo | 68 | 0 |
| Forse c'è, forse no | 37 | 54 |
| Taurasi | 32 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,04 |
| La Resurrezione | 2,01 |
| Carnevale di Teora | 2,03 |
| Funerale | 2,04 |
| Matrimonio | 1,96 |
| Sagra delle tomacelle | 2,03 |

Tempo di calcolo: 40.2 secondi.
