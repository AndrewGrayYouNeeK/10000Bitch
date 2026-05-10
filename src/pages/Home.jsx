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
        background: "radial-gradient(ellipse at 50% 30%, #2a1f0e 0%, #1a1206 40%, #0a0804 100%)",
      }}
    >
      {/* Gold particle shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(180,140,40,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(120,90,20,0.1) 0%, transparent 50%)",
        }}
      />

      {/* Floating subtle sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-300/40"
            initial={{ x: `${(i * 97) % 100}%`, y: `${(i * 61) % 100}%`, opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: [`${(i * 61) % 100}%`, `${((i * 61) % 100) - 20}%`] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Top bar: coins + badge + rules */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <Link
          to="/shop"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors border"
          style={{ background: "rgba(180,140,40,0.15)", borderColor: "rgba(180,140,40,0.4)" }}
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
        className="text-center relative z-10 max-w-sm w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-2"
        >
          <img
            src="https://media.base44.com/images/public/69e7669b223d37093cd03879/02645f1df_J-pkVgoLigDTfwK1sZ0Qt_3RwWpqbD.png"
            alt="10,000 The Ultimate Roll"
            className="w-80 h-80 object-contain mx-auto"
            style={{ filter: "drop-shadow(0 8px 32px rgba(180,140,20,0.5))" }}
          />
        </motion.div>

        {/* Tagline */}
        <p className="mb-8 text-sm font-semibold tracking-[0.25em] uppercase"
          style={{ color: "rgba(200,165,80,0.75)" }}>
          Roll. Risk. Reach ten thousand.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full h-16 text-lg font-bold border-0 text-black"
            style={{
              background: "linear-gradient(135deg, #c9a227 0%, #f0d060 40%, #b8860b 100%)",
              boxShadow: "0 4px 24px rgba(180,140,20,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Link to="/setup">
              <Dices className="w-6 h-6 mr-2" />
              Play Pass & Play
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold border text-amber-200 bg-transparent hover:bg-amber-900/20"
            style={{ borderColor: "rgba(180,140,40,0.5)" }}
          >
            <Link to="/shop">
              <Sparkles className="w-5 h-5 mr-2" />
              Shop
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold text-amber-200/60 bg-transparent hover:bg-white/5 border"
            style={{ borderColor: "rgba(180,140,40,0.2)" }}
          >
            <Link to="/rules">
              <BookOpen className="w-5 h-5 mr-2" />
              How to Play
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-xs flex items-center justify-center gap-1"
          style={{ color: "rgba(180,140,40,0.45)" }}>
          <Users className="w-3 h-3" /> 2–4 players on one device
        </div>
      </motion.div>
    </div>
  );
}