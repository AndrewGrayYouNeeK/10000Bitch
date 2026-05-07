// Static catalog of all purchasable cosmetics.
// Skins describe the die body. Pips describe the dots. Badges describe an animated player badge.

export const DICE_SKINS = [
  {
    id: "classic_white",
    name: "Classic White",
    price: 0,
    gradient: "from-white via-slate-50 to-slate-200",
    border: "border-slate-300",
    pipColor: "bg-slate-900",
    glow: "",
    description: "The original. Timeless.",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    price: 150,
    gradient: "from-indigo-950 via-slate-950 to-black",
    border: "border-black",
    pipColor: "bg-white",
    glow: "shadow-indigo-900/70",
    description: "Glossy black with a midnight gleam.",
  },
  {
    id: "ruby",
    name: "Ruby",
    price: 200,
    gradient: "from-rose-300 via-rose-500 to-red-700",
    border: "border-red-800",
    pipColor: "bg-white",
    glow: "shadow-red-500/50",
    description: "Hot streak material.",
  },
  {
    id: "emerald",
    name: "Emerald",
    price: 200,
    gradient: "from-emerald-300 via-emerald-500 to-green-700",
    border: "border-green-800",
    pipColor: "bg-white",
    glow: "shadow-emerald-500/50",
    description: "Lucky green.",
  },
  {
    id: "sapphire",
    name: "Sapphire",
    price: 250,
    gradient: "from-sky-300 via-blue-500 to-indigo-800",
    border: "border-indigo-900",
    pipColor: "bg-white",
    glow: "shadow-blue-500/50",
    description: "Cool and confident.",
  },
  {
    id: "gold",
    name: "24K Gold",
    price: 500,
    gradient: "from-yellow-200 via-amber-400 to-yellow-600",
    border: "border-amber-700",
    pipColor: "bg-slate-900",
    glow: "shadow-amber-400/70",
    description: "High roller essential.",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    price: 750,
    gradient: "from-purple-600 via-fuchsia-600 to-indigo-900",
    border: "border-purple-900",
    pipColor: "bg-white",
    glow: "shadow-fuchsia-500/60",
    description: "Cosmic energy.",
  },
  {
    id: "lava",
    name: "Lava",
    price: 600,
    gradient: "from-orange-400 via-red-600 to-black",
    border: "border-orange-800",
    pipColor: "bg-yellow-200",
    glow: "shadow-orange-500/70",
    description: "Molten hot dice.",
  },
  {
    id: "diamond",
    name: "Diamond",
    price: 2000,
    gradient: "from-cyan-100 via-white to-sky-200",
    border: "border-cyan-200",
    pipColor: "bg-sky-400",
    glow: "shadow-cyan-300/80",
    description: "Pure crystal. The legendary tier.",
    special: "diamond",
  },
];

// Coin packs — direct-buy alternative for players who don't want to grind.
export const COIN_PACKS = [
  { id: "pack_handful", name: "Handful", coins: 250, emoji: "🎲" },
  { id: "pack_stack",   name: "Stack",   coins: 750, emoji: "💰" },
  { id: "pack_roll",    name: "Big Roll", coins: 2000, emoji: "💎" },
  { id: "pack_jackpot", name: "Jackpot", coins: 5000, emoji: "👑" },
];

export const PIP_STYLES = [
  { id: "classic_dots", name: "Classic Dots", price: 0, shape: "dot", description: "Round and simple." },
  { id: "square_pips", name: "Square Pips", price: 100, shape: "square", description: "Sharp corners." },
  { id: "star_pips", name: "Star Pips", price: 250, shape: "star", description: "Shine bright." },
  { id: "heart_pips", name: "Heart Pips", price: 250, shape: "heart", description: "Roll with love." },
  { id: "diamond_pips", name: "Diamond Pips", price: 300, shape: "diamond", description: "Cut above." },
];

export const BADGES = [
  { id: "rookie", name: "Rookie", price: 100, emoji: "🎲", color: "from-slate-400 to-slate-600", description: "Every legend starts here." },
  { id: "hot_hand", name: "Hot Hand", price: 300, emoji: "🔥", color: "from-orange-400 to-red-600", description: "You're on fire." },
  { id: "lucky_seven", name: "Lucky 7", price: 400, emoji: "🍀", color: "from-green-400 to-emerald-600", description: "Fortune favors you." },
  { id: "high_roller", name: "High Roller", price: 600, emoji: "💎", color: "from-cyan-400 to-blue-600", description: "Big risk, big reward." },
  { id: "champion", name: "Champion", price: 800, emoji: "👑", color: "from-yellow-300 to-amber-600", description: "Born to win." },
  { id: "legend", name: "Legend", price: 1500, emoji: "⚡", color: "from-fuchsia-400 to-purple-700", description: "The stuff of myth." },
];

export function getSkin(id) {
  return DICE_SKINS.find(s => s.id === id) || DICE_SKINS[0];
}
export function getPipStyle(id) {
  return PIP_STYLES.find(p => p.id === id) || PIP_STYLES[0];
}
export function getBadge(id) {
  return BADGES.find(b => b.id === id) || null;
}