# HammerHead

A funny, touch-first photo smashing game from Salix Labs. Choose a photo, adjust the private in-browser head crop, then flatten it with increasingly silly tools.

The smash, coin, and unlock **rules** live in `game/logic.js` with no DOM, canvas, or Web Audio. The browser (`game.js`, `index.html`, `styles.css`) only renders. A later Swift/iOS UI can reuse those rules without rewriting the economy.

## Play locally

No build step or backend is needed:

```bash
npx serve .
```

Open the shown URL. A local HTTP server is recommended because ES modules and browser face detection APIs may require a secure context; manual crop always works.

Run the rule tests with:

```bash
npm test
```

Static hosting must keep relative asset paths so the game still works at `/hammerhead/` on the Light Magenta hub.

## Features

- Photo picker with `accept="image/*"`; images stay entirely in browser memory (never uploaded)
- `FaceDetector` auto-crop where available, with drag, pinch, zoom, and rotate fallback
- Rectangular head crop that hammers down flatter each hit, vertically squishing the photo like a press
- Done when remaining height is **10%** of the original (90% squashed)
- **1 coin per smash**, plus **100 coins** for a certified-flat pancake
- Starter **toy hammer** is the weakest; regular hammer, rubber chicken, hammerhead shark, cast-iron skillet, and concert piano climb a price and damage ladder
- Distinct swing weight, sounds, particles, and squash punch per toy
- Coins and unlocks saved in `localStorage`, with a migration so old saves that started on the regular hammer land on the toy hammer without broken state
- Responsive touch-first canvas controls for iPad Safari and desktop Chrome

No analytics, uploads, external assets, framework, or build tools.
