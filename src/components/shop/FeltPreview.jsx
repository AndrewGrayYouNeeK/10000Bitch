import React from "react";

/**
 * Small swatch preview of a felt color used in the shop card.
 * Mirrors the DiceTray surface treatment in miniature.
 */
export default function FeltPreview({ felt }) {
  if (!felt) return null;
  return (
    <div
      className="relative w-32 h-20 rounded-xl overflow-hidden border-2 border-amber-900/70"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${felt.inner} 0%, ${felt.mid} 45%, ${felt.outer} 95%)`,
        boxShadow:
          "inset 0 0 18px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,255,255,0.06)",
      }}
    >
      {/* Fiber strands */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `
            repeating-linear-gradient(43deg, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 0.5px, transparent 0.5px, transparent 2px),
            repeating-linear-gradient(137deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 0.5px, transparent 0.5px, transparent 2.5px)
          `,
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}