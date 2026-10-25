# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 39
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 60,1 | 30,1 | 34–108 | 21,3 | 17,4 | 48% · 52% |
| 3 | 250 | 85,5 | 28,5 | 45–144 | 21,3 | 15,8 | 32% · 31% · 37% |
| 4 | 250 | 110,4 | 27,6 | 64–244 | 21,1 | 14,9 | 29% · 26% · 23% · 22% |
| 5 | 250 | 131,5 | 26,3 | 70–225 | 21,4 | 13,9 | 24% · 21% · 24% · 17% · 15% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Nonno Nicola 1 (1,39), Alessia (1,35), Claudia 1 (1,35), Generoso 2 (1,34), Giuseppe 3 (1,31), Generoso 1 (1,28), Generoso 3 (1,28), Antonio 1 (1,25)
- Carte che sembrano **più deboli** (≤ 0,8): Checca 1 (0,62), Zio Salvatore 2 (0,73), Maddalena 1 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (9%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,48 | 46% | 461 | 1,76 | 1,39 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,31 | 30% | 296 | 1,70 | 1,35 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,17 | 17% | 167 | 1,61 | 1,28 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,46 | 44% | 440 | 1,58 | 1,25 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,44 | 43% | 432 | 1,43 | 1,13 |
| Christian | ✨ | Coppia | 0,44 | 43% | 426 | 1,37 | 1,08 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,41 | 41% | 402 | 1,35 | 1,07 |
| Nonno Antonio 1 | 🔵 | 12 | 0,27 | 26% | 265 | 1,34 | 1,06 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,38 | 37% | 372 | 1,33 | 1,06 |
| Marika 1 | 🛡️ | Coppia | 0,43 | 41% | 408 | 1,31 | 1,03 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,44 | 43% | 430 | 1,26 | 1,00 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,54 | 53% | 525 | 1,24 | 0,98 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,43 | 43% | 423 | 1,23 | 0,97 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,30 | 29% | 294 | 1,23 | 0,97 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,44 | 43% | 427 | 1,22 | 0,97 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,40 | 40% | 395 | 1,19 | 0,94 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,47 | 46% | 456 | 1,19 | 0,94 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,35 | 35% | 347 | 1,17 | 0,93 |
| Gerardina 1 | 🛡️ | Coppia | 0,41 | 41% | 405 | 1,16 | 0,92 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,53 | 51% | 510 | 1,16 | 0,92 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,49 | 47% | 471 | 1,15 | 0,91 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,33 | 33% | 327 | 1,12 | 0,89 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,37 | 36% | 364 | 1,09 | 0,86 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,49 | 48% | 469 | 1,08 | 0,85 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,45 | 44% | 439 | 1,05 | 0,83 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,48 | 46% | 457 | 1,00 | 0,79 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,48 | 47% | 472 | 0,79 | 0,62 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Alessia | ✨ | 3 carte pari | 0,40 | 40% | 402 | 1,80 | 1,35 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,37 | 36% | 354 | 1,78 | 1,34 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,37 | 36% | 355 | 1,49 | 1,12 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,50 | 49% | 486 | 1,47 | 1,11 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,34 | 33% | 324 | 1,43 | 1,08 |
| Marika 2 | 🛡️ | Scala da 3 | 0,34 | 33% | 326 | 1,43 | 1,07 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,48 | 47% | 462 | 1,42 | 1,07 |
| Nonno Salvatore 2 | ✨ | Tris | 0,24 | 24% | 239 | 1,42 | 1,07 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,47 | 46% | 456 | 1,41 | 1,06 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,39 | 38% | 380 | 1,41 | 1,06 |
| Donato | 🛡️ | Scala da 3 | 0,32 | 31% | 311 | 1,41 | 1,06 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,36 | 36% | 359 | 1,40 | 1,05 |
| Roberta 2 | 🛡️ | Tris | 0,26 | 25% | 250 | 1,39 | 1,04 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,36 | 35% | 347 | 1,39 | 1,04 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,33 | 32% | 317 | 1,38 | 1,04 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,32 | 32% | 312 | 1,35 | 1,02 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,33 | 33% | 326 | 1,32 | 0,99 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,31 | 31% | 305 | 1,31 | 0,99 |
| Greta | ⚔️ | 3 carte dispari | 0,44 | 44% | 430 | 1,30 | 0,97 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,44 | 44% | 437 | 1,28 | 0,96 |
| Don Pasquale | 🛡️ | Tris | 0,27 | 26% | 265 | 1,26 | 0,95 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,34 | 34% | 339 | 1,25 | 0,94 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,45 | 44% | 432 | 1,25 | 0,94 |
| Checca 2 | ✨ | 123 | 0,18 | 18% | 186 | 1,24 | 0,93 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,40 | 39% | 390 | 1,22 | 0,92 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,47 | 46% | 459 | 1,19 | 0,90 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,32 | 32% | 315 | 1,16 | 0,87 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,37 | 37% | 367 | 1,15 | 0,86 |
| Donatina 2 | ✨ | Scala da 3 | 0,33 | 33% | 328 | 1,11 | 0,84 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,46 | 45% | 446 | 1,11 | 0,83 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,47 | 46% | 455 | 1,09 | 0,82 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,49 | 47% | 470 | 0,97 | 0,73 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,45 | 44% | 438 | 2,17 | 1,31 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,32 | 31% | 308 | 2,12 | 1,28 |
| Nonno Salvatore 3 | ✨ | Poker | 0,10 | 10% | 108 | 1,92 | 1,16 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,17 | 17% | 166 | 1,88 | 1,13 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 14% | 137 | 1,87 | 1,13 |
| Roberta 3 | ⚔️ | Poker | 0,17 | 17% | 186 | 1,83 | 1,10 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,28 | 27% | 283 | 1,81 | 1,09 |
| Marika 3 | ✨ | Scala da 5 | 0,15 | 15% | 148 | 1,80 | 1,08 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,35 | 35% | 354 | 1,75 | 1,06 |
| Annalisa 3 | ✨ | Scala da 5 | 0,16 | 16% | 162 | 1,69 | 1,02 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 240 | 1,64 | 0,99 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,09 | 9% | 106 | 1,63 | 0,99 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,27 | 27% | 272 | 1,62 | 0,98 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,26 | 26% | 254 | 1,59 | 0,96 |
| Donatina 3 | ⚔️ | 1234 | 0,22 | 22% | 221 | 1,55 | 0,94 |
| Totò 3 | ✨ | 4 carte pari | 0,31 | 30% | 295 | 1,51 | 0,91 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,39 | 38% | 382 | 1,49 | 0,90 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,36 | 36% | 352 | 1,49 | 0,90 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,28 | 28% | 274 | 1,46 | 0,88 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,38 | 38% | 375 | 1,42 | 0,86 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,14 | 14% | 143 | 1,42 | 0,86 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,30 | 29% | 293 | 1,41 | 0,85 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,26 | 26% | 270 | 1,38 | 0,83 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,41 | 41% | 407 | 1,34 | 0,81 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Mercatino | 🔵 | 5,97 |
| Ricetta | ✨ | 5,85 |
| Sposta i mobili | ✨ | 5,38 |
| Lezione di padel | 🔵 | 4,72 |
| Te l'ho già detto? | ✨ | 4,68 |
| Burla | ⚔️ | 4,55 |
| Si incanta | ⚔️ | 4,14 |
| Scaffale | ✨ | 4,13 |
| Schietta | ⚔️ | 3,99 |
| Studia il fascicolo | 🔵 | 3,72 |
| Ci penso domani | ✨ | 3,62 |
| Ogni cosa al suo posto | ✨ | 3,36 |
| Versa il vino | ⚔️ | 2,90 |
| Frutta e verdura! | ✨ | 2,89 |
| Ti chiamo un attimo… | ⚔️ | 2,67 |
| Mangia mangia mangia | ✨ | 2,53 |
| Bisiniss | ⚔️ | 2,49 |
| Pranzo a domicilio | ✨ | 2,39 |
| Parla parla parla | ⚔️ | 2,33 |
| Solo per vedere comm sape | ⚔️ | 2,31 |
| Forno a legna | ⚔️ | 2,30 |
| Smash | ⚔️ | 2,29 |
| Frigge di tutto | ✨ | 2,29 |
| Ce l'ho io! | ✨ | 2,23 |
| Fatto in casa | ✨ | 2,20 |
| Multa | ⚔️ | 2,09 |
| Grigliata | ✨ | 2,02 |
| Ho tanta fame | ✨ | 2,01 |
| Zeppata sui social | ⚔️ | 1,98 |
| Una rospa? | ⚔️ | 1,90 |
| Risata contagiosa | ⚔️ | 1,82 |
| Brace accesa | ✨ | 1,72 |
| Si canta! | ⚔️ | 1,60 |
| Nuvola di fumo | 🛡️ | 1,50 |
| Baratto | ⚔️ | 1,44 |
| Vende la carne | ✨ | 1,37 |
| Colazione | ✨ | 1,36 |
| L'ho già detto | ✨ | 1,30 |
| Vertenza | ⚔️ | 1,27 |
| Invasione di campo | ⚔️ | 1,25 |
| Rospe per tutti | ⚔️ | 1,18 |
| Tritacarne | ⚔️ | 1,12 |
| Offre la casa | ✨ | 1,11 |
| Allergica al finocchietto | ⚔️ | 1,10 |
| Benedizione | 🛡️ | 1,06 |
| Non sbaglio mai | 🔵 | 0,80 |
| La vetrina della collezione | ✨ | 0,72 |
| Volo infuocato | ⚔️ | 0,66 |
| Anima della festa | ✨ | 0,65 |
| Sparecchio | ⚔️ | 0,64 |
| Manca 'o sale | ⚔️ | 0,62 |
| Vento | ⚔️ | 0,56 |
| Giro aperto | ⚔️ | 0,49 |
| La tomacella | ⚔️ | 0,47 |
| Gli occhi 'nguoll | ⚔️ | 0,46 |
| Urla | ⚔️ | 0,42 |
| Il mio corpo che cambia | ✨ | 0,38 |
| Patate al forno | ✨ | 0,36 |
| Cucina per 200 | ✨ | 0,34 |
| Doppio turno | ✨ | 0,33 |
| Medico in famiglia | 🔵 | 0,26 |
| Il bastone | ⚔️ | 0,23 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,17 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 4554 | 3115 | 1735 | 36% |
| Si incanta | 4144 | 2831 | 1601 | 36% |
| Schietta | 3992 | 2696 | 1568 | 37% |
| Versa il vino | 2905 | 2047 | 1203 | 37% |
| Ti chiamo un attimo… | 2673 | 1801 | 1077 | 37% |
| Bisiniss | 2487 | 1845 | 839 | 31% |
| Parla parla parla | 2334 | 1687 | 829 | 33% |
| Solo per vedere comm sape | 2307 | 1767 | 732 | 29% |
| Forno a legna | 2304 | 1824 | 620 | 25% |
| Smash | 2289 | 1617 | 894 | 36% |
| Multa | 2090 | 1820 | 736 | 29% |
| Zeppata sui social | 1975 | 4525 | 804 | 15% |
| Una rospa? | 1902 | 1410 | 651 | 32% |
| Risata contagiosa | 1824 | 3724 | 1283 | 26% |
| Si canta! | 1599 | 2772 | 1407 | 34% |
| Baratto | 1444 | 1374 | 127 | 8% |
| Vertenza | 1272 | 1217 | 103 | 8% |
| Invasione di campo | 1247 | 2281 | 103 | 4% |
| Rospe per tutti | 1184 | 3082 | 160 | 5% |
| Tritacarne | 1121 | 1074 | 74 | 6% |
| Allergica al finocchietto | 1105 | 1062 | 85 | 7% |
| Volo infuocato | 662 | 1601 | 81 | 5% |
| Sparecchio | 637 | 597 | 62 | 9% |
| Manca 'o sale | 621 | 1644 | 51 | 3% |
| Vento | 558 | 416 | 164 | 28% |
| Giro aperto | 491 | 382 | 143 | 27% |
| La tomacella | 475 | 361 | 167 | 32% |
| Gli occhi 'nguoll | 456 | 340 | 145 | 30% |
| Urla | 423 | 1051 | 45 | 4% |
| Il bastone | 234 | 222 | 25 | 10% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 1220 | 0 |
| Non è colpa mia | 916 | 0 |
| Cella frigorifera | 803 | 0 |
| Ricorso | 801 | 0 |
| Non sa perdere | 790 | 0 |
| Non ti sento, sto suonando | 790 | 0 |
| Scudo da gladiatore | 781 | 0 |
| Non c'è, ha il turno | 776 | 0 |
| Ho appena lavato a terra | 758 | 0 |
| Mutandoni di lana | 757 | 0 |
| Ho sempre ragione io | 749 | 0 |
| È colpa di qualcun altro | 720 | 0 |
| Si arrabbia | 637 | 0 |
| Una fetta di torta? | 634 | 0 |
| Campari | 622 | 0 |
| Permalosa | 587 | 0 |
| Nevicava, non è potuto venire | 582 | 0 |
| Sempre calma | 575 | 0 |
| Sono andato a Lioni a fa' a spesa | 574 | 0 |
| Chiusa in camera | 570 | 0 |
| Paesano | 555 | 0 |
| Sono a un matrimonio | 545 | 0 |
| Tyrion nella borsa | 545 | 0 |
| Aglianico | 438 | 0 |
| Nuvola di fumo | 405 | 0 |
| Forse c'è, forse no | 261 | 255 |
| Taurasi | 123 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,27 |
| La Resurrezione | 2,27 |
| Carnevale di Teora | 2,28 |
| Funerale | 2,27 |
| Matrimonio | 2,25 |
| Sagra delle tomacelle | 2,24 |

Tempo di calcolo: 185.6 secondi.
