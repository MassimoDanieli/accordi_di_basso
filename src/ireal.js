// Lettura dei link iReal Pro. Tutto avviene in locale, nel browser.
//
// Formato irealb: Titolo=Compositore==Stile=Tonalita==<marcatore+corpo>=Stile=bpm=...
// Il corpo e' preceduto dal marcatore 1r34LbKcu7 ed e' offuscato a blocchi di 50
// caratteri; il vecchio irealbook e' in chiaro. La forma (ritornelli, finali,
// segno, coda, D.C./D.S., Fine, metri) viene srotolata da src/forma.js, il cui
// vocabolario e' stato verificato contro l'export MusicXML della stessa app.

import { leggiCorpo, espandi } from './forma.js';

const MARKER = '1r34LbKcu7';

function unshuffle50(block) {
  const a = block.split('');
  let t;
  for (let i = 0; i < 5; i++) { t = a[i]; a[i] = a[49 - i]; a[49 - i] = t; }
  for (let i = 10; i < 24; i++) { t = a[i]; a[i] = a[49 - i]; a[49 - i] = t; }
  return a.join('');
}

function deobfuscate(s) {
  let out = '';
  while (s.length > 50) { out += unshuffle50(s.slice(0, 50)); s = s.slice(50); }
  return out + s;
}

/** Restituisce l'elenco dei brani contenuti nel link, con la forma srotolata. */
export function parse(text) {
  let s = (text || '').trim();
  try { s = decodeURIComponent(s.replace(/\+/g, '%20')); } catch (e) { /* link gia' in chiaro */ }
  s = s.replace(/^irealb(ook)?:\/\//, '');

  const songs = [];
  s.split('===').forEach(part => {
    const f = part.split('=');
    if (f.length < 6) return;
    // Il corpo si riconosce dal marcatore, non dalla posizione: le versioni
    // dell'app differiscono sul numero di campi vuoti.
    let body = f.find(x => x.includes(MARKER));
    let key = f[4] || f[3] || '';
    let stile = '', bpm = 0;
    if (body) {
      const k = f.indexOf(body);
      stile = f[k + 1] || '';
      bpm = +(f[k + 2] || 0) || 0;
      body = deobfuscate(body.slice(body.indexOf(MARKER) + MARKER.length));
    } else {
      // irealbook, in chiaro: Titolo=Compositore=Stile=Tonalita=n=corpo
      body = f[5];
      key = f[3] || '';
      stile = f[2] || '';
      if (!body) return;
    }
    const misure = leggiCorpo(body);
    const bars = espandi(misure).map(m => ({ accordi: m.accordi, metro: m.metro }));
    if (bars.length > 1) {
      songs.push({ title: f[0] || 'senza titolo', composer: f[1] || '', key, stile, bpm, bars });
    }
  });
  return songs;
}

/** La griglia per la barra: battute separate da spazio, accordi nella battuta da virgola. */
export function toGrid(song) {
  return song.bars
    .map(b => b.accordi.join(',') || 'N.C.')
    .join(' ');
}

/** Il metro d'apertura del brano, per il selettore: '4', '3', '2' o '6'. */
export function beatsOf(song) {
  const m = (song.bars.find(b => b.metro) || {}).metro || '';
  if (m === '3/4') return 3;
  if (m === '2/4') return 2;
  if (m === '6/8') return 6;
  return 4;
}
