// Stato dell'applicazione e collegamento fra i moduli.

import { TUNINGS, parseChord, degreeName, noteName } from './theory.js';
import * as V from './voicings.js';
import * as A from './audio.js';
import * as R from './render.js';
import * as Tab from './tab.js';
import * as IReal from './ireal.js';
import * as MusicXML from './musicxml.js';
import * as CZ from './canzoniere.js';
import { LIBRARY } from './library.js';
import { initTheme, refreshThemeLabel } from './theme.js';
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
  playMode: 'arp',
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
function bestZone(items, near) {
  const ok = items.filter(x => x.ok);
  if (!ok.length) return null;
  const rif = near === undefined ? state.zoneFrom : near;
  let best = null, score = -1;
  for (let from = 0; from <= state.frets - state.zoneWidth + 1; from++) {
    const s = Math.min(...ok.map(x => coverage(x.chord, from)));
    // A parita' di copertura vince la zona piu' vicina a quella corrente:
    // cosi' l'inseguimento non riporta ogni volta al tasto 0.
    if (s > score + 1e-9 || (Math.abs(s - score) <= 1e-9 && best !== null
        && Math.abs(from - rif) < Math.abs(best - rif))) { score = s; best = from; }
  }
  return best;
}
function setZone(from, quiet) {
  state.zoneFrom = from;
  $('zs').value = from;
  $('zsv').textContent = from;
  cache = new Map();
  describeZone();
  quiet ? renderStrip() : render();
}

// ---------------------------------------------------------------- disegno

function renderChips() {
  let html = '', bar = -1;
  state.grid.forEach((x, i) => {
    if (x.bar !== bar && i > 0) html += '<span class="bl">|</span>';
    bar = x.bar;
    if (x.ok) {
      const v = chosen(i);
      const sum = v ? v.shape.map(n => noteName(n.pc, x.chord.flats)).join('\u00b7') : '';
      html += `<button class="chip${i === state.index ? ' on' : ''}" data-pick="${i}">`
        + `<span class="cs">${x.chord.symbol}</span>${sum ? `<span class="cn">${sum}</span>` : ''}</button>`;
    }
    else if (x.rest) html += `<span class="chip rest">N.C.</span>`;
    else html += `<span class="chip bad" title="${t('chip.bad')}">${x.raw}</span>`;
  });
  $('chips').innerHTML = html;
  // Scorrimento del solo nastro: scrollIntoView su iOS trascina l'intera pagina.
  const attivo = $('chips').querySelector('.chip.on');
  if (attivo) {
    const r = $('chips');
    const x = Math.max(0, attivo.offsetLeft - (r.clientWidth - attivo.offsetWidth) / 2);
    if (r.scrollTo) r.scrollTo({ left: x, behavior: 'smooth' }); else r.scrollLeft = x;
  }
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

/**
 * L'altezza del manico non puo' dipendere dal CSS: con una riga flessibile e
 * max-height in percentuale il calcolo e' circolare e i browser lo risolvono in
 * modi diversi, fino ad azzerare l'altezza. La misura si fa qui.
 */
function fitBoard() {
  const box = $('board');
  const svg = box && box.querySelector('.bstatic svg');
  if (!svg) return;
  const vb = (svg.getAttribute('viewBox') || '0 0 800 250').split(/\s+/).map(Number);
  const ratio = vb[2] / vb[3];
  const w = Math.max(0, box.clientWidth - 24);
  const h = Math.max(0, box.clientHeight - 16);
  // La larghezza comanda: il manico si legge in orizzontale. L'altezza puo'
  // limitare, ma mai sotto i 720px: meglio due dita di scorrimento verticale
  // che i tasti strizzati.
  const tetto = h > 40 ? Math.max(h * ratio, 720) : Infinity;
  svg.style.width = Math.max(Math.min(w, tetto), 480) + 'px';
  svg.style.height = 'auto';
}

/**
 * Il movimento delle voci: un anello per ogni nota del voicing scelto, che plana
 * dalla posizione vecchia alla nuova con una scia. Il livello sopravvive al
 * ridisegno del manico, quindi la transizione attraversa il cambio di accordo.
 */
function updateFlow(idx) {
  const wrap = ensureBoardWrap();
  const flow = wrap.querySelector('.flow');
  const geo = R.boardGeometry(open(), state.frets, state.flipped);
  const vb = `0 0 ${geo.W} ${geo.H}`;
  if (flow.getAttribute('viewBox') !== vb) { flow.setAttribute('viewBox', vb); flow.innerHTML = ''; }

  const item = state.grid[idx];
  const v = item && item.ok ? chosen(idx) : null;
  const mete = v ? v.shape
    .map(n => ({ ...n, p: geo.pos(n.si, n.f) }))
    .filter(n => n.p)
    .sort((a, b) => a.midi - b.midi) : [];

  const anelli = [...flow.querySelectorAll('.ring')];
  const scie = [...flow.querySelectorAll('.trail')];

  mete.forEach((n, k) => {
    let ring = anelli[k], trail = scie[k];
    if (!ring) {
      trail = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      trail.setAttribute('class', 'trail');
      flow.appendChild(trail);
      ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('class', 'ring');
      ring.setAttribute('r', '25');
      ring.style.transform = `translate(${n.p.x}px, ${n.p.y}px)`;
      flow.appendChild(ring);
    }
    const daX = parseFloat(ring.dataset.x), daY = parseFloat(ring.dataset.y);
    const mosso = !Number.isNaN(daX) && (Math.abs(daX - n.p.x) > 0.5 || Math.abs(daY - n.p.y) > 0.5);
    if (mosso && trail) {
      trail.setAttribute('x1', daX); trail.setAttribute('y1', daY);
      trail.setAttribute('x2', n.p.x); trail.setAttribute('y2', n.p.y);
      trail.classList.remove('viva');
      void trail.getBoundingClientRect();
      trail.classList.add('viva');
    }
    ring.dataset.x = n.p.x; ring.dataset.y = n.p.y;
    ring.style.opacity = '1';
    ring.style.stroke = degreeVar(n.iv, item ? item.chord : null);
    ring.style.transform = `translate(${n.p.x}px, ${n.p.y}px)`;
  });

  for (let k = mete.length; k < anelli.length; k++) anelli[k].style.opacity = '0';
}

/** Colore del grado, per gli anelli. */
function degreeVar(iv, chord) {
  if (!chord) return 'var(--root)';
  if (iv === 0) return 'var(--root)';
  if (iv === chord.third) return 'var(--third)';
  if (iv === chord.fifth) return 'var(--fifth)';
  if (iv >= 9 && iv <= 11) return 'var(--sev)';
  return 'var(--ext)';
}

/**
 * Arpeggio dell'accordo: dalla fondamentale in su per i gradi dentro la zona,
 * a specchio quando i movimenti superano le note disponibili. R-3-5-7 in 4/4,
 * R-3-5-7-5-3 in 6/8: la grammatica dello studio degli arpeggi.
 */
function arpLine(i, nb) {
  const item = state.grid[i];
  if (!item || !item.ok) return [];
  const notes = V.zoneNotes(item.chord, open(), state.zoneFrom, zoneTo())
    .slice().sort((a, b) => a.midi - b.midi);
  if (!notes.length) return [];
  const v = chosen(i);
  const rootMidi = (v && v.shape[0].midi) || (notes.find(n => n.iv === 0) || notes[0]).midi;
  let su = notes.filter(n => n.midi >= rootMidi);
  if (!su.length) su = notes;
  const linea = [];
  let k = 0, dir = 1;
  for (let b = 0; b < nb; b++) {
    linea.push(su[k]);
    if (su.length === 1) continue;
    if (k + dir >= su.length || k + dir < 0) dir = -dir;   // specchio in cima e in fondo
    k += dir;
  }
  return linea;
}

function walkGhosts() {
  if (state.playMode !== 'walking') return [];
  const nb = Math.max(1, Math.round(state.beats * ((state.grid[state.index] || {}).dur || 1)));
  return walkingLine(state.index, nb).filter(n => n && n.pass);
}

function ensureBoardWrap() {
  const box = $('board');
  if (!box.querySelector('.bwrap')) {
    box.innerHTML = '<div class="bwrap"><div class="bstatic"></div>'
      + '<svg class="flow" xmlns="http://www.w3.org/2000/svg"></svg></div>';
  }
  return box.querySelector('.bwrap');
}

function renderBoard() {
  const item = state.grid[state.index];
  const v = chosen(state.index);
  ensureBoardWrap().querySelector('.bstatic').innerHTML = R.fretboard({
    chord: item && item.ok ? item.chord : null,
    open: open(), zoneFrom: state.zoneFrom, zoneTo: zoneTo(), frets: state.frets,
    labels: state.labels, flipped: state.flipped, dimOutside: state.dimOutside,
    highlight: v ? v.shape : [],
    ghosts: walkGhosts()
  });
  fitBoard();
  updateFlow(state.index);
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
  const sel = $('voices').querySelector('.voice.sel');
  if (sel) {
    const v = $('voices');
    const y = Math.max(0, sel.offsetTop - (v.clientHeight - sel.offsetHeight) / 2);
    if (v.scrollTo) v.scrollTo({ top: y, behavior: 'smooth' }); else v.scrollTop = y;
  }
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

/** Trova una posizione in zona per un midi qualsiasi, anche fuori dall'accordo. */
function findPos(midi) {
  const o = open();
  for (let si = o.length - 1; si >= 0; si--) {
    const f = midi - o[si];
    if (f >= state.zoneFrom && f <= zoneTo()) return { si, f, midi, pc: ((midi % 12) + 12) % 12, iv: -2 };
  }
  return null;
}

/**
 * Linea walking essenziale dentro la zona: fondamentale, due note dell'accordo in
 * salita, nota cromatica di avvicinamento alla fondamentale dell'accordo successivo.
 */
function walkingLine(i, beats) {
  const item = state.grid[i];
  if (!item || !item.ok) return [];
  const notes = V.zoneNotes(item.chord, open(), state.zoneFrom, zoneTo());
  if (!notes.length) return [];
  const v = chosen(i);
  const root = (v && v.shape[0]) || notes.find(n => n.iv === 0) || notes[0];

  // Dove sta andando la linea: la fondamentale del prossimo accordo utile.
  let target;
  for (let k = 1; k <= state.grid.length; k++) {
    const j = (i + k) % state.grid.length;
    if (!state.grid[j].ok) continue;
    const vNext = chosen(j);
    target = (vNext && vNext.shape[0].midi)
      || (V.zoneNotes(state.grid[j].chord, open(), state.zoneFrom, zoneTo())[0] || {}).midi;
    break;
  }

  // Le note dell'accordo si percorrono nella direzione del bersaglio,
  // e l'avvicinamento cromatico arriva dal lato del moto: da sotto se si
  // sale, da sopra se si scende. E' la grammatica classica del walking.
  const giu = target !== undefined && target < root.midi;
  const tones = notes
    .filter(n => (giu ? n.midi < root.midi : n.midi > root.midi) && n.pc !== root.pc)
    .sort((a, b) => (giu ? b.midi - a.midi : a.midi - b.midi));
  const passi = tones.length ? tones : [root];
  let appr = null;
  if (target !== undefined) {
    appr = (giu ? findPos(target + 1) : findPos(target - 1))
        || (giu ? findPos(target - 1) : findPos(target + 1));
    if (appr) appr = { ...appr, pass: true };
  }

  const linea = [root];
  for (let b = 1; b < beats - 1; b++) linea.push(passi[(b - 1) % passi.length]);
  if (beats > 1) linea.push(appr || passi[passi.length - 1] || root);
  return linea;
}

/** Rumore deterministico: stesso giro e stessa battuta, stesso fraseggio. */
function seme(a, b) {
  let x = (a * 374761393 + b * 668265263 + 1442695040888963) >>> 0;
  return () => {
    x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0;
    return x / 4294967296;
  };
}

/**
 * Il fraseggio del walking: semiminime come impianto, ornamenti idiomatici sopra.
 * Ogni evento ha posizione e durata in movimenti; lo swing sta nei 2/3 del tempo.
 */
function walkingEvents(i, giro) {
  const item = state.grid[i];
  if (!item || !item.ok) return [];
  const dur = item.dur || 1;
  const rnd = seme(i * 31 + 7, giro * 101 + 13);
  const ev = [];

  // 6/8: due pulsazioni puntate (1 e 4), non sei note uguali.
  if (state.beats === 6) {
    const linea = walkingLine(i, 2);
    if (!linea.length) return [];
    ev.push({ n: linea[0], at: 0, len: 2.6, vol: 0.36 });
    if (linea[1] && dur >= 1) ev.push({ n: linea[1], at: 3, len: 2.4, vol: 0.3 });
    return ev;
  }

  const nb = Math.max(1, Math.round(state.beats * dur));
  const linea = walkingLine(i, nb);
  if (!linea.length) return [];

  linea.forEach((n, b) => {
    if (n) ev.push({ n, at: b, len: 0.92, vol: b === 0 ? 0.36 : 0.3 });
  });

  // Con meno di tre movimenti non c'e' spazio per ornamenti.
  if (nb < 3) return ev;

  // Salto d'ottava sul terzo movimento, quando la zona lo consente.
  if (rnd() < 0.25) {
    const su = findPos(linea[0].midi + 12);
    if (su && ev[2]) { ev[2] = { ...ev[2], n: su }; }
  }

  // Ultimo movimento in due ottavi swingati: nota dell'accordo, poi il passaggio.
  if (rnd() < 0.5 && ev.length >= 2) {
    const ultimo = ev[ev.length - 1];
    const prima = ev[ev.length - 2];
    ultimo.len = 0.6;
    ev.push({ n: ultimo.n, at: ultimo.at + 2 / 3, len: 0.3, vol: 0.28 });
    ultimo.n = prima.n;
  }

  // Ghost percussiva sul levare del secondo movimento.
  if (rnd() < 0.35 && ev[1]) {
    ev.push({ n: ev[1].n, at: 1 + 2 / 3, len: 0.07, vol: 0.12, ghost: true });
  }

  return ev.sort((a, b) => a.at - b.at);
}

// ---------------------------------------------------------------- trasporto

function tick() {
  if (!state.playing) return;
  if (state.index === 0) state.giro = (state.giro || 0) + 1;
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
    if (state.playMode === 'arp') {
      const beatSec = 60 / state.bpm;
      const nb = Math.max(1, Math.round(state.beats * (item.dur || 1)));
      clearFlashes();
      arpLine(state.index, nb).forEach((n, b) => {
        if (!n) return;
        A.pluck(n.midi, b * beatSec, Math.min(beatSec * 0.92, 0.8), b === 0 ? 0.35 : 0.3);
        flashes.push(setTimeout(() => flash(n), b * beatSec * 1000));
      });
    } else if (state.playMode === 'walking') {
      const beatSec = 60 / state.bpm;
      clearFlashes();
      walkingEvents(state.index, state.giro || 0).forEach(ev => {
        A.pluck(ev.n.midi, ev.at * beatSec, ev.len * beatSec, ev.vol);
        flashes.push(setTimeout(() => flash(ev.n), ev.at * beatSec * 1000));
      });
    } else {
      const v = chosen(state.index);
      if (v) {
        if (state.playMode === 'root') {
          A.pluck(v.shape[0].midi, 0, Math.min(seconds * 0.9, 1.6), 0.3);
          clearFlashes(); flash(v.shape[0]);
        } else hear(v, seconds * 0.92);
      }
    }
  }
  // Le voci partono verso il prossimo accordo poco prima del cambio,
  // cosi' arrivano sull'attacco: il voice leading si vede accadere.
  const prossimo = (state.index + 1) % state.grid.length;
  if (state.grid[prossimo] && state.grid[prossimo].ok) {
    flashes.push(setTimeout(() => updateFlow(prossimo), Math.max(60, (seconds - 0.38) * 1000)));
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
  const walking = $('tabmode') && $('tabmode').value === 'walk';
  const bars = [];
  let current = null, barIndex = -1;
  state.grid.forEach((item, i) => {
    if (item.bar !== barIndex) { current = { label: [], columns: [], block: false }; bars.push(current); barIndex = item.bar; }
    if (!item.ok) { current.label.push(item.raw); return; }
    current.label.push(item.chord.symbol);
    if (walking) {
      const nb = Math.max(1, Math.round(state.beats * (item.dur || 1)));
      walkingLine(i, nb).forEach(n => {
        if (n) current.columns.push({ si: n.si, f: n.f, pass: !!n.pass });
      });
      return;
    }
    const v = chosen(i);
    if (!v) return;
    current.block = current.block || v.block;
    v.shape.forEach((n, k) => current.columns.push({ si: n.si, f: n.f, newGroup: v.block && k === 0 }));
  });

  const modo = walking ? t('tab.walk') : t('vt.' + state.vtype + '.name');
  let header = t('tab.head', $('seq').value, t('tun.' + state.tuning),
    state.zoneFrom, zoneTo(), modo);
  if (walking) header += '\n' + t('tab.legend');
  $('tab').textContent = Tab.render(bars, open(), state.flipped, +$('perline').value, header);
  $('tab').dataset.vuoto = 'no';
}

// ---------------------------------------------------------------- eventi

function loadGrid(text, autozone) {
  $('seq').value = text;
  parseGrid();
  if (autozone) {
    setLock(false);
    const b = bestZone(state.grid, 0);
    if (b !== null) setZone(b, true);
  }
  render();
}

function buildMenus() {
  const keep = { lib: $('lib').value, vtype: $('vtype').value, tun: $('tun').value,
                 nfrets: $('nfrets').value, perline: $('perline').value,
                 tabmode: $('tabmode').value };
  $('lib').innerHTML = LIBRARY.map((x, i) =>
    `<option value="${i}">${x[lang() === 'en' ? 1 : 0]} \u00b7 ${x[2]} \u00b7 ${x[3]} bpm</option>`).join('');
  $('vtype').innerHTML = V.VOICING_TYPES.map(x => `<option value="${x.id}">${t('vt.' + x.id + '.name')}</option>`).join('');
  $('tun').innerHTML = ['4', '5', '5c', '6'].map(k => `<option value="${k}">${t('tun.' + k)}</option>`).join('');
  $('nfrets').innerHTML = [12, 15, 18, 24].map(n => `<option value="${n}">${t('set.fretsTo', n)}</option>`).join('');
  $('modes').innerHTML = ['arp', 'walking', 'voicing', 'mute'].map(m =>
    `<button class="seg${state.playMode === m ? ' on' : ''}" data-mode="${m}" title="${t('play.' + m)}">${t('mode.' + m)}</button>`).join('');
  $('perline').innerHTML = [4, 2, 6].map(n => `<option value="${n}">${t('tab.perline', n)}</option>`).join('');
  $('tabmode').innerHTML = `<option value="blocks">${t('tab.blocks')}</option><option value="walk">${t('tab.walk')}</option>`;
  $('lib').value = keep.lib || '0';
  $('vtype').value = keep.vtype || state.vtype;
  $('tun').value = keep.tun || state.tuning;
  $('nfrets').value = keep.nfrets || String(state.frets);

  $('perline').value = keep.perline || '4';
  $('tabmode').value = keep.tabmode || 'blocks';
  $('tlab').textContent = state.labels === 'degrees' ? t('set.degrees') : t('set.names');
  $('pp').innerHTML = state.playing ? '&#9632;' : '&#9654;';
  $('zwv').textContent = t('zone.frets', state.zoneWidth);
  if ($('tab').textContent.trim() === '' || $('tab').dataset.vuoto === 'si') {
    $('tab').textContent = t('tab.press'); $('tab').dataset.vuoto = 'si';
  }
}

function closeDialog(d) {
  if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
}

/** Zona fissa: stato e pulsante sempre allineati. */
function setLock(v) {
  state.lockZone = v;
  const b = $('lock');
  if (b) b.classList.toggle('on', v);
}

function init() {
  initTheme();
  initLang(() => { buildMenus(); refreshThemeLabel(); render(); });
  parseGrid();
  render();

  buildMenus();

  $('go').onclick = () => { parseGrid(); render(); };
  $('seq').addEventListener('keydown', e => { if (e.key === 'Enter') { parseGrid(); render(); } });

  // La griglia si aggiorna da sola poco dopo l'ultima battitura: il pulsante resta
  // per chi preferisce confermare a mano.
  let attesa = null;
  $('seq').addEventListener('input', () => {
    setSongTitle(null);
    clearTimeout(attesa);
    attesa = setTimeout(() => { parseGrid(); render(); }, 550);
  });

  $('libgo').onclick = () => {
    const voce = LIBRARY[+$('lib').value];
    state.bpm = voce[3];
    $('bpm').value = voce[3];
    $('bpmv').textContent = voce[3];
    setSongTitle(voce[lang() === 'en' ? 1 : 0], '');
    loadGrid(voce[4], true);
    closeDialog($('dlgforme'));
  };

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
  $('zs').oninput = e => { setLock(true); setZone(+e.target.value); };
  $('zw').oninput = e => {
    setLock(true);
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
  $('modes').addEventListener('click', e => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    state.playMode = b.dataset.mode;
    $('modes').querySelectorAll('.seg').forEach(x => x.classList.toggle('on', x === b));
    renderBoard();
  });
  $('clk').onclick = e => { state.metronome = !state.metronome; e.target.classList.toggle('on', state.metronome); };
  $('lock').onclick = () => setLock(!state.lockZone);

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
    const raw = $('ireal').value.trim();
    if (!raw) { $('irinfo').innerHTML = `<span class="err">${t('ir.empty')}</span>`; return; }
    let songs = [];
    try { songs = IReal.parse(raw); } catch (e) { songs = []; }
    presentaBrani(songs);
  };
  $('irfile').onchange = e => {
    const files = [...e.target.files];
    if (!files.length) return;
    Promise.all(files.map(f => f.text())).then(testi => {
      let songs = [];
      testi.forEach(x => { try { songs = songs.concat(MusicXML.parse(x)); } catch (err) { /* file illeggibile */ } });
      presentaBrani(songs);
    });
  };
  $('irlist').onchange = e => loadSong(+e.target.value);

  $('czq').oninput = () => renderCanzoniere();
  $('czlist').addEventListener('click', e => {
    const via = e.target.closest('[data-via]');
    if (via) {
      CZ.rimuovi(via.dataset.via).then(renderCanzoniere);
      e.stopPropagation(); return;
    }
    const voce = e.target.closest('.czvoce[data-id]');
    if (!voce) return;
    CZ.tutti().then(list => {
      const sng = list.find(x => x.id === voce.dataset.id);
      if (!sng) return;
      state.songs = [sng];
      loadSong(0);
      closeDialog($('dlgforme'));
    });
  });
  $('czout').onclick = () => {
    CZ.esporta().then(json => {
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        a.download = 'manico-canzoniere.json';
        a.click();
      } catch (e) { /* ambiente senza download: niente dramma */ }
    });
  };
  $('czin').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(x => CZ.importa(x)).then(n => {
      renderCanzoniere();
      $('czq').value = '';
    });
    e.target.value = '';
  };

  // Delega degli eventi sui contenuti ridisegnati.
  $('chips').addEventListener('click', e => {
    const b = e.target.closest('[data-pick]');
    if (b) select(+b.dataset.pick);
  });
  $('strip').addEventListener('click', e => {
    const b = e.target.closest('[data-zone]');
    if (b) { setLock(true); setZone(+b.dataset.zone); }
  });
  $('voices').addEventListener('click', e => {
    const hearBtn = e.target.closest('[data-hear]');
    if (hearBtn) { e.stopPropagation(); hear(candidates(state.index)[+hearBtn.dataset.hear], 1.6); return; }
    const card = e.target.closest('[data-voicing]');
    if (card) {
      state.pick[state.index] = +card.dataset.voicing;
      renderChips(); renderBoard(); renderVoicings();
      hear(chosen(state.index), 1.4);
    }
  });
  $('board').addEventListener('click', e => {
    const g = e.target.closest('[data-midi]');
    if (g) A.pluck(+g.dataset.midi);
  });

  window.addEventListener('resize', fitBoard);
requestAnimationFrame(() => requestAnimationFrame(fitBoard));
  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (document.querySelector('dialog[open]')) return;
    if (e.code === 'Space') { e.preventDefault(); toggleTransport(); }
    if (e.key === 'ArrowRight' && state.index < state.grid.length - 1) select(state.index + 1);
    if (e.key === 'ArrowLeft' && state.index > 0) select(state.index - 1);
  });

  $('spanwrap').style.display = 'none';

  // Pannello dei voicing a scomparsa: chi suona decide se vederlo.
  try {
    if (localStorage.getItem('manico-pannello') === 'no') document.body.dataset.pannello = 'no';
  } catch (e) { /* archiviazione non disponibile */ }
  $('vtoggle').onclick = () => {
    const chiuso = document.body.dataset.pannello === 'no';
    if (chiuso) delete document.body.dataset.pannello;
    else document.body.dataset.pannello = 'no';
    try { localStorage.setItem('manico-pannello', chiuso ? 'si' : 'no'); } catch (e) { /* niente */ }
    fitBoard();
  };

  document.querySelectorAll('[data-apre]').forEach(b => {
    b.onclick = () => {
      const d = $(b.dataset.apre);
      if (b.dataset.apre === 'dlgtab') buildTab();
      if (b.dataset.apre === 'dlgforme') renderCanzoniere();
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    };
  });
  document.querySelectorAll('dialog').forEach(d => {
    d.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => closeDialog(d); });
    d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
  });
}

function setSongTitle(title, composer) {
  state.song = title ? { title, composer } : null;
  const el = $('songline');
  if (!el) return;
  if (!state.song) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML = `<b>${title}</b>${composer ? ` <span class="by">\u2014 ${composer}</span>` : ''}`;
}

function presentaBrani(songs) {
  const info = $('irinfo'), list = $('irlist');
  if (!songs.length) {
    list.style.display = 'none';
    info.innerHTML = `<span class="err">${t('ir.bad')}</span>`;
    return;
  }
  state.songs = songs;
  list.style.display = songs.length > 1 ? '' : 'none';
  list.innerHTML = songs.map((s, i) => `<option value="${i}">${s.title}${s.composer ? ' \u2014 ' + s.composer : ''}</option>`).join('');
  loadSong(0);
}

function loadSong(k) {
  const song = state.songs[k];
  if (!song) return;
  // Tempo e metro del brano, quando il file li porta con se'.
  if (song.bpm >= 40 && song.bpm <= 200) {
    state.bpm = song.bpm; $('bpm').value = song.bpm; $('bpmv').textContent = song.bpm;
  }
  const b = IReal.beatsOf(song);
  state.beats = b; $('beats').value = String(b);
  loadGrid(IReal.toGrid(song), true);
  setSongTitle(song.title, song.composer);
  // Anteprima onesta: se qualche sigla non e' stata riconosciuta, la finestra
  // resta aperta e lo dice; il nastro le mostra in rosso.
  const brutte = [...new Set(state.grid.filter(x => !x.ok && x.raw !== 'N.C.').map(x => x.raw))];
  let info = t('ir.loaded', song.title, song.composer, song.key, song.bars.length);
  // Il brano entra nel canzoniere da solo, cosi' domani lo ritrovi.
  if (song.title && song.title !== 'senza titolo') {
    CZ.salva(song).then(r => { if (r) renderCanzoniere(); });
    info += ' \u00b7 ' + t('cz.salvato');
  }
  if (brutte.length) {
    $('irinfo').innerHTML = info + `<br><span class="err">${t('ir.unknown', brutte.join(' '))}</span>`;
  } else {
    $('irinfo').textContent = info;
    closeDialog($('dlgireal'));
  }
}

/** La lista del canzoniere, filtrata dalla ricerca. */
function renderCanzoniere() {
  const box = $('czlist');
  if (!box) return;
  CZ.tutti().then(list => {
    const filtrati = CZ.cerca(list, $('czq').value);
    if (!list.length) { box.innerHTML = `<div class="czvoce"><span class="tit hint">${t('cz.vuoto')}</span></div>`; return; }
    if (!filtrati.length) { box.innerHTML = `<div class="czvoce"><span class="tit hint">${t('cz.niente')}</span></div>`; return; }
    box.innerHTML = filtrati.map(sng =>
      `<div class="czvoce" data-id="${sng.id}">
        <span class="tit"><b>${sng.title}</b>${sng.composer ? ' \u2014 ' + sng.composer : ''}</span>
        <span class="meta">${[sng.stile, sng.bpm ? sng.bpm + ' bpm' : '', t('cz.batt', sng.bars.length)].filter(Boolean).join(' \u00b7 ')}</span>
        <button class="via" data-via="${sng.id}" title="\u00d7">\u00d7</button>
      </div>`).join('');
  });
}

window.MANICO = { versione: document.documentElement.dataset.versione || '?', fraseggio: walkingEvents, canzoniere: CZ };

try {
  init();
} catch (err) {
  // Un elemento mancante non deve spegnere tutta la pagina.
  console.error('Manico: inizializzazione interrotta', err);
}
