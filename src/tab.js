// Esportazione in tab ASCII.

import { SHARP } from './theory.js';
import { stringOrder } from './render.js';

/**
 * bars: [{ label: string[], columns: [{si, f}], block: boolean }]
 * Un voicing "block" viene scritto come colonna unica, le note in verticale.
 */
export function render(bars, open, flipped, perLine, header) {
  const ord = stringOrder(open.length, flipped);
  const names = ord.map(si => (SHARP[open[si] % 12] + '  ').slice(0, 2));
  const lines = [];

  for (let start = 0; start < bars.length; start += perLine) {
    const chunk = bars.slice(start, start + perLine);
    let head = '   ';
    const rows = ord.map((_, r) => names[r] + '|');

    chunk.forEach(bar => {
      const cells = bar.block ? groupBlocks(bar.columns) : bar.columns.map(c => [c]);
      let w = 3;
      cells.forEach(cell => cell.forEach(c => {
        w = Math.max(w, String(c.f).length + (c.pass ? 4 : 2));
      }));

      const label = bar.label.join(' ');
      // La battuta non e' mai piu' stretta della sua etichetta.
      const filler = Math.max(0, label.length + 1 - (cells.length * w + 3));
      const width = cells.length * w + 3 + filler;
      head += label + ' '.repeat(Math.max(1, width - label.length));

      ord.forEach((si, r) => {
        let line = '-';
        cells.forEach(cell => {
          const hit = cell.find(c => c.si === si);
          const text = hit ? (hit.pass ? '(' + hit.f + ')' : String(hit.f)) : '';
          const pad = w - text.length, left = Math.floor(pad / 2);
          line += '-'.repeat(left) + text + '-'.repeat(pad - left);
        });
        rows[r] += line + '-'.repeat(filler) + '-|';
      });
    });

    lines.push(head.replace(/\s+$/, ''));
    rows.forEach(r => lines.push(r));
    lines.push('');
  }
  return header + '\n\n' + lines.join('\n');
}

/** Le note di uno stesso voicing a blocchi vanno impilate nella stessa colonna. */
function groupBlocks(columns) {
  const out = [];
  let cur = [];
  columns.forEach(c => {
    if (c.newGroup && cur.length) { out.push(cur); cur = []; }
    cur.push(c);
  });
  if (cur.length) out.push(cur);
  return out;
}
