/**
 * Tutte le carte del mazzo personaggi della Famiglia (vedi docs/famiglia/bozza.md e carte.md).
 *
 * Per aggiungere una persona o una carta basta aggiungere una voce a queste liste.
 * Nome, livello, nome del potere, tipo e codice devono restare uguali alle tabelle di
 * docs/famiglia/carte.md: un test li confronta automaticamente.
 *
 * Non ancora nel mazzo (poteri da definire): Simone, Annalisa.
 */
import type { Carta, Codice, Livello, Potere, TipoPotere, Valore } from "./tipi-carte";

/* ---------------- codici in breve ---------------- */

const esatto = (...valori: Valore[]): Codice => ({ tipo: "esatto", valori });
const coppia: Codice = { tipo: "uguali", carte: 2 };
const tris: Codice = { tipo: "uguali", carte: 3 };
const poker: Codice = { tipo: "uguali", carte: 4 };
const doppiaCoppia: Codice = { tipo: "doppiaCoppia" };
const somma = (carte: number, totale: number): Codice => ({ tipo: "somma", carte, totale });
const pari = (carte: number): Codice => ({ tipo: "parita", carte, parita: "pari" });
const dispari = (carte: number): Codice => ({ tipo: "parita", carte, parita: "dispari" });
const scala = (lunghezza: 3 | 5): Codice => ({ tipo: "scala", lunghezza });
const qualsiasi = (carte: number): Codice => ({ tipo: "qualsiasi", carte });
const piuCoppia = (...valori: Valore[]): Codice => ({ tipo: "combinato", esatto: valori, piu: coppia });

/* ---------------- poteri in breve ---------------- */

/** Id tecnico dal nome: minuscolo, senza accenti né apostrofi, spazi → trattini. */
export function slug(testo: string): string {
  return testo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const potere = (tipo: TipoPotere) => (nome: string, testo: string): Potere => ({ id: slug(nome), nome, tipo, testo });
const attacco = potere("attacco");
const difesa = potere("difesa");
const aiuto = potere("aiuto");

interface Lato {
  codice: Codice;
  poteri: Potere[];
}

/** Una persona con 3 carte (livello 1, 2, 3): punti e ricarica uguali al livello. */
function persona(nome: string, lati: [Lato, Lato, Lato], nota?: string): Carta[] {
  const id = slug(nome);
  return lati.map((l, i) => ({
    id: `${id}-${i + 1}`,
    persona: id,
    nome,
    categoria: "personaggio",
    livello: (i + 1) as Livello,
    codice: l.codice,
    punti: i + 1,
    ricarica: i + 1,
    poteri: l.poteri,
    ...(nota ? { nota } : {}),
    copie: 1,
  }));
}

/** Una persona con una carta sola (bambini e gente del paese). */
function singola(nome: string, livello: Livello, codice: Codice, poteri: Potere[], ricarica: number = livello): Carta {
  const id = slug(nome);
  return { id, persona: id, nome, categoria: "personaggio", livello, codice, punti: livello, ricarica, poteri, copie: 1 };
}

/** Carta difesa o attacco: si usa una volta sola e non dà punti. */
function oggetto(categoria: "difesa" | "attacco", nome: string, livello: Livello, codice: Codice, testo: string, copie: number): Carta {
  const id = slug(nome);
  return {
    id,
    persona: id,
    nome,
    categoria,
    livello,
    codice,
    punti: 0,
    ricarica: 0,
    poteri: [potere(categoria === "difesa" ? "difesa" : "attacco")(nome, testo)],
    copie,
  };
}

/* ---------------- adulti (3 carte ciascuno) ---------------- */

const ADULTI: Carta[] = [
  ...persona("Antonio", [
    { codice: somma(2, 9), poteri: [aiuto("Ci penso domani", "Una mossa non fatta la tieni per il prossimo turno")] },
    { codice: somma(3, 18), poteri: [attacco("Forno a legna", "Un avversario scarta 2 carte numero (sceglie lui quali)")] },
    { codice: somma(4, 20), poteri: [difesa("Ho sempre ragione io", "Annulli qualsiasi potere appena giocato da chiunque")] },
  ]),
  ...persona("Maddalena", [
    {
      codice: pari(2),
      poteri: [
        aiuto("Non sbaglio mai", "Subito dopo una pescata cambi la carta con un'altra, senza usare mosse"),
        aiuto("Fatto in casa", "Unisci 2 tue carte numero in una sola che vale la loro somma (massimo 8)"),
      ],
    },
    { codice: dispari(3), poteri: [difesa("Non è colpa mia", "L'attacco va a un altro giocatore a tua scelta")] },
    { codice: doppiaCoppia, poteri: [difesa("È colpa di qualcun altro", "L'attacco va a un altro giocatore a tua scelta, che non può difendersi")] },
  ]),
  ...persona("Nonno Salvatore", [
    { codice: coppia, poteri: [aiuto("Te l'ho già detto?", "1 mossa in più, uguale all'ultima che hai fatto")] },
    { codice: tris, poteri: [aiuto("L'ho già detto", "2 mosse in più, uguali all'ultima che hai fatto")] },
    { codice: poker, poteri: [aiuto("Sempre la stessa storia", "Copi l'ultimo potere giocato al tavolo da chiunque")] },
  ]),
  ...persona("Nonna Dina", [
    { codice: somma(2, 7), poteri: [aiuto("Sposta i mobili", "Cambi tutte le carte scoperte sul tavolo (numeri e personaggi)")] },
    { codice: pari(3), poteri: [aiuto("Frigge di tutto", "Scarti le carte numero che vuoi e ne peschi altrettante più una")] },
    { codice: scala(5), poteri: [aiuto("Cucina per 200", "Tu peschi 4 carte numero, ogni avversario 1")] },
  ]),
  ...persona("Nonno Nicola", [
    { codice: dispari(2), poteri: [aiuto("L'orto", "Peschi 2 carte numero")] },
    { codice: somma(3, 12), poteri: [attacco("Solo per vedere comm sape", "Rubi 1 carta numero a caso dalla mano di un avversario")] },
    { codice: piuCoppia(6, 6), poteri: [attacco("Manca 'o sale", "Ogni avversario ti dà 1 carta numero (sceglie lui quale)")] },
  ]),
  ...persona("Nonna Patrizia", [
    { codice: somma(2, 10), poteri: [aiuto("Mercatino", "Prendi una carta a scelta dagli scarti numeri")] },
    { codice: scala(3), poteri: [difesa("Nuvola di fumo", "Fino al tuo prossimo turno nessuno può attaccarti")] },
    {
      codice: dispari(4),
      poteri: [
        attacco(
          "Baratto",
          "Scambi una tua carta attivata con una attivata di un avversario (punti compresi), dello stesso livello o con un livello di differenza; tutte e due diventano stanche",
        ),
      ],
    },
  ]),
  ...persona("Chicca", [
    { codice: somma(2, 8), poteri: [aiuto("Vende la carne", "Scarti un personaggio nascosto dalla mano e peschi 3 carte numero")] },
    { codice: somma(3, 9), poteri: [difesa("Non sa perdere", "Annulli un attacco; se sei ultima nei punti la carta non si stanca")] },
    { codice: doppiaCoppia, poteri: [difesa("Permalosa", "L'attacco torna a chi l'ha fatto")] },
  ]),
  ...persona("Totò", [
    { codice: somma(2, 11), poteri: [attacco("Si incanta", "Un avversario fa 1 mossa in meno nel suo prossimo turno")] },
    { codice: somma(3, 15), poteri: [aiuto("Brace accesa", "Ricarichi subito un'altra tua carta stanca")] },
    { codice: pari(4), poteri: [aiuto("Grigliata", "Ricarichi subito tutte le tue carte stanche")] },
  ]),
  ...persona("Checca", [
    { codice: somma(2, 6), poteri: [attacco("Schietta", "Un avversario mostra a tutti i personaggi nascosti in mano")] },
    {
      codice: esatto(1, 2, 3),
      poteri: [
        aiuto(
          "La vetrina della collezione",
          "Metti in vetrina fino a 3 tue carte numero: nessun attacco può rubarle o farle scartare, e valgono per i tuoi codici",
        ),
      ],
    },
    { codice: somma(4, 24), poteri: [attacco("Allergica al finocchietto", "Scegli un personaggio nascosto in mano a un avversario e lo fai scartare")] },
  ]),
  ...persona("Donatina", [
    { codice: somma(2, 5), poteri: [aiuto("Scaffale", "Prendi 2 carte numero scoperte dal tavolo")] },
    { codice: scala(3), poteri: [aiuto("Ce l'ho io!", "Cerchi nel mazzo numeri la carta che vuoi e la prendi")] },
    { codice: esatto(1, 2, 3, 4), poteri: [attacco("Urla", "Ogni avversario scarta 2 carte numero (sceglie lui quali)")] },
  ]),
  ...persona("Zio Salvatore", [
    { codice: esatto(7, 7), poteri: [attacco("Si canta!", "Ogni avversario ti dà 1 carta numero a caso e tu ne dai 1 a tua scelta a ciascuno")] },
    { codice: somma(3, 14), poteri: [attacco("Versa il vino", "Una carta carica di un avversario si addormenta (diventa stanca)")] },
    { codice: piuCoppia(8, 8), poteri: [aiuto("Anima della festa", "3 mosse in più (poi si addormenta con gli occhiali da sole)")] },
  ]),
  ...persona("Generoso", [
    { codice: somma(2, 4), poteri: [aiuto("Un caffè", "1 mossa in più")] },
    { codice: somma(3, 10), poteri: [aiuto("Colazione", "Peschi 1 personaggio e 1 carta numero")] },
    {
      codice: somma(4, 16),
      poteri: [aiuto("Offre la casa", "Scegli 2 tra caffè (2 mosse in più), birra (2 carte numero), colazione (1 personaggio)")],
    },
  ]),
  ...persona(
    "Francesco",
    [
      { codice: somma(2, 12), poteri: [aiuto("Lezione di padel", "Scambi 1 carta numero della tua mano con 1 scoperta sul tavolo")] },
      { codice: somma(3, 20), poteri: [attacco("Smash", "Una carta carica di un avversario diventa stanca e lui scarta 1 carta numero a caso")] },
      {
        codice: somma(4, 20),
        poteri: [difesa("Si arrabbia", "Annulli l'attacco; chi ti ha attaccato scarta 1 carta numero e una sua carta carica diventa stanca")],
      },
    ],
    "Non beve vino: Versa il vino non ha effetto sulle sue carte",
  ),
  ...persona("Gerardina", [
    { codice: coppia, poteri: [difesa("Sempre calma", "Annulli un attacco di livello 1")] },
    { codice: somma(3, 13), poteri: [attacco("Una rospa?", "Dai 1 tua carta numero a un avversario e in cambio prendi a caso un personaggio nascosto dalla sua mano")] },
    { codice: somma(4, 22), poteri: [attacco("Rospe per tutti", "Ogni avversario nel suo prossimo turno fa 1 mossa in meno")] },
  ]),
  ...persona("Marika", [
    { codice: coppia, poteri: [difesa("Forse c'è, forse no", "Annulli un attacco, ma solo 1 volta su 2 (testa o croce)")] },
    { codice: scala(3), poteri: [difesa("Non c'è, ha il turno", "Annulli un attacco contro di te")] },
    { codice: scala(5), poteri: [aiuto("Doppio turno", "Finito il tuo turno ne fai subito un altro, con 2 mosse")] },
  ]),
  ...persona(
    "Giuseppe",
    [
      { codice: somma(2, 13), poteri: [aiuto("Studia il fascicolo", "Guardi tutte le carte in mano a un avversario")] },
      {
        codice: pari(3),
        poteri: [difesa("Ricorso", "Annulli un attacco, ma scarti tante carte numero quanto il livello dell'attacco (se non bastano, tutte)")],
      },
      { codice: somma(4, 18), poteri: [attacco("Vertenza", "Prendi a un avversario un personaggio attivato di livello 1 o 2, con i suoi punti")] },
    ],
    "Avvocato",
  ),
  ...persona(
    "Sara e Giuseppe",
    [
      {
        codice: esatto(2, 5),
        poteri: [aiuto("Sono due etti e mezzo, lascio?", "Per il resto del turno, ogni volta che peschi una carta numero ne prendi una in più")],
      },
      {
        codice: dispari(3),
        poteri: [difesa("Cella frigorifera", "Annulli un attacco; la carta che ti ha attaccato ci mette 1 turno in più a ricaricarsi")],
      },
      {
        codice: somma(4, 12),
        poteri: [
          attacco(
            "Tritacarne",
            "Mescoli le tue carte numero con quelle di un avversario e ve le ridividete: tu 1 in più di prima, lui 1 in meno. Se hai una carta di Chicca stanca, si ricarica",
          ),
        ],
      },
    ],
    "La macelleria",
  ),
  ...persona(
    "Nonno Antonio",
    [
      { codice: esatto(1, 2), poteri: [aiuto("Ne ho viste tante", "Guardi le prime 3 carte del mazzo personaggi e ne prendi una")] },
      {
        codice: dispari(3),
        poteri: [difesa("Mutandoni di lana", "Annulli un attacco e fino al tuo prossimo turno nessuna tua carta può essere fatta stancare")],
      },
      { codice: esatto(1, 1, 1, 1), poteri: [attacco("Il bastone", "Una carta carica di un avversario diventa stanca e lui scarta 2 carte numero a caso")] },
    ],
    "102 anni",
  ),
  ...persona("Nonna Maddalena", [
    { codice: pari(2), poteri: [aiuto("Ogni cosa al suo posto", "Guardi le prime 5 carte del mazzo numeri e le rimetti nell'ordine che vuoi")] },
    { codice: somma(3, 9), poteri: [difesa("Ho appena lavato a terra", "Annulli un attacco e chi ti ha attaccato fa 1 mossa in meno nel suo prossimo turno")] },
    {
      codice: scala(5),
      poteri: [
        aiuto(
          "Patate al forno",
          "Scopri una carta numero in meno dei giocatori; ne prendi una per prima, poi gli altri a turno; l'ultimo resta senza",
        ),
      ],
    },
  ]),
  ...persona("Roberta", [
    { codice: somma(2, 7), poteri: [aiuto("Avanzi", "Prendi le ultime 2 carte scartate nella pila numeri")] },
    { codice: tris, poteri: [difesa("Chiusa in camera", "Annulli un attacco e fino al tuo prossimo turno nessuno può guardare o prendere i tuoi personaggi nascosti")] },
    { codice: poker, poteri: [attacco("Sparecchio", "Una carta attivata di un avversario torna nella sua mano, nascosta: perde i punti finché non la riattiva")] },
  ]),
  ...persona("Claudia", [
    { codice: dispari(2), poteri: [aiuto("Prosecco", "1 mossa in più e peschi 1 carta numero")] },
    { codice: somma(3, 16), poteri: [attacco("Zeppata sui social", "Ogni avversario sceglie: ti dà 1 carta numero oppure una sua carta carica diventa stanca")] },
    { codice: doppiaCoppia, poteri: [difesa("Zeppata difensiva", "Annulli l'attacco e chi ti ha attaccato mostra a tutti la sua mano e i personaggi nascosti")] },
  ]),
  ...persona(
    "Squacqualacchione",
    [
      { codice: somma(2, 9), poteri: [attacco("Burla", "Prendi 1 carta numero a caso a un avversario e gli dai una tua a scelta")] },
      {
        codice: dispari(3),
        poteri: [aiuto("Giacca al rovescio", "Usi il potere di una carta attivata e carica di un avversario come se fosse tua (la sua non si stanca)")],
      },
      { codice: piuCoppia(8, 8), poteri: [attacco("Volo infuocato", "Una carta carica di ogni avversario diventa stanca")] },
    ],
    "Maschera del Carnevale di Teora",
  ),
];

/* ---------------- carte singole ---------------- */

const SINGOLE: Carta[] = [
  singola("Nicole", 2, somma(3, 11), [attacco("Parla parla parla", "Un avversario nel suo prossimo turno non può usare poteri")]),
  singola(
    "Christian",
    1,
    coppia,
    [aiuto("Ho tanta fame", "Peschi 2 carte numero"), difesa("Che paura!", "Annulli un attacco contro di te")],
    2,
  ),
  singola("Alessia", 2, pari(3), [
    aiuto("Mangia mangia mangia", "Prendi le 4 carte numero scoperte sul tavolo; fino a fine turno non puoi scartarle"),
  ]),
  singola("Greta", 2, dispari(3), [attacco("Risata contagiosa", "Ogni avversario scarta 1 carta numero a caso")]),
  singola("Donato", 2, scala(3), [difesa("Non ti sento, sto suonando", "Annulli un attacco e chi ti ha attaccato non può attaccarti di nuovo in questo giro")]),
  singola("Franchino", 2, somma(3, 15), [attacco("Multa", "Chi ha più carte numero in mano ne scarta 2 (se sono più di uno a pari merito, tutti)")]),
  singola("Vincenzo", 1, somma(2, 8), [aiuto("Frutta e verdura!", "Scopri 4 carte dal mazzo numeri, ne prendi 2 e le altre vanno negli scarti")]),
  singola("Don Pasquale", 2, tris, [difesa("Benedizione", "Nel tuo turno: fino al tuo prossimo turno nessun giocatore può essere attaccato")]),
  singola("Dottor Racioppi", 1, somma(2, 10), [aiuto("Ricetta", "Ricarichi subito una carta stanca di chi vuoi")]),
  singola("Zia Diana", 2, somma(3, 12), [
    difesa("Guardia medica", "Dopo che un attacco ti ha colpito, le carte numero scartate tornano in mano e le carte fatte stancare tornano cariche"),
  ]),
];

/* ---------------- carte difesa e attacco (si usano una volta) ---------------- */

const DIFESE: Carta[] = [
  oggetto("difesa", "Paesano", 1, qualsiasi(1), "Annulli un attacco di livello 1", 3),
  oggetto("difesa", "Aglianico", 2, coppia, "Annulli un attacco di livello 1 o 2", 2),
  oggetto("difesa", "Taurasi", 3, tris, "Annulli qualsiasi attacco; chi ti ha attaccato fa 1 mossa in meno nel suo prossimo turno", 1),
  oggetto("difesa", "Campari", 2, qualsiasi(2), "Annulli un attacco e peschi 1 carta numero", 2),
  oggetto("difesa", "Sono a un matrimonio", 2, qualsiasi(2), "Annulli un attacco; durante l'evento Matrimonio la carta torna in mano", 2),
  oggetto("difesa", "Nevicava, non è potuto venire", 2, qualsiasi(2), "Annulli un attacco; per il resto del giro nessuno può più attaccare", 2),
  oggetto("difesa", "Sono andato a Lioni a fa' a spesa", 2, qualsiasi(2), "Annulli un attacco e peschi 2 carte numero", 2),
];

const ATTACCHI: Carta[] = [
  oggetto("attacco", "La tomacella", 2, coppia, "Una carta carica di un avversario si stanca", 1),
  oggetto("attacco", "Giro aperto", 2, coppia, "Prendi 1 carta numero a caso dalla mano di un avversario", 1),
  oggetto("attacco", "Gli occhi 'nguoll", 2, coppia, "Un avversario scarta un personaggio nascosto a caso", 1),
  oggetto("attacco", "Vento", 1, qualsiasi(1), "Un avversario scarta tutte le carte numero e ne ripesca altrettante dal mazzo", 1),
];

export const CARTE: readonly Carta[] = [...ADULTI, ...SINGOLE, ...DIFESE, ...ATTACCHI];

const PER_ID = new Map(CARTE.map((c) => [c.id, c]));

export function carta(id: string): Carta {
  const c = PER_ID.get(id);
  if (!c) throw new Error(`Carta sconosciuta: ${id}`);
  return c;
}

/** La carta ha almeno un potere di attacco? Allora si tiene scoperta negli attacchi in attesa. */
export const eAttacco = (c: Carta): boolean => c.poteri.some((p) => p.tipo === "attacco");

/**
 * Nomi dei file immagine da cercare per una carta, in ordine (vedi immagini/LEGGIMI.md):
 * prima quella della carta precisa (es. "antonio-2"), poi quella della persona ("antonio").
 * Se non c'è nessuna delle due, la carta mostra il nome scritto.
 */
export const nomiImmagine = (c: Carta): string[] => (c.id === c.persona ? [c.id] : [c.id, c.persona]);

/** Le carte di una persona (1 per le carte singole, 3 per gli adulti). */
export const cartePersona = (persona: string): Carta[] => CARTE.filter((c) => c.persona === persona && c.categoria === "personaggio");
