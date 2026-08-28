// Single source of truth for "do we have a live backend?" on the client.
// Read from the Expo env directly so demo screens can skip the network call
// (and the Supabase import) entirely.
export const isSupabaseReady = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);
