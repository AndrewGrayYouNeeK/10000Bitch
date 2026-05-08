import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { getSkin } from "@/lib/shopCatalog";
import Die from "@/components/game/Die";
import { toast } from "sonner";

const DEFAULT_SKIN_ID = "classic_white";

export default function SkinShop() {
  const [user, setUser] = useState(null);
  const [availableSkins, setAvailableSkins] = useState([]);
  const [ownedSkinIds, setOwnedSkinIds] = useState(new Set([DEFAULT_SKIN_ID]));
  const [equippedSkinId, setEquippedSkinId] = useState(DEFAULT_SKIN_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [me, skins] = await Promise.all([
        base44.auth.me(),
        base44.entities.AvailableSkin.filter({ is_active: true }),
      ]);
      setUser(me);
      setAvailableSkins(skins);
      setEquippedSkinId(me?.equipped_skin || DEFAULT_SKIN_ID);

      // Always own the default skin
      const owned = new Set([DEFAULT_SKIN_ID]);
      if (me) {
        const userSkins = await base44.entities.UserSkin.filter({ user_id: me.email });
        userSkins.forEach(us => owned.add(us.skin_id));
        // Also include skins from legacy owned_skins array on user
        (me.owned_skins || []).forEach(id => owned.add(id));
      }
      setOwnedSkinIds(owned);
    } catch (e) {
      toast.error("Failed to load shop.");
    }
    setLoading(false);
  }

  async function handleBuy(skin) {
    if (!user) return;
    const coins = user.coins ?? 0;
    if (coins < skin.price) {
      toast.error("Not enough coins!");
      return;
    }
    try {
      await Promise.all([
        base44.entities.UserSkin.create({
          user_id: user.email,
          skin_id: skin.skin_id,
          purchased_at: new Date().toISOString().split("T")[0],
        }),
        base44.auth.updateMe({ coins: coins - skin.price }),
      ]);
      setOwnedSkinIds(prev => new Set([...prev, skin.skin_id]));
      setUser(prev => ({ ...prev, coins: coins - skin.price }));
      toast.success(`${skin.name} unlocked!`);
    } catch (e) {
      toast.error("Purchase failed.");
    }
  }

  async function handleEquip(skinId) {
    try {
      await base44.auth.updateMe({ equipped_skin: skinId });
      setEquippedSkinId(skinId);
      toast.success("Skin equipped!");
    } catch (e) {
      toast.error("Failed to equip skin.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-lg font-bold">Skin Shop</h1>
        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
          <Coins className="w-4 h-4" />
          {(user?.coins ?? 0).toLocaleString()}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {availableSkins.map((skin, i) => {
          const owned = ownedSkinIds.has(skin.skin_id);
          const equipped = equippedSkinId === skin.skin_id;
          const catalog = getSkin(skin.skin_id);

          return (
            <motion.div
              key={skin.skin_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-4 flex flex-col items-center gap-3 bg-slate-800/60 ${
                equipped ? "border-amber-400 shadow-lg shadow-amber-400/20" : "border-slate-700"
              }`}
            >
              {/* Die preview */}
              <div className="relative">
                <Die value={5} skinId={skin.skin_id} pipsId="classic_dots" size={64} />
                {!owned && (
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white/70" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="font-bold text-sm">{skin.name}</div>
                {catalog?.description && (
                  <div className="text-xs text-slate-400 mt-0.5">{catalog.description}</div>
                )}
              </div>

              {/* Action */}
              {equipped ? (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Equipped
                </div>
              ) : owned ? (
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  onClick={() => handleEquip(skin.skin_id)}
                >
                  Equip
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                  onClick={() => handleBuy(skin)}
                  disabled={!user || (user.coins ?? 0) < skin.price}
                >
                  🪙 {skin.price.toLocaleString()}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}