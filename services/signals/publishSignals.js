// services/signals/publishSignals.js
//
// Day 19 — Run the signal rules on recent prices and publish rows to the
// Supabase `signals` table.
//
// Env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (see .env.example)
//       ML_API_URL  optional, e.g. http://127.0.0.1:8000 (uvicorn ml.api:app).
//                   When set, the model confirms or vetoes each rule signal
//                   (see modelFilter.js); when unset, rule signals pass as-is.
// Run:  node services/signals/publishSignals.js
//
// Reads the frontend's mock price series as its source for now — once a
// real price-history source lands (edge function pulling from Coinbase,
// probably reading from the `prices` table), swap getRecentPrices() for
// that. With no Supabase env configured we log the rows that WOULD have
// been inserted instead of crashing — handy for local dry runs.

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { mockPrices } from "../../frontend/src/data/mockPrices.js";
import {
  applyModelFilter,
  featuresFromPrices,
  fetchPrediction,
  maCrossoverSignal,
  rsiThresholdSignal,
} from "./index.js";
import { maCrossoverRow, rsiThresholdRow } from "./toSignalRow.js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ML_API_URL } = process.env;

function getRecentPrices(pair) {
  const series = mockPrices[pair] ?? [];
  return series.map((p) => p.price);
}

// The model needs the latest bar's volume. The mock series has none, so
// predictions are skipped until a real price source supplies it.
function getLatestVolume(pair) {
  const series = mockPrices[pair] ?? [];
  return series.at(-1)?.volume ?? null;
}

// The adapters return lowercase types ("buy" / "sell" / "hold") to match the
// rule outputs. The DB schema (supabase/migrations/0001_init.sql) enforces
// uppercase via a CHECK constraint, so we normalize right before insert.
function toDbRow(row) {
  return { ...row, type: row.type.toUpperCase() };
}

async function buildRows() {
  const rows = [];
  const now = new Date().toISOString();
  const pairs = Object.keys(mockPrices);

  for (const pair of pairs) {
    const prices = getRecentPrices(pair);
    if (prices.length === 0) continue;

    // One prediction per pair, shared by both rules.
    const features = featuresFromPrices(prices, getLatestVolume(pair));
    const prediction = await fetchPrediction(features, ML_API_URL);

    const ma = applyModelFilter(maCrossoverSignal(prices), prediction);
    rows.push(maCrossoverRow({ pair, prices, result: ma, now }));

    const rsi = applyModelFilter(rsiThresholdSignal(prices), prediction);
    rows.push(rsiThresholdRow({ pair, prices, result: rsi, now }));

    console.log(
      `[publishSignals] ${pair} model ${prediction ? `${prediction.direction} @ ${prediction.confidence}` : "n/a"}` +
        ` — ma ${ma.modelVerdict}, rsi ${rsi.modelVerdict}`,
    );
  }

  return rows;
}

async function main() {
  const rows = await buildRows();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log(
      `[publishSignals] Supabase env not configured — logging ${rows.length} rows instead of inserting:`,
    );
    for (const r of rows) console.log(r);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const dbRows = rows.map(toDbRow);
  const { data, error } = await supabase.from("signals").insert(dbRows).select();
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
  console.log(`[publishSignals] inserted ${data.length} rows`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
