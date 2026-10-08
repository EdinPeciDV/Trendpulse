// services/signals/maCrossover.js
//
// Day 17 — Moving-average crossover signal rule.
//
// Turns a price series into a signal result: a "buy" / "sell" / "hold"
// action plus the short/long MA values the decision was made on. Builds
// on the Day 15 SMA from services/indicators/.
//
// Rule (classic MA crossover):
//   buy   — the short MA crossed ABOVE the long MA on the last bar
//           (short was <= long previously, is > long now)
//   sell  — the short MA crossed BELOW the long MA on the last bar
//           (short was >= long previously, is < long now)
//   hold  — anything else, including "not enough data yet"
//
// We compare the two most recent fully-formed MA points. If either of the
// last two bars doesn't have both MAs available, we return "hold" with
// shortMA/longMA set to whatever the latest values are (possibly null) —
// no fabricated signals from a half-filled window.

import { sma } from "../indicators/movingAverage.js";

/**
 * @typedef {Object} SignalResult
 * @property {"buy" | "sell" | "hold"} signal
 * @property {number | null} shortMA   latest short-MA value (null if n/a)
 * @property {number | null} longMA    latest long-MA value  (null if n/a)
 */

/**
 * @param {number[]} prices  price series, oldest → newest
 * @param {object}   [opts]
 * @param {number}   [opts.shortPeriod=10]
 * @param {number}   [opts.longPeriod=20]
 * @returns {SignalResult}
 */
export function maCrossoverSignal(prices, opts = {}) {
  const { shortPeriod = 10, longPeriod = 20 } = opts;

  if (!Array.isArray(prices)) throw new TypeError("prices must be an array");
  if (!Number.isInteger(shortPeriod) || shortPeriod < 1) {
    throw new RangeError("shortPeriod must be a positive integer");
  }
  if (!Number.isInteger(longPeriod) || longPeriod < 1) {
    throw new RangeError("longPeriod must be a positive integer");
  }
  if (shortPeriod >= longPeriod) {
    throw new RangeError("shortPeriod must be less than longPeriod");
  }

  // Not enough history for even one full long-MA window.
  if (prices.length < longPeriod) {
    return { signal: "hold", shortMA: null, longMA: null };
  }

  const shortMA = sma(prices, shortPeriod);
  const longMA = sma(prices, longPeriod);

  const i = prices.length - 1;
  const currShort = shortMA[i];
  const currLong = longMA[i];

  // Can't compare against a previous bar yet.
  if (i < 1) {
    return { signal: "hold", shortMA: currShort, longMA: currLong };
  }

  const prevShort = shortMA[i - 1];
  const prevLong = longMA[i - 1];

  if (
    prevShort === null ||
    currShort === null ||
    prevLong === null ||
    currLong === null
  ) {
    return { signal: "hold", shortMA: currShort, longMA: currLong };
  }

  let signal = "hold";
  if (prevShort <= prevLong && currShort > currLong) signal = "buy";
  else if (prevShort >= prevLong && currShort < currLong) signal = "sell";

  return { signal, shortMA: currShort, longMA: currLong };
}
