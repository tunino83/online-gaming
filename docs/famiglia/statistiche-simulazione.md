# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 40
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 61,1 | 30,6 | 34–112 | 21,2 | 17,2 | 45% · 55% |
| 3 | 250 | 88,2 | 29,4 | 48–153 | 21,3 | 15,8 | 33% · 29% · 38% |
| 4 | 250 | 112,2 | 28,0 | 64–224 | 21,1 | 14,8 | 26% · 25% · 26% · 22% |
| 5 | 250 | 134,2 | 26,8 | 70–215 | 21,3 | 13,9 | 24% · 18% · 22% · 18% · 18% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Generoso 2 (1,36), Giuseppe 3 (1,34), Generoso 1 (1,31), Antonio 1 (1,26), Alessia (1,26), Generoso 3 (1,25), Nonno Nicola 1 (1,24)
- Carte che sembrano **più deboli** (≤ 0,8): Checca 1 (0,64), Zio Salvatore 1 (0,71), Zio Salvatore 2 (0,72), Donatina 2 (0,76), Rocky (0,78), Maddalena 1 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (9%), Nonno Salvatore 3 (10%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,18 | 19% | 186 | 1,64 | 1,31 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,46 | 44% | 441 | 1,57 | 1,26 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,48 | 47% | 470 | 1,55 | 1,24 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,31 | 30% | 298 | 1,47 | 1,17 |
| Christian | ✨ | Coppia | 0,46 | 44% | 439 | 1,45 | 1,16 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,45 | 44% | 434 | 1,45 | 1,16 |
| Nonno Antonio 1 | 🔵 | 12 | 0,27 | 27% | 271 | 1,39 | 1,11 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,43 | 43% | 426 | 1,32 | 1,05 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,37 | 37% | 361 | 1,32 | 1,05 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,30 | 30% | 302 | 1,31 | 1,04 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,40 | 39% | 391 | 1,31 | 1,04 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,56 | 54% | 539 | 1,27 | 1,02 |
| Marika 1 | 🛡️ | Coppia | 0,43 | 42% | 411 | 1,26 | 1,01 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,44 | 44% | 434 | 1,23 | 0,99 |
| Gerardina 1 | 🛡️ | Coppia | 0,42 | 42% | 414 | 1,23 | 0,98 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,43 | 42% | 411 | 1,22 | 0,97 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,47 | 46% | 455 | 1,20 | 0,96 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,50 | 48% | 482 | 1,18 | 0,95 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,45 | 44% | 439 | 1,17 | 0,94 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,40 | 40% | 397 | 1,17 | 0,93 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,39 | 38% | 378 | 1,12 | 0,89 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,52 | 51% | 504 | 1,12 | 0,89 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,50 | 49% | 479 | 1,11 | 0,89 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,46 | 45% | 443 | 1,02 | 0,81 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,48 | 46% | 457 | 0,98 | 0,79 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,33 | 33% | 332 | 0,89 | 0,71 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,49 | 48% | 475 | 0,81 | 0,64 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,37 | 36% | 358 | 1,82 | 1,36 |
| Alessia | ✨ | 3 carte pari | 0,40 | 40% | 399 | 1,68 | 1,26 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,38 | 38% | 370 | 1,52 | 1,14 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,34 | 33% | 329 | 1,50 | 1,13 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,38 | 37% | 359 | 1,50 | 1,13 |
| Nonno Salvatore 2 | ✨ | Tris | 0,24 | 24% | 239 | 1,49 | 1,12 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,47 | 47% | 465 | 1,46 | 1,09 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 332 | 1,44 | 1,08 |
| Marika 2 | 🛡️ | Scala da 3 | 0,34 | 34% | 341 | 1,44 | 1,08 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,51 | 50% | 497 | 1,44 | 1,08 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,48 | 46% | 459 | 1,43 | 1,07 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,37 | 37% | 362 | 1,43 | 1,07 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,31 | 31% | 305 | 1,41 | 1,06 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 331 | 1,39 | 1,04 |
| Roberta 2 | 🛡️ | Tris | 0,27 | 26% | 256 | 1,36 | 1,02 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,39 | 38% | 378 | 1,35 | 1,01 |
| Greta | ⚔️ | 3 carte dispari | 0,46 | 45% | 447 | 1,33 | 1,00 |
| Donato | 🛡️ | Scala da 3 | 0,31 | 31% | 310 | 1,33 | 0,99 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,46 | 45% | 454 | 1,29 | 0,97 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,37 | 36% | 364 | 1,26 | 0,94 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 327 | 1,25 | 0,94 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,45 | 44% | 433 | 1,25 | 0,94 |
| Don Pasquale | 🛡️ | Tris | 0,28 | 28% | 276 | 1,24 | 0,93 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,34 | 34% | 334 | 1,22 | 0,91 |
| Checca 2 | ✨ | 123 | 0,19 | 19% | 193 | 1,20 | 0,90 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,42 | 41% | 408 | 1,18 | 0,89 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,46 | 45% | 451 | 1,17 | 0,88 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,34 | 34% | 339 | 1,16 | 0,87 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,48 | 47% | 467 | 1,12 | 0,84 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,48 | 47% | 461 | 1,04 | 0,78 |
| Donatina 2 | ✨ | Scala da 3 | 0,35 | 35% | 344 | 1,02 | 0,76 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,51 | 49% | 487 | 0,97 | 0,72 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,45 | 44% | 439 | 2,24 | 1,34 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,33 | 32% | 318 | 2,09 | 1,25 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,17 | 17% | 173 | 1,89 | 1,13 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 14% | 145 | 1,88 | 1,12 |
| Marika 3 | ✨ | Scala da 5 | 0,15 | 15% | 152 | 1,82 | 1,08 |
| Annalisa 3 | ✨ | Scala da 5 | 0,16 | 16% | 157 | 1,80 | 1,07 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,28 | 28% | 285 | 1,79 | 1,07 |
| Roberta 3 | ⚔️ | Poker | 0,17 | 17% | 182 | 1,78 | 1,06 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,37 | 37% | 373 | 1,77 | 1,05 |
| Nonno Salvatore 3 | ✨ | Poker | 0,10 | 10% | 103 | 1,75 | 1,04 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,09 | 9% | 104 | 1,69 | 1,01 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,25 | 25% | 249 | 1,67 | 1,00 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,36 | 36% | 356 | 1,62 | 0,97 |
| Totò 3 | ✨ | 4 carte pari | 0,32 | 31% | 311 | 1,57 | 0,94 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,27 | 27% | 268 | 1,57 | 0,94 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,40 | 39% | 388 | 1,57 | 0,94 |
| Donatina 3 | ⚔️ | 1234 | 0,21 | 21% | 223 | 1,56 | 0,93 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,29 | 29% | 294 | 1,55 | 0,93 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,27 | 27% | 263 | 1,53 | 0,91 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,14 | 14% | 147 | 1,49 | 0,89 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,29 | 29% | 287 | 1,45 | 0,86 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,27 | 27% | 274 | 1,40 | 0,84 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,42 | 42% | 416 | 1,40 | 0,84 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,39 | 38% | 380 | 1,35 | 0,81 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Mercatino | 🔵 | 6,19 |
| Ricetta | ✨ | 6,16 |
| Sposta i mobili | ✨ | 5,62 |
| Lezione di padel | 🔵 | 4,99 |
| Te l'ho già detto? | ✨ | 4,83 |
| Burla | ⚔️ | 4,58 |
| Scaffale | ✨ | 4,22 |
| Si incanta | ⚔️ | 4,21 |
| Schietta | ⚔️ | 4,11 |
| Studia il fascicolo | 🔵 | 3,91 |
| Ci penso domani | ✨ | 3,74 |
| Ogni cosa al suo posto | ✨ | 3,47 |
| Versa il vino | ⚔️ | 3,02 |
| Frutta e verdura! | ✨ | 2,93 |
| Ti chiamo un attimo… | ⚔️ | 2,79 |
| Mangia mangia mangia | ✨ | 2,67 |
| Bisiniss | ⚔️ | 2,60 |
| Pranzo a domicilio | ✨ | 2,51 |
| Parla parla parla | ⚔️ | 2,41 |
| Smash | ⚔️ | 2,40 |
| Ce l'ho io! | ✨ | 2,40 |
| Frigge di tutto | ✨ | 2,39 |
| Solo per vedere comm sape | ⚔️ | 2,37 |
| Forno a legna | ⚔️ | 2,36 |
| Fatto in casa | ✨ | 2,28 |
| Multa | ⚔️ | 2,17 |
| Ho tanta fame | ✨ | 2,08 |
| Grigliata | ✨ | 2,06 |
| Zeppata sui social | ⚔️ | 2,02 |
| Una rospa? | ⚔️ | 2,01 |
| Risata contagiosa | ⚔️ | 1,90 |
| Brace accesa | ✨ | 1,76 |
| Si canta! | ⚔️ | 1,67 |
| Nuvola di fumo | 🛡️ | 1,55 |
| Baratto | ⚔️ | 1,48 |
| Vende la carne | ✨ | 1,43 |
| Colazione | ✨ | 1,41 |
| L'ho già detto | ✨ | 1,33 |
| Vertenza | ⚔️ | 1,31 |
| Invasione di campo | ⚔️ | 1,29 |
| Rospe per tutti | ⚔️ | 1,22 |
| Offre la casa | ✨ | 1,18 |
| Allergica al finocchietto | ⚔️ | 1,15 |
| Tritacarne | ⚔️ | 1,14 |
| Benedizione | 🛡️ | 1,12 |
| Non sbaglio mai | 🔵 | 0,82 |
| La vetrina della collezione | ✨ | 0,73 |
| Volo infuocato | ⚔️ | 0,69 |
| Anima della festa | ✨ | 0,66 |
| Sparecchio | ⚔️ | 0,66 |
| Manca 'o sale | ⚔️ | 0,64 |
| Vento | ⚔️ | 0,56 |
| Giro aperto | ⚔️ | 0,49 |
| La tomacella | ⚔️ | 0,48 |
| Gli occhi 'nguoll | ⚔️ | 0,47 |
| Urla | ⚔️ | 0,44 |
| Il mio corpo che cambia | ✨ | 0,39 |
| Patate al forno | ✨ | 0,39 |
| Cucina per 200 | ✨ | 0,36 |
| Doppio turno | ✨ | 0,35 |
| Medico in famiglia | 🔵 | 0,27 |
| Il bastone | ⚔️ | 0,25 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,18 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 4582 | 3132 | 1772 | 36% |
| Si incanta | 4215 | 2897 | 1608 | 36% |
| Schietta | 4114 | 2785 | 1613 | 37% |
| Versa il vino | 3023 | 2125 | 1257 | 37% |
| Ti chiamo un attimo… | 2788 | 1868 | 1126 | 38% |
| Bisiniss | 2595 | 1938 | 855 | 31% |
| Parla parla parla | 2406 | 1746 | 857 | 33% |
| Smash | 2396 | 1708 | 941 | 36% |
| Solo per vedere comm sape | 2374 | 1801 | 792 | 31% |
| Forno a legna | 2363 | 1891 | 630 | 25% |
| Multa | 2172 | 1841 | 791 | 30% |
| Zeppata sui social | 2015 | 4571 | 817 | 15% |
| Una rospa? | 2006 | 1477 | 678 | 31% |
| Risata contagiosa | 1902 | 3879 | 1355 | 26% |
| Si canta! | 1674 | 2926 | 1509 | 34% |
| Baratto | 1475 | 1400 | 131 | 9% |
| Vertenza | 1311 | 1258 | 107 | 8% |
| Invasione di campo | 1293 | 2355 | 98 | 4% |
| Rospe per tutti | 1222 | 3183 | 163 | 5% |
| Allergica al finocchietto | 1145 | 1097 | 87 | 7% |
| Tritacarne | 1138 | 1085 | 80 | 7% |
| Volo infuocato | 692 | 1671 | 89 | 5% |
| Sparecchio | 660 | 621 | 61 | 9% |
| Manca 'o sale | 638 | 1699 | 53 | 3% |
| Vento | 558 | 415 | 165 | 28% |
| Giro aperto | 492 | 386 | 139 | 26% |
| La tomacella | 482 | 360 | 166 | 32% |
| Gli occhi 'nguoll | 468 | 348 | 155 | 31% |
| Urla | 437 | 1093 | 45 | 4% |
| Il bastone | 247 | 233 | 31 | 12% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 1246 | 0 |
| Non è colpa mia | 964 | 0 |
| Ricorso | 889 | 0 |
| Cella frigorifera | 841 | 0 |
| Non ti sento, sto suonando | 827 | 0 |
| Scudo da gladiatore | 822 | 0 |
| Non sa perdere | 814 | 0 |
| Non c'è, ha il turno | 812 | 0 |
| Ho sempre ragione io | 805 | 0 |
| Mutandoni di lana | 794 | 0 |
| Ho appena lavato a terra | 791 | 0 |
| È colpa di qualcun altro | 765 | 0 |
| Una fetta di torta? | 646 | 0 |
| Si arrabbia | 644 | 0 |
| Campari | 638 | 0 |
| Permalosa | 634 | 0 |
| Nevicava, non è potuto venire | 601 | 0 |
| Sono andato a Lioni a fa' a spesa | 583 | 0 |
| Chiusa in camera | 576 | 0 |
| Tyrion nella borsa | 562 | 0 |
| Sono a un matrimonio | 558 | 0 |
| Paesano | 557 | 0 |
| Sempre calma | 553 | 0 |
| Aglianico | 457 | 0 |
| Nuvola di fumo | 418 | 0 |
| Forse c'è, forse no | 249 | 281 |
| Taurasi | 125 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,33 |
| La Resurrezione | 2,31 |
| Carnevale di Teora | 2,32 |
| Funerale | 2,31 |
| Matrimonio | 2,28 |
| Sagra delle tomacelle | 2,29 |

Tempo di calcolo: 347.9 secondi.
