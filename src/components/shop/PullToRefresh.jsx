import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const onTouchStart = (e) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (startY.current == null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(delta * 0.5, 100));
  };

  const onTouchEnd = async () => {
    if (startY.current == null) return;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      try { await onRefresh?.(); } finally {
        setTimeout(() => { setRefreshing(false); setPull(0); }, 400);
      }
    } else {
      setPull(0);
    }
  };

  const offset = refreshing ? 50 : pull;
  const ready = pull >= THRESHOLD;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        animate={{ height: offset }}
        transition={{ type: "tween", duration: 0.15 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <RefreshCw
          className={`w-5 h-5 text-amber-400 ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: !refreshing ? `rotate(${pull * 3}deg)` : undefined }}
        />
        <span className="ml-2 text-xs text-slate-400">
          {refreshing ? "Refreshing…" : ready ? "Release to refresh" : "Pull to refresh"}
        </span>
      </motion.div>
      {children}
    </div>
  );
}