import assert from 'node:assert/strict';
import { parseChord, TUNINGS } from '../src/theory.js';
import * as V from '../src/voicings.js';
import * as Tab from '../src/tab.js';
import * as IReal from '../src/ireal.js';
import * as F from '../src/forma.js';
import * as MusicXML from '../src/musicxml.js';
import * as CZ from '../src/canzoniere.js';

const open = TUNINGS['4'].open;
let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log('  ok  ' + name); }
  catch (e) { failed++; console.log('FAIL  ' + name + ' -> ' + e.message); }
};

check('riconosce le sigle principali', () => {
  assert.deepEqual(parseChord('C-7').intervals, [0,3,7,10]);
  assert.deepEqual(parseChord('Bbdim7').intervals, [0,3,6,9]);
  assert.deepEqual(parseChord('F#h7').intervals, [0,3,6,10]);
  assert.deepEqual(parseChord('C^7').intervals, [0,4,7,11]);
  assert.deepEqual(parseChord('G7b9').intervals, [0,4,7,10,13]);
  assert.equal(parseChord('C/E').pcMap[4], 4);
  assert.equal(parseChord('D-7/G').pcMap[7], -1);
  assert.equal(parseChord('Hmm'), null);
});

check('arpeggio: un voicing per ogni nota al basso', () => {
  const c = parseChord('C-7');
  const vs = V.generate(c, open, 3, 7, 'arp', 4);
  assert.ok(vs.length >= 3, 'attesi almeno 3 arpeggi, trovati ' + vs.length);
  assert.ok(vs.every(v => v.shape.length >= 3));
});

check('shell: fondamentale, settima e terza, dentro l apertura', () => {
  const c = parseChord('C-7');
  const vs = V.generate(c, open, 3, 7, 'shell', 4);
  assert.ok(vs.length > 0, 'nessuno shell trovato');
  vs.forEach(v => {
    assert.equal(v.shape.length, 3);
    assert.ok(v.span <= 4, 'apertura ' + v.span);
    const ivs = v.shape.map(n => n.iv).sort((a,b)=>a-b);
    assert.deepEqual(ivs, [0,3,10]);
    for (let i=1;i<v.shape.length;i++) assert.ok(v.shape[i].si > v.shape[i-1].si);
  });
});

check('note guida: solo terza e settima', () => {
  const vs = V.generate(parseChord('G7'), open, 3, 8, 'guide', 4);
  assert.ok(vs.length > 0);
  vs.forEach(v => assert.deepEqual(v.shape.map(n=>n.iv).sort((a,b)=>a-b), [4,10]));
});

check('decime: distanza fra 15 e 17 semitoni', () => {
  const vs = V.generate(parseChord('F7'), open, 0, 7, 'tenth', 5);
  assert.ok(vs.length > 0, 'nessuna decima trovata');
  vs.forEach(v => {
    const d = v.shape[1].midi - v.shape[0].midi;
    assert.ok(d >= 14 && d <= 17, 'distanza ' + d);
    assert.equal(v.shape[0].iv, 0);
  });
});

check('quartale su un minore settima', () => {
  const vs = V.generate(parseChord('D-7'), open, 0, 12, 'quartal', 5);
  vs.forEach(v => {
    assert.equal(v.shape[1].midi - v.shape[0].midi, 5);
    assert.equal(v.shape[2].midi - v.shape[1].midi, 5);
  });
});

check('il voice leading riduce il moto complessivo', () => {
  const grid = ['D-7','G7','C^7','A7'].map(parseChord);
  const lists = grid.map(c => V.generate(c, open, 3, 8, 'shell', 4));
  lists.forEach((l,i) => assert.ok(l.length, 'nessun voicing per ' + grid[i].symbol));
  const naive = lists.map(l => 0);
  const opt = V.optimise(lists);
  const cost = picks => picks.reduce((s,p,i) => i ? s + V.moveCost(lists[i-1][picks[i-1]], lists[i][p]) : 0, 0);
  assert.ok(cost(opt) <= cost(naive), 'ottimizzato ' + cost(opt) + ' vs primo disponibile ' + cost(naive));
  console.log('        moto: primo disponibile ' + cost(naive).toFixed(1) + ' -> ottimizzato ' + cost(opt).toFixed(1));
});

check('tab ascii con voicing a blocchi', () => {
  const c = parseChord('C-7');
  const v = V.generate(c, open, 3, 7, 'shell', 4)[0];
  const bars = [{ label:['C-7'], block:true, columns: v.shape.map((n,k)=>({si:n.si,f:n.f,newGroup:k===0})) }];
  const out = Tab.render(bars, open, false, 4, 'prova');
  assert.ok(out.includes('C-7'));
  assert.equal(out.split('\n').filter(l=>/^[A-G] \|/.test(l)).length, 4);
  console.log(out.split('\n').slice(2).join('\n'));
});

// --- la forma: un test sintetico per ogni gettone appreso dal banco di prova
// (cinque brani reali confrontati con l'export MusicXML della stessa app)

const g = body => F.espandi(F.leggiCorpo(body)).map(b => b.accordi.join(',') || 'nc').join(' ');

check('forma: ritornello semplice', () => {
  assert.equal(g('{C^7|D7 }Z'), 'C^7 D7 C^7 D7');
});

check('forma: due finali', () => {
  assert.equal(g('{C^7|N1F7 }N2G7 Z'), 'C^7 F7 C^7 G7');
});

check('forma: Kcl e x ripetono la battuta', () => {
  assert.equal(g('C7XyQKcl LZ x Z'), 'C7 C7 C7');
});

check('forma: r ripete due battute', () => {
  assert.equal(g('C7|D7|r Z'), 'C7 D7 C7 D7');
});

check('forma: p ribatte, le p consecutive collassano, W cambia basso', () => {
  assert.equal(g('C^7|pD7|ppW/E Z'), 'C^7 C^7,D7 D7,D7/E');
});

check('forma: n tiene viva la battuta senza armonia', () => {
  assert.equal(g('C7|n|D7 Z'), 'C7 nc D7');
});

check('forma: D.C. al Fine tronca al punto giusto', () => {
  // Il testo a battuta aperta viaggia sul prossimo accordo (regola dell'app),
  // quindi il Fine atterra su D7: il da capo rifa' C7 e D7, e E7 non si risuona.
  assert.equal(g('C7<Fine>|D7|E7<D.C. al Fine> Z'), 'C7 D7 E7 C7 D7');
});

check('forma: D.C. al 2nd prende il secondo finale', () => {
  // Senza Fine, il da capo al secondo finale suona fino in fondo.
  assert.equal(g('{C7|N1D7 }N2E7 LZ[F7<D.C. al 2nd ending>|G7 Z'),
    'C7 D7 C7 E7 F7 G7 C7 E7 F7 G7');
});

check('forma: tre finali, il terzo oltre la sezione', () => {
  assert.equal(g('{C7|N1D7 }N2E7]F7|G7<D.C. al 3rd end.>LZA7 ]N3B7 Z'),
    'C7 D7 C7 E7 F7 G7 A7 C7 B7');
});

check('forma: D.S. al Coda col segno e le due code', () => {
  // La Z finale attacca il D.S. alla battuta di F7 (regola imparata da Butterfly).
  assert.equal(g('{SC7|D7 }QE7XyQ|F7<D.S. al Coda> Z{QG7 LZ x }Z'),
    'C7 D7 C7 D7 E7 F7 C7 D7 E7 G7 G7 G7 G7');
});

check('forma: il vamp col conteggio 3x', () => {
  assert.equal(g('{C7|D7<3x> }Z'), 'C7 D7 C7 D7 C7 D7');
});

check('forma: il metro viaggia battuta per battuta', () => {
  const bars = F.espandi(F.leggiCorpo('T44C7|D7|T24E7 Z'));
  assert.deepEqual(bars.map(b => b.metro), ['4/4', '4/4', '2/4']);
});

check('lettore MusicXML: misure, armonie e ritornello', () => {
  const xml = `<score-partwise><work><work-title>Prova</work-title></work>
    <part><measure number="1"><attributes><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <barline location="left"><repeat direction="forward"/></barline>
      <harmony><root><root-step>D</root-step></root><kind text="m7">minor-seventh</kind></harmony></measure>
    <measure number="2">
      <harmony><root><root-step>G</root-step></root><kind text="7">dominant</kind></harmony>
      <barline location="right"><repeat direction="backward"/></barline></measure></part></score-partwise>`;
  const songs = MusicXML.parse(xml);
  assert.equal(songs[0].title, 'Prova');
  assert.equal(songs[0].bars.map(b => b.accordi.join(',')).join(' '), 'Dm7 G7 Dm7 G7');
  assert.equal(songs[0].bars[0].metro, '4/4');
});

// --- canzoniere: salva, ritrova, filtra, backup andata e ritorno
await (async () => {
  const brano = { title: 'Prova Blues', composer: 'Autore Test', stile: 'Blues',
    bpm: 100, bars: [{ accordi: ['C7'], metro: '4/4' }, { accordi: ['F7'], metro: '4/4' }] };
  const salvato = await CZ.salva(brano);
  assert.ok(salvato && salvato.id === 'prova blues|autore test');
  await CZ.salva({ ...brano, title: 'Altro Valzer', composer: 'B', stile: 'Waltz' });
  const lista = await CZ.tutti();
  assert.equal(lista.length, 2);
  assert.equal(lista[0].title, 'Altro Valzer', 'ordinati per titolo');
  assert.equal(CZ.cerca(lista, 'blues').length, 1, 'ricerca per stile');
  assert.equal(CZ.cerca(lista, 'autore').length, 1, 'ricerca per compositore');
  assert.equal(CZ.cerca(lista, 'niente').length, 0);
  const json = await CZ.esporta();
  await CZ.rimuovi('prova blues|autore test');
  assert.equal((await CZ.tutti()).length, 1);
  const n = await CZ.importa(json);
  assert.equal(n, 2, 'il backup rientra tutto');
  assert.equal((await CZ.tutti()).length, 2);
  assert.equal(await CZ.salva({ title: 'senza battute', bars: [] }), null, 'niente brani vuoti');
  console.log('  ok  canzoniere: salva, cerca, backup andata e ritorno');
})();

// --- playlist: piu' brani nello stesso link
check('lettore iReal: playlist a tre brani', () => {
  const uno = 'Uno=A=Swing=C=n=T44C^7 |F7 Z';
  const due = 'Due=B=Bossa=F=n=T44F^7 |Bb7 Z';
  const tre = 'Tre=C=Blues=G=n=T44G7 |C7 Z';
  const songs = IReal.parse('irealbook://' + [uno, due, tre].join('==='));
  assert.equal(songs.length, 3);
  assert.deepEqual(songs.map(x => x.title), ['Uno', 'Due', 'Tre']);
  assert.equal(IReal.toGrid(songs[1]), 'F^7 Bb7');
});

// --- link irealb reale (Autumn Leaves), regressione sul de-offuscamento
check('lettore iReal su link reale (Autumn Leaves)', () => {
  const url = 'irealb://Autumn%20Leaves=Kosma%20Joseph==Medium%20Swing=G%2D==1r34LbKcu7QyX314C%2D7XyX7hA%7CQyX7%5EbE%7CyQX7%5EbB%7CQyX7F%7CQyQ%7CD7b4T%7BA%2AQyX7%2DyQKclcKQyX6%2DG%7CQyX317bD%7CQyX7hA%5BB%2A%7D%20%20l%20LZCX6%2DG%7CL7bG%20Q%7CBb%5EyX31b7D%7CQyX7hAC%5B%2A%5DQyX7%5EbE%7CQyX7Q%7CG%2D7yX7F%7CZF%2D7%20E7LZAh7XyQ%7CD7b13XyQ%7CG%2D6XyQKcl%20%20Z=Jazz%2DMedium%20Swing=85=0';
  const songs = IReal.parse(url);
  assert.equal(songs.length, 1);
  assert.equal(songs[0].title, 'Autumn Leaves');
  assert.equal(songs[0].key, 'G-');
  assert.equal(songs[0].stile, 'Jazz-Medium Swing');
  assert.equal(songs[0].bpm, 85);
  assert.equal(songs[0].bars.length, 32, 'la forma AABC srotolata fa 32 battute');
  const grid = IReal.toGrid(songs[0]);
  assert.match(grid, /^C-7 F7 Bb\^7 Eb\^7 Ah7 D7b13 G-6 G-6 C-7/);
  for (const sym of grid.replace(/,/g, ' ').split(/\s+/)) {
    if (sym === 'N.C.') continue;
    assert.ok(parseChord(sym), 'sigla non riconosciuta: ' + sym);
  }
});

console.log(failed ? '\n' + failed + ' test falliti' : '\nTutti i test passati');
process.exit(failed ? 1 : 0);
