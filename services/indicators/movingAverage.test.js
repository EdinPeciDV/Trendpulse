// services/indicators/movingAverage.test.js
//
// Minimal self-check for the SMA indicator — no test framework needed.
// Run:  node services/indicators/movingAverage.test.js

import assert from "node:assert/strict";
import { sma, latestSma } from "./movingAverage.js";

// 3-period SMA of 1..5 → first two are null, then (1+2+3)/3, (2+3+4)/3, (3+4+5)/3
assert.deepEqual(sma([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]);

// period 1 just echoes the series
assert.deepEqual(sma([10, 20, 30], 1), [10, 20, 30]);

// series shorter than the window → all null, and latest is null
assert.deepEqual(sma([1, 2], 5), [null, null]);
assert.equal(latestSma([1, 2], 5), null);

// latest value is the last full-window average
assert.equal(latestSma([1, 2, 3, 4, 5], 3), 4);

// string-y numbers are coerced (Supabase numerics can arrive as strings)
assert.deepEqual(sma(["2", "4", "6"], 2), [null, 3, 5]);

// bad input is rejected
assert.throws(() => sma([1, 2, 3], 0), RangeError);
assert.throws(() => sma("nope", 2), TypeError);

console.log("\u2713 movingAverage self-check passed");