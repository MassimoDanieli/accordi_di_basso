(function initManicoCore(root) {
  'use strict';

  const VERSION = '5.0.0';
  const NOTE_NAMES = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  const PITCH = { C:0,D:2,E:4,F:5,G:7,A:9,B:11 };
  const TUNINGS = {
    '4':  { label:'E A D G', open:[28,33,38,43] },
    '5':  { label:'B E A D G', open:[23,28,33,38,43] },
    '5c': { label:'E A D G C', open:[28,33,38,43,48] },
    '6':  { label:'B E A D G C', open:[23,28,33,38,43,48] }
  };
  const DEMOS = [
    { id:'demo-blues', title:'Slow Blues in F', style:'Blues', bpm:82, notes:['F1','A1','C2','Eb2','F2','C2','A1','F1','Bb1','D2','F2','Ab2','A1','C2','Eb2','E2','F2'] },
    { id:'demo-funk', title:'Funk Pocket', style:'Funk', bpm:104, notes:['E1','E1','G1','A1','B1','D2','E2','D2','B1','A1','G1','E1','E2','D2','B1','A1'] },
    { id:'demo-reggae', title:'Reggae One Drop', style:'Reggae', bpm:74, notes:['A1','E2','G2','A2','A1','E2','D2','C2','A1','E2','G2','A2'] },
    { id:'demo-bossa', title:'Bossa in D minor', style:'Bossa', bpm:112, notes:['D2','A1','C2','D2','F2','A2','G2','E2','D2','A1','C2','Db2'] }
  ];

  function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }
  function formatTime(seconds){ const s=Number.isFinite(seconds)?Math.max(0,seconds):0; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
  function noteName(midi){ const m=Math.round(Number(midi)); return `${NOTE_NAMES[((m%12)+12)%12]}${Math.floor(m/12)-1}`; }
  function parseNote(value){
    const match=String(value||'').trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);
    if(!match)return null;
    const pc=PITCH[match[1].toUpperCase()]+(match[2]==='#'?1:match[2]==='b'?-1:0);
    return (Number(match[3])+1)*12+((pc%12)+12)%12;
  }
  function fretPosition(fret,frets=15){ if(fret<=0)return 0; return (1-Math.pow(2,-fret/12))/(1-Math.pow(2,-frets/12)); }
  function candidatePositions(midi,open,maxFret=15){
    const result=[];
    open.forEach((value,string)=>{ const fret=Math.round(midi-value); if(fret>=0&&fret<=maxFret)result.push({string,fret,midi:Math.round(midi)}); });
    return result;
  }
  function transition(previous,current,samePitch,pause){
    if(previous.string===null||current.string===null)return 14;
    let cost=Math.abs(current.fret-previous.fret)*1.8+Math.abs(current.string-previous.string)*2.25;
    if(Math.abs(current.fret-previous.fret)>5)cost+=(Math.abs(current.fret-previous.fret)-5)*1.6;
    if(samePitch&&current.string===previous.string&&current.fret===previous.fret)cost-=1.4;
    if(pause>.35)cost*=.6;
    return cost+current.fret*.025;
  }
  function optimiseFingering(events,open,maxFret=15){
    if(!Array.isArray(events)||!events.length)return [];
    const layers=events.map(event=>{ const list=candidatePositions(event.midi,open,maxFret); return list.length?list:[{string:null,fret:null,midi:event.midi}]; });
    const costs=[],back=[];
    layers.forEach((positions,index)=>{
      costs[index]=new Array(positions.length).fill(Infinity);
      back[index]=new Array(positions.length).fill(-1);
      positions.forEach((position,j)=>{
        if(index===0){ costs[index][j]=position.string===null?20:position.fret*.12+position.string*.08; return; }
        layers[index-1].forEach((previous,k)=>{
          const same=events[index].midi===events[index-1].midi;
          const pause=Math.max(0,events[index].start-events[index-1].end);
          const value=costs[index-1][k]+transition(previous,position,same,pause);
          if(value<costs[index][j]){costs[index][j]=value;back[index][j]=k;}
        });
      });
    });
    let cursor=0; const last=costs.at(-1); last.forEach((value,index)=>{if(value<last[cursor])cursor=index;});
    const selected=new Array(events.length);
    for(let index=events.length-1;index>=0;index--){ selected[index]=layers[index][cursor]; cursor=back[index][cursor]; if(cursor<0&&index>0)cursor=0; }
    return events.map((event,index)=>({...event,...selected[index]}));
  }
  function normalizeEvents(events,duration=0){
    const result=(events||[]).filter(event=>Number.isFinite(event.start)&&Number.isFinite(event.midi)).map((event,index)=>({
      id:event.id||`n-${index}-${Math.round(event.start*1000)}`,
      start:Math.max(0,Number(event.start)),
      end:Math.max(Number(event.start)+.04,Number(event.end)||Number(event.start)+.25),
      midi:Math.round(event.midi),confidence:clamp(Number(event.confidence)||0,0,1),
      string:Number.isInteger(event.string)?event.string:null,fret:Number.isInteger(event.fret)?event.fret:null
    })).sort((a,b)=>a.start-b.start);
    result.forEach((event,index)=>{ const next=result[index+1]; if(next)event.end=Math.max(event.start+.04,Math.min(event.end,next.start)); else if(duration)event.end=Math.min(duration,Math.max(event.start+.15,event.end)); });
    return result;
  }
  function currentEventIndex(events,time,fallback=0){
    if(!events.length)return -1;
    let low=0,high=events.length-1;
    while(low<=high){const middle=Math.floor((low+high)/2),event=events[middle];if(time<event.start)high=middle-1;else if(time>=event.end)low=middle+1;else return middle;}
    return clamp(high>=0?high:fallback,0,events.length-1);
  }
  function createDemoTrack(definition,tuning='4'){
    const beat=60/definition.bpm;let time=0;
    const events=definition.notes.map((name,index)=>{const length=beat*(index%4===3?1.08:.82);const event={id:`${definition.id}-${index}`,start:time,end:time+length,midi:parseNote(name),confidence:1};time+=length;return event;});
    return {id:definition.id,demo:true,title:definition.title,style:definition.style,bpm:definition.bpm,duration:time,createdAt:0,updatedAt:0,settings:{tuning,frets:15,lookahead:3,speed:1,loopA:null,loopB:null},events:optimiseFingering(events,TUNINGS[tuning].open,15)};
  }
  function renderTab(track,tuningKey='4',columns=16){
    const tuning=TUNINGS[tuningKey]||TUNINGS['4'];const names=tuning.open.map(noteName).map(value=>value.replace(/-?\d+$/,''));const order=[...tuning.open.keys()].reverse();const lines=[];const events=track.events||[];
    for(let start=0;start<events.length;start+=columns){const chunk=events.slice(start,start+columns);lines.push(`   ${chunk.map(event=>noteName(event.midi).padEnd(4,' ')).join('')}`.trimEnd());order.forEach(string=>{let row=`${names[string].padEnd(2,' ')}|`;chunk.forEach(event=>{const value=event.string===string&&event.fret!==null?String(event.fret):'';row+=value.padStart(2,'-').padEnd(4,'-');});lines.push(row+'|');});lines.push('');}
    return `${track.title}\n${tuning.label}\n\n${lines.join('\n')}`;
  }

  root.ManicoCore={VERSION,NOTE_NAMES,TUNINGS,DEMOS,clamp,formatTime,noteName,parseNote,fretPosition,candidatePositions,optimiseFingering,normalizeEvents,currentEventIndex,createDemoTrack,renderTab};
})(globalThis);
