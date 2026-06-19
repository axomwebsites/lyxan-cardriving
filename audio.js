let audioctx, engineosc, enginefilter, enginegain, enginegain2;

export function initaudio() {
  if (audioctx) return;
  audioctx = new (window.AudioContext || window.webkitAudioContext)();

  engineosc = audioctx.createOscillator();
  engineosc.type = 'sawtooth';
  enginefilter = audioctx.createBiquadFilter();
  enginefilter.type = 'lowpass';
  enginefilter.frequency.value = 220;
  enginegain = audioctx.createGain();
  enginegain.gain.value = 0.0001;

  const dist = audioctx.createWaveShaper();
  dist.curve = makedistcurve(2);
  dist.oversample = '4x';

  engineosc.connect(enginefilter);
  enginefilter.connect(dist);
  dist.connect(enginegain);
  enginegain.connect(audioctx.destination);

  const osc2 = audioctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.value = 80;
  enginegain2 = audioctx.createGain();
  enginegain2.gain.value = 0.0001;
  osc2.connect(enginegain2);
  enginegain2.connect(audioctx.destination);
  osc2.start();
  engineosc.start();
  window._osc2 = osc2;
  window._gain2 = enginegain2;
}

function makedistcurve(amount) {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / n) * 2 - 1;
    curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
  }
  return curve;
}

export function updateaudio(speed, throttle, boostactive) {
  if (!audioctx || !engineosc) return;
  const t = audioctx.currentTime;
  const rpm = 50 + speed * 3.4 + Math.max(0, throttle) * 28;
  engineosc.frequency.setTargetAtTime(rpm, t, 0.04);
  enginefilter.frequency.setTargetAtTime(200 + speed * 9 + Math.max(0, throttle) * 120, t, 0.04);
  const vol = 0.015 + speed * 0.0004 + (boostactive ? 0.025 : 0);
  enginegain.gain.setTargetAtTime(vol * 0.6, t, 0.05);

  if (window._osc2 && window._gain2) {
    window._osc2.frequency.setTargetAtTime(60 + speed * 1.2, t, 0.04);
    window._gain2.gain.setTargetAtTime((0.004 + speed * 0.00008) * 0.6, t, 0.05);
  }
}

export function playsound(type) {
  if (!audioctx) return;
  if (type === 'coin') {
    beep(880, 0.07, 'sine', 0.05);
    setTimeout(() => beep(1320, 0.08, 'sine', 0.04), 60);
  } else if (type === 'gate') {
    beep(520, 0.07, 'triangle', 0.06);
    setTimeout(() => beep(780, 0.09, 'triangle', 0.06), 70);
    setTimeout(() => beep(1040, 0.1, 'triangle', 0.05), 140);
  } else if (type === 'crash') {
    const t = audioctx.currentTime;
    const bufsize = audioctx.sampleRate * 0.2;
    const buf = audioctx.createBuffer(1, bufsize, audioctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufsize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufsize) * (0.5 + Math.random() * 0.5);
    const noise = audioctx.createBufferSource();
    noise.buffer = buf;
    const filter = audioctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = audioctx.createGain();
    gain.gain.setValueAtTime(0.1 * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioctx.destination);
    noise.start(t);
  }
}

function beep(freq, dur, type, vol) {
  if (!audioctx) return;
  const osc = audioctx.createOscillator();
  const gain = audioctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.value = (vol || 0.06) * 0.6;
  osc.connect(gain);
  gain.connect(audioctx.destination);
  const t = audioctx.currentTime;
  gain.gain.setValueAtTime((vol || 0.06) * 0.6, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
