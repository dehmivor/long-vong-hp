import { useTranslation } from '@repo/i18n';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ShopMap } from '@/components/lvhp/ShopMap';
import type { MapShop } from '@/constants/demo-shops';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShops } from '@/hooks/use-shops';

type Filter = 'all' | 'local_pick' | 'open';

/** Diacritic-insensitive matching so "banh da" finds "Bánh đa". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class -- stripping combining marks is the intent
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { t } = useTranslation();

  const { shops, loading, usingDemo } = useShops();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visibleShops = useMemo(() => {
    const needle = normalize(query.trim());
    return shops.filter((shop) => {
      if (filter === 'local_pick' && !shop.is_local_pick) return false;
      if (filter === 'open' && shop.status !== 'open') return false;
      if (needle === '') return true;
      return (
        normalize(shop.name).includes(needle) ||
        normalize(shop.address).includes(needle) ||
        normalize(shop.category ?? '').includes(needle)
      );
    });
  }, [shops, query, filter]);

  const selected: MapShop | null = useMemo(() => {
    if (visibleShops.length === 0) return null;
    return visibleShops.find((s) => s.id === selectedId) ?? visibleShops[0] ?? null;
  }, [visibleShops, selectedId]);

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

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t('map.filterAll') },
    { value: 'local_pick', label: t('map.filterLocalPick') },
    { value: 'open', label: t('map.filterOpen') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ShopMap
        shops={visibleShops}
        selectedId={selected?.id ?? null}
        onSelectShop={handleSelectShop}
        focus={focus}
        userLocation={userLocation}
      />

      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text }]}
          placeholder={t('map.searchPlaceholder')}
          placeholderTextColor={theme.icon}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <View style={styles.filterRow}>
          {filters.map((item) => {
            const active = item.value === filter;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface },
                  active && styles.filterChipActive,
                ]}
                onPress={() => setFilter(item.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: theme.text },
                    active && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading && (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>{t('map.loadingShops')}</Text>
        </View>
      )}

      {usingDemo && !loading && (
        <View style={styles.demoPill}>
          <Text style={styles.demoText}>{t('common.demoData')}</Text>
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

      {selected ? (
        <TouchableOpacity
          style={[styles.floatingCard, { backgroundColor: theme.surface }]}
          onPress={() => router.push(`/shop/${selected.id}`)}
          activeOpacity={0.9}
        >
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
                <Text style={styles.localBadgeText}>{t('map.localPick')}</Text>
              </View>
            )}
            <View
              style={[styles.statusBadge, selected.status !== 'open' && styles.statusBadgeMuted]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  selected.status !== 'open' && styles.statusBadgeTextMuted,
                ]}
              >
                {t(`shopStatus.${selected.status}`)}
              </Text>
            </View>
            {selected.category && (
              <Text style={[styles.category, { color: theme.icon }]}>• {selected.category}</Text>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        !loading && (
          <View style={[styles.floatingCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardAddr, { color: theme.icon }]}>{t('map.noResults')}</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    gap: 10,
  },
  searchInput: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FF6B35',
  },
  loadingPill: {
    position: 'absolute',
    top: 150,
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
    top: 150,
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
