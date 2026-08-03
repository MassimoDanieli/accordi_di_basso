# Manico 5.1.1 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 5.1.1 mantiene le correzioni musicali della 5.1 e aggiorna il renderer:

- conservazione delle note ribattute a ottavi;
- stabilizzazione degli errori isolati d'ottava;
- una sola sorgente di verità per timeline, manico e pannello laterale;
- posizioni sempre coerenti con il MIDI assoluto della nota;
- manico rettangolare a larghezza costante, senza paletta o sagome decorative;
- legno chiaro, tasti metallici, corde differenziate e numeri dei tasti in alto;
- proporzioni compatte su desktop, senza spazio vuoto sotto il manico;
- scorrimento orizzontale su mobile, così tasti e note non vengono compressi;
- apertura dello studio sempre dall'inizio della pagina;
- scelta manuale e bloccabile di corda e tasto.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```
