// Lettura di file MusicXML (in chiaro, .musicxml o .xml non compressi), come
// quelli esportati da iReal Pro o MuseScore. Gli accordi vivono negli elementi
// <harmony>; i segni di forma (ritornelli, finali, segno, coda, D.C./D.S., Fine)
// sono espliciti e vengono srotolati dallo stesso espansore dei link iReal.
//
// Il parser e' testuale e senza dipendenze: funziona identico nel browser e in
// Node, ed e' collaudato contro gli export reali dell'app (vedi src/forma.js).

import { espandi } from './forma.js';

const VOLTE_RE = /(?:^|[^0-9a-z])(\d+)x(?![a-z])/i;

// Sigla dalla qualita', quando manca l'attributo text sul <kind>.
const KINDS = { 'major': '', 'minor': 'm', 'dominant': '7', 'major-seventh': 'maj7',
  'minor-seventh': 'm7', 'diminished': 'o', 'diminished-seventh': 'o7',
  'half-diminished': 'm7b5', 'augmented': '+', 'suspended-fourth': 'sus',
  'suspended-second': 'sus2', 'major-sixth': '6', 'minor-sixth': 'm6',
  'dominant-ninth': '9', 'minor-ninth': 'm9', 'major-ninth': 'maj9',
  'minor-11th': 'm11', 'dominant-11th': '11', 'dominant-13th': '13',
  'minor-13th': 'm13', 'minor-major': 'mmaj7', 'power': '5' };

const acc = a => a === '1' ? '#' : a === '-1' ? 'b' : '';

function sigla(harm) {
  const passo = (harm.match(/<root-step>([A-G])<\/root-step>/) || [])[1];
  if (!passo) return null;
  const ralter = (harm.match(/<root-alter>(-?\d)<\/root-alter>/) || [])[1];
  const kt = (harm.match(/<kind[^>]*text="([^"]*)"/) || [])[1];
  const kn = (harm.match(/<kind[^>]*>([a-z0-9-]+)<\/kind>/) || [, ''])[1];
  let s = passo + acc(ralter) + (kt !== undefined ? kt : (KINDS[kn] !== undefined ? KINDS[kn] : kn));
  for (const d of harm.matchAll(/<degree>[\s\S]*?<\/degree>/g)) {
    const v = (d[0].match(/<degree-value>(\d+)/) || [])[1];
    const al = (d[0].match(/<degree-alter>(-?\d)/) || [])[1];
    s += (al === '1' ? '#' : al === '-1' ? 'b' : '') + v;
  }
  const bp = (harm.match(/<bass-step>([A-G])<\/bass-step>/) || [])[1];
  const ba = (harm.match(/<bass-alter>(-?\d)<\/bass-alter>/) || [])[1];
  if (bp) s += '/' + bp + acc(ba);
  return s;
}

/** Le misure scritte di uno spartito, con i segni di forma. */
export function leggiMisure(xml) {
  const misure = [];
  let code = 0, metro = '';
  for (const m of xml.matchAll(/<measure[^>]*>([\s\S]*?)<\/measure>/g)) {
    const corpo = m[1];
    const bt = corpo.match(/<beats>(\d+)<\/beats>[\s\S]*?<beat-type>(\d+)<\/beat-type>/);
    if (bt) metro = bt[1] + '/' + bt[2];
    const accordi = [];
    for (const h of corpo.matchAll(/<harmony[\s\S]*?<\/harmony>/g)) {
      const s = sigla(h[0]);
      if (s) accordi.push(s);
    }
    const parole = [...corpo.matchAll(/<words>([^<]*)<\/words>/g)].map(x => x[1]).join(',');
    const bar = {
      accordi, parole, metro,
      apre: /<repeat direction="forward"/.test(corpo),
      chiude: /<repeat direction="backward"/.test(corpo),
      finale: +((corpo.match(/<ending type="start" number="(\d+)"/) || [])[1] || 0),
      dacapo: /dacapo="/.test(corpo),
      dalsegno: /dalsegno="/.test(corpo),
      fine: /fine="yes"/.test(corpo),
      segno: /<segno\/>/.test(corpo)
    };
    if (/<coda\/>/.test(corpo)) { code++; if (code === 1) bar.tocoda = true; else bar.codastart = true; }
    const t = corpo.match(/<repeat[^>]*times="(\d+)"/) || parole.match(VOLTE_RE);
    if (t) bar.volte = +t[1];
    misure.push(bar);
  }
  return misure;
}

/** Da un file MusicXML a un brano con la forma gia' srotolata. */
export function parse(xml) {
  const title = (xml.match(/<work-title>([^<]*)<\/work-title>/) || [, ''])[1].trim();
  const composer = (xml.match(/<creator type="composer">([^<]*)<\/creator>/) || [, ''])[1].trim();
  const misure = leggiMisure(xml);
  if (!misure.length) return [];
  const bars = espandi(misure).map(m => ({ accordi: m.accordi, metro: m.metro }));
  return [{ title: title || 'senza titolo', composer, key: '', bars }];
}
