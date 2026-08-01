# Manico

Visualizzatore di accordi, voicing e voice leading sul manico del basso elettrico.
Scrivi una griglia di accordi, scegli una zona di quattro-sette tasti e il tool ti mostra
quali voicing stanno dentro quella zona, come collegarli con il minimo movimento della mano,
li fa girare a tempo e li esporta in tab ASCII.

Nessuna dipendenza, nessun passaggio di build: HTML, CSS e moduli ES nativi.

![licenza](https://img.shields.io/badge/licenza-GPL--3.0-E9B04A) [![sito](https://img.shields.io/badge/sito-basso.massimodanieli.com-63B7A6)](https://basso.massimodanieli.com/)

## Come si rilascia

Dopo ogni modifica ai sorgenti va lanciato `node tools/build.js`: genera
`assets/app.bundle.js` (quello che il sito carica davvero) e `dist/manico.html`
(file unico autonomo). Il bundle va committato insieme ai sorgenti.

## Pagine

`index.html` e' la guida in italiano, `index.en.html` quella in inglese, `app.html` e' lo
strumento. Su GitHub Pages la guida fa da pagina d'ingresso. L'interfaccia dello strumento
e' bilingue e cambia lingua al volo dalle bandierine nella barra.

## Interfaccia

Il banco di lavoro occupa la prima schermata: griglia di accordi e trasporto in alto,
nastro degli accordi, manico al centro, colonna dei voicing a destra, comandi della zona
in basso con la legenda dei colori. Una scrollata piu' giu' stanno cinque pannelli
titolati: strumento e vista, esecuzione, forme armoniche, importazione iReal, tab ASCII.
Tutti i comandi hanno un'etichetta per esteso.

## Cosa fa

**Manico con proporzioni reali.** La spaziatura dei tasti segue `1 − 2^(−n/12)`, quindi il
disegno è un manico vero e non una griglia a passo costante.

**Sei tipi di voicing.**

| Tipo | Note | A cosa serve |
|---|---|---|
| Arpeggio | tutte, in successione | studio della posizione, walking |
| Shell | R + 7 + 3 | l'accordo ridotto all'osso, si sente tutto |
| Note guida | 3 + 7 | comping, duo con un solista |
| Decime | R + 3 a distanza di decima | il suono classico bass-and-piano |
| Triade | R + 3 + 5 | bicordi e accordi in posizione stretta |
| Quartale | quarte sovrapposte | suono modale, sui minori settima |

Per i voicing a blocchi le note devono stare su corde diverse e crescenti, con l'apertura
della mano entro il limite impostato (tre-sei tasti). Le corde a vuoto non contano
nell'apertura.

**Voice leading.** Il pulsante *Ottimizza voice leading* percorre tutta la griglia con una
programmazione dinamica e sceglie, per ogni accordo, il voicing che minimizza il moto
complessivo delle voci più lo spostamento della mano. Su un `D-7 G7 C^7 A7` in shell fra il
terzo e l'ottavo tasto il costo scende da 37,5 a 28,5.

**Zone.** La striscia sotto i controlli assegna a ogni posizione di partenza la percentuale
di note dell'accordo raggiungibili senza muoversi, presa sul peggiore accordo della griglia:
più è chiara, peggio è. Un clic ti ci porta.

**La nota che suona si accende.** Durante la riproduzione ogni nota si illumina sul manico
nel momento in cui la senti, una alla volta sugli arpeggi e tutte insieme sull'attacco dei
voicing a blocco.

**Tema chiaro e scuro.** Segue le preferenze di sistema alla prima visita, poi ricorda la scelta.

**Trasporto.** Play in loop da 40 a 200 bpm, metri 4/4, 3/4, 2/4 e 6/8, metronomo con accento
sul primo movimento della battuta. La zona insegue l'accordo corrente, oppure resta ferma con
*Zona fissa* se vuoi costringerti a suonare in posizione.

**Tab ASCII.** Esporta la griglia usando i voicing selezionati, negli appunti o in un `.txt`.

```
   D-7               G7
G |-----------5--7--|--------7--|
D |--------7--------|--5--9-----|
A |--5--8-----------|-----------|
E |-----------------|-----------|
```

**Import da iReal Pro.** Incolli un link `irealb://` o `irealbook://` e la griglia viene
letta in locale, nel browser: de-offuscamento del corpo, battute, ritornelli, `x` (ripeti
battuta), `r` (ripeti due battute), simboli `^ - h o` e note al basso. Nessuna richiesta di
rete, niente esce dalla pagina.

## Griglia: come si scrive

Uno spazio separa le battute, una virgola separa gli accordi dentro la stessa battuta.

```
D-7 G7 C^7,A7 D-7
```

Sono accettate sia la notazione classica sia quella iReal: `^` maggiore, `-` minore,
`h` semidiminuito, `o` diminuito. Funzionano `C/E`, `N.C.` e la scorciatoia `G-A-D`,
dove il trattino seguito da una lettera di nota separa le battute.

## Uso in locale

I moduli ES non si caricano da `file://`, quindi lavorando sui sorgenti serve un server:

```bash
npm run dev          # oppure: python3 -m http.server 8080
```

Poi apri <http://localhost:8080>.

Per avere invece un file unico da aprire con un doppio clic, o da allegare a un messaggio:

```bash
npm run build        # scrive dist/manico.html, CSS e moduli incorporati
```

Il bundle e i sorgenti restano allineati: `tools/build.js` legge `src/` e `assets/`, non
contiene copie del codice.

Test:

```bash
npm test
```

## Docker

```bash
docker build -t manico .
docker run --rm -p 8080:8080 manico
```

## Deploy su GitHub Pages

Il workflow in `.github/workflows/pages.yml` esegue i test e pubblica la radice del repository
a ogni push su `main`. Va abilitato una volta sola da *Settings → Pages → Source: GitHub
Actions*.

### Dominio

Il file `CNAME` in radice fissa il dominio a `basso.massimodanieli.com`. Sul DNS serve un
record `CNAME` per l'etichetta `basso` che punta a `massimodanieli.github.io`, senza proxy
finche' GitHub non ha emesso il certificato. Poi *Settings -> Pages -> Custom domain* e, una
volta comparso, *Enforce HTTPS*.

I percorsi nella pagina sono relativi, quindi funziona sia sul dominio dedicato sia
sull'indirizzo di progetto <https://massimodanieli.github.io/accordi_di_basso/>.

## Struttura

```
index.html            guida in italiano
index.en.html         guida in inglese
app.html              lo strumento
assets/styles.css     stile
src/theory.js         note, sigle di accordo, gradi
src/voicings.js       generazione dei voicing e voice leading
src/render.js         manico e diagrammi SVG
src/audio.js          corda pizzicata e metronomo, Web Audio
src/tab.js            esportazione in tab ASCII
src/ireal.js          lettura dei link iReal Pro
src/library.js        forme armoniche e brani tradizionali
src/theme.js          tema chiaro/scuro
src/i18n.js           dizionario italiano e inglese
src/app.js            stato e collegamento fra i moduli
tools/build.js        genera dist/manico.html, file unico autonomo
test/smoke.test.js    test, senza dipendenze
```

## Sugli standard

La libreria contiene forme armoniche generiche (blues, rhythm changes, cicli di II-V-I,
cadenza andalusa, ciclo di terze maggiori) e brani tradizionali di pubblico dominio. Le
griglie degli standard protetti dal diritto d'autore non sono incluse: per quelle si usa
l'importazione dai propri file iReal Pro.

## Licenza

GNU General Public License v3.0 o successiva, vedi [LICENSE](LICENSE).

Chi distribuisce una versione modificata deve renderne disponibili i sorgenti sotto la stessa
licenza. Il file `dist/manico.html` e' codice oggetto ai sensi della GPL: se lo distribuisci da
solo, indica dove trovare i sorgenti corrispondenti.
