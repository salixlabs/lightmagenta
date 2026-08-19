# Spartan – Silent Spire

Playable **six-level campaign** of a landscape run-and-gun for **Austin**.  
In-game you are **the Spartan** / **Chief**. Chest number **444** and **Austin Suit** stay as identity / easter.

No build step. Vanilla JS + Canvas 2D. Works offline.

**Play URL:** https://lightmagenta.com/spartan  
**Version:** 0.5.0  
WebDev hosts this on the Light Magenta hub. No GitHub Pages. No DNS work in this repo.

**Target: Safari on iPad, landscape.** That is the only device/browser this build is tuned for.

## Scope of 0.5.0

Full campaign, left-to-right scroll. Each stage looks and plays different.

1. **Crimson Approach** — Covenant vane, Pelican fireteam, A crate
2. **Outer Ring: Blood of the Covenant** — denser elites/turrets, more plasma, tighter platforms, red/purple
3. **The Gravity Well** — lift / low-grav / flip wells, floating platforms, still run-and-gun
4. **Infection Vector** — Flood starts: fast crawlers + bloated carriers. Green/sick light. Birthday skull still pops (no gore)
5. **The Spire’s Heart** — Forerunner halls, tight corridors, Covenant remnants + Flood, data-pad lore
6. **Core Overload** — escalating waves, then Tartarus. Short win beat after

Between levels: a short Cortana/Chief interstitial. Chief is sparse. Cortana has personality.

- Title splash: `title-silent-spire.png` with **SPARTAN – SILENT SPIRE**, **AUSTIN-444**, **TAP TO START**, **0.5.0**
- Pre-mission skulls + difficulty
- Single lower-left move/aim stick (no right analog)
- Walk-over pickups only (guns, ammo, A crate, data-pads, Johnson beacon). Shooting does not collect or knock them.
- Pelican drop + Marines + Sergeant Johnson
- Austin-444 / Austin Suit / A crate / Austin's Gun

## Files (keep these together)

- `VERSION` — `0.5.0`
- `SOURCE.txt` — name, version, play URL (Web pins this folder)
- `index.html` — shell, touch HUD, briefing / pause
- `data.js` — weapons, skulls, difficulties, campaign levels 1–6
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

**Left** — one persistent analog in the lower-left (safe-area aware). 360 aim follows this stick; analog Y pitches only (no fly). Double-tap or flick up = thruster. Pull down = crouch.

**Right** — **FIRE**, **JUMP**, **MELEE**, **NADE** (hold to cook), **GUNS** (tap to cycle, hold for radial). No second stick.

**Pickups** — walk over guns, ammo, power-ups, the **A** crate, data-pads, and the Johnson beacon. Shooting a pickup does not collect, destroy, or knock it. First time nearby: **WALK OVER TO PICK UP**.

Settings in pause: left/right-handed, opacity, sensitivity, aim assist, colorblind outlines, reduced motion, large text.

**Keyboard** (desktop debug only): WASD move + aim, Q/E pitch, Space jump, X fire, F melee, G grenade, 1–9 weapons, P pause.

## Skulls (title / pre-mission)

Multi-select. HUD icons while playing.

1. **Birthday** — confetti/streamers, no gore (**works in all levels**, including Flood)
2. **Active Camo** — Spartan near-invisible; enemies ignore the player and still attack Marines
3. Iron — death restarts the level
4. Black Eye — shields recharge on melee only
5. Cowbell — huge explosions / shake
6. Mythic — tankier, harder-hitting enemies

## Play loop

Title → skulls / difficulty → drop cine → **L1–L6** with Cortana/Chief beats between → Tartarus → win cine → tap to restart.

Weapons: Assault Rifle, Magnum, Shotgun, Plasma, Needler, Rocket, Energy Sword, Sniper (walk over pickups). Austin's Gun from walking over the **A** crate, the L6 drop, or the Konami pad (`↑ ↑ ↓ ↓ ← → ← →`).
