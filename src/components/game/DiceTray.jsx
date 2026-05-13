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
      className="relative rounded-3xl p-6 overflow-hidden border-4 border-amber-900/60 shadow-2xl"
      style={{
        background:
          "radial-gradient(ellipse at center, #1f6b3a 0%, #134524 55%, #061509 100%)",
        boxShadow:
          "inset 0 0 80px 30px rgba(0,0,0,0.85), inset 0 0 40px rgba(0,0,0,0.6), inset 0 4px 10px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.5)",
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

      {/* Top corner shadows */}
      <div
        className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, transparent 70%)",
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
              skinId={skinId || "classic_white"}
              pipsId={pipsId}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}