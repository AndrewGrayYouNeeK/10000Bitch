import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dices, PiggyBank, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  createInitialState,
  rollDice,
  evaluateRoll,
  toggleHold,
  getHeldInfo,
  confirmAndReroll,
  bankAndPass,
  passAfterFarkle,
  ENTRY_THRESHOLD,
} from "@/lib/gameLogic";
import DiceTray from "@/components/game/DiceTray";
import ScorePanel from "@/components/game/ScorePanel";
import TurnBanner from "@/components/game/TurnBanner";
import GameOverDialog from "@/components/game/GameOverDialog";
import RulesSheet from "@/components/game/RulesSheet";

export default function Game() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [rollAnim, setRollAnim] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("dice10k_players");
    if (!stored) {
      navigate("/setup");
      return;
    }
    setState(createInitialState(JSON.parse(stored)));
  }, [navigate]);

  const doRoll = useCallback(() => {
    if (!state) return;
    setRollAnim(true);
    const rolled = rollDice(state);
    setState(rolled);
    setTimeout(() => {
      setRollAnim(false);
      setState(s => evaluateRoll(s));
    }, 650);
  }, [state]);

  const onToggle = (dieId) => {
    setState(s => toggleHold(s, dieId));
  };

  const onRollAgain = () => {
    const { state: next } = confirmAndReroll(state);
    if (!next) return;
    if (next.winner) {
      setState(next);
      return;
    }
    setRollAnim(true);
    setState(next);
    setTimeout(() => setRollAnim(false), 650);
  };

  const onBank = () => {
    setState(bankAndPass(state));
  };

  const onPassFarkle = () => {
    setState(passAfterFarkle(state));
  };

  const playAgain = () => {
    const stored = sessionStorage.getItem("dice10k_players");
    if (stored) setState(createInitialState(JSON.parse(stored)));
  };

  if (!state) return null;

  const info = getHeldInfo(state);
  const currentPlayer = state.players[state.currentIndex];
  const potentialTotal = state.turnScore + (info.valid ? info.score : 0);
  const needsEntry = !currentPlayer.onBoard;
  const canBank = state.hasRolled && !state.farkle && info.valid && info.score > 0 &&
    (!needsEntry || potentialTotal >= ENTRY_THRESHOLD);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="text-sm font-bold text-slate-300">Goal: 10,000</div>
        <RulesSheet />
      </div>

      {/* Score panel */}
      <div className="p-3">
        <ScorePanel players={state.players} currentIndex={state.currentIndex} />
      </div>

      {/* Banner */}
      <div className="px-3 mb-2">
        <TurnBanner message={state.message} variant={state.messageVariant} />
      </div>

      {/* Turn score */}
      <div className="px-3 mb-3">
        <motion.div
          animate={{ scale: info.valid && info.score > 0 ? 1.02 : 1 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-3 flex items-center justify-between"
        >
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Turn Score</div>
            <div className="text-3xl font-black tabular-nums">
              {state.turnScore.toLocaleString()}
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
        </motion.div>
      </div>

      {/* Dice tray */}
      <div className="px-3 flex-1 flex items-center">
        <div className="w-full">
          <DiceTray
            dice={state.dice}
            rolling={rollAnim}
            onToggle={onToggle}
            disabled={!state.hasRolled || state.farkle || !!state.winner}
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
        {state.farkle ? (
          <Button
            onClick={onPassFarkle}
            size="lg"
            className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-500 text-white"
          >
            <ChevronRight className="w-5 h-5 mr-2" /> Next Player
          </Button>
        ) : !state.hasRolled ? (
          <Button
            onClick={doRoll}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white"
          >
            <Dices className="w-5 h-5 mr-2" /> Roll Dice
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onRollAgain}
              disabled={!info.valid || info.score === 0 || rollAnim}
              size="lg"
              className="h-14 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white disabled:opacity-40"
            >
              <Dices className="w-5 h-5 mr-1" /> Roll Again
            </Button>
            <Button
              onClick={onBank}
              disabled={!canBank}
              size="lg"
              className="h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white disabled:opacity-40"
            >
              <PiggyBank className="w-5 h-5 mr-1" /> Bank
            </Button>
          </div>
        )}
      </div>

      <GameOverDialog
        open={!!state.winner}
        winner={state.winner}
        onPlayAgain={playAgain}
      />
    </div>
  );
}