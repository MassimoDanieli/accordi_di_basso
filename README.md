# Manico 5.1.1 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico rettangolare con anticipo visivo coerente delle note successive.

La release 5.1.1 mantiene le correzioni musicali della 5.1 e aggiorna il renderer:

- conservazione delle note ribattute a ottavi;
- stabilizzazione degli errori isolati d'ottava;
- una sola sorgente di verità per timeline, manico e pannello laterale;
- posizioni sempre coerenti con il MIDI assoluto della nota;
- manico rettangolare a larghezza costante, senza paletta o sagome decorative;
- legno chiaro, tasti metallici, corde differenziate e numeri dei tasti in alto;
- scelta manuale e bloccabile di corda e tasto.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```
