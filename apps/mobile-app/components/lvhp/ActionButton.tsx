import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ActionButtonProps {
  icon: any;
  onPress: () => void;
  color?: string;
}

export function ActionButton({ icon, onPress, color = '#FF6B35' }: ActionButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconSymbol name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});
