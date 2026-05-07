import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DICE_SKINS, PIP_STYLES, BADGES } from "@/lib/shopCatalog";
import { useCosmetics } from "@/hooks/useCosmetics";
import ShopItemCard from "@/components/shop/ShopItemCard";
import DicePreview from "@/components/shop/DicePreview";
import BadgePreview from "@/components/shop/BadgePreview";
import BuyCoinsDialog from "@/components/shop/BuyCoinsDialog";

export default function Shop() {
  const {
    coins, isLoading,
    ownedSkins, ownedPips, ownedBadges,
    equippedSkinId, equippedPipsId, equippedBadgeId,
    buyItem, equipItem, addCoins,
  } = useCosmetics();
  const [tab, setTab] = useState("skins");

  const handleBuy = (type, item) => {
    const res = buyItem(type, item);
    if (!res.ok) {
      if (res.reason === "insufficient") toast.error("Not enough coins!");
      else if (res.reason === "already_owned") toast.info("Already owned.");
      return;
    }
    toast.success(`Unlocked ${item.name}!`);
  };

  const handleEquip = (type, item) => {
    equipItem(type, item.id);
    toast.success(`Equipped ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-green-900 to-emerald-950 text-white">
      <div className="sticky top-0 z-10 backdrop-blur bg-slate-950/80 border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Shop
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-black tabular-nums text-amber-300">
              {isLoading ? "…" : coins.toLocaleString()}
            </span>
          </div>
          <BuyCoinsDialog onPurchase={(amount) => addCoins(amount)} />
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full bg-slate-900 border border-slate-800">
            <TabsTrigger value="skins">Dice Skins</TabsTrigger>
            <TabsTrigger value="pips">Pips</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="skins" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {DICE_SKINS.map(skin => (
                <ShopItemCard
                  key={skin.id}
                  item={skin}
                  owned={ownedSkins.includes(skin.id)}
                  equipped={equippedSkinId === skin.id}
                  canAfford={coins >= skin.price}
                  onBuy={() => handleBuy("skin", skin)}
                  onEquip={() => handleEquip("skin", skin)}
                  preview={<DicePreview skinId={skin.id} pipsId={equippedPipsId} />}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pips" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {PIP_STYLES.map(pip => (
                <ShopItemCard
                  key={pip.id}
                  item={pip}
                  owned={ownedPips.includes(pip.id)}
                  equipped={equippedPipsId === pip.id}
                  canAfford={coins >= pip.price}
                  onBuy={() => handleBuy("pips", pip)}
                  onEquip={() => handleEquip("pips", pip)}
                  preview={<DicePreview skinId={equippedSkinId} pipsId={pip.id} />}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map(badge => (
                <ShopItemCard
                  key={badge.id}
                  item={badge}
                  owned={ownedBadges.includes(badge.id)}
                  equipped={equippedBadgeId === badge.id}
                  canAfford={coins >= badge.price}
                  onBuy={() => handleBuy("badge", badge)}
                  onEquip={() => handleEquip("badge", badge)}
                  preview={<BadgePreview badge={badge} />}
                />
              ))}
              {equippedBadgeId && (
                <div className="col-span-2">
                  <Button
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                    onClick={() => { equipItem("badge", ""); toast.success("Badge removed"); }}
                  >
                    Unequip Badge
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-slate-500 mt-6 pb-10">
          Earn coins by banking points & winning games. 1 coin per 100 points banked + 200 bonus for wins.
        </p>
      </div>
    </div>
  );
}