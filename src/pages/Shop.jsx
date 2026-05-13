import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DICE_SKINS, BADGES, FELT_COLORS, getFelt } from "@/lib/shopCatalog";
import { getDuplicateGroups } from "@/lib/duplicateSkins";
import { useCosmetics } from "@/hooks/useCosmetics";
import { getSkinTier, isSkinUnlockedByTier as checkUnlocked, isSkinAchievementOnly } from "@/lib/progression";
import ShopItemCard from "@/components/shop/ShopItemCard";
import DicePreview from "@/components/shop/DicePreview";
import BadgePreview from "@/components/shop/BadgePreview";
import FeltPreview from "@/components/shop/FeltPreview";
import BuyCoinsDialog from "@/components/shop/BuyCoinsDialog";

export default function Shop() {
  const {
    coins, xp, currentTier, nextTier, isLoading,
    ownedSkins, ownedPips, ownedBadges, ownedFelts,
    equippedSkinId, equippedPipsId, equippedBadgeId, equippedFeltId,
    buyItem, equipItem, addCoins, getSkinEffectivePrice,
  } = useCosmetics();
  const [tab, setTab] = useState("skins");

  const handleBuy = (type, item) => {
    const res = buyItem(type, item);
    if (!res.ok) {
      if (res.reason === "insufficient") toast.error("Not enough coins!");
      else if (res.reason === "already_owned") toast.info("Already owned.");
      else if (res.reason === "achievement_only") toast.error("Mythic dice are earned by playing — no shortcut.");
      return;
    }
    toast.success(`Unlocked ${item.name}!`);
  };

  const handleEquip = (type, item) => {
    equipItem(type, item.id);
    toast.success(`Equipped ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-black text-white">
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
        {/* Tier progress */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${currentTier?.chip || ""}`}>
                {currentTier?.name || "Bronze"}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {xp.toLocaleString()} XP
              </span>
            </div>
            {nextTier && (
              <div className="text-xs text-slate-400">
                Next: <span className="text-white font-bold">{nextTier.name}</span> at {nextTier.minXp.toLocaleString()} XP
              </div>
            )}
            {!nextTier && (
              <div className="text-xs text-fuchsia-300 font-bold">MAX TIER</div>
            )}
          </div>
          {nextTier && (
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${currentTier?.color || ""} transition-all`}
                style={{
                  width: `${Math.min(100, Math.max(0, ((xp - (currentTier?.minXp || 0)) / (nextTier.minXp - (currentTier?.minXp || 0))) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full bg-slate-900 border border-slate-800">
            <TabsTrigger value="skins">Dice Skins</TabsTrigger>
            <TabsTrigger value="felts">Felts</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="skins" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const dupes = getDuplicateGroups(DICE_SKINS);
                const sortedSkins = [...DICE_SKINS].sort(
                  (a, b) => getSkinEffectivePrice(a) - getSkinEffectivePrice(b)
                );
                return sortedSkins.map(skin => {
                  const tier = getSkinTier(skin.id);
                  const tierLocked = !checkUnlocked(skin.id, xp);
                  const achievementOnly = isSkinAchievementOnly(skin.id, xp);
                  const effectivePrice = getSkinEffectivePrice(skin);
                  return (
                    <ShopItemCard
                      key={skin.id}
                      item={skin}
                      owned={ownedSkins.includes(skin.id)}
                      equipped={equippedSkinId === skin.id}
                      canAfford={coins >= effectivePrice}
                      onBuy={() => handleBuy("skin", skin)}
                      onEquip={() => handleEquip("skin", skin)}
                      preview={<DicePreview skinId={skin.id} pipsId={equippedPipsId} />}
                      duplicateTag={dupes[skin.id]}
                      tier={tier}
                      tierLocked={tierLocked}
                      achievementOnly={achievementOnly}
                      effectivePrice={effectivePrice}
                    />
                  );
                });
              })()}
            </div>
          </TabsContent>

          <TabsContent value="felts" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {FELT_COLORS.map(felt => (
                <ShopItemCard
                  key={felt.id}
                  item={felt}
                  owned={ownedFelts.includes(felt.id)}
                  equipped={equippedFeltId === felt.id}
                  canAfford={coins >= felt.price}
                  onBuy={() => handleBuy("felt", felt)}
                  onEquip={() => handleEquip("felt", felt)}
                  preview={<FeltPreview felt={felt} />}
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
          Earn coins by banking points & winning games. Earn <b className="text-amber-300">XP</b> by finishing games, winning, and hitting milestones — climb tiers to unlock the rarest dice. Locked dice can be bought at a 10× shortcut price, except <b className="text-fuchsia-300">Mythic</b> dice — those can only be earned by reaching the tier.
        </p>
      </div>
    </div>
  );
}