// Il canzoniere: i brani importati restano sul dispositivo, in IndexedDB, e si
// ritrovano per titolo, autore o stile. Niente server, niente rete: il backup e'
// un file JSON che esce ed entra dalla finestra del canzoniere.
//
// Dove IndexedDB non c'e' (o e' rotto), si ripiega in memoria: tutto funziona
// uguale per la sessione, semplicemente senza persistenza.

const DB = 'manico', STORE = 'brani';
let memoria = new Map();
let usaIDB = typeof indexedDB !== 'undefined';
let dbP = null;

function apri() {
  if (!usaIDB) return Promise.resolve(null);
  if (dbP) return dbP;
  dbP = new Promise(res => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => { usaIDB = false; res(null); };
  });
  return dbP;
}

function att(req) {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

/** L'identita' di un brano: titolo e compositore, senza maiuscole. */
export const idDi = s => ((s.title || '') + '|' + (s.composer || '')).toLowerCase().trim();

/** Salva (o aggiorna) un brano. Restituisce il record salvato. */
export async function salva(song) {
  if (!song || !song.title || !Array.isArray(song.bars) || !song.bars.length) return null;
  const rec = {
    id: idDi(song),
    title: song.title, composer: song.composer || '', key: song.key || '',
    stile: song.stile || '', bpm: song.bpm || 0,
    bars: song.bars,
    aggiunto: Date.now()
  };
  const db = await apri();
  if (!db) { memoria.set(rec.id, rec); return rec; }
  await att(db.transaction(STORE, 'readwrite').objectStore(STORE).put(rec));
  return rec;
}

/** Tutti i brani, in ordine di titolo. */
export async function tutti() {
  const db = await apri();
  const list = db
    ? await att(db.transaction(STORE, 'readonly').objectStore(STORE).getAll())
    : [...memoria.values()];
  return list.sort((a, b) => a.title.localeCompare(b.title));
}

/** Toglie un brano. */
export async function rimuovi(id) {
  const db = await apri();
  if (!db) { memoria.delete(id); return; }
  await att(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
}

/** Filtro di ricerca su titolo, compositore e stile. */
export function cerca(list, q) {
  q = (q || '').toLowerCase().trim();
  if (!q) return list;
  return list.filter(s =>
    (s.title || '').toLowerCase().includes(q) ||
    (s.composer || '').toLowerCase().includes(q) ||
    (s.stile || '').toLowerCase().includes(q));
}

/** Il backup: tutto il canzoniere in un JSON. */
export async function esporta() {
  return JSON.stringify({ manico: 'canzoniere', versione: 1, brani: await tutti() }, null, 1);
}

/** Rientro dal backup: salva i brani validi, restituisce quanti. */
export async function importa(testo) {
  let dati;
  try { dati = JSON.parse(testo); } catch (e) { return 0; }
  const brani = Array.isArray(dati) ? dati : (dati && dati.brani);
  if (!Array.isArray(brani)) return 0;
  let n = 0;
  for (const b of brani) {
    if (await salva(b)) n++;
  }
  return n;
}
