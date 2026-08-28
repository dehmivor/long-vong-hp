import type { CreateReelInput, Reel, UpdateReelInput } from "@repo/types";
import { supabase } from "../client";

const REEL_SELECT =
  "*, shop:shops(id, name, address, district, rating_avg, is_local_pick)";

// ---- Published reel feed (ordered like the vertical pager renders it) ----
export async function getReelsFeed(
  limit: number = 20
): Promise<{ data: Reel[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("reels")
    .select(REEL_SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: null, error };
  return { data: data as Reel[], error: null };
}

// ---- Reels for one shop (shown on the shop detail screen) ----
export async function getReelsByShop(
  shopId: string
): Promise<{ data: Reel[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("reels")
    .select(REEL_SELECT)
    .eq("shop_id", shopId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) return { data: null, error };
  return { data: data as Reel[], error: null };
}

// ---- Fire-and-forget view counter ----
export async function incrementReelView(reelId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc("increment_reel_view", { p_reel_id: reelId });
  return { error: error ?? null };
}

// ---- Admin: list every reel including drafts (requires service role) ----
export async function getAllReels(): Promise<{ data: Reel[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("reels")
    .select(REEL_SELECT)
    .order("sort_order", { ascending: true });

  if (error) return { data: null, error };
  return { data: data as Reel[], error: null };
}

// ---- Admin: create / update / delete ----
export async function createReel(
  input: CreateReelInput
): Promise<{ data: Reel | null; error: Error | null }> {
  const { data, error } = await supabase.from("reels").insert(input).select(REEL_SELECT).single();

  if (error) return { data: null, error };
  return { data: data as Reel, error: null };
}

export async function updateReel(
  id: string,
  input: UpdateReelInput
): Promise<{ data: Reel | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("reels")
    .update(input)
    .eq("id", id)
    .select(REEL_SELECT)
    .single();

  if (error) return { data: null, error };
  return { data: data as Reel, error: null };
}

export async function deleteReel(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("reels").delete().eq("id", id);
  return { error: error ?? null };
}
