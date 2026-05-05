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
