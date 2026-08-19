# Spartan – Silent Spire

Playable **Level 1 vertical slice** of a landscape run-and-gun for **Austin**.  
In-game you are **the Spartan** / **Chief**. Chest number **444** and **Austin Suit** stay as identity / easter.

No build step. Vanilla JS + Canvas 2D. Works offline.

**Play URL:** https://lightmagenta.com/spartan  
**Version:** 0.4.0  
WebDev hosts this on the Light Magenta hub. No GitHub Pages. No DNS work in this repo.

**Target: Safari on iPad, landscape.** That is the only device/browser this build is tuned for.

## Scope of 0.4.0

This drop is **Crimson Approach** only.

- Title splash: `title-silent-spire.png` with **SPARTAN – SILENT SPIRE**, **AUSTIN-444**, **TAP TO START**, **0.4.0**
- Pre-mission skulls + difficulty
- Twin-stick iPad touch
- Pelican drop + Marines + Sergeant Johnson
- Austin-444 / Austin Suit / A crate / Austin's Gun
- Finish L1 → short Cortana/Chief beat → **Coming next: Outer Ring**

Campaign names 2–6 appear on the briefing as a stub. They are **not playable**. No Flood. No Tartarus fight in this slice.

## Files (keep these together)

- `VERSION` — `0.4.0`
- `SOURCE.txt` — name, version, play URL (Web pins this folder)
- `index.html` — shell, touch HUD, briefing / pause
- `data.js` — weapons, skulls, difficulties, Crimson Approach
- `input.js` — touch + keyboard platform layer
- `game.js` — simulation + render
- `title-silent-spire.png` — cinematic title splash
- `title-spartan-444.png` — fallback splash
- `spartan-444-side.png` / `austin-suit-side.png` — player sprites
- `spartan-arena-bg.png` — battlefield backdrop
- `enemy-ember.png` / `enemy-reaver.png` / `boss-vorrak.png`
- `sergeant-johnson.png` / `marine-female.png` / `marine-heavy.png` / `pelican-dropship.png`

AirDrop **the folder**. Opening only `index.html` still plays (canvas fallbacks), but the PNGs are the real art.

## Open on iPad Safari

1. Put the iPad in **landscape**.
2. AirDrop the folder, or copy it into **Files**.
3. In **Files**, open `index.html` → Share → **Safari**.
4. First tap unlocks audio. Add to Home Screen for the cleanest full-bleed play.

If `file://` blocks sibling JS/PNGs, serve the folder:

```bash
python3 -m http.server 8080
```

Then on the iPad: `http://<your-computer-ip>:8080/`.

## Controls (iPad, 100% touch)

**Left** — analog appears under the thumb. Double-tap or flick up = thruster. Pull down = crouch.

**Right** — independent **aim stick**, large **FIRE**, **JUMP**, **MELEE**, **NADE** (hold to cook), **WEP** (tap to cycle, hold for radial). **USE** when a data-pad is close.

Settings in pause: left/right-handed, opacity, sensitivity, aim assist, colorblind outlines, reduced motion, large text.

**Keyboard** (desktop debug only): WASD move, Q/E aim up/down, Space jump, X fire, F melee, G grenade, 1–9 weapons, P pause.

## Skulls (title / pre-mission)

Multi-select. HUD icons while playing.

1. **Birthday** — confetti/streamers, no gore (**works in L1**)
2. **Active Camo** — Spartan near-invisible; enemies ignore the player and still attack Marines (**works in L1**)
3. Iron — death restarts the level
4. Black Eye — shields recharge on melee only
5. Cowbell — huge explosions / shake
6. Mythic — tankier, harder-hitting enemies

## Play loop

Title → skulls / difficulty → short drop cine → **Crimson Approach** (left-to-right scroll) → Pelican fireteam → clear the sector → coming-next cine → tap to restart.

Weapons in this slice: Assault Rifle, Magnum, Shotgun and Plasma pickups, Energy Sword via WEP if found later in the radial lock list, Austin's Gun from the **A** crate or Konami pad (`↑ ↑ ↓ ↓ ← → ← →`).
