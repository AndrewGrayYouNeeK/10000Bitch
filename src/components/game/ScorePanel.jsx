import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScorePanel({ players, currentIndex, target = 10000 }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((p, i) => {
        const active = i === currentIndex;
        const pct = Math.min(100, (p.score / target) * 100);
        return (
          <motion.div
            key={i}
            animate={{ scale: active ? 1.02 : 1 }}
            className={cn(
              "relative rounded-2xl p-3 border-2 overflow-hidden",
              active
                ? "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-lg shadow-amber-500/40"
                : "bg-slate-800/60 border-slate-700"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {active && <Zap className="w-4 h-4 text-white animate-pulse" />}
              <span className={cn("font-bold text-sm truncate", active ? "text-white" : "text-slate-200")}>
                {p.name}
              </span>
              {p.score >= target && <Trophy className="w-4 h-4 text-yellow-300 ml-auto" />}
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={p.score}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn("text-2xl font-black tabular-nums", active ? "text-white" : "text-slate-100")}
              >
                {p.score.toLocaleString()}
              </motion.div>
            </AnimatePresence>
            <div className="mt-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full", active ? "bg-white" : "bg-emerald-400")}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}