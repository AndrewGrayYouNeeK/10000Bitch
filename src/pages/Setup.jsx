import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Setup() {
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const navigate = useNavigate();

  const addPlayer = () => {
    if (players.length < 4) setPlayers([...players, `Player ${players.length + 1}`]);
  };
  const removePlayer = (i) => {
    if (players.length > 2) setPlayers(players.filter((_, idx) => idx !== i));
  };
  const updateName = (i, v) => {
    const copy = [...players];
    copy[i] = v;
    setPlayers(copy);
  };

  const startGame = () => {
    const names = players.map((n, i) => n.trim() || `Player ${i + 1}`);
    sessionStorage.setItem("dice10k_players", JSON.stringify(names));
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-32 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-xl font-bold text-white">10,000 — Setup</h1>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto">
        <p className="text-slate-400 text-sm mb-4">Enter player names (2–4 players)</p>
        <div className="space-y-2">
          <AnimatePresence>
            {players.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-2 items-center"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <Input
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  maxLength={20}
                />
                {players.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(i)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {players.length < 4 && (
          <Button
            onClick={addPlayer}
            variant="outline"
            className="w-full mt-3 bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Player
          </Button>
        )}
      </div>

      <Button
        onClick={startGame}
        size="lg"
        className="w-full max-w-md mx-auto mt-8 h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white"
      >
        <Play className="w-5 h-5 mr-2" /> Start Game
      </Button>
    </div>
  );
}