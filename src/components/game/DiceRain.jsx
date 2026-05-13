import { useEffect, useRef } from "react";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function DiceRain() {
  const canvasRef = useRef(null);
  const diceRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 70;
    const SIZE = 32;

    const spawn = (initial = false) => ({
      x: randomBetween(0, canvas.width),
      y: initial ? randomBetween(-canvas.height, canvas.height) : randomBetween(-canvas.height * 0.5, -SIZE),
      vy: randomBetween(0.6, 1.8),
      face: FACES[Math.floor(Math.random() * 6)],
      flipTimer: Math.floor(randomBetween(40, 140)),
      opacity: randomBetween(0.08, 0.3),
      size: randomBetween(SIZE * 0.6, SIZE * 1.2),
    });

    diceRef.current = Array.from({ length: COUNT }, () => spawn(true));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      diceRef.current.forEach((d, i) => {
        d.flipTimer--;
        if (d.flipTimer <= 0) {
          d.face = FACES[Math.floor(Math.random() * 6)];
          d.flipTimer = Math.floor(randomBetween(20, 80));
        }

        d.y += d.vy;

        // Respawn at top once it falls past the bottom
        if (d.y > canvas.height + d.size) {
          diceRef.current[i] = spawn(false);
          return;
        }

        ctx.save();
        ctx.globalAlpha = d.opacity;
        ctx.font = `${d.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 255, 200, 0.5)";
        ctx.shadowBlur = 5;
        ctx.fillStyle = "rgba(0, 200, 160, 0.7)";
        ctx.fillText(d.face, d.x, d.y);
        ctx.restore();
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