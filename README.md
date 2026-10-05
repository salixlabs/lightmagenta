# Light Magenta

A home for Erik’s little projects, at [lightmagenta.com](https://lightmagenta.com).

This repo is the hub: a static landing page of tiles. Three tiles open playable web copies of Salix Labs games. The games themselves live in their own repositories and are copied in here only when someone asks for a new pin.

## Tiles

| Tile | Where it goes | Version on the tile |
| --- | --- | --- |
| Spartan – Silent Spire | [/spartan/](https://lightmagenta.com/spartan/) | 0.5.0 |
| HammerHead | [/hammerhead/](https://lightmagenta.com/hammerhead/) | 0.2.0 |
| Keep | [/keep/](https://lightmagenta.com/keep/) | 0.3.0 |
| Screen Time Limit | App Store | none |
| Next project | Soon (not a link) | none |

Playable tiles show that version and nothing else. The label is the `<span class="build">` text in `index.html`. Each game folder also has a `VERSION` file with the same string, and a `SOURCE.txt` that records which commit was copied:

- Spartan – Silent Spire 0.5.0 from [salixlabs/spartan](https://github.com/salixlabs/spartan) `0e535c2`
- Keep 0.3.0 from [salixlabs/keep](https://github.com/salixlabs/keep) `2b96a8d`
- HammerHead 0.2.0 from [salixlabs/hammerhead](https://github.com/salixlabs/hammerhead) `be6c41d`

Labels already on the site are semver. The next pin of a game uses `yy.mm.x` instead: two-digit year, zero-padded month, then a counter for that month (`26.10.1`).

## Pins

A pin copies one commit of a game’s playable files into its folder (`spartan/`, `keep/`, or `hammerhead/`), including every asset that copy needs, and updates the tile label to match. There is no compile step; the folder is the game. Pins happen only when requested. This repo is not where those games are edited.

## Deploy

GitHub Pages publishes the root of `main` (legacy Pages, not a workflow checked into the repo). `CNAME` is `lightmagenta.com`. `.nojekyll` keeps Jekyll off so the static files are served as-is. Merging to `main` is what goes live.

## DNS

The `lightmagenta.com` DNS records stay in Squarespace. Only Chief (the Chief of Staff bot) changes them.

## Working on this repo

Changes land through a branch and a pull request. Do not commit straight to `main`. Do not commit tokens, passwords, or `.env` files.

Agent instructions: [AGENTS.md](AGENTS.md).
