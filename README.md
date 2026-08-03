# Manico 5.1 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico realistico con anticipo visivo coerente delle note successive.

La release 5.1 migliora in particolare:

- conservazione delle note ribattute a ottavi;
- stabilizzazione degli errori isolati d'ottava;
- una sola sorgente di verità per timeline, manico e pannello laterale;
- posizioni sempre coerenti con il MIDI assoluto della nota;
- manico più realistico, con headstock, corde differenziate, tasti, inlay e percorso della frase;
- scelta manuale e bloccabile di corda e tasto.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```
