import assert from 'node:assert/strict';
await import('../src/core.js');
await import('../src/transcriber.js');
const C = globalThis.ManicoCore;
const T = globalThis.ManicoTranscriber;

assert.equal(C.VERSION, '5.1.1');
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
assert.ok(rock.events.every(event => C.positionMatchesMidi(event, C.TUNINGS['4'].open, 15)));
assert.match(C.renderTab(rock, '4'), /Rock Eighths/);
console.log('All Manico 5.1 smoke tests passed.');
