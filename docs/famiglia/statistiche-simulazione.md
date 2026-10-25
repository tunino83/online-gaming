# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **1000** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **1000** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 26
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 250 | 59,5 | 29,7 | 34–108 | 21,4 | 17,4 | 46% · 54% |
| 3 | 250 | 82,7 | 27,6 | 45–144 | 21,4 | 15,5 | 34% · 31% · 35% |
| 4 | 250 | 104,3 | 26,1 | 64–204 | 21,3 | 14,4 | 27% · 24% · 27% · 22% |
| 5 | 250 | 125,7 | 25,1 | 60–225 | 21,5 | 13,4 | 23% · 21% · 25% · 17% · 14% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Giuseppe 3 (1,71), Generoso 1 (1,37), Generoso 2 (1,35), Claudia 1 (1,32), Nonno Nicola 1 (1,31), Alessia (1,23), Generoso 3 (1,22)
- Carte che sembrano **più deboli** (≤ 0,8): Checca 1 (0,67), Maddalena 1 (0,72), Gerardina 3 (0,75), Zio Salvatore 2 (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (3%), Nonno Salvatore 3 (10%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,17 | 17% | 164 | 1,78 | 1,37 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,31 | 31% | 303 | 1,72 | 1,32 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,45 | 44% | 439 | 1,70 | 1,31 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,45 | 44% | 437 | 1,53 | 1,17 |
| Christian | ✨ | Coppia | 0,42 | 41% | 410 | 1,49 | 1,14 |
| Nonno Antonio 1 | 🔵 | 12 | 0,26 | 25% | 252 | 1,45 | 1,11 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,29 | 28% | 285 | 1,38 | 1,06 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,43 | 43% | 428 | 1,35 | 1,04 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,37 | 37% | 368 | 1,33 | 1,02 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,42 | 42% | 414 | 1,32 | 1,01 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,39 | 38% | 383 | 1,32 | 1,01 |
| Nonna Patrizia 1 | 🔵 | 2 carte con somma 10 | 0,43 | 42% | 421 | 1,31 | 1,00 |
| Marika 1 | 🛡️ | Coppia | 0,42 | 41% | 406 | 1,29 | 0,99 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,41 | 40% | 394 | 1,28 | 0,99 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,54 | 52% | 522 | 1,26 | 0,97 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,36 | 35% | 352 | 1,25 | 0,96 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,48 | 45% | 454 | 1,25 | 0,96 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,43 | 43% | 427 | 1,25 | 0,96 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,48 | 48% | 467 | 1,22 | 0,94 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,32 | 32% | 317 | 1,19 | 0,92 |
| Gerardina 1 | 🛡️ | Coppia | 0,41 | 40% | 394 | 1,18 | 0,91 |
| Chicca 1 | ✨ | 2 carte con somma 8 | 0,44 | 43% | 429 | 1,16 | 0,89 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,50 | 49% | 483 | 1,15 | 0,88 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,45 | 44% | 440 | 1,10 | 0,84 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,36 | 35% | 354 | 1,10 | 0,84 |
| Maddalena 1 | 🔵✨ | 2 carte pari | 0,45 | 44% | 440 | 0,93 | 0,72 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,47 | 46% | 461 | 0,88 | 0,67 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,35 | 34% | 343 | 1,87 | 1,35 |
| Alessia | ✨ | 3 carte pari | 0,37 | 37% | 373 | 1,70 | 1,23 |
| Nonno Salvatore 2 | ✨ | Tris | 0,23 | 23% | 229 | 1,61 | 1,16 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,47 | 46% | 455 | 1,55 | 1,12 |
| Maddalena 2 | 🛡️ | 3 carte dispari | 0,36 | 36% | 348 | 1,55 | 1,12 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,45 | 45% | 441 | 1,52 | 1,10 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,48 | 48% | 473 | 1,49 | 1,08 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,31 | 31% | 303 | 1,47 | 1,06 |
| Donato | 🛡️ | Scala da 3 | 0,30 | 30% | 295 | 1,44 | 1,04 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,32 | 31% | 311 | 1,43 | 1,04 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,39 | 38% | 380 | 1,42 | 1,03 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,36 | 36% | 354 | 1,41 | 1,02 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,33 | 33% | 325 | 1,39 | 1,01 |
| Roberta 2 | 🛡️ | Tris | 0,24 | 24% | 237 | 1,38 | 1,00 |
| Chicca 2 | 🛡️ | 3 carte con somma 9 | 0,30 | 30% | 296 | 1,37 | 0,99 |
| Marika 2 | 🛡️ | Scala da 3 | 0,34 | 33% | 329 | 1,36 | 0,99 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,36 | 36% | 356 | 1,36 | 0,98 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,30 | 30% | 297 | 1,33 | 0,96 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,34 | 34% | 339 | 1,33 | 0,96 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,32 | 32% | 313 | 1,32 | 0,95 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,45 | 45% | 444 | 1,32 | 0,95 |
| Francesco 2 | ⚔️ | 3 carte con somma 20 | 0,38 | 38% | 375 | 1,32 | 0,95 |
| Checca 2 | ✨ | 123 | 0,19 | 19% | 194 | 1,31 | 0,95 |
| Donatina 2 | ✨ | Scala da 3 | 0,33 | 33% | 327 | 1,31 | 0,95 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,35 | 35% | 352 | 1,26 | 0,91 |
| Don Pasquale | 🛡️ | Tris | 0,25 | 25% | 251 | 1,25 | 0,90 |
| Greta | ⚔️ | 3 carte dispari | 0,43 | 42% | 418 | 1,23 | 0,89 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,45 | 44% | 440 | 1,23 | 0,89 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,44 | 43% | 427 | 1,23 | 0,89 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,43 | 42% | 420 | 1,23 | 0,89 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,47 | 46% | 457 | 1,13 | 0,82 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,47 | 46% | 454 | 1,10 | 0,80 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,45 | 44% | 443 | 2,78 | 1,71 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,31 | 30% | 300 | 1,99 | 1,22 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,16 | 16% | 162 | 1,85 | 1,14 |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,13 | 13% | 130 | 1,83 | 1,13 |
| Marika 3 | ✨ | Scala da 5 | 0,15 | 15% | 153 | 1,82 | 1,12 |
| Nonno Salvatore 3 | ✨ | Poker | 0,10 | 10% | 103 | 1,79 | 1,10 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,27 | 27% | 273 | 1,78 | 1,10 |
| Roberta 3 | ⚔️ | Poker | 0,15 | 15% | 166 | 1,74 | 1,07 |
| Nonno Antonio 3 | ⚔️ | 1111 | 0,03 | 3% | 52 | 1,65 | 1,01 |
| Annalisa 3 | ✨ | Scala da 5 | 0,17 | 18% | 173 | 1,64 | 1,01 |
| Checca 3 | ⚔️ | 4 carte con somma 24 | 0,34 | 34% | 342 | 1,63 | 1,00 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,23 | 23% | 230 | 1,53 | 0,94 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,26 | 26% | 256 | 1,52 | 0,93 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,26 | 25% | 257 | 1,49 | 0,92 |
| Totò 3 | ✨ | 4 carte pari | 0,30 | 30% | 296 | 1,49 | 0,91 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,36 | 35% | 349 | 1,48 | 0,91 |
| Donatina 3 | ⚔️ | 1234 | 0,21 | 20% | 213 | 1,46 | 0,90 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,13 | 13% | 138 | 1,45 | 0,89 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,27 | 27% | 268 | 1,41 | 0,87 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,39 | 38% | 377 | 1,40 | 0,86 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,36 | 36% | 356 | 1,39 | 0,85 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,26 | 26% | 268 | 1,37 | 0,84 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,28 | 28% | 282 | 1,34 | 0,82 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,39 | 39% | 390 | 1,22 | 0,75 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Mercatino | 🔵 | 5,52 |
| Ricetta | ✨ | 5,48 |
| Sposta i mobili | ✨ | 5,12 |
| Lezione di padel | 🔵 | 4,44 |
| Te l'ho già detto? | ✨ | 4,42 |
| Burla | ⚔️ | 4,29 |
| Scaffale | ✨ | 3,85 |
| Schietta | ⚔️ | 3,80 |
| Si incanta | ⚔️ | 3,74 |
| Studia il fascicolo | 🔵 | 3,57 |
| Ci penso domani | ✨ | 3,51 |
| Ogni cosa al suo posto | ✨ | 3,20 |
| Frutta e verdura! | ✨ | 2,78 |
| Versa il vino | ⚔️ | 2,67 |
| Ti chiamo un attimo… | ⚔️ | 2,48 |
| Mangia mangia mangia | ✨ | 2,41 |
| Bisiniss | ⚔️ | 2,38 |
| Pranzo a domicilio | ✨ | 2,30 |
| Solo per vedere comm sape | ⚔️ | 2,24 |
| Forno a legna | ⚔️ | 2,22 |
| Parla parla parla | ⚔️ | 2,15 |
| Frigge di tutto | ✨ | 2,14 |
| Fatto in casa | ✨ | 2,09 |
| Smash | ⚔️ | 2,08 |
| Ce l'ho io! | ✨ | 2,07 |
| Multa | ⚔️ | 1,92 |
| Grigliata | ✨ | 1,92 |
| Ho tanta fame | ✨ | 1,92 |
| Zeppata sui social | ⚔️ | 1,86 |
| Una rospa? | ⚔️ | 1,80 |
| Risata contagiosa | ⚔️ | 1,71 |
| Vertenza | ⚔️ | 1,59 |
| Brace accesa | ✨ | 1,57 |
| Si canta! | ⚔️ | 1,45 |
| Nuvola di fumo | 🛡️ | 1,44 |
| Baratto | ⚔️ | 1,33 |
| Colazione | ✨ | 1,29 |
| Vende la carne | ✨ | 1,26 |
| L'ho già detto | ✨ | 1,25 |
| Invasione di campo | ⚔️ | 1,19 |
| Rospe per tutti | ⚔️ | 1,11 |
| Offre la casa | ✨ | 1,07 |
| Tritacarne | ⚔️ | 1,07 |
| Allergica al finocchietto | ⚔️ | 1,01 |
| Benedizione | 🛡️ | 1,00 |
| Non sbaglio mai | 🔵 | 0,77 |
| La vetrina della collezione | ✨ | 0,68 |
| Volo infuocato | ⚔️ | 0,61 |
| Anima della festa | ✨ | 0,59 |
| Manca 'o sale | ⚔️ | 0,57 |
| Vento | ⚔️ | 0,54 |
| Sparecchio | ⚔️ | 0,52 |
| Giro aperto | ⚔️ | 0,47 |
| La tomacella | ⚔️ | 0,47 |
| Gli occhi 'nguoll | ⚔️ | 0,43 |
| Urla | ⚔️ | 0,40 |
| Il mio corpo che cambia | ✨ | 0,38 |
| Patate al forno | ✨ | 0,34 |
| Cucina per 200 | ✨ | 0,33 |
| Doppio turno | ✨ | 0,33 |
| Medico in famiglia | 🔵 | 0,25 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,17 |
| Il bastone | ⚔️ | 0,08 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 4288 | 2929 | 1655 | 36% |
| Schietta | 3800 | 2589 | 1474 | 36% |
| Si incanta | 3741 | 2590 | 1406 | 35% |
| Versa il vino | 2668 | 1873 | 1111 | 37% |
| Ti chiamo un attimo… | 2485 | 1676 | 1002 | 37% |
| Bisiniss | 2377 | 1761 | 791 | 31% |
| Solo per vedere comm sape | 2243 | 1717 | 728 | 30% |
| Forno a legna | 2222 | 1775 | 596 | 25% |
| Parla parla parla | 2146 | 1554 | 756 | 33% |
| Smash | 2075 | 1442 | 848 | 37% |
| Multa | 1919 | 1684 | 664 | 28% |
| Zeppata sui social | 1857 | 4251 | 741 | 15% |
| Una rospa? | 1803 | 1329 | 631 | 32% |
| Risata contagiosa | 1706 | 3459 | 1207 | 26% |
| Vertenza | 1586 | 1512 | 120 | 7% |
| Si canta! | 1452 | 2493 | 1236 | 33% |
| Baratto | 1334 | 1274 | 103 | 7% |
| Invasione di campo | 1185 | 2153 | 98 | 4% |
| Rospe per tutti | 1110 | 2848 | 152 | 5% |
| Tritacarne | 1069 | 1024 | 69 | 6% |
| Allergica al finocchietto | 1007 | 970 | 68 | 7% |
| Volo infuocato | 610 | 1449 | 83 | 5% |
| Manca 'o sale | 569 | 1483 | 48 | 3% |
| Vento | 538 | 395 | 163 | 29% |
| Sparecchio | 517 | 479 | 60 | 11% |
| Giro aperto | 466 | 360 | 136 | 27% |
| La tomacella | 465 | 344 | 171 | 33% |
| Gli occhi 'nguoll | 434 | 338 | 126 | 27% |
| Urla | 399 | 960 | 44 | 4% |
| Il bastone | 79 | 74 | 6 | 8% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 1136 | 0 |
| Non è colpa mia | 866 | 0 |
| Cella frigorifera | 760 | 0 |
| Non c'è, ha il turno | 735 | 0 |
| Scudo da gladiatore | 728 | 0 |
| Ricorso | 720 | 0 |
| Ho sempre ragione io | 716 | 0 |
| Non ti sento, sto suonando | 708 | 0 |
| Non sa perdere | 706 | 0 |
| Mutandoni di lana | 680 | 0 |
| Ho appena lavato a terra | 678 | 0 |
| È colpa di qualcun altro | 676 | 0 |
| Si arrabbia | 594 | 0 |
| Campari | 583 | 0 |
| Una fetta di torta? | 582 | 0 |
| Permalosa | 576 | 0 |
| Nevicava, non è potuto venire | 566 | 0 |
| Sono andato a Lioni a fa' a spesa | 543 | 0 |
| Chiusa in camera | 534 | 0 |
| Paesano | 524 | 0 |
| Sono a un matrimonio | 515 | 0 |
| Sempre calma | 515 | 0 |
| Tyrion nella borsa | 479 | 0 |
| Aglianico | 430 | 0 |
| Nuvola di fumo | 390 | 0 |
| Forse c'è, forse no | 233 | 231 |
| Taurasi | 120 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,21 |
| La Resurrezione | 2,22 |
| Carnevale di Teora | 2,20 |
| Funerale | 2,18 |
| Matrimonio | 2,17 |
| Sagra delle tomacelle | 2,17 |

Tempo di calcolo: 173.3 secondi.
