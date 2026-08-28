import { useTranslation } from '@repo/i18n';
import type { Reel } from '@repo/types';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewToken,
} from 'react-native';

import { ReelItem } from '@/components/lvhp/ReelItem';
import { isSupabaseReady } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReels } from '@/hooks/use-reels';
import { useLanguage } from '@/providers/i18n-provider';

export default function ReelsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();
  const { language } = useLanguage();
  // The tab bar eats part of the window, so page height must come from this
  // view's own layout — using the raw window height misaligns every snap.
  const [height, setHeight] = useState(0);

  const { reels, loading, usingDemo } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  // Track which reels already counted a view so scrolling back does not re-count.
  const counted = useRef(new Set<string>());

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (!first || typeof first.index !== 'number') return;

      setActiveIndex(first.index);

      const reel = first.item as Reel;
      if (isSupabaseReady && reel && !counted.current.has(reel.id)) {
        counted.current.add(reel.id);
        void import('@repo/api-client/reels')
          .then(({ incrementReelView }) => incrementReelView(reel.id))
          .catch(() => {
            // A dropped view count is not worth interrupting playback for.
          });
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  if (loading && reels.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={[styles.centeredText, { color: theme.icon }]}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>🎬</Text>
        <Text style={[styles.centeredTitle, { color: theme.text }]}>{t('reels.title')}</Text>
        <Text style={[styles.centeredText, { color: theme.icon }]}>{t('reels.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {height > 0 && (
        <FlatList
          data={reels}
          keyExtractor={(reel) => reel.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          // Keep the window tight so only a couple of video players exist at once.
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          renderItem={({ item, index }) => (
            <ReelItem
              reel={item}
              active={index === activeIndex}
              muted={muted}
              height={height}
              language={language}
              onToggleMute={() => setMuted((value) => !value)}
              onOpenShop={(shopId) => router.push(`/shop/${shopId}`)}
            />
          )}
        />
      )}

      <View style={styles.headerOverlay} pointerEvents="none">
        <Text style={styles.headerTitle}>{t('reels.title')}</Text>
        {usingDemo && <Text style={styles.demoPill}>{t('common.demoData')}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emoji: { fontSize: 56 },
  centeredTitle: { fontSize: 22, fontWeight: '900' },
  centeredText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  headerOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },
  demoPill: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
});
