// supabase/functions/fetch-market-data/index.ts
// Skeleton: fetches market data for a trading pair.
// For now returns a stubbed payload — live fetch wiring comes Day 13.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface MarketData {
  pair: string;
  price: number | null;
  fetchedAt: string;
}

async function fetchMarketData(pair: string): Promise<MarketData> {
  // TODO (Day 13): replace stub with a real request to a price API
  // (e.g. CoinGecko) and persist the result to Supabase.
  return {
    pair,
    price: null,
    fetchedAt: new Date().toISOString(),
  };
}

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const pair = searchParams.get("pair") ?? "BTC-USD";

  try {
    const data = await fetchMarketData(pair);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});