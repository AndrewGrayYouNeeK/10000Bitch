import React from "react";

// Renders a single pip in the shape defined by the equipped pip style.
// `colorClass` is a tailwind bg-* class for dots/squares, or fill color for svg shapes.
export default function Pip({ shape = "dot", size, colorClass = "bg-slate-900", inset = false }) {
  const s = size || 10;
  const shadow = inset
    ? "inset 0 2px 4px rgba(0,0,0,0.55), inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.6)"
    : "inset 0 2px 3px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.1)";

  if (shape === "square") {
    return (
      <div
        className={colorClass}
        style={{ width: s, height: s, borderRadius: s * 0.15, boxShadow: shadow }}
      />
    );
  }

  // Map bg-* class → fill color for svg shapes
  const fill = bgClassToFill(colorClass);

  if (shape === "star") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        <polygon fill={fill} points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
      </svg>
    );
  }

  if (shape === "heart") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        <path
          fill={fill}
          d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"
        />
      </svg>
    );
  }

  if (shape === "diamond") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        <polygon fill={fill} points="12,2 22,12 12,22 2,12" />
      </svg>
    );
  }

  // default dot
  return (
    <div
      className={`rounded-full ${colorClass}`}
      style={{
        width: s,
        height: s,
        boxShadow: shadow,
      }}
    />
  );
}

function bgClassToFill(cls) {
  if (!cls) return "#111827";
  if (cls.includes("white")) return "#ffffff";
  if (cls.includes("yellow-200")) return "#fef08a";
  if (cls.includes("slate-900")) return "#0f172a";
  if (cls.includes("gray-900")) return "#111827";
  return "#111827";
}