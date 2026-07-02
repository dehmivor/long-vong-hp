import { revalidatePath } from "next/cache";
import type { Category, HaiphongDistrict, PriceRange, Shop, ShopStatus } from "@repo/types";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "../lib/supabase-admin";

export const dynamic = "force-dynamic";

type ShopWithCategory = Shop & { category?: Category };

const districts: { value: HaiphongDistrict; label: string }[] = [
  { value: "hong_bang", label: "Hong Bang" },
  { value: "le_chan", label: "Le Chan" },
  { value: "ngo_quyen", label: "Ngo Quyen" },
  { value: "kien_an", label: "Kien An" },
  { value: "hai_an", label: "Hai An" },
  { value: "do_son", label: "Do Son" },
  { value: "duong_kinh", label: "Duong Kinh" },
  { value: "thuy_nguyen", label: "Thuy Nguyen" },
  { value: "an_duong", label: "An Duong" },
  { value: "an_lao", label: "An Lao" },
  { value: "tien_lang", label: "Tien Lang" },
  { value: "vinh_bao", label: "Vinh Bao" },
  { value: "cat_hai", label: "Cat Hai" },
  { value: "bach_long_vi", label: "Bach Long Vi" },
];

const statuses: ShopStatus[] = ["open", "closed", "sold_out", "temporarily_closed"];
const prices: PriceRange[] = ["budget", "mid", "premium"];

const fallbackCategories: Category[] = [
  {
    id: "fallback-dac-san",
    name_vi: "Dac san HP",
    name_en: "HP Specialties",
    name_ko: "HP specialties",
    slug: "dac-san-hp",
    color: "#EF4444",
    created_at: new Date(0).toISOString(),
  },
];

const fallbackShops: ShopWithCategory[] = [
  {
    id: "fallback-banh-da-cua",
    name: "Banh da cua Ba Cu",
    address: "12 Dinh Tien Hoang, Hong Bang, Hai Phong",
    district: "hong_bang",
    latitude: 20.862236,
    longitude: 106.683456,
    images: [],
    category_id: fallbackCategories[0].id,
    category: fallbackCategories[0],
    price_range: "budget",
    status: "open",
    is_verified: true,
    is_local_pick: true,
    rating_avg: 4.8,
    rating_count: 128,
    checkin_count: 420,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
];

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getText(formData, key));
  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a number`);
  }
  return value;
}

async function loadShopAdminData() {
  if (!hasSupabaseAdminEnv()) {
    return { shops: fallbackShops, categories: fallbackCategories, source: "fallback" as const };
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: shops, error: shopsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("shops")
        .select("*, category:categories(*)")
        .order("is_local_pick", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase.from("categories").select("*").order("name_vi", { ascending: true }),
    ]);

  if (shopsError || categoriesError) {
    return { shops: fallbackShops, categories: fallbackCategories, source: "fallback" as const };
  }

  return {
    shops: (shops ?? []) as ShopWithCategory[],
    categories: (categories ?? []) as Category[],
    source: "supabase" as const,
  };
}

export async function createShopAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const supabase = createSupabaseAdminClient();
  const payload = {
    name: getText(formData, "name"),
    address: getText(formData, "address"),
    district: getText(formData, "district") as HaiphongDistrict,
    latitude: getNumber(formData, "latitude"),
    longitude: getNumber(formData, "longitude"),
    category_id: getText(formData, "category_id"),
    price_range: getText(formData, "price_range") as PriceRange,
    status: getText(formData, "status") as ShopStatus,
    description_vi: getText(formData, "description_vi") || null,
    phone: getText(formData, "phone") || null,
    is_verified: formData.get("is_verified") === "on",
    is_local_pick: formData.get("is_local_pick") === "on",
  };

  await supabase.from("shops").insert(payload).throwOnError();
  revalidatePath("/");
  revalidatePath("/shops");
}

export async function updateShopAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const id = getText(formData, "id");
  const supabase = createSupabaseAdminClient();

  await supabase
    .from("shops")
    .update({
      status: getText(formData, "status") as ShopStatus,
      is_verified: formData.get("is_verified") === "on",
      is_local_pick: formData.get("is_local_pick") === "on",
    })
    .eq("id", id)
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/shops");
}

export async function deleteShopAction(formData: FormData) {
  "use server";

  if (!hasSupabaseAdminEnv()) return;

  const id = getText(formData, "id");
  const supabase = createSupabaseAdminClient();

  await supabase.from("shops").delete().eq("id", id).throwOnError();
  revalidatePath("/");
  revalidatePath("/shops");
}

export default async function ShopsPage() {
  const { shops, categories, source } = await loadShopAdminData();
  const disabled = source !== "supabase";

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Long Vong HP</p>
          <h1>Admin</h1>
        </div>
        <nav>
          <a href="/">Overview</a>
          <a className="active" href="/shops">
            Shops
          </a>
          <a href="#">Quests</a>
          <a href="#">Reviews</a>
          <a href="#">Content</a>
          <a href="#">Partners</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Shop CRUD</p>
            <h2>Manage local places</h2>
          </div>
          <button type="button">{source === "supabase" ? "Live writes enabled" : "Configure Supabase"}</button>
        </header>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Create</p>
              <h3>Add a shop</h3>
            </div>
            <span>{disabled ? "Needs service role env" : "Writes to Supabase"}</span>
          </div>

          <form action={createShopAction} className="formGrid">
            <label>
              Shop name
              <input name="name" placeholder="Banh da cua..." required disabled={disabled} />
            </label>
            <label>
              Category
              <select name="category_id" required disabled={disabled}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_vi}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              Address
              <input name="address" placeholder="Street, district, Hai Phong" required disabled={disabled} />
            </label>
            <label>
              District
              <select name="district" required disabled={disabled}>
                {districts.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price
              <select name="price_range" defaultValue="budget" required disabled={disabled}>
                {prices.map((price) => (
                  <option key={price} value={price}>
                    {price}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="open" required disabled={disabled}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Latitude
              <input name="latitude" type="number" step="any" placeholder="20.862236" required disabled={disabled} />
            </label>
            <label>
              Longitude
              <input name="longitude" type="number" step="any" placeholder="106.683456" required disabled={disabled} />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="Optional" disabled={disabled} />
            </label>
            <label className="wide">
              Vietnamese description
              <textarea name="description_vi" rows={3} disabled={disabled} />
            </label>
            <div className="checkRow">
              <label>
                <input name="is_verified" type="checkbox" defaultChecked disabled={disabled} />
                Verified
              </label>
              <label>
                <input name="is_local_pick" type="checkbox" disabled={disabled} />
                Local pick
              </label>
            </div>
            <button className="wide" type="submit" disabled={disabled}>
              Create shop
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Read / Update / Delete</p>
              <h3>Shop records</h3>
            </div>
            <span>{shops.length} rows</span>
          </div>

          <div className="shopAdminList">
            {shops.map((shop) => (
              <article key={shop.id} className="shopAdminRow">
                <div>
                  <strong>{shop.name}</strong>
                  <p>
                    {shop.address} · {shop.category?.name_vi ?? "Uncategorized"} · Star{" "}
                    {shop.rating_avg.toFixed(1)}
                  </p>
                </div>
                <form action={updateShopAction} className="rowControls">
                  <input name="id" type="hidden" value={shop.id} />
                  <select name="status" defaultValue={shop.status} disabled={disabled}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <label>
                    <input name="is_verified" type="checkbox" defaultChecked={shop.is_verified} disabled={disabled} />
                    Verified
                  </label>
                  <label>
                    <input
                      name="is_local_pick"
                      type="checkbox"
                      defaultChecked={shop.is_local_pick}
                      disabled={disabled}
                    />
                    Local
                  </label>
                  <button type="submit" disabled={disabled}>
                    Save
                  </button>
                </form>
                <form action={deleteShopAction}>
                  <input name="id" type="hidden" value={shop.id} />
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
