(function initManicoRhythm(root) {
  'use strict';

  // Finds the beat of a recording and writes the notes against it: which bar and which
  // sixteenth each one starts on, and the note values a tablature needs to show how long it lasts.

  const FPS = 100;
  const DIVISION = 4; // sixteenths in a beat
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  /** In-place radix-2 FFT of real and imaginary arrays whose length is a power of two. */
  function fft(real, imag) {
    const size = real.length;
    for (let index = 1, reversed = 0; index < size; index += 1) {
      let bit = size >> 1;
      for (; reversed & bit; bit >>= 1) reversed ^= bit;
      reversed ^= bit;
      if (index < reversed) {
        [real[index], real[reversed]] = [real[reversed], real[index]];
        [imag[index], imag[reversed]] = [imag[reversed], imag[index]];
      }
    }
    for (let length = 2; length <= size; length <<= 1) {
      const angle = -2 * Math.PI / length;
      const stepReal = Math.cos(angle);
      const stepImag = Math.sin(angle);
      for (let start = 0; start < size; start += length) {
        let turnReal = 1;
        let turnImag = 0;
        for (let offset = 0; offset < length / 2; offset += 1) {
          const even = start + offset;
          const odd = even + length / 2;
          const oddReal = real[odd] * turnReal - imag[odd] * turnImag;
          const oddImag = real[odd] * turnImag + imag[odd] * turnReal;
          real[odd] = real[even] - oddReal;
          imag[odd] = imag[even] - oddImag;
          real[even] += oddReal;
          imag[even] += oddImag;
          const nextReal = turnReal * stepReal - turnImag * stepImag;
          turnImag = turnReal * stepImag + turnImag * stepReal;
          turnReal = nextReal;
        }
      }
    }
  }

  /** The channels of a buffer mixed to mono at about 11 kHz: plenty for finding the beat. */
  function monoSignal(buffer) {
    const step = Math.max(1, Math.round(buffer.sampleRate / 11025));
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
    const output = new Float32Array(Math.floor(buffer.length / step));
    for (let index = 0; index < output.length; index += 1) {
      let sum = 0;
      for (let source = index * step; source < index * step + step; source += 1) {
        for (const channel of channels) sum += channel[source];
      }
      output[index] = sum / (step * channels.length);
    }
    return { signal: output, sampleRate: buffer.sampleRate / step };
  }

  /**
   * How much new sound arrives in each hundredth of a second (spectral flux), and how much of
   * it is in the bass register: drums and chord changes stand out, sustained sound does not.
   */
  function onsetEnvelope(signal, sampleRate) {
    const size = 256;
    const hop = sampleRate / FPS;
    const frames = Math.max(0, Math.floor((signal.length - size) / hop));
    const flux = new Float32Array(frames);
    const low = new Float32Array(frames);
    const window = Float32Array.from({ length: size }, (_, index) => 0.5 - 0.5 * Math.cos(2 * Math.PI * index / size));
    const lowBins = Math.max(2, Math.round(150 / (sampleRate / size)));
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    let previous = new Float32Array(size / 2);
    let current = new Float32Array(size / 2);
    for (let frame = 0; frame < frames; frame += 1) {
      const start = Math.floor(frame * hop);
      for (let index = 0; index < size; index += 1) { real[index] = signal[start + index] * window[index]; imag[index] = 0; }
      fft(real, imag);
      let rise = 0;
      let lowRise = 0;
      for (let bin = 1; bin < size / 2; bin += 1) {
        current[bin] = Math.log1p(100 * Math.sqrt(real[bin] * real[bin] + imag[bin] * imag[bin]));
        const change = current[bin] - previous[bin];
        if (change > 0) { rise += change; if (bin <= lowBins) lowRise += change; }
      }
      flux[frame] = rise;
      low[frame] = lowRise;
      [previous, current] = [current, previous];
    }
    // Take away the local average, so loud and quiet passages weigh the same.
    const flat = new Float32Array(frames);
    let sum = 0;
    const span = FPS;
    for (let frame = 0; frame < frames; frame += 1) {
      sum += flux[frame];
      if (frame >= span) sum -= flux[frame - span];
      flat[frame] = Math.max(0, flux[frame] - sum / Math.min(frame + 1, span));
    }
    let square = 0;
    for (const value of flat) square += value * value;
    const scale = Math.sqrt(square / Math.max(1, frames)) || 1;
    for (let frame = 0; frame < frames; frame += 1) flat[frame] /= scale;
    return { flux: flat, low, offset: size / 2 / sampleRate };
  }

  /** The tempo whose beat, and its multiples, best repeat in the envelope; between 60 and 200 BPM. */
  function estimateTempo(flux) {
    const reach = FPS * 4;
    const auto = new Float32Array(reach + 1);
    for (let lag = 1; lag <= reach; lag += 1) {
      let sum = 0;
      for (let index = 0; index + lag < flux.length; index += 1) sum += flux[index] * flux[index + lag];
      auto[lag] = sum;
    }
    const at = position => {
      const index = Math.floor(position);
      if (index + 1 > reach) return 0;
      return auto[index] + (auto[index + 1] - auto[index]) * (position - index);
    };
    let best = 120;
    let bestScore = -Infinity;
    for (let bpm = 60; bpm < 200; bpm += 0.5) {
      const period = 60 * FPS / bpm;
      const score = (at(period) + at(period * 2) / 2 + at(period * 4) / 4) * Math.exp(-0.5 * Math.log2(bpm / 120) ** 2);
      if (score > bestScore) { bestScore = score; best = bpm; }
    }
    return best;
  }

  /** Beat times: the chain of envelope peaks about one beat apart that scores highest (Ellis, 2007). */
  function trackBeats(flux, bpm, offset = 0) {
    const period = 60 * FPS / bpm;
    const count = flux.length;
    if (count < period * 2) return [];
    const nearest = Math.max(1, Math.round(period / 2));
    const farthest = Math.round(period * 2);
    const penalty = new Float32Array(farthest + 1);
    for (let lag = nearest; lag <= farthest; lag += 1) penalty[lag] = -100 * Math.log(lag / period) ** 2;
    const score = new Float32Array(count);
    const from = new Int32Array(count).fill(-1);
    for (let frame = 0; frame < count; frame += 1) {
      let best = 0;
      let source = -1;
      for (let lag = nearest; lag <= farthest && lag <= frame; lag += 1) {
        const value = score[frame - lag] + penalty[lag];
        if (source < 0 || value > best) { best = value; source = frame - lag; }
      }
      score[frame] = flux[frame] + (source < 0 ? 0 : best);
      from[frame] = source;
    }
    let last = count - 1;
    for (let frame = Math.max(0, count - farthest); frame < count; frame += 1) if (score[frame] > score[last]) last = frame;
    const beats = [];
    for (let frame = last; frame >= 0; frame = from[frame]) beats.push(frame / FPS + offset);
    return beats.reverse();
  }

  /** Which of the first beats starts a bar: the one whose bars begin with the most bass energy. */
  function estimateDownbeat(beats, low, perBar, offset = 0) {
    const totals = new Array(perBar).fill(0);
    beats.forEach((time, index) => {
      const frame = Math.round((time - offset) * FPS);
      let peak = 0;
      for (let near = Math.max(0, frame - 3); near <= Math.min(low.length - 1, frame + 3); near += 1) peak = Math.max(peak, low[near]);
      totals[index % perBar] += peak;
    });
    return totals.indexOf(Math.max(...totals));
  }

  /** Everything the tablature needs to know about the pulse of a recording. */
  function analyse(buffer, perBar = 4) {
    const { signal, sampleRate } = monoSignal(buffer);
    const envelope = onsetEnvelope(signal, sampleRate);
    const bpm = estimateTempo(envelope.flux);
    const beats = trackBeats(envelope.flux, bpm, envelope.offset);
    if (beats.length < 8) return null;
    return {
      beats: beats.map(time => Math.round(time * 1000) / 1000),
      perBar,
      downbeat: estimateDownbeat(beats, envelope.low, perBar, envelope.offset),
      shift: 0
    };
  }

  /** A steady pulse, for the included exercises and for a tempo typed by hand. */
  function steady(bpm, duration, perBar = 4) {
    const beats = [];
    for (let time = 0; time <= duration + 60 / bpm; time += 60 / bpm) beats.push(Math.round(time * 1000) / 1000);
    return { beats, perBar, downbeat: 0, shift: 0 };
  }

  /** Twice or half as many beats, when the tracker settled on the wrong level. */
  function rescale(rhythm, factor) {
    const beats = [];
    if (factor === 2) {
      rhythm.beats.forEach((time, index) => {
        beats.push(time);
        if (index + 1 < rhythm.beats.length) beats.push(Math.round((time + rhythm.beats[index + 1]) * 500) / 1000);
      });
      return { ...rhythm, beats, downbeat: rhythm.downbeat * 2 };
    }
    const start = rhythm.downbeat % 2;
    for (let index = start; index < rhythm.beats.length; index += 2) beats.push(rhythm.beats[index]);
    return { ...rhythm, beats, downbeat: Math.floor(rhythm.downbeat / 2) % rhythm.perBar };
  }

  const tempoOf = rhythm => {
    const gaps = [];
    for (let index = 1; index < rhythm.beats.length; index += 1) gaps.push(rhythm.beats[index] - rhythm.beats[index - 1]);
    gaps.sort((left, right) => left - right);
    return gaps.length ? 60 / gaps[Math.floor(gaps.length / 2)] : 0;
  };

  /**
   * A time in seconds as a position in beats, counted from the first bar line. Before the first
   * beat and after the last the pulse carries on at the nearest tempo.
   */
  function positionOf(rhythm, time) {
    const beats = rhythm.beats;
    const last = beats.length - 1;
    let index;
    if (time <= beats[0]) index = 0;
    else if (time >= beats[last]) index = last - 1;
    else {
      let low = 0;
      let high = last;
      while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (beats[middle] <= time) low = middle; else high = middle;
      }
      index = low;
    }
    return index + (time - beats[index]) / (beats[index + 1] - beats[index]) - rhythm.downbeat;
  }

  function timeOf(rhythm, position) {
    const beats = rhythm.beats;
    const absolute = position + rhythm.downbeat;
    const index = clamp(Math.floor(absolute), 0, beats.length - 2);
    return beats[index] + (absolute - index) * (beats[index + 1] - beats[index]);
  }

  /**
   * How far, in beats, the notes sit from the pulse on average: an onset is heard a little
   * after the drum that marks the beat, and that lag would tip notes onto the wrong sixteenth.
   */
  function calibrate(rhythm, events) {
    let real = 0;
    let imag = 0;
    for (const event of events) {
      const phase = positionOf(rhythm, event.start) * 2 * 2 * Math.PI; // against the eighths
      real += Math.cos(phase);
      imag += Math.sin(phase);
    }
    if (!events.length || Math.hypot(real, imag) / events.length < 0.12) return 0;
    return Math.atan2(imag, real) / (2 * Math.PI) / 2;
  }

  /**
   * The notes on the grid of sixteenths. Each gets `slot` (sixteenths from the first bar line)
   * and `slots` (how many it lasts): until the next note, or until it stops if a real silence follows.
   */
  function quantize(rhythm, events) {
    const shift = calibrate(rhythm, events);
    const placed = [];
    let previous = -Infinity;
    events.forEach((event, index) => {
      let slot = Math.round((positionOf(rhythm, event.start) - shift) * DIVISION);
      if (slot <= previous) slot = previous + 1; // two notes never share a place
      placed.push({ index, slot, end: Math.round((positionOf(rhythm, event.end) - shift) * DIVISION) });
      previous = slot;
    });
    placed.forEach((note, order) => {
      const next = order + 1 < placed.length ? placed[order + 1].slot : Infinity;
      // A gap of a single sixteenth is how a note is let go, not a rest worth writing.
      note.slots = next - note.end <= 1 ? next - note.slot : Math.max(1, note.end - note.slot);
      delete note.end;
    });
    return placed;
  }

  const VALUES = [16, 12, 8, 6, 4, 3, 2, 1];

  /**
   * Splits a stretch inside one bar into note values that read naturally against the beat.
   * Rests are kept plainer than notes: never dotted, never across a beat.
   */
  function splitValues(start, length, barSlots, rest = false) {
    const pieces = [];
    let at = start;
    const end = start + length;
    while (at < end) {
      const inBeat = at % DIVISION;
      let room = end - at;
      if (inBeat === 2 && room === 4 && at % (DIVISION * 2) === 2 && !rest) room = 4; // a syncopated quarter
      else if (inBeat !== 0) room = Math.min(room, DIVISION - inBeat);
      else if (at % (DIVISION * 2) !== 0) room = Math.min(room, room === 6 && !rest ? 6 : 4); // from beats 2 and 4, up to the next strong beat
      else if (at !== 0 && at * 2 !== barSlots) room = Math.min(room, 8);
      const value = VALUES.find(candidate => candidate <= room && candidate <= barSlots && !(rest && (candidate % 3 === 0)));
      pieces.push({ slot: at, value });
      at += value;
    }
    return pieces;
  }

  /**
   * The written music: for every bar, its symbols in order. A symbol is a note or a rest with
   * a place (sixteenths from the start of the bar) and a value in sixteenths; `tied` marks a
   * note that only continues the one before it.
   */
  function notate(rhythm, events) {
    const barSlots = rhythm.perBar * DIVISION;
    const placed = quantize(rhythm, events);
    const bars = new Map();
    const push = (slot, length, extra) => {
      let at = slot;
      let first = true;
      while (at < slot + length) {
        const bar = Math.floor(at / barSlots);
        const inBar = at - bar * barSlots;
        const span = Math.min(slot + length - at, barSlots - inBar);
        for (const piece of splitValues(inBar, span, barSlots, Boolean(extra.rest))) {
          if (!bars.has(bar)) bars.set(bar, []);
          bars.get(bar).push({ ...extra, slot: piece.slot, value: piece.value, tied: !first && !extra.rest, barStart: piece.slot === 0 });
          first = false;
        }
        at += span;
      }
    };
    let cursor = placed.length ? Math.floor(placed[0].slot / barSlots) * barSlots : 0;
    for (const note of placed) {
      if (note.slot > cursor) push(cursor, note.slot - cursor, { rest: true });
      push(note.slot, note.slots, { index: note.index });
      cursor = note.slot + note.slots;
    }
    if (cursor % barSlots) push(cursor, barSlots - cursor % barSlots, { rest: true });
    return { bars, barSlots, placed };
  }

  root.ManicoRhythm = {
    FPS, DIVISION, fft, monoSignal, onsetEnvelope, estimateTempo, trackBeats, estimateDownbeat,
    analyse, steady, rescale, tempoOf, positionOf, timeOf, calibrate, quantize, splitValues, notate
  };
})(globalThis);
