# HammerHead

A funny, touch-first photo smashing game from Salix Labs. Choose a photo, adjust the private in-browser head crop, then flatten it with increasingly silly tools.

## Play locally

No build step or backend is needed:

```bash
npx serve .
```

Open the shown URL. A local HTTP server is recommended because browser face detection APIs may require a secure context; manual crop always works.

## Features

- Photo picker with `accept="image/*"`; images stay entirely in browser memory
- `FaceDetector` auto-crop where available, with drag, pinch, zoom, and rotate fallback
- Regular hammer, hammerhead shark, and toy hammer with distinct timing, squash, particles, haptics, and generated Web Audio sounds
- Coin rewards and sequential weapon unlocks saved locally
- Responsive touch-first canvas controls for iPad Safari and desktop Chrome

No analytics, uploads, external assets, dependencies, or build tools.
