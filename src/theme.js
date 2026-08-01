// Tema chiaro/scuro. La preferenza sopravvive alla chiusura della pagina quando il
// browser lo consente; in navigazione privata si ripiega sulle impostazioni di sistema.

const KEY = 'manico-tema';

export function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'chiaro' || saved === 'scuro') return saved;
  } catch (e) { /* archiviazione non disponibile */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'chiaro' : 'scuro';
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

export function initTheme() {
  applyTheme(readTheme());
  const btn = document.getElementById('tema');
  if (btn) btn.onclick = () => applyTheme(
    document.documentElement.getAttribute('data-tema') === 'chiaro' ? 'scuro' : 'chiaro');
}
