// Server-side authoritative game logic for online matches.
// Actions: roll, toggle_hold, roll_again, bank, pass_farkle
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TARGET_SCORE = 10000;
const ENTRY_THRESHOLD = 1000;
const BUST_WORDS = ['YEEET!', 'SKEERT!'];

// ===== Scoring (mirrored from lib/scoring.js) =====
function countFaces(dice) {
  const c = [0, 0, 0, 0, 0, 0, 0];
  dice.forEach(d => { c[d]++; });
  return c;
}
function scoreSelection(dice) {
  if (!dice || dice.length === 0) return { score: 0, valid: false };
  const counts = countFaces(dice);
  let score = 0;
  const remaining = [...counts];

  // Six of a kind — instant win
  for (let f = 1; f <= 6; f++) {
    if (remaining[f] >= 6) return { score: 0, valid: true, sixOfAKind: true, face: f };
  }

  // Large straight 1-6
  if (dice.length === 6 && [1,2,3,4,5,6].every(f => counts[f] === 1)) {
    return { score: 1500, valid: true, straight: true };
  }

  // Small straight (5 dice)
  if (dice.length === 5) {
    if ([1,2,3,4,5].every(f => counts[f] === 1)) return { score: 1000, valid: true, smallStraight: true };
    if ([2,3,4,5,6].every(f => counts[f] === 1)) return { score: 1000, valid: true, smallStraight: true };
  }
  // Small straight + extra scoring die (6 dice)
  if (dice.length === 6) {
    if (counts[1] === 2 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1 && counts[6] === 0) {
      return { score: 1100, valid: true, smallStraight: true };
    }
    if (counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 2 && counts[6] === 0) {
      return { score: 1050, valid: true, smallStraight: true };
    }
    if (counts[1] === 0 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 2 && counts[6] === 1) {
      return { score: 1050, valid: true, smallStraight: true };
    }
  }

  // Three pairs (6 dice)
  if (dice.length === 6) {
    const pairs = [1,2,3,4,5,6].filter(f => counts[f] === 2).length;
    if (pairs === 3) return { score: 1500, valid: true, threePairs: true };
  }

  // Five of a kind => flat 4000
  for (let f = 1; f <= 6; f++) {
    if (remaining[f] >= 5) { score += 4000; remaining[f] -= 5; }
  }
  // Four of a kind => flat 2000
  for (let f = 1; f <= 6; f++) {
    if (remaining[f] >= 4) { score += 2000; remaining[f] -= 4; }
  }
  // Three of a kind
  for (let f = 1; f <= 6; f++) {
    if (remaining[f] >= 3) { score += f === 1 ? 1000 : f * 100; remaining[f] -= 3; }
  }
  // Remaining 1s and 5s
  score += remaining[1] * 100; remaining[1] = 0;
  score += remaining[5] * 50;  remaining[5] = 0;
  const unscored = remaining.reduce((a, b) => a + b, 0);
  return { score, valid: unscored === 0 };
}
function hasAnyScore(dice) {
  if (!dice || dice.length === 0) return false;
  const counts = countFaces(dice);
  if (counts[1] > 0 || counts[5] > 0) return true;
  for (let f = 1; f <= 6; f++) if (counts[f] >= 3) return true;
  if (dice.length === 6 && [1,2,3,4,5,6].every(f => counts[f] === 1)) return true;
  // Small straight in the roll
  if ([1,2,3,4,5].every(f => counts[f] >= 1)) return true;
  if ([2,3,4,5,6].every(f => counts[f] >= 1)) return true;
  if (dice.length === 6) {
    const pairs = [1,2,3,4,5,6].filter(f => counts[f] === 2).length;
    if (pairs === 3) return true;
  }
  return false;
}

// ===== Helpers =====
function freshDice() {
  return Array.from({ length: 6 }, (_, i) => ({ id: i, value: i + 1, used: false, held: false }));
}
function rollUnusedDice(dice) {
  return dice.map(d => d.used ? d : { ...d, value: Math.floor(Math.random() * 6) + 1, held: false });
}
function getHeldInfo(dice) {
  const held = dice.filter(d => d.held && !d.used).map(d => d.value);
  return { held, ...scoreSelection(held) };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { match_id, action, die_id } = await req.json();
    if (!match_id || !action) {
      return Response.json({ error: 'match_id and action required' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const match = await svc.entities.OnlineMatch.get(match_id);
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });
    if (match.status !== 'active') {
      return Response.json({ error: 'Match is not active' }, { status: 400 });
    }

    const players = [...(match.players || [])];
    const currentPlayer = players[match.current_index];
    if (!currentPlayer) return Response.json({ error: 'Invalid state' }, { status: 400 });
    if (currentPlayer.email !== user.email) {
      return Response.json({ error: 'Not your turn' }, { status: 403 });
    }

    let dice = (match.dice || freshDice()).map(d => ({ ...d }));
    let turnScore = match.turn_score || 0;
    let hasRolled = !!match.has_rolled;
    let farkle = !!match.farkle;
    let bustCount = match.bust_count || 0;
    let message = match.message || '';
    let messageVariant = match.message_variant || 'info';
    let lastBustWord = match.last_bust_word || null;
    let winnerEmail = null;
    let perfectTenK = false;
    let currentIndex = match.current_index;
    let status = match.status;

    const advance = () => {
      currentIndex = (currentIndex + 1) % players.length;
      dice = freshDice();
      turnScore = 0;
      hasRolled = false;
      farkle = false;
    };

    if (action === 'roll') {
      if (hasRolled || farkle) return Response.json({ error: 'Cannot roll now' }, { status: 400 });
      dice = rollUnusedDice(dice);
      hasRolled = true;
      const active = dice.filter(d => !d.used).map(d => d.value);
      if (!hasAnyScore(active)) {
        const word = BUST_WORDS[bustCount % BUST_WORDS.length];
        farkle = true;
        turnScore = 0;
        bustCount += 1;
        lastBustWord = word;
        message = `💥 ${word} ${currentPlayer.name} loses turn score.`;
        messageVariant = 'danger';
      } else {
        message = 'Select scoring dice, then bank or roll again.';
        messageVariant = 'info';
      }
    }
    else if (action === 'toggle_hold') {
      if (farkle || !hasRolled) return Response.json({ error: 'Cannot select now' }, { status: 400 });
      dice = dice.map(d => d.id === die_id && !d.used ? { ...d, held: !d.held } : d);
    }
    else if (action === 'roll_again') {
      const info = getHeldInfo(dice);
      if (!info.valid || (info.score === 0 && !info.sixOfAKind)) {
        return Response.json({ error: 'Invalid selection' }, { status: 400 });
      }
      if (info.sixOfAKind) {
        // Instant win = Perfect 10,000
        players[currentIndex] = { ...currentPlayer, score: TARGET_SCORE, onBoard: true };
        winnerEmail = currentPlayer.email;
        perfectTenK = true;
        status = 'finished';
        message = `🎯 PERFECT 10,000 — SIX OF A KIND INSTANT WIN!`;
        messageVariant = 'success';
      } else {
        dice = dice.map(d => d.held ? { ...d, used: true, held: false } : d);
        turnScore += info.score;
        if (dice.every(d => d.used)) dice = freshDice();
        dice = rollUnusedDice(dice);
        hasRolled = true;
        const activeVals = dice.filter(d => !d.used).map(d => d.value);
        if (!hasAnyScore(activeVals)) {
          const word = BUST_WORDS[bustCount % BUST_WORDS.length];
          farkle = true;
          turnScore = 0;
          bustCount += 1;
          lastBustWord = word;
          message = `💥 ${word} ${currentPlayer.name} loses turn score.`;
          messageVariant = 'danger';
        } else {
          message = 'Select scoring dice, then bank or roll again.';
          messageVariant = 'info';
        }
      }
    }
    else if (action === 'bank') {
      const info = getHeldInfo(dice);
      let finalTurn = turnScore;
      if (info.valid && info.score > 0) finalTurn += info.score;

      if (!currentPlayer.onBoard && finalTurn < ENTRY_THRESHOLD) {
        message = `${currentPlayer.name} needs 1,000 to get on the board. Banked 0.`;
        messageVariant = 'warning';
        advance();
      } else if (currentPlayer.score + finalTurn > TARGET_SCORE) {
        message = `💥 Overshoot! ${currentPlayer.name} needed exactly ${TARGET_SCORE - currentPlayer.score} — banked 0.`;
        messageVariant = 'danger';
        advance();
      } else {
        players[currentIndex] = {
          ...currentPlayer,
          score: currentPlayer.score + finalTurn,
          onBoard: true,
        };
        if (players[currentIndex].score >= TARGET_SCORE) {
          winnerEmail = players[currentIndex].email;
          status = 'finished';
          message = `🎉 ${players[currentIndex].name} wins with ${players[currentIndex].score.toLocaleString()}!`;
          messageVariant = 'success';
        } else {
          message = `${currentPlayer.name} banked ${finalTurn.toLocaleString()}!`;
          messageVariant = 'success';
          advance();
          message = `${message} ${players[currentIndex].name}'s turn.`;
        }
      }
    }
    else if (action === 'pass_farkle') {
      if (!farkle) return Response.json({ error: 'Not in farkle' }, { status: 400 });
      advance();
      message = `${players[currentIndex].name}'s turn — roll the dice!`;
      messageVariant = 'info';
    }
    else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const patch = {
      players,
      dice,
      current_index: currentIndex,
      has_rolled: hasRolled,
      turn_score: turnScore,
      farkle,
      bust_count: bustCount,
      last_bust_word: lastBustWord,
      message,
      message_variant: messageVariant,
      status,
      last_action_at: new Date().toISOString(),
    };
    if (winnerEmail) {
      patch.winner_email = winnerEmail;
      patch.perfect_ten_k = perfectTenK;
    }

    await svc.entities.OnlineMatch.update(match_id, patch);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('submitMatchAction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});