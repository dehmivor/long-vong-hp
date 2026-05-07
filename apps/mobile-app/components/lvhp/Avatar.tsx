import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  rounded?: boolean;
}

export function Avatar({ src, name, size = 48, rounded = true }: AvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: rounded ? size / 2 : 12, backgroundColor: theme.surface }
    ]}>
      {src ? (
        <Image 
          source={{ uri: src }} 
          style={{ width: '100%', height: '100%', borderRadius: rounded ? size / 2 : 12 }} 
        />
      ) : (
        <Text style={{ fontSize: size / 2.5, fontWeight: '700', color: theme.tint }}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
