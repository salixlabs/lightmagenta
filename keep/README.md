# The Last Defense of Camelot

A medieval tower defense from Salix Labs. After the wars that forged the Round Table, a new shadow rises. Arthur and the greater knights ride north. Three lesser-known but fiercely loyal Round Table knights hold the southern approaches to Camelot.

Julian the Lionhearted, Austin the Shadow, and Papa of the Longbow fight on the map — not portraits in a drawer. Build nests, circles, barracks, and trebuchets. The keep is the last stone.

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
- Tap a hero or their portrait, then tap the ground to send them. They fight on their own. Tap again to deselect.
- Barracks soldiers and Austin's wall body-block the lane. Morgan's Hounds slip past some blockers.
- Call the next wave early for a little gold. Seven maps, each more blighted. Late maps bring a Thorn-Drake; the final defense ends with a shade of Mordred. If a boss leaks, the keep falls at once.
- Title: Standard (current-feel difficulty on the first map, stepping up) or Veteran (22% more enemy hit points). The pick lasts the run, including One More Siege, until you choose again on the title.

### Heroes

Heroes and foes are drawn as painted tabletop miniatures (faces, armor, cloth, weapons). Original canvas art only.

- Julian the Lionhearted — youngest, proven courage. Plain longsword, scarlet cloak lined with a golden lion, practical polished armor. Mobile melee. Lionheart: a sword dash and smash.
- Austin the Shadow — massive, quiet, darkened plate and a hooded cloak. Great two-handed warhammer of black iron, the head like a clenched fist. True tank: enemies on or near the path halt to fight him. Bulwark: a stun slam, a hammer challenge, and a short-lived lane wall.
- Papa of the Longbow — older veteran, lighter mail, green hood, great yew longbow. The others call him Papa. Primary ranged damage and control. Long range, priority elites. Volley: a rain of stout shafts.

### Maps

A seven-map campaign. The land grows more blighted: healthy forest, thorns, murky river, scarred burning approaches, then Camelot's walls.

1. The First Warning — village roads and forest. Thorn-Raiders. 250 gold, 8 pads, 10 waves.
2. The River Fords — crossings that force a hold. Austin at the ford matters.
3. The Roman Road — long straighter path through ruins. Corrupted Knights. Tighter gold.
4. The Blackened Woods — thorn-choked, Thorn-Wights, lower visibility. Papa's range matters.
5. The Outer Watchtowers — border forts. First Thorned Champions.
6. The Approach to Camelot — scarred burning fields, mixed heavy waves, the Thorn-Drake.
7. The Final Defense — Camelot's outer walls and gatehouse. A shade of Mordred. Arthur's host is racing back.

After each win except the last, a short narrative interlude — then Next Siege.

### Hosts of the Black Thorn

- Thorn-Raiders — fast early fodder, ragged black cloaks, thorn-painted faces.
- Blackthorn Men-at-Arms — mid backbone, dark iron, notched shields, axes.
- Corrupted Knights — fallen knights, thorns from the joints.
- Thorn-Wights — slow dead bound in pulsing vines. They leave grasping roots.
- Morgan's Hounds — fast black dogs with green eyes. They ignore some blockers.
- Thorned Champions — later mini-bosses, half-man half-briar.
- Thorn-Drake — late-map boss. Shade of Mordred — the final defense. A boss leak wipes the keep.

### Powers

Reinforcements drop two soldiers on the road. They stay until they fall; you can stack more drops. Mute lives in the top bar.

## A note on secrets

The grass, the banners, and the number 777 are friendly. Nothing mean, nothing biographical. Julian the Lionhearted stands.

No analytics, uploads, external assets, dependencies, or build tools.
