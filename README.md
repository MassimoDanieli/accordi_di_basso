# Manico 5.1.2 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 5.1.2 mantiene le correzioni musicali della 5.1 e rifinisce lo strumento:

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

La release è verificata anche nel browser: un esercizio nuovo apre il selettore su `12`, mostra i tasti `0–12` e carica la finitura grafica 5.1.2.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```
