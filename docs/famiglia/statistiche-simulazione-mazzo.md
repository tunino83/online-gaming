# La Famiglia – statistiche della simulazione (fine quando finisce il mazzo)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 36
Finite perché il mazzo personaggi è finito (invece che per i punti): 1000

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 142,5 | 71,2 | 54–318 | 47,8 | 36,4 | 52% · 48% |
| 3 | 250 | 135,6 | 45,2 | 63–273 | 32,9 | 22,7 | 34% · 30% · 36% |
| 4 | 250 | 132,6 | 33,1 | 68–224 | 25,8 | 17,0 | 24% · 25% · 28% · 24% |
| 5 | 250 | 123,6 | 24,7 | 75–195 | 20,2 | 12,5 | 22% · 20% · 20% · 19% · 19% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,66), Generoso 1 (1,22), Alessia (1,21)
- Carte che sembrano **più deboli** (≤ 0,8): Totò 1 (0,78), Checca 3 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): nessuna

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 2 carte con somma 4 | 0,42 | 42% | 415 | 1,72 | 1,22 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,41 | 39% | 391 | 1,65 | 1,16 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,58 | 55% | 549 | 1,63 | 1,15 |
| Christian | ✨ | Coppia | 0,57 | 53% | 528 | 1,58 | 1,11 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,41 | 40% | 388 | 1,58 | 1,11 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,56 | 53% | 530 | 1,57 | 1,11 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,53 | 49% | 484 | 1,56 | 1,10 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,56 | 54% | 533 | 1,50 | 1,05 |
| Nonno Antonio 1 | 🔵 | 12 | 0,35 | 34% | 343 | 1,49 | 1,05 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,60 | 57% | 564 | 1,49 | 1,05 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,51 | 48% | 470 | 1,45 | 1,02 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,49 | 47% | 462 | 1,43 | 1,01 |
| Gerardina 1 | 🛡️ | Coppia | 0,52 | 50% | 489 | 1,43 | 1,01 |
| Marika 1 | 🛡️ | Coppia | 0,54 | 52% | 517 | 1,42 | 1,00 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,47 | 45% | 452 | 1,41 | 1,00 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,53 | 51% | 496 | 1,40 | 0,98 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,62 | 60% | 602 | 1,39 | 0,98 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,58 | 55% | 540 | 1,36 | 0,96 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,47 | 46% | 458 | 1,34 | 0,95 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,62 | 58% | 578 | 1,33 | 0,94 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,55 | 52% | 512 | 1,32 | 0,93 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,60 | 57% | 564 | 1,29 | 0,91 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,74 | 70% | 689 | 1,24 | 0,88 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,61 | 58% | 570 | 1,21 | 0,85 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,68 | 63% | 621 | 1,21 | 0,85 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,60 | 57% | 567 | 1,19 | 0,84 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,63 | 60% | 596 | 1,11 | 0,78 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Alessia | ✨ | 3 carte pari | 0,49 | 47% | 467 | 1,77 | 1,21 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,42 | 41% | 406 | 1,71 | 1,17 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,40 | 38% | 377 | 1,60 | 1,09 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,39 | 38% | 380 | 1,59 | 1,09 |
| Roberta 2 | 🛡️ | Tris | 0,32 | 31% | 305 | 1,59 | 1,09 |
| Donato | 🛡️ | Scala da 3 | 0,41 | 40% | 393 | 1,59 | 1,08 |
| Nonno Salvatore 2 | ✨ | Tris | 0,33 | 31% | 307 | 1,56 | 1,07 |
| Marika 2 | 🛡️ | Scala da 3 | 0,43 | 41% | 405 | 1,55 | 1,06 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,48 | 45% | 446 | 1,54 | 1,05 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,49 | 47% | 467 | 1,53 | 1,04 |
| Checca 2 | ✨ | 123 | 0,24 | 23% | 240 | 1,51 | 1,04 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,44 | 42% | 420 | 1,51 | 1,03 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,58 | 55% | 542 | 1,49 | 1,02 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,42 | 41% | 392 | 1,47 | 1,01 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,42 | 40% | 396 | 1,46 | 1,00 |
| Donatina 2 | ✨ | Scala da 3 | 0,46 | 44% | 431 | 1,46 | 1,00 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,59 | 57% | 561 | 1,45 | 0,99 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,70 | 67% | 661 | 1,45 | 0,99 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,46 | 44% | 431 | 1,45 | 0,99 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,44 | 43% | 418 | 1,45 | 0,99 |
| Don Pasquale | 🛡️ | Tris | 0,34 | 33% | 328 | 1,41 | 0,97 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,43 | 41% | 406 | 1,41 | 0,96 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,58 | 55% | 556 | 1,40 | 0,96 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,65 | 59% | 589 | 1,38 | 0,94 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,57 | 55% | 554 | 1,36 | 0,93 |
| Greta | ⚔️ | 3 carte dispari | 0,59 | 56% | 563 | 1,36 | 0,93 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,62 | 58% | 577 | 1,34 | 0,92 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,59 | 57% | 569 | 1,32 | 0,90 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,47 | 45% | 448 | 1,30 | 0,89 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,55 | 51% | 514 | 1,27 | 0,87 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,41 | 40% | 394 | 1,25 | 0,85 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,60 | 56% | 560 | 1,25 | 0,85 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,55 | 53% | 533 | 2,49 | 1,66 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,40 | 38% | 381 | 1,73 | 1,15 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,23 | 22% | 219 | 1,69 | 1,12 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,21 | 20% | 201 | 1,61 | 1,07 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,38 | 36% | 375 | 1,61 | 1,07 |
| Nonno Salvatore 3 | ✨ | Poker | 0,15 | 14% | 149 | 1,59 | 1,06 |
| Nonno Antonio 3 | ⚔️ | 1111 | 0,13 | 12% | 150 | 1,59 | 1,06 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,20 | 20% | 205 | 1,58 | 1,05 |
| Roberta 3 | ⚔️ | Poker | 0,27 | 26% | 284 | 1,56 | 1,04 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,35 | 35% | 347 | 1,55 | 1,03 |
| Marika 3 | ✨ | Scala da 5 | 0,21 | 21% | 213 | 1,52 | 1,01 |
| Annalisa 3 | ✨ | Scala da 5 | 0,21 | 21% | 200 | 1,48 | 0,99 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,33 | 32% | 315 | 1,47 | 0,98 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,38 | 36% | 359 | 1,44 | 0,96 |
| Donatina 3 | ⚔️ | 1234 | 0,35 | 34% | 351 | 1,44 | 0,96 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,33 | 32% | 319 | 1,39 | 0,93 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,38 | 37% | 375 | 1,34 | 0,89 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,50 | 48% | 476 | 1,34 | 0,89 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,46 | 44% | 438 | 1,32 | 0,88 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,40 | 39% | 397 | 1,30 | 0,87 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,53 | 51% | 501 | 1,30 | 0,86 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,47 | 45% | 447 | 1,27 | 0,85 |
| Totò 3 | ✨ | 4 carte pari | 0,39 | 37% | 368 | 1,26 | 0,84 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,49 | 47% | 467 | 1,19 | 0,79 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 12,27 |
| Mercatino | 🔵 | 12,17 |
| Lezione di padel | 🔵 | 9,75 |
| Te l'ho già detto? | ✨ | 8,21 |
| Scaffale | ✨ | 7,84 |
| Studia il fascicolo | 🔵 | 7,27 |
| Burla | ⚔️ | 7,23 |
| Sposta i mobili | ✨ | 6,73 |
| Si incanta | ⚔️ | 6,64 |
| Schietta | ⚔️ | 5,84 |
| Versa il vino | ⚔️ | 5,81 |
| Ci penso domani | ✨ | 5,37 |
| Mangia mangia mangia | ✨ | 5,31 |
| Ogni cosa al suo posto | ✨ | 5,09 |
| Smash | ⚔️ | 4,72 |
| Frigge di tutto | ✨ | 4,61 |
| Ce l'ho io! | ✨ | 4,55 |
| Frutta e verdura! | ✨ | 4,32 |
| Fatto in casa | ✨ | 4,25 |
| Ti chiamo un attimo… | ⚔️ | 4,09 |
| Pranzo a domicilio | ✨ | 4,00 |
| Bisiniss | ⚔️ | 4,00 |
| Solo per vedere comm sape | ⚔️ | 3,83 |
| Vertenza | ⚔️ | 3,80 |
| Forno a legna | ⚔️ | 3,65 |
| Brace accesa | ✨ | 3,58 |
| Parla parla parla | ⚔️ | 3,54 |
| Baratto | ⚔️ | 3,45 |
| Multa | ⚔️ | 3,31 |
| Zeppata sui social | ⚔️ | 3,25 |
| Ho tanta fame | ✨ | 3,21 |
| Risata contagiosa | ⚔️ | 3,03 |
| Si canta! | ⚔️ | 2,97 |
| L'ho già detto | ✨ | 2,60 |
| Una rospa? | ⚔️ | 2,53 |
| Nuvola di fumo | 🛡️ | 2,46 |
| Offre la casa | ✨ | 2,32 |
| Invasione di campo | ⚔️ | 2,28 |
| Rospe per tutti | ⚔️ | 2,28 |
| Tritacarne | ⚔️ | 2,12 |
| Sparecchio | ⚔️ | 2,10 |
| Colazione | ✨ | 2,09 |
| Vende la carne | ✨ | 1,95 |
| Grigliata | ✨ | 1,92 |
| Allergica al finocchietto | ⚔️ | 1,85 |
| Benedizione | 🛡️ | 1,83 |
| Anima della festa | ✨ | 1,75 |
| Volo infuocato | ⚔️ | 1,68 |
| Manca 'o sale | ⚔️ | 1,54 |
| La vetrina della collezione | ✨ | 1,53 |
| Non sbaglio mai | 🔵 | 1,18 |
| Urla | ⚔️ | 1,15 |
| Cucina per 200 | ✨ | 0,94 |
| Il bastone | ⚔️ | 0,91 |
| Doppio turno | ✨ | 0,90 |
| Patate al forno | ✨ | 0,82 |
| Il mio corpo che cambia | ✨ | 0,75 |
| Vento | ⚔️ | 0,71 |
| La tomacella | ⚔️ | 0,63 |
| Giro aperto | ⚔️ | 0,60 |
| Gli occhi 'nguoll | ⚔️ | 0,52 |
| Medico in famiglia | 🔵 | 0,39 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,27 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 7231 | 4544 | 3283 | 42% |
| Si incanta | 6636 | 4314 | 2909 | 40% |
| Schietta | 5842 | 3721 | 2609 | 41% |
| Versa il vino | 5811 | 3527 | 3093 | 47% |
| Smash | 4722 | 2820 | 2584 | 48% |
| Ti chiamo un attimo… | 4089 | 2631 | 1824 | 41% |
| Bisiniss | 3997 | 2768 | 1601 | 37% |
| Solo per vedere comm sape | 3825 | 2709 | 1481 | 35% |
| Vertenza | 3804 | 3463 | 555 | 14% |
| Forno a legna | 3654 | 2788 | 1200 | 30% |
| Parla parla parla | 3545 | 2439 | 1461 | 37% |
| Baratto | 3447 | 3114 | 568 | 15% |
| Multa | 3313 | 2628 | 1279 | 33% |
| Zeppata sui social | 3252 | 6028 | 1079 | 15% |
| Risata contagiosa | 3030 | 4784 | 2021 | 30% |
| Si canta! | 2971 | 4107 | 2340 | 36% |
| Una rospa? | 2532 | 1828 | 926 | 34% |
| Invasione di campo | 2279 | 3702 | 204 | 5% |
| Rospe per tutti | 2278 | 4501 | 352 | 7% |
| Tritacarne | 2124 | 1944 | 285 | 13% |
| Sparecchio | 2101 | 1871 | 378 | 17% |
| Allergica al finocchietto | 1852 | 1740 | 197 | 10% |
| Volo infuocato | 1679 | 3063 | 269 | 8% |
| Manca 'o sale | 1538 | 2859 | 134 | 4% |
| Urla | 1146 | 2115 | 140 | 6% |
| Il bastone | 905 | 769 | 182 | 19% |
| Vento | 706 | 493 | 262 | 35% |
| La tomacella | 631 | 421 | 261 | 38% |
| Giro aperto | 599 | 448 | 195 | 30% |
| Gli occhi 'nguoll | 522 | 375 | 186 | 33% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 2436 | 0 |
| Si arrabbia | 1865 | 0 |
| Non è colpa mia | 1738 | 0 |
| Ricorso | 1730 | 0 |
| Ho sempre ragione io | 1679 | 0 |
| Scudo da gladiatore | 1655 | 0 |
| È colpa di qualcun altro | 1631 | 0 |
| Non sa perdere | 1564 | 0 |
| Ho appena lavato a terra | 1546 | 0 |
| Cella frigorifera | 1544 | 0 |
| Permalosa | 1537 | 0 |
| Non c'è, ha il turno | 1528 | 0 |
| Una fetta di torta? | 1528 | 0 |
| Mutandoni di lana | 1510 | 0 |
| Non ti sento, sto suonando | 1487 | 0 |
| Chiusa in camera | 1135 | 0 |
| Nuvola di fumo | 1009 | 0 |
| Tyrion nella borsa | 958 | 0 |
| Sempre calma | 932 | 0 |
| Nevicava, non è potuto venire | 754 | 0 |
| Sono andato a Lioni a fa' a spesa | 726 | 0 |
| Campari | 713 | 0 |
| Sono a un matrimonio | 713 | 0 |
| Paesano | 673 | 0 |
| Aglianico | 569 | 0 |
| Forse c'è, forse no | 522 | 547 |
| Taurasi | 176 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,85 |
| La Resurrezione | 2,85 |
| Carnevale di Teora | 2,80 |
| Funerale | 2,84 |
| Matrimonio | 2,83 |
| Sagra delle tomacelle | 2,81 |

Tempo di calcolo: 265.0 secondi.
