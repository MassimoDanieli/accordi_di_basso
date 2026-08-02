(function initAudioTranscriber() {
  'use strict';

  const $ = id => document.getElementById(id);
  const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const OPEN_MIDI = [40, 45, 50, 55];
  const TARGET_RATE = 4000;
  const copy = {
    it: {
      chooseTitle: 'Scegli un MP3',
      privacy: 'Il file resta nel browser. Manico ricava attacchi, note, ritmo e posizione sul basso.',
      choose: 'Scegli file',
      import: 'Trascrivi e apri sul manico',
      sensitivity: 'Sensibilità',
      idle: 'Scegli una registrazione.',
      decoding: 'Decodifica del file…',
      ready: 'File pronto.',
      running: 'Trascrizione della linea di basso…',
      noNotes: 'Non ho trovato note affidabili. Prova ad aumentare la sensibilità.',
      failed: 'Non riesco a leggere questo file audio.',
      found: count => `${count} note rilevate. Apertura sul manico…`,
      warning: 'La trascrizione è una stima: mix densi e cassa possono richiedere correzioni.'
    },
    en: {
      chooseTitle: 'Choose an MP3',
      privacy: 'The file stays in your browser. Manico extracts attacks, notes, rhythm and bass positions.',
      choose: 'Choose file',
      import: 'Transcribe and open on fretboard',
      sensitivity: 'Sensitivity',
      idle: 'Choose a recording.',
      decoding: 'Decoding audio…',
      ready: 'File ready.',
      running: 'Transcribing the bass line…',
      noNotes: 'No reliable notes were found. Try increasing sensitivity.',
      failed: 'This audio file could not be read.',
      found: count => `${count} notes detected. Opening the fretboard…`,
      warning: 'The transcription is an estimate: dense mixes and kick drums may need correction.'
    }
  };

  let language = 'it';
  let selectedFile = null;
  let decodedBuffer = null;

  try {
    language = localStorage.getItem('manico-lingua') === 'en' ? 'en' : 'it';
  } catch (error) {
    language = document.documentElement.lang === 'en' ? 'en' : 'it';
  }

  function t(key, ...args) {
    const value = copy[language][key];
    return typeof value === 'function' ? value(...args) : value;
  }

  function translate() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-copy]').forEach(element => {
      element.textContent = t(element.dataset.copy);
    });
  }

  function noteName(midi) {
    const pc = ((midi % 12) + 12) % 12;
    return `${NOTE_NAMES[pc]}${Math.floor(midi / 12) - 1}`;
  }

  function setStatus(message) {
    $('status').textContent = message;
  }

  function setProgress(value) {
    $('progressBar').style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  async function decodeFile(file) {
    selectedFile = file;
    decodedBuffer = null;
    $('importButton').disabled = true;
    $('fileName').textContent = file?.name || '';
    setProgress(0);
    setStatus(t('decoding'));

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      decodedBuffer = await context.decodeAudioData((await file.arrayBuffer()).slice(0));
      await context.close();
      $('duration').textContent = `${Math.round(decodedBuffer.duration * 10) / 10}s`;
      $('importButton').disabled = false;
      setStatus(t('ready'));
    } catch (error) {
      selectedFile = null;
      decodedBuffer = null;
      setStatus(t('failed'));
    }
  }

  function mixToMono(buffer) {
    const output = new Float32Array(buffer.length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const input = buffer.getChannelData(channel);
      const weight = 1 / buffer.numberOfChannels;
      for (let index = 0; index < input.length; index += 1) output[index] += input[index] * weight;
    }
    return output;
  }

  function lowPass(input, sampleRate, cutoff = 300) {
    const output = new Float32Array(input.length);
    const alpha = 1 - Math.exp(-2 * Math.PI * cutoff / sampleRate);
    let state = 0;
    for (let index = 0; index < input.length; index += 1) {
      state += alpha * (input[index] - state);
      output[index] = state;
    }
    return output;
  }

  function downsample(input, sourceRate, targetRate = TARGET_RATE) {
    if (sourceRate <= targetRate) return { data: input, sampleRate: sourceRate };
    const ratio = sourceRate / targetRate;
    const length = Math.floor(input.length / ratio);
    const output = new Float32Array(length);

    for (let index = 0; index < length; index += 1) {
      const start = Math.floor(index * ratio);
      const end = Math.max(start + 1, Math.floor((index + 1) * ratio));
      let sum = 0;
      for (let source = start; source < end && source < input.length; source += 1) sum += input[source];
      output[index] = sum / Math.max(1, end - start);
    }
    return { data: output, sampleRate: targetRate };
  }

  function rms(input, start, length) {
    let sum = 0;
    const end = Math.min(input.length, start + length);
    for (let index = start; index < end; index += 1) {
      const value = input[index];
      sum += value * value;
    }
    return Math.sqrt(sum / Math.max(1, end - start));
  }

  function percentile(values, amount) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * amount)))];
  }

  function detectOnsets(input, sampleRate, sensitivity) {
    const hop = Math.max(1, Math.round(sampleRate * 0.01));
    const windowSize = Math.max(hop * 2, Math.round(sampleRate * 0.03));
    const energy = [];

    for (let position = 0; position + windowSize < input.length; position += hop) {
      energy.push(rms(input, position, windowSize));
    }

    const noise = percentile(energy, 0.35);
    const strong = percentile(energy, 0.92);
    const threshold = noise + (strong - noise) * (1 - sensitivity) * 0.9;
    const minimumGap = Math.max(1, Math.round(0.07 * sampleRate / hop));
    const onsets = [];
    let previous = -minimumGap;

    for (let index = 2; index < energy.length - 1; index += 1) {
      const flux = energy[index] - Math.max(energy[index - 1], energy[index - 2]);
      if (energy[index] > threshold && flux > Math.max(0.00001, threshold * 0.18) && index - previous >= minimumGap) {
        onsets.push(index * hop / sampleRate);
        previous = index;
      }
    }

    if (!onsets.length || onsets[0] > 0.12) onsets.unshift(0);
    return onsets;
  }

  function estimatePitch(input, sampleRate, startSeconds) {
    const start = Math.max(0, Math.floor(startSeconds * sampleRate));
    const windowSize = Math.min(input.length - start, Math.round(sampleRate * 0.18));
    if (windowSize < Math.round(sampleRate * 0.08)) return null;

    const signal = new Float32Array(windowSize);
    let mean = 0;
    for (let index = 0; index < windowSize; index += 1) mean += input[start + index] || 0;
    mean /= windowSize;
    for (let index = 0; index < windowSize; index += 1) signal[index] = (input[start + index] || 0) - mean;

    const minimumLag = Math.max(2, Math.floor(sampleRate / 330));
    const maximumLag = Math.min(Math.floor(sampleRate / 35), Math.floor(windowSize / 2));
    let bestLag = -1;
    let bestCorrelation = -1;

    for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
      let numerator = 0;
      let leftEnergy = 0;
      let rightEnergy = 0;
      for (let index = 0; index < windowSize - lag; index += 1) {
        const left = signal[index];
        const right = signal[index + lag];
        numerator += left * right;
        leftEnergy += left * left;
        rightEnergy += right * right;
      }
      const denominator = Math.sqrt(leftEnergy * rightEnergy) || 1;
      const correlation = numerator / denominator;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (bestLag < 0 || bestCorrelation < 0.52) return null;
    const frequency = sampleRate / bestLag;
    let midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    while (midi < 40) midi += 12;
    while (midi > 67) midi -= 12;
    if (midi < 40 || midi > 67) return null;
    return { midi, confidence: bestCorrelation };
  }

  function candidatePositions(midi) {
    const positions = [];
    OPEN_MIDI.forEach((open, string) => {
      const fret = midi - open;
      if (fret >= 0 && fret <= 12) positions.push({ string, fret });
    });
    return positions;
  }

  function choosePositions(events) {
    let previous = null;
    events.forEach(event => {
      const candidates = candidatePositions(event.midi);
      if (!candidates.length) {
        event.string = null;
        event.fret = null;
        return;
      }
      candidates.sort((left, right) => {
        const leftCost = previous
          ? Math.abs(left.fret - previous.fret) * 2 + Math.abs(left.string - previous.string) * 3
          : left.fret;
        const rightCost = previous
          ? Math.abs(right.fret - previous.fret) * 2 + Math.abs(right.string - previous.string) * 3
          : right.fret;
        return leftCost - rightCost;
      });
      event.string = candidates[0].string;
      event.fret = candidates[0].fret;
      previous = candidates[0];
    });
  }

  function compactEvents(events) {
    const output = [];
    events.forEach(event => {
      const previous = output[output.length - 1];
      if (previous && previous.midi === event.midi && event.start - previous.end < 0.08) {
        previous.end = event.end;
        previous.confidence = Math.max(previous.confidence, event.confidence);
      } else {
        output.push({ ...event });
      }
    });
    return output;
  }

  async function transcribe() {
    if (!selectedFile || !decodedBuffer) return;
    $('importButton').disabled = true;
    setStatus(t('running'));
    setProgress(0);

    const mono = mixToMono(decodedBuffer);
    const filtered = lowPass(mono, decodedBuffer.sampleRate, 300);
    const reduced = downsample(filtered, decodedBuffer.sampleRate, TARGET_RATE);
    const sensitivity = Number($('sensitivity').value) / 100;
    const onsets = detectOnsets(reduced.data, reduced.sampleRate, sensitivity);
    const detected = [];

    for (let index = 0; index < onsets.length; index += 1) {
      const start = onsets[index];
      const next = index + 1 < onsets.length ? onsets[index + 1] : Math.min(decodedBuffer.duration, start + 0.8);
      const pitch = estimatePitch(reduced.data, reduced.sampleRate, start + 0.025);
      if (pitch) {
        detected.push({
          start,
          end: Math.max(start + 0.06, next),
          midi: pitch.midi,
          note: noteName(pitch.midi),
          confidence: pitch.confidence,
          chord: '—'
        });
      }
      setProgress((index + 1) / onsets.length * 100);
      if (index % 6 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }

    const events = compactEvents(detected).filter(event => event.confidence >= 0.52);
    for (let index = 0; index < events.length; index += 1) {
      events[index].end = index + 1 < events.length
        ? Math.max(events[index].start + 0.06, events[index + 1].start)
        : Math.min(decodedBuffer.duration, Math.max(events[index].start + 0.2, events[index].end));
    }
    choosePositions(events);

    if (!events.length) {
      setStatus(t('noNotes'));
      $('importButton').disabled = false;
      return;
    }

    setStatus(t('found', events.length));
    parent.postMessage({
      type: 'manico-bassline',
      title: selectedFile.name.replace(/\.[^.]+$/, ''),
      file: selectedFile,
      events
    }, location.origin);
    $('importButton').disabled = false;
  }

  $('file').addEventListener('change', () => decodeFile($('file').files[0]));
  $('importButton').addEventListener('click', transcribe);
  translate();
  setStatus(t('idle'));
})();
