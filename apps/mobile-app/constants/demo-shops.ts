// ============================================================
// Demo shops — offline fallback for the map when Supabase is
// not configured or unreachable. Coordinates mirror the seed
// data in supabase/migrations/003_seed_haiphong_content.sql.
// ============================================================

export type MapShopStatus = 'open' | 'closed' | 'sold_out' | 'temporarily_closed';

export interface MapShop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating_avg: number;
  status: MapShopStatus;
  is_local_pick: boolean;
  category?: string;
}

// Default camera framing the Hai Phong city centre.
export const HAI_PHONG_REGION = {
  latitude: 20.8449,
  longitude: 106.6881,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export const DEMO_SHOPS: MapShop[] = [
  {
    id: 'demo-banh-da-cua-ba-cu',
    name: 'Banh da cua Ba Cu',
    address: '12 Dinh Tien Hoang, Hong Bang',
    latitude: 20.862236,
    longitude: 106.683456,
    rating_avg: 4.8,
    status: 'open',
    is_local_pick: true,
    category: 'Dac san HP',
  },
  {
    id: 'demo-nem-cua-be-co-lan',
    name: 'Nem cua be Co Lan',
    address: '45 Lach Tray, Ngo Quyen',
    latitude: 20.8468,
    longitude: 106.69934,
    rating_avg: 4.6,
    status: 'open',
    is_local_pick: true,
    category: 'Dac san HP',
  },
  {
    id: 'demo-banh-mi-que-phuong-do',
    name: 'Banh mi que Phuong Do',
    address: '78 Le Loi, Le Chan',
    latitude: 20.847132,
    longitude: 106.685979,
    rating_avg: 4.3,
    status: 'sold_out',
    is_local_pick: false,
    category: 'Banh mi & Bun',
  },
  {
    id: 'demo-bun-tom-cau-dat',
    name: 'Bun tom Cau Dat',
    address: '89 Cau Dat, Ngo Quyen',
    latitude: 20.854018,
    longitude: 106.68325,
    rating_avg: 4.5,
    status: 'open',
    is_local_pick: false,
    category: 'Banh mi & Bun',
  },
  {
    id: 'demo-hai-san-do-son-local',
    name: 'Hai san Do Son Local',
    address: 'Khu 1, Do Son',
    latitude: 20.719341,
    longitude: 106.774843,
    rating_avg: 4.7,
    status: 'open',
    is_local_pick: true,
    category: 'Hai san',
  },
  {
    id: 'demo-cafe-hoang-dieu-vintage',
    name: 'Cafe Hoang Dieu Vintage',
    address: '3 Hoang Dieu, Hong Bang',
    latitude: 20.861079,
    longitude: 106.678281,
    rating_avg: 4.4,
    status: 'open',
    is_local_pick: false,
    category: 'Ca phe',
  },
];
