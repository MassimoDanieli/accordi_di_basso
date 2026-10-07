(function initManicoApp(root) {
  'use strict';

  const Core = root.ManicoCore;
  // The version of the reader of notes: tracks read by an earlier one are read again when opened.
  const READER = 4;
  const Store = root.ManicoStorage;
  const Transcriber = root.ManicoTranscriber;
  const Separator = root.ManicoSeparator;
  const Chords = root.ManicoChords;
  const Sheet = root.ManicoSheet;
  const Pitch = root.ManicoPitch;
  if (!Core || !Store || !Transcriber || !Separator || !root.ManicoRhythm || !Chords || !Sheet || !Pitch) throw new Error('Manico modules missing');

  const $ = id => document.getElementById(id);
  const audio = $('audio');

  const COPY = {
    it: {
      product: 'Bass Transcriber', sister: 'Bass Chord Lab: accordi sulla tastiera', import: 'Importa audio', eyebrow: 'Dal brano alle dita',
      library: 'Torna ai brani', trackTitle: 'Titolo del brano', transcribedNotes: 'Tablatura con battute e valori ritmici: scorre a tempo con il brano', fretboard: 'Manico del basso',
      positionLabel: 'Posizione nel brano', help: 'Aiuto', source: 'Codice su GitHub',
      heroTitle: 'Ascolta. Trascrivi. Suona.',
      heroText: 'Importa una registrazione, ricava la linea di basso e studiala sul manico. Audio, trascrizione e correzioni restano sul tuo dispositivo.',
      privacy: 'Nessun upload. Tutto avviene nel browser.', dropTitle: 'Porta qui i tuoi brani',
      dropText: 'Uno, tanti o una cartella: MP3, WAV, M4A, AAC, OGG o FLAC', choose: 'Scegli i file', chooseFolder: 'Scegli una cartella',
      analyseManyTitle: 'Trascrivi {n} brani', startMany: 'Trascrivi {n} brani', andOthers: 'e altri {n}',
      analyseManyHint: 'Vengono trascritti uno dopo l’altro con queste scelte, e salvati sul dispositivo. Puoi lasciare la pagina aperta e fare altro.',
      manyKnown: 'Già salvati, da saltare: {n}.',
      outcomeReady: 'brani pronti', outcomeReadyOne: 'brano pronto', outcomeKnown: 'già salvati', outcomeFailed: 'non riusciti',
      outcomeStopped: 'interrotto prima della fine', noAudioFiles: 'Lì non ho trovato file audio.',
      reasonNoNotes: 'nessuna nota trovata', reasonNoBass: 'nessun basso trovato', reasonFailed: 'non leggibile',
      yourTracks: 'I tuoi brani', yourTracksHint: 'Riapri una trascrizione e continua da dove eri rimasto.',
      examples: 'Brani inclusi', examplesHint: 'Cinque brani suonati dal programma, con basso, batteria e accordi: per provare tutto senza importare nulla.',
      loadingPiece: 'Carico la registrazione…',
      empty: 'Non hai ancora importato brani.', open: 'Apri', remove: 'Elimina',
      confirmDelete: 'Eliminare questo brano e il suo audio?', notes: 'note', storage: 'Spazio locale',
      unavailable: 'non disponibile', saved: 'Salvato sul dispositivo', demo: 'Brano incluso',
      previous: 'precedente', current: 'adesso', upcoming: 'in arrivo', now: 'Adesso',
      playAlong: 'Suona con me', micStart: 'Avvia microfono', micStop: 'Ferma microfono',
      micReady: 'Usa cuffie per evitare che il brano rientri nel microfono.', micListening: 'In ascolto… suona la nota evidenziata.',
      micDenied: 'Microfono non disponibile o permesso negato.', detected: 'Rilevata', score: 'Punteggio',
      onTime: 'in tempo', early: 'in anticipo', late: 'in ritardo', wrong: 'nota errata',
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
      noBass: 'In questo brano non ho trovato un basso: forse è una base per suonarci sopra.',
      reread: 'Note rilette con il lettore nuovo',
      persistentYes: 'archiviazione persistente', persistentNo: 'il browser può liberare spazio automaticamente',
      importedLine: 'Linea di basso trascritta', isolatedLine: 'Trascritta dal basso isolato',
      isolate: 'Isola il basso con l’AI (consigliato)',
      isolateHint: 'Separa il basso dal resto del brano, qui nel browser: la trascrizione è molto più precisa e puoi ascoltare il brano senza basso. La prima volta scarica un modello di 174 MB; un brano richiede qualche minuto.',
      isolateTitle: 'Isola il basso', isolateStart: 'Isola il basso',
      isolateExisting: 'Isola il basso (AI)',
      isolateExistingHint: 'Per ascoltare il brano senza basso o il basso da solo.',
      retranscribe: 'Ritrascrivi dal basso isolato',
      retranscribeHint: 'Sostituisce le note attuali, comprese le correzioni fatte a mano.',
      retranscribeTitle: 'Ritrascrivi la linea di basso', retranscribeStart: 'Ritrascrivi',
      retranscribeTrack: 'Ritrascrivi le note', retranscribeTrackHint: 'Rilegge le note dal brano, con la sensibilità che scegli. Sostituisce le correzioni fatte a mano.',
      findingBeat: 'Cerco il tempo e le battute…', bars: 'Battute',
      barEarlier: '◀ Battuta', barLater: 'Battuta ▶', tempoHalf: 'Tempo ÷2', tempoDouble: 'Tempo ×2',
      barsHint: 'Se le stanghette cadono nel punto sbagliato, spostale di un beat; se i valori sembrano il doppio o la metà, cambia il tempo; se tutto cade tra un beat e l’altro, +½.',
      offBeat: '+½ beat', thisBar: 'Questa battuta', barFewer: '− un beat', barMore: '+ un beat', bar: 'battuta',
      key: 'Tonalità', keyOriginal: 'originale', keyReset: 'Originale', semitone: 'semitono', semitonesMany: 'semitoni',
      changingKey: 'Cambio la tonalità…', keyFailed: 'Non sono riuscito a cambiare tonalità su questo dispositivo.',
      countIn: 'Conta una battuta prima di partire', metronome: 'Metronomo sul brano',
      chords: 'Accordi e sezioni', chordHere: 'Accordo qui', chordKind: 'Cambia tipo', chordAdd: 'Nuovo da qui',
      chordRemove: 'Togli accordo', chordsRead: 'Rileggi tutti', noChord: 'nessuno',
      chordsHint: 'Gli accordi sono una stima letta dal brano senza il basso: correggili qui. Per leggerli serve il basso isolato.',
      readingChords: 'Leggo gli accordi…', chordsDone: 'Accordi letti', chordsFailed: 'Non sono riuscito a leggere gli accordi.',
      sections: 'Sezione', sectionAdd: 'Inizia qui', sectionKind: 'Cambia nome', sectionLoop: 'Ripeti', sectionRemove: 'Togli',
      noSection: 'nessuna', fromBar: 'da battuta',
      kind_intro: 'Intro', kind_verse: 'Strofa', kind_prechorus: 'Pre-ritornello', kind_chorus: 'Ritornello',
      kind_bridge: 'Ponte', kind_solo: 'Solo', kind_outro: 'Finale',
      exportPdf: 'Scarica PDF', exportXml: 'Scarica MusicXML',
      modelDownload: 'Scarico il modello', modelStart: 'Avvio del modello…', separating: 'Separazione del basso',
      encoding: 'Preparo le tracce da ascoltare…',
      separationFailed: 'Non sono riuscito a isolare il basso su questo dispositivo.',
      separationSkipped: 'Basso non isolato: trascritto dal brano intero',
      listen: 'Ascolto', listenMix: 'Brano', listenBacking: 'Senza basso', listenBass: 'Solo basso',
      keys: 'Spazio: play/pausa · frecce: nota precedente/successiva · [ A · ] B',
      audioMissing: 'L’audio salvato non è più disponibile, ma la trascrizione è rimasta.',
      migrated: 'Ottave e posizioni riallineate', version: `Versione ${Core.VERSION}`
    },
    en: {
      product: 'Bass Transcriber', sister: 'Bass Chord Lab: chords on the fretboard', import: 'Import audio', eyebrow: 'From the track to your fingers',
      library: 'Back to your tracks', trackTitle: 'Track title', transcribedNotes: 'Tablature with bars and note values: scrolls in time with the track', fretboard: 'Bass fretboard',
      positionLabel: 'Position in the track', help: 'Help', source: 'Source on GitHub',
      heroTitle: 'Listen. Transcribe. Play.',
      heroText: 'Import a recording, extract the bass line and practise it on the fretboard. Audio, transcription and corrections stay on your device.',
      privacy: 'No upload. Everything happens in your browser.', dropTitle: 'Drop your tracks here',
      dropText: 'One, many or a folder: MP3, WAV, M4A, AAC, OGG or FLAC', choose: 'Choose files', chooseFolder: 'Choose a folder',
      analyseManyTitle: 'Transcribe {n} tracks', startMany: 'Transcribe {n} tracks', andOthers: 'and {n} more',
      analyseManyHint: 'They are transcribed one after the other with these choices, and saved on the device. You can leave the page open and do something else.',
      manyKnown: 'Already saved, to be skipped: {n}.',
      outcomeReady: 'tracks ready', outcomeReadyOne: 'track ready', outcomeKnown: 'already saved', outcomeFailed: 'did not work',
      outcomeStopped: 'stopped before the end', noAudioFiles: 'No audio files were found there.',
      reasonNoNotes: 'no notes found', reasonNoBass: 'no bass found', reasonFailed: 'cannot be read',
      yourTracks: 'Your tracks', yourTracksHint: 'Reopen a transcription and continue where you left off.',
      examples: 'Included pieces', examplesHint: 'Five pieces played by the program, with bass, drums and chords: to try everything without importing anything.',
      loadingPiece: 'Loading the recording…',
      empty: 'You have not imported a track yet.', open: 'Open', remove: 'Delete',
      confirmDelete: 'Delete this track and its stored audio?', notes: 'notes', storage: 'Local storage',
      unavailable: 'unavailable', saved: 'Saved on device', demo: 'Included piece',
      previous: 'previous', current: 'now', upcoming: 'coming next', now: 'Now',
      playAlong: 'Play along', micStart: 'Start microphone', micStop: 'Stop microphone',
      micReady: 'Use headphones to keep the track out of the microphone.', micListening: 'Listening… play the highlighted note.',
      micDenied: 'Microphone unavailable or permission denied.', detected: 'Detected', score: 'Score',
      onTime: 'on time', early: 'early', late: 'late', wrong: 'wrong note',
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
      noBass: 'No bass was found in this recording: it may be a backing track to play over.',
      reread: 'Notes read again with the new reader',
      persistentYes: 'persistent storage', persistentNo: 'the browser may reclaim storage automatically',
      importedLine: 'Transcribed bass line', isolatedLine: 'Transcribed from the isolated bass',
      isolate: 'Isolate the bass with AI (recommended)',
      isolateHint: 'Separates the bass from the rest of the track, here in the browser: the transcription is far more accurate and you can listen to the track without bass. The first time it downloads a 174 MB model; a track takes a few minutes.',
      isolateTitle: 'Isolate the bass', isolateStart: 'Isolate the bass',
      isolateExisting: 'Isolate the bass (AI)',
      isolateExistingHint: 'To listen to the track without bass, or to the bass alone.',
      retranscribe: 'Transcribe again from the isolated bass',
      retranscribeHint: 'Replaces the current notes, including corrections made by hand.',
      retranscribeTitle: 'Transcribe the bass line again', retranscribeStart: 'Transcribe again',
      retranscribeTrack: 'Transcribe the notes again', retranscribeTrackHint: 'Reads the notes from the track again, with the sensitivity you choose. Replaces corrections made by hand.',
      findingBeat: 'Finding the tempo and the bars…', bars: 'Bars',
      barEarlier: '◀ Bar line', barLater: 'Bar line ▶', tempoHalf: 'Tempo ÷2', tempoDouble: 'Tempo ×2',
      barsHint: 'If the bar lines fall in the wrong place, move them by a beat; if the note values look doubled or halved, change the tempo; if everything falls between the beats, +½.',
      offBeat: '+½ beat', thisBar: 'This bar', barFewer: '− one beat', barMore: '+ one beat', bar: 'bar',
      key: 'Key', keyOriginal: 'original', keyReset: 'Original', semitone: 'semitone', semitonesMany: 'semitones',
      changingKey: 'Changing the key…', keyFailed: 'The key could not be changed on this device.',
      countIn: 'Count one bar in before starting', metronome: 'Metronome over the track',
      chords: 'Chords and sections', chordHere: 'Chord here', chordKind: 'Change kind', chordAdd: 'New from here',
      chordRemove: 'Remove chord', chordsRead: 'Read all again', noChord: 'none',
      chordsHint: 'The chords are an estimate read from the track without its bass: correct them here. Reading them needs the isolated bass.',
      readingChords: 'Reading the chords…', chordsDone: 'Chords read', chordsFailed: 'The chords could not be read.',
      sections: 'Section', sectionAdd: 'Start here', sectionKind: 'Rename', sectionLoop: 'Repeat', sectionRemove: 'Remove',
      noSection: 'none', fromBar: 'from bar',
      kind_intro: 'Intro', kind_verse: 'Verse', kind_prechorus: 'Pre-chorus', kind_chorus: 'Chorus',
      kind_bridge: 'Bridge', kind_solo: 'Solo', kind_outro: 'Outro',
      exportPdf: 'Download PDF', exportXml: 'Download MusicXML',
      modelDownload: 'Downloading the model', modelStart: 'Starting the model…', separating: 'Separating the bass',
      encoding: 'Preparing the tracks to listen to…',
      separationFailed: 'The bass could not be isolated on this device.',
      separationSkipped: 'Bass not isolated: transcribed from the full track',
      listen: 'Listen to', listenMix: 'Track', listenBacking: 'No bass', listenBass: 'Bass only',
      keys: 'Space: play/pause · arrows: previous/next note · [ A · ] B',
      audioMissing: 'The stored audio is no longer available, but the transcription remains.',
      migrated: 'Octaves and positions realigned', version: `Version ${Core.VERSION}`
    }
  };

  const state = {
    lang: 'it', tracks: [], track: null, currentIndex: 0, pendingFile: null,
    cancelled: false, audioUrl: null, playing: false, animation: 0,
    demoTimer: 0, demoClock: 0, saveTimer: 0, persistent: false, synth: null, mic: null,
    separable: false, job: null, pendingTrack: null, pendingFiles: null, pendingMode: 'import', listen: 'mix', switching: false,
    // how many times shorter than the track the audio being played is: not 1 when the key was changed
    stretch: 1, loading: 0, keyCache: null, counting: false, countTimer: 0, priming: false,
    nextClick: null, clickedAt: 0, origin: 0, where: '', countIn: false, metronome: false
  };

  const SECTION_KINDS = ['intro', 'verse', 'prechorus', 'chorus', 'bridge', 'solo', 'outro'];
  /** An exercise with no recording: its notes are played one by one, on a clock of its own. */
  const synthetic = track => Boolean(track?.demo && !track.audioBlob);

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
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
      if (element.hasAttribute('title')) element.title = t(element.dataset.i18nAria);
    });
    $('langIt').classList.toggle('on', state.lang === 'it');
    $('langEn').classList.toggle('on', state.lang === 'en');
    $('helpLink').href = state.lang === 'en' ? 'help-en.html' : 'help-it.html';
    $('helpLink').title = t('help');
    $('helpLink').setAttribute('aria-label', $('helpLink').title);
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
    cover.textContent = track.demo
      ? track.style.slice(0, 2).toUpperCase()
      : (track.filename || '').match(/\.([a-z0-9]{2,4})$/i)?.[1].toUpperCase() || 'AUDIO';
    const info = document.createElement('div');
    const title = document.createElement('h3');
    const meta = document.createElement('div');
    title.textContent = track.title;
    meta.className = 'meta';
    meta.textContent = `${track.events?.length || 0} ${t('notes')} · ${Core.formatTime(track.duration)}${track.demo ? ` · ${Math.round(track.bpm)} BPM` : ''}`;
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
    stopMicrophone(true);
    cancelAnimationFrame(state.animation);
    clearTimeout(state.demoTimer);
    clearTimeout(state.countTimer);
    state.counting = false;
    state.loading += 1;
    state.stretch = 1;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = null;
    state.playing = false;
  }

  /** The audio for a listening mode: the track as imported, without its bass, or the bass alone. */
  function listenBlob(mode) {
    const track = state.track;
    if (mode === 'backing') return track.stems?.backing || null;
    if (mode === 'bass') return track.stems?.bass || null;
    return track.audioBlob || null;
  }

  const shiftOf = track => (track?.audioBlob ? Core.clamp(Math.round(track.transpose || 0), -Pitch.RANGE, Pitch.RANGE) : 0);

  /**
   * A recording in another key: made shorter or longer once, then played slower or faster by
   * as much. The last one made is kept, since going back and forth between two ways of
   * listening is common and making it takes a moment.
   */
  async function inKey(track, mode, blob, semitones) {
    const key = `${track.id}|${mode}|${semitones}`;
    if (state.keyCache?.key === key) return state.keyCache.blob;
    const buffer = await Transcriber.decode(blob);
    const factor = Pitch.factorOf(semitones);
    const channels = [];
    for (let channel = 0; channel < Math.min(2, buffer.numberOfChannels); channel += 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
      channels.push(Pitch.repitch(buffer.getChannelData(channel), factor));
    }
    const made = new Blob([Pitch.wavOf(channels, buffer.sampleRate)], { type: 'audio/wav' });
    state.keyCache = { key, blob: made };
    return made;
  }

  /** Points the player at one of the three recordings, keeping the place, the speed and whether it was playing. */
  async function loadAudio(mode, time = 0, play = false) {
    const track = state.track;
    const wanted = listenBlob(mode) ? mode : 'mix';
    let blob = listenBlob(wanted);
    state.listen = wanted;
    if (!blob) return;
    const token = ++state.loading;
    const semitones = shiftOf(track);
    let stretch = 1;
    if (semitones) {
      state.switching = play;
      audio.pause();
      $('savedLabel').textContent = t('changingKey');
      try {
        blob = await inKey(track, wanted, blob, semitones);
        stretch = Pitch.factorOf(semitones);
      } catch (error) {
        console.warn('Manico: the key could not be changed', error);
      }
      if (token !== state.loading || state.track !== track) return;
      $('savedLabel').textContent = t(stretch === 1 ? 'keyFailed' : track.demo ? 'demo' : 'saved');
    }
    state.stretch = stretch;
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(blob);
    state.switching = play;
    audio.src = state.audioUrl;
    audio.preload = play || time ? 'auto' : 'metadata';
    setAudioSpeed(track.settings.speed || 1);
    if (time) audio.currentTime = time / stretch;
    state.nextClick = null;
    if (play) {
      audio.play()
        .catch(() => { state.playing = false; })
        .finally(() => { state.switching = false; renderStudio(false); });
    } else {
      state.switching = false;
      if (state.playing) { state.playing = false; renderStudio(false); }
    }
  }

  function setListen(mode) {
    if (!state.track || synthetic(state.track) || mode === state.listen || !listenBlob(mode)) return;
    state.track.settings.listen = mode;
    loadAudio(mode, currentTime(), state.playing);
    scheduleSave();
    renderStudio(false);
  }

  /** Moves the piece by semitones, or back to where it was recorded with 0: the notes, the chords and what is heard. */
  function moveKey(delta) {
    const track = state.track;
    if (!track?.audioBlob) return;
    const from = shiftOf(track);
    const to = delta === 0 ? 0 : Core.clamp(from + delta, -Pitch.RANGE, Pitch.RANGE);
    if (to === from) return;
    const time = currentTime();
    const playing = state.playing && !state.counting;
    cancelCount();
    const open = tuning().open;
    const id = selected()?.id;
    track.events = Core.optimiseFingering(Pitch.shiftEvents(track.events, to - from, open, track.settings.frets), open, track.settings.frets);
    if (track.chords) track.chords = Pitch.shiftChords(track.chords, to - from);
    track.transpose = to;
    const index = track.events.findIndex(event => event.id === id);
    if (index >= 0) state.currentIndex = index;
    scheduleSave();
    renderStudio(true);
    loadAudio(state.listen, time, playing);
  }

  // The recordings of the pieces that come with the app, once fetched: the piece whole, without its bass, the bass alone.
  const pieceAudio = new Map();

  /**
   * Gives a piece that comes with the app its recording. Until it has arrived, or where it
   * cannot be fetched (the app opened from a single file, with no network), the notes are
   * played one by one as they always were.
   */
  async function loadPiece(track) {
    if (location.protocol === 'file:') return; // the app in a single file: there is nothing beside it to fetch
    try {
      let made = pieceAudio.get(track.id);
      if (!made) {
        $('savedLabel').textContent = t('loadingPiece');
        const fetched = async name => {
          const response = await fetch(`assets/pieces/${track.id}-${name}.mp3`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return Transcriber.decode(await response.blob());
        };
        const [backing, bass] = await Promise.all([fetched('backing'), fetched('bass')]);
        const frames = Math.min(backing.length, bass.length);
        const low = bass.getChannelData(0).subarray(0, frames);
        const rest = [0, 1].map(channel => backing.getChannelData(Math.min(channel, backing.numberOfChannels - 1)).subarray(0, frames));
        const mix = rest.map(channel => { const sum = new Float32Array(frames); for (let i = 0; i < frames; i += 1) sum[i] = channel[i] + low[i]; return sum; });
        let peak = 0;
        for (const channel of mix) for (let i = 0; i < frames; i += 1) peak = Math.max(peak, Math.abs(channel[i]));
        if (peak > 0.98) for (const channel of mix) for (let i = 0; i < frames; i += 1) channel[i] *= 0.98 / peak;
        const wav = channels => new Blob([Pitch.wavOf(channels, backing.sampleRate)], { type: 'audio/wav' });
        made = { mix: wav(mix), backing: wav(rest), bass: wav([low]) };
        pieceAudio.set(track.id, made);
      }
      if (state.track !== track) return;
      const time = state.demoClock;
      clearTimeout(state.demoTimer);
      state.playing = false;
      track.audioBlob = made.mix;
      track.stems = { backing: made.backing, bass: made.bass };
      await loadAudio('mix', time);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the recording of the piece could not be fetched', error);
      if (state.track === track) $('savedLabel').textContent = t('demo');
    }
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
    if (demo) track.rhythm = Rhythm.steady(track.bpm, track.duration, track.beats || 4);
    state.track = track;
    state.currentIndex = 0;
    state.demoClock = 0;
    state.listen = 'mix';
    state.nextClick = null;
    if (track.audioBlob) loadAudio(track.settings.listen || 'mix');
    show('studio');
    renderStudio(true);
    startAnimation();
    // one after the other: the notes are read against the pulse, the chords against both
    ensureRhythm(track).then(() => ensureReader(track)).then(() => ensureChords(track));
    if (demo) loadPiece(track);
    if (migrated) {
      $('savedLabel').textContent = t('migrated');
      scheduleSave();
    }
  }

  /**
   * A track whose bass was isolated and read by an earlier reader is read again, from that bass,
   * the first time it is opened. One with notes corrected by hand is left as it is: what a
   * person wrote is not read over.
   */
  async function ensureReader(track) {
    if (track.demo || !track.stems?.bass || !track.audioBlob || Number(track.analysisVersion || 0) >= READER) return;
    if ((track.events || []).some(event => event.edited)) return;
    try {
      const open = (Core.TUNINGS[track.settings.tuning] || Core.TUNINGS['4']).open;
      const events = await Transcriber.transcribe(await Transcriber.decode(track.stems.bass), {
        isolated: true,
        mix: await Transcriber.decode(track.audioBlob),
        lowest: open[0]
      });
      if (!events.length || (track.events || []).some(event => event.edited)) return;
      const moved = track.transpose ? Pitch.shiftEvents(events, track.transpose, open, track.settings.frets) : events;
      track.events = Core.optimiseFingering(moved, open, track.settings.frets);
      track.analysisVersion = READER;
      track.source = 'bass';
      await Store.save(track);
      if (state.track === track) {
        state.currentIndex = 0;
        renderStudio(true);
        $('savedLabel').textContent = t('reread');
      }
    } catch (error) {
      console.warn('Manico: the notes could not be read again', error);
    }
  }

  /** A track imported before bars existed gets its pulse the first time it is opened. */
  async function ensureRhythm(track) {
    if (track.demo || track.rhythm || !track.audioBlob) return;
    try {
      const rhythm = Rhythm.analyse(await Transcriber.decode(track.audioBlob));
      if (!rhythm || track.rhythm) return;
      track.rhythm = rhythm;
      await Store.save(track);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the beat could not be found', error);
    }
  }

  /**
   * Reads the chords of a track from what is left of it without the bass. With `firstBeat` the
   * harmony is also asked where the bars start, which it knows better than the drums do.
   */
  async function readChords(track, firstBeat = false) {
    if (!track.stems?.backing || !track.rhythm) return false;
    const backing = await Transcriber.decode(track.stems.backing);
    const frames = Chords.chroma(backing);
    const shift = track.transpose || 0;
    // the line as it sounds in the recording, whatever key it is being read in now
    const bass = shift ? track.events.map(event => ({ ...event, midi: event.midi - shift })) : track.events;
    if (firstBeat) track.rhythm = { ...track.rhythm, downbeat: Chords.firstBeat(backing, track.rhythm, bass, frames) };
    track.chords = Pitch.shiftChords(Chords.find(backing, track.rhythm, bass, frames), shift);
    return true;
  }

  /** A track separated before chords existed gets them the first time it is opened. */
  async function ensureChords(track) {
    if (track.demo || track.chords || !track.stems?.backing || !track.rhythm) return;
    try {
      if (!await readChords(track, false)) return;
      await Store.save(track);
      if (state.track === track) renderStudio(true);
    } catch (error) {
      console.warn('Manico: the chords could not be read', error);
    }
  }

  async function rereadChords() {
    const track = state.track;
    if (!track?.stems?.backing || !track.rhythm) return;
    $('savedLabel').textContent = t('readingChords');
    await new Promise(resolve => setTimeout(resolve, 30));
    try {
      await readChords(track, false);
      if (state.track !== track) return;
      scheduleSave();
      renderStudio(true);
      $('savedLabel').textContent = t('chordsDone');
    } catch (error) {
      console.warn('Manico: the chords could not be read', error);
      $('savedLabel').textContent = t('chordsFailed');
    }
  }

  /** Where the playhead is on the page: the bar, and the place in beats from the first bar line. */
  function place(track = state.track) {
    const score = scoreOf(track);
    const beats = Rhythm.positionOf(score.rhythm, currentTime() + 0.01) - score.shift + 1e-6;
    return { score, beats, bar: Rhythm.barAt(score.rhythm, beats) };
  }

  /** The moment a place on the page is heard. */
  const momentOf = (score, beats) => Core.clamp(Rhythm.timeOf(score.rhythm, beats + score.shift), 0, state.track.duration || Infinity);

  const chordIndex = () => Chords.indexAt(state.track?.chords, currentTime() + 0.005);

  function changed() {
    scheduleSave();
    renderStudio(true);
  }

  /** Corrections to the chord under the playhead: its root, its kind, or away with it. */
  function editChord(change) {
    const track = state.track;
    if (!track) return;
    const chords = (track.chords || []).map(chord => ({ ...chord }));
    const index = Chords.indexAt(chords, currentTime() + 0.005);
    if (change === 'add') {
      const { score, beats } = place(track);
      const start = Math.round(momentOf(score, Math.floor(beats)) * 1000) / 1000;
      const over = Chords.indexAt(chords, start + 0.005);
      const sounding = track.events.find(event => event.start <= start + 0.06 && event.end > start + 0.06);
      if (over >= 0) {
        const old = chords[over];
        if (start - old.start < 0.05) return;
        chords.splice(over + 1, 0, { start, end: old.end, root: sounding ? ((sounding.midi % 12) + 12) % 12 : old.root, quality: sounding ? '' : old.quality });
        old.end = start;
      } else {
        const next = chords.find(chord => chord.start > start);
        const barEnd = momentOf(score, Rhythm.barStart(score.rhythm, Rhythm.barAt(score.rhythm, beats) + 1));
        const end = Math.min(next ? next.start : Infinity, Math.max(barEnd, start + 0.2));
        chords.push({ start, end, root: sounding ? ((sounding.midi % 12) + 12) % 12 : 0, quality: '' });
        chords.sort((left, right) => left.start - right.start);
      }
    } else {
      if (index < 0) return;
      const chord = chords[index];
      if (change === 'up' || change === 'down') chord.root = (chord.root + (change === 'up' ? 1 : 11)) % 12;
      else if (change === 'kind') chord.quality = Chords.QUALITIES[(Chords.QUALITIES.indexOf(chord.quality) + 1) % Chords.QUALITIES.length];
      else if (change === 'remove') {
        // the chord before carries on over the gap
        if (index > 0 && Math.abs(chords[index - 1].end - chord.start) < 0.05) chords[index - 1].end = chord.end;
        chords.splice(index, 1);
      }
    }
    track.chords = chords;
    changed();
  }

  /** The section the playhead is in, as its place in the list; -1 before the first. */
  function sectionIndex(track = state.track) {
    const sections = track?.sections || [];
    const time = currentTime() + 0.02;
    let found = -1;
    sections.forEach((section, index) => { if (section.start <= time) found = index; });
    return found;
  }

  function editSection(change) {
    const track = state.track;
    if (!track) return;
    const sections = (track.sections || []).map(section => ({ ...section }));
    const index = sectionIndex(track);
    if (change === 'add') {
      const { score, bar } = place(track);
      const start = Math.round(momentOf(score, Rhythm.barStart(score.rhythm, Math.max(bar, score.firstBar))) * 1000) / 1000;
      if (sections.some(section => Math.abs(section.start - start) < 0.05)) return;
      const before = index >= 0 ? sections[index].kind : null;
      const kind = before === null ? (sections.length ? 'verse' : 'intro') : SECTION_KINDS[(SECTION_KINDS.indexOf(before) + 1) % SECTION_KINDS.length];
      sections.push({ start, kind });
      sections.sort((left, right) => left.start - right.start);
    } else {
      if (index < 0) return;
      if (change === 'kind') sections[index].kind = SECTION_KINDS[(SECTION_KINDS.indexOf(sections[index].kind) + 1) % SECTION_KINDS.length];
      else if (change === 'remove') sections.splice(index, 1);
      else if (change === 'loop') {
        const end = index + 1 < sections.length ? sections[index + 1].start : (track.duration || 0);
        if (end - sections[index].start < 0.15) return;
        track.settings.loopA = sections[index].start;
        track.settings.loopB = end;
        setTime(sections[index].start);
      }
    }
    track.sections = sections;
    changed();
  }

  /** The track as it goes on paper: its sections called by name, in the language of the page. */
  const printable = track => ({ ...track, sections: (track.sections || []).map(section => ({ ...section, name: t(`kind_${section.kind}`) })) });

  /** Corrections to the pulse that only a listener can make: where the bar starts, the level of the beat, the meter. */
  function adjustRhythm(change) {
    const track = state.track;
    if (!track) return;
    let rhythm = { ...rhythmOf(track) };
    if (change === 'earlier') rhythm.downbeat = (rhythm.downbeat + rhythm.perBar - 1) % rhythm.perBar;
    else if (change === 'later') rhythm.downbeat = (rhythm.downbeat + 1) % rhythm.perBar;
    else if (change === 'half' || change === 'double') Object.assign(rhythm, Rhythm.rescale(rhythm, change === 'double' ? 2 : 0.5));
    else if (change === 'meter') { rhythm.perBar = rhythm.perBar === 4 ? 3 : 4; rhythm.downbeat %= rhythm.perBar; rhythm.odd = []; }
    else if (change === 'offbeat') rhythm = Rhythm.halfway(rhythm);
    else if (change === 'fewer' || change === 'more') {
      // this bar alone is given a length of its own; every bar line after it moves
      const { bar } = place(track);
      if (bar < 0) return;
      const beats = Core.clamp(Rhythm.beatsIn(rhythm, bar) + (change === 'more' ? 1 : -1), 1, 12);
      rhythm = Rhythm.setBeatsIn(rhythm, bar, beats);
    }
    if (rhythm.beats.length < 4) return;
    if (track.demo) track.fallbackRhythm = rhythm;
    if (!track.demo || track.rhythm) { track.rhythm = rhythm; scheduleSave(); }
    state.nextClick = null;
    renderStudio(true);
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
    return synthetic(state.track) ? state.demoClock : (audio.currentTime || 0) * state.stretch;
  }

  function setTime(value) {
    if (!state.track) return;
    const time = Core.clamp(value, 0, state.track.duration || 0);
    if (synthetic(state.track)) {
      state.demoClock = time;
      state.currentIndex = Core.currentEventIndex(state.track.events, time, state.currentIndex);
      if (state.playing) scheduleDemo();
    } else {
      audio.currentTime = time / state.stretch;
    }
    state.nextClick = null;
    updatePlayback(true);
  }

  const selected = () => state.track?.events?.[state.currentIndex] || null;
  const preview = () => Core.previewWindow(state.track?.events || [], state.currentIndex, state.track?.settings?.lookahead || 3);

  function selectEvent(index, seek = true) {
    if (!state.track?.events?.length) return;
    state.currentIndex = Core.clamp(index, 0, state.track.events.length - 1);
    if (seek) setTime(state.track.events[state.currentIndex].start);
    renderStudio(true);
  }

  // The tablature above the fretboard, written as tablature is: a line per string with the
  // highest on top, fret numbers, bar lines, and under the staff the stems, beams and flags
  // that say how long each note lasts. A held note is written once; where it runs on into the
  // next beat or bar it is tied, never repeated. The sheet slides under a playhead that stays put.
  const TAB = { row: 22, top: 30, label: 34, stem: 30, score: null, key: '' };
  const CHORD_ROW = 20; // room above the bar numbers, taken only when there are chords to write
  const Rhythm = root.ManicoRhythm;

  /** The pulse of the open track: found in the recording, known for an exercise, or a plain guess until then. */
  function rhythmOf(track) {
    if (track.rhythm?.beats?.length >= 2) return track.rhythm;
    if (!track.fallbackRhythm) track.fallbackRhythm = Rhythm.steady(track.bpm || 120, track.duration || 60);
    return track.fallbackRhythm;
  }

  /** The written music for the open track, worked out again only when its notes or its pulse change. */
  function scoreOf(track) {
    const rhythm = rhythmOf(track);
    let sum = 0;
    for (const event of track.events) sum += event.start + event.end * 3;
    const odd = (rhythm.odd || []).map(item => `${item.bar}:${item.beats}`).join(',');
    const key = [track.id, track.events.length, sum.toFixed(3), rhythm.beats.length, rhythm.beats[0], rhythm.beats[1], rhythm.downbeat, rhythm.perBar, odd].join('|');
    if (TAB.key === key) return TAB.score;
    const { bars, barSlots, placed } = Rhythm.notate(rhythm, track.events);
    const symbols = [];
    const lastPiece = new Map();
    let fast = 0;
    [...bars.keys()].sort((left, right) => left - right).forEach(bar => {
      for (const piece of bars.get(bar)) {
        const symbol = { ...piece, bar, position: piece.at / Rhythm.DIVISION };
        if (symbol.tied) symbol.from = lastPiece.get(symbol.index);
        if (!symbol.rest) lastPiece.set(symbol.index, symbol.position);
        if (!symbol.rest && (symbol.value === 1 || symbol.slot % 2)) fast += 1;
        symbols.push(symbol);
      }
    });
    TAB.key = key;
    TAB.score = {
      rhythm, symbols, barSlots,
      shift: Rhythm.calibrate(rhythm, track.events),
      // Sixteenths need more room than eighths to stay readable.
      beatWidth: fast > placed.length * 0.05 ? 104 : 72,
      firstBar: bars.size ? Math.min(...bars.keys()) : 0,
      lastBar: bars.size ? Math.max(...bars.keys()) : 0
    };
    return TAB.score;
  }

  function tabLayout() {
    const canvas = $('tabStrip');
    const strings = tuning().open.length;
    const width = canvas.clientWidth || 600;
    const score = scoreOf(state.track);
    TAB.top = 30 + (state.track.chords?.length ? CHORD_ROW : 0);
    const staffBottom = TAB.top + (strings - 1) * TAB.row;
    return {
      canvas, strings, width, score, staffBottom,
      height: staffBottom + TAB.stem + 26,
      beatWidth: score.beatWidth * (width < 520 ? 0.8 : 1),
      playhead: Math.max(TAB.label + 50, Math.round(width * 0.25)),
      now: Rhythm.positionOf(score.rhythm, currentTime()) - score.shift,
      // The highest string is the top line, as on paper.
      y: string => TAB.top + (strings - 1 - string) * TAB.row
    };
  }

  function drawRest(context, value, x, layout) {
    const middle = (TAB.top + layout.staffBottom) / 2;
    context.lineWidth = 1.6;
    if (value >= 8) {
      // Whole and half rests: a block hanging from a line, or sitting on it.
      const line = layout.y(Math.min(layout.strings - 1, Math.ceil(layout.strings / 2)));
      context.fillRect(x - 6, value >= 16 ? line : line - 5, 12, 5);
    } else if (value >= 4) {
      context.beginPath();
      context.moveTo(x - 3, middle - 11);
      context.lineTo(x + 3, middle - 4);
      context.lineTo(x - 3, middle + 1);
      context.lineTo(x + 3, middle + 7);
      context.quadraticCurveTo(x - 5, middle + 5, x - 1, middle + 12);
      context.stroke();
    } else {
      const flags = value >= 2 ? 1 : 2;
      context.beginPath();
      context.moveTo(x + 4, middle - 8);
      context.lineTo(x - 2, middle + 9);
      context.stroke();
      for (let flag = 0; flag < flags; flag += 1) {
        context.beginPath();
        context.arc(x - 3 - flag, middle - 6 + flag * 6, 2.2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(x - 2 - flag, middle - 5 + flag * 6);
        context.lineTo(x + 3.5 - flag * 2, middle - 7 + flag * 6);
        context.stroke();
      }
    }
  }

  /** Stems, beams, flags and dots under the staff for the notes of one beat. */
  function drawRhythm(context, group, layout, x) {
    const top = layout.staffBottom + 12;
    const bottom = layout.staffBottom + TAB.stem;
    const beamed = group.length > 1 && group.every(symbol => symbol.value <= 3);
    context.lineWidth = 1.4;
    group.forEach((symbol, order) => {
      const at = Math.round(x(symbol.position)) + 0.5;
      if (symbol.value < 16) {
        context.beginPath();
        context.moveTo(at, symbol.value >= 8 ? bottom - 9 : top);
        context.lineTo(at, bottom);
        context.stroke();
      }
      if (symbol.value % 3 === 0) {
        context.beginPath();
        context.arc(at + 5, bottom - 4, 1.5, 0, Math.PI * 2);
        context.fill();
      }
      if (symbol.value > 3) return;
      const flags = symbol.value === 1 ? 2 : 1;
      if (!beamed) {
        for (let flag = 0; flag < flags; flag += 1) {
          context.beginPath();
          context.moveTo(at, bottom - flag * 5);
          context.quadraticCurveTo(at + 7, bottom - 3 - flag * 5, at + 7, bottom - 10 - flag * 5);
          context.stroke();
        }
        return;
      }
      // A sixteenth shares its second beam with a neighbouring sixteenth, or carries a stub towards its neighbour.
      if (symbol.value === 1) {
        const next = group[order + 1];
        const previous = group[order - 1];
        context.lineWidth = 3;
        context.beginPath();
        if (next && next.value === 1) { context.moveTo(at, bottom - 6); context.lineTo(Math.round(x(next.position)) + 0.5, bottom - 6); }
        else if (!(previous && previous.value === 1)) { context.moveTo(at, bottom - 6); context.lineTo(at + (previous ? -7 : 7), bottom - 6); }
        context.stroke();
        context.lineWidth = 1.4;
      }
    });
    if (beamed) {
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(Math.round(x(group[0].position)) + 0.5, bottom);
      context.lineTo(Math.round(x(group.at(-1).position)) + 0.5, bottom);
      context.stroke();
    }
  }

  function renderTimeline() {
    if (!state.track) return;
    const layout = tabLayout();
    const { canvas, strings, width, height, playhead, score, now, beatWidth, staffBottom } = layout;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.height = `${height}px`;
    }
    const style = getComputedStyle(canvas);
    const color = name => style.getPropertyValue(name).trim();
    const mono = color('--mono') || 'monospace';
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    const events = state.track.events;
    const perBar = score.rhythm.perBar;
    const x = position => playhead + (position - now) * beatWidth;
    const from = now - (playhead + 60) / beatWidth;
    const to = now + (width - playhead + 60) / beatWidth;

    // Nothing of the sliding sheet is drawn under the string names.
    context.save();
    context.beginPath();
    context.rect(TAB.label, 0, width - TAB.label, height);
    context.clip();

    // The strings, then the bar lines with their numbers.
    context.lineWidth = 1;
    context.strokeStyle = color('--line-2');
    for (let string = 0; string < strings; string += 1) {
      context.beginPath();
      context.moveTo(0, layout.y(string) + 0.5);
      context.lineTo(width, layout.y(string) + 0.5);
      context.stroke();
    }
    context.font = `10px ${mono}`;
    const rhythm = score.rhythm;
    const time = currentTime();
    // the sections, by the bar each starts with
    const opening = new Map();
    for (const section of state.track.sections || []) {
      opening.set(Rhythm.barAt(rhythm, Rhythm.positionOf(rhythm, section.start + 0.01) - score.shift + 1e-6), t(`kind_${section.kind}`));
    }
    for (let bar = Math.max(score.firstBar, Rhythm.barAt(rhythm, from)); bar <= score.lastBar + 1; bar += 1) {
      const start = Rhythm.barStart(rhythm, bar);
      if (start > to) break;
      // The line sits a little before the first note of its bar, as it does in print.
      const line = Math.round(x(start) - beatWidth / Rhythm.DIVISION / 2 - 3) + 0.5;
      context.strokeStyle = color('--muted');
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(line, TAB.top);
      context.lineTo(line, staffBottom);
      context.stroke();
      if (bar >= 0 && bar <= score.lastBar) {
        const beats = Rhythm.beatsIn(rhythm, bar);
        context.textAlign = 'left';
        context.fillStyle = color('--faint');
        let label = String(bar + 1);
        if (beats !== perBar) label += ` · ${beats}/4`; // a bar of its own length says so
        context.fillText(label, line + 4, TAB.top - 14);
        if (opening.has(bar)) {
          const taken = context.measureText(label).width;
          context.fillStyle = color('--future');
          context.font = `700 10px ${mono}`;
          context.fillText(opening.get(bar).toUpperCase(), line + 10 + taken, TAB.top - 14);
          context.font = `10px ${mono}`;
        }
        context.textAlign = 'center';
      }
    }
    // The chords, over the beat each one starts on. The one sounding stays in sight until the next arrives.
    const chords = state.track.chords || [];
    if (chords.length) {
      context.textAlign = 'left';
      const sounding = Chords.indexAt(chords, time + 0.005);
      let free = -Infinity;
      for (let index = 0; index < chords.length; index += 1) {
        const chord = chords[index];
        let at = x(Rhythm.positionOf(rhythm, chord.start) - score.shift) - 4;
        if (at > width) break;
        const name = Chords.nameOf(chord);
        context.font = `${index === sounding ? 800 : 700} 13px ${mono}`;
        const wide = context.measureText(name).width;
        if (index === sounding) {
          const next = chords[index + 1] ? x(Rhythm.positionOf(rhythm, chords[index + 1].start) - score.shift) - 4 : Infinity;
          at = Math.max(at, Math.min(TAB.label + 6, next - wide - 8));
        }
        if (at + wide < TAB.label || at < free) continue;
        context.fillStyle = index === sounding ? color('--accent') : chord.end <= time ? color('--faint') : color('--paper');
        context.fillText(name, at, TAB.top - 14 - CHORD_ROW + 2);
        free = at + wide + 6;
      }
      context.textAlign = 'center';
      context.font = `10px ${mono}`;
    }
    // The playhead, behind the numbers.
    context.strokeStyle = color('--accent');
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(playhead, TAB.top - 8);
    context.lineTo(playhead, staffBottom + TAB.stem + 4);
    context.stroke();

    const symbols = score.symbols;
    let low = 0;
    let high = symbols.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (symbols[middle].position < from - perBar) low = middle + 1; else high = middle;
    }
    const upcoming = new Set(preview().upcoming.map(event => event.id));
    const current = selected();
    const toneOf = event => event === current ? color('--accent') : upcoming.has(event.id) ? color('--future')
      : event.end <= time ? color('--faint') : color('--paper');
    let group = [];
    let groupBeat = null;
    const flush = () => {
      if (!group.length) return;
      context.strokeStyle = context.fillStyle = color('--muted');
      drawRhythm(context, group, layout, x);
      group = [];
    };
    for (let index = low; index < symbols.length && symbols[index].position < to; index += 1) {
      const symbol = symbols[index];
      const at = x(symbol.position);
      const beat = Math.floor(symbol.position + 1e-6);
      if (symbol.rest) {
        flush();
        context.strokeStyle = context.fillStyle = color('--faint');
        // Long rests sit in the middle of the space they fill.
        drawRest(context, symbol.value, symbol.value >= 8 ? at + (symbol.value / Rhythm.DIVISION * beatWidth) / 2 - beatWidth / 8 : at, layout);
        continue;
      }
      if (beat !== groupBeat || symbol.value > 3) flush();
      groupBeat = beat;
      group.push(symbol);
      if (symbol.value > 3) flush();
      const event = events[symbol.index];
      if (!event) continue;
      const playable = event.string !== null && event.string !== undefined && event.string < strings;
      const row = playable ? layout.y(event.string) : TAB.top - 12;
      const tone = toneOf(event);
      if (symbol.tied) {
        // The same note still sounding: an arc from where it was last written, and in a new bar the fret again in brackets.
        const start = Math.max(x(symbol.from), TAB.label);
        context.strokeStyle = tone;
        context.globalAlpha = 0.7;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(start + 7, row + 9);
        context.quadraticCurveTo((start + at) / 2, row + 17, at - (symbol.barStart ? 9 : 2), row + 9);
        context.stroke();
        context.globalAlpha = 1;
        if (!symbol.barStart) continue;
      }
      const text = playable ? (symbol.tied ? `(${event.fret})` : String(event.fret)) : '?';
      context.font = `${event === current ? 800 : 700} ${symbol.tied ? 12 : event === current ? 17 : 15}px ${mono}`;
      const half = context.measureText(text).width / 2 + 2;
      context.fillStyle = color('--panel');
      context.fillRect(at - half, row - 9, half * 2, 18);
      context.fillStyle = tone;
      context.globalAlpha = symbol.tied ? 0.75 : 1;
      context.fillText(text, at, row + 1);
      context.globalAlpha = 1;
    }
    flush();
    context.restore();

    // String names stay at the left edge.
    context.font = `700 12px ${mono}`;
    context.fillStyle = color('--muted');
    for (let string = 0; string < strings; string += 1) context.fillText(stringName(string), TAB.label / 2 - 2, layout.y(string) + 1);
    context.strokeStyle = color('--muted');
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(TAB.label - 4.5, TAB.top);
    context.lineTo(TAB.label - 4.5, staffBottom);
    context.stroke();
  }

  /** A click on a number selects that note; a click elsewhere on the sheet moves the playhead there. */
  function clickTab(event) {
    if (!state.track) return;
    const layout = tabLayout();
    const bounds = layout.canvas.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const py = event.clientY - bounds.top;
    if (px < TAB.label) return;
    const events = state.track.events;
    const chords = state.track.chords || [];
    if (chords.length && py < TAB.top - 22) {
      // on the row of the chords: to the start of the one clicked
      const clicked = layout.now + (px + 4 - layout.playhead) / layout.beatWidth + layout.score.shift;
      const index = Chords.indexAt(chords, Rhythm.timeOf(layout.score.rhythm, clicked));
      if (index >= 0) { setTime(chords[index].start); return; }
    }
    let best = -1;
    let distance = 14;
    for (const symbol of layout.score.symbols) {
      if (symbol.rest || symbol.tied) continue;
      const item = events[symbol.index];
      if (!item) continue;
      const dx = Math.abs(layout.playhead + (symbol.position - layout.now) * layout.beatWidth - px);
      const onRow = item.string === null || item.string === undefined || Math.abs(layout.y(item.string) - py) <= TAB.row / 2;
      if (onRow && dx < distance) { best = symbol.index; distance = dx; }
    }
    if (best >= 0) selectEvent(best);
    else setTime(Rhythm.timeOf(layout.score.rhythm, layout.now + layout.score.shift + (px - layout.playhead) / layout.beatWidth));
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

  // The neck itself only depends on tuning and fret count, so it is drawn once per combination;
  // playback then rewrites just the markers on every note.
  const boardCache = { key: '', html: '' };

  function renderBoard(open, frets, geometry) {
    const key = `${open.join(',')}|${frets}`;
    if (boardCache.key === key) return boardCache.html;
    const strings = open.length;
    let html = `
      <defs>
        <linearGradient id="boardWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#efd7aa"/>
          <stop offset=".48" stop-color="#d9b77d"/>
          <stop offset="1" stop-color="#bd874f"/>
        </linearGradient>
        <linearGradient id="fretMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#5d5953"/>
          <stop offset=".42" stop-color="#f7f2e9"/>
          <stop offset="1" stop-color="#68625b"/>
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
    html += `<rect x="${geometry.outerLeft}" y="${geometry.rulerTop}" width="${outerWidth}" height="${geometry.boardBottom - geometry.rulerTop}" rx="14" fill="#f3eee6" stroke="#856b52" stroke-width="2.5"/>`;
    html += `<path d="M ${geometry.outerLeft + 14} ${geometry.rulerBottom} H ${geometry.outerRight - 14}" stroke="#c4ad8e" stroke-width="2"/>`;
    html += `<rect x="${geometry.outerLeft}" y="${geometry.boardTop}" width="${outerWidth}" height="${boardHeight}" fill="url(#boardWood)"/>`;
    html += `<line x1="${geometry.stringStart}" y1="${geometry.boardTop}" x2="${geometry.stringStart}" y2="${geometry.boardBottom}" stroke="#72563e" stroke-opacity=".58" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardTop}" x2="${geometry.outerRight}" y2="${geometry.boardTop}" stroke="#fff8ec" stroke-opacity=".7" stroke-width="2"/>`;
    html += `<line x1="${geometry.outerLeft}" y1="${geometry.boardBottom}" x2="${geometry.outerRight}" y2="${geometry.boardBottom}" stroke="#5f422d" stroke-opacity=".72" stroke-width="3"/>`;

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
        html += `<circle cx="${x}" cy="${y - 29}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
        html += `<circle cx="${x}" cy="${y + 29}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
      } else {
        html += `<circle cx="${x}" cy="${y}" r="7.5" fill="#7d5d38" opacity=".55"/>`;
      }
    });

    open.forEach((openMidi, string) => {
      const y = geometry.stringY(string);
      const thickness = 1.7 + (strings - string) * 0.72;
      html += `<text x="${geometry.stringStart - 23}" y="${y + 7}" text-anchor="end" class="string-label" fill="#3a3026">${Core.noteName(openMidi).replace(/-?\d+$/, '')}</text>`;
      html += `<line x1="${geometry.stringStart}" y1="${y + 2}" x2="${geometry.bridge}" y2="${y + 2}" stroke="#4e4033" stroke-opacity=".44" stroke-width="${thickness + 2.2}"/>`;
      html += `<line x1="${geometry.stringStart}" y1="${y}" x2="${geometry.bridge}" y2="${y}" stroke="url(#stringMetal)" stroke-width="${thickness}"/>`;
    });
    html += `</g>`;

    const numberFrets = frets <= 18
      ? Array.from({ length: frets + 1 }, (_, index) => index)
      : [0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(fret => fret <= frets);
    numberFrets.forEach(fret => {
      html += `<text x="${geometry.fretCenter(fret)}" y="52" text-anchor="middle" class="fret-number" fill="#5f554a">${fret}</text>`;
    });
    boardCache.key = key;
    boardCache.html = html;
    return html;
  }

  function renderFretboard() {
    const svg = $('fretboard');
    const open = tuning().open;
    const strings = open.length;
    const frets = state.track.settings.frets;
    const geometry = neckGeometry(strings, frets);
    const window = preview();
    svg.setAttribute('viewBox', `0 0 ${geometry.width} ${geometry.height}`);
    let neck = svg.querySelector('#neck');
    let markers = svg.querySelector('#markers');
    if (!neck || !markers) {
      svg.innerHTML = '<g id="neck"></g><g id="markers"></g>';
      neck = svg.querySelector('#neck');
      markers = svg.querySelector('#markers');
    }
    const previousKey = boardCache.key;
    const board = renderBoard(open, frets, geometry);
    if (previousKey !== boardCache.key || !neck.childNodes.length) neck.innerHTML = board;
    let html = '';

    // Only the note to play now: what comes next is read on the tablature above.
    const entries = window.current ? [{ event: window.current, kind: 'current', order: 0 }] : [];

    const groups = new Map();
    entries.forEach(entry => {
      const point = markerPoint(entry.event, geometry, strings);
      if (!point || entry.event.fret > frets) return;
      if (!groups.has(point.key)) groups.set(point.key, { point, entries: [] });
      groups.get(point.key).entries.push(entry);
    });
    groups.forEach(group => { html += renderMarkerGroup(group.entries, group.point); });

    markers.innerHTML = html;
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

    const chord = state.track.chords?.[chordIndex()];
    $('chordLabel').textContent = chord ? Chords.nameOf(chord) : t('noChord');
    for (const id of ['chordDown', 'chordUp', 'chordKind', 'chordRemove']) $(id).disabled = !chord;
    const readable = Boolean(state.track.stems?.backing && state.track.rhythm) && !state.track.demo;
    $('chordsRead').disabled = !readable;
    const { score, bar } = place();
    const section = (state.track.sections || [])[sectionIndex()];
    if (section) {
      const first = Rhythm.barAt(score.rhythm, Rhythm.positionOf(score.rhythm, section.start + 0.01) - score.shift + 1e-6);
      $('sectionLabel').textContent = `${t(`kind_${section.kind}`)} · ${t('fromBar')} ${first + 1}`;
    } else $('sectionLabel').textContent = t('noSection');
    for (const id of ['sectionKind', 'sectionLoop', 'sectionRemove']) $(id).disabled = !section;
    $('barLabel').textContent = bar >= 0 ? `${t('bar')} ${bar + 1} · ${Rhythm.beatsIn(score.rhythm, bar)}/4` : '—';
    $('barFewer').disabled = bar < 0 || Rhythm.beatsIn(score.rhythm, bar) <= 1;
    $('barMore').disabled = bar < 0 || Rhythm.beatsIn(score.rhythm, bar) >= 12;
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
    if (document.activeElement !== $('trackTitle')) $('trackTitle').value = state.track.title;
    const origin = state.track.demo ? `${t('demo')} · ${Math.round(state.track.bpm)} BPM` : t(state.track.source === 'bass' ? 'isolatedLine' : 'importedLine');
    $('trackMeta').textContent = `${origin} · ${state.track.events.length} ${t('notes')} · ${tuning().label}`;
    const stems = Boolean(state.track.stems?.backing && state.track.stems?.bass);
    $('listenBlock').hidden = !stems;
    for (const [id, mode] of [['listenMix', 'mix'], ['listenBacking', 'backing'], ['listenBass', 'bass']]) {
      $(id).setAttribute('aria-pressed', String(state.listen === mode));
    }
    $('isolateBlock').hidden = stems || !state.separable || Boolean(state.track.demo) || !state.track.audioBlob;
    $('retranscribeBlock').hidden = Boolean(state.track.demo) || !state.track.audioBlob;
    const pulse = rhythmOf(state.track);
    $('tempoLabel').textContent = state.track.demo || state.track.rhythm
      ? `${Math.round(Rhythm.tempoOf(pulse))} BPM · ${pulse.perBar}/4` : t('findingBeat');
    $('meterToggle').textContent = pulse.perBar === 4 ? '3/4' : '4/4';
    const semitones = shiftOf(state.track);
    $('keyBlock').hidden = !state.track.audioBlob;
    $('practiceBlock').hidden = synthetic(state.track);
    $('keyLabel').textContent = semitones
      ? `${semitones > 0 ? '+' : '−'}${Math.abs(semitones)} ${t(Math.abs(semitones) === 1 ? 'semitone' : 'semitonesMany')}` : t('keyOriginal');
    $('keyDown').disabled = semitones <= -Pitch.RANGE;
    $('keyUp').disabled = semitones >= Pitch.RANGE;
    $('keyReset').disabled = !semitones;
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
    renderPerformance();
    if (full) updatePlayback(false);
  }

  function updatePlayback(force = false) {
    if (!state.track) return;
    const time = currentTime();
    const duration = state.track.duration || audio.duration || 0;
    $('seek').value = duration ? time / duration * 1000 : 0;
    $('clock').textContent = `${Core.formatTime(time)} / ${Core.formatTime(duration)}`;
    const index = Core.currentEventIndex(state.track.events, time, state.currentIndex);
    // what the side panel says about where the playhead is: the note, the chord, the section, the bar
    const where = `${chordIndex()}|${sectionIndex()}|${place().bar}`;
    if (index !== state.currentIndex || where !== state.where || force) {
      const note = index !== state.currentIndex || force;
      state.currentIndex = index;
      state.where = where;
      if (note) renderFretboard();
      renderSide();
    }
    renderTimeline();
    tickMetronome();
  }

  // Follows the clock while playing; a paused track is redrawn on demand instead of every frame.
  function startAnimation() {
    cancelAnimationFrame(state.animation);
    const frame = () => {
      if (!state.track) return;
      const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
      if (state.playing && bounds && currentTime() >= bounds.end) setTime(bounds.start);
      updatePlayback(false);
      state.animation = state.playing ? requestAnimationFrame(frame) : 0;
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
    if (!state.playing || !synthetic(state.track)) return;
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

  /** A click of the metronome, at a moment on the clock of the synthesiser: higher on the first beat of a bar. */
  function click(when, strong) {
    const context = state.synth;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = strong ? 1650 : 1100;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.2 : 0.13, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.07);
  }

  function wakeSynth() {
    state.synth ||= new (window.AudioContext || window.webkitAudioContext)();
    if (state.synth.state === 'suspended') state.synth.resume();
    return state.synth;
  }

  /** Whether a beat of the pulse, counted from its first, opens a bar. */
  function opensBar(rhythm, beat) {
    const onPage = beat - rhythm.downbeat;
    return Rhythm.barStart(rhythm, Rhythm.barAt(rhythm, onPage)) === onPage;
  }

  /**
   * While the track plays, the beats about to come are given their clicks a little ahead, on
   * the clock of the synthesiser, which keeps time better than a frame of animation does.
   */
  function tickMetronome() {
    const track = state.track;
    if (!state.metronome || !state.playing || state.counting || !track || synthetic(track) || audio.paused) { state.nextClick = null; return; }
    const beats = rhythmOf(track).beats;
    const time = currentTime();
    const rate = track.settings.speed || 1; // seconds of the track in a second of the clock
    const context = wakeSynth();
    // When, on the clock of the synthesiser, the track was at its start. The player tells its
    // place only roughly from one frame to the next: the answer is steadied over many frames.
    const origin = context.currentTime - time / rate;
    if (state.nextClick === null || Math.abs(time - state.clickedAt) > 0.5 || Math.abs(origin - state.origin) > 0.05) {
      state.nextClick = beats.findIndex(beat => beat >= time - 0.01);
      if (state.nextClick < 0) state.nextClick = beats.length;
      state.origin = origin;
    } else state.origin += (origin - state.origin) * 0.08;
    state.clickedAt = time;
    while (state.nextClick < beats.length && beats[state.nextClick] < time + 0.15 * rate) {
      const when = state.origin + beats[state.nextClick] / rate;
      if (when > context.currentTime - 0.03) click(Math.max(context.currentTime, when), opensBar(rhythmOf(track), state.nextClick));
      state.nextClick += 1;
    }
  }

  function cancelCount() {
    clearTimeout(state.countTimer);
    state.counting = false;
  }

  /** One bar of clicks at the tempo of the place the track is about to start from; resolves when they are over. */
  function countBar() {
    const track = state.track;
    const rhythm = rhythmOf(track);
    const context = wakeSynth();
    const position = Rhythm.positionOf(rhythm, currentTime());
    const length = Math.max(0.12, (Rhythm.timeOf(rhythm, position + 1) - Rhythm.timeOf(rhythm, position)) / (track.settings.speed || 1));
    for (let beat = 0; beat < rhythm.perBar; beat += 1) click(context.currentTime + 0.06 + beat * length, beat === 0);
    state.counting = true;
    return new Promise(resolve => {
      state.countTimer = setTimeout(() => { state.counting = false; resolve(); }, (0.06 + rhythm.perBar * length) * 1000);
    });
  }

  async function togglePlay() {
    if (!state.track) return;
    if (state.counting) { // a second press while counting calls it off
      cancelCount();
      state.playing = false;
      renderStudio(false);
      return;
    }
    const bounds = Core.validLoopBounds(state.track.settings, state.track.duration || audio.duration || Infinity);
    if (!state.playing && bounds && (currentTime() < bounds.start || currentTime() >= bounds.end)) setTime(bounds.start);
    state.playing = !state.playing;
    if (synthetic(state.track)) {
      if (state.playing) { scheduleDemo(); startAnimation(); }
      else clearTimeout(state.demoTimer);
    } else if (state.track.audioBlob) {
      try {
        setAudioSpeed(state.track.settings.speed);
        if (state.playing && state.countIn) {
          const track = state.track;
          // Some browsers only let a page start sound from a press: the player is started and
          // stopped silently now, so that it may start by itself when the count is over.
          const at = audio.currentTime;
          state.priming = true;
          audio.muted = true;
          try {
            await audio.play();
            // the player says it has stopped a moment after being told to: wait for it to say so
            await new Promise(resolve => { audio.addEventListener('pause', resolve, { once: true }); audio.pause(); });
          } catch (error) { /* it will be tried again after the count */ }
          audio.muted = false;
          if (Math.abs(audio.currentTime - at) > 0.001) audio.currentTime = at;
          state.priming = false;
          renderStudio(false);
          await countBar();
          if (!state.playing || state.track !== track) return;
          await audio.play();
        } else if (state.playing) await audio.play();
        else audio.pause();
      } catch (error) {
        state.priming = false;
        audio.muted = false;
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
    const start = Number($('noteStart').value);
    const end = Number($('noteEnd').value);
    if ($('noteStart').value === '' || $('noteEnd').value === '' || !Number.isFinite(start) || !Number.isFinite(end)) {
      renderSide();
      return;
    }
    Core.updateEventTiming(state.track.events, state.currentIndex, start, end, state.track.duration);
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
    // a recording made shorter to raise its key is played slower by as much, and the other way round
    const rate = speed / state.stretch;
    audio.defaultPlaybackRate = rate;
    audio.preservesPitch = true;
    audio.webkitPreservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.playbackRate = rate;
  }

  function renderPerformance(result = state.mic?.lastResult || null) {
    const active = Boolean(state.mic);
    const card = $('performanceCard');
    card.className = `performance-card ${result?.timingStatus || (active ? 'listening' : 'idle')}`;
    const expected = result?.event || selected();
    $('performanceExpected').textContent = expected ? Core.noteName(expected.midi) : '—';
    $('performanceDetected').textContent = result ? `${t('detected')} ${Core.noteName(Math.round(result.detectedMidi))}` : '—';
    if (result) {
      const timing = result.correct ? ` · ${result.timing >= 0 ? '+' : ''}${Math.round(result.timing * 1000)} ms` : '';
      $('performanceStatus').textContent = `${t(result.timingStatus)}${timing}`;
    } else $('performanceStatus').textContent = active ? t('micListening') : t('micReady');
    const hits = state.mic?.hits?.size || 0;
    const attempts = state.mic?.attempts?.size || 0;
    $('performanceScore').textContent = `${t('score')}: ${hits} / ${attempts}`;
    $('microphoneButton').textContent = active ? t('micStop') : t('micStart');
    $('microphoneButton').classList.toggle('active', active);
  }

  function sampleMicrophone() {
    const mic = state.mic;
    if (!mic || !state.track) return;
    mic.analyser.getFloatTimeDomainData(mic.buffer);
    const pitch = Core.estimatePitch(mic.buffer, mic.context.sampleRate);
    if (pitch) {
      const result = Core.assessPerformance(state.track.events, currentTime(), pitch.midi);
      if (result) {
        mic.attempts.add(result.event.id);
        if (result.correct) {
          mic.hits.add(result.event.id);
          const onset = mic.onsets.get(result.event.id);
          if (onset) Object.assign(result, onset);
          else mic.onsets.set(result.event.id, { timing: result.timing, timingStatus: result.timingStatus });
        }
        mic.lastResult = result;
        renderPerformance(result);
      }
    }
    mic.timer = setTimeout(sampleMicrophone, 80);
  }

  async function startMicrophone() {
    if (state.mic) { stopMicrophone(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      state.mic = {
        stream, context, source, analyser, buffer: new Float32Array(analyser.fftSize),
        timer: 0, hits: new Set(), attempts: new Set(), onsets: new Map(), lastResult: null
      };
      renderPerformance();
      sampleMicrophone();
      if (!state.playing) await togglePlay();
    } catch (error) {
      $('performanceStatus').textContent = t('micDenied');
      $('performanceCard').className = 'performance-card wrong';
    }
  }

  function stopMicrophone(reset = false) {
    const mic = state.mic;
    if (!mic) {
      if (reset && $('performanceCard')) renderPerformance(null);
      return;
    }
    clearTimeout(mic.timer);
    mic.stream.getTracks().forEach(track => track.stop());
    mic.context.close().catch(() => {});
    const summary = reset ? null : { hits: mic.hits, attempts: mic.attempts, lastResult: mic.lastResult };
    state.mic = null;
    renderPerformance(summary?.lastResult || null);
    if (summary) $('performanceScore').textContent = `${t('score')}: ${summary.hits.size} / ${summary.attempts.size}`;
  }

  function exportProject() {
    const track = state.track;
    const project = {
      manico: 6,
      version: Core.VERSION,
      title: track.title,
      duration: track.duration,
      settings: track.settings,
      transpose: track.transpose || 0,
      rhythm: rhythmOf(track),
      chords: (track.chords || []).map(chord => ({ ...chord, name: Chords.nameOf(chord) })),
      sections: track.sections || [],
      events: track.events.map(event => ({
        start: event.start, end: event.end, midi: event.midi, note: Core.noteName(event.midi),
        confidence: event.confidence, string: event.string, fret: event.fret,
        lockedPosition: event.lockedPosition, edited: event.edited
      }))
    };
    download(`${safeName(track.title)}.manico.json`, JSON.stringify(project, null, 2), 'application/json');
  }

  /**
   * Opens the dialog. `mode` is 'import' for a new file; for a saved track, 'isolate' separates
   * its bass and 'retranscribe' reads its notes again.
   */
  function openImport(file, track = null, mode = 'import') {
    if (!file) return;
    state.pendingFile = file;
    state.pendingFiles = null;
    state.pendingTrack = track;
    state.pendingMode = track ? mode : 'import';
    state.cancelled = false;
    const titles = { import: 'analyseTitle', isolate: 'isolateTitle', retranscribe: 'retranscribeTitle' };
    const actions = { import: 'startAnalysis', isolate: 'isolateStart', retranscribe: 'retranscribeStart' };
    const hints = { import: 'analyseHint', isolate: 'isolateHint', retranscribe: 'retranscribeHint' };
    $('importFileName').textContent = track ? track.title : file.name;
    $('analysisTitle').textContent = t(titles[state.pendingMode]);
    $('startAnalysis').textContent = t(actions[state.pendingMode]);
    $('isolateRow').hidden = state.pendingMode !== 'import' || !state.separable;
    $('retranscribeRow').hidden = state.pendingMode !== 'isolate';
    $('analysisStatus').textContent = t(hints[state.pendingMode]);
    $('analysisProgress').style.width = '0%';
    $('startAnalysis').disabled = false;
    $('analysisModal').hidden = false;
  }

  function separationStatus(data) {
    const megabytes = value => Math.round(value / 1048576);
    if (data.stage === 'model') return `${t('modelDownload')}… ${megabytes(data.loaded)}${data.total ? ` / ${megabytes(data.total)}` : ''} MB`;
    if (data.stage === 'start') return t('modelStart');
    if (data.stage === 'separate') return `${t('separating')}… ${data.step} / ${data.total}`;
    return t('encoding');
  }

  /**
   * Works one recording out and saves it: a new file, or a track already saved whose bass is
   * to be isolated or whose notes are to be read again. Returns the id of the track and
   * whether the bass could not be isolated; nothing if the work was given up; fails with a
   * reason (NO_NOTES, NO_BASS, SEPARATION_FAILED) when it cannot be done.
   */
  async function importOne(file, existing, mode, options, progress) {
    const { isolate, readNotes } = options;
    progress(0.03, t('decoding'));
    let mix;
    let source;
    let stems = null;
    let isolated = false;
    if (isolate) {
      mix = await Separator.decode(file);
      if (state.cancelled) return null;
      try {
        state.job = Separator.separate(mix, data => progress(0.05 + data.value * 0.77, separationStatus(data)));
        const result = await state.job.promise;
        stems = { backing: result.backing, bass: result.bassAudio };
        source = result.bass;
        isolated = true;
      } catch (error) {
        if (state.cancelled || error?.message === 'CANCELLED') return null;
        // A new import still gets its transcription, from the full mix as before.
        if (existing) throw new Error('SEPARATION_FAILED');
        console.warn('Manico: bass separation failed', error);
        source = mix;
      } finally {
        state.job = null;
      }
    } else {
      mix = await Transcriber.decode(file);
      source = mix;
      // A track separated earlier is read again from its bass alone.
      if (existing?.stems?.bass) {
        source = await Transcriber.decode(existing.stems.bass);
        isolated = true;
      }
    }
    if (state.cancelled) return null;
    let events = null;
    if (readNotes) {
      const base = isolate ? 0.84 : 0.05;
      events = await Transcriber.transcribe(source, {
        isolated,
        // an isolated bass is held against the recording it came from, and read for the instrument
        mix: isolated ? mix : null,
        lowest: (Core.TUNINGS[existing?.settings?.tuning] || Core.TUNINGS['4']).open[0],
        sensitivity: options.sensitivity,
        onProgress(value, stage) {
          progress(base + value * (0.97 - base), stage === 'prepare' ? t('preparing') : t('analysing'));
        }
      });
      if (state.cancelled) return null;
      if (!events.length) throw new Error(isolated ? 'NO_BASS' : 'NO_NOTES');
    }
    progress(0.98, t('findingBeat'));
    await new Promise(resolve => setTimeout(resolve, 0));
    const rhythm = Rhythm.analyse(mix);
    if (state.cancelled) return null;
    const harmonise = async (target, firstBeat) => {
      if (!target.stems?.backing || !target.rhythm) return;
      progress(0.99, t('readingChords'));
      await new Promise(resolve => setTimeout(resolve, 0));
      try { await readChords(target, firstBeat); } catch (error) { console.warn('Manico: the chords could not be read', error); }
    };
    const now = Date.now();
    let id;
    if (existing) {
      id = existing.id;
      if (stems) existing.stems = stems;
      if (events) {
        const open = (Core.TUNINGS[existing.settings.tuning] || Core.TUNINGS['4']).open;
        const moved = existing.transpose ? Pitch.shiftEvents(events, existing.transpose, open, existing.settings.frets) : events;
        existing.events = Core.optimiseFingering(moved, open, existing.settings.frets);
        existing.analysisVersion = READER;
        existing.source = isolated ? 'bass' : 'mix';
      }
      if (rhythm && !existing.rhythm) existing.rhythm = rhythm;
      // a bass isolated just now brings the chords with it; ones already there are kept
      if (stems && !existing.chords) await harmonise(existing, false);
      existing.updatedAt = now;
      progress(1, t('saving'));
      clearTimeout(state.saveTimer);
      await Store.save(existing);
    } else {
      id = `track-${now}-${Math.random().toString(36).slice(2, 8)}`;
      const settings = { tuning: '4', frets: Core.DEFAULT_FRETS, lookahead: 3, speed: 1, loopA: null, loopB: null };
      const track = {
        id,
        title: file.name.replace(/\.[^.]+$/, ''),
        filename: file.name,
        size: file.size,
        mime: file.type,
        audioBlob: file,
        duration: mix.duration,
        createdAt: now,
        updatedAt: now,
        analysisVersion: READER,
        source: isolated ? 'bass' : 'mix',
        settings,
        events: Core.optimiseFingering(events, Core.TUNINGS['4'].open, settings.frets)
      };
      if (stems) track.stems = stems;
      if (rhythm) track.rhythm = rhythm;
      await harmonise(track, true);
      progress(1, t('saving'));
      await Store.save(track);
    }
    return { id, skipped: isolate && !stems };
  }

  const REASONS = { NO_NOTES: 'noNotes', NO_BASS: 'noBass', SEPARATION_FAILED: 'separationFailed' };

  /** Whether a recording is already among the saved tracks: the same file name and the same size. */
  const alreadySaved = file => state.tracks.some(track => track.filename === file.name
    && (track.size ?? track.audioBlob?.size) === file.size);

  /**
   * Several recordings, one after the other with the same choices. One already saved is
   * passed over, one that fails does not stop the rest, and at the end the list of tracks
   * says what became of each.
   */
  async function importMany(files, options, progress) {
    const outcome = { ready: 0, known: 0, failed: [], stopped: false };
    for (let index = 0; index < files.length; index += 1) {
      if (state.cancelled) { outcome.stopped = true; break; }
      const file = files[index];
      $('importFileName').textContent = `${index + 1} / ${files.length} · ${file.name}`;
      if (alreadySaved(file)) { outcome.known += 1; continue; }
      try {
        const done = await importOne(file, null, 'import', options, (value, text) => progress((index + Core.clamp(value, 0, 1)) / files.length, text));
        if (!done) { outcome.stopped = true; break; }
        outcome.ready += 1;
        state.tracks = await Store.list();
      } catch (error) {
        if (state.cancelled) { outcome.stopped = true; break; }
        console.warn(`Manico: ${file.name} could not be transcribed`, error);
        outcome.failed.push(`${file.name} (${t({ NO_NOTES: 'reasonNoNotes', NO_BASS: 'reasonNoBass' }[error?.message] || 'reasonFailed')})`);
      }
    }
    return outcome;
  }

  /** What became of several recordings, said above the list of tracks until it is clicked away. */
  function showOutcome(outcome) {
    const parts = [];
    if (outcome.ready) parts.push(`${outcome.ready} ${t(outcome.ready === 1 ? 'outcomeReadyOne' : 'outcomeReady')}`);
    if (outcome.known) parts.push(`${outcome.known} ${t('outcomeKnown')}`);
    if (outcome.failed.length) parts.push(`${t('outcomeFailed')}: ${outcome.failed.join(', ')}`);
    if (outcome.stopped) parts.push(t('outcomeStopped'));
    const note = $('batchSummary');
    note.textContent = parts.join(' · ');
    note.classList.toggle('bad', outcome.failed.length > 0);
    note.hidden = !parts.length;
  }

  async function startImport() {
    const file = state.pendingFile;
    const many = state.pendingFiles?.length > 1 ? state.pendingFiles : null;
    const existing = state.pendingTrack;
    const mode = state.pendingMode;
    if (!file) return;
    state.cancelled = false;
    $('startAnalysis').disabled = true;
    const options = {
      isolate: mode === 'isolate' || (mode === 'import' && state.separable && $('isolateBass').checked),
      readNotes: mode !== 'isolate' || $('retranscribe').checked,
      sensitivity: Number($('sensitivity').value) / 100
    };
    const progress = (value, text) => {
      $('analysisProgress').style.width = `${Math.round(Core.clamp(value, 0, 1) * 100)}%`;
      if (text) $('analysisStatus').textContent = text;
    };
    let wakeLock = null;
    // Minutes of work, or hours for many recordings: keep the screen from sleeping where the browser allows it.
    if (options.isolate || many) { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (error) { wakeLock = null; } }
    try {
      if (many) {
        const outcome = await importMany(many, options, progress);
        state.pendingFile = null;
        state.pendingFiles = null;
        $('analysisModal').hidden = true;
        stopAudio();
        state.track = null;
        await loadLibrary();
        await refreshStorage();
        show('home');
        showOutcome(outcome);
        return;
      }
      const done = await importOne(file, existing, mode, options, progress);
      if (!done) return;
      state.pendingFile = null;
      state.pendingTrack = null;
      $('analysisModal').hidden = true;
      await loadLibrary();
      await refreshStorage();
      await openTrack(done.id, false);
      if (done.skipped) $('savedLabel').textContent = t('separationSkipped');
    } catch (error) {
      $('startAnalysis').disabled = false;
      $('analysisProgress').style.width = '0%';
      $('analysisStatus').textContent = t(REASONS[error?.message] || 'failed');
    } finally {
      try { await wakeLock?.release(); } catch (error) { /* already released */ }
    }
  }

  function cancelImport() {
    state.cancelled = true;
    state.job?.cancel();
    state.job = null;
    state.pendingFile = null;
    state.pendingFiles = null;
    state.pendingTrack = null;
    $('analysisModal').hidden = true;
  }

  const AUDIO_NAME = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|aif|aiff|mp4|weba)$/i;
  const isAudio = file => Boolean(file) && !String(file.name || '').startsWith('.')
    && (String(file.type || '').startsWith('audio/') || AUDIO_NAME.test(file.name || ''));

  /** Everything dropped on the page: the files, and what is in the folders, folders within folders included. */
  async function droppedFiles(transfer) {
    // the entries must be asked for at once: after the first pause the browser forgets the drop
    const entries = [...(transfer.items || [])].map(item => item.webkitGetAsEntry?.()).filter(Boolean);
    if (!entries.length) return [...(transfer.files || [])];
    const files = [];
    const walk = async (entry, folder) => {
      if (entry.isFile) {
        const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
        files.push({ file, order: `${folder}/${entry.name}` });
        return;
      }
      const reader = entry.createReader();
      for (;;) { // a folder is read a hundred entries at a time
        const some = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (!some.length) break;
        for (const child of some) if (!child.name.startsWith('.')) await walk(child, `${folder}/${entry.name}`);
      }
    };
    for (const entry of entries) { try { await walk(entry, ''); } catch (error) { console.warn('Manico: a dropped folder could not be read', error); } }
    return inOrder(files);
  }

  /** Files in the order of their names, 2 before 10. */
  const inOrder = list => list
    .sort((left, right) => left.order.localeCompare(right.order, undefined, { numeric: true, sensitivity: 'base' }))
    .map(item => item.file);

  /** Takes what was chosen or dropped: one recording opens the dialog as before, several open it for all of them. */
  function takeFiles(list) {
    const files = [...list].filter(isAudio);
    if (!files.length) {
      if ([...list].length) { $('batchSummary').textContent = t('noAudioFiles'); $('batchSummary').classList.add('bad'); $('batchSummary').hidden = false; }
      return;
    }
    $('batchSummary').hidden = true;
    if (files.length === 1) { openImport(files[0]); return; }
    openImport(files[0]);
    state.pendingFiles = files;
    const known = files.filter(alreadySaved).length;
    $('analysisTitle').textContent = t('analyseManyTitle').replace('{n}', files.length);
    $('startAnalysis').textContent = t('startMany').replace('{n}', files.length);
    const names = files.slice(0, 3).map(file => file.name).join(', ');
    $('importFileName').textContent = files.length > 3 ? `${names} ${t('andOthers').replace('{n}', files.length - 3)}` : names;
    $('analysisStatus').textContent = t('analyseManyHint') + (known ? ` ${t('manyKnown').replace('{n}', known)}` : '');
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
    $('helpLink').onclick = event => {
      event.preventDefault();
      window.location.assign(state.lang === 'en' ? 'help-en.html' : 'help-it.html');
    };
    $('homeButton').onclick = () => { stopAudio(); state.track = null; show('home'); };
    $('importTop').onclick = () => $('fileInput').click();
    $('chooseFile').onclick = () => $('fileInput').click();
    $('fileInput').onchange = () => { takeFiles($('fileInput').files); $('fileInput').value = ''; };
    $('chooseFolder').onclick = () => $('folderInput').click();
    $('folderInput').onchange = () => {
      takeFiles(inOrder([...$('folderInput').files].map(file => ({ file, order: file.webkitRelativePath || file.name }))));
      $('folderInput').value = '';
    };
    $('batchSummary').onclick = () => { $('batchSummary').hidden = true; };
    $('startAnalysis').onclick = startImport;
    $('cancelAnalysis').onclick = cancelImport;
    $('sensitivity').oninput = event => { $('sensitivityValue').textContent = `${event.target.value}%`; };
    const drop = $('dropzone');
    drop.ondragover = event => { event.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = event => { event.preventDefault(); drop.classList.remove('over'); droppedFiles(event.dataTransfer).then(takeFiles); };
    $('backHome').onclick = () => { stopAudio(); state.track = null; show('home'); };
    $('playButton').onclick = togglePlay;
    $('tabStrip').onclick = clickTab;
    window.addEventListener('resize', () => { if (state.track && !$('studioView').hidden) renderTimeline(); });
    $('seek').oninput = event => setTime(Number(event.target.value) / 1000 * (state.track?.duration || 0));
    $('speedSelect').onchange = event => {
      state.track.settings.speed = Number(event.target.value);
      setAudioSpeed(state.track.settings.speed);
      scheduleSave();
      if (state.playing && synthetic(state.track)) scheduleDemo();
      state.nextClick = null;
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
    $('microphoneButton').onclick = startMicrophone;
    $('listenMix').onclick = () => setListen('mix');
    $('listenBacking').onclick = () => setListen('backing');
    $('listenBass').onclick = () => setListen('bass');
    for (const [id, mode] of [['isolateExisting', 'isolate'], ['retranscribeTrack', 'retranscribe']]) {
      $(id).onclick = () => {
        const track = state.track;
        if (!track?.audioBlob) return;
        if (state.playing) togglePlay();
        openImport(track.audioBlob, track, mode);
      };
    }
    $('barEarlier').onclick = () => adjustRhythm('earlier');
    $('barLater').onclick = () => adjustRhythm('later');
    $('tempoHalf').onclick = () => adjustRhythm('half');
    $('tempoDouble').onclick = () => adjustRhythm('double');
    $('meterToggle').onclick = () => adjustRhythm('meter');
    $('offBeat').onclick = () => adjustRhythm('offbeat');
    $('barFewer').onclick = () => adjustRhythm('fewer');
    $('barMore').onclick = () => adjustRhythm('more');
    $('keyDown').onclick = () => moveKey(-1);
    $('keyUp').onclick = () => moveKey(1);
    $('keyReset').onclick = () => moveKey(0);
    for (const [id, name] of [['countIn', 'countIn'], ['metronome', 'metronome']]) {
      try { state[name] = localStorage.getItem(`manico-${name}`) === '1'; } catch (error) {}
      $(id).checked = state[name];
      $(id).onchange = event => {
        state[name] = event.target.checked;
        state.nextClick = null;
        if (state[name]) wakeSynth(); // a press is what lets the page make sound
        try { localStorage.setItem(`manico-${name}`, state[name] ? '1' : '0'); } catch (error) {}
      };
    }
    $('chordDown').onclick = () => editChord('down');
    $('chordUp').onclick = () => editChord('up');
    $('chordKind').onclick = () => editChord('kind');
    $('chordAdd').onclick = () => editChord('add');
    $('chordRemove').onclick = () => editChord('remove');
    $('chordsRead').onclick = rereadChords;
    $('sectionAdd').onclick = () => editSection('add');
    $('sectionKind').onclick = () => editSection('kind');
    $('sectionLoop').onclick = () => editSection('loop');
    $('sectionRemove').onclick = () => editSection('remove');
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
    $('exportPdf').onclick = () => download(`${safeName(state.track.title)}.pdf`, Sheet.pdf(printable(state.track), rhythmOf(state.track)), 'application/pdf');
    $('exportXml').onclick = () => download(`${safeName(state.track.title)}.musicxml`, Sheet.musicXML(printable(state.track), rhythmOf(state.track)), 'application/vnd.recordare.musicxml+xml');
    $('exportProject').onclick = exportProject;
    $('trackTitle').onchange = event => { state.track.title = event.target.value.trim() || state.track.title; scheduleSave(); };
    audio.onplay = () => { if (state.priming) return; state.playing = true; renderStudio(false); startAnimation(); };
    audio.onpause = () => { if (state.switching || state.priming) return; state.playing = false; renderStudio(false); };
    audio.onended = () => { state.playing = false; setTime(0); renderStudio(false); };
    audio.onloadedmetadata = () => { if (state.track && !state.track.duration) state.track.duration = audio.duration * state.stretch; updatePlayback(true); };
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
    state.separable = await Separator.available();
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
