import { localized, type Language, type Reel } from '@repo/types';
import { useTranslation } from '@repo/i18n';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ReelItemProps {
  reel: Reel;
  /** Only the reel currently snapped into view plays; the rest stay paused. */
  active: boolean;
  muted: boolean;
  height: number;
  language: Language;
  onToggleMute: () => void;
  onOpenShop: (shopId: string) => void;
}

export function ReelItem({
  reel,
  active,
  muted,
  height,
  language,
  onToggleMute,
  onOpenShop,
}: ReelItemProps) {
  const { t } = useTranslation();

  const player = useVideoPlayer(reel.video_url, (instance) => {
    instance.loop = true;
    instance.muted = muted;
  });

  // Pausing off-screen players keeps memory and battery in check on a long
  // feed - the spec calls this out explicitly for weak 4G connections.
  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const title = localized(reel, 'title', language);
  const caption = localized(reel, 'caption', language);

  return (
    <Pressable style={[styles.page, { height }]} onPress={onToggleMute}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {caption !== '' && (
          <Text style={styles.caption} numberOfLines={3}>
            {caption}
          </Text>
        )}

        {reel.shop && (
          <Pressable
            style={styles.shopChip}
            onPress={() => reel.shop && onOpenShop(reel.shop.id)}
            hitSlop={8}
          >
            <Text style={styles.shopName} numberOfLines={1}>
              📍 {reel.shop.name}
            </Text>
            <Text style={styles.shopCta}>{t('reels.viewShop')} →</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.side} pointerEvents="none">
        <Text style={styles.sideIcon}>{muted ? '🔇' : '🔊'}</Text>
        <Text style={styles.sideCount}>{reel.like_count}</Text>
        <Text style={styles.sideIcon}>❤️</Text>
        <Text style={styles.sideCount}>{reel.view_count}</Text>
        <Text style={styles.sideIcon}>👁</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', backgroundColor: '#000' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  info: {
    position: 'absolute',
    left: 20,
    right: 84,
    bottom: 120,
    gap: 8,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  caption: { color: 'rgba(255,255,255,0.86)', fontSize: 14, lineHeight: 20 },
  shopChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: 'rgba(255,107,53,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 2,
  },
  shopName: { color: '#fff', fontWeight: '800', fontSize: 14 },
  shopCta: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  side: {
    position: 'absolute',
    right: 18,
    bottom: 150,
    alignItems: 'center',
    gap: 6,
  },
  sideIcon: { fontSize: 26 },
  sideCount: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
