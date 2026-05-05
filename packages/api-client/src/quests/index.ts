import type { Quest, UserCheckin, UserBadge } from "@repo/types";
import { supabase } from "../client";

// ---- Get all active quests ----
export async function getActiveQuests(): Promise<{ data: Quest[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error };
  return { data: data as Quest[], error: null };
}

// ---- Check in at a shop (QR scan) ----
export async function checkInAtShop(
  shopId: string,
  userLat: number,
  userLng: number
): Promise<{ data: UserCheckin | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  // Server-side validation: checks 50m radius via RPC
  const { data, error } = await supabase.rpc("checkin_at_shop", {
    p_shop_id: shopId,
    p_user_id: user.id,
    p_lat: userLat,
    p_lng: userLng,
  });

  if (error) return { data: null, error };
  return { data: data as UserCheckin, error: null };
}

// ---- Get user's check-in history ----
export async function getMyCheckins(): Promise<{ data: UserCheckin[] | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("user_checkins")
    .select("*, shop:shops(id, name, image_url)")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false });

  if (error) return { data: null, error };
  return { data: data as UserCheckin[], error: null };
}

// ---- Get user's earned badges ----
export async function getMyBadges(): Promise<{ data: UserBadge[] | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("user_badges")
    .select("*, quest:quests(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) return { data: null, error };
  return { data: data as UserBadge[], error: null };
}
