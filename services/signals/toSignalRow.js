// services/signals/toSignalRow.js
//
// Day 19 — Map signal-rule outputs onto the row shape the UI reads from
// the Supabase `signals` table.
//
// Rule outputs are deliberately per-indicator:
//   maCrossoverSignal  → { signal, shortMA, longMA }
//   rsiThresholdSignal → { signal, rsi }
//
// The table / useSignals read a flatter row:
//   { pair, type, price, change, confidence, created_at }
//
// This module bridges the two. One row per (pair, rule) call.
//
// Mapping:
//   type        — the rule's "buy" | "sell" | "hold", lowercase. The seeded
//                 mockSignals use uppercase for display; new rows will not.
//                 SignalCard renders the string as-is, so real signals will
//                 show in lowercase until styled otherwise.
//   price       — latest price in the series.
//   change      — percent change from the previous bar to the latest
//                 (e.g. 2.4 for +2.4%). 0 when there is no previous bar.
//   confidence  — 0..1 strength number, per-rule (see each function).
//                 Clamped to 0 on "hold".
//   created_at  — ISO timestamp. Caller may pass `now` to make a batch
//                 share one timestamp.

function percentChange(prices) {
  if (!Array.isArray(prices) || prices.length < 2) return 0;
  const last = Number(prices[prices.length - 1]);
  const prev = Number(prices[prices.length - 2]);
  if (!Number.isFinite(last) || !Number.isFinite(prev) || prev === 0) return 0;
  return ((last - prev) / prev) * 100;
}

function round(n, places) {
  const p = 10 ** places;
  return Math.round(n * p) / p;
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * Row from an MA-crossover result.
 *
 * Confidence = |shortMA - longMA| / longMA, treated against a 2% full-scale
 * (so a 2% gap or wider is 1.0). On "hold", 0.
 *
 * @param {object} args
 * @param {string} args.pair
 * @param {number[]} args.prices                oldest → newest
 * @param {{signal:string, shortMA:(number|null), longMA:(number|null)}} args.result
 * @param {string} [args.now]                   ISO timestamp override
 * @returns {{pair:string, type:string, price:number, change:number, confidence:number, created_at:string}}
 */
export function maCrossoverRow({ pair, prices, result, now }) {
  const price = Number(prices[prices.length - 1]);

  let confidence = 0;
  if (
    result.signal !== "hold" &&
    typeof result.shortMA === "number" &&
    typeof result.longMA === "number" &&
    result.longMA !== 0
  ) {
    const gap = Math.abs(result.shortMA - result.longMA) / result.longMA;
    confidence = clamp01(gap / 0.02);
  }

  return {
    pair,
    type: result.signal,
    price: round(price, 4),
    change: round(percentChange(prices), 2),
    confidence: round(confidence, 2),
    created_at: now ?? new Date().toISOString(),
  };
}

/**
 * Row from an RSI-threshold result.
 *
 * Confidence is how far past the triggering threshold the RSI sits, as a
 * share of the remaining headroom (overbought → 100 for sell,
 * oversold → 0 for buy). On "hold", 0.
 *
 * @param {object} args
 * @param {string} args.pair
 * @param {number[]} args.prices                oldest → newest
 * @param {{signal:string, rsi:(number|null)}} args.result
 * @param {number} [args.overbought=70]
 * @param {number} [args.oversold=30]
 * @param {string} [args.now]                   ISO timestamp override
 * @returns {{pair:string, type:string, price:number, change:number, confidence:number, created_at:string}}
 */
export function rsiThresholdRow({
  pair,
  prices,
  result,
  overbought = 70,
  oversold = 30,
  now,
}) {
  const price = Number(prices[prices.length - 1]);

  let confidence = 0;
  if (typeof result.rsi === "number") {
    if (result.signal === "sell" && overbought < 100) {
      confidence = clamp01((result.rsi - overbought) / (100 - overbought));
    } else if (result.signal === "buy" && oversold > 0) {
      confidence = clamp01((oversold - result.rsi) / oversold);
    }
  }

  return {
    pair,
    type: result.signal,
    price: round(price, 4),
    change: round(percentChange(prices), 2),
    confidence: round(confidence, 2),
    created_at: now ?? new Date().toISOString(),
  };
}
