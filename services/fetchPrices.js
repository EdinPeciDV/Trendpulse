// services/fetchPrices.js
//
// Day 13 — Fetch the live BTC-USD spot price from Coinbase and store it in Supabase.
//
// Run:  node services/fetchPrices.js
// Env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (see .env.example)
//
// Assumes a `prices` table (from your Day 11 migration) roughly like:
//   create table prices (
//     id          bigint generated always as identity primary key,
//     pair        text        not null,
//     price       numeric     not null,
//     source      text        not null,
//     fetched_at  timestamptz not null default now()
//   );
// If your column names differ, tweak the `row` object below to match.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const PAIR = 'BTC-USD';
const SOURCE = 'coinbase';
const COINBASE_URL = `https://api.coinbase.com/v2/prices/${PAIR}/spot`;

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function fetchSpotPrice() {
  const res = await fetch(COINBASE_URL);
  if (!res.ok) {
    throw new Error(`Coinbase responded ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const amount = json?.data?.amount;
  if (amount == null) {
    throw new Error(`Unexpected Coinbase payload: ${JSON.stringify(json)}`);
  }
  return Number(amount);
}

async function main() {
  const price = await fetchSpotPrice();

  const row = {
    pair: PAIR,
    price,
    source: SOURCE,
    fetched_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('prices')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`Stored ${PAIR} @ ${price} (${SOURCE}) — row id ${data.id}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});