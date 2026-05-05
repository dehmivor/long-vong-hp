// ============================================================
// @repo/types — Lòng Vòng HP Shared Type Definitions
// ============================================================

// ---- Auth ----
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language: "vi" | "en" | "ko";
  created_at: string;
  updated_at: string;
}

// ---- Categories ----
export interface Category {
  id: string;
  name_vi: string;
  name_en: string;
  name_ko: string;
  slug: string;
  icon_url?: string;
  color: string;
  created_at: string;
}

// ---- Shops ----
export interface Shop {
  id: string;
  name: string;
  description_vi?: string;
  description_en?: string;
  description_ko?: string;
  address: string;
  district: HaiphongDistrict;
  latitude: number;
  longitude: number;
  phone?: string;
  image_url?: string;
  images: string[];
  video_url?: string;
  category_id: string;
  category?: Category;
  price_range: PriceRange;
  status: ShopStatus;
  is_verified: boolean;
  is_local_pick: boolean;
  rating_avg: number;
  rating_count: number;
  checkin_count: number;
  open_time?: string;   // e.g. "07:00"
  close_time?: string;  // e.g. "22:00"
  busy_hours?: string[]; // e.g. ["12:00-13:00", "18:00-20:00"]
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export type ShopStatus = "open" | "closed" | "sold_out" | "temporarily_closed";
export type PriceRange = "budget" | "mid" | "premium";
export type HaiphongDistrict =
  | "hong_bang"
  | "le_chan"
  | "ngo_quyen"
  | "kien_an"
  | "hai_an"
  | "do_son"
  | "duong_kinh"
  | "thuy_nguyen"
  | "an_duong"
  | "an_lao"
  | "tien_lang"
  | "vinh_bao"
  | "cat_hai"
  | "bach_long_vi";

// ---- Reviews ----
export interface Review {
  id: string;
  shop_id: string;
  user_id: string;
  user?: Pick<User, "id" | "full_name" | "avatar_url">;
  rating: number; // 1-5
  content?: string;
  images: string[];
  is_verified_visit: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ---- Quests / Gamification ----
export interface Quest {
  id: string;
  name_vi: string;
  name_en: string;
  name_ko: string;
  description_vi: string;
  description_en: string;
  description_ko: string;
  badge_url: string;
  required_shop_ids: string[];
  voucher_code?: string;
  voucher_discount_pct?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserCheckin {
  id: string;
  user_id: string;
  shop_id: string;
  shop?: Pick<Shop, "id" | "name" | "image_url">;
  quest_id?: string;
  checked_in_at: string;
  points_earned: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  quest_id: string;
  quest?: Quest;
  earned_at: string;
  voucher_used: boolean;
}

// ---- API Responses ----
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ---- Filters ----
export interface ShopFilter {
  district?: HaiphongDistrict;
  category_id?: string;
  price_range?: PriceRange;
  status?: ShopStatus;
  is_local_pick?: boolean;
  is_verified?: boolean;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
  per_page?: number;
}
