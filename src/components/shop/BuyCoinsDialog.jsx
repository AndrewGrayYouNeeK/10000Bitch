import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { COIN_PACKS } from "@/lib/shopCatalog";
import { toast } from "sonner";

export default function BuyCoinsDialog({ onPurchase }) {
  const [open, setOpen] = React.useState(false);

  const handleBuy = (pack) => {
    onPurchase(pack.coins);
    toast.success(`+${pack.coins.toLocaleString()} coins added!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-9 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold"
        >
          <Zap className="w-4 h-4 mr-1" /> Buy Coins
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" /> Buy Coins
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Skip the grind — grab a pack and unlock skins instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {COIN_PACKS.map((pack) => (
            <motion.button
              key={pack.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBuy(pack)}
              className="rounded-2xl p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 hover:border-amber-400 transition-colors flex flex-col items-center gap-1 text-center"
            >
              <div className="text-3xl">{pack.emoji}</div>
              <div className="font-bold text-white text-sm">{pack.name}</div>
              <div className="flex items-center gap-1 text-amber-300 font-black">
                <Coins className="w-3.5 h-3.5" />
                {pack.coins.toLocaleString()}
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-2">
          Demo mode — coins are added instantly, no payment required.
        </p>
      </DialogContent>
    </Dialog>
  );
}