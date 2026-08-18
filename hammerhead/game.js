'use strict';

import {
  WEAPONS,
  STARTER_ID,
  createSmash,
  createWallet,
  serializeWallet,
  applyHit,
  tryUnlock,
  selectWeapon,
  flattenProgress,
  heightRatio,
  resetSmash,
} from './game/logic.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const screens = { start: $('#start'), crop: $('#crop'), game: $('#game') };
const cropC = $('#cropCanvas');
const cc = cropC.getContext('2d');
const gameC = $('#gameCanvas');
const gc = gameC.getContext('2d');

const SAVE_KEYS = { coins: 'hhCoins', unlocked: 'hhUnlocked', selected: 'hhSelected', version: 'hhSaveVersion' };

const FX = {
  toy: {
    icon: '🧸',
    color: '#f24b9d',
    mess: 'confetti',
    words: ['SQUEAK!', 'BOOP!', 'TINY BONK!'],
    speed: 280,
    punch: 0.06,
    shake: 8,
    particles: 22,
    vibrate: 8,
    unlock: 'THE TINIEST TOOL JOINS THE CREW!',
  },
  hammer: {
    icon: '🔨',
    color: '#555',
    mess: 'dust',
    words: ['BONK!', 'THWACK!', 'KAPOW!'],
    speed: 500,
    punch: 0.12,
    shake: 16,
    particles: 16,
    vibrate: 25,
    unlock: 'A PROPER BONKER. RESPECT.',
  },
  chicken: {
    icon: '🐔',
    color: '#f4c430',
    mess: 'feathers',
    words: ['HONK!', 'SQUAWK!', 'POULTRY JUSTICE!'],
    speed: 400,
    punch: 0.18,
    shake: 14,
    particles: 26,
    vibrate: [12, 18, 12],
    unlock: 'HONK HONK. DIPLOMACY HAS FAILED.',
  },
  shark: {
    icon: '🦈',
    color: '#2a73ff',
    mess: 'bubbles',
    words: ['CHOMP-BONK!', 'FIN-ISHED!', 'SHARK ATTACK!'],
    speed: 720,
    punch: 0.16,
    shake: 23,
    particles: 28,
    vibrate: [25, 20, 35],
    unlock: 'SHARK: ACQUIRED. INSURANCE: PENDING.',
  },
  skillet: {
    icon: '🍳',
    color: '#2b2b2b',
    mess: 'sparks',
    words: ['CLANG!', 'SEARED!', 'BREAKFAST!'],
    speed: 640,
    punch: 0.24,
    shake: 20,
    particles: 30,
    vibrate: [40],
    unlock: 'BREAKFAST IS READY. THE HEAD IS NOT.',
  },
  piano: {
    icon: '🎹',
    color: '#4a3320',
    mess: 'notes',
    words: ['FORTISSIMO!', 'GRAND SLAM!', 'ENCORE!'],
    speed: 920,
    punch: 0.34,
    shake: 28,
    particles: 36,
    vibrate: [20, 30, 60],
    unlock: 'MOZART WOULD NEVER. WE WOULD.',
  },
};

let image = null;
let head = null;
let crop = { x: 0, y: 0, zoom: 1, base: 1, rot: 0 };
let pointers = new Map();
let drag = null;
let pinch = null;
let wallet = loadWallet();
let smash = createSmash();
let swinging = false;
let swing = { t: 0, d: 0 };
let particles = [];
let shake = 0;
let punch = 0;
let soundOn = true;
let audio = null;
let floaters = [];

function show(id) {
  Object.values(screens).forEach((x) => x.classList.remove('active'));
  screens[id].classList.add('active');
}

function loadWallet() {
  return createWallet({
    coins: localStorage[SAVE_KEYS.coins],
    unlocked: safeJson(localStorage[SAVE_KEYS.unlocked], []),
    selected: localStorage[SAVE_KEYS.selected] || STARTER_ID,
    version: localStorage[SAVE_KEYS.version],
  });
}

function safeJson(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save() {
  const data = serializeWallet(wallet);
  localStorage[SAVE_KEYS.coins] = data.coins;
  localStorage[SAVE_KEYS.unlocked] = JSON.stringify(data.unlocked);
  localStorage[SAVE_KEYS.selected] = data.selected;
  localStorage[SAVE_KEYS.version] = data.version;
  $('#coins').textContent = data.coins;
  renderWeapons();
}

function picker() {
  const p = $('#photo');
  p.value = '';
  p.click();
}

$('#photo').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  const im = new Image();
  im.onload = async () => {
    image = im;
    show('crop');
    fitCrop();
    drawCrop();
    await detectFace();
    URL.revokeObjectURL(url);
  };
  im.onerror = () => alert('That photo was too mysterious to open. Try another!');
  im.src = url;
};

$$('.repick').forEach((b) => {
  b.onclick = () => {
    hideWin();
    picker();
  };
});
$('#back').onclick = () => show('start');

function fitCrop() {
  crop.base = Math.max(700 / image.width, 700 / image.height);
  crop.zoom = 1;
  crop.x = crop.y = 0;
  crop.rot = 0;
  $('#zoom').value = 1;
  $('#status').textContent = 'Looking for a head…';
}

function drawCrop() {
  if (!image) return;
  cc.clearRect(0, 0, 700, 700);
  cc.save();
  cc.translate(350 + crop.x, 350 + crop.y);
  cc.rotate((crop.rot * Math.PI) / 180);
  const s = crop.base * crop.zoom;
  cc.scale(s, s);
  cc.drawImage(image, -image.width / 2, -image.height / 2);
  cc.restore();
}

async function detectFace() {
  if (!('FaceDetector' in window)) {
    setTimeout(() => {
      $('#status').textContent = 'Center crop ready — give it a nudge if needed.';
    }, 450);
    return;
  }
  try {
    const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(image);
    if (!faces.length) throw 0;
    const b = faces[0].boundingBox;
    const desired = 350 / Math.max(b.width, b.height * 0.78);
    crop.zoom = Math.max(0.45, Math.min(3.5, desired / crop.base));
    const s = crop.base * crop.zoom;
    crop.x = -((b.x + b.width / 2) - image.width / 2) * s;
    crop.y = -((b.y + b.height * 0.48) - image.height / 2) * s;
    $('#zoom').value = crop.zoom;
    $('#status').textContent = 'Head acquired! Fine-tune if you like.';
    drawCrop();
  } catch {
    $('#status').textContent = 'No automatic noggin found — center it in the frame.';
  }
}

$('#zoom').oninput = (e) => {
  crop.zoom = +e.target.value;
  drawCrop();
};
$('#rotate').onclick = () => {
  crop.rot = (crop.rot + 90) % 360;
  drawCrop();
};

function point(e) {
  const r = cropC.getBoundingClientRect();
  return { x: (e.clientX - r.left) * 700 / r.width, y: (e.clientY - r.top) * 700 / r.height };
}

$('#cropStage').onpointerdown = (e) => {
  e.preventDefault();
  cropC.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, point(e));
  if (pointers.size === 1) drag = { p: point(e), x: crop.x, y: crop.y };
  if (pointers.size === 2) {
    const a = [...pointers.values()];
    pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), z: crop.zoom };
  }
};

$('#cropStage').onpointermove = (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, point(e));
  if (pointers.size === 2 && pinch) {
    const a = [...pointers.values()];
    const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
    crop.zoom = Math.max(0.45, Math.min(3.5, (pinch.z * d) / pinch.d));
    $('#zoom').value = crop.zoom;
  } else if (drag) {
    const p = point(e);
    crop.x = drag.x + p.x - drag.p.x;
    crop.y = drag.y + p.y - drag.p.y;
  }
  drawCrop();
};

function pointerUp(e) {
  pointers.delete(e.pointerId);
  drag = null;
  pinch = null;
}
$('#cropStage').onpointerup = pointerUp;
$('#cropStage').onpointercancel = pointerUp;

// Matches the .frame overlay: 20% / 12% / 60% / 76% of the 700×700 crop canvas.
const CROP_FRAME = { x: 140, y: 84, w: 420, h: 532 };

$('#confirm').onclick = () => {
  head = document.createElement('canvas');
  head.width = CROP_FRAME.w;
  head.height = CROP_FRAME.h;
  head.getContext('2d').drawImage(
    cropC,
    CROP_FRAME.x, CROP_FRAME.y, CROP_FRAME.w, CROP_FRAME.h,
    0, 0, CROP_FRAME.w, CROP_FRAME.h,
  );
  resetRun();
  show('game');
  $('#hint').style.display = 'block';
  requestAnimationFrame(loop);
};

function renderWeapons() {
  $('#weapons').innerHTML = WEAPONS.map((w) => {
    const fx = FX[w.id];
    const open = wallet.unlocked.includes(w.id);
    const selected = w.id === wallet.selected;
    return `<button class="weapon ${selected ? 'selected' : ''} ${open ? '' : 'locked'}" data-id="${w.id}">
      <span>${fx.icon}</span>${w.name}${open ? '' : `<span class="cost">🟡 ${w.cost}</span>`}
    </button>`;
  }).join('');
  $$('.weapon').forEach((b) => {
    b.onclick = () => chooseWeapon(b.dataset.id);
  });
  $('#coins').textContent = wallet.coins;
}

function chooseWeapon(id) {
  if (wallet.unlocked.includes(id)) {
    selectWeapon(wallet, id);
    save();
    toast(`${weaponByName(id)} READY`);
    return;
  }
  const result = tryUnlock(wallet, id);
  if (result.reason === 'broke') {
    toast(`NEED ${result.weapon.cost} COINS — BONK MORE HEADS!`);
    return;
  }
  if (result.reason === 'locked_prev') {
    toast(`UNLOCK THE ${result.prev.name} FIRST!`);
    return;
  }
  if (!result.ok) return;
  save();
  toast(FX[id].unlock);
  coinSound();
}

function weaponByName(id) {
  return WEAPONS.find((w) => w.id === id)?.name || id;
}

function resetRun() {
  resetSmash(smash);
  swinging = false;
  particles = [];
  punch = 0;
  floaters = [];
  $('#fill').style.width = '0';
  $('#combo').textContent = 'READY?';
  renderWeapons();
}

function hideWin() {
  $('#win').classList.remove('show');
  $('#win').setAttribute('aria-hidden', 'true');
}

$('#again').onclick = () => {
  hideWin();
  resetRun();
};
$('#shop').onclick = () => {
  hideWin();
  resetRun();
  document.querySelector('.weapon.locked')?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
    500,
  );
};

$('#smash').onclick = smashNow;
gameC.onclick = smashNow;

function smashNow() {
  if (!head || swinging || smash.won) return;
  ensureAudio();
  $('#hint').style.display = 'none';
  const fx = FX[wallet.selected];
  swinging = true;
  swing = { t: performance.now(), d: fx.speed };
  setTimeout(() => impact(fx), fx.speed * 0.58);
}

function impact(fx) {
  const result = applyHit(smash, wallet, wallet.selected);
  if (result.type === 'ignored') return;
  save();
  pulseCoins();
  spawnFloater('+1');
  shake = fx.shake;
  punch = 1;
  $('#fill').style.width = `${flattenProgress(smash) * 100}%`;
  $('#combo').textContent = fx.words[Math.floor(Math.random() * fx.words.length)];
  makeSound(wallet.selected);
  makeParticles(fx.mess, fx.particles);
  if (navigator.vibrate) navigator.vibrate(fx.vibrate);
  if (result.type === 'flatten') {
    spawnFloater('+100');
    setTimeout(win, 520);
  }
}

function win() {
  coinSound();
  makeParticles('confetti', 80);
  $('#win').classList.add('show');
  $('#win').setAttribute('aria-hidden', 'false');
}

function toast(t) {
  $('#combo').textContent = t;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    $('#combo').textContent = smash.won ? 'FLAT!' : 'READY?';
  }, 1600);
}

function pulseCoins() {
  const el = $('.coins');
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function spawnFloater(text) {
  floaters.push({ text, x: 450, y: 280, life: 40 });
}

function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}

function osc(type, f0, f1, d, vol = 0.18) {
  if (!soundOn) return;
  ensureAudio();
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), audio.currentTime + d);
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + d);
  o.connect(g).connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + d);
}

function makeSound(id) {
  if (id === 'hammer') {
    osc('square', 120, 42, 0.22, 0.22);
    osc('sine', 70, 30, 0.32, 0.3);
  } else if (id === 'shark') {
    osc('sawtooth', 95, 28, 0.45, 0.25);
    setTimeout(() => osc('sine', 500, 90, 0.22, 0.12), 60);
  } else if (id === 'toy') {
    osc('sine', 880, 260, 0.12, 0.16);
    setTimeout(() => osc('square', 520, 760, 0.1, 0.08), 90);
  } else if (id === 'chicken') {
    osc('sawtooth', 320, 140, 0.28, 0.2);
    setTimeout(() => osc('square', 240, 90, 0.2, 0.14), 70);
  } else if (id === 'skillet') {
    osc('square', 920, 180, 0.16, 0.16);
    osc('sine', 1400, 420, 0.22, 0.1);
    osc('triangle', 80, 40, 0.3, 0.22);
  } else {
    osc('sine', 261, 220, 0.35, 0.14);
    osc('sine', 329, 280, 0.38, 0.12);
    osc('sine', 392, 330, 0.4, 0.1);
    setTimeout(() => osc('triangle', 90, 40, 0.45, 0.2), 80);
  }
}

function coinSound() {
  osc('sine', 520, 850, 0.15, 0.12);
  setTimeout(() => osc('sine', 750, 1200, 0.2, 0.12), 100);
}

$('#sound').onclick = () => {
  soundOn = !soundOn;
  $('#sound').textContent = `Sound ${soundOn ? 'ON' : 'OFF'}`;
  if (soundOn) ensureAudio();
};

function makeParticles(type, n) {
  const colors = {
    confetti: ['#ffcf40', '#f24b3b', '#2a73ff', '#45c787'],
    feathers: ['#f4c430', '#fff3b0', '#e07a2f', '#fff'],
    sparks: ['#ffcf40', '#f24b3b', '#fff3b0', '#ff8a3d'],
    notes: ['#171716', '#2a73ff', '#f24b3b', '#45c787'],
    dust: ['#a87943'],
    bubbles: ['#2a73ff'],
  };
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 3 + Math.random() * 11;
    particles.push({
      x: 450,
      y: 560,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 6,
      life: 45 + Math.random() * 35,
      type,
      color: (colors[type] || colors.dust)[i % (colors[type] || colors.dust).length],
      r: 3 + Math.random() * 7,
      glyph: type === 'notes' ? ['♪', '♫', '♬'][i % 3] : '',
    });
  }
}

const HEAD_W = 360;
const HEAD_H = 456;

function drawHead() {
  const fx = FX[wallet.selected];
  const ratio = Math.max(0.07, heightRatio(smash) * (1 - punch * fx.punch));
  const w = HEAD_W;
  const h = HEAD_H * ratio;
  const cx = 450;
  const cy = 590 - h / 2;

  gc.save();
  gc.translate(cx, cy);
  gc.shadowColor = '#171716';
  gc.shadowBlur = 0;
  gc.shadowOffsetY = 16;
  gc.shadowOffsetX = 8;
  gc.beginPath();
  gc.rect(-w / 2, -h / 2, w, h);
  gc.clip();
  gc.drawImage(head, -w / 2, -h / 2, w, h);
  gc.restore();

  gc.save();
  gc.translate(cx, cy);
  gc.strokeStyle = '#171716';
  gc.lineWidth = 12;
  gc.strokeRect(-w / 2, -h / 2, w, h);
  gc.restore();
}

function drawWeapon(now) {
  if (!swinging) return;
  const id = wallet.selected;
  const p = Math.min(1, (now - swing.t) / swing.d);
  const angle = p < 0.58 ? -0.95 + (p / 0.58) * 1.6 : 0.65 - ((p - 0.58) / 0.42) * 0.5;
  gc.save();
  gc.translate(450, 280);
  gc.rotate(angle);
  if (id === 'hammer') drawHammer();
  else if (id === 'toy') drawToy();
  else if (id === 'chicken') drawChicken();
  else if (id === 'shark') drawShark();
  else if (id === 'skillet') drawSkillet();
  else drawPiano();
  gc.restore();
  if (p >= 1) swinging = false;
}

function drawHammer() {
  gc.fillStyle = '#845433';
  gc.fillRect(-18, -230, 36, 250);
  gc.fillStyle = '#555';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 10;
  gc.fillRect(-105, -255, 210, 85);
  gc.strokeRect(-105, -255, 210, 85);
}

function drawToy() {
  gc.fillStyle = '#3fc5e8';
  gc.fillRect(-17, -220, 34, 230);
  gc.fillStyle = '#ff55a3';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 9;
  gc.beginPath();
  gc.roundRect(-110, -252, 220, 95, 35);
  gc.fill();
  gc.stroke();
  gc.fillStyle = '#ffcf40';
  gc.beginPath();
  gc.arc(-62, -205, 21, 0, 7);
  gc.arc(62, -205, 21, 0, 7);
  gc.fill();
}

function drawChicken() {
  gc.fillStyle = '#e07a2f';
  gc.fillRect(-14, -150, 28, 170);
  gc.fillStyle = '#f4c430';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 8;
  gc.beginPath();
  gc.ellipse(0, -210, 92, 70, 0, 0, Math.PI * 2);
  gc.fill();
  gc.stroke();
  gc.beginPath();
  gc.ellipse(70, -200, 48, 32, 0.2, 0, Math.PI * 2);
  gc.fill();
  gc.stroke();
  gc.fillStyle = '#f24b3b';
  gc.beginPath();
  gc.moveTo(40, -268);
  gc.lineTo(58, -300);
  gc.lineTo(78, -262);
  gc.closePath();
  gc.fill();
  gc.stroke();
  gc.fillStyle = '#e07a2f';
  gc.beginPath();
  gc.moveTo(110, -210);
  gc.lineTo(168, -198);
  gc.lineTo(110, -182);
  gc.closePath();
  gc.fill();
  gc.stroke();
  gc.fillStyle = '#171716';
  gc.beginPath();
  gc.arc(88, -214, 8, 0, 7);
  gc.fill();
}

function drawShark() {
  gc.fillStyle = '#2a83b8';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 9;
  gc.beginPath();
  gc.moveTo(0, -260);
  gc.quadraticCurveTo(70, -230, 62, -150);
  gc.lineTo(28, 35);
  gc.lineTo(-28, 35);
  gc.lineTo(-55, -150);
  gc.quadraticCurveTo(-70, -230, 0, -260);
  gc.fill();
  gc.stroke();
  gc.beginPath();
  gc.moveTo(-48, -207);
  gc.lineTo(-150, -250);
  gc.lineTo(-132, -160);
  gc.closePath();
  gc.moveTo(48, -207);
  gc.lineTo(150, -250);
  gc.lineTo(132, -160);
  gc.closePath();
  gc.fill();
  gc.stroke();
  gc.fillStyle = 'white';
  gc.beginPath();
  gc.arc(-35, -220, 13, 0, 7);
  gc.arc(35, -220, 13, 0, 7);
  gc.fill();
}

function drawSkillet() {
  gc.fillStyle = '#845433';
  gc.fillRect(-16, -40, 32, 160);
  gc.fillStyle = '#2b2b2b';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 10;
  gc.beginPath();
  gc.arc(0, -180, 118, 0, Math.PI * 2);
  gc.fill();
  gc.stroke();
  gc.fillStyle = '#3d3d3d';
  gc.beginPath();
  gc.arc(0, -180, 88, 0, Math.PI * 2);
  gc.fill();
  gc.strokeStyle = '#ffcf40';
  gc.lineWidth = 4;
  gc.beginPath();
  gc.arc(-30, -200, 18, 0.2, 2);
  gc.stroke();
}

function drawPiano() {
  gc.fillStyle = '#4a3320';
  gc.strokeStyle = '#171716';
  gc.lineWidth = 10;
  gc.fillRect(-130, -250, 260, 170);
  gc.strokeRect(-130, -250, 260, 170);
  gc.fillStyle = '#2a2118';
  gc.fillRect(-130, -250, 260, 36);
  gc.fillStyle = '#fff9e8';
  gc.fillRect(-120, -140, 240, 50);
  gc.strokeRect(-120, -140, 240, 50);
  gc.fillStyle = '#171716';
  for (let i = 0; i < 10; i++) gc.fillRect(-108 + i * 23, -140, 8, 32);
  gc.fillStyle = '#845433';
  gc.fillRect(-18, -80, 36, 90);
}

function drawParticles() {
  particles.forEach((q) => {
    q.x += q.vx;
    q.y += q.vy;
    q.vy += 0.35;
    q.life--;
    gc.save();
    if (q.type === 'bubbles') {
      gc.strokeStyle = '#2a73ff';
      gc.lineWidth = 4;
      gc.beginPath();
      gc.arc(q.x, q.y, q.r, 0, 7);
      gc.stroke();
    } else if (q.type === 'notes') {
      gc.fillStyle = q.color;
      gc.font = `700 ${18 + q.r}px Impact, sans-serif`;
      gc.fillText(q.glyph, q.x, q.y);
    } else if (q.type === 'feathers') {
      gc.fillStyle = q.color;
      gc.translate(q.x, q.y);
      gc.rotate(q.x * 0.05);
      gc.beginPath();
      gc.ellipse(0, 0, q.r * 1.6, q.r * 0.55, 0, 0, 7);
      gc.fill();
    } else {
      gc.fillStyle = q.color;
      gc.translate(q.x, q.y);
      gc.rotate(q.x * 0.04);
      if (q.type === 'confetti' || q.type === 'sparks') gc.fillRect(-q.r, -q.r / 2, q.r * 2, q.r);
      else {
        gc.beginPath();
        gc.arc(0, 0, q.r, 0, 7);
        gc.fill();
      }
    }
    gc.restore();
  });
  particles = particles.filter((q) => q.life > 0 && q.y < 900);
}

function drawFloaters() {
  floaters.forEach((f) => {
    f.y -= 2.2;
    f.life--;
    gc.save();
    gc.globalAlpha = Math.max(0, f.life / 40);
    gc.fillStyle = '#171716';
    gc.font = '700 28px Impact, sans-serif';
    gc.textAlign = 'center';
    gc.fillText(f.text, f.x + 2, f.y + 2);
    gc.fillStyle = '#ffcf40';
    gc.fillText(f.text, f.x, f.y);
    gc.restore();
  });
  floaters = floaters.filter((f) => f.life > 0);
}

function loop(now) {
  if (!screens.game.classList.contains('active')) return;
  gc.setTransform(1, 0, 0, 1, 0, 0);
  gc.clearRect(0, 0, 900, 850);
  gc.fillStyle = '#ffcf40';
  gc.beginPath();
  gc.ellipse(450, 650, 360, 95, 0, 0, 7);
  gc.fill();
  gc.strokeStyle = '#171716';
  gc.lineWidth = 9;
  gc.stroke();
  if (shake) {
    gc.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    shake *= 0.82;
    if (shake < 0.4) shake = 0;
  }
  punch *= 0.78;
  if (punch < 0.02) punch = 0;
  drawHead();
  drawWeapon(now);
  drawParticles();
  drawFloaters();
  requestAnimationFrame(loop);
}

$('#how').onclick = () => $('#help').showModal();
$$('.close').forEach((b) => {
  b.onclick = () => $('#help').close();
});

save();
