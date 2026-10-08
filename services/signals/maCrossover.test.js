// services/signals/maCrossover.test.js
//
// Minimal self-check for the MA crossover signal — no test framework needed.
// Run:  node services/signals/maCrossover.test.js

import assert from "node:assert/strict";
import { maCrossoverSignal } from "./index.js";

// Buy: short MA crosses ABOVE long MA on the last bar.
// prices [10,10,9,8,12] with short=2, long=3
//   sma2 → [-, 10,   9.5,  8.5, 10]
//   sma3 → [-, -,    ~9.67, 9,  ~9.67]
//   last bar: 8.5 <= 9 (was below), 10 > 9.67 (now above) → buy
{
  const r = maCrossoverSignal([10, 10, 9, 8, 12], { shortPeriod: 2, longPeriod: 3 });
  assert.equal(r.signal, "buy");
  assert.equal(r.shortMA, 10);
  assert.ok(Math.abs(r.longMA - 29 / 3) < 1e-9);
}

// Sell: short MA crosses BELOW long MA on the last bar.
// prices [8,8,9,10,6] with short=2, long=3
//   sma2 → [-, 8,    8.5,  9.5, 8]
//   sma3 → [-, -,    ~8.33, 9,  ~8.33]
//   last bar: 9.5 >= 9 (was above), 8 < 8.33 (now below) → sell
{
  const r = maCrossoverSignal([8, 8, 9, 10, 6], { shortPeriod: 2, longPeriod: 3 });
  assert.equal(r.signal, "sell");
  assert.equal(r.shortMA, 8);
  assert.ok(Math.abs(r.longMA - 25 / 3) < 1e-9);
}

// Flat series: MAs stay equal, no cross → hold.
{
  const r = maCrossoverSignal([5, 5, 5, 5, 5], { shortPeriod: 2, longPeriod: 3 });
  assert.deepEqual(r, { signal: "hold", shortMA: 5, longMA: 5 });
}

// Not enough data for even one full long-MA window → hold, MAs null.
{
  const r = maCrossoverSignal([1, 2, 3], { shortPeriod: 2, longPeriod: 3 });
  assert.equal(r.signal, "hold");
}
assert.deepEqual(
  maCrossoverSignal([], { shortPeriod: 2, longPeriod: 3 }),
  { signal: "hold", shortMA: null, longMA: null },
);

// Defaults (10/20): series too short → hold.
assert.equal(maCrossoverSignal([1, 2, 3, 4, 5]).signal, "hold");

// Bad input is rejected.
assert.throws(() => maCrossoverSignal("nope"), TypeError);
assert.throws(
  () => maCrossoverSignal([1, 2, 3], { shortPeriod: 3, longPeriod: 3 }),
  RangeError,
);
assert.throws(
  () => maCrossoverSignal([1, 2, 3], { shortPeriod: 0, longPeriod: 3 }),
  RangeError,
);

console.log("✓ maCrossover self-check passed");
