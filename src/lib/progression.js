// Tiered prestige progression system.
// Players earn XP from playing games and unlocking achievements.
// Skins are grouped into 5 tiers — each tier unlocks at a higher XP threshold.
// Top tier (Mythic) takes a LOT of play OR a much higher coin shortcut.

export const TIERS = [
  { id: 0, name: "Bronze",  minXp: 0,     color: "from-amber-700 to-orange-800", chip: "bg-amber-800/40 text-amber-200 border-amber-700" },
  { id: 1, name: "Silver",  minXp: 500,   color: "from-slate-400 to-slate-600",  chip: "bg-slate-500/30 text-slate-200 border-slate-500" },
  { id: 2, name: "Gold",    minXp: 2000,  color: "from-yellow-400 to-amber-600", chip: "bg-amber-500/30 text-amber-200 border-amber-500" },
  { id: 3, name: "Diamond", minXp: 6000,  color: "from-cyan-300 to-sky-500",     chip: "bg-cyan-500/30 text-cyan-100 border-cyan-400" },
  { id: 4, name: "Mythic",  minXp: 20000, color: "from-fuchsia-500 to-purple-700", chip: "bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-500" },
];

// Per-skin tier assignment. Anything not listed defaults to Bronze (tier 0).
// Prices in shopCatalog still apply as the in-tier cost.
// If a player is BELOW the tier, they can still skip-buy at TIER_SHORTCUT_MULTIPLIER × price.
export const SKIN_TIERS = {
  // Bronze (tier 0) — starter / cheap
  classic_white: 0,
  paper: 0,
  yellow_felt: 0,
  leather: 0,
  wood: 0,

  // Silver (tier 1)
  obsidian: 1,
  ice: 1,
  amethyst: 1,
  moonstone: 1,
  teal_crackle: 1,
  aquamarine: 1,
  aquamarine_light: 1,
  snow_globe: 1,
  blue_gel: 1,
  pride: 1,

  // Gold (tier 2)
  gold: 2,
  silver: 2,
  lava: 2,
  fluorite: 2,
  circuit_board: 2,
  dragon_scale: 2,
  bullet_holes: 2,
  bloodstone: 2,
  amber_wasp: 2,
  labradorite: 2,
  labradorite_polished: 2,

  // Diamond (tier 3)
  galaxy: 3,
  ruby: 3,
  cash: 3,
  neon_grid: 3,
  plasma: 3,
  matrix: 3,
  tesla: 3,
  toxic_plasma_v2: 3,

  // Mythic (tier 4) — rarest
  crystal_cut: 4,
  love_is_love: 4,
};

// If the player tries to buy a skin from a tier above their current tier,
// the price is multiplied by this — the "impatient shortcut".
export const TIER_SHORTCUT_MULTIPLIER = 10;

export function getTierForXp(xp = 0) {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (xp >= t.minXp) current = t;
  }
  return current;
}

export function getNextTier(xp = 0) {
  return TIERS.find(t => t.minXp > xp) || null;
}

export function getSkinTier(skinId) {
  const tierId = SKIN_TIERS[skinId] ?? 0;
  return TIERS[tierId];
}

export function isSkinUnlockedByTier(skinId, xp = 0) {
  const userTier = getTierForXp(xp).id;
  const skinTier = SKIN_TIERS[skinId] ?? 0;
  return userTier >= skinTier;
}

export function getSkinEffectivePrice(skin, xp = 0) {
  if (isSkinUnlockedByTier(skin.id, xp)) return skin.price;
  return skin.price * TIER_SHORTCUT_MULTIPLIER;
}

// XP rewards
export const XP_REWARDS = {
  finishGame: 25,
  winGame: 100,
  hotDice: 15,        // clearing all 6 dice in one turn
  bigTurn: 40,        // turn banked >= 1000
  firstWin: 250,      // achievement: first win ever
  tenWins: 500,       // achievement: 10 wins
  noFarkleGame: 75,   // achievement: finish a game with 0 farkles
};