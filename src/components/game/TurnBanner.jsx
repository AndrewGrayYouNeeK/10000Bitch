import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TurnBanner({ message, variant = "info" }) {
  if (!message) return null;
  const colors = {
    info: "from-sky-500 to-indigo-600",
    success: "from-emerald-500 to-green-600",
    danger: "from-rose-500 to-red-700",
    warning: "from-amber-500 to-orange-600",
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        style={{ marginTop: "max(0px, calc(var(--safe-top) - 0.25rem))" }}
        className={cn(
          "rounded-xl px-4 py-2 text-center font-bold text-white shadow-lg bg-gradient-to-r",
          colors[variant]
        )}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}