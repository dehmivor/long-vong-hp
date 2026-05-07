import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: any;
}

export function EmptyState({ title, description, icon = "tray" }: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
        <IconSymbol name={icon} size={40} color={theme.icon} />
      </View>
      <Typography type="h3" align="center" style={styles.title}>{title}</Typography>
      {description && (
        <Typography type="caption" align="center" style={styles.desc}>{description}</Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  desc: {
    lineHeight: 20,
  },
});
