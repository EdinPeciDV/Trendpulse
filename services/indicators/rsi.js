// services/indicators/rsi.js
//
// Day 16 — Relative Strength Index (RSI) for a price series.
//
// Pure and dependency-free so it's easy to test and reuse. Pairs with the
// Day 15 SMA module; the Day 17 signal rules will use both. Input is an
// array of numbers (or numeric strings — Supabase numerics can arrive as
// strings), ordered oldest → newest.

/**
 * Relative Strength Index using Wilder's smoothing (the classic formulation
 * from "New Concepts in Technical Trading Systems", 1978).
 *
 * Returns an array the SAME length as `values`, index-aligned with the input.
 * You need `period + 1` prices to produce the first RSI (one extra price for
 * the initial delta window), so positions 0 .. period are `null`.
 *
 *   avgGain[0] = mean of the first `period` positive deltas
 *   avgLoss[0] = mean of the first `period` absolute negative deltas
 *   avgGain[t] = (avgGain[t-1] * (period - 1) + gain[t]) / period
 *   avgLoss[t] = (avgLoss[t-1] * (period - 1) + loss[t]) / period
 *   RS         = avgGain / avgLoss
 *   RSI        = 100 - 100 / (1 + RS)
 *
 * If `avgLoss` is zero (no downside over the window) RSI is defined as 100.
 *
 * @param {number[]} values  price series, oldest first
 * @param {number}   period  smoothing window (defaults to 14, Wilder's choice)
 * @returns {(number|null)[]}
 */
export function rsi(values, period = 14) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array");
  if (!Number.isInteger(period) || period < 1) {
    throw new RangeError("period must be a positive integer");
  }

  const out = new Array(values.length).fill(null);
  if (values.length < period + 1) return out;

  // Prime the first averages from the initial `period` deltas.
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const prev = Number(values[i - 1]);
    const curr = Number(values[i]);
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) {
      throw new TypeError(`values[${i - 1}] or values[${i}] is not a finite number`);
    }
    const delta = curr - prev;
    if (delta >= 0) avgGain += delta;
    else avgLoss += -delta;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = rsiFromAverages(avgGain, avgLoss);

  // Wilder-smooth the rest.
  for (let i = period + 1; i < values.length; i++) {
    const curr = Number(values[i]);
    const prev = Number(values[i - 1]);
    if (!Number.isFinite(curr)) {
      throw new TypeError(`values[${i}] is not a finite number`);
    }
    const delta = curr - prev;
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = rsiFromAverages(avgGain, avgLoss);
  }

  return out;
}

/**
 * The most recent RSI value (the last non-null), or `null` if the series is
 * too short. Handy when you only care about "where is RSI now".
 *
 * @param {number[]} values
 * @param {number}   period
 * @returns {number|null}
 */
export function latestRsi(values, period = 14) {
  const series = rsi(values, period);
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] !== null) return series[i];
  }
  return null;
}

function rsiFromAverages(avgGain, avgLoss) {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
