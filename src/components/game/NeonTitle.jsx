import React from "react";

// A single die face used in place of a "0" in the title
function DieZero({ size = 44, pips = 5 }) {
  // Pip layouts for 1..6
  const layouts = {
    1: [[0,0,0],[0,1,0],[0,0,0]],
    2: [[1,0,0],[0,0,0],[0,0,1]],
    3: [[1,0,0],[0,1,0],[0,0,1]],
    4: [[1,0,1],[0,0,0],[1,0,1]],
    5: [[1,0,1],[0,1,0],[1,0,1]],
    6: [[1,0,1],[1,0,1],[1,0,1]],
  };
  const layout = layouts[pips] || layouts[5];
  const radius = Math.round(size * 0.18);
  const pipSize = Math.round(size * 0.16);
  const pad = Math.round(size * 0.12);

  return (
    <span
      className="inline-block align-middle relative"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(135deg, #1a0033 0%, #2a0040 60%, #1a0033 100%)",
        border: "2px solid #ff00ea",
        boxShadow:
          "0 0 12px #ff00ea, 0 0 24px #00ffff, inset 0 0 8px rgba(0,255,255,0.4)",
      }}
    >
      <span
        className="absolute grid grid-cols-3 grid-rows-3"
        style={{ inset: pad, gap: Math.round(size * 0.04) }}
      >
        {layout.flat().map((p, i) => (
          <span key={i} className="flex items-center justify-center">
            {p === 1 && (
              <span
                className="rounded-full block"
                style={{
                  width: pipSize,
                  height: pipSize,
                  background: "#fff",
                  boxShadow: "0 0 6px #00ffff, 0 0 10px #ff00ea",
                }}
              />
            )}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function NeonTitle({ dieSize = 44 }) {
  return (
    <div className="flex items-center justify-center gap-1 font-pixel neon-glitch select-none">
      <span
        className="neon-text-magenta"
        style={{ fontSize: dieSize * 0.95, lineHeight: 1 }}
      >
        1
      </span>
      <span className="neon-text-magenta" style={{ fontSize: dieSize * 0.6, lineHeight: 1 }}>,</span>
      <DieZero size={dieSize} pips={5} />
      <DieZero size={dieSize} pips={6} />
      <DieZero size={dieSize} pips={3} />
    </div>
  );
}