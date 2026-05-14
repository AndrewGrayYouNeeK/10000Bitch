import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MatchChat({ matchId, user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef(null);
  const lastSeenIdRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (!matchId) return;
    base44.entities.ChatMessage.filter({ match_id: matchId }, "created_date", 100)
      .then(msgs => {
        setMessages(msgs || []);
        if (msgs?.length) lastSeenIdRef.current = msgs[msgs.length - 1].id;
      })
      .catch(() => {});
  }, [matchId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!matchId) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.match_id === matchId) {
        setMessages(prev => {
          if (prev.some(m => m.id === event.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsub;
  }, [matchId]);

  // Track unread + auto-scroll
  useEffect(() => {
    if (!messages.length) return;
    if (open) {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
      lastSeenIdRef.current = messages[messages.length - 1].id;
      setUnread(0);
    } else {
      const idx = messages.findIndex(m => m.id === lastSeenIdRef.current);
      const newCount = idx === -1 ? messages.length : messages.length - idx - 1;
      setUnread(newCount);
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !user) return;
    setSending(true);
    setText("");
    try {
      await base44.entities.ChatMessage.create({
        match_id: matchId,
        email: user.email,
        name: user.full_name || user.email,
        text: trimmed.slice(0, 300),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center border-2"
        style={{
          background: "linear-gradient(135deg, rgba(0,255,200,0.25), rgba(0,180,255,0.3))",
          borderColor: "#00ffc8",
          boxShadow: "0 0 20px rgba(0,255,200,0.5)",
          color: "#00ffc8",
        }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] h-[400px] rounded-2xl border-2 flex flex-col overflow-hidden"
            style={{
              background: "rgba(3,4,10,0.95)",
              borderColor: "#ff00ea",
              boxShadow: "0 0 24px rgba(0,255,200,0.3), 0 0 40px rgba(255,0,234,0.4)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="px-3 py-2 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(0,255,200,0.25)" }}
            >
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: "#00ffc8" }}>
                Match Chat
              </div>
              <div className="text-[10px]" style={{ color: "rgba(0,255,200,0.5)" }}>
                {messages.length} msg
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8">
                  No messages yet. Say hi! 👋
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.email === user?.email;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[75%] rounded-xl px-3 py-1.5 text-sm"
                        style={
                          mine
                            ? {
                                background: "linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,180,255,0.25))",
                                border: "1px solid rgba(0,255,200,0.4)",
                                color: "#fff",
                              }
                            : {
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,0,170,0.3)",
                                color: "#fff",
                              }
                        }
                      >
                        {!mine && (
                          <div className="text-[10px] font-bold mb-0.5" style={{ color: "#ff7fcf" }}>
                            {m.name}
                          </div>
                        )}
                        <div className="break-words">{m.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-2 border-t flex gap-2"
              style={{ borderColor: "rgba(0,255,200,0.25)" }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                maxLength={300}
                disabled={sending || !user}
                className="flex-1 bg-black/40 border-cyan-500/30 text-white text-sm h-9"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!text.trim() || sending || !user}
                className="h-9 w-9 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00ffc8, #00b8ff)",
                  color: "#000",
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}