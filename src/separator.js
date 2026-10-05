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
