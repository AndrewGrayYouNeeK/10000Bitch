import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Tesla coil-style branching electric arcs.
 * Generates jagged, forking polylines that snake across the die face.
 */

// Generate a jagged polyline from start -> end with N segments and random jitter.
function makeArc(x1, y1, x2, y2, segments = 8, jitter = 8) {
  const pts = [[x1, y1]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter * 2;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter * 2;
    pts.push([x, y]);
  }
  pts.push([x2, y2]);
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

// Create a small fork branching off the midpoint of a main arc.
function makeFork(x1, y1) {
  const angle = Math.random() * Math.PI * 2;
  const len = 12 + Math.random() * 18;
  const x2 = x1 + Math.cos(angle) * len;
  const y2 = y1 + Math.sin(angle) * len;
  return makeArc(x1, y1, x2, y2, 4, 5);
}

export default function LightningOverlay({ size = 64, radius = 4 }) {
  // Generate a few arc sets — re-randomized per mount
  const arcSets = useMemo(() => {
    const sets = [];
    for (let s = 0; s < 4; s++) {
      const corners = [
        [10, 10], [90, 10], [90, 90], [10, 90], [50, 5], [95, 50], [50, 95], [5, 50],
      ];
      const a = corners[Math.floor(Math.random() * corners.length)];
      const b = corners[Math.floor(Math.random() * corners.length)];
      const main = makeArc(a[0], a[1], b[0], b[1], 10, 7);
      // 1-2 forks branching from random midpoints
      const forks = [];
      const forkCount = 1 + Math.floor(Math.random() * 2);
      for (let f = 0; f < forkCount; f++) {
        const fx = a[0] + (b[0] - a[0]) * (0.3 + Math.random() * 0.4);
        const fy = a[1] + (b[1] - a[1]) * (0.3 + Math.random() * 0.4);
        forks.push(makeFork(fx, fy));
      }
      sets.push({ main, forks });
    }
    return sets;
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: radius }}
    >
      {/* Soft purple/white halo */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.3, 0.7, 0.4, 0.8, 0.35] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(216,180,254,0.35) 0%, rgba(168,85,247,0.18) 45%, transparent 75%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Arcs */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{
          filter:
            "drop-shadow(0 0 1.5px #ffffff) drop-shadow(0 0 4px #c4b5fd) drop-shadow(0 0 8px #a855f7)",
        }}
      >
        {arcSets.map((set, i) => (
          <motion.g
            key={i}
            animate={{ opacity: [0, 1, 0, 0.9, 0] }}
            transition={{
              duration: 0.45 + i * 0.05,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.11,
            }}
          >
            <path
              d={set.main}
              fill="none"
              stroke="white"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {set.forks.map((f, j) => (
              <path
                key={j}
                d={f}
                fill="none"
                stroke="#e9d5ff"
                strokeWidth="0.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}