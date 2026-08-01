(function () {

"use strict";

const __mod = {};

__mod.theory = (function () {

  // Teoria: nomi delle note, riconoscimento dei simboli di accordo, gradi.

  const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Accordature: MIDI delle corde a vuoto, dalla piu' grave alla piu' acuta.
  const TUNINGS = {
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
  function parseChord(symbol) {
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

  function degreeName(iv, chord) {
    if (iv === -1) return 'bs';
    if (iv === 9) return chord.isDim ? '\u00b07' : (chord.isSixth ? '6' : '13');
    return DEGREE[iv] !== undefined ? DEGREE[iv] : (DEGREE[iv % 12] || '?');
  }

  function degreeColor(iv) {
    if (iv === -1) return 'var(--ext)';
    const i = iv % 12;
    if (i === 0) return 'var(--root)';
    if (i === 3 || i === 4) return 'var(--third)';
    if (i === 6 || i === 7 || i === 8) return 'var(--fifth)';
    if (i === 9 || i === 10 || i === 11) return 'var(--sev)';
    return 'var(--ext)';
  }

  function noteName(pc, flats) { return (flats ? FLAT : SHARP)[pc]; }

  /** Posizione del tasto sul manico, spaziatura reale: 1 - 2^(-n/12). */
  function fretPos(n) { return 1 - Math.pow(2, -n / 12); }

  return { PITCH, SHARP, FLAT, TUNINGS, parseChord, degreeName, degreeColor, noteName, fretPos };
})();

__mod.voicings = (function () {
  const { degreeName, noteName } = __mod.theory;
  // Generazione dei voicing dentro una zona del manico, piu' ottimizzazione del voice leading.


  const VOICING_TYPES = [
    { id: 'arp',     block: false, size: 0 },
    { id: 'shell',   block: true,  size: 3 },
    { id: 'guide',   block: true,  size: 2 },
    { id: 'tenth',   block: true,  size: 2 },
    { id: 'triad',   block: true,  size: 3 },
    { id: 'quartal', block: true,  size: 3 }
  ];

  function typeById(id) { return VOICING_TYPES.find(t => t.id === id) || VOICING_TYPES[0]; }

  /** Tutte le note dell'accordo suonabili nella zona indicata. */
  function zoneNotes(chord, open, from, to) {
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

  function span(shape) {
    const f = shape.filter(n => n.f > 0).map(n => n.f);
    return f.length ? Math.max(...f) - Math.min(...f) : 0;
  }

  /** -1 nota al basso indicata, 0..n rivolto, null estensione. */
  function inversion(chord, bassIv) {
    if (bassIv === -1) return -1;
    const k = chord.intervals.indexOf(bassIv);
    return k >= 0 && k <= 5 ? k : null;
  }

  /**
   * Genera i voicing di un accordo dentro la zona.
   * Ritorna un array di { shape, bassIv, span, block }.
   */
  function generate(chord, open, from, to, type, maxSpan) {
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
        out.push({ shape, bassIv: iv, span: span(shape), block: false });
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
        out.push({ shape, bassIv: a.iv, span: span(shape), block: true });
      }
      return dedupe(out);
    }

    const want = requiredDegrees(chord, type);
    if (!want) return [];
    const target = want.slice().sort((x, y) => x - y);
    const sets = playableSets(notes, want.length, maxSpan);

    let out = sets
      .filter(s => sameSet(s.map(n => n.iv).sort((x, y) => x - y), target))
      .map(s => ({ shape: s, bassIv: s[0].iv, span: span(s), block: true }));

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

  function describe(voicing, chord) {
    return voicing.shape.map(n => noteName(n.pc, chord.flats)).join(' ');
  }
  function degrees(voicing, chord) {
    return voicing.shape.map(n => degreeName(n.iv, chord)).join(' \u00b7 ');
  }

  /** Costo del passaggio fra due voicing: moto delle voci piu' spostamento della mano. */
  function moveCost(a, b) {
    const x = a.shape.map(n => n.midi), y = b.shape.map(n => n.midi);
    const k = Math.min(x.length, y.length);
    let motion = 0;
    for (let i = 0; i < k; i++) motion += Math.abs(x[i] - y[i]);
    const handA = a.shape.reduce((s, n) => s + n.f, 0) / a.shape.length;
    const handB = b.shape.reduce((s, n) => s + n.f, 0) / b.shape.length;
    return motion + 1.5 * Math.abs(handA - handB) + Math.abs(x.length - y.length) * 2;
  }

  /** Moto totale in semitoni fra due voicing, per mostrarlo a schermo. */
  function motion(a, b) {
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
  function optimise(candidates) {
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

  return { VOICING_TYPES, typeById, zoneNotes, span, inversion, generate, describe, degrees, moveCost, motion, optimise };
})();

__mod.audio = (function () {

  // Sintesi essenziale: una corda pizzicata e un click di metronomo.

  let ctx = null;
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function pluck(midi, at = 0, dur = 0.85, vol = 0.34) {
    const A = audio();
    const t0 = A.currentTime + at;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const gain = A.createGain();
    const lp = A.createBiquadFilter();

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, t0);
    lp.frequency.exponentialRampToValueAtTime(360, t0 + dur);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    [['triangle', 1, 0.9], ['sine', 2, 0.22], ['sine', 0.5, 0.3]].forEach(([type, mul, amp]) => {
      const osc = A.createOscillator(), g = A.createGain();
      osc.type = type;
      osc.frequency.value = freq * mul;
      g.gain.value = amp;
      osc.connect(g); g.connect(lp);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    });

    lp.connect(gain);
    gain.connect(A.destination);
  }

  function arpeggio(midis, step = 0.26, dur = 0.9) {
    midis.forEach((m, i) => pluck(m, i * step, dur));
  }

  /** Accordo: le corde partono quasi insieme, con un filo di ritardo fra una e l'altra. */
  function strum(midis, dur = 1.4, spread = 0.02) {
    midis.forEach((m, i) => pluck(m, i * spread, dur, 0.26));
  }

  function click(at = 0, accent = false) {
    const A = audio();
    const t0 = A.currentTime + at;
    const osc = A.createOscillator(), g = A.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1500 : 1050;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(accent ? 0.10 : 0.055, t0 + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    osc.connect(g); g.connect(A.destination);
    osc.start(t0); osc.stop(t0 + 0.07);
  }

  return { audio, pluck, arpeggio, strum, click };
})();

__mod.render = (function () {
  const { SHARP, degreeName, degreeColor, noteName, fretPos } = __mod.theory;
  // Disegno del manico e dei diagrammi di posizione.


  const MONO = 'JetBrains Mono,monospace';
  const DOTS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

  /** Ordine di disegno delle corde: di norma la piu' acuta in alto, come nelle tab. */
  function stringOrder(count, flipped) {
    const idx = Array.from({ length: count }, (_, i) => i);
    return flipped ? idx : idx.reverse();
  }

  function fretboard(opts) {
    const { chord, open, zoneFrom, zoneTo, frets, labels, flipped, dimOutside } = opts;
    const ord = stringOrder(open.length, flipped);
    const PT = 32, PB = 36, ROW = 60, W = 800, NUT = 78, BW = W - NUT - 12;
    const H = PT + ROW * (open.length - 1) + PB;
    const fx = f => NUT + (fretPos(f) / fretPos(frets)) * BW;
    const cx = f => (f === 0 ? NUT - 21 : (fx(f - 1) + fx(f)) / 2);
    const sy = r => PT + r * ROW;

    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    s += `<defs>
      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--wood1)"/><stop offset="1" style="stop-color:var(--wood2)"/>
      </linearGradient>
      <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style="stop-color:var(--fret1)"/><stop offset=".5" style="stop-color:var(--fret2)"/><stop offset="1" style="stop-color:var(--fret1)"/>
      </linearGradient>
    </defs>`;
    const boardH = ROW * (open.length - 1) + 34;
    s += `<rect x="${NUT}" y="${PT - 17}" width="${BW}" height="${boardH}" rx="5" fill="url(#wg)"/>`;
    s += `<rect x="${NUT}" y="${PT - 17}" width="${BW}" height="3" rx="1.5" fill="#FFFFFF" opacity=".14"/>`;
    s += `<rect x="${NUT}" y="${PT - 17 + boardH - 3}" width="${BW}" height="3" rx="1.5" fill="#000000" opacity=".18"/>`;

    const zx1 = zoneFrom === 0 ? NUT - 34 : fx(zoneFrom - 1);
    s += `<rect x="${zx1}" y="${PT - 21}" width="${fx(zoneTo) - zx1}" height="${ROW * (open.length - 1) + 42}" rx="6" fill="var(--root)" opacity=".10" stroke="var(--root)" stroke-opacity=".35"/>`;
    s += `<rect x="${NUT - 5}" y="${PT - 17}" width="5" height="${ROW * (open.length - 1) + 34}" fill="var(--nut)" opacity=".85"/>`;

    for (let f = 1; f <= frets; f++) {
      const wf = f < 6 ? 3.4 : 2.6;
      s += `<rect x="${fx(f) - wf / 2}" y="${PT - 17}" width="${wf}" height="${boardH}" rx="${wf / 2}" fill="url(#fg)" opacity=".92"/>`;
      s += `<line x1="${fx(f) + wf / 2}" y1="${PT - 17}" x2="${fx(f) + wf / 2}" y2="${PT - 17 + boardH}" stroke="#000" stroke-width=".7" opacity=".22"/>`;
    }

    const my = PT + ROW * (open.length - 1) / 2;
    DOTS.filter(d => d <= frets).forEach(d => {
      s += d % 12 === 0
        ? `<circle cx="${cx(d)}" cy="${my - 19}" r="6" fill="var(--inlay)"/><circle cx="${cx(d)}" cy="${my + 19}" r="6" fill="var(--inlay)"/>`
        : `<circle cx="${cx(d)}" cy="${my}" r="6" fill="var(--inlay)"/>`;
    });

    ord.forEach((si, row) => {
      const y = sy(row);
      s += `<line x1="${NUT - 44}" y1="${y}" x2="${fx(frets)}" y2="${y}" stroke="var(--string)" stroke-width="${1.2 + (open.length - 1 - si) * 0.7}" opacity=".55"/>`;
      s += `<text x="10" y="${y + 5}" fill="var(--faint)" font-size="16" font-family="${MONO}">${SHARP[open[si] % 12]}</text>`;
    });

    for (let f = 0; f <= frets; f++) {
      const inZone = f >= zoneFrom && f <= zoneTo;
      s += `<text x="${cx(f)}" y="${H - 12}" text-anchor="middle" font-size="15" font-family="${MONO}" fill="${inZone ? 'var(--root)' : 'var(--faint)'}">${f}</text>`;
    }

    if (chord) {
      const inShape = new Set((opts.highlight || []).map(n => n.si + ':' + n.f));
      ord.forEach((si, row) => {
        for (let f = 0; f <= frets; f++) {
          const midi = open[si] + f;
          const iv = chord.pcMap[midi % 12];
          if (iv === undefined) continue;
          const inZone = f >= zoneFrom && f <= zoneTo;
          if (!inZone && !dimOutside) continue;
          const picked = inShape.has(si + ':' + f);
          const x = cx(f), y = sy(row);
          const text = labels === 'degrees' ? degreeName(iv, chord) : noteName(midi % 12, chord.flats);
          const col = degreeColor(iv);
          const op = picked ? 1 : (inZone ? 0.4 : 0.13);
          s += `<g opacity="${op}" style="cursor:pointer" data-midi="${midi}" data-pos="${si}:${f}" class="note">`
            + `<circle cx="${x}" cy="${y}" r="20" fill="${col}"/>`
            + (picked ? `<circle cx="${x}" cy="${y}" r="25.5" fill="none" stroke="${col}" stroke-width="2"/>` : '')
            + `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="${text.length > 2 ? 15 : 17}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text></g>`;
        }
      });
    }
    // Note di passaggio della linea walking: pallini rossi, accesi a tempo.
    (opts.ghosts || []).forEach(g => {
      const row = ord.indexOf(g.si);
      if (row < 0 || g.f > frets || g.f < 0) return;
      s += `<g class="note ghost" data-pos="${g.si}:${g.f}">`
        + `<circle cx="${cx(g.f)}" cy="${sy(row)}" r="14" fill="var(--pass)"/>`
        + `<text x="${cx(g.f)}" y="${sy(row) + 4}" text-anchor="middle" font-size="12" font-weight="600" font-family="${MONO}" fill="#FFF6EE">${SHARP[g.pc]}</text></g>`;
    });

    return s + '</svg>';
  }

  /** Diagramma piccolo della sola zona, con le note del voicing. */
  function diagram(chord, voicing, opts) {
    const { open, zoneFrom, zoneTo, flipped } = opts;
    const ord = stringOrder(open.length, flipped);
    const n = zoneTo - zoneFrom + 1;
    const PL = 24, PT = 20, PB = 22, ROW = 28, CW = 40;
    const W = PL + CW * n + 10, H = PT + ROW * (open.length - 1) + PB;
    const cx = f => PL + CW * (f - zoneFrom) + CW / 2;
    const sy = r => PT + r * ROW;

    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    for (let f = zoneFrom; f <= zoneTo + 1; f++) {
      const x = PL + CW * (f - zoneFrom);
      s += `<line x1="${x}" y1="${PT - 7}" x2="${x}" y2="${PT + ROW * (open.length - 1) + 7}" stroke="var(--fretwire)" stroke-width="${f === 0 ? 3 : 1}" opacity="${f === 0 ? 0.8 : 0.35}"/>`;
    }
    ord.forEach((si, row) => {
      const y = sy(row);
      s += `<line x1="${PL - 6}" y1="${y}" x2="${PL + CW * n}" y2="${y}" stroke="var(--string)" stroke-width="1" opacity=".35"/>`;
    });
    for (let f = zoneFrom; f <= zoneTo; f++)
      s += `<text x="${cx(f)}" y="${H - 6}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="var(--faint)">${f}</text>`;

    voicing.shape.forEach((note, i) => {
      const row = ord.indexOf(note.si);
      if (row < 0) return;
      const x = cx(note.f), y = sy(row), text = degreeName(note.iv, chord);
      s += `<g class="note" data-pos="${note.si}:${note.f}">`
        + `<circle cx="${x}" cy="${y}" r="12.5" fill="${degreeColor(note.iv)}"/>`
        + `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${text.length > 2 ? 9 : 11}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text></g>`;
      if (!voicing.block)
        s += `<text x="${x}" y="${y - 13}" text-anchor="middle" font-size="8" font-family="${MONO}" fill="var(--faint)">${i + 1}</text>`;
    });
    return s + '</svg>';
  }

  return { stringOrder, fretboard, diagram };
})();

__mod.tab = (function () {
  const { SHARP } = __mod.theory;
  const { stringOrder } = __mod.render;
  // Esportazione in tab ASCII.



  /**
   * bars: [{ label: string[], columns: [{si, f}], block: boolean }]
   * Un voicing "block" viene scritto come colonna unica, le note in verticale.
   */
  function render(bars, open, flipped, perLine, header) {
    const ord = stringOrder(open.length, flipped);
    const names = ord.map(si => (SHARP[open[si] % 12] + '  ').slice(0, 2));
    const lines = [];

    for (let start = 0; start < bars.length; start += perLine) {
      const chunk = bars.slice(start, start + perLine);
      let head = '   ';
      const rows = ord.map((_, r) => names[r] + '|');

      chunk.forEach(bar => {
        const cells = bar.block ? groupBlocks(bar.columns) : bar.columns.map(c => [c]);
        let w = 3;
        cells.forEach(cell => cell.forEach(c => {
          w = Math.max(w, String(c.f).length + (c.pass ? 4 : 2));
        }));

        const label = bar.label.join(' ');
        // La battuta non e' mai piu' stretta della sua etichetta.
        const filler = Math.max(0, label.length + 1 - (cells.length * w + 3));
        const width = cells.length * w + 3 + filler;
        head += label + ' '.repeat(Math.max(1, width - label.length));

        ord.forEach((si, r) => {
          let line = '-';
          cells.forEach(cell => {
            const hit = cell.find(c => c.si === si);
            const text = hit ? (hit.pass ? '(' + hit.f + ')' : String(hit.f)) : '';
            const pad = w - text.length, left = Math.floor(pad / 2);
            line += '-'.repeat(left) + text + '-'.repeat(pad - left);
          });
          rows[r] += line + '-'.repeat(filler) + '-|';
        });
      });

      lines.push(head.replace(/\s+$/, ''));
      rows.forEach(r => lines.push(r));
      lines.push('');
    }
    return header + '\n\n' + lines.join('\n');
  }

  /** Le note di uno stesso voicing a blocchi vanno impilate nella stessa colonna. */
  function groupBlocks(columns) {
    const out = [];
    let cur = [];
    columns.forEach(c => {
      if (c.newGroup && cur.length) { out.push(cur); cur = []; }
      cur.push(c);
    });
    if (cur.length) out.push(cur);
    return out;
  }

  return { render };
})();

__mod.ireal = (function () {

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
  function readBody(body) {
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
  function parse(text) {
    let s = (text || '').trim();
    try { s = decodeURIComponent(s.replace(/\+/g, '%20')); } catch (e) { /* link gia' in chiaro */ }
    const modern = /^irealb:\/\//.test(s);
    s = s.replace(/^irealb(ook)?:\/\//, '');

    const songs = [];
    s.split('===').forEach(part => {
      const f = part.split('=');
      if (f.length < 6) return;
      // Formato irealb: Titolo=Compositore==Stile=Tonalita==<marcatore+corpo>=...
      // Il corpo si riconosce dal marcatore, non dalla posizione: le versioni
      // dell'app differiscono sul numero di campi vuoti.
      let body = f.find(x => x.includes(MARKER));
      let key = f[4] || f[3] || '';
      if (body) {
        body = deobfuscate(body.slice(body.indexOf(MARKER) + MARKER.length));
      } else {
        // irealbook, in chiaro: Titolo=Compositore=Stile=Tonalita=n=corpo
        body = f[5];
        key = f[3] || '';
        if (!body) return;
      }
      const bars = readBody(body).filter(b => b.length);
      if (bars.length > 1) {
        songs.push({ title: f[0] || 'senza titolo', composer: f[1] || '', key, bars });
      }
    });
    return songs;
  }

  /** Le battute nel formato accettato dal campo Griglia. */
  function toGrid(song) {
    return song.bars.map(b => b.join(',')).join(' ');
  }

  return { readBody, parse, toGrid };
})();

__mod.library = (function () {

  // Forme armoniche, brani tradizionali di pubblico dominio e versioni essenziali
  // semplificate di brani celebri (le progressioni armoniche di base non sono
  // soggette a diritto d'autore; le griglie complete degli standard si importano
  // dalle proprie carte iReal).
  //
  // Ogni voce e': [nome italiano, nome inglese, stile, bpm, griglia].

  const LIBRARY = [
    ['Blues maggiore, 12 battute (Fa)', 'Major blues, 12 bars (F)', 'Blues', 104,
     'F7 Bb7 F7 F7 Bb7 Bb7 F7 F7 C7 Bb7 F7 C7'],
    ['Blues jazz, 12 battute (Sib)', 'Jazz blues, 12 bars (Bb)', 'Jazz blues', 132,
     'Bb7 Eb7 Bb7 F-7,Bb7 Eb7 Edim7 Bb7 D-7,G7 C-7 F7 Bb7,G7 C-7,F7'],
    ['Blues minore (Do)', 'Minor blues (C)', 'Blues', 96,
     'C-7 C-7 C-7 C-7 F-7 F-7 C-7 C-7 Ab7 G7 C-7 G7'],
    ['12 battute in Mi', '12 bars in E', 'Blues rock', 100,
     'E7 E7 E7 E7 A7 A7 E7 E7 B7 A7 E7 B7'],
    ['Rhythm changes, sezione A (Sib)', 'Rhythm changes, A section (Bb)', 'Turnaround', 160,
     'Bb^7,G-7 C-7,F7 Bb^7,G-7 C-7,F7 Bb7 Eb7,Edim7 Bb^7,F7 Bb6'],
    ['Stile Autumn Leaves, sezione A', 'Autumn Leaves style, A section', 'II-V-I', 120,
     'C-7 F7 Bb^7 Eb^7 A-7b5 D7b9 G-6 G-6'],
    ['Stile Blue Bossa, prime otto', 'Blue Bossa style, first eight', 'Bossa jazz', 116,
     'C-7 C-7 F-7 F-7 D-7b5 G7b9 C-7 C-7'],
    ['Stile Song for My Father', 'Song for My Father style', 'Hard bop', 126,
     'F-7 F-7 Eb7 Eb7 Db7 C7 F-7 F-7'],
    ['Stile So What, vamp modale', 'So What style, modal vamp', 'Modal jazz', 136,
     'D-7 D-7 D-7 D-7 Eb-7 Eb-7 D-7 D-7'],
    ['Giro pop I-vi-IV-V (Do)', 'Pop loop I-vi-IV-V (C)', 'Pop / Soul', 118,
     'C A-7 F G7'],
    ['Giro pop I-V-vi-IV (Do)', 'Pop loop I-V-vi-IV (C)', 'Pop', 72,
     'C G A- F'],
    ['Giro reggae I-IV-I-V (La)', 'Reggae loop I-IV-I-V (A)', 'Reggae', 76,
     'A D A E'],
    ['II-V-I che scende per quarte', 'II-V-I moving down in fourths', 'Studio', 120,
     'D-7 G7 C^7 C^7 G-7 C7 F^7 F^7 C-7 F7 Bb^7 Bb^7 F-7 Bb7 Eb^7 Eb^7'],
    ['II-V-I minore', 'Minor II-V-I', 'Studio', 110,
     'D-7b5 G7b9 C-6 C-6 G-7b5 C7b9 F-6 F-6'],
    ['Turnaround I-VI-II-V (Do)', 'Turnaround I-VI-II-V (C)', 'Turnaround', 140,
     'C^7 A7 D-7 G7'],
    ['Cadenza andalusa (La minore)', 'Andalusian cadence (A minor)', 'Flamenco', 112,
     'A- G F E7'],
    ['Ciclo di quinte in dominanti', 'Cycle of fifths in dominants', 'Tecnica', 90,
     'C7 F7 Bb7 Eb7 Ab7 Db7 Gb7 B7 E7 A7 D7 G7'],
    ['Ciclo di terze maggiori', 'Major thirds cycle', 'Tecnica', 100,
     'C^7 Eb7 Ab^7 B7 E^7 G7 C^7 C^7'],
    ['Vamp dorico a due accordi', 'Two-chord Dorian vamp', 'Modale', 96,
     'D-7 D-7 D-7 D-7 E-7 E-7 E-7 E-7'],
    ['Canone di Pachelbel (Re)', 'Pachelbel canon (D)', 'Classico', 66,
     'D A B- F# G D G A'],
    ['House of the Rising Sun (trad.)', 'House of the Rising Sun (trad.)', 'Folk', 78,
     'A- C D F A- C E7 E7'],
    ['Greensleeves (trad.)', 'Greensleeves (trad.)', 'Trad.', 90,
     'A- C G E7 A- C E7 A-'],
    ['St. James Infirmary (trad.)', 'St. James Infirmary (trad.)', 'Trad. blues', 84,
     'D- A7 D- D7 G- D- A7 D-'],
    ['Amazing Grace (trad.)', 'Amazing Grace (trad.)', 'Gospel', 70,
     'G G C G G G D7 D7 G G C G G D7 G G'],
    ['Scarborough Fair (trad.)', 'Scarborough Fair (trad.)', 'Folk', 92,
     'A- A- C A- A- G A- A-'],
    ['Sinner Man, vamp minore (trad.)', 'Sinner Man, minor vamp (trad.)', 'Trad.', 132,
     'A- A- A- A- D- D- A- A- E7 D- A- A-']
  ];

  return { LIBRARY };
})();

__mod.theme = (function () {

  // Tema chiaro/scuro. La preferenza sopravvive alla chiusura della pagina quando il
  // browser lo consente; in navigazione privata si ripiega sulle impostazioni di sistema.

  const KEY = 'manico-tema';

  function readTheme() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'chiaro' || saved === 'scuro') return saved;
    } catch (e) { /* archiviazione non disponibile */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'scuro' : 'chiaro';
  }

  function inglese() {
    try {
      const l = localStorage.getItem('manico-lingua');
      if (l === 'en' || l === 'it') return l === 'en';
    } catch (e) { /* archiviazione non disponibile */ }
    return (document.documentElement.lang || 'it').toLowerCase().startsWith('en');
  }

  /** Aggiorna la scritta del pulsante nella lingua corrente. */
  function refreshThemeLabel() {
    const btn = document.getElementById('tema');
    if (!btn) return;
    const chiaro = document.documentElement.getAttribute('data-tema') === 'chiaro';
    const en = inglese();
    btn.textContent = chiaro ? (en ? 'Dark' : 'Scuro') : (en ? 'Light' : 'Chiaro');
    btn.title = chiaro ? (en ? 'Switch to the dark theme' : 'Passa al tema scuro')
                       : (en ? 'Switch to the light theme' : 'Passa al tema chiaro');
    btn.setAttribute('aria-label', btn.title);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-tema', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) { /* niente da fare */ }
    refreshThemeLabel();
  }

  function toggleTheme() {
    applyTheme(document.documentElement.getAttribute('data-tema') === 'chiaro' ? 'scuro' : 'chiaro');
  }

  /**
   * Il tema si aggancia con una delega sul documento: cosi' funziona anche se il
   * pulsante viene ridisegnato, e non dipende dal resto dell'inizializzazione.
   */
  function initTheme() {
    applyTheme(readTheme());
    document.addEventListener('click', e => {
      if (e.target && e.target.closest && e.target.closest('#tema')) toggleTheme();
    });
  }

  return { readTheme, refreshThemeLabel, applyTheme, toggleTheme, initTheme };
})();

__mod.i18n = (function () {

  // Testi in italiano e inglese. La lingua si sceglie dalla barra e resta memorizzata.

  const KEY = 'manico-lingua';

  const D = {
    it: {
      'bar.grid': 'Griglia di accordi',
      'bar.show': 'Mostra',
      'bar.play': 'Play',
      'bar.stop': 'Stop',
      'bar.tempo': 'Tempo',
      'bar.guide': 'Guida',
      'bar.forms': 'Forme',
      'bar.ireal': 'iReal',
      'bar.tab': 'Tab',
      'bar.settings': 'Impostazioni',
      'bar.gridTitle': 'Spazio fra le battute, virgola dentro la battuta',

      'tip.syntax': 'Spazio fra le battute, virgola dentro la battuta:',
      'tip.guide': 'guida completa',

      'zone.from': 'Zona, dal tasto',
      'zone.width': 'ampiezza',
      'zone.frets': n => n + (n === 1 ? ' tasto' : ' tasti'),
      'zone.desc': (a, b) => a === 0 ? `tasti 0\u2013${b}, corde a vuoto incluse` : `tasti ${a}\u2013${b}`,
      'zone.coverage': 'Copertura per posizione',
      'zone.coverageTitle': 'Percentuale di note raggiungibili senza spostarsi, sul peggiore accordo della griglia',
      'zone.cell': (a, b, p) => `tasti ${a}\u2013${b}, copertura ${p}%`,

      'key.root': 'fondamentale', 'key.third': 'terza', 'key.fifth': 'quinta',
      'key.sev': 'sesta e settima', 'key.ext': 'estensioni',

      'v.title': 'Voicing',
      'v.count': (n, ch, a, b) => `\u2014 ${n} per ${ch}, tasti ${a}\u2013${b}`,
      'v.type': 'Tipo',
      'v.span': 'apertura mano',
      'v.lead': 'Ottimizza voice leading',
      'v.total': n => `moto complessivo: ${n} semitoni`,
      'v.motion': n => `moto ${n}`,
      'v.spanOf': n => `apertura ${n}`,
      'v.none': 'Nessun accordo selezionato.',
      'v.empty': (tipo, a, b) => `Nessun ${tipo} fra il tasto ${a} e il ${b}. Allarga la zona, aumenta l\u2019apertura della mano o cambia tipo di voicing.`,
      'v.open': 'Mostra i voicing',
      'v.close': 'Nascondi i voicing',
      'v.listen': 'ascolta',

      'inv.-1': 'nota al basso indicata',
      'inv.0': 'fondamentale al basso',
      'inv.1': '1\u00b0 rivolto', 'inv.2': '2\u00b0 rivolto', 'inv.3': '3\u00b0 rivolto',
      'inv.4': '4\u00b0 rivolto', 'inv.5': '5\u00b0 rivolto', 'inv.x': 'estensione al basso',

      'vt.arp.name': 'Arpeggio', 'vt.arp.hint': 'tutte le note dell\u2019accordo in successione',
      'vt.shell.name': 'Shell \u2014 R + 7 + 3', 'vt.shell.hint': 'fondamentale e le due note guida',
      'vt.guide.name': 'Note guida \u2014 3 + 7', 'vt.guide.hint': 'solo terza e settima, per il comping',
      'vt.tenth.name': 'Decime \u2014 R + 3', 'vt.tenth.hint': 'fondamentale e terza a un\u2019ottava e mezza',
      'vt.triad.name': 'Triade \u2014 R + 3 + 5', 'vt.triad.hint': 'triade in posizione stretta',
      'vt.quartal.name': 'Quartale', 'vt.quartal.hint': 'quarte sovrapposte, dove l\u2019accordo lo consente',

      'tun.4': '4 corde \u00b7 E A D G', 'tun.5': '5 corde \u00b7 B E A D G',
      'tun.5c': '5 corde con Do acuto \u00b7 E A D G C', 'tun.6': '6 corde \u00b7 B E A D G C',
      'set.title': 'Strumento e vista',
      'set.bass': 'Basso', 'set.frets': 'Tasti mostrati', 'set.fretsTo': n => 'fino al ' + n,
      'set.notes': 'Note sul manico', 'set.degrees': 'Gradi', 'set.names': 'Note',
      'set.flip': 'Inverti corde', 'set.dim': 'Sfuma fuori zona',
      'set.viewHint': '<b>Gradi</b> mostra R, 3, 5, \u266d7 invece dei nomi delle note. <b>Inverti corde</b> mette la corda piu\u0300 grave in alto. <b>Sfuma fuori zona</b> lascia visibili in trasparenza le note fuori dalla zona.',
      'play.title': 'Esecuzione',
      'play.meter': 'Metro', 'play.what': 'Cosa suona',
      'play.voicing': 'il voicing scelto', 'play.root': 'solo la fondamentale',
      'play.walking': 'linea walking', 'play.mute': 'niente, solo il click',
      'play.options': 'Opzioni', 'play.click': 'Click', 'play.lock': 'Zona fissa',
      'play.hint': '<b>Zona fissa</b> impedisce alla zona di inseguire l\u2019accordo corrente: resti in posizione e vedi cosa hai davvero sotto le dita.',

      'lib.title': 'Forme armoniche',
      'lib.hint': 'Forme essenziali, brani tradizionali e versioni semplificate di brani celebri, con il tempo consigliato. Per le griglie complete degli standard usa l\u2019importazione dalle tue carte iReal.',
      'lib.load': 'Carica',

      'ir.title': 'Importa da iReal Pro',
      'ir.hint': 'Incolla un link <code>irealb://</code> o <code>irealbook://</code> preso dal tasto Condividi dell\u2019app. Viene letto qui nel browser: non esce niente dalla pagina.',
      'ir.go': 'Importa',
      'ir.empty': 'Incolla prima un link.',
      'ir.bad': '<b>Non sono riuscito a leggere il link.</b> Deve iniziare con irealb:// oppure irealbook://. In alternativa scrivi gli accordi a mano nella barra in alto.',
      'ir.loaded': (t, c, k, n) => `${t}${c ? ' \u2014 ' + c : ''} \u00b7 tonalit\u00e0 ${k} \u00b7 ${n} battute`,

      'tab.title': 'Tab ASCII',
      'tab.hint': 'Usa il voicing selezionato per ogni accordo. Clicca una card per cambiarlo, poi rigenera.',
      'tab.make': 'Genera', 'tab.copy': 'Copia', 'tab.copied': 'Copiato', 'tab.dl': 'Scarica .txt',
      'tab.perline': n => n + ' battute per riga',
      'tab.blocks': 'voicing a blocchi', 'tab.walk': 'linea walking',
      'tab.legend': 'le note fra parentesi sono di passaggio',
      'tab.press': 'Premi Genera.',
      'tab.head': (g, b, a, e, v) => `griglia: ${g}\nbasso: ${b}   zona: tasti ${a}-${e}   voicing: ${v}`,

      'chip.bad': 'sigla non riconosciuta',
      'close': 'Chiudi',
      'foot': 'Manico &copy; 2026 Massimo Danieli &middot; software libero sotto <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL v3</a>, senza alcuna garanzia &middot; <a href="https://github.com/MassimoDanieli/accordi_di_basso">sorgenti su GitHub</a>'
    },

    en: {
      'bar.grid': 'Chord chart',
      'bar.show': 'Show',
      'bar.play': 'Play',
      'bar.stop': 'Stop',
      'bar.tempo': 'Tempo',
      'bar.guide': 'Guide',
      'bar.forms': 'Forms',
      'bar.ireal': 'iReal',
      'bar.tab': 'Tab',
      'bar.settings': 'Settings',
      'bar.gridTitle': 'Space between bars, comma within a bar',

      'tip.syntax': 'Space between bars, comma within a bar:',
      'tip.guide': 'full guide',

      'zone.from': 'Zone, from fret',
      'zone.width': 'width',
      'zone.frets': n => n + (n === 1 ? ' fret' : ' frets'),
      'zone.desc': (a, b) => a === 0 ? `frets 0\u2013${b}, open strings included` : `frets ${a}\u2013${b}`,
      'zone.coverage': 'Coverage by position',
      'zone.coverageTitle': 'Share of chord tones reachable without shifting, taken on the worst chord in the chart',
      'zone.cell': (a, b, p) => `frets ${a}\u2013${b}, coverage ${p}%`,

      'key.root': 'root', 'key.third': 'third', 'key.fifth': 'fifth',
      'key.sev': 'sixth and seventh', 'key.ext': 'extensions',

      'v.title': 'Voicings',
      'v.count': (n, ch, a, b) => `\u2014 ${n} for ${ch}, frets ${a}\u2013${b}`,
      'v.type': 'Type',
      'v.span': 'hand span',
      'v.lead': 'Optimise voice leading',
      'v.total': n => `total motion: ${n} semitones`,
      'v.motion': n => `motion ${n}`,
      'v.spanOf': n => `span ${n}`,
      'v.none': 'No chord selected.',
      'v.empty': (tipo, a, b) => `No ${tipo} between fret ${a} and ${b}. Widen the zone, allow a larger hand span, or pick another voicing type.`,
      'v.open': 'Show voicings',
      'v.close': 'Hide voicings',
      'v.listen': 'listen',

      'inv.-1': 'specified bass note',
      'inv.0': 'root in the bass',
      'inv.1': '1st inversion', 'inv.2': '2nd inversion', 'inv.3': '3rd inversion',
      'inv.4': '4th inversion', 'inv.5': '5th inversion', 'inv.x': 'extension in the bass',

      'vt.arp.name': 'Arpeggio', 'vt.arp.hint': 'every chord tone, one after another',
      'vt.shell.name': 'Shell \u2014 R + 7 + 3', 'vt.shell.hint': 'root plus the two guide tones',
      'vt.guide.name': 'Guide tones \u2014 3 + 7', 'vt.guide.hint': 'third and seventh only, for comping',
      'vt.tenth.name': 'Tenths \u2014 R + 3', 'vt.tenth.hint': 'root and third a tenth apart',
      'vt.triad.name': 'Triad \u2014 R + 3 + 5', 'vt.triad.hint': 'close position triad',
      'vt.quartal.name': 'Quartal', 'vt.quartal.hint': 'stacked fourths, where the chord allows it',

      'tun.4': '4 strings \u00b7 E A D G', 'tun.5': '5 strings \u00b7 B E A D G',
      'tun.5c': '5 strings, high C \u00b7 E A D G C', 'tun.6': '6 strings \u00b7 B E A D G C',
      'set.title': 'Instrument and view',
      'set.bass': 'Bass', 'set.frets': 'Frets shown', 'set.fretsTo': n => 'up to ' + n,
      'set.notes': 'Notes on the neck', 'set.degrees': 'Degrees', 'set.names': 'Names',
      'set.flip': 'Flip strings', 'set.dim': 'Dim outside zone',
      'set.viewHint': '<b>Degrees</b> shows R, 3, 5, \u266d7 instead of note names. <b>Flip strings</b> puts the lowest string on top. <b>Dim outside zone</b> keeps notes outside the zone faintly visible.',
      'play.title': 'Playback',
      'play.meter': 'Metre', 'play.what': 'What plays',
      'play.voicing': 'the chosen voicing', 'play.root': 'the root only',
      'play.walking': 'walking line', 'play.mute': 'nothing, click only',
      'play.options': 'Options', 'play.click': 'Click', 'play.lock': 'Lock zone',
      'play.hint': '<b>Lock zone</b> stops the zone from following the current chord: you stay in position and see what is really under your fingers.',

      'lib.title': 'Harmonic forms',
      'lib.hint': 'Essential forms, traditional tunes and simplified versions of well-known songs, each with a suggested tempo. For complete standard charts, import your own iReal files.',
      'lib.load': 'Load',

      'ir.title': 'Import from iReal Pro',
      'ir.hint': 'Paste an <code>irealb://</code> or <code>irealbook://</code> link from the app\u2019s Share button. It is decoded here in the browser: nothing leaves the page.',
      'ir.go': 'Import',
      'ir.empty': 'Paste a link first.',
      'ir.bad': '<b>I could not read that link.</b> It must start with irealb:// or irealbook://. Otherwise type the chords by hand in the bar above.',
      'ir.loaded': (t, c, k, n) => `${t}${c ? ' \u2014 ' + c : ''} \u00b7 key ${k} \u00b7 ${n} bars`,

      'tab.title': 'ASCII tab',
      'tab.hint': 'Uses the voicing selected for each chord. Click a card to change it, then generate again.',
      'tab.make': 'Generate', 'tab.copy': 'Copy', 'tab.copied': 'Copied', 'tab.dl': 'Download .txt',
      'tab.perline': n => n + ' bars per line',
      'tab.blocks': 'block voicings', 'tab.walk': 'walking line',
      'tab.legend': 'notes in brackets are passing notes',
      'tab.press': 'Press Generate.',
      'tab.head': (g, b, a, e, v) => `chart: ${g}\nbass: ${b}   zone: frets ${a}-${e}   voicing: ${v}`,

      'chip.bad': 'symbol not recognised',
      'close': 'Close',
      'foot': 'Manico &copy; 2026 Massimo Danieli &middot; free software under <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL v3</a>, with no warranty &middot; <a href="https://github.com/MassimoDanieli/accordi_di_basso">source on GitHub</a>'
    }
  };

  let current = 'it';

  function readLang() {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'it' || v === 'en') return v;
    } catch (e) { /* archiviazione non disponibile */ }
    return (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';
  }

  function lang() { return current; }

  function t(key, ...args) {
    const v = (D[current] && D[current][key]) !== undefined ? D[current][key] : D.it[key];
    if (v === undefined) return key;
    return typeof v === 'function' ? v(...args) : v;
  }

  /** Riempie gli elementi marcati nell'HTML. */
  function applyStatic(root = document) {
    root.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    root.querySelectorAll('[data-th]').forEach(el => { el.innerHTML = t(el.dataset.th); });
    root.querySelectorAll('[data-tt]').forEach(el => { el.title = t(el.dataset.tt); });
    root.querySelectorAll('[data-tp]').forEach(el => { el.placeholder = t(el.dataset.tp); });
    document.documentElement.setAttribute('lang', current);
  }

  function setLang(l, onChange) {
    current = (l === 'en') ? 'en' : 'it';
    try { localStorage.setItem(KEY, current); } catch (e) { /* niente da fare */ }
    document.querySelectorAll('[data-lang]').forEach(b =>
      b.classList.toggle('on', b.dataset.lang === current));
    applyStatic();
    if (onChange) onChange();
  }

  function initLang(onChange) {
    setLang(readLang(), null);
    document.addEventListener('click', e => {
      const b = e.target && e.target.closest && e.target.closest('[data-lang]');
      if (b) setLang(b.dataset.lang, onChange);
    });
  }

  return { readLang, lang, t, applyStatic, setLang, initLang };
})();

__mod.app = (function () {
  const V = __mod.voicings;
  const A = __mod.audio;
  const R = __mod.render;
  const Tab = __mod.tab;
  const IReal = __mod.ireal;
  const { TUNINGS, parseChord, degreeName, noteName } = __mod.theory;
  const { LIBRARY } = __mod.library;
  const { initTheme, refreshThemeLabel } = __mod.theme;
  const { t, initLang, applyStatic, lang } = __mod.i18n;
  // Stato dell'applicazione e collegamento fra i moduli.





  const $ = id => document.getElementById(id);

  const state = {
    grid: [],            // [{ ok, chord, raw, bar, dur, first }]
    index: 0,
    tuning: '4',
    zoneFrom: 0,
    zoneWidth: 5,
    frets: 12,
    labels: 'degrees',
    flipped: false,
    dimOutside: true,
    vtype: 'arp',
    maxSpan: 4,
    pick: {},            // indice del voicing scelto per ogni accordo
    playing: false,
    bpm: 92,
    beats: 4,
    playMode: 'voicing',
    metronome: true,
    lockZone: false,
    timer: null,
    songs: []
  };

  const open = () => TUNINGS[state.tuning].open;
  const zoneTo = () => Math.min(state.zoneFrom + state.zoneWidth - 1, state.frets);

  let cache = new Map();
  function candidates(i) {
    const item = state.grid[i];
    if (!item || !item.ok) return [];
    const key = i + '|' + state.tuning + '|' + state.zoneFrom + '|' + state.zoneWidth + '|' + state.vtype + '|' + state.maxSpan;
    if (!cache.has(key)) {
      cache.set(key, V.generate(item.chord, open(), state.zoneFrom, zoneTo(), state.vtype, state.maxSpan));
    }
    return cache.get(key);
  }
  function chosen(i) {
    const list = candidates(i);
    if (!list.length) return null;
    const k = state.pick[i];
    return list[k] !== undefined ? list[k] : list[0];
  }

  // ---------------------------------------------------------------- griglia

  function parseGrid() {
    const text = $('seq').value;
    const tokens = text.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
    const bars = [];
    tokens.forEach(t => {
      // Un trattino seguito da una lettera di nota separa le battute: G-A-D.
      t.split(/[-\u2212\u2013](?=[A-G])/).forEach(part => {
        const chords = part.split(',').filter(Boolean);
        if (chords.length) bars.push(chords);
      });
    });

    state.grid = [];
    state.pick = {};
    cache = new Map();
    bars.forEach((chords, bar) => chords.forEach((raw, k) => {
      const common = { bar, dur: 1 / chords.length, first: k === 0 };
      if (/^(n\.?c\.?)$/i.test(raw)) { state.grid.push({ ok: false, rest: true, raw: 'N.C.', ...common }); return; }
      const chord = parseChord(raw);
      state.grid.push(chord ? { ok: true, chord, ...common } : { ok: false, raw, ...common });
    }));
    const first = state.grid.findIndex(x => x.ok);
    state.index = first < 0 ? 0 : first;
  }

  // ---------------------------------------------------------------- zone

  function coverage(chord, from) {
    const seen = new Set();
    open().forEach(o => {
      for (let f = from; f < from + state.zoneWidth; f++) {
        const iv = chord.pcMap[(o + f) % 12];
        if (iv !== undefined && iv >= 0) seen.add(iv);
      }
    });
    return seen.size / chord.intervals.length;
  }
  function bestZone(items, near) {
    const ok = items.filter(x => x.ok);
    if (!ok.length) return null;
    const rif = near === undefined ? state.zoneFrom : near;
    let best = null, score = -1;
    for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
      const s = Math.min(...ok.map(x => coverage(x.chord, from)));
      // A parita' di copertura vince la zona piu' vicina a quella corrente:
      // cosi' l'inseguimento non riporta ogni volta al tasto 0.
      if (s > score + 1e-9 || (Math.abs(s - score) <= 1e-9 && best !== null
          && Math.abs(from - rif) < Math.abs(best - rif))) { score = s; best = from; }
    }
    return best;
  }
  function setZone(from, quiet) {
    state.zoneFrom = from;
    $('zs').value = from;
    $('zsv').textContent = from;
    cache = new Map();
    describeZone();
    quiet ? renderStrip() : render();
  }

  // ---------------------------------------------------------------- disegno

  function renderChips() {
    let html = '', bar = -1;
    state.grid.forEach((x, i) => {
      if (x.bar !== bar && i > 0) html += '<span class="bl">|</span>';
      bar = x.bar;
      if (x.ok) {
        const v = chosen(i);
        const sum = v ? v.shape.map(n => noteName(n.pc, x.chord.flats)).join('\u00b7') : '';
        html += `<button class="chip${i === state.index ? ' on' : ''}" data-pick="${i}">`
          + `<span class="cs">${x.chord.symbol}</span>${sum ? `<span class="cn">${sum}</span>` : ''}</button>`;
      }
      else if (x.rest) html += `<span class="chip rest">N.C.</span>`;
      else html += `<span class="chip bad" title="${t('chip.bad')}">${x.raw}</span>`;
    });
    $('chips').innerHTML = html;
    const attivo = $('chips').querySelector('.chip.on');
    if (attivo && attivo.scrollIntoView) attivo.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function describeZone() {
    const el = $('zdesc');
    if (!el) return;
    el.textContent = t('zone.desc', state.zoneFrom, zoneTo());
  }

  function renderStrip() {
    const ok = state.grid.filter(x => x.ok);
    let html = '';
    for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
      const s = ok.length ? Math.min(...ok.map(x => coverage(x.chord, from))) : 1;
      html += `<button class="cell${from === state.zoneFrom ? ' sel' : ''}" data-zone="${from}"`
        + ` style="background:rgba(233,176,74,${(0.12 + s * 0.78).toFixed(2)})"`
        + ` title="${t('zone.cell', from, from + state.zoneWidth - 1, Math.round(s * 100))}">${from}</button>`;
    }
    $('strip').innerHTML = html;
  }

  /**
   * L'altezza del manico non puo' dipendere dal CSS: con una riga flessibile e
   * max-height in percentuale il calcolo e' circolare e i browser lo risolvono in
   * modi diversi, fino ad azzerare l'altezza. La misura si fa qui.
   */
  function fitBoard() {
    const box = $('board');
    const svg = box && box.querySelector('svg');
    if (!svg) return;
    const vb = (svg.getAttribute('viewBox') || '0 0 800 250').split(/\s+/).map(Number);
    const ratio = vb[2] / vb[3];
    const w = Math.max(0, box.clientWidth - 24);
    const h = Math.max(0, box.clientHeight - 16);
    const larghezza = h > 40 ? Math.min(w, h * ratio) : w;
    svg.style.width = Math.max(larghezza, 480) + 'px';
    svg.style.height = 'auto';
  }

  function walkGhosts() {
    if (state.playMode !== 'walking') return [];
    const nb = Math.max(1, Math.round(state.beats * ((state.grid[state.index] || {}).dur || 1)));
    return walkingLine(state.index, nb).filter(n => n && n.pass);
  }

  function renderBoard() {
    const item = state.grid[state.index];
    const v = chosen(state.index);
    $('board').innerHTML = R.fretboard({
      chord: item && item.ok ? item.chord : null,
      open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), frets: state.frets,
      labels: state.labels, flipped: state.flipped, dimOutside: state.dimOutside,
      highlight: v ? v.shape : [],
      ghosts: walkGhosts()
    });
    fitBoard();
  }

  function invLabel(chord, bassIv) {
    const k = V.inversion(chord, bassIv);
    return k === null ? t('inv.x') : t('inv.' + k);
  }

  function renderVoicings() {
    const item = state.grid[state.index];
    const type = V.typeById(state.vtype);
    $('vhint').textContent = t('vt.' + type.id + '.hint');

    if (!item || !item.ok) {
      $('vcount').textContent = '';
      $('voices').innerHTML = `<p class="empty">${t('v.none')}</p>`;
      return;
    }

    const list = candidates(state.index);
    $('vcount').textContent = list.length
      ? t('v.count', list.length, item.chord.symbol, state.zoneFrom, zoneTo())
      : item.chord.symbol;
    if (!list.length) {
      $('voices').innerHTML = `<p class="empty">${t('v.empty', t('vt.' + type.id + '.name'), state.zoneFrom, zoneTo())}</p>`;
      return;
    }

    const cur = chosen(state.index);
    const prev = previousVoicing(state.index);

    $('voices').innerHTML = list.map((v, k) => {
      const mv = V.motion(prev, v);
      return `<div class="voice${cur === v ? ' sel' : ''}" data-voicing="${k}">
        <div class="head"><h4>${invLabel(item.chord, v.bassIv)}</h4><span class="mv">${mv === null ? '' : t('v.motion', mv)}</span></div>
        <div class="meta">${V.describe(v, item.chord)} \u00b7 ${t('v.spanOf', v.span)}</div>
        ${R.diagram(item.chord, v, { open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), flipped: state.flipped })}
        <div class="foot">
          <span class="deg">${V.degrees(v, item.chord)}</span>
          <button class="play-s" data-hear="${k}" aria-label="${t('v.listen')}">&#9654;</button>
        </div></div>`;
    }).join('');
    const sel = $('voices').querySelector('.voice.sel');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
  }

  function previousVoicing(i) {
    for (let k = i - 1; k >= 0; k--) if (state.grid[k].ok) return chosen(k);
    return null;
  }

  function render() {
    describeZone(); renderChips(); renderStrip(); renderBoard(); renderVoicings();
  }

  // ---------------------------------------------------------------- suono

  let flashes = [];

  function clearFlashes() {
    flashes.forEach(clearTimeout);
    flashes = [];
    document.querySelectorAll('.note.hit').forEach(el => el.classList.remove('hit'));
  }

  /** Accende la nota sul manico e sul diagramma del voicing scelto. */
  function flash(note) {
    const sel = `[data-pos="${note.si}:${note.f}"]`;
    document.querySelectorAll('#board ' + sel + ', .voice.sel ' + sel).forEach(el => {
      el.classList.remove('hit');
      void el.getBoundingClientRect();   // forza il riavvio dell'animazione
      el.classList.add('hit');
    });
  }

  /** Programma l'accensione delle note in sincrono con quello che si sente. */
  function lightUp(v, step) {
    clearFlashes();
    if (!v) return;
    if (v.block) { v.shape.forEach(n => flash(n)); return; }
    v.shape.forEach((n, i) => {
      if (i === 0) { flash(n); return; }
      flashes.push(setTimeout(() => flash(n), i * step * 1000));
    });
  }

  function hear(v, seconds) {
    if (!v) return;
    const midis = v.shape.map(n => n.midi);
    if (v.block) {
      A.strum(midis, Math.min(seconds || 1.6, 2.2));
      lightUp(v, 0);
    } else {
      const step = Math.min((seconds || 1.6) / midis.length, 0.42);
      A.arpeggio(midis, step);
      lightUp(v, step);
    }
  }

  function select(i) {
    state.index = i;
    renderChips(); renderBoard(); renderVoicings();
    if (!state.playing) hear(chosen(i), 1.2);
  }

  /** Trova una posizione in zona per un midi qualsiasi, anche fuori dall'accordo. */
  function findPos(midi) {
    const o = open();
    for (let si = o.length - 1; si >= 0; si--) {
      const f = midi - o[si];
      if (f >= state.zoneFrom && f <= zoneTo()) return { si, f, midi, pc: ((midi % 12) + 12) % 12, iv: -2 };
    }
    return null;
  }

  /**
   * Linea walking essenziale dentro la zona: fondamentale, due note dell'accordo in
   * salita, nota cromatica di avvicinamento alla fondamentale dell'accordo successivo.
   */
  function walkingLine(i, beats) {
    const item = state.grid[i];
    if (!item || !item.ok) return [];
    const notes = V.zoneNotes(item.chord, open(), state.zoneFrom, zoneTo());
    if (!notes.length) return [];
    const v = chosen(i);
    const root = (v && v.shape[0]) || notes.find(n => n.iv === 0) || notes[0];

    // Dove sta andando la linea: la fondamentale del prossimo accordo utile.
    let target;
    for (let k = 1; k <= state.grid.length; k++) {
      const j = (i + k) % state.grid.length;
      if (!state.grid[j].ok) continue;
      const vNext = chosen(j);
      target = (vNext && vNext.shape[0].midi)
        || (V.zoneNotes(state.grid[j].chord, open(), state.zoneFrom, zoneTo())[0] || {}).midi;
      break;
    }

    // Le note dell'accordo si percorrono nella direzione del bersaglio,
    // e l'avvicinamento cromatico arriva dal lato del moto: da sotto se si
    // sale, da sopra se si scende. E' la grammatica classica del walking.
    const giu = target !== undefined && target < root.midi;
    const tones = notes
      .filter(n => (giu ? n.midi < root.midi : n.midi > root.midi) && n.pc !== root.pc)
      .sort((a, b) => (giu ? b.midi - a.midi : a.midi - b.midi));
    const passi = tones.length ? tones : [root];
    let appr = null;
    if (target !== undefined) {
      appr = (giu ? findPos(target + 1) : findPos(target - 1))
          || (giu ? findPos(target - 1) : findPos(target + 1));
      if (appr) appr = { ...appr, pass: true };
    }

    const linea = [root];
    for (let b = 1; b < beats - 1; b++) linea.push(passi[(b - 1) % passi.length]);
    if (beats > 1) linea.push(appr || passi[passi.length - 1] || root);
    return linea;
  }

  /** Rumore deterministico: stesso giro e stessa battuta, stesso fraseggio. */
  function seme(a, b) {
    let x = (a * 374761393 + b * 668265263 + 1442695040888963) >>> 0;
    return () => {
      x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0;
      return x / 4294967296;
    };
  }

  /**
   * Il fraseggio del walking: semiminime come impianto, ornamenti idiomatici sopra.
   * Ogni evento ha posizione e durata in movimenti; lo swing sta nei 2/3 del tempo.
   */
  function walkingEvents(i, giro) {
    const item = state.grid[i];
    if (!item || !item.ok) return [];
    const dur = item.dur || 1;
    const rnd = seme(i * 31 + 7, giro * 101 + 13);
    const ev = [];

    // 6/8: due pulsazioni puntate (1 e 4), non sei note uguali.
    if (state.beats === 6) {
      const linea = walkingLine(i, 2);
      if (!linea.length) return [];
      ev.push({ n: linea[0], at: 0, len: 2.6, vol: 0.36 });
      if (linea[1] && dur >= 1) ev.push({ n: linea[1], at: 3, len: 2.4, vol: 0.3 });
      return ev;
    }

    const nb = Math.max(1, Math.round(state.beats * dur));
    const linea = walkingLine(i, nb);
    if (!linea.length) return [];

    linea.forEach((n, b) => {
      if (n) ev.push({ n, at: b, len: 0.92, vol: b === 0 ? 0.36 : 0.3 });
    });

    // Con meno di tre movimenti non c'e' spazio per ornamenti.
    if (nb < 3) return ev;

    // Salto d'ottava sul terzo movimento, quando la zona lo consente.
    if (rnd() < 0.25) {
      const su = findPos(linea[0].midi + 12);
      if (su && ev[2]) { ev[2] = { ...ev[2], n: su }; }
    }

    // Ultimo movimento in due ottavi swingati: nota dell'accordo, poi il passaggio.
    if (rnd() < 0.5 && ev.length >= 2) {
      const ultimo = ev[ev.length - 1];
      const prima = ev[ev.length - 2];
      ultimo.len = 0.6;
      ev.push({ n: ultimo.n, at: ultimo.at + 2 / 3, len: 0.3, vol: 0.28 });
      ultimo.n = prima.n;
    }

    // Ghost percussiva sul levare del secondo movimento.
    if (rnd() < 0.35 && ev[1]) {
      ev.push({ n: ev[1].n, at: 1 + 2 / 3, len: 0.07, vol: 0.12, ghost: true });
    }

    return ev.sort((a, b) => a.at - b.at);
  }

  // ---------------------------------------------------------------- trasporto

  function tick() {
    if (!state.playing) return;
    if (state.index === 0) state.giro = (state.giro || 0) + 1;
    const item = state.grid[state.index];
    if (!item) { stop(); return; }
    const seconds = (60 / state.bpm) * state.beats * (item.dur || 1);

    if (!state.lockZone && item.ok) {
      const b = bestZone([item]);
      if (b !== null && b !== state.zoneFrom) setZone(b, true);
    }
    renderChips(); renderBoard(); renderVoicings();

    if (state.metronome) {
      const beats = Math.max(1, Math.round(state.beats * (item.dur || 1)));
      for (let b = 0; b < beats; b++) A.click(b * (60 / state.bpm), item.first && b === 0);
    }
    if (item.ok && state.playMode !== 'mute') {
      if (state.playMode === 'walking') {
        const beatSec = 60 / state.bpm;
        clearFlashes();
        walkingEvents(state.index, state.giro || 0).forEach(ev => {
          A.pluck(ev.n.midi, ev.at * beatSec, ev.len * beatSec, ev.vol);
          flashes.push(setTimeout(() => flash(ev.n), ev.at * beatSec * 1000));
        });
      } else {
        const v = chosen(state.index);
        if (v) {
          if (state.playMode === 'root') {
            A.pluck(v.shape[0].midi, 0, Math.min(seconds * 0.9, 1.6), 0.3);
            clearFlashes(); flash(v.shape[0]);
          } else hear(v, seconds * 0.92);
        }
      }
    }
    state.timer = setTimeout(() => {
      state.index = (state.index + 1) % state.grid.length;
      tick();
    }, seconds * 1000);
  }
  function stop() {
    state.playing = false;
    clearTimeout(state.timer);
    clearFlashes();
    $('pp').innerHTML = '&#9654;';
  }
  function toggleTransport() {
    state.playing = !state.playing;
    $('pp').innerHTML = state.playing ? '&#9632;' : '&#9654;';
    if (state.playing) { A.audio(); tick(); } else { clearTimeout(state.timer); clearFlashes(); }
  }

  // ---------------------------------------------------------------- voice leading

  function optimiseVoiceLeading() {
    const lists = state.grid.map((x, i) => (x.ok ? candidates(i) : []));
    const picks = V.optimise(lists);
    picks.forEach((p, i) => { if (p >= 0) state.pick[i] = p; });
    render();
    const total = totalMotion();
    $('vlinfo').textContent = total === null ? '' : t('v.total', total);
  }
  function totalMotion() {
    let sum = 0, prev = null, seen = false;
    state.grid.forEach((x, i) => {
      if (!x.ok) return;
      const v = chosen(i);
      if (!v) return;
      if (prev) { sum += V.motion(prev, v); seen = true; }
      prev = v;
    });
    return seen ? sum : null;
  }

  // ---------------------------------------------------------------- tab

  function buildTab() {
    const walking = $('tabmode') && $('tabmode').value === 'walk';
    const bars = [];
    let current = null, barIndex = -1;
    state.grid.forEach((item, i) => {
      if (item.bar !== barIndex) { current = { label: [], columns: [], block: false }; bars.push(current); barIndex = item.bar; }
      if (!item.ok) { current.label.push(item.raw); return; }
      current.label.push(item.chord.symbol);
      if (walking) {
        const nb = Math.max(1, Math.round(state.beats * (item.dur || 1)));
        walkingLine(i, nb).forEach(n => {
          if (n) current.columns.push({ si: n.si, f: n.f, pass: !!n.pass });
        });
        return;
      }
      const v = chosen(i);
      if (!v) return;
      current.block = current.block || v.block;
      v.shape.forEach((n, k) => current.columns.push({ si: n.si, f: n.f, newGroup: v.block && k === 0 }));
    });

    const modo = walking ? t('tab.walk') : t('vt.' + state.vtype + '.name');
    let header = t('tab.head', $('seq').value, t('tun.' + state.tuning),
      state.zoneFrom, zoneTo(), modo);
    if (walking) header += '\n' + t('tab.legend');
    $('tab').textContent = Tab.render(bars, open(), state.flipped, +$('perline').value, header);
    $('tab').dataset.vuoto = 'no';
  }

  // ---------------------------------------------------------------- eventi

  function loadGrid(text, autozone) {
    $('seq').value = text;
    parseGrid();
    if (autozone) {
      setLock(false);
      const b = bestZone(state.grid, 0);
      if (b !== null) setZone(b, true);
    }
    render();
  }

  function buildMenus() {
    const keep = { lib: $('lib').value, vtype: $('vtype').value, tun: $('tun').value,
                   nfrets: $('nfrets').value, mode: $('mode').value, perline: $('perline').value,
                   tabmode: $('tabmode').value };
    $('lib').innerHTML = LIBRARY.map((x, i) =>
      `<option value="${i}">${x[lang() === 'en' ? 1 : 0]} \u00b7 ${x[2]} \u00b7 ${x[3]} bpm</option>`).join('');
    $('vtype').innerHTML = V.VOICING_TYPES.map(x => `<option value="${x.id}">${t('vt.' + x.id + '.name')}</option>`).join('');
    $('tun').innerHTML = ['4', '5', '5c', '6'].map(k => `<option value="${k}">${t('tun.' + k)}</option>`).join('');
    $('nfrets').innerHTML = [12, 15, 18, 24].map(n => `<option value="${n}">${t('set.fretsTo', n)}</option>`).join('');
    $('mode').innerHTML = ['voicing', 'root', 'walking', 'mute'].map(m => `<option value="${m}">${t('play.' + m)}</option>`).join('');
    $('perline').innerHTML = [4, 2, 6].map(n => `<option value="${n}">${t('tab.perline', n)}</option>`).join('');
    $('tabmode').innerHTML = `<option value="blocks">${t('tab.blocks')}</option><option value="walk">${t('tab.walk')}</option>`;
    $('lib').value = keep.lib || '0';
    $('vtype').value = keep.vtype || state.vtype;
    $('tun').value = keep.tun || state.tuning;
    $('nfrets').value = keep.nfrets || String(state.frets);
    $('mode').value = keep.mode || state.playMode;
    $('perline').value = keep.perline || '4';
    $('tabmode').value = keep.tabmode || 'blocks';
    $('tlab').textContent = state.labels === 'degrees' ? t('set.degrees') : t('set.names');
    $('pp').innerHTML = state.playing ? '&#9632;' : '&#9654;';
    $('zwv').textContent = t('zone.frets', state.zoneWidth);
    if ($('tab').textContent.trim() === '' || $('tab').dataset.vuoto === 'si') {
      $('tab').textContent = t('tab.press'); $('tab').dataset.vuoto = 'si';
    }
  }

  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  /** Zona fissa: stato e pulsante sempre allineati. */
  function setLock(v) {
    state.lockZone = v;
    const b = $('lock');
    if (b) b.classList.toggle('on', v);
  }

  function init() {
    initTheme();
    initLang(() => { buildMenus(); refreshThemeLabel(); render(); });
    parseGrid();
    render();

    buildMenus();

    $('go').onclick = () => { parseGrid(); render(); };
    $('seq').addEventListener('keydown', e => { if (e.key === 'Enter') { parseGrid(); render(); } });

    // La griglia si aggiorna da sola poco dopo l'ultima battitura: il pulsante resta
    // per chi preferisce confermare a mano.
    let attesa = null;
    $('seq').addEventListener('input', () => {
      setSongTitle(null);
      clearTimeout(attesa);
      attesa = setTimeout(() => { parseGrid(); render(); }, 550);
    });

    $('libgo').onclick = () => {
      const voce = LIBRARY[+$('lib').value];
      state.bpm = voce[3];
      $('bpm').value = voce[3];
      $('bpmv').textContent = voce[3];
      setSongTitle(voce[lang() === 'en' ? 1 : 0], '');
      loadGrid(voce[4], true);
      closeDialog($('dlgforme'));
    };

    $('vtype').onchange = e => {
      state.vtype = e.target.value;
      state.pick = {}; cache = new Map();
      $('spanwrap').style.display = V.typeById(state.vtype).block ? '' : 'none';
      $('vlinfo').textContent = '';
      render();
    };
    $('span').oninput = e => {
      state.maxSpan = +e.target.value;
      $('spanv').textContent = state.maxSpan;
      state.pick = {}; cache = new Map(); render();
    };
    $('vl').onclick = optimiseVoiceLeading;

    $('tun').onchange = e => { state.tuning = e.target.value; state.pick = {}; cache = new Map(); render(); };
    if ($('nfrets')) {
    $('nfrets').value = String(state.frets);
    $('nfrets').onchange = e => {
      state.frets = +e.target.value;
      $('zs').max = state.frets - state.zoneWidth + 1;
      if (state.zoneFrom > state.frets - state.zoneWidth + 1) { setZone(state.frets - state.zoneWidth + 1); return; }
      state.pick = {}; cache = new Map(); render();
    };
    }
    $('zs').oninput = e => { setLock(true); setZone(+e.target.value); };
    $('zw').oninput = e => {
      setLock(true);
      state.zoneWidth = +e.target.value;
      $('zwv').textContent = t('zone.frets', state.zoneWidth);
      $('zs').max = state.frets - state.zoneWidth + 1;
      state.pick = {}; cache = new Map();
      if (state.zoneFrom > state.frets - state.zoneWidth + 1) setZone(state.frets - state.zoneWidth + 1);
      else render();
    };
    $('tlab').onclick = e => {
      state.labels = state.labels === 'degrees' ? 'notes' : 'degrees';
      e.target.textContent = state.labels === 'degrees' ? t('set.degrees') : t('set.names');
      e.target.classList.toggle('on', state.labels === 'degrees');
      render();
    };
    $('tflip').onclick = e => { state.flipped = !state.flipped; e.target.classList.toggle('on', state.flipped); render(); };
    $('tdim').onclick = e => { state.dimOutside = !state.dimOutside; e.target.classList.toggle('on', state.dimOutside); render(); };

    $('pp').onclick = toggleTransport;
    $('bpm').oninput = e => { state.bpm = +e.target.value; $('bpmv').textContent = state.bpm; };
    $('beats').onchange = e => { state.beats = +e.target.value; };
    $('mode').onchange = e => { state.playMode = e.target.value; renderBoard(); };
    $('clk').onclick = e => { state.metronome = !state.metronome; e.target.classList.toggle('on', state.metronome); };
    $('lock').onclick = () => setLock(!state.lockZone);

    $('mktab').onclick = buildTab;
    $('tab').dataset.vuoto = 'si';
    $('perline').onchange = buildTab;
    $('cptab').onclick = () => {
      navigator.clipboard && navigator.clipboard.writeText($('tab').textContent).then(() => {
        $('cptab').textContent = t('tab.copied');
        setTimeout(() => { $('cptab').textContent = t('tab.copy'); }, 1200);
      });
    };
    $('dltab').onclick = () => {
      const blob = new Blob([$('tab').textContent], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'manico-tab.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    };

    $('irgo').onclick = () => {
      const info = $('irinfo'), list = $('irlist');
      const raw = $('ireal').value.trim();
      if (!raw) { info.innerHTML = `<span class="err">${t('ir.empty')}</span>`; return; }
      let songs = [];
      try { songs = IReal.parse(raw); } catch (e) { songs = []; }
      if (!songs.length) {
        list.style.display = 'none';
        info.innerHTML = `<span class="err">${t('ir.bad')}</span>`;
        return;
      }
      state.songs = songs;
      list.style.display = songs.length > 1 ? '' : 'none';
      list.innerHTML = songs.map((s, i) => `<option value="${i}">${s.title}${s.composer ? ' \u2014 ' + s.composer : ''}</option>`).join('');
      loadSong(0);
    };
    $('irlist').onchange = e => loadSong(+e.target.value);

    // Delega degli eventi sui contenuti ridisegnati.
    $('chips').addEventListener('click', e => {
      const b = e.target.closest('[data-pick]');
      if (b) select(+b.dataset.pick);
    });
    $('strip').addEventListener('click', e => {
      const b = e.target.closest('[data-zone]');
      if (b) { setLock(true); setZone(+b.dataset.zone); }
    });
    $('voices').addEventListener('click', e => {
      const hearBtn = e.target.closest('[data-hear]');
      if (hearBtn) { e.stopPropagation(); hear(candidates(state.index)[+hearBtn.dataset.hear], 1.6); return; }
      const card = e.target.closest('[data-voicing]');
      if (card) {
        state.pick[state.index] = +card.dataset.voicing;
        renderChips(); renderBoard(); renderVoicings();
        hear(chosen(state.index), 1.4);
      }
    });
    $('board').addEventListener('click', e => {
      const g = e.target.closest('[data-midi]');
      if (g) A.pluck(+g.dataset.midi);
    });

    window.addEventListener('resize', fitBoard);
    document.addEventListener('keydown', e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (document.querySelector('dialog[open]')) return;
      if (e.code === 'Space') { e.preventDefault(); toggleTransport(); }
      if (e.key === 'ArrowRight' && state.index < state.grid.length - 1) select(state.index + 1);
      if (e.key === 'ArrowLeft' && state.index > 0) select(state.index - 1);
    });

    $('spanwrap').style.display = 'none';

    // Pannello dei voicing a scomparsa: chi suona decide se vederlo.
    try {
      if (localStorage.getItem('manico-pannello') === 'no') document.body.dataset.pannello = 'no';
    } catch (e) { /* archiviazione non disponibile */ }
    $('vtoggle').onclick = () => {
      const chiuso = document.body.dataset.pannello === 'no';
      if (chiuso) delete document.body.dataset.pannello;
      else document.body.dataset.pannello = 'no';
      try { localStorage.setItem('manico-pannello', chiuso ? 'si' : 'no'); } catch (e) { /* niente */ }
      fitBoard();
    };

    document.querySelectorAll('[data-apre]').forEach(b => {
      b.onclick = () => {
        const d = $(b.dataset.apre);
        if (b.dataset.apre === 'dlgtab') buildTab();
        if (d.showModal) d.showModal(); else d.setAttribute('open', '');
      };
    });
    document.querySelectorAll('dialog').forEach(d => {
      d.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => closeDialog(d); });
      d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
    });
  }

  function setSongTitle(title, composer) {
    state.song = title ? { title, composer } : null;
    const el = $('songline');
    if (!el) return;
    if (!state.song) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = `<b>${title}</b>${composer ? ` <span class="by">\u2014 ${composer}</span>` : ''}`;
  }

  function loadSong(k) {
    const song = state.songs[k];
    if (!song) return;
    loadGrid(IReal.toGrid(song), true);
    setSongTitle(song.title, song.composer);
    $('irinfo').textContent = t('ir.loaded', song.title, song.composer, song.key, song.bars.length);
    // Brano caricato: la finestra ha fatto il suo lavoro.
    closeDialog($('dlgireal'));
  }

  window.MANICO = { versione: document.documentElement.dataset.versione || '?', fraseggio: walkingEvents };

  try {
    init();
  } catch (err) {
    // Un elemento mancante non deve spegnere tutta la pagina.
    console.error('Manico: inizializzazione interrotta', err);
  }

  return {  };
})();

})();