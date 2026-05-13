import React from "react";
import Die from "./Die";
import { motion } from "framer-motion";

/**
 * Visual tray for the 6 dice. Rendered on a felt-green surface.
 * dice: array of { id, value, used (banked), held (in active selection) }
 */
export default function DiceTray({ dice, rolling, onToggle, disabled, skinId, pipsId }) {
  return (
    <div
      className="relative rounded-3xl p-6 overflow-hidden border-4 border-amber-900/60"
      style={{
        background: "#1f6b3a",
      }}
    >
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)",
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
              size={92}
              skinId="bullet_holes"
              pipsId={pipsId}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}