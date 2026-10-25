# La Famiglia – statistiche della simulazione (fine quando finisce il mazzo)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 50
Finite perché il mazzo personaggi è finito (invece che per i punti): 1000

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 144,3 | 72,2 | 56–308 | 46,2 | 36,6 | 45% · 55% |
| 3 | 250 | 143,5 | 47,8 | 63–288 | 32,3 | 23,9 | 38% · 28% · 35% |
| 4 | 250 | 136,5 | 34,1 | 76–272 | 24,7 | 17,5 | 25% · 27% · 26% · 22% |
| 5 | 250 | 123,1 | 24,6 | 75–220 | 18,9 | 12,6 | 24% · 21% · 21% · 16% · 17% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,33), Generoso 2 (1,31), Generoso 3 (1,24), Generoso 1 (1,21), Nonno Nicola 1 (1,20)
- Carte che sembrano **più deboli** (≤ 0,8): Checca 1 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): nessuna

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,28 | 26% | 266 | 1,58 | 1,21 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,62 | 58% | 579 | 1,56 | 1,20 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,58 | 55% | 543 | 1,47 | 1,13 |
| Christian | ✨ | Coppia | 0,60 | 55% | 535 | 1,46 | 1,12 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,40 | 39% | 381 | 1,39 | 1,07 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,50 | 47% | 468 | 1,38 | 1,06 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,57 | 54% | 530 | 1,37 | 1,05 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,61 | 57% | 564 | 1,35 | 1,04 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,42 | 40% | 400 | 1,34 | 1,03 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,53 | 50% | 502 | 1,34 | 1,03 |
| Marika 1 | 🛡️ | Coppia | 0,56 | 52% | 516 | 1,34 | 1,03 |
| Gerardina 1 | 🛡️ | Coppia | 0,58 | 55% | 533 | 1,33 | 1,02 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,78 | 72% | 715 | 1,30 | 1,00 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,51 | 48% | 464 | 1,28 | 0,98 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,68 | 63% | 621 | 1,28 | 0,98 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,54 | 51% | 506 | 1,28 | 0,98 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,66 | 62% | 603 | 1,26 | 0,97 |
| Nonno Antonio 1 | 🔵 | 12 | 0,35 | 34% | 347 | 1,25 | 0,96 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,57 | 54% | 532 | 1,25 | 0,96 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,64 | 59% | 584 | 1,24 | 0,95 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,61 | 57% | 567 | 1,23 | 0,94 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,68 | 62% | 614 | 1,22 | 0,94 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,64 | 62% | 615 | 1,21 | 0,93 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,51 | 48% | 476 | 1,15 | 0,88 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,47 | 46% | 460 | 1,14 | 0,88 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,63 | 59% | 581 | 1,13 | 0,87 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,66 | 61% | 599 | 1,02 | 0,79 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,48 | 47% | 462 | 1,76 | 1,31 |
| Nonno Salvatore 2 | ✨ | Tris | 0,35 | 33% | 334 | 1,60 | 1,19 |
| Alessia | ✨ | 3 carte pari | 0,51 | 49% | 484 | 1,59 | 1,19 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,71 | 67% | 663 | 1,48 | 1,10 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,44 | 42% | 413 | 1,46 | 1,09 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,49 | 46% | 463 | 1,46 | 1,09 |
| Marika 2 | 🛡️ | Scala da 3 | 0,43 | 41% | 405 | 1,46 | 1,09 |
| Roberta 2 | 🛡️ | Tris | 0,39 | 37% | 354 | 1,44 | 1,07 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,43 | 42% | 409 | 1,42 | 1,06 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,49 | 46% | 454 | 1,42 | 1,06 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,62 | 58% | 584 | 1,41 | 1,05 |
| Donato | 🛡️ | Scala da 3 | 0,43 | 41% | 410 | 1,40 | 1,04 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,64 | 60% | 587 | 1,39 | 1,03 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,47 | 45% | 434 | 1,37 | 1,02 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,44 | 42% | 411 | 1,37 | 1,02 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,48 | 46% | 449 | 1,36 | 1,01 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,44 | 42% | 410 | 1,35 | 1,01 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,43 | 40% | 396 | 1,33 | 0,99 |
| Donatina 2 | ✨ | Scala da 3 | 0,46 | 44% | 433 | 1,29 | 0,96 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,50 | 48% | 468 | 1,28 | 0,95 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,61 | 58% | 569 | 1,27 | 0,95 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,50 | 47% | 471 | 1,27 | 0,94 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,43 | 41% | 411 | 1,26 | 0,94 |
| Don Pasquale | 🛡️ | Tris | 0,38 | 37% | 370 | 1,25 | 0,93 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,60 | 56% | 560 | 1,24 | 0,92 |
| Checca 2 | ✨ | 123 | 0,28 | 27% | 274 | 1,24 | 0,92 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,62 | 58% | 567 | 1,21 | 0,90 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,61 | 57% | 573 | 1,18 | 0,88 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,65 | 61% | 603 | 1,12 | 0,84 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,65 | 60% | 594 | 1,11 | 0,83 |
| Greta | ⚔️ | 3 carte dispari | 0,61 | 58% | 566 | 1,10 | 0,82 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,58 | 54% | 542 | 1,10 | 0,82 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,59 | 57% | 561 | 1,99 | 1,33 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,42 | 40% | 392 | 1,86 | 1,24 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,24 | 23% | 233 | 1,72 | 1,15 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,36 | 35% | 347 | 1,57 | 1,05 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,34 | 33% | 336 | 1,56 | 1,04 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,35 | 34% | 338 | 1,55 | 1,03 |
| Annalisa 3 | ✨ | Scala da 5 | 0,24 | 23% | 229 | 1,54 | 1,03 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,22 | 21% | 219 | 1,54 | 1,03 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,22 | 21% | 218 | 1,54 | 1,03 |
| Marika 3 | ✨ | Scala da 5 | 0,24 | 22% | 223 | 1,53 | 1,02 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,44 | 42% | 440 | 1,49 | 0,99 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,53 | 50% | 497 | 1,48 | 0,99 |
| Roberta 3 | ⚔️ | Poker | 0,31 | 30% | 332 | 1,48 | 0,99 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,50 | 48% | 483 | 1,45 | 0,96 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,56 | 53% | 534 | 1,44 | 0,96 |
| Totò 3 | ✨ | 4 carte pari | 0,43 | 41% | 399 | 1,42 | 0,95 |
| Donatina 3 | ⚔️ | 1234 | 0,33 | 32% | 334 | 1,39 | 0,93 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,36 | 35% | 348 | 1,39 | 0,93 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,23 | 22% | 242 | 1,38 | 0,92 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,42 | 40% | 406 | 1,36 | 0,91 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,39 | 37% | 367 | 1,35 | 0,90 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,47 | 45% | 453 | 1,33 | 0,88 |
| Nonno Salvatore 3 | ✨ | Poker | 0,17 | 17% | 171 | 1,32 | 0,88 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,54 | 52% | 511 | 1,31 | 0,87 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 12,74 |
| Mercatino | 🔵 | 12,67 |
| Lezione di padel | 🔵 | 10,88 |
| Te l'ho già detto? | ✨ | 8,39 |
| Scaffale | ✨ | 8,39 |
| Studia il fascicolo | 🔵 | 7,35 |
| Sposta i mobili | ✨ | 6,85 |
| Burla | ⚔️ | 6,71 |
| Versa il vino | ⚔️ | 6,66 |
| Si incanta | ⚔️ | 6,29 |
| Schietta | ⚔️ | 6,07 |
| Mangia mangia mangia | ✨ | 6,00 |
| Smash | ⚔️ | 5,63 |
| Ci penso domani | ✨ | 5,46 |
| Ogni cosa al suo posto | ✨ | 5,19 |
| Ce l'ho io! | ✨ | 5,14 |
| Frigge di tutto | ✨ | 4,95 |
| Fatto in casa | ✨ | 4,67 |
| Frutta e verdura! | ✨ | 4,51 |
| Grigliata | ✨ | 4,46 |
| Ti chiamo un attimo… | ⚔️ | 4,43 |
| Bisiniss | ⚔️ | 4,11 |
| Pranzo a domicilio | ✨ | 4,10 |
| Brace accesa | ✨ | 4,09 |
| Baratto | ⚔️ | 3,92 |
| Parla parla parla | ⚔️ | 3,91 |
| Solo per vedere comm sape | ⚔️ | 3,81 |
| Forno a legna | ⚔️ | 3,76 |
| Ho tanta fame | ✨ | 3,33 |
| Multa | ⚔️ | 3,30 |
| Zeppata sui social | ⚔️ | 3,28 |
| Si canta! | ⚔️ | 3,00 |
| Risata contagiosa | ⚔️ | 2,99 |
| L'ho già detto | ✨ | 2,95 |
| Sparecchio | ⚔️ | 2,68 |
| Vertenza | ⚔️ | 2,62 |
| Una rospa? | ⚔️ | 2,58 |
| Nuvola di fumo | 🛡️ | 2,48 |
| Offre la casa | ✨ | 2,47 |
| Rospe per tutti | ⚔️ | 2,33 |
| Colazione | ✨ | 2,32 |
| Invasione di campo | ⚔️ | 2,32 |
| Tritacarne | ⚔️ | 2,22 |
| Benedizione | 🛡️ | 2,06 |
| Anima della festa | ✨ | 1,92 |
| Vende la carne | ✨ | 1,89 |
| La vetrina della collezione | ✨ | 1,80 |
| Allergica al finocchietto | ⚔️ | 1,74 |
| Volo infuocato | ⚔️ | 1,68 |
| Il bastone | ⚔️ | 1,68 |
| Manca 'o sale | ⚔️ | 1,55 |
| Urla | ⚔️ | 1,15 |
| Non sbaglio mai | 🔵 | 1,09 |
| Cucina per 200 | ✨ | 0,94 |
| Doppio turno | ✨ | 0,94 |
| Il mio corpo che cambia | ✨ | 0,91 |
| Patate al forno | ✨ | 0,91 |
| Vento | ⚔️ | 0,69 |
| La tomacella | ⚔️ | 0,61 |
| Giro aperto | ⚔️ | 0,61 |
| Gli occhi 'nguoll | ⚔️ | 0,57 |
| Medico in famiglia | 🔵 | 0,43 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,28 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 6709 | 4265 | 3052 | 42% |
| Versa il vino | 6658 | 4088 | 3513 | 46% |
| Si incanta | 6292 | 4028 | 2813 | 41% |
| Schietta | 6071 | 3750 | 2868 | 43% |
| Smash | 5628 | 3476 | 2974 | 46% |
| Ti chiamo un attimo… | 4427 | 2734 | 2084 | 43% |
| Bisiniss | 4106 | 2799 | 1712 | 38% |
| Baratto | 3924 | 3575 | 617 | 15% |
| Parla parla parla | 3912 | 2631 | 1681 | 39% |
| Solo per vedere comm sape | 3814 | 2624 | 1601 | 38% |
| Forno a legna | 3763 | 2780 | 1336 | 32% |
| Multa | 3297 | 2538 | 1437 | 36% |
| Zeppata sui social | 3284 | 6120 | 1138 | 16% |
| Si canta! | 3003 | 3925 | 2558 | 39% |
| Risata contagiosa | 2988 | 4632 | 2128 | 31% |
| Sparecchio | 2680 | 2392 | 466 | 16% |
| Vertenza | 2616 | 2394 | 401 | 14% |
| Una rospa? | 2576 | 1769 | 1038 | 37% |
| Rospe per tutti | 2328 | 4606 | 413 | 8% |
| Invasione di campo | 2324 | 3797 | 180 | 5% |
| Tritacarne | 2219 | 2044 | 259 | 11% |
| Allergica al finocchietto | 1738 | 1628 | 193 | 11% |
| Volo infuocato | 1683 | 3023 | 278 | 8% |
| Il bastone | 1683 | 1454 | 386 | 21% |
| Manca 'o sale | 1551 | 2918 | 122 | 4% |
| Urla | 1154 | 1957 | 155 | 7% |
| Vento | 689 | 476 | 254 | 35% |
| La tomacella | 612 | 424 | 248 | 37% |
| Giro aperto | 607 | 444 | 222 | 33% |
| Gli occhi 'nguoll | 568 | 396 | 216 | 35% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 2703 | 0 |
| Ho sempre ragione io | 1957 | 0 |
| Ricorso | 1812 | 0 |
| Non è colpa mia | 1786 | 0 |
| Non sa perdere | 1778 | 0 |
| Scudo da gladiatore | 1778 | 0 |
| È colpa di qualcun altro | 1769 | 0 |
| Una fetta di torta? | 1759 | 0 |
| Non ti sento, sto suonando | 1750 | 0 |
| Permalosa | 1711 | 0 |
| Cella frigorifera | 1677 | 0 |
| Si arrabbia | 1665 | 0 |
| Non c'è, ha il turno | 1650 | 0 |
| Ho appena lavato a terra | 1646 | 0 |
| Mutandoni di lana | 1607 | 0 |
| Chiusa in camera | 1310 | 0 |
| Nuvola di fumo | 1147 | 0 |
| Sempre calma | 1019 | 0 |
| Tyrion nella borsa | 987 | 0 |
| Campari | 755 | 0 |
| Sono andato a Lioni a fa' a spesa | 732 | 0 |
| Nevicava, non è potuto venire | 730 | 0 |
| Sono a un matrimonio | 681 | 0 |
| Paesano | 670 | 0 |
| Aglianico | 575 | 0 |
| Forse c'è, forse no | 507 | 518 |
| Taurasi | 182 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,79 |
| La Resurrezione | 2,76 |
| Carnevale di Teora | 2,80 |
| Funerale | 2,74 |
| Matrimonio | 2,72 |
| Sagra delle tomacelle | 2,77 |

Tempo di calcolo: 503.7 secondi.
