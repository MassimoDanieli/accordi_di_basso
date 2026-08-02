(function initManicoStorage(root){
  'use strict';
  const DB='manico-bass-transcriber',STORE='tracks';let promise=null;const memory=new Map();
  const result=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  async function database(){
    if(typeof indexedDB==='undefined')return null;if(promise)return promise;
    promise=new Promise(resolve=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE)){const store=db.createObjectStore(STORE,{keyPath:'id'});store.createIndex('updatedAt','updatedAt');}};request.onsuccess=()=>resolve(request.result);request.onerror=()=>resolve(null);});return promise;
  }
  async function save(track){const copy=typeof structuredClone==='function'?structuredClone(track):track;memory.set(copy.id,copy);const db=await database();if(!db)return copy;await result(db.transaction(STORE,'readwrite').objectStore(STORE).put(copy));return copy;}
  async function get(id){const db=await database();if(!db)return memory.get(id)||null;const value=await result(db.transaction(STORE,'readonly').objectStore(STORE).get(id));if(value)memory.set(value.id,value);return value||null;}
  async function list(){const db=await database();const rows=db?await result(db.transaction(STORE,'readonly').objectStore(STORE).getAll()):[...memory.values()];return rows.filter(track=>!track.demo).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));}
  async function remove(id){memory.delete(id);const db=await database();if(db)await result(db.transaction(STORE,'readwrite').objectStore(STORE).delete(id));}
  async function persist(){try{return navigator.storage?.persist?await navigator.storage.persist():false;}catch(error){return false;}}
  async function estimate(){try{return navigator.storage?.estimate?await navigator.storage.estimate():{usage:0,quota:0};}catch(error){return{usage:0,quota:0};}}
  root.ManicoStorage={save,get,list,remove,persist,estimate};
})(globalThis);
