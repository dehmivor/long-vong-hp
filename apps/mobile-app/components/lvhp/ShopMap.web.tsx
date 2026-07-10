import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { MapShop } from '@/constants/demo-shops';
import { useColorScheme } from '@/hooks/use-color-scheme';

// react-native-maps has no web implementation. On web we render a simple
// tappable list so the screen still works during `expo start --web`.
export interface ShopMapProps {
  shops: MapShop[];
  selectedId: string | null;
  onSelectShop: (id: string) => void;
  focus: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;
}

export function ShopMap({ shops, selectedId, onSelectShop }: ShopMapProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.hint, { color: theme.icon }]}>
        Ban do tuong tac chi kha dung tren iOS/Android. Danh sach quan:
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {shops.map((shop) => {
          const active = shop.id === selectedId;
          return (
            <TouchableOpacity
              key={shop.id}
              onPress={() => onSelectShop(shop.id)}
              style={[
                styles.row,
                { backgroundColor: theme.surface, borderColor: active ? '#FF6B35' : 'transparent' },
              ]}
            >
              <Text style={[styles.name, { color: theme.text }]}>
                {shop.is_local_pick ? '⭐ ' : ''}
                {shop.name}
              </Text>
              <Text style={[styles.addr, { color: theme.icon }]}>{shop.address}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 20 },
  hint: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  list: { gap: 12, paddingBottom: 160 },
  row: { padding: 16, borderRadius: 16, borderWidth: 2 },
  name: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  addr: { fontSize: 13 },
});
