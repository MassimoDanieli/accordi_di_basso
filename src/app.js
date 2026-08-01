// Stato dell'applicazione e collegamento fra i moduli.

import { TUNINGS, parseChord, degreeName, noteName } from './theory.js';
import * as V from './voicings.js';
import * as A from './audio.js';
import * as R from './render.js';
import * as Tab from './tab.js';
import * as IReal from './ireal.js';
import { LIBRARY } from './library.js';

const $ = id => document.getElementById(id);

const state = {
  grid: [],            // [{ ok, chord, raw, bar, dur, first }]
  index: 0,
  tuning: '4',
  zoneFrom: 0,
  zoneWidth: 5,
  frets: 15,
  labels: 'degrees',
  flipped: false,
  dimOutside: true,
  vtype: 'arp',
  maxSpan: 4,
  pick: {},            // indice del voicing scelto per ogni accordo
  playing: false,
  bpm: 92,
  beats: 4,
  playMode: 'voicing',
  metronome: true,
  lockZone: false,
  timer: null,
  songs: []
};

const open = () => TUNINGS[state.tuning].open;
const zoneTo = () => Math.min(state.zoneFrom + state.zoneWidth - 1, state.frets);

let cache = new Map();
function candidates(i) {
  const item = state.grid[i];
  if (!item || !item.ok) return [];
  const key = i + '|' + state.tuning + '|' + state.zoneFrom + '|' + state.zoneWidth + '|' + state.vtype + '|' + state.maxSpan;
  if (!cache.has(key)) {
    cache.set(key, V.generate(item.chord, open(), state.zoneFrom, zoneTo(), state.vtype, state.maxSpan));
  }
  return cache.get(key);
}
function chosen(i) {
  const list = candidates(i);
  if (!list.length) return null;
  const k = state.pick[i];
  return list[k] !== undefined ? list[k] : list[0];
}

// ---------------------------------------------------------------- griglia

function parseGrid() {
  const text = $('seq').value;
  const tokens = text.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
  const bars = [];
  tokens.forEach(t => {
    // Un trattino seguito da una lettera di nota separa le battute: G-A-D.
    t.split(/[-\u2212\u2013](?=[A-G])/).forEach(part => {
      const chords = part.split(',').filter(Boolean);
      if (chords.length) bars.push(chords);
    });
  });

  state.grid = [];
  state.pick = {};
  cache = new Map();
  bars.forEach((chords, bar) => chords.forEach((raw, k) => {
    const common = { bar, dur: 1 / chords.length, first: k === 0 };
    if (/^(n\.?c\.?)$/i.test(raw)) { state.grid.push({ ok: false, rest: true, raw: 'N.C.', ...common }); return; }
    const chord = parseChord(raw);
    state.grid.push(chord ? { ok: true, chord, ...common } : { ok: false, raw, ...common });
  }));
  const first = state.grid.findIndex(x => x.ok);
  state.index = first < 0 ? 0 : first;
}

// ---------------------------------------------------------------- zone

function coverage(chord, from) {
  const seen = new Set();
  open().forEach(o => {
    for (let f = from; f < from + state.zoneWidth; f++) {
      const iv = chord.pcMap[(o + f) % 12];
      if (iv !== undefined && iv >= 0) seen.add(iv);
    }
  });
  return seen.size / chord.intervals.length;
}
function bestZone(items) {
  const ok = items.filter(x => x.ok);
  if (!ok.length) return null;
  let best = null, score = -1;
  for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
    const s = Math.min(...ok.map(x => coverage(x.chord, from)));
    if (s > score + 1e-9) { score = s; best = from; }
  }
  return best;
}
function setZone(from, quiet) {
  state.zoneFrom = from;
  $('zs').value = from;
  $('zsv').textContent = from;
  cache = new Map();
  quiet ? renderStrip() : render();
}

// ---------------------------------------------------------------- disegno

function renderChips() {
  let html = '', bar = -1;
  state.grid.forEach((x, i) => {
    if (x.bar !== bar && i > 0) html += '<span class="bl">|</span>';
    bar = x.bar;
    if (x.ok) html += `<button class="chip${i === state.index ? ' on' : ''}" data-pick="${i}">${x.chord.symbol}</button>`;
    else if (x.rest) html += `<span class="chip rest">N.C.</span>`;
    else html += `<span class="chip bad" title="non riconosciuto">${x.raw}</span>`;
  });
  $('chips').innerHTML = html;
}

function describeZone() {
  const el = $('zdesc');
  if (!el) return;
  el.textContent = state.zoneFrom === 0
    ? `tasti 0\u2013${zoneTo()}, corde a vuoto incluse`
    : `tasti ${state.zoneFrom}\u2013${zoneTo()}`;
}

function renderStrip() {
  const ok = state.grid.filter(x => x.ok);
  let html = '';
  for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
    const s = ok.length ? Math.min(...ok.map(x => coverage(x.chord, from))) : 1;
    html += `<button class="cell${from === state.zoneFrom ? ' sel' : ''}" data-zone="${from}"`
      + ` style="background:rgba(233,176,74,${(0.12 + s * 0.78).toFixed(2)})"`
      + ` title="tasti ${from}\u2013${from + state.zoneWidth - 1}, copertura ${Math.round(s * 100)}%">${from}</button>`;
  }
  $('strip').innerHTML = html;
}

function renderBoard() {
  const item = state.grid[state.index];
  const v = chosen(state.index);
  $('board').innerHTML = R.fretboard({
    chord: item && item.ok ? item.chord : null,
    open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), frets: state.frets,
    labels: state.labels, flipped: state.flipped, dimOutside: state.dimOutside,
    highlight: v ? v.shape : []
  });
}

function renderVoicings() {
  const item = state.grid[state.index];
  const type = V.typeById(state.vtype);
  $('vhint').textContent = type.hint;

  if (!item || !item.ok) {
    $('vcount').textContent = '';
    $('voices').innerHTML = '<p class="empty">Nessun accordo selezionato.</p>';
    return;
  }

  const list = candidates(state.index);
  $('vcount').textContent = list.length
    ? `\u2014 ${list.length} per ${item.chord.symbol}, tasti ${state.zoneFrom}\u2013${zoneTo()}`
    : `\u2014 ${item.chord.symbol}`;
  if (!list.length) {
    $('voices').innerHTML = `<p class="empty">Nessun ${type.name.toLowerCase()} per <b>${item.chord.symbol}</b>`
      + ` fra il tasto ${state.zoneFrom} e il ${zoneTo()}. Allarga la zona, aumenta l\u2019apertura della mano`
      + ` o cambia tipo di voicing.</p>`;
    return;
  }

  const cur = chosen(state.index);
  const prev = previousVoicing(state.index);

  $('voices').innerHTML = list.map((v, k) => {
    const mv = V.motion(prev, v);
    return `<div class="voice${cur === v ? ' sel' : ''}" data-voicing="${k}">
      <div class="head"><h4>${v.label}</h4><span class="mv">${mv === null ? '' : 'moto ' + mv}</span></div>
      <div class="meta">${V.describe(v, item.chord)} \u00b7 apertura ${v.span}</div>
      ${R.diagram(item.chord, v, { open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), flipped: state.flipped })}
      <div class="foot">
        <span class="deg">${V.degrees(v, item.chord)}</span>
        <button class="play-s" data-hear="${k}" aria-label="ascolta">&#9654;</button>
      </div></div>`;
  }).join('');
}

function previousVoicing(i) {
  for (let k = i - 1; k >= 0; k--) if (state.grid[k].ok) return chosen(k);
  return null;
}

function render() {
  describeZone(); renderChips(); renderStrip(); renderBoard(); renderVoicings();
}

// ---------------------------------------------------------------- suono

function hear(v, seconds) {
  if (!v) return;
  const midis = v.shape.map(n => n.midi);
  if (v.block) A.strum(midis, Math.min(seconds || 1.6, 2.2));
  else A.arpeggio(midis, Math.min((seconds || 1.6) / midis.length, 0.42));
}

function select(i) {
  state.index = i;
  renderChips(); renderBoard(); renderVoicings();
  if (!state.playing) hear(chosen(i), 1.2);
}

// ---------------------------------------------------------------- trasporto

function tick() {
  if (!state.playing) return;
  const item = state.grid[state.index];
  if (!item) { stop(); return; }
  const seconds = (60 / state.bpm) * state.beats * (item.dur || 1);

  if (!state.lockZone && item.ok) {
    const b = bestZone([item]);
    if (b !== null && b !== state.zoneFrom) setZone(b, true);
  }
  renderChips(); renderBoard(); renderVoicings();

  if (state.metronome) {
    const beats = Math.max(1, Math.round(state.beats * (item.dur || 1)));
    for (let b = 0; b < beats; b++) A.click(b * (60 / state.bpm), item.first && b === 0);
  }
  if (item.ok && state.playMode !== 'mute') {
    const v = chosen(state.index);
    if (v) {
      if (state.playMode === 'root') A.pluck(v.shape[0].midi, 0, Math.min(seconds * 0.9, 1.6), 0.3);
      else hear(v, seconds * 0.92);
    }
  }
  state.timer = setTimeout(() => {
    state.index = (state.index + 1) % state.grid.length;
    tick();
  }, seconds * 1000);
}
function stop() {
  state.playing = false;
  clearTimeout(state.timer);
  $('pp').innerHTML = '&#9654; Play';
}
function toggleTransport() {
  state.playing = !state.playing;
  $('pp').innerHTML = state.playing ? '&#9632; Stop' : '&#9654; Play';
  if (state.playing) { A.audio(); tick(); } else clearTimeout(state.timer);
}

// ---------------------------------------------------------------- voice leading

function optimiseVoiceLeading() {
  const lists = state.grid.map((x, i) => (x.ok ? candidates(i) : []));
  const picks = V.optimise(lists);
  picks.forEach((p, i) => { if (p >= 0) state.pick[i] = p; });
  render();
  const total = totalMotion();
  $('vlinfo').textContent = total === null ? '' : `moto complessivo: ${total} semitoni`;
}
function totalMotion() {
  let sum = 0, prev = null, seen = false;
  state.grid.forEach((x, i) => {
    if (!x.ok) return;
    const v = chosen(i);
    if (!v) return;
    if (prev) { sum += V.motion(prev, v); seen = true; }
    prev = v;
  });
  return seen ? sum : null;
}

// ---------------------------------------------------------------- tab

function buildTab() {
  const bars = [];
  let current = null, barIndex = -1;
  state.grid.forEach((item, i) => {
    if (item.bar !== barIndex) { current = { label: [], columns: [], block: false }; bars.push(current); barIndex = item.bar; }
    if (!item.ok) { current.label.push(item.raw); return; }
    current.label.push(item.chord.symbol);
    const v = chosen(i);
    if (!v) return;
    current.block = current.block || v.block;
    v.shape.forEach((n, k) => current.columns.push({ si: n.si, f: n.f, newGroup: v.block && k === 0 }));
  });

  const header = `griglia: ${$('seq').value}\n`
    + `basso: ${TUNINGS[state.tuning].label}   zona: tasti ${state.zoneFrom}-${zoneTo()}   `
    + `voicing: ${V.typeById(state.vtype).name}`;
  $('tab').textContent = Tab.render(bars, open(), state.flipped, +$('perline').value, header);
}

// ---------------------------------------------------------------- eventi

function loadGrid(text, autozone) {
  $('seq').value = text;
  parseGrid();
  if (autozone) { const b = bestZone(state.grid); if (b !== null) setZone(b, true); }
  render();
}

function init() {
  $('lib').innerHTML = LIBRARY.map((x, i) => `<option value="${i}">${x[0]}</option>`).join('');
  $('lib').value = '0';
  $('vtype').innerHTML = V.VOICING_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  $('tun').innerHTML = Object.entries(TUNINGS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');

  $('go').onclick = () => { parseGrid(); render(); };
  $('seq').addEventListener('keydown', e => { if (e.key === 'Enter') { parseGrid(); render(); } });

  $('libgo').onclick = () => loadGrid(LIBRARY[+$('lib').value][1], true);

  $('vtype').onchange = e => {
    state.vtype = e.target.value;
    state.pick = {}; cache = new Map();
    $('spanwrap').style.display = V.typeById(state.vtype).block ? '' : 'none';
    $('vlinfo').textContent = '';
    render();
  };
  $('span').oninput = e => {
    state.maxSpan = +e.target.value;
    $('spanv').textContent = state.maxSpan;
    state.pick = {}; cache = new Map(); render();
  };
  $('vl').onclick = optimiseVoiceLeading;

  $('tun').onchange = e => { state.tuning = e.target.value; state.pick = {}; cache = new Map(); render(); };
  $('zs').oninput = e => setZone(+e.target.value);
  $('zw').oninput = e => {
    state.zoneWidth = +e.target.value;
    $('zwv').textContent = state.zoneWidth + ' tasti';
    $('zs').max = state.frets - state.zoneWidth + 1;
    state.pick = {}; cache = new Map();
    if (state.zoneFrom > state.frets - state.zoneWidth + 1) setZone(state.frets - state.zoneWidth + 1);
    else render();
  };
  $('tlab').onclick = e => {
    state.labels = state.labels === 'degrees' ? 'notes' : 'degrees';
    e.target.textContent = state.labels === 'degrees' ? 'Gradi' : 'Note';
    e.target.classList.toggle('on', state.labels === 'degrees');
    render();
  };
  $('tflip').onclick = e => { state.flipped = !state.flipped; e.target.classList.toggle('on', state.flipped); render(); };
  $('tdim').onclick = e => { state.dimOutside = !state.dimOutside; e.target.classList.toggle('on', state.dimOutside); render(); };

  $('pp').onclick = toggleTransport;
  $('bpm').oninput = e => { state.bpm = +e.target.value; $('bpmv').textContent = state.bpm; };
  $('beats').onchange = e => { state.beats = +e.target.value; };
  $('mode').onchange = e => { state.playMode = e.target.value; };
  $('clk').onclick = e => { state.metronome = !state.metronome; e.target.classList.toggle('on', state.metronome); };
  $('lock').onclick = e => { state.lockZone = !state.lockZone; e.target.classList.toggle('on', state.lockZone); };

  $('mktab').onclick = buildTab;
  $('perline').onchange = buildTab;
  $('cptab').onclick = () => {
    navigator.clipboard && navigator.clipboard.writeText($('tab').textContent).then(() => {
      $('cptab').textContent = 'Copiato';
      setTimeout(() => { $('cptab').textContent = 'Copia'; }, 1200);
    });
  };
  $('dltab').onclick = () => {
    const blob = new Blob([$('tab').textContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manico-tab.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  $('irgo').onclick = () => {
    const info = $('irinfo'), list = $('irlist');
    const raw = $('ireal').value.trim();
    if (!raw) { info.innerHTML = '<span class="err">Incolla prima un link.</span>'; return; }
    let songs = [];
    try { songs = IReal.parse(raw); } catch (e) { songs = []; }
    if (!songs.length) {
      list.style.display = 'none';
      info.innerHTML = '<span class="err">Non sono riuscito a leggere il link.</span> '
        + 'Deve iniziare con irealb:// oppure irealbook://. In alternativa scrivi gli accordi a mano nella barra in alto.';
      return;
    }
    state.songs = songs;
    list.style.display = songs.length > 1 ? '' : 'none';
    list.innerHTML = songs.map((s, i) => `<option value="${i}">${s.title}${s.composer ? ' \u2014 ' + s.composer : ''}</option>`).join('');
    loadSong(0);
  };
  $('irlist').onchange = e => loadSong(+e.target.value);

  // Delega degli eventi sui contenuti ridisegnati.
  $('chips').addEventListener('click', e => {
    const b = e.target.closest('[data-pick]');
    if (b) select(+b.dataset.pick);
  });
  $('strip').addEventListener('click', e => {
    const b = e.target.closest('[data-zone]');
    if (b) setZone(+b.dataset.zone);
  });
  $('voices').addEventListener('click', e => {
    const hearBtn = e.target.closest('[data-hear]');
    if (hearBtn) { e.stopPropagation(); hear(candidates(state.index)[+hearBtn.dataset.hear], 1.6); return; }
    const card = e.target.closest('[data-voicing]');
    if (card) {
      state.pick[state.index] = +card.dataset.voicing;
      renderBoard(); renderVoicings();
      hear(chosen(state.index), 1.4);
    }
  });
  $('board').addEventListener('click', e => {
    const g = e.target.closest('[data-midi]');
    if (g) A.pluck(+g.dataset.midi);
  });

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); toggleTransport(); }
    if (e.key === 'ArrowRight' && state.index < state.grid.length - 1) select(state.index + 1);
    if (e.key === 'ArrowLeft' && state.index > 0) select(state.index - 1);
  });

  $('spanwrap').style.display = 'none';
  parseGrid();
  render();
}

function loadSong(k) {
  const song = state.songs[k];
  if (!song) return;
  loadGrid(IReal.toGrid(song), true);
  $('irinfo').textContent = `${song.title}${song.composer ? ' \u2014 ' + song.composer : ''} \u00b7 tonalit\u00e0 ${song.key} \u00b7 ${song.bars.length} battute`;
}

init();
