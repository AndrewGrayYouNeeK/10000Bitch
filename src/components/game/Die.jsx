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
  const isObsidian = skinId === "obsidian";

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
        "relative flex-shrink-0 transition-all duration-200 border",
        !isObsidian && "rounded-2xl bg-gradient-to-br",
        !isObsidian && skin.gradient,
        isObsidian ? "border-black/80" : skin.border,
        skin.glow && `shadow-xl ${skin.glow}`,
        used && "opacity-20 grayscale cursor-not-allowed",
        held && !used && "ring-[5px] ring-amber-300 shadow-2xl shadow-amber-400/80 brightness-110",
        selected && !used && !held && "ring-4 ring-emerald-300/60 shadow-lg shadow-emerald-500/40"
      )}
      style={{
        width: size,
        height: size,
        transform: "perspective(300px) rotateX(15deg) rotateY(-10deg)",
        borderRadius: isObsidian ? "30%" : undefined,
        background: isObsidian
          ? "radial-gradient(ellipse 80% 70% at 35% 30%, #2a3358 0%, #0d1024 25%, #050509 60%, #000000 100%)"
          : undefined,
        boxShadow: used
          ? "inset 0 -4px 6px rgba(0,0,0,0.1)"
          : isObsidian
            ? [
                "inset 0 -14px 22px rgba(0,0,0,0.95)",
                "inset 0 10px 16px rgba(120,150,230,0.45)",
                "inset 8px 0 14px rgba(30,50,120,0.4)",
                "inset -6px 0 12px rgba(60,80,160,0.25)",
                "inset 0 0 30px rgba(0,0,0,0.6)",
                "0 14px 24px rgba(0,0,0,0.85)",
                "0 4px 8px rgba(0,0,0,0.6)",
              ].join(", ")
            : "inset 0 -6px 10px rgba(0,0,0,0.25), inset 0 4px 6px rgba(255,255,255,0.5), 0 8px 14px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute inset-[14%] grid grid-cols-3 grid-rows-3"
        style={{ gap: size * 0.04, zIndex: 2 }}
      >
        {layout.map((p, i) => (
          <div key={i} className="flex items-center justify-center">
            {p === 1 && (
              isObsidian ? (
                <div
                  className="rounded-full"
                  style={{
                    width: size * 0.2,
                    height: size * 0.2,
                    background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #f0f0f0 40%, #b8b8b8 100%)",
                    boxShadow: "inset -1px -2px 3px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.6)",
                  }}
                />
              ) : (
                <Pip
                  shape={pipStyle.shape}
                  size={size * 0.18}
                  colorClass={skin.pipColor}
                />
              )
            )}
          </div>
        ))}
      </div>

      {/* Glossy highlight */}
      {!isObsidian && (
        <div
          className="absolute top-1 left-1 right-1 h-1/3 rounded-t-2xl pointer-events-none opacity-50"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)",
          }}
        />
      )}

      {/* Obsidian: layered glossy reflections */}
      {isObsidian && (
        <>
          {/* Soft top sheen */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "4%", left: "8%", right: "8%", height: "38%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 0%, rgba(160,185,245,0.55) 0%, rgba(80,110,200,0.2) 40%, transparent 75%)",
              filter: "blur(3px)",
            }}
          />
          {/* Sharp specular hotspot */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "10%", left: "18%",
              width: "30%", height: "16%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.95) 0%, rgba(220,230,255,0.5) 30%, transparent 70%)",
              filter: "blur(1px)",
            }}
          />
          {/* Tiny pinpoint highlight */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "14%", left: "26%",
              width: "10%", height: "5%",
              borderRadius: "50%",
              background: "rgba(255,255,255,1)",
              filter: "blur(0.5px)",
            }}
          />
          {/* Bottom-right cool blue rim reflection */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "8%", right: "10%",
              width: "45%", height: "25%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(70,100,180,0.4) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </>
      )}

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