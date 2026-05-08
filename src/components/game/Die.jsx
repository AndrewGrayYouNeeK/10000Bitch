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

  const baseShadow = skin.realistic
    ? "inset 0 3px 8px rgba(255,255,255,1), inset 0 -4px 10px rgba(200,200,210,0.6), inset 3px 0 8px rgba(255,255,255,0.8), inset -3px 0 6px rgba(180,180,190,0.3), 0 6px 20px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2)"
    : "inset 0 -6px 10px rgba(0,0,0,0.25), inset 0 4px 6px rgba(255,255,255,0.5), 0 8px 14px rgba(0,0,0,0.4)";

  const boxShadow = used
    ? "inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.15)"
    : held
      ? `${baseShadow}, 0 0 0 5px #fcd34d, 0 0 24px 4px rgba(252,211,77,0.8)`
      : selected
        ? `${baseShadow}, 0 0 0 4px rgba(52,211,153,0.6)`
        : baseShadow;

  return (
    <motion.div
      className="flex-shrink-0"
      style={{ width: size, height: size }}
      initial={false}
      animate={
        rolling
          ? { rotate: [0, 180, 540, 900, 1080], y: [0, -30, -10, -20, 0], scale: [1, 1.1, 0.95, 1.05, 1] }
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
    >
    <button
      type="button"
      onClick={onClick}
      disabled={used || rolling}
      className={cn(
        "relative w-full h-full bg-gradient-to-br",
        skin.gradient,
        used && "opacity-20 grayscale cursor-not-allowed",
      )}
      style={{
        borderRadius: Math.round(size * 0.15),
        boxShadow: boxShadow + (skin.realistic ? ", 0 0 0 1.5px rgba(160,160,175,0.45)" : ""),
      }}
    >
      <div
        className="absolute inset-[12%] grid grid-cols-3 grid-rows-3"
        style={{ gap: size * 0.04 }}
      >
        {layout.map((p, i) => (
          <div key={i} className="flex items-center justify-center">
            {p === 1 && (
              <Pip
                shape={pipStyle.shape}
                size={skin.realistic ? size * 0.21 : size * 0.18}
                colorClass={skin.pipColor}
                inset={skin.realistic}
              />
            )}
          </div>
        ))}
      </div>

      {/* Subtle top-left gloss for realism */}
      {skin.realistic && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "6%", left: "6%", right: "30%", bottom: "55%",
            borderRadius: size * 0.22,
            background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Selected (held) indicator — pulsing glow + checkmark badge */}
      {held && !used && (
        <>
          <motion.div
            className="absolute -inset-1 pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 20px 4px rgba(252, 211, 77, 0.9), inset 0 0 12px rgba(252, 211, 77, 0.5)",
              borderRadius: Math.round(size * 0.17),
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
    </button>
    </motion.div>
  );
}