import type { Reel } from '@repo/types';
import { useCallback, useEffect, useState } from 'react';

import { DEMO_REELS } from '@/constants/demo-reels';
import { isSupabaseReady } from '@/constants/supabase';

interface UseReelsResult {
  reels: Reel[];
  loading: boolean;
  usingDemo: boolean;
  error: string | null;
  reload: () => void;
}

export function useReels(): UseReelsResult {
  const [reels, setReels] = useState<Reel[]>(DEMO_REELS);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [usingDemo, setUsingDemo] = useState(!isSupabaseReady);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseReady) {
      setReels(DEMO_REELS);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Imported lazily so the demo path never pulls in the Supabase client.
      const { getReelsFeed } = await import('@repo/api-client/reels');
      const { data, error: apiError } = await getReelsFeed(30);

      if (apiError) throw apiError;

      if (data && data.length > 0) {
        setReels(data);
        setUsingDemo(false);
      } else {
        // Reachable but empty (unseeded DB) - keep the demo feed playable.
        setReels(DEMO_REELS);
        setUsingDemo(true);
      }
    } catch (err) {
      setReels(DEMO_REELS);
      setUsingDemo(true);
      setError(err instanceof Error ? err.message : 'Failed to load reels.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { reels, loading, usingDemo, error, reload: load };
}
