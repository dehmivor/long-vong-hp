import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DividerProps {
  marginVertical?: number;
}

export function Divider({ marginVertical = 16 }: DividerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[
      styles.divider, 
      { backgroundColor: theme.border, marginVertical }
    ]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
