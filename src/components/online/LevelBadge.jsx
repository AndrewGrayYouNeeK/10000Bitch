import React from "react";
import { TIERS } from "@/lib/progression";

/**
 * Compact neon badge showing a player's level with tier-coloured glow.
 * Used next to player names in online matches.
 */
const TIER_STYLES = {
  0: { bg: "#3a1f08", border: "#d97706", text: "#fbbf24", glow: "rgba(217,119,6,0.55)" },   // Bronze
  1: { bg: "#1f2937", border: "#94a3b8", text: "#e2e8f0", glow: "rgba(148,163,184,0.55)" },  // Silver
  2: { bg: "#3a2806", border: "#fbbf24", text: "#fde68a", glow: "rgba(251,191,36,0.65)" },   // Gold
  3: { bg: "#062a3a", border: "#22d3ee", text: "#a5f3fc", glow: "rgba(34,211,238,0.65)" },   // Diamond
  4: { bg: "#2a0640", border: "#d946ef", text: "#f5d0fe", glow: "rgba(217,70,239,0.7)" },    // Mythic
};

export default function LevelBadge({ level = 1, tierId = 0, size = "sm", className = "" }) {
  const style = TIER_STYLES[tierId] || TIER_STYLES[0];
  const tierName = TIERS[tierId]?.name || "Bronze";

  const sizes = {
    xs: { h: "h-4", px: "px-1", text: "text-[9px]", label: "text-[7px]" },
    sm: { h: "h-5", px: "px-1.5", text: "text-[10px]", label: "text-[8px]" },
    md: { h: "h-6", px: "px-2", text: "text-xs", label: "text-[9px]" },
  }[size] || { h: "h-5", px: "px-1.5", text: "text-[10px]", label: "text-[8px]" };

  return (
    <span
      title={`${tierName} • Level ${level}`}
      className={`inline-flex items-center gap-1 rounded ${sizes.h} ${sizes.px} border font-black tabular-nums ${className}`}
      style={{
        background: style.bg,
        borderColor: style.border,
        color: style.text,
        textShadow: `0 0 6px ${style.glow}`,
        boxShadow: `0 0 8px ${style.glow}, inset 0 0 0 1px rgba(255,255,255,0.06)`,
      }}
    >
      <span className={`${sizes.label} uppercase tracking-wider opacity-80`}>Lv</span>
      <span className={sizes.text}>{level}</span>
    </span>
  );
}