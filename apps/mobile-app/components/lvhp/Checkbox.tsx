import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.box, 
        { borderColor: checked ? '#FF6B35' : theme.icon, backgroundColor: checked ? '#FF6B35' : 'transparent' }
      ]}>
        {checked && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
});
