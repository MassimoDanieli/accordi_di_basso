import assert from 'node:assert/strict';
import { parseChord, TUNINGS } from '../src/theory.js';
import * as V from '../src/voicings.js';
import * as Tab from '../src/tab.js';
import * as IReal from '../src/ireal.js';

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

check('lettore iReal in chiaro', () => {
  const url = 'irealbook://Prova=Autore=Medium Swing=C=n=T44D-7 |G7 |C^7 |x |Z';
  const songs = IReal.parse(url);
  assert.equal(songs.length, 1);
  assert.equal(songs[0].title, 'Prova');
  const grid = IReal.toGrid(songs[0]);
  console.log('        griglia: ' + grid);
  assert.ok(grid.startsWith('D-7 G7 C^7'));
});

console.log(failed ? '\n' + failed + ' test falliti' : '\nTutti i test passati');
process.exit(failed ? 1 : 0);
