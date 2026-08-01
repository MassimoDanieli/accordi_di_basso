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

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-tema', theme);
  try { localStorage.setItem(KEY, theme); } catch (e) { /* niente da fare */ }
  const btn = document.getElementById('tema');
  if (btn) {
    const chiaro = theme === 'chiaro';
    btn.textContent = chiaro ? 'Scuro' : 'Chiaro';
    btn.title = chiaro ? 'Passa al tema scuro' : 'Passa al tema chiaro';
    btn.setAttribute('aria-label', btn.title);
  }
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
