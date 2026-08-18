/**
 * HammerHead game rules — no DOM, canvas, or audio.
 * A future Swift/iOS UI can call the same height, coin, and unlock logic.
 */

export const SAVE_VERSION = 2;
export const STARTER_ID = 'toy';
export const ORIGINAL_HEIGHT = 1000;
export const DONE_HEIGHT = 100; // 10% of original — certified flat
export const COIN_PER_HIT = 1;
export const FLATTEN_BONUS = 100;

/** Integer height units removed per smash. Toy hammer is the weakest. */
export const WEAPONS = Object.freeze([
  { id: 'toy', name: 'TOY HAMMER', damage: 15, cost: 0 },       // 60 hits
  { id: 'hammer', name: 'REGULAR HAMMER', damage: 36, cost: 100 }, // 25 hits
  { id: 'chicken', name: 'RUBBER CHICKEN', damage: 60, cost: 250 }, // 15 hits
  { id: 'shark', name: 'HAMMERHEAD SHARK', damage: 100, cost: 550 }, // 9 hits
  { id: 'skillet', name: 'CAST-IRON SKILLET', damage: 180, cost: 1200 }, // 5 hits
  { id: 'piano', name: 'CONCERT PIANO', damage: 450, cost: 2800 }, // 2 hits
]);

const WEAPON_MAP = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

export function weaponById(id) {
  return WEAPON_MAP[id] || null;
}

export function weaponIndex(id) {
  return WEAPONS.findIndex((w) => w.id === id);
}

export function previousWeapon(id) {
  const i = weaponIndex(id);
  return i > 0 ? WEAPONS[i - 1] : null;
}

export function hitsToFlatten(id) {
  const w = weaponById(id);
  if (!w || w.damage <= 0) return Infinity;
  return Math.ceil((ORIGINAL_HEIGHT - DONE_HEIGHT) / w.damage);
}

export function createSmash() {
  return {
    originalHeight: ORIGINAL_HEIGHT,
    heightRemaining: ORIGINAL_HEIGHT,
    hits: 0,
    won: false,
  };
}

export function resetSmash(smash) {
  smash.originalHeight = ORIGINAL_HEIGHT;
  smash.heightRemaining = ORIGINAL_HEIGHT;
  smash.hits = 0;
  smash.won = false;
  return smash;
}

export function heightRatio(smash) {
  return smash.heightRemaining / smash.originalHeight;
}

export function flattenProgress(smash) {
  const range = smash.originalHeight - DONE_HEIGHT;
  const squashed = smash.originalHeight - smash.heightRemaining;
  return Math.min(1, Math.max(0, squashed / range));
}

export function isFlat(smash) {
  return smash.heightRemaining <= DONE_HEIGHT;
}

/**
 * Apply one smash. Awards 1 coin per hit. The hit that reaches 10% height
 * also awards the flatten bonus. Mutates smash + wallet.
 */
export function applyHit(smash, wallet, weaponId) {
  if (smash.won) {
    return { type: 'ignored', coinsAwarded: 0, flattenBonus: 0 };
  }
  const weapon = weaponById(weaponId);
  if (!weapon) {
    return { type: 'ignored', coinsAwarded: 0, flattenBonus: 0 };
  }

  smash.heightRemaining = Math.max(DONE_HEIGHT, smash.heightRemaining - weapon.damage);
  smash.hits += 1;
  wallet.coins += COIN_PER_HIT;

  const justWon = isFlat(smash);
  let flattenBonus = 0;
  if (justWon) {
    smash.won = true;
    flattenBonus = FLATTEN_BONUS;
    wallet.coins += flattenBonus;
  }

  return {
    type: justWon ? 'flatten' : 'hit',
    coinsAwarded: COIN_PER_HIT + flattenBonus,
    flattenBonus,
    heightRemaining: smash.heightRemaining,
    progress: flattenProgress(smash),
    weaponId,
  };
}

export function createWallet(raw) {
  return migrateSave(raw || {});
}

/**
 * v1 saves unlocked the regular hammer by default and priced toys at 1 coin.
 * Existing players keep their coins and any extra unlocks, but start on the
 * toy hammer and always have it unlocked.
 */
export function migrateSave(raw) {
  const coins = Math.max(0, Math.floor(Number(raw.coins) || 0));
  let unlocked = Array.isArray(raw.unlocked) ? raw.unlocked.filter((id) => weaponById(id)) : [];
  let selected = typeof raw.selected === 'string' ? raw.selected : STARTER_ID;
  const version = Number(raw.version) || 1;

  if (version < SAVE_VERSION) {
    const onlyOldStarter = unlocked.length === 1 && unlocked[0] === 'hammer';
    if (!unlocked.length || onlyOldStarter) {
      unlocked = [STARTER_ID];
    } else if (!unlocked.includes(STARTER_ID)) {
      unlocked = [STARTER_ID, ...unlocked];
    }
    selected = STARTER_ID;
  }

  if (!unlocked.includes(STARTER_ID)) unlocked = [STARTER_ID, ...unlocked];
  unlocked = uniqueIds(unlocked);
  if (!unlocked.includes(selected)) selected = STARTER_ID;

  return { version: SAVE_VERSION, coins, unlocked, selected };
}

export function serializeWallet(wallet) {
  return {
    version: SAVE_VERSION,
    coins: wallet.coins,
    unlocked: [...wallet.unlocked],
    selected: wallet.selected,
  };
}

export function isUnlocked(wallet, id) {
  return wallet.unlocked.includes(id);
}

export function tryUnlock(wallet, id) {
  const weapon = weaponById(id);
  if (!weapon) return { ok: false, reason: 'unknown' };
  if (isUnlocked(wallet, id)) return { ok: false, reason: 'already', weapon };

  const prev = previousWeapon(id);
  if (prev && !isUnlocked(wallet, prev.id)) {
    return { ok: false, reason: 'locked_prev', weapon, prev };
  }
  if (wallet.coins < weapon.cost) {
    return { ok: false, reason: 'broke', weapon };
  }

  wallet.coins -= weapon.cost;
  wallet.unlocked.push(id);
  wallet.selected = id;
  return { ok: true, reason: 'ok', weapon };
}

export function selectWeapon(wallet, id) {
  if (!isUnlocked(wallet, id)) return false;
  wallet.selected = id;
  return true;
}

function uniqueIds(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
