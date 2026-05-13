import React from "react";

/**
 * Glitch-animated neon banner image.
 * Layers the same image 3 times with offset color channels + clip-path flickers
 * to produce a chromatic-aberration / RGB-split glitch effect.
 */
export default function GlitchNeonBanner({ src, alt = "Neon sign", objectPosition = "center 30%" }) {
  return (
    <>
      <style>{`
        @keyframes glitch-shift-r {
          0%, 92%, 100% { transform: translate(0,0); opacity: 0; }
          93% { transform: translate(4px, -2px); opacity: 0.9; }
          94% { transform: translate(-3px, 1px); opacity: 0.7; }
          95% { transform: translate(2px, 2px); opacity: 0.9; }
          96% { transform: translate(-5px, -1px); opacity: 0.8; }
          97% { transform: translate(3px, 0); opacity: 0.6; }
        }
        @keyframes glitch-shift-b {
          0%, 92%, 100% { transform: translate(0,0); opacity: 0; }
          93% { transform: translate(-4px, 2px); opacity: 0.9; }
          94% { transform: translate(3px, -1px); opacity: 0.7; }
          95% { transform: translate(-2px, -2px); opacity: 0.9; }
          96% { transform: translate(5px, 1px); opacity: 0.8; }
          97% { transform: translate(-3px, 0); opacity: 0.6; }
        }
        @keyframes glitch-clip {
          0%, 92%, 100% { clip-path: inset(0 0 0 0); }
          93% { clip-path: inset(20% 0 55% 0); }
          94% { clip-path: inset(60% 0 15% 0); }
          95% { clip-path: inset(35% 0 40% 0); }
          96% { clip-path: inset(5% 0 75% 0); }
          97% { clip-path: inset(70% 0 5% 0); }
        }
        @keyframes glitch-flicker {
          0%, 100% { opacity: 1; filter: brightness(1); }
          47% { opacity: 1; filter: brightness(1); }
          48% { opacity: 0.4; filter: brightness(1.8) hue-rotate(20deg); }
          49% { opacity: 1; filter: brightness(1); }
          70% { opacity: 1; filter: brightness(1); }
          71% { opacity: 0.6; filter: brightness(2) hue-rotate(-30deg); }
          72% { opacity: 1; filter: brightness(1); }
          93% { opacity: 0.85; filter: brightness(1.5); }
          95% { opacity: 0.5; filter: brightness(2); }
          97% { opacity: 1; filter: brightness(1); }
        }
        @keyframes glitch-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .glitch-base { animation: glitch-flicker 4s infinite; }
        .glitch-r {
          animation: glitch-shift-r 4s infinite, glitch-clip 4s infinite;
          mix-blend-mode: screen;
          filter: drop-shadow(2px 0 0 #ff0066);
        }
        .glitch-b {
          animation: glitch-shift-b 4s infinite 0.05s, glitch-clip 4s infinite 0.05s;
          mix-blend-mode: screen;
          filter: drop-shadow(-2px 0 0 #00ffff);
        }
        .glitch-scanline {
          animation: glitch-scanline 3s linear infinite;
        }
      `}</style>
      <div className="relative w-full h-48 sm:h-64 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover glitch-base"
          style={{ objectPosition }}
        />
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover glitch-r pointer-events-none"
          style={{ objectPosition }}
        />
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover glitch-b pointer-events-none"
          style={{ objectPosition }}
        />
        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* Moving bright scan bar */}
        <div
          className="absolute left-0 right-0 h-8 pointer-events-none glitch-scanline"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0,255,234,0.15) 50%, transparent)",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </>
  );
}