import { revalidatePath } from "next/cache";
import type { Review, Shop, User } from "@repo/types";

import { AdminNav } from "../components/admin-nav";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "../lib/supabase-admin";

export const dynamic = "force-dynamic";

type ReviewRow = Review & {
  shop?: Pick<Shop, "id" | "name">;
  user?: Pick<User, "id" | "full_name" | "avatar_url">;
};

const fallbackReviews: ReviewRow[] = [
  {
    id: "fallback-review-1",
    shop_id: "fallback-banh-da-cua",
    user_id: "fallback-user-1",
    rating: 5,
    content: "Nước dùng đậm đà, chả lá lốt thơm. Quán đông giờ trưa nhưng phục vụ nhanh.",
    images: [],
    is_verified_visit: true,
    helpful_count: 12,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    shop: { id: "fallback-banh-da-cua", name: "Banh da cua Ba Cu" },
    user: { id: "fallback-user-1", full_name: "Minh Tâm" },
  },
];

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function loadReviews() {
  if (!hasSupabaseAdminEnv()) {
    return { reviews: fallbackReviews, source: "fallback" as const };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, shop:shops(id, name), user:users(id, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return { reviews: fallbackReviews, source: "fallback" as const };
  }

  return { reviews: (data ?? []) as ReviewRow[], source: "supabase" as const };
}

/**
 * Moderation is delete-only for now: the schema has no "hidden" flag, and the
 * rating trigger recomputes the shop average automatically on delete.
 */
export async function deleteReviewAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("reviews").delete().eq("id", getText(formData, "id")).throwOnError();

  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function markVerifiedVisitAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("reviews")
    .update({ is_verified_visit: formData.get("is_verified_visit") === "on" })
    .eq("id", getText(formData, "id"))
    .throwOnError();

  revalidatePath("/reviews");
}

export default async function ReviewsPage() {
  const { reviews, source } = await loadReviews();
  const disabled = source !== "supabase";

  const total = reviews.length;
  const verified = reviews.filter((review) => review.is_verified_visit).length;
  const lowRated = reviews.filter((review) => review.rating <= 2).length;
  const average =
    total > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;

  return (
    <main className="shell">
      <AdminNav active="reviews" />

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Community</p>
            <h2>Review moderation</h2>
          </div>
          <button type="button">
            {source === "supabase" ? "Live Supabase" : "Demo seed"}
          </button>
        </header>

        <div className="stats">
          <article className="stat">
            <p>Reviews</p>
            <strong>{total}</strong>
            <span>{verified} verified visits</span>
          </article>
          <article className="stat">
            <p>Average rating</p>
            <strong>{average.toFixed(1)}</strong>
            <span>Across all shops</span>
          </article>
          <article className="stat">
            <p>Needs attention</p>
            <strong>{lowRated}</strong>
            <span>Rated 1–2 stars</span>
          </article>
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Queue</p>
              <h3>Latest reviews</h3>
            </div>
            <span>{disabled ? "Needs service role env" : "Newest first"}</span>
          </div>

          <div className="shopAdminList">
            {reviews.length === 0 && <p>No reviews yet.</p>}

            {reviews.map((review) => (
              <article key={review.id} className="shopAdminRow">
                <div>
                  <strong>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)} · {review.shop?.name ?? review.shop_id}
                  </strong>
                  <p>
                    {review.user?.full_name?.trim() || "Anonymous"} ·{" "}
                    {new Date(review.created_at).toLocaleDateString("vi-VN")} ·{" "}
                    {review.helpful_count} helpful
                    {review.content ? ` · “${review.content}”` : ""}
                  </p>
                </div>
                <form action={markVerifiedVisitAction} className="rowControls">
                  <input name="id" type="hidden" value={review.id} />
                  <label>
                    <input
                      name="is_verified_visit"
                      type="checkbox"
                      defaultChecked={review.is_verified_visit}
                      disabled={disabled}
                    />
                    Verified visit
                  </label>
                  <button type="submit" disabled={disabled}>
                    Save
                  </button>
                </form>
                <form action={deleteReviewAction}>
                  <input name="id" type="hidden" value={review.id} />
                  <button className="danger" type="submit" disabled={disabled}>
                    Remove
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
