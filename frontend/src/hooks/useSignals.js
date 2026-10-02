import { useCallback, useEffect, useState } from "react";
import { isConfigured } from "../lib/supabaseClient.js";
import { mockSignals } from "../data/mockSignals.js";

// The public demo ships intentionally non-functional: with no Supabase
// credentials (see lib/supabaseClient.js), the live data path is unavailable
// and the UI shows a clear "not connected" state. The real query lives in the
// private production repo.
//
// Flip USE_SAMPLE_DATA to true to render the demo on bundled sample data
// instead — handy for screenshots without exposing a live backend.
const USE_SAMPLE_DATA = false;
const LATENCY_MS = 500;

function fetchSignals(pair) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (USE_SAMPLE_DATA) {
        resolve(mockSignals.filter((s) => s.pair === pair));
        return;
      }
      if (!isConfigured) {
        reject(new Error("Live signals aren't connected in this public demo."));
        return;
      }
      // Real Supabase query lives in the private production repo.
      reject(new Error("Live data source is not available in this build."));
    }, LATENCY_MS);
  });
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