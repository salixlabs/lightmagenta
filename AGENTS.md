# Light Magenta — agent guide

This file is the operating guide for Cursor cloud agents working in `salixlabs/lightmagenta`.

## How changes land

Every change to this repo is made by a Cursor cloud agent on a branch, then opened as a pull request. Do not commit or push directly to `main`. That applies to bots and to people.

Merging into `main` is what publishes the site. See Deploy below.

## What this repo is

Light Magenta is a static hub at [lightmagenta.com](https://lightmagenta.com). It is a small landing page of tiles. Three of those tiles link to playable web copies of Salix Labs games. The games are not developed here. A playable copy is vendored in from the game's own repo:

| Tile | Path | Source repo | Pinned version | Source commit |
| --- | --- | --- | --- | --- |
| Spartan – Silent Spire | `/spartan/` | [salixlabs/spartan](https://github.com/salixlabs/spartan) | 0.5.0 | `0e535c2d6821d734f380becdeeddda5c942df50e` |
| Keep | `/keep/` | [salixlabs/keep](https://github.com/salixlabs/keep) | 0.3.0 | `2b96a8d769a04112a6c8db0f17755f9569880b6a` |
| HammerHead | `/hammerhead/` | [salixlabs/hammerhead](https://github.com/salixlabs/hammerhead) | 0.2.0 | `be6c41d16954db5c2b6b568c78948fbcd39921a2` |

Those source repos stay the place the games are written. Copies in this repo include each game's own `README.md`. Those files describe the game. They do not describe how this hub deploys. Spartan's copied README says the game repo has no GitHub Pages; this hub is the Pages site.

Two other tiles are not game copies:

- **Screen Time Limit** links out to the App Store. It has no local folder and no version label.
- **Next project** is a non-link "Soon" placeholder. It has no version label.

There is no build step. The site is HTML, CSS, and vanilla JS, plus image assets under `spartan/`.

## Deploy

GitHub Pages serves this repo as a legacy site:

- Source branch: `main`
- Source folder: `/` (the repository root)
- Live URL: https://lightmagenta.com/
- Custom domain file: `CNAME`, whose entire contents are `lightmagenta.com`
- HTTPS is enforced. The Pages certificate also covers `www.lightmagenta.com`.
- `.nojekyll` is an empty marker so Pages does not run Jekyll. Leave it in place.
- There is no workflow file in this repo. GitHub's managed `pages-build-deployment` workflow publishes a push to `main`.

Merging to `main` is the production deploy. Do not add a custom Pages workflow unless someone asks for one.

## Hub tiles and the pin flow

Playable tiles show a version label and nothing else about the build. The label is the text of `<span class="build">` inside that tile in `index.html`. It is static HTML. Nothing reads `VERSION` at request time.

Current labels, which match each folder's `VERSION` file:

- Spartan – Silent Spire: `0.5.0`
- HammerHead: `0.2.0`
- Keep: `0.3.0`

The commit SHA is not on the tile. It lives in that game's `SOURCE.txt`, along with the version and the list of copied files. `Soon` and App Store tiles have no `.build` span. Leave them unlabeled.

**Going forward, new visible versions use `yy.mm.x`.** `yy` is the two-digit year, `mm` is the zero-padded month (`08`, not `8`), and `x` is the release counter within that month (for example `26.10.1`). Labels already on the hub stay as classic semver until the next requested pin replaces them.

A **pin** is the only way a game copy changes, and only when someone asks for it:

1. Take one specific commit of that game's playable files from its source repo.
2. Copy those files into the matching subfolder, including every asset the build needs (`SOURCE.txt` lists them). These games ship as source files, not a compiled `dist/`.
3. In the same change, set that folder's `VERSION`, the version line in `SOURCE.txt` (keep the source commit URL there), and the tile's `<span class="build">` to the same version string.

Do not edit a game's logic, balance, art, or copy in this repo except by replacing the folder with that copied commit. Hub-only edits (tile blurbs on `index.html`, this docs set, styles for the landing page) are separate from a pin and still go through a pull request.

## DNS

`lightmagenta.com` DNS is in Squarespace. Only Chief (the Chief of Staff bot) changes DNS. Agents do not change DNS, and do not edit `CNAME`.

## Secrets

Do not put tokens, passwords, API keys, or `.env` files in this repo. Game code uses the word "secret" for an unlockable weapon and in-game easter eggs. That is not a credential.
