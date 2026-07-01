import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 24, color = '#FF6B35' }: SpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <IconSymbol name="arrow.triangle.2.circlepath" size={size} color={color} />
    </Animated.View>
  );
}
