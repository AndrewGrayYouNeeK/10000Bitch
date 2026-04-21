import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dices, Users, BookOpen, Sparkles, Coins } from "lucide-react";
import RulesSheet from "@/components/game/RulesSheet";
import { useCosmetics } from "@/hooks/useCosmetics";
import BadgePreview from "@/components/shop/BadgePreview";

export default function Home() {
  const { coins, isLoading, equippedBadge } = useCosmetics();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative"
      style={{
        background:
          "radial-gradient(ellipse at top, #1e293b 0%, #020617 70%), #000",
      }}
    >
      {/* Floating dice background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl"
            initial={{
              x: `${(i * 127) % 100}%`,
              y: `${(i * 73) % 100}%`,
            }}
            animate={{
              y: [`${(i * 73) % 100}%`, `${((i * 73) % 100) - 15}%`, `${(i * 73) % 100}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🎲
          </motion.div>
        ))}
      </div>

      {/* Top bar: coins + badge + rules */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <Link
          to="/shop"
          className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full px-3 py-1.5 hover:bg-amber-500/30 transition-colors"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-black tabular-nums text-amber-300 text-sm">
            {isLoading ? "…" : coins.toLocaleString()}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {equippedBadge && <BadgePreview badge={equippedBadge} size={36} />}
          <RulesSheet />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-4 inline-block"
        >
          🎲
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
          DICE
        </h1>
        <div className="text-7xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-3">
          10,000
        </div>
        <p className="text-slate-400 mb-10 text-lg">
          Roll. Risk. Reach ten thousand.
        </p>

        <div className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30 border-0"
          >
            <Link to="/setup">
              <Dices className="w-6 h-6 mr-2" />
              Play Pass & Play
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white border-0"
          >
            <Link to="/shop">
              <Sparkles className="w-5 h-5 mr-2" />
              Shop
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Link to="/rules">
              <BookOpen className="w-5 h-5 mr-2" />
              How to Play
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1">
          <Users className="w-3 h-3" /> 2–4 players on one device
        </div>
      </motion.div>
    </div>
  );
}