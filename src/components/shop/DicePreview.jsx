import React from "react";
import Die from "@/components/game/Die";

// Small static die preview for shop cards.
export default function DicePreview({ skinId, pipsId, value = 5 }) {
  return (
    <div style={{ transform: "scale(1.1)" }}>
      <Die value={value} skinId={skinId} pipsId={pipsId} size={64} />
    </div>
  );
}