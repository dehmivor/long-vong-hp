import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, onFilterPress }: SearchBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <IconSymbol name="magnifyingglass" size={20} color={theme.icon} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Tìm quán ngon, món đặc sản..."}
        placeholderTextColor={theme.icon}
      />
      {onFilterPress && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <IconSymbol name="slider.horizontal.3" size={20} color={theme.tint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterBtn: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(156, 163, 175, 0.2)',
  },
});
