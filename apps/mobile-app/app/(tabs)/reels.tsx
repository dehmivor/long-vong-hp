import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ReelsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Food Reels</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Khám phá ẩm thực qua video ngắn TikTok-style
      </Text>
      <View style={styles.placeholder}>
        <Text style={{ color: theme.icon, fontSize: 40 }}>🎬</Text>
        <Text style={{ color: theme.icon, marginTop: 12 }}>Sắp ra mắt...</Text>
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
