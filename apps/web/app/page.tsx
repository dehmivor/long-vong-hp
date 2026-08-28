"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getShops } from "@repo/api-client";
import { useTranslation } from "@repo/i18n";
import type { MapShop } from "@repo/ui/shop-map";

import { I18nProvider, LanguageSwitcher } from "./components/i18n-provider";

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

// Sentinel for the "no category filter" chip; the label itself is translated.
const ALL_CATEGORY = "__all__";

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
  { icon: "🎬", key: "reels", bg: "rgba(255,107,53,0.12)" },
  { icon: "📍", key: "map", bg: "rgba(0,153,204,0.12)" },
  { icon: "🏆", key: "quest", bg: "rgba(255,210,63,0.12)" },
  { icon: "🌏", key: "lang", bg: "rgba(16,185,129,0.12)" },
] as const;

function statusKey(status: MapShop["status"]) {
  if (status === "open") return "shopStatus.open";
  if (status === "sold_out") return "shopStatus.sold_out";
  return "shopStatus.closed";
}

function shopIcon(category?: string) {
  if (category === "Hải sản") return "🦐";
  if (category === "Cà phê") return "☕";
  if (category === "Bánh mì") return "🥖";
  return "🍜";
}

export default function HomePage() {
  return (
    <I18nProvider>
      <LandingPage />
    </I18nProvider>
  );
}

function LandingPage() {
  const { t } = useTranslation();
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
              <a href="#features">{t("landing.nav.features")}</a>
            </li>
            <li>
              <a href="#map">{t("landing.nav.map")}</a>
            </li>
            <li>
              <a href="#about">{t("landing.nav.roadmap")}</a>
            </li>
          </ul>
          <LanguageSwitcher />
          <a className="nav-cta" href="#map">
            {t("landing.nav.demo")}
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">{t("landing.hero.badge")}</div>
              <h1 className="hero-title">
                {t("landing.hero.titleLead")}
                <br />
                <span className="highlight">{t("landing.hero.titleHighlight")}</span>
              </h1>
              <p className="hero-subtitle">{t("landing.hero.subtitle")}</p>
              <div className="hero-actions">
                <a href="#map" className="btn-primary">
                  {t("landing.hero.ctaPrimary")}
                </a>
                <a href="#features" className="btn-ghost">
                  {t("landing.hero.ctaSecondary")}
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">3</span>
                  <span className="stat-label">{t("landing.hero.statProducts")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{shops.length}</span>
                  <span className="stat-label">
                    {usingDemo ? t("landing.hero.statShopsDemo") : t("landing.hero.statShops")}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">VI/EN/KO</span>
                  <span className="stat-label">{t("landing.hero.statLanguages")}</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                    {t("landing.hero.phoneToday")}
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
                <p>{t("landing.hero.questNew")}</p>
                <small>{t("landing.hero.questName")}</small>
              </div>
              <div className="float-card float-card-2">
                <p>{t("landing.hero.checkinSuccess")}</p>
                <small>{t("landing.hero.checkinPoints")}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <p className="section-label">{t("landing.features.label")}</p>
          <h2 className="section-title">{t("landing.features.title")}</h2>
          <p className="section-subtitle">{t("landing.features.subtitle")}</p>
          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.key} className="feature-card">
                <div className="feature-icon" style={{ background: feature.bg }}>
                  {feature.icon}
                </div>
                <h3>{t(`landing.features.${feature.key}Title`)}</h3>
                <p>{t(`landing.features.${feature.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="map-section" id="map">
        <div className="container">
          <div className="map-header">
            <div>
              <p className="section-label">{t("landing.mapSection.label")}</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                {t("landing.mapSection.title")}
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
                  {category === ALL_CATEGORY ? t("landing.mapSection.allCategory") : category}
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
                      {t("map.localPick")}
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
                {t(statusKey(selectedShop.status))}
              </span>
              <button
                aria-label={t("landing.mapSection.closeDetail")}
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
                      {t(statusKey(shop.status))}
                    </span>
                    {shop.is_local_pick && (
                      <span className="chip chip-local">{t("map.localPick")}</span>
                    )}
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
          <p className="section-label">{t("landing.roadmap.label")}</p>
          <h2 className="section-title">{t("landing.roadmap.title")}</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            {t("landing.roadmap.subtitle")}
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
            © 2026 <strong>Lòng Vòng HP</strong> — {t("landing.footer")}
          </p>
        </div>
      </footer>
    </>
  );
}
