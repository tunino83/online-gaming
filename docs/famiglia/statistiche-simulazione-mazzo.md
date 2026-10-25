# La Famiglia – statistiche della simulazione (fine quando finisce il mazzo)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 60
Finite perché il mazzo personaggi è finito (invece che per i punti): 1000

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 143,3 | 71,6 | 56–308 | 47,2 | 36,5 | 46% · 54% |
| 3 | 250 | 141,5 | 47,2 | 63–264 | 32,5 | 23,7 | 34% · 28% · 38% |
| 4 | 250 | 136,5 | 34,1 | 72–272 | 24,8 | 17,4 | 25% · 26% · 27% · 22% |
| 5 | 250 | 123,8 | 24,8 | 75–210 | 19,1 | 12,6 | 23% · 20% · 22% · 16% · 19% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,35), Generoso 1 (1,26), Generoso 2 (1,26), Generoso 3 (1,24)
- Carte che sembrano **più deboli** (≤ 0,8): Zio Salvatore 2 (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): nessuna

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,26 | 26% | 267 | 1,68 | 1,26 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,60 | 58% | 569 | 1,57 | 1,18 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,58 | 54% | 538 | 1,50 | 1,13 |
| Christian | ✨ | Coppia | 0,59 | 54% | 533 | 1,46 | 1,09 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,49 | 47% | 470 | 1,45 | 1,09 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,56 | 53% | 524 | 1,44 | 1,08 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,40 | 38% | 374 | 1,42 | 1,07 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,60 | 57% | 564 | 1,41 | 1,06 |
| Gerardina 1 | 🛡️ | Coppia | 0,56 | 53% | 524 | 1,37 | 1,03 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,63 | 62% | 617 | 1,37 | 1,03 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,51 | 48% | 468 | 1,36 | 1,03 |
| Marika 1 | 🛡️ | Coppia | 0,56 | 52% | 514 | 1,36 | 1,02 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,62 | 58% | 576 | 1,32 | 0,99 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,76 | 72% | 709 | 1,31 | 0,98 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,68 | 62% | 609 | 1,30 | 0,98 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,42 | 40% | 402 | 1,30 | 0,98 |
| Nonno Antonio 1 | 🔵 | 12 | 0,36 | 35% | 348 | 1,29 | 0,97 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,55 | 52% | 512 | 1,28 | 0,97 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,58 | 55% | 541 | 1,27 | 0,95 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,54 | 52% | 518 | 1,26 | 0,95 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,66 | 60% | 602 | 1,26 | 0,95 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,59 | 56% | 555 | 1,19 | 0,89 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,47 | 45% | 453 | 1,18 | 0,89 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,65 | 60% | 598 | 1,18 | 0,89 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,51 | 48% | 477 | 1,16 | 0,87 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,65 | 62% | 610 | 1,10 | 0,83 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,61 | 57% | 561 | 1,10 | 0,83 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,49 | 48% | 471 | 1,74 | 1,26 |
| Alessia | ✨ | 3 carte pari | 0,51 | 49% | 487 | 1,62 | 1,17 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,48 | 46% | 454 | 1,59 | 1,15 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,46 | 44% | 435 | 1,54 | 1,12 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,70 | 67% | 659 | 1,50 | 1,08 |
| Donato | 🛡️ | Scala da 3 | 0,43 | 41% | 405 | 1,49 | 1,08 |
| Roberta 2 | 🛡️ | Tris | 0,38 | 37% | 356 | 1,49 | 1,08 |
| Marika 2 | 🛡️ | Scala da 3 | 0,44 | 42% | 418 | 1,49 | 1,08 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,45 | 43% | 430 | 1,48 | 1,07 |
| Nonno Salvatore 2 | ✨ | Tris | 0,35 | 33% | 331 | 1,47 | 1,06 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,44 | 42% | 416 | 1,46 | 1,06 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,41 | 39% | 390 | 1,43 | 1,04 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,49 | 46% | 453 | 1,43 | 1,04 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,61 | 59% | 588 | 1,42 | 1,03 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,43 | 42% | 410 | 1,42 | 1,03 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,62 | 59% | 581 | 1,40 | 1,01 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,50 | 48% | 469 | 1,37 | 0,99 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,48 | 46% | 447 | 1,34 | 0,97 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,45 | 43% | 422 | 1,34 | 0,97 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,44 | 42% | 420 | 1,32 | 0,96 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,52 | 48% | 477 | 1,31 | 0,95 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,61 | 58% | 571 | 1,30 | 0,94 |
| Checca 2 | ✨ | 123 | 0,28 | 27% | 273 | 1,28 | 0,92 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,59 | 56% | 560 | 1,27 | 0,92 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,66 | 62% | 611 | 1,26 | 0,92 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,61 | 57% | 563 | 1,26 | 0,91 |
| Donatina 2 | ✨ | Scala da 3 | 0,46 | 43% | 426 | 1,25 | 0,91 |
| Don Pasquale | 🛡️ | Tris | 0,37 | 36% | 357 | 1,25 | 0,90 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,57 | 54% | 537 | 1,23 | 0,89 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,61 | 58% | 576 | 1,22 | 0,89 |
| Greta | ⚔️ | 3 carte dispari | 0,62 | 58% | 578 | 1,12 | 0,81 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,66 | 61% | 602 | 1,10 | 0,80 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,60 | 57% | 562 | 2,05 | 1,35 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,43 | 41% | 406 | 1,89 | 1,24 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,25 | 24% | 239 | 1,69 | 1,11 |
| Roberta 3 | ⚔️ | Poker | 0,30 | 30% | 318 | 1,69 | 1,11 |
| Annalisa 3 | ✨ | Scala da 5 | 0,23 | 22% | 218 | 1,67 | 1,10 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,44 | 41% | 422 | 1,66 | 1,09 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,33 | 31% | 315 | 1,58 | 1,04 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,36 | 36% | 347 | 1,53 | 1,01 |
| Marika 3 | ✨ | Scala da 5 | 0,21 | 21% | 214 | 1,52 | 1,00 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,50 | 49% | 489 | 1,52 | 1,00 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,23 | 22% | 225 | 1,51 | 0,99 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,53 | 50% | 494 | 1,50 | 0,99 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,35 | 34% | 339 | 1,49 | 0,98 |
| Nonno Salvatore 3 | ✨ | Poker | 0,15 | 15% | 157 | 1,48 | 0,97 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,22 | 21% | 219 | 1,47 | 0,97 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,23 | 23% | 235 | 1,44 | 0,94 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,37 | 36% | 361 | 1,41 | 0,93 |
| Totò 3 | ✨ | 4 carte pari | 0,42 | 40% | 387 | 1,40 | 0,92 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,39 | 37% | 372 | 1,40 | 0,92 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,55 | 52% | 523 | 1,39 | 0,91 |
| Donatina 3 | ⚔️ | 1234 | 0,34 | 33% | 341 | 1,36 | 0,89 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,41 | 39% | 392 | 1,32 | 0,87 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,48 | 46% | 456 | 1,32 | 0,87 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,54 | 51% | 500 | 1,23 | 0,81 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 12,77 |
| Mercatino | 🔵 | 12,59 |
| Lezione di padel | 🔵 | 10,90 |
| Te l'ho già detto? | ✨ | 8,46 |
| Scaffale | ✨ | 8,40 |
| Studia il fascicolo | 🔵 | 7,47 |
| Sposta i mobili | ✨ | 6,79 |
| Burla | ⚔️ | 6,66 |
| Versa il vino | ⚔️ | 6,40 |
| Si incanta | ⚔️ | 6,26 |
| Schietta | ⚔️ | 6,04 |
| Mangia mangia mangia | ✨ | 5,91 |
| Smash | ⚔️ | 5,56 |
| Ci penso domani | ✨ | 5,39 |
| Ogni cosa al suo posto | ✨ | 5,11 |
| Ce l'ho io! | ✨ | 4,96 |
| Frigge di tutto | ✨ | 4,92 |
| Fatto in casa | ✨ | 4,60 |
| Frutta e verdura! | ✨ | 4,58 |
| Ti chiamo un attimo… | ⚔️ | 4,37 |
| Grigliata | ✨ | 4,22 |
| Bisiniss | ⚔️ | 4,14 |
| Brace accesa | ✨ | 4,07 |
| Pranzo a domicilio | ✨ | 4,04 |
| Baratto | ⚔️ | 3,92 |
| Solo per vedere comm sape | ⚔️ | 3,91 |
| Parla parla parla | ⚔️ | 3,87 |
| Forno a legna | ⚔️ | 3,69 |
| Ho tanta fame | ✨ | 3,37 |
| Zeppata sui social | ⚔️ | 3,28 |
| Multa | ⚔️ | 3,23 |
| Risata contagiosa | ⚔️ | 3,04 |
| Si canta! | ⚔️ | 3,04 |
| Vertenza | ⚔️ | 3,02 |
| L'ho già detto | ✨ | 3,00 |
| Una rospa? | ⚔️ | 2,65 |
| Nuvola di fumo | 🛡️ | 2,57 |
| Sparecchio | ⚔️ | 2,53 |
| Offre la casa | ✨ | 2,53 |
| Colazione | ✨ | 2,41 |
| Rospe per tutti | ⚔️ | 2,36 |
| Tritacarne | ⚔️ | 2,35 |
| Invasione di campo | ⚔️ | 2,30 |
| Benedizione | 🛡️ | 2,05 |
| Vende la carne | ✨ | 1,86 |
| Anima della festa | ✨ | 1,85 |
| Allergica al finocchietto | ⚔️ | 1,80 |
| La vetrina della collezione | ✨ | 1,79 |
| Il bastone | ⚔️ | 1,70 |
| Volo infuocato | ⚔️ | 1,62 |
| Manca 'o sale | ⚔️ | 1,52 |
| Urla | ⚔️ | 1,19 |
| Non sbaglio mai | 🔵 | 1,08 |
| Cucina per 200 | ✨ | 1,01 |
| Patate al forno | ✨ | 0,95 |
| Doppio turno | ✨ | 0,84 |
| Il mio corpo che cambia | ✨ | 0,81 |
| Vento | ⚔️ | 0,70 |
| La tomacella | ⚔️ | 0,63 |
| Giro aperto | ⚔️ | 0,59 |
| Gli occhi 'nguoll | ⚔️ | 0,56 |
| Medico in famiglia | 🔵 | 0,42 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,27 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 6660 | 4204 | 3048 | 42% |
| Versa il vino | 6401 | 3916 | 3383 | 46% |
| Si incanta | 6258 | 3953 | 2825 | 42% |
| Schietta | 6044 | 3777 | 2807 | 43% |
| Smash | 5562 | 3397 | 2985 | 47% |
| Ti chiamo un attimo… | 4367 | 2722 | 2026 | 43% |
| Bisiniss | 4144 | 2860 | 1694 | 37% |
| Baratto | 3924 | 3559 | 623 | 15% |
| Solo per vedere comm sape | 3908 | 2647 | 1687 | 39% |
| Parla parla parla | 3872 | 2606 | 1658 | 39% |
| Forno a legna | 3689 | 2751 | 1265 | 31% |
| Zeppata sui social | 3276 | 6104 | 1099 | 15% |
| Multa | 3232 | 2462 | 1412 | 36% |
| Risata contagiosa | 3045 | 4723 | 2166 | 31% |
| Si canta! | 3039 | 4043 | 2589 | 39% |
| Vertenza | 3020 | 2786 | 435 | 14% |
| Una rospa? | 2651 | 1833 | 1045 | 36% |
| Sparecchio | 2530 | 2259 | 446 | 16% |
| Rospe per tutti | 2360 | 4579 | 422 | 8% |
| Tritacarne | 2349 | 2159 | 276 | 11% |
| Invasione di campo | 2299 | 3762 | 167 | 4% |
| Allergica al finocchietto | 1800 | 1677 | 198 | 11% |
| Il bastone | 1702 | 1490 | 350 | 19% |
| Volo infuocato | 1620 | 2804 | 272 | 9% |
| Manca 'o sale | 1516 | 2909 | 128 | 4% |
| Urla | 1185 | 2052 | 159 | 7% |
| Vento | 700 | 485 | 251 | 34% |
| La tomacella | 628 | 440 | 253 | 37% |
| Giro aperto | 590 | 429 | 216 | 33% |
| Gli occhi 'nguoll | 561 | 393 | 210 | 35% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 2566 | 0 |
| Ho sempre ragione io | 1944 | 0 |
| Non è colpa mia | 1841 | 0 |
| Ricorso | 1817 | 0 |
| Scudo da gladiatore | 1790 | 0 |
| Una fetta di torta? | 1773 | 0 |
| È colpa di qualcun altro | 1747 | 0 |
| Non ti sento, sto suonando | 1727 | 0 |
| Ho appena lavato a terra | 1694 | 0 |
| Non c'è, ha il turno | 1689 | 0 |
| Si arrabbia | 1685 | 0 |
| Non sa perdere | 1680 | 0 |
| Cella frigorifera | 1668 | 0 |
| Permalosa | 1645 | 0 |
| Mutandoni di lana | 1633 | 0 |
| Chiusa in camera | 1337 | 0 |
| Nuvola di fumo | 1091 | 0 |
| Sempre calma | 1018 | 0 |
| Tyrion nella borsa | 966 | 0 |
| Campari | 755 | 0 |
| Nevicava, non è potuto venire | 738 | 0 |
| Sono andato a Lioni a fa' a spesa | 705 | 0 |
| Sono a un matrimonio | 691 | 0 |
| Paesano | 676 | 0 |
| Aglianico | 571 | 0 |
| Forse c'è, forse no | 468 | 493 |
| Taurasi | 180 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,81 |
| La Resurrezione | 2,79 |
| Carnevale di Teora | 2,81 |
| Funerale | 2,78 |
| Matrimonio | 2,78 |
| Sagra delle tomacelle | 2,79 |

Tempo di calcolo: 530.3 secondi.
