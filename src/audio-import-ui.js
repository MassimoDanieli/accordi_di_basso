// Importazione audio dentro il dialogo Aggiungi brani.
// Il riconoscimento vive in audio-import.html, isolato dal motore principale.

(function initAudioImportUI() {
  function language() {
    try { return localStorage.getItem('manico-lingua') === 'en' ? 'en' : 'it'; }
    catch (e) { return document.documentElement.lang === 'en' ? 'en' : 'it'; }
  }

  const copy = {
    it: {
      tab: 'Da MP3',
      title: 'Importa da MP3',
      hint: 'Carica una registrazione, controlla gli accordi stimati e importali direttamente nella griglia. Il file resta nel browser.',
      open: 'Apri importatore MP3',
      close: 'Chiudi importatore MP3'
    },
    en: {
      tab: 'From MP3',
      title: 'Import from MP3',
      hint: 'Load a recording, review the estimated chords, then import them directly into the chart. The file stays in your browser.',
      open: 'Open MP3 importer',
      close: 'Close MP3 importer'
    }
  };

  function mount() {
    const dialog = document.getElementById('dlgireal');
    if (!dialog || document.getElementById('iraudio')) return;

    // La vecchia scorciatoia separata non serve piu': tutto parte da Aggiungi brani.
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
        <iframe id="iraudioframe" title="MP3 import" style="display:block;width:100%;height:620px;border:0;border-radius:9px;background:#171411"></iframe>
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
      if (!wrap.hidden && !frame.src) frame.src = 'audio-import.html?v=4.2.0';
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
