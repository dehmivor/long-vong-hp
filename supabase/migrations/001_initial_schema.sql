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
