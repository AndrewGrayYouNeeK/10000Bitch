// Force a waiting match to start (called by client after a short wait, if it has 2+ players)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function makeFreshDice() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: i, value: i + 1, used: false, held: false,
  }));
}

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

    // Only allow start if I'm a player in this waiting match and it has 2+ players
    if (match.status !== 'waiting') {
      return Response.json({ ok: true, status: match.status });
    }
    if (!match.players?.some(p => p.email === user.email)) {
      return Response.json({ error: 'Not a player in this match' }, { status: 403 });
    }
    if ((match.players?.length || 0) < 2) {
      return Response.json({ ok: false, reason: 'need_more_players' });
    }

    const players = match.players;
    await svc.entities.OnlineMatch.update(match_id, {
      status: 'active',
      dice: makeFreshDice(),
      current_index: 0,
      has_rolled: false,
      turn_score: 0,
      farkle: false,
      message: `${players[0].name}'s turn — roll the dice!`,
      message_variant: 'info',
      last_action_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, status: 'active' });
  } catch (error) {
    console.error('startWaitingMatch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});