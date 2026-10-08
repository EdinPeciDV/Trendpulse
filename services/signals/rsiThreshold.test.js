// services/signals/rsiThreshold.test.js
//
// Minimal self-check for the RSI threshold signal — no test framework.
// Run:  node services/signals/rsiThreshold.test.js

import assert from "node:assert/strict";
import { rsiThresholdSignal } from "./index.js";

// Pure uptrend with period 2: RSI pins at 100 → sell (overbought).
{
  const r = rsiThresholdSignal([1, 2, 3, 4, 5], { period: 2 });
  assert.equal(r.signal, "sell");
  assert.equal(r.rsi, 100);
}

// Pure downtrend with period 2: RSI pins at 0 → buy (oversold).
{
  const r = rsiThresholdSignal([5, 4, 3, 2, 1], { period: 2 });
  assert.equal(r.signal, "buy");
  assert.equal(r.rsi, 0);
}

// Alternating series lands RSI mid-range → hold.
// rsi([1,2,1,2,1,2], 2) last value is 68.75, inside (30, 70).
{
  const r = rsiThresholdSignal([1, 2, 1, 2, 1, 2], { period: 2 });
  assert.equal(r.signal, "hold");
  assert.equal(r.rsi, 68.75);
}

// Custom thresholds: tighten overbought to 60 → the 68.75 case becomes sell.
{
  const r = rsiThresholdSignal([1, 2, 1, 2, 1, 2], {
    period: 2,
    overbought: 60,
    oversold: 40,
  });
  assert.equal(r.signal, "sell");
}

// Not enough data → hold, rsi null.
assert.deepEqual(
  rsiThresholdSignal([1, 2], { period: 14 }),
  { signal: "hold", rsi: null },
);
assert.deepEqual(
  rsiThresholdSignal([], { period: 14 }),
  { signal: "hold", rsi: null },
);

// Defaults (period 14, 70/30): series too short → hold.
assert.equal(rsiThresholdSignal([1, 2, 3, 4, 5]).signal, "hold");

// Bad input is rejected.
assert.throws(() => rsiThresholdSignal("nope"), TypeError);
assert.throws(
  () => rsiThresholdSignal([1, 2, 3], { period: 0 }),
  RangeError,
);
assert.throws(
  () => rsiThresholdSignal([1, 2, 3], { overbought: 20, oversold: 80 }),
  RangeError,
);
assert.throws(
  () => rsiThresholdSignal([1, 2, 3], { overbought: 120 }),
  RangeError,
);

console.log("✓ rsiThreshold self-check passed");
