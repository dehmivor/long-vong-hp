import type { Review } from "@repo/types";
import { supabase } from "../client";

// ---- Get reviews for a shop ----
export async function getShopReviews(
  shopId: string,
  page: number = 1,
  per_page: number = 10
): Promise<{ data: Review[] | null; error: Error | null }> {
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users(id, full_name, avatar_url)")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { data: null, error };
  return { data: data as Review[], error: null };
}

// ---- Create a review ----
export async function createReview(
  review: Pick<Review, "shop_id" | "rating" | "content" | "images">
): Promise<{ data: Review | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ...review,
      user_id: user.id,
      is_verified_visit: false,
    })
    .select("*, user:users(id, full_name, avatar_url)")
    .single();

  if (error) return { data: null, error };
  return { data: data as Review, error: null };
}

// ---- Mark review as helpful ----
export async function markReviewHelpful(
  reviewId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc("increment_review_helpful", {
    review_id: reviewId,
  });
  return { error: error ?? null };
}

// ---- Get user's own reviews ----
export async function getMyReviews(): Promise<{ data: Review[] | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("reviews")
    .select("*, shop:shops(id, name, image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };
  return { data: data as Review[], error: null };
}
