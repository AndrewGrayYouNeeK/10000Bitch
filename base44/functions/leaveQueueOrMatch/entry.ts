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

    // Remove from any ACTIVE match the user is in
    const active = await svc.entities.OnlineMatch.filter({ status: 'active' });
    for (const m of active) {
      const idx = m.players?.findIndex(p => p.email === user.email);
      if (idx === undefined || idx === -1) continue;

      const newPlayers = m.players.filter(p => p.email !== user.email);

      // If 0 or 1 players remain, end the match.
      if (newPlayers.length <= 1) {
        const patch = { status: 'finished', last_action_at: new Date().toISOString() };
        // If exactly one player remains, declare them the winner.
        if (newPlayers.length === 1) {
          patch.players = newPlayers;
          patch.winner_email = newPlayers[0].email;
          patch.message = `${newPlayers[0].name} wins — opponent left.`;
          patch.message_variant = 'success';
        } else {
          patch.status = 'abandoned';
        }
        await svc.entities.OnlineMatch.update(m.id, patch);
        continue;
      }

      // Otherwise, remove the player and advance the turn if it was theirs.
      let newCurrent = m.current_index || 0;
      if (idx < newCurrent) {
        newCurrent = newCurrent - 1;
      } else if (idx === newCurrent) {
        // It was their turn — advance to next player (modulo new length).
        newCurrent = newCurrent % newPlayers.length;
      }
      await svc.entities.OnlineMatch.update(m.id, {
        players: newPlayers,
        current_index: newCurrent,
        has_rolled: false,
        turn_score: 0,
        farkle: false,
        dice: (m.dice || []).map(d => ({ ...d, held: false, used: false })),
        message: `${user.full_name || user.email} left the match.`,
        message_variant: 'warning',
        last_action_at: new Date().toISOString(),
      });
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