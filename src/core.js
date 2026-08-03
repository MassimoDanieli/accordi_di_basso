(function initManicoCore(root) {
  'use strict';

  const VERSION = '5.3.0';
  const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const TUNINGS = {
    '4':  { label: 'E A D G', open: [28, 33, 38, 43] },
    '5':  { label: 'B E A D G', open: [23, 28, 33, 38, 43] },
    '5c': { label: 'E A D G C', open: [28, 33, 38, 43, 48] },
    '6':  { label: 'B E A D G C', open: [23, 28, 33, 38, 43, 48] }
  };
  const DEMOS = [
    { id: 'demo-blues', title: 'Slow Blues in F', style: 'Blues', bpm: 82, notes: ['F1','A1','C2','Eb2','F2','C2','A1','F1','Bb1','D2','F2','Ab2','A1','C2','Eb2','E2','F2'] },
    { id: 'demo-funk', title: 'Funk Pocket', style: 'Funk', bpm: 104, notes: ['E1','E1','G1','A1','B1','D2','E2','D2','B1','A1','G1','E1','E2','D2','B1','A1'] },
    { id: 'demo-reggae', title: 'Reggae One Drop', style: 'Reggae', bpm: 74, notes: ['A1','E2','G2','A2','A1','E2','D2','C2','A1','E2','G2','A2'] },
    { id: 'demo-bossa', title: 'Bossa in D minor', style: 'Bossa', bpm: 112, notes: ['D2','A1','C2','D2','F2','A2','G2','E2','D2','A1','C2','Db2'] },
    { id: 'demo-eighths', title: 'Rock Eighths', style: 'Rock', bpm: 126, notes: ['A1','A1','A1','A1','C2','C2','D2','D2','A1','A1','G1','G1','E1','E1','A1','A1'] }
  ];

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
        const observation = octaveDistance * (1.1 + confidence * 3.2)
          + Math.abs(candidate - 36) * 0.006;

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
        edited: Boolean(event.edited)
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

  function createDemoTrack(definition, tuning = '4') {
    const beat = 60 / definition.bpm;
    let time = 0;
    const events = definition.notes.map((name, index) => {
      const length = beat * (definition.style === 'Rock' ? 0.5 : index % 4 === 3 ? 1.08 : 0.82);
      const midi = parseNote(name);
      const event = { id: `${definition.id}-${index}`, start: time, end: time + length, midi, rawMidi: midi, confidence: 1 };
      time += length;
      return event;
    });
    return {
      id: definition.id,
      demo: true,
      title: definition.title,
      style: definition.style,
      bpm: definition.bpm,
      duration: time,
      createdAt: 0,
      updatedAt: 0,
      analysisVersion: 2,
      settings: { tuning, frets: 15, lookahead: 3, speed: 1, loopA: null, loopB: null },
      events: optimiseFingering(events, TUNINGS[tuning].open, 15)
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
    VERSION, NOTE_NAMES, TUNINGS, DEMOS, clamp, formatTime, noteName, parseNote,
    fretPosition, candidatePositions, positionMatchesMidi, validLoopBounds, updateEventTiming,
    mergeWithNext, renderMidi, stabilizeOctaves,
    optimiseFingering, normalizeEvents, currentEventIndex, previewWindow,
    createDemoTrack, renderTab
  };
})(globalThis);
