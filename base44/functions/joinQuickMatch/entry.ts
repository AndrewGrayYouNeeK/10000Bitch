import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_PLAYERS = 4;
const WAIT_FOR_FILL_MS = 8000; // After 2 are queued, wait this long to try to fill up to 4

// Mirrors lib/progression.js — level curve based on XP (1–100).
function levelForXp(xp = 0) {
  if (xp <= 0) return 1;
  const lvl = Math.floor(Math.sqrt(xp / 50)) + 1;
  return Math.min(100, Math.max(1, lvl));
}

// Mirrors lib/progression.js — tier thresholds (0=Bronze ... 4=Mythic).
const TIER_MIN_XP = [0, 2000, 15000, 60000, 180000];
function tierForXp(xp = 0) {
  let t = 0;
  for (let i = 0; i < TIER_MIN_XP.length; i++) {
    if (xp >= TIER_MIN_XP[i]) t = i;
  }
  return t;
}

function makeFreshDice() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: i,
    value: i + 1,
    used: false,
    held: false,
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;

    // Already in queue? Return existing entry.
    const existing = await svc.entities.MatchmakingQueue.filter({ email: user.email });
    if (existing.length > 0) {
      const entry = existing[0];
      if (entry.match_id) {
        return Response.json({ match_id: entry.match_id, queued: false });
      }
      return Response.json({ queue_id: entry.id, queued: true });
    }

    // Already in an active match?
    const activeMatches = await svc.entities.OnlineMatch.filter({ status: 'active' });
    const myActive = activeMatches.find(m =>
      Array.isArray(m.players) && m.players.some(p => p.email === user.email)
    );
    if (myActive) {
      return Response.json({ match_id: myActive.id, queued: false });
    }

    // Read cosmetics from request body (client sends what to display)
    const body = await req.json().catch(() => ({}));
    const skin_id = body.skin_id || 'classic_white';
    const felt_id = body.felt_id || 'classic_green';
    const badge_id = body.badge_id || '';

    // Compute level + tier server-side from the user's stored XP (anti-tamper).
    const userXp = user.xp ?? 0;
    const level = levelForXp(userXp);
    const tier_id = tierForXp(userXp);

    // Look for a waiting match with room
    const waitingMatches = await svc.entities.OnlineMatch.filter({ status: 'waiting' });
    const joinable = waitingMatches.find(m =>
      Array.isArray(m.players) &&
      m.players.length < (m.max_players || MAX_PLAYERS) &&
      !m.players.some(p => p.email === user.email)
    );

    if (joinable) {
      const newPlayers = [
        ...joinable.players,
        {
          email: user.email,
          name: user.full_name || user.email,
          score: 0,
          onBoard: false,
          skin_id,
          felt_id,
          badge_id,
          level,
          tier_id,
        },
      ];

      // If we hit max, start immediately. Otherwise stay waiting.
      const shouldStart = newPlayers.length >= (joinable.max_players || MAX_PLAYERS);
      const patch = {
        players: newPlayers,
        last_action_at: new Date().toISOString(),
      };
      if (shouldStart) {
        patch.status = 'active';
        patch.dice = makeFreshDice();
        patch.current_index = 0;
        patch.has_rolled = false;
        patch.turn_score = 0;
        patch.message = `${newPlayers[0].name}'s turn — roll the dice!`;
        patch.message_variant = 'info';
      }
      await svc.entities.OnlineMatch.update(joinable.id, patch);
      return Response.json({ match_id: joinable.id, queued: false });
    }

    // Otherwise create a new waiting match
    const match = await svc.entities.OnlineMatch.create({
      status: 'waiting',
      max_players: MAX_PLAYERS,
      players: [
        {
          email: user.email,
          name: user.full_name || user.email,
          score: 0,
          onBoard: false,
          skin_id,
          felt_id,
          badge_id,
          level,
          tier_id,
        },
      ],
      dice: makeFreshDice(),
      current_index: 0,
      has_rolled: false,
      turn_score: 0,
      farkle: false,
      bust_count: 0,
      message: 'Waiting for players...',
      message_variant: 'info',
      last_action_at: new Date().toISOString(),
    });

    return Response.json({ match_id: match.id, queued: false });
  } catch (error) {
    console.error('joinQuickMatch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});