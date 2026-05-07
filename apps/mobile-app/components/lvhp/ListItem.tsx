import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

export function ListItem({ 
  title, 
  subtitle, 
  icon, 
  rightElement, 
  onPress, 
  showArrow = true 
}: ListItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Typography type="bodySemi">{title}</Typography>
        {subtitle && <Typography type="caption" style={{ marginTop: 2 }}>{subtitle}</Typography>}
      </View>
      <View style={styles.right}>
        {rightElement}
        {showArrow && onPress && (
          <IconSymbol name="chevron.right" size={16} color={theme.icon} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
