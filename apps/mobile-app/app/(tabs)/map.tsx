import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';

import { ShopMap } from '@/components/lvhp/ShopMap';
import { Colors } from '@/constants/theme';
import type { MapShop } from '@/constants/demo-shops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShops } from '@/hooks/use-shops';

const STATUS_LABEL: Record<string, string> = {
  open: 'Dang mo',
  sold_out: 'Het mon',
  closed: 'Da dong',
  temporarily_closed: 'Tam nghi',
};

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { shops, loading, usingDemo } = useShops();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);

  const selected: MapShop | null = useMemo(() => {
    if (shops.length === 0) return null;
    return shops.find((s) => s.id === selectedId) ?? shops[0];
  }, [shops, selectedId]);

  const handleSelectShop = (id: string) => {
    const shop = shops.find((s) => s.id === id);
    setSelectedId(id);
    if (shop) setFocus({ latitude: shop.latitude, longitude: shop.longitude });
  };

  const handleLocate = async () => {
    if (Platform.OS === 'web') return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserLocation(coords);
      setFocus(coords);
    } catch {
      // Silently ignore — the map stays where it was.
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ShopMap
        shops={shops}
        selectedId={selected?.id ?? null}
        onSelectShop={handleSelectShop}
        focus={focus}
        userLocation={userLocation}
      />

      {loading && (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>Dang tai quan...</Text>
        </View>
      )}

      {usingDemo && !loading && (
        <View style={styles.demoPill}>
          <Text style={styles.demoText}>Du lieu demo</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.locateBtn, { backgroundColor: theme.surface }]}
        onPress={handleLocate}
        activeOpacity={0.85}
      >
        {locating ? (
          <ActivityIndicator size="small" color="#FF6B35" />
        ) : (
          <Text style={styles.locateIcon}>📍</Text>
        )}
      </TouchableOpacity>

      {selected && (
        <View style={[styles.floatingCard, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
              {selected.name}
            </Text>
            <Text style={styles.rating}>⭐ {selected.rating_avg.toFixed(1)}</Text>
          </View>
          <Text style={[styles.cardAddr, { color: theme.icon }]} numberOfLines={1}>
            📍 {selected.address}
          </Text>
          <View style={styles.badgeRow}>
            {selected.is_local_pick && (
              <View style={styles.localBadge}>
                <Text style={styles.localBadgeText}>Local Pick</Text>
              </View>
            )}
            <View
              style={[
                styles.statusBadge,
                selected.status !== 'open' && styles.statusBadgeMuted,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  selected.status !== 'open' && styles.statusBadgeTextMuted,
                ]}
              >
                {STATUS_LABEL[selected.status] ?? selected.status}
              </Text>
            </View>
            {selected.category && (
              <Text style={[styles.category, { color: theme.icon }]}>• {selected.category}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
  },
  loadingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  demoPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  demoText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
  },
  locateBtn: {
    position: 'absolute',
    right: 20,
    bottom: 170,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  locateIcon: {
    fontSize: 22,
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
    flex: 1,
    marginRight: 8,
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
    alignItems: 'center',
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
  statusBadgeMuted: {
    backgroundColor: 'rgba(156, 163, 175, 0.18)',
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextMuted: {
    color: '#9CA3AF',
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
});
