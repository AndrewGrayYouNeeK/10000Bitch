import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Subscribes to a single OnlineMatch by id and provides a typed action submitter.
export function useOnlineMatch(matchId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const load = async () => {
      const m = await base44.entities.OnlineMatch.get(matchId);
      if (!cancelled) {
        setMatch(m);
        setLoading(false);
      }
    };
    load();

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

  const submit = useCallback(async (action, extra = {}) => {
    if (!matchId) return { error: "no match" };
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("submitMatchAction", {
        match_id: matchId,
        action,
        ...extra,
      });
      return res.data;
    } finally {
      setSubmitting(false);
    }
  }, [matchId]);

  return { match, loading, submitting, submit };
}