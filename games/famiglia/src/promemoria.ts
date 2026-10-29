/**
 * Promemoria brevi dei poteri, stampati sulle carte sotto l'immagine (il testo completo è nella tabella dei poteri).
 * Una riga per potere: per cambiarne uno basta correggere il testo qui. Se un potere non c'è, si stampa il suo testo intero.
 */
export const PROMEMORIA: Record<string, string> = {
  // Antonio
  "ci-penso-domani": "1 mossa adesso, +2 mosse nel prossimo turno",
  "forno-a-legna": "un avversario scarta 2 carte (sceglie lui)",
  "ho-sempre-ragione-io": "fermi qualsiasi attacco, anche di livello 3",
  // Maddalena
  "fatto-in-casa": "unisci 2 carte in una (somma, max 8)",
  "total-black": "bruci il tavolo: vuoto fino al tuo turno",
  "e-colpa-di-qualcun-altro": "passi l'attacco a un altro: non si difende",
  // Nonno Salvatore
  "te-l-ho-gia-detto": "gratis: rifai l'ultima mossa",
  "l-ho-gia-detto": "gratis: rifai 2 volte l'ultima mossa",
  "sempre-la-stessa-storia": "copi l'ultimo potere giocato al tavolo",
  // Nonna Dina
  "sposta-i-mobili": "gratis: cambi tutte le carte del tavolo",
  "frigge-di-tutto": "scarti quante vuoi, ne peschi una in più",
  "cucina-per-200": "tu peschi 4, ogni avversario 1",
  // Nonno Nicola
  "l-orto": "a ogni tuo turno peschi 1 carta",
  "solo-per-vedere-comm-sape": "rubi 1 carta a caso a un avversario",
  "manca-o-sale": "ogni avversario ti dà 1 carta (sceglie lui)",
  // Nonna Patrizia
  "la-vita-e-una-ruota": "cambi il senso del gioco (in 2: scambio di 1 carta)",
  "nuvola-di-fumo": "nessuno ti attacca fino al tuo turno",
  baratto: "scambi una tua carta attivata con una sua",
  // Chicca
  "tofu-super-seitan": "fermi il livello 1 e gli attacchi di carne",
  "puzza-di-brace": "Diavolina e O al sangue altrui: 1 in meno, tu peschi 1",
  aperitivo: "vini e Campari gratis, senza codice",
  permalosa: "l'attacco torna a chi l'ha fatto",
  // Totò
  "si-incanta": "un avversario: 1 mossa in meno; tu peschi 1",
  "brace-accesa": "ricarichi 2 tue carte stanche",
  grigliata: "gratis: ricarichi tutte le tue carte",
  // Checca
  schietta: "un avversario mostra i suoi nascosti",
  collezione: "mostri una coppia: tutti ti danno quel numero",
  stuffosa: "blocchi un aiuto altrui scartando 2 carte",
  // Donatina
  scaffale: "prendi 2 carte numero dal tavolo",
  "ce-l-ho-io": "cerchi nel mazzo la carta che vuoi",
  urla: "ogni avversario scarta 2 carte (sceglie lui)",
  // Zio Salvatore
  "si-canta": "prendi 1 carta a ognuno, poi ne ridai una a testa",
  "versa-il-vino": "una carta avversaria dorme 1 turno in più",
  "anima-della-festa": "gratis: +3 mosse ora, poi 2 turni con 1 in meno",
  // Generoso
  "un-caffe": "4 mosse per 3 turni, poi un turno da 2",
  colazione: "peschi 1 personaggio e 2 carte numero",
  "offre-la-casa": "2 tra: caffè (+2 mosse), birra (+2 carte), colazione",
  // Francesco
  "lezione-di-padel": "una volta per turno: scambi 1 carta col tavolo",
  "non-e-ancora-arrivato": "fermi qualsiasi attacco, poi 1 mossa in meno",
  "si-arrabbia": "fermi l'attacco: lui scarta 1 e una sua carta dorme",
  // Gerardina
  "sempre-calma": "fermi un attacco di livello 1",
  "una-rospa": "dai 1 carta, prendi un suo nascosto a caso",
  "rospe-per-tutti": "ogni avversario: 1 mossa in meno",
  // Marika
  "forse-c-e-forse-no": "giri una carta: dispari fermi l'attacco",
  "non-c-e-ha-il-turno": "fermi un attacco",
  "doppio-turno": "dopo il tuo turno ne fai un altro da 2 mosse",
  // Giuseppe (avvocato)
  "studia-il-fascicolo": "una volta per turno: vedi la mano di uno",
  ricorso: "fermi l'attacco, scarti tante carte quanto il suo livello",
  vertenza: "paghi il codice e ti prendi una sua carta (liv. 1-2)",
  // Sara e Giuseppe
  "sono-due-etti-e-mezzo-lascio": "la prima pescata del turno la rifai gratis",
  "cella-frigorifera": "fermi l'attacco: la sua carta dorme 1 turno in più",
  tritacarne: "mescoli le carte con uno: tu +1, lui -1",
  // Nonno Antonio
  "ne-ho-viste-tante": "vedi i primi 2 personaggi e scegli quale pescare",
  "mutandoni-di-lana": "fermi l'attacco: le tue carte non si stancano",
  "il-bastone": "una sua carta dorme e scarta 2 carte",
  // Nonna Maddalena
  "ogni-cosa-al-suo-posto": "guardi 5 carte, ne prendi 1, riordini le altre",
  "ho-appena-lavato-a-terra": "fermi l'attacco: chi attacca 1 mossa in meno",
  "patate-al-forno": "scopri carte: tu ne prendi 2, gli altri 1",
  // Roberta
  "ti-chiamo-un-attimo": "gli regali 2 carte ma salta il turno",
  "chiusa-in-camera": "fermi l'attacco: i tuoi nascosti al sicuro",
  sparecchio: "una sua carta attivata torna in mano",
  // Claudia
  prosecco: "attivi pagando il codice di un'altra tua carta",
  "zeppata-sui-social": "ognuno ti dà 1 carta o fa dormire una carta",
  "una-fetta-di-torta": "fermi l'attacco: tu peschi 2, lui 1",
  // Squacqualacchione
  burla: "prendi 2 carte a uno e gliene dai 1 tua",
  "giacca-al-rovescio": "usi il potere di una carta altrui",
  "volo-infuocato": "una carta di ogni avversario si stanca",
  // Simone
  "pranzo-a-domicilio": "peschi 2, poi puoi scambiarne 1 col tavolo",
  "scudo-da-gladiatore": "fermi fino al livello 2 (al livello 1 lui scarta 1)",
  "invasione-di-campo": "2 avversari fanno dormire una carta; peschi 1 a testa",
  // Annalisa
  "drago-tascabile": "fermi l'attacco e gli rubi 1 carta",
  "medico-in-famiglia": "Racioppi e Zia Diana gratis, anche dagli scarti",
  "il-mio-corpo-che-cambia": "scambi una carta attivata con una in mano",
  // Nonna Maria
  "un-filo-di-trucco": "una tua carta vale 1 in più o in meno",
  "una-sigaretta-fuori-al-bar": "un avversario non attiva nel prossimo turno",
  "la-cionna": "fermi qualsiasi attacco: lui scarta 1 carta",
  // Nonno Rafiluccio
  "tiro-su-un-muro": "fermi il livello 1 fino al tuo prossimo turno",
  straordinario: "gratis: +1 mossa ora e +1 nel prossimo turno",
  "brontola-tutto-il-giorno": "ti dà 2 carte o salta il turno (sceglie lui)",
  // Carte singole
  "parla-parla-parla": "un avversario non usa poteri nel prossimo turno",
  "ho-tanta-fame": "rubi 2 carte all'avversario più vicino nei punti",
  "mangia-mangia-mangia": "gratis: peschi 4, poi 2 turni scarti 1 in più",
  "risata-contagiosa": "ogni avversario scarta 1 carta a caso",
  "non-ti-sento-sto-suonando": "fermi l'attacco: non ti attacca più nel giro",
  multa: "chi ha più carte ne scarta 2",
  bisiniss: "la sua carta più alta vale la metà",
  "frutta-e-verdura": "scopri 4 carte, ne prendi 2",
  benedizione: "nessuno può attaccare fino al tuo turno",
  ricetta: "ricarichi una carta di chi vuoi e peschi 1",
  "guardia-medica": "dopo l'attacco riprendi carte e ricariche",
  // Carte difesa e attacco usa e getta
  paesano: "fermi un attacco di livello 1",
  aglianico: "fermi un attacco fino al livello 2",
  taurasi: "fermi qualsiasi attacco: lui 1 mossa in meno",
  campari: "fermi l'attacco e peschi 1 carta",
  "sono-a-un-matrimonio": "fermi l'attacco (al Matrimonio torna in mano)",
  "nevicava-non-e-potuto-venire": "fermi l'attacco: niente attacchi per il giro",
  "sono-andato-a-lioni-a-fa-a-spesa": "fermi l'attacco e peschi 2 carte",
  "la-tomacella": "una carta avversaria si stanca",
  "giro-aperto": "rubi 1 carta a caso a un avversario",
  "gli-occhi-nguoll": "un avversario scarta un nascosto a caso",
  vento: "un avversario cambia tutte le carte numero",
};
