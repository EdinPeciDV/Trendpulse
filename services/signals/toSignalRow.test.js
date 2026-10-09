// services/signals/toSignalRow.test.js
//
// Minimal self-check for the signal-row adapters — no framework.
// Run:  node services/signals/toSignalRow.test.js

import assert from "node:assert/strict";
import { maCrossoverRow, rsiThresholdRow } from "./toSignalRow.js";

const NOW = "2026-10-09T00:00:00.000Z";

// --- maCrossoverRow ---------------------------------------------------------

// Buy case, worked out from the earlier maCrossover test:
//   prices [10,10,9,8,12], short=2, long=3 → shortMA=10, longMA=29/3
//   gap  = |10 - 29/3| / (29/3) = 1/29  ≈ 0.0345
//   conf = clamp01(0.0345 / 0.02) = 1
//   % change (8 → 12) = +50
assert.deepEqual(
  maCrossoverRow({
    pair: "BTC/USDT",
    prices: [10, 10, 9, 8, 12],
    result: { signal: "buy", shortMA: 10, longMA: 29 / 3 },
    now: NOW,
  }),
  {
    pair: "BTC/USDT",
    type: "buy",
    price: 12,
    change: 50,
    confidence: 1,
    created_at: NOW,
  },
);

// Hold flat: zero gap, zero change, zero confidence.
assert.deepEqual(
  maCrossoverRow({
    pair: "ETH/USDT",
    prices: [5, 5, 5, 5, 5],
    result: { signal: "hold", shortMA: 5, longMA: 5 },
    now: NOW,
  }),
  {
    pair: "ETH/USDT",
    type: "hold",
    price: 5,
    change: 0,
    confidence: 0,
    created_at: NOW,
  },
);

// Signal is "hold" even with a non-zero gap → confidence still clamps to 0.
assert.equal(
  maCrossoverRow({
    pair: "X",
    prices: [10, 10],
    result: { signal: "hold", shortMA: 10, longMA: 9 },
    now: NOW,
  }).confidence,
  0,
);

// --- rsiThresholdRow --------------------------------------------------------

// Sell at RSI=100 with default overbought=70:
//   conf = (100 - 70) / (100 - 70) = 1
//   change (4 → 5) = +25
assert.deepEqual(
  rsiThresholdRow({
    pair: "SOL/USDT",
    prices: [1, 2, 3, 4, 5],
    result: { signal: "sell", rsi: 100 },
    now: NOW,
  }),
  {
    pair: "SOL/USDT",
    type: "sell",
    price: 5,
    change: 25,
    confidence: 1,
    created_at: NOW,
  },
);

// Buy halfway between oversold=30 and 0 (RSI=15):
//   conf = (30 - 15) / 30 = 0.5
//   change (5 → 4) = -20
assert.deepEqual(
  rsiThresholdRow({
    pair: "ADA/USDT",
    prices: [5, 4],
    result: { signal: "buy", rsi: 15 },
    now: NOW,
  }),
  {
    pair: "ADA/USDT",
    type: "buy",
    price: 4,
    change: -20,
    confidence: 0.5,
    created_at: NOW,
  },
);

// Custom overbought threshold: sell at RSI=80 with overbought=60
// conf = (80 - 60) / (100 - 60) = 0.5
assert.equal(
  rsiThresholdRow({
    pair: "X",
    prices: [10, 11],
    result: { signal: "sell", rsi: 80 },
    overbought: 60,
    now: NOW,
  }).confidence,
  0.5,
);

// Hold with mid-range RSI → confidence 0.
assert.equal(
  rsiThresholdRow({
    pair: "X",
    prices: [10, 11],
    result: { signal: "hold", rsi: 50 },
    now: NOW,
  }).confidence,
  0,
);

// Null rsi (not enough data) → confidence 0.
assert.equal(
  rsiThresholdRow({
    pair: "X",
    prices: [10, 11],
    result: { signal: "hold", rsi: null },
    now: NOW,
  }).confidence,
  0,
);

// Single-price series → change defaults to 0 (no previous bar).
assert.equal(
  rsiThresholdRow({
    pair: "X",
    prices: [10],
    result: { signal: "hold", rsi: null },
    now: NOW,
  }).change,
  0,
);

// created_at defaults to now() when not passed.
{
  const row = maCrossoverRow({
    pair: "X",
    prices: [1, 2],
    result: { signal: "hold", shortMA: null, longMA: null },
  });
  assert.ok(!Number.isNaN(Date.parse(row.created_at)), "created_at must parse");
}

console.log("✓ toSignalRow self-check passed");
