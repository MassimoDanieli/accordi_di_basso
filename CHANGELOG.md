# Changelog

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e il versionamento è [semantico](https://semver.org/lang/it/).

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
