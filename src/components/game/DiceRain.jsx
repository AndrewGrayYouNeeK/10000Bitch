import { useEffect, useRef } from "react";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function DiceRain() {
  const canvasRef = useRef(null);
  const gravityRef = useRef({ x: 0, y: 0.15 });
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

    // Device orientation → gravity
    const handleOrientation = (e) => {
      // gamma = left/right tilt (-90 to 90), beta = front/back tilt (-180 to 180)
      const gx = (e.gamma || 0) / 90;   // -1 to 1
      const gy = (e.beta  || 0) / 90;   // -1 to 1
      // When level (beta near 0), gravity should be minimal
      const gravY = Math.abs(gy) < 0.1 ? 0 : gy * 0.9;
      gravityRef.current = {
        x: gx * 0.9,
        y: gravY,
      };
    };

    const requestOrientation = () => {
      if (typeof DeviceOrientationEvent !== "undefined" &&
          typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((res) => {
            if (res === "granted") window.addEventListener("deviceorientation", handleOrientation);
          })
          .catch(() => {});
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    // Request on first user interaction (needed for iOS 13+)
    document.addEventListener("click", requestOrientation, { once: true });
    // Also try immediately for Android / non-restricted browsers
    requestOrientation();

    // Shake detection via devicemotion
    let lastShakeTime = 0;
    let lastAcc = { x: 0, y: 0, z: 0 };
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const dx = (acc.x || 0) - lastAcc.x;
      const dy = (acc.y || 0) - lastAcc.y;
      const dz = (acc.z || 0) - lastAcc.z;
      lastAcc = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 };
      const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const now = Date.now();
      if (delta > 25 && now - lastShakeTime > 600) {
        lastShakeTime = now;
        diceRef.current.forEach((d) => {
          const angle = Math.random() * Math.PI * 2;
          const power = 25 + Math.random() * 25;
          d.vx = Math.cos(angle) * power;
          d.vy = Math.sin(angle) * power;
        });
      }
    };
    window.addEventListener("devicemotion", handleMotion);

    const COUNT = 50;
    const SIZE = 38;

    diceRef.current = Array.from({ length: COUNT }, () => ({
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

    const DAMPING = 0.91;
    const MAX_SPEED = 8;
    const BOUNCE = 0.8;

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: gx, y: gy } = gravityRef.current;

      // Collision detection between dice
      for (let i = 0; i < diceRef.current.length; i++) {
        for (let j = i + 1; j < diceRef.current.length; j++) {
          const d1 = diceRef.current[i];
          const d2 = diceRef.current[j];
          const dx = d2.x - d1.x;
          const dy = d2.y - d1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = SIZE;
          
          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Separate overlapping dice
            const overlap = (minDist - dist) / 2;
            d1.x -= overlap * cos;
            d1.y -= overlap * sin;
            d2.x += overlap * cos;
            d2.y += overlap * sin;
            
            // Exchange velocity components along collision normal
            const v1n = d1.vx * cos + d1.vy * sin;
            const v2n = d2.vx * cos + d2.vy * sin;
            d1.vx += (v2n - v1n) * cos;
            d1.vy += (v2n - v1n) * sin;
            d2.vx += (v1n - v2n) * cos;
            d2.vy += (v1n - v2n) * sin;
          }
        }
      }

      diceRef.current.forEach((d) => {
        // Flip face randomly
        d.flipTimer--;
        if (d.flipTimer <= 0) {
          d.face = FACES[Math.floor(Math.random() * 6)];
          d.flipTimer = Math.floor(randomBetween(40, 120));
        }

        // Apply gravity from device tilt + constant downward gravity
        d.vx += gx * 0.35;
        d.vy += (gy * 0.35) + 0.08;

        // Dampen velocity
        d.vx *= DAMPING;
        d.vy *= DAMPING;

        // Clamp speed
        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        if (speed > MAX_SPEED) {
          d.vx = (d.vx / speed) * MAX_SPEED;
          d.vy = (d.vy / speed) * MAX_SPEED;
        }

        // Spin faster when moving faster
        d.rot += d.spin * (1 + speed * 0.3);

        d.x += d.vx;
        d.y += d.vy;

        // Bounce off edges
        const half = SIZE / 2;
        if (d.x < half) { d.x = half; d.vx = Math.abs(d.vx) * BOUNCE; }
        if (d.x > canvas.width - half) { d.x = canvas.width - half; d.vx = -Math.abs(d.vx) * BOUNCE; }
        if (d.y < half) { d.y = half; d.vy = Math.abs(d.vy) * BOUNCE; }
        if (d.y > canvas.height - half) { d.y = canvas.height - half; d.vy = -Math.abs(d.vy) * BOUNCE; }
        
        // Respawn at top when falling off bottom
        if (d.y > canvas.height + SIZE) {
          d.x = randomBetween(0, canvas.width);
          d.y = -SIZE;
          d.vx = randomBetween(-0.4, 0.4);
          d.vy = randomBetween(-0.4, 0.4);
        }

        // Draw
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.globalAlpha = d.opacity * 2.5;
        ctx.font = `${SIZE * 0.7}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0, 255, 200, 0.7)";
        ctx.fillText(d.face, 0, 2);
        ctx.restore();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
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