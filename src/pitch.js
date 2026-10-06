(function initManicoPitch(root) {
  'use strict';

  // Moves a piece to another key. The recording is made shorter (to go up) or longer (to go
  // down) once, which moves its pitch, and is then played slower or faster by as much, which
  // puts its speed back: the browser's own player keeps the pitch when the speed changes.
  // The resampling is that of C_bass (internal/audio, Repitch).

  const RANGE = 6; // semitones, either way
  const factorOf = semitones => Math.pow(2, semitones / 12);
  const sinc = x => (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));
  const hann = x => (x <= -1 || x >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x));

  /**
   * A channel made shorter (factor above 1) or longer (below 1) by a factor: played back at the
   * same rate it is as many times higher, and as many times faster. Windowed-sinc filtering,
   * with the filter worked out once for 512 places between two samples.
   */
  function repitch(source, factor) {
    if (factor === 1 || !source.length) return source;
    const half = 12; // samples of the recording on each side of the one being made
    const places = 512;
    const cutoff = Math.min(1, 1 / factor) * 0.96; // nothing above half the rate it will be heard at
    const table = new Float32Array(places * 2 * half);
    for (let p = 0; p < places; p += 1) {
      let sum = 0;
      const taps = new Float64Array(2 * half);
      for (let j = 0; j < 2 * half; j += 1) {
        const x = (j - half + 1) - p / places;
        taps[j] = cutoff * sinc(cutoff * x) * hann(x / half);
        sum += taps[j];
      }
      for (let j = 0; j < 2 * half; j += 1) table[p * 2 * half + j] = taps[j] / sum;
    }
    const frames = Math.round(source.length / factor);
    const step = source.length / frames;
    const target = new Float32Array(frames);
    for (let i = 0; i < frames; i += 1) {
      const position = i * step;
      const centre = Math.floor(position);
      const base = Math.floor((position - centre) * places) * 2 * half;
      const first = centre - half + 1;
      let sum = 0;
      if (first >= 0 && centre + half < source.length) {
        for (let j = 0; j < 2 * half; j += 1) sum += source[first + j] * table[base + j];
      } else {
        for (let j = 0; j < 2 * half; j += 1) {
          const k = first + j;
          if (k >= 0 && k < source.length) sum += source[k] * table[base + j];
        }
      }
      target[i] = sum;
    }
    return target;
  }

  /** Channels of samples as the bytes of a 16-bit WAV file. */
  function wavOf(channels, sampleRate) {
    const frames = channels[0].length;
    const count = channels.length;
    const bytes = new Uint8Array(44 + frames * count * 2);
    const view = new DataView(bytes.buffer);
    const text = (at, value) => { for (let i = 0; i < value.length; i += 1) bytes[at + i] = value.charCodeAt(i); };
    text(0, 'RIFF');
    view.setUint32(4, 36 + frames * count * 2, true);
    text(8, 'WAVEfmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, count, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * count * 2, true);
    view.setUint16(32, count * 2, true);
    view.setUint16(34, 16, true);
    text(36, 'data');
    view.setUint32(40, frames * count * 2, true);
    let at = 44;
    for (let i = 0; i < frames; i += 1) {
      for (let c = 0; c < count; c += 1) {
        const value = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(at, Math.round(value * 32767), true);
        at += 2;
      }
    }
    return bytes;
  }

  /**
   * Notes moved by semitones. A note that would fall off the instrument is written an octave
   * away, where it can be played; the string it was on is no longer where it is played.
   */
  function shiftEvents(events, semitones, open, frets) {
    const lowest = open[0];
    const highest = open[open.length - 1] + frets;
    return events.map(event => {
      let midi = event.midi + semitones;
      while (midi < lowest) midi += 12;
      while (midi > highest) midi -= 12;
      return { ...event, midi, rawMidi: midi, string: null, fret: null, lockedPosition: false };
    });
  }

  /** Chords moved by semitones. */
  const shiftChords = (chords, semitones) => (chords || []).map(chord => ({ ...chord, root: (((chord.root + semitones) % 12) + 12) % 12 }));

  root.ManicoPitch = { RANGE, factorOf, repitch, wavOf, shiftEvents, shiftChords };
})(globalThis);
