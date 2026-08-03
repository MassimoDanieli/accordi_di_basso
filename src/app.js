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
      splitNote: 'Dividi nota', export: 'Esporta', exportTab: 'Scarica TAB',
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
      keys: 'Spazio: play/pausa · frecce: nota precedente/successiva',
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
      splitNote: 'Split note', export: 'Export', exportTab: 'Download TAB',
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
      keys: 'Space: play/pause · arrows: previous/next note',
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
      audio.playbackRate = track.settings.speed || 1;
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
    $('noteDown').disabled = !event;
    $('noteUp').disabled = !event;
    $('deleteNote').disabled = !event || state.track.events.length <= 1;
    $('splitNote').disabled = !event || event.end - event.start < 0.12;
  }

  function renderLoop() {
    const { loopA, loopB } = state.track.settings;
    $('loopLabel').textContent = loopA !== null && loopB !== null
      ? `A ${Core.formatTime(loopA)} — B ${Core.formatTime(loopB)}`
      : t('noLoop');
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
      const { loopA, loopB } = state.track.settings;
      if (state.playing && loopA !== null && loopB !== null && currentTime() >= loopB) setTime(loopA);
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
    state.playing = !state.playing;
    if (state.track.demo) {
      if (state.playing) scheduleDemo();
      else clearTimeout(state.demoTimer);
    } else if (state.track.audioBlob) {
      try {
        audio.playbackRate = state.track.settings.speed;
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

  function recalc() {
    state.track.events = Core.optimiseFingering(state.track.events, tuning().open, state.track.settings.frets);
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
      audio.playbackRate = state.track.settings.speed;
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
    $('exportTab').onclick = () => download(`${safeName(state.track.title)}.txt`, Core.renderTab(state.track, state.track.settings.tuning));
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
