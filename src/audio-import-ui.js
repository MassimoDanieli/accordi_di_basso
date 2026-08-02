// Importazione MP3: la trascrizione avviene a schermo intero e la linea
// risultante viene riprodotta direttamente sul manico principale.

(function initAudioImportUI() {
  const VERSION = '4.4.0';
  const STRING_NAMES = ['E', 'A', 'D', 'G'];

  function language() {
    try { return localStorage.getItem('manico-lingua') === 'en' ? 'en' : 'it'; }
    catch (e) { return document.documentElement.lang === 'en' ? 'en' : 'it'; }
  }

  const copy = {
    it: {
      title: 'Importa MP3 e suona la linea sul manico',
      hint: 'Trascrivi la parte di basso. Al termine la registrazione e le note rilevate si aprono direttamente sul manico principale.',
      open: 'Importa MP3',
      close: 'Chiudi',
      line: 'Linea di basso importata',
      play: '▶ Riproduci',
      pause: '❚❚ Pausa',
      stop: 'Esci dalla linea',
      note: 'Nota',
      chord: 'Accordo indicativo'
    },
    en: {
      title: 'Import MP3 and play the line on the fretboard',
      hint: 'Transcribe the bass part. When ready, the recording and detected notes open directly on the main fretboard.',
      open: 'Import MP3',
      close: 'Close',
      line: 'Imported bass line',
      play: '▶ Play',
      pause: '❚❚ Pause',
      stop: 'Exit bass line',
      note: 'Note',
      chord: 'Suggested chord'
    }
  };

  let frame;
  let fullScreen;
  let events = [];
  let player = null;
  let boardOverlay = null;
  let raf = 0;
  let activeIndex = -1;
  let originalBoardVisibility = '';

  function childAudio() {
    try { return frame && frame.contentWindow.document.getElementById('audio'); }
    catch (e) { return null; }
  }

  function formatTime(seconds) {
    seconds = Number.isFinite(seconds) ? seconds : 0;
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  function createFullScreenImporter() {
    fullScreen = document.createElement('div');
    fullScreen.id = 'mp3-fullscreen';
    fullScreen.hidden = true;
    fullScreen.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:10000', 'background:var(--bg,#131110)',
      'display:flex', 'flex-direction:column'
    ].join(';');

    const top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--panel,#1d1a18)';
    top.innerHTML = '<strong style="font-size:18px">MP3 → Manico</strong><span style="flex:1"></span><button type="button" id="mp3fullclose"></button>';

    frame = document.createElement('iframe');
    frame.id = 'iraudioframe';
    frame.title = 'MP3 bass-line transcription';
    frame.style.cssText = 'display:block;width:100%;height:100%;flex:1;border:0;background:#171411';
    frame.src = `audio-import.html?v=${VERSION}`;

    fullScreen.append(top, frame);
    document.body.appendChild(fullScreen);
    top.querySelector('#mp3fullclose').onclick = closeImporter;
    translate();
  }

  function openImporter() {
    if (!fullScreen) createFullScreenImporter();
    fullScreen.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeImporter() {
    if (!fullScreen) return;
    fullScreen.hidden = true;
    document.body.style.overflow = '';
  }

  function translate() {
    const c = copy[language()];
    document.querySelectorAll('[data-audio-copy]').forEach(el => {
      el.textContent = c[el.dataset.audioCopy] || '';
    });
    const close = document.getElementById('mp3fullclose');
    if (close) close.textContent = c.close;
    if (player) {
      player.querySelector('[data-role="title"]').textContent = c.line;
      player.querySelector('[data-role="stop"]').textContent = c.stop;
      updateTransportText();
    }
  }

  function buildDirectPlayer(title) {
    stopDirectMode();
    const c = copy[language()];
    const board = document.getElementById('board');
    const left = board && board.closest('.left');
    if (!board || !left) return;

    player = document.createElement('section');
    player.id = 'bassline-player';
    player.style.cssText = 'margin:0 0 12px;padding:11px 12px;border:1px solid var(--line);border-radius:11px;background:var(--panel);display:grid;grid-template-columns:auto auto 1fr auto;gap:10px;align-items:center';
    player.innerHTML = `
      <div><strong data-role="title">${c.line}</strong><div class="hint">${title || 'MP3'}</div></div>
      <button type="button" class="pri" data-role="play">${c.play}</button>
      <input data-role="seek" type="range" min="0" max="1000" value="0" style="width:100%;accent-color:var(--root)">
      <div style="display:flex;align-items:center;gap:8px"><span data-role="time" class="val">0:00 / 0:00</span><button type="button" data-role="stop">${c.stop}</button></div>`;
    left.insertBefore(player, board);

    player.querySelector('[data-role="play"]').onclick = () => {
      const audio = childAudio();
      if (!audio) return;
      if (audio.paused) audio.play(); else audio.pause();
      updateTransportText();
    };
    player.querySelector('[data-role="seek"]').oninput = e => {
      const audio = childAudio();
      if (audio && audio.duration) audio.currentTime = Number(e.target.value) / 1000 * audio.duration;
    };
    player.querySelector('[data-role="stop"]').onclick = stopDirectMode;

    originalBoardVisibility = board.style.visibility;
    board.style.visibility = 'hidden';
    board.style.position = 'relative';

    boardOverlay = document.createElement('div');
    boardOverlay.id = 'bassline-board';
    boardOverlay.style.cssText = 'position:absolute;inset:0;visibility:visible;display:grid;grid-template-columns:42px repeat(13,1fr);grid-template-rows:repeat(4,1fr);overflow:hidden;border-radius:inherit;background:linear-gradient(#5b3824,#3f271a);z-index:4';
    board.parentElement.style.position = 'relative';
    board.parentElement.appendChild(boardOverlay);
    renderFretboard(null);
    tickDirectMode();
  }

  function renderFretboard(event) {
    if (!boardOverlay) return;
    boardOverlay.innerHTML = '';
    for (let string = 0; string < 4; string++) {
      const label = document.createElement('div');
      label.textContent = STRING_NAMES[string];
      label.style.cssText = 'display:grid;place-items:center;background:#171411;border-right:1px solid #685342;font-weight:700';
      boardOverlay.appendChild(label);
      for (let fret = 0; fret <= 12; fret++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'position:relative;border-right:1px solid #aa806277;border-bottom:1px solid #dbc4ae55';
        if (event && event.string === string && event.fret === fret) {
          const dot = document.createElement('div');
          dot.textContent = event.note;
          dot.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--root);color:#1b1308;font-weight:900;box-shadow:0 0 0 6px color-mix(in srgb,var(--root) 25%,transparent),0 5px 18px #0009';
          cell.appendChild(dot);
        }
        boardOverlay.appendChild(cell);
      }
    }
  }

  function updateTransportText() {
    if (!player) return;
    const audio = childAudio();
    const button = player.querySelector('[data-role="play"]');
    const c = copy[language()];
    button.textContent = audio && !audio.paused ? c.pause : c.play;
  }

  function tickDirectMode() {
    cancelAnimationFrame(raf);
    const loop = () => {
      if (!player) return;
      const audio = childAudio();
      if (audio) {
        const duration = audio.duration || 0;
        const time = audio.currentTime || 0;
        player.querySelector('[data-role="seek"]').value = duration ? time / duration * 1000 : 0;
        player.querySelector('[data-role="time"]').textContent = `${formatTime(time)} / ${formatTime(duration)}`;
        updateTransportText();
        let index = events.findIndex(e => time >= e.start && time < e.end);
        if (index < 0 && events.length) index = Math.max(0, events.findLastIndex(e => e.start <= time));
        if (index !== activeIndex) {
          activeIndex = index;
          renderFretboard(events[index] || null);
          const songline = document.getElementById('songline');
          if (songline && events[index]) {
            const c = copy[language()];
            songline.hidden = false;
            songline.textContent = `${c.note}: ${events[index].note} · ${STRING_NAMES[events[index].string] || '—'} ${events[index].fret ?? '—'} · ${c.chord}: ${events[index].chord || '—'}`;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopDirectMode() {
    cancelAnimationFrame(raf);
    const audio = childAudio();
    if (audio) audio.pause();
    if (player) player.remove();
    if (boardOverlay) boardOverlay.remove();
    player = null;
    boardOverlay = null;
    activeIndex = -1;
    const board = document.getElementById('board');
    if (board) board.style.visibility = originalBoardVisibility;
    const songline = document.getElementById('songline');
    if (songline) songline.hidden = true;
  }

  function mount() {
    const dialog = document.getElementById('dlgireal');
    if (!dialog || document.getElementById('iraudio')) return;

    const panel = document.createElement('section');
    panel.id = 'iraudio';
    panel.style.cssText = 'margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:10px';
    panel.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <h3 data-audio-copy="title" style="margin:0 0 4px"></h3>
          <p data-audio-copy="hint" class="hint" style="margin:0"></p>
        </div>
        <button type="button" id="iraudiotoggle" class="pri" data-audio-copy="open"></button>
      </div>`;
    const foot = dialog.querySelector('.dlg-foot');
    dialog.insertBefore(panel, foot || null);
    document.getElementById('iraudiotoggle').onclick = openImporter;

    window.addEventListener('message', e => {
      if (e.origin !== location.origin || !e.data || e.data.type !== 'manico-bassline') return;
      events = Array.isArray(e.data.events) ? e.data.events : [];
      closeImporter();
      if (dialog.open) dialog.close();
      buildDirectPlayer(e.data.title);
    });

    document.addEventListener('click', e => {
      if (e.target && e.target.closest && e.target.closest('[data-lang]')) setTimeout(translate, 0);
    });
    translate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
