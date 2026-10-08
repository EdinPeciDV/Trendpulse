# Dev Notes
  Day 3: Set up project folders (frontend, ml, docs).
  Next: start the React app inside frontend.
- Backfilled note (Sep 27)

Day 16: RSI (Wilder's 14-period) landed in services/indicators/rsi.js
alongside the Day 15 SMA. Pure JS, index-aligned output like sma(),
exports rsi() + latestRsi(). Self-check in rsi.test.js.
Next: Day 17 signal rules (MA crossover + RSI overbought/oversold).

Day 17: MA crossover signal rule in services/signals/maCrossover.js.
Reads two SMA windows (default 10/20) and returns
{ signal: "buy"|"sell"|"hold", shortMA, longMA } — "buy" on cross-up,
"sell" on cross-down, "hold" otherwise or when there isn't enough data.
Barrel at services/signals/index.js so future rules land next to it.
Self-check in maCrossover.test.js.
Next: wire a signal into the Supabase signals table / UI.

