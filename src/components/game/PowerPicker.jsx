import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { POWERS, MAX_EQUIPPED, BASE_POWERS, SABO_POWERS } from "@/lib/powers";
import { Check, Zap } from "lucide-react";

// Pre-match loadout picker. Choose up to 3 powers to bring into the match.
export default function PowerPicker({ open, onClose, initialSelected = [], onConfirm }) {
  const [selected, setSelected] = useState(initialSelected);

  const toggle = (id) => {
    setSelected(curr => {
      if (curr.includes(id)) return curr.filter(x => x !== id);
      if (curr.length >= MAX_EQUIPPED) return curr;
      return [...curr, id];
    });
  };

  const confirm = () => {
    onConfirm?.(selected);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent
        className="max-w-md text-white border-2 max-h-[85vh] overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #050010 0%, #100022 100%)",
          borderColor: "#00ffc8",
          boxShadow: "0 0 32px rgba(0,255,200,0.4)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-black uppercase tracking-widest flex items-center gap-2"
            style={{ color: "#00ffc8", textShadow: "0 0 12px #00ffc8" }}
          >
            <Zap className="w-6 h-6" />
            Power Loadout
          </DialogTitle>
          <p className="text-xs text-cyan-300/70 tracking-wide">
            Choose up to {MAX_EQUIPPED} powers. {selected.length}/{MAX_EQUIPPED} equipped.
          </p>
        </DialogHeader>

        <Section title="Self / Buffs" color="#00ffc8" powers={BASE_POWERS} selected={selected} onToggle={toggle} />
        <Section title="Sabotage" color="#ff00aa" powers={SABO_POWERS} selected={selected} onToggle={toggle} />

        <Button
          onClick={confirm}
          className="w-full h-12 font-black uppercase tracking-widest border-2 mt-2"
          style={{
            background: "linear-gradient(135deg, #00ffc8 0%, #a855f7 100%)",
            color: "#000",
            borderColor: "#00ffc8",
            boxShadow: "0 0 20px rgba(0,255,200,0.5)",
          }}
        >
          Lock In ({selected.length})
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, color, powers, selected, onToggle }) {
  return (
    <div className="mt-3">
      <div
        className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
        style={{ color, textShadow: `0 0 6px ${color}` }}
      >
        ▸ {title}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {powers.map(p => {
          const isOn = selected.includes(p.id);
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggle(p.id)}
              className="relative text-left rounded-lg border-2 p-2 transition-all"
              style={{
                background: isOn
                  ? `linear-gradient(135deg, ${p.color}33, ${p.color}11)`
                  : "rgba(255,255,255,0.03)",
                borderColor: isOn ? p.color : "rgba(255,255,255,0.1)",
                boxShadow: isOn ? `0 0 14px ${p.color}77` : "none",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-lg leading-none">{p.icon}</span>
                <span
                  className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: isOn ? "#fff" : "rgba(255,255,255,0.8)" }}
                >
                  {p.name}
                </span>
                <span
                  className="ml-auto text-[10px] font-black tabular-nums"
                  style={{ color: p.color }}
                >
                  {p.cost}⚡
                </span>
              </div>
              <p className="text-[10px] leading-tight text-white/70 line-clamp-2">
                {p.description}
              </p>
              {isOn && (
                <div
                  className="absolute top-1 right-1 rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: p.color }}
                >
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}