# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 43
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 61,1 | 30,6 | 34–114 | 21,2 | 17,3 | 45% · 55% |
| 3 | 250 | 88,6 | 29,5 | 48–153 | 21,2 | 15,9 | 34% · 31% · 36% |
| 4 | 250 | 112,0 | 28,0 | 64–192 | 21,1 | 14,8 | 23% · 27% · 27% · 24% |
| 5 | 250 | 135,6 | 27,1 | 80–215 | 21,1 | 14,0 | 24% · 19% · 22% · 19% · 16% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Generoso 2 (1,37), Generoso 1 (1,36), Nonno Salvatore 2 (1,32), Giuseppe 3 (1,32), Generoso 3 (1,27), Alessia (1,26), Nonno Nicola 1 (1,24), Antonio 1 (1,23)
- Carte che sembrano **più deboli** (≤ 0,8): Checca 1 (0,65), Zio Salvatore 2 (0,72), Rocky (0,75), Donatina 2 (0,76), Zio Salvatore 1 (0,78), Don Pasquale (0,80), Maddalena 1 (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (9%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,19 | 18% | 185 | 1,70 | 1,36 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,50 | 49% | 483 | 1,55 | 1,24 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,45 | 44% | 439 | 1,54 | 1,23 |
| Christian | ✨ | Coppia | 0,47 | 45% | 445 | 1,49 | 1,19 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,32 | 31% | 308 | 1,42 | 1,13 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,45 | 44% | 434 | 1,41 | 1,13 |
| Nonno Antonio 1 | 🔵 | 12 | 0,27 | 27% | 273 | 1,41 | 1,12 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,44 | 43% | 433 | 1,32 | 1,05 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,40 | 39% | 394 | 1,31 | 1,05 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,38 | 38% | 371 | 1,31 | 1,04 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,56 | 54% | 539 | 1,29 | 1,03 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,44 | 43% | 426 | 1,29 | 1,03 |
| Marika 1 | 🛡️ | Coppia | 0,43 | 41% | 410 | 1,25 | 1,00 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,41 | 40% | 400 | 1,24 | 0,99 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,45 | 44% | 441 | 1,24 | 0,99 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,31 | 30% | 306 | 1,23 | 0,98 |
| Gerardina 1 | 🛡️ | Coppia | 0,45 | 44% | 437 | 1,21 | 0,97 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,41 | 41% | 401 | 1,20 | 0,96 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,48 | 46% | 460 | 1,16 | 0,92 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,51 | 49% | 490 | 1,15 | 0,92 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,47 | 46% | 462 | 1,11 | 0,89 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,52 | 51% | 510 | 1,08 | 0,86 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,51 | 49% | 488 | 1,08 | 0,86 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,38 | 37% | 374 | 1,06 | 0,85 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,48 | 47% | 467 | 1,00 | 0,80 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,34 | 34% | 340 | 0,98 | 0,78 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,49 | 47% | 470 | 0,82 | 0,65 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,37 | 37% | 359 | 1,83 | 1,37 |
| Nonno Salvatore 2 | ✨ | Tris | 0,24 | 24% | 237 | 1,77 | 1,32 |
| Alessia | ✨ | 3 carte pari | 0,39 | 39% | 394 | 1,69 | 1,26 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,37 | 37% | 358 | 1,59 | 1,19 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,51 | 50% | 501 | 1,50 | 1,12 |
| Roberta 2 | 🛡️ | Tris | 0,28 | 27% | 263 | 1,49 | 1,11 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,38 | 38% | 372 | 1,49 | 1,11 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,40 | 38% | 381 | 1,45 | 1,09 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 331 | 1,44 | 1,07 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,47 | 46% | 455 | 1,43 | 1,07 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,47 | 47% | 463 | 1,43 | 1,07 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,34 | 33% | 324 | 1,43 | 1,07 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,32 | 31% | 311 | 1,42 | 1,06 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,38 | 37% | 371 | 1,42 | 1,06 |
| Donato | 🛡️ | Scala da 3 | 0,32 | 32% | 319 | 1,37 | 1,02 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,34 | 34% | 329 | 1,37 | 1,02 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,33 | 32% | 322 | 1,36 | 1,02 |
| Marika 2 | 🛡️ | Scala da 3 | 0,35 | 34% | 344 | 1,35 | 1,01 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,35 | 34% | 339 | 1,35 | 1,01 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,36 | 36% | 359 | 1,23 | 0,92 |
| Greta | ⚔️ | 3 carte dispari | 0,46 | 45% | 448 | 1,22 | 0,91 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,34 | 34% | 335 | 1,20 | 0,90 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,46 | 46% | 457 | 1,20 | 0,89 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,44 | 43% | 421 | 1,20 | 0,89 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,48 | 47% | 466 | 1,18 | 0,88 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,42 | 41% | 410 | 1,15 | 0,86 |
| Checca 2 | ✨ | 123 | 0,20 | 20% | 205 | 1,12 | 0,84 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,46 | 45% | 451 | 1,11 | 0,83 |
| Don Pasquale | 🛡️ | Tris | 0,27 | 27% | 265 | 1,07 | 0,80 |
| Donatina 2 | ✨ | Scala da 3 | 0,36 | 36% | 355 | 1,02 | 0,76 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,49 | 48% | 476 | 1,00 | 0,75 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,51 | 49% | 490 | 0,96 | 0,72 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,45 | 45% | 446 | 2,20 | 1,32 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,32 | 32% | 309 | 2,13 | 1,27 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,17 | 17% | 168 | 2,00 | 1,20 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 14% | 145 | 1,90 | 1,14 |
| Roberta 3 | ⚔️ | Poker | 0,16 | 16% | 182 | 1,85 | 1,11 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,27 | 27% | 283 | 1,80 | 1,08 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,26 | 26% | 260 | 1,79 | 1,07 |
| Marika 3 | ✨ | Scala da 5 | 0,15 | 15% | 155 | 1,77 | 1,06 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,26 | 26% | 260 | 1,72 | 1,03 |
| Nonno Salvatore 3 | ✨ | Poker | 0,10 | 10% | 104 | 1,69 | 1,01 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,36 | 36% | 360 | 1,66 | 1,00 |
| Annalisa 3 | ✨ | Scala da 5 | 0,17 | 17% | 166 | 1,61 | 0,97 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,15 | 15% | 148 | 1,59 | 0,95 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,35 | 34% | 341 | 1,57 | 0,94 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,40 | 39% | 396 | 1,54 | 0,92 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,29 | 28% | 289 | 1,54 | 0,92 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,30 | 30% | 294 | 1,53 | 0,91 |
| Donatina 3 | ⚔️ | 1234 | 0,20 | 20% | 209 | 1,51 | 0,90 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,10 | 9% | 107 | 1,50 | 0,90 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,27 | 26% | 261 | 1,50 | 0,90 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,28 | 27% | 271 | 1,46 | 0,87 |
| Totò 3 | ✨ | 4 carte pari | 0,33 | 32% | 318 | 1,45 | 0,87 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,42 | 42% | 413 | 1,40 | 0,84 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,38 | 38% | 378 | 1,38 | 0,83 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Mercatino | 🔵 | 6,24 |
| Ricetta | ✨ | 6,18 |
| Sposta i mobili | ✨ | 5,67 |
| Lezione di padel | 🔵 | 5,01 |
| Te l'ho già detto? | ✨ | 4,81 |
| Burla | ⚔️ | 4,62 |
| Scaffale | ✨ | 4,28 |
| Si incanta | ⚔️ | 4,22 |
| Schietta | ⚔️ | 4,15 |
| Studia il fascicolo | 🔵 | 3,94 |
| Ci penso domani | ✨ | 3,77 |
| Ogni cosa al suo posto | ✨ | 3,43 |
| Versa il vino | ⚔️ | 3,06 |
| Frutta e verdura! | ✨ | 2,91 |
| Ti chiamo un attimo… | ⚔️ | 2,82 |
| Mangia mangia mangia | ✨ | 2,68 |
| Bisiniss | ⚔️ | 2,63 |
| Pranzo a domicilio | ✨ | 2,51 |
| Parla parla parla | ⚔️ | 2,44 |
| Smash | ⚔️ | 2,42 |
| Solo per vedere comm sape | ⚔️ | 2,42 |
| Forno a legna | ⚔️ | 2,39 |
| Ce l'ho io! | ✨ | 2,38 |
| Frigge di tutto | ✨ | 2,35 |
| Fatto in casa | ✨ | 2,32 |
| Multa | ⚔️ | 2,18 |
| Grigliata | ✨ | 2,11 |
| Ho tanta fame | ✨ | 2,07 |
| Zeppata sui social | ⚔️ | 2,02 |
| Una rospa? | ⚔️ | 1,98 |
| Risata contagiosa | ⚔️ | 1,89 |
| Brace accesa | ✨ | 1,75 |
| Si canta! | ⚔️ | 1,65 |
| Nuvola di fumo | 🛡️ | 1,54 |
| Baratto | ⚔️ | 1,48 |
| Vende la carne | ✨ | 1,45 |
| Colazione | ✨ | 1,39 |
| L'ho già detto | ✨ | 1,33 |
| Invasione di campo | ⚔️ | 1,31 |
| Rospe per tutti | ⚔️ | 1,24 |
| Offre la casa | ✨ | 1,15 |
| Tritacarne | ⚔️ | 1,15 |
| Allergica al finocchietto | ⚔️ | 1,15 |
| Vertenza | ⚔️ | 1,15 |
| Benedizione | 🛡️ | 1,07 |
| Non sbaglio mai | 🔵 | 0,85 |
| La vetrina della collezione | ✨ | 0,78 |
| Volo infuocato | ⚔️ | 0,74 |
| Sparecchio | ⚔️ | 0,67 |
| Manca 'o sale | ⚔️ | 0,65 |
| Anima della festa | ✨ | 0,65 |
| Vento | ⚔️ | 0,55 |
| Giro aperto | ⚔️ | 0,50 |
| La tomacella | ⚔️ | 0,48 |
| Gli occhi 'nguoll | ⚔️ | 0,47 |
| Urla | ⚔️ | 0,43 |
| Il mio corpo che cambia | ✨ | 0,39 |
| Patate al forno | ✨ | 0,39 |
| Doppio turno | ✨ | 0,36 |
| Cucina per 200 | ✨ | 0,35 |
| Medico in famiglia | 🔵 | 0,27 |
| Il bastone | ⚔️ | 0,24 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,18 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 4617 | 3181 | 1757 | 36% |
| Si incanta | 4218 | 2926 | 1583 | 35% |
| Schietta | 4146 | 2812 | 1626 | 37% |
| Versa il vino | 3059 | 2154 | 1269 | 37% |
| Ti chiamo un attimo… | 2824 | 1915 | 1125 | 37% |
| Bisiniss | 2629 | 1969 | 851 | 30% |
| Parla parla parla | 2435 | 1776 | 845 | 32% |
| Smash | 2419 | 1734 | 937 | 35% |
| Solo per vedere comm sape | 2415 | 1826 | 793 | 30% |
| Forno a legna | 2387 | 1906 | 638 | 25% |
| Multa | 2178 | 1854 | 801 | 30% |
| Zeppata sui social | 2023 | 4595 | 839 | 15% |
| Una rospa? | 1983 | 1458 | 685 | 32% |
| Risata contagiosa | 1892 | 3806 | 1355 | 26% |
| Si canta! | 1654 | 2846 | 1511 | 35% |
| Baratto | 1478 | 1413 | 119 | 8% |
| Invasione di campo | 1309 | 2358 | 115 | 5% |
| Rospe per tutti | 1242 | 3277 | 169 | 5% |
| Tritacarne | 1151 | 1087 | 92 | 8% |
| Allergica al finocchietto | 1147 | 1110 | 79 | 7% |
| Vertenza | 1146 | 1102 | 87 | 7% |
| Volo infuocato | 743 | 1808 | 97 | 5% |
| Sparecchio | 666 | 625 | 70 | 10% |
| Manca 'o sale | 654 | 1724 | 56 | 3% |
| Vento | 552 | 416 | 163 | 28% |
| Giro aperto | 497 | 386 | 142 | 27% |
| La tomacella | 485 | 355 | 171 | 33% |
| Gli occhi 'nguoll | 468 | 346 | 153 | 31% |
| Urla | 427 | 1073 | 48 | 4% |
| Il bastone | 242 | 230 | 25 | 10% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 1239 | 0 |
| Non è colpa mia | 957 | 0 |
| Ricorso | 867 | 0 |
| Scudo da gladiatore | 853 | 0 |
| Cella frigorifera | 846 | 0 |
| Non sa perdere | 845 | 0 |
| Non ti sento, sto suonando | 823 | 0 |
| Non c'è, ha il turno | 809 | 0 |
| Mutandoni di lana | 806 | 0 |
| Ho sempre ragione io | 776 | 0 |
| Ho appena lavato a terra | 765 | 0 |
| È colpa di qualcun altro | 744 | 0 |
| Permalosa | 668 | 0 |
| Una fetta di torta? | 637 | 0 |
| Si arrabbia | 637 | 0 |
| Campari | 628 | 0 |
| Nevicava, non è potuto venire | 598 | 0 |
| Sono andato a Lioni a fa' a spesa | 596 | 0 |
| Chiusa in camera | 591 | 0 |
| Sempre calma | 568 | 0 |
| Paesano | 567 | 0 |
| Tyrion nella borsa | 558 | 0 |
| Sono a un matrimonio | 548 | 0 |
| Aglianico | 465 | 0 |
| Nuvola di fumo | 428 | 0 |
| Forse c'è, forse no | 258 | 263 |
| Taurasi | 124 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,32 |
| La Resurrezione | 2,30 |
| Carnevale di Teora | 2,31 |
| Funerale | 2,30 |
| Matrimonio | 2,28 |
| Sagra delle tomacelle | 2,30 |

Tempo di calcolo: 337.1 secondi.
