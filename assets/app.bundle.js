(function initManicoPieces(root) {
  'use strict';

  // The five pieces that come with Manico: the same that come with C_bass, played by its
  // synthesiser. Their recordings are in assets/pieces, the bass alone and the rest alone;
  // here is what is written on the page: each note as [start, end, MIDI number] and each chord
  // as [start, end, root, kind], in seconds. The first bar is the count of the sticks.
  // Written by C_bass (go run ./tools/pieces): not to be edited by hand.
  root.ManicoPieces = [
    { id: "demo-blues", title: "Blues", key: "E", bpm: 96, beats: 4, duration: 63.125,
      notes: [[2.5,2.788,28],[2.906,3.125,32],[3.125,3.413,35],[3.531,3.75,37],[3.75,4.037,38],[4.156,4.375,37],[4.375,4.663,35],[4.781,5,32],[5,5.288,28],[5.406,5.625,32],[5.625,5.913,35],[6.031,6.25,37],[6.25,6.538,38],[6.656,6.875,37],[6.875,7.163,35],[7.281,7.5,32],[7.5,7.788,28],[7.906,8.125,32],[8.125,8.413,35],[8.531,8.75,37],[8.75,9.038,38],[9.156,9.375,37],[9.375,9.663,35],[9.781,10,32],[10,10.288,28],[10.406,10.625,32],[10.625,10.913,35],[11.031,11.25,37],[11.25,11.538,38],[11.656,11.875,37],[11.875,12.163,35],[12.281,12.5,32],[12.5,12.788,33],[12.906,13.125,37],[13.125,13.413,40],[13.531,13.75,42],[13.75,14.038,43],[14.156,14.375,42],[14.375,14.663,40],[14.781,15,37],[15,15.288,33],[15.406,15.625,37],[15.625,15.913,40],[16.031,16.25,42],[16.25,16.538,43],[16.656,16.875,42],[16.875,17.163,40],[17.281,17.5,37],[17.5,17.788,28],[17.906,18.125,32],[18.125,18.413,35],[18.531,18.75,37],[18.75,19.038,38],[19.156,19.375,37],[19.375,19.663,35],[19.781,20,32],[20,20.288,28],[20.406,20.625,32],[20.625,20.913,35],[21.031,21.25,37],[21.25,21.538,38],[21.656,21.875,37],[21.875,22.163,35],[22.281,22.5,32],[22.5,22.788,35],[22.906,23.125,39],[23.125,23.413,42],[23.531,23.75,44],[23.75,24.038,45],[24.156,24.375,44],[24.375,24.663,42],[24.781,25,39],[25,25.288,33],[25.406,25.625,37],[25.625,25.913,40],[26.031,26.25,42],[26.25,26.538,43],[26.656,26.875,42],[26.875,27.163,40],[27.281,27.5,37],[27.5,27.788,28],[27.906,28.125,32],[28.125,28.413,35],[28.531,28.75,37],[28.75,29.038,38],[29.156,29.375,37],[29.375,29.663,35],[29.781,30,32],[30,30.575,35],[30.625,31.2,37],[31.25,31.825,39],[31.875,32.45,40],[32.5,32.788,28],[32.906,33.125,32],[33.125,33.413,35],[33.531,33.75,37],[33.75,34.038,38],[34.156,34.375,37],[34.375,34.663,35],[34.781,35,32],[35,35.288,28],[35.406,35.625,32],[35.625,35.913,35],[36.031,36.25,37],[36.25,36.538,38],[36.656,36.875,37],[36.875,37.163,35],[37.281,37.5,32],[37.5,37.788,28],[37.906,38.125,32],[38.125,38.413,35],[38.531,38.75,37],[38.75,39.038,38],[39.156,39.375,37],[39.375,39.663,35],[39.781,40,32],[40,40.288,28],[40.406,40.625,32],[40.625,40.913,35],[41.031,41.25,37],[41.25,41.538,38],[41.656,41.875,37],[41.875,42.163,35],[42.281,42.5,32],[42.5,42.788,33],[42.906,43.125,37],[43.125,43.413,40],[43.531,43.75,42],[43.75,44.038,43],[44.156,44.375,42],[44.375,44.663,40],[44.781,45,37],[45,45.288,33],[45.406,45.625,37],[45.625,45.913,40],[46.031,46.25,42],[46.25,46.538,43],[46.656,46.875,42],[46.875,47.163,40],[47.281,47.5,37],[47.5,47.788,28],[47.906,48.125,32],[48.125,48.413,35],[48.531,48.75,37],[48.75,49.038,38],[49.156,49.375,37],[49.375,49.663,35],[49.781,50,32],[50,50.288,28],[50.406,50.625,32],[50.625,50.913,35],[51.031,51.25,37],[51.25,51.538,38],[51.656,51.875,37],[51.875,52.163,35],[52.281,52.5,32],[52.5,52.788,35],[52.906,53.125,39],[53.125,53.413,42],[53.531,53.75,44],[53.75,54.038,45],[54.156,54.375,44],[54.375,54.663,42],[54.781,55,39],[55,55.288,33],[55.406,55.625,37],[55.625,55.913,40],[56.031,56.25,42],[56.25,56.538,43],[56.656,56.875,42],[56.875,57.163,40],[57.281,57.5,37],[57.5,57.788,28],[57.906,58.125,32],[58.125,58.413,35],[58.531,58.75,37],[58.75,59.038,38],[59.156,59.375,37],[59.375,59.663,35],[59.781,60,32],[60,60.575,35],[60.625,61.2,37],[61.25,61.825,39],[61.875,62.45,40]],
      chords: [[2.5,12.5,4,"7"],[12.5,17.5,9,"7"],[17.5,22.5,4,"7"],[22.5,25,11,"7"],[25,27.5,9,"7"],[27.5,30,4,"7"],[30,32.5,11,"7"],[32.5,42.5,4,"7"],[42.5,47.5,9,"7"],[47.5,52.5,4,"7"],[52.5,55,11,"7"],[55,57.5,9,"7"],[57.5,60,4,"7"],[60,62.5,11,"7"]] },
    { id: "demo-funk", title: "Funk", key: "E", bpm: 104, beats: 4, duration: 39.808,
      notes: [[2.308,2.706,28],[3.173,3.438,40],[3.462,3.727,38],[4.038,4.304,35],[4.327,4.592,38],[4.615,4.881,28],[5.048,5.181,40],[5.337,5.469,40],[5.481,5.746,38],[5.769,5.902,35],[6.058,6.323,33],[6.49,6.623,31],[6.635,6.9,30],[6.923,7.321,28],[7.788,8.054,40],[8.077,8.342,38],[8.654,8.919,35],[8.942,9.208,38],[9.231,9.496,28],[9.663,9.796,40],[9.952,10.085,40],[10.096,10.362,38],[10.385,10.517,35],[10.673,10.938,33],[11.106,11.238,31],[11.25,11.515,30],[11.538,11.937,33],[12.404,12.669,45],[12.692,12.958,43],[13.269,13.535,40],[13.558,13.823,43],[13.846,14.112,33],[14.279,14.412,45],[14.567,14.7,45],[14.712,14.977,43],[15,15.133,40],[15.288,15.554,38],[15.721,15.854,36],[15.865,16.131,35],[16.154,16.552,28],[17.019,17.285,40],[17.308,17.573,38],[17.885,18.15,35],[18.173,18.438,38],[18.462,18.727,28],[18.894,19.027,40],[19.183,19.315,40],[19.327,19.592,38],[19.615,19.748,35],[19.904,20.169,33],[20.337,20.469,31],[20.481,20.746,30],[20.769,21.167,28],[21.635,21.9,40],[21.923,22.188,38],[22.5,22.765,35],[22.788,23.054,38],[23.077,23.342,28],[23.51,23.642,40],[23.798,23.931,40],[23.942,24.208,38],[24.231,24.363,35],[24.519,24.785,33],[24.952,25.085,31],[25.096,25.362,30],[25.385,25.783,28],[26.25,26.515,40],[26.538,26.804,38],[27.115,27.381,35],[27.404,27.669,38],[27.692,27.958,28],[28.125,28.258,40],[28.413,28.546,40],[28.558,28.823,38],[28.846,28.979,35],[29.135,29.4,33],[29.567,29.7,31],[29.712,29.977,30],[30,30.398,33],[30.865,31.131,45],[31.154,31.419,43],[31.731,31.996,40],[32.019,32.285,43],[32.308,32.573,33],[32.74,32.873,45],[33.029,33.162,45],[33.173,33.438,43],[33.462,33.594,40],[33.75,34.015,38],[34.183,34.315,36],[34.327,34.592,35],[34.615,35.013,28],[35.481,35.746,40],[35.769,36.035,38],[36.346,36.612,35],[36.635,36.9,38],[36.923,37.188,28],[37.356,37.488,40],[37.644,37.777,40],[37.788,38.054,38],[38.077,38.21,35],[38.365,38.631,33],[38.798,38.931,31],[38.942,39.208,30]],
      chords: [[2.308,11.538,4,"7"],[11.538,16.154,9,"7"],[16.154,30,4,"7"],[30,34.615,9,"7"],[34.615,39.231,4,"7"]] },
    { id: "demo-bossa", title: "Bossa nova", key: "A", bpm: 132, beats: 4, duration: 31.364,
      notes: [[1.818,2.445,33],[2.5,2.709,40],[2.727,3.355,40],[3.409,3.618,33],[3.636,4.264,33],[4.318,4.527,40],[4.545,5.173,40],[5.227,5.436,33],[5.455,6.082,38],[6.136,6.345,33],[6.364,6.991,33],[7.045,7.255,38],[7.273,7.9,38],[7.955,8.164,33],[8.182,8.809,33],[8.864,9.073,38],[9.091,9.718,28],[9.773,9.982,35],[10,10.627,35],[10.682,10.891,28],[10.909,11.536,28],[11.591,11.8,35],[11.818,12.445,35],[12.5,12.709,28],[12.727,13.355,33],[13.409,13.618,40],[13.636,14.264,40],[14.318,14.527,33],[14.545,15.173,33],[15.227,15.436,40],[15.455,16.082,40],[16.136,16.345,33],[16.364,16.991,33],[17.045,17.255,40],[17.273,17.9,40],[17.955,18.164,33],[18.182,18.809,33],[18.864,19.073,40],[19.091,19.718,40],[19.773,19.982,33],[20,20.627,38],[20.682,20.891,33],[20.909,21.536,33],[21.591,21.8,38],[21.818,22.445,38],[22.5,22.709,33],[22.727,23.355,33],[23.409,23.618,38],[23.636,24.264,28],[24.318,24.527,35],[24.545,25.173,35],[25.227,25.436,28],[25.455,26.082,28],[26.136,26.345,35],[26.364,26.991,35],[27.045,27.255,28],[27.273,27.9,33],[27.955,28.164,40],[28.182,28.809,40],[28.864,29.073,33],[29.091,29.718,33],[29.773,29.982,40],[30,30.627,40],[30.682,30.891,33]],
      chords: [[1.818,5.455,9,"m7"],[5.455,9.091,2,"m7"],[9.091,12.727,4,"7"],[12.727,20,9,"m7"],[20,23.636,2,"m7"],[23.636,27.273,4,"7"],[27.273,30.909,9,"m7"]] },
    { id: "demo-walking", title: "Walking", key: "F", bpm: 140, beats: 4, duration: 43.286,
      notes: [[1.714,2.109,29],[2.143,2.537,33],[2.571,2.966,36],[3,3.394,34],[3.429,3.823,34],[3.857,4.251,38],[4.286,4.68,41],[4.714,5.109,44],[5.143,5.537,29],[5.571,5.966,33],[6,6.394,36],[6.429,6.823,34],[6.857,7.251,36],[7.286,7.68,39],[7.714,8.109,43],[8.143,8.537,35],[8.571,8.966,34],[9,9.394,38],[9.429,9.823,41],[9.857,10.251,33],[10.286,10.68,34],[10.714,11.109,38],[11.143,11.537,41],[11.571,11.966,44],[12,12.394,29],[12.429,12.823,33],[12.857,13.251,36],[13.286,13.68,34],[13.714,14.109,38],[14.143,14.537,42],[14.571,14.966,45],[15,15.394,37],[15.429,15.823,31],[15.857,16.251,34],[16.286,16.68,38],[16.714,17.109,30],[17.143,17.537,36],[17.571,17.966,40],[18,18.394,43],[18.429,18.823,46],[18.857,19.251,29],[19.286,19.68,33],[19.714,20.109,36],[20.143,20.537,34],[20.571,20.966,36],[21,21.394,40],[21.429,21.823,43],[21.857,22.251,46],[22.286,22.68,29],[22.714,23.109,33],[23.143,23.537,36],[23.571,23.966,34],[24,24.394,34],[24.429,24.823,38],[24.857,25.251,41],[25.286,25.68,44],[25.714,26.109,29],[26.143,26.537,33],[26.571,26.966,36],[27,27.394,34],[27.429,27.823,36],[27.857,28.251,39],[28.286,28.68,43],[28.714,29.109,35],[29.143,29.537,34],[29.571,29.966,38],[30,30.394,41],[30.429,30.823,33],[30.857,31.251,34],[31.286,31.68,38],[31.714,32.109,41],[32.143,32.537,44],[32.571,32.966,29],[33,33.394,33],[33.429,33.823,36],[33.857,34.251,34],[34.286,34.68,38],[34.714,35.109,42],[35.143,35.537,45],[35.571,35.966,37],[36,36.394,31],[36.429,36.823,34],[36.857,37.251,38],[37.286,37.68,30],[37.714,38.109,36],[38.143,38.537,40],[38.571,38.966,43],[39,39.394,46],[39.429,39.823,29],[39.857,40.251,33],[40.286,40.68,36],[40.714,41.109,34],[41.143,41.537,36],[41.571,41.966,40],[42,42.394,43],[42.429,42.823,46]],
      chords: [[1.714,3.429,5,"7"],[3.429,5.143,10,"7"],[5.143,6.857,5,"7"],[6.857,8.571,0,"m7"],[8.571,12,10,"7"],[12,13.714,5,"7"],[13.714,15.429,2,"7"],[15.429,17.143,7,"m7"],[17.143,18.857,0,"7"],[18.857,20.571,5,"7"],[20.571,22.286,0,"7"],[22.286,24,5,"7"],[24,25.714,10,"7"],[25.714,27.429,5,"7"],[27.429,29.143,0,"m7"],[29.143,32.571,10,"7"],[32.571,34.286,5,"7"],[34.286,36,2,"7"],[36,37.714,7,"m7"],[37.714,39.429,0,"7"],[39.429,41.143,5,"7"],[41.143,42.857,0,"7"]] },
    { id: "demo-rock", title: "Rock", key: "G", bpm: 120, beats: 4, duration: 34.5,
      notes: [[2,2.23,31],[2.25,2.48,31],[2.5,2.73,31],[2.75,2.98,31],[3,3.23,31],[3.25,3.48,31],[3.5,3.73,43],[3.75,3.98,31],[4,4.23,38],[4.25,4.48,38],[4.5,4.73,38],[4.75,4.98,38],[5,5.23,38],[5.25,5.48,38],[5.5,5.73,50],[5.75,5.98,38],[6,6.23,28],[6.25,6.48,28],[6.5,6.73,28],[6.75,6.98,28],[7,7.23,28],[7.25,7.48,28],[7.5,7.73,40],[7.75,7.98,28],[8,8.23,36],[8.25,8.48,36],[8.5,8.73,36],[8.75,8.98,36],[9,9.23,36],[9.25,9.48,36],[9.5,9.73,48],[9.75,9.98,43],[10,10.23,31],[10.25,10.48,31],[10.5,10.73,31],[10.75,10.98,31],[11,11.23,31],[11.25,11.48,31],[11.5,11.73,43],[11.75,11.98,31],[12,12.23,38],[12.25,12.48,38],[12.5,12.73,38],[12.75,12.98,38],[13,13.23,38],[13.25,13.48,38],[13.5,13.73,50],[13.75,13.98,38],[14,14.23,36],[14.25,14.48,36],[14.5,14.73,36],[14.75,14.98,36],[15,15.23,36],[15.25,15.48,36],[15.5,15.73,48],[15.75,15.98,36],[16,16.23,38],[16.25,16.48,38],[16.5,16.73,38],[16.75,16.98,38],[17,17.23,38],[17.25,17.48,38],[17.5,17.73,50],[17.75,17.98,45],[18,18.23,31],[18.25,18.48,31],[18.5,18.73,31],[18.75,18.98,31],[19,19.23,31],[19.25,19.48,31],[19.5,19.73,43],[19.75,19.98,31],[20,20.23,38],[20.25,20.48,38],[20.5,20.73,38],[20.75,20.98,38],[21,21.23,38],[21.25,21.48,38],[21.5,21.73,50],[21.75,21.98,38],[22,22.23,28],[22.25,22.48,28],[22.5,22.73,28],[22.75,22.98,28],[23,23.23,28],[23.25,23.48,28],[23.5,23.73,40],[23.75,23.98,28],[24,24.23,36],[24.25,24.48,36],[24.5,24.73,36],[24.75,24.98,36],[25,25.23,36],[25.25,25.48,36],[25.5,25.73,48],[25.75,25.98,43],[26,26.23,31],[26.25,26.48,31],[26.5,26.73,31],[26.75,26.98,31],[27,27.23,31],[27.25,27.48,31],[27.5,27.73,43],[27.75,27.98,31],[28,28.23,38],[28.25,28.48,38],[28.5,28.73,38],[28.75,28.98,38],[29,29.23,38],[29.25,29.48,38],[29.5,29.73,50],[29.75,29.98,38],[30,30.23,36],[30.25,30.48,36],[30.5,30.73,36],[30.75,30.98,36],[31,31.23,36],[31.25,31.48,36],[31.5,31.73,48],[31.75,31.98,36],[32,32.23,38],[32.25,32.48,38],[32.5,32.73,38],[32.75,32.98,38],[33,33.23,38],[33.25,33.48,38],[33.5,33.73,50],[33.75,33.98,45]],
      chords: [[2,4,7,""],[4,6,2,""],[6,8,4,"m"],[8,10,0,""],[10,12,7,""],[12,14,2,""],[14,16,0,""],[16,18,2,""],[18,20,7,""],[20,22,2,""],[22,24,4,"m"],[24,26,0,""],[26,28,7,""],[28,30,2,""],[30,32,0,""],[32,34,2,""]] }
  ];
})(globalThis);


(function initManicoCore(root) {
  'use strict';

  const VERSION = '7.4.0';
  // New imports and included exercises start in the accompaniment-friendly 0-12 range;
  // existing projects keep the range their owner chose.
  const DEFAULT_FRETS = 12;
  const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const TUNINGS = {
    '4':  { label: 'E A D G', open: [28, 33, 38, 43] },
    '5':  { label: 'B E A D G', open: [23, 28, 33, 38, 43] },
    '5c': { label: 'E A D G C', open: [28, 33, 38, 43, 48] },
    '6':  { label: 'B E A D G C', open: [23, 28, 33, 38, 43, 48] }
  };
  // The pieces that come with the app; each has a recording in assets/pieces.
  const DEMOS = (root.ManicoPieces || []).map(piece => ({ ...piece, style: piece.title }));

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function validLoopBounds(settings, duration = Infinity, minimum = 0.15) {
    if (settings?.loopA === null || settings?.loopA === undefined
      || settings?.loopB === null || settings?.loopB === undefined) return null;
    const loopA = Number(settings?.loopA);
    const loopB = Number(settings?.loopB);
    if (!Number.isFinite(loopA) || !Number.isFinite(loopB)) return null;
    const start = clamp(loopA, 0, duration);
    const end = clamp(loopB, 0, duration);
    return end - start >= minimum ? { start, end } : null;
  }

  function updateEventTiming(events, index, start, end, duration = Infinity) {
    if (!Array.isArray(events) || !events[index]) return events || [];
    const event = events[index];
    const safeStart = clamp(Number(start) || 0, 0, duration);
    const safeEnd = clamp(Math.max(safeStart + 0.04, Number(end) || safeStart + 0.25), 0.04, duration);
    event.start = Math.min(safeStart, Math.max(0, safeEnd - 0.04));
    event.end = Math.max(event.start + 0.04, safeEnd);
    event.edited = true;
    return events.sort((left, right) => left.start - right.start);
  }

  function mergeWithNext(events, index) {
    if (!Array.isArray(events) || index < 0 || index >= events.length - 1) return events || [];
    const event = events[index];
    const next = events[index + 1];
    event.end = Math.max(event.end, next.end);
    event.edited = true;
    events.splice(index + 1, 1);
    return events;
  }

  function variableLength(value) {
    let buffer = Number(value) & 0x7f;
    const result = [];
    while ((value >>= 7)) buffer = (buffer << 8) | ((value & 0x7f) | 0x80);
    while (true) {
      result.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    return result;
  }

  function renderMidi(track, bpm = 120) {
    const ticksPerBeat = 480;
    const ticksPerSecond = ticksPerBeat * bpm / 60;
    const timeline = [];
    (track?.events || []).forEach(event => {
      const note = clamp(Math.round(event.midi), 0, 127);
      timeline.push({ tick: Math.round(Math.max(0, event.start) * ticksPerSecond), order: 1, bytes: [0x90, note, 96] });
      timeline.push({ tick: Math.round(Math.max(event.start + 0.04, event.end) * ticksPerSecond), order: 0, bytes: [0x80, note, 0] });
    });
    timeline.sort((left, right) => left.tick - right.tick || left.order - right.order);
    const tempo = Math.round(60000000 / bpm);
    const data = [0x00, 0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff];
    let previous = 0;
    timeline.forEach(item => {
      data.push(...variableLength(item.tick - previous), ...item.bytes);
      previous = item.tick;
    });
    data.push(0x00, 0xff, 0x2f, 0x00);
    const length = data.length;
    return new Uint8Array([
      0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff,
      0x4d, 0x54, 0x72, 0x6b, (length >>> 24) & 0xff, (length >>> 16) & 0xff, (length >>> 8) & 0xff, length & 0xff,
      ...data
    ]);
  }

  function frequencyToMidi(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) return null;
    return 69 + 12 * Math.log2(frequency / 440);
  }

  function estimatePitch(samples, sampleRate) {
    if (!samples?.length || !Number.isFinite(sampleRate)) return null;
    let rms = 0;
    for (let index = 0; index < samples.length; index += 1) rms += samples[index] * samples[index];
    rms = Math.sqrt(rms / samples.length);
    if (rms < 0.012) return null;
    const minimumLag = Math.max(2, Math.floor(sampleRate / 420));
    const maximumLag = Math.min(samples.length - 2, Math.ceil(sampleRate / 35));
    let bestLag = -1;
    let bestCorrelation = 0;
    const correlations = new Float32Array(maximumLag + 1);
    for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
      let sum = 0;
      let leftEnergy = 0;
      let rightEnergy = 0;
      const count = samples.length - lag;
      for (let index = 0; index < count; index += 2) {
        const left = samples[index];
        const right = samples[index + lag];
        sum += left * right;
        leftEnergy += left * left;
        rightEnergy += right * right;
      }
      const correlation = sum / Math.sqrt(leftEnergy * rightEnergy || 1);
      correlations[lag] = correlation;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }
    if (bestLag < 0 || bestCorrelation < 0.55) return null;
    const strongPeak = Math.max(0.72, bestCorrelation * 0.93);
    for (let lag = minimumLag + 1; lag < bestLag; lag += 1) {
      if (correlations[lag] >= strongPeak
        && correlations[lag] >= correlations[lag - 1]
        && correlations[lag] >= correlations[lag + 1]) {
        bestLag = lag;
        bestCorrelation = correlations[lag];
        break;
      }
    }
    const left = correlations[bestLag - 1] || bestCorrelation;
    const right = correlations[bestLag + 1] || bestCorrelation;
    const denominator = left - 2 * bestCorrelation + right;
    const offset = denominator ? 0.5 * (left - right) / denominator : 0;
    const frequency = sampleRate / (bestLag + clamp(offset, -1, 1));
    return { frequency, midi: frequencyToMidi(frequency), clarity: bestCorrelation, rms };
  }

  function assessPerformance(events, time, detectedMidi, timingWindow = 0.4) {
    if (!Array.isArray(events) || !events.length || !Number.isFinite(detectedMidi)) return null;
    const nearby = events
      .map((event, index) => ({ event, index, timing: time - event.start }))
      .filter(item => Math.abs(item.timing) <= timingWindow || (time >= item.event.start && time < item.event.end));
    const pitchMatches = nearby.filter(item => Math.abs(detectedMidi - item.event.midi) <= 0.55);
    const match = pitchMatches.sort((left, right) => Math.abs(left.timing) - Math.abs(right.timing))[0];
    if (match) {
      const timingStatus = match.timing < -0.08 ? 'early' : match.timing > 0.16 ? 'late' : 'onTime';
      return { ...match, correct: true, timingStatus, detectedMidi };
    }
    const expected = nearby.sort((left, right) => {
      const leftActive = time >= left.event.start && time < left.event.end ? 0 : 1;
      const rightActive = time >= right.event.start && time < right.event.end ? 0 : 1;
      return leftActive - rightActive || Math.abs(left.timing) - Math.abs(right.timing);
    })[0];
    return expected ? { ...expected, correct: false, timingStatus: 'wrong', detectedMidi } : null;
  }

  function formatTime(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  }

  function noteName(midi) {
    const value = Math.round(Number(midi));
    return `${NOTE_NAMES[((value % 12) + 12) % 12]}${Math.floor(value / 12) - 1}`;
  }

  function parseNote(value) {
    const match = String(value || '').trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);
    if (!match) return null;
    const pitchClass = PITCH[match[1].toUpperCase()] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
    return (Number(match[3]) + 1) * 12 + ((pitchClass % 12) + 12) % 12;
  }

  function fretPosition(fret, frets = 15) {
    if (fret <= 0) return 0;
    return (1 - Math.pow(2, -fret / 12)) / (1 - Math.pow(2, -frets / 12));
  }

  function candidatePositions(midi, open, maxFret = 15) {
    const value = Math.round(Number(midi));
    const result = [];
    open.forEach((openMidi, string) => {
      const fret = value - openMidi;
      if (fret >= 0 && fret <= maxFret) result.push({ string, fret, midi: value });
    });
    return result;
  }

  function positionMatchesMidi(event, open, maxFret = 24) {
    if (!event || !Number.isInteger(event.string) || !Number.isInteger(event.fret)) return false;
    if (event.string < 0 || event.string >= open.length || event.fret < 0 || event.fret > maxFret) return false;
    return open[event.string] + event.fret === Math.round(event.midi);
  }

  const pitchClass = midi => ((Math.round(midi) % 12) + 12) % 12;

  function octaveCandidates(rawMidi, minMidi = 23, maxMidi = 64) {
    const result = [];
    for (let shift = -36; shift <= 36; shift += 12) {
      const midi = Math.round(rawMidi) + shift;
      if (midi >= minMidi && midi <= maxMidi) result.push(midi);
    }
    return [...new Set(result)];
  }

  /**
   * Stabilizza gli errori d'ottava senza appiattire i veri salti d'ottava.
   * Le note ribattute ravvicinate preferiscono lo stesso registro; un salto
   * sostenuto da alta confidenza e da un respiro ritmico viene conservato.
   */
  function stabilizeOctaves(events, options = {}) {
    if (!Array.isArray(events) || !events.length) return [];
    const minMidi = options.minMidi ?? 23;
    const maxMidi = options.maxMidi ?? 64;
    const layers = events.map(event => octaveCandidates(event.midi, minMidi, maxMidi));
    const costs = [];
    const back = [];

    layers.forEach((candidates, index) => {
      costs[index] = new Array(candidates.length).fill(Infinity);
      back[index] = new Array(candidates.length).fill(-1);
      const raw = Math.round(events[index].midi);
      const confidence = clamp(Number(events[index].confidence) || 0.5, 0, 1);

      candidates.forEach((candidate, candidateIndex) => {
        const octaveDistance = Math.abs(candidate - raw) / 12;
        let observation = octaveDistance * (1.1 + confidence * 3.2)
          + Math.abs(candidate - 36) * 0.006;
        // Its octave was read from the whole note, and is not up for discussion: octaves
        // played in turn are a bass line, not a misreading to smooth away.
        if (events[index].sure && octaveDistance > 0) observation += 100;

        if (index === 0) {
          costs[index][candidateIndex] = observation;
          return;
        }

        const previousEvent = events[index - 1];
        const gap = Math.max(0, events[index].start - previousEvent.end);
        const onsetGap = Math.max(0, events[index].start - previousEvent.start);
        const rawJump = Math.abs(raw - Math.round(previousEvent.midi));
        const previousConfidence = clamp(Number(previousEvent.confidence) || 0.5, 0, 1);

        layers[index - 1].forEach((previous, previousIndex) => {
          const jump = Math.abs(candidate - previous);
          const repeatedClass = pitchClass(candidate) === pitchClass(previous);
          const quickRepeat = repeatedClass && onsetGap <= 0.72;
          let transition = Math.min(jump, 12) * 0.075 + Math.max(0, jump - 7) * 0.19;

          if (jump === 0) transition -= quickRepeat ? 0.95 : 0.25;
          if (quickRepeat && jump >= 12) {
            const strongRealJump = rawJump >= 11
              && Math.min(confidence, previousConfidence) >= 0.82
              && (gap >= 0.28 || onsetGap >= 0.9);
            transition += strongRealJump ? 0.45 : 5.2;
          }
          if (!repeatedClass && jump > 16) transition += (jump - 16) * 0.28;
          if (gap > 0.45) transition *= 0.68;

          const value = costs[index - 1][previousIndex] + observation + transition;
          if (value < costs[index][candidateIndex]) {
            costs[index][candidateIndex] = value;
            back[index][candidateIndex] = previousIndex;
          }
        });
      });
    });

    let cursor = 0;
    const lastCosts = costs.at(-1);
    lastCosts.forEach((value, index) => {
      if (value < lastCosts[cursor]) cursor = index;
    });

    const result = events.map(event => ({ ...event }));
    for (let index = result.length - 1; index >= 0; index -= 1) {
      result[index].rawMidi ??= Math.round(result[index].midi);
      result[index].midi = layers[index][cursor];
      cursor = back[index][cursor];
      if (cursor < 0 && index > 0) cursor = 0;
    }
    return result;
  }

  function transitionCost(previous, current, previousEvent, currentEvent) {
    if (previous.string === null || current.string === null) return 18;
    const fretMove = Math.abs(current.fret - previous.fret);
    const stringMove = Math.abs(current.string - previous.string);
    const pause = Math.max(0, currentEvent.start - previousEvent.end);
    const onsetGap = Math.max(0, currentEvent.start - previousEvent.start);
    const sameMidi = currentEvent.midi === previousEvent.midi;
    let cost = fretMove * 1.55 + stringMove * 2.3;
    if (fretMove > 5) cost += (fretMove - 5) * 1.75;
    if (stringMove > 2) cost += (stringMove - 2) * 1.4;
    if (sameMidi && current.string === previous.string && current.fret === previous.fret) {
      cost -= onsetGap <= 0.75 ? 3.2 : 1.4;
    }
    if (pause > 0.4) cost *= 0.62;
    return cost + current.fret * 0.02;
  }

  function positionCandidatesForEvent(event, open, maxFret) {
    const candidates = candidatePositions(event.midi, open, maxFret);
    if (event.lockedPosition && positionMatchesMidi(event, open, maxFret)) {
      return [{ string: event.string, fret: event.fret, midi: Math.round(event.midi), locked: true }];
    }
    return candidates.length ? candidates : [{ string: null, fret: null, midi: Math.round(event.midi) }];
  }

  /** Calcola una diteggiatura unica per tutta la frase. */
  function optimiseFingering(events, open, maxFret = 15) {
    if (!Array.isArray(events) || !events.length) return [];
    const source = events.map(event => ({ ...event, midi: Math.round(event.midi) }));
    const layers = source.map(event => positionCandidatesForEvent(event, open, maxFret));
    const costs = [];
    const back = [];

    layers.forEach((positions, index) => {
      costs[index] = new Array(positions.length).fill(Infinity);
      back[index] = new Array(positions.length).fill(-1);
      positions.forEach((position, candidateIndex) => {
        if (index === 0) {
          costs[index][candidateIndex] = position.string === null
            ? 40
            : position.fret * 0.11 + position.string * 0.06 - (position.locked ? 2 : 0);
          return;
        }
        layers[index - 1].forEach((previous, previousIndex) => {
          const value = costs[index - 1][previousIndex]
            + transitionCost(previous, position, source[index - 1], source[index])
            - (position.locked ? 2 : 0);
          if (value < costs[index][candidateIndex]) {
            costs[index][candidateIndex] = value;
            back[index][candidateIndex] = previousIndex;
          }
        });
      });
    });

    let cursor = 0;
    const lastCosts = costs.at(-1);
    lastCosts.forEach((value, index) => {
      if (value < lastCosts[cursor]) cursor = index;
    });

    const selected = new Array(source.length);
    for (let index = source.length - 1; index >= 0; index -= 1) {
      selected[index] = layers[index][cursor];
      cursor = back[index][cursor];
      if (cursor < 0 && index > 0) cursor = 0;
    }

    return source.map((event, index) => ({
      ...event,
      string: selected[index].string,
      fret: selected[index].fret,
      positionKey: selected[index].string === null ? null : `${selected[index].string}:${selected[index].fret}:${event.midi}`
    }));
  }

  function normalizeEvents(events, duration = 0) {
    const result = (events || [])
      .filter(event => Number.isFinite(event.start) && Number.isFinite(event.midi))
      .map((event, index) => ({
        id: event.id || `n-${index}-${Math.round(event.start * 1000)}`,
        start: Math.max(0, Number(event.start)),
        end: Math.max(Number(event.start) + 0.04, Number(event.end) || Number(event.start) + 0.25),
        midi: Math.round(event.midi),
        rawMidi: Number.isFinite(event.rawMidi) ? Math.round(event.rawMidi) : Math.round(event.midi),
        confidence: clamp(Number(event.confidence) || 0, 0, 1),
        string: Number.isInteger(event.string) ? event.string : null,
        fret: Number.isInteger(event.fret) ? event.fret : null,
        lockedPosition: Boolean(event.lockedPosition),
        edited: Boolean(event.edited),
        // set by the reader on a note whose octave it read from the whole note, clearly
        ...(event.sure ? { sure: true } : {})
      }))
      .sort((left, right) => left.start - right.start);

    result.forEach((event, index) => {
      const next = result[index + 1];
      if (next) event.end = Math.max(event.start + 0.04, Math.min(event.end, next.start));
      else if (duration) event.end = Math.min(duration, Math.max(event.start + 0.15, event.end));
    });
    return result;
  }

  function currentEventIndex(events, time, fallback = 0) {
    if (!events.length) return -1;
    let low = 0;
    let high = events.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const event = events[middle];
      if (time < event.start) high = middle - 1;
      else if (time >= event.end) low = middle + 1;
      else return middle;
    }
    return clamp(high >= 0 ? high : fallback, 0, events.length - 1);
  }

  /** Unica sorgente di verità per timeline, manico e pannello laterale. */
  function previewWindow(events, currentIndex, count = 3) {
    const index = clamp(currentIndex, 0, Math.max(0, events.length - 1));
    return {
      index,
      previous: index > 0 ? events[index - 1] : null,
      current: events[index] || null,
      upcoming: events.slice(index + 1, index + 1 + Math.max(0, count))
    };
  }

  /** One of the pieces that come with the app, as a track: its notes and chords as written, no recording yet. */
  function createDemoTrack(definition, tuning = '4', frets = DEFAULT_FRETS) {
    const events = definition.notes.map(([start, end, midi], index) => (
      { id: `${definition.id}-${index}`, start, end, midi, rawMidi: midi, confidence: 1 }
    ));
    return {
      id: definition.id,
      demo: true,
      title: definition.title,
      style: definition.style,
      bpm: definition.bpm,
      beats: definition.beats,
      duration: definition.duration,
      createdAt: 0,
      updatedAt: 0,
      analysisVersion: 2,
      settings: { tuning, frets, lookahead: 3, speed: 1, loopA: null, loopB: null },
      chords: definition.chords.map(([start, end, root, quality]) => ({ start, end, root, quality })),
      events: optimiseFingering(events, TUNINGS[tuning].open, frets)
    };
  }

  function renderTab(track, tuningKey = '4', columns = 16) {
    const tuning = TUNINGS[tuningKey] || TUNINGS['4'];
    const names = tuning.open.map(noteName).map(value => value.replace(/-?\d+$/, ''));
    const order = [...tuning.open.keys()].reverse();
    const lines = [];
    const events = track.events || [];
    for (let start = 0; start < events.length; start += columns) {
      const chunk = events.slice(start, start + columns);
      lines.push(`   ${chunk.map(event => noteName(event.midi).padEnd(4, ' ')).join('')}`.trimEnd());
      order.forEach(string => {
        let row = `${names[string].padEnd(2, ' ')}|`;
        chunk.forEach(event => {
          const value = event.string === string && event.fret !== null ? String(event.fret) : '';
          row += value.padStart(2, '-').padEnd(4, '-');
        });
        lines.push(`${row}|`);
      });
      lines.push('');
    }
    return `${track.title}\n${tuning.label}\n\n${lines.join('\n')}`;
  }

  root.ManicoCore = {
    VERSION, DEFAULT_FRETS, NOTE_NAMES, TUNINGS, DEMOS, clamp, formatTime, noteName, parseNote,
    fretPosition, candidatePositions, positionMatchesMidi, validLoopBounds, updateEventTiming,
    mergeWithNext, renderMidi, frequencyToMidi, estimatePitch, assessPerformance, stabilizeOctaves,
    optimiseFingering, normalizeEvents, currentEventIndex, previewWindow,
    createDemoTrack, renderTab
  };
})(globalThis);


(function initManicoStorage(root) {
  'use strict';

  const DB = 'manico-bass-transcriber';
  const STORE = 'tracks';
  let promise = null;
  const memory = new Map();

  const result = request => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function database() {
    if (typeof indexedDB === 'undefined') return null;
    if (promise) return promise;
    promise = new Promise(resolve => {
      let request;
      try { request = indexedDB.open(DB, 1); }
      catch (error) { resolve(null); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return promise;
  }

  async function save(track) {
    const copy = typeof structuredClone === 'function' ? structuredClone(track) : track;
    memory.set(copy.id, copy);
    const db = await database();
    if (!db) return copy;
    try { await result(db.transaction(STORE, 'readwrite').objectStore(STORE).put(copy)); }
    catch (error) { return copy; }
    return copy;
  }

  async function get(id) {
    const db = await database();
    if (!db) return memory.get(id) || null;
    try {
      const value = await result(db.transaction(STORE, 'readonly').objectStore(STORE).get(id));
      if (value) memory.set(value.id, value);
      return value || null;
    } catch (error) { return memory.get(id) || null; }
  }

  async function list() {
    const db = await database();
    let rows = [...memory.values()];
    if (db) {
      try { rows = await result(db.transaction(STORE, 'readonly').objectStore(STORE).getAll()); }
      catch (error) { /* memory fallback */ }
    }
    return rows.filter(track => !track.demo).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async function remove(id) {
    memory.delete(id);
    const db = await database();
    if (db) {
      try { await result(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)); }
      catch (error) { /* memory deletion already completed */ }
    }
  }

  async function persist() {
    try { return navigator.storage?.persist ? await navigator.storage.persist() : false; }
    catch (error) { return false; }
  }

  async function estimate() {
    try { return navigator.storage?.estimate ? await navigator.storage.estimate() : { usage: 0, quota: 0 }; }
    catch (error) { return { usage: 0, quota: 0 }; }
  }

  root.ManicoStorage = { save, get, list, remove, persist, estimate };
})(globalThis);


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


(function initManicoTranscriber(root) {
  'use strict';

  const Core = root.ManicoCore;
  const TARGET_RATE = 5512;

  function analysisOffsets(start, end) {
    const span = Math.max(0.055, Number(end) - Number(start));
    return [0.14, 0.34, 0.58, 0.8]
      .map(ratio => Math.min(span - 0.018, Math.max(0.012, span * ratio)))
      .filter((value, index, values) => value > 0 && (index === 0 || value - values[index - 1] >= 0.012));
  }

  function selectPitchVotes(votes) {
    if (!Array.isArray(votes) || !votes.length) return null;
    const groups = new Map();
    votes.forEach(vote => {
      const item = groups.get(vote.midi) || { midi: vote.midi, score: 0, count: 0 };
      item.score += vote.confidence;
      item.count += 1;
      groups.set(vote.midi, item);
    });
    return [...groups.values()]
      .map(item => ({ ...item, confidence: item.score / item.count, rank: item.count * 0.32 + item.score / item.count }))
      .sort((left, right) => right.rank - left.rank || right.confidence - left.confidence)[0];
  }

  function workerSource() {
    return `'use strict';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function percentile(values,ratio){if(!values.length)return 0;const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*ratio)))];}
function rms(signal,start,length){let sum=0;const end=Math.min(signal.length,start+length);for(let index=start;index<end;index++){const value=signal[index];sum+=value*value;}return Math.sqrt(sum/Math.max(1,end-start));}
function onsets(signal,sampleRate,sensitivity){const hop=Math.max(1,Math.round(sampleRate*.01)),windowSize=Math.max(hop*3,Math.round(sampleRate*.04)),energy=[];for(let position=0;position+windowSize<signal.length;position+=hop)energy.push(rms(signal,position,windowSize));const noise=percentile(energy,.32),strong=percentile(energy,.91),threshold=noise+(strong-noise)*(1-sensitivity)*.68,flux=energy.map((value,index)=>index<2?0:value-Math.max(energy[index-1],energy[index-2])),fluxThreshold=Math.max(.000003,percentile(flux.filter(value=>value>0),.64)*(1.05-sensitivity*.34)),minimumGap=Math.max(1,Math.round(.052*sampleRate/hop)),result=[];let last=-minimumGap;for(let index=2;index<energy.length-2;index++){const local=flux[index]>=flux[index-1]&&flux[index]>=flux[index+1];if(local&&energy[index]>threshold&&flux[index]>fluxThreshold&&index-last>=minimumGap){result.push(index*hop/sampleRate);last=index;}}if(!result.length||result[0]>.18)result.unshift(0);return result;}
function correlation(signal,start,size,lag){let xy=0,xx=0,yy=0;const end=Math.min(signal.length,start+size-lag);for(let index=start;index<end;index++){const left=signal[index],right=signal[index+lag];xy+=left*right;xx+=left*left;yy+=right*right;}return xy/(Math.sqrt(xx*yy)||1);}
function estimateWindow(signal,sampleRate,start,size){const minimumLag=Math.max(2,Math.floor(sampleRate/330)),maximumLag=Math.min(Math.floor(sampleRate/31),Math.floor(size/2));let bestLag=-1,bestScore=-1;const scores=new Float32Array(maximumLag+1);for(let lag=minimumLag;lag<=maximumLag;lag++){const score=correlation(signal,start,size,lag);scores[lag]=score;if(score>bestScore){bestScore=score;bestLag=lag;}}if(bestLag<0||bestScore<.47)return null;let chosen=bestLag;const strong=Math.max(.58,bestScore*.91);for(let lag=minimumLag+1;lag<bestLag;lag++){if(scores[lag]>=strong&&scores[lag]>=scores[lag-1]&&scores[lag]>=scores[lag+1]){chosen=lag;bestScore=scores[lag];break;}}const frequency=sampleRate/chosen,midi=Math.round(69+12*Math.log2(frequency/440));return midi>=23&&midi<=76?{midi,confidence:bestScore}:null;}
function offsets(start,end){const span=Math.max(.055,end-start);return[.14,.34,.58,.8].map(ratio=>Math.min(span-.018,Math.max(.012,span*ratio))).filter((value,index,values)=>value>0&&(index===0||value-values[index-1]>=.012));}
function selectVotes(votes){const groups=new Map();for(const vote of votes){const item=groups.get(vote.midi)||{midi:vote.midi,score:0,count:0};item.score+=vote.confidence;item.count++;groups.set(vote.midi,item);}let selected=null;for(const item of groups.values()){item.confidence=item.score/item.count;item.rank=item.count*.32+item.confidence;if(!selected||item.rank>selected.rank||item.rank===selected.rank&&item.confidence>selected.confidence)selected=item;}return selected;}
function pitch(signal,sampleRate,time,endTime){const votes=[];for(const offset of offsets(time,endTime)){const start=Math.max(0,Math.floor((time+offset)*sampleRate)),remaining=Math.max(0,endTime-time-offset-.006),size=Math.min(Math.round(sampleRate*.16),Math.round(remaining*sampleRate),signal.length-start);if(size<Math.round(sampleRate*.052))continue;const estimate=estimateWindow(signal,sampleRate,start,size);if(estimate)votes.push(estimate);}return votes.length?selectVotes(votes):null;}
// An isolated bass is read by the reader shared with the page and the tests (src/reader.js).
const Reader=(${root.ManicoReader.source})();
self.onmessage=message=>{const{signal,sampleRate,sensitivity,duration,isolated,mixSignal,lowest}=message.data;if(isolated){const floor=mixSignal?Reader.loudLevel(mixSignal,sampleRate)*.02:0;self.postMessage({type:'result',events:Reader.isolatedNotes(signal,sampleRate,sensitivity,floor,(lowest||28)-2,value=>self.postMessage({type:'progress',value}))});return;}const points=onsets(signal,sampleRate,sensitivity),events=[];for(let index=0;index<points.length;index++){const start=points[index],next=index+1<points.length?points[index+1]:Math.min(duration,start+.72),found=pitch(signal,sampleRate,start,next);if(found&&found.confidence>=.47)events.push({start,end:Math.max(start+.045,next),midi:found.midi,rawMidi:found.midi,confidence:clamp(found.confidence,0,1)});if(index%6===0)self.postMessage({type:'progress',value:(index+1)/points.length});}self.postMessage({type:'result',events});};`;
  }

  function createWorker() {
    const url = URL.createObjectURL(new Blob([workerSource()], { type: 'text/javascript' }));
    const instance = new Worker(url);
    instance.__url = url;
    return instance;
  }

  async function decode(file) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    try { return await context.decodeAudioData(await file.arrayBuffer()); }
    finally { await context.close(); }
  }

  async function prepare(buffer, onProgress = () => {}) {
    const ratio = buffer.sampleRate / TARGET_RATE;
    const length = Math.max(1, Math.floor(buffer.length / ratio));
    const output = new Float32Array(length);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
    const dt = 1 / buffer.sampleRate;
    const highPassRC = 1 / (2 * Math.PI * 30);
    const highPassAlpha = highPassRC / (highPassRC + dt);
    const lowPassAlpha = 1 - Math.exp(-2 * Math.PI * 360 / buffer.sampleRate);
    let highPass = 0;
    let previous = 0;
    let lowPass = 0;
    const chunk = 180000;

    for (let start = 0; start < length; start += chunk) {
      const end = Math.min(length, start + chunk);
      for (let outputIndex = start; outputIndex < end; outputIndex += 1) {
        const sourceStart = Math.floor(outputIndex * ratio);
        const sourceEnd = Math.max(sourceStart + 1, Math.floor((outputIndex + 1) * ratio));
        let sum = 0;
        let count = 0;
        for (let sourceIndex = sourceStart; sourceIndex < sourceEnd && sourceIndex < buffer.length; sourceIndex += 1) {
          let sample = 0;
          for (const channel of channels) sample += channel[sourceIndex] || 0;
          sample /= channels.length;
          highPass = highPassAlpha * (highPass + sample - previous);
          previous = sample;
          lowPass += lowPassAlpha * (highPass - lowPass);
          sum += lowPass;
          count += 1;
        }
        output[outputIndex] = count ? sum / count : 0;
      }
      onProgress(end / length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return { signal: output, sampleRate: TARGET_RATE };
  }

  /** Elimina solo doppi onset quasi identici, mai note ribattute musicali. */
  function dedupeEvents(events) {
    const result = [];
    for (const event of events) {
      const previous = result.at(-1);
      if (previous && event.start - previous.start < 0.045) {
        if (event.confidence > previous.confidence) result[result.length - 1] = { ...event };
      } else {
        result.push({ ...event });
      }
    }
    return result;
  }

  /**
   * Reads the notes of a recording. With `isolated` the recording is a bass on its own, and two
   * more things help: `mix`, the recording it was separated from, against which its level is
   * held (34 dB under it there is no bass, only what the separation left behind); and `lowest`,
   * the lowest open string of the instrument as a MIDI note, a tone under which nothing is read.
   */
  async function transcribe(buffer, options = {}) {
    const progress = options.onProgress || (() => {});
    const prepared = await prepare(buffer, value => progress(value * 0.22, 'prepare'));
    const against = options.isolated && options.mix ? (await prepare(options.mix)).signal : null;
    const instance = createWorker();

    return new Promise((resolve, reject) => {
      instance.onmessage = message => {
        if (message.data.type === 'progress') {
          progress(0.22 + message.data.value * 0.78, 'analyse');
          return;
        }
        if (message.data.type === 'result') {
          instance.terminate();
          URL.revokeObjectURL(instance.__url);
          const normalized = Core.normalizeEvents(dedupeEvents(message.data.events), buffer.duration);
          resolve(Core.stabilizeOctaves(normalized).map(({ sure, ...event }) => event));
        }
      };
      instance.onerror = error => {
        instance.terminate();
        URL.revokeObjectURL(instance.__url);
        reject(error);
      };
      instance.postMessage({
        signal: prepared.signal,
        sampleRate: prepared.sampleRate,
        sensitivity: Number.isFinite(options.sensitivity) ? options.sensitivity : 0.72,
        duration: buffer.duration,
        isolated: Boolean(options.isolated),
        mixSignal: against,
        lowest: Number.isFinite(options.lowest) ? options.lowest : 28
      }, against ? [prepared.signal.buffer, against.buffer] : [prepared.signal.buffer]);
    });
  }

  root.ManicoTranscriber = { decode, transcribe, prepare, dedupeEvents, analysisOffsets, selectPitchVotes, workerSource };
})(globalThis);


(function initManicoSeparator(root) {
  'use strict';

  // Optional engine built by tools/build-separator.js. When the folder is not deployed
  // (the single-file build, a plain checkout) Manico transcribes the full mix as before.
  const BASE = 'assets/separator/';
  const RATE = 44100;
  let availability = null;

  function available() {
    if (!availability) {
      const possible = typeof Worker !== 'undefined' && typeof fetch !== 'undefined'
        && typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
      availability = possible
        ? fetch(`${BASE}worker.js`, { method: 'HEAD' }).then(response => response.ok, () => false)
        : Promise.resolve(false);
    }
    return availability;
  }

  /** What the transcriber needs from an AudioBuffer, around one mono signal. */
  function bufferOf(signal, sampleRate) {
    return {
      sampleRate, length: signal.length, duration: signal.length / sampleRate,
      numberOfChannels: 1, getChannelData: () => signal
    };
  }

  /** The model was trained on 44.1 kHz stereo: decode straight to that, resampling if the browser would not. */
  async function decode(file) {
    const Context = window.AudioContext || window.webkitAudioContext;
    let context;
    try { context = new Context({ sampleRate: RATE }); }
    catch (error) { context = new Context(); }
    let buffer;
    try { buffer = await context.decodeAudioData(await file.arrayBuffer()); }
    finally { await context.close(); }
    if (buffer.sampleRate === RATE) return buffer;
    const offline = new OfflineAudioContext(2, Math.ceil(buffer.duration * RATE), RATE);
    const source = offline.createBufferSource();
    source.buffer = buffer;
    source.connect(offline.destination);
    source.start();
    return offline.startRendering();
  }

  /** Overall progress, 0..1, from the worker's stages: download, model start, passes, encoding. */
  function progressOf(data, seen) {
    if (data.stage === 'model') {
      seen.downloaded = true;
      return { stage: 'model', value: data.total ? 0.2 * data.loaded / data.total : 0.02, loaded: data.loaded, total: data.total };
    }
    const base = seen.downloaded ? 0.2 : 0;
    if (data.stage === 'start') return { stage: 'start', value: base + 0.02 };
    if (data.stage === 'separate') return { stage: 'separate', value: base + 0.03 + (0.9 - base) * data.step / data.total, step: data.step, total: data.total };
    return { stage: 'encode', value: 0.94 };
  }

  /**
   * Splits a decoded track. Returns {promise, cancel}; the promise gives the bass alone as a
   * buffer for the transcriber, and two MP3 blobs: everything but the bass, and the bass.
   */
  function separate(buffer, onProgress = () => {}) {
    const worker = new Worker(`${BASE}worker.js`);
    let settle;
    const promise = new Promise((resolve, reject) => {
      settle = reject;
      const seen = { downloaded: false };
      worker.onmessage = message => {
        const data = message.data;
        if (data.type === 'progress') { onProgress(progressOf(data, seen)); return; }
        worker.terminate();
        if (data.type !== 'done') { reject(new Error(data.message || 'SEPARATION_FAILED')); return; }
        resolve({
          bass: bufferOf(data.bass, data.sampleRate),
          backing: new Blob([data.backingMp3], { type: 'audio/mpeg' }),
          bassAudio: new Blob([data.bassMp3], { type: 'audio/mpeg' })
        });
      };
      worker.onerror = error => { worker.terminate(); reject(new Error(error.message || 'SEPARATION_FAILED')); };
      const left = buffer.getChannelData(0).slice();
      const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1).slice() : left.slice();
      worker.postMessage({
        left, right, sampleRate: buffer.sampleRate,
        modelUrl: new URL(`${BASE}htdemucs.onnx`, location.href).href
      }, [left.buffer, right.buffer]);
    });
    return { promise, cancel() { worker.terminate(); settle(new Error('CANCELLED')); } };
  }

  root.ManicoSeparator = { available, decode, separate, bufferOf, progressOf, RATE };
})(globalThis);


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
      return { ...rhythm, beats, downbeat: rhythm.downbeat * 2, odd: [] };
    }
    const start = rhythm.downbeat % 2;
    for (let index = start; index < rhythm.beats.length; index += 2) beats.push(rhythm.beats[index]);
    return { ...rhythm, beats, downbeat: Math.floor(rhythm.downbeat / 2) % rhythm.perBar, odd: [] };
  }

  /**
   * The pulse moved half a beat later: every beat where the "and" after it was. For when the
   * pulse was followed on the off-beats, which a shaker, a hi-hat or an off-beat guitar louder
   * than the beats will bring about.
   */
  function halfway(rhythm) {
    const beats = [];
    for (let index = 0; index + 1 < rhythm.beats.length; index += 1) {
      beats.push(Math.round((rhythm.beats[index] + rhythm.beats[index + 1]) * 500) / 1000);
    }
    const last = rhythm.beats.length - 1;
    if (last >= 1) beats.push(Math.round((rhythm.beats[last] + (rhythm.beats[last] - rhythm.beats[last - 1]) / 2) * 1000) / 1000);
    return { ...rhythm, beats };
  }

  // A bar can have a length of its own: a bar of two in a piece in four, after which every bar
  // line falls somewhere else. `odd` lists those bars, in order, as {bar, beats}; bars are
  // counted from 0.

  /** The number of beats in a bar. */
  function beatsIn(rhythm, bar) {
    for (const odd of rhythm.odd || []) if (odd.bar === bar) return odd.beats;
    return rhythm.perBar;
  }

  /** Where a bar starts, in beats from the first bar line. Bars before it, where a pickup falls, have the usual length. */
  function barStart(rhythm, bar) {
    let start = bar * rhythm.perBar;
    for (const odd of rhythm.odd || []) if (odd.bar < bar) start += odd.beats - rhythm.perBar;
    return start;
  }

  /** The bar a place falls in, the place being in beats from the first bar line. */
  function barAt(rhythm, beats) {
    if (beats < 0) return Math.floor(beats / rhythm.perBar);
    // from the bar it would be with no odd bars, a step or two either way finds the real one
    let bar = Math.floor(Math.floor(beats) / rhythm.perBar);
    while (barStart(rhythm, bar) > Math.floor(beats)) bar -= 1;
    while (barStart(rhythm, bar + 1) <= Math.floor(beats)) bar += 1;
    return bar;
  }

  /** The pulse with a bar given its own number of beats, or the usual number back. */
  function setBeatsIn(rhythm, bar, beats) {
    if (bar < 0 || beats < 1) return rhythm;
    const odd = (rhythm.odd || []).filter(item => item.bar !== bar);
    if (beats !== rhythm.perBar) odd.push({ bar, beats });
    odd.sort((left, right) => left.bar - right.bar);
    return { ...rhythm, odd };
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
    // the bar holding a sixteenth, where that bar starts and how long it is, in sixteenths
    const barOf = at => {
      const bar = barAt(rhythm, at / DIVISION);
      return { bar, start: barStart(rhythm, bar) * DIVISION, length: beatsIn(rhythm, bar) * DIVISION };
    };
    const push = (slot, length, extra) => {
      let at = slot;
      let first = true;
      while (at < slot + length) {
        const { bar, start, length: slots } = barOf(at);
        const inBar = at - start;
        const span = Math.min(slot + length - at, slots - inBar);
        for (const piece of splitValues(inBar, span, slots, Boolean(extra.rest))) {
          if (!bars.has(bar)) bars.set(bar, []);
          // `at` is its place in sixteenths from the first bar line, whatever the bars before it hold
          bars.get(bar).push({ ...extra, slot: piece.slot, value: piece.value, tied: !first && !extra.rest, barStart: piece.slot === 0, at: start + piece.slot });
          first = false;
        }
        at += span;
      }
    };
    let cursor = placed.length ? barOf(placed[0].slot).start : 0;
    for (const note of placed) {
      if (note.slot > cursor) push(cursor, note.slot - cursor, { rest: true });
      push(note.slot, note.slots, { index: note.index });
      cursor = note.slot + note.slots;
    }
    const end = barOf(cursor);
    if (cursor > end.start) push(cursor, end.start + end.length - cursor, { rest: true });
    return { bars, barSlots, placed };
  }

  root.ManicoRhythm = {
    FPS, DIVISION, fft, monoSignal, onsetEnvelope, estimateTempo, trackBeats, estimateDownbeat,
    analyse, steady, rescale, halfway, beatsIn, barStart, barAt, setBeatsIn, tempoOf, positionOf, timeOf, calibrate, quantize, splitValues, notate
  };
})(globalThis);


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


(function initManicoSheet(root) {
  'use strict';

  // Writes a part out for other programs and for paper: MusicXML, which Guitar Pro, MuseScore
  // and TuxGuitar open, and a PDF to print. Both are those of C_bass (internal/export).

  const Core = root.ManicoCore;
  const Rhythm = root.ManicoRhythm;
  const Chords = root.ManicoChords;
  const DIVISION = Rhythm.DIVISION;

  /**
   * The part laid out in bars, ready to be written one way or another: for each bar its number
   * (counted from 0, negative for a pickup), its length in beats, its symbols, the chords that
   * start in it with the sixteenth they start on, and the name of the section that starts with it.
   */
  function layout(track, rhythm) {
    const events = track.events || [];
    const { bars: written } = Rhythm.notate(rhythm, events);
    const shift = Rhythm.calibrate(rhythm, events);
    let first = 0;
    let last = 0;
    for (const bar of written.keys()) { first = Math.min(first, bar); last = Math.max(last, bar); }
    const harmony = new Map();
    for (const chord of track.chords || []) {
      const at = Math.round((Rhythm.positionOf(rhythm, chord.start) - shift) * DIVISION);
      const bar = Rhythm.barAt(rhythm, at / DIVISION);
      if (!harmony.has(bar)) harmony.set(bar, []);
      harmony.get(bar).push({ slot: at - Rhythm.barStart(rhythm, bar) * DIVISION, chord });
      first = Math.min(first, bar);
      last = Math.max(last, bar);
    }
    const starting = new Map();
    for (const section of track.sections || []) {
      const bar = Rhythm.barAt(rhythm, Rhythm.positionOf(rhythm, section.start + 0.01) - shift + 1e-6);
      starting.set(bar, section.name || section.kind);
      first = Math.min(first, bar);
      last = Math.max(last, bar);
    }
    const bars = [];
    for (let index = first; index <= last; index += 1) {
      const beats = Rhythm.beatsIn(rhythm, index);
      let symbols = written.get(index) || [];
      // a bar with nothing in it is a bar of rest
      if (!symbols.length) symbols = Rhythm.splitValues(0, beats * DIVISION, beats * DIVISION, true).map(piece => ({ slot: piece.slot, value: piece.value, rest: true }));
      const chords = (harmony.get(index) || []).sort((left, right) => left.slot - right.slot);
      bars.push({ index, beats, symbols, chords, section: starting.get(index) || '' });
    }
    return { bars, tuning: Core.TUNINGS[track.settings?.tuning] || Core.TUNINGS['4'], tempo: Rhythm.tempoOf(rhythm) };
  }

  /** Whether the note of a sign is carried on by the next sign. */
  function continues(bars, b, i) {
    const symbols = bars[b].symbols;
    const current = symbols[i];
    if (i + 1 < symbols.length) return Boolean(symbols[i + 1].tied) && symbols[i + 1].index === current.index;
    if (b + 1 < bars.length && bars[b + 1].symbols.length) {
      const next = bars[b + 1].symbols[0];
      return Boolean(next.tied) && next.index === current.index;
    }
    return false;
  }

  const VALUE_TYPES = { 16: ['whole', false], 12: ['half', true], 8: ['half', false], 6: ['quarter', true], 4: ['quarter', false], 3: ['eighth', true], 2: ['eighth', false], 1: ['16th', false] };
  const STEPS = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
  const FLATS = { 3: 'E', 8: 'A', 10: 'B' }; // chords are written Bb, Eb, Ab
  const KINDS = { '': 'major', m: 'minor', 7: 'dominant', m7: 'minor-seventh', maj7: 'major-seventh' };
  const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const playable = (event, strings) => Number.isInteger(event.string) && event.string >= 0 && event.string < strings;

  /** The part as a tablature staff with its chords, in MusicXML 4.0. */
  function musicXML(track, rhythm) {
    const part = layout(track, rhythm);
    const out = [];
    const w = line => out.push(line);
    w('<?xml version="1.0" encoding="UTF-8"?>');
    w('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">');
    w('<score-partwise version="4.0">');
    w(`  <work><work-title>${escape(track.title || '')}</work-title></work>`);
    w('  <identification><encoding><software>Manico</software></encoding></identification>');
    w('  <part-list><score-part id="P1"><part-name>Bass</part-name></score-part></part-list>');
    w('  <part id="P1">');
    const open = part.tuning.open;
    const strings = open.length;
    let beats = 0;
    part.bars.forEach((bar, b) => {
      w(bar.index < 0 ? '    <measure number="0" implicit="yes">' : `    <measure number="${bar.index + 1}">`);
      if (b === 0 || bar.beats !== beats) {
        w('      <attributes>');
        if (b === 0) {
          w(`        <divisions>${DIVISION}</divisions>`);
          w('        <key><fifths>0</fifths></key>');
        }
        w(`        <time><beats>${bar.beats}</beats><beat-type>4</beat-type></time>`);
        if (b === 0) {
          w('        <clef><sign>TAB</sign><line>5</line></clef>');
          w(`        <staff-details><staff-lines>${strings}</staff-lines>`);
          open.forEach((midi, line) => {
            const [step, alter] = STEPS[midi % 12];
            w(`          <staff-tuning line="${line + 1}"><tuning-step>${step}</tuning-step>${alter ? `<tuning-alter>${alter}</tuning-alter>` : ''}<tuning-octave>${Math.floor(midi / 12) - 1}</tuning-octave></staff-tuning>`);
          });
          w('        </staff-details>');
        }
        w('      </attributes>');
        beats = bar.beats;
      }
      if (b === 0) {
        const tempo = Math.round(part.tempo);
        w(`      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`);
      }
      if (bar.section) w(`      <direction placement="above"><direction-type><rehearsal>${escape(bar.section)}</rehearsal></direction-type></direction>`);
      for (const { slot, chord } of bar.chords) {
        const pitchClass = ((chord.root % 12) + 12) % 12;
        let [step, alter] = STEPS[pitchClass];
        if (FLATS[pitchClass]) { step = FLATS[pitchClass]; alter = -1; }
        w(`      <harmony><root><root-step>${step}</root-step>${alter ? `<root-alter>${alter}</root-alter>` : ''}</root><kind text="${chord.quality}">${KINDS[chord.quality] || 'major'}</kind>${slot > 0 ? `<offset>${slot}</offset>` : ''}</harmony>`);
      }
      bar.symbols.forEach((symbol, i) => {
        const [type, dotted] = VALUE_TYPES[symbol.value];
        const dot = dotted ? '<dot/>' : '';
        if (symbol.rest) {
          w(`      <note><rest/><duration>${symbol.value}</duration><voice>1</voice><type>${type}</type>${dot}</note>`);
          return;
        }
        const event = track.events[symbol.index];
        const [step, alter] = STEPS[((event.midi % 12) + 12) % 12];
        let ties = '';
        let tied = '';
        if (symbol.tied) { ties = '<tie type="stop"/>'; tied = '<tied type="stop"/>'; }
        if (continues(part.bars, b, i)) { ties += '<tie type="start"/>'; tied += '<tied type="start"/>'; }
        // MusicXML counts the strings from the highest
        const technical = playable(event, strings) ? `<technical><string>${strings - event.string}</string><fret>${event.fret}</fret></technical>` : '';
        const notations = tied || technical ? `<notations>${tied}${technical}</notations>` : '';
        w(`      <note><pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${Math.floor(event.midi / 12) - 1}</octave></pitch><duration>${symbol.value}</duration>${ties}<voice>1</voice><type>${type}</type>${dot}${notations}</note>`);
      });
      w('    </measure>');
    });
    w('  </part>');
    w('</score-partwise>');
    return `${out.join('\n')}\n`;
  }

  // --- PDF: pages of lines and text, in points from the top left corner of an A4 sheet ---

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 42;
  const n = value => value.toFixed(2);

  /** Text as the standard fonts understand it: Latin letters, accents included. */
  function encode(text) {
    let out = '';
    for (const char of String(text)) {
      const code = char.codePointAt(0);
      if (char === '(' || char === ')' || char === '\\') out += `\\${char}`;
      else if (code >= 32 && code < 127) out += char;
      else if (code >= 160 && code <= 255) out += `\\${code.toString(8).padStart(3, '0')}`;
      else if (char === '·') out += '\\267';
      else if (char === '–' || char === '—') out += '-';
      else if (char === '’' || char === '‘') out += "'";
      else out += '?';
    }
    return out;
  }

  /** The width of a line of text in Helvetica, near enough for placing it. */
  function widthOf(text, size) {
    let units = 0;
    for (const char of String(text)) {
      if (char >= '0' && char <= '9') units += 556;
      else if (char === '(' || char === ')' || char === ' ') units += 333;
      else units += 580;
    }
    return units * size / 1000;
  }

  function sheet() {
    const pages = [];
    let page = null;
    return {
      pages,
      newPage() { page = []; pages.push(page); },
      use(index) { page = pages[index]; },
      line(x0, y0, x1, y1, width, grey) { page.push(`${n(width)} w ${n(grey)} G ${n(x0)} ${n(PAGE_HEIGHT - y0)} m ${n(x1)} ${n(PAGE_HEIGHT - y1)} l S`); },
      fill(x, y, w, h, grey) { page.push(`${n(grey)} g ${n(x)} ${n(PAGE_HEIGHT - y - h)} ${n(w)} ${n(h)} re f`); },
      dot(x, y, r) { this.fill(x - r, y - r, 2 * r, 2 * r, 0); },
      // a shallow arc from one point to another, hanging below them: a tie
      curve(x0, x1, y, drop) {
        page.push(`0.6 w 0 G ${n(x0)} ${n(PAGE_HEIGHT - y)} m ${n(x0 + (x1 - x0) * 0.25)} ${n(PAGE_HEIGHT - y - drop)} ${n(x0 + (x1 - x0) * 0.75)} ${n(PAGE_HEIGHT - y - drop)} ${n(x1)} ${n(PAGE_HEIGHT - y)} c S`);
      },
      // align is -1 for starting at x, 0 for centred on it, 1 for ending there
      text(text, x, y, size, bold, grey, align) {
        let at = x;
        if (align === 0) at -= widthOf(text, size) / 2;
        else if (align === 1) at -= widthOf(text, size);
        page.push(`BT ${n(grey)} g /${bold ? 'F2' : 'F1'} ${size.toFixed(1)} Tf ${n(at)} ${n(PAGE_HEIGHT - y)} Td (${encode(text)}) Tj ET`);
      },
      /** The pages put together as a PDF file: every character of it is one byte. */
      bytes() {
        let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
        const offsets = [];
        const object = body => { offsets.push(out.length); out += `${offsets.length} 0 obj\n${body}\nendobj\n`; };
        object('<< /Type /Catalog /Pages 2 0 R >>');
        object(`<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + 2 * i} 0 R`).join(' ')}] /Count ${pages.length} >>`);
        object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        pages.forEach((content, i) => {
          object(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`);
          const stream = `${content.join('\n')}\n`;
          object(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
        });
        const start = out.length;
        out += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
        for (const offset of offsets) out += `${String(offset).padStart(10, '0')} 00000 n \n`;
        out += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
        return Uint8Array.from(out, char => char.charCodeAt(0) & 0xff);
      }
    };
  }

  /** The part on A4 paper: the tablature, the value of every note under it, the chords above, a few bars to a line. */
  function pdf(track, rhythm) {
    const part = layout(track, rhythm);
    const open = part.tuning.open;
    const strings = open.length;
    const names = open.map(midi => Core.noteName(midi).replace(/-?\d+$/, ''));
    const gutter = 20; // for the names of the strings
    const slot = 6.6; // a sixteenth
    const padding = 9; // from a bar line to the first note of its bar
    const spacing = 9; // between two strings
    const above = 20; // for chords and bar numbers
    const below = 30; // for the values
    const between = 16;
    const usable = PAGE_WIDTH - 2 * MARGIN - gutter;
    const fretSize = 8.5;
    const staff = (strings - 1) * spacing;
    const system = above + staff + below + between;
    const natural = bar => bar.beats * DIVISION * slot + padding;

    const s = sheet();
    s.newPage();
    s.text(track.title || '', MARGIN, MARGIN + 14, 18, true, 0, -1);
    s.text(`${names.join(' ')}  ·  ${Math.round(part.tempo)} BPM`, MARGIN, MARGIN + 30, 10, false, 0.35, -1);
    let y = MARGIN + 52;
    for (let from = 0; from < part.bars.length;) {
      // as many bars as fit on the line
      let to = from;
      let used = 0;
      while (to < part.bars.length && (to === from || used + natural(part.bars[to]) <= usable)) { used += natural(part.bars[to]); to += 1; }
      let stretch = usable / used;
      if (to === part.bars.length && stretch > 1.6) stretch = 1; // a short last line is left short
      if (y + system - between > PAGE_HEIGHT - MARGIN - 14) { s.newPage(); y = MARGIN; }
      const top = y + above;
      let x = MARGIN + gutter;
      for (let string = 0; string < strings; string += 1) {
        const lineY = top + staff - string * spacing;
        s.line(x, lineY, x + used * stretch, lineY, 0.5, 0.55);
        s.text(names[string], MARGIN + gutter - 6, lineY + 2.6, 7.5, false, 0.35, 1);
      }
      s.line(x, top, x, top + staff, 0.9, 0);
      for (let b = from; b < to; b += 1) {
        const bar = part.bars[b];
        const start = x;
        const at = slotInBar => start + (padding + slotInBar * slot) * stretch;
        if (bar.index >= 0) s.text(String(bar.index + 1), x + 2, top - 2.5, 6, false, 0.45, -1);
        let after = x + 12;
        if (b > 0 && bar.beats !== part.bars[b - 1].beats) { // the metre changes here: say so
          s.text(`${bar.beats}/4`, after, top - 2.5, 6, true, 0.2, -1);
          after += 14;
        }
        if (bar.section) s.text(bar.section.toUpperCase(), after, top - 2.5, 6.5, true, 0, -1);
        for (const { slot: place, chord } of bar.chords) s.text(Chords.nameOf(chord), at(place) - 3, top - 10, 9.5, true, 0, -1);
        const bottom = top + staff;
        const stemTop = bottom + 7;
        const stemBottom = bottom + 21;
        const short = v => !v.rest && v.value < DIVISION;
        const joined = (a, c) => short(a) && short(c) && Math.floor(a.slot / DIVISION) === Math.floor(c.slot / DIVISION) && a.slot + a.value === c.slot;
        bar.symbols.forEach((symbol, i) => {
          if (symbol.rest) return;
          const sx = at(symbol.slot);
          const event = track.events[symbol.index];
          if (playable(event, strings) && (!symbol.tied || symbol.slot === 0)) {
            const label = symbol.tied ? `(${event.fret})` : String(event.fret);
            const lineY = top + staff - event.string * spacing;
            const half = widthOf(label, fretSize) / 2 + 1;
            s.fill(sx - half, lineY - 4.5, 2 * half, 9, 1);
            s.text(label, sx, lineY + 3, fretSize, true, 0, 0);
          }
          // the value: a stem, shorter for a half note, none for a whole one
          if (symbol.tied && i > 0) s.curve(at(bar.symbols[i - 1].slot) + 1, sx - 1, stemBottom + 3, 3.5);
          if (symbol.value >= 16) return;
          if (symbol.value >= 8) s.line(sx, stemTop + 7, sx, stemBottom, 0.8, 0);
          else s.line(sx, stemTop, sx, stemBottom, 0.8, 0);
          if (symbol.value % 3 === 0) s.dot(sx + 3, stemTop + 4, 0.9);
          if (symbol.value >= DIVISION) return;
          const before = i > 0 && joined(bar.symbols[i - 1], symbol);
          const next = i + 1 < bar.symbols.length && joined(symbol, bar.symbols[i + 1]);
          const sixteenth = symbol.value === 1;
          if (next) {
            const nx = at(bar.symbols[i + 1].slot);
            s.fill(sx - 0.4, stemBottom - 1.8, nx - sx + 0.8, 1.8, 0);
            if (sixteenth && bar.symbols[i + 1].value === 1) s.fill(sx - 0.4, stemBottom - 5.2, nx - sx + 0.8, 1.8, 0);
            else if (sixteenth && !before) s.fill(sx, stemBottom - 5.2, 4.5, 1.8, 0);
          } else if (before) {
            if (sixteenth && bar.symbols[i - 1].value !== 1) s.fill(sx - 4.5, stemBottom - 5.2, 4.5, 1.8, 0);
          } else {
            s.line(sx, stemBottom, sx + 4, stemBottom - 5, 1, 0);
            if (sixteenth) s.line(sx, stemBottom - 3.5, sx + 4, stemBottom - 8.5, 1, 0);
          }
        });
        x += natural(bar) * stretch;
        s.line(x, top, x, top + staff, 0.9, 0);
      }
      y += system;
      from = to;
    }
    s.pages.forEach((_, i) => {
      s.use(i);
      s.text('Manico', MARGIN, PAGE_HEIGHT - MARGIN + 14, 7, false, 0.5, -1);
      s.text(`${i + 1} / ${s.pages.length}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - MARGIN + 14, 7, false, 0.5, 1);
    });
    return s.bytes();
  }

  root.ManicoSheet = { layout, musicXML, pdf };
})(globalThis);


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


(function initManicoApp(root) {
  'use strict';

  const Core = root.ManicoCore;
  // The version of the reader of notes: tracks read by an earlier one are read again when opened.
  const READER = 4;
  const Store = root.ManicoStorage;
  const Transcriber = root.ManicoTranscriber;
  const Separator = root.ManicoSeparator;
  const Chords = root.ManicoChords;
  const Sheet = root.ManicoSheet;
  const Pitch = root.ManicoPitch;
  if (!Core || !Store || !Transcriber || !Separator || !root.ManicoRhythm || !Chords || !Sheet || !Pitch) throw new Error('Manico modules missing');

  const $ = id => document.getElementById(id);
  const audio = $('audio');

  const COPY = {
    it: {
      product: 'Bass Transcriber', sister: 'Bass Chord Lab: accordi sulla tastiera', import: 'Importa audio', eyebrow: 'Dal brano alle dita',
      library: 'Torna ai brani', trackTitle: 'Titolo del brano', transcribedNotes: 'Tablatura con battute e valori ritmici: scorre a tempo con il brano', fretboard: 'Manico del basso',
      positionLabel: 'Posizione nel brano', help: 'Aiuto', source: 'Codice su GitHub',
      heroTitle: 'Ascolta. Trascrivi. Suona.',
      heroText: 'Importa una registrazione, ricava la linea di basso e studiala sul manico. Audio, trascrizione e correzioni restano sul tuo dispositivo.',
      privacy: 'Nessun upload. Tutto avviene nel browser.', dropTitle: 'Porta qui il tuo brano',
      dropText: 'MP3, WAV, M4A, AAC, OGG o FLAC', choose: 'Scegli un file',
      yourTracks: 'I tuoi brani', yourTracksHint: 'Riapri una trascrizione e continua da dove eri rimasto.',
      examples: 'Brani inclusi', examplesHint: 'Cinque brani suonati dal programma, con basso, batteria e accordi: per provare tutto senza importare nulla.',
      loadingPiece: 'Carico la registrazione…',
      empty: 'Non hai ancora importato brani.', open: 'Apri', remove: 'Elimina',
      confirmDelete: 'Eliminare questo brano e il suo audio?', notes: 'note', storage: 'Spazio locale',
      unavailable: 'non disponibile', saved: 'Salvato sul dispositivo', demo: 'Brano incluso',
      previous: 'precedente', current: 'adesso', upcoming: 'in arrivo', now: 'Adesso',
      playAlong: 'Suona con me', micStart: 'Avvia microfono', micStop: 'Ferma microfono',
      micReady: 'Usa cuffie per evitare che il brano rientri nel microfono.', micListening: 'In ascolto… suona la nota evidenziata.',
      micDenied: 'Microfono non disponibile o permesso negato.', detected: 'Rilevata', score: 'Punteggio',
      onTime: 'in tempo', early: 'in anticipo', late: 'in ritardo', wrong: 'nota errata',
      nextNotes: 'Prossime note', study: 'Studio', tuning: 'Accordatura', frets: 'Tasti',
      lookahead: 'Note in anticipo', speed: 'Velocità', loop: 'Loop', setA: 'Imposta A',
      setB: 'Imposta B', clearLoop: 'Azzera', noLoop: 'nessun loop', correction: 'Correggi la nota',
      semitoneDown: '− semitono', semitoneUp: '+ semitono', deleteNote: 'Elimina nota',
      splitNote: 'Dividi nota', mergeNote: 'Unisci alla successiva', addNote: 'Aggiungi al cursore',
      noteStart: 'Inizio (s)', noteEnd: 'Fine (s)', export: 'Esporta', exportTab: 'Scarica TAB', exportMidi: 'Scarica MIDI',
      exportProject: 'Scarica progetto', confidence: 'confidenza', string: 'corda', fret: 'tasto',
      position: 'Posizione', automatic: 'Automatica', locked: 'bloccata', notPlayable: 'fuori manico',
      analyseTitle: 'Trascrivi la linea di basso',
      analyseHint: 'Il file resta sul dispositivo. La trascrizione è una stima e può essere corretta dopo l’importazione.',
      sensitivity: 'Sensibilità agli attacchi', startAnalysis: 'Trascrivi e salva', cancel: 'Annulla',
      preparing: 'Preparazione del segnale…', analysing: 'Riconoscimento delle note…',
      decoding: 'Decodifica dell’audio…', saving: 'Salvataggio locale…',
      failed: 'Non sono riuscito a trascrivere questo file.',
      noNotes: 'Non ho trovato note affidabili. Prova con una sensibilità più alta o con un mix dove il basso è più presente.',
      noBass: 'In questo brano non ho trovato un basso: forse è una base per suonarci sopra.',
      reread: 'Note rilette con il lettore nuovo',
      persistentYes: 'archiviazione persistente', persistentNo: 'il browser può liberare spazio automaticamente',
      importedLine: 'Linea di basso trascritta', isolatedLine: 'Trascritta dal basso isolato',
      isolate: 'Isola il basso con l’AI (consigliato)',
      isolateHint: 'Separa il basso dal resto del brano, qui nel browser: la trascrizione è molto più precisa e puoi ascoltare il brano senza basso. La prima volta scarica un modello di 174 MB; un brano richiede qualche minuto.',
      isolateTitle: 'Isola il basso', isolateStart: 'Isola il basso',
      isolateExisting: 'Isola il basso (AI)',
      isolateExistingHint: 'Per ascoltare il brano senza basso o il basso da solo.',
      retranscribe: 'Ritrascrivi dal basso isolato',
      retranscribeHint: 'Sostituisce le note attuali, comprese le correzioni fatte a mano.',
      retranscribeTitle: 'Ritrascrivi la linea di basso', retranscribeStart: 'Ritrascrivi',
      retranscribeTrack: 'Ritrascrivi le note', retranscribeTrackHint: 'Rilegge le note dal brano, con la sensibilità che scegli. Sostituisce le correzioni fatte a mano.',
      findingBeat: 'Cerco il tempo e le battute…', bars: 'Battute',
      barEarlier: '◀ Battuta', barLater: 'Battuta ▶', tempoHalf: 'Tempo ÷2', tempoDouble: 'Tempo ×2',
      barsHint: 'Se le stanghette cadono nel punto sbagliato, spostale di un beat; se i valori sembrano il doppio o la metà, cambia il tempo; se tutto cade tra un beat e l’altro, +½.',
      offBeat: '+½ beat', thisBar: 'Questa battuta', barFewer: '− un beat', barMore: '+ un beat', bar: 'battuta',
      key: 'Tonalità', keyOriginal: 'originale', keyReset: 'Originale', semitone: 'semitono', semitonesMany: 'semitoni',
      changingKey: 'Cambio la tonalità…', keyFailed: 'Non sono riuscito a cambiare tonalità su questo dispositivo.',
      countIn: 'Conta una battuta prima di partire', metronome: 'Metronomo sul brano',
      chords: 'Accordi e sezioni', chordHere: 'Accordo qui', chordKind: 'Cambia tipo', chordAdd: 'Nuovo da qui',
      chordRemove: 'Togli accordo', chordsRead: 'Rileggi tutti', noChord: 'nessuno',
      chordsHint: 'Gli accordi sono una stima letta dal brano senza il basso: correggili qui. Per leggerli serve il basso isolato.',
      readingChords: 'Leggo gli accordi…', chordsDone: 'Accordi letti', chordsFailed: 'Non sono riuscito a leggere gli accordi.',
      sections: 'Sezione', sectionAdd: 'Inizia qui', sectionKind: 'Cambia nome', sectionLoop: 'Ripeti', sectionRemove: 'Togli',
      noSection: 'nessuna', fromBar: 'da battuta',
      kind_intro: 'Intro', kind_verse: 'Strofa', kind_prechorus: 'Pre-ritornello', kind_chorus: 'Ritornello',
      kind_bridge: 'Ponte', kind_solo: 'Solo', kind_outro: 'Finale',
      exportPdf: 'Scarica PDF', exportXml: 'Scarica MusicXML',
      modelDownload: 'Scarico il modello', modelStart: 'Avvio del modello…', separating: 'Separazione del basso',
      encoding: 'Preparo le tracce da ascoltare…',
      separationFailed: 'Non sono riuscito a isolare il basso su questo dispositivo.',
      separationSkipped: 'Basso non isolato: trascritto dal brano intero',
      listen: 'Ascolto', listenMix: 'Brano', listenBacking: 'Senza basso', listenBass: 'Solo basso',
      keys: 'Spazio: play/pausa · frecce: nota precedente/successiva · [ A · ] B',
      audioMissing: 'L’audio salvato non è più disponibile, ma la trascrizione è rimasta.',
      migrated: 'Ottave e posizioni riallineate', version: `Versione ${Core.VERSION}`
    },
    en: {
      product: 'Bass Transcriber', sister: 'Bass Chord Lab: chords on the fretboard', import: 'Import audio', eyebrow: 'From the track to your fingers',
      library: 'Back to your tracks', trackTitle: 'Track title', transcribedNotes: 'Tablature with bars and note values: scrolls in time with the track', fretboard: 'Bass fretboard',
      positionLabel: 'Position in the track', help: 'Help', source: 'Source on GitHub',
      heroTitle: 'Listen. Transcribe. Play.',
      heroText: 'Import a recording, extract the bass line and practise it on the fretboard. Audio, transcription and corrections stay on your device.',
      privacy: 'No upload. Everything happens in your browser.', dropTitle: 'Drop your track here',
      dropText: 'MP3, WAV, M4A, AAC, OGG or FLAC', choose: 'Choose a file',
      yourTracks: 'Your tracks', yourTracksHint: 'Reopen a transcription and continue where you left off.',
      examples: 'Included pieces', examplesHint: 'Five pieces played by the program, with bass, drums and chords: to try everything without importing anything.',
      loadingPiece: 'Loading the recording…',
      empty: 'You have not imported a track yet.', open: 'Open', remove: 'Delete',
      confirmDelete: 'Delete this track and its stored audio?', notes: 'notes', storage: 'Local storage',
      unavailable: 'unavailable', saved: 'Saved on device', demo: 'Included piece',
      previous: 'previous', current: 'now', upcoming: 'coming next', now: 'Now',
      playAlong: 'Play along', micStart: 'Start microphone', micStop: 'Stop microphone',
      micReady: 'Use headphones to keep the track out of the microphone.', micListening: 'Listening… play the highlighted note.',
      micDenied: 'Microphone unavailable or permission denied.', detected: 'Detected', score: 'Score',
      onTime: 'on time', early: 'early', late: 'late', wrong: 'wrong note',
      nextNotes: 'Next notes', study: 'Practice', tuning: 'Tuning', frets: 'Frets',
      lookahead: 'Look-ahead notes', speed: 'Speed', loop: 'Loop', setA: 'Set A',
      setB: 'Set B', clearLoop: 'Clear', noLoop: 'no loop', correction: 'Correct note',
      semitoneDown: '− semitone', semitoneUp: '+ semitone', deleteNote: 'Delete note',
      splitNote: 'Split note', mergeNote: 'Merge with next', addNote: 'Add at cursor',
      noteStart: 'Start (s)', noteEnd: 'End (s)', export: 'Export', exportTab: 'Download TAB', exportMidi: 'Download MIDI',
      exportProject: 'Download project', confidence: 'confidence', string: 'string', fret: 'fret',
      position: 'Position', automatic: 'Automatic', locked: 'locked', notPlayable: 'outside fretboard',
      analyseTitle: 'Transcribe the bass line',
      analyseHint: 'The file stays on your device. The transcription is an estimate and can be corrected after import.',
      sensitivity: 'Attack sensitivity', startAnalysis: 'Transcribe and save', cancel: 'Cancel',
      preparing: 'Preparing the signal…', analysing: 'Recognising notes…', decoding: 'Decoding audio…',
      saving: 'Saving locally…', failed: 'This file could not be transcribed.',
      noNotes: 'No reliable notes were found. Try a higher sensitivity or a mix with a more prominent bass.',
      noBass: 'No bass was found in this recording: it may be a backing track to play over.',
      reread: 'Notes read again with the new reader',
      persistentYes: 'persistent storage', persistentNo: 'the browser may reclaim storage automatically',
      importedLine: 'Transcribed bass line', isolatedLine: 'Transcribed from the isolated bass',
      isolate: 'Isolate the bass with AI (recommended)',
      isolateHint: 'Separates the bass from the rest of the track, here in the browser: the transcription is far more accurate and you can listen to the track without bass. The first time it downloads a 174 MB model; a track takes a few minutes.',
      isolateTitle: 'Isolate the bass', isolateStart: 'Isolate the bass',
      isolateExisting: 'Isolate the bass (AI)',
      isolateExistingHint: 'To listen to the track without bass, or to the bass alone.',
      retranscribe: 'Transcribe again from the isolated bass',
      retranscribeHint: 'Replaces the current notes, including corrections made by hand.',
      retranscribeTitle: 'Transcribe the bass line again', retranscribeStart: 'Transcribe again',
      retranscribeTrack: 'Transcribe the notes again', retranscribeTrackHint: 'Reads the notes from the track again, with the sensitivity you choose. Replaces corrections made by hand.',
      findingBeat: 'Finding the tempo and the bars…', bars: 'Bars',
      barEarlier: '◀ Bar line', barLater: 'Bar line ▶', tempoHalf: 'Tempo ÷2', tempoDouble: 'Tempo ×2',
      barsHint: 'If the bar lines fall in the wrong place, move them by a beat; if the note values look doubled or halved, change the tempo; if everything falls between the beats, +½.',
      offBeat: '+½ beat', thisBar: 'This bar', barFewer: '− one beat', barMore: '+ one beat', bar: 'bar',
      key: 'Key', keyOriginal: 'original', keyReset: 'Original', semitone: 'semitone', semitonesMany: 'semitones',
      changingKey: 'Changing the key…', keyFailed: 'The key could not be changed on this device.',
      countIn: 'Count one bar in before starting', metronome: 'Metronome over the track',
      chords: 'Chords and sections', chordHere: 'Chord here', chordKind: 'Change kind', chordAdd: 'New from here',
      chordRemove: 'Remove chord', chordsRead: 'Read all again', noChord: 'none',
      chordsHint: 'The chords are an estimate read from the track without its bass: correct them here. Reading them needs the isolated bass.',
      readingChords: 'Reading the chords…', chordsDone: 'Chords read', chordsFailed: 'The chords could not be read.',
      sections: 'Section', sectionAdd: 'Start here', sectionKind: 'Rename', sectionLoop: 'Repeat', sectionRemove: 'Remove',
      noSection: 'none', fromBar: 'from bar',
      kind_intro: 'Intro', kind_verse: 'Verse', kind_prechorus: 'Pre-chorus', kind_chorus: 'Chorus',
      kind_bridge: 'Bridge', kind_solo: 'Solo', kind_outro: 'Outro',
      exportPdf: 'Download PDF', exportXml: 'Download MusicXML',
      modelDownload: 'Downloading the model', modelStart: 'Starting the model…', separating: 'Separating the bass',
      encoding: 'Preparing the tracks to listen to…',
      separationFailed: 'The bass could not be isolated on this device.',
      separationSkipped: 'Bass not isolated: transcribed from the full track',
      listen: 'Listen to', listenMix: 'Track', listenBacking: 'No bass', listenBass: 'Bass only',
      keys: 'Space: play/pause · arrows: previous/next note · [ A · ] B',
      audioMissing: 'The stored audio is no longer available, but the transcription remains.',
      migrated: 'Octaves and positions realigned', version: `Version ${Core.VERSION}`
    }
  };

  const state = {
    lang: 'it', tracks: [], track: null, currentIndex: 0, pendingFile: null,
    cancelled: false, audioUrl: null, playing: false, animation: 0,
    demoTimer: 0, demoClock: 0, saveTimer: 0, persistent: false, synth: null, mic: null,
    separable: false, job: null, pendingTrack: null, pendingMode: 'import', listen: 'mix', switching: false,
    // how many times shorter than the track the audio being played is: not 1 when the key was changed
    stretch: 1, loading: 0, keyCache: null, counting: false, countTimer: 0, priming: false,
    nextClick: null, clickedAt: 0, origin: 0, where: '', countIn: false, metronome: false
  };

  const SECTION_KINDS = ['intro', 'verse', 'prechorus', 'chorus', 'bridge', 'solo', 'outro'];
  /** An exercise with no recording: its notes are played one by one, on a clock of its own. */
  const synthetic = track => Boolean(track?.demo && !track.audioBlob);

  const t = key => COPY[state.lang][key] ?? key;

  function readLanguage() {
    try {
      const saved = localStorage.getItem('manico-language');
      if (saved === 'en' || saved === 'it') return saved;
    } catch (error) {}
    return (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'it';
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = t(element.dataset.i18n);
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
      if (element.hasAttribute('title')) element.title = t(element.dataset.i18nAria);
    });
    $('langIt').classList.toggle('on', state.lang === 'it');
    $('langEn').classList.toggle('on', state.lang === 'en');
    $('helpLink').href = state.lang === 'en' ? 'help-en.html' : 'help-it.html';
    $('helpLink').title = t('help');
    $('helpLink').setAttribute('aria-label', $('helpLink').title);
    $('versionLabel').textContent = t('version');
    renderHome();
    if (state.track) renderStudio(true);
  }

  function setLanguage(language) {
    state.lang = language;
    try { localStorage.setItem('manico-language', language); } catch (error) {}
    applyLanguage();
  }

  function show(view) {
    $('homeView').hidden = view !== 'home';
    $('studioView').hidden = view !== 'studio';
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }

  function bytes(value) {
    if (!value) return '0 MB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let amount = value;
    let index = 0;
    while (amount >= 1024 && index < units.length - 1) { amount /= 1024; index += 1; }
    return `${amount.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
  }

  async function refreshStorage() {
    const estimate = await Store.estimate();
    const suffix = state.persistent ? t('persistentYes') : t('persistentNo');
    $('storageLabel').textContent = estimate.quota
      ? `${t('storage')}: ${bytes(estimate.usage)} / ${bytes(estimate.quota)} · ${suffix}`
      : `${t('storage')}: ${t('unavailable')} · ${suffix}`;
  }

  function tuning() {
    return Core.TUNINGS[state.track?.settings?.tuning || '4'] || Core.TUNINGS['4'];
  }

  function stringName(index) {
    return index !== null && tuning().open[index] !== undefined
      ? Core.noteName(tuning().open[index]).replace(/-?\d+$/, '')
      : '?';
  }

  function safeName(value) {
    return String(value || 'bass-line').trim().replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'bass-line';
  }

  function download(name, text, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function trackCard(track) {
    const article = document.createElement('article');
    article.className = 'track-card';
    const cover = document.createElement('div');
    cover.className = 'cover';
    cover.textContent = track.demo
      ? track.style.slice(0, 2).toUpperCase()
      : (track.filename || '').match(/\.([a-z0-9]{2,4})$/i)?.[1].toUpperCase() || 'AUDIO';
    const info = document.createElement('div');
    const title = document.createElement('h3');
    const meta = document.createElement('div');
    title.textContent = track.title;
    meta.className = 'meta';
    meta.textContent = `${track.events?.length || 0} ${t('notes')} · ${Core.formatTime(track.duration)}${track.demo ? ` · ${Math.round(track.bpm)} BPM` : ''}`;
    info.append(title, meta);
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const open = document.createElement('button');
    open.className = 'icon-button';
    open.textContent = '▶';
    open.title = t('open');
    open.onclick = () => openTrack(track.id, Boolean(track.demo));
    actions.append(open);
    if (!track.demo) {
      const remove = document.createElement('button');
      remove.className = 'icon-button danger';
      remove.textContent = '×';
      remove.title = t('remove');
      remove.onclick = async event => {
        event.stopPropagation();
        if (!confirm(t('confirmDelete'))) return;
        await Store.remove(track.id);
        await loadLibrary();
        await refreshStorage();
      };
      actions.append(remove);
    }
    article.append(cover, info, actions);
    return article;
  }

  function renderHome() {
    const list = $('trackList');
    if (!list) return;
    list.replaceChildren();
    if (!state.tracks.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-card';
      empty.textContent = t('empty');
      list.append(empty);
    } else {
      state.tracks.forEach(track => list.append(trackCard(track)));
    }
    const demos = $('demoList');
    demos.replaceChildren();
    Core.DEMOS.forEach(definition => demos.append(trackCard(Core.createDemoTrack(definition))));
  }

  async function loadLibrary() {
    state.tracks = await Store.list();
    renderHome();
  }

  function stopAudio() {
    stopMicrophone(true);
    cancelAnimationFrame(state.animation);
    clearTimeout(state.demoTimer);
    clearTimeout(state.countTimer);
    state.counting = false;
    state.loading += 1;
    state.stretch = 1;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = null;
    state.playing = false;
  }

  /** The audio for a listening mode: the track as imported, without its bass, or the bass alone. */
  function listenBlob(mode) {
    const track = state.track;
    if (mode === 'backing') return track.stems?.backing || null;
    if (mode === 'bass') return track.stems?.bass || null;
    return track.audioBlob || null;
  }

  const shiftOf = track => (track?.audioBlob ? Core.clamp(Math.round(track.transpose || 0), -Pitch.RANGE, Pitch.RANGE) : 0);

  /**
   * A recording in another key: made shorter or longer once, then played slower or faster by
   * as much. The last one made is kept, since going back and forth between two ways of
   * listening is common and making it takes a moment.
   */
  async function inKey(track, mode, blob, semitones) {
    const key = `${track.id}|${mode}|${semitones}`;
    if (state.keyCache?.key === key) return state.keyCache.blob;
    const buffer = await Transcriber.decode(blob);
    const factor = Pitch.factorOf(semitones);
    const channels = [];
    for (let channel = 0; channel < Math.min(2, buffer.numberOfChannels); channel += 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
      channels.push(Pitch.repitch(buffer.getChannelData(channel), factor));
    }
    const made = new Blob([Pitch.wavOf(channels, buffer.sampleRate)], { type: 'audio/wav' });
    state.keyCache = { key, blob: made };
    return made;
  }

  /** Points the player at one of the three recordings, keeping the place, the speed and whether it was playing. */
  async function loadAudio(mode, time = 0, play = false) {
    const track = state.track;
    const wanted = listenBlob(mode) ? mode : 'mix';
    let blob = listenBlob(wanted);
    state.listen = wanted;
    if (!blob) return;
    const token = ++state.loading;
    const semitones = shiftOf(track);
    let stretch = 1;
    if (semitones) {
      state.switching = play;
      audio.pause();
      $('savedLabel').textContent = t('changingKey');
      try {
        blob = await inKey(track, wanted, blob, semitones);
        stretch = Pitch.factorOf(semitones);
      } catch (error) {
        console.warn('Manico: the key could not be changed', error);
      }
      if (token !== state.loading || state.track !== track) return;
      $('savedLabel').textContent = t(stretch === 1 ? 'keyFailed' : track.demo ? 'demo' : 'saved');
    }
    state.stretch = stretch;
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(blob);
    state.switching = play;
    audio.src = state.audioUrl;
    audio.preload = play || time ? 'auto' : 'metadata';
    setAudioSpeed(track.settings.speed || 1);
    if (time) audio.currentTime = time / stretch;
    state.nextClick = null;
    if (play) {
      audio.play()
        .catch(() => { state.playing = false; })
        .finally(() => { state.switching = false; renderStudio(false); });
    } else {
      state.switching = false;
      if (state.playing) { state.playing = false; renderStudio(false); }
    }
  }

  function setListen(mode) {
    if (!state.track || synthetic(state.track) || mode === state.listen || !listenBlob(mode)) return;
    state.track.settings.listen = mode;
    loadAudio(mode, currentTime(), state.playing);
    scheduleSave();
    renderStudio(false);
  }

  /** Moves the piece by semitones, or back to where it was recorded with 0: the notes, the chords and what is heard. */
  function moveKey(delta) {
    const track = state.track;
    if (!track?.audioBlob) return;
    const from = shiftOf(track);
    const to = delta === 0 ? 0 : Core.clamp(from + delta, -Pitch.RANGE, Pitch.RANGE);
    if (to === from) return;
    const time = currentTime();
    const playing = state.playing && !state.counting;
    cancelCount();
    const open = tuning().open;
    const id = selected()?.id;
    track.events = Core.optimiseFingering(Pitch.shiftEvents(track.events, to - from, open, track.settings.frets), open, track.settings.frets);
    if (track.chords) track.chords = Pitch.shiftChords(track.chords, to - from);
    track.transpose = to;
    const index = track.events.findIndex(event => event.id === id);
    if (index >= 0) state.currentIndex = index;
    scheduleSave();
    renderStudio(true);
    loadAudio(state.listen, time, playing);
  }

  // The recordings of the pieces that come with the app, once fetched: the piece whole, without its bass, the bass alone.
  const pieceAudio = new Map();

  /**
   * Gives a piece that comes with the app its recording. Until it has arrived, or where it
   * cannot be fetched (the app opened from a single file, with no network), the notes are
   * played one by one as they always were.
   */
  async function loadPiece(track) {
    if (location.protocol === 'file:') return; // the app in a single file: there is nothing beside it to fetch
    try {
      let made = pieceAudio.get(track.id);
      if (!made) {
        $('savedLabel').textContent = t('loadingPiece');
        const fetched = async name => {
          const response = await fetch(`assets/pieces/${track.id}-${name}.mp3`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return Transcriber.decode(await response.blob());
        };
        const [backing, bass] = await Promise.all([fetched('backing'), fetched('bass')]);
        const frames = Math.min(backing.length, bass.length);
        const low = bass.getChannelData(0).subarray(0, frames);
        const rest = [0, 1].map(channel => backing.getChannelData(Math.min(channel, backing.numberOfChannels - 1)).subarray(0, frames));
        const mix = rest.map(channel => { const sum = new Float32Array(frames); for (let i = 0; i < frames; i += 1) sum[i] = channel[i] + low[i]; return sum; });
        let peak = 0;
        for (const channel of mix) for (let i = 0; i < frames; i += 1) peak = Math.max(peak, Math.abs(channel[i]));
        if (peak > 0.98) for (const channel of mix) for (let i = 0; i < frames; i += 1) channel[i] *= 0.98 / peak;
        const wav = channels => new Blob([Pitch.wavOf(channels, backing.sampleRate)], { type: 'audio/wav' });
        made = { mix: wav(mix), backing: wav(rest), bass: wav([low]) };
        pieceAudio.set(track.id, made);
      }
      if (state.track !== track) return;
      const time = state.demoClock;
      clearTimeout(state.demoTimer);
      state.playing = false;
      track.audioBlob = made.mix;
      track.stems = { backing: made.backing, bass: made.bass };
      await loadAudio('mix', time);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the recording of the piece could not be fetched', error);
      if (state.track === track) $('savedLabel').textContent = t('demo');
    }
  }

  function ensureTrackIntegrity(track) {
    track.settings = {
      tuning: '4', frets: 15, lookahead: 3, speed: 1, loopA: null, loopB: null,
      ...(track.settings || {})
    };
    let events = Core.normalizeEvents(track.events || [], track.duration || 0);
    let migrated = false;
    if (!track.demo && Number(track.analysisVersion || 0) < 2) {
      events = Core.stabilizeOctaves(events);
      track.analysisVersion = 2;
      migrated = true;
    }
    const open = (Core.TUNINGS[track.settings.tuning] || Core.TUNINGS['4']).open;
    events.forEach(event => {
      if (event.lockedPosition && !Core.positionMatchesMidi(event, open, track.settings.frets)) {
        event.lockedPosition = false;
        event.string = null;
        event.fret = null;
      }
    });
    track.events = Core.optimiseFingering(events, open, track.settings.frets);
    return migrated;
  }

  async function openTrack(id, demo = false) {
    stopAudio();
    const track = demo
      ? Core.createDemoTrack(Core.DEMOS.find(item => item.id === id) || Core.DEMOS[0])
      : await Store.get(id);
    if (!track) return;
    const migrated = ensureTrackIntegrity(track);
    if (demo) track.rhythm = Rhythm.steady(track.bpm, track.duration, track.beats || 4);
    state.track = track;
    state.currentIndex = 0;
    state.demoClock = 0;
    state.listen = 'mix';
    state.nextClick = null;
    if (track.audioBlob) loadAudio(track.settings.listen || 'mix');
    show('studio');
    renderStudio(true);
    startAnimation();
    // one after the other: the notes are read against the pulse, the chords against both
    ensureRhythm(track).then(() => ensureReader(track)).then(() => ensureChords(track));
    if (demo) loadPiece(track);
    if (migrated) {
      $('savedLabel').textContent = t('migrated');
      scheduleSave();
    }
  }

  /**
   * A track whose bass was isolated and read by an earlier reader is read again, from that bass,
   * the first time it is opened. One with notes corrected by hand is left as it is: what a
   * person wrote is not read over.
   */
  async function ensureReader(track) {
    if (track.demo || !track.stems?.bass || !track.audioBlob || Number(track.analysisVersion || 0) >= READER) return;
    if ((track.events || []).some(event => event.edited)) return;
    try {
      const open = (Core.TUNINGS[track.settings.tuning] || Core.TUNINGS['4']).open;
      const events = await Transcriber.transcribe(await Transcriber.decode(track.stems.bass), {
        isolated: true,
        mix: await Transcriber.decode(track.audioBlob),
        lowest: open[0]
      });
      if (!events.length || (track.events || []).some(event => event.edited)) return;
      const moved = track.transpose ? Pitch.shiftEvents(events, track.transpose, open, track.settings.frets) : events;
      track.events = Core.optimiseFingering(moved, open, track.settings.frets);
      track.analysisVersion = READER;
      track.source = 'bass';
      await Store.save(track);
      if (state.track === track) {
        state.currentIndex = 0;
        renderStudio(true);
        $('savedLabel').textContent = t('reread');
      }
    } catch (error) {
      console.warn('Manico: the notes could not be read again', error);
    }
  }

  /** A track imported before bars existed gets its pulse the first time it is opened. */
  async function ensureRhythm(track) {
    if (track.demo || track.rhythm || !track.audioBlob) return;
    try {
      const rhythm = Rhythm.analyse(await Transcriber.decode(track.audioBlob));
      if (!rhythm || track.rhythm) return;
      track.rhythm = rhythm;
      await Store.save(track);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the beat could not be found', error);
    }
  }

  /**
   * Reads the chords of a track from what is left of it without the bass. With `firstBeat` the
   * harmony is also asked where the bars start, which it knows better than the drums do.
   */
  async function readChords(track, firstBeat = false) {
    if (!track.stems?.backing || !track.rhythm) return false;
    const backing = await Transcriber.decode(track.stems.backing);
    const frames = Chords.chroma(backing);
    const shift = track.transpose || 0;
    // the line as it sounds in the recording, whatever key it is being read in now
    const bass = shift ? track.events.map(event => ({ ...event, midi: event.midi - shift })) : track.events;
    if (firstBeat) track.rhythm = { ...track.rhythm, downbeat: Chords.firstBeat(backing, track.rhythm, bass, frames) };
    track.chords = Pitch.shiftChords(Chords.find(backing, track.rhythm, bass, frames), shift);
    return true;
  }

  /** A track separated before chords existed gets them the first time it is opened. */
  async function ensureChords(track) {
    if (track.demo || track.chords || !track.stems?.backing || !track.rhythm) return;
    try {
      if (!await readChords(track, false)) return;
      await Store.save(track);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the chords could not be read', error);
    }
  }

  async function rereadChords() {
    const track = state.track;
    if (!track?.stems?.backing || !track.rhythm) return;
    $('savedLabel').textContent = t('readingChords');
    await new Promise(resolve => setTimeout(resolve, 30));
    try {
      await readChords(track, false);
      if (state.track !== track) return;
      scheduleSave();
      renderStudio(true);
      $('savedLabel').textContent = t('chordsDone');
    } catch (error) {
      console.warn('Manico: the chords could not be read', error);
      $('savedLabel').textContent = t('chordsFailed');
    }
  }

  /** Where the playhead is on the page: the bar, and the place in beats from the first bar line. */
  function place(track = state.track) {
    const score = scoreOf(track);
    const beats = Rhythm.positionOf(score.rhythm, currentTime() + 0.01) - score.shift + 1e-6;
    return { score, beats, bar: Rhythm.barAt(score.rhythm, beats) };
  }

  /** The moment a place on the page is heard. */
  const momentOf = (score, beats) => Core.clamp(Rhythm.timeOf(score.rhythm, beats + score.shift), 0, state.track.duration || Infinity);

  const chordIndex = () => Chords.indexAt(state.track?.chords, currentTime() + 0.005);

  function changed() {
    scheduleSave();
    renderStudio(true);
  }

  /** Corrections to the chord under the playhead: its root, its kind, or away with it. */
  function editChord(change) {
    const track = state.track;
    if (!track) return;
    const chords = (track.chords || []).map(chord => ({ ...chord }));
    const index = Chords.indexAt(chords, currentTime() + 0.005);
    if (change === 'add') {
      const { score, beats } = place(track);
      const start = Math.round(momentOf(score, Math.floor(beats)) * 1000) / 1000;
      const over = Chords.indexAt(chords, start + 0.005);
      const sounding = track.events.find(event => event.start <= start + 0.06 && event.end > start + 0.06);
      if (over >= 0) {
        const old = chords[over];
        if (start - old.start < 0.05) return;
        chords.splice(over + 1, 0, { start, end: old.end, root: sounding ? ((sounding.midi % 12) + 12) % 12 : old.root, quality: sounding ? '' : old.quality });
        old.end = start;
      } else {
        const next = chords.find(chord => chord.start > start);
        const barEnd = momentOf(score, Rhythm.barStart(score.rhythm, Rhythm.barAt(score.rhythm, beats) + 1));
        const end = Math.min(next ? next.start : Infinity, Math.max(barEnd, start + 0.2));
        chords.push({ start, end, root: sounding ? ((sounding.midi % 12) + 12) % 12 : 0, quality: '' });
        chords.sort((left, right) => left.start - right.start);
      }
    } else {
      if (index < 0) return;
      const chord = chords[index];
      if (change === 'up' || change === 'down') chord.root = (chord.root + (change === 'up' ? 1 : 11)) % 12;
      else if (change === 'kind') chord.quality = Chords.QUALITIES[(Chords.QUALITIES.indexOf(chord.quality) + 1) % Chords.QUALITIES.length];
      else if (change === 'remove') {
        // the chord before carries on over the gap
        if (index > 0 && Math.abs(chords[index - 1].end - chord.start) < 0.05) chords[index - 1].end = chord.end;
        chords.splice(index, 1);
      }
    }
    track.chords = chords;
    changed();
  }

  /** The section the playhead is in, as its place in the list; -1 before the first. */
  function sectionIndex(track = state.track) {
    const sections = track?.sections || [];
    const time = currentTime() + 0.02;
    let found = -1;
    sections.forEach((section, index) => { if (section.start <= time) found = index; });
    return found;
  }

  function editSection(change) {
    const track = state.track;
    if (!track) return;
    const sections = (track.sections || []).map(section => ({ ...section }));
    const index = sectionIndex(track);
    if (change === 'add') {
      const { score, bar } = place(track);
      const start = Math.round(momentOf(score, Rhythm.barStart(score.rhythm, Math.max(bar, score.firstBar))) * 1000) / 1000;
      if (sections.some(section => Math.abs(section.start - start) < 0.05)) return;
      const before = index >= 0 ? sections[index].kind : null;
      const kind = before === null ? (sections.length ? 'verse' : 'intro') : SECTION_KINDS[(SECTION_KINDS.indexOf(before) + 1) % SECTION_KINDS.length];
      sections.push({ start, kind });
      sections.sort((left, right) => left.start - right.start);
    } else {
      if (index < 0) return;
      if (change === 'kind') sections[index].kind = SECTION_KINDS[(SECTION_KINDS.indexOf(sections[index].kind) + 1) % SECTION_KINDS.length];
      else if (change === 'remove') sections.splice(index, 1);
      else if (change === 'loop') {
        const end = index + 1 < sections.length ? sections[index + 1].start : (track.duration || 0);
        if (end - sections[index].start < 0.15) return;
        track.settings.loopA = sections[index].start;
        track.settings.loopB = end;
        setTime(sections[index].start);
      }
    }
    track.sections = sections;
    changed();
  }

  /** The track as it goes on paper: its sections called by name, in the language of the page. */
  const printable = track => ({ ...track, sections: (track.sections || []).map(section => ({ ...section, name: t(`kind_${section.kind}`) })) });

  /** Corrections to the pulse that only a listener can make: where the bar starts, the level of the beat, the meter. */
  function adjustRhythm(change) {
    const track = state.track;
    if (!track) return;
    let rhythm = { ...rhythmOf(track) };
    if (change === 'earlier') rhythm.downbeat = (rhythm.downbeat + rhythm.perBar - 1) % rhythm.perBar;
    else if (change === 'later') rhythm.downbeat = (rhythm.downbeat + 1) % rhythm.perBar;
    else if (change === 'half' || change === 'double') Object.assign(rhythm, Rhythm.rescale(rhythm, change === 'double' ? 2 : 0.5));
    else if (change === 'meter') { rhythm.perBar = rhythm.perBar === 4 ? 3 : 4; rhythm.downbeat %= rhythm.perBar; rhythm.odd = []; }
    else if (change === 'offbeat') rhythm = Rhythm.halfway(rhythm);
    else if (change === 'fewer' || change === 'more') {
      // this bar alone is given a length of its own; every bar line after it moves
      const { bar } = place(track);
      if (bar < 0) return;
      const beats = Core.clamp(Rhythm.beatsIn(rhythm, bar) + (change === 'more' ? 1 : -1), 1, 12);
      rhythm = Rhythm.setBeatsIn(rhythm, bar, beats);
    }
    if (rhythm.beats.length < 4) return;
    if (track.demo) track.fallbackRhythm = rhythm;
    if (!track.demo || track.rhythm) { track.rhythm = rhythm; scheduleSave(); }
    state.nextClick = null;
    renderStudio(true);
  }

  function scheduleSave() {
    if (!state.track || state.track.demo) return;
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(async () => {
      state.track.updatedAt = Date.now();
      await Store.save(state.track);
      $('savedLabel').textContent = t('saved');
      await loadLibrary();
    }, 420);
  }

  function currentTime() {
    return synthetic(state.track) ? state.demoClock : (audio.currentTime || 0) * state.stretch;
  }

  function setTime(value) {
    if (!state.track) return;
    const time = Core.clamp(value, 0, state.track.duration || 0);
    if (synthetic(state.track)) {
      state.demoClock = time;
      state.currentIndex = Core.currentEventIndex(state.track.events, time, state.currentIndex);
      if (state.playing) scheduleDemo();
    } else {
      audio.currentTime = time / state.stretch;
    }
    state.nextClick = null;
    updatePlayback(true);
  }

  const selected = () => state.track?.events?.[state.currentIndex] || null;
  const preview = () => Core.previewWindow(state.track?.events || [], state.currentIndex, state.track?.settings?.lookahead || 3);

  function selectEvent(index, seek = true) {
    if (!state.track?.events?.length) return;
    state.currentIndex = Core.clamp(index, 0, state.track.events.length - 1);
    if (seek) setTime(state.track.events[state.currentIndex].start);
    renderStudio(true);
  }

  // The tablature above the fretboard, written as tablature is: a line per string with the
  // highest on top, fret numbers, bar lines, and under the staff the stems, beams and flags
  // that say how long each note lasts. A held note is written once; where it runs on into the
  // next beat or bar it is tied, never repeated. The sheet slides under a playhead that stays put.
  const TAB = { row: 22, top: 30, label: 34, stem: 30, score: null, key: '' };
  const CHORD_ROW = 20; // room above the bar numbers, taken only when there are chords to write
  const Rhythm = root.ManicoRhythm;

  /** The pulse of the open track: found in the recording, known for an exercise, or a plain guess until then. */
  function rhythmOf(track) {
    if (track.rhythm?.beats?.length >= 2) return track.rhythm;
    if (!track.fallbackRhythm) track.fallbackRhythm = Rhythm.steady(track.bpm || 120, track.duration || 60);
    return track.fallbackRhythm;
  }

  /** The written music for the open track, worked out again only when its notes or its pulse change. */
  function scoreOf(track) {
    const rhythm = rhythmOf(track);
    let sum = 0;
    for (const event of track.events) sum += event.start + event.end * 3;
    const odd = (rhythm.odd || []).map(item => `${item.bar}:${item.beats}`).join(',');
    const key = [track.id, track.events.length, sum.toFixed(3), rhythm.beats.length, rhythm.beats[0], rhythm.beats[1], rhythm.downbeat, rhythm.perBar, odd].join('|');
    if (TAB.key === key) return TAB.score;
    const { bars, barSlots, placed } = Rhythm.notate(rhythm, track.events);
    const symbols = [];
    const lastPiece = new Map();
    let fast = 0;
    [...bars.keys()].sort((left, right) => left - right).forEach(bar => {
      for (const piece of bars.get(bar)) {
        const symbol = { ...piece, bar, position: piece.at / Rhythm.DIVISION };
        if (symbol.tied) symbol.from = lastPiece.get(symbol.index);
        if (!symbol.rest) lastPiece.set(symbol.index, symbol.position);
        if (!symbol.rest && (symbol.value === 1 || symbol.slot % 2)) fast += 1;
        symbols.push(symbol);
      }
    });
    TAB.key = key;
    TAB.score = {
      rhythm, symbols, barSlots,
      shift: Rhythm.calibrate(rhythm, track.events),
      // Sixteenths need more room than eighths to stay readable.
      beatWidth: fast > placed.length * 0.05 ? 104 : 72,
      firstBar: bars.size ? Math.min(...bars.keys()) : 0,
      lastBar: bars.size ? Math.max(...bars.keys()) : 0
    };
    return TAB.score;
  }

  function tabLayout() {
    const canvas = $('tabStrip');
    const strings = tuning().open.length;
    const width = canvas.clientWidth || 600;
    const score = scoreOf(state.track);
    TAB.top = 30 + (state.track.chords?.length ? CHORD_ROW : 0);
    const staffBottom = TAB.top + (strings - 1) * TAB.row;
    return {
      canvas, strings, width, score, staffBottom,
      height: staffBottom + TAB.stem + 26,
      beatWidth: score.beatWidth * (width < 520 ? 0.8 : 1),
      playhead: Math.max(TAB.label + 50, Math.round(width * 0.25)),
      now: Rhythm.positionOf(score.rhythm, currentTime()) - score.shift,
      // The highest string is the top line, as on paper.
      y: string => TAB.top + (strings - 1 - string) * TAB.row
    };
  }

  function drawRest(context, value, x, layout) {
    const middle = (TAB.top + layout.staffBottom) / 2;
    context.lineWidth = 1.6;
    if (value >= 8) {
      // Whole and half rests: a block hanging from a line, or sitting on it.
      const line = layout.y(Math.min(layout.strings - 1, Math.ceil(layout.strings / 2)));
      context.fillRect(x - 6, value >= 16 ? line : line - 5, 12, 5);
    } else if (value >= 4) {
      context.beginPath();
      context.moveTo(x - 3, middle - 11);
      context.lineTo(x + 3, middle - 4);
      context.lineTo(x - 3, middle + 1);
      context.lineTo(x + 3, middle + 7);
      context.quadraticCurveTo(x - 5, middle + 5, x - 1, middle + 12);
      context.stroke();
    } else {
      const flags = value >= 2 ? 1 : 2;
      context.beginPath();
      context.moveTo(x + 4, middle - 8);
      context.lineTo(x - 2, middle + 9);
      context.stroke();
      for (let flag = 0; flag < flags; flag += 1) {
        context.beginPath();
        context.arc(x - 3 - flag, middle - 6 + flag * 6, 2.2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(x - 2 - flag, middle - 5 + flag * 6);
        context.lineTo(x + 3.5 - flag * 2, middle - 7 + flag * 6);
        context.stroke();
      }
    }
  }

  /** Stems, beams, flags and dots under the staff for the notes of one beat. */
  function drawRhythm(context, group, layout, x) {
    const top = layout.staffBottom + 12;
    const bottom = layout.staffBottom + TAB.stem;
    const beamed = group.length > 1 && group.every(symbol => symbol.value <= 3);
    context.lineWidth = 1.4;
    group.forEach((symbol, order) => {
      const at = Math.round(x(symbol.position)) + 0.5;
      if (symbol.value < 16) {
        context.beginPath();
        context.moveTo(at, symbol.value >= 8 ? bottom - 9 : top);
        context.lineTo(at, bottom);
        context.stroke();
      }
      if (symbol.value % 3 === 0) {
        context.beginPath();
        context.arc(at + 5, bottom - 4, 1.5, 0, Math.PI * 2);
        context.fill();
      }
      if (symbol.value > 3) return;
      const flags = symbol.value === 1 ? 2 : 1;
      if (!beamed) {
        for (let flag = 0; flag < flags; flag += 1) {
          context.beginPath();
          context.moveTo(at, bottom - flag * 5);
          context.quadraticCurveTo(at + 7, bottom - 3 - flag * 5, at + 7, bottom - 10 - flag * 5);
          context.stroke();
        }
        return;
      }
      // A sixteenth shares its second beam with a neighbouring sixteenth, or carries a stub towards its neighbour.
      if (symbol.value === 1) {
        const next = group[order + 1];
        const previous = group[order - 1];
        context.lineWidth = 3;
        context.beginPath();
        if (next && next.value === 1) { context.moveTo(at, bottom - 6); context.lineTo(Math.round(x(next.position)) + 0.5, bottom - 6); }
        else if (!(previous && previous.value === 1)) { context.moveTo(at, bottom - 6); context.lineTo(at + (previous ? -7 : 7), bottom - 6); }
        context.stroke();
        context.lineWidth = 1.4;
      }
    });
    if (beamed) {
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(Math.round(x(group[0].position)) + 0.5, bottom);
      context.lineTo(Math.round(x(group.at(-1).position)) + 0.5, bottom);
      context.stroke();
    }
  }

  function renderTimeline() {
    if (!state.track) return;
    const layout = tabLayout();
    const { canvas, strings, width, height, playhead, score, now, beatWidth, staffBottom } = layout;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.height = `${height}px`;
    }
    const style = getComputedStyle(canvas);
    const color = name => style.getPropertyValue(name).trim();
    const mono = color('--mono') || 'monospace';
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    const events = state.track.events;
    const perBar = score.rhythm.perBar;
    const x = position => playhead + (position - now) * beatWidth;
    const from = now - (playhead + 60) / beatWidth;
    const to = now + (width - playhead + 60) / beatWidth;

    // Nothing of the sliding sheet is drawn under the string names.
    context.save();
    context.beginPath();
    context.rect(TAB.label, 0, width - TAB.label, height);
    context.clip();

    // The strings, then the bar lines with their numbers.
    context.lineWidth = 1;
    context.strokeStyle = color('--line-2');
    for (let string = 0; string < strings; string += 1) {
      context.beginPath();
      context.moveTo(0, layout.y(string) + 0.5);
      context.lineTo(width, layout.y(string) + 0.5);
      context.stroke();
    }
    context.font = `10px ${mono}`;
    const rhythm = score.rhythm;
    const time = currentTime();
    // the sections, by the bar each starts with
    const opening = new Map();
    for (const section of state.track.sections || []) {
      opening.set(Rhythm.barAt(rhythm, Rhythm.positionOf(rhythm, section.start + 0.01) - score.shift + 1e-6), t(`kind_${section.kind}`));
    }
    for (let bar = Math.max(score.firstBar, Rhythm.barAt(rhythm, from)); bar <= score.lastBar + 1; bar += 1) {
      const start = Rhythm.barStart(rhythm, bar);
      if (start > to) break;
      // The line sits a little before the first note of its bar, as it does in print.
      const line = Math.round(x(start) - beatWidth / Rhythm.DIVISION / 2 - 3) + 0.5;
      context.strokeStyle = color('--muted');
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(line, TAB.top);
      context.lineTo(line, staffBottom);
      context.stroke();
      if (bar >= 0 && bar <= score.lastBar) {
        const beats = Rhythm.beatsIn(rhythm, bar);
        context.textAlign = 'left';
        context.fillStyle = color('--faint');
        let label = String(bar + 1);
        if (beats !== perBar) label += ` · ${beats}/4`; // a bar of its own length says so
        context.fillText(label, line + 4, TAB.top - 14);
        if (opening.has(bar)) {
          const taken = context.measureText(label).width;
          context.fillStyle = color('--future');
          context.font = `700 10px ${mono}`;
          context.fillText(opening.get(bar).toUpperCase(), line + 10 + taken, TAB.top - 14);
          context.font = `10px ${mono}`;
        }
        context.textAlign = 'center';
      }
    }
    // The chords, over the beat each one starts on. The one sounding stays in sight until the next arrives.
    const chords = state.track.chords || [];
    if (chords.length) {
      context.textAlign = 'left';
      const sounding = Chords.indexAt(chords, time + 0.005);
      let free = -Infinity;
      for (let index = 0; index < chords.length; index += 1) {
        const chord = chords[index];
        let at = x(Rhythm.positionOf(rhythm, chord.start) - score.shift) - 4;
        if (at > width) break;
        const name = Chords.nameOf(chord);
        context.font = `${index === sounding ? 800 : 700} 13px ${mono}`;
        const wide = context.measureText(name).width;
        if (index === sounding) {
          const next = chords[index + 1] ? x(Rhythm.positionOf(rhythm, chords[index + 1].start) - score.shift) - 4 : Infinity;
          at = Math.max(at, Math.min(TAB.label + 6, next - wide - 8));
        }
        if (at + wide < TAB.label || at < free) continue;
        context.fillStyle = index === sounding ? color('--accent') : chord.end <= time ? color('--faint') : color('--paper');
        context.fillText(name, at, TAB.top - 14 - CHORD_ROW + 2);
        free = at + wide + 6;
      }
      context.textAlign = 'center';
      context.font = `10px ${mono}`;
    }
    // The playhead, behind the numbers.
    context.strokeStyle = color('--accent');
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(playhead, TAB.top - 8);
    context.lineTo(playhead, staffBottom + TAB.stem + 4);
    context.stroke();

    const symbols = score.symbols;
    let low = 0;
    let high = symbols.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (symbols[middle].position < from - perBar) low = middle + 1; else high = middle;
    }
    const upcoming = new Set(preview().upcoming.map(event => event.id));
    const current = selected();
    const toneOf = event => event === current ? color('--accent') : upcoming.has(event.id) ? color('--future')
      : event.end <= time ? color('--faint') : color('--paper');
    let group = [];
    let groupBeat = null;
    const flush = () => {
      if (!group.length) return;
      context.strokeStyle = context.fillStyle = color('--muted');
      drawRhythm(context, group, layout, x);
      group = [];
    };
    for (let index = low; index < symbols.length && symbols[index].position < to; index += 1) {
      const symbol = symbols[index];
      const at = x(symbol.position);
      const beat = Math.floor(symbol.position + 1e-6);
      if (symbol.rest) {
        flush();
        context.strokeStyle = context.fillStyle = color('--faint');
        // Long rests sit in the middle of the space they fill.
        drawRest(context, symbol.value, symbol.value >= 8 ? at + (symbol.value / Rhythm.DIVISION * beatWidth) / 2 - beatWidth / 8 : at, layout);
        continue;
      }
      if (beat !== groupBeat || symbol.value > 3) flush();
      groupBeat = beat;
      group.push(symbol);
      if (symbol.value > 3) flush();
      const event = events[symbol.index];
      if (!event) continue;
      const playable = event.string !== null && event.string !== undefined && event.string < strings;
      const row = playable ? layout.y(event.string) : TAB.top - 12;
      const tone = toneOf(event);
      if (symbol.tied) {
        // The same note still sounding: an arc from where it was last written, and in a new bar the fret again in brackets.
        const start = Math.max(x(symbol.from), TAB.label);
        context.strokeStyle = tone;
        context.globalAlpha = 0.7;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(start + 7, row + 9);
        context.quadraticCurveTo((start + at) / 2, row + 17, at - (symbol.barStart ? 9 : 2), row + 9);
        context.stroke();
        context.globalAlpha = 1;
        if (!symbol.barStart) continue;
      }
      const text = playable ? (symbol.tied ? `(${event.fret})` : String(event.fret)) : '?';
      context.font = `${event === current ? 800 : 700} ${symbol.tied ? 12 : event === current ? 17 : 15}px ${mono}`;
      const half = context.measureText(text).width / 2 + 2;
      context.fillStyle = color('--panel');
      context.fillRect(at - half, row - 9, half * 2, 18);
      context.fillStyle = tone;
      context.globalAlpha = symbol.tied ? 0.75 : 1;
      context.fillText(text, at, row + 1);
      context.globalAlpha = 1;
    }
    flush();
    context.restore();

    // String names stay at the left edge.
    context.font = `700 12px ${mono}`;
    context.fillStyle = color('--muted');
    for (let string = 0; string < strings; string += 1) context.fillText(stringName(string), TAB.label / 2 - 2, layout.y(string) + 1);
    context.strokeStyle = color('--muted');
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(TAB.label - 4.5, TAB.top);
    context.lineTo(TAB.label - 4.5, staffBottom);
    context.stroke();
  }

  /** A click on a number selects that note; a click elsewhere on the sheet moves the playhead there. */
  function clickTab(event) {
    if (!state.track) return;
    const layout = tabLayout();
    const bounds = layout.canvas.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const py = event.clientY - bounds.top;
    if (px < TAB.label) return;
    const events = state.track.events;
    const chords = state.track.chords || [];
    if (chords.length && py < TAB.top - 22) {
      // on the row of the chords: to the start of the one clicked
      const clicked = layout.now + (px + 4 - layout.playhead) / layout.beatWidth + layout.score.shift;
      const index = Chords.indexAt(chords, Rhythm.timeOf(layout.score.rhythm, clicked));
      if (index >= 0) { setTime(chords[index].start); return; }
    }
    let best = -1;
    let distance = 14;
    for (const symbol of layout.score.symbols) {
      if (symbol.rest || symbol.tied) continue;
      const item = events[symbol.index];
      if (!item) continue;
      const dx = Math.abs(layout.playhead + (symbol.position - layout.now) * layout.beatWidth - px);
      const onRow = item.string === null || item.string === undefined || Math.abs(layout.y(item.string) - py) <= TAB.row / 2;
      if (onRow && dx < distance) { best = symbol.index; distance = dx; }
    }
    if (best >= 0) selectEvent(best);
    else setTime(Rhythm.timeOf(layout.score.rhythm, layout.now + layout.score.shift + (px - layout.playhead) / layout.beatWidth));
  }

  function neckGeometry(strings, frets) {
    const width = 1400;
    const height = Math.max(430, 174 + strings * 64);
    const outerLeft = 24;
    const outerRight = 1376;
    const stringStart = 96;
    const nut = 164;
    const bridge = 1354;
    const rulerTop = 16;
    const rulerBottom = 70;
    const boardTop = 76;
    const boardBottom = height - 46;
    const stringTop = boardTop + 34;
    const stringBottom = boardBottom - 34;
    const topAt = () => boardTop;
    const bottomAt = () => boardBottom;
    const fretX = fret => nut + Core.fretPosition(fret, frets) * (bridge - nut);
    const fretCenter = fret => fret === 0
      ? (stringStart + nut) / 2
      : (fretX(fret - 1) + fretX(fret)) / 2;
    const stringY = string => {
      const display = strings - 1 - string;
      const ratio = strings <= 1 ? 0.5 : display / (strings - 1);
      return stringTop + (stringBottom - stringTop) * ratio;
    };
    return {
      width, height, outerLeft, outerRight, stringStart, nut, bridge,
      rulerTop, rulerBottom, boardTop, boardBottom,
      topAt, bottomAt, fretX, fretCenter, stringY
    };
  }

  function markerPoint(event, geometry, strings) {
    if (!event || event.string === null || event.fret === null) return null;
    const x = geometry.fretCenter(event.fret);
    return { x, y: geometry.stringY(event.string, x), key: `${event.string}:${event.fret}` };
  }

  function renderMarkerGroup(entries, point) {
    const current = entries.find(entry => entry.kind === 'current');
    const past = entries.find(entry => entry.kind === 'past');
    const anchor = current || entries.find(entry => entry.kind === 'future') || past;
    if (!anchor) return '';
    const event = anchor.event;
    const isCurrent = anchor.kind === 'current';
    const isPast = anchor.kind === 'past' && !current;
    const color = isPast ? 'var(--past)' : isCurrent ? 'var(--accent)' : 'var(--future)';
    const radius = isCurrent ? 31 : 25;
    const fill = isPast ? 'rgba(17,16,14,.72)' : color;
    const textColor = isCurrent ? '#211608' : isPast ? 'var(--past)' : '#10201b';
    let svg = `<g class="neck-marker ${anchor.kind}">`;
    svg += `<circle cx="${point.x}" cy="${point.y}" r="${radius + 8}" fill="none" stroke="${color}" stroke-opacity=".16" stroke-width="8"/>`;
    svg += `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${fill}" stroke="${color}" stroke-width="${isPast ? 4 : 2.5}"/>`;
    svg += `<text x="${point.x}" y="${point.y + 6}" text-anchor="middle" class="marker-note" fill="${textColor}">${Core.noteName(event.midi)}</text>`;

    const future = entries.filter(entry => entry.kind === 'future');
    future.forEach((entry, index) => {
      const offsetX = radius + 18 + index * 27;
      const badgeX = point.x + offsetX;
      const badgeY = point.y - radius - 10 - (index % 2) * 8;
      svg += `<line x1="${point.x + radius * 0.55}" y1="${point.y - radius * 0.55}" x2="${badgeX - 10}" y2="${badgeY + 3}" stroke="var(--future)" stroke-opacity=".55" stroke-width="1.5"/>`;
      svg += `<circle cx="${badgeX}" cy="${badgeY}" r="13" fill="var(--future)" stroke="#10201b" stroke-width="1.5"/>`;
      svg += `<text x="${badgeX}" y="${badgeY + 4.5}" text-anchor="middle" class="marker-order" fill="#10201b">${entry.order}</text>`;
    });
    svg += '</g>';
    return svg;
  }

  // The neck itself only depends on tuning and fret count, so it is drawn once per combination;
  // playback then rewrites just the markers on every note.
  const boardCache = { key: '', html: '' };

  function renderBoard(open, frets, geometry) {
    const key = `${open.join(',')}|${frets}`;
    if (boardCache.key === key) return boardCache.html;
    const strings = open.length;
    let html = `
      <defs>
        <linearGradient id="boardWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#efd7aa"/>
          <stop offset=".48" stop-color="#d9b77d"/>
          <stop offset="1" stop-color="#bd874f"/>
        </linearGradient>
        <linearGradient id="fretMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#5d5953"/>
          <stop offset=".42" stop-color="#f7f2e9"/>
          <stop offset="1" stop-color="#68625b"/>
        </linearGradient>
        <linearGradient id="stringMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fbf8f0"/>
          <stop offset=".45" stop-color="#b9b0a4"/>
          <stop offset="1" stop-color="#706960"/>
        </linearGradient>
        <filter id="boardShadow" x="-10%" y="-20%" width="120%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity=".38"/>
        </filter>
        <filter id="noteGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f1b54a" flood-opacity=".72"/>
        </filter>
        <marker id="routeArrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L8,3.5 z" fill="var(--future)" opacity=".75"/>
        </marker>
      </defs>`;

    const outerWidth = geometry.outerRight - geometry.outerLeft;
    const boardHeight = geometry.boardBottom - geometry.boardTop;

    html += `<g filter="url(#boardShadow)">`;
    html += `<rect x="${geometry.outerLeft}" y="${geometry.rulerTop}" width="${outerWidth}" height="${geometry.boardBottom - geometry.rulerTop}" rx="14" fill="#f3eee6" stroke="#856b52" stroke-width="2.5"/>`;
    html += `<path d="M ${geometry.outerLeft + 14} ${geometry.rulerBottom} H ${geometry.outerRight - 14}" stroke="#c4ad8e" stroke-width="2"/>`;
    html += `<rect x="${geometry.outerLeft}" y="${geometry.boardTop}" width="${outerWidth}" height="${boardHeight}" fill="url(#boardWood)"/>`;
    html += `<line x1="${geometry.stringStart}" y1="${geometry.boardTop}" x2="${geometry.stringStart}" y2="${geometry.boardBottom}" stroke="#72563e" stroke-opacity=".58" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardTop}" x2="${geometry.outerRight}" y2="${geometry.boardTop}" stroke="#fff8ec" stroke-opacity=".7" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardBottom}" x2="${geometry.outerRight}" y2="${geometry.boardBottom}" stroke="#5f422d" stroke-opacity=".72" stroke-width="3"/>`;

    for (let fret = 1; fret <= frets; fret += 1) {
      const x = geometry.fretX(fret);
      html += `<line x1="${x + 2}" y1="${geometry.boardTop}" x2="${x + 2}" y2="${geometry.boardBottom}" stroke="#5f554a" stroke-opacity=".34" stroke-width="5"/>`;
      html += `<line x1="${x}" y1="${geometry.boardTop}" x2="${x}" y2="${geometry.boardBottom}" stroke="url(#fretMetal)" stroke-width="3.5"/>`;
    }

    html += `<line x1="${geometry.nut}" y1="${geometry.boardTop}" x2="${geometry.nut}" y2="${geometry.boardBottom}" stroke="#2a241d" stroke-opacity=".35" stroke-width="12"/>`;
    html += `<line x1="${geometry.nut - 2}" y1="${geometry.boardTop}" x2="${geometry.nut - 2}" y2="${geometry.boardBottom}" stroke="#f4ead8" stroke-width="7"/>`;

    [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(fret => fret <= frets).forEach(fret => {
      const x = geometry.fretCenter(fret);
      const y = (geometry.boardTop + geometry.boardBottom) / 2;
      if (fret % 12 === 0) {
        html += `<circle cx="${x}" cy="${y - 29}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
        html += `<circle cx="${x}" cy="${y + 29}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
      } else {
        html += `<circle cx="${x}" cy="${y}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
      }
    });

    open.forEach((openMidi, string) => {
      const y = geometry.stringY(string);
      const thickness = 1.7 + (strings - string) * 0.72;
      html += `<text x="${geometry.stringStart - 23}" y="${y + 7}" text-anchor="end" class="string-label" fill="#3a3026">${Core.noteName(openMidi).replace(/-?\d+$/, '')}</text>`;
      html += `<line x1="${geometry.stringStart}" y1="${y + 2}" x2="${geometry.bridge}" y2="${y + 2}" stroke="#4e4033" stroke-opacity=".44" stroke-width="${thickness + 2.2}"/>`;
      html += `<line x1="${geometry.stringStart}" y1="${y}" x2="${geometry.bridge}" y2="${y}" stroke="url(#stringMetal)" stroke-width="${thickness}"/>`;
    });
    html += `</g>`;

    const numberFrets = frets <= 18
      ? Array.from({ length: frets + 1 }, (_, index) => index)
      : [0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(fret => fret <= frets);
    numberFrets.forEach(fret => {
      html += `<text x="${geometry.fretCenter(fret)}" y="52" text-anchor="middle" class="fret-number" fill="#5f554a">${fret}</text>`;
    });
    boardCache.key = key;
    boardCache.html = html;
    return html;
  }

  function renderFretboard() {
    const svg = $('fretboard');
    const open = tuning().open;
    const strings = open.length;
    const frets = state.track.settings.frets;
    const geometry = neckGeometry(strings, frets);
    const window = preview();
    svg.setAttribute('viewBox', `0 0 ${geometry.width} ${geometry.height}`);
    let neck = svg.querySelector('#neck');
    let markers = svg.querySelector('#markers');
    if (!neck || !markers) {
      svg.innerHTML = '<g id="neck"></g><g id="markers"></g>';
      neck = svg.querySelector('#neck');
      markers = svg.querySelector('#markers');
    }
    const previousKey = boardCache.key;
    const board = renderBoard(open, frets, geometry);
    if (previousKey !== boardCache.key || !neck.childNodes.length) neck.innerHTML = board;
    let html = '';

    // Only the note to play now: what comes next is read on the tablature above.
    const entries = window.current ? [{ event: window.current, kind: 'current', order: 0 }] : [];

    const groups = new Map();
    entries.forEach(entry => {
      const point = markerPoint(entry.event, geometry, strings);
      if (!point || entry.event.fret > frets) return;
      if (!groups.has(point.key)) groups.set(point.key, { point, entries: [] });
      groups.get(point.key).entries.push(entry);
    });
    groups.forEach(group => { html += renderMarkerGroup(group.entries, group.point); });

    markers.innerHTML = html;
  }

  function populatePositionSelect(event) {
    const select = $('positionSelect');
    select.replaceChildren();
    if (!event) {
      select.disabled = true;
      return;
    }
    select.disabled = false;
    const candidates = Core.candidatePositions(event.midi, tuning().open, state.track.settings.frets);
    const auto = document.createElement('option');
    auto.value = 'auto';
    const autoPosition = event.string === null ? t('notPlayable') : `${stringName(event.string)} · ${event.fret}`;
    auto.textContent = `${t('automatic')} · ${autoPosition}`;
    select.append(auto);
    candidates.forEach(position => {
      const option = document.createElement('option');
      option.value = `${position.string}:${position.fret}`;
      option.textContent = `${stringName(position.string)} · ${position.fret}`;
      select.append(option);
    });
    select.value = event.lockedPosition ? `${event.string}:${event.fret}` : 'auto';
  }

  function renderSide() {
    const window = preview();
    const event = window.current;
    $('nowNote').textContent = event ? Core.noteName(event.midi) : '—';
    $('nowPosition').textContent = event && event.string !== null
      ? `${t('string')} ${stringName(event.string)} · ${t('fret')} ${event.fret}${event.lockedPosition ? ` · ${t('locked')}` : ''}`
      : t('notPlayable');
    $('confidenceLabel').textContent = event ? `${t('confidence')} ${Math.round((event.confidence || 0) * 100)}%` : '';

    const list = $('nextList');
    list.replaceChildren();
    window.upcoming.forEach((upcoming, index) => {
      const row = document.createElement('div');
      row.className = 'next-row';
      const order = document.createElement('span');
      order.className = 'order';
      order.textContent = index + 1;
      const name = document.createElement('b');
      name.textContent = Core.noteName(upcoming.midi);
      const position = document.createElement('span');
      position.textContent = upcoming.string === null ? '—' : `${stringName(upcoming.string)}${upcoming.fret}`;
      row.append(order, name, position);
      list.append(row);
    });

    $('noteSelect').value = event ? String(event.midi) : '';
    populatePositionSelect(event);
    $('noteStart').value = event ? event.start.toFixed(2) : '';
    $('noteEnd').value = event ? event.end.toFixed(2) : '';
    $('noteStart').disabled = !event;
    $('noteEnd').disabled = !event;
    $('noteDown').disabled = !event;
    $('noteUp').disabled = !event;
    $('deleteNote').disabled = !event || state.track.events.length <= 1;
    $('splitNote').disabled = !event || event.end - event.start < 0.12;
    $('mergeNote').disabled = !event || state.currentIndex >= state.track.events.length - 1;
    $('addNote').disabled = !state.track;

    const chord = state.track.chords?.[chordIndex()];
    $('chordLabel').textContent = chord ? Chords.nameOf(chord) : t('noChord');
    for (const id of ['chordDown', 'chordUp', 'chordKind', 'chordRemove']) $(id).disabled = !chord;
    const readable = Boolean(state.track.stems?.backing && state.track.rhythm) && !state.track.demo;
    $('chordsRead').disabled = !readable;
    const { score, bar } = place();
    const section = (state.track.sections || [])[sectionIndex()];
    if (section) {
      const first = Rhythm.barAt(score.rhythm, Rhythm.positionOf(score.rhythm, section.start + 0.01) - score.shift + 1e-6);
      $('sectionLabel').textContent = `${t(`kind_${section.kind}`)} · ${t('fromBar')} ${first + 1}`;
    } else $('sectionLabel').textContent = t('noSection');
    for (const id of ['sectionKind', 'sectionLoop', 'sectionRemove']) $(id).disabled = !section;
    $('barLabel').textContent = bar >= 0 ? `${t('bar')} ${bar + 1} · ${Rhythm.beatsIn(score.rhythm, bar)}/4` : '—';
    $('barFewer').disabled = bar < 0 || Rhythm.beatsIn(score.rhythm, bar) <= 1;
    $('barMore').disabled = bar < 0 || Rhythm.beatsIn(score.rhythm, bar) >= 12;
  }

  function renderLoop() {
    const { loopA, loopB } = state.track.settings;
    if (loopA !== null && loopB !== null) $('loopLabel').textContent = `A ${Core.formatTime(loopA)} — B ${Core.formatTime(loopB)}`;
    else if (loopA !== null) $('loopLabel').textContent = `A ${Core.formatTime(loopA)} — B …`;
    else if (loopB !== null) $('loopLabel').textContent = `A … — B ${Core.formatTime(loopB)}`;
    else $('loopLabel').textContent = t('noLoop');

    const duration = state.track.duration || audio.duration || 0;
    const markers = [['loopMarkerA', loopA], ['loopMarkerB', loopB]];
    markers.forEach(([id, value]) => {
      const marker = $(id);
      marker.hidden = value === null || !duration;
      if (!marker.hidden) marker.style.left = `${Core.clamp(value / duration * 100, 0, 100)}%`;
    });
    const bounds = Core.validLoopBounds(state.track.settings, duration);
    $('loopRange').hidden = !bounds || !duration;
    if (bounds && duration) {
      $('loopRange').style.left = `${bounds.start / duration * 100}%`;
      $('loopRange').style.width = `${(bounds.end - bounds.start) / duration * 100}%`;
    }
  }

  function renderStudio(full = false) {
    if (!state.track) return;
    if (document.activeElement !== $('trackTitle')) $('trackTitle').value = state.track.title;
    const origin = state.track.demo ? `${t('demo')} · ${Math.round(state.track.bpm)} BPM` : t(state.track.source === 'bass' ? 'isolatedLine' : 'importedLine');
    $('trackMeta').textContent = `${origin} · ${state.track.events.length} ${t('notes')} · ${tuning().label}`;
    const stems = Boolean(state.track.stems?.backing && state.track.stems?.bass);
    $('listenBlock').hidden = !stems;
    for (const [id, mode] of [['listenMix', 'mix'], ['listenBacking', 'backing'], ['listenBass', 'bass']]) {
      $(id).setAttribute('aria-pressed', String(state.listen === mode));
    }
    $('isolateBlock').hidden = stems || !state.separable || Boolean(state.track.demo) || !state.track.audioBlob;
    $('retranscribeBlock').hidden = Boolean(state.track.demo) || !state.track.audioBlob;
    const pulse = rhythmOf(state.track);
    $('tempoLabel').textContent = state.track.demo || state.track.rhythm
      ? `${Math.round(Rhythm.tempoOf(pulse))} BPM · ${pulse.perBar}/4` : t('findingBeat');
    $('meterToggle').textContent = pulse.perBar === 4 ? '3/4' : '4/4';
    const semitones = shiftOf(state.track);
    $('keyBlock').hidden = !state.track.audioBlob;
    $('practiceBlock').hidden = synthetic(state.track);
    $('keyLabel').textContent = semitones
      ? `${semitones > 0 ? '+' : '−'}${Math.abs(semitones)} ${t(Math.abs(semitones) === 1 ? 'semitone' : 'semitonesMany')}` : t('keyOriginal');
    $('keyDown').disabled = semitones <= -Pitch.RANGE;
    $('keyUp').disabled = semitones >= Pitch.RANGE;
    $('keyReset').disabled = !semitones;
    $('savedLabel').textContent = state.track.demo ? t('demo') : t('saved');
    $('tuningSelect').value = state.track.settings.tuning;
    $('fretsSelect').value = String(state.track.settings.frets);
    $('lookaheadSelect').value = String(state.track.settings.lookahead);
    $('speedSelect').value = String(state.track.settings.speed);
    $('playButton').textContent = state.playing ? '❚❚' : '▶';
    renderTimeline();
    renderFretboard();
    renderSide();
    renderLoop();
    renderPerformance();
    if (full) updatePlayback(false);
  }

  function updatePlayback(force = false) {
    if (!state.track) return;
    const time = currentTime();
    const duration = state.track.duration || audio.duration || 0;
    $('seek').value = duration ? time / duration * 1000 : 0;
    $('clock').textContent = `${Core.formatTime(time)} / ${Core.formatTime(duration)}`;
    const index = Core.currentEventIndex(state.track.events, time, state.currentIndex);
    // what the side panel says about where the playhead is: the note, the chord, the section, the bar
    const where = `${chordIndex()}|${sectionIndex()}|${place().bar}`;
    if (index !== state.currentIndex || where !== state.where || force) {
      const note = index !== state.currentIndex || force;
      state.currentIndex = index;
      state.where = where;
      if (note) renderFretboard();
      renderSide();
    }
    renderTimeline();
    tickMetronome();
  }

  // Follows the clock while playing; a paused track is redrawn on demand instead of every frame.
  function startAnimation() {
    cancelAnimationFrame(state.animation);
    const frame = () => {
      if (!state.track) return;
      const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
      if (state.playing && bounds && currentTime() >= bounds.end) setTime(bounds.start);
      updatePlayback(false);
      state.animation = state.playing ? requestAnimationFrame(frame) : 0;
    };
    frame();
  }

  function pluck(midi, duration = 0.5) {
    state.synth ||= new (window.AudioContext || window.webkitAudioContext)();
    if (state.synth.state === 'suspended') state.synth.resume();
    const now = state.synth.currentTime;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const oscillator = state.synth.createOscillator();
    const gain = state.synth.createGain();
    const filter = state.synth.createBiquadFilter();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(260, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(state.synth.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
  }

  function scheduleDemo() {
    clearTimeout(state.demoTimer);
    if (!state.playing || !synthetic(state.track)) return;
    const event = selected();
    if (!event) return;
    state.demoClock = event.start;
    pluck(event.midi, Math.min(0.8, (event.end - event.start) / state.track.settings.speed));
    state.demoTimer = setTimeout(() => {
      if (!state.playing) return;
      if (state.currentIndex >= state.track.events.length - 1) {
        state.playing = false;
        state.currentIndex = 0;
        state.demoClock = 0;
        renderStudio(true);
        return;
      }
      state.currentIndex += 1;
      state.demoClock = state.track.events[state.currentIndex].start;
      renderStudio(true);
      scheduleDemo();
    }, Math.max(70, (event.end - event.start) * 1000 / state.track.settings.speed));
  }

  /** A click of the metronome, at a moment on the clock of the synthesiser: higher on the first beat of a bar. */
  function click(when, strong) {
    const context = state.synth;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = strong ? 1650 : 1100;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.2 : 0.13, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.07);
  }

  function wakeSynth() {
    state.synth ||= new (window.AudioContext || window.webkitAudioContext)();
    if (state.synth.state === 'suspended') state.synth.resume();
    return state.synth;
  }

  /** Whether a beat of the pulse, counted from its first, opens a bar. */
  function opensBar(rhythm, beat) {
    const onPage = beat - rhythm.downbeat;
    return Rhythm.barStart(rhythm, Rhythm.barAt(rhythm, onPage)) === onPage;
  }

  /**
   * While the track plays, the beats about to come are given their clicks a little ahead, on
   * the clock of the synthesiser, which keeps time better than a frame of animation does.
   */
  function tickMetronome() {
    const track = state.track;
    if (!state.metronome || !state.playing || state.counting || !track || synthetic(track) || audio.paused) { state.nextClick = null; return; }
    const beats = rhythmOf(track).beats;
    const time = currentTime();
    const rate = track.settings.speed || 1; // seconds of the track in a second of the clock
    const context = wakeSynth();
    // When, on the clock of the synthesiser, the track was at its start. The player tells its
    // place only roughly from one frame to the next: the answer is steadied over many frames.
    const origin = context.currentTime - time / rate;
    if (state.nextClick === null || Math.abs(time - state.clickedAt) > 0.5 || Math.abs(origin - state.origin) > 0.05) {
      state.nextClick = beats.findIndex(beat => beat >= time - 0.01);
      if (state.nextClick < 0) state.nextClick = beats.length;
      state.origin = origin;
    } else state.origin += (origin - state.origin) * 0.08;
    state.clickedAt = time;
    while (state.nextClick < beats.length && beats[state.nextClick] < time + 0.15 * rate) {
      const when = state.origin + beats[state.nextClick] / rate;
      if (when > context.currentTime - 0.03) click(Math.max(context.currentTime, when), opensBar(rhythmOf(track), state.nextClick));
      state.nextClick += 1;
    }
  }

  function cancelCount() {
    clearTimeout(state.countTimer);
    state.counting = false;
  }

  /** One bar of clicks at the tempo of the place the track is about to start from; resolves when they are over. */
  function countBar() {
    const track = state.track;
    const rhythm = rhythmOf(track);
    const context = wakeSynth();
    const position = Rhythm.positionOf(rhythm, currentTime());
    const length = Math.max(0.12, (Rhythm.timeOf(rhythm, position + 1) - Rhythm.timeOf(rhythm, position)) / (track.settings.speed || 1));
    for (let beat = 0; beat < rhythm.perBar; beat += 1) click(context.currentTime + 0.06 + beat * length, beat === 0);
    state.counting = true;
    return new Promise(resolve => {
      state.countTimer = setTimeout(() => { state.counting = false; resolve(); }, (0.06 + rhythm.perBar * length) * 1000);
    });
  }

  async function togglePlay() {
    if (!state.track) return;
    if (state.counting) { // a second press while counting calls it off
      cancelCount();
      state.playing = false;
      renderStudio(false);
      return;
    }
    const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
    if (!state.playing && bounds && (currentTime() < bounds.start || currentTime() >= bounds.end)) setTime(bounds.start);
    state.playing = !state.playing;
    if (synthetic(state.track)) {
      if (state.playing) { scheduleDemo(); startAnimation(); }
      else clearTimeout(state.demoTimer);
    } else if (state.track.audioBlob) {
      try {
        setAudioSpeed(state.track.settings.speed);
        if (state.playing && state.countIn) {
          const track = state.track;
          // Some browsers only let a page start sound from a press: the player is started and
          // stopped silently now, so that it may start by itself when the count is over.
          const at = audio.currentTime;
          state.priming = true;
          audio.muted = true;
          try {
            await audio.play();
            // the player says it has stopped a moment after being told to: wait for it to say so
            await new Promise(resolve => { audio.addEventListener('pause', resolve, { once: true }); audio.pause(); });
          } catch (error) { /* it will be tried again after the count */ }
          audio.muted = false;
          if (Math.abs(audio.currentTime - at) > 0.001) audio.currentTime = at;
          state.priming = false;
          renderStudio(false);
          await countBar();
          if (!state.playing || state.track !== track) return;
          await audio.play();
        } else if (state.playing) await audio.play();
        else audio.pause();
      } catch (error) {
        state.priming = false;
        audio.muted = false;
        state.playing = false;
      }
    } else {
      state.playing = false;
      alert(t('audioMissing'));
    }
    renderStudio(false);
  }

  function recalc(selectedId = selected()?.id) {
    state.track.events = Core.optimiseFingering(state.track.events, tuning().open, state.track.settings.frets);
    if (selectedId) {
      const index = state.track.events.findIndex(event => event.id === selectedId);
      if (index >= 0) state.currentIndex = index;
    }
    scheduleSave();
    renderStudio(true);
  }

  function changeMidi(value, absolute = false) {
    const event = selected();
    if (!event) return;
    event.midi = Core.clamp(absolute ? Number(value) : event.midi + value, 23, 76);
    event.rawMidi = event.midi;
    event.confidence = 1;
    event.edited = true;
    event.lockedPosition = false;
    event.string = null;
    event.fret = null;
    recalc();
  }

  function changePosition(value) {
    const event = selected();
    if (!event) return;
    if (value === 'auto') {
      event.lockedPosition = false;
      event.string = null;
      event.fret = null;
    } else {
      const [string, fret] = value.split(':').map(Number);
      const candidate = Core.candidatePositions(event.midi, tuning().open, state.track.settings.frets)
        .find(position => position.string === string && position.fret === fret);
      if (!candidate) return;
      event.string = string;
      event.fret = fret;
      event.lockedPosition = true;
      event.edited = true;
    }
    recalc();
  }

  function deleteCurrent() {
    if (!state.track || state.track.events.length <= 1) return;
    state.track.events.splice(state.currentIndex, 1);
    state.currentIndex = Core.clamp(state.currentIndex, 0, state.track.events.length - 1);
    recalc();
  }

  function splitCurrent() {
    const event = selected();
    if (!event || event.end - event.start < 0.12) return;
    const middle = (event.start + event.end) / 2;
    const second = { ...event, id: `${event.id}-b-${Date.now()}`, start: middle };
    event.end = middle;
    state.track.events.splice(state.currentIndex + 1, 0, second);
    recalc();
  }

  function changeTiming() {
    const event = selected();
    if (!event) return;
    const start = Number($('noteStart').value);
    const end = Number($('noteEnd').value);
    if ($('noteStart').value === '' || $('noteEnd').value === '' || !Number.isFinite(start) || !Number.isFinite(end)) {
      renderSide();
      return;
    }
    Core.updateEventTiming(state.track.events, state.currentIndex, start, end, state.track.duration);
    recalc(event.id);
  }

  function mergeCurrent() {
    const event = selected();
    if (!event || state.currentIndex >= state.track.events.length - 1) return;
    Core.mergeWithNext(state.track.events, state.currentIndex);
    recalc(event.id);
  }

  function addAtCursor() {
    if (!state.track) return;
    const start = Core.clamp(currentTime(), 0, Math.max(0, state.track.duration - 0.04));
    const next = state.track.events.find(event => event.start > start + 0.01);
    const end = Math.min(state.track.duration, next ? next.start : start + 0.25);
    const midi = selected()?.midi ?? 40;
    const event = {
      id: `added-${Date.now()}`,
      start,
      end: Math.max(start + 0.04, end),
      midi,
      rawMidi: midi,
      confidence: 1,
      string: null,
      fret: null,
      lockedPosition: false,
      edited: true
    };
    state.track.events.push(event);
    state.track.events.sort((left, right) => left.start - right.start);
    recalc(event.id);
  }

  function setLoop(which) {
    const time = currentTime();
    if (which === 'A') state.track.settings.loopA = Math.min(time, state.track.settings.loopB ?? time);
    else state.track.settings.loopB = Math.max(time, state.track.settings.loopA ?? 0);
    if (state.track.settings.loopA !== null && state.track.settings.loopB !== null
      && state.track.settings.loopB - state.track.settings.loopA < 0.15) {
      state.track.settings.loopB = Math.min(state.track.duration, state.track.settings.loopA + 0.15);
    }
    scheduleSave();
    renderLoop();
  }

  function clearLoop() {
    state.track.settings.loopA = null;
    state.track.settings.loopB = null;
    scheduleSave();
    renderLoop();
  }

  function setAudioSpeed(speed) {
    // a recording made shorter to raise its key is played slower by as much, and the other way round
    const rate = speed / state.stretch;
    audio.defaultPlaybackRate = rate;
    audio.preservesPitch = true;
    audio.webkitPreservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.playbackRate = rate;
  }

  function renderPerformance(result = state.mic?.lastResult || null) {
    const active = Boolean(state.mic);
    const card = $('performanceCard');
    card.className = `performance-card ${result?.timingStatus || (active ? 'listening' : 'idle')}`;
    const expected = result?.event || selected();
    $('performanceExpected').textContent = expected ? Core.noteName(expected.midi) : '—';
    $('performanceDetected').textContent = result ? `${t('detected')} ${Core.noteName(Math.round(result.detectedMidi))}` : '—';
    if (result) {
      const timing = result.correct ? ` · ${result.timing >= 0 ? '+' : ''}${Math.round(result.timing * 1000)} ms` : '';
      $('performanceStatus').textContent = `${t(result.timingStatus)}${timing}`;
    } else $('performanceStatus').textContent = active ? t('micListening') : t('micReady');
    const hits = state.mic?.hits?.size || 0;
    const attempts = state.mic?.attempts?.size || 0;
    $('performanceScore').textContent = `${t('score')}: ${hits} / ${attempts}`;
    $('microphoneButton').textContent = active ? t('micStop') : t('micStart');
    $('microphoneButton').classList.toggle('active', active);
  }

  function sampleMicrophone() {
    const mic = state.mic;
    if (!mic || !state.track) return;
    mic.analyser.getFloatTimeDomainData(mic.buffer);
    const pitch = Core.estimatePitch(mic.buffer, mic.context.sampleRate);
    if (pitch) {
      const result = Core.assessPerformance(state.track.events, currentTime(), pitch.midi);
      if (result) {
        mic.attempts.add(result.event.id);
        if (result.correct) {
          mic.hits.add(result.event.id);
          const onset = mic.onsets.get(result.event.id);
          if (onset) Object.assign(result, onset);
          else mic.onsets.set(result.event.id, { timing: result.timing, timingStatus: result.timingStatus });
        }
        mic.lastResult = result;
        renderPerformance(result);
      }
    }
    mic.timer = setTimeout(sampleMicrophone, 80);
  }

  async function startMicrophone() {
    if (state.mic) { stopMicrophone(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      state.mic = {
        stream, context, source, analyser, buffer: new Float32Array(analyser.fftSize),
        timer: 0, hits: new Set(), attempts: new Set(), onsets: new Map(), lastResult: null
      };
      renderPerformance();
      sampleMicrophone();
      if (!state.playing) await togglePlay();
    } catch (error) {
      $('performanceStatus').textContent = t('micDenied');
      $('performanceCard').className = 'performance-card wrong';
    }
  }

  function stopMicrophone(reset = false) {
    const mic = state.mic;
    if (!mic) {
      if (reset && $('performanceCard')) renderPerformance(null);
      return;
    }
    clearTimeout(mic.timer);
    mic.stream.getTracks().forEach(track => track.stop());
    mic.context.close().catch(() => {});
    const summary = reset ? null : { hits: mic.hits, attempts: mic.attempts, lastResult: mic.lastResult };
    state.mic = null;
    renderPerformance(summary?.lastResult || null);
    if (summary) $('performanceScore').textContent = `${t('score')}: ${summary.hits.size} / ${summary.attempts.size}`;
  }

  function exportProject() {
    const track = state.track;
    const project = {
      manico: 6,
      version: Core.VERSION,
      title: track.title,
      duration: track.duration,
      settings: track.settings,
      transpose: track.transpose || 0,
      rhythm: rhythmOf(track),
      chords: (track.chords || []).map(chord => ({ ...chord, name: Chords.nameOf(chord) })),
      sections: track.sections || [],
      events: track.events.map(event => ({
        start: event.start, end: event.end, midi: event.midi, note: Core.noteName(event.midi),
        confidence: event.confidence, string: event.string, fret: event.fret,
        lockedPosition: event.lockedPosition, edited: event.edited
      }))
    };
    download(`${safeName(track.title)}.manico.json`, JSON.stringify(project, null, 2), 'application/json');
  }

  /**
   * Opens the dialog. `mode` is 'import' for a new file; for a saved track, 'isolate' separates
   * its bass and 'retranscribe' reads its notes again.
   */
  function openImport(file, track = null, mode = 'import') {
    if (!file) return;
    state.pendingFile = file;
    state.pendingTrack = track;
    state.pendingMode = track ? mode : 'import';
    state.cancelled = false;
    const titles = { import: 'analyseTitle', isolate: 'isolateTitle', retranscribe: 'retranscribeTitle' };
    const actions = { import: 'startAnalysis', isolate: 'isolateStart', retranscribe: 'retranscribeStart' };
    const hints = { import: 'analyseHint', isolate: 'isolateHint', retranscribe: 'retranscribeHint' };
    $('importFileName').textContent = track ? track.title : file.name;
    $('analysisTitle').textContent = t(titles[state.pendingMode]);
    $('startAnalysis').textContent = t(actions[state.pendingMode]);
    $('isolateRow').hidden = state.pendingMode !== 'import' || !state.separable;
    $('retranscribeRow').hidden = state.pendingMode !== 'isolate';
    $('analysisStatus').textContent = t(hints[state.pendingMode]);
    $('analysisProgress').style.width = '0%';
    $('startAnalysis').disabled = false;
    $('analysisModal').hidden = false;
  }

  function separationStatus(data) {
    const megabytes = value => Math.round(value / 1048576);
    if (data.stage === 'model') return `${t('modelDownload')}… ${megabytes(data.loaded)}${data.total ? ` / ${megabytes(data.total)}` : ''} MB`;
    if (data.stage === 'start') return t('modelStart');
    if (data.stage === 'separate') return `${t('separating')}… ${data.step} / ${data.total}`;
    return t('encoding');
  }

  async function startImport() {
    const file = state.pendingFile;
    const existing = state.pendingTrack;
    const mode = state.pendingMode;
    if (!file) return;
    state.cancelled = false;
    $('startAnalysis').disabled = true;
    const isolate = mode === 'isolate' || (mode === 'import' && state.separable && $('isolateBass').checked);
    const readNotes = mode !== 'isolate' || $('retranscribe').checked;
    const progress = (value, text) => {
      $('analysisProgress').style.width = `${Math.round(Core.clamp(value, 0, 1) * 100)}%`;
      if (text) $('analysisStatus').textContent = text;
    };
    let wakeLock = null;
    try {
      progress(0.03, t('decoding'));
      let mix;
      let source;
      let stems = null;
      let isolated = false;
      if (isolate) {
        // Minutes of work: keep the screen from sleeping where the browser allows it.
        try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (error) { wakeLock = null; }
        mix = await Separator.decode(file);
        if (state.cancelled) return;
        try {
          state.job = Separator.separate(mix, data => progress(0.05 + data.value * 0.77, separationStatus(data)));
          const result = await state.job.promise;
          stems = { backing: result.backing, bass: result.bassAudio };
          source = result.bass;
          isolated = true;
        } catch (error) {
          if (state.cancelled || error?.message === 'CANCELLED') return;
          // A new import still gets its transcription, from the full mix as before.
          if (existing) throw new Error('SEPARATION_FAILED');
          console.warn('Manico: bass separation failed', error);
          source = mix;
        } finally {
          state.job = null;
        }
      } else {
        mix = await Transcriber.decode(file);
        source = mix;
        // A track separated earlier is read again from its bass alone.
        if (existing?.stems?.bass) {
          source = await Transcriber.decode(existing.stems.bass);
          isolated = true;
        }
      }
      if (state.cancelled) return;
      let events = null;
      if (readNotes) {
        const base = isolate ? 0.84 : 0.05;
        events = await Transcriber.transcribe(source, {
          isolated,
          // an isolated bass is held against the recording it came from, and read for the instrument
          mix: isolated ? mix : null,
          lowest: (Core.TUNINGS[existing?.settings?.tuning] || Core.TUNINGS['4']).open[0],
          sensitivity: Number($('sensitivity').value) / 100,
          onProgress(value, stage) {
            progress(base + value * (0.97 - base), stage === 'prepare' ? t('preparing') : t('analysing'));
          }
        });
        if (state.cancelled) return;
        if (!events.length) throw new Error(isolated ? 'NO_BASS' : 'NO_NOTES');
      }
      progress(0.98, t('findingBeat'));
      await new Promise(resolve => setTimeout(resolve, 0));
      const rhythm = Rhythm.analyse(mix);
      if (state.cancelled) return;
      const harmonise = async (target, firstBeat) => {
        if (!target.stems?.backing || !target.rhythm) return;
        progress(0.99, t('readingChords'));
        await new Promise(resolve => setTimeout(resolve, 0));
        try { await readChords(target, firstBeat); } catch (error) { console.warn('Manico: the chords could not be read', error); }
      };
      const now = Date.now();
      let id;
      if (existing) {
        id = existing.id;
        if (stems) existing.stems = stems;
        if (events) {
          const open = (Core.TUNINGS[existing.settings.tuning] || Core.TUNINGS['4']).open;
          const moved = existing.transpose ? Pitch.shiftEvents(events, existing.transpose, open, existing.settings.frets) : events;
          existing.events = Core.optimiseFingering(moved, open, existing.settings.frets);
          existing.analysisVersion = READER;
          existing.source = isolated ? 'bass' : 'mix';
        }
        if (rhythm && !existing.rhythm) existing.rhythm = rhythm;
        // a bass isolated just now brings the chords with it; ones already there are kept
        if (stems && !existing.chords) await harmonise(existing, false);
        existing.updatedAt = now;
        progress(1, t('saving'));
        clearTimeout(state.saveTimer);
        await Store.save(existing);
      } else {
        id = `track-${now}-${Math.random().toString(36).slice(2, 8)}`;
        const settings = { tuning: '4', frets: Core.DEFAULT_FRETS, lookahead: 3, speed: 1, loopA: null, loopB: null };
        const track = {
          id,
          title: file.name.replace(/\.[^.]+$/, ''),
          filename: file.name,
          mime: file.type,
          audioBlob: file,
          duration: mix.duration,
          createdAt: now,
          updatedAt: now,
          analysisVersion: READER,
          source: isolated ? 'bass' : 'mix',
          settings,
          events: Core.optimiseFingering(events, Core.TUNINGS['4'].open, settings.frets)
        };
        if (stems) track.stems = stems;
        if (rhythm) track.rhythm = rhythm;
        await harmonise(track, true);
        progress(1, t('saving'));
        await Store.save(track);
      }
      const skipped = isolate && !stems;
      state.pendingFile = null;
      state.pendingTrack = null;
      $('analysisModal').hidden = true;
      await loadLibrary();
      await refreshStorage();
      await openTrack(id, false);
      if (skipped) $('savedLabel').textContent = t('separationSkipped');
    } catch (error) {
      $('startAnalysis').disabled = false;
      $('analysisProgress').style.width = '0%';
      $('analysisStatus').textContent = t({ NO_NOTES: 'noNotes', NO_BASS: 'noBass', SEPARATION_FAILED: 'separationFailed' }[error?.message] || 'failed');
    } finally {
      try { await wakeLock?.release(); } catch (error) { /* already released */ }
    }
  }

  function cancelImport() {
    state.cancelled = true;
    state.job?.cancel();
    state.job = null;
    state.pendingFile = null;
    state.pendingTrack = null;
    $('analysisModal').hidden = true;
  }

  function populate() {
    $('tuningSelect').innerHTML = Object.entries(Core.TUNINGS)
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`).join('');
    $('fretsSelect').innerHTML = [12, 15, 18, 24]
      .map(value => `<option value="${value}">${value}</option>`).join('');
    $('lookaheadSelect').innerHTML = [2, 3, 4, 5]
      .map(value => `<option value="${value}">${value}</option>`).join('');
    $('speedSelect').innerHTML = [0.5, 0.65, 0.75, 0.85, 1, 1.1, 1.25]
      .map(value => `<option value="${value}">${Math.round(value * 100)}%</option>`).join('');
    $('noteSelect').innerHTML = Array.from({ length: 54 }, (_, index) => 23 + index)
      .map(midi => `<option value="${midi}">${Core.noteName(midi)}</option>`).join('');
  }

  function bind() {
    $('langIt').onclick = () => setLanguage('it');
    $('langEn').onclick = () => setLanguage('en');
    $('helpLink').onclick = event => {
      event.preventDefault();
      window.location.assign(state.lang === 'en' ? 'help-en.html' : 'help-it.html');
    };
    $('homeButton').onclick = () => { stopAudio(); state.track = null; show('home'); };
    $('importTop').onclick = () => $('fileInput').click();
    $('chooseFile').onclick = () => $('fileInput').click();
    $('fileInput').onchange = () => { openImport($('fileInput').files[0]); $('fileInput').value = ''; };
    $('startAnalysis').onclick = startImport;
    $('cancelAnalysis').onclick = cancelImport;
    $('sensitivity').oninput = event => { $('sensitivityValue').textContent = `${event.target.value}%`; };
    const drop = $('dropzone');
    drop.ondragover = event => { event.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = event => { event.preventDefault(); drop.classList.remove('over'); openImport(event.dataTransfer.files[0]); };
    $('backHome').onclick = () => { stopAudio(); state.track = null; show('home'); };
    $('playButton').onclick = togglePlay;
    $('tabStrip').onclick = clickTab;
    window.addEventListener('resize', () => { if (state.track && !$('studioView').hidden) renderTimeline(); });
    $('seek').oninput = event => setTime(Number(event.target.value) / 1000 * (state.track?.duration || 0));
    $('speedSelect').onchange = event => {
      state.track.settings.speed = Number(event.target.value);
      setAudioSpeed(state.track.settings.speed);
      scheduleSave();
      if (state.playing && synthetic(state.track)) scheduleDemo();
      state.nextClick = null;
    };
    $('tuningSelect').onchange = event => { state.track.settings.tuning = event.target.value; recalc(); };
    $('fretsSelect').onchange = event => { state.track.settings.frets = Number(event.target.value); recalc(); };
    $('lookaheadSelect').onchange = event => {
      state.track.settings.lookahead = Number(event.target.value);
      scheduleSave();
      renderStudio(true);
    };
    $('setLoopA').onclick = () => setLoop('A');
    $('setLoopB').onclick = () => setLoop('B');
    $('clearLoop').onclick = clearLoop;
    $('microphoneButton').onclick = startMicrophone;
    $('listenMix').onclick = () => setListen('mix');
    $('listenBacking').onclick = () => setListen('backing');
    $('listenBass').onclick = () => setListen('bass');
    for (const [id, mode] of [['isolateExisting', 'isolate'], ['retranscribeTrack', 'retranscribe']]) {
      $(id).onclick = () => {
        const track = state.track;
        if (!track?.audioBlob) return;
        if (state.playing) togglePlay();
        openImport(track.audioBlob, track, mode);
      };
    }
    $('barEarlier').onclick = () => adjustRhythm('earlier');
    $('barLater').onclick = () => adjustRhythm('later');
    $('tempoHalf').onclick = () => adjustRhythm('half');
    $('tempoDouble').onclick = () => adjustRhythm('double');
    $('meterToggle').onclick = () => adjustRhythm('meter');
    $('offBeat').onclick = () => adjustRhythm('offbeat');
    $('barFewer').onclick = () => adjustRhythm('fewer');
    $('barMore').onclick = () => adjustRhythm('more');
    $('keyDown').onclick = () => moveKey(-1);
    $('keyUp').onclick = () => moveKey(1);
    $('keyReset').onclick = () => moveKey(0);
    for (const [id, name] of [['countIn', 'countIn'], ['metronome', 'metronome']]) {
      try { state[name] = localStorage.getItem(`manico-${name}`) === '1'; } catch (error) {}
      $(id).checked = state[name];
      $(id).onchange = event => {
        state[name] = event.target.checked;
        state.nextClick = null;
        if (state[name]) wakeSynth(); // a press is what lets the page make sound
        try { localStorage.setItem(`manico-${name}`, state[name] ? '1' : '0'); } catch (error) {}
      };
    }
    $('chordDown').onclick = () => editChord('down');
    $('chordUp').onclick = () => editChord('up');
    $('chordKind').onclick = () => editChord('kind');
    $('chordAdd').onclick = () => editChord('add');
    $('chordRemove').onclick = () => editChord('remove');
    $('chordsRead').onclick = rereadChords;
    $('sectionAdd').onclick = () => editSection('add');
    $('sectionKind').onclick = () => editSection('kind');
    $('sectionLoop').onclick = () => editSection('loop');
    $('sectionRemove').onclick = () => editSection('remove');
    $('noteSelect').onchange = event => changeMidi(Number(event.target.value), true);
    $('positionSelect').onchange = event => changePosition(event.target.value);
    $('noteDown').onclick = () => changeMidi(-1);
    $('noteUp').onclick = () => changeMidi(1);
    $('deleteNote').onclick = deleteCurrent;
    $('splitNote').onclick = splitCurrent;
    $('noteStart').onchange = changeTiming;
    $('noteEnd').onchange = changeTiming;
    $('mergeNote').onclick = mergeCurrent;
    $('addNote').onclick = addAtCursor;
    $('exportTab').onclick = () => download(`${safeName(state.track.title)}.txt`, Core.renderTab(state.track, state.track.settings.tuning));
    $('exportMidi').onclick = () => download(`${safeName(state.track.title)}.mid`, Core.renderMidi(state.track), 'audio/midi');
    $('exportPdf').onclick = () => download(`${safeName(state.track.title)}.pdf`, Sheet.pdf(printable(state.track), rhythmOf(state.track)), 'application/pdf');
    $('exportXml').onclick = () => download(`${safeName(state.track.title)}.musicxml`, Sheet.musicXML(printable(state.track), rhythmOf(state.track)), 'application/vnd.recordare.musicxml+xml');
    $('exportProject').onclick = exportProject;
    $('trackTitle').onchange = event => { state.track.title = event.target.value.trim() || state.track.title; scheduleSave(); };
    audio.onplay = () => { if (state.priming) return; state.playing = true; renderStudio(false); startAnimation(); };
    audio.onpause = () => { if (state.switching || state.priming) return; state.playing = false; renderStudio(false); };
    audio.onended = () => { state.playing = false; setTime(0); renderStudio(false); };
    audio.onloadedmetadata = () => { if (state.track && !state.track.duration) state.track.duration = audio.duration * state.stretch; updatePlayback(true); };
    document.addEventListener('keydown', event => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName) || $('studioView').hidden) return;
      if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
      else if (event.key === 'ArrowRight') selectEvent(state.currentIndex + 1);
      else if (event.key === 'ArrowLeft') selectEvent(state.currentIndex - 1);
      else if (event.key === '[') setLoop('A');
      else if (event.key === ']') setLoop('B');
    });
  }

  async function init() {
    state.lang = readLanguage();
    populate();
    bind();
    state.persistent = await Store.persist();
    state.separable = await Separator.available();
    await loadLibrary();
    await refreshStorage();
    applyLanguage();
    show('home');
  }

  init().catch(error => {
    $('fatalError').hidden = false;
    $('fatalError').textContent = error?.message || String(error);
    console.error(error);
  });
})(globalThis);
