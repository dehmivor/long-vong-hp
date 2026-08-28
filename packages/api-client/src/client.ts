import { createClient, type SupportedStorage } from "@supabase/supabase-js";

// These env vars must be set in each app's .env (or the monorepo-root .env).
const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const hasValidUrl = /^https?:\/\//.test(rawUrl);

/** True when a real Supabase project is configured; callers use it to pick demo data. */
export const isSupabaseConfigured = hasValidUrl && Boolean(rawKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[api-client] Supabase URL/Key missing or invalid — using a placeholder client " +
      "(live data unavailable, apps fall back to demo data). " +
      "Set NEXT_PUBLIC_SUPABASE_URL to your project URL (https://xxxx.supabase.co) " +
      "and NEXT_PUBLIC_SUPABASE_ANON_KEY to your anon/publishable key."
  );
}

// ------------------------------------------------------------
// Pluggable session storage
//
// The browser gets localStorage for free, but React Native has no such global.
// Rather than importing AsyncStorage here (which would break the Next.js
// builds), expose a setter the Expo app calls once at startup. The adapter
// passed to supabase-js delegates on every call, so it picks up whatever has
// been registered by the time the first auth request runs.
// ------------------------------------------------------------
const memoryStore = new Map<string, string>();

const memoryStorage: SupportedStorage = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

function defaultStorage(): SupportedStorage {
  if (typeof globalThis.localStorage !== "undefined") {
    return globalThis.localStorage;
  }
  return memoryStorage;
}

let registeredStorage: SupportedStorage | null = null;

/**
 * Register the platform session store. Call once before any auth request —
 * e.g. `setAuthStorage(AsyncStorage)` from the Expo root layout.
 */
export function setAuthStorage(storage: SupportedStorage): void {
  registeredStorage = storage;
}

const delegatingStorage: SupportedStorage = {
  getItem: (key) => (registeredStorage ?? defaultStorage()).getItem(key),
  setItem: (key, value) => (registeredStorage ?? defaultStorage()).setItem(key, value),
  removeItem: (key) => (registeredStorage ?? defaultStorage()).removeItem(key),
};

// Fall back to harmless placeholders so createClient never throws at import time
// (e.g. during a production build or CI without secrets). Requests will simply
// fail and callers surface their demo fallback.
const supabaseUrl = hasValidUrl ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = rawKey || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: delegatingStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Only the web surfaces have a URL to parse an OAuth fragment out of.
    detectSessionInUrl: typeof window !== "undefined" && typeof window.location !== "undefined",
  },
});
