# Manico 5.2.0 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 5.2.0 aggiunge una modalità studio completa, mantenendo le correzioni musicali e grafiche della 5.1:

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
