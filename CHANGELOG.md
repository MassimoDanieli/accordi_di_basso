# Changelog

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e il versionamento è [semantico](https://semver.org/lang/it/).

## [2.3.4] — 2026-08-01

### Aggiunto
- Titolo e compositore del brano importato da iReal compaiono sopra il nastro degli
  accordi, come sulla carta. Anche le voci caricate dal repertorio mostrano il nome.
  Scrivere a mano nella griglia toglie l'intestazione, che non sarebbe piu' vera.

### Corretto
- La finestra di importazione iReal ora si chiude da sola a brano caricato, anche
  scegliendone uno da una playlist.

## [2.3.3] — 2026-08-01

### Corretto
- L'importazione da iReal Pro falliva sui link reali: il corpo del brano era letto da
  una posizione fissa dei campi, ma il formato vero dell'app ne usa un'altra. Ora il
  corpo si riconosce dal suo marcatore, in qualunque posizione sia, con ripiego sul
  vecchio formato irealbook in chiaro. Verificato su un link autentico di Autumn
  Leaves: titolo, compositore, tonalita' e tutte le 21 battute della griglia, sigla
  per sigla. Il link e' entrato nei test come regressione permanente.

## [2.3.2] — 2026-08-01

### Corretto
- Le guide non scorrevano piu': il blocco dello scorrimento pensato per la pagina
  dello strumento era finito su `body` per tutte le pagine. Ora vale solo per
  `app.html`.

### Modificato
- README riscritto allo stato attuale del progetto.

## [2.3.1] — 2026-08-01

### Corretto
- Spostare la zona a mano non serviva a niente durante l'esecuzione: l'inseguimento
  automatico la riportava a ogni battuta verso il tasto 0, perche' a parita' di
  copertura vinceva sempre la zona piu' bassa. Ora toccare i cursori della zona, o
  una cella della striscia di copertura, attiva da solo "Zona fissa": la scelta
  manuale vale finche' non la si sblocca. E quando l'inseguimento e' attivo, a
  parita' di copertura resta vicino alla posizione corrente invece di tornare a 0.

## [2.3.0] — 2026-08-01

### Aggiunto
- Il pannello dei voicing e' a scomparsa: una linguetta verticale sul bordo lo apre e
  lo chiude, il manico si allarga di conseguenza e la scelta resta memorizzata.

### Corretto
- Le accordature nel menu Basso erano solo in italiano: ora seguono la lingua, anche
  nell'intestazione del tab esportato.

### Modificato
- Barra degli attrezzi in fondo piu' evidente: bordo superiore color ambra, pulsanti
  piu' grandi e a contrasto pieno.

## [2.2.1] — 2026-08-01

### Corretto
- L'app poteva morire al caricamento con la cache di mezzo: la pagina prendeva
  `app.js` nuovo ma gli import interni dei moduli, senza versione, potevano arrivare
  vecchi dalla cache di Pages (10 minuti), e il primo accesso a una funzione cambiata
  fermava tutto. Ora il sito carica un bundle unico versionato
  (`assets/app.bundle.js?v=...`), generato da `node tools/build.js` e committato;
  i moduli in `src/` restano per lo sviluppo.
- Il pulsante del tema diceva Chiaro/Scuro anche in inglese: ora segue la lingua
  (Light/Dark) e si aggiorna quando la cambi.

## [2.2.0] — 2026-08-01

### Aggiunto
- Modalita' walking nell'esecuzione: fondamentale, note dell'accordo in salita e nota
  cromatica di avvicinamento alla fondamentale dell'accordo successivo, tutto dentro la
  zona scelta, con le note che si accendono a tempo.
- Percorso fluido nel nastro degli accordi: sotto ogni sigla compaiono le note del
  voicing scelto, e si aggiornano scegliendo una card o ottimizzando il voice leading.
- Repertorio ampliato a 26 voci con stile e tempo consigliato: forme essenziali, giri
  pop e reggae, versioni semplificate di brani celebri, tradizionali. Caricando una
  voce si imposta anche il tempo.

### Modificato
- Tema chiaro di serie, palette carta calda, titoli con carattere editoriale Fraunces.
- Manico realistico: tavola in legno con gradiente, tasti in metallo con luce e ombra.

## [2.1.0] — 2026-08-01

### Modificato
- I diagrammi di accordo e rivolti sono tornati sempre in vista: pannello dedicato a
  destra del manico, largo fino a 470px, con le card grandi in colonna. Durante
  l'esecuzione il pannello segue l'accordo corrente e la card scelta resta in vista.
  Il cassetto a scomparsa della 2.0 e' stato eliminato.
- Gli accordi della griglia tornano in nastro orizzontale sopra il manico.
- Diagrammi delle card ingranditi: celle da 40 unita', pallini piu' grandi, numeri
  leggibili.

### Corretto
- La descrizione della zona non si aggiornava quando la zona inseguiva l'accordo
  durante l'esecuzione.
- La dicitura per le sigle non riconosciute non era tradotta.

## [2.0.1] — 2026-08-01

### Corretto
- Nella 2.0.0 il manico poteva risultare alto zero pixel. Stava in una riga flessibile con
  un limite di altezza in percentuale: un calcolo circolare che i browser risolvono in modo
  diverso, e Chrome lo chiudeva azzerando l'altezza dell'immagine. Ora la dimensione viene
  misurata dal codice a ogni disegno e a ogni ridimensionamento della finestra, quindi il
  manico riempie sempre lo spazio disponibile mantenendo le proporzioni.

### Modificato
- Gli accordi della griglia sono passati da una riga in alto a una colonna accanto al
  manico, sempre in vista mentre si suona, e la colonna scorre da sola sull'accordo corrente.

## [2.0.0] — 2026-08-01

### Aggiunto
- Italiano e inglese, con due bandierine nella barra. La scelta resta memorizzata e alla
  prima visita segue la lingua del browser. Tutti i testi passano da un dizionario unico,
  compresi i nomi dei rivolti, dei tipi di voicing e delle forme armoniche.
- Guida tradotta in `index.en.html`, collegata dalle stesse bandierine.

### Modificato
- Impianto rifatto attorno al manico. La pagina e' divisa in cinque fasce fisse: barra,
  accordi, manico, cassetto dei voicing, attrezzi. Il manico prende tutto lo spazio che
  resta e non ha piu' vuoti attorno.
- I voicing stanno in un cassetto che si apre e chiude con un clic sulla sua linguetta,
  la quale mostra sempre quanti ne ha trovati e per quale accordo. Chiuso, il manico si
  allarga. La scelta resta memorizzata.
- Forme armoniche, iReal, tab e impostazioni sono tornati in finestre, ma richiamate da
  una barra di attrezzi con le etichette scritte, sempre visibile in fondo.
- Il motore dei voicing non produce piu' testo: restituisce solo dati, e le etichette
  vengono dalla lingua scelta.

## [1.5.0] — 2026-08-01

### Modificato
- Ripensata la disposizione. Il manico occupa tutta la larghezza, e i voicing sono passati
  dalla colonna stretta a destra a una fascia sotto il manico, affiancati: i rivolti si
  vedono tutti insieme senza scorrere, e lo spazio vuoto sotto il manico e' sparito.
- I comandi del voicing (tipo, apertura della mano, voice leading) stanno su una riga
  sola sopra le card, insieme al conteggio e alla descrizione del tipo scelto.
- La legenda dei colori e' passata accanto ai cursori della zona.

## [1.4.0] — 2026-08-01

### Aggiunto
- Barra di rimandi in fondo al banco di lavoro: "Altro qui sotto" con i collegamenti ai
  cinque pannelli, cosi' chi apre il sito per la prima volta si accorge che esistono.
  Il clic porta al pannello con uno scorrimento morbido.

### Modificato
- Manico ancora piu' grande: corde a 60 unita' di distanza invece di 46, pallini delle
  note da 16 a 20 di raggio, numeri dei tasti e nomi delle corde ingranditi. La
  proporzione passa da 4,1:1 a 3,4:1, cioe' un altro 20% di altezza a parita' di larghezza.

## [1.3.5] — 2026-08-01

### Aggiunto
- Il numero di versione compare in pagina, accanto al promemoria della sintassi e nella
  guida, ed e' leggibile da console con `MANICO.versione`. Serve a capire subito se il
  browser sta mostrando l'ultima versione o una copia in cache.
- I fogli di stile e i moduli sono richiamati con il numero di versione in coda, cosi' un
  aggiornamento non puo' piu' essere mascherato dalla cache del browser.

## [1.3.4] — 2026-08-01

### Corretto
- Il manico restava troppo in basso. Ora la colonna di sinistra ha tre righe per due
  elementi: manico e barra della zona si appoggiano in alto e lo spazio che avanza
  finisce sotto, dove non puo' spingere niente. L'altezza del manico e' inoltre limitata
  a poco piu' di meta' schermata.

## [1.3.3] — 2026-08-01

### Corretto
- Il manico finiva a meta' pagina, con un vuoto sopra. Il banco di lavoro aveva un'altezza
  minima invece che definita, quindi la colonna dei voicing lo allungava a piacere e il
  manico, centrato in quell'area, scendeva. Ora il banco occupa esattamente una schermata,
  il manico parte dall'alto e la colonna dei voicing scorre per conto suo.

### Aggiunto
- La griglia si aggiorna da sola poco dopo l'ultima battitura. Il pulsante Mostra resta
  per chi preferisce confermare a mano, o premere Invio.

## [1.3.2] — 2026-08-01

### Corretto
- L'interruttore chiaro/scuro non rispondeva nella pagina dello strumento. Il tema veniva
  agganciato in fondo alla catena di inizializzazione: bastava un elemento mancante prima
  di quel punto perche' non venisse mai attivato.
- Il tema ora si applica per primo e si aggancia con una delega sul documento, quindi non
  dipende piu' dal resto. L'inizializzazione e' inoltre protetta: un elemento mancante
  scrive un avviso in console invece di spegnere la pagina.

## [1.3.1] — 2026-08-01

### Modificato
- Manico piu' grande e piu' leggibile: corde piu' distanziate, pallini delle note e
  numeri dei tasti ingranditi, proporzione meno schiacciata (da 6,2:1 a 4,1:1 su quattro
  corde, cioe' circa il 50% di altezza in piu' a parita' di larghezza).
- Di serie si vedono i primi 12 tasti invece di 15, cosi' ogni tasto e' piu' largo. Il
  numero di tasti mostrati si sceglie nelle impostazioni: 12, 15, 18 o 24.
- Il promemoria sulla sintassi sopra il manico si e' ridotto a una riga con rimando alla
  guida, cosi' il manico sale e non resta schiacciato in fondo.

## [1.3.0] — 2026-08-01

### Aggiunto
- La nota che sta suonando si accende sul manico e sul diagramma del voicing scelto,
  in sincrono con quello che si sente: una alla volta sugli arpeggi, tutte insieme
  sull'attacco dei voicing a blocco.
- Tema chiaro e tema scuro, con interruttore in barra. Alla prima visita segue le
  preferenze del sistema, poi ricorda la scelta.
- `index.html` e' ora una guida all'uso in otto sezioni: sintassi della griglia, zone,
  tipi di voicing, voice leading, esecuzione, tab, importazione iReal, accordature.
  Lo strumento si e' spostato in `app.html`.
- Marchio ridisegnato: un manico stilizzato con quattro corde e un segnatasto.

## [1.2.0] — 2026-08-01

### Modificato
- Rifatta l'impaginazione: le finestre di dialogo della 1.1.0 nascondevano troppo. Ora il
  banco di lavoro occupa la prima schermata (griglia, accordi, manico, zona, voicing) e
  sotto stanno cinque pannelli titolati: strumento e vista, esecuzione, forme armoniche,
  importazione iReal, tab ASCII.
- Ogni comando ha un'etichetta per esteso, nessuna icona muta.
- Il pannello dei voicing indica quanti ne ha trovati, per quale accordo e in quale zona,
  e descrive a cosa serve il tipo selezionato.
- La zona e' descritta a parole ("tasti 0-4, corde a vuoto incluse") accanto ai cursori.
- Legenda dei colori per esteso sotto il manico, invece delle sole iniziali.

## [1.1.0] — 2026-08-01

### Modificato
- Interfaccia ridisegnata: da pagina lunga a strumento su una sola schermata. Barra
  di comando in alto con griglia e trasporto, nastro degli accordi, manico al centro,
  voicing in colonna a destra, barra della zona in basso.
- Le funzioni secondarie (forme armoniche, importazione iReal, tab, impostazioni) sono
  passate in finestre di dialogo, richiamabili dalla barra.

### Aggiunto
- Dominio dedicato: `basso.massimodanieli.com`, file `CNAME` per GitHub Pages.

## [1.0.0] — 2026-08-01

### Aggiunto
- Manico con spaziatura reale dei tasti, quattro accordature (4, 5, 5 con Do acuto, 6 corde).
- Riconoscimento delle sigle di accordo, notazione classica e iReal, slash chord e `N.C.`.
- Sei tipi di voicing: arpeggio, shell, note guida, decime, triade, quartale.
- Vincolo di suonabilità: corde distinte e crescenti, apertura della mano regolabile da 3 a 6 tasti.
- Ottimizzazione del voice leading su tutta la griglia con programmazione dinamica.
- Striscia di copertura delle zone, con salto alla posizione scelta.
- Trasporto in loop con metronomo, metri 4/4, 3/4, 2/4, 6/8, riproduzione del voicing o della sola fondamentale.
- Esportazione in tab ASCII, negli appunti o in `.txt`.
- Importazione delle griglie da link iReal Pro, elaborata interamente nel browser.
- Libreria di forme armoniche generiche e brani tradizionali di pubblico dominio.
- Test di base senza dipendenze, workflow per GitHub Pages, immagine Docker.
- Build in file unico, `npm run build`, per l'uso senza server.

### Licenza
- Il progetto e' distribuito sotto GNU GPL v3.0 o successiva.
