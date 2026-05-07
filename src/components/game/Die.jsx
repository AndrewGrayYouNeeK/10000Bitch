import React from "react";
import { motion } from "framer-motion";
import { PIP_LAYOUTS } from "@/lib/diceAssets";
import { getSkin, getPipStyle } from "@/lib/shopCatalog";
import Pip from "./Pip";
import { cn } from "@/lib/utils";

/**
 * 3D-styled die rendered with CSS. Shows the given `value` face.
 * States: held (locked in current selection), selected (picking this roll), used (already banked).
 * Accepts `skinId` and `pipsId` to dynamically style the die from the shop catalog.
 */
export default function Die({
  value = 1,
  held = false,
  selected = false,
  used = false,
  rolling = false,
  onClick,
  size = 64,
  skinId = "classic_white",
  pipsId = "classic_dots",
}) {
  const layout = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const skin = getSkin(skinId);
  const pipStyle = getPipStyle(pipsId);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={used || rolling}
      initial={false}
      animate={
        rolling
          ? {
              rotate: [0, 180, 540, 900, 1080],
              y: [0, -30, -10, -20, 0],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }
          : held && !used
            ? { rotate: 0, y: -10, scale: 1.08 }
            : { rotate: 0, y: 0, scale: 1 }
      }
      transition={
        rolling
          ? { duration: 0.7, ease: "easeOut" }
          : { type: "spring", stiffness: 300, damping: 18 }
      }
      whileTap={!used && !rolling ? { scale: 0.92 } : {}}
      whileHover={!used && !rolling ? { y: -5, rotate: 3 } : {}}
      className={cn(
        "relative rounded-2xl flex-shrink-0 transition-all duration-200 border-2 overflow-hidden",
        !skin.image && "bg-gradient-to-br",
        !skin.image && skin.gradient,
        skin.border,
        skin.glow && `shadow-xl ${skin.glow}`,
        used && "opacity-20 grayscale cursor-not-allowed",
        held && !used && "ring-[5px] ring-amber-300 shadow-2xl shadow-amber-400/80 brightness-110",
        selected && !used && !held && "ring-4 ring-emerald-300/60 shadow-lg shadow-emerald-500/40"
      )}
      style={{
        width: size,
        height: size,
        transform: "perspective(300px) rotateX(15deg) rotateY(-10deg)",
        boxShadow: used
          ? "inset 0 -4px 6px rgba(0,0,0,0.1)"
          : "inset 0 -6px 10px rgba(0,0,0,0.25), inset 0 4px 6px rgba(255,255,255,0.5), 0 8px 14px rgba(0,0,0,0.4)",
      }}
    >
      {skin.image && (
        <img
          src={skin.image}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: "20% 30%" }}
        />
      )}
      <div
        className="absolute inset-[12%] grid grid-cols-3 grid-rows-3"
        style={{ gap: size * 0.04 }}
      >
        {layout.map((p, i) => (
          <div key={i} className="flex items-center justify-center">
            {p === 1 && (
              <Pip
                shape={pipStyle.shape}
                size={size * 0.18}
                colorClass={skin.pipColor}
              />
            )}
          </div>
        ))}
      </div>

      {/* Glossy highlight */}
      <div
        className="absolute top-1 left-1 right-1 h-1/3 rounded-t-2xl pointer-events-none opacity-50"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)",
        }}
      />

      {/* Selected (held) indicator — pulsing glow + checkmark badge */}
      {held && !used && (
        <>
          <motion.div
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 20px 4px rgba(252, 211, 77, 0.9), inset 0 0 12px rgba(252, 211, 77, 0.5)",
              borderRadius: "1rem",
            }}
          />
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-black font-black text-xs shadow-lg pointer-events-none"
          >
            ✓
          </motion.div>
        </>
      )}

      {/* Diamond facets + shimmer overlay */}
      {skin.special === "diamond" && (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-80 mix-blend-overlay"
            style={{
              background:
                "conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.9) 0deg, rgba(186,230,253,0.2) 60deg, rgba(255,255,255,0.8) 120deg, rgba(125,211,252,0.3) 180deg, rgba(255,255,255,0.9) 240deg, rgba(186,230,253,0.2) 300deg, rgba(255,255,255,0.9) 360deg)",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(186,230,253,0.7) 0%, transparent 35%)",
            }}
          />
        </>
      )}
    </motion.button>
  );
}