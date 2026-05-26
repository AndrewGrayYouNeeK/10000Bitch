// Boss Ladder — Story Mode
// 6 fights total: 3 tier-only opponents (just difficulty) and 3 bosses (difficulty + gimmick).
// Each defeat grants coins, XP, and unlocks a cosmetic (skin or felt).

// Difficulty controls how the AI decides to bank vs. push for hot dice.
// - bankThreshold: minimum turn score before the AI considers banking (lower = pushier = better)
// - greed: 0..1, probability bonus toward rolling again even past threshold
// - holdGreedy: when true, AI will hold ALL scoring dice for max points; when false, holds minimum

export const BOSSES = [
  {
    id: "rookie",
    name: "The Rookie",
    title: "Back-Alley Beginner",
    avatar: "🎲",
    color: "from-emerald-500 to-teal-600",
    chipColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
    isBoss: false,
    difficulty: { bankThreshold: 300, greed: 0.05, holdGreedy: false },
    gimmick: null,
    intro: "Yeah, I just started rollin' last week. But hey — luck favors the new, right?",
    winLine: "Wait... that's it? You're tougher than you look.",
    loseLine: "Beginner's luck! I'll get you next time!",
    rewards: { coins: 100, xp: 150, skin: "wood", felt: null },
  },
  {
    id: "hustler",
    name: "Vinny \"The Hustler\"",
    title: "Streetwise Operator",
    avatar: "🎩",
    color: "from-amber-500 to-orange-600",
    chipColor: "bg-amber-500/20 text-amber-200 border-amber-500/40",
    isBoss: false,
    difficulty: { bankThreshold: 600, greed: 0.15, holdGreedy: false },
    gimmick: null,
    intro: "Listen kid, I've been workin' these dice longer than you've been breathin'. Show me what ya got.",
    winLine: "Eh, anyone can have a bad night. Don't get used to it.",
    loseLine: "That's how a real hustler plays. Pay up, kid.",
    rewards: { coins: 250, xp: 300, skin: "leather", felt: null },
  },
  {
    id: "shark",
    name: "Card Shark Cleo",
    title: "Casino Floor Legend",
    avatar: "🦈",
    color: "from-cyan-500 to-blue-600",
    chipColor: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40",
    isBoss: true,
    difficulty: { bankThreshold: 800, greed: 0.25, holdGreedy: true },
    gimmick: {
      id: "head_start",
      name: "Head Start",
      description: "Cleo starts with 1,500 points already banked.",
      startScore: 1500,
    },
    intro: "Sweetie, I don't lose. I just let the fish think they're winning... for a bit.",
    winLine: "Hmph. Looks like the fish bit back this time.",
    loseLine: "Run home, little fish. The deep water isn't for you.",
    rewards: { coins: 500, xp: 600, skin: "obsidian", felt: null },
  },
  {
    id: "phantom",
    name: "The Phantom",
    title: "Underground Champion",
    avatar: "👻",
    color: "from-purple-500 to-fuchsia-600",
    chipColor: "bg-purple-500/20 text-purple-200 border-purple-500/40",
    isBoss: false,
    difficulty: { bankThreshold: 1000, greed: 0.35, holdGreedy: true },
    gimmick: null,
    intro: "...",
    winLine: "...impressive.",
    loseLine: "...as expected.",
    rewards: { coins: 750, xp: 900, skin: "amethyst", felt: null },
  },
  {
    id: "ironhand",
    name: "Ironhand Magnus",
    title: "The Unbreakable",
    avatar: "🛡️",
    color: "from-slate-400 to-slate-600",
    chipColor: "bg-slate-500/20 text-slate-200 border-slate-500/40",
    isBoss: true,
    difficulty: { bankThreshold: 1200, greed: 0.30, holdGreedy: true },
    gimmick: {
      id: "farkle_shield",
      name: "Iron Will",
      description: "Magnus is immune to his FIRST farkle of the game — he keeps his turn score.",
      farkleShield: 1,
    },
    intro: "Many have rolled. Few have won. None have broken me. Roll your dice... iron does not bend.",
    winLine: "...iron can rust, it seems. Well rolled.",
    loseLine: "As immovable as ever. Better luck next time, mortal.",
    rewards: { coins: 1200, xp: 1500, skin: "silver", felt: null },
  },
  {
    id: "overlord",
    name: "Lord Decimus",
    title: "The Dice Overlord",
    avatar: "👑",
    color: "from-rose-500 to-red-700",
    chipColor: "bg-rose-500/20 text-rose-200 border-rose-500/40",
    isBoss: true,
    difficulty: { bankThreshold: 1500, greed: 0.50, holdGreedy: true },
    gimmick: {
      id: "doubled_sixes",
      name: "Crown of Sixes",
      description: "Every 6 the Overlord rolls counts as TWO 6s when scoring three-of-a-kind sets.",
      doubledSixes: true,
    },
    intro: "You stand before me, mortal? After ALL who have fallen? Roll, then. Roll your last.",
    winLine: "Impossible... the throne... the throne is YOURS.",
    loseLine: "Ten thousand years. Ten thousand wins. You were always going to lose.",
    rewards: { coins: 3000, xp: 5000, skin: "gold", felt: null },
  },
];

export function getBoss(id) {
  return BOSSES.find((b) => b.id === id) || null;
}

// A boss is unlocked if the previous one has been defeated (sequential ladder).
export function isBossUnlocked(bossId, bossesDefeated = []) {
  const idx = BOSSES.findIndex((b) => b.id === bossId);
  if (idx <= 0) return true; // first boss always open
  const prev = BOSSES[idx - 1];
  return bossesDefeated.includes(prev.id);
}

export function isBossDefeated(bossId, bossesDefeated = []) {
  return bossesDefeated.includes(bossId);
}