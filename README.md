# Manico 6.0.0 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 6.0.0 introduce **Suona con me**, una modalità di ascolto locale tramite microfono:

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
