// Teoria: nomi delle note, riconoscimento dei simboli di accordo, gradi.

export const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Accordature: MIDI delle corde a vuoto, dalla piu' grave alla piu' acuta.
export const TUNINGS = {
  '4':  { label: '4 corde — E A D G',   open: [28, 33, 38, 43] },
  '5':  { label: '5 corde — B E A D G', open: [23, 28, 33, 38, 43] },
  '5c': { label: '5 corde — E A D G C', open: [28, 33, 38, 43, 48] },
  '6':  { label: '6 corde — B E A D G C', open: [23, 28, 33, 38, 43, 48] }
};

// Le sigle piu' lunghe vanno confrontate per prime.
const QUALITIES = [
  ['maj13', [0, 4, 7, 11, 14, 21]], ['maj9', [0, 4, 7, 11, 14]], ['maj7', [0, 4, 7, 11]],
  ['maj6', [0, 4, 7, 9]], ['m7b5', [0, 3, 6, 10]], ['mmaj7', [0, 3, 7, 11]],
  ['dim7', [0, 3, 6, 9]], ['dim', [0, 3, 6]],
  ['m11', [0, 3, 7, 10, 14, 17]], ['m9', [0, 3, 7, 10, 14]], ['m7', [0, 3, 7, 10]],
  ['m69', [0, 3, 7, 9, 14]], ['m6', [0, 3, 7, 9]],
  ['7sus4', [0, 5, 7, 10]], ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]],
  ['alt', [0, 4, 8, 10, 15]], ['7b9', [0, 4, 7, 10, 13]], ['7#9', [0, 4, 7, 10, 15]],
  ['7#5', [0, 4, 8, 10]], ['7b5', [0, 4, 6, 10]], ['7b13', [0, 4, 8, 10]],
  ['13', [0, 4, 7, 10, 14, 21]], ['11', [0, 4, 7, 10, 14, 17]], ['9', [0, 4, 7, 10, 14]],
  ['7', [0, 4, 7, 10]], ['69', [0, 4, 7, 9, 14]], ['6/9', [0, 4, 7, 9, 14]],
  ['add9', [0, 4, 7, 14]], ['6', [0, 4, 7, 9]], ['aug', [0, 4, 8]], ['5', [0, 7]],
  ['m', [0, 3, 7]], ['maj', [0, 4, 7]], ['', [0, 4, 7]]
].sort((a, b) => b[0].length - a[0].length);

// Porta la sigla in forma canonica, accettando anche la notazione iReal Pro.
function normaliseQuality(q) {
  return q
    .replace(/\u03947?/g, 'maj7')       // delta
    .replace(/\u00f87?/g, 'm7b5')       // cerchio barrato
    .replace(/\u00b07/g, 'dim7').replace(/\u00b0/g, 'dim')
    .replace(/^[-\u2212\u2013]/, 'm')
    .replace(/\^/g, 'maj')
    .replace(/^h7?/, 'm7b5').replace(/^o7/, 'dim7').replace(/^o/, 'dim')
    .replace(/^Maj|^MAJ/, 'maj').replace(/^M(?=7|9|11|13|$)/, 'maj').replace(/^min/, 'm')
    .replace(/^\+7/, '7#5').replace(/^\+$/, 'aug')
    .replace(/[()]/g, '')
    .replace(/^sus$/, 'sus4').replace(/^7sus$/, '7sus4');
}

const SIXTHS = ['6', 'm6', '69', '6/9', 'm69', 'maj6'];

/**
 * Riconosce un simbolo di accordo. Restituisce null se non lo capisce.
 * pcMap mappa pitch class -> grado in semitoni; -1 indica la nota al basso di uno slash chord.
 */
const NOMI_D = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOMI_B = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Db Eb F# Ab Bb: la grafia d'uso comune per le alterazioni. */
function nomeDi(pc) {
  pc = ((pc % 12) + 12) % 12;
  return pc === 6 ? 'F#' : (NOMI_B[pc] !== NOMI_D[pc] ? NOMI_B[pc] : NOMI_D[pc]);
}

/** Traspone una sigla di n semitoni, basso dello slash compreso. */
export function transposeSymbol(sym, n) {
  return sym.replace(/([A-G])([#b]?)/g, (tutto, lettera, acc, pos) => {
    // solo la radice e il basso dopo lo slash: mai le lettere dentro i suffissi
    if (pos !== 0 && sym[pos - 1] !== '/') return tutto;
    const pc = PC[lettera] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
    return nomeDi(pc + n);
  });
}

export function parseChord(symbol) {
  let s = (symbol || '').trim();
  if (!s) return null;

  let slash = null;
  const sl = /^(.*?)\/([A-Ga-g][#b]?)$/.exec(s);
  if (sl) {
    s = sl[1];
    const acc = sl[2][1];
    slash = (PITCH[sl[2][0].toUpperCase()] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
  }

  const m = /^([A-Ga-g])([#b\u266f\u266d]?)(.*)$/.exec(s);
  if (!m) return null;
  const letter = m[1].toUpperCase();
  const acc = (m[2] || '').replace('\u266f', '#').replace('\u266d', 'b');
  const q = normaliseQuality((m[3] || '').trim()).toLowerCase();

  let intervals = null, key = '';
  for (const [k, v] of QUALITIES) {
    if (q === k || (k && q.startsWith(k))) { intervals = v; key = k; break; }
  }
  if (!intervals) return null;

  const root = (PITCH[letter] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
  const flats = acc === 'b' || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(letter + acc);

  const pcMap = {};
  for (const iv of intervals) {
    const pc = (root + iv) % 12;
    if (pcMap[pc] === undefined) pcMap[pc] = iv;
  }
  if (slash !== null && pcMap[slash] === undefined) pcMap[slash] = -1;

  return {
    symbol, root, slash, intervals, pcMap, flats, key,
    isDim: key.startsWith('dim'),
    isSixth: SIXTHS.includes(key),
    third: intervals.find(i => i === 3 || i === 4),
    fifth: intervals.find(i => i === 6 || i === 7 || i === 8),
    seventh: intervals.find(i => i === 9 || i === 10 || i === 11)
  };
}

const DEGREE = {
  0: 'R', 1: '\u266d9', 2: '9', 3: '\u266d3', 4: '3', 5: '11', 6: '\u266d5', 7: '5',
  8: '\u266f5', 10: '\u266d7', 11: '7', 13: '\u266d9', 14: '9', 15: '\u266f9', 17: '11', 21: '13'
};

export function degreeName(iv, chord) {
  if (iv === -1) return 'bs';
  if (iv === 9) return chord.isDim ? '\u00b07' : (chord.isSixth ? '6' : '13');
  return DEGREE[iv] !== undefined ? DEGREE[iv] : (DEGREE[iv % 12] || '?');
}

export function degreeColor(iv) {
  if (iv === -1) return 'var(--ext)';
  const i = iv % 12;
  if (i === 0) return 'var(--root)';
  if (i === 3 || i === 4) return 'var(--third)';
  if (i === 6 || i === 7 || i === 8) return 'var(--fifth)';
  if (i === 9 || i === 10 || i === 11) return 'var(--sev)';
  return 'var(--ext)';
}

export function noteName(pc, flats) { return (flats ? FLAT : SHARP)[pc]; }

/** Posizione del tasto sul manico, spaziatura reale: 1 - 2^(-n/12). */
export function fretPos(n) { return 1 - Math.pow(2, -n / 12); }
