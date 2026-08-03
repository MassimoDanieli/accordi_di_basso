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


(function initManicoTranscriber(root) {
  'use strict';

  const Core = root.ManicoCore;
  const TARGET_RATE = 5512;

  function workerSource() {
    return `'use strict';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function percentile(values,ratio){if(!values.length)return 0;const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*ratio)))];}
function rms(signal,start,length){let sum=0;const end=Math.min(signal.length,start+length);for(let index=start;index<end;index++){const value=signal[index];sum+=value*value;}return Math.sqrt(sum/Math.max(1,end-start));}
function onsets(signal,sampleRate,sensitivity){const hop=Math.max(1,Math.round(sampleRate*.01)),windowSize=Math.max(hop*3,Math.round(sampleRate*.04)),energy=[];for(let position=0;position+windowSize<signal.length;position+=hop)energy.push(rms(signal,position,windowSize));const noise=percentile(energy,.32),strong=percentile(energy,.91),threshold=noise+(strong-noise)*(1-sensitivity)*.68,flux=energy.map((value,index)=>index<2?0:value-Math.max(energy[index-1],energy[index-2])),fluxThreshold=Math.max(.000003,percentile(flux.filter(value=>value>0),.64)*(1.05-sensitivity*.34)),minimumGap=Math.max(1,Math.round(.052*sampleRate/hop)),result=[];let last=-minimumGap;for(let index=2;index<energy.length-2;index++){const local=flux[index]>=flux[index-1]&&flux[index]>=flux[index+1];if(local&&energy[index]>threshold&&flux[index]>fluxThreshold&&index-last>=minimumGap){result.push(index*hop/sampleRate);last=index;}}if(!result.length||result[0]>.18)result.unshift(0);return result;}
function correlation(signal,start,size,lag){let xy=0,xx=0,yy=0;const end=Math.min(signal.length,start+size-lag);for(let index=start;index<end;index++){const left=signal[index],right=signal[index+lag];xy+=left*right;xx+=left*left;yy+=right*right;}return xy/(Math.sqrt(xx*yy)||1);}
function estimateWindow(signal,sampleRate,start,size){const minimumLag=Math.max(2,Math.floor(sampleRate/330)),maximumLag=Math.min(Math.floor(sampleRate/31),Math.floor(size/2));let bestLag=-1,bestScore=-1;const scores=new Float32Array(maximumLag+1);for(let lag=minimumLag;lag<=maximumLag;lag++){const score=correlation(signal,start,size,lag);scores[lag]=score;if(score>bestScore){bestScore=score;bestLag=lag;}}if(bestLag<0||bestScore<.47)return null;let chosen=bestLag;while(chosen*2<=maximumLag&&scores[chosen*2]>=bestScore*.9){chosen*=2;bestScore=Math.max(bestScore,scores[chosen]);}const frequency=sampleRate/chosen,midi=Math.round(69+12*Math.log2(frequency/440));return midi>=23&&midi<=76?{midi,confidence:bestScore}:null;}
function pitch(signal,sampleRate,time){const votes=[];for(const offset of [.026,.072,.124,.176]){const start=Math.max(0,Math.floor((time+offset)*sampleRate)),size=Math.min(Math.round(sampleRate*.17),signal.length-start);if(size<Math.round(sampleRate*.075))continue;const estimate=estimateWindow(signal,sampleRate,start,size);if(estimate)votes.push(estimate);}if(!votes.length)return null;const groups=new Map();for(const vote of votes){const key=vote.midi,item=groups.get(key)||{score:0,count:0};item.score+=vote.confidence;item.count++;groups.set(key,item);}let selected=null;for(const[midi,item]of groups){const score=item.score+item.count*.18;if(!selected||score>selected.score)selected={midi,score,confidence:item.score/item.count};}return selected;}
self.onmessage=message=>{const{signal,sampleRate,sensitivity,duration}=message.data,points=onsets(signal,sampleRate,sensitivity),events=[];for(let index=0;index<points.length;index++){const start=points[index],next=index+1<points.length?points[index+1]:Math.min(duration,start+.72),found=pitch(signal,sampleRate,start);if(found&&found.confidence>=.47)events.push({start,end:Math.max(start+.045,next),midi:found.midi,rawMidi:found.midi,confidence:clamp(found.confidence,0,1)});if(index%6===0)self.postMessage({type:'progress',value:(index+1)/points.length});}self.postMessage({type:'result',events});};`;
  }

  function createWorker() {
    const url = URL.createObjectURL(new Blob([workerSource()], { type: 'text/javascript' }));
    const instance = new Worker(url);
    instance.__url = url;
    return instance;
  }

  async function decode(file) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    try { return await context.decodeAudioData((await file.arrayBuffer()).slice(0)); }
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

  async function transcribe(buffer, options = {}) {
    const progress = options.onProgress || (() => {});
    const prepared = await prepare(buffer, value => progress(value * 0.22, 'prepare'));
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
          resolve(Core.stabilizeOctaves(normalized));
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
        duration: buffer.duration
      }, [prepared.signal.buffer]);
    });
  }

  root.ManicoTranscriber = { decode, transcribe, dedupeEvents };
})(globalThis);


(function initManicoDefaults(root) {
  'use strict';

  const Core = root.ManicoCore;
  const Store = root.ManicoStorage;
  if (!Core || !Store) throw new Error('Manico defaults require core and storage');

  const VERSION = '5.3.0';
  const DEFAULT_FRETS = 12;

  // Version is exposed by the core object and read by the application at startup.
  Core.VERSION = VERSION;

  // Included exercises start in the accompaniment-friendly 0-12 range.
  const createDemoTrack = Core.createDemoTrack.bind(Core);
  Core.createDemoTrack = function createTwelveFretDemo(definition, tuning = '4') {
    const track = createDemoTrack(definition, tuning);
    track.settings = { ...track.settings, frets: DEFAULT_FRETS };
    const open = Core.TUNINGS[track.settings.tuning || tuning]?.open || Core.TUNINGS['4'].open;
    track.events = Core.optimiseFingering(track.events || [], open, DEFAULT_FRETS);
    return track;
  };

  // The importer still builds a transient track object internally. Normalize only
  // genuinely new tracks before their first IndexedDB write; existing 15/18/24-fret
  // projects keep the user's selected range.
  const save = Store.save.bind(Store);
  Store.save = async function saveWithTwelveFretDefault(track) {
    const isNewTrack = track
      && !track.demo
      && Number(track.createdAt) > 0
      && Number(track.createdAt) === Number(track.updatedAt)
      && Number(track.settings?.frets) === 15;

    if (isNewTrack) {
      track.settings = { ...track.settings, frets: DEFAULT_FRETS };
      const open = Core.TUNINGS[track.settings.tuning || '4']?.open || Core.TUNINGS['4'].open;
      track.events = Core.optimiseFingering(track.events || [], open, DEFAULT_FRETS);
    }
    return save(track);
  };

  if (typeof document === 'undefined' || !document.head) return;

  // A restrained finish: warm maple, lighter metal and cleaner note markers.
  const style = document.createElement('style');
  style.id = 'manico-fretboard-finish-512';
  style.textContent = `
    .instrument-stage {
      background: linear-gradient(180deg, rgba(248, 231, 205, .035), rgba(0, 0, 0, .18));
      border-color: rgba(239, 216, 181, .08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035), 0 12px 34px rgba(0, 0, 0, .16);
    }
    #fretboard stop[stop-color="#efd4a1"] { stop-color: #efd7aa; }
    #fretboard stop[stop-color="#dfbd82"] { stop-color: #d9b77d; }
    #fretboard stop[stop-color="#c9985b"] { stop-color: #bd874f; }
    #fretboard stop[stop-color="#6f6a62"] { stop-color: #5d5953; }
    #fretboard stop[stop-color="#f1ede5"] { stop-color: #f7f2e9; }
    #fretboard stop[stop-color="#756f67"] { stop-color: #68625b; }
    #fretboard [fill="#f8f4ea"] { fill: #f3eee6; }
    #fretboard [stroke="#96764f"] { stroke: #856b52; }
    #fretboard [stroke="#b59b78"] { stroke: #c4ad8e; }
    #fretboard [stroke="#8c6e4b"] { stroke: #72563e; }
    #fretboard [stroke="#fff7e8"] { stroke: #fff8ec; }
    #fretboard [stroke="#6f4d2f"] { stroke: #5f422d; }
    #fretboard [fill="#8f7045"] { fill: #7d5d38; opacity: .55; }
    #fretboard .string-label { fill: #3a3026; font-size: 22px; filter: none; }
    #fretboard .fret-number { fill: #5f554a; font-size: 17px; font-weight: 750; }
    #fretboard .neck-marker { filter: drop-shadow(0 3px 5px rgba(38, 25, 15, .24)); }
    #fretboard .neck-marker.current { filter: url(#noteGlow) drop-shadow(0 4px 7px rgba(38, 25, 15, .30)); }
    #fretboard .marker-note {
      font-size: 15px;
      letter-spacing: -.02em;
      paint-order: stroke;
      stroke: rgba(255, 255, 255, .22);
      stroke-width: .8px;
    }
    #fretboard .marker-order { font-size: 11px; }
    @media (max-width: 760px) {
      .instrument-stage { width: 820px; min-width: 820px; }
      #fretboard { width: 800px; min-width: 800px; }
    }
  `;
  document.head.appendChild(style);
})(globalThis);


(function initManicoApp(root) {
  'use strict';

  const Core = root.ManicoCore;
  const Store = root.ManicoStorage;
  const Transcriber = root.ManicoTranscriber;
  if (!Core || !Store || !Transcriber) throw new Error('Manico modules missing');

  const $ = id => document.getElementById(id);
  const audio = $('audio');

  const COPY = {
    it: {
      product: 'Bass Transcriber', import: 'Importa audio', eyebrow: 'Dal brano alle dita',
      heroTitle: 'Ascolta. Trascrivi. Suona.',
      heroText: 'Importa una registrazione, ricava la linea di basso e studiala sul manico. Audio, trascrizione e correzioni restano sul tuo dispositivo.',
      privacy: 'Nessun upload. Tutto avviene nel browser.', dropTitle: 'Porta qui il tuo brano',
      dropText: 'MP3, WAV, M4A, AAC, OGG o FLAC', choose: 'Scegli un file',
      yourTracks: 'I tuoi brani', yourTracksHint: 'Riapri una trascrizione e continua da dove eri rimasto.',
      examples: 'Esercizi inclusi', examplesHint: 'Linee essenziali pronte per provare il flusso.',
      empty: 'Non hai ancora importato brani.', open: 'Apri', remove: 'Elimina',
      confirmDelete: 'Eliminare questo brano e il suo audio?', notes: 'note', storage: 'Spazio locale',
      unavailable: 'non disponibile', saved: 'Salvato sul dispositivo', demo: 'Esercizio incluso',
      previous: 'precedente', current: 'adesso', upcoming: 'in arrivo', now: 'Adesso',
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
      persistentYes: 'archiviazione persistente', persistentNo: 'il browser può liberare spazio automaticamente',
      importedLine: 'Linea di basso trascritta',
      keys: 'Spazio: play/pausa · frecce: nota precedente/successiva · [ A · ] B',
      audioMissing: 'L’audio salvato non è più disponibile, ma la trascrizione è rimasta.',
      migrated: 'Ottave e posizioni riallineate', version: `Versione ${Core.VERSION}`
    },
    en: {
      product: 'Bass Transcriber', import: 'Import audio', eyebrow: 'From the track to your fingers',
      heroTitle: 'Listen. Transcribe. Play.',
      heroText: 'Import a recording, extract the bass line and practise it on the fretboard. Audio, transcription and corrections stay on your device.',
      privacy: 'No upload. Everything happens in your browser.', dropTitle: 'Drop your track here',
      dropText: 'MP3, WAV, M4A, AAC, OGG or FLAC', choose: 'Choose a file',
      yourTracks: 'Your tracks', yourTracksHint: 'Reopen a transcription and continue where you left off.',
      examples: 'Included exercises', examplesHint: 'Essential lines ready to demonstrate the workflow.',
      empty: 'You have not imported a track yet.', open: 'Open', remove: 'Delete',
      confirmDelete: 'Delete this track and its stored audio?', notes: 'notes', storage: 'Local storage',
      unavailable: 'unavailable', saved: 'Saved on device', demo: 'Included exercise',
      previous: 'previous', current: 'now', upcoming: 'coming next', now: 'Now',
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
      persistentYes: 'persistent storage', persistentNo: 'the browser may reclaim storage automatically',
      importedLine: 'Transcribed bass line',
      keys: 'Space: play/pause · arrows: previous/next note · [ A · ] B',
      audioMissing: 'The stored audio is no longer available, but the transcription remains.',
      migrated: 'Octaves and positions realigned', version: `Version ${Core.VERSION}`
    }
  };

  const state = {
    lang: 'it', tracks: [], track: null, currentIndex: 0, pendingFile: null,
    cancelled: false, audioUrl: null, playing: false, animation: 0,
    demoTimer: 0, demoClock: 0, saveTimer: 0, persistent: false, synth: null
  };

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
    $('langIt').classList.toggle('on', state.lang === 'it');
    $('langEn').classList.toggle('on', state.lang === 'en');
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
    cover.textContent = track.demo ? track.style.slice(0, 2).toUpperCase() : 'MP3';
    const info = document.createElement('div');
    const title = document.createElement('h3');
    const meta = document.createElement('div');
    title.textContent = track.title;
    meta.className = 'meta';
    meta.textContent = `${track.events?.length || 0} ${t('notes')} · ${Core.formatTime(track.duration)}${track.demo ? ` · ${track.style}` : ''}`;
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
    cancelAnimationFrame(state.animation);
    clearTimeout(state.demoTimer);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = null;
    state.playing = false;
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
    state.track = track;
    state.currentIndex = 0;
    state.demoClock = 0;
    if (track.audioBlob) {
      state.audioUrl = URL.createObjectURL(track.audioBlob);
      audio.src = state.audioUrl;
      audio.preload = 'metadata';
      setAudioSpeed(track.settings.speed || 1);
    }
    show('studio');
    renderStudio(true);
    startAnimation();
    if (migrated) {
      $('savedLabel').textContent = t('migrated');
      scheduleSave();
    }
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
    return state.track?.demo ? state.demoClock : (audio.currentTime || 0);
  }

  function setTime(value) {
    if (!state.track) return;
    const time = Core.clamp(value, 0, state.track.duration || 0);
    if (state.track.demo) {
      state.demoClock = time;
      state.currentIndex = Core.currentEventIndex(state.track.events, time, state.currentIndex);
      if (state.playing) scheduleDemo();
    } else {
      audio.currentTime = time;
      updatePlayback(true);
    }
  }

  const selected = () => state.track?.events?.[state.currentIndex] || null;
  const preview = () => Core.previewWindow(state.track?.events || [], state.currentIndex, state.track?.settings?.lookahead || 3);

  function selectEvent(index, seek = true) {
    if (!state.track?.events?.length) return;
    state.currentIndex = Core.clamp(index, 0, state.track.events.length - 1);
    if (seek) setTime(state.track.events[state.currentIndex].start);
    renderStudio(true);
  }

  function renderTimeline() {
    const box = $('phraseStrip');
    box.replaceChildren();
    const events = state.track.events;
    const window = preview();
    const start = Math.max(0, window.index - 7);
    const end = Math.min(events.length, window.index + 22);
    const futureIds = new Set(window.upcoming.map(event => event.id));

    for (let index = start; index < end; index += 1) {
      const event = events[index];
      const button = document.createElement('button');
      button.className = `phrase-note${event === window.current ? ' current' : futureIds.has(event.id) ? ' next' : ''}`;
      button.dataset.eventId = event.id;
      const strong = document.createElement('strong');
      const small = document.createElement('small');
      strong.textContent = Core.noteName(event.midi);
      small.textContent = `${Core.formatTime(event.start)} · ${event.string === null ? '—' : `${stringName(event.string)}${event.fret}`}`;
      button.append(strong, small);
      button.onclick = () => selectEvent(index);
      box.append(button);
    }
    requestAnimationFrame(() => {
      const current = box.querySelector('.current');
      if (!current) return;
      const left = current.offsetLeft - (box.clientWidth - current.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
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

  function renderFretboard() {
    const svg = $('fretboard');
    const track = state.track;
    const open = tuning().open;
    const strings = open.length;
    const frets = track.settings.frets;
    const geometry = neckGeometry(strings, frets);
    const window = preview();
    svg.setAttribute('viewBox', `0 0 ${geometry.width} ${geometry.height}`);

    let html = `
      <defs>
        <linearGradient id="boardWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#efd4a1"/>
          <stop offset=".48" stop-color="#dfbd82"/>
          <stop offset="1" stop-color="#c9985b"/>
        </linearGradient>
        <linearGradient id="fretMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#6f6a62"/>
          <stop offset=".42" stop-color="#f1ede5"/>
          <stop offset="1" stop-color="#756f67"/>
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
    html += `<rect x="${geometry.outerLeft}" y="${geometry.rulerTop}" width="${outerWidth}" height="${geometry.boardBottom - geometry.rulerTop}" rx="14" fill="#f8f4ea" stroke="#96764f" stroke-width="2.5"/>`;
    html += `<path d="M ${geometry.outerLeft + 14} ${geometry.rulerBottom} H ${geometry.outerRight - 14}" stroke="#b59b78" stroke-width="2"/>`;
    html += `<rect x="${geometry.outerLeft}" y="${geometry.boardTop}" width="${outerWidth}" height="${boardHeight}" fill="url(#boardWood)"/>`;
    html += `<line x1="${geometry.stringStart}" y1="${geometry.boardTop}" x2="${geometry.stringStart}" y2="${geometry.boardBottom}" stroke="#8c6e4b" stroke-opacity=".58" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardTop}" x2="${geometry.outerRight}" y2="${geometry.boardTop}" stroke="#fff7e8" stroke-opacity=".7" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardBottom}" x2="${geometry.outerRight}" y2="${geometry.boardBottom}" stroke="#6f4d2f" stroke-opacity=".72" stroke-width="3"/>`;

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
        html += `<circle cx="${x}" cy="${y - 29}" r="7.5" fill="#8f7045" opacity=".64"/>`;
        html += `<circle cx="${x}" cy="${y + 29}" r="7.5" fill="#8f7045" opacity=".64"/>`;
      } else {
        html += `<circle cx="${x}" cy="${y}" r="7.5" fill="#8f7045" opacity=".58"/>`;
      }
    });

    open.forEach((openMidi, string) => {
      const y = geometry.stringY(string);
      const thickness = 1.7 + (strings - string) * 0.72;
      html += `<text x="${geometry.stringStart - 23}" y="${y + 7}" text-anchor="end" class="string-label" fill="#2b241d">${Core.noteName(openMidi).replace(/-?\d+$/, '')}</text>`;
      html += `<line x1="${geometry.stringStart}" y1="${y + 2}" x2="${geometry.bridge}" y2="${y + 2}" stroke="#4e4033" stroke-opacity=".44" stroke-width="${thickness + 2.2}"/>`;
      html += `<line x1="${geometry.stringStart}" y1="${y}" x2="${geometry.bridge}" y2="${y}" stroke="url(#stringMetal)" stroke-width="${thickness}"/>`;
    });
    html += `</g>`;

    const numberFrets = frets <= 18
      ? Array.from({ length: frets + 1 }, (_, index) => index)
      : [0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(fret => fret <= frets);
    numberFrets.forEach(fret => {
      html += `<text x="${geometry.fretCenter(fret)}" y="52" text-anchor="middle" class="fret-number" fill="#2d2822">${fret}</text>`;
    });

    const entries = [];
    if (window.previous) entries.push({ event: window.previous, kind: 'past', order: 0 });
    if (window.current) entries.push({ event: window.current, kind: 'current', order: 0 });
    window.upcoming.forEach((event, index) => entries.push({ event, kind: 'future', order: index + 1 }));

    const routePoints = [window.current, ...window.upcoming]
      .map(event => markerPoint(event, geometry, strings))
      .filter(Boolean);
    if (routePoints.length > 1) {
      const path = routePoints.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
      html += `<path d="${path}" fill="none" stroke="var(--future)" stroke-opacity=".45" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 10" marker-end="url(#routeArrow)"/>`;
    }

    const groups = new Map();
    entries.forEach(entry => {
      const point = markerPoint(entry.event, geometry, strings);
      if (!point || entry.event.fret > frets) return;
      if (!groups.has(point.key)) groups.set(point.key, { point, entries: [] });
      groups.get(point.key).entries.push(entry);
    });
    groups.forEach(group => { html += renderMarkerGroup(group.entries, group.point); });

    svg.innerHTML = html;
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
    $('trackTitle').value = state.track.title;
    $('trackMeta').textContent = `${state.track.demo ? t('demo') : t('importedLine')} · ${state.track.events.length} ${t('notes')} · ${tuning().label}`;
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
    if (full) updatePlayback(false);
  }

  function updatePlayback(force = false) {
    if (!state.track) return;
    const time = currentTime();
    const duration = state.track.duration || audio.duration || 0;
    $('seek').value = duration ? time / duration * 1000 : 0;
    $('clock').textContent = `${Core.formatTime(time)} / ${Core.formatTime(duration)}`;
    const index = Core.currentEventIndex(state.track.events, time, state.currentIndex);
    if (index !== state.currentIndex || force) {
      state.currentIndex = index;
      renderTimeline();
      renderFretboard();
      renderSide();
    }
  }

  function startAnimation() {
    cancelAnimationFrame(state.animation);
    const frame = () => {
      if (!state.track) return;
      const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
      if (state.playing && bounds && currentTime() >= bounds.end) setTime(bounds.start);
      updatePlayback(false);
      state.animation = requestAnimationFrame(frame);
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
    if (!state.playing || !state.track?.demo) return;
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

  async function togglePlay() {
    if (!state.track) return;
    const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
    if (!state.playing && bounds && (currentTime() < bounds.start || currentTime() >= bounds.end)) setTime(bounds.start);
    state.playing = !state.playing;
    if (state.track.demo) {
      if (state.playing) scheduleDemo();
      else clearTimeout(state.demoTimer);
    } else if (state.track.audioBlob) {
      try {
        setAudioSpeed(state.track.settings.speed);
        if (state.playing) await audio.play();
        else audio.pause();
      } catch (error) {
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
    Core.updateEventTiming(
      state.track.events,
      state.currentIndex,
      Number($('noteStart').value),
      Number($('noteEnd').value),
      state.track.duration
    );
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
    audio.preservesPitch = true;
    audio.webkitPreservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.playbackRate = speed;
  }

  function exportProject() {
    const track = state.track;
    const project = {
      manico: 5,
      version: Core.VERSION,
      title: track.title,
      duration: track.duration,
      settings: track.settings,
      events: track.events.map(event => ({
        start: event.start, end: event.end, midi: event.midi, note: Core.noteName(event.midi),
        confidence: event.confidence, string: event.string, fret: event.fret,
        lockedPosition: event.lockedPosition, edited: event.edited
      }))
    };
    download(`${safeName(track.title)}.manico.json`, JSON.stringify(project, null, 2), 'application/json');
  }

  function openImport(file) {
    if (!file) return;
    state.pendingFile = file;
    state.cancelled = false;
    $('importFileName').textContent = file.name;
    $('analysisStatus').textContent = t('analyseHint');
    $('analysisProgress').style.width = '0%';
    $('startAnalysis').disabled = false;
    $('analysisModal').hidden = false;
  }

  async function startImport() {
    const file = state.pendingFile;
    if (!file) return;
    state.cancelled = false;
    $('startAnalysis').disabled = true;
    try {
      $('analysisStatus').textContent = t('decoding');
      $('analysisProgress').style.width = '4%';
      const buffer = await Transcriber.decode(file);
      if (state.cancelled) return;
      const events = await Transcriber.transcribe(buffer, {
        sensitivity: Number($('sensitivity').value) / 100,
        onProgress(value, stage) {
          $('analysisProgress').style.width = `${Math.round(value * 100)}%`;
          $('analysisStatus').textContent = stage === 'prepare' ? t('preparing') : t('analysing');
        }
      });
      if (state.cancelled) return;
      if (!events.length) throw new Error('NO_NOTES');
      $('analysisStatus').textContent = t('saving');
      const id = `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();
      const settings = { tuning: '4', frets: 15, lookahead: 3, speed: 1, loopA: null, loopB: null };
      const track = {
        id,
        title: file.name.replace(/\.[^.]+$/, ''),
        filename: file.name,
        mime: file.type,
        audioBlob: file,
        duration: buffer.duration,
        createdAt: now,
        updatedAt: now,
        analysisVersion: 2,
        settings,
        events: Core.optimiseFingering(events, Core.TUNINGS['4'].open, 15)
      };
      await Store.save(track);
      $('analysisModal').hidden = true;
      await loadLibrary();
      await refreshStorage();
      await openTrack(id, false);
    } catch (error) {
      $('startAnalysis').disabled = false;
      $('analysisProgress').style.width = '0%';
      $('analysisStatus').textContent = error?.message === 'NO_NOTES' ? t('noNotes') : t('failed');
    }
  }

  function cancelImport() {
    state.cancelled = true;
    state.pendingFile = null;
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
    $('seek').oninput = event => setTime(Number(event.target.value) / 1000 * (state.track?.duration || 0));
    $('speedSelect').onchange = event => {
      state.track.settings.speed = Number(event.target.value);
      setAudioSpeed(state.track.settings.speed);
      scheduleSave();
      if (state.playing && state.track.demo) scheduleDemo();
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
    $('exportProject').onclick = exportProject;
    $('trackTitle').onchange = event => { state.track.title = event.target.value.trim() || state.track.title; scheduleSave(); };
    audio.onplay = () => { state.playing = true; renderStudio(false); };
    audio.onpause = () => { state.playing = false; renderStudio(false); };
    audio.onended = () => { state.playing = false; setTime(0); renderStudio(false); };
    audio.onloadedmetadata = () => { if (state.track && !state.track.duration) state.track.duration = audio.duration; updatePlayback(true); };
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
