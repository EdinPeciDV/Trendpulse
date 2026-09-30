import { mockSignals } from "./mockSignals.js";

// Tiny seeded RNG so the mock series is stable across reloads (not random each render).
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Build ~30 points of {time, price} walking BACKWARDS from each signal's current price.
function buildSeries(pair, endPrice, seedBase) {
  const rand = seeded(seedBase);
  const points = [];
  let price = endPrice;
  const now = Date.now();
  const stepMs = 60 * 60 * 1000; // 1 point per hour

  for (let i = 0; i < 30; i++) {
    points.push({
      time: new Date(now - i * stepMs).toISOString().slice(11, 16), // "HH:MM"
      price: Number(price.toFixed(price < 1 ? 4 : 2)),
    });
    // random walk: ±1.2% per step going back in time
    const drift = (rand() - 0.5) * 0.024;
    price = price / (1 + drift);
  }
  return points.reverse(); // oldest -> newest
}

// { "BTC/USDT": [ {time, price}, ... ], ... }
export const mockPrices = mockSignals.reduce((acc, sig) => {
  acc[sig.pair] = buildSeries(sig.pair, sig.price, sig.id * 7919);
  return acc;
}, {});

export function getSeries(pair) {
  return mockPrices[pair] ?? [];
}
