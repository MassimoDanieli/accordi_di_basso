# Changelog

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e il versionamento è [semantico](https://semver.org/lang/it/).

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
