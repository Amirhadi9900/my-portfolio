const MUTE_KEY = 'portfolio:contact-sfx-muted';
const MASTER_GAIN = 0.5;

let audioCtx = null;
let masterGain = null;
let mutedCache = null;

function context() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;

  if (!audioCtx) {
    audioCtx = new Ctor();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = MASTER_GAIN;
    masterGain.connect(audioCtx.destination);
  }
  // Safari only lets a suspended context start from a user gesture, and the
  // success cue is scheduled after an await — so it must already be running.
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(type, points, at, dur, peak) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(points[0][0], at);
  for (let i = 1; i < points.length; i++) {
    osc.frequency.exponentialRampToValueAtTime(points[i][0], at + points[i][1]);
  }
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(at);
  osc.stop(at + dur + 0.03);
}

function noise(at, dur, peak, filterType, freq, q, sweepTo) {
  const length = Math.max(1, Math.round(audioCtx.sampleRate * dur));
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.6);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(freq, at);
  filter.Q.value = q || 1;
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(peak, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(at);
  src.stop(at + dur + 0.03);
}

// A cartoon slide whistle: pitch climbing with breath noise, dipping at the top.
function slideWhistle(at) {
  tone('sine', [[330, 0], [1180, 0.21]], at, 0.24, 0.22);
  noise(at, 0.24, 0.20, 'bandpass', 1200, 1.0, 4200);
  tone('sine', [[1180, 0], [980, 0.06]], at + 0.245, 0.07, 0.12);
}

// A falling whistle-slide into a wobbling, deflating squeak.
// Gains sit higher than the success cue's raw numbers look to justify, but the two
// measure equal once A-weighted: this cue's energy lands low in frequency, where
// hearing is dull, so its lower peaks are already perceptually matched.
function bubbleDeflate(at) {
  tone('sine', [[880, 0], [130, 0.17]], at, 0.18, 0.25);
  tone('sine', [[200, 0], [150, 0.09], [185, 0.14], [140, 0.2]], at + 0.18, 0.20, 0.135);
}

const CUES = {
  success: slideWhistle,
  error: bubbleDeflate,
};

export function isContactSfxMuted() {
  if (mutedCache === null && typeof window !== 'undefined') {
    mutedCache = window.localStorage.getItem(MUTE_KEY) === '1';
  }
  return mutedCache === true;
}

export function setContactSfxMuted(next) {
  mutedCache = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTE_KEY, next ? '1' : '0');
  }
}

/**
 * Create/resume the AudioContext from inside a click handler so that cues
 * scheduled later (after the submit await) are still allowed to play.
 */
export function unlockContactSfx() {
  context();
}

export function playContactSfx(kind) {
  const cue = CUES[kind];
  if (!cue || isContactSfxMuted()) return;
  const c = context();
  if (!c) return;
  cue(c.currentTime + 0.02);
}
