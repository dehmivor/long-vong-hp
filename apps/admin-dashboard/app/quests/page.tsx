import { revalidatePath } from "next/cache";
import type { Quest, Shop } from "@repo/types";

import { AdminNav } from "../components/admin-nav";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "../lib/supabase-admin";

export const dynamic = "force-dynamic";

type ShopOption = Pick<Shop, "id" | "name" | "district">;

const fallbackQuests: Quest[] = [
  {
    id: "fallback-ngu-dai-mon-ngon",
    name_vi: "Ngũ đại món ngon HP",
    name_en: "Five Hai Phong Signatures",
    name_ko: "하이퐁 대표 맛집 5곳",
    description_vi: "Check-in 5 quán đặc sản để mở huy hiệu và voucher đối tác.",
    description_en: "Check in at 5 signature stops to unlock a badge and partner voucher.",
    description_ko: "대표 맛집 5곳에서 체크인하고 배지와 제휴 쿠폰을 받으세요.",
    badge_url: "/badges/ngu-dai-mon-ngon-hp.png",
    required_shop_ids: [],
    voucher_code: "HPFOOD50",
    voucher_discount_pct: 10,
    is_active: true,
    created_at: new Date(0).toISOString(),
  },
];

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalInt(formData: FormData, key: string): number | null {
  const raw = getText(formData, key);
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${key} must be a whole number between 0 and 100`);
  }
  return value;
}

async function loadQuestAdminData() {
  if (!hasSupabaseAdminEnv()) {
    return { quests: fallbackQuests, shops: [] as ShopOption[], source: "fallback" as const };
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: quests, error: questsError }, { data: shops, error: shopsError }] =
    await Promise.all([
      supabase.from("quests").select("*").order("created_at", { ascending: true }),
      supabase.from("shops").select("id, name, district").order("name", { ascending: true }),
    ]);

  if (questsError || shopsError) {
    return { quests: fallbackQuests, shops: [] as ShopOption[], source: "fallback" as const };
  }

  return {
    quests: (quests ?? []) as Quest[],
    shops: (shops ?? []) as ShopOption[],
    source: "supabase" as const,
  };
}

export async function createQuestAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("quests")
    .insert({
      name_vi: getText(formData, "name_vi"),
      name_en: getText(formData, "name_en"),
      name_ko: getText(formData, "name_ko"),
      description_vi: getText(formData, "description_vi"),
      description_en: getText(formData, "description_en"),
      description_ko: getText(formData, "description_ko"),
      badge_url: getText(formData, "badge_url") || "/badges/default.png",
      // A multi-select posts one entry per chosen shop.
      required_shop_ids: formData.getAll("required_shop_ids").filter(
        (value): value is string => typeof value === "string" && value !== "",
      ),
      voucher_code: getText(formData, "voucher_code") || null,
      voucher_discount_pct: getOptionalInt(formData, "voucher_discount_pct"),
      is_active: formData.get("is_active") === "on",
    })
    .throwOnError();

  revalidatePath("/quests");
  revalidatePath("/");
}

export async function toggleQuestAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("quests")
    .update({
      is_active: formData.get("is_active") === "on",
      voucher_code: getText(formData, "voucher_code") || null,
      voucher_discount_pct: getOptionalInt(formData, "voucher_discount_pct"),
    })
    .eq("id", getText(formData, "id"))
    .throwOnError();

  revalidatePath("/quests");
  revalidatePath("/");
}

export async function deleteQuestAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("quests").delete().eq("id", getText(formData, "id")).throwOnError();

  revalidatePath("/quests");
  revalidatePath("/");
}

export default async function QuestsPage() {
  const { quests, shops, source } = await loadQuestAdminData();
  const disabled = source !== "supabase";
  const shopNames = new Map(shops.map((shop) => [shop.id, shop.name]));

  return (
    <main className="shell">
      <AdminNav active="quests" />

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gamification</p>
            <h2>Quests, badges and vouchers</h2>
          </div>
          <button type="button">
            {source === "supabase" ? "Live writes enabled" : "Configure Supabase"}
          </button>
        </header>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Create</p>
              <h3>Add a quest</h3>
            </div>
            <span>{disabled ? "Needs service role env" : "Writes to Supabase"}</span>
          </div>

          <form action={createQuestAction} className="formGrid">
            <label>
              Name (VI)
              <input name="name_vi" placeholder="Ngũ đại món ngon HP" required disabled={disabled} />
            </label>
            <label>
              Name (EN)
              <input name="name_en" placeholder="Five Hai Phong Signatures" required disabled={disabled} />
            </label>
            <label>
              Name (KO)
              <input name="name_ko" placeholder="하이퐁 대표 맛집 5곳" required disabled={disabled} />
            </label>
            <label>
              Badge image URL
              <input name="badge_url" placeholder="/badges/quest.png" disabled={disabled} />
            </label>
            <label className="wide">
              Description (VI)
              <textarea name="description_vi" rows={2} required disabled={disabled} />
            </label>
            <label className="wide">
              Description (EN)
              <textarea name="description_en" rows={2} required disabled={disabled} />
            </label>
            <label className="wide">
              Description (KO)
              <textarea name="description_ko" rows={2} required disabled={disabled} />
            </label>
            <label className="wide">
              Required shops (ctrl/cmd-click to pick several)
              <select name="required_shop_ids" multiple size={6} disabled={disabled}>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Voucher code
              <input name="voucher_code" placeholder="HPFOOD50" disabled={disabled} />
            </label>
            <label>
              Discount %
              <input
                name="voucher_discount_pct"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                disabled={disabled}
              />
            </label>
            <div className="checkRow">
              <label>
                <input name="is_active" type="checkbox" defaultChecked disabled={disabled} />
                Active
              </label>
            </div>
            <button className="wide" type="submit" disabled={disabled}>
              Create quest
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Read / Update / Delete</p>
              <h3>Quest records</h3>
            </div>
            <span>{quests.length} rows</span>
          </div>

          <div className="shopAdminList">
            {quests.map((quest) => (
              <article key={quest.id} className="shopAdminRow">
                <div>
                  <strong>{quest.name_vi}</strong>
                  <p>
                    {quest.description_vi} · {quest.required_shop_ids.length} shops
                    {quest.required_shop_ids.length > 0 && (
                      <>
                        {" · "}
                        {quest.required_shop_ids
                          .map((id) => shopNames.get(id) ?? id.slice(0, 8))
                          .join(", ")}
                      </>
                    )}
                  </p>
                </div>
                <form action={toggleQuestAction} className="rowControls">
                  <input name="id" type="hidden" value={quest.id} />
                  <input
                    name="voucher_code"
                    defaultValue={quest.voucher_code ?? ""}
                    placeholder="Voucher"
                    disabled={disabled}
                  />
                  <input
                    name="voucher_discount_pct"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={quest.voucher_discount_pct ?? ""}
                    placeholder="%"
                    disabled={disabled}
                  />
                  <label>
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={quest.is_active}
                      disabled={disabled}
                    />
                    Active
                  </label>
                  <button type="submit" disabled={disabled}>
                    Save
                  </button>
                </form>
                <form action={deleteQuestAction}>
                  <input name="id" type="hidden" value={quest.id} />
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
