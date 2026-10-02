-- TrendPulse — initial schema (public demo)
--
-- These tables mirror the shape the frontend already uses
-- (see frontend/src/data/mockSignals.js). This migration is included as a
-- portfolio reference for data modeling. The PUBLIC demo does not connect to
-- a live Supabase project — the production data pipeline lives in the private
-- repo. See the project README.

-- Raw price points, one row per observation.
create table if not exists public.prices (
  id          bigint generated always as identity primary key,
  pair        text        not null,
  price       numeric     not null,
  recorded_at timestamptz not null default now()
);

-- Fast lookups of the latest prices for a given pair.
create index if not exists prices_pair_time_idx
  on public.prices (pair, recorded_at desc);

-- Generated trading signals.
create table if not exists public.signals (
  id         bigint      generated always as identity primary key,
  pair       text        not null,
  type       text        not null check (type in ('BUY', 'SELL', 'HOLD')),
  price      numeric     not null,
  change     numeric     not null,              -- percent change at signal time
  confidence numeric     not null check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

-- Fast lookups of the latest signals for a given pair.
create index if not exists signals_pair_time_idx
  on public.signals (pair, created_at desc);