import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { DICE_SKINS, FELT_COLORS, getSkin, getFelt } from "@/lib/shopCatalog";
import {
  getSkinPool,
  getFeltPool,
  rollOdds,
  pickRandom,
} from "@/lib/mysteryBoxes";

// Refund (gray quarters / consolation coins) when rolled item is already owned.
const DUPLICATE_REFUNDS = {
  common: 75,
  rare: 200,
  legendary: 600,
  standard: 100,
  premium: 300,
};

/**
 * Handles the full open-box flow:
 *   1. Deduct price
 *   2. Roll weighted reward
 *   3. Grant item (or refund coins on duplicate)
 *   4. Return the resolved reward for the reveal modal
 */
export function useMysteryBox() {
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState(false);

  const openBox = async (box, user) => {
    if (!user || opening) return null;
    if ((user.coins ?? 0) < box.price) return { error: "insufficient" };

    setOpening(true);
    try {
      // Roll the prize tier from the box's odds table.
      const outcome = rollOdds(box.odds);

      let reward = null;
      const patch = { coins: (user.coins ?? 0) - box.price };

      if (outcome.type === "coins") {
        patch.coins += outcome.amount;
        reward = { type: "coins", amount: outcome.amount };
      } else if (outcome.type === "skin") {
        const pool = getSkinPool(DICE_SKINS, outcome.pool);
        const candidates = pool.filter(
          (s) => !(user.owned_skins || ["classic_white"]).includes(s.id)
        );
        if (candidates.length > 0) {
          const picked = pickRandom(candidates);
          patch.owned_skins = [...(user.owned_skins || ["classic_white"]), picked.id];
          reward = { type: "skin", item: picked };
        } else {
          // All owned — convert to coin refund.
          const refund = DUPLICATE_REFUNDS[outcome.pool] || 100;
          patch.coins += refund;
          const fallback = pickRandom(pool);
          reward = { type: "skin", item: fallback, duplicate: true, refund };
        }
      } else if (outcome.type === "felt") {
        const pool = getFeltPool(FELT_COLORS, outcome.pool);
        const candidates = pool.filter(
          (f) => !(user.owned_felts || ["classic_green"]).includes(f.id)
        );
        if (candidates.length > 0) {
          const picked = pickRandom(candidates);
          patch.owned_felts = [...(user.owned_felts || ["classic_green"]), picked.id];
          reward = { type: "felt", item: picked };
        } else {
          const refund = DUPLICATE_REFUNDS[outcome.pool] || 100;
          patch.coins += refund;
          const fallback = pickRandom(pool);
          reward = { type: "felt", item: fallback, duplicate: true, refund };
        }
      }

      await base44.auth.updateMe(patch);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      return reward;
    } finally {
      setOpening(false);
    }
  };

  return { openBox, opening };
}