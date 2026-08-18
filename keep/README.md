# Keep

A medieval tower defense from Salix Labs. Sir Julian the Brave holds the road with Shadow Aussie and Papa -- three heroes on the map, not portraits in a drawer.
Build nests, circles, barracks, and trebuchets. The keep is the last stone.

Made first for iPad Safari in landscape. Mouse and keyboard work on a desktop.

## Play locally

No build step and no backend.

Serve the folder with a local static server, then open the shown URL.

    python3 -m http.server

or

    npx serve .

Open the shown URL. AirDrop the folder to an iPad, or add it to the Home Screen from Safari (Share, then Add to Home Screen). Landscape, please. The first tap unlocks sound.

Web will host this on Light Magenta later.

## How it plays

- Tap an empty pad for a build card. Each tower has two upgrades with a new trick.
- Tap a hero or their portrait, then tap the ground to send them. They fight on their own.
- Barracks soldiers and Aussie's wall body-block the lane. Nightwings fly over.
- Call the next wave early for a little gold. Three maps, each harder. Night Gate ends with Marrow the Gatebreaker. If he leaks, the keep falls at once.
- Title: Standard (current difficulty) or Veteran (22% more enemy hit points). The pick lasts the run, including One More Siege, until you choose again on the title.

### Heroes

Heroes and foes are drawn as painted tabletop miniatures (faces, armor, cloth, weapons). Identities stay: Julian black/blue sword, Papa the stout archer, Aussie the ninja hammer-blocker.

- Sir Julian the Brave -- central great hero. Black and blue, sword, 777 on the shield. Lionheart: a sword dash and smash.
- Shadow Aussie -- ninja blocker. Melee hammer, tanky, slows, body-blocks the lane. Bulwark: a stun slam and a short-lived lane wall.
- Papa -- stout warm guardian with a bow. Medium ranged shots, visible arrows. Volley: a rain of stout shafts.

### Maps

- Amberwatch Road -- 250 gold, 8 pads, 10 waves. The forest road.
- River Cut -- 190 gold, 6 pads, faster packs. Tighter corners, more water.
- Night Gate -- 150 gold, 5 pads. Long snake, dusk, and the boss.

### Powers

Reinforcements drop two soldiers on the road. They stay until they fall; you can stack more drops. Mute lives in the top bar.

## A note on secrets

The grass, the banners, and the number 777 are friendly. Nothing mean, nothing biographical. Julian the Brave stands.

No analytics, uploads, external assets, dependencies, or build tools.
