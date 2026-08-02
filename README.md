# Manico 5 · Bass Transcriber

Manico importa una registrazione, stima la linea di basso nota per nota e la mostra su un manico realistico con anticipo visivo delle note successive.

## Flusso

1. importa MP3, WAV, M4A, AAC, OGG o FLAC;
2. l'audio viene decodificato e analizzato localmente;
3. audio, trascrizione, correzioni e impostazioni vengono salvati in IndexedDB;
4. la linea si studia sul manico con velocità variabile, loop A-B e note future;
5. la trascrizione si corregge ed esporta in TAB o JSON.

Nessun file viene caricato su un server.

## Sviluppo

```bash
npm test
npm run release
npm run check:release
```

`npm run release` sincronizza la versione e genera `assets/app.bundle.js` e `dist/manico.html`.
