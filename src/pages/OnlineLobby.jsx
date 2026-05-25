import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Wifi, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCosmetics } from "@/hooks/useCosmetics";
import { toast } from "sonner";
import NightCityBackground from "@/components/online/NightCityBackground";

export default function OnlineLobby() {
  const navigate = useNavigate();
  const { equippedSkinId, equippedFeltId, equippedBadgeId } = useCosmetics();
  const [matchId, setMatchId] = useState(null);
  const [match, setMatch] = useState(null);
  const [joining, setJoining] = useState(false);
  const startedRef = useRef(false);
  const startTimerRef = useRef(null);

  // Join queue on mount
  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      setJoining(true);
      try {
        const res = await base44.functions.invoke("joinQuickMatch", {
          skin_id: equippedSkinId,
          felt_id: equippedFeltId,
          badge_id: equippedBadgeId,
        });
        if (cancelled) return;
        if (res.data?.match_id) setMatchId(res.data.match_id);
      } catch (e) {
        toast.error("Failed to join queue");
      } finally {
        if (!cancelled) setJoining(false);
      }
    };
    join();
    return () => { cancelled = true; };
  }, [equippedSkinId, equippedFeltId, equippedBadgeId]);

  // Subscribe to the match
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    base44.entities.OnlineMatch.get(matchId).then((m) => {
      if (!cancelled) setMatch(m);
    });
    const unsub = base44.entities.OnlineMatch.subscribe((event) => {
      if (event.id !== matchId) return;
      if (event.type === "delete") {
        setMatch(null);
      } else {
        setMatch(event.data);
      }
    });
    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, [matchId]);

  // When the match goes active, navigate to game
  useEffect(() => {
    if (match?.status === "active") {
      navigate(`/online/${match.id}`);
    }
  }, [match?.status, match?.id, navigate]);

  // Auto-start after a short delay once we have 2+ players (so we don't wait forever for 4)
  useEffect(() => {
    if (!match || match.status !== "waiting") return;
    const count = match.players?.length || 0;
    if (count >= 2 && !startedRef.current) {
      // wait 8s for more players, then start
      startTimerRef.current = setTimeout(async () => {
        startedRef.current = true;
        try {
          await base44.functions.invoke("startWaitingMatch", { match_id: match.id });
        } catch {}
      }, 8000);
    }
    return () => {
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
    };
  }, [match?.id, match?.status, match?.players?.length]);

  const handleLeave = async () => {
    try {
      await base44.functions.invoke("leaveQueueOrMatch", {});
    } catch {}
    navigate("/");
  };

  const count = match?.players?.length || 0;
  const maxPlayers = match?.max_players || 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{ background: "#020408" }}>
      <NightCityBackground />

      <div className="absolute top-4 left-4 z-10">
        <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Link to="/" onClick={handleLeave}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm w-full z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,200,0.2), rgba(168,85,247,0.2))",
            border: "2px solid rgba(0,255,200,0.5)",
            boxShadow: "0 0 30px rgba(0,255,200,0.3)",
          }}
        >
          <Wifi className="w-10 h-10" style={{ color: "#00ffc8" }} />
        </motion.div>

        <h1
          className="font-pixel mb-3 neon-glitch relative inline-block"
          style={{
            color: "#fff",
            fontSize: "2.75rem",
            textShadow: "0 0 6px #00ffea, 0 0 16px #00ffea, 0 0 28px #ff00ea, 0 0 48px #ff00ea",
            letterSpacing: "0.15em",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 neon-glitch"
            style={{
              color: "#ff00ea",
              transform: "translate(2px, 0)",
              mixBlendMode: "screen",
              opacity: 0.85,
            }}
          >
            10000
          </span>
          <span
            aria-hidden
            className="absolute inset-0 neon-glitch"
            style={{
              color: "#00ffea",
              transform: "translate(-2px, 0)",
              mixBlendMode: "screen",
              opacity: 0.85,
            }}
          >
            10000
          </span>
          <span className="relative">10000</span>
        </h1>
        <div className="text-xs tracking-[0.3em] text-slate-400 mb-3 font-pixel" style={{ opacity: 0.7 }}>
          QUICK MATCH
        </div>
        <p className="text-sm text-slate-400 mb-6">
          {joining ? "Connecting..." : count < 2 ? "Searching for players..." : "Filling lobby — starting soon"}
        </p>

        <div className="rounded-xl border p-4 mb-6"
          style={{ background: "rgba(0,255,200,0.04)", borderColor: "rgba(0,255,200,0.25)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400">Players</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "#00ffc8" }}>
              {count} / {maxPlayers}
            </span>
          </div>
          <div className="space-y-2">
            {match?.players?.map((p, i) => (
              <motion.div
                key={p.email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-left text-sm bg-white/5 rounded px-3 py-2"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-white truncate">{p.name}</span>
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, maxPlayers - count) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2 text-left text-sm rounded px-3 py-2 border border-dashed border-white/10 text-slate-600"
              >
                <Users className="w-4 h-4" />
                <span>Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleLeave}
          variant="outline"
          className="w-full border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
        >
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>

        <p className="mt-6 text-xs text-slate-500">
          Online wins grant <span className="text-amber-400 font-bold">1.5x XP & coins</span>
        </p>
      </motion.div>
    </div>
  );
}