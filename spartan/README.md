# Spartan Forge — Austin-444

Playable concept-test of a landscape run-and-gun for **Austin**.  
The hero is **Austin-444** (Spartan number **444**). You will see `444` on his chest in-game and on the title splash.

No build step. Vanilla JS + Canvas 2D. Works offline.

**Play URL:** https://lightmagenta.com/spartan  
WebDev hosts this on the Light Magenta hub. The path will not resolve until DNS cutover finishes. Until then, use the Safari steps below.

**Target: Safari on iPad, landscape.** That is the only device/browser this build is tuned for.

## Files (keep these together)

- `index.html` — the whole game (vanilla JS + canvas, no build step; loads sibling PNGs)
- `title-spartan-444.png` — cinematic title splash (full-bleed title page; preferred, faster)
- `spartan-444-side.png` — realistic side-view Austin-444 player sprite (`444` on the chest; flipped when aiming left)
- `spartan-arena-bg.png` — realistic battlefield backdrop (parallax cover behind the arena)
- `enemy-ember.png` — squat purple Ember infantry (studio white keyed to transparent RGBA)
- `enemy-reaver.png` — tall gold/purple Reaver warrior (same key; Stingers use a scaled teal-tinted Ember)
- `boss-vorrak.png` — Tartarus, gold/teal crested warlord
- `sergeant-johnson.png` — keyed transparent Sergeant Johnson friendly summon sprite
- `README.md` — this file

AirDrop **the folder**, not just the HTML, when you can — the external PNGs are the title, the Spartan, the arena, the wave enemies, and Tartarus. AirDrop of just `index.html` still shows the splash via the inlined fallback (a canvas hero still draws if both title sources fail; enemies fall back to the old canvas actors if their PNGs are missing).

## Open on iPad Safari

Test in **Safari on iPad**. Do not use Chrome (or any other browser) for this concept-test.

1. Put the iPad in **landscape**.
2. AirDrop the `spartan-web` folder onto the iPad, or copy it into **Files**.
3. In **Files**, open `index.html` → Share → **Safari** (or tap it and pick Safari).
4. First tap unlocks audio. The start tap also asks for fullscreen if Safari allows it (iPad Safari often ignores fullscreen unless the page is on the Home Screen — that is normal).
5. If `file://` blocks the page, serve the folder from a computer on the same Wi-Fi:

```bash
cd spartan-web
python3 -m http.server 8080
```

Then on the iPad, open **Safari** and go to `http://<your-computer-ip>:8080/`.

**Add to Home Screen** from the Safari share sheet (Share → Add to Home Screen) gives the cleanest full-bleed play.

## Keyboard check (optional)

If you need to verify keys before handing the iPad over, open `index.html` in **Safari on a Mac** (or serve the folder as above and open that URL in Safari). This is only a keyboard sanity check. The real test is still **Safari on iPad**.

## Controls

Safari-first. Landscape iPad is the target.

**Touch (iPad Safari)**

- Left analog stick — **360° aim**. Analog X walks / strafes (tilt amount is run speed). Analog Y aims up or down and does **not** leave the ground. The stick angle is the aim angle: Pulse, Burst, Arc, Bolt, and Austin's Gun all travel that way, including straight up or down. Facing flips with aim.
- Right **FIRE** — hold to shoot along the stick angle
- **JUMP** (large button next to FIRE) — the only way off the ground. Stick-up aims up; it does not jump or fly. Hold JUMP for a higher hop; tap for a short hop. Coyote time and jump-buffer still apply.
- Weapon strip (right) — Pulse / Burst / Arc / Bolt / A-Gun
- **II** — pause + armor loadout

**Keyboard** (Safari)

- `WASD` or arrows — 360° aim + analog-X run (same as the stick; `W` / `↑` aim up while you stay on the ground, not jump and not fly)
- `Space` — jump only (hold for height, tap for a short hop)
- `X` or mouse click — fire along the current aim
- `1`–`5` — weapons
- `P` or `Esc` — pause / loadout

## Weapons

1. **Pulse Rifle** — fast tracers, modest damage, tight spread
2. **Scatterburst** — pellet shotgun, close-range cone, kick
3. **Arc Repeater** — glowing homing bolts; overheats if you hold it
4. **Longbolt** — visible hitscan beam, high damage, pierces one extra target
5. **Austin's Gun** — secret, huge gold orbs, screen-shake (locked at start)

## Easter eggs (Austin)

**Austin's Gun**

- Shoot the glowing crate marked **A** (on the second platform, early in the run). Grab the gold orb it drops.
- Or enter the Konami-ish pad: **↑ ↑ ↓ ↓ ← → ← →** (WASD counts: `W W S S A D A D`).

**Austin Suit** (teal + gold armor)

- Same crate / Konami path, **or**
- Survive **wave 2**.

Unlocks persist in `localStorage` for this Safari profile (`sf_austinGun`, `sf_austinSuit`, `sf_best`).

## Sergeant Johnson power-up

A Sergeant Johnson beacon is **guaranteed in wave 1**. It deploys immediately, only about 150 px ahead of Austin-444 on his opening reachable ground path. The pickup is deliberately impossible to miss: a bright pulsing green/blue beacon, a tall vertical light column, a large downward arrow, the label **CALL JOHNSON**, and a long **JOHNSON BEACON DEPLOYED** toast. Collect it with normal player contact to call in **SGT. JOHNSON**. He drops into the arena, follows close to Austin, and fires friendly heavy-rifle rounds at the nearest enemy (including Tartarus) for about 20 seconds or until his 140 HP is depleted. Enemy fire can hit him; his rounds cannot hurt Austin. Wave 3 retains a 50% chance of a later refresh beacon; collecting it while Johnson is active refreshes both his timer and HP. If the PNG cannot load, the game draws a simple friendly canvas marine instead.

## Play loop

Title splash of Spartan 444 → tap to start → three waves (Embers, Stingers, Reavers) with a short breath between waves → **Tartarus** (wave-3 boss on the same arena) → shields recharge after about two seconds out of combat (overflow hits punch through to HP) → win beat *Forge complete / Austin would be proud / Tartarus down*, or tap to restart on death.

**Tartarus** — original warlord, crested helm, gold crest-shield. Break the crest (telegraphed gold lance, ground slam + shockwaves, bolt fan). When the crest shatters, the chest core is open for extra damage; if you wait, the crest reforms. Kill is sparks, not gore.

## iPad Safari caveats

- Must stay **landscape**. Portrait shows a rotate overlay (CSS + viewport check).
- iPad Safari **cannot reliably fullscreen** unless you **Add to Home Screen**; the game letterboxes to 1280×800 instead.
- First tap is required before Web Audio plays (iOS policy). Any first tap unlocks it.
- Prevents pinch-zoom and overscroll bounce; home-indicator / notch safe-area is respected on the thumb controls and HUD.
- If the title looks like a drawn stand-in, both the sibling PNG and the inlined splash failed — copy the folder (HTML + PNGs), and open from **Safari** (Files → Share → Safari, or the local-server URL in Safari).
- If Austin-444 looks like a green rectangle, `spartan-444-side.png` did not load — keep it next to `index.html`.
- If Embers, Reavers, Stingers, or Tartarus look like candy-colored boxes, the sibling enemy/boss PNGs did not load — keep `enemy-ember.png`, `enemy-reaver.png`, and `boss-vorrak.png` next to `index.html`.
- `100dvh` + `visualViewport` resize is used so the iPad Safari chrome (toolbar) does not clip the canvas.

## What is real vs stubbed

**In this build**

- Title cinematic (`title-spartan-444.png` as the full-bleed title page + Austin-444 / Spartan 444 overlay)
- Realistic PNG Spartan (`spartan-444-side.png`) and battlefield backdrop (`spartan-arena-bg.png`) with lighting, muzzle flashes, tracers, and ground shadows
- 360° analog stick / WASD aim + analog-X run; JUMP button / Space is the only hop
- Variable jump (coyote + buffer), four starter weapons + secret fifth (all fire along aim)
- Three enemy types as keyed PNGs (`enemy-ember.png`, `enemy-reaver.png`; Stingers are a scaled teal Ember) plus Tartarus (`boss-vorrak.png`) and friendly Sergeant Johnson (`sergeant-johnson.png`); canvas actors still draw if a PNG fails to load
- Three waves, score, HP + rechargeable shields, plus the guaranteed wave-1 Sergeant Johnson summon beacon and 50% wave-3 refresh
- Touch + keyboard, pause loadout with four colorways
- Object-pooled bullets/particles, 60fps target
- Session unlocks for Austin's Gun and Austin Suit

**Still stubbed / later**

- One arena only (boss uses the same yard; no extra maps)
- No streamed music (tiny Web Audio beeps only)
- No App Store wrapper / Game Center
- Austin Suit is a colorway, not a new mesh
- No accounts or online leaderboard
