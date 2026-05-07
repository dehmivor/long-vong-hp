import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  label, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  disabled,
  style 
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { 
          bg: '#FF6B35', 
          text: '#FFFFFF' 
        };
      case 'secondary':
        return { 
          bg: theme.surface, 
          text: theme.text 
        };
      case 'outline':
        return { 
          bg: 'transparent', 
          text: theme.text,
          border: theme.border
        };
      case 'ghost':
        return { 
          bg: 'transparent', 
          text: theme.tint 
        };
      default:
        return { bg: theme.surface, text: theme.text };
    }
  };

  const v = getVariantStyles();

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container, 
        styles[size],
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : {},
        disabled && { opacity: 0.5 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${size}`], { color: v.text }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sm: { paddingHorizontal: 16, paddingVertical: 8 },
  md: { paddingHorizontal: 24, paddingVertical: 14 },
  lg: { paddingHorizontal: 32, paddingVertical: 18 },
  text: {
    fontWeight: '700',
  },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 17 },
});
