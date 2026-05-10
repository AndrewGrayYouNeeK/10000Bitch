import { useEffect, useRef } from "react";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

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

    const COUNT = 22;
    const SIZE = 38;

    // Each die: position, velocity, rotation, spin speed, face, flip timer
    const dice = Array.from({ length: COUNT }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(0, canvas.height),
      vx: randomBetween(-0.4, 0.4),
      vy: randomBetween(-0.4, 0.4),
      rot: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.012, 0.012),
      face: FACES[Math.floor(Math.random() * 6)],
      flipTimer: Math.floor(randomBetween(40, 120)),
      opacity: randomBetween(0.10, 0.28),
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dice.forEach((d) => {
        // Flip face randomly
        d.flipTimer--;
        if (d.flipTimer <= 0) {
          d.face = FACES[Math.floor(Math.random() * 6)];
          d.flipTimer = Math.floor(randomBetween(40, 120));
        }

        // Move
        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.spin;

        // Wrap around edges
        if (d.x < -SIZE) d.x = canvas.width + SIZE;
        if (d.x > canvas.width + SIZE) d.x = -SIZE;
        if (d.y < -SIZE) d.y = canvas.height + SIZE;
        if (d.y > canvas.height + SIZE) d.y = -SIZE;

        // Draw
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.globalAlpha = d.opacity;

        // Die face emoji
        ctx.font = `${SIZE * 0.7}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0, 255, 200, 0.7)";
        ctx.globalAlpha = d.opacity * 2.5;
        ctx.fillText(d.face, 0, 2);

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