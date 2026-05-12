import React from "react";
import { motion } from "framer-motion";

/**
 * Electric / lightning overlay that crackles across a die face.
 * Renders inside the die button (absolute positioned). Pure SVG + framer-motion.
 */
export default function LightningOverlay({ size = 64, radius = 4 }) {
  // A few jagged lightning bolt paths drawn in a 100x100 viewBox
  const bolts = [
    "M20 5 L40 35 L25 45 L55 95 L40 55 L60 50 L45 5 Z",
    "M75 8 L55 40 L70 48 L40 95 L60 55 L42 50 L62 8 Z",
    "M10 50 L35 55 L25 70 L55 60 L48 80 L80 65",
    "M90 20 L65 35 L78 45 L50 60 L70 70 L40 90",
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: radius }}
    >
      {/* Electric blue glow halo */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.4, 0.9, 0.5, 1, 0.6] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(125,211,252,0.45) 0%, rgba(59,130,246,0.25) 40%, transparent 75%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Lightning bolts — flickering on/off rapidly */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 0 3px #7dd3fc) drop-shadow(0 0 6px #38bdf8)" }}
      >
        {bolts.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="white"
            stroke="#bae6fd"
            strokeWidth="0.6"
            animate={{ opacity: [0, 1, 0, 0.8, 0, 1, 0] }}
            transition={{
              duration: 0.5 + i * 0.08,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.07,
            }}
          />
        ))}
      </svg>

      {/* Flash bursts */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0, 0, 0.6, 0, 0, 0.4, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{ background: "white", mixBlendMode: "overlay" }}
      />
    </div>
  );
}