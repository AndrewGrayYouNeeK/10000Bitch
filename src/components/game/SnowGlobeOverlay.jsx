import React from "react";
import { motion } from "framer-motion";

/**
 * A single drifting snowflake.
 */
function Snowflake({ size, leftPct, delay, duration, drift, scale }) {
  const flakeSize = size * 0.06 * scale;
  return (
    <motion.div
      className="absolute"
      style={{
        top: -flakeSize,
        left: `${leftPct}%`,
        width: flakeSize,
        height: flakeSize,
      }}
      animate={{
        y: [0, size * 1.2],
        x: [0, drift, -drift, drift * 0.5, 0],
        opacity: [0, 1, 1, 1, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
        times: [0, 0.15, 0.5, 0.85, 1],
      }}
    >
      <svg viewBox="0 0 16 16" width="100%" height="100%" style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.7))" }}>
        <g stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none">
          <line x1="8" y1="1" x2="8" y2="15" />
          <line x1="1" y1="8" x2="15" y2="8" />
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
          {/* small arms */}
          <line x1="8" y1="3" x2="6" y2="4.5" />
          <line x1="8" y1="3" x2="10" y2="4.5" />
          <line x1="8" y1="13" x2="6" y2="11.5" />
          <line x1="8" y1="13" x2="10" y2="11.5" />
        </g>
      </svg>
    </motion.div>
  );
}

/**
 * Snow globe interior — snowflakes drifting down inside a glassy dome.
 * `count` (matches die face value) controls density: higher values = more snow.
 */
export default function SnowGlobeOverlay({ size, radius, count = 1 }) {
  const flakeCount = count >= 5 ? 28 : count === 4 ? 20 : count === 3 ? 14 : count === 2 ? 10 : 7;
  const flakes = React.useMemo(() => {
    return Array.from({ length: flakeCount }, (_, i) => ({
      leftPct: (i * 53) % 95 + 2,
      delay: -((i * 0.37) % 5),
      duration: 4 + ((i * 0.41) % 3),
      drift: size * (0.04 + (i % 4) * 0.02),
      scale: 0.6 + (i % 5) * 0.15,
    }));
  }, [flakeCount, size]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: radius }}
    >
      {/* Soft snowy backdrop at the bottom (snow pile) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "30%",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 40%, transparent 75%)",
        }}
      />

      {/* Light highlights from above */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 55%)",
        }}
      />

      {/* Drifting snowflakes */}
      {flakes.map((f, i) => (
        <Snowflake key={i} size={size} {...f} />
      ))}
    </div>
  );
}