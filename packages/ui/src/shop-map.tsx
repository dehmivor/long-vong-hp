"use client";

import { useEffect, useRef } from "react";

// ---- Types ----
export interface MapShop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  category?: { name_vi: string; color: string };
  rating_avg: number;
  status: "open" | "closed" | "sold_out" | "temporarily_closed";
  is_local_pick: boolean;
  image_url?: string;
}

export interface ShopMapProps {
  shops?: MapShop[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string | number;
  className?: string;
  onShopClick?: (shop: MapShop) => void;
}

// Status colors
const STATUS_COLOR: Record<string, string> = {
  open: "#10B981",
  closed: "#6B7280",
  sold_out: "#EF4444",
  temporarily_closed: "#F59E0B",
};

// Build a custom Leaflet divIcon marker
function buildMarkerHtml(shop: MapShop): string {
  const color = shop.is_local_pick
    ? "#FF6B35"
    : (shop.category?.color ?? "#6B7280");
  const statusColor = STATUS_COLOR[shop.status] ?? "#6B7280";

  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="
        background:${color};
        color:#fff;
        border-radius:12px 12px 12px 0;
        padding:6px 10px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        max-width:120px;
        overflow:hidden;
        text-overflow:ellipsis;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        border:2px solid #fff;
        transform:rotate(-0deg);
        cursor:pointer;
      ">
        ${shop.is_local_pick ? "📍 " : ""}${shop.name}
      </div>
      <div style="
        width:10px;height:10px;
        background:${statusColor};
        border:2px solid #fff;
        border-radius:50%;
        margin-top:3px;
        box-shadow:0 2px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;
}

// Popup HTML content
function buildPopupHtml(shop: MapShop): string {
  const statusLabel: Record<string, string> = {
    open: "🟢 Đang mở",
    closed: "🔴 Đã đóng",
    sold_out: "🔴 Hết món",
    temporarily_closed: "🟡 Tạm đóng",
  };

  const stars = "★".repeat(Math.round(shop.rating_avg)) + "☆".repeat(5 - Math.round(shop.rating_avg));

  return `
    <div style="min-width:200px;font-family:'Inter',sans-serif;">
      ${shop.image_url
        ? `<img src="${shop.image_url}" alt="${shop.name}"
            style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
        : ""}
      <div style="font-weight:700;font-size:14px;color:#1F2937;margin-bottom:4px;">${shop.name}</div>
      <div style="font-size:12px;color:#6B7280;margin-bottom:4px;">📍 ${shop.address}</div>
      <div style="font-size:12px;color:#F59E0B;margin-bottom:4px;">${stars} (${shop.rating_avg.toFixed(1)})</div>
      <div style="font-size:12px;margin-bottom:4px;">${statusLabel[shop.status] ?? shop.status}</div>
      ${shop.is_local_pick
        ? `<div style="font-size:11px;background:#FFF7ED;color:#FF6B35;padding:2px 8px;border-radius:99px;display:inline-block;font-weight:600;">Local Pick ⭐</div>`
        : ""}
    </div>
  `;
}

// ---- ShopMap Component ----
export function ShopMap({
  shops = [],
  centerLat = 20.8449,  // Hai Phong city center
  centerLng = 106.6881,
  zoom = 13,
  height = 480,
  className = "",
  onShopClick,
}: ShopMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const markersRef = useRef<ReturnType<typeof import("leaflet")["marker"]>[]>([]);

  // Initialise Leaflet map (client-side only)
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Dynamically import leaflet (avoids SSR issues in Next.js)
    import("leaflet").then((L) => {
      // Fix default marker icon path
      // @ts-expect-error Leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        // Update view if already initialised
        mapRef.current.setView([centerLat, centerLng], zoom);
        return;
      }

      // Create map
      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // Tile layer — OpenStreetMap (no API key needed)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Lòng Vòng HP',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers when shops change
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    import("leaflet").then((L) => {
      const map = mapRef.current!;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add new markers
      shops.forEach((shop) => {
        const icon = L.divIcon({
          html: buildMarkerHtml(shop),
          className: "",
          iconAnchor: [0, 0],
          popupAnchor: [60, -10],
        });

        const marker = L.marker([shop.latitude, shop.longitude], { icon })
          .addTo(map)
          .bindPopup(buildPopupHtml(shop), { maxWidth: 240 });

        if (onShopClick) {
          marker.on("click", () => onShopClick(shop));
        }

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (shops.length > 0) {
        const bounds = L.latLngBounds(shops.map((s) => [s.latitude, s.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });
  }, [shops, onShopClick]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: heightStyle,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {/* Leaflet CSS — injected inline via link */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { background: #e8f4f8; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          border: none !important;
        }
        .leaflet-popup-tip { background: #fff !important; }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          font-size: 16px !important;
        }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
