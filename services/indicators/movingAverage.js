// services/indicators/movingAverage.js
//
// Day 15 — Simple Moving Average (SMA) for a price series.
//
// Pure and dependency-free so it's easy to test and reuse. The Day 17 signal
// rule (MA crossover) will build on this. Input is an array of numbers,
// ordered oldest → newest.

/**
 * Simple Moving Average.
 *
 * Returns an array the SAME length as `values`, index-aligned with the input.
 * Positions before the window is full are `null`, so `out[i]` is always the
 * SMA "as of" `values[i]` (or null if there isn't enough history yet).
 *
 * Uses a sliding window, so it's O(n) rather than O(n * period).
 *
 * @param {number[]} values  price series, oldest first
 * @param {number}   period  window size (e.g. 7)
 * @returns {(number|null)[]}
 */
export function sma(values, period) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array");
  if (!Number.isInteger(period) || period < 1) {
    throw new RangeError("period must be a positive integer");
  }

  const out = new Array(values.length).fill(null);
  let windowSum = 0;

  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i]);
    if (!Number.isFinite(v)) {
      throw new TypeError(`values[${i}] is not a finite number`);
    }
    windowSum += v;
    if (i >= period) windowSum -= Number(values[i - period]); // drop the oldest
    if (i >= period - 1) out[i] = windowSum / period;
  }

  return out;
}

/**
 * The most recent SMA value (the last non-null), or `null` if the series is
 * shorter than `period`. Handy when you only care about "where is the MA now".
 *
 * @param {number[]} values
 * @param {number}   period
 * @returns {number|null}
 */
export function latestSma(values, period) {
  const series = sma(values, period);
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] !== null) return series[i];
  }
  return null;
}
