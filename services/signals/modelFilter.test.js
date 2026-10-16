// services/signals/modelFilter.test.js
//
// Minimal self-check for the model confirm/veto filter — no framework.
// Run:  node services/signals/modelFilter.test.js
//
// With ML_API_URL set (and `uvicorn ml.api:app` running) it also makes one
// live /predict call to check the request/response contract end to end.

import assert from "node:assert/strict";
import { applyModelFilter, featuresFromPrices, fetchPrediction } from "./modelFilter.js";

const up = (confidence) => ({ direction: "up", confidence });
const down = (confidence) => ({ direction: "down", confidence });

// --- applyModelFilter -------------------------------------------------------

// Agreement confirms and keeps the signal.
assert.equal(applyModelFilter({ signal: "buy" }, up(0.7)).modelVerdict, "confirmed");
assert.equal(applyModelFilter({ signal: "buy" }, up(0.7)).signal, "buy");
assert.equal(applyModelFilter({ signal: "sell" }, down(0.6)).signal, "sell");

// Confident disagreement vetoes to hold; other rule fields are preserved.
{
  const r = applyModelFilter({ signal: "buy", rsi: 25 }, down(0.8));
  assert.deepEqual(r, { signal: "hold", rsi: 25, model: down(0.8), modelVerdict: "vetoed" });
}
assert.equal(applyModelFilter({ signal: "sell" }, up(0.55)).modelVerdict, "vetoed");

// Weak disagreement is neutral and keeps the signal.
{
  const r = applyModelFilter({ signal: "sell" }, up(0.52));
  assert.equal(r.signal, "sell");
  assert.equal(r.modelVerdict, "neutral");
}
assert.equal(applyModelFilter({ signal: "sell" }, up(0.52), { minConfidence: 0.5 }).signal, "hold");

// The model never creates a trade from a hold.
assert.equal(applyModelFilter({ signal: "hold" }, up(0.99)).signal, "hold");

// No prediction → skipped, signal untouched.
assert.deepEqual(applyModelFilter({ signal: "buy" }, null), {
  signal: "buy",
  model: null,
  modelVerdict: "skipped",
});

// --- featuresFromPrices -----------------------------------------------------

// 15 bars rising by 1 each: 1..15
{
  const prices = Array.from({ length: 15 }, (_, i) => i + 1);
  const f = featuresFromPrices(prices, 1000);
  assert.ok(Math.abs(f.daily_return - (15 / 14 - 1)) < 1e-12);
  assert.ok(Math.abs(f.log_return - Math.log(15 / 14)) < 1e-12);
  assert.equal(f.ma_7, 12); // mean(9..15)
  assert.equal(f.ma_14, 8.5); // mean(2..15)
  assert.ok(f.volatility_7 > 0);
  assert.equal(f.total_volume, 1000);
}

// Flat series → zero volatility.
assert.equal(featuresFromPrices(Array(15).fill(5), 1).volatility_7, 0);

// Not enough history, or no volume → null.
assert.equal(featuresFromPrices(Array(14).fill(5), 1), null);
assert.equal(featuresFromPrices(Array(15).fill(5), null), null);

// --- fetchPrediction --------------------------------------------------------

assert.equal(await fetchPrediction(null, "http://127.0.0.1:1"), null);
assert.equal(await fetchPrediction({ a: 1 }, undefined), null);
// Unreachable service resolves to null instead of throwing.
assert.equal(await fetchPrediction({ a: 1 }, "http://127.0.0.1:1"), null);

if (process.env.ML_API_URL) {
  const prices = Array.from({ length: 15 }, (_, i) => 40000 + i * 50);
  const p = await fetchPrediction(featuresFromPrices(prices, 2e9), process.env.ML_API_URL);
  assert.ok(p, "live /predict returned no prediction");
  assert.ok(p.direction === "up" || p.direction === "down");
  assert.ok(p.confidence >= 0.5 && p.confidence <= 1);
  console.log(`  live /predict → ${p.direction} @ ${p.confidence}`);
}

console.log("✓ modelFilter self-check passed");
