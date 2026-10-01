import { useCallback, useEffect, useState } from "react";
import { mockSignals } from "../data/mockSignals.js";

// Simulates fetching signals for a pair so the UI has real loading / error
// states to handle. On Day 14 the only thing that changes is the body of
// fetchSignals() — swap the setTimeout + mock filter for a Supabase query.
// The loading / empty / error handling in the components stays exactly the same.
const LATENCY_MS = 700;

function fetchSignals(pair) {
  // TEMP: visit /signals?fail=1 to force the error state while building the UI.
  const shouldFail =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("fail");

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Couldn't reach the signals service."));
        return;
      }
      resolve(mockSignals.filter((s) => s.pair === pair));
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