import Link from "next/link";
import type { Shop, ShopStatus } from "@repo/types";

export const dynamic = "force-dynamic";

type ShopRow = Pick<
  Shop,
  | "id"
  | "name"
  | "district"
  | "status"
  | "rating_avg"
  | "rating_count"
  | "checkin_count"
  | "is_verified"
  | "is_local_pick"
>;

const fallbackShops: ShopRow[] = [
  {
    id: "seed-banh-da-cua-ba-cu",
    name: "Banh da cua Ba Cu",
    district: "hong_bang",
    status: "open",
    rating_avg: 4.8,
    rating_count: 128,
    checkin_count: 420,
    is_verified: true,
    is_local_pick: true,
  },
  {
    id: "seed-nem-cua-be-co-lan",
    name: "Nem cua be Co Lan",
    district: "ngo_quyen",
    status: "open",
    rating_avg: 4.6,
    rating_count: 94,
    checkin_count: 265,
    is_verified: true,
    is_local_pick: true,
  },
  {
    id: "seed-hai-san-do-son-local",
    name: "Hai san Do Son Local",
    district: "do_son",
    status: "open",
    rating_avg: 4.7,
    rating_count: 116,
    checkin_count: 309,
    is_verified: true,
    is_local_pick: true,
  },
  {
    id: "seed-cafe-hoang-dieu-vintage",
    name: "Cafe Hoang Dieu Vintage",
    district: "hong_bang",
    status: "open",
    rating_avg: 4.4,
    rating_count: 48,
    checkin_count: 96,
    is_verified: true,
    is_local_pick: false,
  },
];

const districtLabels: Record<ShopRow["district"], string> = {
  hong_bang: "Hong Bang",
  le_chan: "Le Chan",
  ngo_quyen: "Ngo Quyen",
  kien_an: "Kien An",
  hai_an: "Hai An",
  do_son: "Do Son",
  duong_kinh: "Duong Kinh",
  thuy_nguyen: "Thuy Nguyen",
  an_duong: "An Duong",
  an_lao: "An Lao",
  tien_lang: "Tien Lang",
  vinh_bao: "Vinh Bao",
  cat_hai: "Cat Hai",
  bach_long_vi: "Bach Long Vi",
};

const statusLabels: Record<ShopStatus, string> = {
  open: "Open",
  closed: "Closed",
  sold_out: "Sold out",
  temporarily_closed: "Paused",
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function loadShops(): Promise<{ shops: ShopRow[]; source: "supabase" | "fallback" }> {
  if (!hasSupabaseEnv()) {
    return { shops: fallbackShops, source: "fallback" };
  }

  const { getShops } = await import("@repo/api-client/shops");
  const { data, error } = await getShops({ page: 1, per_page: 8 });

  if (error || !data) {
    return { shops: fallbackShops, source: "fallback" };
  }

  return { shops: data.data, source: "supabase" };
}

export default async function AdminDashboard() {
  const { shops, source } = await loadShops();
  const verifiedCount = shops.filter((shop) => shop.is_verified).length;
  const localPickCount = shops.filter((shop) => shop.is_local_pick).length;
  const activeCount = shops.filter((shop) => shop.status === "open").length;
  const totalCheckins = shops.reduce((sum, shop) => sum + shop.checkin_count, 0);

  const stats = [
    { label: "Verified shops", value: String(verifiedCount), delta: `${localPickCount} local picks` },
    { label: "Open now", value: String(activeCount), delta: `${shops.length} tracked shops` },
    { label: "Active quests", value: "1", delta: "Seeded MVP quest" },
    { label: "Total check-ins", value: String(totalCheckins), delta: source === "supabase" ? "Live data" : "Demo data" },
  ];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Long Vong HP</p>
          <h1>Admin</h1>
        </div>
        <nav>
          <Link className="active" href="/">
            Overview
          </Link>
          <Link href="/shops">Shops</Link>
          <a href="#">Quests</a>
          <a href="#">Reviews</a>
          <a href="#">Content</a>
          <a href="#">Partners</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Hai Phong travel and food control room</h2>
          </div>
          <button type="button">{source === "supabase" ? "Live Supabase" : "Demo seed"}</button>
        </header>

        <div className="stats">
          {stats.map((stat) => (
            <article key={stat.label} className="stat">
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <span>{stat.delta}</span>
            </article>
          ))}
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Shop pipeline</p>
              <h3>Priority places</h3>
            </div>
            <span>{source === "supabase" ? "Synced from Supabase" : "Using fallback rows"}</span>
          </div>
          <div className="table">
            <div className="row heading">
              <span>Shop</span>
              <span>District</span>
              <span>Status</span>
              <span>Rating</span>
            </div>
            {shops.map((shop) => (
              <div key={shop.id} className="row">
                <span>{shop.name}</span>
                <span>{districtLabels[shop.district]}</span>
                <span>{statusLabels[shop.status]}</span>
                <span>{shop.rating_avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid">
          <article className="panel compact">
            <p className="eyebrow">Next action</p>
            <h3>Apply seed migration</h3>
            <p>
              Run the Supabase migrations, then set NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY for live dashboard data.
            </p>
          </article>
          <article className="panel compact">
            <p className="eyebrow">Deployment</p>
            <h3>Vercel project</h3>
            <p>Set Root Directory to apps/admin-dashboard and keep the same GitHub repository.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
