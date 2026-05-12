import React from "react";
import { motion } from "framer-motion";

// Renders a single pip that looks like a real physical die indentation.
// `animationEffect` can be "glow", "shinyStar", or "blackHole" — applied only when set.
export default function Pip({ size, colorClass = "bg-gray-900", inset = false, animationEffect = null }) {
  const s = size || 10;

  const baseStyle = {
    width: s,
    height: s,
    borderRadius: "50%",
    flexShrink: 0,
  };

  if (animationEffect === "glow") {
    return (
      <motion.div
        style={{
          ...baseStyle,
          background: "radial-gradient(circle at 40% 35%, #e0f2fe 0%, #38bdf8 60%, #0369a1 100%)",
        }}
        animate={{
          boxShadow: [
            "0 0 4px 1px rgba(56,189,248,0.6), inset 0 1px 2px rgba(255,255,255,0.5)",
            "0 0 14px 4px rgba(125,211,252,1), inset 0 1px 2px rgba(255,255,255,0.8)",
            "0 0 4px 1px rgba(56,189,248,0.6), inset 0 1px 2px rgba(255,255,255,0.5)",
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (animationEffect === "shinyStar") {
    return (
      <motion.div
        style={{
          ...baseStyle,
          background: "radial-gradient(circle at 40% 35%, #fff 0%, #fde68a 50%, #f59e0b 100%)",
          boxShadow: "0 0 6px 2px rgba(253,224,71,0.7), inset 0 1px 2px rgba(255,255,255,0.9)",
          position: "relative",
          overflow: "hidden",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.95) 20deg, transparent 40deg, transparent 180deg, rgba(255,255,255,0.95) 200deg, transparent 220deg, transparent 360deg)",
            mixBlendMode: "overlay",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    );
  }

  if (animationEffect === "blackHole") {
    return (
      <motion.div
        style={{
          ...baseStyle,
          background: "radial-gradient(circle at 50% 50%, #000 0%, #1e1b4b 60%, #4c1d95 100%)",
          boxShadow:
            "inset 0 0 6px 2px rgba(0,0,0,1), 0 0 8px 1px rgba(124,58,237,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
        animate={{ scale: [1, 0.85, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(168,85,247,0.8), rgba(0,0,0,0) 60%, rgba(56,189,248,0.6), rgba(0,0,0,0) 120%)",
          }}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: s * 0.4,
            height: s * 0.4,
            borderRadius: "50%",
            background: "#000",
            boxShadow: "0 0 4px 2px rgba(0,0,0,1)",
          }}
        />
      </motion.div>
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: inset
          ? "radial-gradient(circle at 40% 35%, #3a3a3a 0%, #111 60%, #000 100%)"
          : "radial-gradient(circle at 40% 35%, #555 0%, #111 100%)",
        boxShadow: inset
          ? "inset 0 2px 4px rgba(0,0,0,0.9), inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.15)"
          : "inset 0 1px 3px rgba(0,0,0,0.8)",
      }}
    />
  );
}