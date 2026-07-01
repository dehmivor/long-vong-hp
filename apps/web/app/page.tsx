"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
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
        Dang tai ban do...
      </div>
    ),
  }
);

const MOCK_SHOPS: MapShop[] = [
  {
    id: "1",
    name: "Banh da cua Ba Cu",
    latitude: 20.8449,
    longitude: 106.6881,
    address: "12 Dinh Tien Hoang, Hong Bang",
    category: { name_vi: "Dac san HP", color: "#FF6B35" },
    rating_avg: 4.8,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "2",
    name: "Nem cua be Co Lan",
    latitude: 20.8521,
    longitude: 106.6943,
    address: "45 Lach Tray, Ngo Quyen",
    category: { name_vi: "Dac san HP", color: "#EF4444" },
    rating_avg: 4.6,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "3",
    name: "Bun tom Hai Phong co dien",
    latitude: 20.839,
    longitude: 106.682,
    address: "89 Cau Dat, Ngo Quyen",
    category: { name_vi: "Bun va mien", color: "#10B981" },
    rating_avg: 4.5,
    status: "open",
    is_local_pick: false,
  },
  {
    id: "4",
    name: "Hai san Do Son",
    latitude: 20.728,
    longitude: 106.764,
    address: "Khu 1, Do Son, Hai Phong",
    category: { name_vi: "Hai san", color: "#0099CC" },
    rating_avg: 4.7,
    status: "open",
    is_local_pick: true,
  },
  {
    id: "5",
    name: "Banh mi que Phuong Do",
    latitude: 20.846,
    longitude: 106.701,
    address: "78 Le Loi, Le Chan",
    category: { name_vi: "Banh mi", color: "#F59E0B" },
    rating_avg: 4.3,
    status: "sold_out",
    is_local_pick: false,
  },
  {
    id: "6",
    name: "Cafe Hoang Dieu Vintage",
    latitude: 20.8502,
    longitude: 106.6855,
    address: "3 Hoang Dieu, Hong Bang",
    category: { name_vi: "Ca phe", color: "#A0522D" },
    rating_avg: 4.4,
    status: "open",
    is_local_pick: false,
  },
];

const CATEGORIES = ["Tat ca", "Dac san HP", "Hai san", "Bun va mien", "Ca phe", "Banh mi"];

const FEATURES = [
  {
    icon: "🎬",
    title: "Food Reels",
    desc: "Video ngan giup du khach nhin mon an, khong gian va cach di truoc khi den quan.",
    bg: "rgba(255,107,53,0.12)",
  },
  {
    icon: "📍",
    title: "Local Choice Map",
    desc: "Ban do cac quan duoc tuyen chon boi nguoi ban dia, co trang thai mo cua va local pick.",
    bg: "rgba(0,153,204,0.12)",
  },
  {
    icon: "🏆",
    title: "Quest & Check-in",
    desc: "Quet QR tai quan, tich diem, suu tap huy hieu va doi voucher tu doi tac dia phuong.",
    bg: "rgba(255,210,63,0.12)",
  },
  {
    icon: "🌏",
    title: "Viet - Anh - Han",
    desc: "San sang cho khach du lich, chuyen gia va cong dong quoc te dang song tai Hai Phong.",
    bg: "rgba(16,185,129,0.12)",
  },
];

function statusLabel(status: MapShop["status"]) {
  if (status === "open") return "Dang mo";
  if (status === "sold_out") return "Het mon";
  return "Da dong";
}

function shopIcon(category?: string) {
  if (category === "Hai san") return "🦐";
  if (category === "Ca phe") return "☕";
  if (category === "Banh mi") return "🥖";
  return "🍜";
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Tat ca");
  const [selectedShop, setSelectedShop] = useState<MapShop | null>(null);

  const filteredShops = useMemo(
    () =>
      activeCategory === "Tat ca"
        ? MOCK_SHOPS
        : MOCK_SHOPS.filter((shop) => shop.category?.name_vi === activeCategory),
    [activeCategory]
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
              <a href="#features">Tinh nang</a>
            </li>
            <li>
              <a href="#map">Ban do</a>
            </li>
            <li>
              <a href="#about">Lo trinh</a>
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
                Kham pha Hai Phong
                <br />
                <span className="highlight">chuan ban dia</span>
              </h1>
              <p className="hero-subtitle">
                Long Vong HP la combo san pham du lich gom landing page, app mobile va trang quan
                tri. MVP tap trung vao ban do quan ngon, food reels, check-in quest va du lieu minh
                bach cho doi tac dia phuong.
              </p>
              <div className="hero-actions">
                <a href="#map" className="btn-primary">
                  Xem ban do demo
                </a>
                <a href="#features" className="btn-ghost">
                  Xem tinh nang
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">3</span>
                  <span className="stat-label">San pham</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">6</span>
                  <span className="stat-label">Quan demo</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">VI/EN/KO</span>
                  <span className="stat-label">Da ngon ngu</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                    Hai Phong today
                  </div>
                  {MOCK_SHOPS.slice(0, 3).map((shop) => (
                    <div key={shop.id} className="shop-card-mini">
                      <div className="shop-img-mini">{shopIcon(shop.category?.name_vi)}</div>
                      <div className="shop-info-mini">
                        <h4>{shop.name}</h4>
                        <p>
                          Star {shop.rating_avg} - {shop.address.split(",")[1]?.trim()}
                        </p>
                        {shop.is_local_pick && <span className="local-badge">Local Pick</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-card float-card-1">
                <p>Quest moi</p>
                <small>Ngu dai mon ngon HP</small>
              </div>
              <div className="float-card float-card-2">
                <p>Check-in thanh cong</p>
                <small>+10 diem thuong</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <p className="section-label">Tinh nang cot loi</p>
          <h2 className="section-title">Mot nen tang cho du lich va am thuc Hai Phong</h2>
          <p className="section-subtitle">
            MVP uu tien nhung luong co gia tri ro: tim quan, xem noi dung ngan, check-in va quan
            tri du lieu doi tac.
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
              <p className="section-label">Ban do tuong tac</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Quan ngon tren ban do
              </h2>
            </div>
            <div className="map-filters">
              {CATEGORIES.map((category) => (
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
                  {selectedShop.address} - Star {selectedShop.rating_avg}
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
                aria-label="Dong chi tiet quan"
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
                x
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
                    <span className="shop-card-rating">Star {shop.rating_avg}</span>
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
          <p className="section-label">Lo trinh trien khai</p>
          <h2 className="section-title">Landing page, app mobile va trang quan tri</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Giai doan tiep theo se tach landing page cho khach du lich, app Expo cho nguoi dung va
            admin dashboard cho chu quan/doi ngu van hanh.
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
