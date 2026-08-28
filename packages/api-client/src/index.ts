// ============================================================
// @repo/api-client — Main Entry Point
// ============================================================

export { supabase, isSupabaseConfigured, setAuthStorage } from "./client";

// Auth
export * from "./auth/index";

// Shops
export * from "./shops/index";

// Reviews
export * from "./reviews/index";

// Quests / Gamification
export * from "./quests/index";

// Reels (HLS short-form video)
export * from "./reels/index";
