import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dices, PiggyBank, ChevronRight, Wifi, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { scoreSelection } from "@/lib/scoring";
import DiceTray from "@/components/game/DiceTray";
import ScorePanel from "@/components/game/ScorePanel";
import TurnBanner from "@/components/game/TurnBanner";
import RulesSheet from "@/components/game/RulesSheet";
import BigPopup from "@/components/game/BigPopup";
import MatchChat from "@/components/online/MatchChat";
import { useOnlineMatch } from "@/hooks/useOnlineMatch";
import { useCosmetics } from "@/hooks/useCosmetics";
import { toast } from "sonner";

const ENTRY_THRESHOLD = 1000;
const TARGET_SCORE = 10000;

export default function OnlineGame() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, equippedSkinId, equippedPipsId, equippedFeltId } = useCosmetics();
  const { match, loading, submitting, submit } = useOnlineMatch(matchId);
  const [rollAnim, setRollAnim] = useState(false);
  const [popup, setPopup] = useState(null);
  const [claimedSummary, setClaimedSummary] = useState(null);
  const prevBustRef = useRef(0);
  const prevHasRolledRef = useRef(false);
  const claimedRef = useRef(false);

  // Animate dice rolls when has_rolled flips from false to true
  useEffect(() => {
    if (!match) return;
    if (match.has_rolled && !prevHasRolledRef.current) {
      setRollAnim(true);
      const t = setTimeout(() => setRollAnim(false), 900);
      return () => clearTimeout(t);
    }
    prevHasRolledRef.current = match.has_rolled;
  }, [match?.has_rolled]);

  // Show bust pop-up
  useEffect(() => {
    if (!match) return;
    if ((match.bust_count || 0) > prevBustRef.current && match.last_bust_word) {
      setPopup({ word: match.last_bust_word, variant: "danger" });
      prevBustRef.current = match.bust_count;
    }
  }, [match?.bust_count, match?.last_bust_word]);

  // Claim rewards when match finishes
  useEffect(() => {
    if (!match || match.status !== "finished" || claimedRef.current) return;
    claimedRef.current = true;
    base44.functions.invoke("claimMatchRewards", { match_id: matchId })
      .then(res => {
        if (res.data?.ok) {
          setClaimedSummary(res.data);
          if (res.data.perfectTenK) {
            setPopup({ word: "PERFECT 10,000! 🎯 MYTHIC DICE UNLOCKED", variant: "success" });
          }
        }
      })
      .catch(() => toast.error("Failed to claim rewards"));
  }, [match?.status, matchId]);

  if (loading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Wifi className="w-8 h-8 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-400">Connecting to match...</p>
        </div>
      </div>
    );
  }

  const myEmail = user?.email;
  const meIndex = match.players?.findIndex(p => p.email === myEmail);
  const currentPlayer = match.players?.[match.current_index];
  const isMyTurn = currentPlayer?.email === myEmail;

  // Compute held info from current dice
  const heldVals = (match.dice || []).filter(d => d.held && !d.used).map(d => d.value);
  const info = { held: heldVals, ...scoreSelection(heldVals) };

  const potentialTotal = (match.turn_score || 0) + (info.valid ? (info.score || 0) : 0);
  const needsEntry = currentPlayer && !currentPlayer.onBoard;
  const wouldOvershoot = currentPlayer && currentPlayer.score + potentialTotal > TARGET_SCORE;
  const canBank = isMyTurn && match.has_rolled && !match.farkle && info.valid && info.score > 0 &&
    (!needsEntry || potentialTotal >= ENTRY_THRESHOLD);

  // Translate match → ScorePanel players shape
  const panelPlayers = (match.players || []).map(p => ({
    name: p.name + (p.email === myEmail ? " (you)" : ""),
    score: p.score,
    onBoard: p.onBoard,
  }));

  // Build dice for DiceTray (it expects {id, value, used, held})
  const trayDice = match.dice || [];

  const handleToggle = (dieId) => {
    if (!isMyTurn || match.farkle || !match.has_rolled || submitting) return;
    submit("toggle_hold", { die_id: dieId });
  };

  const handleRoll = () => {
    if (!isMyTurn || submitting) return;
    submit("roll");
  };

  const handleRollAgain = () => {
    if (!isMyTurn || submitting || !info.valid || info.score === 0) return;
    submit("roll_again");
  };

  const handleBank = () => {
    if (!canBank || submitting) return;
    submit("bank");
  };

  const handlePassFarkle = () => {
    if (!isMyTurn || !match.farkle || submitting) return;
    submit("pass_farkle");
  };

  // The skin/felt to use: my equipped felt for my view, but show each player's dice with their skin during their turn
  const activePlayer = match.players?.[match.current_index];
  const activeSkin = activePlayer?.skin_id || equippedSkinId;
  const activeFelt = (myEmail && meIndex !== -1 ? equippedFeltId : null) || activePlayer?.felt_id || equippedFeltId;

  const winner = match.status === "finished"
    ? match.players?.find(p => p.email === match.winner_email)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col pb-6">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#00ffc8" }}>
          <Wifi className="w-4 h-4" /> ONLINE · Goal 10,000
        </div>
        <RulesSheet />
      </div>

      <div className="p-3">
        <ScorePanel players={panelPlayers} currentIndex={match.current_index} />
      </div>

      <div className="px-3 mb-2">
        <TurnBanner
          message={isMyTurn && !match.farkle ? `🎮 Your turn! ${match.message || ""}` : match.message}
          variant={match.message_variant}
        />
      </div>

      <div className="px-3 mb-3">
        <motion.div
          animate={{ scale: info.valid && info.score > 0 ? 1.02 : 1 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-3 flex items-center justify-between"
        >
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Turn Score</div>
            <div className="text-3xl font-black tabular-nums">
              {(match.turn_score || 0).toLocaleString()}
              {info.valid && info.score > 0 && (
                <span className="text-emerald-400 text-xl"> +{info.score}</span>
              )}
            </div>
          </div>
          {needsEntry && (
            <div className="text-right text-xs">
              <div className="text-amber-400 font-bold">Entry: 1,000</div>
              <div className={potentialTotal >= ENTRY_THRESHOLD ? "text-emerald-400" : "text-slate-500"}>
                {potentialTotal >= ENTRY_THRESHOLD ? "✓ On the board" : `${ENTRY_THRESHOLD - potentialTotal} to go`}
              </div>
            </div>
          )}
          {!needsEntry && wouldOvershoot && info.valid && info.score > 0 && (
            <div className="text-right text-xs">
              <div className="text-rose-400 font-bold">⚠️ Over 10,000!</div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-3 flex-[0.85] flex items-center justify-center">
        <div className="w-full">
          <DiceTray
            dice={trayDice}
            rolling={rollAnim}
            onToggle={handleToggle}
            disabled={!isMyTurn || !match.has_rolled || match.farkle || match.status === "finished"}
            skinId={activeSkin}
            pipsId={equippedPipsId}
            feltId={activeFelt}
          />
          {info.held.length > 0 && (
            <div className="mt-2 text-center text-sm">
              {info.valid ? (
                <span className="text-emerald-400 font-semibold">
                  {info.sixOfAKind ? "SIX OF A KIND!" : info.straight ? "Straight!" : info.threePairs ? "Three Pairs!" : `Selection: +${info.score}`}
                </span>
              ) : (
                <span className="text-rose-400 font-semibold">Selection includes non-scoring dice</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2 border-t border-white/10 bg-slate-950/80">
        {match.status === "finished" ? (
          <Button asChild size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <Link to="/"><Trophy className="w-5 h-5 mr-2" /> Back to Home</Link>
          </Button>
        ) : !isMyTurn ? (
          <div className="text-center text-sm text-slate-400 py-4">
            ⏳ Waiting for <span className="font-bold text-white">{currentPlayer?.name}</span>...
          </div>
        ) : match.farkle ? (
          <Button onClick={handlePassFarkle} disabled={submitting} size="lg" className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-500 text-white">
            <ChevronRight className="w-5 h-5 mr-2" /> Next Player
          </Button>
        ) : !match.has_rolled ? (
          <Button onClick={handleRoll} disabled={submitting} size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <Dices className="w-5 h-5 mr-2" /> Roll Dice
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleRollAgain}
              disabled={!info.valid || info.score === 0 || rollAnim || submitting}
              size="lg"
              className="h-14 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white disabled:opacity-40"
            >
              <Dices className="w-5 h-5 mr-1" /> Roll Again
            </Button>
            <Button
              onClick={handleBank}
              disabled={!canBank || submitting}
              size="lg"
              className="h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white disabled:opacity-40"
            >
              <PiggyBank className="w-5 h-5 mr-1" /> Bank
            </Button>
          </div>
        )}
      </div>

      {/* Finished overlay */}
      {winner && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-black/80">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-400" />
            <h2 className="text-2xl font-black mb-2">
              {winner.email === myEmail ? "🏆 YOU WON!" : `${winner.name} wins!`}
            </h2>
            <p className="text-slate-400 mb-4">Final score: {winner.score.toLocaleString()}</p>
            {claimedSummary && (
              <div className="rounded-lg bg-black/30 p-3 mb-4 text-sm space-y-1">
                <div className="text-amber-400 font-bold">Rewards (1.5x online bonus)</div>
                <div>+{claimedSummary.xpGain} XP</div>
                {claimedSummary.coinGain > 0 && <div>+{claimedSummary.coinGain} coins</div>}
                {claimedSummary.perfectTenK && <div className="text-fuchsia-400 font-bold">🎯 Mythic Dice unlocked!</div>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="border-white/20 text-white">
                <Link to="/">Home</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <Link to="/online">Play Again</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <BigPopup open={!!popup} word={popup?.word} variant={popup?.variant} onClose={() => setPopup(null)} />

      <MatchChat matchId={matchId} user={user} />
    </div>
  );
}