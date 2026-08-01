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
  const PT = 30, PB = 34, ROW = 46, W = 820, NUT = 76, BW = W - NUT - 14;
  const H = PT + ROW * (open.length - 1) + PB;
  const fx = f => NUT + (fretPos(f) / fretPos(frets)) * BW;
  const cx = f => (f === 0 ? NUT - 21 : (fx(f - 1) + fx(f)) / 2);
  const sy = r => PT + r * ROW;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect x="${NUT}" y="${PT - 17}" width="${BW}" height="${ROW * (open.length - 1) + 34}" rx="5" fill="var(--wood)"/>`;

  const zx1 = zoneFrom === 0 ? NUT - 34 : fx(zoneFrom - 1);
  s += `<rect x="${zx1}" y="${PT - 21}" width="${fx(zoneTo) - zx1}" height="${ROW * (open.length - 1) + 42}" rx="6" fill="var(--root)" opacity=".10" stroke="var(--root)" stroke-opacity=".35"/>`;
  s += `<rect x="${NUT - 5}" y="${PT - 17}" width="5" height="${ROW * (open.length - 1) + 34}" fill="var(--nut)" opacity=".85"/>`;

  for (let f = 1; f <= frets; f++)
    s += `<line x1="${fx(f)}" y1="${PT - 17}" x2="${fx(f)}" y2="${PT + ROW * (open.length - 1) + 17}" stroke="var(--fretwire)" stroke-width="${f < 6 ? 2.4 : 1.7}" opacity=".6"/>`;

  const my = PT + ROW * (open.length - 1) / 2;
  DOTS.filter(d => d <= frets).forEach(d => {
    s += d % 12 === 0
      ? `<circle cx="${cx(d)}" cy="${my - 15}" r="5" fill="var(--inlay)"/><circle cx="${cx(d)}" cy="${my + 15}" r="5" fill="var(--inlay)"/>`
      : `<circle cx="${cx(d)}" cy="${my}" r="5" fill="var(--inlay)"/>`;
  });

  ord.forEach((si, row) => {
    const y = sy(row);
    s += `<line x1="${NUT - 44}" y1="${y}" x2="${fx(frets)}" y2="${y}" stroke="var(--string)" stroke-width="${1.2 + (open.length - 1 - si) * 0.7}" opacity=".55"/>`;
    s += `<text x="10" y="${y + 5}" fill="var(--faint)" font-size="14" font-family="${MONO}">${SHARP[open[si] % 12]}</text>`;
  });

  for (let f = 0; f <= frets; f++) {
    const inZone = f >= zoneFrom && f <= zoneTo;
    s += `<text x="${cx(f)}" y="${H - 11}" text-anchor="middle" font-size="13" font-family="${MONO}" fill="${inZone ? 'var(--root)' : 'var(--faint)'}">${f}</text>`;
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
        s += `<g opacity="${op}" style="cursor:pointer" data-midi="${midi}" data-pos="${si}:${f}" class="note">`
          + `<circle cx="${x}" cy="${y}" r="16" fill="${col}"/>`
          + (picked ? `<circle cx="${x}" cy="${y}" r="20.5" fill="none" stroke="${col}" stroke-width="1.8"/>` : '')
          + `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="${text.length > 2 ? 12 : 14}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text></g>`;
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
  const PL = 20, PT = 17, PB = 19, ROW = 23, CW = 32;
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
    s += `<line x1="${PL - 6}" y1="${y}" x2="${PL + CW * n}" y2="${y}" stroke="var(--string)" stroke-width="1" opacity=".35"/>`;
  });
  for (let f = zoneFrom; f <= zoneTo; f++)
    s += `<text x="${cx(f)}" y="${H - 5}" text-anchor="middle" font-size="9" font-family="${MONO}" fill="var(--faint)">${f}</text>`;

  voicing.shape.forEach((note, i) => {
    const row = ord.indexOf(note.si);
    if (row < 0) return;
    const x = cx(note.f), y = sy(row), text = degreeName(note.iv, chord);
    s += `<g class="note" data-pos="${note.si}:${note.f}">`
      + `<circle cx="${x}" cy="${y}" r="10.5" fill="${degreeColor(note.iv)}"/>`
      + `<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${text.length > 2 ? 7.5 : 9}" font-weight="600" font-family="${MONO}" fill="#1A1512">${text}</text></g>`;
    if (!voicing.block)
      s += `<text x="${x}" y="${y - 13}" text-anchor="middle" font-size="8" font-family="${MONO}" fill="var(--faint)">${i + 1}</text>`;
  });
  return s + '</svg>';
}
