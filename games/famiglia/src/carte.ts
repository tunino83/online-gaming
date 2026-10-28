/**
 * Tutte le carte del mazzo personaggi della Famiglia (vedi docs/famiglia/bozza.md e carte.md).
 *
 * Per aggiungere una persona o una carta basta aggiungere una voce a queste liste.
 * Nome, livello, nome del potere, tipo e codice devono restare uguali alle tabelle di
 * docs/famiglia/carte.md: un test li confronta automaticamente.
 */
import type { Carta, Codice, Livello, Potere, TipoPotere, Valore } from "./tipi-carte";

/* ---------------- codici in breve ---------------- */

const esatto = (...valori: Valore[]): Codice => ({ tipo: "esatto", valori });
const coppia: Codice = { tipo: "uguali", carte: 2 };
const tris: Codice = { tipo: "uguali", carte: 3 };
const poker: Codice = { tipo: "uguali", carte: 4 };
const pokerDispari: Codice = { tipo: "uguali", carte: 4, parita: "dispari" };
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

/**
 * Un potere: l'id è il nome senza accenti né spazi; per i poteri rinominati (2026-10-26) resta l'id di prima
 * (`id`), così le regole e le prove non cambiano.
 */
const potere = (tipo: TipoPotere) => (nome: string, testo: string, id?: string): Potere => ({ id: id ?? slug(nome), nome, tipo, testo });
const attacco = potere("attacco");
const difesa = potere("difesa");
const aiuto = potere("aiuto");
/** Aiuto "blu": sempre attivo dopo l'attivazione, non si stanca, una volta per turno. */
const aiutoBlu = (nome: string, testo: string): Potere => ({ ...aiuto(nome, testo), blu: true });

interface Lato {
  codice: Codice;
  poteri: Potere[];
  /** Turni di ricarica, se diversi dal livello (es. Roberta 1). */
  ricarica?: number;
  /** Punti, se diversi dal livello (carte forti, decise dopo la simulazione: es. Nonno Nicola 1 vale 0). */
  punti?: number;
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
    punti: l.punti ?? i + 1,
    ricarica: l.ricarica ?? i + 1,
    poteri: l.poteri,
    ...(nota ? { nota } : {}),
    copie: 1,
  }));
}

/** Una persona con una carta sola (bambini e gente del paese). */
function singola(nome: string, livello: Livello, codice: Codice, poteri: Potere[], ricarica: number = livello, nota?: string): Carta {
  const id = slug(nome);
  return { id, persona: id, nome, categoria: "personaggio", livello, codice, punti: livello, ricarica, poteri, ...(nota ? { nota } : {}), copie: 1 };
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
    { codice: somma(2, 9), poteri: [aiuto("Domani lo faccio", "Usi 1 mossa adesso e nel tuo prossimo turno hai 2 mosse in più", "ci-penso-domani")] },
    { codice: somma(3, 18), poteri: [attacco("Alta idratazione", "Un avversario scarta 2 carte numero (sceglie lui quali)", "forno-a-legna")] },
    { codice: somma(4, 20), poteri: [difesa("Per me è quadrato", "Annulli qualsiasi attacco contro di te, anche di livello 3", "ho-sempre-ragione-io")] },
  ]),
  ...persona("Maddalena", [
    { codice: pari(2), poteri: [aiuto("Fatto in casa", "Unisci 2 tue carte numero in una sola che vale la loro somma (massimo 8)")] },
    {
      codice: dispari(3),
      poteri: [
        aiuto(
          "Total black",
          "Bruci tutte le carte scoperte sul tavolo: per un giro intero, fino al tuo prossimo turno, il tavolo resta vuoto e si pesca solo dal mazzo",
        ),
      ],
    },
    {
      codice: doppiaCoppia,
      poteri: [difesa("Non è colpa mia", "L'attacco va a un altro giocatore a tua scelta, che non può difendersi", "e-colpa-di-qualcun-altro")],
    },
  ]),
  ...persona("Nonno Salvatore", [
    { codice: coppia, poteri: [aiuto("Te l'ho già detto?", "Gratis (non usa mosse): 1 mossa in più, uguale all'ultima che hai fatto")] },
    { codice: tris, poteri: [aiuto("L'ho già detto", "Gratis (non usa mosse): 2 mosse in più, uguali all'ultima che hai fatto")] },
    { codice: poker, poteri: [aiuto("Sempre la stessa storia", "Copi l'ultimo potere giocato al tavolo da chiunque")] },
  ]),
  ...persona("Nonna Dina", [
    { codice: somma(2, 7), poteri: [aiuto("Cambiamo un po'…", "Gratis (non usa mosse): cambi tutte le carte scoperte sul tavolo (numeri e personaggi)", "sposta-i-mobili")] },
    { codice: pari(3), poteri: [aiuto("Mo faccio due cotolette", "Scarti le carte numero che vuoi e ne peschi altrettante più una", "frigge-di-tutto")] },
    { codice: scala(5), poteri: [aiuto("Chissà se sta roba basta", "Tu peschi 4 carte numero, ogni avversario 1", "cucina-per-200")] },
  ]),
  ...persona("Nonno Nicola", [
    { codice: dispari(2), poteri: [aiutoBlu("L'orto", "Sempre attiva: a inizio di ogni tuo turno peschi 1 carta numero")], ricarica: 0, punti: 0 },
    { codice: somma(3, 12), poteri: [attacco("Solo per vedere comm sape", "Rubi 1 carta numero a caso dalla mano di un avversario")] },
    { codice: piuCoppia(6, 6), poteri: [attacco("È insipido", "Ogni avversario ti dà 1 carta numero (sceglie lui quale)", "manca-o-sale")] },
  ]),
  ...persona("Nonna Patrizia", [
    {
      codice: somma(2, 10),
      poteri: [
        aiuto(
          "La vita è una ruota",
          "Cambi il senso del gioco (orario/antiorario); in 2 giocatori invece tu e l'avversario vi scambiate 1 carta numero a caso. Non si usa durante l'ultimo giro",
        ),
      ],
    },
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
    {
      codice: somma(2, 8),
      poteri: [
        difesa(
          "Tofu Super Seitan",
          "Annulli un attacco di livello 1 o un attacco di carne (La tomacella, Tritacarne) di qualsiasi livello; se era di carne peschi 2 carte numero e la carta che ti ha attaccato ci mette 1 turno in più a ricaricarsi",
        ),
        aiutoBlu("Puzza di brace", "Sempre attiva: quando un avversario usa Brace accesa o Grigliata ricarica 1 carta in meno e tu peschi 1 carta numero"),
      ],
    },
    {
      codice: somma(3, 9),
      poteri: [aiutoBlu("Aperitivo", "Sempre attiva: le carte vino (Paesano, Aglianico, Taurasi) e Campari le usi senza pagarne il codice")],
      ricarica: 0,
    },
    { codice: doppiaCoppia, poteri: [difesa("E se poi te ne penti?", "L'attacco torna a chi l'ha fatto", "permalosa")] },
  ]),
  ...persona("Totò", [
    { codice: somma(2, 11), poteri: [attacco("Si incanta", "Un avversario fa 1 mossa in meno nel suo prossimo turno e tu peschi 1 carta numero")] },
    { codice: somma(3, 15), poteri: [aiuto("Brace accesa", "Ricarichi subito 2 altre tue carte stanche")] },
    { codice: pari(4), poteri: [aiuto("Grigliata", "Gratis (non usa mosse): ricarichi subito tutte le tue carte stanche")] },
  ]),
  ...persona("Checca", [
    { codice: somma(2, 6), poteri: [attacco("Lingua Glabra", "Un avversario mostra a tutti i personaggi nascosti in mano", "schietta")] },
    {
      codice: esatto(1, 2, 3),
      poteri: [
        aiuto(
          "La vetrina della collezione",
          "Metti in vetrina fino a 3 tue carte numero: nessun attacco può rubarle o farle scartare, e valgono per i tuoi codici",
        ),
      ],
    },
    {
      codice: somma(4, 24),
      poteri: [
        difesa(
          "Stuffosa",
          "Quando un avversario usa un potere di aiuto ti scocci: scarti 2 carte numero e l'aiuto non ha effetto (la sua carta si stanca lo stesso)",
        ),
      ],
      // Si scoccia spesso, ma poi ci mette tanto a passarle
      ricarica: 4,
    },
  ]),
  ...persona("Donatina", [
    { codice: somma(2, 5), poteri: [aiuto("Scaffale", "Prendi 2 carte numero scoperte dal tavolo")] },
    { codice: scala(3), poteri: [aiuto("Ce l'ho io!", "Cerchi nel mazzo numeri la carta che vuoi e la prendi")] },
    { codice: esatto(1, 2, 3, 4), poteri: [attacco("Urla", "Ogni avversario scarta 2 carte numero (sceglie lui quali)")] },
  ]),
  ...persona("Zio Salvatore", [
    { codice: esatto(7, 7), poteri: [attacco("Si canta!", "Prendi 1 carta numero a caso da ogni avversario; dopo averle prese tutte, scegli quale carta dare a ciascuno")] },
    { codice: somma(3, 14), poteri: [attacco("Versa il vino", "Una carta carica di un avversario si addormenta: diventa stanca e ci mette 1 turno in più a ricaricarsi")] },
    {
      codice: piuCoppia(8, 8),
      poteri: [aiuto("Anima della festa", "Gratis: 3 mosse in più adesso, poi si addormenta con gli occhiali da sole: 1 mossa in meno nei tuoi 2 turni successivi")],
    },
  ]),
  ...persona("Generoso", [
    { codice: piuCoppia(8, 8), poteri: [aiutoBlu("Un caffè", "Sempre attiva: per 3 turni fai 4 mosse invece di 3, poi un turno ne fai solo 2 (troppi caffè!); e si ricomincia")], ricarica: 0 },
    { codice: somma(3, 10), poteri: [aiuto("Colazione", "Peschi 1 personaggio e 2 carte numero")] },
    {
      codice: somma(4, 16),
      poteri: [aiuto("Offre la casa", "Scegli 2 tra caffè (2 mosse in più), birra (2 carte numero), colazione (1 personaggio)")],
    },
  ]),
  ...persona(
    "Francesco",
    [
      {
        codice: somma(2, 12),
        poteri: [aiutoBlu("Lezione di padel", "Sempre attiva, una volta per turno: scambi 1 carta numero della tua mano con 1 scoperta sul tavolo")],
        ricarica: 0,
      },
      { codice: somma(3, 20), poteri: [attacco("Smash", "Una carta carica di un avversario diventa stanca e lui scarta 1 carta numero a caso")] },
      {
        codice: somma(4, 20),
        poteri: [difesa("Scatto d'ira", "Annulli l'attacco; chi ti ha attaccato scarta 1 carta numero e una sua carta carica diventa stanca", "si-arrabbia")],
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
    { codice: coppia, poteri: [difesa("Forse c'è, forse no", "Giri la prossima carta numero: se è dispari annulli l'attacco, se è pari l'attacco ti colpisce; poi la carta va in mano a te")] },
    { codice: scala(3), poteri: [difesa("Non c'è, ha il turno", "Annulli un attacco contro di te")] },
    { codice: scala(5), poteri: [aiuto("Doppio turno", "Finito il tuo turno ne fai subito un altro, con 2 mosse")] },
  ]),
  ...persona(
    "Giuseppe",
    [
      {
        codice: somma(2, 13),
        poteri: [aiutoBlu("Studia il fascicolo", "Sempre attiva, una volta per turno: scegli un avversario e vedi tutte le sue carte in mano")],
        ricarica: 0,
      },
      {
        codice: pari(3),
        poteri: [difesa("Ricorso", "Annulli un attacco, ma scarti tante carte numero quanto il livello dell'attacco (se non bastano, tutte)")],
      },
      { codice: somma(4, 18), poteri: [attacco(
          "Vertenza",
          "Fai causa a un avversario: paghi con le tue carte il codice di un suo personaggio attivato di livello 1 o 2 e lo prendi, con i suoi punti; la carta si ricarica in 3 turni più il livello della carta presa",
        )] },
    ],
    "Avvocato",
  ),
  ...persona(
    "Sara e Giuseppe",
    [
      {
        codice: esatto(2, 5),
        poteri: [
          aiutoBlu(
            "Sono due etti e mezzo, lascio?",
            "Sempre attiva, una volta per turno: se la prima mossa del turno è una pescata, la rifai gratis (peschi un'altra carta dallo stesso mazzo)",
          ),
        ],
        ricarica: 0,
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
            "Mescoli le tue carte numero con quelle di un avversario e ve le ridividete: tu 1 in più di prima, lui 1 in meno.",
          ),
        ],
      },
    ],
    "La macelleria",
  ),
  ...persona(
    "Nonno Antonio",
    [
      {
        codice: esatto(1, 2),
        poteri: [
          aiutoBlu("Ne ho viste tante", "Sempre attiva: nel tuo turno vedi le prime 2 carte del mazzo personaggi e, una volta per turno, pescando scegli quale prendere"),
        ],
        ricarica: 0,
      },
      {
        codice: dispari(3),
        poteri: [difesa("Mutandoni di lana", "Annulli un attacco e fino al tuo prossimo turno nessuna tua carta può essere fatta stancare")],
      },
      { codice: pokerDispari, poteri: [attacco("Il bastone", "Una carta carica di un avversario diventa stanca e lui scarta 2 carte numero a caso")] },
    ],
    "102 anni",
  ),
  ...persona("Nonna Maddalena", [
    { codice: pari(2), poteri: [aiuto("Ogni cosa al suo posto", "Guardi le prime 5 carte del mazzo numeri: ne prendi 1 e rimetti le altre nell'ordine che vuoi")] },
    { codice: somma(3, 9), poteri: [difesa("Ho appena lavato a terra", "Annulli un attacco e chi ti ha attaccato fa 1 mossa in meno nel suo prossimo turno")] },
    {
      codice: scala(5),
      poteri: [
        aiuto(
          "Patate al forno",
          "Scopri tante carte numero quanti sono i giocatori; tu ne prendi 2 per prima, poi gli altri 1 a turno; l'ultimo resta senza",
        ),
      ],
    },
  ]),
  ...persona("Roberta", [
    {
      codice: somma(2, 7),
      poteri: [attacco("Ti chiamo un attimo…", "Regali 2 carte numero a un avversario, ma lo tieni al telefono: salta il suo prossimo turno")],
      ricarica: 2,
    },
    { codice: tris, poteri: [difesa("Chiusa in camera", "Annulli un attacco e fino al tuo prossimo turno nessuno può guardare o prendere i tuoi personaggi nascosti")] },
    { codice: poker, poteri: [attacco("Sparecchio", "Una carta attivata di un avversario torna nella sua mano, nascosta: perde i punti finché non la riattiva")] },
  ]),
  ...persona("Claudia", [
    {
      codice: somma(2, 15),
      poteri: [aiutoBlu(
          "Prosecco",
          "Sempre attiva, una volta per turno: attivi un personaggio pagando il codice di un'altra tua carta con al massimo 1 livello di differenza (sei brilla e ti confondi)",
        )],
      ricarica: 0,
      punti: 0,
    },
    { codice: somma(3, 16), poteri: [attacco("Zeppata sui social", "Ogni avversario sceglie: ti dà 1 carta numero oppure una sua carta carica diventa stanca")] },
    {
      codice: doppiaCoppia,
      poteri: [difesa("Una fetta di torta?", "Annulli l'attacco e fate pace con i dolci: tu peschi 2 carte numero, chi ti ha attaccato 1")],
    },
  ]),
  ...persona(
    "Squacqualacchione",
    [
      { codice: somma(2, 9), poteri: [attacco("Burla", "Prendi 2 carte numero a caso a un avversario e gli dai una tua a scelta")] },
      {
        codice: dispari(3),
        poteri: [aiuto("Giacca al rovescio", "Usi il potere di una carta attivata e carica di un avversario come se fosse tua (la sua non si stanca)")],
      },
      { codice: piuCoppia(8, 8), poteri: [attacco("Volo infuocato", "Una carta carica di ogni avversario diventa stanca")] },
    ],
    "Maschera del Carnevale di Teora",
  ),
  ...persona(
    "Simone",
    [
      {
        codice: somma(2, 6),
        poteri: [aiuto("Pranzo a domicilio", "Peschi 2 carte numero e poi, se vuoi, scambi 1 carta numero della tua mano con 1 scoperta sul tavolo")],
      },
      { codice: dispari(3), poteri: [difesa("Scudo da gladiatore", "Annulli un attacco; se era di livello 1, chi ti ha attaccato scarta 1 carta numero a caso")] },
      {
        codice: somma(4, 22),
        poteri: [
          attacco(
            "Invasione di campo",
            "2 avversari a scelta fanno stancare una loro carta carica (scelgono loro quale); per ogni avversario colpito peschi 1 carta numero",
          ),
        ],
      },
    ],
    "Gladiatore, tifosissimo di calcio; porta il pranzo a domicilio ed è un gran cuoco",
  ),
  ...persona(
    "Annalisa",
    [
      {
        codice: somma(2, 11),
        poteri: [difesa("Drago Tascabile", "Annulli un attacco: Tyrion, il tuo drago tascabile, salta fuori dalla borsa e porta via 1 carta numero a caso a chi ti ha attaccato")],
      },
      {
        codice: somma(3, 12),
        poteri: [
          aiutoBlu(
            "Medico in famiglia",
            "Sempre attiva: attivi Dottor Racioppi e Zia Diana senza pagare il codice; una volta per turno, gratis, prendi uno dei due dalla pila degli scarti",
          ),
        ],
        ricarica: 0,
      },
      {
        codice: scala(5),
        poteri: [
          aiuto(
            "Il mio corpo che cambia",
            "Scambi una tua carta attivata con un personaggio che hai in mano: quello si attiva senza pagare il codice ma arriva stanco, l'altro torna in mano",
          ),
        ],
      },
    ],
    "Fan di Piero Pelù e di Un medico in famiglia",
  ),
  ...persona(
    "Nonna Maria",
    [
      {
        codice: somma(2, 13),
        poteri: [aiuto("Un filo di trucco", "Una tua carta numero diventa truccata: vale 1 in più o 1 in meno, a tua scelta")],
      },
      {
        codice: somma(3, 17),
        poteri: [
          attacco(
            "Una sigaretta fuori al bar",
            "Donna emancipata, vai a fumare fuori al bar davanti a tutti: un avversario si scandalizza e nel suo prossimo turno non può attivare personaggi",
          ),
        ],
      },
      {
        codice: dispari(4),
        poteri: [difesa(
            "La cionna",
            "Gliene dici di tutti i colori: annulli qualsiasi attacco, anche di livello 3, e chi ti ha attaccato, scandalizzato, scarta 1 carta numero a caso",
          )],
      },
    ],
    "Vanitosa, piena di bracciali, sempre truccata; fuma e dice le parolacce",
  ),
  ...persona(
    "Nonno Rafiluccio",
    [
      {
        codice: somma(2, 10),
        poteri: [
          difesa("Tiro su un muro", "Annulli un attacco di livello 1, e il muro resta: fino al tuo prossimo turno nessun attacco di livello 1 ti colpisce"),
        ],
      },
      { codice: pari(3), poteri: [aiuto("Straordinario", "Gratis (non usa mosse): 1 mossa in più adesso e 1 nel tuo prossimo turno")] },
      {
        codice: scala(5),
        poteri: [
          attacco("Brontola tutto il giorno", "Un avversario, pur di non sentirti più, sceglie: ti dà 2 carte numero oppure salta il suo prossimo turno"),
        ],
      },
    ],
    "Muratore, gran lavoratore e brontolone",
  ),
];

/* ---------------- carte singole ---------------- */

const SINGOLE: Carta[] = [
  singola("Nicole", 2, somma(3, 11), [attacco("Parla parla parla", "Un avversario nel suo prossimo turno non può usare poteri")]),
  singola(
    "Christian",
    1,
    coppia,
    [attacco("Ho tanta fame", "Braccine corte da T-rex: prendi 2 carte numero a caso dall'avversario con i punti più vicini ai tuoi (a parità scegli tu)")],
    2,
  ),
  {
    // Vale 1 punto invece di 2 (carta forte, deciso dopo la simulazione)
    ...singola("Alessia", 2, pari(3), [
      aiuto(
        "Mangia mangia mangia",
        "Gratis: peschi 4 carte numero alla cieca; poi l'indigestione: nei tuoi 2 turni successivi, a fine turno, scarti sempre 1 carta in più",
      ),
    ]),
    punti: 1,
  },
  singola("Greta", 2, dispari(3), [attacco("Risata contagiosa", "Ogni avversario scarta 1 carta numero a caso")]),
  singola("Donato", 2, scala(3), [difesa("Non ti sento, sto suonando", "Annulli un attacco e chi ti ha attaccato non può attaccarti di nuovo in questo giro")]),
  singola("Franchino", 2, somma(3, 15), [attacco("Multa", "Chi ha più carte numero in mano ne scarta 2 (se sono più di uno a pari merito, tutti)")]),
  singola(
    "Rocky",
    2,
    somma(3, 14),
    [attacco("Bisiniss", "Tagli a metà la carta numero più alta di un avversario: la scarta e al suo posto riceve una carta che vale la metà (es. un 8 diventa un 4)")],
    2,
    "Il barbiere del paese",
  ),
  singola("Vincenzo", 1, somma(2, 8), [aiuto("Frutta e verdura!", "Scopri 4 carte dal mazzo numeri, ne prendi 2 e le altre vanno negli scarti")]),
  singola("Don Pasquale", 2, tris, [difesa("Benedizione", "Nel tuo turno: fino al tuo prossimo turno nessun giocatore può essere attaccato")]),
  singola("Dottor Racioppi", 1, somma(2, 10), [aiuto("Ricetta", "Ricarichi subito una carta stanca di chi vuoi e peschi 1 carta numero")]),
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

/**
 * La carta è "blu" (sempre attiva, non si stanca mai)? Solo se tutti i suoi poteri sono blu:
 * Chicca 1 ha Puzza di brace (blu) e Tofu Super Seitan (normale), quindi si stanca usando il Tofu.
 */
export const eBlu = (idCarta: string): boolean => carta(idCarta).poteri.every((p) => p.blu);

/** Le carte di Medico in famiglia (Annalisa 2): si attivano senza codice e si possono riprendere dagli scarti. */
export const MEDICI: ReadonlySet<string> = new Set(["dottor-racioppi", "zia-diana"]);

/** Quel potere della carta è blu? */
export const potereBlu = (idCarta: string, potere: string): boolean => !!carta(idCarta).poteri.find((p) => p.id === potere)?.blu;

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
