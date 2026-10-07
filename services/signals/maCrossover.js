// services/signals/maCrossover.js
//
// Day 17 — Moving-average crossover signal rule.
//
// Turns a price series into a single discrete action: "buy", "sell", or
// "hold". Builds on the Day 15 SMA from services/indicators/.
//
// Rule (classic MA crossover):
//   buy   — the short MA crossed ABOVE the long MA on the last bar
//           (short was <= long previously, is > long now)
//   sell  — the short MA crossed BELOW the long MA on the last bar
//           (short was >= long previously, is < long now)
//   hold  — anything else, including "not enough data yet"
//
// We compare the two most recent fully-formed MA points. If either of the
// last two bars doesn't have both MAs available, we just return "hold" —
// no fabricated signals from a half-filled window.

import { sma } from "../indicators/movingAverage.js";

/**
 * @param {number[]} prices  price series, oldest → newest
 * @param {object}   [opts]
 * @param {number}   [opts.shortPeriod=10]
 * @param {number}   [opts.longPeriod=20]
 * @returns {"buy" | "sell" | "hold"}
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

  // Need at least longPeriod + 1 points to see a "previous" and "current" bar
  // where both MAs are defined.
  if (prices.length < longPeriod + 1) return "hold";

  const shortMA = sma(prices, shortPeriod);
  const longMA = sma(prices, longPeriod);

  const i = prices.length - 1;
  const prevShort = shortMA[i - 1];
  const currShort = shortMA[i];
  const prevLong = longMA[i - 1];
  const currLong = longMA[i];

  if (
    prevShort === null ||
    currShort === null ||
    prevLong === null ||
    currLong === null
  ) {
    return "hold";
  }

  if (prevShort <= prevLong && currShort > currLong) return "buy";
  if (prevShort >= prevLong && currShort < currLong) return "sell";
  return "hold";
}
