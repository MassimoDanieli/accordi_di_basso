// Stato dell'applicazione e collegamento fra i moduli.

import { TUNINGS, parseChord, degreeName, noteName } from './theory.js';
import * as V from './voicings.js';
import * as A from './audio.js';
import * as R from './render.js';
import * as Tab from './tab.js';
import * as IReal from './ireal.js';
import { LIBRARY } from './library.js';
import { initTheme } from './theme.js';
import { t, initLang, applyStatic, lang } from './i18n.js';

const $ = id => document.getElementById(id);

const state = {
  grid: [],            // [{ ok, chord, raw, bar, dur, first }]
  index: 0,
  tuning: '4',
  zoneFrom: 0,
  zoneWidth: 5,
  frets: 12,
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
  el.textContent = t('zone.desc', state.zoneFrom, zoneTo());
}

function renderStrip() {
  const ok = state.grid.filter(x => x.ok);
  let html = '';
  for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
    const s = ok.length ? Math.min(...ok.map(x => coverage(x.chord, from))) : 1;
    html += `<button class="cell${from === state.zoneFrom ? ' sel' : ''}" data-zone="${from}"`
      + ` style="background:rgba(233,176,74,${(0.12 + s * 0.78).toFixed(2)})"`
      + ` title="${t('zone.cell', from, from + state.zoneWidth - 1, Math.round(s * 100))}">${from}</button>`;
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

function invLabel(chord, bassIv) {
  const k = V.inversion(chord, bassIv);
  return k === null ? t('inv.x') : t('inv.' + k);
}

function renderVoicings() {
  const item = state.grid[state.index];
  const type = V.typeById(state.vtype);
  $('vhint').textContent = t('vt.' + type.id + '.hint');

  if (!item || !item.ok) {
    $('vcount').textContent = '';
    $('voices').innerHTML = `<p class="empty">${t('v.none')}</p>`;
    return;
  }

  const list = candidates(state.index);
  $('vcount').textContent = list.length
    ? t('v.count', list.length, item.chord.symbol, state.zoneFrom, zoneTo())
    : item.chord.symbol;
  if (!list.length) {
    $('voices').innerHTML = `<p class="empty">${t('v.empty', t('vt.' + type.id + '.name'), state.zoneFrom, zoneTo())}</p>`;
    return;
  }

  const cur = chosen(state.index);
  const prev = previousVoicing(state.index);

  $('voices').innerHTML = list.map((v, k) => {
    const mv = V.motion(prev, v);
    return `<div class="voice${cur === v ? ' sel' : ''}" data-voicing="${k}">
      <div class="head"><h4>${invLabel(item.chord, v.bassIv)}</h4><span class="mv">${mv === null ? '' : t('v.motion', mv)}</span></div>
      <div class="meta">${V.describe(v, item.chord)} \u00b7 ${t('v.spanOf', v.span)}</div>
      ${R.diagram(item.chord, v, { open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), flipped: state.flipped })}
      <div class="foot">
        <span class="deg">${V.degrees(v, item.chord)}</span>
        <button class="play-s" data-hear="${k}" aria-label="${t('v.listen')}">&#9654;</button>
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

let flashes = [];

function clearFlashes() {
  flashes.forEach(clearTimeout);
  flashes = [];
  document.querySelectorAll('.note.hit').forEach(el => el.classList.remove('hit'));
}

/** Accende la nota sul manico e sul diagramma del voicing scelto. */
function flash(note) {
  const sel = `[data-pos="${note.si}:${note.f}"]`;
  document.querySelectorAll('#board ' + sel + ', .voice.sel ' + sel).forEach(el => {
    el.classList.remove('hit');
    void el.getBoundingClientRect();   // forza il riavvio dell'animazione
    el.classList.add('hit');
  });
}

/** Programma l'accensione delle note in sincrono con quello che si sente. */
function lightUp(v, step) {
  clearFlashes();
  if (!v) return;
  if (v.block) { v.shape.forEach(n => flash(n)); return; }
  v.shape.forEach((n, i) => {
    if (i === 0) { flash(n); return; }
    flashes.push(setTimeout(() => flash(n), i * step * 1000));
  });
}

function hear(v, seconds) {
  if (!v) return;
  const midis = v.shape.map(n => n.midi);
  if (v.block) {
    A.strum(midis, Math.min(seconds || 1.6, 2.2));
    lightUp(v, 0);
  } else {
    const step = Math.min((seconds || 1.6) / midis.length, 0.42);
    A.arpeggio(midis, step);
    lightUp(v, step);
  }
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
      if (state.playMode === 'root') {
        A.pluck(v.shape[0].midi, 0, Math.min(seconds * 0.9, 1.6), 0.3);
        clearFlashes(); flash(v.shape[0]);
      } else hear(v, seconds * 0.92);
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
  clearFlashes();
  $('pp').innerHTML = '&#9654;';
}
function toggleTransport() {
  state.playing = !state.playing;
  $('pp').innerHTML = state.playing ? '&#9632;' : '&#9654;';
  if (state.playing) { A.audio(); tick(); } else { clearTimeout(state.timer); clearFlashes(); }
}

// ---------------------------------------------------------------- voice leading

function optimiseVoiceLeading() {
  const lists = state.grid.map((x, i) => (x.ok ? candidates(i) : []));
  const picks = V.optimise(lists);
  picks.forEach((p, i) => { if (p >= 0) state.pick[i] = p; });
  render();
  const total = totalMotion();
  $('vlinfo').textContent = total === null ? '' : t('v.total', total);
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

  const header = t('tab.head', $('seq').value, TUNINGS[state.tuning].label,
    state.zoneFrom, zoneTo(), t('vt.' + state.vtype + '.name'));
  $('tab').textContent = Tab.render(bars, open(), state.flipped, +$('perline').value, header);
  $('tab').dataset.vuoto = 'no';
}

// ---------------------------------------------------------------- eventi

function loadGrid(text, autozone) {
  $('seq').value = text;
  parseGrid();
  if (autozone) { const b = bestZone(state.grid); if (b !== null) setZone(b, true); }
  render();
}

function buildMenus() {
  const keep = { lib: $('lib').value, vtype: $('vtype').value, tun: $('tun').value,
                 nfrets: $('nfrets').value, mode: $('mode').value, perline: $('perline').value };
  $('lib').innerHTML = LIBRARY.map((x, i) => `<option value="${i}">${x[lang() === 'en' ? 1 : 0]}</option>`).join('');
  $('vtype').innerHTML = V.VOICING_TYPES.map(x => `<option value="${x.id}">${t('vt.' + x.id + '.name')}</option>`).join('');
  $('tun').innerHTML = Object.entries(TUNINGS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  $('nfrets').innerHTML = [12, 15, 18, 24].map(n => `<option value="${n}">${t('set.fretsTo', n)}</option>`).join('');
  $('mode').innerHTML = ['voicing', 'root', 'mute'].map(m => `<option value="${m}">${t('play.' + m)}</option>`).join('');
  $('perline').innerHTML = [4, 2, 6].map(n => `<option value="${n}">${t('tab.perline', n)}</option>`).join('');
  $('lib').value = keep.lib || '0';
  $('vtype').value = keep.vtype || state.vtype;
  $('tun').value = keep.tun || state.tuning;
  $('nfrets').value = keep.nfrets || String(state.frets);
  $('mode').value = keep.mode || state.playMode;
  $('perline').value = keep.perline || '4';
  $('tlab').textContent = state.labels === 'degrees' ? t('set.degrees') : t('set.names');
  $('pp').innerHTML = state.playing ? '&#9632;' : '&#9654;';
  $('zwv').textContent = t('zone.frets', state.zoneWidth);
  if ($('tab').textContent.trim() === '' || $('tab').dataset.vuoto === 'si') {
    $('tab').textContent = t('tab.press'); $('tab').dataset.vuoto = 'si';
  }
}

function init() {
  initTheme();
  initLang(() => { buildMenus(); render(); });
  parseGrid();
  render();

  buildMenus();

  $('go').onclick = () => { parseGrid(); render(); };
  $('seq').addEventListener('keydown', e => { if (e.key === 'Enter') { parseGrid(); render(); } });

  // La griglia si aggiorna da sola poco dopo l'ultima battitura: il pulsante resta
  // per chi preferisce confermare a mano.
  let attesa = null;
  $('seq').addEventListener('input', () => {
    clearTimeout(attesa);
    attesa = setTimeout(() => { parseGrid(); render(); }, 550);
  });

  $('libgo').onclick = () => { loadGrid(LIBRARY[+$('lib').value][2], true); $('dlgforme').close(); };

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
  if ($('nfrets')) {
  $('nfrets').value = String(state.frets);
  $('nfrets').onchange = e => {
    state.frets = +e.target.value;
    $('zs').max = state.frets - state.zoneWidth + 1;
    if (state.zoneFrom > state.frets - state.zoneWidth + 1) { setZone(state.frets - state.zoneWidth + 1); return; }
    state.pick = {}; cache = new Map(); render();
  };
  }
  $('zs').oninput = e => setZone(+e.target.value);
  $('zw').oninput = e => {
    state.zoneWidth = +e.target.value;
    $('zwv').textContent = t('zone.frets', state.zoneWidth);
    $('zs').max = state.frets - state.zoneWidth + 1;
    state.pick = {}; cache = new Map();
    if (state.zoneFrom > state.frets - state.zoneWidth + 1) setZone(state.frets - state.zoneWidth + 1);
    else render();
  };
  $('tlab').onclick = e => {
    state.labels = state.labels === 'degrees' ? 'notes' : 'degrees';
    e.target.textContent = state.labels === 'degrees' ? t('set.degrees') : t('set.names');
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
  $('tab').dataset.vuoto = 'si';
  $('perline').onchange = buildTab;
  $('cptab').onclick = () => {
    navigator.clipboard && navigator.clipboard.writeText($('tab').textContent).then(() => {
      $('cptab').textContent = t('tab.copied');
      setTimeout(() => { $('cptab').textContent = t('tab.copy'); }, 1200);
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
    if (!raw) { info.innerHTML = `<span class="err">${t('ir.empty')}</span>`; return; }
    let songs = [];
    try { songs = IReal.parse(raw); } catch (e) { songs = []; }
    if (!songs.length) {
      list.style.display = 'none';
      info.innerHTML = `<span class="err">${t('ir.bad')}</span>`;
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
    if (document.querySelector('dialog[open]')) return;
    if (e.code === 'Space') { e.preventDefault(); toggleTransport(); }
    if (e.key === 'ArrowRight' && state.index < state.grid.length - 1) select(state.index + 1);
    if (e.key === 'ArrowLeft' && state.index > 0) select(state.index - 1);
  });

  $('spanwrap').style.display = 'none';

  const dock = $('dock');
  try {
    const salvato = localStorage.getItem('manico-cassetto');
    if (salvato === 'no') dock.dataset.aperto = 'no';
  } catch (e) { /* archiviazione non disponibile */ }
  $('docktab').onclick = () => {
    const aperto = dock.dataset.aperto !== 'no';
    dock.dataset.aperto = aperto ? 'no' : 'si';
    try { localStorage.setItem('manico-cassetto', aperto ? 'no' : 'si'); } catch (e) { /* niente */ }
  };

  document.querySelectorAll('[data-apre]').forEach(b => {
    b.onclick = () => {
      const d = $(b.dataset.apre);
      if (b.dataset.apre === 'dlgtab') buildTab();
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    };
  });
  document.querySelectorAll('dialog').forEach(d => {
    d.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => d.close(); });
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
  });
}

function loadSong(k) {
  const song = state.songs[k];
  if (!song) return;
  loadGrid(IReal.toGrid(song), true);
  $('irinfo').textContent = t('ir.loaded', song.title, song.composer, song.key, song.bars.length);
}

window.MANICO = { versione: document.documentElement.dataset.versione || '?' };

try {
  init();
} catch (err) {
  // Un elemento mancante non deve spegnere tutta la pagina.
  console.error('Manico: inizializzazione interrotta', err);
}
