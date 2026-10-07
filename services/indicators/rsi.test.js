// services/indicators/rsi.test.js
//
// Minimal self-check for the RSI indicator — no test framework needed.
// Run:  node services/indicators/rsi.test.js

import assert from "node:assert/strict";
import { rsi, latestRsi } from "./rsi.js";

// Small hand-worked example, period 2 so it's easy to follow.
// Prices alternate 1,2,1,2,1,2  →  deltas: +1,-1,+1,-1,+1
//   first avgGain = 0.5, avgLoss = 0.5  → RSI = 50
//   then Wilder-smoothed:         RSI = 75, 37.5, 68.75
const alt = rsi([1, 2, 1, 2, 1, 2], 2);
assert.equal(alt[0], null);
assert.equal(alt[1], null);
assert.equal(alt[2], 50);
assert.equal(alt[3], 75);
assert.equal(alt[4], 37.5);
assert.equal(alt[5], 68.75);

// Pure uptrend: no losses in the window → RSI pinned at 100.
assert.deepEqual(rsi([1, 2, 3, 4, 5], 2), [null, null, 100, 100, 100]);

// Pure downtrend: no gains → RSI pinned at 0.
assert.deepEqual(rsi([5, 4, 3, 2, 1], 2), [null, null, 0, 0, 0]);

// Series shorter than period + 1 → all null, latest is null.
assert.deepEqual(rsi([1, 2], 14), [null, null]);
assert.equal(latestRsi([1, 2], 14), null);

// latestRsi returns the last non-null value.
assert.equal(latestRsi([1, 2, 1, 2, 1, 2], 2), 68.75);

// Core RSI invariant: every emitted value is within [0, 100].
const prices = [
  44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42,
  45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00,
  46.03, 46.41, 46.22, 45.64, 46.21, 46.25, 45.71, 46.45,
  45.78, 45.35, 44.03, 44.18, 44.22, 44.57, 43.42, 42.66,
  43.13,
];
for (const v of rsi(prices, 14)) {
  if (v === null) continue;
  assert.ok(v >= 0 && v <= 100, `RSI out of range: ${v}`);
}

// String-y numbers are coerced (Supabase numerics can arrive as strings).
assert.deepEqual(rsi(["1", "2", "1", "2", "1", "2"], 2), [null, null, 50, 75, 37.5, 68.75]);

// Bad input is rejected.
assert.throws(() => rsi([1, 2, 3], 0), RangeError);
assert.throws(() => rsi("nope", 14), TypeError);
assert.throws(() => rsi([1, "x", 3], 2), TypeError);

console.log("✓ rsi self-check passed");
