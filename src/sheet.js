(function initManicoSheet(root) {
  'use strict';

  // Writes a part out for other programs and for paper: MusicXML, which Guitar Pro, MuseScore
  // and TuxGuitar open, and a PDF to print. Both are those of C_bass (internal/export).

  const Core = root.ManicoCore;
  const Rhythm = root.ManicoRhythm;
  const Chords = root.ManicoChords;
  const DIVISION = Rhythm.DIVISION;

  /**
   * The part laid out in bars, ready to be written one way or another: for each bar its number
   * (counted from 0, negative for a pickup), its length in beats, its symbols, the chords that
   * start in it with the sixteenth they start on, and the name of the section that starts with it.
   */
  function layout(track, rhythm) {
    const events = track.events || [];
    const { bars: written } = Rhythm.notate(rhythm, events);
    const shift = Rhythm.calibrate(rhythm, events);
    let first = 0;
    let last = 0;
    for (const bar of written.keys()) { first = Math.min(first, bar); last = Math.max(last, bar); }
    const harmony = new Map();
    for (const chord of track.chords || []) {
      const at = Math.round((Rhythm.positionOf(rhythm, chord.start) - shift) * DIVISION);
      const bar = Rhythm.barAt(rhythm, at / DIVISION);
      if (!harmony.has(bar)) harmony.set(bar, []);
      harmony.get(bar).push({ slot: at - Rhythm.barStart(rhythm, bar) * DIVISION, chord });
      first = Math.min(first, bar);
      last = Math.max(last, bar);
    }
    const starting = new Map();
    for (const section of track.sections || []) {
      const bar = Rhythm.barAt(rhythm, Rhythm.positionOf(rhythm, section.start + 0.01) - shift + 1e-6);
      starting.set(bar, section.name || section.kind);
      first = Math.min(first, bar);
      last = Math.max(last, bar);
    }
    const bars = [];
    for (let index = first; index <= last; index += 1) {
      const beats = Rhythm.beatsIn(rhythm, index);
      let symbols = written.get(index) || [];
      // a bar with nothing in it is a bar of rest
      if (!symbols.length) symbols = Rhythm.splitValues(0, beats * DIVISION, beats * DIVISION, true).map(piece => ({ slot: piece.slot, value: piece.value, rest: true }));
      const chords = (harmony.get(index) || []).sort((left, right) => left.slot - right.slot);
      bars.push({ index, beats, symbols, chords, section: starting.get(index) || '' });
    }
    return { bars, tuning: Core.TUNINGS[track.settings?.tuning] || Core.TUNINGS['4'], tempo: Rhythm.tempoOf(rhythm) };
  }

  /** Whether the note of a sign is carried on by the next sign. */
  function continues(bars, b, i) {
    const symbols = bars[b].symbols;
    const current = symbols[i];
    if (i + 1 < symbols.length) return Boolean(symbols[i + 1].tied) && symbols[i + 1].index === current.index;
    if (b + 1 < bars.length && bars[b + 1].symbols.length) {
      const next = bars[b + 1].symbols[0];
      return Boolean(next.tied) && next.index === current.index;
    }
    return false;
  }

  const VALUE_TYPES = { 16: ['whole', false], 12: ['half', true], 8: ['half', false], 6: ['quarter', true], 4: ['quarter', false], 3: ['eighth', true], 2: ['eighth', false], 1: ['16th', false] };
  const STEPS = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
  const FLATS = { 3: 'E', 8: 'A', 10: 'B' }; // chords are written Bb, Eb, Ab
  const KINDS = { '': 'major', m: 'minor', 7: 'dominant', m7: 'minor-seventh', maj7: 'major-seventh' };
  const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const playable = (event, strings) => Number.isInteger(event.string) && event.string >= 0 && event.string < strings;

  /** The part as a tablature staff with its chords, in MusicXML 4.0. */
  function musicXML(track, rhythm) {
    const part = layout(track, rhythm);
    const out = [];
    const w = line => out.push(line);
    w('<?xml version="1.0" encoding="UTF-8"?>');
    w('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">');
    w('<score-partwise version="4.0">');
    w(`  <work><work-title>${escape(track.title || '')}</work-title></work>`);
    w('  <identification><encoding><software>Manico</software></encoding></identification>');
    w('  <part-list><score-part id="P1"><part-name>Bass</part-name></score-part></part-list>');
    w('  <part id="P1">');
    const open = part.tuning.open;
    const strings = open.length;
    let beats = 0;
    part.bars.forEach((bar, b) => {
      w(bar.index < 0 ? '    <measure number="0" implicit="yes">' : `    <measure number="${bar.index + 1}">`);
      if (b === 0 || bar.beats !== beats) {
        w('      <attributes>');
        if (b === 0) {
          w(`        <divisions>${DIVISION}</divisions>`);
          w('        <key><fifths>0</fifths></key>');
        }
        w(`        <time><beats>${bar.beats}</beats><beat-type>4</beat-type></time>`);
        if (b === 0) {
          w('        <clef><sign>TAB</sign><line>5</line></clef>');
          w(`        <staff-details><staff-lines>${strings}</staff-lines>`);
          open.forEach((midi, line) => {
            const [step, alter] = STEPS[midi % 12];
            w(`          <staff-tuning line="${line + 1}"><tuning-step>${step}</tuning-step>${alter ? `<tuning-alter>${alter}</tuning-alter>` : ''}<tuning-octave>${Math.floor(midi / 12) - 1}</tuning-octave></staff-tuning>`);
          });
          w('        </staff-details>');
        }
        w('      </attributes>');
        beats = bar.beats;
      }
      if (b === 0) {
        const tempo = Math.round(part.tempo);
        w(`      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`);
      }
      if (bar.section) w(`      <direction placement="above"><direction-type><rehearsal>${escape(bar.section)}</rehearsal></direction-type></direction>`);
      for (const { slot, chord } of bar.chords) {
        const pitchClass = ((chord.root % 12) + 12) % 12;
        let [step, alter] = STEPS[pitchClass];
        if (FLATS[pitchClass]) { step = FLATS[pitchClass]; alter = -1; }
        w(`      <harmony><root><root-step>${step}</root-step>${alter ? `<root-alter>${alter}</root-alter>` : ''}</root><kind text="${chord.quality}">${KINDS[chord.quality] || 'major'}</kind>${slot > 0 ? `<offset>${slot}</offset>` : ''}</harmony>`);
      }
      bar.symbols.forEach((symbol, i) => {
        const [type, dotted] = VALUE_TYPES[symbol.value];
        const dot = dotted ? '<dot/>' : '';
        if (symbol.rest) {
          w(`      <note><rest/><duration>${symbol.value}</duration><voice>1</voice><type>${type}</type>${dot}</note>`);
          return;
        }
        const event = track.events[symbol.index];
        const [step, alter] = STEPS[((event.midi % 12) + 12) % 12];
        let ties = '';
        let tied = '';
        if (symbol.tied) { ties = '<tie type="stop"/>'; tied = '<tied type="stop"/>'; }
        if (continues(part.bars, b, i)) { ties += '<tie type="start"/>'; tied += '<tied type="start"/>'; }
        // MusicXML counts the strings from the highest
        const technical = playable(event, strings) ? `<technical><string>${strings - event.string}</string><fret>${event.fret}</fret></technical>` : '';
        const notations = tied || technical ? `<notations>${tied}${technical}</notations>` : '';
        w(`      <note><pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${Math.floor(event.midi / 12) - 1}</octave></pitch><duration>${symbol.value}</duration>${ties}<voice>1</voice><type>${type}</type>${dot}${notations}</note>`);
      });
      w('    </measure>');
    });
    w('  </part>');
    w('</score-partwise>');
    return `${out.join('\n')}\n`;
  }

  // --- PDF: pages of lines and text, in points from the top left corner of an A4 sheet ---

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 42;
  const n = value => value.toFixed(2);

  /** Text as the standard fonts understand it: Latin letters, accents included. */
  function encode(text) {
    let out = '';
    for (const char of String(text)) {
      const code = char.codePointAt(0);
      if (char === '(' || char === ')' || char === '\\') out += `\\${char}`;
      else if (code >= 32 && code < 127) out += char;
      else if (code >= 160 && code <= 255) out += `\\${code.toString(8).padStart(3, '0')}`;
      else if (char === '·') out += '\\267';
      else if (char === '–' || char === '—') out += '-';
      else if (char === '’' || char === '‘') out += "'";
      else out += '?';
    }
    return out;
  }

  /** The width of a line of text in Helvetica, near enough for placing it. */
  function widthOf(text, size) {
    let units = 0;
    for (const char of String(text)) {
      if (char >= '0' && char <= '9') units += 556;
      else if (char === '(' || char === ')' || char === ' ') units += 333;
      else units += 580;
    }
    return units * size / 1000;
  }

  function sheet() {
    const pages = [];
    let page = null;
    return {
      pages,
      newPage() { page = []; pages.push(page); },
      use(index) { page = pages[index]; },
      line(x0, y0, x1, y1, width, grey) { page.push(`${n(width)} w ${n(grey)} G ${n(x0)} ${n(PAGE_HEIGHT - y0)} m ${n(x1)} ${n(PAGE_HEIGHT - y1)} l S`); },
      fill(x, y, w, h, grey) { page.push(`${n(grey)} g ${n(x)} ${n(PAGE_HEIGHT - y - h)} ${n(w)} ${n(h)} re f`); },
      dot(x, y, r) { this.fill(x - r, y - r, 2 * r, 2 * r, 0); },
      // a shallow arc from one point to another, hanging below them: a tie
      curve(x0, x1, y, drop) {
        page.push(`0.6 w 0 G ${n(x0)} ${n(PAGE_HEIGHT - y)} m ${n(x0 + (x1 - x0) * 0.25)} ${n(PAGE_HEIGHT - y - drop)} ${n(x0 + (x1 - x0) * 0.75)} ${n(PAGE_HEIGHT - y - drop)} ${n(x1)} ${n(PAGE_HEIGHT - y)} c S`);
      },
      // align is -1 for starting at x, 0 for centred on it, 1 for ending there
      text(text, x, y, size, bold, grey, align) {
        let at = x;
        if (align === 0) at -= widthOf(text, size) / 2;
        else if (align === 1) at -= widthOf(text, size);
        page.push(`BT ${n(grey)} g /${bold ? 'F2' : 'F1'} ${size.toFixed(1)} Tf ${n(at)} ${n(PAGE_HEIGHT - y)} Td (${encode(text)}) Tj ET`);
      },
      /** The pages put together as a PDF file: every character of it is one byte. */
      bytes() {
        let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
        const offsets = [];
        const object = body => { offsets.push(out.length); out += `${offsets.length} 0 obj\n${body}\nendobj\n`; };
        object('<< /Type /Catalog /Pages 2 0 R >>');
        object(`<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + 2 * i} 0 R`).join(' ')}] /Count ${pages.length} >>`);
        object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        pages.forEach((content, i) => {
          object(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`);
          const stream = `${content.join('\n')}\n`;
          object(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
        });
        const start = out.length;
        out += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
        for (const offset of offsets) out += `${String(offset).padStart(10, '0')} 00000 n \n`;
        out += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
        return Uint8Array.from(out, char => char.charCodeAt(0) & 0xff);
      }
    };
  }

  /** The part on A4 paper: the tablature, the value of every note under it, the chords above, a few bars to a line. */
  function pdf(track, rhythm) {
    const part = layout(track, rhythm);
    const open = part.tuning.open;
    const strings = open.length;
    const names = open.map(midi => Core.noteName(midi).replace(/-?\d+$/, ''));
    const gutter = 20; // for the names of the strings
    const slot = 6.6; // a sixteenth
    const padding = 9; // from a bar line to the first note of its bar
    const spacing = 9; // between two strings
    const above = 20; // for chords and bar numbers
    const below = 30; // for the values
    const between = 16;
    const usable = PAGE_WIDTH - 2 * MARGIN - gutter;
    const fretSize = 8.5;
    const staff = (strings - 1) * spacing;
    const system = above + staff + below + between;
    const natural = bar => bar.beats * DIVISION * slot + padding;

    const s = sheet();
    s.newPage();
    s.text(track.title || '', MARGIN, MARGIN + 14, 18, true, 0, -1);
    s.text(`${names.join(' ')}  ·  ${Math.round(part.tempo)} BPM`, MARGIN, MARGIN + 30, 10, false, 0.35, -1);
    let y = MARGIN + 52;
    for (let from = 0; from < part.bars.length;) {
      // as many bars as fit on the line
      let to = from;
      let used = 0;
      while (to < part.bars.length && (to === from || used + natural(part.bars[to]) <= usable)) { used += natural(part.bars[to]); to += 1; }
      let stretch = usable / used;
      if (to === part.bars.length && stretch > 1.6) stretch = 1; // a short last line is left short
      if (y + system - between > PAGE_HEIGHT - MARGIN - 14) { s.newPage(); y = MARGIN; }
      const top = y + above;
      let x = MARGIN + gutter;
      for (let string = 0; string < strings; string += 1) {
        const lineY = top + staff - string * spacing;
        s.line(x, lineY, x + used * stretch, lineY, 0.5, 0.55);
        s.text(names[string], MARGIN + gutter - 6, lineY + 2.6, 7.5, false, 0.35, 1);
      }
      s.line(x, top, x, top + staff, 0.9, 0);
      for (let b = from; b < to; b += 1) {
        const bar = part.bars[b];
        const start = x;
        const at = slotInBar => start + (padding + slotInBar * slot) * stretch;
        if (bar.index >= 0) s.text(String(bar.index + 1), x + 2, top - 2.5, 6, false, 0.45, -1);
        let after = x + 12;
        if (b > 0 && bar.beats !== part.bars[b - 1].beats) { // the metre changes here: say so
          s.text(`${bar.beats}/4`, after, top - 2.5, 6, true, 0.2, -1);
          after += 14;
        }
        if (bar.section) s.text(bar.section.toUpperCase(), after, top - 2.5, 6.5, true, 0, -1);
        for (const { slot: place, chord } of bar.chords) s.text(Chords.nameOf(chord), at(place) - 3, top - 10, 9.5, true, 0, -1);
        const bottom = top + staff;
        const stemTop = bottom + 7;
        const stemBottom = bottom + 21;
        const short = v => !v.rest && v.value < DIVISION;
        const joined = (a, c) => short(a) && short(c) && Math.floor(a.slot / DIVISION) === Math.floor(c.slot / DIVISION) && a.slot + a.value === c.slot;
        bar.symbols.forEach((symbol, i) => {
          if (symbol.rest) return;
          const sx = at(symbol.slot);
          const event = track.events[symbol.index];
          if (playable(event, strings) && (!symbol.tied || symbol.slot === 0)) {
            const label = symbol.tied ? `(${event.fret})` : String(event.fret);
            const lineY = top + staff - event.string * spacing;
            const half = widthOf(label, fretSize) / 2 + 1;
            s.fill(sx - half, lineY - 4.5, 2 * half, 9, 1);
            s.text(label, sx, lineY + 3, fretSize, true, 0, 0);
          }
          // the value: a stem, shorter for a half note, none for a whole one
          if (symbol.tied && i > 0) s.curve(at(bar.symbols[i - 1].slot) + 1, sx - 1, stemBottom + 3, 3.5);
          if (symbol.value >= 16) return;
          if (symbol.value >= 8) s.line(sx, stemTop + 7, sx, stemBottom, 0.8, 0);
          else s.line(sx, stemTop, sx, stemBottom, 0.8, 0);
          if (symbol.value % 3 === 0) s.dot(sx + 3, stemTop + 4, 0.9);
          if (symbol.value >= DIVISION) return;
          const before = i > 0 && joined(bar.symbols[i - 1], symbol);
          const next = i + 1 < bar.symbols.length && joined(symbol, bar.symbols[i + 1]);
          const sixteenth = symbol.value === 1;
          if (next) {
            const nx = at(bar.symbols[i + 1].slot);
            s.fill(sx - 0.4, stemBottom - 1.8, nx - sx + 0.8, 1.8, 0);
            if (sixteenth && bar.symbols[i + 1].value === 1) s.fill(sx - 0.4, stemBottom - 5.2, nx - sx + 0.8, 1.8, 0);
            else if (sixteenth && !before) s.fill(sx, stemBottom - 5.2, 4.5, 1.8, 0);
          } else if (before) {
            if (sixteenth && bar.symbols[i - 1].value !== 1) s.fill(sx - 4.5, stemBottom - 5.2, 4.5, 1.8, 0);
          } else {
            s.line(sx, stemBottom, sx + 4, stemBottom - 5, 1, 0);
            if (sixteenth) s.line(sx, stemBottom - 3.5, sx + 4, stemBottom - 8.5, 1, 0);
          }
        });
        x += natural(bar) * stretch;
        s.line(x, top, x, top + staff, 0.9, 0);
      }
      y += system;
      from = to;
    }
    s.pages.forEach((_, i) => {
      s.use(i);
      s.text('Manico', MARGIN, PAGE_HEIGHT - MARGIN + 14, 7, false, 0.5, -1);
      s.text(`${i + 1} / ${s.pages.length}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - MARGIN + 14, 7, false, 0.5, 1);
    });
    return s.bytes();
  }

  root.ManicoSheet = { layout, musicXML, pdf };
})(globalThis);
