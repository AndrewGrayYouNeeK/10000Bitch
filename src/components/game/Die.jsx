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

  const buildShadow = () => {
    if (used) return "none";
    if (held) return `0 0 0 ${Math.round(size * 0.07)}px #fcd34d`;
    if (selected) return `0 0 0 ${Math.round(size * 0.05)}px rgba(52,211,153,0.6)`;
    return "none";
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
            style={{ borderRadius: radius, transform: `translateY(${size * 0.5}px) scale(7)`, transformOrigin: "center" }}
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
          const FACE_Y_OFFSET = { 1: -size * 0.01, 2: -size * 0.01, 3: -size * 0.01, 4: -size * 0.04, 5: -size * 0.05, 6: -size * 0.045 };
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
          const GALAXY_X_OFFSET = { 3: size * 0.025, 5: size * 0.02, 6: size * 0.015 };
          const DRAGON_X_OFFSET = { 2: size * 0.015, 3: size * 0.015, 5: size * 0.01, 6: size * 0.015 };
          const AMETHYST_X_OFFSET = { 2: size * 0.015, 3: -size * 0.005, 6: size * 0.015 };
          const LAVA_X_OFFSET = { 2: size * 0.015, 3: size * 0.015, 5: size * 0.015, 6: size * 0.015 };
          const LAVA_Y_OFFSET = { 1: -size * 0.02, 2: -size * 0.02, 3: -size * 0.02, 4: -size * 0.03 };
          const MOONSTONE_X_OFFSET = { 1: size * 0.03, 2: size * 0.035, 3: size * 0.035, 4: size * 0.04, 5: size * 0.035, 6: size * 0.035 };
          const MOONSTONE_Y_OFFSET = { 1: size * 0.01, 2: size * 0.005, 3: size * 0.0075, 4: size * 0.003, 5: size * 0.003, 6: size * 0.003 };
          const SILVER_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.015 };
          const GALAXY_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.015 };
          const DRAGON_Y_OFFSET = { 5: -size * 0.025 };
          const AMETHYST_Y_OFFSET = { 1: -size * 0.025, 2: -size * 0.025, 3: -size * 0.025, 4: -size * 0.035, 5: -size * 0.035, 6: -size * 0.035 };
          const PLASMA_X_OFFSET = { 1: -size * 0.02, 2: -size * 0.06, 3: -size * 0.11, 4: -size * 0.02, 5: -size * 0.07, 6: -size * 0.12 };
          const PLASMA_Y_OFFSET = { 1: size * 0.04, 2: size * 0.02, 3: size * 0.02, 4: -size * 0.06, 6: -size * 0.045 };
          const PAPER_X_OFFSET = { 2: size * 0.01, 3: size * 0.01, 5: size * 0.01, 6: size * 0.01 };
          const PAPER_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.02, 4: -size * 0.04, 5: -size * 0.04, 6: -size * 0.04 };
          const TEAL2_X_OFFSET = { 2: size * 0.01, 3: size * 0.01, 5: size * 0.01, 6: size * 0.01 };
          const TEAL2_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.02, 4: -size * 0.04, 5: -size * 0.04, 6: -size * 0.04 };
          const COPPER2_X_OFFSET = { 2: size * 0.01, 3: size * 0.01, 5: size * 0.01, 6: size * 0.01 };
          const COPPER2_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.02, 4: -size * 0.04, 5: -size * 0.04, 6: -size * 0.04 };
          const LOVE_X_OFFSET = { 2: size * 0.01, 3: size * 0.01, 5: size * 0.01, 6: size * 0.01 };
          const LOVE_Y_OFFSET = { 1: -size * 0.015, 2: -size * 0.015, 3: -size * 0.02, 4: -size * 0.04, 5: -size * 0.04, 6: -size * 0.04 };
          const CRYSTAL_CUT_X_OFFSET = { 2: -size * 0.0925, 3: -size * 0.175, 4: -size * 0.03, 5: -size * 0.105, 6: -size * 0.19 };
          const CRYSTAL_CUT_Y_OFFSET = { 4: -size * 0.06, 5: -size * 0.0525, 6: -size * 0.0525 };
          // Football (leather) per-face tuning
          const LEATHER_X_OFFSET = { 1: -size * 0.01, 2: -size * 0.13, 3: -size * 0.255, 4: -size * 0.025, 5: -size * 0.14, 6: -size * 0.26 };
          const LEATHER_Y_OFFSET = { 1: size * 0.01, 2: size * 0.02, 3: size * 0.035, 4: -size * 0.065, 5: -size * 0.06, 6: -size * 0.07 };
          // Frozen Ice per-face tuning — start with default + half-nudge down on all faces
          const ICE_Y_OFFSET = { 1: -size * 0.005, 2: -size * 0.005, 3: -size * 0.005, 4: -size * 0.035, 5: -size * 0.045, 6: -size * 0.04 };
          const ICE_X_OFFSET = { 3: -size * 0.03, 6: -size * 0.03 };
          // Aquamarine per-face tuning
          const AQUA_X_OFFSET = { 3: -size * 0.03, 4: -size * 0.01, 5: -size * 0.03, 6: -size * 0.04 };
          const AQUA_Y_OFFSET = { 1: 0, 3: size * 0.01, 4: -size * 0.04 };
          // Baseball per-face tuning
          const BASEBALL_X_OFFSET = { 1: -size * 0.03, 2: -size * 0.15, 3: -size * 0.27, 4: -size * 0.02, 5: -size * 0.1, 6: -size * 0.15 };
          const BASEBALL_Y_OFFSET = { 1: size * 0.01, 2: size * 0.01, 3: size * 0.02, 4: -size * 0.02 };
          // Aquamarine Ice per-face tuning
          const AQUA_LIGHT_X_OFFSET = { 1: -size * 0.01, 2: -size * 0.02, 3: size * 0.02, 4: size * 0.03, 5: size * 0.03, 6: size * 0.03 };
          const AQUA_LIGHT_Y_OFFSET = { 1: 0, 2: 0, 3: -size * 0.01, 4: size * 0.01, 5: size * 0.01, 6: 0 };
          const xNudge = skin.id === "wood"
            ? (WOOD_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "silver"
            ? (SILVER_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "galaxy"
            ? (GALAXY_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "dragon_scale"
            ? (DRAGON_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "amethyst"
            ? (AMETHYST_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "moonstone"
            ? (MOONSTONE_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "lava"
            ? (LAVA_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "plasma"
            ? (PLASMA_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "paper"
            ? (PAPER_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "teal_crackle_v2"
            ? (TEAL2_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "copper_v2"
            ? (COPPER2_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "love_is_love"
            ? (LOVE_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "crystal_cut"
            ? (CRYSTAL_CUT_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "leather"
            ? (LEATHER_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "ice"
            ? (ICE_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "aquamarine"
            ? (AQUA_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "baseball"
            ? (BASEBALL_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
            : skin.id === "aquamarine_light"
            ? (AQUA_LIGHT_X_OFFSET[value] ?? (FACE_X_OFFSET[value] || 0))
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
            : skin.id === "amethyst"
            ? (AMETHYST_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "moonstone"
            ? (MOONSTONE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "lava"
            ? (LAVA_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "plasma"
            ? (PLASMA_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "paper"
            ? (PAPER_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "teal_crackle_v2"
            ? (TEAL2_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "copper_v2"
            ? (COPPER2_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "love_is_love"
            ? (LOVE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "crystal_cut"
            ? (CRYSTAL_CUT_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "leather"
            ? (LEATHER_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "ice"
            ? (ICE_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "aquamarine"
            ? (AQUA_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "baseball"
            ? (BASEBALL_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : skin.id === "aquamarine_light"
            ? (AQUA_LIGHT_Y_OFFSET[value] ?? (FACE_Y_OFFSET[value] || 0))
            : (FACE_Y_OFFSET[value] || 0);
          const MOONSTONE_EXTRA_STRETCH = { 3: size * 0.015, 4: size * 0.015, 5: size * 0.015, 6: size * 0.015 };
          const stretch = skin.id === "moonstone" ? size * 0.0375 + (MOONSTONE_EXTRA_STRETCH[value] || 0) : 0;
          return (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${-size * 0.14 + yNudge - stretch}px`,
                bottom: `${-size * 0.8 + yNudge - stretch}px`,
                left: `${-size * 0.35 + xNudge - stretch}px`,
                right: `${-size * 0.35 + xNudge - stretch}px`,
                borderRadius: radius,
                backgroundImage: `url(${skin.spriteUrl})`,
                backgroundSize: `${cellW * cols + stretch * 2}px ${cellH * rows + stretch * 2}px`,
                backgroundPosition: `${-(col * (cellW + stretch * 2 / cols))}px ${-(row * (cellH + stretch * 2 / rows))}px`,
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

        {/* Corner shadow vignette — Chrome Silver only */}
        {skin.id === "silver" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: radius,
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        )}

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
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-black font-black text-xs pointer-events-none">
            
              ✓
            </motion.div>
          </>
        }
      </button>
    </motion.div>);

}