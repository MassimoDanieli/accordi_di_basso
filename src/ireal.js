// Lettura dei link iReal Pro. Tutto avviene in locale, nel browser.
//
// Formato: irealb://Titolo=Autore=Stile=Tonalita=n=CORPO===...=Nome playlist
// Nel formato irealb il corpo e' preceduto dal marcatore 1r34LbKcu7 ed e' offuscato
// a blocchi di 50 caratteri; irealbook e' in chiaro.

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

const CHORD_RE = /^([A-G][b#]?)((?:sus|alt|add|[0-9^\-oh+#b])*)(\/[A-G][b#]?)?/;

/** Dal corpo grezzo alle battute: [[ 'D-7' ], [ 'G7' ], ...] */
export function readBody(body) {
  const s = body.replace(/<[^>]*>/g, '').replace(/XyQ/g, ' ').replace(/\([^)]*\)/g, '');
  const bars = [];
  let cur = [];
  const flush = () => { if (cur.length) { bars.push(cur); cur = []; } };

  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if ('|[]{}Z'.includes(c)) { flush(); i++; continue; }
    if (c === '*' || c === 'N') { i += 2; continue; }        // sezione, finale 1/2
    if (c === 'T') { i += 3; continue; }                      // indicazione di tempo
    if ('YQSUslfu,+. \n\t'.includes(c)) { i++; continue; }    // spaziature e segni
    if (c === 'x') { if (bars.length) cur = cur.concat(bars[bars.length - 1]); i++; continue; }
    if (c === 'r') {
      const n = bars.length;
      if (n >= 2) { bars.push(bars[n - 2].slice()); bars.push(bars[n - 1].slice()); }
      i++; continue;
    }
    if (c === 'n' || c === 'p') { i++; continue; }             // N.C. e prolungamento
    const m = CHORD_RE.exec(s.slice(i));
    if (m && m[0]) { cur.push(m[1] + (m[2] || '') + (m[3] || '')); i += m[0].length; continue; }
    i++;
  }
  flush();
  return bars;
}

/** Restituisce l'elenco dei brani contenuti nel link. */
export function parse(text) {
  let s = (text || '').trim();
  try { s = decodeURIComponent(s.replace(/\+/g, '%20')); } catch (e) { /* link gia' in chiaro */ }
  const modern = /^irealb:\/\//.test(s);
  s = s.replace(/^irealb(ook)?:\/\//, '');

  const songs = [];
  s.split('===').forEach(part => {
    const f = part.split('=');
    if (f.length < 6) return;
    let body = f[5];
    if (!body) return;
    if (modern || body.includes(MARKER)) {
      const k = body.indexOf(MARKER);
      if (k >= 0) body = body.slice(k + MARKER.length);
      body = deobfuscate(body);
    }
    const bars = readBody(body).filter(b => b.length);
    if (bars.length > 1) {
      songs.push({ title: f[0] || 'senza titolo', composer: f[1] || '', key: f[3] || '', bars });
    }
  });
  return songs;
}

/** Le battute nel formato accettato dal campo Griglia. */
export function toGrid(song) {
  return song.bars.map(b => b.join(',')).join(' ');
}
