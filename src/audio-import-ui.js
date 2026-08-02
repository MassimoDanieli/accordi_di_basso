// Importazione audio dentro il dialogo Aggiungi brani.
// La trascrizione vive in audio-import.html, isolata dal motore principale.

(function initAudioImportUI() {
  function language() {
    try { return localStorage.getItem('manico-lingua') === 'en' ? 'en' : 'it'; }
    catch (e) { return document.documentElement.lang === 'en' ? 'en' : 'it'; }
  }

  const copy = {
    it: {
      tab: 'Da MP3',
      title: 'Trascrivi la linea di basso da MP3',
      hint: 'Carica una registrazione: Manico rileva attacchi, note gravi, ritmo e diteggiatura. L’accordo resta solo un’indicazione armonica secondaria.',
      open: 'Apri trascrittore MP3',
      close: 'Chiudi trascrittore MP3'
    },
    en: {
      tab: 'From MP3',
      title: 'Transcribe the bass line from MP3',
      hint: 'Load a recording: Manico detects attacks, low notes, rhythm and fingering. Chords remain optional harmonic context only.',
      open: 'Open MP3 transcriber',
      close: 'Close MP3 transcriber'
    }
  };

  function mount() {
    const dialog = document.getElementById('dlgireal');
    if (!dialog || document.getElementById('iraudio')) return;

    document.querySelectorAll('a[href="audio.html"]').forEach(a => a.remove());

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
      </div>
      <div id="iraudioframewrap" hidden style="margin-top:12px">
        <iframe id="iraudioframe" title="MP3 bass-line transcription" style="display:block;width:100%;height:760px;border:0;border-radius:9px;background:#171411"></iframe>
      </div>`;

    const foot = dialog.querySelector('.dlg-foot');
    dialog.insertBefore(panel, foot || null);

    const button = document.getElementById('iraudiotoggle');
    const wrap = document.getElementById('iraudioframewrap');
    const frame = document.getElementById('iraudioframe');

    function translate() {
      const c = copy[language()];
      panel.querySelectorAll('[data-audio-copy]').forEach(el => {
        const key = el.dataset.audioCopy;
        el.textContent = key === 'open' && !wrap.hidden ? c.close : c[key];
      });
    }

    button.addEventListener('click', () => {
      wrap.hidden = !wrap.hidden;
      if (!wrap.hidden && !frame.src) frame.src = 'audio-import.html?v=4.3.0';
      translate();
    });

    window.addEventListener('message', e => {
      if (e.origin !== location.origin || !e.data || e.data.type !== 'manico-bassline') return;
      wrap.hidden = true;
      const info = document.getElementById('irinfo');
      if (info) {
        const count = Array.isArray(e.data.events) ? e.data.events.length : 0;
        info.textContent = language() === 'en'
          ? `${count} bass notes transcribed. The suggested TAB has been downloaded or copied from the transcriber.`
          : `${count} note di basso trascritte. La TAB suggerita può essere copiata o scaricata dal trascrittore.`;
      }
      translate();
    });

    document.addEventListener('click', e => {
      if (e.target && e.target.closest && e.target.closest('[data-lang]')) setTimeout(translate, 0);
    });

    translate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
