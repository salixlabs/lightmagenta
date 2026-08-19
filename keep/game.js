'use strict';

/* THE LAST DEFENSE OF CAMELOT — Salix Labs. Original medieval tower defense. */

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
      { name: 'Stonehowl Trebuchet', cost: 0, dmg: 33, range: 232, rate: 2.35, splash: 58, extra: 'A rock with opinions.' },
      { name: 'Heavier Howl', cost: 160, dmg: 45, range: 248, rate: 2.08, splash: 70, extra: 'Bigger stone. Wider apology.' },
      { name: "Mountain's Voice", cost: 220, dmg: 55, range: 262, rate: 1.88, splash: 80, extra: 'Impact briefly stuns.' }
    ]
  }
};

const KINDS = {
  raider: { name: 'Thorn-Raider', hp: 24, spd: 66, gold: 8, armor: 0, fly: false, air: false, r: 11, leak: 1, color: '#2a2420' },
  arms: { name: 'Blackthorn Man-at-Arms', hp: 92, spd: 31, gold: 16, armor: 4, fly: false, air: false, r: 15, leak: 1, color: '#3a3430' },
  knight: { name: 'Corrupted Knight', hp: 128, spd: 34, gold: 22, armor: 7, fly: false, air: false, r: 16, leak: 1, elite: true, color: '#2e2824' },
  wight: { name: 'Thorn-Wight', hp: 118, spd: 22, gold: 20, armor: 3, fly: false, air: false, r: 17, leak: 1, color: '#1a2418' },
  hound: { name: "Morgan's Hound", hp: 20, spd: 86, gold: 12, armor: 0, fly: true, air: false, r: 10, leak: 1, color: '#141010' },
  champ: { name: 'Thorned Champion', hp: 380, spd: 26, gold: 40, armor: 8, fly: false, air: false, r: 22, leak: 2, elite: true, color: '#241810' },
  drake: { name: 'Thorn-Drake', hp: 1480, spd: 20, gold: 90, armor: 8, fly: false, air: false, r: 32, leak: 1, boss: true, elite: true, color: '#1a2014' },
  mordred: { name: 'Shade of Mordred', hp: 1680, spd: 21, gold: 110, armor: 6, fly: false, air: false, r: 28, leak: 1, boss: true, elite: true, color: '#1a1820' }
};

/* Veteran: +22% HP only — the 0.2.2 rule. No extra speed or count.
   Map 1 is Standard-feel; later maps step up with gentler per-map HP than the old 3-map curve. */
const VETERAN_HP = 1.22;

const W1 = [
  { title: 'The First Warning', packs: [{ k: 'raider', n: 8, gap: 0.70 }] },
  { title: 'Militia, to the road', packs: [{ k: 'raider', n: 8, gap: 0.55 }, { k: 'arms', n: 2, gap: 1.5, wait: 3.2 }] },
  { title: 'Ragged Cloaks', packs: [{ k: 'raider', n: 12, gap: 0.48 }, { k: 'arms', n: 2, gap: 1.3, wait: 2.4 }] },
  { title: 'The Road Thickens', packs: [{ k: 'raider', n: 12, gap: 0.42 }, { k: 'arms', n: 4, gap: 1.1, wait: 2.2 }] },
  { title: 'Thorn-Painted Faces', packs: [{ k: 'raider', n: 10, gap: 0.40 }, { k: 'arms', n: 3, gap: 1.2, wait: 2.0 }, { k: 'raider', n: 6, gap: 0.38, wait: 5.0 }] },
  { title: 'A Proper Row', packs: [{ k: 'raider', n: 16, gap: 0.34 }, { k: 'arms', n: 6, gap: 0.95, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'raider', n: 10, gap: 0.38 }, { k: 'arms', n: 4, gap: 1.0, wait: 2.0 }, { k: 'raider', n: 8, gap: 0.36, wait: 5.0 }] },
  { title: 'Iron in the Lane', packs: [{ k: 'arms', n: 8, gap: 0.85 }, { k: 'raider', n: 12, gap: 0.34, wait: 2.0 }] },
  { title: 'The Last Ordinary Hour', packs: [{ k: 'raider', n: 18, gap: 0.30 }, { k: 'arms', n: 8, gap: 0.72, wait: 2.0 }] },
  { title: 'Clear the Village Road', packs: [{ k: 'arms', n: 6, gap: 1.1 }, { k: 'raider', n: 14, gap: 0.34, wait: 2.0 }, { k: 'arms', n: 4, gap: 0.9, wait: 6.0 }] }
];
const W2 = [
  { title: 'Wet Boots', packs: [{ k: 'raider', n: 10, gap: 0.50 }, { k: 'arms', n: 2, gap: 1.2, wait: 2.0 }] },
  { title: 'The Ford Narrows', packs: [{ k: 'raider', n: 12, gap: 0.40 }, { k: 'arms', n: 4, gap: 0.95, wait: 1.8 }] },
  { title: 'Both Banks', merlin: true, packs: [{ k: 'arms', n: 5, gap: 0.85 }, { k: 'raider', n: 10, gap: 0.36, wait: 1.6 }] },
  { title: 'A Bad Current', packs: [{ k: 'raider', n: 14, gap: 0.32 }, { k: 'arms', n: 5, gap: 0.85, wait: 2.0 }] },
  { title: 'Shoulder to Shoulder', packs: [{ k: 'raider', n: 18, gap: 0.30 }, { k: 'arms', n: 6, gap: 0.75, wait: 2.2 }] },
  { title: 'Hold the Stones', packs: [{ k: 'arms', n: 8, gap: 0.70 }, { k: 'raider', n: 12, gap: 0.28, wait: 1.2 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'raider', n: 14, gap: 0.28 }, { k: 'arms', n: 6, gap: 0.7, wait: 1.8 }, { k: 'raider', n: 8, gap: 0.30, wait: 4.0 }] },
  { title: 'No Dry Ground', packs: [{ k: 'arms', n: 8, gap: 0.65 }, { k: 'raider', n: 16, gap: 0.26, wait: 1.5 }] },
  { title: 'The Ford Breaks', packs: [{ k: 'raider', n: 20, gap: 0.24 }, { k: 'arms', n: 8, gap: 0.60, wait: 1.8 }] },
  { title: 'Hold the Crossing', packs: [{ k: 'arms', n: 10, gap: 0.55 }, { k: 'raider', n: 16, gap: 0.24, wait: 1.2 }, { k: 'arms', n: 4, gap: 0.7, wait: 5.0 }] }
];
const W3 = [
  { title: 'Dust on the Stones', packs: [{ k: 'raider', n: 12, gap: 0.38 }, { k: 'arms', n: 4, gap: 0.9, wait: 1.4 }] },
  { title: 'Fallen Banners', packs: [{ k: 'arms', n: 6, gap: 0.70 }, { k: 'raider', n: 12, gap: 0.30, wait: 1.4 }] },
  { title: 'The First Betrayal', merlin: true, packs: [{ k: 'knight', n: 2, gap: 1.6 }, { k: 'raider', n: 10, gap: 0.32, wait: 1.2 }, { k: 'arms', n: 4, gap: 0.8, wait: 3.0 }] },
  { title: 'The Mile Tightens', packs: [{ k: 'raider', n: 16, gap: 0.26 }, { k: 'knight', n: 3, gap: 1.3, wait: 1.6 }, { k: 'arms', n: 5, gap: 0.7, wait: 3.2 }] },
  { title: 'No Soft Wave', packs: [{ k: 'arms', n: 8, gap: 0.55 }, { k: 'raider', n: 14, gap: 0.24, wait: 1.0 }, { k: 'knight', n: 3, gap: 1.1, wait: 3.2 }] },
  { title: 'Jerky Knightly Skill', packs: [{ k: 'knight', n: 5, gap: 0.95 }, { k: 'raider', n: 12, gap: 0.24, wait: 1.0 }, { k: 'arms', n: 6, gap: 0.6, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'raider', n: 14, gap: 0.24 }, { k: 'knight', n: 4, gap: 1.0, wait: 1.2 }, { k: 'arms', n: 6, gap: 0.55, wait: 3.0 }] },
  { title: 'The Road Remembers', packs: [{ k: 'knight', n: 6, gap: 0.80 }, { k: 'raider', n: 16, gap: 0.22, wait: 1.2 }, { k: 'arms', n: 6, gap: 0.55, wait: 4.0 }] },
  { title: 'Almost the Woods', packs: [{ k: 'raider', n: 18, gap: 0.20 }, { k: 'arms', n: 8, gap: 0.50, wait: 1.4 }, { k: 'knight', n: 5, gap: 0.85, wait: 3.2 }] },
  { title: 'Hold the Mile', packs: [{ k: 'knight', n: 6, gap: 0.75 }, { k: 'arms', n: 8, gap: 0.50, wait: 1.2 }, { k: 'raider', n: 16, gap: 0.20, wait: 3.0 }] }
];
const W4 = [
  { title: 'The Light Thins', packs: [{ k: 'raider', n: 12, gap: 0.36 }, { k: 'wight', n: 2, gap: 1.8, wait: 2.0 }] },
  { title: 'Grasping Roots', packs: [{ k: 'wight', n: 4, gap: 1.4 }, { k: 'raider', n: 10, gap: 0.32, wait: 1.2 }] },
  { title: "Morgan's Whisper", merlin: true, packs: [{ k: 'hound', n: 6, gap: 0.40 }, { k: 'wight', n: 3, gap: 1.3, wait: 1.6 }, { k: 'arms', n: 4, gap: 0.8, wait: 3.0 }] },
  { title: 'Thorn-Choked', packs: [{ k: 'wight', n: 5, gap: 1.1 }, { k: 'raider', n: 14, gap: 0.26, wait: 1.0 }, { k: 'hound', n: 6, gap: 0.36, wait: 3.2 }] },
  { title: 'Green Eyes', packs: [{ k: 'hound', n: 10, gap: 0.30 }, { k: 'knight', n: 3, gap: 1.1, wait: 1.4 }, { k: 'wight', n: 3, gap: 1.2, wait: 3.4 }] },
  { title: 'The Woods Close', packs: [{ k: 'wight', n: 6, gap: 0.95 }, { k: 'arms', n: 6, gap: 0.55, wait: 1.2 }, { k: 'hound', n: 8, gap: 0.28, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'raider', n: 12, gap: 0.24 }, { k: 'wight', n: 4, gap: 1.0, wait: 1.2 }, { k: 'hound', n: 8, gap: 0.28, wait: 3.0 }] },
  { title: 'Papa’s Lane', packs: [{ k: 'hound', n: 12, gap: 0.26 }, { k: 'wight', n: 5, gap: 0.9, wait: 1.0 }, { k: 'knight', n: 4, gap: 0.85, wait: 3.2 }] },
  { title: 'No Clean Shot', packs: [{ k: 'wight', n: 6, gap: 0.85 }, { k: 'raider', n: 16, gap: 0.22, wait: 1.0 }, { k: 'hound', n: 10, gap: 0.24, wait: 3.0 }] },
  { title: 'Leave the Woods', packs: [{ k: 'wight', n: 7, gap: 0.80 }, { k: 'knight', n: 5, gap: 0.75, wait: 1.2 }, { k: 'hound', n: 10, gap: 0.24, wait: 4.0 }] }
];
const W5 = [
  { title: 'The Border Wakes', packs: [{ k: 'raider', n: 12, gap: 0.32 }, { k: 'arms', n: 5, gap: 0.75, wait: 1.4 }] },
  { title: 'Watch-Fires', packs: [{ k: 'knight', n: 4, gap: 1.0 }, { k: 'hound', n: 8, gap: 0.30, wait: 1.2 }, { k: 'arms', n: 4, gap: 0.7, wait: 3.0 }] },
  { title: 'Half-Man, Half-Briar', merlin: true, packs: [{ k: 'champ', n: 1, gap: 0 }, { k: 'raider', n: 12, gap: 0.28, wait: 1.6 }, { k: 'arms', n: 5, gap: 0.65, wait: 3.0 }] },
  { title: 'The Forts Answer', packs: [{ k: 'wight', n: 4, gap: 1.0 }, { k: 'knight', n: 4, gap: 0.85, wait: 1.2 }, { k: 'hound', n: 8, gap: 0.26, wait: 3.0 }] },
  { title: 'Two Champions', packs: [{ k: 'champ', n: 2, gap: 3.2 }, { k: 'raider', n: 14, gap: 0.24, wait: 1.0 }, { k: 'arms', n: 6, gap: 0.55, wait: 3.4 }] },
  { title: 'Iron and Thorn', packs: [{ k: 'knight', n: 6, gap: 0.70 }, { k: 'wight', n: 4, gap: 0.9, wait: 1.4 }, { k: 'hound', n: 10, gap: 0.24, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'champ', n: 1, gap: 0 }, { k: 'raider', n: 14, gap: 0.22, wait: 1.2 }, { k: 'knight', n: 4, gap: 0.75, wait: 3.0 }] },
  { title: 'The Watch Cracks', packs: [{ k: 'champ', n: 2, gap: 2.6 }, { k: 'arms', n: 8, gap: 0.50, wait: 1.0 }, { k: 'hound', n: 10, gap: 0.22, wait: 4.0 }] },
  { title: 'No Soft Border', packs: [{ k: 'knight', n: 6, gap: 0.60 }, { k: 'wight', n: 5, gap: 0.8, wait: 1.2 }, { k: 'raider', n: 14, gap: 0.20, wait: 3.0 }] },
  { title: 'Leave the Towers', packs: [{ k: 'champ', n: 2, gap: 2.2 }, { k: 'knight', n: 6, gap: 0.58, wait: 1.0 }, { k: 'hound', n: 12, gap: 0.22, wait: 4.0 }, { k: 'arms', n: 6, gap: 0.5, wait: 6.0 }] }
];
const W6 = [
  { title: 'Scarred Fields', packs: [{ k: 'raider', n: 14, gap: 0.28 }, { k: 'arms', n: 6, gap: 0.65, wait: 1.2 }] },
  { title: 'Smoke on the Gates', packs: [{ k: 'knight', n: 5, gap: 0.80 }, { k: 'hound', n: 10, gap: 0.26, wait: 1.0 }, { k: 'wight', n: 3, gap: 1.1, wait: 3.0 }] },
  { title: 'Backs to the Stone', merlin: true, packs: [{ k: 'champ', n: 1, gap: 0 }, { k: 'arms', n: 8, gap: 0.50, wait: 1.4 }, { k: 'raider', n: 12, gap: 0.22, wait: 3.0 }] },
  { title: 'Witch-Fire Wind', packs: [{ k: 'hound', n: 12, gap: 0.22 }, { k: 'knight', n: 5, gap: 0.7, wait: 1.2 }, { k: 'wight', n: 4, gap: 0.9, wait: 3.2 }] },
  { title: 'The Approach Thickens', packs: [{ k: 'champ', n: 2, gap: 2.8 }, { k: 'raider', n: 16, gap: 0.20, wait: 1.0 }, { k: 'arms', n: 6, gap: 0.5, wait: 3.4 }] },
  { title: 'All Hosts', packs: [{ k: 'wight', n: 5, gap: 0.85 }, { k: 'knight', n: 6, gap: 0.58, wait: 1.0 }, { k: 'hound', n: 10, gap: 0.22, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'champ', n: 2, gap: 2.4 }, { k: 'raider', n: 14, gap: 0.20, wait: 1.0 }, { k: 'knight', n: 5, gap: 0.6, wait: 3.0 }] },
  { title: 'The Fields Burn', packs: [{ k: 'arms', n: 10, gap: 0.45 }, { k: 'hound', n: 12, gap: 0.20, wait: 1.2 }, { k: 'wight', n: 5, gap: 0.75, wait: 4.0 }] },
  { title: 'Almost the Gate', packs: [{ k: 'champ', n: 2, gap: 2.0 }, { k: 'knight', n: 6, gap: 0.52, wait: 1.0 }, { k: 'raider', n: 16, gap: 0.18, wait: 3.0 }] },
  { title: 'The Thorn-Drake', packs: [{ k: 'drake', n: 1, gap: 0 }, { k: 'champ', n: 1, gap: 0, wait: 4.0 }, { k: 'arms', n: 8, gap: 0.55, wait: 2.2 }, { k: 'hound', n: 10, gap: 0.22, wait: 6.0 }, { k: 'raider', n: 12, gap: 0.20, wait: 8.0 }] }
];
const W7 = [
  { title: 'The Outer Walls', packs: [{ k: 'raider', n: 14, gap: 0.26 }, { k: 'arms', n: 6, gap: 0.60, wait: 1.2 }] },
  { title: 'Morgan Strongest', merlin: true, packs: [{ k: 'hound', n: 12, gap: 0.22 }, { k: 'knight', n: 5, gap: 0.7, wait: 1.0 }, { k: 'wight', n: 4, gap: 0.9, wait: 3.0 }] },
  { title: 'Gatehouse Shadows', packs: [{ k: 'champ', n: 2, gap: 2.6 }, { k: 'raider', n: 14, gap: 0.20, wait: 1.2 }, { k: 'arms', n: 6, gap: 0.5, wait: 3.2 }] },
  { title: 'Thorns on the Stone', packs: [{ k: 'wight', n: 6, gap: 0.80 }, { k: 'knight', n: 6, gap: 0.55, wait: 1.0 }, { k: 'hound', n: 12, gap: 0.20, wait: 3.0 }] },
  { title: 'No Soft Hour', packs: [{ k: 'champ', n: 2, gap: 2.2 }, { k: 'arms', n: 8, gap: 0.45, wait: 1.0 }, { k: 'raider', n: 16, gap: 0.18, wait: 3.4 }] },
  { title: 'The Hosts Entire', packs: [{ k: 'knight', n: 7, gap: 0.50 }, { k: 'wight', n: 5, gap: 0.75, wait: 1.2 }, { k: 'hound', n: 12, gap: 0.18, wait: 3.0 }] },
  { title: "Julian's Favor", bonus: 7, cheer: true, packs: [{ k: 'champ', n: 2, gap: 2.0 }, { k: 'raider', n: 16, gap: 0.18, wait: 1.0 }, { k: 'knight', n: 6, gap: 0.5, wait: 3.0 }] },
  { title: 'The Gate Shudders', packs: [{ k: 'champ', n: 3, gap: 2.4 }, { k: 'arms', n: 8, gap: 0.42, wait: 1.0 }, { k: 'hound', n: 12, gap: 0.18, wait: 4.0 }] },
  { title: 'Hold until the Horns', packs: [{ k: 'wight', n: 6, gap: 0.70 }, { k: 'knight', n: 7, gap: 0.48, wait: 1.0 }, { k: 'raider', n: 16, gap: 0.16, wait: 3.2 }] },
  { title: 'The Shade of Mordred', packs: [{ k: 'mordred', n: 1, gap: 0 }, { k: 'champ', n: 2, gap: 3.0, wait: 3.5 }, { k: 'knight', n: 6, gap: 0.55, wait: 2.0 }, { k: 'hound', n: 12, gap: 0.20, wait: 6.0 }, { k: 'wight', n: 4, gap: 0.8, wait: 8.0 }] }
];

const LEVELS = [
  {
    name: 'The First Warning', theme: 'forest', blight: 0, dusk: 0, gold: 250,
    rune: { x: 572, y: 86 }, banner: { x: 1220, y: 292 }, guard: { x: 1172, y: 448 },
    heroes: [{ id: 'julian', x: 980, y: 360 }, { id: 'austin', x: 640, y: 300 }, { id: 'papa', x: 1020, y: 420 }],
    path: [
      { x: 18, y: 438 }, { x: 150, y: 418 }, { x: 236, y: 318 }, { x: 318, y: 198 },
      { x: 468, y: 148 }, { x: 610, y: 188 }, { x: 698, y: 318 }, { x: 758, y: 478 },
      { x: 898, y: 538 }, { x: 1048, y: 478 }, { x: 1148, y: 392 }, { x: 1268, y: 368 }
    ],
    pads: [
      { x: 188, y: 528 }, { x: 348, y: 292 }, { x: 498, y: 78 }, { x: 628, y: 318 },
      { x: 818, y: 358 }, { x: 928, y: 618 }, { x: 1088, y: 292 }, { x: 1138, y: 538 }
    ],
    waves: W1,
    interlude: {
      eyebrow: 'A BREATH ON THE ROAD',
      title: 'The village still stands.',
      line: 'Julian wrings thorn-blood from the scarlet cloak. Austin plants the hammer and says nothing. Papa strings the yew again.',
      speak: 'A wounded messenger from the north: Arthur’s host is days away. Hold the south.'
    }
  },
  {
    name: 'The River Fords', theme: 'ford', blight: 0.12, dusk: 0.18, gold: 190,
    rune: { x: 560, y: 70 }, banner: { x: 1220, y: 250 }, guard: { x: 1180, y: 360 },
    heroes: [{ id: 'julian', x: 1040, y: 300 }, { id: 'austin', x: 640, y: 400 }, { id: 'papa', x: 1080, y: 360 }],
    path: [
      { x: 16, y: 180 }, { x: 170, y: 200 }, { x: 260, y: 320 }, { x: 180, y: 460 },
      { x: 320, y: 560 }, { x: 520, y: 580 }, { x: 640, y: 440 }, { x: 640, y: 280 },
      { x: 800, y: 220 }, { x: 980, y: 300 }, { x: 1100, y: 420 }, { x: 1268, y: 380 }
    ],
    pads: [
      { x: 90, y: 300 }, { x: 320, y: 400 }, { x: 480, y: 200 },
      { x: 720, y: 360 }, { x: 860, y: 120 }, { x: 1120, y: 240 }
    ],
    waves: W2,
    interlude: {
      eyebrow: 'BREAD BY THE WATER',
      title: 'The ford is ours — for an hour.',
      line: 'The three share bread on wet stone. Austin’s shadow stretches across the crossing. Papa watches the far bank.',
      speak: 'Julian: “They will try the next mile.” Austin nods once. That is enough.'
    }
  },
  {
    name: 'The Roman Road', theme: 'roman', blight: 0.22, dusk: 0.12, gold: 155,
    rune: { x: 640, y: 70 }, banner: { x: 1220, y: 320 }, guard: { x: 1188, y: 470 },
    heroes: [{ id: 'julian', x: 1080, y: 360 }, { id: 'austin', x: 700, y: 300 }, { id: 'papa', x: 1120, y: 420 }],
    path: [
      { x: 16, y: 500 }, { x: 160, y: 360 }, { x: 360, y: 220 }, { x: 560, y: 300 },
      { x: 760, y: 440 }, { x: 960, y: 300 }, { x: 1120, y: 380 }, { x: 1268, y: 385 }
    ],
    pads: [
      { x: 120, y: 240 }, { x: 300, y: 480 }, { x: 520, y: 220 },
      { x: 700, y: 500 }, { x: 920, y: 220 }, { x: 1100, y: 520 }
    ],
    waves: W3,
    interlude: {
      eyebrow: 'A RAVEN ON THE MILE',
      title: 'The Roman stones remember older wars.',
      line: 'A black bird drops a scrap of vellum. Merlin’s hand, or a good copy. The ink smells of oak and frost.',
      speak: 'Merlin: The thorns remember Morgan. Do not linger on the road. The woods are already hers.'
    }
  },
  {
    name: 'The Blackened Woods', theme: 'woods', blight: 0.42, dusk: 0.38, gold: 165,
    rune: { x: 200, y: 80 }, banner: { x: 1220, y: 250 }, guard: { x: 1160, y: 420 },
    heroes: [{ id: 'julian', x: 1040, y: 300 }, { id: 'austin', x: 700, y: 400 }, { id: 'papa', x: 980, y: 180 }],
    path: [
      { x: 16, y: 520 }, { x: 160, y: 500 }, { x: 240, y: 340 }, { x: 360, y: 180 },
      { x: 540, y: 150 }, { x: 700, y: 280 }, { x: 620, y: 450 }, { x: 760, y: 580 },
      { x: 960, y: 520 }, { x: 1100, y: 340 }, { x: 1268, y: 300 }
    ],
    pads: [
      { x: 80, y: 360 }, { x: 380, y: 320 }, { x: 560, y: 40 },
      { x: 780, y: 400 }, { x: 900, y: 640 }, { x: 1140, y: 180 }
    ],
    waves: W4,
    interlude: {
      eyebrow: 'DUTY AND HOME',
      title: 'The woods do not laugh back.',
      line: 'They rest against a blasted oak. Julian speaks of the Table. Austin checks the hammer’s fist. Papa laughs once, quietly.',
      speak: 'Papa: “Home is the next clean shot, lads.” Julian smiles. Austin almost does.'
    }
  },
  {
    name: 'The Outer Watchtowers', theme: 'watch', blight: 0.5, dusk: 0.32, gold: 150,
    rune: { x: 640, y: 70 }, banner: { x: 1220, y: 280 }, guard: { x: 1180, y: 500 },
    heroes: [{ id: 'julian', x: 1080, y: 340 }, { id: 'austin', x: 860, y: 400 }, { id: 'papa', x: 1120, y: 400 }],
    path: [
      { x: 16, y: 240 }, { x: 200, y: 190 }, { x: 360, y: 280 }, { x: 340, y: 460 },
      { x: 500, y: 580 }, { x: 720, y: 560 }, { x: 860, y: 400 }, { x: 780, y: 220 },
      { x: 960, y: 150 }, { x: 1140, y: 240 }, { x: 1268, y: 360 }
    ],
    pads: [
      { x: 80, y: 360 }, { x: 400, y: 160 }, { x: 560, y: 400 },
      { x: 760, y: 680 }, { x: 980, y: 320 }, { x: 1140, y: 120 }
    ],
    waves: W5,
    interlude: {
      eyebrow: 'ANOTHER RAVEN',
      title: 'The watchtowers were the first to see her fire.',
      line: 'Smoke stands on the southern sky. Camelot’s walls are a pale line. The three drink cold water and rise.',
      speak: 'Merlin: The walls of Camelot are the last. Arthur rides. Go.'
    }
  },
  {
    name: 'The Approach to Camelot', theme: 'burn', blight: 0.62, dusk: 0.28, gold: 145,
    rune: { x: 200, y: 80 }, banner: { x: 1220, y: 330 }, guard: { x: 1180, y: 500 },
    heroes: [{ id: 'julian', x: 1080, y: 380 }, { id: 'austin', x: 820, y: 400 }, { id: 'papa', x: 1120, y: 440 }],
    path: [
      { x: 16, y: 560 }, { x: 180, y: 500 }, { x: 300, y: 360 }, { x: 280, y: 200 },
      { x: 480, y: 140 }, { x: 700, y: 200 }, { x: 820, y: 360 }, { x: 740, y: 520 },
      { x: 920, y: 580 }, { x: 1100, y: 480 }, { x: 1268, y: 400 }
    ],
    pads: [
      { x: 100, y: 400 }, { x: 380, y: 80 }, { x: 600, y: 360 },
      { x: 860, y: 200 }, { x: 1000, y: 680 }
    ],
    waves: W6,
    interlude: {
      eyebrow: 'THE GATES RISE',
      title: 'Smoke on the fields. Stone ahead.',
      line: 'Camelot’s gatehouse fills the sky. Julian sets the scarlet cloak. Austin takes the road’s throat. Papa finds a high stone.',
      speak: 'Julian: “Arthur rides. We hold until he does.”'
    }
  },
  {
    name: 'The Final Defense', theme: 'camelot', blight: 0.72, dusk: 0.44, gold: 135,
    rune: { x: 640, y: 64 }, banner: { x: 1220, y: 300 }, guard: { x: 1188, y: 520 },
    heroes: [{ id: 'julian', x: 1100, y: 380 }, { id: 'austin', x: 720, y: 400 }, { id: 'papa', x: 1040, y: 220 }],
    path: [
      { x: 16, y: 360 }, { x: 160, y: 300 }, { x: 280, y: 400 }, { x: 400, y: 540 },
      { x: 580, y: 580 }, { x: 720, y: 440 }, { x: 560, y: 300 }, { x: 700, y: 180 },
      { x: 900, y: 150 }, { x: 1040, y: 240 }, { x: 1120, y: 380 }, { x: 1268, y: 400 }
    ],
    pads: [
      { x: 80, y: 200 }, { x: 360, y: 280 }, { x: 560, y: 400 },
      { x: 840, y: 360 }, { x: 980, y: 80 }
    ],
    waves: W7
  }
];

function currentLevel() { return LEVELS[state.level] || LEVELS[0]; }
function currentWaves() { return currentLevel().waves; }
function runePos() { return currentLevel().rune; }
function bannerPos() { return currentLevel().banner; }
function guardPos() { return currentLevel().guard; }
function levelTheme() { return currentLevel().theme || 'forest'; }
function levelBlight() { return currentLevel().blight || 0; }

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

function pathAt(d, air) {
  d = clamp(d, 0, PATH.total);
  let s = PATH.segs[PATH.segs.length - 1];
  for (let i = 0; i < PATH.segs.length; i++) {
    if (d <= PATH.segs[i].start + PATH.segs[i].len) { s = PATH.segs[i]; break; }
  }
  const t = s.len ? (d - s.start) / s.len : 1;
  return {
    x: s.a.x + (s.b.x - s.a.x) * t,
    y: s.a.y + (s.b.y - s.a.y) * t - (air ? 36 : 0),
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
function distToPath(p) {
  const q = pathAt(nearestPath(p), false);
  return Math.hypot(q.x - p.x, q.y - p.y);
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
  roots: [],
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
  level: 0,
  difficulty: 'standard',
  bossLeak: false
};

function toast(msg, t) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  state.toastT = t || 2.2;
}
function isVeteran() { return state.difficulty === 'veteran'; }
function modeLabel() { return isVeteran() ? 'Veteran' : 'Standard'; }
function hudGold() { $('#statGold strong').textContent = String(state.gold); }
function hudLives() { $('#statLives strong').textContent = String(state.lives); }
function hudWave() {
  const n = currentWaves().length;
  $('#statWave strong').textContent = state.wave + '/' + n;
}
function hudMode() {
  const el = $('#statMode strong');
  if (el) el.textContent = modeLabel();
  const wrap = $('#statMode');
  if (wrap) wrap.classList.toggle('vet', isVeteran());
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
    julian: { name: 'Julian', title: 'the Lionhearted', hp: 250, dmg: 22, range: 48, spd: 104, rate: 0.50, ability: 'Lionheart', cdMax: 12 },
    austin: { name: 'Austin', title: 'the Shadow', hp: 520, dmg: 14, range: 54, spd: 72, rate: 0.68, ability: 'Bulwark', cdMax: 16 },
    papa: { name: 'Papa', title: 'of the Longbow', hp: 132, dmg: 10, range: 208, spd: 82, rate: 0.68, ability: 'Volley', cdMax: 11 }
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
  state.roots = [];
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
  state.bossLeak = false;
  state.birds = [
    { x: 220, y: 90, vx: 18, s: 1, t: 0 },
    { x: 640, y: 70, vx: -14, s: 0.85, t: 1.2 },
    { x: 900, y: 110, vx: 12, s: 1.1, t: 2 }
  ];
  hudGold(); hudLives(); hudWave(); hudMode();
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
function priorityEnemy(p, range) {
  let best = null, score = -1e9;
  const list = livingEnemies();
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > range) continue;
    const s = (e.boss ? 900 : 0) + (e.elite ? 450 : 0) + e.d * 0.12 - d * 0.22;
    if (s > score) { score = s; best = e; }
  }
  return best;
}
function austinTank() {
  return state.heroes.find((h) => h.id === 'austin' && h.hp > 0);
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
  if (e.boss) toast(e.name + ' falls.');
  if (e.kind === 'wight') {
    state.roots.push({ x: e.x, y: e.y, life: 8, r: 52 });
    floatText(e.x, e.y + 10, 'roots', '#7aaa6a');
  }
}

function spawnEnemy(kind, waveIndex) {
  const k = KINDS[kind];
  if (!k) return;
  const scale = 1 + waveIndex * 0.075 + state.level * 0.09;
  const hpMul = isVeteran() ? VETERAN_HP : 1;
  const p = pathAt(0, k.air);
  state.enemies.push({
    kind, name: k.name, x: p.x, y: p.y, d: 0, ang: 0,
    hp: k.hp * scale * hpMul, mhp: k.hp * scale * hpMul, spd: k.spd * (1 + state.level * 0.035), gold: k.gold, armor: k.armor,
    fly: k.fly, air: !!k.air, r: k.r, leak: k.leak, color: k.color,
    boss: !!k.boss, elite: !!k.elite,
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
    toast("Julian's Favor! +7 gold. Julian the Lionhearted stands!");
    state.fx.push({ kind: 'spark', x: 640, y: 90, life: 1.4, r: 28 });
  } else if (w.merlin) {
    toast('A raven from Merlin: ' + w.title);
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
      home: null, temp: true, life: Infinity,
      x: q.x, y: q.y, hp: 46, mhp: 46, dmg: 7, rate: 0.6, atkT: 0, respawn: 0, facing: 1
    });
  });
  state.placing = null;
  state.reinforceCd = 20;
  toast('Reinforcements hold the road!');
  SFX.horn();
  syncHeroUI();
}

function useAbility(h) {
  if (!h || h.cd > 0 || h.hp <= 0) return;
  if (h.id === 'julian') lionheart(h);
  else if (h.id === 'papa') volley(h);
  else if (h.id === 'austin') bulwark(h);
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
      hurt(en, 42 + (h.empower > 0 ? 12 : 0), '#ffd070');
      en.stun = Math.max(en.stun, 0.35);
    }
  });
  state.shake = 10;
  SFX.smash();
  toast('Lionheart! Julian the Lionhearted stands!');
  state.fx.push({ kind: 'ring', x: h.x, y: h.y, life: 0.45, r: 20, color: '#c42830' });
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
  toast('Volley! Papa of the Longbow rains stout shafts.');
}

function bulwark(h) {
  livingEnemies().forEach((en) => {
    const d = Math.hypot(en.x - h.x, en.y - h.y);
    if (d < 86) {
      hurt(en, 20, '#c8b4ff');
      en.stun = Math.max(en.stun, 1.35);
      if (!en.fly && d < 110) en.slow = Math.max(en.slow, 2.2);
    }
  });
  const d = nearestPath(h);
  const p = pathAt(d, false);
  const tang = p.ang + Math.PI / 2;
  state.walls.push({
    x: p.x, y: p.y, hp: 110, mhp: 110, life: 10,
    x1: p.x + Math.cos(tang) * 36, y1: p.y + Math.sin(tang) * 36,
    x2: p.x - Math.cos(tang) * 36, y2: p.y - Math.sin(tang) * 36
  });
  h.smash = 0.25;
  SFX.smash();
  toast('Bulwark! Austin challenges the lane.');
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
  updateRoots(dt);
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
        const ve = priorityEnemy(h, 250) || nearestEnemy(h, 250);
        if (ve) {
          h.facing = ve.x >= h.x ? 1 : -1;
          shootArrow(h, ve, h.dmg * 0.9 + (h.empower > 0 ? 4 : 0));
        }
        h.volley--;
        h.volleyGap = 0.09;
        h.smash = 0.12;
      }
    }
    const e = h.id === 'papa' ? (priorityEnemy(h, h.range + 8) || nearestEnemy(h, h.range + 8)) : nearestEnemy(h, h.range + 8);
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
          const col = h.id === 'julian' ? '#ffd070' : '#c8b4ff';
          hurt(e, h.dmg * mul, col);
          if (h.id === 'austin') e.slow = Math.max(e.slow, 1.6);
          SFX.slash();
        }
      }
    }
    if (h.id === 'austin') {
      livingEnemies().forEach((en) => {
        if (!en.fly && Math.hypot(en.x - h.x, en.y - h.y) < 48) en.slow = Math.max(en.slow, 0.55);
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
    if (s.temp && Number.isFinite(s.life)) s.life -= dt;
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
  state.soldiers = state.soldiers.filter((s) => !(s.temp && (s.hp <= 0 || (Number.isFinite(s.life) && s.life <= 0))));
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

function updateRoots(dt) {
  state.roots.forEach((r) => { r.life -= dt; });
  state.roots = state.roots.filter((r) => r.life > 0);
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
  const tank = austinTank();
  if (tank) {
    const td = Math.hypot(tank.x - e.x, tank.y - e.y);
    if (td < 40) best = { kind: 'austin', ref: tank };
    else if (td < 64) best = { kind: 'austin', ref: tank };
  }
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
        e.atkT = e.boss || e.kind === 'champ' || e.kind === 'knight' ? 0.68 : e.kind === 'arms' ? 0.74 : 0.85;
        const dmg = e.boss ? 18 : e.kind === 'champ' ? 14 : e.kind === 'knight' ? 12 : e.kind === 'arms' ? 10 : 6;
        blk.ref.hp -= dmg;
        if (blk.kind === 'austin' && blk.ref.hp <= 0) floatText(blk.ref.x, blk.ref.y, 'Austin yields', '#c8b4ff');
      }
      continue;
    }
    for (let r = 0; r < state.roots.length; r++) {
      const z = state.roots[r];
      if (Math.hypot(e.x - z.x, e.y - z.y) < z.r) e.slow = Math.max(e.slow, 1.15);
    }
    const slow = e.slow > 0 ? 0.62 : 1;
    if (e.slow > 0) e.slow -= dt;
    e.d += e.spd * slow * dt;
    const p = pathAt(e.d, e.air);
    e.x = p.x;
    e.y = p.y + Math.sin(e.bob) * (e.fly ? 4 : 1);
    e.ang = p.ang;
    if (e.d >= PATH.total - 4) {
      if (e.boss) {
        state.lives = 0;
        state.bossLeak = true;
        hudLives();
        SFX.leak();
        state.shake = 12;
        toast(e.name + ' breaches the keep!');
        state.enemies.splice(i, 1);
        continue;
      }
      state.lives = Math.max(0, state.lives - (e.leak || 1));
      hudLives();
      SFX.leak();
      state.shake = 8;
      toast('A foe slips into the keep!');
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
  const won = currentLevel();
  const nxt = LEVELS[state.level + 1];
  const card = won.interlude || {};
  const eye = $('#nextEyebrow');
  if (eye) eye.textContent = card.eyebrow || 'A BREATH BETWEEN SIEGES';
  $('#nextTitle').textContent = card.title || ((nxt && nxt.name) + ' waits.');
  $('#nextLine').textContent = card.line || 'Harder road. Tighter purse. Julian the Lionhearted still stands.';
  const speak = $('#nextSpeak');
  if (speak) speak.textContent = card.speak || '';
  $('#scrNext').hidden = false;
  showHud(false);
}

function startNextSiege() {
  $('#scrNext').hidden = true;
  resetRun(state.level + 1);
  state.mode = 'play';
  showHud(true);
  toast(currentLevel().name + '. ' + modeLabel() + ' siege. Hold the gate.');
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
  $('#defeatLine').textContent = state.bossLeak
    ? 'A boss of the Black Thorn walks the gate. Camelot’s keep is theirs.'
    : 'Julian plants the lion-cloak in the rubble. Tomorrow, they try again.';
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
function glint(c, x, y, rx, ry, a) {
  c.save();
  c.globalAlpha = a == null ? 0.3 : a;
  blob(c, x, y, rx, ry == null ? rx * 0.65 : ry);
  paint(c, '#fff6d8', '#fff6d8', 0);
  c.restore();
}
function rivet(c, x, y) {
  blob(c, x, y, 1.05, 1.05);
  paint(c, fillRad(c, x - 0.35, y - 0.4, 0.2, 1.2, '#e8e0d0', '#4a4034'), '#1a140c', 0.55);
}
function clothFold(c, x0, y0, x1, y1, col) {
  c.strokeStyle = col || 'rgba(20,12,8,0.28)';
  c.lineWidth = 1;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x0, y0);
  c.quadraticCurveTo((x0 + x1) * 0.5 + 1.5, (y0 + y1) * 0.5, x1, y1);
  c.stroke();
}
function drawFace(c, x, y, rx, ry, o) {
  o = o || {};
  const skin = o.skin || '#e0b890';
  const deep = o.deep || '#8a5a3c';
  const edge = o.edge || '#2a1c12';
  blob(c, x, y, rx, ry);
  paint(c, fillRad(c, x - rx * 0.38, y - ry * 0.42, 0.5, rx * 1.25, skin, deep), edge, 1.15);
  if (!o.noEar) {
    blob(c, x - rx * 0.95, y + ry * 0.04, rx * 0.3, ry * 0.34);
    paint(c, fillRad(c, x - rx, y, 0.2, rx * 0.38, skin, deep), edge, 0.8);
  }
  const ex = x + rx * 0.16, ey = y - ry * 0.06;
  c.fillStyle = 'rgba(40,22,14,0.2)';
  c.beginPath(); c.ellipse(ex - 2.15, ey, rx * 0.24, ry * 0.15, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(ex + 2.2, ey, rx * 0.22, ry * 0.14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = o.white || '#f2e6d2';
  c.beginPath(); c.ellipse(ex - 2.1, ey, 1.4, 1.08, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(ex + 2.2, ey, 1.28, 1.02, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = o.eye || '#3a2a18';
  c.beginPath(); c.arc(ex - 1.72, ey + 0.05, 0.74, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(ex + 2.5, ey + 0.04, 0.68, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,240,0.6)';
  c.beginPath(); c.arc(ex - 1.95, ey - 0.28, 0.28, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(ex + 2.28, ey - 0.24, 0.24, 0, Math.PI * 2); c.fill();
  if (o.lid) {
    c.strokeStyle = o.lid;
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(ex - 3.3, ey - 0.85); c.quadraticCurveTo(ex - 2.1, ey - 1.5, ex - 0.8, ey - 0.7);
    c.moveTo(ex + 0.9, ey - 0.75); c.quadraticCurveTo(ex + 2.2, ey - 1.4, ex + 3.4, ey - 0.55);
    c.stroke();
  }
  c.strokeStyle = o.brow || 'rgba(50,28,16,0.52)';
  c.lineWidth = 1.2;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x - rx * 0.44, y - ry * 0.24);
  c.quadraticCurveTo(x + rx * 0.04, y - ry * 0.46, x + rx * 0.5, y - ry * 0.16);
  c.stroke();
  c.strokeStyle = o.nose || 'rgba(90,50,32,0.42)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x + rx * 0.1, y - ry * 0.04);
  c.lineTo(x + rx * 0.26, y + ry * 0.22);
  c.quadraticCurveTo(x + rx * 0.04, y + ry * 0.3, x - rx * 0.04, y + ry * 0.18);
  c.stroke();
  c.strokeStyle = o.lip || 'rgba(92,36,32,0.48)';
  c.lineWidth = 1.05;
  c.beginPath();
  c.moveTo(x - rx * 0.14, y + ry * 0.44);
  c.quadraticCurveTo(x + rx * 0.1, y + ry * 0.54, x + rx * 0.34, y + ry * 0.4);
  c.stroke();
  if (o.beard) {
    c.beginPath();
    c.moveTo(x - rx * 0.58, y + ry * 0.22);
    c.quadraticCurveTo(x - rx * 0.15, y + ry * 1.22, x + rx * 0.08, y + ry * 1.05);
    c.quadraticCurveTo(x + rx * 0.62, y + ry * 0.85, x + rx * 0.55, y + ry * 0.2);
    c.quadraticCurveTo(x, y + ry * 0.5, x - rx * 0.58, y + ry * 0.22);
    paint(c, fillLin(c, x, y + ry * 0.15, x, y + ry * 1.15, o.beard, o.beardD || '#2a1810'), '#1a1008', 0.9);
  }
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
  const veil = levelBlight();
  if (veil > 0.28) {
    c.fillStyle = 'rgba(12, 8, 14, ' + (veil * 0.16).toFixed(3) + ')';
    c.fillRect(-40, -40, W + 80, H + 80);
  }
  drawPads(c);
  state.towers.forEach((t) => { if (t.type) drawTower(c, t); });
  state.roots.forEach((r) => drawRoots(c, r));
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
    c.fillText(currentLevel().name + (isVeteran() ? ' · Veteran' : ''), 16, 26);
  }
}

function drawSky(c) {
  const dusk = (currentLevel().dusk || 0);
  const theme = levelTheme();
  const g = c.createLinearGradient(0, 0, 0, H);
  if (theme === 'burn') {
    g.addColorStop(0, '#4a2830'); g.addColorStop(0.28, '#8a4a30'); g.addColorStop(0.52, '#b86838'); g.addColorStop(1, '#3a2a18');
  } else if (theme === 'camelot') {
    g.addColorStop(0, '#1a2038'); g.addColorStop(0.28, '#3a3858'); g.addColorStop(0.52, '#4a3a48'); g.addColorStop(1, '#1c2418');
  } else if (theme === 'woods') {
    g.addColorStop(0, '#1a2430'); g.addColorStop(0.28, '#2a3840'); g.addColorStop(0.52, '#3a4a38'); g.addColorStop(1, '#142018');
  } else if (theme === 'roman') {
    g.addColorStop(0, '#7aa0b8'); g.addColorStop(0.28, '#c8b090'); g.addColorStop(0.52, '#b8a070'); g.addColorStop(1, '#6a7a40');
  } else {
    g.addColorStop(0, dusk > 0.3 ? '#1a2848' : dusk > 0 ? '#4a6a98' : '#6aa8cc');
    g.addColorStop(0.28, dusk > 0.3 ? '#3a3858' : dusk > 0 ? '#8a7a68' : '#9cc4d8');
    g.addColorStop(0.52, dusk > 0.3 ? '#5a3a48' : dusk > 0 ? '#b89068' : '#c8d090');
    g.addColorStop(1, dusk > 0.3 ? '#1c2c18' : dusk > 0 ? '#4a6e38' : '#5a8236');
  }
  c.fillStyle = g;
  c.fillRect(-40, -40, W + 80, H + 80);
  if (theme === 'burn') {
    blob(c, 200, 90, 30, 30); paint(c, fillRad(c, 192, 82, 2, 30, '#ffe0a0', '#d06020'), '#a04010', 2);
    c.globalAlpha = 0.22; blob(c, 200, 90, 70, 70); paint(c, '#ff8040', '#ff8040', 0); c.globalAlpha = 1;
  } else if (dusk > 0.3 || theme === 'woods' || theme === 'camelot') {
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
  const theme = levelTheme();
  let topA = dusk > 0.3 ? '#2c4430' : dusk > 0 ? '#3a6234' : '#4a7230';
  let topB = dusk > 0.3 ? '#1c3020' : dusk > 0 ? '#2a4a26' : '#345826';
  let botA = dusk > 0.3 ? '#203428' : dusk > 0 ? '#2c4a28' : '#385c28';
  let botB = dusk > 0.3 ? '#142018' : dusk > 0 ? '#1e3420' : '#284820';
  if (theme === 'burn') { topA = '#5a3a22'; topB = '#3a2414'; botA = '#4a2a18'; botB = '#24140c'; }
  if (theme === 'woods') { topA = '#1c3020'; topB = '#101810'; botA = '#142018'; botB = '#0c100c'; }
  if (theme === 'roman') { topA = '#6a6a48'; topB = '#4a4a30'; botA = '#5a5a3a'; botB = '#3a3a24'; }
  if (theme === 'watch') { topA = '#3a4a38'; topB = '#243028'; botA = '#2e3a30'; botB = '#1a241c'; }
  if (theme === 'camelot') { topA = '#2a3430'; topB = '#1a2220'; botA = '#222c28'; botB = '#121816'; }
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
  const theme = levelTheme();
  const dusk = currentLevel().dusk || 0;
  const tones = (theme === 'woods' || dusk > 0.3)
    ? ['#1a2e1c', '#243828', '#102010', '#2a3a24']
    : theme === 'burn'
      ? ['#3a2a18', '#2a1c10', '#4a3018', '#1e140c']
      : theme === 'roman'
        ? ['#4a5a30', '#3a4a24', '#5a6a38', '#2a3818']
        : ['#2f6a2c', '#3a7a30', '#245820', '#4a8a38'];
  const spots = theme === 'ford'
    ? [[30, 360, 1.1], [70, 300, 0.9], [20, 250, 0.8], [40, 500, 1], [90, 560, 1.1], [160, 600, 0.8]]
    : theme === 'roman'
      ? [[30, 200, 0.7], [80, 560, 0.8], [40, 600, 0.7]]
      : theme === 'camelot'
        ? [[30, 500, 0.8], [70, 580, 0.9], [20, 620, 0.7]]
        : [
          [30, 360, 1.3], [70, 300, 1.1], [20, 250, 0.9], [110, 240, 1.2], [60, 200, 1],
          [150, 180, 0.85], [40, 500, 1.1], [90, 560, 1.3], [20, 600, 1], [160, 600, 0.9],
          [200, 160, 0.8], [260, 120, 1], [340, 90, 0.85]
        ];
  if (theme === 'woods') {
    spots.push([420, 80, 1.1], [780, 90, 1], [980, 80, 0.9], [240, 620, 1.2], [500, 640, 1]);
  }
  spots.forEach(([x, y, sc], i) => drawTree(c, x, y, sc, tones[i % 4]));
  const rocks = theme === 'roman'
    ? [[180, 520], [300, 200], [460, 500], [640, 200], [860, 500], [980, 180], [500, 560]]
    : theme === 'ford'
      ? [[300, 560], [640, 640]]
      : theme === 'watch'
        ? [[180, 520], [460, 200], [640, 640], [860, 200], [500, 360], [980, 120]]
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
  const theme = levelTheme();
  const water = theme === 'woods' || theme === 'camelot' ? '#1a3a40' : theme === 'ford' ? '#2a6a9a' : theme === 'burn' ? '#3a4a40' : '#3a7ea8';
  const edge = theme === 'woods' || theme === 'camelot' ? '#0a2028' : '#1a3a50';
  if (theme === 'ford') {
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
  c.globalAlpha = (theme === 'woods' || theme === 'camelot') ? 0.16 : 0.35;
  c.beginPath();
  c.moveTo(820, 680); c.quadraticCurveTo(860, 520, 1000, 260);
  c.strokeStyle = (theme === 'woods' || theme === 'camelot') ? '#6a8890' : '#cfefff'; c.lineWidth = 4; c.stroke();
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
  const theme = levelTheme();
  if (theme === 'roman' || theme === 'watch' || theme === 'camelot') return;
  c.save();
  if (theme === 'ford') c.translate(640, 430);
  else c.translate(812, 498);
  c.rotate(theme === 'ford' ? 1.55 : 0.55);
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
  if (levelTheme() === 'camelot') {
    rr(c, -110, 8, 40, 142, 3); paint(c, fillLin(c, -110, 8, -70, 150, '#8a8478', '#4a443c'), '#2a241c', 2);
    rr(c, 86, 8, 40, 142, 3); paint(c, fillLin(c, 86, 8, 126, 150, '#8a8478', '#4a443c'), '#2a241c', 2);
    c.fillStyle = '#e6b423';
    c.font = '700 11px Palatino, serif';
    c.textAlign = 'center';
    c.fillText('CAMELOT', 10, 48);
  }
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
  c.strokeStyle = levelTheme() === 'burn' ? '#4a2a10' : '#2a4a18';
  c.lineWidth = 2;
  [[240, 600], [400, 640], [560, 580], [1000, 640], [380, 420]].forEach(([x, y]) => {
    c.beginPath();
    c.moveTo(x, y); c.quadraticCurveTo(x - 4, y - 10, x - 2, y - 16);
    c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 12, x + 6, y - 14);
    c.stroke();
  });
  drawThemeExtras(c);
}

function drawThemeExtras(c) {
  const theme = levelTheme();
  if (theme === 'woods' || theme === 'watch' || theme === 'burn' || theme === 'camelot') {
    c.strokeStyle = '#1a1410';
    c.lineWidth = 2;
    [[180, 200], [420, 80], [700, 100], [900, 80], [300, 620], [980, 600]].forEach(([x, y], i) => {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 8, y - 18 - (i % 3) * 4, x + 4, y - 28);
      c.moveTo(x + 2, y);
      c.quadraticCurveTo(x - 10, y - 12, x - 14, y - 22);
      c.stroke();
    });
  }
  if (theme === 'roman') {
    [[220, 240], [780, 500], [1040, 220]].forEach(([x, y]) => {
      rr(c, x, y, 36, 22, 2); paint(c, fillLin(c, x, y, x + 36, y + 22, '#8a8070', '#4a4438'), '#2a241c', 2);
      c.fillStyle = 'rgba(30,24,18,0.25)';
      c.fillRect(x + 6, y + 6, 8, 10);
      c.fillRect(x + 20, y + 6, 8, 10);
    });
  }
  if (theme === 'watch') {
    [[200, 120], [980, 80]].forEach(([x, y]) => {
      rr(c, x, y, 22, 64, 2); paint(c, fillLin(c, x, y, x + 22, y + 64, '#8a8478', '#4a443c'), '#2a241c', 2);
      c.beginPath();
      c.moveTo(x - 4, y + 4); c.lineTo(x + 11, y - 16); c.lineTo(x + 26, y + 4);
      c.closePath();
      paint(c, fillLin(c, x, y - 16, x + 11, y + 6, '#7a2028', '#3a1014'), '#1a0c0c', 2);
    });
  }
  if (theme === 'burn') {
    [[160, 480], [480, 300], [900, 160], [1040, 560]].forEach(([x, y], i) => {
      c.globalAlpha = 0.35 + Math.sin(state.t * 3 + i) * 0.1;
      blob(c, x, y, 10 + i, 16); paint(c, fillRad(c, x, y - 8, 1, 16, '#ffe080', '#c04010'), '#c04010', 0);
      c.globalAlpha = 1;
    });
  }
  if (theme === 'camelot') {
    c.globalAlpha = 0.22 + Math.sin(state.t * 2) * 0.06;
    blob(c, 640, 80, 80, 28); paint(c, '#6aaa60', '#6aaa60', 0);
    c.globalAlpha = 1;
  }
}

function drawRoots(c, r) {
  const a = clamp(r.life / 8, 0, 1);
  c.save();
  c.globalAlpha = 0.35 + a * 0.4;
  blob(c, r.x, r.y, r.r * 0.7, r.r * 0.42); paint(c, 'rgba(20, 28, 16, 0.55)', 'rgba(10, 14, 8, 0.4)', 0);
  c.strokeStyle = '#1a2414';
  c.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const ang = i * Math.PI / 3 + state.t * 0.4;
    c.beginPath();
    c.moveTo(r.x, r.y);
    c.quadraticCurveTo(r.x + Math.cos(ang) * r.r * 0.4, r.y + Math.sin(ang) * r.r * 0.25, r.x + Math.cos(ang) * r.r * 0.7, r.y + Math.sin(ang) * r.r * 0.35);
    c.stroke();
  }
  c.restore();
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
  const cloth = s.temp ? '#6a7a88' : '#8a3428';
  const clothD = s.temp ? '#3a4a58' : '#4a1814';
  rr(c, -5, 5, 4, 9, 1.2); paint(c, fillLin(c, -5, 5, -1, 14, '#5a4030', '#2a1c12'), '#1a1008', 1);
  rr(c, 1.2, 5, 4, 9, 1.2); paint(c, fillLin(c, 1, 5, 5, 14, '#4a3424', '#241610'), '#1a1008', 1);
  blob(c, -3, 14, 2.4, 1.3); paint(c, '#3a2a1c', '#1a1008', 0.7);
  blob(c, 3.2, 14, 2.4, 1.3); paint(c, '#3a2a1c', '#1a1008', 0.7);
  rr(c, -8, -9, 16, 16, 3); paint(c, fillLin(c, -8, -9, 6, 8, cloth, clothD), '#1a1008', 1.4);
  clothFold(c, -5, -4, -3, 5, 'rgba(12,8,6,0.28)');
  rr(c, -6, -6, 12, 6, 2); paint(c, fillLin(c, -6, -6, 4, 0, s.temp ? '#8a96a0' : '#c9a040', s.temp ? '#4a545c' : '#6a4814'), '#1a1008', 1);
  c.fillStyle = fillLin(c, 6, -12, 10, 4, '#d8d0bc', '#6a6458');
  c.fillRect(6.5, -11, 2.4, 13);
  c.strokeStyle = '#2a241c'; c.lineWidth = 0.8; c.strokeRect(6.5, -11, 2.4, 13);
  blob(c, 7.7, -12.2, 1.6, 1.6); paint(c, '#8a8478', '#2a241c', 0.7);
  drawFace(c, 0.4, -15.2, 5.1, 5.4, {
    skin: '#e0b890', deep: '#8a5a3c', eye: '#3a2a1c', lid: 'rgba(70,40,24,0.4)'
  });
  c.beginPath();
  c.moveTo(-5.2, -19); c.quadraticCurveTo(0, -23, 5.4, -18.4); c.lineTo(4.6, -16.4); c.quadraticCurveTo(0, -19, -4.4, -16.8);
  c.closePath();
  paint(c, fillLin(c, 0, -23, 0, -16, s.temp ? '#4a5460' : '#3a2418', '#1a1410'), '#120c08', 1);
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
  c.scale(Math.cos(e.ang) >= 0 ? 1 : -1, 1);
  contactShadow(c, 0, e.r + 3, e.r * 0.85, 3.5);
  if (e.kind === 'raider') drawRaider(c);
  else if (e.kind === 'arms') drawArms(c);
  else if (e.kind === 'knight') drawCorrKnight(c);
  else if (e.kind === 'wight') drawWight(c, e);
  else if (e.kind === 'hound') drawHound(c, e);
  else if (e.kind === 'champ') drawChampion(c);
  else if (e.kind === 'drake') drawDrake(c, e);
  else drawMordred(c, e);
  c.restore();
  if (e.hp < e.mhp || e.boss || e.kind === 'champ') {
    const w = e.boss ? 52 : e.kind === 'champ' ? 34 : 22;
    c.fillStyle = '#1a140c';
    c.fillRect(e.x - w / 2, e.y - e.r - 16, w, 5);
    c.fillStyle = e.boss ? '#e6b423' : '#c44';
    c.fillRect(e.x - w / 2, e.y - e.r - 16, w * clamp(e.hp / e.mhp, 0, 1), 5);
  }
  if (e.boss || e.kind === 'champ') {
    c.fillStyle = '#f4e6c4';
    c.font = '700 11px Palatino, serif';
    c.textAlign = 'center';
    c.fillText(e.name, e.x, e.y - e.r - 22);
  }
}

function drawRaider(c) {
  rr(c, -5.5, 5, 3.6, 9, 1.1); paint(c, fillLin(c, -5.5, 5, -2, 14, '#3a2a22', '#1a1410'), '#120c08', 1);
  rr(c, 2, 4.5, 3.4, 9.5, 1.1); paint(c, fillLin(c, 2, 4, 5, 14, '#2e221c', '#14100c'), '#120c08', 1);
  blob(c, -3.6, 14.4, 2.2, 1.2); paint(c, '#1a1410', '#0c0806', 0.7);
  blob(c, 3.8, 14.2, 2.2, 1.2); paint(c, '#1a1410', '#0c0806', 0.7);
  blob(c, 0, 1.2, 8.6, 8.2); paint(c, fillLin(c, -7, -6, 7, 10, '#2a2420', '#12100c'), '#0c0806', 1.6);
  clothFold(c, -4, -2, -2, 6, 'rgba(8,6,4,0.4)');
  c.beginPath();
  c.moveTo(-10, -4); c.quadraticCurveTo(-16, 8, -6, 16); c.lineTo(8, 12); c.quadraticCurveTo(6, 2, 2, -4);
  c.closePath();
  paint(c, fillLin(c, -12, -4, 4, 16, '#2a221c', '#0c0a08'), '#0a0806', 1.3);
  c.beginPath(); c.moveTo(7, -4); c.lineTo(15, 2); c.lineTo(14, 4); c.lineTo(7.2, -1.2); c.closePath();
  paint(c, fillLin(c, 7, -4, 15, 4, '#6a6458', '#2a241c'), '#1a140c', 1);
  drawFace(c, 6.2, -8.4, 5.4, 5.2, {
    skin: '#8a6a4c', deep: '#4a3424', eye: '#1a140c', white: '#d8c8a8',
    brow: 'rgba(20,12,8,0.6)', lip: 'rgba(40,16,12,0.5)', lid: 'rgba(20,12,8,0.4)'
  });
  c.strokeStyle = '#1a140c';
  c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(3.4, -10); c.lineTo(5.2, -6); c.moveTo(8.6, -10); c.lineTo(7.2, -6); c.stroke();
  c.beginPath();
  c.moveTo(-2, -12); c.quadraticCurveTo(6, -18, 12, -10); c.lineTo(10, -8); c.quadraticCurveTo(6, -12, 0, -9);
  c.closePath();
  paint(c, fillLin(c, 4, -18, 6, -8, '#1a1612', '#0a0806'), '#080604', 1);
}

function drawArms(c) {
  rr(c, -8, 8, 5, 11, 1.3); paint(c, fillLin(c, -8, 8, -3, 19, '#3a342c', '#1a1610'), '#100c08', 1);
  rr(c, 3, 8, 5, 11, 1.3); paint(c, fillLin(c, 3, 8, 8, 19, '#2e2822', '#14120e'), '#100c08', 1);
  blob(c, -5.4, 19.4, 2.8, 1.4); paint(c, '#1a1610', '#0c0806', 0.7);
  blob(c, 5.8, 19.4, 2.8, 1.4); paint(c, '#1a1610', '#0c0806', 0.7);
  blob(c, 0, 2.4, 13.2, 12.2); paint(c, fillLin(c, -10, -8, 10, 14, '#4a443c', '#1e1a16'), '#12100c', 1.6);
  rr(c, -13, -6, 26, 13, 2.4); paint(c, fillLin(c, -13, -6, 10, 8, '#5a544c', '#2a2620'), '#16120e', 1.4);
  glint(c, -5, -3, 4, 2, 0.16);
  rivet(c, -8, -1); rivet(c, 2, -2); rivet(c, 9, 0);
  c.beginPath();
  c.moveTo(-14, -4); c.lineTo(-18, 2); c.lineTo(-12, 10); c.lineTo(-8, 2);
  c.closePath();
  paint(c, fillLin(c, -18, -4, -8, 10, '#4a443c', '#1a1612'), '#100c08', 1.2);
  c.strokeStyle = '#2a2018'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-16, 0); c.lineTo(-10, 6); c.stroke();
  c.save();
  c.translate(14, 2); c.rotate(0.2);
  c.fillStyle = fillLin(c, -2, -14, 2, 12, '#3a2a1c', '#1a1008');
  c.fillRect(-1.8, -12, 3.6, 24);
  blob(c, 0, -15, 6.4, 4.8); paint(c, fillRad(c, -1.5, -17, 1, 6.5, '#6a6458', '#2a241c'), '#12100c', 1.2);
  c.restore();
  drawFace(c, 4.8, -12.6, 6.4, 6.0, {
    skin: '#a08060', deep: '#5a4030', eye: '#1a140c', brow: 'rgba(30,16,10,0.55)',
    lid: 'rgba(40,20,12,0.4)'
  });
  rr(c, -2, -19.5, 11, 5, 1.2); paint(c, fillLin(c, -2, -20, 8, -15, '#3a3630', '#16120e'), '#100c08', 1);
}

function drawCorrKnight(c) {
  rr(c, -8, 9, 5.2, 12, 1.3); paint(c, fillLin(c, -8, 9, -3, 21, '#3a3430', '#16120e'), '#100c08', 1);
  rr(c, 3, 9, 5.2, 12, 1.3); paint(c, fillLin(c, 3, 9, 8, 21, '#2e2824', '#12100c'), '#100c08', 1);
  blob(c, 0, 3, 14.2, 13.4); paint(c, fillLin(c, -12, -8, 12, 16, '#4a4440', '#1a1612'), '#100c08', 1.7);
  rr(c, -14, -8, 28, 15, 3); paint(c, fillLin(c, -14, -8, 10, 8, '#6a645c', '#2a2620'), '#16120e', 1.4);
  glint(c, -6, -4, 5, 2, 0.18);
  rivet(c, -8, -2); rivet(c, 2, -3); rivet(c, 10, -1);
  c.strokeStyle = '#1a2414'; c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(-10, 4); c.quadraticCurveTo(-16, 10, -8, 16);
  c.moveTo(8, 2); c.quadraticCurveTo(14, 10, 6, 16);
  c.stroke();
  c.save();
  c.translate(15, 0); c.rotate(-0.4);
  c.fillStyle = fillLin(c, 0, -2, 0, 2, '#8a8478', '#3a342c');
  c.fillRect(0, -2, 22, 4);
  c.beginPath(); c.moveTo(20, -6); c.lineTo(30, 0); c.lineTo(20, 6); c.closePath();
  paint(c, fillLin(c, 20, -6, 30, 6, '#b0a898', '#4a443c'), '#1a140c', 1.2);
  c.restore();
  drawFace(c, 5.2, -14, 6.8, 6.4, {
    skin: '#8a7060', deep: '#4a3030', eye: '#6aaa50', white: '#2a2018',
    brow: 'rgba(20,10,10,0.6)', lid: 'rgba(30,12,12,0.45)'
  });
  rr(c, -3, -23, 14, 8, 2); paint(c, fillLin(c, -3, -23, 10, -16, '#4a443c', '#1a1612'), '#100c08', 1.2);
  c.beginPath(); c.moveTo(-1, -22); c.lineTo(-6, -30); c.lineTo(3, -22); c.closePath();
  paint(c, '#1a2414', '#0c100c', 1);
}

function drawWight(c, e) {
  const pulse = 0.55 + Math.sin((e.bob || 0) * 1.4) * 0.2;
  rr(c, -8, 10, 5, 10, 1.2); paint(c, fillLin(c, -8, 10, -3, 20, '#2a3228', '#101410'), '#0c100c', 1);
  rr(c, 3, 10, 5, 10, 1.2); paint(c, fillLin(c, 3, 10, 8, 20, '#222a20', '#0e120e'), '#0c100c', 1);
  blob(c, 0, 3, 13.5, 12.5); paint(c, fillLin(c, -10, -8, 10, 14, '#3a4438', '#141810'), '#10140c', 1.6);
  c.globalAlpha = pulse;
  c.strokeStyle = '#1a2414';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-10, -2); c.quadraticCurveTo(-4, 8, 2, 14);
  c.moveTo(8, -4); c.quadraticCurveTo(4, 6, -2, 14);
  c.stroke();
  c.globalAlpha = 1;
  drawFace(c, 3.6, -12.4, 6.6, 6.2, {
    skin: '#8a9a78', deep: '#3a4a30', eye: '#8acc60', white: '#1a2014',
    brow: 'rgba(20,28,16,0.5)', lip: 'rgba(20,30,16,0.4)', lid: 'rgba(20,28,16,0.4)'
  });
  c.beginPath();
  c.moveTo(-8, -14); c.quadraticCurveTo(2, -24, 12, -12); c.lineTo(8, -8); c.quadraticCurveTo(2, -14, -6, -10);
  c.closePath();
  paint(c, fillLin(c, 0, -24, 4, -8, '#1a2014', '#0a0c08'), '#080a06', 1.2);
}

function drawHound(c, e) {
  const bob = Math.sin(e.bob || 0) * 1.4;
  c.translate(0, bob);
  rr(c, -10, 4, 18, 7, 2.4); paint(c, fillLin(c, -10, 4, 8, 12, '#1a1614', '#0a0808'), '#080604', 1.3);
  rr(c, -8, 10, 4, 6, 1); paint(c, '#141010', '#080604', 0.8);
  rr(c, 4, 10, 4, 6, 1); paint(c, '#141010', '#080604', 0.8);
  blob(c, 10, 2, 6.2, 4.6); paint(c, fillLin(c, 8, -1, 14, 6, '#221c1a', '#0c0a0a'), '#080604', 1.1);
  c.fillStyle = '#6aaa50';
  c.beginPath(); c.ellipse(12.4, 1.2, 1.1, 1.3, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(10.2, 1.0, 0.9, 1.1, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#2a2018';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(-2, -2); c.lineTo(-6, -10);
  c.moveTo(2, -1); c.lineTo(0, -9);
  c.moveTo(6, 0); c.lineTo(8, -8);
  c.stroke();
  c.fillStyle = '#1a1410';
  c.beginPath(); c.moveTo(14, 2); c.lineTo(18, 4); c.lineTo(14, 5); c.closePath(); c.fill();
}

function drawChampion(c) {
  rr(c, -10, 12, 6.4, 13, 1.6); paint(c, fillLin(c, -10, 12, -4, 25, '#2a2218', '#100c08'), '#0c0806', 1.1);
  rr(c, 4, 12, 6.4, 13, 1.6); paint(c, fillLin(c, 4, 12, 10, 25, '#221a14', '#0e0a08'), '#0c0806', 1.1);
  blob(c, 0, 4, 17.5, 16); paint(c, fillLin(c, -14, -10, 14, 18, '#3a2e24', '#16120c'), '#100c08', 1.8);
  rr(c, -16, -8, 32, 16, 3); paint(c, fillLin(c, -16, -8, 12, 10, '#4a4034', '#221c16'), '#14100c', 1.5);
  c.strokeStyle = '#1a2414'; c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(-12, 0); c.quadraticCurveTo(-20, 10, -8, 20);
  c.moveTo(12, -2); c.quadraticCurveTo(22, 8, 8, 20);
  c.moveTo(0, -8); c.quadraticCurveTo(4, 6, 2, 18);
  c.stroke();
  c.save();
  c.translate(18, 2); c.rotate(0.15);
  c.fillStyle = fillLin(c, -2, -18, 2, 16, '#2a1c10', '#100c08');
  c.fillRect(-2.2, -16, 4.4, 30);
  blob(c, 0, -20, 8.4, 7); paint(c, fillRad(c, -2, -22, 1, 8, '#4a4034', '#1a1410'), '#100c08', 1.2);
  c.restore();
  drawFace(c, 5, -16, 8.2, 7.4, {
    skin: '#7a6048', deep: '#3a281c', eye: '#8acc50', white: '#2a2014',
    brow: 'rgba(20,12,8,0.6)', beard: '#2a2018', beardD: '#100c08', lid: 'rgba(30,16,10,0.4)'
  });
  c.beginPath();
  c.moveTo(-4, -22); c.lineTo(-10, -34); c.lineTo(2, -22);
  c.closePath();
  paint(c, '#1a2414', '#0c100c', 1.1);
}

function drawDrake(c, e) {
  const flap = Math.sin(e.bob || 0) * 3;
  rr(c, -14, 16, 10, 14, 2); paint(c, fillLin(c, -14, 16, -4, 30, '#1a2014', '#0c100c'), '#080a06', 1.2);
  rr(c, 4, 16, 10, 14, 2); paint(c, fillLin(c, 4, 16, 14, 30, '#161c12', '#0a0c08'), '#080a06', 1.2);
  blob(c, 0, 6, 22, 18); paint(c, fillLin(c, -18, -10, 16, 22, '#2a3224', '#10140c'), '#0c1008', 2);
  c.beginPath();
  c.moveTo(-8, -4); c.quadraticCurveTo(-28, -16 - flap, -34, 4); c.quadraticCurveTo(-16, 8, -6, 4);
  c.closePath();
  paint(c, fillLin(c, -20, -16, -8, 8, '#1a2418', '#0a1008'), '#080a06', 1.3);
  c.beginPath();
  c.moveTo(18, -2); c.lineTo(36, 2); c.lineTo(18, 8);
  c.closePath();
  paint(c, fillLin(c, 18, -2, 36, 8, '#2a3220', '#10140c'), '#0c1008', 1.2);
  c.strokeStyle = '#1a2414'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-6, 0); c.lineTo(-12, -16); c.moveTo(6, -2); c.lineTo(4, -18); c.stroke();
  drawFace(c, 8, -12, 9, 7.6, {
    skin: '#4a5a38', deep: '#1a2414', eye: '#8acc50', white: '#1a2010',
    brow: 'rgba(10,16,8,0.6)', noEar: true, lid: 'rgba(16,24,12,0.45)'
  });
  c.fillStyle = '#c8d8a0';
  c.beginPath(); c.moveTo(12, -4); c.lineTo(18, 0); c.lineTo(12, 1); c.closePath(); c.fill();
}

function drawMordred(c, e) {
  const glow = 0.28 + Math.sin((e.bob || 0) * 2) * 0.12;
  c.globalAlpha = 0.35;
  blob(c, 0, 2, 26, 22); paint(c, '#6aaa60', '#6aaa60', 0);
  c.globalAlpha = 1;
  rr(c, -10, 14, 7, 13, 1.6); paint(c, fillLin(c, -10, 14, -3, 27, '#1a1820', '#0c0a10'), '#08080c', 1.1);
  rr(c, 4, 14, 7, 13, 1.6); paint(c, fillLin(c, 4, 14, 11, 27, '#16141c', '#0a0810'), '#08080c', 1.1);
  blob(c, 0, 4, 18, 16); paint(c, fillLin(c, -14, -10, 14, 20, '#2a2434', '#100c18'), '#0c0a10', 1.8);
  c.globalAlpha = glow;
  blob(c, 6, -4, 10, 8); paint(c, '#8acc70', '#8acc70', 0);
  c.globalAlpha = 1;
  c.save();
  c.translate(16, -2); c.rotate(-0.5);
  c.fillStyle = fillLin(c, 0, -2, 0, 2, '#c8d0c0', '#4a5048');
  c.fillRect(0, -2, 24, 4);
  c.beginPath(); c.moveTo(22, -7); c.lineTo(34, 0); c.lineTo(22, 7); c.closePath();
  paint(c, fillLin(c, 22, -7, 34, 7, '#e8f0d8', '#5a6050'), '#1a140c', 1.2);
  c.restore();
  drawFace(c, 6, -16, 8.6, 8, {
    skin: '#b0a898', deep: '#4a3848', eye: '#b8f080', white: '#2a2030',
    brow: 'rgba(20,10,20,0.6)', lid: 'rgba(30,16,30,0.45)'
  });
  c.beginPath();
  c.moveTo(-6, -22); c.lineTo(-2, -34); c.lineTo(4, -22); c.lineTo(10, -32); c.lineTo(14, -20);
  c.closePath();
  paint(c, fillLin(c, 0, -34, 8, -20, '#2a2430', '#0c0a10'), '#08080c', 1.2);
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
  if (id === 'julian') drawJulian(c, arm);
  else if (id === 'austin') drawAustin(c, arm);
  else drawPapa(c, arm);
  c.restore();
}

function drawJulian(c, arm) {
  c.beginPath();
  c.moveTo(-2, -8); c.quadraticCurveTo(-26, 6, -16, 24); c.lineTo(8, 16); c.quadraticCurveTo(6, 2, 3, -6);
  c.closePath();
  paint(c, fillLin(c, -22, -8, 4, 22, '#c42830', '#6a1418'), '#3a0c10', 1.8);
  clothFold(c, -10, 0, -8, 16, 'rgba(80,16,16,0.35)');
  c.beginPath();
  c.moveTo(-18, 4); c.quadraticCurveTo(-10, 14, -6, 20); c.lineTo(2, 16); c.quadraticCurveTo(-2, 8, -4, 2);
  c.closePath();
  paint(c, fillLin(c, -16, 2, -4, 20, '#e6c040', '#8a6818'), '#5a4010', 1.1);
  rr(c, -6, 7, 4.4, 12, 1.2); paint(c, fillLin(c, -6, 7, -2, 19, '#8a8478', '#3a3630'), '#1a1610', 1);
  rr(c, 2, 7, 4.4, 12, 1.2); paint(c, fillLin(c, 2, 7, 6, 19, '#7a7468', '#2e2a24'), '#1a1610', 1);
  blob(c, -3.6, 19.4, 2.6, 1.3); paint(c, fillLin(c, -5, 18, -2, 21, '#4a4034', '#1a1610'), '#100c08', 0.8);
  blob(c, 4.4, 19.4, 2.6, 1.3); paint(c, fillLin(c, 3, 18, 6, 21, '#4a4034', '#1a1610'), '#100c08', 0.8);
  rr(c, -11, -11, 22, 22, 3.2); paint(c, fillLin(c, -11, -11, 9, 11, '#d0c8b8', '#6a6458'), '#2a241c', 1.8);
  glint(c, -4, -6, 5, 2.4, 0.28);
  c.beginPath(); c.moveTo(-8, -8); c.lineTo(8, -8); c.lineTo(6.4, 3); c.lineTo(-6.2, 3); c.closePath();
  paint(c, fillLin(c, 0, -8, 0, 4, '#e8e0d0', '#7a7468'), '#2a241c', 1.1);
  rivet(c, -6, -2); rivet(c, 5, -2);
  c.save();
  c.translate(-13, 4);
  blob(c, 0, 0, 7.2, 7.2); paint(c, fillRad(c, -2, -2, 1, 7.5, '#f0d060', '#8a6818'), '#3a2a0c', 1.3);
  c.fillStyle = '#1a140c';
  c.font = '700 6px Palatino, serif';
  c.textAlign = 'center';
  c.fillText('777', 0, 2.2);
  glint(c, -2, -2, 2, 1, 0.28);
  c.restore();
  drawFace(c, 1.2, -20.4, 7.4, 7.2, {
    skin: '#e4bc94', deep: '#8a5a3c', eye: '#3a2a18', brow: 'rgba(50,28,16,0.5)',
    lid: 'rgba(70,40,24,0.35)', lip: 'rgba(90,40,32,0.42)'
  });
  rr(c, -8, -31, 17, 11, 2.6); paint(c, fillLin(c, -8, -31, 8, -20, '#c8c0b0', '#5a5448'), '#2a241c', 1.4);
  c.beginPath(); c.rect(-2.2, -30, 2.2, 8); paint(c, '#e6c040', '#3a2a0c', 0.8);
  c.beginPath(); c.moveTo(3, -30.4); c.quadraticCurveTo(18, -46, 7, -28); c.quadraticCurveTo(8, -32, 3, -30.4);
  paint(c, fillLin(c, 6, -46, 8, -28, '#d03038', '#6a1418'), '#3a0c10', 1.3);
  glint(c, -2, -28, 2.6, 1.2, 0.24);
  c.save();
  c.translate(12, 0);
  c.rotate(arm);
  rr(c, -1, -3.2, 8, 6.2, 1.4); paint(c, fillLin(c, -1, -3, 6, 3, '#c8c0b0', '#5a5448'), '#2a241c', 1);
  c.fillStyle = fillLin(c, 6, -2.4, 6, 2.4, '#e8e4d8', '#7a7468');
  c.fillRect(7, -2.1, 22, 4.2);
  c.strokeStyle = '#2a241c'; c.lineWidth = 1.3; c.strokeRect(7, -2.1, 22, 4.2);
  c.fillStyle = '#8a6a44';
  c.fillRect(10, -1.15, 10, 2.3);
  c.beginPath(); c.moveTo(28, -6.4); c.lineTo(40, 0); c.lineTo(28, 6.4); c.closePath();
  paint(c, fillLin(c, 28, -6, 40, 6, '#f4f0e4', '#8a8478'), '#2a241c', 1.3);
  glint(c, 33, -1.4, 2.4, 1.1, 0.32);
  blob(c, 6.2, 0, 2.2, 2.2); paint(c, fillRad(c, 5.4, -0.6, 0.3, 2.3, '#e6c040', '#6a4814'), '#2a1c08', 0.8);
  c.restore();
}

function drawAustin(c, arm) {
  c.beginPath();
  c.moveTo(-8, -10);
  c.quadraticCurveTo(-26, 8, -9, 24);
  c.lineTo(13, 18);
  c.quadraticCurveTo(20, 2, 9, -12);
  c.quadraticCurveTo(2, -24, -6, -16);
  c.closePath();
  paint(c, fillLin(c, -16, -16, 8, 22, '#322848', '#0c0a14'), '#0a0810', 1.8);
  clothFold(c, -8, -2, -5, 16, 'rgba(80,50,120,0.28)');
  c.strokeStyle = 'rgba(80, 50, 120, 0.32)';
  c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(-14, 10, -4, 20); c.stroke();
  rr(c, -5, 7, 3.6, 11, 1.1); paint(c, fillLin(c, -5, 7, -2, 18, '#1e1828', '#0a0810'), '#0a0810', 1);
  rr(c, 2, 7, 3.6, 11, 1.1); paint(c, fillLin(c, 2, 7, 5, 18, '#181420', '#0a0810'), '#0a0810', 1);
  blob(c, -3, 18.4, 2.3, 1.2); paint(c, '#141018', '#08060c', 0.7);
  blob(c, 4, 18.4, 2.3, 1.2); paint(c, '#141018', '#08060c', 0.7);
  rr(c, -8, -9, 17, 17, 3.2); paint(c, fillLin(c, -8, -9, 8, 8, '#3a3048', '#14101c'), '#0a0810', 1.4);
  clothFold(c, -4, -4, -1, 6, 'rgba(12,8,16,0.35)');
  drawFace(c, 2.2, -15.6, 6.6, 6.4, {
    skin: '#c8a888', deep: '#4a3428', eye: '#d8b4ff', white: '#2a2030',
    brow: 'rgba(20,12,24,0.55)', lid: 'rgba(30,16,36,0.45)', noEar: true
  });
  c.beginPath();
  c.moveTo(-7, -16);
  c.quadraticCurveTo(1, -30, 13, -14);
  c.quadraticCurveTo(8, -7, -5, -10);
  c.closePath();
  paint(c, fillLin(c, 0, -30, 6, -8, '#2a2238', '#0c0a14'), '#0a0810', 1.4);
  c.beginPath();
  c.moveTo(-1, -12); c.quadraticCurveTo(4, -8, 8, -11);
  c.strokeStyle = 'rgba(12,8,16,0.45)'; c.lineWidth = 1.1; c.stroke();
  c.save();
  c.translate(12, 1);
  c.rotate(arm * 0.85);
  c.fillStyle = fillLin(c, -2, -20, 2, 12, '#5a4030', '#1e140c');
  c.fillRect(-2.3, -18, 4.6, 28);
  c.strokeStyle = '#0a0810'; c.lineWidth = 1.15; c.strokeRect(-2.3, -18, 4.6, 28);
  c.strokeStyle = 'rgba(30,16,8,0.3)'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-0.7, -16); c.lineTo(0.2, 8); c.stroke();
  blob(c, 0, -23, 8.4, 8.6); paint(c, fillRad(c, -2.2, -26, 1, 9, '#3a3438', '#121014'), '#0a0810', 1.4);
  [[-3.2, -26.4], [2.6, -26], [-3.6, -21.6], [2.8, -21.2]].forEach(([x, y]) => {
    blob(c, x, y, 2.1, 2.4); paint(c, fillRad(c, x - 0.6, y - 0.8, 0.3, 2.4, '#5a5458', '#1a1618'), '#0a0810', 0.7);
  });
  glint(c, -2.2, -26.2, 1.8, 1.1, 0.22);
  c.restore();
}

function drawPapa(c, arm) {
  rr(c, -8, 7, 5.6, 12, 1.4); paint(c, fillLin(c, -8, 7, -3, 19, '#6a4a2c', '#2a1c10'), '#1a1008', 1);
  rr(c, 3, 7, 5.6, 12, 1.4); paint(c, fillLin(c, 3, 7, 8, 19, '#5a3a22', '#24180c'), '#1a1008', 1);
  blob(c, -5, 19.5, 3.2, 1.5); paint(c, fillLin(c, -6, 18, -3, 21, '#4a301c', '#1a1008'), '#140c08', 0.8);
  blob(c, 6, 19.5, 3.2, 1.5); paint(c, fillLin(c, 5, 18, 8, 21, '#4a301c', '#1a1008'), '#140c08', 0.8);
  blob(c, 0, 3.4, 14.8, 12.6); paint(c, fillLin(c, -12, -6, 12, 15, '#8a9a78', '#3a4a30'), '#1a2410', 1.8);
  clothFold(c, -6, 0, -3, 10, 'rgba(20,28,14,0.3)');
  rr(c, -13, -9, 18, 18, 3.4); paint(c, fillLin(c, -13, -9, 4, 9, '#b8c4a0', '#5a6a48'), '#2a3020', 1.5);
  glint(c, -6, -5, 4, 2, 0.2);
  c.beginPath(); c.moveTo(-10, -2); c.lineTo(3, -2);
  c.strokeStyle = 'rgba(60,40,10,0.32)'; c.lineWidth = 1; c.stroke();
  c.save();
  c.translate(-11, -3);
  c.rotate(-0.38);
  rr(c, 0, -11, 5.4, 18, 1.2); paint(c, fillLin(c, 0, -11, 5, 6, '#7a5630', '#3a2814'), '#1a1008', 1);
  c.fillStyle = fillLin(c, 1, -9, 4, -3, '#d8b060', '#8a6818');
  c.fillRect(1.1, -9, 3.2, 6);
  c.restore();
  drawFace(c, 2.2, -16.6, 7.8, 7.2, {
    skin: '#e0b07a', deep: '#8a5a30', eye: '#3a2414', brow: 'rgba(60,32,16,0.5)',
    beard: '#5a3a20', beardD: '#2a180c', lid: 'rgba(70,40,20,0.35)'
  });
  c.beginPath();
  c.moveTo(-5.4, -21); c.quadraticCurveTo(2, -27, 9.6, -20.4); c.lineTo(8, -16.8); c.quadraticCurveTo(2, -21, -4.2, -17.2);
  c.closePath();
  paint(c, fillLin(c, 2, -27, 2, -17, '#2a4a28', '#142814'), '#0c180c', 1.1);
  c.fillStyle = '#1a3018';
  c.beginPath(); c.arc(-1.6, -21.4, 2.3, 0, Math.PI * 2); c.arc(4.4, -22, 2.5, 0, Math.PI * 2); c.fill();
  c.save();
  c.translate(13, 1);
  c.rotate(arm * 0.4);
  c.strokeStyle = '#3a2414';
  c.lineWidth = 3.6;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(8, 0, 15.5, -1.18, 1.18);
  c.stroke();
  c.strokeStyle = fillLin(c, 8, -16, 8, 16, '#c8a060', '#5a3a18');
  c.lineWidth = 2.2;
  c.beginPath();
  c.arc(8, 0, 15.5, -1.18, 1.18);
  c.stroke();
  c.strokeStyle = '#d8c8a8';
  c.lineWidth = 1.15;
  c.beginPath();
  c.moveTo(-2, 0); c.lineTo(21, 0);
  c.stroke();
  c.fillStyle = '#8a8070';
  c.beginPath(); c.moveTo(21, 0); c.lineTo(14.5, -3.2); c.lineTo(14.5, 3.2); c.closePath(); c.fill();
  c.fillStyle = '#c9a227';
  c.beginPath(); c.moveTo(-2.4, -2.6); c.lineTo(2.2, 0); c.lineTo(-2.4, 2.6); c.closePath(); c.fill();
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
    if (state.heroSeq[0] === 'julian' && state.heroSeq[1] === 'austin' && state.heroSeq[2] === 'papa') {
      state.heroSeq = [];
      if (state.tripleCd <= 0) fireTriple('Julian, Austin, Papa — 7 / 7 / 7.');
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
  ['julian', 'austin', 'papa'].forEach((id) => {
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
  const rf = $('#btnReinforce');
  if (rf) rf.classList.toggle('sel', state.placing === 'reinforce');
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
    if (distToPath(p) <= 58) dropReinforce(p);
    else {
      state.placing = null;
      syncHeroUI();
      toast('Hold.');
    }
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

function startPlay(difficulty) {
  ensureAudio();
  if (difficulty === 'standard' || difficulty === 'veteran') state.difficulty = difficulty;
  if (state.difficulty !== 'veteran') state.difficulty = 'standard';
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
  paintMini('austin', $('#hbAustin .mini'));
  paintMini('papa', $('#hbPapa .mini'));
  toast(currentLevel().name + '. ' + (isVeteran() ? 'Veteran siege. Foes run thicker.' : 'Standard siege. Julian the Lionhearted holds the south.'));
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
    toast(currentLevel().name + '. Stand again. ' + modeLabel() + '.');
  }
}

function bindUI() {
  $('#btnStandard').onclick = () => startPlay('standard');
  $('#btnVeteran').onclick = () => startPlay('veteran');
  $('#btnHow').onclick = () => { $('#scrHow').hidden = false; };
  const closeHow = () => { $('#scrHow').hidden = true; };
  $('#btnHowClose').onclick = closeHow;
  $('#btnHowX').onclick = closeHow;
  $('#btnPause').onclick = pauseGame;
  $('#btnResume').onclick = resumeGame;
  $('#btnRestartPause').onclick = restartFromOverlay;
  $('#btnRetry').onclick = restartFromOverlay;
  $('#btnVictory').onclick = () => startPlay();
  $('#btnNext').onclick = startNextSiege;
  $('#btnMute').onclick = () => {
    soundOn = !soundOn;
    $('#btnMute').textContent = soundOn ? '♪' : '×';
    if (soundOn) ensureAudio();
  };
  $('#btnWave').onclick = () => { ensureAudio(); tryCallWave(); };
  $('#btnReinforce').onclick = () => {
    if (state.mode !== 'play') return;
    if (state.placing === 'reinforce') {
      state.placing = null;
      syncHeroUI();
      toast('Hold.');
      return;
    }
    if (state.reinforceCd > 0) { toast('Soldiers are catching their breath.'); return; }
    state.placing = 'reinforce';
    state.selected = null;
    hideMenus();
    syncHeroUI();
    toast('Tap the road.');
  };
  $('#btnAbility').onclick = () => {
    if (state.mode !== 'play') return;
    const sel = state.selected && state.selected.kind === 'hero' ? state.selected.ref : state.heroes[0];
    if (!state.selected || state.selected.kind !== 'hero') selectHero(sel, false);
    useAbility(sel);
  };
  ['julian', 'austin', 'papa'].forEach((id) => {
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
paintMini('austin', $('#hbAustin .mini'));
paintMini('papa', $('#hbPapa .mini'));
requestAnimationFrame(loop);
