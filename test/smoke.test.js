import assert from 'node:assert/strict';
await import('../src/core.js');
await import('../src/storage.js');
await import('../src/reader.js');
await import('../src/transcriber.js');
await import('../src/separator.js');
await import('../src/rhythm.js');
const C = globalThis.ManicoCore;
const S = globalThis.ManicoStorage;
const T = globalThis.ManicoTranscriber;

assert.equal(C.VERSION, '7.3.0');
assert.equal(C.DEFAULT_FRETS, 12);
new Function(T.workerSource());
const adaptiveOffsets = T.analysisOffsets(1, 1.11);
assert.ok(adaptiveOffsets.length >= 2);
assert.ok(adaptiveOffsets.every(offset => 1 + offset < 1.11), 'pitch windows must remain before the next onset');
const stableVote = T.selectPitchVotes([
  { midi: 33, confidence: .72 }, { midi: 33, confidence: .68 }, { midi: 45, confidence: .91 }
]);
assert.equal(stableVote.midi, 33, 'consistent windows must beat one high-confidence octave outlier');
assert.deepEqual(C.validLoopBounds({ loopA: 2, loopB: 5 }, 10), { start: 2, end: 5 });
assert.equal(C.validLoopBounds({ loopA: 2, loopB: null }, 10), null, 'an incomplete loop must stay inactive');
assert.equal(C.validLoopBounds({ loopA: 2, loopB: 2.1 }, 10), null, 'a loop shorter than 150ms must stay inactive');
assert.deepEqual(C.validLoopBounds({ loopA: -2, loopB: 20 }, 10), { start: 0, end: 10 });
const editable = [
  { id: 'a', start: 0, end: .4, midi: 33 },
  { id: 'b', start: .5, end: .9, midi: 35 }
];
C.updateEventTiming(editable, 1, .25, .75, 1);
assert.equal(editable[1].id, 'b');
assert.equal(editable[1].start, .25);
C.mergeWithNext(editable, 0);
assert.equal(editable.length, 1);
assert.equal(editable[0].end, .75);
const midi = C.renderMidi({ events: [{ start: 0, end: .5, midi: 33 }] });
assert.equal(new TextDecoder().decode(midi.slice(0, 4)), 'MThd');
assert.equal(new TextDecoder().decode(midi.slice(14, 18)), 'MTrk');
assert.ok(midi.includes(0x90), 'MIDI export must contain a note-on event');
assert.ok(Math.abs(C.frequencyToMidi(110) - 45) < .001);
const sine = Float32Array.from({ length: 4096 }, (_, index) => .2 * Math.sin(2 * Math.PI * 110 * index / 48000));
const detectedPitch = C.estimatePitch(sine, 48000);
assert.ok(detectedPitch && Math.abs(detectedPitch.frequency - 110) < 1, 'pitch detector must recognise a clean A2');
const performanceEvents = [{ id: 'p1', start: 1, end: 1.5, midi: 45 }];
assert.equal(C.assessPerformance(performanceEvents, .95, 45).timingStatus, 'onTime');
assert.equal(C.assessPerformance(performanceEvents, .8, 45).timingStatus, 'early');
assert.equal(C.assessPerformance(performanceEvents, 1.2, 45).timingStatus, 'late');
assert.equal(C.assessPerformance(performanceEvents, 1.1, 43).timingStatus, 'wrong');
assert.equal(C.noteName(28), 'E1');
assert.equal(C.noteName(45), 'A2');
assert.equal(C.parseNote('Bb1'), 34);
assert.equal(C.parseNote('F#2'), 42);
assert.equal(C.parseNote('bad'), null);
assert.ok(C.fretPosition(3, 15) < C.fretPosition(12, 15));

const eighths = C.normalizeEvents([
  { start: 0, end: .25, midi: 33, confidence: .92 },
  { start: .25, end: .5, midi: 33, confidence: .91 },
  { start: .5, end: .75, midi: 33, confidence: .9 },
  { start: .75, end: 1, midi: 33, confidence: .9 }
], 1);
assert.equal(eighths.length, 4, 'repeated eighth notes must remain separate events');
assert.equal(T.dedupeEvents(eighths).length, 4, 'musical repeated notes must not be deduplicated');
assert.equal(T.dedupeEvents([
  { start: 0, end: .2, midi: 33, confidence: .5 },
  { start: .02, end: .2, midi: 34, confidence: .9 }
]).length, 1, 'near-identical duplicate onsets should collapse');

const corrected = C.stabilizeOctaves(C.normalizeEvents([
  { start: 0, end: .24, midi: 33, confidence: .92 },
  { start: .25, end: .49, midi: 33, confidence: .91 },
  { start: .5, end: .74, midi: 45, confidence: .58 },
  { start: .75, end: 1, midi: 33, confidence: .93 }
], 1));
assert.deepEqual(corrected.map(event => event.midi), [33, 33, 33, 33], 'isolated octave glitches must be stabilized');

const trueJump = C.stabilizeOctaves(C.normalizeEvents([
  { start: 0, end: .3, midi: 33, confidence: .95 },
  { start: 1.2, end: 1.6, midi: 45, confidence: .95 }
], 1.6));
assert.deepEqual(trueJump.map(event => event.midi), [33, 45], 'deliberate octave jumps with a rhythmic breath must remain');

const line = C.normalizeEvents([
  { start: 0, end: .25, midi: 33, confidence: 1 },
  { start: .25, end: .5, midi: 36, confidence: 1 },
  { start: .5, end: .75, midi: 38, confidence: 1 },
  { start: .75, end: 1, midi: 40, confidence: 1 }
], 1);
const fingered = C.optimiseFingering(line, C.TUNINGS['4'].open, 15);
assert.ok(fingered.every(event => C.positionMatchesMidi(event, C.TUNINGS['4'].open, 15)), 'every suggested position must reproduce the exact MIDI pitch');

const locked = line.map(event => ({ ...event }));
locked[1].string = 0;
locked[1].fret = 8;
locked[1].lockedPosition = true;
const lockedFingered = C.optimiseFingering(locked, C.TUNINGS['4'].open, 15);
assert.equal(lockedFingered[1].string, 0);
assert.equal(lockedFingered[1].fret, 8);
assert.ok(C.positionMatchesMidi(lockedFingered[1], C.TUNINGS['4'].open, 15));

const preview = C.previewWindow(fingered, 1, 2);
assert.strictEqual(preview.previous, fingered[0]);
assert.strictEqual(preview.current, fingered[1]);
assert.strictEqual(preview.upcoming[0], fingered[2]);
assert.strictEqual(preview.upcoming[1], fingered[3]);
assert.equal(C.currentEventIndex(fingered, .6), 2);

const rock = C.createDemoTrack(C.DEMOS.find(demo => demo.id === 'demo-eighths'));
assert.equal(rock.events.length, 16);
assert.equal(rock.settings.frets, 12, 'included exercises must default to 12 frets');
assert.ok(rock.events.every(event => event.fret === null || event.fret <= 12));
assert.ok(rock.events.every(event => C.positionMatchesMidi(event, C.TUNINGS['4'].open, 12)));
assert.match(C.renderTab(rock, '4'), /Rock Eighths/);

const fifteen = C.createDemoTrack(C.DEMOS[0], '4', 15);
assert.equal(fifteen.settings.frets, 15, 'callers can still ask for a wider range');
const now = Date.now();
const imported = {
  id: 'new-import',
  title: 'New import',
  createdAt: now,
  updatedAt: now,
  settings: { tuning: '4', frets: 15, lookahead: 3, speed: 1 },
  events: C.normalizeEvents([{ start: 0, end: .5, midi: 33, confidence: 1 }], .5)
};
await S.save(imported);
const stored = await S.get(imported.id);
assert.equal(stored.settings.frets, 15, 'storage saves what it is given: the importer sets the 12-fret default itself');
assert.notEqual(stored, imported, 'storage keeps its own copy of a saved track');

// An isolated bass is read by following the note: a held note is one note however long it lasts.
const RATE = 5512;
const isolatedNotes = signal => {
  let events = null;
  const scope = { postMessage: message => { if (message.type === 'result') events = message.events; } };
  new Function('self', T.workerSource())(scope);
  scope.onmessage({ data: { signal, sampleRate: RATE, sensitivity: .72, duration: signal.length / RATE, isolated: true } });
  return events;
};
const tone = (frequency, seconds, shape) => Float32Array.from({ length: Math.round(seconds * RATE) }, (_, index) => {
  const time = index / RATE;
  return shape(time) * (Math.sin(2 * Math.PI * frequency * time) + .4 * Math.sin(4 * Math.PI * frequency * time));
});
const join = (...parts) => {
  const out = new Float32Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
};
const silence = seconds => new Float32Array(Math.round(seconds * RATE));
const held = isolatedNotes(join(silence(.3), tone(55, 4, time => .25 + .2 * Math.min(1, time / 2)), silence(.3)));
assert.equal(held.length, 1, 'a note held for four seconds, swelling slowly, is one note');
assert.equal(held[0].midi, 33);
assert.ok(held[0].end - held[0].start > 3.7);
const plucked = isolatedNotes(join(silence(.3), ...Array.from({ length: 8 }, () => tone(55, .25, time => .4 * Math.exp(-time * 9))), silence(.3)));
assert.equal(plucked.length, 8, 'eight plucks of the same note are eight notes');
assert.ok(plucked.every(event => event.midi === 33));
const slurred = isolatedNotes(join(silence(.3), tone(55, .8, () => .3), tone(65.41, .8, () => .3), silence(.3)));
assert.deepEqual(slurred.map(event => event.midi), [33, 36], 'a change of pitch without a new attack starts a new note');
assert.ok(Math.abs(slurred[1].start - 1.1) < .06);
assert.equal(isolatedNotes(silence(2)).length, 0);

// Rhythm: the beat of a recording, and the notes written against it.
const Rh = globalThis.ManicoRhythm;
const clickTrack = (() => {
  const rate = 11025, seconds = 24, bpm = 100;
  const data = new Float32Array(rate * seconds);
  let seed = 1;
  const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - .5; };
  for (let beat = 0; beat * 60 / bpm < seconds - .1; beat += 1) {
    const start = Math.round((.2 + beat * 60 / bpm) * rate);
    for (let index = 0; index < 400; index += 1) data[start + index] += (beat % 4 ? .5 : 1) * noise() * Math.exp(-index / 80);
  }
  return { sampleRate: rate, length: data.length, duration: seconds, numberOfChannels: 1, getChannelData: () => data };
})();
const pulse = Rh.analyse(clickTrack);
assert.ok(Math.abs(Rh.tempoOf(pulse) - 100) < 1.5, `tempo of a 100 BPM click, found ${Rh.tempoOf(pulse)}`);
assert.ok(pulse.beats.every((time, index) => index === 0 || Math.abs(time - pulse.beats[index - 1] - .6) < .04), 'beats are evenly spaced');
assert.ok(Math.abs(((pulse.beats[0] - .2) / .6 + .5) % 1 - .5) < .08, 'beats fall on the clicks');
const even = Rh.steady(120, 16);
assert.equal(Rh.tempoOf(even), 120);
assert.equal(Rh.positionOf(even, 1), 2);
assert.equal(Rh.positionOf({ ...even, downbeat: 1 }, 1), 1, 'positions count from the first bar line');
assert.ok(Math.abs(Rh.timeOf(even, Rh.positionOf(even, 3.21)) - 3.21) < 1e-9);
assert.ok(Math.abs(Rh.positionOf(even, -1) + 2) < 1e-9, 'the pulse carries on before the first beat');
assert.equal(Rh.tempoOf(Rh.rescale(even, 2)), 240);
assert.equal(Rh.tempoOf(Rh.rescale(even, .5)), 60);
const values = (start, length, rest) => Rh.splitValues(start, length, 16, rest).map(piece => piece.value);
assert.deepEqual(values(0, 16), [16]);
assert.deepEqual(values(0, 12), [12]);
assert.deepEqual(values(0, 6), [6]);
assert.deepEqual(values(2, 4), [4], 'a quarter on the off-beat stays a quarter');
assert.deepEqual(values(1, 3), [3]);
assert.deepEqual(values(3, 6), [1, 4, 1], 'a value that straddles beats is split at them');
assert.deepEqual(values(4, 12), [4, 8], 'three beats from beat two: a quarter tied to a half');
assert.deepEqual(values(2, 6), [2, 4]);
assert.deepEqual(values(4, 6), [6]);
assert.deepEqual(values(0, 12, true), [8, 4], 'rests are never dotted');
assert.deepEqual(values(2, 6, true), [2, 4]);
// One note held for three bars is written once and tied, never repeated.
const longNote = Rh.notate(even, [{ start: 0, end: 6 }, { start: 6, end: 6.25 }, { start: 6.25, end: 6.5 }]);
const written = [...longNote.bars.values()].flat();
assert.equal(written.filter(symbol => symbol.index === 0 && !symbol.tied).length, 1);
assert.deepEqual(written.filter(symbol => symbol.index === 0).map(symbol => [symbol.value, symbol.tied]), [[16, false], [16, true], [16, true]]);
assert.deepEqual(longNote.bars.get(3).map(symbol => [symbol.rest ? 'rest' : symbol.index, symbol.value]), [[1, 2], [2, 2], ['rest', 4], ['rest', 8]]);
// Notes played a little late are still written on the beat they belong to.
const late = Array.from({ length: 16 }, (_, index) => ({ start: index * .25 + .04, end: index * .25 + .27 }));
assert.ok(Math.abs(Rh.calibrate(even, late) - .08) < .01);
assert.deepEqual(Rh.quantize(even, late).map(note => [note.slot, note.slots]), late.map((_, index) => [index * 2, 2]));

// Bass separation: optional engine, absent outside a browser.
const Sep = globalThis.ManicoSeparator;
assert.equal(await Sep.available(), false, 'no separation engine outside a web page');
const mono = Sep.bufferOf(new Float32Array(44100), 44100);
assert.equal(mono.duration, 1);
assert.equal(mono.numberOfChannels, 1);
assert.equal(mono.getChannelData(0).length, 44100);
const firstRun = { downloaded: false };
assert.ok(Math.abs(Sep.progressOf({ stage: 'model', loaded: 87, total: 174 }, firstRun).value - .1) < 1e-9);
assert.ok(Math.abs(Sep.progressOf({ stage: 'separate', step: 0, total: 10 }, firstRun).value - .23) < 1e-9, 'after a download the passes start at 23%');
const cachedRun = { downloaded: false };
assert.ok(Math.abs(Sep.progressOf({ stage: 'separate', step: 5, total: 10 }, cachedRun).value - .48) < 1e-9, 'with the model cached the passes fill the bar from the start');
let last = 0;
for (const data of [{ stage: 'model', loaded: 1, total: 4 }, { stage: 'model', loaded: 4, total: 4 }, { stage: 'start' },
  { stage: 'separate', step: 1, total: 3 }, { stage: 'separate', step: 3, total: 3 }, { stage: 'encode' }]) {
  const { value } = Sep.progressOf(data, firstRun);
  assert.ok(value >= last && value <= 1, 'progress never goes backwards');
  last = value;
}

// The reader of an isolated bass, shared with C_bass. A line played on a plucked string: a note
// held, the same note struck again, its octave, a step down; each is one note, at its pitch.
const R = globalThis.ManicoReader;
{
  const rate = 5512;
  const line = [[0.20, 0.70, 33], [0.95, 0.40, 33], [1.40, 0.40, 45], [1.85, 0.60, 31], [2.60, 1.20, 28]];
  const signal = new Float32Array(Math.round(4.2 * rate));
  for (const [start, length, midi] of line) {
    const hz = 440 * 2 ** ((midi - 69) / 12);
    for (let i = 0; i < length * rate; i += 1) {
      const time = i / rate;
      const body = Math.min(1, time / .004) * Math.exp(-time * 1.6) * Math.min(1, (length - time) / .03);
      signal[Math.round(start * rate) + i] += .4 * body * (Math.sin(2 * Math.PI * hz * time) + .5 * Math.sin(4 * Math.PI * hz * time) + .25 * Math.sin(6 * Math.PI * hz * time));
    }
  }
  const read = C.stabilizeOctaves(C.normalizeEvents(T.dedupeEvents(R.isolatedNotes(signal, rate, .72, 0, 26, null)), 4.2));
  assert.deepEqual(read.map(note => note.midi), line.map(note => note[2]), 'each note of the line is read once, at its pitch and in its octave');
  read.forEach((note, index) => assert.ok(Math.abs(note.start - line[index][0]) < .06, `note ${index} starts where it was played`));
  assert.ok(read[4].end - read[4].start > 1, 'a held note is one long note');
  // held against a recording far louder than it, the same sound is what a separation leaves behind: not notes
  const loud = R.loudLevel(signal, rate);
  assert.equal(R.isolatedNotes(signal, rate, .72, loud * 2, 26, null).length, 0, 'under the floor nothing is a note');
  // and nothing is read below the instrument: the low B of a five-string is not looked for on a four-string
  assert.ok(R.isolatedNotes(signal, rate, .72, 0, 26, null).every(note => note.midi >= 26));
}
// An octave read clearly from the whole note is kept: octaves played in turn are a bass line.
const turns = [33, 45, 33, 45, 33, 45].map((midi, index) => ({ start: index * .3, end: index * .3 + .28, midi, confidence: .7, sure: true }));
assert.deepEqual(C.stabilizeOctaves(C.normalizeEvents(turns, 2)).map(note => note.midi), [33, 45, 33, 45, 33, 45]);
assert.notDeepEqual(C.stabilizeOctaves(C.normalizeEvents(turns.map(({ sure, ...note }) => note), 2)).map(note => note.midi), [33, 45, 33, 45, 33, 45],
  'without that, quick octave turns at middling confidence are smoothed away');
// The worker carries the same reader.
assert.ok(T.workerSource().includes('isolatedNotes') && T.workerSource().includes('Reader.loudLevel'));

console.log(`All Manico ${C.VERSION} smoke tests passed.`);
