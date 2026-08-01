// Tema chiaro/scuro. La preferenza sopravvive alla chiusura della pagina quando il
// browser lo consente; in navigazione privata si ripiega sulle impostazioni di sistema.

const KEY = 'manico-tema';

export function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'chiaro' || saved === 'scuro') return saved;
  } catch (e) { /* archiviazione non disponibile */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'scuro' : 'chiaro';
}

function inglese() {
  try {
    const l = localStorage.getItem('manico-lingua');
    if (l === 'en' || l === 'it') return l === 'en';
  } catch (e) { /* archiviazione non disponibile */ }
  return (document.documentElement.lang || 'it').toLowerCase().startsWith('en');
}

/** Aggiorna la scritta del pulsante nella lingua corrente. */
export function refreshThemeLabel() {
  const btn = document.getElementById('tema');
  if (!btn) return;
  const chiaro = document.documentElement.getAttribute('data-tema') === 'chiaro';
  const en = inglese();
  btn.textContent = chiaro ? (en ? 'Dark' : 'Scuro') : (en ? 'Light' : 'Chiaro');
  btn.title = chiaro ? (en ? 'Switch to the dark theme' : 'Passa al tema scuro')
                     : (en ? 'Switch to the light theme' : 'Passa al tema chiaro');
  btn.setAttribute('aria-label', btn.title);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-tema', theme);
  try { localStorage.setItem(KEY, theme); } catch (e) { /* niente da fare */ }
  refreshThemeLabel();
}

export function toggleTheme() {
  applyTheme(document.documentElement.getAttribute('data-tema') === 'chiaro' ? 'scuro' : 'chiaro');
}

/**
 * Il tema si aggancia con una delega sul documento: cosi' funziona anche se il
 * pulsante viene ridisegnato, e non dipende dal resto dell'inizializzazione.
 */
export function initTheme() {
  applyTheme(readTheme());
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('#tema')) toggleTheme();
  });
}
