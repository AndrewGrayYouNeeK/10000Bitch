// Static catalog of all purchasable cosmetics.
// Skins describe the die body. Pips describe the dots. Badges describe an animated player badge.

export const DICE_SKINS = [
  {
    id: "classic_white",
    name: "Classic White",
    price: 0,
    gradient: "from-white via-white to-gray-100",
    border: "border-gray-200",
    pipColor: "bg-gray-900",
    glow: "",
    description: "The original. Timeless.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/e3c042b9e_hPLMjJ1wVsJG0mW-UisgC_GgpVeRAE.png",
  },
  {
    id: "obsidian",
    name: "Damascus",
    price: 150,
    gradient: "from-slate-700 via-slate-800 to-black",
    border: "border-slate-900",
    pipColor: "bg-white",
    glow: "shadow-black/60",
    description: "Forged steel patterns.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/0aba8ef3e_3WGKngcFo6eWV9kOIGywM_0CERzNWO.png",
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
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/631ed04d0_LZmPx9m7bqJyACwXQcfNu_Lwtd1VVk.png",
  },
  {
    id: "gold",
    name: "Molten Gold",
    price: 500,
    gradient: "from-yellow-200 via-amber-400 to-yellow-600",
    border: "border-amber-700",
    pipColor: "bg-slate-900",
    glow: "shadow-amber-400/70",
    description: "Liquid gold, poured and set.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/cb5c77d90_WxvYf9qjMiU_V3CHnTzs-_DUPg67v2.png",
  },
  {
    id: "ice",
    name: "Frozen Ice",
    price: 350,
    gradient: "from-cyan-100 via-sky-300 to-blue-500",
    border: "border-sky-400",
    pipColor: "bg-white",
    glow: "shadow-sky-300/70",
    description: "Carved from a glacier.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/e66ae9a18_WKqr8v-gNKNdg_505xf6y_K3ZiqoBX.png",
  },
  {
    id: "wood",
    name: "Burl Wood",
    price: 300,
    gradient: "from-amber-700 via-amber-800 to-amber-950",
    border: "border-amber-950",
    pipColor: "bg-amber-950",
    glow: "shadow-amber-900/60",
    description: "Old-school heirloom.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/228200ce8_ATRoh-oyklhfyDNGiNUns_8aPlZmR3.png",
  },
  {
    id: "silver",
    name: "Chrome Silver",
    price: 550,
    gradient: "from-slate-200 via-slate-400 to-slate-600",
    border: "border-slate-500",
    pipColor: "bg-slate-900",
    glow: "shadow-slate-400/70",
    description: "Polished to a mirror finish.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/b736d9909_XLGcJr6bRUs-pTA6-8I3W_BSiKR6Eb.png",
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
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/49f5502e7_qT4RfNfgMat_WgdmZ9UA-_0jGTKBXb.png",
  },
  {
    id: "dragon_scale",
    name: "Dragon Scale",
    price: 700,
    gradient: "from-teal-300 via-emerald-400 to-cyan-600",
    border: "border-emerald-700",
    pipColor: "bg-slate-900",
    glow: "shadow-emerald-400/70",
    description: "Iridescent dragon hide.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/0b8e61811_XeN1JIPeKj6ML7YQ3gk99_VqSR7BSl.png",
  },
  {
    id: "marble",
    name: "Gold Vein Marble",
    price: 400,
    gradient: "from-white via-stone-100 to-stone-200",
    border: "border-stone-300",
    pipColor: "bg-stone-600",
    glow: "shadow-amber-200/60",
    description: "Carrara with gold veins.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/9c8cefc58_vbPLonMl2TZqQp7Ev03Qo_X5WNso8c.png",
  },
  {
    id: "amethyst",
    name: "Amethyst",
    price: 400,
    gradient: "from-purple-300 via-purple-500 to-purple-800",
    border: "border-purple-900",
    pipColor: "bg-white",
    glow: "shadow-purple-500/60",
    description: "Royal crystal.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/7b99943e9_387TtzBbla0juqzqDSGfg_FgHZypft.png",
  },
  {
    id: "moonstone",
    name: "Moonstone",
    price: 450,
    gradient: "from-slate-100 via-blue-100 to-indigo-200",
    border: "border-indigo-200",
    pipColor: "bg-slate-400",
    glow: "shadow-indigo-200/70",
    description: "Iridescent shimmer.",
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/09a488969_Ub3rBdwrMd_RZcipohKxd_EQnQspfS1.png",
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
    realistic: true,
    spriteUrl: "https://media.base44.com/images/public/69e7669b223d37093cd03879/d21426962_XCSnTqF8nVT8rvkZYlH5g_BYlXoewC.png",
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

/**
 * Returns inline styles to crop the correct face from a skin's sprite sheet.
 * Assumes the sprite sheet is a 3-column × 2-row grid of faces (values 1–6).
 */
export function getSpriteStyle(skin, value, size) {
  if (!skin?.spriteUrl) return null;
  const cols = skin.spriteGrid?.cols ?? 3;
  const rows = skin.spriteGrid?.rows ?? 2;
  const col = (value - 1) % cols;
  const row = Math.floor((value - 1) / cols);
  return {
    backgroundImage: `url(${skin.spriteUrl})`,
    backgroundSize: `${size * cols}px ${size * rows}px`,
    backgroundPosition: `${-(col * size)}px ${-(row * size)}px`,
    backgroundRepeat: 'no-repeat',
  };
}