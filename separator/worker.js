// Manico: bass separation worker. Runs Demucs (htdemucs, Meta) through ONNX Runtime Web,
// using the JavaScript port by Kevin Gibbons (https://github.com/bakkot/demucs-js, MIT).
import {separateTracks} from 'demucs/dist/apply.js';
import {ONNXHTDemucs} from 'demucs/dist/onnx-htdemucs.js';
import {encode} from 'demucs/dist/mp3-encoder.js';

const CACHE = 'manico-separator-v1';
let model = null;

async function weights(url, report) {
  let cache = null;
  try { cache = await caches.open(CACHE); } catch (error) { /* private mode: download every time */ }
  const cached = cache && await cache.match(url);
  if (cached) return cached.arrayBuffer();
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error('MODEL_UNAVAILABLE');
  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body.getReader();
  const parts = [];
  let loaded = 0;
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    parts.push(value);
    loaded += value.length;
    report({stage: 'model', loaded, total});
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  if (cache) {
    try { await cache.put(url, new Response(bytes, {headers: {'content-type': 'application/octet-stream'}})); }
    catch (error) { /* no room to keep it: it still works this time */ }
  }
  return bytes.buffer;
}

self.onmessage = async message => {
  const {left, right, sampleRate, modelUrl} = message.data;
  const report = data => self.postMessage({type: 'progress', ...data});
  try {
    if (!model) {
      const bytes = await weights(modelUrl, report);
      report({stage: 'start'});
      model = await ONNXHTDemucs.init(bytes);
    }
    const tracks = await separateTracks(model, {channelData: [left, right], sampleRate},
      (step, total) => report({stage: 'separate', step, total}));
    report({stage: 'encode'});
    const {bass, drums, other, vocals} = tracks;
    // The library leaves the last 56 ms of every 7.8-second window of the last channel (the
    // right channel of the vocals) without a value. Left as they are, those gaps would silence
    // the whole right channel of the mix there; as zeros, only the vocals miss them, under the
    // fade between windows.
    for (const stem of [bass, drums, other, vocals]) {
      for (const data of stem.channelData) {
        for (let index = 0; index < data.length; index += 1) if (!Number.isFinite(data[index])) data[index] = 0;
      }
    }
    const length = bass.channelData[0].length;
    // Everything but the bass, mixed back together; and the bass on its own, in mono for the transcriber.
    const backing = [0, 1].map(channel => {
      const out = new Float32Array(length);
      for (const stem of [drums, other, vocals]) {
        const data = stem.channelData[channel];
        for (let index = 0; index < length; index += 1) out[index] += data[index];
      }
      return out;
    });
    const mono = new Float32Array(length);
    for (let index = 0; index < length; index += 1) mono[index] = (bass.channelData[0][index] + bass.channelData[1][index]) / 2;
    // An MP3 comes back from the decoder 1105 samples late (encoder plus decoder delay). Leaving
    // that much out at the start keeps both recordings in step with the original and the notes.
    const DELAY = 1105;
    const backingMp3 = await encode({channelData: backing.map(data => data.subarray(DELAY)), sampleRate});
    const bassMp3 = await encode({channelData: bass.channelData.map(data => data.slice(DELAY)), sampleRate});
    self.postMessage({type: 'done', bass: mono, sampleRate, backingMp3, bassMp3}, [mono.buffer, backingMp3, bassMp3]);
  } catch (error) {
    self.postMessage({type: 'error', message: error?.message || String(error)});
  }
};
