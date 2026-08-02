# Manico

Voicing e posizioni sul manico del basso elettrico, nel browser, senza dipendenze.
In linea su https://basso.massimodanieli.com — sorgenti: https://github.com/MassimoDanieli/accordi_di_basso

Scrivi una griglia di accordi, scegli una zona di tasti e Manico mostra quali voicing
ci stanno dentro, li collega con il minimo movimento della mano, li suona a tempo con
le note che si accendono sul manico, e li esporta in tab ASCII.

## Pagine

`index.html` e' la guida in italiano, `index.en.html` quella in inglese, `app.html` e'
lo strumento. Su GitHub Pages la guida fa da pagina d'ingresso. L'interfaccia dello
strumento e' bilingue e cambia lingua al volo dalle bandierine nella barra; tema chiaro
di serie, scuro a un clic, entrambe le scelte memorizzate.

## Cosa fa

**Griglia.** Spazio fra le battute, virgola dentro la battuta (`D-7 G7 C^7,A7`).
Notazione classica e iReal: `C-7`/`Cm7`, `C^7`/`Cmaj7`, `Ch7`, `Co7`, alterazioni,
slash chord `C/E`, pause `N.C.`. Il nastro degli accordi mostra sotto ogni sigla le
note del voicing scelto (il percorso fluido) e scorre da solo durante l'esecuzione.
Quando la griglia arriva da iReal o dal repertorio, sopra gli accordi compaiono
titolo e compositore, come sulla carta.

**Zona.** Due cursori fissano primo tasto e ampiezza; tutto quello che il tool propone
sta li' dentro. La striscia di copertura assegna a ogni posizione la percentuale di
note raggiungibili senza spostarsi, sul peggiore accordo della griglia. Toccare la
zona a mano attiva da solo "Zona fissa": la scelta manuale vale finche' non la si
sblocca. Quando invece l'inseguimento e' attivo, a parita' di copertura resta vicino
alla posizione corrente.

**Voicing.** Sei tipi: arpeggio, shell (R+7+3), note guida (3+7), decime, triade,
quartale. Vincoli di suonabilita' (corde crescenti, apertura della mano regolabile da
3 a 6 tasti), nome del rivolto, gradi contenuti. Il pannello a destra del manico e' a
scomparsa con una linguetta. "Ottimizza voice leading" sceglie su tutta la griglia i
voicing con il minimo movimento complessivo, senza mai uscire dalla zona.

**Esecuzione.** La modalita' e' sempre in vista nella barra, accanto al Play, in
ordine di mestiere: Arpeggio (nota per nota dalla fondamentale, a specchio dentro la
zona), Walking, Voicing a blocco, Click (il tool tiene griglia e tempo, suoni tu),
con il metro a fianco. Play in loop da 40 a
200 bpm; 4/4, 3/4 e 2/4 con la loro pulsazione, 6/8 su due pulsazioni puntate. La
linea walking percorre le note dell'accordo nella direzione del prossimo cambio con
la cromatica dal lato del moto, e il fraseggio varia a ogni giro (ottavi swingati,
ghost sul levare, salti d'ottava) restando deterministico per battuta e giro. Ogni
nota si accende sul manico nel momento in cui la senti; in walking le note di
passaggio compaiono come pallini rossi. Al cambio di accordo le voci del voicing
planano verso le nuove posizioni come anelli colorati con la scia, partendo poco
prima del cambio: il voice leading si vede accadere.

**Repertorio.** 26 voci con stile e tempo consigliato: forme essenziali (blues, rhythm
changes, II-V-I, cicli), giri pop e reggae, versioni semplificate di brani celebri,
tradizionali di pubblico dominio. Le griglie complete degli standard non sono incluse:
si importano dalle proprie carte, con i link `irealb://` di iReal Pro (Condividi →
formato "iReal Pro", anche playlist intere) oppure con file `.musicxml` (iReal,
MuseScore). La forma viene srotolata come si suona: ritornelli con i conteggi,
fino a tre finali anche fuori posto, segno e coda, D.S. al Coda, D.C. al Fine o al
finale indicato, battute ribattute (`Kcl`, `x`, `r`), e i cambi di metro a meta'
brano, portati battuta per battuta. Tempo e metro del brano vengono applicati da
soli. Il lettore e' verificato con un metodo a oracolo: gli stessi brani nei due
formati, confrontati misura per misura (283 misure identiche su cinque standard di
prova), piu' una batteria di test sintetici, uno per ogni gettone del formato.
Per il repertorio moderno c'e' l'incolla-testo: accordi sopra
le parole (il formato dei siti di accordi) o ChordPro, con le righe di soli
accordi pescate fra le parole, le stanghette a dividere le battute quando ci
sono, e la griglia sempre modificabile a mano. Tutto avviene nel browser: nulla
esce dalla pagina. Le playlist si salvano in blocco
nel canzoniere con un bottone (provato con le raccolte essenziali di iReal da
centinaia di brani). I brani singoli entrano da
soli nel canzoniere, salvato sul dispositivo (IndexedDB) e consultabile per titolo,
autore o stile, con backup JSON in uscita e in entrata. Niente server: le carte
restano tue.

**Tab ASCII.** Esporta la griglia da copiare o scaricare, in due contenuti: i
voicing a blocchi scelti, oppure la linea walking nota per nota con le note di
passaggio fra parentesi.

**Basso.** Quattro accordature (4, 5, 5 con Do acuto, 6 corde), corde disposte come
nelle tab con vista invertibile, da 12 a 24 tasti mostrati, spaziatura reale dei tasti
`1 - 2^(-n/12)`, tavola in legno con gradiente e tasti in metallo.

## Come si rilascia

Dopo ogni modifica ai sorgenti va lanciato `node tools/build.js`: genera
`assets/app.bundle.js` (l'unico script che il sito carica, con versione in coda per
tagliare fuori la cache) e `dist/manico.html` (file unico autonomo, senza rete a parte
i font). Il bundle va committato insieme ai sorgenti. `npm test` esegue i test.

## Struttura

```
index.html            guida in italiano
index.en.html         guida in inglese
app.html              lo strumento
assets/styles.css     stile, temi chiaro/scuro
assets/app.bundle.js  bundle generato da tools/build.js (committato)
src/theory.js         note, intervalli, lettura delle sigle
src/voicings.js       generazione voicing, vincoli, voice leading
src/render.js         manico e diagrammi in SVG
src/audio.js          suono e metronomo (Web Audio)
src/tab.js            esportazione in tab ASCII
src/ireal.js          lettura dei link iReal Pro
src/library.js        repertorio bilingue con stile e bpm
src/theme.js          tema chiaro/scuro
src/i18n.js           dizionario italiano e inglese
src/app.js            stato e collegamento fra i moduli
tools/build.js        genera bundle e file unico
test/smoke.test.js    test
```

## In locale

Serve un server qualsiasi per i moduli ES in sviluppo:

```
python3 -m http.server 8080
```

oppure Docker: `docker build -t manico . && docker run -p 8080:8080 manico`

## Licenza

GNU GPL v3. Software libero, senza alcuna garanzia. (c) 2026 Massimo Danieli.
