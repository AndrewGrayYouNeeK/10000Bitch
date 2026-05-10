import { useEffect, useRef } from "react";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const COLORS = ["#00ffc8"];

export default function DiceRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const FONT_SIZE = 20;
    const cols = Math.floor(canvas.width / FONT_SIZE);

    // Each column: y position, speed, color, current face
    const drops = Array.from({ length: cols }, (_, i) => ({
      y: Math.random() * -canvas.height,
      speed: 0.25 + Math.random() * 0.35,
      color: "#00ffc8",
      face: DICE_FACES[Math.floor(Math.random() * 6)],
      opacity: 0.08 + Math.random() * 0.18,
      swapTimer: Math.random() * 60,
    }));

    let frame;
    const draw = () => {
      // Dark translucent overlay = trail fade
      ctx.fillStyle = "rgba(2, 4, 8, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px serif`;
      ctx.textAlign = "center";

      drops.forEach((drop, i) => {
        // Randomly swap face
        drop.swapTimer--;
        if (drop.swapTimer <= 0) {
          drop.face = DICE_FACES[Math.floor(Math.random() * 6)];
          drop.swapTimer = 8 + Math.random() * 25;
        }

        // Lead character — bright white glow
        ctx.shadowColor = drop.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = drop.opacity * 1.4;
        ctx.fillText(drop.face, i * FONT_SIZE + FONT_SIZE / 2, drop.y);

        // Trail — dimmer colored
        ctx.fillStyle = drop.color;
        ctx.globalAlpha = drop.opacity * 0.5;
        ctx.fillText(
          DICE_FACES[Math.floor(Math.random() * 6)],
          i * FONT_SIZE + FONT_SIZE / 2,
          drop.y - FONT_SIZE
        );

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        drop.y += FONT_SIZE * drop.speed * 0.2;

        if (drop.y > canvas.height + FONT_SIZE * 2) {
          drop.y = -FONT_SIZE * (2 + Math.random() * 10);
          drop.speed = 0.25 + Math.random() * 0.35;
          drop.color = "#00ffc8";
          drop.opacity = 0.08 + Math.random() * 0.18;
        }
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}