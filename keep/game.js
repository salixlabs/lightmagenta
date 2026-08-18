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

const WAVES = [
  { title: 'Stirring in the Wood', packs: [{ k: 'runner', n: 8, gap: 0.70 }] },
  { title: 'Heavy Footfalls', packs: [{ k: 'runner', n: 8, gap: 0.55 }, { k: 'brute', n: 2, gap: 1.5, wait: 3.2 }] },
  { title: 'Something on the Wind', packs: [{ k: 'runner', n: 6, gap: 0.50 }, { k: 'bat', n: 6, gap: 0.55, wait: 2.0 }] },
  { title: 'The Road Thickens', packs: [{ k: 'runner', n: 12, gap: 0.42 }, { k: 'brute', n: 4, gap: 1.1, wait: 2.2 }] },
  { title: 'Night and Oak', packs: [{ k: 'bat', n: 8, gap: 0.42 }, { k: 'runner', n: 8, gap: 0.40, wait: 1.2 }, { k: 'brute', n: 3, gap: 1.2, wait: 4.0 }] },
  { title: 'A Proper Row', packs: [{ k: 'runner', n: 16, gap: 0.34 }, { k: 'brute', n: 6, gap: 0.95, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 77, cheer: true, packs: [{ k: 'runner', n: 10, gap: 0.38 }, { k: 'bat', n: 6, gap: 0.48, wait: 1.6 }, { k: 'brute', n: 4, gap: 1.0, wait: 4.0 }] },
  { title: 'Wings and Iron', packs: [{ k: 'bat', n: 12, gap: 0.36 }, { k: 'brute', n: 8, gap: 0.85, wait: 2.0 }, { k: 'runner', n: 10, gap: 0.34, wait: 5.0 }] },
  { title: 'The Last Ordinary Hour', packs: [{ k: 'runner', n: 18, gap: 0.30 }, { k: 'brute', n: 8, gap: 0.72, wait: 2.0 }, { k: 'bat', n: 10, gap: 0.38, wait: 4.0 }] },
  { title: 'The Gatebreaker', packs: [{ k: 'boss', n: 1, gap: 0 }, { k: 'brute', n: 6, gap: 1.25, wait: 3.0 }, { k: 'runner', n: 12, gap: 0.36, wait: 2.0 }, { k: 'bat', n: 8, gap: 0.42, wait: 8.0 }] }
];

const PATH_PTS = [
  { x: 18, y: 438 }, { x: 150, y: 418 }, { x: 236, y: 318 }, { x: 318, y: 198 },
  { x: 468, y: 148 }, { x: 610, y: 188 }, { x: 698, y: 318 }, { x: 758, y: 478 },
  { x: 898, y: 538 }, { x: 1048, y: 478 }, { x: 1148, y: 392 }, { x: 1268, y: 368 }
];

const PADS = [
  { x: 188, y: 528 }, { x: 348, y: 292 }, { x: 498, y: 78 }, { x: 628, y: 318 },
  { x: 818, y: 358 }, { x: 928, y: 618 }, { x: 1088, y: 292 }, { x: 1138, y: 538 }
];

const RUNE = { x: 572, y: 86 };
const BANNER = { x: 1220, y: 292 };
const GUARD = { x: 1172, y: 448 };

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
const PATH = buildPath(PATH_PTS);

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
  callCd: 0
};

function toast(msg, t) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  state.toastT = t || 2.2;
}
function hudGold() { $('#statGold strong').textContent = String(state.gold); }
function hudLives() { $('#statLives strong').textContent = String(state.lives); }
function hudWave() { $('#statWave strong').textContent = state.wave + '/' + WAVES.length; }

function addGold(n) {
  state.gold = Math.max(0, (state.gold + n) | 0);
  if (n > 0) SFX.coin();
  hudGold();
  checkTriple();
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
    shadow: { name: 'Shadow', title: 'of the Cloak', hp: 118, dmg: 16, range: 40, spd: 148, rate: 0.36, ability: 'Nightfall', cdMax: 11 },
    papa: { name: 'Papa', title: 'the Warm', hp: 350, dmg: 11, range: 52, spd: 70, rate: 0.68, ability: 'Bulwark', cdMax: 16 }
  }[id];
  return {
    id, x, y, tx: x, ty: y,
    hp: base.hp, mhp: base.hp, dmg: base.dmg, range: base.range, spd: base.spd, rate: base.rate,
    name: base.name, title: base.title, ability: base.ability, cdMax: base.cdMax, cd: 0,
    atkT: 0, pose: 0, facing: 1, glow: 0, vanish: 0, vanishHit: 0, empower: 0, smash: 0, deadT: 0
  };
}

function resetRun() {
  hideMenus();
  state.gold = 250;
  state.lives = 21;
  state.wave = 0;
  state.waveStarted = false;
  state.spawnQ = [];
  state.enemies = [];
  state.towers = PADS.map((p) => ({ x: p.x, y: p.y, type: null, tier: 0, cool: 0, rally: nearestPath(p) }));
  state.soldiers = [];
  state.walls = [];
  state.shots = [];
  state.fx = [];
  state.floats = [];
  state.pulses = [];
  state.heroes = [
    makeHero('julian', 980, 360),
    makeHero('shadow', 940, 410),
    makeHero('papa', 1020, 420)
  ];
  state.selected = null;
  state.placing = null;
  state.rallyPick = null;
  state.shake = 0;
  state.t = 0;
  state.runeTaps = 0;
  state.bannerTaps = 0;
  state.heroSeq = [];
  state.tripleCd = 0;
  state.lastGold = 250;
  state.reinforceCd = 0;
  state.callCd = 0;
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
  const scale = 1 + waveIndex * 0.085;
  const p = pathAt(0, k.fly);
  state.enemies.push({
    kind, name: k.name, x: p.x, y: p.y, d: 0, ang: 0,
    hp: k.hp * scale, mhp: k.hp * scale, spd: k.spd, gold: k.gold, armor: k.armor,
    fly: k.fly, r: k.r, leak: k.leak, color: k.color,
    stun: 0, slow: 0, burn: 0, burnDps: 0, flash: 0, dead: false, atkT: 0, bob: Math.random() * 6
  });
}

function queueWave(idx) {
  const w = WAVES[idx];
  if (!w) return;
  state.wave = idx + 1;
  state.waveStarted = true;
  hudWave();
  SFX.horn();
  if (w.bonus) {
    addGold(w.bonus);
    SFX.cheer();
    toast("Julian's Favor! +77 gold. Julian the Brave stands!");
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
  if (next <= WAVES.length) {
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
  if (state.wave >= WAVES.length) return;
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
  else if (h.id === 'shadow') nightfall(h);
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
      hurt(en, 42 + (h.empower > 0 ? 12 : 0), '#ffe36a');
      en.stun = Math.max(en.stun, 0.35);
    }
  });
  state.shake = 10;
  SFX.smash();
  toast('Julian the Brave stands!');
  state.fx.push({ kind: 'ring', x: h.x, y: h.y, life: 0.45, r: 20, color: '#f0c44a' });
}

function nightfall(h) {
  h.vanish = 0.75;
  h.vanishHit = 0.75;
  SFX.vanish();
  toast('Nightfall.');
}

function resolveNightfall(h) {
  const e = weakestEnemy(h, 190) || nearestEnemy(h, 220);
  if (e) {
    h.x = clamp(e.x - 16, 20, W - 20);
    h.y = clamp(e.y, 40, H - 20);
    h.tx = h.x; h.ty = h.y;
    hurt(e, h.dmg * 3.2 + (h.empower > 0 ? 10 : 0), '#d8b4ff');
  }
  h.smash = 0.2;
  SFX.slash();
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
    if (h.vanish > 0) {
      h.vanish -= dt;
      if (h.vanish <= 0 && h.vanishHit > 0) {
        h.vanishHit = 0;
        resolveNightfall(h);
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
    const e = nearestEnemy(h, h.range + 8);
    h.atkT -= dt;
    if (e && Math.hypot(e.x - h.x, e.y - h.y) <= h.range) {
      if (h.atkT <= 0) {
        h.atkT = h.rate;
        h.smash = 0.16;
        const mul = (h.empower > 0 ? 1.8 : 1) * (h.glow > 0 ? 1.3 : 1);
        const col = h.id === 'julian' ? '#ffe36a' : h.id === 'shadow' ? '#d8b4ff' : '#cfe6ff';
        hurt(e, h.dmg * mul, col);
        if (h.id === 'papa') e.slow = Math.max(e.slow, 1.4);
        SFX.slash();
      }
    }
    if (h.id === 'papa') {
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
  const papa = state.heroes.find((h) => h.id === 'papa' && h.hp > 0);
  if (papa && Math.hypot(papa.x - e.x, papa.y - e.y) < 22) best = { kind: 'papa', ref: papa };
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
        if (blk.kind === 'papa' && blk.ref.hp <= 0) floatText(blk.ref.x, blk.ref.y, 'Papa yields', '#cfe6ff');
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
  if (state.wave < WAVES.length) return;
  if (state.spawnQ.length) return;
  if (livingEnemies().length) return;
  if (state.mode !== 'play') return;
  victory();
}

function showHud(on) {
  $('#hudTop').hidden = !on;
  $('#hudBot').hidden = !on;
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

function view() {
  const r = canvas.getBoundingClientRect();
  const s = Math.min(r.width / W, r.height / H);
  return { s, ox: (r.width - W * s) / 2, oy: (r.height - H * s) / 2, r };
}

function resize() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(2, Math.round(r.width * dpr));
  canvas.height = Math.max(2, Math.round(r.height * dpr));
}

function worldFromEvent(ev) {
  const v = view();
  return {
    x: (ev.clientX - v.r.left - v.ox) / v.s,
    y: (ev.clientY - v.r.top - v.oy) / v.s
  };
}

function draw() {
  const c = ctx;
  const v = view();
  const dpr = canvas.width / Math.max(1, v.r.width);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#0d120c';
  c.fillRect(0, 0, v.r.width, v.r.height);
  c.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.ox, dpr * v.oy);
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
  }
}

function drawSky(c) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#7eb7d8');
  g.addColorStop(0.42, '#c5d98a');
  g.addColorStop(1, '#6f9a44');
  c.fillStyle = g;
  c.fillRect(-40, -40, W + 80, H + 80);
  blob(c, 1080, 78, 38, 38); paint(c, '#ffe36a', '#e0b030', 3);
  c.globalAlpha = 0.22;
  blob(c, 1080, 78, 64, 64); paint(c, '#fff2a0', '#fff2a0', 0);
  c.globalAlpha = 1;
  [[180, 70, 1], [420, 50, 1.2], [760, 64, 0.9]].forEach(([x, y, s]) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    blob(c, 0, 0, 36, 16); paint(c, '#f4f7f2', '#d0d8d0', 2);
    blob(c, 24, 4, 22, 12); paint(c, '#ffffff', '#d0d8d0', 2);
    blob(c, -22, 6, 18, 10); paint(c, '#eef3ea', '#d0d8d0', 2);
    c.restore();
  });
}

function drawHills(c) {
  c.beginPath();
  c.moveTo(-20, 520);
  c.quadraticCurveTo(200, 400, 420, 460);
  c.quadraticCurveTo(700, 540, 980, 430);
  c.quadraticCurveTo(1180, 360, 1320, 400);
  c.lineTo(1320, 760); c.lineTo(-20, 760); c.closePath();
  paint(c, '#4d7c32', '#2d4a20', 4);
  c.beginPath();
  c.moveTo(-20, 600);
  c.quadraticCurveTo(300, 520, 640, 610);
  c.quadraticCurveTo(960, 690, 1320, 560);
  c.lineTo(1320, 760); c.lineTo(-20, 760); c.closePath();
  paint(c, '#3f6a2a', '#2a441c', 3);
}

function drawTree(c, x, y, s, tone) {
  c.save();
  c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-6, 10); c.lineTo(0, 46); c.lineTo(6, 10); c.closePath();
  paint(c, '#5a3a22', '#2a1a10', 3);
  blob(c, -14, 0, 22, 18); paint(c, tone, '#1a140c', 3);
  blob(c, 16, 4, 20, 16); paint(c, tone, '#1a140c', 3);
  blob(c, 0, -16, 24, 20); paint(c, tone, '#1a140c', 3);
  c.restore();
}

function drawForest(c) {
  const tones = ['#2f6a2c', '#3a7a30', '#245820', '#4a8a38'];
  const spots = [
    [30, 360, 1.3], [70, 300, 1.1], [20, 250, 0.9], [110, 240, 1.2], [60, 200, 1],
    [150, 180, 0.85], [40, 500, 1.1], [90, 560, 1.3], [20, 600, 1], [160, 600, 0.9],
    [200, 160, 0.8], [260, 120, 1], [340, 90, 0.85]
  ];
  spots.forEach(([x, y, s], i) => drawTree(c, x, y, s, tones[i % 4]));
  [[300, 560], [640, 640], [860, 200], [500, 360]].forEach(([x, y]) => {
    blob(c, x, y, 22, 12); paint(c, '#8a8070', '#3a3228', 3);
    blob(c, x + 14, y + 4, 12, 8); paint(c, '#6e675c', '#3a3228', 3);
  });
}

function drawRiver(c) {
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
  paint(c, '#3a7ea8', '#1a3a50', 3);
  c.globalAlpha = 0.35;
  c.beginPath();
  c.moveTo(820, 680); c.quadraticCurveTo(860, 520, 1000, 260);
  c.strokeStyle = '#cfefff'; c.lineWidth = 4; c.stroke();
  c.globalAlpha = 1;
}

function drawPath(c) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(PATH_PTS[0].x, PATH_PTS[0].y);
  for (let i = 1; i < PATH_PTS.length; i++) c.lineTo(PATH_PTS[i].x, PATH_PTS[i].y);
  c.strokeStyle = '#6a4a28'; c.lineWidth = 52; c.stroke();
  c.strokeStyle = '#c2a06a'; c.lineWidth = 40; c.stroke();
  c.strokeStyle = '#d8b87a'; c.lineWidth = 18; c.stroke();
  for (let d = 0; d < PATH.total; d += 46) {
    const p = pathAt(d, false);
    const nx = Math.cos(p.ang + Math.PI / 2), ny = Math.sin(p.ang + Math.PI / 2);
    blob(c, p.x + nx * 24, p.y + ny * 24, 5, 3.5); paint(c, '#7a7060', '#2a241c', 2);
    blob(c, p.x - nx * 24, p.y - ny * 24, 4.5, 3); paint(c, '#6a6054', '#2a241c', 2);
  }
}

function drawBridge(c) {
  c.save();
  c.translate(812, 498);
  c.rotate(0.55);
  rr(c, -46, -16, 92, 32, 4); paint(c, '#8a5a30', '#2a1a10', 3);
  for (let i = -3; i <= 3; i++) {
    c.beginPath(); c.moveTo(i * 12, -14); c.lineTo(i * 12, 14);
    c.strokeStyle = '#5a3a1c'; c.lineWidth = 2; c.stroke();
  }
  c.fillStyle = '#5a3a1c';
  c.fillRect(-48, -20, 8, 40);
  c.fillRect(40, -20, 8, 40);
  c.restore();
}

function drawKeep(c) {
  c.save();
  c.translate(1210, 300);
  rr(c, -70, 20, 150, 130, 6); paint(c, '#8d8678', '#2a241c', 4);
  rr(c, -8, 86, 36, 64, 4); paint(c, '#3a2a1c', '#1a140c', 3);
  blob(c, 10, 118, 16, 22); paint(c, '#2a1c12', '#1a140c', 2);
  [[-78, -10], [64, -16], [-20, -50]].forEach(([x, y], i) => {
    rr(c, x, y, 40, 110, 4); paint(c, '#9a9384', '#2a241c', 3);
    c.beginPath();
    c.moveTo(x - 6, y + 4);
    c.lineTo(x + 20, y - 28);
    c.lineTo(x + 46, y + 4);
    c.closePath();
    paint(c, i === 2 ? '#8a1c22' : '#6a1c22', '#1a140c', 3);
  });
  c.fillStyle = '#e6b423';
  c.font = '700 13px Palatino, serif';
  c.textAlign = 'center';
  c.fillText('777', 10, 78);
  c.fillStyle = '#b4232a';
  c.fillRect(86, -8, 8, 54);
  c.beginPath(); c.moveTo(94, -8); c.lineTo(122, 8); c.lineTo(94, 22); c.closePath();
  paint(c, '#d4a017', '#1a140c', 2);
  c.fillStyle = '#1a140c';
  c.font = '700 9px Palatino, serif';
  c.fillText('7', 108, 12);
  c.restore();
}

function drawDecor(c) {
  blob(c, RUNE.x, RUNE.y, 16, 12); paint(c, '#6e6a60', '#2a241c', 3);
  c.fillStyle = '#c9a227';
  c.font = '700 11px Palatino, serif';
  c.textAlign = 'center';
  c.globalAlpha = 0.55;
  c.fillText('7', RUNE.x, RUNE.y + 4);
  c.globalAlpha = 1;

  c.save();
  c.translate(GUARD.x, GUARD.y);
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
    blob(c, t.x, t.y + 6, 26, 10); paint(c, '#2a4418', '#1a140c', 2);
    c.beginPath();
    c.arc(t.x, t.y, 20, 0, Math.PI * 2);
    paint(c, sel ? '#e6b423' : '#c9b48a', '#3a2a18', 3);
    c.beginPath();
    c.arc(t.x, t.y, 11, 0, Math.PI * 2);
    paint(c, sel ? '#fff1b0' : '#a89068', '#3a2a18', 2);
  });
}

function drawTower(c, t) {
  c.save();
  c.translate(t.x, t.y);
  blob(c, 0, 10, 22, 8); paint(c, '#2a1a10', '#2a1a10', 0);
  if (t.type === 'bow') {
    rr(c, -16, -28, 32, 34, 5); paint(c, '#7a5230', '#1a140c', 3);
    blob(c, 0, -36, 22, 16); paint(c, '#3a7a30', '#1a140c', 3);
    c.strokeStyle = '#2a1a10'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-12, -18); c.quadraticCurveTo(0, 10, 12, -18); c.stroke();
    c.beginPath(); c.moveTo(0, -22); c.lineTo(18, -40); c.stroke();
  } else if (t.type === 'sun') {
    c.beginPath(); c.arc(0, -6, 22, 0, Math.PI * 2);
    paint(c, '#8a3a18', '#1a140c', 3);
    c.beginPath(); c.arc(0, -6, 12, 0, Math.PI * 2);
    paint(c, t.tier >= 2 ? '#ffe36a' : '#f0a030', '#1a140c', 2);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + state.t;
      c.beginPath();
      c.moveTo(Math.cos(a) * 14, -6 + Math.sin(a) * 14);
      c.lineTo(Math.cos(a) * 26, -6 + Math.sin(a) * 26);
      c.strokeStyle = '#f0a030'; c.lineWidth = 3; c.stroke();
    }
  } else if (t.type === 'bar') {
    rr(c, -22, -30, 44, 38, 4); paint(c, '#8a7a68', '#1a140c', 3);
    c.fillStyle = '#b4232a';
    c.fillRect(14, -48, 5, 28);
    c.beginPath(); c.moveTo(19, -48); c.lineTo(36, -36); c.lineTo(19, -28); c.closePath();
    paint(c, '#e6b423', '#1a140c', 2);
    blob(c, 0, -10, 8, 7); paint(c, '#d4b08a', '#1a140c', 2);
  } else {
    c.fillStyle = '#6a4a28';
    c.fillRect(-6, -8, 12, 22);
    c.strokeStyle = '#1a140c'; c.lineWidth = 3; c.strokeRect(-6, -8, 12, 22);
    c.beginPath();
    c.moveTo(-28, -6); c.lineTo(4, -18); c.lineTo(30, -4); c.lineTo(8, 2); c.closePath();
    paint(c, '#8a6a40', '#1a140c', 3);
    blob(c, 18, -22, 7, 7); paint(c, '#8a8070', '#1a140c', 2);
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
  c.strokeStyle = '#cfe6ff';
  c.lineWidth = 10;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(w.x1, w.y1);
  c.lineTo(w.x2, w.y2);
  c.stroke();
  c.strokeStyle = '#1a140c';
  c.lineWidth = 3;
  c.stroke();
  const pct = clamp(w.hp / w.mhp, 0, 1);
  c.fillStyle = '#1a140c';
  c.fillRect(w.x - 16, w.y - 22, 32, 5);
  c.fillStyle = '#7aaa3a';
  c.fillRect(w.x - 16, w.y - 22, 32 * pct, 5);
}

function drawSoldier(c, s) {
  c.save();
  c.translate(s.x, s.y);
  c.scale(s.facing || 1, 1);
  blob(c, 0, 10, 8, 4); paint(c, '#2a1a10', '#2a1a10', 0);
  rr(c, -7, -8, 14, 16, 3); paint(c, s.temp ? '#6a7a88' : '#8a3a28', '#1a140c', 2);
  blob(c, 0, -14, 6, 6); paint(c, '#d4b08a', '#1a140c', 2);
  c.fillStyle = '#e6b423';
  c.fillRect(4, -10, 3, 10);
  c.restore();
  if (s.hp < s.mhp) {
    c.fillStyle = '#1a140c';
    c.fillRect(s.x - 10, s.y - 24, 20, 4);
    c.fillStyle = '#7aaa3a';
    c.fillRect(s.x - 10, s.y - 24, 20 * clamp(s.hp / s.mhp, 0, 1), 4);
  }
}

function drawEnemy(c, e) {
  c.save();
  c.translate(e.x, e.y);
  if (e.flash > 0) c.globalAlpha = 0.55;
  const squash = e.kind === 'boss' ? 1.45 : 1;
  c.scale(Math.cos(e.ang) >= 0 ? 1 : -1, 1);
  blob(c, 0, e.r + 2, e.r * 0.9, 4); paint(c, '#2a1a10', '#2a1a10', 0);
  if (e.kind === 'runner') {
    blob(c, 0, 0, 11, 10); paint(c, '#4a8a32', '#1a140c', 3);
    blob(c, 8, -8, 7, 6); paint(c, '#5aaa3c', '#1a140c', 2);
    c.fillStyle = '#1a140c';
    c.beginPath(); c.arc(10, -9, 1.6, 0, 7); c.fill();
    c.fillStyle = '#c44';
    c.beginPath(); c.moveTo(14, -10); c.lineTo(20, -6); c.lineTo(14, -5); c.fill();
  } else if (e.kind === 'brute') {
    blob(c, 0, 2, 16, 15); paint(c, '#6a5340', '#1a140c', 3);
    rr(c, -12, -6, 24, 14, 3); paint(c, '#8a8070', '#1a140c', 2);
    blob(c, 6, -12, 9, 8); paint(c, '#8a6a50', '#1a140c', 2);
    c.fillStyle = '#1a140c';
    c.fillRect(14, -8, 4, 18);
  } else if (e.kind === 'bat') {
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(-18, -8 - Math.sin(e.bob) * 4, -22, 4);
    c.quadraticCurveTo(-8, 2, 0, 2);
    c.quadraticCurveTo(8, 2, 22, 4);
    c.quadraticCurveTo(18, -8 - Math.sin(e.bob) * 4, 0, 0);
    paint(c, '#3a2a48', '#1a140c', 2);
    blob(c, 0, 0, 6, 5); paint(c, '#2a1a30', '#1a140c', 2);
  } else {
    blob(c, 0, 4, 22 * squash, 20); paint(c, '#5a2028', '#1a140c', 4);
    blob(c, 10, -16, 14, 12); paint(c, '#6a2a30', '#1a140c', 3);
    c.beginPath(); c.moveTo(20, -20); c.lineTo(34, -28); c.lineTo(24, -12); c.closePath();
    paint(c, '#c8b8a0', '#1a140c', 2);
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
  const arm = swing ? -1.1 : -0.2;
  blob(c, 0, 16, 10, 4); paint(c, '#2a1a10', '#2a1a10', 0);
  if (id === 'julian') {
    c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(-22, 4, -16, 22); c.lineTo(4, 16); c.closePath();
    paint(c, '#b4232a', '#1a140c', 3);
    rr(c, -10, -10, 20, 22, 4); paint(c, '#e6b423', '#1a140c', 3);
    blob(c, 0, -20, 9, 8); paint(c, '#d4b08a', '#1a140c', 2);
    rr(c, -8, -30, 16, 12, 3); paint(c, '#e6b423', '#1a140c', 2);
    c.beginPath(); c.moveTo(2, -30); c.quadraticCurveTo(16, -44, 6, -28); paint(c, '#b4232a', '#1a140c', 2);
    c.save();
    c.translate(-12, 2);
    c.beginPath(); c.moveTo(-10, -8); c.lineTo(8, -4); c.lineTo(8, 12); c.lineTo(-8, 10); c.closePath();
    paint(c, '#c9a227', '#1a140c', 2);
    c.fillStyle = '#7a1c20';
    c.font = '700 7px Palatino, serif';
    c.textAlign = 'center';
    c.fillText('777', -1, 4);
    c.restore();
    c.save();
    c.translate(10, 0);
    c.rotate(arm);
    c.fillStyle = '#c8b8a0';
    c.fillRect(0, -3, 26, 5);
    c.strokeStyle = '#1a140c'; c.lineWidth = 2; c.strokeRect(0, -3, 26, 5);
    rr(c, 22, -8, 10, 14, 2); paint(c, '#e6e0d0', '#1a140c', 2);
    c.restore();
  } else if (id === 'shadow') {
    c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(-20, 10, -6, 22); c.lineTo(10, 16); c.quadraticCurveTo(16, 0, 8, -10); c.closePath();
    paint(c, '#1e1828', '#1a140c', 3);
    blob(c, 2, -14, 8, 8); paint(c, '#2a2238', '#1a140c', 2);
    c.fillStyle = '#d8b4ff';
    c.beginPath(); c.arc(4, -15, 1.8, 0, 7); c.arc(8, -15, 1.8, 0, 7); c.fill();
    c.save();
    c.translate(8, 0);
    c.rotate(arm);
    c.fillStyle = '#c8b8d8';
    c.fillRect(0, -2, 18, 3);
    c.fillRect(14, -6, 3, 10);
    c.restore();
  } else {
    blob(c, 0, 2, 14, 13); paint(c, '#8a5a32', '#1a140c', 3);
    rr(c, -12, -8, 16, 18, 3); paint(c, '#c9a227', '#1a140c', 2);
    blob(c, 2, -16, 9, 8); paint(c, '#d4b08a', '#1a140c', 2);
    blob(c, 2, -10, 10, 6); paint(c, '#6a4a32', '#1a140c', 2);
    c.save();
    c.translate(12, 2);
    c.rotate(arm * 0.8);
    c.fillStyle = '#5a3a22';
    c.fillRect(-3, -22, 6, 28);
    blob(c, 0, -26, 10, 8); paint(c, '#6a6054', '#1a140c', 2);
    c.restore();
  }
  c.restore();
}

function drawShot(c, s) {
  if (s.type === 'bow') {
    c.strokeStyle = '#2a1a10';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(s.x - 6, s.y);
    c.lineTo(s.x + 6, s.y);
    c.stroke();
  } else if (s.type === 'sun') {
    blob(c, s.x, s.y, 6, 6); paint(c, '#ffb040', '#8a3a10', 2);
  } else {
    blob(c, s.x, s.y, s.r, s.r * 0.8); paint(c, '#8a8070', '#1a140c', 2);
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
  const sx = v.ox + worldX * v.s;
  const sy = v.oy + worldY * v.s;
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
  }).join('') + '<button type="button" data-build="cancel"><b>Never mind</b><small>Keep the pad empty</small></button>';
  el.hidden = false;
  $('#towerMenu').hidden = true;
  placeSheet(el, pad.x, pad.y);
  el.onclick = (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-build');
    if (id === 'cancel') { hideMenus(); state.selected = null; return; }
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
  html += '<button type="button" data-act="close"><b>Close</b><small> </small></button>';
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
    } else if (act === 'close') { hideMenus(); state.selected = null; }
  };
}

function selectHero(h, fromSeq) {
  state.selected = { kind: 'hero', ref: h };
  state.placing = null;
  hideMenus();
  if (fromSeq) {
    state.heroSeq.push(h.id);
    if (state.heroSeq.length > 3) state.heroSeq.shift();
    if (state.heroSeq[0] === 'julian' && state.heroSeq[1] === 'shadow' && state.heroSeq[2] === 'papa') {
      state.heroSeq = [];
      if (state.tripleCd <= 0) fireTriple('Julian, Shadow, Papa — 7 / 7 / 7.');
      else { addGold(77); toast('A quiet 77 for the three.'); }
    }
  }
  syncHeroUI();
  SFX.tap();
}

function syncHeroUI() {
  const sel = state.selected && state.selected.kind === 'hero' ? state.selected.ref : null;
  ['julian', 'shadow', 'papa'].forEach((id) => {
    const btn = $('#hb' + id[0].toUpperCase() + id.slice(1));
    const h = state.heroes.find((x) => x.id === id);
    if (!btn || !h) return;
    btn.classList.toggle('sel', sel === h);
    const cd = btn.querySelector('.cd');
    if (h.cd > 0) { cd.hidden = false; cd.textContent = Math.ceil(h.cd); }
    else cd.hidden = true;
  });
  const ab = $('#btnAbility');
  if (sel) {
    $('#abilityName').textContent = sel.ability;
    $('#abilityHint').textContent = sel.cd > 0 ? 'Ready in ' + Math.ceil(sel.cd) + 's' : 'Tap to unleash';
    const cd = ab.querySelector('.cd');
    if (sel.cd > 0) { cd.hidden = false; cd.textContent = Math.ceil(sel.cd); }
    else cd.hidden = true;
  } else {
    $('#abilityName').textContent = 'Hero Ability';
    $('#abilityHint').textContent = 'Select a hero';
    ab.querySelector('.cd').hidden = true;
  }
}

function syncCds() {
  syncHeroUI();
  const r = $('#btnReinforce .cd');
  if (state.reinforceCd > 0) { r.hidden = false; r.textContent = Math.ceil(state.reinforceCd); }
  else r.hidden = true;
}

function tapRune() {
  state.runeTaps++;
  SFX.tap();
  floatText(RUNE.x, RUNE.y - 16, String(state.runeTaps), '#e6b423');
  if (state.runeTaps > 0 && state.runeTaps % 7 === 0) {
    if (state.tripleCd <= 0) fireTriple('The stone remembers seven.');
    else { addGold(77); toast('A secret 77 gold from the grass.'); }
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

  if (Math.hypot(p.x - RUNE.x, p.y - RUNE.y) < 28) { tapRune(); return; }
  if (Math.hypot(p.x - BANNER.x, p.y - BANNER.y) < 40) { tapBanner(); return; }
  if (Math.hypot(p.x - GUARD.x, p.y - GUARD.y) < 32) { tapGuard(); return; }
  for (let i = 0; i < state.birds.length; i++) {
    const b = state.birds[i];
    if (Math.hypot(p.x - b.x, p.y - b.y) < 22) { SFX.chirp(); toast('The birds have opinions.'); return; }
  }

  let bestPad = null, pd = 32;
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

  let bestH = null, hd = 30;
  state.heroes.forEach((h) => {
    if (h.hp <= 0) return;
    const d = Math.hypot(h.x - p.x, h.y - p.y);
    if (d < hd) { hd = d; bestH = h; }
  });
  if (bestH) {
    selectHero(bestH, true);
    return;
  }

  if (state.selected && state.selected.kind === 'hero') {
    const h = state.selected.ref;
    h.tx = clamp(p.x, 20, W - 20);
    h.ty = clamp(p.y, 40, H - 20);
    SFX.tap();
    return;
  }

  hideMenus();
  state.selected = null;
  syncHeroUI();
}

function startPlay() {
  ensureAudio();
  resetRun();
  state.mode = 'play';
  $('#scrStart').hidden = true;
  $('#scrStart').classList.remove('on');
  $('#scrHow').hidden = true;
  $('#scrPause').hidden = true;
  $('#scrDefeat').hidden = true;
  $('#scrVictory').hidden = true;
  showHud(true);
  paintMini('julian', $('#hbJulian .mini'));
  paintMini('shadow', $('#hbShadow .mini'));
  paintMini('papa', $('#hbPapa .mini'));
  toast('Sir Julian the Brave stands at the gate.');
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
  startPlay();
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
  $('#btnVictory').onclick = restartFromOverlay;
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
