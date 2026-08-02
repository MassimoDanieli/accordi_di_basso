// Lettura di brani in formato testo: gli accordi sopra le parole (il formato di
// mezzo internet) e ChordPro (gli accordi fra parentesi quadre nel testo, con le
// direttive {title}/{artist}/{tempo}).
//
// Per il testo nudo la convenzione e' semplice: la prima riga non-accordi e' il
// titolo, la seconda l'autore. Una riga e' "di accordi" quando quasi tutti i
// suoi gettoni sono sigle valide; le stanghette | quando ci sono dividono le
// battute, altrimenti ogni accordo vale una battuta.

import { parseChord } from './theory.js';

const SEZIONE_RE = /^\s*\[?\s*(intro|verse|verso|chorus|ritornello|bridge|ponte|solo|outro|coda|interlude|pre-chorus|strofa)\b[^\]]*\]?\s*:?\s*$/i;

function pulisci(tok) {
  return tok.replace(/^[([]+|[)\],.]+$/g, '').replace(/^N\.?C\.?$/i, 'N.C.');
}

function eAccordo(tok) {
  if (!tok || tok === '|') return false;
  if (tok === 'N.C.') return true;
  if (/^x\d+$/i.test(tok) || /^\(?x\d+\)?$/i.test(tok)) return false;
  return !!parseChord(tok);
}

/** Una riga di soli accordi (e stanghette)? */
function rigaDiAccordi(riga) {
  const toks = riga.trim().split(/\s+/).map(pulisci).filter(Boolean);
  if (!toks.length) return null;
  const buoni = toks.filter(x => x === '|' || eAccordo(x));
  const accordi = toks.filter(eAccordo);
  if (!accordi.length) return null;
  if (buoni.length / toks.length < 0.7) return null;
  return toks.filter(x => x === '|' || eAccordo(x));
}

/** Dai gettoni di una riga alle battute: le | dividono, altrimenti uno a battuta. */
function inBattute(toks) {
  const bars = [];
  if (toks.includes('|')) {
    let cur = [];
    toks.forEach(x => {
      if (x === '|') { if (cur.length) bars.push(cur); cur = []; }
      else cur.push(x);
    });
    if (cur.length) bars.push(cur);
  } else {
    toks.forEach(x => bars.push([x]));
  }
  return bars.map(acc => ({ accordi: acc.filter(a => a !== 'N.C.'), metro: '' }));
}

/** ChordPro: direttive {..} e accordi [..] dentro il testo. */
function daChordPro(testo) {
  const dir = (nome) => {
    const m = testo.match(new RegExp('\\{\\s*(?:' + nome + ')\\s*:\\s*([^}]*)\\}', 'i'));
    return m ? m[1].trim() : '';
  };
  const title = dir('title|t');
  const composer = dir('artist|subtitle|st|composer');
  const bpm = +dir('tempo') || 0;
  const bars = [];
  for (const riga of testo.split(/\r?\n/)) {
    if (/^\s*#/.test(riga)) continue;
    const corpo = riga.replace(/\{[^}]*\}/g, '');
    const toks = [...corpo.matchAll(/\[([^\]]+)\]/g)].map(m => pulisci(m[1])).filter(eAccordo);
    if (toks.length) inBattute(toks).forEach(b => bars.push(b));
  }
  if (!bars.length) return [];
  return [{ title: title || 'senza titolo', composer, key: '', bpm, bars }];
}

/** Testo con gli accordi sopra le parole: prima riga titolo, seconda autore. */
function daTestoNudo(testo) {
  const righe = testo.split(/\r?\n/);
  const bars = [];
  const intestazione = [];
  for (const riga of righe) {
    if (!riga.trim()) continue;
    if (SEZIONE_RE.test(riga)) continue;
    const toks = rigaDiAccordi(riga);
    if (toks) { inBattute(toks).forEach(b => bars.push(b)); continue; }
    // riga di parole: le prime due non-accordi fanno da titolo e autore
    if (intestazione.length < 2 && !bars.length && riga.trim().length < 80) {
      intestazione.push(riga.trim());
    }
  }
  if (bars.length < 2) return [];
  return [{
    title: intestazione[0] || 'senza titolo',
    composer: intestazione[1] || '',
    key: '', bpm: 0, bars
  }];
}

/**
 * Indovina titolo e autore dal titolo di una pagina web:
 * "Song Chords by Artist @ Sito", "Artist - Song Chords", "Song - Artist" e simili.
 */
export function indovinaTitolo(t) {
  if (!t) return { title: '', composer: '' };
  t = t.replace(/\s*[@|\u2014].*$/, '').replace(/\s*\(ver\s*\d+\)\s*/i, ' ').trim();
  let m = t.match(/^(.+?)\s+(?:chords|tab|accordi|cifra)\s+by\s+(.+)$/i);
  if (m) return { title: m[1].trim(), composer: m[2].trim() };
  m = t.match(/^(.+?)\s*[-\u2013]\s*(.+?)\s+(?:chords|accordi|cifra(?:\s+club)?)\s*$/i);
  if (m) return { title: m[2].trim(), composer: m[1].trim() };
  m = t.match(/^(.+?)\s+(?:chords|accordi)\s*[-\u2013]\s*(.+)$/i);
  if (m) return { title: m[1].trim(), composer: m[2].trim() };
  m = t.match(/^(.+?)\s*[-\u2013]\s*(.+)$/);
  if (m) return { title: m[2].replace(/\s+(chords|accordi)$/i, '').trim(), composer: m[1].trim() };
  return { title: t.replace(/\s+(chords|accordi)$/i, '').trim(), composer: '' };
}

/** Il punto d'ingresso: riconosce ChordPro dai suoi segni, altrimenti testo nudo. */
export function parse(testo) {
  if (!testo || !testo.trim()) return [];
  const cp = /\{\s*(title|t|artist|subtitle|start_of_|comment)/i.test(testo) || /\[[A-G][^\]]*\]\w/.test(testo);
  const songs = cp ? daChordPro(testo) : [];
  return songs.length ? songs : daTestoNudo(testo);
}
