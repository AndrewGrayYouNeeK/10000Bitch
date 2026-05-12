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
        backgroundImage:
          "url(https://media.base44.com/images/public/69e7669b223d37093cd03879/c8d0f5ce6_ziA4KOYCS_QY2BcnEzQGb_sNgQTA4n.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow:
          "inset 0 0 40px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.5)",
      }}
    >

      <div className="relative grid grid-cols-3 gap-3 justify-items-center sm:grid-cols-6">
        {dice.map((d, idx) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Die
              value={idx + 1}
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