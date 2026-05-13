import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coins, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopItemCard({ item, owned, equipped, canAfford, onBuy, onEquip, preview, duplicateTag }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={cn(
        "relative rounded-2xl p-4 border-2 overflow-hidden bg-slate-900",
        equipped ? "border-amber-400 shadow-lg shadow-amber-500/30" : "border-slate-800"
      )}
    >
      {equipped && (
        <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
          EQUIPPED
        </div>
      )}
      {duplicateTag && (
        <div className={cn(
          "absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full",
          duplicateTag.bg, duplicateTag.text
        )}>
          {duplicateTag.label}
        </div>
      )}

      <div className="flex items-center justify-center h-24 mb-3">
        {preview}
      </div>

      <div className="text-white font-bold text-sm truncate">{item.name}</div>
      <div className="text-slate-400 text-xs mb-3 h-8 overflow-hidden">{item.description}</div>

      {owned ? (
        <Button
          size="sm"
          onClick={onEquip}
          disabled={equipped}
          className={cn(
            "w-full h-9",
            equipped
              ? "bg-slate-700 text-slate-300"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
          )}
        >
          <Check className="w-4 h-4 mr-1" /> {equipped ? "Equipped" : "Equip"}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={onBuy}
          disabled={!canAfford}
          className={cn(
            "w-full h-9",
            canAfford
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              : "bg-slate-800 text-slate-500"
          )}
        >
          {canAfford ? <Coins className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
          {item.price}
        </Button>
      )}
    </motion.div>
  );
}