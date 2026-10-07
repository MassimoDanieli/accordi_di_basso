# Manico 7.5.0 · Bass Transcriber

**[Manico e C_bass, presentati insieme](https://basso.massimodanieli.com/about.html)** · [in English](https://basso.massimodanieli.com/about.html#en)

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 7.5.0 importa **tanti brani insieme**: più file scelti o trascinati, oppure una cartella intera (anche con sottocartelle). Vengono trascritti uno dopo l'altro con le stesse scelte; quelli già salvati (stesso nome e stessa dimensione) si saltano, uno che non riesce non ferma gli altri, e alla fine sopra la lista c'è scritto cosa ne è stato di ciascuno. C_bass fa lo stesso dalla 0.10.0.

La release 7.4.0 porta in Manico il resto di quello che nel frattempo è nato in [C_bass](https://github.com/MassimoDanieli/C_bass):

- **accordi**: nei brani con il basso isolato vengono letti dal brano senza basso (cromagramma, un accordo per beat, con la linea di basso come indizio per la fondamentale) e scritti sopra la tablatura; si correggono a mano. Il codice è quello di C_bass riga per riga (`src/chords.js`): su sei brani di prova scrive gli stessi accordi;
- **prima battuta dall'armonia**: all'importazione, tra il beat scelto dalla batteria e quello a mezza battuta di distanza vince quello dove cambiano più accordi;
- **battute di lunghezza propria**: una battuta può avere un beat in più o in meno, e tutte le stanghette dopo si spostano; **+½ beat** per quando il tempo è stato seguito sui levare;
- **sezioni** (intro, strofa, ritornello…) dalla battuta corrente, con il loop sulla sezione intera;
- **tonalità**: fino a sei semitoni su o giù per audio, note e accordi. La registrazione viene ricampionata una volta (`src/pitch.js`) e poi suonata più lenta o più veloce di altrettanto dal lettore del browser, che mantiene l'intonazione;
- **conta una battuta** prima di partire e **metronomo** sui beat trovati nel brano;
- **PDF e MusicXML** della parte, con tablatura, valori ritmici, accordi e sezioni (`src/sheet.js`);
- **cinque brani inclusi**, gli stessi di C_bass (blues, funk, bossa nova, walking, rock), suonati dal suo sintetizzatore: basso, batteria e accordi, con l'ascolto senza basso e a solo basso. Le registrazioni sono in `assets/pieces/` (3,7 MB), le note e gli accordi in `src/pieces.js`; li scrive `go run ./tools/pieces` nel repository di C_bass. Dove le registrazioni non si possono scaricare (la versione in un solo file, `dist/manico.html`) le note vengono suonate una per una come prima.

Limiti noti: gli accordi sono verificati per uguaglianza con C_bass e sui brani inclusi, non su un insieme di brani veri con accordi scritti; senza basso isolato non vengono letti. Il metronomo segue l'orologio del lettore audio del browser: l'allineamento all'ascolto va giudicato a orecchio, come la qualità dell'audio trasposto.

La release 7.3.0 porta in Manico il lettore delle note di [C_bass](https://github.com/MassimoDanieli/C_bass), il programma nato da Manico, dove nel frattempo è stato rifatto e misurato:

- **l'altezza di una nota si legge dall'intera nota**, non da ogni centesimo di secondo: un momento solo confonde facilmente un'ottava con l'altra;
- **una nota non si spezza dove cambia solo il suo suono**: una corda bassa che risuona perde la fondamentale e sembrava un'altra nota;
- **l'altezza si segue tra un semitono e l'altro**: un basso un po' calante o un fretless non sfarfalla tra due nomi, e un glissato non lascia una nota a ogni tasto;
- **il basso isolato si misura contro il brano**: quello che la separazione lascia dove il basso non c'è non diventa note, e un brano senza basso viene detto tale;
- **niente sotto lo strumento**: non si leggono note più di un tono sotto la corda più grave dell'accordatura scelta;
- un brano già separato e letto dal lettore di prima viene **riletto da solo** la prima volta che lo si apre, se non ha note corrette a mano.

Su una registrazione di 3:21 il cui basso è scritto in uno spartito (155 note), separata e letta: prima 148 giuste, 5 con l'ottava sbagliata, 2 sbagliate e 39 in più; adesso 155 giuste e nessuna in più. Il lettore è lo stesso codice nei due programmi, riga per riga (`src/reader.js`): sulle diciotto registrazioni di prova scrive le stesse note di C_bass, una per una.

La release 7.2.0 riscrive la tablatura e il modo in cui si leggono le note dal basso isolato:

- **una nota tenuta è una nota sola**: sul basso isolato le note non si cercano più negli scatti di energia (che spezzavano una nota lunga in tanti attacchi finti) ma seguendo la nota stessa: un nuovo attacco è un calo di livello che risale in pochi centesimi di secondo, oppure un cambio di altezza che regge;
- **tempo e battute** sono ricavati dalla registrazione (flusso spettrale e inseguimento del beat) e si correggono a mano: stanghetta avanti o indietro di un beat, tempo doppio o dimezzato, 4/4 o 3/4;
- **tablatura vera**: battute numerate, valori ritmici sotto il rigo (gambi, travi, codette, punti), pause, legature di valore con il tasto ripetuto tra parentesi a inizio battuta;
- **Ritrascrivi le note** rilegge un brano già importato, dal basso isolato se c'è, con la sensibilità scelta.

La release 7.1.0 mette sopra il manico una tablatura che scorre a tempo con il brano, al posto della striscia di caselle: la nota da suonare è quella sotto la linea, un clic su un numero la seleziona e un clic altrove sposta l'ascolto. Il manico mostra soltanto la nota da suonare adesso.

La release 7.0.0 isola il basso dalla registrazione con un modello di separazione (Demucs) che gira nel browser:

- la trascrizione viene fatta sul basso isolato invece che sul mix intero, con molti meno errori sui brani densi;
- **Ascolto** passa dal brano intero al brano senza basso, per suonare sopra la band vera, al solo basso;
- un brano importato prima si può separare dopo, scegliendo se ritrascriverlo;
- niente upload: il modello (174 MB) si scarica una volta e resta nella cache del browser; con WebGPU (Chrome, Edge e Safari recenti) un brano richiede pochi minuti, senza WebGPU circa tre o quattro volte la sua durata;
- se il motore non è disponibile, o la separazione fallisce, Manico trascrive dal mix come prima.

Il motore non è nel repository: `node tools/build-separator.js` lo costruisce in `assets/separator/` da pacchetti npm con versione fissata ([demucs-js](https://github.com/bakkot/demucs-js) di Kevin Gibbons, MIT, e ONNX Runtime Web). I pesi del modello derivano da quelli pubblicati da Meta, resi disponibili per uso personale e di ricerca (vedi `DEMUCS-LICENSE.md` nella stessa cartella). Il sito viene pubblicato dal workflow `Deploy site`, che esegue quel passo.

La release 6.2.1 aggiunge il collegamento al repository GitHub nel piè di pagina dell'app e delle pagine di aiuto.

La release 6.2.0 è una revisione del codice: il manico statico viene disegnato una volta sola per accordatura e numero di tasti, l'animazione si ferma quando il brano è in pausa, l'importazione non copia più due volte il file audio, i colori del manico sono nel foglio di stile invece che in uno stile iniettato da JavaScript, le etichette accessibili sono tradotte e il titolo non viene sovrascritto mentre lo si modifica.

La release 6.1.1 rende la pagina iniziale più compatta: importazione, brani ed esercizi sono visibili nella prima schermata, e aggiunge il collegamento a [Bass Chord Lab](https://chords.massimodanieli.com/).

La release 6.1.0 migliora la qualità della trascrizione automatica:

- evita la selezione ripetuta di sottomultipli che poteva abbassare la nota di un'ottava;
- adatta le finestre di analisi alla durata fra due onset, senza invadere la nota successiva;
- privilegia il voto coerente di più finestre rispetto a un singolo rilevamento anomalo;
- conserva le note ribattute e la stabilizzazione musicale delle ottave.

Mantiene **Suona con me**, introdotto nella 6.0:

- riconoscimento in tempo reale della nota suonata;
- confronto con la nota attesa nella trascrizione;
- indicazione di nota corretta, errata, anticipata o in ritardo;
- punteggio basato sulle note riconosciute durante la sessione;
- segnale analizzato soltanto in memoria, senza registrazioni o upload;
- gestione chiara del permesso negato e consiglio di usare le cuffie.

Mantiene l'editor completo e l'esportazione introdotti nella 5.3:

- modifica numerica precisa di inizio e fine di ogni nota;
- aggiunta di una nota nella posizione corrente del cursore;
- unione con la nota successiva, oltre a divisione ed eliminazione già disponibili;
- riordinamento e ricalcolo automatico della diteggiatura dopo ogni modifica;
- esportazione MIDI standard Type 0, compatibile con DAW e software di notazione;

Mantiene inoltre la modalità studio introdotta nella 5.2:

- loop A–B persistente con intervallo e indicatori visibili sulla timeline;
- riproduzione che riparte da A quando il cursore è fuori dal loop o si trova su B;
- stato leggibile anche quando è stato impostato un solo estremo;
- velocità regolabile dal 50% al 125%, anche su mobile, senza alterare l'intonazione;
- scorciatoie `[` e `]` per impostare rapidamente A e B;
- compatibilità con i progetti salvati nelle versioni precedenti;

- conservazione delle note ribattute a ottavi;
- stabilizzazione degli errori isolati d'ottava;
- una sola sorgente di verità per timeline, manico e pannello laterale;
- posizioni sempre coerenti con il MIDI assoluto della nota;
- manico rettangolare a larghezza costante, senza paletta o sagome decorative;
- **12 tasti come impostazione iniziale** per nuovi MP3 ed esercizi inclusi;
- possibilità di passare manualmente a 15, 18 o 24 tasti quando serve;
- finitura più sobria con acero caldo, metallo leggero e note più pulite;
- proporzioni compatte su desktop, senza spazio vuoto sotto il manico;
- scorrimento orizzontale su mobile, così tasti e note non vengono compressi;
- apertura dello studio sempre dall'inizio della pagina;
- scelta manuale e bloccabile di corda e tasto.

I brani già salvati mantengono il numero di tasti scelto dall'utente: il nuovo default a 12 viene applicato soltanto alle nuove importazioni e agli esercizi inclusi.

La release è verificata anche nel browser: un esercizio nuovo apre il selettore su `12`, mostra i tasti `0–12` e carica la finitura grafica aggiornata.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```

Per provare in locale la separazione del basso (scarica circa 100 MB da npm, una volta):

```bash
node tools/build-separator.js
npm run dev
```
