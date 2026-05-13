import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getSkin, getPipStyle, getBadge, getFelt } from "@/lib/shopCatalog";

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

  const buyItem = (type, item) => {
    if (!user) return { ok: false, reason: "not_loaded" };
    if (coins < item.price) return { ok: false, reason: "insufficient" };

    const key = type === "skin" ? "owned_skins" : type === "pips" ? "owned_pips" : type === "felt" ? "owned_felts" : "owned_badges";
    const current = user[key] || [];
    if (current.includes(item.id)) return { ok: false, reason: "already_owned" };

    updateMe.mutate({
      [key]: [...current, item.id],
      coins: coins - item.price,
    });
    return { ok: true };
  };

  const equipItem = (type, itemId) => {
    const key = type === "skin" ? "equipped_skin" : type === "pips" ? "equipped_pips" : type === "felt" ? "equipped_felt" : "equipped_badge";
    updateMe.mutate({ [key]: itemId });
  };

  return {
    user,
    isLoading,
    coins,
    ownedSkins, ownedPips, ownedBadges, ownedFelts,
    equippedSkinId, equippedPipsId, equippedBadgeId, equippedFeltId,
    equippedSkin, equippedPips, equippedBadge, equippedFelt,
    addCoins,
    buyItem,
    equipItem,
  };
}