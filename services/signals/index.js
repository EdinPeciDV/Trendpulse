// services/signals/index.js
//
// Barrel for the signals module. One place to pull every signal rule in
// from — e.g.  import { maCrossoverSignal } from "./services/signals";
//
// Each rule returns the shared SignalResult shape:
//   { signal: "buy" | "sell" | "hold", ...indicator values used }

export { maCrossoverSignal } from "./maCrossover.js";
