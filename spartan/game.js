/* Spartan – Silent Spire 0.4.0 — simulation + render. Input lives in input.js. */
(function () {
  "use strict";
  var D = SS.data;
  var VERSION = D.VERSION, W = D.W, H = D.H, GROUND = D.GROUND;
  var WEPS = D.WEPS, SUITS = D.SUITS, LEVELS = D.LEVELS;
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  var stage = document.getElementById("stage");
  var touchRoot = document.getElementById("touch");
  var panel = document.getElementById("panel");
  var brief = document.getElementById("brief");
  var resumeBtn = document.getElementById("resume");
  var austinSuitBtn = document.getElementById("austinSuitBtn");
  var wepRadial = document.getElementById("wepRadial");
  var input = new SS.Input({ root: touchRoot });

  var TITLE_FILES = ["title-silent-spire.png", "title-spartan-444.png"];
  var titleImg = new Image();
  var titleReady = false;
  (function loadTitle(i) {
    if (i >= TITLE_FILES.length) return;
    var im = new Image();
    im.onload = function () { titleImg = im; titleReady = true; };
    im.onerror = function () { loadTitle(i + 1); };
    im.src = TITLE_FILES[i];
  })(0);

  var SPARTAN_PNG = "spartan-444-side.png";
  var ARENA_PNG = "spartan-arena-bg.png";
  var EMBER_PNG = "enemy-ember.png";
  var REAVER_PNG = "enemy-reaver.png";
  var VORRAK_PNG = "boss-vorrak.png";
  var JOHNSON_PNG = "sergeant-johnson.png";
  var PELICAN_PNG = "pelican-dropship.png";
  var MARINE_FEMALE_PNG = "marine-female.png";
  var MARINE_HEAVY_PNG = "marine-heavy.png";
  var AUSTIN_SUIT_PNG = "austin-suit-side.png";
  var spartanImg = new Image(), arenaImg = new Image(), emberImg = new Image();
  var reaverImg = new Image(), vorrakImg = new Image(), johnsonImg = new Image();
  var pelicanImg = new Image(), marineFemaleImg = new Image(), marineHeavyImg = new Image();
  var austinSuitImg = new Image();
  var spartanReady = false, arenaReady = false, emberReady = false, reaverReady = false;
  var vorrakReady = false, johnsonReady = false, pelicanReady = false;
  var marineFemaleReady = false, marineHeavyReady = false, austinSuitReady = false;
  function bootImg(img, src, flag) { img.onload = function () { window[flag] = true; }; img.onerror = function () {}; img.src = src; }
  spartanImg.onload = function () { spartanReady = true; };
  arenaImg.onload = function () { arenaReady = true; };
  emberImg.onload = function () { emberReady = true; };
  reaverImg.onload = function () { reaverReady = true; };
  vorrakImg.onload = function () { vorrakReady = true; };
  johnsonImg.onload = function () { johnsonReady = true; };
  pelicanImg.onload = function () { pelicanReady = true; };
  marineFemaleImg.onload = function () { marineFemaleReady = true; };
  marineHeavyImg.onload = function () { marineHeavyReady = true; };
  austinSuitImg.onload = function () { austinSuitReady = true; };
  spartanImg.src = SPARTAN_PNG; arenaImg.src = ARENA_PNG; emberImg.src = EMBER_PNG;
  reaverImg.src = REAVER_PNG; vorrakImg.src = VORRAK_PNG; johnsonImg.src = JOHNSON_PNG;
  pelicanImg.src = PELICAN_PNG; marineFemaleImg.src = MARINE_FEMALE_PNG;
  marineHeavyImg.src = MARINE_HEAVY_PNG; austinSuitImg.src = AUSTIN_SUIT_PNG;

  var suitSprites = Object.create(null);
  var stingerSpr = null, floodSpr = null;
  var worldW = 6800;
  var state = "title";
  var audioOk = false, ac = null, last = 0;
  var shake = 0, hitStop = 0, hitFlash = 0, hitTint = 1;
  var banner = "", bannerT = 0, cortana = "", cortanaT = 0;
  var score = 0, levelIdx = 0, waveAlive = 0, spawnQ = [], spawnMarks = [];
  var won = false, camX = 0, camLock = 0, midDropped = false;
  var pendingLevel = -1, nextLevelAt = 0, pendingPelican = null, pelicanAt = 0;
  var jumpBuf = 0, coyote = 0, jumpHeld = false, jumpWas = false, thrusterUsed = false;
  var pendingBoss = 0, nextBossAt = 0, pendingWin = 0, winAt = 0, crestSpawned = false;
  var shieldChime = false, hudPad = { l: 16, r: 16, t: 14 };
  var beams = [];
  var konami = [];
  var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"];
  var diffIdx = 1;
  var skullOn = { birthday: false, camo: false, iron: false, blackeye: false, cowbell: false, mythic: false };
  var cine = null, cineLine = 0, cineWait = 0, cineKind = "intro";
  var checkpoint = null;
  var nades = 3, cook = 0, cooking = false;
  var pads = [];
  var wepDrops = [];
  var nearbyPad = null;
  var meleeLock = 0;

  function lsGet(k) { return SS.lsGet(k); }
  function lsSet(k, v) { SS.lsSet(k, v); }
  var store = {
    gun: lsGet("sf_austinGun") === "1",
    suit: lsGet("sf_austinSuit") === "1",
    best: parseInt(lsGet("sf_best") || "0", 10) || 0
  };

  function emptyOwned() {
    var o = {};
    for (var i = 0; i < WEPS.length; i++) o[WEPS[i].id] = !!WEPS[i].start;
    if (store.gun) o.austin = true;
    return o;
  }
  function emptyAmmo() {
    var a = [];
    var mul = D.DIFFS[diffIdx].ammo;
    for (var i = 0; i < WEPS.length; i++) {
      var w = WEPS[i];
      a.push({ mag: w.mag, reserve: Math.round(w.reserve * mul) });
    }
    return a;
  }

  var player = {
    x: 180, y: GROUND - 104, w: 60, h: 104, vx: 0, vy: 0,
    face: 1, onG: false, hp: 100, maxHp: 100, sh: 80, maxSh: 80,
    lastHit: -99, wep: 0, cool: 0, heat: 0, over: false,
    suit: "olive", inv: 0, muzzle: 0, aim: 0, crouched: false,
    owned: emptyOwned(), ammo: emptyAmmo()
  };

  function Pool(n, make) {
    this.live = []; this.dead = []; this.make = make;
    for (var i = 0; i < n; i++) this.dead.push(make());
  }
  Pool.prototype.get = function () {
    var o = this.dead.pop() || this.make();
    o.on = true; this.live.push(o); return o;
  };
  Pool.prototype.each = function (fn) {
    for (var i = this.live.length - 1; i >= 0; i--) {
      if (!fn(this.live[i])) {
        this.live[i].on = false;
        this.dead.push(this.live[i]);
        this.live.splice(i, 1);
      }
    }
  };
  Pool.prototype.killAll = function () {
    while (this.live.length) {
      var o = this.live.pop(); o.on = false; this.dead.push(o);
    }
  };

  var bullets = new Pool(180, function () { return { on: 0, x: 0, y: 0, vx: 0, vy: 0, r: 3, life: 1, dmg: 1, friendly: 1, color: "#fff", homing: 0, kind: "", splash: 0 }; });
  var particles = new Pool(520, function () { return { on: 0, x: 0, y: 0, vx: 0, vy: 0, life: 1, max: 1, r: 3, color: "#fff", g: 400, fr: 0.98, stream: 0 }; });
  var enemies = [];
  var pickups = [];
  var crate = null;
  var johnson = null;
  var marines = [];
  var pelican = null;
  var plats = [{ x: 0, y: GROUND, w: worldW, h: 120 }];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function currentLevel() { return LEVELS[levelIdx] || LEVELS[0]; }
  function diff() { return D.DIFFS[diffIdx]; }
  function skull(id) { return !!skullOn[id]; }
  function boomScale() { return skull("cowbell") ? 2.4 : 1; }

  function readSafe() {
    var cs = getComputedStyle(document.documentElement);
    function px(v) { return parseFloat(v) || 0; }
    hudPad.l = 16 + px(cs.getPropertyValue("--safe-l"));
    hudPad.r = 16 + px(cs.getPropertyValue("--safe-r"));
    hudPad.t = 14 + px(cs.getPropertyValue("--safe-t"));
  }
  function checkOrient() {
    var port = window.innerHeight > window.innerWidth;
    document.documentElement.classList.toggle("portrait", port);
  }
  function fit() {
    checkOrient();
    readSafe();
    var vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var s = Math.min(vw / W, vh / H);
    var dw = Math.round(W * s), dh = Math.round(H * s);
    stage.style.width = dw + "px";
    stage.style.height = dh + "px";
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  }
  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  window.addEventListener("orientationchange", function () { setTimeout(fit, 80); });

  function unlockAudio() {
    if (audioOk) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      audioOk = true;
    } catch (e) {}
  }
  function beep(freq, dur, type, vol, slide) {
    if (!ac || !audioOk) return;
    try {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), ac.currentTime + dur);
      g.gain.value = vol || 0.05;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
    } catch (e) {}
  }
  function noise(dur, vol) {
    if (!ac || !audioOk) return;
    try {
      var n = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
      var d = n.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = n; g.gain.value = vol || 0.06;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      s.connect(g); g.connect(ac.destination); s.start();
    } catch (e) {}
  }
  function burst(x, y, n, cols, spd, life) {
    n = Math.round(n * (skull("cowbell") ? 2.2 : 1));
    spd *= boomScale();
    for (var i = 0; i < n; i++) {
      var p = particles.get();
      var a = rnd(0, Math.PI * 2);
      p.x = x; p.y = y; p.vx = Math.cos(a) * rnd(40, spd); p.vy = Math.sin(a) * rnd(40, spd);
      p.life = p.max = rnd(life * 0.5, life); p.r = rnd(2, 5); p.color = cols[i % cols.length]; p.g = 280; p.fr = 0.96; p.stream = 0;
    }
  }
  function confetti(x, y) {
    var cols = ["#fb7185", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#fff"];
    for (var i = 0; i < 36; i++) {
      var p = particles.get();
      p.x = x + rnd(-10, 10); p.y = y + rnd(-10, 10);
      p.vx = rnd(-220, 220); p.vy = rnd(-380, -40);
      p.life = p.max = rnd(0.7, 1.3); p.r = rnd(3, 7);
      p.color = cols[i % cols.length]; p.g = 420; p.fr = 0.98; p.stream = 1;
    }
  }
  function puff(x, y, n, cols) {
    var c = cols || ["#6b5a48", "#3a3228", "#8a7a68"];
    for (var i = 0; i < n; i++) {
      var p = particles.get();
      p.x = x + rnd(-8, 8); p.y = y + rnd(-4, 4);
      p.vx = rnd(-28, 28); p.vy = rnd(-50, -8);
      p.life = p.max = rnd(0.28, 0.7); p.r = rnd(5, 13); p.color = c[i % c.length]; p.g = -40; p.fr = 0.97; p.stream = 0;
    }
  }
  function toast(msg, t) { banner = msg; bannerT = t || 2.2; }
  function sayCortana(msg, t) { cortana = msg; cortanaT = t || 2.8; }

  function punch(stop, flash, shakeAmt, tint) {
    if (input.settings.reducedMotion) { hitFlash = Math.max(hitFlash, (flash || 0) * 0.3); return; }
    hitStop = Math.max(hitStop, stop || 0);
    hitFlash = Math.max(hitFlash, flash || 0);
    if (shakeAmt) shake = Math.max(shake, shakeAmt * boomScale());
    if (tint != null) hitTint = tint;
  }

  function syncJohnsonRef() {
    johnson = null;
    for (var i = 0; i < marines.length; i++) if (marines[i].kind === "johnson") { johnson = marines[i]; break; }
  }
  function extractMarine(m, showToast) {
    var idx = marines.indexOf(m);
    if (idx < 0) return;
    var cols = m.kind === "heavy" ? ["#fbbf24", "#fff", "#86efac"] : ["#5eead4", "#60a5fa", "#fff"];
    burst(m.x + m.w / 2, m.y + m.h / 2, 18, cols, 260, 0.45);
    marines.splice(idx, 1);
    syncJohnsonRef();
    if (showToast !== false && state === "play") {
      toast(m.kind === "johnson" ? "JOHNSON EXTRACTED" : (m.kind === "heavy" ? "HEAVY DOWN" : "MARINE DOWN"), 1.8);
    }
  }
  function spawnMarine(kind, x, y) {
    var def = D.MARINES[kind] || D.MARINES.female;
    if (kind === "johnson") {
      for (var i = 0; i < marines.length; i++) {
        if (marines[i].kind === "johnson") {
          marines[i].hp = marines[i].maxHp; marines[i].inv = 0.7; syncJohnsonRef();
          toast("SERGEANT JOHNSON INBOUND", 2.2); return marines[i];
        }
      }
    }
    var m = { kind: kind, x: x, y: y, w: def.w, h: def.h, vx: rnd(-30, 40), vy: 90, face: 1, onG: false, hp: def.hp, maxHp: def.hp, cool: 0.2, inv: 0.7, muzzle: 0, aim: 0 };
    marines.push(m); syncJohnsonRef();
    toast(kind === "johnson" ? "SERGEANT JOHNSON INBOUND" : (kind === "heavy" ? "HEAVY MARINE DROPPED" : "MARINE DROPPED"), 1.6);
    return m;
  }
  function hurtMarine(m, dmg) {
    if (!m || m.inv > 0) return;
    m.hp -= dmg; m.inv = 0.16;
    burst(m.x + m.w / 2, m.y + 42, 6, [D.MARINES[m.kind].color, "#fff", "#f0b429"], 150, 0.28);
    if (m.hp <= 0) extractMarine(m, true);
  }
  function marineShoot(m, target) {
    if (!m || !target) return;
    var def = D.MARINES[m.kind] || D.MARINES.female;
    var ox = m.x + m.w / 2 + m.face * (m.kind === "heavy" ? 70 : 58);
    var oy = m.y + (m.kind === "heavy" ? 38 : 43);
    var tx = target.x + target.w / 2, ty = target.y + target.h * 0.42;
    var dx = tx - ox, dy = ty - oy, len = Math.hypot(dx, dy) || 1;
    var b = bullets.get();
    var rocket = def.shot === "rocket";
    var spd = rocket ? 520 : 920;
    b.x = ox; b.y = oy; b.vx = dx / len * spd; b.vy = dy / len * spd;
    b.r = rocket ? 7 : 4; b.life = rocket ? 1.15 : 0.85; b.dmg = def.dmg;
    b.friendly = 1; b.homing = 0; b.kind = rocket ? "austin" : "johnson"; b.color = rocket ? "#fbbf24" : def.color; b.splash = rocket ? 70 : 0;
    m.aim = Math.atan2(dy, dx); m.face = dx >= 0 ? 1 : -1; m.muzzle = rocket ? 0.14 : 0.08; m.cool = def.rate;
    if (rocket) { beep(90, 0.08, "sawtooth", 0.04, 40); noise(0.05, 0.04); }
    else beep(360, 0.035, "square", 0.025, 180);
  }
  function updateMarines(dt) {
    for (var i = marines.length - 1; i >= 0; i--) {
      var j = marines[i], def = D.MARINES[j.kind] || D.MARINES.female;
      if (j.inv > 0) j.inv -= dt;
      if (j.cool > 0) j.cool -= dt;
      if (j.muzzle > 0) j.muzzle -= dt;
      var target = null, best = 1e9;
      for (var n = 0; n < enemies.length; n++) {
        var e = enemies[n];
        var d = Math.hypot(e.x + e.w / 2 - (j.x + j.w / 2), e.y + e.h / 2 - (j.y + j.h / 2));
        if (d < best) { best = d; target = e; }
      }
      var slot = (i % 3) - 1;
      var followX = clamp(player.x - player.face * (78 + i * 54) + slot * 18, 40, worldW - j.w - 40);
      var fd = followX - j.x;
      if (Math.abs(fd) > 34) j.vx += Math.sign(fd) * 950 * dt;
      else j.vx *= Math.max(0, 1 - 8 * dt);
      j.vx = clamp(j.vx, -def.spd, def.spd);
      if (target && best < 760) {
        j.face = target.x + target.w / 2 >= j.x + j.w / 2 ? 1 : -1;
        if (j.cool <= 0 && j.y > -20) marineShoot(j, target);
      } else if (Math.abs(fd) > 8) j.face = fd >= 0 ? 1 : -1;
      j.vy += 1500 * dt; j.x += j.vx * dt; j.y += j.vy * dt;
      collideActor(j);
      j.x = clamp(j.x, Math.max(40, camX + 8), worldW - j.w - 40);
    }
    syncJohnsonRef();
  }
  function callPelican(kinds, wx) {
    if (!kinds || !kinds.length) return;
    var hoverX = clamp(wx != null ? wx : player.x + 240, camX + 180, worldW - 200);
    pelican = { phase: "inbound", t: 0, x: camX - 340, y: 36, hoverX: hoverX, hoverY: 188, bay: 0, kinds: kinds.slice(), dropped: 0, dropT: 0 };
    toast("PELICAN INBOUND", 1.8);
    beep(140, 0.12, "sawtooth", 0.05, 80);
  }
  function updatePelican(dt) {
    if (!pelican) return;
    var p = pelican;
    p.t += dt;
    if (p.phase === "inbound") {
      var dx = p.hoverX - p.x, dy = p.hoverY - p.y, L = Math.hypot(dx, dy) || 1;
      p.x += (dx / L) * 520 * dt; p.y += (dy / L) * 210 * dt;
      if (Math.hypot(p.hoverX - p.x, p.hoverY - p.y) < 28) { p.phase = "hover"; p.t = 0; }
    } else if (p.phase === "hover") {
      p.y = p.hoverY + Math.sin(p.t * 3.2) * 7; p.bay = Math.min(1, p.t / 0.35);
      if (Math.random() < 0.35) puff(p.x + 12, GROUND - 2, 1, ["#6a5a48", "#3a3228"]);
      if (p.t > 0.55) { p.phase = "drop"; p.t = 0; p.dropT = 0; }
    } else if (p.phase === "drop") {
      p.y = p.hoverY + Math.sin(p.t * 2.6) * 5; p.bay = 1; p.dropT -= dt;
      if (p.dropped < p.kinds.length && p.dropT <= 0) {
        spawnMarine(p.kinds[p.dropped], p.x + rnd(-8, 28), p.y + 42);
        burst(p.x + 16, p.y + 48, 8, ["#cbb892", "#fff", "#5eead4"], 90, 0.28);
        p.dropped += 1; p.dropT = 0.26;
      }
      if (p.dropped >= p.kinds.length && p.t > 0.85) { p.phase = "depart"; p.t = 0; }
    } else {
      p.x += 560 * dt; p.y -= 190 * dt; p.bay = Math.max(0, 1 - p.t * 2.2);
      if (p.x > camX + W + 420 || p.y < -160) pelican = null;
    }
  }

  function wepIndex(id) {
    for (var i = 0; i < WEPS.length; i++) if (WEPS[i].id === id) return i;
    return 0;
  }
  function unlockWep(id, swap) {
    player.owned[id] = true;
    var i = wepIndex(id);
    player.ammo[i].mag = WEPS[i].mag;
    player.ammo[i].reserve = Math.max(player.ammo[i].reserve, Math.round(WEPS[i].reserve * 0.5));
    if (swap !== false) setWep(i);
    toast(WEPS[i].name + " READY", 1.8);
  }
  function setWep(i) {
    if (i < 0 || i >= WEPS.length) return;
    var w = WEPS[i];
    if (w.secret && !store.gun) { toast("LOCKED — find the A crate", 1.6); return; }
    if (!player.owned[w.id] && !w.start) { toast("NOT FOUND YET", 1.2); return; }
    player.wep = i;
  }
  function cycleWep() {
    for (var n = 1; n <= WEPS.length; n++) {
      var i = (player.wep + n) % WEPS.length;
      var w = WEPS[i];
      if (w.secret && !store.gun) continue;
      if (player.owned[w.id] || w.start) { setWep(i); return; }
    }
  }
  function syncSuitUI() {
    document.querySelectorAll(".suit").forEach(function (b) {
      b.classList.toggle("on", b.dataset.suit === player.suit);
      if (b.dataset.suit === "austin") b.classList.toggle("lock", !store.suit);
    });
  }
  function unlockGun() {
    if (store.gun) { player.owned.austin = true; setWep(wepIndex("austin")); return; }
    store.gun = true; lsSet("sf_austinGun", "1"); player.owned.austin = true; setWep(wepIndex("austin"));
    toast("AUSTIN'S GUN UNLOCKED", 2.6);
    beep(220, 0.08, "square", 0.07, 440);
  }
  function unlockSuit() {
    if (store.suit) return;
    store.suit = true; lsSet("sf_austinSuit", "1"); player.suit = "austin"; syncSuitUI();
    if (austinSuitBtn) austinSuitBtn.classList.remove("lock");
    toast("AUSTIN SUIT UNLOCKED", 2.6);
    beep(262, 0.1, "triangle", 0.07, 392);
  }

  function applyLevelLayout(L) {
    worldW = L.world;
    plats = [{ x: 0, y: GROUND, w: worldW, h: 120 }];
    for (var i = 0; i < L.plats.length; i++) plats.push({ x: L.plats[i].x, y: L.plats[i].y, w: L.plats[i].w, h: L.plats[i].h });
    spawnMarks = [];
    for (i = 0; i < L.spawns.length; i++) spawnMarks.push({ type: L.spawns[i].type, x: L.spawns[i].x, done: false });
    crate = L.crate ? { x: L.crate.x, y: L.crate.y, w: 44, h: 44, hp: 30, live: true } : null;
    pads = [];
    var list = L.datapads || [];
    for (i = 0; i < list.length; i++) pads.push({ x: list[i].x, y: list[i].y, w: 28, h: 18, id: list[i].id, got: false });
    wepDrops = [];
    var pk = L.pickups || [];
    for (i = 0; i < pk.length; i++) wepDrops.push({ x: pk[i].x, y: pk[i].y, w: 30, h: 18, wep: pk[i].wep, got: false });
  }

  function startLevel(n, fromCheck) {
    levelIdx = n;
    var L = currentLevel();
    applyLevelLayout(L);
    waveAlive = L.spawns.length;
    pendingLevel = -1; pendingBoss = 0; crestSpawned = false; midDropped = false;
    pelican = null; marines.length = 0; johnson = null;
    enemies.length = 0; pickups.length = 0; bullets.killAll();
    if (!fromCheck) {
      player.x = 180; player.y = GROUND - player.h; player.vx = 0; player.vy = 0;
      player.face = 1; player.onG = true; player.aim = 0;
      camX = 0; camLock = 0;
      if (!skull("iron")) checkpoint = { x: 180, cam: 0, hp: player.hp, sh: player.sh };
    }
    toast(L.name, 2.0);
    pendingPelican = (L.startDrop || []).slice();
    pelicanAt = performance.now() / 1000 + 0.45;
    beep(196, 0.12, "sawtooth", 0.05, 392);
  }

  function resetRun() {
    player.hp = player.maxHp; player.sh = player.maxSh; player.lastHit = -99;
    player.wep = 0; player.cool = 0; player.heat = 0; player.over = false;
    player.inv = 0; player.face = 1; player.onG = true; player.aim = 0; player.muzzle = 0;
    player.owned = emptyOwned(); player.ammo = emptyAmmo();
    if (store.suit && player.suit === "olive") player.suit = "austin";
    score = 0; won = false; pendingWin = 0; pendingBoss = 0; pendingLevel = -1;
    crestSpawned = false; shieldChime = false; beams.length = 0;
    camX = 0; camLock = 0; shake = 0; hitStop = 0; hitFlash = 0;
    jumpHeld = false; jumpWas = false; jumpBuf = 0; coyote = 0; thrusterUsed = false;
    nades = diff().nades; cook = 0; cooking = false; checkpoint = null;
    bullets.killAll(); particles.killAll(); enemies.length = 0; pickups.length = 0;
    marines.length = 0; johnson = null; pelican = null;
    syncSuitUI();
    startLevel(0);
  }

  function saveCheckpoint() {
    if (skull("iron")) return;
    checkpoint = { x: player.x, cam: camX, hp: player.hp, sh: player.sh, wep: player.wep };
    toast("CHECKPOINT", 1.1);
  }
  function maybeCheckpoint() {
    var L = currentLevel();
    var marks = L.checkpoints || [];
    if (skull("iron") || !marks.length) return;
    if (diff().id === "legendary") return;
    if (diff().id === "heroic" && marks.length) {
      if (!player._heroCheck && player.x > marks[0]) { player._heroCheck = true; saveCheckpoint(); }
      return;
    }
    for (var i = 0; i < marks.length; i++) {
      var key = "_ck" + i;
      if (!player[key] && player.x > marks[i]) { player[key] = true; saveCheckpoint(); }
    }
  }

  function marksLeft() {
    var n = 0;
    for (var i = 0; i < spawnMarks.length; i++) if (!spawnMarks[i].done) n++;
    return n;
  }
  function levelCleared() {
    var L = currentLevel();
    if (L.boss) return false;
    if (enemies.length) return false;
    if (marksLeft()) return false;
    if (pelican) return false;
    return player.x > worldW - 420;
  }
  function maybeAdvanceLevel() {
    if (pendingLevel >= 0 || pendingWin || pendingBoss || state !== "play") return;
    if (!levelCleared()) return;
    score += 500;
    pendingLevel = 0;
    nextLevelAt = performance.now() / 1000 + 0.9;
    toast("SECTOR CLEAR", 1.2);
    beep(330, 0.1, "square", 0.05, 520);
  }

  function spawnEnemy(spec) {
    var def = D.ENEMIES[spec.type] || D.ENEMIES.ember;
    var hpMul = diff().hp * (skull("mythic") ? 2.2 : 1);
    var e = { type: spec.type, x: spec.x, vx: 0, vy: 0, face: -1, cool: rnd(0.3, 1.2), t: rnd(0, 10), hit: 0, kbx: 0, kby: 0, needles: 0 };
    e.w = def.w; e.h = def.h; e.hp = def.hp * hpMul; e.maxHp = e.hp; e.spd = def.spd; e.range = def.range; e.score = def.score;
    e.shotDmg = def.dmg * diff().dmg * (skull("mythic") ? 1.8 : 1);
    e.touchDmg = def.touch * diff().dmg * (skull("mythic") ? 1.8 : 1);
    if (def.fly) { e.y = 240 + rnd(0, 160); e.baseY = e.y; }
    else e.y = GROUND - e.h;
    enemies.push(e);
  }

  function playerDown() {
    input.setLive(false);
    noise(0.25, 0.1);
    burst(player.x + 26, player.y + 40, 40, ["#f0b429", "#6a9a3e", "#fff", "#7cf0ff"], 360, 0.7);
    if (skull("iron") || !checkpoint) {
      state = "dead";
      return;
    }
    state = "dead";
  }
  function reviveAtCheckpoint() {
    player.x = checkpoint.x; player.y = GROUND - player.h; player.vx = 0; player.vy = 0;
    player.hp = Math.max(40, checkpoint.hp); player.sh = player.maxSh * 0.45;
    player.inv = 1.2; camX = checkpoint.cam; camLock = checkpoint.cam;
    state = "play"; input.setLive(true);
    toast("SHIELDS RESETTING", 1.4);
    sayCortana("Stay up, Chief.", 2.2);
  }
  function restartLevel() {
    player.hp = player.maxHp; player.sh = player.maxSh; player.inv = 0.8;
    startLevel(levelIdx);
    state = "play"; input.setLive(true);
    toast("IRON — LEVEL RESET", 1.6);
  }

  function hurtPlayer(dmg) {
    if (player.inv > 0) return;
    dmg *= diff().taken;
    player.lastHit = performance.now() / 1000;
    player.inv = 0.4; shieldChime = false;
    shake = Math.max(shake, 9 * boomScale());
    punch(0.04, 0.2, 0, 0);
    if (player.sh > 0) {
      var spill = dmg - player.sh;
      player.sh = Math.max(0, player.sh - dmg);
      beep(880, 0.05, "square", 0.05, 220);
      if (spill > 0) { player.hp = Math.max(0, player.hp - spill); beep(140, 0.08, "sawtooth", 0.06, 70); }
    } else {
      player.hp = Math.max(0, player.hp - dmg);
      beep(140, 0.1, "sawtooth", 0.07, 70);
    }
    burst(player.x + player.w / 2, player.y + 30, 8, ["#7cf0ff", "#fff", "#f0b429"], 220, 0.35);
    if (player.hp <= 0) playerDown();
  }

  function killEnemy(e, i) {
    var idx = (i >= 0 && enemies[i] === e) ? i : enemies.indexOf(e);
    if (idx < 0) return;
    score += e.score; waveAlive--;
    var bossKill = e.type === "vorrak";
    if (skull("birthday")) {
      confetti(e.x + e.w / 2, e.y + e.h / 2);
      punch(0.02, 0.08, 4, 1);
    } else {
      var cols = bossKill ? ["#f6e2a0", "#7cf0ff", "#c084fc", "#fff"] : e.type === "reaver" ? ["#c084fc", "#7cf0ff", "#fff"] : e.type === "stinger" ? ["#5eead4", "#fff", "#f0b429"] : ["#fb923c", "#fde68a", "#fff"];
      burst(e.x + e.w / 2, e.y + e.h / 2, bossKill ? 52 : 22, cols, bossKill ? 420 : 300, bossKill ? 0.85 : 0.55);
      punch(bossKill ? 0.08 : 0.034, bossKill ? 0.22 : 0.1, bossKill ? 10 : 5, 1);
    }
    noise(bossKill ? 0.22 : 0.12, bossKill ? 0.1 : 0.07);
    if (Math.random() < 0.22) pickups.push({ x: e.x + 8, y: e.y, w: 22, h: 22, vy: -140, kind: "ammo" });
    enemies.splice(idx, 1);
    if (bossKill) {
      pendingWin = 1; winAt = performance.now() / 1000 + 1.7;
      toast("TARTARUS DOWN", 2.2); shake = Math.max(shake, 22); beep(98, 0.2, "sawtooth", 0.08, 40);
    } else maybeAdvanceLevel();
  }

  function splashAt(x, y, r, dmg, friendly) {
    punch(0.05, 0.14, 12, 1);
    burst(x, y, 28, ["#fb923c", "#fde68a", "#fff"], 380, 0.55);
    if (friendly) {
      for (var i = enemies.length - 1; i >= 0; i--) {
        var e = enemies[i];
        if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r) {
          if (hurtEnemy(e, dmg * (1 - Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) / r * 0.4))) killEnemy(e, i);
        }
      }
    } else {
      if (Math.hypot(player.x + player.w / 2 - x, player.y + player.h / 2 - y) < r) hurtPlayer(dmg);
      for (var mi = 0; mi < marines.length; mi++) {
        var m = marines[mi];
        if (Math.hypot(m.x + m.w / 2 - x, m.y + m.h / 2 - y) < r) hurtMarine(m, dmg * 0.6);
      }
    }
  }

  function hurtEnemy(e, dmg, ix, iy, dirx, diry) {
    var nx, ny;
    if (dirx != null && diry != null && (dirx || diry)) {
      var L = Math.hypot(dirx, diry) || 1; nx = dirx / L; ny = diry / L;
    } else {
      var cx = e.x + e.w / 2, cy = e.y + e.h / 2;
      var px = ix == null ? player.x + player.w / 2 : ix;
      var py = iy == null ? player.y + player.h / 2 : iy;
      nx = cx - px; ny = cy - py; L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    }
    var force = e.type === "vorrak" ? 70 : (e.type === "reaver" || e.type === "carrier" ? 240 : 300);
    var scale = 0.55 + Math.min(1.1, dmg / 36);
    e.kbx = (e.kbx || 0) + nx * force * scale;
    e.kby = (e.kby || 0) + ny * force * 0.32 * scale;
    if (e.type !== "stinger" && e.type !== "vorrak") e.vy -= 36 + Math.min(90, dmg * 0.7);
    e.hit = e.type === "vorrak" ? 0.15 : 0.18;
    if (dmg >= 50) punch(0.05, 0.13, 8, 1);
    else if (dmg >= 18) punch(0.026, 0.08, 4, 1);
    else punch(0.014, 0.055, 2, 1);
    if (e.type === "vorrak" && e.shield > 0) {
      e.shield = Math.max(0, e.shield - dmg);
      if (e.shield <= 0) {
        e.phase = "stagger"; e.phaseT = 1.55; e.atk = ""; e.atkT = 0;
        toast("CREST SHATTERED", 1.8); shake = Math.max(shake, 14);
        punch(0.07, 0.18, 14, 1);
        burst(e.x + e.w / 2, e.y + 50, 28, ["#f6e2a0", "#7cf0ff", "#fff"], 340, 0.55);
      }
      return false;
    }
    var mul = (e.type === "vorrak" && e.phase === "exposed") ? 1.35 : 1;
    e.hp -= dmg * mul;
    return e.hp <= 0;
  }

  function spawnCrestlord() {
    crestSpawned = true; pendingBoss = 0;
    var roomR = worldW - 160 - player.x;
    var x = roomR > 400 ? player.x + 400 : Math.max(80, player.x - 420);
    var hpMul = diff().hp * (skull("mythic") ? 1.8 : 1);
    enemies.push({
      type: "vorrak", x: x, y: GROUND - 140, w: 88, h: 140, vx: 0, vy: 0, face: player.x < x ? -1 : 1,
      hp: 300 * hpMul, maxHp: 300 * hpMul, shield: 160 * hpMul, maxShield: 160 * hpMul,
      phase: "shield", phaseT: 0, atk: "", atkT: 0, slamX: x, cool: 1.4, t: 0, hit: 0, kbx: 0, kby: 0, spd: 72, range: 360, score: 2500, needles: 0,
      shotDmg: 14 * diff().dmg, touchDmg: 20 * diff().dmg
    });
    waveAlive += 1; toast("TARTARUS", 2.1); shake = Math.max(shake, 12); beep(110, 0.18, "sawtooth", 0.07, 55);
  }
  function finishWin() {
    pendingWin = 0; won = true; state = "win"; input.setLive(false);
    if (score > store.best) { store.best = score; lsSet("sf_best", String(score)); }
    toast("SILENT SPIRE", 3); sayCortana(D.WIN.cortana, 4);
  }
  function bossBolts(e) {
    var tx = huntX(e), ty = huntY(e);
    var ox = e.x + e.w / 2, oy = e.y + 52;
    var base = Math.atan2(ty - oy, tx - ox);
    for (var i = -1; i <= 1; i++) {
      var b = bullets.get(), ang = base + i * 0.2;
      b.x = ox; b.y = oy; b.vx = Math.cos(ang) * 300; b.vy = Math.sin(ang) * 300;
      b.r = 7; b.life = 2.3; b.dmg = e.shotDmg || 14; b.friendly = 0; b.homing = 0; b.kind = "enemy"; b.color = "#e8b43a"; b.splash = 0;
    }
  }
  function bossShock(e, dir) {
    var b = bullets.get();
    b.x = e.x + e.w / 2; b.y = GROUND - 12; b.vx = dir * 400; b.vy = 0;
    b.r = 12; b.life = 1.35; b.dmg = 18 * diff().dmg; b.friendly = 0; b.homing = 0; b.kind = "shock"; b.color = "#f6e2a0"; b.splash = 0;
  }
  function huntTarget() {
    if (skull("camo") && marines.length) return marines[0];
    return player;
  }
  function huntX() { var t = huntTarget(); return t.x + t.w / 2; }
  function huntY() { var t = huntTarget(); return t.y + t.h * 0.4; }

  function updateVorrak(e, dt, dx) {
    var adx = Math.abs(dx);
    if (e.phase === "stagger") {
      e.phaseT -= dt; e.vx = 0; e.vy += 1500 * dt; e.x += e.vx * dt; e.y += e.vy * dt; collideActor(e);
      if (e.phaseT <= 0) { e.phase = "exposed"; e.phaseT = 4.5; }
      return;
    }
    if (e.phase === "exposed") {
      e.phaseT -= dt;
      if (e.phaseT <= 0) { e.phase = "shield"; e.shield = Math.floor(e.maxShield * 0.88); toast("CREST REFORMED", 1.2); }
    }
    e.cool -= dt;
    if (e.atk === "lance") {
      e.atkT -= dt; e.vx = 0;
      if (e.atkT <= 0) {
        var y0 = e.y + 48, x0 = e.x + e.w / 2, x1 = x0 + e.face * 980;
        beams.push({ x0: x0, y0: y0, x1: x1, y1: y0, life: 0.28, max: 0.28, color: "#ffe08a", wide: 1.6 });
        var py = player.y + player.h * 0.45, px = player.x + player.w / 2;
        var onLine = Math.abs(py - y0) < 40;
        var inBeam = e.face > 0 ? (px > x0 && px < x1) : (px < x0 && px > x1);
        if (onLine && inBeam && !skull("camo")) hurtPlayer(24);
        shake = Math.max(shake, 12); punch(0.045, 0.12, 0, 0); e.atk = ""; e.cool = 1.35;
      }
    } else if (e.atk === "slam") {
      e.atkT -= dt; e.vx = 0;
      if (e.atkT <= 0) { e.vy = -620; e.vx = clamp((e.slamX - (e.x + e.w / 2)) / 0.83, -400, 400); e.atk = "slamair"; e.slamArmed = 0; }
    } else if (e.atk !== "slamair") {
      if (adx > e.range) e.vx = e.face * e.spd;
      else if (adx < 180) e.vx = -e.face * e.spd * 0.55;
      else e.vx = Math.sin(e.t * 1.6) * e.spd * 0.35;
      if (e.cool <= 0) {
        if (adx < 170) { e.atk = "slam"; e.atkT = 0.80; e.slamX = huntX(); }
        else if (Math.random() < 0.5) { e.atk = "lance"; e.atkT = 0.95; }
        else { bossBolts(e); e.cool = 1.15; }
      }
    }
    e.vy += 1500 * dt; e.x += e.vx * dt; e.y += e.vy * dt; collideActor(e);
    e.x = clamp(e.x, 40, worldW - 120);
    if (e.atk === "slamair") { if (!e.onG) e.slamArmed = 1; }
    if (e.atk === "slamair" && e.onG && e.slamArmed) {
      shake = Math.max(shake, 18); punch(0.05, 0.14, 0, 0);
      burst(e.x + e.w / 2, GROUND - 4, 28, ["#f6e2a0", "#c9a24a", "#fff"], 300, 0.48);
      bossShock(e, -1); bossShock(e, 1);
      if (Math.abs((player.x + player.w / 2) - (e.x + e.w / 2)) < 110 && !skull("camo")) hurtPlayer(22);
      e.atk = ""; e.cool = 1.5;
    }
  }

  function wepReach(w) {
    if (!w) return 52;
    if (w.id === "sniper") return 82;
    if (w.id === "austin") return 72;
    if (w.id === "shotgun") return 50;
    if (w.id === "rocket") return 64;
    if (w.id === "sword") return 70;
    if (w.id === "plasma") return 58;
    return 62;
  }
  function muzzleOf(p) {
    var a = p.aim || 0, w = WEPS[p.wep], reach = wepReach(w);
    return { x: p.x + p.w / 2 + Math.cos(a) * reach, y: p.y + p.h * 0.46 + Math.sin(a) * (reach * 0.52) };
  }
  function segHitAABB(x0, y0, x1, y1, rx, ry, rw, rh) {
    var dx = x1 - x0, dy = y1 - y0, t0 = 0, t1 = 1;
    function clip(p, q) {
      if (Math.abs(p) < 1e-8) return q >= 0;
      var t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
      return true;
    }
    if (!clip(-dx, x0 - rx) || !clip(dx, rx + rw - x0) || !clip(-dy, y0 - ry) || !clip(dy, ry + rh - y0)) return null;
    if (t0 < 0 || t0 > 1) return null;
    return { t: t0, x: x0 + dx * t0, y: y0 + dy * t0 };
  }

  function takeAmmo(w) {
    if (w.kind === "plasma" || w.kind === "austin") return true;
    if (w.kind === "sword") {
      if (player.ammo[player.wep].mag <= 0) { toast("SWORD DRY", 1); return false; }
      player.ammo[player.wep].mag = Math.max(0, player.ammo[player.wep].mag - 8);
      return true;
    }
    var a = player.ammo[player.wep];
    if (a.mag <= 0) {
      if (a.reserve > 0) {
        var need = w.mag - a.mag;
        var take = Math.min(need, a.reserve);
        a.mag += take; a.reserve -= take;
      }
      if (a.mag <= 0) { toast("NO AMMO", 0.9); return false; }
    }
    a.mag -= 1;
    if (a.mag <= 0 && a.reserve > 0) {
      var fill = Math.min(w.mag, a.reserve);
      a.mag = fill; a.reserve -= fill;
    }
    return true;
  }

  function fireWeapon() {
    var w = WEPS[player.wep];
    if (player.cool > 0) return;
    if (w.kind === "sword") { doMelee(true); return; }
    if (w.kind === "plasma") {
      if (player.over) return;
      player.heat += 11;
      if (player.heat >= 100) { player.over = true; toast("PLASMA OVERHEAT", 1.2); beep(90, 0.2, "sawtooth", 0.06, 40); }
    } else if (!takeAmmo(w)) return;
    player.cool = w.rate / 1000;
    player.muzzle = w.kind === "sniper" ? 0.14 : w.kind === "austin" || w.kind === "rocket" ? 0.12 : w.count > 1 ? 0.09 : 0.06;
    var aim = player.aim, muz = muzzleOf(player), ox = muz.x, oy = muz.y;
    var kick = w.kind === "austin" || w.kind === "rocket" ? 90 : w.kind === "sniper" ? 46 : (w.kind === "proj" && w.count > 1) ? 54 : 10;
    player.vx -= Math.cos(aim) * kick; player.vy -= Math.sin(aim) * kick * 0.35;
    if (w.kind === "austin" || w.kind === "rocket") shake = Math.max(shake, 16 * boomScale());
    else if (w.kind === "sniper") shake = Math.max(shake, 6);
    else if (w.count > 1) shake = Math.max(shake, 5);
    burst(ox, oy, w.kind === "sniper" ? 10 : 5, ["#fff7d0", "#ffb056", "#fff", w.color], w.kind === "austin" ? 200 : 130, 0.14);

    if (w.kind === "sniper") {
      var x0 = ox, y0 = oy, x1 = ox + Math.cos(aim) * 1700, y1 = oy + Math.sin(aim) * 1700;
      var hitX = x1, hitY = y1, pierced = 0, bestT = 1, hits = [];
      for (var i = 0; i < enemies.length; i++) {
        var h = segHitAABB(x0, y0, x1, y1, enemies[i].x, enemies[i].y, enemies[i].w, enemies[i].h);
        if (h) hits.push({ t: h.t, x: h.x, y: h.y, e: enemies[i], i: i });
      }
      hits.sort(function (a, b) { return a.t - b.t; });
      for (var n = 0; n < hits.length; n++) {
        hitX = hits[n].x; hitY = hits[n].y; bestT = hits[n].t;
        var dead = hurtEnemy(hits[n].e, w.dmg);
        burst(hits[n].x, hits[n].y, 12, [w.color, "#fff", "#ffb020"], 240, 0.32);
        if (dead) killEnemy(hits[n].e, hits[n].i);
        pierced++; if (pierced >= 2) break;
      }
      if (crate && crate.live) {
        var ch = segHitAABB(x0, y0, x1, y1, crate.x, crate.y, crate.w, crate.h);
        if (ch && ch.t <= bestT + 0.02) { crate.hp -= w.dmg; if (pierced === 0) { hitX = ch.x; hitY = ch.y; } }
      }
      beams.push({ x0: x0, y0: y0, x1: hitX, y1: hitY, life: 0.16, max: 0.16, color: w.color });
      beep(740, 0.08, "square", 0.06, 180); return;
    }

    for (i = 0; i < Math.max(1, w.count); i++) {
      var b = bullets.get();
      var ang = aim + rnd(-w.spread, w.spread);
      b.x = ox; b.y = oy + rnd(-1.5, 1.5);
      b.vx = Math.cos(ang) * w.speed; b.vy = Math.sin(ang) * w.speed;
      b.r = w.r; b.life = w.life; b.dmg = w.dmg; b.friendly = 1;
      b.color = w.color; b.kind = w.kind;
      b.homing = w.kind === "plasma" || w.kind === "needle" ? 340 : 0;
      b.splash = w.kind === "rocket" ? 110 : 0;
    }
    if (w.count > 1) burst(ox, oy, 7, [w.color, "#fff4c0"], 90, 0.18);
    if (w.kind === "austin" || w.kind === "rocket") { beep(90, 0.16, "sawtooth", 0.09, 40); noise(0.08, 0.06); }
    else if (w.kind === "plasma") beep(520, 0.05, "sine", 0.05, 240);
    else if (w.kind === "needle") beep(680, 0.04, "sine", 0.04, 420);
    else if (w.count > 1) { noise(0.06, 0.07); beep(160, 0.05, "square", 0.04, 80); }
    else beep(420, 0.035, "square", 0.04, 200);
  }

  function doMelee(fromSword) {
    if (meleeLock > 0) return;
    meleeLock = fromSword ? 0.38 : 0.32;
    player.muzzle = 0.1;
    var reach = fromSword ? 96 : 62;
    var ang = player.aim, ox = player.x + player.w / 2, oy = player.y + player.h * 0.45;
    var hit = false;
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      var cx = e.x + e.w / 2, cy = e.y + e.h * 0.45;
      var dx = cx - ox, dy = cy - oy;
      if (Math.hypot(dx, dy) < reach + e.w * 0.3) {
        var toward = Math.cos(ang) * dx + Math.sin(ang) * dy;
        if (toward > -10) {
          var dmg = fromSword ? WEPS[wepIndex("sword")].dmg : 22;
          if (fromSword) takeAmmo(WEPS[wepIndex("sword")]);
          if (hurtEnemy(e, dmg, ox, oy, dx, dy)) killEnemy(e, i);
          hit = true;
        }
      }
    }
    if (crate && crate.live && Math.hypot(crate.x + 22 - ox, crate.y + 22 - oy) < reach) { crate.hp -= 20; hit = true; }
    if (hit) {
      if (skull("blackeye")) {
        player.sh = Math.min(player.maxSh, player.sh + player.maxSh * 0.55);
        toast("SHIELDS — BLACK EYE", 0.9);
      }
      punch(0.03, 0.1, 6, 1); beep(180, 0.07, "sawtooth", 0.06, 70);
    } else beep(140, 0.04, "square", 0.03, 80);
    burst(ox + Math.cos(ang) * 40, oy + Math.sin(ang) * 24, 8, fromSword ? ["#86efac", "#fff"] : ["#fde68a", "#fff"], 140, 0.2);
  }

  function throwNade() {
    if (nades <= 0) { toast("NO GRENADES", 1); cooking = false; cook = 0; return; }
    nades -= 1;
    var cooked = cook; cooking = false; cook = 0;
    var aim = player.aim, muz = muzzleOf(player);
    var b = bullets.get();
    b.x = muz.x; b.y = muz.y;
    b.vx = Math.cos(aim) * (420 + (1 - cooked) * 80); b.vy = Math.sin(aim) * 360 - 80;
    b.r = 8; b.life = Math.max(0.12, 2.2 - cooked * 2.2); b.dmg = 48;
    b.friendly = 1; b.homing = 0; b.kind = "nade"; b.color = "#86efac"; b.splash = 130;
    beep(90, 0.08, "square", 0.05, 40);
  }

  function enemyShoot(e) {
    var t = huntTarget();
    var b = bullets.get();
    var tx = t.x + t.w / 2, ty = t.y + t.h * 0.38;
    var dx = tx - (e.x + e.w / 2), dy = ty - (e.y + e.h / 2);
    var len = Math.hypot(dx, dy) || 1;
    var spd = e.type === "reaver" ? 340 : 280;
    b.x = e.x + e.w / 2; b.y = e.y + e.h * 0.4;
    b.vx = dx / len * spd; b.vy = dy / len * spd;
    b.r = e.type === "reaver" ? 6 : 5; b.life = 2.2; b.dmg = e.shotDmg || 10;
    b.friendly = 0; b.homing = 0; b.kind = "enemy"; b.splash = 0;
    b.color = e.type === "stinger" ? "#5eead4" : e.type === "reaver" ? "#c084fc" : "#fb923c";
  }

  function tryJump() {
    if (player.onG || coyote > 0) {
      player.vy = player.crouched ? -620 : -780; player.onG = false; coyote = 0; jumpBuf = 0; jumpHeld = true; thrusterUsed = false;
      beep(300, 0.06, "square", 0.04, 180);
      burst(player.x + player.w / 2, player.y + player.h, 7, ["#cbb892", "#6a4a28", "#f3e2b0"], 110, 0.22);
    } else if (!thrusterUsed) {
      tryThruster();
    } else jumpBuf = 0.14;
  }
  function tryThruster() {
    if (player.onG) { tryJump(); return; }
    if (thrusterUsed) return;
    thrusterUsed = true;
    player.vy = Math.min(player.vy, -640);
    burst(player.x + player.w / 2, player.y + player.h, 12, ["#7cf0ff", "#fff", "#2ee0d0"], 180, 0.28);
    beep(420, 0.07, "sine", 0.05, 220);
    toast("THRUSTER", 0.6);
  }

  function inWell(a) {
    var L = currentLevel();
    var wells = L.wells || [];
    for (var i = 0; i < wells.length; i++) {
      var w = wells[i];
      if (a.x + a.w * 0.5 > w.x && a.x < w.x + w.w && a.y + a.h > w.y && a.y < w.y + w.h) return w;
    }
    return null;
  }

  function nearestEnemy(px, py) {
    var best = null, bd = 1e9;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      var d = Math.hypot(e.x + e.w / 2 - px, e.y + e.h * 0.4 - py);
      if (d < bd) { bd = d; best = e; }
    }
    return best ? { e: best, d: bd } : null;
  }

  function update(dt) {
    if (state === "cine") {
      cineWait += dt;
      return;
    }
    if (state !== "play") return;
    var t = performance.now() / 1000;
    if (bannerT > 0) bannerT -= dt;
    if (cortanaT > 0) cortanaT -= dt;
    if (meleeLock > 0) meleeLock -= dt;

    var evs = input.drain();
    for (var ei = 0; ei < evs.length; ei++) {
      var ev = evs[ei];
      if (ev.type === "jump") tryJump();
      else if (ev.type === "thruster") tryThruster();
      else if (ev.type === "melee") doMelee(WEPS[player.wep].kind === "sword");
      else if (ev.type === "nadeStart") { if (nades > 0) { cooking = true; cook = 0; } }
      else if (ev.type === "nadeThrow") throwNade();
      else if (ev.type === "wepCycle") cycleWep();
      else if (ev.type === "wepRadial") showRadial();
      else if (ev.type === "wep") setWep(ev.data);
      else if (ev.type === "interact") readPad();
      else if (ev.type === "pause") togglePause();
      else if (ev.type === "key") onKonami(ev.data);
      else if (ev.type === "fire" && state === "play") fireWeapon();
    }

    var mv = input.poll();
    if (cooking) {
      cook += dt;
      if (cook >= 2.15) { splashAt(player.x + player.w / 2, player.y + 40, 120, 40, true); hurtPlayer(28); cooking = false; cook = 0; nades = Math.max(0, nades - 1); toast("COOKED OFF", 1.2); }
    }
    player.crouched = !!mv.crouch && player.onG;
    player.h = player.crouched ? 78 : 104;

    if (mv.am > 0.18) {
      player.aim = Math.atan2(mv.ay, mv.ax);
      if (Math.abs(mv.ax) > 0.08) player.face = mv.ax > 0 ? 1 : -1;
    } else if (mv.mag > 0.18 && Math.abs(mv.mx) > 0.12) {
      player.face = mv.mx > 0 ? 1 : -1;
      if (mv.am < 0.12) player.aim = mv.mx > 0 ? 0 : Math.PI;
    }
    if (input.settings.aimAssist && mv.am > 0.2) {
      var ne = nearestEnemy(player.x + player.w / 2, player.y + 40);
      if (ne && ne.d < 420) {
        var want = Math.atan2(ne.e.y + ne.e.h * 0.4 - (player.y + 40), ne.e.x + ne.e.w / 2 - (player.x + player.w / 2));
        var da = Math.atan2(Math.sin(want - player.aim), Math.cos(want - player.aim));
        if (Math.abs(da) < 0.55) player.aim += da * 0.28;
      }
    }

    var wantJump = mv.jump;
    if (wantJump && !jumpWas) tryJump();
    if (!wantJump && jumpHeld) { jumpHeld = false; if (player.vy < -260) player.vy *= 0.42; }
    jumpWas = !!wantJump;
    if (jumpBuf > 0) { jumpBuf -= dt; if (player.onG) tryJump(); }

    var accel = player.onG ? (player.crouched ? 1800 : 2800) : 2300;
    var maxS = player.crouched ? 140 : 310, fric = 2100;
    if (Math.abs(mv.mx) > 0.12) {
      var tx = mv.mx * maxS;
      player.vx += clamp(tx - player.vx, -accel * dt, accel * dt);
    } else {
      var s = Math.sign(player.vx);
      player.vx -= s * fric * dt;
      if (Math.sign(player.vx) !== s) player.vx = 0;
    }
    player.vx = clamp(player.vx, -maxS, maxS);
    var rising = player.vy < 0 && jumpHeld;
    player.vy += (rising ? 1180 : 1760) * dt;
    var well = inWell(player);
    if (well) player.vy -= 2200 * dt;
    if (player.vy > 980) player.vy = 980;

    var wasG = player.onG;
    player.x += player.vx * dt; player.y += player.vy * dt; player.onG = false;
    collideActor(player);
    if (player.onG) {
      coyote = 0.13; thrusterUsed = false;
      if (!wasG) { burst(player.x + player.w / 2, player.y + player.h, 5, ["#6a4a28", "#cbb892"], 70, 0.18); puff(player.x + player.w / 2, player.y + player.h, 3); }
      else if (Math.abs(player.vx) > 80 && Math.random() < 0.18) puff(player.x + player.w / 2, player.y + player.h, 1, ["#5a4a38", "#3a2c20"]);
    } else coyote -= dt;
    player.x = clamp(player.x, Math.max(40, camX + 28), worldW - 80);
    player.y = clamp(player.y, 8, GROUND - 20);

    if (player.inv > 0) player.inv -= dt;
    if (player.cool > 0) player.cool -= dt;
    if (player.muzzle > 0) player.muzzle -= dt;
    if (player.over) { player.heat -= 55 * dt; if (player.heat <= 0) { player.heat = 0; player.over = false; } }
    else player.heat = Math.max(0, player.heat - 28 * dt);
    if (!skull("blackeye") && t - player.lastHit > 2.1) {
      var before = player.sh;
      player.sh = Math.min(player.maxSh, player.sh + 38 * dt);
      if (!shieldChime && before < player.maxSh && player.sh >= player.maxSh) {
        shieldChime = true; toast("SHIELDS UP", 1.0); beep(520, 0.08, "sine", 0.05, 780);
      }
    }
    if (mv.fire) fireWeapon();

    if (pendingLevel >= 0 && t >= nextLevelAt) {
      if (state === "play") beginOutro();
      else pendingLevel = -1;
    }
    if (pendingBoss && t >= nextBossAt) { if (state === "play") spawnCrestlord(); else pendingBoss = 0; }
    if (pendingWin && t >= winAt) { if (state === "play") finishWin(); else pendingWin = 0; }
    if (pendingPelican && t >= pelicanAt) { callPelican(pendingPelican, player.x + 260); pendingPelican = null; }
    var Lnow = currentLevel();
    if (!midDropped && Lnow.midDropAt && player.x > Lnow.midDropAt && Lnow.midDrop && Lnow.midDrop.length) {
      midDropped = true; callPelican(Lnow.midDrop, player.x + 280);
    }
    if (Lnow.boss && !crestSpawned && !pendingBoss && player.x > Lnow.bossAt) {
      pendingBoss = 1; nextBossAt = t + 0.8; toast("TARTARUS COMES", 1.7);
    }
    for (var i = 0; i < spawnMarks.length; i++) {
      var sm = spawnMarks[i];
      if (!sm.done && sm.x < camX + W + 140) { spawnEnemy(sm); sm.done = true; }
    }

    updatePelican(dt);
    updateMarines(dt);
    maybeAdvanceLevel();
    maybeCheckpoint();

    nearbyPad = null;
    for (i = 0; i < pads.length; i++) {
      if (!pads[i].got && aabb(player, { x: pads[i].x - 20, y: pads[i].y - 20, w: 68, h: 50 })) nearbyPad = pads[i];
    }
    input.setInteract(!!nearbyPad);

    for (i = wepDrops.length - 1; i >= 0; i--) {
      var wd = wepDrops[i];
      if (!wd.got && aabb(player, wd)) { wd.got = true; unlockWep(wd.wep, true); }
    }

    for (i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      e.t += dt; if (e.hit > 0) e.hit -= dt;
      if (e.kbx) e.kbx *= Math.max(0, 1 - 6.5 * dt);
      if (e.kby) e.kby *= Math.max(0, 1 - 6.5 * dt);
      var tgt = huntTarget();
      var pcx = tgt.x + tgt.w / 2, ecx = e.x + e.w / 2, dx = pcx - ecx;
      var locking = e.type === "vorrak" && (e.atk === "lance" || e.atk === "slam" || e.atk === "slamair");
      if (!locking) e.face = dx >= 0 ? 1 : -1;
      if (e.type === "vorrak") {
        updateVorrak(e, dt, player.x + player.w / 2 - ecx);
        e.x += (e.kbx || 0) * dt; e.x = clamp(e.x, 40, worldW - 120);
        if (aabb(e, player) && !skull("camo")) hurtPlayer(e.touchDmg || 20);
      } else if (e.type === "stinger") {
        e.baseY += (e.kby || 0) * dt; e.y = e.baseY + Math.sin(e.t * 2.6) * 36;
        e.x += Math.sin(e.t * 1.1) * 70 * dt + Math.sign(dx) * 34 * dt + (e.kbx || 0) * dt;
        e.cool -= dt;
        if (e.cool <= 0 && Math.abs(dx) < e.range) { enemyShoot(e); e.cool = 1.15; }
      } else {
        var adx = Math.abs(dx);
        if (e.hit > 0.06) e.vx = e.kbx || 0;
        else if (adx > e.range) e.vx = e.face * e.spd;
        else if (adx < e.range * 0.55) e.vx = -e.face * e.spd * 0.6;
        else e.vx = (e.type === "reaver" ? Math.sin(e.t * 3) * e.spd : 0);
        e.vy += 1500 * dt;
        e.x += e.vx * dt + ((e.hit > 0.06) ? 0 : (e.kbx || 0) * dt);
        e.y += e.vy * dt; collideActor(e);
        if (e.type === "reaver" && e.onG && tgt.y + 20 < e.y && Math.random() < 0.01) e.vy = -520;
        e.cool -= dt;
        if (e.cool <= 0 && adx < e.range + 40) { enemyShoot(e); e.cool = e.type === "reaver" ? 0.85 : 1.45; }
      }
      if (e.type !== "vorrak" && aabb(e, player) && !skull("camo")) hurtPlayer(e.touchDmg || 12);
      for (var mi = 0; mi < marines.length; mi++) {
        if (aabb(e, marines[mi])) hurtMarine(marines[mi], e.type === "vorrak" ? 20 : e.touchDmg || 8);
      }
    }

    bullets.each(function (b) {
      if (b.kind === "nade") b.vy += 900 * dt;
      if (b.homing && b.friendly) {
        var best = null, bd = 1e9;
        for (var i = 0; i < enemies.length; i++) {
          var d = Math.hypot(enemies[i].x - b.x, enemies[i].y - b.y);
          if (d < bd && d < 280) { bd = d; best = enemies[i]; }
        }
        if (best) {
          var hdx = best.x + best.w / 2 - b.x, hdy = best.y + best.h / 2 - b.y, hL = Math.hypot(hdx, hdy) || 1;
          b.vx += (hdx / hL) * b.homing * dt; b.vy += (hdy / hL) * b.homing * dt;
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.kind === "austin") burst(b.x, b.y, 1, ["#ffb020", "#fff3c4"], 20, 0.15);
      if (b.life <= 0) {
        if (b.splash) splashAt(b.x, b.y, b.splash, b.dmg, !!b.friendly);
        return false;
      }
      if (b.y > H + 40 || b.x < camX - 80 || b.x > camX + W + 80) {
        if (b.splash) splashAt(b.x, b.y, b.splash, b.dmg, !!b.friendly);
        return false;
      }
      if (b.friendly) {
        for (i = enemies.length - 1; i >= 0; i--) {
          var e = enemies[i];
          var nx = clamp(b.x, e.x, e.x + e.w), ny = clamp(b.y, e.y, e.y + e.h);
          if ((b.x - nx) * (b.x - nx) + (b.y - ny) * (b.y - ny) <= b.r * b.r) {
            if (b.kind === "needle") {
              e.needles = (e.needles || 0) + 1;
              burst(b.x, b.y, 4, ["#f9a8d4", "#fff"], 80, 0.18);
              if (e.needles >= 7) {
                e.needles = 0;
                splashAt(e.x + e.w / 2, e.y + e.h / 2, 90, 70, true);
                toast("SUPERCOMBINE", 0.8);
              } else if (hurtEnemy(e, b.dmg)) killEnemy(e, i);
              return false;
            }
            if (b.splash) { splashAt(b.x, b.y, b.splash, b.dmg, true); return false; }
            var dead = hurtEnemy(e, b.dmg);
            burst(b.x, b.y, 6, [b.color, "#fff"], 160, 0.25);
            if (dead) killEnemy(e, i);
            return false;
          }
        }
        if (crate && crate.live && b.x + b.r > crate.x && b.x - b.r < crate.x + crate.w && b.y + b.r > crate.y && b.y - b.r < crate.y + crate.h) {
          crate.hp -= b.dmg; burst(b.x, b.y, 5, ["#f6e2a0", "#fff"], 120, 0.2); return false;
        }
      } else {
        var hitM = null;
        for (var mi = 0; mi < marines.length; mi++) {
          var m = marines[mi];
          if (b.x + b.r > m.x && b.x - b.r < m.x + m.w && b.y + b.r > m.y && b.y - b.r < m.y + m.h) { hitM = m; break; }
        }
        if (hitM) { hurtMarine(hitM, b.dmg); return false; }
        if (!skull("camo") && b.x + b.r > player.x && b.x - b.r < player.x + player.w && b.y + b.r > player.y && b.y - b.r < player.y + player.h) {
          hurtPlayer(b.dmg); return false;
        }
      }
      return true;
    });

    if (crate && crate.live && crate.hp <= 0) {
      crate.live = false;
      pickups.push({ x: crate.x + 8, y: crate.y, w: 28, h: 28, vy: -180, kind: "gun" });
      burst(crate.x + 22, crate.y + 22, 24, ["#f6e2a0", "#ffb020", "#fff"], 280, 0.5);
      toast("CRATE OPEN — GRAB IT", 2);
    }
    for (i = pickups.length - 1; i >= 0; i--) {
      var p = pickups[i];
      p.vy += 900 * dt; p.y += p.vy * dt;
      if (p.y + p.h > GROUND) { p.y = GROUND - p.h; p.vy = 0; }
      if (aabb(p, player)) {
        if (p.kind === "gun") { unlockGun(); unlockSuit(); }
        else if (p.kind === "ammo") {
          var a = player.ammo[player.wep], w = WEPS[player.wep];
          a.reserve = Math.min(w.reserve * 2, a.reserve + Math.max(4, Math.round(w.mag * 0.8)));
          toast("AMMO", 0.8);
        }
        pickups.splice(i, 1);
      }
    }

    particles.each(function (p) {
      p.vy += p.g * dt; p.vx *= p.fr; p.vy *= p.fr;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      return p.life > 0;
    });
    for (i = beams.length - 1; i >= 0; i--) { beams[i].life -= dt; if (beams[i].life <= 0) beams.splice(i, 1); }
    var follow = player.x - 360 + player.vx * 0.12;
    if (follow > camLock) camLock = follow;
    camX += (camLock - camX) * Math.min(1, 8 * dt);
    camX = clamp(camX, 0, Math.max(0, worldW - W));
    if (shake > 0) shake -= (input.settings.reducedMotion ? 64 : 32) * dt;
  }

  function collideActor(a) {
    a.onG = false;
    for (var i = 0; i < plats.length; i++) {
      var p = plats[i];
      if (!aabb(a, p)) continue;
      var overlapX = Math.min(a.x + a.w, p.x + p.w) - Math.max(a.x, p.x);
      var overlapY = Math.min(a.y + a.h, p.y + p.h) - Math.max(a.y, p.y);
      if (overlapY < overlapX) {
        if (a.vy >= 0 && a.y + a.h - overlapY <= p.y + 8) { a.y = p.y - a.h; a.vy = 0; a.onG = true; }
        else if (a.vy < 0) { a.y = p.y + p.h; a.vy = 0; }
      } else {
        if (a.x + a.w / 2 < p.x + p.w / 2) a.x = p.x - a.w;
        else a.x = p.x + p.w;
        a.vx = 0;
      }
    }
  }

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  function themeFill(theme) {
    if (theme === "covenant") return "#14080e";
    if (theme === "well") return "#061018";
    if (theme === "flood") return "#0c1408";
    if (theme === "spire") return "#0a0814";
    if (theme === "climax") return "#0c0810";
    if (theme === "forge") return "#140806";
    return "#18080a";
  }

  function drawLevelProps(theme) {
    var step = theme === "covenant" ? 280 : theme === "flood" ? 260 : 300;
    for (var x = 40; x < worldW; x += step) {
      ctx.save(); ctx.translate(x, GROUND);
      if (theme === "covenant") {
        ctx.fillStyle = "rgba(80,20,40,0.5)"; ctx.fillRect(0, -200, 30, 200); ctx.fillRect(80, -140, 18, 140);
        ctx.fillStyle = "rgba(232,180,58,0.16)"; ctx.fillRect(4, -196, 22, 16);
      } else if (theme === "well") {
        ctx.fillStyle = "rgba(20,80,110,0.32)"; ctx.beginPath(); ctx.arc(40, -80, 50, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(94,234,212,0.22)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(140, 0, 70, Math.PI, 0); ctx.stroke();
      } else if (theme === "flood") {
        ctx.fillStyle = "rgba(60,90,20,0.42)"; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(36, -150); ctx.lineTo(70, 0); ctx.fill();
        ctx.fillStyle = "rgba(80,40,20,0.28)"; ctx.beginPath(); ctx.ellipse(120, -30, 40, 28, 0, 0, Math.PI * 2); ctx.fill();
      } else if (theme === "spire") {
        ctx.fillStyle = "rgba(80,70,120,0.36)"; ctx.fillRect(8, -180, 20, 180); ctx.fillRect(50, -110, 14, 110);
        ctx.fillStyle = "rgba(196,181,253,0.16)"; ctx.fillRect(4, -188, 28, 8);
      } else if (theme === "climax") {
        ctx.fillStyle = "rgba(40,20,60,0.38)"; ctx.fillRect(8, -140, 24, 140);
        ctx.fillStyle = "rgba(232,180,58,0.16)"; ctx.fillRect(0, -148, 40, 8);
      } else {
        ctx.fillStyle = "rgba(60,16,16,0.4)"; ctx.fillRect(0, -130, 48, 130); ctx.fillRect(70, -80, 30, 80);
        ctx.fillStyle = "rgba(180,40,30,0.2)"; ctx.beginPath(); ctx.moveTo(-10, -130); ctx.lineTo(24, -168); ctx.lineTo(58, -130); ctx.fill();
      }
      ctx.restore();
    }
  }

  function paintAustinSuit(src) {
    var c = document.createElement("canvas");
    c.width = src.naturalWidth; c.height = src.naturalHeight;
    var g = c.getContext("2d"); g.drawImage(src, 0, 0);
    var w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 12) continue;
      var r = d[i], gv = d[i + 1], b = d[i + 2], mx = Math.max(r, gv, b), y = ((i / 4) / w) | 0, yn = y / h;
      if (mx > 170 && r > 140 && gv > 90 && gv > b * 0.7 && (r - b) > 20) { d[i] = 40; d[i + 1] = 230; d[i + 2] = 255; continue; }
      if (yn > 0.68 && mx > 40) { d[i] = Math.min(255, Math.round(r * 0.25 + 20)); d[i + 1] = Math.min(255, Math.round(gv * 0.45 + 150)); d[i + 2] = Math.min(255, Math.round(b * 0.45 + 155)); continue; }
      d[i] = Math.round(r * 0.28 + gv * 0.10 + 18); d[i + 1] = Math.round(gv * 0.32 + 28); d[i + 2] = Math.round(b * 0.38 + r * 0.12 + 62);
    }
    g.putImageData(img, 0, 0);
    g.fillStyle = "#3f6a28"; g.fillRect(w * 0.58, h * 0.18, w * 0.22, h * 0.12);
    g.fillStyle = "#f4efe6"; g.fillRect(w * 0.68, h * 0.19, w * 0.05, h * 0.10);
    g.fillStyle = "rgba(180,80,255,0.92)"; g.beginPath(); g.ellipse(w * 0.72, h * 0.16, w * 0.035, h * 0.045, 0, 0, Math.PI * 2); g.fill();
    return c;
  }
  function tintSpartan(suit) {
    if (suitSprites[suit]) return suitSprites[suit];
    if (suit === "austin" && austinSuitReady && austinSuitImg.naturalWidth) { suitSprites.austin = austinSuitImg; return austinSuitImg; }
    if (!spartanReady || !spartanImg.naturalWidth) return null;
    var src = spartanImg;
    if (suit === "olive") { suitSprites[suit] = src; return src; }
    if (suit === "austin") { suitSprites.austin = paintAustinSuit(src); return suitSprites.austin; }
    var c = document.createElement("canvas"); c.width = src.naturalWidth; c.height = src.naturalHeight;
    var g = c.getContext("2d"); g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-atop";
    g.fillStyle = suit === "steel" ? "rgba(88,118,148,0.46)" : "rgba(176,28,40,0.44)";
    g.fillRect(0, 0, c.width, c.height); suitSprites[suit] = c; return c;
  }
  function tintStinger() {
    if (stingerSpr) return stingerSpr;
    if (!emberReady || !emberImg.naturalWidth) return null;
    var c = document.createElement("canvas"); c.width = emberImg.naturalWidth; c.height = emberImg.naturalHeight;
    var g = c.getContext("2d"); g.drawImage(emberImg, 0, 0); g.globalCompositeOperation = "source-atop";
    g.fillStyle = "rgba(16,170,168,0.50)"; g.fillRect(0, 0, c.width, c.height); stingerSpr = c; return c;
  }
  function tintFlood() {
    if (floodSpr) return floodSpr;
    if (!emberReady || !emberImg.naturalWidth) return null;
    var c = document.createElement("canvas"); c.width = emberImg.naturalWidth; c.height = emberImg.naturalHeight;
    var g = c.getContext("2d"); g.drawImage(emberImg, 0, 0); g.globalCompositeOperation = "source-atop";
    g.fillStyle = "rgba(70,140,20,0.55)"; g.fillRect(0, 0, c.width, c.height); floodSpr = c; return c;
  }

  function drawHeldWeapon(p) {
    var w = WEPS[p.wep] || WEPS[0];
    var localAim = Math.atan2(Math.sin(p.aim || 0), (p.face || 1) * Math.cos(p.aim || 0));
    ctx.save(); ctx.translate(14, -78); ctx.rotate(localAim);
    ctx.fillStyle = "#1a1610"; ctx.beginPath(); ctx.ellipse(6, 3, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (w.id === "shotgun") {
      ctx.fillStyle = "#5a3a18"; rr(ctx, -10, -7, 28, 14, 3); ctx.fill();
      ctx.fillStyle = "#c9a24a"; rr(ctx, 14, -8, 36, 16, 3); ctx.fill();
      ctx.fillStyle = "#2a2218"; rr(ctx, 46, -6, 18, 12, 2); ctx.fill();
    } else if (w.id === "plasma") {
      ctx.fillStyle = "#16343a"; rr(ctx, -8, -6, 26, 12, 4); ctx.fill();
      ctx.fillStyle = "#7cf0ff"; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(28, 0, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = "#2ee0c0"; rr(ctx, 40, -4, 22, 8, 3); ctx.fill();
    } else if (w.id === "sniper") {
      ctx.fillStyle = "#3a3428"; rr(ctx, -16, -5, 24, 10, 2); ctx.fill();
      ctx.fillStyle = "#d8c48a"; rr(ctx, 6, -3, 78, 6, 2); ctx.fill();
      ctx.fillStyle = "#ffe9a0"; ctx.fillRect(82, -2, 8, 4);
    } else if (w.id === "austin") {
      ctx.fillStyle = "#8a5a10"; rr(ctx, -14, -10, 30, 20, 5); ctx.fill();
      ctx.fillStyle = "#ffb020"; ctx.beginPath(); ctx.arc(28, 0, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d4a017"; rr(ctx, 40, -6, 28, 12, 4); ctx.fill();
    } else if (w.id === "magnum") {
      ctx.fillStyle = "#3a3228"; rr(ctx, -8, -7, 22, 14, 3); ctx.fill();
      ctx.fillStyle = "#d4c48a"; rr(ctx, 12, -4, 28, 8, 2); ctx.fill();
      ctx.fillStyle = "#f4e4b0"; ctx.fillRect(38, -2, 6, 4);
    } else if (w.id === "needler") {
      ctx.fillStyle = "#4a1840"; rr(ctx, -8, -8, 24, 16, 6); ctx.fill();
      ctx.fillStyle = "#f9a8d4"; for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(16 + i * 8, -2, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (w.id === "rocket") {
      ctx.fillStyle = "#3f2a14"; rr(ctx, -16, -10, 36, 20, 4); ctx.fill();
      ctx.fillStyle = "#fb923c"; rr(ctx, 18, -7, 40, 14, 4); ctx.fill();
      ctx.fillStyle = "#1a1008"; ctx.fillRect(54, -4, 10, 8);
    } else if (w.id === "sword") {
      ctx.fillStyle = "#14532d"; rr(ctx, -10, -6, 18, 12, 3); ctx.fill();
      ctx.fillStyle = "#86efac"; rr(ctx, 6, -5, 70, 8, 3); ctx.fill();
      ctx.fillStyle = "#ecfdf5"; ctx.fillRect(70, -2, 10, 3);
    } else {
      ctx.fillStyle = "#4a5340"; rr(ctx, -12, -6, 30, 11, 3); ctx.fill();
      ctx.fillStyle = "#d8e6c8"; rr(ctx, 16, -4, 48, 7, 2); ctx.fill();
      ctx.fillStyle = "#2c2410"; ctx.fillRect(8, -9, 7, 16);
    }
    ctx.restore();
  }

  function drawSpartan(p) {
    var t = performance.now() / 1000;
    var moving = Math.hypot(p.vx, p.vy) > 22 && p.onG;
    var bob = moving ? Math.sin(t * 14) * 1.6 : 0;
    var cx = p.x + p.w / 2, feet = p.y + p.h + bob;
    ctx.save();
    ctx.fillStyle = p.onG ? "rgba(0,0,0,0.48)" : "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(cx + 10, p.y + p.h + 4, p.onG ? 28 : 20, p.onG ? 7 : 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(cx, feet); ctx.scale(p.face, 1);
    ctx.rotate(clamp((p.aim || 0) * p.face, -0.85, 0.85) * 0.22);
    if (skull("camo")) ctx.globalAlpha = 0.18 + Math.sin(t * 8) * 0.04;
    else if (p.inv > 0 && (t * 20 | 0) % 2 === 0) ctx.globalAlpha = 0.45;
    var spr = tintSpartan(p.suit || "olive"), dw = 92, dh = p.crouched ? 128 : 158;
    if (spr) ctx.drawImage(spr, -dw * 0.46, -dh, dw, dh);
    else {
      var c = SUITS[p.suit] || SUITS.olive;
      ctx.fillStyle = c.body; rr(ctx, -18, -74, 36, 48, 8); ctx.fill();
      ctx.fillStyle = c.visor; rr(ctx, -11, -86, 22, 10, 4); ctx.fill();
      ctx.fillStyle = "#f4efe6"; ctx.font = "bold 13px Impact, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("444", 0, -58);
    }
    drawHeldWeapon(p);
    if (p.muzzle > 0) {
      var mz = wepReach(WEPS[p.wep]) - 8;
      ctx.save(); ctx.translate(14, -78); ctx.rotate(Math.atan2(Math.sin(p.aim || 0), (p.face || 1) * Math.cos(p.aim || 0)));
      ctx.globalCompositeOperation = "lighter";
      var flash = ctx.createRadialGradient(mz, 0, 1, mz, 0, 28);
      flash.addColorStop(0, "rgba(255,255,230,0.95)"); flash.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = flash; ctx.beginPath(); ctx.arc(mz, 0, 28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore(); ctx.restore();
  }

  function marineSprite(j) {
    if (j.kind === "johnson" && johnsonReady && johnsonImg.naturalWidth) return johnsonImg;
    if (j.kind === "female" && marineFemaleReady && marineFemaleImg.naturalWidth) return marineFemaleImg;
    if (j.kind === "heavy" && marineHeavyReady && marineHeavyImg.naturalWidth) return marineHeavyImg;
    return null;
  }
  function drawMarine(j) {
    var t = performance.now() / 1000, def = D.MARINES[j.kind] || D.MARINES.female;
    var cx = j.x + j.w / 2, feet = j.y + j.h;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.42)"; ctx.beginPath(); ctx.ellipse(cx + 5, feet + 4, 27, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(cx, feet); ctx.scale(j.face, 1);
    if (j.inv > 0 && (t * 20 | 0) % 2 === 0) ctx.globalAlpha = 0.55;
    var dh = j.kind === "heavy" ? 168 : 154, spr = marineSprite(j);
    if (spr) { var dw = dh * spr.naturalWidth / spr.naturalHeight; ctx.drawImage(spr, -dw * 0.38, -dh, dw, dh); }
    else { ctx.fillStyle = "#3a4a2c"; rr(ctx, -16, -70, 32, 46, 7); ctx.fill(); ctx.fillStyle = def.color; ctx.fillRect(-12, -66, 4, 10); }
    ctx.restore();
    ctx.fillStyle = def.color; ctx.beginPath(); ctx.moveTo(cx, j.y - 24); ctx.lineTo(cx - 7, j.y - 34); ctx.lineTo(cx + 7, j.y - 34); ctx.closePath(); ctx.fill();
    ctx.textAlign = "center"; ctx.font = "bold 13px Impact, system-ui, sans-serif"; ctx.fillStyle = def.color; ctx.fillText(def.label, cx, j.y - 39);
    ctx.fillStyle = "rgba(8,24,26,0.75)"; rr(ctx, cx - 35, j.y - 19, 70, 5, 2); ctx.fill();
    ctx.fillStyle = def.color; rr(ctx, cx - 35, j.y - 19, 70 * Math.max(0, j.hp / j.maxHp), 5, 2); ctx.fill();
    ctx.restore();
  }
  function drawPelican() {
    if (!pelican) return;
    var p = pelican;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0," + (0.18 + p.bay * 0.12) + ")";
    ctx.beginPath(); ctx.ellipse(p.x + 16, GROUND + 2, 110, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(p.x, p.y);
    if (pelicanReady && pelicanImg.naturalWidth) ctx.drawImage(pelicanImg, -151, -82, 360, 142);
    else { ctx.fillStyle = "#3a4528"; rr(ctx, -90, -28, 200, 42, 8); ctx.fill(); }
    ctx.restore();
  }

  function drawVorrak(e) {
    var cx = e.x + e.w / 2;
    if (e.atk === "lance") {
      var y0 = e.y + 48, a = 0.22 + (1 - Math.max(0, e.atkT) / 0.88) * 0.6;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx + e.face * 980, y0); ctx.stroke(); ctx.restore();
    }
    if (e.shield > 0) {
      ctx.save(); ctx.globalAlpha = 0.2 + Math.sin(e.t * 6) * 0.08; ctx.strokeStyle = "#e8b43a"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, e.y + e.h * 0.48, 62, 86, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.translate(cx, e.y + e.h); ctx.scale(e.face, 1);
    if (e.hit > 0) ctx.globalAlpha = 0.5;
    if (vorrakReady && vorrakImg.naturalWidth) {
      ctx.save(); ctx.scale(-1, 1); ctx.drawImage(vorrakImg, -80, -208, 166, 208); ctx.restore();
    } else { ctx.fillStyle = "#5b21b6"; rr(ctx, -28, -118, 56, 72, 10); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = "#f3d27a"; ctx.font = "14px Impact, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("TARTARUS", cx, e.y - 18);
  }

  function enemySprite(e) {
    if (e.type === "ember") return (emberReady && emberImg.naturalWidth) ? emberImg : null;
    if (e.type === "reaver") return (reaverReady && reaverImg.naturalWidth) ? reaverImg : null;
    if (e.type === "stinger") return tintStinger();
    if (e.type === "flood" || e.type === "carrier") return tintFlood();
    return null;
  }
  function drawEnemy(e) {
    if (e.type === "vorrak") { drawVorrak(e); return; }
    var cx = e.x + e.w / 2;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.beginPath(); ctx.ellipse(cx + 6, e.y + e.h + 3, e.w * 0.42, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(cx, e.y + e.h); ctx.scale(e.face, 1);
    if (e.hit > 0) ctx.globalAlpha = 0.5;
    var spr = enemySprite(e);
    if (spr) {
      var dh = e.type === "reaver" || e.type === "carrier" ? 126 : e.type === "stinger" ? 52 : 70;
      var sw = spr.naturalWidth || spr.width, sh = spr.naturalHeight || spr.height, dw = dh * sw / sh;
      ctx.save(); ctx.scale(-1, 1); ctx.drawImage(spr, -dw * 0.48, -dh, dw, dh); ctx.restore();
    } else {
      ctx.fillStyle = e.type === "flood" || e.type === "carrier" ? "#4d7c0f" : e.type === "reaver" ? "#6d28d9" : "#c45a18";
      rr(ctx, -16, -40, 32, 36, 8); ctx.fill();
    }
    if (input.settings.colorblind) {
      ctx.strokeStyle = e.type === "flood" || e.type === "carrier" ? "#86efac" : e.type === "reaver" ? "#c084fc" : "#fb923c";
      ctx.lineWidth = 3; ctx.strokeRect(-e.w / 2 - 4, -e.h - 4, e.w + 8, e.h + 8);
    }
    ctx.restore();
  }

  function drawWorld() {
    var theme = currentLevel().theme;
    ctx.fillStyle = themeFill(theme);
    ctx.fillRect(0, 0, W, H);
    if (arenaReady && arenaImg.naturalWidth) {
      var iw = arenaImg.naturalWidth, ih = arenaImg.naturalHeight;
      var s = Math.max((W + 640) / iw, (H + 80) / ih);
      var dw = iw * s, dh = ih * s, ox = -camX * 0.20 - 80, oy = H - dh + 28;
      ctx.drawImage(arenaImg, ox, oy, dw, dh);
      ctx.drawImage(arenaImg, ox + dw * 0.92, oy, dw, dh);
    }
    var grade = ctx.createLinearGradient(0, 0, 0, H);
    if (theme === "covenant") { grade.addColorStop(0, "rgba(90,10,30,0.32)"); grade.addColorStop(1, "rgba(20,4,8,0.42)"); }
    else if (theme === "well") { grade.addColorStop(0, "rgba(10,40,70,0.30)"); grade.addColorStop(1, "rgba(6,20,28,0.40)"); }
    else if (theme === "flood") { grade.addColorStop(0, "rgba(30,50,8,0.30)"); grade.addColorStop(1, "rgba(10,16,4,0.44)"); }
    else if (theme === "spire") { grade.addColorStop(0, "rgba(40,24,80,0.32)"); grade.addColorStop(1, "rgba(8,6,16,0.42)"); }
    else if (theme === "climax") { grade.addColorStop(0, "rgba(20,8,28,0.34)"); grade.addColorStop(1, "rgba(18,10,4,0.44)"); }
    else { grade.addColorStop(0, "rgba(80,12,10,0.26)"); grade.addColorStop(1, "rgba(18,4,4,0.40)"); }
    ctx.fillStyle = grade; ctx.fillRect(0, 0, W, H);

    ctx.save(); ctx.translate(-camX, 0);
    drawLevelProps(theme);
    var wells = currentLevel().wells || [];
    for (var wi = 0; wi < wells.length; wi++) {
      var well = wells[wi];
      var wg = ctx.createLinearGradient(well.x, well.y, well.x, well.y + well.h);
      wg.addColorStop(0, "rgba(94,234,212,0.08)"); wg.addColorStop(1, "rgba(56,189,248,0.22)");
      ctx.fillStyle = wg; ctx.fillRect(well.x, well.y, well.w, well.h);
      ctx.strokeStyle = "rgba(125,211,252,0.35)"; ctx.strokeRect(well.x, well.y, well.w, well.h);
    }
    ctx.fillStyle = "rgba(6,4,3,0.42)"; ctx.fillRect(0, GROUND + 2, worldW, H - GROUND + 40);
    ctx.fillStyle = theme === "flood" ? "rgba(40,60,12,0.55)" : "rgba(28,18,10,0.55)";
    ctx.fillRect(0, GROUND - 4, worldW, 10);
    for (var i = 1; i < plats.length; i++) {
      var p = plats[i];
      ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h + 8, p.w * 0.48, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#4a453c"; rr(ctx, p.x, p.y, p.w, p.h, 5); ctx.fill();
      ctx.fillStyle = "rgba(255,200,120,0.28)"; ctx.fillRect(p.x + 2, p.y, p.w - 4, 3);
    }
    if (crate && crate.live) {
      var pulse = 0.5 + Math.sin(performance.now() / 180) * 0.5;
      ctx.fillStyle = "rgba(255,176,32," + (0.18 + pulse * 0.2) + ")";
      ctx.beginPath(); ctx.arc(crate.x + 22, crate.y + 22, 36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c9a24a"; rr(ctx, crate.x, crate.y, crate.w, crate.h, 6); ctx.fill();
      ctx.fillStyle = "#1a1008"; ctx.font = "bold 22px Impact, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("A", crate.x + 22, crate.y + 32);
    }
    for (i = 0; i < pads.length; i++) {
      if (pads[i].got) continue;
      ctx.fillStyle = "#7dd3fc"; rr(ctx, pads[i].x, pads[i].y, pads[i].w, pads[i].h, 3); ctx.fill();
      ctx.fillStyle = "#0c4a6e"; ctx.font = "bold 11px Impact, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("PAD", pads[i].x + 14, pads[i].y + 13);
    }
    for (i = 0; i < wepDrops.length; i++) {
      if (wepDrops[i].got) continue;
      ctx.fillStyle = "#e8b43a"; rr(ctx, wepDrops[i].x, wepDrops[i].y, 30, 18, 3); ctx.fill();
      ctx.fillStyle = "#1a1008"; ctx.font = "bold 10px Impact, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText((wepDrops[i].wep || "GUN").slice(0, 5).toUpperCase(), wepDrops[i].x + 15, wepDrops[i].y + 13);
    }
    for (i = 0; i < pickups.length; i++) {
      var pk = pickups[i];
      ctx.fillStyle = pk.kind === "ammo" ? "#86efac" : "#ffb020";
      ctx.beginPath(); ctx.arc(pk.x + 14, pk.y + 14, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1008"; ctx.font = "bold 12px Impact, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(pk.kind === "ammo" ? "+" : "A", pk.x + 14, pk.y + 18);
    }
    for (i = 0; i < enemies.length; i++) drawEnemy(enemies[i]);
    for (i = 0; i < marines.length; i++) drawMarine(marines[i]);
    drawSpartan(player);
    drawPelican();
    for (i = 0; i < beams.length; i++) {
      var bm = beams[i], a = Math.max(0, bm.life / bm.max);
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = bm.color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bm.x0, bm.y0); ctx.lineTo(bm.x1, bm.y1); ctx.stroke();
      ctx.restore();
    }
    bullets.each(function (b) {
      var ang = Math.atan2(b.vy, b.vx);
      if (b.kind === "shock") { ctx.fillStyle = b.color; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 1.7, b.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
      else if (b.kind === "austin" || b.kind === "rocket" || b.kind === "nade") {
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (b.kind === "plasma" || b.kind === "needle") {
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (b.friendly) {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang); ctx.fillStyle = b.color; ctx.fillRect(-24, -2, 28, 4); ctx.restore();
      } else { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
      return true;
    });
    particles.each(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      if (p.stream) { ctx.fillRect(p.x, p.y, p.r * 2.2, p.r * 0.7); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1; return true;
    });
    ctx.restore();
  }

  function drawHud() {
    var hx = hudPad.l, hy = hudPad.t, big = input.settings.largeText;
    ctx.save();
    ctx.fillStyle = "rgba(10,6,8,0.55)"; rr(ctx, hx, hy, 320, 78, 10); ctx.fill();
    ctx.fillStyle = "#8a1f1f"; rr(ctx, hx + 12, hy + 12, 292, 16, 4); ctx.fill();
    ctx.fillStyle = "#ef4444"; rr(ctx, hx + 12, hy + 12, 292 * (player.hp / player.maxHp), 16, 4); ctx.fill();
    ctx.fillStyle = "#134e4a"; rr(ctx, hx + 12, hy + 34, 292, 16, 4); ctx.fill();
    ctx.fillStyle = "#5eead4"; rr(ctx, hx + 12, hy + 34, 292 * (player.sh / player.maxSh), 16, 4); ctx.fill();
    ctx.fillStyle = "#f3e2b0"; ctx.font = "14px Impact, system-ui, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("HP", hx + 12, hy + 8); ctx.fillText("SHIELDS", hx + 12, hy + 30);
    ctx.font = (big ? "18px" : "16px") + " Impact, system-ui, sans-serif"; ctx.fillStyle = "#f3d27a";
    ctx.fillText("THE SPARTAN   ·   444", hx + 12, hy + 66);
    ctx.restore();

    var skullIds = Object.keys(skullOn).filter(function (k) { return skullOn[k]; });
    for (var si = 0; si < D.SKULLS.length; si++) {
      if (!skullOn[D.SKULLS[si].id]) continue;
      var sx = hx + 8 + si * 36;
      ctx.fillStyle = "rgba(10,6,8,0.55)"; rr(ctx, sx, hy + 84, 32, 28, 6); ctx.fill();
      ctx.font = "16px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(D.SKULLS[si].icon, sx + 16, hy + 104);
    }

    ctx.save(); ctx.textAlign = "right";
    var rx = W - hudPad.r - 120;
    ctx.fillStyle = "rgba(10,6,8,0.55)"; rr(ctx, W - hudPad.r - 348, hy, 240, 86, 10); ctx.fill();
    ctx.fillStyle = "#f3d27a"; ctx.font = (big ? "26px" : "22px") + " Impact, system-ui, sans-serif";
    ctx.fillText(crestSpawned ? "BOSS" : currentLevel().short, rx, hy + 26);
    ctx.fillStyle = "#f4efe4"; ctx.font = "18px Impact, system-ui, sans-serif"; ctx.fillText("SCORE  " + score, rx, hy + 50);
    var w = WEPS[player.wep], a = player.ammo[player.wep];
    var ammo = w.kind === "plasma" ? (player.over ? "OVER" : "HEAT " + (player.heat | 0)) : w.kind === "austin" ? "∞" : (a.mag + " / " + a.reserve);
    ctx.fillStyle = "#cbb892"; ctx.font = "14px Impact, system-ui, sans-serif";
    ctx.fillText(w.name + "  " + ammo, rx, hy + 70);
    ctx.fillStyle = "rgba(203,184,146,0.55)"; ctx.font = "12px system-ui, sans-serif"; ctx.fillText(VERSION + "   G " + nades, rx, hy + 86);
    ctx.restore();

    var boss = null;
    for (var i = 0; i < enemies.length; i++) if (enemies[i].type === "vorrak") boss = enemies[i];
    if (boss) {
      var bx = W / 2 - 220, by = hy;
      ctx.fillStyle = "rgba(10,6,8,0.55)"; rr(ctx, bx, by, 440, 52, 8); ctx.fill();
      ctx.fillStyle = "#f3d27a"; ctx.font = "16px Impact, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("TARTARUS  ·  " + (boss.shield > 0 ? "CREST UP" : "CORE OPEN"), W / 2, by + 16);
      ctx.fillStyle = "#3a2a10"; rr(ctx, bx + 12, by + 22, 416, 8, 3); ctx.fill();
      ctx.fillStyle = "#e8b43a"; rr(ctx, bx + 12, by + 22, 416 * Math.max(0, boss.shield / boss.maxShield), 8, 3); ctx.fill();
      ctx.fillStyle = "#3b0764"; rr(ctx, bx + 12, by + 34, 416, 10, 3); ctx.fill();
      ctx.fillStyle = "#c084fc"; rr(ctx, bx + 12, by + 34, 416 * Math.max(0, boss.hp / boss.maxHp), 10, 3); ctx.fill();
    }
    if (cooking) {
      ctx.fillStyle = "rgba(10,6,8,0.5)"; rr(ctx, W / 2 - 80, H - 120, 160, 12, 4); ctx.fill();
      ctx.fillStyle = cook > 1.6 ? "#ef4444" : "#fbbf24";
      rr(ctx, W / 2 - 80, H - 120, 160 * Math.min(1, cook / 2.15), 12, 4); ctx.fill();
    }
    if (bannerT > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, bannerT);
      ctx.fillStyle = "rgba(0,0,0,0.45)"; rr(ctx, W / 2 - 280, 120, 560, 64, 10); ctx.fill();
      ctx.fillStyle = "#ffe08a"; ctx.font = (big ? "42px" : "36px") + " Impact, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(banner, W / 2, 164); ctx.restore();
    }
    if (cortanaT > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, cortanaT);
      ctx.fillStyle = "rgba(40,10,60,0.62)"; rr(ctx, W / 2 - 300, 196, 600, 48, 10); ctx.fill();
      ctx.fillStyle = "#e9d5ff"; ctx.font = (big ? "20px" : "17px") + " system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("CORTANA  —  " + cortana, W / 2, 226); ctx.restore();
    }
  }

  function coverImage(img) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return false;
    var s = Math.max(W / iw, H / ih);
    ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    return true;
  }
  function drawCanvasHero() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a0818"); g.addColorStop(0.55, "#1a1040"); g.addColorStop(1, "#1a1008");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(0, 40); ctx.scale(2.15, 2.15);
    drawSpartan({ x: 70, y: 70, w: 60, h: 104, vx: 0, face: 1, onG: true, wep: 0, muzzle: 0, suit: "austin", inv: 0, aim: 0, crouched: false });
    ctx.restore();
  }
  function drawTitle() {
    var ok = titleReady && titleImg.naturalWidth > 0 && coverImage(titleImg);
    if (!ok) drawCanvasHero();
    var fade = ctx.createLinearGradient(W * 0.42, 0, W, 0);
    fade.addColorStop(0, "rgba(6,4,8,0)"); fade.addColorStop(1, "rgba(6,4,8,0.50)");
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
    var bot = ctx.createLinearGradient(0, H - 180, 0, H);
    bot.addColorStop(0, "rgba(6,4,8,0)"); bot.addColorStop(1, "rgba(6,4,8,0.74)");
    ctx.fillStyle = bot; ctx.fillRect(0, H - 180, W, 180);
    ctx.save(); ctx.textAlign = "right";
    ctx.fillStyle = "#c4b5fd"; ctx.font = "20px Impact, system-ui, sans-serif";
    ctx.fillText("AUSTIN-444", W - 56, 78);
    ctx.fillStyle = "#fff6e0"; ctx.font = "64px Impact, system-ui, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 18;
    ctx.fillText("SPARTAN", W - 56, 150);
    ctx.shadowBlur = 0; ctx.fillStyle = "#e8b43a"; ctx.font = "42px Impact, system-ui, sans-serif";
    ctx.fillText("SILENT SPIRE", W - 56, 202);
    ctx.fillStyle = "rgba(203,184,146,0.75)"; ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(VERSION, W - 56, 230);
    ctx.restore();
    var pulse = 0.65 + Math.sin(performance.now() / 280) * 0.35;
    ctx.save(); ctx.globalAlpha = pulse; ctx.textAlign = "center"; ctx.fillStyle = "#fff6e0";
    ctx.font = "42px Impact, system-ui, sans-serif"; ctx.fillText("TAP TO START", W / 2, H - 58); ctx.restore();
  }
  function drawCine() {
    drawWorld();
    ctx.fillStyle = "rgba(6,4,8,0.62)"; ctx.fillRect(0, 0, W, H);
    if (!cine) return;
    var line = cine.lines[cineLine] || cine.lines[cine.lines.length - 1];
    ctx.textAlign = "center";
    ctx.fillStyle = line.who === "CORTANA" ? "#e9d5ff" : "#e8b43a";
    ctx.font = "20px Impact, system-ui, sans-serif";
    ctx.fillText(line.who, W / 2, 300);
    ctx.fillStyle = "#fff6e0"; ctx.font = "28px system-ui, sans-serif";
    ctx.fillText(line.text, W / 2, 350);
    ctx.fillStyle = "#cbb892"; ctx.font = "18px Impact, system-ui, sans-serif";
    ctx.globalAlpha = 0.7 + Math.sin(performance.now() / 280) * 0.3;
    ctx.fillText("TAP TO CONTINUE", W / 2, 430);
    ctx.globalAlpha = 1;
  }
  function drawEnd(win) {
    ctx.fillStyle = "rgba(6,4,8,0.62)"; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.fillStyle = "#f3d27a"; ctx.font = "64px Impact, system-ui, sans-serif";
    ctx.fillText(win ? D.WIN.title : "DOWN", W / 2, 260);
    ctx.fillStyle = "#fff6e0"; ctx.font = "26px Impact, system-ui, sans-serif";
    ctx.fillText(win ? D.WIN.chief : "The Spartan will rise again.", W / 2, 314);
    if (win) {
      ctx.fillStyle = "#e9d5ff"; ctx.font = "20px system-ui, sans-serif"; ctx.fillText(D.WIN.cortana, W / 2, 354);
      ctx.fillStyle = "#cbb892"; ctx.font = "16px system-ui, sans-serif"; ctx.fillText(D.WIN.sub, W / 2, 384);
    }
    ctx.fillStyle = "#cbb892"; ctx.font = "20px Impact, system-ui, sans-serif";
    ctx.fillText("SCORE  " + score + "    BEST  " + store.best, W / 2, win ? 400 : 370);
    ctx.globalAlpha = 0.65 + Math.sin(performance.now() / 280) * 0.35;
    ctx.fillStyle = "#fff6e0"; ctx.font = "32px Impact, system-ui, sans-serif";
    ctx.fillText(win ? "TAP TO RESTART" : (skull("iron") || !checkpoint ? "TAP TO RESTART" : "TAP TO CHECKPOINT"), W / 2, win ? 460 : 430);
    ctx.globalAlpha = 1;
  }

  function frame(ts) {
    if (!last) last = ts;
    var dt = (ts - last) / 1000; last = ts;
    if (dt > 0.033) dt = 0.033;
    if (hitStop > 0) { hitStop -= dt; dt *= 0.15; }
    update(dt);
    var sx = (shake > 0 && !input.settings.reducedMotion) ? (Math.random() - 0.5) * shake : 0;
    var sy = (shake > 0 && !input.settings.reducedMotion) ? (Math.random() - 0.5) * shake : 0;
    ctx.save(); ctx.translate(sx, sy);
    if (state === "title") drawTitle();
    else if (state === "cine") drawCine();
    else {
      drawWorld(); ctx.restore(); ctx.save(); drawHud();
      if (state === "dead") drawEnd(false);
      if (state === "win") drawEnd(true);
    }
    ctx.restore();
    requestAnimationFrame(frame);
  }

  function goFullscreen() {
    var el = document.documentElement;
    var fn = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen;
    if (fn) { try { fn.call(el); } catch (e) {} }
  }
  function showBrief() {
    state = "brief";
    brief.classList.add("show");
    input.setLive(false);
    renderBrief();
  }
  function renderBrief() {
    var diffs = document.getElementById("diffs");
    diffs.innerHTML = "";
    D.DIFFS.forEach(function (d, i) {
      var b = document.createElement("button");
      b.className = "diff" + (i === diffIdx ? " on" : "");
      b.textContent = d.name;
      b.addEventListener("click", function () { diffIdx = i; renderBrief(); });
      diffs.appendChild(b);
    });
    var box = document.getElementById("skulls");
    box.innerHTML = "";
    var stub = document.getElementById("campaignStub");
    if (stub && D.CAMPAIGN) {
      stub.textContent = "Playable now: Crimson Approach. Coming next: Outer Ring, Gravity Well, Infection Vector, Spire’s Heart, Core Overload.";
    }
    D.SKULLS.forEach(function (s) {
      var b = document.createElement("button");
      b.className = "skull" + (skullOn[s.id] ? " on" : "");
      b.innerHTML = "<b>" + s.icon + "  " + s.name + "</b><span>" + s.short + "</span>";
      b.addEventListener("click", function () { skullOn[s.id] = !skullOn[s.id]; renderBrief(); });
      box.appendChild(b);
    });
  }
  function beginCine() {
    cineKind = "intro";
    cine = D.CINE.intro;
    cineLine = 0; cineWait = 0; levelIdx = 0;
    state = "cine"; input.setLive(false); brief.classList.remove("show"); panel.classList.remove("show");
  }
  function beginOutro() {
    pendingLevel = -1;
    cineKind = "outro";
    cine = D.CINE.outro;
    cineLine = 0; cineWait = 0;
    state = "cine"; input.setLive(false); panel.classList.remove("show");
  }
  function advanceCine() {
    if (!cine) return;
    if (cineLine + 1 < cine.lines.length) { cineLine += 1; return; }
    cine = null;
    if (cineKind === "outro") { finishWin(); return; }
    resetRunIfNeeded(0);
    startLevel(0);
    state = "play"; input.setLive(true);
    sayCortana("Pelican inbound. Don't make me look bad.", 2.6);
  }
  var runReady = false;
  function resetRunIfNeeded(n) {
    if (n === 0 || !runReady) { resetRun(); runReady = true; }
  }
  function startFromTitle() {
    unlockAudio(); goFullscreen();
    showBrief();
    beep(196, 0.08, "square", 0.05, 392);
  }
  function startMission() {
    unlockAudio(); goFullscreen();
    brief.classList.remove("show");
    runReady = false;
    beginCine();
  }
  function onDeadTap() {
    unlockAudio();
    if (skull("iron") || !checkpoint) { showBrief(); runReady = false; }
    else reviveAtCheckpoint();
  }
  function togglePause() {
    if (state === "play") { state = "pause"; panel.classList.add("show"); syncSuitUI(); syncSettingsUI(); }
    else if (state === "pause") { state = "play"; panel.classList.remove("show"); wepRadial.classList.remove("show"); }
  }
  function showRadial() {
    if (state !== "play" && state !== "pause") return;
    var html = "<div class='grid'>";
    for (var i = 0; i < WEPS.length; i++) {
      var w = WEPS[i], lock = (!player.owned[w.id] && !w.start) || (w.secret && !store.gun);
      html += "<button data-w='" + i + "' class='" + (lock ? "lock" : "") + "'>" + w.short + "</button>";
    }
    html += "</div>";
    wepRadial.innerHTML = html;
    wepRadial.classList.add("show");
  }
  function readPad() {
    if (!nearbyPad || nearbyPad.got) return;
    nearbyPad.got = true;
    var info = D.PADS[nearbyPad.id];
    if (info) { toast(info.title, 2.2); sayCortana(info.body, 3.4); }
    input.setInteract(false);
  }
  function onKonami(code) {
    if (code === "w" || code === "W") code = "ArrowUp";
    if (code === "s" || code === "S") code = "ArrowDown";
    if (code === "a" || code === "A") code = "ArrowLeft";
    if (code === "d" || code === "D") code = "ArrowRight";
    konami.push(code);
    if (konami.length > KONAMI.length) konami.shift();
    if (KONAMI.every(function (k, i) { return konami[i] === k; })) { unlockGun(); unlockSuit(); konami.length = 0; }
  }

  function syncSettingsUI() {
    var s = input.settings;
    var hand = document.getElementById("handBtn");
    if (hand) hand.textContent = s.handed === "left" ? "LEFT" : "RIGHT";
    var op = document.getElementById("opSlider"); if (op) op.value = s.opacity;
    var se = document.getElementById("sensSlider"); if (se) se.value = s.sensitivity;
    var aa = document.getElementById("aaCheck"); if (aa) aa.checked = s.aimAssist;
    var cb = document.getElementById("cbCheck"); if (cb) cb.checked = s.colorblind;
    var rm = document.getElementById("rmCheck"); if (rm) rm.checked = s.reducedMotion;
    var lt = document.getElementById("ltCheck"); if (lt) lt.checked = s.largeText;
  }

  canvas.addEventListener("mousedown", function (e) {
    if (state === "title") startFromTitle();
    else if (state === "cine") advanceCine();
    else if (state === "dead") onDeadTap();
    else if (state === "win") { showBrief(); runReady = false; }
    else if (state === "play") { input.fire = true; fireWeapon(); }
  });
  window.addEventListener("mouseup", function () { input.fire = false; });
  canvas.addEventListener("touchstart", function (e) {
    if (state === "title" || state === "cine" || state === "dead" || state === "win") {
      e.preventDefault();
      if (state === "title") startFromTitle();
      else if (state === "cine") advanceCine();
      else if (state === "dead") onDeadTap();
      else showBrief();
    }
  }, { passive: false });

  document.addEventListener("touchstart", unlockAudio, { capture: true, passive: true });
  document.addEventListener("pointerdown", unlockAudio, { capture: true });
  document.getElementById("dropBtn").addEventListener("click", startMission);
  document.getElementById("dropBtn").addEventListener("touchstart", function (e) { e.preventDefault(); startMission(); }, { passive: false });
  resumeBtn.addEventListener("click", function () { if (state === "pause") togglePause(); });
  resumeBtn.addEventListener("touchstart", function (e) { e.preventDefault(); if (state === "pause") togglePause(); }, { passive: false });
  document.getElementById("suits").addEventListener("click", function (e) {
    var b = e.target.closest(".suit"); if (!b) return;
    if (b.dataset.suit === "austin" && !store.suit) { toast("Crack the A crate", 2); return; }
    player.suit = b.dataset.suit; syncSuitUI();
  });
  document.getElementById("handBtn").addEventListener("click", function () {
    input.settings.handed = input.settings.handed === "left" ? "right" : "left";
    input.saveSettings(); syncSettingsUI();
  });
  function bindSet(id, key, parse) {
    var el = document.getElementById(id); if (!el) return;
    el.addEventListener("input", function () {
      input.settings[key] = parse ? parse(el) : (el.type === "checkbox" ? el.checked : parseFloat(el.value));
      input.saveSettings();
    });
  }
  bindSet("opSlider", "opacity");
  bindSet("sensSlider", "sensitivity");
  bindSet("aaCheck", "aimAssist");
  bindSet("cbCheck", "colorblind");
  bindSet("rmCheck", "reducedMotion");
  bindSet("ltCheck", "largeText");
  wepRadial.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) { wepRadial.classList.remove("show"); return; }
    setWep(parseInt(b.dataset.w, 10)); wepRadial.classList.remove("show");
  });
  wepRadial.addEventListener("touchstart", function (e) {
    var b = e.target.closest("button");
    if (!b) { wepRadial.classList.remove("show"); return; }
    e.preventDefault(); setWep(parseInt(b.dataset.w, 10)); wepRadial.classList.remove("show");
  }, { passive: false });

  if (store.suit) austinSuitBtn.classList.remove("lock");
  syncSettingsUI();
  fit();
  requestAnimationFrame(frame);
})();

