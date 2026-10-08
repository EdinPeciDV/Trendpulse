// services/signals/rsiThreshold.js
//
// Day 18 — RSI overbought/oversold signal rule.
//
// Simplest classic RSI rule: look at the latest RSI value and emit
//   buy   — RSI dipped at/below `oversold`   (expecting a bounce)
//   sell  — RSI rose    at/above `overbought` (expecting a pullback)
//   hold  — otherwise, or when there isn't enough data yet
//
// Pairs with the Day 17 MA crossover rule and returns the same shared
// SignalResult shape — { signal, ...indicator values used } — so callers
// can route multiple rules through the same code path.

import { rsi } from "../indicators/rsi.js";

/**
 * @typedef {Object} RsiSignalResult
 * @property {"buy" | "sell" | "hold"} signal
 * @property {number | null} rsi   latest RSI value (null if n/a)
 */

/**
 * @param {number[]} prices  price series, oldest → newest
 * @param {object}   [opts]
 * @param {number}   [opts.period=14]       Wilder's default
 * @param {number}   [opts.overbought=70]
 * @param {number}   [opts.oversold=30]
 * @returns {RsiSignalResult}
 */
export function rsiThresholdSignal(prices, opts = {}) {
  const { period = 14, overbought = 70, oversold = 30 } = opts;

  if (!Array.isArray(prices)) throw new TypeError("prices must be an array");
  if (!Number.isInteger(period) || period < 1) {
    throw new RangeError("period must be a positive integer");
  }
  if (!(oversold < overbought)) {
    throw new RangeError("oversold must be less than overbought");
  }
  if (overbought > 100 || oversold < 0) {
    throw new RangeError("thresholds must be within [0, 100]");
  }

  const series = rsi(prices, period);
  const latest = series.length > 0 ? series[series.length - 1] : null;

  if (latest === null) return { signal: "hold", rsi: null };

  let signal = "hold";
  if (latest <= oversold) signal = "buy";
  else if (latest >= overbought) signal = "sell";

  return { signal, rsi: latest };
}
