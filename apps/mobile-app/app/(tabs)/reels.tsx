import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const reels = [
  { title: 'Banh da cua nong', shop: 'Ba Cu', tag: 'Dac san HP' },
  { title: 'Nem cua be gion rum', shop: 'Co Lan', tag: 'Local pick' },
  { title: 'Cafe pho cu', shop: 'Hoang Dieu Vintage', tag: 'Chill route' },
];

export default function ReelsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Food Reels</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Short food videos for quick discovery. Video playback will be wired in after Supabase media storage.
      </Text>

      <View style={styles.reelStack}>
        {reels.map((reel, index) => (
          <View key={reel.title} style={[styles.reelCard, { backgroundColor: theme.surface, top: index * 16 }]}>
            <View style={styles.reelVisual}>
              <Text style={styles.reelEmoji}>{index === 0 ? '🍜' : index === 1 ? '🦀' : '☕'}</Text>
            </View>
            <Text style={[styles.reelTitle, { color: theme.text }]}>{reel.title}</Text>
            <Text style={[styles.reelMeta, { color: theme.icon }]}>
              {reel.shop} - {reel.tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  reelStack: {
    width: '100%',
    height: 460,
    alignItems: 'center',
  },
  reelCard: {
    position: 'absolute',
    width: '82%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  reelVisual: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reelEmoji: {
    fontSize: 64,
  },
  reelTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  reelMeta: {
    marginTop: 4,
    fontSize: 13,
  },
});
