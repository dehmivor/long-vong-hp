import type { Reel } from '@repo/types';

// ============================================================
// Demo reels - offline fallback for the Reels tab when Supabase
// is not configured or the `reels` table has not been seeded.
// Mirrors supabase/migrations/004_reels_and_media.sql.
//
// The URLs are public HLS test streams so the vertical pager is
// genuinely playable before real Hai Phong footage is uploaded.
// ============================================================

const EPOCH = new Date(0).toISOString();

export const DEMO_REELS: Reel[] = [
  {
    id: 'demo-reel-banh-da-cua',
    title_vi: 'Bánh đa cua nóng hổi',
    title_en: 'Hot Hai Phong crab noodles',
    title_ko: '따끈한 하이퐁 게 국수',
    caption_vi: 'Nước dùng cua đồng, chả lá lốt và rau muống chần.',
    caption_en: 'Field-crab broth, betel-leaf pork rolls and blanched greens.',
    caption_ko: '민물게 육수와 향긋한 현지 토핑.',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration_sec: 18,
    view_count: 1240,
    like_count: 318,
    sort_order: 1,
    is_published: true,
    created_at: EPOCH,
    updated_at: EPOCH,
    shop: {
      id: 'seed-banh-da-cua-ba-cu',
      name: 'Banh da cua Ba Cu',
      address: '12 Dinh Tien Hoang, Hong Bang, Hai Phong',
      district: 'hong_bang',
      rating_avg: 4.8,
      is_local_pick: true,
    },
  },
  {
    id: 'demo-reel-nem-cua-be',
    title_vi: 'Nem cua bể giòn rụm',
    title_en: 'Crispy square crab rolls',
    title_ko: '바삭한 사각 게살 만두',
    caption_vi: 'Vỏ nem vuông giòn tan, nhân cua bể đầy đặn.',
    caption_en: 'Shatteringly crisp square rolls packed with sea crab.',
    caption_ko: '게살이 가득한 바삭한 사각 롤.',
    video_url: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    duration_sec: 15,
    view_count: 986,
    like_count: 241,
    sort_order: 2,
    is_published: true,
    created_at: EPOCH,
    updated_at: EPOCH,
    shop: {
      id: 'seed-nem-cua-be-co-lan',
      name: 'Nem cua be Co Lan',
      address: '45 Lach Tray, Ngo Quyen, Hai Phong',
      district: 'ngo_quyen',
      rating_avg: 4.6,
      is_local_pick: true,
    },
  },
  {
    id: 'demo-reel-cafe-pho-cu',
    title_vi: 'Cà phê phố cũ',
    title_en: 'Old-quarter coffee',
    title_ko: '올드타운 커피',
    caption_vi: 'Góc chill sau một vòng food tour Hải Phòng.',
    caption_en: 'A quiet stop after a Hai Phong food walk.',
    caption_ko: '푸드 투어 후 들르기 좋은 조용한 카페.',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration_sec: 12,
    view_count: 634,
    like_count: 155,
    sort_order: 3,
    is_published: true,
    created_at: EPOCH,
    updated_at: EPOCH,
    shop: {
      id: 'seed-cafe-hoang-dieu-vintage',
      name: 'Cafe Hoang Dieu Vintage',
      address: '3 Hoang Dieu, Hong Bang, Hai Phong',
      district: 'hong_bang',
      rating_avg: 4.4,
      is_local_pick: false,
    },
  },
];
