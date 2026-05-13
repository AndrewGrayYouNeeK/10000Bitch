import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getSkin, getPipStyle, getBadge, getFelt } from "@/lib/shopCatalog";
import {
  getTierForXp,
  getNextTier,
  getSkinEffectivePrice,
  isSkinUnlockedByTier,
  isSkinAchievementOnly,
} from "@/lib/progression";

// Fetches the current user (with cosmetics fields) and exposes equipped/owned helpers + mutations.
export function useCosmetics() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 30,
  });

  const updateMe = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], (prev) => ({ ...(prev || {}), ...(updated || {}) }));
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const coins = user?.coins ?? 0;
  const xp = user?.xp ?? 0;
  const currentTier = getTierForXp(xp);
  const nextTier = getNextTier(xp);
  const introSeen = user?.intro_seen ?? false;
  const ownedSkins = user?.owned_skins ?? ["classic_white"];
  const ownedPips = user?.owned_pips ?? ["classic_dots"];
  const ownedBadges = user?.owned_badges ?? [];
  const ownedFelts = user?.owned_felts ?? ["classic_green"];
  const equippedSkinId = user?.equipped_skin || "classic_white";
  const equippedPipsId = user?.equipped_pips || "classic_dots";
  const equippedBadgeId = user?.equipped_badge || "";
  const equippedFeltId = user?.equipped_felt || "classic_green";

  const equippedSkin = getSkin(equippedSkinId);
  const equippedPips = getPipStyle(equippedPipsId);
  const equippedBadge = getBadge(equippedBadgeId);
  const equippedFelt = getFelt(equippedFeltId);

  const addCoins = (delta) => {
    if (!user || !delta) return;
    updateMe.mutate({ coins: Math.max(0, (user.coins ?? 0) + delta) });
  };

  const addXp = (delta) => {
    if (!user || !delta) return;
    updateMe.mutate({ xp: Math.max(0, (user.xp ?? 0) + delta) });
  };

  // Update XP, wins, and games_finished in a single mutation when a game ends.
  const recordGameResult = ({ won, xpGain }) => {
    if (!user) return;
    updateMe.mutate({
      xp: Math.max(0, (user.xp ?? 0) + (xpGain || 0)),
      games_finished: (user.games_finished ?? 0) + 1,
      wins: (user.wins ?? 0) + (won ? 1 : 0),
    });
  };

  const markIntroSeen = () => {
    if (!user || user.intro_seen) return;
    updateMe.mutate({ intro_seen: true });
  };

  const buyItem = (type, item) => {
    if (!user) return { ok: false, reason: "not_loaded" };

    // Mythic-tier skins are achievement-only — no shortcut purchase allowed.
    if (type === "skin" && isSkinAchievementOnly(item.id, xp)) {
      return { ok: false, reason: "achievement_only" };
    }

    // For skins, apply the tier shortcut multiplier when buying above your tier.
    const effectivePrice = type === "skin" ? getSkinEffectivePrice(item, xp) : item.price;
    if (coins < effectivePrice) return { ok: false, reason: "insufficient" };

    const key = type === "skin" ? "owned_skins" : type === "pips" ? "owned_pips" : type === "felt" ? "owned_felts" : "owned_badges";
    const current = user[key] || [];
    if (current.includes(item.id)) return { ok: false, reason: "already_owned" };

    updateMe.mutate({
      [key]: [...current, item.id],
      coins: coins - effectivePrice,
    });
    return { ok: true, pricePaid: effectivePrice };
  };

  const equipItem = (type, itemId) => {
    const key = type === "skin" ? "equipped_skin" : type === "pips" ? "equipped_pips" : type === "felt" ? "equipped_felt" : "equipped_badge";
    updateMe.mutate({ [key]: itemId });
  };

  // Grants ownership of a skin and/or badge without spending coins (achievement rewards).
  const grantReward = ({ skinId, badgeId }) => {
    if (!user) return { skinGranted: false, badgeGranted: false };
    const skins = user.owned_skins || ["classic_white"];
    const badges = user.owned_badges || [];
    const patch = {};
    let skinGranted = false;
    let badgeGranted = false;
    if (skinId && !skins.includes(skinId)) {
      patch.owned_skins = [...skins, skinId];
      skinGranted = true;
    }
    if (badgeId && !badges.includes(badgeId)) {
      patch.owned_badges = [...badges, badgeId];
      badgeGranted = true;
    }
    if (Object.keys(patch).length > 0) updateMe.mutate(patch);
    return { skinGranted, badgeGranted };
  };

  return {
    user,
    isLoading,
    coins, xp, currentTier, nextTier, introSeen,
    ownedSkins, ownedPips, ownedBadges, ownedFelts,
    equippedSkinId, equippedPipsId, equippedBadgeId, equippedFeltId,
    equippedSkin, equippedPips, equippedBadge, equippedFelt,
    addCoins, addXp, markIntroSeen, recordGameResult,
    buyItem,
    equipItem,
    grantReward,
    getSkinEffectivePrice: (skin) => getSkinEffectivePrice(skin, xp),
    isSkinUnlockedByTier: (skinId) => isSkinUnlockedByTier(skinId, xp),
    isSkinAchievementOnly: (skinId) => isSkinAchievementOnly(skinId, xp),
  };
}