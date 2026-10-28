# La Famiglia – statistiche della simulazione (fine a 20 punti)

Partite simulate: **300** (da 2 a 5 giocatori, a rotazione), tra robot che scelgono mosse a caso
ma attivano sempre un personaggio quando possono e usano i poteri una volta su due.
Finite: **300** · errori: **0** · bloccate (oltre 600 turni): **0** · pareggi: 11
Finite perché il mazzo personaggi è finito (invece che per i punti): 0

> I robot giocano a caso: questi numeri servono a trovare squilibri grossi, non sostituiscono le partite vere.

## Durata e vantaggio di chi comincia

| Giocatori | Partite | Turni medi | Giri medi | Turni min–max | Punti del vincitore | Punti medi | Vittorie per posizione (1°, 2°, …) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 75 | 51,3 | 25,6 | 34–88 | 27,3 | 21,6 | 52% · 48% |
| 3 | 75 | 70,5 | 23,5 | 48–102 | 27,3 | 19,6 | 31% · 33% · 35% |
| 4 | 75 | 88,0 | 22,0 | 64–120 | 27,3 | 18,9 | 27% · 22% · 29% · 23% |
| 5 | 75 | 109,4 | 21,9 | 85–140 | 27,5 | 18,3 | 29% · 22% · 20% · 15% · 14% |

Un giro = un turno per ogni giocatore. Senza vantaggi, ogni posizione vincerebbe il 50% (in 2), 33% (in 3), 25% (in 4), 20% (in 5).

## 🔎 Da guardare

**Indice di vittoria**: tra i giocatori che a fine partita avevano attivata una carta, quanti hanno vinto rispetto
a quanti ci si aspetterebbe. Chi vince ha più carte attivate degli altri, quindi l'indice è quasi sempre sopra 1:
per questo ogni carta si confronta con la **media delle carte del suo livello** (colonna "rispetto al livello":
1 = come le altre; 1,3 = chi la ha vince il 30% più spesso di chi ha un'altra carta dello stesso livello).

- Carte che sembrano **più forti** delle altre del loro livello (≥ 1,2): Nonna Maria 3 (1,54), Simone 2 (1,40), Generoso 1 (1,39), Checca 2 (1,37), Annalisa 1 (1,37), Alessia (1,33), Donato (1,29), Totò 1 (1,29), Nonno Antonio 2 (1,25), Zia Diana (1,24), Roberta 2 (1,23), Nonno Salvatore 1 (1,22), Claudia 2 (1,22), Nonno Rafiluccio 1 (1,22), Antonio 1 (1,20)
- Carte che sembrano **più deboli** (≤ 0,8): Nonna Maddalena 3 (0,57), Nonna Maddalena 1 (0,59), Nonna Maria 1 (0,62), Squacqualacchione 2 (0,63), Nonna Dina 1 (0,68), Maddalena 2 (0,70), Maddalena 1 (0,70), Nonna Dina 3 (0,70), Nonna Patrizia 1 (0,70), Totò 2 (0,72), Nonna Dina 2 (0,73), Checca 3 (0,74), Sara e Giuseppe 1 (0,74), Chicca 2 (0,76), Donatina 2 (0,78), Dottor Racioppi (0,78), Generoso 2 (0,79), Franchino (0,80)
- Carte **attivate raramente** (in meno del 10% delle partite, spesso per un codice difficile): Nonno Antonio 3 (6%), Nonno Salvatore 3 (7%), Roberta 3 (7%), Marika 3 (8%), Annalisa 3 (9%)

## Carte di livello 1

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generoso 1 | 🔵 | 88 + una coppia qualsiasi | 0,14 | 14% | 43 | 1,50 | 1,39 |
| Annalisa 1 | 🛡️ | 2 carte con somma 11 | 0,36 | 35% | 103 | 1,49 | 1,37 |
| Totò 1 | ⚔️ | 2 carte con somma 11 | 0,43 | 42% | 126 | 1,39 | 1,29 |
| Nonno Salvatore 1 | ✨ | Coppia | 0,36 | 36% | 107 | 1,32 | 1,22 |
| Nonno Rafiluccio 1 | 🛡️ | 2 carte con somma 10 | 0,36 | 36% | 105 | 1,32 | 1,22 |
| Antonio 1 | ✨ | 2 carte con somma 9 | 0,33 | 32% | 96 | 1,30 | 1,20 |
| Claudia 1 | 🔵 | 2 carte con somma 15 | 0,23 | 23% | 71 | 1,26 | 1,17 |
| Nonno Nicola 1 | 🔵 | 2 carte dispari | 0,43 | 42% | 127 | 1,26 | 1,16 |
| Gerardina 1 | 🛡️ | Coppia | 0,37 | 37% | 112 | 1,23 | 1,14 |
| Roberta 1 | ⚔️ | 2 carte con somma 7 | 0,32 | 32% | 97 | 1,21 | 1,12 |
| Simone 1 | ✨ | 2 carte con somma 6 | 0,34 | 33% | 100 | 1,18 | 1,09 |
| Chicca 1 | 🛡️🔵 | 2 carte con somma 8 | 0,32 | 32% | 96 | 1,16 | 1,07 |
| Donatina 1 | ✨ | 2 carte con somma 5 | 0,33 | 32% | 97 | 1,15 | 1,06 |
| Marika 1 | 🛡️ | Coppia | 0,33 | 32% | 96 | 1,13 | 1,05 |
| Squacqualacchione 1 | ⚔️ | 2 carte con somma 9 | 0,44 | 44% | 132 | 1,12 | 1,04 |
| Nonno Antonio 1 | 🔵 | 12 | 0,27 | 25% | 76 | 1,08 | 1,00 |
| Checca 1 | ⚔️ | 2 carte con somma 6 | 0,37 | 36% | 108 | 1,07 | 0,99 |
| Zio Salvatore 1 | ⚔️ | 77 | 0,19 | 19% | 60 | 1,03 | 0,95 |
| Christian | ⚔️ | Coppia | 0,38 | 37% | 112 | 1,01 | 0,93 |
| Francesco 1 | 🔵 | 2 carte con somma 12 | 0,33 | 33% | 97 | 0,99 | 0,91 |
| Vincenzo | ✨ | 2 carte con somma 8 | 0,33 | 32% | 96 | 0,98 | 0,91 |
| Giuseppe 1 | 🔵 | 2 carte con somma 13 | 0,30 | 29% | 89 | 0,97 | 0,90 |
| Dottor Racioppi | ✨ | 2 carte con somma 10 | 0,43 | 43% | 129 | 0,85 | 0,78 |
| Sara e Giuseppe 1 | 🔵 | 25 | 0,23 | 23% | 68 | 0,80 | 0,74 |
| Nonna Patrizia 1 | ✨ | 2 carte con somma 10 | 0,34 | 34% | 102 | 0,76 | 0,70 |
| Maddalena 1 | ✨ | 2 carte pari | 0,38 | 38% | 113 | 0,75 | 0,70 |
| Nonna Dina 1 | ✨ | 2 carte con somma 7 | 0,34 | 33% | 98 | 0,74 | 0,68 |
| Nonna Maria 1 | ✨ | 2 carte con somma 13 | 0,26 | 25% | 74 | 0,67 | 0,62 |
| Nonna Maddalena 1 | ✨ | 2 carte pari | 0,36 | 36% | 107 | 0,64 | 0,59 |

## Carte di livello 2

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Simone 2 | 🛡️ | 3 carte dispari | 0,26 | 25% | 77 | 1,80 | 1,40 |
| Checca 2 | ⚔️ | 123 | 0,21 | 20% | 62 | 1,77 | 1,37 |
| Alessia | ✨ | 3 carte pari | 0,27 | 27% | 82 | 1,72 | 1,33 |
| Donato | 🛡️ | Scala da 3 | 0,23 | 23% | 66 | 1,66 | 1,29 |
| Nonno Antonio 2 | 🛡️ | 3 carte dispari | 0,25 | 25% | 77 | 1,61 | 1,25 |
| Zia Diana | 🛡️ | 3 carte con somma 12 | 0,36 | 35% | 106 | 1,60 | 1,24 |
| Roberta 2 | 🛡️ | Tris | 0,17 | 17% | 51 | 1,59 | 1,23 |
| Claudia 2 | ⚔️ | 3 carte con somma 16 | 0,34 | 34% | 100 | 1,57 | 1,22 |
| Nonna Maddalena 2 | 🛡️ | 3 carte con somma 9 | 0,24 | 24% | 71 | 1,54 | 1,20 |
| Don Pasquale | 🛡️ | Tris | 0,18 | 18% | 53 | 1,52 | 1,18 |
| Francesco 2 | 🛡️ | 3 carte con somma 20 | 0,22 | 22% | 65 | 1,50 | 1,16 |
| Sara e Giuseppe 2 | 🛡️ | 3 carte dispari | 0,28 | 28% | 84 | 1,47 | 1,14 |
| Marika 2 | 🛡️ | Scala da 3 | 0,25 | 25% | 74 | 1,42 | 1,10 |
| Nonno Nicola 2 | ⚔️ | 3 carte con somma 12 | 0,36 | 35% | 106 | 1,32 | 1,02 |
| Giuseppe 2 | 🛡️ | 3 carte pari | 0,26 | 26% | 79 | 1,31 | 1,02 |
| Nonna Maria 2 | ⚔️ | 3 carte con somma 17 | 0,35 | 35% | 105 | 1,31 | 1,02 |
| Greta | ⚔️ | 3 carte dispari | 0,31 | 31% | 94 | 1,28 | 0,99 |
| Gerardina 2 | ⚔️ | 3 carte con somma 13 | 0,40 | 40% | 119 | 1,28 | 0,99 |
| Rocky | ⚔️ | 3 carte con somma 14 | 0,33 | 33% | 99 | 1,20 | 0,93 |
| Antonio 2 | ⚔️ | 3 carte con somma 18 | 0,32 | 32% | 95 | 1,16 | 0,90 |
| Nicole | ⚔️ | 3 carte con somma 11 | 0,29 | 29% | 86 | 1,15 | 0,89 |
| Annalisa 2 | 🔵 | 3 carte con somma 12 | 0,27 | 27% | 80 | 1,11 | 0,86 |
| Zio Salvatore 2 | ⚔️ | 3 carte con somma 14 | 0,36 | 36% | 109 | 1,10 | 0,86 |
| Nonno Salvatore 2 | ✨ | Tris | 0,19 | 19% | 56 | 1,10 | 0,85 |
| Nonna Patrizia 2 | 🛡️ | Scala da 3 | 0,26 | 25% | 75 | 1,07 | 0,83 |
| Nonno Rafiluccio 2 | ✨ | 3 carte pari | 0,31 | 30% | 91 | 1,06 | 0,82 |
| Franchino | ⚔️ | 3 carte con somma 15 | 0,38 | 38% | 114 | 1,03 | 0,80 |
| Generoso 2 | ✨ | 3 carte con somma 10 | 0,24 | 24% | 74 | 1,01 | 0,79 |
| Donatina 2 | ✨ | Scala da 3 | 0,26 | 26% | 76 | 1,00 | 0,78 |
| Chicca 2 | 🔵 | 3 carte con somma 9 | 0,24 | 24% | 71 | 0,98 | 0,76 |
| Nonna Dina 2 | ✨ | 3 carte pari | 0,30 | 29% | 88 | 0,94 | 0,73 |
| Totò 2 | ✨ | 3 carte con somma 15 | 0,30 | 30% | 89 | 0,92 | 0,72 |
| Maddalena 2 | ✨ | 3 carte dispari | 0,31 | 31% | 92 | 0,90 | 0,70 |
| Squacqualacchione 2 | ✨ | 3 carte dispari | 0,27 | 27% | 81 | 0,82 | 0,63 |

## Carte di livello 3

| Carta | Tipo | Codice | Attivata (media per partita) | In quante partite | Attivata a fine partita | Indice di vittoria | Rispetto al livello |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nonna Maria 3 | 🛡️ | 4 carte dispari | 0,16 | 16% | 50 | 2,50 | 1,54 |
| Claudia 3 | 🛡️ | Doppia coppia | 0,21 | 21% | 65 | 1,93 | 1,19 |
| Squacqualacchione 3 | ⚔️ | 88 + una coppia qualsiasi | 0,15 | 15% | 45 | 1,89 | 1,16 |
| Chicca 3 | 🛡️ | Doppia coppia | 0,18 | 18% | 53 | 1,88 | 1,16 |
| Nonno Antonio 3 | ⚔️ | Poker dispari | 0,06 | 6% | 22 | 1,86 | 1,15 (pochi dati) |
| Roberta 3 | ⚔️ | Poker | 0,07 | 7% | 22 | 1,83 | 1,13 (pochi dati) |
| Nonno Rafiluccio 3 | ⚔️ | Scala da 5 | 0,12 | 12% | 38 | 1,82 | 1,12 |
| Francesco 3 | 🛡️ | 4 carte con somma 20 | 0,25 | 24% | 72 | 1,82 | 1,12 |
| Antonio 3 | 🛡️ | 4 carte con somma 20 | 0,23 | 23% | 69 | 1,73 | 1,07 |
| Donatina 3 | ⚔️ | 1234 | 0,11 | 11% | 35 | 1,71 | 1,06 |
| Sara e Giuseppe 3 | ⚔️ | 4 carte con somma 12 | 0,24 | 24% | 72 | 1,69 | 1,04 |
| Simone 3 | ⚔️ | 4 carte con somma 22 | 0,29 | 29% | 87 | 1,64 | 1,01 |
| Giuseppe 3 | ⚔️ | 4 carte con somma 18 | 0,32 | 31% | 93 | 1,64 | 1,01 |
| Generoso 3 | ✨ | 4 carte con somma 16 | 0,22 | 22% | 66 | 1,59 | 0,98 |
| Maddalena 3 | 🛡️ | Doppia coppia | 0,23 | 23% | 68 | 1,58 | 0,97 |
| Zio Salvatore 3 | ✨ | 88 + una coppia qualsiasi | 0,11 | 11% | 33 | 1,58 | 0,97 |
| Gerardina 3 | ⚔️ | 4 carte con somma 22 | 0,25 | 25% | 76 | 1,56 | 0,96 |
| Totò 3 | ✨ | 4 carte pari | 0,21 | 21% | 63 | 1,47 | 0,91 |
| Nonno Nicola 3 | ⚔️ | 66 + una coppia qualsiasi | 0,22 | 22% | 66 | 1,44 | 0,89 |
| Marika 3 | ✨ | Scala da 5 | 0,08 | 8% | 28 | 1,43 | 0,88 (pochi dati) |
| Nonna Patrizia 3 | ⚔️ | 4 carte dispari | 0,26 | 26% | 78 | 1,34 | 0,82 |
| Nonno Salvatore 3 | ✨ | Poker | 0,07 | 7% | 20 | 1,30 | 0,80 (pochi dati) |
| Checca 3 | 🛡️ | 4 carte con somma 24 | 0,20 | 20% | 62 | 1,19 | 0,74 |
| Annalisa 3 | ✨ | Scala da 5 | 0,09 | 9% | 27 | 1,17 | 0,72 (pochi dati) |
| Nonna Dina 3 | ✨ | Scala da 5 | 0,13 | 13% | 40 | 1,14 | 0,70 |
| Nonna Maddalena 3 | ✨ | Scala da 5 | 0,10 | 10% | 30 | 0,92 | 0,57 |

## Poteri usati (media per partita)

| Potere | Tipo | Usi per partita |
| --- | --- | --- |
| Ricetta | ✨ | 4,20 |
| Burla | ⚔️ | 3,29 |
| Cambiamo un po'… | ✨ | 3,24 |
| Te l'ho già detto? | ✨ | 3,14 |
| Si incanta | ⚔️ | 3,11 |
| Lezione di padel | 🔵 | 3,07 |
| Scaffale | ✨ | 2,87 |
| Ogni cosa al suo posto | ✨ | 2,57 |
| Lingua Glabra | ⚔️ | 2,47 |
| Domani lo faccio | ✨ | 2,47 |
| Studia il fascicolo | 🔵 | 2,46 |
| Frutta e verdura! | ✨ | 2,31 |
| La vita è una ruota | ✨ | 2,18 |
| Un filo di trucco | ✨ | 2,12 |
| Pranzo a domicilio | ✨ | 1,91 |
| Una sigaretta fuori al bar | ⚔️ | 1,77 |
| Versa il vino | ⚔️ | 1,76 |
| Una rospa? | ⚔️ | 1,76 |
| Straordinario | ✨ | 1,72 |
| Multa | ⚔️ | 1,70 |
| Mo faccio due cotolette | ✨ | 1,57 |
| Ti chiamo un attimo… | ⚔️ | 1,56 |
| Solo per vedere comm sape | ⚔️ | 1,53 |
| Ce l'ho io! | ✨ | 1,50 |
| Bisiniss | ⚔️ | 1,40 |
| Ho tanta fame | ⚔️ | 1,39 |
| Mangia mangia mangia | ✨ | 1,38 |
| Parla parla parla | ⚔️ | 1,34 |
| Fatto in casa | ✨ | 1,31 |
| Total black | ✨ | 1,31 |
| Alta idratazione | ⚔️ | 1,27 |
| Zeppata sui social | ⚔️ | 1,20 |
| Brace accesa | ✨ | 1,17 |
| Risata contagiosa | ⚔️ | 1,13 |
| Nuvola di fumo | 🛡️ | 1,03 |
| Colazione | ✨ | 0,91 |
| L'ho già detto | ✨ | 0,90 |
| Baratto | ⚔️ | 0,89 |
| Offre la casa | ✨ | 0,85 |
| Grigliata | ✨ | 0,83 |
| Invasione di campo | ⚔️ | 0,82 |
| Si canta! | ⚔️ | 0,72 |
| Tritacarne | ⚔️ | 0,72 |
| Rospe per tutti | ⚔️ | 0,69 |
| Vertenza | ⚔️ | 0,66 |
| Benedizione | 🛡️ | 0,65 |
| È insipido | ⚔️ | 0,47 |
| Chissà se sta roba basta | ✨ | 0,41 |
| Volo infuocato | ⚔️ | 0,41 |
| Vento | ⚔️ | 0,40 |
| Anima della festa | ✨ | 0,39 |
| La tomacella | ⚔️ | 0,33 |
| Giro aperto | ⚔️ | 0,32 |
| Gli occhi 'nguoll | ⚔️ | 0,31 |
| Brontola tutto il giorno | ⚔️ | 0,31 |
| Collezione | ⚔️ | 0,27 |
| Patate al forno | ✨ | 0,25 |
| Doppio turno | ✨ | 0,24 |
| Urla | ⚔️ | 0,24 |
| Il mio corpo che cambia | ✨ | 0,23 |
| Sparecchio | ⚔️ | 0,19 |
| Puzza di brace | 🔵 | 0,19 |
| Medico in famiglia | 🔵 | 0,16 |
| Il bastone | ⚔️ | 0,15 |
| Sono due etti e mezzo, lascio? | 🔵 | 0,12 |

## Attacchi: quanti passano e quanti vengono fermati

| Attacco | Lanciati | Hanno colpito | Fermati da una difesa | % fermati |
| --- | --- | --- | --- | --- |
| Burla | 988 | 513 | 513 | 50% |
| Si incanta | 933 | 535 | 451 | 46% |
| Lingua Glabra | 742 | 355 | 414 | 54% |
| Una sigaretta fuori al bar | 530 | 346 | 214 | 38% |
| Versa il vino | 528 | 294 | 277 | 49% |
| Una rospa? | 527 | 349 | 206 | 37% |
| Multa | 509 | 376 | 245 | 39% |
| Ti chiamo un attimo… | 467 | 237 | 251 | 51% |
| Solo per vedere comm sape | 460 | 314 | 178 | 36% |
| Bisiniss | 420 | 256 | 183 | 42% |
| Ho tanta fame | 418 | 214 | 222 | 51% |
| Parla parla parla | 402 | 239 | 193 | 45% |
| Alta idratazione | 381 | 246 | 170 | 41% |
| Zeppata sui social | 359 | 652 | 311 | 32% |
| Risata contagiosa | 339 | 609 | 317 | 34% |
| Baratto | 266 | 221 | 51 | 19% |
| Invasione di campo | 245 | 400 | 73 | 15% |
| Si canta! | 217 | 361 | 294 | 45% |
| Tritacarne | 215 | 187 | 34 | 15% |
| Rospe per tutti | 208 | 479 | 51 | 10% |
| Vertenza | 197 | 175 | 29 | 14% |
| È insipido | 142 | 327 | 30 | 8% |
| Volo infuocato | 122 | 277 | 34 | 11% |
| Vento | 121 | 61 | 61 | 50% |
| La tomacella | 100 | 49 | 58 | 54% |
| Giro aperto | 95 | 60 | 39 | 39% |
| Gli occhi 'nguoll | 94 | 52 | 46 | 47% |
| Brontola tutto il giorno | 93 | 85 | 17 | 17% |
| Collezione | 81 | 127 | 74 | 37% |
| Urla | 72 | 162 | 24 | 13% |
| Sparecchio | 58 | 50 | 9 | 15% |
| Il bastone | 46 | 42 | 5 | 11% |

Un attacco contro tutti conta una volta tra i lanciati ma può colpire o essere fermato da più giocatori.

## Difese usate

| Difesa | Riuscite | Fallite (Forse c'è, forse no) |
| --- | --- | --- |
| Guardia medica | 291 | 0 |
| Cella frigorifera | 271 | 0 |
| Ricorso | 247 | 0 |
| Non è ancora arrivato | 232 | 0 |
| Ho appena lavato a terra | 217 | 0 |
| Per me è quadrato | 215 | 0 |
| Mutandoni di lana | 208 | 0 |
| Tiro su un muro | 202 | 0 |
| Sempre calma | 197 | 0 |
| Non ti sento, sto suonando | 194 | 0 |
| Una fetta di torta? | 192 | 0 |
| Scatto d'ira | 191 | 0 |
| Nevicava, non è potuto venire | 185 | 0 |
| Campari | 184 | 0 |
| Sono andato a Lioni a fa' a spesa | 182 | 0 |
| Non c'è, ha il turno | 180 | 0 |
| Scudo da gladiatore | 168 | 0 |
| Non è colpa mia | 167 | 0 |
| Tofu Super Seitan | 163 | 0 |
| Paesano | 158 | 0 |
| Sono a un matrimonio | 157 | 0 |
| Drago Tascabile | 143 | 0 |
| E se poi te ne penti? | 139 | 0 |
| Aglianico | 138 | 0 |
| Chiusa in camera | 127 | 0 |
| La cionna | 122 | 0 |
| Nuvola di fumo | 104 | 0 |
| Forse c'è, forse no | 64 | 66 |
| Taurasi | 36 | 0 |

## Eventi (pescati in media per partita)

| Evento | Per partita |
| --- | --- |
| Natale | 2,15 |
| La Resurrezione | 2,12 |
| Carnevale di Teora | 2,12 |
| Funerale | 2,11 |
| Matrimonio | 2,12 |
| Sagra delle tomacelle | 2,14 |

Tempo di calcolo: 84.1 secondi.
