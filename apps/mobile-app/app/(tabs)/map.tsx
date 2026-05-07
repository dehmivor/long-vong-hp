import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 
         In a real app, we would use react-native-maps here.
         For now, this is a placeholder visualizing the Figma Link 2 (Travel/Map).
      */}
      <View style={styles.mapPlaceholder}>
        <Text style={{ fontSize: 60 }}>🗺️</Text>
        <Text style={{ color: theme.icon, marginTop: 12, fontWeight: '600' }}>
          Đang tải bản đồ Hải Phòng...
        </Text>
      </View>

      <View style={[styles.floatingCard, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Bánh Đa Cua Bà Cụ</Text>
          <Text style={styles.rating}>⭐ 4.8</Text>
        </View>
        <Text style={[styles.cardAddr, { color: theme.icon }]}>12 Đinh Tiên Hoàng, Hồng Bàng</Text>
        <View style={styles.badgeRow}>
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Local Pick</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Đang mở</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  rating: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  cardAddr: {
    fontSize: 13,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  localBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  localBadgeText: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
