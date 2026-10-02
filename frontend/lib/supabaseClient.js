// Supabase client for TrendPulse.
//
// The PUBLIC demo intentionally ships WITHOUT live credentials — the real data
// pipeline lives in the private production repo. With no env vars set,
// `isConfigured` is false and the data layer surfaces a clear "not connected"
// state instead of pretending to work. This is deliberate: the public repo is
// a portfolio piece, not a runnable product.
//
// In the private build, this module exports a real @supabase/supabase-js
// client created from these same env vars.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Kept intentionally inert in the public demo.
export const supabase = null;