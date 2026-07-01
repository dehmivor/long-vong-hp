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
