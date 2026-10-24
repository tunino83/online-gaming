# La Famiglia – regolamento (in costruzione)

Terzo gioco della piattaforma. Nome provvisorio. Le carte sono in `docs/famiglia/bozza.md`.
Regole decise il 2026-10-24; le parti ancora aperte sono in fondo.

## Materiale

| Mazzo | A cosa serve |
| --- | --- |
| Carte numero | Valori 1–8, come Il Portale: formano i codici per attivare i personaggi (e per le difese d'emergenza) |
| Personaggi | Parenti e gente del paese, più le carte difesa (vini, Campari, scuse) |
| Eventi | Feste e ricorrenze di famiglia, con bonus e malus per un certo numero di turni |

Ogni personaggio ha: un **codice di attivazione**, dei **punti**, un **tipo** (⚔️ attacco, 🛡️ difesa, ✨ aiuto),
un **potere** e un **tempo di ricarica** (1–3 turni).

**Carte con due poteri**: il giocatore sceglie quale usare. Una carta con due poteri non mescola mai
attacco e non attacco: o sono tutti e due attacchi, o nessuno dei due lo è.

## Le zone di ogni giocatore

1. **Mano (nascosta)**: carte numero, personaggi ✨ aiuto e 🛡️ difesa, carte difesa.
2. **Attacchi in attesa (scoperti)**: i personaggi ⚔️ presi e non ancora attivati, visibili a tutti.
3. **Attivati**: i personaggi attivati; danno punti e hanno il potere **carico** o **stanco**.

| Limite | Valore |
| --- | --- |
| Carte numero in mano | 7 (salvo carte che permettono di averne di più); a fine turno si scarta fino a tornare al limite |
| Personaggi e carte difesa nascosti in mano | 3 |
| Attacchi in attesa | 3 |

Quando si prende un personaggio lo si mette subito nella zona giusta secondo il suo tipo.
Se la zona è piena (4° attacco in attesa o 4° personaggio nascosto), si scarta uno di quelli che si avevano già, a scelta.

## Come Il Portale, con nomi nuovi

- 💶 **La mancia dei nonni** (in Il Portale: diamanti): banconote con valore 1–8, usate nei codici come una
  carta numero oppure per fare +1 a una carta. Visibili a tutti, non contano nel limite della mano.
- ☕ **Il caffè** (in Il Portale: fulmine): *"Un caffè e riparto"*, una mossa in più (oppure +1 a una carta).
- 🔔 **Il campanello** (in Il Portale: carte numero con le frecce): *"Suonano alla porta!"*. Quando una di queste
  carte numero esce scoperta sul tavolo, i 2 personaggi scoperti se ne vanno (negli scarti) e ne arrivano 2 nuovi.

## Famiglia al completo

Chi ha attivato tutte e 3 le carte della stessa persona guadagna **+2 punti**.

## Preparazione

1. Mescolare i tre mazzi.
2. Scoprire sul tavolo 4 carte numero e 2 personaggi.
3. Tutti partono senza carte. Il server sorteggia l'ordine di gioco.

## Il turno

Ogni turno si fanno **3 mosse**, scegliendo tra:

| Mossa | Cosa fa |
| --- | --- |
| Prendere dal tavolo | Una carta numero o un personaggio scoperto, che si rimpiazza dal mazzo |
| Pescare | La prima carta coperta del mazzo numeri o del mazzo personaggi |
| Bruciare | Scarta le 4 carte numero scoperte e ne scopre 4 nuove |
| Attivare | Paga il codice di un personaggio (in attesa o in mano) con le carte numero: il personaggio va tra gli attivati, **carico** |
| Usare un potere | Usa il potere di un proprio personaggio attivato e carico, che poi diventa stanco |
| Pescare un evento | Solo se nessun evento è in corso: si pesca una carta evento, che vale da subito |

## Ricarica

Dopo l'uso il personaggio diventa **stanco**. A ogni inizio del proprio turno ogni carta stanca recupera 1 tacca;
quando le tacche arrivano al suo tempo di ricarica torna **carica**.

## Attacchi e difese

Quando un giocatore usa un attacco contro un avversario, la partita si ferma e l'attaccato sceglie se difendersi.
Ha un tempo massimo, deciso da chi crea la partita; dopo l'attacco passa. La difesa non costa mosse.

Ci si difende in due modi:

| | Con un personaggio attivato | D'emergenza, dalla mano |
| --- | --- | --- |
| Cosa serve | Un personaggio 🛡️ attivato e carico | Un personaggio 🛡️ o una carta difesa in mano, più le carte numero per pagarne il codice |
| Dopo | Il personaggio diventa stanco | Il personaggio (o la carta difesa) e le carte numero usate vanno negli scarti |
| Punti | Il personaggio continua a dare i suoi punti | Nessun punto |

Le carte difesa (vini, Campari, scuse) non si attivano mai: si usano solo d'emergenza.

| Carta difesa | Codice per usarla |
| --- | --- |
| 🍷 Paesano | 1 carta qualsiasi |
| 🍷 Aglianico | Coppia |
| 🍷 Taurasi | Tris |
| 🍹 Campari e le scuse | 2 carte qualsiasi |

## Eventi

Se nessun evento è in corso, il giocatore di turno può usare una mossa per pescarne uno.
L'evento vale da subito, per il numero di turni scritto sulla carta (un turno = il turno di un giocatore).
Elenco ed effetti nella bozza.

## Fine partita

Chi crea la partita sceglie come finisce:

| Modo | Quando finisce |
| --- | --- |
| **A punti** (di base) | Quando un giocatore arriva ai punti obiettivo (di base **20**) si completa il giro e si gioca un ultimo giro completo, come Il Portale |
| **Fine del mazzo** | Quando il mazzo personaggi finisce (senza rimescolare gli scarti) si completa il giro e si gioca un ultimo giro completo |

Vince chi ha più punti; a parità, pareggio tra i giocatori in testa.
Le simulazioni tra robot diranno quanto durano le partite nei due modi.

## Domande aperte

1. Tempo per difendersi: per ora 30 secondi di base, modificabile da chi crea la partita (da verificare giocando).
2. Codici e punti di ogni personaggio (livello 1: 2 carte, 1 punto; livello 2: 3 carte, 2 punti; livello 3: 4–5 carte, 3 punti).
3. Si possono attivare personaggi presi dal tavolo direttamente, o vanno prima in mano/in attesa?
4. Contro un attacco si gioca una sola difesa? (proposta: sì)
