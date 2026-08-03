(function initManicoStorage(root) {
  'use strict';

  const DB = 'manico-bass-transcriber';
  const STORE = 'tracks';
  let promise = null;
  const memory = new Map();

  const result = request => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function database() {
    if (typeof indexedDB === 'undefined') return null;
    if (promise) return promise;
    promise = new Promise(resolve => {
      let request;
      try { request = indexedDB.open(DB, 1); }
      catch (error) { resolve(null); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return promise;
  }

  async function save(track) {
    const copy = typeof structuredClone === 'function' ? structuredClone(track) : track;
    memory.set(copy.id, copy);
    const db = await database();
    if (!db) return copy;
    try { await result(db.transaction(STORE, 'readwrite').objectStore(STORE).put(copy)); }
    catch (error) { return copy; }
    return copy;
  }

  async function get(id) {
    const db = await database();
    if (!db) return memory.get(id) || null;
    try {
      const value = await result(db.transaction(STORE, 'readonly').objectStore(STORE).get(id));
      if (value) memory.set(value.id, value);
      return value || null;
    } catch (error) { return memory.get(id) || null; }
  }

  async function list() {
    const db = await database();
    let rows = [...memory.values()];
    if (db) {
      try { rows = await result(db.transaction(STORE, 'readonly').objectStore(STORE).getAll()); }
      catch (error) { /* memory fallback */ }
    }
    return rows.filter(track => !track.demo).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async function remove(id) {
    memory.delete(id);
    const db = await database();
    if (db) {
      try { await result(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)); }
      catch (error) { /* memory deletion already completed */ }
    }
  }

  async function persist() {
    try { return navigator.storage?.persist ? await navigator.storage.persist() : false; }
    catch (error) { return false; }
  }

  async function estimate() {
    try { return navigator.storage?.estimate ? await navigator.storage.estimate() : { usage: 0, quota: 0 }; }
    catch (error) { return { usage: 0, quota: 0 }; }
  }

  root.ManicoStorage = { save, get, list, remove, persist, estimate };
})(globalThis);
