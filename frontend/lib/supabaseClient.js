// Supabase client for TrendPulse (frontend).
//
// When the VITE_SUPABASE_* env vars are present, this exports a real
// @supabase/supabase-js client. With no credentials (the default for the
// public demo) `isConfigured` is false, `supabase` is null, and the data
// layer surfaces a clear "not connected" state instead of pretending to work.
//
// Only the ANON key belongs here — VITE_ vars are embedded in the client
// bundle, so the service-role key stays server-side (see services/).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// A real client when credentials exist; null in the public demo so callers
// can fall back to the "not connected" state.
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;