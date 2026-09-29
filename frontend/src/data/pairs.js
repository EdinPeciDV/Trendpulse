import { mockSignals } from "./mockSignals.js";

// Unique pairs present in the signals — derived so it can't drift from the data.
export const PAIRS = [...new Set(mockSignals.map((s) => s.pair))];

export const DEFAULT_PAIR = PAIRS[0]; // "BTC/USDT"
