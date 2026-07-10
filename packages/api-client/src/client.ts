import { createClient } from "@supabase/supabase-js";

// These env vars must be set in each app's .env (or the monorepo-root .env).
const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const hasValidUrl = /^https?:\/\//.test(rawUrl);

if (!hasValidUrl || !rawKey) {
  console.warn(
    "[api-client] Supabase URL/Key missing or invalid — using a placeholder client " +
      "(live data unavailable, apps fall back to demo data). " +
      "Set NEXT_PUBLIC_SUPABASE_URL to your project URL (https://xxxx.supabase.co) " +
      "and NEXT_PUBLIC_SUPABASE_ANON_KEY to your anon/publishable key."
  );
}

// Fall back to harmless placeholders so createClient never throws at import time
// (e.g. during a production build or CI without secrets). Requests will simply
// fail and callers surface their demo fallback.
const supabaseUrl = hasValidUrl ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = rawKey || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
