// ─── AUDIO ENGINE ────────────────────────────────────────────────

let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function createGain(volume) {
  const g = audioCtx.createGain();
  g.gain.value = volume;
  g.connect(audioCtx.destination);
  return g;
}

function playExplosion() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.4;
  const buffer     = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter           = audioCtx.createBiquadFilter();
  filter.type            = 'lowpass';
  filter.frequency.value = 400;

  const gain = createGain(0.6);
  gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  source.connect(filter);
  filter.connect(gain);
  source.start();
  source.stop(audioCtx.currentTime + 0.4);
}

function playPickup() {
  if (!audioCtx) return;
  [660, 880].forEach((freq, i) => {
    const osc  = audioCtx.createOscillator();
    const gain = createGain(0);
    osc.type            = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

function playLevelUp() {
  if (!audioCtx) return;
  [330, 415, 494, 660].forEach((freq, i) => {
    const osc  = audioCtx.createOscillator();
    const gain = createGain(0);
    osc.type            = 'square';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

let engineOsc  = null;
let engineGain = null;

function startEngine() {
  if (!audioCtx || engineOsc) return;
  engineOsc               = audioCtx.createOscillator();
  engineGain              = audioCtx.createGain();
  engineOsc.type          = 'sawtooth';
  engineOsc.frequency.value = 55;
  engineGain.gain.value   = 0.04;
  engineOsc.connect(engineGain);
  engineGain.connect(audioCtx.destination);
  engineOsc.start();
}

function stopEngine() {
  if (!engineOsc) return;
  engineGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  engineOsc.stop(audioCtx.currentTime + 0.3);
  engineOsc = null;
}

let musicInterval = null;
const MUSIC_NOTES = [110, 130, 146, 165, 196, 220];

function playMusicPulse() {
  if (!audioCtx) return;
  const freq = MUSIC_NOTES[Math.floor(Math.random() * MUSIC_NOTES.length)];
  const osc  = audioCtx.createOscillator();
  const gain = createGain(0);
  osc.type            = 'sine';
  osc.frequency.value = freq;
  const t = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 1.2);
}

function startMusic() {
  if (musicInterval) return;
  playMusicPulse();
  musicInterval = setInterval(playMusicPulse, 600);
}

function stopMusic() {
  clearInterval(musicInterval);
  musicInterval = null;
}