import React from "react";

// Renders a single pip that looks like a real physical die indentation.
export default function Pip({ size, colorClass = "bg-gray-900", inset = false }) {
  const s = size || 10;

  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: "50%",
        background: inset
          ? "radial-gradient(circle at 40% 35%, #3a3a3a 0%, #111 60%, #000 100%)"
          : "radial-gradient(circle at 40% 35%, #555 0%, #111 100%)",
        boxShadow: inset
          ? "inset 0 2px 4px rgba(0,0,0,0.9), inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.15)"
          : "inset 0 1px 3px rgba(0,0,0,0.8)",
        flexShrink: 0,
      }}
    />
  );
}