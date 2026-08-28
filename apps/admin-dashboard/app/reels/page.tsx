import { revalidatePath } from "next/cache";
import type { Reel, Shop } from "@repo/types";

import { AdminNav } from "../components/admin-nav";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "../lib/supabase-admin";

export const dynamic = "force-dynamic";

type ShopOption = Pick<Shop, "id" | "name">;
type ReelRow = Reel & { shop?: ShopOption };

const fallbackReels: ReelRow[] = [
  {
    id: "fallback-reel-banh-da-cua",
    title_vi: "Bánh đa cua nóng hổi",
    title_en: "Hot Hai Phong crab noodles",
    title_ko: "따끈한 하이퐁 게 국수",
    caption_vi: "Nước dùng cua đồng, chả lá lốt và rau muống chần.",
    video_url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    duration_sec: 18,
    view_count: 1240,
    like_count: 318,
    sort_order: 1,
    is_published: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
];

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getInt(formData: FormData, key: string, fallback: number): number {
  const raw = getText(formData, key);
  if (raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${key} must be a non-negative whole number`);
  }
  return value;
}

async function loadReelAdminData() {
  if (!hasSupabaseAdminEnv()) {
    return { reels: fallbackReels, shops: [] as ShopOption[], source: "fallback" as const };
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: reels, error: reelsError }, { data: shops, error: shopsError }] =
    await Promise.all([
      supabase
        .from("reels")
        .select("*, shop:shops(id, name)")
        .order("sort_order", { ascending: true })
        .limit(100),
      supabase.from("shops").select("id, name").order("name", { ascending: true }),
    ]);

  if (reelsError || shopsError) {
    return { reels: fallbackReels, shops: [] as ShopOption[], source: "fallback" as const };
  }

  return {
    reels: (reels ?? []) as ReelRow[],
    shops: (shops ?? []) as ShopOption[],
    source: "supabase" as const,
  };
}

export async function createReelAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("reels")
    .insert({
      shop_id: getText(formData, "shop_id") || null,
      title_vi: getText(formData, "title_vi"),
      title_en: getText(formData, "title_en"),
      title_ko: getText(formData, "title_ko"),
      caption_vi: getText(formData, "caption_vi") || null,
      caption_en: getText(formData, "caption_en") || null,
      caption_ko: getText(formData, "caption_ko") || null,
      video_url: getText(formData, "video_url"),
      thumbnail_url: getText(formData, "thumbnail_url") || null,
      duration_sec: getInt(formData, "duration_sec", 0),
      sort_order: getInt(formData, "sort_order", 0),
      is_published: formData.get("is_published") === "on",
    })
    .throwOnError();

  revalidatePath("/reels");
}

export async function updateReelAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("reels")
    .update({
      sort_order: getInt(formData, "sort_order", 0),
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", getText(formData, "id"))
    .throwOnError();

  revalidatePath("/reels");
}

export async function deleteReelAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("reels").delete().eq("id", getText(formData, "id")).throwOnError();

  revalidatePath("/reels");
}

export default async function ReelsPage() {
  const { reels, shops, source } = await loadReelAdminData();
  const disabled = source !== "supabase";
  const published = reels.filter((reel) => reel.is_published).length;

  return (
    <main className="shell">
      <AdminNav active="reels" />

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Media</p>
            <h2>Food reels (HLS)</h2>
          </div>
          <button type="button">
            {source === "supabase" ? "Live writes enabled" : "Configure Supabase"}
          </button>
        </header>

        <div className="stats">
          <article className="stat">
            <p>Published</p>
            <strong>{published}</strong>
            <span>{reels.length} total reels</span>
          </article>
          <article className="stat">
            <p>Total views</p>
            <strong>{reels.reduce((sum, reel) => sum + reel.view_count, 0)}</strong>
            <span>Across the feed</span>
          </article>
          <article className="stat">
            <p>Total likes</p>
            <strong>{reels.reduce((sum, reel) => sum + reel.like_count, 0)}</strong>
            <span>Across the feed</span>
          </article>
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Create</p>
              <h3>Publish a reel</h3>
            </div>
            <span>Prefer an .m3u8 HLS manifest so weak 4G drops rendition instead of stalling</span>
          </div>

          <form action={createReelAction} className="formGrid">
            <label>
              Shop
              <select name="shop_id" disabled={disabled}>
                <option value="">— No shop —</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Duration (seconds)
              <input name="duration_sec" type="number" min={0} placeholder="18" disabled={disabled} />
            </label>
            <label>
              Title (VI)
              <input name="title_vi" required disabled={disabled} />
            </label>
            <label>
              Title (EN)
              <input name="title_en" required disabled={disabled} />
            </label>
            <label>
              Title (KO)
              <input name="title_ko" required disabled={disabled} />
            </label>
            <label>
              Sort order
              <input name="sort_order" type="number" min={0} placeholder="1" disabled={disabled} />
            </label>
            <label className="wide">
              Video URL (HLS .m3u8 or MP4)
              <input
                name="video_url"
                placeholder="https://.../playlist.m3u8"
                required
                disabled={disabled}
              />
            </label>
            <label className="wide">
              Thumbnail URL
              <input name="thumbnail_url" placeholder="https://.../thumb.jpg" disabled={disabled} />
            </label>
            <label className="wide">
              Caption (VI)
              <textarea name="caption_vi" rows={2} disabled={disabled} />
            </label>
            <label className="wide">
              Caption (EN)
              <textarea name="caption_en" rows={2} disabled={disabled} />
            </label>
            <label className="wide">
              Caption (KO)
              <textarea name="caption_ko" rows={2} disabled={disabled} />
            </label>
            <div className="checkRow">
              <label>
                <input name="is_published" type="checkbox" disabled={disabled} />
                Publish immediately
              </label>
            </div>
            <button className="wide" type="submit" disabled={disabled}>
              Create reel
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Read / Update / Delete</p>
              <h3>Reel records</h3>
            </div>
            <span>{reels.length} rows</span>
          </div>

          <div className="shopAdminList">
            {reels.map((reel) => (
              <article key={reel.id} className="shopAdminRow">
                <div>
                  <strong>{reel.title_vi}</strong>
                  <p>
                    {reel.shop?.name ?? "Unlinked"} · {reel.duration_sec}s · {reel.view_count} views
                    · {reel.video_url.endsWith(".m3u8") ? "HLS" : "Progressive"}
                  </p>
                </div>
                <form action={updateReelAction} className="rowControls">
                  <input name="id" type="hidden" value={reel.id} />
                  <input
                    name="sort_order"
                    type="number"
                    min={0}
                    defaultValue={reel.sort_order}
                    disabled={disabled}
                  />
                  <label>
                    <input
                      name="is_published"
                      type="checkbox"
                      defaultChecked={reel.is_published}
                      disabled={disabled}
                    />
                    Published
                  </label>
                  <button type="submit" disabled={disabled}>
                    Save
                  </button>
                </form>
                <form action={deleteReelAction}>
                  <input name="id" type="hidden" value={reel.id} />
                  <button className="danger" type="submit" disabled={disabled}>
                    Delete
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
