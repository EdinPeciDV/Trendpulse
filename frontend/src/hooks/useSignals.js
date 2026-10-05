import { useCallback, useEffect, useState } from "react";
import { supabase, isConfigured } from "../../lib/supabaseClient.js";
import { mockSignals } from "../data/mockSignals.js";

// / With no Supabase credentials (the public demo default) the live path is
// unavailable and the UI shows a clear "not connected" state. Flip
// USE_SAMPLE_DATA to render the bundled sample data instead — handy for
// screenshots without a live backend.
const USE_SAMPLE_DATA = false;
const LATENCY_MS = 500;

// Map a Supabase `signals` row to the shape the UI expects.
// The table stores `created_at`; the components read `time`.
function toSignal(row) {
  return {
    id: row.id,
    pair: row.pair,
    type: row.type,
    price: Number(row.price),
    change: Number(row.change),
    confidence: Number(row.confidence),
    time: row.created_at,
  };
}

async function fetchSignals(pair) {
  if (USE_SAMPLE_DATA) {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    return mockSignals.filter((s) => s.pair === pair);
  }

  if (!isConfigured || !supabase) {
    throw new Error("Live signals aren't connected in this public demo.");
  }

  // Latest signals for the selected pair, newest first.
  const { data, error } = await supabase
    .from("signals")
    .select("id, pair, type, price, change, confidence, created_at")
    .eq("pair", pair)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []).map(toSignal);
}

// status: "loading" | "success" | "error"
export function useSignals(pair) {
  const [status, setStatus] = useState("loading");
  const [signals, setSignals] = useState([]);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true; // ignore a stale response if the pair changes mid-flight
    setStatus("loading");
    setError(null);

    fetchSignals(pair)
      .then((data) => {
        if (!active) return;
        setSignals(data);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [pair, reloadKey]);

  return { status, signals, error, reload };
}