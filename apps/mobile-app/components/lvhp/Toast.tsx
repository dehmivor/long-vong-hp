import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, type = 'info', visible, onHide }: ToastProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const translateY = useRef(new Animated.Value(-100)).current;

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onHide());
  }, [onHide, translateY]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 60,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [hide, translateY, visible]);

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: '#10B981', icon: 'checkmark.circle.fill' };
      case 'error': return { bg: '#EF4444', icon: 'exclamationmark.circle.fill' };
      default: return { bg: theme.surface, icon: 'info.circle.fill' };
    }
  };

  const { bg, icon } = getColors();

  if (!visible) return null;

  return (
    <Animated.View style={[
      styles.container, 
      { transform: [{ translateY }], backgroundColor: bg }
    ]}>
      <IconSymbol name={icon as any} size={20} color={type === 'info' ? theme.text : '#FFFFFF'} />
      <Text style={[styles.text, { color: type === 'info' ? theme.text : '#FFFFFF' }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 9999,
  },
  text: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
