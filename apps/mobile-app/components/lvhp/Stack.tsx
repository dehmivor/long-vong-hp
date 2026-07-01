import React from 'react';
import { View, ViewStyle } from 'react-native';

interface StackProps {
  children: React.ReactNode;
  direction?: 'column' | 'row';
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  style?: ViewStyle;
}

export function Stack({ 
  children, 
  direction = 'column', 
  gap = 0, 
  align = 'stretch', 
  justify = 'flex-start',
  style 
}: StackProps) {
  return (
    <View style={[
      { 
        flexDirection: direction, 
        alignItems: align, 
        justifyContent: justify,
        gap: gap 
      }, 
      style
    ]}>
      {children}
    </View>
  );
}
