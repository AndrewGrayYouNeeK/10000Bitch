import React from "react";
import { motion } from "framer-motion";

export default function BadgePreview({ badge, size = 64 }) {
  if (!badge) return null;
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className={`rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {badge.emoji}
    </motion.div>
  );
}