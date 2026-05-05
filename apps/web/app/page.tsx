"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MapShop } from "@repo/ui/shop-map";

// Dynamically import map (no SSR — Leaflet requires browser APIs)
const ShopMap = dynamic(
  () => import("@repo/ui/shop-map").then((m) => m.ShopMap),
  { ssr: false, loading: () => <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface)", borderRadius: 16, color: "var(--color-text-muted)" }}>🗺️ Đang tải bản đồ...</div> }
);

// ---- Mock data: các quán đặc sản Hải Phòng ----
const MOCK_SHOPS: MapShop[] = [
  {
    id: "1",
    name: "Bánh Đa Cua Bà Cụ",
    latitude: 20.8449,
    longitude: 106.6881,
    address: "12 Đinh Tiên Hoàng, Hồng Bàng",
    category: { name_vi: "Đặc sản HP", color: "#FF6B35" },
    rating_avg: 4.8,
    status: "open",
    is_local_pick: true,
    image_url: undefined,
  },
  {
    id: "2",
    name: "Nem Cua Bể Cô Lan",
    latitude: 20.8521,
    longitude: 106.6943,
    address: "45 Lạch Tray, Ngô Quyền",
    category: { name_vi: "Đặc sản HP", color: "#EF4444" },
    rating_avg: 4.6,
    status: "open",
    is_local_pick: true,
    image_url: undefined,
  },
  {
    id: "3",
    name: "Bún Tôm Hải Phòng Cổ Điển",
    latitude: 20.8390,
    longitude: 106.6820,
    address: "89 Cầu Đất, Ngô Quyền",
    category: { name_vi: "Bánh mì & Bún", color: "#10B981" },
    rating_avg: 4.5,
    status: "open",
    is_local_pick: false,
    image_url: undefined,
  },
  {
    id: "4",
    name: "Hải Sản Tươi Sống Đồ Sơn",
    latitude: 20.7280,
    longitude: 106.7640,
    address: "Khu 1, Đồ Sơn, Hải Phòng",
    category: { name_vi: "Hải sản", color: "#0099CC" },
    rating_avg: 4.7,
    status: "open",
    is_local_pick: true,
    image_url: undefined,
  },
  {
    id: "5",
    name: "Bánh Mì Que Phượng Đỏ",
    latitude: 20.8460,
    longitude: 106.7010,
    address: "78 Lê Lợi, Lê Chân",
    category: { name_vi: "Bánh mì & Bún", color: "#F59E0B" },
    rating_avg: 4.3,
    status: "sold_out",
    is_local_pick: false,
    image_url: undefined,
  },
  {
    id: "6",
    name: "Café Hoàng Diệu Vintage",
    latitude: 20.8502,
    longitude: 106.6855,
    address: "3 Hoàng Diệu, Hồng Bàng",
    category: { name_vi: "Cà phê", color: "#A0522D" },
    rating_avg: 4.4,
    status: "open",
    is_local_pick: false,
    image_url: undefined,
  },
];

const CATEGORIES = ["Tất cả", "Đặc sản HP", "Hải sản", "Bún & Bún", "Cà phê"];
const FEATURES = [
  {
    icon: "🎬",
    bg: "rgba(255,107,53,0.12)",
    title: "Food Reels",
    desc: "Khám phá món ăn qua video ngắn TikTok-style. Xem thực tế trước khi ghé thăm.",
  },
  {
    icon: "📍",
    bg: "rgba(0,153,204,0.12)",
    title: "Local Choice Map",
    desc: "Bản đồ tương tác với quán được người bản địa tuyển chọn. Không có 'bẫy khách du lịch'.",
  },
  {
    icon: "🏆",
    bg: "rgba(255,210,63,0.12)",
    title: "Quest & Check-in",
    desc: "Quét QR tại quán, sưu tập huy hiệu, đổi voucher giảm giá thực tế.",
  },
  {
    icon: "🌏",
    bg: "rgba(16,185,129,0.12)",
    title: "Đa ngôn ngữ",
    desc: "Giao diện Việt - Anh - Hàn. Phục vụ chuyên gia Korea đang làm việc tại Hải Phòng.",
  },
  {
    icon: "⚡",
    bg: "rgba(139,92,246,0.12)",
    title: "Thời gian thực",
    desc: "Trạng thái quán (đang mở, hết món, giờ đông khách) được cập nhật liên tục.",
  },
  {
    icon: "🔒",
    bg: "rgba(244,114,182,0.12)",
    title: "Bảo mật & Tin cậy",
    desc: "Đăng nhập Google / Kakao / Apple. Dữ liệu được bảo vệ bởi Supabase RLS.",
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedShop, setSelectedShop] = useState<MapShop | null>(null);

  const filteredShops =
    activeCategory === "Tất cả"
      ? MOCK_SHOPS
      : MOCK_SHOPS.filter((s) => s.category?.name_vi === activeCategory);

  return (
    <>
      {/* ===== NAV ===== */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">
            Lòng Vòng <span>HP</span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Tính năng</a></li>
            <li><a href="#map">Bản đồ</a></li>
            <li><a href="#about">Về chúng tôi</a></li>
          </ul>
          <button className="nav-cta">Tải app ngay</button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">
                🌟 &nbsp; Made for Hai Phong locals &amp; travelers
              </div>
              <h1 className="hero-title">
                Khám phá Hải Phòng<br />
                <span className="highlight">chuẩn bản địa</span>
              </h1>
              <p className="hero-subtitle">
                Ứng dụng dẫn đường ẩm thực thành phố Cảng — quán ngon được
                người bản địa tuyển chọn, video thực tế, check-in đổi voucher.
                Hỗ trợ Việt · English · 한국어.
              </p>
              <div className="hero-actions">
                <a href="#map" className="btn-primary">
                  🗺️ Xem bản đồ
                </a>
                <a href="#features" className="btn-ghost">
                  Tìm hiểu thêm →
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">200+</span>
                  <span className="stat-label">Quán được duyệt</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">14</span>
                  <span className="stat-label">Quận / Huyện</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Ngôn ngữ</span>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                    📍 Hồng Bàng, Hải Phòng
                  </div>
                  {MOCK_SHOPS.slice(0, 3).map((shop) => (
                    <div key={shop.id} className="shop-card-mini">
                      <div className="shop-img-mini">
                        {shop.category?.name_vi === "Hải sản" ? "🦐"
                          : shop.category?.name_vi === "Cà phê" ? "☕"
                          : shop.category?.name_vi === "Đặc sản HP" ? "🍜"
                          : "🥖"}
                      </div>
                      <div className="shop-info-mini">
                        <h4>{shop.name}</h4>
                        <p>⭐ {shop.rating_avg} · {shop.address.split(",")[1]?.trim()}</p>
                        {shop.is_local_pick && (
                          <span className="local-badge">Local Pick</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div className="float-card float-card-1">
                <p>🏆 Quest mới!</p>
                <small>Ngũ đại món ngon HP</small>
              </div>
              <div className="float-card float-card-2">
                <p>✅ Check-in thành công</p>
                <small>+10 điểm thưởng</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section" id="features">
        <div className="container">
          <p className="section-label">Tính năng nổi bật</p>
          <h2 className="section-title">
            Mọi thứ bạn cần để<br />khám phá Hải Phòng
          </h2>
          <p className="section-subtitle">
            Được xây dựng dành riêng cho thành phố Cảng — không phải app
            generic, không có quán "bẫy" khách du lịch.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <ShopMap
            shops={filteredShops}
            centerLat={20.8449}
            centerLng={106.6881}
            zoom={12}
            height={480}
            onShopClick={setSelectedShop}
          />

          {/* Selected shop detail */}
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
              <div style={{ fontSize: 40 }}>
                {selectedShop.category?.name_vi === "Hải sản" ? "🦐"
                  : selectedShop.category?.name_vi === "Cà phê" ? "☕"
                  : selectedShop.category?.name_vi === "Đặc sản HP" ? "🍜"
                  : "🥖"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {selectedShop.name}
                  {selectedShop.is_local_pick && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: "rgba(255,107,53,0.15)", color: "#FF6B35", padding: "2px 10px", borderRadius: 99, fontWeight: 600 }}>
                      Local Pick ⭐
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  📍 {selectedShop.address} &nbsp;·&nbsp; ⭐ {selectedShop.rating_avg}
                </div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99,
                background: selectedShop.status === "open" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: selectedShop.status === "open" ? "#10B981" : "#EF4444",
              }}>
                {selectedShop.status === "open" ? "🟢 Đang mở" : selectedShop.status === "sold_out" ? "🔴 Hết món" : "⚪ Đã đóng"}
              </span>
              <button
                onClick={() => setSelectedShop(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: 20 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Shop grid */}
          <div className="shop-grid">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="shop-card"
                onClick={() => setSelectedShop(shop)}
                role="button"
                tabIndex={0}
              >
                <div className="shop-card-img">
                  {shop.category?.name_vi === "Hải sản" ? "🦐"
                    : shop.category?.name_vi === "Cà phê" ? "☕"
                    : shop.category?.name_vi === "Đặc sản HP" ? "🍜"
                    : "🥖"}
                </div>
                <div className="shop-card-body">
                  <div className="shop-card-header">
                    <span className="shop-card-name">{shop.name}</span>
                    <span className="shop-card-rating">⭐ {shop.rating_avg}</span>
                  </div>
                  <p className="shop-card-addr">📍 {shop.address}</p>
                  <div className="shop-card-footer">
                    <span className={`chip ${shop.status === "open" ? "chip-open" : shop.status === "sold_out" ? "chip-closed" : "chip-closed"}`}>
                      {shop.status === "open" ? "Đang mở" : shop.status === "sold_out" ? "Hết món" : "Đã đóng"}
                    </span>
                    {shop.is_local_pick && <span className="chip chip-local">Local Pick</span>}
                    <span className="chip chip-budget">{shop.category?.name_vi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LANGUAGE SECTION ===== */}
      <section className="lang-section" id="about">
        <div className="container">
          <p className="section-label">Đa ngôn ngữ</p>
          <h2 className="section-title">Dành cho mọi du khách</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Hải Phòng đón tiếp hàng nghìn chuyên gia Hàn Quốc mỗi năm. Ứng
            dụng hỗ trợ đầy đủ 3 ngôn ngữ để không ai cảm thấy lạc lõng.
          </p>
          <div className="lang-flags">
            {[
              { flag: "🇻🇳", label: "Tiếng Việt" },
              { flag: "🇺🇸", label: "English" },
              { flag: "🇰🇷", label: "한국어" },
            ].map((l) => (
              <div key={l.label} className="lang-item">
                <div className="lang-flag">{l.flag}</div>
                <span className="lang-label">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Tech stack badges */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 48 }}>
            {["React Native", "Next.js", "Supabase", "Turborepo", "TypeScript", "PostGIS", "Leaflet"].map((tech) => (
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

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <p>
            © 2026 <strong>Lòng Vòng HP</strong> · Được xây dựng với ❤️ bởi{" "}
            <strong>Tâm Nguyễn</strong> tại Hải Phòng
          </p>
          <p style={{ marginTop: 8 }}>
            Minh bạch · Bản địa · Hiện đại
          </p>
        </div>
      </footer>
    </>
  );
}
