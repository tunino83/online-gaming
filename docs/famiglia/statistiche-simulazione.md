# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 28
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 61,7 | 30,9 | 34–140 | 21,4 | 17,1 | 50% · 50% |
| 3 | 250 | 86,5 | 28,8 | 45–153 | 21,3 | 15,3 | 34% · 31% · 36% |
| 4 | 250 | 108,3 | 27,1 | 56–264 | 21,3 | 14,3 | 27% · 26% · 25% · 22% |
| 5 | 250 | 129,4 | 25,9 | 75–245 | 21,4 | 13,3 | 22% · 20% · 19% · 19% · 20% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,67), Claudia 1 (1,44), Generoso 1 (1,39), Generoso 2 (1,33), Alessia (1,29), Nonna Dina 3 (1,29), Nonno Nicola 1 (1,23), Nonno Salvatore 2 (1,20)
- Carte che sembrano **più deboli** (≤ 0,8): Dottor Racioppi (0,69), Squacqualacchione 1 (0,73), Totò 1 (0,73), Maddalena 1 (0,74), Checca 1 (0,78), Checca 3 (0,79), Zio Salvatore 2 (0,79), Totò 3 (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (5%), Nonno Salvatore 3 (9%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,30 | 29% | 295 | 1,90 | 1,44 |
| Generoso 1 | 🔵 | 2 carte con somma 4 | 0,32 | 32% | 314 | 1,83 | 1,39 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,45 | 45% | 445 | 1,62 | 1,23 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,45 | 43% | 430 | 1,54 | 1,17 |
| Christian | ✨ | Coppia | 0,42 | 42% | 412 | 1,54 | 1,17 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,44 | 43% | 433 | 1,48 | 1,12 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,38 | 37% | 365 | 1,44 | 1,10 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,43 | 42% | 414 | 1,42 | 1,08 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,43 | 42% | 423 | 1,41 | 1,07 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,29 | 29% | 288 | 1,40 | 1,06 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,39 | 38% | 378 | 1,38 | 1,05 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,31 | 31% | 310 | 1,31 | 1,00 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,41 | 40% | 395 | 1,29 | 0,98 |
| Nonno Antonio 1 | 🔵 | 12 | 0,23 | 23% | 230 | 1,29 | 0,98 |
| Marika 1 | 🛡️ | Coppia | 0,41 | 41% | 402 | 1,28 | 0,97 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,46 | 45% | 443 | 1,28 | 0,97 |
| Gerardina 1 | 🛡️ | Coppia | 0,41 | 40% | 396 | 1,27 | 0,96 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,39 | 37% | 372 | 1,26 | 0,95 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,41 | 40% | 400 | 1,25 | 0,95 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,36 | 35% | 351 | 1,22 | 0,92 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,47 | 46% | 457 | 1,20 | 0,91 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,45 | 44% | 437 | 1,11 | 0,84 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,45 | 44% | 442 | 1,02 | 0,78 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,45 | 45% | 446 | 0,97 | 0,74 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,48 | 48% | 477 | 0,97 | 0,73 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,52 | 51% | 502 | 0,96 | 0,73 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,53 | 52% | 510 | 0,91 | 0,69 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,32 | 32% | 317 | 1,85 | 1,33 |
| Alessia | ✨ | 3 carte pari | 0,38 | 37% | 370 | 1,80 | 1,29 |
| Nonno Salvatore 2 | ✨ | Tris | 0,24 | 23% | 227 | 1,68 | 1,20 |
| Roberta 2 | 🛡️ | Tris | 0,23 | 22% | 224 | 1,65 | 1,18 |
| Donato | 🛡️ | Scala da 3 | 0,30 | 30% | 295 | 1,58 | 1,13 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,33 | 33% | 332 | 1,52 | 1,09 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,30 | 30% | 302 | 1,50 | 1,08 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,37 | 37% | 363 | 1,48 | 1,06 |
| Marika 2 | 🛡️ | Scala da 3 | 0,31 | 31% | 304 | 1,48 | 1,06 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 328 | 1,45 | 1,04 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,30 | 29% | 296 | 1,45 | 1,04 |
| Checca 2 | ✨ | 123 | 0,17 | 17% | 170 | 1,43 | 1,02 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,31 | 31% | 308 | 1,42 | 1,02 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,43 | 43% | 426 | 1,42 | 1,02 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,43 | 43% | 427 | 1,40 | 1,01 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,45 | 44% | 444 | 1,38 | 0,99 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,48 | 47% | 470 | 1,37 | 0,98 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,35 | 34% | 345 | 1,35 | 0,97 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,51 | 50% | 497 | 1,35 | 0,97 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,38 | 37% | 373 | 1,35 | 0,97 |
| Donatina 2 | ✨ | Scala da 3 | 0,34 | 33% | 326 | 1,34 | 0,96 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,34 | 34% | 335 | 1,32 | 0,95 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,44 | 44% | 438 | 1,30 | 0,93 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,38 | 38% | 379 | 1,28 | 0,92 |
| Greta | ⚔️ | 3 carte dispari | 0,42 | 41% | 412 | 1,24 | 0,89 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,42 | 41% | 416 | 1,24 | 0,89 |
| Don Pasquale | 🛡️ | Tris | 0,23 | 23% | 234 | 1,23 | 0,88 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,31 | 31% | 307 | 1,22 | 0,88 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,37 | 36% | 361 | 1,20 | 0,86 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,48 | 47% | 467 | 1,13 | 0,81 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,31 | 31% | 307 | 1,13 | 0,81 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,45 | 45% | 445 | 1,11 | 0,79 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,42 | 42% | 421 | 2,81 | 1,67 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 13% | 134 | 2,17 | 1,29 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,15 | 15% | 157 | 1,95 | 1,16 |
| Nonno Antonio 3 | ⚔️ | 1111 | 0,05 | 5% | 64 | 1,91 | 1,13 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,31 | 30% | 299 | 1,83 | 1,09 |
| Donatina 3 | ⚔️ | 1234 | 0,22 | 22% | 230 | 1,82 | 1,08 |
| Roberta 3 | ⚔️ | Poker | 0,13 | 13% | 138 | 1,81 | 1,08 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,27 | 26% | 272 | 1,79 | 1,06 |
| Nonno Salvatore 3 | ✨ | Poker | 0,09 | 9% | 101 | 1,77 | 1,05 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,27 | 26% | 266 | 1,69 | 1,01 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,12 | 12% | 120 | 1,65 | 0,98 |
| Marika 3 | ✨ | Scala da 5 | 0,14 | 14% | 143 | 1,62 | 0,96 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 243 | 1,61 | 0,96 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,28 | 28% | 279 | 1,61 | 0,95 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,41 | 40% | 399 | 1,59 | 0,94 |
| Annalisa 3 | ✨ | Scala da 5 | 0,14 | 14% | 141 | 1,55 | 0,92 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,37 | 36% | 356 | 1,53 | 0,91 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 240 | 1,51 | 0,90 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,26 | 26% | 261 | 1,39 | 0,83 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,28 | 28% | 280 | 1,39 | 0,83 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,33 | 32% | 317 | 1,39 | 0,82 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,32 | 32% | 323 | 1,35 | 0,80 |
| Totò 3 | ✨ | 4 carte pari | 0,28 | 28% | 276 | 1,35 | 0,80 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,36 | 36% | 358 | 1,33 | 0,79 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 5,96 |
| Mercatino | 🔵 | 5,82 |
| Sposta i mobili | ✨ | 5,43 |
| Burla | ⚔️ | 4,99 |
| Te l'ho già detto? | ✨ | 4,78 |
| Si incanta | ⚔️ | 4,37 |
| Lezione di padel | 🔵 | 4,29 |
| Scaffale | ✨ | 4,00 |
| Schietta | ⚔️ | 3,96 |
| Studia il fascicolo | 🔵 | 3,71 |
| Ci penso domani | ✨ | 3,55 |
| Ogni cosa al suo posto | ✨ | 3,36 |
| Frutta e verdura! | ✨ | 2,84 |
| Versa il vino | ⚔️ | 2,74 |
| Bisiniss | ⚔️ | 2,56 |
| Ti chiamo un attimo… | ⚔️ | 2,56 |
| Mangia mangia mangia | ✨ | 2,48 |
| Pranzo a domicilio | ✨ | 2,42 |
| Solo per vedere comm sape | ⚔️ | 2,33 |
| Frigge di tutto | ✨ | 2,29 |
| Forno a legna | ⚔️ | 2,24 |
| Ce l'ho io! | ✨ | 2,19 |
| Parla parla parla | ⚔️ | 2,17 |
| Smash | ⚔️ | 2,14 |
| Multa | ⚔️ | 2,12 |
| Fatto in casa | ✨ | 2,04 |
| Zeppata sui social | ⚔️ | 1,93 |
| Ho tanta fame | ✨ | 1,92 |
| Una rospa? | ⚔️ | 1,89 |
| Risata contagiosa | ⚔️ | 1,82 |
| Si canta! | ⚔️ | 1,68 |
| Brace accesa | ✨ | 1,58 |
| Vertenza | ⚔️ | 1,57 |
| Nuvola di fumo | 🛡️ | 1,44 |
| Vende la carne | ✨ | 1,36 |
| Baratto | ⚔️ | 1,29 |
| L'ho già detto | ✨ | 1,23 |
| Invasione di campo | ⚔️ | 1,22 |
| Colazione | ✨ | 1,19 |
| Rospe per tutti | ⚔️ | 1,19 |
| Allergica al finocchietto | ⚔️ | 1,16 |
| Offre la casa | ✨ | 1,10 |
| Tritacarne | ⚔️ | 1,06 |
| Grigliata | ✨ | 1,01 |
| Benedizione | 🛡️ | 0,96 |
| Non sbaglio mai | 🔵 | 0,86 |
| Volo infuocato | ⚔️ | 0,73 |
| La vetrina della collezione | ✨ | 0,70 |
| Manca 'o sale | ⚔️ | 0,63 |
| Anima della festa | ✨ | 0,58 |
| Vento | ⚔️ | 0,57 |
| La tomacella | ⚔️ | 0,49 |
| Urla | ⚔️ | 0,46 |
| Sparecchio | ⚔️ | 0,46 |
| Giro aperto | ⚔️ | 0,46 |
| Gli occhi 'nguoll | ⚔️ | 0,42 |
| Il mio corpo che cambia | ✨ | 0,35 |
| Doppio turno | ✨ | 0,35 |
| Patate al forno | ✨ | 0,34 |
| Cucina per 200 | ✨ | 0,31 |
| Medico in famiglia | 🔵 | 0,24 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,18 |
| Il bastone | ⚔️ | 0,13 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 4989 | 3354 | 1964 | 37% |
| Si incanta | 4372 | 3082 | 1612 | 34% |
| Schietta | 3965 | 2734 | 1508 | 36% |
| Versa il vino | 2740 | 1914 | 1136 | 37% |
| Bisiniss | 2557 | 1911 | 849 | 31% |
| Ti chiamo un attimo… | 2556 | 1742 | 1014 | 37% |
| Solo per vedere comm sape | 2335 | 1771 | 745 | 30% |
| Forno a legna | 2243 | 1817 | 585 | 24% |
| Parla parla parla | 2165 | 1613 | 711 | 31% |
| Smash | 2143 | 1485 | 898 | 38% |
| Multa | 2116 | 1879 | 695 | 27% |
| Zeppata sui social | 1930 | 4431 | 759 | 15% |
| Una rospa? | 1886 | 1414 | 607 | 30% |
| Risata contagiosa | 1820 | 3764 | 1178 | 24% |
| Si canta! | 1682 | 2994 | 1351 | 31% |
| Vertenza | 1570 | 1495 | 118 | 7% |
| Baratto | 1291 | 1230 | 115 | 9% |
| Invasione di campo | 1223 | 2190 | 132 | 6% |
| Rospe per tutti | 1191 | 3088 | 153 | 5% |
| Allergica al finocchietto | 1161 | 1112 | 85 | 7% |
| Tritacarne | 1062 | 1014 | 76 | 7% |
| Volo infuocato | 735 | 1856 | 104 | 5% |
| Manca 'o sale | 630 | 1600 | 46 | 3% |
| Vento | 569 | 418 | 177 | 30% |
| La tomacella | 486 | 346 | 181 | 34% |
| Urla | 463 | 1240 | 48 | 4% |
| Sparecchio | 462 | 435 | 41 | 9% |
| Giro aperto | 459 | 361 | 124 | 26% |
| Gli occhi 'nguoll | 423 | 316 | 130 | 29% |
| Il bastone | 127 | 114 | 19 | 14% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 1232 | 0 |
| Non è colpa mia | 916 | 0 |
| Mutandoni di lana | 803 | 0 |
| Non ti sento, sto suonando | 798 | 0 |
| Ricorso | 791 | 0 |
| Cella frigorifera | 788 | 0 |
| Non c'è, ha il turno | 756 | 0 |
| Scudo da gladiatore | 740 | 0 |
| Non sa perdere | 712 | 0 |
| Si arrabbia | 709 | 0 |
| Ho appena lavato a terra | 707 | 0 |
| È colpa di qualcun altro | 703 | 0 |
| Ho sempre ragione io | 702 | 0 |
| Sono andato a Lioni a fa' a spesa | 592 | 0 |
| Nevicava, non è potuto venire | 590 | 0 |
| Campari | 582 | 0 |
| Permalosa | 579 | 0 |
| Una fetta di torta? | 578 | 0 |
| Sempre calma | 561 | 0 |
| Sono a un matrimonio | 540 | 0 |
| Tyrion nella borsa | 535 | 0 |
| Paesano | 508 | 0 |
| Chiusa in camera | 485 | 0 |
| Aglianico | 450 | 0 |
| Nuvola di fumo | 377 | 0 |
| Forse c'è, forse no | 297 | 311 |
| Taurasi | 130 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,33 |
| La Resurrezione | 2,36 |
| Carnevale di Teora | 2,30 |
| Funerale | 2,30 |
| Matrimonio | 2,30 |
| Sagra delle tomacelle | 2,31 |

Tempo di calcolo: 179.4 secondi.
