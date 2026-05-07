import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from './Typography';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

export function Alert({ type = 'info', title, description }: AlertProps) {
  const getStyles = () => {
    switch (type) {
      case 'success': return { bg: '#ECFDF5', border: '#D1FAE5', color: '#065F46', icon: 'checkmark.circle.fill' };
      case 'error': return { bg: '#FEF2F2', border: '#FEE2E2', color: '#991B1B', icon: 'xmark.circle.fill' };
      case 'warning': return { bg: '#FFFBEB', border: '#FEF3C7', color: '#92400E', icon: 'exclamationmark.triangle.fill' };
      default: return { bg: '#EFF6FF', border: '#DBEAFE', color: '#1E40AF', icon: 'info.circle.fill' };
    }
  };

  const s = getStyles();

  return (
    <View style={[styles.container, { backgroundColor: s.bg, borderColor: s.border }]}>
      <IconSymbol name={s.icon as any} size={20} color={s.color} />
      <View style={styles.content}>
        <Typography type="bodySemi" color={s.color} style={{ fontSize: 14 }}>{title}</Typography>
        {description && (
          <Typography type="caption" color={s.color} style={{ opacity: 0.8, marginTop: 2 }}>
            {description}
          </Typography>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
});
