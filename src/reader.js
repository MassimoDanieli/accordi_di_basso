(function initManicoReader(root) {
  'use strict';

  // The reader of an isolated bass. It is the one C_bass uses (internal/transcribe in
  // https://github.com/MassimoDanieli/C_bass), kept line for line the same so that the two
  // programs write the same notes for the same recording, and what is measured on one holds
  // for the other.
  //
  // Everything is inside one function that leans on nothing outside it: its text is handed
  // to the worker that does the reading, and the page and the tests call it as it is.
  function reader() {
    const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

    function percentile(values, ratio) {
      if (!values.length) return 0;
      const sorted = Float64Array.from(values).sort();
      return sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio)))];
    }

    // How loud the signal is from moment to moment: rectified and low-passed at 22 Hz in both
    // directions, so that it neither ripples with the note nor lags behind it.
    function smoothLevel(signal, rate) {
      const k = 1 - Math.exp(-2 * Math.PI * 22 / rate);
      const out = new Float64Array(signal.length);
      let a = 0;
      let b = 0;
      for (let i = 0; i < signal.length; i += 1) {
        a += k * (Math.abs(signal[i]) - a);
        b += k * (a - b);
        out[i] = b;
      }
      a = 0;
      b = 0;
      for (let i = signal.length - 1; i >= 0; i -= 1) {
        a += k * (out[i] - a);
        b += k * (a - b);
        out[i] = b;
      }
      return out;
    }

    // The level reached by the loudest twentieth of a recording, a hundred times a second:
    // what the level of its separated bass can be held against.
    function loudLevel(signal, rate) {
      const level = smoothLevel(signal, rate);
      const hop = Math.round(rate * 0.01);
      const env = [];
      for (let i = 0; i < level.length; i += hop) env.push(level[i]);
      return percentile(env, 0.95);
    }

    // How much worse a shorter period may fit and still be taken for the fundamental. Twice
    // the true period always fits as well as the period itself, so the shortest good one is
    // the note. But half the period fits nearly as well when the second harmonic is strong,
    // as on the lowest strings, and then the note is read an octave up: the margin cannot be
    // made safe against both, so a single frame is not trusted with the octave. The pitch of
    // a note is read from all its frames together, where the margin is safe.
    const octaveMargin = 0.08;

    // The period in a curve of how well each lag fits: the shortest lag that peaks within
    // the margin of the best, refined between samples. Null when nothing fits well enough.
    function fundamental(scores, minimumLag, maximumLag, margin) {
      let bestLag = -1;
      let bestScore = -1;
      for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
        if (scores[lag] > bestScore) { bestScore = scores[lag]; bestLag = lag; }
      }
      if (bestScore < 0.5) return null;
      let chosen = bestLag;
      const strong = Math.max(0.6, bestScore - margin);
      for (let lag = minimumLag + 1; lag < bestLag; lag += 1) {
        if (scores[lag] >= strong && scores[lag] >= scores[lag - 1] && scores[lag] >= scores[lag + 1]) {
          chosen = lag;
          break;
        }
      }
      // The top of the peak lies between samples: at the high notes a whole sample is most of a semitone.
      let exact = chosen;
      if (chosen > minimumLag && chosen < maximumLag) {
        const before = scores[chosen - 1];
        const at = scores[chosen];
        const after = scores[chosen + 1];
        const curve = before - 2 * at + after;
        if (curve < 0) exact += clamp(0.5 * (before - after) / curve, -0.5, 0.5);
      }
      return { lag: exact, score: scores[chosen] };
    }

    const pitchOfLag = (lag, rate) => 69 + 12 * Math.log2(rate / lag / 440);

    // The pitch of a short window by normalised autocorrelation. The curve of how well every
    // lag fits is left in scores.
    function framePitch(signal, rate, start, size, minimumLag, maximumLag, scores) {
      if (start < 0 || start + size + maximumLag > signal.length) return null;
      let base = 0;
      for (let i = start; i < start + size; i += 1) base += signal[i] * signal[i];
      if (base <= 0) return null;
      let energy = base;
      for (let lag = 1; lag <= maximumLag; lag += 1) {
        const arriving = signal[start + size + lag - 1];
        const gone = signal[start + lag - 1];
        energy += arriving * arriving - gone * gone;
        if (lag < minimumLag) continue;
        let xy = 0;
        for (let i = start; i < start + size; i += 1) xy += signal[i] * signal[i + lag];
        scores[lag] = xy / Math.sqrt(base * energy + 1e-20);
      }
      const found = fundamental(scores, minimumLag, maximumLag, octaveMargin);
      if (!found) return null;
      const exact = pitchOfLag(found.lag, rate);
      const midi = Math.round(exact);
      if (midi < 23 || midi > 76) return null;
      return { midi, confidence: found.score, exact };
    }

    // How far the recording sits from concert pitch, in semitones between -0.5 and 0.5: where
    // its notes fall between the semitones, if they agree on it. A recording a quarter tone
    // flat would otherwise have every note named by the toss of a coin.
    function tuningOf(pitch, sure) {
      let x = 0;
      let y = 0;
      let weight = 0;
      for (let i = 0; i < pitch.length; i += 1) {
        const p = pitch[i];
        if (p === 0 || sure[i] < 0.9) continue;
        const angle = 2 * Math.PI * (p - Math.round(p));
        x += Math.cos(angle);
        y += Math.sin(angle);
        weight += 1;
      }
      // too little to go on, or no agreement: a fretless played freely
      if (weight < 50 || Math.hypot(x, y) / weight < 0.5) return 0;
      return Math.atan2(y, x) / (2 * Math.PI);
    }

    const pitchClass = midi => ((midi % 12) + 12) % 12;

    // The notes of a bass on its own, found by following the note itself instead of looking
    // for bursts of energy. A held note keeps its level; a plucked one dips and comes back
    // within a few hundredths of a second; a slurred one changes pitch without either. Those
    // three are told apart here.
    //
    // floor is a level, as loudLevel measures it, below which nothing is taken for a note: a
    // bass separated from a recording that has none is not silence but a faint noise. lowest
    // is the lowest note looked for, as a MIDI number: a tone under the lowest open string.
    function isolatedNotes(signal, rate, sensitivity, floor, lowest, report) {
      const hop = Math.round(rate * 0.01);
      const fps = rate / hop;
      const count = Math.floor(signal.length / hop);
      const level = smoothLevel(signal, rate);
      const env = new Float64Array(count);
      for (let i = 0; i < count; i += 1) env[i] = level[i * hop];
      const reference = percentile(env, 0.95) || 1e-9;
      const gate = Math.max(reference * 0.07, floor || 0);
      const active = i => env[i] > gate;

      // How much the level must come back up, within five hundredths of a second, to count as a new attack.
      const threshold = clamp(1.15 + (0.72 - sensitivity) * 0.5, 1.04, 1.5);
      const reach = 5;
      const rise = new Float64Array(count).fill(1);
      for (let i = 0; i + reach < count; i += 1) rise[i] = env[i + reach] / (env[i] + reference * 0.02);
      const attacks = [];
      for (let i = 3; i < count - reach - 3; i += 1) {
        if (rise[i] < threshold || env[i + reach] <= gate) continue;
        let top = true;
        for (let j = i - 3; j <= i + 3; j += 1) if (rise[j] > rise[i]) top = false;
        if (!top) continue;
        const last = attacks.length - 1;
        if (last >= 0 && i - attacks[last] < 5) {
          if (rise[i] > rise[attacks[last]]) attacks[last] = i;
        } else {
          attacks.push(i);
        }
      }
      const bounds = new Uint8Array(count + 8);
      const struck = new Uint8Array(count + 8);
      for (const i of attacks) { bounds[i + 2] = 1; struck[i + 2] = 1; }

      const size = Math.round(rate * 0.085);
      const minimumLag = Math.max(2, Math.floor(rate / 330));
      // the longest period looked for: half a semitone below the lowest note, and never under 31 Hz
      const maximumLag = Math.min(Math.floor(rate / 31), Math.floor(rate / (440 * Math.pow(2, (lowest - 0.5 - 69) / 12))));
      const scores = new Float64Array(maximumLag + 2);
      const raw = new Float64Array(count); // the pitch of each frame, between semitones; 0 where there is none
      const sure = new Float64Array(count);
      const curves = new Array(count).fill(null); // how well every lag fits, for the frames with a pitch
      for (let i = 0; i < count; i += 1) {
        if (active(i)) {
          const found = framePitch(signal, rate, i * hop - Math.trunc(size / 2), size, minimumLag, maximumLag, scores);
          if (found) {
            raw[i] = found.exact;
            sure[i] = found.confidence;
            const curve = new Float32Array(maximumLag + 1);
            for (let lag = minimumLag; lag <= maximumLag; lag += 1) curve[lag] = scores[lag];
            curves[i] = curve;
          }
        }
        if (i % 400 === 0 && report) report(i / count);
      }
      const tuning = tuningOf(raw, sure);
      // The median of five frames steadies the pitch.
      const pitch = new Float64Array(count);
      const near = [];
      for (let i = 0; i < count; i += 1) {
        near.length = 0;
        for (let j = Math.max(0, i - 2); j <= Math.min(count - 1, i + 2); j += 1) if (raw[j] !== 0) near.push(raw[j]);
        if (near.length >= 3) {
          near.sort((a, b) => a - b);
          pitch[i] = near.length % 2 === 1 ? near[(near.length - 1) / 2] : (near[near.length / 2 - 1] + near[near.length / 2]) / 2;
        }
      }
      // A new note starts where the pitch moves away from where the note has been sitting and
      // settles somewhere else for four hundredths (twice that for an octave, the usual
      // misreading). The pitch is followed between semitones: a note played a little flat, as
      // on a fretless or on a recording not tuned to 440, would otherwise flicker between two
      // names; and a slide passes through without leaving a note at every fret.
      const away = 0.7;
      const settled = 0.4;
      let current = 0;
      let held = 0;
      let run = 0;
      let candidate = 0;
      let bottom = 0;
      let top = 0;
      for (let i = 0; i < count; i += 1) {
        const p = pitch[i];
        if (!active(i)) { current = 0; held = 0; run = 0; continue; }
        if (p === 0) continue;
        if (bounds[i] || current === 0) { current = p; held = 1; run = 0; continue; }
        if (Math.abs(p - current) <= away) {
          run = 0;
          held = Math.min(held + 1, 30);
          current += (p - current) / held;
          continue;
        }
        // settled: the frames of the run all within a narrow band, which a pitch on its way
        // somewhere else never is
        if (run > 0 && Math.max(top, p) - Math.min(bottom, p) <= settled) {
          run += 1;
          candidate += (p - candidate) / run;
          bottom = Math.min(bottom, p);
          top = Math.max(top, p);
        } else {
          run = 1; candidate = p; bottom = p; top = p;
        }
        let need = 4;
        const octaves = Math.abs(candidate - current) / 12;
        if (Math.abs(octaves - Math.round(octaves)) < 0.05) need = 8;
        if (run >= need) {
          bounds[i - run + 1] = 1;
          current = candidate; held = run; run = 0;
        }
      }

      // The stretches between one boundary and the next.
      let notes = [];
      for (let i = 0; i < count;) {
        if (!active(i)) { i += 1; continue; }
        let j = i;
        while (j < count && active(j)) j += 1;
        let from = i;
        for (let k = i + 1; k <= j; k += 1) {
          if (k === j || bounds[k]) {
            notes.push({ from, to: k, midi: 0, confidence: 0, struck: from === i || Boolean(struck[from]) });
            from = k;
          }
        }
        i = j;
      }
      // The pitch of a stretch is read from the whole of it at once: the fit of every lag is
      // averaged over its frames before the period is chosen. A frame on its own can be
      // fooled, above all between an octave and the next; the average of a note cannot so easily.
      const mean = new Float64Array(maximumLag + 2);
      const pitchOf = (from, to) => {
        // A frame looks 40 ms each way: near the ends of the stretch it sees the neighbours
        // too. The ends are left out, as far as the stretch is long enough to spare them.
        const edge = Math.min(4, Math.trunc((to - from) / 3));
        const first = from + edge;
        const last = to - edge;
        // Nor do the frames on their way to another pitch count, in a slide or a bend: only
        // those that sit where most of the stretch sits, in whatever octave they were read.
        const within = [];
        for (let i = first; i < last; i += 1) if (raw[i] !== 0) within.push(raw[i]);
        if (!within.length) return [0, 0];
        within.sort((a, b) => a - b);
        const middle = within[Math.trunc(within.length / 2)];
        mean.fill(0);
        let frames = 0;
        for (let i = first; i < last; i += 1) {
          if (!curves[i]) continue;
          const off = Math.abs(raw[i] - middle);
          if (Math.abs(off - 12 * Math.round(off / 12)) > away) continue;
          const curve = curves[i];
          for (let lag = minimumLag; lag <= maximumLag; lag += 1) mean[lag] += curve[lag];
          frames += 1;
        }
        for (let lag = minimumLag; lag <= maximumLag; lag += 1) mean[lag] /= frames;
        const found = fundamental(mean, minimumLag, maximumLag, octaveMargin);
        if (!found) return [0, 0];
        const midi = Math.round(pitchOfLag(found.lag, rate) - tuning);
        if (midi < 23 || midi > 76) return [0, 0];
        return [midi, found.score];
      };
      for (const note of notes) [note.midi, note.confidence] = pitchOf(note.from, note.to);

      // Boundaries that are not the start of a note are taken out, until none is left.
      const fragment = 5; // hundredths: too short to be anything
      const short = 8; // too short to be a note unless it is clearly one
      const blur = 10; // how long the start of a note can take to settle on its pitch
      const release = 12; // how long its end can take to die away
      const steady = 30; // long enough for what was read to be what was played
      const length = p => p.to - p.from;
      const join = (k, midi, confidence) => { // k and k+1 become one
        notes[k] = {
          from: notes[k].from, to: notes[k + 1].to, midi, confidence,
          struck: notes[k].struck || (length(notes[k]) < blur && notes[k + 1].struck)
        };
        notes.splice(k + 1, 1);
      };
      for (let changed = true; changed;) {
        changed = false;
        for (let k = 0; k + 1 < notes.length; k += 1) {
          const a = notes[k];
          const b = notes[k + 1];
          if (a.to !== b.from) continue;
          const lastOfRun = k + 2 >= notes.length || notes[k + 2].from !== b.to;
          if (b.midi === 0) {
            // no pitch: the note before rings on
            join(k, a.midi, a.confidence);
          } else if (a.midi === 0) {
            join(k, b.midi, b.confidence);
          } else if (a.midi === b.midi && (!b.struck || length(a) < short)) {
            // the same note, and nothing struck in between: the two halves of one attack
            let [midi, confidence] = pitchOf(a.from, b.to);
            if (midi !== a.midi) { midi = a.midi; confidence = Math.max(a.confidence, b.confidence); }
            join(k, midi, confidence);
          } else if (pitchClass(a.midi) === pitchClass(b.midi) && !b.struck) {
            // The same note an octave away, and nothing struck in between: one note. No hand
            // jumps an octave without plucking; it is the sound that changes. A string just
            // struck can rattle so that every other wave differs, and looks an octave lower;
            // left ringing it loses its fundamental, and looks an octave higher. Sound at the
            // lower octave is evidence, its absence is not: where the lower one held for a
            // good while it is the note. Otherwise the note is what fits the whole.
            let [midi, confidence] = pitchOf(a.from, b.to);
            const low = b.midi < a.midi ? b : a;
            if (length(low) >= steady) {
              // long enough to be no accident: the lower octave was really there
              midi = low.midi; confidence = low.confidence;
            } else if (pitchClass(midi) !== pitchClass(a.midi)) {
              midi = a.midi; confidence = a.confidence;
              if (length(b) > length(a)) { midi = b.midi; confidence = b.confidence; }
            }
            join(k, midi, confidence);
          } else if (length(a) < fragment || (length(a) < blur && !b.struck && a.confidence < 0.85 && length(b) >= 2 * length(a))) {
            // the blur at the start of the next note: its pitch settles without anything
            // being struck again. A short note before a struck one is a note.
            join(k, b.midi, b.confidence);
          } else if ((length(b) < fragment && (!b.struck || lastOfRun)) || (!b.struck && lastOfRun && (length(b) < short || (length(b) < release && b.confidence < 0.9)))) {
            // the pitch drifting as the note dies away
            join(k, a.midi, a.confidence);
          } else {
            continue;
          }
          changed = true;
          k -= 1;
        }
      }
      const events = [];
      notes.forEach((note, k) => {
        const alone = !(k > 0 && notes[k - 1].to === note.from) && !(k + 1 < notes.length && notes[k + 1].from === note.to);
        if (note.midi === 0 || length(note) < fragment || (alone && length(note) < short)) return; // a blip on its own in silence
        events.push({
          start: note.from / fps, end: note.to / fps, midi: note.midi, rawMidi: note.midi,
          confidence: clamp(note.confidence, 0, 1),
          // its octave was read from the whole note, clearly: not to be second-guessed from the notes around it
          sure: note.confidence >= 0.75 && length(note) >= short
        });
      });
      return events;
    }

    return { isolatedNotes, loudLevel, smoothLevel, percentile };
  }

  root.ManicoReader = Object.assign(reader(), { source: reader.toString() });
})(globalThis);
