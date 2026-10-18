# Il Portale – regolamento

## Materiale

Il gioco usa tre mazzi: carte numero per formare i codici, personaggi da attivare per fare punti, diamanti come risorsa extra.

| Mazzo | Composizione | A cosa serve |
| --- | --- | --- |
| Carte numero | 56 carte, valori 1–8, 7 copie per valore; 3 di queste (un 3, un 4 e un 5) hanno le frecce | Formare i codici di attivazione |
| Personaggi | 55 carte (42 personaggi diversi, alcuni in più copie); facili da aggiungere | Si attivano per fare punti e ottenere poteri |
| Diamanti | 20 carte: 2 per ogni valore 1–8 + 4 fulmini | Valori extra per i codici; il fulmine dà una mossa in più |

Ogni personaggio ha:

- un **codice di attivazione** (vedi sotto);
- un **valore in punti**;
- un **potere** facoltativo: **blu** (permanente) o **rosso** (una volta sola).

## Preparazione e parametri

Si gioca da 2 a 5 giocatori e si parte con la mano vuota.

1. Mescolare separatamente i tre mazzi.
2. Scoprire al centro del tavolo 4 carte numero e 2 personaggi.
3. Ogni giocatore parte con 0 carte in mano, 0 personaggi e 0 diamanti.
4. Il server sorteggia l'ordine di gioco.

| Parametro della partita | Default | Note |
| --- | --- | --- |
| Numero di giocatori | — | Da 2 a 5 |
| Punti per vincere | 15 | Scelto da chi crea la partita |
| Limite carte in mano | 5 | Modificabile dai poteri |
| Posti personaggio per giocatore | 2 |  |
| Mosse per turno | 3 | Più eventuali fulmini |

## Il turno

Ogni turno il giocatore fa 3 mosse, anche ripetendo la stessa, scegliendo tra queste:

| Mossa | Cosa fa |
| --- | --- |
| Prendere dal tavolo | Prende una carta numero o un personaggio scoperto; la carta viene subito rimpiazzata dal mazzo |
| Pescare da un mazzo | Pesca la prima carta coperta del mazzo numeri o del mazzo personaggi (i diamanti non si pescano: arrivano solo dai poteri) |
| Attivare un personaggio | Gioca dalla mano (e dai diamanti) le carte che formano il codice di un personaggio nei propri posti |
| Bruciare | Scarta le 4 carte numero scoperte sul tavolo e ne scopre 4 nuove; i personaggi scoperti restano |

**Limiti**

- Carte numero in mano: massimo 5, salvo poteri. Si può pescare anche oltre il limite; a fine turno si scarta fino a tornare al limite.
- Personaggi nei posti: massimo 2. Chi ne prende un terzo deve scartarne uno.

**Carte numero con le frecce**

- Nel mazzo numeri ci sono 3 carte con le frecce: un 3, un 4 e un 5 (al posto di 3 carte normali, quindi restano 56 carte).
- Ogni volta che una carta con le frecce compare scoperta sul tavolo (a inizio partita, quando rimpiazza una carta presa, quando si brucia),
  i 2 personaggi scoperti vanno negli scarti personaggi e se ne scoprono 2 nuovi dal mazzo.
- Se ne compaiono due insieme (per esempio bruciando), i personaggi si cambiano due volte.
- Se una carta con le frecce si pesca coperta dal mazzo non succede niente. In mano vale come una carta normale del suo numero.
- I diamanti non contano nel limite della mano e sono visibili a tutti.
- Un fulmine si gioca in qualsiasi momento del proprio turno e dà una mossa in più; poi si scarta.
- Ogni mazzo ha la sua pila degli scarti: carte numero, diamanti e personaggi usati o scartati finiscono lì. Quando un mazzo finisce, i suoi scarti si rimescolano.

## Codici di attivazione

Un codice è un insieme di 1–5 carte, in qualsiasi ordine; vale ogni carta numero in mano e ogni diamante con valore.

| Tipo di codice | Esempio | Si soddisfa con |
| --- | --- | --- |
| Esatto | 12, 55, 8888, 45678 | Esattamente quei valori |
| Coppia | Coppia | 2 carte dello stesso valore |
| Tris | Tris | 3 carte dello stesso valore |
| Poker | Poker | 4 carte dello stesso valore |
| Somma | 3 carte con somma 15 | Il numero di carte indicato, la cui somma è il valore indicato |
| Scala da 3 | 3 consecutive | 3 valori consecutivi (es. 3-4-5) |
| Scala da 5 | 5 consecutive | 5 valori consecutivi (es. 2-3-4-5-6) |
| Doppia coppia | Doppia coppia | 2 coppie di carte, anche dello stesso valore (es. 33 + 77, oppure 5555) |
| Combinato | 66 + una coppia | Una parte esatta più una parte generica |
| Pari / dispari | 3 carte pari | Il numero di carte indicato, tutte pari o tutte dispari |

Le carte usate vanno negli scarti. Il personaggio attivato lascia il posto libero e passa nella zona "attivati" del giocatore, dove conta i suoi punti.

## Personaggi, poteri e diamanti

I poteri si applicano appena il personaggio viene attivato: quelli blu restano attivi per il resto della partita, quelli rossi agiscono una volta sola.

- **Potere blu**: vale dal turno in cui si attiva e in tutti i turni successivi (es. limite mano +1).
- **Potere rosso**: si applica una sola volta, al momento dell'attivazione.
- **Diamanti**: alcuni personaggi danno diritto a pescare diamanti. Non c'è limite ai diamanti posseduti. I diamanti sono sempre visibili agli altri giocatori.
- **Diamante con valore**: si usa nei codici come una carta numero, oppure per fare +1 al valore di una carta in mano (es. con 7 e 8 in mano e un diamante si attiva 88). Il +1 (o −1 con Xena) si usa solo su carte numero in mano o su diamanti con valore, non sulle carte virtuali di nani, fenice e drago. Massimo 1 diamante per carta, e il valore resta sempre tra 1 e 8 (con Xena un 8 può diventare 7).
- **Fulmine**: dà una mossa in più nel turno in cui si gioca.

L'elenco dei personaggi (codice, punti, potere) sarà una tabella di dati separata, così aggiungerne di nuovi non richiede di toccare le regole.

## Elenco personaggi

Mazzo completo: 42 personaggi diversi, 55 carte. Per aggiungere un personaggio basta una nuova riga.
Nell'app lo stesso elenco, con le carte disegnate, è in "Come si gioca" → "Tutte le carte".

| Immagine | Personaggio | Codice per attivarlo | Punti | Potere | Tipo | Copie |
| --- | --- | --- | --- | --- | --- | --- |
| <img src="../games/primo-gioco/immagini/classica/nano-1.png" width="90" alt="Eolo"> | Eolo | 11 | 1 | Hai a disposizione un 1 per i codici, come se fosse in mano, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-2.png" width="90" alt="Gongolo"> | Gongolo | 22 | 1 | Hai un 2 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-3.png" width="90" alt="Dotto"> | Dotto | 33 | 1 | Hai un 3 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-4.png" width="90" alt="Pisolo"> | Pisolo | 44 | 1 | Hai un 4 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-5.png" width="90" alt="Mammolo"> | Mammolo | 55 | 1 | Hai un 5 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-6.png" width="90" alt="Cucciolo"> | Cucciolo | 66 | 1 | Hai un 6 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/nano-7.png" width="90" alt="Brontolo"> | Brontolo | 77 | 1 | Hai un 7 a disposizione, una volta per turno | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/fenice.png" width="90" alt="Fenice"> | Fenice | 12 | 0 | Hai un 8 a disposizione, una volta per turno | Blu | 2 |
| <img src="../games/primo-gioco/immagini/classica/drago.jpg" width="90" alt="Drago"> | Drago | 1111 | 0 | Come un nano, ma a ogni turno scegli tu il valore della carta | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/cappuccetto-rosso.png" width="90" alt="Cappuccetto Rosso"> | Cappuccetto Rosso | 45678 | 1 | Fai 4 mosse per turno invece di 3 | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/scimmia.jpg" width="90" alt="Scimmia"> | Scimmia | Carte con somma 10 (quante si vuole) | 1 | Limite della mano +1 | Blu | 3 |
| <img src="../games/primo-gioco/immagini/classica/strega.jpg" width="90" alt="Medusa"> | Medusa | 3 carte con somma 7 | 1 | Scarta un personaggio non ancora attivato dai posti di un avversario | Rosso | 2 |
| <img src="../games/primo-gioco/immagini/classica/gatto-con-gli-stivali.jpg" width="90" alt="Gatto con gli stivali"> | Gatto con gli stivali | 345 | 1 | Una delle carte del codice, a tua scelta, non si scarta e resta in mano | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/unicorno.png" width="90" alt="Unicorno"> | Unicorno | 1234 | 1 | Ricevi 2 diamanti | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/pinco.jpg" width="90" alt="Pinco"> | Pinco | 7788 | 3 | Ricevi 1 diamante | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/panco.jpg" width="90" alt="Panco"> | Panco | 7788 | 3 | Ricevi 1 diamante | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/leone.jpg" width="90" alt="Leone"> | Leone | 8888 | 5 | Nessuno | — | 1 |
| <img src="../games/primo-gioco/immagini/classica/giganti.jpg" width="90" alt="Orco"> | Orco | 6688 | 3 | Nessuno | — | 3 |
| <img src="../games/primo-gioco/immagini/classica/hansel-e-gretel.jpg" width="90" alt="Hansel e Gretel"> | Hansel e Gretel | 88 | 2 | Nessuno | — | 2 |
| <img src="../games/primo-gioco/immagini/classica/goblin.png" width="90" alt="Goblin"> | Goblin | Coppia | 1 | Nessuno | — | 3 |
| <img src="../games/primo-gioco/immagini/classica/cerbero.jpg" width="90" alt="Cerbero"> | Cerbero | Tris | 2 | Nessuno | — | 2 |
| <img src="../games/primo-gioco/immagini/classica/quercia-umana.png" width="90" alt="Quercia umana"> | Quercia umana | Poker | 3 | Nessuno | — | 1 |
| <img src="../games/primo-gioco/immagini/classica/regina.jpg" width="90" alt="Fata Smemorina"> | Fata Smemorina | 7777 | 4 | Nessuno | — | 2 |
| <img src="../games/primo-gioco/immagini/classica/gnomo.jpg" width="90" alt="Gnomo"> | Gnomo | 66 + una coppia qualsiasi (anche 66) | 2 | Ricevi 1 diamante | Rosso | 2 |
| <img src="../games/primo-gioco/immagini/classica/mago.jpg" width="90" alt="Mago"> | Mago | Scala da 3 | 1 | A inizio turno vedi la prima carta coperta del mazzo personaggi | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/fantasma.jpg" width="90" alt="Fantasma"> | Fantasma | Doppia coppia | 2 | Il giocatore successivo ha una mossa in più nel suo prossimo turno | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/bacchetta-magica.jpg" width="90" alt="Bacchetta magica (superpotere)"> | Bacchetta magica (superpotere) | 4 | 0 | A inizio turno puoi bruciare senza consumare una mossa | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/robin-hood.png" width="90" alt="Robin Hood"> | Robin Hood | 3 carte con somma 10 | 1 | Ogni 1 in mano (carta o diamante) può valere anche 8; non vale per l'1 di Eolo (il nano) | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/hobbit-pari.jpg" width="90" alt="Hobbit pari"> | Hobbit pari | 3 carte pari | 1 | Ricevi 1 diamante | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/hobbit-dispari.jpg" width="90" alt="Hobbit dispari"> | Hobbit dispari | 3 carte dispari | 1 | Ricevi 1 diamante | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/golem-pari.png" width="90" alt="Golem pari"> | Golem pari | 2468 | 2 | 3 mosse in più in questo turno | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/golem-dispari.png" width="90" alt="Golem dispari"> | Golem dispari | 1357 | 2 | 3 mosse in più in questo turno | Rosso | 1 |
| <img src="../games/primo-gioco/immagini/classica/ercole.jpg" width="90" alt="Ercole"> | Ercole | 3 carte con somma 20 | 2 | Nessuno | — | 1 |
| <img src="../games/primo-gioco/immagini/classica/fatina.png" width="90" alt="Fatina"> | Fatina | 567 | 1 | Guardi tutte le carte in mano a un avversario e ne prendi una a scelta | Rosso | 2 |
| <img src="../games/primo-gioco/immagini/classica/scheletro.jpg" width="90" alt="Scheletro (la Morte)"> | Scheletro (la Morte) | 18 | 1 | A fine turno puoi cambiare tutte le carte in mano con altrettante pescate dal mazzo | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/cappellaio-matto.jpg" width="90" alt="Cappellaio matto"> | Cappellaio matto | Scala da 5 | 2 | A inizio turno puoi scambiare un tuo personaggio nei posti con uno scoperto sul tavolo (il tuo va sul tavolo al suo posto), senza usare una mossa | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/xena.jpg" width="90" alt="Xena"> | Xena | 357 | 1 | Ricevi 1 diamante; da quel momento i tuoi diamanti possono fare anche −1 al valore di una carta | Rosso + Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/capitan-uncino.jpg" width="90" alt="Capitan Uncino"> | Capitan Uncino | 222 + un diamante qualsiasi (obbligatorio, anche un fulmine) | 3 | Nessuno | — | 1 |
| <img src="../games/primo-gioco/immagini/classica/folletto.jpg" width="90" alt="Tremotino"> | Tremotino | 333 | 1 | Ogni 3 in mano può valere qualsiasi numero da 1 a 8 | Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/biancaneve.png" width="90" alt="Biancaneve"> | Biancaneve | 2 | 0 | Ricevi 1 diamante; ogni 2 in mano può essere scambiato con un diamante pescato dal mazzo diamanti, senza usare una mossa | Rosso + Blu | 1 |
| <img src="../games/primo-gioco/immagini/classica/lucciola-444-555.jpg" width="90" alt="Lucciola 444/555"> | Lucciola 444/555 | 444 oppure 555 | 3 | Anche il giocatore prima o dopo chi la ha nei posti può attivarla, usando una mossa: i punti vanno a chi la attiva | Speciale | 1 |
| <img src="../games/primo-gioco/immagini/classica/lucciola-333-666.jpg" width="90" alt="Lucciola 333/666"> | Lucciola 333/666 | 333 oppure 666 | 3 | Anche il giocatore prima o dopo chi la ha nei posti può attivarla, usando una mossa: i punti vanno a chi la attiva | Speciale | 1 |

## Fine partita

Quando un giocatore raggiunge i punti per vincere (default 15), si completa il giro in corso e poi si gioca **un ultimo giro completo**: tutti giocano lo stesso numero di turni.

Esempio con 4 giocatori A, B, C, D (A ha iniziato): C arriva a 15, poi giocano D (fine del giro) e A, B, C, D (ultimo giro). Poi la partita finisce.

- Vince chi ha più punti.
- A parità di punti la partita finisce in pareggio tra i giocatori in testa.

## Domande aperte

Dubbi emersi in Fase 1 (2026-10-17). Tra parentesi la proposta di Claude, da confermare.

**Decisioni prese (codici e diamanti, 2026-10-17)**

- Il diamante usato per fare +1 (o −1) a una carta va negli scarti insieme alle carte del codice.
- Scimmia: la somma 10 si può fare con quante carte si vuole, anche più di 5 (è l'unica eccezione al limite di 5 carte per codice).
- Tremotino: ogni 3 in mano, carta o diamante con valore 3, può valere qualsiasi numero da 1 a 8.
- Una sola modifica per carta: un diamante +1/−1 oppure un potere (Tremotino, Robin Hood), non entrambi.
- Una carta virtuale (nano, fenice, drago) si usa una sola volta per turno, quindi al massimo una volta nello stesso codice.
- Il fulmine non ha un numero, quindi non può fare da carta in un codice. L'unico caso in cui entra in un codice è Capitan Uncino ("un diamante qualsiasi, anche un fulmine").
- Capitan Uncino pagato con un fulmine: il fulmine si consuma come pagamento e non dà la mossa in più. Un diamante con valore usato come "diamante qualsiasi" conta solo come diamante, non col suo numero.

**Decisioni prese (turno e poteri, 2026-10-17)**

- Posti pieni: chi prende o pesca un terzo personaggio deve scartare uno dei due che aveva già, non quello appena preso.
- I personaggi scartati (posti pieni, Medusa) vanno negli scarti personaggi.
- A fine turno, se si hanno troppe carte numero, il giocatore sceglie quali scartare.
- Se un mazzo e i suoi scarti sono entrambi vuoti, non si può pescare da quel mazzo e il posto vuoto sul tavolo resta vuoto finché non torna una carta.
- Fine partita: si completa il giro e poi si gioca un ultimo giro completo (vedi "Fine partita").
- Le mosse extra si sommano tutte (Cappuccetto Rosso, Golem, Fantasma, fulmini). Un fulmine si può giocare anche a mosse finite, prima di chiudere il turno.
- Gatto con gli stivali: si può tenere qualsiasi carta del codice, anche un diamante, ma non una carta virtuale.
- Lucciola: possono attivarla i due giocatori subito prima e subito dopo il proprietario nell'ordine di turno; il posto del proprietario si libera.
- Fatina: si può attivare anche se l'avversario ha la mano vuota (nessun effetto); si prendono solo carte numero, non diamanti.
- Scheletro: si cambiano tutte le carte in mano o nessuna.
- Biancaneve: il 2 scambiato va negli scarti numeri; lo scambio si fa solo nel proprio turno.
- Mago: la prima carta del mazzo personaggi si vede solo durante il proprio turno.
- Cappellaio matto: lo scambio è facoltativo e si può fare anche con i posti pieni (è uno scambio 1 contro 1).

- Ultimo giro: se durante l'ultimo giro un altro giocatore arriva ai punti per vincere, la partita finisce comunque alla fine di quel giro.

**Decisioni prese (punto 4, 2026-10-17)**

- Il turno non si può chiudere prima di aver fatto tutte le mosse, finché ce n'è almeno una possibile (prendere, pescare o bruciare).
- Più Scimmie attivate: il limite della mano sale di +1 per ognuna.
- Cappuccetto Rosso attivato a metà turno dà subito 1 mossa in più in quel turno; dal turno dopo si fanno 4 mosse.
- Medusa: se almeno un avversario ha personaggi nei posti, scartarne uno è obbligatorio; altrimenti si attiva senza effetto.
- Cappellaio matto: lo scambio "a inizio turno" va fatto prima di qualsiasi altra azione del turno (compresi fulmine e Biancaneve).

**Decisioni prese (prove nel browser, 2026-10-17)**

- Mago: vede la prima carta coperta del mazzo personaggi solo all'inizio del proprio turno; se la pesca, non vede la successiva. Se il Mago viene attivato a metà turno, il potere si usa dal turno successivo.
- Fine turno automatico: finite le mosse, il turno si chiude da solo, tranne se il giocatore ha un fulmine da giocare, deve scartare carte in eccesso, ha lo Scheletro (che si usa a fine turno) o ha Biancaneve e almeno un 2 in mano.
- Biancaneve: attivandola si riceve anche 1 diamante (deciso il 2026-10-18), poi vale il potere blu di scambiare i 2.
- Biancaneve a fine turno: se si ha un 2 in mano, l'app chiede con un messaggio se scambiarlo con un diamante; rispondendo no il turno si chiude.
- Bacchetta magica: si brucia gratis solo a inizio turno, prima di qualsiasi altra azione. A inizio turno si possono usare sia la Bacchetta sia il Cappellaio matto, nell'ordine che si vuole.

**Decisioni prese (carte numero con le frecce, 2026-10-18)**

- Le 3 carte con le frecce (un 3, un 4 e un 5) sostituiscono 3 carte normali: il mazzo resta di 56 carte.
- I personaggi cambiati vanno nella pila degli scarti personaggi.
- Il cambio avviene ogni volta che una carta con le frecce compare sul tavolo; due carte con le frecce insieme = due cambi.
- Pescata coperta dal mazzo: non succede niente. In mano è una carta normale.

Nessuna domanda aperta al momento.
