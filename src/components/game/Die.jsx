import React, { useRef } from "react";
import { motion } from "framer-motion";
import { getSkin, getPipStyle, getSpriteStyle } from "@/lib/shopCatalog";
import Pip from "./Pip";
import LightningOverlay from "./LightningOverlay";

// Pip grid positions for each face value.
// Grid is 3x3. 1 = pip present, 0 = empty.
const PIP_LAYOUTS = {
  1: [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]],

  2: [
  [1, 0, 0],
  [0, 0, 0],
  [0, 0, 1]],

  3: [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]],

  4: [
  [1, 0, 1],
  [0, 0, 0],
  [1, 0, 1]],

  5: [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1]],

  6: [
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1]]

};

function useRollVariants() {
  const ref = React.useRef(null);
  if (!ref.current) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    const spins = (3 + Math.floor(Math.random() * 3)) * 360 * dir;
    const bounceH = 18 + Math.random() * 28;
    ref.current = {
      rotate: [0, spins * 0.3, spins * 0.6, spins * 0.85, spins * 0.95, spins],
      y: [0, -bounceH, -bounceH * 0.4, -bounceH * 0.6, -bounceH * 0.15, 0],
      x: [0, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, 0, 0],
      scale: [1, 1.15, 1.05, 1.1, 0.97, 1]
    };
  }
  return ref.current;
}

export default function Die({
  value = 1,
  held = false,
  selected = false,
  used = false,
  rolling = false,
  onClick,
  size = 64,
  skinId = "classic_white",
  pipsId = "classic_dots"
}) {
  const layout = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const skin = getSkin(skinId);
  const rollVariants = useRollVariants();

  const rollKey = React.useRef(0);
  const wasRolling = React.useRef(false);
  if (rolling && !wasRolling.current) {
    rollKey.current += 1;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const spins = (3 + Math.floor(Math.random() * 3)) * 360 * dir;
    const bounceH = 18 + Math.random() * 28;
    rollVariants.rotate = [0, spins * 0.3, spins * 0.65, spins * 0.88, spins * 0.97, spins];
    rollVariants.y = [0, -bounceH, -bounceH * 0.35, -bounceH * 0.55, -bounceH * 0.12, 0];
    rollVariants.x = [0, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, 0, 0];
    rollVariants.scale = [1, 1.18, 1.06, 1.12, 0.96, 1];
  }
  wasRolling.current = rolling;

  // Standard dice corner radius
  const radius = Math.round(size * 0.06);

  // Squircle mask — bows the edges outward between the corners like a real die.
  // b = bulge amount (fraction of size that the midpoint of each edge extends past the square)
  const b = 0.04;
  const vb = `${-b} ${-b} ${1 + 2 * b} ${1 + 2 * b}`;
  const cr = 0.08; // corner radius in path units
  const squirclePath = `M ${cr},0 L ${1 - cr},0 Q ${1 + b},${0.5} ${1 - cr},1 L ${cr},1 Q ${-b},${0.5} ${cr},0 Z`
    .replace(`L ${1 - cr},0 Q`, `L ${1 - cr},0 Q ${1 + b * 0.3},${-b * 0.3} ${1},${cr} L ${1},${1 - cr} Q`)
    .replace(`L ${cr},1 Q`, `L ${cr},1 Q ${-b * 0.3},${1 + b * 0.3} ${0},${1 - cr} L ${0},${cr} Q`);
  const squircleSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb}' preserveAspectRatio='none'><path d='M ${cr} 0 Q ${0.5} ${-b} ${1 - cr} 0 Q 1 0 1 ${cr} Q ${1 + b} ${0.5} 1 ${1 - cr} Q 1 1 ${1 - cr} 1 Q ${0.5} ${1 + b} ${cr} 1 Q 0 1 0 ${1 - cr} Q ${-b} ${0.5} 0 ${cr} Q 0 0 ${cr} 0 Z' fill='black'/></svg>`;
  const squircleMaskUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(squircleSvg)}")`;
  const squircleStyle = {
    WebkitMaskImage: squircleMaskUrl,
    maskImage: squircleMaskUrl,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };

  // Pip size scales nicely with die size
  const pipSize = Math.round(size * 0.145);

  // Padding inside die before the pip grid
  const padding = Math.round(size * 0.13);

  // The 3D box shadow: top-left highlight, bottom-right shadow, drop shadow
  const buildShadow = () => {
    const base = skin.realistic ?
    [
    `inset 0 ${size * 0.05}px ${size * 0.12}px rgba(255,255,255,0.95)`, // top highlight
    `inset ${size * 0.04}px 0 ${size * 0.08}px rgba(255,255,255,0.7)`, // left highlight
    `inset 0 -${size * 0.06}px ${size * 0.12}px rgba(190,190,205,0.55)`, // bottom shadow
    `inset -${size * 0.04}px 0 ${size * 0.08}px rgba(180,180,195,0.35)`, // right shadow
    `0 ${size * 0.08}px ${size * 0.25}px rgba(0,0,0,0.38)`, // drop shadow
    `0 ${size * 0.02}px ${size * 0.06}px rgba(0,0,0,0.22)`, // close shadow
    `0 0 0 1.5px rgba(150,150,165,0.4)` // subtle border
    ].join(", ") :
    [
    `inset 0 -${size * 0.06}px ${size * 0.1}px rgba(0,0,0,0.25)`,
    `inset 0 ${size * 0.04}px ${size * 0.06}px rgba(255,255,255,0.5)`,
    `0 ${size * 0.08}px ${size * 0.14}px rgba(0,0,0,0.4)`].
    join(", ");

    if (used) return `inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.12)`;
    if (held) return `${base}, 0 0 0 ${Math.round(size * 0.07)}px #fcd34d, 0 0 ${size * 0.35}px ${size * 0.06}px rgba(252,211,77,0.75)`;
    if (selected) return `${base}, 0 0 0 ${Math.round(size * 0.05)}px rgba(52,211,153,0.6)`;
    return base;
  };

  return (
    <motion.div
      key={rolling ? rollKey.current : "idle"}
      className="flex-shrink-0"
      style={{ width: size, height: size }}
      initial={false}
      animate={
      rolling ?
      { rotate: rollVariants.rotate, y: rollVariants.y, x: rollVariants.x, scale: rollVariants.scale } :
      held && !used ?
      { rotate: 0, y: -10, x: 0, scale: 1.08 } :
      { rotate: 0, y: 0, x: 0, scale: 1 }
      }
      transition={
      rolling ?
      {
        duration: 0.85,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.2, 0.45, 0.65, 0.85, 1]
      } :
      { type: "spring", stiffness: 300, damping: 18 }
      }
      whileTap={!used && !rolling ? { scale: 0.92 } : {}}
      whileHover={!used && !rolling ? { y: -5, rotate: 3 } : {}}>
      
      <button
        type="button"
        onClick={onClick}
        disabled={used || rolling}
        className={`relative w-full h-full ${skin.id !== "classic_white" ? `bg-gradient-to-br ${skin.gradient}` : ""} ${used ? "opacity-20 grayscale cursor-not-allowed" : ""}`}
        style={{
          borderRadius: radius,
          boxShadow: buildShadow(),
          overflow: "hidden",
          background: skin.id === "classic_white" ? "transparent" : undefined,
          ...squircleStyle
        }}>
        
        {/* Video background skin */}
        {skin.videoUrl && (
          <video
            src={skin.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ borderRadius: radius }}
          />
        )}

        {/* Sprite sheet texture or pip grid */}
        {skin.spriteUrl ?
        (() => {
          const cellW = size * 1.7;
          const cellH = size * 1.32;
          const cols = skin.spriteGrid?.cols ?? 3;
          const rows = skin.spriteGrid?.rows ?? 2;
          const col = (value - 1) % cols;
          const row = Math.floor((value - 1) / cols);
          // Per-face nudges (in px) — corrects misaligned sprite cells
          const FACE_X_OFFSET = { 2: -size * 0.015, 3: -size * 0.022, 5: -size * 0.022, 6: -size * 0.032 };
          const FACE_Y_OFFSET = { 4: -size * 0.03, 5: -size * 0.05, 6: -size * 0.035 };
          // Classic White needs slightly different per-face Y tuning
          const CLASSIC_WHITE_Y_OFFSET = { 1: size * 0.012, 2: size * 0.012, 3: size * 0.018, 4: -size * 0.045, 6: -size * 0.05 };
          // Gold needs slightly different per-face Y tuning
          const GOLD_Y_OFFSET = { 5: -size * 0.03 };
          // Damascus (obsidian) per-face Y tuning
          const OBSIDIAN_Y_OFFSET = { 5: -size * 0.03 };
          // Burl Wood per-face tuning
          const WOOD_Y_OFFSET = { 1: -size * 0.02, 2: -size * 0.02, 3: -size * 0.025, 5: -size * 0.035, 6: -size * 0.02 };
          const WOOD_X_OFFSET = { 3: size * 0.02, 5: size * 0.02, 6: size * 0.02 };
          const SILVER_X_OFFSET = { 1: size * 0.02, 2: size * 0.02, 3: size * 0.02, 4: size * 0.02, 5: size * 0.02, 6: size * 0.02 };
          const GALAXY_X_OFFSET = { 3: size * 0.025, 6: size * 0.015 };
          const DRAGON_X_OFFSET = { 2: size * 0.015, 3: size * 0.015, 5: size * 0.01, 6: size * 0.015 };
          const MARBLE_X_OFFSET = { 1: size * 0.01, 2: size * 0.015, 3: size * 0.005, 4: size * 0.012, 5: size * 0.005, 6: size * 0.015 };
          const AMETHYST_X_OFFSET = { 2: size * 0.015, 3: -size * 0.005, 6: size * 0.015 };
          const LAVA_X_OFFSET = { 2: size * 0.015, 3: size * 0.015, 5: size * 0.015, 6: size * 0.015 };
          const LAVA_Y_OFFSET = { 1: -size * 0.02, 2: -size * 0.02, 3: -size * 0.02, 4: -size * 0.03 };
          const MOONSTONE_X_OFFSET = { 2: size * 0.005, 3: size * 0.005, 4: size * 0.01, 5: size * 0.005, 6: size * 0.005 };
          const MOONSTONE_Y_OFFSET = { 1: -size * 0.005, 2: -size * 0.01, 3: -size * 0.0075, 4: -size * 0.022, 5: -size * 0.022, 6: -size * 0.022 };
          const MARBLE_Y_OFFSET = { 1: -size * 0.005, 2: -size * 0.01, 3: -size * 0.005, 4: -size * 0.019, 5: -size * 0.015, 6: -size * 0.015 };
          const SILVER_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.015 };
          const GALAXY_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.015 };
          const DRAGON_Y_OFFSET = { 5: -size * 0.005 };
          const AMETHYST_Y_OFFSET = { 1: -size * 0.025, 2: -size * 0.025, 3: -size * 0.025, 4: -size * 0.035, 5: -size * 0.035, 6: -size * 0.035 };
          const PLASMA_X_OFFSET = { 1: -size * 0.02, 2: -size * 0.06, 3: -size * 0.11, 4: -size * 0.02, 5: -size * 0.07, 6: -size * 0.12 };
          const PLASMA_Y_OFFSET = { 1: size * 0.04, 2: size * 0.02, 3: size * 0.02, 4: -size * 0.06, 6: -size * 0.045 };
          const xNudge = skin.id === "wood"
            ? (WOOD_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "silver"
            ? (SILVER_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "galaxy"
            ? (GALAXY_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "dragon_scale"
            ? (DRAGON_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "marble"
            ? (MARBLE_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "amethyst"
            ? (AMETHYST_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "moonstone"
            ? (MOONSTONE_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "lava"
            ? (LAVA_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "plasma"
            ? (PLASMA_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : (FACE_X_OFFSET[value] || 0);
          const yNudge = skin.id === "classic_white"
            ? (CLASSIC_WHITE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "gold"
            ? (GOLD_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "obsidian"
            ? (OBSIDIAN_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "wood"
            ? (WOOD_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "silver"
            ? (SILVER_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "galaxy"
            ? (GALAXY_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "dragon_scale"
            ? (DRAGON_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "marble"
            ? (MARBLE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "amethyst"
            ? (AMETHYST_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "moonstone"
            ? (MOONSTONE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "lava"
            ? (LAVA_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "plasma"
            ? (PLASMA_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : (FACE_Y_OFFSET[value] || 0);
          return (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${-size * 0.14 + yNudge}px`,
                bottom: `${-size * 0.8 + yNudge}px`,
                left: `${-size * 0.35 + xNudge}px`,
                right: `${-size * 0.35 + xNudge}px`,
                borderRadius: radius,
                backgroundImage: `url(${skin.spriteUrl})`,
                backgroundSize: `${cellW * cols}px ${cellH * rows}px`,
                backgroundPosition: `${-(col * cellW)}px ${-(row * cellH)}px`,
                backgroundRepeat: 'no-repeat',
              }} />
          );
        })() :


        <div
          className="absolute grid grid-cols-3 grid-rows-3"
          style={{ inset: padding, gap: Math.round(size * 0.045) }}>
          
            {layout.flat().map((p, i) => {
              // For the Diamond skin, cycle pip animations: glow → shinyStar → blackHole
              const diamondEffects = ["glow", "shinyStar", "blackHole"];
              const effect = skin.id === "diamond" ? diamondEffects[i % 3] : null;
              return (
                <div key={i} className="flex items-center justify-center">
                  {p === 1 && (
                    <Pip
                      size={pipSize}
                      colorClass={skin.pipColor}
                      inset={skin.realistic}
                      animationEffect={effect}
                    />
                  )}
                </div>
              );
            })}
          </div>
        }

        {/* Top-left gloss highlight — only for non-photo skins */}
        {skin.realistic && skin.id !== "classic_white" && skin.id !== "classic_white" &&
        <div
          className="absolute pointer-events-none"
          style={{
            top: "5%",
            left: "5%",
            width: "48%",
            height: "42%",
            borderRadius: `${radius}px ${radius * 0.6}px ${radius * 0.3}px ${radius * 0.6}px`,
            background:
            "radial-gradient(ellipse at 28% 28%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)"
          }} />

        }

        {/* Corner shadow vignette — darkens the corners to hide tray bleed-through */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: radius,
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 85%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* Diamond shimmer overlay */}
        {skin.special === "diamond" &&
        <>
            <div
            className="absolute inset-0 pointer-events-none opacity-80 mix-blend-overlay"
            style={{
              borderRadius: radius,
              background:
              "conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.9) 0deg, rgba(186,230,253,0.2) 60deg, rgba(255,255,255,0.8) 120deg, rgba(125,211,252,0.3) 180deg, rgba(255,255,255,0.9) 240deg, rgba(186,230,253,0.2) 300deg, rgba(255,255,255,0.9) 360deg)"
            }} />
          
            <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              borderRadius: radius,
              background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(186,230,253,0.7) 0%, transparent 35%)"
            }} />
          
          </>
        }

        {/* Held indicator — pulsing amber glow + checkmark */}
        {held && !used &&
        <>
            <motion.div
            className="absolute -inset-1 pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 20px 4px rgba(252,211,77,0.9), inset 0 0 12px rgba(252,211,77,0.5)",
              borderRadius: radius + 4
            }} />
          
            <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-black font-black text-xs shadow-lg pointer-events-none">
            
              ✓
            </motion.div>
          </>
        }
      </button>
    </motion.div>);

}