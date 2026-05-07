import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'default';
  style?: ViewStyle;
}

export function Badge({ label, type = 'default', style }: BadgeProps) {
  const getStyles = () => {
    switch (type) {
      case 'primary':
        return { bg: 'rgba(255, 107, 53, 0.15)', text: '#FF6B35' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF' };
    }
  };

  const colors = getStyles();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
