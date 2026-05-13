// Distributes XP/coin rewards for a finished online match. 1.5x bonus on wins.
// Idempotent per-user: tracks which players have already claimed.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FINISH_XP = 25;
const WIN_XP = 100;
const FIRST_WIN_XP = 250;
const TEN_WINS_XP = 500;
const NO_FARKLE_XP = 75;
const PERFECT_TENK_XP = 2500;
const ONLINE_BONUS = 1.5;
const PERFECT_TENK_REWARD = { skinId: 'matrix', badgeId: 'perfect_tenK' };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { match_id } = await req.json();
    if (!match_id) return Response.json({ error: 'match_id required' }, { status: 400 });

    const svc = base44.asServiceRole;
    const match = await svc.entities.OnlineMatch.get(match_id);
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });
    if (match.status !== 'finished') {
      return Response.json({ error: 'Match not finished' }, { status: 400 });
    }
    const inMatch = match.players?.some(p => p.email === user.email);
    if (!inMatch) return Response.json({ error: 'Not a player' }, { status: 403 });

    // Idempotency — track claimed emails in match.rewards_claimed (we store on the user instead via a simple flag)
    // Simpler: use match.players_claimed array stored as an extra field on the user
    const claimedKey = `online_rewards_claimed_${match_id}`;
    if (user[claimedKey]) {
      return Response.json({ ok: true, alreadyClaimed: true });
    }

    const won = match.winner_email === user.email;
    const perfectTenK = !!match.perfect_ten_k && won;
    const noFarkle = (match.bust_count || 0) === 0;

    let xpGain = FINISH_XP;
    let coinGain = 0;

    if (won) {
      xpGain += WIN_XP;
      coinGain += 200;
      const prevWins = user.wins ?? 0;
      if (prevWins === 0) xpGain += FIRST_WIN_XP;
      if (prevWins + 1 === 10) xpGain += TEN_WINS_XP;
      if (noFarkle) xpGain += NO_FARKLE_XP;
    }

    // 1.5x online bonus
    xpGain = Math.round(xpGain * ONLINE_BONUS);
    coinGain = Math.round(coinGain * ONLINE_BONUS);

    const patch = {
      xp: Math.max(0, (user.xp ?? 0) + xpGain),
      coins: Math.max(0, (user.coins ?? 0) + coinGain),
      games_finished: (user.games_finished ?? 0) + 1,
      wins: (user.wins ?? 0) + (won ? 1 : 0),
      [claimedKey]: true,
    };

    let rewardGranted = null;
    if (perfectTenK) {
      xpGain += Math.round(PERFECT_TENK_XP * ONLINE_BONUS);
      patch.xp = Math.max(0, (user.xp ?? 0) + xpGain);
      patch.coins = patch.coins + Math.round(1000 * ONLINE_BONUS);
      const skins = user.owned_skins || ['classic_white'];
      const badges = user.owned_badges || [];
      if (!skins.includes(PERFECT_TENK_REWARD.skinId)) {
        patch.owned_skins = [...skins, PERFECT_TENK_REWARD.skinId];
      }
      if (!badges.includes(PERFECT_TENK_REWARD.badgeId)) {
        patch.owned_badges = [...badges, PERFECT_TENK_REWARD.badgeId];
      }
      rewardGranted = PERFECT_TENK_REWARD;
    }

    await base44.auth.updateMe(patch);

    return Response.json({
      ok: true,
      won,
      xpGain,
      coinGain,
      perfectTenK,
      rewardGranted,
    });
  } catch (error) {
    console.error('claimMatchRewards error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});