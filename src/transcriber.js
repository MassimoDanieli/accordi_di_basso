(function initManicoTranscriber(root) {
  'use strict';

  const Core = root.ManicoCore;
  const TARGET_RATE = 5512;

  function workerSource() {
    return `'use strict';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function percentile(values,ratio){if(!values.length)return 0;const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*ratio)))];}
function rms(signal,start,length){let sum=0;const end=Math.min(signal.length,start+length);for(let index=start;index<end;index++){const value=signal[index];sum+=value*value;}return Math.sqrt(sum/Math.max(1,end-start));}
function onsets(signal,sampleRate,sensitivity){const hop=Math.max(1,Math.round(sampleRate*.01)),windowSize=Math.max(hop*3,Math.round(sampleRate*.04)),energy=[];for(let position=0;position+windowSize<signal.length;position+=hop)energy.push(rms(signal,position,windowSize));const noise=percentile(energy,.32),strong=percentile(energy,.91),threshold=noise+(strong-noise)*(1-sensitivity)*.68,flux=energy.map((value,index)=>index<2?0:value-Math.max(energy[index-1],energy[index-2])),fluxThreshold=Math.max(.000003,percentile(flux.filter(value=>value>0),.64)*(1.05-sensitivity*.34)),minimumGap=Math.max(1,Math.round(.052*sampleRate/hop)),result=[];let last=-minimumGap;for(let index=2;index<energy.length-2;index++){const local=flux[index]>=flux[index-1]&&flux[index]>=flux[index+1];if(local&&energy[index]>threshold&&flux[index]>fluxThreshold&&index-last>=minimumGap){result.push(index*hop/sampleRate);last=index;}}if(!result.length||result[0]>.18)result.unshift(0);return result;}
function correlation(signal,start,size,lag){let xy=0,xx=0,yy=0;const end=Math.min(signal.length,start+size-lag);for(let index=start;index<end;index++){const left=signal[index],right=signal[index+lag];xy+=left*right;xx+=left*left;yy+=right*right;}return xy/(Math.sqrt(xx*yy)||1);}
function estimateWindow(signal,sampleRate,start,size){const minimumLag=Math.max(2,Math.floor(sampleRate/330)),maximumLag=Math.min(Math.floor(sampleRate/31),Math.floor(size/2));let bestLag=-1,bestScore=-1;const scores=new Float32Array(maximumLag+1);for(let lag=minimumLag;lag<=maximumLag;lag++){const score=correlation(signal,start,size,lag);scores[lag]=score;if(score>bestScore){bestScore=score;bestLag=lag;}}if(bestLag<0||bestScore<.47)return null;let chosen=bestLag;while(chosen*2<=maximumLag&&scores[chosen*2]>=bestScore*.9){chosen*=2;bestScore=Math.max(bestScore,scores[chosen]);}const frequency=sampleRate/chosen,midi=Math.round(69+12*Math.log2(frequency/440));return midi>=23&&midi<=76?{midi,confidence:bestScore}:null;}
function pitch(signal,sampleRate,time){const votes=[];for(const offset of [.026,.072,.124,.176]){const start=Math.max(0,Math.floor((time+offset)*sampleRate)),size=Math.min(Math.round(sampleRate*.17),signal.length-start);if(size<Math.round(sampleRate*.075))continue;const estimate=estimateWindow(signal,sampleRate,start,size);if(estimate)votes.push(estimate);}if(!votes.length)return null;const groups=new Map();for(const vote of votes){const key=vote.midi,item=groups.get(key)||{score:0,count:0};item.score+=vote.confidence;item.count++;groups.set(key,item);}let selected=null;for(const[midi,item]of groups){const score=item.score+item.count*.18;if(!selected||score>selected.score)selected={midi,score,confidence:item.score/item.count};}return selected;}
self.onmessage=message=>{const{signal,sampleRate,sensitivity,duration}=message.data,points=onsets(signal,sampleRate,sensitivity),events=[];for(let index=0;index<points.length;index++){const start=points[index],next=index+1<points.length?points[index+1]:Math.min(duration,start+.72),found=pitch(signal,sampleRate,start);if(found&&found.confidence>=.47)events.push({start,end:Math.max(start+.045,next),midi:found.midi,rawMidi:found.midi,confidence:clamp(found.confidence,0,1)});if(index%6===0)self.postMessage({type:'progress',value:(index+1)/points.length});}self.postMessage({type:'result',events});};`;
  }

  function createWorker() {
    const url = URL.createObjectURL(new Blob([workerSource()], { type: 'text/javascript' }));
    const instance = new Worker(url);
    instance.__url = url;
    return instance;
  }

  async function decode(file) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    try { return await context.decodeAudioData((await file.arrayBuffer()).slice(0)); }
    finally { await context.close(); }
  }

  async function prepare(buffer, onProgress = () => {}) {
    const ratio = buffer.sampleRate / TARGET_RATE;
    const length = Math.max(1, Math.floor(buffer.length / ratio));
    const output = new Float32Array(length);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
    const dt = 1 / buffer.sampleRate;
    const highPassRC = 1 / (2 * Math.PI * 30);
    const highPassAlpha = highPassRC / (highPassRC + dt);
    const lowPassAlpha = 1 - Math.exp(-2 * Math.PI * 360 / buffer.sampleRate);
    let highPass = 0;
    let previous = 0;
    let lowPass = 0;
    const chunk = 180000;

    for (let start = 0; start < length; start += chunk) {
      const end = Math.min(length, start + chunk);
      for (let outputIndex = start; outputIndex < end; outputIndex += 1) {
        const sourceStart = Math.floor(outputIndex * ratio);
        const sourceEnd = Math.max(sourceStart + 1, Math.floor((outputIndex + 1) * ratio));
        let sum = 0;
        let count = 0;
        for (let sourceIndex = sourceStart; sourceIndex < sourceEnd && sourceIndex < buffer.length; sourceIndex += 1) {
          let sample = 0;
          for (const channel of channels) sample += channel[sourceIndex] || 0;
          sample /= channels.length;
          highPass = highPassAlpha * (highPass + sample - previous);
          previous = sample;
          lowPass += lowPassAlpha * (highPass - lowPass);
          sum += lowPass;
          count += 1;
        }
        output[outputIndex] = count ? sum / count : 0;
      }
      onProgress(end / length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return { signal: output, sampleRate: TARGET_RATE };
  }

  /** Elimina solo doppi onset quasi identici, mai note ribattute musicali. */
  function dedupeEvents(events) {
    const result = [];
    for (const event of events) {
      const previous = result.at(-1);
      if (previous && event.start - previous.start < 0.045) {
        if (event.confidence > previous.confidence) result[result.length - 1] = { ...event };
      } else {
        result.push({ ...event });
      }
    }
    return result;
  }

  async function transcribe(buffer, options = {}) {
    const progress = options.onProgress || (() => {});
    const prepared = await prepare(buffer, value => progress(value * 0.22, 'prepare'));
    const instance = createWorker();

    return new Promise((resolve, reject) => {
      instance.onmessage = message => {
        if (message.data.type === 'progress') {
          progress(0.22 + message.data.value * 0.78, 'analyse');
          return;
        }
        if (message.data.type === 'result') {
          instance.terminate();
          URL.revokeObjectURL(instance.__url);
          const normalized = Core.normalizeEvents(dedupeEvents(message.data.events), buffer.duration);
          resolve(Core.stabilizeOctaves(normalized));
        }
      };
      instance.onerror = error => {
        instance.terminate();
        URL.revokeObjectURL(instance.__url);
        reject(error);
      };
      instance.postMessage({
        signal: prepared.signal,
        sampleRate: prepared.sampleRate,
        sensitivity: Number.isFinite(options.sensitivity) ? options.sensitivity : 0.72,
        duration: buffer.duration
      }, [prepared.signal.buffer]);
    });
  }

  root.ManicoTranscriber = { decode, transcribe, dedupeEvents };
})(globalThis);
