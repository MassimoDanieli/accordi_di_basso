// Dedicated MP3 import tab. The iframe transcribes the bass line and sends
// the original File plus timed note events back to the main fretboard.

(function initAudioImportUI() {
  'use strict';

  const ASSET_VERSION = document.documentElement.dataset.versione || 'dev';
  const STRING_NAMES = ['E', 'A', 'D', 'G'];
  const copy = {
    it: {
      tab: 'Importa MP3',
      title: 'Importa MP3',
      hint: 'Scegli un file, trascrivi la linea di basso e torna sul manico per suonarla.',
      close: 'Chiudi',
      line: 'Linea di basso importata',
      play: '▶ Riproduci',
      pause: '❚❚ Pausa',
      exit: 'Esci dalla linea',
      note: 'Nota',
      chord: 'Accordo indicativo',
      transferError: 'Non riesco a trasferire l’audio sul manico. Seleziona di nuovo il file.'
    },
    en: {
      tab: 'Import MP3',
      title: 'Import MP3',
      hint: 'Choose a file, transcribe the bass line, then return to the fretboard to play it.',
      close: 'Close',
      line: 'Imported bass line',
      play: '▶ Play',
      pause: '❚❚ Pause',
      exit: 'Exit bass line',
      note: 'Note',
      chord: 'Suggested chord',
      transferError: 'The audio could not be transferred to the fretboard. Choose the file again.'
    }
  };

  let importDialog = null;
  let importFrame = null;
  let importedAudio = null;
  let importedUrl = null;
  let importedEvents = [];
  let player = null;
  let overlay = null;
  let animationFrame = 0;
  let activeIndex = -1;
  let originalBoardPosition = '';
  let originalBoardOverflow = '';

  function language() {
    try {
      return localStorage.getItem('manico-lingua') === 'en' ? 'en' : 'it';
    } catch (error) {
      return document.documentElement.lang === 'en' ? 'en' : 'it';
    }
  }

  function strings() {
    return copy[language()];
  }

  function formatTime(seconds) {
    const value = Number.isFinite(seconds) ? seconds : 0;
    return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  }

  function translate() {
    const c = strings();
    const openButton = document.getElementById('mp3-import-tab');
    const title = document.getElementById('mp3-dialog-title');
    const hint = document.getElementById('mp3-dialog-hint');
    const closeButton = document.getElementById('mp3-dialog-close');
    if (openButton) openButton.textContent = c.tab;
    if (title) title.textContent = c.title;
    if (hint) hint.textContent = c.hint;
    if (closeButton) closeButton.textContent = c.close;
    if (player) {
      player.querySelector('[data-role="title"]').textContent = c.line;
      player.querySelector('[data-role="exit"]').textContent = c.exit;
      updatePlayButton();
    }
  }

  function createImportDialog() {
    if (importDialog) return;

    importDialog = document.createElement('dialog');
    importDialog.id = 'dlgmp3';
    importDialog.className = 'wide';
    importDialog.style.cssText = [
      'width:min(1180px,96vw)',
      'max-width:96vw',
      'height:min(900px,92vh)',
      'max-height:92vh',
      'padding:0',
      'overflow:hidden'
    ].join(';');
    importDialog.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column">
        <header style="display:flex;align-items:center;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line)">
          <div style="min-width:0;flex:1">
            <h2 id="mp3-dialog-title" style="margin:0 0 3px"></h2>
            <p id="mp3-dialog-hint" class="hint" style="margin:0"></p>
          </div>
          <button type="button" id="mp3-dialog-close"></button>
        </header>
        <iframe id="mp3-import-frame" title="MP3 bass-line import" style="display:block;width:100%;flex:1;border:0;background:#171411"></iframe>
      </div>`;
    document.body.appendChild(importDialog);

    importFrame = importDialog.querySelector('#mp3-import-frame');
    importDialog.querySelector('#mp3-dialog-close').onclick = () => importDialog.close();
    translate();
  }

  function openImportDialog() {
    createImportDialog();
    if (!importFrame.src && !importFrame.srcdoc) {
      const embedded = window.MANICO_AUDIO_IMPORT_SRCDOC;
      if (embedded) importFrame.srcdoc = embedded;
      else importFrame.src = `audio-import.html?v=${ASSET_VERSION}`;
    }
    if (typeof importDialog.showModal === 'function') importDialog.showModal();
    else importDialog.setAttribute('open', '');
  }

  function stopImportedLine() {
    cancelAnimationFrame(animationFrame);
    if (importedAudio) {
      importedAudio.pause();
      importedAudio.removeAttribute('src');
      importedAudio.load();
    }
    if (importedUrl) URL.revokeObjectURL(importedUrl);

    importedAudio = null;
    importedUrl = null;
    importedEvents = [];
    activeIndex = -1;
    player?.remove();
    overlay?.remove();
    player = null;
    overlay = null;

    const board = document.getElementById('board');
    if (board) {
      board.style.position = originalBoardPosition;
      board.style.overflow = originalBoardOverflow;
    }
    const songline = document.getElementById('songline');
    if (songline) songline.hidden = true;
  }

  function ensureOverlay() {
    const board = document.getElementById('board');
    if (!board) return null;
    if (overlay?.isConnected && overlay.parentElement === board) return overlay;

    originalBoardPosition = board.style.position;
    originalBoardOverflow = board.style.overflow;
    board.style.position = 'relative';
    board.style.overflow = 'hidden';

    overlay = document.createElement('div');
    overlay.id = 'bassline-board-overlay';
    overlay.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:100',
      'display:grid',
      'grid-template-columns:42px repeat(13,minmax(0,1fr))',
      'grid-template-rows:repeat(4,minmax(0,1fr))',
      'pointer-events:none',
      'background:linear-gradient(#5b3824,#3f271a)'
    ].join(';');
    board.appendChild(overlay);
    return overlay;
  }

  function drawFretboard(event) {
    const layer = ensureOverlay();
    if (!layer) return;
    layer.innerHTML = '';

    for (let stringIndex = 0; stringIndex < 4; stringIndex += 1) {
      const label = document.createElement('div');
      label.textContent = STRING_NAMES[stringIndex];
      label.style.cssText = 'display:grid;place-items:center;background:#171411;border-right:1px solid #685342;font-weight:700';
      layer.appendChild(label);

      for (let fret = 0; fret <= 12; fret += 1) {
        const cell = document.createElement('div');
        cell.style.cssText = 'position:relative;border-right:1px solid #aa806277;border-bottom:1px solid #dbc4ae55';
        if (event && event.string === stringIndex && event.fret === fret) {
          const dot = document.createElement('span');
          dot.textContent = event.note || '';
          dot.style.cssText = [
            'position:absolute',
            'left:50%',
            'top:50%',
            'transform:translate(-50%,-50%)',
            'width:38px',
            'height:38px',
            'border-radius:50%',
            'display:grid',
            'place-items:center',
            'background:var(--root)',
            'color:#181008',
            'font-weight:900',
            'box-shadow:0 0 0 7px rgba(240,199,94,.22),0 5px 18px rgba(0,0,0,.65)'
          ].join(';');
          cell.appendChild(dot);
        }
        layer.appendChild(cell);
      }
    }
  }

  function updatePlayButton() {
    if (!player) return;
    player.querySelector('[data-role="play"]').textContent = importedAudio && !importedAudio.paused
      ? strings().pause
      : strings().play;
  }

  function updateImportedPlayback() {
    cancelAnimationFrame(animationFrame);

    const tick = () => {
      if (!player || !importedAudio) return;
      ensureOverlay();

      const currentTime = importedAudio.currentTime || 0;
      const duration = importedAudio.duration || 0;
      player.querySelector('[data-role="seek"]').value = duration ? currentTime / duration * 1000 : 0;
      player.querySelector('[data-role="time"]').textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      updatePlayButton();

      let index = importedEvents.findIndex(event => currentTime >= event.start && currentTime < event.end);
      if (index < 0 && importedEvents.length) {
        index = Math.max(0, importedEvents.findLastIndex(event => event.start <= currentTime));
      }
      if (index !== activeIndex) {
        activeIndex = index;
        const event = importedEvents[index] || null;
        drawFretboard(event);

        const songline = document.getElementById('songline');
        if (songline && event) {
          const c = strings();
          const position = Number.isInteger(event.string) && Number.isInteger(event.fret)
            ? `${STRING_NAMES[event.string]} · ${event.fret}`
            : '—';
          songline.hidden = false;
          songline.textContent = `${c.note}: ${event.note || '—'} · ${position} · ${c.chord}: ${event.chord || '—'}`;
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  function buildPlayer(title) {
    const board = document.getElementById('board');
    const left = board?.closest('.left');
    if (!board || !left) return;

    player = document.createElement('section');
    player.id = 'bassline-player';
    player.style.cssText = 'margin:0 0 12px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--panel);display:flex;gap:10px;align-items:center;flex-wrap:wrap';
    player.innerHTML = `
      <div style="min-width:180px;flex:0 1 auto"><strong data-role="title"></strong><div class="hint">${title || 'MP3'}</div></div>
      <button type="button" class="pri" data-role="play"></button>
      <input type="range" data-role="seek" min="0" max="1000" value="0" style="min-width:180px;flex:1;accent-color:var(--root)">
      <span class="val" data-role="time">0:00 / 0:00</span>
      <button type="button" data-role="exit"></button>`;
    left.insertBefore(player, board);

    player.querySelector('[data-role="play"]').onclick = async () => {
      if (!importedAudio) return;
      try {
        if (importedAudio.paused) await importedAudio.play();
        else importedAudio.pause();
      } catch (error) {
        console.error('MP3 playback failed', error);
      }
      updatePlayButton();
    };
    player.querySelector('[data-role="seek"]').oninput = event => {
      if (importedAudio?.duration) {
        importedAudio.currentTime = Number(event.target.value) / 1000 * importedAudio.duration;
      }
    };
    player.querySelector('[data-role="exit"]').onclick = stopImportedLine;

    translate();
    drawFretboard(null);
    updateImportedPlayback();
  }

  function openOnFretboard(data) {
    stopImportedLine();

    const file = data.file;
    const validFile = file && typeof file === 'object' && typeof file.arrayBuffer === 'function';
    const validEvents = Array.isArray(data.events) && data.events.length > 0;
    if (!validFile || !validEvents) {
      const info = document.getElementById('irinfo');
      if (info) info.textContent = strings().transferError;
      return;
    }

    importedEvents = data.events
      .filter(event => Number.isFinite(event.start) && Number.isFinite(event.end))
      .map(event => ({
        start: Number(event.start),
        end: Number(event.end),
        midi: Number(event.midi),
        note: String(event.note || ''),
        string: Number.isInteger(event.string) ? event.string : null,
        fret: Number.isInteger(event.fret) ? event.fret : null,
        chord: String(event.chord || '—')
      }));

    importedUrl = URL.createObjectURL(file);
    importedAudio = new Audio(importedUrl);
    importedAudio.preload = 'auto';
    importedAudio.addEventListener('ended', () => {
      importedAudio.currentTime = 0;
      activeIndex = -1;
      drawFretboard(importedEvents[0] || null);
      updatePlayButton();
    });

    if (importDialog?.open) importDialog.close();
    buildPlayer(data.title);
  }

  function mount() {
    const tools = document.querySelector('.tools');
    if (!tools || document.getElementById('mp3-import-tab')) return;

    const button = document.createElement('button');
    button.id = 'mp3-import-tab';
    button.type = 'button';
    button.className = 'add';
    button.onclick = openImportDialog;

    const addSongs = tools.querySelector('[data-apre="dlgireal"]');
    if (addSongs) addSongs.insertAdjacentElement('afterend', button);
    else tools.prepend(button);

    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== importFrame?.contentWindow) return;
      if (event.data?.type !== 'manico-bassline') return;
      openOnFretboard(event.data);
    });

    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-lang]')) setTimeout(translate, 0);
    });
    translate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
