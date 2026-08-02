import assert from 'node:assert/strict';
await import('../src/core.js');
const C = globalThis.ManicoCore;
assert.equal(C.VERSION, '5.0.0');
assert.equal(C.noteName(28), 'E1');
assert.equal(C.noteName(43), 'G2');
assert.equal(C.parseNote('Bb1'), 34);
assert.equal(C.parseNote('F#2'), 42);
assert.equal(C.parseNote('bad'), null);
assert.ok(C.fretPosition(3, 15) < C.fretPosition(12, 15));
assert.ok(C.candidatePositions(40, C.TUNINGS['4'].open, 15).some(p => p.string === 0 && p.fret === 12));
const events = C.normalizeEvents([
  { start: 0, end: .5, midi: 28, confidence: .9 },
  { start: .5, end: 1, midi: 31, confidence: .8 },
  { start: 1, end: 1.5, midi: 33, confidence: .8 }
], 1.5);
const fingered = C.optimiseFingering(events, C.TUNINGS['4'].open, 15);
assert.equal(fingered.length, 3);
assert.ok(fingered.every(event => event.string !== null && event.fret !== null));
assert.equal(C.currentEventIndex(fingered, .7), 1);
const demo = C.createDemoTrack(C.DEMOS[0]);
assert.ok(demo.events.length > 8);
assert.match(C.renderTab(demo, '4'), /Slow Blues in F/);
console.log('All Manico 5 smoke tests passed.');
