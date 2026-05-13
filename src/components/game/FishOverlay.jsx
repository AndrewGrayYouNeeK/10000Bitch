import React from "react";
import { motion } from "framer-motion";

/**
 * Animated cartoon fish swimming back and forth inside the die.
 * Sits above the die's background but below pips.
 */
export default function FishOverlay({ size, radius }) {
  const fishSize = size * 0.32;
  // Random starting offset so each die's fish is out of sync
  const delay = React.useRef(Math.random() * -4).current;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: radius }}
    >
      {/* Subtle water ripples */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
      />

      {/* Bubbles drifting up */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            width: size * 0.04,
            height: size * 0.04,
            left: `${20 + i * 28}%`,
            bottom: -size * 0.05,
          }}
          animate={{ y: [-0, -size * 1.1], opacity: [0, 0.7, 0] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Swimming fish */}
      <motion.div
        className="absolute"
        style={{
          top: "40%",
          left: 0,
          width: fishSize,
          height: fishSize * 0.6,
        }}
        animate={{
          x: [size * 0.05, size * 0.65, size * 0.65, size * 0.05, size * 0.05],
          scaleX: [1, 1, -1, -1, 1],
          y: [0, -size * 0.08, 0, size * 0.08, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
          times: [0, 0.4, 0.5, 0.9, 1],
        }}
      >
        <svg
          viewBox="0 0 64 40"
          width="100%"
          height="100%"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
        >
          {/* Tail */}
          <motion.path
            d="M 8 20 L 0 8 L 4 20 L 0 32 Z"
            fill="#f97316"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "20%", originY: "50%" }}
          />
          {/* Body */}
          <ellipse cx="32" cy="20" rx="22" ry="11" fill="#fb923c" />
          <ellipse cx="32" cy="17" rx="20" ry="6" fill="#fdba74" opacity="0.7" />
          {/* Top fin */}
          <path d="M 26 10 Q 32 2 38 10 Z" fill="#f97316" />
          {/* Bottom fin */}
          <path d="M 28 30 Q 32 36 36 30 Z" fill="#f97316" />
          {/* Eye */}
          <circle cx="46" cy="18" r="2.5" fill="white" />
          <circle cx="46.5" cy="18" r="1.4" fill="#0f172a" />
          {/* Gill */}
          <path
            d="M 40 17 Q 38 20 40 23"
            stroke="#ea580c"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  );
}