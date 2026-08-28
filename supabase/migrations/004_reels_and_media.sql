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
