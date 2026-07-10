import { useCallback, useEffect, useState } from 'react';

import { DEMO_SHOPS, type MapShop } from '@/constants/demo-shops';

// Read env directly so we can skip the network call entirely when
// Supabase is not configured (mirrors the admin dashboard fallback).
const hasSupabase = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

interface UseShopsResult {
  shops: MapShop[];
  loading: boolean;
  usingDemo: boolean;
  error: string | null;
  reload: () => void;
}

function toMapShop(shop: any): MapShop | null {
  if (typeof shop?.latitude !== 'number' || typeof shop?.longitude !== 'number') {
    return null;
  }
  return {
    id: String(shop.id),
    name: shop.name ?? 'Khong ro ten',
    address: shop.address ?? '',
    latitude: shop.latitude,
    longitude: shop.longitude,
    rating_avg: Number(shop.rating_avg ?? 0),
    status: shop.status ?? 'open',
    is_local_pick: Boolean(shop.is_local_pick),
    category: shop.category?.name_vi ?? undefined,
  };
}

export function useShops(): UseShopsResult {
  const [shops, setShops] = useState<MapShop[]>(DEMO_SHOPS);
  const [loading, setLoading] = useState<boolean>(hasSupabase);
  const [usingDemo, setUsingDemo] = useState<boolean>(!hasSupabase);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hasSupabase) {
      setShops(DEMO_SHOPS);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Imported lazily so the demo path never pulls in the Supabase client.
      const { getShops } = await import('@repo/api-client');
      const { data, error: apiError } = await getShops({ per_page: 100 });

      if (apiError) throw apiError;

      const mapped = (data?.data ?? [])
        .map(toMapShop)
        .filter((s): s is MapShop => s !== null);

      if (mapped.length > 0) {
        setShops(mapped);
        setUsingDemo(false);
      } else {
        // Reachable but empty (unseeded DB) — keep the demo pins visible.
        setShops(DEMO_SHOPS);
        setUsingDemo(true);
      }
    } catch (err) {
      setShops(DEMO_SHOPS);
      setUsingDemo(true);
      setError(err instanceof Error ? err.message : 'Khong tai duoc danh sach quan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { shops, loading, usingDemo, error, reload: load };
}
