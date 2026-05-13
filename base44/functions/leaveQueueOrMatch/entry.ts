import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;

    // Remove from any waiting match the user is in (only if it hasn't started)
    const waiting = await svc.entities.OnlineMatch.filter({ status: 'waiting' });
    for (const m of waiting) {
      if (m.players?.some(p => p.email === user.email)) {
        const newPlayers = m.players.filter(p => p.email !== user.email);
        if (newPlayers.length === 0) {
          await svc.entities.OnlineMatch.update(m.id, { status: 'abandoned' });
        } else {
          await svc.entities.OnlineMatch.update(m.id, { players: newPlayers });
        }
      }
    }

    // Clean up any queue entries
    const queueEntries = await svc.entities.MatchmakingQueue.filter({ email: user.email });
    for (const e of queueEntries) {
      await svc.entities.MatchmakingQueue.delete(e.id);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('leaveQueueOrMatch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});