"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getShops } from "@repo/api-client";
import type { MapShop } from "@repo/ui/shop-map";

const ShopMap = dynamic(
  () => import("@repo/ui/shop-map").then((module) => module.ShopMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface)",
          borderRadius: 16,
          color: "var(--color-text-muted)",
        }}
      >
        Đang tải bản đồ...
      </div>
    ),
  }
);

const ALL_CATEGORY = "Tất cả";

const MOCK_SHOPS: MapShop[] = [
  {
    id: "1",
    name: "Bánh đa cua Bà Cụ",
    latitude: 20.8449,
    longitude: 106.6881,
    address: "12 Đinh Tiên Hoàng, Hồng Bàng",
    category: { name_vi: "Đặc sản HP", color: "#FF6B35" },
    rating_avg: 4.8,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "2",
    name: "Nem cua bể Cô Lan",
    latitude: 20.8521,
    longitude: 106.6943,
    address: "45 Lạch Tray, Ngô Quyền",
    category: { name_vi: "Đặc sản HP", color: "#EF4444" },
    rating_avg: 4.6,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "3",
    name: "Bún tôm Hải Phòng cổ điển",
    latitude: 20.839,
    longitude: 106.682,
    address: "89 Cầu Đất, Ngô Quyền",
    category: { name_vi: "Bún và miến", color: "#10B981" },
    rating_avg: 4.5,
    status: "open",
    is_local_pick: false,
  },
  {
    id: "4",
    name: "Hải sản Đồ Sơn",
    latitude: 20.728,
    longitude: 106.764,
    address: "Khu 1, Đồ Sơn, Hải Phòng",
    category: { name_vi: "Hải sản", color: "#0099CC" },
    rating_avg: 4.7,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "5",
    name: "Bánh mì que Phượng Đỏ",
    latitude: 20.846,
    longitude: 106.701,
    address: "78 Lê Lợi, Lê Chân",
    category: { name_vi: "Bánh mì", color: "#F59E0B" },
    rating_avg: 4.3,
    status: "sold_out",
    is_local_pick: false,
  },
  {
    id: "6",
    name: "Cafe Hoàng Diệu Vintage",
    latitude: 20.8502,
    longitude: 106.6855,
    address: "3 Hoàng Diệu, Hồng Bàng",
    category: { name_vi: "Cà phê", color: "#A0522D" },
    rating_avg: 4.4,
    status: "open",
    is_local_pick: false,
  },
];

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function toMapShop(shop: {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  category?: { name_vi?: string; color?: string } | null;
  rating_avg?: number;
  status?: MapShop["status"];
  is_local_pick?: boolean;
  image_url?: string;
}): MapShop | null {
  if (typeof shop.latitude !== "number" || typeof shop.longitude !== "number") return null;
  return {
    id: String(shop.id),
    name: shop.name ?? "",
    latitude: shop.latitude,
    longitude: shop.longitude,
    address: shop.address ?? "",
    category: shop.category?.name_vi
      ? { name_vi: shop.category.name_vi, color: shop.category.color ?? "#6B7280" }
      : undefined,
    rating_avg: Number(shop.rating_avg ?? 0),
    status: shop.status ?? "open",
    is_local_pick: Boolean(shop.is_local_pick),
    image_url: shop.image_url,
  };
}

const FEATURES = [
  {
    icon: "🎬",
    title: "Food Reels",
    desc: "Video ngắn giúp du khách nhìn món ăn, không gian và cách đi trước khi đến quán.",
    bg: "rgba(255,107,53,0.12)",
  },
  {
    icon: "📍",
    title: "Local Choice Map",
    desc: "Bản đồ các quán được tuyển chọn bởi người bản địa, có trạng thái mở cửa và local pick.",
    bg: "rgba(0,153,204,0.12)",
  },
  {
    icon: "🏆",
    title: "Quest & Check-in",
    desc: "Quét QR tại quán, tích điểm, sưu tập huy hiệu và đổi voucher từ đối tác địa phương.",
    bg: "rgba(255,210,63,0.12)",
  },
  {
    icon: "🌏",
    title: "Việt - Anh - Hàn",
    desc: "Sẵn sàng cho khách du lịch, chuyên gia và cộng đồng quốc tế đang sống tại Hải Phòng.",
    bg: "rgba(16,185,129,0.12)",
  },
];

function statusLabel(status: MapShop["status"]) {
  if (status === "open") return "Đang mở";
  if (status === "sold_out") return "Hết món";
  return "Đã đóng";
}

function shopIcon(category?: string) {
  if (category === "Hải sản") return "🦐";
  if (category === "Cà phê") return "☕";
  if (category === "Bánh mì") return "🥖";
  return "🍜";
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [selectedShop, setSelectedShop] = useState<MapShop | null>(null);
  const [shops, setShops] = useState<MapShop[]>(MOCK_SHOPS);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    if (!hasSupabase) return;
    let active = true;
    getShops({ per_page: 100 })
      .then(({ data, error }) => {
        if (!active || error) return;
        const mapped = (data?.data ?? [])
          .map(toMapShop)
          .filter((s): s is MapShop => s !== null);
        if (mapped.length > 0) {
          setShops(mapped);
          setUsingDemo(false);
        }
      })
      .catch(() => {
        // Keep the demo shops visible if the request fails.
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const names = Array.from(
      new Set(shops.map((shop) => shop.category?.name_vi).filter(Boolean))
    ) as string[];
    return [ALL_CATEGORY, ...names];
  }, [shops]);

  const filteredShops = useMemo(
    () =>
      activeCategory === ALL_CATEGORY
        ? shops
        : shops.filter((shop) => shop.category?.name_vi === activeCategory),
    [activeCategory, shops]
  );

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="nav-logo">
            Long Vong <span>HP</span>
          </Link>
          <ul className="nav-links">
            <li>
              <a href="#features">Tính năng</a>
            </li>
            <li>
              <a href="#map">Bản đồ</a>
            </li>
            <li>
              <a href="#about">Lộ trình</a>
            </li>
          </ul>
          <a className="nav-cta" href="#map">
            Xem demo
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">Made for Hai Phong locals and travelers</div>
              <h1 className="hero-title">
                Khám phá Hải Phòng
                <br />
                <span className="highlight">chuẩn bản địa</span>
              </h1>
              <p className="hero-subtitle">
                Long Vong HP là combo sản phẩm du lịch gồm landing page, app mobile và trang quản
                trị. MVP tập trung vào bản đồ quán ngon, food reels, check-in quest và dữ liệu minh
                bạch cho đối tác địa phương.
              </p>
              <div className="hero-actions">
                <a href="#map" className="btn-primary">
                  Xem bản đồ demo
                </a>
                <a href="#features" className="btn-ghost">
                  Xem tính năng
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Sản phẩm</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{shops.length}</span>
                  <span className="stat-label">{usingDemo ? "Quán demo" : "Quán"}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">VI/EN/KO</span>
                  <span className="stat-label">Đa ngôn ngữ</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                    Hải Phòng today
                  </div>
                  {shops.slice(0, 3).map((shop) => (
                    <div key={shop.id} className="shop-card-mini">
                      <div className="shop-img-mini">{shopIcon(shop.category?.name_vi)}</div>
                      <div className="shop-info-mini">
                        <h4>{shop.name}</h4>
                        <p>
                          ★ {shop.rating_avg} · {shop.address.split(",")[1]?.trim()}
                        </p>
                        {shop.is_local_pick && <span className="local-badge">Local Pick</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-card float-card-1">
                <p>Quest mới</p>
                <small>Ngũ đại món ngon HP</small>
              </div>
              <div className="float-card float-card-2">
                <p>Check-in thành công</p>
                <small>+10 điểm thưởng</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <p className="section-label">Tính năng cốt lõi</p>
          <h2 className="section-title">Một nền tảng cho du lịch và ẩm thực Hải Phòng</h2>
          <p className="section-subtitle">
            MVP ưu tiên những luồng có giá trị rõ: tìm quán, xem nội dung ngắn, check-in và quản
            trị dữ liệu đối tác.
          </p>
          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon" style={{ background: feature.bg }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="map-section" id="map">
        <div className="container">
          <div className="map-header">
            <div>
              <p className="section-label">Bản đồ tương tác</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Quán ngon trên bản đồ
              </h2>
            </div>
            <div className="map-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-chip ${activeCategory === category ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <ShopMap
            shops={filteredShops}
            centerLat={20.8449}
            centerLng={106.6881}
            zoom={12}
            height={480}
            onShopClick={setSelectedShop}
          />

          {selectedShop && (
            <div
              style={{
                marginTop: 20,
                background: "var(--color-surface)",
                border: "1px solid rgba(255,107,53,0.3)",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 40 }}>{shopIcon(selectedShop.category?.name_vi)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {selectedShop.name}
                  {selectedShop.is_local_pick && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        background: "rgba(255,107,53,0.15)",
                        color: "#FF6B35",
                        padding: "2px 10px",
                        borderRadius: 99,
                        fontWeight: 600,
                      }}
                    >
                      Local Pick
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {selectedShop.address} · ★ {selectedShop.rating_avg}
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 99,
                  background:
                    selectedShop.status === "open"
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color: selectedShop.status === "open" ? "#10B981" : "#EF4444",
                }}
              >
                {statusLabel(selectedShop.status)}
              </span>
              <button
                aria-label="Đóng chi tiết quán"
                onClick={() => setSelectedShop(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                type="button"
              >
                ×
              </button>
            </div>
          )}

          <div className="shop-grid">
            {filteredShops.map((shop) => (
              <button
                key={shop.id}
                className="shop-card"
                onClick={() => setSelectedShop(shop)}
                type="button"
              >
                <div className="shop-card-img">{shopIcon(shop.category?.name_vi)}</div>
                <div className="shop-card-body">
                  <div className="shop-card-header">
                    <span className="shop-card-name">{shop.name}</span>
                    <span className="shop-card-rating">★ {shop.rating_avg}</span>
                  </div>
                  <p className="shop-card-addr">{shop.address}</p>
                  <div className="shop-card-footer">
                    <span className={`chip ${shop.status === "open" ? "chip-open" : "chip-closed"}`}>
                      {statusLabel(shop.status)}
                    </span>
                    {shop.is_local_pick && <span className="chip chip-local">Local Pick</span>}
                    <span className="chip chip-budget">{shop.category?.name_vi}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="lang-section" id="about">
        <div className="container">
          <p className="section-label">Lộ trình triển khai</p>
          <h2 className="section-title">Landing page, app mobile và trang quản trị</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Giai đoạn tiếp theo sẽ tách landing page cho khách du lịch, app Expo cho người dùng và
            admin dashboard cho chủ quán/đội ngũ vận hành.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 48,
            }}
          >
            {["Next.js", "Expo", "Supabase", "Turborepo", "Vercel", "EAS"].map((tech) => (
              <span
                key={tech}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 99,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>
            © 2026 <strong>Long Vong HP</strong> - Built for Hai Phong travel, food and local
            commerce.
          </p>
        </div>
      </footer>
    </>
  );
}
