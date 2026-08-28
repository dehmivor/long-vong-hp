-- ============================================================
-- Long Vong HP — run this ONCE in Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)
-- Combines migrations 001 + 002 + 003 + 004 in order.
-- ============================================================

-- ===== 001_initial_schema.sql =====
-- ============================================================
-- Lòng Vòng HP — Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";      -- for geo-queries (nearby shops)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- for fuzzy text search

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE shop_status AS ENUM ('open', 'closed', 'sold_out', 'temporarily_closed');
CREATE TYPE price_range  AS ENUM ('budget', 'mid', 'premium');
CREATE TYPE language_pref AS ENUM ('vi', 'en', 'ko');

CREATE TYPE haiphong_district AS ENUM (
  'hong_bang', 'le_chan', 'ngo_quyen', 'kien_an',
  'hai_an', 'do_son', 'duong_kinh', 'thuy_nguyen',
  'an_duong', 'an_lao', 'tien_lang', 'vinh_bao',
  'cat_hai', 'bach_long_vi'
);

-- ============================================================
-- TABLE: users  (mirrors auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT        NOT NULL UNIQUE,
  full_name         TEXT,
  avatar_url        TEXT,
  preferred_language language_pref NOT NULL DEFAULT 'vi',
  total_points      INT         NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::language_pref, 'vi')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_vi     TEXT        NOT NULL,
  name_en     TEXT        NOT NULL,
  name_ko     TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  icon_url    TEXT,
  color       TEXT        NOT NULL DEFAULT '#FF6B35',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories for Hai Phong
INSERT INTO public.categories (name_vi, name_en, name_ko, slug, color) VALUES
  ('Bánh mì & Bún',     'Bánh mì & Noodles',  '바인미 & 국수',   'banh-mi-bun',       '#FF6B35'),
  ('Hải sản',           'Seafood',            '해산물',          'hai-san',           '#0099CC'),
  ('Quán nhậu',         'Beer & Snacks',      '맥주 & 안주',     'quan-nhau',         '#8B5CF6'),
  ('Cà phê',            'Coffee',             '커피',            'ca-phe',            '#A0522D'),
  ('Kem & Tráng miệng', 'Desserts',           '디저트',          'kem-trang-mieng',   '#F472B6'),
  ('Cơm & Phở',         'Rice & Pho',         '밥 & 쌀국수',     'com-pho',           '#10B981'),
  ('Bánh cuốn & Bánh',  'Local Pastries',     '로컬 과자류',     'banh-cuon',         '#F59E0B'),
  ('Đặc sản HP',        'HP Specialties',     'HP 특산품',       'dac-san-hp',        '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TABLE: shops
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT              NOT NULL,
  description_vi  TEXT,
  description_en  TEXT,
  description_ko  TEXT,
  address         TEXT              NOT NULL,
  district        haiphong_district NOT NULL,
  latitude        DOUBLE PRECISION  NOT NULL,
  longitude       DOUBLE PRECISION  NOT NULL,
  geom            GEOMETRY(Point, 4326),  -- PostGIS geometry
  phone           TEXT,
  image_url       TEXT,
  images          TEXT[]            NOT NULL DEFAULT '{}',
  video_url       TEXT,
  category_id     UUID              NOT NULL REFERENCES public.categories(id),
  price_range     price_range       NOT NULL DEFAULT 'budget',
  status          shop_status       NOT NULL DEFAULT 'open',
  is_verified     BOOLEAN           NOT NULL DEFAULT FALSE,
  is_local_pick   BOOLEAN           NOT NULL DEFAULT FALSE,
  rating_avg      NUMERIC(3,2)      NOT NULL DEFAULT 0.00,
  rating_count    INT               NOT NULL DEFAULT 0,
  checkin_count   INT               NOT NULL DEFAULT 0,
  open_time       TIME,
  close_time      TIME,
  busy_hours      TEXT[]            DEFAULT '{}',
  owner_id        UUID              REFERENCES public.users(id),
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Auto-populate PostGIS geometry from lat/lng
CREATE OR REPLACE FUNCTION public.set_shop_geom()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$;

CREATE TRIGGER shops_set_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.set_shop_geom();

CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Full-text search index
CREATE INDEX shops_name_trgm_idx ON public.shops USING GIN (name gin_trgm_ops);
CREATE INDEX shops_geom_idx      ON public.shops USING GIST (geom);
CREATE INDEX shops_district_idx  ON public.shops (district);
CREATE INDEX shops_category_idx  ON public.shops (category_id);
CREATE INDEX shops_local_pick_idx ON public.shops (is_local_pick) WHERE is_local_pick = TRUE;

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id            UUID        NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id            UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating             SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content            TEXT,
  images             TEXT[]      NOT NULL DEFAULT '{}',
  is_verified_visit  BOOLEAN     NOT NULL DEFAULT FALSE,
  helpful_count      INT         NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT one_review_per_user_shop UNIQUE (user_id, shop_id)
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-update shop rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.recalculate_shop_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.shops
  SET
    rating_avg   = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)), 0),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id))
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_update_shop_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_shop_rating();

CREATE INDEX reviews_shop_idx ON public.reviews (shop_id);
CREATE INDEX reviews_user_idx ON public.reviews (user_id);

-- ============================================================
-- TABLE: quests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quests (
  id                   UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_vi              TEXT    NOT NULL,
  name_en              TEXT    NOT NULL,
  name_ko              TEXT    NOT NULL,
  description_vi       TEXT    NOT NULL,
  description_en       TEXT    NOT NULL,
  description_ko       TEXT    NOT NULL,
  badge_url            TEXT    NOT NULL,
  required_shop_ids    UUID[]  NOT NULL DEFAULT '{}',
  voucher_code         TEXT,
  voucher_discount_pct INT     CHECK (voucher_discount_pct BETWEEN 0 AND 100),
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: user_checkins
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_checkins (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id        UUID        NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quest_id       UUID        REFERENCES public.quests(id),
  points_earned  INT         NOT NULL DEFAULT 10,
  checked_in_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX checkins_user_idx ON public.user_checkins (user_id);
CREATE INDEX checkins_shop_idx ON public.user_checkins (shop_id);

-- ============================================================
-- TABLE: user_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quest_id     UUID        NOT NULL REFERENCES public.quests(id),
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voucher_used BOOLEAN     NOT NULL DEFAULT FALSE,
  CONSTRAINT one_badge_per_quest UNIQUE (user_id, quest_id)
);

-- ===== 002_rls_and_functions.sql =====
-- ============================================================
-- Lòng Vòng HP — RLS Policies + Helper RPCs
-- Migration: 002_rls_and_functions.sql
-- ============================================================

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges   ENABLE ROW LEVEL SECURITY;

-- ---- USERS ----
-- Anyone can read user profiles (for reviews display)
CREATE POLICY "users_select_public"
  ON public.users FOR SELECT USING (TRUE);

-- Users can only update their OWN profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- CATEGORIES ----
-- Public read-only
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT USING (TRUE);

-- Only service_role can insert/update/delete categories
CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (auth.role() = 'service_role');

-- ---- SHOPS ----
-- Public can read all verified shops
CREATE POLICY "shops_select_public"
  ON public.shops FOR SELECT
  USING (is_verified = TRUE OR auth.uid() = owner_id);

-- Authenticated shop owners can update their own shop
CREATE POLICY "shops_owner_update"
  ON public.shops FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only service_role (admin) can insert new shops or delete
CREATE POLICY "shops_admin_insert"
  ON public.shops FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "shops_admin_delete"
  ON public.shops FOR DELETE
  USING (auth.role() = 'service_role');

-- ---- REVIEWS ----
-- Public can read all reviews
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT USING (TRUE);

-- Authenticated users can insert their own review
CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own review
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ---- QUESTS ----
-- Public read
CREATE POLICY "quests_select_public"
  ON public.quests FOR SELECT USING (TRUE);

CREATE POLICY "quests_admin_write"
  ON public.quests FOR ALL
  USING (auth.role() = 'service_role');

-- ---- USER_CHECKINS ----
-- Users can only see their own check-ins
CREATE POLICY "checkins_select_own"
  ON public.user_checkins FOR SELECT
  USING (auth.uid() = user_id);

-- RPC handles insert (see function below), so no direct insert policy needed
-- but allow via RPC (SECURITY DEFINER)

-- ---- USER_BADGES ----
CREATE POLICY "badges_select_own"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- RPC: get_nearby_shops
-- Returns shops within `radius_km` of a coordinate
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_nearby_shops(
  lat       DOUBLE PRECISION,
  lng       DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 2
)
RETURNS SETOF public.shops
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT s.*
  FROM public.shops s
  WHERE
    s.is_verified = TRUE
    AND ST_DWithin(
      s.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000  -- convert to meters
    )
  ORDER BY
    ST_Distance(
      s.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    )
  LIMIT 50;
$$;

-- ============================================================
-- RPC: checkin_at_shop
-- Validates GPS proximity (50m) and records check-in
-- Awards points + checks if quest is completed
-- ============================================================
CREATE OR REPLACE FUNCTION public.checkin_at_shop(
  p_shop_id UUID,
  p_user_id UUID,
  p_lat     DOUBLE PRECISION,
  p_lng     DOUBLE PRECISION
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_shop          public.shops;
  v_distance_m    DOUBLE PRECISION;
  v_checkin_id    UUID;
  v_points        INT := 10;
  v_today_start   TIMESTAMPTZ;
  v_already_today BOOLEAN;
BEGIN
  -- 1. Validate shop exists
  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SHOP_NOT_FOUND';
  END IF;

  -- 2. Validate GPS distance <= 50m
  v_distance_m := ST_Distance(
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    v_shop.geom::geography
  );

  IF v_distance_m > 50 THEN
    RAISE EXCEPTION 'TOO_FAR: You are %.0fm away (max 50m)', v_distance_m;
  END IF;

  -- 3. Check for duplicate check-in today
  v_today_start := DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh';
  SELECT EXISTS (
    SELECT 1 FROM public.user_checkins
    WHERE user_id = p_user_id
      AND shop_id = p_shop_id
      AND checked_in_at >= v_today_start
  ) INTO v_already_today;

  IF v_already_today THEN
    RAISE EXCEPTION 'ALREADY_CHECKED_IN_TODAY';
  END IF;

  -- 4. Record check-in
  INSERT INTO public.user_checkins (user_id, shop_id, points_earned)
  VALUES (p_user_id, p_shop_id, v_points)
  RETURNING id INTO v_checkin_id;

  -- 5. Update shop checkin_count
  UPDATE public.shops SET checkin_count = checkin_count + 1 WHERE id = p_shop_id;

  -- 6. Award points to user
  UPDATE public.users SET total_points = total_points + v_points WHERE id = p_user_id;

  -- 7. Check and award quest badges
  INSERT INTO public.user_badges (user_id, quest_id)
  SELECT p_user_id, q.id
  FROM public.quests q
  WHERE q.is_active = TRUE
    AND q.required_shop_ids <@ (
      -- All shops this user has visited
      SELECT ARRAY_AGG(DISTINCT shop_id) FROM public.user_checkins WHERE user_id = p_user_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.user_badges ub
      WHERE ub.user_id = p_user_id AND ub.quest_id = q.id
    )
  ON CONFLICT DO NOTHING;

  RETURN JSON_BUILD_OBJECT(
    'checkin_id',   v_checkin_id,
    'points_earned', v_points,
    'distance_m',   ROUND(v_distance_m::NUMERIC, 1)
  );
END;
$$;

-- ============================================================
-- RPC: increment_review_helpful
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
$$;

-- ============================================================
-- GRANT execute on RPCs to authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION public.get_nearby_shops    TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.checkin_at_shop     TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful TO authenticated;

-- ===== 003_seed_haiphong_content.sql =====
-- ============================================================
-- Long Vong HP - Starter Hai Phong Content
-- Migration: 003_seed_haiphong_content.sql
-- Purpose: local-first sample data for MVP demos and admin QA.
-- ============================================================

DO $$
DECLARE
  v_dac_san_id UUID;
  v_hai_san_id UUID;
  v_banh_mi_bun_id UUID;
  v_ca_phe_id UUID;
BEGIN
  SELECT id INTO v_dac_san_id FROM public.categories WHERE slug = 'dac-san-hp';
  SELECT id INTO v_hai_san_id FROM public.categories WHERE slug = 'hai-san';
  SELECT id INTO v_banh_mi_bun_id FROM public.categories WHERE slug = 'banh-mi-bun';
  SELECT id INTO v_ca_phe_id FROM public.categories WHERE slug = 'ca-phe';

  INSERT INTO public.shops (
    name, description_vi, description_en, description_ko,
    address, district, latitude, longitude, category_id, price_range,
    status, is_verified, is_local_pick, rating_avg, rating_count, checkin_count,
    open_time, close_time, busy_hours
  )
  SELECT
    seed.name, seed.description_vi, seed.description_en, seed.description_ko,
    seed.address, seed.district::haiphong_district, seed.latitude, seed.longitude,
    seed.category_id, seed.price_range::price_range, seed.status::shop_status,
    seed.is_verified, seed.is_local_pick, seed.rating_avg, seed.rating_count,
    seed.checkin_count, seed.open_time::time, seed.close_time::time, seed.busy_hours
  FROM (
    VALUES
      (
        'Banh da cua Ba Cu',
        'Banh da cua kieu Hai Phong voi nuoc dung cua dong, cha la lot va rau muong.',
        'Hai Phong crab noodle soup with field-crab broth, betel leaf pork rolls and greens.',
        '하이퐁식 게 국수와 향긋한 현지 토핑.',
        '12 Dinh Tien Hoang, Hong Bang, Hai Phong',
        'hong_bang', 20.862236, 106.683456, v_dac_san_id, 'budget',
        'open', TRUE, TRUE, 4.80, 128, 420, '06:00', '14:00', ARRAY['07:00-09:00', '11:00-13:00']
      ),
      (
        'Nem cua be Co Lan',
        'Nem cua be chien vuong, nhan cua be va thit day dan, an kem bun va rau song.',
        'Square fried crab spring rolls served with noodles, herbs and dipping sauce.',
        '게살을 넣은 하이퐁식 사각 튀김 만두.',
        '45 Lach Tray, Ngo Quyen, Hai Phong',
        'ngo_quyen', 20.846800, 106.699340, v_dac_san_id, 'mid',
        'open', TRUE, TRUE, 4.60, 94, 265, '09:00', '21:30', ARRAY['12:00-13:30', '18:00-20:00']
      ),
      (
        'Banh mi que Phuong Do',
        'Banh mi que cay gion, pate béo va chi chuong dac trung Hai Phong.',
        'Crunchy spicy baguette sticks with rich pate and Hai Phong chili sauce.',
        '매콤한 파테 소스를 넣은 하이퐁식 미니 바게트.',
        '78 Le Loi, Le Chan, Hai Phong',
        'le_chan', 20.847132, 106.685979, v_banh_mi_bun_id, 'budget',
        'sold_out', TRUE, FALSE, 4.30, 72, 188, '14:00', '22:00', ARRAY['16:00-18:00']
      ),
      (
        'Bun tom Cau Dat',
        'Bun tom nuoc trong, tom tuoi va rau can theo vi thanh nhe cua pho Cang.',
        'Clear shrimp noodle soup with fresh prawns and greens.',
        '새우와 채소를 넣은 맑은 국물의 하이퐁 국수.',
        '89 Cau Dat, Ngo Quyen, Hai Phong',
        'ngo_quyen', 20.854018, 106.683250, v_banh_mi_bun_id, 'budget',
        'open', TRUE, FALSE, 4.50, 61, 144, '06:30', '13:30', ARRAY['07:00-08:30']
      ),
      (
        'Hai san Do Son Local',
        'Hai san theo mua, phu hop cho nhom ban muon an gan bien Do Son.',
        'Seasonal seafood near Do Son beach for small groups.',
        '도선 해변 근처의 계절 해산물 식당.',
        'Khu 1, Do Son, Hai Phong',
        'do_son', 20.719341, 106.774843, v_hai_san_id, 'premium',
        'open', TRUE, TRUE, 4.70, 116, 309, '10:00', '22:30', ARRAY['18:00-20:30']
      ),
      (
        'Cafe Hoang Dieu Vintage',
        'Quan ca phe yen tinh gan khu trung tam, hop de nghi sau mot vong food tour.',
        'Quiet central cafe for a short break after a food walk.',
        '푸드 투어 후 쉬기 좋은 조용한 시내 카페.',
        '3 Hoang Dieu, Hong Bang, Hai Phong',
        'hong_bang', 20.861079, 106.678281, v_ca_phe_id, 'mid',
        'open', TRUE, FALSE, 4.40, 48, 96, '07:30', '23:00', ARRAY['09:00-10:30', '20:00-22:00']
      )
  ) AS seed (
    name, description_vi, description_en, description_ko, address, district,
    latitude, longitude, category_id, price_range, status, is_verified,
    is_local_pick, rating_avg, rating_count, checkin_count, open_time,
    close_time, busy_hours
  )
  WHERE seed.category_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.shops s
      WHERE s.name = seed.name AND s.address = seed.address
    );
END $$;

INSERT INTO public.quests (
  name_vi, name_en, name_ko,
  description_vi, description_en, description_ko,
  badge_url, required_shop_ids, voucher_code, voucher_discount_pct, is_active
)
SELECT
  'Ngu dai mon ngon HP',
  'Five Hai Phong Signatures',
  '하이퐁 대표 맛집 5곳',
  'Check-in 5 quan dac san de mo huy hieu va voucher doi tac.',
  'Check in at 5 signature stops to unlock a badge and partner voucher.',
  '대표 맛집 5곳에서 체크인하고 배지와 제휴 쿠폰을 받으세요.',
  '/badges/ngu-dai-mon-ngon-hp.png',
  ARRAY(
    SELECT id
    FROM public.shops
    WHERE name IN (
      'Banh da cua Ba Cu',
      'Nem cua be Co Lan',
      'Banh mi que Phuong Do',
      'Bun tom Cau Dat',
      'Hai san Do Son Local'
    )
    ORDER BY name
  ),
  'HPFOOD50',
  10,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.quests WHERE name_vi = 'Ngu dai mon ngon HP'
);

-- ===== 004_reels_and_media.sql =====
-- ============================================================
-- Lòng Vòng HP — Food Reels (HLS short-form video)
-- Migration: 004_reels_and_media.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reels (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id        UUID        REFERENCES public.shops(id) ON DELETE CASCADE,
  title_vi       TEXT        NOT NULL,
  title_en       TEXT        NOT NULL,
  title_ko       TEXT        NOT NULL,
  caption_vi     TEXT,
  caption_en     TEXT,
  caption_ko     TEXT,
  -- HLS manifest (.m3u8). MP4 is accepted too, but HLS is preferred so a weak
  -- 4G connection can drop to a lower rendition instead of stalling.
  video_url      TEXT        NOT NULL,
  thumbnail_url  TEXT,
  duration_sec   INT         NOT NULL DEFAULT 0 CHECK (duration_sec >= 0),
  view_count     INT         NOT NULL DEFAULT 0,
  like_count     INT         NOT NULL DEFAULT 0,
  sort_order     INT         NOT NULL DEFAULT 0,
  is_published   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS reels_shop_idx      ON public.reels (shop_id);
CREATE INDEX IF NOT EXISTS reels_published_idx ON public.reels (is_published, sort_order)
  WHERE is_published = TRUE;

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reels_select_published" ON public.reels;
CREATE POLICY "reels_select_published"
  ON public.reels FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "reels_admin_write" ON public.reels;
CREATE POLICY "reels_admin_write"
  ON public.reels FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- RPC: increment_reel_view
-- Anonymous viewers count too, so this is open to `anon`.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_reel_view(p_reel_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reels SET view_count = view_count + 1 WHERE id = p_reel_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_reel_view TO authenticated, anon;

-- ============================================================
-- RPC: get_quest_progress
-- Returns each active quest with the caller's completion count so the mobile
-- app can render progress bars in one round-trip instead of N queries.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_quest_progress(p_user_id UUID)
RETURNS TABLE (
  quest_id        UUID,
  required_count  INT,
  completed_count INT,
  visited_shop_ids UUID[],
  is_completed    BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH visited AS (
    SELECT DISTINCT shop_id FROM public.user_checkins WHERE user_id = p_user_id
  )
  SELECT
    q.id,
    CARDINALITY(q.required_shop_ids)::INT,
    (SELECT COUNT(*) FROM visited v WHERE v.shop_id = ANY (q.required_shop_ids))::INT,
    COALESCE(
      ARRAY(SELECT v.shop_id FROM visited v WHERE v.shop_id = ANY (q.required_shop_ids)),
      '{}'::UUID[]
    ),
    EXISTS (SELECT 1 FROM public.user_badges ub WHERE ub.user_id = p_user_id AND ub.quest_id = q.id)
  FROM public.quests q
  WHERE q.is_active = TRUE
  ORDER BY q.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_quest_progress TO authenticated;

-- ============================================================
-- Seed: sample reels wired to the seeded Hai Phong shops.
-- Uses public HLS test streams so the feed is playable before real
-- footage is uploaded to Supabase Storage.
-- ============================================================
INSERT INTO public.reels (
  shop_id, title_vi, title_en, title_ko,
  caption_vi, caption_en, caption_ko,
  video_url, duration_sec, sort_order, is_published
)
SELECT
  s.id, seed.title_vi, seed.title_en, seed.title_ko,
  seed.caption_vi, seed.caption_en, seed.caption_ko,
  seed.video_url, seed.duration_sec, seed.sort_order, TRUE
FROM (
  VALUES
    (
      'Bánh da cua Bà Cụ',
      'Bánh đa cua nóng hổi',
      'Hot Hai Phong crab noodles',
      '따끈한 하이퐁 게 국수',
      'Nước dùng cua đồng, chả lá lốt và rau muống chần.',
      'Field-crab broth, betel-leaf pork rolls and blanched greens.',
      '민물게 육수와 향긋한 현지 토핑.',
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      18, 1
    ),
    (
      'Nem cua bể Cô Lan',
      'Nem cua bể giòn rụm',
      'Crispy square crab rolls',
      '바삭한 사각 게살 만두',
      'Vỏ nem vuông giòn tan, nhân cua bể đầy đặn.',
      'Shatteringly crisp square rolls packed with sea crab.',
      '게살이 가득한 바삭한 사각 롤.',
      'https://test-streams.mux.dev/pts_shift/master.m3u8',
      15, 2
    ),
    (
      'Cafe Hoàng Diệu Vintage',
      'Cà phê phố cũ',
      'Old-quarter coffee',
      '올드타운 커피',
      'Góc chill sau một vòng food tour Hải Phòng.',
      'A quiet stop after a Hai Phong food walk.',
      '푸드 투어 후 들르기 좋은 조용한 카페.',
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      12, 3
    )
) AS seed (
  shop_name, title_vi, title_en, title_ko,
  caption_vi, caption_en, caption_ko,
  video_url, duration_sec, sort_order
)
-- Seeded shop names are stored without diacritics, so match on an unaccented key.
JOIN public.shops s
  ON LOWER(s.name) = LOWER(
       TRANSLATE(
         seed.shop_name,
         'áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
         'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
       )
     )
WHERE NOT EXISTS (
  SELECT 1 FROM public.reels r WHERE r.shop_id = s.id AND r.title_vi = seed.title_vi
);
