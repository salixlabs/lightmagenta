/* Spartan – Silent Spire 0.5.0 — data tables (weapons, enemies, skulls, campaign). */
(function (g) {
  "use strict";
  var DATA = {
    VERSION: "0.5.0",
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
    ember:    { w: 36, h: 42, hp: 28, spd: 55, range: 300, score: 100, dmg: 10, touch: 12, cool: 1.45 },
    reaver:   { w: 44, h: 72, hp: 86, spd: 110, range: 260, score: 250, dmg: 16, touch: 18, cool: 0.85 },
    stinger:  { w: 40, h: 28, hp: 24, spd: 80, range: 340, score: 150, dmg: 10, touch: 10, cool: 1.15, fly: true },
    turret:   { w: 40, h: 48, hp: 54, spd: 0, range: 420, score: 160, dmg: 12, touch: 10, cool: 0.72 },
    crawler:  { w: 28, h: 26, hp: 16, spd: 210, range: 40, score: 80, dmg: 0, touch: 14, cool: 9 },
    flood:    { w: 28, h: 26, hp: 16, spd: 210, range: 40, score: 80, dmg: 0, touch: 14, cool: 9 },
    carrier:  { w: 56, h: 86, hp: 120, spd: 42, range: 220, score: 320, dmg: 10, touch: 16, cool: 1.55 }
  };

  DATA.CAMPAIGN = [
    { id: "crimson", name: "1  CRIMSON APPROACH", playable: true },
    { id: "outer", name: "2  OUTER RING: BLOOD OF THE COVENANT", playable: true },
    { id: "gravity", name: "3  THE GRAVITY WELL", playable: true },
    { id: "infection", name: "4  INFECTION VECTOR", playable: true },
    { id: "heart", name: "5  THE SPIRE’S HEART", playable: true },
    { id: "core", name: "6  CORE OVERLOAD", playable: true }
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
      beacons: [
        { x: 2280, y: 676, drop: ["johnson"] }
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
    },
    {
      id: "outer",
      name: "OUTER RING",
      short: "OUTER RING",
      theme: "covenant",
      world: 7400,
      unlockSuit: false,
      boss: false,
      bossAt: 0,
      crate: null,
      datapads: [
        { x: 1640, y: 430, id: "outer1" },
        { x: 4880, y: 400, id: "outer2" }
      ],
      pickups: [
        { x: 1980, y: 620, wep: "plasma" },
        { x: 3320, y: 500, wep: "needler" },
        { x: 5460, y: 620, wep: "shotgun" }
      ],
      startDrop: ["johnson", "female"],
      midDropAt: 3100,
      midDrop: ["heavy"],
      checkpoints: [2100, 4200],
      wells: [],
      plats: [
        { x: 320, y: 548, w: 150, h: 20 }, { x: 560, y: 468, w: 130, h: 20 },
        { x: 820, y: 548, w: 140, h: 20 }, { x: 1100, y: 428, w: 160, h: 20 },
        { x: 1380, y: 548, w: 120, h: 20 }, { x: 1620, y: 448, w: 170, h: 20 },
        { x: 1960, y: 518, w: 140, h: 20 }, { x: 2280, y: 398, w: 150, h: 20 },
        { x: 2620, y: 528, w: 160, h: 20 }, { x: 2980, y: 438, w: 140, h: 20 },
        { x: 3280, y: 518, w: 180, h: 20 }, { x: 3680, y: 398, w: 130, h: 20 },
        { x: 3980, y: 548, w: 150, h: 20 }, { x: 4320, y: 458, w: 140, h: 20 },
        { x: 4660, y: 418, w: 190, h: 20 }, { x: 5040, y: 538, w: 150, h: 20 },
        { x: 5380, y: 438, w: 160, h: 20 }, { x: 5780, y: 518, w: 140, h: 20 },
        { x: 6120, y: 408, w: 170, h: 20 }, { x: 6520, y: 548, w: 180, h: 20 },
        { x: 6920, y: 468, w: 150, h: 20 }
      ],
      spawns: [
        { type: "ember", x: 700 }, { type: "turret", x: 980 }, { type: "reaver", x: 1180 },
        { type: "stinger", x: 1420 }, { type: "ember", x: 1600 }, { type: "turret", x: 1860 },
        { type: "reaver", x: 2140 }, { type: "stinger", x: 2380 }, { type: "ember", x: 2560 },
        { type: "reaver", x: 2860 }, { type: "turret", x: 3120 }, { type: "stinger", x: 3360 },
        { type: "ember", x: 3580 }, { type: "reaver", x: 3880 }, { type: "turret", x: 4140 },
        { type: "stinger", x: 4380 }, { type: "reaver", x: 4660 }, { type: "ember", x: 4900 },
        { type: "turret", x: 5180 }, { type: "reaver", x: 5460 }, { type: "stinger", x: 5720 },
        { type: "ember", x: 5980 }, { type: "reaver", x: 6280 }, { type: "turret", x: 6540 },
        { type: "stinger", x: 6820 }, { type: "reaver", x: 7080 }
      ]
    },
    {
      id: "gravity",
      name: "THE GRAVITY WELL",
      short: "GRAV WELL",
      theme: "well",
      world: 7200,
      unlockSuit: false,
      boss: false,
      bossAt: 0,
      crate: null,
      datapads: [
        { x: 2460, y: 300, id: "well1" },
        { x: 5120, y: 250, id: "well2" }
      ],
      pickups: [
        { x: 1760, y: 360, wep: "sniper" },
        { x: 4040, y: 620, wep: "plasma" }
      ],
      startDrop: ["female"],
      midDropAt: 3000,
      midDrop: ["johnson"],
      checkpoints: [2000, 4000],
      wells: [
        { x: 780, y: 160, w: 260, h: 540, mode: "lift" },
        { x: 1960, y: 40, w: 320, h: 660, mode: "low" },
        { x: 3480, y: 0, w: 260, h: 420, mode: "flip" },
        { x: 4980, y: 140, w: 300, h: 560, mode: "lift" },
        { x: 6200, y: 80, w: 240, h: 500, mode: "low" }
      ],
      plats: [
        { x: 360, y: 558, w: 180, h: 18 }, { x: 820, y: 420, w: 160, h: 18 },
        { x: 1180, y: 300, w: 150, h: 18 }, { x: 1540, y: 460, w: 170, h: 18 },
        { x: 1980, y: 240, w: 200, h: 18 }, { x: 2380, y: 360, w: 160, h: 18 },
        { x: 2740, y: 500, w: 180, h: 18 }, { x: 3180, y: 320, w: 150, h: 18 },
        { x: 3520, y: 180, w: 180, h: 18 }, { x: 3920, y: 420, w: 160, h: 18 },
        { x: 4280, y: 560, w: 190, h: 18 }, { x: 4720, y: 300, w: 170, h: 18 },
        { x: 5120, y: 220, w: 160, h: 18 }, { x: 5480, y: 400, w: 180, h: 18 },
        { x: 5920, y: 520, w: 160, h: 18 }, { x: 6280, y: 280, w: 190, h: 18 },
        { x: 6680, y: 460, w: 170, h: 18 }
      ],
      spawns: [
        { type: "stinger", x: 860 }, { type: "ember", x: 1180 }, { type: "stinger", x: 1560 },
        { type: "ember", x: 1980 }, { type: "stinger", x: 2360 }, { type: "reaver", x: 2780 },
        { type: "stinger", x: 3180 }, { type: "ember", x: 3520 }, { type: "stinger", x: 3960 },
        { type: "ember", x: 4360 }, { type: "stinger", x: 4780 }, { type: "reaver", x: 5180 },
        { type: "stinger", x: 5580 }, { type: "ember", x: 5980 }, { type: "stinger", x: 6380 },
        { type: "ember", x: 6760 }
      ]
    },
    {
      id: "infection",
      name: "INFECTION VECTOR",
      short: "INFECTION",
      theme: "flood",
      world: 7600,
      unlockSuit: false,
      boss: false,
      bossAt: 0,
      crate: null,
      datapads: [
        { x: 1880, y: 470, id: "flood1" },
        { x: 5040, y: 430, id: "flood2" }
      ],
      pickups: [
        { x: 2360, y: 620, wep: "sword" },
        { x: 4120, y: 620, wep: "shotgun" },
        { x: 6180, y: 500, wep: "needler" }
      ],
      startDrop: ["johnson", "heavy"],
      midDropAt: 3400,
      midDrop: ["female"],
      checkpoints: [2200, 4600],
      wells: [],
      plats: [
        { x: 300, y: 568, w: 200, h: 20 }, { x: 740, y: 508, w: 180, h: 20 },
        { x: 1180, y: 568, w: 160, h: 20 }, { x: 1560, y: 488, w: 200, h: 20 },
        { x: 2040, y: 548, w: 170, h: 20 }, { x: 2480, y: 468, w: 160, h: 20 },
        { x: 2920, y: 548, w: 190, h: 20 }, { x: 3380, y: 488, w: 170, h: 20 },
        { x: 3820, y: 428, w: 180, h: 20 }, { x: 4260, y: 548, w: 200, h: 20 },
        { x: 4780, y: 468, w: 180, h: 20 }, { x: 5220, y: 548, w: 160, h: 20 },
        { x: 5640, y: 428, w: 190, h: 20 }, { x: 6120, y: 518, w: 180, h: 20 },
        { x: 6580, y: 568, w: 200, h: 20 }, { x: 7040, y: 488, w: 170, h: 20 }
      ],
      spawns: [
        { type: "crawler", x: 720 }, { type: "crawler", x: 860 }, { type: "ember", x: 1100 },
        { type: "crawler", x: 1320 }, { type: "carrier", x: 1680 }, { type: "crawler", x: 1860 },
        { type: "ember", x: 2140 }, { type: "crawler", x: 2360 }, { type: "crawler", x: 2480 },
        { type: "carrier", x: 2860 }, { type: "crawler", x: 3080 }, { type: "reaver", x: 3380 },
        { type: "crawler", x: 3620 }, { type: "crawler", x: 3780 }, { type: "carrier", x: 4120 },
        { type: "crawler", x: 4380 }, { type: "ember", x: 4680 }, { type: "crawler", x: 4920 },
        { type: "carrier", x: 5280 }, { type: "crawler", x: 5520 }, { type: "crawler", x: 5680 },
        { type: "reaver", x: 5980 }, { type: "crawler", x: 6240 }, { type: "carrier", x: 6560 },
        { type: "crawler", x: 6820 }, { type: "crawler", x: 7040 }, { type: "ember", x: 7280 }
      ]
    },
    {
      id: "heart",
      name: "THE SPIRE’S HEART",
      short: "SPIRE HEART",
      theme: "spire",
      world: 7000,
      unlockSuit: false,
      boss: false,
      bossAt: 0,
      crate: null,
      datapads: [
        { x: 1420, y: 350, id: "heart1" },
        { x: 3680, y: 300, id: "heart2" },
        { x: 5480, y: 380, id: "heart3" }
      ],
      pickups: [
        { x: 2200, y: 360, wep: "rocket" },
        { x: 4560, y: 620, wep: "sniper" }
      ],
      startDrop: ["female", "heavy"],
      midDropAt: 2800,
      midDrop: ["johnson"],
      checkpoints: [1900, 4000],
      wells: [],
      plats: [
        { x: 260, y: 548, w: 120, h: 18 }, { x: 460, y: 448, w: 110, h: 18 },
        { x: 680, y: 348, w: 120, h: 18 }, { x: 920, y: 448, w: 100, h: 18 },
        { x: 1140, y: 548, w: 130, h: 18 }, { x: 1400, y: 368, w: 140, h: 18 },
        { x: 1680, y: 468, w: 110, h: 18 }, { x: 1920, y: 348, w: 120, h: 18 },
        { x: 2180, y: 268, w: 130, h: 18 }, { x: 2460, y: 448, w: 110, h: 18 },
        { x: 2720, y: 548, w: 140, h: 18 }, { x: 3040, y: 398, w: 120, h: 18 },
        { x: 3320, y: 298, w: 130, h: 18 }, { x: 3640, y: 218, w: 140, h: 18 },
        { x: 3960, y: 398, w: 110, h: 18 }, { x: 4240, y: 518, w: 130, h: 18 },
        { x: 4560, y: 398, w: 120, h: 18 }, { x: 4860, y: 298, w: 110, h: 18 },
        { x: 5160, y: 448, w: 130, h: 18 }, { x: 5460, y: 348, w: 140, h: 18 },
        { x: 5800, y: 518, w: 120, h: 18 }, { x: 6100, y: 398, w: 130, h: 18 },
        { x: 6420, y: 548, w: 150, h: 18 }
      ],
      spawns: [
        { type: "reaver", x: 640 }, { type: "crawler", x: 860 }, { type: "turret", x: 1100 },
        { type: "crawler", x: 1320 }, { type: "ember", x: 1560 }, { type: "carrier", x: 1860 },
        { type: "crawler", x: 2080 }, { type: "reaver", x: 2360 }, { type: "crawler", x: 2580 },
        { type: "turret", x: 2860 }, { type: "crawler", x: 3080 }, { type: "reaver", x: 3380 },
        { type: "carrier", x: 3680 }, { type: "crawler", x: 3900 }, { type: "stinger", x: 4180 },
        { type: "crawler", x: 4420 }, { type: "reaver", x: 4720 }, { type: "turret", x: 4980 },
        { type: "crawler", x: 5220 }, { type: "carrier", x: 5520 }, { type: "crawler", x: 5760 },
        { type: "reaver", x: 6040 }, { type: "crawler", x: 6280 }, { type: "ember", x: 6560 }
      ]
    },
    {
      id: "core",
      name: "CORE OVERLOAD",
      short: "CORE",
      theme: "climax",
      world: 6400,
      unlockSuit: false,
      boss: true,
      bossAt: 4300,
      crate: null,
      datapads: [
        { x: 2680, y: 470, id: "core1" }
      ],
      pickups: [
        { x: 1860, y: 620, wep: "rocket" },
        { x: 3480, y: 620, wep: "austin" }
      ],
      startDrop: ["johnson", "female", "heavy"],
      midDropAt: 2400,
      midDrop: ["heavy"],
      checkpoints: [1800, 3600],
      wells: [],
      plats: [
        { x: 340, y: 558, w: 180, h: 20 }, { x: 720, y: 488, w: 160, h: 20 },
        { x: 1120, y: 548, w: 170, h: 20 }, { x: 1540, y: 468, w: 180, h: 20 },
        { x: 1980, y: 548, w: 160, h: 20 }, { x: 2400, y: 428, w: 170, h: 20 },
        { x: 2840, y: 508, w: 190, h: 20 }, { x: 3280, y: 448, w: 160, h: 20 },
        { x: 3720, y: 548, w: 180, h: 20 }, { x: 4180, y: 468, w: 200, h: 20 },
        { x: 4680, y: 548, w: 220, h: 20 }, { x: 5200, y: 488, w: 180, h: 20 },
        { x: 5680, y: 548, w: 200, h: 20 }
      ],
      spawns: [
        { type: "ember", x: 700 }, { type: "ember", x: 860 }, { type: "crawler", x: 1100 },
        { type: "crawler", x: 1240 }, { type: "reaver", x: 1560 }, { type: "turret", x: 1860 },
        { type: "crawler", x: 2100 }, { type: "carrier", x: 2380 }, { type: "ember", x: 2640 },
        { type: "reaver", x: 2920 }, { type: "crawler", x: 3160 }, { type: "crawler", x: 3300 },
        { type: "stinger", x: 3580 }, { type: "carrier", x: 3860 }, { type: "reaver", x: 4120 }
      ]
    }
  ];

  DATA.PADS = {
    pad1: { title: "UNSC LOG / PELICAN 3-7", body: "Solo insertion confirmed. Spartan on the pad. Cortana riding the suit. Silent Spire is not in any chart we trust." },
    pad2: { title: "COVENANT VANE", body: "They are bleeding for this ring. If the Prophets want the Spire, we want it first." },
    outer1: { title: "SANGHEILI MARK", body: "Elites stacked three deep on the vane. They die pretty. We die quieter." },
    outer2: { title: "PROPHET WHISPER", body: "The Outer Ring is a lock. Break it and the Well answers." },
    well1: { title: "FORERUNNER LIFT", body: "Gravity here is a suggestion. Don't argue with a suggestion that can throw a Pelican." },
    well2: { title: "WELL NOTE", body: "Cortana says the Well is hungry. I told her I already ate." },
    flood1: { title: "INFECTION LOG", body: "Something in the vents is learning our names. Do not let it finish the sentence." },
    flood2: { title: "CARRIER SIGHTING", body: "If it looks full, it is. Stay wide. Birthday still works. Thank you, Cortana." },
    heart1: { title: "SPIRE HALL", body: "Forerunner stone. Covenant blood. Flood moss. Pick a religion, Chief." },
    heart2: { title: "CORTANA MARGIN", body: "I mapped three dead languages before breakfast. The Heart still won't tell me its real name." },
    heart3: { title: "CORE WARNING", body: "The overload is already counting. We are late on purpose." },
    core1: { title: "LAST PAD", body: "Tartarus wants the Core. The Flood wants everything else. We want the door shut." }
  };

  DATA.CINE = {
    intro: {
      lines: [
        { who: "CORTANA", text: "Chief. Silent Spire. Solo insertion. I'll keep the Pelican honest." },
        { who: "CHIEF", text: "Understood." },
        { who: "CORTANA", text: "Covenant on the approach. Stay pretty." }
      ]
    },
    bridges: {
      1: {
        lines: [
          { who: "CORTANA", text: "Approach is clean. Outer Ring next — they stacked the pretty ones." },
          { who: "CHIEF", text: "Copy." },
          { who: "CORTANA", text: "Blood of the Covenant. Try not to donate." }
        ]
      },
      2: {
        lines: [
          { who: "CORTANA", text: "Ring's cracked. Gravity Well ahead. Up is a rumor." },
          { who: "CHIEF", text: "Jump stays a button." },
          { who: "CORTANA", text: "Good. I hate puzzles." }
        ]
      },
      3: {
        lines: [
          { who: "CORTANA", text: "Don't like that green. Infection Vector. This is where it starts." },
          { who: "CHIEF", text: "Flood." },
          { who: "CORTANA", text: "Keep it PG, Chief. Birthday skull still works." }
        ]
      },
      4: {
        lines: [
          { who: "CORTANA", text: "The Spire's Heart. Halls so tight even I feel claustrophobic." },
          { who: "CHIEF", text: "Move." },
          { who: "CORTANA", text: "Covenant leftovers plus Flood. Mix well. Do not taste." }
        ]
      },
      5: {
        lines: [
          { who: "CORTANA", text: "Core Overload. This is the loud door." },
          { who: "CHIEF", text: "Tartarus." },
          { who: "CORTANA", text: "And whoever else wants a vote. End it." }
        ]
      }
    },
    outro: {
      lines: [
        { who: "CORTANA", text: "Core's quiet. Spire's ours, for a minute." },
        { who: "CHIEF", text: "Good." },
        { who: "CORTANA", text: "Austin-444. Still pretty. Let's go home." }
      ]
    }
  };

  DATA.WIN = {
    title: "SILENT SPIRE",
    chief: "Spire is quiet.",
    cortana: "That's the set. Austin-444 — still pretty.",
    sub: "Campaign complete. Crimson Approach through Core Overload."
  };

  g.SS = g.SS || {};
  g.SS.data = DATA;
})(window);
