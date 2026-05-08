import React from "react";
import Die from "@/components/game/Die";
import { getSkin } from "@/lib/shopCatalog";

// Small static die preview for shop cards.
// If the skin has a real photo (`image`), show it cropped to a single die.
// Otherwise fall back to the CSS-rendered Die component.
export default function DicePreview({ skinId, pipsId, value = 5 }) {
  const skin = getSkin(skinId);

  if (skin.image) {
    return (
      <div
        className="rounded-2xl overflow-hidden shadow-lg border border-white/10"
        style={{ width: 80, height: 80 }}
      >
        <img
          src={skin.image}
          alt={skin.name}
          className="w-full h-full object-cover"
          draggable={false}
          style={{ objectPosition: "20% 30%" }}
        />
      </div>
    );
  }

  return (
    <div style={{ transform: "scale(1.1)" }}>
      <Die value={value} skinId={skinId} pipsId={pipsId} size={64} />
    </div>
  );
}