// services/signals/publishSignals.js
//
// Day 19 — Run the signal rules on recent prices and publish rows to the
// Supabase `signals` table.
//
// Env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (see .env.example)
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
import { maCrossoverSignal, rsiThresholdSignal } from "./index.js";
import { maCrossoverRow, rsiThresholdRow } from "./toSignalRow.js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

function getRecentPrices(pair) {
  const series = mockPrices[pair] ?? [];
  return series.map((p) => p.price);
}

// The adapters return lowercase types ("buy" / "sell" / "hold") to match the
// rule outputs. The DB schema (supabase/migrations/0001_init.sql) enforces
// uppercase via a CHECK constraint, so we normalize right before insert.
function toDbRow(row) {
  return { ...row, type: row.type.toUpperCase() };
}

function buildRows() {
  const rows = [];
  const now = new Date().toISOString();
  const pairs = Object.keys(mockPrices);

  for (const pair of pairs) {
    const prices = getRecentPrices(pair);
    if (prices.length === 0) continue;

    const ma = maCrossoverSignal(prices);
    rows.push(maCrossoverRow({ pair, prices, result: ma, now }));

    const rsi = rsiThresholdSignal(prices);
    rows.push(rsiThresholdRow({ pair, prices, result: rsi, now }));
  }

  return rows;
}

async function main() {
  const rows = buildRows();

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
