import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Badge } from './Badge';

interface ShopCardProps {
  name: string;
  address: string;
  rating: number;
  image?: string;
  status: 'open' | 'closed' | 'sold_out';
  isLocalPick?: boolean;
  category: string;
  onPress: () => void;
}

export function ShopCard({ 
  name, 
  address, 
  rating, 
  image, 
  status, 
  isLocalPick, 
  category,
  onPress 
}: ShopCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.background }]}>
            <Text style={{ fontSize: 32 }}>🍜</Text>
          </View>
        )}
        {isLocalPick && (
          <View style={styles.localPickBadge}>
            <Text style={styles.localPickText}>Local Pick ⭐</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.rating}>⭐ {rating}</Text>
        </View>
        
        <Text style={[styles.address, { color: theme.icon }]} numberOfLines={1}>
          📍 {address}
        </Text>

        <View style={styles.footer}>
          <Badge 
            label={status === 'open' ? 'Đang mở' : status === 'sold_out' ? 'Hết món' : 'Đã đóng'} 
            type={status === 'open' ? 'success' : 'default'}
          />
          <Text style={[styles.category, { color: theme.icon }]}>• {category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localPickBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  localPickText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  address: {
    fontSize: 12,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
});
