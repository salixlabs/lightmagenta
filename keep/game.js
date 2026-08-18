'use strict';

/* KEEP — Salix Labs. Original medieval tower defense. */

const W = 1280, H = 720;
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const TOWERS = {
  bow: {
    id: 'bow', name: 'Longbow Nest', cost: 80,
    blurb: 'Cheap, honest arrows.',
    tiers: [
      { name: 'Longbow Nest', cost: 0, dmg: 9, range: 158, rate: 0.70, splash: 0, extra: 'A single clean shot.' },
      { name: "Marksman's Rest", cost: 90, dmg: 13, range: 178, rate: 0.46, splash: 0, extra: 'Faster strings. Meaner points.' },
      { name: 'Eagle Eye', cost: 130, dmg: 16, range: 205, rate: 0.38, splash: 0, extra: 'Arrows pierce to a second foe.' }
    ]
  },
  sun: {
    id: 'sun', name: 'Sunfire Circle', cost: 115,
    blurb: 'Slow magic. Splash and burn.',
    tiers: [
      { name: 'Sunfire Circle', cost: 0, dmg: 13, range: 142, rate: 1.05, splash: 40, extra: 'A warm slap and a lingering burn.' },
      { name: 'Ember Ring', cost: 110, dmg: 17, range: 154, rate: 0.90, splash: 52, extra: 'Wider splash. Hungrier burn.' },
      { name: 'Solar Well', cost: 155, dmg: 21, range: 168, rate: 0.80, splash: 64, extra: 'A second pulse after the first.' }
    ]
  },
  bar: {
    id: 'bar', name: 'Barracks of the Lion', cost: 140,
    blurb: 'Soldiers walk out and block the lane.',
    tiers: [
      { name: 'Barracks of the Lion', cost: 0, soldiers: 2, hp: 50, dmg: 6, rate: 0.70, extra: 'Two bodies on the road.' },
      { name: "Lion's Watch", cost: 105, soldiers: 3, hp: 66, dmg: 8, rate: 0.60, extra: 'A third soldier joins the line.' },
      { name: "King's Guard", cost: 150, soldiers: 3, hp: 92, dmg: 11, rate: 0.50, extra: 'Tougher plates. Quicker banners back.' }
    ]
  },
  treb: {
    id: 'treb', name: 'Stonehowl Trebuchet', cost: 200,
    blurb: 'Expensive. Slow. Very rude rocks.',
    tiers: [
      { name: 'Stonehowl Trebuchet', cost: 0, dmg: 40, range: 232, rate: 2.15, splash: 70, extra: 'A rock with opinions.' },
      { name: 'Heavier Howl', cost: 160, dmg: 54, range: 248, rate: 1.92, splash: 84, extra: 'Bigger stone. Wider apology.' },
      { name: "Mountain's Voice", cost: 220, dmg: 66, range: 262, rate: 1.72, splash: 96, extra: 'Impact briefly stuns.' }
    ]
  }
};

const KINDS = {
  runner: { name: 'Scramblekin', hp: 24, spd: 64, gold: 8, armor: 0, fly: false, r: 11, leak: 1, color: '#4a8a32' },
  brute: { name: 'Oakplate Brute', hp: 96, spd: 30, gold: 18, armor: 5, fly: false, r: 16, leak: 1, color: '#6a5340' },
  bat: { name: 'Nightwing', hp: 18, spd: 80, gold: 12, armor: 0, fly: true, r: 10, leak: 1, color: '#3a2a48' },
  boss: { name: 'Marrow the Gatebreaker', hp: 1480, spd: 21, gold: 90, armor: 7, fly: false, r: 30, leak: 5, color: '#5a2028' }
};

const W1 = [
  { title: 'Stirring in the Wood', packs: [{ k: 'runner', n: 8, gap: 0.70 }] },
  { title: 'Heavy Footfalls', packs: [{ k: 'runner', n: 8, gap: 0.55 }, { k: 'brute', n: 2, gap: 1.5, wait: 3.2 }] },
  { title: 'Something on the Wind', packs: [{ k: 'runner', n: 6, gap: 0.50 }, { k: 'bat', n: 6, gap: 0.55, wait: 2.0 }] },
  { title: 'The Road Thickens', packs: [{ k: 'runner', n: 12, gap: 0.42 }, { k: 'brute', n: 4, gap: 1.1, wait: 2.2 }] },
  { title: 'Night and Oak', packs: [{ k: 'bat', n: 8, gap: 0.42 }, { k: 'runner', n: 8, gap: 0.40, wait: 1.2 }, { k: 'brute', n: 3, gap: 1.2, wait: 4.0 }] },
  { title: 'A Proper Row', packs: [{ k: 'runner', n: 16, gap: 0.34 }, { k: 'brute', n: 6, gap: 0.95, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'runner', n: 10, gap: 0.38 }, { k: 'bat', n: 6, gap: 0.48, wait: 1.6 }, { k: 'brute', n: 4, gap: 1.0, wait: 4.0 }] },
  { title: 'Wings and Iron', packs: [{ k: 'bat', n: 12, gap: 0.36 }, { k: 'brute', n: 8, gap: 0.85, wait: 2.0 }, { k: 'runner', n: 10, gap: 0.34, wait: 5.0 }] },
  { title: 'The Last Ordinary Hour', packs: [{ k: 'runner', n: 18, gap: 0.30 }, { k: 'brute', n: 8, gap: 0.72, wait: 2.0 }, { k: 'bat', n: 10, gap: 0.38, wait: 4.0 }] },
  { title: 'Clear the Road', packs: [{ k: 'brute', n: 6, gap: 1.1, wait: 0 }, { k: 'runner', n: 14, gap: 0.34, wait: 2.0 }, { k: 'bat', n: 8, gap: 0.40, wait: 6.0 }] }
];
const W2 = [
  { title: 'Wet Boots', packs: [{ k: 'runner', n: 10, gap: 0.50 }, { k: 'brute', n: 2, gap: 1.2, wait: 2.0 }] },
  { title: 'The Cut Narrows', packs: [{ k: 'runner', n: 12, gap: 0.40 }, { k: 'bat', n: 6, gap: 0.45, wait: 1.4 }] },
  { title: 'Oak in the Water', packs: [{ k: 'brute', n: 5, gap: 0.85 }, { k: 'runner', n: 10, gap: 0.36, wait: 1.6 }] },
  { title: 'A Bad Wind', packs: [{ k: 'bat', n: 12, gap: 0.32 }, { k: 'brute', n: 4, gap: 0.9, wait: 2.0 }] },
  { title: 'Shoulder to Shoulder', packs: [{ k: 'runner', n: 18, gap: 0.30 }, { k: 'brute', n: 6, gap: 0.75, wait: 2.2 }] },
  { title: 'Both Banks', packs: [{ k: 'bat', n: 10, gap: 0.30 }, { k: 'runner', n: 12, gap: 0.28, wait: 1.0 }, { k: 'brute', n: 5, gap: 0.8, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'runner', n: 14, gap: 0.28 }, { k: 'bat', n: 10, gap: 0.32, wait: 1.2 }, { k: 'brute', n: 6, gap: 0.7, wait: 3.2 }] },
  { title: 'No Dry Ground', packs: [{ k: 'brute', n: 8, gap: 0.65 }, { k: 'runner', n: 16, gap: 0.26, wait: 1.5 }, { k: 'bat', n: 10, gap: 0.30, wait: 4.0 }] },
  { title: 'The Ford Breaks', packs: [{ k: 'runner', n: 20, gap: 0.24 }, { k: 'brute', n: 8, gap: 0.60, wait: 1.8 }, { k: 'bat', n: 12, gap: 0.28, wait: 3.5 }] },
  { title: 'Hold the Crossing', packs: [{ k: 'brute', n: 10, gap: 0.55 }, { k: 'runner', n: 16, gap: 0.24, wait: 1.2 }, { k: 'bat', n: 12, gap: 0.26, wait: 5.0 }] }
];
const W3 = [
  { title: 'Dusk Banners', packs: [{ k: 'runner', n: 12, gap: 0.38 }, { k: 'bat', n: 8, gap: 0.36, wait: 1.0 }] },
  { title: 'Iron First', packs: [{ k: 'brute', n: 6, gap: 0.70 }, { k: 'runner', n: 12, gap: 0.30, wait: 1.4 }] },
  { title: 'Nightwings Close', packs: [{ k: 'bat', n: 16, gap: 0.26 }, { k: 'brute', n: 5, gap: 0.7, wait: 1.8 }] },
  { title: 'The Snake Tightens', packs: [{ k: 'runner', n: 18, gap: 0.26 }, { k: 'brute', n: 7, gap: 0.58, wait: 1.6 }, { k: 'bat', n: 8, gap: 0.28, wait: 3.0 }] },
  { title: 'No Soft Wave', packs: [{ k: 'brute', n: 8, gap: 0.55 }, { k: 'runner', n: 16, gap: 0.24, wait: 1.0 }, { k: 'bat', n: 12, gap: 0.24, wait: 3.2 }] },
  { title: 'All Three Kinds', packs: [{ k: 'bat', n: 14, gap: 0.22 }, { k: 'runner', n: 16, gap: 0.22, wait: 0.8 }, { k: 'brute', n: 8, gap: 0.52, wait: 2.8 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'runner', n: 16, gap: 0.22 }, { k: 'bat', n: 14, gap: 0.22, wait: 1.0 }, { k: 'brute', n: 8, gap: 0.50, wait: 2.6 }] },
  { title: 'The Gate Shudders', packs: [{ k: 'brute', n: 10, gap: 0.48 }, { k: 'runner', n: 18, gap: 0.20, wait: 1.2 }, { k: 'bat', n: 14, gap: 0.22, wait: 4.0 }] },
  { title: 'Almost Night', packs: [{ k: 'runner', n: 22, gap: 0.18 }, { k: 'brute', n: 10, gap: 0.45, wait: 1.4 }, { k: 'bat', n: 16, gap: 0.20, wait: 3.2 }] },
  { title: 'The Gatebreaker', packs: [{ k: 'boss', n: 1, gap: 0 }, { k: 'brute', n: 8, gap: 0.85, wait: 2.2 }, { k: 'runner', n: 16, gap: 0.22, wait: 1.5 }, { k: 'bat', n: 12, gap: 0.24, wait: 7.0 }] }
];

const LEVELS = [
  {
    name: 'Amberwatch Road', dusk: 0, gold: 250,
    rune: { x: 572, y: 86 }, banner: { x: 1220, y: 292 }, guard: { x: 1172, y: 448 },
    heroes: [{ id: 'julian', x: 980, y: 360 }, { id: 'shadow', x: 940, y: 410 }, { id: 'papa', x: 1020, y: 420 }],
    path: [
      { x: 18, y: 438 }, { x: 150, y: 418 }, { x: 236, y: 318 }, { x: 318, y: 198 },
      { x: 468, y: 148 }, { x: 610, y: 188 }, { x: 698, y: 318 }, { x: 758, y: 478 },
      { x: 898, y: 538 }, { x: 1048, y: 478 }, { x: 1148, y: 392 }, { x: 1268, y: 368 }
    ],
    pads: [
      { x: 188, y: 528 }, { x: 348, y: 292 }, { x: 498, y: 78 }, { x: 628, y: 318 },
      { x: 818, y: 358 }, { x: 928, y: 618 }, { x: 1088, y: 292 }, { x: 1138, y: 538 }
    ],
    waves: W1
  },
  {
    name: 'River Cut', dusk: 0.22, gold: 190,
    rune: { x: 560, y: 70 }, banner: { x: 1220, y: 250 }, guard: { x: 1180, y: 360 },
    heroes: [{ id: 'julian', x: 1040, y: 300 }, { id: 'shadow', x: 1000, y: 350 }, { id: 'papa', x: 1080, y: 360 }],
    path: [
      { x: 16, y: 580 }, { x: 170, y: 560 }, { x: 250, y: 400 }, { x: 170, y: 250 },
      { x: 340, y: 140 }, { x: 540, y: 160 }, { x: 640, y: 300 }, { x: 540, y: 440 },
      { x: 720, y: 540 }, { x: 920, y: 500 }, { x: 1060, y: 340 }, { x: 1180, y: 280 },
      { x: 1268, y: 270 }
    ],
    pads: [
      { x: 90, y: 470 }, { x: 320, y: 280 }, { x: 480, y: 80 },
      { x: 700, y: 380 }, { x: 860, y: 620 }, { x: 1120, y: 200 }
    ],
    waves: W2
  },
  {
    name: 'Night Gate', dusk: 0.48, gold: 150,
    rune: { x: 640, y: 80 }, banner: { x: 1220, y: 360 }, guard: { x: 1188, y: 500 },
    heroes: [{ id: 'julian', x: 1080, y: 400 }, { id: 'shadow', x: 1040, y: 450 }, { id: 'papa', x: 1120, y: 460 }],
    path: [
      { x: 16, y: 190 }, { x: 200, y: 150 }, { x: 340, y: 280 }, { x: 220, y: 440 },
      { x: 280, y: 600 }, { x: 500, y: 640 }, { x: 660, y: 500 }, { x: 560, y: 320 },
      { x: 720, y: 170 }, { x: 920, y: 150 }, { x: 1060, y: 280 }, { x: 940, y: 460 },
      { x: 1100, y: 560 }, { x: 1268, y: 400 }
    ],
    pads: [
      { x: 80, y: 320 }, { x: 380, y: 500 }, { x: 640, y: 360 },
      { x: 840, y: 80 }, { x: 1140, y: 360 }
    ],
    waves: W3
  }
];

function currentLevel() { return LEVELS[state.level] || LEVELS[0]; }
function currentWaves() { return currentLevel().waves; }
function runePos() { return currentLevel().rune; }
function bannerPos() { return currentLevel().banner; }
function guardPos() { return currentLevel().guard; }

function buildPath(pts) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  return { pts, segs, total };
}
let PATH = buildPath(LEVELS[0].path);

function pathAt(d, fly) {
  d = clamp(d, 0, PATH.total);
  let s = PATH.segs[PATH.segs.length - 1];
  for (let i = 0; i < PATH.segs.length; i++) {
    if (d <= PATH.segs[i].start + PATH.segs[i].len) { s = PATH.segs[i]; break; }
  }
  const t = s.len ? (d - s.start) / s.len : 1;
  return {
    x: s.a.x + (s.b.x - s.a.x) * t,
    y: s.a.y + (s.b.y - s.a.y) * t - (fly ? 36 : 0),
    ang: Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x)
  };
}
function nearestPath(p) {
  let best = 0, bd = 1e9;
  for (let d = 0; d <= PATH.total; d += 8) {
    const q = pathAt(d, false);
    const dd = Math.hypot(q.x - p.x, q.y - p.y);
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}

let audio = null, soundOn = true;
function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}
function osc(type, f0, f1, d, vol) {
  if (!soundOn || !audio) return;
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), audio.currentTime + d);
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + d);
  o.connect(g).connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + d);
}
function noise(d, vol, f) {
  if (!soundOn || !audio) return;
  const n = audio.createBuffer(1, Math.max(1, audio.sampleRate * d | 0), audio.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = audio.createBufferSource();
  src.buffer = n;
  const filt = audio.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = f || 800;
  const g = audio.createGain();
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + d);
  src.connect(filt).connect(g).connect(audio.destination);
  src.start();
}
const SFX = {
  tap() { osc('square', 420, 280, 0.05, 0.05); },
  coin() { osc('sine', 660, 990, 0.12, 0.09); osc('sine', 990, 1320, 0.16, 0.07); },
  bow() { osc('triangle', 880, 220, 0.09, 0.06); },
  magic() { osc('sine', 320, 140, 0.18, 0.08); osc('triangle', 640, 200, 0.2, 0.05); },
  rock() { noise(0.22, 0.16, 420); osc('sine', 90, 40, 0.24, 0.14); },
  slash() { osc('sawtooth', 240, 80, 0.1, 0.07); },
  smash() { noise(0.28, 0.18, 280); osc('sine', 70, 36, 0.3, 0.16); },
  vanish() { osc('sine', 720, 180, 0.2, 0.07); },
  cheer() {
    osc('sine', 523, 659, 0.18, 0.09);
    osc('sine', 659, 784, 0.22, 0.08);
    osc('sine', 784, 1046, 0.28, 0.08);
  },
  horn() { osc('sawtooth', 196, 262, 0.35, 0.08); osc('square', 98, 130, 0.4, 0.05); },
  leak() { osc('triangle', 180, 70, 0.28, 0.1); },
  win() { SFX.cheer(); osc('sine', 392, 523, 0.3, 0.1); },
  lose() { osc('sawtooth', 110, 50, 0.5, 0.1); osc('sine', 70, 36, 0.6, 0.12); },
  snore() { osc('sine', 90, 70, 0.4, 0.05); osc('sine', 80, 60, 0.5, 0.04); },
  chirp() { osc('sine', 1400, 1800, 0.08, 0.05); osc('sine', 1800, 1200, 0.1, 0.04); },
  seven() { osc('sine', 777, 888, 0.16, 0.08); osc('sine', 888, 1176, 0.22, 0.09); }
};

const canvas = $('#c');
const ctx = canvas.getContext('2d');
const state = {
  mode: 'start',
  gold: 250,
  lives: 21,
  wave: 0,
  waveStarted: false,
  spawnQ: [],
  enemies: [],
  towers: [],
  soldiers: [],
  walls: [],
  shots: [],
  fx: [],
  floats: [],
  pulses: [],
  heroes: [],
  selected: null,
  placing: null,
  rallyPick: null,
  t: 0,
  shake: 0,
  toastT: 0,
  runeTaps: 0,
  bannerTaps: 0,
  heroSeq: [],
  tripleCd: 0,
  lastGold: 250,
  birds: [],
  reinforceCd: 0,
  callCd: 0,
  moveMark: null,
  level: 0
};

function toast(msg, t) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  state.toastT = t || 2.2;
}
function hudGold() { $('#statGold strong').textContent = String(state.gold); }
function hudLives() { $('#statLives strong').textContent = String(state.lives); }
function hudWave() {
  const n = currentWaves().length;
  $('#statWave strong').textContent = state.wave + '/' + n;
}

function addGold(n) {
  state.gold = Math.max(0, (state.gold + n) | 0);
  if (n > 0) SFX.coin();
  hudGold();
  checkTriple();
  refreshOpenSheet();
}

function refreshOpenSheet() {
  const pad = state.selected && state.selected.kind === 'tower' ? state.selected.ref : null;
  if (!pad) return;
  if (!$('#buildMenu').hidden) openBuild(pad);
  else if (!$('#towerMenu').hidden) openTower(pad);
}
function checkTriple() {
  if (state.gold === 777 && state.lastGold !== 777 && state.tripleCd <= 0) {
    fireTriple('The purse reads 777.');
  }
  state.lastGold = state.gold;
}
function fireTriple(why) {
  state.tripleCd = 18;
  state.heroes.forEach((h) => { h.empower = 6.5; });
  for (let i = 0; i < 48; i++) {
    state.fx.push({
      kind: 'coin', x: 80 + Math.random() * 1120, y: -20 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 40, vy: 80 + Math.random() * 90,
      life: 1.6 + Math.random(), r: 4 + Math.random() * 4
    });
  }
  SFX.seven();
  SFX.cheer();
  toast((why || 'Triple Seven!') + ' The heroes shine.');
}
function floatText(x, y, text, color) {
  state.floats.push({ x, y, text, color: color || '#fff3c4', life: 0.9 });
}

function makeHero(id, x, y) {
  const base = {
    julian: { name: 'Sir Julian', title: 'the Brave', hp: 240, dmg: 20, range: 48, spd: 100, rate: 0.52, ability: 'Lionheart', cdMax: 12 },
    shadow: { name: 'Shadow Aussie', title: 'the Veil', hp: 340, dmg: 12, range: 50, spd: 78, rate: 0.64, ability: 'Bulwark', cdMax: 16 },
    papa: { name: 'Papa', title: 'the Warm', hp: 132, dmg: 9, range: 172, spd: 82, rate: 0.70, ability: 'Volley', cdMax: 11 }
  }[id];
  return {
    id, x, y, tx: x, ty: y,
    hp: base.hp, mhp: base.hp, dmg: base.dmg, range: base.range, spd: base.spd, rate: base.rate,
    name: base.name, title: base.title, ability: base.ability, cdMax: base.cdMax, cd: 0,
    atkT: 0, pose: 0, facing: 1, glow: 0, vanish: 0, vanishHit: 0, empower: 0, smash: 0, deadT: 0, volley: 0, volleyGap: 0
  };
}

function resetRun(level) {
  hideMenus();
  if (level != null) state.level = level;
  const L = currentLevel();
  PATH = buildPath(L.path);
  state.gold = L.gold;
  state.lives = 21;
  state.wave = 0;
  state.waveStarted = false;
  state.spawnQ = [];
  state.enemies = [];
  state.towers = L.pads.map((p) => ({ x: p.x, y: p.y, type: null, tier: 0, cool: 0, rally: nearestPath(p) }));
  state.soldiers = [];
  state.walls = [];
  state.shots = [];
  state.fx = [];
  state.floats = [];
  state.pulses = [];
  state.heroes = L.heroes.map((h) => makeHero(h.id, h.x, h.y));
  state.selected = null;
  state.placing = null;
  state.rallyPick = null;
  state.shake = 0;
  state.t = 0;
  state.runeTaps = 0;
  state.bannerTaps = 0;
  state.heroSeq = [];
  state.tripleCd = 0;
  state.lastGold = L.gold;
  state.reinforceCd = 0;
  state.callCd = 0;
  state.moveMark = null;
  state.birds = [
    { x: 220, y: 90, vx: 18, s: 1, t: 0 },
    { x: 640, y: 70, vx: -14, s: 0.85, t: 1.2 },
    { x: 900, y: 110, vx: 12, s: 1.1, t: 2 }
  ];
  hudGold(); hudLives(); hudWave();
  $('#waveBtnLabel').textContent = 'Call Wave 1';
  $('#waveBtnHint').textContent = 'Begin the siege';
  $('#btnWave').classList.add('ready');
  syncHeroUI();
  hideMenus();
}

function livingEnemies() { return state.enemies.filter((e) => e.hp > 0); }
function nearestEnemy(p, range, pred) {
  let best = null, bd = range;
  const list = livingEnemies();
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (pred && !pred(e)) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function weakestEnemy(p, range) {
  let best = null, bh = 1e9;
  const list = livingEnemies();
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < range && e.hp < bh) { bh = e.hp; best = e; }
  }
  return best;
}
function hurt(e, raw, color) {
  if (!e || e.hp <= 0) return;
  const dmg = Math.max(1, raw - (e.armor || 0) * 0.65);
  e.hp -= dmg;
  e.flash = 0.12;
  floatText(e.x, e.y - 18, String(dmg | 0), color || '#ffe9a0');
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  if (e.dead) return;
  e.dead = true;
  e.hp = 0;
  addGold(e.gold);
  for (let i = 0; i < 8; i++) {
    state.fx.push({
      kind: 'poof', x: e.x, y: e.y, vx: (Math.random() - 0.5) * 80, vy: -20 - Math.random() * 50,
      life: 0.45, r: 4 + Math.random() * 6, color: e.color
    });
  }
  if (e.kind === 'boss') toast('Marrow the Gatebreaker falls.');
}

function spawnEnemy(kind, waveIndex) {
  const k = KINDS[kind];
  const scale = 1 + waveIndex * 0.085 + state.level * 0.16;
  const p = pathAt(0, k.fly);
  state.enemies.push({
    kind, name: k.name, x: p.x, y: p.y, d: 0, ang: 0,
    hp: k.hp * scale, mhp: k.hp * scale, spd: k.spd * (1 + state.level * 0.08), gold: k.gold, armor: k.armor,
    fly: k.fly, r: k.r, leak: k.leak, color: k.color,
    stun: 0, slow: 0, burn: 0, burnDps: 0, flash: 0, dead: false, atkT: 0, bob: Math.random() * 6
  });
}

function queueWave(idx) {
  const waves = currentWaves();
  const w = waves[idx];
  if (!w) return;
  state.wave = idx + 1;
  state.waveStarted = true;
  hudWave();
  SFX.horn();
  if (w.bonus) {
    addGold(w.bonus);
    SFX.cheer();
    toast("Julian's Favor! +7 gold. Julian the Brave stands!");
    state.fx.push({ kind: 'spark', x: 640, y: 90, life: 1.4, r: 28 });
  } else {
    toast(w.title);
  }
  w.packs.forEach((pk) => {
    const wait = pk.wait || 0;
    for (let i = 0; i < pk.n; i++) {
      state.spawnQ.push({ t: state.t + wait + i * pk.gap, k: pk.k, w: idx });
    }
  });
  const next = idx + 2;
  if (next <= waves.length) {
    $('#waveBtnLabel').textContent = 'Call Wave ' + next;
    $('#waveBtnHint').textContent = '+12 gold';
    $('#btnWave').classList.add('ready');
  } else {
    $('#waveBtnLabel').textContent = 'Last wave';
    $('#waveBtnHint').textContent = 'Hold the gate';
    $('#btnWave').classList.remove('ready');
  }
}

function tryCallWave() {
  if (state.mode !== 'play') return;
  if (state.wave >= currentWaves().length) return;
  if (state.callCd > 0) return;
  if (state.waveStarted) addGold(12);
  queueWave(state.wave);
  state.callCd = 3;
}

function towerDef(t) { return TOWERS[t.type].tiers[t.tier]; }
function invested(t) {
  if (!t.type) return 0;
  let s = TOWERS[t.type].cost;
  const tiers = TOWERS[t.type].tiers;
  for (let i = 1; i <= t.tier; i++) s += tiers[i].cost;
  return s;
}

function buildTower(pad, type) {
  const def = TOWERS[type];
  if (state.gold < def.cost) { toast('The purse is shy.'); return; }
  addGold(-def.cost);
  pad.type = type;
  pad.tier = 0;
  pad.cool = 0.25;
  pad.rally = nearestPath(pad);
  SFX.tap();
  if (type === 'bar') refreshSoldiers(pad);
  toast(def.name + ' rises.');
  hideMenus();
}

function upgradeTower(pad) {
  const next = TOWERS[pad.type].tiers[pad.tier + 1];
  if (!next) return;
  if (state.gold < next.cost) { toast('Need more coin.'); return; }
  addGold(-next.cost);
  pad.tier++;
  pad.cool = 0.15;
  SFX.coin();
  if (pad.type === 'bar') refreshSoldiers(pad);
  toast(next.name + ' — ' + next.extra);
  hideMenus();
}

function sellTower(pad) {
  const back = Math.round(invested(pad) * 0.6);
  addGold(back);
  state.soldiers = state.soldiers.filter((s) => s.home !== pad);
  pad.type = null;
  pad.tier = 0;
  toast('Sold for ' + back + ' gold.');
  hideMenus();
}

function refreshSoldiers(pad) {
  const d = towerDef(pad);
  const have = state.soldiers.filter((s) => s.home === pad);
  have.forEach((s) => {
    s.mhp = d.hp; s.dmg = d.dmg; s.rate = d.rate;
    if (s.hp > 0) s.hp = Math.min(s.mhp, s.hp + 8);
  });
  while (state.soldiers.filter((s) => s.home === pad).length < d.soldiers) spawnSoldier(pad);
}

function spawnSoldier(home) {
  const d = home && home.type ? towerDef(home) : { hp: 40, dmg: 6, rate: 0.7 };
  state.soldiers.push({
    home, temp: false, life: 1e9,
    x: home.x + 6, y: home.y + 8,
    hp: d.hp, mhp: d.hp, dmg: d.dmg, rate: d.rate, atkT: 0, respawn: 0, facing: 1
  });
}

function dropReinforce(p) {
  const d0 = nearestPath(p);
  const a = pathAt(d0, false);
  const b = pathAt(clamp(d0 + 22, 0, PATH.total), false);
  [a, b].forEach((q) => {
    state.soldiers.push({
      home: null, temp: true, life: 14,
      x: q.x, y: q.y, hp: 46, mhp: 46, dmg: 7, rate: 0.6, atkT: 0, respawn: 0, facing: 1
    });
  });
  state.placing = null;
  state.reinforceCd = 20;
  toast('Reinforcements on the road!');
  SFX.horn();
}

function useAbility(h) {
  if (!h || h.cd > 0 || h.hp <= 0) return;
  if (h.id === 'julian') lionheart(h);
  else if (h.id === 'papa') volley(h);
  else bulwark(h);
  h.cd = h.cdMax;
  syncHeroUI();
}

function lionheart(h) {
  const e = nearestEnemy(h, 170);
  const ang = e ? Math.atan2(e.y - h.y, e.x - h.x) : (h.facing > 0 ? 0 : Math.PI);
  h.x = clamp(h.x + Math.cos(ang) * 78, 20, W - 20);
  h.y = clamp(h.y + Math.sin(ang) * 78, 40, H - 20);
  h.tx = h.x; h.ty = h.y;
  h.glow = 1.4;
  h.smash = 0.25;
  livingEnemies().forEach((en) => {
    if (Math.hypot(en.x - h.x, en.y - h.y) < 78) {
      hurt(en, 42 + (h.empower > 0 ? 12 : 0), '#9ec4ff');
      en.stun = Math.max(en.stun, 0.35);
    }
  });
  state.shake = 10;
  SFX.smash();
  toast('Julian the Brave stands!');
  state.fx.push({ kind: 'ring', x: h.x, y: h.y, life: 0.45, r: 20, color: '#4a78d8' });
}

function shootArrow(h, e, dmg) {
  if (!e) return;
  state.shots.push({
    x: h.x + (h.facing || 1) * 16, y: h.y - 14,
    tx: e.x, ty: e.y, target: e,
    spd: 460, dmg: dmg, splash: 0, type: 'arrow', tint: 'papa', tier: 0, r: 3
  });
  SFX.bow();
}

function volley(h) {
  h.volley = 7;
  h.volleyGap = 0;
  h.smash = 0.22;
  SFX.bow();
  toast('Volley! Papa rains stout arrows.');
}

function bulwark(h) {
  livingEnemies().forEach((en) => {
    if (Math.hypot(en.x - h.x, en.y - h.y) < 72) {
      hurt(en, 18, '#cfe6ff');
      en.stun = Math.max(en.stun, 1.3);
    }
  });
  const d = nearestPath(h);
  const p = pathAt(d, false);
  const tang = p.ang + Math.PI / 2;
  state.walls.push({
    x: p.x, y: p.y, hp: 92, mhp: 92, life: 9,
    x1: p.x + Math.cos(tang) * 34, y1: p.y + Math.sin(tang) * 34,
    x2: p.x - Math.cos(tang) * 34, y2: p.y - Math.sin(tang) * 34
  });
  h.smash = 0.25;
  SFX.smash();
  toast('Bulwark! The lane is shut.');
}

function update(dt) {
  if (state.mode !== 'play') return;
  state.t += dt;
  state.toastT -= dt;
  if (state.toastT <= 0) $('#toast').hidden = true;
  state.tripleCd = Math.max(0, state.tripleCd - dt);
  state.shake *= 0.88;
  if (state.reinforceCd > 0) state.reinforceCd -= dt;
  if (state.callCd > 0) state.callCd -= dt;
  if (state.moveMark) {
    state.moveMark.life -= dt;
    if (state.moveMark.life <= 0) state.moveMark = null;
  }

  state.spawnQ = state.spawnQ.filter((s) => {
    if (state.t >= s.t) { spawnEnemy(s.k, s.w); return false; }
    return true;
  });

  updateHeroes(dt);
  updateSoldiers(dt);
  updateWalls(dt);
  updateEnemies(dt);
  updateTowers(dt);
  updateShots(dt);
  updateFx(dt);
  updateBirds(dt);
  updatePulses(dt);

  if (state.lives <= 0) defeat();
  else checkVictory();
  syncCds();
}

function updateHeroes(dt) {
  state.heroes.forEach((h) => {
    if (h.cd > 0) h.cd -= dt;
    if (h.glow > 0) h.glow -= dt;
    if (h.empower > 0) h.empower -= dt;
    if (h.smash > 0) h.smash -= dt;
    if (h.hp <= 0) {
      h.deadT += dt;
      if (h.deadT > 6) {
        h.hp = h.mhp * 0.6;
        h.deadT = 0;
        floatText(h.x, h.y, 'returns', '#ffe36a');
      }
      return;
    }
    const dx = h.tx - h.x, dy = h.ty - h.y;
    const d = Math.hypot(dx, dy);
    if (d > 4) {
      const sp = h.spd * dt;
      h.x += dx / d * Math.min(sp, d);
      h.y += dy / d * Math.min(sp, d);
      h.facing = dx >= 0 ? 1 : -1;
      h.pose += dt * 8;
    }
    if (h.volley > 0) {
      h.volleyGap -= dt;
      if (h.volleyGap <= 0) {
        const ve = nearestEnemy(h, 230);
        if (ve) {
          h.facing = ve.x >= h.x ? 1 : -1;
          shootArrow(h, ve, h.dmg * 0.9 + (h.empower > 0 ? 4 : 0));
        }
        h.volley--;
        h.volleyGap = 0.09;
        h.smash = 0.12;
      }
    }
    const e = nearestEnemy(h, h.range + 8);
    h.atkT -= dt;
    if (e && Math.hypot(e.x - h.x, e.y - h.y) <= h.range) {
      if (h.atkT <= 0) {
        h.atkT = h.rate;
        h.smash = 0.16;
        const mul = (h.empower > 0 ? 1.8 : 1) * (h.glow > 0 ? 1.3 : 1);
        if (h.id === 'papa') {
          h.facing = e.x >= h.x ? 1 : -1;
          shootArrow(h, e, h.dmg * mul);
        } else {
          const col = h.id === 'julian' ? '#9ec4ff' : '#c8b4ff';
          hurt(e, h.dmg * mul, col);
          if (h.id === 'shadow') e.slow = Math.max(e.slow, 1.4);
          SFX.slash();
        }
      }
    }
    if (h.id === 'shadow') {
      livingEnemies().forEach((en) => {
        if (!en.fly && Math.hypot(en.x - h.x, en.y - h.y) < 34) en.slow = Math.max(en.slow, 0.45);
      });
    }
  });
}

function soldierRally(s) {
  if (s.home && s.home.rally != null) {
    const p = pathAt(s.home.rally, false);
    const sibs = state.soldiers.filter((o) => o.home === s.home);
    const idx = Math.max(0, sibs.indexOf(s));
    return { x: p.x + (idx - 1) * 16, y: p.y + (idx % 2) * 12 };
  }
  return { x: s.x, y: s.y };
}

function updateSoldiers(dt) {
  state.soldiers.forEach((s) => {
    if (s.temp) s.life -= dt;
    if (s.hp <= 0 && !s.temp) {
      s.respawn += dt;
      const wait = (s.home && s.home.tier >= 2) ? 3.1 : 4.2;
      if (s.respawn >= wait && s.home && s.home.type === 'bar') {
        const d = towerDef(s.home);
        s.hp = d.hp; s.mhp = d.hp; s.dmg = d.dmg; s.rate = d.rate; s.respawn = 0;
        s.x = s.home.x; s.y = s.home.y;
      }
    }
  });
  state.soldiers = state.soldiers.filter((s) => !(s.temp && (s.life <= 0 || s.hp <= 0)));
  state.soldiers.forEach((s) => {
    if (s.hp <= 0) return;
    const e = nearestEnemy(s, 42, (en) => !en.fly);
    s.atkT -= dt;
    if (e && Math.hypot(e.x - s.x, e.y - s.y) < 28) {
      if (s.atkT <= 0) { s.atkT = s.rate; hurt(e, s.dmg, '#ffe8c0'); }
      return;
    }
    const t = soldierRally(s);
    const dx = t.x - s.x, dy = t.y - s.y, d = Math.hypot(dx, dy);
    if (d > 3) {
      s.x += dx / d * 70 * dt;
      s.y += dy / d * 70 * dt;
      s.facing = dx >= 0 ? 1 : -1;
    }
  });
}

function updateWalls(dt) {
  state.walls.forEach((w) => { w.life -= dt; });
  state.walls = state.walls.filter((w) => w.life > 0 && w.hp > 0);
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function blockersNear(e) {
  if (e.fly) return null;
  let best = null, bd = 22;
  for (let i = 0; i < state.soldiers.length; i++) {
    const s = state.soldiers[i];
    if (s.hp <= 0) continue;
    const d = Math.hypot(s.x - e.x, s.y - e.y);
    if (d < bd) { bd = d; best = { kind: 'sol', ref: s }; }
  }
  for (let i = 0; i < state.walls.length; i++) {
    const w = state.walls[i];
    if (distToSeg(e.x, e.y, w.x1, w.y1, w.x2, w.y2) < 16) best = { kind: 'wall', ref: w };
  }
  const tank = state.heroes.find((h) => h.id === 'shadow' && h.hp > 0);
  if (tank && Math.hypot(tank.x - e.x, tank.y - e.y) < 22) best = { kind: 'shadow', ref: tank };
  return best;
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.dead || e.hp <= 0) { state.enemies.splice(i, 1); continue; }
    e.flash = Math.max(0, e.flash - dt);
    e.bob += dt * 6;
    if (e.stun > 0) { e.stun -= dt; continue; }
    if (e.burn > 0) {
      e.burn -= dt;
      e.hp -= e.burnDps * dt;
      if (e.hp <= 0) { kill(e); continue; }
    }
    const blk = blockersNear(e);
    if (blk) {
      e.atkT -= dt;
      if (e.atkT <= 0) {
        e.atkT = e.kind === 'brute' || e.kind === 'boss' ? 0.7 : 0.85;
        const dmg = e.kind === 'boss' ? 18 : e.kind === 'brute' ? 10 : 6;
        blk.ref.hp -= dmg;
        if (blk.kind === 'shadow' && blk.ref.hp <= 0) floatText(blk.ref.x, blk.ref.y, 'Aussie yields', '#c8b4ff');
      }
      continue;
    }
    const slow = e.slow > 0 ? 0.62 : 1;
    if (e.slow > 0) e.slow -= dt;
    e.d += e.spd * slow * dt;
    const p = pathAt(e.d, e.fly);
    e.x = p.x;
    e.y = p.y + Math.sin(e.bob) * (e.fly ? 4 : 1);
    e.ang = p.ang;
    if (e.d >= PATH.total - 4) {
      state.lives = Math.max(0, state.lives - e.leak);
      hudLives();
      SFX.leak();
      state.shake = 8;
      toast(e.kind === 'boss' ? 'The Gatebreaker reaches the gate!' : 'A foe slips into the keep!');
      state.enemies.splice(i, 1);
    }
  }
}

function updateTowers(dt) {
  state.towers.forEach((t) => {
    if (!t.type || t.type === 'bar') return;
    t.cool -= dt;
    if (t.cool > 0) return;
    const d = towerDef(t);
    const e = nearestEnemy(t, d.range);
    if (!e) return;
    t.cool = d.rate;
    state.shots.push({
      x: t.x, y: t.y - 18, tx: e.x, ty: e.y, target: e,
      spd: t.type === 'treb' ? 280 : t.type === 'sun' ? 320 : 520,
      dmg: d.dmg, splash: d.splash, type: t.type, tier: t.tier,
      r: t.type === 'treb' ? 7 : 4
    });
    if (t.type === 'bow') SFX.bow();
    else if (t.type === 'sun') SFX.magic();
    else SFX.rock();
  });
}

function updateShots(dt) {
  for (let i = state.shots.length - 1; i >= 0; i--) {
    const s = state.shots[i];
    const aim = (s.target && s.target.hp > 0) ? s.target : { x: s.tx, y: s.ty };
    const dx = aim.x - s.x, dy = aim.y - s.y, d = Math.hypot(dx, dy) || 1;
    const step = s.spd * dt;
    if (d <= step + 6) {
      impact(s, aim);
      state.shots.splice(i, 1);
    } else {
      s.x += dx / d * step;
      s.y += dy / d * step;
    }
  }
}

function impact(s, at) {
  const hit = (e) => {
    hurt(e, s.dmg, s.type === 'sun' ? '#ffb060' : '#fff8e0');
    if (s.type === 'sun') { e.burn = s.tier >= 1 ? 2.6 : 1.8; e.burnDps = s.tier >= 1 ? 7 : 4; }
    if (s.type === 'treb' && s.tier >= 2) e.stun = Math.max(e.stun, 0.45);
  };
  if (s.splash) {
    livingEnemies().forEach((e) => {
      if (Math.hypot(e.x - at.x, e.y - at.y) <= s.splash) hit(e);
    });
  } else if (s.target && s.target.hp > 0) {
    hit(s.target);
    if (s.type === 'bow' && s.tier >= 2) {
      const extra = nearestEnemy(s.target, 70, (en) => en !== s.target);
      if (extra) hurt(extra, s.dmg * 0.55, '#fff8e0');
    }
  }
  if (s.type === 'sun' && s.tier >= 2) {
    state.pulses.push({ x: at.x, y: at.y, t: 0.22, r: (s.splash || 40) * 0.85, dmg: s.dmg * 0.45 });
  }
  state.fx.push({ kind: 'burst', x: at.x, y: at.y, life: 0.25, r: s.splash ? 16 : 8, color: s.type === 'sun' ? '#ffb040' : '#d8c8a0' });
}

function updatePulses(dt) {
  for (let i = state.pulses.length - 1; i >= 0; i--) {
    const p = state.pulses[i];
    p.t -= dt;
    if (p.t <= 0) {
      livingEnemies().forEach((e) => {
        if (Math.hypot(e.x - p.x, e.y - p.y) <= p.r) hurt(e, p.dmg, '#ffb060');
      });
      state.pulses.splice(i, 1);
    }
  }
}

function updateFx(dt) {
  state.fx.forEach((f) => {
    f.life -= dt;
    f.x += (f.vx || 0) * dt;
    f.y += (f.vy || 0) * dt;
    if (f.kind === 'coin') f.vy += 180 * dt;
  });
  state.fx = state.fx.filter((f) => f.life > 0);
  if (state.fx.length > 180) state.fx.splice(0, state.fx.length - 180);
  state.floats.forEach((f) => { f.life -= dt; f.y -= 22 * dt; });
  state.floats = state.floats.filter((f) => f.life > 0);
}

function updateBirds(dt) {
  state.birds.forEach((b) => {
    b.t += dt;
    b.x += b.vx * dt;
    b.y += Math.sin(b.t * 2.2) * 8 * dt;
    if (b.x > 1320) b.x = -20;
    if (b.x < -30) b.x = 1310;
  });
}

function checkVictory() {
  if (state.wave < currentWaves().length) return;
  if (state.spawnQ.length) return;
  if (livingEnemies().length) return;
  if (state.mode !== 'play') return;
  if (state.level < LEVELS.length - 1) nextSiege();
  else victory();
}

function nextSiege() {
  state.mode = 'next';
  SFX.cheer();
  hideMenus();
  const nxt = LEVELS[state.level + 1];
  $('#nextTitle').textContent = nxt.name + ' waits.';
  $('#nextLine').textContent = 'Harder road. Tighter purse. Julian still stands.';
  $('#scrNext').hidden = false;
  showHud(false);
}

function startNextSiege() {
  $('#scrNext').hidden = true;
  resetRun(state.level + 1);
  state.mode = 'play';
  showHud(true);
  toast(currentLevel().name + '. Hold the gate.');
}

function showHud(on) {
  $('#hudTop').hidden = !on;
  $('#hudBot').hidden = !on;
  resize();
  requestAnimationFrame(resize);
}

function defeat() {
  state.mode = 'defeat';
  SFX.lose();
  hideMenus();
  $('#scrDefeat').hidden = false;
  showHud(false);
}

function victory() {
  state.mode = 'victory';
  SFX.win();
  hideMenus();
  $('#scrVictory').hidden = false;
  showHud(false);
}

function blob(c, x, y, rx, ry) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function paint(c, fill, stroke, lw) {
  c.fillStyle = fill;
  if (lw !== 0) {
    c.strokeStyle = stroke || '#1a140c';
    c.lineWidth = lw == null ? 3 : lw;
    c.lineJoin = 'round';
    c.lineCap = 'round';
  }
  c.fill();
  if (lw !== 0) c.stroke();
}
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function fillLin(c, x0, y0, x1, y1, a, b) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
function fillRad(c, x, y, r0, r1, a, b) {
  const g = c.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
function contactShadow(c, x, y, rx, ry) {
  blob(c, x, y, rx, ry);
  paint(c, 'rgba(18, 10, 6, 0.38)', 'rgba(18, 10, 6, 0.38)', 0);
}

function view() {
  const r = canvas.getBoundingClientRect();
  const sx = r.width / W;
  const sy = r.height / H;
  return { s: sx, sx, sy, ox: 0, oy: 0, r };
}

function resize() {
  const r = canvas.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(r.width * dpr));
  const h = Math.max(2, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function worldFromEvent(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left) / Math.max(1, r.width) * W,
    y: (ev.clientY - r.top) / Math.max(1, r.height) * H
  };
}

function draw() {
  const c = ctx;
  const v = view();
  const dprX = canvas.width / Math.max(1, v.r.width);
  const dprY = canvas.height / Math.max(1, v.r.height);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.setTransform(dprX * v.sx, 0, 0, dprY * v.sy, 0, 0);
  if (state.shake > 0.4) {
    c.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  drawSky(c);
  drawHills(c);
  drawForest(c);
  drawRiver(c);
  drawPath(c);
  drawBridge(c);
  drawKeep(c);
  drawDecor(c);
  drawPads(c);
  state.towers.forEach((t) => { if (t.type) drawTower(c, t); });
  state.walls.forEach((w) => drawWall(c, w));
  state.soldiers.forEach((s) => { if (s.hp > 0) drawSoldier(c, s); });
  state.enemies.forEach((e) => drawEnemy(c, e));
  state.heroes.forEach((h) => drawHeroWorld(c, h));
  state.shots.forEach((s) => drawShot(c, s));
  state.fx.forEach((f) => drawFx(c, f));
  state.floats.forEach((f) => {
    c.globalAlpha = clamp(f.life * 1.4, 0, 1);
    c.fillStyle = f.color;
    c.font = '700 14px Palatino, serif';
    c.textAlign = 'center';
    c.fillText(f.text, f.x, f.y);
    c.globalAlpha = 1;
  });
  if (state.moveMark && state.moveMark.life > 0) {
    const m = state.moveMark;
    c.globalAlpha = clamp(m.life * 2, 0, 1);
    c.beginPath();
    c.arc(m.x, m.y, 10 + (1 - m.life) * 8, 0, Math.PI * 2);
    c.strokeStyle = '#e6b423';
    c.lineWidth = 3;
    c.stroke();
    c.beginPath();
    c.moveTo(m.x - 7, m.y); c.lineTo(m.x + 7, m.y);
    c.moveTo(m.x, m.y - 7); c.lineTo(m.x, m.y + 7);
    c.stroke();
    c.globalAlpha = 1;
  }
  if (state.selected && state.selected.kind === 'hero') {
    const h = state.selected.ref;
    if (h && h.hp > 0 && h.vanish <= 0) {
      c.beginPath();
      c.arc(h.x, h.y + 18, 22, 0, Math.PI * 2);
      c.strokeStyle = '#e6b423';
      c.lineWidth = 3;
      c.stroke();
    }
  }
  if (state.selected && state.selected.kind === 'tower' && state.selected.ref.type && state.selected.ref.type !== 'bar') {
    const t = state.selected.ref;
    const d = towerDef(t);
    c.beginPath();
    c.arc(t.x, t.y, d.range, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(230,180,35,0.35)';
    c.lineWidth = 2;
    c.stroke();
  }
  if (state.placing === 'reinforce' || state.rallyPick) {
    c.fillStyle = '#f4e6c4';
    c.font = '700 16px Palatino, serif';
    c.textAlign = 'center';
    c.fillText(state.rallyPick ? 'Tap the road to set a rally' : 'Tap the road to drop soldiers', 640, 36);
  } else if (state.mode === 'play' || state.mode === 'start') {
    c.fillStyle = 'rgba(244,230,196,0.72)';
    c.font = '700 13px Palatino, serif';
    c.textAlign = 'left';
    c.fillText(currentLevel().name, 16, 26);
  }
}

function drawSky(c) {
  const dusk = (currentLevel().dusk || 0);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, dusk > 0.3 ? '#1a2848' : dusk > 0 ? '#4a6a98' : '#6aa8cc');
  g.addColorStop(0.28, dusk > 0.3 ? '#3a3858' : dusk > 0 ? '#8a7a68' : '#9cc4d8');
  g.addColorStop(0.52, dusk > 0.3 ? '#5a3a48' : dusk > 0 ? '#b89068' : '#c8d090');
  g.addColorStop(1, dusk > 0.3 ? '#1c2c18' : dusk > 0 ? '#4a6e38' : '#5a8236');
  c.fillStyle = g;
  c.fillRect(-40, -40, W + 80, H + 80);
  if (dusk > 0.3) {
    blob(c, 200, 86, 26, 26); paint(c, fillRad(c, 192, 78, 2, 26, '#f4ecd8', '#c8b898'), '#a89870', 2);
    c.globalAlpha = 0.16;
    blob(c, 200, 86, 52, 52); paint(c, '#f0e8c8', '#f0e8c8', 0);
    c.globalAlpha = 1;
  } else {
    blob(c, 1080, 78, 36, 36); paint(c, fillRad(c, 1068, 66, 4, 36, '#fff6c4', '#e0a028'), '#c48820', 2);
    c.globalAlpha = 0.2;
    blob(c, 1080, 78, 70, 70); paint(c, '#ffe8a0', '#ffe8a0', 0);
    c.globalAlpha = 1;
  }
  const clouds = dusk > 0.3
    ? [[320, 64, 0.85], [700, 48, 1.05]]
    : [[180, 70, 1], [420, 50, 1.2], [760, 64, 0.9]];
  clouds.forEach(([x, y, sc]) => {
    c.save(); c.translate(x, y); c.scale(sc, sc);
    const lit = dusk > 0.3 ? '#6a6478' : '#f6f4ee';
    const mid = dusk > 0.3 ? '#4a4458' : '#d8dce0';
    const shade = dusk > 0.3 ? '#2e2838' : '#b8c0c4';
    blob(c, 0, 4, 38, 14); paint(c, fillLin(c, 0, -10, 0, 16, mid, shade), shade, 1.5);
    blob(c, 22, 2, 20, 11); paint(c, fillLin(c, 22, -8, 22, 12, lit, mid), mid, 1.5);
    blob(c, -20, 6, 16, 9); paint(c, fillLin(c, -20, -4, -20, 14, mid, shade), shade, 1.5);
    c.restore();
  });
}

function drawHills(c) {
  const dusk = currentLevel().dusk || 0;
  const topA = dusk > 0.3 ? '#2c4430' : dusk > 0 ? '#3a6234' : '#4a7230';
  const topB = dusk > 0.3 ? '#1c3020' : dusk > 0 ? '#2a4a26' : '#345826';
  const botA = dusk > 0.3 ? '#203428' : dusk > 0 ? '#2c4a28' : '#385c28';
  const botB = dusk > 0.3 ? '#142018' : dusk > 0 ? '#1e3420' : '#284820';
  c.beginPath();
  c.moveTo(-20, 520);
  c.quadraticCurveTo(200, 400, 420, 460);
  c.quadraticCurveTo(700, 540, 980, 430);
  c.quadraticCurveTo(1180, 360, 1320, 400);
  c.lineTo(1320, 760); c.lineTo(-20, 760); c.closePath();
  paint(c, fillLin(c, 0, 380, 0, 720, topA, topB), '#243820', 3);
  c.beginPath();
  c.moveTo(-20, 600);
  c.quadraticCurveTo(300, 520, 640, 610);
  c.quadraticCurveTo(960, 690, 1320, 560);
  c.lineTo(1320, 760); c.lineTo(-20, 760); c.closePath();
  paint(c, fillLin(c, 0, 520, 0, 740, botA, botB), '#1c2c18', 2);
}

function drawTree(c, x, y, s, tone) {
  c.save();
  c.translate(x, y); c.scale(s, s);
  contactShadow(c, 2, 48, 16, 5);
  c.beginPath(); c.moveTo(-7, 12); c.lineTo(-3, 48); c.lineTo(5, 48); c.lineTo(6, 12); c.closePath();
  paint(c, fillLin(c, -6, 12, 8, 12, '#6a4630', '#3a2418'), '#241610', 2);
  c.strokeStyle = 'rgba(30,16,8,0.35)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 16); c.lineTo(-1, 44); c.stroke();
  blob(c, -12, 2, 20, 16); paint(c, fillRad(c, -16, -4, 2, 20, tone, '#142010'), '#142010', 2);
  blob(c, 14, 6, 18, 14); paint(c, fillRad(c, 10, 0, 2, 18, tone, '#142010'), '#142010', 2);
  blob(c, 0, -14, 22, 18); paint(c, fillRad(c, -4, -22, 3, 20, tone, '#142010'), '#142010', 2);
  c.globalAlpha = 0.22;
  blob(c, -6, -18, 10, 7); paint(c, '#d8ecc0', '#d8ecc0', 0);
  c.globalAlpha = 1;
  c.restore();
}

function drawForest(c) {
  const lv = state.level;
  const dusk = currentLevel().dusk || 0;
  const tones = dusk > 0.3
    ? ['#1e3a22', '#2a4a28', '#163018', '#304a2a']
    : ['#2f6a2c', '#3a7a30', '#245820', '#4a8a38'];
  const spots = lv === 1
    ? [[30, 360, 1.1], [70, 300, 0.9], [20, 250, 0.8], [40, 500, 1], [90, 560, 1.1], [160, 600, 0.8]]
    : [
      [30, 360, 1.3], [70, 300, 1.1], [20, 250, 0.9], [110, 240, 1.2], [60, 200, 1],
      [150, 180, 0.85], [40, 500, 1.1], [90, 560, 1.3], [20, 600, 1], [160, 600, 0.9],
      [200, 160, 0.8], [260, 120, 1], [340, 90, 0.85]
    ];
  spots.forEach(([x, y, sc], i) => drawTree(c, x, y, sc, tones[i % 4]));
  const rocks = lv === 2
    ? [[180, 520], [300, 560], [460, 200], [640, 640], [780, 360], [860, 200], [500, 360], [980, 120]]
    : lv === 1
      ? [[300, 560], [640, 640]]
      : [[300, 560], [640, 640], [860, 200], [500, 360]];
  const rock = dusk > 0.3 ? '#4a443c' : '#7a7064';
  const rock2 = dusk > 0.3 ? '#2e2822' : '#5a5448';
  rocks.forEach(([x, y]) => {
    contactShadow(c, x + 6, y + 8, 20, 6);
    blob(c, x, y, 22, 12); paint(c, fillLin(c, x - 10, y - 10, x + 12, y + 10, rock, rock2), '#2a241c', 2);
    blob(c, x + 14, y + 4, 12, 8); paint(c, fillLin(c, x + 8, y - 2, x + 20, y + 10, rock, rock2), '#2a241c', 2);
    c.globalAlpha = 0.25;
    blob(c, x - 6, y - 4, 6, 3); paint(c, '#d8d0c0', '#d8d0c0', 0);
    c.globalAlpha = 1;
  });
}

function drawRiver(c) {
  const lv = state.level;
  const water = lv === 2 ? '#1a3a58' : lv === 1 ? '#2a6a9a' : '#3a7ea8';
  const edge = lv === 2 ? '#0a2030' : '#1a3a50';
  if (lv === 1) {
    c.beginPath();
    c.moveTo(-10, 430);
    c.quadraticCurveTo(180, 390, 320, 300);
    c.quadraticCurveTo(480, 210, 700, 280);
    c.quadraticCurveTo(900, 360, 1080, 220);
    c.quadraticCurveTo(1180, 140, 1320, 120);
    c.lineTo(1320, 210);
    c.quadraticCurveTo(1160, 230, 1060, 300);
    c.quadraticCurveTo(880, 430, 680, 360);
    c.quadraticCurveTo(480, 290, 300, 380);
    c.quadraticCurveTo(140, 460, -10, 510);
    c.closePath();
    paint(c, water, edge, 3);
    c.globalAlpha = 0.4;
    c.beginPath();
    c.moveTo(40, 450); c.quadraticCurveTo(400, 280, 900, 320);
    c.strokeStyle = '#cfefff'; c.lineWidth = 5; c.stroke();
    c.globalAlpha = 1;
    return;
  }
  c.beginPath();
  c.moveTo(700, 720);
  c.quadraticCurveTo(740, 600, 790, 540);
  c.quadraticCurveTo(860, 470, 920, 420);
  c.quadraticCurveTo(980, 360, 1040, 200);
  c.quadraticCurveTo(1080, 80, 1120, -10);
  c.lineTo(1180, -10);
  c.quadraticCurveTo(1120, 90, 1080, 210);
  c.quadraticCurveTo(1020, 380, 960, 450);
  c.quadraticCurveTo(880, 530, 840, 620);
  c.quadraticCurveTo(810, 680, 800, 730);
  c.closePath();
  paint(c, water, edge, 3);
  c.globalAlpha = lv === 2 ? 0.18 : 0.35;
  c.beginPath();
  c.moveTo(820, 680); c.quadraticCurveTo(860, 520, 1000, 260);
  c.strokeStyle = lv === 2 ? '#8ab0c8' : '#cfefff'; c.lineWidth = 4; c.stroke();
  c.globalAlpha = 1;
}

function drawPath(c) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(PATH.pts[0].x, PATH.pts[0].y);
  for (let i = 1; i < PATH.pts.length; i++) c.lineTo(PATH.pts[i].x, PATH.pts[i].y);
  c.strokeStyle = '#3a2818'; c.lineWidth = 54; c.stroke();
  c.strokeStyle = '#6a4a2c'; c.lineWidth = 44; c.stroke();
  c.strokeStyle = '#8a6840'; c.lineWidth = 30; c.stroke();
  c.strokeStyle = '#a08052'; c.lineWidth = 14; c.stroke();
  c.save();
  c.globalAlpha = 0.18;
  c.strokeStyle = '#4a3018';
  c.lineWidth = 2;
  c.setLineDash([10, 18]);
  c.stroke();
  c.setLineDash([]);
  c.restore();
  for (let d = 0; d < PATH.total; d += 40) {
    const p = pathAt(d, false);
    const nx = Math.cos(p.ang + Math.PI / 2), ny = Math.sin(p.ang + Math.PI / 2);
    blob(c, p.x + nx * 23, p.y + ny * 23, 5, 3.2); paint(c, fillLin(c, 0, -2, 0, 4, '#7a7268', '#4a443c'), '#2a241c', 1.5);
    blob(c, p.x - nx * 22, p.y - ny * 22, 4.2, 2.8); paint(c, fillLin(c, 0, -2, 0, 4, '#6a6258', '#3a342c'), '#2a241c', 1.5);
  }
}

function drawBridge(c) {
  const lv = state.level;
  if (lv === 2) return;
  c.save();
  if (lv === 1) c.translate(700, 330);
  else c.translate(812, 498);
  c.rotate(lv === 1 ? 0.25 : 0.55);
  rr(c, -48, -18, 96, 36, 3); paint(c, fillLin(c, 0, -18, 0, 18, '#9a6a3c', '#5a381c'), '#2a180c', 2);
  for (let i = -3; i <= 3; i++) {
    c.beginPath(); c.moveTo(i * 12, -16); c.lineTo(i * 12, 16);
    c.strokeStyle = 'rgba(40,20,8,0.45)'; c.lineWidth = 2; c.stroke();
  }
  c.fillStyle = fillLin(c, 0, -22, 8, 22, '#6a4a28', '#3a2414');
  c.fillRect(-50, -22, 9, 44);
  c.fillRect(41, -22, 9, 44);
  c.strokeStyle = '#2a180c'; c.lineWidth = 2;
  c.strokeRect(-50, -22, 9, 44);
  c.strokeRect(41, -22, 9, 44);
  c.restore();
}

function drawKeep(c) {
  c.save();
  const end = PATH.pts[PATH.pts.length - 1];
  c.translate(1210, clamp((end.y || 368) - 68, 230, 380));
  contactShadow(c, 8, 148, 78, 12);
  rr(c, -70, 20, 150, 130, 5); paint(c, fillLin(c, -70, 20, 80, 150, '#9a9488', '#5a544c'), '#2a241c', 3);
  for (let y = 32; y < 140; y += 16) {
    c.beginPath(); c.moveTo(-66, y); c.lineTo(76, y);
    c.strokeStyle = 'rgba(30,24,18,0.22)'; c.lineWidth = 1; c.stroke();
  }
  rr(c, -8, 86, 36, 64, 3); paint(c, fillLin(c, -8, 86, 28, 150, '#4a3424', '#1e140c'), '#140e08', 2);
  c.fillStyle = '#2a1c12';
  c.fillRect(-4, 100, 28, 4);
  c.fillRect(-4, 118, 28, 4);
  blob(c, 10, 118, 14, 20); paint(c, '#1a120c', '#0c0806', 1.5);
  [[-78, -10], [64, -16], [-20, -50]].forEach(([x, y], i) => {
    rr(c, x, y, 40, 110, 3); paint(c, fillLin(c, x, y, x + 40, y + 110, '#a8a094', '#6a6458'), '#2a241c', 2);
    c.fillStyle = '#1a140c';
    c.fillRect(x + 14, y + 28, 8, 16);
    c.fillRect(x + 14, y + 58, 8, 16);
    c.beginPath();
    c.moveTo(x - 6, y + 4);
    c.lineTo(x + 20, y - 26);
    c.lineTo(x + 46, y + 4);
    c.closePath();
    paint(c, fillLin(c, x, y - 26, x + 20, y + 8, i === 2 ? '#a02830' : '#7a2028', '#3a1014'), '#1a0c0c', 2);
  });
  c.fillStyle = '#e6b423';
  c.font = '700 13px Palatino, serif';
  c.textAlign = 'center';
  c.fillText('777', 10, 78);
  c.fillStyle = fillLin(c, 86, -8, 94, 46, '#c42830', '#6a1418');
  c.fillRect(86, -8, 8, 54);
  c.beginPath(); c.moveTo(94, -8); c.lineTo(122, 8); c.lineTo(94, 22); c.closePath();
  paint(c, fillLin(c, 94, -8, 122, 22, '#e6c040', '#a07818'), '#1a140c', 2);
  c.fillStyle = '#1a140c';
  c.font = '700 9px Palatino, serif';
  c.fillText('7', 108, 12);
  c.restore();
}

function drawDecor(c) {
  const rp = runePos(), gp = guardPos();
  blob(c, rp.x, rp.y, 16, 12); paint(c, '#6e6a60', '#2a241c', 3);
  c.fillStyle = '#c9a227';
  c.font = '700 11px Palatino, serif';
  c.textAlign = 'center';
  c.globalAlpha = 0.55;
  c.fillText('7', rp.x, rp.y + 4);
  c.globalAlpha = 1;

  c.save();
  c.translate(gp.x, gp.y);
  blob(c, 0, 10, 14, 8); paint(c, '#4a3a28', '#1a140c', 2);
  blob(c, 10, 0, 10, 8); paint(c, '#d4b08a', '#1a140c', 2);
  c.beginPath(); c.moveTo(-8, 8); c.lineTo(8, 4); c.lineTo(6, 16); c.closePath();
  paint(c, '#6a1c22', '#1a140c', 2);
  c.fillStyle = '#1a140c';
  c.font = '700 10px Palatino, serif';
  c.fillText('z', 22, -6);
  c.restore();

  state.birds.forEach((b) => {
    c.save();
    c.translate(b.x, b.y);
    c.scale(b.s * (b.vx < 0 ? -1 : 1), b.s);
    c.beginPath();
    c.moveTo(-8, 0);
    c.quadraticCurveTo(0, -8 - Math.sin(b.t * 8) * 4, 8, 0);
    c.strokeStyle = '#1a140c';
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();
  });

  // grass tufts
  c.strokeStyle = '#2a4a18';
  c.lineWidth = 2;
  [[240, 600], [400, 640], [560, 580], [1000, 640], [380, 420]].forEach(([x, y]) => {
    c.beginPath();
    c.moveTo(x, y); c.quadraticCurveTo(x - 4, y - 10, x - 2, y - 16);
    c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 12, x + 6, y - 14);
    c.stroke();
  });
}

function drawPads(c) {
  state.towers.forEach((t) => {
    if (t.type) return;
    const sel = state.selected && state.selected.kind === 'tower' && state.selected.ref === t;
    blob(c, t.x, t.y + 10, 30, 10); paint(c, 'rgba(20,14,8,0.4)', 'rgba(20,14,8,0.4)', 0);
    c.beginPath();
    c.arc(t.x, t.y, 24, 0, Math.PI * 2);
    paint(c, fillRad(c, t.x - 6, t.y - 6, 2, 24, sel ? '#f0d060' : '#c8b090', sel ? '#a07820' : '#6a5840'), '#2a1c10', 2.5);
    c.beginPath();
    c.arc(t.x, t.y, 13, 0, Math.PI * 2);
    paint(c, fillRad(c, t.x - 3, t.y - 4, 1, 13, sel ? '#fff4c0' : '#b8a078', sel ? '#d4a028' : '#6a5840'), '#2a1c10', 1.5);
  });
}

function drawTower(c, t) {
  c.save();
  c.translate(t.x, t.y);
  contactShadow(c, 0, 14, 22, 6);
  if (t.type === 'bow') {
    rr(c, -17, -30, 34, 38, 4); paint(c, fillLin(c, -17, -30, 17, 8, '#8a5c38', '#4a2e18'), '#1a1008', 2);
    for (let i = -10; i <= 10; i += 7) {
      c.beginPath(); c.moveTo(i, -28); c.lineTo(i, 6);
      c.strokeStyle = 'rgba(30,16,8,0.28)'; c.lineWidth = 1; c.stroke();
    }
    blob(c, 0, -38, 22, 15); paint(c, fillRad(c, -6, -44, 2, 20, '#4a7a38', '#204818'), '#142010', 2);
    c.strokeStyle = '#3a2414'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-13, -16); c.quadraticCurveTo(0, 12, 13, -16); c.stroke();
    c.strokeStyle = '#c8b090'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-11, -16); c.lineTo(11, -16); c.stroke();
    c.beginPath(); c.moveTo(0, -20); c.lineTo(16, -38);
    c.strokeStyle = '#5a3a20'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#8a8070';
    c.beginPath(); c.moveTo(16, -38); c.lineTo(11, -36); c.lineTo(14, -32); c.closePath(); c.fill();
  } else if (t.type === 'sun') {
    c.beginPath(); c.arc(0, -6, 22, 0, Math.PI * 2);
    paint(c, fillRad(c, -6, -12, 3, 22, '#a05028', '#4a1c10'), '#1a0c08', 2);
    c.beginPath(); c.arc(0, -6, 12, 0, Math.PI * 2);
    paint(c, fillRad(c, -3, -10, 1, 12, t.tier >= 2 ? '#fff0a0' : '#f0b040', '#b05010'), '#4a2008', 1.5);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + state.t;
      c.beginPath();
      c.moveTo(Math.cos(a) * 14, -6 + Math.sin(a) * 14);
      c.lineTo(Math.cos(a) * 26, -6 + Math.sin(a) * 26);
      c.strokeStyle = '#e09030'; c.lineWidth = 2.5; c.stroke();
    }
  } else if (t.type === 'bar') {
    rr(c, -22, -32, 44, 40, 3); paint(c, fillLin(c, -22, -32, 22, 8, '#9a8a78', '#5a4e42'), '#1a140c', 2);
    for (let y = -24; y < 6; y += 10) {
      c.beginPath(); c.moveTo(-20, y); c.lineTo(20, y);
      c.strokeStyle = 'rgba(24,16,10,0.25)'; c.lineWidth = 1; c.stroke();
    }
    rr(c, -6, -8, 12, 16, 2); paint(c, fillLin(c, -6, -8, 6, 8, '#4a3424', '#1e140c'), '#100c08', 1.5);
    c.fillStyle = fillLin(c, 14, -50, 22, -20, '#c42830', '#6a1418');
    c.fillRect(15, -50, 5, 30);
    c.beginPath(); c.moveTo(20, -50); c.lineTo(38, -38); c.lineTo(20, -28); c.closePath();
    paint(c, fillLin(c, 20, -50, 38, -28, '#e8c040', '#a07818'), '#1a140c', 1.5);
    blob(c, 2, -16, 6, 6); paint(c, fillRad(c, 0, -18, 1, 6, '#e0c4a0', '#8a6a48'), '#1a140c', 1.5);
  } else {
    c.fillStyle = fillLin(c, -6, -8, 6, 14, '#7a5630', '#3a2814');
    c.fillRect(-6, -8, 12, 22);
    c.strokeStyle = '#1a1008'; c.lineWidth = 2; c.strokeRect(-6, -8, 12, 22);
    c.beginPath();
    c.moveTo(-28, -6); c.lineTo(4, -20); c.lineTo(30, -4); c.lineTo(8, 2); c.closePath();
    paint(c, fillLin(c, -28, -20, 20, 4, '#9a7a4c', '#5a4024'), '#1a1008', 2);
    blob(c, 18, -22, 7, 7); paint(c, fillRad(c, 16, -24, 1, 7, '#b0a898', '#5a5448'), '#1a140c', 1.5);
  }
  if (t.tier > 0) {
    c.fillStyle = '#e6b423';
    c.font = '700 10px Palatino, serif';
    c.textAlign = 'center';
    c.fillText(t.tier === 1 ? 'II' : 'III', 0, 24);
  }
  c.restore();
}

function drawWall(c, w) {
  const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
  const len = Math.hypot(dx, dy) || 1;
  c.save();
  c.globalAlpha = 0.28;
  c.strokeStyle = '#4a2878';
  c.lineWidth = 18;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(w.x1, w.y1);
  c.lineTo(w.x2, w.y2);
  c.stroke();
  c.restore();
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const x = w.x1 + dx * t, y = w.y1 + dy * t;
    const nx = -dy / len, ny = dx / len;
    c.beginPath();
    c.moveTo(x + nx * 3, y + ny * 3);
    c.lineTo(x - nx * 16, y - ny * 16);
    c.strokeStyle = '#2a1c14';
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.stroke();
    c.strokeStyle = '#6a4a30';
    c.lineWidth = 3;
    c.stroke();
    blob(c, x - nx * 16, y - ny * 16, 3.5, 3); paint(c, fillRad(c, x, y, 0, 4, '#6a6470', '#2a2430'), '#1a1418', 1);
  }
  const pct = clamp(w.hp / w.mhp, 0, 1);
  c.fillStyle = '#1a140c';
  c.fillRect(w.x - 16, w.y - 26, 32, 5);
  c.fillStyle = '#7aaa3a';
  c.fillRect(w.x - 16, w.y - 26, 32 * pct, 5);
}

function drawSoldier(c, s) {
  c.save();
  c.translate(s.x, s.y);
  c.scale(s.facing || 1, 1);
  contactShadow(c, 0, 12, 8, 3);
  const cloth = s.temp ? '#5a6a78' : '#7a3024';
  const clothD = s.temp ? '#3a4a58' : '#4a1814';
  rr(c, -4, 4, 3.5, 8, 1); paint(c, fillLin(c, -4, 4, 0, 12, '#4a3428', '#2a1c14'), '#1a1008', 1);
  rr(c, 1, 4, 3.5, 8, 1); paint(c, fillLin(c, 1, 4, 5, 12, '#4a3428', '#2a1c14'), '#1a1008', 1);
  rr(c, -7, -8, 14, 15, 3); paint(c, fillLin(c, -7, -8, 7, 7, cloth, clothD), '#1a1008', 1.5);
  c.fillStyle = fillLin(c, 5, -12, 9, 2, '#d0c8b0', '#6a6458');
  c.fillRect(6, -10, 2.5, 12);
  blob(c, 0, -14, 5.5, 5.5); paint(c, fillRad(c, -1.5, -16, 1, 6, '#e0c4a0', '#8a6a48'), '#2a1c10', 1.5);
  c.fillStyle = '#3a2418';
  c.fillRect(-5, -17, 10, 3);
  c.restore();
  if (s.hp < s.mhp) {
    c.fillStyle = '#1a140c';
    c.fillRect(s.x - 10, s.y - 26, 20, 4);
    c.fillStyle = '#7aaa3a';
    c.fillRect(s.x - 10, s.y - 26, 20 * clamp(s.hp / s.mhp, 0, 1), 4);
  }
}

function drawEnemy(c, e) {
  c.save();
  c.translate(e.x, e.y);
  if (e.flash > 0) c.globalAlpha = 0.55;
  const squash = e.kind === 'boss' ? 1.45 : 1;
  c.scale(Math.cos(e.ang) >= 0 ? 1 : -1, 1);
  contactShadow(c, 0, e.r + 3, e.r * 0.85, 3.5);
  if (e.kind === 'runner') {
    rr(c, -5, 4, 3, 8, 1); paint(c, '#3a5a28', '#1a140c', 1);
    rr(c, 2, 4, 3, 8, 1); paint(c, '#3a5a28', '#1a140c', 1);
    blob(c, 0, 1, 9, 8); paint(c, fillLin(c, -8, -6, 8, 10, '#5a9a3c', '#2a581c'), '#1a2410', 2);
    rr(c, -7, -4, 12, 8, 2); paint(c, fillLin(c, -7, -4, 5, 4, '#4a6a30', '#2a3a18'), '#1a140c', 1);
    blob(c, 7, -8, 6, 5.5); paint(c, fillRad(c, 5, -10, 1, 6, '#6aaa44', '#3a6a28'), '#1a2410', 1.5);
    c.beginPath(); c.moveTo(4, -13); c.lineTo(2, -18); c.lineTo(7, -13); c.closePath();
    paint(c, '#3a6a28', '#1a140c', 1);
    c.fillStyle = '#1a140c';
    c.beginPath(); c.arc(9, -9, 1.4, 0, 7); c.fill();
    c.fillStyle = '#d0c8b0';
    c.beginPath(); c.moveTo(12, -7); c.lineTo(20, -3); c.lineTo(12, -2); c.closePath(); c.fill();
  } else if (e.kind === 'brute') {
    rr(c, -8, 8, 5, 10, 1); paint(c, '#4a3a2c', '#1a140c', 1);
    rr(c, 3, 8, 5, 10, 1); paint(c, '#4a3a2c', '#1a140c', 1);
    blob(c, 0, 3, 14, 13); paint(c, fillLin(c, -12, -8, 12, 16, '#7a6048', '#3a2c20'), '#1a140c', 2);
    rr(c, -13, -6, 26, 13, 2); paint(c, fillLin(c, -13, -6, 13, 7, '#9a9080', '#5a5448'), '#2a241c', 1.5);
    blob(c, 6, -12, 8, 7); paint(c, fillRad(c, 4, -14, 1, 8, '#9a7a5c', '#5a4030'), '#1a140c', 1.5);
    c.fillStyle = '#1a140c';
    c.fillRect(-2, -16, 8, 3);
    c.fillStyle = fillLin(c, 14, -10, 20, 12, '#6a6054', '#2a241c');
    c.fillRect(14, -8, 5, 20);
    blob(c, 16, -12, 5, 5); paint(c, '#5a5448', '#1a140c', 1);
  } else if (e.kind === 'bat') {
    const flap = Math.sin(e.bob) * 5;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(-16, -10 - flap, -24, 2);
    c.quadraticCurveTo(-10, 4, 0, 3);
    c.quadraticCurveTo(10, 4, 24, 2);
    c.quadraticCurveTo(16, -10 - flap, 0, 0);
    paint(c, fillLin(c, 0, -12, 0, 8, '#4a3858', '#1e1428'), '#140e18', 1.5);
    c.strokeStyle = 'rgba(20,10,24,0.45)';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-20, -2 - flap * 0.4); c.moveTo(0, 0); c.lineTo(20, -2 - flap * 0.4); c.stroke();
    blob(c, 0, 0, 5.5, 5); paint(c, fillRad(c, -1, -2, 1, 6, '#3a2a40', '#1a1020'), '#100c14', 1.5);
    c.fillStyle = '#e8c040';
    c.beginPath(); c.arc(2, -1, 1.1, 0, 7); c.fill();
  } else {
    rr(c, -10, 12, 7, 12, 2); paint(c, '#3a1c20', '#1a0c0c', 1);
    rr(c, 4, 12, 7, 12, 2); paint(c, '#3a1c20', '#1a0c0c', 1);
    blob(c, 0, 5, 20 * squash, 17); paint(c, fillLin(c, -18, -10, 16, 22, '#7a3038', '#3a1418'), '#1a0c0c', 2.5);
    rr(c, -16, -4, 32, 14, 3); paint(c, fillLin(c, -16, -4, 16, 10, '#6a6458', '#2e2824'), '#1a140c', 1.5);
    blob(c, 8, -16, 12, 10); paint(c, fillRad(c, 5, -20, 2, 12, '#8a3a40', '#4a181c'), '#1a0c0c', 2);
    c.beginPath(); c.moveTo(-2, -24); c.lineTo(-8, -34); c.lineTo(2, -24); c.closePath();
    paint(c, '#4a2a20', '#1a0c0c', 1.5);
    c.beginPath(); c.moveTo(20, -18); c.lineTo(36, -28); c.lineTo(24, -10); c.closePath();
    paint(c, fillLin(c, 20, -28, 36, -10, '#d4c8b0', '#7a7060'), '#1a140c', 1.5);
    c.fillStyle = '#e6b423';
    c.font = '700 9px Palatino, serif';
    c.textAlign = 'center';
    c.fillText('M', 0, 8);
  }
  c.restore();
  if (e.hp < e.mhp || e.kind === 'boss') {
    const w = e.kind === 'boss' ? 46 : 22;
    c.fillStyle = '#1a140c';
    c.fillRect(e.x - w / 2, e.y - e.r - 16, w, 5);
    c.fillStyle = e.kind === 'boss' ? '#e6b423' : '#c44';
    c.fillRect(e.x - w / 2, e.y - e.r - 16, w * clamp(e.hp / e.mhp, 0, 1), 5);
  }
  if (e.kind === 'boss') {
    c.fillStyle = '#f4e6c4';
    c.font = '700 11px Palatino, serif';
    c.textAlign = 'center';
    c.fillText('Marrow the Gatebreaker', e.x, e.y - e.r - 22);
  }
}

function drawHeroWorld(c, h) {
  if (h.hp <= 0) {
    c.globalAlpha = 0.35;
    drawHeroFigure(c, h.x, h.y, h.id, 1, 0, h.facing, true);
    c.globalAlpha = 1;
    return;
  }
  if (h.vanish > 0) {
    c.globalAlpha = 0.15;
    drawHeroFigure(c, h.x, h.y, h.id, 1, 0, h.facing, false);
    c.globalAlpha = 1;
    return;
  }
  if (h.glow > 0 || h.empower > 0) {
    c.beginPath();
    c.arc(h.x, h.y, 28, 0, Math.PI * 2);
    c.fillStyle = h.empower > 0 ? 'rgba(230,180,35,0.28)' : 'rgba(255,220,80,0.22)';
    c.fill();
  }
  const swing = h.smash > 0 ? 1 : 0;
  drawHeroFigure(c, h.x, h.y, h.id, 1, swing, h.facing, false);
  if (h.hp < h.mhp) {
    c.fillStyle = '#1a140c';
    c.fillRect(h.x - 16, h.y - 36, 32, 5);
    c.fillStyle = '#e6b423';
    c.fillRect(h.x - 16, h.y - 36, 32 * clamp(h.hp / h.mhp, 0, 1), 5);
  }
}

function drawHeroFigure(c, x, y, id, s, swing, facing, down) {
  c.save();
  c.translate(x, y);
  c.scale((facing || 1) * s, s);
  if (down) c.rotate(0.4);
  const arm = swing ? -1.05 : -0.22;
  contactShadow(c, 1, 18, id === 'papa' ? 13 : 10, 4);
  if (id === 'julian') {
    c.beginPath(); c.moveTo(-4, -6); c.quadraticCurveTo(-24, 6, -14, 22); c.lineTo(8, 16); c.quadraticCurveTo(4, 4, 2, -4); c.closePath();
    paint(c, fillLin(c, -20, -8, 4, 22, '#2a4a8a', '#0e1a38'), '#0a1020', 2);
    rr(c, -5, 6, 4, 11, 1); paint(c, fillLin(c, -5, 6, -1, 16, '#1a1c28', '#0a0c14'), '#080a10', 1);
    rr(c, 2, 6, 4, 11, 1); paint(c, fillLin(c, 2, 6, 6, 16, '#1a1c28', '#0a0c14'), '#080a10', 1);
    rr(c, -10, -10, 20, 20, 3); paint(c, fillLin(c, -10, -10, 10, 10, '#2a2e3a', '#10141c'), '#0a1020', 2);
    c.beginPath(); c.moveTo(-8, -8); c.lineTo(8, -8); c.lineTo(6, 2); c.lineTo(-6, 2); c.closePath();
    paint(c, fillLin(c, 0, -8, 0, 4, '#3a4a68', '#1a2438'), '#0a1020', 1);
    c.save();
    c.translate(-13, 2);
    c.beginPath(); c.moveTo(-10, -8); c.lineTo(8, -4); c.lineTo(8, 12); c.lineTo(-8, 10); c.closePath();
    paint(c, fillLin(c, -10, -8, 8, 12, '#3a5aaa', '#1a2a58'), '#0a1020', 1.5);
    c.strokeStyle = '#c9d8ff'; c.lineWidth = 1;
    c.stroke();
    c.fillStyle = '#c9d8ff';
    c.font = '700 7px Palatino, serif';
    c.textAlign = 'center';
    c.fillText('777', -1, 4);
    c.restore();
    blob(c, 1, -20, 8, 7.5); paint(c, fillRad(c, -1, -22, 1, 8, '#e0c4a0', '#8a6a48'), '#0a1020', 1.5);
    rr(c, -8, -30, 16, 12, 3); paint(c, fillLin(c, -8, -30, 8, -18, '#2a303c', '#0c1018'), '#0a1020', 1.5);
    c.beginPath(); c.moveTo(2, -30); c.quadraticCurveTo(16, -44, 6, -28); paint(c, fillLin(c, 2, -44, 10, -28, '#4a78c8', '#1a3a78'), '#0a1020', 1.5);
    c.save();
    c.translate(11, 0);
    c.rotate(arm);
    c.fillStyle = fillLin(c, 0, -3, 0, 3, '#d8e0ec', '#7a8494');
    c.fillRect(0, -2, 28, 4);
    c.strokeStyle = '#0a1020'; c.lineWidth = 1.5; c.strokeRect(0, -2, 28, 4);
    c.fillStyle = '#9aa4b4';
    c.fillRect(8, -1, 14, 2);
    c.beginPath(); c.moveTo(28, -6); c.lineTo(38, 0); c.lineTo(28, 6); c.closePath();
    paint(c, fillLin(c, 28, -6, 38, 6, '#eef4fc', '#8a96a8'), '#0a1020', 1.5);
    c.restore();
  } else if (id === 'shadow') {
    c.beginPath();
    c.moveTo(-8, -10);
    c.quadraticCurveTo(-24, 8, -8, 24);
    c.lineTo(12, 18);
    c.quadraticCurveTo(18, 2, 8, -12);
    c.quadraticCurveTo(2, -22, -6, -16);
    c.closePath();
    paint(c, fillLin(c, -16, -16, 8, 22, '#2a2238', '#0c0a14'), '#0a0810', 2);
    c.beginPath();
    c.moveTo(-6, 0);
    c.quadraticCurveTo(-14, 10, -4, 20);
    c.strokeStyle = 'rgba(80, 50, 120, 0.35)';
    c.lineWidth = 2;
    c.stroke();
    rr(c, -4, 6, 3.2, 10, 1); paint(c, '#1a1424', '#0a0810', 1);
    rr(c, 2, 6, 3.2, 10, 1); paint(c, '#1a1424', '#0a0810', 1);
    rr(c, -7, -8, 15, 16, 3); paint(c, fillLin(c, -7, -8, 8, 8, '#2e263c', '#14101c'), '#0a0810', 1.5);
    blob(c, 2, -15, 7.5, 7.5); paint(c, fillRad(c, 0, -16, 1, 8, '#3a3048', '#14101c'), '#0a0810', 1.5);
    c.beginPath();
    c.moveTo(-6, -16);
    c.quadraticCurveTo(2, -28, 12, -14);
    c.quadraticCurveTo(8, -8, -4, -10);
    c.closePath();
    paint(c, fillLin(c, 0, -28, 6, -8, '#241c30', '#0c0a14'), '#0a0810', 1.5);
    c.fillStyle = '#d8b4ff';
    c.beginPath(); c.arc(3, -16, 1.7, 0, 7); c.arc(7, -16, 1.7, 0, 7); c.fill();
    c.save();
    c.translate(11, 1);
    c.rotate(arm * 0.85);
    c.fillStyle = fillLin(c, -2, -20, 2, 10, '#4a3424', '#1e140c');
    c.fillRect(-2.2, -18, 4.4, 26);
    c.strokeStyle = '#0a0810'; c.lineWidth = 1.2; c.strokeRect(-2.2, -18, 4.4, 26);
    blob(c, 0, -22, 9, 7); paint(c, fillRad(c, -2, -24, 1, 9, '#6a6470', '#2a2430'), '#0a0810', 1.5);
    c.fillStyle = 'rgba(216,180,255,0.35)';
    c.beginPath(); c.arc(-2, -24, 2, 0, 7); c.fill();
    c.restore();
  } else {
    rr(c, -7, 6, 5, 11, 1); paint(c, fillLin(c, -7, 6, -2, 16, '#5a3a22', '#2a1c10'), '#1a1008', 1);
    rr(c, 3, 6, 5, 11, 1); paint(c, fillLin(c, 3, 6, 8, 16, '#5a3a22', '#2a1c10'), '#1a1008', 1);
    blob(c, 0, 3, 14, 12); paint(c, fillLin(c, -12, -6, 12, 14, '#9a6a3c', '#5a381c'), '#2a180c', 2);
    rr(c, -12, -8, 16, 17, 3); paint(c, fillLin(c, -12, -8, 4, 9, '#e0c040', '#8a6818'), '#3a2a0c', 1.5);
    c.beginPath(); c.moveTo(-10, -2); c.lineTo(2, -2);
    c.strokeStyle = 'rgba(60,40,10,0.35)'; c.lineWidth = 1; c.stroke();
    c.save();
    c.translate(-10, -4);
    c.rotate(-0.35);
    c.fillStyle = fillLin(c, 0, 0, 6, 0, '#6a4a28', '#3a2814');
    c.fillRect(0, -10, 5, 16);
    c.fillStyle = '#c8a060';
    c.fillRect(1, -8, 3, 5);
    c.restore();
    blob(c, 2, -16, 8.5, 7.5); paint(c, fillRad(c, 0, -18, 1, 8, '#e0c4a0', '#8a6a48'), '#2a180c', 1.5);
    blob(c, 2, -10, 10, 6); paint(c, fillLin(c, 2, -16, 2, -4, '#7a5a3c', '#4a301c'), '#2a180c', 1.5);
    c.fillStyle = '#4a301c';
    c.beginPath(); c.arc(-2, -20, 2.2, 0, 7); c.arc(4, -21, 2.4, 0, 7); c.fill();
    c.save();
    c.translate(12, 1);
    c.rotate(arm * 0.4);
    c.strokeStyle = '#4a3018';
    c.lineWidth = 3.4;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(8, 0, 15, -1.15, 1.15);
    c.stroke();
    c.strokeStyle = '#c8b090';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-2, 0); c.lineTo(20, 0);
    c.stroke();
    c.fillStyle = '#8a8070';
    c.beginPath(); c.moveTo(20, 0); c.lineTo(14, -3); c.lineTo(14, 3); c.closePath(); c.fill();
    c.fillStyle = '#c9a227';
    c.beginPath(); c.moveTo(-2, -2.5); c.lineTo(2, 0); c.lineTo(-2, 2.5); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
}

function drawShot(c, s) {
  if (s.type === 'bow' || s.type === 'arrow') {
    const ang = Math.atan2((s.target && s.target.y || s.ty) - s.y, (s.target && s.target.x || s.tx) - s.x);
    const papa = s.tint === 'papa';
    c.save();
    c.translate(s.x, s.y);
    c.rotate(ang);
    c.strokeStyle = papa ? '#5a3a1c' : '#3a2414';
    c.lineWidth = papa ? 2.4 : 2;
    c.beginPath();
    c.moveTo(-10, 0);
    c.lineTo(9, 0);
    c.stroke();
    c.fillStyle = papa ? '#8a8070' : '#3a2a18';
    c.beginPath();
    c.moveTo(10, 0); c.lineTo(3, -3); c.lineTo(3, 3); c.closePath();
    c.fill();
    c.fillStyle = papa ? '#e6c040' : '#6a4a28';
    c.beginPath();
    c.moveTo(-10, 0); c.lineTo(-6, -2.5); c.lineTo(-6, 2.5); c.closePath();
    c.fill();
    c.restore();
  } else if (s.type === 'sun') {
    blob(c, s.x, s.y, 6, 6); paint(c, fillRad(c, s.x - 1, s.y - 2, 1, 6, '#ffe080', '#c05010'), '#8a3a10', 1.5);
  } else {
    blob(c, s.x, s.y, s.r, s.r * 0.8); paint(c, fillRad(c, s.x - 2, s.y - 2, 1, s.r, '#b0a898', '#5a5448'), '#1a140c', 1.5);
  }
}

function drawFx(c, f) {
  c.globalAlpha = clamp(f.life * 2, 0, 1);
  if (f.kind === 'coin') {
    blob(c, f.x, f.y, f.r, f.r); paint(c, '#e6b423', '#8a6a12', 2);
  } else if (f.kind === 'poof' || f.kind === 'burst') {
    blob(c, f.x, f.y, f.r, f.r * 0.7); paint(c, f.color || '#d8c8a0', '#1a140c', 1);
  } else if (f.kind === 'ring' || f.kind === 'spark') {
    c.beginPath();
    c.arc(f.x, f.y, f.r + (1 - f.life) * 40, 0, Math.PI * 2);
    c.strokeStyle = f.color || '#e6b423';
    c.lineWidth = 4;
    c.stroke();
  }
  c.globalAlpha = 1;
}

function paintMini(id, canvasEl) {
  const c = canvasEl.getContext('2d');
  c.clearRect(0, 0, 72, 72);
  c.translate(36, 44);
  c.scale(1.15, 1.15);
  drawHeroFigure(c, 0, 0, id, 1, 0, 1, false);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

function hideMenus() {
  $('#buildMenu').hidden = true;
  $('#towerMenu').hidden = true;
}

function placeSheet(el, worldX, worldY) {
  const v = view();
  const sx = worldX * v.sx;
  const sy = worldY * v.sy;
  el.style.left = '8px';
  el.style.top = '8px';
  const w = el.offsetWidth || 280;
  const h = el.offsetHeight || 160;
  const maxL = Math.max(8, v.r.width - w - 8);
  const maxT = Math.max(8, v.r.height - h - 8);
  el.style.left = clamp(sx - w / 2, 8, maxL) + 'px';
  el.style.top = clamp(sy - h - 16, 8, maxT) + 'px';
}

function openBuild(pad) {
  const el = $('#buildMenu');
  el.innerHTML = Object.keys(TOWERS).map((id) => {
    const t = TOWERS[id];
    const poor = state.gold < t.cost;
    return '<button type="button" data-build="' + id + '"' + (poor ? ' disabled' : '') + '>' +
      '<b>' + t.name + '</b><small>' + t.blurb + '</small>' +
      '<span class="cost">' + t.cost + ' gold</span></button>';
  }).join('');
  el.hidden = false;
  $('#towerMenu').hidden = true;
  placeSheet(el, pad.x, pad.y);
  el.onclick = (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-build');
    if (id) buildTower(pad, id);
  };
}

function openTower(pad) {
  const el = $('#towerMenu');
  const def = towerDef(pad);
  const next = TOWERS[pad.type].tiers[pad.tier + 1];
  let html = '<button type="button" disabled><b>' + def.name + '</b><small>' + def.extra + '</small></button>';
  if (next) {
    const poor = state.gold < next.cost;
    html += '<button type="button" data-act="up"' + (poor ? ' disabled' : '') + '>' +
      '<b>Upgrade: ' + next.name + '</b><small>' + next.extra + '</small>' +
      '<span class="cost">' + next.cost + ' gold</span></button>';
  } else {
    html += '<button type="button" disabled><b>Maxed</b><small>The tower is proud.</small></button>';
  }
  if (pad.type === 'bar') {
    html += '<button type="button" data-act="rally"><b>Rally</b><small>Tap the road to post soldiers</small></button>';
  }
  html += '<button type="button" class="sell" data-act="sell"><b>Sell</b><small>' + Math.round(invested(pad) * 0.6) + ' gold back</small></button>';
  el.innerHTML = html;
  el.hidden = false;
  $('#buildMenu').hidden = true;
  placeSheet(el, pad.x, pad.y);
  el.onclick = (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    if (act === 'up') upgradeTower(pad);
    else if (act === 'sell') sellTower(pad);
    else if (act === 'rally') {
      state.rallyPick = pad;
      hideMenus();
      toast('Tap the road to rally.');
    }
  };
}

function selectHero(h, fromSeq) {
  if (state.selected && state.selected.kind === 'hero' && state.selected.ref === h) {
    state.selected = null;
    hideMenus();
    syncHeroUI();
    SFX.tap();
    return;
  }
  state.selected = { kind: 'hero', ref: h };
  state.placing = null;
  hideMenus();
  if (fromSeq) {
    state.heroSeq.push(h.id);
    if (state.heroSeq.length > 3) state.heroSeq.shift();
    if (state.heroSeq[0] === 'julian' && state.heroSeq[1] === 'shadow' && state.heroSeq[2] === 'papa') {
      state.heroSeq = [];
      if (state.tripleCd <= 0) fireTriple('Julian, Shadow Aussie, Papa — 7 / 7 / 7.');
      else { addGold(7); toast('A quiet 7 for the three.'); }
    }
  }
  syncHeroUI();
  SFX.tap();
}

function setCdBar(btn, remaining, max) {
  if (!btn) return;
  const bar = btn.querySelector('.cd');
  if (!bar) return;
  if (remaining > 0 && max > 0) {
    bar.hidden = false;
    bar.textContent = '';
    bar.style.transform = 'scaleX(' + clamp(remaining / max, 0, 1).toFixed(4) + ')';
  } else {
    bar.hidden = true;
    bar.style.transform = 'scaleX(0)';
  }
}

function syncHeroUI() {
  const sel = state.selected && state.selected.kind === 'hero' ? state.selected.ref : null;
  ['julian', 'shadow', 'papa'].forEach((id) => {
    const btn = $('#hb' + id[0].toUpperCase() + id.slice(1));
    const h = state.heroes.find((x) => x.id === id);
    if (!btn || !h) return;
    btn.classList.toggle('sel', sel === h);
    setCdBar(btn, h.cd, h.cdMax);
  });
  const ab = $('#btnAbility');
  if (sel) {
    $('#abilityName').textContent = sel.ability;
    $('#abilityHint').textContent = sel.cd > 0 ? 'Gathering strength' : 'Tap to unleash';
    setCdBar(ab, sel.cd, sel.cdMax);
  } else {
    $('#abilityName').textContent = 'Hero Ability';
    $('#abilityHint').textContent = 'Select a hero';
    setCdBar(ab, 0, 1);
  }
}

function syncCds() {
  syncHeroUI();
  setCdBar($('#btnReinforce'), state.reinforceCd, 20);
}

function tapRune() {
  state.runeTaps++;
  SFX.tap();
  const rp = runePos(); floatText(rp.x, rp.y - 16, String(state.runeTaps), '#e6b423');
  if (state.runeTaps > 0 && state.runeTaps % 7 === 0) {
    if (state.tripleCd <= 0) fireTriple('The stone remembers seven.');
    else { addGold(7); toast('A secret 7 gold from the grass.'); }
  }
}

function tapBanner() {
  state.bannerTaps++;
  SFX.tap();
  if (state.bannerTaps > 0 && state.bannerTaps % 7 === 0) {
    addGold(7);
    toast('The crown remembers.');
    SFX.seven();
  }
}

function tapGuard() {
  SFX.snore();
  toast('Five more minutes, milord.');
}

function onWorldTap(p) {
  if (state.mode !== 'play') return;
  if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20) return;

  if (state.placing === 'reinforce') {
    dropReinforce(p);
    return;
  }
  if (state.rallyPick) {
    state.rallyPick.rally = nearestPath(p);
    state.rallyPick = null;
    toast('Rally set.');
    SFX.tap();
    return;
  }

  let bestPad = null, pd = 52;
  state.towers.forEach((t) => {
    const d = Math.hypot(t.x - p.x, t.y - p.y);
    if (d < pd) { pd = d; bestPad = t; }
  });
  if (bestPad) {
    state.selected = { kind: 'tower', ref: bestPad };
    syncHeroUI();
    if (!bestPad.type) openBuild(bestPad);
    else openTower(bestPad);
    SFX.tap();
    return;
  }

  let bestH = null, hd = 42;
  state.heroes.forEach((h) => {
    if (h.hp <= 0) return;
    const d = Math.hypot(h.x - p.x, h.y - 8 - p.y);
    if (d < hd) { hd = d; bestH = h; }
  });
  if (bestH) {
    selectHero(bestH, true);
    return;
  }

  const rp = runePos(), bp = bannerPos(), gp = guardPos();
  if (Math.hypot(p.x - rp.x, p.y - rp.y) < 28) { tapRune(); return; }
  if (Math.hypot(p.x - bp.x, p.y - bp.y) < 40) { tapBanner(); return; }
  if (Math.hypot(p.x - gp.x, p.y - gp.y) < 32) { tapGuard(); return; }
  for (let i = 0; i < state.birds.length; i++) {
    const b = state.birds[i];
    if (Math.hypot(p.x - b.x, p.y - b.y) < 22) { SFX.chirp(); toast('The birds have opinions.'); return; }
  }

  if (state.selected && state.selected.kind === 'hero') {
    const h = state.selected.ref;
    h.tx = clamp(p.x, 20, W - 20);
    h.ty = clamp(p.y, 40, H - 20);
    state.moveMark = { x: h.tx, y: h.ty, life: 0.7 };
    SFX.tap();
    return;
  }

  hideMenus();
  state.selected = null;
  syncHeroUI();
}

function startPlay() {
  ensureAudio();
  resetRun(0);
  state.mode = 'play';
  $('#scrStart').hidden = true;
  $('#scrStart').classList.remove('on');
  $('#scrHow').hidden = true;
  $('#scrPause').hidden = true;
  $('#scrDefeat').hidden = true;
  $('#scrVictory').hidden = true;
  $('#scrNext').hidden = true;
  showHud(true);
  resize();
  paintMini('julian', $('#hbJulian .mini'));
  paintMini('shadow', $('#hbShadow .mini'));
  paintMini('papa', $('#hbPapa .mini'));
  toast(currentLevel().name + '. Sir Julian the Brave stands at the gate.');
}

function pauseGame() {
  if (state.mode !== 'play') return;
  state.mode = 'pause';
  $('#scrPause').hidden = false;
}

function resumeGame() {
  $('#scrPause').hidden = true;
  if (state.mode === 'pause') state.mode = 'play';
}

function restartFromOverlay() {
  $('#scrPause').hidden = true;
  $('#scrDefeat').hidden = true;
  $('#scrVictory').hidden = true;
  $('#scrNext').hidden = true;
  const keep = state.level;
  startPlay();
  if (keep > 0) {
    resetRun(keep);
    state.mode = 'play';
    showHud(true);
    toast(currentLevel().name + '. Stand again.');
  }
}

function bindUI() {
  $('#btnPlay').onclick = startPlay;
  $('#btnHow').onclick = () => { $('#scrHow').hidden = false; };
  const closeHow = () => { $('#scrHow').hidden = true; };
  $('#btnHowClose').onclick = closeHow;
  $('#btnHowX').onclick = closeHow;
  $('#btnPause').onclick = pauseGame;
  $('#btnResume').onclick = resumeGame;
  $('#btnRestartPause').onclick = restartFromOverlay;
  $('#btnRetry').onclick = restartFromOverlay;
  $('#btnVictory').onclick = startPlay;
  $('#btnNext').onclick = startNextSiege;
  $('#btnMute').onclick = () => {
    soundOn = !soundOn;
    $('#btnMute').textContent = soundOn ? '♪' : '×';
    if (soundOn) ensureAudio();
  };
  $('#btnWave').onclick = () => { ensureAudio(); tryCallWave(); };
  $('#btnReinforce').onclick = () => {
    if (state.mode !== 'play') return;
    if (state.reinforceCd > 0) { toast('Soldiers are catching their breath.'); return; }
    state.placing = 'reinforce';
    hideMenus();
    toast('Tap the road.');
  };
  $('#btnAbility').onclick = () => {
    if (state.mode !== 'play') return;
    const sel = state.selected && state.selected.kind === 'hero' ? state.selected.ref : state.heroes[0];
    if (!state.selected || state.selected.kind !== 'hero') selectHero(sel, false);
    useAbility(sel);
  };
  ['julian', 'shadow', 'papa'].forEach((id) => {
    const btn = $('#hb' + id[0].toUpperCase() + id.slice(1));
    btn.onclick = () => {
      const h = state.heroes.find((x) => x.id === id);
      if (h) selectHero(h, true);
    };
  });

  canvas.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ensureAudio();
    canvas.setPointerCapture(ev.pointerId);
    onWorldTap(worldFromEvent(ev));
  }, { passive: false });

  document.addEventListener('click', ensureAudio, { once: true });

  ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => {
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  });
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  if (window.ResizeObserver) {
    new ResizeObserver(() => resize()).observe($('#stage'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && state.mode === 'play') { e.preventDefault(); tryCallWave(); }
    if (e.key === 'Escape' && state.mode === 'play') pauseGame();
    if (e.key === '1') { const h = state.heroes[0]; if (h) selectHero(h, true); }
    if (e.key === '2') { const h = state.heroes[1]; if (h) selectHero(h, true); }
    if (e.key === '3') { const h = state.heroes[2]; if (h) selectHero(h, true); }
    if (e.key === 'q' || e.key === 'Q') {
      const sel = state.selected && state.selected.kind === 'hero' ? state.selected.ref : null;
      if (sel) useAbility(sel);
    }
  });
}

let lastTs = 0;
function loop(ts) {
  const dt = lastTs ? clamp((ts - lastTs) / 1000, 0, 0.05) : 0.016;
  lastTs = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

bindUI();
resize();
resetRun();
showHud(false);
paintMini('julian', $('#hbJulian .mini'));
paintMini('shadow', $('#hbShadow .mini'));
paintMini('papa', $('#hbPapa .mini'));
requestAnimationFrame(loop);
