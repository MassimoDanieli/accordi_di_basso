// Generazione dei voicing dentro una zona del manico, piu' ottimizzazione del voice leading.

import { degreeName, noteName } from './theory.js';

export const VOICING_TYPES = [
  { id: 'arp',     name: 'Arpeggio',            block: false, size: 0, hint: 'tutte le note dell\u2019accordo in successione' },
  { id: 'shell',   name: 'Shell — R + 7 + 3',   block: true,  size: 3, hint: 'fondamentale e le due note guida' },
  { id: 'guide',   name: 'Note guida — 3 + 7',  block: true,  size: 2, hint: 'solo terza e settima, per il comping' },
  { id: 'tenth',   name: 'Decime — R + 3',      block: true,  size: 2, hint: 'fondamentale e terza a un\u2019ottava e mezza' },
  { id: 'triad',   name: 'Triade — R + 3 + 5',  block: true,  size: 3, hint: 'triade in posizione stretta' },
  { id: 'quartal', name: 'Quartale',            block: true,  size: 3, hint: 'quarte sovrapposte, dove l\u2019accordo lo consente' }
];

export function typeById(id) { return VOICING_TYPES.find(t => t.id === id) || VOICING_TYPES[0]; }

/** Tutte le note dell'accordo suonabili nella zona indicata. */
export function zoneNotes(chord, open, from, to) {
  const out = [];
  open.forEach((openMidi, si) => {
    for (let f = from; f <= to; f++) {
      const midi = openMidi + f;
      const iv = chord.pcMap[midi % 12];
      if (iv !== undefined) out.push({ si, f, midi, pc: midi % 12, iv });
    }
  });
  return out.sort((a, b) => a.midi - b.midi || a.si - b.si);
}

/** Arpeggio ascendente che parte da una nota e resta nella zona. */
function ascend(start, notes, count) {
  const seq = [start];
  let cur = start;
  while (seq.length < count) {
    const cands = notes.filter(n =>
      n.midi > cur.midi && n.midi <= cur.midi + 8 && n.si >= cur.si && n.si <= cur.si + 1);
    if (!cands.length) break;
    let best = cands[0];
    for (const n of cands) {
      if (n.midi < best.midi) best = n;
      else if (n.midi === best.midi && Math.abs(n.si - cur.si) < Math.abs(best.si - cur.si)) best = n;
    }
    seq.push(best);
    cur = best;
  }
  return seq;
}

/** Combinazioni suonabili: corde distinte e crescenti, note crescenti, apertura entro maxSpan. */
function playableSets(notes, size, maxSpan) {
  const res = [];
  const acc = [];
  (function rec(start) {
    if (acc.length === size) { res.push(acc.slice()); return; }
    for (let i = start; i < notes.length; i++) {
      const n = notes[i];
      if (acc.length) {
        const last = acc[acc.length - 1];
        if (n.si <= last.si || n.midi <= last.midi) continue;
      }
      const fretted = acc.concat([n]).filter(x => x.f > 0).map(x => x.f);
      if (fretted.length && Math.max(...fretted) - Math.min(...fretted) > maxSpan) continue;
      acc.push(n);
      rec(i + 1);
      acc.pop();
    }
  })(0);
  return res;
}

const sameSet = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

function requiredDegrees(chord, type) {
  const third = chord.third, seventh = chord.seventh, fifth = chord.fifth;
  if (type === 'guide') return third !== undefined && seventh !== undefined ? [third, seventh] : null;
  if (type === 'shell') {
    if (third !== undefined && seventh !== undefined) return [0, third, seventh];
    if (third !== undefined && fifth !== undefined) return [0, third, fifth];
    return null;
  }
  if (type === 'tenth') return third !== undefined ? [0, third] : null;
  if (type === 'triad') return third !== undefined && fifth !== undefined ? [0, third, fifth] : null;
  return null;
}

export function span(shape) {
  const f = shape.filter(n => n.f > 0).map(n => n.f);
  return f.length ? Math.max(...f) - Math.min(...f) : 0;
}

const INVERSION = ['fondamentale al basso', '1\u00b0 rivolto', '2\u00b0 rivolto', '3\u00b0 rivolto', '4\u00b0 rivolto', '5\u00b0 rivolto'];

export function inversionLabel(chord, bassIv) {
  if (bassIv === -1) return 'nota al basso indicata';
  const k = chord.intervals.indexOf(bassIv);
  return k >= 0 ? (INVERSION[k] || 'estensione al basso') : 'estensione al basso';
}

/**
 * Genera i voicing di un accordo dentro la zona.
 * Ritorna un array di { shape, bassIv, span, label, block }.
 */
export function generate(chord, open, from, to, type, maxSpan) {
  const notes = zoneNotes(chord, open, from, to);
  if (!notes.length) return [];

  if (type === 'arp') {
    const out = [];
    const degrees = chord.intervals.slice();
    if (chord.slash !== null && chord.pcMap[chord.slash] === -1) degrees.unshift(-1);
    for (const iv of degrees) {
      const start = notes.find(n => n.iv === iv);
      if (!start) continue;
      const shape = ascend(start, notes, Math.min(chord.intervals.length + 1, 6));
      if (shape.length < Math.min(3, chord.intervals.length)) continue;
      out.push({ shape, bassIv: iv, span: span(shape), block: false, label: inversionLabel(chord, iv) });
    }
    return out;
  }

  if (type === 'quartal') {
    const out = [];
    for (const a of notes) {
      const b = notes.find(n => n.midi === a.midi + 5 && n.si === a.si + 1);
      if (!b) continue;
      const c = notes.find(n => n.midi === b.midi + 5 && n.si === b.si + 1);
      if (!c) continue;
      const shape = [a, b, c];
      if (span(shape) > maxSpan) continue;
      out.push({ shape, bassIv: a.iv, span: span(shape), block: true, label: inversionLabel(chord, a.iv) });
    }
    return dedupe(out);
  }

  const want = requiredDegrees(chord, type);
  if (!want) return [];
  const target = want.slice().sort((x, y) => x - y);
  const sets = playableSets(notes, want.length, maxSpan);

  let out = sets
    .filter(s => sameSet(s.map(n => n.iv).sort((x, y) => x - y), target))
    .map(s => ({ shape: s, bassIv: s[0].iv, span: span(s), block: true, label: inversionLabel(chord, s[0].iv) }));

  if (type === 'tenth') {
    out = out.filter(v => {
      const d = v.shape[1].midi - v.shape[0].midi;
      return v.shape[0].iv === 0 && d >= 14 && d <= 17;
    });
  }
  return dedupe(out);
}

// Un voicing per nota al basso: il piu' compatto, poi il piu' vicino all'inizio zona.
function dedupe(list) {
  const byBass = new Map();
  for (const v of list) {
    const k = v.shape[0].midi;
    const prev = byBass.get(k);
    const score = v.span * 10 + v.shape.reduce((s, n) => s + n.f, 0) / v.shape.length;
    if (!prev || score < prev.score) byBass.set(k, { v, score });
  }
  return [...byBass.values()].map(x => x.v).sort((a, b) => a.shape[0].midi - b.shape[0].midi);
}

export function describe(voicing, chord) {
  return voicing.shape.map(n => noteName(n.pc, chord.flats)).join(' ');
}
export function degrees(voicing, chord) {
  return voicing.shape.map(n => degreeName(n.iv, chord)).join(' \u00b7 ');
}

/** Costo del passaggio fra due voicing: moto delle voci piu' spostamento della mano. */
export function moveCost(a, b) {
  const x = a.shape.map(n => n.midi), y = b.shape.map(n => n.midi);
  const k = Math.min(x.length, y.length);
  let motion = 0;
  for (let i = 0; i < k; i++) motion += Math.abs(x[i] - y[i]);
  const handA = a.shape.reduce((s, n) => s + n.f, 0) / a.shape.length;
  const handB = b.shape.reduce((s, n) => s + n.f, 0) / b.shape.length;
  return motion + 1.5 * Math.abs(handA - handB) + Math.abs(x.length - y.length) * 2;
}

/** Moto totale in semitoni fra due voicing, per mostrarlo a schermo. */
export function motion(a, b) {
  if (!a || !b) return null;
  const x = a.shape.map(n => n.midi), y = b.shape.map(n => n.midi);
  const k = Math.min(x.length, y.length);
  let t = 0;
  for (let i = 0; i < k; i++) t += Math.abs(x[i] - y[i]);
  return t;
}

/**
 * Programmazione dinamica: sceglie un voicing per accordo minimizzando il movimento
 * complessivo. candidates e' un array di array (vuoto = accordo saltato).
 * Ritorna un array di indici, -1 dove non c'e' scelta.
 */
export function optimise(candidates) {
  const idx = candidates.map((c, i) => (c && c.length ? i : -1)).filter(i => i >= 0);
  const out = candidates.map(() => -1);
  if (!idx.length) return out;

  let prevCosts = candidates[idx[0]].map(() => 0);
  const back = [];

  for (let step = 1; step < idx.length; step++) {
    const cur = candidates[idx[step]], prev = candidates[idx[step - 1]];
    const costs = new Array(cur.length).fill(Infinity);
    const from = new Array(cur.length).fill(0);
    cur.forEach((cv, j) => {
      prev.forEach((pv, i) => {
        const c = prevCosts[i] + moveCost(pv, cv) + cv.span * 0.5;
        if (c < costs[j]) { costs[j] = c; from[j] = i; }
      });
    });
    back.push(from);
    prevCosts = costs;
  }

  let best = 0;
  prevCosts.forEach((c, i) => { if (c < prevCosts[best]) best = i; });
  const chosen = new Array(idx.length);
  chosen[idx.length - 1] = best;
  for (let step = idx.length - 1; step > 0; step--) chosen[step - 1] = back[step - 1][chosen[step]];
  idx.forEach((seqIndex, k) => { out[seqIndex] = chosen[k]; });
  return out;
}
