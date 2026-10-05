import assert from 'node:assert/strict';
await import('../src/core.js');
await import('../src/storage.js');
await import('../src/transcriber.js');
await import('../src/separator.js');
const C = globalThis.ManicoCore;
const S = globalThis.ManicoStorage;
const T = globalThis.ManicoTranscriber;

assert.equal(C.VERSION, '7.1.0');
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

console.log(`All Manico ${C.VERSION} smoke tests passed.`);
