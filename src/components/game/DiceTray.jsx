import React from "react";
import Die from "./Die";
import { motion } from "framer-motion";
import { getFelt } from "@/lib/shopCatalog";

/**
 * Visual tray for the 6 dice. Rendered on a felt surface whose color is controlled by `feltId`.
 * dice: array of { id, value, used (banked), held (in active selection) }
 */
export default function DiceTray({ dice, rolling, onToggle, disabled, skinId, pipsId, feltId = "classic_green" }) {
  const felt = getFelt(feltId);
  return (
    <div
      className={`relative rounded-3xl p-6 overflow-hidden border-4 ${felt.border}`}
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${felt.inner} 0%, ${felt.mid} 45%, ${felt.outer} 95%)`,
        boxShadow:
          "inset 0 4px 12px rgba(255,255,255,0.06)",
      }}
    >
      {/* Photographic felt texture (when provided) — layered behind procedural grain */}
      {felt.textureUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${felt.textureUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "soft-light",
            opacity: 0.5,
          }}
        />
      )}
      {/* Fine fiber strands — two crossing directions */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `
            repeating-linear-gradient(43deg, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 0.5px, transparent 0.5px, transparent 2px),
            repeating-linear-gradient(137deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 0.5px, transparent 0.5px, transparent 2.5px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)
          `,
        }}
      />

      {/* Wool-fuzz speckle noise */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-soft-light"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 18%, rgba(255,255,255,0.15) 0.5px, transparent 1px),
            radial-gradient(circle at 38% 62%, rgba(0,0,0,0.2) 0.5px, transparent 1px),
            radial-gradient(circle at 71% 31%, rgba(255,255,255,0.1) 0.5px, transparent 1px),
            radial-gradient(circle at 87% 78%, rgba(0,0,0,0.18) 0.5px, transparent 1px),
            radial-gradient(circle at 24% 89%, rgba(255,255,255,0.12) 0.5px, transparent 1px),
            radial-gradient(circle at 56% 14%, rgba(0,0,0,0.15) 0.5px, transparent 1px)
          `,
          backgroundSize: "7px 7px, 9px 9px, 11px 11px, 6px 6px, 8px 8px, 10px 10px",
        }}
      />

      {/* Fine fabric grain — high-frequency SVG noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
          )}")`,
          backgroundSize: "160px 160px",
        }}
      />

      <div className="relative grid grid-cols-3 gap-3 justify-items-center sm:grid-cols-6">
        {dice.map((d, idx) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Die
              value={d.value}
              held={d.held}
              used={d.used}
              rolling={rolling && !d.used}
              onClick={() => !disabled && !d.used && onToggle && onToggle(d.id)}
              size={100}
              skinId={skinId}
              pipsId={pipsId}
              bigFishVariantIndex={[7, 1, 6, 3, 1, 4][idx]}
              bigFishExtraScale={idx === 0 ? 2.1 : idx === 4 ? 2.0 : 1.15}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}