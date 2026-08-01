// Disegno del manico e dei diagrammi di posizione.

import { SHARP, degreeName, degreeColor, noteName, fretPos } from './theory.js';

const MONO = 'JetBrains Mono,monospace';
const DOTS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

/** Ordine di disegno delle corde: di norma la piu' acuta in alto, come nelle tab. */
export function stringOrder(count, flipped) {
  const idx = Array.from({ length: count }, (_, i) => i);
  return flipped ? idx : idx.reverse();
}

export function fretboard(opts) {
  const { chord, open, zoneFrom, zoneTo, frets, labels, flipped, dimOutside } = opts;
  const ord = stringOrder(open.length, flipped);
  const PT = 26, PB = 30, ROW = 34, W = 980, NUT = 82, BW = W - NUT - 16;
  const H = PT + ROW * (open.length - 1) + PB;
  const fx = f => NUT + (fretPos(f) / fretPos(frets)) * BW;
  const cx = f => (f === 0 ? NUT - 17 : (fx(f - 1) + fx(f)) / 2);
  const sy = r => PT + r * ROW;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect x="${NUT}" y="${PT - 13}" width="${BW}" height="${ROW * (open.length - 1) + 26}" rx="4" fill="var(--wood)"/>`;

  const zx1 = zoneFrom === 0 ? NUT - 34 : fx(zoneFrom - 1);
  s += `<rect x="${zx1}" y="${PT - 16}" width="${fx(zoneTo) - zx1}" height="${ROW * (open.length - 1) + 32}" rx="5" fill="var(--root)" opacity=".10" stroke="var(--root)" stroke-opacity=".35"/>`;
  s += `<rect x="${NUT - 4}" y="${PT - 13}" width="4" height="${ROW * (open.length - 1) + 26}" fill="var(--paper)" opacity=".72"/>`;

  for (let f = 1; f <= frets; f++)
    s += `<line x1="${fx(f)}" y1="${PT - 13}" x2="${fx(f)}" y2="${PT + ROW * (open.length - 1) + 13}" stroke="var(--fretwire)" stroke-width="${f < 6 ? 2 : 1.4}" opacity=".55"/>`;

  const my = PT + ROW * (open.length - 1) / 2;
  DOTS.filter(d => d <= frets).forEach(d => {
    s += d % 12 === 0
      ? `<circle cx="${cx(d)}" cy="${my - 11}" r="4" fill="var(--inlay)"/><circle cx="${cx(d)}" cy="${my + 11}" r="4" fill="var(--inlay)"/>`
      : `<circle cx="${cx(d)}" cy="${my}" r="4" fill="var(--inlay)"/>`;
  });

  ord.forEach((si, row) => {
    const y = sy(row);
    s += `<line x1="${NUT - 38}" y1="${y}" x2="${fx(frets)}" y2="${y}" stroke="#B9B2A6" stroke-width="${1 + (open.length - 1 - si) * 0.55}" opacity=".5"/>`;
    s += `<text x="14" y="${y + 4}" fill="var(--faint)" font-size="12" font-family="${MONO}">${SHARP[open[si] % 12]}</text>`;
  });

  for (let f = 0; f <= frets; f++) {
    const inZone = f >= zoneFrom && f <= zoneTo;
    s += `<text x="${cx(f)}" y="${H - 10}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="${inZone ? 'var(--root)' : 'var(--faint)'}">${f}</text>`;
  }

  if (chord) {
    const inShape = new Set((opts.highlight || []).map(n => n.si + ':' + n.f));
    ord.forEach((si, row) => {
      for (let f = 0; f <= frets; f++) {
        const midi = open[si] + f;
        const iv = chord.pcMap[midi % 12];
        if (iv === undefined) continue;
        const inZone = f >= zoneFrom && f <= zoneTo;
        if (!inZone && !dimOutside) continue;
        const picked = inShape.has(si + ':' + f);
        const x = cx(f), y = sy(row);
        const text = labels === 'degrees' ? degreeName(iv, chord) : noteName(midi % 12, chord.flats);
        const col = degreeColor(iv);
        const op = picked ? 1 : (inZone ? 0.4 : 0.13);
        s += `<g opacity="${op}" style="cursor:pointer" data-midi="${midi}" class="note">`
          + `<circle cx="${x}" cy="${y}" r="12.5" fill="${col}"/>`
          + (picked ? `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${col}" stroke-width="1.5"/>` : '')
          + `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${text.length > 2 ? 9.5 : 11}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text></g>`;
      }
    });
  }
  return s + '</svg>';
}

/** Diagramma piccolo della sola zona, con le note del voicing. */
export function diagram(chord, voicing, opts) {
  const { open, zoneFrom, zoneTo, flipped } = opts;
  const ord = stringOrder(open.length, flipped);
  const n = zoneTo - zoneFrom + 1;
  const PL = 20, PT = 16, PB = 18, ROW = 21, CW = 30;
  const W = PL + CW * n + 10, H = PT + ROW * (open.length - 1) + PB;
  const cx = f => PL + CW * (f - zoneFrom) + CW / 2;
  const sy = r => PT + r * ROW;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for (let f = zoneFrom; f <= zoneTo + 1; f++) {
    const x = PL + CW * (f - zoneFrom);
    s += `<line x1="${x}" y1="${PT - 7}" x2="${x}" y2="${PT + ROW * (open.length - 1) + 7}" stroke="var(--fretwire)" stroke-width="${f === 0 ? 3 : 1}" opacity="${f === 0 ? 0.8 : 0.35}"/>`;
  }
  ord.forEach((si, row) => {
    const y = sy(row);
    s += `<line x1="${PL - 6}" y1="${y}" x2="${PL + CW * n}" y2="${y}" stroke="#B9B2A6" stroke-width="1" opacity=".35"/>`;
  });
  for (let f = zoneFrom; f <= zoneTo; f++)
    s += `<text x="${cx(f)}" y="${H - 5}" text-anchor="middle" font-size="9" font-family="${MONO}" fill="var(--faint)">${f}</text>`;

  voicing.shape.forEach((note, i) => {
    const row = ord.indexOf(note.si);
    if (row < 0) return;
    const x = cx(note.f), y = sy(row), text = degreeName(note.iv, chord);
    s += `<circle cx="${x}" cy="${y}" r="9.5" fill="${degreeColor(note.iv)}"/>`
      + `<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${text.length > 2 ? 7.5 : 9}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text>`;
    if (!voicing.block)
      s += `<text x="${x}" y="${y - 13}" text-anchor="middle" font-size="8" font-family="${MONO}" fill="var(--faint)">${i + 1}</text>`;
  });
  return s + '</svg>';
}
