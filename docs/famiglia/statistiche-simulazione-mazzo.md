# La Famiglia – statistiche della simulazione (fine quando finisce il mazzo)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 58
Finite perché il mazzo personaggi è finito (invece che per i punti): 1000

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 146,8 | 73,4 | 56–324 | 48,1 | 37,7 | 47% · 53% |
| 3 | 250 | 141,4 | 47,1 | 63–261 | 33,2 | 24,1 | 33% · 29% · 38% |
| 4 | 250 | 136,6 | 34,2 | 72–232 | 25,4 | 17,7 | 25% · 28% · 25% · 22% |
| 5 | 250 | 123,8 | 24,8 | 75–210 | 19,9 | 13,0 | 24% · 21% · 23% · 15% · 17% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Generoso 1 (1,41), Giuseppe 3 (1,36), Generoso 2 (1,25), Generoso 3 (1,23), Alessia (1,22), Nonno Nicola 1 (1,21)
- Carte che sembrano **più deboli** (≤ 0,8): Zio Salvatore 2 (0,76), Checca 1 (0,77)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): nessuna

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,26 | 25% | 254 | 1,89 | 1,41 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,60 | 57% | 560 | 1,62 | 1,21 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,40 | 38% | 373 | 1,55 | 1,15 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,60 | 56% | 561 | 1,48 | 1,11 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,51 | 48% | 473 | 1,48 | 1,10 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,61 | 57% | 564 | 1,43 | 1,07 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,55 | 52% | 504 | 1,42 | 1,06 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,53 | 51% | 509 | 1,40 | 1,04 |
| Christian | ✨ | Coppia | 0,59 | 55% | 544 | 1,39 | 1,04 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,57 | 53% | 533 | 1,39 | 1,04 |
| Marika 1 | 🛡️ | Coppia | 0,56 | 52% | 514 | 1,36 | 1,02 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,49 | 46% | 452 | 1,36 | 1,01 |
| Gerardina 1 | 🛡️ | Coppia | 0,56 | 53% | 528 | 1,34 | 1,00 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,61 | 58% | 570 | 1,34 | 1,00 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,42 | 40% | 399 | 1,33 | 0,99 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,77 | 71% | 706 | 1,31 | 0,98 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,58 | 55% | 540 | 1,30 | 0,97 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,69 | 63% | 618 | 1,27 | 0,95 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,62 | 60% | 602 | 1,27 | 0,94 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,66 | 60% | 603 | 1,22 | 0,91 |
| Nonno Antonio 1 | 🔵 | 12 | 0,36 | 35% | 341 | 1,20 | 0,89 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,59 | 55% | 552 | 1,20 | 0,89 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,67 | 61% | 600 | 1,18 | 0,88 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,51 | 48% | 477 | 1,17 | 0,87 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,47 | 45% | 453 | 1,14 | 0,85 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,63 | 58% | 572 | 1,13 | 0,84 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,65 | 61% | 610 | 1,04 | 0,77 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,49 | 47% | 467 | 1,74 | 1,25 |
| Alessia | ✨ | 3 carte pari | 0,51 | 49% | 490 | 1,71 | 1,22 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,49 | 47% | 465 | 1,60 | 1,14 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,46 | 43% | 426 | 1,55 | 1,11 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,46 | 44% | 427 | 1,50 | 1,07 |
| Nonno Salvatore 2 | ✨ | Tris | 0,36 | 35% | 349 | 1,50 | 1,07 |
| Donato | 🛡️ | Scala da 3 | 0,42 | 41% | 401 | 1,48 | 1,06 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,44 | 41% | 406 | 1,48 | 1,06 |
| Roberta 2 | 🛡️ | Tris | 0,38 | 36% | 356 | 1,48 | 1,06 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,72 | 68% | 665 | 1,47 | 1,05 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,62 | 59% | 585 | 1,46 | 1,04 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,44 | 41% | 405 | 1,45 | 1,04 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,45 | 43% | 428 | 1,45 | 1,04 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,64 | 60% | 599 | 1,43 | 1,02 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,44 | 43% | 420 | 1,42 | 1,01 |
| Marika 2 | 🛡️ | Scala da 3 | 0,45 | 42% | 412 | 1,41 | 1,01 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,48 | 45% | 440 | 1,41 | 1,01 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,51 | 48% | 476 | 1,40 | 1,00 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,45 | 42% | 415 | 1,39 | 0,99 |
| Checca 2 | ✨ | 123 | 0,29 | 28% | 281 | 1,38 | 0,99 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,50 | 47% | 473 | 1,36 | 0,97 |
| Donatina 2 | ✨ | Scala da 3 | 0,45 | 43% | 421 | 1,34 | 0,96 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,47 | 45% | 441 | 1,32 | 0,95 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,67 | 62% | 612 | 1,30 | 0,93 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,63 | 59% | 583 | 1,29 | 0,92 |
| Don Pasquale | 🛡️ | Tris | 0,38 | 37% | 364 | 1,27 | 0,91 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,61 | 58% | 571 | 1,26 | 0,90 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,63 | 59% | 589 | 1,24 | 0,89 |
| Greta | ⚔️ | 3 carte dispari | 0,61 | 58% | 570 | 1,23 | 0,88 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,60 | 56% | 555 | 1,22 | 0,87 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,57 | 54% | 536 | 1,20 | 0,86 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,67 | 62% | 611 | 1,06 | 0,76 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,60 | 56% | 554 | 2,03 | 1,36 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,43 | 40% | 398 | 1,83 | 1,23 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,25 | 24% | 244 | 1,67 | 1,12 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,34 | 32% | 322 | 1,64 | 1,10 |
| Annalisa 3 | ✨ | Scala da 5 | 0,23 | 22% | 219 | 1,56 | 1,05 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,37 | 35% | 356 | 1,56 | 1,05 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,44 | 42% | 432 | 1,54 | 1,04 |
| Marika 3 | ✨ | Scala da 5 | 0,21 | 21% | 211 | 1,53 | 1,03 |
| Roberta 3 | ⚔️ | Poker | 0,30 | 29% | 315 | 1,53 | 1,03 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,53 | 49% | 485 | 1,50 | 1,01 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,51 | 49% | 488 | 1,47 | 0,98 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,36 | 35% | 344 | 1,46 | 0,98 |
| Nonno Salvatore 3 | ✨ | Poker | 0,16 | 16% | 165 | 1,46 | 0,98 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,24 | 23% | 246 | 1,43 | 0,96 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,21 | 21% | 213 | 1,42 | 0,96 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,37 | 36% | 356 | 1,42 | 0,95 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,22 | 22% | 220 | 1,42 | 0,95 |
| Totò 3 | ✨ | 4 carte pari | 0,41 | 39% | 380 | 1,39 | 0,93 |
| Donatina 3 | ⚔️ | 1234 | 0,35 | 34% | 345 | 1,35 | 0,91 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,42 | 40% | 409 | 1,35 | 0,91 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,40 | 39% | 383 | 1,35 | 0,91 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,56 | 52% | 531 | 1,32 | 0,88 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,48 | 45% | 458 | 1,29 | 0,87 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,54 | 51% | 506 | 1,22 | 0,82 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 12,81 |
| Mercatino | 🔵 | 12,73 |
| Lezione di padel | 🔵 | 10,84 |
| Scaffale | ✨ | 8,65 |
| Te l'ho già detto? | ✨ | 8,46 |
| Studia il fascicolo | 🔵 | 7,31 |
| Burla | ⚔️ | 6,83 |
| Sposta i mobili | ✨ | 6,70 |
| Versa il vino | ⚔️ | 6,50 |
| Si incanta | ⚔️ | 6,29 |
| Schietta | ⚔️ | 6,11 |
| Mangia mangia mangia | ✨ | 5,91 |
| Smash | ⚔️ | 5,60 |
| Ci penso domani | ✨ | 5,42 |
| Ogni cosa al suo posto | ✨ | 5,03 |
| Ce l'ho io! | ✨ | 4,95 |
| Frigge di tutto | ✨ | 4,84 |
| Fatto in casa | ✨ | 4,64 |
| Frutta e verdura! | ✨ | 4,62 |
| Ti chiamo un attimo… | ⚔️ | 4,46 |
| Grigliata | ✨ | 4,41 |
| Bisiniss | ⚔️ | 4,17 |
| Brace accesa | ✨ | 4,15 |
| Pranzo a domicilio | ✨ | 4,06 |
| Baratto | ⚔️ | 3,97 |
| Parla parla parla | ⚔️ | 3,94 |
| Solo per vedere comm sape | ⚔️ | 3,88 |
| Forno a legna | ⚔️ | 3,67 |
| Ho tanta fame | ✨ | 3,40 |
| Zeppata sui social | ⚔️ | 3,35 |
| Multa | ⚔️ | 3,25 |
| L'ho già detto | ✨ | 3,19 |
| Risata contagiosa | ⚔️ | 3,08 |
| Vertenza | ⚔️ | 3,06 |
| Si canta! | ⚔️ | 3,04 |
| Sparecchio | ⚔️ | 2,74 |
| Una rospa? | ⚔️ | 2,58 |
| Nuvola di fumo | 🛡️ | 2,56 |
| Offre la casa | ✨ | 2,54 |
| Rospe per tutti | ⚔️ | 2,40 |
| Colazione | ✨ | 2,39 |
| Tritacarne | ⚔️ | 2,38 |
| Invasione di campo | ⚔️ | 2,32 |
| Benedizione | 🛡️ | 2,08 |
| Anima della festa | ✨ | 1,97 |
| La vetrina della collezione | ✨ | 1,88 |
| Vende la carne | ✨ | 1,86 |
| Allergica al finocchietto | ⚔️ | 1,82 |
| Il bastone | ⚔️ | 1,72 |
| Volo infuocato | ⚔️ | 1,67 |
| Manca 'o sale | ⚔️ | 1,60 |
| Urla | ⚔️ | 1,27 |
| Non sbaglio mai | 🔵 | 1,09 |
| Cucina per 200 | ✨ | 1,06 |
| Patate al forno | ✨ | 0,92 |
| Doppio turno | ✨ | 0,88 |
| Il mio corpo che cambia | ✨ | 0,84 |
| Vento | ⚔️ | 0,71 |
| La tomacella | ⚔️ | 0,63 |
| Giro aperto | ⚔️ | 0,60 |
| Gli occhi 'nguoll | ⚔️ | 0,56 |
| Medico in famiglia | 🔵 | 0,44 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,26 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 6831 | 4266 | 3142 | 42% |
| Versa il vino | 6505 | 3993 | 3461 | 46% |
| Si incanta | 6285 | 3981 | 2823 | 41% |
| Schietta | 6111 | 3778 | 2895 | 43% |
| Smash | 5602 | 3404 | 3033 | 47% |
| Ti chiamo un attimo… | 4455 | 2737 | 2135 | 44% |
| Bisiniss | 4167 | 2848 | 1757 | 38% |
| Baratto | 3971 | 3574 | 686 | 16% |
| Parla parla parla | 3937 | 2622 | 1716 | 40% |
| Solo per vedere comm sape | 3884 | 2650 | 1635 | 38% |
| Forno a legna | 3669 | 2701 | 1282 | 32% |
| Zeppata sui social | 3353 | 6183 | 1116 | 15% |
| Multa | 3255 | 2531 | 1385 | 35% |
| Risata contagiosa | 3076 | 4741 | 2166 | 31% |
| Vertenza | 3061 | 2818 | 438 | 13% |
| Si canta! | 3040 | 3939 | 2566 | 39% |
| Sparecchio | 2740 | 2407 | 509 | 17% |
| Una rospa? | 2582 | 1764 | 1064 | 38% |
| Rospe per tutti | 2396 | 4603 | 430 | 9% |
| Tritacarne | 2385 | 2200 | 279 | 11% |
| Invasione di campo | 2321 | 3810 | 172 | 4% |
| Allergica al finocchietto | 1820 | 1711 | 197 | 10% |
| Il bastone | 1723 | 1504 | 362 | 19% |
| Volo infuocato | 1668 | 2852 | 302 | 10% |
| Manca 'o sale | 1604 | 2997 | 150 | 5% |
| Urla | 1266 | 2154 | 194 | 8% |
| Vento | 713 | 500 | 254 | 34% |
| La tomacella | 632 | 443 | 263 | 37% |
| Giro aperto | 597 | 434 | 217 | 33% |
| Gli occhi 'nguoll | 559 | 400 | 198 | 33% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 2688 | 0 |
| Ho sempre ragione io | 2047 | 0 |
| Non è colpa mia | 1877 | 0 |
| Una fetta di torta? | 1860 | 0 |
| Ricorso | 1797 | 0 |
| Non sa perdere | 1790 | 0 |
| Scudo da gladiatore | 1787 | 0 |
| È colpa di qualcun altro | 1778 | 0 |
| Non ti sento, sto suonando | 1768 | 0 |
| Ho appena lavato a terra | 1732 | 0 |
| Permalosa | 1703 | 0 |
| Cella frigorifera | 1695 | 0 |
| Si arrabbia | 1677 | 0 |
| Non c'è, ha il turno | 1664 | 0 |
| Mutandoni di lana | 1601 | 0 |
| Chiusa in camera | 1376 | 0 |
| Nuvola di fumo | 1134 | 0 |
| Sempre calma | 1074 | 0 |
| Tyrion nella borsa | 950 | 0 |
| Campari | 749 | 0 |
| Nevicava, non è potuto venire | 738 | 0 |
| Sono andato a Lioni a fa' a spesa | 714 | 0 |
| Sono a un matrimonio | 707 | 0 |
| Paesano | 679 | 0 |
| Aglianico | 582 | 0 |
| Forse c'è, forse no | 483 | 477 |
| Taurasi | 177 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,80 |
| La Resurrezione | 2,82 |
| Carnevale di Teora | 2,83 |
| Funerale | 2,79 |
| Matrimonio | 2,80 |
| Sagra delle tomacelle | 2,79 |

Tempo di calcolo: 300.4 secondi.
