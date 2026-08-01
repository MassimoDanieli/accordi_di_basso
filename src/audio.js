// Sintesi essenziale: una corda pizzicata e un click di metronomo.

let ctx = null;
export function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function pluck(midi, at = 0, dur = 0.85, vol = 0.34) {
  const A = audio();
  const t0 = A.currentTime + at;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const gain = A.createGain();
  const lp = A.createBiquadFilter();

  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800, t0);
  lp.frequency.exponentialRampToValueAtTime(360, t0 + dur);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  [['triangle', 1, 0.9], ['sine', 2, 0.22], ['sine', 0.5, 0.3]].forEach(([type, mul, amp]) => {
    const osc = A.createOscillator(), g = A.createGain();
    osc.type = type;
    osc.frequency.value = freq * mul;
    g.gain.value = amp;
    osc.connect(g); g.connect(lp);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  });

  lp.connect(gain);
  gain.connect(A.destination);
}

export function arpeggio(midis, step = 0.26, dur = 0.9) {
  midis.forEach((m, i) => pluck(m, i * step, dur));
}

/** Accordo: le corde partono quasi insieme, con un filo di ritardo fra una e l'altra. */
export function strum(midis, dur = 1.4, spread = 0.02) {
  midis.forEach((m, i) => pluck(m, i * spread, dur, 0.26));
}

export function click(at = 0, accent = false) {
  const A = audio();
  const t0 = A.currentTime + at;
  const osc = A.createOscillator(), g = A.createGain();
  osc.type = 'square';
  osc.frequency.value = accent ? 1500 : 1050;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(accent ? 0.10 : 0.055, t0 + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  osc.connect(g); g.connect(A.destination);
  osc.start(t0); osc.stop(t0 + 0.07);
}
