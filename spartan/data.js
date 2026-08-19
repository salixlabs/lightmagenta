/* Spartan – Silent Spire 0.4.0 — data tables (weapons, enemies, skulls, campaign). */
(function (g) {
  "use strict";
  var DATA = {
    VERSION: "0.4.0",
    TITLE: "SPARTAN – SILENT SPIRE",
    HERO: "AUSTIN-444",
    PLAY_URL: "https://lightmagenta.com/spartan",
    W: 1280,
    H: 800,
    GROUND: 708
  };

  DATA.SUITS = {
    olive:   { body: "#3f6a28", dark: "#243e16", light: "#6a9a3e", trim: "#2c2410", visor: "#f0b429", name: "OLIVE" },
    steel:   { body: "#6d7d8c", dark: "#3a4650", light: "#b0c0cc", trim: "#1c2228", visor: "#8fd4ff", name: "STEEL" },
    crimson: { body: "#8e1f2c", dark: "#4e1018", light: "#d45454", trim: "#2a0c10", visor: "#ffc44a", name: "CRIMSON" },
    austin:  { body: "#1a2748", dark: "#0c1428", light: "#2ee0d0", trim: "#3f6a28", visor: "#3cf0ff", name: "AUSTIN SUIT" }
  };

  DATA.DIFFS = [
    { id: "easy", name: "EASY", taken: 0.55, hp: 0.7, dmg: 0.6, ammo: 1.4, nades: 4, checkEvery: 2 },
    { id: "normal", name: "NORMAL", taken: 1, hp: 1, dmg: 1, ammo: 1, nades: 3, checkEvery: 3 },
    { id: "heroic", name: "HEROIC", taken: 1.35, hp: 1.35, dmg: 1.4, ammo: 0.85, nades: 2, checkEvery: 0 },
    { id: "legendary", name: "LEGENDARY", taken: 1.8, hp: 1.7, dmg: 1.85, ammo: 0.7, nades: 2, checkEvery: 0 }
  ];

  DATA.SKULLS = [
    { id: "birthday", name: "BIRTHDAY", icon: "🎉", short: "Confetti kills. No gore.", desc: "Enemies pop into confetti and streamers." },
    { id: "camo", name: "ACTIVE CAMO", icon: "👻", short: "Near-invisible. They ignore you.", desc: "The Spartan fades. Enemies hunt Marines, not you." },
    { id: "iron", name: "IRON", icon: "⚔", short: "Death restarts the level.", desc: "No checkpoints. Fall and the whole stage resets." },
    { id: "blackeye", name: "BLACK EYE", icon: "👁", short: "Melee recharges shields.", desc: "Shields stay down until a melee connects." },
    { id: "cowbell", name: "COWBELL", icon: "💥", short: "Huge explosions. More shake.", desc: "Blasts, particles, and camera kick go loud." },
    { id: "mythic", name: "MYTHIC", icon: "☠", short: "Tankier. They hit harder.", desc: "Enemy health and damage jump way up." }
  ];

  DATA.WEPS = [
    { id: "assault", name: "ASSAULT RIFLE", short: "AR", rate: 78, dmg: 10, spread: 0.05, speed: 1080, count: 1, r: 4, life: 0.62, color: "#d8e6c8", kind: "proj", mag: 32, reserve: 192, start: true },
    { id: "magnum", name: "MAGNUM", short: "MAG", rate: 280, dmg: 28, spread: 0.012, speed: 1400, count: 1, r: 4.2, life: 0.7, color: "#f4e4b0", kind: "pistol", mag: 8, reserve: 40, start: true },
    { id: "shotgun", name: "SHOTGUN", short: "SHOT", rate: 460, dmg: 7, spread: 0.4, speed: 840, count: 8, r: 3.2, life: 0.36, color: "#f0d080", kind: "proj", mag: 6, reserve: 24, start: false },
    { id: "plasma", name: "PLASMA RIFLE", short: "PLASMA", rate: 96, dmg: 12, spread: 0.03, speed: 720, count: 1, r: 7, life: 1.0, color: "#7cf0ff", kind: "plasma", mag: 0, reserve: 0, start: false },
    { id: "needler", name: "NEEDLER", short: "NEEDLE", rate: 88, dmg: 6, spread: 0.06, speed: 780, count: 1, r: 4.5, life: 0.95, color: "#f9a8d4", kind: "needle", mag: 18, reserve: 54, start: false },
    { id: "rocket", name: "ROCKET LAUNCHER", short: "ROCKET", rate: 980, dmg: 90, spread: 0.01, speed: 520, count: 1, r: 9, life: 1.4, color: "#fb923c", kind: "rocket", mag: 2, reserve: 6, start: false },
    { id: "sword", name: "ENERGY SWORD", short: "SWORD", rate: 420, dmg: 55, spread: 0, speed: 0, count: 0, r: 0, life: 0, color: "#86efac", kind: "sword", mag: 100, reserve: 0, start: false },
    { id: "sniper", name: "SNIPER RIFLE", short: "SNIPER", rate: 680, dmg: 72, spread: 0, speed: 2200, count: 1, r: 3, life: 0.45, color: "#ffe9a0", kind: "sniper", mag: 4, reserve: 16, start: false },
    { id: "austin", name: "AUSTIN'S GUN", short: "A-GUN", rate: 360, dmg: 90, spread: 0.02, speed: 540, count: 1, r: 16, life: 1.15, color: "#ffb020", kind: "austin", mag: 99, reserve: 0, start: false, secret: true }
  ];

  DATA.ENEMIES = {
    ember:   { w: 36, h: 42, hp: 28, spd: 55, range: 300, score: 100, dmg: 10, touch: 12, cool: 1.45 },
    reaver:  { w: 44, h: 72, hp: 86, spd: 110, range: 260, score: 250, dmg: 16, touch: 18, cool: 0.85 },
    stinger: { w: 40, h: 28, hp: 24, spd: 80, range: 340, score: 150, dmg: 10, touch: 10, cool: 1.15, fly: true }
  };

  DATA.CAMPAIGN = [
    { id: "crimson", name: "1  CRIMSON APPROACH", playable: true },
    { id: "outer", name: "2  OUTER RING: BLOOD OF THE COVENANT", playable: false },
    { id: "gravity", name: "3  THE GRAVITY WELL", playable: false },
    { id: "infection", name: "4  INFECTION VECTOR", playable: false },
    { id: "heart", name: "5  THE SPIRE’S HEART", playable: false },
    { id: "core", name: "6  CORE OVERLOAD", playable: false }
  ];

  DATA.MARINES = {
    johnson: { w: 56, h: 104, hp: 140, dmg: 16, rate: 0.42, spd: 210, label: "SGT. JOHNSON", color: "#5eead4", shot: "rifle" },
    female:  { w: 52, h: 100, hp: 96, dmg: 11, rate: 0.28, spd: 235, label: "MARINE", color: "#86efac", shot: "rifle" },
    heavy:   { w: 64, h: 114, hp: 180, dmg: 42, rate: 1.12, spd: 148, label: "HEAVY", color: "#fbbf24", shot: "rocket" }
  };

  DATA.LEVELS = [
    {
      id: "crimson",
      name: "CRIMSON APPROACH",
      short: "APPROACH",
      theme: "crimson",
      world: 6800,
      unlockSuit: false,
      boss: false,
      bossAt: 0,
      fullSlice: true,
      crate: { x: 860, y: 444 },
      datapads: [
        { x: 1580, y: 500, id: "pad1" },
        { x: 4120, y: 470, id: "pad2" }
      ],
      pickups: [
        { x: 2140, y: 620, wep: "shotgun" },
        { x: 3560, y: 620, wep: "plasma" }
      ],
      startDrop: ["johnson", "female"],
      midDropAt: 2680,
      midDrop: ["heavy"],
      checkpoints: [1880, 3600],
      wells: [],
      plats: [
        { x: 380, y: 558, w: 210, h: 22 }, { x: 820, y: 488, w: 180, h: 22 },
        { x: 1320, y: 568, w: 200, h: 22 }, { x: 1860, y: 498, w: 230, h: 22 },
        { x: 2460, y: 448, w: 170, h: 22 }, { x: 3040, y: 548, w: 240, h: 22 },
        { x: 3680, y: 478, w: 190, h: 22 }, { x: 4280, y: 558, w: 220, h: 22 },
        { x: 4880, y: 508, w: 200, h: 22 }, { x: 5480, y: 468, w: 220, h: 22 },
        { x: 6040, y: 548, w: 190, h: 22 }
      ],
      spawns: [
        { type: "ember", x: 760 }, { type: "ember", x: 980 }, { type: "ember", x: 1220 },
        { type: "stinger", x: 1480 }, { type: "ember", x: 1680 }, { type: "ember", x: 1920 },
        { type: "stinger", x: 2180 }, { type: "ember", x: 2420 }, { type: "reaver", x: 2680 },
        { type: "ember", x: 2920 }, { type: "stinger", x: 3180 }, { type: "ember", x: 3440 },
        { type: "ember", x: 3680 }, { type: "reaver", x: 3960 }, { type: "stinger", x: 4220 },
        { type: "ember", x: 4480 }, { type: "ember", x: 4760 }, { type: "stinger", x: 5040 },
        { type: "reaver", x: 5320 }, { type: "ember", x: 5600 }, { type: "ember", x: 5880 },
        { type: "stinger", x: 6160 }, { type: "ember", x: 6420 }
      ]
    }
  ];

  DATA.PADS = {
    pad1: { title: "UNSC LOG / PELICAN 3-7", body: "Solo insertion confirmed. Spartan on the pad. Cortana riding the suit. Silent Spire is not in any chart we trust." },
    pad2: { title: "COVENANT VANE", body: "They are bleeding for this ring. If the Prophets want the Spire, we want it first." }
  };

  DATA.CINE = {
    intro: {
      lines: [
        { who: "CORTANA", text: "Chief. Silent Spire. Solo insertion. I'll keep the Pelican honest." },
        { who: "CHIEF", text: "Understood." },
        { who: "CORTANA", text: "Covenant on the approach. Stay pretty." }
      ]
    },
    outro: {
      lines: [
        { who: "CORTANA", text: "Approach is clear. That's the slice." },
        { who: "CHIEF", text: "Copy." },
        { who: "CORTANA", text: "Coming next: Outer Ring — Blood of the Covenant." }
      ]
    }
  };

  DATA.WIN = {
    title: "CRIMSON APPROACH",
    chief: "Approach is clear.",
    cortana: "Coming next — Outer Ring: Blood of the Covenant.",
    sub: "Level 1 vertical slice. Campaign stages 2–6 are not in this build."
  };

  g.SS = g.SS || {};
  g.SS.data = DATA;
})(window);
