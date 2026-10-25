# La Famiglia – statistiche della simulazione (fine quando finisce il mazzo)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 48
Finite perché il mazzo personaggi è finito (invece che per i punti): 1000

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 147,2 | 73,6 | 56–324 | 49,6 | 38,4 | 45% · 55% |
| 3 | 250 | 139,2 | 46,4 | 63–279 | 34,7 | 24,4 | 36% · 26% · 38% |
| 4 | 250 | 135,6 | 33,9 | 72–232 | 27,0 | 18,0 | 27% · 27% · 24% · 23% |
| 5 | 250 | 123,7 | 24,7 | 75–210 | 20,7 | 13,2 | 22% · 21% · 24% · 15% · 18% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,72), Generoso 1 (1,36), Generoso 3 (1,24)
- Carte che sembrano **più deboli** (≤ 0,8): Sara e Giuseppe 3 (0,78), Checca 1 (0,79)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): nessuna

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,27 | 26% | 262 | 1,94 | 1,36 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,43 | 41% | 402 | 1,66 | 1,17 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,59 | 57% | 560 | 1,66 | 1,17 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,41 | 40% | 399 | 1,53 | 1,08 |
| Christian | ✨ | Coppia | 0,60 | 55% | 546 | 1,51 | 1,07 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,56 | 54% | 536 | 1,48 | 1,05 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,50 | 47% | 472 | 1,47 | 1,04 |
| Nonno Antonio 1 | 🔵 | 12 | 0,35 | 34% | 339 | 1,47 | 1,04 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,61 | 57% | 566 | 1,47 | 1,03 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,52 | 50% | 507 | 1,46 | 1,03 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,61 | 56% | 556 | 1,46 | 1,03 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,51 | 48% | 468 | 1,45 | 1,02 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,58 | 54% | 538 | 1,44 | 1,01 |
| Marika 1 | 🛡️ | Coppia | 0,58 | 55% | 539 | 1,41 | 0,99 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,67 | 62% | 606 | 1,39 | 0,98 |
| Gerardina 1 | 🛡️ | Coppia | 0,57 | 54% | 532 | 1,38 | 0,97 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,79 | 74% | 732 | 1,35 | 0,95 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,66 | 59% | 591 | 1,35 | 0,95 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,50 | 48% | 480 | 1,34 | 0,94 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,65 | 63% | 627 | 1,33 | 0,94 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,67 | 62% | 617 | 1,32 | 0,93 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,56 | 53% | 516 | 1,31 | 0,92 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,59 | 55% | 553 | 1,30 | 0,92 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,62 | 58% | 567 | 1,30 | 0,91 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,50 | 47% | 469 | 1,23 | 0,87 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,61 | 57% | 564 | 1,18 | 0,83 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,65 | 60% | 601 | 1,13 | 0,79 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,49 | 47% | 468 | 1,73 | 1,18 |
| Alessia | ✨ | 3 carte pari | 0,52 | 49% | 494 | 1,72 | 1,18 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,46 | 44% | 434 | 1,61 | 1,10 |
| Roberta 2 | 🛡️ | Tris | 0,35 | 34% | 342 | 1,58 | 1,08 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,67 | 62% | 618 | 1,58 | 1,08 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,50 | 47% | 475 | 1,58 | 1,08 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,73 | 69% | 682 | 1,57 | 1,07 |
| Checca 2 | ✨ | 123 | 0,30 | 29% | 295 | 1,57 | 1,07 |
| Nonno Salvatore 2 | ✨ | Tris | 0,34 | 33% | 336 | 1,55 | 1,06 |
| Donato | 🛡️ | Scala da 3 | 0,43 | 41% | 404 | 1,53 | 1,05 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,45 | 42% | 415 | 1,53 | 1,04 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,53 | 50% | 496 | 1,52 | 1,04 |
| Marika 2 | 🛡️ | Scala da 3 | 0,44 | 42% | 415 | 1,51 | 1,03 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,47 | 44% | 438 | 1,49 | 1,02 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,44 | 42% | 408 | 1,49 | 1,02 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,63 | 60% | 584 | 1,48 | 1,01 |
| Donatina 2 | ✨ | Scala da 3 | 0,48 | 45% | 449 | 1,47 | 1,00 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,45 | 42% | 416 | 1,44 | 0,99 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,44 | 42% | 420 | 1,44 | 0,98 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,52 | 49% | 488 | 1,42 | 0,97 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,48 | 45% | 444 | 1,41 | 0,96 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,50 | 48% | 462 | 1,40 | 0,95 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,63 | 58% | 578 | 1,40 | 0,95 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,63 | 60% | 591 | 1,38 | 0,94 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,61 | 58% | 578 | 1,37 | 0,93 |
| Don Pasquale | 🛡️ | Tris | 0,38 | 37% | 371 | 1,35 | 0,92 |
| Greta | ⚔️ | 3 carte dispari | 0,60 | 57% | 562 | 1,34 | 0,92 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,47 | 44% | 440 | 1,33 | 0,91 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,60 | 56% | 557 | 1,31 | 0,89 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,62 | 58% | 579 | 1,30 | 0,89 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,65 | 61% | 605 | 1,29 | 0,88 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,65 | 61% | 598 | 1,20 | 0,82 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,60 | 56% | 566 | 2,47 | 1,72 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,44 | 41% | 406 | 1,77 | 1,24 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,26 | 25% | 254 | 1,62 | 1,13 |
| Annalisa 3 | ✨ | Scala da 5 | 0,24 | 23% | 230 | 1,55 | 1,08 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,45 | 43% | 435 | 1,54 | 1,07 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,38 | 36% | 356 | 1,50 | 1,05 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,35 | 34% | 333 | 1,49 | 1,04 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,49 | 47% | 467 | 1,45 | 1,01 |
| Nonno Antonio 3 | ⚔️ | 1111 | 0,13 | 12% | 152 | 1,43 | 1,00 |
| Nonno Salvatore 3 | ✨ | Poker | 0,18 | 17% | 181 | 1,40 | 0,98 |
| Roberta 3 | ⚔️ | Poker | 0,28 | 28% | 306 | 1,39 | 0,97 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,21 | 21% | 211 | 1,37 | 0,96 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,37 | 36% | 350 | 1,37 | 0,95 |
| Marika 3 | ✨ | Scala da 5 | 0,25 | 24% | 245 | 1,35 | 0,94 |
| Donatina 3 | ⚔️ | 1234 | 0,36 | 35% | 370 | 1,35 | 0,94 |
| Totò 3 | ✨ | 4 carte pari | 0,43 | 40% | 397 | 1,34 | 0,93 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,55 | 51% | 513 | 1,33 | 0,93 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,40 | 39% | 384 | 1,32 | 0,92 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,23 | 22% | 231 | 1,30 | 0,91 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,38 | 37% | 368 | 1,30 | 0,90 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,57 | 54% | 538 | 1,23 | 0,86 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,44 | 42% | 418 | 1,21 | 0,85 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,54 | 51% | 503 | 1,17 | 0,81 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,54 | 50% | 512 | 1,12 | 0,78 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 12,99 |
| Mercatino | 🔵 | 12,83 |
| Lezione di padel | 🔵 | 10,68 |
| Scaffale | ✨ | 8,54 |
| Te l'ho già detto? | ✨ | 8,38 |
| Studia il fascicolo | 🔵 | 7,57 |
| Sposta i mobili | ✨ | 6,86 |
| Burla | ⚔️ | 6,54 |
| Versa il vino | ⚔️ | 6,25 |
| Schietta | ⚔️ | 6,02 |
| Si incanta | ⚔️ | 6,01 |
| Mangia mangia mangia | ✨ | 5,92 |
| Smash | ⚔️ | 5,58 |
| Ci penso domani | ✨ | 5,45 |
| Ce l'ho io! | ✨ | 5,05 |
| Ogni cosa al suo posto | ✨ | 5,04 |
| Frigge di tutto | ✨ | 4,99 |
| Fatto in casa | ✨ | 4,74 |
| Grigliata | ✨ | 4,57 |
| Frutta e verdura! | ✨ | 4,52 |
| Ti chiamo un attimo… | ⚔️ | 4,22 |
| Vertenza | ⚔️ | 4,21 |
| Brace accesa | ✨ | 4,13 |
| Pranzo a domicilio | ✨ | 4,07 |
| Bisiniss | ⚔️ | 4,07 |
| Solo per vedere comm sape | ⚔️ | 3,98 |
| Baratto | ⚔️ | 3,90 |
| Forno a legna | ⚔️ | 3,84 |
| Parla parla parla | ⚔️ | 3,84 |
| Ho tanta fame | ✨ | 3,37 |
| Zeppata sui social | ⚔️ | 3,25 |
| Multa | ⚔️ | 3,16 |
| L'ho già detto | ✨ | 3,03 |
| Risata contagiosa | ⚔️ | 2,92 |
| Si canta! | ⚔️ | 2,89 |
| Sparecchio | ⚔️ | 2,76 |
| Offre la casa | ✨ | 2,60 |
| Nuvola di fumo | 🛡️ | 2,56 |
| Invasione di campo | ⚔️ | 2,51 |
| Una rospa? | ⚔️ | 2,50 |
| Tritacarne | ⚔️ | 2,49 |
| Rospe per tutti | ⚔️ | 2,39 |
| Colazione | ✨ | 2,38 |
| Anima della festa | ✨ | 2,14 |
| Benedizione | 🛡️ | 2,08 |
| La vetrina della collezione | ✨ | 1,91 |
| Allergica al finocchietto | ⚔️ | 1,77 |
| Vende la carne | ✨ | 1,76 |
| Manca 'o sale | ⚔️ | 1,64 |
| Volo infuocato | ⚔️ | 1,63 |
| Urla | ⚔️ | 1,26 |
| Non sbaglio mai | 🔵 | 1,06 |
| Il bastone | ⚔️ | 1,05 |
| Cucina per 200 | ✨ | 1,00 |
| Doppio turno | ✨ | 0,97 |
| Patate al forno | ✨ | 0,95 |
| Il mio corpo che cambia | ✨ | 0,89 |
| Vento | ⚔️ | 0,70 |
| La tomacella | ⚔️ | 0,64 |
| Giro aperto | ⚔️ | 0,60 |
| Gli occhi 'nguoll | ⚔️ | 0,56 |
| Medico in famiglia | 🔵 | 0,44 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,27 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 6542 | 4147 | 2938 | 41% |
| Versa il vino | 6255 | 3915 | 3260 | 45% |
| Schietta | 6019 | 3739 | 2782 | 43% |
| Si incanta | 6015 | 3900 | 2637 | 40% |
| Smash | 5581 | 3370 | 3051 | 48% |
| Ti chiamo un attimo… | 4220 | 2646 | 1946 | 42% |
| Vertenza | 4212 | 3845 | 614 | 14% |
| Bisiniss | 4068 | 2725 | 1736 | 39% |
| Solo per vedere comm sape | 3983 | 2705 | 1682 | 38% |
| Baratto | 3901 | 3554 | 566 | 14% |
| Forno a legna | 3839 | 2844 | 1315 | 32% |
| Parla parla parla | 3837 | 2553 | 1680 | 40% |
| Zeppata sui social | 3250 | 6063 | 1087 | 15% |
| Multa | 3159 | 2469 | 1339 | 35% |
| Risata contagiosa | 2925 | 4515 | 2082 | 32% |
| Si canta! | 2893 | 3721 | 2449 | 40% |
| Sparecchio | 2759 | 2388 | 569 | 19% |
| Invasione di campo | 2512 | 4074 | 182 | 4% |
| Una rospa? | 2496 | 1707 | 1029 | 38% |
| Tritacarne | 2487 | 2311 | 282 | 11% |
| Rospe per tutti | 2391 | 4545 | 430 | 9% |
| Allergica al finocchietto | 1774 | 1662 | 185 | 10% |
| Manca 'o sale | 1637 | 3018 | 145 | 5% |
| Volo infuocato | 1629 | 2899 | 293 | 9% |
| Urla | 1260 | 2180 | 153 | 7% |
| Il bastone | 1049 | 908 | 238 | 21% |
| Vento | 702 | 488 | 247 | 34% |
| La tomacella | 636 | 436 | 272 | 38% |
| Giro aperto | 603 | 445 | 214 | 32% |
| Gli occhi 'nguoll | 559 | 421 | 178 | 30% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 2545 | 0 |
| Ho sempre ragione io | 2012 | 0 |
| Una fetta di torta? | 1853 | 0 |
| Non è colpa mia | 1830 | 0 |
| È colpa di qualcun altro | 1777 | 0 |
| Non sa perdere | 1749 | 0 |
| Non ti sento, sto suonando | 1679 | 0 |
| Permalosa | 1677 | 0 |
| Ricorso | 1672 | 0 |
| Ho appena lavato a terra | 1648 | 0 |
| Scudo da gladiatore | 1643 | 0 |
| Cella frigorifera | 1621 | 0 |
| Si arrabbia | 1614 | 0 |
| Non c'è, ha il turno | 1608 | 0 |
| Mutandoni di lana | 1569 | 0 |
| Chiusa in camera | 1281 | 0 |
| Nuvola di fumo | 1069 | 0 |
| Sempre calma | 944 | 0 |
| Tyrion nella borsa | 931 | 0 |
| Nevicava, non è potuto venire | 755 | 0 |
| Campari | 753 | 0 |
| Sono andato a Lioni a fa' a spesa | 724 | 0 |
| Paesano | 684 | 0 |
| Sono a un matrimonio | 667 | 0 |
| Aglianico | 587 | 0 |
| Forse c'è, forse no | 495 | 479 |
| Taurasi | 194 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,79 |
| La Resurrezione | 2,78 |
| Carnevale di Teora | 2,79 |
| Funerale | 2,77 |
| Matrimonio | 2,77 |
| Sagra delle tomacelle | 2,78 |

Tempo di calcolo: 280.5 secondi.
