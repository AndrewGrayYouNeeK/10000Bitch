import React from "react";
import { motion } from "framer-motion";
import { PIP_LAYOUTS } from "@/lib/diceAssets";
import { cn } from "@/lib/utils";

/**
 * 3D-styled die rendered with CSS. Shows the given `value` face.
 * States: held (locked in current selection), selected (picking this roll), used (already banked).
 */
export default function Die({ value = 1, held = false, selected = false, used = false, rolling = false, onClick, size = 64 }) {
  const layout = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={used || rolling}
      initial={false}
      animate={rolling ? { rotate: [0, 360, 720, 1080], y: [0, -20, 0, -10, 0] } : { rotate: 0, y: 0 }}
      transition={rolling ? { duration: 0.6, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 20 }}
      whileTap={!used && !rolling ? { scale: 0.92 } : {}}
      whileHover={!used && !rolling ? { y: -4 } : {}}
      className={cn(
        "relative rounded-2xl flex-shrink-0 transition-all duration-200",
        "bg-gradient-to-br from-white via-slate-50 to-slate-200",
        "border-2",
        used && "opacity-20 grayscale cursor-not-allowed",
        held && !used && "border-amber-400 ring-4 ring-amber-300/60 shadow-lg shadow-amber-500/40",
        selected && !used && !held && "border-emerald-400 ring-4 ring-emerald-300/60 shadow-lg shadow-emerald-500/40",
        !held && !selected && !used && "border-slate-300 shadow-md",
      )}
      style={{
        width: size,
        height: size,
        transform: "perspective(300px) rotateX(15deg) rotateY(-10deg)",
        boxShadow: used
          ? "inset 0 -4px 6px rgba(0,0,0,0.1)"
          : "inset 0 -6px 10px rgba(0,0,0,0.15), inset 0 4px 6px rgba(255,255,255,0.8), 0 6px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="absolute inset-[12%] grid grid-cols-3 grid-rows-3"
        style={{ gap: size * 0.04 }}
      >
        {layout.map((p, i) => (
          <div key={i} className="flex items-center justify-center">
            {p === 1 && (
              <div
                className="rounded-full bg-slate-900"
                style={{
                  width: size * 0.16,
                  height: size * 0.16,
                  boxShadow: "inset 0 2px 3px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.1)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Glossy highlight */}
      <div
        className="absolute top-1 left-1 right-1 h-1/3 rounded-t-2xl pointer-events-none opacity-60"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)",
        }}
      />
    </motion.button>
  );
}