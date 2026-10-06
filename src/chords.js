(function initManicoChords(root) {
  'use strict';

  // Reads the harmony of a recording: which chord is sounding on every beat, from what is left
  // of the recording once the bass is taken out, with the bass line itself saying which note
  // is at the bottom. It is the chord reader of C_bass (internal/chords), kept the same.

  const Rhythm = root.ManicoRhythm;
  const RATE = 11025; // enough for the notes that make a chord
  const SIZE = 4096; // 0.37 s: long enough to tell semitones apart down to the low register
  const HOP = 1024;
  const LOWEST = 80; // Hz: under this is the bass and the bass drum
  const TOP = 2000;

  // The kinds of chord told apart, in the order they are offered when one is changed by hand.
  const QUALITIES = ['', 'm', '7', 'm7', 'maj7'];
  const SHAPES = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11] };
  // Chords are named the way they are met on a chart: Bb, Eb and Ab rather than A#, D# and G#.
  const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const nameOf = chord => NAMES[((chord.root % 12) + 12) % 12] + chord.quality;

  /** For every stretch of a tenth of a second, how much of each of the twelve pitch classes is sounding. */
  function chroma(buffer) {
    const step = buffer.sampleRate / RATE;
    const length = Math.floor(buffer.length / step);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
    const mono = new Float64Array(length);
    for (let i = 0; i < length; i += 1) {
      const from = Math.floor(i * step);
      const to = Math.floor((i + 1) * step);
      let sum = 0;
      for (let j = from; j < to && j < buffer.length; j += 1) for (const channel of channels) sum += channel[j];
      mono[i] = sum / (Math.max(1, to - from) * channels.length);
    }
    const window = new Float64Array(SIZE);
    for (let i = 0; i < SIZE; i += 1) window[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / SIZE);
    // which pitch class each bin of the spectrum belongs to, and how squarely it sits on it
    const classOf = new Int8Array(SIZE / 2).fill(-1);
    const weightOf = new Float64Array(SIZE / 2);
    for (let bin = 0; bin < SIZE / 2; bin += 1) {
      const hz = bin * RATE / SIZE;
      if (hz < LOWEST || hz > TOP) continue;
      const pitch = 69 + 12 * Math.log2(hz / 440);
      const off = pitch - Math.round(pitch);
      classOf[bin] = ((Math.round(pitch) % 12) + 12) % 12;
      weightOf[bin] = Math.exp(-off * off / (2 * 0.2 * 0.2));
    }
    const count = Math.max(0, Math.floor((length - SIZE) / HOP) + 1);
    const frames = [];
    const real = new Float64Array(SIZE);
    const imag = new Float64Array(SIZE);
    for (let f = 0; f < count; f += 1) {
      for (let i = 0; i < SIZE; i += 1) { real[i] = mono[f * HOP + i] * window[i]; imag[i] = 0; }
      Rhythm.fft(real, imag);
      const frame = new Float64Array(12);
      for (let bin = 0; bin < SIZE / 2; bin += 1) {
        // the loud and the soft count less unequally than they measure: a chord is its notes, not its loudest note
        if (weightOf[bin] > 0) frame[classOf[bin]] += weightOf[bin] * Math.log1p(200 * Math.hypot(real[bin], imag[bin]) / SIZE);
      }
      frames.push(frame);
    }
    return frames;
  }

  /**
   * What sounds on each beat: the chroma of its frames with what every pitch class has alike
   * taken away (that is drums and noise), brought to one length; and how loud it was.
   */
  function onBeats(frames, beats) {
    const count = beats.length - 1;
    const heard = [];
    const loud = new Float64Array(count);
    for (let b = 0; b < count; b += 1) {
      const row = new Float64Array(12);
      // the frames whose middle falls in the beat: a frame is longer than its step, and taken
      // by its start it would hear the next chord coming
      const from = Math.ceil((beats[b] * RATE - SIZE / 2) / HOP);
      const to = Math.ceil((beats[b + 1] * RATE - SIZE / 2) / HOP);
      for (let f = Math.max(0, from); f < to && f < frames.length; f += 1) for (let c = 0; c < 12; c += 1) row[c] += frames[f][c];
      let least = Infinity;
      let sum = 0;
      for (let c = 0; c < 12; c += 1) least = Math.min(least, row[c]);
      for (let c = 0; c < 12; c += 1) { row[c] -= least; sum += row[c] * row[c]; }
      loud[b] = Math.sqrt(sum);
      if (sum > 0) for (let c = 0; c < 12; c += 1) row[c] /= Math.sqrt(sum);
      heard.push(row);
    }
    return { heard, loud };
  }

  const pitchClass = midi => ((midi % 12) + 12) % 12;

  /**
   * Reads the chords of a recording. The backing is the recording without its bass, the rhythm
   * its beats and bars, the bass the line as read: a chord changes on a beat, more willingly on
   * the first of a bar, and its root is more likely the note the bass plays. Returns
   * [{start, end, root, quality}], root being a pitch class (0 is C).
   */
  function find(backing, rhythm, bass, given = null) {
    if (!backing || !rhythm || rhythm.beats.length < 2) return [];
    const beats = rhythm.beats;
    const count = beats.length - 1;
    const { heard, loud } = onBeats(given || chroma(backing), beats);
    const low = Array.from({ length: count }, () => new Float64Array(12));
    const page = b => b - rhythm.downbeat;
    const opening = b => Rhythm.barStart(rhythm, Rhythm.barAt(rhythm, page(b)));
    const first = b => opening(b) === page(b); // is this beat the first of its bar?
    for (const note of bass || []) {
      for (let b = 0; b < count; b += 1) {
        const overlap = Math.min(note.end, beats[b + 1]) - Math.max(note.start, beats[b]);
        if (overlap <= 0) continue;
        let weight = overlap / (beats[b + 1] - beats[b]);
        if (note.start >= beats[b] - 0.05 && note.start < beats[b] + 0.08) weight += 0.5; // the note struck on the beat says more than one passing through
        low[b][pitchClass(note.midi)] += weight;
      }
    }
    let loudest = 0;
    for (const value of loud) loudest = Math.max(loudest, value);
    const bottomOf = b => { let sum = 0; for (let c = 0; c < 12; c += 1) sum += low[b][c]; return sum; };
    // The bass is part of the chord: a pianist leaves the root out because the bass has it. Its
    // notes join what was heard above, the one on the first beat of the bar most of all.
    for (let b = 0; b < count; b += 1) {
      const bottom = bottomOf(b);
      if (bottom === 0 || loud[b] === 0) continue;
      const weight = first(b) ? 0.7 : 0.25;
      let sum = 0;
      for (let c = 0; c < 12; c += 1) { heard[b][c] += weight * low[b][c] / bottom; sum += heard[b][c] * heard[b][c]; }
      for (let c = 0; c < 12; c += 1) heard[b][c] /= Math.sqrt(sum);
    }
    // for every beat, the first beat of its bar
    const opens = new Int32Array(count);
    for (let b = 0; b < count; b += 1) {
      const at = opening(b) + rhythm.downbeat;
      opens[b] = at < 0 || at >= count ? -1 : at;
    }
    const kinds = [];
    for (let rootNote = 0; rootNote < 12; rootNote += 1) for (const quality of QUALITIES) kinds.push({ root: rootNote, quality });
    const silent = kinds.length; // one more state: nothing sounding
    const fit = (b, kind) => {
      const shape = SHAPES[kind.quality];
      let sum = 0;
      for (const interval of shape) sum += heard[b][(kind.root + interval) % 12];
      let score = sum / Math.sqrt(shape.length);
      if (shape.length > 3) score -= 0.06; // a seventh has to be heard to be written
      const bottom = bottomOf(b);
      if (bottom > 0) score += 0.1 * low[b][kind.root] / bottom;
      // The bass plays the root where the bar starts, then walks: what it played on the first
      // beat speaks for the whole bar. It is what tells C minor seventh from the E flat a
      // pianist's hand plays over it.
      if (opens[b] >= 0) {
        const start = bottomOf(opens[b]);
        if (start > 0) score += 0.3 * low[opens[b]][kind.root] / start;
      }
      return score;
    };
    // the best path through the beats: staying costs nothing, changing costs something
    const change = 0.8;
    const best = [];
    const from = [];
    for (let b = 0; b < count; b += 1) {
      best.push(new Float64Array(kinds.length + 1));
      from.push(new Int32Array(kinds.length + 1));
      // chords change with the bars: readily on the first beat, sometimes halfway through, seldom anywhere else
      let cost = change;
      const bar = Rhythm.barAt(rhythm, page(b));
      const within = page(b) - Rhythm.barStart(rhythm, bar);
      const length = Rhythm.beatsIn(rhythm, bar);
      if (within === 0) cost = change * 0.12;
      else if (length % 2 === 0 && within === length / 2) cost = change * 0.45;
      for (let s = 0; s <= kinds.length; s += 1) {
        let here = 0.25; // what silence is worth: more than a chord that is not there
        if (s !== silent) {
          here = fit(b, kinds[s]);
          if (loudest > 0 && loud[b] < loudest * 0.05) here = 0;
        }
        if (b === 0) { best[b][s] = here; continue; }
        best[b][s] = -Infinity;
        from[b][s] = s;
        for (let p = 0; p <= kinds.length; p += 1) {
          const value = best[b - 1][p] - (p !== s ? cost : 0);
          if (value > best[b][s]) { best[b][s] = value; from[b][s] = p; }
        }
        best[b][s] += here;
      }
    }
    if (count === 0) return [];
    let state = 0;
    for (let s = 0; s <= kinds.length; s += 1) if (best[count - 1][s] > best[count - 1][state]) state = s;
    const path = new Int32Array(count);
    for (let b = count - 1; b >= 0; b -= 1) { path[b] = state; state = from[b][state]; }
    const out = [];
    for (let b = 0; b < count; b += 1) {
      if (path[b] === silent) continue;
      const kind = kinds[path[b]];
      const last = out[out.length - 1];
      if (last && last.root === kind.root && last.quality === kind.quality && Math.abs(last.end - beats[b]) < 1e-6) { last.end = beats[b + 1]; continue; }
      out.push({ start: beats[b], end: beats[b + 1], root: kind.root, quality: kind.quality });
    }
    return out;
  }

  /**
   * Which of the beats the bars start on. The pulse comes with a guess made from the drums
   * alone, which in four tells the strong beats from the weak but often takes the third for the
   * first: the bass drum plays both alike. The harmony does not: chords change, and the bass
   * moves to a new note, where a bar starts far more than halfway through it. So between the
   * guess and the beat half a bar away, the one where more changes is the first.
   */
  function firstBeat(backing, rhythm, bass, given = null) {
    if (!backing || !rhythm || rhythm.perBar < 2 || rhythm.perBar % 2 !== 0 || rhythm.beats.length < 4 * rhythm.perBar) return rhythm ? rhythm.downbeat : 0;
    const beats = rhythm.beats;
    const { heard, loud } = onBeats(given || chroma(backing), beats);
    const count = heard.length;
    // the note the bass strikes on each beat, if it strikes one
    const struck = new Int8Array(count).fill(-1);
    for (const note of bass || []) {
      for (let b = 0; b < count; b += 1) if (note.start >= beats[b] - 0.06 && note.start < beats[b] + 0.09) struck[b] = pitchClass(note.midi);
    }
    const half = rhythm.perBar / 2;
    const changes = new Float64Array(rhythm.perBar);
    const seen = new Float64Array(rhythm.perBar);
    for (let b = half; b + half <= count; b += 1) {
      const before = new Float64Array(12);
      const after = new Float64Array(12);
      for (let k = 0; k < half; k += 1) {
        for (let c = 0; c < 12; c += 1) {
          before[c] += heard[b - 1 - k][c] * loud[b - 1 - k];
          after[c] += heard[b + k][c] * loud[b + k];
        }
      }
      let dot = 0;
      let n1 = 0;
      let n2 = 0;
      for (let c = 0; c < 12; c += 1) { dot += before[c] * after[c]; n1 += before[c] * before[c]; n2 += after[c] * after[c]; }
      let change = n1 > 0 && n2 > 0 ? 1 - dot / Math.sqrt(n1 * n2) : 0;
      // the bass on a new note, against the one it struck half a bar before
      if (struck[b] >= 0 && struck[b - half] >= 0 && struck[b] !== struck[b - half]) change += 0.15;
      changes[b % rhythm.perBar] += change;
      seen[b % rhythm.perBar] += 1;
    }
    for (let i = 0; i < changes.length; i += 1) if (seen[i] > 0) changes[i] /= seen[i];
    const guess = ((rhythm.downbeat % rhythm.perBar) + rhythm.perBar) % rhythm.perBar;
    const other = (guess + half) % rhythm.perBar;
    // how much more must change on the other beat to move the bars there
    return changes[other] > changes[guess] * 1.15 ? other : guess;
  }

  /** The chord sounding at a moment, as its place in the list; -1 for none. */
  function indexAt(list, seconds) {
    for (let i = 0; i < (list || []).length; i += 1) if (seconds >= list[i].start && seconds < list[i].end) return i;
    return -1;
  }

  root.ManicoChords = { QUALITIES, NAMES, nameOf, chroma, onBeats, find, firstBeat, indexAt };
})(globalThis);
