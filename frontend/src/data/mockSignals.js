// Mock trading signals — shape mirrors what the Supabase `signals` table
// will return later, so wiring real data (Day 14) is mostly a swap.
export const mockSignals = [
  { id: 1, pair: "BTC/USDT", type: "BUY",  price: 63250.42, change: 2.4,  confidence: 0.82, time: "2026-09-26T08:15:00Z" },
  { id: 2, pair: "ETH/USDT", type: "SELL", price: 2480.10,  change: -1.1, confidence: 0.67, time: "2026-09-26T08:05:00Z" },
  { id: 3, pair: "SOL/USDT", type: "BUY",  price: 148.77,   change: 5.3,  confidence: 0.91, time: "2026-09-26T07:50:00Z" },
  { id: 4, pair: "ADA/USDT", type: "HOLD", price: 0.4412,   change: 0.2,  confidence: 0.55, time: "2026-09-26T07:40:00Z" },
  { id: 5, pair: "XRP/USDT", type: "SELL", price: 0.6120,   change: -3.7, confidence: 0.74, time: "2026-09-26T07:25:00Z" },
  { id: 6, pair: "DOGE/USDT", type: "BUY", price: 0.1284,   change: 8.1,  confidence: 0.63, time: "2026-09-26T07:10:00Z" },
];
