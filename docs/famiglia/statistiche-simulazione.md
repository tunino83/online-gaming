# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **300** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **300** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 15
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 75 | 53,2 | 26,6 | 36–94 | 26,9 | 21,8 | 55% · 45% |
| 3 | 75 | 72,1 | 24,0 | 51–102 | 27,2 | 20,1 | 43% · 29% · 28% |
| 4 | 75 | 90,4 | 22,6 | 64–144 | 27,1 | 19,1 | 27% · 23% · 32% · 19% |
| 5 | 75 | 109,9 | 22,0 | 70–145 | 27,9 | 18,3 | 21% · 21% · 22% · 24% · 13% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Nonno Nicola 3 (1,47), Gerardina 3 (1,35), Donato (1,33), Francesco 3 (1,30), Squacqualacchione 3 (1,30), Totò 1 (1,30), Nonno Rafiluccio 1 (1,28), Marika 1 (1,28), Squacqualacchione 1 (1,27), Donatina 1 (1,25), Nonno Nicola 1 (1,23), Claudia 3 (1,23), Roberta 2 (1,22), Sara e Giuseppe 2 (1,20), Nonna Maria 2 (1,20)
- Carte che sembrano **più deboli** (≤ 0,8): Nonna Maddalena 3 (0,50), Maddalena 2 (0,51), Nonna Maria 1 (0,52), Nonna Dina 2 (0,54), Sara e Giuseppe 1 (0,59), Donatina 2 (0,62), Totò 2 (0,64), Vincenzo (0,65), Totò 3 (0,66), Nonna Patrizia 1 (0,68), Zio Salvatore 3 (0,70), Squacqualacchione 2 (0,71), Annalisa 3 (0,71), Nonna Dina 3 (0,72), Maddalena 1 (0,76)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (7%), Nonno Salvatore 3 (8%), Donatina 3 (10%), Roberta 3 (10%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,43 | 42% | 126 | 1,38 | 1,30 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,35 | 35% | 105 | 1,36 | 1,28 |
| Marika 1 | 🛡️ | Coppia | 0,31 | 31% | 92 | 1,36 | 1,28 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,44 | 44% | 131 | 1,35 | 1,27 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,31 | 31% | 93 | 1,32 | 1,25 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,41 | 41% | 123 | 1,31 | 1,23 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,22 | 22% | 68 | 1,25 | 1,18 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,32 | 31% | 93 | 1,23 | 1,16 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,36 | 35% | 105 | 1,20 | 1,13 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,34 | 34% | 105 | 1,17 | 1,10 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,28 | 27% | 81 | 1,16 | 1,09 |
| Christian | ⚔️ | Coppia | 0,40 | 40% | 119 | 1,14 | 1,07 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,38 | 38% | 114 | 1,13 | 1,06 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,40 | 40% | 119 | 1,10 | 1,03 |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,16 | 16% | 48 | 1,08 | 1,02 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,24 | 24% | 71 | 1,08 | 1,02 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,34 | 34% | 101 | 1,05 | 0,99 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,35 | 35% | 104 | 1,01 | 0,95 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,29 | 29% | 89 | 0,99 | 0,93 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,39 | 38% | 113 | 0,98 | 0,93 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,45 | 45% | 132 | 0,95 | 0,90 |
| Nonno Antonio 1 | 🔵 | 12 | 0,20 | 20% | 60 | 0,95 | 0,90 |
| Gerardina 1 | 🛡️ | Coppia | 0,37 | 37% | 110 | 0,93 | 0,88 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,38 | 38% | 115 | 0,91 | 0,85 |
| Maddalena 1 | ✨ | 2 carte pari | 0,39 | 39% | 117 | 0,80 | 0,76 |
| Nonna Patrizia 1 | ✨ | 2 carte con somma 10 | 0,33 | 32% | 96 | 0,72 | 0,68 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,35 | 34% | 101 | 0,69 | 0,65 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,24 | 24% | 73 | 0,63 | 0,59 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,32 | 32% | 93 | 0,55 | 0,52 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Donato | 🛡️ | Scala da 3 | 0,23 | 23% | 70 | 1,74 | 1,33 |
| Roberta 2 | 🛡️ | Tris | 0,17 | 17% | 49 | 1,59 | 1,22 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,30 | 29% | 87 | 1,57 | 1,20 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,37 | 37% | 109 | 1,56 | 1,20 |
| Marika 2 | 🛡️ | Scala da 3 | 0,24 | 24% | 72 | 1,55 | 1,19 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,29 | 28% | 85 | 1,55 | 1,19 |
| Nonno Salvatore 2 | ✨ | Tris | 0,21 | 21% | 62 | 1,49 | 1,14 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,31 | 31% | 91 | 1,47 | 1,13 |
| Greta | ⚔️ | 3 carte dispari | 0,35 | 34% | 101 | 1,47 | 1,13 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,37 | 36% | 108 | 1,46 | 1,12 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,26 | 26% | 78 | 1,45 | 1,11 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,30 | 30% | 90 | 1,45 | 1,11 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,36 | 36% | 107 | 1,44 | 1,11 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,33 | 33% | 97 | 1,42 | 1,09 |
| Alessia | ✨ | 3 carte pari | 0,31 | 30% | 91 | 1,41 | 1,08 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,33 | 32% | 95 | 1,41 | 1,08 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,38 | 37% | 110 | 1,39 | 1,07 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,26 | 26% | 77 | 1,39 | 1,07 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,34 | 34% | 102 | 1,38 | 1,06 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,37 | 36% | 110 | 1,36 | 1,04 |
| Checca 2 | ✨ | 123 | 0,16 | 15% | 47 | 1,32 | 1,01 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,26 | 26% | 78 | 1,28 | 0,98 |
| Simone 2 | 🛡️ | 3 carte dispari | 0,28 | 28% | 84 | 1,25 | 0,96 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,31 | 31% | 92 | 1,21 | 0,93 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,38 | 38% | 114 | 1,21 | 0,93 |
| Francesco 2 | 🛡️ | 3 carte con somma 20 | 0,26 | 26% | 76 | 1,18 | 0,91 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,36 | 36% | 107 | 1,18 | 0,91 |
| Don Pasquale | 🛡️ | Tris | 0,16 | 16% | 49 | 1,13 | 0,87 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,20 | 20% | 61 | 1,04 | 0,80 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,28 | 27% | 81 | 0,92 | 0,71 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,31 | 31% | 93 | 0,84 | 0,64 |
| Donatina 2 | ✨ | Scala da 3 | 0,30 | 29% | 88 | 0,81 | 0,62 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,32 | 32% | 96 | 0,71 | 0,54 |
| Maddalena 2 | ✨ | 3 carte dispari | 0,32 | 31% | 94 | 0,66 | 0,51 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,19 | 19% | 57 | 2,16 | 1,47 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,28 | 28% | 85 | 1,99 | 1,35 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,23 | 23% | 70 | 1,91 | 1,30 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,16 | 16% | 50 | 1,91 | 1,30 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,24 | 24% | 72 | 1,80 | 1,23 |
| Roberta 3 | ⚔️ | Poker | 0,10 | 10% | 28 | 1,80 | 1,23 (pochi dati) |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,07 | 7% | 24 | 1,73 | 1,18 (pochi dati) |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,25 | 24% | 71 | 1,72 | 1,17 |
| Donatina 3 | ⚔️ | 1234 | 0,10 | 10% | 32 | 1,68 | 1,14 |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,15 | 15% | 44 | 1,61 | 1,09 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,35 | 34% | 103 | 1,59 | 1,08 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,26 | 26% | 77 | 1,53 | 1,04 |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,29 | 29% | 86 | 1,50 | 1,02 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,29 | 29% | 87 | 1,50 | 1,02 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,24 | 24% | 73 | 1,49 | 1,01 |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,17 | 17% | 51 | 1,47 | 1,00 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,21 | 21% | 65 | 1,45 | 0,99 |
| Marika 3 | ✨ | Scala da 5 | 0,10 | 10% | 31 | 1,26 | 0,85 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,25 | 25% | 74 | 1,21 | 0,82 |
| Checca 3 | 🛡️ | 4 carte con somma 24 | 0,16 | 16% | 50 | 1,21 | 0,82 |
| Nonno Salvatore 3 | ✨ | Poker | 0,08 | 8% | 26 | 1,06 | 0,72 (pochi dati) |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,14 | 14% | 42 | 1,06 | 0,72 |
| Annalisa 3 | ✨ | Scala da 5 | 0,10 | 10% | 30 | 1,05 | 0,71 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,11 | 11% | 32 | 1,03 | 0,70 |
| Totò 3 | ✨ | 4 carte pari | 0,24 | 23% | 67 | 0,97 | 0,66 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,11 | 11% | 37 | 0,74 | 0,50 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 4,25 |
| Lezione di padel | 🔵 | 3,36 |
| Burla | ⚔️ | 3,33 |
| Cambiamo un po'… | ✨ | 3,25 |
| Te l'ho già detto? | ✨ | 3,23 |
| Si incanta | ⚔️ | 3,13 |
| Scaffale | ✨ | 2,96 |
| Domani lo faccio | ✨ | 2,85 |
| Un filo di trucco | ✨ | 2,62 |
| Ogni cosa al suo posto | ✨ | 2,47 |
| Lingua Glabra | ⚔️ | 2,46 |
| Studia il fascicolo | 🔵 | 2,31 |
| Frutta e verdura! | ✨ | 2,25 |
| La vita è una ruota | ✨ | 2,00 |
| Ti chiamo un attimo… | ⚔️ | 1,84 |
| Mo faccio due cotolette | ✨ | 1,83 |
| Versa il vino | ⚔️ | 1,81 |
| Pranzo a domicilio | ✨ | 1,80 |
| Una sigaretta fuori al bar | ⚔️ | 1,79 |
| Straordinario | ✨ | 1,78 |
| Ce l'ho io! | ✨ | 1,72 |
| Ho tanta fame | ⚔️ | 1,67 |
| Solo per vedere comm sape | ⚔️ | 1,66 |
| Bisiniss | ⚔️ | 1,60 |
| Parla parla parla | ⚔️ | 1,50 |
| Mangia mangia mangia | ✨ | 1,49 |
| Multa | ⚔️ | 1,47 |
| Una rospa? | ⚔️ | 1,44 |
| Risata contagiosa | ⚔️ | 1,38 |
| Zeppata sui social | ⚔️ | 1,38 |
| Total black | ✨ | 1,35 |
| Alta idratazione | ⚔️ | 1,34 |
| Fatto in casa | ✨ | 1,29 |
| Brace accesa | ✨ | 1,24 |
| Nuvola di fumo | 🛡️ | 1,06 |
| Colazione | ✨ | 1,04 |
| Baratto | ⚔️ | 1,02 |
| Grigliata | ✨ | 1,02 |
| Offre la casa | ✨ | 0,92 |
| L'ho già detto | ✨ | 0,90 |
| Si canta! | ⚔️ | 0,90 |
| Invasione di campo | ⚔️ | 0,85 |
| Tritacarne | ⚔️ | 0,77 |
| Vertenza | ⚔️ | 0,70 |
| Rospe per tutti | ⚔️ | 0,68 |
| Benedizione | 🛡️ | 0,66 |
| La vetrina della collezione | ✨ | 0,61 |
| È insipido | ⚔️ | 0,52 |
| Chissà se sta roba basta | ✨ | 0,40 |
| Vento | ⚔️ | 0,39 |
| Volo infuocato | ⚔️ | 0,35 |
| Giro aperto | ⚔️ | 0,35 |
| Brontola tutto il giorno | ⚔️ | 0,34 |
| La tomacella | ⚔️ | 0,33 |
| Anima della festa | ✨ | 0,31 |
| Gli occhi 'nguoll | ⚔️ | 0,31 |
| Puzza di brace | 🔵 | 0,29 |
| Doppio turno | ✨ | 0,27 |
| Patate al forno | ✨ | 0,24 |
| Sparecchio | ⚔️ | 0,23 |
| Il mio corpo che cambia | ✨ | 0,20 |
| Medico in famiglia | 🔵 | 0,17 |
| Urla | ⚔️ | 0,16 |
| Il bastone | ⚔️ | 0,15 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,11 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 999 | 659 | 374 | 36% |
| Si incanta | 940 | 602 | 365 | 38% |
| Lingua Glabra | 738 | 462 | 295 | 39% |
| Ti chiamo un attimo… | 551 | 344 | 230 | 40% |
| Versa il vino | 543 | 383 | 190 | 33% |
| Una sigaretta fuori al bar | 537 | 396 | 173 | 30% |
| Ho tanta fame | 502 | 299 | 216 | 42% |
| Solo per vedere comm sape | 498 | 374 | 147 | 28% |
| Bisiniss | 480 | 365 | 145 | 28% |
| Parla parla parla | 450 | 334 | 128 | 28% |
| Multa | 440 | 367 | 155 | 30% |
| Una rospa? | 433 | 321 | 133 | 29% |
| Risata contagiosa | 415 | 808 | 296 | 27% |
| Zeppata sui social | 413 | 967 | 169 | 15% |
| Alta idratazione | 403 | 329 | 96 | 23% |
| Baratto | 305 | 280 | 43 | 13% |
| Si canta! | 269 | 561 | 254 | 31% |
| Invasione di campo | 254 | 448 | 29 | 6% |
| Tritacarne | 232 | 210 | 28 | 12% |
| Vertenza | 211 | 193 | 24 | 11% |
| Rospe per tutti | 205 | 474 | 37 | 7% |
| È insipido | 155 | 410 | 23 | 5% |
| Vento | 116 | 73 | 44 | 38% |
| Volo infuocato | 105 | 257 | 24 | 9% |
| Giro aperto | 104 | 80 | 30 | 27% |
| Brontola tutto il giorno | 103 | 97 | 9 | 8% |
| La tomacella | 100 | 65 | 39 | 38% |
| Gli occhi 'nguoll | 92 | 65 | 30 | 32% |
| Sparecchio | 69 | 64 | 6 | 9% |
| Urla | 47 | 112 | 4 | 3% |
| Il bastone | 44 | 37 | 9 | 20% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 211 | 0 |
| Ricorso | 185 | 0 |
| Non è ancora arrivato | 178 | 0 |
| Campari | 165 | 0 |
| Mutandoni di lana | 164 | 0 |
| Ho appena lavato a terra | 161 | 0 |
| Scudo da gladiatore | 156 | 0 |
| Paesano | 153 | 0 |
| Cella frigorifera | 153 | 0 |
| Sono andato a Lioni a fa' a spesa | 152 | 0 |
| Sempre calma | 149 | 0 |
| Nevicava, non è potuto venire | 144 | 0 |
| E se poi te ne penti? | 136 | 0 |
| Una fetta di torta? | 132 | 0 |
| Per me è quadrato | 132 | 0 |
| Scatto d'ira | 131 | 0 |
| Sono a un matrimonio | 126 | 0 |
| Aglianico | 126 | 0 |
| Non ti sento, sto suonando | 125 | 0 |
| Non è colpa mia | 124 | 0 |
| Tiro su un muro | 117 | 0 |
| Non c'è, ha il turno | 113 | 0 |
| Drago Tascabile | 110 | 0 |
| Chiusa in camera | 94 | 0 |
| La cionna | 91 | 0 |
| Tofu Super Seitan | 89 | 0 |
| Nuvola di fumo | 64 | 0 |
| Forse c'è, forse no | 40 | 60 |
| Taurasi | 24 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,19 |
| La Resurrezione | 2,15 |
| Carnevale di Teora | 2,19 |
| Funerale | 2,17 |
| Matrimonio | 2,12 |
| Sagra delle tomacelle | 2,15 |

Tempo di calcolo: 47.6 secondi.
