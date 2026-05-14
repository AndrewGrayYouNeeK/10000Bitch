import { useCallback, useRef } from "react";

/**
 * Tiny WebAudio-based dice roll SFX. No external assets.
 * Returns a play() function — safe to call repeatedly.
 */
export function useDiceSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  };

  const play = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    // 4–6 quick noise clicks to imitate dice tumbling
    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      const t = ctx.currentTime + i * (0.07 + Math.random() * 0.05);
      // White-noise burst via short buffer
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / data.length);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200 + Math.random() * 1800;
      filter.Q.value = 1.2;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.1);
    }
  }, []);

  return play;
}