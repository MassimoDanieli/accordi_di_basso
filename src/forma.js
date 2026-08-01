// La forma musicale: dal corpo iReal alle misure con i segni, e da queste alla
// griglia srotolata come si suona. Ogni regola qui dentro e' stata verificata
// contro l'export MusicXML della stessa app su un banco di cinque brani
// (Alice In Wonderland, Caravan, And The Angels Sing, Butterfly, Blues
// Connotation): 283 misure eseguite, identiche accordo per accordo.
//
// Il vocabolario appreso dal banco:
//   { }        ritornello; la chiusura a battuta gia' chiusa si attacca all'ultima vera
//   N1 N2 N3   finali; la scansione cerca in avanti il numero attivo, scavalcando tutto
//   S          segno (posizione del D.S.)
//   Q          coda: la prima e' il punto di salto, la seconda il bersaglio
//   <testo>    D.C./D.S./Fine/conteggi tipo 3x; si attacca alla battuta del prossimo
//              accordo, o alla battuta chiusa se prima arriva una chiusura
//   Kcl, x     ripeti la battuta precedente
//   p          ribatti l'accordo precedente (le p consecutive collassano)
//   W[/X]      l'accordo precedente, eventualmente con un basso nuovo
//   n          N.C.: nessuna armonia, ma la battuta esiste
//   T##        metro, portato battuta per battuta (anche a meta' brano)

const VOLTE_RE = /(?:^|[^0-9a-z])(\d+)x(?![a-z])/i;
const CHORD_RE = /^([A-G][b#]?)((?:sus|alt|add|[0-9^\-oh+#b])*)(\/[A-G][b#]?)?/;

/** Dal corpo iReal in chiaro alle misure scritte, con i segni di forma. */
export function leggiCorpo(body) {
  body = body.replace(/XyQ/g, ' ');

  const misure = [];
  let metro = '';
  let pending = [], pendingSegno = false, pendingCoda = false, code = 0;
  const nuova = () => ({ accordi: [], parole: '', metro, apre: false, chiude: false,
    finale: 0, dacapo: false, dalsegno: false, fine: false, segno: false, nc: false });
  let cur = nuova();

  const segna = (bar, testo) => {
    if (/D\.C\./i.test(testo)) bar.dacapo = true;
    if (/D\.S\./i.test(testo)) bar.dalsegno = true;
    if (/Fine/i.test(testo) && !/al Fine/i.test(testo)) bar.fine = true;
    const v = testo.match(VOLTE_RE);
    if (v) bar.volte = +v[1];
    bar.parole = bar.parole ? bar.parole + ',' + testo : testo;
  };
  const arriva = () => {
    pending.forEach(t => segna(cur, t)); pending = [];
    if (pendingSegno) { cur.segno = true; pendingSegno = false; }
    if (pendingCoda) { code++; if (code === 1) cur.tocoda = true; else cur.codastart = true; pendingCoda = false; }
  };
  const viva = () => cur.accordi.length > 0 || cur.nc;
  const flush = () => {
    if (viva() || cur.chiude || cur.finale) misure.push(cur);
    cur = nuova();
  };
  const chiusa = () => {
    const meta = viva() ? cur : misure[misure.length - 1];
    if (meta) pending.forEach(t => segna(meta, t));
    pending = [];
  };
  const ultimoAccordo = () => cur.accordi.length ? cur.accordi[cur.accordi.length - 1]
    : (misure.length ? misure[misure.length - 1].accordi.slice(-1)[0] : null);

  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (c === '<') { const k = body.indexOf('>', i); pending.push(body.slice(i + 1, k < 0 ? body.length : k)); i = k < 0 ? body.length : k + 1; continue; }
    if (c === '{') { flush(); cur.apre = true; i++; continue; }
    if (c === '}') {
      chiusa();
      if (viva()) { cur.chiude = true; flush(); }
      else if (misure.length) misure[misure.length - 1].chiude = true;
      i++; continue;
    }
    if (c === 'Z') {
      if (body[i - 1] !== 'L') chiusa();   // la Z finale attacca i segni pendenti; la LZ e' interna
      flush(); i++; continue;
    }
    if (c === '|' || c === ']' || c === '[') { flush(); i++; continue; }
    if (c === 'N' && /\d/.test(body[i + 1])) { flush(); cur.finale = +body[i + 1]; i += 2; continue; }
    if (c === '*') { i += 2; continue; }
    if (c === 'T' && /\d\d/.test(body.slice(i + 1, i + 3))) {
      metro = body[i + 1] + '/' + body[i + 2];
      cur.metro = metro; i += 3; continue;
    }
    if (c === 'S') { if (viva()) cur.segno = true; else pendingSegno = true; i++; continue; }
    if (c === 'Q') {
      if (viva()) { code++; if (code === 1) cur.tocoda = true; else cur.codastart = true; }
      else pendingCoda = true;
      i++; continue;
    }
    if (c === 'n') { arriva(); cur.nc = true; i++; continue; }
    if (c === 'p') {
      const prev = ultimoAccordo();
      if (prev) { arriva(); if (cur.accordi[cur.accordi.length - 1] !== prev) cur.accordi.push(prev); }
      i++; continue;
    }
    if (c === 'W') {
      const m = body.slice(i).match(/^W(\/[A-G][b#]?)?/);
      const prev = ultimoAccordo();
      if (prev) { arriva(); cur.accordi.push(prev.replace(/\/[A-G][b#]?$/, '') + (m[1] || '')); }
      i += m[0].length; continue;
    }
    if (body.slice(i, i + 3) === 'Kcl') {
      const prima = viva() ? cur : misure[misure.length - 1];
      const acc = prima ? [...prima.accordi] : [];
      flush(); cur.accordi = acc; arriva(); flush(); i += 3; continue;
    }
    if (c === 'x') {
      const prima = viva() ? cur : misure[misure.length - 1];
      const acc = prima ? [...prima.accordi] : [];
      if (viva()) flush();
      cur.accordi = acc; arriva(); flush(); i++; continue;
    }
    if (c === 'r') {   // ripeti le due battute precedenti
      const due = misure.slice(-2);
      flush();
      due.forEach(b => { cur.accordi = [...b.accordi]; cur.nc = b.nc; flush(); });
      i++; continue;
    }
    if (' \t\nlsfUY,.L()'.includes(c)) { i++; continue; }
    const m = body.slice(i).match(CHORD_RE);
    if (m && m[0]) { arriva(); cur.accordi.push(m[0]); i += m[0].length; continue; }
    i++;
  }
  chiusa(); flush();
  return misure;
}

/**
 * Srotola la forma come si suona: ritornelli con i loro conteggi, finali anche
 * fuori posto, dal segno al segno, salto alla coda, da capo al Fine o al finale N.
 */
export function espandi(misure) {
  const out = [];
  let i = 0, anchor = 0, dopoDC = false, dopoDS = false, cacciaCoda = false, giri = 0;
  const passes = {};
  const dcBar = misure.find(x => x.dacapo);
  const dcMeta = dcBar ? ((dcBar.parole || '').match(/al (\d)/) || [])[1] : null;
  const dsBar = misure.find(x => x.dalsegno);
  const dsCoda = dsBar && /al Coda/i.test(dsBar.parole || '');
  const segnoI = misure.findIndex(x => x.segno);
  const codaI = misure.findIndex(x => x.codastart);

  while (i < misure.length && giri++ < 2000) {
    const m = misure[i];
    if (m.apre) anchor = i;
    const pass = passes[anchor] || 1;
    const attiva = dopoDC && dcMeta ? +dcMeta : pass;
    if (m.finale && m.finale !== attiva) {
      while (i < misure.length && !misure[i].chiude && !(misure[i].finale && misure[i].finale !== m.finale)) i++;
      if (i < misure.length && misure[i].chiude) i++;
      continue;
    }
    out.push(m);
    if (dopoDC && m.fine) break;
    if (m.tocoda && dopoDS && cacciaCoda && codaI >= 0) { cacciaCoda = false; i = codaI; continue; }
    if (m.chiude && !dopoDC) {
      const volte = m.volte || 2;
      if (pass < volte) { passes[anchor] = pass + 1; i = anchor; continue; }
    }
    if (m.dalsegno && !dopoDS && segnoI >= 0) { dopoDS = true; cacciaCoda = !!dsCoda; i = segnoI; continue; }
    if (m.dacapo && !dopoDC) { dopoDC = true; i = 0; anchor = 0; continue; }
    i++;
  }
  return out;
}
