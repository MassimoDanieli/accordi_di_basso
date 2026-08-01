// Testi in italiano e inglese. La lingua si sceglie dalla barra e resta memorizzata.

const KEY = 'manico-lingua';

const D = {
  it: {
    'bar.grid': 'Griglia di accordi',
    'bar.show': 'Mostra',
    'bar.play': 'Play',
    'bar.stop': 'Stop',
    'bar.tempo': 'Tempo',
    'bar.guide': 'Guida',
    'bar.forms': 'Forme',
    'bar.ireal': 'iReal',
    'bar.tab': 'Tab',
    'bar.settings': 'Impostazioni',
    'bar.gridTitle': 'Spazio fra le battute, virgola dentro la battuta',

    'tip.syntax': 'Spazio fra le battute, virgola dentro la battuta:',
    'tip.guide': 'guida completa',

    'zone.from': 'Zona, dal tasto',
    'zone.width': 'ampiezza',
    'zone.frets': n => n + (n === 1 ? ' tasto' : ' tasti'),
    'zone.desc': (a, b) => a === 0 ? `tasti 0\u2013${b}, corde a vuoto incluse` : `tasti ${a}\u2013${b}`,
    'zone.coverage': 'Copertura per posizione',
    'zone.coverageTitle': 'Percentuale di note raggiungibili senza spostarsi, sul peggiore accordo della griglia',
    'zone.cell': (a, b, p) => `tasti ${a}\u2013${b}, copertura ${p}%`,

    'key.root': 'fondamentale', 'key.third': 'terza', 'key.fifth': 'quinta',
    'key.sev': 'sesta e settima', 'key.ext': 'estensioni',

    'v.title': 'Voicing',
    'v.count': (n, ch, a, b) => `\u2014 ${n} per ${ch}, tasti ${a}\u2013${b}`,
    'v.type': 'Tipo',
    'v.span': 'apertura mano',
    'v.lead': 'Ottimizza voice leading',
    'v.total': n => `moto complessivo: ${n} semitoni`,
    'v.motion': n => `moto ${n}`,
    'v.spanOf': n => `apertura ${n}`,
    'v.none': 'Nessun accordo selezionato.',
    'v.empty': (tipo, a, b) => `Nessun ${tipo} fra il tasto ${a} e il ${b}. Allarga la zona, aumenta l\u2019apertura della mano o cambia tipo di voicing.`,
    'v.open': 'Mostra i voicing',
    'v.close': 'Nascondi i voicing',
    'v.listen': 'ascolta',

    'inv.-1': 'nota al basso indicata',
    'inv.0': 'fondamentale al basso',
    'inv.1': '1\u00b0 rivolto', 'inv.2': '2\u00b0 rivolto', 'inv.3': '3\u00b0 rivolto',
    'inv.4': '4\u00b0 rivolto', 'inv.5': '5\u00b0 rivolto', 'inv.x': 'estensione al basso',

    'vt.arp.name': 'Arpeggio', 'vt.arp.hint': 'tutte le note dell\u2019accordo in successione',
    'vt.shell.name': 'Shell \u2014 R + 7 + 3', 'vt.shell.hint': 'fondamentale e le due note guida',
    'vt.guide.name': 'Note guida \u2014 3 + 7', 'vt.guide.hint': 'solo terza e settima, per il comping',
    'vt.tenth.name': 'Decime \u2014 R + 3', 'vt.tenth.hint': 'fondamentale e terza a un\u2019ottava e mezza',
    'vt.triad.name': 'Triade \u2014 R + 3 + 5', 'vt.triad.hint': 'triade in posizione stretta',
    'vt.quartal.name': 'Quartale', 'vt.quartal.hint': 'quarte sovrapposte, dove l\u2019accordo lo consente',

    'tun.4': '4 corde \u00b7 E A D G', 'tun.5': '5 corde \u00b7 B E A D G',
    'tun.5c': '5 corde con Do acuto \u00b7 E A D G C', 'tun.6': '6 corde \u00b7 B E A D G C',
    'set.title': 'Strumento e vista',
    'set.bass': 'Basso', 'set.frets': 'Tasti mostrati', 'set.fretsTo': n => 'fino al ' + n,
    'set.notes': 'Note sul manico', 'set.degrees': 'Gradi', 'set.names': 'Note',
    'set.flip': 'Inverti corde', 'set.dim': 'Sfuma fuori zona',
    'set.viewHint': '<b>Gradi</b> mostra R, 3, 5, \u266d7 invece dei nomi delle note. <b>Inverti corde</b> mette la corda piu\u0300 grave in alto. <b>Sfuma fuori zona</b> lascia visibili in trasparenza le note fuori dalla zona.',
    'play.title': 'Esecuzione',
    'play.meter': 'Metro', 'play.what': 'Cosa suona',
    'play.voicing': 'il voicing scelto', 'play.root': 'solo la fondamentale',
    'play.walking': 'linea walking', 'play.mute': 'niente, solo il click',
    'play.arp': 'arpeggio dell\u2019accordo, nota per nota dalla fondamentale',
    'mode.arp': 'Arpeggio', 'mode.voicing': 'Voicing', 'mode.root': 'Fondam.',
    'mode.walking': 'Walking', 'mode.mute': 'Click',
    'play.options': 'Opzioni', 'play.click': 'Click', 'play.lock': 'Zona fissa',
    'play.hint': '<b>Zona fissa</b> impedisce alla zona di inseguire l\u2019accordo corrente: resti in posizione e vedi cosa hai davvero sotto le dita.',

    'lib.title': 'Forme armoniche',
    'lib.hint': 'Forme essenziali, brani tradizionali e versioni semplificate di brani celebri, con il tempo consigliato. Per le griglie complete degli standard usa l\u2019importazione dalle tue carte iReal.',
    'lib.load': 'Carica',

    'ir.title': 'Importa un brano',
    'ir.hint': 'Incolla un link <code>irealb://</code> preso dal tasto Condividi di iReal Pro, oppure carica un file <code>.musicxml</code> (iReal, MuseScore). La forma viene srotolata come si suona: ritornelli, finali, segno, coda, da capo. Tutto avviene nel browser: non esce niente dalla pagina.',
    'ir.file': 'oppure un file MusicXML:',
    'ir.unknown': n => `sigle non riconosciute (in rosso nel nastro): ${n}`,
    'ir.go': 'Importa',
    'ir.empty': 'Incolla prima un link.',
    'ir.bad': '<b>Non sono riuscito a leggere il link.</b> Deve iniziare con irealb:// oppure irealbook://. In alternativa scrivi gli accordi a mano nella barra in alto.',
    'ir.loaded': (t, c, k, n) => `${t}${c ? ' \u2014 ' + c : ''}${k ? ' \u00b7 tonalit\u00e0 ' + k : ''} \u00b7 ${n} battute (forma srotolata)`,

    'tab.title': 'Tab ASCII',
    'tab.hint': 'Usa il voicing selezionato per ogni accordo. Clicca una card per cambiarlo, poi rigenera.',
    'tab.make': 'Genera', 'tab.copy': 'Copia', 'tab.copied': 'Copiato', 'tab.dl': 'Scarica .txt',
    'tab.perline': n => n + ' battute per riga',
    'tab.blocks': 'voicing a blocchi', 'tab.walk': 'linea walking',
    'tab.legend': 'le note fra parentesi sono di passaggio',
    'tab.press': 'Premi Genera.',
    'tab.head': (g, b, a, e, v) => `griglia: ${g}\nbasso: ${b}   zona: tasti ${a}-${e}   voicing: ${v}`,

    'chip.bad': 'sigla non riconosciuta',
    'close': 'Chiudi',
    'foot': 'Manico &copy; 2026 Massimo Danieli &middot; software libero sotto <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL v3</a>, senza alcuna garanzia &middot; <a href="https://github.com/MassimoDanieli/accordi_di_basso">sorgenti su GitHub</a>'
  },

  en: {
    'bar.grid': 'Chord chart',
    'bar.show': 'Show',
    'bar.play': 'Play',
    'bar.stop': 'Stop',
    'bar.tempo': 'Tempo',
    'bar.guide': 'Guide',
    'bar.forms': 'Forms',
    'bar.ireal': 'iReal',
    'bar.tab': 'Tab',
    'bar.settings': 'Settings',
    'bar.gridTitle': 'Space between bars, comma within a bar',

    'tip.syntax': 'Space between bars, comma within a bar:',
    'tip.guide': 'full guide',

    'zone.from': 'Zone, from fret',
    'zone.width': 'width',
    'zone.frets': n => n + (n === 1 ? ' fret' : ' frets'),
    'zone.desc': (a, b) => a === 0 ? `frets 0\u2013${b}, open strings included` : `frets ${a}\u2013${b}`,
    'zone.coverage': 'Coverage by position',
    'zone.coverageTitle': 'Share of chord tones reachable without shifting, taken on the worst chord in the chart',
    'zone.cell': (a, b, p) => `frets ${a}\u2013${b}, coverage ${p}%`,

    'key.root': 'root', 'key.third': 'third', 'key.fifth': 'fifth',
    'key.sev': 'sixth and seventh', 'key.ext': 'extensions',

    'v.title': 'Voicings',
    'v.count': (n, ch, a, b) => `\u2014 ${n} for ${ch}, frets ${a}\u2013${b}`,
    'v.type': 'Type',
    'v.span': 'hand span',
    'v.lead': 'Optimise voice leading',
    'v.total': n => `total motion: ${n} semitones`,
    'v.motion': n => `motion ${n}`,
    'v.spanOf': n => `span ${n}`,
    'v.none': 'No chord selected.',
    'v.empty': (tipo, a, b) => `No ${tipo} between fret ${a} and ${b}. Widen the zone, allow a larger hand span, or pick another voicing type.`,
    'v.open': 'Show voicings',
    'v.close': 'Hide voicings',
    'v.listen': 'listen',

    'inv.-1': 'specified bass note',
    'inv.0': 'root in the bass',
    'inv.1': '1st inversion', 'inv.2': '2nd inversion', 'inv.3': '3rd inversion',
    'inv.4': '4th inversion', 'inv.5': '5th inversion', 'inv.x': 'extension in the bass',

    'vt.arp.name': 'Arpeggio', 'vt.arp.hint': 'every chord tone, one after another',
    'vt.shell.name': 'Shell \u2014 R + 7 + 3', 'vt.shell.hint': 'root plus the two guide tones',
    'vt.guide.name': 'Guide tones \u2014 3 + 7', 'vt.guide.hint': 'third and seventh only, for comping',
    'vt.tenth.name': 'Tenths \u2014 R + 3', 'vt.tenth.hint': 'root and third a tenth apart',
    'vt.triad.name': 'Triad \u2014 R + 3 + 5', 'vt.triad.hint': 'close position triad',
    'vt.quartal.name': 'Quartal', 'vt.quartal.hint': 'stacked fourths, where the chord allows it',

    'tun.4': '4 strings \u00b7 E A D G', 'tun.5': '5 strings \u00b7 B E A D G',
    'tun.5c': '5 strings, high C \u00b7 E A D G C', 'tun.6': '6 strings \u00b7 B E A D G C',
    'set.title': 'Instrument and view',
    'set.bass': 'Bass', 'set.frets': 'Frets shown', 'set.fretsTo': n => 'up to ' + n,
    'set.notes': 'Notes on the neck', 'set.degrees': 'Degrees', 'set.names': 'Names',
    'set.flip': 'Flip strings', 'set.dim': 'Dim outside zone',
    'set.viewHint': '<b>Degrees</b> shows R, 3, 5, \u266d7 instead of note names. <b>Flip strings</b> puts the lowest string on top. <b>Dim outside zone</b> keeps notes outside the zone faintly visible.',
    'play.title': 'Playback',
    'play.meter': 'Metre', 'play.what': 'What plays',
    'play.voicing': 'the chosen voicing', 'play.root': 'the root only',
    'play.walking': 'walking line', 'play.mute': 'nothing, click only',
    'play.arp': 'the chord arpeggio, note by note from the root',
    'mode.arp': 'Arpeggio', 'mode.voicing': 'Voicing', 'mode.root': 'Root',
    'mode.walking': 'Walking', 'mode.mute': 'Click',
    'play.options': 'Options', 'play.click': 'Click', 'play.lock': 'Lock zone',
    'play.hint': '<b>Lock zone</b> stops the zone from following the current chord: you stay in position and see what is really under your fingers.',

    'lib.title': 'Harmonic forms',
    'lib.hint': 'Essential forms, traditional tunes and simplified versions of well-known songs, each with a suggested tempo. For complete standard charts, import your own iReal files.',
    'lib.load': 'Load',

    'ir.title': 'Import a song',
    'ir.hint': 'Paste an <code>irealb://</code> link from iReal Pro\u2019s Share button, or load a <code>.musicxml</code> file (iReal, MuseScore). The form is unrolled as played: repeats, endings, segno, coda, da capo. Everything happens in the browser: nothing leaves the page.',
    'ir.file': 'or a MusicXML file:',
    'ir.unknown': n => `unrecognised symbols (red in the ribbon): ${n}`,
    'ir.go': 'Import',
    'ir.empty': 'Paste a link first.',
    'ir.bad': '<b>I could not read that link.</b> It must start with irealb:// or irealbook://. Otherwise type the chords by hand in the bar above.',
    'ir.loaded': (t, c, k, n) => `${t}${c ? ' \u2014 ' + c : ''}${k ? ' \u00b7 key ' + k : ''} \u00b7 ${n} bars (form unrolled)`,

    'tab.title': 'ASCII tab',
    'tab.hint': 'Uses the voicing selected for each chord. Click a card to change it, then generate again.',
    'tab.make': 'Generate', 'tab.copy': 'Copy', 'tab.copied': 'Copied', 'tab.dl': 'Download .txt',
    'tab.perline': n => n + ' bars per line',
    'tab.blocks': 'block voicings', 'tab.walk': 'walking line',
    'tab.legend': 'notes in brackets are passing notes',
    'tab.press': 'Press Generate.',
    'tab.head': (g, b, a, e, v) => `chart: ${g}\nbass: ${b}   zone: frets ${a}-${e}   voicing: ${v}`,

    'chip.bad': 'symbol not recognised',
    'close': 'Close',
    'foot': 'Manico &copy; 2026 Massimo Danieli &middot; free software under <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL v3</a>, with no warranty &middot; <a href="https://github.com/MassimoDanieli/accordi_di_basso">source on GitHub</a>'
  }
};

let current = 'it';

export function readLang() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'it' || v === 'en') return v;
  } catch (e) { /* archiviazione non disponibile */ }
  return (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';
}

export function lang() { return current; }

export function t(key, ...args) {
  const v = (D[current] && D[current][key]) !== undefined ? D[current][key] : D.it[key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(...args) : v;
}

/** Riempie gli elementi marcati nell'HTML. */
export function applyStatic(root = document) {
  root.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  root.querySelectorAll('[data-th]').forEach(el => { el.innerHTML = t(el.dataset.th); });
  root.querySelectorAll('[data-tt]').forEach(el => { el.title = t(el.dataset.tt); });
  root.querySelectorAll('[data-tp]').forEach(el => { el.placeholder = t(el.dataset.tp); });
  document.documentElement.setAttribute('lang', current);
}

export function setLang(l, onChange) {
  current = (l === 'en') ? 'en' : 'it';
  try { localStorage.setItem(KEY, current); } catch (e) { /* niente da fare */ }
  document.querySelectorAll('[data-lang]').forEach(b =>
    b.classList.toggle('on', b.dataset.lang === current));
  applyStatic();
  if (onChange) onChange();
}

export function initLang(onChange) {
  setLang(readLang(), null);
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('[data-lang]');
    if (b) setLang(b.dataset.lang, onChange);
  });
}
